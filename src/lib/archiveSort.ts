import { topics, type Entry } from '../data'

export type ArchiveSort = 'subject' | 'recent' | 'short' | 'long'

// Keep the subject order consistent with the journal's navigation taxonomy.
const subjectRank = new Map(topics.map((topic, index) => [topic, index]))

export function compareArchiveEntries(a: Entry, b: Entry, sort: ArchiveSort): number {
  const bySubject = (subjectRank.get(a.topic) ?? Infinity) - (subjectRank.get(b.topic) ?? Infinity)
  const byDate = b.date.localeCompare(a.date)
  const byLength = a.minutes - b.minutes

  if (sort === 'subject') return bySubject || byDate || a.issue.localeCompare(b.issue) || a.slug.localeCompare(b.slug)
  if (sort === 'short') return byLength || byDate || bySubject || a.issue.localeCompare(b.issue)
  if (sort === 'long') return -byLength || byDate || bySubject || a.issue.localeCompare(b.issue)
  return byDate || bySubject || a.issue.localeCompare(b.issue) || a.slug.localeCompare(b.slug)
}