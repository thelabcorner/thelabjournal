# Editorial evidence — The problems I can solve now

Reviewed: 2026-10-11. Fact-check notes for Journal / 003. These notes are not rendered as part of the essay.

## Rolling 30-day ledger snapshot

Captured at **2026-10-12T02:22:46.437Z** (October 11, 2026, 9:22:46 PM CDT). Rolling window: **2026-09-12T02:22:46.437Z to 2026-10-12T02:22:46.437Z**, i.e. September 11 to October 11 in America/Chicago.

Source: the active local OpenFork database `/openfork/openfork-dev.db`, table `usage_record` (which backs OpenFork's durable Session usage accounting). Read-only SQL filter: `created_at >= 1789179766437 AND created_at <= 1791771766437`. The executed query used `Date.now() - 30 * 86400000` as the cutoff and `Date.now()` as the upper bound. Aggregated over the matching rows. No data were changed.

| Field | Rolling 30-day count |
| --- | ---: |
| Unique model-message usage records (`message_id`) | 174,774 |
| Distinct sessions | 4,921 |
| Distinct provider identifiers | 16 |
| Distinct model identifiers (aliases and variants included) | 67 |
| Non-cached input tokens | 1,373,157,599 |
| Cache-read tokens | 28,015,579,868 |
| Cache-write tokens | 3,704,497 |
| Output tokens | 76,467,531 |
| Sum of these four token fields | **29,468,909,495** |
| Separately reported reasoning tokens | 75,183,306 |
| Records with agent/mode `swarm` | 55,511 |

Provider routes by record count: `opencode-go` 85,917; `opencode` 56,758; `workbuddy` 17,103; `openai` 11,884; `genspark` 2,216. These are locally stored provider labels, not a statement about which company's account paid for each request. The request counts were rechecked to show unique `message_id` values, not duplicate rows. Per-session SQL sums reconcile exactly with the two OXP `usage/context` reports below.

**Meaning and limitations:** The sum is token **traffic across requests**, not unique tokens, words written, human prompts, model quality, or completed work. Cache reads dominate because earlier material is read again in subsequent requests. The separately reported reasoning-token counter is not added to the four-field sum because provider semantics and overlap may differ. Usage includes parent sessions, delegated agents, swarms, engineering experiments, and any other activity written to the active local ledger. It is not a universal cross-platform total: ChatGPT mobile sessions and other unconnected services may be absent. Another historic `openfork-main.db` database overlaps the active `openfork-dev.db` records, so their totals must not be summed. The ledger is not a billing statement or controlled productivity benchmark.

## Usage measurements

Source: OpenFork OXP's durable per-session `usage/context` records, retrieved on 2026-10-11 (America/Chicago). These figures are the counters as reported by the session accounting system. They are not independently billed totals or lifetime usage.

| Accounting | Session A | Session B |
| --- | ---: | ---: |
| Local session window | Oct 11, 8:29–9:03 AM CDT | Oct 11, 8:19–8:43 PM CDT |
| Main recorded model | DeepSeek V4.1 Flash (OpenCode Go) | GPT-6.1 Sol (OpenAI) |
| Assistant messages (session total) | 80 | 51 |
| Tool calls | 114 | 92 |
| Input tokens | 671,350 | 200,036 |
| Cache-read tokens | 20,324,992 | 6,401,920 |
| Output tokens | 27,008 | 22,009 |
| Source createdAt (UTC) | 2026-10-11T13:29:52.689Z | 2026-10-12T01:19:04.487Z |
| Source updatedAt (UTC) | 2026-10-11T14:03:56.711Z | 2026-10-12T01:43:37.560Z |

A cache-read token represents context reused in another request, not a new unique token authored by the model. The first session included one initial assistant record with zero usage; all counted values come from the overall session totals. The second record had free/subscription-style cost accounting; do not convert the records to claims about total cash spend.

The term "about 34 minutes" is elapsed wall time between the first session's createdAt and updatedAt timestamps. It is not an inference about uninterrupted productive engineering time.

## Editorial claim boundaries

- The essay states the author's personal observation that tedious groundwork used to be the limiting factor and model intelligence now often sets the limit. This is a subjective assessment, not a benchmark comparing models.
- "Days to hours" is an experiential example, not a measured speedup across comparable tasks. Do not retrofit an unsupported percentage or X-times multiplier.
- Domain examples (raster-to-editable-vector reconstruction, browser-to-native-PDF output, lossless compression experiments) are drawn from actual ongoing project areas but deliberately omit unpublished identifiers and internal implementation details.
- In lossless compression experiments, correct round trips and many tested candidates still did not establish a Pareto win against existing baselines. Do not portray negative results as breakthroughs.
- Session token totals indicate volume of processing and tool activity, not success, expertise, scientific validity, or unique generated prose.

## Editorial style

Applied Peter Yang's No AI Slop editing and evaluation rules: https://github.com/petergyang/no-ai-slop/tree/main/skills/no-ai-slop . Preserve first-person voice, concrete technical detail, uncertainty, and irregular natural cadence. Avoid exaggerated speed claims, fake-profound endings, rhetorical binaries, vague importance statements, marketing pitch, and pretending author personally invoked tools used by coding agents.

## Publishing model

- The displayed essay is the TypeScript `src/problem-scope-post.ts` Entry, registered in `src/data.ts`.
- The Markdown file is derived through `bun run export:essay`; it is not the article renderer's source.
- The entry intentionally remains `Editorial draft` to match existing essays.
