// The geometry contract lives in the browser audit so the article and
// the five responsive figures are tested together. Keep the original
// layout-audit entrypoint for scripts that call it independently.
process.env.JOURNAL_ORIGIN ??= 'http://127.0.0.1:11267/'
await import('./oxp-architecture-audit.mjs')
