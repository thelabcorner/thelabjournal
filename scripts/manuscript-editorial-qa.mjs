/**
 * Editorial contract for every thelabjournal research abstract and its loading state.
 * Run against a local Vite server: JOURNAL_TEST_ORIGIN=http://127.0.0.1:4197 node scripts/manuscript-editorial-qa.mjs
 */
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4197'
const slugs = [
  'low-temp-lyophilization-three-theses',
  'gravimetric-decarboxylation-co2-progress',
  'thca-limonene-cosmo-rs'
]
const output = resolve(import.meta.dirname, '../artifacts/manuscript-editorial-qa')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox'] })
const report = []

try {
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, colorScheme: theme })
    for (const slug of slugs) {
      const pageErrors = []
      page.on('pageerror', error => pageErrors.push(String(error)))
      await page.goto(origin + '/research/' + slug + '/', { waitUntil: 'domcontentloaded' })
      const abstract = page.locator('#abstract.research-editorial-abstract')
      await abstract.waitFor({ state: 'visible', timeout: 20000 })
      await page.evaluate(() => document.fonts.ready)
      const data = await page.evaluate(() => {
        const root = document.querySelector('#abstract.research-editorial-abstract')
        const surface = root.querySelector('.research-editorial-abstract__surface')
        const body = root.querySelector('.research-editorial-abstract__body')
        const heading = root.querySelector('#abstract-heading')
        const rs = getComputedStyle(root)
        const ss = getComputedStyle(surface)
        const bs = getComputedStyle(body)
        const h = getComputedStyle(heading)
        const rule = getComputedStyle(root.querySelector('.research-editorial-abstract__heading'), '::after')
        const keywords = document.querySelector('#title .research-keywords')
        return {
          theme: document.documentElement.dataset.theme,
          heading: heading.textContent,
          headingTransform: h.textTransform,
          headingRule: rule.content,
          surfacePadding: ss.padding,
          surfaceBorder: ss.borderLeftWidth,
          surfaceRadius: ss.borderRadius,
          surfaceBackground: ss.backgroundColor,
          bodyPadding: bs.padding,
          rootBackground: rs.backgroundColor,
          bodyBackground: bs.backgroundColor,
          rootBorderBottom: rs.borderBottomWidth,
          leftOffset: Number((body.getBoundingClientRect().left - root.getBoundingClientRect().left).toFixed(2)),
          paragraphs: body.querySelectorAll('p').length,
          hasScientificFigure: !!root.querySelector('figure'),
          oldCards: root.querySelectorAll('.research-abstract-card,.lyo-abstract-card').length,
          keywordGroups: document.querySelectorAll('#title .research-keyword-list').length,
          keywordsExpanded: keywords?.open,
          keywordBadges: keywords?.querySelectorAll('.research-keyword-list > span').length,
          repeatedKeywords: [...document.querySelectorAll('.research-body p')].filter(p => /^Keywords\\s*[.:]/i.test(p.textContent.trim())).length,
          overflowPx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        }
      })
      await page.evaluate((viewportWidth) => {
        if (viewportWidth >= 1000) {
          window.scrollTo({ top: 0, behavior: 'instant' })
        } else {
          const element = document.querySelector('#abstract')
          window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' })
        }
      }, width)
      await page.screenshot({ path: resolve(output, slug + '-' + theme + '-' + width + '.jpg'), type: 'jpeg', quality: 72 })
      report.push({ slug, width, ...data, errors: pageErrors })
      assert.equal(data.theme, theme, 'Wrong theme loaded for ' + slug)
      assert.equal(data.heading, 'Abstract', 'Missing heading for ' + slug)
      assert.equal(data.headingTransform, 'none', 'Abstract must be sentence case: ' + slug)
      assert.equal(data.headingRule, 'none', 'Decorative title rule returned: ' + slug)
      assert.equal(data.bodyPadding, '0px', 'Unwanted padded body for ' + slug)
      assert.equal(data.surfaceBorder, '1px', 'Full neutral abstract outline missing: ' + slug)
      assert.ok(Number.parseFloat(data.surfaceRadius) >= 6, 'Abstract corners are not rounded: ' + slug)
      assert.ok(Number.parseFloat(data.surfacePadding) <= 18, 'Abstract padding is excessive: ' + slug)
      assert.equal(data.rootBorderBottom, '0px', 'Duplicate rule after abstract: ' + slug)
      assert.ok(data.leftOffset >= 12 && data.leftOffset <= 19, 'Abstract content inset is inconsistent: ' + slug)
      assert.equal(data.oldCards, 0, 'Legacy card survives for ' + slug)
      assert.equal(data.keywordGroups, 1, 'Keyword list must be owned by metadata: ' + slug)
      assert.equal(data.keywordsExpanded, true, 'Keyword badges must be visible: ' + slug)
      assert.ok(data.keywordBadges > 0, 'Missing keyword badges: ' + slug)
      assert.equal(data.repeatedKeywords, 0, 'Duplicate prose keyword list: ' + slug)
      assert.ok(data.paragraphs > 0, 'Empty abstract for ' + slug)
      assert.ok(data.overflowPx <= 4, 'Unexpected horizontal overflow for ' + slug + ': ' + data.overflowPx)
      assert.deepEqual(pageErrors, [], 'Page error on ' + slug)
    }
    await page.close()
    }
  }

  // Print is a manuscript, not a web card: keep the academic text flow flat.
  const printPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await printPage.goto(origin + '/research/thca-limonene-cosmo-rs/', { waitUntil: 'domcontentloaded' })
  await printPage.locator('#abstract.research-editorial-abstract').waitFor({ state: 'visible', timeout: 20000 })
  await printPage.emulateMedia({ media: 'print' })
  const printSurface = await printPage.locator('#abstract .research-editorial-abstract__surface').evaluate(node => {
    const style = getComputedStyle(node)
    return { border: style.borderLeftWidth, padding: style.padding }
  })
  assert.equal(printSurface.border, '0px', 'Print abstract must not be boxed')
  assert.equal(printSurface.padding, '0px', 'Print abstract must not retain screen insets')
  await printPage.close()

  // Shared NCM loading state: Bayer dither, centered, with no timers or canvas.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  // This lazy route owns the manuscript stylesheet; the research index does not.
  await page.goto(origin + '/research/low-temp-lyophilization-three-theses/', { waitUntil: 'domcontentloaded' })
  await page.locator('#abstract.research-editorial-abstract').waitFor({ state: 'visible', timeout: 20000 })
  const normal = await page.evaluate(() => {
    const shell = document.createElement('div')
    shell.className = 'journal-loading journal-loading--section'
    shell.innerHTML = '<div class="journal-loading__content" role="status">' +
      '<span class="journal-loading__dither" aria-hidden="true">' +
      '<span class="journal-loading__dot"></span>'.repeat(16) +
      '</span><span class="journal-loading__label">Preparing manuscript…</span></div>'
    document.body.append(shell)
    const style = getComputedStyle(shell)
    const dot = getComputedStyle(shell.querySelector('.journal-loading__dot'))
    const result = { border: style.borderTopWidth, background: style.backgroundColor, display: style.display, align: style.alignItems, justify: style.justifyItems, animation: dot.animationName, width: shell.querySelector('.journal-loading__dither').getBoundingClientRect().width }
    shell.remove()
    return result
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await page.evaluate(() => {
    const dot = document.createElement('span')
    dot.className = 'journal-loading__dot'
    document.body.append(dot)
    const animation = getComputedStyle(dot).animationName
    dot.remove()
    return animation
  })
  assert.equal(normal.border, '0px')
  assert.equal(normal.background, 'rgba(0, 0, 0, 0)')
  assert.equal(normal.display, 'grid')
  assert.equal(normal.align, 'center')
  assert.equal(normal.justify, 'center')
  assert.equal(normal.animation, 'journal-loading-dither')
  assert.equal(normal.width, 25)
  assert.equal(reduced, 'none')
  console.log(JSON.stringify({status:'PASS',abstracts:report,loading:{normal,reducedMotionAnimation:reduced}},null,2))
} finally {
  await browser.close()
}
