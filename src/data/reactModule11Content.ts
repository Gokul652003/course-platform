import type { Module } from "../types"

export const reactModule11: Module = {
  id: 11,
  title: "Routing with React Router",
  status: "upcoming",
  lessons: [
    {
      name: "Setting Up Routes & Navigation",
      minutes: 9,
      intro: "Giving a single-page React app multiple, real, navigable URLs.",
      content: `### The problem: React alone has no concept of pages

A React app built purely from what this course has covered so far is a **single** page — the same component tree, rendered once, into \`#root\` (recall module 1). There's no built-in way to have \`/about\` show different content than \`/\`, or to navigate between them without a full page reload. **React Router** is the standard library that adds this — client-side routing, entirely within a React app.

### Installing and setting up the router

\`\`\`bash
npm install react-router-dom
\`\`\`

\`\`\`jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
])

function App() {
  return <RouterProvider router={router} />
}
\`\`\`

\`createBrowserRouter\` takes an array of route definitions — each a \`path\` and the \`element\` (a component instance, recall module 1) to render when that path matches the current URL. \`<RouterProvider>\` is what actually activates the router for the whole app — conceptually similar to module 8's context \`Provider\`, making routing information available throughout the tree.

### Navigating with Link — never a plain anchor tag

\`\`\`jsx
import { Link } from "react-router-dom"

function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  )
}
\`\`\`

This directly mirrors this platform's Next.js course's \`<Link>\` lesson, for the exact same underlying reason: a plain \`<a href="/about">\` triggers a full page reload — reloading the entire JavaScript bundle and resetting all React state — while \`<Link>\` performs client-side navigation, swapping out only the \`element\` that changed, without a reload. **Always use \`<Link>\` for internal navigation**, never a plain \`<a>\`, unless linking to a genuinely external site.

### Programmatic navigation with useNavigate

\`\`\`jsx
import { useNavigate } from "react-router-dom"

function LoginForm() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    // ...perform login...
    navigate("/dashboard")
  }

  return <form onSubmit={handleSubmit}>...</form>
}
\`\`\`

For navigation that needs to happen as a *result* of some logic (after a successful form submission, here) rather than a direct \`<Link>\` click, \`useNavigate()\` returns a function to trigger navigation from inside an event handler or effect — directly analogous to the Next.js course's \`useRouter().push(...)\`.

### Reading the current URL

\`\`\`jsx
import { useLocation } from "react-router-dom"

function Breadcrumb() {
  const location = useLocation()
  return <p>Current path: {location.pathname}</p>
}
\`\`\`

\`useLocation()\` gives you the current URL's details (\`pathname\`, \`search\` for the query string, and more) from anywhere in the routed tree — useful for anything that needs to know or react to the current route without being the component the router rendered directly for that route.

### A 404 route: catching anything that doesn't match

\`\`\`jsx
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "*", element: <NotFound /> },   // matches ANY path not matched by an earlier, more specific route
])
\`\`\`

A route with \`path: "*"\` acts as a catch-all, matching any URL that didn't match one of the more specific routes above it — the standard way to show a proper "page not found" experience, rather than a blank screen, for an unrecognized URL.

> **Key idea:** \`createBrowserRouter\` maps URL paths to components, \`<RouterProvider>\` activates it for the app, and \`<Link>\`/\`useNavigate\` are the two ways to navigate — always \`<Link>\` for direct clicks, since (exactly like the Next.js course's equivalent) it avoids the full-page-reload cost of a plain \`<a>\` tag.`,
    },
    {
      name: "Dynamic Routes & URL Parameters",
      minutes: 8,
      intro: "Routes driven by data — a single route definition handling any number of specific URLs.",
      content: `### A dynamic segment: :param syntax

\`\`\`jsx
const router = createBrowserRouter([
  { path: "/products/:productId", element: <ProductDetail /> },
])
\`\`\`

\`\`\`jsx
import { useParams } from "react-router-dom"

function ProductDetail() {
  const { productId } = useParams()
  return <p>Showing product: {productId}</p>
}
\`\`\`

A path segment prefixed with \`:\` (here, \`:productId\`) matches **any** value at that position in the URL — visiting \`/products/42\` or \`/products/abc\` both match this one route definition, with the actual matched value read via \`useParams()\`. This directly mirrors this platform's Next.js course's \`[slug]\` dynamic route segments — conceptually the same idea (one route definition, many possible URLs), expressed with React Router's own \`:param\` syntax instead of a folder convention.

### Fetching data based on a URL parameter

\`\`\`jsx
function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(\`/api/products/\${productId}\`)
      .then((res) => res.json())
      .then(setProduct)
  }, [productId])   // module 5: re-fetches whenever productId itself changes

  if (!product) return <p>Loading...</p>
  return <h1>{product.name}</h1>
}
\`\`\`

This directly combines module 5's dependency-array lesson with \`useParams()\`: navigating from \`/products/1\` to \`/products/2\` (perhaps via a \`<Link>\` on a related-products list) changes \`productId\`, which re-triggers the effect and fetches the new product's data — the exact same component instance handles every possible product ID, refetching correctly whenever the URL parameter changes.

### Multiple parameters in one route

\`\`\`jsx
const router = createBrowserRouter([
  { path: "/users/:userId/posts/:postId", element: <UserPost /> },
])
\`\`\`

\`\`\`jsx
function UserPost() {
  const { userId, postId } = useParams()
  return <p>User {userId}, Post {postId}</p>
}
\`\`\`

A route can define any number of \`:param\` segments — each becomes its own key in the object \`useParams()\` returns, exactly matching its name in the path definition.

### Reading query strings with useSearchParams

\`\`\`jsx
import { useSearchParams } from "react-router-dom"

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q")   // /search?q=react -> query is "react"

  function handleSort(sortBy) {
    setSearchParams({ q: query, sort: sortBy })   // updates the URL's query string
  }

  return <p>Searching for: {query}</p>
}
\`\`\`

Distinct from \`:param\` (part of the path itself), a **query string** (\`?q=react&sort=price\`) is read via \`useSearchParams()\` — modeled directly on \`useState\`'s \`[value, setter]\` pair, but reading from and writing to the URL's actual query string instead of internal component state. Useful for things like search terms, filters, and sort order — state that makes sense to be shareable/bookmarkable via the URL itself.

### Optional parameters

\`\`\`jsx
const router = createBrowserRouter([
  { path: "/products/:category?", element: <ProductList /> },   // category is OPTIONAL
])
\`\`\`

Appending \`?\` after a parameter name makes that segment optional — this single route definition matches both \`/products\` (no category) and \`/products/electronics\` (a specific category), with \`useParams().category\` simply being \`undefined\` in the first case.

> **Key idea:** \`:param\` in a route's path creates a dynamic segment, read via \`useParams()\` — directly analogous to the Next.js course's \`[slug]\` folders — and combined with module 5's \`useEffect\`, it's the standard way to fetch data specific to whatever's currently in the URL. \`useSearchParams\` handles the separate concern of a URL's query string.`,
    },
    {
      name: "Nested Routes & Layouts",
      minutes: 9,
      intro: "Sharing layout UI across multiple routes, without repeating it in every single route's component.",
      content: `### The problem: repeating shared layout across every route

\`\`\`jsx
// repeating <Nav /> and <Footer /> in EVERY single route's component — genuinely repetitive
function Home() {
  return (
    <div>
      <Nav />
      <h1>Home</h1>
      <Footer />
    </div>
  )
}

function About() {
  return (
    <div>
      <Nav />
      <h1>About</h1>
      <Footer />
    </div>
  )
}
\`\`\`

Nearly every real application has shared UI — navigation, a footer, a sidebar — that should appear consistently across many (or all) routes, without being copy-pasted into each individual route's component.

### Nested routes: a layout route wrapping its children

\`\`\`jsx
import { Outlet } from "react-router-dom"

function Layout() {
  return (
    <div>
      <Nav />
      <main>
        <Outlet />   {/* whichever CHILD route currently matches renders HERE */}
      </main>
      <Footer />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },        // matches "/" exactly
      { path: "about", element: <About /> },        // matches "/about"
      { path: "contact", element: <Contact /> },       // matches "/contact"
    ],
  },
])
\`\`\`

A route with \`children\` renders its own \`element\` (\`Layout\`, here) for **every** matching child route, with \`<Outlet />\` marking exactly where that child's content should appear. This directly mirrors this platform's Next.js course's nested \`layout.tsx\` files, conceptually — a persistent wrapper, with the actual page content swapped in and out inside it — expressed here as an explicit \`<Outlet />\` placeholder rather than an automatic \`{children}\` convention.

### index: true — the route for the parent path itself

\`\`\`jsx
{ index: true, element: <Home /> }
\`\`\`

An \`index\` route matches the parent's own path exactly (\`/\`, with no additional segment) — it's specifically what renders inside \`<Outlet />\` when the URL is *just* \`/\`, as distinct from \`/about\` or \`/contact\`.

### Multiple levels of nesting

\`\`\`jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "dashboard",
        element: <DashboardLayout />,   // ANOTHER layout, nested inside the first
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "settings", element: <DashboardSettings /> },
        ],
      },
    ],
  },
])
\`\`\`

Nesting isn't limited to one level — \`/dashboard/settings\` here renders \`Layout\` → (inside its \`<Outlet />\`) \`DashboardLayout\` → (inside *its own* \`<Outlet />\`) \`DashboardSettings\`, exactly mirroring how the Next.js course's nested \`layout.tsx\` files compose, just expressed through explicit route configuration instead of folder structure.

### Sharing data between a layout and its child routes

\`\`\`jsx
function DashboardLayout() {
  const { user } = useAuth()   // a custom hook, module 7
  return <Outlet context={{ user }} />   // pass data down to whichever child route is currently active
}
\`\`\`

\`\`\`jsx
import { useOutletContext } from "react-router-dom"

function DashboardHome() {
  const { user } = useOutletContext()
  return <p>Welcome, {user.name}</p>
}
\`\`\`

\`<Outlet context={...}>\` combined with \`useOutletContext()\` in the child lets a layout pass data down to whichever specific child route currently renders inside it — genuinely useful for data (like the current user) that every child route under a given layout needs, without re-fetching or re-deriving it separately in each one.

> **Key idea:** a route with \`children\` renders shared layout UI once, with \`<Outlet />\` marking where the currently-matched child route's content appears — directly analogous to the Next.js course's nested layouts, but expressed as explicit route configuration rather than a folder-based convention.`,
    },
    {
      name: "Data Loading with the Router",
      minutes: 9,
      intro: "Fetching a route's data before it renders, rather than after — using React Router's own data APIs.",
      content: `### The problem with fetching inside the component: a flash of loading state

\`\`\`jsx
function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(\`/api/products/\${productId}\`).then((res) => res.json()).then(setProduct)
  }, [productId])

  if (!product) return <p>Loading...</p>   // ALWAYS shows this first, even if the fetch is genuinely fast
  return <h1>{product.name}</h1>
}
\`\`\`

Recall module 5's fetch-in-an-effect pattern — this works, but the component always renders its "Loading..." state first, *then* fetches, *then* re-renders with real data — even for a fast connection where the delay is barely perceptible, the UI still flashes through a loading state, unavoidably, since rendering and fetching happen sequentially by design.

### loader: fetching before the route ever renders

\`\`\`jsx
const router = createBrowserRouter([
  {
    path: "/products/:productId",
    element: <ProductDetail />,
    loader: async ({ params }) => {
      const response = await fetch(\`/api/products/\${params.productId}\`)
      return response.json()
    },
  },
])
\`\`\`

\`\`\`jsx
import { useLoaderData } from "react-router-dom"

function ProductDetail() {
  const product = useLoaderData()   // already resolved, ready immediately — no loading state needed here at all
  return <h1>{product.name}</h1>
}
\`\`\`

A route's \`loader\` function runs **before** navigation to that route actually completes — React Router waits for it to resolve, *then* renders \`ProductDetail\`, which reads the already-fetched data via \`useLoaderData()\`. This inverts the previous example's order: fetch first, render once, with real data already available — no intermediate loading flash for this specific route's own data.

### Handling the loading state at the navigation level instead

\`\`\`jsx
import { useNavigation } from "react-router-dom"

function Layout() {
  const navigation = useNavigation()

  return (
    <div>
      <Nav />
      {navigation.state === "loading" && <p>Loading page...</p>}
      <Outlet />
    </div>
  )
}
\`\`\`

Rather than each route component managing its own loading state (the module 5 pattern), \`useNavigation()\` exposes the router's *overall* navigation state — \`"idle"\`, \`"loading"\`, or \`"submitting"\` — letting a shared layout show one consistent loading indicator for *any* in-progress navigation, regardless of which specific route is loading.

### action: handling form submissions through the router

\`\`\`jsx
const router = createBrowserRouter([
  {
    path: "/products/new",
    element: <NewProduct />,
    action: async ({ request }) => {
      const formData = await request.formData()
      await fetch("/api/products", { method: "POST", body: formData })
      return redirect("/products")
    },
  },
])
\`\`\`

\`\`\`jsx
import { Form } from "react-router-dom"

function NewProduct() {
  return (
    <Form method="post">
      <input name="name" />
      <button type="submit">Create</button>
    </Form>
  )
}
\`\`\`

React Router's own \`<Form>\` (distinct from a plain HTML \`<form>\`) submits directly to the route's \`action\` function instead of triggering a normal browser form submission — this pattern will look immediately familiar if you've seen this platform's Next.js course's Server Actions, since it solves an analogous problem (handling a mutation tied directly to a route) using React Router's own equivalent mechanism.

### Is this level of the router's data APIs always necessary?

For many applications — especially ones already using a dedicated data-fetching library (covered in module 12) — the simpler \`useEffect\`-based fetching from module 5 remains completely reasonable, and \`loader\`/\`action\` aren't mandatory. They earn their place specifically when eliminating the loading-flash matters for a given route, or when you want data-fetching and mutation logic tied directly to route definitions rather than scattered across component effects.

> **Key idea:** a route's \`loader\` fetches data *before* that route renders, eliminating the sequential fetch-then-render loading flash from module 5's effect-based pattern — \`useNavigation()\` gives router-wide loading state for shared UI, and \`action\`/\`<Form>\` handle mutations tied directly to a route, conceptually similar to the Next.js course's Server Actions.`,
    },
  ],
}
