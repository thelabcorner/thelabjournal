import { readFile } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN || 'https://journal.thedabcorner.site'
const expectedWorker = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8')
const expectedIndex = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const expectedContent = await readFile(new URL('../dist/journal-content.js', import.meta.url), 'utf8')
const expectedEntry = expectedIndex.match(/\/assets\/index-[^"']+\.js/)?.[0]
if (!expectedEntry) throw Error('Could not identify the built journal entry chunk')

let lastFailure = 'not checked'
for (let attempt = 0; attempt < 24; attempt++) {
  try {
    const [worker, page, content] = await Promise.all([
      fetch(`${origin}/sw.js`, { cache: 'no-store' }),
      fetch(`${origin}/`, { cache: 'no-store' }),
      fetch(`${origin}/journal-content.js`, { cache: 'no-store' }),
    ])
    const [workerBody, pageBody, contentBody] = await Promise.all([
      worker.text(), page.text(), content.text(),
    ])
    const workerCacheControl = worker.headers.get('cache-control') || ''
    const contentCacheControl = content.headers.get('cache-control') || ''
    if (worker.ok && page.ok && content.ok && workerBody === expectedWorker &&
        pageBody.includes(expectedEntry) && contentBody === expectedContent &&
        workerCacheControl.includes('no-store') && /no-cache|must-revalidate|max-age=0/.test(contentCacheControl) &&
        !contentCacheControl.includes('immutable')) {
      console.log(`Journal Cloudflare release verified: ${expectedEntry}`)
      process.exit(0)
    }
    lastFailure = `HTTP ${worker.status}/${page.status}/${content.status}; ` +
      `worker match: ${workerBody === expectedWorker}; HTML entry match: ${pageBody.includes(expectedEntry)}; ` +
      `content match: ${contentBody === expectedContent}; sw cache: ${workerCacheControl}; content cache: ${contentCacheControl}`
  } catch (error) { lastFailure = String(error) }
  await new Promise(resolve => setTimeout(resolve, 2500))
}
throw Error(`Journal Cloudflare deployment failed verification: ${lastFailure}`)