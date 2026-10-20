import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
try {
  for (const theme of ['light', 'dark']) {
    for (const width of [375, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      try {
        await page.addInitScript(value => localStorage.setItem('thelabcorner.journal.preferences.v2',
          JSON.stringify({ theme: value, textScale: 'normal', layout: 'list' })), theme)
        await page.goto(origin, { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(value => document.documentElement.dataset.theme === value, theme)
        const check = async (selector, expectedWidth) => {
          const img = page.locator(selector)
          await img.waitFor({ state: 'attached' })
          const result = await img.evaluate(el => ({
            src: el.getAttribute('src'),
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
            loaded: el.complete,
            displayedWidth: el.getBoundingClientRect().width,
            objectFit: getComputedStyle(el).objectFit,
            alt: el.getAttribute('alt'),
          }))
          assert(result.src.endsWith('/author-avatar.png'), 'avatar must be a local static asset')
          assert(!result.src.includes('licdn.com'), 'LinkedIn CDN must not be referenced')
          assert.equal(result.naturalWidth, 1254)
          assert.equal(result.naturalHeight, 1254)
          assert(result.loaded, 'avatar failed to load')
          assert.equal(result.objectFit, 'cover')
          assert(Math.abs(result.displayedWidth - expectedWidth) <= 1)
          return result
        }

        if (width >= 1024) {
          const rail = await check('.desktop-rail .rail-author', 31)
          assert.equal(rail.alt, 'Jackson Cummings')
        }
        await page.locator('.feature-link').first().click()
        const article = await check('.article-meta .author-avatar', 33)
        assert.equal(article.alt, '', 'author name is adjacent: avoid repeated screen-reader text')
        assert.equal(await page.locator('.author-avatar').count(), 1)
        if (width === 1920) await page.screenshot({ path: `artifacts/avatar-${theme}-1920.png` })
        console.log(JSON.stringify({ theme, width, rail: width >= 1024, image: article.naturalWidth, pass: true }))
      } finally { await page.close() }
    }
  }
} finally { await browser.close() }
console.log('local avatar: PASS')
