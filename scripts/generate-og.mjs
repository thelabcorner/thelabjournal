/**
 * Deterministic social artwork built with Vercel Satori + Resvg.
 *
 * Visual language: Inter ONLY, zinc grayscale, hairline rules, restrained
 * technical detail, and programmatic ordered-dot dithering. No raster photos,
 * generative models, serif fonts, monospace fonts, gradients, or remote assets.
 *
 * Run: bun run generate:og
 */
import { createElement as h } from 'react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { BRAND_MARK_FILL, BRAND_MARK_OUTLINE, BRAND_MARK_STROKE } from '../src/lib/brandMark.ts'

const WIDTH = 1200
const HEIGHT = 630
const OUT = new URL('../public/', import.meta.url)
const SOURCE_PREVIEW = new URL('../artifacts/og-image.svg', import.meta.url)
const ink = '#f4f4f5'
const muted = '#a1a1aa'
const zinc = '#52525b'

const hash = (a, b, c = 0) => {
  let x = Math.imul(a + 199, 374761393) ^ Math.imul(b + 17, 668265263) ^ Math.imul(c + 7, 2246822519)
  x = Math.imul(x ^ (x >>> 13), 1274126177)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}
const clamp = x => Math.max(0, Math.min(1, x))
const fmt = n => Number(n.toFixed(2))
const uri = xml => 'data:image/svg+xml;base64,' + Buffer.from(xml).toString('base64')

// A technically restrained surface: irregular ordered-dot register, engraved
// hemisphere and sparse survey marks. Cell occupancy is seeded and fixed so CI
// builds always generate the same image. All stippling is mathematically drawn.
function ditherSvg() {
  const dots = []
  for (let y = 27, row = 0; y < HEIGHT - 20; y += 16, row++) {
    for (let x = 26, col = 0; x < WIDTH - 23; x += 16, col++) {
      const chance = hash(col, row, 4)
      if (chance < 0.22) continue
      const region = x < 760 ? .075 : .11
      const opacity = region + chance * .10
      dots.push(`<rect x="${x}" y="${y}" width="1.15" height="1.15" fill="#d4d4d8" opacity="${fmt(opacity)}"/>`)
    }
  }

  // A halftone research globe, shifted outside the card boundary so that the
  // typography owns the left side. Curvature and ring stratification are math,
  // not an image-generation model or a photographic overlay.
  const cx = 1052
  const cy = 362
  const rx = 374
  const ry = 392
  for (let y = 8, iy = 0; y <= HEIGHT - 10; y += 5.8, iy++) {
    for (let x = 685, ix = 0; x <= WIDTH - 12; x += 5.8, ix++) {
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const r2 = dx * dx + dy * dy
      if (r2 > 1) continue
      const rng = hash(ix, iy, 15)
      const sphereNormal = Math.sqrt(1 - r2)
      const longitude = Math.sin((dx * 11.5 + dy * 1.5) * 5.2)
      const latitude = Math.cos((dy * 13 + dx * 2.1) * 2.0)
      const terrain = (Math.sin(x * .049 + Math.cos(y * .023) * 1.5) + Math.sin(y * .078 + x * .028)) * .5
      const edge = Math.pow(1 - sphereNormal, .8)
      const frequency = clamp(.21 + edge * .45 + terrain * .11 + longitude * .07 + latitude * .04)
      if (rng > frequency) continue
      const fade = clamp((x - 745) / 185)
      const strength = (.21 + edge * .30 + (rng * .11)) * fade
      dots.push(`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(1.35 + edge * 1.25)}" height="${fmt(1.35 + edge * 1.25)}" fill="#d4d4d8" opacity="${fmt(strength)}"/>`)
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#101012"/>
  <path d="M822 28V602 M1160 28V602 M22 131H1178" fill="none" stroke="#71717a" stroke-opacity=".14" stroke-width="1"/>
  ${dots.join('')}
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#a1a1aa" stroke-opacity=".22" stroke-width="1"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx * .78}" ry="${ry}" fill="none" stroke="#71717a" stroke-opacity=".09" stroke-width=".7"/>
  <path d="M918 134h108 M972 80v108 M1120 486h64 M1152 455v64 M726 533h38 M745 514v38" fill="none" stroke="#d4d4d8" stroke-opacity=".22" stroke-width=".9"/>
  <rect x="1019" y="127" width="9" height="9" fill="none" stroke="#a1a1aa" stroke-opacity=".4"/>
  <rect x="1128" y="492" width="6" height="6" fill="#a1a1aa" opacity=".45"/>
  </svg>`
}

// The same four tiles used in the navigation. No separate social-only mark.
const glyph = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
  <g fill="none"><path d="${BRAND_MARK_OUTLINE}" stroke="${ink}" stroke-width="${BRAND_MARK_STROKE}"/><path d="${BRAND_MARK_FILL}" fill="${ink}"/></g>
</svg>`)

const txt = (content, style) => h('div', { style: { display: 'flex', fontFamily: 'Inter', ...style } }, content)
const chip = value => h('div', {
  style: {
    display: 'flex', height: 39, alignItems: 'center', justifyContent: 'center',
    paddingLeft: 19, paddingRight: 19, color: '#d4d4d8',
    border: '1px solid #52525b', borderRadius: 7, fontFamily: 'Inter',
    fontSize: 16, fontWeight: 500, letterSpacing: .4,
    backgroundColor: '#161618',
  }
}, value)

const foreground = h('div', {
  style: { display: 'flex', position: 'relative', width: WIDTH, height: HEIGHT, backgroundColor: '#101012', color: ink, fontFamily: 'Inter' }
},
  h('img', { src: uri(ditherSvg()), width: WIDTH, height: HEIGHT, style: { position: 'absolute', left: 0, top: 0 } }),
  h('div', { style: { display: 'flex', position: 'absolute', left: 16, top: 16, width: 1168, height: 598, border: '1px solid #52525b', borderRadius: 13 } }),

  // Identity / masthead: horizontal editorial system with no display serif.
  h('div', { style: { display: 'flex', position: 'absolute', left: 72, top: 63, width: 1056, justifyContent: 'space-between', alignItems: 'center' } },
    h('div', { style: { display: 'flex', alignItems: 'center' } },
      h('img', { src: glyph, width: 52, height: 52 }),
      h('div', { style: { display: 'flex', width: 1, height: 37, backgroundColor: '#52525b', marginLeft: 19, marginRight: 20 } }),
      txt('THELABJOURNAL', { color: '#e4e4e7', fontSize: 17, fontWeight: 600, letterSpacing: 2.4 })
    ),
    txt('INDEPENDENT RESEARCH  /  2026', { color: '#a1a1aa', fontSize: 12, fontWeight: 500, letterSpacing: 1.7 })
  ),

  // Strong Inter-only title. The trademark is part of the actual brand string.
  h('div', { style: { position: 'absolute', display: 'flex', flexDirection: 'column', left: 74, top: 207, width: 1060 } },
    h('div', { style: { display: 'flex', alignItems: 'flex-start' } },
      txt('thelabjournal', { fontSize: 103, fontWeight: 700, letterSpacing: -5.9, lineHeight: 1.13, color: '#fafafa' }),
      txt('™', { fontSize: 26, fontWeight: 600, marginTop: 9, marginLeft: 7, color: '#fafafa' })
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 14 } },
      txt('Independent research, engineering notes,', { fontSize: 28, fontWeight: 400, color: '#d4d4d8', letterSpacing: -.75, lineHeight: 1.45 }),
      txt('and essays from the workbench.', { fontSize: 28, fontWeight: 400, color: '#d4d4d8', letterSpacing: -.75, lineHeight: 1.45 })
    ),
    h('div', { style: { display: 'flex', marginTop: 28, gap: 10 } },
      chip('Research'), chip('Engineering'), chip('Essays')
    )
  ),

  h('div', { style: { display: 'flex', position: 'absolute', left: 72, top: 545, width: 1056, height: 1, backgroundColor: '#52525b' } }),
  h('div', { style: { display: 'flex', position: 'absolute', left: 72, top: 564, width: 1056, justifyContent: 'space-between', alignItems: 'center' } },
    txt('thelabcorner.github.io/thelabjournal', { color: muted, fontSize: 16, fontWeight: 500, letterSpacing: .45 }),
    txt('VOL. 01    /    WORKBENCH', { color: '#a1a1aa', fontSize: 12, fontWeight: 500, letterSpacing: 1.9 })
  )
)

const fonts = []
for (const weight of [400, 500, 600, 700]) {
  const data = await readFile(new URL(`../node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`, import.meta.url))
  fonts.push({ name: 'Inter', data, weight, style: 'normal' })
}

const svg = await satori(foreground, {
  width: WIDTH, height: HEIGHT, fonts, embedFont: true, pointScaleFactor: 2,
})
const png = new Resvg(svg, { fitTo: { mode: 'original' }, background: '#101012' }).render().asPng()
// Keep the heavy outlined SVG for local inspection, not in the deployed
// service-worker precache. Only the compact 1200×630 PNG is needed by crawlers.
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true })
await writeFile(SOURCE_PREVIEW, svg)
await writeFile(new URL('og-image.png', OUT), png)
console.log(JSON.stringify({
  generator: 'satori + resvg', typography: 'Inter sans-serif only',
  dimensions: `${WIDTH}x${HEIGHT}`, svgBytes: Buffer.byteLength(svg),
  pngBytes: png.length, deterministic: true,
}))