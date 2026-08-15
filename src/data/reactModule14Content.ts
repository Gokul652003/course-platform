import type { Module } from "../types"

export const reactModule14: Module = {
  id: 14,
  title: "Professional Practices & Capstone",
  status: "upcoming",
  lessons: [
    {
      name: "Error Boundaries & Portals",
      minutes: 8,
      intro: "Containing a crash to one part of the UI, and rendering outside the normal component tree.",
      content: `### The problem: one component's error crashes the entire app

\`\`\`jsx
function ProductPrice({ product }) {
  return <p>\${product.price.toFixed(2)}</p>   // throws if product.price is undefined — crashes EVERYTHING
}
\`\`\`

By default, an uncaught error thrown during rendering anywhere in the component tree unmounts the **entire** app — not just the component that threw. A single malformed piece of data in one small, non-critical widget can take down a page that's otherwise working perfectly fine.

### Error boundaries: containing a crash to one section

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("Caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return <p>Something went wrong displaying this section.</p>
    }
    return this.props.children
  }
}
\`\`\`

\`\`\`jsx
function ProductPage({ product }) {
  return (
    <div>
      <ProductTitle product={product} />
      <ErrorBoundary>
        <ProductPrice product={product} />   {/* if THIS crashes, only this section shows a fallback */}
      </ErrorBoundary>
      <ProductDescription product={product} />
    </div>
  )
}
\`\`\`

An **error boundary** must currently be written as a class component — this is one of the few remaining cases in modern React where a class is genuinely required, since there's no hook equivalent for \`componentDidCatch\`/\`getDerivedStateFromError\` yet. Wrapping a specific, potentially-fragile section in an \`ErrorBoundary\` contains a crash to just that section — the rest of the page (\`ProductTitle\`, \`ProductDescription\`) keeps working normally, showing the fallback UI only where the actual error occurred.

### Where to place error boundaries

A common, sensible pattern: one error boundary near the root of the app (a last line of defense against any uncaught error), plus additional, more granular boundaries around specific sections that are independently non-critical or handle less-trusted data (a third-party widget, a section rendering user-generated content) — so a failure in one specific, isolated area doesn't take down the whole page.

### Error boundaries don't catch everything

\`\`\`jsx
function Component() {
  useEffect(() => {
    throw new Error("This is NOT caught by an error boundary!")   // errors in effects/handlers need try/catch
  }, [])
}
\`\`\`

Error boundaries only catch errors thrown **during rendering** — not inside event handlers, effects, or asynchronous code. Recall this platform's JavaScript course's module 10 \`try\`/\`catch\` — errors in those contexts still need to be handled with ordinary \`try\`/\`catch\`, exactly as in any JavaScript code; error boundaries are specifically a rendering-time safety net, not a universal catch-all.

### Portals: rendering outside the normal DOM hierarchy

\`\`\`jsx
import { createPortal } from "react-dom"

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById("modal-root")   // renders here in the DOM, NOT inside the component's normal parent
  )
}
\`\`\`

\`createPortal(children, domNode)\` renders a piece of JSX into a **different** actual DOM location than where the component sits in the React tree — genuinely useful for modals, tooltips, and dropdowns, which need to visually escape a parent's \`overflow: hidden\` or \`z-index\` stacking context, while still behaving, from React's perspective (event bubbling, context — recall module 8 — still works normally through a portal), as if it were rendered in its normal position in the component tree.

> **Key idea:** an error boundary (still one of the few required uses of a class component) contains a rendering-time crash to a specific section rather than the whole app, and should be placed both near the root and around specific fragile/non-critical sections — but it doesn't catch errors in effects or handlers, which still need ordinary \`try\`/\`catch\`. Portals render JSX into a different DOM location while keeping normal React behavior (context, event bubbling) intact — the standard tool for modals and similar overlay UI.`,
    },
    {
      name: "State Management at Scale",
      minutes: 9,
      intro: "Where useReducer + useContext's limits actually show up, and the dedicated libraries built to address them.",
      content: `### Recalling module 8's honest limitation

Module 8 closed with an honest caveat: \`useReducer\` + \`useContext\` genuinely works well at small-to-medium scale, but every consumer of a context re-renders on any change to that context's value — even split into separate state/dispatch contexts, this only goes so far once an app has many independent, frequently-changing pieces of shared state.

### Zustand: a lightweight, hooks-based alternative

\`\`\`jsx
import { create } from "zustand"

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}))

function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem)   // subscribes ONLY to addItem, not the whole store
  return <button onClick={() => addItem(product)}>Add to cart</button>
}

function CartCount() {
  const itemCount = useCartStore((state) => state.items.length)   // subscribes ONLY to items.length
  return <span>{itemCount}</span>
}
\`\`\`

This is the crucial difference from context: each component **subscribes to exactly the specific slice of state it selects** — \`AddToCartButton\` re-renders only when \`addItem\` itself changes (essentially never), and \`CartCount\` re-renders only when \`items.length\` actually changes — not on every single change to any part of the store, the way every consumer of a React context does. No \`<Provider>\` wrapping required either — \`useCartStore\` is usable directly from anywhere, without threading a context through the tree at all.

### Redux Toolkit: the long-standing, more structured option

\`\`\`jsx
import { createSlice, configureStore } from "@reduxjs/toolkit"
import { useSelector, useDispatch } from "react-redux"

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload)   // Redux Toolkit allows this "mutation" syntax safely, internally
    },
  },
})

const store = configureStore({ reducer: { cart: cartSlice.reducer } })

function AddToCartButton({ product }) {
  const dispatch = useDispatch()
  return <button onClick={() => dispatch(cartSlice.actions.addItem(product))}>Add to cart</button>
}

function CartCount() {
  const itemCount = useSelector((state) => state.cart.items.length)   // also subscribes to just this slice
  return <span>{itemCount}</span>
}
\`\`\`

This directly parallels module 8's \`useReducer\` pattern (actions, a reducer function) — Redux's underlying model is essentially the same idea, formalized and extended with a genuine cross-component subscription system (via \`useSelector\`, avoiding context's re-render-everything problem) and a rich, mature developer-tools ecosystem for inspecting every dispatched action and the exact state change it caused, genuinely valuable for debugging complex state interactions in a large application.

### Comparing the three real options

| | Built-in context | Zustand | Redux Toolkit |
|---|---|---|---|
| Extra dependency | No | Yes, small | Yes, larger |
| Selective re-renders | No — every consumer re-renders on any change | Yes | Yes |
| Boilerplate | Low | Low | Moderate |
| DevTools | Basic (React DevTools only) | Good | Excellent, purpose-built |
| Best for | Small-medium apps, infrequently-changing data | Most apps needing more than context | Large, complex apps with intricate state interactions |

### The practical guidance: start simple, reach for more only when needed

For most new projects, start with \`useState\`/\`useReducer\` locally, and \`useContext\` for genuinely shared, infrequently-changing data (module 8) — this remains completely adequate for a large fraction of real applications. Reach for Zustand once context's "every consumer re-renders" behavior becomes a measurable problem (confirmed via the Profiler, module 6) for frequently-changing shared state. Reach for Redux specifically for a genuinely large, complex application where the debugging tooling and strict, formalized action-based structure earn their added complexity. None of these is a mandatory starting point — they solve a specific, real limitation of the built-in tools, once (and only once) you've actually hit it.

> **Key idea:** context's core limitation — every consumer re-renders on any value change — is exactly what Zustand and Redux both solve via selective, slice-based subscriptions; Zustand is the lighter-weight modern choice for most apps outgrowing context, while Redux Toolkit's more structured, action-based model and mature DevTools earn their place in genuinely large, complex applications. Start simple, and reach for either only once you've hit context's actual, measured limits.`,
    },
    {
      name: "Accessibility & Project Architecture",
      minutes: 9,
      intro: "Building React apps that work for every user, organized in a way that scales as the codebase grows.",
      content: `### Accessibility in JSX: mostly the same rules, applied through React's syntax

\`\`\`jsx
function IconButton({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Close dialog">
      <XIcon aria-hidden="true" />
    </button>
  )
}
\`\`\`

Everything from this platform's HTML course's accessibility module applies directly and unchanged in React — semantic elements, \`alt\` text, \`aria-label\` for icon-only buttons, \`aria-hidden\` for decorative icons (recall module 1's \`className\`/camelCase-attribute lesson: these ARIA attributes keep their exact hyphenated names in JSX, unlike \`class\`→\`className\`, since \`aria-*\` and \`data-*\` attributes are a deliberate exception to JSX's camelCase convention).

### Managing focus after a route change or a dynamic UI update

\`\`\`jsx
function Modal({ onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current.focus()   // module 6's ref lesson — move focus into the modal when it opens
  }, [])

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
    </div>
  )
}
\`\`\`

This directly applies module 6's \`useRef\`-for-DOM-access lesson to a genuine accessibility need: when a modal opens, sighted mouse users see it appear, but a keyboard/screen-reader user needs focus explicitly moved into it — without this, they'd remain focused on whatever was behind the modal, with no clear indication anything changed. This is exactly the kind of imperative DOM interaction module 6 flagged as a legitimate, necessary use of a ref.

### Testing accessibility directly

\`\`\`jsx
test("close button is accessible by role and name", () => {
  render(<Modal onClose={() => {}} />)
  expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
})
\`\`\`

Recall module 13's query-priority guidance: writing tests using \`getByRole\` (rather than a test ID) means a test failing to find an element is often flagging a real accessibility gap, not just a testing inconvenience — this is a genuinely valuable, largely free side effect of following RTL's recommended query priority.

### Feature-based folder structure: organizing by domain, not by file type

\`\`\`
// AVOID at scale: organizing by file TYPE
src/
  components/
    UserProfile.jsx
    ProductCard.jsx
    Cart.jsx
  hooks/
    useUser.js
    useCart.js

// PREFER at scale: organizing by FEATURE/domain
src/
  features/
    user/
      UserProfile.jsx
      useUser.js
      userSlice.js
    cart/
      Cart.jsx
      useCart.js
      cartSlice.js
  components/       <- genuinely shared, cross-feature UI only (Button, Card, Modal)
\`\`\`

For a small app, organizing by file type (all components together, all hooks together) works fine. As an app grows, this scatters everything related to one feature (a component, its hooks, its state) across several unrelated top-level folders — finding everything relevant to "the cart feature" means hunting through multiple directories. Grouping by feature/domain instead keeps related code physically close together, and makes a feature's boundaries and dependencies far more visible at a glance — this is broadly the same colocation instinct this platform's Next.js course's App Router encourages structurally, applied here as a deliberate convention rather than a framework-enforced rule.

### Separating concerns within a feature

\`\`\`
features/cart/
  Cart.jsx           <- the component (module 1-3's concerns: rendering, props)
  useCart.js           <- state/logic (module 7's custom hook pattern)
  cartApi.js             <- data fetching (module 12's concerns)
  Cart.test.jsx             <- tests (module 13)
\`\`\`

Even within one feature folder, separating a component's rendering logic from its data-fetching logic (via a custom hook, module 7) and from its actual API calls keeps each piece independently testable and readable — directly applying module 3's composition and module 7's custom-hooks lessons to file organization, not just component structure.

> **Key idea:** JSX accessibility follows the exact same principles as the HTML course, with \`aria-*\`/\`data-*\` as deliberate exceptions to JSX's camelCase convention, and \`useRef\` (module 6) is the correct tool for the genuinely imperative need of managing focus. Feature-based folder organization — grouping a component with its own hooks, API calls, and tests — scales meaningfully better than organizing purely by file type as an application grows.`,
    },
    {
      name: "Capstone: A Complete Application",
      minutes: 12,
      intro: "One worked example combining concepts from every module in this course, and where to go from here.",
      content: `### A small, complete task board application

\`\`\`jsx
// features/tasks/tasksReducer.js — module 8: centralized state transitions
export function tasksReducer(state, action) {
  switch (action.type) {
    case "ADD_TASK":
      return [...state, { id: crypto.randomUUID(), text: action.text, status: "todo" }]
    case "MOVE_TASK":
      return state.map((t) => (t.id === action.id ? { ...t, status: action.status } : t))
    case "DELETE_TASK":
      return state.filter((t) => t.id !== action.id)
    default:
      return state
  }
}
\`\`\`

\`\`\`jsx
// features/tasks/TasksContext.jsx — module 8: sharing reducer state via context
const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, [])
  return <TasksContext.Provider value={{ tasks, dispatch }}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error("useTasks must be used within TasksProvider")
  return context
}
\`\`\`

\`\`\`jsx
// features/tasks/useTaskFilter.js — module 7: a custom hook, module 6: useMemo
export function useTaskFilter(tasks, status) {
  return useMemo(() => tasks.filter((t) => t.status === status), [tasks, status])
}
\`\`\`

\`\`\`jsx
// features/tasks/TaskColumn.jsx — modules 2, 3, 4, 6: lists/keys, props, events, React.memo
const TaskColumn = memo(function TaskColumn({ status, title }) {
  const { tasks, dispatch } = useTasks()
  const filteredTasks = useTaskFilter(tasks, status)

  return (
    <div className="column">
      <h2>{title}</h2>
      {filteredTasks.length === 0 && <p>No tasks</p>}
      <ul>
        {filteredTasks.map((task) => (
          <li key={task.id}>
            {task.text}
            <button onClick={() => dispatch({ type: "DELETE_TASK", id: task.id })}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
})
\`\`\`

\`\`\`jsx
// features/tasks/NewTaskForm.jsx — module 4/9: controlled input, form submission
function NewTaskForm() {
  const [text, setText] = useState("")
  const { dispatch } = useTasks()

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    dispatch({ type: "ADD_TASK", text })
    setText("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input aria-label="New task" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add task</button>
    </form>
  )
}
\`\`\`

\`\`\`jsx
// App.jsx — module 11: routing, module 14: error boundary
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ErrorBoundary>
          <TasksProvider>
            <Layout />
          </TasksProvider>
        </ErrorBoundary>
      ),
      children: [
        { index: true, element: <BoardPage /> },
        { path: "tasks/:taskId", element: <TaskDetailPage /> },
      ],
    },
  ])
  return <RouterProvider router={router} />
}

function BoardPage() {
  return (
    <div>
      <NewTaskForm />
      <div className="board">
        <TaskColumn status="todo" title="To Do" />
        <TaskColumn status="in-progress" title="In Progress" />
        <TaskColumn status="done" title="Done" />
      </div>
    </div>
  )
}
\`\`\`

### What this draws on, module by module

Nearly every module contributed something concrete here: JSX and conditional rendering (1-2), props and composition (3), controlled inputs and events (4), \`useMemo\` for the filtered lists (6), a custom \`useTaskFilter\` hook (7), \`useReducer\` + \`useContext\` for shared task state (8), a controlled form (9), \`React.memo\` on \`TaskColumn\` since it only needs to re-render when its own filtered slice changes (6, revisited), routing with nested routes (11), and an error boundary wrapping the whole feature (14). A real test suite (module 13) would cover \`tasksReducer\` directly as a pure function, and \`NewTaskForm\`/\`TaskColumn\` via \`render\`/\`userEvent\`.

### What's intentionally left out, and why

This capstone doesn't include actual server persistence (module 12's data-fetching/React Query material would replace the in-memory reducer with real \`useQuery\`/\`useMutation\` calls against a backend) or TypeScript annotations (module 3's typing patterns apply directly to every prop and reducer action here) — both are genuinely straightforward extensions using exactly the patterns already covered, left out here purely to keep the example focused on state/component architecture.

### Where to go from here

- **A real backend** — this platform's Next.js course covers building the API side (Route Handlers, Server Actions) this capstone's task board would need for real persistence.
- **TypeScript throughout** — module 3's typing patterns, applied to every component, reducer, and context in a real project.
- **Deployment** — this platform's Docker course's multi-stage build pattern, or a static host, for actually shipping a Vite-built React app.
- **A meta-framework** — once you're comfortable with React itself, this platform's Next.js course shows how Server Components, file-based routing, and built-in data fetching build directly on top of everything covered in this course.

> **Key idea:** a real React application is these fourteen modules' concepts working together simultaneously, not any one in isolation — this capstone's task board, small as it is, genuinely combines state management, custom hooks, routing, performance optimization, and error handling into one coherent, working whole, which is exactly the synthesis this entire course has been building toward.`,
    },
  ],
}
