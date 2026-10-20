import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const base = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const cases = [
  { paper: 'gravimetric-decarboxylation-co2-progress', chapter: 'manual' },
  { paper: 'low-temp-lyophilization-three-theses', chapter: 'introduction' },
]
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
let verified = 0
try {
  for (const width of [320, 390, 1024, 1440]) {
    for (const theme of ['light', 'dark']) {
      for (const { paper, chapter } of cases) {
        const page = await browser.newPage({
          viewport: { width, height: width === 320 ? 700 : 900 },
          isMobile: width < 768, hasTouch: width < 768,
          serviceWorkers: 'block', reducedMotion: 'reduce',
        })
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        try {
          await page.goto(new URL('research/' + paper + '/', base).href, { waitUntil: 'domcontentloaded' })
          await page.locator('.research-body #title h1').waitFor()
          await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
          await page.waitForTimeout(130)
          const sample = () => page.evaluate(() => {
            const bounds = selector => {
              const rect = document.querySelector(selector).getBoundingClientRect()
              return { top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right }
            }
            const progress = document.querySelector('.research-reading-progress')
            const matrix = getComputedStyle(progress).transform
            return {
              scroll: window.scrollY,
              header: bounds('.site-header'), toolbar: bounds('.research-reader-top'),
              chrome: bounds('.research-reader-chrome'), page: bounds('.research-body'),
              progress: matrix === 'none' ? 0 : Number(new DOMMatrixReadOnly(matrix).a),
              progressHeight: progress.getBoundingClientRect().height,
              progressColor: getComputedStyle(progress).backgroundColor,
              horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
              picker: window.innerWidth < 768 ? bounds('.research-mobile-contents') : null,
            }
          })
          const start = await sample()
          assert(start.progress <= .005, 'manuscript progress must start at zero')
          assert.equal(start.progressHeight, 2, 'the progress line should use the journal 2px treatment')
          assert(start.horizontalOverflow <= 1, 'horizontal overflow introduced')
          await page.evaluate(() => window.scrollTo({ top: Math.round(document.documentElement.scrollHeight * .45), behavior: 'instant' }))
          await page.waitForFunction(() => {
            const el = document.querySelector('.research-reading-progress')
            const matrix = getComputedStyle(el).transform
            return matrix !== 'none' && new DOMMatrixReadOnly(matrix).a > .1
          })
          const middle = await sample()
          assert(Math.abs(middle.chrome.top - middle.header.bottom) <= 1,
            'manuscript reading chrome is not sticky under primary navigation')
          assert(middle.progress > .1 && middle.progress < .9, 'progress must be proportional to scroll position')
          assert(middle.progressColor !== 'rgba(0, 0, 0, 0)', 'progress indicator must be visible on a solid surface')
          if (width < 768) {
            assert(middle.picker.top >= middle.toolbar.top && middle.picker.bottom <= middle.toolbar.bottom,
              'mobile section picker must occupy the same toolbar row as Research and Print')
            assert(Math.abs(middle.chrome.bottom - middle.toolbar.bottom) <= 2,
              'sticky manuscript progress must finish underneath the single combined row')
            assert(middle.chrome.height < 70, 'combined manuscript toolbar should not have a second row')
            const trigger = page.locator('.research-mobile-jump')
            await trigger.click()
            const menu = page.locator('.research-section-menu')
            await menu.waitFor()
            const item = page.locator('#research-section-option-' + chapter)
            await item.click()
            await page.waitForFunction(id => location.hash === '#' + id, chapter)
            await page.waitForFunction(id => {
              const anchor = document.getElementById(id)?.getBoundingClientRect()
              const chrome = document.querySelector('.research-reader-chrome')?.getBoundingClientRect()
              return anchor && chrome && anchor.top >= chrome.bottom + 2 &&
                anchor.top <= chrome.bottom + 32
            }, chapter, { timeout: 2500 })
            const anchor = await page.locator('#' + chapter).boundingBox()
            const anchored = await sample()
            assert(anchor.y >= anchored.chrome.bottom + 2,
              'chapter jumped under sticky manuscript chrome: anchor=' + anchor.y + ' chrome=' + anchored.chrome.bottom)
            assert(anchor.y <= anchored.chrome.bottom + 32,
              'chapter jumping leaves excessive blank space')
            assert.equal(await menu.count(), 0, 'section menu must close after jump')
          }
          await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
          await page.waitForFunction(() => {
            const matrix = getComputedStyle(document.querySelector('.research-reading-progress')).transform
            return matrix !== 'none' && new DOMMatrixReadOnly(matrix).a >= .99
          })
          const end = await sample()
          assert(end.progress >= .99, 'progress bar must complete')
          assert(Math.abs(end.chrome.top - end.header.bottom) <= 1, 'sticky toolbar disappeared at end of manuscript')
          assert.equal(errors.length, 0, errors.join('; '))
          verified++
          console.log(JSON.stringify({ width, theme, paper, middleProgress: +middle.progress.toFixed(3), endProgress: +end.progress.toFixed(3), pass: true }))
        } finally { await page.close() }
      }
    }
  }
} finally { await browser.close() }
console.log('Manuscript sticky chrome and reading progress: ' + verified + ' verified scenarios.')