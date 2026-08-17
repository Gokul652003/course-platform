import type { Module } from "../types"

export const reactModule1: Module = {
  id: 1,
  title: "Getting Started with React",
  status: "in_progress",
  lessons: [
    {
      name: "What is React, and Why Does It Exist?",
      minutes: 9,
      intro: "The problem React solves, and the mental model it asks you to adopt.",
      content: `### The problem: keeping the UI in sync with data is hard, by hand

Before React, updating a web page when data changed meant manually finding the right DOM element and mutating it — \`document.getElementById("count").textContent = newCount\`. This works fine for one value, but a real application has dozens of interdependent pieces of UI that all need to stay correctly in sync with underlying data, and every place you *forget* to update becomes a bug: stale UI showing old data.

### React's core idea: describe the UI as a function of state

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
\`\`\`

Instead of manually describing *how* to update the DOM step by step, you write a function that describes *what* the UI should look like for any given state — \`UI = f(state)\`. When state changes, you don't write any DOM-manipulation code at all; you just call \`setCount\`, and React figures out what changed and updates the DOM itself. This is the single biggest mental shift coming from plain JavaScript DOM manipulation: you stop thinking about *mutating* the page and start thinking about *describing* it.

### Components: the unit of reuse

\`\`\`jsx
function App() {
  return (
    <div>
      <Counter />
      <Counter />
      <Counter />
    </div>
  )
}
\`\`\`

A **component** is a JavaScript function that returns a description of UI. Once written, a component can be reused anywhere, any number of times, each instance keeping its own independent state — exactly like the three independent \`<Counter />\`s above, each counting separately. This composability — building complex UIs out of small, reusable, independently-testable pieces — is the other major reason React caught on.

### The virtual DOM: how React actually updates the page

Directly manipulating the real DOM is comparatively slow. React keeps an in-memory, lightweight representation of what the UI *should* look like (informally called the "virtual DOM"), and when state changes, it computes the difference between the old and new versions, then applies only the minimal necessary changes to the real DOM. You never write this diffing logic yourself — it happens automatically, which is exactly what makes the "just describe the UI, don't manually update it" model practical and fast.

### React is a library, not a framework

Much like module 1 of this platform's JavaScript course distinguished the language from the engine that runs it: React itself only handles the UI layer — components, state, rendering. It has no built-in opinion on routing, data fetching, or project structure the way a framework like Next.js (covered elsewhere on this platform) does. This course focuses on React itself — the library — which is exactly what Next.js (and other frameworks) are built on top of.

### Where you'll actually write React

\`\`\`jsx
// .jsx or .tsx files — a syntax extension covered in depth in module 2
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}
\`\`\`

That \`<h1>Hello, {name}!</h1>\` inside a JavaScript function is **JSX** — not HTML, and not a string, but a syntax extension that compiles down to plain JavaScript function calls. It looks unusual at first if you're coming from plain HTML/JS, but it's the entire next module's focus, and it becomes natural quickly.

> **Key idea:** React's core contribution is a shift in mental model — describe *what* the UI should look like for a given state, not *how* to mutate the DOM to get there — combined with components as a reusable, composable unit of UI. Everything else in this course builds on that one idea.`,
    },
    {
      name: "Setting Up a React Project",
      minutes: 8,
      intro: "Getting a real, working React project running on your machine in one command.",
      content: `### Scaffolding a project with Vite

\`\`\`bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
\`\`\`

**Vite** is the standard modern tool for scaffolding a React project — it sets up a working build configuration, a fast dev server, and a sensible folder structure in one command. (An older tool, Create React App, was the standard for years but is no longer actively maintained — Vite is the current recommendation.) Adding \`-- --template react-ts\` instead scaffolds with TypeScript, covered later in module 3.

### What gets generated

\`\`\`
my-app/
  src/
    App.jsx        <- the root component
    main.jsx        <- the entry point — renders App into the page
    index.css
  index.html
  package.json
  vite.config.js
\`\`\`

\`\`\`jsx
// main.jsx
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(<App />)
\`\`\`

\`main.jsx\` is the actual entry point — it takes a real DOM element (\`#root\`, defined in \`index.html\`) and tells React "render the \`<App />\` component tree starting here." This is the one place plain DOM APIs (\`document.getElementById\`) and React actually meet — everywhere else in your app, you describe UI declaratively and never touch the DOM directly.

### The dev server and Fast Refresh

\`\`\`bash
npm run dev
\`\`\`

Visit \`http://localhost:5173\` (Vite's default port) — you'll see the starter app. Like the frameworks covered elsewhere on this platform, Vite's dev server supports **Fast Refresh**: edit a component and save, and the browser updates instantly, typically preserving component state, without a full page reload. This tight edit-save-see feedback loop is one of the most important things a good setup gives you — you'll rely on it constantly throughout this course.

### The other essential scripts

\`\`\`bash
npm run build     # produces an optimized, production-ready build in dist/
npm run preview     # serves that production build locally, to test it before deploying
\`\`\`

Exactly like the framework courses on this platform: always test with \`build\` + \`preview\` before considering something ready to ship — the dev server prioritizes fast rebuilds and helpful errors, not the actual optimized output real users will get.

### React DevTools: essential, not optional

Install the **React Developer Tools** browser extension (available for Chrome and Firefox). It adds a "Components" tab to your browser's DevTools, letting you inspect the component tree, see each component's current props and state live, and — once covered later in this course — profile performance. This is genuinely as important to React development as the Network tab is to web development generally; install it now, before you need it.

> **Key idea:** Vite is the current standard tool for starting a new React project — \`main.jsx\` is the one seam where React meets the real DOM, and everywhere else you'll work declaratively. React DevTools is essential, not optional, tooling — install it immediately.`,
    },
    {
      name: "JSX: The Basics",
      minutes: 9,
      intro: "HTML-like syntax inside JavaScript — what it actually is, and the handful of rules that differ from HTML.",
      content: `### JSX is not a string, and not HTML

\`\`\`jsx
const element = <h1>Hello, world!</h1>
\`\`\`

This looks like you're assigning an HTML string to a variable — you're not. **JSX** is a syntax extension to JavaScript that compiles (via a build tool, transparently) into regular function calls:

\`\`\`js
// what the JSX above actually compiles to
const element = React.createElement("h1", null, "Hello, world!")
\`\`\`

\`React.createElement\` returns a plain JavaScript object describing what should be rendered — this is the "virtual DOM" object from the previous lesson, made concrete. You'll almost never write \`createElement\` calls by hand — JSX is simply a much more readable way to write the exact same thing, and the build tool (Vite, in this course) handles the translation automatically.

### Embedding JavaScript expressions with curly braces

\`\`\`jsx
const name = "Ada"
const element = <h1>Hello, {name}!</h1>

const sum = <p>2 + 2 = {2 + 2}</p>

function getGreeting(user) {
  return <p>Hello, {user ? user.name : "Stranger"}</p>
}
\`\`\`

Anything inside \`{ }\` in JSX is evaluated as a genuine JavaScript **expression** — a variable, a function call, arithmetic, a ternary (recall this platform's JavaScript course, module 2) — and the result is embedded into the output. This is the entire mechanism connecting your data to what's actually displayed.

### JSX must return a single root element

\`\`\`jsx
// INVALID — two sibling elements with no common wrapper
function Broken() {
  return (
    <h1>Title</h1>
    <p>Paragraph</p>
  )
}

// VALID — wrapped in a single parent
function Fixed() {
  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph</p>
    </div>
  )
}
\`\`\`

A component's JSX must have exactly **one** top-level element — this is a genuinely common early mistake. (Module 2 covers \`<Fragment>\`, a way to satisfy this rule without adding an extra, unwanted \`<div>\` to the actual page.)

### className, not class — and other naming differences

\`\`\`jsx
// HTML: <div class="card"></div>
// JSX:
const element = <div className="card"></div>
\`\`\`

Because \`class\` is a reserved word in JavaScript, JSX uses \`className\` instead — this is the single most common "why isn't my styling working" mistake for anyone coming from plain HTML. A handful of other attributes are similarly renamed to their JavaScript (camelCase) equivalent: \`for\` becomes \`htmlFor\`, and event handlers like \`onclick\` become \`onClick\` (covered in module 4).

### Every tag must be closed

\`\`\`jsx
// HTML allows this:
// <img src="cat.jpg">
// <br>

// JSX requires explicit closing, even for "void" elements (recall the HTML course's terminology):
const img = <img src="cat.jpg" />
const br = <br />
\`\`\`

Unlike HTML, which tolerates unclosed void elements, JSX requires every tag to be explicitly self-closed with \`/>\` if it has no children — a stricter rule than HTML itself.

### Comments inside JSX

\`\`\`jsx
function Example() {
  return (
    <div>
      {/* this is a comment inside JSX — regular JS comments alone won't work directly in markup */}
      <p>Content</p>
    </div>
  )
}
\`\`\`

Because everything inside the JSX tree is either markup or a \`{ expression }\`, a comment has to be wrapped in curly braces as a JS comment expression — a small but common early stumbling block.

> **Key idea:** JSX compiles to \`React.createElement\` calls — it's not HTML, just JavaScript wearing HTML-like syntax. \`{ }\` embeds any JavaScript expression, \`className\` replaces \`class\`, every tag must close, and a component must return exactly one root element.`,
    },
    {
      name: "Your First Component",
      minutes: 8,
      intro: "Writing, exporting, and rendering a real component from scratch.",
      content: `### A function component, from nothing

\`\`\`jsx
function Welcome() {
  return <h1>Welcome to React!</h1>
}

export default Welcome
\`\`\`

A React component is, at its simplest, just a JavaScript function that returns JSX. The one hard rule: **its name must start with a capital letter** — this is how React (and JSX itself) distinguishes a custom component (\`<Welcome />\`) from a built-in HTML tag (\`<welcome>\`, which JSX would treat as a literal, meaningless HTML element rather than your component).

### Using a component inside another

\`\`\`jsx
function Welcome() {
  return <h1>Welcome to React!</h1>
}

function App() {
  return (
    <div>
      <Welcome />
      <p>This is the rest of the page.</p>
    </div>
  )
}
\`\`\`

\`<Welcome />\` inside \`App\`'s JSX renders the \`Welcome\` component right there — components composing other components is the entire structure of every real React application: a tree of components, each returning either plain JSX elements or other components.

### A component with dynamic content

\`\`\`jsx
function Welcome() {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : "Good afternoon"

  return <h1>{greeting}! Welcome to React.</h1>
}
\`\`\`

A component's function body runs like any ordinary JavaScript function — you can compute values, call other functions, use conditionals — right up until the \`return\`, whose JSX describes the actual output. Every one of this platform's JavaScript course's concepts (variables, functions, conditionals, template literals) is directly usable here, since a component body is just JavaScript.

### Where a component actually gets rendered onto the page

\`\`\`jsx
// main.jsx
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(<App />)
\`\`\`

Recall the previous lesson: this is the one place a component tree actually gets attached to a real DOM element. Everything rendered by \`App\` — and everything \`App\` renders, recursively — ends up inside \`#root\` in the actual page.

### File organization: one component per file, as a convention

\`\`\`
src/
  App.jsx
  Welcome.jsx
  Header.jsx
\`\`\`

\`\`\`jsx
// Welcome.jsx
export default function Welcome() {
  return <h1>Welcome to React!</h1>
}
\`\`\`

\`\`\`jsx
// App.jsx
import Welcome from "./Welcome.jsx"

export default function App() {
  return <Welcome />
}
\`\`\`

Not a hard requirement, but the near-universal convention: one component per file, matching the component's name, using this platform's JavaScript course's \`export default\`/\`import\` (module 11) to wire files together. This keeps components easy to locate as a project grows.

### Running it and seeing it live

With the dev server running (\`npm run dev\`, from the previous lesson), any saved change to \`Welcome.jsx\` appears instantly in the browser via Fast Refresh — this tight loop is worth actually using as you work through the rest of this course: type the examples yourself, save, and watch them render, rather than just reading them.

> **Key idea:** a component is a capitalized JavaScript function returning JSX — components render other components by using them as JSX tags, and the resulting tree ultimately attaches to a real DOM node via \`createRoot(...).render()\`. One component per file is the standard convention, wired together with ordinary \`import\`/\`export\`.`,
    },
  ],
}
