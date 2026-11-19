import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const root=resolve(import.meta.dirname,'..')
const dir=resolve(root,'content/manuscripts/thca-limonene-cosmo-rs')
const text=async name=>readFile(resolve(dir,name),'utf8')
const tex=await text('manuscript.tex')
const html=await text('manuscript-preview.html')
const data=JSON.parse(await text('data/lattice_crosswalk.json'))
const sle=JSON.parse(await text('data/sle_rebuild_results.json'))
const pdf=await readFile(resolve(dir,'manuscript-draft.pdf'))
assert.ok(tex.includes('\\twocolumn[{\\fullwidthtitle}]'),'Canonical source must have explicit two-column scientific paper')
assert.ok(html.includes('<article class="columns">'),'Generated article not found')
for(const label of ['tab:lattice','tab:temps','fig:curve','fig:activity']){
  assert.ok(tex.includes('\\label{'+label+'}'),'TeX missing '+label)
  assert.ok(html.includes('id="'+label+'"'),'HTML missing '+label)
}
const tables=[...html.matchAll(/<table class="scitable" id="([^"]+)"/g)].map(x=>x[1])
const figures=[...html.matchAll(/<figure id="([^"]+)"/g)].map(x=>x[1])
assert.deepEqual(tables,['tab:lattice','tab:temps'],'Both scientific tables must be distinct')
assert.deepEqual(figures,['fig:curve','fig:activity'],'Both scientific plots must be distinct')
for(const k of ['a','b','c','volume']){
  const decimals=k==='volume'?1:4
  assert.ok(html.includes(data.crystal_2021_120K[k].toFixed(decimals)),'Missing CIF cell '+k)
  assert.ok(html.includes(data.patent_2026_100K[k].toFixed(decimals)),'Missing patent cell '+k)
}
const base=sle.rows.find(r=>r.scenario==='patent_146C_16p3kJ_cp0' && r.temperature_C===25)
assert.ok(base,'Missing numerical model reference')
assert.ok(Math.abs(base.x_saturation-.11069479664707402)<1e-9,'Different 25°C model root')
assert.ok(html.includes('0.11069') && html.includes('275.42'),'Rendered TeX does not carry checked 25°C result')
assert.ok(html.includes('0.07620') && html.includes('11.4069'),'HTML table data missing scientific inputs')
assert.equal((html.match(/class="mathblock"/g)||[]).length,5,'Display equations missing')
assert.ok(!html.includes('class="katex-error"'),'Invalid KaTeX command')
assert.ok(!/>\?<\/a>/.test(html),'Unresolved section/equation/table/figure reference')
const plotBlocks=[...html.matchAll(/<figure id="([^"]+)">([\s\S]*?)<\/figure>/g)]
assert.equal(plotBlocks.length,2)
assert.notEqual(plotBlocks[0][2],plotBlocks[1][2],'Both figures accidentally duplicate one plot')
assert.ok(plotBlocks[1][2].includes('ln γ') || plotBlocks[1][2].includes('activity coefficients'),'Second figure is not the activity plot')
assert.ok(pdf.subarray(0,5).toString()==='%PDF-')
const document=await getDocument({data:new Uint8Array(pdf),useSystemFonts:true,disableFontFace:true}).promise
const pages=[],leftAndRight=[],links=[]
for(let i=1;i<=document.numPages;i++){
 const page=await document.getPage(i)
 const viewport=page.getViewport({scale:1})
 const content=await page.getTextContent()
 const halves=[0,0]
 const charCount=content.items.reduce((sum,item)=>sum+(item.str?.length||0),0)
 for(const item of content.items){
   if(typeof item.str!=='string'||!item.str.trim())continue
   const x=item.transform?.[4]
   if(Number.isFinite(x))halves[x<viewport.width/2?0:1]+=item.str.length
 }
 const annotations=await page.getAnnotations({intent:'display'})
 const linked=annotations.filter(x=>x.url||x.dest).length
 pages.push({page:i,characters:charCount,columns:halves,pdfLinks:linked})
 leftAndRight.push(halves)
 links.push(linked)
}
const allText=(await Promise.all([...Array(document.numPages)].map(async(_,i)=>{
 const page=await document.getPage(i+1)
 const c=await page.getTextContent()
 return c.items.map(x=>x.str).join(' ')
}))).join(' ')
for(const phrase of ['11.4069','3980.1','0.11069','275.42','Table 1.','Table 2.','Figure 1.','Figure 2.']){
 assert.ok(allText.includes(phrase),'PDF missing scientific figure/table text '+phrase)
}
assert.ok(document.numPages>=3&&document.numPages<=6,'Unexpected PDF length')
assert.ok(leftAndRight.every(([left,right])=>left>100&&right>100),'Expected substantive A4 scientific columns on every page')
assert.ok(links.reduce((a,b)=>a+b,0)>=15,'PDF lacks semantic links/anchors')
const report={status:'PASS',source:'manuscript.tex',pdfPages:document.numPages,pdfBytes:pdf.length,sourceTableIDs:tables,sourceFigureIDs:figures,equations:5,
  navigablePdfAnnotations:links.reduce((a,b)=>a+b,0),pdfTextColumns:pages,analytic25C:{x:base.x_saturation,loadingMgPerInitialMl:base.mg_THCA_per_mL_initial_limonene},
  provenance:'source-matched manuscript TeX, published crystal metrics and saved numerical campaign artifacts'}
console.log(JSON.stringify(report,null,2))
