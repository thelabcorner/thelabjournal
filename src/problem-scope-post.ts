import type { Entry } from './data'

/**
 * Third essay. Personal account of reduced setup cost and changing model limits.
 * Usage statistics come from a dated 30-day OpenFork ledger snapshot and audited OXP sessions.
 */
export const problemScopePost: Entry = {
  "slug": "the-problems-i-can-solve-now",
  "title": "The problems I can solve now",
  "shortTitle": "The problems I can solve now",
  "contextLabel": "Journal / 003",
  "topic": "Essays",
  "stage": "Editorial draft",
  "type": "Personal essay",
  "date": "2026-10-11",
  "minutes": 8,
  "issue": "J–003",
  "figure": "frontier",
  "summary": "Tedious work used to decide which ideas I could pursue. As models get smarter, the range of problems I can seriously attempt keeps expanding.",
  "keywords": [
    "Artificial intelligence",
    "Problem solving",
    "Research",
    "Engineering",
    "Coding agents",
    "LLMs"
  ],
  "sections": [
    {
      "heading": "The cost of following an idea",
      "paragraphs": [
        "I have always had more ideas than time to pursue them. Before I could test one, I had to decide whether the investigation was worth all the work surrounding it. Sometimes I knew exactly what I wanted to explore and still put it aside because of everything I would need to build first.",
        "An unfamiliar file format might mean days of reading documentation, making test fixtures, and assembling a parser before reaching the interesting question. An algorithm experiment might need a benchmark runner, a reference implementation, and enough debugging to make the comparison fair. Each step was manageable. Taken together, they could consume the time and energy I wanted to spend on the actual problem.",
        "Tediousness was my main bottleneck. I was willing to learn the difficult parts. I struggled more with the volume of routine work required to get to them."
      ]
    },
    {
      "heading": "The work between an idea and a test",
      "paragraphs": [
        "Now I can hand an agent a repository and a problem. It can inspect the code, find related implementations, build a first attempt, run tests, encounter an error, and go back through the files. I can spend more time deciding what deserves investigation, checking its reasoning, and pushing against the result.",
        "A rough experiment that might once have taken me days to assemble can sometimes reach a testable state in hours. I do not have a controlled speedup figure that applies to every project, and complex work still has long stretches where nothing seems to move. But the difference in how many ideas I can afford to investigate is obvious to me.",
        "I am much more willing to start something when I know I can find its first serious failure without spending a week on setup. Some ideas fail quickly. That is useful information I used to have to work much harder to obtain."
      ]
    },
    {
      "heading": "Problems I would once have left alone",
      "paragraphs": [
        "A lot of what interests me sits between fields. Reconstructing editable vector geometry from pixels requires thinking about sampling, antialiasing, topology, curve fitting, and the formats used by design software. Converting a browser document to a native PDF brings in layout, font shaping, pagination, graphics primitives, and the behavior of the browser itself. Compression research demands another mix: representation, parsing, entropy coding, instruction-level costs, and honest benchmarking.",
        "I can now explore more than one part of those systems in the same investigation. Instead of stopping at a narrow proof of concept because every neighboring subsystem requires a new detour, I can test the interactions between them. Often that is where the difficult problems actually live.",
        "This has not made the fundamentals optional. It has let me reach problems that give me a much more specific reason to study them. I can ask better questions after I have watched a real implementation fail."
      ]
    },
    {
      "heading": "The limit I notice now is model intelligence",
      "paragraphs": [
        "I have used enough models on similar work to notice the difference between one that can produce code and one that can follow a difficult argument across an entire project. Some models are good at isolated changes but lose track when several constraints interact. They repeat a failed approach, quietly drop a requirement, or write a convincing explanation for a result the tests do not support.",
        "Better models get farther before that happens. They can hold onto a larger technical problem, reconcile conflicting evidence, and revise an approach without repeatedly starting over. I notice the improvement most clearly when I return to a problem that previously caused an agent to stall. With the same general workflow, the stronger model can sometimes reason past the old stopping point.",
        "I have put considerable effort into the tools around my agents, because bad search, editing, and test feedback can waste model intelligence. Those improvements help. But increasingly, the toughest problems I can solve are bounded by how much reasoning the model can sustain. As that improves, the set of projects I can reasonably take on expands with it."
      ]
    },
    {
      "heading": "What thirty days of this looks like",
      "paragraphs": [
        "I wanted to see what the workload looks like beyond any single session. In the thirty days ending October 11, 2026, my local OpenFork ledger recorded 174,774 model-message usage records across 4,921 sessions. It counted 1.37 billion input tokens, 28.02 billion cache-read tokens, and 76.47 million output tokens. Another 3.70 million tokens were recorded as cache writes. All of that happened in a rolling thirty-day window.",
        "Those numbers include delegated agents and parallel swarms, not only sessions I personally started and supervised turn by turn. The ledger classifies 55,511 records as swarm-mode work. Cache reads dominate because the same code, instructions, and earlier conversation can be supplied to a model repeatedly. Adding the standard token categories gives about 29.47 billion recorded token units. Most of that volume is reused context, counted again each time a request reads it.",
        "An individual session makes the scale easier to picture. During one October 11 engineering session, an agent made 114 tool calls while its usage ledger recorded 671,350 input tokens, 20,324,992 cache-read tokens, and 27,008 output tokens. Another session that evening made 92 tool calls. The agent was reading code, modifying files, testing, and recovering from errors across dozens of turns. I was pushing on the problem and judging the evidence instead of doing each mechanical step myself.",
        "These figures do not measure my productivity, and I have no controlled comparison that turns them into a reliable speedup percentage. They show how much repeated inspection and iteration I can now put behind an idea. The difficult part for me is increasingly deciding whether the reasoning behind all of that work is sound."
      ]
    },
    {
      "heading": "More attempts still need better evidence",
      "paragraphs": [
        "The ease of generating another candidate creates its own problem. I can explore more hypotheses than before, including quite bad ones. An agent can confidently optimize the wrong thing, fit an example too closely, or make a benchmark appear impressive by changing what it measures.",
        "In one lossless-compression investigation, the experimental ideas survived correctness testing and still failed to beat established baselines on both speed and size. More experiments did not produce a hidden win. I came away with a clearer understanding of why the approaches were losing, which is a better result than carrying an untested idea around for years.",
        "I still have to decide what counts as success, build tests that could falsify it, and recognize when the evidence says to stop. The ability to attempt a harder problem is valuable only if I remain capable of admitting that I have not solved it."
      ]
    },
    {
      "heading": "Where I go from here",
      "paragraphs": [
        "There are problems on my list that current models still struggle with. I can usually tell more precisely where they struggle now: a missing piece of prior art, a false assumption, a brittle long-range dependency, or a reasoning step that the agent keeps getting wrong. I keep those failures and the tests that expose them.",
        "When a stronger model becomes available, I can return to the same repository, the same failing cases, and the same constraints. Sometimes a problem that was impractical a few months earlier becomes approachable. Other times the new model still fails, and I have a better record of what needs to change.",
        "I used to decide whether an idea was worth pursuing partly by imagining all the tedious work between it and the first useful experiment. I make that decision differently now. I can get to the experiment, find out what is actually difficult, and spend my attention there."
      ]
    }
  ]
}
