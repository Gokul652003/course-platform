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
    {
      name: "Functional vs Non-Functional Requirements",
      minutes: 11,
      intro: "Learn to separate what a system must do from how well it must do it, and walk through real back-of-envelope capacity estimation with worked numbers.",
      content: `## Two different questions requirements answer

Before any box gets drawn, every system design problem starts with requirements — and requirements split cleanly into two categories that get analyzed very differently.

**Functional requirements** describe *what* the system does — the features and behaviors visible to a user. For a URL shortener: "a user can submit a long URL and receive a short one," "visiting the short URL redirects to the original," "a user can see click analytics for their link." These read like a feature list, and they're usually the easy part of an interview or design doc to nail down — they're concrete and testable.

**Non-functional requirements (NFRs)** describe *how well* the system does it — the quality attributes that don't show up as a checkbox feature but determine whether the system actually survives contact with real usage:

| NFR | What it asks |
|---|---|
| Scalability | Can it handle growth in users, data, and traffic? |
| Availability | What fraction of the time is it usable? |
| Latency | How fast does it respond? |
| Consistency | Do all reads see the same, most-recent data? |
| Durability | Once data is written, can it survive failures without being lost? |
| Security | Is data protected from unauthorized access? |

Non-functional requirements are where system design actually gets interesting, because they're rarely all achievable at once, at low cost, simultaneously — a system optimized for strict consistency pays for it in latency or availability (a theme Module 5's CAP theorem lesson makes precise). Part of the job in any design exercise is explicitly stating *which* NFRs matter most for this particular system, because that choice drives almost every downstream architectural decision.

A practical habit: for any system, write functional requirements as a short bullet list of user-facing capabilities, and non-functional requirements as a short list of *target numbers or guarantees*, not vague adjectives. "Fast" is not a requirement; "p99 read latency under 200ms" is.

## Back-of-envelope capacity estimation

Once requirements are pinned down, the next step — before drawing a single box — is estimating scale. This is a skill in its own right: given a rough usage pattern, quickly derive the numbers (requests per second, storage growth, bandwidth) that will actually determine your architecture. These estimates don't need to be precise; they need to be right within an order of magnitude, fast.

**Worked example: a URL shortener.**

Assume the product has 100 million monthly active users, and on average each user creates 1 short link per month and clicks 20 short links per month (10:1 read-to-write ratio is typical and worth calling out explicitly).

**Write QPS (queries per second) — new links created:**

\`\`\`text
100,000,000 users × 1 write/month
= 100,000,000 writes/month

writes/month ÷ (30 days × 24 hours × 3600 seconds)
= 100,000,000 ÷ 2,592,000
≈ 38 writes/sec average
\`\`\`

**Read QPS — redirects served:**

\`\`\`text
100,000,000 users × 20 reads/month
= 2,000,000,000 reads/month

2,000,000,000 ÷ 2,592,000
≈ 771 reads/sec average
\`\`\`

**Peak load.** Average QPS understates real load, because traffic isn't evenly spread across the day — a common rule of thumb is to multiply average by 2-3x to estimate peak:

\`\`\`text
Peak reads ≈ 771 × 3 ≈ 2,300 reads/sec
Peak writes ≈ 38 × 3 ≈ 115 writes/sec
\`\`\`

This single number — "the system needs to comfortably serve roughly 2,000-2,500 reads/sec at peak" — already tells you a lot: a single traditional relational database read replica handling low thousands of simple key lookups per second is plausible, so this doesn't yet scream "you need a distributed database," but it does tell you caching hot redirects will meaningfully cut database load, since redirect reads dominate writes 20:1.

**Storage.** If each stored record (short code, long URL, metadata) is roughly 500 bytes, and the system retains 5 years of links at the write rate above:

\`\`\`text
100,000,000 writes/month × 12 months × 5 years
= 6,000,000,000 records

6,000,000,000 × 500 bytes
= 3,000,000,000,000 bytes
≈ 3 TB total
\`\`\`

Three terabytes over five years is well within what a single well-provisioned database (or a small cluster) can hold — again, not automatically a "must shard from day one" system, which is exactly the kind of conclusion this estimation exercise exists to produce before you over-engineer.

**Bandwidth**, similarly, comes from multiplying request rate by average payload size — at ~2,300 redirect reads/sec and a tiny few-hundred-byte response each, bandwidth for this particular system turns out to be a non-issue; for a system serving images or video, this same calculation would flag bandwidth as a primary constraint instead.

The pattern to internalize: **users → actions per user → requests per second → peak load → storage → bandwidth**, each derived from the last with simple arithmetic, done out loud, with round numbers. Interviewers care far more about the reasoning chain and what conclusions you draw from it than about decimal precision.

> **Key idea:** Functional requirements describe what a system does; non-functional requirements describe how well it must do it (scale, availability, latency, consistency, durability) and are rarely all maximizable at once, forcing explicit trade-offs; back-of-envelope estimation turns a vague user count into concrete QPS, storage, and bandwidth numbers that directly justify (or rule out) architectural decisions before any component gets designed.`,
    },
    {
      name: "High-Level Design Diagrams & the System Design Process",
      minutes: 10,
      intro: "Learn the standard building blocks of an HLD diagram and a repeatable, interview-ready process for approaching any system design problem from scratch.",
      content: `## The recurring cast of an HLD diagram

Almost every high-level design, regardless of the specific product, is assembled from the same small set of recurring components. Learning to recognize and place these correctly is most of what "drawing an HLD" actually is:

| Component | Role |
|---|---|
| Client | Browser, mobile app, or other caller initiating requests |
| Load Balancer | Distributes incoming traffic across multiple servers (Module 6) |
| API / Application Server | Runs business logic, stateless where possible |
| Cache | Fast, in-memory layer that absorbs repeated reads (Module 7) |
| Database | Durable, authoritative storage for the system's data (Module 4) |
| Message Queue | Decouples producers from consumers for async work (Module 8) |
| CDN | Serves static/cacheable content from locations near the user (Module 7) |
| Blob / Object Storage | Holds large unstructured files — images, videos, backups |

A minimal but realistic HLD for a typical web application already tells a coherent story just from how these are wired together:

\`\`\`text
[Client] → [CDN] → [Load Balancer] → [API Servers] → [Cache] → [Database]
                                            │
                                            └──► [Message Queue] → [Worker Servers]
\`\`\`

Reading this left to right: static assets get served from the CDN without ever reaching your servers; dynamic requests hit a load balancer that spreads them across a fleet of stateless API servers; those servers check a cache before falling through to the database; and anything that doesn't need to happen synchronously (sending an email, resizing an image, updating analytics) gets pushed onto a queue for background workers to pick up later. Every module for the rest of this course is really a deep dive into one box or one arrow in a diagram that looks like this.

## Conventions worth following

A few habits make HLD diagrams communicate clearly instead of turning into a tangle:

- **Arrows show the direction requests flow**, and it's worth labeling them with what's being sent when it's not obvious ("write event", "cache miss", "async job").
- **Group by responsibility, not by literal server.** A "cache layer" box represents the *role*, whether it's one Redis instance or a cluster — the diagram is about architecture, not deployment topology, unless deployment topology is specifically what's being discussed.
- **Call out where state lives.** It should be obvious at a glance which boxes are stateless (can be freely added or removed) and which are stateful (databases, caches — adding or removing instances requires care, covered throughout Modules 4-6).
- **Don't over-detail early.** A first-pass HLD for an interview or a design doc should be sketchable in under two minutes; detail gets added in a second pass once the reviewer agrees the overall shape is right.

## A repeatable process for any system design problem

The specific system changes every time — a chat app, a news feed, a ride-sharing dispatcher — but the *process* for approaching one barely does. This five-step loop is worth memorizing, because it's the actual skeleton every remaining module in this course hangs off of:

**1. Clarify requirements.** Separate functional from non-functional requirements (previous lesson). Ask about scale, read/write ratio, consistency needs, and anything ambiguous in the prompt — "design a chat app" could mean 1:1 messaging, group chats, or both, with wildly different implications.

**2. Estimate scale.** Back-of-envelope QPS, storage, and bandwidth (previous lesson). This determines whether the system needs to be distributed at all, or whether a single well-chosen database and a cache already solve the problem.

**3. Sketch the high-level components.** Draw the boxes-and-arrows diagram above, tailored to this system — what's the client, what's behind the load balancer, where's the data, what (if anything) is async.

**4. Deep-dive into 2-3 critical components.** Not every box deserves equal attention — pick the ones that are actually hard or interesting for *this* system (for a URL shortener, that's usually "how do we generate unique short codes at scale" and "how do we make redirects fast"; for a chat app, it's usually "how do messages get delivered in real time" and "how is chat history stored and paginated").

**5. Discuss trade-offs and bottlenecks.** No design is free of weaknesses — the strongest answers proactively name the bottleneck ("the database is a single point of failure here"), and propose a mitigation (replication, sharding, caching) rather than waiting to be asked.

Following this loop in order matters as much as any individual step: jumping straight to step 3 without steps 1-2 produces a design solving the wrong problem at the wrong scale, and skipping step 5 leaves a design that looks complete but hasn't actually been stress-tested by its own author. Every remaining module in this course adds vocabulary and tools to steps 3 and 4 specifically — this five-step shape doesn't change.

> **Key idea:** HLD diagrams are built from a small recurring set of components (clients, load balancers, servers, caches, databases, queues, CDNs) wired together to tell a clear story of how a request flows through the system, and any system design problem — in an interview or in practice — is best approached with the same repeatable loop: clarify requirements, estimate scale, sketch components, deep-dive the hard parts, then discuss trade-offs and bottlenecks.`,
    },
  ],
}
