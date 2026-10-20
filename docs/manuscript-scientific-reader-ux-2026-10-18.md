# Scientific manuscript reader UX — journal integration

**Status:** source changes implemented and browser-tested locally at `http://localhost:11264/`, October 18, 2026. No commit or deployment.

## Product distinction

The journal retains its editorial reading template and `Article` / `article-toc` architecture. Formal research manuscripts remain academically structured scientific documents with source title-page metadata, author attribution, explicit revision status, chapter and subsection numbering, full equations and mathematical derivations, references, interactive figures, evidence qualifiers, and printing support. Research does **not** reuse blog article typography, article cards, episode labels, or the editorial section sequence.

Both modes share WebSeal-inspired shadcn zinc/New York interface geometry, navigation grammar, search, theme, centered application frame, and restrained borders.

## Resolved UX problems

1. **Mismatched contents UI:** `src/ResearchContents.tsx` now provides the existing journal's outline UI conventions: identical headings/counter, active location highlight, compact title/section progress and return control. Formal scientific nesting is preserved via expandable chapters. One active chapter opens at a time; user expansion is scoped to current chapter. Numbers represent scientific section identifiers; nonnumeric cover, abstract, references are distinguished. This avoids a fifty-row permanent outline.
2. **Optimized active tracking:** section anchor positions are cached and refreshed on resize/content-height changes. Scroll events schedule at most one `requestAnimationFrame`, with O(log N) binary search for the current visible anchor; no full DOM traversal per scroll event. `MutationObserver` is only active until lazy-loaded section anchors exist. Custom hash navigation supports back/forward and keeps scroll targets below sticky chrome.
3. **Mobile long-manuscript navigation:** a 46px sticky "Sections" select below the mobile header, showing current position and native keyboard/touch section selection, covers the complete 40-/51-section outline. The desktop side panel is suppressed at smaller widths instead of squeezing the scientific column.
4. **The numbering indentation defect:** removed copied thesis-specific `pl-9`/ `sm:pl-9` from chapter content sections. All heading and paragraph x-origin now match. Scientific numbering is in the left gutter on desktop, and on a separate line above heading text on mobile. This preserves hierarchy without shortening the readable line.
5. **Mobile logo centering:** the original `thelabjournal` mark and wordmark are centered against the entire viewport, independent of the left menu and right search/settings width. Verified no overlap at 320px.
6. **Academic masthead:** the manuscript TitlePage retains publication metadata, status, author details and full keywords, but is visually restrained, with a collapsible keyword index rather than dozens of badges. The scientific abstract is not editorialized or silently truncated.

## Modified / new files

- `src/ResearchContents.tsx`: accessible nested outline + mobile picker + active tracking
- `src/research-reading.css`: scoped scientific page treatment and mobile brand centering
- `src/App.tsx`: switches research pages to shared contents/navigation; no standalone site
- `src/manuscript-runtime/components/sections/{Abstract,TitlePage}.tsx`: structural scientific heading style + publication header
- `src/manuscript-runtime/data/papers/{gravimetric-decarboxylation/index,sublimation/sections/*}.tsx`: remove content indent and normalize heading wrappers
- `scripts/manuscript-reader-ux-audit.mjs`: browser geometry and interaction regression suite
- `scripts/research-integration-audit.mjs`: adapts previous integration test to collapsible scientific outline.

**Preservation:** no changes to the underlying equations, experimental claims, reference data, math formula inputs, or figure models; existing journal components and uncommitted parallel work left in place. Existing `src/research.css` remains as the prior integration layer and is complemented with specifically-scoped `src/research-reading.css`.

## Verification evidence

- TypeScript check passes.
- Manuscript reader Chromium audit passed **18/18** cases: both real manuscripts at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. Every case validates full manuscript mathematical rendering (148 / 136 DOM KaTeX elements), complete outline counts (51 / 40), zero horizontal overflow, journal's centered canvas, paragraph-to-heading x-origin parity, and runtime errors; mobile cases test logo centering, control separation, and native section selection; desktop cases test chapter expansion and subsection navigation.
- Journal research integration regression passed **3/3**: clickthrough, browser history, research search, and layout at 390, 1440, 1920px.
- Existing journal shell geometry audit passed **14/14** (seven viewports, archive + journal article).
- Direct targeted Chromium navigation test: clicking 1.1 Motivation and Scope produces `#introduction-motivation`, active row, `Section 04 of 40`, and scroll target at 80px below browser top; browser Back returns to the title.
- One earlier long suite coincided with an intermittent Vite dynamic-import connection interruption; a clean subsequent **18/18** audit passed. This is not counted as a persistent application defect.

## Remaining boundaries

- Full print/PDF visual-fidelity parity and WCAG screen-reader auditing have not been established by these DOM tests.
- The copied research renderer remains a pinned copy of the separate thesis-website source, requiring a future documented source-sync pipeline.
- Manuscript-specific static crawler HTML/OG and production deployment remain separate follow-ups.
