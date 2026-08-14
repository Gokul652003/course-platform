import type { Module } from "../types"

export const awsModule5: Module = {
  id: 5,
  title: "Networking & Content Delivery",
  status: "upcoming",
  lessons: [
    {
      name: "Amazon VPC & Subnets",
      minutes: 12,
      intro: "Your private network in the cloud: subnets, gateways, and route tables.",
      content: `### What is a VPC?

**Amazon Virtual Private Cloud (VPC)** is a **virtual network dedicated to your AWS account** in a region. You control IP addresses, subnets, route tables, and gateways — it's like your own data center inside AWS.

### Key building blocks

- **Subnets** — segments of the VPC's IP range in a single **AZ**
  - **Public subnet** — has a route to the internet (via Internet Gateway)
  - **Private subnet** — no direct internet route
- **Internet Gateway (IGW)** — the "door" allowing public internet traffic in/out of the VPC
- **Route table** — rules that decide where network traffic goes
- **NAT Gateway** — lets instances in a **private** subnet reach the internet *outbound* (e.g. to download updates) while staying unreachable from the internet
- **VPC Peering** — connect two VPCs privately

### Multi-AZ for availability

A VPC spans the whole region; **subnets are per-AZ**. Putting the same app in subnets in different AZs gives you high availability.

### Security groups vs NACLs (know this!)

| | Security Group | Network ACL |
|---|----------------|-------------|
| Level | **Instance** level (virtual firewall around the instance) | **Subnet** level |
| Rules | **Allow only** (default deny, add allows) | Allow AND deny |
| State | **Stateful** — return traffic auto-allowed | **Stateless** — return traffic must be explicitly allowed |

> **Exam tip:** Default security group denies all inbound; you add allow rules. A security group is *stateful*; a network ACL is *stateless*. "Allow all traffic from another security group" — default SG of the instance.

### VPN & Direct Connect (on-prem to AWS)

- **AWS Site-to-Site VPN** — encrypted connection over the public internet
- **AWS Direct Connect** — a **dedicated private** physical connection from your data center to AWS (lower latency, more consistent, more expensive)

> **Exam tip:** "Dedicated private connection, not over the internet" → **Direct Connect**. "Secure VPN over the internet" → Site-to-Site VPN.`,
    },
    {
      name: "Route 53: DNS Service",
      minutes: 10,
      intro: "The AWS DNS service — records, routing policies, and health checks.",
      content: `### What is Route 53?

**Amazon Route 53** is a scalable and highly available **Domain Name System (DNS) web service** — it translates human-friendly names (example.com) into IP addresses.

- **Global service** (managed at edge locations)
- Also does **domain registration** and **health checks**

### DNS how-it-works recap

\`\`\`text
User types example.com → Route 53 returns the IP → browser connects
\`\`\`

### Record types you may see

- **A / AAAA** — hostname → IPv4 / IPv6
- **CNAME** — one name → another name
- **MX** — mail exchange
- **Alias** — Route 53-specific, maps to AWS resources (e.g. an S3 bucket or ELB) and is free

### Routing policies (just the important ones)

- **Simple** — one destination
- **Weighted** — split traffic by weight (e.g. 10% to one region)
- **Latency-based** — route to the region with lowest latency for the user
- **Failover** — primary/secondary; failover on health check failure
- **Geolocation** — route by the user's geographic location

### Elastic Load Balancing recap (partners with Route 53)

- **ALB** (Application) — HTTP/HTTPS, path-based routing
- **NLB** (Network) — TCP/UDP, extreme performance
- **CLB** (Classic) — legacy

> **Exam tip:** "DNS resolution / name-to-IP" → **Route 53**. "Distribute traffic across instances" → **Elastic Load Balancing** (ALB for HTTP, NLB for TCP/UDP). "Route users to the lowest-latency region" → latency-based policy.`,
    },
    {
      name: "CloudFront: CDN & Global Content Delivery",
      minutes: 10,
      intro: "Amazon's Content Delivery Network — caching at the edge.",
      content: `### What is CloudFront?

**Amazon CloudFront** is a fast **Content Delivery Network (CDN)** that delivers content (web pages, videos, images) to users **from the nearest edge location**, reducing latency and load on your origin.

### How it works

\`\`\`text
User in Tokyo → nearest edge cache → if not cached, fetch from origin (S3/ELB) and cache it
\`\`\`

- **Origin** — where the original content lives (S3 bucket, ELB, EC2, on-prem server)
- **Edge location** — where content is cached for fast delivery

### Why use CloudFront?

- **Low latency** — content closer to users
- **High transfer speeds**
- **Offloads origin** — fewer requests hit your servers
- **DDoS protection** — works with AWS Shield
- Can also help with **static content** and **media streaming** (video via S3 + CloudFront)

### CDN vs direct S3 access

Serving directly from S3 works, but for a global audience CloudFront caches at the edge — fewer S3 requests and lower latency.

### AWS Global Accelerator (also know this)

- Uses AWS's global network to route traffic to your application endpoints
- Improves latency and provides **static anycast IP addresses** as entry points

> **Exam tip:** "Caching at edge locations to reduce latency for global users" → **CloudFront**. "Fix an IP address / route via AWS global network" → **Global Accelerator**.`,
    },
    {
      name: "API Gateway & Other Networking Services",
      minutes: 8,
      intro: "API Gateway, Web Application Firewall, and putting networking together.",
      content: `### Amazon API Gateway

- A fully managed service to **create, publish, and manage APIs**
- Acts as a "front door" for applications to access backend services
- Common serverless pattern: **API Gateway → Lambda → DynamoDB**
- Handles authentication, throttling, rate limiting, and monitoring

### AWS WAF (Web Application Firewall)

- Protects web applications from common web exploits (**SQL injection, cross-site scripting / XSS**)
- Works with CloudFront, ALB, and API Gateway
- **AWS Shield** (Standard free / Advanced paid) protects against **DDoS** attacks

### Putting networking together — a realistic scenario

\`\`\`text
User → Route 53 (DNS) → CloudFront (CDN + WAF) → ALB → EC2/Auto Scaling
\`\`\`

The exam loves this chain: DNS first, then a CDN at the edge, then a load balancer, then your compute.

### Networking service quick table

| Need | Service |
|------|---------|
| Domain name → IP (DNS) | Route 53 |
| Cache content worldwide | CloudFront |
| Private virtual network | VPC + subnets |
| Distribute traffic to instances | ELB (ALB/NLB) |
| Expose REST APIs to apps | API Gateway |
| Block SQL injection / XSS | WAF |
| Protect against DDoS | AWS Shield |
| Connect on-prem privately | Direct Connect |

> **Exam tip:** CloudFront + WAF + Shield is the security-trio for web apps. API Gateway + Lambda is the serverless duo.`,
    },
  ],
}