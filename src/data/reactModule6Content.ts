import type { Module } from "../types"

export const reactModule6: Module = {
  id: 6,
  title: "Refs & Performance Hooks",
  status: "upcoming",
  lessons: [
    {
      name: "useRef: A Value That Doesn't Trigger Re-renders",
      minutes: 9,
      intro: "A box for holding a mutable value across renders, without the re-rendering behavior of useState.",
      content: `### The problem: sometimes you need a mutable value, but not a re-render

\`\`\`jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)
  let intervalId = null   // WRONG: recreated as null on every single render, losing the reference

  function start() {
    intervalId = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  function stop() {
    clearInterval(intervalId)   // this "intervalId" is from the CURRENT render's closure — often stale
  }
}
\`\`\`

Recall module 4's introduction to \`useState\`: a plain variable resets on every render. But \`useState\` isn't the right fix here either — \`intervalId\` isn't something that should ever appear in the rendered UI, so triggering a re-render every time it changes would be wasteful and pointless.

### useRef: persists across renders, without causing a re-render

\`\`\`jsx
import { useRef } from "react"

function Timer() {
  const [seconds, setSeconds] = useState(0)
  const intervalIdRef = useRef(null)

  function start() {
    intervalIdRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  function stop() {
    clearInterval(intervalIdRef.current)
  }

  return (
    <div>
      <p>{seconds}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}
\`\`\`

\`useRef(initialValue)\` returns a plain object with a single mutable property, \`.current\`, initialized to \`initialValue\`. Unlike \`useState\`, **changing \`.current\` does not trigger a re-render** — and unlike a plain variable, the *same* ref object persists across every render of that component instance, so \`.current\`'s value is never lost.

### The two rules of useRef, stated precisely

- Mutating \`ref.current\` does **not** cause a re-render — use it for values the UI doesn't need to visually reflect.
- The ref object itself is stable across renders — the same object, every time, so mutating \`.current\` is always safe and always visible on the next render, unlike a plain variable that resets.

### A common use case: storing a previous value

\`\`\`jsx
function Component({ value }) {
  const previousValueRef = useRef(value)

  useEffect(() => {
    console.log(\`Changed from \${previousValueRef.current} to \${value}\`)
    previousValueRef.current = value
  }, [value])
}
\`\`\`

Because a ref survives across renders without resetting, it's a genuine, common pattern for remembering "what was this value last time," to compare against the current one — something \`useState\` could technically also do, but at the cost of an unnecessary extra re-render every time you updated it.

### When to reach for useRef vs useState — the deciding question

Ask: **does the UI need to visually change when this value changes?** If yes, it belongs in \`useState\` — that's the entire mechanism that causes React to re-render and reflect the new value on screen. If no — it's bookkeeping the component needs internally, but never displays directly — \`useRef\` is the correct, more efficient tool, since it avoids triggering re-renders the UI doesn't actually need.

### The other major use of useRef: accessing a real DOM node — covered next lesson

\`\`\`jsx
function TextInput() {
  const inputRef = useRef(null)
  return <input ref={inputRef} />
}
\`\`\`

Beyond storing arbitrary mutable values, \`useRef\` has a second, extremely common use: getting a direct handle to an actual DOM element, to call its native methods (like \`.focus()\`) imperatively — this is significant enough to warrant its own full lesson, next.

> **Key idea:** \`useRef\` gives you a stable, mutable \`.current\` box that persists across renders without triggering one — the deciding question for \`useRef\` vs \`useState\` is simply whether the UI needs to visually reflect the value changing; if not, \`useRef\` avoids an unnecessary re-render.`,
    },
    {
      name: "Accessing the DOM with Refs",
      minutes: 8,
      intro: "The escape hatch for imperatively controlling a real DOM element, when declarative props aren't enough.",
      content: `### Attaching a ref to a DOM element

\`\`\`jsx
import { useRef } from "react"

function TextInput() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current.focus()
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus the input</button>
    </div>
  )
}
\`\`\`

Passing a ref object to an element's \`ref\` prop tells React: once this element is actually created in the DOM, set \`ref.current\` to point directly at it. From then on, \`inputRef.current\` **is** the real \`<input>\` DOM node — with every native method and property a plain \`document.querySelector(...)\`-obtained element would have (\`.focus()\`, \`.value\`, \`.scrollIntoView()\`, and more).

### This is an intentional escape hatch, not the default way to work with the DOM

Recall module 1's core idea: React's whole model is *describing* UI declaratively, not manually manipulating the DOM. Refs exist specifically for the handful of cases that genuinely can't be expressed declaratively — managing focus, measuring an element's size, triggering a native animation, integrating a non-React library that expects a real DOM node. **Reaching for a ref to do something a prop could do declaratively instead is a real anti-pattern** — for instance, using a ref to read an input's value imperatively when a controlled input (module 4) would be the more idiomatic, React-appropriate approach.

### Common, legitimate use cases

\`\`\`jsx
// managing focus
function SearchBox() {
  const inputRef = useRef(null)
  useEffect(() => {
    inputRef.current.focus()   // focus the input automatically when this component first mounts
  }, [])
  return <input ref={inputRef} />
}

// measuring an element
function ResizableBox() {
  const boxRef = useRef(null)
  function logSize() {
    console.log(boxRef.current.getBoundingClientRect())
  }
  return <div ref={boxRef}>Content</div>
}

// scrolling an element into view
function ChatMessages({ messages }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  return (
    <div>
      {messages.map((m) => <p key={m.id}>{m.text}</p>)}
      <div ref={bottomRef} />
    </div>
  )
}
\`\`\`

All three are genuine, common, idiomatic uses: none of them are things props/state could naturally express — they're all fundamentally about the actual, physical DOM element (its focus state, its size, its scroll position), not about the UI's logical content or appearance.

### Refs are null until the component actually renders

\`\`\`jsx
function Example() {
  const ref = useRef(null)
  console.log(ref.current)   // null — during the render itself, the DOM node doesn't exist yet

  useEffect(() => {
    console.log(ref.current)   // the actual DOM element — refs are only guaranteed set AFTER rendering
  }, [])

  return <div ref={ref} />
}
\`\`\`

This connects directly to module 5's ordering lesson: refs to DOM elements are only reliably populated **after** rendering completes and React has actually created the real DOM node — reading \`ref.current\` during the render itself (rather than inside an effect or an event handler, both of which run after rendering) will see \`null\`.

### forwardRef: passing a ref through to a custom component

\`\`\`jsx
import { forwardRef } from "react"

const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy-input" {...props} />
})

function Form() {
  const inputRef = useRef(null)
  return <FancyInput ref={inputRef} />
}
\`\`\`

Recall module 3's rule: \`ref\` (like \`key\`) is special, reserved metadata — a custom component doesn't receive it as an ordinary prop by default. \`forwardRef\` is React's mechanism for explicitly opting a component into forwarding a \`ref\` through to one of its own internal DOM elements — necessary whenever you want a reusable, wrapped component (like a styled \`FancyInput\`) to still support the same \`ref\`-based DOM access as a plain \`<input>\` would.

> **Key idea:** a ref attached to a DOM element via the \`ref\` prop gives direct, imperative access to the real element after it renders — a deliberate escape hatch for cases (focus, measurement, scrolling, third-party library integration) that can't be expressed declaratively, not a default replacement for props/state. \`forwardRef\` is what lets a custom component support being given a ref the same way a plain DOM element does.`,
    },
    {
      name: "useMemo & useCallback",
      minutes: 10,
      intro: "Caching an expensive computed value or a stable function reference between renders.",
      content: `### The problem: recomputing something expensive on every render

\`\`\`jsx
function ProductList({ products, filter }) {
  const filteredProducts = products.filter((p) => p.category === filter)
  // this re-runs the ENTIRE filter operation on every single render,
  // even one caused by something completely unrelated, like an unrelated piece of state changing
  return <ul>{filteredProducts.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
\`\`\`

Recall module 4: every state update re-renders the component, re-running its entire function body from scratch — including any computation inside it, regardless of whether the inputs to that computation actually changed. For a cheap operation (like this small \`.filter()\`), that's completely fine, and worrying about it would be a wasted effort. For a genuinely expensive computation on a large dataset, recomputing it on every unrelated re-render is real, avoidable wasted work.

### useMemo: caching a computed value

\`\`\`jsx
import { useMemo } from "react"

function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.category === filter)
  }, [products, filter])

  return <ul>{filteredProducts.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
\`\`\`

\`useMemo(computeFunction, dependencies)\` only re-runs \`computeFunction\` when one of the values in \`dependencies\` has actually changed since the last render (recall module 5's dependency-array comparison rules — the same mechanism applies here) — otherwise, it returns the **cached** result from the previous render, skipping the computation entirely.

### This directly solves module 5's object-dependency gotcha

\`\`\`jsx
function SearchResults({ query }) {
  const options = useMemo(() => ({ caseSensitive: false }), [])   // now a STABLE reference across renders

  useEffect(() => {
    search(query, options)
  }, [query, options])   // options no longer changes reference every render -> effect only re-runs when query does
}
\`\`\`

Recall module 5's lesson on why an object recreated fresh every render breaks a dependency array — \`useMemo\` is the direct, correct fix: it returns the *same* object reference across renders (as long as its own dependencies haven't changed), so it can safely appear in another hook's dependency array without causing it to fire on every single render.

### useCallback: the same idea, specifically for functions

\`\`\`jsx
import { useCallback } from "react"

function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("")

  const handleSubmit = useCallback(() => {
    onSearch(query)
  }, [query, onSearch])

  return <ChildComponent onSubmit={handleSubmit} />
}
\`\`\`

\`useCallback(fn, dependencies)\` is functionally equivalent to \`useMemo(() => fn, dependencies)\` — it returns a stable *function reference* across renders, rather than recreating a brand-new function (a new reference, per the JavaScript course's module 5) on every single render. This matters for the exact same reason as \`useMemo\`: passing an unstable function reference as a prop or effect dependency causes downstream re-renders or re-running effects unnecessarily.

### These are performance optimizations — not required by default

\`\`\`jsx
// for most components, this is completely fine, and adding useMemo would be unnecessary complexity:
function ProductList({ products, filter }) {
  const filteredProducts = products.filter((p) => p.category === filter)
  return <ul>{filteredProducts.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
\`\`\`

This is genuinely important to internalize: \`useMemo\`/\`useCallback\` are **not** something to reach for by default on every computation or function in every component. They have their own real cost (React still has to check the dependency array every render) and add genuine complexity to the code. Reach for them specifically when: a computation is measurably expensive, or a value/function needs a stable reference specifically because it's used in another hook's dependency array or passed to a memoized child component (covered next lesson) — not as a reflexive habit applied everywhere.

### A quick reference

| Hook | Caches | Use when |
|---|---|---|
| \`useMemo\` | A computed **value** | An expensive computation, or a stable object/array reference needed elsewhere |
| \`useCallback\` | A **function** reference | A stable function reference needed as a dependency or a memoized child's prop |

> **Key idea:** \`useMemo\`/\`useCallback\` skip recomputation by returning a cached value/function reference when their dependencies haven't changed — genuinely useful for expensive computations and for providing stable references to other hooks or memoized children, but real, avoidable overhead when reached for reflexively on cheap, ordinary computations.`,
    },
    {
      name: "React.memo & Understanding Re-renders",
      minutes: 9,
      intro: "Why a component re-renders in the first place, and the tool for preventing an unnecessary one.",
      content: `### The default rule: a parent re-rendering re-renders every child

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild />   {/* re-renders every time count changes, even though it uses NONE of that state */}
    </div>
  )
}

function ExpensiveChild() {
  console.log("ExpensiveChild rendered")   // logs on EVERY click, despite receiving no props at all
  return <p>I'm expensive to render</p>
}
\`\`\`

This is a genuinely important, sometimes surprising default: when a component re-renders, React re-renders **every child in its returned JSX**, regardless of whether that child's own props actually changed — \`ExpensiveChild\` here receives no props at all, and still re-renders every single time \`App\`'s \`count\` changes, purely because it's rendered inside \`App\`.

### React.memo: skip a re-render if props haven't changed

\`\`\`jsx
import { memo } from "react"

const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  console.log("ExpensiveChild rendered")
  return <p>{data}</p>
})
\`\`\`

Wrapping a component in \`memo(...)\` tells React: before re-rendering this component because its parent re-rendered, first compare its new props to its previous props — if every prop is identical (compared with \`===\`, the same reference-equality rule from the JavaScript course's module 5), **skip** re-rendering it entirely and reuse the previous render's output.

### The same reference-equality gotcha applies here too

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0)

  // WRONG: a new object every render defeats memo entirely
  return <ExpensiveChild config={{ theme: "dark" }} />
}

const ExpensiveChild = memo(function ExpensiveChild({ config }) {
  return <p>{config.theme}</p>
})
\`\`\`

This directly extends the previous lesson's \`useMemo\`/\`useCallback\` discussion: if \`App\` passes \`ExpensiveChild\` a prop that's a brand-new object/array/function on every render (like \`config={{ theme: "dark" }}\` above), \`memo\`'s prop comparison always sees a *different* reference, even if the contents are identical — completely defeating the optimization. Making \`ExpensiveChild\` actually benefit from \`memo\` here requires wrapping \`config\` in \`useMemo\` inside \`App\`, so it keeps a stable reference across renders.

### Profiling before optimizing: don't guess

\`\`\`
React DevTools -> Profiler tab -> record a session -> interact with the app -> stop recording
\`\`\`

Recall module 1's DevTools installation — the **Profiler** tab (part of React DevTools) records exactly which components rendered during a session, how long each took, and *why* each one re-rendered. Before reaching for \`memo\`/\`useMemo\`/\`useCallback\` anywhere, use the Profiler to confirm there's an actual, measurable problem — adding these optimizations speculatively, without evidence they're needed, is a genuinely common way to add real complexity for little or no real benefit, exactly as the previous lesson's closing point emphasized.

### The bigger picture: most components don't need this at all

For the overwhelming majority of components in a typical application, an "unnecessary" re-render costs a fraction of a millisecond — genuinely imperceptible, and not worth any optimization effort at all. \`memo\`/\`useMemo\`/\`useCallback\` earn their complexity specifically for components that are either measurably expensive to render (a large list, a complex chart) or that re-render at a very high frequency (something tied to a fast-changing value like scroll position or mouse movement). Default to simple, un-memoized code — reach for these tools only once profiling has shown a genuine, specific problem.

> **Key idea:** a re-rendering parent re-renders every child by default, regardless of whether that child's own props changed — \`React.memo\` skips a child's re-render when its props are reference-equal to the previous render, but only pays off when combined with stable references from \`useMemo\`/\`useCallback\`. Profile with React DevTools before reaching for any of these — most components never need them.`,
    },
  ],
}
