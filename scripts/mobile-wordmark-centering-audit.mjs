import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const centered = (x, width) => Math.abs(x - width / 2) <= .75

try {
  for (const theme of ['light','dark']) {
    for (const width of [320,344,359,375,390,393,414,430,767]) {
      for (const view of ['journal','manuscript']) {
        const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
        try {
          await page.addInitScript(value => localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({
            theme: value, textScale: 'normal', layout: 'list',
          })), theme)
          await page.goto(origin + (view === 'manuscript' ? 'research/gravimetric-decarboxylation-co2-progress/' : ''), { waitUntil: 'domcontentloaded' })
          await page.locator('.site-header .brand-text').waitFor()
          const dimensions = await page.evaluate(() => {
            const box = selector => {
              const e = document.querySelector(selector)
              if (!e) return null
              const r = e.getBoundingClientRect()
              return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height, center:(r.left+r.right)/2 }
            }
            return {
              viewport: innerWidth,
              documentWidth: document.documentElement.scrollWidth,
              wordmark: box('.site-header .brand-text'),
              icon: box('.site-header .brand-mark'),
              brand: box('.site-header .brand'),
              nav: box('.site-header .mobile-nav-toggle'),
              right: box('.site-header .header-end'),
              logoText: document.querySelector('.site-header .brand-text')?.textContent?.trim(),
              brandLabel: document.querySelector('.site-header .brand')?.getAttribute('aria-label'),
            }
          })
          assert(centered(dimensions.wordmark.center, width), `${theme} ${width} ${view}: text axis off-center ${JSON.stringify(dimensions)}`)
          assert(dimensions.icon.right <= dimensions.wordmark.left - 3, `${theme} ${width}: glyph must sit left of text`)
          assert(dimensions.icon.left >= dimensions.nav.right + 1, `${theme} ${width} ${view}: glyph overlaps menu ${JSON.stringify(dimensions)}`)
          assert(dimensions.wordmark.right <= dimensions.right.left - 1, `${theme} ${width}: centered text overlaps search controls`)
          assert(dimensions.documentWidth <= width + 1, `${theme} ${width}: horizontal overflow`)
          assert(dimensions.brandLabel?.includes('home'), 'home link must keep its accessible name')
          if (width === 393 && view === 'manuscript') await page.screenshot({path:`artifacts/wordmark-center-${theme}.png`})
          if (view === 'manuscript') {
            await page.mouse.click((dimensions.icon.left+dimensions.icon.right)/2, (dimensions.icon.top+dimensions.icon.bottom)/2)
            await page.waitForURL(origin, { timeout: 3000 })
            await page.locator('.workspace-heading-line h1').waitFor()
          }
          console.log(JSON.stringify({ theme,width,view,wordmarkCenter:dimensions.wordmark.center,iconRight:dimensions.icon.right,menuRight:dimensions.nav.right,pass:true }))
        } finally { await page.close() }
      }
    }
  }
} finally { await browser.close() }
console.log('Mobile wordmark independent alignment PASS')
