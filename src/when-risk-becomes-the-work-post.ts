import type { Entry, Section } from './data'
// The Markdown is the editorial source of truth, as in Journals 008 and 009.
import manuscript from '../content/drafts/when-risk-becomes-the-work.md?raw'

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

export const whenRiskBecomesTheWorkPost: Entry = {
  slug: 'when-risk-becomes-the-work',
  title: 'When Risk Becomes the Work',
  shortTitle: 'When Risk Becomes the Work',
  contextLabel: 'Journal / 010',
  topic: 'Essays',
  stage: 'Published',
  type: 'Personal essay',
  date: '2026-11-17',
  minutes: 11,
  issue: 'J–010',
  figure: 'signals',
  summary: 'What two weeks of router-firmware work taught me about LLMs, manufactured uncertainty, disproportionate caution, and the judgment required to accept risk.',
  keywords: ['LLMs', 'AI agents', 'Risk management', 'Engineering', 'Uncertainty', 'Decision-making', 'Firmware', 'Autonomous development'],
  introMarkdown: essay.introMarkdown,
  intro: essay.intro,
  sections: essay.sections,
}
