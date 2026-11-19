import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const origin=process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4189'
const slug='thca-limonene-cosmo-rs'
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']})
const out=resolve(import.meta.dirname,'../artifacts/thca-manuscript-audit')
await mkdir(out,{recursive:true})
const observations=[]
async function assertRoute(viewport) {
  const page=await browser.newPage({viewport,deviceScaleFactor:1})
  const errors=[]
  page.on('pageerror',e=>errors.push(String(e)))
  page.on('response',res=>{if(res.status()>=400) errors.push(res.status()+' '+res.url())})
  await page.goto(origin+'/research/',{waitUntil:'networkidle'})
  const paper=page.getByRole('link',{name:/Read Reassessing THCA-A Solubility/})
  await paper.waitFor({state:'visible'})
  await paper.click()
  await page.locator('.research-body--thca .thca-manuscript-content').waitFor({state:'visible'})
  const audit=await page.evaluate(()=>{
    const w=document.documentElement
    const body=document.querySelector('.thca-manuscript')
    const img=document.querySelector('.thca-manuscript-front .dither')
    const figures=[...document.querySelectorAll('.thca-manuscript-content figure')]
    const sections=[...document.querySelectorAll('.thca-manuscript-content h2[id]')]
    const toc=document.querySelector('.research-document-toc')
    const pdf=[...document.querySelectorAll('a')].find(a=>a.getAttribute('href')?.includes('manuscript-draft.pdf'))
    const layout=[...document.querySelectorAll('.thca-manuscript-content .mathblock')]
    return {path:location.pathname, title:document.querySelector('.thca-manuscript h1')?.textContent,
      viewport:w.clientWidth, scrollWidth:w.scrollWidth,
      columns:getComputedStyle(document.querySelector('.thca-manuscript-content')).columnCount,
      headings:sections.map(el=>el.id),math:layout.length,figures:figures.length,
      referenceLinks:document.querySelectorAll('.thca-manuscript-content .references a').length,
      scientificTables:[...document.querySelectorAll('.thca-manuscript-content .scitable')].map(x=>x.id),
      scientificFigures:[...document.querySelectorAll('.thca-manuscript-content figure')].map(x=>x.id),
      unitCellPresent:body?.textContent?.includes('11.4069'),
      equilibriumFractionPresent:body?.textContent?.includes('0.11069'),
      tocVisible:toc?getComputedStyle(toc).display:'missing',
      imageLoaded:img?.complete && img.naturalWidth>0,pdfHref:pdf?.getAttribute('href'),
      pdfPresent:!!pdf,actualArticleTextCharacters:body?.textContent?.length,
      cssPresent:getComputedStyle(document.querySelector('.thca-manuscript-front .abstract')).borderTopStyle!=='none'}
  })
  if(audit.scrollWidth>audit.viewport+2) errors.push('horizontal overflow '+audit.scrollWidth+'/'+audit.viewport)
  if(audit.math!==5 || audit.figures!==2 || audit.scientificTables.join(',')!=='tab:lattice,tab:temps' ||
    audit.scientificFigures.join(',')!=='fig:curve,fig:activity' || !audit.unitCellPresent || !audit.equilibriumFractionPresent ||
    audit.headings.length<8 || audit.actualArticleTextCharacters<6500 || !audit.imageLoaded || !audit.cssPresent || !audit.pdfPresent) errors.push('missing expected scientific manuscript elements: '+JSON.stringify(audit))
  if(!audit.path.endsWith('/research/'+slug+'/'))errors.push('wrong manuscript path '+audit.path)
  await page.screenshot({path:resolve(out,'reader-'+viewport.width+'px.png'),fullPage:false})
  observations.push({...audit,errors})
  await page.close()
}
try{
 await assertRoute({width:1440,height:950})
 await assertRoute({width:390,height:844})
 console.log(JSON.stringify({status:observations.every(x=>x.errors.length===0)?'PASS':'FAIL',observations},null,2))
 if(observations.some(x=>x.errors.length))process.exitCode=1
}finally{await browser.close()}
