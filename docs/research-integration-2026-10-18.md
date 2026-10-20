# Research integration into the existing journal

Status: local source integration, not deployed. Completed 2026-10-18.

## Canonical UI and scope
This is an extension of **`lab-journal-prototype` at `/`**, not a replacement homepage or independent design mockup. The application keeps its original journal masthead/brand mark, WebSeal-inspired New York/zinc tokens, animated dither, centered 1500px frame, scrollbar alignment, desktop rails, dense archive, Spotlight search, mobile navigation, preferences, and journal article reading.

- `/`: unchanged journal home composition, plus a small "Formal research" bridge to the manuscript library
- `/research/`: indexed full manuscripts with accurate source titles, status, versions, abstracts and dates
- `/research/gravimetric-decarboxylation-co2-progress/`: complete first scientific body
- `/research/low-temp-lyophilization-three-theses/`: complete second scientific body
- `/posts/:slug/`: existing journal entries unchanged; "Research notes" is an editorial topic, not the formal manuscript library.

All routes honor Vite's configured `BASE_URL`, including GitHub Pages `/thelabjournal/`. Browser history and local `Ctrl/Cmd + K` Spotlight cross-publication search are integrated.

## Scientific code provenance
`src/manuscript-runtime` contains an initial copy of the original specialized thesis rendering modules from adjacent `thesis-website/src` (React JSX, KaTeX, ECharts, reference components, numerical widgets, both manuscript bodies and nav trees). Aliased internal imports were localized; journal global application chrome, theme providers and routing **were not copied**.

`src/research.ts` derives listing data directly from these copied `PaperEntry` modules instead of manually maintaining separate abstracts or statuses. `src/ResearchManuscriptBody.tsx` lazy-loads only the selected heavy manuscript and its supporting scientific renderer; the ordinary journal does not load these entire bodies by default.

**Sync contract:** these files are now a source snapshot in the journal repository. Future scientific changes to the sibling `thesis-website` must be intentionally ported to `src/manuscript-runtime` and validated. This is not yet an automated two-repository sync. A future move to one canonical manuscript source or publication build step should resolve this drift hazard.

"Under review" is sourced verbatim from manuscript metadata; it does *not* assert independent peer review. No invented DOI or publication claims are added.

## Reproduction/verification
From `lab-journal-prototype` while Vite is running at `http://127.0.0.1:11264/`:

```powershell
bunx tsc --noEmit
bun scripts/research-integration-audit.mjs
$env:JOURNAL_ORIGIN='http://127.0.0.1:11264/'; bun scripts/shell-alignment-audit.mjs
bun scripts/chrome-audit.mjs
$env:GITHUB_PAGES='true'; bun run build
```

Results for the 2026-10-18 integration:
- TypeScript passed.
- Research integration audit passed in Chromium at 390, 1440 and 1920px. Checks root journal identity, research bridge/list, full lyophilization math, references and section TOC, history, Spotlight search, no console/page exceptions or horizontal overflow.
- Both actual manuscript bodies rendered on 390 and 1440px: decarboxylation showed 148 KaTeX instances and 12 prose sections; lyophilization showed 136 KaTeX instances, 40 sections and 18 reference entries. These are observed DOM counts, **not** comprehensive visual or scientific fidelity validation.
- Existing shell-alignment audit passed 14/14 width/page combinations through 2560px.
- Existing Chrome interaction audit passed desktop/mobile scenarios and reduced-motion case.
- GitHub Pages-mode production build passed: Vite, generated 16 journal article pages, PWA, and article OG audit.
- Existing Vite warning for generated JavaScript chunks above 500kB remains; scientific chart and equation performance profiling, complete print QA, browser-accessibility review and production static manuscript metadata must precede public cutover.

## Important constraints
- Do not alter the journal's centered frame, sidebar WIP or dither for a separate "unified website."
- Do not import thesis global `:root`/slate/indigo CSS or its own `App`, `TopBar`, theme provider, routing, or sidebar.
- Retain status/evidence boundaries, local saved entries, reading settings, existing journal article URLs and production metadata pipeline.
- The older standalone `unified-prototype.html` experiment was removed after the owner clarified the integration must live at the existing journal root.
- No commit or deployment was made as part of this pass.

## Follow-up engineering priorities
1. Generate crawler-readable `/research/:slug/` manuscript HTML with canonical/OG metadata, aligned with existing article publishing. Verify the actual hosting base path and historical `?paper=id#anchor` redirects on the intended public domain.
2. Make scientific source migration reproducible (automated upstream parity and dependency checks) rather than maintaining duplicated source trees.
3. Add screenshot/PDF visual diff, print fidelity, math accessibility, ECharts interaction, navigation-to-anchor/scroll restoration and keyboard/screen-reader audits for both full-length manuscripts in light and dark.
4. Profile the cold journal route, metadata index, first-open heavy scientific bundle and figure interactivity separately, then reduce initial JavaScript while preserving the original journal experience.
