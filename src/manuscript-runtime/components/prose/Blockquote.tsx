interface BlockquoteProps {
  text: string;
  attribution?: string;
}

export function Blockquote({ text, attribution }: BlockquoteProps) {
  return (
    <figure className="my-4">
      <blockquote
        className="border-l-2 border-[var(--blockquote-border)] bg-[var(--blockquote-bg)] rounded-r-md pl-4 pr-3 py-3"
      >
        <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">"{text}"</p>
      </blockquote>
      {attribution && (
        <figcaption className="mt-1.5 pl-4 text-xs text-[var(--text-muted)]">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
