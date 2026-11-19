/** Real Chromium smoke/regression coverage for Quotes, no fabricated site content. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { publishedQuotes, publishedCollections, isOwnQuote } from '../src/quotes/data.ts'

const origin = (process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11265/').replace(/\/?$/, '/')
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
try {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: width <= 375 ? 730 : 900 },
      isMobile: width < 768, hasTouch: width < 768, reducedMotion: 'reduce', serviceWorkers: 'block',
    })
    const errors = []
    page.on('pageerror', error => errors.push(String(error)))
    try {
      const response = await page.goto(origin + 'quotes/', {waitUntil:'domcontentloaded'})
      assert.equal(response?.status(),200,'quotes listing HTTP status at '+width)
      await page.locator('.quotes-heading h1').waitFor({timeout:10000})
      assert.match(await page.locator('.quotes-heading h1').innerText(),/^Quotes/)
      assert((await page.title()).startsWith('Quotes | '), 'quote route title')
      assert.equal(await page.getByText(/curation note|curator's note/i).count(),0,'no interpretive notes in quote library')
      assert.equal(await page.locator('.quotes-card-note').count(),0,'no commentary in quote cards')
      assert.equal(await page.locator('.quotes-filters button').count(),4)
      assert.equal(await page.locator('.quotes-empty').count(), 0, 'real published quotations appear')
      assert.equal(await page.locator('.quotes-list .quotes-card').count(), publishedQuotes.length, 'all published quotations')
      assert.equal(await page.locator('.quotes-heading-count').innerText(), publishedQuotes.length.toString().padStart(2, '0'), 'published count')
      assert.equal(await page.locator('.quotes-atlas-node').count(), publishedQuotes.length,
        'unified graph: precisely one node per published quotation')
      assert((await page.locator('.quotes-atlas-links path').count()) > 40, 'network uses real shared-theme connections')
      assert((await page.locator('.quotes-atlas-dither').getAttribute('d') ?? '').length > 5000,
        'dither field is real ordered pixel geometry rather than a blur/shadow')
      assert.equal(await page.locator('.quotes-atlas-guide').count(), 0,
        'do not reinstate six segregated cluster circles')
      assert.equal(await page.locator('.quotes-atlas-stage').evaluate(el=>getComputedStyle(el).boxShadow), 'none',
        'archival diagram has no decorative box shadows')
      assert.equal(await page.locator('.quotes-atlas-current').evaluate(el=>getComputedStyle(el).display), 'none',
        'reduced-motion preference hides animated signals')
      const firstGraphNode = page.locator('.quotes-atlas-node').first()
      await firstGraphNode.focus()
      const firstNodeId = await firstGraphNode.getAttribute('data-quote-id')
      await page.keyboard.press('ArrowRight')
      const activeGraphNode = page.locator('.quotes-atlas-node[tabindex="0"]')
      assert.equal(await activeGraphNode.count(), 1, 'arrow-key graph navigation uses one roving tab stop')
      assert.notEqual(await activeGraphNode.getAttribute('data-quote-id'), firstNodeId, 'arrow key advances to another quote')
      await page.locator('.quotes-section-heading h2').click()
      assert.equal(await page.locator('.quotes-list .quotes-card-long').count() > 0, true,
        'long quotations use compact mosaic previews')
      const longQuote = page.locator('.quotes-list .quotes-card-long blockquote').first()
      assert.equal(await longQuote.evaluate(node => getComputedStyle(node).webkitLineClamp),
        width <= 767 ? '5' : '6', 'long quote preview is clamped only in the mosaic')
      if (width >= 768) {
        const row = page.locator('.quotes-list .quotes-card-main').first()
        const restBackground = await row.evaluate(element => getComputedStyle(element).backgroundColor)
        await row.hover()
        const hoveredBackground = await row.evaluate(element => getComputedStyle(element).backgroundColor)
        assert.equal(hoveredBackground, restBackground, width + 'px: row hover must not fill with a tinted slab')
        const affordanceDecoration = await row.locator('.quotes-card-open').evaluate(element => getComputedStyle(element).textDecorationLine)
        assert(affordanceDecoration.includes('underline'), width + 'px: hover should emphasize only the Read entry affordance')
        await page.mouse.move(0, 0)
      }
      assert.equal(await page.getByRole('button',{name:'Reading layout'}).getAttribute('aria-pressed'),'true','reader-oriented default')
      await page.getByRole('button',{name:'Index layout'}).click()
      assert.equal(await page.locator('.quotes-list-compact').count(),1,'compact index toggles on')
      await page.getByRole('button',{name:'Reading layout'}).click()
      assert.equal(await page.locator('.quotes-list-compact').count(),0,'reading layout restores')
      await page.getByRole('button',{name:/^Filters/}).click()
      assert.equal(await page.locator('#quotes-refinements').count(),1,'filter panel opens')
      assert.equal(await page.locator('#quotes-refinements select').count(), 0, 'all visible filters use custom controls, not native select elements')
      assert.equal(await page.getByRole('combobox').count(), 4, 'four accessible custom filter selectors')
      // Radix Select temporarily hides the background accessibility tree while
      // its listbox is open; query the trigger directly for open-state checks.
      const themeFilter = page.locator('.quotes-facet-trigger[aria-label="Filter by theme"]')
      await themeFilter.click()
      assert.equal(await themeFilter.getAttribute('aria-expanded'), 'true', 'custom theme menu expands')
      const popover = page.locator('.quotes-facet-menu')
      assert.equal(await popover.count(), 1, 'single floating filter menu')
      // Popper initially mounts offscreen until collision geometry is measured.
      // Await its settled position instead of asserting on the transient frame.
      await page.waitForFunction(() => {
        const menu = document.querySelector('.quotes-facet-menu')
        if (!menu) return false
        const rect = menu.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.x >= -1 && rect.y >= -1 &&
          rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1
      }, undefined, { timeout: 3000 })
      const bounds = await popover.boundingBox()
      assert(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, width+'px: filter popover within viewport')
      assert(bounds.height <= 280, width+'px: filter menu must remain compact')
      assert(bounds.y >= -1 && bounds.y + bounds.height <= 901, width+'px: menu collision handling keeps it within the viewport: '+JSON.stringify({bounds,scroll:await page.evaluate(()=>scrollY)}))
      await page.keyboard.press('Escape')
      assert.equal(await themeFilter.getAttribute('aria-expanded'), 'false', 'Escape closes the filter menu')
      assert.equal(await themeFilter.evaluate(element => document.activeElement === element), true, 'focus returns to trigger')
      await themeFilter.click()
      await page.getByRole('option',{name:'Understanding', exact:true}).click()
      assert((await page.locator('.quotes-card').count()) < publishedQuotes.length,'theme filter narrows archive')
      assert.equal(await themeFilter.getAttribute('aria-expanded'), 'false', 'selection closes menu')
      const sortFilter = page.getByRole('combobox',{name:'Sort quotations'})
      await sortFilter.click()
      await page.getByRole('option',{name:'Earliest archived',exact:true}).click()
      assert.equal(await sortFilter.innerText().then(text=>text.includes('Earliest archived')),true,'sort selection displays chosen value')
      const authorFilter = page.getByRole('combobox',{name:'Filter by author'})
      await authorFilter.click()
      await page.getByRole('option',{name:'Jackson Cummings',exact:true}).click()
      assert.equal(await authorFilter.getAttribute('aria-expanded'), 'false', 'author selection closes')
      const verificationFilter = page.getByRole('combobox',{name:'Filter by source verification'})
      await verificationFilter.click()
      await page.getByRole('option',{name:'No source',exact:true}).click()
      assert((await page.locator('.quotes-card').count()) < publishedQuotes.length,'source verification applies')
      await page.getByRole('button',{name:/Clear filters/}).click()
      assert.equal(await page.locator('.quotes-card').count(),publishedQuotes.length,'clearing filters restores archive')
      assert.equal(await page.getByRole('combobox',{name:'Sort quotations'}).innerText().then(text=>text.includes('Earliest archived')),true,'clear facets leaves sort preference unchanged')
      await page.getByRole('button',{name:/^Filters/}).click()
      await page.locator('.quotes-filters button').filter({ hasText: 'My words' }).click()
      assert.equal(await page.locator('.quotes-list .quotes-card').count(), publishedQuotes.filter(isOwnQuote).length, 'user-authored quotations')
      await page.locator('.quotes-filters button').filter({ hasText: 'Collected' }).click()
      assert.equal(await page.locator('.quotes-list .quotes-card').count(), publishedQuotes.length - publishedQuotes.filter(isOwnQuote).length, 'collected quotations')
      await page.locator('.quotes-card-main[href$="/lance-priebe-curiosity/"]').click()
      await page.locator('.quotes-reader-text').waitFor()
      assert.equal(await page.locator('.quotes-reading-folio').count(),1,'archival folio index')
      assert.equal(await page.locator('.quotes-traverse-link').count() > 0,true,'archive progression')
      assert.equal(await page.locator('.quotes-curation,.quotes-card-note').count(),0,'reader preserves interpretive silence')
      assert.match(await page.locator('.quotes-reader-author').innerText(), /Lance Priebe/, 'external author attribution')
      assert.equal(await page.locator('.quotes-curation').count(),0,'no commentary on quotation pages')
      assert.equal(await page.locator('.quotes-source-content a').getAttribute('href'), 'https://rocketsnail.com/games/club-penguin/')
      await page.goBack({waitUntil:'domcontentloaded'})
      await page.locator('.quotes-heading h1').waitFor()
      await page.locator('.quotes-filters button').filter({ hasText: 'Collections' }).click()
      assert.equal(await page.locator('.quotes-collections .quotes-collection').count(), publishedCollections.length, 'curated collections')
      await page.locator('.quotes-collection').first().click()
      await page.locator('.quotes-list .quotes-card').first().waitFor()
      assert.equal(await page.locator('.quotes-list .quotes-card').count(), publishedCollections[0].quoteIds.length, 'collection order/membership')
      await page.goBack({waitUntil:'domcontentloaded'})
      await page.locator('.quotes-heading h1').waitFor()
      const scroll = await page.evaluate(() => ({
        viewport: innerWidth, html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth, main: document.querySelector('#main')?.scrollWidth
      }))
      assert(scroll.html <= scroll.viewport+1, width+'px quotes overflow '+JSON.stringify(scroll))
      // Main navigation must remain reversible using native browser history.
      if (width < 768) {
        const tabs = page.locator('.mobile-tabbar button')
        assert.equal(await tabs.count(),5,'five mobile destinations')
        assert.equal(await page.locator('.mobile-tabbar button[aria-current="page"]').innerText(),'Quotes')
        await tabs.filter({hasText:'Journal'}).click()
      } else {
        assert.equal(await page.locator('.header-links button.current').innerText(),'Quotes')
        await page.locator('.header-links button').filter({hasText:'Journal'}).click()
      }
      await page.locator('.workspace-heading h1').waitFor()
      assert(new URL(page.url()).pathname === '/','journal route returns to home')
      assert(!(await page.title()).startsWith('Quotes | '), 'journal document title restored')
      if (width < 768) {
        await page.locator('.mobile-tabbar button').filter({hasText:'Saved'}).click()
        await page.locator('.mobile-tabbar button').filter({hasText:'Quotes'}).click()
        await page.locator('.quotes-heading h1').waitFor()
        assert.equal(await page.locator('.mobile-tabbar button[aria-current="page"]').count(), 1,
          'only one mobile primary destination may be active')
        await page.goBack({waitUntil:'domcontentloaded'})
        await page.goBack({waitUntil:'domcontentloaded'})
      }
      if (width >= 768) await page.goBack({waitUntil:'domcontentloaded'})
      await page.locator('.quotes-heading h1').waitFor()
      assert.equal(new URL(page.url()).pathname,'/quotes/')
      // Dedicated quote search tab should be operable, not a decorative button.
      await page.keyboard.press('Control+k')
      await page.locator('.spotlight-scopes').waitFor()
      const quoteScope = page.locator('.spotlight-scopes button').filter({hasText:'Quotes'})
      await quoteScope.click()
      assert.equal(await quoteScope.getAttribute('aria-pressed'),'true')
      assert.equal(await page.locator('.spotlight-dialog [role="combobox"]').count(),1)
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('.spotlight-dialog').count(),0)
      await page.evaluate(() => { document.documentElement.dataset.theme='dark' })
      const cardColors = await page.locator('.quotes-page').evaluate(node => {
        const a = getComputedStyle(node), b = getComputedStyle(document.documentElement)
        return {font:a.fontFamily,foreground:b.getPropertyValue('--foreground')}
      })
      assert(cardColors.foreground.trim(),'dark theme token exists')
      assert.equal(errors.length,0,width+'px browser runtime errors: '+errors.join('; '))
      console.log('Quotes browser:', width+'px', 'routing/search/overflow/theme PASS')
    } finally { await page.close() }
  }
} finally { await browser.close() }
