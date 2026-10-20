import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const url = new URL('research/gravimetric-decarboxylation-co2-progress/', origin).href
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const captures = process.env.MANUSCRIPT_CAPTURES !== '0'
if (captures) await mkdir('artifacts/manuscript-visual', { recursive: true })
const whiteTextContrast = (fill) => {
  const values = fill.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  if (!values || values.length !== 3) return 0
  const linear = value => {
    const normalized = value / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * linear(values[0]) + 0.7152 * linear(values[1]) + 0.0722 * linear(values[2])
  return 1.05 / (luminance + 0.05)
}
let checked = 0
const lightSurfaces = new Map()
try {
  for (const width of [320, 390, 768, 1440]) {
    for (const appearance of ['light', 'dark']) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.addInitScript(theme => {
          localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({ theme }))
        }, appearance)
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await page.locator('.research-body #abstract .research-abstract-card').waitFor()
        const measure = await page.evaluate(() => {
          const find = selector => document.querySelector(selector)
          const css = selector => getComputedStyle(find(selector))
          const bounds = selector => {
            const rect = find(selector).getBoundingClientRect()
            return { left: rect.left, right: rect.right, top: rect.top, width: rect.width }
          }
          const abstract = find('#abstract .research-abstract-card')
          const pad = css('#abstract .research-abstract-card')
          const badge = css('#title .research-badge--research')
          const figure = css('.research-reactor-figure')
          const heater = find('.research-reactor-figure svg path[stroke="var(--research-thermal)"]')
          const material = find('.research-reactor-figure svg path[fill="var(--research-material)"]')
          const gas = find('.research-pressure-figure svg path[stroke="var(--research-gas)"]')
          const composition = find('.research-gas-figure svg path[fill="var(--research-gas-fill)"]')
          return {
            windowWidth: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            title: find('#title h1')?.textContent,
            abstractText: abstract.textContent,
            abstract: bounds('#abstract .research-abstract-card'),
            paragraph: bounds('#abstract .research-abstract-card p'),
            padLeft: parseFloat(pad.paddingLeft),
            padRight: parseFloat(pad.paddingRight),
            badgeBorder: parseFloat(badge.borderTopWidth),
            badgeBg: badge.backgroundColor,
            heater: heater && getComputedStyle(heater).stroke,
            material: material && getComputedStyle(material).fill,
            gas: gas && getComputedStyle(gas).stroke,
            compositionFill: composition && getComputedStyle(composition).fill,
            equations: document.querySelectorAll('.research-body .katex').length,
            charts: document.querySelectorAll('.research-body .research-scientific-figure').length,
            theme: document.documentElement.dataset.theme,
          }
        })
        assert.match(measure.title, /gravimetric|decarboxylation/i)
        assert.match(measure.abstractText, /formal publication of Decarboxulator/)
        assert(measure.scrollWidth <= width + 1, 'document horizontal overflow')
        assert(measure.abstract.left >= -1 && measure.abstract.right <= width + 1, 'abstract escapes viewport')
        assert(measure.padLeft >= 14 && measure.padRight >= 14, 'abstract text padding is too tight')
        assert(measure.paragraph.left >= measure.abstract.left + 14, 'abstract text intersects card edge')
        assert(measure.badgeBorder >= 1, 'thesis-inspired badge lost its border')
        assert(measure.equations >= 100, 'scientific equations were lost')
        assert(measure.charts >= 3, 'scientific figures were lost')
        assert(measure.heater && measure.material && measure.gas, 'figure semantic palette did not resolve')
        assert(whiteTextContrast(measure.compositionFill) >= 4.5, 'CO₂ composition label does not reach 4.5:1 contrast')
        assert.notEqual(measure.heater, measure.material, 'heater and material are indistinguishable')
        assert.notEqual(measure.heater, measure.gas, 'heater and gas are indistinguishable')
        if (appearance === 'light') {
          lightSurfaces.set(width, { background: measure.badgeBg, gas: measure.gas })
        } else {
          assert.notEqual(measure.badgeBg, lightSurfaces.get(width).background, 'dark masthead badge failed to repaint')
          assert.notEqual(measure.gas, lightSurfaces.get(width).gas, 'dark diagram strokes failed to repaint')
        }
        assert.equal(errors.length, 0, 'browser errors: ' + errors.join('; '))
        if (captures && (width === 390 || width === 1440)) {
          await page.screenshot({ path: `artifacts/manuscript-visual/masthead-${width}-${appearance}.png` })
          await page.locator('.research-reactor-figure').scrollIntoViewIfNeeded()
          await page.screenshot({ path: `artifacts/manuscript-visual/figures-${width}-${appearance}.png` })
        }
        checked++
        console.log(JSON.stringify({ width, appearance, success: true, abstractPadding: measure.padLeft, badgeBg: measure.badgeBg, figurePalette: [measure.heater, measure.material, measure.gas] }))
      } finally {
        await page.close()
      }
    }
  }
} finally {
  await browser.close()
}
assert.equal(checked, 8)
console.log('8 manuscript design, palette, geometry and semantics checks passed.')