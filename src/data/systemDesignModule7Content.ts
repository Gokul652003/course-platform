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
    {
      name: "Distributed Caching, Cache Eviction Policies & Cold/Warm Caches",
      minutes: 11,
      intro: "Compare local vs distributed caches, learn the major eviction policies (LRU, LFU, FIFO, TTL), and understand cold vs warm cache behavior.",
      content: `## Local cache vs distributed cache

Once an application runs on more than one server, "where does the cache live" becomes an architectural decision with real consequences.

- **Local (in-process) cache** — a plain in-memory map living inside each application instance. Extremely fast (no network hop at all — it's a memory lookup), but every instance has its own copy. If you have ten app servers behind a load balancer, you effectively have ten separate caches that don't know about each other, which means a write on one server doesn't invalidate the stale copy sitting in the other nine.
- **Distributed cache** — a separate, shared cache tier (Redis, Memcached) that every application instance talks to over the network. Slightly slower than a local lookup (it's a network round trip, even if a fast one), but there's exactly one copy of each cached value, so every instance sees the same, consistently invalidated data.

Most production systems use both: a small, very hot local cache for the tiniest, most latency-critical lookups, backed by a distributed cache as the shared source of truth for everything else. The core tension to internalize is **consistency vs speed** — local caches are faster per lookup but harder to keep consistent across instances; distributed caches are the reverse.

## The invalidation problem

Caching would be trivial if data never changed. It does, and keeping a cache from serving stale data is famously one of the two hard problems in computer science. The two dominant strategies:

- **TTL (time-to-live) expiration** — every cached entry is stamped with an expiry time; after that, it's treated as a miss and refetched. Simple, requires no coordination, but means clients can see stale data for up to the TTL window even after the source changes.
- **Explicit invalidation** — when the underlying data changes, the write path actively deletes or updates the corresponding cache entry (or publishes an invalidation event other instances subscribe to). More accurate, but requires every code path that mutates data to remember to invalidate the right keys — miss one, and that entry silently goes stale forever.

Most real systems combine both: explicit invalidation as the primary mechanism, with a TTL as a safety net that bounds the *maximum* staleness even if an invalidation gets missed somewhere.

## Cache eviction policies: what to throw away when full

A cache has finite size. Once it's full and a new item needs to be stored, something existing has to be evicted. Which item gets picked is what an eviction policy decides:

| Policy | Evicts | Good for | Weakness |
|---|---|---|---|
| **LRU** (Least Recently Used) | The item that hasn't been accessed for the longest time | General-purpose workloads with temporal locality (recently used data tends to be used again soon) | A single large scan (e.g. a batch job reading everything once) can flush out genuinely hot data |
| **LFU** (Least Frequently Used) | The item with the lowest total access count | Workloads with a stable set of "always popular" items (e.g. a product catalog's bestsellers) | Slow to adapt — an item that was hot yesterday but cold today still has a high historical count and resists eviction |
| **FIFO** (First In, First Out) | The oldest item by insertion time, regardless of usage | Simple, predictable workloads, or as a cheap approximation when tracking access patterns is too expensive | Ignores usage entirely — can evict something accessed a second ago just because it happened to be inserted first |
| **TTL-based** | Anything past its configured expiry, independent of recency/frequency | Data with a natural freshness window (a stock quote, a weather forecast) | Doesn't account for capacity pressure — a cache can still fill up between expirations |

**LRU** is the default most general-purpose caches (including Redis's \`allkeys-lru\` policy) reach for first, because "recently used data is likely to be used again" holds for a surprisingly wide range of real workloads. LFU is worth reaching for specifically when you have a small set of consistently hot keys you never want evicted, even during a burst of one-off accesses to cold data. In practice, many systems layer TTL on top of whichever recency/frequency policy they use — TTL bounds staleness, the eviction policy handles capacity pressure.

## Cold cache vs warm cache

A cache's state isn't binary (empty or full) — it's better understood by hit rate over time:

- **Cold cache** — freshly started (a new deployment, a server that just booted, a cache that was just flushed) with little or nothing stored yet. Almost every request is a miss, so the system briefly behaves as if the cache didn't exist at all — full latency, full load on the underlying database, for every request.
- **Warm cache** — has been running long enough that it holds a representative set of frequently requested data, so its hit rate has climbed to a steady, high level.

The gap between cold and warm matters most right after a deployment or a cache-tier restart: if you roll out a new version of your application and it flushes the cache (or you spin up a brand-new distributed cache cluster), your database can suddenly get hit with the full, uncached load it was previously shielded from — a real cause of production incidents nicknamed a "thundering herd" against the database.

## Cache warming

**Cache warming** is the practice of deliberately populating a cache with expected-hot data *before* real traffic arrives, rather than letting it fill up reactively from cold, request by request. Common approaches:

\`\`\`text
1. Pre-load on startup: replay a list of known-hot keys and fetch them into
   cache as part of deployment, before the instance receives live traffic.
2. Shadow traffic: mirror a sample of real production requests to a new
   cache instance ahead of cutting traffic over to it.
3. Scheduled refresh: a background job periodically re-fetches and
   re-populates known-important keys, so they never fully expire under
   normal operation.
\`\`\`

Warming matters most for systems with a small number of extremely hot keys and a large, spiky user base — a flash-sale product page, a trending news article — where the very first wave of traffic after a cold start would otherwise overwhelm the origin before the cache has a chance to organically warm up.

> **Key idea:** Local caches are faster but per-instance and hard to keep consistent, while distributed caches are shared and consistent but pay a network hop; eviction policies (LRU for general recency-based workloads, LFU for stable hot sets, TTL for naturally time-bound data) decide what gets dropped when a cache fills up, and a cold cache — especially right after a deploy or restart — can expose the origin to full, unshielded load until it's warmed, which is exactly what deliberate cache-warming strategies exist to prevent.`,
    },
  ],
}
