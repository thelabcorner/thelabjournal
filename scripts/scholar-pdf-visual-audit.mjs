/**
 * Independent PDF raster smoke: render first/middle/last pages of every Scholar
 * PDF using pdf.js and NAPI Canvas, and reject blank or corrupted pages.
 * Artifacts are ignored (artifacts/scholar-pdf-qa).
 */
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createCanvas } from '@napi-rs/canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PAPER_DEFINITIONS } from '../src/manuscript-runtime/data/papers/index.ts'
const root=resolve(import.meta.dir,'..')
const output=join(root,'artifacts','scholar-pdf-qa')
const idFlag=process.argv.find(x=>x.startsWith('--id='))?.slice(5)
const papers=PAPER_DEFINITIONS.filter(x=>x.entry.available && (!idFlag || x.entry.id===idFlag))
assert.ok(papers.length, 'Unknown or unavailable manuscript: '+idFlag)
await mkdir(output,{recursive:true})
for(const {entry:paper} of papers){
  const path=join(root,'public','research',paper.id,'manuscript.pdf')
  const data=await readFile(path)
  const document=await getDocument({data:new Uint8Array(data),useSystemFonts:true,disableFontFace:true}).promise
  let representative=null
  for(let index=3;index<document.numPages;index++){
    const page=await document.getPage(index)
    const content=await page.getTextContent()
    let left=0,right=0
    for(const item of content.items){
      if(!item.str?.trim() || !item.transform)continue
      const x=item.transform[4],y=item.transform[5]
      if(y<45 || y>page.view[3]-42)continue
      if(x<page.view[2]*.46)left++
      if(x>page.view[2]*.54)right++
    }
    const score=Math.min(left,right)
    if(score>=(representative?.score??0))representative={index,score}
  }
  assert.ok(representative && representative.score>=26,'No representative genuine two-column scholarly page')
  const picks=[...new Set([1,2,representative.index,Math.ceil(document.numPages/2),document.numPages])]
  console.log('Scientific two-column representative:',paper.id,'page',representative.index,'paired text items',representative.score)
  try{
    for(const index of picks){
      const page=await document.getPage(index)
      const viewport=page.getViewport({scale:0.9})
      const canvas=createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height))
      const context=canvas.getContext('2d')
      await page.render({canvasContext:context,viewport,background:'rgb(255,255,255)'}).promise
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data
      let ink=0
      for(let i=0;i<pixels.length;i+=4){
        if(pixels[i]<215 || pixels[i+1]<215 || pixels[i+2]<215)ink++
      }
      const inkRatio=ink/(canvas.width*canvas.height)
      assert.ok(inkRatio>0.002,'Blank/near blank PDF page: '+paper.id+' p'+index+' ink='+inkRatio)
      assert.ok(inkRatio<0.80,'Overfilled/corrupt PDF page: '+paper.id+' p'+index)
      const name=paper.id+'-p'+String(index).padStart(2,'0')+'.png'
      await writeFile(join(output,name),canvas.toBuffer('image/png'))
      console.log(name+': '+canvas.width+'x'+canvas.height+', ink ratio '+inkRatio.toFixed(3))
    }
  } finally {await document.destroy()}
}
console.log('PDF raster audit PASSED')
