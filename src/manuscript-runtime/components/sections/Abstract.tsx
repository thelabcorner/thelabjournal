interface AbstractProps {
  content: string;
}

export function Abstract({ content }: AbstractProps) {
  return (
    <section
      id="abstract"
      aria-labelledby="abstract-heading"
      className="prose-heading mb-10"
    >
      <SectionLabel number="—" title="Abstract" id="abstract-heading" />

      <div className="bg-[var(--sidenote-bg)] border border-[var(--border)] rounded-lg p-4 mt-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">{content}</p>
      </div>
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
        className={`text-base font-semibold text-[var(--text)] tracking-tight ${number === '—' ? '' : ''}`}
      >
        {title}
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
        className="text-sm font-semibold text-[var(--text-secondary)]"
      >
        {title}
      </h3>
    </div>
  );
}
