/**
 * Manuscript NCM typography / evidence-label regression.
 * Checks the actual rendered scientific documents, not just CSS source text.
 * JOURNAL_TEST_ORIGIN defaults to http://127.0.0.1:4205
 */
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const root=resolve(import.meta.dirname,'..')
const origin=process.env.JOURNAL_TEST_ORIGIN||'http://127.0.0.1:4205'
const slugs=[
 'gravimetric-decarboxylation-co2-progress',
 'low-temp-lyophilization-three-theses',
 'thca-limonene-cosmo-rs',
]
const srcFile=async path=>readFile(resolve(root,'src',path),'utf8')
const sources=await Promise.all([
 srcFile('manuscript-runtime/data/papers/gravimetric-decarboxylation/CalibrationWorkflowFigure.tsx'),
 srcFile('manuscript-runtime/components/sections/TitlePage.tsx'),
 srcFile('manuscript-runtime/data/papers/sublimation/figures/FluxContributorsChart.tsx'),
 srcFile('manuscript-runtime/data/papers/sublimation/figures/PressureTransferTable.tsx'),
 srcFile('manuscript-runtime/data/papers/sublimation/widgets/WindowEstimatorWidget.tsx'),
 srcFile('lyophilization-manuscript-presentation.css'),
])
for(const [i,s] of sources.entries()){
 assert(!/className="[^"]*\buppercase\b/.test(s),'Obsolete uppercase utility at audited source '+i)
}
assert(!sources[0].includes('MODE A · WHEN A LOT IS NEW'),'Old operating-mode overline survived')
assert(!sources[2].includes('FIXED MODEL COEFFICIENT'),'Old all-caps figure label survived')
assert(!sources[4].includes('AT RESISTANCE'),'Old all-caps model label survived')
assert(!/text-transform\s*:\s*uppercase/.test(sources[5]),'Manuscript CSS still forces uppercase')

const output=resolve(root,'artifacts/manuscript-typography-qa')
await mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']})
const results=[]
try{
 for(const theme of ['light','dark']){
  for(const width of [320,390,768,1440]){
   for(const slug of slugs){
    const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1,colorScheme:theme})
    const errors=[]
    page.on('pageerror',error=>errors.push(String(error)))
    try{
     await page.goto(origin+'/research/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000})
     await page.locator('.research-body #title').waitFor({state:'attached',timeout:25000})
     await page.evaluate(()=>document.fonts.ready)
     const data=await page.evaluate(()=>{
      const root=document.querySelector('.research-body')
      const rect=node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}}
      const textStyle=node=>{const s=getComputedStyle(node);return {text:s.textTransform,spacing:s.letterSpacing,font:s.fontFamily,weight:s.fontWeight,size:s.fontSize}}
      const meta=[...root.querySelectorAll('#title .manuscript-label')].map(e=>({text:e.textContent.trim(),style:textStyle(e)}))
      const overlines=[]
      for(const el of root.querySelectorAll('span,p,small,label,th,summary,h2,h3,svg text,svg tspan')){
       if(el.closest('.katex,pre,code,.math-block__code'))continue
       const t=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).filter(Boolean).join(' ').replace(/\s+/g,' ').trim()
       if(t.length<8||t.length>160)continue
       const letters=t.replace(/[^a-z]/gi,'')
       const allcaps=letters.length>7&&letters===letters.toUpperCase()&&/\s|·/.test(t)
       if(allcaps||getComputedStyle(el).textTransform==='uppercase')overlines.push({text:t.slice(0,90),element:el.tagName,className:String(el.className).slice(0,100)})
      }
      const modeNodes=[...root.querySelectorAll('.research-calibration-mode')].map(el=>{
       const title=el.querySelector('.research-calibration-mode__heading p')
       const badge=el.querySelector('.research-calibration-mode__badge')
       const context=el.querySelector('.research-calibration-mode__context')
       const header=el.firstElementChild
       return {title:title?.textContent.trim(),badge:badge?.textContent.trim(),context:context?.textContent.trim(),titleBox:title?rect(title):null,badgeBox:badge?rect(badge):null,contextBox:context?rect(context):null,headBox:rect(header),badgeStyle:badge?textStyle(badge):null,contextStyle:context?textStyle(context):null,badgeHeight:badge?.getBoundingClientRect().height,background:getComputedStyle(header).backgroundImage,headerBorders:getComputedStyle(header).borderLeftWidth}
      })
      const model=[...root.querySelectorAll('.lyo-mobile-model-statement')].map(el=>{
        const label=el.querySelector('.manuscript-label')
        const style=getComputedStyle(el)
        return {text:label?.textContent.trim(),labelStyle:label?textStyle(label):null,borders:[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth],radius:style.borderRadius}
      })
      const note=[...root.querySelectorAll('.research-scientific-note,.lyo-evidence-equation,.lyo-mobile-radiation-fact > div:first-child')].map(el=>({cls:el.className,border:getComputedStyle(el).borderLeftWidth}))
      const th=[...root.querySelectorAll('table th')].map(el=>({text:el.textContent.trim().slice(0,70),transform:getComputedStyle(el).textTransform}))
      const disclosure=root.querySelector('aside[aria-label="AI-assisted research disclosure"] summary p')
      return {meta,overlines,modeNodes,model,note,th,disclosure:disclosure?{text:disclosure.textContent.trim(),style:textStyle(disclosure)}:null,overflowPx:document.documentElement.scrollWidth-document.documentElement.clientWidth}
     })
     assert(data.meta.length>=2,'Metadata labels missing: '+slug)
     for(const m of data.meta){assert.equal(m.style.text,'none','Metadata transform: '+m.text);assert(!/mono/i.test(m.style.font),'Metadata must use UI sans')}
     assert.deepEqual(data.overlines,[],'All-caps scientific labels in '+slug+' @'+width)
     assert(data.overflowPx<=1,'Page horizontal overflow '+slug+' @'+width+': '+data.overflowPx)
     if(slug.startsWith('gravimetric')){
      assert.equal(data.modeNodes.length,2,'Two operating modes required')
      assert.deepEqual(data.modeNodes.map(v=>v.badge),['Mode A','Mode B'])
      assert.deepEqual(data.modeNodes.map(v=>v.context),['When a lot is new','For later portions'])
      assert.deepEqual(data.modeNodes.map(v=>v.title),['Calibrate a representative aliquot','Process the bulk sample'])
      for(const m of data.modeNodes){
       assert(m.titleBox.top<m.contextBox.top,'Operating-mode heading must lead')
       assert(m.contextBox.bottom<=m.headBox.bottom+1,'Operating-mode context clipped')
       assert.equal(m.badgeHeight,18,'Quiet mode badge height')
       assert.equal(m.badgeStyle.text,'none')
       assert.equal(m.contextStyle.text,'none')
       assert(m.badgeBox.left>=m.headBox.left&&m.badgeBox.right<=m.headBox.right+1,'Mode chip outside card')
       assert.equal(m.background,'none','Unexpected decorative background')
      }
      assert(data.note.every(v=>v.border==='1px'),'No curved one-sided note borders')
     }
     if(slug.startsWith('low-temp')){
      assert.equal(data.model.length,2,'Two model-summary labels')
      assert(data.model[0].text.startsWith('Fixed model coefficient'))
      assert(data.model[1].text.startsWith('At resistance η ='))
      for(const m of data.model){
       assert.equal(m.labelStyle.text,'none','Label casing is not sentence case')
       assert(m.borders.every(b=>b==='1px'),'Model statement has a colored accent rail')
      }
      assert.match(data.disclosure.text,/^AI-assisted research disclosure$/)
      assert.equal(data.disclosure.style.text,'none')
      assert(data.th.every(h=>h.transform==='none'),'Table headers must not be uppercase')
      assert(data.note.every(n=>n.border==='1px'),'Scientific note still has a one-sided rail')
     }
     assert.deepEqual(errors,[],'Runtime errors in '+slug+' @'+width)
     if((width===390||width===1440)&&(slug.startsWith('gravimetric')||slug.startsWith('low-temp'))){
      const selector=slug.startsWith('gravimetric')?'.research-calibration-figure':'.lyo-mobile-model-statement'
      const shot=page.locator(selector).first()
      await shot.scrollIntoViewIfNeeded()
      await shot.screenshot({path:resolve(output,slug+'-'+theme+'-'+width+'.png')})
     }
     results.push({slug,theme,width,labels:data.meta.length,overlines:0,modeCards:data.modeNodes.length,modelLabels:data.model.length,overflowPx:data.overflowPx,errors:0})
    }finally{await page.close()}
   }
  }
 }
 for(const slug of slugs){
  const page=await browser.newPage({viewport:{width:1440,height:920},colorScheme:'light'})
  try{
   await page.emulateMedia({media:'print'})
   await page.goto(origin+'/research/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000})
   await page.locator('.research-body #title').waitFor({state:'attached',timeout:25000})
   const labels=await page.locator('.research-body .manuscript-label').evaluateAll(els=>els.map(el=>({
    text:el.textContent.trim(),transform:getComputedStyle(el).textTransform,spacing:getComputedStyle(el).letterSpacing,
   })))
   assert(labels.length>=2,'Print labels absent: '+slug)
   assert(labels.every(x=>x.transform==='none'),'Print presentation reverted to uppercase: '+slug)
   results.push({slug,theme:'print',width:1440,labels:labels.length,overlines:0,errors:0})
  }finally{await page.close()}
 }
}finally{await browser.close()}
console.log(JSON.stringify({passed:results.length,results},null,2))
