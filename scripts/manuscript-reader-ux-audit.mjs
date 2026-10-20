import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]
const ids = ['gravimetric-decarboxylation-co2-progress', 'low-temp-lyophilization-three-theses']
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const failures = []
let verified = 0
try {
  for (const width of widths) for (const id of ids) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(new URL('research/' + id + '/', origin).href, { waitUntil: 'domcontentloaded' })
      await page.locator('.research-body #title h1').waitFor({ timeout: 30000 })
      const results = await page.evaluate(() => {
        const position = (selector) => {
          const node = document.querySelector(selector)
          if (!node) return null
          const rect = node.getBoundingClientRect()
          return { left: rect.left, right: rect.right, width: rect.width, center: rect.left + rect.width / 2 }
        }
        const selector = document.querySelector('#introduction')
          ? '#introduction'
          : '#motivation'
        const heading = position(selector + ' h2')
        const paragraph = position(selector + ' p')
        return {
          windowWidth: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          brand: position('.site-header .brand'),
          menu: position('.mobile-nav-toggle'),
          tools: position('.header-end'),
          heading, paragraph,
          number: position(selector + ' .research-heading-number'),
           mobileTOC: Boolean(document.querySelector('.research-mobile-jump')?.getClientRects().length),
            sections: document.querySelector('.research-mobile-jump')?.getAttribute('aria-label') ?? '',
           hasNativeSelect: Boolean(document.querySelector('.research-mobile-contents select')),
          mainWidth: position('.frame')?.width,
          mathCount: document.querySelectorAll('.research-body .katex').length,
          tocWidth: position('.research-document-toc')?.width,
        }
      })
      assert(results.mathCount >= 100, 'source mathematical content did not render')
        if (width <= 767) assert(/^Jump to section, current: .+/.test(results.sections), 'current scientific section missing from sticky picker')
      assert(results.scrollWidth <= width + 1, 'horizontal overflow')
      assert(Math.abs(results.heading.left - results.paragraph.left) <= 1, 'heading/paragraph baseline mismatch')
      assert.equal(Math.round(results.mainWidth), Math.min(width, 1500), 'centered site frame changed')
      if (width <= 767) {
        assert(results.mobileTOC, 'mobile table of contents is missing')
        assert(Math.abs(results.brand.center - width / 2) <= 1, 'mobile logo not centered')
        assert(results.brand.left > results.menu.right + 6, 'brand overlaps menu')
        assert(results.brand.right < results.tools.left - 6, 'brand overlaps tools')
        assert.equal(results.hasNativeSelect, false, 'native section select must not be present')
        const trigger = page.locator('.research-mobile-jump')
        await trigger.click()
        await page.locator('.research-section-menu').waitFor()
        await page.waitForFunction(() => {
          const trigger = document.querySelector('.research-mobile-jump')?.getBoundingClientRect()
          const menu = document.querySelector('.research-section-menu')?.getBoundingClientRect()
          return trigger && menu && Math.abs(menu.top - trigger.bottom - 7) <= 1
        })
        const picker = await page.evaluate(() => {
          const menu = document.querySelector('.research-section-menu').getBoundingClientRect()
          const viewport = document.querySelector('.research-section-scroll .journal-scrollview-viewport')
          const trigger = document.querySelector('.research-mobile-jump')
          return {
            menuLeft:menu.left, menuRight:menu.right, menuBottom:menu.bottom,
            scrollHeight:viewport.scrollHeight, clientHeight:viewport.clientHeight,
            hasCustomTrack:Boolean(document.querySelector('.research-section-scroll .journal-scrollview-track')),
            hasBorder:getComputedStyle(trigger).borderTopWidth !== '0px',
            total:document.querySelectorAll('.research-section-option').length,
          }
        })
        assert(picker.total >= (id === 'low-temp-lyophilization-three-theses' ? 30 : 35),'full manuscript outline is not available')
        assert(picker.scrollHeight > picker.clientHeight, 'section menu should have a bounded real scrollport')
        assert(picker.hasCustomTrack, 'custom ScrollView scrollbar is missing')
        assert(!picker.hasBorder, 'mobile picker should be borderless')
        assert(picker.menuLeft >= 0 && picker.menuRight <= width + 1 && picker.menuBottom <= 900, 'section menu overflows mobile viewport')
        const menuInput = page.getByRole('combobox', { name:'Find a manuscript section' })
        await menuInput.fill('Gauge')
        assert.equal(await page.locator('.research-section-option').count(),id === ids[0] ? 2 : 0)
        await menuInput.fill('')
        const sectionId = id === ids[0] ? 'motivation' : 'introduction'
        await page.locator('#research-section-option-' + sectionId).click()
        await page.waitForFunction(sectionId => window.location.hash === '#' + sectionId, sectionId)
        assert.equal(await page.locator('.research-section-menu').count(),0,'menu did not close after selection')
        assert.equal(await trigger.getAttribute('aria-expanded'),'false')
      } else if (width > 1250) {
        assert(results.tocWidth >= 210, 'desktop contents column missing')
        const chapterName = id === ids[0] ? '1. Introduction' : '1. Introduction'
        await page.getByRole('button', { name: 'Expand ' + chapterName }).click()
        assert.equal(await page.getByRole('button', { name: 'Collapse ' + chapterName }).getAttribute('aria-expanded'), 'true')
        const childId = id === ids[0] ? 'motivation-experience' : 'introduction-motivation'
        await page.locator('.research-outline-children a[href="#' + childId + '"]').click()
        await page.waitForFunction(childId => document.querySelector('a.research-toc-child[aria-current="location"][href="#' + childId + '"]') || document.querySelector('.research-outline-children a[aria-current="location"][href="#' + childId + '"]'), childId, { timeout: 8000 })
      }
      assert.deepEqual(errors, [], 'unexpected runtime exceptions')
      verified++
      console.log(JSON.stringify({ width, manuscript: id, ok: true, math: results.mathCount, sections: results.sections }))
    } catch (error) {
      failures.push({ width, manuscript: id, message: String(error) })
      console.log(JSON.stringify({ width, manuscript: id, ok: false, error: String(error) }))
    } finally { await page.close() }
  }
} finally { await browser.close() }
assert.deepEqual(failures, [], 'scientific reader regression failed')
console.log('Verified ' + verified + ' responsive manuscript scenarios.')
