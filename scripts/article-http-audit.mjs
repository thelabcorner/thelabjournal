/** HTTP integration test for GitHub Pages' project-base routing.
 * Ensures actual static HTML and OG PNGs are served, not SPA fallback HTML.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { entries } from '../src/data.ts'

const PORT = 13987
const BASE = 'http://127.0.0.1:' + PORT + '/thelabjournal/'
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url), env: { ...process.env, GITHUB_PAGES: 'true' },
  stdio: 'pipe',
})
let logs = ''
server.stdout.on('data', buf => { logs += buf.toString() })
server.stderr.on('data', buf => { logs += buf.toString() })
const request = path => fetch(BASE + path, { signal: AbortSignal.timeout(3000) })

try {
  let ready = false
  for (let i = 0; i < 45; i++) {
    if (server.exitCode !== null) throw Error('Preview server stopped: ' + logs)
    try {
      const response = await request('')
      if (response.ok) { ready = true; break }
    } catch {}
    await delay(250)
  }
  assert.ok(ready, 'Vite preview server failed to start: ' + logs)
  const manifest = await (await request('og/articles/manifest.json')).json()
  for (const entry of entries) {
    const page = await request('posts/' + entry.slug + '/')
    assert.equal(page.status, 200, entry.slug + ': article URL serves HTTP 200')
    assert.match(page.headers.get('content-type') || '', /text\/html/, entry.slug + ': HTML content-type')
    const source = await page.text()
    const url = 'https://thelabcorner.github.io/thelabjournal/posts/' + entry.slug + '/'
    const img = 'https://thelabcorner.github.io/thelabjournal/og/articles/' + entry.slug + '.png?v=' + manifest[entry.slug]
    assert.ok(source.includes('<link rel="canonical" href="' + url + '"'), entry.slug + ': canonical metadata')
    assert.ok(source.includes('property="og:image" content="' + img + '"'), entry.slug + ': article-specific OG metadata')
    assert.ok(source.includes('name="twitter:image" content="' + img + '"'), entry.slug + ': twitter preview')
    assert.ok(source.includes('src="/thelabjournal/assets/'), entry.slug + ': app bootstrap path')
    const image = await request('og/articles/' + entry.slug + '.png')
    assert.equal(image.status, 200, entry.slug + ': PNG URL serves HTTP 200')
    assert.match(image.headers.get('content-type') || '', /image\/png/, entry.slug + ': PNG content-type')
    const sig = new Uint8Array(await image.arrayBuffer()).slice(0,8)
    assert.deepEqual([...sig], [137,80,78,71,13,10,26,10], entry.slug + ': PNG binary signature')
  }
  // Existing query-string bookmarks must continue loading the original app.
  const old = await request('?post=' + entries[0].slug)
  assert.equal(old.status, 200, 'legacy URL still serves application HTML')
  assert.ok((await old.text()).includes('id="root"'), 'legacy URL still includes the app root')
  console.log('HTTP social route audit passed: ' + entries.length + ' article HTML pages and PNG images served, plus legacy URL.')
} finally {
  server.kill('SIGTERM')
}
