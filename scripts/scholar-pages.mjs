/**
 * Manuscripts-only Google Scholar static publishing surface.
 *
 * Generates crawlable, unique HTML abstract pages from the SAME PaperEntry
 * registry that drives the interactive scientific readers. Journal/essay posts
 * never receive citation_* tags. PDF links are advertised only when a locally
 * generated, source-matched, searchable PDF has passed preflight.
 *
 * bun scripts/scholar-pages.mjs generate|audit
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { join, resolve, dirname, extname } from 'node:path'
import { PAPER_DEFINITIONS } from '../src/manuscript-runtime/data/papers/index.ts'
import { entries } from '../src/data.ts'
import { publishedCollections, publishedQuotes } from '../src/quotes/data.ts'

const ROOT = resolve(import.meta.dir, '..')
const DIST = join(ROOT, 'dist')
const PUBLIC = join(ROOT, 'public')
const SITE = 'https://journal.thedabcorner.site'
const BASE = process.env.GITHUB_PAGES === 'true' ? '/thelabjournal/' : '/'
const PDF_LIMIT = 5_000_000
const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
const slugOK = id => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
const url = path => SITE + '/' + path.replace(/^\/+/, '')
const meta = (name, value) => '<meta name="' + name + '" content="' + escape(value) + '" />'
const link = (href, content) => '<a href="' + escape(href) + '">' + escape(content) + '</a>'
const getYear = paper => {
  const y = paper.metadata.publicationYear ||
    (paper.metadata.year.match(/\b(?:19|20)\d{2}\b/g) || []).at(-1)
  if (!/^(?:19|20)\d{2}$/.test(y || '')) throw Error('Missing verifiable publication year: ' + paper.id)
  return y
}
const papers = PAPER_DEFINITIONS.filter(p => p.entry.available).map(p => p.entry)
const relativePaperPath = id => 'research/' + id + '/'
const pdfDiskPath = id => join(PUBLIC, 'research', id, 'manuscript.pdf')
const manifestFile = join(PUBLIC, 'research', 'pdf-manifest.json')
const tryFile = async path => { try { return await readFile(path) } catch (error) { if (error.code === 'ENOENT') return null; throw error } }
async function allFiles(dir) {
  const result = []
  for (const item of await readdir(dir, {withFileTypes:true})) {
    const abs = join(dir, item.name)
    if (item.isDirectory()) result.push(...await allFiles(abs))
    else if (item.isFile()) result.push(abs)
  }
  return result
}
/** Refuse to advertise a PDF when the content it was built from has changed. */
async function locatePaperSource(paper) {
  const directory = join(ROOT,'src','manuscript-runtime','data','papers')
  const candidates = await readdir(directory,{withFileTypes:true})
  const escapedId = paper.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
  const matchId = new RegExp('\\bid\\s*:\\s*[\\x27\\x22]' + escapedId + '[\\x27\\x22]')
  for(const candidate of candidates) {
    if(!candidate.isDirectory())continue
    const path = join(directory,candidate.name,'entry.ts')
    const source = await tryFile(path)
    if(source && matchId.test(source.toString('utf8')))return join(directory,candidate.name)
  }
  throw Error('Cannot locate source entry.ts for manuscript: '+paper.id)
}
export async function sourceFingerprint(paper) {
  const directory = await locatePaperSource(paper)
  const manuscriptStyles = (await readdir(join(ROOT,'src')))
    .filter(name => name.endsWith('-manuscript-presentation.css'))
    .map(name => join(ROOT,'src',name))
  const files = [
    ...await allFiles(directory),
    ...await allFiles(join(ROOT,'src','manuscript-runtime','components')),
    ...['src/App.tsx','src/main.tsx','src/ResearchManuscriptBody.tsx','src/research.ts','src/research.css',
      'src/research-reading.css','src/manuscript-visual.css',
      'src/manuscript-publication-pdf.css','scripts/pdf-publication-layout.mjs',
      'scripts/manuscript-pdf.mjs'
    ].map(file => join(ROOT,file)),
    ...manuscriptStyles,
  ]
  const relative = file => file.slice(ROOT.length).replace(/\\/g,'/')
  files.sort((a,b) => relative(a) < relative(b) ? -1 : relative(a) > relative(b) ? 1 : 0)
  const hash = createHash('sha256')
  for (const file of files) {
    // Portable between Windows authoring hosts and Linux deployment runners:
    // normalize path separators, sort order, and Git CRLF checkout policy.
    hash.update(relative(file))
    hash.update((await readFile(file,'utf8')).replace(/\r\n/g,'\n'))
  }
  return hash.digest('hex')
}
async function validPdf(paper, manifest) {
  const record = manifest[paper.id]
  if (!record || record.fingerprint !== await sourceFingerprint(paper)) return false
  const bytes = await tryFile(pdfDiskPath(paper.id))
  if (!bytes || bytes.length > PDF_LIMIT || !bytes.subarray(0,5).equals(Buffer.from('%PDF-'))) return false
  return record.bytes === bytes.length && record.sha256 === createHash('sha256').update(bytes).digest('hex') && record.textVerified === true
}
const header = (text) => '<h1 style="font-size:clamp(1.7rem,4vw,2.3rem);line-height:1.18;margin:0 0 1.2rem;font-weight:690">' + escape(text) + '</h1>'
const style = 'font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:830px;padding:35px 20px;margin:0 auto;color:#18181b;background:#fff'
function staticPaper(paper, hasPdf, abstractParagraphs) {
  const p = relativePaperPath(paper.id)
  const authors = paper.metadata.authors
  return '<main style="' + style + '"><nav aria-label="Publication navigation" style="margin-bottom:2rem;font-size:.85rem">' +
    link(BASE + 'research/', 'Research manuscripts') + ' · ' + link(BASE, 'thelabjournal™') + '</nav>' +
    '<article data-publication-type="manuscript" aria-labelledby="scholar-title">' +
    '<p style="font-size:.78rem;color:#52525b;margin-bottom:12px">Independent applied research · ' + escape(paper.field) + '</p>' +
    '<div id="scholar-title">' + header(paper.metadata.title) + '</div>' +
    (paper.metadata.subtitle ? '<p style="font-size:1.08rem;color:#52525b">' + escape(paper.metadata.subtitle) + '</p>' : '') +
    '<p>' + escape(authors.map(a=>a.name).join('; ')) + '</p>' +
    '<p style="font-size:.83rem;color:#52525b">Manuscript year: ' + escape(getYear(paper)) + ' · ' +
    'Revision: ' + escape(paper.lastModified) + ' · ' + escape(paper.metadata.version) + ' · ' +
    escape(paper.metadata.status) + '</p>' +
    '<h2>Abstract</h2>' + abstractParagraphs.map(text=>'<p>'+escape(text)+'</p>').join('') +
    (hasPdf ? '<p>' + link(BASE + p + 'manuscript.pdf','Download the complete, searchable manuscript (PDF)') + '</p>' : '') +
    '<p style="font-size:.85rem;color:#52525b">This work is independently authored. Its revision status does not certify external peer review.</p>' +
    '</article></main>'
}
function staticIndex(pdfEntries) {
  return '<main style="' + style + '"><nav style="margin-bottom:2rem;font-size:.85rem">' + link(BASE,'thelabjournal™') + '</nav>' +
    header('Research manuscripts') +
    '<p>Independent applied research, technical analyses and mathematical models. Formal manuscripts are separate from the personal journal and editorial essays.</p>' +
    '<ol>' + papers.map(paper => '<li style="padding:.8rem 0"><strong>' +
      link(BASE + relativePaperPath(paper.id),paper.metadata.title) + '</strong>' +
      '<div style="font-size:.85rem;color:#52525b">' + escape(paper.metadata.authors.map(a=>a.name).join('; ')) +
      ' · ' + escape(getYear(paper)) + ' · ' + escape(paper.metadata.version) + '</div>' +
      (pdfEntries[paper.id] ? link(BASE + relativePaperPath(paper.id) + 'manuscript.pdf','Full text PDF') : '') + '</li>').join('') + '</ol></main>'
}
function scrubHomepage(html) {
  return html.replace(/^\s*<meta (?:name="description"|name="twitter:[^"]+"|property="(?:og:[^"]+|article:[^"]+)")[^\n]*\n/gm, '')
    .replace(/^\s*<link rel="canonical"[^\n]*\n/gm, '')
    .replace(/^\s*<meta name="citation_[^"]+"[^\n]*\n/gm, '')
    .replace(/<title>[^<]*<\/title>/, '')
}
function injectRoot(source,body) {
  const start = source.indexOf('<div id="root">')
  const bodyEnd = source.indexOf('</body>',start)
  const end = source.lastIndexOf('</div>',bodyEnd)
  if (start < 0 || bodyEnd < 0 || end < start) throw Error('Missing known React root/body boundary')
  return source.slice(0,start)+'<div id="root">'+body+'</div>'+source.slice(end+6)
}
function replacePage(source, { title, head, body }) {
  return injectRoot(scrubHomepage(source)
    .replace('</head>','  <title>' + escape(title) + '</title>\n  ' + head + '\n</head>'),body)
}
async function createPages() {
  const source = await readFile(join(DIST,'index.html'),'utf8')
  const manifest = JSON.parse((await tryFile(manifestFile))?.toString() || '{}')
  const seen = new Set()
  const pdfAvailable = {}
  for (const paper of papers) {
    if (!slugOK(paper.id) || seen.has(paper.id)) throw Error('Invalid or duplicate manuscript identifier: ' + paper.id)
    seen.add(paper.id)
    if (!paper.abstract?.trim() || paper.abstract.trim().length < 150) throw Error('Incomplete author abstract: ' + paper.id)
    if (!paper.metadata.title?.trim() || !paper.metadata.authors.length ||
        paper.metadata.authors.some(author=>!author.name.trim())) throw Error('Missing title or author(s): ' + paper.id)
    const publishedYear = getYear(paper)
    const directory = join(DIST, relativePaperPath(paper.id))
    await mkdir(directory, {recursive:true})
    const pdfMatches = await validPdf(paper, manifest)
    const abstractData = await tryFile(join(PUBLIC,'research',paper.id,'abstract.json'))
    const snapshot = abstractData ? JSON.parse(abstractData.toString('utf8')) : null
    const valid = Boolean(pdfMatches && snapshot?.fingerprint === manifest[paper.id]?.fingerprint &&
      Array.isArray(snapshot.paragraphs) && snapshot.paragraphs.length >= 2 &&
      snapshot.paragraphs.join(' ').length >= 300)
    const abstractParagraphs = valid ? snapshot.paragraphs : [paper.abstract]
    pdfAvailable[paper.id] = valid
    // A draft may be listed in the manuscript library without being advertised
    // to Google Scholar as a public preprint. Keep a crawlable route for readers.
    const indexable = paper.indexable !== false
    const tags = [
      '<link rel="canonical" href="' + escape(url(relativePaperPath(paper.id))) + '" />',
      meta('description',paper.abstract),
      ...(indexable ? [meta('citation_title',paper.metadata.title),
        ...paper.metadata.authors.map(author=>meta('citation_author',author.name)),
        meta('citation_publication_date',publishedYear),
        ...(paper.metadata.doi ? [meta('citation_doi',paper.metadata.doi)] : []),
        ...(valid ? [meta('citation_pdf_url',url(relativePaperPath(paper.id) + 'manuscript.pdf'))] : [])] : []),
      meta('robots',indexable ? 'index, follow, max-snippet:-1' : 'noindex, follow'),
    ].join('\n  ')
    const html = replacePage(source,{
      title:paper.metadata.title + ' | thelabjournal™',
      head:tags,
      body:staticPaper(paper, valid, abstractParagraphs),
    })
    if ((indexable && !html.includes('citation_title')) ||
        (!indexable && html.includes('name="citation_title"')) ||
        !html.includes('id="scholar-title"')) throw Error('Manuscript HTML generation failed')
    await writeFile(join(directory,'index.html'),html)
    console.log('Manuscript page: '+paper.id+' (PDF: '+(valid?'verified':'not linked')+')')
  }
  const index = replacePage(source,{
    title:'Research manuscripts | thelabjournal™',
    head:'<link rel="canonical" href="' + url('research/') + '" />\n  ' +
      meta('description','TheLabJournal independent scientific manuscripts and applied research.'),
    body:staticIndex(pdfAvailable),
  })
  await mkdir(join(DIST,'research'),{recursive:true})
  await writeFile(join(DIST,'research','index.html'),index)
  const availabilityJSON = JSON.stringify(pdfAvailable,null,2)+'\n'
  await writeFile(join(DIST,'research','pdf-availability.json'),availabilityJSON)
  // The Vite development reader uses public/ directly, unlike production
  // static HTML builds; keep the conditional PDF action functional in both.
  await mkdir(join(PUBLIC,'research'),{recursive:true})
  await writeFile(join(PUBLIC,'research','pdf-availability.json'),availabilityJSON)
  // Seed the homepage with an ordinary HTML link so a no-JS crawler can reach
  // the manuscript index within one hop; the React app replaces this fallback.
  const home = injectRoot(source,'<main style="' + style +
    '"><h1>thelabjournal™</h1><p>Independent research and a personal journal.</p><nav>' +
    link(BASE+'research/','Research manuscripts') + ' · ' + link(BASE+'quotes/','Quotes') + '</nav></main>')
  await writeFile(join(DIST,'index.html'),home)
  const sitemap = [
    {path:'', date:null},
    {path:'research/', date:null},
    {path:'quotes/', date:null},
    ...publishedQuotes.map(q=>({path:'quotes/'+q.id+'/',date:q.addedAt})),
    ...publishedCollections.map(c=>({path:'quotes/collections/'+c.id+'/',date:null})),
    ...papers.filter(p => p.indexable !== false).map(p=>({path:relativePaperPath(p.id), date:p.lastModified})),
    ...entries.map(e=>({path:'posts/'+e.slug+'/',date:e.date}))
  ]
  await writeFile(join(DIST,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemap.map(({path,date})=>'  <url><loc>'+escape(url(path))+'</loc>'+
      (date?'<lastmod>'+escape(date)+'</lastmod>':'')+'</url>').join('\n') + '\n</urlset>\n')
  await writeFile(join(DIST,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+url('sitemap.xml')+'\n')
  console.log('Generated Scholar-safe static manuscript index, '+papers.length+' pages, sitemap and robots.txt.')
}
async function audit() {
  const homepage = await readFile(join(DIST,'index.html'),'utf8')
  const index = await readFile(join(DIST,'research','index.html'),'utf8')
  const sitemap = await readFile(join(DIST,'sitemap.xml'),'utf8')
  assert.ok(homepage.includes('href="'+BASE+'research/"'),'Homepage must link to manuscripts without JavaScript')
  assert.ok(!homepage.includes('citation_title'),'Homepage must not claim to be scholarly article')
  assert.ok(!index.includes('citation_title'),'Manuscript index is not a scholarly article')
  const manifest = JSON.parse((await tryFile(manifestFile))?.toString() || '{}')
  for (const paper of papers) {
    const path = relativePaperPath(paper.id)
    const html = await readFile(join(DIST,path,'index.html'),'utf8')
    const indexable = paper.indexable !== false
    const required = [
      'rel="canonical" href="'+url(path)+'"',
      escape(paper.abstract),'<h2>Abstract</h2>', 'data-publication-type="manuscript"',
    ]
    if (indexable) {
      required.push('name="citation_title" content="'+escape(paper.metadata.title)+'"',
        'name="citation_publication_date" content="'+getYear(paper)+'"')
      for (const author of paper.metadata.authors) required.push('name="citation_author" content="'+escape(author.name)+'"')
    } else {
      required.push('name="robots" content="noindex, follow"')
      assert.ok(!html.includes('name="citation_title"'),paper.id+' draft must not carry scholar citation tags')
      assert.ok(!sitemap.includes('<loc>'+url(path)+'</loc>'),paper.id+' draft must not enter sitemap')
    }
    for (const marker of required) assert.ok(html.includes(marker),paper.id+' missing '+marker.slice(0,120))
    assert.ok(index.includes('href="'+BASE+path+'"'),paper.id+' missing from plain HTML research index')
    if (indexable) assert.ok(sitemap.includes('<loc>'+url(path)+'</loc>'),paper.id+' missing sitemap URL')
    const pdfMatches = await validPdf(paper,manifest)
    const abstractData = await tryFile(join(PUBLIC,'research',paper.id,'abstract.json'))
    const snapshot = abstractData ? JSON.parse(abstractData.toString('utf8')) : null
    const pdf = Boolean(pdfMatches && snapshot?.fingerprint === manifest[paper.id]?.fingerprint &&
      Array.isArray(snapshot.paragraphs) && snapshot.paragraphs.length >= 2 &&
      snapshot.paragraphs.join(' ').length >= 300)
    if(pdf) {
      for(const paragraph of snapshot.paragraphs)
        assert.ok(html.includes(escape(paragraph)),paper.id+' HTML omits part of the complete author abstract')
    }
    assert.equal(html.includes('name="citation_pdf_url"'),pdf,paper.id+' PDF link must require validated, current text PDF')
    if (pdf) {
      const diskPdf = await tryFile(join(DIST,path,'manuscript.pdf'))
      assert.ok(diskPdf, 'PDF missing from dist: '+paper.id)
      assert.ok(diskPdf.length <= PDF_LIMIT,'PDF exceeds 5 MB: '+paper.id)
    }
  }
  for (const journal of entries) {
    const html = await readFile(join(DIST,'posts',journal.slug,'index.html'),'utf8')
    assert.ok(!html.includes('name="citation_title"'),'Journal post incorrectly labeled Scholar manuscript: '+journal.slug)
    assert.ok(!html.includes('name="citation_author"'),'Journal post has scholarly author metadata: '+journal.slug)
  }
  console.log('Scholar audit passed: '+papers.length+' manuscript-only citation pages, plain-HTML discovery, journal separation, PDF gating.')
}
if (process.argv[1] && import.meta.path === resolve(process.argv[1])) {
  const action = process.argv[2]
  if (action === 'generate') await createPages()
  else if (action === 'audit') await audit()
  else throw Error('Usage: bun scripts/scholar-pages.mjs generate|audit')
}
