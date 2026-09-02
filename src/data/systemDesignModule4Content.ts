import type { Module } from "../types"

export const systemDesignModule4: Module = {
  id: 4,
  title: "Databases & Storage Systems",
  status: "upcoming",
  lessons: [
    {
      name: "SQL vs NoSQL — Choosing the Right Database",
      minutes: 11,
      intro: "Compare relational and non-relational data models on their own terms, and build a practical framework for picking between them instead of defaulting to either.",
      content: `## Two different ways to model data

A **SQL (relational) database** — PostgreSQL, MySQL, SQL Server — stores data in tables with a fixed schema: every row in a table has the same columns, relationships between tables are expressed with foreign keys, and the database engine enforces the schema on every write. A **NoSQL database** is really an umbrella term for several different non-relational models, each optimized for a different access pattern:

| Model | Example databases | Shape | Good fit for |
|---|---|---|---|
| Key-value | Redis, DynamoDB | Opaque value behind a key | Caching, session storage, simple lookups |
| Document | MongoDB, Couchbase | Nested JSON-like documents | Semi-structured data, evolving schemas |
| Column-family | Cassandra, HBase | Rows with dynamic, sparse columns | Very high write throughput, time-series data |
| Graph | Neo4j, Amazon Neptune | Nodes and edges | Relationship-heavy queries (social graphs, recommendations) |

The label "NoSQL" describes what these have in common far less than SQL databases resemble each other — a key-value store and a graph database solve almost entirely different problems, and lumping them together as "the NoSQL option" versus "the SQL option" is often the first mistake in this decision.

## ACID vs BASE

The deeper difference isn't the shape of the data — it's the guarantees each system makes about consistency, and that difference has a name on each side:

- **ACID** (Atomicity, Consistency, Isolation, Durability) — the traditional guarantee relational databases make: a transaction either fully happens or fully doesn't (atomicity), the database moves from one valid state to another (consistency), concurrent transactions don't see each other's half-finished work (isolation), and once committed, data survives a crash (durability). This is what makes "transfer $100 from account A to account B" safe to express as a single transaction — either both the debit and the credit happen, or neither does.
- **BASE** (Basically Available, Soft state, Eventually consistent) — the looser guarantee many NoSQL systems favor instead, trading strict consistency for availability and partition tolerance (a direct expression of the CAP theorem trade-off covered in Module 5): the system stays responsive even during a partial failure, its state may not be immediately consistent everywhere, but it converges to a consistent state given enough time without new writes.

Neither is strictly "better" — ACID is what you want for a bank ledger; BASE is an acceptable, even desirable, trade for a "likes" counter that can be off by a few for a moment. The right choice depends entirely on whether the data being modeled actually requires the stronger guarantee.

## A practical decision framework

Rather than starting from "which is more scalable" (a common but misleading framing — well-run relational databases scale to enormous size, and a badly-designed NoSQL schema scales poorly too), a more useful set of questions:

**1. How rigid is the schema, really?** If every record genuinely has the same well-defined shape and that shape rarely changes (an \`orders\` table, an \`employees\` table), a relational schema costs little and buys strong guarantees for free. If records legitimately vary in shape — one product has five attributes, another has thirty, and new attribute types show up regularly — forcing that into a fixed relational schema means either a sparse table full of nulls or constant migrations; a document model fits more naturally.

**2. What do the queries actually look like?** If the application needs to join data across several entities in flexible, ad-hoc ways (find all orders placed by customers in a given city who bought a specific product last month), a relational database's query engine and indexes are built for exactly this. If access is almost always "fetch this one thing by its ID" (a user's profile, a cached computation, a session), a key-value store answers that with less overhead than a full relational engine ever needs to provide.

**3. What consistency does the data actually need?** Financial balances, inventory counts that must never go negative, anything where two people seeing different answers at the same moment is a real problem — these need the strong consistency ACID transactions provide. A page-view counter, a "users currently online" indicator, a recommendation feed — these can tolerate being slightly stale or eventually consistent, and gain availability and write throughput in exchange.

**4. What's the actual write pattern?** A relational database with a single writer can genuinely struggle with extremely high, geographically distributed write volume (millions of IoT sensor writes per second, as in the previous lesson's ingestion pipeline). Column-family stores like Cassandra are specifically built to absorb that kind of write load across many nodes with no single bottleneck writer.

## The framework in one table

| Question | Leans relational | Leans NoSQL |
|---|---|---|
| Schema | Fixed, well-understood upfront | Varies per record, evolves often |
| Queries | Complex joins across entities | Lookups by key, simple access patterns |
| Consistency | Must be strict (money, inventory) | Eventual consistency is acceptable |
| Write volume | Moderate, fits a scalable single writer | Extremely high, needs many writers |
| Relationships | Central to the data (foreign keys) | Data is mostly self-contained per record |

Most real production systems use both, for different pieces of data — a relational database for orders and payments where correctness is non-negotiable, alongside a key-value store for session data and a document store for a flexible product catalog, each chosen for what it's actually storing rather than a single company-wide database mandate.

> **Key idea:** SQL vs NoSQL isn't a single spectrum from "less scalable" to "more scalable" — it's a choice between rigid-schema, strongly-consistent relational storage (ACID) and several distinct non-relational models trading strict consistency for flexibility, availability, and raw write throughput (BASE); the right pick follows from the actual schema shape, query pattern, consistency requirement, and write volume of the specific data being stored, not a blanket rule.`,
    },
    {
      name: "Database Replication & Sharding",
      minutes: 11,
      intro: "Separate two commonly confused techniques — copying data for availability and read scaling versus splitting data for write scaling — and see how each is actually implemented.",
      content: `## Replication: many copies of the same data

**Replication** means keeping multiple copies of the same dataset on different machines, so that losing one machine doesn't lose the data, and reads can be spread across several copies instead of hitting a single instance.

The most common setup is **leader-follower (primary-replica) replication**: one node — the leader — accepts all writes, and one or more follower nodes continuously receive a stream of those changes and apply them locally, ending up with (eventually) the same data as the leader.

\`\`\`text
        writes
Client ────────▶ Leader
                    │
        replication stream (async or sync)
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      Follower1  Follower2  Follower3
          ▲         ▲         ▲
          └─────────┴─────────┘
                reads
Client ─────────────────────────▶
\`\`\`

Reads can be served from any follower (or the leader), spreading read load across every node instead of concentrating it on one — exactly the lever used for the read-heavy feed system in the previous module. Writes, however, still all funnel through the single leader, which means leader-follower replication scales *reads*, not *writes*.

**Synchronous vs asynchronous replication** is the key trade-off inside this pattern:
- **Synchronous** — the leader waits for at least one follower to confirm it received the write before acknowledging success to the client. Stronger durability (a follower is guaranteed to have the data if the leader dies right after acknowledging), but higher write latency, since every write waits on a network round trip to a follower.
- **Asynchronous** — the leader acknowledges the write immediately and streams it to followers in the background. Lower latency, but a real risk: if the leader crashes before a follower catches up, that most recent write can be lost entirely, and followers briefly serve stale data (replication lag) even in the normal case.

**Failover** is what happens when the leader dies: one follower is promoted to be the new leader (automatically, in most managed database services, via a health-check-driven election), and the rest of the followers — and the application — redirect to it. Getting this right without losing writes or briefly accepting writes on two different "leaders" at once (split brain) is one of the genuinely hard problems in distributed databases, and it's why most teams use a managed replication solution rather than building failover by hand.

Some systems use **multi-leader replication** instead — more than one node accepts writes, useful when writes need to happen close to users in different regions — but this reintroduces the problem replication is otherwise good at avoiding: if the same record is written on two leaders at nearly the same time, the system needs a conflict-resolution strategy (last-write-wins, merge logic, or pushing the conflict back to the application) to reconcile them.

## Sharding: splitting the data itself

Replication solves "too many readers" and "one machine dying." It does not solve **"the data itself, or the write volume, is too big for one machine to hold or handle."** That's what **sharding** (a specific, database-level form of the broader concept of data partitioning) is for: splitting a dataset into disjoint pieces — shards — each living on a different machine, so no single machine needs to store or process all of it.

\`\`\`text
Shard A (users 0-999)     Shard B (users 1000-1999)     Shard C (users 2000-2999)
    Machine 1                   Machine 2                     Machine 3
\`\`\`

The critical decision is the **shard key** — the field used to decide which shard a given row belongs on:

- **Range-based sharding** — assign contiguous ranges of the key to each shard (users 0-999 on shard A, 1000-1999 on shard B). Simple, and range queries within a shard are efficient, but it's prone to **hot shards**: if user IDs are assigned sequentially and new users are the most active, the newest shard absorbs a disproportionate share of the load while older shards sit comparatively idle — the same hot-partition problem from Module 3, now at the database layer.
- **Hash-based sharding** — hash the key and use the hash to pick a shard (\`shard = hash(user_id) % num_shards\`). Spreads load far more evenly, since a good hash function distributes keys near-uniformly regardless of any pattern in the original values, but range queries ("all users created this week") now have to fan out to every shard, since consecutive keys are scattered across all of them.

**Resharding is the operational pain point.** Adding a new shard to a hash-based scheme changes \`num_shards\`, which changes almost every key's hash-modulo assignment — in the naive scheme above, nearly all data has to be physically moved to new shards at once. This is exactly the problem **consistent hashing** (covered in Module 6, in the context of load balancing, but applicable to sharding too) was invented to solve: it limits a resharding event to moving only the fraction of data that must move, not the whole dataset.

## Replication and sharding together

These two techniques solve different problems and are normally combined, not chosen between: a large system commonly shards its data across many machines *and* replicates each shard, so each individual shard both distributes its write load across the sharding scheme and survives losing any one of its own machines.

\`\`\`text
Shard A (leader + 2 followers)   Shard B (leader + 2 followers)   Shard C (leader + 2 followers)
\`\`\`

> **Key idea:** Replication keeps multiple copies of the *same* data to survive node failure and scale reads (with a synchronous/asynchronous trade-off between durability and latency), while sharding splits the data itself across machines by a shard key to scale writes and total data volume — hash-based sharding spreads load more evenly than range-based sharding at the cost of efficient range queries, and large systems typically combine both, replicating each individual shard.`,
    },
  ],
}
