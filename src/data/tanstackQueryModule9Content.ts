import type { Module } from "../types"

export const tanstackQueryModule9: Module = {
  id: 9,
  title: "SSR, Next.js & Prefetching",
  status: "upcoming",
  lessons: [
    {
      name: "Prefetching Queries",
      minutes: 9,
      intro: "Warm the cache before a component even mounts using prefetchQuery, and understand ensureQueryData as its read-or-fetch counterpart.",
      content: `## The problem prefetching solves

Every example so far has followed the same shape: a component mounts, \`useQuery\` fires, and the UI shows a loading state until the response comes back. That's completely normal and often fine — but it means the *very first* render of any given query is always a spinner, no matter how fast your network is. Prefetching lets you start that fetch **before** the component that needs the data ever mounts, so that by the time it does mount, the data is either already sitting in the cache or well on its way.

The classic example is a link hover. If a user hovers a "View profile" link, there's a real chance they're about to click it. Kicking off the profile fetch on hover — rather than waiting for the click and the subsequent route change and the subsequent \`useQuery\` mount — can make the next page feel instantaneous instead of loading-spinner-instantaneous.

## \`queryClient.prefetchQuery\`

\`prefetchQuery\` takes the same \`queryKey\` and \`queryFn\` shape as \`useQuery\`, but it isn't a hook — it's an imperative method on the \`QueryClient\`, callable from anywhere you have access to the client (an event handler, a route loader, a server request handler):

\`\`\`tsx
import { useQueryClient } from "@tanstack/react-query"
import { fetchUserProfile } from "../api/users"

function ProfileLink({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: ["user", userId],
      queryFn: () => fetchUserProfile(userId),
      staleTime: 60_000,
    })
  }

  return (
    <a href={\`/users/\${userId}\`} onMouseEnter={handleMouseEnter}>
      View profile
    </a>
  )
}
\`\`\`

When the user actually navigates to \`/users/:id\` and the profile component mounts a \`useQuery\` call with the **exact same query key**, TanStack Query finds the data already sitting in the cache (assuming it hasn't gone stale, governed by the \`staleTime\` you passed to \`prefetchQuery\`) and renders it immediately — no loading state, no second network request. If the user never hovers, nothing was wasted beyond the mouseenter listener itself; the query simply never fires early.

A few behavioral details worth knowing:

- \`prefetchQuery\` **deduplicates** against in-flight or already-fresh queries the same way \`useQuery\` does — calling it twice for the same key while a fetch is already in progress doesn't trigger a second network request.
- It respects \`staleTime\`. If the query key is already in the cache and still fresh, \`prefetchQuery\` does nothing at all — there's no redundant fetch just because you called the method.
- It returns a \`Promise<void>\` that resolves once the fetch settles (or resolves immediately if nothing needed to be fetched), but most usages — like the hover example above — deliberately don't \`await\` it, since the whole point is to fire-and-forget in the background.

## Prefetching on route change, not just hover

The same technique works at the router level. Many routers (React Router's loaders, TanStack Router's loaders, Next.js route handlers) support kicking off data loading before or during a route transition rather than after the destination component has already mounted:

\`\`\`tsx
// A React Router loader — runs before the route component renders
import { queryClient } from "../queryClient"
import { fetchUserProfile } from "../api/users"

export async function userProfileLoader({ params }: { params: { userId: string } }) {
  await queryClient.prefetchQuery({
    queryKey: ["user", params.userId],
    queryFn: () => fetchUserProfile(params.userId),
  })
  return null
}
\`\`\`

Here the loader \`await\`s the prefetch, so the route transition itself waits for the data — trading a slightly slower transition for a component that never shows a loading state on mount, since by the time it renders, \`useQuery\` finds a warm cache waiting for it.

## \`ensureQueryData\`: read-or-fetch in one call

\`prefetchQuery\` always kicks off a fetch (subject to the staleness check) and doesn't hand you the data directly — it's meant to run in the background while something else, usually a mounting \`useQuery\`, reads the result later. Sometimes you want the data *right now*, in the same function, whether that means reading it from cache or fetching it fresh. That's what \`ensureQueryData\` is for:

\`\`\`tsx
async function loadDashboard(userId: string) {
  const profile = await queryClient.ensureQueryData({
    queryKey: ["user", userId],
    queryFn: () => fetchUserProfile(userId),
  })

  // profile is guaranteed to be here — either it was already cached
  // and fresh, or ensureQueryData awaited a fetch to get it
  return profile
}
\`\`\`

The distinction in one line: \`prefetchQuery\` returns \`void\` and is meant to be fired without waiting on its result; \`ensureQueryData\` returns the actual data and is meant to be awaited by code that needs that data to proceed. Route loaders that need to *use* the fetched value directly (rather than just warm the cache for a component further down) typically reach for \`ensureQueryData\`; hover-to-prefetch UI patterns typically reach for \`prefetchQuery\`.

| | \`prefetchQuery\` | \`ensureQueryData\` |
|---|---|---|
| Return value | \`Promise<void>\` | \`Promise<TData>\` — the actual data |
| Typical caller | Event handlers (hover, focus), fire-and-forget | Route loaders, server code that needs the value now |
| Respects \`staleTime\` | Yes — skips the fetch if cache is fresh | Yes — reads from cache if fresh, fetches otherwise |

## Both share one cache

Whether data enters the cache through \`useQuery\`, \`prefetchQuery\`, or \`ensureQueryData\`, it's all the same \`QueryClient\` cache, keyed identically by \`queryKey\`. This is the entire mechanism that makes prefetching work at all: there's no separate "prefetch cache" to reconcile with the "real" cache later — a prefetched entry *is* a cache entry, indistinguishable from one a \`useQuery\` call would have created itself.

> **Key idea:** \`prefetchQuery\` warms the cache in the background using the same query key a later \`useQuery\` will use, so that by the time a component mounts, the data (or an in-flight request for it) is already there; \`ensureQueryData\` does the same read-or-fetch job but returns the data directly for code that needs it immediately, such as a route loader.`,
    },
    {
      name: "Server-Side Rendering & Hydration",
      minutes: 11,
      intro: "Fetch data on the server, pass it to the client without a duplicate fetch using dehydrate/HydrationBoundary, and understand why the QueryClient must be created fresh per request.",
      content: `## The SSR problem TanStack Query solves

In a server-rendered app, the natural instinct is: fetch the data on the server so the initial HTML already contains it, then somehow make that same data available to the client-side React tree without fetching it all over again the moment the page hydrates. Without a coordinated mechanism, you get one of two bad outcomes: either the server-fetched data is thrown away and the client re-fetches it from scratch (a wasted round trip, and a visible loading flash right after the page that was supposedly already rendered), or you hand-roll some ad hoc "inject JSON into a script tag and read it on mount" scheme yourself.

TanStack Query has a built-in answer to this: **dehydration and hydration**. The server fetches data into a \`QueryClient\`'s cache as normal, "dehydrates" that cache into a plain serializable object, and that object is sent down to the client embedded in the page. The client then "hydrates" its own \`QueryClient\` with that same data before any component renders — so when \`useQuery\` runs on the client, it finds the data already sitting there, fresh, with no second fetch.

## \`dehydrate\` and \`HydrationBoundary\`

\`dehydrate(queryClient)\` walks a \`QueryClient\`'s cache and produces a plain, JSON-serializable snapshot of every query's data and metadata. \`<HydrationBoundary state={...}>\` is the client-side counterpart — a component that takes that dehydrated state and merges it into whatever \`QueryClient\` its descendants are using, before those descendants' \`useQuery\` calls run:

\`\`\`tsx
// server-side rendering code (framework-agnostic sketch)
import { QueryClient, dehydrate } from "@tanstack/react-query"
import { fetchTodos } from "./api/todos"

async function renderPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  })

  const dehydratedState = dehydrate(queryClient)
  // dehydratedState is plain JSON — safe to embed in the HTML response
  return { dehydratedState, html: renderReactTreeToString(/* ... */) }
}
\`\`\`

\`\`\`tsx
// client entry point
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query"

function App({ dehydratedState }: { dehydratedState: unknown }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <TodoList />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
\`\`\`

Inside \`TodoList\`, a \`useQuery({ queryKey: ["todos"], queryFn: fetchTodos })\` call finds its data already present — courtesy of the \`HydrationBoundary\` merging it in — and renders with data on the very first client render, no loading state, no duplicate fetch. If the data has gone stale by the time the client mounts (governed by \`staleTime\`, same as everywhere else in TanStack Query), a background refetch may still happen to bring it current — but the user sees content immediately either way, rather than a spinner.

## Why the \`QueryClient\` must be created fresh per request

This is the single most important rule in server-rendered TanStack Query code, and getting it wrong causes a genuinely serious bug: **a server must create a brand-new \`QueryClient\` for every incoming request**, never reuse one shared instance across requests.

\`\`\`tsx
// WRONG — a module-level QueryClient shared across every request
const queryClient = new QueryClient() // created once, at server startup

export async function handleRequest(req: Request) {
  await queryClient.prefetchQuery({ queryKey: ["user", req.userId], queryFn: fetchUser })
  // BUG: this cache now holds every user who has ever hit this server process,
  // and the NEXT request's dehydrate() call could leak a previous user's data
  return dehydrate(queryClient)
}
\`\`\`

\`\`\`tsx
// CORRECT — a fresh QueryClient per request
export async function handleRequest(req: Request) {
  const queryClient = new QueryClient() // scoped to this one request only

  await queryClient.prefetchQuery({ queryKey: ["user", req.userId], queryFn: fetchUser })
  return dehydrate(queryClient)
}
\`\`\`

A server typically handles many concurrent requests from different users on the same running process. If the \`QueryClient\` (and therefore its cache) is a single shared, module-level instance, one user's server-rendered data can end up mixed into — or entirely overwriting — another user's response, because they're all reading and writing the same cache object concurrently. This is exactly the same class of bug as accidentally sharing a database connection's in-memory state across unrelated requests, and it's why every official TanStack Query SSR integration (Next.js included) is built around creating the client inside the per-request code path, never at module scope.

The client side has a related, softer version of the same rule: a \`QueryClient\` should typically be created once **per browser tab's app instance**, not on every render — which is why the client example above uses \`useState(() => new QueryClient())\` rather than \`new QueryClient()\` directly in the component body (the latter would create a brand-new, empty cache on every single re-render, defeating caching entirely).

| Environment | \`QueryClient\` lifetime | Why |
|---|---|---|
| Server | One per incoming request | Prevents one user's cached data leaking into another user's response |
| Client (browser) | One per app instance (created once, held in state/context) | Preserves the cache across re-renders; a new client per render would erase caching |

> **Key idea:** \`dehydrate(queryClient)\` serializes a server's cache into plain JSON, and \`<HydrationBoundary state={...}>\` merges that JSON back into the client's cache before components mount — giving the client its first render with data already present and no duplicate fetch — but this only works safely if the server creates a fresh \`QueryClient\` for every request, since a shared instance risks leaking one user's cached data into another user's response.`,
    },
    {
      name: "TanStack Query in Next.js App Router",
      minutes: 10,
      intro: "Put prefetching and hydration together in a realistic Next.js App Router pattern, and get an honest read on when this pattern is worth reaching for.",
      content: `## The shape of the pattern

Next.js's App Router draws a hard line between Server Components (which run only on the server, can \`await\` data directly, and never ship their own JavaScript to the client) and Client Components (which run in the browser and can use hooks like \`useQuery\`). TanStack Query's SSR support is built specifically to bridge that line: a Server Component prefetches data into a request-scoped \`QueryClient\`, dehydrates it, and hands it to a \`HydrationBoundary\` wrapping a Client Component — which then reads that same data with an ordinary \`useQuery\` call, instantly, on its first client render.

## A request-scoped \`QueryClient\` helper

Following the rule from the previous lesson, Next.js Server Components need a fresh \`QueryClient\` per request. A common pattern uses React's \`cache()\` function to scope one instance per request without manually threading it through every function call:

\`\`\`tsx
// app/get-query-client.ts
import { QueryClient } from "@tanstack/react-query"
import { cache } from "react"

// React's cache() ensures this returns the SAME instance within one
// request/render pass, but a genuinely NEW instance for every new request
export const getQueryClient = cache(() => new QueryClient())
\`\`\`

## The Server Component: prefetch and dehydrate

\`\`\`tsx
// app/todos/page.tsx — a Server Component (no "use client")
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "../get-query-client"
import { fetchTodos } from "../api/todos"
import { TodoList } from "./todo-list"

export default async function TodosPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />
    </HydrationBoundary>
  )
}
\`\`\`

## The Client Component: read with \`useQuery\` as normal

\`\`\`tsx
// app/todos/todo-list.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTodos } from "../api/todos"

export function TodoList() {
  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  })

  // todos is already populated on the very first client render —
  // no loading state needed here for the initial paint
  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

Notice that \`TodoList\` doesn't know or care that it was prefetched — it's calling \`useQuery\` exactly the way every other lesson in this course has shown. That's deliberate: the hydration mechanism is invisible from a consuming component's point of view. The *only* code that's SSR-aware is the Server Component doing the prefetching and the \`HydrationBoundary\` wrapping — everything below that boundary is ordinary, portable TanStack Query code that would work identically in a client-only app.

## A subtlety: matching query keys exactly

Hydration only works if the query key used in the Server Component's \`prefetchQuery\` call **exactly matches** the query key the Client Component's \`useQuery\` call uses — same array, same values, same order (recall from Module 2 that query keys are compared by value, not reference). A mismatch — say, \`["todos"]\` on the server versus \`["todos", { page: 1 }]\` on the client — means the client's \`useQuery\` simply won't find the prefetched entry, and silently falls back to fetching on its own, defeating the entire point without throwing any error. When a hydration pattern "isn't working" (client still shows a loading flash despite prefetching), a mismatched query key is the first thing worth checking.

## An honest note: do you need this?

This pattern is genuinely powerful for the specific problem it solves — combining server-rendered speed with a rich, interactive client-side query cache (refetching, mutations, invalidation) for the *same* data, without a duplicate fetch or a jarring loading flash on mount. But it's also more moving pieces than plain Next.js data fetching, and it isn't automatically the right call for every page:

- If a page's data is fetched once, rendered, and never needs client-side refetching, mutations, or cache sharing with other components, a Server Component simply \`await\`-ing your fetch function directly and passing the result down as a prop is simpler and requires none of this machinery at all.
- The hydration pattern earns its keep specifically when the *same* data also needs to be **interactive** on the client — refetched on an interval, invalidated after a mutation, shared across multiple components via the query cache, or kept fresh via \`refetchOnWindowFocus\`. That's genuinely something plain server-side data fetching alone doesn't give you: once the Server Component has rendered its output, it's done — there's no live client-side cache left to invalidate or refetch.
- For static or rarely-changing content (a blog post, documentation page), Next.js's own caching and revalidation model, without TanStack Query in the mix at all, is usually the simpler and entirely sufficient choice.

The honest rule of thumb: reach for the prefetch-and-hydrate pattern when a page's data needs both a fast, server-rendered first paint *and* an ongoing, interactive client-side relationship with that data afterward. If it's only ever the former, you're paying for machinery you don't need.

> **Key idea:** In the Next.js App Router, a Server Component creates a request-scoped \`QueryClient\` (via \`cache()\`), prefetches data into it, and wraps its children in \`<HydrationBoundary state={dehydrate(queryClient)}>\`; a Client Component underneath then calls \`useQuery\` with the *exact same query key* and gets data instantly on its first render — but this pattern is worth its complexity specifically when a page's data needs an ongoing, interactive client-side cache afterward, not for data that's rendered once and never touched again.`,
    },
  ],
}
