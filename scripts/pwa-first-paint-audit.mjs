// Assert destination-aware first paint before any application JS is served.
// The browser must not flash the landing page while a deep link is loading.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.svg':'image/svg+xml', '.woff2':'font/woff2',
  '.png':'image/png', '.webp':'image/webp' }
const server = createServer(async (request,response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1')
    const file = resolve(root, '.' + decodeURIComponent(url.pathname))
    if (file !== root && !file.startsWith(root + sep)) return response.writeHead(400).end()
    let output = file
    try { if (!(await stat(output)).isFile()) output = resolve(root, 'index.html') }
    catch { output = resolve(root, 'index.html') }
    response.setHeader('Content-Type', mime[extname(output)] || 'application/octet-stream')
    response.end(await readFile(output))
  } catch(error) { response.writeHead(500).end(String(error)) }
})
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
let browser
const origin = 'http://127.0.0.1:' + server.address().port
const cases = [
  {path:'/posts/learning-in-reverse/',title:'Opening article…',ready:'.article-body',size:{width:390,height:844}},
  {path:'/research/gravimetric-decarboxylation-co2-progress/',title:'Opening manuscript…',ready:'.research-body',size:{width:375,height:667}},
  {path:'/quotes/',title:'Opening quotations…',ready:'.quotes-page',size:{width:320,height:568}},
  {path:'/posts/not-yet-in-this-release/',title:'Opening article…',ready:'.pwa-route-pending',size:{width:1440,height:900}},
]
try {
  browser = await chromium.launch({executablePath:process.env.CHROME_PATH ||
    'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
  for(const test of cases) {
    const page = await browser.newPage({viewport:test.size,serviceWorkers:'block'})
    let releaseScripts
    const waitForScripts = new Promise(resolve => { releaseScripts = resolve })
    let held = 0
    await page.route('**/assets/*.js', async route => {
      held++
      await waitForScripts
      await route.continue()
    })
    try {
      await page.goto(origin + test.path,{waitUntil:'commit',timeout:15000})
      const boot = page.locator('#journal-boot')
      await boot.waitFor({state:'attached',timeout:6000})
      assert.equal((await boot.locator('h1').textContent())?.trim(),test.title)
      assert.equal(await page.locator('.journal-list, .feature-link').count(),0,
        'Archive must not render while a requested page waits for its module')
      // Give the browser enough time to finish parsing and attempt the
      // interrupted module import. Boot stays informative throughout.
      await page.waitForTimeout(250)
      assert(held > 0,'Fixture did not delay application modules')
      assert.equal(await boot.count(),1,'Destination-aware loading should persist through network stall')
      releaseScripts()
      await page.locator(test.ready).first().waitFor({timeout:20000})
      assert.equal(await boot.count(),0,'Bootstrap must disappear when React mounts')
      assert.equal(new URL(page.url()).pathname,test.path,'Deep link must survive boot')
      console.log('EARLY_DESTINATION_PASS',test.path,test.size.width)
    } finally {
      releaseScripts()
      await page.close()
    }
  }
} finally {
  await browser?.close()
  await new Promise(resolve=>server.close(resolve))
}
