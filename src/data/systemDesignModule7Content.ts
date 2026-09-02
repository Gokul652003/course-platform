import type { Module } from "../types"

export const systemDesignModule7: Module = {
  id: 7,
  title: "Caching, Latency & CDNs",
  status: "upcoming",
  lessons: [
    {
      name: "Latency, Throughput & Caching Fundamentals",
      minutes: 10,
      intro: "Pin down exactly what latency and throughput measure, see why they aren't the same axis, and learn where caches live in a system.",
      content: `## Two numbers that get confused constantly

Latency and throughput both show up on every performance dashboard, and they get used almost interchangeably in casual conversation — which is a mistake, because they measure genuinely different things and a system can be excellent on one and terrible on the other.

- **Latency** is the time a single unit of work takes, end to end — the delay between sending a request and receiving its response. Measured in time (milliseconds, seconds). "This API call took 220ms."
- **Throughput** is the rate at which a system processes work — how many units of work complete per unit of time. Measured as a rate (requests/second, transactions/second, megabits/second).

The classic mental model is a pipe: **latency is how long it takes one drop of water to travel from one end of the pipe to the other. Throughput is how many liters per second flow out of the far end.** A garden hose and a fire hose can have identical latency (same length of pipe, same travel time for one drop) but wildly different throughput (the fire hose is far wider). Conversely, you can increase throughput by adding more parallel pipes without changing the latency of any single drop at all — this is exactly what horizontal scaling does: it doesn't make one request faster, it lets more requests happen at once.

## Why they trade off against each other

Because they measure different things, optimizing for one can actively hurt the other:

| Technique | Effect on latency | Effect on throughput |
|---|---|---|
| Batching many small requests into one bigger one | Increases (each caller waits for the batch to fill) | Increases (less per-request overhead, more work done per round trip) |
| Adding more worker threads/processes | Unchanged per request | Increases, until a shared resource (CPU, DB connections) saturates |
| Adding a cache in front of a slow database | Decreases dramatically on hits | Increases (the database is freed up to do less work per request) |
| Increasing queue depth to smooth traffic bursts | Increases (requests wait longer in the queue) | Can increase (the backend isn't overwhelmed and keeps a steady processing rate) |

Batching is the sharpest illustration: a batching layer that waits 50ms to collect requests before sending them downstream as one bulk call adds a fixed 50ms to every individual request's latency, while dramatically improving throughput because the downstream system now handles ten times fewer, ten-times-larger calls. Whether that trade is worth it depends entirely on whether your users care more about "how fast did *my* request come back" (latency-sensitive: a live chat message) or "how much total work can the system get through" (throughput-sensitive: a nightly batch export).

## Caching: the highest-leverage latency fix there is

A **cache** is a smaller, faster storage layer sitting in front of a larger, slower one, holding copies of data that's likely to be requested again soon. Every read has two possible outcomes:

- **Cache hit** — the requested data is already in the cache. Served immediately, without touching the slow underlying source.
- **Cache miss** — the data isn't cached. The system falls through to the slow source, fetches it, and (usually) stores a copy in the cache before returning it, so the *next* request for the same data is a hit.

The entire value of a cache is captured by its **hit rate** — the percentage of requests served from cache rather than falling through. A cache with a 95% hit rate means 95% of requests skip the slow path entirely; the remaining 5% still pay full latency. Improving hit rate (bigger cache, smarter eviction, better key design, pre-warming — all covered in the next lesson) is usually a far bigger performance lever than optimizing the slow path itself, because it reduces how often that slow path gets exercised at all.

## Where caches actually live

Caching isn't one layer — real systems stack caches at nearly every hop between a user and the data they want, and each layer trades off scope against speed:

\`\`\`text
Browser cache  →  CDN / edge cache  →  Load balancer / reverse proxy cache
   →  Application-level cache (Redis, Memcached, in-process memory)
      →  Database query cache / buffer pool
         →  Disk
\`\`\`

- **Client-side (browser) cache** — HTTP caching headers (\`Cache-Control\`, \`ETag\`) let the browser skip the network entirely for unchanged assets. Fastest possible cache: zero network round trips.
- **CDN / edge cache** — covered in depth in the last lesson of this module; caches responses geographically close to the user.
- **Application-level cache** — a dedicated in-memory store (Redis, Memcached) or even an in-process map, sitting between your application servers and your database, holding computed results, session data, or hot database rows.
- **Database-level cache** — most databases keep a buffer pool of recently accessed pages in memory automatically, so even a "cache miss" at the application layer might still be a hit inside the database engine itself.

Each layer downstream is slower than the one above it, and each hit at a shallower layer saves all the work every layer below it would have done. This is exactly why a CDN cache hit is more valuable than an application cache hit for the same data — it saves not just the database query but the entire network hop to your servers.

> **Key idea:** Latency is the time one request takes; throughput is how much work completes per unit of time — they can trade off against each other (batching raises both latency and throughput at once), and caching is the highest-leverage latency fix available because it lets a request skip the slow path entirely, with real systems stacking caches at multiple layers between the user and the data.`,
    },
  ],
}
