# Unified research + journal: design and integration contract

Status: **proposal / design prototype scope** (2026-10-18). No production merge has been implemented by this document.
Sources inspected: `lab-journal-prototype`, `thesis-website`, `webseal/STYLE_GUIDE.md`. The journal application shell is actively being modified for symmetry and brand alignment: do **not** overwrite its existing dirty changes.

## Product premise

A single independent-research publication, with distinct but related editorial modes:
- **Research** is a scientific manuscript library with inspectable sources, derivations, figures, versions, evidence boundaries and exports.
- **Journal** is an editorial record of essays, working notes, questions, experimental reasoning and narrative.
- **Projects** are navigable technical work indexes, not automatically scientific publications. Introduce them only once real public project material exists.
- **Topics** are a cross-publication graph: e.g. decarboxylation, lyophilization, rendering, geometry. They link *real* material without elevating working notes to formal evidence.
- **Overview** is a high-quality curated index, not a marketing homepage, generic portfolio grid, fake research institute, or dashboard of vanity statistics.

Position the author as an **independent researcher and engineer**, not as a degree-awarding institution or a peer-reviewed journal. Avoid fake institutional seals, journal impact factors, invented readership statistics, certifications, publication venue claims, and fabricated citations.

The Lab Corner can serve as a proposed umbrella brand; retain `thelabjournal™` as an editorial imprint. Do not silently rename domains or ship a new public name before a brand decision. Do not transplant WebSeal's own wordmark or product-specific security claims.

## Binding interaction and aesthetic rules

Reference: `webseal/STYLE_GUIDE.md`; transfer visual grammar, not product-specific constraints.
1. **New York dense, zinc first:** flat zinc surfaces, 1px hairlines, 4px spatial base, 6/8/12px nested radii, no ornamental gradients, glowing outlines, glass cards, giant empty feature cards, decorative network diagrams or random accent colors.
2. **Inter/system sans:** UI metadata, identifiers, citations, article identifiers and numbers are sans, numeric data use `tabular-nums`. Mono is acceptable only for substantive code blocks or authentic literal terminal sessions, not as the dominant "technical aesthetic."
3. **Sentence case:** no all-caps eyebrows, widened letter-spacing or typographically theatrical section labels. A premium scientific interface is precise, not noisy.
4. **Control rhythm:** 48px primary header; ~28px minor buttons; 32px primary controls; 18px badges; 32–34px nav rows; 44–56px two-line result rows; 11–12px metadata; 13px functional UI; 14.5px / ~1.72 manuscript prose; 11–13px figure notes and tables with testable legibility.
5. **Alignment is structural:** top header, primary desktop rail, article container and footer must derive their horizontal grid from one shared centered shell; never independently position all three and patch them by eye.
6. **Navigation is an information system:** persistent and scannable on desktop, context-specific TOC on manuscript and article pages, direct keyboard search, back/forward semantics, landmarks and keyboard focus. Avoid duplicative sidebars, mystery icons, 4K full-bleed reading columns.
7. **Zinc-only chrome:** color indicates scientific evidence category or action/error state, not decoration. Use a single neutral active overlay and precise focus-visible outline rather than thick active bars.
8. **Restraint with rich functionality:** comments/saves/search/filters/related research are real workflows where present. Do not put inoperative controls in production.
9. **Ambient dither is subordinate:** retain journal's actual WebSeal-inspired ordered-dot system, the 2% journal-landing treatment and the 14fps navigation assets where appropriate. No animation behind equations, small metadata, captions, figures or long-form body copy. Honor reduced motion, hidden tab and print.
10. **Dark appearance:** WebSeal itself is explicitly light-only; the **journal is not**. Journal already implements saved light/dark/system appearance. Recommend keeping this user capability for the combined publication, with the light-zinc research presentation as initial visual target and thoroughly audited dark math/figure contrast. Do not rewrite WebSeal to allow dark mode.

## Real implementation facts (source audit)

`lab-journal-prototype`:
- React 19, TS, Vite, Tailwind 4, Bun, Lucide, TanStack Virtual, Workbox PWA.
- `src/styles.css` has `--journal-shell-max-width: 1500px`, a 48px site header and 252px desktop sidebar; `src/app-shell.css` adds the centered frame, ~780px journal prose and optional ~205px TOC.
- Existing archive sort, saved-local bookmarks, appearance controls, keyboard search, static article social pages, icon/OG tooling, dynamic virtualization, PWA and mobile bottom navigation must survive.
- Journal entry route: `/posts/:slug/` in the present deployment; old `?post=` links are upgraded. On GitHub Pages deployment, base is `/thelabjournal/`.
- `src/data.ts` includes real essay objects and illustrative research-preview entries. These are **not** a validated research-paper registry. Preserve `Stage` semantics.
- An icon-only desktop rail and a shared `BrandMark` are actively being modified in this checkout; changes remain dirty. Treat this subsystem as concurrent ownership and DO NOT overwrite.

`thesis-website`:
- React 19, TS, Vite, Tailwind 4, lazy scientific manuscript bodies, KaTeX and ECharts.
- `src/data/papers/index.ts` exposes two independently lazy manuscript bodies and their section registries.
- IDs: `gravimetric-decarboxylation-co2-progress` (metadata status `draft`, version `v0.10.0`) and `low-temp-lyophilization-three-theses` (`under-review`, version `v1.1.2`).
- Present links are `?paper=id#section`, and global `.dark` classes, indigo/slate CSS tokens and direct topbar/sidebar ownership currently differ from the journal.
- The paper body, nested TOC, references, formulas, interactive figures, print surface, hash restoration and production/readability tests are worth preserving; own application shell and global theme are **not** importable unmodified.
- A source status of 'under-review' is not evidence of external peer review; no DOI should be displayed if absent.

## Recommended navigation and content taxonomy

Top-level primary nav: `Overview | Research | Journal | Topics | About`.
- The existing journal's `Essays`, `Research`, `Engineering`, `Experiments`, `Process` topic filters should become *journal editorial filters*, not compete with top-level `Research` manuscript collection.
- `Projects` can be a secondary route once canonical public references are ready; don't scatter undeployed application cards over the landing.
- `Saved` remains local-to-browser until a real sync account exists and must be explicitly labeled accordingly.
- Each record has one canonical URL, one type, one publication status and as many tagged relationships as justified.

Routes (final origin TBD):
- `/` curated overview / orientation / selected works
- `/research/` formal manuscript archive, with discipline / evidence filters
- `/research/:slug/` long-form scientific manuscript
- `/journal/` existing journal archive and editorial filters
- `/journal/:slug/` journal long-form entry
- `/topics/:slug/` cross-publication topic page
- `/about/` independent researcher background, research integrity practices, citation contact

Preserve compatibility:
- `/thelabjournal/posts/:slug/`, `?post=slug`
- old thesis `?paper=id#section`
- anchor IDs, hash deep-link behavior, externally linked static OG article pages
- base paths on the actual deployment origin; if domains remain separate initially use canonical cross-domain forwarding rather than silently producing broken links.

## The unified shell (desktop)

```
┌────────────────────────── centered outer shell, max 1500 ───────────────────────────┐
│ 48px brand / Overview Research Journal Topics / universal search ⌘K / utilities    │
├──────┬────────────────────────────┬─────────────────────────────┬─────────────────┤
│ 48px │ 220–252px scoped nav       │ article/research 680–780px  │ 196–220px TOC   │
│ icon │ tree / collection / filters│ headline, prose, charts     │ current section │
│ rail │ (only if context needs it) │ reader controls             │ related items   │
├──────┴────────────────────────────┴─────────────────────────────┴─────────────────┤
│ Footer / source information / public status / cross-publication navigation          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
**Important:** these columns are contextually allocated, not all shown on every page. The icon rail is either part of the scoped navigation assembly or collapsed; don't pay two redundant permanent navigation gutters. On overview, use a centered two-column editorial composition; on Research/Journal indexes, use list + filters; on articles use the optional TOC. On constrained desktop and tablet, collapse side columns *before* reducing prose below readable widths. Center the entire shell, not just its interior prose.

Candidate structural CSS, validate against the existing in-progress shell, rather than pasting verbatim:

```css
:root { --site-max: 1500px; --chrome-height: 48px; --nav-width: 252px; --toc-width: 208px; --reader-width: 780px; }
.site-frame { width: min(100%, var(--site-max)); margin-inline: auto; }
.site-columns { display: grid; grid-template-columns: var(--nav-width) minmax(0,1fr); }
.content-workspace { min-width: 0; }
.reader-grid { display: grid; grid-template-columns: minmax(0,var(--reader-width)) minmax(0,var(--toc-width)); column-gap: clamp(24px,3vw,48px); justify-content: center; }
@media(max-width:1279px){ .reader-grid { grid-template-columns: minmax(0,var(--reader-width)); } }
@media(max-width:1023px){ .site-columns{grid-template-columns:minmax(0,1fr)} }
```

Invariant: the header's brand left edge, the sidebar's left edge, the content's major vertical rules and the footer must map to one shared layout matrix, with no asymmetric transform-based correction. On 4K, side whitespace should increase rather than the reading column becoming unreadably wide.

## Page-specific information hierarchy

### Overview
- Small compact brand/positioning title, one clear introductory paragraph, no 72px marketing headline.
- **Featured research** is one genuinely featured technical work with accurate status, latest revision and a live link.
- **Journal** is a compact recent-entry editorial list, not a symmetrical feature-card grid.
- **Explore by topic** is a small logical table/row view; display only meaningful topics.
- **About / methodology** links disclose scope, independence, evidence standards.
- Dither may serve as faint contextual artwork in one bounded header region, not underneath the text.

### Research index
- H1 Research, one-sentence scope statement, count from real registry.
- Compact discipline / status filters and a real instant search.
- Rows include title, concise scope, field, revision date, version and honest status; no synthetic ratings or unverified DOI badges.
- Dense list with 2-line rows, optional grouped view by discipline. Avoid massive identical paper cards.

### Scientific manuscript reader
- Shared 48px header; sticky manuscript action strip `← Research · document title · version · share/print`.
- Separate scientific navigation from global site navigation. Nested section tree as contextual rail, not a second persistent application sidebar of equal weight.
- Front matter: exact title; subtitle; authorship; manuscript status/version; revision date; keywords; abstract; optional source/export actions.
- **Document integrity labels:** theory/derived/model/experiment/observation/hypothesis only where the manuscript actually uses such distinctions.
- Real equations remain selectable/accessible, KaTeX stylesheet scoped, anchors preserved; interactive ECharts plots client-only, lazy, and with readable static/export fallback for print.
- Citations link to reference entries, not merely an external search. Figures have caption + number; no whimsical marketing illustrations within the paper.
- Let readers choose reading width and type scale only if implemented properly and parity-tested.

### Journal archive/reader
- Preserve journal's current editorial browsing, lists, highlights, saves, local preference store, reading progress, section jump, related posts, mobile bottom bar and article OG route.
- Journal's own `Research` filter becomes `Research notes` or another unambiguous **editorial** label, never mistaken for manuscript archive.
- Same site header and footer; journal reader can be slightly more narrative, with more visual rhythm, while maintaining the shared type and border grammar.

### Cross-publication connections
Use a typed graph with editorially verified relations:
- `context_for`: narrative explaining a formal manuscript;
- `derived_from`: documented provenance;
- `explores`: a draft idea touching the same scientific domain;
- `implements`: a public engineering implementation;
- `revises`: superseding public revisions of a publication.

In UI: one compact `Related work` module after abstract/alongside references, or a concise footer list. Show **relationship semantics** so prose cannot quietly become scientific proof. If no verified link, show nothing.

## Data architecture

Do not normalize the two content systems by destroying their specialized rendering trees. A discriminated registry stores *metadata*; entries resolve to distinct renderer modules.

```ts
type PublicationKind = "manuscript" | "journal";
type Stage = "draft" | "under-review" | "working-notes" | "concept" | "published";
type Publication = {
  id: string;
  kind: PublicationKind;
  canonicalPath: string;
  title: string;
  description: string;
  topics: string[];
  stage: Stage;
  publishedAt?: string;   // omitted, not invented
  revisedAt?: string;
  version?: string;
  sourceId: string;
};
type Relation = {
  sourceId: string;
  targetId: string;
  kind: "context_for" | "derived_from" | "explores" | "implements" | "revises";
};
```

Specific migrations:
- Explicit `JournalPublicationAdapter`: converts the existing `Entry` object without changing the source article content.
- `ThesisPublicationAdapter`: reads `PAPER_DEFINITIONS` metadata; render scientific body via a lazy `PaperBody` export.
- `PublicationRegistry` statically generated at build-time and validated for unique identifiers, canonical routes, publication types and relation targets.
- Search indexes title, abstract/dek, tags, plain text excerpts, and document section anchors where robust. Command bar shows grouped Results: Research / Journal / Topics with keyboard-first navigation.
- Integrate routing once, not both legacy `pushState` implementations. Handle `popstate`, `hashchange`, scroll restoration and base URLs without racey double effects.
- Namespace CSS: WebSeal-like global primitives => `src/theme`; thesis document-specific styles => `.research-manuscript` scopes; avoid thesis global `:root`, `.dark`, `body` and generic `.paper` class collisions.
- Keep registry/meta lightweight: avoid importing KaTeX, ECharts or all paper JSX merely to show the index.

## Proposed engineering sequence, with acceptance gates

**0. Freeze and baseline.** Record git status for both codebases. Audit current journal WIP nav/brand/symmetry changes; do not reset or overwrite. Capture baseline screenshots and build sizes for desktop (1440, 1920, 3840), laptop (1024, 1280), mobile (320, 375, 390, 768); dark/light; current paper permalink and journal permalink. Reuse existing audits.

**1. Design prototype, no production edit.** Implement self-contained conceptual Overview / Research / Journal / Manuscript / Journal entry pages using authentic titles/status. Prove centered header/frame/sidebar symmetry, shared brand mark, typography, compact search, dark/light behavior and contextual rails before starting the destructive route merge.

**2. Composition shell.** Promote one shared header/brand/nav/search, align grid and footer, preserve all existing journal archive behavior. No duplicate theme providers. No route regressions. Document stable shell contracts.

**3. Metadata bridge.** Add typed metadata adapters and compile-time uniqueness checks; cross-collection search; stage fidelity and distinct grouping; no giant read-side bundles.

**4. Scientific renderer migration.** Port the thesis *body* modules and scoped CSS; retain nested sections and math/figures. Test both paper bodies and their print/PDF and deep-link anchors. Do not import the thesis `App`, `TopBar`, `Sidebar`, or global theme unmodified.

**5. Publishing and discoverability.** Reconcile canonical URLs and GitHub Pages base. Pre-generate route-specific HTML/meta/OG/social pages for both kinds, set stable redirects where the host permits; PWA precache bounded, no invalid service-worker scope. Cross-link related verified work.

**6. Release gate.** Responsive, contrast, keyboard, pointer, screen-reader landmarks, print, page weights, critical interactions, and real-device scroll behavior. Compare before/after screenshots; explicit release rollback to current separate deployments.

### Quantitative targets (targets, NOT measured results)
- Shared nav, header/sidebar major rules have **≤1px geometry deviation** at prescribed widths.
- 0 unintended horizontal scroll from 320 through 3840px.
- 0 lost paper anchors, post deep links or reference links.
- 0 incorrect research-status/DOI claims.
- No eager loading of the full ECharts/KaTeX/manuscript body bundle on Journal-only route.
- Core keyboard operations: Ctrl/⌘K open; Esc close; arrow navigation; Enter open; focus restore; browser back/forward on all route transitions.
- Representative desktop index: minimum 7 meaningful entries visible without scrolling at 900px-high viewport, unless titles wrap due to actual content.
- Validate actual p75 LCP and INP *after implementation* on representative hardware/network; do not assert fabricated millisecond gains or bundle savings.

## Risks and explicit non-goals

1. Existing journal desktop alignment WIP: preserve. File ownership is sensitive.
2. Theme conflict: journal `data-theme`, thesis global `.dark` and WebSeal light-only have incompatible current contracts. Decide shared journal mode and remap paper-specific tokens carefully; do not disable dark appearance without a user decision.
3. Route conflict: on Pages `/thelabjournal/` basename and old `?paper` origins cannot be treated as host-neutral; deployment architecture must be settled before cutover.
4. Scientific SEO / social cards: a client-side route alone does not create shareable, crawlable document metadata; static generation required.
5. Paper stage: only 2 actual manuscript modules, and neither is shown as peer reviewed; journal research previews remain separate.
6. Dense does not mean 11px prose. Respect reading ergonomics and chart legibility.
7. Do not add fake comments, accounts, applause, likes, citation counts, impact metrics, institutional credentials, AI-generated research art or stock imagery.
8. Do not create a third codebase as the production canonical source. The journal repo is the proposed shell home; extraction into packages only when functional seams justify it.

## Sign-off questions (not a blocker for prototype)

- Final umbrella display name and public domain. Proposal: `The Lab Corner`, with `thelabjournal™` as its editorial publication.
- Whether the unified site retains dark mode. Technical recommendation: yes, because journal already supports it; WebSeal itself remains light-only.
- How to present the root landing: concise curated editorial overview, rather than putting journal archive or thesis index alone at `/`.

Until those are decided, preserve all public URLs and keep any preview explicitly **non-production**.
