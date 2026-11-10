---
title: "Thinking Like the Model"
date: 2026-11-09
author: "Jackson Cummings"
status: published
issue: "J–008"
slug: thinking-like-the-model
category: "Essays"
summary: "Why understanding how language models interpret context is essential to prompt introspection, explicit instructions, and properly delegating work to agents."
tags: ["Prompt engineering", "AI agents", "Delegation", "Context engineering", "Prompt introspection", "Post-training", "Metacognition", "OpenFork"]
---

# Thinking Like the Model

*On prompt engineering, language, and the judgment we delegate to artificial intelligence.*

These days, I delegate practically everything I can to AI agents.

I rarely write code myself anymore. Occasionally, I'll make a small change manually, but even then, I'd usually rather delegate it. I've reached a point where I'd estimate that 99% of the work I encounter is more tedious to perform myself than it is to properly delegate.

And there's a very important word in that statement.

**Properly.**

Poor delegation can be an absolute nightmare. You spend your time correcting misunderstandings, repeating instructions, recovering lost context, reviewing unnecessary changes, and trying to convince an agent to accomplish something you could have done yourself.

Proper delegation is a different experience. You communicate what you're trying to accomplish, establish the relevant constraints, and allow the agent to perform the work. You intervene when necessary, evaluate the result, and move on.

I still enjoy software engineering, graphic design, scientific research, and the countless other subjects I occupy myself with. I love understanding problems, investigating mechanisms, exploring possibilities, and developing ideas. What I've increasingly lost interest in is personally performing all the execution required to turn those ideas into something tangible.

If I understand how something should work, and I can competently evaluate whether it does, why should I insist on doing all the work myself?

But getting to this point has required developing an intuition for how language models behave. I've spent an extraordinary amount of time interacting with them, particularly through coding agents capable of independently investigating problems, modifying codebases, running tests, and coordinating other agents.

I've learned that the quality of a delegated task depends enormously on the quality of the communication preceding it.

And I think people routinely underestimate that.

One thing I've noticed is how quickly people tend to send prompts. They have an idea, formulate a sentence that seems to represent that idea, and immediately hit enter. When the model produces something unexpected, they blame the model, rewrite the request, or keep prompting until they get something closer to what they originally wanted.

There's nothing inherently wrong with iterating. In fact, interacting with these systems is one of the best ways to develop an understanding of their behavior.

But I think people overlook an opportunity to prevent misunderstandings before they happen.

**Prompt engineering requires understanding how the model is likely to interpret what you've written, rather than assuming it will understand what you meant.**

I've come to think of this as *prompt introspection*, or, somewhat more abstractly, *metacognating for the model*.

It's part of a broader philosophy I've developed around understanding these systems, managing the context they receive, and deciding how much autonomy to give them.

And I think much of it begins with abandoning a mentality that I genuinely despise.

## The model isn't magic

I genuinely despise the black-box mentality surrounding large language models.

What horrifies me is the willingness to treat these systems as fundamentally unknowable, supply them with terrible instructions, and then act surprised when they behave in ways you never intended.

I especially hate the attitude that, when an agent does something wrong, you can just *prompt it again*.

Of course you can prompt it again. You can prompt it a hundred times if you want. You might eventually get something that looks like the result you wanted.

But **what are you actually accomplishing?**

Imagine visiting the most competent doctor in the world because something is wrong and you want it fixed.

But you give the doctor a terrible description of your symptoms. You omit important details, describe something inaccurately, or contradict information you provided earlier. The doctor is now working from a representation of your condition that doesn't actually correspond to what you're experiencing.

They can ask questions, examine you, and run tests. A good doctor should challenge an inconsistent history rather than blindly accept it. But **even an extraordinary doctor cannot reliably diagnose a condition from information that fundamentally misrepresents it**, unless something else reveals what the description is missing.

Now imagine the first medication doesn't work.

You return to the same doctor and ask for another prescription. That doesn't work either, so you go back again. Perhaps one treatment creates a side effect, and now there's another problem to address. Yet throughout the entire process, you haven't corrected the symptoms you reported in the first place.

You're repeatedly asking for a different solution to a problem you haven't accurately described.

Would you tolerate a doctor who simply kept throwing medications at you without reconsidering the diagnosis? Of course not. That's a terrible way to practice medicine.

**So why would you keep returning to that doctor, demanding another intervention, while continuing to supply the same misleading information?**

The doctor might be brilliant. That doesn't make them telepathic. If you misrepresent the problem, you constrain the diagnosis. If you keep asking for a different treatment without correcting that representation, you can end up accumulating complications rather than resolving the original condition.

And of course the doctor has responsibilities, too. They should investigate, ask questions, and reconsider assumptions when treatment fails. But their responsibility to investigate doesn't absolve you of yours to communicate what you're experiencing as accurately as you can.

You didn't go to the doctor to learn pharmacology. You went to get better. **Providing useful information is part of getting better.** You don't need to know the correct diagnosis or medication yourself.

A treatment trial may be reasonable. An unsuccessful attempt may even provide useful evidence. The absurdity is **repeating interventions while preserving the defective account of the problem that guided them**.

So why tolerate the equivalent when working with AI agents?

An agent can be extraordinarily capable and still misunderstand an objective you've represented poorly. It might modify the wrong files, follow an unintended interpretation of a requirement, or implement a solution to a problem you didn't actually have.

"Just prompt it again."

The next instruction tells it to fix the result without first establishing what was changed incorrectly. So it builds another modification on top of the first.

Now the new implementation conflicts with an earlier architectural decision. Another prompt introduces another workaround. The conversation acquires contradictory requirements; the repository accumulates patches whose original assumptions were never checked.

Eventually, something might appear to work.

But in the process, you've turned one problem into several. You've made the state of the work harder to reason about, harder to verify, and potentially harder to recover.

And then people wonder why the agent keeps doing things they never wanted it to do.

Getting furious with an agent for failing to reconstruct the objective you misrepresented is rather like getting furious with the doctor for failing to treat the condition you never accurately described. The agent can make mistakes of its own, but that doesn't erase your role in constructing the context it received.

**You are repeatedly supplying the conditions under which those unwanted outcomes become reasonable.**

I'm not suggesting the model receives a fresh training reward every time you reprompt it. That's not how ordinary inference works. The reinforcement here is in the *methodology*: you keep relying on the same ineffective approach, and occasional apparent success gives you a reason to keep doing it. Meanwhile, the conversation, tool outputs, and modified artifacts can carry the consequences of earlier mistakes into subsequent attempts.

I find that mentality intellectually repulsive.

It's a kind of **voluntary disintellect**. Not because everyone ought to study machine learning, but because people are voluntarily replacing a disciplined method of getting work done with blind intervention, even as the consequences of that method pile up around them.

I don't care whether someone wants to learn about neural networks for its own sake. Most people don't. They want the thing they asked for to be finished, correctly and efficiently. That's entirely reasonable.

But that makes this mentality *more* contradictory, not less.

If you want a problem solved, why keep using a problem-solving method that creates more problems?

You wouldn't accept a doctor prescribing treatment after treatment without examining the information and assumptions behind each one. Nor should you expect even an exceptionally capable agent to infer an accurate objective from a continually distorted account of what you want. Its responsibility to question and investigate doesn't absolve you of the responsibility to communicate.

Sometimes a second prompt is all that's needed. If the intended correction is obvious, make it. I'm not advocating a forensic investigation into every imperfect response.

I'm objecting to **the refusal to distinguish a correction from another unexamined intervention**.

When an agent does something wrong, the useful question isn't how quickly I can tell it to try again. It's what needs to change so the next action addresses the actual problem instead of compounding it.

That's a standard for getting work done, not a demand that everyone become an expert in LLMs. **You don't have to do the agent's work. You do have to give it a problem it can actually identify.**

And I reject the idea that treating the system as a black box excuses abandoning that standard.

Modern neural networks are extraordinarily complicated. We cannot reliably explain every internal computation responsible for a particular response, and predicting their exact behavior is often difficult.

But we understand a great deal about how these systems are built, trained, and operated.

You don't need to understand every weight in a neural network to develop a useful mental model of its behavior.

What matters is developing enough of an operational understanding to choose interventions that actually help.

Consider the distinction between pretraining and post-training.

During pretraining, language models learn from enormous collections of text and other training material. Through the task of predicting tokens, they develop representations of syntax, language, knowledge, relationships, programming concepts, and patterns of reasoning.

I sometimes think about this in terms of *semantic positioning*. That's my own way of describing how words, concepts, and expressions acquire relationships through the patterns in which they appear.

Two words might seem interchangeable to a human while having meaningfully different associations because of the contexts in which they've appeared during training.

Pretraining is also responsible for developing substantial capabilities, including coding and reasoning. Post-training then shapes how those capabilities are expressed.

This second stage is particularly relevant to conversational assistants and agents.

Models can be trained on instruction-response examples, evaluated against preferred behaviors, and further optimized through various methods of feedback and reinforcement learning. Depending on the training system, desirable outcomes might involve following instructions, solving problems correctly, choosing tools appropriately, or producing useful responses.

I like to explain reinforcement learning with a deliberately simplified analogy.

**The model gets a cookie when it does something desirable.**

Obviously, the model isn't receiving a new training reward every time I send it a prompt. The cookie was part of the training process. During ordinary inference, the model is applying behavior it learned previously.

But the analogy helps explain why these systems develop recognizable conversational tendencies.

They've been trained to respond to certain patterns of input with certain patterns of behavior.

An agent capable of writing code, running tests, searching files, and modifying a repository is operating through an additional layer: its *agent runtime*. That runtime provides tools, permissions, instructions, and an execution loop through which the model can interact with its environment.

The resulting behavior emerges from the combination of learned capabilities, post-training, the available context, and the tools the runtime exposes.

This is important because **an agent doesn't independently possess knowledge of what I privately intend. It acts on what I've communicated and what its environment makes available.**

## Changing the probability of what comes next

Understanding the relationship between training and inference fundamentally changes how I think about writing prompts.

At a simplified mathematical level, an autoregressive language model generates a probability distribution over possible next tokens, conditioned on its preceding context.

We can represent this as:

$$
P(x_{t+1}\mid x_{\leq t};\theta)
$$

Here, \(x_{\leq t}\) represents the preceding tokens, and \(\theta\) represents the model's learned parameters.

In ordinary terms, the model uses the context it has received to determine what tokens are likely to come next. The chosen decoding strategy also affects the actual output.

What interests me is how much influence we have over that context.

Imagine that, given a particular conversation and set of instructions, I can reasonably anticipate that an agent is likely to perform action XYZ.

But I don't want XYZ.

I want ABC.

I can deliberately change the context to make ABC more likely.

Perhaps I need to clarify the objective. Perhaps I need to provide an example, identify a constraint, correct a misleading assumption, or explicitly prohibit an unwanted operation.

Sometimes I only need to change a single word.

The model's behavior is probabilistic, so none of this guarantees a particular outcome. But an expectation that exists exclusively in my head has no reliable way of influencing the model.

If I expect ABC, I need to communicate ABC.

**Be explicit.**

I don't mean that every instruction should become an enormous technical specification. Explicitness concerns the information that materially determines the intended behavior.

If I ask an agent to "improve" something, I may be deliberately giving it freedom to decide what improvement means.

But if I already know that improvement means reducing memory allocations while preserving functionality, why would I leave that to interpretation?

The model can only respond to the intention I've managed to communicate through the context available to it.

And the exact language I use can matter considerably.

## The difference one word makes

I previously wrote about an interesting problem involving my OpenFork project, a fork of OpenCode.

The issue concerned an instruction supplied when switching between models during an existing task.

Consider these two sentences:

> Continue the same task **with** the newly selected model.

> Continue the same task **as** the newly selected model.

These sentences might appear almost interchangeable to someone casually reading them.

But their connotations are different.

*With* can position the newly selected model as an instrument or collaborator. It suggests performing an activity using something or alongside something.

*As* instead suggests continuing in the identity or role of the newly selected model.

In an ordinary conversation, that difference might be relatively inconsequential.

In an agent runtime where delegation, model selection, and agent identities are actual operational concepts, the distinction becomes more interesting.

We investigated this wording as a possible contributor to unintended delegation behavior. The semantic distinction was plausible, although the suspected runtime failure was not conclusively established to have been caused by that particular word.

There was also a third possibility: remove the unnecessary model-switch language altogether.

The agent already had a task to continue. Perhaps it didn't need additional context about which model had been selected.

That's an important lesson in itself. Sometimes the best improvement to a prompt is removing language that introduces an unnecessary interpretation.

Another example I find particularly interesting is the word *remember*.

Suppose I tell an agent:

> Remember what we discussed yesterday.

To a human, the intention might seem obvious. I'm asking the agent to retrieve information from an earlier conversation.

But the word *remember* carries several possible meanings.

It can refer to recalling existing information. It can mean retaining new information for the future. It can even appear in the context of scheduling a reminder.

When an agent has access to tools for searching memories, writing memories, and scheduling tasks, those distinctions can become operational.

I have encountered cases where the intended meaning was historical retrieval, yet an agent interpreted similar language as a request to create a memory.

Even when the surrounding context seemed sufficient to establish the intended meaning, the model still selected an unintended operation.

I might therefore change the instruction to:

> Recall our previous conversations about this project before proceeding.

And if the distinction matters enough:

> Search our previous sessions for completed work and unresolved decisions. Do not create or modify memories.

Notice what happened.

I haven't written an elaborate prompt. I've identified the intended operation and, when necessary, established a boundary around an unwanted side effect.

This connects directly to what I call semantic positioning.

Words acquire associations through their patterns of use, and models learn from those patterns. Post-training and the available tools can further influence how those associations translate into behavior.

A word such as *review* may suggest examining something, while *fix* may suggest modifying it. *Verify* might encourage testing, but the model may also interpret it as merely checking an argument or reporting an assessment.

The exact interpretation depends on the context.

And that is why seemingly synonymous words can have materially different consequences in agentic workflows.

When the agent can actually execute actions, an ambiguous instruction might cause it to modify a file, create a memory, delegate work, or perform another operation that I never intended to authorize.

There's no need to become paranoid about every word. But recognizing these possibilities is part of becoming competent at communicating with models.

## Context seeding, intentional and otherwise

Understanding how language models interpret instructions also requires recognizing that everything relevant in their context can influence their behavior.

This is what I mean by *context seeding*.

We can intentionally supply information that helps a model behave in a particular way.

A skill file might establish conventions for editing scientific manuscripts. A coding agent might receive architectural documentation and previous decisions about a project. A research agent might receive examples of how to distinguish measured evidence from hypotheses.

We're giving the model information that can influence what it generates and how it approaches the task.

Even a relatively simple instruction such as "think critically" may influence the style and direction of a response.

But I generally prefer to be more specific when the intellectual operation matters.

Suppose I'm asking an agent to evaluate an implementation.

I could say:

> Think critically about this code.

Or I could say:

> Evaluate the implementation against its requirements. Identify assumptions, investigate potential failure cases, and distinguish verified behavior from untested claims.

The second instruction provides more information about the kind of evaluation I'm expecting.

That doesn't automatically make it better in every situation. If the model already understands my expectations from the surrounding context, the shorter instruction might be entirely sufficient.

What matters is whether I'm deliberately influencing the model toward the behavior I want.

The same mechanism can also work against me.

Suppose I write:

> I've finally developed a really elegant solution to this problem. Can you verify that it works?

Before the model has examined the solution, I've already introduced an expectation that it is elegant.

It may still perform an independent evaluation. But I've provided a favorable framing that can influence the response.

Compare that with:

> Evaluate this solution independently. Identify strengths, weaknesses, and any claims that remain unverified.

The task is similar. The context is different.

This becomes especially consequential when agents inherit information from other agents.

Imagine one agent investigates a software defect and hypothesizes that a particular function is responsible.

A second agent summarizes the investigation and writes:

> The function responsible for the defect is X.

The original hypothesis has now become an apparent fact.

Another agent inherits that summary and begins working under the assumption that X is the established cause.

Nobody necessarily intended to misrepresent anything. But somewhere during the transmission of context, uncertainty was lost.

That is an example of unintentionally seeding the model with a conclusion.

It explains why I place so much emphasis on recovering previous work, preserving the status of evidence, and distinguishing verified findings from speculation when supervising agents.

Context management is an ongoing responsibility, especially in long-running workflows.

More information isn't automatically better information. A large context filled with misleading assumptions, outdated decisions, and poorly attributed findings can make an agent less effective than a much smaller collection of carefully selected evidence.

The challenge is understanding which information is useful and how its presentation might influence the model.

## Prompt introspection: think like the model

This brings me to something I wish more people would do before sending a prompt.

Actually read what you've written.

Not merely to check whether it sounds reasonable to you, but to consider how the model might interpret it.

I sometimes describe this as needing to *be the model*, at least momentarily.

Obviously, I cannot reproduce the internal computations of a neural network or calculate exactly how the model will respond.

But I can attempt to think from its perspective.

I can set aside my own privileged knowledge of the objective and examine the instructions I've actually supplied.

What information does the model have?

What information am I assuming it has?

Are there several reasonable interpretations of my language?

Have I unintentionally introduced a favorable or unfavorable conclusion?

What decisions will the model need to make because I haven't explicitly made them myself?

This is **prompt introspection**.

Consider the instruction:

> Make this writing more professional.

What does *professional* mean?

Perhaps the model will make the writing more formal. Perhaps it will shorten sentences, remove colloquial language, introduce technical vocabulary, or replace the author's distinctive voice with something more conventional.

Any of those interpretations might be reasonable.

If my actual intention is to correct grammar and improve clarity while preserving the author's voice, I can communicate that:

> Improve the clarity and grammar while preserving the original tone, opinions, and intended meaning. Avoid unnecessary formality.

I haven't dictated every editorial decision. I've simply resolved an ambiguity that matters to me.

The same principle applies outside of writing.

Suppose I ask an agent to find the best laptop for someone.

Best according to what?

Performance? Battery life? Price? Portability? Repairability?

Perhaps I want the agent to investigate those tradeoffs independently. In that case, leaving the request open-ended is useful.

But if I know the person needs something lightweight with exceptional battery life and a limited budget, leaving out those requirements is an avoidable mistake.

A significant part of prompt engineering is recognizing the difference between **intentional freedom and accidental ambiguity**.

And that is something I think you develop through experience.

After spending enough time interacting with language models, you begin recognizing how particular instructions tend to influence their behavior.

You notice when a phrase is likely to generate an overly agreeable response. You recognize when an agent might interpret a request for analysis as permission to implement changes. You recognize when an instruction depends on context the model may not possess.

It's an intuition that improves through observation.

And I think that intuition is far more valuable than memorizing a collection of supposedly perfect prompts.

### Sweep the low-hanging fruit

There is an important qualification to all of this.

Prompt introspection shouldn't become an excuse for analysis paralysis.

I don't believe every prompt needs to be meticulously engineered. I don't believe you need to anticipate every conceivable misunderstanding before interacting with an agent.

That would defeat much of the purpose of delegation.

The objective is to catch foreseeable communication problems that are inexpensive to correct.

If replacing an ambiguous word takes a few seconds, do it.

If I notice that I've omitted a relevant constraint, add it.

If my instruction implies permission to modify something I only wanted inspected, clarify the boundary.

But if I'm spending twenty minutes trying to perfect a trivial request that the model could answer in seconds, something has gone wrong with my allocation of effort.

Sometimes the most efficient approach is to send an imperfect prompt, observe the result, and refine it.

The distinction is whether that iteration teaches me something or merely becomes another blind attempt.

**Sweep the low-hanging fruit.**

The goal is to make communication more effective without making the process of communicating unnecessarily expensive.

And sometimes, even after introspection, I still struggle to express what I actually mean.

## When the idea is clearer than the language

I frequently encounter situations where I have a fairly clear internal conception of what I want, but I don't know how to communicate it precisely.

I might mentally envision a design, understand the kind of behavior I want from a software system, or recognize a particular conceptual relationship without knowing exactly how to describe it.

The idea can feel remarkably clear in my head.

Then I try to put it into words.

Suddenly, something that seemed obvious becomes difficult to explain.

This happens particularly often with design work, where the intended result might involve typography, composition, historical references, material qualities, and other characteristics that interact in ways I find difficult to articulate individually.

I might know immediately whether a proposed design matches what I have in mind, even if I couldn't have described that design from scratch.

This is part of the motivation behind the **Prompt Revisor** I implemented in OpenFork.

The idea is relatively straightforward: delegate the process of improving a human-written prompt to another agent.

The revisor can examine the original request, consider relevant conversation history or project context, identify ambiguity, and produce a more actionable expression of the intended objective.

But the most important requirement is preserving the original intention.

Imagine I write:

> I want the branding to feel nostalgic and computational, but not superficially retro. I can picture it, but I don't quite know how to describe it.

A useful revisor might identify possible aesthetic interpretations, propose vocabulary that helps describe the direction, or ask a targeted clarification.

It shouldn't silently decide that I want a specific typeface, color palette, or compositional system unless that decision follows from information I've provided.

That would be replacing my intention with its own assumptions.

A revised prompt can be considerably longer than the original and still be worse.

It might introduce requirements I never intended, remove nuances I cared about, or impose a level of specificity that actually prevents the execution agent from exploring useful alternatives.

In OpenFork, the Prompt Revisor is designed around preserving intent, using available context, clarifying important ambiguities, and allowing the original prompt to be reviewed or restored.

It also doesn't need to be invoked for everything.

Sometimes my original prompt is already adequate.

Sometimes I deliberately want the execution agent to interpret a loosely defined request.

And sometimes I simply want help translating what I can mentally envision into language another model can act upon.

This is a particularly interesting form of delegation because **I'm delegating some of the work of expressing my intention without necessarily delegating ownership of that intention.**

Which leads to a much broader question.

## What would I ask a clone of myself to do?

One of the ways I like to think about agent delegation is through a hypothetical scenario.

Imagine I had a clone of myself.

Another Jackson, possessing my knowledge, curiosity, technical understanding, and general ability to solve problems.

What would I ask him to do?

At this point, probably almost everything.

I don't particularly need to be the person typing code into an editor. I don't need to manually inspect thousands of files, implement every architectural decision, reproduce every calculation, or personally adjust every element of a design.

Even when a problem is intellectually fascinating, performing all the work required to solve it can be tedious.

I would rather spend my attention understanding the problem, developing the objective, considering alternatives, and evaluating what comes back.

And if I can delegate some of that intellectual investigation, I probably will.

I don't view agents as things that should only perform repetitive mechanical tasks. I want them to investigate difficult problems, exercise reasoning, challenge assumptions, compare approaches, and contribute ideas.

My interest lies in directing those capabilities toward something I actually want to accomplish.

If my clone could independently investigate an algorithm, implement it, and demonstrate that it behaves correctly, why would I insist on performing all of those steps myself?

My attention is finite.

I can spend it manually completing one task, or I can spend it directing and evaluating several.

But there's another part of this hypothetical that matters to me.

Suppose I ask my clone to accomplish something I don't understand whatsoever.

How would I grade his work?

How would I recognize a convincing mistake?

How would I distinguish a correct implementation from something that merely appears correct?

This is why I generally prefer delegating work that I could perform or reconstruct myself, even if doing so would require considerable effort.

That doesn't mean I need to remember every technical detail off the top of my head.

For example, I might understand a computational problem without immediately remembering the exact implementation of an algorithm that solves it. If I can reconstruct the reasoning, examine the implementation, identify appropriate tests, and recognize the relevant failure conditions, I still have meaningful evaluation competence.

And I absolutely use agents to explore subjects I don't yet understand.

But I distinguish between asking an agent to help me develop understanding and blindly accepting the agent's output as correct.

The latter is where delegation becomes dangerous.

An agent can generate a substantial amount of convincing work. That work can even function correctly under the conditions someone happens to test.

But if I cannot evaluate the architecture, question the assumptions, or recognize important limitations, I have very little basis for determining whether the result actually satisfies the problem I intended to solve.

**I want to delegate almost all the work without surrendering responsibility for understanding what the work is supposed to accomplish.**

That includes delegating implementation, investigation, experimentation, and a great deal of the reasoning involved.

The part I want to retain is the judgment necessary to establish whether we're pursuing the intended objective and whether the result is acceptable.

And this brings me to the distinction between passive and active delegation.

## Passive, active, and hybrid delegation

I've come to distinguish between *passive delegation* and *active delegation*, although I don't think they're mutually exclusive categories.

Passive delegation involves giving an agent a task and allowing it substantial freedom to interpret and complete that task.

Active delegation involves more deliberate human participation in establishing objectives, controlling important decisions, monitoring progress, and evaluating results.

But I don't think active delegation is universally better, nor do I think passive delegation is inherently irresponsible.

The appropriate approach depends on the task.

Suppose I ask an agent to alphabetize a list, convert a document into a particular format, or apply an established naming convention across a small collection of files.

I probably don't need to supervise every operation.

The objective is reasonably clear, the work is straightforward to evaluate, and mistakes are usually easy to correct.

Passive delegation makes perfect sense.

Now imagine I ask an agent to redesign the architecture of an application.

If I simply write "make the architecture better" and disappear, I'm transferring an enormous amount of judgment to the model.

Better in what sense?

Performance? Maintainability? Reliability? Development speed?

Which existing decisions should remain intact? What tradeoffs am I willing to accept? What constitutes a successful redesign?

The agent might make perfectly reasonable decisions according to its own interpretation of the request.

But those decisions might be completely different from what I intended.

The problem isn't that I delegated the architecture work.

The problem is that I delegated consequential decisions without adequately establishing what I wanted.

### Active delegation doesn't mean micromanagement

I think this is a distinction people frequently overlook.

Active delegation does not require personally controlling every step an agent performs.

I don't want to tell a coding agent which file to open, which function to inspect, or which command to run unless there's a reason that instruction matters.

If I had to manually direct every individual operation, I'd be recreating the tedium I was trying to eliminate.

Instead, I might establish the objective, explain the architectural constraints, specify what must remain unchanged, and define what evidence would demonstrate successful completion.

The agent can then perform the investigation and implementation independently.

If it encounters an ordinary implementation detail, I want it to make a reasonable decision and continue.

If it discovers a conflict with an established architectural requirement, I may want it to surface the conflict before proceeding.

Once the implementation is complete, I can inspect the result, challenge its conclusions, or request further verification.

That is active delegation without micromanagement.

The agent is doing the work. I'm participating in the decisions and evaluations that matter.

### Hybrid delegation

In practice, I often prefer a hybrid approach.

I might actively establish the task and its constraints, passively allow the agent to investigate and implement, and then become actively involved again when an important decision or completion claim requires evaluation.

The level of involvement can change throughout the same task.

Consider a coding agent investigating a performance problem.

I can delegate the initial investigation without knowing exactly where the problem is.

The agent profiles the system, inspects relevant code, and identifies a possible bottleneck.

If the proposed correction is straightforward and preserves behavior, it might implement and test the change without needing additional direction.

But suppose the investigation suggests replacing a major subsystem, changing a public API, or abandoning an architectural constraint.

That's a different decision.

I may want to evaluate the tradeoffs before authorizing that change.

Afterward, the agent can return to autonomous implementation.

This is the kind of delegation I find particularly effective.

It allows the model to exercise its capabilities without granting it unrestricted authority over the objective.

The distinction is important: **I don't want to remove the agent's ability to reason. I want to control which decisions it's authorized to make on my behalf.**

## Delegating agents to supervise other agents

This becomes even more interesting when working with multiple agents.

In projects such as OpenFork, WebSeal, and Silica, I've spent considerable time coordinating agents that perform different investigations, implementations, and verification tasks.

I don't want to personally inspect every line of code every worker writes.

I also don't want to blindly accept every completion claim.

So I can delegate portions of the supervisory work itself.

A supervising agent can recover previous decisions, inspect a worker's progress, challenge an unsupported claim, compare an implementation against its acceptance criteria, or identify areas where additional verification is necessary.

That supervisor might coordinate several other agents while I retain responsibility for the broader objective.

But this introduces a familiar problem.

If I tell a supervisor to "continue the work," what does that mean?

Should it start another investigation? Should it inspect existing work? Should it create new tasks? Should it wait for a worker to finish? Should it modify the implementation itself?

If the goal is to avoid redundant work, I might instead tell it to recover previous sessions, identify completed deliverables, inspect unresolved objectives, and continue only what remains necessary.

These distinctions matter enormously in long-running agentic workflows.

An agent that repeats a completed investigation is wasting resources. An agent that mistakes a worker's claim for verified evidence may permit a defective implementation to proceed. An agent that silently broadens the objective can consume significant effort on work nobody requested.

And the more agents involved, the more opportunities there are for poorly communicated assumptions to propagate.

That's why context preservation, prompt introspection, and clearly bounded autonomy become even more valuable as the workflow grows.

Proper delegation isn't necessarily about making the initial prompt longer. It's about ensuring the relevant objectives, constraints, and evidence survive the process of assigning and executing work.

## What does a good prompt look like?

I don't think there is a universally correct answer.

People often want a collection of prompt templates or special phrases that reliably make models behave better.

But language contains too many degrees of freedom, and the same instruction can produce different results depending on the model, the available tools, and the surrounding context.

Consider a few examples:

| Vague instruction | More deliberate instruction |
|---|---|
| "Make this writing better." | "Improve clarity while preserving the author's voice and intended argument." |
| "Find evidence that my idea works." | "Evaluate the idea, including evidence that could contradict it." |
| "Fix this application." | "Identify the defect, investigate its cause, implement a correction, and verify the affected behavior." |
| "Make this design more modern." | "Explore contemporary design treatments while preserving the existing brand's recognizable characteristics." |
| "Remember what we did yesterday." | "Retrieve yesterday's decisions and completed work before proceeding." |
| "Continue the project." | "Recover the established objective, inspect completed work, and continue from the unresolved requirements." |

The second column isn't automatically superior.

If I want to see how a model independently interprets "modern," the original design prompt might be exactly what I need.

If the agent already possesses sufficient context about a project, "continue" might be perfectly adequate.

If I'm asking a model to casually improve a sentence, a lengthy set of editorial constraints may add nothing useful.

The distinction lies in whether the freedom I'm giving the model is intentional.

Am I deliberately asking it to exercise judgment?

Or have I accidentally transferred judgment because I haven't examined what I'm asking?

And if I'm making that decision consciously, how will I determine whether the resulting work satisfies my intention?

Those questions are more useful to me than any supposedly perfect prompt template.

## Proper delegation is a learned skill

I think people sometimes underestimate how much understanding is involved in becoming effective at delegating work to agents.

A person who doesn't understand how these systems behave can still obtain useful results. Modern models are remarkably capable of interpreting imperfect requests.

But relying entirely on that capability means depending on the model to resolve ambiguities, reconstruct missing intentions, and determine which decisions should be made independently.

Sometimes it succeeds.

Sometimes it doesn't.

And without a useful mental model of the system, it becomes difficult to understand why.

I've found that the better I become at anticipating an agent's behavior, the less effort I need to spend correcting it.

I recognize when an instruction is likely to encourage an unwanted action. I notice when the context contains an assumption that should be challenged. I understand when a task needs explicit boundaries and when the agent can safely decide the details itself.

That understanding makes delegation more efficient.

It also changes how I respond to failures.

Rather than automatically throwing another prompt at the agent, I can consider what caused the failure.

Perhaps the objective was ambiguous. Perhaps the model lost an important piece of context. Perhaps a tool description made an unintended operation seem appropriate. Perhaps the agent's implementation was correct, but its verification was inadequate.

Or perhaps the model simply made a mistake.

The answer won't always be obvious. I don't expect to predict every behavior or explain every failure.

But I can investigate.

And when the investigation reveals something useful, I can apply that understanding to future interactions.

That's how the intuition develops.

Over time, prompt engineering becomes less about consciously constructing elaborate instructions and more about recognizing what information the model needs, how particular language might influence it, and where human judgment should enter the process.

I don't want to spend my time personally executing work merely to prove that I'm capable of doing it.

I want to explore ideas, understand problems, make decisions, and use agents to accomplish things.

I want those agents to reason independently, investigate difficult questions, and carry out substantial amounts of work without requiring constant intervention.

But I also want to understand the systems I'm directing.

I want to know when I'm making an assumption, when the agent is making one, and when a result has actually been verified.

Most of the time, I would rather properly delegate a task than perform it myself.

And that's precisely why I care so much about getting delegation right.

The more I depend on agents to do the work, the less willing I am to treat their behavior as something I shouldn't bother understanding.
