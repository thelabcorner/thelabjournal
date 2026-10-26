import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const slug = 'the-openfork-network-behind-one-oxp-connection'
const widths = [320, 375, 430, 768, 1024, 1440]
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
await mkdir('artifacts', { recursive: true })
let failures = 0
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 850 }, deviceScaleFactor: 1 })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  try {
    const response = await page.goto(new URL('posts/' + slug + '/', origin).href, { waitUntil: 'networkidle', timeout: 30000 })
    if (!response?.ok()) throw new Error('Non-OK article response: ' + response?.status())
    if (await page.getByRole('heading', { name: 'OpenFork: connecting the systems around an agent harness', exact: true }).count() !== 1)
      throw new Error('Entry title missing')
    if (await page.locator('.prose-section').count() !== 11) throw new Error('Wrong section count')
    const figures = page.locator('.ofarch-figure')
    if (await figures.count() !== 5) throw new Error('Expected exactly five article architecture diagrams')
    const captions = await figures.locator('figcaption').allTextContents()
    if (captions.some(x => x.trim().length < 50)) throw new Error('Missing substantive diagram caption')
    const render = await page.evaluate(() => {
      const figures = [...document.querySelectorAll('.ofarch-figure')].map(node => {
        const rect = node.getBoundingClientRect()
        return { width: Math.round(rect.width), innerOverflow: node.scrollWidth - node.clientWidth }
      })
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        figures,
      }
    })
    if (pageErrors.length) throw new Error('Browser errors: ' + pageErrors.join(' / '))
    if (render.document > render.viewport + 1 || render.body > render.viewport + 1)
      throw new Error('Horizontal page overflow: ' + JSON.stringify(render))
    if (render.figures.some(x => x.innerOverflow > 1)) throw new Error('Diagram overflow: ' + JSON.stringify(render.figures))
    if (width === 375 || width === 1440) {
      await figures.nth(0).screenshot({ path: 'artifacts/oxp-architecture-overview-' + width + '.png' })
      await figures.nth(3).screenshot({ path: 'artifacts/oxp-architecture-ofxp-' + width + '.png' })
    }
    console.log(JSON.stringify({ width, pass: true, ...render }))
  } catch (error) {
    failures++
    console.error(JSON.stringify({ width, pass: false, error: String(error), pageErrors }))
  } finally { await page.close() }
}
await browser.close()
if (failures) process.exitCode = 1
