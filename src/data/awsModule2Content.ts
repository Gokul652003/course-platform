import type { Module } from "../types"

export const awsModule2: Module = {
  id: 2,
  title: "AWS Global Infrastructure & Access",
  status: "upcoming",
  lessons: [
    {
      name: "Regions, Availability Zones & Edge Locations",
      minutes: 10,
      intro: "AWS's worldwide backbone: regions, AZs, and edge locations.",
      content: `### Regions

A **Region** is a geographical area with multiple physical data centers, connected by low-latency networks. Examples: us-east-1 (N. Virginia), eu-west-1 (Ireland), ap-south-1 (Mumbai).

When choosing a region, consider:
- **Compliance** — some data must stay in a country (e.g. GDPR)
- **Latency** — pick the closest region to your users
- **Pricing** — costs vary by region
- **Service availability** — not every service exists in every region

> **Exam tip:** "Data sovereignty" / "must be processed in a specific country" → choose a Region, not an AZ.

### Availability Zones (AZs)

Each Region has **multiple AZs** (typically 3, minimum 2). An **Availability Zone** is one or more data centers with independent power, cooling, and networking, isolated from failures in other AZs.

- Deploying across **multiple AZs** = high availability and fault tolerance
- 3 data centers (DCs) in one AZ still = only 1 AZ (no protection against AZ failure)

### Edge Locations & Points of Presence (PoPs)

- **Edge locations** are small sites used for content caching by **CloudFront** (CDN) — they speed up delivery to end users by caching content closer to them
- **Regional edge caches** sit between edge locations and the origin
- Edge locations are **not** Regions or AZs — they only serve cached content

### Services vs infrastructure

Region-scoped: VPC, S3 (in a region), RDS. Global services: **IAM**, **Route 53**, **CloudFront**, **WAF**, **Shield**.

> **Exam tip:** High availability = use **multiple AZs**. Low latency worldwide = use **CloudFront edge locations**.`,
    },
    {
      name: "How to Access AWS",
      minutes: 8,
      intro: "Management Console, CLI, and SDKs — and how to choose.",
      content: `### Three ways to interact with AWS

| Method | What it is | Best for |
|--------|-----------|----------|
| **Management Console** | Web-based GUI | Manual tasks, exploring services |
| **AWS CLI** (Command Line Interface) | Terminal commands | Automating repetitive tasks, scripting |
| **SDKs** (Software Development Kits) | Code libraries for many languages | Building applications that use AWS |

### Management Console

- Browser interface at aws.amazon.com/console
- Great for one-off tasks and learning
- **AWS Console Mobile Application** lets you monitor resources from your phone

### AWS CLI

- Open-source tool that allows you to interact with AWS services from your terminal
- Automates everything in the console — everything you can do in the console you can do with the CLI (and more)
- **AWS CloudShell** is a browser-based shell with the CLI pre-installed

### SDKs & the AWS API

- All AWS services are built on RESTful APIs
- **SDKs** wrap these APIs in languages: Python (boto3), JS, Java, Go, etc.
- **AWS Tools for PowerShell** for PowerShell users

### Cloud9

**AWS Cloud9** is a cloud-based IDE that lets you write, run, and debug code in the browser — good to know for the exam's "developer environment" questions.

> **Exam tip:** "Automate tasks from the command line" → AWS CLI. "Build an application using AWS services" → SDKs. "One-off manual task" → Console.`,
    },
    {
      name: "Serverless & Managed Services",
      minutes: 8,
      intro: "Serverless computing, containers vs VMs, and the AWS ecosystem.",
      content: `### What is serverless?

**Serverless** means you don't manage, provision, or scale servers at all. AWS runs and scales the infrastructure transparently; you only pay per invocation/request. You still run on servers, you just don't see or manage them.

- Example: **AWS Lambda** — run your code in response to events, pay per request and compute time
- Serverless extends farther: **S3**, **DynamoDB**, **API Gateway**, **Fargate**

### Containers vs virtual machines

| | Virtual machines | Containers |
|---|------------------|------------|
| Virtualization | The hypervisor virtualizes hardware | The OS kernel isolates processes |
| Size | GBs, heavy | MBs, lightweight |
| Boot time | Minutes | Seconds |
| Portability | Tied to a hypervisor | Run anywhere with a container runtime |

**Docker** is the most common container tool. AWS container services: **ECS**, **EKS**, **Fargate**, with image storage in **ECR**.

### The "correct service for the job" theme

If you remember nothing else from the exam, remember this: **CLF-C02 asks you to match business needs to AWS services.** For every service in this course, learn:
1. Its category (compute, storage, database, security, management)
2. One sentence describing what it does
3. When you'd choose it over a similar service

> **Exam tip:** Serverless patterns (Lambda + API Gateway + DynamoDB + S3) are a popular scenario — AWS manages scaling, so your app scales automatically with zero server management.`,
    },
    {
      name: "Practice: Which Service Fits?",
      minutes: 8,
      intro: "A self-check to reinforce Regions, AZs, access, and serverless.",
      content: `### Checkpoint questions

Read each scenario and pick the correct answer before checking below.

**1.** A company must keep customer data within India for legal compliance. What should they use?
- (a) A specific Availability Zone in ap-south-1
- (b) An edge location in India
- (c) The ap-south-1 (Mumbai) **Region**
- (d) A global edge cache

> **Answer: (c).** Compliance about *where* data lives → choose a Region.

**2.** A developer wants to guarantee their application survives the failure of an entire data center. What's the best design?
- (a) Run one instance in a single AZ
- (b) Run instances across **multiple AZs** in the same Region
- (c) Use one giant EC2 instance
- (d) Cache content at edge locations

> **Answer: (b).** Multi-AZ deployment = fault tolerance against data-center failure.

**3.** An admin wants to script and automate EC2 instance creation from the terminal. What tool?
- (a) AWS Management Console
- (b) **AWS CLI**
- (c) AWS Cloud9 only
- (d) Route 53

> **Answer: (b).** Command-line automation → AWS CLI.

**4.** An app runs code only when a file is uploaded to S3, with no servers to manage. Which service?
- (a) EC2
- (b) **Lambda**
- (c) Elastic Beanstalk
- (d) VPC

> **Answer: (b).** Event-driven, no servers → serverless Lambda.

**5.** Content like images/videos should load fast for users worldwide. What's the best fit?
- (a) Deploy the website in one Region only
- (b) **CloudFront** edge locations
- (c) S3 Glacier
- (d) A bigger EC2 instance

> **Answer: (b).** Edge locations cache content closer to users for low latency.

> **Exam tip:** Always read the phrase "quickly", "cheaply", "automatically", "worldwide", "no maintenance" — they anchor the right answer.`,
    },
  ],
}