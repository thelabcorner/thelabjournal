# Google Scholar manuscript publishing contract

Status: engineered and locally verified on 2026-10-20. **Google Scholar inclusion itself has not been verified and is never guaranteed by passing these checks.** Deployment to the public domain is a separate step.

## Taxonomy and research provenance

- **Manuscripts** are independently authored, formal scholarly research papers. They live at `/research/<paper-id>/`, with separate complete, searchable `manuscript.pdf` documents. They alone receive Highwire Press `citation_*` meta tags.
- **Journal entries and editorial essays** are personal working notes, ideas, ramblings, and opinions. They live at `/posts/<slug>/`, retain normal general-web search visibility, and are **not** tagged as Google Scholar papers. No PDF or fabricated scholarly metadata is made for them.
- Papers are not automatically **peer reviewed** merely because they are publicly readable. Existing author workflow labels (draft, under review, published) are preserved faithfully. Do not claim external review, institutional affiliation, ISSN, DOI, journal volume, issue, or page numbers until documented.
- Author names in Scholar metadata contain *only authors*. Professional roles and contact addresses remain on the visible manuscript pages, not in the `citation_author` field.

## Publication architecture

1. The canonical deployment is `https://journal.thedabcorner.site/` (Cloudflare). A GitHub Pages build is only a project-base mirror.
2. The homepage contains an ordinary non-JavaScript `<a href="/research/">` research link; the research index has individual links to each manuscript and its verified PDF.
3. Every manuscript HTML page contains title, visible actual-author names, the **complete manuscript abstract**, a revision label, permanent canonical URL, appropriate Highwire metadata, and a PDF link when the full text passes validation. The complete abstract is snapshotted from the actual rendered manuscript's abstract section into `public/research/<id>/abstract.json` during PDF publishing. Static markup is in `#root` for no-JavaScript crawlers; the React reader replaces it when JS runs.
4. Each full manuscript is a single searchable PDF (not multiple chapter files), with title, author, bibliography, equations and figures. PDF sits in the **same subdirectory** as its abstract URL (required for `citation_pdf_url`). A PDF is advertised only when it is <5,000,000 bytes and matches the current manuscript source fingerprint.
5. `robots.txt` permits Google crawlers, while `sitemap.xml` lists the home page, the research index, individual manuscript pages, and ordinary journal posts for general search.
6. Manuscript `citation_publication_date` is currently a **year-only** citation date. It comes from the independently authored registry's `publicationYear`, else its known year. **Research start dates are not silently treated as exact public-release dates.** Introduce a verified first-publication date later if one is documented.

## Regenerating and publishing verified PDFs

Run in the project root:

```bash
bun run build
bun run generate:scholar:pdf
bun run build
bun run audit:scholar
bun run audit:scholar:http
```

- The first build creates working HTML manuscript routes for Chrome print rendering.
- `generate:scholar:pdf` renders the **actual React manuscript** rather than a screenshot or summary. It captures real text, equations, figures, references, and all manuscript sections, uses Scholar-appropriate print title/author sizes, and confirms that PDF.js can extract the actual manuscript title, authors, a bibliography heading, and substantial text across every page. If the PDF fails or is above 5 MB, it does not publish.
- PDFs are kept in `public/research/<id>/manuscript.pdf`; the complete author-written abstract is stored in adjacent `abstract.json`. Both are bound to the same normalized, cross-platform source SHA-256 fingerprint. PDF extraction audit values and hashes are recorded in `public/research/pdf-manifest.json`.
- The second build copies verified PDFs and the full abstract snapshot into `dist`, generates `citation_pdf_url`, and emits `/research/pdf-availability.json` to show PDF access in the interactive manuscript toolbar (both production and development). A PDF with a stale source hash or missing current abstract **is not advertised** in the generated metadata or toolbar until regenerated.
- `scripts/scholar-http-audit.mjs` tests actual HTTP responses with a Google Scholar crawler user agent: static title, author, year, every paragraph of the full manuscript abstract, same-directory PDF metadata, valid PDF bytes/MIME/size, sitemap and crawler reachability, and isolation from every nonscholarly journal entry. `scripts/scholar-pdf-visual-audit.mjs` independently rasterizes representative PDF pages and rejects blank/corrupted renders. Both audits run on GitHub's project-base mirror CI as well.
- The source fingerprint includes the manuscript source and common manuscript renderer/styles; keep the fingerprint dependencies updated as the rendering architecture evolves. Do not manually edit the generated PDF or manifest.
- In an environment without Playwright-compatible Chromium, the website can still publish crawlable abstracts, but **must not advertise an unverified PDF**.

## Onboarding new manuscripts

1. Add a `PaperDefinition` to `src/manuscript-runtime/data/papers/index.ts` with a unique ID, correctly authored title, author(s), year, and a complete abstract.
2. Author the actual scientific manuscript with visible title, bibliography and scientific body; keep separate from `src/data.ts` journal posts.
3. Run the publication pipeline. The paper-source mapping is discovered by scanning the source module's `entry.ts`, so new papers are indexed by the same generator with no manual route list.
4. Keep revisions traceable. Never invent publication days or retroactively backdate research; a year-only citation date is deliberately used until first-release provenance is known.
5. Verify public HTTP delivery after deploying, and later search the exact titles on scholar.google.com. Indexing can take weeks, and a local passing audit is **not an acceptance decision by Google**.

## Discovery limitation: mixed scholarly and personal archive

Google Scholar's inclusion guidance says sites it indexes should consist primarily of scholarly literature. The Lab Journal intentionally includes a substantial separate collection of nonscholarly personal entries. Distinct `/research/` versus `/posts/` paths, proper citation metadata and explicit article-type distinctions make the intended scholarly collection clear, but **cannot guarantee that Google's site-level eligibility filters will accept a mixed-content host**. If Google Scholar declines discovery despite valid article pages, a dedicated scholarly-only research subdomain with its own canonical URLs is the next infrastructure step. Do not mislabel journal entries or suppress their ordinary Google Search visibility to manipulate that determination.

## Primary documentation

Google Scholar's own webmaster inclusion instructions:
https://scholar.google.com/intl/en/scholar/inclusion.html

Google Scholar's publisher guidance:
https://scholar.google.com/intl/en/scholar/publishers.html

These explicitly include technical reports, drafts, preprints and independent authors; they require crawlable accessible files, unique article URLs, machine-readable bibliographic metadata, readable PDFs when linked, and freely readable paper abstracts. Journal posts and personal essays are not appropriate scholarly article content.

## PDF publication design contract — October 2026

The canonical manuscript PDF is **not** the journal website printed to paper.

- Cover and interactive scholarly table of contents use full-page editorial composition. The WebSeal navigation's deterministic Bayer-dot information field is translated into static **vector rectangles**, not a screenshot.
- Scientific articles use **true two-column, left-to-right paginated typesetting**. The export validates the *actual PDF text coordinates* to distinguish real two-column pages from a CSS declaration that silently fails.
- Long scientific graphics span the paired columns as a full-width exhibit, analogous to a wide TeX figure. Three linked pressure-transfer charts are editorially recomposed as a paired-plot layout with a third chart and explanatory note, rather than stacked mobile widgets.
- Numbered equations use a white, unboxed scientific environment. Equations that fit remain inside their reading column; only formulas whose natural widths exceed the measured column width span both.
- Typography is exclusively **Inter sans-serif** for narrative, heads, captions, tables, and editorial chrome. Specialized **KaTeX math glyphs** are preserved for correct mathematical composition. **No serif body fonts**. Palette: shadcn Zinc light, hairline rules, limited neutral fills.
- Author scientific text, figures, observations, calculations, limitations, bibliography, and original citations remain source-derived and are not reformulated during PDF styling.
- The PDF has a genuine clickable chapter contents table with page numbers resolved in a second pass, deep bibliography hyperlinks, outbound paper URLs, embedded text, running page folios, and hierarchical native PDF outline entries.
- Every publication is rendered as real searchable PDF text (with vector SVG scientific plots where source permits) and verified against the 5 MB Google Scholar limit. Web-only controls are omitted without deleting experimental information.
- The entire styled scientific PDF must be reviewed for **column balance, figure clipping, missing scientific material, unprinted content, awkward blank pages, unreadable formula scales, and oversize tables** before a public release.

The personal **Journal** remains separately classified as non-scholarly. PDF publishing is driven **only** by the manuscript registry.
