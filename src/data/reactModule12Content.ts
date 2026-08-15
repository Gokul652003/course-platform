import type { Module } from "../types"

export const reactModule12: Module = {
  id: 12,
  title: "Data Fetching & Async State",
  status: "upcoming",
  lessons: [
    {
      name: "Fetching Data: The Complete Hand-Rolled Pattern",
      minutes: 9,
      intro: "Properly handling loading, error, and race-condition states — not just the happy path.",
      content: `### The minimal version, and what it's missing

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`).then((res) => res.json()).then(setUser)
  }, [userId])

  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
\`\`\`

This is module 5's basic pattern — it works for the happy path, but is missing two things every real application needs: handling a request that *fails*, and correctly handling the race condition module 5's pitfalls lesson introduced (a fast, later request resolving before an earlier, slower one).

### The complete pattern

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    fetch(\`/api/users/\${userId}\`)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json()
      })
      .then((data) => {
        if (!isCancelled) setUser(data)
      })
      .catch((err) => {
        if (!isCancelled) setError(err)
      })
      .finally(() => {
        if (!isCancelled) setLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [userId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  return <p>{user.name}</p>
}
\`\`\`

This combines several earlier lessons directly: module 5's cancellation-flag pattern for the race condition, the JavaScript course's \`try\`/\`catch\`-adjacent \`.catch()\` for Promise rejection (module 8 of the JS course), and \`res.ok\`/\`res.status\` checking — recall that \`fetch\` does **not** reject on an HTTP error status (a 404 or 500) the way you might expect; it only rejects on a genuine network failure, so checking \`res.ok\` explicitly and throwing is necessary to catch a failed *request* as an error at all.

### Aborting an in-flight request properly: AbortController

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController()

  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((err) => {
      if (err.name !== "AbortError") setError(err)   // don't treat an intentional cancellation as a real error
    })

  return () => {
    controller.abort()   // actually cancels the underlying network request, not just its effect on state
  }
}, [userId])
\`\`\`

The \`isCancelled\` flag from the complete pattern prevents a stale response from incorrectly updating state, but the network request itself still completes in the background, wasting bandwidth. \`AbortController\` genuinely cancels the underlying request — more efficient, and the standard, more complete way to handle this specific case in real production code.

### Why this is exactly the kind of repeated logic module 7 introduced custom hooks for

Every one of these pieces — \`loading\`, \`error\`, cancellation, the \`res.ok\` check — needs to be correctly repeated in **every single component** that fetches data, if written this way. This is precisely the motivation, recall module 7's custom-hooks module, for extracting this entire pattern into a reusable \`useFetch\` hook (as that module's example did) — or, as the rest of this module covers, reaching for a dedicated library that's already solved this exact problem thoroughly and battle-tested.

> **Key idea:** a genuinely complete hand-rolled data-fetching effect handles loading, errors (including checking \`res.ok\`, since \`fetch\` doesn't reject on HTTP error statuses), and race conditions (via a cancellation flag or, more thoroughly, \`AbortController\`) — real, repeated boilerplate that's exactly why dedicated data-fetching libraries, covered next, exist.`,
    },
    {
      name: "Suspense for Data Fetching",
      minutes: 8,
      intro: "Letting a component 'wait' for data using the same mechanism that powers React.lazy code splitting.",
      content: `### Recalling Suspense's other use: code splitting

\`\`\`jsx
import { lazy, Suspense } from "react"

const HeavyChart = lazy(() => import("./HeavyChart.jsx"))

function Dashboard() {
  return (
    <Suspense fallback={<p>Loading chart...</p>}>
      <HeavyChart />
    </Suspense>
  )
}
\`\`\`

\`React.lazy\` combined with \`<Suspense>\` is React's built-in tool for **code splitting** — \`HeavyChart\`'s code isn't downloaded at all until it's actually about to render, and \`<Suspense>\`'s \`fallback\` shows while that download is in progress. This directly parallels this platform's Next.js course's \`loading.tsx\`/streaming coverage — same underlying React mechanism, Next.js just wires it up automatically via file conventions.

### Extending the same idea to data, not just code

\`\`\`jsx
function ProductDetail({ productId }) {
  const product = use(fetchProduct(productId))   // "use" can suspend on a Promise, not just read context
  return <h1>{product.name}</h1>
}

function App() {
  return (
    <Suspense fallback={<p>Loading product...</p>}>
      <ProductDetail productId="42" />
    </Suspense>
  )
}
\`\`\`

The \`use\` hook (a relatively recent addition to React) can accept a Promise directly — if that Promise hasn't resolved yet, \`use\` **suspends** the component (pausing its rendering), and \`<Suspense>\`'s \`fallback\` shows automatically, exactly like the code-splitting example above, but now for data instead of code. Once the Promise resolves, \`ProductDetail\` renders normally with the actual, resolved value — no \`loading\` state variable, no conditional rendering inside the component at all.

### This requires a data source designed to work with Suspense

\`\`\`jsx
// a plain fetch() call, called directly during render, does NOT work correctly with Suspense on its own —
// it needs to be wrapped by something that correctly integrates with React's suspending mechanism
\`\`\`

This is an important, genuinely subtle caveat: Suspense-for-data isn't simply "wrap any \`fetch\` call in \`use\`" — it requires the data source itself (a framework's data layer, like this platform's Next.js course's Server Component data fetching, or a library like React Query, covered next lesson) to properly integrate with React's suspending mechanism, including caching the Promise so the component doesn't refetch on every re-render. This is precisely why Next.js's Server Components (which handle this integration internally) can \`await\` directly, while plain client-side React genuinely needs a compatible data library to use Suspense for data correctly and safely.

### Suspense boundaries can be nested, exactly like error boundaries

\`\`\`jsx
function ProductPage({ productId }) {
  return (
    <div>
      <Suspense fallback={<p>Loading product...</p>}>
        <ProductDetail productId={productId} />
      </Suspense>
      <Suspense fallback={<p>Loading reviews...</p>}>
        <ProductReviews productId={productId} />
      </Suspense>
    </div>
  )
}
\`\`\`

Exactly like the Next.js course's streaming lesson: wrapping different sections in separate \`<Suspense>\` boundaries lets each resolve and appear independently — the product details can show up as soon as they're ready, without waiting for the (possibly slower) reviews section, rather than one single boundary blocking the entire page on the slowest piece.

### Where this fits for a plain (non-framework) React app

Suspense-for-data is a genuinely powerful mechanism, but for a plain client-side React app (not using a framework like Next.js that handles the integration for you), it's most practically accessed today through a compatible data-fetching library — module 12's next, final lesson covers exactly this, since libraries like React Query and SWR are what most real, plain-React applications actually reach for, whether or not they specifically use Suspense integration.

> **Key idea:** \`<Suspense>\`, already familiar from code-splitting via \`React.lazy\`, extends to data through the \`use\` hook — a component can "wait" for a Promise to resolve with no manual loading state, but this requires a properly Suspense-integrated data source, not a bare \`fetch\` call, which is exactly the gap dedicated data-fetching libraries fill for plain React apps.`,
    },
    {
      name: "React Query & SWR: Server State Libraries",
      minutes: 9,
      intro: "The current standard approach to fetching, caching, and syncing server data in a React app.",
      content: `### The insight: server data is a fundamentally different kind of state

Recall module 4's \`useState\`, module 8's \`useReducer\` — both manage **client** state: state that belongs entirely to your component tree, that only your app can change. Data fetched from a server is different in a genuinely important way: it's a *cached copy* of something that lives elsewhere, that can change independently of your app (another user editing the same record, for instance), and that needs to be kept reasonably fresh, potentially re-fetched, and shared efficiently if multiple components need the same data. This distinct category is often called **server state**, and it's specifically what libraries like React Query and SWR are built for — not a replacement for \`useState\`/\`useReducer\`, but a different tool for a different kind of state entirely.

### React Query (TanStack Query): the current standard

\`\`\`jsx
import { useQuery } from "@tanstack/react-query"

function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then((res) => res.json()),
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  return <p>{user.name}</p>
}
\`\`\`

Compare this directly to this module's first lesson's complete hand-rolled pattern: loading, error, and race-condition handling are all handled *automatically*, internally, by \`useQuery\` — no manual \`useState\`/\`useEffect\` at all. \`queryKey\` (\`["user", userId]\`) uniquely identifies this specific piece of cached data — the same key from two different components automatically **shares** the same cached result, rather than each component independently re-fetching identical data.

### Caching: the real, substantial payoff beyond just less boilerplate

\`\`\`jsx
// Component A
const { data } = useQuery({ queryKey: ["user", 1], queryFn: () => fetchUser(1) })

// Component B, mounted elsewhere in the tree, at a completely different time
const { data } = useQuery({ queryKey: ["user", 1], queryFn: () => fetchUser(1) })
// if Component A already fetched this, Component B gets the CACHED result INSTANTLY —
// no second network request at all, and both stay in sync if the data is later refetched
\`\`\`

This is the single biggest practical advantage over the hand-rolled pattern: React Query maintains a genuine, shared cache across the entire app, keyed by \`queryKey\` — two completely unrelated components requesting the identical data automatically share one cached result and one in-flight request, rather than each independently hitting the network and potentially showing briefly inconsistent data.

### Automatic background refetching, and mutations

\`\`\`jsx
import { useMutation, useQueryClient } from "@tanstack/react-query"

function EditUserForm({ userId }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (updates) => fetch(\`/api/users/\${userId}\`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })   // marks the cached data as stale, triggers a refetch
    },
  })

  function handleSubmit(updates) {
    mutation.mutate(updates)
  }
}
\`\`\`

\`useMutation\` is React Query's tool for a write operation (create/update/delete), and \`invalidateQueries\` is directly analogous to this platform's Next.js course's \`revalidatePath\`/\`revalidateTag\` — marking specific cached data as stale after a mutation succeeds, so any component displaying it automatically refetches and shows the up-to-date result.

### SWR: a lighter-weight alternative, from the makers of Next.js

\`\`\`jsx
import useSWR from "swr"

function UserProfile({ userId }) {
  const { data: user, error, isLoading } = useSWR(
    \`/api/users/\${userId}\`,
    (url) => fetch(url).then((res) => res.json()),
  )

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error!</p>
  return <p>{user.name}</p>
}
\`\`\`

**SWR** (the name comes from HTTP's "stale-while-revalidate" caching strategy) solves the same fundamental problem as React Query, with a smaller API surface and a slightly simpler mental model — a genuinely reasonable alternative, particularly common in projects already using other tooling from the same team (Vercel, who also build Next.js).

### When to reach for one of these vs the hand-rolled pattern

For a small app with just a handful of independent fetches, the hand-rolled pattern from this module's first lesson (or a simple custom \`useFetch\` hook, module 7) remains genuinely reasonable — not every project needs a dedicated library. React Query/SWR earn their place once an app has: data shared or duplicated across multiple components, a real need for cache invalidation after mutations, or a desire for automatic background refetching/retry behavior — problems the hand-rolled pattern either doesn't solve at all, or would require substantial custom code to solve correctly.

> **Key idea:** server data is a distinct category from client state — cached, shared, and potentially stale — which is exactly what React Query and SWR are purpose-built for: automatic loading/error/race-condition handling, a genuine cross-component cache keyed by query key, and \`invalidateQueries\`-style cache invalidation after mutations, directly analogous to the Next.js course's \`revalidateTag\`.`,
    },
    {
      name: "Optimistic Updates & Advanced Async Patterns",
      minutes: 8,
      intro: "Making the UI feel instant, and handling the messier realities of real network requests.",
      content: `### The problem: waiting for a server response feels slow

\`\`\`jsx
function TodoItem({ todo }) {
  const [isToggling, setIsToggling] = useState(false)

  async function handleToggle() {
    setIsToggling(true)
    await fetch(\`/api/todos/\${todo.id}\`, { method: "PATCH", body: JSON.stringify({ done: !todo.done }) })
    setIsToggling(false)
    // the checkbox only visually updates AFTER the full round-trip completes — feels sluggish
  }
}
\`\`\`

Waiting for a full server round-trip before updating the UI — even a fast one — introduces a perceptible delay between a user's action (clicking a checkbox) and seeing the result. For an action that's very likely to succeed, this delay is often unnecessary.

### Optimistic updates: update the UI immediately, assume success

\`\`\`jsx
function TodoItem({ todo, onToggle }) {
  async function handleToggle() {
    onToggle(todo.id)   // updates LOCAL state IMMEDIATELY — feels instant

    try {
      await fetch(\`/api/todos/\${todo.id}\`, { method: "PATCH", body: JSON.stringify({ done: !todo.done }) })
    } catch (error) {
      onToggle(todo.id)   // if the request actually FAILS, revert the optimistic change
      alert("Failed to update — reverted")
    }
  }

  return <input type="checkbox" checked={todo.done} onChange={handleToggle} />
}
\`\`\`

An **optimistic update** updates the UI *before* the server confirms the change, assuming it will succeed (a reasonable assumption for most simple actions) — and explicitly reverts the change if the request actually fails. This trades a small risk (a brief visual flicker on the rare failure) for a UI that feels significantly more responsive on the common, successful case.

### React Query's built-in optimistic update support

\`\`\`jsx
const mutation = useMutation({
  mutationFn: (updates) => updateTodo(todo.id, updates),
  onMutate: async (updates) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] })
    const previousTodos = queryClient.getQueryData(["todos"])
    queryClient.setQueryData(["todos"], (old) => old.map((t) => (t.id === todo.id ? { ...t, ...updates } : t)))
    return { previousTodos }   // saved for potential rollback
  },
  onError: (err, updates, context) => {
    queryClient.setQueryData(["todos"], context.previousTodos)   // roll back to the saved snapshot on failure
  },
})
\`\`\`

Recall the previous lesson's React Query coverage — \`onMutate\` runs before the actual request, letting you update the cache optimistically and save a snapshot for rollback; \`onError\` restores that snapshot if the mutation genuinely fails. This is the same optimistic-update idea from the hand-rolled example, formalized as a specific, well-supported pattern within the library.

### Retrying a failed request

\`\`\`jsx
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: fetchUser,
  retry: 3,             // automatically retry a failed request up to 3 times
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),   // exponential backoff
})
\`\`\`

A transient network failure (a brief connectivity blip) often succeeds on a retry — React Query supports automatic retries with configurable backoff out of the box, a real, common production concern that's genuinely tedious to implement correctly by hand (recall this platform's Docker course's discussion of \`healthcheck\` retries — an analogous idea, applied to client-side network requests instead of container readiness).

### Polling: re-fetching on an interval

\`\`\`jsx
const { data } = useQuery({
  queryKey: ["orderStatus", orderId],
  queryFn: () => fetchOrderStatus(orderId),
  refetchInterval: 5000,   // re-fetch every 5 seconds, automatically
})
\`\`\`

For data that changes on the server independent of any action in your own app (an order's shipping status, a background job's progress), \`refetchInterval\` polls automatically — directly comparable to a hand-rolled \`setInterval\` inside a \`useEffect\` (module 5), but with the library's caching, error handling, and cleanup already correctly wired in.

> **Key idea:** an optimistic update applies a change to the UI immediately, assuming success, and reverts only if the request actually fails — trading a rare, brief flicker for a UI that feels dramatically more responsive; React Query's \`onMutate\`/\`onError\` formalize this pattern, alongside automatic retry-with-backoff and interval-based polling for data that changes independently of the app's own actions.`,
    },
  ],
}
