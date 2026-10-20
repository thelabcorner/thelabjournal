# Search Everywhere / Spotlight — implementation contract

## Product rationale

The old journal search displayed 16 full entries before a query, used a single
case-insensitive substring search on metadata and had no concept of manuscript
versus essay, importance, search history, or contextual preview.

The replacement is **editor-style retrieval**: a compact, keyboard-first
single-pane command palette with inline source context and reference metadata.
The permanent inspector was removed after visual verification showed that
navigation actions leave most of its real estate empty. The palette instead
prioritizes immediately actionable rows, follows the journal's zinc / New York
density and keeps document hierarchy distinct from decorative chrome.
No gradients, monospace UI type, eyebrow labels or oversized previews.

## Index contract

- Module: `src/lib/spotlightIndex.ts`; search and relevance logic is pure.
- Records are indexed once: journal titles, editorial summaries, reference
  numbers, topics, types, keywords, section headings, introductions and body
  paragraphs; manuscript titles, subtitles, abstracts, keywords, contents,
  versions and publication metadata; and four explicit navigation commands.
- Search normalizes diacritics, punctuation, Unicode dash variants, and
  subscript digits (CO₂ matches CO2). All unique query tokens must match.
- Relevance weights: exact title > title prefix > reference/keyword >
  section heading > summary > body text. This avoids burying direct matches
  beneath common incidental references. Fuzzy matching is bounded to one edit
  for substantive title/keyword tokens and never runs on long bodies.
- Results sort deterministically by score, then revision date, then identity.
  Index normalization is cached by immutable record identity via WeakMap;
  body text matches do not split long strings into word arrays.
- Empty queries present a **bounded discovery palette**, not the entire index:
  recently opened documents when known, explicit navigation commands and a few
  useful documents. Only actual opens populate recency.
- Recents are optional session-local UI state; no server writes, analytics,
  persistent cross-session tracking or fabricated 'recently visited' content.
- At most 80 results render at once; a message explains the limit. Future
  larger indexes should adopt group-aware virtualization only after measuring
  threshold and maintaining `aria-activedescendant` ownership.

## Interaction and semantics

- Input retains focus for up/down; selected option is exposed with combobox,
  listbox, option and `aria-activedescendant` semantics.
- Enter opens a selected document or executes an explicit navigation command.
  Mouse hover previews; clicking opens. Tabs switch scope and return focus
  to the search field. Escape, outside click and the close button dismiss.
- Keyboard selection moves only the results pane's scroll position; never
  scroll the background document. Scrolling uses rect-relative geometry so
  virtual/list wrappers cannot corrupt selection visibility.
- Modal mount/unmount restores focus to the original invoker. Background
  scrolling stays locked via the application's existing modal ownership.
- Scope filters: Everywhere, Writing, Manuscripts, Actions. Counts are real
  results for nonempty queries and real index totals for an empty query.
- Responsive: a bounded 694px desktop command surface, with safe-area-aware
  mobile behavior. No preview layout changes when a selection changes.
- Results use the reusable `ScrollView`: native wheel/touch/scroll semantics
  under a fully custom overlay thumb (no displayed browser scrollbars).
- Reduced-motion settings suppress transitions. All text and hit areas use
  the shared theme tokens, with real solid surfaces beneath controls.

## Measurement and verification

- Run `bun run audit:spotlight` for index relevance, deterministic result
  selection, category/empty states, keyboard scrolling, manuscript navigation,
  recents, mobile/desktop viewport geometry, global shortcut and commands.
- Run `bun run typecheck` and `bun run audit:shell` to protect compilation and
  the centered 1500px workspace.
- The research-manuscript search indexes verified metadata/abstracts, **not
  unseen complete thesis bodies**. Do not describe it as full-text manuscript
  retrieval until those sources are integrated and parsed.
- Existing content and research state are not mutated by a search until a
  result or navigation action is activated.