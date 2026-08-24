import type { Module } from "../types"

export const tanstackQueryModule3: Module = {
  id: 3,
  title: "Query Status, Data & Error Handling",
  status: "upcoming",
  lessons: [
    {
      name: "Understanding Query Status & Fetch Status",
      minutes: 10,
      intro: "Untangle status vs fetchStatus, and the isLoading/isFetching/isPending booleans TanStack Query derives from them.",
      content: `## Two questions, two properties

Every query object returned by \`useQuery\` answers two genuinely different questions, and TanStack Query gives you a separate property for each one:

- **"Do I have data to show?"** — answered by \`status\`.
- **"Is a network request happening right now?"** — answered by \`fetchStatus\`.

New users almost always reach for a single \`loading\` boolean out of habit, and TanStack Query deliberately resists that simplification, because those two questions really are independent. You can have data (from a previous successful fetch) *and* be fetching again in the background at the same time. Collapsing that into one boolean loses real information your UI often needs.

## \`status\`: does \`data\` exist?

\`status\` is one of three string values:

| Value | Meaning |
|---|---|
| \`"pending"\` | No data yet. Either the first fetch hasn't resolved, or the query has no cached data at all. |
| \`"error"\` | The last fetch attempt failed, and there's no cached data to fall back on. |
| \`"success"\` | \`data\` is defined and usable — even if a background refetch is currently in flight. |

\`\`\`tsx
import { useQuery } from "@tanstack/react-query"

function Profile({ userId }: { userId: string }) {
  const { status, data, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  if (status === "pending") return <p>Loading profile…</p>
  if (status === "error") return <p>Couldn't load profile: {error.message}</p>

  // status === "success" here — data is guaranteed to be defined
  return <h1>{data.name}</h1>
}
\`\`\`

Note what \`status\` does *not* tell you: whether a request is actually in flight right now. A query can be \`"success"\` while quietly refetching in the background — \`status\` stays \`"success"\` the whole time, because you still have valid data to render.

## \`fetchStatus\`: is the queryFn running right now?

\`fetchStatus\` is the orthogonal axis — it describes the network activity itself, independent of whether you have data:

| Value | Meaning |
|---|---|
| \`"fetching"\` | The queryFn is currently executing (initial load, background refetch, or manual refetch). |
| \`"paused"\` | The fetch wants to run but can't — most commonly because the device is offline (see the network mode options covered later in this course). |
| \`"idle"\` | Nothing is happening — no fetch in flight. |

Combine the two axes and you get states plain \`isLoading\` booleans simply cannot express:

\`\`\`tsx
const { status, fetchStatus } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
})

// status: "success", fetchStatus: "fetching"
//   → you have (possibly stale) data AND a background refetch is running
// status: "pending", fetchStatus: "fetching"
//   → first load, nothing to show yet, request in flight
// status: "pending", fetchStatus: "paused"
//   → no data, and the device is offline so the fetch can't even start
// status: "success", fetchStatus: "idle"
//   → settled, valid data, nothing happening right now
\`\`\`

That third row — \`pending\` + \`paused\` — is exactly the kind of state a single \`loading\` boolean would misreport as "loading forever" when the honest answer is "waiting for a network connection."

## The derived booleans: \`isLoading\`, \`isFetching\`, \`isPending\`

Because checking two string properties by hand is tedious, TanStack Query derives the common combinations as booleans for you:

\`\`\`tsx
const {
  isPending,   // status === "pending"
  isFetching,  // fetchStatus === "fetching"
  isLoading,   // isPending && isFetching  — first-ever fetch, no data at all
} = useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId) })
\`\`\`

The distinction that trips people up: **\`isLoading\` is not "any fetch in progress"** — that's what \`isFetching\` means. \`isLoading\` specifically means "no data yet, and currently fetching it" — the classic first-paint spinner case. A background refetch of already-cached data sets \`isFetching\` to \`true\` while \`isLoading\` stays \`false\`, because you already have data to render.

\`\`\`tsx
function Profile({ userId }: { userId: string }) {
  const { isLoading, isFetching, data, error, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <p>Loading profile…</p>
  if (isError) return <p>Couldn't load profile: {error.message}</p>

  return (
    <div>
      <h1>{data.name}</h1>
      {isFetching && <span className="text-xs text-gray-400">Refreshing…</span>}
    </div>
  )
}
\`\`\`

This is the pattern almost every real app wants: a full-page loading state only on the very first fetch (\`isLoading\`), and a small, unobtrusive indicator for background refetches (\`isFetching\`) that doesn't yank the already-rendered UI out from under the user.

## \`isPlaceholderData\`

One more flag worth knowing about now, even though its full use case (pagination) is covered in a later module: \`isPlaceholderData\` is \`true\` when the currently-rendered \`data\` is placeholder data supplied via the \`placeholderData\` option (for example, showing the previous page's data while the next page loads) rather than data that actually came back from the queryFn. It lets you, say, dim previous-page content while a new page is fetching:

\`\`\`tsx
const { data, isPlaceholderData } = useQuery({
  queryKey: ["todos", page],
  queryFn: () => fetchTodos(page),
  placeholderData: (previousData) => previousData,
})

return <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>{/* ...render data... */}</ul>
\`\`\`

## Quick reference

| You want to know... | Check |
|---|---|
| Do I have data to render at all? | \`status === "success"\` (or \`data !== undefined\`) |
| Is this the very first, blocking load? | \`isLoading\` |
| Is *any* fetch happening right now (including background)? | \`isFetching\` |
| Do I have zero data yet? | \`isPending\` |
| Did the last attempt fail with no fallback data? | \`status === "error"\` / \`isError\` |
| Is a fetch stuck because the device is offline? | \`fetchStatus === "paused"\` |

> **Key idea:** \`status\` answers "do I have data?" and \`fetchStatus\` answers "is a request running right now?" — they're independent axes, so \`isLoading\` (no data, currently fetching) and \`isFetching\` (any fetch in flight, including silent background refetches) mean genuinely different things; reach for \`isLoading\` for your first-paint spinner and \`isFetching\` for a subtle "refreshing" indicator that doesn't hide already-rendered data.`,
    },
    {
      name: "Handling Errors & Retries",
      minutes: 10,
      intro: "Configure automatic retries with backoff, handle errors per-query or globally, and route failures into error boundaries when that fits your UI better.",
      content: `## Retries happen automatically by default

Unlike a raw \`fetch\` call, \`useQuery\` retries a failed request automatically before it ever reports an error to your component. The default is **3 retries** with an **exponential backoff delay**, and it's easy to forget this is happening because it's silent from the UI's perspective — \`status\` stays \`"pending"\` while retries are attempted, and only flips to \`"error"\` once every retry has been exhausted.

\`\`\`tsx
const { data, error, isError } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  // defaults, shown explicitly:
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
\`\`\`

That default \`retryDelay\` doubles the wait on each attempt (1s, 2s, 4s, ...) capped at 30 seconds — a standard exponential backoff, which avoids hammering a server that's already struggling.

### Customizing retry behavior

\`retry\` accepts more than a number. Passing a function lets you decide per-error whether it's even worth retrying:

\`\`\`tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  retry: (failureCount, error) => {
    // Don't retry a 404 — the resource genuinely doesn't exist
    if (error instanceof HttpError && error.status === 404) return false
    // Otherwise retry up to 2 times
    return failureCount < 2
  },
})
\`\`\`

This matters because retrying a 401 (unauthorized) or 404 (not found) three times with backoff just delays showing the user an error they'll see regardless — those failures are deterministic, not transient. Reserve retries for genuinely transient failures: network blips, 502/503 responses, timeouts.

\`retry: false\` disables retries entirely for a query — useful for mutations-adjacent reads where you'd rather fail fast and let the user explicitly retry via a button.

## Per-query vs global error/retry defaults

Repeating \`retry\`/\`retryDelay\` on every \`useQuery\` call across a codebase is exactly the kind of repetition \`QueryClient\`'s \`defaultOptions\` exists to eliminate:

\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof HttpError && [401, 403, 404].includes(error.status)) return false
        return failureCount < 2
      },
    },
  },
})
\`\`\`

Every \`useQuery\` in the app now inherits this behavior automatically, and any individual query can still override it by passing its own \`retry\` option — the per-query option always wins over the global default.

## Reading the error itself

\`error\` is typed as \`unknown\` by default (or whatever error type you specify via the query's generic parameters), because \`queryFn\` can throw absolutely anything — a thrown string, a plain object, or (the common case) an actual \`Error\` instance from your fetch wrapper:

\`\`\`ts
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`)
  if (!res.ok) {
    throw new HttpError(res.status, \`Failed to fetch user \${id}\`)
  }
  return res.json()
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
\`\`\`

Throwing a real \`Error\` subclass (rather than a plain object) from \`queryFn\` is worth doing consistently — it gives you a \`.message\`, a proper stack trace, and (as above) room for extra fields like \`status\` that your error-handling logic can branch on.

\`\`\`tsx
function Profile({ userId }: { userId: string }) {
  const { isError, error } = useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId) })

  if (isError) {
    if (error instanceof HttpError && error.status === 404) {
      return <p>No user found with that ID.</p>
    }
    return <p>Something went wrong. Please try again.</p>
  }
  // ...
}
\`\`\`

## Routing errors to an error boundary with \`throwOnError\`

Handling every error inline works, but for errors you genuinely want to treat as "this part of the tree is broken" rather than "show a small inline message," TanStack Query can re-throw the error during render so a React error boundary catches it:

\`\`\`tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  throwOnError: true,
})
\`\`\`

With \`throwOnError: true\`, the query never surfaces \`isError\`/\`error\` to your component for you to check — instead, the error is thrown during rendering, and the nearest wrapping \`<ErrorBoundary>\` (from \`react-error-boundary\` or your own implementation) handles it:

\`\`\`tsx
import { ErrorBoundary } from "react-error-boundary"

function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong loading this page.</p>}>
      <Profile userId="42" />
    </ErrorBoundary>
  )
}
\`\`\`

\`throwOnError\` can also be a function, letting you decide per-error whether to throw (crash the boundary) or handle it inline as usual:

\`\`\`tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  // Only escalate to the error boundary for server errors (5xx);
  // handle 4xx errors inline, since those are often user-actionable.
  throwOnError: (error) => error instanceof HttpError && error.status >= 500,
})
\`\`\`

### When to reach for which approach

| Approach | Good for |
|---|---|
| Inline \`isError\`/\`error\` check | Errors the user can act on locally — "retry", "this item was deleted", form-adjacent errors |
| \`throwOnError\` + error boundary | Errors that mean an entire section/page is unusable — auth failures, malformed critical data, 500s |
| Custom \`retry\` logic | Distinguishing transient failures (worth retrying) from deterministic ones (401/403/404 — retrying won't help) |

> **Key idea:** Failed queries retry automatically (3 attempts, exponential backoff, by default) before \`status\` ever becomes \`"error"\` — customize \`retry\`/\`retryDelay\` per query or globally via \`QueryClient\`'s \`defaultOptions\`, skip retries for deterministic failures like 404s, and use \`throwOnError\` to hand genuinely page-breaking errors off to a React error boundary instead of checking \`isError\` inline everywhere.`,
    },
    {
      name: "Transforming Data with select",
      minutes: 9,
      intro: "Reshape cached query data on the way out with select, without triggering extra requests, and understand how it's memoized to avoid wasted re-renders.",
      content: `## The problem: the cache shape isn't always the component shape

A \`queryFn\` typically returns whatever the server sends back — a full API response. But an individual component often only needs a small slice or a derived value from that response, not the entire payload. You could derive that value inline in the component body, but TanStack Query offers a dedicated option for exactly this: **\`select\`**.

\`\`\`tsx
interface TodosResponse {
  todos: { id: string; title: string; done: boolean }[]
  total: number
}

function TodoCount() {
  const { data: count } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (response: TodosResponse) => response.todos.filter((t) => !t.done).length,
  })

  return <p>{count} todos remaining</p>
}
\`\`\`

\`select\` runs *after* the cache is updated, transforming what \`data\` looks like to this particular \`useQuery\` call — but the underlying cache entry still holds the full, untransformed response. That's the key mental model: the cache stores the queryFn's raw result once; \`select\` is a per-observer view into it, not a mutation of the cache itself.

## Why this beats deriving data inline

You could just as easily write:

\`\`\`tsx
function TodoCount() {
  const { data: response } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
  const count = response?.todos.filter((t) => !t.done).length ?? 0
  return <p>{count} todos remaining</p>
}
\`\`\`

Functionally similar, but \`select\` has a real advantage: **the component only re-renders when the *selected* value actually changes**, not whenever the full cached object changes. If \`fetchTodos\` returns a new object reference on every background refetch (extremely common — a fresh \`fetch().then(r => r.json())\` never returns the same object twice) but the derived \`count\` happens to come out the same, a component reading \`data\` directly still re-renders (new reference), while a component using \`select\` to compute \`count\` does **not** re-render, because TanStack Query compares the *selected* output with structural/referential equality before triggering a re-render.

This matters most when many components subscribe to the same query key but each only cares about a small slice of it — each one only re-renders for changes to its own slice, not for every field in the shared cached object.

## Multiple components, one cache entry, different views

Because \`select\` is per-\`useQuery\`-call, different components reading the *same* query key can each apply their own transformation without duplicating the network request or the cache entry:

\`\`\`tsx
function TodoCount() {
  const { data: count } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (r: TodosResponse) => r.todos.length,
  })
  return <span>{count} total</span>
}

function CompletedList() {
  const { data: completed } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (r: TodosResponse) => r.todos.filter((t) => t.done),
  })
  return (
    <ul>
      {completed?.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

Both components share the exact same underlying cache entry and network request (same \`queryKey\`), but each renders a different, independently-memoized \`select\`-derived view. Neither component ever sees the other's shape of the data, and neither triggers an extra fetch.

## Keeping the select function stable

Because \`select\`'s output is compared to decide whether to re-render, it helps for the function reference itself to be stable when practical — an inline arrow function defined fresh on every render is fine for TanStack Query's correctness (it still calls it and compares the *output*), but if the transformation is nontrivial, wrapping it in \`useCallback\` avoids recomputing more than necessary in some edge cases and keeps the intent explicit:

\`\`\`tsx
const selectCompletedCount = useCallback(
  (r: TodosResponse) => r.todos.filter((t) => t.done).length,
  [],
)

const { data: completedCount } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  select: selectCompletedCount,
})
\`\`\`

For most \`select\` functions — short, cheap, derived purely from the query's own data — an inline function is perfectly fine and the more common style in real codebases. Reach for \`useCallback\` only once a transformation is genuinely expensive (heavy sorting/filtering over a large array, for instance).

## \`select\` does not change what's stored in the cache

Worth repeating because it's the most common misunderstanding: \`select\` never mutates or replaces what \`queryClient\` has cached for that key. \`queryClient.getQueryData(["todos"])\` still returns the full, untransformed \`TodosResponse\` regardless of any component's \`select\` option — \`select\` is purely a rendering-time view for the specific \`useQuery\` call that specifies it.

> **Key idea:** \`select\` derives a component-specific view of already-cached data without triggering a new request or altering the cache itself — because the derived output (not the raw cached object) is what's compared to decide on a re-render, components using \`select\` skip re-rendering when their particular slice of the data hasn't actually changed, even while the underlying cached object is being replaced by background refetches.`,
    },
  ],
}
