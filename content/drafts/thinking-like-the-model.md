---
title: "Thinking Like the Model"
date: 2026-11-09
author: "Jackson Cummings"
status: published
issue: "J–008"
slug: thinking-like-the-model
category: "Essays"
summary: "A practical introduction to prompting and agent delegation: what models can see, how context shapes their behavior, and why blindly reprompting can make a bad result worse."
tags: ["Prompt engineering", "AI agents", "Delegation", "Context engineering", "Prompt introspection", "OpenFork"]
---

# Thinking Like the Model

*On the information we give AI agents, the decisions we let them make, and the problems we create when we don't think about either.*

I barely write code anymore.

Occasionally I'll make a small change myself, but even then, I'd usually rather delegate it. The same goes for research, design work, investigating bugs, testing implementations, and most of the other things I spend my time on. I'd estimate that properly delegating the work is preferable to doing it manually in about 99% of the situations I encounter.

**Properly** is doing a lot of work in that sentence.

When delegation goes badly, it can be more tedious than doing the task yourself. You correct the agent, it misunderstands the correction, you try again, and suddenly you're spending more time untangling the result than you would have spent on the original problem.

When delegation goes well, I can explain what I want, give the agent the relevant information, and let it get on with the work. I can still investigate the interesting parts, question its decisions, and evaluate what it produces. I just don't have to personally execute every step.

I think a lot of the frustration people have with AI agents comes from misunderstanding what they're actually communicating to them. People assume the model understands the idea in their head because the sentence they wrote makes sense *to them*. When it doesn't, they keep sending more sentences.

I've spent a ridiculous amount of time working with coding agents, and the more I use them, the more convinced I am that **proper delegation begins before you press enter**.

You need a basic understanding of what the model receives and how your language influences what it does. Not a degree in machine learning. Just enough to stop accidentally working against yourself.

## What you're actually giving the model

Start with the most ordinary thing imaginable: a prompt.

A prompt is the instruction or message you send to a model. It might be a question, a request to edit a document, or a task such as "find and fix this bug."

But the model doesn't receive the idea as it exists in your head. It receives the words you wrote, along with whatever other information the application gives it.

That surrounding information is **context**.

In a chat, context can include earlier messages. In a coding agent, it might include project instructions, files it has read, test results, and the output of tools it has used. The application can also provide instructions about how the agent should behave and which actions it is allowed to take.

All of this matters because the model uses the context available to it when deciding what to say or do next.

There is also a limit to how much information it can work with at once. This is called the **context window**. Think of it as the model's working space for the current interaction. It isn't an unlimited record of every conversation you've ever had. An application might retrieve old information, summarize earlier work, or leave some of it out entirely.

That's why telling an agent to "continue where we left off" can be a perfectly reasonable instruction in one situation and a terrible one in another. Does it actually have the previous work? Does it know what was completed? Does it know what remains unresolved?

If you don't know, why are you assuming it does?

Consider asking a coding agent:

> Fix the crash in my application.

Maybe the agent has already seen the crash logs, knows which version is affected, and understands the relevant architecture. Fine. That's probably enough.

But if this is its first encounter with the problem, you might have given it almost nothing to work from.

Compare that with:

> The application crashes after being open for a while. Inspect the logs, establish what is causing it, and verify the correction. Preserve unrelated behavior.

That's not some magical prompt formula. It's the same request with a little more of the information that determines success.

**You can't expect an agent to work from context you never gave it.**

## Why the wording matters

Models learn from enormous amounts of language, code, and other examples. Their initial training teaches them patterns: how words relate to one another, how explanations are structured, how code works, and how different kinds of text tend to continue.

Additional training shapes how they respond to instructions, carry on conversations, solve tasks, and use tools.

I sometimes explain that second part with a deliberately crude analogy: the model gets a cookie when it does something desirable.

The cookie happens during training, not while you're chatting with it. It isn't being rewarded anew every time you send a message. But its behavior today reflects patterns that were encouraged during training.

In everyday terms, **the model uses what came before to work out what should come next**.

And you get to influence what came before.

If your wording makes a particular interpretation seem natural, you may make that interpretation more likely. If you want something else, you need to put that intention into the context. You can't silently expect the model to prefer the version of the request that only exists in your imagination.

This is why I find individual words so interesting.

I've written before about an OpenFork instruction involving a model switch. One version said to continue a task *with* the newly selected model. Another said to continue *as* the newly selected model.

To a human, those sentences might sound nearly identical. But *with* can suggest using the model as an instrument, while *as* identifies the model doing the work. In an environment where agents can delegate to other agents, those interpretations can imply different actions. We investigated the distinction as a possible source of confusion, not as a proven cause of a particular failure. Removing the unnecessary phrase altogether was another option.

An even more obvious example is the word *remember*.

If I tell an agent to "remember what we did yesterday," I might mean **retrieve** yesterday's conversation. But an agent with memory-writing tools might interpret that as an instruction to **save** something for later.

Those are completely different actions.

When the distinction matters, I can say:

> Search our earlier sessions for the decisions we already made. Don't create a new memory.

I haven't written a longer prompt for the sake of making it longer. I've clarified what I want the agent to do.

This is what I mean by being explicit. The right word can matter more than another paragraph of elaborate instructions.

## The black-box mentality drives me fucking insane

I genuinely despise the attitude that large language models are some unknowable magic box, and that when they do something wrong, the solution is to blindly *prompt again*.

Of course you can prompt again. You can do it fifty times. You might even get what you wanted on the fifty-first attempt.

**But what are you actually accomplishing?**

If the information you're giving the agent is bad, you may be asking it to solve the wrong problem over and over again. If your instructions are contradictory, you're making it choose between competing versions of what you want. If it has already made an unwanted change and you don't account for that change, the next prompt may build on the mistake instead of correcting it.

And then people wonder why the fuck the agent keeps doing things they never wanted it to do.

Imagine visiting an extraordinarily competent doctor. You want to get better, so you describe your symptoms. But the description you give is inaccurate. You leave out an important detail, misunderstand another, and return the following week with a contradictory account.

The doctor should ask questions, examine the evidence, and challenge inconsistencies. Competence matters. But even the best doctor cannot reliably diagnose a condition from a fundamentally inaccurate description unless some other evidence reveals what's missing.

Now imagine you keep returning, demanding another medication each time the previous treatment fails, without ever correcting the original description of the problem.

Would you accept a doctor who blindly prescribed medication after medication without reconsidering the diagnosis? Of course not.

**So why would you keep returning with the same bad information, expecting the next prescription to magically fix everything?**

You didn't go to the doctor to learn pharmacology. You went to solve a problem. You don't need to know which medication is appropriate. But providing an accurate account of your symptoms is part of giving the doctor a fair chance to help you.

**The same applies to agents.**

Suppose you ask a coding agent to "make the application faster," but the thing you actually care about is reducing memory usage without changing how the application behaves.

You never say that.

The agent makes a plausible performance change that alters something you wanted preserved. You say, "No, fix that." The agent makes another change. That breaks an assumption elsewhere, so you tell it to fix that too.

Now you've got three sets of changes, several competing instructions, and an increasingly complicated codebase. The next prompt inherits the consequences of all the previous ones.

You're accumulating problems while convincing yourself that each new prompt is progress.

And here's the part I find especially infuriating: **you helped create the conditions for the behavior you're now blaming the agent for**.

That doesn't mean an agent can never be at fault. Models make mistakes. Agent runtimes have bugs. Sometimes an instruction is clear and the model still gets it wrong.

But you cannot keep misrepresenting the task, refuse to examine what went wrong, and then act shocked when an extraordinarily capable system keeps working from the wrong premises.

That's what I mean by **voluntary disintellect**. It's malicious compliance with your own ignorance: continuing to follow a terrible problem-solving methodology because you don't want to examine the part you're contributing to it.

If you recognize yourself in this, good. That discomfort might be useful.

You can deflect and tell yourself the model is smart enough, that it will figure everything out, that it already did most of the work anyway. You can blame the model for every bad outcome and treat every new prompt as a fresh start.

But your deflection doesn't fix the project. It doesn't correct the context. It doesn't undo the previous changes.

You are the one who wanted something done. Defending the methodology that's making it harder to accomplish only hurts that objective.

And no, the model isn't receiving a new training reward whenever you do this. You're reinforcing **your own bad workflow**, while the conversation and the artifacts the agent changes can keep carrying its consequences forward.

I don't need everyone to become fascinated by machine learning. Most people don't want to study language models. They want their work done.

**Then stop voluntarily making that work harder.**

## Think about what you're about to send

I call this habit *prompt introspection*.

Before I send an instruction, I try to read it as if I were the model receiving it. I sometimes describe that as trying to *think like the model*.

I'm not pretending I can calculate exactly how a neural network will respond. I've simply spent enough time interacting with these systems to recognize some of the ways my language can be interpreted.

What does the agent actually know right now? Does it have the relevant files or earlier decisions? What am I asking it to accomplish? What might it reasonably think I'm giving it permission to do?

Those questions don't need to become a ceremony. Sometimes the entire thought takes two seconds.

For example:

> Review this implementation.

Does that mean give me an assessment? Run tests? Fix the problems it finds? Rewrite the architecture?

Maybe I deliberately want the agent to decide. But if I only want an assessment, I can say:

> Review the implementation, run relevant tests, and report the problems you find. Don't modify the code.

If I want it to investigate and repair the implementation, I can say that instead.

Neither prompt is universally better. **The better prompt is the one that communicates the authority I actually intended to give.**

And sometimes ambiguity is useful. If I'm exploring a design direction, I might want the model to propose interpretations I haven't considered. I don't need to specify every font, shape, or color before asking for ideas.

The problem is *accidental* ambiguity: leaving something important unspecified while assuming the model will somehow know which interpretation you wanted.

### Sweep the low-hanging fruit

I don't spend ten minutes engineering every trivial message. That would be a ridiculous way to use a tool I'm relying on to save time.

I look for the obvious problems.

An ambiguous word. A missing constraint. A reference to context the agent may not have. An instruction that authorizes more than I intended. A favorable assumption that might contaminate an evaluation.

If I notice one, I correct it. If the request is low-stakes and easy to retry, I may simply send it and see what happens.

**Sweep the low-hanging fruit.**

Proper prompting isn't about maximum verbosity. It's about removing avoidable misunderstandings without making communication more expensive than the work itself.

## You can accidentally tell the model what conclusion to reach

There's another part of context that deserves attention: the assumptions you put into it.

Suppose I write:

> I've built a really elegant solution. Verify that it's correct.

I've already supplied a favorable description before the agent has inspected anything.

It might still disagree with me. But I've given it a direction to lean.

If I want an independent evaluation, I'd rather say:

> Evaluate this implementation against the requirements. Identify what works, what fails, and what hasn't been verified.

Both are prompts. Both are context. Only one avoids telling the model what I hope it will find.

I see a similar problem when agents pass information between one another. One agent suspects a particular function caused a defect. Another summarizes the conversation as though that suspicion were a confirmed finding. The next agent takes it as established fact.

Now a guess has become the foundation for more work.

This is why I care about preserving earlier decisions and distinguishing what an agent actually tested from what it merely proposed. And it's why I often explicitly tell an agent to recover prior work before proceeding, rather than repeat investigations we've already completed.

**Context is powerful because it influences what the model does. Bad context is powerful for exactly the same reason.**

## Sometimes I know what I want but can't say it

There's a reason I don't think the answer is simply "write better prompts."

Sometimes I have a very clear idea of what I want and an awful time translating it into language. I encounter this constantly with design. I can picture a particular visual direction and recognize it when I see it, but describing the exact qualities that make it work can be surprisingly difficult.

That's part of why I built the **Prompt Revisor** into OpenFork.

Its job is to help turn a rough instruction into a clearer one. It can use relevant session or project context, identify ambiguities, and propose wording that's easier for an execution agent to act on.

But a revisor can make the same mistake as any other agent. If I say "simplify this workflow" and it silently rewrites the request to mean "remove all approval steps," it has invented a decision I never made.

A longer, more detailed prompt is not necessarily a more faithful prompt.

So I can delegate the *articulation* of my intent, inspect the revision, and decide whether it actually reflects what I meant.

I don't need to personally struggle through every sentence if another agent can help. I do need to recognize when that agent has changed the objective.

## Delegation is the point

I often use a hypothetical question to decide how I want to work with agents: *what would I ask a clone of myself to do?*

If I had another version of myself who could investigate an algorithm, write the code, run the tests, and explain the result, I'd give him the work. Probably almost all of it.

I like understanding things. I like developing ideas, making architectural decisions, experimenting, and figuring out why something works. I don't particularly need to be the person typing every line of code or manually performing every step.

I also don't restrict agents to mechanical tasks. I want them to reason, investigate, propose alternatives, and challenge assumptions. That's a huge part of their value.

The part I care about retaining is the ability to judge what comes back.

If I don't understand a domain, I can absolutely use agents to help me explore it. But I shouldn't treat an output as verified merely because the same agent that produced it says it's correct. I need some way to evaluate the work, whether that's understanding the mechanism myself, checking evidence, running tests, or having a genuinely independent evaluation performed.

That's the part of the clone analogy that matters to me: **I want to delegate the work without blindly surrendering judgment over whether it was done correctly.**

I think of delegation as varying between passive and active.

Passive delegation is perfectly reasonable when the goal is clear, the work is reversible, or I already trust the process. I can give an agent a task and let it complete it with little intervention.

Active delegation is what I use when the objective, boundaries, or evidence require closer attention. But active doesn't mean micromanaging. I don't want to direct every file read or command. I want to establish what we're trying to achieve, let the agent do its work, and step in at the decisions that actually matter.

Most of my more complicated work ends up somewhere between the two.

I might define the outcome and the constraints, let an agent investigate and implement independently, and return when it needs a consequential decision or claims to have completed the task.

I've used this kind of supervision across OpenFork, WebSeal, Silica, and other projects. Agents can work alongside other agents, investigate in parallel, and even supervise one another. But the more capable and autonomous the workflow becomes, the more expensive a poorly communicated objective can be.

One ambiguous instruction can send several workers in the wrong direction. One unverified assumption can be repeated across multiple sessions. One missing instruction to check completed work can cause an agent to spend time doing something we've already finished.

That's why I spend so much attention on the way I delegate, even though I rarely want to perform the underlying work myself.

## Be explicit

There's no magic phrase that guarantees an agent will understand you. You don't need a giant prompt template, and you don't need to become an expert in how neural networks are built.

You do need to appreciate that the model only has the information available to it, that your wording changes how that information can be interpreted, and that an agent may turn an interpretation into an actual action.

If you want it to retrieve information, say retrieve. If you want it to modify something, say what should change and what needs to remain intact. If you want it to evaluate your idea, don't preload the answer you hope it gives you.

And when something goes wrong, examine the problem you're presenting before you pile another instruction on top of it.

I delegate almost everything because, when I do it properly, it works better for me than doing the work manually.

**I don't want to do the agent's job. I want to stop getting in the way of the job I asked it to do.**
