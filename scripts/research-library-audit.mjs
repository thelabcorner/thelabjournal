import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920]
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const all = []
try {
  await mkdir('artifacts/research-library', { recursive: true })
  for (const theme of ['dark', 'light']) for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      serviceWorkers: 'block',
      reducedMotion: 'reduce',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(new URL('research/', origin).href, { waitUntil: 'domcontentloaded' })
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme }, theme)
      await page.locator('.research-library').waitFor()
      assert.equal(await page.locator('.research-publication').count(), 2, 'two manuscript records required')
      assert.equal(await page.locator('.research-publication h3').count(), 2)
      assert.equal(await page.locator('.research-library [id="research-index-title"]').innerText(), 'Manuscript index')
      assert.equal(await page.locator('.research-publication-status[data-status="Draft"]').count() > 0, true)
      assert.equal(await page.locator('.research-publication-status[data-status="Under review"]').count() > 0, true)
      assert.match(await page.locator('.research-publication').first().innerText(), /decarboxylation/i)
      const geometry = await page.evaluate(() => {
        const width = innerWidth
        const rect = selector => {
          const node = document.querySelector(selector)
          const { left, right, width: w, height } = node.getBoundingClientRect()
          return { left, right, width: w, height }
        }
        const rows = Array.from(document.querySelectorAll('.research-publication')).map(node => {
          const r = node.getBoundingClientRect()
          return { left: r.left, right: r.right, width: r.width }
        })
        return {
          viewport: width,
          scrollWidth: document.documentElement.scrollWidth,
          frame: rect('.frame'),
          index: rect('.research-library'),
          search: rect('.research-index-search'),
          rows,
          mobileDetails: getComputedStyle(document.querySelector('.research-publication-mobile-details')).display,
          aside: getComputedStyle(document.querySelector('.research-publication-aside')).display,
        }
      })
      assert(geometry.scrollWidth <= width + 1, 'horizontal overflow: ' + JSON.stringify(geometry))
      assert(geometry.index.left >= -1 && geometry.index.right <= width + 1, 'main research index overflows viewport')
      assert(geometry.search.left >= -1 && geometry.search.right <= width + 1, 'search must remain inside viewport')
      assert(geometry.rows.every(row => row.left >= -1 && row.right <= width + 1), 'manuscript rows clip')
      if (width <= 767) {
        assert.notEqual(geometry.mobileDetails, 'none', 'mobile scientific metadata must remain visible')
        assert.equal(geometry.aside, 'none', 'desktop metadata rail should not compress mobile content')
      } else {
        assert.notEqual(geometry.aside, 'none', 'desktop manuscript evidence rail must be visible')
      }
      const filters = page.getByRole('group', { name: 'Filter manuscripts by status' })
      await filters.getByRole('button', { name: /Under review/ }).click()
      assert.equal(await page.locator('.research-publication').count(), 1, 'status filter must work')
      assert.match(await page.locator('.research-publication h3').innerText(), /lyophilization/i)
      await filters.getByRole('button', { name: /All papers/ }).click()
      await page.getByRole('searchbox', { name: 'Search research manuscripts' }).fill('gravimetric')
      assert.equal(await page.locator('.research-publication').count(), 1, 'search must find scientific terms')
      assert.match(await page.locator('.research-publication h3').innerText(), /decarboxylation/i)
      await page.getByRole('searchbox', { name: 'Search research manuscripts' }).fill('no-such-paper-2917')
      assert.equal(await page.locator('.research-publication').count(), 0, 'unknown terms must not show irrelevant records')
      await page.getByRole('button', { name: 'Show all manuscripts' }).click()
      assert.equal(await page.locator('.research-publication').count(), 2, 'empty-state reset should restore collection')
      await page.locator('.research-publication').nth(1).click()
      await page.locator('.research-body #title h1').waitFor({ timeout: 25000 })
      assert.match(new URL(page.url()).pathname, /low-temp-lyophilization-three-theses/)
      await page.goBack({ waitUntil: 'domcontentloaded' })
      await page.locator('.research-library').waitFor()
      assert.equal(await page.locator('.research-publication').count(), 2, 'browser back should restore index')
      assert.deepEqual(errors, [], 'browser exceptions: ' + errors.join('; '))
      if ((width === 375 || width === 1440) && theme === 'dark') {
        await page.screenshot({ path: 'artifacts/research-library/dark-' + width + '.png', fullPage: false })
      }
      if ((width === 375 || width === 1440) && theme === 'light') {
        await page.screenshot({ path: 'artifacts/research-library/light-' + width + '.png', fullPage: false })
      }
      all.push({ theme, width, ok: true, maxScroll: geometry.scrollWidth })
      console.log(JSON.stringify(all.at(-1)))
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log('Research publication index verified: ' + all.length + ' responsive theme/viewport scenarios.')
