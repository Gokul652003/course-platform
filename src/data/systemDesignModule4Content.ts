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
  ],
}
