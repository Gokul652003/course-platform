import type { Module } from "../types"

export const tanstackQueryModule10: Module = {
  id: 10,
  title: "Advanced Patterns & Production Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Custom Hooks & Query Key Factories at Scale",
      minutes: 10,
      intro: "Wrap raw useQuery/useMutation calls in domain-specific custom hooks and organize query keys per-feature so a growing codebase stays maintainable.",
      content: `## The problem with calling \`useQuery\` everywhere

Every example so far has called \`useQuery\` and \`useMutation\` directly inside the component that needs the data, which is exactly right while a codebase is small. As an app grows, though, calling the raw hooks — with their full query key, query function, and options — inside every component that needs "the list of todos" or "create a todo" starts to cause real problems: the same query key has to be retyped correctly everywhere it's used (and Module 4 already covered how easy it is to get that wrong), the same fetch function gets imported and wired up repeatedly, and changing a caching option (say, adjusting \`staleTime\` for todos everywhere) means hunting down every call site.

The fix is the same one you'd reach for in any other part of a React codebase: extract the repeated logic into a custom hook.

## Wrapping \`useQuery\` in a domain hook

\`\`\`tsx
// hooks/useTodos.ts
import { useQuery } from "@tanstack/react-query"
import { fetchTodos } from "../api/todos"

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 30_000,
  })
}
\`\`\`

\`\`\`tsx
// any component that needs todos
function TodoList() {
  const { data: todos, isPending, error } = useTodos()
  // ...
}
\`\`\`

Nothing about \`useQuery\`'s behavior changes — \`useTodos\` is just a thin wrapper — but every consumer now gets the correct query key and \`staleTime\` automatically, with no chance of a typo, and a single place to change caching behavior for todos everywhere at once. This is precisely the same reasoning that leads teams to wrap a raw \`fetch\` call in an API client module rather than repeating URLs and headers throughout a codebase — a custom hook is that same discipline applied to server state.

## Wrapping \`useMutation\` in a domain hook

Mutations benefit even more, since a mutation's \`onSuccess\` invalidation logic (Module 4) is exactly the kind of thing you don't want copy-pasted at every call site:

\`\`\`tsx
// hooks/useCreateTodo.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTodo } from "../api/todos"

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}
\`\`\`

\`\`\`tsx
function NewTodoForm() {
  const { mutate: addTodo, isPending } = useCreateTodo()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      addTodo({ title: "Write more tests" })
    }}>
      <button disabled={isPending}>Add todo</button>
    </form>
  )
}
\`\`\`

Every component that needs to create a todo gets the correct invalidation behavior automatically — nobody creating a new form has to remember that todo creation should invalidate the \`["todos"]\` query, because that logic lives in exactly one place.

## Query key factories

As the number of query keys grows, it helps to centralize how they're built rather than typing array literals inline throughout the codebase. A **query key factory** is just a plain object (or a set of functions) that produces consistent, correctly-shaped keys for a given domain:

\`\`\`tsx
// api/todos/keys.ts
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: { status?: string }) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}
\`\`\`

\`\`\`tsx
function useTodos(filters: { status?: string }) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => fetchTodos(filters),
  })
}

function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => fetchTodo(id),
  })
}

function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // invalidate every todos query — lists AND details — with one call,
      // because they all share the todoKeys.all prefix
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
\`\`\`

This factory pattern directly builds on the prefix-matching invalidation behavior from Module 4: because every key the factory produces starts with \`todoKeys.all\`, invalidating that one prefix reliably catches every todos-related query — every filtered list, every individual detail — without having to enumerate them by hand or risk missing one as new query variants get added later.

## Organizing hooks and keys per feature

In a larger app, the common convention is to colocate a feature's query key factory, fetch functions, and custom hooks together — often in a single \`api/\` or \`features/\` folder per domain — rather than scattering raw \`useQuery\` calls with inline keys throughout components:

\`\`\`
src/
  features/
    todos/
      api.ts       // fetchTodos, createTodo, deleteTodo — plain functions, no TanStack Query
      keys.ts       // todoKeys factory
      hooks.ts      // useTodos, useTodo, useCreateTodo, useDeleteTodo
    users/
      api.ts
      keys.ts
      hooks.ts
\`\`\`

Components then only ever import from \`hooks.ts\` — they never see a raw query key, a raw \`useQuery\` call, or the shape of the underlying fetch function. This mirrors how a well-organized codebase already separates concerns for anything else non-trivial (a data layer, a validation layer): the goal isn't a rule to follow for its own sake, it's making the one true definition of "how do I get todos" and "how do I create a todo" impossible to get wrong by accident.

> **Key idea:** Wrap raw \`useQuery\`/\`useMutation\` calls in small, domain-specific custom hooks (\`useTodos\`, \`useCreateTodo\`) rather than calling the hooks directly in every consuming component, and centralize each domain's query keys in a factory object so that prefix-based invalidation stays correct and consistent as the number of queries grows.`,
    },
    {
      name: "Testing, Devtools & Performance",
      minutes: 10,
      intro: "Test components that use TanStack Query with a fresh QueryClientProvider, inspect the cache live with the Devtools, and avoid unnecessary refetches and re-renders.",
      content: `## Testing components that use TanStack Query

A component that calls \`useQuery\` or \`useMutation\` needs a \`QueryClientProvider\` above it in the tree to work at all — attempting to render such a component in a test without one throws immediately, since the hooks have no client to talk to. The standard pattern is a small test helper that wraps the component under test in its own, fresh \`QueryClientProvider\` for every single test:

\`\`\`tsx
// test-utils.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

export { renderWithClient }
\`\`\`

Two details matter here. First, a **brand-new \`QueryClient\` per test** — reusing one client across multiple tests means cached data from an earlier test can leak into a later one, producing flaky, order-dependent failures that are miserable to debug. Second, **\`retry: false\`** — by default, a failed query retries up to three times with increasing delay (Module 3), which is exactly what you want in production and exactly what you don't want in a test asserting an error state, since it would make that test take several real seconds to resolve for no benefit.

\`\`\`tsx
// TodoList.test.tsx
import { screen, waitFor } from "@testing-library/react"
import { renderWithClient } from "./test-utils"
import { TodoList } from "./TodoList"

test("renders todos once loaded", async () => {
  renderWithClient(<TodoList />)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText("Write more tests")).toBeInTheDocument()
  })
})
\`\`\`

Note the \`await waitFor(...)\` — since \`useQuery\` fetches asynchronously, the test has to wait for the eventual success state rather than asserting on the data synchronously right after rendering, the same way any test involving an async effect would.

## The React Query Devtools

TanStack Query ships an official devtools panel, installed as a separate package and rendered as a component near the root of your app (it's automatically stripped from production builds when used via the framework-specific entry point, so it's safe to leave mounted in development):

\`\`\`bash
npm install @tanstack/react-query-devtools
\`\`\`

\`\`\`tsx
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoList />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
\`\`\`

The devtools panel shows every query currently in the cache, its status (\`fresh\`, \`stale\`, \`fetching\`, \`inactive\`), its data, and lets you manually trigger a refetch or invalidation — genuinely useful for answering exactly the kind of question this course has spent several modules on in the abstract: "why isn't this query refetching," "is this data actually stale right now," "did my invalidation call actually hit the query I expected." Rather than guessing or sprinkling \`console.log\` calls through query functions, the devtools give you a live, inspectable view of the entire cache as it changes.

## Avoiding unnecessary refetches and re-renders

A few concrete habits keep a TanStack Query-heavy app fast as it grows:

**Set a sensible \`staleTime\`.** The library's default \`staleTime\` is \`0\`, meaning every query is considered stale immediately and refetches on every mount and window focus. That default is deliberately conservative (favoring fresh data over fewer requests) but is rarely what you actually want for data that doesn't change every second — Module 4 covered this in depth, and it's worth revisiting here as a performance lever, not just a correctness one: a longer \`staleTime\` directly means fewer network requests.

**Use \`select\` to subscribe to only what you need.** \`useQuery\`'s \`select\` option transforms the cached data before a component receives it, and — importantly — the component only re-renders when the *selected* value changes, not whenever the full underlying query data changes:

\`\`\`tsx
function TodoCount() {
  const { data: count } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    select: (todos) => todos.length,
  })

  // this component re-renders only when the LENGTH changes,
  // not on every change to individual todo items
  return <span>{count} todos</span>
}
\`\`\`

Without \`select\`, a component destructuring the full \`todos\` array would re-render on any change to that array reference, even one irrelevant to what it actually displays. \`select\` narrows the subscription down to exactly the derived value a given component cares about.

**Trust structural sharing.** By default, TanStack Query performs structural sharing between an old and new cache result — if a refetch returns data that's deeply equal to what's already cached, the library keeps the *same* object reference rather than replacing it, so components that depend on that reference (via \`useMemo\`, \`React.memo\`, or the \`select\` behavior above) don't re-render just because a background refetch happened to run. This is on by default and rarely needs to be touched — it's mentioned here so that "a background refetch didn't cause a needless re-render" reads as an intentional feature you can rely on, not a lucky accident.

| Technique | What it reduces |
|---|---|
| Appropriate \`staleTime\` | Number of network requests |
| \`select\` | Number of component re-renders from irrelevant data changes |
| Structural sharing (default, automatic) | Re-renders caused by referentially-new-but-deeply-equal refetch results |

> **Key idea:** Test TanStack Query components by wrapping each test in its own fresh \`QueryClientProvider\` with retries disabled; use the official Devtools to inspect live cache state instead of guessing; and keep a growing app fast with a deliberately chosen \`staleTime\`, \`select\` to narrow what a component actually re-renders on, and TanStack Query's automatic structural sharing to avoid re-renders from referentially-new but unchanged data.`,
    },
    {
      name: "TanStack Query vs Alternatives: An Honest Comparison",
      minutes: 12,
      intro: "An honest, balanced look at TanStack Query against SWR, RTK Query, and plain fetch + useEffect — what it genuinely buys you, what it costs, and when each is the right call.",
      content: `## The comparison table

| | TanStack Query | SWR | RTK Query | \`fetch\` + \`useEffect\` |
|---|---|---|---|---|
| Caching, dedup, background refetch | Yes, extensive configuration | Yes, similar core ideas | Yes, built on the same core ideas | No — you build it yourself |
| Mutations with cache invalidation | \`useMutation\` + \`invalidateQueries\` | Manual, via \`mutate()\` | Built-in, tightly integrated with Redux state | No — entirely manual |
| Framework coupling | React, Vue, Solid, Svelte adapters — same core | React-focused (Next.js team) | Requires Redux Toolkit | None — just React itself |
| Devtools | Official, dedicated panel | Minimal | Redux DevTools (shared with the rest of Redux state) | None |
| Bundle size | Moderate | Smaller — deliberately minimal API surface | Larger — brings Redux Toolkit with it | Zero — no dependency |
| Learning curve | Real — query keys, staleTime, invalidation, a genuine mental model | Smaller — narrower API surface | Steepest if you don't already use Redux | None — but you're building the mental model yourself, badly, over time |

## Against SWR

SWR (also from Vercel, and also usable outside Next.js) solves a very similar core problem — caching, deduplication, revalidation-on-focus — with a deliberately smaller API surface. Its name literally comes from the HTTP caching strategy "stale-while-revalidate," which is close to TanStack Query's own default behavior of showing cached data immediately while refetching in the background.

The honest difference isn't "one is better," it's scope. SWR's API is intentionally minimal — fewer configuration options, fewer built-in concepts — which makes it faster to learn and lighter to ship, but also means things TanStack Query handles natively (a rich mutation API with \`onMutate\`/\`onError\`/\`onSettled\` rollback support, infinite queries as a first-class hook, granular per-query \`gcTime\`) are either thinner in SWR or require more manual wiring. If your app's server-state needs are genuinely simple — mostly \`GET\` requests, occasional revalidation, not much complex mutation choreography — SWR's smaller surface area is a legitimate advantage, not a missing feature. If you're doing the kind of optimistic-update and infinite-scroll work covered in Modules 6 and 8 of this course, TanStack Query's built-in support for those patterns tends to mean less hand-rolled code.

## Against RTK Query

RTK Query ships as part of Redux Toolkit and solves the same fundamental problem — but from inside Redux's state model, generating Redux slices and hooks from an API definition rather than exposing \`useQuery\`/\`useMutation\` as standalone hooks. If a codebase already uses Redux for client state, RTK Query has a real advantage: server state and client state live in the same store, inspectable in the same Redux DevTools, following the same patterns the team already knows.

The honest cost is the coupling itself. Adopting RTK Query for its data-fetching capabilities means adopting Redux Toolkit as a dependency, even for a team that has no other reason to reach for global client-state management — Redux's action/reducer/selector model, learned specifically to get a caching layer, is a heavier lift than it needs to be if Redux isn't already load-bearing elsewhere in the app. TanStack Query, by contrast, has zero opinion about how (or whether) you manage client state at all — it can sit next to Redux, Zustand, plain \`useState\`, or nothing, because it only ever concerns itself with server state.

## Against plain \`fetch\` + \`useEffect\`

This is the comparison worth taking most seriously, because it's not really "TanStack Query vs. a library" — it's "TanStack Query vs. writing the same problem by hand." A one-off \`useEffect\` fetch is genuinely the right tool for a genuinely one-off need:

\`\`\`tsx
function AboutPage() {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/about").then((r) => r.text()).then(setContent)
  }, [])

  return <div>{content}</div>
}
\`\`\`

For a static page fetched once, displayed once, and never invalidated, mutated, refetched, or shared with another component, this is fine — reaching for TanStack Query here would be adding a dependency and a mental model for a problem that doesn't exist yet. The honest trouble starts the moment that "just fetch it once" requirement grows, which in a real app it usually does: now this data needs to be shared with a sibling component (so it gets fetched twice, or lifted into context awkwardly), or refetched after a related mutation elsewhere in the app (so someone adds a manual \`refetchTrigger\` state variable and an effect dependency), or retried on failure (so someone hand-writes a retry loop with backoff), or deduplicated against a second component mounting at the same time (which \`useEffect\` alone has no mechanism for at all). Every one of Module 2 through Module 8 in this course is, in a real sense, a solution to a problem that a hand-rolled \`useEffect\` fetch eventually runs into on its own — TanStack Query didn't invent these requirements, it just built the solutions once instead of leaving every team to rediscover them independently, usually with more bugs the second time.

## Genuine costs of TanStack Query

None of this makes TanStack Query free of tradeoffs:

- **A real dependency and a real mental model.** Query keys, \`staleTime\` vs \`gcTime\`, the cache lifecycle, invalidation semantics — this course spent ten modules on it for a reason. That's a genuine cost for a team that doesn't need most of it.
- **Overkill for a handful of one-off fetches.** A marketing site with three static pages, each fetched once, gains nothing from TanStack Query that a plain \`useEffect\` doesn't already provide, and adopting it there is complexity without payoff.
- **Debugging an unfamiliar cache can be confusing at first.** "Why didn't my component refetch" or "why is this data stale" are common early questions — the Devtools from the previous lesson exist specifically because the cache's behavior, while consistent and well-documented, isn't always obvious from source code alone until the mental model clicks.

## The practical recommendation

**TanStack Query earns its keep when:**
- An app has meaningful **server-state surface area** — multiple components reading the same data, lists that need refetching, mutations that need to invalidate related queries.
- You need **real-time-ish freshness** without hand-rolling polling, refetch-on-focus, or refetch-on-reconnect logic yourself.
- **Optimistic updates, pagination, or infinite scroll** are part of the app — these are exactly the categories where hand-rolled \`useEffect\` code accumulates the most bugs over time.
- The team is willing to invest in the mental model once, in exchange for not re-solving caching and invalidation from scratch in every feature going forward.

**Plain \`fetch\` + \`useEffect\` (or a minimal library like SWR) is genuinely enough when:**
- The app fetches a small, fixed number of things, each **once**, with no sharing, no mutation-driven invalidation, and no retry/dedup requirements.
- It's a prototype, a small internal tool, or a page where "it works" matters more than "it scales to a large team's worth of shared server state."

The honest summary: TanStack Query isn't "the correct way to fetch data in React" as a blanket rule — it's a genuinely well-built solution to the *specific* problems that show up once an app's server-state needs grow past a handful of isolated fetches. The right question isn't "should every app use it," it's "does this app's data have real caching, sharing, or invalidation needs" — and for a growing number of real-world apps, past the prototype stage, the honest answer is yes.

> **Key idea:** TanStack Query, SWR, and RTK Query all solve the same core caching/dedup/refetch problem with different tradeoffs in scope, coupling, and API surface — but the more important comparison is against hand-rolled \`fetch\` + \`useEffect\`, which is genuinely fine for a one-off fetch and genuinely accumulates bugs as soon as sharing, mutation-driven invalidation, retries, or deduplication enter the picture, which is exactly the point at which a dedicated library starts paying for itself.`,
    },
  ],
}
