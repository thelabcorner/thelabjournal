import { Suspense, lazy } from 'react'
import { sublimationNavSections } from './manuscript-runtime/data/papers/sublimation/nav'
import { gravimetricDecarboxylationNavSections } from './manuscript-runtime/data/papers/gravimetric-decarboxylation/nav'
import type { NavSection } from './manuscript-runtime/types/thesis'

const GravimetricPaper = lazy(() => import('./manuscript-runtime/data/papers/gravimetric-decarboxylation/index').then(module => ({ default: module.PaperBody })))
const SublimationPaper = lazy(() => import('./manuscript-runtime/data/papers/sublimation/index').then(module => ({ default: module.PaperBody })))

export const manuscriptNavigation: Record<string, NavSection[]> = {
  'gravimetric-decarboxylation-co2-progress': gravimetricDecarboxylationNavSections,
  'low-temp-lyophilization-three-theses': sublimationNavSections,
}

export function ResearchManuscriptBody({ paperId, isDark }: { paperId: string, isDark: boolean }) {
  const Paper = paperId === 'gravimetric-decarboxylation-co2-progress'
    ? GravimetricPaper
    : paperId === 'low-temp-lyophilization-three-theses' ? SublimationPaper : null
  if (!Paper) return <p role="status">This manuscript is not available.</p>
  return <Suspense fallback={<div role="status" className="research-body-loading">Preparing manuscript, mathematics and figures…</div>}>
    <Paper isDark={isDark} />
  </Suspense>
}
