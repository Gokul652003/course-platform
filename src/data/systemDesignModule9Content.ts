import type { Module } from "../types"

export const systemDesignModule9: Module = {
  id: 9,
  title: "Networking, Proxies & Real-Time Communication",
  status: "upcoming",
  lessons: [
    {
      name: "Communication Protocols & DNS",
      minutes: 11,
      intro: "Compare the transport and application protocols that show up in system design interviews, then trace exactly what happens between typing a URL and a browser getting an IP address back.",
      content: `## TCP vs UDP: the two transports everything else is built on

Almost every protocol you'll design around sits on top of one of two transport-layer protocols, and the choice between them is a real design decision, not just plumbing:

- **TCP (Transmission Control Protocol)** — connection-oriented, reliable, ordered. It hand-shakes a connection before sending data, retransmits lost packets, and guarantees bytes arrive in the order they were sent. That reliability costs latency (the handshake, the retransmit waits) and overhead (acknowledgment traffic).
- **UDP (User Datagram Protocol)** — connectionless, best-effort, unordered. You fire packets and hope; there's no handshake, no retransmission, no ordering guarantee. In exchange, it's fast and has minimal overhead.

Neither is "better" — they're suited to different problems. A file upload, a chat message, or an API call needs TCP: losing a byte silently would corrupt the result. A live video call or a multiplayer game's position updates are usually better on UDP: a dropped frame from half a second ago is worthless anyway, and waiting for TCP to retransmit it just adds lag on top of the loss. This is exactly why HTTP historically ran on TCP, while DNS queries and live-streaming protocols lean on UDP.

## HTTP/1.1, HTTP/2, and HTTP/3 — same job, different plumbing

HTTP is the application-layer protocol most system design interviews live in, and it has evolved specifically to fix TCP-shaped bottlenecks:

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC (built on UDP) |
| Connections per host | One request in flight per connection (or several parallel connections as a workaround) | Multiplexed streams over one connection | Multiplexed streams over one connection |
| Head-of-line blocking | Yes, badly | Reduced (app layer), but one lost TCP packet still stalls every stream | Effectively eliminated — each QUIC stream recovers independently |
| Typical use today | Legacy, simple services | Most modern web traffic | Increasingly default for latency-sensitive, high-loss networks (mobile) |

The throughline: HTTP/1.1 forced browsers to open multiple TCP connections just to load a page in parallel, which is wasteful. HTTP/2 fixed that by multiplexing many logical streams over a single TCP connection — but because TCP guarantees strict byte ordering, one lost packet still blocks *every* stream behind it (head-of-line blocking at the transport layer). HTTP/3 solves that by moving off TCP entirely onto QUIC, a transport built on UDP that gives each stream independent loss recovery. None of this is trivia — it directly informs decisions like "should this API support HTTP/2 multiplexing" or "why does this mobile client feel slow on lossy networks."

## Where gRPC and WebSockets fit

Two protocols come up constantly once you're past plain request/response HTTP:

- **gRPC** — built on HTTP/2, using Protocol Buffers (a compact binary format) instead of JSON. It's a strong default for internal service-to-service communication where both ends are services you control: it's fast, strongly typed via a shared \`.proto\` schema, and supports streaming in both directions. It's a poor fit for public browser-facing APIs, where JSON-over-HTTP's universal tooling and human-readability usually win.
- **WebSockets** — a single long-lived, full-duplex TCP connection that starts as an HTTP request and then "upgrades." Once upgraded, either side can push messages at any time without a new request. This is the right tool when the server needs to *initiate* communication — chat, live notifications, collaborative editing — covered in depth later in this module.

## How DNS resolution actually works, end to end

DNS (Domain Name System) is the system that turns a human-readable name like \`api.example.com\` into an IP address a machine can actually connect to. A "cold" lookup (nothing cached anywhere) walks a chain of servers:

\`\`\`text
Browser cache?  --miss-->  OS cache?  --miss-->  Recursive resolver (ISP / 8.8.8.8)
      |                                                     |
    (found: done)                                    Root nameserver
                                                             |
                                              "ask the .com TLD nameserver"
                                                             |
                                                TLD nameserver (.com)
                                                             |
                                       "ask example.com's authoritative nameserver"
                                                             |
                                        Authoritative nameserver for example.com
                                                             |
                                              Returns the actual IP address
\`\`\`

Each hop is itself a request/response, so a fully cold lookup can add real, user-visible latency before the actual HTTP request even starts. In practice this almost never happens for popular domains because of caching at every layer along that chain.

## DNS caching and TTL: trading freshness for speed

Every DNS record is published with a **TTL (Time To Live)** — a number of seconds saying "you may cache this answer for this long before asking again." Browsers, operating systems, and recursive resolvers all cache DNS answers up to their TTL, which is why the chain above is rarely walked in full: most lookups are answered straight from a nearby cache.

TTL is a genuine trade-off knob, not an implementation detail:

- **Short TTL** (e.g. 60 seconds) — changes to a DNS record (like repointing a domain during a failover) propagate to clients almost immediately, but every resolver re-queries far more often, adding load to the authoritative nameservers and slightly more latency on average for cold lookups.
- **Long TTL** (e.g. 24 hours) — far less load on nameservers and faster average lookups (more cache hits), but a change to the record can take up to that long to be visible everywhere, since caches holding the old value won't re-check until it expires.

A common real-world pattern is to run with a long TTL normally, then temporarily lower it in advance of a planned migration (like a data center failover) so that when the record actually changes, it propagates quickly — because caches that already fetched the shorter TTL will expire and re-check sooner.

## Flushing the DNS cache

"Flushing the DNS cache" means manually discarding cached DNS answers *before* their TTL expires — typically done on your own machine (\`ipconfig /flushdns\` on Windows, \`sudo dscacheutil -flushcache\` on macOS) when you need to see a DNS change immediately instead of waiting out a stale cache entry, most commonly while debugging a DNS migration or verifying a fix has actually propagated. It only clears the local cache you flush — it has no effect on the caches held by your ISP's resolver or anyone else's machine, which is exactly why DNS changes still "propagate" gradually across the internet even after you've flushed your own cache.

> **Key idea:** TCP trades latency for reliability and UDP trades reliability for speed, which is why real-time features often prefer UDP-based transports (QUIC/HTTP-3) while correctness-critical requests stay on TCP; DNS resolves names to IPs through a cached chain of resolvers, and TTL is the deliberate dial between how fast a DNS change propagates and how much load repeated lookups place on nameservers.`,
    },
    {
      name: "Forward vs Reverse Proxy & Web/Application Servers",
      minutes: 10,
      intro: "Tell forward and reverse proxies apart by whose identity they hide, and see why a request typically passes through a web server before it ever reaches application code.",
      content: `## The one question that tells forward and reverse proxies apart

Both forward and reverse proxies sit between a client and a server, intercepting and forwarding traffic — the confusion between them almost always comes from not asking the one question that instantly disambiguates them: **whose identity is the proxy hiding?**

\`\`\`text
FORWARD PROXY (hides the client)
  Client A ---\\
  Client B ---- [ Forward Proxy ] ---> Internet ---> Server
  Client C ---/
  The server only ever sees the proxy's IP. It has no idea which client actually asked.

REVERSE PROXY (hides the server)
  Client ---> Internet ---> [ Reverse Proxy ] ----> Server 1
                                    |---------------> Server 2
                                    |---------------> Server 3
  The client only ever talks to the proxy. It has no idea which backend server actually answered.
\`\`\`

## Forward proxy: acting on behalf of the client

A **forward proxy** sits in front of a group of clients (often an entire company network) and forwards their outbound requests to the internet. The server on the other end sees the proxy, not the individual client. This is used for:

- **Filtering and access control** — blocking employees from reaching certain sites, or restricting outbound traffic to an allowlist.
- **Anonymity** — hiding a client's real IP address from the destination server.
- **Outbound caching** — if many clients behind the proxy request the same external resource, the proxy can cache and serve it once instead of refetching per client.
- **Bypassing geographic or network restrictions** — routing a request through a proxy in a different region.

## Reverse proxy: acting on behalf of the server

A **reverse proxy** sits in front of a group of backend servers and is the single point clients connect to; it then forwards each request to one of the servers behind it. The client has no visibility into how many backend servers exist or which one actually served the request. This is by far the more common pattern in backend system design, and it's usually doing several jobs at once:

- **Load balancing** — distributing incoming requests across multiple backend instances (Module 6 covers the algorithms).
- **TLS termination** — handling HTTPS encryption/decryption once at the proxy, so backend servers only deal with plain HTTP internally, simplifying certificate management to one place.
- **Inbound caching** — serving frequently requested responses directly from the proxy without hitting a backend server at all.
- **Security** — the proxy is the only thing directly exposed to the internet; backend servers can sit on a private network, unreachable except through it.

Nginx and HAProxy are the two tools most commonly reached for as reverse proxies in real infrastructure, and it's normal for a single Nginx instance to be doing TLS termination, load balancing, *and* static file serving simultaneously.

## Web server vs application server: who actually runs your code

These two terms get used loosely, but they describe genuinely different responsibilities:

| | Web server | Application server |
|---|---|---|
| Job | Serves static content (HTML, CSS, JS, images) directly from disk over HTTP | Executes your application's business logic to produce dynamic responses |
| Examples | Nginx, Apache | A Node.js/Express process, a Java servlet container, a Django/Gunicorn process |
| Speed | Very fast — no computation, just reading a file and streaming bytes | Slower per-request — running code, hitting a database, computing a response |

A typical production setup layers both: a web server (often the same reverse proxy doing TLS termination and load balancing) serves static assets and forwards any request that needs actual computation — an API call, a database-backed page — to an application server sitting behind it. This split matters because it lets the cheap, static-file work be handled by something optimized for exactly that, without burning application-server resources (memory, database connections, request-handling threads) on requests that never needed real computation in the first place.

> **Key idea:** A forward proxy hides the client from the server it's talking to; a reverse proxy hides the server from the client — the same mechanism, pointed in opposite directions, and reverse proxies are the workhorse behind load balancing, TLS termination, and inbound caching in most real backend architectures; a web server hands out static files while an application server runs your actual business logic, and production systems typically layer both.`,
    },
    {
      name: "Long Polling, Short Polling & WebSockets",
      minutes: 10,
      intro: "Compare the three standard ways a client learns about server-side changes in near real time, and match each one to the kind of feature it's actually built for.",
      content: `## The problem: HTTP was built for the client to ask first

Plain HTTP is a request/response protocol — the client always initiates, the server can only reply. That's a problem the moment a feature needs the *server* to tell the client something happened: a new chat message arrived, a live score changed, a background job finished. Three techniques have emerged to work around that constraint, each with a real trade-off between simplicity, latency, and resource cost.

## Short polling: ask over and over

The client repeatedly sends a request at a fixed interval — "anything new? anything new? anything new?" — and the server responds immediately either way, with fresh data or an empty "nothing changed" response.

\`\`\`text
Client --request--> Server (nothing new)  --response-->
   |  (wait 3s)
Client --request--> Server (nothing new)  --response-->
   |  (wait 3s)
Client --request--> Server (new data!)    --response-->
\`\`\`

Short polling is trivial to implement — it's just a \`setInterval\` calling a normal HTTP endpoint — but it's wasteful on both ends. Poll too slowly and updates feel laggy (data can sit for up to a full interval before the client notices); poll too fast and you're firing mostly-empty requests constantly, burning server capacity and client battery for no benefit. It also means an update is only ever as fresh as the last poll, never immediate.

## Long polling: ask once, wait for an answer

The client sends a request exactly like short polling, but this time the server *doesn't respond immediately* if there's nothing new — it holds the connection open and waits until either new data becomes available or a timeout is hit. As soon as the server responds (with data, or an empty timeout response), the client immediately opens a new long-poll request.

\`\`\`text
Client --request--> Server (holds connection open...)
                        |  (2 minutes pass, still nothing)
                        |  (new data arrives!)
                     <--response-- (data)
Client --request--> Server (holds connection open again...)
\`\`\`

This gets much closer to real-time delivery than short polling — data reaches the client the moment it's available, not on the next fixed interval — while still using plain HTTP under the hood, so it works through the same infrastructure (proxies, load balancers, firewalls) as any other HTTP request with no special handling required. The cost is on the server: it now has to hold open a large number of idle-but-connected requests simultaneously, each consuming a thread or connection slot while waiting, which doesn't scale as gracefully as a stateless request/response model once you have many concurrent clients.

## WebSockets: stop asking, just stay connected

A WebSocket starts life as a normal HTTP request that asks to "upgrade" the connection; once the server agrees, that same TCP connection stays open indefinitely as a **full-duplex** channel — both client and server can push messages to each other at any time, with no request/response pairing required at all.

\`\`\`text
Client --HTTP upgrade request-->
                              <-- 101 Switching Protocols --
Client <====== persistent, bidirectional connection ======> Server
   Client can send anytime.  Server can push anytime.  No "asking" involved.
\`\`\`

This is the lowest-latency option and the only one of the three that lets the server push data without the client having initiated anything in that moment — genuinely necessary for something like a chat app where either side can send a message at any time. The trade-off is operational complexity: WebSocket connections are stateful and long-lived, which complicates horizontal scaling (a load balancer needs to route a client back to the same server instance holding its connection, or the backend needs a shared layer like Redis pub/sub to broadcast messages across server instances), and infrastructure like some corporate proxies or older load balancers may not handle the protocol upgrade cleanly.

## Choosing between them

| | Short polling | Long polling | WebSockets |
|---|---|---|---|
| Latency | Bound by poll interval | Near-immediate | Immediate |
| Server cost per idle client | Low (brief requests) | Moderate (held-open connections) | Moderate-high (persistent connection) |
| Infrastructure complexity | None | None (plain HTTP) | Higher (sticky routing / pub-sub for scale) |
| Good fit | Infrequent updates, simplicity matters more than freshness | Real-time-ish updates without WebSocket infrastructure | True bidirectional real-time (chat, collaborative editing, live gameplay) |

A practical rule of thumb: reach for short polling when staleness of a few seconds is genuinely fine (a dashboard metric that updates slowly), long polling when you want near-real-time delivery without taking on WebSocket infrastructure, and WebSockets specifically when the server needs to push unprompted or the interaction is genuinely bidirectional and frequent, like a live chat.

> **Key idea:** Short polling repeatedly asks and accepts staleness up to the poll interval, long polling asks once and lets the server hold the request open until there's something to say, and WebSockets abandon the request/response model entirely for a persistent, bidirectional connection — pick based on how fresh the data needs to be versus how much held-open-connection cost and infrastructure complexity you're willing to take on.`,
    },
  ],
}
