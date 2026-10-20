import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const pages = []
const within = (actual, expected, tolerance = 1) => Math.abs(actual - expected) <= tolerance
try {
  await mkdir('artifacts/sidebar-explorer', { recursive: true })
  for (const theme of ['light', 'dark']) {
    for (const width of [1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
      pages.push(page)
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.evaluate((value) => { document.documentElement.dataset.theme = value }, theme)
      const panel = page.locator('.sidebar--explorer')
      await panel.waitFor()
      const geometry = await panel.evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const footer = node.querySelector('.sidebar-footer').getBoundingClientRect()
        const scroll = node.querySelector('.sidebar-scroll').getBoundingClientRect()
        return { width: rect.width, footerBottom: footer.bottom, footerTop: footer.top, panelBottom: rect.bottom, scrollBottom: scroll.bottom,
          border: getComputedStyle(node.querySelector('.side-group + .side-group')).borderTopWidth,
          footerPseudo: getComputedStyle(node.querySelector('.sidebar-footer'), '::before').content,
          recentBottom: node.querySelector('.side-recent-items').getBoundingClientRect().bottom,
          background: getComputedStyle(node).backgroundColor,
          footerBackground: getComputedStyle(node.querySelector('.sidebar-footer')).backgroundColor,
          overflow: node.scrollWidth > node.clientWidth + 1 }
      })
      assert(within(geometry.width, 296 - 52), `Panel should fill 296px sidebar minus 52px rail: ${JSON.stringify(geometry)}`)
      assert(within(geometry.panelBottom, geometry.footerBottom), 'Explorer footer should remain docked to bottom')
      assert(within(geometry.scrollBottom, geometry.footerTop), 'Scrollable content must terminate above docked footer')
      assert.equal(geometry.border, '1px', 'Sections must use structural hairline separators')
      assert.equal(geometry.footerPseudo, 'none', 'Legacy decorative footer volume must not duplicate the visible volume label')
      assert(geometry.recentBottom <= geometry.footerTop + 1, 'Recent entries must be visible above the footer at 900px viewport height')
      assert.notEqual(geometry.background, geometry.footerBackground, 'Footer must have distinct opaque inset surface')
      assert.equal(geometry.overflow, false, 'Explorer must not overflow horizontally')
      assert.equal(await page.locator('.side-nav-row').count(), 8, 'Collections and five subjects should be visible')
       assert.equal(await page.locator('.side-recent-items .side-article').count(), 3, 'Recent article list should stay dense and bounded')
       assert.equal(await panel.locator('.side-group--journal .side-nav-row').count(), 7, 'The journal domain contains two destinations and five subjects')
       assert.equal(await panel.locator('.side-group--papers .side-paper-entry').count(), 2, 'Scientific papers must have dedicated document links')
       assert(!/\\bvol(?:ume|\\.)\\b/i.test(await panel.innerText()), 'Explorer must not display volume labels')
      const references = await panel.locator('.side-recent-items .side-article-ref').allTextContents()
      assert.equal(new Set(references).size, references.length, 'Recent records must have distinct reference IDs')
      if (theme === 'dark') {
        const surfaces = await page.evaluate(() => ({
          panel: getComputedStyle(document.querySelector('.sidebar--explorer')).backgroundColor,
          wrapper: getComputedStyle(document.querySelector('.sidebar-wrap')).backgroundColor,
        }))
        assert.equal(surfaces.panel, surfaces.wrapper, 'Dark explorer surface must match the sidebar shell')
      }
      const toggler = panel.getByRole('button', { name: /Subjects/ })
      await toggler.click()
      assert.equal(await toggler.getAttribute('aria-expanded'), 'false')
      assert.equal(await page.locator('#side-subject-items').count(), 0)
      await toggler.click()
      assert.equal(await page.locator('#side-subject-items .side-nav-row').count(), 5)
       await panel.getByRole('button', { name: 'All manuscripts' }).click()
       await page.locator('.research-page').waitFor()
       assert.equal(await panel.getByRole('button', { name: 'All manuscripts' }).getAttribute('aria-current'), 'page')
       await panel.locator('.side-paper-entry').first().click()
       await page.locator('.research-body').waitFor()
       assert.equal(await panel.locator('.side-paper-entry[aria-current="page"]').count(), 1, 'Selected paper should be highlighted independently of journal articles')
      await panel.getByRole('button', { name: 'Research notes' }).click()
      await page.locator('.workspace-heading-line h1').waitFor()
      assert((await page.locator('.workspace-heading-line h1').innerText()).includes('Research'))
      assert.equal(await panel.getByRole('button', { name: 'Research notes' }).getAttribute('aria-current'), 'page')
       await panel.getByRole('button', { name: 'Saved articles' }).click()
       assert((await page.locator('.workspace-heading-line h1').innerText()).includes('Saved entries'))
      await page.locator('.side-recent-items .side-article').first().click()
      await page.locator('.article-main').waitFor()
      assert.equal(await page.locator('.side-recent-items .side-article[aria-current="page"]').count(), 1)
      const selectedTitle = await page.locator('.side-recent-items .side-article[aria-current="page"] .side-article-title').innerText()
      assert(selectedTitle.length > 0)
      console.log(JSON.stringify({ width, theme, panelWidth: geometry.width, navigation: true, pass: true }))
      if (width === 1440) {
        await panel.getByRole('button', { name: 'All articles' }).click()
        await page.locator('.sidebar-wrap').screenshot({ path: `artifacts/sidebar-explorer/${theme}-1440.png` })
      }
      await page.close()
    }
  }
  const contextual = await browser.newPage({ viewport: { width: 1440, height: 850 } })
  await contextual.goto(origin + 'posts/four-axis-lyophilization/', { waitUntil: 'domcontentloaded' })
  await contextual.locator('.article-main').waitFor()
  assert.equal(await contextual.locator('.side-group--current .side-article[aria-current="page"]').count(), 1, 'Older selected documents should remain findable')
  console.log(JSON.stringify({ contextualReading: true, pass: true }))
  await contextual.close()
} finally {
  await Promise.all(pages.map((page) => page.isClosed() ? undefined : page.close().catch(() => {})))
  await browser.close()
}
