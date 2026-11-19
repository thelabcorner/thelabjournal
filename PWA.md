# thelabjournal™ — PWA

The journal is packaged as a standalone, installable Progressive Web App. Its source and production build are separate from the Vite development preview.

## Production behavior

- The Vite PWA plugin emits `manifest.webmanifest` with name, start URL, same-origin scope, app ID, standalone display, and 192/512/maskable icons.
- The navigation's four-tile logo is the canonical source of truth in `src/lib/brandMark.ts`. `bun run generate:pwa-icons` regenerates its SVG, 16/32/48 PNG and ICO favicon variants, the 180 px Apple touch icon, 192/512 PWA icons, and a genuinely safe-zone-inset maskable 512 icon. These are committed assets; deployment validates them with `bun run audit:icons`.
- A Workbox service worker precaches the minimal, manifest-derived static startup dependency graph (including the app shell, article registry, styles and required fonts), rather than every optional syntax grammar, figure, image and code module. Article links use `/posts/<slug>/`, and a cached `index.html` supplies offline SPA navigation; legacy `?post=<slug>` links remain supported.
- Workbox reuses unchanged revisioned/hashed assets across worker updates. Optional `/assets/*` scripts, styles, fonts and images use the persistent `journal-on-demand-assets-v1` CacheFirst runtime cache after first use. This allows unchanged optional assets to survive multiple deployments without holding up service-worker activation. Unvisited optional features are not promised offline, while the startup/article reader remains available offline after successful installation.
- React and React DOM are isolated into a separately content-hashed `react-runtime` chunk. The article corpus is separately chunked as `journal-content.js` on the canonical Cloudflare site; its stable URL is HTTP-revalidated and individually revisioned by Workbox. A text-only change does not require a new application runtime bundle. Manuscripts, quotes and search load only on their respective routes, with research/quotes styles fetched on demand. The five exact Inter weights use WOFF2 without redundant legacy formats.
- If a deferred route chunk is unavailable during deployment or before an offline cache is warmed, the reader gets a dedicated recovery state at the same URL rather than a blank screen or the homepage. The retry control checks for a fresh worker before reloading.
- The 1254 px author portrait is preserved as a PNG fallback but the reader normally uses a 128 px WebP (~8 KB instead of ~2.6 MB). That small reader portrait is included in the critical offline cache so an article doesn't trigger a full-resolution download.
- The release observer attaches **before React mounts** and also handles registrations discovered after `updatefound`. The journal checks for updates when the installed app starts, resumes, becomes visible, comes online, and every five minutes while open (with foreground-check throttling). Workbox activates the updated worker and Vite reloads the app automatically; `beforeinstallprompt` remains captured before Preferences opens.
- An in-flight release check that lasts more than 350 ms shows a truthful, nonblocking **Checking for the latest version** status; real `updatefound`/installing lifecycle events immediately switch to **Downloading** before the revisioned precache completes, followed by installing/activation. The NCM dithered notice no longer has a 350 ms entry-animation delay. No invented percentage, and no forced interruption of an already readable article.
- Before application modules are available, a tiny inline HTML first-paint shell identifies the requested article, manuscript or quotation rather than flashing the homepage. A stale installed version that does not recognize a newly published article/manuscript automatically checks for a newer service worker and shows a dedicated preparing/retry state **at that same URL**, not the unrelated home landing. A successful update reopens the requested deep link.
- Preferences shows an Install button when supported, iOS Safari's Add to Home Screen steps when applicable, or an accurate HTTPS requirement on LAN HTTP.
- Appearance, bookmarks, and reading preferences remain browser-local; they do not synchronize between devices.
- Scroll position is private, tab-session-scoped, and remembered per history entry for articles, manuscripts, quotes, and the archive. Refreshes and automatic service-worker reloads restore the reader's place after the destination content mounts; browser Back/Forward restores each entry independently. Stable section anchors survive common editorial/layout shifts, explicit fresh `#section` links take priority, and the reader's own touch/wheel/keyboard input cancels pending restoration. A freshly clicked article still opens at its beginning (no surprising automatic jump from a previous visit). Position persistence is trailing-idle (not a periodic write while scrolling), with immediate synchronous flush on page exit and route changes; section lookup uses binary search over DOM-ordered anchors. A 6-second bounded restoration window uses gradually backed-off checks while deferred manuscript content mounts.
- Service workers and installability are secure-context features. Production must use a trusted `https://` hostname. `http://localhost` works for desktop development/testing; `http://192.168.1.70:11264/` does **not**.
- Installation and offline caching require at least one successful online visit over a secure origin. Updates apply without manual cache clearing; release activation can briefly reload an active reading session, restoring its URL and reading position.
- Public builds allow discovery by search engines; article stage labels still distinguish working notes from validated results.

## Build / test

```sh
bun install
bun run generate:pwa-icons
bun run audit:icons
bun run build
bunx vite preview --host 127.0.0.1 --port 11265 --strictPort
# in another terminal
bun run audit:pwa
bun run audit:pwa-cache
bun run audit:pwa-update
bun run audit:pwa-first-paint
bun run audit:reading
bun run audit:reading-perf
bun run audit:pwa-routes
bun run audit:pwa-stability
bun run audit:pwa-editorial
bun run audit:pwa-mirror
```

The release-stability audit injects a canary essay revision in Vite's transform pipeline (without editing article sources), proves that only the content revision changes while application/React chunk filenames remain stable, and restores the normal build even on failure. The editorial-update browser audit uses a second worker to serve a revised content module, confirms only that module is fetched, verifies that the deep link survives activation and that the revised essay is available offline. The route-isolation audit confirms that initial article navigation does not request Quotes, Research, or Search chunks, verifies all three load when opened, and simulates a missing route chunk to assert recovery without losing the original URL. Start the Vite production preview before this audit. The PWA audit uses headless Chromium to validate manifest fields and downloadable PNG icons, active service-worker control, precache, and a direct **offline first-essay deep link** at 375 and 1440 px. The cache-budget audit asserts the critical offline startup graph and bounds its size; the two-release update regression measures actual requests during a simulated incremental update, confirms its progress message, and preserves the original article deep link **and scroll offset**. The reading regression covers refreshes, immediate pagehide persistence, article section hashes, archive/article and manuscript/quotes history, mobile widths, deep manuscript positions, and fresh deep-link anchors. The standalone reading-performance benchmark runs 180 real browser scroll events per article/manuscript in a production build and guards against regressions to synchronous per-scroll geometry scans and storage writes. Its operation budgets measure work performed, not FPS or real-device responsiveness. The PWA audit additionally checks the correct insecure-origin warning on the LAN dev URL. Other app regressions:

```sh
bun run smoke
bun run audit:chrome
bun run audit:appearance
bun run audit:theme-haptics
bun run audit:dither
```

## Install on iPhone after HTTPS deployment

In Safari open the HTTPS site, choose **Share → Add to Home Screen → Add**, and launch from the Home Screen. The exact controls may depend on iOS version. No `beforeinstallprompt` API exists on iOS; do not create a fake one.

## Deployment considerations

Serve the contents of `dist/` over HTTPS at `https://journal.thedabcorner.site/`. All builds use the root `/` application base. Preserve:
- `<base>manifest.webmanifest` with `application/manifest+json` or a browser-compatible JSON type.
- `<base>sw.js` with a JavaScript MIME type, registration scope, and navigation fallback bounded to the application root.
- `<base>icons/*` and `<base>assets/*` as cacheable assets (hashed assets for long caching).
- `index.html` with short/no-cache revalidation, so clients discover updates.
- For Workers static assets, `public/_headers` specifies `no-store` for `sw.js`, revalidation for HTML/manifest and the stable `/journal-content.js` module, and immutable caching only for content-hashed `/assets/*`. The Cloudflare post-deploy audit verifies the exact editorial-module bytes and its revalidation response header, not merely the new service-worker bytes.
- Published articles use `/posts/<slug>/` paths, with generated static HTML for direct requests. The old `?post=<slug>` format remains compatible. Offline navigation uses the scope-bounded Workbox SPA fallback; no GitHub Pages mirror is published.
- No Service-Worker-Allowed header is necessary because the worker sits at the application root.

A locally accessible HTTP LAN preview may still be added as a basic Home Screen bookmark by Safari, but it is not equivalent to an HTTPS service-worker-backed offline PWA. Physical iOS Safari validation is a separate verification step.

## Cloudflare release automation

The only production site is `https://journal.thedabcorner.site/`, hosted by the `thelabjournal-live` Cloudflare Worker. The GitHub Pages deployment and its workflow were retired in November 2026. Publishing a Git commit does not update the production site unless Cloudflare deployment also runs.

`.github/workflows/cloudflare.yml` builds the **root-domain** release, deploys via Wrangler, and checks that the live service-worker bytes, HTML entry chunk, and no-store response header match that release. Its deployment job is initially disabled rather than producing broken CI runs before credentials exist. In the GitHub repo's Actions secrets, configure a scoped `CLOUDFLARE_API_TOKEN` (Worker deploy permission) and `CLOUDFLARE_ACCOUNT_ID`; then set repository Actions variable `JOURNAL_CLOUDFLARE_DEPLOY_ENABLED=true`. Future `main` pushes deploy **only** to Cloudflare. The variable can be disabled to suspend automatic publishing.

Use `bun run deploy:cloudflare` for an intentional local deployment. Because a deploy uploads **everything** currently in `dist/`, never publish an in-progress working tree merely to update service-worker behavior; confirm the complete article/manuscript release first. Neither upgrading the PWA nor deploying requires uninstalling it or deleting the user's local preferences/bookmarks.
