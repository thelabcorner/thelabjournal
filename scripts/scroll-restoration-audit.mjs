// Browser regression for route-aware reading positions. Run after `bun run build`.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const mime = { '.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.json':'application/json',
  '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.png':'image/png' }
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const candidate = resolve(root, '.' + path)
    if (candidate !== root && !candidate.startsWith(root + sep)) return res.writeHead(400).end()
    let file = candidate
    try { if (!(await stat(file)).isFile()) file = resolve(root,'index.html') }
    catch { file = resolve(root,'index.html') }
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
    res.setHeader('Cache-Control', file.endsWith('index.html') ? 'no-cache' : 'public,max-age=31536000,immutable')
    res.end(await readFile(file))
  } catch (error) { res.writeHead(500).end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const article = origin + '/posts/learning-in-reverse/'
let browser
const results = []
const waitForY = async (page, expected, tolerance = 65) => {
  try {
    await page.waitForFunction(([expected, tolerance]) => Math.abs(window.scrollY - expected) <= tolerance,
      [expected, tolerance], { timeout: 8000 })
  } catch (error) {
    console.error('RESTORE DIAGNOSTICS', await page.evaluate(() => ({
      url: location.href, scrollY, scrollHeight: document.documentElement.scrollHeight,
      route: document.querySelector('[data-reading-route]')?.getAttribute('data-reading-route'),
      state: history.state, stored: sessionStorage.getItem('thelabjournal.reading-positions.v1')?.slice(0, 2000)
    })))
    throw error
  }
  const actual = await page.evaluate(() => window.scrollY)
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected scroll ${expected}, got ${actual}`)
}
const scroll = async (page, y) => {
  await page.evaluate(y => window.scrollTo({top:y,behavior:'instant'}), y)
  await page.waitForTimeout(350) // 240ms debounced storage write
  return page.evaluate(() => window.scrollY)
}
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ||
    'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  page.on('pageerror', error => console.error('PAGE ERROR', error.message))

  await page.goto(article, {waitUntil:'domcontentloaded'})
  console.log('TEST: article refresh')
  await page.locator('.article-body .prose-section').first().waitFor()
  const articleY = await scroll(page, 1250)
  assert.ok(articleY > 800, 'Fixture article must be tall enough to test restoration')
  await page.reload({waitUntil:'domcontentloaded'})
  await page.locator('.article-body .prose-section').first().waitFor()
  await waitForY(page, articleY)
  results.push(`Refresh article: ${Math.round(articleY)}px restored`)

  // The next pagehide must flush even if no idle debounce has elapsed.
  const immediateY = await page.evaluate(() => {
    window.scrollTo({ top: 1700, behavior: 'instant' })
    return window.scrollY
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.article-body .prose-section').first().waitFor()
  await waitForY(page, immediateY)
  results.push('Immediate refresh captures position without waiting for idle')

  // Two history entries for the same article with different TOC positions.
  await scroll(page, 560)
  console.log('TEST: hash history')
  const beforeHash = await page.evaluate(() => window.scrollY)
  await page.locator('.article-toc a[href="#section-2"]').click()
  await page.waitForURL(/#section-2$/)
  await page.waitForTimeout(360)
  const afterHash = await page.evaluate(() => window.scrollY)
  assert.ok(Math.abs(afterHash - beforeHash) > 120, 'TOC did not navigate to a new section')
  await page.goBack({waitUntil:'domcontentloaded'})
  await waitForY(page, beforeHash)
  await page.goForward({waitUntil:'domcontentloaded'})
  await waitForY(page, afterHash)
  results.push(`Section hash Back/Forward: ${Math.round(beforeHash)}px ↔ ${Math.round(afterHash)}px`)

  // Journal -> article -> Back -> Forward retains each entry independently.
  await page.goto(origin + '/', { waitUntil:'domcontentloaded' })
  console.log('TEST: archive history')
  await page.locator('#workspace-title').waitFor()
  const homeY = await scroll(page, 640)
  // DOM click avoids Playwright's automatic scroll-into-view changing the
  // position before the navigation handler captures it.
  await page.evaluate(() => document.querySelector('a[href="/posts/learning-in-reverse/"]').click())
  await page.locator('.article-body').waitFor()
  const readingY = await scroll(page, 1050)
  await page.goBack({waitUntil:'domcontentloaded'})
  await page.locator('#workspace-title').waitFor()
  await waitForY(page, homeY)
  await page.goForward({waitUntil:'domcontentloaded'})
  await page.locator('.article-body').waitFor()
  await waitForY(page, readingY)
  results.push(`Archive ↔ article: ${Math.round(homeY)}px ↔ ${Math.round(readingY)}px`)

  // Desktop and mobile use the same history/session contract.
  await page.setViewportSize({width:390,height:844})
  console.log('TEST: mobile refresh')
  const mobileY = await scroll(page, 1560)
  await page.reload({waitUntil:'domcontentloaded'})
  await page.locator('.article-body').waitFor()
  await waitForY(page, mobileY)
  results.push(`Mobile-width refresh: ${Math.round(mobileY)}px restored`)

  // Lazy routes should restore only after their content mounts.
  await page.goto(origin + '/quotes/', {waitUntil:'domcontentloaded'})
  console.log('TEST: quotes refresh')
  await page.locator('.quotes-page .quotes-list').waitFor()
  const quotesY = await scroll(page, 850)
  if (quotesY > 300) {
    await page.reload({waitUntil:'domcontentloaded'})
    await page.locator('.quotes-page .quotes-list').waitFor()
    await waitForY(page, quotesY)
    results.push(`Lazy quotes refresh: ${Math.round(quotesY)}px restored`)
  } else {
    results.push('Quotes archive too short for meaningful scroll test')
  }

  await page.goto(origin + '/research/gravimetric-decarboxylation-co2-progress/', {waitUntil:'domcontentloaded'})
  console.log('TEST: research refresh')
  await page.locator('.research-body').waitFor()
  await page.waitForFunction(() => document.querySelectorAll('.research-body [id]').length > 2, null, {timeout:12000})
  const researchY = await scroll(page, 1100)
  if (researchY > 300) {
    await page.reload({waitUntil:'domcontentloaded'})
    await page.locator('.research-body').waitFor()
    await waitForY(page, researchY, 80)
    results.push(`Lazy manuscript refresh: ${Math.round(researchY)}px restored`)
  } else results.push('Manuscript too short for meaningful scroll test')

  // Large manuscripts are the riskier case for anchor geometry and lazy body.
  const deepResearchY = await scroll(page, 12500)
  if (deepResearchY > 8000) {
    await page.reload({waitUntil:'domcontentloaded'})
    await page.locator('.research-body').waitFor()
    await waitForY(page, deepResearchY, 100)
    results.push(`Deep manuscript section: ${Math.round(deepResearchY)}px restored`)
  }
  await scroll(page, researchY)

  // Crossing two lazy routes must still restore each history entry.
  await page.locator('.mobile-tabbar button').filter({ hasText: 'Quotes' }).click()
  await page.locator('.quotes-page .quotes-list').waitFor()
  const quoteHistoryY = await scroll(page, 680)
  await page.goBack({waitUntil:'domcontentloaded'})
  await page.locator('.research-body').waitFor()
  await waitForY(page, researchY, 80)
  await page.goForward({waitUntil:'domcontentloaded'})
  await page.locator('.quotes-page .quotes-list').waitFor()
  await waitForY(page, quoteHistoryY, 80)
  results.push('Lazy research ↔ quotes Back/Forward')

  // Explicit deep-link anchors must win when no existing history position
  // belongs to the new navigation.
  await page.goto(article + '#section-2', {waitUntil:'domcontentloaded'})
  await page.locator('#section-2').waitFor()
  await page.waitForFunction(() => window.scrollY > 750, null, {timeout:8000})
  results.push('Fresh deep-link section anchor retained')
  console.log('SCROLL RESTORATION PASS\n' + results.map(result => '✓ ' + result).join('\n'))
  await context.close()
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
