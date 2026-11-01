import { readFile } from 'node:fs/promises'

const origin = process.env.JOURNAL_ORIGIN || 'https://journal.thedabcorner.site'
const expectedWorker = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8')
const expectedIndex = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const expectedEntry = expectedIndex.match(/\/assets\/index-[^"']+\.js/)?.[0]
if (!expectedEntry) throw Error('Could not identify the built journal entry chunk')

let lastFailure = 'not checked'
for (let attempt = 0; attempt < 24; attempt++) {
  try {
    const [worker, page] = await Promise.all([
      fetch(`${origin}/sw.js`, { cache: 'no-store' }),
      fetch(`${origin}/`, { cache: 'no-store' }),
    ])
    const [workerBody, pageBody] = await Promise.all([worker.text(), page.text()])
    const workerCacheControl = worker.headers.get('cache-control') || ''
    if (worker.ok && page.ok && workerBody === expectedWorker && pageBody.includes(expectedEntry) &&
        workerCacheControl.includes('no-store')) {
      console.log(`Journal Cloudflare release verified: ${expectedEntry}`)
      process.exit(0)
    }
    lastFailure = `HTTP ${worker.status}/${page.status}; worker match: ${workerBody === expectedWorker}; ` +
      `HTML entry match: ${pageBody.includes(expectedEntry)}; sw cache: ${workerCacheControl}`
  } catch (error) { lastFailure = String(error) }
  await new Promise(resolve => setTimeout(resolve, 2500))
}
throw Error(`Journal Cloudflare deployment failed verification: ${lastFailure}`)