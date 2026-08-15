import type { Module } from "../types"

export const reactModule4: Module = {
  id: 4,
  title: "State & Events",
  status: "upcoming",
  lessons: [
    {
      name: "useState: A Component's Own Memory",
      minutes: 10,
      intro: "The hook that lets a component remember a value between renders, and trigger a re-render when it changes.",
      content: `### Why a plain variable doesn't work

\`\`\`jsx
function Counter() {
  let count = 0   // this does NOT work as you'd expect

  function handleClick() {
    count = count + 1
    console.log(count)   // this DOES increase...
  }

  return <button onClick={handleClick}>Count: {count}</button>
  // ...but the displayed "Count: 0" NEVER updates on screen!
}
\`\`\`

This is worth understanding precisely, since it's the exact motivation for \`useState\`: every time a component re-renders, its function body runs again **from scratch** — \`count\` gets reset to \`0\` on every single call. Even though \`handleClick\` does mutate the local \`count\` variable, that mutation is invisible to React — nothing tells React it needs to re-run \`Counter\` and produce new JSX, so the screen never updates, even though the underlying variable technically changed.

### useState: the fix

\`\`\`jsx
import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
  }

  return <button onClick={handleClick}>Count: {count}</button>
}
\`\`\`

\`useState(initialValue)\` returns a pair: the current value, and a function to update it — destructured (recall the JavaScript course's array destructuring, module 6) as \`[count, setCount]\` by strong convention. Calling \`setCount(newValue)\` does two things: it tells React to remember this new value for \`count\` on the *next* render, and it triggers that re-render to actually happen — this time, \`Counter\`'s function body runs again, but \`useState(0)\` now returns the *updated* value instead of the original \`0\`, because React is tracking it outside the function itself.

### State persists across renders; a plain variable doesn't

The core distinction the previous two examples demonstrate: an ordinary \`let count = 0\` is recreated fresh every single render — React's \`useState\` is what actually persists a value *between* renders, specifically tied to that one component instance. This is genuinely the entire reason \`useState\` (and hooks generally) exist: plain JavaScript variables can't survive a function being called again from scratch, which is exactly what a re-render is.

### One component, multiple independent pieces of state

\`\`\`jsx
function ProfileForm() {
  const [name, setName] = useState("")
  const [age, setAge] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
    </div>
  )
}
\`\`\`

A component can call \`useState\` as many times as it needs — each call manages one independent piece of state, tracked separately by React. There's no rule against several \`useState\` calls in one component; splitting related-but-distinct values into separate state variables like this is the standard, idiomatic pattern (rather than bundling everything into one large state object, unless the values genuinely always change together).

### State is local to a specific component instance

\`\`\`jsx
function App() {
  return (
    <div>
      <Counter />
      <Counter />
    </div>
  )
}
\`\`\`

Recall module 1's introduction: each \`<Counter />\` here has its own, completely independent \`count\` — clicking one doesn't affect the other. This is a direct consequence of state being tied to a specific position in the component tree, not shared globally — a genuinely important property that makes components safely reusable without their internal state leaking into each other.

### Lazy initial state, for an expensive computation

\`\`\`jsx
function ExpensiveComponent() {
  const [data, setData] = useState(() => computeExpensiveInitialValue())
  // the function is only called ONCE, on the first render — not on every re-render
}
\`\`\`

Passing a **function** to \`useState\` (instead of a plain value) tells React to call it only on the component's very first render, to compute the initial value lazily — useful when computing the initial state is genuinely expensive, since a plain \`useState(computeExpensiveInitialValue())\` would call that function on *every* render, even though only the first call's result is ever actually used.

> **Key idea:** a plain variable resets every render because the whole function body re-runs from scratch — \`useState\` is what actually persists a value across renders and triggers a re-render when it changes, returned as a \`[value, setter]\` pair that's tied to that specific component instance, not shared globally.`,
    },
    {
      name: "Handling Events",
      minutes: 9,
      intro: "Responding to clicks, typing, and other user interaction — React's own event system, layered over the DOM's.",
      content: `### The basic pattern: an inline arrow function or a named handler

\`\`\`jsx
function Button() {
  return <button onClick={() => console.log("Clicked!")}>Click me</button>
}

function Button2() {
  function handleClick() {
    console.log("Clicked!")
  }
  return <button onClick={handleClick}>Click me</button>
}
\`\`\`

Recall module 1's naming convention (\`onClick\`, not \`onclick\`) — event handler props take a **function**, not the result of calling one. This is a genuinely common early mistake, worth flagging explicitly:

\`\`\`jsx
// WRONG: calls handleClick immediately during render, not on click!
<button onClick={handleClick()}>Click me</button>

// CORRECT: passes the function itself, to be called LATER, on the actual click
<button onClick={handleClick}>Click me</button>
\`\`\`

\`onClick={handleClick()}\` calls \`handleClick\` immediately, during rendering, and passes *its return value* as the handler — almost never what you actually want, and a direct, common source of "why does this run immediately instead of on click" bugs.

### Passing arguments to a handler

\`\`\`jsx
function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

Since \`onDelete(todo.id)\` directly would call it immediately (the exact mistake from the previous example), wrapping it in an inline arrow function (\`() => onDelete(todo.id)\`) is the standard way to pass a handler that needs specific arguments — the arrow function itself is what gets passed as \`onClick\`, and *it* calls \`onDelete\` with the right argument only when actually clicked.

### The event object

\`\`\`jsx
function Input() {
  function handleChange(event) {
    console.log(event.target.value)
  }
  return <input onChange={handleChange} />
}
\`\`\`

Every event handler receives an event object as its argument — \`event.target\` is the actual DOM element the event occurred on, and \`.value\` (for an \`<input>\`) is its current value. This is React's **SyntheticEvent** — a cross-browser-consistent wrapper around the browser's native event, with the exact same properties and methods (\`.preventDefault()\`, \`.stopPropagation()\`, \`.target\`) you'd expect from plain DOM event handling, but guaranteed to behave identically across every browser React supports.

### preventDefault: stopping a browser's default behavior

\`\`\`jsx
function SearchForm() {
  function handleSubmit(event) {
    event.preventDefault()   // stops the browser's default full-page-reload form submission
    console.log("Searching...")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Search</button>
    </form>
  )
}
\`\`\`

Without \`event.preventDefault()\`, submitting a \`<form>\` triggers the browser's native behavior — reloading the page and sending the data as a traditional HTTP request, which almost never matches how a React app is meant to handle a form (covered fully in module 9). Calling \`preventDefault()\` at the top of the handler is the standard first line for essentially every form's submit handler in React.

### Event handlers are just functions — they can call other functions

\`\`\`jsx
function LoginForm() {
  function validateInput(value) {
    return value.length > 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validateInput(someValue)) {
      console.log("Invalid input")
      return
    }
    console.log("Submitting...")
  }

  return <form onSubmit={handleSubmit}>...</form>
}
\`\`\`

Nothing exotic here — recall the JavaScript course's higher-order functions (module 3): an event handler is an ordinary function, free to call other ordinary functions, use conditionals, and do anything regular JavaScript logic can do. The "React-specific" part is purely the naming convention (\`onClick\`, \`onChange\`, \`onSubmit\`) and the SyntheticEvent object it receives — everything else is just JavaScript you already know.

> **Key idea:** event handler props take a function reference, not a function *call* — wrap it in an inline arrow function when you need to pass arguments. React's SyntheticEvent wraps the native browser event consistently across browsers, and \`event.preventDefault()\` is almost always the first line of a form's submit handler.`,
    },
    {
      name: "Controlled Inputs",
      minutes: 9,
      intro: "Making an input's value fully driven by React state, rather than the DOM's own internal state.",
      content: `### An uncontrolled input: the DOM manages its own value

\`\`\`jsx
function UncontrolledInput() {
  return <input type="text" />
}
\`\`\`

By default, an \`<input>\`'s value lives in the DOM itself, exactly as it would in plain HTML — you type, the browser updates what's displayed, and React knows nothing about the current value unless you specifically ask (via a ref, covered in module 6).

### A controlled input: React state is the single source of truth

\`\`\`jsx
function ControlledInput() {
  const [value, setValue] = useState("")

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}
\`\`\`

A **controlled** input's \`value\` is explicitly set from React state, and every keystroke calls \`onChange\`, which updates that state — the input's displayed value literally comes from \`value\`, the state variable, not from the DOM's own internal tracking. This might look redundant at first (why route every keystroke through state, just to display it back?) but it means React state is always, provably the *single source of truth* for what the input currently shows — genuinely valuable the moment you need to validate input, conditionally disable submission, or programmatically change the value from elsewhere in your code.

### Why this pattern matters: state drives everything else too

\`\`\`jsx
function SearchBox() {
  const [query, setQuery] = useState("")

  const isValid = query.length >= 3

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {!isValid && <p className="error">Search must be at least 3 characters</p>}
      <button disabled={!isValid}>Search</button>
    </div>
  )
}
\`\`\`

Because \`query\` is a plain state value (not something you'd have to reach into the DOM to read), it's trivial to derive other UI from it — an error message, a disabled button state — using the same conditional-rendering patterns from module 2. This is the real payoff of controlling an input: the current value is just a normal piece of state, usable anywhere else in the component exactly like any other variable.

### Controlled checkboxes and selects

\`\`\`jsx
function Settings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [plan, setPlan] = useState("free")

  return (
    <div>
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={(event) => setIsEnabled(event.target.checked)}
      />

      <select value={plan} onChange={(event) => setPlan(event.target.value)}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
    </div>
  )
}
\`\`\`

The pattern generalizes to other form elements: a checkbox uses \`checked\` (not \`value\`) and reads \`event.target.checked\` (a boolean, not a string); a \`<select>\` uses \`value\` exactly like a text input, matching one of its \`<option>\` values.

### A common mistake: forgetting onChange on a controlled input

\`\`\`jsx
// BROKEN: value is set, but nothing updates it — the input becomes permanently stuck/read-only!
function BrokenInput() {
  const [value] = useState("")
  return <input value={value} />   // React logs a warning: you provided a value without onChange
}
\`\`\`

If you set \`value\` without a corresponding \`onChange\`, the input becomes effectively frozen — every keystroke is immediately overridden back to the unchanging state value, since nothing ever calls a setter to update it. React specifically warns about this in the console, precisely because it's such a common, confusing mistake for anyone new to controlled inputs.

> **Key idea:** a controlled input's \`value\` comes directly from React state, with \`onChange\` updating that state on every keystroke — this makes state the single, reliable source of truth for the current value, which is what makes validation, conditional UI, and programmatic control straightforward. Forgetting the matching \`onChange\` is the classic mistake, producing an input that appears permanently frozen.`,
    },
    {
      name: "State Updates, Batching & Immutability",
      minutes: 9,
      intro: "The rules governing exactly when and how state actually changes — and the mistakes that violate them.",
      content: `### State updates are asynchronous — don't expect the new value immediately

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    console.log(count)   // still logs the OLD value — the update hasn't applied yet!
  }

  return <button onClick={handleClick}>Count: {count}</button>
}
\`\`\`

Calling \`setCount\` doesn't update \`count\` immediately, in place — it schedules an update, and the actual new value is only reflected the *next* time the component renders. Reading \`count\` on the very next line after calling \`setCount\` still sees the old value from this render — a genuinely common point of confusion for anyone expecting synchronous, immediate mutation.

### Batching: multiple state updates in one event handler, one re-render

\`\`\`jsx
function Example() {
  const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)

  function handleClick() {
    setCount(count + 1)
    setFlag(!flag)
    // React BATCHES these — the component re-renders ONCE with both changes applied,
    // not twice (once per setter call)
  }

  return <button onClick={handleClick}>{count} {flag ? "yes" : "no"}</button>
}
\`\`\`

React automatically **batches** multiple state updates that happen within the same event handler into a single re-render, rather than re-rendering once per \`set...\` call — a real, meaningful performance optimization, and the reason you generally don't need to worry about "too many" state updates inside one handler.

### The functional updater form: fixing stale-value bugs

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleTripleClick() {
    setCount(count + 1)   // all three calls close over the SAME count from this render
    setCount(count + 1)
    setCount(count + 1)
    // result: count only increases by 1, NOT 3!
  }

  return <button onClick={handleTripleClick}>Count: {count}</button>
}
\`\`\`

This is a genuinely important, subtle bug: because \`handleTripleClick\` is a closure (recall this platform's JavaScript course, module 4), all three \`setCount(count + 1)\` calls reference the *exact same* \`count\` value from this specific render — each one says "set it to \`0 + 1\`," not "increment whatever it currently is." The fix:

\`\`\`jsx
function handleTripleClick() {
  setCount((prev) => prev + 1)   // each call receives the LATEST pending value, not the stale render's count
  setCount((prev) => prev + 1)
  setCount((prev) => prev + 1)
  // result: count correctly increases by 3
}
\`\`\`

Passing a **function** to the setter (rather than a plain value) tells React "compute the new value based on whatever the most current pending value actually is," rather than the value captured in this render's closure — each call correctly builds on the previous one. **Use the functional form whenever a state update depends on the previous state** — this is a genuine, common source of real bugs, not just a stylistic preference.

### Never mutate state directly — always create a new value

\`\`\`jsx
function TodoList() {
  const [todos, setTodos] = useState([{ id: 1, text: "Learn React" }])

  function addTodo(text) {
    todos.push({ id: 2, text })   // WRONG — mutates the array directly; React won't detect this change!
    setTodos(todos)                  // passing the SAME array reference — React sees no difference, skips re-render

    setTodos([...todos, { id: 2, text }])   // CORRECT — a brand new array, via spread (JS course module 6)
  }
}
\`\`\`

This connects directly to the JavaScript course's module 5 reference-vs-value lesson: React decides whether to re-render partly by comparing whether the *new* state value is a different reference from the old one. Mutating an array or object in place and passing that same reference back to the setter means React sees an identical reference and may skip the update entirely — always create a new array/object (via spread, \`.map()\`, \`.filter()\`, from the JavaScript course's module 6) instead of mutating the existing one.

\`\`\`jsx
// updating one field of an object in state, immutably
const [user, setUser] = useState({ name: "Ada", age: 30 })
setUser({ ...user, age: 31 })   // a new object, with age overwritten — name is preserved via spread

// updating one item in an array of objects, immutably
const [todos, setTodos] = useState([{ id: 1, done: false }])
setTodos(todos.map((todo) => (todo.id === 1 ? { ...todo, done: true } : todo)))
\`\`\`

> **Key idea:** \`setState\` schedules an update rather than applying it immediately, and React batches multiple calls within one handler into a single re-render. Use the functional updater form (\`setCount(prev => prev + 1)\`) whenever a new state value depends on the previous one, and always create a new array/object rather than mutating state directly — React's re-render decision depends on detecting a genuinely new reference.`,
    },
  ],
}
