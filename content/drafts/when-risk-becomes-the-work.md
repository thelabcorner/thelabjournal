---
title: "When Risk Becomes the Work"
date: 2026-11-17
author: "Jackson Cummings"
status: published
issue: "J–010"
slug: when-risk-becomes-the-work
category: "Essays"
summary: "What two weeks of router-firmware work taught me about LLMs, manufactured uncertainty, disproportionate caution, and the judgment required to accept risk."
tags: ["LLMs", "AI agents", "Risk management", "Engineering", "Uncertainty", "Decision-making", "Firmware", "Autonomous development"]
---

# When Risk Becomes the Work

I recently spent nearly two weeks working on a firmware project for an old Belkin N600 router.

I wanted to repurpose it as a wireless repeater. That meant modifying the firmware, understanding enough about the hardware to avoid doing something stupid, and eventually writing the resulting image onto the device.

There was a legitimate risk of bricking the router.

I knew that going into the project, and I wanted to take it seriously. We investigated the original firmware, worked through compatibility questions, created backups, and examined what recovery might look like if something failed. A substantial amount of that work was worthwhile.

But after all that preparation, I still found myself having to tell the LLM something that, to me, should have been part of its own engineering judgment:

**Sometimes you have to take risks.**

We proceeded. The firmware installed successfully.

That doesn't tell me the earlier precautions were pointless. Quite the opposite. They helped us reach a position where trying the installation made sense.

What bothers me is that I'm not convinced the agent would have recommended taking that final step without my intervention.

## Identifying risks is the easy part

Language models can be remarkably good at identifying things that might go wrong.

Give one a complicated engineering problem, and it can enumerate possible compatibility issues, security problems, unexpected interactions, edge cases, and failure conditions. Some of those observations are extremely useful.

But I think LLMs are much weaker at deciding how much attention each possibility deserves.

The existence of a risk tells me surprisingly little about what to do with it.

A failure could be likely but inconsequential. Another could be unlikely but severe. Some failures are reversible; others destroy something that cannot easily be recovered. Some can be caught immediately. Others might remain hidden until substantial damage has occurred.

The consequences also depend on context. Bricking a spare experimental router is not equivalent to taking a critical network device offline.

Those distinctions should determine the weight a risk receives in the decision.

Instead, I've repeatedly seen agents treat a technically plausible failure as though identifying it automatically creates an obligation to resolve it.

One concern becomes the next task. That investigation reveals another concern, which becomes another task. Before long, the original goal is surrounded by an expanding list of things that *could* happen.

The agent might be making perfectly reasonable observations in isolation while losing proportion across the whole problem.

A long list of risks is not the same thing as risk management.

## Manufacturing uncertainty

Something I find especially interesting is that the reasoning process itself can contribute to this problem.

LLMs operate through prediction, and reasoning-oriented models can spend additional computation exploring possible explanations, reconsidering assumptions, and generating further questions. That is useful when the model is investigating something genuinely uncertain.

It also gives the model an almost inexhaustible way to keep a problem open.

Suppose an agent is checking whether a software change will work. It identifies a possible dependency issue. Investigating that issue raises questions about versions, operating systems, undocumented behavior, and unusual runtime conditions. Each question becomes another possible branch of investigation.

At some point, the model can be generating uncertainty faster than it is resolving the uncertainty that matters.

I'm not necessarily talking about inventing imaginary failures. A model can manufacture *practical* uncertainty out of individually plausible concerns. It can take a possibility with little demonstrated relevance and build an elaborate investigation around it.

The more it investigates, the more substantial the concern can begin to appear. Its own attention gives the issue an impression of importance.

And then it explains, in convincing technical language, why the additional work is justified.

This is one of the difficult things about supervising an LLM. The next step can always sound reasonable. So can the next one. The failure becomes visible when you look at the sequence rather than any individual step.

Did that investigation make the decision better? Did it establish that the failure was likely or consequential? Did it change what we should do next?

Sometimes the answer to all three is no.

The model has produced more analysis, not more useful certainty.

## The model's "fear" of bricking something

The word *brick* seemed to carry enormous weight in the router project.

I don't mean that the model literally experienced fear. I'm describing the behavior I observed: once permanent hardware failure was on the table, that possibility remained unusually prominent in its reasoning.

And I understand why. The concept signals an irreversible outcome. An instruction-following system should be cautious about actions that could permanently damage equipment, especially when a person has explicitly requested safeguards.

But caution still needs to be calibrated to the situation.

The Belkin wasn't my primary router. It was a device I was experimenting with. If it failed, I would have lost the device and the work invested in it, not the operation of my entire home network.

At the beginning, we knew relatively little about the risks. By the time we had studied the firmware layout, prepared the image, examined recovery paths, and backed up the original flash contents, the situation was different.

The remaining uncertainty hadn't vanished. But the evidence available to make the decision had changed.

The agent's apparent reluctance to proceed didn't seem to change in proportion.

That is the failure of discretion I'm trying to describe. A severe-sounding outcome can dominate the model's attention long after the conditions around that outcome have been investigated.

The model keeps asking whether the device *could* be bricked. The answer, of course, remains yes.

The more useful question is whether the remaining possibility justifies delaying the experiment any further.

Those are different questions, and they can lead to very different decisions.

## Two weeks of trying not to brick a router

The preparation wasn't a single pointless detour. There were real technical questions to answer.

We needed to understand what was being written to the device. We wanted to preserve its original contents. We needed to know whether the firmware was structured correctly and what recovery options were available if the installation failed.

Those precautions reduced meaningful uncertainty.

But I began to notice that the project was spending an extraordinary amount of time on the possibility of a failed installation.

There were always more things we could inspect, more hypothetical failure cases to discuss, and more ways to reassure ourselves that the next step wasn't premature.

Even after a great deal of preparation, some physical uncertainty remained. We couldn't completely establish how the device would behave during a flash without actually flashing it.

That was the point at which the problem changed.

Initially, the work was about reducing risks we didn't understand. Eventually, it became about whether we could accept the risks we couldn't eliminate.

I don't think the agent adequately distinguished those two phases.

After nearly two weeks, I told it explicitly that sometimes you have to take risks. We proceeded, and the modified firmware booted successfully.

The repeater configuration was still a separate task, but the installation itself worked.

That result is one observation, not a statistical argument that firmware flashing is safe. A successful attempt also doesn't retroactively prove that every precaution was unnecessary.

What it does illustrate is how long an agent can remain preoccupied with a potential failure even after substantial work has made proceeding a defensible decision.

I wanted to retain control over the destructive action. That is entirely different from wanting the model to remain indefinitely undecided.

An agent could have told me: we've taken these precautions, these risks remain, additional inspection is unlikely to resolve them, and given the limited consequences of losing this experimental device, proceeding is a reasonable option.

That would have been judgment. I could then have authorized the action with a much clearer understanding of the tradeoff.

Instead, I had to supply the conclusion that the remaining risk was acceptable.

## When mitigating a risk creates another

There's a second problem with an agent that tries to resolve every possibility it identifies.

Mitigation itself carries risk.

Suppose a model notices a hypothetical compatibility issue and rewrites part of an otherwise functioning implementation to prevent it. The rewrite introduces new behavior, new dependencies, and new opportunities for regression. Now those changes require verification.

The verification reveals another possible concern. Another modification follows. And another.

Eventually, a relatively narrow objective has become a large restructuring effort justified by a series of problems that may never have occurred.

I see a similar pattern in autonomous development. A worker discovers a possible obstacle, expands the scope of its work, and then spends additional time managing the uncertainty introduced by that expansion.

An agent can become extraordinarily busy while making very little progress toward the objective it was originally assigned.

The irony is that the attempt to make the system safer can create more ways for it to fail.

Good precautions earn their place by reducing a meaningful risk at an acceptable cost. They aren't automatically valuable because they sound cautious.

If the mitigation is more disruptive than the failure it prevents, we need to reconsider it.

## Some uncertainty only ends when you act

There are limits to what analysis can establish.

You can inspect firmware, read source code, compare versions, study documentation, and construct increasingly detailed predictions. Those activities can change what you know.

They cannot always tell you what will happen when a real system runs.

Some information exists on the other side of an experiment.

That doesn't make experimentation automatically appropriate. The test still needs to be bounded, the consequences of failure need to be acceptable, and safeguards should be proportionate to those consequences.

But once those conditions are satisfied, further speculative analysis may provide less information than trying the thing.

I think this is where LLMs can struggle to recognize diminishing returns.

As long as the model can imagine another possible complication, it has something to investigate. Without a meaningful stopping condition, that ability to keep reasoning can prevent it from reaching the experiment that would settle the original question.

With the Belkin, we eventually had to write firmware to hardware. No amount of reading the image could guarantee the outcome of that operation.

The decision was never between certain success and reckless failure. It was between acting with bounded uncertainty and continuing to investigate an uncertainty that could not be completely resolved beforehand.

## Doing nothing is a decision too

One cost that I think agents underweight is the cost of not proceeding.

If a firmware flash fails, there's an observable consequence. If a code change introduces a regression, there's something concrete to diagnose.

But an experiment that never happens can look perfectly safe.

Nothing broke. Nothing was learned from the real system, either.

Time, attention, and opportunity are resources. Spending another day investigating an increasingly remote possibility consumes them, even when nothing obviously goes wrong.

And that cost is easy to leave out of an analysis dominated by failure scenarios.

If another round of verification has a reasonable chance of discovering a serious defect, it might be worth doing. If it is unlikely to change the decision, it needs a different justification.

Sometimes the right recommendation is to stop because the risk remains unacceptable. Sometimes it's to add another safeguard. Sometimes it's to run a reversible test.

And sometimes it's to accept the remaining uncertainty and proceed.

I don't want every unresolved question to become an automatic blocker. I want the decision to reflect what we know, what we stand to lose, and what additional investigation is actually expected to accomplish.

## The discretion I want from an agent

I don't want LLMs to become reckless. I also don't want them to confuse caution with competence.

There's a difference between being capable of describing risk and being capable of managing it.

Managing risk requires choosing where to spend attention. It requires revisiting an assessment when the evidence changes. It requires recognizing when mitigation is creating more complexity than the original problem warranted.

Most importantly, it requires being able to say that enough has been done.

I recognize the same tendency in myself. I love understanding things, and I can spend a ridiculous amount of time investigating a mechanism because I want the explanation to be complete. Sometimes that curiosity produces useful discoveries. Sometimes I have to recognize that I'm no longer getting closer to what I set out to do.

I want an agent to be able to make that distinction alongside me.

The Belkin firmware installed. The preparation had value. The final step still carried risk, and taking it was reasonable in the circumstances.

I just wish the model had been able to reach that recommendation without needing me to tell it that sometimes an engineer has to take a risk.
