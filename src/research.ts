import { PAPER_DEFINITIONS } from './manuscript-runtime/data/papers'

export interface Manuscript {
  id: string
  title: string
  subtitle: string
  abstract: string
  field: string
  version: string
  status: 'Draft' | 'Under review' | 'Published'
  revisedAt: string
  readTime: number
  wordCount: number
  keywords: string[]
  contents: string[]
  source: string
}

/** Derive scholarly browse/search metadata from the same canonical registry
 * used by the reader and indexing pipeline. Editorial journals stay separate. */
export const manuscripts: Manuscript[] = PAPER_DEFINITIONS.filter(({ entry }) => entry.available).map(({ entry, navSections }) => ({
  id: entry.id,
  title: entry.metadata.title,
  subtitle: entry.metadata.subtitle ?? '',
  abstract: entry.abstract,
  field: entry.field,
  version: entry.metadata.version,
  status: entry.metadata.status === 'under-review' ? 'Under review' :
    entry.metadata.status === 'published' ? 'Published' : 'Draft',
  revisedAt: entry.lastModified,
  readTime: entry.readTime,
  wordCount: entry.wordCount,
  keywords: entry.metadata.keywords,
  contents: navSections.map(section => section.label),
  source: 'src/manuscript-runtime/data/papers/index.ts',
}))

const byId = new Map(manuscripts.map(paper => [paper.id, paper]))

export const manuscriptPath = (id: string) => `${import.meta.env.BASE_URL}research/${encodeURIComponent(id)}/`
export function manuscriptFromPath(path: string): Manuscript | null {
  const prefix = import.meta.env.BASE_URL + 'research/'
  if (!path.startsWith(prefix)) return null
  const tail = path.slice(prefix.length)
  const suffix = tail.endsWith('/') ? tail.slice(0,-1) : tail
  if (!suffix || suffix.includes('/')) return null
  try { return byId.get(decodeURIComponent(suffix)) ?? null } catch { return null }
}
