// Built-release cache budget and offline bootstrap invariants.
// Run after vite build. This inspects what Workbox really receives, not the
// full build directory or an estimated transfer size.
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve('dist')
const sw = await readFile(resolve(dist, 'sw.js'), 'utf8')
const urls = [...sw.matchAll(/\{url:"([^"]+)",revision:/g)].map(match => match[1])
const entries = await Promise.all(urls.map(async url => {
  const asset = resolve(dist, decodeURIComponent(url).split('?')[0])
  return { url, bytes: (await stat(asset)).size }
}))
const total = entries.reduce((sum, item) => sum + item.bytes, 0)
const present = new Set(urls)
const manifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'))
const visited = new Set()
const required = new Set(['index.html', 'author-avatar-128.webp'])
function traverse(key) {
  if (visited.has(key)) return
  const chunk = manifest[key]
  if (!chunk) throw Error('Missing manifest dependency ' + key)
  visited.add(key)
  required.add(chunk.file)
  for (const asset of [...(chunk.css ?? []), ...(chunk.assets ?? [])]) required.add(asset)
  for (const dependency of chunk.imports ?? []) traverse(dependency)
}
traverse('index.html')
const missing = [...required].filter(url => !present.has(url))
if (missing.length) throw Error('Offline bootstrap missing: ' + missing.join(', '))
if (present.has('author-avatar.png')) throw Error('Full-resolution portrait must not block offline installation')
if (entries.some(entry => /\.woff(?:\?|$)/.test(entry.url))) {
  throw Error('Legacy WOFF fonts duplicate the modern WOFF2 preload')
}
if (!entries.some(entry => /^assets\/react-runtime-[\w-]+\.js$/.test(entry.url))) {
  throw Error('Stable React runtime must remain isolated from editorial release changes')
}
const contentModule = Object.values(manifest).find(entry =>
  /(?:^|\/)journal-content(?:-[\w-]+)?\.js$/.test(entry.file))
if (!contentModule || !present.has(contentModule.file)) {
  throw Error('Independent editorial content module must be precached')
}
if (process.env.GITHUB_PAGES !== 'true') {
  if (contentModule.file !== 'journal-content.js') {
    throw Error('Canonical release must use the stable editorial content URL')
  }
  const headers = await readFile(resolve(dist, '_headers'), 'utf8')
  if (!/\/journal-content\.js\s+Cache-Control:\s*no-cache,\s*must-revalidate/.test(headers)) {
    throw Error('Stable editorial content requires HTTP revalidation')
  }
}
const entryBytes = (await stat(resolve(dist, manifest['index.html'].file))).size
if (entryBytes > 425000) {
  throw Error('Reader startup JS exceeded 425 KB budget: ' + entryBytes)
}
if (entries.some(e => /\/assets\/(emacs-lisp|cpp|wolfram)-/.test(e.url))) {
  throw Error('Optional syntax modules still block service-worker installation')
}
if (urls.length > 75 || total > 6 * 1024 * 1024) {
  throw Error('Offline bootstrap exceeded budget: ' + urls.length + ' entries, ' + total + ' bytes')
}
console.log(JSON.stringify({pass:true,files:urls.length,bytes:total,mebibytes:Number((total/1048576).toFixed(2)),startupDependencies:required.size,top:entries.sort((a,b)=>b.bytes-a.bytes).slice(0,8)}))
