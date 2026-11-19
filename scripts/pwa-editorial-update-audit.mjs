// Content-only release regression: a new essay revision must reach an installed
// reader without invalidating the app code, losing a deep link, or clearing caches.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const worker = await readFile(resolve(root, 'sw.js'), 'utf8')
const content = await readFile(resolve(root, 'journal-content.js'), 'utf8')
const needle = 'I learn by building.'
const replacement = 'I learn by building through an editorial release canary.'
if (!content.includes(needle)) throw Error('Editorial content canary is absent')
const revisedContent = content.replace(needle, replacement)
const revisedWorker = worker.replace(
  /(url:"journal-content\.js",revision:")([^"]+)/,
  (_, prefix, revision) => prefix + revision + '-editorial-update',
)
if (revisedWorker === worker) throw Error('Could not revise Workbox content revision')

let release = 1
const networkDuringUpdate = []
const mime = path => path.endsWith('.js') ? 'text/javascript' :
  path.endsWith('.css') ? 'text/css' : path.endsWith('.html') ? 'text/html' :
  path.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream'

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
      response.end(release === 1 ? worker : revisedWorker)
      return
    }
    if (path === '/journal-content.js') {
      response.setHeader('Content-Type', 'text/javascript')
      response.setHeader('Cache-Control', 'no-cache, must-revalidate')
      response.end(release === 1 ? content : revisedContent)
      return
    }
    let file = candidate
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html') }
    catch { file = resolve(root, 'index.html') }
    response.setHeader('Content-Type', mime(file))
    response.setHeader('Cache-Control', file.endsWith('index.html') ?
      'no-cache' : 'public, max-age=31536000, immutable')
    response.end(await readFile(file))
  } catch (error) { response.writeHead(500).end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}/`
const path = new URL('posts/learning-in-reverse/', origin)
let browser
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--no-sandbox'],
  })
  const context = await browser.newContext({serviceWorkers:'allow'})
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => sessionStorage.setItem('__editorial_loads',
    String(Number(sessionStorage.getItem('__editorial_loads') || 0) + 1)))
  await page.goto(path.href, {waitUntil:'domcontentloaded'})
  await page.getByRole('heading', {name: /Learning in reverse/i}).first().waitFor()
  await page.getByText(needle, {exact:false}).first().waitFor()
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, {timeout:45000})
  const initialLoads = await page.evaluate(() => Number(sessionStorage.getItem('__editorial_loads')))
  release = 2
  await page.evaluate(async () => (await navigator.serviceWorker.ready).update())
  await page.waitForFunction(previous => Number(sessionStorage.getItem('__editorial_loads')) > previous,
    initialLoads, {timeout:45000})
  await page.getByText(replacement, {exact:false}).first().waitFor({timeout:15000})
  if (new URL(page.url()).pathname !== path.pathname) throw Error('Editorial update lost article URL')
  const contentRequests = networkDuringUpdate.filter(url => url === '/journal-content.js')
  if (contentRequests.length !== 1) throw Error('Expected one revised content fetch, got ' + contentRequests.length)
  const appRefetches = networkDuringUpdate.filter(url => url.startsWith('/assets/') || url === '/index.html')
  if (appRefetches.length) throw Error('Reused app assets were downloaded: ' + appRefetches.join(', '))
  await context.setOffline(true)
  await page.goto(path.href, {waitUntil:'domcontentloaded',timeout:15000})
  await page.getByText(replacement, {exact:false}).first().waitFor({timeout:15000})
  if (errors.length) throw Error('Browser errors: ' + errors.join(' | '))
  console.log(JSON.stringify({
    pass:true, editorialRevisionDownloaded:contentRequests.length,
    unchangedAppAssetRefetches:0, unchangedIndexRefetches:0,
    updatedArticleVisible:true, deepLinkPreserved:true,
    updatedArticleOffline:true, browserErrors:0,
  }))
  await context.close()
} finally {
  if(browser) await browser.close()
  await new Promise(resolve => server.close(resolve))
}
