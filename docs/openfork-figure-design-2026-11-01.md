# OpenFork article figure system — NCM visual parity

November 1, 2026
Article: `the-openfork-network-behind-one-oxp-connection`

## Visual authority

The authoritative visual reference is the existing journal's `JournalFigure` component, especially the two-panel neural-field/E Ink illustration and its mobile rendering. It defines the brand's scientific, modern-computational-nostalgia language: a softly rounded outer research plate; muted numbered figure header with selective dither; an editorial title; a separate vector illustration surface with rounded corners; and a contrasting inset-caption band.

The portfolio shares restrained neutral zinc, deliberate negative space, soft geometry, subtle procedural point fields and native vector artwork. Neither the diagram-design skill's unmodified palette nor generic Mermaid cards should override these sources.

The earlier OpenFork designs failed because they resembled dashboard widgets and raw unstyled topology notes. Excessive rectangular frames, fake technical eyebrows, too many tiny badges and text-only tables made the figures visually unlike the rest of the journal. Reducing padding alone did not address the underlying problem.

## Source-backed design research

- Diagram Design: https://github.com/cathrynlavery/diagram-design (MIT) — deliberate focal points, deleting connections that do not contribute information, distinguish semantic roles, don't reproduce Mermaid's automatic graph spacing.
- Diagram Design architecture reference: https://github.com/cathrynlavery/diagram-design/blob/main/skills/diagram-design/references/type-architecture.md — group by trust boundary, orthogonal routes when explicit routing is required.
- SVG Diagram: https://github.com/pkt-lab/svg-diagram — prefer native SVG and visual render review to aesthetically unverified source generation.

These are reference techniques, not substitute branding.

## Architecture and editorial choices

Five separate figures answer different questions. Each is one source-owned, semantic SVG illustration with native, selectable supporting text and a substantive caption:

1. Two independent entry routes connect to five OpenFork capability families. Solid and dashed strokes differentiate external/native entry; they do not imply shared grants.
2. An external OXP caller and native Session caller converge on one domain implementation after independent authorization.
3. The on-demand MCP lifecycle uses a smooth, consecutive visual track and compact state descriptions, rather than four oversized boxes.
4. Two distinct OpenFork hosts use an authenticated OFXP bridge; pairing is not blanket authority.
5. Identity, route authorization and action scope intersect before the shared implementation executes.

The diagrams are conceptual rather than execution traces or measurements. Don't claim OFXP remote worker creation or peer messaging are dispatched.

### Presentation contract

- Reuse `research-figure jf-figure`, `figure-top jf-top`, `jf-body`, `jf-title`, and `jf-caption` rather than authoring an incompatible diagram frame.
- Match existing 8px rounded outer surfaces and 6–7px rounded inset illustrations. Use tapered curved paths, circular terminals, explicit dashed routes and soft line weights.
- Use Inter for text, numeric tabular precision where relevant, and journal foreground/muted/card/inset tokens for responsive light/dark rendering.
- Treat illustrations like technical plates, not control panels. No eyebrow labels, decorative icons, fabricated performance data, 3D effects, glowing palettes, rendered assets or external image requests.
- Never rasterize diagrams or generate static images. SVG source is in the React figure component.
- Do not force 9:16 or 16:9 on textual figures. Content determines intrinsic height; layout responds at 320px and desktop.
- The user's supplied journal screenshot is the design oracle, not a mere screenshot to imitate verbatim.

### Validation

`bun run typecheck`, `bun scripts/oxp-architecture-audit.mjs` (twelve browser combinations with light/dark and 320–1440px widths), `bun run build`, followed by actual browser screenshot inspection. Validate source/caption completeness, no visible clipping or horizontal overflow, rendered SVG presence and the canonical outer figure shell.

Changes are isolated in the dedicated `lab-journal-diagrams-20261101` worktree so the older dirty main checkout remains untouched.
