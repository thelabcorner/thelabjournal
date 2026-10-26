# Source ledger — OpenFork: connecting the systems around an agent harness

Article date: 2026-10-26. Narrative is first-person engineering interpretation. Figures are conceptual schematics; they do not encode measurements or a claim of full protocol/tool-surface certification.

## Authoritative implementation and documentation (local OpenFork main)

- `AGENTS.md`: universal executable tool-surface parity, authority and origin semantics, V1 execution/runtime policy, root ownership tiers, dirty-worktree rules.
- `packages/opencode/AGENTS.md`, `packages/opencode/src/{oxp,ofxp,mcp,exchange,tool}/AGENTS.md`: adapter and domain-owner contracts, explicit MCP import/export distinction.
- `docs/map/{README,architecture,surfaces,source-tree,v1-v2}.md`: OpenFork product boundary, concrete entry points, local sidecar and package map, production V1 execution with newer presentation.
- `docs/architecture/tool-surface-parity.md`: supported entry-point execution invariant; names and catalogs alone are not evidence of executability.
- `docs/architecture/oxp-native-tool-parity.md`: native tool projection, shared ProjectInspection, specific read/symbol/toolchain examples, on-demand MCP management as implemented in recent source with runtime-rollout caveat.
- `docs/architecture/oxp-delegation-session-groups.md`: native OXP worker Session/group identity and source-title semantics.
- `docs/architecture/oxp-session-access-parity.md`: all-native local Session supervision; distinct scope from remote federation.
- `docs/architecture/ofxp-executable-parity.md`: actual OXP-to-OFXP peer path, dispatcher-backed Session calls, grants, controls and explicit non-executable worker/messaging/restore paths.
- `docs/plans/ofxp-first-party-architecture.md` and `docs/plans/ofxp-network-exchange.md`: first-party conceptual model and future areas. These plans are lower authority than executable dispatcher and tests.
- `docs/specs/oxp-chatgpt-mcp-contract.md`: OXP MCP ingress and progressive metadata/schema behavior.
- `packages/opencode/src/oxp/ofxp.ts`, `packages/opencode/src/ofxp/capability.ts`, `packages/opencode/src/oxp/mcp.ts`, `packages/opencode/src/oxp/mcp-control.ts`, `packages/opencode/src/oxp/worker.ts`: executable adapter surface.
- `packages/opencode/test/oxp/ofxp-gateway.test.ts`: OXP-to-OFXP transport/dispatcher execution evidence.
- Latest OpenFork main commits inspected: `df7bffec` (OXP MCP management), `230f7a13` (native MCP activation and idle OXP pools), `2fcce889` (manual stop and idle pin cleanup).

## Specific caveats that affect implementation meaning

1. The live OXP connector was contacted successfully and returned an authenticated status with approved roots and delegation/supervision grants. This establishes connection state, not that a running sidecar was rebuilt after the latest MCP commits.
2. OXP local worker delegation is executable; OFXP remote-worker creation is not an executable remote dispatcher in the audited parity ledger.
3. OFXP remote Session supervision/control is executable under the peer's separate grants; the native OXP all-native Session scope does not itself federate remote Session IDs.
4. OFXP peer messaging and remote checkpoint restore are not executable.
5. The OXP MCP on-demand branch was source-inspected. The parity ledger explicitly says active host rollout requires a new build.
6. OXP tool parity is checked by its own verifier; it is not proof that every supported native action works through every independent ACP/MCP/OFXP route.
7. OFXP pair discovery, trust, root approval, and action grants are separate gates.

## Publishing source

- Canonical site entry: `src/oxp-architecture-post.ts`.
- Readable editorial copy: `content/drafts/the-openfork-network-behind-one-oxp-connection.md`.
- Publication registry: `src/data.ts`.
- Reader integration: `src/App.tsx`.
- Native responsive figures: `src/components/OXPArchitectureFigures.tsx` and `src/components/oxp-architecture-figures.css`.

The article is a journal entry, not a scientific manuscript, and may express the author's genuine appreciation of system design. No measured performance, claimed peer-message implementation, or fictional development chronology has been added.
