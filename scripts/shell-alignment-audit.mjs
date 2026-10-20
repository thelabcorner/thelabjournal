import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

// The journal is an intentionally centered canvas, not a full-viewport desktop app.
// Test actual browser layout to guard against divergent header/frame/footer CSS widths.
const shellMaxWidth = 1500
const viewportWidths = [320, 375, 768, 1024, 1440, 1920, 2560]
const origin = process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11296/'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const closeTo = (actual, expected) => Math.abs(actual - expected) <= 1
try {
  for (const width of viewportWidths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768, reducedMotion: 'reduce', serviceWorkers: 'block' })
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.locator('.frame').waitFor()
      for (const view of ['index', 'article']) {
        if (view === 'article') {
          await page.locator('.feature-link').click()
          await page.locator('.article-main').waitFor()
        }
        await page.waitForFunction(() => ['.frame','.site-header','.header-inner','.site-footer','.footer-inner'].every(selector => document.querySelector(selector)))
        const result = await page.evaluate(() => {
          const rect = (selector) => {
            const { left, right, width } = document.querySelector(selector).getBoundingClientRect()
            return { left, right, width }
          }
          return {
            frame: rect('.frame'),
            header: rect('.site-header'),
            headerInner: rect('.header-inner'),
            footer: rect('.site-footer'),
            footerInner: rect('.footer-inner'),
            viewport: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
          }
        })
        const target = Math.min(width, shellMaxWidth)
        const expectedLeft = (width - target) / 2
        // The mobile footer is deliberately hidden in favor of the bottom tabbar.
        const regions = width < 768 ? ['frame', 'header', 'headerInner'] : ['frame', 'header', 'headerInner', 'footer', 'footerInner']
        for (const key of regions) {
          const box = result[key]
          assert(closeTo(box.width, target), `${width}px ${view}: ${key} width ${box.width} !== ${target}`)
          assert(closeTo(box.left, expectedLeft), `${width}px ${view}: ${key} left ${box.left} !== ${expectedLeft}`)
        }
        assert(result.scrollWidth <= result.viewport + 1, `${width}px ${view}: horizontal overflow ${JSON.stringify(result)}`)
        assert.equal(await page.locator('.header-issue').count(), 0, `${width}px ${view}: volume badge must be removed`)
        if (width >= 1024) {
          for (const collapsed of [false, true]) {
            if (collapsed) await page.getByRole('button', { name: 'Collapse sidebar' }).click()
            // Header and workspace both animate their desktop grid columns.
            await page.waitForFunction((targetWidth) => {
              const width = document.querySelector('.header-inner .brand').getBoundingClientRect().width
              return Math.abs(width - targetWidth) <= 1
            }, collapsed ? 52 : 296)
            const geometry = await page.evaluate((collapsed) => {
              const rect = (selector) => document.querySelector(selector).getBoundingClientRect()
              const headerLogo = document.querySelector('.header-inner .brand-mark svg')
              const railToggle = document.querySelector('.rail-masthead .rail-collapse')
              const firstTab = document.querySelector('.header-links button')
              const sideLabel = document.querySelector('.side-explorer-title strong')
              const brandLabel = document.querySelector('.brand-text')
              const main = document.querySelector('.content-main')
              const pad = (node, name) => parseFloat(getComputedStyle(node)[name])
              return {
                frame: rect('.frame'), sidebar: rect('.sidebar-wrap'), rail: rect('.desktop-rail'),
                markHeader: rect('.header-inner .brand-mark'), toggleRail: rect('.rail-masthead .rail-collapse'),
                brand: rect('.header-inner .brand'), brandLabel: brandLabel.getBoundingClientRect(),
                brandLabelTextLeft: brandLabel.getBoundingClientRect().left + pad(brandLabel, 'paddingLeft'),
                brandLabelVisible: getComputedStyle(brandLabel).display !== 'none',
                firstTabTextLeft: firstTab.getBoundingClientRect().left + pad(firstTab, 'paddingLeft'),
                mainTextLeft: main.getBoundingClientRect().left + pad(main, 'paddingLeft'),
                sideLabelLeft: sideLabel.getBoundingClientRect().left,
                lastTabRight: rect('.header-links button:last-child').right,
                actionsLeft: rect('.header-end').left,
                lastControlRight: rect('.header-end .header-theme').right,
                expectedControlRight: rect('.frame').right - 24 - 12,
                searchToolsGap: rect('.header-tools').left - rect('.header-search').right,
                toolsGap: rect('.header-theme').left - rect('.header-preferences').right,
                settingsBeforeTheme: rect('.header-preferences').right < rect('.header-theme').left,
                controlHeights: ['.header-inner .brand-mark', '.header-inner .brand-text', '.header-links button', '.header-search', '.header-theme', '.header-preferences'].map(selector => ({ selector, height: rect(selector).height })),
                controlsOpaque: ['.header-links button', '.header-search', '.header-theme', '.header-preferences'].every(selector => getComputedStyle(document.querySelector(selector)).backgroundColor !== 'rgba(0, 0, 0, 0)'),
                headerLogoPresent: Boolean(headerLogo),
                sidebarLogoAbsent: !document.querySelector('.desktop-rail .brand-mark'),
                toggleAccessible: railToggle?.getAttribute('aria-label') === (collapsed ? 'Expand sidebar' : 'Collapse sidebar'),
                toggleExpanded: railToggle?.getAttribute('aria-expanded') === String(!collapsed),
              }
            }, collapsed)
            const sidebarWidth = collapsed ? 52 : 296
            assert(closeTo(geometry.sidebar.width, sidebarWidth), `${width}px ${view} collapsed=${collapsed}: sidebar width ${geometry.sidebar.width}`)
            assert(closeTo(geometry.brand.width, sidebarWidth), `${width}px ${view} collapsed=${collapsed}: brand width ${geometry.brand.width}`)
            assert(closeTo(geometry.rail.width, 52), `${width}px ${view}: rail width ${geometry.rail.width}`)
            assert(closeTo(geometry.markHeader.left + geometry.markHeader.width / 2, geometry.toggleRail.left + geometry.toggleRail.width / 2), `${width}px ${view}: header mark and top-of-rail toggle are not centered on the same guide`)
            assert(geometry.headerLogoPresent && geometry.sidebarLogoAbsent, `${width}px ${view}: header is sole brand glyph`)
            assert(geometry.toggleAccessible && geometry.toggleExpanded, `${width}px ${view}: top rail toggle state/label incorrect`)
            assert(Math.abs(geometry.firstTabTextLeft - geometry.mainTextLeft) <= 5, `${width}px ${view} collapsed=${collapsed}: nav/main misaligned ${JSON.stringify(geometry)}`)
            assert(geometry.lastTabRight <= geometry.actionsLeft + 1, `${width}px ${view} collapsed=${collapsed}: navigation overlaps header actions ${JSON.stringify(geometry)}`)
            assert(closeTo(geometry.lastControlRight, geometry.expectedControlRight), `${width}px ${view} collapsed=${collapsed}: brightness icon is not aligned to the right-hand rail gutter ${JSON.stringify(geometry)}`)
            assert(geometry.settingsBeforeTheme && geometry.toolsGap >= 7 && geometry.toolsGap <= 10, `${width}px ${view}: settings and brightness controls are not ordered/spaced correctly ${JSON.stringify(geometry)}`)
            assert(geometry.searchToolsGap >= 18 && geometry.searchToolsGap <= 22, `${width}px ${view}: search and tool controls have inconsistent separation ${JSON.stringify(geometry)}`)
            assert(geometry.controlHeights.every(({ selector, height }) => collapsed && selector === '.header-inner .brand-text' ? height === 0 : Math.abs(height - 32) <= .1), `${width}px ${view}: navbar control heights are inconsistent ${JSON.stringify(geometry)}`)
            assert(geometry.controlsOpaque, `${width}px ${view}: dither bleeding through header controls`)
            if (!collapsed) {
              assert(closeTo(geometry.brandLabelTextLeft, geometry.sideLabelLeft), `${width}px ${view}: brand/side label text misaligned ${JSON.stringify(geometry)}`)
            } else {
              assert(!geometry.brandLabelVisible, `${width}px ${view}: wordmark not hidden on narrow rail`)
            }
          }
          await page.getByRole('button', { name: 'Expand sidebar' }).click()
          await page.waitForFunction(() => Math.abs(document.querySelector('.header-inner .brand').getBoundingClientRect().width - 296) <= 1)
          const scrollbar = await page.evaluate(() => {
            const rail = document.querySelector('.centered-scrollbar')
            const thumb = document.querySelector('.centered-scrollbar-thumb')
            const frame = document.querySelector('.frame').getBoundingClientRect()
            const rect = rail.getBoundingClientRect()
            const edge = document.querySelector('.workspace-edge')
            const dots = document.querySelector('.workspace-edge-dots')
            const edgeRect = edge.getBoundingClientRect()
            return {
              edge: rect.right, frameEdge: frame.right,
              edgeRailRight: edgeRect.right, edgeRailWidth: edgeRect.width,
              edgeRailDisplay: getComputedStyle(edge).display,
              dotsBackground: getComputedStyle(dots).backgroundImage,
              dotsAnimation: getComputedStyle(dots).animationName,
              visible: getComputedStyle(rail).visibility !== 'hidden',
              thumbHeight: thumb.getBoundingClientRect().height,
              railHeight: rect.height,
              maxScroll: Number(rail.getAttribute('aria-valuemax')),
            }
          })
          assert(closeTo(scrollbar.edge, scrollbar.frameEdge), `${width}px ${view}: scrollbar is not on centered frame edge ${JSON.stringify(scrollbar)}`)
          assert(closeTo(scrollbar.edgeRailRight, scrollbar.frameEdge) && closeTo(scrollbar.edgeRailWidth, 24), `${width}px ${view}: right-hand rail is not aligned with the frame ${JSON.stringify(scrollbar)}`)
          assert(scrollbar.edgeRailDisplay !== 'none' && scrollbar.dotsBackground.includes('radial-gradient'), `${width}px ${view}: right-hand rail dither is missing ${JSON.stringify(scrollbar)}`)
          assert(scrollbar.dotsAnimation === 'none', `${width}px ${view}: reduced-motion must disable the decorative animation ${JSON.stringify(scrollbar)}`)
          assert(scrollbar.visible && scrollbar.maxScroll > 1 && scrollbar.thumbHeight < scrollbar.railHeight, `${width}px ${view}: scrollbar not usable ${JSON.stringify(scrollbar)}`)
          const startY = await page.evaluate(() => window.scrollY)
          await page.locator('.centered-scrollbar').focus()
          await page.keyboard.press('PageDown')
          await page.waitForFunction((from) => window.scrollY > from + 100, startY)
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
          const handle = await page.locator('.centered-scrollbar-thumb').boundingBox()
          assert(handle, `${width}px ${view}: scrollbar thumb missing`)
          await page.mouse.move(handle.x + handle.width / 2, handle.y + Math.min(20, handle.height / 2))
          await page.mouse.down()
          await page.mouse.move(handle.x + handle.width / 2, handle.y + Math.min(20, handle.height / 2) + 100, { steps: 5 })
          await page.mouse.up()
          await page.waitForFunction(() => window.scrollY > 20)
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
          // The right-hand track belongs to the reading canvas, not the
          // footer. As the footer enters view it must shrink to that seam.
          await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
          await page.waitForFunction(() => {
            const footer = document.querySelector('.site-footer').getBoundingClientRect()
            const rail = document.querySelector('.centered-scrollbar').getBoundingClientRect()
            const thumb = document.querySelector('.centered-scrollbar-thumb').getBoundingClientRect()
            return footer.top < innerHeight && Math.abs(rail.bottom - footer.top) <= 1 &&
              thumb.bottom <= rail.bottom + 1
          })
          const endGeometry = await page.evaluate(() => {
            const footer = document.querySelector('.site-footer').getBoundingClientRect()
            const rail = document.querySelector('.centered-scrollbar').getBoundingClientRect()
            const thumb = document.querySelector('.centered-scrollbar-thumb').getBoundingClientRect()
            const frame = document.querySelector('.frame').getBoundingClientRect()
            return { footerTop: footer.top, frameBottom: frame.bottom, railBottom: rail.bottom,
              thumbBottom: thumb.bottom, scrollY: window.scrollY }
          })
          assert(closeTo(endGeometry.frameBottom, endGeometry.footerTop), `${width}px ${view}: footer does not meet centered frame ${JSON.stringify(endGeometry)}`)
          assert(closeTo(endGeometry.railBottom, endGeometry.footerTop), `${width}px ${view}: scrollbar runs into the footer ${JSON.stringify(endGeometry)}`)
          assert(endGeometry.thumbBottom <= endGeometry.footerTop, `${width}px ${view}: thumb runs into the footer ${JSON.stringify(endGeometry)}`)
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        }
        console.log(JSON.stringify({ width, view, shellWidth: result.frame.width, left: result.frame.left, pass: true }))
      }
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
