import type { Module } from "../types"

export const tanstackQueryModule2: Module = {
  id: 2,
  title: "Query Keys & Query Functions",
  status: "upcoming",
  lessons: [
    {
      name: "Designing Query Keys",
      minutes: 10,
      intro: "Structure array-based query keys for lists, single items, and filtered variants, and adopt the query key factory pattern to keep them consistent.",
      content: `## Query keys are the cache's address system

Every entry in TanStack Query's cache is stored under a **query key** — an array you choose, whose value TanStack Query compares (by deep, order-independent equality on plain objects, and by value/order for the array itself) to decide whether two \`useQuery\` calls refer to the same cached data or two different ones. Get keys right and caching, invalidation, and refetching all behave exactly as expected; get them wrong and you'll see symptoms like stale data that never updates, or components that refetch when they shouldn't need to.

The simplest possible key is a single string wrapped in an array:

\`\`\`tsx
useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
\`\`\`

\`["todos"]\` is the entire address for "the list of all todos." Any other \`useQuery\` call anywhere in the app using that exact same key reads from and writes to that same cache entry.

## Keying a single item vs a list

A list and a single item from that list are *different* pieces of data with different lifecycles — the list can change independently of one item, and vice versa — so they need different keys. The established convention is a two-part array: a string identifying the resource type, followed by an identifier when you mean one specific item:

\`\`\`tsx
// The list of all todos
useQuery({ queryKey: ["todos"], queryFn: fetchTodos })

// One specific todo
useQuery({ queryKey: ["todos", todoId], queryFn: () => fetchTodo(todoId) })
\`\`\`

This isn't just a style convention — it directly enables a very common invalidation pattern (covered fully in Module 3): telling the cache "anything under 'todos' is now stale" invalidates *both* the list and every individual todo at once, because TanStack Query treats \`["todos", 5]\` as matching a partial key of \`["todos"]\`.

## Including filters and params in the key

If a query's result depends on some parameter — a search term, a page number, a sort order — that parameter belongs *inside the query key*, not just inside the query function's closure:

\`\`\`tsx
function useTodos(status: "all" | "active" | "completed") {
  return useQuery({
    queryKey: ["todos", { status }],
    queryFn: () => fetchTodos(status),
  })
}
\`\`\`

This matters because the query key is the *only* thing TanStack Query looks at to decide "have I already fetched this exact data?" If \`status\` were left out of the key, calling \`useTodos("active")\` and then \`useTodos("completed")\` would both resolve to the same \`["todos"]\` cache entry — the second call would incorrectly show cached "active" results (or overwrite them), since as far as the cache can tell, both calls are asking for the identical thing. Including \`{ status }\` in the key means each distinct filter value gets its own independent cache slot, exactly as if they were entirely separate queries — which, conceptually, they are.

## Object equality inside keys

Notice the filter object above, \`{ status }\`, sits inside the array rather than being a second string. TanStack Query serializes keys deterministically, and for plain objects the property *order does not matter* — \`{ status: "active", page: 1 }\` and \`{ page: 1, status: "active" }\` hash to the same cache entry. Array *order*, on the other hand, does matter: \`["todos", "active"]\` and \`["active", "todos"]\` are different keys entirely. This asymmetry is intentional and useful — it means you can freely reorder how you build a filters object without accidentally fragmenting your cache, while the array's own structure (resource type first, then identifiers/filters) stays a meaningful, stable convention.

## The query key factory pattern

As an app grows past a handful of queries, hand-writing \`["todos", { status }]\` inline at every call site invites drift — one component might write \`{ status }\`, another might write \`{ filter: status }\`, and now they're silently talking to different cache entries for what was meant to be the same data. The fix that most real codebases converge on is a small **query key factory**: a plain object of functions, one per resource, that's the single source of truth for that resource's keys:

\`\`\`tsx
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (status: string) => [...todoKeys.lists(), { status }] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
}
\`\`\`

Used consistently everywhere a todo-related key is needed:

\`\`\`tsx
useQuery({ queryKey: todoKeys.list("active"), queryFn: () => fetchTodos("active") })
useQuery({ queryKey: todoKeys.detail(todoId), queryFn: () => fetchTodo(todoId) })
\`\`\`

Every function builds on \`todoKeys.all\`, which means invalidating \`todoKeys.all\` (Module 3) reaches every todo-related cache entry in one call, while invalidating \`todoKeys.lists()\` reaches only list queries without touching individually cached detail entries. This hierarchical structure — broad key first, progressively more specific pieces appended after — is the single most valuable habit to build early, since retrofitting consistent keys onto a codebase that grew organically without one is far more painful than adopting the pattern from the first query.

> **Key idea:** Query keys are array-based cache addresses; put resource type first and identifiers/filters after so related data nests hierarchically, always include any value the query result depends on directly inside the key (never just in a closure), and centralize key construction behind a query key factory object so every call site stays consistent as the app grows.`,
    },
    {
      name: "Query Functions & QueryFunctionContext",
      minutes: 9,
      intro: "See how queryKey values reach queryFn through its context argument, use the built-in AbortSignal for cancellation, and understand why a queryFn must throw to signal failure.",
      content: `## queryFn receives more than you might expect

So far, \`queryFn\` has been written as a zero-argument closure — \`() => fetchTodos(status)\` — that reaches into the surrounding scope to grab whatever parameters it needs. That works, but \`queryFn\` actually receives an argument every time TanStack Query calls it: a **\`QueryFunctionContext\`** object carrying, among other things, the exact \`queryKey\` that triggered this call and an \`AbortSignal\` for cancellation.

\`\`\`tsx
useQuery({
  queryKey: ["todos", { status: "active" }],
  queryFn: (context) => {
    console.log(context.queryKey) // ["todos", { status: "active" }]
    console.log(context.signal)   // an AbortSignal
    return fetchTodos()
  },
})
\`\`\`

## Deriving parameters from the key instead of a closure

Because the context object carries the same \`queryKey\` array you already constructed, you can pull parameters out of it directly rather than duplicating them in the closure — genuinely useful once a query key factory (previous lesson) is generating keys in one place and you don't want two separate spots that both need to "know" what \`{ status }\` means:

\`\`\`tsx
function useTodos(status: "all" | "active" | "completed") {
  return useQuery({
    queryKey: todoKeys.list(status),
    queryFn: ({ queryKey }) => {
      const [, , { status }] = queryKey
      return fetchTodos(status)
    },
  })
}
\`\`\`

Either style — closure or destructuring from \`queryKey\` — is valid and both are common in real codebases; the context argument exists for the cases (like the cancellation signal below) where it's the *only* way to get what you need.

## Cancellation with the built-in AbortSignal

TanStack Query automatically creates and manages an \`AbortSignal\` for every query, and aborts it in exactly the situations you'd want a network request cancelled — most commonly, when a component unmounts while its query is still in flight, or when the same query is triggered again before the previous attempt finished (for instance, a fast-typing search box firing a new query on every keystroke). Wiring that signal into \`fetch\` takes one line:

\`\`\`tsx
function useSearchResults(term: string) {
  return useQuery({
    queryKey: ["search", term],
    queryFn: ({ signal }) =>
      fetch("/api/search?q=" + term, { signal }).then((res) => res.json()),
  })
}
\`\`\`

Without passing \`signal\` through, an outdated request keeps running in the background even after nothing needs its result anymore — wasted bandwidth at best, and a potential source of the exact race conditions described back in Module 1 at worst, if you were still tracking results manually instead of trusting the cache. \`axios\` and most other HTTP clients accept a comparable \`signal\` option; the pattern transfers directly regardless of which client a \`queryFn\` uses.

## Why a queryFn must throw to signal failure

This point was introduced briefly in the previous module and is worth stating precisely now, because it's the single most common source of confusing "successful" queries that actually failed: TanStack Query has exactly one way of knowing a fetch attempt failed — **the promise returned by \`queryFn\` must reject** (equivalently, an \`async\` \`queryFn\` must \`throw\`). A resolved promise is always treated as success, no matter what value it resolves to.

\`\`\`tsx
// WRONG — a failed HTTP response still resolves the promise
queryFn: () => fetch("/api/todos").then((res) => res.json())

// RIGHT — a non-2xx response is explicitly turned into a rejection
queryFn: async () => {
  const res = await fetch("/api/todos")
  if (!res.ok) {
    throw new Error("Request failed with status " + res.status)
  }
  return res.json()
}
\`\`\`

This matters because \`fetch\` (unlike \`axios\`, which throws by default on non-2xx responses) only rejects on genuine network-level failure — a 404 or 500 response is still a "successful" fetch as far as the Fetch API is concerned, since a response was received. Skipping the \`res.ok\` check means TanStack Query's \`isSuccess\` stays true and \`data\` ends up holding a parsed error body (or fails entirely trying to parse a non-JSON error page), rather than the app correctly landing in \`isError\` and getting a chance to show a real error message.

> **Key idea:** \`queryFn\` receives a \`QueryFunctionContext\` carrying the triggering \`queryKey\` and an \`AbortSignal\` — pass the signal into your HTTP client to get automatic request cancellation on unmount or re-trigger — and because TanStack Query judges success purely by promise resolution, a \`queryFn\` using \`fetch\` must explicitly check \`res.ok\` and throw, or a failed request will be silently treated as a success.`,
    },
    {
      name: "Query Options & the queryOptions Helper",
      minutes: 9,
      intro: "Tour the most common per-query options and use the queryOptions helper to define a query's key, function, and settings once, shareable across useQuery, prefetching, and manual cache access.",
      content: `## Beyond queryKey and queryFn

\`useQuery\`'s options object accepts far more than just \`queryKey\` and \`queryFn\`. A few of the most frequently reached-for options, each covered in full depth in a later module but worth a first look now so the shape is familiar:

\`\`\`tsx
useQuery({
  queryKey: todoKeys.detail(todoId),
  queryFn: () => fetchTodo(todoId),
  enabled: todoId != null,   // don't run the query until todoId exists — Module 6
  staleTime: 30 * 1000,      // how long data stays "fresh" before refetching — Module 4
  select: (data) => data.title, // transform/pick from the cached data — below
})
\`\`\`

- **\`enabled\`** — a boolean controlling whether the query runs at all. Set it to a condition (like \`todoId != null\`) to skip fetching until some prerequisite is met, without needing to conditionally call the hook itself (which would break React's rules of hooks). Module 6 covers this in depth for dependent queries.
- **\`staleTime\`** — how long, in milliseconds, fetched data is considered fresh before TanStack Query will consider refetching it. Defaults to \`0\`, meaning data is considered stale immediately after fetching. Module 4 is dedicated to this option and its counterpart, \`gcTime\`.
- **\`select\`** — a function that transforms the cached data before it's returned from the hook, without changing what's actually stored in the cache. Handy for deriving a smaller piece of data (like picking just \`title\` out of a full todo object) so a component only re-renders when *that specific derived value* changes, not on every change to the full cached object.

## The problem select-by-itself doesn't solve: duplication

Once a query has several options attached, and that same query needs to be used in more than one place — a component's \`useQuery\` call, a prefetch triggered from a router loader, a manual cache read via \`queryClient.getQueryData\` — copying the same \`queryKey\`, \`queryFn\`, and options object to every call site is exactly the kind of duplication that caused problems with hand-written query keys in the first lesson of this module. If one copy's \`queryKey\` ever drifts from another's, they silently become two different cache entries.

## queryOptions: define once, reuse everywhere

The \`queryOptions\` helper solves this by letting you define a query's full configuration — key, function, and any options — as a single, typed, reusable object:

\`\`\`tsx
import { queryOptions } from "@tanstack/react-query"

function todoOptions(id: number) {
  return queryOptions({
    queryKey: todoKeys.detail(id),
    queryFn: () => fetchTodo(id),
    staleTime: 30 * 1000,
  })
}
\`\`\`

That single \`todoOptions\` function now becomes the one source of truth for "how do I fetch todo #\`id\`," usable identically in every context that needs it:

\`\`\`tsx
// In a component
function TodoDetail({ id }: { id: number }) {
  const { data } = useQuery(todoOptions(id))
  // ...
}

// Prefetching ahead of navigation (covered further in Module 9)
queryClient.prefetchQuery(todoOptions(id))

// Reading whatever's currently cached, without triggering a fetch
const cached = queryClient.getQueryData(todoOptions(id).queryKey)
\`\`\`

Beyond eliminating duplication, \`queryOptions\` also gives TypeScript enough information to correctly infer the shape of \`data\` at every one of those call sites from a single declaration, rather than each \`useQuery\` call needing its own generic type argument repeated by hand. As a codebase's query layer grows, a small file of \`queryOptions\`-based functions per resource (built on top of that resource's query key factory) becomes the natural, central place that both components and non-component code (route loaders, event handlers) reach into — the query key factory answers "what's the address," and a \`queryOptions\` function answers "and here's everything needed to actually fill that address."

> **Key idea:** \`enabled\`, \`staleTime\`, and \`select\` are among the most common per-query options layered on top of \`queryKey\`/\`queryFn\`; wrap a query's full configuration in a \`queryOptions()\`-returning function to define it once with correct type inference and reuse it identically across components, prefetching, and direct cache reads.`,
    },
  ],
}
