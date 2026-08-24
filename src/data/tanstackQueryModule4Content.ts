import type { Module } from "../types"

export const tanstackQueryModule4: Module = {
  id: 4,
  title: "Caching, Stale Time & Refetching",
  status: "upcoming",
  lessons: [
    {
      name: "The Cache Lifecycle: staleTime vs gcTime",
      minutes: 11,
      intro: "Understand the two timers that govern every cache entry — staleTime, which decides when a background refetch can happen, and gcTime, which decides when unused data is thrown away.",
      content: `## Fresh, stale, and gone: three states, two timers

Every piece of data \`useQuery\` caches moves through the same lifecycle, governed by two independent timers you configure per query:

1. **Fresh** — data was fetched within the last \`staleTime\` milliseconds. While fresh, TanStack Query serves it instantly from cache and does **not** trigger a background refetch, even if a component mounts and reads it.
2. **Stale** — \`staleTime\` has elapsed. The cached data is still served instantly (nothing disappears the moment it goes stale), but now it's eligible to trigger a background refetch the next time a "refetch trigger" fires (a component mounts, the window regains focus, the network reconnects — covered in the next lesson).
3. **Inactive → garbage collected** — once no mounted component is observing a query key anymore (every component using it has unmounted), a \`gcTime\` timer starts. When it elapses, the cache entry for that key is deleted entirely.

\`\`\`tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes: fresh for 5 min, no background refetch during that window
  gcTime: 30 * 60 * 1000,   // 30 minutes: kept in memory for 30 min after the last component unmounts
})
\`\`\`

## The default that surprises newcomers: \`staleTime: 0\`

Out of the box, \`staleTime\` defaults to \`0\` — meaning data is considered stale **immediately** after it's fetched. This is a deliberate, "always eventually consistent" default: TanStack Query would rather quietly refetch too often (in the background, without blocking your UI) than risk showing you data that's silently gone out of date.

In practice this means: every time a component using a given \`queryKey\` mounts, TanStack Query serves the cached data instantly (no loading spinner if it's already cached) *and* kicks off a background refetch to make sure it's current, updating the UI seamlessly if the server's answer changed. This is usually exactly the behavior you want — but it does mean a query with \`staleTime: 0\` will refetch far more often than newcomers expect, sometimes surprising people into thinking "why is this calling the API again, I just fetched it thirty seconds ago?"

## Raising staleTime for data that doesn't change often

Not all data needs to be re-verified on every mount. A list of countries, a user's own profile info they just edited, a set of app-wide feature flags — these change rarely enough that treating them as fresh for minutes (or longer) is a completely reasonable trade of "slightly staler" for "meaningfully fewer requests":

\`\`\`tsx
// Reference data that essentially never changes during a session
useQuery({
  queryKey: ["countries"],
  queryFn: fetchCountries,
  staleTime: Infinity, // never automatically refetch in the background
})

// A dashboard summary that's fine being up to a minute old
useQuery({
  queryKey: ["dashboard-summary"],
  queryFn: fetchDashboardSummary,
  staleTime: 60 * 1000,
})
\`\`\`

\`staleTime: Infinity\` is a genuinely useful value — it tells TanStack Query "once fetched, treat this as permanently fresh until something explicitly invalidates it" (via \`queryClient.invalidateQueries\`, covered in the next module). This is a common pattern for data you know will only change in response to a specific mutation you control, rather than something that drifts on its own.

## \`gcTime\`: memory cleanup, not freshness

\`gcTime\` (called \`cacheTime\` before TanStack Query v5 — you'll still see \`cacheTime\` in older docs, blog posts, and v4 codebases) is unrelated to whether data is considered up to date. It answers a completely different question: **how long should this cache entry survive in memory after nobody is looking at it anymore?**

The default is 5 minutes. That means: if every component reading \`["user", "42"]\` unmounts (say, the user navigates away from that profile page), the cached data for that key isn't deleted immediately — it sticks around for 5 more minutes. If the user navigates back within that window, TanStack Query still has the data available to show instantly (subject to whatever \`staleTime\` says about whether it also triggers a background refetch). Only after 5 minutes of zero observers does the entry actually get removed from memory.

\`\`\`tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  gcTime: 0, // remove from cache the instant no component is watching it
})
\`\`\`

Setting \`gcTime: 0\` effectively opts a query out of the "instant re-visit" behavior — useful for sensitive data you explicitly don't want lingering in memory after the relevant screen unmounts (a one-time payment token lookup, for instance).

## staleTime vs gcTime, side by side

| | \`staleTime\` | \`gcTime\` |
|---|---|---|
| Governs | Whether cached data can trigger a background refetch | Whether cached data is kept in memory at all |
| Default | \`0\` (immediately stale) | 5 minutes |
| Applies while... | A component is actively observing the query | No component is observing the query |
| Setting it higher means | Fewer background refetches, data may be "older" | Cached data survives longer after components unmount |
| \`Infinity\` means | Never auto-refetch in the background | Never garbage-collect (keep forever, until app reload) |

A common mistake is reaching for \`gcTime\` when what you actually wanted was \`staleTime\` (or vice versa) — remember the split: \`staleTime\` is about *should I refetch*, \`gcTime\` is about *should I still remember this at all*. A query can be simultaneously "stale" (would refetch on next trigger) and "cached" (\`gcTime\` hasn't elapsed) — those aren't contradictory; they're two separate clocks.

> **Key idea:** \`staleTime\` (default \`0\`) controls how long fetched data is trusted before it becomes eligible for a background refetch, while \`gcTime\` (default 5 minutes) controls how long unused cache entries are kept in memory after their last observing component unmounts — raise \`staleTime\` for data that doesn't need constant re-verification, and treat \`gcTime\` as a separate memory-management knob, not a freshness setting.`,
    },
    {
      name: "Automatic Refetching Triggers",
      minutes: 9,
      intro: "Learn the events that can trigger a background refetch of stale data — window focus, network reconnection, component mount, and interval polling — and when to turn each one off.",
      content: `## Refetching only happens for stale data

Before looking at the individual triggers, one rule ties them all together: **none of these triggers will actually issue a network request unless the data is already stale** (per the previous lesson's \`staleTime\`). A trigger firing on fresh data is a no-op — TanStack Query checks staleness first, every time. This is why raising \`staleTime\` is often the single most effective way to cut down on "unexpected" background requests, rather than disabling triggers one by one.

## \`refetchOnWindowFocus\`

By default, TanStack Query refetches stale queries whenever the browser window regains focus — the user switches back to your tab, or back to the app after alt-tabbing away. This is enabled by default, and for good reason: it's an extremely cheap way to keep data honest exactly when a user is most likely to actually look at the screen again after being away.

\`\`\`tsx
useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  refetchOnWindowFocus: true, // default
})
\`\`\`

It's also the trigger that most often surprises people during development — you tab over to check documentation, tab back, and see a fresh network request fire even though "nothing happened." That's working as intended, not a bug. For queries where this genuinely isn't useful — a query backing a chart the user is actively staring at and interacting with, where a resetting/reflowing UI on every alt-tab would be disruptive rather than helpful — turn it off per-query:

\`\`\`tsx
useQuery({
  queryKey: ["report", reportId],
  queryFn: () => fetchReport(reportId),
  refetchOnWindowFocus: false,
})
\`\`\`

## \`refetchOnReconnect\`

Also enabled by default: when the browser detects the network connection was lost and has now come back (via the \`online\`/\`offline\` browser events), stale queries refetch automatically. This is the trigger that recovers your app gracefully after a laptop wakes from sleep, a phone leaves airplane mode, or a flaky connection drops and reconnects — without it, a user could be staring at data that silently stopped updating during the outage with no obvious signal anything was wrong.

\`\`\`tsx
useQuery({
  queryKey: ["stock-price", symbol],
  queryFn: () => fetchStockPrice(symbol),
  refetchOnReconnect: true, // default — usually worth keeping
})
\`\`\`

There's rarely a good reason to disable this one; it's cheap and it's specifically solving a failure mode (a stale connection) that's otherwise invisible to the user.

## \`refetchOnMount\`

Governs whether a query refetches when a component using it mounts, *if the data is already stale*. Default is \`true\`. Set to \`false\` for a query you only ever want fetched once and then left alone until something explicitly invalidates it — pairs naturally with \`staleTime: Infinity\` for genuinely static data:

\`\`\`tsx
useQuery({
  queryKey: ["app-config"],
  queryFn: fetchAppConfig,
  staleTime: Infinity,
  refetchOnMount: false,
})
\`\`\`

A more surgical option: \`refetchOnMount: "always"\` forces a refetch on every mount regardless of staleness — the opposite extreme, for data you want guaranteed-fresh the instant a component shows it, no exceptions.

## Polling with \`refetchInterval\`

Unlike the three triggers above (which respond to *events*), \`refetchInterval\` refetches on a fixed timer, regardless of staleness — genuine polling:

\`\`\`tsx
useQuery({
  queryKey: ["order-status", orderId],
  queryFn: () => fetchOrderStatus(orderId),
  refetchInterval: 5000, // poll every 5 seconds
})
\`\`\`

This is the right tool for data that changes on the server independent of any user action — an order-processing status, a background job's progress, a live dashboard metric — where you have no other way to know the server-side state changed short of asking again periodically.

\`refetchInterval\` can also be a function of the latest data, which lets you stop polling once a terminal state is reached instead of hammering the server forever:

\`\`\`tsx
useQuery({
  queryKey: ["order-status", orderId],
  queryFn: () => fetchOrderStatus(orderId),
  refetchInterval: (query) => {
    const status = query.state.data?.status
    // Stop polling once the order reaches a final state
    if (status === "delivered" || status === "cancelled") return false
    return 5000
  },
})
\`\`\`

Returning \`false\` from the function disables further polling. This pattern — poll until a condition is met, then stop — is extremely common for order tracking, deployment status, video/image processing jobs, and similar asynchronous-completion UIs.

By default, \`refetchInterval\` also pauses while the browser tab isn't visible (governed by \`refetchIntervalInBackground\`, \`false\` by default) — no point burning requests polling a tab nobody's looking at. Set \`refetchIntervalInBackground: true\` only if background updates genuinely matter even when the tab isn't focused.

## Putting it together: a sensible default profile

A realistic global configuration for a typical app, combining what this lesson and the previous one covered:

\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // treat data as fresh for 1 minute
      gcTime: 10 * 60 * 1000,      // keep unused cache entries for 10 minutes
      refetchOnWindowFocus: true,  // keep the default — cheap and useful
      refetchOnReconnect: true,    // keep the default
      retry: 2,
    },
  },
})
\`\`\`

Then opt individual queries out of the defaults only where they genuinely need different behavior — a chart that shouldn't refocus-refetch, a status query that should poll, static reference data with \`staleTime: Infinity\`.

> **Key idea:** \`refetchOnWindowFocus\`, \`refetchOnReconnect\`, and \`refetchOnMount\` are event-driven triggers that only actually issue a request if the data is stale, while \`refetchInterval\` polls on a fixed timer regardless of staleness — set global sensible defaults on the \`QueryClient\` once, then override individual queries (disabling focus-refetch for an interactive chart, adding polling for a status page) rather than repeating options everywhere.`,
    },
    {
      name: "Global Defaults & QueryClient Configuration",
      minutes: 8,
      intro: "Configure app-wide defaults once on the QueryClient instead of repeating the same options on every useQuery call, and know when a per-query override is the right call instead.",
      content: `## One QueryClient, one set of sane defaults

Every app using TanStack Query creates exactly one \`QueryClient\` instance (typically once, at the module's top level, outside any component) and provides it to the whole tree via \`QueryClientProvider\`. That single instance is also where you set defaults every \`useQuery\` and \`useMutation\` call in the app inherits unless it overrides them:

\`\`\`tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
\`\`\`

Note the split: \`defaultOptions.queries\` applies to every \`useQuery\` (and \`useQueries\`, \`useInfiniteQuery\`) call; \`defaultOptions.mutations\` applies to every \`useMutation\` call. They're configured independently because queries and mutations have genuinely different concerns — retries make sense for a read that failed transiently, but retrying a mutation (say, "charge this credit card") automatically is a much more dangerous default, which is part of why mutations default to \`retry: 0\` unless you explicitly opt in.

## Why centralize instead of repeating options everywhere

Without a shared default, every single \`useQuery\` call across a codebase ends up either silently using library defaults that may not fit your app, or repeating the same block of options dozens of times:

\`\`\`tsx
// Without defaults — repeated everywhere, easy to drift out of sync
useQuery({ queryKey: ["user", id], queryFn: fetchUser, staleTime: 60_000, retry: 2 })
useQuery({ queryKey: ["posts"], queryFn: fetchPosts, staleTime: 60_000, retry: 2 })
useQuery({ queryKey: ["comments", postId], queryFn: fetchComments, staleTime: 60_000, retry: 2 })
\`\`\`

\`\`\`tsx
// With defaults set once on the QueryClient — every call below inherits them
useQuery({ queryKey: ["user", id], queryFn: fetchUser })
useQuery({ queryKey: ["posts"], queryFn: fetchPosts })
useQuery({ queryKey: ["comments", postId], queryFn: fetchComments })
\`\`\`

Beyond the reduced repetition, centralizing avoids a subtler problem: if the team later decides \`staleTime\` should change app-wide (say, from 1 minute to 30 seconds after a product decision), a value repeated at fifty call sites means fifty edits — or, more realistically, half of them get missed and the app ends up with inconsistent behavior across screens for no intentional reason.

## Per-query overrides still win

Setting defaults doesn't lock every query into identical behavior — any option passed directly to a specific \`useQuery\` call overrides the corresponding default for that call only:

\`\`\`tsx
// Uses the global staleTime (60s) and retry (2) from defaultOptions
useQuery({ queryKey: ["posts"], queryFn: fetchPosts })

// Overrides staleTime for this one query — reference data that rarely changes
useQuery({ queryKey: ["countries"], queryFn: fetchCountries, staleTime: Infinity })

// Overrides retry for this one query — fail fast, no automatic retries
useQuery({ queryKey: ["live-price", symbol], queryFn: () => fetchPrice(symbol), retry: false })
\`\`\`

This is the intended way to use \`defaultOptions\`: pick sensible values that fit the *majority* of queries in your app, and let the exceptions declare themselves explicitly at their call site, where a reader can see at a glance that this particular query is deliberately different.

## Setting defaults for a specific query key

There's a narrower tool for a related but different need: defaults scoped to queries sharing a particular key prefix, via \`queryClient.setQueryDefaults\`:

\`\`\`tsx
queryClient.setQueryDefaults(["todos"], {
  staleTime: 5 * 60 * 1000,
})

// Any query whose key starts with ["todos", ...] now inherits staleTime: 5 minutes,
// without needing to repeat it at every call site that uses a ["todos", ...] key.
useQuery({ queryKey: ["todos", "active"], queryFn: fetchActiveTodos })
useQuery({ queryKey: ["todos", "archived"], queryFn: fetchArchivedTodos })
\`\`\`

This sits between global \`defaultOptions\` (applies to everything) and per-call options (applies to one call) — reach for it when a whole *feature area* shares behavior that differs from the rest of the app, rather than either extreme.

## A realistic starting point

For a typical CRUD-style app, a reasonable starting configuration looks something like this, then gets tuned as real usage patterns emerge:

\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: 0,
    },
  },
})
\`\`\`

Thirty seconds of freshness is a reasonable middle ground for most application data — long enough to avoid re-fetching on every rapid navigation between screens, short enough that data doesn't feel meaningfully out of date. Individual queries for genuinely static data (\`staleTime: Infinity\`) or genuinely live data (shorter \`staleTime\`, or \`refetchInterval\` polling) override this baseline explicitly.

> **Key idea:** Set \`staleTime\`, \`gcTime\`, \`retry\`, and similar options once via \`defaultOptions\` on the \`QueryClient\` — split independently between \`queries\` and \`mutations\` — so most \`useQuery\`/\`useMutation\` calls need zero configuration, then override individual queries (or a whole key-prefix via \`setQueryDefaults\`) only where their behavior genuinely needs to differ from the app-wide baseline.`,
    },
  ],
}
