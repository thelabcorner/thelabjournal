---
title: "Shake the 8 Ball Again"
date: 2026-11-17
author: "Jackson Cummings"
status: published
issue: "J–009"
slug: shake-the-8-ball-again
category: "Essays"
summary: "Language models can offer convincing answers without independently establishing their truth. How I use repeated questions, deliberate framing, skepticism, and verification to get something more useful."
tags: ["LLMs", "Critical thinking", "Sycophancy", "Engineering", "Scientific reasoning", "Decision-making", "Verification", "Metacognition"]
---

# Shake the 8 Ball Again

*On treating language models as sources of answers, learning to question those answers, and recognizing our own influence over them.*

I think people have forgotten how to use a Magic 8 Ball.

Seriously.

You ask it a question, shake it, turn it over, and read whatever answer happens to appear. Maybe it says yes. Maybe it says no. Maybe it tells you to ask again later.

Nobody should reasonably believe that a plastic ball filled with liquid possesses some extraordinary knowledge about the question they've asked. It doesn't know anything. It has no understanding of the circumstances, no ability to reason through the possibilities, and absolutely no authority over the outcome.

And yet, it can still be useful.

Suppose you're trying to make a decision. You shake the ball, and it gives you an answer you don't particularly like.

What do you do?

You might dismiss it. You might reconsider your original question. You might start thinking about why you disagree with the answer.

Or you might simply shake it again.

I find that last possibility particularly interesting.

If you're willing to shake the ball repeatedly until it gives you the answer you want, perhaps the answer itself wasn't really what you were looking for.

Perhaps you already had some idea of what you wanted, and you were looking for something to reinforce it.

Alternatively, maybe you genuinely hadn't considered some of the possibilities until an answer prompted you to think about them.

Either way, the interaction can reveal something useful.

And I think this is an interesting way to approach language models.

Not because LLMs are random answer generators. They clearly aren't. They can reason through problems, analyze information, generate code, perform calculations, identify patterns, and construct extraordinarily sophisticated explanations.

But people sometimes treat their outputs as though they came from an all-knowing object that has already figured everything out.

**The model said it. Therefore, it must be true.**

That's a remarkably poor way to use something so capable.

## The illusion of an answer

There's something psychologically satisfying about receiving a complete, well-articulated answer to a difficult question.

You might spend hours struggling to understand a technical problem, only to ask an LLM and receive several paragraphs explaining exactly what's happening and what you should do about it.

It's organized. It's confident. It makes sense.

And sometimes it's completely fucking wrong.

The interesting part is that the response can still be useful even when its conclusion is incorrect.

Imagine you're debugging a software application that's experiencing unexpected memory consumption.

You describe the symptoms to a model, and it tells you that you're probably dealing with a memory leak.

That's plausible.

Perhaps it explains how objects might remain reachable after they're no longer needed. Perhaps it suggests inspecting heap snapshots, looking for retained references, and examining the application's garbage collection behavior.

All reasonable suggestions.

But what if the memory consumption isn't caused by a leak?

What if it's an intentional cache, an unexpectedly large working set, duplicated processes, or memory being retained by the runtime rather than released immediately to the operating system?

The model's initial explanation might have been technically coherent while still being the wrong diagnosis.

And that's where I think people often make a mistake.

They receive an answer, recognize that it sounds reasonable, and proceed as though the underlying problem has been established.

But a plausible explanation is still a hypothesis until something supports it.

The better approach is to interrogate that explanation.

What assumptions does it depend on? What alternative mechanisms could produce the same symptoms? What observations would distinguish one explanation from another?

And perhaps most importantly, what happens when I ask the model to reconsider its original conclusion?

Shake the ball again.

Not necessarily because the first answer was wrong, but because there might be another way to approach the problem that I haven't considered.

## You have more influence than you think

Here's where the Magic 8 Ball analogy becomes particularly interesting.

A conventional Magic 8 Ball doesn't care what answer you want.

An LLM can be influenced by it.

The information you provide, the assumptions you introduce, the way you phrase your question, and the conclusions you appear to favor can all influence the model's response.

Sometimes quite significantly.

Suppose I ask a model whether a particular engineering approach is viable.

I could frame the question neutrally, describing the proposed mechanism and asking it to evaluate the relevant constraints.

Or I could spend several paragraphs explaining why I believe the approach is exceptionally promising, emphasizing its advantages and presenting the assumptions that make it attractive.

Those two prompts might produce rather different assessments.

The second could encourage the model to follow my reasoning, extend my assumptions, and construct an increasingly convincing argument in favor of the approach.

That isn't necessarily a problem.

Sometimes that's precisely what I want it to do.

Maybe I'm developing a theoretical model and want to explore the consequences of a particular assumption. Maybe I'm trying to articulate an engineering intuition that I haven't yet translated into a rigorous explanation.

I can intentionally direct the model toward that line of reasoning.

But I have to remember that I directed it there.

**If I influence the model into supporting my conclusion, I cannot reasonably treat its support as independent confirmation that my conclusion is correct.**

This applies far beyond engineering.

Someone researching a scientific question can influence which mechanisms the model emphasizes. Someone evaluating a business idea can influence whether the response focuses on opportunities or risks. Someone writing software can unintentionally convince a model that a particular architecture is appropriate before the alternatives have even been considered.

Even someone asking a model to review their writing can influence how critical that review becomes.

And yes, someone seeking advice about a personal situation can do exactly the same thing.

The underlying phenomenon is consistent: the answer you receive is influenced by the information and framing you provide.

There's a name for one particularly problematic manifestation of this behavior: *sycophancy*.

A model may favor agreement with the user even when a more critical response would be warranted.

That makes skepticism important, particularly when the response agrees with something we already believe.

Because it's entirely possible to mistake an extraordinarily sophisticated rationalization for an extraordinarily sophisticated justification.

Those are not necessarily the same thing.

## So shake the fucking ball again

I think people often underestimate how useful it can be to ask the same underlying question from a different perspective.

Not simply repeating the exact prompt and hoping for a different answer, but deliberately changing the conditions under which the question is examined.

Take an engineering problem.

Perhaps a model recommends one algorithm over another because it expects better performance.

What happens if I ask it to evaluate memory consumption rather than execution time? What happens if the expected input distribution changes? What happens if I ask it to construct a workload where its original recommendation performs poorly?

Maybe the original recommendation still holds up.

Great.

Now I have a better understanding of why.

Or perhaps I discover that the recommendation depended on assumptions that weren't appropriate for my application.

That's useful too.

The same principle applies to scientific research.

I can ask a model to develop a hypothesis, then ask it to identify competing explanations, reconsider the underlying assumptions, or derive the consequences of a different mechanism.

I can ask it to explain why something might work, and then ask it to explain why it might fail.

I can even ask it to defend an approach that I initially dismissed.

In programming, I can use this process to explore alternative implementations, identify overlooked edge cases, or question whether an apparent optimization actually improves performance.

In design, I can explore interpretations I wouldn't ordinarily pursue, compare opposing visual directions, or challenge assumptions about what an audience might understand.

In business, I can examine the same decision under different priorities, constraints, and market assumptions.

And when the question is personal, I can use a response to examine my own preferences and reactions.

There's an almost endless number of ways to apply this.

But there's a distinction I think deserves attention.

**Shaking the ball again doesn't automatically make the next answer better.**

A model can produce multiple convincing answers that contradict one another.

It can repeat the same mistake. It can introduce new mistakes. It can even become increasingly agreeable as a conversation progresses.

And asking the same model ten times doesn't give me ten independent sources of evidence.

The responses may all depend on substantially the same information, assumptions, and underlying patterns.

So the value isn't necessarily in obtaining more answers.

It's in what I do with the differences between them.

What changed? Which assumptions produced a different conclusion? What information is missing? Can I independently establish which interpretation is more accurate?

Sometimes the answer is in the source code. Sometimes it's in an experiment, a mathematical derivation, a measurement, or an external source.

And sometimes the question doesn't have an objectively correct answer in the first place.

Recognizing those differences is part of using the model intelligently.

## You can manipulate the model. That's not inherently a bad thing.

I actually think there's something valuable about recognizing how much control we have over a model's output.

You can ask it to adopt a particular perspective.

You can constrain its assumptions, direct its reasoning toward a specific objective, or ask it to construct arguments supporting a position you already hold.

You can tell it to be skeptical, optimistic, adversarial, conservative, experimental, or exceptionally critical.

You can ask it to evaluate something under conditions that aren't ordinarily realistic simply because you're interested in understanding what those conditions would imply.

And there's nothing inherently irrational about doing any of that.

In fact, intentional manipulation of a model's framing can be a useful investigative technique.

Suppose I have a particular approach to solving a problem, and I want to understand whether there's a defensible argument for it.

I might deliberately ask the model to assume my approach is viable and explore how it could work.

That can help me discover mechanisms, possibilities, or implementation strategies I hadn't considered.

Then I can reverse the framing.

Assume the approach is flawed. Identify the most consequential weaknesses. Determine what evidence would be necessary to establish viability.

Now I have two different examinations of the same idea.

Neither one becomes true merely because the model articulated it.

But together, they might provide a more useful foundation for investigating the problem.

This is where I think the distinction between manipulating a model and deceiving yourself becomes important.

If I'm deliberately constructing a favorable argument, I know what I'm doing.

If I subsequently forget that I deliberately constructed that favorable framing, I might start treating the resulting argument as independent evidence.

That's where things become intellectually dangerous.

The model can make my reasoning more sophisticated without necessarily making it more correct.

And if I'm not careful, I can use that sophistication to become increasingly confident in something that I never properly established.

I find that particularly interesting because I value intellectual justification.

I want to understand why something is true. I want my reasoning to withstand scrutiny. I want to be able to defend my conclusions logically.

But I also have to recognize that being capable of defending a conclusion doesn't automatically mean the conclusion is defensible.

There is a difference between finding reasons to support an idea and critically evaluating whether those reasons are sufficient.

An LLM can assist with either process.

And the person interacting with it has considerable influence over which process takes place.

## Sometimes the answer you want is useful information

There's another part of the Magic 8 Ball analogy that I don't want to overlook.

Sometimes the desire to receive a particular answer tells you something meaningful.

Imagine you're evaluating two possible directions for a project.

You ask a model which one it would recommend.

It chooses the option you were less enthusiastic about.

Immediately, you feel compelled to explain why the other direction might be better.

That reaction deserves examination.

Maybe you have domain knowledge the model didn't account for. Maybe its assumptions were inappropriate. Maybe you recognize constraints that weren't included in your original question.

Or maybe you simply prefer the other option.

That's worth knowing too.

Our preferences influence which problems we pursue, which tradeoffs we're willing to accept, and which outcomes we consider desirable.

There's nothing inherently wrong with having them.

But those preferences shouldn't be confused with external facts.

If a model recommends an architecture I dislike, I might have legitimate reasons to reject it.

If a model calculates a physical relationship that contradicts my expectations, however, disliking the result doesn't change the mathematics.

I can question the assumptions. I can verify the derivation. I can examine whether the model applied the correct physical laws.

But I cannot reasonably conclude that a different answer is more accurate simply because I prefer it.

The same principle applies when I receive an answer I like.

My satisfaction is evidence of my reaction, not evidence of the answer's correctness.

I think keeping those things separate is extraordinarily important.

It allows me to use the model to explore what I want without mistaking what I want for what is true.

## Knowing when to stop shaking

There's a point where repeatedly asking for another interpretation stops producing meaningful new information.

Maybe I've examined the plausible alternatives. Maybe the remaining uncertainty requires actual measurements, access to information the model doesn't have, or an experiment that hasn't been performed.

Maybe I'm avoiding making a decision because generating another explanation feels easier than committing to one.

Or maybe I'm repeatedly reframing the same question because I haven't received the answer I wanted.

That's worth recognizing.

The existence of another possible answer doesn't mean I should indefinitely suspend judgment.

Sometimes I have enough information to act. Sometimes I have enough information to reject an approach. And sometimes the appropriate conclusion is that I genuinely don't know yet.

An LLM can help identify what information would resolve that uncertainty, but it cannot always resolve it through further conversation.

I think there's a temptation to keep asking because the model will almost always have *something* to say.

Its ability to generate another response shouldn't be mistaken for its ability to produce another meaningful discovery.

And that, to me, is an important limitation to internalize.

I don't want to treat language models as all-knowing authorities.

I also don't want to dismiss their outputs simply because they can be wrong.

I want to use them deliberately.

I want to be capable of asking a question, examining the answer, and deciding whether to accept it, challenge it, verify it, or approach it from an entirely different direction.

I want to recognize when I'm exploring a hypothesis, when I'm searching for alternatives, when I'm constructing an argument, and when I'm genuinely trying to establish whether something is true.

And I want to be conscious of the fact that my own framing can influence every one of those processes.

So yes, shake the ball again.

But pay attention to why you're shaking it, what changed between the answers, and whether you've actually learned anything new.

Because sometimes the model will help you discover an answer you hadn't considered.

Sometimes it will help you understand why you wanted a particular answer in the first place.

And sometimes, if you're not paying attention, it'll simply keep telling you what you've been teaching it to say.
