# OpenFork article diagrams — editorial reconstruction

Revised: November 1, 2026
Article: `the-openfork-network-behind-one-oxp-connection`

## References and why the previous implementation failed

- [Diagram Design](https://github.com/cathrynlavery/diagram-design), MIT, skill: semantic choice before type, deletion first, one or two focal points, 4px geometry, connective paths with meaning. Its own guidance warns specifically against identical boxes for every node, generic three-card layouts, and reproducing automatic Mermaid spacing.
- [SVG Diagram](https://github.com/pkt-lab/svg-diagram), MIT: measure-to-text, plan connectivity before drawing, check collisions, render and visually inspect the result.
- The journal's own foreground, muted and rule tokens provide the actual identity. Do not paste an imported skill's default palette, headings, typefaces, or ornaments over the journal.

The earlier on-site diagrams were overly tall UI cards. The double frame around each figure, repeated card borders, generous internal padding, tiny technical labels, and mechanically forced aspect ratios obscured their purpose. Browser overflow checks passed because boxes fit, not because the diagrams looked or communicated well. The mobile screenshot of Figure 02 showed this failure clearly.

The unmerged `fix/diagram-design-openfork-integration-20261026` branch previously introduced a useful conceptual correction: different caller principals should be visibly separate, and capability routes should be directly traceable. That reasoning is retained, not a wholesale merge of its iframe-based HTML assets.

## Design decisions

1. Each schematic uses one layout type matched to its argument: a two-principal capability topology, a two-caller convergence, an MCP lifecycle timeline, a federated-host boundary, and a real authorization matrix.
2. Remove the inherited `research-figure` card wrapper and the redundant inset panel. A title, single pair of hairline rules, content and a caption suffice.
3. Replace stacked padded cards with minimal typographic structure, precise straight connectors, and one focal node where topology requires it. Do not draw an enclosing card just because the object has a label.
4. Avoid arbitrary aspect ratios. The diagram's intrinsic content dictates its height. CSS reflows at mobile widths; output remains native, text-selectable HTML.
5. Preserve the journal's zinc/Inter theme tokens in light and dark mode, without external fonts, shadows, glow, illustrations, eyebrow labels or client-side diagram libraries.
6. The code makes explicit the distinction between external OXP grants, native Session permissions, and target OFXP peer grants. Do not represent remote worker creation or peer messaging as dispatched capabilities.

## Files

- `src/components/InterconnectionNetwork.tsx` — explicit two-principal / five-capability topology.
- `src/components/OXPArchitectureFigures.tsx` — five diagrams with independent captions and semantic structure.
- `src/components/oxp-architecture-figures.css` — content-sized, responsive editorial layout.
- `scripts/oxp-architecture-audit.mjs` — browser geometry, content, 320–1440px page overflow and clipping checks.
- `scripts/oxp-architecture-layout-audit.mjs` — compatibility entrypoint.

Visual review must inspect screenshots at representative phone and desktop widths, in both journal color schemes. A passed typecheck or bounds test alone is not evidence of design quality.
