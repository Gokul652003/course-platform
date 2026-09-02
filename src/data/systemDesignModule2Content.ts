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
  ],
}
