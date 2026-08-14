import type { Module } from "../types"

export const awsModule4: Module = {
  id: 4,
  title: "Storage Services",
  status: "upcoming",
  lessons: [
    {
      name: "Amazon S3: Object Storage",
      minutes: 14,
      intro: "The most important storage service: buckets, objects, storage classes, and features.",
      content: `### What is S3?

**Amazon Simple Storage Service (S3)** is **object storage** — infinite, highly durable, and cheap. You store files as **objects** inside **buckets**.

- **Durability:** 99.999999999% (11 nines)
- **Availability:** 99.99%
- Object size: up to 5 TB

### Core concepts

- **Bucket** — a container for objects (also used as a website endpoint)
- **Object** — the data + metadata + a unique key (name)
- **Key** — the object's name within a bucket

### S3 storage classes (know these!)

| Class | Use case | Cost |
|-------|----------|------|
| **S3 Standard** | Frequently accessed data | Most expensive (per GB) |
| **S3 Intelligent-Tiering** | Unknown/fluctuating access patterns; auto-moves data | Monitoring fee + $0.0125/1000 objects |
| **S3 Standard-IA** (Infrequent Access) | Accessed rarely but must be fast when accessed | Lower storage, retrieval fee |
| **S3 One Zone-IA** | Rarely accessed, in a single AZ | Cheapest, least resilient |
| **S3 Glacier Instant Retrieval** | Archive, millisecond access | Very cheap + retrieval costs |
| **S3 Glacier Flexible Retrieval** | Archive, minutes–hours retrieval | Cheaper, longer retrieval |
| **S3 Glacier Deep Archive** | Long-term archive (retrieve in 12–48 hrs) | Cheapest |

> **Exam tip:** "Least expensive for long-term archival data that is rarely accessed" → **S3 Glacier Deep Archive**.

### Security & management features

- **Bucket policies** — JSON resource-based policies controlling access
- **Versioning** — keep multiple versions of an object (protects against accidental deletes)
- **Lifecycle policies** — automatically move objects between classes (e.g. Standard → IA → Glacier) and delete them
- **Server-Side Encryption (SSE)** — encrypt at rest (SSE-S3, SSE-KMS, SSE-C)
- **Static website hosting** — serve a website directly from S3
- **S3 Transfer Acceleration** — faster uploads using edge locations

> **Exam tip:** Websites hosted on S3 don't need a web server — "host a static website cheaply" → **S3** + Route 53.`,
    },
    {
      name: "EBS & Instance Store: Block Storage",
      minutes: 10,
      intro: "Storage attached to EC2 instances — the difference is persistence.",
      content: `### Amazon EBS (Elastic Block Store)

- **Block-level storage volumes** attached to a single EC2 instance
- Network-attached: persists independent of the instance life
- **Best for:** databases and applications needing a reliable, persistent disk
- Backups via **EBS snapshots** (incremental, stored in S3)
- Can attach to one instance at a time (per volume); volumes live in a specific **AZ**

### Instance Store

- **Ephemeral, temporary** block storage physically attached to the host machine
- **Data is lost** if the instance stops or is terminated
- **Best for:** temporary data, caches, scratch space
- Ultra-fast (local disk), but **not durable**

### EBS vs Instance Store

| | EBS | Instance Store |
|---|-----|----------------|
| Persists after instance stops | Yes | **No** |
| Network or local? | Network attached | Local physical disk |
| Backup | Snapshots | None |

### EBS volume types (just know the idea)

- **gp3/gp2** — general purpose SSD (default, balanced)
- **io1/io2** — provisioned IOPS SSD (databases)
- **st1/sc1** — HDD, throughput (logs, big sequential reads)

> **Exam tip:** "Persistent storage that survives instance termination" → **EBS**. "Data survives instance *stop/start*" → still EBS (it persists). Instance store disappears on stop/terminate.`,
    },
    {
      name: "EFS & Network File Storage",
      minutes: 8,
      intro: "Shared, scalable file storage for multiple EC2 instances.",
      content: `### Amazon EFS (Elastic File System)

- **Network file storage** — a file system on NFS that **many EC2 instances can mount at once**
- Scales automatically as you add data (no provisioning)
- Works across **multiple AZs** in a region
- **Best for:** shared content, web serving, content management systems, shared code/libraries
- Pay only for the storage you use

### Amazon FSx

- Fully managed **file systems** for specialized workloads
- **FSx for Lustre** — high-performance, for HPC and ML
- **FSx for Windows File Server** — SMB protocol, Windows/AD environments
- **FSx for NetApp ONTAP / OpenZFS** — enterprise file storage

### Storage comparison (exam favorite)

| Scenario | Service |
|----------|---------|
| Single EC2 server disk | **EBS** |
| Multiple EC2 instances sharing a file system | **EFS** |
| Object storage / static website / backups | **S3** |
| Temporary scratch storage on an instance | **Instance Store** |
| Windows shared file storage (SMB) | **FSx for Windows File Server** |
| High-performance HPC file system | **FSx for Lustre** |

> **Exam tip:** The trickiest distinction: "**one** instance, attached disk" → EBS. "**many** instances, shared file system" → EFS. "internet-accessible objects" → S3.`,
    },
    {
      name: "Archives, Hybrid, Snapshot & Backup Services",
      minutes: 10,
      intro: "Glacier, Snow Family, Storage Gateway, and Backup — plus decide-your-storage.",
      content: `### S3 Glacier (covered in module storage classes)

Glacier = **archive storage** for data you rarely access. Three tiers:
- **Instant Retrieval** — ms access
- **Flexible Retrieval** — minutes to hours
- **Deep Archive** — 12–48 hours, **lowest cost**

### AWS Snow Family (offline data transfer)

Used when the internet is too slow / data is too large (**petabytes+**):

| Device | Capability |
|--------|-----------|
| **Snowcone** | Smallest, up to 8 TB |
| **Snowball Edge** | Storage & compute, up to ~80 TB |
| **Snowmobile** | An exabyte-scale truck, 100 PB, for massive data-center migrations |

> **Exam tip:** "Transfer petabytes of data offline / over the internet is too slow" → **Snowball**. "Exabytes across data centers" → **Snowmobile**.

### AWS Storage Gateway

A **hybrid cloud storage service** that connects your **on-premises software to AWS cloud storage**.

- **File Gateway** — files in S3, accessible via NFS/SMB
- **Volume Gateway** — block storage cached / stored in S3
- **Tape Gateway** — virtual tapes in S3/Glacier for backup

> **Exam tip:** "Connecting on-prem backup software to AWS cloud storage" → **Storage Gateway**.

### AWS Backup

- Centralized, automated, policy-based **backups** of AWS services (EBS, RDS, DynamoDB, EFS, etc.)
- Create **backup plans**, keep them in a central dashboard

### Choosing your storage (final recap)

| Need | Service |
|------|---------|
| Durable, serverless object storage | S3 |
| Persistent disk for one instance | EBS |
| Shared file system across instances | EFS |
| Cheap long-term archive | S3 Glacier |
| Move petabytes offline | Snow Family |
| Connect on-prem to cloud storage | Storage Gateway |

> **Exam tip:** Read the FULL scenario. "Archive for compliance, rarely accessed, cheapest" → Glacier Deep Archive. "on-premises to cloud bridge" → Storage Gateway.`,
    },
  ],
}