import { Suspense } from 'react'
import { JournalLoadingState } from './components/JournalLoadingState'
import { PAPER_DEFINITIONS, getPaperById } from './manuscript-runtime/data/papers'
import type { NavSection } from './manuscript-runtime/types/thesis'

/** One canonical registry owns the reader components and table of contents. */
export const manuscriptNavigation: Record<string, NavSection[]> = Object.fromEntries(
  PAPER_DEFINITIONS.map(({ entry, navSections }) => [entry.id, navSections])
)

export function ResearchManuscriptBody({ paperId, isDark }: { paperId: string, isDark: boolean }) {
  const Paper = getPaperById(paperId)?.PaperBody
  if (!Paper) return <p role="status">This manuscript is not available.</p>
  return <Suspense fallback={<JournalLoadingState label="Preparing manuscript…" variant="section" />}>
    <Paper isDark={isDark} />
  </Suspense>
}
