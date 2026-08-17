import type { Module } from "../types"

export const reactModule7: Module = {
  id: 7,
  title: "Custom Hooks",
  status: "upcoming",
  lessons: [
    {
      name: "The Rules of Hooks",
      minutes: 8,
      intro: "Two strict rules every hook — built-in or custom — must follow, and why they exist.",
      content: `### Rule 1: only call hooks at the top level

\`\`\`jsx
// WRONG — a hook inside a condition
function Component({ shouldTrack }) {
  if (shouldTrack) {
    useEffect(() => { trackPageView() }, [])   // NEVER do this
  }
}

// CORRECT — the hook is always called; the CONDITION lives inside it
function Component({ shouldTrack }) {
  useEffect(() => {
    if (shouldTrack) {
      trackPageView()
    }
  }, [shouldTrack])
}
\`\`\`

Never call a hook inside a condition, a loop, or a nested function — always call every hook unconditionally, at the top level of the component (or custom hook), on every single render. This feels like an arbitrary restriction until you understand the mechanism it protects, covered next.

### Why this rule exists: React tracks hooks by call order, not by name

\`\`\`jsx
function Component() {
  const [a, setA] = useState(0)     // React internally: "hook #1 -> this state slot"
  const [b, setB] = useState(0)      // React internally: "hook #2 -> this state slot"
  useEffect(() => {}, [])              // React internally: "hook #3 -> this effect slot"
}
\`\`\`

React doesn't identify each \`useState\`/\`useEffect\` call by variable name — it identifies them purely by the **order** they're called in, on every render. If a hook is conditionally skipped on one render but called on the next, every hook *after* it shifts by one position — React ends up matching \`b\`'s state to what it thought was \`a\`'s slot, silently corrupting state in a way that's genuinely confusing to debug. Calling every hook unconditionally, in the same order, every single render, is what keeps this internal bookkeeping correct.

### Rule 2: only call hooks from React functions

\`\`\`jsx
// WRONG — a hook called from a plain, non-component function
function formatDate(date) {
  const [locale] = useState("en-US")   // NEVER do this
  return date.toLocaleDateString(locale)
}

// CORRECT — called from an actual component (or a custom hook, covered next lesson)
function DateDisplay({ date }) {
  const [locale] = useState("en-US")
  return <p>{date.toLocaleDateString(locale)}</p>
}
\`\`\`

Hooks only work correctly when called from either a React component function, or another custom hook (covered in the next lesson) — never from a plain, ordinary JavaScript function, an event handler defined outside a component, or a class method. This connects directly to the previous point: React's internal call-order tracking is scoped specifically to a given component's render — calling a hook from unrelated code has no valid "slot" to attach to.

### The ESLint plugin that enforces both rules automatically

\`\`\`bash
# included by default in Vite's React template
\`\`\`

Exactly like module 5's \`eslint-plugin-react-hooks\` catching missing effect dependencies, the same plugin also enforces both rules of hooks directly in your editor — flagging a conditional hook call or a hook called from the wrong kind of function immediately, before it becomes a confusing runtime bug. In practice, you'll rarely violate these rules by accident once this lint rule is active; internalizing *why* the rules exist (not just that they exist) is what this lesson is really for.

### A common real-world trap: an early return before a hook

\`\`\`jsx
// WRONG — the early return means useEffect below it is sometimes skipped, sometimes not
function UserProfile({ user }) {
  if (!user) {
    return <p>No user</p>
  }
  useEffect(() => { document.title = user.name }, [user])   // conditionally reached — violates rule 1!
  return <p>{user.name}</p>
}

// CORRECT — every hook comes BEFORE any early return
function UserProfile({ user }) {
  useEffect(() => {
    if (user) {
      document.title = user.name
    }
  }, [user])

  if (!user) {
    return <p>No user</p>
  }
  return <p>{user.name}</p>
}
\`\`\`

This is a genuinely common, easy-to-miss violation: an early \`return\` placed *before* a hook call means that hook is sometimes called (when the condition is false) and sometimes skipped (when it's true) — exactly the conditional-call problem rule 1 forbids. The fix is always the same shape: **every hook call goes first, unconditionally, at the very top of the function** — any conditional logic (including early returns) comes after all hooks have already been called.

> **Key idea:** hooks must be called unconditionally, in the same order, every render, and only from component functions or other hooks — because React tracks each hook's state purely by call order, not by name, and breaking that order silently corrupts which state belongs to which \`useState\`/\`useEffect\` call. The \`react-hooks\` ESLint plugin enforces both rules automatically — trust it.`,
    },
    {
      name: "Building Your First Custom Hook",
      minutes: 9,
      intro: "Extracting reusable stateful logic into your own hook — the real reason hooks exist as a concept.",
      content: `### The problem: repeated stateful logic across components

\`\`\`jsx
function UserProfile({ userId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  // ...renders data/loading/error
}

function ProductList({ categoryId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // ...the EXACT same fetch-loading-error pattern, duplicated
}
\`\`\`

This is a genuinely common situation: the exact same combination of state and effect logic (fetch, track loading, track errors) repeated, nearly verbatim, across multiple components. Recall this platform's JavaScript course's module 3 on higher-order functions — the underlying instinct (extract repeated logic into a reusable function) is identical here; hooks just extend that idea to include *stateful* logic, not just plain computation.

### Extracting a custom hook: just a function that calls other hooks

\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}
\`\`\`

A **custom hook** is, at its core, nothing more than an ordinary JavaScript function that calls one or more built-in hooks (\`useState\`, \`useEffect\`, and so on) inside it — there's no special syntax, no registration step, nothing beyond a naming convention (covered next). Because it calls \`useState\`/\`useEffect\` internally, every rule from the previous lesson still applies to it exactly as if that logic were written directly inside a component.

### Using it: identical to using a built-in hook

\`\`\`jsx
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(\`/api/users/\${userId}\`)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  return <p>{user.name}</p>
}

function ProductList({ categoryId }) {
  const { data: products, loading } = useFetch(\`/api/products?category=\${categoryId}\`)

  if (loading) return <p>Loading...</p>
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
\`\`\`

Both components now share the identical underlying logic, written and maintained in exactly one place — \`useFetch\`. Each component gets its **own, independent** state from calling \`useFetch\` (recall module 4's lesson: every \`useState\` call is scoped to that specific call site) — \`UserProfile\`'s \`loading\` and \`ProductList\`'s \`loading\` are two completely separate pieces of state, even though they came from the same hook function.

### The naming convention: always start with "use"

\`\`\`jsx
function useFetch(url) { /* ... */ }      // correct — React and its tooling recognize this as a hook
function fetchData(url) { /* ... */ }       // WRONG name for something calling other hooks internally —
                                                // the linter can't verify the rules of hooks are followed
\`\`\`

This isn't just a style preference — the \`use\` prefix is how the ESLint rules-of-hooks plugin (from the previous lesson) actually **recognizes** a function as a hook, and therefore knows to check it for rule violations. A function that calls \`useState\`/\`useEffect\` internally but isn't named starting with \`use\` won't be checked correctly, and can silently violate the rules of hooks without any warning.

### Custom hooks return whatever shape makes sense

\`\`\`jsx
// an array, like useState itself
function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = () => setValue((v) => !v)
  return [value, toggle]
}

// an object, when there are more than two related values
function useFetch(url) {
  // ...
  return { data, loading, error }
}
\`\`\`

There's no fixed rule for a custom hook's return shape — an array (like \`useState\`'s own \`[value, setter]\`) reads well for exactly two closely related values; an object is generally clearer once there are three or more, since callers can destructure only the specific pieces they need, by name, rather than relying on positional order.

> **Key idea:** a custom hook is just an ordinary function, named starting with \`use\`, that calls other hooks internally to bundle reusable stateful logic — every call site gets its own independent state, exactly as if the logic were written directly in each component, but maintained in one shared place instead of duplicated.`,
    },
    {
      name: "Common Custom Hook Patterns",
      minutes: 8,
      intro: "A tour of genuinely useful custom hooks, and the patterns behind them.",
      content: `### useLocalStorage: syncing state with localStorage

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light")
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  )
}
\`\`\`

This combines module 4's lazy \`useState\` initializer (reading the initial value from \`localStorage\` only once) with module 5's effect-driven side effect (persisting every change back to \`localStorage\`) — from the outside, \`ThemeToggle\` uses it exactly like a plain \`useState\`, with persistence handled entirely inside the hook, invisible to the component using it.

### useDebounce: delaying a fast-changing value

\`\`\`jsx
function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timeoutId)   // module 5's cleanup: cancels the PREVIOUS timeout if value changes again
  }, [value, delayMs])

  return debouncedValue
}

function SearchBox() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery)   // only fires 500ms after the user STOPS typing, not on every keystroke
    }
  }, [debouncedQuery])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
\`\`\`

This directly applies module 5's cleanup-function lesson: every time \`value\` changes (the user types another character), the previous, not-yet-fired timeout is cancelled and a new one starts — only once the user pauses for the full \`delayMs\` does \`debouncedValue\` actually update, which is exactly what prevents \`searchAPI\` from firing on every single keystroke.

### useMediaQuery: reading a CSS media query as reactive state

\`\`\`jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    function handleChange(event) {
      setMatches(event.matches)
    }
    mediaQueryList.addEventListener("change", handleChange)
    return () => mediaQueryList.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  return isMobile ? <MobileNav /> : <DesktopNav />
}
\`\`\`

Another direct application of module 5's \`addEventListener\`/cleanup pairing — this time wrapping a browser API (\`matchMedia\`) that isn't naturally reactive on its own, turning it into a plain boolean that automatically triggers a re-render whenever the media query's match state changes.

### Custom hooks can call other custom hooks

\`\`\`jsx
function useDebouncedSearch(query, delayMs = 500) {
  const debouncedQuery = useDebounce(query, delayMs)
  const { data, loading } = useFetch(debouncedQuery ? \`/api/search?q=\${debouncedQuery}\` : null)
  return { results: data, loading }
}
\`\`\`

Custom hooks compose exactly like ordinary functions — \`useDebouncedSearch\` here combines \`useDebounce\` and the previous lesson's \`useFetch\` into one higher-level hook, without either of the two lower-level hooks needing to know anything about how they're being combined. This layering — small, focused hooks composed into larger, more specific ones — mirrors module 3's composition lesson for components, applied to logic instead of markup.

### Where to find well-tested hooks, rather than writing every one yourself

Libraries like \`usehooks-ts\` and \`react-use\` provide a large, well-tested collection of common custom hooks (debouncing, local storage, media queries, and dozens more) — genuinely worth reaching for in a real project rather than reimplementing every one from scratch, though understanding *how* they work (as this lesson covers) is what makes reading their source, or writing a genuinely custom one when nothing existing fits, straightforward.

> **Key idea:** custom hooks compose exactly like ordinary functions, and the genuinely useful ones almost always combine \`useState\` with an effect wrapping some external, non-React concern (storage, timing, a browser API) — turning something imperative and stateful into a plain, reusable, declarative value a component can just read.`,
    },
  ],
}
