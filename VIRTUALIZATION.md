# Journal virtualization

## Objective and policy

thelabjournal™ retains fast, accessible direct rendering for small collections. **TanStack Virtual 3.14.14** activates once a rendered collection reaches **24 entries**. The project currently indexes nine articles, so the normal archive, mobile menu and search dialog do **not** load virtualization code.

This is deliberate: virtualizing nine static elements costs more than rendering them and sacrifices browser Find behavior and navigation simplicity for no meaningful rendering savings.

| Surface | Behavior | Implementation |
| --- | --- | --- |
| Archive list | Document/window virtualizer at 24+ *visible* entries | `src/components/WindowedArchive.tsx` |
| Archive card grid | Same document virtualizer; each virtual row groups one or two cards based on breakpoint | `src/components/WindowedArchive.tsx` |
| Saved entries | Uses same archive view and windowed list/card renderer | `src/App.tsx` |
| Filtered and sorted archive | Same renderer; keyed by stable entry slug and measured after list changes | `src/App.tsx` |
| Search dialog | Element virtualizer at 24+ results, normal buttons for smaller sets; keyboard selection scrolls into view | `src/components/WindowedPane.tsx` |
| Mobile Browse → Recent writing | Element virtualizer at 24+ entries; full chronological list rather than a six-entry artificial cap | `src/components/MobileNavigator.tsx` |
| Topic navigation, sidebar's five recent links, related pair, editorial status, desktop rail | No virtualization (small bounded navigation/UI) | Existing direct markup |
| Full article prose, article section anchors, mobile section picker and desktop TOC | **Never virtualized** so browser Find, links, copy, printing, selection, and long-form reading retain native behavior | `src/App.tsx` |

### Architecture

- The archive virtualizes the **window**, preserving the normal page scroll and existing sticky headers. It does not create an inner vertical scroll area.
- `scrollMargin` comes from the list's document position and is updated by `ResizeObserver` on earlier layout regions and by viewport resize. Each row is dynamically measured with `virtualizer.measureElement`, with calibrated initial size estimates and five rows of overscan.
- Cards group equal-index pairs into **grid rows**, not shortest-column masonry lanes. Reading order is stable across filter/sort/responsive changes.
- The phone breakpoint is 767 px. List estimates are 104 px (phone) / 78 px (desktop); card-row estimates are 154 / 182 px. These are only starting estimates, replaced by measured sizes.
- React 19 uses `useFlushSync:false` to avoid flushSync-during-lifecycle warnings.
- The archive exposes `role=list` and per-item `role=listitem`, `aria-posinset`, and `aria-setsize`; virtual wrapper layers are presentational.
- Search and Browse panes use independently scrollable, height-measured element virtualizers. Their rows preserve existing click, text and keyboard behavior.
- Virtual components are **lazy chunks**. Even the Browse sheet does not load the virtualizer on a small recent list. Hover/focus prefetch on `Show all` helps avoid a visible archive handoff.
- App-level navigation restores archive position with explicit instant scrolling, not a potentially thousands-of-pixels-long animated scroll.
- All dynamic chunks are included in the generated Workbox PWA precache for offline use.

### Performance evidence (synthetic, not real page-load claims)

An independent Vite fixture (`virtual-fixture.html`) renders 1,500 varying-length, fully interactive archive entries. Chromium / Playwright compared direct rendering and windowed rendering in four runs per condition, alternating run order. The figures below are *development-mode* measurements.

| Metric | 375 px direct | 375 px virtual | 1440 px direct | 1440 px virtual |
| --- | ---: | ---: | ---: | ---: |
| Mounted archive entries at start | 1500 | 11 | 1500 | 13 |
| Entire DOM element count | 16591 | 235 | 16593 | 263 |
| Median fixture React commit elapsed | 777.6 ms | 43.3 ms | 644.1 ms | 37.4 ms |
| Measured V8 JS heap after GC | 17.30 MB | 4.61 MB | 17.26 MB | 4.71 MB |

This is **98.58% fewer initial DOM elements on mobile** and **98.41% fewer on desktop**. It does not establish equivalent reductions in network startup, a device-specific frame rate, or the existing nine-entry production workload.

Measured deep scroll (large data) mounts ~19–23 list entries around the viewport. Search and Browse stress panes each hold roughly 14–16 items, rather than 1,500. The tests validate far-scroll, reversed order, responsive card pairing, shrink and restoration of the view, scroll-to-selected search result, and reaching the final item.

Initial app JS remains roughly **175.5 KB gzip**, with the virtualizer implementation separated into on-demand chunks. The production build still has a >500 KB minified entry warning; this change does not address the larger dependency budget.

### Validation

Start the Vite dev server on 11264 before running:

```sh
bun run build
bun run audit:virtualization
bun run bench:virtualization
bun run smoke
bun run audit:chrome
bun run audit:theme-haptics
bun run audit:pwa
```

For production network-path auditing, also start `bun run preview -- --port 11265` after a fresh build, then run `bun run audit:virtual-cold` and `bun run audit:virtual-pwa`. It confirms the current nine-entry first load, nine-result Search, and nine-entry mobile Browse do not fetch the TanStack code.

All stress data are test-only; `virtual-fixture.html` is excluded from the normal Vite production entry and is not part of the user-facing journal UI. JavaScript bundle size, test page performance, and PWA precache size should be checked after adding substantial article content.

### Known tradeoffs

- On long virtual archives, the browser's native Find command can only inspect **currently mounted** result rows. Use the journal's built-in search/filter to find arbitrary entries. Individual articles always remain fully mounted.
- Large-result transitions might briefly display a loading state on an uncached first request for the on-demand virtualizer; the ordinary nine-entry journal is unaffected.
- Large, dynamic data still needs further testing on physical iPhone Safari and as a Home Screen PWA; headless Chromium checks cannot establish device-specific scroll or haptic behavior.
