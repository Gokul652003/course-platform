import type { Module } from "../types"

export const reactModule10: Module = {
  id: 10,
  title: "Component Patterns & Composition",
  status: "upcoming",
  lessons: [
    {
      name: "Lifting State Up",
      minutes: 8,
      intro: "Moving state to the nearest common ancestor when two sibling components need to share it.",
      content: `### The problem: two sibling components need the same state

\`\`\`jsx
// BROKEN: each component has its OWN, independent state — they can never stay in sync
function TemperatureInput() {
  const [celsius, setCelsius] = useState(0)
  return <input value={celsius} onChange={(e) => setCelsius(e.target.value)} />
}

function App() {
  return (
    <div>
      <TemperatureInput />   {/* editing this... */}
      <TemperatureDisplay />   {/* ...has no way to affect this */}
    </div>
  )
}
\`\`\`

Recall module 1's lesson: each \`<TemperatureInput />\` instance has its own, fully independent state. If \`TemperatureDisplay\` needs to reflect what's typed into \`TemperatureInput\`, there's no direct way for two sibling components to communicate — neither can see or read the other's state.

### The fix: move the state up to their common parent

\`\`\`jsx
function App() {
  const [celsius, setCelsius] = useState(0)

  return (
    <div>
      <TemperatureInput celsius={celsius} onChange={setCelsius} />
      <TemperatureDisplay celsius={celsius} />
    </div>
  )
}

function TemperatureInput({ celsius, onChange }) {
  return <input value={celsius} onChange={(e) => onChange(e.target.value)} />
}

function TemperatureDisplay({ celsius }) {
  return <p>{celsius}°C is {(celsius * 9) / 5 + 32}°F</p>
}
\`\`\`

**Lifting state up** means moving a piece of state from a child component to the nearest common ancestor of every component that needs to read or update it — here, \`App\`. \`TemperatureInput\` and \`TemperatureDisplay\` are now both "dumb," fully controlled by props passed down from \`App\` (recall module 3's props lesson) — neither manages its own state at all, which is precisely what lets them stay perfectly in sync: they're both just rendering the *same* single source of truth.

### The general pattern: state lives as low as possible, but no lower than necessary

The practical rule of thumb: state should live in the lowest component that still contains **every** component that needs access to it. If only one component ever needs a value, keep it local to that component (module 4's default) — the moment a *second* component (a sibling, or anything not a descendant of the component currently holding the state) needs to read or affect that same value, lift it up to their nearest shared ancestor.

### A more realistic example: a filterable list

\`\`\`jsx
function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <ProductList searchTerm={searchTerm} />
    </div>
  )
}

function SearchBar({ searchTerm, onSearchChange }) {
  return <input value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
}

function ProductList({ searchTerm }) {
  const products = useProducts()   // a custom hook, module 7
  const filtered = products.filter((p) => p.name.includes(searchTerm))
  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
\`\`\`

\`SearchBar\` and \`ProductList\` are siblings, exactly like the temperature example — \`searchTerm\` lives in their shared parent, \`ProductPage\`, and flows down to both via props. This is genuinely one of the most common structural patterns in real React applications: a parent orchestrating shared state, with focused, mostly-stateless children beneath it.

### When lifting state up isn't enough: reaching for context instead

For state shared between components that are many levels apart (not just direct siblings), lifting state all the way up to a distant common ancestor can mean threading it back down through many intermediate components that don't use it themselves — exactly module 3's prop-drilling problem. That's precisely the situation module 8's \`useContext\` is built for — lifting state up and using context aren't competing techniques; context is really just "lifted state, made available without manually drilling it back down through every intermediate level."

> **Key idea:** when sibling components need to share or stay in sync with the same value, move that state up to their nearest common ancestor, and pass it back down as props — state should live in the lowest component that still contains every component that needs it, no higher, no lower.`,
    },
    {
      name: "Composition vs Configuration, Revisited",
      minutes: 8,
      intro: "A deeper look at building flexible components through composition, rather than an ever-growing prop list.",
      content: `### Recalling module 3's introduction

Module 3 introduced the core idea briefly: composing smaller components together via \`children\`, rather than configuring one large component with a growing list of boolean/variant props. This lesson goes deeper into *why* this matters and the concrete patterns it enables.

### The "slot" pattern: multiple named children positions

\`\`\`jsx
function PageLayout({ header, sidebar, children }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <div className="body">
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
    </div>
  )
}

function App() {
  return (
    <PageLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <MainContent />
    </PageLayout>
  )
}
\`\`\`

Recall module 3's \`children\` prop, and module 3's lesson on passing a component as a prop — combining both, a layout component can accept **several** distinct "slots" (here, \`header\` and \`sidebar\` as regular props, plus \`children\` for the main content), each independently filled in by whoever uses \`PageLayout\`, without \`PageLayout\` itself needing to know anything about what's actually inside any of them.

### Why this beats a giant configuration-prop component

\`\`\`jsx
// AVOID: PageLayout would need to know about every possible header/sidebar variant that could ever exist
function PageLayout({ headerType, sidebarType, showBreadcrumbs, ... }) {
  // an ever-growing, tangled mess of conditional rendering logic INSIDE PageLayout itself
}
\`\`\`

The slot-based version from the previous example never needs to change, no matter how many different kinds of headers or sidebars the app eventually has — each usage of \`PageLayout\` simply passes in whatever specific \`<Header />\`/\`<Sidebar />\` variant it needs. This is the concrete payoff of "composition over configuration": the layout component's *own* code never grows more complex as the app's needs grow; only the composition at each call site changes.

### Specialization through composition: building specific components from generic ones

\`\`\`jsx
function Dialog({ title, children, onClose }) {
  return (
    <div className="dialog">
      <div className="dialog-header">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>
      <div className="dialog-body">{children}</div>
    </div>
  )
}

// a MORE SPECIFIC component, built entirely through composition, no changes to Dialog itself
function ConfirmDeleteDialog({ onConfirm, onClose }) {
  return (
    <Dialog title="Delete item?" onClose={onClose}>
      <p>This action cannot be undone.</p>
      <button onClick={onConfirm}>Delete</button>
      <button onClick={onClose}>Cancel</button>
    </Dialog>
  )
}
\`\`\`

\`ConfirmDeleteDialog\` is a genuinely specific, purpose-built component — built entirely by *composing* the generic \`Dialog\` with specific content, rather than \`Dialog\` itself growing a \`variant="confirm-delete"\` prop with hardcoded internal logic for that one specific case. This is directly analogous to inheritance in class-based object-oriented languages, but React deliberately favors this composition-based approach over any equivalent to class inheritance — there is, notably, no "component inheritance" concept in React at all; composition covers every case inheritance would otherwise be reached for.

### A practical litmus test for "should this be a prop, or should this be composed?"

Ask: is this piece of content/UI something the component needs to deeply understand and make decisions based on (compute with, conditionally transform)? If so, a plain data prop (a string, a number, a boolean) is right. Is it just a piece of UI the component needs to render *somewhere*, without caring what's actually inside it? If so, \`children\` (or a named slot prop, as in the layout example) is the better fit — it keeps the component simpler and more broadly reusable, exactly as \`Dialog\` above never needed to know anything about the specific confirm/cancel buttons \`ConfirmDeleteDialog\` composed into it.

> **Key idea:** composing generic, "slot"-based components (via \`children\` and named JSX-element props) with specific content at each usage site scales far better than a single component configured via a growing list of variant/boolean props — this is React's deliberate alternative to class inheritance for building more specific components from general ones.`,
    },
    {
      name: "The Render Props Pattern",
      minutes: 7,
      intro: "Sharing logic between components by passing a function as a prop, rather than a plain value.",
      content: `### The problem: sharing stateful logic before custom hooks (context)

Before custom hooks (module 7) became the standard tool for sharing stateful logic, an older pattern called **render props** solved a closely related problem: a component encapsulates some logic and state, but instead of rendering fixed UI itself, it calls a function (passed to it as a prop) with that state, letting the *caller* decide exactly what UI to render with it.

### A render prop component

\`\`\`jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleMove(event) {
      setPosition({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return render(position)   // calls the function prop with the current state, and renders WHATEVER it returns
}

function App() {
  return (
    <MouseTracker render={(position) => (
      <p>Mouse is at ({position.x}, {position.y})</p>
    )} />
  )
}
\`\`\`

\`MouseTracker\` owns all the stateful logic (tracking the mouse position, via module 5's effect-and-cleanup pattern), but has no fixed rendering of its own — it calls the \`render\` prop function with its current state, and renders exactly whatever JSX that function returns. A completely different consumer could reuse the exact same \`MouseTracker\` logic while rendering something entirely different, just by passing a different \`render\` function.

### Using children as the render function — a common variant

\`\`\`jsx
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ...same effect as before...
  return children(position)   // children is a FUNCTION here, not JSX — an unusual but valid use of children
}

function App() {
  return (
    <MouseTracker>
      {(position) => <p>Mouse is at ({position.x}, {position.y})</p>}
    </MouseTracker>
  )
}
\`\`\`

This is functionally identical to the \`render\` prop version — it just uses \`children\` (recall module 3) as the function instead of a separately-named prop. Since \`children\` can be *any* value, including a function, this is a legitimate, if slightly unusual-looking, variant of the same pattern.

### Why custom hooks have mostly replaced this pattern

\`\`\`jsx
// the SAME logic, as a custom hook instead (module 7)
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  useEffect(() => {
    function handleMove(event) { setPosition({ x: event.clientX, y: event.clientY }) }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])
  return position
}

function App() {
  const position = useMousePosition()   // no wrapper component, no render-prop indirection, no extra nesting
  return <p>Mouse is at ({position.x}, {position.y})</p>
}
\`\`\`

Compare the two directly: the custom hook version needs no wrapper component at all, and no function-as-a-child indirection — \`App\` simply calls \`useMousePosition()\` and uses the result immediately. This is precisely why custom hooks have largely superseded render props for sharing *stateful logic* specifically: hooks accomplish the identical goal with meaningfully less nesting and boilerplate.

### Where render props (or the closely related "component with a function child") still show up

Some libraries — particularly ones needing to expose complex internal render-related state alongside specific DOM measurements or imperative behavior that doesn't fit cleanly into a hook's return value — still use this pattern (a well-known real example: some drag-and-drop and virtualization libraries). Recognizing it is worth this lesson's time even though you'll rarely write a fresh render-props component yourself in new code today, since custom hooks are almost always the better-fitting tool now.

> **Key idea:** render props share stateful logic by having a component call a function prop (or a function passed as \`children\`) with its internal state, letting the caller control the actual rendering — a genuinely important historical pattern, still occasionally seen in library code, but largely superseded by custom hooks (module 7) for new code, since hooks achieve the same sharing with far less nesting.`,
    },
    {
      name: "Compound Components",
      minutes: 8,
      intro: "A small set of components designed to work together, sharing implicit state through context.",
      content: `### The pattern, seen from the outside first

\`\`\`jsx
function App() {
  return (
    <Tabs defaultTab="profile">
      <Tabs.List>
        <Tabs.Tab id="profile">Profile</Tabs.Tab>
        <Tabs.Tab id="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="profile">Profile content</Tabs.Panel>
      <Tabs.Panel id="settings">Settings content</Tabs.Panel>
    </Tabs>
  )
}
\`\`\`

Notice how this reads: \`<Tabs>\` and its several sub-components (\`Tabs.List\`, \`Tabs.Tab\`, \`Tabs.Panel\`) work together as one cohesive unit, without needing to explicitly pass a bunch of shared state (which tab is currently active, a function to change it) as props between them — that coordination happens implicitly, behind the scenes. This is the **compound components** pattern: a family of components designed specifically to be used together, sharing state without the caller needing to wire it up manually.

### Building it: context, once again, doing the coordination

\`\`\`jsx
const TabsContext = createContext(null)

function Tabs({ defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>
}

function Tab({ id, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  return (
    <button
      className={id === activeTab ? "active" : ""}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

function Panel({ id, children }) {
  const { activeTab } = useContext(TabsContext)
  if (id !== activeTab) return null   // module 2's conditional-rendering pattern
  return <div className="tabs-panel">{children}</div>
}
\`\`\`

Recall module 8's \`useContext\` lesson, applied here precisely: \`Tabs\` sets up a context \`Provider\` holding \`activeTab\`/\`setActiveTab\`, and every sub-component (\`Tab\`, \`Panel\`) reads from that same context — none of them need \`activeTab\` passed to them explicitly as a prop, since they're always rendered *inside* \`<Tabs>\`, and therefore always have access to its \`Provider\`.

### Attaching the sub-components: the .List/.Tab/.Panel syntax

\`\`\`jsx
Tabs.List = TabsList
Tabs.Tab = Tab
Tabs.Panel = Panel

export default Tabs
\`\`\`

This is genuinely just attaching ordinary function components as properties on another function (recall the JavaScript course's module 5: functions are objects, and can have properties attached to them like any other object) — \`Tabs.List\` is just a more organized, discoverable way to export and reference \`TabsList\`, rather than requiring a separate top-level import for each piece.

### Why this pattern is worth the added complexity, specifically for this kind of component

Compound components genuinely shine for UI with several tightly-coupled parts that always appear together and share implicit state — tabs, accordions, a custom \`<select>\`-like dropdown, a multi-step form wizard. The alternative (passing \`activeTab\`/\`setActiveTab\` explicitly as props to every sub-component) would work, but compound components produce a noticeably cleaner, more declarative-feeling call site — closer to how you'd imagine an ideal, built-in HTML \`<tabs>\` element might actually look and work, if one existed.

### A word of caution: this is genuinely more complex than plain props

For a component that doesn't have this specific "several tightly-coupled parts sharing state" shape, reaching for the compound-components pattern adds real, unnecessary complexity (a context, several interdependent sub-components) for no real benefit over just passing props directly. This is squarely an advanced pattern, reached for deliberately for a specific kind of UI — not a default way to structure every related group of components.

> **Key idea:** compound components use context (module 8) internally to let a family of related sub-components (attached as properties on the main component, like \`Tabs.Tab\`) implicitly share state without the caller wiring it up via props — genuinely valuable for tightly-coupled UI like tabs or accordions, but real added complexity not worth reaching for outside that specific shape of problem.`,
    },
  ],
}
