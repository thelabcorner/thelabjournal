import { gravimetricDecarboxylationEntry } from './manuscript-runtime/data/papers/gravimetric-decarboxylation/entry'
import { sublimationEntry } from './manuscript-runtime/data/papers/sublimation/entry'
import { gravimetricDecarboxylationNavSections } from './manuscript-runtime/data/papers/gravimetric-decarboxylation/nav'
import { sublimationNavSections } from './manuscript-runtime/data/papers/sublimation/nav'
import type { PaperEntry, NavSection } from './manuscript-runtime/types/thesis'

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

type Source = { entry: PaperEntry; nav: NavSection[]; source: string }
const definitions: Source[] = [
  {
    entry: gravimetricDecarboxylationEntry,
    nav: gravimetricDecarboxylationNavSections,
    source: 'thesis-website/src/data/papers/gravimetric-decarboxylation/entry.ts',
  },
  {
    entry: sublimationEntry,
    nav: sublimationNavSections,
    source: 'thesis-website/src/data/papers/sublimation/entry.ts',
  },
]

/** Derive index/search metadata from the SAME source modules used by the
 * scientific document body. No separately maintained abstract or title copies. */
export const manuscripts: Manuscript[] = definitions.map(({ entry, nav, source }) => ({
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
  contents: nav.map(section => section.label),
  source,
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
