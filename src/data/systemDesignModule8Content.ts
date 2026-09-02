import type { Module } from "../types"

export const systemDesignModule8: Module = {
  id: 8,
  title: "API Gateway, Messaging & Rate Limiting",
  status: "upcoming",
  lessons: [
    {
      name: "API Gateway — Role & Responsibilities",
      minutes: 10,
      intro: "See what an API gateway does in a microservices architecture, and why funneling clients through one entry point beats calling services directly.",
      content: `## The problem of many services, many clients

A microservices architecture (Module 2) can easily end up with dozens of independently deployed services — an orders service, a users service, a payments service, an inventory service. If every client (a web app, a mobile app, a third-party integrator) had to know the network address of every single service and call each one directly, a few problems show up immediately:

- Clients need to know internal service topology — which is meant to be an implementation detail, not a public contract.
- Every service has to reimplement cross-cutting concerns (auth, rate limiting, logging) independently, or those concerns simply don't happen consistently.
- A UI screen that needs data from five different services has to make five separate round trips from the client, over a slower public network, instead of one.
- Changing internal service boundaries (splitting one service into two, merging two into one) breaks every client that hard-codes the old topology.

An **API gateway** is a single entry point that sits between clients and the collection of backend services, and takes on exactly these cross-cutting concerns so individual services don't have to.

\`\`\`text
                          ┌──────────────┐
Web client   ───┐         │              │──► Orders service
Mobile client ───┼───────►│  API Gateway │──► Users service
3rd-party API ───┘         │              │──► Payments service
                          └──────────────┘──► Inventory service
\`\`\`

## Core responsibilities

An API gateway typically owns a bundle of concerns that would otherwise be duplicated across every service:

- **Routing** — inspecting the incoming request (path, host, headers) and forwarding it to the correct backend service, without the client needing to know that service's actual address.
- **Authentication & authorization** — verifying who the caller is (validating a token, checking an API key) once, at the edge, instead of every downstream service reimplementing the same check.
- **Request/response transformation** — reshaping a request or response between what the client expects and what the backend actually returns (renaming fields, converting formats, stripping internal-only data before it reaches the client).
- **Aggregation** — combining calls to multiple backend services into a single response, so a client that needs "order details plus the buyer's profile plus shipping status" makes one request to the gateway instead of three separate round trips itself.
- **TLS termination** — handling the HTTPS handshake and decryption once at the gateway, so internal traffic between the gateway and backend services can run over a simpler, unencrypted (or separately-secured) internal network.
- **Rate limiting & throttling** — enforcing per-client or per-API usage limits centrally (the full mechanics are the subject of the last lesson in this module).
- **Observability** — a natural single point to log every request, collect latency metrics, and trace requests as they enter the system, since all external traffic passes through it.

## Why centralize this instead of duplicating it per service

The alternative to a gateway isn't "no cross-cutting concerns" — it's the *same* concerns, reimplemented independently (and inconsistently) inside every service. Centralizing at the gateway means:

- **One place to fix a security bug** — if a token-validation bug is found, it's patched once at the gateway, not audited across every service that might have its own copy of similar logic.
- **Consistent behavior** — every client experiences the same rate limits, the same auth error format, the same request-ID header, regardless of which backend service ultimately handled the request.
- **Backend services stay focused** — an orders service can focus entirely on order logic, trusting that a request reaching it has already been authenticated and rate-limited by the layer in front.

The trade-off is that the gateway becomes a critical, shared piece of infrastructure — if it goes down, *everything* behind it becomes unreachable from outside, and if it's under-provisioned, it becomes the bottleneck for the whole system regardless of how well individual services scale. Because of this, gateways are typically deployed as a horizontally scaled, load-balanced tier in their own right (tying back to Module 6), not a single box.

## Gateway vs load balancer: not the same layer

It's easy to conflate the two since both sit "in front" of backend services, but they solve different problems:

| | Load balancer | API gateway |
|---|---|---|
| Primary job | Distribute traffic across replicas of *one* service | Route and manage traffic across *many different* services |
| Operates at | Typically transport/connection level (L4) or basic HTTP (L7) | Application level — understands API semantics, paths, payloads |
| Knows about business logic | No | Often yes — auth rules, per-API limits, request shaping |

In practice, a real deployment usually has both: a load balancer distributes incoming traffic across multiple API gateway instances, and the gateway then routes each request to the correct backend service, which itself sits behind its own load balancer across its own replicas.

## A concrete example

A mobile app screen showing "your order" might need: the order itself, the current user's shipping address, and a live delivery estimate — three different backend services. Without a gateway, the mobile app makes three separate calls, each needing its own auth token validated independently, each over the (often slower, less reliable) public mobile network. With a gateway offering an aggregation endpoint, the mobile app makes **one** call to \`/api/order-summary/{id}\`, and the gateway itself fans that out to the three backend services (over a fast internal network), combines the results, and returns one response — trading three slow round trips for one.

> **Key idea:** An API gateway is the single entry point between external clients and a system's backend services, centralizing routing, authentication, request/response transformation, aggregation, TLS termination, rate limiting, and observability so individual services don't each have to reimplement them — at the cost of the gateway becoming shared, critical infrastructure that itself needs to be scaled and made highly available.`,
    },
  ],
}
