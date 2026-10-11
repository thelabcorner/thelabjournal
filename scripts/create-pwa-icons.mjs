import { chromium } from 'playwright-core'
import { readFile, mkdir, writeFile } from 'node:fs/promises'

const icon = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
await mkdir(new URL('../public/icons/', import.meta.url), { recursive: true })

for (const [size, filename, maskable] of [
  [192, 'icon-192.png', false],
  [512, 'icon-512.png', false],
  [512, 'icon-maskable-512.png', true],
  [180, 'apple-touch-icon.png', false],
]) {
  const page = await browser.newPage({ viewport: { width:size, height:size }, deviceScaleFactor:1 })
  const svg = icon.replace('viewBox="0 0 64 64"', 'viewBox="0 0 64 64"')
  await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#18181b;display:grid;place-items:center;width:100vw;height:100vh}img{display:block;width:'+(maskable?76:100)+'%;height:'+(maskable?76:100)+'%}</style><img alt="" src="data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')+'">')
  await page.locator('img').evaluate(img=>img.decode())
  const png = await page.screenshot({ animations:'disabled', omitBackground:false })
  await writeFile(new URL('../public/icons/'+filename, import.meta.url), png)
  await page.close()
}
await browser.close()
console.log('Generated journal PWA icons from existing SVG favicon')
