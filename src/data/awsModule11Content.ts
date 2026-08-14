import type { Module } from "../types"

export const awsModule11: Module = {
  id: 11,
  title: "Architecture, Migration & Innovation",
  status: "upcoming",
  lessons: [
    {
      name: "The Well-Architected Framework",
      minutes: 12,
      intro: "The six pillars AWS uses to judge good architecture — a big exam theme.",
      content: `### What is the Well-Architected Framework?

**AWS Well-Architected** is a set of best practices for designing and operating reliable, secure, efficient, and cost-effective systems in the cloud. It has **six pillars**.

### The 6 pillars (memorize!)

| Pillar | What it's about | Example practices |
|--------|-----------------|-------------------|
| **1. Operational Excellence** | Operate & monitor systems, improve processes | Monitoring with CloudWatch; runbooks |
| **2. Security** | Protect data, systems, assets | IAM, MFA, encryption, least privilege |
| **3. Reliability** | Recover from failure, meet demand | **Multi-AZ**, backups, auto scaling |
| **4. Performance Efficiency** | Use resources efficiently | Right-sizing, serverless, Elastic Load Balancing |
| **5. Cost Optimization** | Avoid unnecessary cost | Right-sizing, Spot/Reserved, lifecycle policies |
| **6. Sustainability** | Minimize environmental impact | Efficiency, right-sizing, renewable energy |

### Matching questions

- "Design that recovers from failure automatically" → **Reliability**
- "Zero-trust / encrypt everything / least privilege" → **Security**
- "Continually refine and improve operations" → **Operational Excellence**
- "Pay only for what you need / avoid waste" → **Cost Optimization**
- "Lowest latency within budget / scale efficiently" → **Performance Efficiency**

### Key reliability tactics the exam likes

- **Multi-AZ** deployment for fault tolerance
- **Auto scaling** to meet changing demand
- **Backups** + test disaster recovery (RPO/RTO defined)
- **Snowball for migration** is reliability-free — reliability = recovery

> **Exam tip:** "High availability / withstand failure" → deploy across **multiple AZs** (not regions, not edge). "Recover data" → **backups**.`,
    },
    {
      name: "Migration Strategies & Services (The 6 Rs)",
      minutes: 12,
      intro: "How applications move to AWS — the 6 Rs and AWS migration services.",
      content: `### The 6 Rs of migration

| R | Meaning | Example |
|---|---------|---------|
| **Rehost** | "Lift & shift" — move as-is | Rebuild same app on EC2 |
| **Replatform** | "Lift, tinker & shift" — minor changes | Move a DB to RDS |
| **Refactor** (or re-architect) | Redesign for cloud-native | Rewrite as serverless/Lambda |
| **Repurchase** | Replace with a SaaS/commercial product | Swap to Salesforce/SaaS |
| **Retain** | Keep some workloads on-prem | Some legacy systems stay |
| **Retire** | Decommission what's not needed | Remove unused apps during migration |

> **Exam tip:** "Move without changes, quickest" → **Rehost**. "Redesign to take advantage of cloud, e.g. go serverless" → **Refactor**.

### AWS migration services to recognize

| Service | What it helps with |
|---------|-------------------|
| **AWS Application Discovery Service** | Discover on-prem servers/apps to plan migrations |
| **AWS Application Migration Service (MGN)** | Rehost servers to AWS (automated lift-and-shift) |
| **AWS Database Migration Service (DMS)** | Move databases to AWS (SQL, NoSQL) with minimal downtime; supports **continuous replication** |
| **AWS Snow Family** | Physical data transfer for huge datasets |
| **AWS Migration Hub** | Track migrations from one dashboard |
| **AWS Transfer Family** | Managed SFTP/FTPS for transferring files into S3/EFS |

### Hybrid & edge (well-connected to migration)

- **AWS Outposts** — run AWS services on-prem in your data center
- **AWS Storage Gateway** — hybrid storage bridging on-prem to S3/Glacier

> **Exam tip:** "Move a database with minimal downtime / replicate to the cloud" → **Database Migration Service**. "Move whole server as-is to EC2 cheaply" → **Application Migration Service**.`,
    },
    {
      name: "AI, ML & Big Data Services (Know Their One-Liners)",
      minutes: 12,
      intro: "The ML/AI services CLF-C02 expects you to recognize.",
      content: `### The ML services you MUST recognize

| Service | One-line use case |
|---------|-------------------|
| **Amazon SageMaker** | Fully managed platform to **build, train, deploy ML models** |
| **Amazon Rekognition** | **Image and video analysis** — faces, objects, text in images |
| **Amazon Lex** | Build **chatbots / conversational interfaces** (same tech as Alexa) |
| **Amazon Polly** | Convert **text to speech** |
| **Amazon Transcribe** | **Speech to text** (audio transcription) |
| **Amazon Comprehend** | **Natural language processing** — extract meaning/key phrases from text |
| **Amazon Translate** | Language **translation** |
| **Amazon Textract** | **Extract text and data from documents/scans** (forms, tables) |
| **Amazon Kendra** | **Enterprise search** with ML (search across documents) |
| **Amazon Forecast** | **Time-series forecasting** (demand, sales) |
| **Amazon Fraud Detector** | Detect **fraud** with ML |
| **Amazon Personalize** | Real-time **personalization / recommendations** |

### Exam trick

The questions describe a business problem; you pick the service:
- "Build and train custom machine learning models" → **SageMaker**
- "Detect objects and faces in photos" → **Rekognition**
- "Turn text into speech (voiceovers)" → **Polly**
- "Transcribe recorded calls to text" → **Transcribe**
- "Understand customer sentiment from reviews" → **Comprehend**
- "Translate documents into French" → **Translate**
- "Chatbot on a website" → **Lex**

> **Exam tip:** Flashcards these one-liners. They are the highest-yield, lowest-difficulty points on the exam.

### Big data & analytics services

| Service | Purpose |
|---------|---------|
| **Athena** | Serverless **SQL queries directly on S3** |
| **EMR** | Run **Hadoop/Spark** big-data frameworks |
| **Kinesis** | Process **streaming** (real-time) data |
| **Glue** | Managed **ETL** (extract, transform, load) + data catalogs |
| **QuickSight** | **Business intelligence / dashboards** |
| **MSK** | Managed Kafka streaming |

> **Exam tip:** "Queries on data sitting in S3" → Athena. "Real-time streams from IoT/apps" → Kinesis. "ETL prep" → Glue. "Dashboards to visualize" → QuickSight.`,
    },
    {
      name: "Application Integration & Modern Apps",
      minutes: 10,
      intro: "SQS, SNS, EventBridge, Step Functions, and IoT.",
      content: `### Decoupling with message services (exam favorite)

| Service | What it does | Analogy |
|---------|--------------|---------|
| **Amazon SQS** (Simple Queue Service) | **Queue messages** between components | A message queue / buffer |
| **Amazon SNS** (Simple Notification Service) | **Publish messages** to many subscribers | A broadcasting megaphone |
| **Amazon EventBridge** | Event **router** connecting sources to targets | City bus system for events |

### When to use which

- **SQS** — you want to **decouple** app components; one service adds work to a queue, another consumes it (handles spikes, slows down processing)
- **SNS** — **fan-out notifications** to many subscribers: email, SMS, Lambda, SQS (e.g. "tell everyone when a new video is uploaded")
- **EventBridge** — **event-driven** applications reacting to state changes / scheduled events (e.g. "start a job when an S3 event fires")

> **Exam tip:** "Decouple / buffer requests with a queue" → **SQS**. "Notify many people/services at once" → **SNS**. "React to events across services" → **EventBridge**.

### AWS Step Functions

- **Orchestrate multiple serverless workflows** (Lambda functions, etc.) in a visual workflow
- **Best for:** multi-step processes with branching, retries, and parallel steps

### IoT services (just recognize)

| Service | Purpose |
|---------|---------|
| **AWS IoT Core** | Connect and manage **IoT devices** securely to the cloud |
| **IoT Greengrass** | Run local compute on IoT devices |
| **IoT Device Advisor** | Test IoT devices |

### Containers + serverless recap (module 3 ties together)

- Lamda: event-driven code • API Gateway: API front door
- SQS/SNS/EventBridge: glue between services
- Step Functions: orchestrate workflows

> **Exam tip:** A serverless chain (API Gateway → Lambda → SQS → Lambda → DynamoDB) is the modern-app architecture the exam loves.`,
    },
  ],
}