// Production mirror compatibility: GitHub Pages cannot enforce our
// Cloudflare-specific cache headers, so its editorial corpus stays hashed.
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {build} from 'vite'

const original = process.env.GITHUB_PAGES
try {
  process.env.GITHUB_PAGES = 'true'
  await build({logLevel:'error'})
  const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json',import.meta.url),'utf8'))
  const content = Object.values(manifest).find(chunk =>
    /(?:^|\/)journal-content-[\w-]+\.js$/.test(chunk.file))
  assert(content, 'Legacy mirror must have content-addressed editorial data')
  const index = await readFile(new URL('../dist/index.html',import.meta.url),'utf8')
  assert(index.includes('/thelabjournal/assets/'), 'Mirror asset base is incorrect')
  assert(index.includes('/thelabjournal/'), 'Mirror lacks path prefix')
  await import('./pwa-cache-budget-audit.mjs?pages')
  console.log(JSON.stringify({pass:true, base:'/thelabjournal/', content:content.file,
    hashedContent:true, cloudflareCacheAssumptionsAvoided:true}))
} finally {
  if (original === undefined) delete process.env.GITHUB_PAGES
  else process.env.GITHUB_PAGES=original
  await build({logLevel:'error'})
}
