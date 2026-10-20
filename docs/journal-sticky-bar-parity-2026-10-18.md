# Journal entry sticky-bar parity

Implementation date: 2026-10-18. Canonical app: `lab-journal-prototype` at `http://localhost:11264/`.

## Recalled design contract

The manuscript reading experience previously moved from two disconnected controls to one coherent sticky toolbar: 44px desktop chrome; one 28px mobile row; 2px reading-progress underline; a searchable contextual section picker between the collection back link and compact icon-only actions; neutral zinc styling, short dense spacing, and a popup portaled outside scroll/clipping ancestors. The picker must not look permanently selected; the bar must remain sticky on desktop *and* mobile. The user explicitly wants these established manuscript interaction principles applied to journal entries **without turning the journal into a scientific paper layout**.

## Journal implementation

- `src/JournalSectionPicker.tsx`: flat editorial section picker using the established manuscript dialog/ScrollView appearance. Typed filter, section numbers, active marker, keyboard ArrowUp/Down/Enter/Escape, native touch, portal geometry bounded by bottom tabbar, dismissal on outside pointer/scroll/resize, focus restoration, orientation/breakpoint cleanup, and reduced-motion compliance.
- `src/journal-sticky-bar.css`: mobile 28px three-column bar (Journal, section picker, save/share), desktop 44px sticky bar (Journal, title, estimated time, save/share), 2px progress, neutral zinc states, no gradients or oversized borders, 24px mobile/28px desktop icon controls, clipping/overflow-safe widths and 320px support.
- `src/App.tsx`: journal readers now mount one compact section picker inside their sticky chrome and no longer render the legacy second in-article native select. Bookmark and share actions preserve their existing host integrations.
- Entry progress/active-section tracking is now one rAF-throttled GPU transform using cached entry bounds and binary search over section positions. `ResizeObserver` refreshes only after geometry changes, avoiding full section `getBoundingClientRect` scans on every touch scroll frame. Hash navigation retains native history and respects the combined sticky offset.
- Existing research manuscript reader and editorial article bodies remain structurally separate: flat story sections vs numbered scientific chapters/subchapters/equations/references.

## Verification

- `bun scripts/journal-sticky-parity-audit.mjs`: **27/27 responsive cases** for three distinct journal entries at 320, 375, 390, 430, 767, 768, 1024, 1440, and 1920px. Includes 15 mobile searchable-picker section jumps, 28/44px chrome, proportional start/middle/end progress, sticky behavior, menu placement, preserved article contents, zero overflow and no browser errors.
- Keyboard/focus and bookmark interaction smoke: **4/4** at 320/390/768/1440; mobile keyboard-open search autofocus, Escape focus restore, empty search, breakpoint close, save/unsave.
- Original `scripts/article-outline-audit.mjs` migrated to the new picker and passed desktop history and reduced-motion, related reading and mobile hash-navigation checks.
- Existing mobile scrollbar containment audit: **28/28**, including sticky journal chrome; rail remains out of top/bottom bars.
- `bunx tsc --noEmit` passes.
- `bunx vite build` with GitHub Pages environment passes. Large manuscript JavaScript chunks remain a separate optimization warning.
- A temporary **empty compatibility stylesheet** `src/manuscript-visual.css` was created because a concurrent manuscript UI change had added a dangling import. No visual rules were invented; the scientific styling continues to come from the existing CSS modules. The concurrent manuscript CSS author should replace that placeholder with their actual rules.

## Notes

The journal homepage, existing logo, global navigation, sidebar, theme modes and manuscript scientific layout were not redesigned. No commit or deployment occurred. The physical iPhone Safari overscroll regression remains a device validation boundary separate from the journal sticky-bar change.
