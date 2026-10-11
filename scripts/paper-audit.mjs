import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const sizes = [320, 375, 768, 1024, 1440]
let passed = 0
await mkdir('artifacts', { recursive: true })

try {
  for (const theme of ['light', 'dark']) {
    for (const width of sizes) {
      const page = await browser.newPage({ viewport: { width, height: width < 768 ? 812 : 900 }, isMobile: width < 768, hasTouch: width < 768 })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.addInitScript((choice) => localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({ theme: choice })), theme)
      try {
        await page.goto(origin, { waitUntil: 'networkidle' })
        const paper = page.locator('.frame--journal-paper')
        await paper.waitFor()
        const styles = await paper.evaluate((node) => {
          const css = getComputedStyle(node)
          const main = document.getElementById('main')
          return {
            theme: document.documentElement.dataset.theme,
            background: css.backgroundColor,
            image: css.backgroundImage,
            gutter: css.getPropertyValue('--journal-paper-gutter').trim(),
            mainBackground: getComputedStyle(main).backgroundColor,
            xOverflow: document.documentElement.scrollWidth - window.innerWidth,
          }
        })
        assert.equal(styles.theme, theme)
        assert.ok(styles.image.includes('repeating-linear-gradient'), 'Missing paper ruling')
        assert.ok(styles.image.includes('radial-gradient'), 'Missing subtle paper fiber')
        assert.ok(styles.image.includes('linear-gradient'), 'Missing margin rule')
        assert.equal(styles.gutter, width < 768 ? '9px' : width < 1024 ? '12px' : '275px')
        assert.ok(styles.xOverflow <= 1, 'Journal paper caused horizontal overflow')
        assert.notEqual(styles.background, 'rgba(0, 0, 0, 0)', 'Paper surface must be opaque')

        if (width === 375 || width === 1440) {
          await page.screenshot({ path: `artifacts/paper-${theme}-${width}.png` })
        }

        if (width >= 1024) {
          await page.getByRole('button', { name: 'Collapse sidebar' }).click()
          assert.equal(await paper.evaluate((node) => getComputedStyle(node).getPropertyValue('--journal-paper-gutter').trim()), '75px', 'Collapsed rail must move the paper margin')
          await page.getByRole('button', { name: 'Expand sidebar' }).click()
          assert.equal(await paper.evaluate((node) => getComputedStyle(node).getPropertyValue('--journal-paper-gutter').trim()), '275px', 'Expanding rail must restore the margin')
        }

        await page.emulateMedia({ media: 'print' })
        assert.equal(await paper.evaluate((node) => getComputedStyle(node).backgroundImage), 'none', 'Decorative paper should not consume print ink')
        await page.emulateMedia({ media: 'screen' })

        await page.locator('.topic-tab').filter({ hasText: 'Research' }).click()
        assert.equal(await page.locator('.frame--journal-paper').count(), 0, 'Topic view must remain plain')
        await page.locator('.topic-tab').first().click()
        assert.equal(await page.locator('.frame--journal-paper').count(), 1, 'Returning to Journal should restore paper')

        if (width < 768) {
          await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: /Saved/ }).click()
        } else if (width < 1024) {
          await page.getByRole('button', { name: 'Open journal navigation' }).click()
          await page.getByRole('dialog', { name: 'Journal navigation' }).getByRole('button', { name: /Saved entries/ }).click()
        } else {
          await page.getByRole('navigation', { name: 'Library views' }).getByRole('button', { name: /Saved entries/ }).click()
        }
        assert.equal(await page.locator('.frame--journal-paper').count(), 0, 'Saved view must remain plain')
        if (width < 768) {
          await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: 'Journal' }).click()
        } else if (width < 1024) {
          await page.getByRole('button', { name: 'Open journal navigation' }).click()
          await page.getByRole('dialog', { name: 'Journal navigation' }).getByRole('button', { name: /All writing/ }).click()
        } else {
          await page.getByRole('navigation', { name: 'Library views' }).getByRole('button', { name: /All writing/ }).click()
        }
        assert.equal(await page.locator('.frame--journal-paper').count(), 1)
        await page.locator('.feature-link').click()
        assert.equal(await page.locator('.frame--journal-paper').count(), 0, 'Article reader must remain plain')
        assert.ok(await page.locator('.article-prose').isVisible())
        assert.deepEqual(errors, [], 'Browser errors')
        passed++
        console.log(JSON.stringify({ theme, width, paper: true, print: true, scoped: true, overflow: false }))
      } finally {
        await page.close()
      }
    }
  }
} finally {
  await browser.close()
}
console.log(`Paper audit: ${passed}/10 responsive/theme combinations passed.`)