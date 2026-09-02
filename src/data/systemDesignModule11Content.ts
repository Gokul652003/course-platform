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
  ],
}
