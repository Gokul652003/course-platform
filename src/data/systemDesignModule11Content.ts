import type { Module } from "../types"

export const systemDesignModule11: Module = {
  id: 11,
  title: "Security, Testing & Production Readiness",
  status: "upcoming",
  lessons: [
    {
      name: "Security Measures — Authentication, Authorization, SSL/TLS & SSDLC",
      minutes: 11,
      intro: "Separate authentication from authorization, see how SSL/TLS protects data in transit, and learn why security has to be designed in from the start rather than bolted on at the end.",
      content: `## Two questions that get confused constantly

Every system that isn't fully public needs to answer two different questions, and conflating them is one of the most common security mistakes in system design:

- **Authentication (AuthN): "Who are you?"** — verifying identity. A user proves they are who they claim to be, typically with a password, a one-time code, a biometric, or a token issued after an earlier successful login.
- **Authorization (AuthZ): "What are you allowed to do?"** — verifying permission. Once identity is established, authorization decides whether *this* identified user can read this document, delete that record, or call that endpoint.

A system can authenticate someone perfectly and still be broken if its authorization checks are missing or wrong — a logged-in user who can edit *anyone's* profile by changing an ID in the URL has an authentication system that works fine and an authorization system that doesn't exist. Interview-style system designs need to show both layers explicitly, not just "the user logs in."

## How authentication actually works, mechanism by mechanism

- **Sessions** — after a successful login, the server creates a session record (typically stored server-side, in Redis or a database) and gives the browser a session ID in a cookie. Every subsequent request carries that cookie; the server looks up the session ID to know who's asking. Simple and revocable (delete the session record to instantly log someone out everywhere), but it means every authenticated request needs a lookup against shared storage, which is state your load balancer and servers now have to account for.
- **Tokens (JWTs)** — a JSON Web Token is a signed, self-contained blob of claims (user ID, roles, expiry) that the server hands to the client after login. The client sends it back on every request (usually in an \`Authorization: Bearer <token>\` header), and the server verifies the signature instead of doing a storage lookup — which is what makes JWTs attractive for stateless, horizontally scaled APIs. The trade-off: a JWT is valid until it expires, and revoking one early (a stolen token, a fired employee) is awkward, because there's no central record to delete. Systems that need instant revocation either keep expiries short and refresh frequently, or maintain a denylist — which quietly reintroduces the server-side state JWTs were meant to avoid.
- **OAuth 2.0** — a protocol for *delegated* authorization: it lets a user grant a third-party app limited access to their data on another service ("Sign in with Google," "Allow this app to read your calendar") without ever handing that app their password. The core flow: the app redirects the user to the provider, the user approves a specific scope of access, the provider redirects back with an authorization code, and the app exchanges that code for an access token it can use on the user's behalf. It's a delegation protocol, not strictly an authentication one — "Sign in with X" flows layer an identity claim (OpenID Connect) on top of it.

## Authorization: RBAC and beyond

The most common authorization model in system design is **Role-Based Access Control (RBAC)**: users are assigned roles (\`admin\`, \`editor\`, \`viewer\`), and permissions are attached to roles rather than to individual users.

\`\`\`text
User ---> Role ---> Permissions
alice --> admin --> [read, write, delete, manage_users]
bob   --> viewer -> [read]
\`\`\`

This is attractive because permission changes become a matter of changing a small set of role definitions instead of editing every user record, and auditing "who can delete production data" reduces to auditing which roles carry that permission. Finer-grained systems layer **Attribute-Based Access Control (ABAC)** on top, where a decision depends on attributes of the user, the resource, and the context together (a doctor can view a patient's record only if they're assigned to that patient, and only during their shift) — more expressive, but harder to reason about and audit than plain RBAC.

## SSL/TLS: protecting data in transit

Even a perfectly authenticated, perfectly authorized request is worthless if the data travels over the network in plaintext — anyone on the path (a compromised router, a malicious Wi-Fi hotspot) can read or tamper with it. **TLS (Transport Layer Security)**, the modern successor to SSL, solves this by encrypting the connection between client and server. HTTPS is simply HTTP running over a TLS-encrypted connection.

At a conceptual level, establishing a TLS connection (the "handshake") does three things before a single byte of application data moves:

1. **Server authentication** — the server presents a certificate, issued by a trusted Certificate Authority, proving it really is the domain it claims to be. This is what stops a malicious server from silently impersonating your bank.
2. **Key exchange** — client and server agree on a shared symmetric encryption key for this session, using asymmetric cryptography to establish it securely even though they've never spoken before and are on an untrusted network.
3. **Symmetric encryption for the actual traffic** — once the shared key is agreed, all further data uses fast symmetric encryption (asymmetric crypto is used only briefly, to bootstrap trust, because it's far more computationally expensive).

The practical takeaway for system design: encryption in transit (TLS everywhere, including service-to-service traffic inside your own datacenter, not just the public edge) is a baseline expectation, not an advanced feature — and it's usually terminated at a load balancer or API gateway rather than in every individual service, which is worth calling out explicitly when you draw the architecture.

## Baking security in: the Secure SDLC

Security bolted on at the end of a project, as a final audit before launch, consistently finds expensive, structural problems too late to fix cheaply. The **Secure Software Development Life Cycle (SSDLC)** treats security as a concern at every phase of building software, not a gate at the last one:

| Phase | Security activity |
|---|---|
| Requirements | Identify what data is sensitive and what compliance rules apply (PII, payment data, healthcare data) |
| Design | Threat modeling — walk through the architecture asking "how could this be abused," design authN/authZ and encryption in from the start |
| Implementation | Secure coding practices, dependency scanning, avoiding known-bad patterns (string-concatenated SQL, unvalidated redirects) |
| Testing | Security-focused testing — penetration testing, static/dynamic analysis tools, fuzzing |
| Deployment | Hardened configuration, secrets management (never hard-coded credentials), least-privilege infrastructure access |
| Maintenance | Ongoing patching, monitoring for new vulnerabilities in dependencies, incident response planning |

The underlying principle is the same one that shows up everywhere in reliability engineering: a problem is dramatically cheaper to fix the earlier it's caught, and security is no exception — a threat model built during design costs a conversation, while the same gap found in production after a breach costs an incident.

> **Key idea:** Authentication answers "who are you" (sessions, JWTs, OAuth) while authorization answers "what can you do" (commonly RBAC) — both are required, and neither substitutes for the other; TLS encrypts data in transit via a handshake that authenticates the server and negotiates a shared key; and the Secure SDLC treats security as a concern threaded through every phase of development rather than a final pre-launch check.`,
    },
    {
      name: "Testing Strategies for Reliable Systems",
      minutes: 10,
      intro: "Place unit and integration testing in the testing pyramid, distinguish load testing from stress testing, and see how a CI/CD pipeline turns testing into a repeatable, automatic gate.",
      content: `## The testing pyramid: not all tests are equal

A reliable system isn't reliable because someone tested it once — it's reliable because a layered set of automated tests catches different classes of bugs at different levels, cheaply and repeatedly, every time the code changes. The classic mental model is a pyramid: many small, fast tests at the bottom, fewer, slower, broader tests near the top.

\`\`\`text
        /\\
       /  \\      End-to-end / manual exploratory (few, slow, expensive)
      /----\\
     / Integ \\   Integration tests (moderate count)
    /--------\\
   /   Unit    \\ Unit tests (many, fast, cheap)
  /------------\\
\`\`\`

## Unit testing: one function or class, in isolation

A **unit test** exercises the smallest testable piece of code — typically a single function or class — in complete isolation from the rest of the system, with external dependencies (a database, a network call, another service) replaced by mocks or stubs. If a function calculates a shipping fee from weight and destination, its unit test calls it directly with known inputs and asserts on the output — no server running, no database involved.

Unit tests are fast (milliseconds each), so a suite of thousands can run on every code change, and because they isolate one unit at a time, a failure points precisely at the broken piece. What they *don't* verify is whether the pieces work correctly *together* — a function can pass every unit test while still breaking when wired into the real system, if the way it's actually called doesn't match the test's assumptions.

## Integration testing: do the pieces actually work together

**Integration tests** exercise multiple components together — a service talking to a real (or realistic) database, two internal services calling each other over the network, an API endpoint tested through actual HTTP requests rather than direct function calls. They catch the class of bug unit tests structurally can't: mismatched assumptions at a boundary (a service expects a field the caller never sends), a real database constraint that mocks didn't enforce, serialization bugs that only appear once data actually crosses a network hop.

They're slower and more expensive to run than unit tests — spinning up a real database or a small cluster of services takes real time — so a healthy test suite has far more unit tests than integration tests, using integration tests specifically for the boundaries where components meet, not to re-verify logic already covered at the unit level.

## Load testing vs. stress testing: two different questions

Both simulate traffic against a system before real users do, but they ask fundamentally different questions:

| | Load testing | Stress testing |
|---|---|---|
| Question | "Does the system handle *expected* traffic correctly?" | "Where does the system actually break?" |
| Traffic level | Realistic, expected peak load | Deliberately pushed beyond expected capacity, ramped until failure |
| Goal | Validate performance under normal-to-peak conditions (latency, error rate stay acceptable) | Find the breaking point and observe *how* it fails |
| Typical finding | "p99 latency is 180ms at 10,000 req/s, within SLA" | "At 40,000 req/s the connection pool exhausts and the database starts timing out, cascading into 500s everywhere" |

Load testing answers "will this survive launch day at the traffic we expect," while stress testing answers "what happens if we're wrong about that estimate, and does the system degrade gracefully or fall over catastrophically." Both matter: a system that only ever gets load-tested at expected traffic has no idea whether a viral spike takes it down cleanly or takes down unrelated services with it.

## CI/CD: making testing automatic instead of optional

Tests that exist but that someone has to remember to run get skipped under deadline pressure — which is exactly when they're needed most. A **CI/CD pipeline** (Continuous Integration / Continuous Deployment) removes that human judgment call by wiring testing directly into the path code takes from a developer's laptop to production:

\`\`\`text
Code pushed ---> Build ---> Automated tests ---> Deploy (staging) ---> Automated tests ---> Deploy (production)
                    |             |                                         |
                 compile      unit + integration                    smoke tests / canary
\`\`\`

- **Continuous Integration** — every code change is automatically built and tested the moment it's pushed, catching integration problems within minutes instead of days later when someone else's unrelated change collides with it.
- **Continuous Deployment** — changes that pass every gate flow automatically toward production, often through a staging environment and increasingly cautious rollout (canary or blue-green deployment), rather than a manual, error-prone release process.

The value isn't just automation for its own sake — it's the feedback loop. A bug caught by CI ten minutes after being introduced, while the change is still fresh in the author's head, is dramatically cheaper to fix than the same bug discovered days later during a manual QA pass, or worse, after it ships.

> **Key idea:** Unit tests isolate and verify individual pieces fast and cheaply; integration tests verify the boundaries where those pieces meet, at real but higher cost; load testing confirms the system behaves correctly at expected traffic while stress testing finds where it actually breaks and how; and a CI/CD pipeline turns all of this from an optional manual step into an automatic, repeatable gate on every change.`,
    },
  ],
}
