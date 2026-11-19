# Manuscript structural heading and caption contract

**Scope:** thelabjournal formal manuscripts (freeze-drying, gravimetric decarboxylation, THCA-A/limonene); November 18, 2026.

This implements the existing NCM editorial rules in
`docs/unified-research-journal-design-2026-10-18.md`: high-density zinc
publication UI, sentence case, restrained metadata, stable manuscript reading
alignment, and no ornamental typography or generic dashboard patterns.

## Scientific figure headers

Use `ScientificFigureCaption` from
`src/manuscript-runtime/components/typography/ScientificFigureCaption.tsx`
for a scientific figure's **title + supporting description**. The component
supplies an actual two-row CSS grid, a 4px gap, a sentence-case title, and
smaller neutral supporting text. Do not use adjacent anonymous inline
`<span>`s, vertical margins on inline spans, or a right-justified
metadata label that compresses the title.

The figure itself owns its scientific content. The component does not move
captions away from the figure, replace its illustration, introduce colored
accents, or change source claims. Equation captions, figure labels that are
part of a plotted SVG, and THCA's existing numbered prose figure captions
are different semantic structures and remain outside this migration.

Do not reintroduce manuscript-specific `figcaption span:first-child` /
`:nth-child(2)` overrides: they previously caused an 8px effective gap and
could concatenate unrelated title/detail phrases when spans were inline.

## Chapters and subsections

The reusable `ChapterLabel` in
`src/manuscript-runtime/components/sections/ChapterLabel.tsx` is the source of
truth for the freeze-drying manuscript's numbered chapter headings
(`1`–`6`, and `Ref`). It leaves the original title, heading ID, and
section semantics intact.

Desktop and tablet place the chapter number in a **zero-width gutter grid
column** and the title in the original prose column. They share an actual
CSS baseline; chapter top padding is no longer an input to a brittle
absolute `top` calculation. On narrower tablets, the pre-existing
26px gutter is preserved. On phones, the existing stacked number/title
presentation remains left aligned. In print, chapter labels become inline
number/title pairs.

`SubsectionLabel` and `SectionLabel` retain their independently aligned
positioning, numbering, heading levels, anchors, and screen-reader semantics.
In particular, the correct desktop `5.1` positioning is not changed merely
to correct the formerly 13.13px-too-high chapter `5`.

No per-chapter number or heading offsets are allowed. If a new chapter is
added, reuse `ChapterLabel` rather than cloning markup or introducing a
new exception.

## Regression checks

From the repository root, run:

```bash
bun run typecheck
node scripts/manuscript-heading-caption-audit.mjs
```

The browser audit covers 320, 390, 768, and 1440 CSS pixels, both light
and dark themes, all three manuscripts, and browser print presentation.
It checks all nine migrated two-part captions, preserves the custom
freeze-drying process-loop caption and THCA's separate style, validates
all seven freeze-drying chapters, checks chapter `5` against subsection
`5.1`, confirms accessible heading targets, and catches document overflow.
It also writes visual evidence to `artifacts/manuscript-heading-caption-qa/`.

For production CSS chunk and import-order confidence, run the same audit
against `vite preview` via `JOURNAL_TEST_ORIGIN`. Do not treat a
development-only browser pass as proof of production behavior.

## Hover-to-copy permalinks

All anchored manuscript headings use `HeadingTextWithPermalink` and
`HeadingPermalink` from `src/manuscript-runtime/components/typography/`.
Title page, abstract, chapters, subsections, and the two identified
standalone anchored scientific-figure headings share the same behavior.

- The button uses a quiet Lucide link glyph, neutral zinc color, 4px corners,
  no decorative rail or background, and no persistent desktop chrome. It
  appears on heading hover or keyboard focus and remains subtly visible
  on touch-only devices.
- The last word of the heading and the icon form a single nowrap inline run.
  This prevents an isolated glyph on 320–390px phones without adding a
  new line, paragraph padding, or chapter/subsection-number offset.
- A hover or focus affordance is a **button**, not an automatic navigation.
  Clicking/pressing Enter copies the absolute current manuscript URL with
  its hash replaced by the existing TOC-owned section ID. For standalone
  anchored figure headings, explicit `targetId` identifies their existing
  heading ID.
- Copying never pushes history, changes the current hash, or moves the
  reader's scroll position. When the copied link is opened, the shared
  `useResearchOutline` router aligns any valid in-manuscript hash target to
  the reader's existing sticky-header offset. Its existing ResizeObserver
  briefly maintains alignment while lazy figures/fonts settle, and stops
  on user input or after 2.5s; there are no per-heading observers.
  Clipboard success (checkmark) is reported only
  after the native API succeeds or the legacy selection fallback succeeds.
  Actual failures render a muted X and an accessible failure announcement.
  Both states reset after 1.8s.
- Heading accessible names are explicitly set to the original heading text,
  avoiding a copy button's accessible label contaminating the document
  outline. Button accessibility names and a live status announce results.
- The button is excluded from browser print and the dedicated scholarly PDF
  publication surface. Title/section IDs, text and TOC semantics are stable.

Regression: `bun run audit:manuscript-anchors`. The suite verifies links
across all three manuscripts; the canonical fragment, actual clipboard
contents, touch/hover/keyboard/fallback/error states, no wrap-orphaned
glyphs, unchanged browser history/scroll, clean-context deep linking, dark
and light themes, and print exclusion. Run again against `vite preview`
after a production build. Screenshot evidence is written under
`artifacts/manuscript-anchor-links-qa/`.

**Ownership boundary:** no scientific source claims, data, figures,
navigation identities, PDF contents structure, unrelated journal chrome,
or deployment operations are part of this typographic contract.
