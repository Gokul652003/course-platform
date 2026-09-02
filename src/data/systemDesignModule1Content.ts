import type { Module } from "../types"

export const systemDesignModule1: Module = {
  id: 1,
  title: "Foundations of System Design",
  status: "in_progress",
  lessons: [
    {
      name: "What Is System Design? HLD vs LLD",
      minutes: 10,
      intro: "Understand what system design actually means, why it's distinct from writing features, and how High-Level Design and Low-Level Design fit together in a real engineering workflow.",
      content: `## What "system design" actually means

Writing a function that works is a different skill from designing a system that keeps working. **System design** is the process of defining the architecture, components, modules, interfaces, and data flow of a system so that it satisfies a stated set of requirements — not just "does the right thing" once, but keeps doing the right thing as traffic grows, hardware fails, and the team building it changes over time.

A single developer writing a to-do app on their laptop doesn't need to think much about system design — one process, one database file, one user. The moment that app needs to serve a million users, survive a server crashing at 3am, stay fast under load, and let five teams ship features without stepping on each other, every one of those needs becomes a *design* problem, not a coding problem. System design is the discipline of making those decisions deliberately, before they get made accidentally by whatever the code happens to do.

Four forces show up in almost every system design problem, and most trade-offs in this course trace back to tension between them:

- **Scalability** — can the system handle 10x, 100x, 1000x more load by adding resources, without a rewrite?
- **Reliability** — does the system keep working correctly when parts of it fail, which they eventually will?
- **Cost** — every extra server, every redundant copy of data, every millisecond shaved off latency has a price; good design spends that budget where it matters.
- **Maintainability** — can engineers who didn't build the system understand it, extend it, and fix it safely six months from now?

## High-Level Design (HLD)

**High-Level Design** describes a system from a distance: what are the major components (web servers, databases, caches, queues, external services), how do they talk to each other, and how does data flow through the system end to end. An HLD document typically answers questions like:

- What services exist, and what is each one responsible for?
- How do clients reach the system, and how is traffic distributed across servers?
- Where is data stored, and how is it replicated or partitioned?
- Where are the caches, queues, and CDNs, and what problem does each one solve?
- What are the expected bottlenecks, and how does the design address them?

Crucially, HLD deliberately stays *implementation-agnostic* at this stage — "a relational database stores user profiles" is an HLD-level statement; "the \`UserRepository\` class exposes a \`findById\` method backed by a connection pool" is not. HLD is about the shape of the system, not the code inside any one box.

## Low-Level Design (LLD)

**Low-Level Design** picks up exactly where HLD leaves off: once you've decided a component exists (say, "a rate limiter service"), LLD is where you decide how that component is actually built — its classes, its interfaces, its data structures, the algorithms it runs, how it's tested. LLD questions look like:

- What classes and interfaces make up this component, and how do they interact?
- What design patterns (Module 12 covers these) apply cleanly here?
- What are the method signatures, the data models, the edge cases?
- How is this component going to be unit tested?

Where HLD produces boxes and arrows, LLD produces something close to a blueprint for the actual code — sometimes literally class diagrams (UML, covered in Module 12) that a developer could implement almost mechanically.

## How they fit together in practice

In a real engineering organization, these two levels aren't competing artifacts — they're sequential zoom levels on the same problem:

\`\`\`text
Requirements gathering
        │
        ▼
  High-Level Design  ──►  reviewed by senior engineers / architects
        │                 (is this the right shape of system?)
        ▼
  Low-Level Design   ──►  reviewed by the implementing team
        │                 (is this component correctly designed?)
        ▼
   Implementation
\`\`\`

A typical flow: a team gets a set of requirements, produces an HLD document, and gets it reviewed — this is where someone asks "why a queue here and not a direct call?" or "what happens when this database is unavailable?" Once the shape of the system is agreed on, each component gets its own LLD, reviewed by the engineers who will actually build it. Skipping HLD and jumping straight to code tends to produce systems that technically work but don't hold up under real load or real failures, because nobody stepped back and reasoned about the whole picture before writing the first line.

## Why this shows up so heavily in interviews

Technical interviews at companies operating at real scale (Google, Amazon, Uber, and effectively any tech company doing high-traffic engineering) lean heavily on system design rounds because the skill doesn't show up in algorithm puzzles: designing Twitter's timeline, a URL shortener, or a ride-sharing dispatch system tests whether a candidate can gather ambiguous requirements, make and justify trade-offs, and reason about a system operating far beyond what fits on one machine. This course builds toward exactly that — Module 12 closes with a dedicated interview playbook — but every module before it is building the vocabulary and mental models an interviewer expects you to reach for unprompted.

> **Key idea:** System design is the deliberate practice of choosing a system's architecture so it stays scalable, reliable, cost-effective, and maintainable as it grows; High-Level Design decides the shape of the system (components, data flow, boxes and arrows), Low-Level Design decides how each component is actually built (classes, interfaces, algorithms), and real engineering work — and system design interviews — move through both in that order.`,
    },
  ],
}
