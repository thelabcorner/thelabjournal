# THCA-A / limonene computational manuscript · editorial draft

**Status:** Publicly accessible editorial manuscript draft, not peer reviewed and not submitted for Scholar indexing. Original research source resides on homelab in `E:\opencosmo-rs\research\thca-limonene` (and the related OpenFork session). Author: Jackson Cummings · Independent process engineer · jackson@thedabcorner.site.

**Canonical manuscript source:** `manuscript.tex`. Rendered PDF: `manuscript-draft.pdf`, with responsive companion `manuscript-preview.html`. Machine-readable input provenance: `EVIDENCE_LEDGER.md`. The print layout is an A4 two-column scientific manuscript with native PDF citation/section links, sans-serif type, thelabjournal™ zinc light and the original publication dither. The draft is now registered in the journal’s Manuscripts index and has a browser reader at `/research/thca-limonene-cosmo-rs/`, with source-derived article content and the independently formatted draft PDF. It remains an **editorial draft**, excluded from Google Scholar citation tags and the XML sitemap. Public availability does not imply validation or peer review.

Build and verify the current PDF via the source-derived Chromium compositor (uses existing site Playwright and KaTeX dependencies):

```powershell
node generate-dither.mjs
node render-manuscript.mjs
node ../../../scripts/thca-manuscript-source-audit.mjs
```

`manuscript.tex` is also available as a genuine XeLaTeX source. XeLaTeX compilation on the workstation is presently blocked during MiKTeX format initialization by an environmental GUI-framework error, not a demonstrated LaTeX source error. The delivered PDF was generated with Chromium using **separate print-specific A4/two-column styling**, not by printing the public website. Desktop / mobile preview is available in `manuscript-preview.html`. The PDF contains four full pages of actual two-column layout, with searchable text and embedded document hyperlinks. Keep this draft out of public Scholar indexing until reviewed.

**Hard evidence boundary:** 462 COSMO activity grid evaluations and 41 numerically verified conditional SLE roots were actually computed. The reported patent phase need not equal the modelled THCA-A crystal; the 146°C/16.3-kJ mol⁻¹ thermal input has a preceding TGA degradation event and requires independent verification. Conditional modeled mg per mL refers to starting limonene volume, never final solution volume. No lab-assayed equilibrium solubility is reported.
