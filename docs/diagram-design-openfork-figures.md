# OpenFork diagrams — Diagram Design integration

Source: [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design), MIT, diagram-design skill v2.6. The two HTML files under `public/diagrams` are first-class **self-contained HTML + inline SVG** editorial outputs, following the skill's design-system, architecture/integration, semantic-label and connector rules. They are not imported Mermaid layouts.

## Design intent

**OpenCode supplied the original agent harness.** OpenFork expands that runtime by connecting other systems to it. The central question is which independently authorized callers can reach which OpenFork capability.

Figure 1 therefore uses a five-row **integration topology**, with one directly traceable, horizontal arrow per caller per capability. The left access route is ChatGPT through OXP; the right is a native OpenFork Session. The five rows are native tools, existing Sessions, worker delegation, configured MCP integrations, and OFXP peers. The paired OFXP host and worker Session are distinct follow-on outcomes, not additional arrows crammed into the same figure. The detailed later figures explain those two branches and their permission boundaries.

Unlike the retired figure, this diagram uses **zero curved, diagonal, overlapping or behind-node connectors**. Ten direct arrows, five capability rows, independent origin labels, and an explicitly named destination per row provide a complete and readable summary.

## Responsive editorial assets

- `openfork-integration-portrait.html`: 360×640 viewBox (9:16). Readable labels on a phone, no horizontal scrolling.
- `openfork-integration-landscape.html`: 1280×720 viewBox (16:9). Independent left and right route lanes.
- Both adapt to `prefers-color-scheme` and use the Journal's neutral zinc typography, contrast and no-shadow visual style.
- Both have native SVG title/description; the article gives each iframe a contextual `title`. They are sandboxed static documents with no scripts.
- The article's Vite `BASE_URL` builds correct paths both at the domain root and when deployed beneath a GitHub Pages repository prefix.

## Review gate

Verify both standalone diagrams as well as the embedding article. Test the portrait design at 320, 375 and 430 CSS-pixel viewports and the landscape design at 700, 768, 1024 and 1440. Confirm exactly five rows, ten independent horizontal arrows, no unexpected page overflow, correct mobile/desktop selection and correct source URLs.

Do not merge a future "network graph" with untraceable long-range paths into this design. If connections no longer fit, split the architecture into another figure or a topology/matrix detail. Keep external OXP grants separate from native Session and remote OFXP permission scopes.
