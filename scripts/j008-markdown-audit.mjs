import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const source = await readFile(new URL('../content/drafts/thinking-like-the-model.md', import.meta.url), 'utf8')
const count = (re) => [...source.matchAll(re)].length
const expected = {
  strong: count(/\*\*[^*]+\*\*/g),
  blockquotes: count(/^> /gm),
  subsections: count(/^### /gm),
}
const origin = process.env.JOURNAL_PREVIEW_ORIGIN || 'http://127.0.0.1:11265'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})

try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin + '/posts/thinking-like-the-model/', { waitUntil: 'networkidle' })
    await page.locator('.journal-markdown strong').first().waitFor()
    const stats = await page.evaluate(() => {
      const article = document.querySelector('.article-prose')
      const strong = [...article.querySelectorAll('.journal-markdown strong')]
      const italic = [...article.querySelectorAll('.journal-markdown em')]
      const quote = article.querySelectorAll('.journal-markdown blockquote')
      const subheading = article.querySelectorAll('.journal-markdown h3')
      const tables = article.querySelectorAll('.journal-markdown table')
      const math = article.querySelectorAll('.journal-markdown .katex-display')
      return {
        strong: strong.length,
        italic: italic.length,
        blockquotes: quote.length,
        subsections: subheading.length,
        tables: tables.length,
        math: math.length,
        containsExample: article.textContent.includes('Continue the same task with the newly selected model.'),
        containsStrongExample: strong.some(el => el.textContent === 'Properly.'),
        containsCode: article.textContent.includes('P(x'),
        strongWeight: getComputedStyle(strong[0]).fontWeight,
        italicStyle: getComputedStyle(italic[0]).fontStyle,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }
    })
    assert.equal(stats.strong, expected.strong, width + ': bold emphasis lost')
    assert.ok(stats.italic >= 10, width + ': italic emphasis lost')
    assert.equal(stats.blockquotes, expected.blockquotes, width + ': quotes lost')
    assert.equal(stats.subsections, expected.subsections, width + ': nested headings lost')
    assert.equal(stats.tables, 1, width + ': comparison table missing')
    assert.equal(stats.math, 1, width + ': KaTeX equation missing')
    assert.ok(stats.containsExample && stats.containsStrongExample, width + ': source text differs')
    assert.ok(Number(stats.strongWeight) >= 600, width + ': bold is not styled as bold')
    assert.equal(stats.italicStyle, 'italic', width + ': italics are not styled')
    assert.ok(stats.pageWidth <= stats.viewportWidth + 1, width + ': horizontal overflow')
    assert.deepEqual(errors, [], width + ': page JavaScript errors')
    console.log('Journal Markdown passed:', width, JSON.stringify(stats))
    await page.close()
  }

  const legacy = await browser.newPage()
  await legacy.goto(origin + '/posts/the-work-i-no-longer-have-to-do/', { waitUntil: 'networkidle' })
  assert.ok(await legacy.getByRole('heading', { name: 'The work we no longer have to do' }).isVisible())
  assert.equal(await legacy.locator('.journal-markdown').count(), 0, 'Legacy entry unexpectedly changed renderer')
  console.log('Legacy journal entry preserved')
  await legacy.close()
} finally {
  await browser.close()
}
