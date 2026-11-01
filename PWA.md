# thelabjournal™ — PWA

The journal is packaged as a standalone, installable Progressive Web App. Its source and production build are separate from the Vite development preview.

## Production behavior

- The Vite PWA plugin emits `manifest.webmanifest` with name, start URL, same-origin scope, app ID, standalone display, and 192/512/maskable icons.
- The navigation's four-tile logo is the canonical source of truth in `src/lib/brandMark.ts`. `bun run generate:pwa-icons` regenerates its SVG, 16/32/48 PNG and ICO favicon variants, the 180 px Apple touch icon, 192/512 PWA icons, and a genuinely safe-zone-inset maskable 512 icon. These are committed assets; deployment validates them with `bun run audit:icons`.
- A Workbox service worker precaches the generated static site, article data, CSS, scripts, and images. Article links use `?post=<slug>`, and a cached `index.html` supplies offline SPA navigation.
- The React root registers the worker and checks for updates when the installed app starts, resumes, becomes visible, comes online, and every five minutes while open (with foreground-check throttling). Workbox activates the updated worker and Vite reloads the app automatically; `beforeinstallprompt` remains captured before Preferences opens.
- Preferences shows an Install button when supported, iOS Safari's Add to Home Screen steps when applicable, or an accurate HTTPS requirement on LAN HTTP.
- Appearance, bookmarks, and reading preferences remain browser-local; they do not synchronize between devices.
- Service workers and installability are secure-context features. Production must use a trusted `https://` hostname. `http://localhost` works for desktop development/testing; `http://192.168.1.70:11264/` does **not**.
- Installation and offline caching require at least one successful online visit over a secure origin. Updates apply without manual cache clearing; release activation can briefly reload an active reading session.
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
bun run audit:pwa-update
```

The PWA audit uses headless Chromium to validate manifest fields and downloadable PNG icons, active service-worker control, precache, and a direct **offline first-essay deep link** at 375 and 1440 px. It additionally checks the correct insecure-origin warning on the LAN dev URL. Other app regressions:

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

Serve the contents of `dist/` over HTTPS at the intended origin. GitHub Pages builds use the `/thelabjournal/` application root, while local and custom root-domain builds use `/`. Preserve:
- `<base>manifest.webmanifest` with `application/manifest+json` or a browser-compatible JSON type.
- `<base>sw.js` with a JavaScript MIME type, registration scope, and navigation fallback bounded to the application root.
- `<base>icons/*` and `<base>assets/*` as cacheable assets (hashed assets for long caching).
- `index.html` with short/no-cache revalidation, so clients discover updates.
- For Workers static assets, `public/_headers` specifies `no-store` for `sw.js`, revalidation for HTML/manifest, and immutable caching only for content-hashed `/assets/*`.
- The app uses query-parameter article deep links so GitHub Pages needs no path rewrite. A future path-based router will require a fallback strategy.
- No Service-Worker-Allowed header is necessary because the worker sits at the application root.

A locally accessible HTTP LAN preview may still be added as a basic Home Screen bookmark by Safari, but it is not equivalent to an HTTPS service-worker-backed offline PWA. Physical iOS Safari validation is a separate verification step.

## Cloudflare release automation

The canonical `https://journal.thedabcorner.site/` site is hosted by the `thelabjournal-live` Cloudflare Worker, **not** the GitHub Pages deployment. `.github/workflows/pages.yml` only updates the legacy `/thelabjournal/` mirror. Publishing a Git commit does not update the canonical site unless Cloudflare deployment also runs.

`.github/workflows/cloudflare.yml` builds the **root-domain** release, deploys via Wrangler, and checks that the live service-worker bytes, HTML entry chunk, and no-store response header match that release. It is initially disabled rather than producing broken CI runs before credentials exist. In the GitHub repo's Actions secrets, configure a scoped `CLOUDFLARE_API_TOKEN` (Worker deploy permission) and `CLOUDFLARE_ACCOUNT_ID`; then set repository Actions variable `JOURNAL_CLOUDFLARE_DEPLOY_ENABLED=true`. Future `main` pushes deploy both targets independently. The variable can be disabled to suspend automatic Cloudflare publishing.

Use `bun run deploy:cloudflare` for an intentional local deployment. Because a deploy uploads **everything** currently in `dist/`, never publish an in-progress working tree merely to update service-worker behavior; confirm the complete article/manuscript release first. Neither upgrading the PWA nor deploying requires uninstalling it or deleting the user's local preferences/bookmarks.
