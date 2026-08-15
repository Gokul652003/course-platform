import type { Module } from "../types"

export const nextjsModule7: Module = {
  id: 7,
  title: "API Routes & Route Handlers",
  status: "upcoming",
  lessons: [
    {
      name: "Your First Route Handler",
      minutes: 8,
      intro: "Building a real HTTP endpoint inside your Next.js app, with a special filename.",
      content: `### route.ts: another special filename

\`\`\`
app/
  api/
    hello/
      route.ts    -> handles requests to /api/hello
\`\`\`

\`\`\`ts
// app/api/hello/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" })
}
\`\`\`

Just like \`page.tsx\` makes a folder a visitable page, \`route.ts\` makes a folder a real HTTP endpoint — visiting \`/api/hello\` in a browser (or calling it with \`curl\`, or from any client) hits this function and gets back JSON.

### Why you'd reach for a Route Handler instead of a Server Action

Recall from the previous module: Server Actions handle mutations triggered from your own app's forms and UI elements. Route Handlers are for when you need a genuine, conventional HTTP endpoint — one consumed by an external client (a mobile app, a third-party webhook, a public API), not just your own Next.js pages.

### Handling different HTTP methods

\`\`\`ts
// app/api/posts/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  const posts = await db.post.findMany()
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}
\`\`\`

Export a function named after the HTTP method (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`) — Next.js routes an incoming request to the matching export automatically. A method with no corresponding export returns an automatic \`405 Method Not Allowed\`.

### Dynamic segments work exactly like pages

\`\`\`ts
// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(post)
}
\`\`\`

The exact same \`[param]\` folder convention from the routing module applies here — \`/api/posts/[id]/route.ts\` handles \`/api/posts/abc123\`, with \`abc123\` available as \`params.id\`.

> **Key idea:** \`route.ts\` turns a folder into a real HTTP endpoint, using the same file-based conventions (including dynamic segments) as pages — export a function named for the HTTP method you want to handle.`,
    },
    {
      name: "Request & Response Helpers",
      minutes: 9,
      intro: "Reading query strings, headers, and bodies — and shaping the responses you send back.",
      content: `### Reading the URL and query string

\`\`\`ts
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")
  const results = await search(query ?? "")
  return NextResponse.json(results)
}
\`\`\`

\`NextRequest\` extends the standard Web \`Request\` object with a few Next.js-specific conveniences — \`nextUrl\` is one of them, giving you an already-parsed URL object rather than manually parsing \`request.url\` yourself.

### Reading a JSON body

\`\`\`ts
export async function POST(request: Request) {
  const body = await request.json()
  // body is now a plain JS object, parsed from the request's JSON payload
  const post = await db.post.create({ data: { title: body.title } })
  return NextResponse.json(post, { status: 201 })
}
\`\`\`

\`request.json()\` is asynchronous — the body has to be read as a stream and parsed, which is why it's always awaited.

### Reading headers and cookies

\`\`\`ts
import { headers, cookies } from "next/headers"

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")

  return NextResponse.json({ authHeader, sessionId: sessionId?.value })
}
\`\`\`

\`headers()\` and \`cookies()\` from \`next/headers\` work in Route Handlers exactly as they do in Server Components — read-only access to incoming request headers and cookies.

### Setting a response's status code and headers

\`\`\`ts
export async function POST(request: Request) {
  const body = await request.json()
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, {
    status: 201,
    headers: { "X-Custom-Header": "value" },
  })
}
\`\`\`

\`NextResponse.json\`'s second argument accepts the same options a standard \`Response\` would — status code, custom headers — giving you full control over exactly what gets sent back.

### Setting a cookie on the response

\`\`\`ts
export async function POST(request: Request) {
  const response = NextResponse.json({ success: true })
  response.cookies.set("session_id", "abc123", { httpOnly: true, secure: true })
  return response
}
\`\`\`

\`httpOnly: true\` prevents client-side JavaScript from reading the cookie (protecting against certain XSS-based cookie theft), and \`secure: true\` ensures it's only sent over HTTPS — both worth setting by default for any cookie holding session or auth data.

> **Key idea:** Route Handlers work with standard Web \`Request\`/\`Response\` objects, extended with a few Next.js conveniences (\`NextRequest\`, \`NextResponse\`, and the \`headers\`/\`cookies\` helpers) — if you already know the Fetch API, most of this is familiar syntax in a new context.`,
    },
    {
      name: "Building a Small REST API",
      minutes: 9,
      intro: "Putting GET, POST, and dynamic routes together into a real, working resource.",
      content: `### The resource: a simple posts API

\`\`\`ts
// app/api/posts/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "A valid title is required" }, { status: 400 })
  }

  const post = await db.post.create({ data: { title: body.title } })
  return NextResponse.json(post, { status: 201 })
}
\`\`\`

\`\`\`ts
// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  const post = await db.post.update({ where: { id }, data: body })
  return NextResponse.json(post)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await db.post.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
\`\`\`

### The complete surface

\`\`\`
GET    /api/posts        -> list all posts
POST   /api/posts        -> create a post
GET    /api/posts/[id]   -> get one post
PATCH  /api/posts/[id]   -> update one post
DELETE /api/posts/[id]   -> delete one post
\`\`\`

Two files (\`route.ts\` at the collection level, \`[id]/route.ts\` at the individual-resource level) cover the standard five-endpoint REST pattern — no separate router configuration needed to wire any of it together.

### Validation matters at the boundary

Every handler above that accepts a body checks it before touching the database — an API route is a genuine trust boundary (unlike calling your own function internally, you can't assume the caller sent well-formed data). This mirrors the "validate at system boundaries" principle worth applying to any externally-callable endpoint, Route Handlers included.

### Testing it

\`\`\`bash
curl http://localhost:3000/api/posts
curl -X POST http://localhost:3000/api/posts -H "Content-Type: application/json" -d '{"title":"Hello"}'
curl -X DELETE http://localhost:3000/api/posts/abc123
\`\`\`

Since these are genuine HTTP endpoints, any HTTP client — \`curl\`, Postman, a mobile app, another service entirely — can call them, unlike Server Actions, which are meant to be called from your own app's UI.

> **Key idea:** a full REST resource is just two \`route.ts\` files — one for the collection, one for an individual item by ID — each exporting the HTTP methods it supports, with request validation happening explicitly inside each handler.`,
    },
    {
      name: "Middleware Basics",
      minutes: 8,
      intro: "Code that runs before a request reaches any route — for cross-cutting concerns.",
      content: `### middleware.ts: one file, runs before everything

\`\`\`ts
// middleware.ts (at the project root, next to app/)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log(\`Incoming request: \${request.method} \${request.nextUrl.pathname}\`)
  return NextResponse.next()
}
\`\`\`

A single \`middleware.ts\` file at the project root runs **before** a request reaches any matching route — page, layout, or Route Handler. \`NextResponse.next()\` tells Next.js to continue on to the actual route as normal; middleware can also redirect, rewrite, or block the request entirely before it gets there.

### Scoping middleware to specific paths

\`\`\`ts
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
\`\`\`

Without a \`matcher\`, middleware runs on *every* request — often not what you want. The \`config.matcher\` export restricts it to specific path patterns, so (for instance) authentication-checking middleware only runs on the routes that actually need protecting.

### A common use case: redirecting unauthenticated users

\`\`\`ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
\`\`\`

Because middleware runs before the route even starts rendering, this is more efficient than checking auth inside every individual page — one central check, applied to every path the matcher covers, rather than duplicating the same check across many pages.

### Rewriting a request to a different path

\`\`\`ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/old-path") {
    return NextResponse.rewrite(new URL("/new-path", request.url))
  }
  return NextResponse.next()
}
\`\`\`

Unlike a redirect (which changes the URL the browser shows), a rewrite serves different content **at the same URL** the user sees — invisible to the visitor, useful for things like A/B testing or serving a different page for a legacy URL without breaking bookmarks.

### Middleware is intentionally lightweight

Middleware runs in a restricted **Edge runtime** — not full Node.js — specifically so it can execute extremely fast, geographically close to the visitor, before the rest of your app's infrastructure is even involved. This means some Node.js-specific APIs and many npm packages aren't available inside middleware; keep it focused on fast, simple checks (auth cookie presence, redirects, header inspection) rather than heavy logic or direct database calls.

> **Key idea:** middleware runs before any matched route, in a fast, restricted Edge runtime — ideal for cross-cutting concerns like auth checks and redirects applied uniformly across many routes via a single \`matcher\`, but not a place for heavy or database-dependent logic.`,
    },
  ],
}
