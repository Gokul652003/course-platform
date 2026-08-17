import type { Module } from "../types"

export const reactModule5: Module = {
  id: 5,
  title: "useEffect & Side Effects",
  status: "upcoming",
  lessons: [
    {
      name: "What is a Side Effect, and Why useEffect Exists",
      minutes: 9,
      intro: "The category of code that doesn't belong directly in a component's render logic.",
      content: `### Rendering should be pure — but real apps need to talk to the outside world

\`\`\`jsx
function UserProfile({ userId }) {
  // WRONG: fetching data directly in the component body
  fetch(\`/api/users/\${userId}\`).then((res) => res.json())
  // this re-runs the fetch on EVERY single render, including ones caused by unrelated state changes,
  // and there's nowhere to even put the result — the component body isn't allowed to have its own state here
  return <div>Loading...</div>
}
\`\`\`

A component's function body should ideally be **pure** — given the same props and state, it should always produce the same JSX, with no side effects (recall this platform's JavaScript course's discussion of pure functions in the higher-order-functions lesson). But real applications constantly need to do things that *aren't* pure: fetching data, setting up a subscription, manually interacting with a non-React library, reading/writing \`localStorage\`. These are called **side effects**, and React needs a deliberate, controlled place for them — outside of rendering itself.

### useEffect: running code after a render completes

\`\`\`jsx
import { useState, useEffect } from "react"

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then((data) => setUser(data))
  }, [userId])

  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
\`\`\`

\`useEffect(setupFunction, dependencies)\` tells React: after this component renders (and the DOM is actually updated), run \`setupFunction\`. Unlike code directly in the component body, an effect runs **after** rendering, as a distinctly separate step — and, as the next lesson covers, it only re-runs when something in its dependency array actually changes, not on every single render.

### The three parts of useEffect

\`\`\`jsx
useEffect(() => {
  // 1. the effect itself — runs after the render commits
  console.log("Effect ran")

  return () => {
    // 2. an OPTIONAL cleanup function — covered fully in lesson 3
    console.log("Cleanup ran")
  }
}, [/* 3. the dependency array — covered fully in lesson 2 */])
\`\`\`

This lesson's examples use just the first part; the next two lessons cover the dependency array and cleanup function in the depth they deserve, since getting them wrong is where the vast majority of real \`useEffect\` bugs come from.

### Effects run after the browser has already painted

A genuinely important detail: an effect runs *after* React has already updated the real DOM and the browser has painted the new UI on screen — not before, and not synchronously as part of rendering. This is exactly why an effect is the right (and only correct) place for something like a \`fetch\` call: the UI can render its initial "loading" state immediately, without waiting for the effect's asynchronous work to complete.

### What genuinely counts as a side effect (and what doesn't)

\`\`\`jsx
// NOT a side effect — this is a pure computation, do it directly in the render body
function ProductList({ products }) {
  const total = products.reduce((sum, p) => sum + p.price, 0)   // fine, directly in the body
  return <p>Total: {total}</p>
}

// IS a side effect — reaching outside React (the DOM title, a browser API) belongs in useEffect
function PageTitle({ title }) {
  useEffect(() => {
    document.title = title
  }, [title])
  return null
}
\`\`\`

A genuinely common mistake in the opposite direction: reaching for \`useEffect\` for things that are actually just ordinary computation, which belong directly in the render body (or, as module 6 covers, in \`useMemo\`) — not everything needs an effect. The correct test: does this code need to reach *outside* React's own rendering (the network, browser APIs, a non-React library, timers)? If not, it almost certainly doesn't belong in \`useEffect\`.

> **Key idea:** a side effect is anything that reaches outside of pure rendering — network requests, subscriptions, manual DOM/browser API access — and \`useEffect\` is React's deliberate, controlled place for that code, running after a render actually commits to the screen, not during rendering itself.`,
    },
    {
      name: "The Dependency Array",
      minutes: 10,
      intro: "Controlling exactly when an effect re-runs — the single most common source of real useEffect bugs.",
      content: `### Three forms of the dependency array

\`\`\`jsx
useEffect(() => {
  console.log("Runs after EVERY render")
})

useEffect(() => {
  console.log("Runs ONLY after the first render")
}, [])

useEffect(() => {
  console.log("Runs after the first render, AND whenever userId changes")
}, [userId])
\`\`\`

- **No array at all** — the effect runs after every single render, with no exceptions. Rarely what you actually want.
- **An empty array \`[]\`** — the effect runs exactly once, after the component's first render, and never again (unless the component unmounts and mounts fresh). Commonly used for one-time setup, like fetching initial data.
- **An array with values \`[userId]\`** — the effect runs after the first render, and again any time any value *in that array* is different from its value on the previous render.

### How React decides "different": a straightforward comparison

\`\`\`jsx
useEffect(() => {
  console.log("re-fetching")
  fetchUser(userId)
}, [userId])
\`\`\`

Between renders, React compares each dependency to its previous value — for primitives (recall the JavaScript course's module 1/5: strings, numbers, booleans), this is a straightforward value comparison. \`userId\` changing from \`1\` to \`2\` re-runs the effect; \`userId\` staying \`1\` across a re-render (triggered by some unrelated state change elsewhere in the component) does **not** re-run it.

### The classic gotcha: an object or array as a dependency

\`\`\`jsx
function SearchResults({ query }) {
  const options = { caseSensitive: false }   // a NEW object, created fresh on every single render

  useEffect(() => {
    search(query, options)
  }, [query, options])   // options is a DIFFERENT reference every render -> the effect re-runs EVERY render!
}
\`\`\`

This connects directly to the JavaScript course's module 5 reference-vs-value lesson: \`options\` here is a brand-new object every render, so it never equals its "previous" value by reference — even though its *contents* never actually change. The effect ends up re-running on every single render, defeating the entire purpose of the dependency array. Module 6's \`useMemo\` is the direct fix for this specific problem — for now, the practical lesson is: **be careful including objects/arrays/functions created fresh inside the component body as dependencies**, since they almost always "look different" to React on every render.

### The ESLint rule that catches most dependency mistakes

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [])   // ESLint warning: React Hook useEffect has a missing dependency: 'userId'
}
\`\`\`

The \`eslint-plugin-react-hooks\` package (included by default in most modern React project setups, including Vite's React template) specifically flags a value used *inside* an effect that's missing from its dependency array — this exact case is a genuinely common, real bug: \`userId\` changing would never re-trigger the fetch, silently leaving \`user\` showing data for the *wrong*, stale \`userId\`. **Always let this lint rule guide the dependency array** rather than guessing or deliberately omitting dependencies to control timing — the next lesson covers the correct way to handle a case that genuinely needs different timing.

### "I only want this to run once" is often a sign of a different problem

\`\`\`jsx
// a common but often WRONG instinct: force an empty array to suppress the lint warning
useEffect(() => {
  fetchUser(userId).then(setUser)
  // eslint-disable-next-line
}, [])
\`\`\`

Deliberately silencing the dependency-array lint rule is a real, common anti-pattern — it almost always indicates the effect's *logic* needs rethinking (does it genuinely need to respond to \`userId\` changing, or is there a different, more specific event it should actually be tied to?), not that the linter is wrong. Treat a lint warning here as a signal to reconsider the effect, not an obstacle to suppress.

> **Key idea:** the dependency array controls exactly when an effect re-runs — no array means every render, \`[]\` means once, and a populated array means "whenever any of these specific values changes." Objects/arrays/functions created fresh on every render are a classic gotcha, since they never equal their previous reference — and the \`react-hooks\` ESLint rule reliably catches the single most common real mistake: a value used inside the effect but missing from the array.`,
    },
    {
      name: "Cleanup Functions",
      minutes: 8,
      intro: "Preventing memory leaks and stale work by tearing down what an effect set up.",
      content: `### The problem: an effect that sets something up needs to tear it down

\`\`\`jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    // if the component unmounts (is removed from the page), this interval keeps running FOREVER,
    // trying to update state on a component that no longer exists
  }, [])

  return <p>{seconds} seconds elapsed</p>
}
\`\`\`

Recall this platform's JavaScript course's module 12 memory-management lesson: an uncleared \`setInterval\` (or an un-removed event listener, or a subscription never unsubscribed from) is a real, common memory leak — and in React specifically, it can also cause "tried to update state on an unmounted component" warnings, since the interval keeps calling \`setSeconds\` on a component that's already gone.

### The fix: return a cleanup function from the effect

\`\`\`jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)   // runs when the component unmounts, or before the effect re-runs
    }
  }, [])

  return <p>{seconds} seconds elapsed</p>
}
\`\`\`

If the function passed to \`useEffect\` returns another function, React treats that returned function as **cleanup** — it runs automatically right before the component unmounts, correctly tearing down whatever the effect set up. This directly mirrors the JavaScript course's \`removeEventListener\`/\`clearInterval\` pairing lesson — the cleanup function is React's structured place to put exactly that teardown code.

### Cleanup also runs before the effect re-runs, not just on unmount

\`\`\`jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    console.log(\`Connecting to room \${roomId}...\`)
    const connection = createConnection(roomId)
    connection.connect()

    return () => {
      console.log(\`Disconnecting from room \${roomId}...\`)
      connection.disconnect()
    }
  }, [roomId])
}

// switching roomId from "general" to "random" logs, in order:
// "Disconnecting from room general..."
// "Connecting to room random..."
\`\`\`

This is genuinely important and easy to miss: cleanup doesn't only run when a component unmounts entirely — it also runs **every time the effect is about to re-run** (because a dependency changed), right before the new run starts. This is precisely what correctly tears down the *old* connection before setting up the *new* one — without cleanup, switching \`roomId\` would leave the old connection open forever while also opening a new one, a real, common bug in effects managing any kind of persistent connection or subscription.

### Cleaning up an event listener

\`\`\`jsx
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <p>Window width: {width}</p>
}
\`\`\`

The exact same \`addEventListener\`/\`removeEventListener\` pairing from the JavaScript course's module 12 — here, wired into React's effect lifecycle so the listener is added once (empty dependency array) and correctly removed when the component unmounts.

### The mental checklist: does this effect need cleanup?

If an effect's setup does any of the following, it almost certainly needs a matching cleanup function: starts a timer/interval, adds an event listener, opens a subscription or connection, or starts any process that would otherwise keep running (and keep referencing this component's state) after the component is gone. A simple one-off \`fetch\` (as in the previous lesson) generally doesn't need cleanup in the same way, though a more advanced pattern (covered in module 12) does address canceling an in-flight request specifically to avoid a related, different problem: a stale response arriving after a newer request has already started.

> **Key idea:** a function returned from an effect is its cleanup — it runs both when the component unmounts *and* right before the effect re-runs due to a changed dependency, which is exactly what correctly tears down old timers/listeners/connections before new ones are set up. Any effect that starts something ongoing (a timer, a listener, a subscription) needs a matching cleanup, mirroring the JavaScript course's memory-management lesson.`,
    },
    {
      name: "Common useEffect Pitfalls",
      minutes: 8,
      intro: "A practical checklist of the mistakes that account for most real-world useEffect bugs.",
      content: `### Pitfall 1: fetching data without handling the race condition

\`\`\`jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetchResults(query).then(setResults)
    // if query changes quickly (fast typing), an OLDER, slower request might resolve
    // AFTER a newer one, overwriting fresher results with stale data
  }, [query])
}
\`\`\`

If \`query\` changes before a previous \`fetch\` has resolved, there's no guarantee the requests resolve in the order they were sent — a fast-typing user can end up seeing results for an old, already-abandoned query, if that older request happens to finish last. The fix uses cleanup (from the previous lesson) as a cancellation flag:

\`\`\`jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    let isCancelled = false

    fetchResults(query).then((data) => {
      if (!isCancelled) {
        setResults(data)
      }
    })

    return () => {
      isCancelled = true   // if a NEWER effect run starts before this one's fetch resolves, ignore the stale result
    }
  }, [query])
}
\`\`\`

### Pitfall 2: an infinite re-render loop

\`\`\`jsx
function BrokenCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)   // updates state -> triggers a re-render -> effect runs again -> updates state -> ...
  })   // no dependency array at all — runs after EVERY render, including the one it just caused!

  return <p>{count}</p>
}
\`\`\`

Setting state unconditionally inside an effect with no dependency array (or with a dependency array that includes the very state being updated, without a real terminating condition) creates a genuine infinite loop: the state update triggers a re-render, which re-runs the effect, which updates state again, forever. React will eventually throw an error protecting against this, but it's a real, common early mistake worth recognizing on sight.

### Pitfall 3: reaching for useEffect to sync two pieces of state

\`\`\`jsx
// AVOID: an unnecessary effect just to keep two state values in sync
function Form() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [fullName, setFullName] = useState("")

  useEffect(() => {
    setFullName(\`\${firstName} \${lastName}\`)
  }, [firstName, lastName])
}

// PREFER: just compute it directly during render — no effect, no extra state, no extra re-render
function Form() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const fullName = \`\${firstName} \${lastName}\`   // a plain derived value, recomputed each render
}
\`\`\`

This is a genuinely common over-use of \`useEffect\`: \`fullName\` doesn't need to be its own piece of state *or* an effect at all — it can be computed directly, as an ordinary expression, every time the component renders. Reaching for an effect here adds an unnecessary extra re-render (the effect runs *after* the first render, then calls \`setFullName\`, triggering a *second* render) for something that could've been correct on the very first render. The general rule: if a value can be computed directly from existing props/state, compute it directly — don't store it as separate state kept "in sync" via an effect.

### Pitfall 4: an effect that should really be an event handler

\`\`\`jsx
// AVOID: using an effect to respond to a specific user action
function ProductPage({ product }) {
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (addedToCart) {
      showNotification(\`Added \${product.name} to cart\`)
    }
  }, [addedToCart, product])
}

// PREFER: put the logic directly in the event handler that actually causes it
function ProductPage({ product }) {
  function handleAddToCart() {
    addToCart(product)
    showNotification(\`Added \${product.name} to cart\`)
  }
  return <button onClick={handleAddToCart}>Add to cart</button>
}
\`\`\`

If a piece of logic only needs to run in response to a specific user action (a click, a form submission), it belongs directly in that action's event handler — not in an effect watching for a state change that the action happens to cause. Using an effect here adds an indirect, harder-to-trace path (click → state change → effect notices the change → runs logic) for something that could be one direct, clear line in the handler itself.

> **Key idea:** the recurring theme across these pitfalls is the same: \`useEffect\` is specifically for synchronizing a component with something *outside* React (a fetch, a subscription, a browser API) — reaching for it to compute a derived value, or to respond to a specific action that already has a clear handler, is a common, avoidable source of unnecessary complexity and extra re-renders.`,
    },
  ],
}
