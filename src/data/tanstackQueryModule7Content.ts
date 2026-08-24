import type { Module } from "../types"

export const tanstackQueryModule7: Module = {
  id: 7,
  title: "Dependent, Parallel Queries & useQueries",
  status: "upcoming",
  lessons: [
    {
      name: "Dependent Queries with enabled",
      minutes: 9,
      intro: "Chain one query on the result of another using the enabled option, and understand the request-waterfall tradeoff that comes with it.",
      content: `## The problem: a query that needs another query's data first

Most of the queries covered so far have been independent — each one has everything it needs to run the moment the component mounts. But it's extremely common to need a second request that depends on data only the *first* request produces. The textbook example: fetch the logged-in user, then fetch that user's projects using the user's \`id\`.

\`\`\`tsx
function UserProjects({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  // BROKEN: userQuery.data might be undefined on the first render(s)
  const projectsQuery = useQuery({
    queryKey: ["projects", userQuery.data?.id],
    queryFn: () => fetchProjects(userQuery.data!.id),
  })

  // ...
}
\`\`\`

This compiles, and it might even *look* like it works, but it's broken in a specific way: \`useQuery\` fires its \`queryFn\` as soon as the hook runs, regardless of whether \`userQuery.data\` has actually resolved yet. On the very first render, \`userQuery.data\` is \`undefined\`, so \`projectsQuery\`'s \`queryFn\` runs with \`userQuery.data!.id\` — a non-null assertion lying to TypeScript about a value that is, in fact, \`undefined\` at that moment. This throws inside the query function, and TanStack Query dutifully reports it as a failed query, retries it a few times per your retry config, and eventually gives up — while the *actual* data was simply "not ready yet," not genuinely unavailable.

## The fix: the enabled option

\`useQuery\` accepts an \`enabled\` option — a boolean that controls whether the query is allowed to run at all. When \`enabled\` is \`false\`, the query stays in an idle-like state: no request fires, \`isPending\` stays \`true\`, and \`data\` stays \`undefined\`, until \`enabled\` flips to \`true\` (usually because some piece of state or a prior query's data became available), at which point TanStack Query fires the query function for the first time.

\`\`\`tsx
function UserProjects({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  const projectsQuery = useQuery({
    queryKey: ["projects", userQuery.data?.id],
    queryFn: () => fetchProjects(userQuery.data!.id),
    enabled: !!userQuery.data?.id,
  })

  if (userQuery.isPending) return <p>Loading user...</p>
  if (userQuery.isError) return <p>Failed to load user.</p>

  if (projectsQuery.isPending) return <p>Loading projects...</p>
  if (projectsQuery.isError) return <p>Failed to load projects.</p>

  return (
    <ul>
      {projectsQuery.data.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

Two things changed, and both matter:

1. \`enabled: !!userQuery.data?.id\` — the projects query is only allowed to run once \`userQuery.data\` exists and has an \`id\`. Before that, it just sits idle.
2. The query key still includes \`userQuery.data?.id\` (which is \`undefined\` until the user loads). This is deliberate, not incidental — TanStack Query needs the key to actually change (from a key containing \`undefined\` to one containing the real id) so it recognizes this as a *new* query once \`enabled\` flips to \`true\`, rather than reusing a stale cache entry keyed on \`undefined\`.

Now the non-null assertion \`userQuery.data!.id\` inside \`queryFn\` is actually safe at runtime: TanStack Query guarantees \`queryFn\` never runs while \`enabled\` is falsy, so by the time it does run, \`userQuery.data\` is guaranteed to exist.

## What isPending actually tells you here

Before \`enabled\` becomes \`true\`, \`projectsQuery.isPending\` is \`true\` and \`projectsQuery.fetchStatus\` is \`"idle"\` — the query genuinely hasn't started fetching, as opposed to \`"fetching"\` (actively in flight) you'd see for a normal enabled query while its request is outstanding. This \`status\`/\`fetchStatus\` distinction, introduced in an earlier module, is exactly why disabled queries don't look like errors or infinite loading spinners with no explanation — \`fetchStatus: "idle"\` combined with \`isPending: true\` is the specific, checkable signature of "this query hasn't been allowed to run yet."

\`\`\`tsx
console.log(projectsQuery.status)      // "pending"
console.log(projectsQuery.fetchStatus) // "idle" — not fetching, waiting on enabled
\`\`\`

## Chains longer than two

Nothing stops you from chaining three, four, or more dependent queries — each one's \`enabled\` gated on the previous one's data:

\`\`\`tsx
const orgQuery = useQuery({
  queryKey: ["org", orgSlug],
  queryFn: () => fetchOrg(orgSlug),
})

const teamQuery = useQuery({
  queryKey: ["team", orgQuery.data?.defaultTeamId],
  queryFn: () => fetchTeam(orgQuery.data!.defaultTeamId),
  enabled: !!orgQuery.data?.defaultTeamId,
})

const membersQuery = useQuery({
  queryKey: ["members", teamQuery.data?.id],
  queryFn: () => fetchTeamMembers(teamQuery.data!.id),
  enabled: !!teamQuery.data?.id,
})
\`\`\`

Each step waits for the previous one, in strict sequence.

## The honest tradeoff: this is a request waterfall

It's worth naming plainly what dependent queries actually cost: they're a **request waterfall**. The org request has to fully complete before the team request even starts, and the team request has to fully complete before the members request starts. If each request takes 200ms, the user is looking at roughly 600ms of sequential network time before \`membersQuery\` has anything to show — even though, from a server's perspective, these could potentially have been fetched with a lot more overlap.

This is sometimes genuinely unavoidable — you truly cannot ask for "this user's projects" without first knowing which user, and there's no way around that dependency at the data level. But it's worth pausing before reaching for \`enabled\`-chained queries as a default pattern, because two better options often exist:

- **A single backend endpoint that already joins the data** — if your API can return \`{ user, projects }\` from one request, that's strictly faster than two round trips, and it sidesteps the waterfall entirely. This is often the right conversation to have with backend/API design rather than solving it purely on the client.
- **Prefetching (covered later in this course)** — if you can predict the second query's key ahead of time (e.g. from a route param you already have, not from the first query's response), you can kick both off in parallel instead of sequentially.

Reach for \`enabled\`-based dependent queries when the second request's parameters *genuinely* only exist inside the first response — that's the case they're built for — not as a default way to sequence any two related fetches.

> **Key idea:** Use \`enabled: !!someCondition\` to prevent a query from firing until data it depends on is actually available, and keep that dependent value in the query key so the query is correctly recognized as "new" once it becomes enabled — but recognize that chained \`enabled\` queries create a real request waterfall, and prefer a combined backend endpoint or prefetching when the dependency can be avoided.`,
    },
    {
      name: "Parallel Queries",
      minutes: 8,
      intro: "Call multiple independent useQuery hooks side by side and let React and TanStack Query fire their requests concurrently, with no special API required.",
      content: `## Parallel queries need nothing special

If two pieces of data don't depend on each other, the default way to fetch both is simply to call \`useQuery\` twice (or more), side by side, in the same component:

\`\`\`tsx
function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  })

  const activityQuery = useQuery({
    queryKey: ["activity"],
    queryFn: fetchActivity,
  })

  if (statsQuery.isPending || activityQuery.isPending) {
    return <p>Loading dashboard...</p>
  }

  if (statsQuery.isError || activityQuery.isError) {
    return <p>Something went wrong.</p>
  }

  return (
    <div>
      <StatsPanel stats={statsQuery.data} />
      <ActivityFeed items={activityQuery.data} />
    </div>
  )
}
\`\`\`

This is genuinely the whole pattern — there's no \`useParallelQueries\` hook, no special wrapper needed. Both \`queryFn\`s run essentially at the same time: React renders the component once, both \`useQuery\` calls execute during that render, and TanStack Query kicks off both underlying network requests without waiting for either to finish first. Compare this to the dependent-query pattern from the previous lesson, where the second \`queryFn\` was deliberately held back with \`enabled\` — here, nothing is holding either one back, so they run concurrently by default.

## Why this is easy to miss

Coming from imperative data-fetching code — \`await\`ing one request, then \`await\`ing the next — it's natural to assume you need to explicitly \`Promise.all\` things to get parallelism. With plain \`useQuery\` calls, you don't: each hook manages its own request lifecycle completely independently, so simply *not* sequencing them (not making one's \`enabled\` or query key depend on the other's \`data\`) is sufficient for them to run in parallel. The three states (\`statsQuery\`, \`activityQuery\`) are just two separate, uncoupled subscriptions to the cache, each doing its own fetch, resolve, and re-render.

## Combining loading and error states cleanly

The manual \`if (a.isPending || b.isPending)\` / \`if (a.isError || b.isError)\` pattern shown above works fine for two queries, but it gets noisy fast as the count grows, and it's easy to forget to check a state for a newly-added query. A small helper tidies this up:

\`\`\`tsx
function combineQueryStates(queries: Array<{ isPending: boolean; isError: boolean }>) {
  return {
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
  }
}

function Dashboard() {
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: fetchStats })
  const activityQuery = useQuery({ queryKey: ["activity"], queryFn: fetchActivity })
  const notificationsQuery = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications })

  const { isPending, isError } = combineQueryStates([statsQuery, activityQuery, notificationsQuery])

  if (isPending) return <p>Loading dashboard...</p>
  if (isError) return <p>Something went wrong.</p>

  return (
    <div>
      <StatsPanel stats={statsQuery.data!} />
      <ActivityFeed items={activityQuery.data!} />
      <NotificationBell items={notificationsQuery.data!} />
    </div>
  )
}
\`\`\`

This is still just plain application code, not a TanStack Query feature — it's shown here because "how do I cleanly aggregate N independent query states" is a question every real dashboard-style component eventually runs into. The next lesson's \`useQueries\` hook actually gives you this aggregation *built in*, for a specific and important case: when you don't know how many queries you need until runtime.

## When parallel isn't actually what you want

Not every pair of related fetches should run in parallel. If rendering \`ActivityFeed\` genuinely doesn't make sense without \`statsQuery\`'s result — say, the activity feed needs to know the account's plan tier to decide which columns to show — that's not a parallel-queries situation anymore, it's a dependent-queries situation from the previous lesson, and reaching for \`enabled\` is the correct call even though it's slower. Parallel queries are for data that's independently useful and independently displayable; if one panel can't render sensibly without another panel's data, don't force them into unrelated \`useQuery\` calls just to get concurrency — model the actual dependency instead.

> **Key idea:** Independent \`useQuery\` calls run in parallel automatically — no special API is needed, just avoid coupling one query's key or \`enabled\` state to another's \`data\` unless a real dependency exists; reach for a small helper (or \`useQueries\`, next lesson) once you're aggregating loading/error state across more than a couple of them.`,
    },
    {
      name: "Dynamic Parallel Queries with useQueries",
      minutes: 10,
      intro: "Use the useQueries hook to fire a variable, runtime-determined number of queries and work with the array of results it returns.",
      content: `## The problem useQueries solves

Calling \`useQuery\` multiple times side by side works great when you know, at compile time, exactly how many queries you need — two, three, a fixed handful. But React's Rules of Hooks forbid calling hooks inside a loop or conditionally, so this approach breaks down the moment the *number* of queries depends on runtime data:

\`\`\`tsx
function ProjectList({ projectIds }: { projectIds: string[] }) {
  // ILLEGAL: you cannot call useQuery inside a loop or map callback
  const results = projectIds.map((id) =>
    useQuery({ queryKey: ["project", id], queryFn: () => fetchProject(id) }),
  )
  // ...
}
\`\`\`

This violates the Rules of Hooks the instant \`projectIds.length\` changes between renders — React relies on hooks being called in the exact same order, the exact same number of times, on every render, and a \`.map()\` over a variable-length array can't guarantee that.

## useQueries: one hook, an array of query configs in, an array of results out

\`useQueries\` is built specifically for this case. It takes a single options object with a \`queries\` array — one config object per query you want, built however you like at runtime — and returns an array of results in the same order:

\`\`\`tsx
import { useQueries } from "@tanstack/react-query"

function ProjectList({ projectIds }: { projectIds: string[] }) {
  const projectQueries = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ["project", id],
      queryFn: () => fetchProject(id),
    })),
  })

  return (
    <ul>
      {projectQueries.map((query, i) => {
        if (query.isPending) return <li key={projectIds[i]}>Loading...</li>
        if (query.isError) return <li key={projectIds[i]}>Failed to load.</li>
        return <li key={projectIds[i]}>{query.data.name}</li>
      })}
    </ul>
  )
}
\`\`\`

This is a single hook call — legal under the Rules of Hooks regardless of how many entries \`projectIds\` has, because from React's point of view it's just one \`useQueries\` call every render, even though internally TanStack Query is managing an independent cache entry, fetch lifecycle, and set of options for every project id in the array. Each result object in the returned array has exactly the same shape as a normal \`useQuery\` result (\`data\`, \`isPending\`, \`isError\`, \`status\`, and so on), just one per entry in \`queries\`.

## Aggregating results with combine

Mapping over the raw array and rendering a list item per entry (as above) is one common pattern, but sometimes you want a single, combined summary instead — "are *all* of these done loading," "give me a flat array of just the successful data." \`useQueries\` supports this directly through a \`combine\` option, which runs after every underlying query updates and lets you reduce the whole array into whatever shape your component actually wants:

\`\`\`tsx
function ProjectSummary({ projectIds }: { projectIds: string[] }) {
  const { data, pending } = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ["project", id],
      queryFn: () => fetchProject(id),
    })),
    combine: (results) => ({
      data: results.map((r) => r.data).filter(Boolean),
      pending: results.some((r) => r.isPending),
    }),
  })

  if (pending) return <p>Loading projects...</p>

  return (
    <p>
      {data.length} project{data.length === 1 ? "" : "s"} loaded.
    </p>
  )
}
\`\`\`

\`combine\` is worth reaching for specifically because it's memoized internally by TanStack Query based on the underlying results — it avoids recomputing (and returning a brand-new object reference for) the combined value on every render unless something in the underlying query results actually changed, which matters for avoiding unnecessary re-renders of components that consume the combined value.

## An empty array is a valid, common edge case

Because \`queries\` is built from a runtime array, it's worth explicitly handling the case where that array is empty — \`useQueries({ queries: [] })\` is perfectly legal and simply returns an empty results array, no errors, no special casing required on TanStack Query's side:

\`\`\`tsx
const projectQueries = useQueries({
  queries: projectIds.map((id) => ({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
  })),
})
// projectIds === [] → projectQueries === [], nothing fetched, nothing rendered
\`\`\`

Your own rendering logic still needs to decide what an empty list means for the UI (an empty state message, most likely) — \`useQueries\` itself handles the zero-queries case gracefully without any extra configuration.

## useQueries vs a single batched endpoint

As with the dependent-queries lesson, it's worth being honest about the tradeoff: \`useQueries\` fires one HTTP request per entry in the array. For ten project ids, that's ten separate requests (in parallel, but still ten round trips, ten sets of headers, ten opportunities for one to fail independently of the others). If your backend can expose a single \`GET /projects?ids=1,2,3\`-style batched endpoint, a single ordinary \`useQuery\` call against that endpoint is often both simpler and more efficient than \`useQueries\` over N individual endpoints. Reach for \`useQueries\` when the queries are genuinely independent resources that also benefit from being individually cached (each project id becomes its own cache entry, individually invalidatable) — not as an automatic replacement for a batched API your backend could just as easily provide.

> **Key idea:** \`useQueries\` is the array-based counterpart to \`useQuery\`, built for when the number of queries is only known at runtime — it respects the Rules of Hooks by being a single hook call under the hood, returns an array of per-query results, and supports a \`combine\` option to reduce that array into a single memoized summary value.`,
    },
  ],
}
