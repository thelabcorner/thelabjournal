import type { Entry, Section } from './data'
// Vite's raw-asset import keeps the Markdown editorial source authoritative.
import draft from '../content/drafts/thinking-like-the-model.md?raw'

const cleanInline = (text: string) => text
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/\*(.+?)\*/g, '$1')
  .replace(/`(.+?)`/g, '$1')
  .replace(/\\mid/g, '|')
  .replace(/\\leq/g, '≤')
  .replace(/\\theta/g, 'θ')
  .replace(/x_\{t\+1\}/g, 'xₜ₊₁')
  .replace(/x_\{\\leq t\}/g, 'x₍≤ₜ₎')
  .replace(/\\?\s*;/g, ';')
  .replace(/\s+/g, ' ')
  .trim()

const parseEssay = (markdown: string) => {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  const lines = body.split(/\r?\n/)
  const intro: string[] = []
  const sections: Section[] = []
  let paragraph: string[] = []
  let current: Section | undefined
  let table: string[][] | undefined
  let math = false
  let mathLines: string[] = []

  const addParagraph = () => {
    if (!paragraph.length) return
    const text = cleanInline(paragraph.join(' ').replace(/^>\s?/gm, ''))
    if (text) (current ? current.paragraphs : intro).push(text)
    paragraph = []
  }
  const addTable = () => {
    if (!table) return
    const rows = table.filter(row => !row.every(cell => /^[-:]+$/.test(cell)))
    const [headers, ...values] = rows
    for (const row of values) {
      const cells = row.map((cell, index) => `${headers[index]}: ${cleanInline(cell)}`)
      ;(current ? current.paragraphs : intro).push(cells.join(' · '))
    }
    table = undefined
  }

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/)
    if (heading) {
      addParagraph()
      addTable()
      if (heading[1].length === 1) continue
      current = { heading: cleanInline(heading[2]), paragraphs: [] }
      sections.push(current)
      continue
    }
    if (line.trim() === '$$') {
      addParagraph()
      if (math) {
        paragraph.push(mathLines.join(' '))
        mathLines = []
      }
      math = !math
      continue
    }
    if (math) {
      mathLines.push(line.trim())
      continue
    }
    if (line.trim().startsWith('|')) {
      addParagraph()
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
      ;(table ??= []).push(cells)
      continue
    }
    addTable()
    if (!line.trim()) addParagraph()
    else paragraph.push(line.trim().replace(/^>\s?/, ''))
  }
  addParagraph()
  addTable()
  return { intro, sections }
}

const essay = parseEssay(draft)

/** Complete canonical essay, rendered in the journal reader's plain-text section format. */
export const thinkingLikeTheModelPost: Entry = {
  slug: 'thinking-like-the-model',
  title: 'Thinking Like the Model',
  shortTitle: 'Thinking Like the Model',
  contextLabel: 'Journal / 008',
  topic: 'Essays',
  stage: 'Published',
  type: 'Personal essay',
  date: '2026-11-09',
  minutes: 24,
  issue: 'J–008',
  figure: 'agent',
  summary: 'Why understanding how language models interpret context is essential to prompt introspection, explicit instructions, and properly delegating work to agents.',
  keywords: ['Prompt engineering', 'AI agents', 'Delegation', 'Context engineering', 'Prompt introspection', 'Post-training', 'Metacognition', 'OpenFork'],
  intro: essay.intro,
  sections: essay.sections,
}
