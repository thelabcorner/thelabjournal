import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { brandIconSvg, BRAND_MARK_FILL, BRAND_MARK_OUTLINE } from '../src/lib/brandMark.ts'

const publicUrl = new URL('../public/', import.meta.url)
const get = name => readFile(new URL(name, publicUrl))
const expected = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['icons/apple-touch-icon.png', 180],
  ['icons/icon-192.png', 192],
  ['icons/icon-512.png', 512],
  ['icons/icon-maskable-512.png', 512],
]
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const bySize = new Map()

for (const [name, size] of expected) {
  const bytes = await get(name)
  assert.ok(bytes.subarray(0, 8).equals(pngSignature), name + ' is a PNG')
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', name + ' has a valid PNG header')
  assert.equal(bytes.readUInt32BE(16), size, name + ' image width')
  assert.equal(bytes.readUInt32BE(20), size, name + ' image height')
  assert.ok(bytes.length > 200, name + ' contains image data')
  bySize.set(name, bytes)
}

const svg = await get('favicon.svg').then(bytes => bytes.toString('utf8').trim())
assert.equal(svg, brandIconSvg(), 'SVG must be generated from the shared nav logo geometry')
assert.ok(svg.includes(BRAND_MARK_OUTLINE), 'All four outline tiles are present')
assert.ok(svg.includes(BRAND_MARK_FILL), 'Lower-right filled tile is present')
assert.ok(!svg.includes('M14 17h36'), 'Old grid/circle icon must be removed')
assert.ok(!bySize.get('icons/icon-maskable-512.png').equals(bySize.get('icons/icon-512.png')), 'Maskable icon requires an actual safe-zone inset')

const ico = await get('favicon.ico')
assert.equal(ico.readUInt16LE(0), 0, 'ICO reserved header')
assert.equal(ico.readUInt16LE(2), 1, 'ICO image type')
assert.equal(ico.readUInt16LE(4), 3, 'ICO has 16, 32, and 48px sizes')
for (const [index, size] of [16, 32, 48].entries()) {
  const header = 6 + index * 16
  assert.equal(ico[header], size, 'ICO size ' + size)
  assert.equal(ico[header + 1], size, 'ICO dimensions ' + size)
  const length = ico.readUInt32LE(header + 8)
  const offset = ico.readUInt32LE(header + 12)
  assert.ok(ico.subarray(offset, offset + length).equals(bySize.get(`favicon-${size}.png`)), 'ICO embedded PNG matches the separately generated favicon at ' + size)
}

const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.ok(source.includes('d={BRAND_MARK_OUTLINE}') && source.includes('d={BRAND_MARK_FILL}'), 'Navbar uses the shared icon geometry')
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
for (const filename of ['favicon.svg', 'favicon.ico', 'favicon-16.png', 'favicon-32.png', 'icons/apple-touch-icon.png']) {
  assert.ok(html.includes(`%BASE_URL%${filename}?v=2`), filename + ' has a base-aware, cache-busted link')
}
const vite = await readFile(new URL('../vite.config.ts', import.meta.url), 'utf8')
assert.ok(vite.includes('icon-maskable-512.png?v=2'), 'PWA manifest contains cache-busted maskable icon')
console.log(JSON.stringify({ pass: true, files: expected.length + 2, rasterSizes: expected.map(([name, size]) => `${name}:${size}`), sharedGeometry: true, icoVerified: true }))