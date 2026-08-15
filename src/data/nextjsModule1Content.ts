import type { Module } from "../types"

export const nextjsModule1: Module = {
  id: 1,
  title: "Getting Started with Next.js",
  status: "in_progress",
  lessons: [
    {
      name: "What is Next.js?",
      minutes: 8,
      intro: "A React framework that handles routing, rendering, and bundling for you.",
      content: `### React is a library, not a framework

React itself only answers one question: "how do I turn state into UI?" It has no built-in opinion on routing, data fetching, or how your app gets bundled and served — every real React app ends up reaching for other tools to answer those questions. **Next.js is a framework built on top of React** that answers them for you, with sensible, production-tested defaults.

### What Next.js adds on top of React

- **File-based routing** — create a file, get a route. No router library to configure.
- **Rendering flexibility** — render pages on the server, statically at build time, or on the client, choosing per-route (or even per-component) rather than committing your whole app to one strategy.
- **Built-in optimization** — automatic image optimization, font loading, code-splitting, and bundling, without hand-configuring a bundler.
- **Full-stack capability** — write server-side logic (API endpoints, database calls, form handling) in the same project as your UI, no separate backend required for many apps.

### Where it fits

\`\`\`
React            -> the UI library (components, state, hooks)
Next.js          -> the framework (routing, rendering, bundling, server logic)
Vercel           -> a hosting platform built specifically to run Next.js (optional — Next.js apps can run elsewhere too)
\`\`\`

You'll use everything you already know about React — components, props, hooks, state — Next.js doesn't replace any of that. It wraps around it with the pieces every real application eventually needs.

### Why teams reach for it

- **Performance by default** — pages can be pre-rendered (built once, served instantly) instead of every visitor waiting for JavaScript to run before seeing anything.
- **SEO** — server-rendered HTML is immediately readable by search engines and social media crawlers, unlike a client-only React app that starts as an empty \`<div id="root">\`.
- **One codebase, full stack** — no separate Express server needed for many use cases; API routes and page code live side by side.

> **Key idea:** Next.js doesn't compete with React — it's built directly on top of it, filling in the routing, rendering, and infrastructure decisions that a plain React app would otherwise leave entirely up to you.`,
    },
    {
      name: "Creating Your First App",
      minutes: 8,
      intro: "The create-next-app scaffolding tool, and what it generates for you.",
      content: `### Scaffolding a new project

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

This walks you through a handful of setup questions — TypeScript or JavaScript, ESLint, Tailwind CSS, whether to use the \`src/\` directory, and whether to use the **App Router** (the modern default, and what this course covers) versus the older Pages Router.

### Starting the dev server

\`\`\`bash
cd my-app
npm run dev
\`\`\`

Visit \`http://localhost:3000\` — you'll see the default starter page. The dev server supports **Fast Refresh**: edit a component and save, and the browser updates in place, usually preserving component state, without a full page reload.

### What gets generated

\`\`\`
my-app/
  app/
    layout.tsx      <- root layout, wraps every page
    page.tsx         <- the home page ("/")
    globals.css       <- global styles
  public/            <- static assets (images, fonts, favicon)
  next.config.js     <- Next.js configuration
  package.json
  tsconfig.json
\`\`\`

The \`app/\` directory is the heart of the App Router — every route in your application corresponds to a folder structure inside it, covered in depth in the next module.

### The four essential scripts

\`\`\`bash
npm run dev      # start the dev server, with Fast Refresh
npm run build    # create an optimized production build
npm run start    # run the production build locally (after \`build\`)
npm run lint     # run ESLint
\`\`\`

\`dev\` and \`build\` behave meaningfully differently — \`dev\` prioritizes fast rebuilds and helpful error overlays; \`build\` produces the optimized, minified output you'd actually deploy. Always test with \`build\` + \`start\` before shipping — some bugs (missing environment variables, certain caching behaviors) only surface in a production build, never in dev mode.

> **Key idea:** \`create-next-app\` isn't magic — it's just scaffolding a conventional folder structure and a working config. Understanding what it generated (rather than treating it as a black box) makes everything that follows in this course make sense.`,
    },
    {
      name: "Project Structure & File Conventions",
      minutes: 9,
      intro: "The special filenames the App Router looks for, and what each one means.",
      content: `### Special files, not special syntax

The App Router works by recognizing specific **filenames** inside the \`app/\` directory — there's no router configuration file to maintain. Create a file with the right name in the right folder, and Next.js wires it up automatically.

\`\`\`
app/
  layout.tsx     <- shared UI wrapping this segment and its children
  page.tsx       <- makes a route segment publicly accessible, renders its UI
  loading.tsx    <- loading UI, shown automatically while page.tsx is loading
  error.tsx      <- error UI, catches errors in this segment
  not-found.tsx  <- UI shown for a 404 within this segment
\`\`\`

### page.tsx: the one that actually creates a route

\`\`\`tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Welcome</h1>
}
\`\`\`

A folder inside \`app/\` only becomes a visitable URL once it contains a \`page.tsx\` — a folder with only, say, a \`layout.tsx\` and no \`page.tsx\` isn't reachable as a route on its own (useful for grouping shared layout without exposing a URL, more on that in the next module).

### layout.tsx: shared UI that wraps children

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>My Site</nav>
        {children}
      </body>
    </html>
  )
}
\`\`\`

Every app **must** have a root \`layout.tsx\` — it's the one place \`<html>\` and \`<body>\` tags belong. \`{children}\` is where the matching \`page.tsx\` (or a nested layout) gets rendered.

### Where components, utilities, and other files live

\`\`\`
app/
  page.tsx
  Button.tsx        <- a component, colocated with the route that uses it
lib/
  utils.ts           <- shared utilities used across routes
components/
  ui/
    Card.tsx          <- shared, reusable components
\`\`\`

Only files matching the special conventions (\`page\`, \`layout\`, \`loading\`, etc.) become part of the routing system — you're free to place regular components, helper functions, and other files anywhere inside \`app/\` (colocated with the route they belong to) or in separate top-level folders like \`components/\` and \`lib/\` for anything shared broadly.

> **Key idea:** the App Router isn't configured — it's *discovered*, by filename convention. Learning this small vocabulary of special filenames (\`page\`, \`layout\`, \`loading\`, \`error\`, \`not-found\`) is most of what you need to navigate any Next.js App Router project.`,
    },
    {
      name: "TypeScript in a Next.js Project",
      minutes: 7,
      intro: "Why TypeScript is the default choice, and the handful of Next.js-specific types you'll use constantly.",
      content: `### Why TypeScript by default

\`create-next-app\` defaults to TypeScript, and the vast majority of real-world Next.js projects use it. Next.js's App Router leans heavily on conventions (a page receiving specific \`params\`/\`searchParams\` props, a layout receiving \`children\`) where TypeScript catches an entire category of "I passed the wrong shape of data" bugs at build time instead of runtime.

### Typing a page component

\`\`\`tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <h1>Post: {slug}</h1>
}
\`\`\`

Dynamic route segments (covered in the next module) arrive as a typed \`params\` object — TypeScript ensures you're reading a property that actually exists on the route, rather than a typo silently returning \`undefined\` at runtime.

### Typing a layout

\`\`\`tsx
// app/layout.tsx
import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

### Typing props for your own components

Nothing Next.js-specific here — ordinary React + TypeScript:

\`\`\`tsx
interface CardProps {
  title: string
  description: string
}

export function Card({ title, description }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
\`\`\`

### Type-checking your whole project

\`\`\`bash
npx tsc --noEmit
\`\`\`

Runs the TypeScript compiler in check-only mode (no output files) across the entire project — the same check \`next build\` runs automatically before producing a production build, which is why a type error will fail your build, not just show a red squiggle in your editor.

> **Key idea:** you don't need to learn a separate "Next.js type system" — it's ordinary TypeScript, applied to the specific prop shapes (\`params\`, \`children\`, \`searchParams\`) that the framework's conventions pass into your components.`,
    },
  ],
}
