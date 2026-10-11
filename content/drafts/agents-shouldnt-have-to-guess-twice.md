---
title: "The tools around the model"
date: 2026-10-10
author: "Jackson Cummings"
status: draft
slug: agents-shouldnt-have-to-guess-twice
category: "Essays"
summary: "When I ask a coding agent to build something, it does the reading, editing, and testing. I've been rebuilding OpenFork's tools around what actually happens in that loop."
tags: ["Agentic engineering", "OpenFork", "OpenCode", "Coding agents", "Developer tools", "Tool recovery", "Software engineering"]
---

# The tools around the model

When I ask a coding agent to build something, it does the reading, editing, and testing. I've been rebuilding OpenFork's tools around what actually happens in that loop.

## I give the agent a problem, not a diff

A lot of my development starts with a prompt now. Sometimes I know the architecture I want. Sometimes I have a performance problem, a broken interaction, or a vague idea that needs to become a concrete implementation. I describe the constraints, tell the agent what to investigate, and keep pushing on the result until I understand why it works.

The agent is the one navigating the repository. It decides what to read, makes edits, runs tests, encounters errors, and tries again. I'm reviewing the direction, challenging assumptions, and deciding whether the result is good enough. That's a different workflow from asking an autocomplete tool to finish a function while I hold the keyboard.

I started modifying OpenCode partly because I kept noticing how much of an agent's effort disappears into the mechanics of working on a codebase. It can spend a remarkable number of turns finding the right file, reconstructing a symbol's relationships, working around an awkward edit failure, or discovering which test command the project actually uses. None of that is the engineering problem I asked it to solve.

## An unfamiliar repository shouldn't be a scavenger hunt

Consider the first minute of a session. The agent needs to know what kind of project it has entered. Is it a Bun monorepo? Does it use Vite or a custom build? Where are the packages? Which scripts are worth running? What's changed recently? It can answer those questions through a chain of directory listings, manifest reads, and shell commands. Or the environment can provide a compact, reliable map.

That's what my Project tool is for. It reads bounded repository metadata, identifies the toolchain and entry points, and gives the agent a useful starting position without dumping thousands of irrelevant lines into the conversation. The point isn't to hide the repository. It's to avoid making the model assemble the same introductory facts from scratch every time.

Finding code is the next problem. A text match is often enough, but searching for a symbol's name isn't the same thing as finding its definition or understanding who calls it. I added Tree-sitter-based symbol search, file outlines, and usage discovery that distinguishes references it can actually attribute from same-name occurrences it cannot. For deeper TypeScript operations, I also want semantic information from language services and plan-first refactoring rather than an indiscriminate search-and-replace.

Then there's reading. When the agent already knows the five relevant files, making five independent calls to retrieve them is unnecessary. When it only needs a function, reading the entire package is unnecessary. The read and search tools are built around bounded windows, targeted lookups, and batching known work. That matters because tool output isn't free: it takes time, and much of it ends up competing with the code and reasoning that actually deserve the model's attention.

## A tool error changes what the agent thinks it knows

The edit tool is probably the clearest example of why I've become so interested in this.

During work on a PDF engine, an agent tried to change a coordinate conversion expression. The exact line existed in two places. The proposed edit didn't contain enough context to identify the intended occurrence. Guessing would have been dangerous. An opaque refusal would have been safe, but it would also have sent the agent back to reconstruct the situation from another read.

I want a third outcome. The tool can refuse the ambiguous mutation while returning the candidate line numbers and the surrounding context that distinguishes them. The agent can then select the intended occurrence explicitly, or revise its plan if the repeated code means its original assumption was wrong. The failed call becomes useful new information.

This distinction is easy to overlook when talking about coding agents. I'm not sitting there invoking edit operations by hand. The model is constructing the arguments, interpreting the return value, and choosing the next action. An error message is part of its working environment. A vague error invites another guess; a precise one lets it update its understanding of the file.

## Recovery should remove uncertainty, not invent intent

I've taken that idea much further in OpenFork. An edit can be grounded in exact text, an observed line, a verified range, or a nearby anchor. Multiple non-overlapping edits to one file can be submitted together. Larger changes can go through a patch operation that checks the hunks before touching disk. The agent should be able to describe all the changes it already knows about without paying for a separate conversation round trip for each one.

Some input mistakes are purely mechanical. A model can accidentally include the line-number prefix from a read result, carry an extra Markdown fence into a replacement, or copy text with slightly different whitespace. A tool can sometimes detect and repair those cases under narrow rules. That's useful, provided the repair is visible and the target remains unambiguous.

Other mistakes cannot be repaired safely. If two functions contain the same text, the tool doesn't know which one the agent meant. If a file changed after it was inspected, the previous coordinates may no longer be trustworthy. OpenFork's edit path rechecks what it is about to modify, rejects unsupported guesses, and gives the agent specific recovery information. For a single-file write it also uses a temporary file and rename. Multi-file patches need their own validation and recovery rules; they aren't magically one atomic filesystem transaction.

I think the boundary is important. The agent should decide what change is correct. The tool should be exceptionally good at establishing whether the proposed operation means what the agent thinks it means, and at refusing to pretend when it can't.

## The rest of the loop matters just as much

Getting an edit onto disk is one step. I regularly ask agents to prove that an implementation behaves correctly, inspect the edge cases, and keep iterating. If the next move is to run tests, the agent shouldn't need to remember the peculiar command-line flags for every repository and test framework.

My Test tool detects the project's harness, maps filters to the right runner, applies a timeout, and returns a compact failure report while retaining the full output for inspection. It can list tests without executing them. Type checking and LSP diagnostics help with a different class of mistakes. The agent still has to interpret failures and fix their causes, but it can spend its context on the failing assertion instead of an enormous block of unfiltered terminal output.

The same pattern applies outside source files. JSON and SQLite have structure that ordinary text reads don't explain particularly well. A structural preview, a targeted query, or a dry-run mutation can give the agent a much better understanding of what it's about to change. Git inspection and guarded writes answer questions about worktree state without turning every repository operation into a free-form shell command. These are modest capabilities individually. Together they change the texture of an engineering session.

## The best tool surface isn't necessarily the biggest one

There is a cost to adding tools. Each capability has a contract, permissions, edge cases, and implementation work. Exposing everything to the model all at once can make selection harder and consume context before the agent has even begun. I've gone back and forth on that while building OpenFork.

The direction that makes sense to me is a small set of direct tools for common actions, backed by more specialized capabilities that the agent can discover when needed. I've also worked on a programmable Code tool that can look up a capability and compose calls in a confined JavaScript runtime. Independent reads can happen together; filtering and aggregation can happen before the result reaches the model. The model doesn't need fifty pages of intermediate output to learn that three files match the condition it asked about.

This is where I think discussions about harness simplicity sometimes miss the most interesting distinction. A tool can have a simple interface and a fairly sophisticated implementation. A tiny implementation can also impose a complicated workflow on the agent. I care more about the number of uncertain decisions and unnecessary turns the model has to make than the number of lines it took to implement the tool.

## An agent can lose its place without losing its files

Short tasks hide another set of problems. I work with long sessions, parallel agents, shared worktrees, and projects that take more than one context window to investigate. A worker can be interrupted. A session can be compacted. Another agent can modify the same file while the first is preparing a change. A test failure can arrive after the reasoning that caused it has scrolled out of view. Once I start delegating tasks to multiple workers, their ownership, progress, and conflicting changes become part of the problem too.

I've been building different recovery mechanisms for different kinds of lost state. Checkpoints record worktree history and help trace which session changed a file. Session inspection makes it possible to recover the status and history of delegated work. Project memory is meant to preserve decisions, rejected approaches, and surprising failure causes with evidence, instead of treating the last generated summary as infallible truth. My work on context compaction comes from the same concern: a shorter transcript is only useful if the next agent turn still has the constraints and decisions it needs.

These mechanisms don't do the same job. A checkpoint is not a memory. A summary is not the filesystem. A session's last update time isn't proof its worker is alive. I've learned that recovery gets dangerous when those distinctions are blurred. It needs to preserve provenance and be honest about what the system actually knows. The same principle applies when OpenFork is used through different clients: the agent shouldn't acquire different safety guarantees just because the request arrived through a desktop session, an editor integration, or an external tool gateway.

## I want the agent doing engineering

None of this makes an LLM incapable of misunderstanding a requirement or designing the wrong algorithm. An agent can still write a test that confirms its own mistaken assumption. Better tools don't settle questions of architecture, correctness, or taste for it.

What they can do is stop adding avoidable uncertainty. The repository map should be accurate. A symbol search should say what it can and cannot attribute. An ambiguous edit should remain unapplied. A test run should identify the test that failed. An interrupted session should leave enough evidence to continue instead of starting its investigation over.

I also don't want self-healing to become a euphemism for doing something surprising. An automatic correction has to be narrow, explainable, and less risky than stopping. Otherwise the tool is just making a second unreviewed decision on behalf of the agent.

I spend a lot of time prompting agents to go deeper: investigate the architecture, run the uncomfortable tests, profile the hot path, compare alternatives, and explain the result. The tools around the model should make that kind of work easier to carry through. If the agent gets stuck, I want it to be stuck on the actual engineering problem, not on a preventable misunderstanding between its tool call and the filesystem.
