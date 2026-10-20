import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { entries } from '../src/data'
import { manuscripts } from '../src/research'
import { compareArchiveEntries } from '../src/lib/archiveSort'

const origin = process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/'
const sortedJournal = [...entries].sort((a, b) => compareArchiveEntries(a, b, 'recent'))
const sortedPapers = [...manuscripts].sort((a, b) => b.revisedAt.localeCompare(a.revisedAt) || a.title.localeCompare(b.title))
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox'],
})
let verified = 0
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    await page.addInitScript(slugs => {
      localStorage.setItem('thelabcorner.journal.saved.v1', JSON.stringify(slugs))
      localStorage.setItem('thelabcorner.journal.preferences.v2', JSON.stringify({ layout: 'list' }))
    }, [sortedJournal.at(-1).slug, sortedJournal[0].slug])
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      const sort = page.getByRole('combobox', { name: 'Sort journal entries' })
      await sort.waitFor()
      assert.equal(await sort.inputValue(), 'recent', width + ' should default to newest')
      assert.equal(await sort.locator('option').first().getAttribute('value'), 'recent', 'newest should be first option')
      const displayed = async () => page.locator('.journal-row-link').evaluateAll(nodes => nodes.map(node => decodeURIComponent(node.getAttribute('href').split('/').filter(Boolean).at(-1))))
      assert.deepEqual(await displayed(), sortedJournal.slice(0, 10).map(entry => entry.slug), width + ' initial archive newest-first')
      const essayButton = page.locator('.workspace-filters .topic-tab').filter({ hasText: 'Essays' })
      await essayButton.click()
      assert.equal(await sort.inputValue(), 'recent', 'subject filter must preserve default')
      assert.deepEqual(await displayed(), sortedJournal.filter(entry => entry.topic === 'Essays').map(entry => entry.slug), 'subject filter newest-first')
      await sort.selectOption('short')
      const engineeringButton = page.locator('.workspace-filters .topic-tab').filter({ hasText: 'Engineering' })
      await engineeringButton.click()
      assert.equal(await sort.inputValue(), 'short', 'explicit sort choice must not reset when switching subjects')
      await sort.selectOption('recent')
      if (width === 390) {
        await page.locator('.mobile-tabbar').getByRole('button', { name: /Saved/ }).click()
      } else {
        await page.locator('.side-nav-row').filter({ hasText: 'Saved articles' }).click()
      }
      assert.equal(await sort.inputValue(), 'recent', 'saved entries must inherit newest default')
      assert.deepEqual(await displayed(), [sortedJournal[0].slug, sortedJournal.at(-1).slug], 'saved newest-first')
      await page.goto(new URL('research/', origin).href, { waitUntil: 'domcontentloaded' })
      assert.deepEqual(await page.locator('.research-publication').evaluateAll(nodes =>
        nodes.map(node => decodeURIComponent(node.getAttribute('href').split('/').filter(Boolean).at(-1))),
      ), sortedPapers.map(paper => paper.id), 'research manuscripts should remain newest revised first')
      verified++
      console.log(JSON.stringify({ width, defaultSort: 'recent', filtered: true, saved: true, research: true, pass: true }))
    } finally { await page.close() }
  }
} finally { await browser.close() }
console.log('Newest-first archive defaults: ' + verified + ' responsive scenarios verified.')
