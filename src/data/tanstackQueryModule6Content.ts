import type { Module } from "../types"

export const tanstackQueryModule6: Module = {
  id: 6,
  title: "Optimistic Updates & Manual Cache Updates",
  status: "upcoming",
  lessons: [
    {
      name: "Reading & Writing the Cache Directly",
      minutes: 9,
      intro: "Use queryClient.getQueryData and setQueryData to read and patch cached data directly, and see when a direct write beats an invalidation round-trip.",
      content: `## The cache is just data you can touch

Every query's cached value lives inside the \`QueryClient\`, keyed by its query key — and \`QueryClient\` exposes direct methods to read and write that cache without going through a component's \`useQuery\` call at all. This is a step beyond invalidation (Module 5's default strategy): instead of marking data stale and waiting for a refetch, you set the cached value yourself, synchronously, right now.

\`\`\`tsx
import { useQueryClient } from "@tanstack/react-query"

function TodoDebugPanel() {
  const queryClient = useQueryClient()

  function logCurrentTodos() {
    const todos = queryClient.getQueryData(["todos"])
    console.log(todos)
  }

  return <button onClick={logCurrentTodos}>Log cached todos</button>
}
\`\`\`

\`getQueryData(queryKey)\` returns whatever is currently cached for that exact key, or \`undefined\` if nothing is cached yet — it does **not** trigger a fetch, and it's not reactive (calling it doesn't re-render your component when the underlying data later changes; for that you still want \`useQuery\`). It's a synchronous snapshot read, useful for one-off logic like the debug panel above, or for reading a cache value from inside a callback (like a mutation's \`onSuccess\`) where a hook call isn't appropriate.

## Writing with setQueryData

\`setQueryData\` is the write counterpart, and it accepts either a new value directly or an **updater function** that receives the previous cached value and returns the new one:

\`\`\`tsx
// Direct replacement
queryClient.setQueryData(["todos", 42], updatedTodo)

// Updater function — safer when you need the previous value to compute the new one
queryClient.setQueryData(["todos"], (previousTodos: Todo[] | undefined) => {
  if (!previousTodos) return previousTodos
  return previousTodos.map((todo) =>
    todo.id === updatedTodo.id ? updatedTodo : todo,
  )
})
\`\`\`

The updater-function form is almost always the right choice for anything beyond a single-item replacement, because it guards against the previous value being \`undefined\` (nothing cached yet) and because it makes the update an explicit, pure transformation of whatever the cache currently holds — rather than assuming you know its exact current shape. Calling \`setQueryData\` immediately updates every component subscribed to that query key via \`useQuery\` — it's synchronous and reactive in that direction, even though \`getQueryData\` reads are not.

## When a direct write beats invalidation

Module 5 established invalidation as the default: after a mutation, mark the affected query stale and let it refetch. That's simple and always correct, but it costs a network round-trip you sometimes don't need — specifically when **the mutation's response already contains the exact data the query would refetch anyway**.

\`\`\`tsx
async function updateTodo(todo: Todo): Promise<Todo> {
  const res = await fetch(\`/api/todos/\${todo.id}\`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  })
  return res.json() // the server returns the full, updated todo
}

function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTodo,
    onSuccess: (updatedTodo) => {
      // The server already gave us the fresh todo — no need to refetch it
      queryClient.setQueryData(["todos", updatedTodo.id], updatedTodo)

      // Also patch it inside the cached list, so the list view updates too
      queryClient.setQueryData(["todos"], (old: Todo[] | undefined) =>
        old?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
      )
    },
  })
}
\`\`\`

Here, calling \`invalidateQueries\` instead would work, but it would trigger a second network request purely to fetch data the \`PATCH\` response already handed you for free. Writing it directly into the cache with \`setQueryData\` makes the UI update instantly, with zero extra requests.

The tradeoff: this only stays correct as long as your assumption about the server's response shape holds. If the server response is a partial object, or if other server-side fields (computed values, timestamps, derived counts) could change in ways your local patch doesn't account for, a stale assumption baked into a manual \`setQueryData\` call can quietly drift from reality in a way invalidation never would, since invalidation always asks the server what's true. A common, pragmatic middle ground is doing both: \`setQueryData\` for the instant UI update, followed by an \`invalidateQueries\` call to reconcile with the server in the background — instant feedback now, guaranteed correctness shortly after.

| Approach | Network cost | Correctness guarantee |
|---|---|---|
| \`invalidateQueries\` | One extra request per affected query | Always reflects real server state |
| \`setQueryData\` only | None | Only as correct as your manual patch |
| \`setQueryData\` + \`invalidateQueries\` | One background request, UI updates instantly first | Instant feedback, then guaranteed correctness |

> **Key idea:** \`queryClient.getQueryData\`/\`setQueryData\` read and write the cache directly and synchronously, bypassing a refetch — reach for \`setQueryData\` when a mutation's response already contains the fresh data a refetch would produce anyway, and consider pairing it with a background \`invalidateQueries\` call when you want both instant feedback and a guarantee that the cache eventually matches the server exactly.`,
    },
    {
      name: "Building an Optimistic Update",
      minutes: 12,
      intro: "Assemble the full optimistic-update recipe with onMutate, onError rollback, and onSettled reconciliation, and prevent race conditions with cancelQueries.",
      content: `## What "optimistic" means here

So far, every mutation in this course waits for the server to respond before the UI reflects the change — \`isPending\` shows a loading state, then either the success or error UI takes over once \`mutationFn\` resolves or rejects. An **optimistic update** flips that order: update the UI *immediately*, assuming the mutation will succeed, before the network request has even completed. If it turns out to fail, you roll the UI back to what it was. For interactions where success is the overwhelming common case — liking a post, checking off a todo, toggling a favorite — this makes the app feel instant instead of waiting on network latency for something that will almost always work anyway.

This lesson assembles the recipe out of pieces from the last two lessons: \`onMutate\` (Module 5) and \`setQueryData\` (this module's previous lesson), plus one new method, \`cancelQueries\`.

## The full recipe

\`\`\`tsx
interface Todo {
  id: number
  title: string
  done: boolean
}

function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todo: Todo) =>
      fetch(\`/api/todos/\${todo.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done }),
      }).then((res) => res.json()),

    // 1. Runs before the request fires — apply the optimistic change here
    onMutate: async (toggledTodo) => {
      // Stop any in-flight refetch for this key so it can't overwrite our optimistic write
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      // Snapshot the current cache so we can roll back if this fails
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])

      // Optimistically apply the change
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) =>
          t.id === toggledTodo.id ? { ...t, done: !t.done } : t,
        ),
      )

      // Whatever we return here becomes "context" in onError/onSettled
      return { previousTodos }
    },

    // 2. Runs if mutationFn rejects — roll back using the snapshot from onMutate
    onError: (error, toggledTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },

    // 3. Runs either way — reconcile with the real server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}
\`\`\`

Walking through it in order: \`onMutate\` fires the instant the mutation starts, before any network request. It cancels anything already in flight for that key, takes a snapshot of the current cache value, writes the optimistic change into the cache immediately, and returns the snapshot as \`context\`. The UI re-renders instantly with the toggled state — the user sees the checkbox flip with no visible delay. If the request later fails, \`onError\` receives that same \`context\` and uses it to restore exactly what was cached before the optimistic write happened. Either way — success or failure — \`onSettled\` invalidates the query, triggering a real refetch that reconciles the cache with whatever the server actually has, cleaning up any small discrepancy between the optimistic guess and reality.

## Why cancelQueries matters: the race condition it prevents

Without the \`await queryClient.cancelQueries({ queryKey: ["todos"] })\` line, a subtle race becomes possible: imagine a background refetch for \`["todos"]\` was already in flight (say, triggered by a window focus event) at the exact moment the user clicked to toggle a todo. The sequence without cancellation could play out as:

\`\`\`text
1. Background refetch starts (window focus)
2. onMutate runs: snapshot taken, optimistic update applied → UI shows toggled state
3. Background refetch resolves with the OLD (pre-toggle) data → overwrites the optimistic update!
4. mutationFn (the actual PATCH) resolves
5. onSettled invalidates → eventually refetches correctly, but the UI flickered back and forth
\`\`\`

The optimistic update briefly gets clobbered by a stale in-flight response landing after it. \`cancelQueries\` avoids this entirely by cancelling that in-flight background refetch before applying the optimistic write, so there's no old response left to land on top of it. This is the reason \`cancelQueries\` is awaited (\`await queryClient.cancelQueries(...)\`) before taking the snapshot — you want cancellation to complete first, guaranteeing nothing else can silently overwrite the cache between your snapshot and your optimistic write.

## When to reach for this

Optimistic updates add real complexity — a snapshot, a rollback path, a cancellation step — for a UI benefit that matters most on interactions that are frequent, low-risk, and overwhelmingly likely to succeed. A todo checkbox, a like button, a star/favorite toggle are ideal candidates. A payment submission or an irreversible delete are usually poor candidates — the brief loading state from a normal (non-optimistic) mutation is a small cost next to the confusion of a UI that appeared to succeed and then visibly reverted. Reach for this pattern deliberately, for specific interactions, rather than as a default replacement for the plain \`useMutation\` pattern from Module 5.

> **Key idea:** An optimistic update applies the change to the cache immediately in \`onMutate\` (after \`cancelQueries\` to prevent an in-flight refetch from clobbering it), rolls back to a snapshot in \`onError\` if the mutation fails, and reconciles with the server via \`invalidateQueries\` in \`onSettled\` regardless of outcome — reserve it for frequent, low-risk, high-success-rate interactions where instant feedback is worth the added complexity.`,
    },
    {
      name: "Updating Related Queries",
      minutes: 9,
      intro: "Sync a single-item mutation into a cached list (and vice versa), and use setQueriesData to patch several related cached queries in one pattern-matched call.",
      content: `## The same data, cached under different keys

A single mutation often needs to update more than one cached query, because the same underlying resource is legitimately cached under several different keys at once — a todo detail view caches it as \`["todos", 42]\`, while a list view caches the same todo as one entry inside \`["todos"]\`'s array. Toggling that todo's \`done\` state should ideally update both caches, not just the one the mutation most directly corresponds to.

## Updating a list from a single-item mutation

Building on the toggle mutation from the previous lesson, patching the list cache alongside (or instead of) the detail cache looks like this:

\`\`\`tsx
function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleTodo,
    onSuccess: (updatedTodo: Todo) => {
      // Update the single-item cache, if it exists
      queryClient.setQueryData(["todos", updatedTodo.id], updatedTodo)

      // Update the SAME todo inside the cached list
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
      )
    },
  })
}
\`\`\`

And the reverse direction — a mutation that operates on a single item found *within* a list response, where there's no separate single-item query cached at all, just the list:

\`\`\`tsx
function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      fetch(\`/api/todos/\${id}\`, { method: "DELETE" }),
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((t) => t.id !== deletedId),
      )
      // No separate detail cache to worry about — just drop it from the list
    },
  })
}
\`\`\`

Both directions follow the same principle: the mutation's \`onSuccess\` (or \`onMutate\`, for the optimistic version) knows the shape of every cache it needs to touch and updates each one explicitly, because TanStack Query has no built-in awareness that \`["todos", 42]\` and an entry inside \`["todos"]\` represent "the same" underlying resource — that relationship exists only in your application's data model, so keeping them in sync is your responsibility to encode in the mutation.

## Pattern-matched updates with setQueriesData

Sometimes a single mutation needs to update *every* cached query matching a pattern, not just one specific key — for example, a todo that could be showing up in several differently-filtered list queries at once (\`["todos", { status: "active" }]\`, \`["todos", { status: "all" }]\`), and you don't know in advance exactly which filter variants are currently cached.

\`queryClient.setQueriesData\` is the plural counterpart to \`setQueryData\`: instead of one exact key, it takes a filter (the same kind of partial-key matching \`invalidateQueries\` uses) and applies an updater function to every matching cached query at once.

\`\`\`tsx
function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleTodo,
    onSuccess: (updatedTodo: Todo) => {
      // Matches EVERY cached query whose key starts with "todos" —
      // the plain list, any filtered views, all of them at once
      queryClient.setQueriesData<Todo[]>(
        { queryKey: ["todos"] },
        (old) => old?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
      )
    },
  })
}
\`\`\`

This runs the same updater function against the cached data of every query matching \`{ queryKey: ["todos"] }\` — again a prefix match by default, exactly like \`invalidateQueries\` — rather than requiring you to enumerate \`["todos", { status: "active" }]\`, \`["todos", { status: "done" }]\`, and every other variant by hand. It's the manual-cache-write equivalent of the broad invalidation pattern from Module 5, trading the extra network round-trip for direct, synchronous cache patching across every affected query at once.

## Choosing between these tools

| Situation | Tool |
|---|---|
| One specific cached query needs updating | \`setQueryData(queryKey, updater)\` |
| Several related cached queries (a family sharing a key prefix) all need the same update | \`setQueriesData({ queryKey: [...] }, updater)\` |
| You don't know or don't want to encode exactly what changed — just that this data is now stale | \`invalidateQueries({ queryKey: [...] })\` (Module 5's default) |

None of these are mutually exclusive within a single mutation — a common real pattern is a direct \`setQueryData\` for the primary resource (since you have its exact fresh value from the response), combined with a broader \`invalidateQueries\` for anything else that might be affected in ways you don't want to hand-enumerate, like aggregate counts or derived views elsewhere in the app.

> **Key idea:** The same resource often lives in the cache under multiple keys at once (a detail query and an entry inside a list query) — update each explicitly with \`setQueryData\` when you know the exact keys, or use \`setQueriesData\` with a partial key filter to patch every matching cached query in one call, falling back to a broader \`invalidateQueries\` for anything you'd rather not hand-enumerate.`,
    },
  ],
}
