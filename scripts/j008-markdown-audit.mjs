import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const source = await readFile(new URL('../content/drafts/thinking-like-the-model.md', import.meta.url), 'utf8')
const count = (re) => [...source.matchAll(re)].length
const expected = {
  strong: count(/\*\*[^*]+\*\*/g),
  italic: count(/(?<!\*)\*(?!\*)[^*\n]+\*(?!\*)/g),
  blockquotes: count(/^> /gm),
  subsections: count(/^### /gm),
  sections: count(/^## /gm),
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
      const text = article.textContent || ''
      return {
        strong: strong.length,
        italic: italic.length,
        blockquotes: article.querySelectorAll('.journal-markdown blockquote').length,
        subsections: article.querySelectorAll('.journal-markdown h3').length,
        sections: article.querySelectorAll('.prose-section h2').length,
        tables: article.querySelectorAll('.journal-markdown table').length,
        math: article.querySelectorAll('.journal-markdown .katex-display').length,
        hasFundamentals: text.includes('context window') && text.includes('a prompt'),
        hasArgument: text.includes('voluntary disintellect') && text.includes('If you recognize yourself in this, good.'),
        hasExamples: text.includes("Don't create a new memory") && text.includes("Don't modify the code"),
        hasClone: text.includes('clone of myself'),
        strongPhrase: strong.some(el => el.textContent.includes('proper delegation begins before you press enter')),
        strongWeight: getComputedStyle(strong[0]).fontWeight,
        italicStyle: getComputedStyle(italic[0]).fontStyle,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }
    })
    assert.equal(stats.strong, expected.strong, width + ': bold emphasis lost')
    assert.equal(stats.italic, expected.italic, width + ': italic emphasis lost')
    assert.equal(stats.blockquotes, expected.blockquotes, width + ': quotes lost')
    assert.equal(stats.subsections, expected.subsections, width + ': nested headings lost')
    assert.equal(stats.sections, expected.sections, width + ': article sections lost')
    assert.ok(stats.hasFundamentals && stats.hasArgument && stats.hasExamples && stats.hasClone && stats.strongPhrase, width + ': editorial content missing')
    assert.ok(Number(stats.strongWeight) >= 600, width + ': bold is not styled as bold')
    assert.equal(stats.italicStyle, 'italic', width + ': italics are not styled')
    assert.ok(stats.pageWidth <= stats.viewportWidth + 1, width + ': horizontal overflow')
    assert.deepEqual(errors, [], width + ': page JavaScript errors')
    console.log('Journal 008 reader passed:', width, JSON.stringify(stats))
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
