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
  ],
}
