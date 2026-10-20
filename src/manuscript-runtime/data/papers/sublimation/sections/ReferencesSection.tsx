import { sublimationReferences } from '../references';

export function ReferencesSection() {
  return (
    <section id="references" aria-labelledby="references-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">Ref</span>
        <h2 id="references-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">References</h2>
      </div>

      <div className="research-section-content">
        <div className="space-y-3" role="group" aria-label="Bibliography">
          {sublimationReferences.map((ref, i) => (
            <div key={ref.id} id={`ref-${ref.id}`} className="reference-entry flex gap-3 group rounded-md -mx-2 px-2 py-1">
              <span className="shrink-0 text-xs font-mono tabular-nums text-[var(--text-muted)] w-5 text-right mt-0.5">[{i + 1}]</span>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                <span className="font-medium">{ref.authors}</span> ({ref.year}).{' '}
                {ref.url ? (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2">
                    {ref.title}
                  </a>
                ) : (
                  <em>{ref.title}</em>
                )}
                . <span className="text-[var(--text-secondary)]">{ref.venue}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
