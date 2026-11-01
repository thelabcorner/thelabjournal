# OpenFork article — illustrating implementation reuse

November 1, 2026
Article: `the-openfork-network-behind-one-oxp-connection`

## The argument the diagram must communicate

OpenCode supplies the underlying agent harness; OpenFork expands it through native tools, native Sessions and workers, connected MCP integrations, OXP's external ChatGPT ingress, and OFXP's access to other OpenFork installations.

**The achievement is interconnected reuse, not a collection of isolated pipes.** OXP is NOT a second OpenFork Session. A native OpenFork Session and an external ChatGPT/OXP caller can use the same authoritative ProjectInspection producer and other domain services under separate grants. OXP delegation creates actual native worker Sessions, which themselves reuse the native harness, tools, MCP services, and authorized peers. OFXP reaches another independently authorized OpenFork installation that reuses its own native capability implementations.

The previous versions did not make this obvious. An abstract network of dots and generic curved paths obscured which node was the shared implementation, and a symbol-only Venn diagram explained neither permission boundaries nor execution reuse. The first illustration must contain ONE conspicuous shared core, visibly reached by both caller routes, with all five capability families grouped within that same core. The supporting figures should then show specific forms of reuse.

## Why this matches the existing journal

The source of visual truth is the `JournalFigure` component used by the neural-field/E Ink entry, not an imported graph library aesthetic:
- Original rounded `research-figure` / `jf-figure` wrapper.
- Muted Fig. n / Overview or Mechanism top strip with restrained first-figure dither.
- Editorial title and one soft inset illustration panel with rounded boundaries.
- Substantive evidence-aware bottom caption; no chart title duplicates or marketing eyebrows.
- Inter, muted zinc, subtle hairlines, comfortable padding, accessible text.
- Nothing rendered into a generated bitmap: editable React/CSS schematic source.

This intentionally balances the journal's nostalgic computational modernism with direct label-first information architecture. Curved connectors are only used if needed to explain a relationship; joining parallel authorized call paths is more legible with simple, unambiguous orthogonal geometry.

## Five figure-specific semantics

1. **Overview:** Two callers — ChatGPT through OXP and a native OpenFork Session — both connect to ONE shared OpenFork implementation; the same core contains native tools, existing Sessions, delegated native workers, MCP integrations, and OFXP peers. An explicit native-worker return note emphasizes delegation reuse.
2. **Project:** OXP `project` and native Project have different authorization gates, but ONE `ProjectInspection` producer; the external adapter does not reimplement repository inspection.
3. **MCP:** ONE configured MCP server catalog is discoverable by both OXP and native Sessions. Connections are independently owned. Both clients may invoke the same configured external server without sharing one connection state.
4. **OFXP:** Two separate physical installations both contain genuine OpenFork native capability services. A peer connection grants limited remote operations. Two machines do NOT share a database or silently confer permissions.
5. **Authority:** Native, OXP and peer callers carry separate grants, while supported operations resolve to the same authoritative domain service on the target OpenFork host. Effective authority is the intersection of each request's crossed boundaries, not a union of caller grants.

## Design references

- Existing journal: `src/components/JournalFigure.tsx`, `src/journal-figures.css`, `src/styles.css` and the author's reference screenshot from the neural-field/E Ink essay.
- Portfolio: `portfolio_v3/src` design tokens and figure/brand treatments; use actual brand consistency rather than assuming the term NCM means terminal-themed decorations.
- [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) — deletion-first layout, semantic roles and bounded connector routing.
- [pkt-lab/svg-diagram](https://github.com/pkt-lab/svg-diagram) — systematic labeling and visual inspection.

## Verification

`scripts/oxp-architecture-audit.mjs` verifies all five figures, one shared implementation in the overview, one ProjectInspection producer, one MCP catalog, two independent clients, both OFXP hosts and the authorization lanes. Browser checks cover 320, 375, 390, 430, 600, 700, 768, 1024 and 1440 CSS-pixel widths, plus dark scheme at 375/430/768. No page overflow or visibly clipped labels. Screenshots are inspected after each significant layout change. TypeScript and the full production build are additional independent gates.

Earlier diagrams' isolated meaningless circles and decorative flourishes must not be reintroduced to represent a capability that has a human-readable name. The visual objective is immediate recognition of the common implementation, distinct entry points and cross-system reachability.
