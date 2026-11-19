/** Verify optional journal routes do not slow the first article paint. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const origin = (process.env.JOURNAL_ORIGIN || 'http://127.0.0.1:11265/').replace(/\/?$/, '/')
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
try {
  const context = await browser.newContext({
    viewport: {width: 375, height: 812},
    isMobile: true, hasTouch: true,
    serviceWorkers: 'allow',
  })
  const page = await context.newPage()
  const requests = []
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => {
    const path = new URL(request.url()).pathname
    if (path.includes('/assets/')) requests.push(path)
  })
  await page.goto(origin + 'posts/learning-in-reverse/', {waitUntil: 'domcontentloaded'})
  await page.getByRole('heading', {name: /learning in reverse/i}).first().waitFor({timeout: 15000})
  const cold = [...requests]
  assert(!cold.some(path => /(?:QuotesPage|ResearchPage|SpotlightSearch)-/.test(path)),
    'Optional routes loaded while opening an article: ' + cold.filter(path => /(?:QuotesPage|ResearchPage|SpotlightSearch)-/.test(path)))
  const articleResources = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource').filter(item => item.name.includes('/assets/'))
    return {count: resources.length,
      transferBytes: resources.reduce((sum, item) => sum + item.transferSize, 0)}
  })
  await page.locator('.mobile-tabbar').getByRole('button', {name: 'Quotes'}).click()
  await page.locator('.quotes-heading h1').waitFor({timeout: 15000})
  assert(requests.some(path => /QuotesPage-.*\.js$/.test(path)), 'Quotes route did not load its deferred chunk')
  assert(!requests.some(path => /ResearchPage-.*\.js$/.test(path)), 'Research code leaked into quotes navigation')

  await page.goto(origin + 'research/', {waitUntil:'domcontentloaded'})
  await page.getByRole('heading', {name:'Research', exact:true}).first().waitFor({timeout:15000})
  assert(requests.some(path => /ResearchPage-.*\.js$/.test(path)), 'Research route did not load its deferred chunk')

  await page.locator('.mobile-tabbar').getByRole('button', {name: 'Search'}).click()
  await page.getByRole('dialog', {name:'Search the journal'}).waitFor({timeout:15000})
  assert(requests.some(path => /SpotlightSearch-.*\.js$/.test(path)), 'Search dialog did not load its deferred chunk')
  assert.deepEqual(errors, [], 'Browser JavaScript exceptions')
  await context.close()

  // Simulate a stale browser requesting a chunk removed by a deployment.
  // This is a controlled failure: the route must remain visible, not crash
  // silently or redirect the reader to the journal homepage.
  const brokenContext = await browser.newContext({serviceWorkers:'block'})
  const brokenPage = await brokenContext.newPage()
  await brokenPage.route('**/assets/QuotesPage-*.js', route =>
    route.fulfill({status: 503, contentType:'text/javascript', body:'temporarily unavailable'}))
  await brokenPage.goto(origin + 'quotes/', {waitUntil:'domcontentloaded'})
  await brokenPage.getByRole('heading', {name:'Unable to open quotes'}).waitFor({timeout:15000})
  assert.equal(new URL(brokenPage.url()).pathname, '/quotes/',
    'A failed route chunk must retain the deep link')
  assert.equal(await brokenPage.getByRole('button', {name:'Retry this page'}).count(), 1)
  await brokenContext.close()
  console.log(JSON.stringify({pass:true, articleOptionalRouteRequests:0,
    articleResources, quotesDeferred:true, researchDeferred:true, searchDeferred:true,
    missingChunkRecovered:true, originalRoutePreserved:true, pageErrors:0}))
} finally {
  await browser.close()
}
