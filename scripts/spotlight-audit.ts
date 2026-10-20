import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { chromium } from 'playwright-core'
import { entries } from '../src/data'
import { manuscripts } from '../src/research'
import { buildSpotlightIndex, searchSpotlight, normalizeSpotlight } from '../src/lib/spotlightIndex'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const index = buildSpotlightIndex(entries, manuscripts)
const title = (query: string) => searchSpotlight(index, query).map(hit => hit.record.title)

assert(index.length === entries.length + manuscripts.length + 4)
assert.equal(normalizeSpotlight('CO₂'), 'co2')
assert(title('decarboxylation')[0]?.includes('Estimating Decarboxylation'), 'manuscript title should rank above generic references')
assert(title('lyophilization')[0]?.includes('Low-Temperature Lyophilization'), 'manuscript title should rank above a body reference')
assert(title('PDF')[0] === 'Beyond PDF', 'direct title should beat body-only matches')
assert(title('vectorization')[0] === 'Recovering geometry from pixels', 'technical keyword index')
assert(title('gravimetric mass loss')[0]?.includes('Estimating Decarboxylation'), 'multi-token query')
assert.equal(searchSpotlight(index, 'impossible-nonsense-phrase').length, 0)
assert(searchSpotlight(index, 'decarboxylation', 'writing').length === 0, 'scope filtering must be enforced')
assert(searchSpotlight(index, 'decarboxylation', 'manuscripts').length === 1)
assert(searchSpotlight(index, 'reasearch').some(hit => hit.record.id === 'action:research'), 'bounded typo tolerance')
const start = performance.now()
for (let i = 0; i < 5000; i++) searchSpotlight(index, ['vectorization', 'nacre', 'pdf', 'gravimetric mass loss', 'learning'][i % 5])
const elapsed = performance.now() - start
console.log(JSON.stringify({ audit: 'index', resources: index.length, queries: 5000, totalMs: +elapsed.toFixed(2), avgMs: +(elapsed / 5000).toFixed(4), pass: true }))

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})

try {
  for (const width of [375, 768, 1024, 1440, 1920, 2560]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 375 ? 740 : 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(String(error)))
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      const trigger = page.getByRole('button', { name: 'Search journal' }).first()
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Search the journal' })
      const input = page.getByRole('combobox', { name: 'Search the journal and research' })
      await dialog.waitFor()
      assert(await input.evaluate(element => document.activeElement === element), 'input should receive initial focus')
      const startState = await page.evaluate(() => {
        const pane = document.querySelector('.spotlight-dialog')!.getBoundingClientRect()
        return {
          left: pane.left, right: pane.right, top: pane.top, bottom: pane.bottom,
          viewport: innerWidth, height: innerHeight,
          items: document.querySelectorAll('.spotlight-option').length,
          bodyOverflow: document.documentElement.scrollWidth - innerWidth,
          hasRedundantPreview: !!document.querySelector('.spotlight-inspector'),
          nativeScrollbar: getComputedStyle(document.querySelector('.journal-scrollview-viewport')!).scrollbarWidth,
          keyFont: getComputedStyle(document.querySelector('.spotlight-key')!).fontFamily,
          trackPresent: !!document.querySelector('.journal-scrollview-track[role="scrollbar"]'),
        }
      })
      assert(startState.items <= 9, 'blank query should not dump the entire index')
      assert(startState.left >= 0 && startState.right <= width + 1, 'modal should remain within viewport')
      assert(startState.bottom <= startState.height + 1, 'modal should remain within viewport height')
      assert(startState.bodyOverflow <= 1, 'no horizontal overflow')
      assert.equal(startState.hasRedundantPreview, false, 'search must not reserve an empty inspector')
      assert.equal(startState.nativeScrollbar, 'none', 'native scrollbar chrome should not appear')
      assert(startState.trackPresent, 'custom ScrollView track must exist')
      assert(!/mono|consolas|courier/i.test(startState.keyFont), 'keyboard hints must use UI typography')
      // Scope selection and empty states.
      await page.locator('.spotlight-scopes').getByRole('button', { name: /Manuscripts/ }).click()
      await input.fill('decarboxylation')
      assert.equal(await page.locator('.spotlight-option').count(), 1)
      await page.locator('.spotlight-scopes').getByRole('button', { name: /Writing/ }).click()
      await page.getByText('No results found').waitFor()
      await page.getByRole('button', { name: 'Clear search' }).last().click()
      assert.equal(await input.inputValue(), '')
      await page.locator('.spotlight-scopes').getByRole('button', { name: /^All/ }).click()
      await input.fill('lyophilization')
      assert((await page.locator('.spotlight-option').first().textContent())!.includes('Low-Temperature Lyophilization'))
      await input.fill('pdf')
      assert((await page.locator('.spotlight-option').first().textContent())!.includes('Beyond PDF'))
      assert.equal(await input.getAttribute('aria-activedescendant'), await page.locator('.spotlight-option').first().getAttribute('id'))
      // Keyboard selection stays in the input and scrolls its own result pane.
      await input.fill('e')
      for (let i = 0; i < 11; i++) await input.press('ArrowDown')
      assert(await input.evaluate(el => document.activeElement === el), 'arrow navigation must retain input focus')
      const selection = await page.evaluate(() => {
        const pane = document.querySelector('.spotlight-results .journal-scrollview-viewport')!
        const active = pane.querySelector('[data-active="true"]')!
        return {
          scrollTop: pane.scrollTop,
          within: active.getBoundingClientRect().bottom <= pane.getBoundingClientRect().bottom + 1,
          activeText: active.querySelector('.spotlight-result-title')?.textContent,
        }
      })
      assert(selection.within && selection.scrollTop > 0, 'arrow navigation must bring the active option into view')
      // ScrollView must own a real draggable thumb; the native browser
      // scrollbar stays hidden while the content retains native scroll input.
      const viewport = page.locator('.spotlight-results .journal-scrollview-viewport')
      await viewport.evaluate(element => { element.scrollTop = 0 })
      const track = page.locator('.spotlight-results .journal-scrollview-track')
      await page.waitForFunction(() => document.querySelector('.spotlight-results')?.getAttribute('data-scrollable') === 'true')
      const bounds = await track.boundingBox()
      assert(bounds && bounds.height > 100, 'custom ScrollView track is not rendered')
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 8)
      await page.mouse.down()
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + Math.min(bounds.height - 15, 155), { steps: 4 })
      await page.mouse.up()
      const dragTop = await viewport.evaluate(element => element.scrollTop)
      assert(dragTop > 40, 'dragging the custom ScrollView thumb must move the result viewport')
      const ariaScroll = await track.getAttribute('aria-valuenow')
      assert(Number(ariaScroll) > 0, 'scrollbar accessibility value should track scrolling')
      await input.fill('decarboxylation')
      await input.press('Enter')
      await page.getByRole('heading', { level: 1, name: /Estimating Decarboxylation Progress/ }).waitFor()
      assert(new URL(page.url()).pathname.includes('research/gravimetric-decarboxylation'))
      assert.equal(await page.locator('.spotlight-dialog').count(), 0)

      // Session history is truthful and survives reopening within the tab.
      await page.getByRole('button', { name: 'Search journal' }).first().click()
      await page.locator('.spotlight-dialog').waitFor()
      const recent = await page.locator('.spotlight-option').first().innerText()
      assert(recent.includes('Estimating Decarboxylation'), 'recently opened manuscript not offered')
      await page.getByRole('combobox', { name: 'Search the journal and research' }).fill('impossible-nonsense-phrase')
      await page.getByText('No results found').waitFor()
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('.spotlight-dialog').count(), 0)
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Search journal', 'closing must return focus to its invoker')
      assert.equal(errors.length, 0, errors.join('\n'))
      console.log(JSON.stringify({ audit: 'browser', width, resultCount: startState.items, scrollTop: Math.round(selection.scrollTop), recent: true, pass: true }))
    } finally {
      await page.close()
    }
  }

  // Verify global shortcut opens from a non-input context, command selection,
  // and outside-click dismissal without changing the underlying URL.
  const keyboard = await browser.newPage({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  try {
    await keyboard.goto(origin, { waitUntil: 'domcontentloaded' })
    // React binds the global keyboard handler in an effect after initial mount.
    await keyboard.locator('.header-search').waitFor()
    await keyboard.waitForTimeout(80)
    await keyboard.keyboard.press('Control+k')
    await keyboard.getByRole('combobox', { name: 'Search the journal and research' }).waitFor()
    await keyboard.getByRole('combobox', { name: 'Search the journal and research' }).fill('engineering notes')
    await keyboard.locator('.spotlight-option').filter({ hasText: 'Engineering notes' }).first().click()
    await keyboard.getByRole('heading', { name: 'Engineering' }).first().waitFor()
    assert.equal(await keyboard.locator('.spotlight-dialog').count(), 0)
    await keyboard.keyboard.press('Control+k')
    await keyboard.getByRole('combobox', { name: 'Search the journal and research' }).waitFor()
    await keyboard.mouse.click(4, 4)
    assert.equal(await keyboard.locator('.spotlight-dialog').count(), 0, 'outside click must dismiss')
    console.log(JSON.stringify({ audit: 'shortcuts-and-commands', pass: true }))
  } finally { await keyboard.close() }
} finally { await browser.close() }