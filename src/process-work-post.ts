import type { Entry } from './data'

export const processWorkPost: Entry = {
  "slug": "when-the-process-becomes-the-work",
  "title": "When the process becomes the work",
  "shortTitle": "When the process becomes the work",
  "contextLabel": "Engineering note / 010",
  "topic": "Engineering",
  "stage": "Working notes",
  "type": "Engineering reflection",
  "date": "2026-10-12",
  "minutes": 7,
  "issue": "E–010",
  "figure": "agent",
  "summary": "Why I resist elaborate Git workflows and procedural gates when they delay the experiments that could actually resolve the engineering problem.",
  "keywords": [
    "Engineering process",
    "Git",
    "Agent swarms",
    "ProofGate",
    "Workmark",
    "OpenFork",
    "Experimentation"
  ],
  "sections": [
    {
      "heading": "The work I actually want to do",
      "paragraphs": [
        "I have never been particularly interested in doing Git the “right way” for its own sake. I use Git because I need to know what changed, recover when an experiment goes wrong, and keep work from colliding. I do not get much satisfaction out of turning every idea into a branch, every branch into a ceremony, and every small decision into a review process.",
        "I would rather spend that time finding out whether the idea works. That preference can look undisciplined from the outside. To me, the discipline is in the evidence: can I reproduce the result, identify the change that caused it, and safely undo it? A tidy commit history is useful, but it does not answer those questions by itself."
      ]
    },
    {
      "heading": "How a process becomes the task",
      "paragraphs": [
        "I keep seeing sensible precautions grow into rules nobody is allowed to question. A prototype needs a complete specification. The specification needs a review. The review needs tests. The tests need the prototype. Everyone is following instructions, and nobody is making the thing.",
        "Workmark gave me a particularly clear example. Gate 0 required contracts to be frozen before certain integration work could begin, while CCR-8 required evidence from that integration to close the gate. It was possible for several agents to be busy and for the project to remain stationary. The fix was not to abandon verification. It was to let bounded, fail-closed implementation produce the evidence needed for later certification.",
        "I have begun to distrust a process when it can report success without moving the underlying problem closer to a solution. A completed checklist is not a working system."
      ]
    },
    {
      "heading": "What Git is good at, and what it is not",
      "paragraphs": [
        "Git is excellent at preserving states of source code, comparing changes, and recovering history. It does not prescribe one universal social workflow. Feature branches, pull requests, commit conventions, approvals, and release gates are policies built around the tool. Some are indispensable when multiple people ship to production. Others are inherited habits that make little sense during exploratory research.",
        "A ten-minute experiment should not need the same ceremony as a production data migration. On the other hand, a shared worktree with concurrent agents needs explicit ownership, because one worker can destroy another worker's uncommitted work. I want the smallest mechanism that protects the actual boundary: snapshots, scoped ownership, conflict detection, reversible edits, and tests that run at the right time. I do not need a simulated organization around every local hypothesis.",
        "Skipping a ritual does not mean skipping accountability. If I cannot tell which agent changed a file, whether the tests ran, or what remains unverified, I have traded bureaucracy for confusion. That is not an improvement."
      ]
    },
    {
      "heading": "The problems I can solve now",
      "paragraphs": [
        "In my earlier entry, The problems I can solve now, I wrote about tediousness as the old limit on my curiosity. I used to set ideas aside because the work between an idea and a useful experiment was too expensive. Coding agents have reduced that cost enough that I can investigate problems I would previously have left alone.",
        "That changes how I think about process. If an agent can inspect a codebase, assemble a prototype, and expose its first failure in an afternoon, spending that afternoon preparing a perfect administrative path is an unusually expensive choice. The purpose of the tools is to let me reach the hard question sooner.",
        "The constraint has not disappeared. Better models still misunderstand requirements, produce fragile changes, and misread benchmarks. My time is more valuable when spent interrogating those failures than when spent maintaining a workflow whose benefits I cannot identify."
      ]
    },
    {
      "heading": "The lesson from ProofGate",
      "paragraphs": [
        "ProofGate has made me more demanding about verification, not less. A model proposing an answer is not evidence that the answer is correct. An independent verifier can check it, identify a counterexample, and help narrow the next attempt. In that research, cheap deterministic repairs often deserve priority over another expensive model retry.",
        "That is the kind of discipline I want in engineering: checks attached to real failure modes. Verify an invariant before accepting a change. Record the benchmark inputs. Refuse a destructive edit when ownership is uncertain. Distinguish a host-free test from native-host certification. Those checks reduce uncertainty.",
        "What I do not want is a gate that demands evidence which can only be produced by work the gate forbids. The moment verification prevents the first verifiable experiment, its authority needs to be reconsidered."
      ]
    },
    {
      "heading": "Agent swarms make the tradeoff sharper",
      "paragraphs": [
        "A swarm can produce a surprising amount of motion without making progress. One agent writes a plan, another audits the plan, a third prepares a handoff, and a fourth explains why the first three cannot proceed. More parallelism can multiply the cost of an unproductive rule.",
        "This is why I care about the tools I have been building around OpenFork. An agent should be able to locate the right code, make a bounded edit, run the relevant test, and receive a specific failure. It should not have to reconstruct the same procedural context every turn. Shared ownership and durable evidence matter more than polished status updates.",
        "I want to judge a swarm by what it learned or changed that survives independent checking. Tool calls, commits, tokens, and reports can explain the cost. They are not the outcome."
      ]
    },
    {
      "heading": "A rule I keep returning to",
      "paragraphs": [
        "Before adding another step, I want to know which concrete failure it prevents and whether a cheaper mechanism would prevent the same failure. If the answer is unclear, I would rather run the experiment and learn what protection is actually needed.",
        "I am not trying to eliminate structure. I am trying to stop structure from consuming the time and attention it was supposed to protect. The goal is still to solve the problem. Everything around that goal should have to earn its place."
      ]
    }
  ]
}
