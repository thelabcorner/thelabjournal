# thelabjournal™

A technical writing and research archive, implemented as a compact reading application rather than a sequence of marketing pages.

**Stack:** React 19 · TypeScript · Bun · Vite · Tailwind CSS v4 · Lucide · TanStack Virtual · Workbox PWA.
**Visual source:** neighboring `webseal/STYLE_GUIDE.md`, with the archive density of `gallery/` and technical editorial conventions of `thesis-website/`.

## Development

```sh
bun install
bun run dev
```

Vite is configured for port **11264**, listening on `0.0.0.0`. The local preview is available at `http://localhost:11264/`.

## Deployment

The canonical source is [thelabcorner/thelabjournal](https://github.com/thelabcorner/thelabjournal), and the live site is [thelabcorner.github.io/thelabjournal](https://thelabcorner.github.io/thelabjournal/). This project has its own GitHub Pages deployment; it does not depend on the owner's homepage repository.

`.github/workflows/pages.yml` builds and deploys the site automatically on pushes to `main` via GitHub Actions.

The workflow builds with `GITHUB_PAGES=true` and sets the Vite/PWA base path to `/thelabjournal/`. Local builds retain `/` as their base path, preserving the existing development and PWA audits. To inspect the Pages variant locally:

```sh
GITHUB_PAGES=true bun run build
bunx vite preview
```

Open `/thelabjournal/` on the preview origin when validating a Pages build.

## Information architecture

- **Persistent application frame:** 48 px header, 252 px desktop navigation rail, compact archive workspace, subdued footer.
- **Archive:** topic filters, category badges shared with the article reader, type/date metadata, keyword search, subject grouping (newest within each subject) by default, alternative chronological/reading-length sorts, item actions, selected entry, and saved view. No separate hero page for each topic.
- **Navigation:** a tiny ordered-dot signal trace at desktop widths, drawn at 12 fps and suspended when hidden or reduced-motion is enabled.
- **Article reader:** back/actions bar, live reading-progress indicator, article contents rail at wide widths, and a native section picker at narrower widths. The first section appears **before** the supporting figure.
- **Phone navigation:** persistent four-item bottom navigation (Journal, Browse, Saved, Search), safe-area-aware placement, and a bottom-sheet Browse menu. Breakpoint: below 768 px.
- **Tablet navigation:** top-bar Browse opens a left drawer between 768 and 1023 px.
- **Saved entries:** functional browser-local bookmarks backed by `localStorage` when available, with in-memory fallback. There is no account or cross-device sync.
- **Search:** Ctrl/⌘ K or / keyboard shortcut, filterable dialog, arrow navigation, Enter to open, Escape to dismiss.
- **Routes:** article deep links use `?post=slug` and remain compatible with browser history. Normal modified-link behavior is preserved.

## Installable PWA

The production build now includes a standalone web manifest, Apple/maskable icons, static offline precaching, manual service-worker update handling, and contextual installation controls in Preferences. Deploy over trusted HTTPS for mobile installation. The LAN development preview on HTTP is not a secure origin. See [PWA.md](PWA.md) for deployment, installation and offline tests.

## Adaptive virtualization

Large archive lists, responsive card grids, saved/filtered views, full-search results, and mobile recent-writing lists use measured TanStack Virtual windowing at 24+ visible items. Small collections and full article prose remain native DOM. The virtualization implementation is lazily loaded and stress-tested with 1,500 synthetic records. See [VIRTUALIZATION.md](VIRTUALIZATION.md) for architecture, benchmark methodology, accessibility tradeoffs and audit commands.

## Editorial workflow

- `src/first-post.ts` is the canonical source of the first essay; `src/agent-tools-post.ts` contains the second essay about OpenFork tooling.
- `bun run export:essay` exports both editorial essays to `content/drafts/`. The journal reads the TypeScript entries, not the Markdown exports.
- `src/data.ts` contains illustrative working notes and research previews, **not** independently verified published papers.
- All entries have explicit stage labels; avoid representing placeholders or under-review work as accepted results.
- Editorial status labels distinguish essays, working notes, concepts, and research under review. Publication is not a claim of peer review.
- Personal details, private research artifacts, internal logs, and unpublished benchmark claims were not copied into the first essay.

## Testing

```sh
bun run build
bun run audit:archive
bun run smoke
bun scripts/visual-audit.mjs
bun run audit:dither
bun run audit:pwa # needs production preview on localhost:11265
bun run audit:virtualization # includes 1,500-entry stress tests
bun run audit:virtual-cold # needs production preview on localhost:11265
bun run bench:virtualization # synthetic DOM, heap and commit comparison
```

The smoke suite requires Chrome installed in the standard Windows location and the running dev server. It covers responsive navigation, modal behavior, saved entries and persistence, article navigation, section picker, keyboard search, JavaScript exceptions, and horizontal overflow at **320 / 375 / 390 / 430 / 768 / 1024 / 1440 px**. The visual audit captures phone, tablet and desktop reference images in `artifacts/`. The dither audit verifies moving pixel output, frame suspension offscreen/in hidden tabs, and still-frame rendering under reduced-motion preferences at 320, 375, 768, 1024 and 1440 px. It does not substitute for testing on physical iOS Safari.

## UI contracts

- Light/dark/system zinc themes with restrained semantic colors. No decorative gradients, glass cards, generic icon walls, or monospace UI labels.
- Compact typography, 18 px WebSeal-style badges, hairline separators, precise spacing, and semantic stage labels. No uppercase wide-tracked eyebrow or overline micro-headings; use sentence-case section labels.
- Application controls are 28–36 px where appropriate, with larger phone hit areas; persistent phone navigation targets are at least 44 px high.
- Text scales and wraps; long content never forces horizontal page scrolling.
- Dialogs/drawers support keyboard dismissal, focus trapping and restoration. Mobile sheet scroll is contained; background scrolling is locked while modal navigation is open.
- UI claims, paper status, and conceptual figure captions must be calibrated to the actual research evidence.
- `src/components/DitherScene.tsx` and `src/dither.css` provide the WebSeal-inspired ordered-dot animation for the featured learning-sequence panel and the figure titlebar. Canvases are decorative, clipped and non-interactive, limited to 14–16 fps and device pixel ratio ≤ 1.5, and never overlap prose. Animations stop when hidden or offscreen and render a still frame under reduced-motion.
- `src/styles.css` holds the WebSeal-derived baseline tokens and figure/reader primitives; `src/app-shell.css` holds the redesigned application-shell layer. Refactor or consolidate after design approval rather than allowing two competing shell implementations.
