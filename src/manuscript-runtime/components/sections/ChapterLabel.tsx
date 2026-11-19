import { HeadingTextWithPermalink } from '../typography/HeadingPermalink';

interface ChapterLabelProps {
  number: string;
  title: string;
  id: string;
}

/**
 * Shared numbered manuscript chapter heading.
 * A zero-width gutter in research-reading.css aligns the chapter number with
 * the h2 baseline without displacing the prose. Subsections have independent
 * rendering and are intentionally not styled through this component.
 */
export function ChapterLabel({ number, title, id }: ChapterLabelProps) {
  return (
    <div className="research-chapter-label mb-4">
      <span className="research-heading-number">{number}</span>
      <h2 id={id} aria-label={title} className="research-anchor-heading text-base font-semibold text-[var(--text)] tracking-tight">
        <HeadingTextWithPermalink title={title} fallbackId={id} />
      </h2>
    </div>
  );
}
