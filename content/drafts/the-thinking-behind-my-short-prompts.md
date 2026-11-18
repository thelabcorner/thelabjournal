---
title: "The Thinking Behind My Short Prompts"
date: 2026-11-18
author: "Jackson Cummings"
status: published
issue: "J–011"
slug: the-thinking-behind-my-short-prompts
category: "Essays"
summary: "Why many of my LLM prompts are only a few words long, and how context, unspoken expectations, independent reasoning, and judgment determine what I choose to say."
tags: ["LLMs", "Prompt engineering", "Context engineering", "AI agents", "Critical thinking", "Delegation", "Metacognition", "Efficiency", "Judgment"]
---

# The Thinking Behind My Short Prompts

*On understanding what to say, what not to say, and what to leave for the model to discover.*

I've written extensively about language models, prompting methodologies, agentic engineering, and the principles I believe contribute to more effective interactions with artificial intelligence.

Yet, somewhat paradoxically, many of my own prompts consist of only a handful of words.

"Continue exhaustively."

"Think critically."

"Investigate this."

Sometimes, that's genuinely the entirety of what I send.

I can imagine how someone observing this might find it contradictory. How can someone who has invested so much thought into understanding these systems, who writes at length about effective prompting, turn around and communicate with them so minimally?

It's a reasonable observation, but I think the conclusion someone might draw from it overlooks something fundamental.

**The amount of thought behind a prompt is not necessarily proportional to the number of words within it.**

And perhaps more importantly, understanding how to communicate effectively with a language model doesn't necessarily mean learning how to say more. It means developing the judgment to recognize what needs to be said, what doesn't need to be said, and what might be better left unsaid.

Those are three very different considerations.

## What You Don't See

When I write a short prompt, that prompt is not necessarily a complete representation of what's going on inside my head.

There may be an extensive collection of expectations, assumptions, concerns, hypotheses, and potential outcomes that I'm considering simultaneously.

I might already have a fairly developed understanding of the problem. I might have particular expectations regarding how the model should approach it. I might have concerns about certain implementation strategies, or suspicions about where an investigation could lead.

And sometimes, I've already considered several potential solutions before I've even asked the model to begin.

But that doesn't mean I need to communicate all of those thoughts.

In fact, sometimes communicating all of them would defeat part of the reason I'm using the model in the first place.

I think people can easily conflate the *information someone communicates* with the *information someone possesses*.

Those aren't the same thing.

A prompt is an expression of selected information. It is not necessarily an exhaustive account of the reasoning that produced it.

Of course, having expectations that remain unspoken does not magically make those expectations accessible to a language model. I recognize that distinction. Something existing inside my head doesn't mean the model has any reasonable way of knowing it.

But that, too, is part of the judgment involved.

I have to determine which expectations are essential to communicate, which can reasonably be inferred from existing context, which can be evaluated after the fact, and which I intentionally don't want to impose on the model.

**The fact that I haven't said something doesn't necessarily mean I haven't thought about it.**

## Knowing What to Say Is Only Half the Skill

I think there's a tendency in discussions about prompting to emphasize providing more context, more specificity, more constraints, and more detailed instructions.

And to be clear, there's considerable merit to that advice.

Language models are not mind readers. They can misunderstand intentions, make unjustified assumptions, overlook critical requirements, and confidently pursue directions that aren't particularly useful.

Sometimes, an elaborate prompt is precisely what's needed.

But I think there's another side to this that deserves just as much attention.

Too much instruction can be problematic, too.

An excessively detailed prompt can introduce unnecessary assumptions, overconstrain the solution space, prescribe an inferior methodology, or simply repeat information that's already available.

It can also shift the intellectual burden back onto the person using the model.

If I have to identify every relevant consideration, anticipate every possible complication, and prescribe every step of the solution, at what point am I unnecessarily doing the model's thinking for it?

That isn't to suggest that detailed instruction is inherently counterproductive. Far from it.

It's about recognizing that both extremes carry costs.

Too little information can undermine the model's ability to succeed. Too much information can undermine its opportunity to contribute independently.

And the interesting thing is that the appropriate balance isn't necessarily somewhere in the numerical middle.

Sometimes three words really are enough.

Sometimes three thousand words are justified.

**The objective isn't to minimize or maximize the amount of instruction. It's to understand what the circumstances actually require.**

That's the Goldilocks principle as I see it.

Not moderation for the sake of moderation, but proportionality informed by context.

The more I've learned about these systems, the more I've come to appreciate both sides of that equation.

I recognize not only what I can afford to leave out, but also what I cannot afford to omit.

And I think that distinction is far more representative of prompting proficiency than verbosity alone.

## I Want the Model to Think, Too

There's another reason I sometimes deliberately leave things out, and it's one I consider particularly important.

**I don't always want to tell a language model how to solve a problem. Sometimes I want to find out how it would solve the problem.**

Those are fundamentally different objectives.

Suppose I'm investigating an engineering issue and already have a theory about its cause.

I could give the model my theory, walk it through the reasoning that led me there, and suggest a particular approach to resolving it.

And sometimes I do exactly that.

But suppose my theory is wrong.

By communicating it too early, I may have inadvertently anchored the investigation to my own misunderstanding.

The model might spend its effort validating my assumptions rather than independently examining whether those assumptions are justified in the first place.

Alternatively, I could explain the problem, establish the necessary constraints, and allow the model to investigate without prescribing the conclusion.

Now I've created an opportunity for something different to emerge.

Perhaps the model reaches the same conclusion I did. Perhaps it identifies an alternative explanation. Perhaps it discovers something neither of us had initially considered.

That possibility is valuable to me.

I don't want language models merely to reproduce my thinking in more elaborate language. I want them to contribute something intellectually meaningful to the process.

And sometimes, that requires deliberately withholding portions of my own reasoning.

Not because those thoughts are irrelevant, but because communicating them could influence the model in ways I don't necessarily want.

There is a distinction between withholding information necessary for success and withholding an interpretation that could prematurely narrow the investigation.

Recognizing that distinction is essential.

I'm not trying to manufacture ambiguity for its own sake. I'm trying to preserve opportunities for independent reasoning where doing so is appropriate.

That doesn't mean I blindly accept whatever the model produces, either.

I can give a model substantial freedom in how it approaches a problem while maintaining demanding standards for the result.

**Delegating the reasoning does not require abandoning responsibility for evaluating it.**

In fact, I would argue that knowing how to evaluate the outcome is one of the things that makes such delegation possible.

## A Prompt Doesn't Exist in Isolation

Another important consideration is context.

When I tell an agent to "continue exhaustively," those words might seem almost meaningless to someone encountering them independently.

Continue what? Exhaustively in what sense? Under which constraints? Toward which objective?

But that's precisely the point.

Those words often aren't being communicated in isolation.

They exist within a larger interaction that may already contain extensive discussions, established objectives, previous investigations, architectural decisions, constraints, implementation history, and accumulated evidence.

Why would I need to restate all of that every time I want the model to continue?

The prompt itself may be short, but the effective context in which it operates can be substantial.

A handful of words within a well-established context can convey a much more specific instruction than those same words would convey in a new conversation.

And this is where I think some superficial evaluations of prompting go wrong.

They isolate the latest message from the interaction that gives it meaning.

They evaluate the visible instruction without considering the surrounding process.

Of course, context isn't infallible. Models can overlook information, misunderstand earlier decisions, or lose access to details. When those risks matter, repeating or explicitly reinforcing critical requirements may be warranted.

But again, that's a matter of judgment.

Sometimes repetition improves reliability.

Other times, it contributes nothing.

Understanding the difference is part of what I'm trying to become better at.

## The Cost of Saying Everything

There's also a practical dimension to all of this that I don't think should be overlooked.

Writing elaborate prompts takes time.

And not just the time required to type the words.

It takes cognitive effort to translate a complicated collection of thoughts into a carefully structured set of instructions.

Sometimes that translation is necessary. Sometimes it clarifies my own thinking, exposes overlooked assumptions, or establishes requirements that would otherwise remain ambiguous.

But sometimes it's an inefficient use of my attention.

If a model can independently investigate something in a few moments, why should I spend fifteen minutes meticulously explaining how I believe that investigation should unfold?

Especially when I may not yet know what the best approach actually is?

I think there's an important opportunity-cost consideration here.

The more time I spend articulating every possible detail, the less time I have available for reviewing results, testing hypotheses, evaluating evidence, and refining the direction of the work.

But that argument cuts both ways.

A prompt that's too short can produce misunderstandings, unnecessary revisions, wasted computation, and avoidable failures.

Saving a few minutes on instruction only to spend an hour correcting the outcome isn't particularly efficient.

So once again, the answer isn't simply to write less.

It's to recognize when additional communication is worth its cost.

Sometimes a carefully developed specification prevents substantial downstream problems.

Other times, writing that specification is itself the unnecessary work.

**Efficiency is not measured by how little effort I spend on the prompt. It's measured by how effectively I allocate effort across the entire process.**

## Expectations Are Not Always Instructions

One distinction I find especially meaningful is the difference between what I expect from a model and what I explicitly instruct it to do.

I might expect an agent to think critically, investigate existing implementations before making changes, consider potential regressions, recognize uncertainty, and verify its conclusions.

But do I need to explicitly enumerate those expectations in every interaction?

Not necessarily.

Some may already be established through prior instructions, shared methodologies, or the history of the project.

Others may be reasonable expectations of competent problem-solving, even when they haven't been individually prescribed.

And some may be expectations I recognize the model could fail to satisfy.

That last distinction is important.

I don't believe that simply having an expectation makes it reasonable to assume the model will fulfill it.

An uncommunicated requirement can be genuinely inaccessible. If I fail to provide critical information and the model makes a reasonable but incorrect inference, that isn't automatically evidence of deficient reasoning.

But neither should every unexpected result be attributed to inadequate prompting.

Sometimes the model had sufficient information and failed to reason effectively. Sometimes it failed to investigate. Sometimes it made unsupported assumptions, ignored relevant context, or neglected verification.

Those are different failure modes, and they warrant different responses.

If the model lacks essential information, I should provide it.

If it lacks sufficient context, I should establish that context.

If it makes a reasoning error, simply adding more instructions may not address the underlying problem.

And if I prescribe increasingly detailed procedures every time the model makes a mistake, I may eventually end up compensating for its weaknesses by taking over responsibilities I originally wanted it to perform.

That's not always the best solution.

I want to understand *why* an interaction failed, not automatically assume that the remedy is a longer prompt.

## The Difference Between Control and Micromanagement

I think a lot of this ultimately comes down to understanding what meaningful control actually looks like.

It's possible to exert considerable control over an outcome without prescribing every individual action required to achieve it.

An engineer can establish performance requirements, correctness criteria, safety constraints, and acceptance tests without necessarily specifying every implementation detail.

Likewise, I can establish what I want an agent to accomplish, what conditions it must respect, and what evidence I expect it to produce without always dictating its entire methodology.

That doesn't mean micromanagement is never appropriate.

Some circumstances require precise procedures, strict constraints, and exceptionally limited discretion.

Other circumstances benefit from flexibility, exploration, and independent decision-making.

And I think proficiency involves understanding when each approach is justified.

The objective isn't to surrender control.

Nor is it to exercise as much control as possible.

It's to exercise the **appropriate kind and degree of control** for the problem at hand.

I think that's a distinction with implications far beyond language models.

It applies to engineering, leadership, delegation, research, and problem-solving more broadly.

Sometimes understanding something deeply means knowing exactly where intervention is necessary.

Other times, it means recognizing where intervention would be unnecessary or even detrimental.

## What My Short Prompts Actually Represent

Returning to the apparent contradiction that inspired this reflection, I think I can explain it more precisely now.

I've spent considerable time developing my understanding of language models and how to interact with them effectively.

That understanding hasn't simply taught me to write longer, more elaborate prompts.

And it hasn't simply taught me to write shorter ones, either.

It's helped me become more deliberate about what I communicate, what I leave implicit, what I expect the model to discover, and what responsibilities I retain for myself.

Sometimes my prompts are extensive because the situation warrants extensive instruction.

Sometimes they're short because the necessary context is already established.

Sometimes they're short because I want to avoid unnecessarily influencing an investigation.

Sometimes they're short because the model is capable of handling the details independently.

And sometimes they're short because translating every thought in my head into explicit language would be an enormous expenditure of effort with little corresponding benefit.

None of those explanations necessarily excludes the others.

But I also recognize that brevity can be a mistake. There are occasions when I should communicate more than I initially do, when my expectations aren't sufficiently established, or when the model needs clearer direction than I've provided.

That's part of learning, too.

I'm not claiming that every short prompt I write is an example of exceptional judgment.

I'm claiming that prompt length, considered independently, is a remarkably poor measure of that judgment.

A long prompt can be thoughtful or wasteful.

A short prompt can be deliberate or careless.

The difference isn't found in the word count.

It's found in the reasoning behind the communication, the context surrounding it, and the effectiveness of the process that follows.

## Understanding Both Extremes

Perhaps the most important point I want to make is that I don't regard either extreme as inherently superior.

I've learned the value of specificity, but I've also learned the value of restraint.

I've learned that models need adequate direction, but I've also learned that excessive direction can become an obstacle.

I've learned when to communicate my assumptions, but I've also learned when withholding them creates an opportunity for independent investigation.

I've learned that some expectations must be explicit, while others can reasonably remain implicit within an established context.

And I've learned that there are situations where I should invest substantial effort into constructing an instruction, just as there are situations where doing so would serve little purpose.

These aren't contradictions.

They're complementary dimensions of the same skill.

And I think there's something interesting about the fact that greater understanding can produce seemingly opposite behaviors depending on the circumstances.

Sometimes expertise manifests as exceptional specificity.

Sometimes it manifests as deliberate restraint.

Sometimes it manifests as knowing that the circumstances require one rather than the other.

**The sophistication isn't necessarily in how much I say. It's in understanding why I'm saying what I'm saying, why I'm leaving other things unsaid, and what consequences those decisions may have.**

That doesn't make my judgment infallible. It gives me a better framework for exercising it, evaluating it, and improving it.

And ultimately, that's what I find so interesting about the apparent contradiction between my extensive writing about prompting and the brevity of many of my actual prompts.

The two aren't necessarily at odds.

If anything, they can be expressions of the same underlying understanding.

One is an attempt to articulate the principles I've developed.

The other is an application of those principles in circumstances where articulating all of them would be unnecessary.

**The goal was never to learn how to say more, or how to say less. It was to become better at recognizing the difference between what needs to be said and what doesn't.**

And perhaps that's the broader lesson worth taking from all of this.

Knowing more doesn't always mean needing to say more.

Sometimes it means recognizing the value of saying more.

Sometimes it means recognizing the value of saying less.

And sometimes, the most important thing is understanding why.
