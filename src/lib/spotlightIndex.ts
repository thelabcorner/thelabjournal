import type { Entry } from '../data'
import type { Manuscript } from '../research'

export type SpotlightKind = 'writing' | 'manuscripts' | 'navigate'
export type SpotlightScope = 'all' | SpotlightKind
export type SpotlightAction = 'journal' | 'research' | 'saved' | 'engineering'

export type SpotlightRecord = {
  id: string
  kind: SpotlightKind
  title: string
  summary: string
  eyebrow: string
  reference: string
  date: string
  keywords: readonly string[]
  sections: readonly string[]
  body: string
  entry?: Entry
  manuscript?: Manuscript
  action?: SpotlightAction
}
export type SpotlightHit = { record: SpotlightRecord; score: number; excerpt: string; matchedIn: string }

export const normalizeSpotlight = (value: string) => value.normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\u2010-\u2015]/g, '-')
  .replace(/[₀-₉]/g, character => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(character)))
  .toLocaleLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const actions: ReadonlyArray<Pick<SpotlightRecord, 'id' | 'title' | 'summary' | 'action' | 'keywords'>> = [
  { id: 'action:journal', title: 'All writing', summary: 'Browse the complete journal archive', action: 'journal', keywords: ['journal', 'browse', 'essays', 'all'] },
  { id: 'action:research', title: 'Research library', summary: 'Manuscripts, abstracts and publication metadata', action: 'research', keywords: ['papers', 'research', 'thesis', 'manuscripts'] },
  { id: 'action:saved', title: 'Saved entries', summary: 'Return to writing bookmarked on this device', action: 'saved', keywords: ['bookmarks', 'favorites', 'saved'] },
  { id: 'action:engineering', title: 'Engineering notes', summary: 'Explore systems, algorithms and technical work', action: 'engineering', keywords: ['engineering', 'software', 'systems', 'notes'] },
]

export function buildSpotlightIndex(writing: readonly Entry[], papers: readonly Manuscript[]): SpotlightRecord[] {
  return [
    ...writing.map(entry => ({
      id: 'entry:' + entry.slug, kind: 'writing' as const,
      title: entry.shortTitle, summary: entry.summary, eyebrow: entry.topic + ' / ' + entry.type,
      reference: entry.issue, date: entry.date, keywords: entry.keywords,
      sections: entry.sections.map(section => section.heading),
      body: [
        entry.title, ...(entry.intro ?? []),
        ...entry.sections.flatMap(section => [...section.paragraphs, ...(section.takeaway ? [section.takeaway] : [])]),
      ].join(' '),
      entry,
    })),
    ...papers.map(manuscript => ({
      id: 'manuscript:' + manuscript.id, kind: 'manuscripts' as const,
      title: manuscript.title, summary: manuscript.subtitle, eyebrow: manuscript.field + ' / ' + manuscript.status,
      reference: manuscript.version, date: manuscript.revisedAt, keywords: manuscript.keywords,
      sections: manuscript.contents, body: manuscript.abstract, manuscript,
    })),
    ...actions.map(action => ({
      ...action, kind: 'navigate' as const, eyebrow: 'Navigation',
      reference: 'Go to', date: '', sections: [], body: '',
    })),
  ]
}

const documents = new WeakMap<SpotlightRecord, {
  title: string; summary: string; fields: string[]; sections: string[]; body: string; reference: string
}>()

const cachedFields = (record: SpotlightRecord) => {
  const cached = documents.get(record)
  if (cached) return cached
  const fields = {
    title: normalizeSpotlight(record.title),
    summary: normalizeSpotlight(record.summary),
    fields: [record.eyebrow, ...record.keywords].map(normalizeSpotlight),
    sections: record.sections.map(normalizeSpotlight),
    body: normalizeSpotlight(record.body),
    reference: normalizeSpotlight(record.reference),
  }
  documents.set(record, fields)
  return fields
}

// Allow a single missing, substituted or transposed character in substantive
// tokens. Bound to titles/keywords only; never fuzzy-scan full document bodies.
function closeToken(a: string, b: string): boolean {
  if (a === b) return true
  if (Math.min(a.length, b.length) < 4 || Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, errors = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++errors > 1) return false
    if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; continue }
    if (a[i + 1] === b[j + 1] && a[i + 1] !== undefined) { i += 2; j += 2; continue }
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else { i++; j++ }
  }
  return errors + (a.length - i) + (b.length - j) <= 1
}

function tokenScore(token: string, field: string, exact: number, prefix: number, substring: number, fuzzy = false): number {
  if (!field) return 0
  if (field === token) return exact
  if (field.startsWith(token + ' ') || field.endsWith(' ' + token) || field.includes(' ' + token + ' ')) return exact
  const words = field.split(' ')
  if (words.some(word => word.startsWith(token))) return prefix
  if (field.includes(token)) return substring
  if (fuzzy && words.some(word => closeToken(token, word))) return Math.max(1, substring / 2)
  return 0
}

function excerptFor(record: SpotlightRecord, tokens: readonly string[]): { excerpt: string; matchedIn: string } {
  const heading = record.sections.find(value => tokens.some(token => normalizeSpotlight(value).includes(token)))
  if (heading) return { excerpt: heading, matchedIn: 'Section' }
  const keyword = record.keywords.find(value => tokens.some(token => normalizeSpotlight(value).includes(token)))
  if (keyword) return { excerpt: record.summary, matchedIn: 'Keyword: ' + keyword }
  const paragraphs = record.entry
    ? [...(record.entry.intro ?? []), ...record.entry.sections.flatMap(section => section.paragraphs)]
    : record.manuscript ? [record.manuscript.abstract] : []
  const paragraph = paragraphs.find(value => tokens.some(token => normalizeSpotlight(value).includes(token)))
  if (!paragraph) return { excerpt: record.summary, matchedIn: '' }
  // Return a meaningful contextual window without exposing huge full-text rows.
  const words = paragraph.split(/\s+/)
  const index = words.findIndex(word => tokens.some(token => normalizeSpotlight(word).includes(token)))
  const start = Math.max(0, index - 8)
  const excerpt = words.slice(start, start + 31).join(' ')
  return { excerpt: (start > 0 ? '…' : '') + excerpt + (start + 31 < words.length ? '…' : ''), matchedIn: 'In the text' }
}

export function searchSpotlight(index: readonly SpotlightRecord[], query: string, scope: SpotlightScope = 'all'): SpotlightHit[] {
  const normalized = normalizeSpotlight(query)
  if (!normalized) return []
  const tokens = [...new Set(normalized.split(' ').filter(Boolean))]
  const results: SpotlightHit[] = []
  for (const record of index) {
    if (scope !== 'all' && record.kind !== scope) continue
    const fields = cachedFields(record)
    let score = 0
    let valid = true
    for (const token of tokens) {
      const best = Math.max(
        tokenScore(token, fields.title, 130, 90, 65, true),
        tokenScore(token, fields.reference, 115, 70, 40),
        tokenScore(token, fields.summary, 30, 20, 12),
        ...fields.fields.map(value => tokenScore(token, value, 72, 43, 25, true)),
        ...fields.sections.map(value => tokenScore(token, value, 52, 32, 19)),
        // Body-text relevance only needs substring presence. Avoid allocating
        // a full word array per keystroke for every long journal article.
        fields.body.includes(token) ? 6 : 0,
      )
      if (!best) { valid = false; break }
      score += best
    }
    if (!valid) continue
    if (fields.title === normalized) score += 170
    if (fields.title.startsWith(normalized)) score += 60
    // Stronger relevance wins before date; a very broad action never masks a
    // direct document-title hit. Stable ID ordering makes queries deterministic.
    const context = excerptFor(record, tokens)
    results.push({ record, score, ...context })
  }
  return results.sort((a, b) => b.score - a.score ||
    b.record.date.localeCompare(a.record.date) || a.record.id.localeCompare(b.record.id))
}

export function spotlightSuggestions(index: readonly SpotlightRecord[], recent: readonly string[], scope: SpotlightScope): SpotlightHit[] {
  const byID = new Map(index.map(record => [record.id, record]))
  const shown = new Set<string>()
  const results: SpotlightHit[] = []
  const append = (record: SpotlightRecord | undefined) => {
    if (!record || shown.has(record.id) || (scope !== 'all' && record.kind !== scope)) return
    shown.add(record.id)
    results.push({ record, score: 0, excerpt: record.summary, matchedIn: '' })
  }
  for (const id of recent.slice(0, 4)) append(byID.get(id))
  for (const id of ['action:journal', 'action:research', 'action:saved', 'action:engineering',
    'entry:learning-in-reverse', 'entry:nacre-vectorization', 'manuscript:gravimetric-decarboxylation-co2-progress',
    'manuscript:low-temp-lyophilization-three-theses']) append(byID.get(id))
  return results
}