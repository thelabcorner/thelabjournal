import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const near = (a, b, tolerance = 1) => Math.abs(a - b) <= tolerance
const dist = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]))

try {
  for (const reducedMotion of [false, true]) {
    for (const theme of ['light', 'dark']) {
      for (const width of [375, 1024, 1440, 1680, 1920, 2560]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
        })
        try {
          await page.addInitScript((next) => {
            localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({
              theme: next, textScale: 'normal', layout: 'list',
            }))
          }, theme)
          await page.goto(origin, { waitUntil: 'domcontentloaded' })
          await page.locator('.frame').waitFor()
          await page.waitForFunction((next) => document.documentElement.dataset.theme === next, theme)
          const read = () => page.evaluate(() => {
            const frame = document.querySelector('.frame')
            const header = document.querySelector('.site-header')
            const sidebar = document.querySelector('.sidebar-wrap')
            const rail = document.querySelector('.desktop-rail')
            const fields = document.querySelector('.journal-gutter-fields')
            const rect = (node) => {
              const { left, right, width, height } = node.getBoundingClientRect()
              return { left, right, width, height }
            }
            const rgb = el => {
              const canvas = document.createElement('canvas')
              canvas.width = canvas.height = 1
              const ctx = canvas.getContext('2d', { willReadFrequently: true })
              ctx.fillStyle = getComputedStyle(el).backgroundColor
              ctx.fillRect(0, 0, 1, 1)
              return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3)
            }
            return {
              frame: rect(frame),
              header: rect(header),
              fieldsDisplay: getComputedStyle(fields).display,
              fieldsPointer: getComputedStyle(fields).pointerEvents,
              strips: [...fields.querySelectorAll('.journal-gutter-field')].map(field => {
                const canvas = field.querySelector('canvas')
                const style = getComputedStyle(field)
                return {
                  box: rect(field),
                  mask: style.maskImage,
                  pointer: style.pointerEvents,
                  canvasVariant: canvas?.dataset.ditherVariant,
                  canvasState: canvas?.dataset.ditherState,
                  canvasFrames: Number(canvas?.dataset.ditherFrames || 0),
                  canvasWidth: canvas?.width,
                  canvasHeight: canvas?.height,
                  canvasOpacity: getComputedStyle(canvas).opacity,
                  canvasFalloff: canvas?.dataset.ditherFalloff,
                  // Average per-pixel alpha in two equal-width interior and
                  // exterior regions. This detects both invisibility and a
                  // missing per-dot taper instead of trusting CSS opacity.
                  visibleInk: (() => {
                    if (!canvas?.width || !canvas?.height) return null
                    const { width, height } = canvas
                    const ctx = canvas.getContext('2d', { willReadFrequently: true })
                    if (!ctx) return null
                    const data = ctx.getImageData(0, 0, width, height).data
                    const sums = [0, 0]
                    const counts = [0, 0]
                    for (let y = Math.floor(height * .2); y < Math.floor(height * .65); y += 3) {
                      for (let x = 0; x < width; x += 3) {
                        const half = (x < width / 2) === (field.classList.contains('journal-gutter-field--left')) ? 1 : 0
                        sums[half] += data[(y * width + x) * 4 + 3]
                        counts[half]++
                      }
                    }
                    // Edge/corner sampling catches a rectangular cutout even
                    // when its central mean happens to look well tapered.
                    const bandAlpha = (x0, x1, y0, y1) => {
                      let sum = 0, count = 0
                      for (let y = Math.floor(y0 * height); y < Math.ceil(y1 * height); y += 3) {
                        for (let x = Math.floor(x0 * width); x < Math.ceil(x1 * width); x += 3) {
                          sum += data[(y * width + x) * 4 + 3]
                          count++
                        }
                      }
                      return sum / Math.max(1, count)
                    }
                    return {
                      near: sums[0] / counts[0], far: sums[1] / counts[1],
                      outerEdge: field.classList.contains('journal-gutter-field--left')
                        ? bandAlpha(0, .07, 0, 1) : bandAlpha(.93, 1, 0, 1),
                      topEdge: bandAlpha(0, 1, 0, .025),
                      bottomEdge: bandAlpha(0, 1, .975, 1),
                      vertical: Array.from({ length: 5 }, (_, i) =>
                        bandAlpha(.15, .85, i / 5, (i + 1) / 5)),
                    }
                  })(),
                }
              }),
              headerDitherVariant: header.querySelector('.header-dither-canvas')?.dataset.ditherVariant,
              scrollbar: document.querySelector('.centered-scrollbar')?.getBoundingClientRect().width || 0,
              nativeScroll: getComputedStyle(document.documentElement).scrollbarWidth,
              viewportWidth: window.innerWidth,
              docWidth: document.documentElement.scrollWidth,
              colors: {
                body: rgb(document.body),
                frame: rgb(frame),
                sidebar: rgb(sidebar),
                rail: rgb(rail),
              },
              headerShadow: getComputedStyle(header).boxShadow,
              sidebarBorder: getComputedStyle(sidebar).borderRightWidth,
              railBorder: getComputedStyle(rail).borderRightWidth,
            }
          })
          if (width >= 1680) {
            await page.waitForFunction(
              () => [...document.querySelectorAll('.journal-gutter-dither')].every(el =>
                el.dataset.ditherState === (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'still' : 'playing')
                  && Number(el.dataset.ditherFrames || 0) >= 1),
            )
          }
          const result = await read()
          assert(result.docWidth <= result.viewportWidth + 1, `${theme} ${width}px horizontal overflow`)
          assert.equal(result.headerDitherVariant, 'nav')
          assert.equal(result.strips.length, 2)
          assert.equal(result.fieldsPointer, 'none')
          if (width >= 1024) {
            assert.equal(result.sidebarBorder, '1px')
            assert.equal(result.railBorder, '1px')
            assert(near(result.frame.left, result.header.left))
            assert(near(result.frame.right, result.header.right))
            assert.equal(result.scrollbar, 24)
            assert.equal(result.nativeScroll, 'none')
            if (theme === 'dark') {
              assert(dist(result.colors.body, result.colors.frame) > 5, 'dark outer margin and canvas merge')
              assert(dist(result.colors.frame, result.colors.sidebar) > 5, 'dark content and sidebar merge')
              assert(dist(result.colors.sidebar, result.colors.rail) > 3, 'dark navigation surfaces merge')
              assert(result.headerShadow.includes('inset'), 'dark header perimeter strokes lost')
            }
          }
          if (width >= 1680) {
            assert.equal(result.fieldsDisplay, 'block')
            const [left, right] = result.strips
            assert(near(left.box.width, right.box.width), 'gutter widths must be identical')
            assert(near(left.box.right, result.frame.left), 'left dither intrudes into frame')
            assert(near(right.box.left, result.frame.right), 'right dither intrudes into frame')
            for (const field of result.strips) {
              assert.equal(field.pointer, 'none')
              assert.equal(field.canvasVariant, 'nav', 'must reuse the navbar animation, not CSS dots')
              assert(field.canvasWidth > 0 && field.canvasHeight > 0, 'canvas never sized')
              assert.equal(field.mask, 'none', 'the taper must be on each rendered dot, not a CSS vignette')
              assert.equal(field.canvasState, reducedMotion ? 'still' : 'playing')
              assert(field.canvasFrames >= 1, 'side dither did not draw')
              assert(Number(field.canvasOpacity) >= .8, 'side dither is overly dimmed')
              assert(field.canvasFalloff === 'left' || field.canvasFalloff === 'right', 'missing per-dot taper')
              assert(field.visibleInk?.near > field.visibleInk?.far * 1.25,
                `dot density/alpha should visibly taper outward: ${JSON.stringify(field.visibleInk)}`)
              assert(field.visibleInk?.near > 4.5,
                `dither is practically invisible: ${JSON.stringify(field.visibleInk)}`)
              assert(field.visibleInk?.outerEdge < .02,
                `outer strip boundary is visibly rectangular: ${JSON.stringify(field.visibleInk)}`)
              assert(field.visibleInk?.topEdge < .65 && field.visibleInk?.bottomEdge < .65,
                `the field has square top/bottom cutoffs: ${JSON.stringify(field.visibleInk)}`)
            }
            if (!reducedMotion) {
              const before = result.strips.map(s => s.canvasFrames)
              await page.waitForTimeout(420)
              const after = (await read()).strips.map(s => s.canvasFrames)
              assert(after.every((n, i) => n > before[i]), 'real side dither must animate')
            }
            if (reducedMotion) {
              const before = result.strips.map(s => s.canvasFrames)
              await page.waitForTimeout(220)
              const after = (await read()).strips.map(s => s.canvasFrames)
              assert.deepEqual(after, before, 'reduced motion must not animate')
            }
          } else {
            assert.equal(result.fieldsDisplay, 'none', 'gutter effect should not enter small viewport')
          }
          if (width === 1920 && !reducedMotion) {
            await page.screenshot({ path: `artifacts/nav-side-dither-${theme}-1920.png` })
          }
          if (width === 1920 && reducedMotion) {
            await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' })
            const printDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('.journal-gutter-fields')).display)
            assert.equal(printDisplay, 'none', 'printing should omit gutter animation')
          }
          console.log(JSON.stringify({ theme, reducedMotion, width, pass: true }))
        } finally { await page.close() }
      }
    }
  }
} finally { await browser.close() }
console.log('journal navbar-matched animated side gutters: PASS')
