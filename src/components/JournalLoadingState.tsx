/**
 * The journal's shared loading language for deferred pages and document bodies.
 * CSS-only Bayer dithering: no canvas, timers, layout movement, or fake progress.
 */
const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const

type JournalLoadingStateProps = {
  label: string
  variant?: 'page' | 'section' | 'inline'
}

export function JournalLoadingState({ label, variant = 'page' }: JournalLoadingStateProps) {
  const content = <div className="journal-loading__content" role="status" aria-live="polite">
    <span className="journal-loading__dither" aria-hidden="true">
      {BAYER_4X4.map((threshold, index) =>
        <span key={index} className="journal-loading__dot" style={{ animationDelay: `${-threshold * 105}ms` }} />
      )}
    </span>
    <span className="journal-loading__label">{label}</span>
  </div>

  if (variant === 'page') {
    return <main id="main" className="content-main journal-loading journal-loading--page">{content}</main>
  }

  return <div className={`journal-loading journal-loading--${variant}`}>{content}</div>
}