import type { Module } from "../types"

export const tanstackQueryModule5: Module = {
  id: 5,
  title: "Mutations with useMutation",
  status: "upcoming",
  lessons: [
    {
      name: "Your First Mutation",
      minutes: 10,
      intro: "Learn why writes get their own hook, wire up useMutation with a mutationFn, and see the difference between mutate and mutateAsync.",
      content: `## Reads and writes are different problems

Everything covered so far — \`useQuery\`, query keys, caching, refetching — is about *reading* data: fetching something and keeping a cached copy fresh. A **mutation** is different in kind, not just in name. Creating a todo, updating a user's profile, deleting a comment — these are one-off, user-triggered writes. They don't need a cache key, they don't get refetched on window focus, and they don't have a "stale" concept, because there's nothing to keep fresh: a mutation runs once, when you tell it to.

TanStack Query gives writes their own hook, \`useMutation\`, specifically because a write has a fundamentally different lifecycle than a read: a query runs automatically (on mount, on window focus, on interval) and TanStack Query decides when. A mutation only ever runs when *you* call it — a button click, a form submit — and never runs on its own.

## The useMutation hook shape

\`useMutation\` takes an options object whose one required field is \`mutationFn\`: an async function that performs the actual write and returns the result.

\`\`\`tsx
import { useMutation } from "@tanstack/react-query"

interface NewTodo {
  title: string
}

interface Todo {
  id: number
  title: string
  done: boolean
}

async function createTodo(newTodo: NewTodo): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  })
  if (!res.ok) throw new Error("Failed to create todo")
  return res.json()
}

function AddTodoForm() {
  const mutation = useMutation({
    mutationFn: createTodo,
  })

  return (
    <button onClick={() => mutation.mutate({ title: "Learn TanStack Query" })}>
      {mutation.isPending ? "Saving…" : "Add Todo"}
    </button>
  )
}
\`\`\`

Notice the shape mirrors \`useQuery\` deliberately: both hooks return an object with status flags and data, and both take a function that does the actual async work. The difference is *when* that function runs. \`useQuery\`'s \`queryFn\` runs as soon as the component mounts (assuming \`enabled\` isn't \`false\`); \`useMutation\`'s \`mutationFn\` sits idle until you explicitly call \`mutation.mutate(...)\`.

## mutate vs mutateAsync

\`useMutation\` gives you two ways to actually trigger the mutation, and they're not interchangeable — they suit different call sites.

\`\`\`tsx
// mutate: fire-and-forget, use callbacks for the result
mutation.mutate(
  { title: "Buy milk" },
  {
    onSuccess: (data) => console.log("Created:", data),
    onError: (error) => console.error("Failed:", error),
  },
)

// mutateAsync: returns a promise, use await/try-catch
async function handleSubmit() {
  try {
    const todo = await mutation.mutateAsync({ title: "Buy milk" })
    console.log("Created:", todo)
  } catch (error) {
    console.error("Failed:", error)
  }
}
\`\`\`

| | \`mutate()\` | \`mutateAsync()\` |
|---|---|---|
| Return value | \`void\` — nothing to await | A \`Promise\` that resolves with the mutation's data |
| Errors | Never throws — surfaced via \`onError\` / \`mutation.error\` | Throws (rejects) — must be caught with \`try/catch\` |
| Best for | JSX event handlers (\`onClick={() => mutation.mutate(...)}\`) where you just want the hook's own state (\`isPending\`, \`isError\`) to drive the UI | Code that needs to *sequence* several async steps — awaiting one mutation before starting the next, or awaiting inside a larger async form-submit handler |

A common mistake is using \`mutateAsync\` inside a plain \`onClick\` without a \`try/catch\` — since it rejects on failure, an uncaught rejection there will surface as an unhandled promise rejection rather than being caught by the hook's own error state. If you don't need to \`await\` the result or chain further logic after it resolves, \`mutate\` is simpler and safer by default.

## Status flags: isPending, isError, isSuccess, isIdle

A mutation, like a query, tracks its own lifecycle through boolean flags on the object \`useMutation\` returns:

\`\`\`tsx
function AddTodoForm() {
  const mutation = useMutation({ mutationFn: createTodo })

  if (mutation.isIdle) {
    return <p>Ready to add a todo.</p>
  }

  return (
    <div>
      <button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ title: "Learn TanStack Query" })}
      >
        {mutation.isPending ? "Saving…" : "Add Todo"}
      </button>

      {mutation.isError && <p role="alert">Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Added "{mutation.data.title}"!</p>}
    </div>
  )
}
\`\`\`

| Flag | True when |
|---|---|
| \`isIdle\` | \`mutate\`/\`mutateAsync\` hasn't been called yet (or the mutation was reset) |
| \`isPending\` | The mutation function is currently running |
| \`isSuccess\` | The mutation function resolved successfully — \`mutation.data\` holds the result |
| \`isError\` | The mutation function threw/rejected — \`mutation.error\` holds the error |

Unlike a query, a mutation's status doesn't reset itself automatically after success or error — it stays \`isSuccess\` or \`isError\` until you call \`mutate\` again (which flips it back to \`isPending\`) or explicitly call \`mutation.reset()\` to return it to \`isIdle\`. This matters for UI like a "Saved!" confirmation message that should disappear once the user starts editing again — you'd call \`mutation.reset()\` on the input's \`onChange\`, for instance.

## A complete, realistic example

\`\`\`tsx
function AddTodoForm() {
  const [title, setTitle] = useState("")
  const mutation = useMutation({ mutationFn: createTodo })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(
      { title },
      { onSuccess: () => setTitle("") },
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" disabled={mutation.isPending || !title}>
        {mutation.isPending ? "Adding…" : "Add"}
      </button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </form>
  )
}
\`\`\`

This is the shape you'll write repeatedly: a hook call up top, a trigger tied to a user action, and the returned status flags driving disabled states and feedback messages — no \`useState\` needed to track "is this saving" or "did this fail" by hand.

> **Key idea:** \`useMutation\` is for one-off, user-triggered writes and never runs on its own — call \`mutate\` for fire-and-forget writes driven by the hook's own \`isPending\`/\`isError\`/\`isSuccess\` flags, or \`mutateAsync\` when you need to \`await\` the result inside a larger async flow and handle rejection with \`try/catch\`.`,
    },
    {
      name: "Invalidating Queries After a Mutation",
      minutes: 9,
      intro: "Use queryClient.invalidateQueries inside a mutation's onSuccess to refetch affected data automatically, and understand exact vs partial key matching.",
      content: `## The problem a successful mutation leaves behind

Say a user adds a new todo through the form from the previous lesson. The \`POST\` request succeeds, \`mutation.isSuccess\` flips to \`true\` — but the todo list rendered elsewhere on the page, backed by \`useQuery({ queryKey: ["todos"] })\`, has no idea anything changed. It's still showing its cached data from before the mutation ran. The mutation and the query are two completely separate hook calls with no automatic link between them.

TanStack Query's answer to this is deliberately simple: **don't try to manually patch the cache to reflect the write — just tell the affected queries they're stale, and let the existing refetch machinery do its job.** That's what \`queryClient.invalidateQueries\` is for.

## Invalidating in onSuccess

The standard pattern is to invalidate inside the mutation's \`onSuccess\` callback:

\`\`\`tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"

function AddTodoForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  // ...
}
\`\`\`

\`useQueryClient()\` gives you a handle to the same \`QueryClient\` instance provided at the app root by \`QueryClientProvider\` — it's how a mutation, which has no query key of its own, reaches into the shared cache and marks other queries as stale. Once \`invalidateQueries\` runs, any currently-mounted query matching \`["todos"]\` is marked stale and, if it's actively being observed by a mounted component, refetched immediately. The todo list component doesn't need to know a mutation happened at all — it just receives fresh data because its query was invalidated, the same as if the window had regained focus.

## Exact match vs partial (prefix) match

The key passed to \`invalidateQueries\` doesn't have to exactly match a query's key — by default, TanStack Query treats it as a **prefix**, invalidating every cached query whose key starts with the given array.

\`\`\`tsx
// Cached queries in the app:
// ["todos"]
// ["todos", { status: "active" }]
// ["todos", { status: "done" }]
// ["todos", 42]  (a single todo's detail query)

queryClient.invalidateQueries({ queryKey: ["todos"] })
// Invalidates ALL four — every key that starts with "todos"
\`\`\`

This is usually exactly what you want after a generic write: adding a todo could affect the plain list, any filtered view of it, and potentially even todo counts elsewhere — invalidating broadly by the shared \`"todos"\` prefix catches all of it without you having to enumerate every affected key by hand. This is also the practical payoff of the query key structuring conventions from Module 2 — a consistent \`["todos", ...]\` prefix scheme is what makes a single broad invalidation call reliably catch every related query.

If you need an **exact** match instead — invalidating only the precise key and nothing broader — pass \`exact: true\`:

\`\`\`tsx
queryClient.invalidateQueries({ queryKey: ["todos", 42], exact: true })
// Invalidates ONLY ["todos", 42], leaves ["todos"] and ["todos", { status: "active" }] alone
\`\`\`

| Call | Matches |
|---|---|
| \`invalidateQueries({ queryKey: ["todos"] })\` | Every query whose key starts with \`"todos"\` (default: prefix match) |
| \`invalidateQueries({ queryKey: ["todos", 42] })\` | Every query whose key starts with \`["todos", 42]\` — e.g. also \`["todos", 42, "comments"]\` if that existed |
| \`invalidateQueries({ queryKey: ["todos", 42], exact: true })\` | Only the exact key \`["todos", 42]\`, nothing broader or narrower |

## Why invalidation, not manual state syncing

It's tempting, especially coming from manual \`useState\`/\`useEffect\` data-fetching code, to reach for \`setTodos(prev => [...prev, newTodo])\` style local-state patching after a successful write. TanStack Query intentionally steers you away from that as the default:

- **A single source of truth.** The query cache is already the one place this data lives. Manually patching local state alongside it creates two copies that can drift apart — especially once several components independently fetch and display the same data.
- **Correctness over optimization.** Invalidation always refetches from the server, so what you see is guaranteed to reflect reality (any server-side computed fields, defaults, or side effects the write triggered) rather than your best guess at what the new state should look like.
- **It composes for free.** Every currently-mounted query matching the invalidated key refetches — including ones in completely unrelated components you didn't even think about when writing the mutation. A manual state update would need to know about every one of those call sites individually.

The tradeoff is an extra network round-trip that a manual cache patch could avoid. That tradeoff is exactly what the next module — optimistic updates and direct cache writes — exists to address, once you've outgrown the simplicity of "just invalidate" for a specific interaction that needs to feel instant. But invalidation remains the correct *default*: reach for a manual cache write only when you've identified a specific spot where the extra round-trip is a real, felt problem.

> **Key idea:** After a successful mutation, call \`queryClient.invalidateQueries({ queryKey: [...] })\` (usually in \`onSuccess\`) rather than hand-patching local state — by default this is a prefix match that catches every related cached query, and it's the simplest way to keep the UI honest because it always refetches the real server state rather than guessing at it.`,
    },
    {
      name: "Mutation Side Effects & Lifecycle Callbacks",
      minutes: 10,
      intro: "Understand the full onMutate/onError/onSuccess/onSettled callback set, the order they run in, and hook-level vs call-level callbacks.",
      content: `## Four callbacks, one lifecycle

\`useMutation\` exposes four lifecycle callbacks that fire at different points around the mutation function's execution. Used together, they're the foundation of every advanced mutation pattern — optimistic updates included, which the next module builds directly on top of these:

\`\`\`tsx
useMutation({
  mutationFn: createTodo,
  onMutate: (variables) => {
    console.log("About to run mutationFn with:", variables)
  },
  onError: (error, variables, context) => {
    console.log("mutationFn threw:", error)
  },
  onSuccess: (data, variables, context) => {
    console.log("mutationFn resolved with:", data)
  },
  onSettled: (data, error, variables, context) => {
    console.log("mutationFn finished, either way")
  },
})
\`\`\`

## The firing order

For a **successful** mutation, the order is: \`onMutate\` → \`mutationFn\` runs → \`onSuccess\` → \`onSettled\`.

For a **failed** mutation, the order is: \`onMutate\` → \`mutationFn\` runs and throws → \`onError\` → \`onSettled\`.

\`\`\`text
mutate(variables) called
      │
      ▼
  onMutate(variables)   ← runs BEFORE mutationFn, synchronously first
      │
      ▼
  mutationFn(variables)  ← the actual async work (the network request)
      │
   ┌──┴──┐
 success  failure
   │        │
   ▼        ▼
onSuccess  onError
   │        │
   └────┬───┘
        ▼
    onSettled   ← ALWAYS runs last, success or failure
\`\`\`

\`onMutate\` is the odd one out — it's the only callback that runs *before* \`mutationFn\`, not after. That timing is exactly why it exists: it's your hook to do something in response to the mutation starting, before you know whether it will succeed. The next module uses this specifically to snapshot and optimistically update the cache right as the mutation kicks off. \`onSettled\` is the mirror image — it always runs last regardless of outcome, making it the natural place for cleanup that should happen either way, like re-enabling a form or invalidating a query whether the write succeeded or failed (useful when even a failed write might have partially applied server-side).

## Hook-level callbacks vs call-level callbacks

Every one of these four callbacks can be defined in two places: on the \`useMutation\` options object itself (**hook-level**, defined once) or passed as a second argument to \`mutate\`/\`mutateAsync\` (**call-level**, defined per invocation):

\`\`\`tsx
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    // hook-level: runs on every successful call, everywhere this mutation object is used
    queryClient.invalidateQueries({ queryKey: ["todos"] })
  },
})

function handleAdd() {
  mutation.mutate(
    { title: "Buy milk" },
    {
      onSuccess: () => {
        // call-level: runs ONLY for this specific mutate() call
        toast.success("Todo added!")
      },
    },
  )
}
\`\`\`

Both fire — TanStack Query calls the hook-level callback first, then the call-level one. This split is deliberate: the hook-level \`onSuccess\` is the right place for behavior that should happen *every single time this mutation succeeds, no matter where it's triggered from* (like cache invalidation — the data being stale is true regardless of which button triggered the write). The call-level \`onSuccess\` is the right place for behavior specific to *this one call site* (like showing a toast, resetting a specific form's local state, or navigating away) — logic that doesn't belong baked into the reusable mutation definition itself, especially if the same \`useMutation\` call is reused across several different UI locations with different desired follow-up behavior.

## Reading variables inside callbacks

Every callback receives the \`variables\` that were passed to \`mutate\`/\`mutateAsync\`, which is useful when the callback needs to know *what* was being mutated, not just whether it succeeded:

\`\`\`tsx
const mutation = useMutation({
  mutationFn: deleteTodo,
  onSuccess: (data, variables) => {
    // variables here is whatever was passed to mutate(...) — e.g. the todo's id
    console.log(\`Todo \${variables.id} was deleted\`)
    queryClient.invalidateQueries({ queryKey: ["todos"] })
    queryClient.removeQueries({ queryKey: ["todos", variables.id] })
  },
})

mutation.mutate({ id: 42 })
\`\`\`

The argument order differs slightly per callback, worth having on hand: \`onMutate(variables)\`, \`onError(error, variables, context)\`, \`onSuccess(data, variables, context)\`, \`onSettled(data, error, variables, context)\`. The \`context\` argument is whatever value \`onMutate\` returned — the mechanism the next module uses to pass a cache snapshot from \`onMutate\` through to \`onError\`'s rollback logic.

> **Key idea:** \`onMutate\` runs before \`mutationFn\`; \`onSuccess\`/\`onError\` run after, depending on outcome; \`onSettled\` always runs last either way — define hook-level callbacks for behavior that should happen on every call (like invalidation) and call-level callbacks for behavior specific to one call site (like a toast or a form reset), and both run together when both are provided.`,
    },
  ],
}
