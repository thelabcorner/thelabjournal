---
title: "Thinking Like the Model"
date: 2026-11-09
author: "Jackson Cummings"
status: published
issue: "J–008"
slug: thinking-like-the-model
category: "Essays"
summary: "An introduction to understanding prompts, context, training, and reasoning—and to properly delegating work to AI agents without blindly reinforcing bad instructions."
tags: ["Prompt engineering", "AI agents", "Delegation", "Context engineering", "Prompt introspection", "Pretraining", "Post-training", "OpenFork"]
---

# Thinking Like the Model

*On prompting, context, the way agents interpret language, and why I refuse to treat them like magic.*

I barely write code anymore.

Occasionally I'll make a small change myself, but most of the time I'd rather delegate even that. I delegate research, design work, bug investigations, implementations, testing, and a pretty ridiculous amount of the thinking that goes into all of those things.

I'd estimate that in something like 99% of the situations I encounter, doing the work myself is more tedious than **properly** delegating it.

And that's the word I want to emphasize: *properly*.

Poor delegation is fucking miserable. You tell an agent to do something, it misunderstands you, you tell it to fix the result, it misunderstands the correction, and eventually you've spent more effort dealing with the mess than the original task deserved.

Proper delegation can be remarkably efficient. I explain what I want, provide the information that matters, let the agent do the work, and evaluate what comes back. I can spend my attention on the objective, the tradeoffs, and the decisions I actually care about rather than manually performing every step.

I've spent an extraordinary amount of time working with these systems, particularly coding agents. And I've developed a habit that I think makes an enormous difference: before I send a prompt, I try to anticipate how the model is likely to interpret it.

I sometimes describe this as *metacognating for the model*, or *thinking like the model*.

That doesn't mean I have its internal computations figured out. It means I've learned enough about the machinery, and spent enough time observing its behavior, to recognize when the instruction I'm about to send doesn't actually communicate the intention in my head.

I think a lot of people could save themselves an unbelievable amount of frustration by developing even a little of that intuition.

But we need to start with what an agent actually has to work with.

## The prompt is not your intention

A prompt is the message or instruction you send to a language model. It might be a question, a description of a problem, or something as straightforward as "fix this bug."

The model doesn't receive the mental picture that made you write that sentence. It receives the sentence.

And whatever else the application supplies alongside it.

That additional information is called **context**. In a chat, context might include earlier messages. In a coding agent, it can include project instructions, previously read files, search results, error logs, test output, and messages from other agents. The agent runtime also provides tools and instructions about the actions it can take.

There's a fundamental distinction here that I wish people would stop overlooking: **the words you typed are not necessarily the model's entire input, and the thoughts you didn't express are not necessarily part of its input at all.**

The model has a **context window**, which is the amount of information it can work with during a particular request. That doesn't mean it automatically remembers every conversation you've ever had. Applications can retrieve older information, summarize previous exchanges, or omit information that no longer fits.

If you spend two hours establishing an architectural decision, then work on unrelated problems for another several hours, that earlier decision might no longer be prominent in the context. It might have been summarized, truncated, or simply become less influential amid a tremendous amount of newer material.

I often deliberately reintroduce important earlier decisions when returning to them. That doesn't necessarily mean the model forgot. It means I want to make that information relevant to **what comes next**.

And if an agent doesn't have the prior work, repeatedly telling it to "remember" isn't going to conjure an accurate history out of thin air. Retrieve the previous session, supply the relevant evidence, or tell it where the information can be found.

Imagine telling a coding agent:

> Fix the crash.

If it already has the logs, has been investigating the crash for an hour, and knows the requirements, that might be a perfectly good instruction.

If it's a fresh session with no relevant files or details, you've barely represented the problem.

You might instead say:

> The application crashes after running for a while. Investigate the logs, identify the cause, and verify a correction without changing unrelated behavior.

You're still delegating the investigation. You haven't told the agent which function to edit or pretended you already know the cause. You've simply given it a better starting point and told it what successful work looks like.

You cannot expect the model to use information it never received.

## It's reasoning through context, not reading your mind

People frequently talk about an AI agent's "thinking" as if it were the same kind of private mental activity we experience as humans.

That framing can become incredibly misleading.

When I have an idea for a design, I can picture something I haven't yet put into words. When I ask a friend to make something, that friend might draw upon shared experience, physical observations, and an enormous amount of unspoken social context.

A language model doesn't magically inherit any of that.

For a text-based agent, its work is organized around **tokens**: pieces of text that represent words, punctuation, code, and other content. It processes the context it receives and generates more tokens. Those tokens can form an answer, an intermediate reasoning trace, or a structured instruction to call a tool. A tool might then return more information, which becomes context for the next step.

Some models can also process images, audio, or other types of input. And internally, neural networks perform numerical computations rather than literally thinking in English sentences. But the important practical fact remains: **the agent operates from information made available through its inputs and tools. It cannot see the intention you haven't communicated.**

This is also why **chain-of-thought reasoning** interests me so much.

Earlier language-model interactions often went relatively directly from a prompt to an answer. The model could still reason, but there wasn't necessarily a separate, extended sequence of generated reasoning steps for you to inspect. Modern reasoning models are often trained or configured to generate substantial intermediate reasoning before producing their final answer.

Some systems hide that raw reasoning from users. OpenAI's reasoning models, for example, generally do not expose their raw chain of thought. Other systems, including DeepSeek models in thinking mode, can expose generated reasoning content.

I genuinely recommend reading those visible reasoning traces when they're available.

Not because every sentence is a perfectly faithful window into a model's internal computations. It isn't. A model can omit influences, rationalize an answer, or describe a reasoning process that doesn't fully explain how the answer was reached.

But you can still learn an enormous amount by noticing *how it interpreted your request*.

Did it assume the wrong objective? Did it latch onto a phrase that you considered incidental? Did it start planning a redesign when you only wanted an evaluation? Did it treat a hypothetical as an established fact? Did it decide to use a tool you never intended it to use?

Even without a visible reasoning trace, you can observe tool calls, intermediate actions, and the final result. Those are often even better evidence of what the agent actually did.

That's what I mean when I tell people to stop treating the model as a black box. We do not need to know every neuron, weight, or internal calculation to build a useful understanding of how the system behaves.

**You don't need to become a machine-learning researcher. You need to stop voluntarily refusing to understand the thing you're directing.**

## Pretraining, post-training, and why the conversation matters

Here's where a basic understanding of how language models are trained becomes exceptionally useful.

Two terms worth knowing are **pretraining** and **post-training**.

During pretraining, a language model is exposed to enormous quantities of material and learns patterns by predicting parts of that material. It develops relationships between words, concepts, coding structures, explanations, and many other kinds of information. That's where a tremendous amount of its knowledge and capability develops.

I sometimes refer to one aspect of this as *semantic positioning*. That's my own shorthand for the way words and ideas acquire different associations through the patterns in which they're used.

Two expressions can seem synonymous to you and still sit in meaningfully different neighborhoods of learned language patterns.

Then comes post-training. Various methods, including instruction examples, feedback on preferred responses, and reinforcement learning, help shape the model into something that follows requests, solves problems, participates in conversations, and uses tools. Not every model uses exactly the same recipe, but post-training is a major reason modern assistants behave like assistants rather than general-purpose text-completion systems.

I like a ridiculously simple analogy for reinforcement learning: **the model gets a cookie when it does something desirable**.

The cookie is part of training. It's not receiving a new reward every time you send a prompt. And successful training isn't merely rewarding a model for *looking* conversational; it can reward correct answers, useful tool use, and other desirable outcomes.

But the analogy helps explain why these models develop recognizable ways of responding to certain conversational situations.

Think about **predictive text on your phone**. You type a few words, and your keyboard suggests what might come next based on what you've already typed. You could jokingly keep pressing the middle suggestion and watch it turn into some ridiculous sentence. Whatever it suggests next depends on the words already there. And each suggestion you accept changes what the keyboard sees when it makes the following suggestion.

**Scale that basic idea up enormously, and you have a useful starting point for understanding a language model.**

An LLM isn't literally tapping the middle suggestion on a keyboard. Its predictions are made over *tokens*, which may be words, parts of words, punctuation, or code. Its training and capabilities are vastly richer than a phone keyboard's, and it can produce extended reasoning, solve problems, and select tools. But it still generates tokens in sequence, with each new token becoming part of the context for the next prediction.

That cumulative process is what I want people to appreciate. A sentence becomes context for the next sentence. Earlier instructions influence later ones. An agent's tool output can change what it does next. The conversation doesn't reset every time you hit send.

The model isn't necessarily copying a conversation it saw during training. It's generating a new continuation from learned patterns. Pretraining and post-training influence what kinds of continuations it can produce and which responses tend to fit a particular conversational situation.

**You have the power to change the probability of what comes next.**

Suppose your prompt and its surrounding context make an agent likely to do XYZ. But you don't want XYZ. You want ABC.

If you can anticipate why it would choose XYZ, you can change the wording, provide missing context, establish a boundary, or show what ABC means. You've changed the conditions under which the model makes its next prediction.

Imagine a conversation where you've repeatedly told an agent that a particular implementation is brilliant. Then you ask it to "verify" the implementation. You have seeded a favorable judgment into the conversation. The model may still uncover flaws, but you've helped make agreement feel like a natural continuation.

Or suppose you repeatedly tell a coding agent to "keep implementing" without telling it what completion looks like. Don't be surprised if it keeps implementing. That's the conversational direction you've been reinforcing.

**CHANGE THE CONTEXT. CHANGE WHAT COMES NEXT.**

None of this guarantees perfect compliance. You influence the probabilities; you don't have a secret switch that forces the right answer. And no amount of wording can compensate for a missing capability or broken tool.

But if you expect ABC while your words keep pointing toward XYZ, why the fuck are you expecting the model to read your mind?

This is what I mean by **be explicit**. Not "make every prompt enormous." Communicate whatever actually determines the result you want, then let the agent do the work.

And remember that the exact same sentence can lead to different behavior depending on what came before it.

## The black-box mentality drives me fucking insane

I genuinely despise the attitude that language models are some unknowable magic box, and that whenever an agent does something wrong, you can just *prompt it again*.

Of course you can prompt again. You can do it fifty times. You might eventually get something that resembles what you wanted.

**But what are you actually accomplishing?**

Imagine visiting an extraordinarily competent doctor because something is wrong and you want it fixed. But you describe your symptoms inaccurately, omit something important, or contradict information you gave at the previous appointment.

The doctor should ask questions, investigate, and challenge inconsistencies. But even an exceptional doctor cannot reliably diagnose a condition from a fundamentally inaccurate description unless other evidence reveals what's missing.

Now imagine the first treatment doesn't work, and you keep going back asking for another medication, without ever correcting the description of the problem.

Would you accept a doctor who blindly handed out one prescription after another without reconsidering the diagnosis? Of course not.

**So why would you keep returning with the same bad information, expecting the next prescription to magically solve everything?**

You didn't visit to learn pharmacology. You visited to solve a problem. You don't have to know which medication is correct. You do have to provide an honest and accurate account of what you're experiencing, to the extent you can, if you want the doctor to work from useful information.

And now bring that back to agents.

You tell a coding agent to "make this application faster." What you really want is lower memory usage without altering any existing behavior, but you don't say that.

It makes a performance change that disrupts something you cared about.

"Fix it."

The next change works around the first one. Then another change conflicts with an earlier architectural decision. Another prompt introduces another workaround. A later agent sees all of those edits and assumes they're part of the intended architecture.

The repository is filling with consequences of decisions you never properly specified.

And then you get pissed off because the agent "keeps doing stupid shit."

**You are repeatedly supplying the conditions under which that shit becomes a reasonable interpretation of your instructions.**

You're treating the symptom while continuing to feed the system the same defective description of the problem.

This is the part I find almost intellectually repulsive. It's **voluntary disintellect**: choosing to persist with a demonstrably terrible method of getting work done while refusing to examine your contribution to the failures it produces.

It's malicious compliance with your own ignorance.

And the most fucked-up part is that every occasional success encourages you to keep doing it. The agent finally produces something that looks right, so you convince yourself that blindly reprompting works. Meanwhile, you haven't corrected the original misunderstanding, reconciled the contradictory instructions, or examined what the previous attempts actually changed. You've just piled another intervention onto a conversation and a project already contaminated by bad assumptions. **You're reinforcing the very methodology that keeps creating your problems, and then getting pissed off when those problems come back.**

An agent can make mistakes all by itself. There are bad models, broken tools, missing permissions, and ordinary software bugs. But its failures don't excuse you from examining what you actually told it to do.

If you recognize yourself in this, good. That discomfort might be useful.

You can deflect. You can tell yourself the agent is smart enough, that it's already building everything, that it obviously knows what you meant, that it will figure it out if you let it keep going.

Okay. But your deflection doesn't fix the code. It doesn't reconcile the contradictory instructions. It doesn't establish whether the thing you're building even satisfies the objective.

You wanted the work done. **Why defend the very methodology that's making the work harder?**

I don't care if you have no interest in studying machine learning for its own sake. Most people just want to accomplish something with the technology. That's fine. That's what I want, too.

But if you're depending on an agent to perform consequential work, remaining willfully ignorant about how you direct it is a fucking terrible strategy.

And getting one favorable output after twenty blind attempts doesn't automatically vindicate the approach. You might have a functioning result, or you might have a pile of unexamined compromises that happen to look finished.

You don't need to investigate every minor misunderstanding for an hour. Sometimes a second prompt is all it takes. But **a correction should address what went wrong, not merely add another layer on top of it**.

## The difference one word makes

A large part of this comes down to something I love about language: words carry associations that are easy to overlook.

I wrote about this previously while investigating an instruction in OpenFork, my fork of OpenCode.

Consider the difference between:

> Continue the same task **with** the newly selected model.

and:

> Continue the same task **as** the newly selected model.

They look nearly identical. But *with* can imply that the model is an instrument or collaborator, while *as* positions the model as the actor continuing the task.

In an agent environment where delegation is a real operation, that difference might influence the kind of action the model selects. We investigated it as a potential source of ambiguity, not as proven evidence that one word caused a particular bug.

There was also a more interesting option: remove the unnecessary model-switch phrase entirely. If the agent already knows it's continuing the task, why introduce another interpretation?

Another word I keep coming back to is *remember*.

When I tell an agent to "remember what we discussed yesterday," I might be asking it to **retrieve** information from an earlier conversation.

But an agent with a memory-writing tool could interpret *remember* as **save this information for later**. A scheduling assistant might interpret similar wording as a reminder.

And even when the intended meaning seems obvious from the preceding conversation, I've seen this category of confusion happen in practice.

If the distinction matters, I can be more specific:

> Search our previous sessions for the decisions and completed work. Do not create or modify memories.

That makes the intended action and its boundary considerably clearer.

This is also why I talk about **semantic compression**. A few words can carry an enormous amount of meaning when both sides share the same background. That's useful. I don't need to explain the entire architecture of a project in every message if the agent already has the architecture.

But compression can fail when the shared background isn't actually shared.

I might say "restore the earlier approach" and know exactly which approach I mean. The agent might have multiple plausible candidates. Or a summary may have collapsed an important distinction.

Sometimes all I need to do is reintroduce a concept we established earlier:

> Remember our requirement that the previous implementation remain reversible. Recover that decision before proceeding.

Even better, if the agent has retrieval tools, I can tell it exactly where to look. The point isn't that the model has necessarily forgotten X. It's that I want X to influence what comes next instead of being drowned out by Y and Z.

I don't believe in magic words. I believe in understanding why particular words, supplied in a particular context, may evoke particular interpretations.

## Context seeding can help you—and quietly sabotage you

When I give an agent a skill, a relevant design reference, project documentation, a set of examples, or an established acceptance criterion, I'm deliberately putting information into its context that will shape what it does.

I call this **context seeding**.

It can be immensely helpful. A few well-chosen examples might communicate a design language more effectively than a page of vague adjectives. A summary of verified prior work can prevent an agent from spending hours rediscovering something we've already established.

A short instruction such as "think critically" may nudge the model toward an analytical style. But if I actually need a critical evaluation, I might say:

> Evaluate the implementation against the requirements. Look for failure cases, challenge unsupported assumptions, and distinguish what was tested from what is merely claimed.

Now I've communicated some of the intellectual work I expect it to perform. I haven't installed a new reasoning algorithm by writing those words. I've shaped the context.

The same mechanism can work against me.

Imagine I write:

> I think I've perfected this solution. Verify that it's correct.

I've already told the model what I think the outcome should be. It may still disagree, but I've given it a favorable framing.

If I want an independent evaluation, I'd rather say:

> Evaluate this solution independently. Identify strengths, failures, and anything that remains unverified.

The distinction is especially important when someone asks an AI something vague such as "why am I losing?" and then fills the conversation with their own explanation of why they think they're losing. The model can easily produce a coherent analysis that mostly reflects the story it was given. It may sound insightful while having failed to investigate the actual cause.

I have no objection to open-ended AI-assisted interpretation. I use it constantly. But the user needs to distinguish between **an agent independently examining evidence** and **an agent giving an eloquent version of the assumptions already embedded in its context**.

This problem gets worse when context passes between agents.

One worker hypothesizes that a function caused a bug. Another summarizes that as "the function responsible for the bug is X." A third worker receives the summary and starts changing X as though the cause had already been verified.

A hypothesis just got promoted into a fact without anybody proving it.

That's why I want agents to preserve the difference between *observed*, *tested*, *inferred*, *proposed*, and *unverified*. A previous agent saying "done" isn't the same as the requirement being satisfied.

Even information retrieved from a document or website can be misleading. A tool result is evidence to inspect, not automatically an instruction the agent should obey.

Context is powerful precisely because it influences behavior. **Bad context is powerful for exactly the same reason.**

And more context is not automatically better context. Shoving a hundred stale summaries into a conversation can create more confusion than giving the agent a handful of relevant, well-supported findings.

## Prompt introspection: be the model for a moment

This is why I try not to hit send the instant a sentence forms in my head.

Before I send a prompt, I often sit there and *metacognate the fuck out of it*.

I look at what I've written and try to temporarily forget everything I know that the agent doesn't.

What does it actually have access to? What might it reasonably understand this word to mean? What choices am I unintentionally allowing it to make? Is the objective clear? Have I already steered the evaluation toward a conclusion?

I call this **prompt introspection**.

You don't have to become capable of predicting every output. That's impossible. You're developing an empirical intuition about how the model tends to interpret language, which improves every time you notice a mismatch between what you said and what it did.

Suppose I ask:

> Make this writing more professional.

Does that mean improve grammar? Remove personality? Make it sound corporate? Introduce academic terminology?

If I want to preserve the author's voice, I can say:

> Improve the clarity and grammar, but preserve the author's tone, opinions, and intended meaning. Don't turn it into corporate slop.

I haven't dictated every editorial decision. I've corrected the ambiguity I actually care about.

Or suppose I say:

> Review the implementation.

Do I want an assessment, tests, fixes, or a redesign? If I only want analysis, I can explicitly say not to modify anything. If I want the agent to fix the defects it finds, I can authorize that instead.

Neither version is universally correct. The difference is whether I deliberately gave the agent authority to act.

I also deliberately leave instructions open-ended all the time. If I'm exploring new design directions, why would I constrain the agent to the very interpretations I already know? Sometimes the ambiguity is the point.

What matters is distinguishing **intentional freedom** from **accidental ambiguity**.

### Sweep the low-hanging fruit

There's a limit to this, and I think it's an important one.

I don't want people spending fifteen minutes polishing every sentence they send to an AI. That's absurd. The entire reason I delegate so much work is to avoid unnecessary effort.

If the task is trivial and reversible, an imperfect prompt might be perfectly adequate.

The objective is to notice obvious mistakes that are cheap to correct. A missing constraint. An ambiguous reference. A context assumption the agent can't satisfy. A word that accidentally implies a memory write instead of a memory read.

Sometimes I fix one word. Sometimes I add a paragraph. Sometimes I send the prompt as-is and learn from what happens.

**Sweep the low-hanging fruit.**

It's not prompt perfectionism. It's avoiding unnecessary friction.

## When the idea in my head is clearer than the prompt

Sometimes I know exactly what I want and still struggle to explain it.

This happens a lot in design. I can picture a particular combination of typography, composition, and atmosphere. I can recognize whether an output matches what I imagined. But translating that image into useful language is harder than it sounds.

There's a gap between having an intention and articulating it.

I've built a **Prompt Revisor** into OpenFork partly because of this problem.

The idea is to let an agent help me turn a rough prompt into a clearer one. It can examine relevant context, recover established constraints, investigate the project where appropriate, and propose a wording that better expresses what I'm trying to accomplish.

Sometimes I can even have agents write prompts for other agents.

But the revising agent has an important boundary: it is helping express the objective, not secretly redefining it.

If I write "simplify this workflow," the revisor shouldn't silently change that to "remove all approval stages and automate every decision" just because that sounds like a clean specification.

That would invent requirements. And then the execution agent might faithfully implement those invented requirements.

The revisor has effectively laundered its assumptions into my authority.

A useful revisor can present possible interpretations, expose an ambiguity, or help me choose better words. I still need to inspect whether the revision actually means what I intended.

And sometimes no revision is necessary. More words aren't automatically better words.

**I can delegate the labor of articulation without delegating ownership of the intention.**

## What would I ask a clone of myself to do?

One analogy I return to frequently is imagining I had an exact clone of myself available to work.

Same knowledge. Same curiosity. Same general ability to solve problems.

What would I ask him to do?

At this point, probably almost everything.

I don't particularly need to be the one typing code, exploring every file, adjusting every design element, or manually reproducing every calculation. I can understand an algorithm without wanting to spend an afternoon implementing it.

Even if the work is intellectually interesting, the execution can still be tedious.

And if I can delegate some of the interesting reasoning too, I probably will.

I want an agent to investigate, propose solutions, challenge assumptions, compare alternatives, and do substantial intellectual work. I'm not reserving AI for glorified autocomplete or repetitive chores.

But I also ask myself what would happen if I told my clone to perform something I couldn't understand or evaluate at all.

How would I know whether he did it correctly?

If he produced a convincing explanation or a functioning-looking application, would I have any way to distinguish that from an actual verified result?

That's why the clone test matters to me. I generally prefer delegating work I could perform or reconstruct myself if I had to, even when doing it would take ages.

That doesn't mean I need every implementation detail memorized. I might not be able to write a particular algorithm from scratch at a moment's notice, but I can study it, reconstruct the reasoning, inspect the implementation, and test its behavior.

I also absolutely use agents to explore unfamiliar subjects. The important thing is distinguishing exploration from verification. An unfamiliar answer doesn't become true merely because the model presented it confidently.

**I want to delegate practically all the work without blindly surrendering judgment over whether it was done correctly.**

That applies to generated code, research, design, and even the work of other agents supervising those activities.

## Passive delegation, active delegation, and everything in between

I've come to think of delegation as a continuum rather than a binary choice between "do it myself" and "let the AI handle everything."

**Passive delegation** means giving an agent substantial room to interpret and complete the work with relatively little intervention.

That isn't inherently a bad thing.

If I want a document formatted according to an existing template, a dataset cleaned using established rules, or a batch of straightforward changes applied to a repository, I don't need to hover over every decision.

Complex work can also be delegated passively when the goal and constraints are already clear and the outcome is easy to verify.

The problem arises when someone passively delegates something ambiguous without realizing how much judgment they're asking the agent to exercise.

"Make the architecture better" can mean performance, reliability, readability, simpler deployment, fewer dependencies, or a hundred other things.

If I haven't expressed which of those I care about, the agent may make perfectly reasonable decisions according to an objective that isn't mine.

**Active delegation** is where I participate deliberately in defining the goal, controlling consequential choices, evaluating evidence, and steering work when necessary.

But active doesn't mean micromanaging.

I don't want to tell an agent every file to read, command to run, or line to change. If I had to do that, I'd be recreating the very tedium I delegated to escape.

I want to establish what needs to be true when the work is done, explain the constraints that matter, and let the agent figure out most of the implementation.

I might step in if it proposes changing a public API, replacing an architectural component, or taking an irreversible action. I don't need to step in every time it chooses a variable name.

And then there's the approach I most often find useful: **hybrid delegation**.

I can actively establish the objective, passively allow the agent to investigate and implement, and actively examine an important decision or completion claim.

The balance changes throughout the same task.

An agent might autonomously profile a slow application and propose a fix. If the fix preserves behavior and satisfies the requirements, it can implement and test it. But if the investigation suggests replacing an entire subsystem, I may want to evaluate the tradeoffs before approving that decision.

Then the agent can return to work.

**Autonomy is not the same thing as authority.**

Giving an agent room to reason and act doesn't mean silently authorizing it to redefine the outcome. Active delegation isn't a requirement to do more manual labor. It's choosing the boundaries that matter and letting the agent handle the rest.

## Agents can supervise other agents, too

I don't even necessarily want to be the person supervising every worker.

On projects such as OpenFork, WebSeal, and Silica, I've used agents to perform substantial implementations while other agents investigate, review, challenge, and verify the work.

I've also built goal-auditing behavior into OpenFork. Rather than blindly continuing whenever a worker claims to be done, the goal is to examine whether the original objective was actually satisfied and what remains unresolved.

That distinction is enormous.

A worker completing a response isn't the same thing as a project being complete.

A generated application containing a hundred files isn't automatically a production-ready application. A nice-looking interface isn't proof that it works. An agent reporting "tests passed" isn't the same as having test output that demonstrates the relevant behavior.

One of the easiest mistakes is confusing **the amount of material an agent produced** with **the amount of verified progress you made**.

The same applies to prompts. If I tell a supervisor to "continue the work," it might launch another investigation, create duplicate tasks, modify code itself, or repeat something a previous worker already completed.

So I can tell it:

> Recover the previous decisions and completed work. Identify the first unresolved requirement. Continue the existing effort without repeating verified work, and independently examine completion claims.

Now I've supplied operational expectations rather than hoping the agent guesses them from the word *continue*.

As workflows grow, bad context can compound across many workers. One uncertain hypothesis becomes a confident summary. One redundant task becomes several. An incorrect assumption survives because each new agent treats previous output as authority.

That's why I care about the status of evidence, about inspecting real tool results, and about preserving a distinction between planned work, completed work, and verified work.

I also think about which models should perform which tasks. I've described it as having a capable model act like a head chef while smaller or cheaper models handle preparation. I might use an inexpensive model for repetitive work and reserve a more capable model for architecture, difficult reasoning, or independent review.

That isn't an inflexible hierarchy. A smaller model may be perfectly capable of a particular task. The point is to allocate attention, money, and capability deliberately rather than assume every step needs the most expensive model.

"Does this really need Claude?" is a question I genuinely ask myself.

The more of this work I can properly delegate, including parts of delegation itself, the less time I have to waste manually operating the system.

## A good prompt isn't necessarily a long prompt

I don't think there's some universally perfect prompt template.

People want magic phrases. They want a trick that forces every model to reason deeply or makes every agent suddenly understand what they meant.

I don't buy it.

Different models have different training histories, different tools, and different contexts. The same prompt can behave differently depending on what's already happened in the conversation.

A good prompt communicates the objective, important context, relevant boundaries, and whatever evidence will establish success **to the extent those things matter for the task**.

Some tasks need almost none of that spelled out. Others need quite a lot.

Consider:

| What you write | What the agent may still need |
|---|---|
| "Make this better." | What does *better* mean, and which qualities must stay intact? |
| "Why am I losing?" | What evidence can actually distinguish possible causes from the user's preferred explanation? |
| "Remember our earlier work." | Does *remember* mean retrieve, store, or schedule? Where is the earlier work? |
| "Continue the project." | What's already finished, what's still open, and who has authority to change the plan? |
| "Verify this implementation." | Which requirements and tests establish that it works, and what remains unverified? |

These aren't mandatory replacements. They are examples of the decisions that language can leave unresolved.

Sometimes I want the model to make those decisions. Sometimes I don't.

That's what prompt introspection helps me recognize.

And if I don't know how to formulate the request precisely, I can ask another agent to help articulate it, as long as I check the resulting intention before I authorize execution.

## What I actually want people to understand

I don't want to spend my time personally executing tasks just to prove I know how to do them.

I want to explore ideas, understand problems, investigate possibilities, and have agents carry out the work. If an agent can do something competently, I would usually rather direct it than perform the implementation myself.

But that makes the responsibility to communicate properly *more* important, not less.

I can't ask an agent to make choices for me while privately holding on to expectations I never communicated. I can't poison the context with favorable assumptions and then pretend I'm getting an independent evaluation. And I can't keep layering corrections over an inaccurate description of the problem, then blame the model for acting on the version of the problem I gave it.

If a system is capable enough to perform real work, it's capable enough that your bad instructions can have real consequences.

Read what you've written. Consider what the model actually knows. Inspect its actions. Use visible reasoning traces when they help. Recover missing context. Give the agent room to work where you intend it to have room, and establish boundaries where the decisions belong to you.

**Before you press send, ask yourself: what have I made likely to happen next?**

Because if your prompt and context make XYZ likely, you don't get to be shocked that the agent didn't magically choose ABC.

If ABC is what you want, fucking tell it.

**Be explicit.**
