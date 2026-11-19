/**
 * Printable, searchable scholarly PDFs for the formal manuscript collection.
 * Reads the actual interactive React manuscript body; journals are never input.
 *
 * Usage: bun scripts/manuscript-pdf.mjs [--id=manuscript-id]
 * Prerequisite: bun run build. Rebuild after PDF generation to publish links.
 * On CI without Chromium use the HTML-abstract-only fallback; do not invent PDF.
 */
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright-core'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PAPER_DEFINITIONS } from '../src/manuscript-runtime/data/papers/index.ts'
import { sourceFingerprint } from './scholar-pages.mjs'
import { composePublication } from './pdf-publication-layout.mjs'

const ROOT = resolve(import.meta.dir,'..')
const PORT = 13992
const ORIGIN = 'http://127.0.0.1:' + PORT
const DIST = join(ROOT,'dist')
const TARGET = join(ROOT,'public','research')
const LIMIT = 5_000_000
const definitions = PAPER_DEFINITIONS.filter(p=>p.entry.available)
const papers = definitions.map(p=>p.entry)
const idFlag = process.argv.find(x=>x.startsWith('--id='))?.slice(5)
if (idFlag && !papers.some(p=>p.id===idFlag)) throw Error('Unknown manuscript: '+idFlag)

const server = spawn(process.execPath, [
  join(ROOT,'node_modules','vite','bin','vite.js'),'preview','--host','127.0.0.1',
  '--port',String(PORT),'--strictPort'
],{cwd:ROOT,stdio:['ignore','pipe','pipe']})
let serverOutput = ''
server.stdout.on('data',d=>{serverOutput += d.toString().slice(0,500)})
server.stderr.on('data',d=>{serverOutput += d.toString().slice(0,500)})
let browser
async function ready() {
  for(let attempt=0; attempt<70; attempt++) {
    if(server.exitCode!==null) throw Error('Vite preview terminated: '+serverOutput)
    try{
      const response = await fetch(ORIGIN+'/research/',{signal:AbortSignal.timeout(1500)})
      if(response.ok) {
        const html = await response.text()
        if(html.includes('id="root"') && html.includes('/assets/index-') && html.includes('thelabjournal')) return
      }
    }catch{}
    await delay(250)
  }
  throw Error('Manuscript preview did not become ready: '+serverOutput)
}
/** Resolve real PDF destinations on the printed contents page, then typeset
 * actual page numbers in the final publication. Two-pass page numbering is
 * identical to TeX's reference-resolution approach. */
async function resolveContentsPages(pdf, expectedIds) {
  const doc=await getDocument({data:new Uint8Array(pdf),useSystemFonts:true,disableFontFace:true}).promise
  try {
    if(doc.numPages<3)throw Error('PDF missing distinct cover/contents/pages')
    const text=(await (await doc.getPage(2)).getTextContent()).items.map(x=>x.str||'').join(' ')
    if(!text.includes('Contents'))throw Error('Contents not found on page 2')
    const annotations=await (await doc.getPage(2)).getAnnotations()
    const pages={}
    for(const annotation of annotations) {
      if(typeof annotation.dest!=='string' || !expectedIds.includes(annotation.dest))continue
      const target=await doc.getDestination(annotation.dest)
      if(!target?.[0])throw Error('Unresolvable PDF destination: '+annotation.dest)
      pages[annotation.dest]=await doc.getPageIndex(target[0])+1
    }
    const missing=expectedIds.filter(id=>!pages[id])
    if(missing.length)throw Error('PDF contents links lack native destinations: '+missing.join(', '))
    return pages
  }finally{await doc.destroy()}
}
async function checkText(pdf, paper, expectedIds) {
  const doc = await getDocument({data:new Uint8Array(pdf),useSystemFonts:true,disableFontFace:true}).promise
  try {
    if(doc.numPages < 2 || doc.numPages > 180) throw Error('Unexpected PDF page count: '+doc.numPages)
    let text = ''
    let pairedColumnPages = 0
    let isolatedBodyPages = 0
    for(let index=1; index<=doc.numPages; index++) {
      const page=await doc.getPage(index)
      const content=await page.getTextContent()
      text += '\n' + content.items.map(token=>token.str||'').join(' ')
      // The PDF must actually contain two substantive research reading
      // columns, not merely contain "column-count" in a stylesheet.
      // Ignore folios and running heads; full-width figure plates are
      // allowed to occupy an isolated page.
      if(index<=2 || index>=doc.numPages) continue
      const width=page.view[2],height=page.view[3]
      let left=0,right=0
      for(const item of content.items){
        if(!item.str?.trim() || !item.transform) continue
        const x=item.transform[4], y=item.transform[5]
        if(y<45 || y>height-42)continue
        if(x<width*.46)left++
        if(x>width*.54)right++
      }
      if(left>=26 && right>=26)pairedColumnPages++
      else isolatedBodyPages++
    }
    const requiredPaired=Math.max(1,Math.min(4,Math.floor((doc.numPages-3)/4)))
    if(pairedColumnPages<requiredPaired)
      throw Error('Scientific two-column pagination missing: '+pairedColumnPages+' paired / '+requiredPaired+' required')
    const normalized = s => s.toLowerCase().replace(/[\u200b\u00ad]/g,'').replace(/[^a-z0-9]+/g,'')
    const documentText = normalized(text)
    const title = normalized(paper.metadata.title)
    if (!documentText.includes(title.slice(0,Math.min(title.length,65)))) console.log('PDF text layer sample:',JSON.stringify(text.slice(0,1100)))
    if(!documentText.includes(title.slice(0,Math.min(title.length,65))))
      throw Error('PDF text layer missing manuscript title: '+paper.id)
    for(const author of paper.metadata.authors){
      if(!documentText.includes(normalized(author.name))) throw Error('PDF missing author: '+author.name)
    }
    if(!documentText.includes('references') && !documentText.includes('bibliography'))
      throw Error('PDF missing detectable reference section')
    if(text.length < Math.min(paper.wordCount*2,3500)) throw Error('PDF contains too little searchable text: '+text.length)
    const outline=await doc.getOutline()
    const countOutline=items=>(items||[]).reduce((sum,item)=>sum+1+countOutline(item.items),0)
    const outlineEntries=countOutline(outline)
    if(outlineEntries<expectedIds.length)
      throw Error('PDF outline lacks real section bookmarks: '+outlineEntries+' / '+expectedIds.length)
    const tocAnnotations=await (await doc.getPage(2)).getAnnotations()
    const nativeChapterLinks=tocAnnotations.filter(a=>expectedIds.includes(a.dest)).length
    if(nativeChapterLinks!==expectedIds.length)
      throw Error('PDF native TOC link count mismatch: '+nativeChapterLinks+' / '+expectedIds.length)
    return {pages:doc.numPages,characters:text.length,outlineEntries,nativeChapterLinks,pairedColumnPages,isolatedBodyPages}
  } finally {await doc.destroy()}
}
try{
  await ready()
  const candidates = [process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/chromium', '/usr/bin/google-chrome',
  ]
  const executablePath = candidates.find(p=>p && existsSync(p))
  browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox']})
  const context=await browser.newContext({
    viewport:{width:1440,height:900},deviceScaleFactor:1,colorScheme:'light',
    reducedMotion:'reduce'
  })
  const manifestFile=join(TARGET,'pdf-manifest.json')
  let manifest={}
  try{manifest=JSON.parse(await readFile(manifestFile,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
  for(const paper of papers.filter(p=>!idFlag || p.id===idFlag)){
    const page=await context.newPage()
    try{
      const response=await page.goto(ORIGIN+'/research/'+paper.id+'/',{waitUntil:'networkidle',timeout:90000})
      if(!response?.ok())throw Error('Reader HTTP '+response?.status())
      await page.locator('.research-body #title-heading').waitFor({timeout:90000})
      await page.waitForFunction(()=>
        document.querySelectorAll('.research-body .katex, .research-body .math-block').length>5 ||
        !!document.querySelector('.research-body #references'),
        {timeout:20000}
      ).catch(()=>{})
      const extracted = await page.locator('.research-body').innerText()
      if(extracted.length<3500 || !extracted.includes(paper.metadata.title))
        throw Error('Full manuscript did not render: '+paper.id+' ('+extracted.length+' chars)')
      const abstractParagraphs=await page.evaluate(()=>
        Array.from(document.querySelectorAll('.research-body #abstract .research-editorial-abstract__body > p'))
          .map(node=>(node.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean)
      )
      if(abstractParagraphs.join(' ').length<300)
        throw Error('Full author abstract not available in manuscript DOM: '+paper.id)
      // The exported PDF is a self-contained editorial document, not a
      // browser snapshot: a distinct cover, real vector dither, true TOC links,
      // source-native scientific sections, and the actual full bibliography.
      const definition = definitions.find(item => item.entry.id === paper.id)
      const composition = await composePublication(page,paper,definition.navSections)
      await page.emulateMedia({media:'print',colorScheme:'light'})
      await page.addStyleTag({path:join(ROOT,'src','manuscript-publication-pdf.css')})
      const equationLayout=await page.evaluate(()=>{
        const blocks=Array.from(document.querySelectorAll('#pdf-publication figure.math-block'))
        let wide=0
        // Classify by content width against the live, actual print column.
        // Layout changes after each promotion, so remeasure boundedly.
        for(let pass=0;pass<2;pass++){
          for(const block of blocks){
            if(block.classList.contains('pdf-wide-equation'))continue
             const wrap=block.querySelector('.katex-display-wrap')
             const latex=wrap?.querySelector('.katex-display .katex-html')
             if(!wrap || !latex)continue
             // KaTeX stretches its outer blocks to the column; measuring
             // .katex or scrollWidth falsely treats short formulas as wide.
             const range=document.createRange()
             range.selectNodeContents(latex)
             const available=wrap.getBoundingClientRect().width
             const natural=range.getBoundingClientRect().width
            if(natural>available+3 && available>0){
              block.classList.add('pdf-wide-equation')
              wide++
            }
          }
        }
        return {total:blocks.length,wide,columnar:blocks.length-wide}
      })
      console.log('Measured mathematical column fit:',JSON.stringify(equationLayout))
      const typography=await page.evaluate(()=>{
        const selectors=[
          '.pdf-cover__title',
          '.pdf-cover__abstract p',
          '.pdf-contents__item a',
          '.research-body .prose-heading p',
          '.research-body .reference-entry p',
          '.research-body .research-chapter-label h2',
        ]
        return selectors.map(selector=>{
          const element=document.querySelector('#pdf-publication '+selector)
          return {selector, font:element?getComputedStyle(element).fontFamily:null}
        })
      })
      for(const row of typography){
        if(row.font && /Georgia|Cambria|Times New Roman|serif(?!\s)/i.test(row.font.replace(/sans-serif/gi,'')))
          throw Error('Serif font violated PDF typography contract: '+JSON.stringify(row))
      }
      console.log('PDF sans-serif typography:',JSON.stringify(typography))
      const layoutQA=await page.evaluate(()=>{
        const root=document.getElementById('pdf-publication')
        const missing=Array.from(root.querySelectorAll('.pdf-contents a[href^="#"]'))
          .filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash)
        const overflowing=Array.from(root.querySelectorAll('.research-body table, .research-body figure'))
          .filter(el=>el.scrollWidth>el.clientWidth+15).slice(0,8)
          .map(el=>({tag:el.tagName,width:el.clientWidth,scroll:el.scrollWidth}))
        return {missing,overflowing}
      })
      if(layoutQA.missing.length)throw Error('Broken PDF TOC anchors: '+JSON.stringify(layoutQA.missing))
      if(layoutQA.overflowing.length)console.log('PDF layout overflow candidates: '+JSON.stringify(layoutQA.overflowing))
      const escapeHtml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
      const headerTitle=paper.metadata.title.length>78 ? paper.metadata.title.slice(0,75)+'…' : paper.metadata.title
      const head='<div style="width:100%;margin:0 15.5mm;padding:0 0 5px;border-bottom:1px solid #e4e4e7;display:flex;align-items:center;justify-content:space-between;font:7.5px Arial,sans-serif;color:#71717a">'+
        '<span style="font-weight:700;color:#3f3f46">thelabjournal™</span><span>'+escapeHtml(headerTitle)+'</span></div>'
      const foot='<div style="width:100%;margin:0 15.5mm;padding-top:5px;border-top:1px solid #e4e4e7;display:flex;align-items:center;justify-content:space-between;font:8px Arial,sans-serif;color:#71717a">'+
        '<span>'+escapeHtml(paper.metadata.authors.map(a=>a.name).join(', '))+' · '+escapeHtml(paper.metadata.version)+'</span>'+
        '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
      const pdfOptions={
        format:'A4',preferCSSPageSize:true,printBackground:true,
        displayHeaderFooter:true,headerTemplate:head,footerTemplate:foot,
        tagged:true,outline:true,scale:1,timeout:90000
      }
      const firstPass=await page.pdf(pdfOptions)
      const tocIds=definition.navSections.filter(s=>s.id!=='title').map(s=>s.id)
      if(composition.navLinks>tocIds.length)tocIds.push('publication-integrity')
      const tocPages=await resolveContentsPages(firstPass,tocIds)
      await page.evaluate(pages=>{
        for(const item of document.querySelectorAll('.pdf-contents__item')){
          const anchor=item.querySelector('a[href^="#"]')
          if(!anchor)continue
          const id=anchor.getAttribute('href').slice(1)
          const number=item.querySelector('.pdf-contents__target')
          if(number&&pages[id])number.textContent=String(pages[id]).padStart(2,'0')
        }
      },tocPages)
      const bytes=await page.pdf(pdfOptions)
      const finalPages=await resolveContentsPages(bytes,tocIds)
      for(const id of tocIds)if(finalPages[id]!==tocPages[id])
        throw Error('Unstable PDF pagination at '+id+': '+tocPages[id]+' -> '+finalPages[id])
      console.log('PDF publication DOM:',JSON.stringify({...composition,chapters:Object.keys(tocPages).length}))
      if(bytes.length>LIMIT)throw Error('PDF exceeds Scholar 5 MB limit: '+paper.id+' '+bytes.length+' B')
      const inspection=await checkText(bytes,paper,tocIds)
      const fingerprint=await sourceFingerprint(paper)
      const path=join(TARGET,paper.id,'manuscript.pdf')
      const distPath=join(DIST,'research',paper.id,'manuscript.pdf')
      await mkdir(join(TARGET,paper.id),{recursive:true})
      await mkdir(join(DIST,'research',paper.id),{recursive:true})
      await writeFile(path,bytes)
      await copyFile(path,distPath)
      const abstractJSON=JSON.stringify({
        manuscriptVersion:paper.metadata.version,
        fingerprint,paragraphs:abstractParagraphs
      },null,2)+'\n'
      await writeFile(join(TARGET,paper.id,'abstract.json'),abstractJSON)
      await writeFile(join(DIST,'research',paper.id,'abstract.json'),abstractJSON)
      manifest[paper.id]={
        fingerprint,
        bytes:bytes.length,
        sha256:createHash('sha256').update(bytes).digest('hex'),
        textVerified:true,
        pages:inspection.pages,
        textCharacters:inspection.characters,
        nativeChapterLinks:inspection.nativeChapterLinks,
        outlineEntries:inspection.outlineEntries,
        pageNumbersResolved:true,
        pairedColumnPages:inspection.pairedColumnPages,
        fullWidthFigurePagesAndShortSections:inspection.isolatedBodyPages,
        columnLayout:'two-column-with-full-width-plates',
        publisherStyle:'thelabjournal-zinc-scientific',
        manuscriptVersion:paper.metadata.version,
        type:'searchable-pdf'
      }
      console.log('Verified scholarly PDF: '+paper.id+' ('+inspection.pages+' pages, '+inspection.characters+' text chars, '+bytes.length+' bytes)')
    } finally {await page.close()}
  }
  await mkdir(TARGET,{recursive:true})
  await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n')
  await writeFile(join(DIST,'research','pdf-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
  console.log('PDF manifest updated. Run "bun scripts/scholar-pages.mjs generate && bun scripts/scholar-pages.mjs audit" to link verified PDFs.')
} finally {
  await browser?.close().catch(()=>{})
  server.kill('SIGTERM')
}
