import type { Module } from "../types"

export const awsModule9: Module = {
  id: 9,
  title: "Billing, Pricing & Cost Management",
  status: "upcoming",
  lessons: [
    {
      name: "AWS Pricing Fundamentals",
      minutes: 12,
      intro: "Pay-as-you-go, free tier, consolidated billing, and the pricing calculator.",
      content: `### Core AWS pricing concepts

- **Pay-as-you-go** — pay only for what you use, no upfront commitments
- **Save when you commit** — Reserved Instances / Savings Plans for predictable use
- **Pay less by using more** — volume discounts as usage grows
- **Free Tier** — free usage up to limits for new customers (e.g. 750 hours of EC2/month, 5 GB S3)

### Why is Cloud cheaper? (TCO)

Total Cost of Ownership comparing on-prem vs AWS:
- No data center costs (power, cooling, staff, hardware)
- No over-provisioning waste
- Opex vs capex
- **AWS Pricing Calculator** (fka TCO calculator) — estimate your monthly AWS bill

### Consolidated Billing (AWS Organizations)

- One paying account (payer) aggregates bills for all member accounts
- Benefits:
  - **Single bill** for all accounts
  - **Volume discounts** — usage across accounts combined
  - **Free-tier aggregation** — free tier shared across accounts
- Great for separating environments (dev/test/prod) while keeping one bill

### AWS Budgets & cost alerts

- **AWS Budgets** — set custom cost and usage budgets; get alerts when you exceed thresholds
- **AWS Budget Actions** — automatically take action (e.g. stop EC2) when budget exceeded

### AWS Cost Explorer

- Visualize, understand, and manage your **costs and usage over time**
- Forecast future spend, break down by service/account/tag
- See reserved/savings plan savings

> **Exam tip:** "See and forecast my spending by service" → **Cost Explorer**. "Set a spending limit with alerts" → **AWS Budgets**. "One bill for many accounts / volume discounts" → **Consolidated billing**.

### AWS Cost & Usage Report (CUR)

- The most detailed billing data (line items), used for deep analysis
- Can be delivered to S3 and queried

> **Exam tip:** "Very detailed / itemized billing data for analysis" → **Cost & Usage Report**.`,
    },
    {
      name: "Pricing Examples & Saving Strategies",
      minutes: 10,
      intro: "How EC2, S3, Lambda, and storage are priced — plus money-saving strategies.",
      content: `### How AWS prices each type of resource

| Resource | Priced by |
|----------|-----------|
| **EC2** | Instance type (size), **running time** (per second), data transfer |
| **S3** | **Storage amount**, number of requests, data transfer, retrieval (for IA/Glacier) |
| **Lambda** | **Number of requests** + compute time |
| **EBS** | **Provisioned** GB/month (you pay whether you use it or not) |
| **EFS** | **Used** storage (they meter actual usage) |
| **RDS** | Instance class + storage + IOPS |
| **DynamoDB** | Provisioned capacity OR on-demand requests |

> **Exam tip:** "Pay less for storage you don't use" is why EFS (pay for used) vs EBS (pay for provisioned) matters. "Right-size instances" = pick the correct size.

### Saving money strategies (exam favorites)

1. **Use Spot Instances** for fault-tolerant, flexible workloads (up to 90% off)
2. **Use Reserved / Savings Plans** for steady predictable workloads
3. **Stop/terminate unused instances** and **right-size** (instance type matches workload)
4. Use **storage lifecycle policies** — move old S3 data to IA/Glacier
5. Move infrequent data to **lower storage classes**
6. **Consolidated billing** for volume discounts
7. Use **S3 Transfer Acceleration / CloudFront** can *reduce* transfer costs in some cases

### Pricing models in practice

- **On-Demand:** flexible, but highest per-unit price — for unpredictable work
- **Reserved/Savings:** up to 75% discount — for 24/7 workloads
- **Spot:** up to 90% discount — but can be interrupted

### Which is cheapest? (quick sanity answers)

- "Cheapest for long-term archival" → **Glacier Deep Archive**
- "Cheapest for flexible batch compute" → **Spot**
- "Cheapest for a 24/7 web server you'll keep for 3 years" → **Reserved / Savings Plan**

> **Exam tip:** The savings questions combine pricing model 🡒 service. Match the workload's predictability (steady → committed; unpredictable → on-demand; interruptible → spot).`,
    },
    {
      name: "AWS Free Tier & Billing Resources",
      minutes: 8,
      intro: "Free tier limits, billing dashboard, invoices, and marketplace.",
      content: `### AWS Free Tier

Three types:

| Type | What it is |
|------|-----------|
| **Always Free** | Free forever within limits (e.g. some Lambda calls, DynamoDB 25 GB) |
| **12 Months Free** | Free for the first 12 months after signup (e.g. 750 hours EC2/month, 5 GB S3) |
| **Trials** | Short free trials of paid services |

### The exam cares that you know free tier exists — and its limits cause surprise bills if exceeded.

### Billing & cost management resources

| Resource | Purpose |
|----------|---------|
| **AWS Billing Dashboard** | View current month's spend, forecast |
| **Cost Explorer** | Analyze/forecast cost and usage by service/account |
| **AWS Budgets** | Set thresholds with alerts |
| **AWS Cost & Usage Report** | Most detailed billing data |
| **Invoices** | Download monthly invoices |
| **AWS Cost Anomaly Detection** | Detect unusual spending automatically (ML) |

### AWS Marketplace

- A **digital catalog of third-party software** and services that run on AWS (AMIs, SaaS, data products)
- You can buy pre-configured solutions; costs appear on your AWS bill
- **Best for:** "I want a ready-made third-party solution on AWS"

### Tax & support

- AWS charges applicable **taxes** on your invoice
- Pricing is per-region and can vary worldwide

> **Exam tip:** Third-party software listed on AWS → **AWS Marketplace**. Unusual spending detection → **Cost Anomaly Detection**.`,
    },
    {
      name: "Practice: Billing & Pricing Scenarios",
      minutes: 8,
      intro: "Self-check questions to lock in the pricing fundamentals.",
      content: `### Billing checkpoint

**1.** A company wants a single monthly bill for 10 AWS accounts while sharing volume discounts. What should they use?
- (a) Separate credit cards per account
- (b) **AWS Organizations with consolidated billing**
- (c) Cost Explorer
- (d) AWS Artifact

> **Answer: (b).** Consolidated billing aggregates usage → one bill + volume discounts.

**2.** An application run for a critical 24/7 production database for the next 3 years. Cheapest but reliable option?
- (a) Spot Instances
- (b) **Reserved Instances / Savings Plans**
- (c) On-Demand only
- (d) Fargate only

> **Answer: (b).** Steady predictable usage → committed pricing saves ~75%.

**3.** A batch job that can be interrupted anytime wants the absolute lowest cost for EC2. Which?
- (a) On-Demand
- (b) Reserved
- (c) **Spot**
- (d) Dedicated Hosts

> **Answer: (c).** Spot = biggest discount for interruptible, fault-tolerant workloads.

**4.** Where do you see which services made up last month's spend and forecast next month?
- (a) AWS Budgets
- (b) **AWS Cost Explorer**
- (c) AWS Artifact
- (d) AWS Config

> **Answer: (b).** Analyze/forecast → Cost Explorer. Budgets = alerts on thresholds.

**5.** Data you must archive for 7 years, accessed maybe twice, at the lowest possible cost. Which?
- (a) S3 Standard
- (b) EBS gp3
- (c) **S3 Glacier Deep Archive**
- (d) EFS

> **Answer: (c).** Long-term archive, rarely accessed, cheapest → Deep Archive.

> **Exam tip:** Watch for words like "cheapest", "never used", "can be interrupted", "24/7 for years" — each maps to one pricing answer.`,
    },
  ],
}