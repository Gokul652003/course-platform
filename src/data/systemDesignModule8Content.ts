import type { Module } from "../types"

export const systemDesignModule8: Module = {
  id: 8,
  title: "API Gateway, Messaging & Rate Limiting",
  status: "upcoming",
  lessons: [
    {
      name: "API Gateway — Role & Responsibilities",
      minutes: 10,
      intro: "See what an API gateway does in a microservices architecture, and why funneling clients through one entry point beats calling services directly.",
      content: `## The problem of many services, many clients

A microservices architecture (Module 2) can easily end up with dozens of independently deployed services — an orders service, a users service, a payments service, an inventory service. If every client (a web app, a mobile app, a third-party integrator) had to know the network address of every single service and call each one directly, a few problems show up immediately:

- Clients need to know internal service topology — which is meant to be an implementation detail, not a public contract.
- Every service has to reimplement cross-cutting concerns (auth, rate limiting, logging) independently, or those concerns simply don't happen consistently.
- A UI screen that needs data from five different services has to make five separate round trips from the client, over a slower public network, instead of one.
- Changing internal service boundaries (splitting one service into two, merging two into one) breaks every client that hard-codes the old topology.

An **API gateway** is a single entry point that sits between clients and the collection of backend services, and takes on exactly these cross-cutting concerns so individual services don't have to.

\`\`\`text
                          ┌──────────────┐
Web client   ───┐         │              │──► Orders service
Mobile client ───┼───────►│  API Gateway │──► Users service
3rd-party API ───┘         │              │──► Payments service
                          └──────────────┘──► Inventory service
\`\`\`

## Core responsibilities

An API gateway typically owns a bundle of concerns that would otherwise be duplicated across every service:

- **Routing** — inspecting the incoming request (path, host, headers) and forwarding it to the correct backend service, without the client needing to know that service's actual address.
- **Authentication & authorization** — verifying who the caller is (validating a token, checking an API key) once, at the edge, instead of every downstream service reimplementing the same check.
- **Request/response transformation** — reshaping a request or response between what the client expects and what the backend actually returns (renaming fields, converting formats, stripping internal-only data before it reaches the client).
- **Aggregation** — combining calls to multiple backend services into a single response, so a client that needs "order details plus the buyer's profile plus shipping status" makes one request to the gateway instead of three separate round trips itself.
- **TLS termination** — handling the HTTPS handshake and decryption once at the gateway, so internal traffic between the gateway and backend services can run over a simpler, unencrypted (or separately-secured) internal network.
- **Rate limiting & throttling** — enforcing per-client or per-API usage limits centrally (the full mechanics are the subject of the last lesson in this module).
- **Observability** — a natural single point to log every request, collect latency metrics, and trace requests as they enter the system, since all external traffic passes through it.

## Why centralize this instead of duplicating it per service

The alternative to a gateway isn't "no cross-cutting concerns" — it's the *same* concerns, reimplemented independently (and inconsistently) inside every service. Centralizing at the gateway means:

- **One place to fix a security bug** — if a token-validation bug is found, it's patched once at the gateway, not audited across every service that might have its own copy of similar logic.
- **Consistent behavior** — every client experiences the same rate limits, the same auth error format, the same request-ID header, regardless of which backend service ultimately handled the request.
- **Backend services stay focused** — an orders service can focus entirely on order logic, trusting that a request reaching it has already been authenticated and rate-limited by the layer in front.

The trade-off is that the gateway becomes a critical, shared piece of infrastructure — if it goes down, *everything* behind it becomes unreachable from outside, and if it's under-provisioned, it becomes the bottleneck for the whole system regardless of how well individual services scale. Because of this, gateways are typically deployed as a horizontally scaled, load-balanced tier in their own right (tying back to Module 6), not a single box.

## Gateway vs load balancer: not the same layer

It's easy to conflate the two since both sit "in front" of backend services, but they solve different problems:

| | Load balancer | API gateway |
|---|---|---|
| Primary job | Distribute traffic across replicas of *one* service | Route and manage traffic across *many different* services |
| Operates at | Typically transport/connection level (L4) or basic HTTP (L7) | Application level — understands API semantics, paths, payloads |
| Knows about business logic | No | Often yes — auth rules, per-API limits, request shaping |

In practice, a real deployment usually has both: a load balancer distributes incoming traffic across multiple API gateway instances, and the gateway then routes each request to the correct backend service, which itself sits behind its own load balancer across its own replicas.

## A concrete example

A mobile app screen showing "your order" might need: the order itself, the current user's shipping address, and a live delivery estimate — three different backend services. Without a gateway, the mobile app makes three separate calls, each needing its own auth token validated independently, each over the (often slower, less reliable) public mobile network. With a gateway offering an aggregation endpoint, the mobile app makes **one** call to \`/api/order-summary/{id}\`, and the gateway itself fans that out to the three backend services (over a fast internal network), combines the results, and returns one response — trading three slow round trips for one.

> **Key idea:** An API gateway is the single entry point between external clients and a system's backend services, centralizing routing, authentication, request/response transformation, aggregation, TLS termination, rate limiting, and observability so individual services don't each have to reimplement them — at the cost of the gateway becoming shared, critical infrastructure that itself needs to be scaled and made highly available.`,
    },
    {
      name: "Message Queues — Async Communication at Scale",
      minutes: 11,
      intro: "Learn why asynchronous messaging decouples producers from consumers, the core delivery guarantees, and walk through a concrete order-processing example.",
      content: `## Synchronous calls couple you to the slowest link

When service A calls service B directly (a synchronous HTTP call) and waits for a response, A's own success and latency now depend entirely on B being up, fast, and able to keep up with A's request rate. If B is temporarily slow or down, A is stuck waiting — or failing — right along with it. Chain enough services together this way and a slowdown anywhere in the chain propagates backward through every caller.

A **message queue** breaks this coupling by inserting a durable buffer between the producer of work and the consumer that processes it. Instead of A calling B directly and waiting, A drops a message describing the work onto a queue and moves on immediately; B (running independently, at its own pace) picks messages off the queue and processes them whenever it's ready.

\`\`\`text
Synchronous:  Producer ──call, wait──► Consumer
                (producer blocked until consumer responds)

Asynchronous: Producer ──publish──► [ Queue ] ──consume──► Consumer
                (producer moves on immediately; queue absorbs the gap)
\`\`\`

## What decoupling actually buys you

- **Producers and consumers can fail or scale independently.** If the consumer is temporarily down, messages simply accumulate in the queue instead of failing outright — they get processed once the consumer recovers. If the producer suddenly sends ten times its normal volume, the queue absorbs the burst instead of overwhelming the consumer directly.
- **Traffic spikes get smoothed out.** A consumer can process messages at a steady, sustainable rate even while producers publish in unpredictable bursts — the queue acts as a shock absorber between bursty input and steady processing capacity.
- **Retry semantics become natural.** If processing a message fails, it can be put back on the queue (or a retry queue) and attempted again later, without the producer needing to know or care that a retry even happened.
- **New consumers can be added without touching producers.** A second, entirely independent consumer can start reading from the same queue (or a copy of the same stream, depending on the messaging model) to do something new with the same events, with zero changes to whatever is producing them.

## Core vocabulary

- **Producer** — anything that publishes a message onto the queue.
- **Consumer** — anything that reads and processes messages from the queue.
- **Queue / Topic** — the durable channel messages sit in between being produced and consumed. "Queue" typically implies point-to-point (one message, one consumer); "topic" typically implies publish/subscribe (one message, potentially many independent subscribers — see the pub/sub pattern from Module 2).
- **Broker** — the actual system running the queue infrastructure (RabbitMQ, Kafka, AWS SQS, Google Pub/Sub).
- **Dead-letter queue (DLQ)** — a separate holding queue where messages get routed after repeatedly failing to process, so a single poison message can't block the whole queue forever while still preserving it for later investigation instead of silently dropping it.

## Delivery guarantees

Not all queues guarantee the same thing about how many times a message is delivered, and the difference has real consequences for how consumers must be written:

| Guarantee | Meaning | Consumer implication |
|---|---|---|
| **At-most-once** | A message is delivered zero or one times — it may be lost, but never duplicated | Simplest to implement, but any failure between send and process silently loses the message; rarely acceptable for anything that matters |
| **At-least-once** | A message is delivered one or more times — it will never be silently lost, but can be redelivered | The overwhelmingly common default; consumers **must** be written to be idempotent (processing the same message twice produces the same result as once) |
| **Exactly-once** | A message is delivered and processed exactly one time, no more, no less | The hardest and most expensive guarantee to provide correctly across a distributed system; often achieved in practice as "at-least-once delivery + idempotent processing," which behaves like exactly-once from the consumer's perspective without needing true exactly-once infrastructure |

The practical takeaway most systems converge on: assume at-least-once delivery and design consumers to be **idempotent** — processing the same message twice (e.g. because of a retry after an ack was lost) should never double-charge a customer or double-ship an order. This is usually done by tracking a unique message/operation ID and skipping work you've already recorded as done.

## A concrete example: order processing

\`\`\`text
1. Checkout service receives "place order" request, saves the order as
   PENDING, and publishes an "OrderPlaced" message to a queue. Responds
   to the user immediately — "order received" — without waiting for
   fulfillment.

2. Payment consumer reads "OrderPlaced", charges the customer, and
   publishes "PaymentCompleted" (or "PaymentFailed").

3. Inventory consumer reads "PaymentCompleted", reserves stock, and
   publishes "InventoryReserved".

4. Shipping consumer reads "InventoryReserved" and kicks off fulfillment.

5. If any step fails, that consumer publishes a failure event instead,
   which a separate compensation consumer picks up to roll back prior
   steps (e.g. refund the payment) and notify the customer.
\`\`\`

Notice what this buys the checkout service: it doesn't need to know anything about payments, inventory, or shipping, doesn't block the user waiting for all four steps to finish synchronously, and each downstream stage can be scaled, deployed, and even fail independently without taking the others down with it. This staged, event-driven pipeline pattern reappears constantly in real systems and is the practical foundation for the deeper event-driven architecture material in Module 10.

> **Key idea:** Message queues decouple producers from consumers by inserting a durable buffer between them, letting each side fail and scale independently while the queue smooths out bursty traffic and enables retries; most real systems provide at-least-once delivery, which pushes the responsibility for correctness onto consumers being written to be idempotent.`,
    },
  ],
}
