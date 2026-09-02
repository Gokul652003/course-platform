import type { Module } from "../types"

export const systemDesignModule2: Module = {
  id: 2,
  title: "Architectural Styles",
  status: "upcoming",
  lessons: [
    {
      name: "Monolithic vs Microservices Architecture",
      minutes: 11,
      intro: "Compare monolithic and microservices architectures on deployment, scaling, and failure isolation, and learn when each one is actually the right call.",
      content: `## Two ways to structure a system

Every backend system has to answer one structural question early: is this one deployable unit, or many? The two dominant answers are **monolithic architecture** and **microservices architecture**, and the choice between them shapes almost everything downstream — how the team is organized, how deployments work, how failures propagate, and how the system scales.

## Monolithic architecture

A **monolith** is a system built and deployed as a single unit: one codebase, one build, one running process (or one horizontally-scaled copy of that same process) that contains all the business logic — user management, orders, payments, notifications — behind one boundary. Internally the code can still be well-organized into modules or packages, but at deployment time it's one artifact.

\`\`\`text
┌─────────────────────────────────┐
│         Monolith (1 app)        │
│  ┌────────┐ ┌────────┐ ┌──────┐ │
│  │ Users  │ │ Orders │ │ Pay  │ │
│  └────────┘ └────────┘ └──────┘ │
└─────────────────────────────────┘
              │
        [ one database ]
\`\`\`

**Strengths:** simple to develop early on (one codebase to run and debug), simple to deploy (one artifact, one pipeline), and function calls between "modules" are just in-process calls — no network latency, no partial-failure handling between them. For a new product, or a small team, this simplicity is a real advantage, not a compromise.

**Weaknesses:** as the codebase and team grow, everyone deploying to the same artifact means one team's bug or slow migration can block or break everyone else's release; the entire application has to scale together even if only one part (say, checkout) is actually under heavy load, wasting resources on scaling parts that didn't need it; and a bug in one module can crash the entire process, taking down unrelated functionality with it.

## Microservices architecture

**Microservices** split the system into many small, independently deployable services, each owning a specific piece of business capability and typically its own database, communicating over the network (HTTP/REST, gRPC, or async messaging — Module 8).

\`\`\`text
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Users   │   │  Orders  │   │ Payments │
│ service  │   │ service  │   │ service  │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
[users DB]     [orders DB]     [payments DB]
\`\`\`

**Strengths:** each service can be deployed, scaled, and even rewritten independently — the payments service can scale to handle Black Friday load without spinning up extra copies of the notifications service; teams can own a service end to end without stepping on each other's deploys; and a crash in one service doesn't necessarily take down the others, improving failure isolation.

**Weaknesses:** this independence isn't free. Now there's a network hop (and its latency, and its failure modes) where there used to be a function call; data that used to be one consistent transaction across tables now often spans services with separate databases, forcing you to reason about eventual consistency and distributed transactions; and the operational surface area explodes — more services to deploy, monitor, version, and debug, often needing dedicated platform/DevOps investment (service discovery, centralized logging, distributed tracing — Module 10) that a monolith never required.

## A direct comparison

| | Monolith | Microservices |
|---|---|---|
| Deployment | One unit, one pipeline | Many independent units |
| Scaling | Whole app scales together | Each service scales independently |
| Team ownership | Shared codebase, coordination overhead | Clear per-service ownership |
| Failure isolation | One crash can affect everything | Failures more contained |
| Inter-component calls | In-process, fast, reliable | Network calls, added latency & failure modes |
| Data consistency | Easy — one database, real transactions | Hard — often eventual consistency across services |
| Operational complexity | Low | High — needs mature infra/tooling |
| Good fit for | Small teams, early-stage products, simpler domains | Large orgs, independently-scaling components, many teams shipping in parallel |

## Choosing between them

The honest answer most experienced engineers give is: **start with a well-organized monolith, and split out microservices only when you have a concrete, specific reason to** — a component with wildly different scaling needs than the rest of the system, a team that needs to deploy independently without coordinating with everyone else, or a piece of the domain that's genuinely a separate bounded context. Splitting into microservices too early, before the team or the domain boundaries are well understood, tends to import all of the operational cost (network calls, distributed data, more infrastructure) without the team being big enough yet to benefit from independent deployability.

This isn't a purity contest, either — most large real-world systems land somewhere in between: a handful of services, each still reasonably sized, rather than either one giant monolith or hundreds of tiny ones. The right granularity is the one that matches how the team is actually organized and where the real, current scaling pressure is — not a default assumed at the start of a project.

> **Key idea:** A monolith is one deployable unit — simple to build and deploy, but everything scales and fails together; microservices are many independently deployable services — independently scalable and better isolated, at the cost of network calls, distributed data consistency, and real operational overhead; the pragmatic default is to start monolithic and split out services only when a specific, concrete need (scaling, team autonomy, a genuine domain boundary) justifies the added complexity.`,
    },
    {
      name: "Event-Driven, Serverless & Stateless/Stateful Architectures",
      minutes: 10,
      intro: "Learn how event-driven systems decouple producers from consumers, what serverless actually trades away, and why statelessness is the default preference for scaling services.",
      content: `## Event-driven architecture, briefly

An **event-driven architecture** structures a system around the production, detection, and reaction to *events* — facts about something that happened ("order placed," "payment failed," "file uploaded") — rather than direct, synchronous calls between services. A **producer** emits an event onto an **event bus** (or message broker) without knowing or caring who, if anyone, is listening; one or more **consumers** subscribe to relevant events and react independently.

\`\`\`text
[Order Service] ──emits──► [Event Bus] ──delivers──► [Inventory Service]
                                    │
                                    ├──delivers──► [Notification Service]
                                    │
                                    └──delivers──► [Analytics Service]
\`\`\`

The payoff is **decoupling**: the order service doesn't need to know inventory, notifications, and analytics all care about "order placed" — it just emits the fact, and consumers can be added or removed later without touching the producer at all. This trades immediate consistency (the order service doesn't wait to confirm inventory was updated before returning) for flexibility and resilience — if the notification service is down, orders still get placed; notifications just catch up once it recovers. Module 10 goes deep on event-driven patterns (event sourcing, event streaming, failure handling); this lesson is the vocabulary this rest of the course assumes you have.

## Serverless architecture

**Serverless** (more precisely, Functions-as-a-Service, or FaaS — AWS Lambda, Google Cloud Functions, Azure Functions) lets you deploy individual functions that the cloud provider runs on demand, without you provisioning or managing any server. The provider handles scaling — from zero to thousands of concurrent invocations and back — automatically.

**What you gain:** no server management at all (no OS patching, no capacity planning), a cost model that charges per invocation/execution time rather than for idle server capacity (genuinely cheap for spiky or low-traffic workloads), and scaling that's entirely automatic.

**What you trade away:**

- **Cold starts** — a function that hasn't run recently may need to be initialized (container startup, runtime init) before it can handle a request, adding latency that a warm, always-running server doesn't have. This matters a lot for latency-sensitive paths and much less for background jobs.
- **Execution time limits** — most FaaS platforms cap how long a single invocation can run, ruling out long-running processes.
- **Statelessness is mandatory** — a function instance can be torn down at any time between invocations, so it cannot rely on anything held in local memory persisting between calls.
- **Cost at sustained high volume** — the per-invocation pricing that's cheap for spiky, low-traffic workloads can become more expensive than a fleet of always-on servers once traffic is consistently high.

Serverless is a strong fit for event-driven, bursty, or infrequent workloads (image processing triggered by an upload, a webhook handler, a nightly batch job) and a weaker fit for latency-critical, sustained, high-throughput services where the cold-start tax and per-invocation cost stop paying off.

## Stateless vs. stateful services

This distinction cuts across every architectural style above and matters enough to call out on its own.

A **stateless** service keeps no client-specific data in memory between requests — every request carries everything the service needs to handle it (or the service looks it up fresh from an external store), so any instance of the service can handle any request. A **stateful** service holds onto data — a session, an open connection, an in-memory cache specific to one client — that must be present for subsequent requests from the same client to work correctly.

Why this distinction matters so much for scaling: a stateless service can be scaled horizontally trivially — spin up 10 more identical copies behind a load balancer, and any of them can serve any request, with no coordination needed (Module 6 covers exactly this). A stateful service is much harder to scale the same way — if a user's session data only lives in the memory of the one server they first connected to, the load balancer either has to route them back to that same server every time (\\"sticky sessions,\\" itself a scaling constraint) or the state needs to be moved somewhere shared.

\`\`\`text
Stateless:  Request → any server → response  (no memory of past requests)
Stateful:   Request → the server holding this client's state → response
\`\`\`

The strong general preference in modern system design is to **push state out of application servers and into dedicated, purpose-built stores** — a database for durable data, a shared cache like Redis for session data, a queue for pending work — keeping the application servers themselves stateless and freely, cheaply scalable. State doesn't disappear; it just moves to a component specifically designed to manage it well, rather than living incidentally in a process that was never meant to be a database.

> **Key idea:** Event-driven architecture decouples producers from consumers through an event bus, trading immediate consistency for flexibility and resilience; serverless removes server management entirely at the cost of cold starts, execution limits, and mandatory statelessness, making it a strong fit for bursty or event-triggered work and a weaker one for sustained high-throughput services; and stateless services — which hold no client-specific memory between requests — scale horizontally far more easily than stateful ones, which is why the default move in system design is to push state into dedicated stores and keep application servers stateless.`,
    },
    {
      name: "Pub/Sub Architecture & Choosing an Architectural Style",
      minutes: 10,
      intro: "See how the publish/subscribe pattern decouples services through topics, walk through a worked fan-out example, and build a framework for choosing an architectural style for a real system.",
      content: `## The publish/subscribe pattern

**Publish/subscribe (pub/sub)** is the specific mechanism that usually powers event-driven architecture (previous lesson) under the hood. Its three pieces:

- **Publishers** produce messages without addressing them to any specific recipient — they publish to a named **topic**.
- **Topics** are named channels that categorize messages by subject ("order-events," "user-signups").
- **Subscribers** register interest in one or more topics, and receive every message published to those topics, without the publisher ever needing to know who's listening.

\`\`\`text
Publisher ──► [ Topic: "order-events" ] ──► Subscriber A
                                        ──► Subscriber B
                                        ──► Subscriber C
\`\`\`

This is a meaningfully different shape from a message queue in the strict sense (Module 8 draws this out in more depth): a classic queue typically delivers each message to exactly *one* consumer (useful for distributing work across a pool of workers), while pub/sub is built for **fan-out** — the same message reaching every interested subscriber. Real messaging systems (Kafka, SNS, Google Pub/Sub) often support both patterns, but it's worth keeping the conceptual distinction clear: queue = one message, one worker; pub/sub topic = one message, every subscriber.

## Worked example: an order-placed event

Consider an e-commerce checkout. Without pub/sub, the order service would need to directly call inventory, notifications, and analytics itself — and know about every future consumer that might ever need this event:

\`\`\`text
Without pub/sub:
Order Service ──calls──► Inventory Service
              ──calls──► Notification Service
              ──calls──► Analytics Service
(Order Service must know about, and stay available to, every consumer)
\`\`\`

With pub/sub, the order service publishes a single \`OrderPlaced\` event and moves on:

\`\`\`text
With pub/sub:
Order Service ──publishes──► [ Topic: "order-placed" ]
                                       │
                       ┌───────────────┼───────────────┐
                       ▼               ▼               ▼
              Inventory Service  Notification Svc  Analytics Svc
              (reserve stock)    (send confirmation) (log purchase)
\`\`\`

The concrete benefits this buys: **adding a new consumer** (say, a fraud-detection service that also wants to see every order) requires zero changes to the order service — it just subscribes to the existing topic. **Removing or temporarily disabling a consumer** similarly requires no change to the publisher. And if one subscriber is slow or briefly down, it doesn't block the order service from completing the checkout or block the *other* subscribers from receiving the event — each consumer processes independently, at its own pace, which is exactly the kind of resilience event-driven systems are reached for in the first place.

## Choosing an architectural style

Modules 1 and 2 together have now covered monolithic vs. microservices, event-driven vs. serverless, stateless vs. stateful, and pub/sub — a real toolbox, not a single answer. Picking the right style for a specific system comes down to a short set of honest questions:

- **How big is the team, and how independently do they need to deploy?** A five-person team rarely benefits from ten microservices; a five-hundred-person org rarely thrives inside one monolith.
- **What's the actual current scale, not the imagined future scale?** Designing for traffic you don't have yet trades real, immediate simplicity for hypothetical future flexibility — often a bad trade, and one worth naming explicitly rather than defaulting into.
- **How tightly does this system need consistency?** A payments flow that must never show a stale balance leans toward synchronous calls and strong consistency; a "likes" counter or an activity feed tolerates eventual consistency easily, and is a natural fit for async, event-driven updates.
- **Is the workload steady or bursty?** Sustained, predictable, latency-sensitive traffic favors always-on servers; spiky, infrequent, or background work is where serverless functions clear their cold-start tax and pay off.
- **Does this component's data and behavior form a real, separate boundary**, or is it just organizationally convenient to draw a line here? A genuine bounded context (payments, search, recommendations) is a much better microservice candidate than an arbitrary split.

None of these questions have a universally correct answer — they're the questions a strong system design discussion (interview or otherwise) makes explicit, rather than silently assuming one architecture is always right. The strongest answers in this space justify the choice against the system's actual constraints, and are equally comfortable saying "a monolith is the right call here" as they are proposing microservices — architectural sophistication is knowing which tool fits, not defaulting to the most complex one available.

> **Key idea:** Pub/sub decouples publishers from subscribers through named topics, letting new consumers be added or removed without ever touching the publisher, and enabling one event to fan out to many independent consumers at once; choosing an architectural style overall — monolith vs. microservices, synchronous vs. event-driven, always-on vs. serverless — should be driven by concrete answers about team size, actual current scale, consistency needs, and workload shape, not by defaulting to whichever style sounds most sophisticated.`,
    },
  ],
}
