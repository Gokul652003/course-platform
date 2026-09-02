import type { Module } from "../types"

export const systemDesignModule10: Module = {
  id: 10,
  title: "Event-Driven Architecture & Distributed Systems",
  status: "upcoming",
  lessons: [
    {
      name: "Event Sourcing, Event Streaming & Event-Driven APIs",
      minutes: 11,
      intro: "Learn how storing a sequence of events instead of current state changes what a database can tell you, and where event-driven APIs fit next to ordinary request/response calls.",
      content: `## Storing what happened, not just what's true now

Most applications store *current state*: a \`bank_accounts\` table has a \`balance\` column, and every deposit or withdrawal overwrites it in place. **Event sourcing** takes a different approach entirely: instead of storing current state, you store the full, ordered sequence of events that *led* to that state, and current state becomes something you *derive* by replaying those events, not something you store directly.

\`\`\`text
Traditional (state storage):
  accounts table: { id: 42, balance: 350 }
  (the deposits and withdrawals that got you to 350 are gone)

Event sourcing:
  event log for account 42:
    1. AccountOpened      { balance: 0 }
    2. Deposited          { amount: 500 }
    3. Withdrawn          { amount: 200 }
    4. Deposited          { amount: 50 }
  current balance = replay all events = 0 + 500 - 200 + 50 = 350
\`\`\`

Both end up with the same balance, but event sourcing keeps something the traditional model throws away: the complete history of *how* you got there. That has real, practical benefits:

- **A perfect audit trail.** For domains like banking, order processing, or inventory, being able to answer "how did this value end up wrong" by replaying the exact sequence of events is often a regulatory requirement, not just a nice-to-have.
- **Time travel.** You can reconstruct state *as of any point in the past* by replaying events only up to that point — genuinely difficult to do with a table that only ever holds "now."
- **New views for free.** If a new feature needs a summary that was never explicitly stored, you can often derive it by replaying the existing event log differently, without needing historical data you never thought to capture.

The cost is real complexity: replaying a long event log to get current state is slow, so real systems add periodic **snapshots** (a cached "current state as of event #10,000" checkpoint) so a read doesn't have to replay from the very beginning every time, and querying "current state" now requires a projection step instead of a plain \`SELECT\`.

## Event sourcing vs. event streaming: a pattern vs. a pipe

These two terms get conflated constantly, but they're answering different questions:

| | Event sourcing | Event streaming |
|---|---|---|
| What it is | A data modeling *pattern* — state is derived from a log of events | An infrastructure *mechanism* — a continuous, ordered flow of events through a log (e.g. Kafka) that services publish to and subscribe from |
| Scope | Usually the persistence strategy for one service/aggregate's data | Often the communication backbone between many services |
| Question it answers | "How do I store and reconstruct this entity's state?" | "How do services find out things happened, in order, without polling each other?" |

In practice they overlap heavily and are frequently used together: a service built around event sourcing naturally has an event log already, and publishing those same events onto a streaming platform is a natural way to let other services react to them — but you can absolutely have one without the other. A service can stream events onto Kafka purely for other services to consume, while still storing its own current state conventionally in a normal table; that's event streaming without event sourcing.

## Event-driven APIs vs. request-driven APIs

Most APIs you've used are **request-driven (synchronous)**: the client sends a request and blocks (or at least waits) for an immediate response — call \`POST /orders\`, get back \`201 Created\` with the order. An **event-driven API** flips this: instead of directly calling another service and waiting, a service publishes an event ("OrderPlaced") to a broker, and any number of other services subscribe and react to it independently, with no direct coupling between publisher and subscriber and no synchronous response expected.

| | Request-driven (synchronous) | Event-driven (asynchronous) |
|---|---|---|
| Coupling | Caller must know the callee's address/API directly | Publisher doesn't know or care who's listening |
| Response | Immediate, in the same call | None — or a separate follow-up event later |
| Failure mode | Caller sees the failure directly, right away | Caller doesn't inherently know if a subscriber failed (next lesson covers handling this) |
| Good fit | "I need this answer right now to continue" (checking inventory before confirming a purchase) | "Several things need to happen eventually and independently" (send a confirmation email, update analytics, notify a warehouse system, after an order is placed) |

A microservices architecture almost never picks one exclusively — a checkout flow typically makes a synchronous call to reserve inventory (it genuinely needs that answer before proceeding) while emitting an asynchronous \`OrderPlaced\` event afterward for every downstream concern (emailing, analytics, fulfillment) that doesn't need to block the customer's checkout on its own completion.

> **Key idea:** Event sourcing stores the sequence of events that produced current state instead of the state itself, trading query simplicity for a perfect audit trail and time-travel queries; event streaming is the separate infrastructure mechanism for moving a continuous, ordered flow of events between services; and event-driven APIs decouple services entirely by having them react to published events instead of calling each other directly, which is why real systems mix synchronous calls (for answers you need right now) with asynchronous events (for everything that can happen independently, afterward).`,
    },
  ],
}
