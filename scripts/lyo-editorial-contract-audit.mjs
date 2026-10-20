import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const root = resolve('src/manuscript-runtime/data/papers/sublimation')
const sourceFiles = []
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else if (/\.(tsx?|css)$/.test(entry.name)) sourceFiles.push(path)
  }
}
await collect(root)

const failures = []
const contents = new Map()
for (const path of sourceFiles) {
  const text = await readFile(path, 'utf8')
  contents.set(path, text)
  if (path.endsWith('.tsx') && /<(?:strong|b)>[^<>]{2,120}:<\/(?:strong|b)>/.test(text)) {
    failures.push(`${relative(process.cwd(), path)} contains an editorial label-colon lead-in`)
  }
  if (path.endsWith('LiteratureReviewSection.tsx') && /\b(?:P_apparent|P_total)\b/.test(text)) {
    failures.push(`${relative(process.cwd(), path)} contains raw pressure-variable notation`)
  }
  if (text.includes('\u2014')) failures.push(`${relative(process.cwd(), path)} contains U+2014`)
  if (/\b(?:ul|ol)\s*(?:\/?>|\s)/i.test(text) && path.endsWith('.tsx')) {
    failures.push(`${relative(process.cwd(), path)} contains list markup`)
  }
}

const references = contents.get(join(root, 'references.ts')) ?? ''
const instrumentation = contents.get(join(root, 'sections', 'LiteratureReviewSection.tsx')) ?? ''
if (!references.includes("id: 'hansen1992tcgauge'") || !references.includes("url: 'https://www.belljar.net/tcgauge.htm'")) {
  failures.push('Missing linked Bell Jar thermocouple gauge reference')
}
if (!instrumentation.includes('https://www.belljar.net/tcgauge.htm')
  || !instrumentation.includes("refs={['hansen1992tcgauge']}")
  || !instrumentation.includes('Type 531')) {
  failures.push('Bell Jar source must be linked and discussed in the gauge section')
}

const labels = []
for (const [path, text] of contents) {
  if (!path.endsWith('.tsx')) continue
  for (const match of text.matchAll(/<MathBlock\b[\s\S]*?\blabel="\((\d+\.\d+)\)"/g)) labels.push(match[1])
}
const pythonPath = join(root, 'equationPython.ts')
const pythonText = contents.get(pythonPath)
assert(pythonText, 'equationPython.ts was not included in the paper source audit')
const mappedLabels = [...pythonText.matchAll(/^\s*"(\d+\.\d+)":\s*\{/gm)].map(match => match[1])
if (new Set(labels).size !== labels.length) failures.push('Displayed equation labels are not unique')
if (mappedLabels.length !== 23) failures.push(`Expected 23 Python equation views, found ${mappedLabels.length}`)
if (labels.length !== 23) failures.push(`Expected 23 displayed equations, found ${labels.length}`)
for (const label of ['3.11', '3.12', '3.13']) {
  if (!labels.includes(label)) failures.push(`Missing coupled vapor-removal equation ${label}`)
}
if (!(contents.get(join(root, 'chamberCoupling.ts')) ?? '').includes('solveWellMixedChamber')) failures.push('Missing well-mixed chamber conservation model')
for (const label of labels) if (!mappedLabels.includes(label)) failures.push(`Displayed equation has no Python view: ${label}`)
for (const label of mappedLabels) if (!labels.includes(label)) failures.push(`Python equation has no displayed counterpart: ${label}`)

const nav = contents.get(join(root, 'nav.ts'))
const display = [...contents].filter(([path]) => path.endsWith('.tsx')).map(([, text]) => text).join('\n')
const sectionIds = contents.get(join(root, 'index.tsx'))
for (const id of [...(nav ?? '').matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1])) {
  const externallyRenderedTitle = id === 'title' && /<TitlePage\b/.test(sectionIds ?? '')
  if (!display.includes(`id="${id}"`) && !externallyRenderedTitle) failures.push(`Navigation target has no displayed element: ${id}`)
}

const displayedLabels = [...display.matchAll(/\blabel="\((\d+\.\d+)\)"/g)].map(match => match[1])
for (const stale of ['1.4', '2.7', '5.4', '5.5', '5.6', '5.7', '5.8']) {
  if (displayedLabels.includes(stale)) failures.push(`Stale displayed equation label: ${stale}`)
}

assert.deepEqual(failures, [], 'Lyophilization editorial contract failed')
console.log(`Passed: ${sourceFiles.length} paper-owned source files; no U+2014 or list markup; ${labels.length} displayed equations are mapped to ${mappedLabels.length} Python views; navigation targets resolve.`)
