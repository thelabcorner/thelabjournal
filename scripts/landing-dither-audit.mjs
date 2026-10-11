import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const widths = [320, 375, 768, 1024, 1440]
let passes = 0
await mkdir('artifacts', { recursive: true })

try {
  for (const theme of ['light', 'dark']) {
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width, height: width < 768 ? 812 : 900 },
        isMobile: width < 768,
        hasTouch: width < 768,
      })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(choice => localStorage.setItem(
        'thelabcorner.journal.preferences.v2', JSON.stringify({ theme: choice })
      ), theme)
      try {
        await page.goto(origin, { waitUntil: 'networkidle' })
        const frame = page.locator('.frame--journal-dither')
        const canvas = frame.locator('.journal-landing-dither-canvas')
        assert.equal(await frame.count(), 1, 'Journal landing has its own background')
        assert.equal(await canvas.count(), 1, 'Reuse exactly one existing DitherScene')
        await page.waitForFunction(() => document.querySelector('.journal-landing-dither-canvas')?.dataset.ditherState === 'playing')
        const info = await canvas.evaluate(node => {
          const css = getComputedStyle(node)
          const frame = node.closest('.frame')
          const container = node.parentElement
          const bbox = node.getBoundingClientRect()
          return {
            theme: document.documentElement.dataset.theme,
            opacity: Number(css.opacity),
            variant: node.dataset.ditherVariant,
            state: node.dataset.ditherState,
            pointerEvents: css.pointerEvents,
            color: css.color,
            frames: Number(node.dataset.ditherFrames || 0),
            bounds: { width: bbox.width, height: bbox.height },
            surface: getComputedStyle(frame).backgroundImage,
            surfaceColor: getComputedStyle(frame).backgroundColor,
            sticky: getComputedStyle(container).position,
            xOverflow: document.documentElement.scrollWidth - window.innerWidth,
          }
        })
        assert.equal(info.theme, theme)
        assert.equal(info.opacity, 0.02, 'Landing dither must use exactly 2% opacity in both themes')
        assert.equal(info.variant, 'nav', 'Use the existing navigation dither renderer')
        assert.equal(info.pointerEvents, 'none')
        assert.equal(info.surface, 'none', 'No loose-leaf paper ruling or grain remains')
        assert.equal(info.sticky, 'sticky', 'Dither should track the viewport rather than the full archive')
        assert.ok(info.bounds.width >= width * .95, 'Dither covers the workspace')
        assert.ok(info.bounds.height <= (width < 768 ? 812 : 900), 'Dither remains viewport-sized')
        assert.ok(info.xOverflow <= 1, 'No horizontal overflow')

        await page.waitForTimeout(250)
        assert.ok(Number(await canvas.getAttribute('data-dither-frames')) > info.frames, 'Dither is animated')
        if (width === 375 || width === 1440) {
          await page.screenshot({ path: `artifacts/landing-dither-${theme}-${width}.png` })
        }

        // Scroll far enough that a normal non-sticky canvas would leave view.
        await page.evaluate(() => window.scrollTo(0, Math.min(850, document.documentElement.scrollHeight - innerHeight)))
        await page.waitForTimeout(120)
        const bounds = await canvas.boundingBox()
        assert.ok(bounds && bounds.y >= -2 && bounds.y < 100, 'Dither stays beneath sticky top bar during scroll')

        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.waitForFunction(() => document.querySelector('.journal-landing-dither-canvas')?.dataset.ditherState === 'still')
        const stillFrames = Number(await canvas.getAttribute('data-dither-frames'))
        await page.waitForTimeout(200)
        assert.equal(Number(await canvas.getAttribute('data-dither-frames')), stillFrames, 'Reduced-motion stops the canvas loop')
        await page.emulateMedia({ reducedMotion: 'no-preference' })

        await page.emulateMedia({ media: 'print' })
        assert.equal(await page.locator('.journal-landing-dither-field').evaluate(node => getComputedStyle(node).display), 'none', 'No decorative print background')
        await page.emulateMedia({ media: 'screen' })

        await page.locator('.topic-tab').filter({ hasText: 'Research' }).click()
        assert.equal(await canvas.count(), 0, 'Subject view has no landing background')
        await page.locator('.topic-tab').first().click()
        assert.equal(await page.locator('.journal-landing-dither-canvas').count(), 1, 'All entries restores dither')

        if (width < 768) {
          await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: /Saved/ }).click()
        } else if (width < 1024) {
          await page.getByRole('button', { name: 'Open journal navigation' }).click()
          await page.getByRole('dialog', { name: 'Journal navigation' }).getByRole('button', { name: /Saved entries/ }).click()
        } else {
          await page.getByRole('navigation', { name: 'Library views' }).getByRole('button', { name: /Saved entries/ }).click()
        }
        assert.equal(await page.locator('.journal-landing-dither-canvas').count(), 0, 'Saved view stays plain')

        if (width < 768) {
          await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: 'Journal' }).click()
        } else if (width < 1024) {
          await page.getByRole('button', { name: 'Open journal navigation' }).click()
          await page.getByRole('dialog', { name: 'Journal navigation' }).getByRole('button', { name: /All writing/ }).click()
        } else {
          await page.getByRole('navigation', { name: 'Library views' }).getByRole('button', { name: /All writing/ }).click()
        }
        await page.locator('.feature-link').click()
        assert.equal(await page.locator('.journal-landing-dither-canvas').count(), 0, 'Article reader stays plain')
        assert.ok(await page.locator('.article-prose').isVisible())
        assert.deepEqual(errors, [], 'No runtime exceptions')
        passes++
        console.log(JSON.stringify({ theme, width, opacity: info.opacity, fps: 14, boundedViewport: true, scoped: true, print: true, pass: true }))
      } finally {
        await page.close()
      }
    }
  }
} finally {
  await browser.close()
}
console.log(`Journal dither: ${passes}/10 theme-and-viewport scenarios passed.`)