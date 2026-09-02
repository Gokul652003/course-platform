import type { Module } from "../types"

export const systemDesignModule5: Module = {
  id: 5,
  title: "Availability, Consistency & Reliability",
  status: "upcoming",
  lessons: [
    {
      name: "CAP Theorem & Consistency Patterns",
      minutes: 11,
      intro: "Understand exactly what the CAP theorem does and doesn't promise, why it collapses into a CP-vs-AP choice in practice, and how different consistency patterns trade correctness for speed.",
      content: `## The three letters, precisely defined

Every distributed system that stores data eventually runs into the CAP theorem, and it's one of the most frequently *mis*-quoted ideas in system design. Stated precisely, it says: a distributed data store can provide at most two of the following three guarantees at the same time.

- **Consistency (C)** — every read receives the most recent write, or an error. Every node in the system sees the same data at the same time; there's no such thing as "node A says the balance is $50, node B says it's $40."
- **Availability (A)** — every request to a non-failing node receives a response, without guaranteeing it contains the most recent write. The system never simply refuses to answer.
- **Partition tolerance (P)** — the system continues to operate despite an arbitrary number of messages being dropped or delayed between nodes by the network. In any real distributed system, the network *will* partition eventually — a switch fails, a cable gets cut, a region loses connectivity — so this isn't optional, it's a fact of physics you have to design around.

## Why it's really CP vs AP

Because partitions are a fact of life in any system with more than one node talking over a network, partition tolerance isn't a design choice you get to opt out of — it's a constraint imposed by reality. That leaves only one real decision, and it only has to be made *during* a partition: when some nodes can't talk to others, do you sacrifice consistency or availability?

- **CP (Consistency + Partition tolerance):** when a partition happens, the system refuses to serve requests it can't guarantee are correct — nodes on the "wrong" side of the partition return errors or time out rather than risk serving stale data. Traditional relational databases configured for strong consistency, ZooKeeper, and etcd lean CP: they'd rather be unavailable than wrong.
- **AP (Availability + Partition tolerance):** when a partition happens, every node keeps answering requests using whatever data it locally has, even if that means different nodes temporarily disagree. Cassandra, DynamoDB, and CouchDB in their default configurations lean AP: they'd rather answer with possibly-stale data than refuse to answer at all.

\`\`\`text
No partition:  C and A both fully achievable — CAP doesn't even come into play.
Partition hits:  pick one.
  → CP: block/error the minority side until the partition heals
  → AP: keep answering on both sides, reconcile the divergence later
\`\`\`

A crucial nuance: CAP only forces a choice *during* a partition. The rest of the time, a well-designed system can offer both consistency and availability — the theorem describes a worst-case trade-off, not a permanent state of degradation. This is also why CAP is a poor lens for choosing a database in isolation; it only describes behavior under network failure, not overall performance, query flexibility, or operational cost. The more practical extension, PACELC, adds: even when there's **no** partition (Else), you still trade Latency for Consistency — which is why systems that are technically "CP" often still offer tunable consistency for everyday reads.

## Consistency patterns in practice

"Consistency" isn't binary — production systems pick from a spectrum of consistency patterns depending on what the data actually needs:

| Pattern | Guarantee | Typical use case |
|---|---|---|
| **Strong consistency** | Every read after a write returns that write's value, everywhere, immediately | Bank balances, inventory counts, anything where stale reads cause real harm |
| **Eventual consistency** | Reads may return stale data temporarily, but all replicas converge to the same value if writes stop | Social media likes/follower counts, DNS records, product view counts |
| **Read-your-writes consistency** | A specific user always sees their own writes immediately, even if other users see them later | A user editing their own profile and immediately viewing it back |
| **Causal consistency** | Operations that are causally related (a reply to a comment) are seen by everyone in the same order; unrelated operations can be seen in different orders | Comment threads, chat applications, collaborative documents |
| **Monotonic reads** | Once a user has seen a value, they never see an older value on a subsequent read | Avoiding the jarring experience of a page "un-updating" itself on refresh |

The pattern you pick is a direct expression of what the data is *for*. A bank ledger without strong consistency is a bug; a "likes" counter with strong consistency is usually wasted engineering effort, since a like count off by a few for a second or two costs nothing but a strongly-consistent counter under high write load costs real throughput. Most large systems don't pick one pattern globally — they pick *per data type*, applying strong consistency narrowly (payments, inventory) and eventual consistency broadly (everything else), because eventual consistency is dramatically cheaper to scale.

## Reasoning about the trade-off in an interview

When a system design problem asks you to justify a database or replication strategy, naming CAP alone earns little credit — what matters is connecting it to the actual product requirement. "This is a payments system, so a partition should make us CP: better to reject a transfer than silently lose money" is a complete, defensible argument. "This is a social feed, so we're AP: a partition should degrade to showing slightly stale posts rather than showing an error page" is equally complete. The theorem is a vocabulary for making that trade-off explicit, not a checklist to recite.

> **Key idea:** CAP forces a choice between consistency and availability only during a network partition — and since partitions are unavoidable in distributed systems, the real decision is CP vs AP, made per data type based on what's actually at stake if that data is briefly wrong.`,
    },
    {
      name: "Availability & Achieving High Availability",
      minutes: 10,
      intro: "Quantify availability with the 'nines,' translate percentages into real downtime budgets, and learn the concrete engineering techniques used to hit them.",
      content: `## Measuring availability: the "nines"

Availability is the percentage of time a system is capable of serving correct requests, measured over some period (usually a year). It's usually expressed as a string of nines, and the jump between each nine represents a dramatically shrinking downtime budget:

| Availability | Downtime per year | Downtime per month | Common tier |
|---|---|---|---|
| 99% ("two nines") | ~3.65 days | ~7.3 hours | Internal tools, non-critical batch jobs |
| 99.9% ("three nines") | ~8.76 hours | ~43.8 minutes | Typical production SaaS SLA |
| 99.99% ("four nines") | ~52.6 minutes | ~4.4 minutes | Payment processors, core infrastructure |
| 99.999% ("five nines") | ~5.26 minutes | ~26 seconds | Telecom switches, critical financial systems |

Each additional nine costs disproportionately more engineering effort — going from three nines to four nines usually means redesigning around redundancy and automated failover, not just "trying harder." This is why availability targets are a genuine architectural decision, made explicit in a Service Level Agreement (SLA), rather than an implicit goal every system should maximize by default: five-nines infrastructure for an internal admin dashboard is wasted spend.

## Why systems become unavailable

Before fixing availability, it helps to name what breaks it: hardware failure (a disk or a whole machine dies), software failure (a bad deploy, a memory leak, an unhandled exception cascading), network failure (a partition, DNS misconfiguration, a certificate expiring), overload (traffic spikes past capacity), and human error (a mistyped configuration change, an accidental deletion). Notice that most of these are not exotic — they're the ordinary cost of running any nontrivial system at scale for a long enough time. High availability isn't about preventing failure; it's about designing so that any single one of these failures doesn't take the whole system down.

## Redundancy: the foundational technique

The core idea behind almost every high-availability technique is the same: **eliminate single points of failure (SPOFs)** by running more than one of everything that matters.

- **Server redundancy** — run multiple instances of every service behind a load balancer, so one instance dying doesn't take down the service.
- **Database redundancy** — replicate data across multiple database nodes (covered in depth in Module 4), so a primary failing doesn't mean data loss or downtime.
- **Multi-AZ deployment** — deploy across multiple Availability Zones within a cloud region (physically separate data centers with independent power and networking), so a single data center outage doesn't take the whole service down.
- **Multi-region deployment** — go a step further and deploy across geographically distinct regions, protecting against a failure that takes out an entire region (a regional power grid failure, a natural disaster) at the cost of significantly higher complexity and cross-region data synchronization challenges.

\`\`\`text
Single instance:      [ Server ] ← one failure = full outage
Redundant instances:  [ LB ] → [ Server A ] [ Server B ] [ Server C ]
                                    ↑ one dies, LB routes around it, service stays up
\`\`\`

## Detecting failure before users do

Redundancy only helps if the system actually notices a failed node and stops sending it traffic — which is the job of **health checks**: a load balancer or orchestrator periodically pings each instance (a lightweight \`/health\` endpoint is the standard pattern) and automatically removes any instance that stops responding correctly from the rotation. Paired with **automated failover** — promoting a replica to primary, spinning up a replacement instance, rerouting traffic — this turns what would be a multi-hour manual incident into a self-healing event that finishes in seconds, often before anyone gets paged.

## Degrading gracefully instead of failing completely

The highest-availability systems don't treat "fully working" and "completely down" as the only two states. **Graceful degradation** means that when a non-critical dependency fails, the system keeps serving its core function with reduced functionality rather than failing outright — an e-commerce site whose recommendation service is down should still let you check out, just without "customers also bought" suggestions; a social feed whose image CDN is degraded should still render posts, just with broken thumbnails instead of a blank page. Designing for this means explicitly identifying which dependencies are load-bearing for the *core* user journey and which are enhancements, and making sure a failure in the latter category can never take down the former.

> **Key idea:** Availability is measured in "nines" that represent shrinking downtime budgets and rising engineering cost, and it's achieved not by preventing failure but by eliminating single points of failure through redundancy, catching failures fast with health checks and automated failover, and designing services to degrade gracefully instead of failing completely when a dependency goes down.`,
    },
    {
      name: "Reliability, Fault Tolerance & Maintainability",
      minutes: 11,
      intro: "Distinguish reliability from availability, learn the concrete fault-tolerance patterns that keep systems correct under failure, and see why maintainability is a design decision, not an afterthought.",
      content: `## Reliability vs availability — a distinction worth keeping straight

Availability and reliability get used interchangeably in casual conversation, but in system design they answer different questions. **Availability** asks "is the system up and responding?" **Reliability** asks "when the system responds, is the response *correct*?" A system can be available but unreliable — up 99.99% of the time but occasionally returning corrupted data or losing a write during a failure. A system can also be momentarily unavailable but perfectly reliable — a database that refuses writes during a partition rather than risk inconsistency (the CP choice from the previous lesson) is unavailable in that window but never wrong. Good system design treats these as two separate axes to reason about independently, not one blurry notion of "system health."

## Fault tolerance: designing for failure, not against it

Fault tolerance is the property of a system continuing to function correctly even when one or more of its components fail. The mindset shift that matters here: instead of trying to prevent every possible failure (impossible at scale), fault-tolerant design assumes failures *will* happen constantly and focuses on containing their blast radius.

**Retries with backoff.** A transient failure — a momentary network blip, a server briefly overloaded — often succeeds on a second attempt. Naively retrying immediately, though, can make things worse: if a downstream service is struggling under load, an army of clients all retrying instantly creates a retry storm that keeps it down. **Exponential backoff** fixes this by waiting progressively longer between attempts (1s, 2s, 4s, 8s...), and adding **jitter** — a small random offset to each wait — prevents many clients from retrying in synchronized bursts:

\`\`\`text
Attempt 1 fails → wait ~1s (±jitter) → Attempt 2 fails → wait ~2s (±jitter) → Attempt 3...
\`\`\`

**Circuit breakers.** Retrying forever against a service that's genuinely down just wastes resources and delays failure detection. A circuit breaker wraps calls to a dependency and tracks its failure rate; once failures cross a threshold, the breaker "opens" and fails fast immediately for a cooldown period instead of letting every request hang waiting on a doomed call — protecting both the caller (fast failure instead of a hung request) and the struggling dependency (no additional load while it recovers). After the cooldown, the breaker allows a trial request through to check if the dependency has recovered before fully closing again.

**Bulkheads.** Named after the watertight compartments in a ship's hull that keep one flooded section from sinking the whole vessel, the bulkhead pattern isolates resources (thread pools, connection pools) per dependency, so a slowdown in one downstream service can't exhaust resources needed to serve requests unrelated to it. Without bulkheads, one slow dependency can starve the entire application of threads or connections and take down features that have nothing to do with it.

**Redundancy**, already covered as an availability technique in the previous lesson, is equally a fault-tolerance technique — the same replicated nodes that keep a system *up* during a failure are what keep it *correct*, since a healthy replica can serve the request a failed node couldn't.

**Idempotency.** In a world of retries and at-least-once message delivery, the same request or event can arrive more than once. An idempotent operation produces the same result no matter how many times it's applied — \`setBalance(100)\` is idempotent, \`incrementBalance(10)\` is not, because retrying the latter after an ambiguous failure (did the first attempt actually go through?) can silently double-charge or double-credit. Designing write operations to be idempotent (often via a client-supplied idempotency key the server deduplicates on) is what makes "just retry it" a safe default instead of a data-corruption risk.

## Maintainability: designing for the humans who run the system

Maintainability is the often-overlooked third leg of the reliability triangle: how easily can the people operating this system understand it, fix it, and change it safely over time? A system that's technically reliable today but impossible to debug at 3 a.m. during an incident, or too risky to modify without fear of breaking something unrelated, accumulates operational cost that eventually shows up as *reduced* reliability — because tired, confused engineers under pressure make mistakes.

Concrete design choices that drive maintainability:

- **Observability** — structured logs, metrics, and distributed traces (covered in Module 10) that let an engineer answer "what is this system doing right now, and why" without reading source code under pressure.
- **Clear ownership boundaries** — services with well-defined responsibilities and interfaces (a direct payoff of the architectural styles from Module 2) mean a given failure narrows quickly to "which team/component owns this," instead of every incident becoming an all-hands archaeology dig.
- **Documentation and runbooks** — a written, tested procedure for "what to do when X alert fires" turns an incident into a checklist instead of an improvised investigation.
- **Simplicity over cleverness** — every added abstraction, custom framework, or non-standard pattern is a tax paid by every future engineer who has to understand it during an incident; the most maintainable systems tend to be the most boring ones.

## How the three qualities trade off against cost

None of this is free. More redundancy means more infrastructure spend. More circuit breakers and retry logic mean more code paths to test and reason about. More observability means more instrumentation to write and more data to store and query. Every real system design conversation eventually has to weigh reliability, fault tolerance, and maintainability against budget and delivery speed — the right amount of each is however much the *actual* cost of failure justifies, not the theoretical maximum.

> **Key idea:** Reliability (correctness) is distinct from availability (uptime); fault tolerance is achieved through retries with backoff and jitter, circuit breakers, bulkheads, redundancy, and idempotency working together to contain failures rather than prevent them; and maintainability — observability, clear ownership, documentation, and simplicity — determines whether a system stays reliable in the hands of the humans who operate it.`,
    },
  ],
}
