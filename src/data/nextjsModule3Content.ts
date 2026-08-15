import type { Module } from "../types"

export const nextjsModule3: Module = {
  id: 3,
  title: "Rendering Fundamentals",
  status: "upcoming",
  lessons: [
    {
      name: "Server Components vs Client Components",
      minutes: 10,
      intro: "The single biggest mental shift the App Router asks of a React developer.",
      content: `### Server Components are the default

\`\`\`tsx
// app/page.tsx — this is a Server Component, with no special syntax needed
export default async function HomePage() {
  const data = await fetch("https://api.example.com/posts").then((r) => r.json())
  return <PostList posts={data} />
}
\`\`\`

Every component in the App Router is a **Server Component** unless you explicitly opt out. It runs only on the server — never shipped to the browser as JavaScript at all. This is a real, fundamental shift from earlier React: components can be \`async\`, can call \`await\` directly, and can touch server-only resources (databases, the filesystem, private environment variables) safely, because none of that code — or its dependencies — is ever sent to the client.

### Opting into Client Components

\`\`\`tsx
"use client"

import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
\`\`\`

The \`"use client"\` directive at the top of a file marks it — and everything it imports — as a **Client Component**: it runs in the browser, and is the only place you can use interactive React features like \`useState\`, \`useEffect\`, \`onClick\` handlers, or browser-only APIs.

### Why the split exists

| | Server Component | Client Component |
|---|---|---|
| Runs | Only on the server | Server (initial render) + browser |
| Can use hooks (\`useState\`, \`useEffect\`) | No | Yes |
| Can be \`async\`/await directly | Yes | No |
| Ships JavaScript to the browser | No | Yes |
| Can access secrets/databases directly | Yes | No — never |

Server Components ship **zero JavaScript** for that component to the browser — smaller bundles, faster page loads, and safe direct access to backend resources. Client Components are what give you interactivity — but that interactivity has a real cost: JavaScript the browser must download, parse, and run.

### The practical rule of thumb

Default to a Server Component. Add \`"use client"\` only when a component genuinely needs interactivity — state, effects, event handlers, or browser-only APIs (\`window\`, \`localStorage\`). Push \`"use client"\` as far down the component tree as possible — a small interactive button doesn't require its entire parent page to become a Client Component too.

> **Key idea:** Server Components are the default, run only on the server, and ship no JS to the browser. \`"use client"\` opts a component (and its imports) into running in the browser too — reach for it only when you actually need interactivity.`,
    },
    {
      name: "The Server/Client Boundary",
      minutes: 9,
      intro: "How Server and Client Components actually compose together, and the rules for crossing between them.",
      content: `### Server Components can render Client Components

\`\`\`tsx
// app/page.tsx (Server Component)
import { Counter } from "./Counter"   // a Client Component

export default function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      <Counter />
    </div>
  )
}
\`\`\`

This is the most common pattern: a page is a Server Component that fetches data and lays out the page, importing small, focused Client Components wherever actual interactivity is needed.

### Client Components cannot import Server Components directly

\`\`\`tsx
"use client"

// This does NOT work as you'd expect —
// a component imported here becomes a Client Component too,
// because "use client" applies to the whole module graph from this file down.
import { ServerOnlyComponent } from "./ServerOnlyComponent"
\`\`\`

Once you're inside a \`"use client"\` file, everything you import is bundled for the client too — you can't reach back into server-only code from there. The fix, when you genuinely need server-rendered content *inside* a client component's tree, is passing it as \`children\`:

\`\`\`tsx
// app/page.tsx (Server Component)
import { ClientWrapper } from "./ClientWrapper"
import { ServerContent } from "./ServerContent"

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent />
    </ClientWrapper>
  )
}
\`\`\`

\`\`\`tsx
"use client"
// app/ClientWrapper.tsx
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div className="interactive-shell">{children}</div>
}
\`\`\`

Because \`ServerContent\` is passed in as \`children\` from the *parent* Server Component (not imported directly inside the client file), it's still rendered on the server — \`ClientWrapper\` never needs to know or care what's inside \`{children}\`.

### Passing data across the boundary: props must be serializable

\`\`\`tsx
// Server Component
import { LikeButton } from "./LikeButton"

export default async function Post({ id }: { id: string }) {
  const post = await getPost(id)
  return <LikeButton postId={post.id} initialLikes={post.likes} />
}
\`\`\`

Props passed from a Server Component down into a Client Component must be **serializable** — plain objects, arrays, strings, numbers, booleans. You cannot pass a function, a class instance, or a database connection as a prop into a Client Component — there's no way to send a live server-side function reference across to the browser.

> **Key idea:** data flows one way across the boundary — Server Components can pass serializable props down into Client Components, and can pass rendered server content *through* a Client Component via \`children\`. A Client Component can never import and directly render a Server Component.`,
    },
    {
      name: "Rendering Strategies: Static, Dynamic & ISR",
      minutes: 10,
      intro: "When a page is built once, rebuilt on demand, or rendered fresh on every request.",
      content: `### Static rendering: the default

\`\`\`tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>
}
\`\`\`

If a route has no dynamic data dependency (no \`fetch\` using dynamic options, no reading of cookies/headers/searchParams), Next.js renders it **once, at build time**, and serves the identical pre-rendered HTML to every visitor — the fastest possible response, since there's no per-request rendering work at all.

### Dynamic rendering: rendered per request

\`\`\`tsx
import { cookies } from "next/headers"

export default async function Dashboard() {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")
  return <h1>Welcome back — theme: {theme?.value}</h1>
}
\`\`\`

The moment a route reads something request-specific — cookies, headers, \`searchParams\`, or an explicitly uncached \`fetch\` — Next.js automatically switches that route to **dynamic rendering**: it renders fresh, on the server, for every single request. Necessary for genuinely personalized content, but slower than static rendering since there's real work happening on every visit.

### Incremental Static Regeneration (ISR): the middle ground

\`\`\`tsx
export const revalidate = 3600  // seconds

export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json())
  return <PostList posts={posts} />
}
\`\`\`

\`revalidate\` tells Next.js: serve the statically-generated page instantly (like pure static rendering), but after this many seconds, regenerate it in the background on the next request. Visitors always get a fast, pre-rendered response — the content just isn't allowed to go stale for more than the specified window. This is the sweet spot for content that changes occasionally (blog posts, product listings) but doesn't need to be perfectly real-time.

### Comparing the three

| | Static | ISR | Dynamic |
|---|---|---|---|
| Rendered | Once, at build | Once, then periodically refreshed | Every request |
| Speed | Fastest | Fast (served from cache) | Slower (real work per request) |
| Freshness | Fixed at build time | Refreshes on your interval | Always current |
| Good for | Marketing pages, docs | Blogs, product catalogs | Dashboards, personalized content |

### Forcing a specific strategy

\`\`\`tsx
export const dynamic = "force-static"     // always render statically
export const dynamic = "force-dynamic"    // always render per-request
\`\`\`

Next.js infers the right strategy automatically most of the time based on what your code actually does — but these exports let you explicitly override the choice when the automatic inference doesn't match what you actually want.

> **Key idea:** static rendering is the fast default; reading request-specific data (cookies, headers, searchParams) automatically opts a route into dynamic rendering; \`revalidate\` gives you a controlled middle ground that serves cached HTML but refreshes it on a schedule.`,
    },
    {
      name: "Streaming & Suspense",
      minutes: 9,
      intro: "Showing part of a page immediately, while slower data is still loading.",
      content: `### The problem: one slow fetch blocks the whole page

\`\`\`tsx
// without streaming: the ENTIRE page waits for the slowest fetch
export default async function Dashboard() {
  const stats = await getStats()          // fast
  const recommendations = await getRecommendations()   // slow — takes 3 seconds
  return (
    <div>
      <Stats data={stats} />
      <Recommendations data={recommendations} />
    </div>
  )
}
\`\`\`

Without streaming, the visitor sees a completely blank page for the full 3 seconds, even though the fast \`stats\` data was ready almost immediately — the whole response waits for the slowest piece.

### loading.tsx: automatic streaming per route

\`\`\`tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard…</p>
}
\`\`\`

Just adding a \`loading.tsx\` file next to a \`page.tsx\` automatically wraps that page in a React Suspense boundary — Next.js immediately shows the loading UI, streams it to the browser, and swaps in the real page content the moment the page's data is ready. No manual Suspense wiring required for this route-level case.

### Suspense for finer-grained streaming within a page

\`\`\`tsx
import { Suspense } from "react"

export default async function Dashboard() {
  const stats = await getStats()   // awaited directly — blocks initial render

  return (
    <div>
      <Stats data={stats} />
      <Suspense fallback={<p>Loading recommendations…</p>}>
        <Recommendations />
      </Suspense>
    </div>
  )
}
\`\`\`

\`\`\`tsx
// Recommendations.tsx — a separate async Server Component
export async function Recommendations() {
  const data = await getRecommendations()  // slow
  return <RecommendationList data={data} />
}
\`\`\`

By moving the slow fetch into its own \`async\` component and wrapping it in \`<Suspense>\`, the fast \`stats\` section renders immediately, and the recommendations section streams in separately the moment its data resolves — the visitor sees useful content right away instead of a blank screen.

### Why this matters for perceived performance

Streaming doesn't make the slow data fetch itself any faster — the recommendations still take 3 seconds. What changes is that the *rest of the page* is no longer held hostage by the slowest piece. This is a genuinely different model from older approaches (show a full-page spinner, or wait for everything before rendering anything) — each part of the page can resolve and appear independently, in whatever order it's actually ready.

> **Key idea:** \`loading.tsx\` gives you automatic, route-level streaming for free; wrapping a specific slow component in \`<Suspense>\` lets you stream individual sections of a single page independently, so a slow section never blocks the fast ones around it.`,
    },
  ],
}
