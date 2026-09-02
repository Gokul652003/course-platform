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
    {
      name: "Consensus Algorithms & Distributed Tracing",
      minutes: 10,
      intro: "Understand conceptually what Paxos and Raft actually achieve and why leader election matters, then see how distributed tracing follows a single request across dozens of services.",
      content: `## Why distributed systems need consensus at all

The moment you run more than one copy of something — multiple database replicas, multiple nodes in a cluster — you hit a fundamental problem: how do multiple independent machines, which can each fail or become unreachable at any moment, agree on a single, consistent value or ordering of events? Naively, you might have each node just decide independently, but then a network partition or a crash can leave different nodes believing different, contradictory things are true — two nodes both thinking they're the primary database, for instance, and both accepting writes. **Consensus algorithms** exist to solve exactly this: getting a group of nodes to agree on one value, even when some nodes crash or messages are delayed or lost, in a way that's provably safe (nodes never agree on two different values) and provably live (the system does eventually make progress, rather than deadlocking forever).

## What Paxos and Raft actually achieve (conceptually)

You don't need to implement Paxos or Raft by hand to reason about system design — what matters is understanding the shape of the problem they solve and the guarantee they provide:

- **Paxos** is the foundational consensus algorithm (and notoriously difficult to reason about in its full form). Conceptually, it works through rounds of proposals and majority-acceptance voting: a node proposes a value, and that value is only considered "chosen" once a *majority* of nodes have accepted it. Requiring a majority (not all nodes) is the key trick — it means the system can keep making progress even if some minority of nodes are down or unreachable, while still guaranteeing that two different majorities can never both have accepted two different values (since any two majorities out of a group must overlap by at least one node).
- **Raft** was designed later specifically to be more understandable than Paxos while providing the same core guarantee, by making one thing explicit that Paxos leaves implicit: **leader election**. Raft nodes elect a single leader (via majority vote, with randomized election timeouts to avoid split votes) that becomes solely responsible for accepting client writes and replicating them, in order, to the other nodes (followers). If the leader crashes, the remaining nodes detect it (via a missed heartbeat) and elect a new one.

## Why leader election specifically matters

Having a single leader responsible for ordering all writes sidesteps a much harder problem: if every node could independently accept writes, you'd need to resolve conflicting, concurrently-accepted writes after the fact — genuinely difficult in general. With one leader as the single source of truth for ordering, every write goes through one place, gets a definite order, and is then replicated to followers in that order. The hard part becomes: what happens when the leader itself fails? This is precisely what leader election solves — the remaining nodes need to agree (via consensus themselves) on who the new leader is, without accidentally ending up with two nodes simultaneously believing they're the leader (a dangerous state called "split brain," which is exactly what the majority-vote requirement is designed to prevent — you cannot get two different majorities to elect two different leaders at the same time).

This is not an abstract concern — it's the mechanism underneath real infrastructure you've likely already used: etcd and Consul (service discovery and configuration stores), ZooKeeper (coordination for older Kafka/Hadoop deployments), and the leader-election logic inside many managed database replication systems all run a Raft-family or Paxos-family algorithm under the hood specifically so that "who is currently the authoritative primary" is a question the cluster can answer safely even as individual nodes fail.

## Distributed tracing: following one request across many services

Once a request fans out across a dozen microservices, a question that used to be trivial — "why was this request slow, and where did it fail?" — becomes genuinely hard, because the relevant logs are now scattered across a dozen separate services with no inherent link between them. **Distributed tracing** solves this by attaching a single **trace ID** to a request at the moment it enters the system, and propagating that same trace ID through every downstream service call the request triggers.

\`\`\`text
trace_id: abc123

[API Gateway]  span: 5ms   ─┐
   └─> [Auth Service]  span: 12ms  ─┤
   └─> [Order Service]  span: 80ms ─┼─ all tagged trace_id=abc123
          └─> [Inventory Service]  span: 40ms ─┤
          └─> [Payment Service]  span: 30ms ──┘

Total request latency: ~127ms, and you can see exactly which service ate the time.
\`\`\`

Each individual unit of work within that trace (one service's handling of its part of the request) is recorded as a **span**, tagged with the shared trace ID plus its own start time, duration, and metadata. Tools like Jaeger and Zipkin collect these spans from every service and reassemble them into a single timeline for the whole request, letting you visually see exactly which service in the chain was slow, or exactly which one threw the error that caused the overall request to fail — instead of manually cross-referencing timestamps across a dozen separate log files and hoping they line up.

Distributed tracing stops being optional past a certain scale: with two or three services, reading logs by hand is annoying but survivable; past a handful of services calling each other, it becomes genuinely impossible to reconstruct what happened to a specific failed request without a shared trace ID tying the pieces together.

> **Key idea:** Consensus algorithms like Paxos and Raft let a cluster of unreliable nodes safely agree on a single value by requiring majority acceptance (so any two accepted values must have overlapping voters and can never conflict); Raft makes this concrete through explicit leader election, so all writes get a definite order through one leader at a time, with the same majority-vote mechanism preventing two leaders from existing simultaneously; and distributed tracing solves the parallel observability problem — reconstructing what happened to one request across many services — by tagging every downstream call with a shared trace ID and stitching the resulting spans back into one timeline.`,
    },
  ],
}
