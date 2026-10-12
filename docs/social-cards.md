# Article social cards / GitHub Pages

Each registered journal entry gets its own 1200 × 630 Satori + Resvg PNG and a real GitHub Pages article URL. Article HTML is generated at build time, so LinkedIn, Slack, Discord, X, Facebook and other link preview bots can read article-specific metadata without executing JavaScript.

## Canonical route

https://thelabcorner.github.io/thelabjournal/posts/<slug>/

Legacy links at ?post=<slug> still load in the React reader and are upgraded in the browser. A static GitHub Pages host cannot emit distinct server-side Open Graph tags for the old query-string URLs. Copy or share the canonical path links.

## Source of truth

Entries are enumerated directly from src/data.ts (including imported entry modules). New entries need a unique URL-safe slug, title, summary, topic, issue, date, and figure. No per-post config or image registration is required. Journal 004 keeps its canonical Markdown draft and sync script; the entry module remains the source consumed by the OG renderer after sync.

## Build flow

1. bun run build syncs the Markdown-backed Journal 004 entry.
2. The existing homepage OG generator creates public/og-image.png.
3. scripts/article-social.mjs generate renders every entry as deterministic Satori SVG, then PNG via Resvg. Images are placed in public/og/articles, then copied to dist by Vite.
4. Vite builds the React reader.
5. scripts/article-social.mjs pages writes dist/posts/<slug>/index.html with article:title, description, published date, canonical, absolute versioned PNG OG links, Twitter cards, and the original Vite JS/CSS application assets.
6. scripts/article-social.mjs audit checks PNG signatures/dimensions, manifest hashes, article metadata, and app bootstrap. bun run audit:og additionally regenerates and compares image digests for determinism.

Generated PNG files are not manually maintained in Git. The build owns the public/og/articles directory. GitHub Actions deployment and pull-request CI both run the same build and verification. The PR job uploads a gallery of generated PNGs as an artifact for design review.

## Design contract

Inter sans-serif; grayscale shadcn-zinc surfaces; New York-style spacing; thin borders and precise editorial typography; restrained technical motifs derived deterministically from each entry's research figure. No gradients, stock photos, AI-generated imagery or remote assets. Generators must keep social title and summary legible at 1200 × 630 and preserve branding across all articles.

## Regression hazards

- Static hosting requires physical HTML entrypoints; changing back to query-only sharing breaks metadata.
- Vite emits base-prefixed asset URLs for Project Pages. Routes must point to those paths, not to relative ./assets.
- Renaming an article slug breaks old external links. Prefer stable slugs.
- OG caches can persist. URLs include a content-derived image hash query string so changed images get fresh cache identities.

## Delivery verification

The deployment and pull-request workflows start a local Vite preview server in GitHub Pages mode, fetch every physical `/posts/<slug>/` URL and PNG over HTTP, assert correct content types and canonical metadata, and check legacy query links still return the application shell. The PWA precache deliberately excludes generated OG PNGs and duplicate article HTML shells; the application remains available offline through its indexed navigation fallback.


## Snapchat and cross-platform sharing

Snapchat's [official URL Preview Service documentation](https://developers.snap.com/robots) says it reads `og:title` and `og:image` first. If Open Graph metadata is unavailable, it falls back to `twitter:title` and the **legacy** `twitter:img:src` key. The build supplies all of these for **every article and the homepage**, plus the broadly used `twitter:image` and `twitter:image:src` keys. These keys all resolve to the **same hashed Satori PNG**, rather than creating duplicate platform-specific images. There is no documented need for a separate `snapchat:*` namespace or Snapchat developer credentials for a normal shared URL.

- Snapchat (including shared web links): Open Graph title/image + legacy Twitter fallback; Snap documents a **30-minute URL preview cache**.
- Instagram DMs, Facebook, LinkedIn, Discord, Slack, WhatsApp, Telegram, Signal, Reddit and Pinterest: ordinary publicly accessible Open Graph HTML and image resources; exact appearance and caching are provider-controlled.
- X/Twitter: `twitter:card=summary_large_image`, title/description/image, plus Open Graph.
- iMessage / Apple Messages: Open Graph preview images and the existing `apple-touch-icon`. Apple can render different crops and may prefer graphic-focused imagery on compact surfaces.

All routes serve static crawler-readable HTML with HTTPS absolute image URLs, titles, summaries, image dimensions and descriptive alt text; no JavaScript, login, redirects or user-agent switching is necessary. The artwork stays **1200 × 630 PNG** for broad compatibility. Cropping and card presentation vary among apps; a single OG image does not make native photo posts or Snap camera sticker shares.

The HTTP audit now fetches every article route using nine representative crawler user agents to catch missing static metadata; this verifies the **site response**, not a remote platform's cache or proprietary preview renderer. Snapchat can keep showing an older preview until its own cache expires.
