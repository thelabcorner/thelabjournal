# WebHaptics V2 — vendored core

Source: https://github.com/thelabcorner/webhaptics-v2
Pinned source commit: `bc33ba86815a00f591e96dedc72ad3024f90b4d2`
Subdirectory: `packages/web-haptics/src/core`

The journal intentionally integrates the **user's experimental V2 fork**, not the `web-haptics` npm package, which may still point to the upstream V1 library. This source copy includes the core conductor, vibration actuator, WebKit switch simulation, preset registry and scheduling implementation. It does not bundle unused Vue/Svelte/React adapters, examples or test dependencies.

All V2 core source files are copied unchanged with one compatibility fix in `core/scheduler.ts`: removal of the unused `reject` parameter in a Promise executor, required by the journal's TypeScript `noUnusedLocals` rule. The shipped upstream and project license is the MIT license included in `LICENSE`. The V2 fork is derived from Lochie Axon's original `lochie/web-haptics`; upstream authorship and copyright remain acknowledged.

The journal's integration is in `src/haptics.ts`: one lazily constructed core engine, direct synchronous initiation on user input (important for iOS WebKit), a persisted opt-out, built-in reduced-motion behavior, and graceful no-op behavior on unsupported devices.

To refresh: compare with the pinned upstream commit and test behavior on real iOS Safari. Avoid replacing this vendored source with the unrelated upstream npm package.
