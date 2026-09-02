import type { Module } from "../types"

export const systemDesignModule3: Module = {
  id: 3,
  title: "Scalability",
  status: "upcoming",
  lessons: [
    {
      name: "Horizontal vs Vertical Scaling",
      minutes: 10,
      intro: "Compare growing a system by making one machine bigger versus adding more machines, and see exactly where each approach starts to hurt.",
      content: `## Two ways to handle more load

Every system eventually hits a point where the current hardware can't keep up with demand — more users, more requests, more data. There are only two fundamental ways to respond:

- **Vertical scaling (scaling up)** — give the existing machine more resources: a faster CPU, more RAM, a bigger disk, more network bandwidth. The application code usually doesn't change at all; you're just running the same single instance on beefier hardware.
- **Horizontal scaling (scaling out)** — add more machines running the same application, and spread the load across all of them. A single request now lands on one of many interchangeable instances instead of the one instance that used to handle everything.

Both get you more capacity. They get it in very different ways, with very different failure modes.

## Vertical scaling: simple, but with a hard ceiling

Vertical scaling is appealing because it requires almost no architectural change — upgrade the instance type, restart, done. No load balancer, no data partitioning, no distributed consistency to reason about. For a while, this is genuinely the right call: it's cheap in engineering time, and cloud providers make resizing a running instance close to a one-click operation.

The problem is that it doesn't scale linearly, and it has a ceiling:

\`\`\`text
2 vCPU / 8 GB  → handles ~500 req/s   ($50/mo)
4 vCPU / 16 GB → handles ~900 req/s   ($100/mo)
8 vCPU / 32 GB → handles ~1500 req/s  ($220/mo)
16 vCPU / 64 GB → handles ~2200 req/s ($450/mo)
32 vCPU / 128 GB → handles ~2800 req/s ($900/mo)
\`\`\`

Notice the pattern: doubling the hardware does not double the throughput. Contention inside a single machine — memory bus bandwidth, lock contention between threads, a single database's write path — means returns diminish as the box gets bigger. Worse, at some point there simply is no bigger machine to rent; every cloud provider has a largest available instance type, and it's finite.

There's also a structural risk that has nothing to do with performance: a single vertically-scaled instance is a **single point of failure**. If that one machine crashes, restarts for a kernel patch, or the availability zone it lives in has an outage, the entire system goes down with it — there's nothing else to fail over to.

## Horizontal scaling: no ceiling, but real complexity

Horizontal scaling sidesteps both problems. Instead of one machine getting bigger, you run N identical instances behind a load balancer (covered in depth in Module 6), and N can, in principle, keep growing — 10 instances, 100, 1,000. There's no single machine whose physical limits cap the system, and losing any one instance just means the load balancer routes around it while the rest keep serving traffic.

That flexibility isn't free. Horizontal scaling only works cleanly if the thing being scaled is **stateless** — if any instance can handle any request, because no instance is holding onto data that only it has. The moment an instance keeps something in local memory (a user's session, an in-progress upload, a WebSocket connection) that a later request from the same user depends on, you've broken the "any instance can serve any request" assumption, and you need sticky sessions, an external session store, or a redesign to keep it working. Horizontal scaling also pushes complexity outward: you now need a load balancer, health checks to detect a dead instance, a deployment strategy that can roll out to many instances safely, and — if the state lives in a database rather than the application layer — a database that itself can handle more concurrent connections and, eventually, more data than one instance can hold (Module 4 covers replication and sharding for exactly this).

## Putting them side by side

| | Vertical scaling | Horizontal scaling |
|---|---|---|
| How | Bigger machine | More machines |
| Code changes needed | Usually none | Requires statelessness |
| Ceiling | Yes — largest available instance | No practical ceiling |
| Single point of failure | Yes | No, if done correctly |
| Operational complexity | Low | Higher (LB, health checks, coordination) |
| Cost curve | Worsens per unit of capacity as size grows | Roughly linear per instance added |

In practice, real systems use both, at different points. It's extremely common to vertically scale a database up to a comfortable size (because horizontally scaling a database is genuinely hard — see Module 4) while horizontally scaling the stateless application tier in front of it, which is comparatively easy. Reaching for horizontal scaling everywhere from day one is often premature; reaching for "just get a bigger box" as the permanent answer eventually stops working no matter the budget.

> **Key idea:** Vertical scaling (a bigger machine) is simple but has diminishing returns, a hard hardware ceiling, and remains a single point of failure; horizontal scaling (more machines) has no practical ceiling and survives individual failures, but demands statelessness and adds real operational complexity — most real systems combine both, scaling the database up and the application tier out.`,
    },
  ],
}
