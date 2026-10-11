import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { brandIconSvg } from '../src/lib/brandMark.ts'

const publicDir = new URL('../public/', import.meta.url)
await mkdir(new URL('../public/icons/', import.meta.url), { recursive: true })
await writeFile(new URL('favicon.svg', publicDir), brandIconSvg() + '\n')

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const smallIcons = new Map()
try {
  for (const [size, filename, maskable] of [
    [16, 'favicon-16.png', false],
    [32, 'favicon-32.png', false],
    [48, 'favicon-48.png', false],
    [180, 'icons/apple-touch-icon.png', false],
    [192, 'icons/icon-192.png', false],
    [512, 'icons/icon-512.png', false],
    [512, 'icons/icon-maskable-512.png', true],
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
    try {
      const encoded = Buffer.from(brandIconSvg(maskable)).toString('base64')
      await page.setContent(`<!doctype html><html><head><style>
        html,body{width:100%;height:100%;margin:0;background:#18181b}
        img{width:100%;height:100%;display:block}
      </style></head><body><img alt="" src="data:image/svg+xml;base64,${encoded}"></body></html>`)
      await page.locator('img').evaluate(async img => { await img.decode() })
      const png = await page.screenshot({ animations: 'disabled', omitBackground: false })
      await writeFile(new URL(filename, publicDir), png)
      if (size <= 48) smallIcons.set(size, png)
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}

// ICO supports PNG-encoded entries, retaining pixel identity at 16, 32 and 48px.
const sizes = [16, 32, 48]
const header = Buffer.alloc(6 + sizes.length * 16)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
for (const [index, size] of sizes.entries()) {
  const png = smallIcons.get(size)
  const pos = 6 + index * 16
  header.writeUInt8(size, pos)
  header.writeUInt8(size, pos + 1)
  header.writeUInt8(0, pos + 2)
  header.writeUInt8(0, pos + 3)
  header.writeUInt16LE(1, pos + 4)
  header.writeUInt16LE(32, pos + 6)
  header.writeUInt32LE(png.length, pos + 8)
  header.writeUInt32LE(offset, pos + 12)
  offset += png.length
}
await writeFile(new URL('favicon.ico', publicDir), Buffer.concat([header, ...sizes.map(size => smallIcons.get(size))]))
console.log('Generated navbar-mark favicon.svg/.ico, PNG fallbacks, Apple touch, PWA and maskable icons')
