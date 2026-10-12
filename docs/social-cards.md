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
