/**
 * Section 5.7 editorial, responsive, and semantic regression audit.
 * Run while the Vite dev server is available:
 * JOURNAL_TEST_ORIGIN=http://127.0.0.1:4197 bun scripts/manuscript-control-states-audit.mjs
 */
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4197'
const output = resolve(import.meta.dirname, '../artifacts/manuscript-control-states')
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox'] })
const report = []

try {
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        colorScheme: theme,
      })
      const errors = []
      page.on('pageerror', error => errors.push(String(error)))
      await page.goto(origin + '/research/gravimetric-decarboxylation-co2-progress/', { waitUntil: 'domcontentloaded' })
      const model = page.locator('#automation-states + .research-controller-model')
      await model.waitFor({ state: 'visible', timeout: 20000 })
      await page.evaluate(() => document.fonts.ready)
      const measurement = await model.evaluate(element => {
        const figure = element.querySelector('.research-controller-flow')
        const lanes = [...element.querySelectorAll('.research-controller-flow__lane')]
        const faults = element.querySelector('.research-controller-faults')
        const names = [...element.querySelectorAll('.research-controller-flow__name')].map(node => node.textContent)
        const ids = [...element.querySelectorAll('.research-controller-flow__identifier')].map(node => node.textContent)
        const figureRect = figure.getBoundingClientRect()
        const rowRects = [...element.querySelectorAll('.research-controller-faults__row')].map(node => node.getBoundingClientRect())
        const dlRect = faults.getBoundingClientRect()
        return {
          lanes: lanes.length,
          steps: lanes.map(lane => lane.querySelectorAll('ol > li').length),
          states: ids,
          names,
          faultRows: faults.querySelectorAll('dt').length,
          faultResponses: faults.querySelectorAll('dd').length,
          normalStopOutsideFaults: !faults.textContent.includes('Normal stop')
            && Boolean(element.querySelector('.research-controller-model__stop')),
          safety: element.querySelector('.research-controller-model__safety')?.textContent,
          overflow: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, figure.scrollWidth - figure.clientWidth),
          figureWidth: figureRect.width,
          smallestFaultRowWidth: Math.min(...rowRects.map(rect => rect.width)),
          faultWidth: dlRect.width,
          captionTransform: getComputedStyle(figure.querySelector('figcaption strong')).textTransform,
        }
      })
      assert.equal(measurement.lanes, 2)
      assert.deepEqual(measurement.steps, [5, 8])
      assert.equal(measurement.states.length, 13)
      assert.ok(measurement.states.includes('REFERENCE_COOL') && measurement.states.includes('STOPPING'))
      assert.equal(measurement.faultRows, 5)
      assert.equal(measurement.faultResponses, 5)
      assert.equal(measurement.normalStopOutsideFaults, true)
      assert.match(measurement.safety, /pressure relief/)
      assert.equal(measurement.captionTransform, 'none')
      assert.ok(measurement.overflow <= 4, `horizontal overflow at ${width}px / ${theme}: ${measurement.overflow}px`)
      assert.ok(measurement.figureWidth <= width)
      assert.equal(errors.length, 0, errors.join('\n'))
      await model.screenshot({ path: resolve(output, `section-5-7-${theme}-${width}.png`) })
      report.push({ theme, width, ...measurement, errors })
      await page.close()
    }
  }
  process.stdout.write(JSON.stringify(report.map(({ theme, width, steps, faultRows, overflow }) =>
    ({ theme, width, steps, faultRows, overflow })), null, 2) + '\n')
} finally {
  await browser.close()
}