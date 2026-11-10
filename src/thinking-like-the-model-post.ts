import type { Entry, Section } from './data'
// The Markdown document is the canonical editorial source. Preserve its syntax
// for the reader; plain paragraphs remain available for archive/search consumers.
import manuscript from '../content/drafts/thinking-like-the-model.md?raw'

const plainText = (value: string) => value
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/\x60+/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const plainParagraphs = (markdown: string): string[] => markdown
  .split(/\r?\n\s*\r?\n/)
  .map(block => plainText(block
    .replace(/^#{3,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\|[\s:|-]+\|\s*$/gm, '')
    .replace(/^\|/gm, '')
    .replace(/\|\s*$/gm, '')
    .replace(/\s*\|\s*/g, ' / ')
    .replace(/^\$\$\s*$/gm, '')))
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
    // The article shell already renders the H1; section navigation owns H2s.
    if (/^#\s+/.test(line)) continue
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

export const thinkingLikeTheModelPost: Entry = {
  slug: 'thinking-like-the-model',
  title: 'Thinking Like the Model',
  shortTitle: 'Thinking Like the Model',
  contextLabel: 'Journal / 008',
  topic: 'Essays',
  stage: 'Published',
  type: 'Personal essay',
  date: '2026-11-09',
  minutes: 18,
  issue: 'J–008',
  figure: 'agent',
  summary: 'A practical introduction to prompting and agent delegation: what models can see, how context shapes their behavior, and why blindly reprompting can make a bad result worse.',
  keywords: ['Prompt engineering', 'AI agents', 'Delegation', 'Context engineering', 'Prompt introspection', 'Post-training', 'Metacognition', 'OpenFork'],
  introMarkdown: essay.introMarkdown,
  intro: essay.intro,
  sections: essay.sections,
}
