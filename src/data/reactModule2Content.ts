import type { Module } from "../types"

export const reactModule2: Module = {
  id: 2,
  title: "JSX & Rendering",
  status: "upcoming",
  lessons: [
    {
      name: "Conditional Rendering",
      minutes: 9,
      intro: "Showing different UI depending on data — the handful of patterns you'll use constantly.",
      content: `### The ternary operator: an inline if/else

\`\`\`jsx
function Status({ isOnline }) {
  return <p>{isOnline ? "Online" : "Offline"}</p>
}
\`\`\`

Recall this platform's JavaScript course, module 2: the ternary operator (\`condition ? a : b\`) is an *expression*, not a statement — which matters here, because everything inside JSX's \`{ }\` must be an expression. This is why the ternary, not a plain \`if\`/\`else\`, is the standard way to choose between two pieces of JSX inline.

### && for "render this, or render nothing"

\`\`\`jsx
function Notification({ message }) {
  return (
    <div>
      {message && <p className="alert">{message}</p>}
    </div>
  )
}
\`\`\`

Recall the JavaScript course's truthy/falsy lesson: \`&&\` returns its first falsy operand, or its last operand if all are truthy. Here, if \`message\` is falsy (an empty string, \`null\`, \`undefined\`), the expression evaluates to that falsy value, and React renders nothing for it. If \`message\` is truthy, the expression evaluates to the \`<p>\`, which renders normally.

### The classic && gotcha: a falsy number renders as text

\`\`\`jsx
function Cart({ itemCount }) {
  return <div>{itemCount && <p>{itemCount} items in cart</p>}</div>
}
// when itemCount is 0: renders the literal text "0" on the page — NOT nothing!
\`\`\`

This is a genuinely common, real bug: when \`itemCount\` is \`0\`, \`0 && <p>...</p>\` evaluates to \`0\` (recall: \`&&\` returns the first falsy operand, which is \`0\` itself) — and React **does** render a bare \`0\`, since it's a valid, displayable value, not \`null\`/\`undefined\`/\`false\` (which React treats as "render nothing"). The fix: make the condition explicitly boolean.

\`\`\`jsx
function Cart({ itemCount }) {
  return <div>{itemCount > 0 && <p>{itemCount} items in cart</p>}</div>
}
// itemCount === 0 now correctly renders nothing, since (0 > 0) is false, not 0
\`\`\`

### Returning null: rendering nothing at all

\`\`\`jsx
function Banner({ show, message }) {
  if (!show) {
    return null
  }
  return <div className="banner">{message}</div>
}
\`\`\`

A component can \`return null\` to render nothing — this is the standard pattern for "sometimes this component shouldn't appear at all," using an ordinary early \`return\` (recall the JavaScript course's functions module) rather than a conditional expression squeezed into JSX.

### if/else for genuinely different branches

\`\`\`jsx
function UserGreeting({ user }) {
  if (!user) {
    return <p>Please log in.</p>
  }

  return <p>Welcome back, {user.name}!</p>
}
\`\`\`

When the two branches are substantially different pieces of UI (not just a small inline difference), an ordinary \`if\`/\`return\` at the top of the component is often more readable than nesting ternaries inside the JSX. There's no rule requiring one style — pick whichever keeps the specific case most readable.

### Assigning JSX to a variable for a complex case

\`\`\`jsx
function OrderStatus({ status }) {
  let content

  if (status === "pending") {
    content = <p className="text-yellow-600">Order pending</p>
  } else if (status === "shipped") {
    content = <p className="text-blue-600">Order shipped</p>
  } else if (status === "delivered") {
    content = <p className="text-green-600">Order delivered</p>
  } else {
    content = <p className="text-gray-600">Unknown status</p>
  }

  return <div className="order-card">{content}</div>
}
\`\`\`

For genuinely many branches, computing a JSX value into a variable first (using an ordinary \`if\`/\`else if\` chain from the JavaScript course's module 2), then embedding that variable once in the actual \`return\`, is clearer than nesting several ternaries or \`&&\`s inside the markup itself.

> **Key idea:** ternary for a simple either/or, \`&&\` for "render this or nothing" (watch out for a falsy number like \`0\` rendering literally — always make the condition explicitly boolean), \`return null\` for "render nothing at all," and a plain \`if\`/\`else\` or a variable assigned before the \`return\` for anything more complex than a one-liner.`,
    },
    {
      name: "Rendering Lists & the key Prop",
      minutes: 9,
      intro: "Turning an array of data into an array of elements — and the one prop React requires you to get right.",
      content: `### Rendering an array with map

\`\`\`jsx
const fruits = ["Apple", "Banana", "Cherry"]

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  )
}
\`\`\`

Recall this platform's JavaScript course, module 6: \`.map()\` transforms every element of an array and returns a new array of the same length. Here, it transforms an array of strings into an array of JSX elements — and JSX happily renders an array of elements exactly as if you'd written them all out individually.

### The key prop: not optional

\`\`\`jsx
{fruits.map((fruit) => (
  <li key={fruit}>{fruit}</li>   // key is required on the OUTERMOST element returned in the loop
))}
\`\`\`

Without a \`key\`, React logs a console warning and — more importantly — can't reliably tell which rendered element corresponds to which array item across re-renders, which leads to real, confusing bugs: state ending up attached to the wrong item, incorrect elements being reused when the list reorders, or unnecessary full re-renders instead of efficient updates. \`key\` must be a **string or number, unique among siblings** in that specific list — it doesn't need to be globally unique across the whole app, just within that one \`.map()\`.

### Why array index is usually the wrong key

\`\`\`jsx
// AVOID when the list can be reordered, filtered, or have items inserted/removed
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}
\`\`\`

Using the array index as \`key\` works, but breaks down the moment the list's order can change: if an item is removed from the middle, every subsequent item's index shifts, and React ends up matching the *wrong* underlying data to each rendered element on the next update — leading to genuinely confusing bugs (an input's typed text ending up attached to the wrong row, for instance, since React reuses the DOM node for that index rather than creating a fresh one).

\`\`\`jsx
// CORRECT: a stable, unique identifier from the actual data
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
\`\`\`

Always prefer a stable ID that belongs to the data itself (a database ID, a UUID) — something that stays attached to the *same logical item* even if its position in the list changes. Array index as \`key\` is only genuinely safe for a list that is static and never reordered, filtered, or has items inserted/removed.

### key is not a prop the component receives

\`\`\`jsx
function TodoItem({ todo }) {
  // console.log(props.key)   // undefined — key is NOT accessible as a normal prop!
  return <li>{todo.text}</li>
}
\`\`\`

\`key\` is special, reserved metadata React uses internally for the reconciliation process described above — it's stripped out before your component ever sees its props. If a component genuinely needs the same value for its own logic, pass it again under a different prop name (e.g. \`id={todo.id}\`).

### Filtering before rendering

\`\`\`jsx
function ActiveTodoList({ todos }) {
  const activeTodos = todos.filter((todo) => !todo.completed)

  return (
    <ul>
      {activeTodos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
\`\`\`

Recall the JavaScript course's module 6 array methods: \`.filter()\` (and \`.map()\`, chained together) work exactly the same inside a component as anywhere else — a common, clean pattern is filtering the data down to what should actually be displayed *before* mapping it to JSX, rather than mixing the filtering logic into the rendering itself.

> **Key idea:** \`.map()\` turns an array of data into an array of JSX elements; every element in that array needs a \`key\` — a stable, unique-among-siblings identifier from the actual data, not the array index, unless the list is genuinely guaranteed to never reorder or have items added/removed.`,
    },
    {
      name: "Fragments & Multiple Elements",
      minutes: 6,
      intro: "Returning multiple elements from a component without adding an unwanted wrapper div.",
      content: `### The problem: JSX needs one root, but you don't want an extra div

\`\`\`jsx
// forces an unnecessary <div> into the actual rendered HTML,
// which can break CSS relying on specific parent-child relationships (e.g. flex/grid layouts)
function UserInfo() {
  return (
    <div>
      <h2>Ada Lovelace</h2>
      <p>Mathematician</p>
    </div>
  )
}
\`\`\`

Recall module 1's rule: a component must return exactly one root element. Wrapping everything in a \`<div>\` satisfies that rule syntactically, but it adds a real, visible node to the DOM — one that might not have been part of the intended layout (breaking a CSS Grid or Flexbox layout that expects specific direct children, for instance).

### Fragment: a wrapper that doesn't render anything

\`\`\`jsx
import { Fragment } from "react"

function UserInfo() {
  return (
    <Fragment>
      <h2>Ada Lovelace</h2>
      <p>Mathematician</p>
    </Fragment>
  )
}
\`\`\`

\`<Fragment>\` satisfies JSX's "one root element" rule without adding any actual node to the rendered DOM — the \`<h2>\` and \`<p>\` end up as direct siblings in the real page, exactly as if the \`<Fragment>\` wrapper wasn't there at all.

### The shorthand syntax: <>...</>

\`\`\`jsx
function UserInfo() {
  return (
    <>
      <h2>Ada Lovelace</h2>
      <p>Mathematician</p>
    </>
  )
}
\`\`\`

\`<>\`/\`</>\` is shorthand for \`Fragment\` — no import needed, and it's what you'll see and use in the vast majority of real code. The one case requiring the full \`<Fragment>\` import instead is when you need to pass a \`key\` (covered in the previous lesson) to it — the shorthand syntax doesn't support any props, including \`key\`.

### Fragments with a key, for lists

\`\`\`jsx
import { Fragment } from "react"

function DefinitionList({ items }) {
  return (
    <dl>
      {items.map((item) => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.definition}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
\`\`\`

Recall the previous lesson: every element returned from a \`.map()\` needs a \`key\`. When each list item is actually a *pair* of sibling elements (\`<dt>\`/\`<dd>\`, here) rather than one, a keyed \`<Fragment>\` groups them together for the \`key\` requirement without introducing a wrapping \`<div>\` around each pair — something the \`<>\` shorthand can't do.

### Fragments vs a wrapper div: when you actually want the div

Fragments aren't a rule to follow blindly — sometimes you genuinely *want* a wrapping element (to apply a CSS class, a \`data-\` attribute, or an event handler to the group as a whole). Reach for a fragment specifically when a wrapper element would be purely structural, serving no real styling or behavioral purpose, and would only exist to satisfy JSX's single-root rule.

> **Key idea:** \`<>...</>\` (or \`<Fragment>\`) groups multiple JSX elements to satisfy the "one root element" rule without adding an actual node to the rendered DOM — use the shorthand by default, and the explicit \`<Fragment key={...}>\` form specifically when the group needs a \`key\` inside a list.`,
    },
    {
      name: "Styling Components",
      minutes: 9,
      intro: "The several ways to apply CSS in a React app, and how to choose between them.",
      content: `### Plain CSS with className

\`\`\`css
/* styles.css */
.card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
\`\`\`

\`\`\`jsx
import "./styles.css"

function Card({ children }) {
  return <div className="card">{children}</div>
}
\`\`\`

The most basic approach: a regular \`.css\` file, imported once (commonly at the top of the component that needs it, or in the app's entry point), with \`className\` (recall module 1's JSX lesson) referencing the class names it defines. Simple, but subject to the same global-namespace collision risk any plain CSS project has — two components defining \`.card\` differently will conflict.

### CSS Modules: automatically scoped class names

\`\`\`css
/* Card.module.css */
.card {
  padding: 1rem;
  border-radius: 8px;
}
\`\`\`

\`\`\`jsx
import styles from "./Card.module.css"

function Card({ children }) {
  return <div className={styles.card}>{children}</div>
}
\`\`\`

A file named \`*.module.css\` (supported out of the box by Vite, no extra configuration) has its class names automatically rewritten to something unique at build time (\`Card_card__a1b2c\`) — the exact same mechanism covered in this platform's Next.js course, directly applicable here since it's a Vite/bundler feature, not framework-specific. This eliminates the naming-collision risk of plain global CSS.

### Inline styles: a JavaScript object, not a CSS string

\`\`\`jsx
function Card({ children, highlighted }) {
  const style = {
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: highlighted ? "#fef3c7" : "white",
  }

  return <div style={style}>{children}</div>
}
\`\`\`

The \`style\` prop takes a JavaScript **object**, not a CSS string like plain HTML's \`style="padding: 1rem"\` — property names are camelCase (\`backgroundColor\`, not \`background-color\`, mirroring \`className\` vs \`class\` from module 1), and values are usually strings (numbers are treated as pixels for most properties). Inline styles are genuinely useful for styles that depend directly on dynamic, computed values (like \`highlighted\` here) — but for anything static, a CSS file/module is generally preferred, since it keeps styling separate from markup and supports things inline styles can't (media queries, pseudo-classes like \`:hover\`).

### Conditional class names

\`\`\`jsx
function Button({ variant, children }) {
  const className = variant === "primary" ? "btn btn-primary" : "btn btn-secondary"
  return <button className={className}>{children}</button>
}

// with multiple independent conditions, template literals (JS course module 13) get unwieldy fast:
function Alert({ type, dismissed }) {
  return (
    <div className={\`alert alert-\${type} \${dismissed ? "alert-dismissed" : ""}\`}>
      ...
    </div>
  )
}
\`\`\`

A small, extremely common utility library, \`clsx\` (or the similar \`classnames\`), cleans this up:

\`\`\`jsx
import clsx from "clsx"

function Alert({ type, dismissed }) {
  return (
    <div className={clsx("alert", \`alert-\${type}\`, { "alert-dismissed": dismissed })}>
      ...
    </div>
  )
}
\`\`\`

\`clsx\` accepts strings, and objects where each key is included only if its value is truthy — a much more readable way to build up a conditional class list than manually concatenating template literals, and genuinely common enough in real React codebases to be worth knowing even this early.

### Tailwind CSS: the current ecosystem default

\`\`\`jsx
function Card({ children }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      {children}
    </div>
  )
}
\`\`\`

Exactly as covered in this platform's Next.js course's styling module — Tailwind's utility-class approach works identically in plain React (via Vite's Tailwind plugin), and is the most common styling choice in current React projects for the same reasons covered there: no naming-collision risk, and no separate CSS file to keep in sync with the markup.

> **Key idea:** plain CSS/CSS Modules and Tailwind are the two mainstream approaches (CSS Modules for scoped traditional CSS, Tailwind for utility classes); the \`style\` prop takes a JS object with camelCase properties, best reserved for genuinely dynamic, computed styles rather than static ones; and \`clsx\` is the standard small utility for building conditional class strings cleanly.`,
    },
  ],
}
