// The Markdown draft is the canonical copy of Journal 004.
// Run this script before Vite builds; never edit the generated TS directly.
import { readFileSync, writeFileSync } from 'node:fs'

const source = 'content/drafts/i-started-with-html-to-pdf.md'
const destination = 'src/silica-doors-post.ts'

function fromMarkdown(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Journal 004 is missing YAML frontmatter')
  const [, frontmatter, body] = match
  function field(name) {
    const line = frontmatter.match(new RegExp('^' + name + ':\\s*(.+)$', 'm'))?.[1]?.trim()
    if (!line) throw new Error('Missing Journal 004 frontmatter field: ' + name)
    return line.startsWith('"') || line.startsWith('[') ? JSON.parse(line) : line
  }
  const title = field('title')
  const intro = []
  const sections = []
  let current = null
  let pending = []
  const clean = (value) => value.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1')
  function flush() {
    if (!pending.length) return
    const text = clean(pending.join(' '))
    ;(current ? current.paragraphs : intro).push(text)
    pending = []
  }
  const lines = body.trim().split('\n')
  if (lines[0] !== '# ' + title) throw new Error('Journal 004 Markdown title/frontmatter mismatch')
  for (const line of lines.slice(1)) {
    if (line.startsWith('## ')) {
      flush()
      current = { heading: line.slice(3).trim(), paragraphs: [] }
      sections.push(current)
    } else if (line.trim() === '') {
      flush()
    } else {
      pending.push(line.trim())
    }
  }
  flush()
  if (!intro.length || !sections.length || sections.some(s => !s.paragraphs.length)) {
    throw new Error('Journal 004 missing opening paragraphs or section content')
  }
  return {
    slug: field('slug'),
    title,
    shortTitle: 'Beyond PDF',
    contextLabel: 'Journal / 004',
    topic: field('category'),
    stage: 'Editorial draft',
    type: 'Personal essay',
    date: field('date'),
    minutes: 10,
    issue: 'J–004',
    figure: 'pdf',
    summary: field('summary'),
    keywords: field('tags'),
    intro,
    sections,
  }
}

export function generate(markdown) {
  const entry = fromMarkdown(markdown)
  return "import type { Entry } from './data'\n\n" +
    '// Generated from ' + source + ' by scripts/sync-silica-post.mjs. Do not edit.\n' +
    'export const silicaDoorsPost: Entry = ' + JSON.stringify(entry, null, 2) + '\n'
}

const generated = generate(readFileSync(source, 'utf8'))
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== generated) {
    console.error('Journal 004 published source is out of sync with the Markdown draft')
    process.exitCode = 1
  }
} else if (readFileSync(destination, 'utf8') !== generated) {
  writeFileSync(destination, generated)
  console.log('Synchronized Journal 004 Markdown to website content.')
}
