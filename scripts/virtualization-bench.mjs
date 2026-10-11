import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--js-flags=--expose-gc']})
const results=[]
for(const width of [375,1440]) {
  for(let round=0;round<4;round++) {
    for(const mode of (round%2?['baseline','virtual']:['virtual','baseline'])) {
      const page=await browser.newPage({viewport:{width,height:width<768?812:900},isMobile:width<768,hasTouch:width<768})
      const session=await page.context().newCDPSession(page)
      await session.send('Performance.enable')
      const url='http://127.0.0.1:11264/virtual-fixture.html'+(mode==='baseline'?'?baseline=1':'')
      await page.goto(url,{waitUntil:'domcontentloaded'})
      await page.waitForFunction(()=>typeof window.__fixtureCommitted==='number',{timeout:20000})
      await page.waitForTimeout(250)
      await page.evaluate(()=>{if(typeof gc==='function')gc()})
      const info=await page.evaluate(()=>{
        const base=document.querySelector('[data-virtualized="archive"],[data-baseline="archive"]')
        return {
          commitMs:window.__fixtureCommitted,
          mounted:base?.querySelectorAll('.journal-row').length ?? 0,
          totalNodes:document.querySelectorAll('*').length,
          archiveHeight:base?.getBoundingClientRect().height ?? 0,
          scrollHeight:document.documentElement.scrollHeight,
        }
      })
      const cd=await session.send('Memory.getDOMCounters')
      const m=await session.send('Performance.getMetrics')
      const memory=m.metrics.find(v=>v.name==='JSHeapUsedSize')?.value ?? 0
      results.push({width,mode,round,...info,domCounters:cd.nodes,jsHeapMB:Number((memory/1048576).toFixed(2))})
      console.log(JSON.stringify(results.at(-1)))
      await session.detach()
      await page.close()
    }
  }
}
const median=values=>{const a=[...values].sort((a,b)=>a-b);return (a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2}
for(const width of [375,1440]) {
  const a=results.filter(x=>x.width===width)
  const v=a.filter(x=>x.mode==='virtual')
  const b=a.filter(x=>x.mode==='baseline')
  console.log(JSON.stringify({width,summary:{
    virtualRows:median(v.map(x=>x.mounted)),baselineRows:median(b.map(x=>x.mounted)),
    nodeReductionPercent:Number((100*(1-median(v.map(x=>x.totalNodes))/median(b.map(x=>x.totalNodes)))).toFixed(2)),
    virtualCommitMs:median(v.map(x=>x.commitMs)),baselineCommitMs:median(b.map(x=>x.commitMs)),
    virtualHeapMB:median(v.map(x=>x.jsHeapMB)),baselineHeapMB:median(b.map(x=>x.jsHeapMB)),
  }}))
}
await browser.close()
