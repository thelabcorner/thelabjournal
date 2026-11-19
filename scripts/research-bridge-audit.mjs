/**
 * Regression guard for the homepage Formal research bridge.
 *
 * Important: ResearchPage is lazy-loaded. Its research.css must never own the
 * styling for this eagerly rendered homepage link.
 *
 * Run: JOURNAL_TEST_ORIGIN=http://127.0.0.1:4199 node scripts/research-bridge-audit.mjs
 */
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve(import.meta.dirname, '..')
const [shell, lazy, entrypoint] = await Promise.all([
  readFile(resolve(root, 'src/app-shell.css'), 'utf8'),
  readFile(resolve(root, 'src/research.css'), 'utf8'),
  readFile(resolve(root, 'src/main.tsx'), 'utf8'),
])
assert.match(entrypoint, /import ['"]\.\/app-shell\.css['"]/, 'Homepage CSS must be eagerly imported')
assert.match(shell, /\.journal-research-bridge\s*\{/, 'Eager shell must own bridge styling')
assert.doesNotMatch(lazy, /\.journal-research-bridge\b/, 'Lazy research stylesheet must not override homepage bridge')

const output = resolve(root, 'artifacts/research-bridge-qa')
await mkdir(output, { recursive: true })
const origin = process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4199'
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox'] })
const report = []

try {
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 768, 390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, colorScheme: theme })
      const errors = []
      page.on('pageerror', error => errors.push(String(error)))
      await page.goto(origin + '/', { waitUntil: 'domcontentloaded', timeout: 30000 })
      const button = page.locator('button.journal-research-bridge')
      await button.waitFor({ state: 'visible', timeout: 15000 })
      await page.evaluate(() => document.fonts.ready)
      const result = await button.evaluate(el => {
        const [icon, content, arrow] = el.children
        const [heading, description] = content.children
        const css = getComputedStyle(el)
        const rect = node => { const { x, y, width, height } = node.getBoundingClientRect(); return { x, y, width, height } }
        return {
          display: css.display,
          radius: parseFloat(css.borderTopLeftRadius),
          border: parseFloat(css.borderTopWidth),
          background: css.backgroundColor,
          expectedBackground: getComputedStyle(document.documentElement).getPropertyValue('--inset').trim(),
          padding: css.padding,
          button: rect(el),
          icon: rect(icon),
          title: rect(heading),
          description: rect(description),
          arrow: rect(arrow),
          titleText: heading.textContent?.trim(),
          descriptionText: description.textContent?.trim(),
          descriptionColor: getComputedStyle(description).color,
          titleColor: getComputedStyle(heading).color,
        }
      })
      assert.equal(result.display, 'flex', 'Restore the original flex layout at ' + width + 'px')
      assert.equal(result.radius, 7, 'Restore the original 7px radius')
      assert.equal(result.border, 0, 'Original card has no border')
      assert.equal(result.padding, '10px 15px', 'Original card uses compact 10px 15px padding')
      assert.equal(result.titleText, 'Formal research')
      assert.match(result.descriptionText, /scientific manuscripts/)
      assert.ok(result.icon.x < result.title.x && result.arrow.x > result.title.x)
      assert.ok(result.title.y < result.description.y, 'Title and subtitle must be separate rows')
      assert.ok(result.title.y >= result.button.y && result.description.y + result.description.height <= result.button.y + result.button.height + 1)
      assert.ok(result.arrow.x + result.arrow.width <= result.button.x + result.button.width)
      assert.ok(result.button.x >= 0 && result.button.x + result.button.width <= width + 1)
      assert.notEqual(result.descriptionColor, result.titleColor, 'Caption must remain subordinate')
      assert.deepEqual(errors, [], 'Homepage emitted JavaScript errors')
      await button.screenshot({ path: resolve(output, 'research-bridge-' + theme + '-' + width + '.png') })
      report.push({ theme, width, display: result.display, border: result.border, radius: result.radius, padding: result.padding, buttonHeight: result.button.height, title: result.titleText, errorCount: errors.length })
      await page.close()
    }
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify({ passed: report.length, report }, null, 2))
