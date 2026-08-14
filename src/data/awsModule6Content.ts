import type { Module } from "../types"

export const awsModule6: Module = {
  id: 6,
  title: "Database Services",
  status: "upcoming",
  lessons: [
    {
      name: "Relational Databases: RDS & Aurora",
      minutes: 12,
      intro: "Managed relational databases — tables, SQL, Multi-AZ, and read replicas.",
      content: `### Relational vs non-relational (the #1 DB distinction)

| | Relational (SQL) | Non-relational (NoSQL) |
|---|------------------|------------------------|
| Structure | Tables, rows, columns | Key-value, documents |
| Schema | Fixed | Flexible |
| Example | RDS, Aurora | DynamoDB |
| Best for | Structured, transactional data | High-scale, variable data |

### Amazon RDS (Relational Database Service)

**RDS** provides managed **relational databases** — AWS handles patching, backups, and replication. It supports the engines you choose: **MySQL, PostgreSQL, MariaDB, Oracle, SQL Server** (and Aurora separately).

- **Multi-AZ** — synchronous replica in another AZ for **high availability / failover** (for production)
- **Read replicas** — async copies to **scale reads** and improve read performance (not for writes, not for failover)
- **Automated backups** + point-in-time restore

> **Exam tip:** "Production database that must not lose data on AZ failure" → **Multi-AZ RDS**. "Database is read-heavy, improve performance" → **Read replicas**.

### Amazon Aurora

- A **MySQL- and PostgreSQL-compatible** relational database built for the cloud
- **5x faster than MySQL, 3x faster than PostgreSQL**, and more available
- Automatically scales storage, has **6 copies of data across 3 AZs**
- Pricing: compute + storage metered separately (can be cheaper than RDS at scale)

### Relational DB choosing

| Need | Service |
|------|---------|
| Managed MySQL/Postgres | RDS |
| High-performance MySQL/Postgres compatible | Aurora |
| Run your own DB on a VM | EC2 (you manage everything) |

> **Exam tip:** Aurora = "MySQL/PostgreSQL compatible but faster and more durable." Multi-AZ ≠ read replicas.`,
    },
    {
      name: "Amazon DynamoDB: NoSQL Database",
      minutes: 10,
      intro: "Serverless key-value/document database — single-digit-millisecond performance at any scale.",
      content: `### What is DynamoDB?

**Amazon DynamoDB** is a fully managed **NoSQL key-value and document database** that delivers **single-digit-millisecond performance at any scale**.

- **Serverless** — no servers to provision; scales automatically
- Stores **items** (rows) with **attributes** in **tables**
- Data stored on **SSD** in 3 AZs
- Supports **on-demand** (pay per request) and **provisioned capacity** modes
- **DynamoDB Accelerator (DAX)** — in-memory cache for up to 10x performance

### Great fit for

- **High-traffic web apps**, gaming, IoT (sensor data)
- **Key-value lookups** with predictable access by primary key
- Applications needing scale without manual DB administration
- **Serverless stacks** (Lambda + API Gateway + DynamoDB)

### Not a fit for

- Complex queries / joins / SQL analytics → relational (RDS)
- Data warehousing → Redshift

### Global tables

**DynamoDB global tables** replicate data across regions automatically for worldwide, low-latency reads and writes.

### Managed vs unmanaged recap

- RDS = managed relational (you don't touch the OS)
- DynamoDB = fully serverless NoSQL
- On EC2 + own DB = you manage everything

> **Exam tip:** "NoSQL," "key-value," "millisecond," "serverless database that scales automatically" → **DynamoDB**.`,
    },
    {
      name: "Data Warehousing: Amazon Redshift",
      minutes: 8,
      intro: "Amazon's petabyte-scale data warehouse for analytics.",
      content: `### What is Redshift?

**Amazon Redshift** is a fast, petabyte-scale, fully managed **data warehouse** for running **analytics on large volumes of data**.

- Uses SQL for analysis
- Columnar storage + parallel processing across nodes
- **Best for:** business intelligence, complex analytical queries over huge datasets (sales, logs, metrics)
- Works great with visualization tools like **Amazon QuickSight**

### Database vs data warehouse

| | OLTP (transactional, e.g. RDS/DynamoDB) | OLAP (analytical, e.g. Redshift) |
|---|------------------------------------------|----------------------------------|
| Purpose | Process daily transactions | Analyze historical, aggregated data |
| Workload | Many small reads/writes | Fewer, huge queries |
| Example | Orders, login records | Revenue trends over 5 years |

> **Exam tip:** "Analytics," "data warehousing," "large-scale SQL analytics" → **Redshift**. Not for serving a web app — that's RDS/DynamoDB.

### Other analytics that touch databases

- **Amazon Athena** — query S3 data directly with SQL (serverless, pay per query)
- **Amazon EMR** — run Apache Hadoop/Spark big-data frameworks
- **Amazon Kinesis** — process **streaming** data (real-time)

> **Exam tip:** "Query data directly in S3 without loading it into a database" → **Athena**.`,
    },
    {
      name: "Other Databases & Choosing the Right One",
      minutes: 10,
      intro: "ElastiCache, Neptune, DocumentDB, and the exam's 'choose the database' scenarios.",
      content: `### Amazon ElastiCache

- **In-memory cache** (Redis or Memcached) for **ultra-low latency** reads
- Sits in front of your database to speed up repeated reads and session data
- **Best for:** caching, session storage, leaderboards, real-time analytics

> **Exam tip:** "Improve database performance by caching frequent reads / storing session data" → **ElastiCache**.

### Purpose-built databases to recognize

| Service | Type / use case |
|---------|-----------------|
| **Neptune** | **Graph database** — highly connected data (social networks, fraud detection) |
| **DocumentDB** | **MongoDB-compatible** document database |
| **Timestream** | **Time-series** — IoT, metrics |
| **Quantum Ledger Database (QLDB)** | Immutable, append-only **ledger** — records of transactions (e.g. financial) |
| **Managed Blockchain** | Join/create blockchain networks |
| **Keyspaces** | **Cassandra-compatible** wide-column database |
| **DynamoDB** | Key-value / document (serverless) |

### Choose-the-database decision guide

| Scenario | Pick |
|----------|------|
| Web app needing SQL with managed ops | RDS |
| MySQL/Postgres compatible, faster, more durable | Aurora |
| Serverless key-value, high scale, millisecond | DynamoDB |
| Petabyte analytics / data warehouse | Redshift |
| Cache frequently read data | ElastiCache |
| Graph data (friends, connections, fraud) | Neptune |
| MongoDB workloads | DocumentDB |
| Sensor / time-series data | Timestream |
| Immutable financial record of changes | QLDB |

> **Exam tip:** The exam nearly always gives you a scenario and asks which database. Match the keyword: graph → Neptune, time-series → Timestream, ledger/records → QLDB, cache → ElastiCache, key-value serverless → DynamoDB.`,
    },
  ],
}