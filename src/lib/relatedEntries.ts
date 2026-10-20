import type { Entry } from '../data'

/**
 * Cross-reference genuinely related writing without a separate recommendation
 * service. Explicitly mentioned article titles take precedence over shared
 * keywords, followed by subject affinity; ties prefer newer entries.
 */
export function relatedEntriesFor(entry: Entry, library: readonly Entry[], limit = 2): Entry[] {
  if (limit <= 0) return []
  const prose = [entry.summary, ...(entry.intro ?? []), ...entry.sections.flatMap(section => section.paragraphs)].join(' ').toLocaleLowerCase()
  const keywords = new Set(entry.keywords.map(keyword => keyword.toLocaleLowerCase()))
  return library
    .filter(candidate => candidate.slug !== entry.slug)
    .map(candidate => {
      const titles = [candidate.title, candidate.shortTitle]
      const explicitlyReferenced = titles.some(title => title.length >= 12 && prose.includes(title.toLocaleLowerCase()))
      const sharedKeywords = candidate.keywords.filter(keyword => keywords.has(keyword.toLocaleLowerCase())).length
      return {
        candidate,
        score: (explicitlyReferenced ? 100 : 0) + sharedKeywords * 5 + (candidate.topic === entry.topic ? 8 : 0),
      }
    })
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date) || a.candidate.slug.localeCompare(b.candidate.slug))
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}