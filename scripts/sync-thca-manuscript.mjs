/**
 * Copy only the editorial-review PDF and dither for the THCA draft reader.
 * This is deliberately NOT the Scholar-validated manuscript.pdf pipeline.
 * Canonical scientific source: content/manuscripts/.../manuscript.tex
 */
import { readFile, mkdir, copyFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
const root = resolve(import.meta.dir, '..')
const source = join(root,'content','manuscripts','thca-limonene-cosmo-rs')
const target = join(root,'public','research','thca-limonene-cosmo-rs')
const tex = await readFile(join(source,'manuscript.tex'),'utf8')
const html = await readFile(join(source,'manuscript-preview.html'),'utf8')
if (!tex.includes('\\twocolumn[{\\fullwidthtitle}]') || !html.includes('class="columns"')) {
  throw Error('THCA manuscript TeX or generated HTML preview is missing its two-column publication content')
}
const pdf = await readFile(join(source,'manuscript-draft.pdf'))
if (pdf.subarray(0,5).toString() !== '%PDF-' || pdf.length < 15000) {
  throw Error('THCA manuscript draft PDF is absent or invalid; regenerate from manuscript.tex')
}
const dither = await readFile(join(source,'dither.svg'),'utf8')
if (!dither.includes('<svg')) throw Error('Missing thelabjournal dither artwork')
await mkdir(target,{recursive:true})
await Promise.all([
  copyFile(join(source,'manuscript-draft.pdf'),join(target,'manuscript-draft.pdf')),
  copyFile(join(source,'dither.svg'),join(target,'dither.svg'))
])
console.log('THCA manuscript source and preview verified; draft PDF and dither copied to the Manuscripts reader.')
