import type { Module } from "../types"

export const nextjsModule9: Module = {
  id: 9,
  title: "Authentication & Middleware",
  status: "upcoming",
  lessons: [
    {
      name: "Authentication Patterns Overview",
      minutes: 8,
      intro: "The two broad approaches to knowing who's making a request, and where Next.js fits in.",
      content: `### Sessions vs tokens, at a glance

- **Session-based** — after login, the server creates a session record (in a database or in-memory store) and gives the browser a cookie containing just a session ID. Every request, the server looks up that ID to find out who's asking. The server can revoke a session instantly by deleting the record.
- **Token-based (JWT)** — after login, the server issues a signed token containing the user's identity directly, stored in a cookie or elsewhere. The server verifies the signature on each request without a database lookup — faster, but harder to revoke early (the token stays valid until it expires, unless you build a separate revocation mechanism).

Next.js doesn't mandate either approach — it provides the primitives (cookies, middleware, Server Components with server-only code) that either pattern is built on top of.

### Where auth logic lives in a Next.js app

\`\`\`
1. Login form submits to a Server Action or Route Handler
2. That handler verifies credentials, creates a session/token
3. A cookie is set on the response (httpOnly, secure)
4. Middleware checks that cookie on subsequent requests to protected routes
5. Server Components read the session (via cookies()) to know who's logged in
\`\`\`

Every piece of this — verifying credentials, setting the cookie, checking it later — runs entirely on the server, which is exactly why Server Components and Server Actions (never exposing secrets or verification logic to the browser) are a natural fit for building auth from scratch.

### Roll your own, or use a library?

Building authentication from scratch means correctly handling password hashing, session/token security, CSRF protection, and edge cases (password reset, email verification) that are easy to get subtly wrong. For most real projects, an established library — **Auth.js** (formerly NextAuth.js) or a hosted service like **Clerk** or **Supabase Auth** — handles these correctly out of the box, and is the practical recommendation for anything beyond a learning exercise. This module builds the underlying concepts from scratch specifically so a library's behavior isn't a black box when you do reach for one.

### The core question every protected route asks

\`\`\`
Is this request associated with a valid, still-active session?
  Yes -> proceed, and know WHO is making the request
  No  -> redirect to login, or return 401
\`\`\`

Every pattern in this module — middleware checks, reading cookies in Server Components, checks inside Server Actions — is answering some version of this one question, just at different points in the request lifecycle.

> **Key idea:** authentication in Next.js isn't a separate framework feature — it's built from the same primitives covered elsewhere in this course (cookies, middleware, Server Actions, server-only code), which is why understanding those pieces first makes auth libraries' behavior legible rather than magic.`,
    },
    {
      name: "Cookies, Sessions & Server Components",
      minutes: 9,
      intro: "Setting a session cookie on login, and reading it wherever the app needs to know who's logged in.",
      content: `### Setting a session cookie after login

\`\`\`tsx
"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await verifyCredentials(email, password)
  if (!user) {
    return { error: "Invalid email or password" }
  }

  const sessionId = await createSession(user.id)

  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect("/dashboard")
}
\`\`\`

A Server Action is a natural place to handle login — it runs only on the server, can verify credentials against a database directly, and can set a cookie on the response before redirecting.

- \`httpOnly\` — client-side JavaScript can't read this cookie, limiting damage from an XSS vulnerability elsewhere in the app.
- \`secure\` — only sent over HTTPS.
- \`sameSite: "lax"\` — a meaningful CSRF mitigation, restricting when the cookie is sent along with cross-site requests.

### Reading the session in a Server Component

\`\`\`tsx
// lib/session.ts
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  if (!sessionId) return null

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })
  return session?.user ?? null
}
\`\`\`

\`\`\`tsx
// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <h1>Welcome back, {user.name}</h1>
}
\`\`\`

Because this all runs on the server, reading and verifying the session never exposes any of this logic — or the session lookup itself — to the browser. A small \`getCurrentUser\` helper like this becomes the one place session-reading logic lives, reused across every Server Component that needs to know who's logged in.

### Logging out: clearing the cookie

\`\`\`tsx
"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session_id")
  redirect("/login")
}
\`\`\`

Deleting the cookie is enough for a session-based approach, since the server-side session lookup will simply fail on the next request — for extra safety, you'd also delete the corresponding session record from the database, invalidating it immediately rather than relying solely on the cookie's absence.

> **Key idea:** \`cookies()\` from \`next/headers\` is the one API used both to *set* a session cookie (in a Server Action, at login) and to *read* it back later (in any Server Component that needs to know who's logged in) — all of it running server-side, never exposed to client JavaScript.`,
    },
    {
      name: "Protecting Routes with Middleware",
      minutes: 8,
      intro: "A single, central check that guards every protected route, rather than repeating auth checks per page.",
      content: `### The pattern, building on the middleware basics module

\`\`\`ts
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")

  if (!sessionId) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}
\`\`\`

This single file protects every route under \`/dashboard\` and \`/settings\` — no need to duplicate an "am I logged in" check inside every individual page's component. Preserving the originally-requested path as a \`redirectTo\` query parameter lets the login page send the user back to where they were headed once they actually log in.

### Why middleware only checks cookie *presence*, not full validity

Recall from the middleware basics module: middleware runs in a restricted Edge runtime, which typically can't make a database call to fully verify a session is still valid (not expired, not revoked). The practical pattern is a two-layer check: middleware does a fast, cheap check (does a session cookie exist at all?) to block obviously-unauthenticated requests early, while the actual page (in a full Server Component, which *can* hit the database) does the complete, authoritative check via something like the \`getCurrentUser\` helper from the previous lesson.

\`\`\`tsx
// app/dashboard/page.tsx — the authoritative check still happens here
export default async function Dashboard() {
  const user = await getCurrentUser()  // real DB lookup, confirms the session is actually still valid
  if (!user) redirect("/login")
  return <h1>Welcome, {user.name}</h1>
}
\`\`\`

Middleware is a fast first filter, not a replacement for checking properly inside the route itself — this mirrors the Server Actions security lesson from earlier: never assume a check performed "upstream" is sufficient on its own.

### Redirecting logged-in users away from the login page

\`\`\`ts
export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")
  const isAuthPage = request.nextUrl.pathname === "/login"

  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthPage && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
\`\`\`

A common refinement: also redirect an already-logged-in user *away* from the login page — visiting \`/login\` while already authenticated should send them straight to the dashboard instead of showing a login form they don't need.

> **Key idea:** middleware provides a fast, centralized first check across every protected route via one \`matcher\` — but because it can't reliably do a full database-backed validity check, the actual page still needs its own authoritative check, exactly as covered in the previous lesson.`,
    },
    {
      name: "Using an Auth Library",
      minutes: 7,
      intro: "Why most real projects reach for Auth.js or a hosted provider instead of hand-rolling everything.",
      content: `### What the previous two lessons didn't cover

Building auth from scratch, as in the last two lessons, glossed over several things a production app needs: password hashing (never store plain-text passwords — needs a proper algorithm like bcrypt/argon2), CSRF protection beyond \`sameSite\`, OAuth login ("Sign in with Google/GitHub"), email verification, password reset flows, and rate-limiting login attempts against brute-force attacks. Each of these has real, well-known security pitfalls if implemented incorrectly.

### Auth.js: the common library choice

\`\`\`ts
// auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
})
\`\`\`

\`\`\`ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
\`\`\`

Auth.js (the successor to NextAuth.js) plugs directly into Route Handlers using the same \`[...slug]\` catch-all pattern from the routing module, and provides pre-built OAuth integrations for dozens of providers (GitHub, Google, and many more) — sign-in with a third-party provider becomes a few lines of configuration rather than implementing an OAuth flow by hand.

### Reading the session with Auth.js

\`\`\`tsx
import { auth } from "@/auth"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <h1>Welcome, {session.user.name}</h1>
}
\`\`\`

Notice the shape of this: it's conceptually identical to the hand-rolled \`getCurrentUser()\` helper from two lessons ago — a server-only function that returns the current user or \`null\`. Auth.js doesn't replace the mental model this module built; it replaces the parts that are genuinely risky and tedious to implement correctly yourself.

### Hosted alternatives

Services like **Clerk** and **Supabase Auth** go a step further, hosting the entire user database and auth UI for you — you integrate their SDK rather than managing sessions, password hashing, or a users table in your own database at all. A reasonable choice when you want to spend near-zero engineering time on auth specifically, at the cost of an external dependency and (for larger user bases) a subscription cost.

### A practical recommendation

For a learning project or an internal tool with simple needs, the hand-rolled approach from this module is genuinely fine — it's real, working, secure-enough authentication. For anything user-facing and public, reach for Auth.js or a hosted provider — the parts they handle (password security, OAuth, CSRF) are exactly the parts where a subtle mistake has serious consequences, and reinventing them adds risk without adding much value.

> **Key idea:** the concepts from this module (cookies, sessions, middleware-based protection) are exactly what libraries like Auth.js implement underneath — knowing them makes evaluating and configuring such a library straightforward, rather than treating it as an unexplainable black box.`,
    },
  ],
}
