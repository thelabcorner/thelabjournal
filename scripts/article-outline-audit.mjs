import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11264/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})

const waitForSection = async (page, index) => {
  await page.waitForFunction((i) => {
    const element = document.getElementById('section-' + i)
    if (!element) return false
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
    const barBottom = document.querySelector('.reading-bar')?.getBoundingClientRect().bottom ?? 0
    const expected = Math.ceil(Math.max(headerBottom, barBottom) + 18)
    return Math.abs(element.getBoundingClientRect().top - expected) < 6
  }, index, { timeout: 10000 })
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  await desktop.goto(origin, { waitUntil: 'domcontentloaded' })
  await desktop.locator('.feature-link').click()
  await desktop.locator('.article-toc a[href="#section-4"]').waitFor()
  await desktop.evaluate(() => {
    window.__articleScrollCalls = []
    const original = window.scrollTo.bind(window)
    window.scrollTo = (...args) => {
      if (typeof args[0] === 'object') window.__articleScrollCalls.push({ from: window.scrollY, to: args[0].top, behavior: args[0].behavior })
      return original(...args)
    }
  })
  await desktop.locator('.article-toc a[href="#section-4"]').click()
  await waitForSection(desktop, 4)
  const y4 = await desktop.evaluate(() => window.scrollY)
  assert(y4 > 150, 'jump to section four should not remain at the article top')
  await desktop.locator('.article-toc a[href="#section-2"]').click()
  await waitForSection(desktop, 2)
  const y2 = await desktop.evaluate(() => window.scrollY)
  assert(y2 < y4 - 100, 'jumping backward should scroll upward from the current position')
  assert.equal(new URL(desktop.url()).hash, '#section-2')
  const calls = await desktop.evaluate(() => window.__articleScrollCalls)
  assert(calls.length >= 2, 'both TOC jumps must use the same native window scroll owner')
  const [forward, backward] = calls.slice(-2)
  assert.equal(forward.behavior, 'smooth', 'forward click respects motion preference')
  assert.equal(backward.behavior, 'smooth', 'backward click respects motion preference')
  assert(backward.from > 150, 'backward click must begin from the current reading location')
  assert(backward.to < backward.from, 'backward scroll target should precede current position')
  await desktop.goBack({ waitUntil: 'domcontentloaded' })
  await waitForSection(desktop, 4)
  assert.equal(new URL(desktop.url()).hash, '#section-4', 'Back should restore a section hash, not navigate away')
  assert(await desktop.evaluate(() => window.scrollY) > 150, 'Back must not reset same-article history to top')
  await desktop.goForward({ waitUntil: 'domcontentloaded' })
  await waitForSection(desktop, 2)
  assert.equal(new URL(desktop.url()).hash, '#section-2', 'Forward should restore section')
  const desktopState = await desktop.evaluate(() => ({
    tocLinks: document.querySelectorAll('.article-toc nav[aria-label="Entry sections"] a').length,
    active: document.querySelector('.article-toc nav[aria-label="Entry sections"] a[aria-current="location"]')?.getAttribute('href'),
    relatedLinks: document.querySelectorAll('.toc-related-link').length,
    redundantProgress: document.querySelectorAll('.toc-progress-label,.toc-progress-track,.toc-bottom').length,
    headerProgress: document.querySelectorAll('.reading-bar .reading-progress').length,
    headerBrandCount: document.querySelectorAll('.header-inner .brand-mark').length,
    sidebarBrandCount: document.querySelectorAll('.desktop-rail .brand-mark').length,
    topToggleCount: document.querySelectorAll('.rail-masthead .rail-collapse').length,
  }))
  assert.equal(desktopState.headerBrandCount, 1)
  assert.equal(desktopState.sidebarBrandCount, 0)
  assert.equal(desktopState.topToggleCount, 1)
  assert.equal(desktopState.active, '#section-2')
  assert(desktopState.tocLinks >= 2, 'the document outline remains navigable')
  assert.equal(desktopState.redundantProgress, 0, 'do not duplicate header progress in the contents column')
  assert.equal(desktopState.headerProgress, 1, 'preserve the header reading progress indicator')
  assert.equal(desktopState.relatedLinks, 2)
  console.log(JSON.stringify({ mode: 'desktop-smooth', y4: Math.round(y4), y2: Math.round(y2), ...desktopState, pass: true }))
  await desktop.close()

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await reduced.goto(origin, { waitUntil: 'domcontentloaded' })
  await reduced.locator('.feature-link').click()
  await reduced.locator('.article-toc a[href="#section-4"]').click()
  await waitForSection(reduced, 4)
  assert.equal(new URL(reduced.url()).hash, '#section-4')
  console.log(JSON.stringify({ mode: 'desktop-reduced-motion', scrollY: Math.round(await reduced.evaluate(() => window.scrollY)), pass: true }))
  await reduced.close()

  const single = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  await single.goto(origin + 'posts/what-becomes-ordinary/', { waitUntil: 'domcontentloaded' })
  await single.locator('.article-toc nav[aria-label="Entry sections"] a').first().waitFor()
  const singleState = await single.evaluate(() => ({
    sections: document.querySelectorAll('.article-toc nav[aria-label="Entry sections"] a').length,
    links: Array.from(document.querySelectorAll('.toc-related nav a')).map(a => ({
      title: a.querySelector('.toc-related-label')?.textContent,
      href: a.getAttribute('href'),
    })),
    redundantProgress: document.querySelectorAll('.toc-progress-label,.toc-progress-track,.toc-bottom').length,
  }))
  assert.equal(singleState.sections, 1)
  assert.equal(singleState.redundantProgress, 0)
  assert.deepEqual(new Set(singleState.links.map(link => link.title)), new Set(['The problems I can solve now', 'Learning in reverse']))
  await single.locator('.toc-related nav a').filter({ hasText: 'The problems I can solve now' }).click()
  await single.getByRole('heading', { level: 1, name: 'The problems I can solve now' }).waitFor()
  console.log(JSON.stringify({ mode: 'single-section-related-links', ...singleState, pass: true }))
  await single.close()

  const mobile = await browser.newPage({ viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  await mobile.goto(origin, { waitUntil: 'domcontentloaded' })
  await mobile.locator('.feature-link').click()
  await mobile.locator('.journal-mobile-jump').click()
  await mobile.locator('#journal-section-option-3').click()
  await waitForSection(mobile, 4)
  assert.equal(new URL(mobile.url()).hash, '#section-4')
  await mobile.locator('.journal-mobile-jump').click()
  await mobile.locator('#journal-section-option-1').click()
  await waitForSection(mobile, 2)
  assert.equal(new URL(mobile.url()).hash, '#section-2')
  assert.equal(await mobile.locator('.journal-section-menu').count(), 0, 'mobile picker closes after navigation')
  console.log(JSON.stringify({ mode: 'mobile-sticky-picker', selected: await mobile.locator('.journal-mobile-jump-title').innerText(), pass: true }))
  await mobile.close()
} finally {
  await browser.close()
}
