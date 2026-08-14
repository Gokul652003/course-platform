import type { Module } from "../types"

export const awsModule3: Module = {
  id: 3,
  title: "Compute Services",
  status: "upcoming",
  lessons: [
    {
      name: "Amazon EC2: The Core Compute Service",
      minutes: 12,
      intro: "Virtual servers in the cloud: AMIs, instance types, scaling, and security groups.",
      content: `### What is EC2?

**Amazon Elastic Compute Cloud (EC2)** provides secure, resizable virtual servers — **instances** — in the cloud. You pick an operating system, instance size, and networking, and you're billed per second while running.

### Components you configure

- **AMI** (Amazon Machine Image) — the template: OS + software (e.g. Amazon Linux, Ubuntu, Windows)
- **Instance type** — CPU, memory, storage, network capacity (e.g. t3.micro, m5.large)
- **Key pair** — public/private keys for SSH login
- **Security group** — virtual firewall controlling inbound/outbound traffic
- **Storage** — **EBS** volumes for persistent storage, instance store for temporary
- **Elastic IP** — a static public IPv4 address you can attach

### Instance families (what the letters mean)

| Letter | Optimized for |
|--------|---------------|
| t / m | General purpose (balanced) |
| c | Compute (CPU-intensive) |
| r / x | Memory (RAM-intensive, databases) |
| g / p | GPU (graphics, ML training) |
| h / i / d | Storage (high disk I/O) |

### Scaling EC2

- **Vertical scaling** — larger/smaller instance type
- **Horizontal scaling** — more/fewer instances (via **Auto Scaling** or a load balancer)
- **Auto Scaling groups** maintain desired instance count, scale on load, and replace unhealthy instances
- **Elastic Load Balancing (ELB)** distributes traffic across healthy instances

### Availability & pricing reminders

- For high availability, run instances across **multiple AZs**
- Reserved capacity for steady workloads lowers cost

> **Exam tip:** "You want a virtual server, full control over the OS" → **EC2**. Heavy CPU workloads → **compute-optimized** instance types.`,
    },
    {
      name: "EC2 Pricing Models",
      minutes: 12,
      intro: "On-Demand, Spot, Reserved, Dedicated Hosts, and Savings Plans — the #1 pricing topic.",
      content: `### On-Demand

- Pay for compute **per second** with no upfront commitment
- No long-term contracts; scale up/down freely
- **Best for:** irregular, unpredictable, short-term workloads; testing and development

### Reserved Instances (RIs)

- Commit to an instance for **1 or 3 years** → up to 75% discount vs On-Demand
- Options: **Standard** (biggest discount, cannot change), **Convertible** (can change instance family), **Scheduled**
- **Best for:** predictable, steady-state workloads and databases

### Savings Plans

- Commit to a consistent **amount of compute usage** ($/hour) for 1 or 3 years
- More flexible than RIs — automatically applies to EC2, Lambda, and Fargate usage
- **Best for:** steady, predictable usage across services

### Spot Instances

- Bid on spare EC2 capacity → up to **90% discount**
- AWS can reclaim the instance with **2 minutes warning** if capacity is needed
- **Best for:** fault-tolerant, flexible, stateless workloads — batch jobs, data processing, CI/CD, rendering (NOT for databases or critical always-on apps)

### Dedicated Hosts & Dedicated Instances

- A physical server dedicated to you
- **Best for:** licensing or compliance requirements (bring-your-own-license, BYOL)

### How to choose (exam favorites)

- "Unpredictable workload, no commitment" → **On-Demand**
- "Steady predictable workload for 3 years, biggest discount" → **Reserved / Savings Plan**
- "Fault-tolerant batch processing, want to save the most" → **Spot**
- "Workload that can be interrupted, huge savings" → **Spot**

> **Exam tip:** "Critical, cannot be interrupted" is the classic *why NOT spot* clue. "Can be interrupted / fault-tolerant" is the *why spot* clue.`,
    },
    {
      name: "AWS Lambda: Serverless Compute",
      minutes: 10,
      intro: "Run code without managing servers — events, invocations, and trade-offs.",
      content: `### What is Lambda?

**AWS Lambda** lets you run code **without provisioning or managing servers**. You upload your code, define a trigger, and AWS runs it whenever the trigger fires.

- You are billed only for **the time your code actually runs** (per invocation + compute time)
- Scaling is automatic — Lambda runs your function in response to each trigger, in parallel
- A Lambda function runs **stateless**: it doesn't keep state between invocations

### Event sources (triggers)

- S3 (e.g. run when a file is uploaded)
- DynamoDB (e.g. process on table updates)
- API Gateway (e.g. a REST API endpoint calls the function)
- CloudWatch Events / EventBridge (scheduled or event-driven)
- SQS / SNS messages

### The simplest serverless architecture

\`\`\`text
User → API Gateway → Lambda → DynamoDB / S3
\`\`\`

This pattern appears constantly in the exam: an API, a compute layer with zero servers to manage, and managed storage/database.

### Lambda trade-offs & limits to know

- Great for short-running tasks (default timeout 3 min, max 15 min)
- Not the right fit for long-running processes or heavy compute that runs continuously
- No OS access — you can't SSH into a Lambda

### Serverless vs contained ways to run code — quick comparison

| Need | Service |
|------|---------|
| Virtual server, full OS control | EC2 |
| Run code per event, no servers | Lambda |
| Run containers | ECS / EKS / Fargate |
| Managed platform for web apps | Elastic Beanstalk |

> **Exam tip:** "No servers to manage," "pay per invocation," "triggered by events," "scales automatically" → **Lambda**.`,
    },
    {
      name: "Containers, Platform Services & Other Compute",
      minutes: 12,
      intro: "ECS, EKS, Fargate, ECR, Elastic Beanstalk, and more compute options.",
      content: `### Containers on AWS

| Service | What it is |
|---------|-----------|
| **ECS** (Elastic Container Service) | Run Docker containers, AWS's own container orchestration |
| **EKS** (Elastic Kubernetes Service) | Run Kubernetes clusters on AWS |
| **ECR** (Elastic Container Registry) | Store and manage container images (like Docker Hub on AWS) |
| **Fargate** | Run containers **without managing servers** (serverless containers) |

- **ECS** & **EKS** give you the orchestration platform
- **Fargate** removes the need to manage EC2 nodes underneath either of them

### Amazon Elastic Beanstalk

- A **PaaS** that automatically handles **capacity provisioning, load balancing, auto scaling, and application health monitoring**
- You upload your code and Elastic Beanstalk deploys and manages the environment
- **Best for:** developers who want a managed platform without deep ops knowledge

### Other compute services to recognize

- **Amazon Lightsail** — simple, cheap virtual private servers for beginners (fixed, predictable pricing)
- **AWS Batch** — run batch computing jobs at scale, fully managed
- **AWS Outposts** — run AWS services **in your own data center** (hybrid)
- **VMware Cloud on AWS** — run VMware workloads on AWS hardware
- **AWS Local Zones / Wavelength** — low-latency compute close to users / 5G

### Comparing to the exam

| Scenario | Correct service |
|----------|----------------|
| Deploy a web app, don't want to manage infrastructure at all | Elastic Beanstalk (PaaS) |
| Run Docker containers without managing EC2 | **Fargate** / ECS |
| Manage Kubernetes yourself but on AWS | EKS |
| Store container images | ECR |
| Simple predictable VPS for a small project | Lightsail |

> **Exam tip:** Two-layer trick: "run containers" → ECS/EKS; "run containers *without managing servers*" → **Fargate** (serverless).`,
    },
  ],
}