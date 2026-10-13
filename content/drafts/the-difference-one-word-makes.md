---
title: "The difference one word makes"
date: 2026-10-12
category: Engineering
stage: Working notes
issue: "E–011"
slug: the-difference-one-word-makes
---

# The difference one word makes

## A perfectly reasonable instruction

Imagine a chat interface attached to a language model. The model is acting as a task execution agent: inspecting a repository, writing code, using tools, and following the user's instructions over a long conversation. Halfway through the task, the user switches to another model. The harness needs to continue without throwing away the work already done.

A natural continuation instruction might be: “Continue the same task with the newly selected model. Treat completed tool results as complete and do not repeat them.” I can understand exactly what the developer meant. I might have written it that way myself. In ordinary conversation, there's nothing especially strange about it.

The problem I'm interested in is one word: “with.”

## What “with” quietly changes

The harness wants the newly selected model to be the agent doing the work. But “continue the task with the newly selected model” also admits another reading: the agent should continue the task by using the newly selected model. The model becomes something available to the agent, rather than the agent's current execution identity.

Those are different instructions. If the agent can delegate to subagents, the second reading suddenly has an action attached to it. It may decide that it has been asked to invoke another model, even though the host has already performed the switch. The user wanted continuity. The prompt has introduced a new question about who should do the work.

Changing “with” to “as” moves the sentence closer to the intended meaning: “Continue the same task as the newly selected model.” One word changes the grammatical relationship between the agent and the model. That does not guarantee an entirely different response on every run, but it can change which actions seem relevant to the model. I think that is worth taking seriously.

## Why delegation makes it interesting

A coding agent does not merely answer questions. It can act. Some harnesses let the main agent launch other agents, provide them instructions, and consume their results. In that environment, vague language about another model is more than a stylistic flaw. It can be interpreted as a plan involving a tool call.

I can picture the failure: the harness changes the backing model, injects its continuation message, and the resumed agent starts reasoning about how to use the “newly selected model.” It might delegate, search for an appropriate tool, or waste effort deciding whether it is supposed to hand the task off. This is a hypothetical failure path, not a measured claim that any particular model always behaves that way.

I also suspect the ambiguity could be troublesome without delegation. The model might be asked to do something it cannot actually do and spend time reconciling that request with its available tools. I have not verified that case, and there may be other ways it fails. It is a question I'd want to test rather than quietly promote to a fact.

## The instruction I would actually send

I would probably avoid mentioning the model switch at all. Something like: “This task is resuming after an interruption. Continue from the existing conversation and available state. Preserve the user's goal and constraints. Treat completed tool results as completed work; do not repeat operations unless their results are missing, invalid, or need revalidation.”

That tells the agent what matters. There is an interrupted execution, a task to continue, and prior work that should not be discarded. It does not ask the model to decide what the words “newly selected model” refer to, or whether another agent needs to be involved. The harness knows that the backend changed. The model usually does not need to know why.

There is a caveat even here: a tool result in the transcript is not necessarily proof that an external side effect completed. The harness should distinguish completed calls, in-flight calls, and uncertain outcomes before issuing any continuation instruction. A prompt can help prevent needless repetition; it cannot manufacture reliable execution state.

## Prompt engineering is interface engineering

This connects directly to what I wrote in The tools around the model. I've been building OpenFork's tools around the fact that a model reads an interface contract and then decides what action to take. Ambiguous edit errors, poorly scoped tool descriptions, and misleading status messages all affect that decision. Continuation prompts are another part of the same interface.

I don't think useful prompt engineering is about appending “think critically,” “be precise,” or “make no mistakes” to every request. It is about understanding what an instruction actually permits the model to infer, particularly when those inferences can turn into tool calls. Prepositions, pronouns, implied actors, and assumed state can all matter.

If I were testing this in a harness, I would run both versions across the same interrupted tasks, with delegation enabled and disabled, and inspect the first decisions the agent makes: unnecessary delegation attempts, repeated tool calls, time to resume meaningful work, and task completion. The important question isn't whether one wording sounds nicer. It's whether the wording keeps the agent oriented toward the intended operation.

## One word

I like this example because I don't need an elaborate adversarial prompt to explain it. I only need to compare “with” and “as.” The first can cast the new model as an instrument. The second casts it as the actor. My preferred version avoids both because neither distinction is necessary to resume the task.

An LLM harness has to communicate with a model in language, but language is not a neutral transport for execution state. A developer can write a sentence that seems obvious to a human and accidentally present the agent with another task. Sometimes the difference starts with one word.
