import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const near = (actual, expected, tolerance = 1) => Math.abs(actual - expected) <= tolerance

try {
  for (const theme of ['light', 'dark']) {
    for (const width of [1024, 1440, 1920, 2560]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      })
      try {
        await page.goto(origin, { waitUntil: 'domcontentloaded' })
        await page.evaluate((appearance) => {
          document.documentElement.dataset.theme = appearance
          localStorage.setItem('thelabcorner.journal.theme.audit', appearance)
        }, theme)

        for (const view of ['index', 'article']) {
          if (view === 'article') {
            await page.locator('.feature-link').click()
            await page.locator('.article-main').waitFor()
          }
          await page.waitForFunction(() => document.querySelector('.centered-scrollbar')?.dataset.scrollable === 'true')
          const result = await page.evaluate(() => {
            const bounds = (node) => {
              const r = node.getBoundingClientRect()
              return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
            }
            const header = document.querySelector('.site-header')
            const frame = document.querySelector('.frame')
            const edge = document.querySelector('.workspace-edge')
            const rail = document.querySelector('.centered-scrollbar')
            const thumb = document.querySelector('.centered-scrollbar-thumb')
            const root = getComputedStyle(document.documentElement)
            return {
              header: bounds(header),
              frame: bounds(frame),
              edge: bounds(edge),
              rail: bounds(rail),
              thumb: bounds(thumb),
              frameLine: parseFloat(root.getPropertyValue('--journal-frame-stroke')),
              edgeWidth: parseFloat(root.getPropertyValue('--journal-edge-width')),
              headerTop: parseFloat(getComputedStyle(header).borderTopWidth),
              frameLeft: parseFloat(getComputedStyle(frame, '::before').width),
              edgeLeft: parseFloat(getComputedStyle(edge).borderLeftWidth),
              edgeRight: parseFloat(getComputedStyle(edge).borderRightWidth),
              railTouch: getComputedStyle(rail).touchAction,
              max: Number(rail.getAttribute('aria-valuemax')),
              now: Number(rail.getAttribute('aria-valuenow')),
              scrollbarNative: getComputedStyle(document.documentElement).scrollbarWidth,
              viewportWidth: window.innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
            }
          })
          assert.equal(result.frameLine, 1, 'single-pixel perimeter stroke is a shared design token')
          for (const [label, value] of [
            ['header top', result.headerTop],
            ['frame left', result.frameLeft],
            ['edge left', result.edgeLeft],
            ['edge right', result.edgeRight],
          ]) assert.equal(value, result.frameLine, `${theme} ${width}px ${view}: ${label} stroke does not match`)
          assert.equal(result.edgeWidth, 24, 'right utility strip width is a shared token')
          assert(near(result.edge.width, result.edgeWidth), 'edge utility strip width differs from token')
          assert(near(result.edge.right, result.frame.right), 'right border is outside the centered frame')
          assert(near(result.rail.right, result.edge.right), 'scrollbar is not flush with the frame')
          assert(near(result.rail.left, result.edge.left), 'scrollbar hit area does not occupy the complete rail')
          assert(near(result.rail.width, result.edgeWidth), 'scrollbar drag target is not 24px')
          assert(near((result.thumb.left + result.thumb.right) / 2, (result.rail.left + result.rail.right) / 2),
            'visible thumb not precisely centered')
          assert(result.railTouch === 'none', 'drag gestures must not fight native touch handling')
          assert(result.scrollbarNative === 'none', 'the native scrollbar must not overlap the centered rail')
          assert(result.max > 200, 'this page is not scrollable enough to exercise the scrollbar')
          assert(result.scrollWidth <= result.viewportWidth + 1, 'page created horizontal overflow')
          console.log(JSON.stringify({ width, theme, view, frameLeft: result.frame.left, stroke: result.frameLine, edge: result.edgeWidth, pass: true }))
        }
        // One pointer and keyboard exercise per viewport/theme: retain full semantic behavior.
        const track = page.locator('.centered-scrollbar')
        await track.focus()
        await page.keyboard.press('End')
        await page.waitForFunction(() => window.scrollY > (document.documentElement.scrollHeight - innerHeight) * .97)
        await page.keyboard.press('Home')
        await page.waitForFunction(() => window.scrollY < 1)

        const rail = await track.boundingBox()
        assert(rail)
        await page.mouse.click(rail.x + rail.width / 2, rail.y + rail.height * .63)
        await page.waitForFunction(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight
          return window.scrollY > max * .45 && window.scrollY < max * .80
        })

        const thumb = await page.locator('.centered-scrollbar-thumb').boundingBox()
        assert(thumb)
        await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
        await page.mouse.down()
        await page.mouse.move(thumb.x + thumb.width / 2, rail.y + rail.height - 12, { steps: 8 })
        await page.mouse.up()
        await page.waitForFunction(() => window.scrollY > (document.documentElement.scrollHeight - innerHeight) * .96)
        await page.locator('.centered-scrollbar').focus()
        const focusedWidth = await page.locator('.centered-scrollbar-thumb').evaluate((node) => node.getBoundingClientRect().width)
        assert(near(focusedWidth, 10), 'focus must visibly expand the thumb hit indicator')
      } finally {
        await page.close()
      }
    }
  }
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
  await mobile.goto(origin, { waitUntil: 'domcontentloaded' })
  const bounds = await mobile.evaluate(() => {
    const rect = selector => {
      const box = document.querySelector(selector).getBoundingClientRect()
      return { top: box.top, bottom: box.bottom }
    }
    return {
      track: rect('.centered-scrollbar'), thumb: rect('.centered-scrollbar-thumb'),
      header: rect('.site-header'), tabs: rect('.mobile-tabbar'),
      native: getComputedStyle(document.documentElement).scrollbarWidth,
      display: getComputedStyle(document.querySelector('.centered-scrollbar')).display,
    }
  })
  assert.equal(bounds.display, 'block', 'mobile page scrollbar is rendered')
  assert.equal(bounds.native, 'none', 'native full-viewport scrollbar is replaced')
  assert(near(bounds.track.top, bounds.header.bottom), 'scrollbar overlaps mobile masthead')
  assert(near(bounds.track.bottom, bounds.tabs.top), 'scrollbar overlaps mobile tab navigation')
  assert(bounds.thumb.top >= bounds.track.top, 'thumb spills into header')
  assert(bounds.thumb.bottom <= bounds.track.bottom, 'thumb spills into bottom tabs')
  console.log(JSON.stringify({ width: 375, containedScrollbar: true, pass: true }))
  await mobile.close()
} finally {
  await browser.close()
}
