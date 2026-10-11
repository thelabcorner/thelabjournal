# Journal Chrome V3

## Interface

thelabjournal™ is a persistent content application, not a set of landing pages.

- Desktop: gallery-inspired dual rail (52 px icon strip + expanded collection panel). Collapse state persists locally. The quick rail links to writing, topic views, saved entries and preferences.
- Archive: four live counters (entry count, indexed topics, editorial draft count, device-local bookmarks), searchable list/card display, type/date fields, stage labeling, sorting and topic filters.
- Mobile: dedicated Browse sheet with search, Collections/Recent writing switch, subject grid, contextual recent entries, saved library, preferences and swipe-down dismiss gesture. Bottom navigation remains available when the sheet is closed.
- Reader: persistent back/action toolbar, reading progress, contents navigation, adjustable reading type and calibrated status labels.
- Preferences: reading type size, archive layout, and tactile feedback. All are functional and persisted locally where browser storage is accessible.

## Actual WebHaptics V2 integration

The project uses source from https://github.com/thelabcorner/webhaptics-v2, specifically commit bc33ba86815a00f591e96dedc72ad3024f90b4d2. It is not the web-haptics npm package, which may resolve to the upstream V1.

Vendored files are in src/vendor/webhaptics-v2/core with MIT license and NOTICE.md. Only the core engine is imported. The only source-level compatibility fix removes an unused Promise reject argument to satisfy the journal TypeScript check.

src/haptics.ts supplies an application-level singleton. The engine is lazily constructed synchronously in the first direct user interaction, retaining the transient user activation required for the iOS native WebKit switch fallback. Cues are used for navigation, bookmarks, copy confirmation, and preferences; default intensity is restrained. The app remains fully operable without tactile support. A persistent opt-out is available, and the engine respects reduced-motion settings.

## Evidence

Run:

    bun run build
    bun run smoke
    bun run audit:chrome
    bun run audit:dither
    bun run audit:visual

audit:chrome uses Chrome and an injected navigator.vibrate spy to validate V2 engine invocation and preference behavior; it verifies reduced-motion suppression and disabled feedback. This is software behavior evidence, not evidence of physical haptic output on iOS hardware. Real iOS Safari must be checked on a device.

The journal maintains WebSeal's light-only zinc/New York rules. No decorative gradients, dark modes, unverified published claims or fabricated metrics have been introduced.

## Delayed navigation haptics and appearance

- Every bottom-bar action (Journal, Browse, Saved, Search) schedules a **60 ms** WebHaptics V2 onset delay without delaying navigation. Opening an article schedules a **75 ms** onset delay. The engine still triggers within the original user gesture.
- The vendored V2 conductor previously discarded leading silence and assigned internal gaps incorrectly. This copy now preserves initial and inter-pulse delays in segmentsToRelativeVibrations. This change has not been pushed to the upstream WebHaptics repository.
- Mobile Browse child actions no longer emit duplicate selection cues on top of their parent navigation or article-opening cue.
- Appearance includes System, Light and Dark. Pre-React bootstrap prevents bright first paint when dark is selected, and System follows device changes. Quick toggles live in the desktop header and mobile Browse footer.
- Dark mode consistently styles the archive, reader, research figures, menus, dialogs, bottom navigation and dither; no decorative gradients.
- Run bun run audit:theme-haptics to verify patterns, persistence, preference changes, opt-out and reduced motion. Instrumented navigator.vibrate tests do not establish physical iOS tactile output.

## Appearance selector V4

The appearance control now uses three compact, self-contained miniature journal frames: split light/dark for System, bright zinc for Light, and charcoal zinc for Dark. Visual selection uses one border, an inset ring and a compact checked indicator, with accessible pressed states and no floating icons. The control preserves the underlying System/Light/Dark persistence and respects small-device widths. Scoped styles: src/appearance-control.css.

Run bun run audit:appearance for the selector audit, covering 320, 375, 430, 768 and 1440 CSS pixels, selection states, label truncation and viewport overflow in both themes.
