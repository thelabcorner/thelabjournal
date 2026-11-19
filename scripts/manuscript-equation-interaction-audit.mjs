/**
 * Reusable equation reader: actual browser interaction and print-modes.
 * Run: node scripts/manuscript-equation-interaction-audit.mjs
 */
import assert from 'node:assert/strict'
import {chromium} from 'playwright-core'
const root=process.env.JOURNAL_TEST_ORIGIN||'http://127.0.0.1:4197'
const papers=['low-temp-lyophilization-three-theses','gravimetric-decarboxylation-co2-progress','thca-limonene-cosmo-rs']
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']})
const records=[]
try {
 for(const paper of papers) for(const theme of ['light','dark']) {
  const page=await browser.newPage({viewport:{width:390,height:900},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'})
  const pageErrors=[]
  page.on('pageerror',e=>pageErrors.push(e.message))
  try {
   await page.addInitScript(t=>localStorage.setItem('thelabcorner.journal.preferences.v2',JSON.stringify({theme:t})),theme)
   await page.goto(root+'/research/'+paper+'/',{waitUntil:'domcontentloaded'})
   const blocks=page.locator('.research-body .math-block')
   await blocks.first().waitFor({timeout:30000})
   await page.evaluate(()=>document.fonts.ready)
   await page.waitForTimeout(130)
   const sample=async()=>page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('.research-body .math-block')]
    const list=nodes.map((node,index)=>{
     const vp=node.querySelector('.math-block__viewport')
     const tex=node.querySelector('.math-block__typeset')
     const html=node.querySelector('.katex-html')
     const r=document.createRange();if(html)r.selectNodeContents(html)
     const overflow=vp.scrollWidth-vp.clientWidth>3
     const scrollables=[node.querySelector('.math-block__shell'),node.querySelector('.math-block__formula'),node.querySelector('.katex-display'),vp].filter(Boolean).filter(n=>{const st=getComputedStyle(n);return n.scrollWidth>n.clientWidth+3&&['auto','scroll'].includes(st.overflowX)})
     return {index,visible:vp.clientWidth,extent:html?r.getBoundingClientRect().width:0,
      overflow,hint:!!node.querySelector('.math-block__overflow-hint'),
      scrollers:scrollables.length,scale:parseFloat(tex.style.getPropertyValue('--equation-scale'))||1,
      hidden:getComputedStyle(vp).scrollbarWidth==='none',
      number:node.querySelector('.math-block__number')?.textContent||null}
    })
    return {list,pageOverflow:document.documentElement.scrollWidth-innerWidth,theme:document.documentElement.dataset.theme}
   })
   const at390=await sample()
   assert.equal(at390.theme,theme)
   assert(at390.pageOverflow<=1, paper+' page overflow at 390')
   for(const eq of at390.list){
    assert(eq.extent>0,'typeset disappeared')
    assert(eq.scrollers<=1,'nested equation scrolling')
    assert(eq.hidden,'native scrollbar not suppressed')
    assert(eq.scale<=1.001&&eq.scale>=.879,'illegible or enlarged equation')
    assert.equal(eq.hint,eq.overflow,'overflow hint and actual overflow disagree')
    if(!eq.overflow)assert(eq.extent<=eq.visible+4,'hidden clipping '+eq.index)
   }
   const overflowIndex=at390.list.find(x=>x.overflow)?.index
   if(overflowIndex!==undefined){
    const block=blocks.nth(overflowIndex),vp=block.locator('.math-block__viewport')
    await vp.scrollIntoViewIfNeeded()
    await vp.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(i=>document.querySelectorAll('.research-body .math-block__viewport')[i].scrollLeft>0,overflowIndex,{timeout:3000})
    assert((await vp.evaluate(el=>el.scrollLeft))>0,'keyboard could not pan equation')
    await block.locator('.math-block__expand').click()
    const dialog=page.locator('dialog.math-equation-dialog')
    await dialog.waitFor({state:'visible'})
    assert(await dialog.evaluate(el=>el.open),'native modal not open')
    assert(await dialog.locator('.katex-html').count()>0,'expanded view missing math')
    await page.keyboard.press('Escape')
    await dialog.waitFor({state:'hidden'})
   }
   const before=at390.list.filter(x=>x.overflow).length
   await page.setViewportSize({width:768,height:900})
   await page.waitForTimeout(200)
   const wider=await sample()
   assert.equal(wider.list.filter(x=>x.overflow).length,0,'equations did not fit after resize')
   await page.setViewportSize({width:320,height:900})
   await page.waitForTimeout(200)
   const narrow=await sample()
   assert(narrow.pageOverflow<=1,'document overflows on 320px')
   for(const eq of narrow.list){
    assert(eq.scrollers<=1&&eq.hidden,'nested or native scrollbar on 320px')
    assert.equal(eq.hint,eq.overflow,'stale overflow state after resize')
   }
   await page.emulateMedia({media:'print'})
   const print=await page.evaluate(()=>{
    const hints=[...document.querySelectorAll('.math-block__overflow-hint')]
    return {allHidden:hints.every(el=>getComputedStyle(el).display==='none'),viewports:[...document.querySelectorAll('.math-block__viewport')].every(el=>getComputedStyle(el).overflowX==='visible')}
   })
   assert(print.allHidden&&print.viewports,'interactive equation controls leaked into print')
   assert.deepEqual(pageErrors,[],'browser errors')
   records.push({paper,theme,equations:at390.list.length,overflow390:before,overflow320:narrow.list.filter(x=>x.overflow).length,interaction:overflowIndex===undefined?'not-needed':'passed',print:'passed',errors:pageErrors.length})
   console.log(JSON.stringify(records.at(-1)))
  }finally{await page.close()}
 }
}finally{await browser.close()}
assert.equal(records.length,6)
console.log('EQUATION_INTERACTION_AUDIT_PASS '+JSON.stringify({cases:records.length,distinctEquations:records.filter(r=>r.theme==='light').reduce((n,r)=>n+r.equations,0),recordedChecks:records.reduce((n,r)=>n+r.equations,0)}))
