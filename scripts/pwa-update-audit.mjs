// Two-release browser regression: updates reuse unchanged immutable assets,
// visibly report a real install, and never replace a deep-linked article
// with the landing page. No manual cache clearing is permitted.
import { createServer } from 'node:http'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const firstWorker = await readFile(resolve(root, 'sw.js'), 'utf8')
const optionalModule = (await readdir(resolve(root, 'assets'))).find(name => /^emacs-lisp-.*\.js$/.test(name))
if (!optionalModule) throw Error('Optional syntax module fixture missing from build')
const optionalUrl = '/assets/' + optionalModule
const secondWorker = firstWorker.replace(
  /(url:"index\.html",revision:")([^"]+)/,
  (_, prefix, revision) => prefix + revision + '-incremental-regression',
)
if (secondWorker === firstWorker) throw Error('Could not locate index.html revision in built service worker')
let release = 1
const networkDuringUpdate = []
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (predicate, timeoutMs = 12000) => {
  const deadline = Date.now() + timeoutMs
  while (!predicate()) {
    if (Date.now() > deadline) throw Error('Timed out waiting for the controlled update request')
    await sleep(35)
  }
}
let releaseScriptRequested = false
let indexRequested = false
let releaseScriptReleased = false
let indexReleased = false
let allowReleaseScript
let allowChangedIndex
const releaseScriptGate = new Promise(resolve => { allowReleaseScript = resolve })
const changedIndexGate = new Promise(resolve => { allowChangedIndex = resolve })
const mime = path => path.endsWith('.js') ? 'text/javascript' :
  path.endsWith('.css') ? 'text/css' : path.endsWith('.webmanifest') ? 'application/manifest+json' :
    path.endsWith('.html') ? 'text/html' : path.endsWith('.svg') ? 'image/svg+xml' :
      path.endsWith('.png') ? 'image/png' : path.endsWith('.woff2') ? 'font/woff2' :
        'application/octet-stream'

const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const candidate = resolve(root, '.' + path)
    if (candidate !== root && !candidate.startsWith(root + sep)) {
      response.writeHead(400).end(); return
    }
    if (release === 2) networkDuringUpdate.push(path)
    if (path === '/sw.js') {
      response.setHeader('Content-Type', 'text/javascript')
      response.setHeader('Cache-Control', 'no-store')
      if (release === 2) {
        // Delay update discovery itself. The app must say "checking" rather
        // than silently showing its stale shell during this request.
        releaseScriptRequested = true
        await releaseScriptGate
      }
      response.end(release === 1 ? firstWorker : secondWorker)
      return
    }
    // The revisioned index is the sole intentionally modified asset.
    // Hold the actual changed precache response open. The "Downloading"
    // notice MUST be visible before these bytes finish arriving.
    if (release === 2 && path === '/index.html') {
      indexRequested = true
      await changedIndexGate
    }
    let file = candidate
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html') }
    catch { file = resolve(root, 'index.html') }
    response.setHeader('Content-Type', mime(file))
      response.setHeader('Cache-Control', file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable')
      response.end(await readFile(file))
      if (release === 2 && path === '/index.html') indexReleased = true
  } catch (error) {
    response.writeHead(500).end(String(error))
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}/`
const article = new URL('posts/learning-in-reverse/', origin)
let browser
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  })
  const context = await browser.newContext({ serviceWorkers: 'allow' })
  const page = await context.newPage()
  await page.addInitScript(() => {
    sessionStorage.setItem('__journal_release_loads', String(Number(sessionStorage.getItem('__journal_release_loads') || 0) + 1))
  })
  await page.goto(article.href, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: /learning in reverse/i }).first().waitFor({ timeout: 15000 })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 45000 })
  // Fetch a real optional JS chunk through the active SW, then verify it was
  // stored outside Workbox's release-specific precache.
  await page.evaluate(async url => { await import(url) }, optionalUrl)
  const optionalCached = await page.evaluate(async url =>
    Boolean(await (await caches.open('journal-on-demand-assets-v1')).match(url)), optionalUrl)
  if (!optionalCached) throw Error('Optional module did not enter the stable runtime cache')
  const loads = await page.evaluate(() => Number(sessionStorage.getItem('__journal_release_loads')))
  await page.evaluate(() => {
    const record = () => {
      const message = document.querySelector('.pwa-update')?.textContent ?? ''
      if (message.includes('Checking for the latest version')) {
        sessionStorage.setItem('__journal_update_check_seen', '1')
      }
      if (message.includes('Downloading the latest version')) {
        sessionStorage.setItem('__journal_update_download_seen', '1')
      }
    }
    new MutationObserver(record).observe(document.body, { childList: true, subtree: true, characterData: true })
    record()
  })
  // A release must preserve the reader's paragraph as well as their URL.
  const beforeUpdateY = await page.evaluate(() => {
    window.scrollTo({ top: 960, behavior: 'instant' })
    return window.scrollY
  })
  await page.waitForTimeout(350) // reading-position persistence debounce
  if (beforeUpdateY < 500) throw Error('PWA article fixture is too short to validate reading continuity')
  release = 2
  // Foreground checks are deliberately throttled at 15 seconds.
  await sleep(16000)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await until(() => releaseScriptRequested)
  await page.waitForFunction(() =>
    document.querySelector('.pwa-update')?.textContent?.includes('Checking for the latest version'),
  null, { timeout: 10000 })
  if (releaseScriptReleased) throw Error('Update checking banner arrived after worker script response')
  releaseScriptReleased = true
  allowReleaseScript()
  await until(() => indexRequested)
  await page.waitForFunction(() =>
    document.querySelector('.pwa-update')?.textContent?.includes('Downloading the latest version'),
  null, { timeout: 10000 })
  if (indexReleased) throw Error('Downloading notice arrived only after update precache finished')
  allowChangedIndex()
  await page.waitForFunction(previous => Number(sessionStorage.getItem('__journal_release_loads')) > previous,
    loads, { timeout: 45000 })
  await page.getByRole('heading', { name: /learning in reverse/i }).first().waitFor({ timeout: 15000 })
  if (new URL(page.url()).pathname !== article.pathname) throw Error('Article deep link was lost during update')
  await page.waitForFunction(y => Math.abs(window.scrollY - y) < 70, beforeUpdateY, { timeout: 10000 })
  await page.evaluate(async url => { await import(url) }, optionalUrl)
  const optionalPreserved = await page.evaluate(async url =>
    Boolean(await (await caches.open('journal-on-demand-assets-v1')).match(url)), optionalUrl)
  if (!optionalPreserved) throw Error('Optional cached module was lost across worker activation')
  const noticeSeen = await page.evaluate(() => sessionStorage.getItem('__journal_update_download_seen') === '1')
  if (!noticeSeen) throw Error('Download notice was not visible during a real slow update')
  const checkSeen = await page.evaluate(() => sessionStorage.getItem('__journal_update_check_seen') === '1')
  if (!checkSeen) throw Error('Checking notice was not visible before fetching the new worker')
  const workerCount = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)
  if (workerCount !== 1) throw Error(`Expected one service-worker registration, got ${workerCount}`)
  const assetRefetches = networkDuringUpdate.filter(path =>
    path.startsWith('/assets/') || path === '/journal-content.js')
  if (assetRefetches.length) throw Error('Unchanged application/content assets were re-downloaded: ' + assetRefetches.join(', '))
  const changedIndexFetches = networkDuringUpdate.filter(path => path === '/index.html').length
  if (!changedIndexFetches) throw Error('Changed index.html revision was not fetched')
  // A newly published article absent from the current client registry must
  // never be represented as the journal homepage.
  const missing = new URL('posts/not-yet-in-this-release/', origin)
  await page.goto(missing.href, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'This article is not available yet' }).waitFor({ timeout: 15000 })
  if (new URL(page.url()).pathname !== missing.pathname) throw Error('Unrecognized article link was redirected')
  await context.setOffline(true)
  await page.goto(article.href, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.getByRole('heading', { name: /learning in reverse/i }).first().waitFor({ timeout: 15000 })
  await context.setOffline(false)
  console.log(JSON.stringify({
    pass: true,
    updatedWithoutCacheClear: true,
    downloadNoticeVisible: true,
    checkingVisibleBeforeWorkerResponse: true,
    downloadingVisibleBeforePrecacheResponse: true,
    originalArticlePreserved: true,
    readingPositionPreserved: true,
    unrecognizedArticleDoesNotShowLanding: true,
    unchangedAssetRefetches: assetRefetches.length,
    unchangedEditorialContentRefetched: false,
    reusedOptionalModule: optionalModule,
    offlineArticlePreserved: true,
    changedIndexFetches,
    loadsBefore: loads,
    workers: workerCount,
  }))
} finally {
  allowReleaseScript()
  allowChangedIndex()
  if (browser) await browser.close()
  await new Promise(resolve => server.close(resolve))
}
