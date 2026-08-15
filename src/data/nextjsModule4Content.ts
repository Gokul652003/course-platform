import type { Module } from "../types"

export const nextjsModule4: Module = {
  id: 4,
  title: "Data Fetching & Caching",
  status: "upcoming",
  lessons: [
    {
      name: "Fetching Data in Server Components",
      minutes: 9,
      intro: "No useEffect, no loading state boilerplate — just await, directly in the component.",
      content: `### The old way vs the Server Component way

\`\`\`tsx
// the client-side way you may already know — NOT needed for this
"use client"
function Posts() {
  const [posts, setPosts] = useState(null)
  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts)
  }, [])
  if (!posts) return <p>Loading…</p>
  return <PostList posts={posts} />
}
\`\`\`

\`\`\`tsx
// the Server Component way
export default async function Posts() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json())
  return <PostList posts={posts} />
}
\`\`\`

Because Server Components can be \`async\` and \`await\` directly, an entire category of client-side data-fetching boilerplate — loading state, \`useEffect\`, error state, manually re-fetching on prop change — simply isn't needed for data a Server Component can fetch itself. The data is ready *before* the component ever renders.

### Fetching from a database directly

\`\`\`tsx
import { db } from "@/lib/db"

export default async function Posts() {
  const posts = await db.post.findMany()
  return <PostList posts={posts} />
}
\`\`\`

Since this code runs only on the server, it can talk directly to a database, filesystem, or any private backend resource — no separate API layer required just to get data from a database into a page, though you'll still often want one for reasons covered in the API routes module.

### Passing fetched data down to Client Components

\`\`\`tsx
// Server Component — does the fetching
import { LikeButton } from "./LikeButton"

export default async function Post({ id }: { id: string }) {
  const post = await getPost(id)
  return (
    <article>
      <h1>{post.title}</h1>
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  )
}
\`\`\`

The common pattern: fetch data in a Server Component (the parent), pass the specific pieces a Client Component needs down as props — recall from the previous module, those props must be serializable.

### Multiple independent fetches: parallel by default with Promise.all

\`\`\`tsx
export default async function Dashboard() {
  const [stats, activity] = await Promise.all([getStats(), getActivity()])
  return (
    <div>
      <Stats data={stats} />
      <Activity data={activity} />
    </div>
  )
}
\`\`\`

Two sequential \`await\` calls run one after another, adding their times together. \`Promise.all\` kicks both requests off at the same time — the total wait is roughly the slower of the two, not the sum. Worth doing by default whenever fetches don't depend on each other's results.

> **Key idea:** \`async\`/\`await\` directly inside a Server Component replaces most of the \`useEffect\`+loading-state pattern you may already know from client-side React — the data is fetched before the component renders at all, no separate loading state needed.`,
    },
    {
      name: "The fetch Cache & Revalidation",
      minutes: 10,
      intro: "Next.js extends the native fetch API with its own caching layer — worth understanding explicitly.",
      content: `### fetch is cached by default

\`\`\`tsx
const res = await fetch("https://api.example.com/posts")
\`\`\`

This might be surprising if you're used to \`fetch\` in the browser: inside a Next.js Server Component, \`fetch\` requests are **automatically cached** by default. The first request's response is stored, and subsequent identical requests (across different users, different requests) reuse that cached data instead of hitting the network again — effectively making the route statically renderable, per the rendering strategies lesson.

### Opting a specific fetch out of caching

\`\`\`tsx
const res = await fetch("https://api.example.com/live-scores", {
  cache: "no-store",
})
\`\`\`

\`cache: "no-store"\` tells Next.js this specific fetch should never be cached — always hit the network fresh. Using this also pushes the containing route toward dynamic rendering, since the data is now guaranteed fresh per-request.

### Time-based revalidation on a specific fetch

\`\`\`tsx
const res = await fetch("https://api.example.com/posts", {
  next: { revalidate: 60 },
})
\`\`\`

Similar to the route-level \`revalidate\` export from the previous module, but scoped to just this one \`fetch\` call — cache the response, but treat it as stale after 60 seconds and refresh it on the next request after that window.

### Tag-based revalidation: invalidate on demand

\`\`\`tsx
const res = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
})
\`\`\`

Tagging a fetch lets you invalidate it explicitly, from anywhere in your app (typically a Server Action, covered next module), rather than waiting for a time-based window to expire:

\`\`\`tsx
import { revalidateTag } from "next/cache"

async function createPost(formData: FormData) {
  "use server"
  await db.post.create({ /* ... */ })
  revalidateTag("posts")   // any fetch tagged "posts" is now considered stale
}
\`\`\`

This is the mechanism behind "the cache is fast, but never wrong" — data stays cached (and fast) until something that actually changes it explicitly says so.

### A quick reference

| Option | Behavior |
|---|---|
| \`fetch(url)\` (default) | Cached indefinitely, until manually revalidated |
| \`{ cache: "no-store" }\` | Never cached — always fresh |
| \`{ next: { revalidate: N } }\` | Cached, auto-refreshed after N seconds |
| \`{ next: { tags: [...] } }\` | Cached, invalidated on demand via \`revalidateTag\` |

> **Key idea:** unlike browser \`fetch\`, Next.js's server-side \`fetch\` is cached by default — a deliberate, sometimes surprising design choice. \`cache: "no-store"\`, \`revalidate\`, and \`tags\` are the three levers for controlling exactly how fresh any given piece of data needs to be.`,
    },
    {
      name: "loading.tsx & error.tsx",
      minutes: 8,
      intro: "Handling the in-between and the went-wrong states, per route, with almost no code.",
      content: `### loading.tsx: automatic Suspense fallback

\`\`\`tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p className="animate-pulse">Loading dashboard…</p>
}
\`\`\`

Referenced already in the streaming lesson — worth calling out explicitly here as part of the data-fetching toolkit. Any route with an \`async\` \`page.tsx\` that's fetching data automatically shows this UI the moment navigation starts, until the page's data resolves. Zero manual state management.

### error.tsx: automatic error boundary

\`\`\`tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong loading this page.</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
\`\`\`

An \`error.tsx\` file automatically wraps its route segment in a React error boundary — if data fetching (or rendering) throws, this UI is shown instead of a broken page or a blank screen. It **must** be a Client Component (error boundaries are a client-side React concept), and receives a \`reset\` function that lets the user retry rendering the segment without a full page reload.

### Errors bubble up to the nearest error.tsx

\`\`\`
app/
  dashboard/
    error.tsx           <- catches errors from dashboard and its children
    page.tsx
    settings/
      page.tsx            <- an error here is caught by the dashboard's error.tsx,
                              since settings has no error.tsx of its own
\`\`\`

Like layouts, error boundaries nest — a segment without its own \`error.tsx\` is caught by the nearest ancestor that has one. This lets you have a broad, generic error page at the root, with more specific, tailored error UI for particular sections that need it.

### global-error.tsx: the last resort

\`\`\`tsx
// app/global-error.tsx
"use client"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h2>A critical error occurred.</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
\`\`\`

Catches errors thrown in the root layout itself — a rare case, but because it replaces the *entire* page (including \`<html>\`/\`<body>\`), it must render its own complete document.

> **Key idea:** \`loading.tsx\` and \`error.tsx\` give you route-level loading and error states with almost no code — they're automatically wired into React Suspense and error boundaries by the framework's file conventions, exactly like \`page.tsx\` and \`layout.tsx\`.`,
    },
    {
      name: "Sequential vs Parallel Data Fetching",
      minutes: 8,
      intro: "Recognizing (and fixing) an accidental request waterfall.",
      content: `### The accidental waterfall

\`\`\`tsx
// each await blocks the next fetch from even starting
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)          // 200ms
  const reviews = await getReviews(id)            // 300ms, starts AFTER product resolves
  const related = await getRelatedProducts(id)     // 250ms, starts AFTER reviews resolves

  return <ProductDetail product={product} reviews={reviews} related={related} />
}
\`\`\`

Even though \`reviews\` and \`related\` don't actually depend on \`product\`'s result, writing them as sequential \`await\`s forces them to run one after another — total wait time is 200 + 300 + 250 = 750ms, when it could be much less.

### The fix: Promise.all for independent fetches

\`\`\`tsx
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, reviews, related] = await Promise.all([
    getProduct(id),
    getReviews(id),
    getRelatedProducts(id),
  ])

  return <ProductDetail product={product} reviews={reviews} related={related} />
}
\`\`\`

All three requests fire simultaneously — total wait time drops to roughly 300ms (the slowest of the three), instead of the sum of all of them.

### When sequential is actually correct

\`\`\`tsx
export default async function UserOrdersPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await getUser(userId)               // need this first...
  const orders = await getOrdersForUser(user.id)     // ...to know whose orders to fetch
  return <OrderList user={user} orders={orders} />
}
\`\`\`

Not every case of sequential \`await\`s is a bug — when one request genuinely needs the *result* of a previous one (here, \`orders\` needs \`user.id\`), sequential fetching is correct and \`Promise.all\` isn't applicable at all. The distinction is whether requests are independent (parallelize them) or dependent (sequential is unavoidable).

### Combining streaming with parallel fetching

\`\`\`tsx
import { Suspense } from "react"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)   // fast, needed for the main content immediately

  return (
    <div>
      <ProductDetail product={product} />
      <Suspense fallback={<p>Loading reviews…</p>}>
        <Reviews productId={id} />
      </Suspense>
    </div>
  )
}
\`\`\`

Often the best approach combines both ideas from this module: fetch what's needed for the immediately-visible content directly, and stream in slower, secondary sections (reviews, recommendations) independently via Suspense — rather than making the whole page wait for everything.

> **Key idea:** sequential \`await\`s create a waterfall whenever the requests are actually independent — \`Promise.all\` is the fix. Recognizing genuinely dependent fetches (where one request needs another's result) versus accidentally sequential ones is the core skill here.`,
    },
  ],
}
