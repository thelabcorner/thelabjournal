import type { Entry } from './data'

/** Engineering working notes: strict dependency cycles, ProofGate, and Workmark. */
export const acyclicityPost: Entry = {
  "slug": "on-acyclicity-in-agentic-engineering",
  "title": "On acyclicity in agentic engineering",
  "shortTitle": "When prerequisites form a cycle",
  "contextLabel": "Engineering note / 009",
  "topic": "Engineering",
  "stage": "Working notes",
  "type": "Agent systems",
  "date": "2026-10-12",
  "minutes": 12,
  "issue": "E–009",
  "figure": "system",
  "summary": "A Workmark deadlock made me examine how verification gates can block the very work needed to satisfy them, particularly when several agents share the plan.",
  "keywords": [
    "Agentic engineering",
    "Dependency graphs",
    "ProofGate",
    "OpenFork",
    "Agent swarms",
    "Verification",
    "Workmark"
  ],
  "sections": [
    {
      "heading": "A deadlock written into the plan",
      "paragraphs": [
        "I ran into a peculiar problem while working on Workmark. The agents had tasks, owners, specifications, and acceptance criteria. The engineering work was still stuck. The more carefully they followed the plan, the less authority they had to do the integration that would move it forward.",
        "Gate 0 required the protocol and platform contracts to be frozen before Workmark-owned boundaries could be implemented. CCR-8, one of the gates we needed to close, required production-path evidence for authoritative Illustrator document identity, durable operation receipts, authenticated dispatch, and replay correctness. Some of that evidence could only be produced by the integration the earlier rule prohibited. Each requirement made sense when read alone. Together they formed a closed prerequisite chain.",
        "That matters because the blockage did not appear as a compiler error or a failed test. It looked like responsible engineering: another contract to finalize, another review to request, another report explaining why implementation could not begin. A swarm can keep generating those reports indefinitely."
      ]
    },
    {
      "heading": "Acyclicity is a property of the prerequisites",
      "paragraphs": [
        "I now want every serious multi-agent plan represented as a dependency graph. Let G = (V, E), where each vertex is a task or evidence-producing obligation and A -> B means A must finish before B may start. If those edges are strict prerequisites, the graph needs a topological ordering. A directed cycle has none. In a strongly connected component whose members all wait for another unfinished member, no amount of additional parallel workers creates a first executable step.",
        "There is an important distinction here. My engineering process is full of useful loops: implement, test, examine the failure, revise, and test again. Those are feedback loops across time. The prerequisites for a particular iteration can still be acyclic. Candidate 1 leads to evidence 1, which informs candidate 2 and evidence 2. If a plan instead requires evidence 2 before candidate 1 is allowed to exist, iteration has turned into an impossible admission rule.",
        "A cyclic graph is not automatically proof that a project can never advance. An alternative OR dependency, a previously completed artifact, or an authorized bootstrap path may supply a starting point. That is why a verifier needs the semantics of each edge, not merely a list of arrows. The dangerous case is a strict, unsatisfied cycle with no independent entry."
      ]
    },
    {
      "heading": "How the cycle gets there",
      "paragraphs": [
        "I usually see it emerge through local decisions that were intended to reduce risk. Somebody expands a release qualification into a rule that forbids prototype work. A protocol is required to be final before its host behavior has been exercised. Two domains agree to wait for each other's interface to stabilize. An acceptance test is made a prerequisite for implementing the code it tests.",
        "The problem gets harder to notice when permissions and prerequisites live in different documents. A milestone graph might look linear, while an AGENTS.md instruction creates a hidden edge that points backward. The task file says build the integration; the repository policy says the integration is forbidden until a gate closes; the gate needs evidence from that integration. An agent reading both cannot resolve the contradiction by working harder.",
        "There are related failures that need different diagnoses. A missing Illustrator host lease is an unavailable resource, and two workers waiting on each other's file ownership can create a runtime wait-for deadlock. Neither is necessarily a cycle in the written project dependency graph. I want the supervisor to inspect formal prerequisites, current resource waits, and who holds the authority to remove a blocker."
      ]
    },
    {
      "heading": "Why a swarm makes it expensive",
      "paragraphs": [
        "Parallel agents are most useful when independent work can proceed at the same time. A strongly connected group of blocked tasks gives them no productive starting order. Adding workers can increase investigation, status traffic, duplicated attempts, and shared-worktree contention without shortening the path to an acceptable artifact.",
        "There is also an epistemic cost. One agent reports that STORE is waiting for IPC. Another says IPC cannot proceed until the protocol is frozen. A third tries to close the freeze using tests that require STORE and IPC. Each report may be accurate. Summarized separately, the activity can look like progress; only the combined dependency graph shows that the work is stationary.",
        "This is especially damaging in long-running sessions. Agents spend tool calls reconstructing the same rules, re-reading the same unresolved evidence, and handing off a blocker that nobody has authority to resolve. Token volume and completed subtasks are poor substitutes for measuring whether the critical path moved. I do not have a controlled figure for the cost of this failure mode, so I would rather track blocked-agent time, repeated investigations, critical-path movement, and verified deliverables than claim an invented swarm-speedup penalty."
      ]
    },
    {
      "heading": "What changed in Workmark",
      "paragraphs": [
        "On October 12, I changed the authority model instead of trying to negotiate a one-off exception inside the old cycle. Gate 0 remains a production certification obligation. It no longer acts as a universal embargo on development. Narrowly scoped integration can be written and tested while disabled by default and fail-closed, with host safety, protocol acceptance, and release qualification still required before shipping.",
        "That creates a sequence with independent evidence at each step: specify the bounded contract, implement its seam, test it without the native host, then obtain the native and release-level evidence when the relevant boundaries exist. STORE can produce an authoritative transactional identity writer, IPC can integrate authenticated dispatch, TIME can consume committed identity, and TEST can verify the host-free path. The separate Illustrator host lease and disposable-document rules remain intact.",
        "The revised plan included a machine-readable graph with 14 dependency nodes. Its verifier found no cycle and correctly rejected an intentionally added circular edge. That is evidence for the planning correction, not a claim that the implementation is complete. At that snapshot, the CCR-8 source-edge inventory was still 8 of 14 and M9 native certification was still 0 of 1,020. Removing a deadlock creates permission to do work; it does not manufacture the missing receipts."
      ]
    },
    {
      "heading": "Where ProofGate fits",
      "paragraphs": [
        "ProofGate is related to this problem in a more precise way than its name might suggest. My ProofGate research is about inference-time logic validation and verifier-driven repair, not a milestone system for supervising developers. I have been examining what happens when a model proposes a derivation and an independent engine checks it against trusted premises. The model should not be able to write both the assumptions and its own certificate of correctness.",
        "The research pushed me away from an expensive loop of asking a model to try again whenever a verifier says no. The more promising design runs exact checks first, extracts implications, performs cheap deterministic repairs, removes dominated actions, and uses a model where a genuine semantic choice remains. Then the candidate is checked again. Some early experiments changed the model's subsequent behavior without improving solve counts; those negative results matter when deciding what the verifier actually buys us.",
        "The connection to acyclicity is the separation of authority. An implementation may produce a candidate. A verifier may reject it, with a specific counterexample or unmet obligation. A new candidate can then depend on that feedback. But the verifier cannot require an unavailable future certificate as permission to construct the very first candidate, unless an independently available bootstrap exists. ProofGate does not solve project scheduling by itself. It gives me a useful discipline for distinguishing proposed work, accepted evidence, and authority to proceed."
      ]
    },
    {
      "heading": "The same pattern appears in my agent tools",
      "paragraphs": [
        "I wrote about the tools around the model in an earlier journal entry because seemingly small tool contracts change how an agent reasons through a repository. OpenFork's Project and Symbols tools give the agent bounded, attributable information. Edit operations check their target again before changing files. When a match is ambiguous, a useful failure reports the candidates instead of guessing. The Test tool turns a large runner output into actionable evidence while keeping details available.",
        "A stalled engineering gate has a similar interface problem at a larger scale. If the gate only says blocked, the next agent may repeat the same attempt. If it identifies the exact unsatisfied prerequisite, the authority responsible for it, the evidence that would close it, and whether a safe partial path exists, the agent has a reason to change its next action. Failed validation should reduce uncertainty. It must never silently relax the specification to make the workflow green.",
        "For swarms, I also need durable ownership and provenance. A worker's summary is not an integration receipt. A completed unit test is not native-host certification. A merged patch does not prove that concurrent work was preserved. Those distinctions need to survive handoffs, compaction, and changes of agent."
      ]
    },
    {
      "heading": "What I want the supervisor to enforce",
      "paragraphs": [
        "Before launching workers, I want the plan compiled into explicit tasks with artifact-producing owners, typed dependencies, and evidence obligations. Development permission, integration acceptance, native-platform validation, and release certification should be separate gates. A task should say whether it needs all listed prerequisites, any one of several alternatives, or only an advisory input. The graph checker should report a concrete cycle witness, not just a failed boolean.",
        "For strict prerequisite edges, strongly connected components can be found in linear time in the size of the graph. The CI test should reject newly introduced unsatisfied cycles and include a negative-control graph with a deliberate back edge. Static acyclicity is only one check. I also want validation that an unblocked task actually has an available executor, that external prerequisites are real, and that all purportedly completed nodes have attributable evidence. Otherwise a perfectly acyclic graph can still be inert.",
        "When a cycle appears, an agent should not quietly delete a dependency. The supervisor needs an explicit architectural decision: narrow an overbroad restriction, split a gate by authority, introduce a verifiable bootstrap artifact, or change the order of integration. Each change should preserve the underlying safety property and identify which acceptance criteria remain open. Independent verification still owns certification."
      ]
    },
    {
      "heading": "A working rule",
      "paragraphs": [
        "I want a swarm to be able to answer a simple question at any point: what evidence can we produce next, using capabilities we already have, that will remove a real prerequisite? If no worker can name such an artifact, I should inspect the graph before authorizing more agents.",
        "The Workmark incident has changed the way I look at engineering plans. A good plan gives the team room to discover facts through implementation without treating those discoveries as permission to ship. A good verifier makes the next attempt better informed. Both depend on the same restraint: no component gets to certify itself, and no requirement should demand its own downstream proof as the price of beginning."
      ],
      "takeaway": "Keep prerequisite graphs acyclic at each execution stage; preserve verification as an independent obligation, and allow evidence-producing work to proceed under bounded authority."
    }
  ]
}
