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
  ],
}
