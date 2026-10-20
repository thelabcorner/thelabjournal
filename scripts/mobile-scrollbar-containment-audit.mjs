import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const chromiumPath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: chromiumPath, headless: true, args: ['--no-sandbox'] })
const near = (a, b, tolerance = 1.1) => Math.abs(a - b) <= tolerance
const scenarios = [
  [320,568], [320,844], [375,667], [390,844], [430,932], [600,812], [767,900],
]
const pages = ['/', '/research/low-temp-lyophilization-three-theses/', '/posts/learning-in-reverse/']
let checks = 0

try {
  for (const [width, height] of scenarios) {
    const page = await browser.newPage({
      viewport: { width, height }, isMobile: true, hasTouch: true,
      deviceScaleFactor: 2, reducedMotion: 'reduce', serviceWorkers: 'block',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      for (const path of pages) {
        await page.goto(new URL(path.slice(1), origin).href, { waitUntil: 'domcontentloaded' })
        await page.locator('.centered-scrollbar[data-scrollable="true"]').waitFor({ timeout: 18000 })
        if (path.includes('/research/')) await page.locator('.research-body #title h1').waitFor({ timeout: 20000 })
        await page.waitForFunction(() => {
          const track = document.querySelector('.centered-scrollbar')?.getBoundingClientRect()
          const reader = document.querySelector('.reading-bar, .research-reader-chrome')?.getBoundingClientRect()
          return track && (!reader || (track.top >= reader.bottom - 1 && track.top <= reader.bottom + 10))
        }, null, { timeout: 5000 })
        const state = async () => page.evaluate(() => {
          const bounds = sel => {
            const node = document.querySelector(sel)
            if (!node) return null
            const box = node.getBoundingClientRect()
            return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height }
          }
          return {
            viewport: window.innerHeight,
            header: bounds('.site-header'), tabs: bounds('.mobile-tabbar'),
            reader: bounds('.reading-bar') ?? bounds('.research-mobile-contents'),
            track: bounds('.centered-scrollbar'), thumb: bounds('.centered-scrollbar-thumb'),
            native: getComputedStyle(document.documentElement).scrollbarWidth,
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            scroll: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight,
            value: Number(document.querySelector('.centered-scrollbar').getAttribute('aria-valuenow')),
          }
        })
        const verify = data => {
          assert(data.track && data.thumb && data.header && data.tabs, 'missing scroll/view chrome')
          assert.equal(data.native, 'none', 'native scrollbar still spans entire mobile viewport')
          const readingBoundary = Math.max(data.header.bottom, data.reader?.bottom ?? data.header.bottom)
          assert(data.track.top >= readingBoundary - 1.1, 'track overlaps a sticky reader toolbar or manuscript sections bar: ' + JSON.stringify({width,height,path,data,readingBoundary}))
          assert(near(data.track.bottom, data.tabs.top), 'track extends into bottom navigation')
          assert(data.thumb.top >= data.track.top + 3.5, 'thumb extends above scrollview')
          assert(data.thumb.bottom <= data.track.bottom - 3.5, 'thumb extends below scrollview: ' + JSON.stringify({width,height,path,data}))
          assert(data.overflow <= 1, 'horizontal document overflow')
        }
        verify(await state())
        await page.evaluate(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) / 2, behavior:'instant' }))
        await page.waitForTimeout(80)
        verify(await state())
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior:'instant' }))
        await page.waitForFunction(() => {
          const track = document.querySelector('.centered-scrollbar')
          const expected = document.documentElement.scrollHeight - innerHeight
          return Math.abs(Number(track?.getAttribute('aria-valuenow')) - expected) < 2
        }, null, { timeout: 1500 })
        const end = await state()
        verify(end)
        assert(near(end.scroll, end.max, 2), 'cannot scroll to document end')
        assert(near(end.value, end.max, 2), 'thumb does not report scroll position: ' + JSON.stringify({width,height,path,end}))
        if (errors.length) assert.deepEqual(errors, [], 'uncaught browser error')
        checks++
        console.log(JSON.stringify({ viewport: width + 'x' + height, path, result: 'pass', track: [end.track.top, end.track.bottom] }))
      }
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.locator('.mobile-search').click()
      await page.getByRole('combobox', { name: /search/i }).fill('a')
      await page.locator('.journal-scrollview[data-scrollable="true"]').waitFor({ timeout: 15000 })
      const spotlight = await page.evaluate(() => {
        const rect = name => document.querySelector(name)?.getBoundingClientRect()
        const scroll = rect('.journal-scrollview')
        const track = rect('.journal-scrollview-track')
        const thumb = rect('.journal-scrollview-thumb')
        const status = rect('.spotlight-statusbar')
        const top = rect('.spotlight-scopes')
        return { scrollTop: scroll?.top, scrollBottom: scroll?.bottom, trackTop: track?.top, trackBottom: track?.bottom, thumbTop: thumb?.top, thumbBottom: thumb?.bottom, statusTop: status?.top, topBottom: top?.bottom }
      })
      assert(spotlight.trackTop >= spotlight.topBottom, 'Spotlight scroll track under its header')
      assert(spotlight.trackBottom <= spotlight.statusTop, 'Spotlight scroll track into its statusbar')
      assert(spotlight.thumbTop >= spotlight.scrollTop, 'Spotlight thumb over top')
      assert(spotlight.thumbBottom <= spotlight.scrollBottom, 'Spotlight thumb below bottom')
      checks++
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log('Mobile scrollview containment passed: ' + checks + ' scenarios.')
