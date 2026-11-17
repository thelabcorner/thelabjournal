import type { Entry, Section } from './data'
// Preserve the Markdown editorial source in the reader, like Journal 008.
import manuscript from '../content/drafts/shake-the-8-ball-again.md?raw'

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
    .replace(/^>\s?/gm, '')))
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
    if (/^#\s+/.test(line)) continue // The article shell renders its own H1.
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

export const shakeThe8BallAgainPost: Entry = {
  slug: 'shake-the-8-ball-again',
  title: 'Shake the 8 Ball Again',
  shortTitle: 'Shake the 8 Ball Again',
  contextLabel: 'Journal / 009',
  topic: 'Essays',
  stage: 'Published',
  type: 'Personal essay',
  date: '2026-11-17',
  minutes: 12,
  issue: 'J–009',
  figure: 'signals',
  summary: 'Language models can offer convincing answers without independently establishing their truth. How I use repeated questions, deliberate framing, skepticism, and verification to get something more useful.',
  keywords: ['LLMs', 'Critical thinking', 'Sycophancy', 'Engineering', 'Scientific reasoning', 'Decision-making', 'Verification', 'Metacognition'],
  introMarkdown: essay.introMarkdown,
  intro: essay.intro,
  sections: essay.sections,
}
