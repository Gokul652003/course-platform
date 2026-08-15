import type { Module } from "../types"

export const nextjsModule2: Module = {
  id: 2,
  title: "Routing with the App Router",
  status: "upcoming",
  lessons: [
    {
      name: "File-Based Routing Basics",
      minutes: 9,
      intro: "Folders become URL segments — the core idea behind every route in the App Router.",
      content: `### Folders map directly to URL paths

\`\`\`
app/
  page.tsx              -> /
  about/
    page.tsx             -> /about
  blog/
    page.tsx              -> /blog
    first-post/
      page.tsx             -> /blog/first-post
\`\`\`

Each nested folder inside \`app/\` adds a segment to the URL. There's no route configuration file listing paths anywhere — the folder structure *is* the route table.

### Linking between pages

\`\`\`tsx
import Link from "next/link"

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  )
}
\`\`\`

Always use \`next/link\`'s \`<Link>\` for internal navigation instead of a plain \`<a>\` tag. A plain \`<a>\` triggers a full page reload; \`<Link>\` performs client-side navigation — faster, and it preserves client-side state that a full reload would wipe out. It also automatically prefetches the linked page's code in the background when the link scrolls into view, so the click itself feels instant.

### Programmatic navigation

\`\`\`tsx
"use client"

import { useRouter } from "next/navigation"

export function LoginButton() {
  const router = useRouter()

  function handleLogin() {
    // ...perform login...
    router.push("/dashboard")
  }

  return <button onClick={handleLogin}>Log in</button>
}
\`\`\`

\`useRouter\` (imported from \`next/navigation\`, not the older \`next/router\`) gives you \`push\`, \`replace\`, \`back\`, and \`refresh\` for navigating from inside event handlers — necessary when navigation needs to happen as a *result* of some logic, rather than a user clicking a link directly.

### 404s: not-found.tsx

\`\`\`tsx
// app/not-found.tsx
export default function NotFound() {
  return <h1>404 — Page not found</h1>
}
\`\`\`

Automatically shown whenever a visited URL doesn't match any route, or when you explicitly call the \`notFound()\` function from a page (useful for "this specific blog post ID doesn't exist," even though \`/blog/[slug]\` as a route pattern is otherwise valid).

> **Key idea:** the folder structure inside \`app/\` *is* your route table — no separate routing configuration exists to keep in sync with it. \`<Link>\` is the default way to navigate; reach for \`useRouter\` only when navigation needs to happen from code, not a direct click.`,
    },
    {
      name: "Layouts & Nested Routes",
      minutes: 9,
      intro: "Sharing UI across multiple pages without repeating it in every one.",
      content: `### A layout per segment

\`\`\`
app/
  layout.tsx           <- wraps EVERY page in the app
  dashboard/
    layout.tsx          <- wraps every page under /dashboard
    page.tsx              -> /dashboard
    settings/
      page.tsx             -> /dashboard/settings
\`\`\`

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside>Dashboard Sidebar</aside>
      <main>{children}</main>
    </div>
  )
}
\`\`\`

Both \`/dashboard\` and \`/dashboard/settings\` render inside this layout — the sidebar persists across navigation between them, since only \`{children}\` re-renders, not the whole layout.

### Layouts nest

Navigating from \`/dashboard\` to \`/dashboard/settings\` re-renders the root layout → the dashboard layout → the settings page, each nesting inside the one before it — but crucially, a layout **does not re-mount** when navigating between its own child routes. This is a real, meaningful performance/UX win: component state inside a layout (a sidebar's scroll position, an open dropdown) survives navigation between its children.

### Layouts cannot access the current route's params directly for query strings

\`\`\`tsx
// app/blog/[slug]/layout.tsx
export default function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  return <div>{children}</div>
}
\`\`\`

Layouts *do* receive dynamic route \`params\` (covered next lesson), but they never receive \`searchParams\` — because a layout persists across sibling routes that might each have different query strings, giving it access would make its rendering ambiguous. If you need query string data, read it in the \`page.tsx\`, not the layout.

### Templates: like layouts, but they DO remount

\`\`\`tsx
// app/dashboard/template.tsx
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="fade-in">{children}</div>
}
\`\`\`

A \`template.tsx\` looks identical to a layout but creates a **new instance on every navigation** — useful for the rare case where you specifically want an enter/exit animation or a \`useEffect\` to re-run on every page visit within that segment, which a persistent layout wouldn't give you.

> **Key idea:** layouts persist across navigations within their segment (state survives), while templates remount on every navigation. Reach for a layout by default — templates solve a narrower, specific problem.`,
    },
    {
      name: "Dynamic Routes",
      minutes: 9,
      intro: "Routes driven by data — a single file handling any number of URLs.",
      content: `### Square brackets create a dynamic segment

\`\`\`
app/
  blog/
    [slug]/
      page.tsx     -> /blog/anything-here, /blog/another-post, etc.
\`\`\`

\`\`\`tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <h1>Reading: {slug}</h1>
}
\`\`\`

Whatever appears in that URL segment is available as \`params.slug\` — visiting \`/blog/hello-world\` renders this same component with \`slug\` equal to \`"hello-world"\`.

### Catch-all segments

\`\`\`
app/
  docs/
    [...slug]/
      page.tsx     -> /docs/a, /docs/a/b, /docs/a/b/c, all match
\`\`\`

\`\`\`tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params  // e.g. ["a", "b", "c"]
  return <h1>Docs path: {slug.join("/")}</h1>
}
\`\`\`

\`[...slug]\` (three dots) matches one *or more* segments, delivered as an array — useful for nested documentation trees or any URL structure with variable depth.

\`\`\`
app/
  shop/
    [[...filters]]/
      page.tsx     -> matches /shop AND /shop/category/color, etc.
\`\`\`

Doubling the brackets (\`[[...filters]]\`) makes the catch-all **optional** — it also matches the base route with no extra segments at all, which plain \`[...slug]\` would not.

### Generating static params ahead of time

\`\`\`tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}
\`\`\`

For content that's known ahead of time (blog posts, product pages), \`generateStaticParams\` tells Next.js which specific dynamic routes to pre-render at build time — turning a dynamic route into a set of genuinely static pages, served instantly with no per-request rendering work. Covered more in the rendering module.

### Reading query strings with searchParams

\`\`\`tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <p>Searching for: {q ?? "nothing yet"}</p>
}
\`\`\`

\`searchParams\` (only available in \`page.tsx\`, not layouts, as noted last lesson) gives you the URL's query string, parsed into an object — this is how \`/search?q=next.js\` becomes \`{ q: "next.js" }\` inside your component.

> **Key idea:** \`[param]\` for one segment, \`[...param]\` for a catch-all of one-or-more, \`[[...param]]\` for an optional catch-all. \`params\` reads path segments; \`searchParams\` (page-only) reads the query string.`,
    },
    {
      name: "Route Groups & Colocation",
      minutes: 8,
      intro: "Organizing routes without affecting the URL, and keeping route-specific code close by.",
      content: `### Route groups: parentheses don't affect the URL

\`\`\`
app/
  (marketing)/
    layout.tsx        <- shared layout for marketing pages only
    page.tsx            -> /
    about/
      page.tsx           -> /about
  (app)/
    layout.tsx        <- a DIFFERENT shared layout for app pages
    dashboard/
      page.tsx           -> /dashboard
\`\`\`

A folder wrapped in parentheses — \`(marketing)\`, \`(app)\` — is a **route group**: it organizes files and lets you apply a different layout to a section of your app, but it's completely invisible in the URL. \`/about\` is still \`/about\`, not \`/marketing/about\`.

This solves a real problem: a marketing site's pages and a logged-in dashboard's pages usually need entirely different root layouts (different nav, different overall chrome) — route groups let both live under the same \`app/\` root with their own independent layout, without forcing an artificial URL prefix on either.

### Private folders: underscore prefix

\`\`\`
app/
  blog/
    _components/
      PostCard.tsx     <- NOT a route, even though it's inside app/
    page.tsx
\`\`\`

A folder prefixed with an underscore is explicitly excluded from routing, regardless of what it contains — a clear, deliberate way to colocate helper components, utilities, or tests directly next to the route that uses them without any risk of Next.js mistaking a stray file for a route.

### Colocation: keeping related files together

\`\`\`
app/
  dashboard/
    layout.tsx
    page.tsx
    DashboardChart.tsx     <- a component used only by this page
    _utils/
      formatMetrics.ts       <- a helper used only by this route
\`\`\`

Because only specifically-named files (\`page\`, \`layout\`, \`loading\`, etc.) become part of routing, you're free to colocate any other file — components, styles, tests, utilities — directly inside a route's folder. This is a deliberate design choice in the App Router: route-specific code lives next to the route, instead of being scattered across a separate top-level \`components/\` folder purely by convention.

### When to still use a top-level components folder

\`\`\`
components/
  ui/
    Button.tsx      <- used across many, unrelated routes
    Card.tsx
\`\`\`

Colocate what's specific to one route; keep genuinely shared, cross-cutting components (a design system's \`Button\`, \`Card\`, etc.) in a conventional top-level folder instead — the same judgment call you'd make in any React project.

> **Key idea:** route groups \`(name)\` organize and apply layouts without touching the URL; underscore-prefixed \`_folders\` opt out of routing entirely. Together they let you colocate almost everything route-specific directly inside \`app/\`, rather than scattering it elsewhere by convention.`,
    },
  ],
}
