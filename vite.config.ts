import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Project Pages hosts the application beneath /thelabjournal/. Keep local
// development and previews at / so the existing audits remain representative.
const base = process.env.GITHUB_PAGES === 'true' ? '/thelabjournal/' : '/'

export default defineConfig({
  base,
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
        globPatterns: ['**/*.{html,js,css,png,svg,ico,webmanifest}'],
        // Avoid precaching all social PNGs and 12+ duplicate per-post HTML shells.
        // Social crawlers fetch the real static pages; offline app navigation
        // is handled by the existing index.html fallback.
        globIgnores: ['og/articles/**', 'posts/**'],
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
