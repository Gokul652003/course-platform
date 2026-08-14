import type { Module } from "../types"

export const awsModule12: Module = {
  id: 12,
  title: "Exam Day Strategy & Final Review",
  status: "upcoming",
  lessons: [
    {
      name: "Exam Format & Logistics",
      minutes: 8,
      intro: "How the CLF-C02 exam works — question types, time, and delivery options.",
      content: `### Exam day reality check

| Item | Detail |
|------|--------|
| Questions | 65 (50 scored + 15 unscored) |
| Time | 90 minutes |
| Passing | 700 / 1000 scaled |
| Question types | Multiple choice, multiple response, case-style scenario sets |
| Delivery | **Pearson VUE** test center OR **online proctored (OnVUE)** |

### Question types

- **Multiple choice** — one correct answer among four (usually)
- **Multiple response** — select ALL that apply (often 2 of 3, or "select two")
- **Case-type scenario** — a short business scenario, followed by a couple of related questions

### Managing your 90 minutes

- Roughly **1.2 minutes per question** — you have plenty of time
- **Skip and flag hard ones**, answer everything, then review
- Don't spend more than ~2 minutes on a single question on the first pass
- **Never leave a question blank** — there's no penalty for guessing

### Test center vs online

- Online (OnVUE): need a **private room**, webcam, stable internet; proctor scans your space
- Center: arrive 15+ minutes early with valid **government-issued ID**
- Both give the same exam

### What to bring/not bring

- Bring: valid photo ID
- Don't bring: phones, smartwatches, notes, second monitors (online)

> **Exam tip:** The venue rules rarely appear on the exam itself, but knowing the format calms nerves — the actual test is multiple choice + scenario sets only.`,
    },
    {
      name: "Common Question Traps & How to Beat Them",
      minutes: 10,
      intro: "The TOP traps candidates fall for — and the keywords that save you.",
      content: `### Trap 1: Similar service names

- **EBS** (block disk, one instance) vs **EFS** (shared file system) vs **S3** (objects)
- **RDS** (relational) vs **DynamoDB** (NoSQL) vs **Redshift** (warehouse) vs **ElastiCache** (cache)
- **CloudWatch** (metrics/monitoring) vs **CloudTrail** (API audit)

> Kill them with the service's *use case*, not its name.

### Trap 2: Region vs AZ vs Edge

- Compliance / **data residency** → **Region**
- **Fault tolerance** against infrastructure failure → **multiple AZs**
- **Low latency for global users** → **CloudFront edge locations**

### Trap 3: Misreading the pricing scenario

- "24/7 for years, can't change" → Reserved/Savings Plan
- "Can be interrupted" → **Spot**
- "Unpredictable, short" → On-Demand
- "Cheapest archive" → Glacier Deep Archive

### Trap 4: Ignoring qualifiers

Words that change the answer:
- **"No servers to manage"** → serverless (Lambda, Fargate, DynamoDB)
- **"Multiple EC2 instances must share"** → EFS
- **"AWS managed / owner is AWS"** → managed service (RDS engine patching = AWS)

### The elimination method

1. Read the **last line** first (what does it actually ask?)
2. Eliminate answers that are *true facts but irrelevant*
3. Eliminate answers naming **out-of-scope** services for a foundational exam
4. Pick the service whose **one-liner** matches the scenario

### out-of-scope service sanity check

Stick to the big names (EC2, S3, RDS, DynamoDB, Lambda, IAM, CloudFront, Route 53, CloudWatch, CloudTrail, SQS, SNS, Athena, QuickSight, SageMaker, Rekognition, Polly, Lex, Transcribe, Translate, Comprehend, WAF, Shield, KMS, Organizations, etc.). Obscure deep-dive services won't be the right answer.

> **Exam tip:** One line of the question is always the "needle." Find the business need, match the one-liner service, and tell the trap names apart by what each *does*.`,
    },
    {
      name: "Final Knowledge Checklist",
      minutes: 8,
      intro: "Run through every must-know area one last time before you book.",
      content: `### Section 1 — Cloud Concepts (24%)

- [ ] Definition of cloud + 5 essential characteristics
- [ ] 6 advantages of cloud computing (capex→opex etc.)
- [ ] IaaS vs PaaS vs SaaS examples
- [ ] Deployment models: cloud, on-prem, hybrid

### Section 2 — Security & Compliance (30%)

- [ ] Shared responsibility model (of vs in the cloud)
- [ ] IAM: users, groups, roles, policies, root account, MFA, least privilege
- [ ] WAF (SQLi/XSS) vs Shield (DDoS)
- [ ] GuardDuty (threats), Inspector (vulns), Macie (PII in S3), Config (config)
- [ ] KMS vs CloudHSM vs Secrets Manager
- [ ] Encryption at rest vs in transit
- [ ] Compliance: HIPAA, PCI DSS, SOC, GDPR + **AWS Artifact** for reports

### Section 3 — Cloud Technology & Services (34%)

- [ ] Global infra: Regions, AZs, edge locations
- [ ] Access: Console, CLI, SDK; CloudShell
- [ ] Compute: EC2 (AMIs, pricing), Lambda, ECS/EKS/Fargate/ECR, Beanstalk, Lightsail
- [ ] Storage: S3 + classes, EBS, EFS, Instance Store, Glacier, Snow Family, Storage Gateway, Backup
- [ ] Networking: VPC, subnets, IGW, NAT, SG vs NACL, Route 53, CloudFront, VPN/Direct Connect, API Gateway
- [ ] Databases: RDS, Aurora, DynamoDB, Redshift, ElastiCache, Neptune, DocumentDB, Timestream, QLDB
- [ ] ML one-liners: SageMaker, Rekognition, Lex, Polly, Transcribe, Comprehend, Translate, Textract
- [ ] Analytics: Athena, EMR, Kinesis, Glue, QuickSight
- [ ] Integration: SQS, SNS, EventBridge, Step Functions
- [ ] Monitoring: CloudWatch, CloudTrail
- [ ] Well-Architected 6 pillars
- [ ] IaC: CloudFormation; SSM; Service Catalog; tagging

### Section 4 — Billing, Pricing & Support (12%)

- [ ] Pay-as-you-go, Free Tier, consolidated billing
- [ ] EC2 pricing: On-Demand, Reserved, Savings Plans, Spot, Dedicated
- [ ] Cost Explorer, Budgets, Cost & Usage Report, Cost Anomaly Detection, Pricing Calculator
- [ ] 5 support plans + Trusted Advisor + Marketplace

> **Exam tip:** Any checkbox you can't tick confidently → go back to that module. Ticked all 30+? You're ready — book it.`,
    },
    {
      name: "Full-Length Practice Review (50 Questions)", 
      minutes: 60,
      intro: "A guided review pulling one exam-style question from every major topic.",
      content: `### Simulated CLF-C02 practice set

Answer mentally (or on paper) before reading the answer.

**1.** Which advantage of cloud computing lets you stop guessing about capacity?
**a.** Trade capex for variable expense • **b.** **Stop spending money on data centers** — wait, answer: **Rapid elasticity / scale up and down.** *Answer: the ability to right-scale instantly (elasticity).*

**2.** An app needs to RUN in an unpredictable pattern, short-lived, no commitment. Cheapest fitting? → **On-Demand.**

**3.** Which service decouples components by buffering messages between producers and consumers? → **SQS.**

**4.** You need to audit who called which API and when, in your account. → **CloudTrail.**

**5.** A healthcare org stores patient data. Which monitoring helps confirm compliance posture & alerts on PII in S3? → **Macie.**

**6.** Which is cheapest for 7-year-long archival access-never data? → **S3 Glacier Deep Archive.**

**7.** A web app must survive the loss of an entire AZ. Best practice? → **Deploy across multiple AZs.**

**8.** Which service turns recorded customer calls into searchable text? → **Amazon Transcribe.**

**9.** You want the OS (application layer) of your EC2 patched responsibly. Who? → **You (customer).**

**10.** Which routing policy on Route 53 sends users to the lowest-latency region? → **Latency-based routing.**

**11.** A batch processing job that can be interrupted. Lowest cost EC2? → **Spot.**

**12.** What does the shared responsibility model say about physical data center security? → **AWS's responsibility.**

**13.** Store container images. → **ECR.**

**14.** A petabyte data warehouse for SQL analytics. → **Redshift.**

**15.** Serverless relational DB, MySQL-compatible, built for cloud, faster. → **Aurora.**

**16.** A global CDN. → **CloudFront.**

**17.** Block SQL injection attacks. → **WAF.**

**18.** Auto-rotate database credentials. → **Secrets Manager.**

**19.** Run Kubernetes on AWS. → **EKS.**

**20.** Get 15-minute response + a TAM on a support issue. → **Enterprise support plan.**

**21.** A static website with the lowest cost, no servers. → **S3 website hosting.**

**22.** Persistent block storage for a single EC2 instance that survives termination. → **EBS.**

**23.** In-memory caching in front of a database to speed reads. → **ElastiCache.**

**24.** Streaming real-time data processing. → **Kinesis.**

**25.** Graph database for social relationships. → **Neptune.**

**26.** Query data directly in S3 with SQL. → **Athena.**

**27.** Protect a web app from DDoS at the network layer. → **AWS Shield.**

**28.** Central management + consolidated billing for many accounts. → **AWS Organizations.**

**29.** Pre-built governed multi-account setup. → **AWS Control Tower.**

**30.** Infrastructure as Code with templates. → **CloudFormation.**

**31.** Send a notification to thousands of subscribers at once. → **SNS.**

**32.** Build and train custom ML models. → **SageMaker.**

**33.** Text-to-speech. → **Polly.**

**34.** One EC2 instance → file system shared by multiple instances → **EFS.**

**35.** On-prem to AWS, dedicated private connection → **Direct Connect.**

**36.** Cloud security posture summary dashboard → **Security Hub.**

**37.** Detect anomalies in your billing → **Cost Anomaly Detection.**

**38.** Dev user with least privilege – where granted? → **IAM policies.**

**39.** Set a monthly budget cap with alerts → **AWS Budgets.**

**40.** Offline petabyte data migration → **Snowball Edge / Snowmobile.**

**41.** Migration of a database with minimal downtime → **DMS.**

**42.** "Lift and shift" a server as-is → **Rehost.**

**43.** Move old S3 data to cheaper storage automatically → **Lifecycle policies.**

**44.** Mobile app sign-in (customer users) → **Cognito.**

**45.** Session cache / leaderboards in memory → **ElastiCache (Redis).**

**46.** ML personalization recommendations → **Personalize.**

**47.** Capture and view logs centrally → **CloudWatch Logs.**

**48.** Patch and operate instances centrally → **Systems Manager.**

**49.** Run AWS services in YOUR data center (hybrid) → **AWS Outposts.**

**50.** The exam says a pillar about minimizing waste/cost → **Cost Optimization pillar.**

### Score yourself

- **45–50 correct:** book the exam — you're ready.
- **35–44:** review your missed domains via the checklist.
- **Below 35:** redo the relevant modules and retake this set.

> **Exam tip:** Speed tip — when you see a red herring service name you don't fully recall, re-read the business need in the last sentence and match it to the one-liner table in Module 11.`,
    },
  ],
}