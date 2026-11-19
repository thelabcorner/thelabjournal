// Structural hot-path benchmark. Compare counts rather than claiming precise
// wall-clock improvements from headless browser simulation. Run after build.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const root = resolve('dist')
const mime = { '.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json',
  '.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png' }
const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname)
    const candidate = resolve(root,'.' + pathname)
    if (candidate !== root && !candidate.startsWith(root + sep)) { res.writeHead(400).end();return }
    let file = candidate
    try { if (!(await stat(file)).isFile()) file=resolve(root,'index.html') } catch { file=resolve(root,'index.html') }
    res.setHeader('Content-Type',mime[extname(file)] || 'application/octet-stream')
    res.end(await readFile(file))
  } catch (error) { res.writeHead(500).end(String(error)) }
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
let browser
const origin = 'http://127.0.0.1:' + server.address().port
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ||
    'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true,args:['--no-sandbox'] })
  const page = await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block',reducedMotion:'reduce'})
  await page.addInitScript(() => {
    const metrics = {storageWrites:0,storedBytes:0,anchorQueries:0,sectionRects:0,scrollEvents:0}
    Object.defineProperty(window,'__readingBench',{value:metrics})
    const originalSet=Storage.prototype.setItem
    Storage.prototype.setItem=function(k,v) {
      if (k==='thelabjournal.reading-positions.v1') { metrics.storageWrites++;metrics.storedBytes+=v.length }
      return originalSet.call(this,k,v)
    }
    const originalQuery=Document.prototype.querySelectorAll
    Document.prototype.querySelectorAll=function(sel) {
      if (typeof sel==='string' && sel.includes('.prose-section[id]')) metrics.anchorQueries++
      return originalQuery.call(this,sel)
    }
    const originalRect=Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect=function() {
      if (this.id && (this.id.startsWith('section-') || this.tagName==='SECTION')) metrics.sectionRects++
      return originalRect.call(this)
    }
    window.addEventListener('scroll',()=>{metrics.scrollEvents++},{passive:true})
  })
  const results = []
  for (const [kind,path,selector] of [
    ['article','/posts/learning-in-reverse/','.article-body .prose-section'],
    ['research','/research/gravimetric-decarboxylation-co2-progress/','.research-body [id]']]) {
    await page.goto(origin + path,{waitUntil:'domcontentloaded'})
    await page.locator(selector).first().waitFor({timeout:15000})
    await page.waitForTimeout(700)
    const outcome=await page.evaluate(async () => {
      const m=window.__readingBench
      for (const key of Object.keys(m)) m[key]=0
      const max=Math.max(0, document.documentElement.scrollHeight-innerHeight)
      const started=performance.now()
      const steps=180
      for(let i=0;i<steps;i++) {
        scrollTo({top: Math.min(max, 200 + (max-400)*i/(steps-1)),behavior:'instant'})
        await new Promise(requestAnimationFrame)
      }
      await new Promise(r=>setTimeout(r,430))
      return { ...m, simulatedFrames:steps, durationMs: Math.round(performance.now()-started), documentHeight:document.documentElement.scrollHeight }
    })
    // Budgets for long, uninterrupted reading gestures. They guard against
    // accidentally restoring per-scroll DOM scans or sync storage writes.
    assert.ok(outcome.scrollEvents >= 100, `${kind}: benchmark did not exercise enough real scrolling`)
    assert.ok(outcome.storageWrites <= 2, `${kind}: unexpected writes during active scrolling (${outcome.storageWrites})`)
    assert.ok(outcome.anchorQueries <= 2, `${kind}: unexpected document anchor scans (${outcome.anchorQueries})`)
    assert.ok(outcome.sectionRects <= 18, `${kind}: excessive section geometry reads (${outcome.sectionRects})`)
    results.push({kind,...outcome})
  }
  console.log(JSON.stringify({benchmark:'reading-scroll-hot-path',pass:true,results},null,2))
  await page.close()
} finally {
  await browser?.close()
  await new Promise(resolve=>server.close(resolve))
}
