import type { Module } from "../types"

export const systemDesignModule3: Module = {
  id: 3,
  title: "Scalability",
  status: "upcoming",
  lessons: [
    {
      name: "Horizontal vs Vertical Scaling",
      minutes: 10,
      intro: "Compare growing a system by making one machine bigger versus adding more machines, and see exactly where each approach starts to hurt.",
      content: `## Two ways to handle more load

Every system eventually hits a point where the current hardware can't keep up with demand — more users, more requests, more data. There are only two fundamental ways to respond:

- **Vertical scaling (scaling up)** — give the existing machine more resources: a faster CPU, more RAM, a bigger disk, more network bandwidth. The application code usually doesn't change at all; you're just running the same single instance on beefier hardware.
- **Horizontal scaling (scaling out)** — add more machines running the same application, and spread the load across all of them. A single request now lands on one of many interchangeable instances instead of the one instance that used to handle everything.

Both get you more capacity. They get it in very different ways, with very different failure modes.

## Vertical scaling: simple, but with a hard ceiling

Vertical scaling is appealing because it requires almost no architectural change — upgrade the instance type, restart, done. No load balancer, no data partitioning, no distributed consistency to reason about. For a while, this is genuinely the right call: it's cheap in engineering time, and cloud providers make resizing a running instance close to a one-click operation.

The problem is that it doesn't scale linearly, and it has a ceiling:

\`\`\`text
2 vCPU / 8 GB  → handles ~500 req/s   ($50/mo)
4 vCPU / 16 GB → handles ~900 req/s   ($100/mo)
8 vCPU / 32 GB → handles ~1500 req/s  ($220/mo)
16 vCPU / 64 GB → handles ~2200 req/s ($450/mo)
32 vCPU / 128 GB → handles ~2800 req/s ($900/mo)
\`\`\`

Notice the pattern: doubling the hardware does not double the throughput. Contention inside a single machine — memory bus bandwidth, lock contention between threads, a single database's write path — means returns diminish as the box gets bigger. Worse, at some point there simply is no bigger machine to rent; every cloud provider has a largest available instance type, and it's finite.

There's also a structural risk that has nothing to do with performance: a single vertically-scaled instance is a **single point of failure**. If that one machine crashes, restarts for a kernel patch, or the availability zone it lives in has an outage, the entire system goes down with it — there's nothing else to fail over to.

## Horizontal scaling: no ceiling, but real complexity

Horizontal scaling sidesteps both problems. Instead of one machine getting bigger, you run N identical instances behind a load balancer (covered in depth in Module 6), and N can, in principle, keep growing — 10 instances, 100, 1,000. There's no single machine whose physical limits cap the system, and losing any one instance just means the load balancer routes around it while the rest keep serving traffic.

That flexibility isn't free. Horizontal scaling only works cleanly if the thing being scaled is **stateless** — if any instance can handle any request, because no instance is holding onto data that only it has. The moment an instance keeps something in local memory (a user's session, an in-progress upload, a WebSocket connection) that a later request from the same user depends on, you've broken the "any instance can serve any request" assumption, and you need sticky sessions, an external session store, or a redesign to keep it working. Horizontal scaling also pushes complexity outward: you now need a load balancer, health checks to detect a dead instance, a deployment strategy that can roll out to many instances safely, and — if the state lives in a database rather than the application layer — a database that itself can handle more concurrent connections and, eventually, more data than one instance can hold (Module 4 covers replication and sharding for exactly this).

## Putting them side by side

| | Vertical scaling | Horizontal scaling |
|---|---|---|
| How | Bigger machine | More machines |
| Code changes needed | Usually none | Requires statelessness |
| Ceiling | Yes — largest available instance | No practical ceiling |
| Single point of failure | Yes | No, if done correctly |
| Operational complexity | Low | Higher (LB, health checks, coordination) |
| Cost curve | Worsens per unit of capacity as size grows | Roughly linear per instance added |

In practice, real systems use both, at different points. It's extremely common to vertically scale a database up to a comfortable size (because horizontally scaling a database is genuinely hard — see Module 4) while horizontally scaling the stateless application tier in front of it, which is comparatively easy. Reaching for horizontal scaling everywhere from day one is often premature; reaching for "just get a bigger box" as the permanent answer eventually stops working no matter the budget.

> **Key idea:** Vertical scaling (a bigger machine) is simple but has diminishing returns, a hard hardware ceiling, and remains a single point of failure; horizontal scaling (more machines) has no practical ceiling and survives individual failures, but demands statelessness and adds real operational complexity — most real systems combine both, scaling the database up and the application tier out.`,
    },
    {
      name: "Designing Highly Scalable Systems & Common Bottlenecks",
      minutes: 11,
      intro: "Learn the handful of design principles that let a system absorb growing load, and walk through the bottlenecks that most often break systems that skip them.",
      content: `## The principles behind scalable design

Scalable systems don't happen by accident — they're built on a small set of recurring principles that show up in almost every system that handles serious load:

- **Statelessness in the application tier.** As covered in the previous lesson, a stateless service can be scaled horizontally by simply adding more instances, because any instance can serve any request. Anything that must be remembered between requests belongs in a shared store (a database, a cache, an external session store) — never in an individual instance's memory.
- **Caching aggressively.** The cheapest request is the one that never reaches the database. Caching (its own deep topic in Module 7) absorbs repeated reads at every layer — in the browser, at a CDN edge, in an in-memory cache in front of the database — so the slowest, most contended part of the system sees only a fraction of the actual traffic.
- **Asynchronous processing.** Not every piece of work needs to happen inside the request/response cycle. Sending a confirmation email, resizing an uploaded image, or updating a recommendation model can be handed off to a background worker via a message queue (Module 8), so the user-facing request returns fast and the expensive work happens out of band, at whatever pace the backend can sustain.
- **Scaling the data layer deliberately.** Application servers are usually the easy part to scale; the database is usually the hard part, because it holds state that has to stay consistent. Read replicas, sharding, and denormalization (Module 4) are the tools for this, and they're applied only once caching and async processing have already cut down how much load actually reaches the database.
- **Load balancing across all of the above.** None of the horizontal scaling above matters if traffic isn't actually spread evenly across the instances that exist — an unbalanced distribution just means some instances are overloaded while others sit idle. Module 6 covers this in depth.

These principles work together, not in isolation — a system that's stateless but has no caching still hammers its database on every request; a system with great caching but a synchronous, chatty internal architecture still falls over under load for other reasons. Scalability is a property of the whole design, not any single component.

## The bottlenecks that actually take systems down

Knowing the principles above matters less than recognizing the failure patterns before they happen. A handful of bottlenecks account for the overwhelming majority of "the system fell over" incidents:

**A single database instance taking all reads and writes.** Every request, no matter which application server handles it, ends up hitting the same database. Once that database's connection pool, CPU, or disk I/O saturates, the whole system slows down together — even parts of the app that don't logically depend on each other. *Mitigation:* read replicas to spread out reads, caching to avoid hitting the database at all for hot data, and eventually sharding to spread writes across multiple database instances.

**Synchronous chains of calls.** Service A calls B, which calls C, which calls D, all within a single request, all waiting on each other. The user-facing latency is now the *sum* of every hop, and if any one service in the chain is slow or down, the whole chain is slow or down — a single misbehaving downstream dependency can take out everything upstream of it. *Mitigation:* move non-critical work off the synchronous path with queues, add timeouts and circuit breakers so a stuck dependency doesn't stall its callers indefinitely, and parallelize independent calls instead of chaining them.

**Chatty APIs.** A client needs data from several resources, and instead of one well-shaped endpoint it makes a dozen small round trips to assemble what it needs — each one paying full network latency. This is especially punishing on mobile networks or between services in different regions. *Mitigation:* design coarser-grained endpoints that return what a screen actually needs in one call, or introduce an aggregation layer (an API gateway or a BFF — backend-for-frontend) that does the fan-out server-side, where latency between services is far lower than latency to the client.

**Hot partitions and hot keys.** Data is spread across multiple shards or cache nodes to distribute load, but one key — a viral post, a celebrity's profile, a popular product on sale day — gets disproportionately more traffic than every other key. The node holding that one key gets overwhelmed while its siblings sit comfortably under load, even though the *system* looks fine in aggregate. *Mitigation:* key design that spreads hot data further (adding a random suffix and fanning reads back in, for instance), or a dedicated cache layer in front of the hot key specifically.

**Unbounded queues.** A queue is meant to absorb bursts, but if producers can add work faster than consumers can drain it indefinitely, the queue just grows without bound — memory pressure builds, and by the time anyone notices, there's an enormous backlog of stale work to process, or the queue's storage itself falls over. *Mitigation:* backpressure (slow down or reject producers once the queue is deep), autoscaling the number of consumers, and monitoring queue depth as a first-class metric, not an afterthought.

> **Key idea:** Scalable systems are built from statelessness, caching, async processing, deliberate data-layer scaling, and load balancing working together — and most real-world outages trace back to one of a short list of recognizable bottlenecks: an overloaded single database, synchronous call chains, chatty APIs, hot keys, or queues with no backpressure.`,
    },
    {
      name: "Choosing the Right Scalability Approach",
      minutes: 10,
      intro: "Work through three different systems under stress and reason about which scalability levers actually apply to each — because \"scale horizontally\" isn't always the right first move.",
      content: `## Scalability is not one-size-fits-all

It's tempting to treat "add more servers" as the universal answer to a system under load. In practice, the right fix depends entirely on *where* the pressure actually is — read-heavy systems, write-heavy systems, and bursty systems all fail differently, and each responds best to a different combination of the levers introduced in the previous lessons: read replicas, caching, sharding, queueing, horizontal scaling, and CDNs. Reasoning through three contrasting systems makes this concrete.

## Case 1: A read-heavy social feed

**Symptom:** A social app's home feed — read constantly, written to relatively rarely (a post is written once, then read by thousands of followers). The database is pegged on CPU, and it's almost entirely serving \`SELECT\` queries.

**What doesn't help much:** Sharding the database by user ID. Since the bottleneck is read volume, not write volume or data size, sharding adds real complexity (cross-shard queries to assemble a feed spanning many followed users) without addressing the actual problem.

**What helps:**
- **Caching the feed itself**, not just individual posts — a pre-computed feed per user, refreshed on a schedule or on write, turns an expensive fan-out query into a cache hit.
- **Read replicas** so read traffic is spread across several database copies instead of hammering the single writer.
- **A CDN** for any static or semi-static content embedded in the feed (images, videos), so the origin servers never see that traffic at all.

The pattern: read-heavy systems scale by multiplying read capacity (replicas, caches, CDN) far more than by partitioning write capacity.

## Case 2: A write-heavy IoT ingestion pipeline

**Symptom:** Millions of sensors each sending a small reading every few seconds. The system is almost entirely writes, arriving continuously, and needs to durably store all of them without losing data.

**What doesn't help much:** Read replicas — there's barely any read traffic to spread out, so adding replicas does nothing for the actual bottleneck. Caching also doesn't help; there's nothing to cache when nobody's re-reading the same data repeatedly.

**What helps:**
- **A message queue in front of the database** — sensors write to a queue (which can absorb huge burst-write throughput cheaply) instead of directly to the database, and a pool of consumers drains the queue into storage at a sustainable, controlled rate. This decouples "how fast data arrives" from "how fast the database can durably write it."
- **Sharding by a key that spreads writes evenly** — sharding by sensor ID (or a hash of it) so no single shard absorbs a disproportionate share of the write volume, avoiding the hot-partition problem from the previous lesson.
- **Horizontal scaling of the consumer/ingestion tier**, since consuming from the queue is naturally stateless and parallelizable.

The pattern: write-heavy systems scale by decoupling arrival rate from processing rate (queueing) and by partitioning write volume across many writers (sharding) — caching and read replicas are close to irrelevant here.

## Case 3: A bursty flash-sale ticket system

**Symptom:** Normal traffic is modest, but at a scheduled sale-start time, demand spikes 500x for a few minutes as everyone tries to buy a small number of tickets at once, then drops back to near zero.

**What doesn't help much:** Permanently provisioning enough horizontally-scaled capacity to handle peak load — it would sit almost entirely idle 99% of the time, at significant ongoing cost, just to cover a few minutes a day.

**What helps:**
- **Autoscaling** the stateless application tier aggressively right before the known burst, and back down after — horizontal scaling that tracks demand rather than being fixed.
- **A queue (or a virtual waiting room) absorbing the burst** at the front door, admitting requests to the actual purchase flow at a rate the backend can sustain, rather than letting every request hit the database simultaneously.
- **Rate limiting** (Module 8) to prevent any single client — or a scripted bot — from consuming a disproportionate share of capacity during the scramble.
- Careful handling of the one genuinely hard part — **not overselling a scarce resource** — usually via a database-level constraint or a distributed lock on each ticket, since this is a correctness problem that no amount of horizontal scaling solves by itself.

The pattern: bursty systems scale by absorbing and smoothing the burst (queueing, autoscaling, rate limiting) rather than by permanently over-provisioning for a peak that's rare, and they need explicit attention to correctness under contention, which raw capacity doesn't fix.

## The actual skill

Across all three cases, the lever that helps is the one that matches where the pressure actually is: multiply reads for read-heavy systems, decouple and partition writes for write-heavy systems, and absorb-and-smooth for bursty systems. "Just add more servers" only reliably helps the stateless, horizontally-scalable tiers — it does nothing for an overloaded single database, does nothing for a write bottleneck at the storage layer, and does nothing for a correctness problem like overselling. Diagnosing *where* the bottleneck actually lives always comes before picking the tool to fix it.

> **Key idea:** The right scalability lever depends on where the pressure actually is — read-heavy systems scale via replicas, caching, and CDNs; write-heavy systems scale via queueing and write-sharding; bursty systems scale via autoscaling, admission control, and explicit correctness guarantees — and reflexively reaching for horizontal scaling everywhere skips the more important step of diagnosing the actual bottleneck first.`,
    },
  ],
}
