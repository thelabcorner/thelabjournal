// Prove that a text-only release invalidates content, not the immutable
// application runtime. The source file is NEVER edited: Vite transforms one
// string in memory for the canary build, then always restores the normal dist.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'vite'

const manifestFile = new URL('../dist/.vite/manifest.json', import.meta.url)
const workerFile = new URL('../dist/sw.js', import.meta.url)
const contentFile = new URL('../dist/journal-content.js', import.meta.url)

async function snapshot() {
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
  const entry = manifest['index.html']?.file
  const react = Object.values(manifest).find(chunk => /(?:^|\/)react-runtime-[\w-]+\.js$/.test(chunk.file))?.file
  const content = Object.values(manifest).find(chunk => chunk.file === 'journal-content.js')?.file
  assert(entry && react && content, 'Runtime/content boundaries missing')
  const worker = await readFile(workerFile, 'utf8')
  const revision = worker.match(/url:"journal-content\.js",revision:"([^"]+)"/)?.[1]
  assert(revision, 'Workbox must track article corpus revisions')
  const index = await readFile(new URL('../dist/' + entry, import.meta.url))
  return {entry, react, content, revision, index, contentBody: await readFile(contentFile)}
}

// Start both sides from the same Vite programmatic build pipeline.
await build({logLevel:'error'})
const first = await snapshot()
let edited = 0
let restored = false
try {
  await build({
    logLevel: 'error',
    plugins: [{
      name: 'journal-cache-canary',
      enforce: 'pre',
      transform(code, id) {
        if (!/[/\\]src[/\\]first-post\.ts$/.test(id)) return
        const needle = 'I learn by building.'
        if (!code.includes(needle)) throw Error('Canary source phrase missing')
        edited += 1
        return { code: code.replace(needle, 'I learn by building, under a release canary.'), map: null }
      },
    }],
  })
  const second = await snapshot()
  assert.equal(edited, 1, 'Canary did not transform exactly one module')
  if (second.entry !== first.entry) {
    const oldText = first.index.toString('utf8')
    const newText = second.index.toString('utf8')
    let mismatch = 0
    while (mismatch < Math.min(oldText.length,newText.length) && oldText[mismatch] === newText[mismatch]) mismatch++
    console.error(JSON.stringify({entryMismatch:{
      old:first.entry,new:second.entry,position:mismatch,
      original:oldText.slice(Math.max(0,mismatch-140),mismatch+200),
      canary:newText.slice(Math.max(0,mismatch-140),mismatch+200),
      bytes:[oldText.length,newText.length]
    }}))
  }
  assert.equal(second.entry, first.entry, 'Text revision invalidated application runtime')
  assert.equal(second.react, first.react, 'Text revision invalidated React runtime')
  assert.notEqual(second.revision, first.revision, 'Worker missed the editorial content revision')
  assert.notDeepEqual(second.contentBody, first.contentBody, 'Content bytes did not change')
  assert.deepEqual(second.index, first.index, 'Application runtime bytes changed unexpectedly')
  console.log(JSON.stringify({
    pass:true, preservedAppEntry: first.entry,
    preservedReactChunk: first.react, contentModule: first.content,
    contentRevisionChanged:true, sourceFilesModified:false
  }))
} finally {
  // Dist is never left containing the synthetic article, even on assertion
  // failure; a normal Vite build restores the original in-repo content.
  await build({logLevel:'error'})
  restored = true
  const last = await snapshot()
  assert.equal(last.revision, first.revision, 'Canary output did not restore')
}
assert(restored)
