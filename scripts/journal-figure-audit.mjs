/**
 * Journal-specific figure coverage, narrow-screen overflow and content checks.
 * Usage: bun scripts/journal-figure-audit.mjs [http://127.0.0.1:11274]
 * Local dev server required. Does not affect manuscript figures.
 */
import { chromium } from 'playwright-core'
import { entries } from '../src/data.ts'
import { journalFigureSpecs } from '../src/components/journalFigureData.ts'

const origin = (process.argv[2] || 'http://127.0.0.1:11274').replace(/\/$/,'')
const chrome = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome')
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const failures = []
const report = []
try {
  const ctx = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  const page = await ctx.newPage()
  for(const entry of entries) {
    if(!journalFigureSpecs[entry.slug]) { failures.push(entry.slug+': missing figure spec');continue }
    await page.goto(origin+'/?post='+encodeURIComponent(entry.slug), {waitUntil:'domcontentloaded',timeout:30000})
    await page.locator('article.article-layout .jf-figure').first().waitFor({timeout:10000})
    const expected=entry.sections.length>1 && journalFigureSpecs[entry.slug].detail?2:1
    const result=await page.evaluate(() => {
      const figures=Array.from(document.querySelectorAll('article.article-layout .jf-figure'))
      const overflow=Array.from(document.querySelectorAll('article.article-layout .jf-node-copy'))
        .filter(el => el.scrollWidth>el.clientWidth+2)
        .map(el=>el.textContent?.slice(0,70))
      return {figureCount:figures.length, titles:figures.map(f=>f.querySelector('.jf-title')?.textContent),
        captions:figures.map(f=>f.querySelector('figcaption')?.textContent),
        docOverflow:document.documentElement.scrollWidth-window.innerWidth,
        overflows:overflow}
    })
    if(result.figureCount!==expected)failures.push(entry.slug+': expected '+expected+' figures, found '+result.figureCount)
    if(result.titles.some(x=>!x)||result.captions.some(x=>!x))failures.push(entry.slug+': missing visible title or caption')
    if(result.docOverflow>2)failures.push(entry.slug+': horizontal document overflow '+result.docOverflow+'px')
    if(result.overflows.length)failures.push(entry.slug+': node text overflow '+result.overflows.join(', '))
    report.push({slug:entry.slug,figures:result.figureCount,overflow:result.docOverflow})
  }
  // The extreme phone width, mid-sized tablet, and desktop get separate layout checks.
  for(const width of [320,768,1280]) {
    await page.setViewportSize({width,height:900})
    for(const slug of ['neural-fields-and-e-ink','nacre-vectorization','on-acyclicity-in-agentic-engineering','anvil-lossless-codec']) {
      await page.goto(origin+'/?post='+slug,{waitUntil:'domcontentloaded'})
      await page.locator('article.article-layout .jf-figure').first().waitFor()
      const dx=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)
      if(dx>2) failures.push(slug+'@'+width+': horizontal overflow '+dx+'px')
    }
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify({entries:entries.length,figures:report.reduce((sum,x)=>sum+x.figures,0),checks:report.length,failures},null,2))
if(failures.length)process.exitCode=1
