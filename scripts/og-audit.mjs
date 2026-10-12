import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const path = new URL('../public/', import.meta.url)
const readAsset = name => readFile(new URL(name, path))
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const expectedUrl = 'https://thelabcorner.github.io/thelabjournal/og-image.png?v=1'
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

async function validateAssets() {
  const png = await readAsset('og-image.png')
  const svg = await readFile(new URL('../artifacts/og-image.svg', import.meta.url))
  assert.ok(png.subarray(0, 8).equals(pngSignature), 'social image is PNG')
  assert.equal(png.readUInt32BE(16), 1200, '1200 px wide')
  assert.equal(png.readUInt32BE(20), 630, '630 px tall')
  assert.ok(png.length > 40000 && png.length < 1000000, 'social PNG is detailed but compact')
  const xml = svg.toString('utf8')
  assert.ok(xml.includes('viewBox="0 0 1200 630"'), 'correct SVG dimensions')
  assert.ok(xml.includes('<path'), 'Satori embeds font outlines')
  assert.ok(!xml.includes('<text '), 'no unembedded fonts in exported SVG')
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  for (const [type, key] of [
    ['property', 'og:image'],
    ['property', 'og:image:secure_url'],
    ['name', 'twitter:image'],
    ['name', 'twitter:img:src'],
    ['name', 'twitter:image:src'],
  ]) {
    assert.ok(html.includes(`<meta ${type}="${key}" content="${expectedUrl}"`), key + ' points to the absolute preview URL')
  }
  for (const [key, value] of [
    ['og:image:width', '1200'], ['og:image:height', '630'],
    ['og:image:type', 'image/png'], ['og:site_name', 'thelabjournal™'],
  ]) {
    assert.ok(html.includes(`property="${key}" content="${value}"`), key)
  }
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), 'Twitter large-image preview')
  assert.ok(html.includes('property="og:url" content="https://thelabcorner.github.io/thelabjournal/"'), 'canonical project Pages URL')
  assert.ok(html.includes('property="og:image:alt"') && html.includes('name="twitter:image:alt"'), 'accessible social descriptions')
  return { png, svg }
}

const first = await validateAssets()
execFileSync(process.execPath, ['scripts/generate-og.mjs'], {
  cwd: new URL('..', import.meta.url),
  stdio: 'pipe',
  timeout: 30000,
})
const second = await validateAssets()
assert.equal(sha256(first.png), sha256(second.png), 'PNG is bit-for-bit deterministic')
assert.equal(sha256(first.svg), sha256(second.svg), 'SVG is bit-for-bit deterministic')
console.log(JSON.stringify({
  pass: true,
  renderer: 'satori + resvg',
  font: 'Inter',
  image: '1200x630',
  pngBytes: second.png.length,
  pngSha256: sha256(second.png),
  deterministic: true,
  metadata: true,
}))