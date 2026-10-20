import { cn } from '../../utils/cn';
import { useReferenceMeta } from './ReferenceContext';

interface InlineCiteProps {
  refs: string[];
}

export function InlineCite({ refs }: InlineCiteProps) {
  return (
    <cite
      className={cn(
        'not-italic inline-flex items-center gap-0.5 align-super',
        'text-xs leading-none'
      )}
    >
      {refs.map((ref, i) => <CitationLink key={ref} id={ref} trailingComma={i < refs.length - 1} />)}
    </cite>
  );
}

function CitationLink({ id, trailingComma }: { id: string; trailingComma: boolean }) {
  const meta = useReferenceMeta(id);
  return (
    <span>
      <a
        href={`#ref-${id}`}
        className={cn(
          'text-[var(--accent)] hover:text-[var(--accent-hover)]',
          'transition-colors duration-150',
          'font-mono rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
        )}
        aria-label={`Reference: ${meta?.label ?? id}`}
        title={meta?.label ?? id}
      >
        [{meta?.number ?? '?'}]
      </a>
      {trailingComma && <span className="text-[var(--text-muted)]">,</span>}
    </span>
  );
}
