# Editorial source notes: I started with HTML to PDF

Written 2026-10-12 as Journal 004. This file records factual provenance and claims that should remain bounded; it is not part of the published essay.

- Earlier Journal 001, 002, 003 voice and structure: `src/first-post.ts`, `src/agent-tools-post.ts`, `src/problem-scope-post.ts`.
- Silica canonical V2 prototype: `forgeprint-v2`, branch `feat/v2-greenfield`; AGENTS.md defines browser-observed layout as authoritative for the original capture architecture, native semantic PDF output, fail-closed capability gates.
- Browserless Blitz/Rust PDF: earlier restricted fixture benchmarks recorded 72/72 clipping cases and 1,181,163 pixels matched, 4.22× warm time improvement relative to reused Chromium; general HTML/CSS, fonts, effects, pagination remain open.
- Local Silica ADR: `docs/adr/0084-html-to-svg-dual-converter-prototype.md`, experimental 2026-10-12. HTML→Silica PDF→Hayro or MuPDF SVG, single-page contract, no implicit fallback. The node route still uses browser-observed capture; it has not merged with the browserless Blitz path.
- Local Silica fidelity document: `docs/fidelity/SILICA_HAYRO_MUPDF_CROSS_READER_2026-10-12.md`. 94 fixtures, 84 ties / 7 MuPDF SVG wins / 3 Hayro SVG wins with librsvg rasterization; reader-specific clipping caveat. Direct Hayro PDF raster MAE 0.0769 vs MuPDF PDF 0.0926 on the sample (not speed).
- Satori official: https://github.com/vercel/satori ; static JSX and a supported HTML/CSS subset with Yoga-based layout. No head-to-head Silica-over-Satori conclusion established.
- SnapDOM official: https://github.com/zumerlab/snapdom ; Juan Martín Muda's live DOM-to-SVG/image capture and `<foreignObject>`-based approach. Live-state capture equivalence is an open problem for Silica.
- SnapDOM research transfer in canonical checkout: `docs/research/snapdom-v3.md`. Capturing computed style and selective style processing are significant costs; cross-implementation speedups remain hypotheses.
- Editorial reference: https://github.com/petergyang/no-ai-slop/tree/main/skills/no-ai-slop . Preserve first-person doubt, direct phrasing, precision; avoid repetitive rhetorical contrasts and fake-profound ending.
