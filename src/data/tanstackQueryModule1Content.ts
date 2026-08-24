import type { Module } from "../types"

export const tanstackQueryModule1: Module = {
  id: 1,
  title: "Getting Started with TanStack Query",
  status: "in_progress",
  lessons: [
    {
      name: "What Is TanStack Query & Why Use It",
      minutes: 10,
      intro: "Understand the server-state problem TanStack Query solves, see why hand-rolled fetch/useEffect code falls apart at scale, and place TanStack Query correctly next to client-state libraries like Zustand or Redux.",
      content: `## Two very different kinds of state

Every React app juggles state, but not all state behaves the same way. It helps to split it into two categories:

- **Client state** — state that lives entirely in the browser and that your app fully owns: whether a modal is open, the current value of a text input, which tab is selected. You created it, you control when it changes, and nothing outside your app can invalidate it behind your back.
- **Server state** — state that actually lives somewhere else (a database, an API, another service) and that your app only holds a *cached copy* of: a list of todos, a user's profile, a product catalog. You don't own this data. Someone else can change it — another user, another tab, a background job — and the copy sitting in your component's state can silently go stale the moment you fetch it.

Server state has properties client state doesn't: it's asynchronous to obtain, it can fail (network errors, 500s, timeouts), it can be shared across many components at once, it needs to be cached to avoid refetching constantly, and it eventually needs to be refetched or invalidated because the "real" copy on the server moved on without you. **TanStack Query (the library formerly known as React Query) exists specifically to manage this second category.** It is not a general state manager — it is a dedicated async server-state cache with opinions about caching, deduplication, and freshness baked in.

## The problem with useEffect + fetch + useState

Before reaching for a library, it's worth seeing exactly what goes wrong when you fetch data "by hand." A typical first attempt looks like this:

\`\`\`tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Something went wrong.</p>
  return <ul>{todos!.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
}
\`\`\`

This looks reasonable, and for a single component fetching once, it even works. The trouble starts once a real app grows around it:

- **Boilerplate multiplies.** Every component that fetches anything repeats the same three pieces of state and the same loading/error branches. Across dozens of components, that's a lot of near-identical, easy-to-typo code.
- **No caching.** Navigate away from \`TodoList\` and back, and it fetches \`/api/todos\` all over again — even though nothing changed. Two sibling components that both need the same todos each fire their own independent request, doubling network traffic for identical data.
- **Race conditions.** If the fetch depends on a changing value (a search term, a page number) and the user changes it quickly, an older, slower response can resolve *after* a newer one and overwrite it with stale data. Handling this correctly by hand means manually tracking "is this still the latest request" with refs or cleanup flags — easy to get wrong, easy to forget.
- **No automatic refetching.** If the todos change on the server (another tab created one), this component has no idea. It'll show stale data indefinitely, until the user does something that happens to remount the component.
- **No retry, no dedup, no background updates.** Real apps want failed requests to retry with backoff, want two components requesting the same data at the same instant to share one network call, and want data to quietly refresh in the background when the user refocuses the tab — none of that exists here, and hand-building it well is a genuinely hard, easy-to-get-subtly-wrong problem.

None of these are exotic edge cases — they're what "fetching data in a real app" actually involves once more than one screen touches the network. TanStack Query's entire value proposition is that it has already solved all of the above, correctly, and exposes it through a couple of hooks.

## What TanStack Query actually is

TanStack Query is a library for **fetching, caching, synchronizing, and updating server state** in your UI, built around one central idea: an in-memory cache, keyed by a value you choose (a "query key"), that tracks the status of every piece of async data your app has asked for — whether it's loading, whether it errored, how old it is, and when it should be refetched. It is deliberately **not** tied to any specific way of fetching data — it doesn't ship its own HTTP client. Your \`queryFn\` can use \`fetch\`, \`axios\`, a GraphQL client, a Supabase client, or literally anything that returns a promise. TanStack Query only cares about the promise's lifecycle: pending, resolved, or rejected.

The rewritten version of the component above, using the \`useQuery\` hook this course spends the next several modules on:

\`\`\`tsx
function TodoList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((res) => res.json()),
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Something went wrong.</p>
  return <ul>{data.map((t: Todo) => <li key={t.id}>{t.title}</li>)}</ul>
}
\`\`\`

Same UI, a fraction of the code — and this version gets caching, deduplication, background refetching, and retries for free, without writing any of that logic yourself. Every module after this one is really just exploring the surface area of what that one hook (and its companion, \`useMutation\`, for writes) actually offers underneath this simple-looking call.

## An honest boundary: what TanStack Query is not

It's worth being precise about scope, because a common early mistake is reaching for TanStack Query to solve problems it was never designed for:

| | TanStack Query | Zustand / Redux / Context |
|---|---|---|
| Manages | Server state (async, cached, can go stale) | Client state (synchronous, fully owned by your app) |
| Example | A list of todos fetched from an API | Whether a sidebar is collapsed |
| Has a network/caching model | Yes — this is its entire purpose | No — not its job |
| Replaces the other | No | No |

TanStack Query does not replace a client-state library, and a client-state library does not replace TanStack Query — they solve different problems and are frequently used side by side in the same app: TanStack Query owns everything that came from the server, a lightweight store like Zustand (or plain \`useState\`/Context) owns everything that's purely local UI state. Trying to stuff server data into Redux, or trying to make TanStack Query track a modal's open/closed state, both fight the tool. The rest of this course focuses squarely on the server-state half of that boundary.

> **Key idea:** Server state — async, cacheable, ownable by something outside your app — behaves fundamentally differently from client state, and hand-rolled \`useEffect\`/\`fetch\`/\`useState\` code silently breaks down around caching, deduplication, and race conditions as an app grows; TanStack Query is a dedicated cache for server state (fetching-library-agnostic, working with any promise-returning function) that solves those problems, and it complements rather than replaces client-state tools like Zustand or Redux.`,
    },
    {
      name: "Installing & Setting Up TanStack Query",
      minutes: 9,
      intro: "Install the React adapter, create a QueryClient, wrap the app in a provider, and mount the devtools for a fast development feedback loop.",
      content: `## Installing the package

TanStack Query ships framework-specific adapters under the \`@tanstack/\` scope — \`@tanstack/react-query\` for React, \`@tanstack/vue-query\` for Vue, and so on, all built on top of a shared, framework-agnostic core. This course uses the React adapter throughout:

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

That single package is all you need to start using \`useQuery\` and \`useMutation\`. A second, optional package adds a visual debugging panel and is covered later in this lesson.

## The QueryClient: one cache per app

Everything TanStack Query does — caching, deduplication, background refetching — is coordinated by a single object called the \`QueryClient\`. It holds the actual in-memory cache and the default configuration every query and mutation falls back to unless it overrides something itself. You create exactly one \`QueryClient\` per application (not per component, not per route):

\`\`\`tsx
import { QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient()
\`\`\`

Creating it outside of any component (as a module-level constant, as shown here, or memoized with \`useState\` if it needs to be created inside a component for testing reasons) matters: if you accidentally create a *new* \`QueryClient\` on every render, you'd wipe the entire cache on every render too, defeating the whole point of having one.

## Making the cache available: QueryClientProvider

A bare \`QueryClient\` instance does nothing on its own — components need access to it, and that access is provided through React context via \`QueryClientProvider\`, wrapped around the part of your component tree that should be able to use queries (almost always the whole app):

\`\`\`tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { App } from "./App"

const queryClient = new QueryClient()

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
\`\`\`

Every \`useQuery\` and \`useMutation\` call anywhere inside \`<App />\` now reads from and writes to that one shared \`queryClient\` instance behind the scenes — which is exactly what makes deduplication possible: two components calling \`useQuery\` with the identical query key are talking to the same cache entry, not two separate ones.

## Setting sensible defaults

The \`QueryClient\` constructor accepts a \`defaultOptions\` object, letting you set app-wide defaults that every query and mutation inherits unless it explicitly overrides them — this is the place to make a one-time decision instead of repeating an option on every single \`useQuery\` call:

\`\`\`tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute — covered in depth in Module 4
      retry: 1,
    },
  },
})
\`\`\`

This course covers what \`staleTime\` and \`retry\` actually control in Module 4 — for now, the important structural point is simply that defaults live on the \`QueryClient\`, and per-query options passed to an individual \`useQuery\` call always win over these defaults.

## Installing the devtools

TanStack Query ships a companion devtools package that renders a panel showing every query in the cache, its status, its data, and when it'll next refetch — genuinely useful from the very first query you write, not just for debugging advanced issues later:

\`\`\`bash
npm install @tanstack/react-query-devtools
\`\`\`

Mount it once, near the top of the tree, inside the same provider:

\`\`\`tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { App } from "./App"

const queryClient = new QueryClient()

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
\`\`\`

The devtools component automatically excludes itself from production bundles when built with a standard modern bundler, so it's safe to leave mounted in the tree rather than conditionally rendering it — but check your specific bundler's docs if you want to be certain, since this relies on the package's own \`process.env.NODE_ENV\` check being tree-shaken correctly. It renders a small floating toggle button in the corner of the screen; clicking it opens a panel listing every active and inactive query, letting you inspect cached data, manually trigger refetches, and watch a query's status change in real time as you interact with your app. Keeping this panel open while working through the rest of this course is genuinely one of the fastest ways to build an accurate mental model of what TanStack Query is doing under the hood.

> **Key idea:** One \`QueryClient\` holds the entire cache for your app; \`QueryClientProvider\` makes it available to every component via context, app-wide defaults live in \`defaultOptions\`, and the devtools package gives you a live, visual window into cache state that's worth keeping open throughout this course.`,
    },
    {
      name: "Your First Query with useQuery",
      minutes: 11,
      intro: "Write your first useQuery call, read its status flags, render loading/error/success states, and see automatic caching and deduplication in action.",
      content: `## The shape of useQuery

With a \`QueryClient\` and provider in place, fetching data comes down to a single hook call. \`useQuery\` takes an options object with (at minimum) two required fields — \`queryKey\` and \`queryFn\` — and returns an object describing the current state of that query:

\`\`\`tsx
import { useQuery } from "@tanstack/react-query"

interface Todo {
  id: number
  title: string
  completed: boolean
}

function TodoList() {
  const { data, isLoading, isError, error } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((res) => res.json()),
  })

  if (isLoading) return <p>Loading todos...</p>
  if (isError) return <p>Error: {error.message}</p>

  return (
    <ul>
      {data!.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

- **\`queryKey\`** — an array that uniquely identifies this piece of data in the cache. \`["todos"]\` here means "the list of all todos." Module 2 covers key design in depth; for now, treat it as the cache's lookup address.
- **\`queryFn\`** — a function that returns a promise resolving to the data. TanStack Query calls it, tracks whether it's pending/resolved/rejected, and stores the result under \`queryKey\`. It does not care *how* the promise gets its data — \`fetch\`, \`axios\`, anything works.

## Reading the result: status flags

\`useQuery\`'s return value carries several boolean flags describing where the request currently stands, all derived from a single underlying \`status\` field (\`"pending" | "error" | "success"\`):

| Flag | True when |
|---|---|
| \`isLoading\` | The query is fetching for the very first time and there's no cached data yet to show |
| \`isError\` | The most recent fetch attempt failed |
| \`isSuccess\` | Data was fetched successfully and is available in \`data\` |
| \`isFetching\` | A request is in flight right now, for *any* reason — including a background refetch of data you already have (covered in Module 4) |

A subtlety worth internalizing early: \`isLoading\` is specifically about the *first* fetch with no data yet — it is not the same as "a request is currently happening." If a query already has cached data and is silently refetching in the background, \`isFetching\` is \`true\` but \`isLoading\` stays \`false\`, because there's already data to render. Using \`isLoading\` for your primary "show a spinner" check and reserving \`isFetching\` for a smaller, secondary "refreshing..." indicator is the pattern most apps want.

## Rendering the three real states

Every query realistically has three states your UI needs to handle: still loading with nothing to show yet, failed, and succeeded with data. The pattern shown in the first example above — checking \`isLoading\`, then \`isError\`, then falling through to the success case — is the standard shape almost every component built around \`useQuery\` follows:

\`\`\`tsx
function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      fetch("/api/users/" + userId).then((res) => {
        if (!res.ok) throw new Error("Failed to load user")
        return res.json()
      }),
  })

  if (isLoading) return <Spinner />
  if (isError) return <ErrorBanner message={error.message} />

  return <ProfileCard user={data} />
}
\`\`\`

Note the \`if (!res.ok) throw new Error(...)\` inside \`queryFn\` — \`fetch\` famously does *not* reject its promise on a 404 or 500, only on true network failure, so without that explicit check a failed HTTP request would look like a successful one to TanStack Query and \`data\` would end up holding an error response body. Throwing is what tells TanStack Query "this attempt failed" — a pattern this course revisits and relies on throughout.

## Caching and deduplication, live

Here's the payoff for the setup done in the previous lesson: mount \`<TodoList />\` twice on the same screen — say, once in a sidebar and once in a main panel, both calling \`useQuery({ queryKey: ["todos"], ... })\`:

\`\`\`tsx
function Dashboard() {
  return (
    <div>
      <Sidebar>
        <TodoList />
      </Sidebar>
      <MainPanel>
        <TodoList />
      </MainPanel>
    </div>
  )
}
\`\`\`

Even though \`TodoList\` renders twice and each instance independently calls \`useQuery\`, open the network tab and you'll see exactly **one** request fire for \`/api/todos\`, not two. Because both instances share the identical query key against the same \`QueryClient\`, TanStack Query recognizes them as the same logical piece of data, fetches it once, and hands both components the same cached result. Navigate away from the dashboard and back within a short window, and — depending on the \`staleTime\` covered in Module 4 — it may not even refetch at all, instead instantly rendering the cached data while silently checking in the background. This behavior, entirely automatic and requiring zero code from you, is the concrete difference between the hand-rolled \`useEffect\` version from the first lesson and reaching for a real query cache.

> **Key idea:** \`useQuery({ queryKey, queryFn })\` returns status flags (\`isLoading\` for "no data yet," \`isFetching\` for "a request is in flight right now") that drive a standard loading/error/success render pattern, \`queryFn\` must throw to signal failure since a resolved promise always means success, and identical query keys across components automatically share one cached request instead of firing duplicates.`,
    },
  ],
}
