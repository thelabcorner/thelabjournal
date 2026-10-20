# iOS scrollbar rubber-band correction and compositor interpolation

Scope: existing `lab-journal-prototype` at `http://localhost:11264/` (same app, no new preview). October 18, 2026.

## Observed user regression

The user's 24.7-second iPhone screen recording shows rapid manuscript scrolling, repeated movement of the journal's mobile sticky toolbar, and an unstable long-document scrollbar/scroll position around elastic overscroll. The original component mixes a custom fixed scrollbar with a window scroll owner.

Two plausible independent causes were identified directly in source:

1. **Scroll-dependent sticky anchor poisoning.** `CenteredScrollbar` previously computed a research section selector's document coordinate from `getBoundingClientRect().top + window.scrollY`. On iOS rubber-band `window.scrollY` can legitimately be negative or greater than the maximum, while the visual viewport and sticky elements move independently. Re-measuring then makes the fixed scroll track jump or become detached.
2. **Touch capture at the mobile edge.** The 12px-wide mobile scrollbar had `touch-action:none` and an interactive pointer handler that called `window.scrollTo()` on pointer-down. This could turn an ordinary edge swipe into a seek deep inside a 70,000px+ manuscript.

The first explains corrupted track state and the second is a direct possible explanation for large unexpected jumps.

## Production implementation

- Mobile track top is derived from the fixed header and the **whole** sticky article/manuscript chrome height. The sticky reader is measured on ResizeObserver events, with a bounded 6px gap protecting child overflow. The track's bottom remains immediately above the mobile tabbar. Scroll frames never recalculate a document anchor from sticky viewport coordinates.
- Both `window.scrollY < -1` and `window.scrollY > maxScroll + 1` are treated as elastic. During that phase, the thumb is visually suppressed, scroll values are clamped, and size/anchor recalculation is deferred until real scrolling resumes. A `scrollend` listener also triggers a final measurement.
- The mobile track is visually present but `pointer-events:none; touch-action:pan-y`. Native iOS touch, momentum and edge gestures are never captured. The handler additionally rejects `pointerType='touch'` defensively. Desktop mouse/keyboard scrollbar interaction remains intact.
- **Smooth motion:** one rAF-driven GPU transform per frame, with frame-rate-independent exponential catch-up `1-exp(-dt/tau)`, adaptive approximately 20–40ms response time, no overshoot, and a stop threshold of 0.2 CSS px. Snap on direct interaction, geometry changes, overscroll recovery and `prefers-reduced-motion`. Loop cancels on unmount.
- No per-frame React reconciliation or layout measurements in the normal mobile scrolling hot path.

## Measured verification

Run from repository root with the development server at `0.0.0.0:11264`:

```powershell
bunx tsc --noEmit
bun scripts/ios-rubberband-scrollbar-audit.mjs
bun scripts/mobile-scrollbar-motion-audit.mjs
bun scripts/mobile-scrollbar-containment-audit.mjs
bun scripts/frame-scrollbar-audit.mjs
```

- Synthetic negative and beyond-end Safari `scrollY` and recovery **12/12** route/viewport combinations. This tests freeze/restore even when the main document is many thousands of pixels long, across both scientific manuscripts, a journal article and the homepage.
- Motion benchmark **9/9** cases at 320, 390 and 430px, no backward interpolation and no overshooting bounds, median rAF interval **16.6–16.7ms** (Chromium host; not an iPhone rendering guarantee).
- Mobile geometry and in-modal ScrollView **28/28** viewport/page cases (320–767px, variable heights) after extending the scientific toolbar measurement, including content scroll to middle/end.
- Existing desktop frame scrollbar audit **16/16** cases (four widths x light/dark x index/article), plus mobile 375px containment check.
- Real simulated touch tap on right-edge rail while scrolled showed 0px scroll movement, whereas the old component could issue a full-document seek.
- TypeScript and Vite production build passed; the existing manuscript bundle size warnings are unrelated to this change.

## Remaining verification boundary

The user-provided screen recording was inspected, but actual iOS Safari on the user's physical phone is not connected to the test host. The injected overscroll readings are a controlled Chromium regression, not a substitute for real Safari touch/visual-viewport testing. The owner should repeat the exact rapid edge-swipe / pull-past-top / push-past-bottom sequence in iOS Safari at the existing LAN development address. Do not claim an iOS device pass until reproduced there.

No commit, new website, or deployment made.
