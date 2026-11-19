import type { ReactNode } from 'react';
import '../../../manuscript-editorial.css';
import { HeadingTextWithPermalink } from '../typography/HeadingPermalink';

interface AbstractProps {
  content?: string;
  children?: ReactNode;
  /** An accompanying scientific figure remains within the abstract section for PDF extraction. */
  after?: ReactNode;
}

/**
 * Shared scholarly abstract. One open editorial surface, no card chrome,
 * colored wash, inset box, or wrapped decorative edge.
 */
export function Abstract({ content, children, after }: AbstractProps) {
  return (
    <section id="abstract" aria-labelledby="abstract-heading" className="prose-heading research-editorial-abstract">
      <div className="research-editorial-abstract__surface">
        <div className="research-editorial-abstract__heading">
          <h2 id="abstract-heading" aria-label="Abstract" className="research-anchor-heading"><HeadingTextWithPermalink title="Abstract" fallbackId="abstract" /></h2>
        </div>
        <div className="research-editorial-abstract__body">
          {content ? <p>{content}</p> : children}
        </div>
      </div>
      {after}
    </section>
  );
}

export function SectionLabel({
  number,
  title,
  id,
}: {
  number: string;
  title: string;
  id?: string;
}) {
  return (
    <div className="research-section-label">
      {number !== '—' && (
        <span className="research-heading-number">
          {number}
        </span>
      )}
      <h2
        id={id}
        aria-label={title}
        className="research-anchor-heading text-base font-semibold text-[var(--text)] tracking-tight"
      >
        <HeadingTextWithPermalink title={title} fallbackId={id} />
      </h2>
    </div>
  );
}

export function SubsectionLabel({
  number,
  title,
  id,
}: {
  number: string;
  title: string;
  id?: string;
}) {
  return (
    <div className="research-section-label mt-6 mb-3">
      <span className="research-heading-number">
        {number}
      </span>
      <h3
        id={id}
        aria-label={title}
        className="research-anchor-heading text-sm font-semibold text-[var(--text-secondary)]"
      >
        <HeadingTextWithPermalink title={title} fallbackId={id} />
      </h3>
    </div>
  );
}
