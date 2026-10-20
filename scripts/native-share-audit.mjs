import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const targets = [
  { path: 'research/gravimetric-decarboxylation-co2-progress/', kind: 'manuscript', title: 'Estimating Decarboxylation Progress' },
  { path: 'posts/learning-in-reverse/', kind: 'article', title: 'Learning in reverse' },
]
const modes = ['native', 'canceled', 'unavailable', 'rejected']
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
let passed = 0
try {
  for (const width of [390, 1440]) for (const target of targets) for (const mode of modes) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
      serviceWorkers: 'block',
      reducedMotion: 'reduce',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(({ mode }) => {
      window.__shareAudit = { native: [], copies: [], activation: [] }
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: mode === 'unavailable' ? undefined : async payload => {
          window.__shareAudit.native.push(payload)
          window.__shareAudit.activation.push(navigator.userActivation?.isActive)
          if (mode === 'canceled') throw new DOMException('User canceled sharing', 'AbortError')
          if (mode === 'rejected') throw new DOMException('Sharing disallowed', 'NotAllowedError')
        },
      })
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async url => { window.__shareAudit.copies.push(url) } },
      })
    }, { mode })
    try {
      const expected = new URL(target.path, origin)
      await page.goto(expected.href, { waitUntil: 'domcontentloaded' })
      const button = target.kind === 'manuscript'
        ? page.locator('.research-reader-share')
        : page.locator('.reading-controls').getByRole('button', { name: /Share article|Copy article link/ })
      await button.waitFor()
      if (mode === 'native' || mode === 'canceled' || mode === 'rejected') {
        assert.match(await button.getAttribute('aria-label'), /Share/)
      } else {
        assert.match(await button.getAttribute('aria-label'), /Copy/)
      }
      await button.click()
      if (mode === 'unavailable' || mode === 'rejected') {
        await page.getByRole('button', { name: 'Link copied' }).waitFor()
      }
      const data = await page.evaluate(() => window.__shareAudit)
      assert.equal(data.native.length, mode === 'unavailable' ? 0 : 1)
      if (data.native.length) {
        assert(data.native[0].title.includes(target.title), 'incorrect native share title')
        assert.equal(data.native[0].url, expected.href, 'native share URL must be the current canonical document')
        assert.equal(data.activation[0], true, 'share was not invoked during transient user activation')
      }
      if (mode === 'unavailable' || mode === 'rejected') {
        assert.deepEqual(data.copies, [expected.href], 'fallback must copy only after unavailable/failed share')
      } else {
        assert.equal(data.copies.length, 0, 'successful or canceled native sharing must never write clipboard')
        assert.equal(await page.getByRole('button', { name: 'Link copied' }).count(), 0)
      }
      assert.equal(errors.length, 0, errors.join('; '))
      passed++
      console.log(JSON.stringify({ width, kind: target.kind, mode, invoked: data.native.length, copied: data.copies.length, pass: true }))
    } finally { await page.close() }
  }
} finally { await browser.close() }
console.log('Native share and copy fallback: ' + passed + ' verified cases.')