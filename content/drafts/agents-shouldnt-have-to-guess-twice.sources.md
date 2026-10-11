# Editorial evidence — The tools around the model

Reviewed: 2026-10-10. Internal fact-check notes for Journal / 002, not displayed in the journal UI.

## What the essay is about

- The narrator is the person setting engineering objectives and reviewing outcomes. **The coding agent invokes the tools**. Do not describe the author manually choosing an edit strategy, running a tool, or making individual tool calls.
- The subject is the overall agentic-engineering environment, not a comparison article about one editing primitive.
- The duplicate-coordinate-expression incident happened in a PDF-renderer engineering session. Two exact occurrences caused an ambiguous edit error. A good error returns line locations and distinguishing context; it does not guess which match to change.
- No controlled, model-matched cross-harness benchmark has established a net accuracy or completion-rate advantage over OpenCode, Codex, or other tools. The essay makes no such claim.

## Upstream foundation

- OpenCode's upstream edit tool: https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/tool/edit.ts . It already uses nontrivial matching and ambiguity checks; don't call it a naive first-match replace.
- OpenCode upstream tool registry: https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/tool/registry.ts .
- Codex's patch handler: https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/apply_patch.rs . Codex already has a serious patch parser and application path. Do not make unsupported performance or capability ranking claims.

## Local OpenFork mechanisms inspected

Source paths are relative to the evolving checkout at `/webstormprojects/opencode`; tool contracts were inspected on 2026-10-10.

- `packages/opencode/src/tool/project.txt`: summary/structure/full bounded codebase orientation, manifest/script/CI discovery, recent modified files, local toolchains.
- `packages/opencode/src/tool/find.txt` and `read.txt`: scoped discovery and bounded, batched, targeted text reads.
- `packages/opencode/src/tool/symbols.txt`: Tree-sitter definitions/outlines/usages with attributable vs unattributed references.
- `packages/opencode/src/tool/lsp.txt` and `refactor.txt`: language-server code intelligence, TS semantic refactoring, preview-first and stale-file guardrails.
- `packages/opencode/src/tool/edit.txt`; `edit.ts`, `edit/match.ts`, `edit/strategy.ts`, `edit/heal.ts`, `edit/plan.ts`, `edit/commit.ts`: exact/anchored/verified-line edits, same-file batching, ambiguity refusal, narrowly bounded input repair, guarded planning, reread and commit behavior. Single-file temp-file+rename is not equivalent to an atomic multi-file transaction.
- `packages/opencode/src/tool/patch.txt`: full multi-hunk preflight, stale-check, recoverable error/rollback behavior.
- `packages/opencode/src/tool/test.txt`: harness-aware listing/running, filters, concise failure output with retained detail, hard timeouts and specific permissions.
- `packages/opencode/src/tool/json.txt` and `sqlite.txt`: structural data understanding and guarded/dry-run writes.
- `packages/opencode/src/tool/git.txt`: typed worktree operations and explicit guarded mutations.
- `packages/opencode/src/tool/code.ts`: programmable search/describe/run/save/call; scripts run in constrained JS and invoke host-authorized capabilities rather than receiving ambient filesystem/network access. Direct tools remain appropriate for simple actions.
- `packages/opencode/src/tool/checkpoint.txt`: session/worktree history and restore preview; restoration is filesystem-scoped rather than undoing conversation/commit history.
- `packages/opencode/src/tool/session.txt`: compact status, cross-session history search, child session supervision; timestamps have different semantics.
- `packages/opencode/src/tool/memory.txt` and `dream.txt`: evidence-backed project memory and read-only historical investigation; memory is historical context rather than immutable truth.
- `packages/opencode/src/tool/registry.ts`: local tool registration reflects a broader tooling environment than editing alone. `AGENTS.md` requires equivalent executable behavior across supported surfaces.

## Editorial boundaries and state

- This is a first-person perspective essay, not an exhaustive implementation reference, benchmark report, or checklist.
- Avoid defending a premise against imaginary critics, self-congratulation, a marketing pitch, or repetitive "not X but Y" rhetorical constructions.
- Avoid implying automatic healing authorizes subjective interpretation of an ambiguous mutation.
- Keep the article at `Editorial draft` stage until publication review. The journal still uses `noindex, nofollow`.
- The existing slug is retained so that bookmarks to the previous draft continue to open the rewritten article.
