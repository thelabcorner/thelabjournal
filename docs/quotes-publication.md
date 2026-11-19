# Quotes publication contract

Quotes is the third independent editorial surface in thelabjournal™, alongside **Journal** and **Manuscripts**. It holds original statements and passages curated from other authors. A quote is not a journal essay or a scientific manuscript; it never inherits Google Scholar metadata or scientific publication status.

## Interpretation belongs to the reader

Quotations stand on their own. Do not append curation notes, explanations, personal interpretations, or commentary to quote cards, reading pages, source metadata, search results, static excerpts, or social previews. The exact wording and honest attribution are sufficient; a reader should be free to draw their own conclusions. Source information is limited to verifiable attribution, publication/translation information, and verification status. Keep thematic collections for navigation, not as interpretive notes for individual quotations.

## Canonical sources and authorship

All published quote content lives in `src/quotes/data.ts`. There is no new CMS, database, login, remote API or read-time fetch. Add an author once to `quoteAuthors`, then write individual quotes in `quoteRegistry`, and optionally collect them in `quoteCollectionRegistry`.

Each quote has a stable, lowercase hyphenated ID, exact original text, author ID, `addedAt`, publication status, and themes. Optional fields include `recordedAt` (not the same as `addedAt`), source provenance, and related work. Original versus collected is derived only from `authorId === OWN_AUTHOR_ID`.

External quotations marked `published` require a source record; include the best authentic citation location available (work, URL, chapter/page/section), and a verification level: `primary`, `secondary`, or `unverified`. Render the true verification label without manufacturing certainty. Preserve original text, punctuation, and attribution; represent modifications transparently. Do not manufacture dates, book titles, authors, or quotations to make the archive appear full.

Collections have independent stable IDs, a title, optional editorial description, and ordered `quoteIds`. Multiple collections may reference the same quotation. A published collection cannot include a draft quote. Never duplicate the quotation text to put it in two collections.

The registries were initially empty and were seeded on 2026-10-24 with authentic recovered quotations selected from the author's own conversation history. Drafts remain excluded from public routes, search, sitemap, static pages, cards, and collections.

### Editorial seed and provenance (2026-10-24)

Five original statements are transcribed as spoken/written, preserving casing, punctuation and conversational wording, from user-authored messages dated **2024-12-20**, **2026-05-11**, **2026-05-30**, **2026-10-17**, and **2026-10-23**. Their `recordedAt` field is the original conversation date; `addedAt` is 2026-10-24. These quotations are not normalized into polished aphorisms or represented as formal publications.

One collected quotation is from Lance Priebe's own [Club Penguin origin story](https://rocketsnail.com/games/club-penguin/), section "300 Million Players". The author explicitly listed this passage among their **favorite quotations on 2026-04-16**. Its author and original article URL were independently cross-checked on 2026-10-24. The documented selection belongs in the archival record, without fabricating an endorsement.

Two deliberately ordered collections cross-reference these six quote records. These collections are organizational editorial metadata, not standalone user-authored essays. Future changes to the exact words or personal interpretations should be explicitly directed by the author; do not allow assistants to silently paraphrase and republish their statements.

### Expanded originals (2026-11-18)

An additional **25 original quotations** were selected from firsthand material: **14 author-written Facebook posts** recovered from the user's own scrolling session, and **11 original user prompts/reflections** from prior ChatGPT conversations. Two additional **collected** quotations were independently checked against a source publication or bibliographic review (Ralph Waldo Emerson's original wording in *Social Aims*, rather than the circulated paraphrase, and a short line from Fernando Pessoa's *Book of Disquiet*). The archive now holds **59 quotations** across **eight collections**. Facebook post captions were checked against the recovered text; ChatGPT passages were selected only where the wording was attributed directly to the user's own messages. No model-authored reformulations were promoted to original quotations.

**Eight of these author-written posts were originally marked “Only me.”** The author explicitly approved their selective public inclusion in the journal on November 18, 2026. Their original Facebook audience setting must not be treated as a permanent embargo, but the approval is limited to the selected statements, not permission to publish other private posts or their surrounding comments. The publication registry intentionally contains no Facebook URLs, profile links, post IDs, audience markers, or names of commenters. A detailed provenance ledger is held only in locally ignored `artifacts/quotes-expansion-provenance.json`; do not bundle or publish that file.

The recovered Facebook posts did not establish reliable original posting dates, so their `addedAt` identifies journal ingestion rather than an invented creation date. Only the prior-conversation statements carry `recordedAt` dates. Interpretations remain with readers: there are no curation notes.

## Routes and discovery

- `/quotes/` — library: All quotes, My words, Collected, Collections, search, and themes
- `/quotes/{id}/` — quote reading page, exact text, author, provenance, copy/share, themes, references and collections
- `/quotes/collections/{id}/` — ordered editorial collection
- Global Spotlight: dedicated Quotes scope, quote text, author and source search, and quote/collection navigation.
- Canonical share/SEO host: `https://journal.thedabcorner.site/`. Do not reinstate a GitHub Pages mirror.

In all three areas, standard browser history, keyboard, native open-in-new-tab/middle-click, viewport scaling, light/dark theme, screen-reader landmarks, and shared shell geometry are preserved.

## Publishing and verification

`bun run build` runs the existing article/manuscript pipelines and `scripts/quote-pages.mjs generate|audit`. The quote generator writes build-only HTML with route-specific title, canonical and social metadata, a no-JavaScript fallback, and deterministic Inter/zinc Satori+Resvg Open Graph imagery for real published quotation pages. It does not produce `citation_*` Scholar tags. The sitemap generator indexes the library, published quotes and published collections. Published quote HTML and social cards are excluded from offline PWA precaching; index fallback handles application navigation.

Commands:

```sh
bun scripts/quote-feature-audit.mjs
bun run typecheck
bun run build
bun run audit:quotes
bun run audit:quotes:browser # requires localhost preview on 11265, Chrome
bun run audit:spotlight
bun run audit:shell
```

For new entries, check exact text and attribution manually against original source materials before changing `status` to `published`. The tests validate structural integrity, not historical authenticity.

## Visual and engineering principles

The Quotes refinement controls are a compact, inline editorial rail, not a boxed settings form. Never use visible browser-native select dropdowns or four equal-width input blocks here. Each facet is a compact, accessible Radix Select with popper-positioned content, a bounded scrolling list, selection checkmarks, keyboard typeahead, Escape/focus restoration, and quiet active-state indication. The theme selector has many options, so keep its menu short enough to avoid covering the entire page and communicate typeahead. Mobile controls wrap without causing horizontal overflow. Avoid tinted hover slabs on quote rows or filter surfaces; functional focus and selection states remain explicit.

The inherited zinc / Inter / New York editorial system is authoritative. Use deliberate typography, hairline rules, 4px grid rhythm, compact controls, restrained copy, solid light/dark surfaces and existing global navigation. No serif or monospace quote typography, generic motivational posters, gradients, carousel roulette, made-up engagement counters, new design tokens/frameworks, ornamental science imagery, or unrequested reorganization of Journal/Manuscripts. Keep changes scoped, reversible and attributable to this feature.

In the quotation archive, hovering over a reading row must **not** introduce a full-row background fill or highlight slab. Preserve the uninterrupted editorial canvas; limit mouse hover feedback to the small "Read entry" affordance. Keep accessible keyboard focus outlines.

### NCM editorial composition / November 2026

The Quotes archive inherits the broader NCM (Nostalgic Computational Modernism) doctrine: **global editorial order with local expressive computation**, never interchangeable SaaS cards or staged technical decoration. Apply this with intentional typographic scale contrast, asymmetric but disciplined composition, exposed paper-like negative space, authentic metadata, and a computational specimen confined to the introduction rather than to every quotation.

The full-width **Thought atlas** is derived solely from the published quote registry: exactly one node per quote, with an edge only where two entries share an explicit archived theme. Edge weights favor rare shared tags and a bounded spanning forest keeps the structure readable. Its positions are reproducibly computed once, not recalculated every animation frame, and must **never** be represented as measured semantic distance. The diagram forms **one connected spatial field**, not six separate decorative clusters or an edge-clamped rectangle. Filled points identify original statements; hollow points identify collected passages. A deterministic Bayer ordered-dither field is stamped along real nodes and edges: no blurred shadows, fake noise, raster screenshots, or ornamental gradients. A handful of faint signals animate along real links, paused outside the viewport and disabled for reduced motion. Node hover, arrow-key focus and opening a quotation remain operable, with a descriptive text alternative.

The reading mosaic uses a composed 12-column spread. A short quotation can receive occasional restrained full-span treatment; long passages must not dominate the grid. Within each archive-date group, long excerpts are distributed among shorter ones, and mosaic previews are clamped to five or six lines with an explicit full-reading affordance. **Canonical quotation text is never truncated, paraphrased, or rewritten**: the individual reader shows the complete original; the compact Index remains a separate rapid-scanning mode. Explicit collection ordering and author-alphabetic ordering are not reshuffled. Preserve attribution, accessible controls, keyboard focus, responsive single-column reading, and the no-interpretive-notes contract.

### Personal commonplace-book interface (2026-11-18)

Quotes is a record of the author's own words and passages the author has deliberately collected. It should let people explore that intellectual archive rather than behave like a public quotes network. Visual references may inform the implementation but do not justify transplanting the interaction patterns, branding, popularity scores, recommended feeds, or promotional mechanics of external quote websites.

- Reading layout is the default: a numbered, typographic folio with unbroken quotation text, a quiet distinction between original and collected words, and restrained attribution. A compact **Index layout** is available for faster scanning; it never alters the canonical quotation text.
- Four navigational scopes (**All quotes**, **My words**, **Collected**, and **Collections**) remain explicit. Search, filter disclosure, sort order, provenance, and theme navigation are functional and keyboard operable. A filtered result count reports what is visible rather than implying engagement metrics.
- Collections are topical paths through the same record, not standalone quote posts. A collection view retains deliberate editorial ordering, and a quote reader offers previous/next navigation through the archive.
- Quote details carry minimal, honest recordkeeping: recorded date when known, archival date, author, verifiable source, and optional theme links. No interpretation, curation note, simulated intellectual commentary, or generic inspirational copy is displayed or indexed.
- Visual architecture: modest page title, flat zinc surfaces, 1px separators, crisp underlined selected tabs, editorial two-column folio geometry, appropriately scaled text, and measured whitespace. Respect the journal's existing shell, native scrolling, light/dark palette, touch targets, reduced-motion behavior, and accessible focus styling.

### Additional originals selected 2026-10-24

Fourteen additional verbatim passages were selected from the author's dated conversation records, ranging from 2023-04-26 to 2026-10-24. The quotation text retains the original wording and conversational casing. Older statements were retrieved as quoted extracts from conversation summaries, rather than checked against full primary transcripts; those excerpts should be cross-checked before reuse as certified archival transcriptions. Longer Plato/cave exchanges are deliberately preserved without smoothing their spoken/written language. Two further collections, `On sharing understanding` and `On systems and agency`, organize the same canonical quote records without copying content.
