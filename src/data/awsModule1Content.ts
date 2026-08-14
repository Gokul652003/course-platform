import type { Module } from "../types"

export const awsModule1: Module = {
  id: 1,
  title: "Cloud Concepts & AWS Fundamentals",
  status: "in_progress",
  lessons: [
    {
      name: "Course Overview & Exam Blueprint",
      minutes: 10,
      intro: "Understand the CLF-C02 exam structure, domains, and how to pass.",
      content: `## Welcome to the AWS Certified Cloud Practitioner (CLF-C02) course

This course takes you from **absolute beginner** to **exam-ready** for the AWS Cloud Practitioner certification. Everything you need to know is here — read the modules in order, complete the "Mark complete" on each lesson, and you will cover the full blueprint.

### Exam format at a glance

| Item | Detail |
|------|--------|
| Exam code | CLF-C02 |
| Questions | 65 (50 scored + 15 unscored) |
| Time | 90 minutes |
| Passing score | 700 / 1000 (scaled) |
| Cost | ~100 USD |
| Validity | 3 years |

> **Key fact:** 15 of the 65 questions are unscored pilot questions — you won't know which ones they are, so answer everything. There is no penalty for guessing.

### The 4 content domains

1. **Cloud Concepts (24%)** — what cloud computing is, the value proposition, and deployment models
2. **Security and Compliance (30%)** — shared responsibility, IAM, encryption, compliance programs
3. **Cloud Technology and Services (34%)** — compute, storage, networking, databases, ML
4. **Billing, Pricing, and Support (12%)** — pricing models, cost management, support plans

### How to use this course

- Read every lesson in order — each module maps to a domain
- Take notes on **service names + their one-line use case** (the exam tests "which service fits this business need")
- The biggest mistakes: confusing similar services (e.g. EBS vs EFS vs S3), and forgetting pricing models

### Prerequisites

None. This is a foundational exam — no hands-on AWS experience required. A few hours of AWS Free Tier exploration helps, but reading this course is enough to pass.`,
    },
    {
      name: "What is Cloud Computing?",
      minutes: 10,
      intro: "Definitions, essential characteristics, and the six advantages of cloud.",
      content: `### Definition

Cloud computing is **on-demand delivery of IT resources over the internet with pay-as-you-go pricing**. Instead of buying and owning physical data centers and servers, you rent computing resources from a cloud provider (like AWS) and pay only for what you use.

### Essential characteristics

- **On-demand self-service** — provision resources when you want, without human intervention
- **Broad network access** — resources accessible over the network from many devices
- **Resource pooling** — multiple customers share the same physical infrastructure (multi-tenant)
- **Rapid elasticity** — scale up and down automatically and quickly
- **Measured service** — usage is metered, so you pay for exactly what you consume

### The six advantages of cloud computing (know these!)

1. **Trade capital expense for variable expense** — pay for what you use, not upfront hardware
2. **Benefit from massive economies of scale** — AWS buys in bulk, passing savings to you
3. **Stop guessing capacity** — scale up/down instead of over-provisioning
4. **Increase speed and agility** — new resources are minutes away, not weeks
5. **Stop spending money running and maintaining data centers** — focus on your business
6. **Go global in minutes** — deploy worldwide easily

### Infrastructure as code vs physical servers

With traditional on-premises IT you manage everything: power, cooling, racks, hardware, OS. With cloud, the provider handles the physical layer and you manage what runs on top.

> **Exam tip:** Questions about "no upfront cost," "pay only for what you use," and "no need to maintain physical servers" all point to cloud computing benefits.`,
    },
    {
      name: "Service Models: IaaS, PaaS, SaaS",
      minutes: 10,
      intro: "The three cloud service models and what the provider vs customer manages.",
      content: `### The three service models

Cloud services are categorized by **how much of the stack the provider manages**:

| Model | You manage | Provider manages | Example |
|-------|-----------|------------------|---------|
| **IaaS** (Infrastructure as a Service) | OS, apps, data, runtime | Networking, storage, servers, virtualization | EC2, VPC |
| **PaaS** (Platform as a Service) | Applications, data | Everything below (platform + runtime) | Elastic Beanstalk, RDS, Lambda |
| **SaaS** (Software as a Service) | Nothing (just use it) | Everything | WorkMail, Chime, Salesforce |

### IaaS — the building blocks

- Rent raw infrastructure: virtual servers, storage, networks
- Maximum control and flexibility; you patch and configure the OS yourself
- Example: launching an **EC2 instance** and installing your own software

### PaaS — platform, not servers

- The provider manages the platform and runtime
- You deploy code without worrying about the underlying servers
- Example: **AWS Elastic Beanstalk** automatically handles capacity provisioning, load balancing, and scaling for your app

### SaaS — ready to use

- Fully managed software you access over the internet
- No installation, no maintenance, no management
- Example: **Amazon WorkMail** (email) — AWS runs everything

### Managed services

A "managed service" means AWS handles the heavy lifting: patching, backups, scaling, and high availability. Examples: RDS, DynamoDB, S3, Lambda. You focus on your application, not the infrastructure.

> **Exam tip:** Match the model to the question: control → IaaS, platform/runtime → PaaS, ready-to-use app → SaaS.`,
    },
    {
      name: "Deployment Models & AWS Value Proposition",
      minutes: 10,
      intro: "Cloud, on-premises, and hybrid — plus AWS pricing philosophy.",
      content: `### Deployment models

| Model | Description | Example |
|-------|-------------|---------|
| **Cloud** | All resources run in the cloud | A startup running everything on AWS |
| **On-premises** (private cloud) | Resources run in your own data center | A bank with its own servers |
| **Hybrid** | Mix of cloud + on-premises, connected | Cloud for analytics, on-prem for legacy systems |

**Hybrid is the most common in the exam.** Watch for: connecting an on-prem data center to AWS via **VPN or AWS Direct Connect**, or using **AWS Storage Gateway / AWS Outposts** to bridge the two.

### AWS value proposition

- **Pay-as-you-go** — pay only for what you use, no upfront commitments
- **Save when you commit** — use **Reserved Instances** and **Savings Plans** for predictable workloads
- **Scale as you go** — elasticity means you match supply to demand automatically
- **Stop spending money on data centers** — no capital expense (capex), only operating expense (opex)
- **Go global in minutes** — deploy in multiple regions worldwide

### Capex vs Opex

- **Capital expenditure (capex)**: upfront, long-term spending on physical assets (buying servers)
- **Operational expenditure (opex)**: ongoing variable costs for services you use (renting from AWS)

Cloud moves IT from **capex to opex** — a key exam concept.

> **Exam tip:** "Trade capital expense for variable expense" and "pay only for what you use" are almost always correct answers on cloud-benefit questions.`,
    },
  ],
}
