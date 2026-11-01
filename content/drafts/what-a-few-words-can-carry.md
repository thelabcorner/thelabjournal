---
title: "What a few words can carry"
date: 2026-11-01
author: "Jackson Cummings"
status: draft
slug: what-a-few-words-can-carry
category: "Essays"
summary: "Working with LLMs has made me attentive to how individual words carry assumptions and how much meaning a recipient can reconstruct from shared context."
tags: ["Language", "LLMs", "Communication", "Semantic compression", "Tokenization", "Autoregressive generation", "Meaning"]
---

# What a few words can carry

Working with LLMs has made me attentive to how individual words carry assumptions and how much meaning a recipient can reconstruct from shared context.

## I'm paying attention to words differently

I've started placing a surprising amount of value on individual words. I spend so much time working with language models that I notice myself thinking about what a sentence actually asks the recipient to infer, sometimes down to a single verb or preposition. I find that fascinating, because it is gradually changing the way I think about communication in general.

I've always enjoyed finding precise ways to articulate complicated ideas. What feels different now is how deliberately I examine the language doing that work. I can express the same basic idea to an LLM in two slightly different ways and get responses that approach it from different directions. Sometimes the difference is obvious. Sometimes I have to work backward through what I said to understand why the model interpreted it that way.

I think this is making me a better communicator with LLMs. I'd like to carry that same attention into conversations with people.

## The technical side is part of why I notice it

An autoregressive language model produces a sequence of tokens conditioned on the context it has received. A token isn't necessarily a word; it may be part of one, a whole word, punctuation, or another piece of text. The important part for me is that my wording becomes part of the context that influences what comes next.

That makes a prompt feel less like a command with one fixed interpretation and more like a set of constraints and associations I'm trying to establish. The model still has to interpret them. Changing one word can change which continuation appears sensible, especially when the instruction is attached to actual tools and actions. It doesn't mean every word has a predictable, independent effect. I've seen enough variation to know the same phrasing can produce different results.

In an earlier engineering note, The difference one word makes, I wrote about how 'continue with the newly selected model' can imply a different relationship than 'continue as the newly selected model.' That was a specific problem in an agent harness. The thing I'm noticing now is broader: choosing a word means choosing which interpretation I'm inviting, including interpretations I didn't intend.

## How much can one word carry?

I'm particularly interested in semantic compression. By that I mean how much of a thought I can communicate without spelling out every part of the reasoning behind it. There's a certain satisfaction in finding a short phrase that evokes something I would otherwise need several paragraphs to explain.

Take a word like 'generalizable.' In the middle of an engineering discussion, I may be using it to ask for something that survives new inputs, different implementations, and cases we haven't designed specifically around. I don't need to repeat that whole argument every time if the context is already established. The word is doing a lot of work because of the framework attached to it.

The same thing happens with verbs. 'Explain,' 'derive,' 'implement,' and 'verify' point toward very different kinds of work. 'Possible,' 'probable,' and 'necessary' carry different standards of reasoning. I increasingly notice these choices while writing, because I've seen the consequences of getting them wrong in model conversations.

This is also why I don't think compression is the same thing as using the fewest tokens. A short sentence can carry a great deal of meaning, but only when enough of the intended context is available. If the recipient reconstructs the wrong idea, I've saved words at the expense of communicating the thing I meant.

## The context I forget other people don't have

I can compress a fairly elaborate judgment into a few words because I already have the entire chain of reasoning in my head. I know what assumptions I'm making, what exceptions I'd allow, and which part of the situation I'm referring to. The other person may have none of that.

I might describe a process as 'pointless' when the more precise thought is that it's consuming time without moving the actual objective forward. That's a judgment about the process in a particular context, not necessarily a claim that the work is worthless everywhere. To me the distinction can be implicit. To someone reading the word without that context, it may sound much more absolute than I intended.

Even the apparent emotional force of a phrase can be misleading. I sometimes use blunt language because it's an efficient shorthand for a technical or evaluative distinction, while somebody else may hear frustration or hostility. I can see why they might. The word is carrying different associations for them than it is for me.

That interests me because I don't necessarily want to stop compressing my thoughts. I want to get better at recognizing when I'm relying on context the other person doesn't actually share. A few additional words can be much more efficient than spending the next ten minutes untangling a misunderstanding.

## What I want to carry into human conversations

Talking to an LLM gives me an unusually convenient way to investigate my phrasing. I can reword a question, make an assumption explicit, change a verb, or rearrange the context, then compare how the response develops. It's imperfect feedback, but it happens constantly. I don't get that kind of repeatable comparison in an ordinary conversation with another person.

People also bring experiences, relationships, priorities, and emotional associations that I can't treat like a prompt context I fully control. I don't expect to transfer an LLM prompting technique directly into human communication. What I do want to transfer is the attention I now pay to what words imply, what they presuppose, and how somebody might interpret them without the rest of my thought process.

I'd like to become better at noticing those assumptions before a misunderstanding happens, and better at catching myself when I interpret somebody else's compressed language too literally. Sometimes the most useful response may be to ask what they mean rather than immediately reason from my first interpretation.

I'm still figuring that out. But I've started thinking about words less as interchangeable ways to express a thought and more as choices that determine how much of the thought survives the trip from one mind to another. That's something I want to practice with people, not only with models.
