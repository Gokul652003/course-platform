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
    {
      name: "Error Handling & Failure Recovery in Event-Driven Systems",
      minutes: 10,
      intro: "See why async failure handling can't just \"return an error,\" and learn the four patterns — dead-letter queues, retries with backoff, idempotent consumers, and the outbox pattern — that real systems use instead.",
      content: `## Why async errors are structurally harder than sync errors

In a synchronous, request-driven call, error handling is straightforward: the callee throws, the caller's \`try/catch\` sees it immediately, and can decide what to do — retry, show an error, roll back. In an event-driven system, that direct line disappears. When a service publishes an event and three other services consume it independently, there's no single caller waiting for a response to hand a failure back to. If one of those three consumers crashes while processing the event, *nobody* automatically knows — the publisher already considers its job done the moment it published, and the other two consumers have no idea a sibling failed. This structural gap is what every pattern in this lesson exists to close.

## Retry with backoff: assume failures are often transient

The first line of defense is simply retrying a failed event handler — but retrying immediately, in a tight loop, is a bad idea: if the failure was caused by a downstream service being overloaded, hammering it with immediate retries makes the overload worse. **Exponential backoff** retries with a growing delay between attempts (1s, 2s, 4s, 8s...), giving a struggling downstream dependency room to recover instead of piling on:

\`\`\`text
Attempt 1 fails --> wait 1s  --> Attempt 2 fails --> wait 2s
--> Attempt 3 fails --> wait 4s --> Attempt 4 succeeds
\`\`\`

Retries handle *transient* failures well (a momentary network blip, a downstream service that was briefly unavailable) but do nothing for a failure that will keep failing no matter how many times it's retried — a malformed message, a bug that always throws on this specific input. That's what the next pattern is for.

## Dead-letter queues: quarantine what keeps failing

A **dead-letter queue (DLQ)** is a separate queue that a message gets moved to after it has failed processing some maximum number of times. Instead of retrying forever (blocking the main queue behind a message that will never succeed) or silently dropping it (losing data and hiding the failure), the message is set aside where it won't hold up everything behind it, and an engineer or an automated alert can inspect *why* it kept failing.

\`\`\`text
Main queue: [msg1] [msg2] [msg3 - fails, retries 5x, still fails] [msg4] [msg5]
                                        |
                                        v
                              Dead-letter queue: [msg3]
Main queue keeps moving: [msg4] [msg5] ...  (not blocked by msg3 anymore)
\`\`\`

DLQs are what turn "an unhandled edge case silently corrupts state forever" into "an unhandled edge case is visible, isolated, and reprocessable once fixed."

## Idempotent consumers: surviving duplicate delivery

Retrying introduces a new problem: what if the original attempt actually *did* succeed, but the acknowledgment back to the queue was lost, so the system retries anyway? Now the consumer processes the same event twice. Most real message brokers offer only **at-least-once delivery** — they guarantee a message won't be lost, but explicitly do *not* guarantee it won't be delivered more than once — which makes handling duplicates the consumer's job, not the broker's.

The fix is making consumers **idempotent**: processing the same event twice must produce the same end result as processing it once. A common technique is tracking processed event IDs and skipping any event whose ID has already been seen:

\`\`\`text
processed_ids table: { event_id: "evt_9f3a" }

on receiving event evt_9f3a:
  if evt_9f3a in processed_ids: skip (already handled)
  else: process it, then record evt_9f3a in processed_ids
\`\`\`

Without idempotency, a duplicate "charge customer $50" event genuinely charges them twice — this isn't a hypothetical edge case, it's the expected behavior of any at-least-once system unless the consumer explicitly guards against it.

## The outbox pattern: keeping a DB write and an event publish atomic

A subtle failure mode: a service updates its database *and* publishes an event about that update as two separate operations. If it crashes between the two, you end up with a database change that no event was ever published for (or the reverse) — permanently inconsistent state that's very hard to detect after the fact. The **outbox pattern** solves this by writing the event into an "outbox" table in the *same database transaction* as the actual state change, guaranteeing both succeed or both roll back together; a separate background process then reads the outbox table and reliably publishes those events to the actual message broker.

\`\`\`text
Single DB transaction:
  1. UPDATE orders SET status = 'placed' WHERE id = 42
  2. INSERT INTO outbox (event_type, payload) VALUES ('OrderPlaced', {...})
  (both committed together, or neither is — no possible partial state)

Separate background process:
  reads outbox table --> publishes to message broker --> marks row as sent
\`\`\`

## Restoring state after a failure: replay and checkpointing

When a message-driven service crashes entirely and restarts, how does it know where it left off? This is where the event-log model from the previous lesson pays off directly: since events are stored durably and in order, a recovering service can **replay** events from the log starting at the last point it's known to have successfully processed, rebuilding whatever in-memory or derived state it needs. To avoid replaying the entire log from the beginning every time, services periodically record a **checkpoint** — "I have successfully processed everything up to event #48,203" — so recovery only needs to replay events after that point, not the full history.

> **Key idea:** Async systems can't hand a failure back to a waiting caller the way sync calls can, so real event-driven systems build failure handling explicitly: retry with exponential backoff for transient failures, dead-letter queues to quarantine messages that keep failing without blocking everything behind them, idempotent consumers to survive the duplicate delivery that at-least-once brokers guarantee will happen, the outbox pattern to keep a database write and its corresponding event publish atomic, and checkpointed replay from a durable event log to recover cleanly after a crash.`,
    },
  ],
}
