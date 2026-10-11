import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox']
})
const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const sizes = [
  { width: 320, height: 700 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
]
let failures = 0
for (const { width, height } of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 768, isMobile: width < 768 })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const findings = { width, height, pass: true }
  const checkOverflow = async (place) => {
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }))
    findings[place] = metrics
    if (metrics.document > metrics.viewport + 1 || metrics.body > metrics.viewport + 1) throw new Error('Horizontal overflow at ' + place + ': ' + JSON.stringify(metrics))
  }
  try {
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 25000 })
    if (await page.title() !== 'thelabjournal™') throw new Error('Homepage title does not match thelabjournal™ branding')
    if (await page.getByRole('button', { name: 'thelabjournal™ home' }).innerText() !== 'thelabjournal™') throw new Error('Header brand is not one word')
    await page.getByRole('heading', { name: 'Journal', exact: false }).first().waitFor()
    await checkOverflow('home')
    if (await page.locator('#journal-sort').inputValue() !== 'subject') throw new Error('Archive should default to sorting by subject')
    const rowBadges = page.locator('.journal-row .row-type .badge')
    if (await rowBadges.count() < 2) throw new Error('Journal category badges missing')
    if (await rowBadges.first().innerText() !== 'Essays') throw new Error('Subject grouping does not start with Essays')
    if (width < 768) {
      const meta = page.locator('.journal-row .row-mobile-meta').first()
      const badge = meta.locator('.badge')
      if (!await badge.isVisible()) throw new Error('Mobile category badge not visible')
      const spacing = await meta.evaluate((el) => {
        const badge = el.querySelector('.badge').getBoundingClientRect()
        const date = el.querySelector('.badge + span').getBoundingClientRect()
        return { display:getComputedStyle(el).display, gap:parseFloat(getComputedStyle(el).columnGap), inlineDistance:date.left - badge.right, wrapped:date.top > badge.bottom }
      })
      if (spacing.display !== 'flex' || spacing.gap < 10 || (!spacing.wrapped && spacing.inlineDistance < 10))
        throw new Error('Badge-to-date spacing is too tight: ' + JSON.stringify(spacing))
    }
    await page.locator('#journal-sort').selectOption('short')
    if (await page.locator('#journal-sort').inputValue() !== 'short') throw new Error('Shortest sort cannot be selected')
    await page.locator('#journal-sort').selectOption('subject')
    await checkOverflow('sorted')
    if (width < 768) {
      const tabbar = page.getByRole('navigation', { name: 'Mobile primary navigation' })
      if (!await tabbar.isVisible()) throw new Error('Mobile navigation missing')
      const targets = await tabbar.locator('button').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height))
      if (targets.some((value) => value < 44)) throw new Error('Bottom-tab touch targets too small ' + targets)
      await tabbar.getByRole('button', { name: 'Browse' }).click()
      const drawer = page.getByRole('dialog', { name: 'Journal navigation' })
      await drawer.waitFor()
      await checkOverflow('drawer')
      await page.keyboard.press('Escape')
      if (await drawer.count()) throw new Error('Escape failed to close drawer')
    }
    const first = page.locator('.journal-row').first()
    await first.getByRole('button', { name: /^Save / }).click()
    if (width < 768) await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: /Saved/ }).click()
    else if (width < 1024) { await page.getByRole('button', { name: 'Open journal navigation' }).click(); await page.getByRole('dialog', { name: 'Journal navigation' }).getByRole('button', { name: /Saved entries/ }).click() }
    else await page.getByRole('navigation', { name: 'Library views' }).getByRole('button', { name: /Saved entries/ }).click()
    await page.getByRole('heading', { name: /Saved entries/ }).waitFor()
    if (await page.locator('.journal-row').count() !== 1) throw new Error('Saved view failed to filter entries')
    await page.reload({ waitUntil: 'networkidle' })
    if (!await page.getByRole('button', { name: /^Remove .* from saved$/ }).first().count()) throw new Error('Saved state failed after reload')
    // Reload intentionally resets view; restore bookmark then continue.
    if (width < 768) await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('button', { name: 'Journal' }).click()
    const link = page.locator('.feature-link')
    await link.click()
    await page.getByRole('heading', { name: /Learning in reverse: what AI changed about how I build/ }).waitFor()
    if (!await page.locator('.article-category .badge').isVisible()) throw new Error('Article category badge missing')
    await checkOverflow('article')
    await page.goBack({ waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Journal/ }).first().waitFor()
    await page.goForward({ waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: /Learning in reverse: what AI changed about how I build/ }).waitFor()
    const sections = await page.locator('.prose-section').count()
    if (sections !== 6) throw new Error('Article section count: ' + sections)
    if (width <= 1250) {
      const jump = page.locator('#article-jump')
      if (!await jump.isVisible()) throw new Error('Reader section selector missing')
      await jump.selectOption('2')
      await page.waitForTimeout(450)
      if (await page.locator('#section-3').count() !== 1) throw new Error('Section navigation failed')
    }
    await page.keyboard.press('Control+k')
    const dialog = page.getByRole('dialog', { name: 'Search the journal' })
    if (!await dialog.isVisible()) throw new Error('Global search failed to open')
    await dialog.getByRole('textbox', { name: 'Search entries' }).fill('vectorization')
    if (!await dialog.getByRole('button', { name: /Recovering geometry from pixels/ }).count()) throw new Error('Search results missing')
    await page.keyboard.press('Escape')
    if (await dialog.count()) throw new Error('Search dialog failed to close')
    await page.getByRole('button', { name: 'Journal', exact: true }).filter({ has: page.locator('svg') }).last().count()
    await page.getByRole('button', { name: 'Journal', exact: true }).first().click().catch(async () => page.locator('.reading-back').click())
    await page.getByRole('heading', { name: /Journal/ }).first().waitFor()
    await checkOverflow('returned')
    if (width === 375 || width === 1440) {
      await page.screenshot({ path: 'artifacts/journal-home-' + width + '.png', fullPage: true })
      await page.locator('.feature-link').click()
      await page.screenshot({ path: 'artifacts/journal-essay-' + width + '.png', fullPage: true })
    }
  } catch (error) {
    findings.pass = false
    findings.error = error.message
    failures++
  }
  findings.pageErrors = errors
  if (errors.length && findings.pass) { findings.pass = false; failures++ }
  console.log(JSON.stringify(findings))
  await page.close()
}
await browser.close()
if (failures) process.exit(1)
