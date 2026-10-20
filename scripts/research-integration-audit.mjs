import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const widths = [390, 1440, 1920]
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const results = []

try {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      serviceWorkers: 'block',
      reducedMotion: 'reduce',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.locator('.journal-research-bridge').waitFor()
      assert.match(await page.title(), /thelabjournal/i, 'root must remain the journal')
      await page.locator('.journal-research-bridge').click()
      await page.locator('.research-publication').first().waitFor()
      assert.equal(await page.locator('.research-publication').count(), 2, 'two source manuscripts must be listed')
      assert.match(new URL(page.url()).pathname, /\/research\/$/)

      await page.locator('.research-publication').nth(1).click()
      await page.locator('.research-body #title h1').waitFor({ timeout: 30_000 })
      assert.match(await page.locator('.research-body #title h1').innerText(), /lyophilization/i)
      assert((await page.locator('.research-body .katex').count()) > 100, 'actual equations must load')
       const manuscriptSectionCount = Number((await page.locator('.research-mobile-contents-label small').innerText()).split('/').at(-1)?.trim())
       assert(manuscriptSectionCount > 20, 'complete scientific hierarchy must be accessible')
      assert((await page.locator('.research-document-toc .research-outline-chapter a').count()) > 7, 'chapters must be indexed')
      if (width >= 1251) {
        await page.getByRole('button', { name: /Expand 1. Introduction/ }).click()
        assert(await page.locator('.research-outline-children a[href="#introduction-motivation"]').count() > 0, 'subsections should be accessible under expanded chapter')
      }
      assert((await page.locator('.research-body .reference-entry').count()) > 0, 'references must load')

      await page.goBack()
      await page.locator('.research-publications').waitFor()
      await page.goBack()
      await page.locator('.journal-research-bridge').waitFor()
      assert(!new URL(page.url()).pathname.includes('/research/'))

      await page.keyboard.press('Control+k')
      const dialog = page.getByRole('dialog', { name: /search/i })
      await dialog.waitFor()
      await page.getByRole('combobox', { name: /search the journal and research/i }).fill('lyophilization')
      await page.getByRole('option').filter({ hasText: /lyophilization/i }).first().click()
      await page.locator('.research-body #title h1').waitFor({ timeout: 30_000 })
      assert.match(new URL(page.url()).pathname, /low-temp-lyophilization-three-theses/)
      assert.equal(errors.length, 0, 'unexpected browser errors: ' + errors.join('; '))
      const geometry = await page.evaluate(() => ({
        viewport: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
        frame: Math.round(document.querySelector('.frame').getBoundingClientRect().width),
      }))
      assert(geometry.scroll <= geometry.viewport + 1, 'horizontal overflow')
      assert.equal(geometry.frame, Math.min(width, 1500), 'existing centered shell width changed')
      const result = { width, pass: true, geometry }
      results.push(result)
      console.log(JSON.stringify(result))
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log(`Research integration verified in ${results.length} responsive Chromium scenarios.`)
