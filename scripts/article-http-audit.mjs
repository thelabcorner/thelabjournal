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
const request = (path, options = {}) => fetch(BASE + path, { signal: AbortSignal.timeout(3000), ...options })

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
    assert.ok(source.includes('name="twitter:img:src" content="' + img + '"'), entry.slug + ': Snapchat legacy Twitter image fallback')
    assert.ok(source.includes('name="twitter:image:src" content="' + img + '"'), entry.slug + ': legacy Twitter image alias')
    assert.ok(source.includes('property="og:title" content="'), entry.slug + ': Open Graph title')
    assert.ok(source.includes('property="og:description" content="'), entry.slug + ': Open Graph summary')
    assert.ok(source.includes('property="og:image:width" content="1200"'), entry.slug + ': full width media')
    assert.ok(source.includes('property="og:image:height" content="630"'), entry.slug + ': full height media')
    // Link-unfurl bots must see the *same article-specific metadata* in the
    // initial HTML response. They do not execute the React application.
    const crawlers = [
      ['Snapchat', 'Snap URL Preview Service; bot; snapchat; https://developers.snap.com/robots'],
      ['Facebook / Instagram DM', 'facebookexternalhit/1.1'],
      ['LinkedIn', 'LinkedInBot/1.0'],
      ['Discord', 'Discordbot/2.0'],
      ['Slack', 'Slackbot-LinkExpanding 1.0'],
      ['Telegram', 'TelegramBot (like TwitterBot)'],
      ['WhatsApp', 'WhatsApp/2.0'],
      ['X', 'Twitterbot'],
      ['Apple Messages', 'Applebot'],
    ]
    for (const [platform, agent] of crawlers) {
      const crawlerResponse = await request('posts/' + entry.slug + '/', {
        headers: { 'User-Agent': agent, 'Accept': 'text/html' },
      })
      assert.equal(crawlerResponse.status, 200, entry.slug + ': ' + platform + ' HTTP response')
      const crawlerHTML = await crawlerResponse.text()
      for (const expected of [
        'property="og:url" content="' + url + '"',
        'property="og:title" content="',
        'property="og:image" content="' + img + '"',
        'name="twitter:img:src" content="' + img + '"',
      ]) {
        assert.ok(crawlerHTML.includes(expected), entry.slug + ': ' + platform + ' readable server metadata ' + expected)
      }
    }
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
  console.log('HTTP social route audit passed: ' + entries.length + ' article HTML pages and PNG images, 9 social crawler identities per article, and legacy URL.')
} finally {
  server.kill('SIGTERM')
}
