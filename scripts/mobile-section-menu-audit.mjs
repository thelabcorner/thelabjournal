import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const papers = [
  { id: 'gravimetric-decarboxylation-co2-progress', total: 51, destination: 'automation-workflow' },
  { id: 'low-temp-lyophilization-three-theses', total: 40, destination: 'introduction-motivation' },
]
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
let passed = 0
try {
  for (const width of [320, 375, 390, 430]) for (const theme of ['light', 'dark']) for (const paper of papers) {
    const page = await browser.newPage({
      viewport: { width, height: width === 320 ? 650 : 844 },
      isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(new URL('research/' + paper.id + '/', origin).href, { waitUntil: 'domcontentloaded' })
      await page.locator('.research-body #title h1').waitFor()
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
      const trigger = page.locator('.research-mobile-jump')
      assert.equal(await page.locator('.research-mobile-contents select').count(), 0)
      assert.equal(await trigger.evaluate(node => getComputedStyle(node).borderTopWidth), '0px')
      await trigger.click()
      const menu = page.getByRole('dialog', { name: 'Jump to manuscript section' })
      await menu.waitFor()
      await page.waitForFunction(() => {
        const button = document.querySelector('.research-mobile-jump')?.getBoundingClientRect()
        const popover = document.querySelector('.research-section-menu')?.getBoundingClientRect()
        return button && popover && Math.abs(popover.top - button.bottom - 7) < 1
      })
      const geometry = await page.evaluate(() => {
        const menu = document.querySelector('.research-section-menu').getBoundingClientRect()
        const tabbar = document.querySelector('.mobile-tabbar').getBoundingClientRect()
        const viewport = document.querySelector('.research-section-scroll .journal-scrollview-viewport')
        const hasNativeScrollbar = getComputedStyle(viewport).scrollbarWidth !== 'none'
        return { left: menu.left, right: menu.right, bottom: menu.bottom,
          tabTop: tabbar.top, itemCount: document.querySelectorAll('.research-section-option').length,
          contentHeight: viewport.scrollHeight, viewportHeight: viewport.clientHeight,
          hasNativeScrollbar, overflow: document.documentElement.scrollWidth - innerWidth }
      })
      assert.equal(geometry.itemCount, paper.total)
      assert(geometry.left >= 0 && geometry.right <= width + 1, 'menu exceeds viewport width')
      assert(geometry.bottom <= geometry.tabTop, 'menu overlaps bottom navigation')
      assert(geometry.contentHeight > geometry.viewportHeight, 'scrollport did not constrain content')
      assert(!geometry.hasNativeScrollbar, 'native scrollbar chrome must be hidden')
      assert(geometry.overflow <= 1, 'horizontal overflow')
      const search = page.getByRole('combobox', { name: 'Find a manuscript section' })
      await search.fill('unlikely-term-no-matches')
      await page.getByText('No matching sections').waitFor()
      await search.fill('Introduction')
      assert((await page.locator('.research-section-option').count()) >= 1)
      await search.press('Escape')
      assert.equal(await menu.count(), 0, 'Escape must dismiss picker')
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      await trigger.click()
      const list = page.locator('.research-section-scroll .journal-scrollview-viewport')
      await list.evaluate(node => { node.scrollTop = 0 })
      const scrollTrack = page.locator('.research-section-scroll .journal-scrollview-track')
      await page.waitForFunction(() =>
        document.querySelector('.research-section-scroll')?.getAttribute('data-scrollable') === 'true')
      const thumb = await scrollTrack.boundingBox()
      assert(thumb?.height > 100, 'custom scrollbar should be interactive')
      await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + 9)
      await page.mouse.down()
      await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + 120, { steps: 4 })
      await page.mouse.up()
      assert((await list.evaluate(node => node.scrollTop)) > 40, 'custom ScrollView drag did not scroll')
      const target = page.locator('#research-section-option-' + paper.destination)
      await target.click()
      await page.waitForFunction(id => location.hash === '#' + id, paper.destination)
      assert.equal(await menu.count(), 0, 'selection should close picker')
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      assert.equal(errors.length, 0, errors.join('; '))
      passed++
      console.log(JSON.stringify({ width, theme, manuscript: paper.id, sections: paper.total, pass: true }))
    } finally { await page.close() }
  }
} finally { await browser.close() }
console.log('Mobile manuscript section menu: ' + passed + ' verified scenarios.')