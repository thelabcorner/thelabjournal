# Manuscript v0.1 · editorial and print QA (2026-10-21)

**Status: first usable internal manuscript draft completed.** The draft is **not peer-reviewed or published**; the manuscript is now registered as a browsable **Draft** in the manuscript registry and as a static draft article route; the Scholar citation tags and XML sitemap omit it, and no public deployment occurred. Existing, unrelated modified files in thelabjournal™ repository were preserved.

## Scope and authorship
- Author: Jackson Cummings, Independent process engineer. Affiliation line: Independent applied research. Contact: jackson@thedabcorner.site.
- Manuscript-new workflow, distinct from conversational journal prose. Claims, interpretations, and the observed delayed crystallization are preserved with their actual research status.
- Distinction: 462 activity calculations and 41 roots were computationally evaluated; numeric closure ≠ analytical equilibrium measurement.
- **Primary authoritative scientific copy:** `manuscript.tex`. `manuscript-preview.html` and `manuscript-draft.pdf` are generated review renderings. The metadata/reference mirror in `render-manuscript.mjs` is provisional and should be reconciled before a public release.

## Scientific provenance
- Primary THCA-A crystal reference: Skell, Kahn, Foxman (2021), DOI 10.1107/S2053229621000280.
- openCOSMO-RS 24a: Müller et al. (2025), DOI 10.1016/j.fluid.2024.114250.
- Thermal scenario: specific crystalline THCA form in US20260008762A1, 146°C / 16.3 kJ/mol; that source reports TGA degradation near 125°C. Polymorph match and reversible fusion interpretation unverified.
- Historical 70°C claim treated as Filer (2021) citing older patent, not a matched DSC result.
- Wang et al. (2016) decarboxylation kinetics are in extracts, not limonene.
- Numerics: `sle_rebuild_20261021/sle_rebuild_verification.json` with 41/41 direct root closure checks, max absolute ln-activity error 7.182935338×10⁻⁷. `EVIDENCE_LEDGER.md` has claim-level mapping and unresolved verification gates.

## Print and reading UX QA
- `node --check generate-dither.mjs`: **PASS**
- `node --check render-manuscript.mjs`: **PASS**
- `node generate-dither.mjs`: **PASS**, nav-derived WebSeal Bayer dither as SVG+PNG.
- `node render-manuscript.mjs`: **PASS**, direct typeset HTML companion and Chromium PDF from scientific TeX body.
- KaTeX render errors: **0**.
- Responsive mobile (390px): width=390px, scrollWidth=390px, single text column: **PASS**.
- PDF: **4 A4 pages**, **two substantive research text columns on all four pages**, page column token counts [[140,118],[236,164],[162,137],[171,127]], **21 link annotations**, searchable author/method/numeric results/references, no residual generation placeholders: **PASS**.
- Typeface/style: Inter sans-serif, zinc light, compact science layout, section/subsection numbering, scientific equations, figure/table caption, native dither. Separate print-page styling from responsive HTML view; no brochure-like cover or blog-print reuse.
- **Source-to-output discrepancy found and repaired:** the earlier renderer mistakenly repeated the conditional-SLE table in place of the crystal lattice crosswalk, incorrectly mapped the mole-fraction column from the source data, and duplicated the same curve for both TeX figures. The renderer now maps the exact TeX labels to **Table 1 (2021 CIF / patent lattice metrics)**, **Table 2 (temperature-dependent SLE)**, **Figure 1 (conditional loading)**, and **Figure 2 (composition-dependent COSMO-RS activity)**. Equation/section/table references were also corrected. The canonical TeX scientific prose and equations were preserved.
- **Independent source/PDF regression audit:** `bun scripts/thca-manuscript-source-audit.mjs` **PASS**. Verifies both tables, both distinct figures, 5 display equations, named scientific inputs, 25°C root, resolved cross-references, four substantive two-column A4 pages, and **21 navigable PDF anchors/links**. This audit is now a required production-build gate.
- Browser-derived PDF is a production-formatted review artifact. **XeLaTeX source was not compiled by MiKTeX:** it failed during local format initialization because MiKTeX Qt GUI framework could not initialize. This is an environment blocker, not evidence of a LaTeX source compile pass. The PDF was instead rendered from the canonical TeX body with KaTeX in Chromium and physically inspected by PDFjs text-coordinate analysis.
- **Journal manuscript integration:** Canonical PaperEntry registry now includes the draft; the normal Manuscripts index, filtering/search, deep-link route, contents tree, citations, and draft-PDF action are wired. The HTML body is sourced from the generated canonical TeX companion and has responsive zinc-light/dark site styling, independent from the existing 4-page A4, two-column print PDF.
- **Production build:** `bun run build` **PASS**, including TypeScript, Vite, index/Scholar separation, and article-social checks. The draft generates `/research/thca-limonene-cosmo-rs/` with `robots=noindex, follow`, no `citation_*` tags, and no sitemap entry; the manuscript **does appear** in the plain HTML research index.
- **Real browser audit:** `node scripts/thca-manuscript-reader-audit.mjs` **PASS** at 1440px and 390px. Article loaded, 5 equations, 2 figures, 5 bibliography source links, section anchors, SVG dither and draft-PDF control. 390px `scrollWidth=390px`; no horizontal overflow. Initial test uncovered a global CSS `.brand` collision (479px overflow), corrected with a manuscript-scoped publication-line class. Browser screenshots saved to `artifacts/thca-manuscript-audit/`.
- **Deployment state:** source integration and production build verified locally only. Nothing in this campaign was committed, pushed, deployed, indexed in Scholar, or released as a peer-reviewed manuscript.
- Visual review by the author should still inspect line break quality, bibliography entries, captions, print/page breaks, and figure legibility before public publication.

## Editorial release gates
- Validate exact crystal solid form against the patent crystal before treating Tm/Hfus as physical inputs to a publishable solubility prediction.
- Use measured DSC/TGA with chemical assay across the thermal event and independent HPLC-specified equilibrium concentration plateaus at two temperatures.
- Inspect COSMO surface/conformer/association assumptions and calibrate model against measured data before fitting scientific confidence bounds.
- **Manuscripts-page integration:** completed as an editorial Draft and native article route; no Scholar citation tags or public sitemap until author release approval.
- **Formal public release gate:** approval of the scientific copy, reference details, specific crystalline-phase/fusion evidence, print/PDF layout, final canonical metadata/OG/DOI policy, and explicit deployment.
- Do not silently alter the user's conclusion about the earlier model: the computational mismatch and dependence on crystal thermodynamics are genuine and remain central to the thesis.
