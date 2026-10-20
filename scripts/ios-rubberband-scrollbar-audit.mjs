import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const routes = [
  '/',
  '/posts/learning-in-reverse/',
  '/research/gravimetric-decarboxylation-co2-progress/',
  '/research/low-temp-lyophilization-three-theses/',
]
const widths = [320, 390, 430]
const tolerance = 1.1
const near = (a, b) => Math.abs(a - b) <= tolerance
let passed = 0

try {
  for (const width of widths) for (const route of routes) {
    const page = await browser.newPage({
      viewport: { width, height: 844 }, isMobile: true, hasTouch: true,
      deviceScaleFactor: 3, reducedMotion: 'reduce', serviceWorkers: 'block',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(new URL(route.slice(1), origin).href, { waitUntil: 'domcontentloaded' })
      await page.locator('.centered-scrollbar[data-scrollable="true"]').waitFor({ timeout: 20000 })
      // Allow the lazy scientific document and ResizeObserver to settle.
      if (route.includes('/research/')) await page.locator('.research-body #title h1').waitFor({ timeout: 20000 })
      await page.waitForTimeout(80)
      const read = async () => page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect()
        const track = document.querySelector('.centered-scrollbar')
        const thumb = document.querySelector('.centered-scrollbar-thumb')
        return {
          top: rect('.centered-scrollbar').top,
          bottom: rect('.centered-scrollbar').bottom,
          thumbTop: rect('.centered-scrollbar-thumb').top,
          thumbBottom: rect('.centered-scrollbar-thumb').bottom,
          navTop: rect('.mobile-tabbar').top,
          headerBottom: rect('.site-header').bottom,
          viewport: innerHeight,
          max: Number(track.getAttribute('aria-valuemax')),
          now: Number(track.getAttribute('aria-valuenow')),
          hidden: getComputedStyle(thumb).visibility === 'hidden',
          elastic: track.dataset.elastic === 'true',
        }
      })
      const initial = await read()
      assert(near(initial.bottom, initial.navTop), 'initial track overlaps nav')
      assert(initial.top >= initial.headerBottom, 'initial track overlaps masthead')
      assert(!initial.hidden && !initial.elastic)
      assert(initial.max > 1)
      await page.evaluate(() => {
        // Emulates the otherwise impossible-to-provoke-on-Chromium negative
        // and beyond-range Safari window.scrollY readings during rubber-band.
        window.__rubberY = 0
        Object.defineProperty(window, 'scrollY', {
          configurable: true,
          get: () => window.__rubberY,
        })
      })
      for (const injected of [-1.5, -28, -150, -300, initial.max + 5, initial.max + 350]) {
        await page.evaluate(y => {
          window.__rubberY = y
          window.dispatchEvent(new Event('scroll'))
          window.dispatchEvent(new Event('resize'))
        }, injected)
        await page.waitForTimeout(38)
        const during = await read()
        assert(near(during.top, initial.top), 'elastic phase rewrote fixed top')
        assert(near(during.bottom, initial.bottom), 'elastic phase rewrote fixed bottom')
        assert(during.elastic && during.hidden, 'elastic thumb not suppressed')
        // Hidden during rubber-band: DOM geometry can retain a pre-resize
        // transform, but no portion of the thumb can paint outside the track.
        assert(during.hidden, 'elastic scrollbar must not paint')
        assert(during.now >= 0 && during.now <= during.max, 'ARIA scroll value unbounded')
      }
      for (const restored of [0, initial.max / 3, initial.max, 0]) {
        await page.evaluate(y => {
          window.__rubberY = y
          window.dispatchEvent(new Event('scroll'))
          window.dispatchEvent(new Event('scrollend'))
        }, restored)
        await page.waitForTimeout(38)
        const back = await read()
        assert(near(back.top, initial.top), 'rubber-band recovery shifted top')
        assert(near(back.bottom, initial.bottom), 'rubber-band recovery shifted bottom')
        assert(!back.elastic && !back.hidden, 'scrollbar stuck in elastic state')
        assert(back.thumbTop >= back.top - 0.5 && back.thumbBottom <= back.bottom + 0.5,
          'visible recovered thumb escaped track: ' + JSON.stringify({width,route,restored,back}))
        assert(back.now >= 0 && back.now <= back.max)
      }
      await page.evaluate(() => { delete window.scrollY; window.dispatchEvent(new Event('scroll')) })
      await page.waitForTimeout(42)
      assert.deepEqual(errors, [], 'uncaught browser errors')
      passed++
      console.log(JSON.stringify({ width, route, result: 'pass', track: [initial.top,initial.bottom] }))
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log('iOS elastic-scroll emulation passed ' + passed + ' route/viewport combinations.')
