import type { Module } from "../types"

export const awsModule8: Module = {
  id: 8,
  title: "AWS Security Services",
  status: "upcoming",
  lessons: [
    {
      name: "Network Protection: WAF, Shield & Firewalls",
      minutes: 10,
      intro: "WAF, Shield, and how web traffic is protected at the edge.",
      content: `### AWS WAF (Web Application Firewall)

Protects web applications from **common web exploits**:
- **SQL injection** (malicious SQL in input)
- **Cross-site scripting (XSS)**
- Rate-based rules (block IPs making too many requests)

Works together with **CloudFront**, **Application Load Balancer**, and **API Gateway**.

### AWS Shield

DDoS protection **always on** and automatic:

| Tier | Cost | What you get |
|------|------|--------------|
| **Shield Standard** | Free | Basic DDoS protection for all AWS customers |
| **Shield Advanced** | Paid | Enhanced DDoS protection, 24/7 response support, cost protection |

### Comparison (exam favorite)

- "Block SQL injection / web exploits at the app layer" → **WAF**
- "Distributed Denial of Service attack protection" → **Shield** (Advanced for enhanced)
- Both are often deployed together (WAF + Shield + CloudFront)

### Also security-related networking

- **Security Groups** — instance-level stateful firewall (allow rules)
- **Network ACLs** — subnet-level stateless firewall

> **Exam tip:** WAF = application layer (SQLi, XSS). Shield = network layer (DDoS). Confusing these is a common trap.`,
    },
    {
      name: "Detection & Inspection Services",
      minutes: 10,
      intro: "GuardDuty, Inspector, Macie, Config, and Security Hub.",
      content: `### Amazon GuardDuty

- **Continuous threat detection** service
- Uses ML + threat intelligence to identify suspicious activity: unusual API calls, compromised instances, crypto-mining, malicious IPs
- Monitors **VPC Flow Logs, CloudTrail logs, and DNS logs**
- Produces **findings** you can act on

### Amazon Inspector

- **Automated vulnerability scanning** of your instances and containers
- Checks for **software vulnerabilities** and **network exposure** (CVEs)
- Runs **security assessments**

### Amazon Macie

- Uses ML to **discover and protect** sensitive data in **S3**
- Detects **personally identifiable information (PII)** and alerts you

### AWS Config

- **Records resource configuration** changes over time
- Enables **compliance rules** and auditing of config history (e.g. "S3 buckets must be private")
- Answers "what changed and when?" — governance

### AWS Security Hub

- A **single dashboard** aggregating security findings from GuardDuty, Inspector, Macie, and more
- Central view of your security posture across accounts

### The detection toolkit — quick table

| Service | Primary job |
|---------|------------|
| GuardDuty | Threat detection (unusual activity) |
| Inspector | Vulnerability scanning |
| Macie | Sensitive data / PII detection in S3 |
| Config | Configuration compliance & history |
| Security Hub | Cloud security posture dashboard |

> **Exam tip:** "Detect threats continuously" → GuardDuty. "Find vulnerabilities in your EC2" → Inspector. "Find PII in S3" → Macie. "Resource config compliance" → Config.`,
    },
    {
      name: "Encryption Keys & Secrets: KMS, CloudHSM & Secrets Manager",
      minutes: 10,
      intro: "Key management, hardware security modules, and safe secret storage.",
      content: `### AWS KMS (Key Management Service)

- **Centralized, managed service** to create and control **encryption keys**
- Integrates with many AWS services (EBS, S3, RDS, Lambda) to encrypt data at rest
- Fine-grained control: rotate keys, grant/deny usage
- Pay per key and usage

### AWS CloudHSM

- A **Hardware Security Module** in the cloud — dedicated hardware for key storage
- **Best for:** strict compliance requirements (FIPS) where you must manage keys on dedicated hardware you control
- Differs from KMS: with CloudHSM *you* manage the keys on physical HSM hardware; AWS manages the hardware only

### How KMS encrypts common workloads

\`\`\`text
EBS volume, S3 object, RDS DB → SSE-KMS → encrypted with KMS customer-managed key
\`\`\`

### Storing application secrets

| Service | What |
|---------|------|
| **AWS Secrets Manager** | Securely store, rotate, and retrieve secrets — keys, DB passwords, API keys (supports **automatic rotation**) |
| **AWS Systems Manager (SSM) Parameter Store** | Store parameters and secrets as key-value pairs (configuration + secrets) |

> **Exam tip:** "Rotate database passwords automatically" → **Secrets Manager**. "Variable configuration stored in a key-value store" → **SSM Parameter Store**. "Dedicated hardware for keys / FIPS HSM" → **CloudHSM**.

### Encryption at rest vs in transit (recap)

- **At rest** — KMS, SSE for S3, encrypted EBS volumes
- **In transit** — TLS/SSL (HTTPS), VPN tunnels

> **Exam tip:** KMS = encryption keys. Secrets Manager = secrets + rotation. CloudHSM = dedicated hardware for strict compliance.`,
    },
    {
      name: "Identity, Federation & Access Best Practices",
      minutes: 10,
      intro: "Cognito, SSO, and the security best-practices the exam rewards.",
      content: `### Amazon Cognito

- **Identity service for web/mobile applications** — sign-up, sign-in, and user management
- **User Pools** — user directories and authentication (username/password, social login)
- **Identity Pools** — grant users temporary AWS credentials to access resources
- **Best for:** app developers adding sign-in to their apps, including guest access

### AWS Identity Center (fka AWS SSO)

- **Centrally manage workforce access** across AWS accounts and business applications
- Single sign-on (SSO) for users
- Good for enterprises with many accounts

### IAM vs Cognito vs Identity Center — who's who

| Service | For |
|---------|-----|
| **IAM** | AWS *internal* users/roles/groups (staff) |
| **Cognito** | *Your application's* end users (customers) |
| **Identity Center (SSO)** | Enterprises centralizing access to many AWS accounts |

### Security best practices boiled down (virtually guaranteed questions)

1. **Use IAM roles** — never put access keys on EC2 instances
2. **Least privilege** — grant the minimum permissions needed
3. **Enable MFA** — especially on the root account
4. **Rotate credentials** and audit with **CloudTrail**
5. **Encrypt data at rest and in transit**
6. **Establish a strong password policy** for IAM users

### AWS CloudTrail (you'll see it again in governance)

Records **API activity** in your account — who did what, when. Essential for **auditing** and security investigations.

> **Exam tip:** App users logging into your app → Cognito. Company employees across accounts → Identity Center. AWS staff/roles → IAM. "Audit who did what" → CloudTrail.`,
    },
  ],
}