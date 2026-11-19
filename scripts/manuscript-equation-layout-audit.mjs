/**
 * thelabjournal equation layout QA. DOM geometry, accessibility and visual
 * regression coverage of the single-scroll scientific mathematics system.
 *
 * JOURNAL_TEST_ORIGIN=http://127.0.0.1:4197 node scripts/manuscript-equation-layout-audit.mjs
 * Set EQUATION_AUDIT_MODE=baseline for a pre-repair geometry report.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const origin = process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4197'
const baseline = process.env.EQUATION_AUDIT_MODE === 'baseline'
const papers = ['low-temp-lyophilization-three-theses','gravimetric-decarboxylation-co2-progress','thca-limonene-cosmo-rs']
const widths = [320, 390, 768, 1440]
const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--no-sandbox'] })
const output = resolve(import.meta.dirname,'../artifacts/manuscript-equation-qa')
await mkdir(output,{recursive:true})
const results=[]
try {
 for(const paper of papers){
  for(const width of widths){
   const page = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1})
   const errors=[]
   page.on('pageerror',e=>errors.push(e.message))
   try {
    await page.goto(origin+'/research/'+paper+'/',{waitUntil:'domcontentloaded'})
    await page.locator('.research-body .math-block').first().waitFor({timeout:30000})
    await page.evaluate(()=>document.fonts.ready)
    const items = await page.evaluate(()=>{
     const eqs=[...document.querySelectorAll('.research-body .math-block')]
     return eqs.map((el,i)=>{
      const shell=el.querySelector('.math-block__shell')
      const formula=el.querySelector('.math-block__formula')
      const display=el.querySelector('.katex-display')
      const wrap=el.querySelector('.katex-display-wrap')
      const viewport=el.querySelector('.math-block__viewport')
       const glyph=el.querySelector('.katex-display .katex-html')
       const glyphRange=document.createRange()
       if(glyph)glyphRange.selectNodeContents(glyph)
      const area=el.querySelector('.math-block__overflow-track')
      const info=el.querySelector('.math-block__overflow-hint')
      const number=el.querySelector('.math-block__number') || (formula?.lastElementChild?.tagName==='SPAN'?formula.lastElementChild:null)
      const scrollables=[shell,formula,display,wrap,viewport].filter(Boolean).map(node=>{
       const css=getComputedStyle(node)
       return {part:node.className?.toString().slice(0,70),width:node.clientWidth,scroll:node.scrollWidth,overflowX:css.overflowX,scrollbar:css.scrollbarWidth || 'auto',size:node.getBoundingClientRect().height}
      })
      const bad=scrollables.filter(s=>s.scroll>s.width+3 && ['auto','scroll'].includes(s.overflowX))
      return {
       index:i,
       label:(el.getAttribute('aria-label')||'').slice(0,100),
       number:number?.textContent?.slice(0,25)??'',
       glyphWidth:Math.round(glyph?glyphRange.getBoundingClientRect().width:0),
       displayWidth:display?.clientWidth??0,
       viewportWidth:viewport?.clientWidth??0,
       nestedScrollers:bad.length,
       hiddenBar: viewport?getComputedStyle(viewport).scrollbarWidth==='none':false,
       overflowMode:el.getAttribute('data-equation-overflow'),
       fitScale:parseFloat(getComputedStyle(wrap||el).getPropertyValue('--equation-scale'))||1,
       controls:!!info,track:!!area,
       scrollables
      }
     })
    })
    const nested=items.filter(i=>i.nestedScrollers>1)
    const overflowing=items.filter(i=>i.nestedScrollers>0)
    const missing=items.filter(i=>!i.glyphWidth)
    const report={paper,width,equations:items.length,overflowing:overflowing.length,nested:nested.length,missing:missing.length,errors,top:items.sort((a,b)=>b.glyphWidth-a.glyphWidth).slice(0,8)}
    if(!baseline){
      assert.equal(errors.length,0,paper+' page errors')
      assert.equal(missing.length,0,paper+' missing KaTeX glyphs')
      assert.equal(nested.length,0,paper+' nested scrollbars')
      for(const e of items){
       assert(e.nestedScrollers<=1,'Nested overflow in equation '+e.index)
       assert(e.nestedScrollers===0 || e.hiddenBar,'Native scrollbar visible in equation '+e.index)
       assert(e.nestedScrollers===0 || e.controls,'No overflow hint for equation '+e.index)
      }
    }
    // Screenshot the actual widest equation, not a fabricated fixture.
    const widest=report.top[0]
    const target=page.locator('.research-body .math-block').nth(widest.index)
    await target.scrollIntoViewIfNeeded()
    try { await target.screenshot({path:resolve(output,paper+'-'+width+'.png'),timeout:10000}) } catch (err) { console.warn('Screenshot unavailable for '+paper+' '+width+': '+String(err).slice(0,140)) }
    results.push(report)
    console.log(JSON.stringify({...report,top:report.top.map(x=>({index:x.index,label:x.label,number:x.number,glyphWidth:x.glyphWidth,nestedScrollers:x.nestedScrollers,overflowMode:x.overflowMode,fitScale:x.fitScale,scrollables:x.scrollables}))}))
   } finally {await page.close()}
  }
 }
}finally {await browser.close()}
console.log(JSON.stringify({status:'PASS',mode:baseline?'baseline':'verified',total:results.reduce((s,r)=>s+r.equations,0),cases:results.length,overflowing:results.reduce((s,r)=>s+r.overflowing,0),nested:results.reduce((s,r)=>s+r.nested,0)}))
