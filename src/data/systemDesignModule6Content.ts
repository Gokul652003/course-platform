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
    {
      name: "Consistent Hashing & Stateless vs Stateful Load Balancing",
      minutes: 11,
      intro: "See exactly why naive modulo hashing collapses when servers are added or removed, how consistent hashing fixes it, and when sticky sessions are worth their scalability cost.",
      content: `## The problem: naive hashing doesn't survive a resized cluster

A common need in distributed systems is mapping keys (cache keys, user IDs, shard identifiers) to a fixed set of servers deterministically — the same key should always land on the same server, so you know where to find it again. The obvious first approach is modulo hashing: \`server = hash(key) % N\`, where \`N\` is the number of servers.

This works fine until \`N\` changes. Add or remove a single server, and \`N\` changes, which means \`hash(key) % N\` produces a *completely different* result for nearly every key — not just the keys that "belong" to the changed server. In a cache, this means a single server joining or leaving invalidates almost the entire cache at once, sending a flood of requests to the origin/database simultaneously (the exact scenario that causes a "thundering herd" and can take down an underprovisioned backend). In a sharded database, it means an enormous, unnecessary volume of data has to be physically moved between nodes just because the cluster size changed by one.

\`\`\`text
5 servers, hash(key) % 5:        key A → server 2
6 servers, hash(key) % 6:        key A → server 4   (moved, even though nothing about A changed)
\`\`\`

## Consistent hashing: bounding the damage

Consistent hashing solves this by changing *what* gets hashed onto: instead of hashing directly onto a fixed set of server indices, both servers and keys are hashed onto points on the same fixed, circular hash ring (typically covering the range 0 to 2³²−1). A key is assigned to the first server found walking clockwise around the ring from the key's position.

\`\`\`text
        Server C
       /        \\
  Key1            Server A
       \\        /
        Server B ← Key2, Key3 land here (next server clockwise)
\`\`\`

Because both keys and servers live on the same ring, adding or removing a server only affects the keys between that server and its previous neighbor on the ring — every other key's assignment is completely undisturbed. Removing server B in the diagram above only reassigns Key2 and Key3 (to the next server clockwise); Key1's assignment to server A never changes. This is the entire point: consistent hashing bounds the *fraction* of keys remapped on a topology change to roughly \`1/N\`, instead of remapping nearly everything.

## Virtual nodes: fixing uneven distribution

A ring with only a few real servers plotted on it tends to distribute keys unevenly — by chance, servers can end up with large or small arcs of the ring, meaning some servers get far more keys than others. The standard fix is **virtual nodes**: instead of hashing each physical server onto the ring once, hash it onto the ring many times (100+) under different virtual identifiers, all still pointing back to the same physical server. With many virtual points scattered per server, the law of large numbers takes over and each physical server ends up covering a roughly equal total arc length, smoothing out the imbalance without weakening consistent hashing's core remapping guarantee.

This exact mechanism is what underlies real distributed caches and databases at scale — Amazon's DynamoDB, Cassandra, and CDN request routing all rely on some variant of consistent hashing with virtual nodes for precisely this reason: predictable, minimal disruption when the cluster resizes.

## Stateless vs stateful load balancing

Separately from *how* a balancer picks a server, there's a question of *whether it needs to remember anything about past requests*.

- **Stateless load balancing** treats every request independently — any server in the pool can handle any request, because no server holds anything request-specific that another server lacks. This is the ideal to design toward: it makes horizontal scaling trivial (add a server, it can immediately take traffic) and makes failover instant (a server dies, its requests seamlessly go elsewhere, because every other server is equally capable of serving them).
- **Stateful load balancing (sticky sessions)** routes a given client to the *same* server on every request, usually because that server is holding some in-memory state — a session object, a WebSocket connection, an in-progress file upload — that no other server has a copy of.

Sticky sessions are sometimes unavoidable (a live WebSocket connection has to stay on the server that opened it), but they come at a real scalability cost: they make the load balancer's job harder (it now has to track affinity, usually via a cookie), they make horizontal scaling lumpier (a newly added server gets zero traffic until new clients arrive, since existing clients stay stuck on their original server), and they turn a single server's failure into a worse event (every client stuck to that server loses their session state entirely, not just their in-flight request).

The strongly preferred fix, wherever possible, is to **externalize the state** instead of pinning the client to a server: move session data into a shared store like Redis that every server can read, so any server can serve any request regardless of which one handled the last one. This converts a stateful problem back into a stateless one, at the cost of an extra network hop to fetch session data — almost always a good trade, since it's what makes a fleet of application servers actually interchangeable.

> **Key idea:** Naive \`hash % N\` remaps nearly every key when the server count changes, which consistent hashing fixes by placing servers and keys on a shared ring so a topology change only disturbs the keys near the affected server — smoothed further with virtual nodes — while stateless load balancing (every server interchangeable) should be preferred over sticky sessions wherever the underlying state can be externalized to a shared store instead.`,
    },
    {
      name: "Concurrency, Parallelism & Load Balancing vs Failover",
      minutes: 9,
      intro: "Pin down the real difference between concurrency and parallelism with a concrete example, and separate load balancing (distributing healthy traffic) from failover (reacting to a dead node).",
      content: `## Concurrency vs parallelism: a distinction, not a synonym

These two words get used interchangeably in casual conversation, but they describe genuinely different things, and the difference matters when reasoning about how a load-balanced system actually uses its capacity.

- **Concurrency** is about *structure*: a system is concurrent if it can deal with multiple tasks that are in progress at overlapping times, making progress on more than one at once by interleaving work — even on a single CPU core. A single-threaded event loop juggling many in-flight network requests (never blocking on any one of them) is concurrent, even though only one instruction executes at any given nanosecond.
- **Parallelism** is about *execution*: a system is parallel if it literally executes multiple tasks at the exact same instant, which requires multiple physical execution units — multiple CPU cores, multiple machines.

A single core running Node.js's event loop can be highly concurrent (handling thousands of in-flight I/O-bound requests by switching between them while each waits on the network) without being parallel at all, since only one line of JavaScript ever runs at a truly simultaneous instant. A fleet of eight servers behind a load balancer, each handling a request at the same physical moment, is parallel. A single server with an eight-core CPU processing eight CPU-bound requests simultaneously, one per core, is also parallel. The two properties are independent and frequently combined: a load-balanced fleet of multi-core, event-loop-based servers is both highly concurrent (each server juggles many in-flight requests) and highly parallel (many servers, and many cores per server, genuinely run at once).

\`\`\`text
Concurrent, not parallel (1 core, event loop):
  Core: [Req A start][Req B start][Req A resume][Req C start][Req A finish]...

Parallel (multiple cores/servers):
  Core 1: [ Req A running ]
  Core 2: [ Req B running ]   ← literally simultaneous
  Core 3: [ Req C running ]
\`\`\`

## Why this distinction matters for load balancing

A load balancer's entire value proposition is turning a system's available *parallelism* (multiple servers, multiple cores) into actual throughput by spreading concurrent client demand across it. If a system is I/O-bound (waiting on databases, external APIs) more than CPU-bound, a single server can already achieve enormous concurrency on its own via an event loop or thread pool — but it still needs a load balancer and multiple server instances to get real parallelism, because no amount of clever single-machine concurrency lets one machine exceed its own CPU and network interface limits. Recognizing whether a bottleneck is a concurrency problem (badly structured code blocking unnecessarily) or a genuine capacity problem (correctly structured code that's simply run out of parallel hardware) is exactly what determines whether the fix is "restructure this code to not block" or "add more servers behind the load balancer."

## Load balancing vs failover — different jobs, often confused

Both mechanisms decide where traffic goes, and both involve a pool of servers, which is why they're easy to conflate — but they answer different questions and typically operate at different times.

- **Load balancing** answers "given several *healthy* servers, which one should handle this request?" — it runs continuously, on every single request, under normal operating conditions, optimizing for even distribution and performance.
- **Failover** answers "this server (or entire region) just died — where does its traffic go now?" — it's an exceptional, reactive event triggered by a health check failure, not a routine decision made per-request.

They compose rather than compete: a load balancer typically owns both jobs in practice, using its health checks to notice a dead node and simply stop including it in the normal distribution algorithm — from the balancer's point of view, failover is just "load balancing across a server pool that got one node smaller, automatically."

**Active-passive failover** keeps a standby replica idle, ready to take over the moment the active node fails — simple to reason about, but wastes the standby's capacity entirely while nothing is wrong, and the failover itself (promoting the passive node, redirecting traffic) takes some nonzero time during which the system is degraded. **Active-active failover** runs multiple nodes actively serving traffic simultaneously, so if one dies, the others are already warm and already receiving a share of traffic — failover is nearly instantaneous (just stop routing to the dead node) and no capacity sits idle, at the cost of needing every active node to independently handle real production load and any data replication between them to already be happening continuously, not triggered only at failover time.

> **Key idea:** Concurrency is about structuring work to make overlapping progress, parallelism is about literally executing work at the same instant, and a load balancer converts real parallel hardware into throughput for concurrent demand; separately, load balancing distributes traffic across healthy nodes continuously while failover is the reactive process — active-passive or active-active — of rerouting away from a node that just died.`,
    },
  ],
}
