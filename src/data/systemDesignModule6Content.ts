import type { Module } from "../types"

export const systemDesignModule6: Module = {
  id: 6,
  title: "Load Balancing & Traffic Management",
  status: "upcoming",
  lessons: [
    {
      name: "Load Balancers — Types & Algorithms",
      minutes: 11,
      intro: "See why load balancers sit at nearly every layer of a real system, learn the difference between L4 and L7 balancing, and compare the algorithms used to pick which server handles each request.",
      content: `## What a load balancer actually does

A load balancer sits in front of a pool of servers and distributes incoming traffic across them, so no single server has to handle the full load alone. That one sentence hides three distinct jobs it performs simultaneously: it improves **scalability** (add more servers behind it and capacity grows), it improves **availability** (it stops sending traffic to a server that's down, so one failure doesn't become an outage), and it improves **performance** (it can route requests to whichever server is best positioned to answer fastest). Because these benefits are so broadly useful, load balancers don't appear just once at the "front door" of a system — production architectures typically stack them at multiple layers: a global DNS-based balancer routing users to the nearest region, a balancer in front of the web tier, another in front of the application tier, and sometimes one in front of the database read replicas too.

\`\`\`text
Client
  │
  ▼
[ DNS-based LB ]  →  routes to nearest region
  │
  ▼
[ L7 LB ]  →  routes by URL path (/api → app servers, /static → CDN)
  │
  ▼
[ App Server A ] [ App Server B ] [ App Server C ]
  │
  ▼
[ DB LB ]  →  routes reads across replicas
\`\`\`

## Layer 4 vs Layer 7 load balancing

Load balancers are usually classified by which layer of the network stack they operate at, and the layer determines what information they have available to make a routing decision.

- **Layer 4 (transport layer)** balancers make decisions based purely on IP address and TCP/UDP port — they never look inside the actual request. This makes them extremely fast and low-overhead, but "dumb": a Layer 4 balancer can't route \`/api/users\` differently from \`/api/orders\`, because it never opens the packet far enough to see a URL.
- **Layer 7 (application layer)** balancers understand the actual protocol — HTTP headers, URL paths, cookies, even request bodies — and can make much smarter routing decisions: sending \`/api/*\` to one server pool and \`/static/*\` to another, routing based on a session cookie, or rejecting malformed requests before they ever reach a backend. This flexibility costs more CPU per request than Layer 4 balancing, since it has to actually parse the protocol.

Most modern web architectures default to Layer 7 balancing (via something like an application load balancer, Nginx, or Envoy) precisely because the ability to route on path, header, or cookie is usually worth the extra overhead — Layer 4 tends to show up lower in the stack, in front of things like raw TCP services or databases, where there's no HTTP semantics to exploit anyway.

## Hardware, software, and DNS-based balancing

Orthogonal to the layer question is *how* the balancing is implemented:

- **Hardware load balancers** are dedicated physical appliances (historically from vendors like F5) — extremely high throughput, extremely expensive, mostly seen in large on-prem data centers today.
- **Software load balancers** run as regular processes on commodity servers or as a managed cloud service (an AWS Application Load Balancer, Nginx, HAProxy, Envoy) — cheaper, more flexible, horizontally scalable themselves, and the default choice for the overwhelming majority of modern systems.
- **DNS-based load balancing** works one layer up entirely: instead of balancing individual requests, it resolves a domain name to different IP addresses for different clients (round robin DNS, or GeoDNS routing users to their nearest region). It's coarse — it can't react to a server's real-time load — but it's the mechanism used to route traffic across geographically distant data centers before any single request even reaches a regional load balancer.

## Load balancing algorithms

Once a balancer decides *that* it needs to pick a server, it needs a rule for *which* one. The right algorithm depends on whether your servers are identical, whether requests are cheap or expensive, and whether you need a client to consistently land on the same server.

| Algorithm | How it picks | Best for |
|---|---|---|
| **Round robin** | Cycles through servers in fixed order, one request each | Simple, uniform request cost, identical server capacity |
| **Weighted round robin** | Same as round robin, but stronger servers get proportionally more requests | Heterogeneous server capacity (some boxes are bigger than others) |
| **Least connections** | Sends the request to whichever server currently has the fewest active connections | Requests with widely varying processing time (some take 10ms, others 10s) |
| **IP hash** | Hashes the client's IP to consistently map them to the same server | Needing session affinity without a shared session store |
| **Latency-based** | Routes to whichever server is currently responding fastest | Geographically distributed backends, or backends with uneven load |

Round robin is the simplest and cheapest to compute, but it silently breaks down the moment requests aren't uniform in cost — if one server happens to get a string of expensive requests, round robin keeps sending it more work anyway, unaware it's already overloaded. Least connections fixes exactly that blind spot by reacting to real-time load rather than assuming every request is equal, at the cost of the balancer having to track connection counts per server. IP hash trades load-balancing precision for a cheap way to get session affinity, which is useful right up until one server's IP-hashed share of clients happens to skew heavy, at which point that server is stuck overloaded until traffic patterns shift.

> **Key idea:** Load balancers appear at multiple layers of a real system and improve scalability, availability, and performance simultaneously; Layer 4 balancing is fast but protocol-blind while Layer 7 balancing can route on URL/header/cookie at higher cost, and the right distribution algorithm — round robin, least connections, IP hash, or latency-based — depends on whether your servers and requests are actually uniform.`,
    },
  ],
}
