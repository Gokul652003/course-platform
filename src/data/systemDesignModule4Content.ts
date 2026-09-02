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
    {
      name: "Storage Systems, Normalization/Denormalization & Redis",
      minutes: 11,
      intro: "Tour the three broad categories of storage, weigh normalized schemas against denormalized ones, and get a working mental model of Redis and basic SQL query tuning.",
      content: `## Block, object, and file storage

Beyond "which database," systems also need to decide how raw bytes are physically stored, and there are three broad categories:

- **Block storage** — raw, fixed-size blocks of data (like a virtual hard disk), attached to a single machine at a time, with no built-in concept of files or folders — that's layered on top by the operating system's filesystem. Low latency, supports random reads and writes efficiently, which is exactly what a database engine needs to do. This is what backs a running database instance (Amazon EBS, for example) — the database process needs a fast, low-level disk to write its own data files to.
- **Object storage** — data stored as whole, immutable objects (a file plus metadata), addressed by a key, accessed over HTTP rather than mounted like a disk (Amazon S3, Google Cloud Storage). No in-place partial edits — updating an object means replacing it entirely — but it scales to effectively unlimited capacity, is durable by design (typically replicated across multiple facilities automatically), and is the natural home for anything large and mostly-write-once-read-many: images, videos, backups, log archives.
- **File storage** — a traditional hierarchical filesystem (folders and files) shared and mounted by multiple machines at once (NFS, Amazon EFS). Useful when several servers genuinely need to read and write the same file tree concurrently, which block storage (single-attach) and object storage (no in-place edits, no real directory semantics) don't cleanly support.

A concrete rule of thumb: a database's own data files live on **block storage**; the images and videos a user uploads live in **object storage**; a shared configuration directory that multiple application servers need to read and occasionally write lives on **file storage**. Reaching for the wrong one — like storing millions of user-uploaded images as rows in a relational database instead of object storage — is a classic early-stage mistake that becomes expensive to unwind later.

## Normalization vs denormalization

**Normalization** is the process of structuring a relational schema to eliminate redundant data — each fact is stored exactly once, and everything that needs it references it. A simplified, informal walk through the first few normal forms:

- **1NF** — every column holds a single, atomic value (no comma-separated lists crammed into one field).
- **2NF** — every non-key column depends on the *whole* primary key, not just part of it (relevant for composite keys).
- **3NF** — every non-key column depends only on the key, not on another non-key column (a customer's city shouldn't live in the \`orders\` table if it's really a fact about the customer, stored in \`customers\`).

A normalized schema for orders might look like:

\`\`\`sql
customers(id, name, city)
orders(id, customer_id, total)
\`\`\`

instead of a denormalized version that repeats the customer's name and city on every single order row. Normalization's payoff is data integrity: a customer's city is stored once, so updating it can never leave some orders with the old city and others with the new one — there's only one place it can live.

**Denormalization** deliberately reintroduces redundancy — copying data into multiple places — to make reads faster, at the cost of making writes do more work (and introducing the possibility of the copies drifting out of sync if updates aren't handled carefully). A denormalized \`orders\` table might store the customer's name directly on each order row, so rendering an order list never needs a join back to \`customers\` at all.

The trade-off in one line: **normalize for write integrity and storage efficiency; denormalize for read speed**, and most systems land somewhere in between — a normalized source-of-truth schema with specific, deliberately denormalized read paths (or a separate cache, which is really denormalization one layer up) for the queries that actually need to be fast.

## Redis: an in-memory data store

Redis is an in-memory key-value store that shows up constantly in system design because it's genuinely useful for several unrelated jobs at once, all stemming from the same property: reading and writing RAM is orders of magnitude faster than reading and writing disk.

Redis supports several data structures natively, not just plain string values, which is a big part of why it's so versatile:

| Data structure | Typical use |
|---|---|
| String | Simple cache values, counters (\`INCR\`) |
| Hash | An object's fields (a user's profile) without a full serialize/deserialize round trip |
| List | A queue or a recent-activity feed |
| Set | Unique tags, membership checks |
| Sorted set | Leaderboards (score-ordered), rate-limiting windows |

Common uses that follow directly from this: a **cache** in front of a slower database (the topic of Module 7); a **session store** for a stateless application tier, so any instance can look up a user's session by ID instead of keeping it in local memory; a **rate limiter**, using a sorted set or a simple counter with expiry to track how many requests a client has made in a window (Module 8 covers the algorithms); and a **leaderboard**, using a sorted set's native score-ordering to answer "top 10" or "this user's rank" in a single fast operation instead of a \`SELECT ... ORDER BY\` over a large table.

Redis is not a replacement for a primary database in most designs — being in-memory, data is vulnerable to loss on a crash unless persistence (snapshotting or an append-only log) is explicitly configured, and total capacity is bounded by available RAM rather than disk. It's best understood as a purpose-built accelerator sitting alongside a durable primary store, not instead of one.

## A note on SQL query optimization

Even a well-normalized relational schema can perform badly if queries aren't written with the database's execution model in mind. Three habits catch most real-world slowness:

- **Index the columns you filter and join on.** Without an index, the database scans every row to find matches; with one, it can jump straight to the relevant rows. The cost is that every index also slows down writes slightly (each insert/update must maintain the index too), so indexing is a deliberate trade-off, not something to apply to every column indiscriminately.
- **Avoid the N+1 query pattern.** Fetching a list of orders, then looping over them and issuing a separate query per order to fetch its customer, turns one page load into N+1 round trips to the database. A single query with a join (or a batched \`WHERE id IN (...)\`) replaces N+1 round trips with one.
- **Read the \`EXPLAIN\` plan before guessing.** Every relational database can show the actual execution plan for a query — whether it's using an index or scanning the whole table, in what order it's joining tables — and that plan is far more reliable evidence than intuition about why a specific query is slow.

> **Key idea:** Choose block storage for a database's own low-latency disk, object storage for large immutable blobs, and file storage for content genuinely shared across machines; normalize a schema for write integrity and denormalize deliberately where read speed matters more; and Redis's in-memory data structures make it a natural fit for caching, session storage, rate limiting, and leaderboards — alongside disciplined indexing and \`EXPLAIN\`-driven query tuning, not as a replacement for either.`,
    },
  ],
}
