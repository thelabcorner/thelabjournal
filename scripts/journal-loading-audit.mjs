/**
 * Exercise the real Suspense fallback while deferred route chunks are held.
 * Run with a local Vite server: node scripts/journal-loading-audit.mjs
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_TEST_ORIGIN ?? 'http://127.0.0.1:4197'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const routes = [
  { path: '/research/', chunk: /\/src\/ResearchPage\.tsx$/, label: 'Preparing research…' },
  { path: '/quotes/', chunk: /\/src\/quotes\/QuotesPage\.tsx$/, label: 'Opening quotes…' },
]
const findings = []

try {
  for (const route of routes) for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      colorScheme: theme,
      reducedMotion: theme === 'light' ? 'no-preference' : 'reduce',
      serviceWorkers: 'block',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.route('**/*', async request => {
        if (route.chunk.test(new URL(request.request().url()).pathname)) {
          await new Promise(resolve => setTimeout(resolve, 1800))
        }
        await request.continue()
      })
      await page.goto(origin + route.path, { waitUntil: 'domcontentloaded' })
      const loading = page.locator('main.journal-loading--page')
      await loading.waitFor({ state: 'visible', timeout: 12000 })
      const state = await loading.evaluate(node => {
        const inner = node.querySelector('.journal-loading__content')
        const dither = node.querySelector('.journal-loading__dither')
        const dot = node.querySelector('.journal-loading__dot')
        const outer = node.getBoundingClientRect()
        const center = inner.getBoundingClientRect()
        return {
          id: node.id,
          label: node.querySelector('.journal-loading__label')?.textContent,
          count: node.querySelectorAll('.journal-loading__dot').length,
          horizontalDrift: (center.left + center.width / 2) - (outer.left + outer.width / 2),
          verticalDrift: (center.top + center.height / 2) - (outer.top + outer.height / 2),
          minHeight: outer.height,
          ditherWidth: dither.getBoundingClientRect().width,
          animation: getComputedStyle(dot).animationName,
          background: getComputedStyle(node).backgroundColor,
          border: getComputedStyle(node).borderTopWidth,
          status: inner.getAttribute('role'),
        }
      })
      assert.equal(state.id, 'main')
      assert.equal(state.label, route.label)
      assert.equal(state.count, 16)
      assert.equal(state.status, 'status')
      assert.ok(Math.abs(state.horizontalDrift) < 2, 'loader must be horizontally centered')
      assert.ok(Math.abs(state.verticalDrift) < 2, 'loader must be vertically centered')
      assert.ok(state.minHeight >= 300, 'loader must occupy meaningful page space')
      assert.equal(state.ditherWidth, 25)
      assert.equal(state.border, '0px')
      assert.equal(state.background, 'rgba(0, 0, 0, 0)')
      assert.equal(state.animation, theme === 'light' ? 'journal-loading-dither' : 'none')
      await loading.waitFor({ state: 'detached', timeout: 20000 })
      assert.equal(await page.locator('.pwa-route-pending[role="alert"]').count(), 0)
      assert.deepEqual(errors, [])
      findings.push({ path: route.path, theme, width, ...state })
    } finally {
      await page.close()
    }
  }
  console.log(JSON.stringify({ status: 'PASS', scenarios: findings.length, findings }, null, 2))
} finally {
  await browser.close()
}