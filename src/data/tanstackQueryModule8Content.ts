import type { Module } from "../types"

export const tanstackQueryModule8: Module = {
  id: 8,
  title: "Pagination & Infinite Queries",
  status: "upcoming",
  lessons: [
    {
      name: "Paginated Queries",
      minutes: 10,
      intro: "Build a page-number-based paginated query, keep the previous page's data visible while the next page loads, and prefetch the next page for instant navigation.",
      content: `## The naive approach, and where it falls short

The most direct way to paginate with \`useQuery\` is to put the page number directly in the query key:

\`\`\`tsx
function ProjectsPage() {
  const [page, setPage] = useState(1)

  const projectsQuery = useQuery({
    queryKey: ["projects", { page }],
    queryFn: () => fetchProjects(page),
  })

  if (projectsQuery.isPending) return <p>Loading...</p>
  if (projectsQuery.isError) return <p>Failed to load.</p>

  return (
    <div>
      <ul>
        {projectsQuery.data.items.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </div>
  )
}
\`\`\`

This works, and each page gets its own cache entry (\`["projects", { page: 1 }]\`, \`["projects", { page: 2 }]\`, and so on are independent keys). But there's a visible UX problem: because a query key change is treated as a brand-new query, clicking "Next" makes \`projectsQuery.data\` immediately fall back to \`undefined\` (unless that page was already cached from a previous visit) while the new page's request is in flight, and \`isPending\` flips back to \`true\`. The whole list disappears and gets replaced with a loading state, then reappears once the new page arrives — a jarring flash for what should feel like an incremental "next page" action, not a full page reload.

## Keeping old data visible with placeholderData

TanStack Query addresses this directly through the \`placeholderData\` option combined with the \`keepPreviousData\` helper it exports:

\`\`\`tsx
import { useQuery, keepPreviousData } from "@tanstack/react-query"

function ProjectsPage() {
  const [page, setPage] = useState(1)

  const projectsQuery = useQuery({
    queryKey: ["projects", { page }],
    queryFn: () => fetchProjects(page),
    placeholderData: keepPreviousData,
  })

  return (
    <div style={{ opacity: projectsQuery.isPlaceholderData ? 0.5 : 1 }}>
      <ul>
        {projectsQuery.data?.items.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        Previous
      </button>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={projectsQuery.isPlaceholderData || !projectsQuery.data?.hasMore}
      >
        Next
      </button>
    </div>
  )
}
\`\`\`

With \`placeholderData: keepPreviousData\` set, when the query key changes (page goes from 1 to 2), TanStack Query doesn't clear \`data\` to \`undefined\` while the new page fetches — it keeps showing the *previous* page's data as a placeholder, and exposes \`isPlaceholderData: true\` so you can visually indicate "this is stale, a fresh version is loading" (the dimmed opacity above is a common, simple treatment). Once page 2's real data arrives, \`data\` updates to the new page's items and \`isPlaceholderData\` flips back to \`false\`. The list never disappears — it just visually settles once the new page lands.

Disabling the "Next" button while \`isPlaceholderData\` is \`true\` is a deliberate detail worth keeping: it stops a user from rapid-fire clicking through pages faster than requests can resolve, which would otherwise queue up a burst of requests for pages the user may not even end up looking at.

## Prefetching the next page

\`placeholderData\` smooths the *visual* transition, but the new page's data still has to actually be fetched from the network the first time its page number is visited — there's still a loading window, just a less jarring one. You can eliminate that window entirely for the common case (a user paging forward sequentially) by prefetching the next page as soon as the current one renders, using \`queryClient.prefetchQuery\`:

\`\`\`tsx
function ProjectsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const projectsQuery = useQuery({
    queryKey: ["projects", { page }],
    queryFn: () => fetchProjects(page),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (projectsQuery.data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["projects", { page: page + 1 }],
        queryFn: () => fetchProjects(page + 1),
      })
    }
  }, [page, projectsQuery.data?.hasMore, queryClient])

  // ...render as before
}
\`\`\`

\`prefetchQuery\` fires the query function and populates the cache for that key, but — critically — it doesn't cause any re-render or subscribe any component to that query; it's a fire-and-forget cache warm-up. By the time the user actually clicks "Next," the query for \`{ page: page + 1 }\` is very likely already sitting in the cache, so the subsequent \`useQuery\` call for that key resolves instantly from cache instead of triggering a fresh network round trip. \`prefetchQuery\` respects \`staleTime\` the same way a normal query does — if a matching cache entry already exists and is still fresh, it does nothing, so calling it repeatedly as the user re-renders is cheap and safe.

## Why page number belongs in the query key, not component state alone

It's worth being explicit about why \`page\` is included inside \`queryKey\` at all, rather than just closing over the \`page\` state variable inside \`queryFn\`. TanStack Query's caching is entirely keyed off \`queryKey\` — each distinct key is tracked, cached, and invalidated independently. Including \`page\` in the key is what makes "page 1" and "page 2" genuinely separate cache entries: navigating back to page 1 after visiting page 2 can serve instantly from cache (subject to \`staleTime\`) instead of re-fetching, and invalidating \`["projects"]\` (the whole family, via a partial key match) invalidates every page at once, while invalidating \`["projects", { page: 2 }]\` specifically invalidates only that one page.

> **Key idea:** Put the page number inside \`queryKey\` so each page is its own cache entry, use \`placeholderData: keepPreviousData\` to keep the current page's data visible (flagged via \`isPlaceholderData\`) while the next page's request is in flight instead of flashing a loading state, and use \`queryClient.prefetchQuery\` to warm the cache for the likely-next page ahead of time so the "Next" click feels instant.`,
    },
    {
      name: "useInfiniteQuery Fundamentals",
      minutes: 11,
      intro: "Learn the data.pages shape, getNextPageParam/initialPageParam, and fetchNextPage for building a classic infinite list.",
      content: `## Why infinite queries are a different shape from paginated ones

The previous lesson's paginated pattern replaces one page's data with the next — page 2 doesn't append to page 1, it *is* the new \`data\`. Infinite lists work differently: scrolling further down an infinite feed should keep everything already loaded on screen and *append* the next batch underneath it. That's a meaningfully different caching and data-accumulation problem, and \`useQuery\` alone isn't built for it — TanStack Query provides a dedicated hook, \`useInfiniteQuery\`, specifically for this shape.

## The core options: initialPageParam and getNextPageParam

\`useInfiniteQuery\` looks similar to \`useQuery\` at first glance, but requires two additional pieces of configuration that describe how to move from one page to the next:

\`\`\`tsx
import { useInfiniteQuery } from "@tanstack/react-query"

function fetchProjectsPage({ pageParam }: { pageParam: number }) {
  return fetch(\`/api/projects?cursor=\${pageParam}\`).then((res) => res.json())
  // -> { items: Project[], nextCursor: number | null }
}

function InfiniteProjectList() {
  const query = useInfiniteQuery({
    queryKey: ["projects", "infinite"],
    queryFn: fetchProjectsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  // ...
}
\`\`\`

- **\`initialPageParam\`** — the \`pageParam\` value used for the very first page's request. Here it's \`0\`, a starting cursor, but it could just as well be \`1\` for a page-number-based API, or \`null\` for a cursor-based API where "no cursor yet" means "start from the beginning."
- **\`getNextPageParam\`** — a function TanStack Query calls after every successful page fetch, receiving the page that just arrived (plus the full accumulated pages array as later arguments), and returning the \`pageParam\` value to use for the *next* page — or \`undefined\` to signal that there is no next page. Here, the API itself returns a \`nextCursor\` in its response, and that value is threaded straight through as next page's param, and eventually becomes \`null\` once the API reports no more pages exist — that \`null\` is what tells TanStack Query to stop.

## The shape of the returned data

Unlike \`useQuery\`, where \`data\` is exactly whatever \`queryFn\` resolved to, \`useInfiniteQuery\`'s \`data\` is a structured object holding *all* fetched pages plus the param used for each one:

\`\`\`tsx
console.log(query.data)
// {
//   pages: [
//     { items: [...], nextCursor: 20 },   // page fetched with pageParam: 0
//     { items: [...], nextCursor: 40 },   // page fetched with pageParam: 20
//   ],
//   pageParams: [0, 20],
// }
\`\`\`

\`data.pages\` is an array where each entry is one page's raw \`queryFn\` result, in the order they were fetched. \`data.pageParams\` is the parallel array of \`pageParam\` values that produced each page — useful mainly for advanced cases (like manually invalidating or refetching a specific page), less often needed for simple rendering. For rendering a flat list, you typically flatten \`pages\` with \`.flatMap\`:

\`\`\`tsx
function InfiniteProjectList() {
  const query = useInfiniteQuery({
    queryKey: ["projects", "infinite"],
    queryFn: fetchProjectsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p>Failed to load.</p>

  const allItems = query.data.pages.flatMap((page) => page.items)

  return (
    <ul>
      {allItems.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

## Fetching the next page

\`useInfiniteQuery\` returns a \`fetchNextPage\` function alongside the usual query state, plus two booleans that describe whether there's more to fetch and whether a fetch for the next page is currently underway:

\`\`\`tsx
function InfiniteProjectList() {
  const query = useInfiniteQuery({
    queryKey: ["projects", "infinite"],
    queryFn: fetchProjectsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p>Failed to load.</p>

  const allItems = query.data.pages.flatMap((page) => page.items)

  return (
    <div>
      <ul>
        {allItems.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
      <button
        onClick={() => query.fetchNextPage()}
        disabled={!query.hasNextPage || query.isFetchingNextPage}
      >
        {query.isFetchingNextPage ? "Loading more..." : "Load more"}
      </button>
    </div>
  )
}
\`\`\`

- **\`hasNextPage\`** — \`true\` as long as the most recent call to \`getNextPageParam\` returned a defined value (not \`undefined\`). Once it returns \`undefined\` (the API signaled there's no more data), \`hasNextPage\` becomes \`false\` and stays \`false\` for that query.
- **\`isFetchingNextPage\`** — \`true\` specifically while a *next-page* fetch (triggered by \`fetchNextPage()\`) is in flight — distinct from the general \`isFetching\` flag, which would also be \`true\` during a background refetch of already-loaded pages. This distinction matters for the UI: you want the "Load more" button to show a loading state only for an actual next-page fetch, not for an unrelated background refetch happening elsewhere.

Calling \`fetchNextPage()\` while \`hasNextPage\` is \`false\`, or while another \`fetchNextPage()\` call is already in flight, is a no-op by default — TanStack Query guards against duplicate or out-of-range requests internally, which is part of why disabling the button on those conditions is a UX nicety rather than a correctness requirement, though it's still good practice to disable it so users get clear feedback.

> **Key idea:** \`useInfiniteQuery\` accumulates pages into \`data.pages\` (an array, flattened for rendering with \`.flatMap\`) rather than replacing one page with the next; \`getNextPageParam\` tells TanStack Query how to compute the next page's param from the last page fetched (returning \`undefined\` to signal the end), and \`fetchNextPage()\` plus the \`hasNextPage\`/\`isFetchingNextPage\` flags drive a "Load more" (or infinite scroll) interaction.`,
    },
    {
      name: "Infinite Scroll & Bidirectional Pagination",
      minutes: 10,
      intro: "Trigger fetchNextPage automatically from scroll position with IntersectionObserver, and support loading older pages with getPreviousPageParam for chat-style UIs.",
      content: `## From a button to automatic infinite scroll

The previous lesson's "Load more" button calls \`fetchNextPage()\` on a click — a perfectly reasonable UI, and often the right choice (it gives users explicit control and is trivially accessible). True infinite scroll just swaps the trigger: instead of a click, \`fetchNextPage()\` fires automatically when the user scrolls near the bottom of the list. The most robust, performant way to detect that in a modern browser is the \`IntersectionObserver\` API, watching a small sentinel element placed at the end of the list.

\`\`\`tsx
function InfiniteProjectList() {
  const query = useInfiniteQuery({
    queryKey: ["projects", "infinite"],
    queryFn: fetchProjectsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p>Failed to load.</p>

  const allItems = query.data.pages.flatMap((page) => page.items)

  return (
    <div>
      <ul>
        {allItems.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
      <div ref={loadMoreRef} style={{ height: 1 }} />
      {query.isFetchingNextPage && <p>Loading more...</p>}
    </div>
  )
}
\`\`\`

A few details worth calling out:

- **\`rootMargin: "200px"\`** tells the observer to consider the sentinel "intersecting" once it's within 200px of entering the viewport, not only once it's literally visible — this starts the fetch a little early, so the next batch of items is often ready before the user actually scrolls all the way to the bottom, avoiding a visible pause.
- The guard \`query.hasNextPage && !query.isFetchingNextPage\` inside the observer callback is what prevents duplicate calls to \`fetchNextPage()\` — the sentinel can fire its intersection callback more than once while it stays near the viewport edge, and without this guard you'd fire multiple redundant fetches for the same next page.
- The empty 1px sentinel \`<div>\` exists purely to give \`IntersectionObserver\` something to watch; it renders nothing visible.

This pattern composes with everything from the previous lesson unchanged — \`hasNextPage\`, \`isFetchingNextPage\`, and \`data.pages\` all mean exactly the same thing here as with a manual button; only the *trigger* for calling \`fetchNextPage()\` changed, from a click handler to an observer callback.

## Bidirectional pagination: loading older items too

Some UIs — a chat thread being the classic example — need to paginate in the *other* direction: the initial load shows the most recent messages, and scrolling up should load progressively older ones, prepended above what's already shown. \`useInfiniteQuery\` supports this natively with a parallel set of "previous page" options: \`getPreviousPageParam\`, \`fetchPreviousPage\`, \`hasPreviousPage\`, and \`isFetchingPreviousPage\` — each the mirror image of its "next page" counterpart.

\`\`\`tsx
function fetchMessagesPage({ pageParam }: { pageParam: string | null }) {
  return fetch(\`/api/messages?cursor=\${pageParam ?? ""}\`).then((res) => res.json())
  // -> { messages: Message[], nextCursor: string | null, previousCursor: string | null }
}

function ChatThread() {
  const query = useInfiniteQuery({
    queryKey: ["messages"],
    queryFn: fetchMessagesPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.previousCursor,
  })

  if (query.isPending) return <p>Loading messages...</p>
  if (query.isError) return <p>Failed to load messages.</p>

  const allMessages = query.data.pages.flatMap((page) => page.messages)

  return (
    <div>
      <button
        onClick={() => query.fetchPreviousPage()}
        disabled={!query.hasPreviousPage || query.isFetchingPreviousPage}
      >
        {query.isFetchingPreviousPage ? "Loading older messages..." : "Load older messages"}
      </button>

      <ul>
        {allMessages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

The key difference from \`getNextPageParam\`: **\`getPreviousPageParam\` receives the *first* page in \`data.pages\`** (the oldest one currently loaded), not the last, since "load previous" means extending the list backward from whatever is currently the earliest-loaded content. When \`fetchPreviousPage()\` resolves, TanStack Query prepends the new page to the front of \`data.pages\` — so \`data.pages.flatMap(...)\` above naturally ends up with older messages first, newest last, exactly matching the order they were requested in, without any manual array-reordering on your part.

Both directions can be enabled on the same query simultaneously — nothing stops a feed from supporting "load more below" and "load older above" at once; each direction is tracked with its own independent set of flags (\`hasNextPage\`/\`isFetchingNextPage\` versus \`hasPreviousPage\`/\`isFetchingPreviousPage\`), so wiring an \`IntersectionObserver\` sentinel at both the top and bottom of the list, each calling its respective fetch function, is a legitimate way to build a fully bidirectional infinite-scrolling thread.

> **Key idea:** Swap a manual "Load more" button for an \`IntersectionObserver\`-watched sentinel element to get automatic infinite scroll, guarding the observer callback with \`hasNextPage && !isFetchingNextPage\` to avoid duplicate fetches; for chat-style UIs needing to load older content too, \`getPreviousPageParam\` (reading the *first* loaded page) plus \`fetchPreviousPage\`/\`hasPreviousPage\`/\`isFetchingPreviousPage\` provide a fully independent, symmetric "load backward" direction that prepends onto \`data.pages\`.`,
    },
  ],
}
