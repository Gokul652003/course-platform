import type { Module } from "../types"

export const awsModule10: Module = {
  id: 10,
  title: "Support Plans & Account Management",
  status: "upcoming",
  lessons: [
    {
      name: "AWS Support Plans",
      minutes: 12,
      intro: "Basic, Developer, Business, Enterprise On-Ramp, and Enterprise — know the differences.",
      content: `### The five support plans (exam favorite!)

| Plan | Response time | Key features |
|------|---------------|--------------|
| **Basic** | None (no tech support) | Free; Trusted Advisor (7 checks), health status, docs |
| **Developer** | 24 hrs (business-hours email) | Tech support on development/cloud best practices |
| **Business** | 1 hr | 24/7 support, Trusted Advisor (full set), **AWS Support API**, third-party integration |
| **Enterprise On-Ramp** | 1 hr | Added **Technical Account Manager (TAM)** and 15-min critical response |
| **Enterprise** | **15 minutes** | **Dedicated TAM**, **Concierge support team**, **Support Concierge**, Well-Architected reviews, 15-minute critical response |

### Who needs what

- **Basic (free)** — included with every account
- **Developer** — smaller teams needing help with building/testing
- **Business** — production workloads needing 24/7 support
- **Enterprise On-Ramp/Enterprise** — mission-critical / regulated industries needing a **TAM**

### Right-fit questions in the exam

- "24/7 phone/chat support" → **Business or above**
- "Want best practices, slow response is fine, budget small" → **Developer**
- "Critical production issues responded in < 1 hour" → **Business, Enterprise On-Ramp, or Enterprise**
- "15-minute critical response + dedicated Technical Account Manager" → **Enterprise**
- "They want a named account manager to guide their cloud journey" → **Enterprise (TAM)**
- "Want to build a Well-Architected review and design reviews" → **Enterprise**

> **Exam tip:** The differentiator is **response time** and **TAM**. Enterprise = 15 min + TAM. Enterprise On-Ramp = TAM but 1-hr (upgraded) responses.

### AWS Trusted Advisor (mentioned in plans)

- Reviews your AWS resources and gives **best-practice recommendations** in 5 categories:
  1. **Cost optimization**
  2. **Performance**
  3. **Security**
  4. **Fault tolerance**
  5. **Service limits**
- **Basic plan**: only 7 core checks • **Business+**: full set of checks + AWS Support API

> **Exam tip:** "Recommendations to save money / improve security / follow best practices" → **Trusted Advisor**.`,
    },
    {
      name: "AWS Organizations, Control Tower & Account Governance",
      minutes: 12,
      intro: "Managing many AWS accounts: Organizations, OU, Service Control Policies, Control Tower.",
      content: `### AWS Organizations

- Lets you **centrally govern multiple AWS accounts**
- Provides **consolidated billing**, **Service Control Policies (SCPs)**, and **Organizational Units (OUs)**
- **Organizational units (OUs)** — group accounts logically (e.g. "Dev", "Prod", "Security")

### Service Control Policies (SCPs)

- Control **which AWS services/actions are allowed** at the account level
- **Applied to accounts via OUs**
- SCPs affect every user/role in the account (even root) — they set a **guardrail**, not a grant

### AWS Control Tower

- A **setup and governance service** that builds a multi-account environment on best practices
- Automates account provisioning with **blueprints** and **guardrails**
- **Best for:** companies standardizing how accounts are created and governed

### Organization vs Control Tower (quick)

| | AWS Organizations | AWS Control Tower |
|---|-------------------|-------------------|
| What | Manage accounts, billing, SCPs | Launches a governed multi-account environment |
| Guardrails | Manual (you create SCPs) | Automated (pre-built best-practice guardrails) |

### Account structure best practice

Designate accounts by purpose: Management (payer), Security, Logging, Sandbox, Dev, Prod. Use tags to organize resources.

> **Exam tip:** "Centrally manage several accounts / policies across them" → **AWS Organizations**. "Pre-built, automated multi-account governance" → **Control Tower**.`,
    },
    {
      name: "Monitoring: CloudWatch & CloudTrail",
      minutes: 12,
      intro: "CloudWatch (metrics/alarms/logs) and CloudTrail (API audit) — the visibility duo.",
      content: `### Amazon CloudWatch

**Monitoring service** for AWS resources and applications:

- **CloudWatch Metrics** — collect and track metrics (CPU, network, disk) with time-series data
- **CloudWatch Alarms** — when a metric crosses a threshold, trigger an action (e.g. auto-scaling or SNS notification)
- **CloudWatch Logs** — central place to store and view log data (and query with **CloudWatch Logs Insights**)
- **CloudWatch Dashboards** — visualize metrics in one view
- **CloudWatch Events / EventBridge** — react to state changes or schedule events
- **CloudWatch billing alarms** — alert when your estimated bill exceeds a threshold

> **Exam tip:** "Track CPU utilization of EC2" → CloudWatch metrics. "Be alerted when CPU > 80%" → CloudWatch **Alarm**. "Check application logs in one place" → CloudWatch **Logs**.

### AWS CloudTrail

- **Audits API activity** — records **who** did **what**, **when**, wherever (calls in the Console, SDK, CLI)
- Provides an **audit log** of read and write activity on your resources
- **Default ON** (last 90 days of events in the console) for auditing
- **Best for:** security investigations, compliance, troubleshooting "who changed what?"

> **Exam tip:** Monitoring = CloudWatch. Auditing who made changes / API calls = **CloudTrail**. "Enable logging of API calls for compliance" → CloudTrail.

### CloudWatch vs CloudTrail quick

| | CloudWatch | CloudTrail |
|---|-----------|-----------|
| Watches | Resource **health & performance** (metrics, logs, alarms) | **API activity** (who did what) |
| Data | CPU, memory, logs, events | Record of API calls |
| Question it answers | "Is the app healthy?" | "Who changed that security group?" |

> **Exam tip:** "Monitoring performance" → CloudWatch. "Auditing changes / API calls for compliance" → CloudTrail.`,
    },
    {
      name: "Infrastructure as Code & Management Tools",
      minutes: 10,
      intro: "CloudFormation, Systems Manager, Service Catalog, and tags.",
      content: `### AWS CloudFormation (Infrastructure as Code)

- **Describes your infrastructure in JSON/YAML templates** and provisions it consistently
- Enables **Infrastructure as Code**: repeatable, versionable, no click-through
- Roll back changes if deployment fails
- **Best for:** teams wanting consistent, automated environment creation

> **Exam tip:** "Create environments from templates / repeatable infrastructure" → **CloudFormation**. This is the CDK cousin too: AWS CDK writes templates in programming languages.

### AWS Elastic Beanstalk vs CloudFormation (compare)

- **Elastic Beanstalk** — PaaS for your app; AWS manages deployment details
- **CloudFormation** — general IaC tool for ANY AWS resources

### AWS Systems Manager (SSM)

- **Centralized operations hub** for patching, running commands, and managing instances
- **Parameter Store** — store config parameters & secrets
- Includes **Session Manager** (SSH access without opening ports) and patch automation

### AWS Service Catalog

- **Catalog of approved products** (e.g. standardized CloudFormation templates) that end users can self-provision
- **Governance**: admins decide what resources users can deploy

### Tagging & resource groups

- **Tags** — key-value labels on resources (\`Env=Prod\`, \`CostCenter=TeamA\`)
- Used for: **cost allocation**, filtering, automation
- **Resource Groups** — group tagged resources to manage them together

> **Exam tip:** Cost allocation by team → **tag resources**. Standardized service with governance → **Service Catalog**. Command center for patching → **Systems Manager**.`,
    },
  ],
}