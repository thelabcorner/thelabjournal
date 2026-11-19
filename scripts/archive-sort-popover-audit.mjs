// Production browser audit of the journal archive's lightweight custom sort
// popover. No service worker, native select fallback, or dev server required.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve('dist')
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const path = resolve(root, '.' + pathname)
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(400).end()
    let file = path
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html') }
    catch { file = resolve(root, 'index.html') }
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream')
    response.end(await readFile(file))
  } catch (error) { response.writeHead(500).end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = 'http://127.0.0.1:' + server.address().port + '/'
let browser
const summaries = []

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--no-sandbox']
  })
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 700 : 820 },
      hasTouch: width < 768,
      isMobile: width < 768,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin, { waitUntil: 'domcontentloaded' })
    const trigger = page.getByRole('combobox', { name: 'Sort journal entries' })
    await trigger.waitFor()
    assert.equal(await trigger.evaluate(node => node.tagName), 'BUTTON', 'sort trigger must be a non-native button')
    assert.equal(await page.locator('select#journal-sort').count(), 0, 'native select must not remain')
    assert.equal((await trigger.innerText()).trim(), 'Newest')
    await trigger.click()
    const popup = page.getByRole('listbox', { name: 'Sort journal entries' })
    await popup.waitFor()
    assert.equal(await popup.getByRole('option').count(), 4)
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
    assert.equal(await trigger.getAttribute('aria-activedescendant') !== null, true)

    const geometry = await popup.evaluate(node => {
      const bounds = node.getBoundingClientRect()
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom,
        viewport: innerWidth, height: innerHeight, parent: node.parentElement?.tagName }
    })
    assert.ok(geometry.left >= 10 && geometry.right <= geometry.viewport - 10,
      `Popover overflows horizontally at ${width}px: ${JSON.stringify(geometry)}`)
    assert.ok(geometry.top >= 10 && geometry.bottom <= geometry.height - 10,
      `Popover overflows vertically at ${width}px: ${JSON.stringify(geometry)}`)
    assert.equal(geometry.parent, 'BODY', 'Popover must render in a portal outside clipping containers')
    await popup.getByRole('option', { name: 'Subject' }).click()
    assert.equal((await trigger.innerText()).trim(), 'Subject')
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
    assert.equal(await trigger.evaluate(el => document.activeElement === el), true,
      'Focus must return to the trigger when an option is selected')
    assert.equal((await page.locator('.journal-row .row-type .badge').first().innerText()).trim(), 'Essays',
      'Subject sorting must still use the original archive comparator')

    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    await popup.waitFor()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    assert.equal((await trigger.innerText()).trim(), 'Shortest', 'ArrowDown + Enter must select the next option')
    await page.keyboard.press('ArrowDown')
    await popup.waitFor()
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    assert.equal((await trigger.innerText()).trim(), 'Longest', 'End + Enter must select the final option')
    await page.keyboard.press('ArrowDown')
    await popup.waitFor()
    await page.keyboard.press('n')
    await page.keyboard.press('Enter')
    assert.equal((await trigger.innerText()).trim(), 'Newest', 'Typeahead must navigate to matching options')

    await trigger.click()
    await popup.waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Escape must dismiss the menu')
    await trigger.click()
    await popup.waitFor()
    await page.locator('#index-heading').click()
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Outside click must dismiss the menu')

    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark' })
    await trigger.click()
    await popup.waitFor()
    const colors = await popup.evaluate(node => ({
      background: getComputedStyle(node).backgroundColor,
      foreground: getComputedStyle(node).color,
      documentWidth: document.documentElement.scrollWidth,
      innerWidth,
    }))
    assert.notEqual(colors.background, 'rgba(0, 0, 0, 0)')
    assert.ok(colors.documentWidth <= colors.innerWidth + 1, `Page overflow at ${width}px`)
    await page.keyboard.press('Escape')
    assert.deepEqual(errors, [], `Console JS errors at ${width}px`)

    summaries.push({ width, popupWithinViewport: true, options: 4,
      mouse: true, keyboard: true, typeahead: true, outsideClick: true, darkTheme: true })
    await context.close()
  }
  console.log(JSON.stringify({ pass: true, audit: 'archive-sort-popover', results: summaries }, null, 2))
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
