import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Installing a new worker must not require downloading every optional syntax
// grammar, manuscript widget, and illustration before a reader can proceed.
// Vite's manifest distinguishes static startup imports from dynamic imports.
function startupAssets() {
  type ViteChunk = { file: string, isEntry?: boolean, imports?: string[], css?: string[], assets?: string[] }
  const graph = JSON.parse(readFileSync(resolve(process.cwd(), 'dist/.vite/manifest.json'), 'utf8')) as Record<string, ViteChunk>
  const entry = Object.entries(graph).find(([name, chunk]) => name === 'index.html' && chunk.isEntry)
  if (!entry) throw new Error('Journal PWA: Vite entry manifest missing; refusing to ship an incomplete offline shell')

  const urls = new Set([
    'index.html', 'manifest.webmanifest', 'favicon.svg', 'favicon.ico',
    'favicon-16.png', 'favicon-32.png', 'favicon-48.png',
    'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
    'icons/apple-touch-icon.png', 'author-avatar-128.webp',
  ])
  const visited = new Set<string>()
  const include = (key: string) => {
    if (visited.has(key)) return
    const chunk = graph[key]
    if (!chunk) throw new Error('Journal PWA: missing static startup dependency ' + key)
    visited.add(key)
    urls.add(chunk.file)
    for (const asset of chunk.css ?? []) urls.add(asset)
    for (const asset of chunk.assets ?? []) urls.add(asset)
    for (const dependency of chunk.imports ?? []) include(dependency)
    // Dynamic imports are deliberately cached when a reader actually needs
    // them rather than blocking every app release.
  }
  include(entry[0])
  return urls
}

// The canonical Cloudflare Worker serves this application at the domain root.
const base = '/'

export default defineConfig({
  base,
  build: {
    manifest: true,
    // Stable framework code stays in a separately hashed cache entry across
    // article and manuscript releases.
    rollupOptions: {
      output: {
        // The Cloudflare origin can revalidate an unversioned content module.
        // Keep its import URL stable, so changing an essay does not invalidate
        // the otherwise unchanged application entry chunk. GitHub Pages lacks
        // configurable response headers, so its mirror uses hashed filenames.
        chunkFileNames(chunk) {
          if (chunk.name === 'journal-content' && process.env.GITHUB_PAGES !== 'true') {
            return 'journal-content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        manualChunks(id) {
          const modulePath = id.replace(/\\/g, '/')
          if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(modulePath)) return 'react-runtime'
          // Editorial entries are pure data. Keep them in a reusable,
          // independently hashed corpus rather than invalidating the
          // application code whenever an article is revised.
          if (/\/src\/(?:data|[a-z0-9-]+-post)\.ts$/.test(modulePath)) return 'journal-content'
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Manuscript and journal releases must activate on revisits, including
      // iOS home-screen installations. The previous prompt strategy could leave
      // an installed app displaying an outdated precached application shell.
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'favicon.ico', 'favicon-16.png', 'favicon-32.png', 'favicon-48.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'thelabjournal™',
        short_name: 'thelabjournal™',
        description: 'Independent research, engineering notes, and essays from the workbench.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#fafafa',
        theme_color: '#18181b',
        icons: [
          { src: 'icons/icon-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,png,webp,svg,ico,webmanifest,woff,woff2}'],
        // Avoid precaching all social PNGs and 12+ duplicate per-post HTML shells.
        // Social crawlers fetch the real static pages; offline app navigation
        // is handled by the existing index.html fallback.
        globIgnores: ['og/articles/**', 'og/quotes/**', 'posts/**', 'quotes/**'],
        manifestTransforms: [async (entries) => {
          const required = startupAssets()
          const manifest = entries.filter(({ url }) => required.has(url))
          const present = new Set(manifest.map(({ url }) => url))
          const missing = [...required].filter(url => !present.has(url))
          if (missing.length) throw new Error('Journal PWA: missing required offline assets: ' + missing.join(', '))
          const bytes = manifest.reduce((sum, entry) => sum + entry.size, 0)
          console.log(`[journal:pwa] startup precache: ${manifest.length} files, ${(bytes / 1048576).toFixed(2)} MiB; other assets cached on demand`)
          return { manifest, warnings: [] }
        }],
        runtimeCaching: [{
          // Workbox serializes this function into sw.js. Never close over Vite
          // config variables (such as `base`), which do not exist in the worker.
          urlPattern: ({ url, request }) => url.origin === self.location.origin &&
            url.href.startsWith(self.registration.scope + 'assets/') &&
            ['script', 'style', 'font', 'image'].includes(request.destination),
          handler: 'CacheFirst',
          options: {
            cacheName: 'journal-on-demand-assets-v1',
            cacheableResponse: { statuses: [0, 200] },
            // These URLs are content-hashed. An arbitrary 30-day TTL would
            // discard perfectly reusable bytes; bound by LRU entries instead.
            expiration: { maxEntries: 256 },
          },
        }],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: { host: '0.0.0.0', port: 11264, strictPort: true },
  preview: { host: '0.0.0.0', port: 11265, strictPort: true },
})
