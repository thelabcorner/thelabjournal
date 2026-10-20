import type React from 'react';
import type { ThesisMetadata } from '../../types/thesis';

interface TitlePageProps {
  metadata: ThesisMetadata;
}

export function TitlePage({ metadata }: TitlePageProps) {
  return (
    <section
      id="title"
      aria-labelledby="title-heading"
      className="prose-heading border-b border-[var(--border)] pb-10 mb-10"
    >
      {/* Independent authorship, with research focus rather than institutional credentials. */}
      <div className="research-masthead-badges flex flex-wrap items-center gap-2 mb-6">
        <span className="research-badge research-badge--research inline-flex items-center bg-[var(--latex-badge-bg)] border border-[var(--latex-badge-border)] text-[var(--latex-badge-label)] rounded-md px-2 py-0.5 text-xs font-medium">
          Independent applied research
        </span>
        {metadata.researchArea && (
          <span className="research-badge inline-flex items-center bg-[var(--badge-bg)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md px-2 py-0.5 text-xs font-medium">
            {metadata.researchArea}
          </span>
        )}
      </div>

      <div className="research-publication-line">
        <span>Research manuscript</span>
        <span>{metadata.status === 'under-review' ? 'Under review' : metadata.status === 'published' ? 'Published' : 'Draft'}</span>
      </div>

      {/* Title */}
      <h1
        id="title-heading"
        className="text-2xl font-semibold tracking-tight text-[var(--text)] leading-snug mb-3"
      >
        {metadata.title}
      </h1>

      {/* Subtitle */}
      {metadata.subtitle && (
        <p className="text-base text-[var(--text-secondary)] mb-6 leading-relaxed">
          {metadata.subtitle}
        </p>
      )}

      {/* Authors */}
      <div className="flex flex-wrap gap-4 mb-6">
        {metadata.authors.map((author, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-[var(--text)]">{author.name}</span>
            {author.role && <span className="text-xs text-[var(--text-muted)]">{author.role}</span>}
            <a
              href={`mailto:${author.email}`}
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150"
            >
              {author.email}
            </a>
            {author.orcid && (
              <a
                href={`https://orcid.org/${author.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-150"
                aria-label={`ORCID: ${author.orcid}`}
              >
                <span className="font-mono">ORCID</span>
                <span className="font-mono tabular-nums">{author.orcid}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <MetaItem label={metadata.publicationYear ? 'Research period' : 'Year'} value={metadata.year} />
        {metadata.publicationYear && <MetaItem label="Manuscript" value={metadata.publicationYear} />}
        {metadata.doi && (
          <MetaItem
            label="DOI"
            value={
              <a
                href={`https://doi.org/${metadata.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150"
              >
                {metadata.doi}
              </a>
            }
          />
        )}
        <MetaItem label="Version" value={<span className="font-mono text-xs text-[var(--text-secondary)]">{metadata.version}</span>} />
      </div>

      {/* Scientific indexing terms remain accessible without making the title page a badge wall. */}
      <details className="research-keywords">
        <summary>Keywords <span>{metadata.keywords.length} indexed terms</span></summary>
        <div className="research-keyword-list">
          {metadata.keywords.map(kw => <span key={kw}>{kw}</span>)}
        </div>
      </details>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
      <span className="text-xs text-[var(--text-secondary)]">
        {typeof value === 'string' ? value : value}
      </span>
    </div>
  );
}
