/** Deterministic, static quote publishing. No quote is invented or inferred.
 * Generates crawlable metadata, an HTML no-script excerpt and a branded OG
 * image for every published quote. Never emits manuscript citation_* tags.
 */
import { createElement as h } from 'react'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { authorName, publishedQuotes, publishedCollections } from '../src/quotes/data.ts'

const ROOT = resolve(import.meta.dir, '..')
const DIST = join(ROOT, 'dist')
const BASE = 'https://journal.thedabcorner.site/'
const W = 1200, H = 630
const escape = text => String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
const trim = (text, length) => text.length <= length ? text : text.slice(0, length - 1).replace(/\s+\S*$/, '') + '…'
const canonical = path => BASE + path
const meta = (attribute, key, value) => '<meta ' + attribute + '="' + key + '" content="' + escape(value) + '" />'
const e = (tag, style, ...children) => h(tag, { style }, ...children)
const tx = (value, style = {}) => e('div', { display: 'flex', fontFamily: 'Inter', ...style }, String(value))
const textTitle = quote => trim(quote.text, 105)
const description = quote => trim(quote.text.replace(/\s+/g, ' '), 180)

export async function makeArtwork(quote) {
  const content = trim(quote.text, 290)
  const fontSize = content.length > 240 ? 28 : content.length > 160 ? 34 : content.length > 100 ? 41 : 48
  const doc = e('div', { width: W, height: H, display: 'flex', flexDirection: 'column', padding: 68, backgroundColor: '#101012', color: '#f4f4f5', fontFamily: 'Inter' },
    e('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3f3f46', paddingBottom: 24 },
      tx('thelabjournal™', { fontSize: 22, fontWeight: 700, letterSpacing: -.8 }),
      tx(quote.authorId === 'jackson-cummings' ? 'Original quotation' : 'Collected quotation', { fontSize: 13, fontWeight: 600, color: '#a1a1aa' })
    ),
    e('div', { display: 'flex', alignItems: 'center', flex: 1, width: 1050, overflow: 'hidden' },
      tx(content, { fontSize, fontWeight: 500, lineHeight: 1.3, letterSpacing: -1, color: '#fafafa', maxHeight: 360, overflow: 'hidden', wordBreak: 'break-word' })
    ),
    e('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid #3f3f46' },
      tx(authorName(quote.authorId), { fontSize: 17, color: '#d4d4d8', fontWeight: 500 }),
      tx('journal.thedabcorner.site', { fontSize: 13, color: '#a1a1aa' })
    )
  )
  const fonts = await Promise.all([500,600,700].map(async weight => ({
    name: 'Inter', weight, style: 'normal',
    data: await readFile(join(ROOT, 'node_modules','@fontsource','inter','files','inter-latin-' + weight + '-normal.woff')),
  })))
  const svg = await satori(doc, { width: W, height: H, fonts })
  return new Resvg(svg, { fitTo: { mode: 'original' }, background: '#101012' }).render().asPng()
}

function metadata({ title, summary, path, image, quote }) {
  const url = canonical(path)
  const imageUrl = canonical(image)
  const label = quote ? 'A quotation attributed to ' + authorName(quote.authorId) + ' in thelabjournal™' : title + ' in thelabjournal™'
  const tags = [
    '<link rel="canonical" href="' + escape(url) + '" />',
    meta('name', 'description', summary),
    meta('property','og:type','website'),
    meta('property','og:site_name','thelabjournal™'),
    meta('property','og:url',url),
    meta('property','og:title',title),
    meta('property','og:description',summary),
    meta('property','og:image',imageUrl),
    meta('property','og:image:secure_url',imageUrl),
    meta('property','og:image:type','image/png'),
    meta('property','og:image:width',1200),
    meta('property','og:image:height',630),
    meta('property','og:image:alt',label),
    meta('name','twitter:card','summary_large_image'),
    meta('name','twitter:title',title),
    meta('name','twitter:description',summary),
    meta('name','twitter:image',imageUrl),
    meta('name','twitter:img:src',imageUrl),
  ]
  // addedAt is the editorial registry date, not a proven publication date.
  // Quotation authorship is attribution, not article-author metadata.
  return tags.join('\n  ')
}

async function generate() {
  const index = await readFile(join(DIST,'index.html'),'utf8')
  const blank = index.replace(/^\s*<meta (?:name="description"|name="twitter:[^"]+"|property="(?:og:[^"]+|article:[^"]+)")[^\n]*\n/gm,'')
    .replace(/^\s*<link rel="canonical"[^\n]*\n/gm,'')
    .replace(/<title>[^<]*<\/title>/,'')
  // Remove only generated build output. Never touch editorial source registries.
  await rm(join(DIST,'quotes'), { recursive: true, force: true })
  await rm(join(DIST,'og','quotes'), { recursive: true, force: true })
  const create = async ({ title, summary, path, quote, body, image }) => {
    const head = '<title>' + escape(title) + ' | thelabjournal™</title>\n  ' + metadata({ title, summary, path, image, quote })
    const fallback = '<noscript><main style="max-width:740px;margin:5rem auto;padding:2rem;font-family:Inter,sans-serif"><h1>' +
      escape(title) + '</h1>' + body + '<p><a href="' + escape(canonical(path)) + '">thelabjournal™</a></p></main></noscript>'
    // The Vite build carries a static homepage fallback *inside* #root.
    // Remove that homepage-specific prose on all quote routes.
    const html = blank.replace('</head>', '  ' + head + '\n</head>')
      .replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>' + fallback)
    const dest = join(DIST, path, 'index.html')
    await mkdir(join(DIST,path), { recursive: true })
    await writeFile(dest, html, 'utf8')
  }
  await create({ title: 'Quotes', summary: 'Original quotations and collected passages in thelabjournal™.',
    path: 'quotes/', image: 'og-image.png?v=1', body: '<p>Original words and curated quotations.</p>' })
  for (const collection of publishedCollections) {
    await create({ title: collection.title, summary: trim(collection.description || 'A curated quote collection in thelabjournal™.',180),
      path: 'quotes/collections/' + collection.id + '/', image: 'og-image.png?v=1',
      body: '<p>' + escape(collection.description || '') + '</p><ul>' +
        collection.quoteIds.map(id => '<li><a href="' + escape(canonical('quotes/' + id + '/')) + '">' + escape(id) + '</a></li>').join('') + '</ul>' })
  }
  for (const quote of publishedQuotes) {
    const png = await makeArtwork(quote)
    const digest = createHash('sha256').update(png).digest('hex').slice(0,12)
    const dir = join(DIST,'og','quotes')
    await mkdir(dir,{ recursive: true })
    await writeFile(join(dir,quote.id + '.png'),png)
    const source = quote.source
      ? '<p>Source: ' + escape([quote.source.kind,quote.source.title,quote.source.locator].filter(Boolean).join(' · ')) + '</p>' : ''
    await create({ title: textTitle(quote), summary: description(quote), quote, path: 'quotes/' + quote.id + '/',
      image: 'og/quotes/' + quote.id + '.png?v=' + digest,
      body: '<blockquote><p>' + escape(quote.text) + '</p></blockquote><p>— ' + escape(authorName(quote.authorId)) + '</p>' +
        source })
  }
  console.log('Quotes: generated library, ' + publishedCollections.length + ' collection pages and ' + publishedQuotes.length + ' quotations/social cards.')
}

async function audit() {
  const paths = ['quotes/', ...publishedQuotes.map(q => 'quotes/' + q.id + '/'),
    ...publishedCollections.map(c => 'quotes/collections/' + c.id + '/')]
  const sitemap = await readFile(join(DIST,'sitemap.xml'),'utf8')
  for (const path of paths) {
    const html = await readFile(join(DIST,path,'index.html'),'utf8')
    const url = canonical(path)
    if (!html.includes('rel="canonical" href="' + url + '"') || !html.includes('og:title') || !html.includes('<noscript>'))
      throw Error('Missing canonical/metadata/no-script content for ' + path)
    if (!sitemap.includes('<loc>' + url + '</loc>')) throw Error('Quote missing from sitemap: ' + path)
    if (html.includes('citation_title') || html.includes('citation_pdf_url'))
      throw Error('Quotes must not receive scholarly citation tags: ' + path)
    if (path.startsWith('quotes/') && path !== 'quotes/' && !path.startsWith('quotes/collections/')) {
      const id = path.slice(7).replace(/\/$/,'')
      const bytes = await readFile(join(DIST,'og','quotes',id + '.png'))
      if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
        throw Error('Invalid quotation social image: ' + id)
    }
  }
  console.log('Quotes: ' + paths.length + ' static routes audited, metadata/OG provenance OK.')
}

if (import.meta.main) {
  const action = process.argv[2]
  if (action === 'generate') await generate()
  else if (action === 'audit') await audit()
  else throw Error('Usage: bun scripts/quote-pages.mjs generate|audit')
}
