import type { Entry, Section } from './data'
// The Markdown document is the canonical editorial source of Journal 011.
// Preserve Markdown for the reader; flattened paragraphs support archive/search.
import manuscript from '../content/drafts/the-thinking-behind-my-short-prompts.md?raw'

const plainText = (value: string) => value
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/\x60+/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const plainParagraphs = (markdown: string): string[] => markdown
  .split(/\r?\n\s*\r?\n/)
  .map(block => plainText(block.replace(/^#{3,6}\s+/gm, '').replace(/^>\s?/gm, '')))
  .filter(Boolean)

function parseEssay(markdown: string) {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
  const introLines: string[] = []
  const sections: Section[] = []
  let current: { heading: string; lines: string[] } | undefined

  const finishSection = () => {
    if (!current) return
    const source = current.lines.join('\n').trim()
    sections.push({
      heading: current.heading,
      paragraphs: plainParagraphs(source),
      markdown: source,
    })
  }

  for (const line of body.split(/\r?\n/)) {
    if (/^#\s+/.test(line)) continue // The article shell renders the H1.
    const section = /^##\s+(.+?)\s*$/.exec(line)
    if (section) {
      finishSection()
      current = { heading: plainText(section[1]), lines: [] }
    } else if (current) {
      current.lines.push(line)
    } else {
      introLines.push(line)
    }
  }
  finishSection()
  const introMarkdown = introLines.join('\n').trim()
  return { introMarkdown, intro: plainParagraphs(introMarkdown), sections }
}

const essay = parseEssay(manuscript)

export const thinkingBehindShortPromptsPost: Entry = {
  slug: 'the-thinking-behind-my-short-prompts',
  title: 'The Thinking Behind My Short Prompts',
  shortTitle: 'The Thinking Behind My Short Prompts',
  contextLabel: 'Journal / 011',
  topic: 'Essays',
  stage: 'Published',
  type: 'Personal essay',
  date: '2026-11-18',
  minutes: 15,
  issue: 'J–011',
  figure: 'agent',
  summary: 'Why many of my LLM prompts are only a few words long, and how context, unspoken expectations, independent reasoning, and judgment determine what I choose to say.',
  keywords: ['LLMs', 'Prompt engineering', 'Context engineering', 'AI agents', 'Critical thinking', 'Delegation', 'Metacognition', 'Efficiency', 'Judgment'],
  introMarkdown: essay.introMarkdown,
  intro: essay.intro,
  sections: essay.sections,
}
