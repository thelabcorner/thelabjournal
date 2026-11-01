// Two-release browser regression: existing installed clients must update and
// reload after resuming, without clearing CacheStorage or site data.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const worker = await readFile(resolve(root, 'sw.js'))
let release = 1
const mime = (path) => path.endsWith('.js') ? 'text/javascript' :
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
    if (path === '/sw.js') {
      response.setHeader('Content-Type', 'text/javascript')
      response.setHeader('Cache-Control', 'no-store')
      response.end(Buffer.concat([worker, Buffer.from(`\n// test-release-${release}\n`)]))
      return
    }
    let file = candidate
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html') }
    catch { file = resolve(root, 'index.html') }
    response.setHeader('Content-Type', mime(file))
    response.setHeader('Cache-Control', file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable')
    response.end(await readFile(file))
  } catch (error) {
    response.writeHead(500).end(String(error))
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}/`
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
  await page.goto(origin, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 45000 })
  const loads = await page.evaluate(() => Number(sessionStorage.getItem('__journal_release_loads')))
  release = 2
  // The application throttles foreground checks to 15 seconds. Changing
  // focus simulates an installed PWA being resumed, not a manual hard refresh.
  await page.waitForTimeout(16000)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.waitForFunction(previous => Number(sessionStorage.getItem('__journal_release_loads')) > previous,
    loads, { timeout: 45000 })
  const workerCount = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)
  if (workerCount !== 1) throw Error(`Expected one service-worker registration, got ${workerCount}`)
  console.log(JSON.stringify({ pass: true, updatedWithoutCacheClear: true, loadsBefore: loads, workers: workerCount }))
} finally {
  if (browser) await browser.close()
  await new Promise(resolve => server.close(resolve))
}