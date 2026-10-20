import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const base = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
const entries = ['learning-in-reverse', 'what-becomes-ordinary', 'silica-pdf-engine']
const widths = [320, 375, 390, 430, 767, 768, 1024, 1440, 1920]
const near = (a, b, epsilon = 1.2) => Math.abs(a - b) <= epsilon
let checks = 0
let popupChecks = 0
try {
  for (const width of widths) {
    for (const slug of entries) {
      const page = await browser.newPage({
        viewport: { width, height: width === 320 ? 700 : 900 },
        isMobile: width < 768, hasTouch: width < 768,
        serviceWorkers: 'block', reducedMotion: 'reduce',
      })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.goto(new URL('posts/' + slug + '/', base).href, { waitUntil: 'domcontentloaded' })
        await page.locator('.article-body h1').waitFor()
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
        await page.waitForTimeout(70)
        const read = () => page.evaluate(() => {
          const rect = selector => {
            const element = document.querySelector(selector)
            if (!element) return null
            const { top, bottom, left, right, width, height } = element.getBoundingClientRect()
            return { top, bottom, left, right, width, height }
          }
          const progress = getComputedStyle(document.querySelector('.reading-progress')).transform
          return {
            header: rect('.site-header'), bar: rect('.reading-bar'), picker: rect('.journal-mobile-jump'),
            controls: rect('.reading-controls'), save: rect('.reading-controls .bookmark-control'),
            share: rect('.reading-controls .icon-control:last-child'), page: rect('.article-body'),
            oldSelectorCount: document.querySelectorAll('.article-mobile-contents').length,
            sections: document.querySelectorAll('.article-prose .prose-section').length,
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            scroll: scrollY, progress: progress === 'none' ? 0 : new DOMMatrixReadOnly(progress).a,
            progressHeight: rect('.reading-progress').height,
            scrollbarTop: rect('.centered-scrollbar')?.top,
          }
        })
        const top = await read()
        assert(near(top.progress, 0, .02), 'reading progress did not start at zero')
        assert.equal(top.progressHeight, 2, 'progress must remain a 2px line')
        assert.equal(top.oldSelectorCount, 0, 'old duplicate in-body selector still exists')
        assert(top.scrollWidth <= width + 1, 'horizontal overflow')
        if (width < 768) {
          assert(near(top.bar.height, 28), 'mobile reading chrome must be 28px tall')
          assert(top.picker && top.picker.left >= top.bar.left && top.picker.right <= top.bar.right,
            'journal section picker is not in the compact chrome')
          assert(top.picker.left >= top.header.left && top.picker.right < top.controls.left,
            'mobile picker overlaps the reading actions')
          assert(top.save.width === 24 && top.share.width === 24, 'mobile controls not 24px')
          assert(top.scrollbarTop >= top.bar.bottom - 1.1, 'page scrollbar enters journal reading bar')
        } else {
          assert(near(top.bar.height, 44), 'desktop journal toolbar must match manuscript 44px')
          assert(top.save.width === 28 && top.share.width === 28, 'desktop controls not 28px')
        }
        await page.evaluate(() => { const body = document.querySelector('.article-body'); const rect = body.getBoundingClientRect(); const begin = scrollY + rect.top; const end = Math.max(begin + 1, begin + rect.height - innerHeight); scrollTo({ top: begin + (end - begin) * .48, behavior: 'instant' }) })
        await page.waitForFunction(() => {
          const el = document.querySelector('.reading-progress')
          const value = new DOMMatrixReadOnly(getComputedStyle(el).transform).a
          return value > .12 && value < .95
        }, null, { timeout: 4000 })
        const middle = await read()
        assert(near(middle.bar.top, middle.header.bottom), 'journal toolbar not sticky below site header')
        assert(middle.progress > .12 && middle.progress < .95, 'progress lacks proportional tracking')
        if (width < 768) {
          await page.locator('.journal-mobile-jump').click()
          const popup = page.getByRole('dialog', { name: 'Jump to journal section' })
          await popup.waitFor()
          const options = popup.locator('[role="option"]')
          assert.equal(await options.count(), middle.sections, 'popup omits article sections')
          const lastIndex = middle.sections - 1
          const lastTitle = await page.locator('.prose-section h2').nth(lastIndex).innerText()
          const field = popup.getByRole('combobox', { name: 'Find a journal section' })
          await field.fill(lastTitle)
          assert.equal(await options.count(), 1, 'section search cannot isolate exact heading')
          await options.first().click()
          await popup.waitFor({ state: 'detached' })
          await page.waitForFunction(expected => location.hash === '#section-' + expected,
            middle.sections, { timeout: 5000 })
          await page.waitForTimeout(90)
          const anchored = await read()
          const target = await page.locator('#section-' + middle.sections).boundingBox()
          assert(target.y >= anchored.bar.bottom + 1, 'section is hidden below sticky bar')
          assert(target.y <= anchored.bar.bottom + 48 || Math.abs(anchored.scroll - await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)) <= 2, 'section jump leaves oversized blank space: ' + JSON.stringify({width,slug,anchor:target.y,bar:anchored.bar.bottom,scroll:anchored.scroll}))
          assert(near(anchored.bar.top, anchored.header.bottom), 'toolbar loses stickiness after jump')
          popupChecks++
        }
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
        await page.waitForFunction(() => new DOMMatrixReadOnly(
          getComputedStyle(document.querySelector('.reading-progress')).transform).a >= .99, null, { timeout: 4000 })
        const end = await read()
        assert(end.progress >= .99, 'progress does not complete')
        assert(near(end.bar.top, end.header.bottom), 'toolbar leaves sticky position at article end')
        assert.deepEqual(errors, [], 'uncaught browser errors')
        checks++
        console.log(JSON.stringify({
          width, slug, result: 'pass',
          bar: end.bar.height, sections: end.sections,
          middleProgress: Math.round(middle.progress * 1000) / 1000,
          endProgress: Math.round(end.progress * 1000) / 1000,
        }))
      } finally { await page.close() }
    }
  }
} finally { await browser.close() }
console.log('Journal sticky-bar parity: ' + checks + ' responsive scenarios, ' + popupChecks + ' picker/jump scenarios.')
