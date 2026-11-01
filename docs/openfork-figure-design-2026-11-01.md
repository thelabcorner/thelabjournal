# OpenFork figure system — editorial design notes

Revised: 2026-11-01
Article: `the-openfork-network-behind-one-oxp-connection`

## Why these figures replaced the previous system

The first published figure used an eight-node network with eleven curved and diagonal routes. The topology was difficult to trace visually, particularly on phones. Four subsequent figures repeated stacked cards and decorative micro-labels. Their geometry was dictated by fixed 9:16 / 16:9 artboards rather than the information that needed to fit.

A separate `fix/diagram-design-openfork-integration-20261026` branch had already identified the better topology: five capability families, two independent callers and direct edges with explicit authority boundaries. That branch's HTML/SVG assets were consulted, but not merged wholesale; it predates a later editorial publication commit and its embedded iframe would isolate diagram text from the article DOM.

## Editorial design contract

- The diagram exists to explain a specific mechanism. The page title and caption provide context. No secondary marketing headline, fake metric, eyebrow, scene, animation or avatar belongs inside the diagram.
- Use the journal's own surface and foreground tokens, paired with restrained tabular monospaced numerals, hairline rules and Inter for content. This is computational printmaking with precise engineering semantics, not terminal cosplay.
- Preserve selectable, accessible source text. Use semantic HTML and CSS connectors. Do not rasterize diagrams or embed external or sandboxed iframes.
- Different architectural questions need different figures: paired-route topology, two-caller domain convergence, MCP connection lifetime, independent OFXP host boundaries, and authority matrix.
- Show where capabilities overlap without conflating permission scopes. `ChatGPT / OXP`, a native `Session`, and an OFXP `peer` are distinct principals. Authorization occurs before executing the shared service.
- Do not depict remote-worker creation or OFXP peer messaging as implemented. These are not currently executable remote dispatchers in the audited architecture.
- Let the composition grow vertically on mobile rather than scaling down a desktop schematic. Never hide labels to preserve a predetermined aspect ratio.
- Maintain high information density without relying on tiny text. Figures must remain useful at 320 px and at desktop width, in light/dark site modes and print.

## Files

- `src/components/InterconnectionNetwork.tsx`: the five-row native topology.
- `src/components/OXPArchitectureFigures.tsx`: five figure compositions and figure metadata.
- `src/components/oxp-architecture-figures.css`: unified responsive journal design.
- `scripts/oxp-architecture-audit.mjs`: Chrome audit for page errors, clipping, overflow, accessible native figures, route counts, host count and scope matrix at nine viewport widths.
- `scripts/oxp-architecture-layout-audit.mjs`: compatibility entrypoint to the same browser checks.

The historical `fix/diagram-design-openfork-integration-20261026` branch was not discarded or force-merged. Its accurate independent-route premise has been incorporated without regressing the current main branch's unrelated changes.
