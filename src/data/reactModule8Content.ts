import type { Module } from "../types"

export const reactModule8: Module = {
  id: 8,
  title: "useReducer & useContext",
  status: "upcoming",
  lessons: [
    {
      name: "useReducer: State Transitions as a Single Function",
      minutes: 10,
      intro: "An alternative to useState for state whose updates follow clear, well-defined transitions.",
      content: `### The problem: many related setState calls become hard to follow

\`\`\`jsx
function Cart() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [discount, setDiscount] = useState(0)

  function addItem(item) {
    const newItems = [...items, item]
    setItems(newItems)
    setTotal(newItems.reduce((sum, i) => sum + i.price, 0) - discount)
  }

  function applyDiscount(amount) {
    setDiscount(amount)
    setTotal(items.reduce((sum, i) => sum + i.price, 0) - amount)
  }
  // every action that touches "total" has to remember to recompute it correctly, everywhere it's touched
}
\`\`\`

As related pieces of state grow, and more and more places in a component need to update several of them together in a coordinated way, keeping every \`setState\` call correctly synchronized becomes genuinely error-prone — it's easy to update one piece of state and forget a related one, producing state that's internally inconsistent.

### useReducer: centralizing all state transitions in one function

\`\`\`jsx
import { useReducer } from "react"

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const items = [...state.items, action.item]
      return { ...state, items, total: items.reduce((sum, i) => sum + i.price, 0) - state.discount }
    }
    case "APPLY_DISCOUNT": {
      const total = state.items.reduce((sum, i) => sum + i.price, 0) - action.amount
      return { ...state, discount: action.amount, total }
    }
    default:
      return state
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, discount: 0 })

  function addItem(item) {
    dispatch({ type: "ADD_ITEM", item })
  }

  return <button onClick={() => addItem({ price: 10 })}>Add item — Total: {state.total}</button>
}
\`\`\`

\`useReducer(reducerFunction, initialState)\` returns \`[state, dispatch]\`. Rather than several separate \`setState\` calls scattered through the component, every possible state transition is described in exactly one place — the \`cartReducer\` function — as a \`switch\` over an **action**'s \`type\` (recall this platform's JavaScript course's module 2 \`switch\` coverage, applied directly here). Calling \`dispatch(action)\` triggers React to call \`cartReducer(currentState, action)\` and use its return value as the new state.

### A reducer is a pure function — this is the entire point

\`\`\`js
function cartReducer(state, action) {
  // given the SAME state and action, this must ALWAYS return the SAME new state —
  // no side effects, no randomness, no mutating "state" directly (recall JS course module 5/6's immutability rules)
}
\`\`\`

Recall the JavaScript course's discussion of pure functions — a reducer must be pure: no API calls, no mutating its \`state\` argument directly (always return a *new* object/array, exactly like module 4's state-immutability rule for \`useState\`), and no randomness. This purity is precisely what makes reducer-based state easy to reason about, test in isolation (just call the function directly with sample inputs and check the output), and even log/replay for debugging.

### The action object: describing what happened, not how to handle it

\`\`\`jsx
dispatch({ type: "ADD_ITEM", item: { id: 1, price: 10 } })
dispatch({ type: "REMOVE_ITEM", id: 1 })
dispatch({ type: "APPLY_DISCOUNT", amount: 5 })
\`\`\`

An **action** is a plain object describing *what happened* (by convention, always including a \`type\` field) — not instructions for *how* to update state; that logic lives entirely inside the reducer. This separation is genuinely valuable: the component dispatching an action doesn't need to know or care how the state actually gets updated, only what event occurred.

### When to reach for useReducer instead of useState

The practical signal: when a component's state updates involve **several related values that need to change together in a coordinated way**, or when the *next* state genuinely depends on carefully considering the *current* state in a non-trivial way (not just the simple functional-updater pattern from module 4), a reducer centralizes and clarifies that logic in one place. For simple, independent pieces of state (a single toggle, a single input value), plain \`useState\` remains simpler and more direct — \`useReducer\` is not a wholesale replacement for \`useState\`, just a better fit for a specific kind of complexity.

> **Key idea:** \`useReducer\` centralizes every state transition into one pure reducer function, called with the current state and a plain action object describing what happened — genuinely useful once related state updates become numerous or interdependent enough that scattered \`setState\` calls get error-prone to keep consistent.`,
    },
    {
      name: "useContext: Avoiding Prop Drilling",
      minutes: 9,
      intro: "Making a value available to any descendant component, without passing it through every level in between.",
      content: `### Recalling the problem: prop drilling

\`\`\`jsx
function App({ theme }) {
  return <Dashboard theme={theme} />
}
function Dashboard({ theme }) {
  return <Sidebar theme={theme} />   // Dashboard doesn't use theme itself, just forwards it
}
function Sidebar({ theme }) {
  return <ThemeToggle theme={theme} />   // same here
}
\`\`\`

Recall module 3's brief introduction to this exact problem: \`theme\` has to be threaded through \`Dashboard\` and \`Sidebar\`, neither of which actually use it, purely to reach a deeply nested component that does. For a handful of levels this is merely annoying — for a value needed broadly across an app (a theme, the current logged-in user, a language preference), it becomes genuinely unmanageable.

### Creating and providing a context

\`\`\`jsx
import { createContext, useContext, useState } from "react"

const ThemeContext = createContext(null)

function App() {
  const [theme, setTheme] = useState("light")

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  )
}
\`\`\`

\`createContext(defaultValue)\` creates a **context object** — think of it as a named channel that any descendant component can tap into directly, bypassing every level in between. Wrapping part of the component tree in \`<ThemeContext.Provider value={...}>\` makes that specific \`value\` available to **every** component nested anywhere inside it, no matter how deep.

### Consuming a context: useContext

\`\`\`jsx
function Dashboard() {
  return <Sidebar />   // no "theme" prop at all — Dashboard doesn't even know it exists
}

function Sidebar() {
  return <ThemeToggle />
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)   // reaches DIRECTLY into the Provider above, skipping levels
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  )
}
\`\`\`

\`useContext(ThemeContext)\` reads the current value from the **nearest** \`<ThemeContext.Provider>\` above it in the tree — \`Dashboard\` and \`Sidebar\` no longer need to know anything about \`theme\` at all, since \`ThemeToggle\` reaches directly into the context, regardless of how many components sit between it and the \`Provider\`.

### Every consumer re-renders when the context value changes

\`\`\`jsx
<ThemeContext.Provider value={{ theme, setTheme }}>
  {/* EVERY component anywhere inside here that calls useContext(ThemeContext) re-renders
      whenever "theme" changes, even ones that only read setTheme and never actually display theme */}
</ThemeContext.Provider>
\`\`\`

This is a genuinely important performance consideration, worth knowing even at this introductory stage (module 12 covers it in more depth): every component consuming a given context re-renders whenever that context's value changes, regardless of which specific part of the value that component actually uses. For a value that changes frequently and has many consumers, this can become a real performance concern — module 14 covers the practical alternatives once that becomes a genuine problem.

### The custom-hook wrapper pattern: a common, worthwhile convention

\`\`\`jsx
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()   // cleaner call site, with a helpful error if misused
}
\`\`\`

Wrapping \`useContext(ThemeContext)\` in a small custom hook (directly applying the previous module's custom-hooks lesson) is a near-universal convention — it gives a cleaner call site, and lets you add a helpful runtime error if the hook is accidentally used outside its intended \`Provider\`, rather than silently receiving the (often \`null\`) default value passed to \`createContext\`.

### Context is for genuinely global-ish, infrequently-changing data

The best-suited data for context: authentication state (the current user), theme, language/locale preference, and similar values needed broadly across an app but that don't change on every keystroke. Context is **not** a wholesale replacement for prop passing generally, nor a state-management solution for everything — reach for it specifically to solve genuine prop-drilling pain for broadly-needed, relatively stable data, covered in contrast with dedicated state-management libraries in module 14.

> **Key idea:** \`createContext\` + a \`Provider\` makes a value available to any descendant, however deeply nested, without threading it through every intermediate component's props — \`useContext\` reads the nearest matching \`Provider\`'s value, but every consumer re-renders on any change to that value, which is why context suits broadly-needed, infrequently-changing data rather than everything.`,
    },
    {
      name: "Combining useReducer and useContext",
      minutes: 8,
      intro: "A lightweight, built-in pattern for sharing complex state and its update logic across an app.",
      content: `### The combination: a reducer's state and dispatch, shared via context

\`\`\`jsx
import { createContext, useContext, useReducer } from "react"

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.item] }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    default:
      return state
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
\`\`\`

This directly combines the previous two lessons: \`useReducer\` centralizes *how* state changes (the reducer function), and \`useContext\` makes that state — and the \`dispatch\` function to trigger changes — available to any component in the tree, without prop drilling. This is a genuinely common, real pattern for medium-sized applications: a self-contained "provider" component wrapping a reducer and exposing it through a custom hook.

### Using it from anywhere in the tree

\`\`\`jsx
function App() {
  return (
    <CartProvider>
      <ProductList />
      <CartSummary />
    </CartProvider>
  )
}

function ProductList() {
  const { dispatch } = useCart()
  return <button onClick={() => dispatch({ type: "ADD_ITEM", item: { id: 1, price: 10 } })}>Add to cart</button>
}

function CartSummary() {
  const { state } = useCart()
  return <p>{state.items.length} items in cart</p>
}
\`\`\`

\`ProductList\` and \`CartSummary\` are siblings, with no direct relationship to each other — yet both can read and update the exact same shared cart state, purely through \`useCart()\`, with zero props passed between them or from any common ancestor. This is precisely the payoff of combining these two hooks: shared, centrally-managed state, accessible anywhere, without the prop-drilling problem module 3 first introduced.

### Splitting state and dispatch into two separate contexts, as an optimization

\`\`\`jsx
const CartStateContext = createContext(null)
const CartDispatchContext = createContext(null)

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}
\`\`\`

Recall the previous lesson's re-render caveat: every consumer of a context re-renders whenever its value changes. \`dispatch\` itself never actually changes between renders (React guarantees this) — but bundled together with \`state\` in a single context object (as in the first example), a *new* wrapping object is created every render regardless, causing every consumer to re-render even ones that only need \`dispatch\` and never read \`state\` at all. Splitting into two separate contexts lets a component that only needs to *dispatch* actions (like \`ProductList\` above) subscribe only to \`CartDispatchContext\`, avoiding re-renders caused by \`state\` changes it never actually reads.

### When this pattern is (and isn't) enough

For small-to-medium applications, \`useReducer\` + \`useContext\` is a genuinely solid, entirely built-in state-management solution — no extra dependency required. It starts to show real limitations at larger scale: every consumer of a given context still re-renders on any change to that context's value (even split, as above, this only goes so far), and there's no built-in equivalent to some libraries' developer tools for time-travel debugging or inspecting action history. Module 14 covers exactly where this pattern's limits are, and what dedicated state-management libraries (Redux, Zustand) offer beyond it — introduced there specifically once you understand what problem they're solving, rather than reached for by default from the start.

> **Key idea:** \`useReducer\` (centralized state transitions) combined with \`useContext\` (broad availability without prop drilling) is a genuinely solid, fully built-in pattern for shared application state at small-to-medium scale — splitting state and dispatch into separate contexts is a real, common optimization once the re-render cost of a combined context becomes measurable.`,
    },
    {
      name: "useReducer vs useState: A Practical Decision Guide",
      minutes: 7,
      intro: "Putting the two side by side, with concrete examples, to build real intuition for choosing between them.",
      content: `### Side by side: the same feature, both ways

\`\`\`jsx
// useState version
function Form() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})

  function handleSubmit() {
    const newErrors = {}
    if (!name) newErrors.name = "Required"
    if (!email) newErrors.email = "Required"
    setErrors(newErrors)
  }
}

// useReducer version
function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "SET_ERRORS":
      return { ...state, errors: action.errors }
    default:
      return state
  }
}

function Form() {
  const [state, dispatch] = useReducer(formReducer, { name: "", email: "", errors: {} })
}
\`\`\`

For a case this simple — three independent-ish values, one straightforward validation step — \`useState\` is genuinely the more direct, readable choice; the reducer version adds a layer of indirection (actions, a switch statement) that doesn't pay for itself here. This is worth demonstrating explicitly: \`useReducer\` is not automatically "the more advanced, therefore better" choice.

### A case where useReducer genuinely earns its complexity

\`\`\`jsx
function todosReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { id: Date.now(), text: action.text, done: false }]
    case "TOGGLE":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case "DELETE":
      return state.filter((t) => t.id !== action.id)
    case "CLEAR_COMPLETED":
      return state.filter((t) => !t.done)
    default:
      return state
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todosReducer, [])

  return (
    <div>
      <button onClick={() => dispatch({ type: "ADD", text: "New task" })}>Add</button>
      {todos.map((todo) => (
        <div key={todo.id}>
          <span onClick={() => dispatch({ type: "TOGGLE", id: todo.id })}>{todo.text}</span>
          <button onClick={() => dispatch({ type: "DELETE", id: todo.id })}>Delete</button>
        </div>
      ))}
      <button onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}>Clear completed</button>
    </div>
  )
}
\`\`\`

Here, every operation transforms the *same* array in a related way (add, toggle, remove, filter) — with plain \`useState\`, each handler would need to independently reimplement its own array-transformation logic inline. Centralizing all four transformations in one \`todosReducer\` makes every possible state change readable in one place, and makes each transformation independently testable by simply calling \`todosReducer(sampleState, action)\` and checking the result — no component rendering required at all.

### A concrete decision checklist

- **Few, independent state values, simple updates** → \`useState\`. (The form example above.)
- **One state value, multiple different ways to transform it** → \`useReducer\`. (The todos example above.)
- **The next state depends on carefully considering several pieces of the current state together** → \`useReducer\` — the functional updater form of \`useState\` (module 4) only receives the *previous value of that one piece of state*, not the whole picture.
- **You want the update logic testable independently of any component rendering** → \`useReducer\`'s pure reducer function is trivially testable in isolation; testing a \`useState\`-based handler generally requires rendering the component and simulating an interaction (covered in module 13).
- **Needs to be shared broadly across the component tree** → either works, but \`useReducer\` pairs especially naturally with \`useContext\` (previous lesson), since \`dispatch\` is a single, stable function reference that can represent every possible update.

> **Key idea:** neither hook is objectively "better" — \`useState\` remains the simpler, more direct choice for independent, straightforwardly-updated values, and \`useReducer\` earns its added structure specifically when multiple related transformations act on the same state, or when centralized, independently-testable update logic is genuinely valuable.`,
    },
  ],
}
