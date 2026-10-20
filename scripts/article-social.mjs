/**
 * Journal social artwork and crawlable static route pages.
 * bun scripts/article-social.mjs generate|pages|audit|audit-determinism
 * "generate" enumerates every entry from the canonical website registry.
 * A new article automatically receives a unique Satori OG card and page.
 */
import { createElement as h } from 'react'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, readdir, rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { entries } from '../src/data.ts'
import { BRAND_MARK_FILL, BRAND_MARK_OUTLINE, BRAND_MARK_STROKE } from '../src/lib/brandMark.ts'

const W = 1200, H = 630
const ROOT = resolve(import.meta.dir, '..')
const PUBLIC = join(ROOT, 'public', 'og', 'articles')
const DIST = join(ROOT, 'dist')
// Cloudflare is the canonical journal origin. GitHub Pages remains a mirror.
const BASE = 'https://journal.thedabcorner.site/'
const APP_ASSET_BASE = process.env.GITHUB_PAGES === 'true' ? '/thelabjournal/' : '/'
const colors = {
  bg: '#101012', surface: '#18181b', paper: '#fafafa', text: '#e4e4e7',
  muted: '#a1a1aa', quiet: '#71717a', line: '#3f3f46', subtle: '#27272a',
}
const sha = data => createHash('sha256').update(data).digest('hex')
const utf = value => String(value)
const el = (tag, style, ...children) => h(tag, { style }, ...children)
const text = (value, style = {}) => el('div', { display: 'flex', fontFamily: 'Inter', ...style }, utf(value))
const svgData = svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
const htmlEscape = value => utf(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeSlug = slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
const issue = entry => entry.issue.replace(/[^A-Za-z0-9–-]/g, '')
const shortDate = value => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value + 'T12:00:00Z'))
const trim = (value, length) => value.length <= length ? value : value.slice(0, length - 1).replace(/\s+\S*$/, '') + '…'
const quoteMeta = (type, key, val) => '<meta ' + type + '="' + key + '" content="' + htmlEscape(val) + '" />'
const description = entry => trim(entry.summary, 190)

function validate() {
  if (!entries.length) throw Error('No entries available for social rendering')
  const seen = new Set()
  for (const e of entries) {
    if (!safeSlug(e.slug) || seen.has(e.slug)) throw Error('Invalid or duplicate article slug: ' + e.slug)
    if (!e.title || !e.summary || !e.date || !e.topic || !e.issue) throw Error('Incomplete article OG metadata: ' + e.slug)
    if (Number.isNaN(new Date(e.date + 'T12:00:00Z').getTime())) throw Error('Invalid article date: ' + e.slug)
    seen.add(e.slug)
  }
}
validate()

// Technical artwork is actually derived from the research domain of each entry.
// The seeded halftone and field geometry stay fixed for repeated CI builds.
function hash(n) {
  let x = n | 0
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  return (x ^ (x >>> 16)) >>> 0
}
function motif(entry) {
  const seed = hash([...entry.slug].reduce((v, c) => Math.imul(v, 31) + c.charCodeAt(0) | 0, 811))
  const part = [], type = entry.figure
  const r = x => Math.round(x * 100) / 100
  for (let y = 12; y <= 408; y += 12) {
    for (let x = 8; x <= 326; x += 12) {
      const score = hash(seed ^ Math.imul(x + 11, 2654435761) ^ Math.imul(y + 19, 1597334677)) / 4294967295
      const dx = (x - 166) / 159, dy = (y - 205) / 172
      const field = Math.max(0, 1 - (dx * dx + dy * dy))
      if (score > .16 + field * .44) continue
      part.push('<rect x="' + x + '" y="' + y + '" width="' + r(1.1 + field * 1.4) + '" height="' + r(1.1 + field * 1.4) + '" fill="#a1a1aa" opacity="' + r(.11 + field * .32) + '"/>')
    }
  }
  part.push('<path d="M0 98H336 M0 209H336 M0 320H336 M85 0V425 M205 0V425" stroke="#71717a" stroke-opacity=".18" stroke-width="1"/>')
  if (type === 'pdf' || type === 'learning') {
    for (let i = 0; i < 4; i++) {
      const x = 54 + i * 23, y = 76 + i * 28
      part.push('<path d="M' + x + ' ' + y + 'h160v210h-160z M' + (x + 22) + ' ' + (y + 42) + 'h90 M' + (x + 22) + ' ' + (y + 68) + 'h115 M' + (x + 22) + ' ' + (y + 94) + 'h84" fill="none" stroke="#e4e4e7" stroke-opacity="' + r(.24 + i * .16) + '" stroke-width="1.2"/>')
    }
  } else if (type === 'contours' || type === 'geometry') {
    for (let i = 0; i < 6; i++) {
      part.push('<ellipse cx="174" cy="215" rx="' + (38 + i * 22) + '" ry="' + (64 + i * 25) + '" transform="rotate(-29 174 215)" fill="none" stroke="#d4d4d8" stroke-opacity="' + r(.55 - i * .057) + '" stroke-width="1.25"/>')
    }
  } else if (type === 'storage' || type === 'tokens') {
    for (let row = 0; row < 8; row++) for (let col = 0; col < 5; col++) {
      const on = hash(seed ^ row * 7717 ^ col * 733) % 4 !== 0
      part.push('<rect x="' + (41 + col * 54) + '" y="' + (68 + row * 36) + '" width="42" height="23" rx="2" fill="' + (on ? '#52525b' : 'none') + '" fill-opacity=".28" stroke="#d4d4d8" stroke-opacity="' + (on ? '.46' : '.14') + '"/>')
    }
  } else if (type === 'agent' || type === 'system') {
    for (let i = 0; i < 5; i++) {
      const y = 66 + i * 65
      part.push('<path d="M78 ' + y + 'H280 M78 ' + y + 'V' + (y + 45) + '" stroke="#71717a" stroke-opacity=".5" fill="none"/>')
      part.push('<rect x="' + (i % 2 ? 135 : 34) + '" y="' + y + '" width="102" height="43" rx="4" stroke="#d4d4d8" stroke-opacity=".67" fill="#27272a" fill-opacity=".6"/>')
      part.push('<circle cx="' + (i % 2 ? 152 : 52) + '" cy="' + (y + 21) + '" r="5" fill="#e4e4e7" opacity=".7"/>')
    }
  } else {
    for (let line = 0; line < 5; line++) {
      const points = []
      for (let x = 6; x <= 332; x += 4) {
        const y = 125 + line * 43 + Math.sin(x / (18 + line * 8) + line * 1.4) * (31 - line * 4) + Math.sin(x / 9 + line) * 8
        points.push((x === 6 ? 'M' : 'L') + x + ' ' + r(y))
      }
      part.push('<path d="' + points.join(' ') + '" stroke="#d4d4d8" stroke-opacity="' + r(.64 - line * .09) + '" stroke-width="1.4" fill="none"/>')
    }
  }
  part.push('<path d="M0 15H38 M15 0V38 M297 408h39 M320 391v34" stroke="#fafafa" stroke-opacity=".36" stroke-width="1"/>')
  return '<svg xmlns="http://www.w3.org/2000/svg" width="336" height="425" viewBox="0 0 336 425">' + part.join('') + '</svg>'
}

const brandGlyph = svgData('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="' + BRAND_MARK_OUTLINE + '" stroke="#f4f4f5" stroke-width="' + BRAND_MARK_STROKE + '" fill="none"/><path d="' + BRAND_MARK_FILL + '" fill="#f4f4f5"/></svg>')
function titleFont(title) {
  if (title.length > 105) return 40
  if (title.length > 86) return 44
  if (title.length > 65) return 49
  if (title.length > 44) return 56
  return 66
}
function card(entry) {
  const title = entry.title
  return el('div', { display: 'flex', position: 'relative', width: W, height: H, backgroundColor: colors.bg, color: colors.text, fontFamily: 'Inter', overflow: 'hidden' },
    el('div', { position: 'absolute', left: 22, top: 22, width: 1156, height: 586, border: '1px solid #3f3f46', borderRadius: 10, display: 'flex' }),
    el('div', { position: 'absolute', display: 'flex', left: 70, top: 57, width: 1060, height: 51, alignItems: 'center' },
      h('img', { src: brandGlyph, width: 35, height: 35 }),
      el('div', { display: 'flex', backgroundColor: colors.line, width: 1, height: 30, marginLeft: 18, marginRight: 18 }),
      text('THELABJOURNAL', { fontSize: 15, fontWeight: 700, letterSpacing: 2.05 }),
      el('div', { display: 'flex', marginLeft: 'auto' }, text('INDEPENDENT RESEARCH  /  ' + entry.date.slice(0, 4), { fontSize: 12, letterSpacing: 1.6, fontWeight: 600, color: colors.muted }))
    ),
    el('div', { display: 'flex', position: 'absolute', left: 70, top: 133, width: 1060, height: 1, backgroundColor: colors.line }),
    el('div', { display: 'flex', position: 'absolute', left: 70, top: 167, width: 710, height: 32, alignItems: 'center' },
      text(entry.topic.toUpperCase() + '     /     ' + issue(entry).toUpperCase(), { fontSize: 14, color: colors.muted, letterSpacing: 2, fontWeight: 600 })
    ),
    el('div', { display: 'flex', position: 'absolute', left: 68, top: 213, width: 752, height: 255, flexDirection: 'column', overflow: 'hidden', justifyContent: 'center' },
      text(title, { display: 'flex', maxHeight: 255, width: 740, color: colors.paper, fontSize: titleFont(title), fontWeight: 700, lineHeight: 1.13, letterSpacing: -1.85, wordBreak: 'break-word', overflow: 'hidden' })
    ),
    el('div', { display: 'flex', position: 'absolute', left: 70, top: 477, width: 704, height: 59, overflow: 'hidden', alignItems: 'flex-start' },
      text(trim(entry.summary, 124), { color: '#a1a1aa', fontSize: 17, lineHeight: 1.45, letterSpacing: -.14, maxHeight: 58 })
    ),
    el('div', { display: 'flex', position: 'absolute', left: 837, top: 159, width: 301, height: 371, border: '1px solid #3f3f46', borderRadius: 6, overflow: 'hidden', backgroundColor: '#17171a' },
      h('img', { src: svgData(motif(entry)), width: 300, height: 370, style: { position: 'absolute', left: 0, top: 0, opacity: .95 } }),
      el('div', { display: 'flex', position: 'absolute', left: 20, top: 18, padding: '7px 10px', border: '1px solid #52525b', backgroundColor: '#18181b', borderRadius: 3 },
        text(entry.figure.toUpperCase() + '  /  FIG. 01', { fontSize: 10, color: '#e4e4e7', letterSpacing: 1.25, fontWeight: 600 })
      )
    ),
    el('div', { display: 'flex', position: 'absolute', left: 70, top: 554, width: 1060, height: 1, backgroundColor: colors.line }),
    el('div', { display: 'flex', position: 'absolute', left: 70, top: 570, width: 1060, height: 20, alignItems: 'center', justifyContent: 'space-between' },
      text('journal.thedabcorner.site', { fontSize: 14, color: colors.muted, letterSpacing: .15, fontWeight: 500 }),
      text(shortDate(entry.date).toUpperCase() + '    /    ' + entry.minutes + ' MIN READ', { fontSize: 12, letterSpacing: 1.4, color: colors.muted, fontWeight: 600 })
    )
  )
}
let fontCache
async function fonts() {
  if (fontCache) return fontCache
  fontCache = await Promise.all([400, 500, 600, 700].map(async weight => ({
    name: 'Inter',
    data: await readFile(join(ROOT, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-' + weight + '-normal.woff')),
    weight, style: 'normal',
  })))
  return fontCache
}
async function render(entry) {
  const svg = await satori(card(entry), { width: W, height: H, fonts: await fonts(), embedFont: true, pointScaleFactor: 2 })
  const png = new Resvg(svg, { fitTo: { mode: 'original' }, background: colors.bg }).render().asPng()
  return { png, svg }
}
async function generate() {
  await rm(PUBLIC, { recursive: true, force: true })
  await mkdir(PUBLIC, { recursive: true })
  const fingerprints = {}
  for (const entry of entries) {
    const { png } = await render(entry)
    await writeFile(join(PUBLIC, entry.slug + '.png'), png)
    fingerprints[entry.slug] = sha(png).slice(0, 16)
    console.log('OG ' + entry.slug + ': ' + png.length + ' bytes')
  }
  await writeFile(join(PUBLIC, 'manifest.json'), JSON.stringify(fingerprints, null, 2) + '\n')
  return fingerprints
}
function metadata(entry, imageHash) {
  const canonical = BASE + 'posts/' + entry.slug + '/'
  const imageUrl = BASE + 'og/articles/' + entry.slug + '.png?v=' + imageHash
  const label = entry.title + '. An article from thelabjournal by Jackson Cummings.'
  return [
    '<link rel="canonical" href="' + htmlEscape(canonical) + '" />',
    '<meta name="description" content="' + htmlEscape(description(entry)) + '" />',
    quoteMeta('property', 'og:type', 'article'),
    quoteMeta('property', 'og:site_name', 'thelabjournal™'),
    quoteMeta('property', 'og:locale', 'en_US'),
    quoteMeta('property', 'og:url', canonical),
    quoteMeta('property', 'og:title', entry.title),
    quoteMeta('property', 'og:description', description(entry)),
    quoteMeta('property', 'article:published_time', entry.date),
    quoteMeta('property', 'article:author', 'Jackson Cummings'),
    ...entry.keywords.slice(0, 6).map(tag => quoteMeta('property', 'article:tag', tag)),
    quoteMeta('property', 'og:image', imageUrl),
    quoteMeta('property', 'og:image:secure_url', imageUrl),
    quoteMeta('property', 'og:image:type', 'image/png'),
    quoteMeta('property', 'og:image:width', W),
    quoteMeta('property', 'og:image:height', H),
    quoteMeta('property', 'og:image:alt', label),
    quoteMeta('name', 'twitter:card', 'summary_large_image'),
    quoteMeta('name', 'twitter:title', entry.title),
    quoteMeta('name', 'twitter:description', description(entry)),
    quoteMeta('name', 'twitter:image', imageUrl),
    // Snap's URL Preview Service supports a legacy Twitter fallback when OG is absent.
    // These aliases point to the same unique Satori artwork, not a second image.
    quoteMeta('name', 'twitter:img:src', imageUrl),
    quoteMeta('name', 'twitter:image:src', imageUrl),
    quoteMeta('name', 'twitter:image:alt', label),
  ].join('\n  ')
}
async function pages() {
  const index = await readFile(join(DIST, 'index.html'), 'utf8')
  const manifest = JSON.parse(await readFile(join(PUBLIC, 'manifest.json'), 'utf8'))
  // Strip homepage-only tags before inserting article metadata.
  const blank = index.replace(/^\s*<meta (?:name="description"|name="twitter:[^"]+"|property="(?:og:[^"]+|article:[^"]+)")[^\n]*\n/gm, '')
    .replace(/^\s*<link rel="canonical"[^\n]*\n/gm, '')
  for (const entry of entries) {
    const hash = manifest[entry.slug]
    if (!hash) throw Error('Missing generated article image: ' + entry.slug)
    const dir = join(DIST, 'posts', entry.slug)
    await mkdir(dir, { recursive: true })
    const head = '<title>' + htmlEscape(entry.title) + ' | thelabjournal™</title>\n  ' + metadata(entry, hash)
    let html = blank.replace(/<title>[^<]*<\/title>/, '').replace('</head>', '  ' + head + '\n</head>')
    if (!html.includes('og/articles/' + entry.slug + '.png')) throw Error('Failed to inject metadata: ' + entry.slug)
    await writeFile(join(dir, 'index.html'), html, 'utf8')
  }
  console.log('Generated ' + entries.length + ' crawler-readable article pages.')
}
async function audit() {
  const manifest = JSON.parse(await readFile(join(PUBLIC, 'manifest.json'), 'utf8'))
  const pngSignature = Buffer.from([137,80,78,71,13,10,26,10])
  const names = await readdir(PUBLIC)
  if (names.filter(name => name.endsWith('.png')).length !== entries.length) throw Error('OG image count mismatch')
  if (Object.keys(manifest).length !== entries.length) throw Error('OG manifest count mismatch')
  const ogUrls = new Set()
  for (const e of entries) {
    const file = join(PUBLIC, e.slug + '.png')
    const bytes = await readFile(file)
    if (!bytes.subarray(0,8).equals(pngSignature) || bytes.readUInt32BE(16) !== W || bytes.readUInt32BE(20) !== H) throw Error('Invalid OG PNG: ' + e.slug)
    if (bytes.length < 9000 || bytes.length > 1600000) throw Error('OG image suspicious size: ' + e.slug)
    if (sha(bytes).slice(0,16) !== manifest[e.slug]) throw Error('OG hash mismatch: ' + e.slug)
    const html = await readFile(join(DIST,'posts',e.slug,'index.html'),'utf8')
    const canonical = BASE+'posts/'+e.slug+'/'
    const imageUrl=BASE+'og/articles/'+e.slug+'.png?v='+manifest[e.slug]
    if (!html.includes('property="og:url" content="'+canonical+'"') ||
        !html.includes('property="og:image" content="'+imageUrl+'"') ||
        !html.includes('name="twitter:image" content="'+imageUrl+'"') ||
        !html.includes('name="twitter:img:src" content="'+imageUrl+'"') ||
        !html.includes('name="twitter:image:src" content="'+imageUrl+'"') ||
        !html.includes('property="og:image:secure_url" content="'+imageUrl+'"') ||
        !html.includes('property="og:image:width" content="'+W+'"') ||
        !html.includes('property="og:image:height" content="'+H+'"') ||
        !html.includes('property="og:image:alt" content="'+htmlEscape(e.title + '. An article from thelabjournal by Jackson Cummings.')+'"') ||
        !html.includes('property="og:type" content="article"') ||
        !html.includes('rel="canonical" href="'+canonical+'"') ||
        !html.includes('property="og:title" content="'+htmlEscape(e.title)+'"') ||
        !html.includes('property="og:description" content="'+htmlEscape(description(e))+'"') ||
        !html.includes('name="twitter:card" content="summary_large_image"') ||
        !html.includes('src="'+APP_ASSET_BASE+'assets/')) throw Error('Article page metadata or app bootstrap mismatch: '+e.slug)
    if (html.includes('/og-image.png?v=1') || html.includes('?post=')) throw Error('Generic OG metadata leaked into article: '+e.slug)
    if (ogUrls.has(imageUrl)) throw Error('Duplicate OG URL: '+imageUrl)
    ogUrls.add(imageUrl)
  }
  console.log('Article OG audit passed: '+entries.length+' unique images, crawlable URLs, metadata and entrypoints.')
}
async function determinism() {
  const manifest = JSON.parse(await readFile(join(PUBLIC,'manifest.json'),'utf8'))
  for (const e of entries) {
    const { png } = await render(e)
    if (sha(png).slice(0,16) !== manifest[e.slug]) throw Error('Nondeterministic article render: '+e.slug)
  }
  console.log('Article OG determinism verified for '+entries.length+' entries.')
}
const command = process.argv[2]
if (command === 'generate') await generate()
else if (command === 'pages') await pages()
else if (command === 'audit') await audit()
else if (command === 'audit-determinism') await determinism()
else throw Error('Expected generate, pages, audit, or audit-determinism')
