import { useEffect } from 'react';
import type { PaperDefinition } from '../../../types/thesis.ts';
import { TitlePage } from '../../../components/sections/TitlePage';
import { FullAbstract } from './FullAbstract';
import '../../../../lyophilization-manuscript-presentation.css';
import { ReferenceProvider } from '../../../components/prose/ReferenceContext';
import { ConclusionSection } from './sections/ConclusionSection';
import { DiscussionSection } from './sections/DiscussionSection';
import { IntroductionSection } from './sections/IntroductionSection';
import { LiteratureReviewSection } from './sections/LiteratureReviewSection';
import { MethodologySection } from './sections/MethodologySection';
import { ReferencesSection } from './sections/ReferencesSection';
import { ResultsSection } from './sections/ResultsSection';
import { sublimationNavSections, sublimationSectionIds } from './nav';
import { sublimationReferences } from './references';
import { sublimationEntry as entry } from './entry';

export function PaperBody({ isDark }: { isDark: boolean }) {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <ReferenceProvider references={sublimationReferences}>
      <div className="lyo-paper">
      <TitlePage metadata={entry.metadata} />
      <FullAbstract />
      <ResearchIntegrityNotice />
      <IntroductionSection />
      <LiteratureReviewSection />
      <MethodologySection />
      <ResultsSection isDark={isDark} />
      <DiscussionSection />
      <ConclusionSection />
      <div className="border-t border-[var(--border)] pt-8">
        <ReferencesSection />
      </div>
      </div>
    </ReferenceProvider>
  );
}

function ResearchIntegrityNotice() {
  return (
    <aside aria-label="AI-assisted research disclosure" className="mb-8">
      <details className="group rounded-lg border border-[var(--border)] bg-[var(--sidenote-bg)]">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg px-4 py-3 transition-colors duration-150 hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              AI-Assisted Research Disclosure
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Material AI assistance was used. Outputs are treated as provisional until independently checked.
            </p>
          </div>
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-open:rotate-90" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="border-t border-[var(--border)] px-4 py-3">
          <p className="text-sm leading-relaxed text-[var(--text)]">
            This research was materially assisted by artificial-intelligence systems during literature exploration, mathematical
            derivation, software development, numerical analysis, error checking, and manuscript editing. AI systems are prone to
            hallucination, source misinterpretation, coding mistakes, and mathematically plausible but incorrect reasoning. Their
            output is therefore treated as provisional unless independently checked against primary sources, explicit derivations,
            executable tests, or experimental evidence. Passing symbolic, numerical, or software validation establishes internal
            consistency only; it does not establish physical truth or experimental validity. Readers should independently verify
            equations, citations, hardware assumptions, numerical results, and safety-critical conclusions before relying on this
            work for equipment modification, process design, or scientific inference. Final responsibility for the claims and
            interpretations in this manuscript remains with the author.
          </p>
        </div>
      </details>
    </aside>
  );
}

export const sublimationPaperDefinition: PaperDefinition = {
  entry,
  navSections: sublimationNavSections,
  sectionIds: sublimationSectionIds,
  PaperBody,
};
