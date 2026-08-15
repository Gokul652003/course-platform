import type { Module } from "../types"

export const reactModule3: Module = {
  id: 3,
  title: "Components & Props",
  status: "upcoming",
  lessons: [
    {
      name: "Props: Passing Data Into a Component",
      minutes: 9,
      intro: "How a parent component configures and customizes a child — the primary way data flows in React.",
      content: `### Passing props, and receiving them

\`\`\`jsx
function Greeting({ name, age }) {
  return <p>{name} is {age} years old.</p>
}

function App() {
  return <Greeting name="Ada" age={30} />
}
\`\`\`

**Props** (short for "properties") are how a parent component passes data down into a child — exactly like HTML attributes, but able to carry any JavaScript value, not just strings. Notice \`age={30}\` uses curly braces (recall module 1's JSX-expression lesson) to pass an actual number, while \`name="Ada"\` uses a plain string literal — either works, but only \`{ }\` can pass something that isn't a literal string.

### Props arrive as a single object

\`\`\`jsx
function Greeting(props) {
  return <p>{props.name} is {props.age} years old.</p>
}
\`\`\`

The \`{ name, age }\` in the first example is **destructuring** (recall this platform's JavaScript course, module 6) applied directly to a function's parameter — a component actually receives one single object containing every prop passed to it. Destructuring in the parameter list is the near-universal convention, since it avoids repeating \`props.\` before every value, but both forms are equivalent.

### Props are read-only

\`\`\`jsx
function Greeting({ name }) {
  // name = "Grace"   // NEVER do this — props are read-only, and this would be silently ineffective at best
  return <p>Hello, {name}</p>
}
\`\`\`

A component must **never** modify its own props — they belong to the parent that passed them down. This is a hard rule, not a style preference: React's whole rendering model depends on props flowing one direction, parent to child, and mutating them breaks that model in ways that produce genuinely confusing bugs. (State, covered in module 4, is the tool for values a component actually needs to change itself.)

### Default values for props

\`\`\`jsx
function Greeting({ name = "Guest", age = 0 }) {
  return <p>{name} is {age} years old.</p>
}

function App() {
  return <Greeting />   // renders "Guest is 0 years old." — no props passed at all
}
\`\`\`

Recall the JavaScript course's module 3: default parameter values work identically here, since props are just a destructured function parameter — a default kicks in exactly when that specific prop is missing or \`undefined\`.

### The children prop: content passed between tags

\`\`\`jsx
function Card({ children }) {
  return <div className="card">{children}</div>
}

function App() {
  return (
    <Card>
      <h2>Title</h2>
      <p>Some content inside the card.</p>
    </Card>
  )
}
\`\`\`

Anything written **between** a component's opening and closing tags is automatically passed to it as a special prop called \`children\` — you never need to pass it explicitly like other props. This is the mechanism behind wrapper/layout components (a \`Card\`, a \`Modal\`, a page layout) that don't know or care what's actually inside them — module 10 covers this pattern, composition, in much greater depth.

### Passing a component as a prop

\`\`\`jsx
function IconButton({ icon, label }) {
  return (
    <button>
      {icon}
      {label}
    </button>
  )
}

function App() {
  return <IconButton icon={<StarIcon />} label="Favorite" />
}
\`\`\`

Because JSX elements are just ordinary JavaScript values (recall module 2's discussion of \`React.createElement\`), a prop can hold an entire piece of JSX, not just primitive data — passing an icon component this way is a common, real pattern for a reusable component that needs to render something the parent controls but the child doesn't build itself.

### Spreading props

\`\`\`jsx
const buttonProps = { type: "submit", disabled: false, children: "Save" }

function App() {
  return <button {...buttonProps} />
}
\`\`\`

Recall the JavaScript course's spread operator (module 6) — spreading an object as JSX props passes each of its properties individually, exactly as if you'd written them all out by hand. Genuinely useful for forwarding a whole bundle of props through to an underlying element, though overusing it can make it harder to see at a glance exactly what a component actually accepts.

> **Key idea:** props flow one direction, parent to child, and are strictly read-only inside the receiving component — \`children\` is the special prop capturing whatever's nested between a component's tags, and default parameter values (from the JavaScript course) work directly on destructured props for sensible fallbacks.`,
    },
    {
      name: "Composition: Building UIs from Small Pieces",
      minutes: 8,
      intro: "Why React favors small, focused components combined together, over large, monolithic ones.",
      content: `### Breaking a UI down into components

\`\`\`jsx
function ProfilePage({ user }) {
  return (
    <div>
      <ProfileHeader user={user} />
      <ProfileBio bio={user.bio} />
      <ProfileStats stats={user.stats} />
    </div>
  )
}

function ProfileHeader({ user }) {
  return (
    <div className="header">
      <Avatar src={user.avatarUrl} />
      <h1>{user.name}</h1>
    </div>
  )
}

function Avatar({ src }) {
  return <img className="avatar" src={src} alt="User avatar" />
}
\`\`\`

Rather than one large \`ProfilePage\` component containing all the markup and logic for an entire page, real React code is broken into a **tree** of small, focused components, each handling one clear responsibility — \`Avatar\` only knows how to render an avatar image, \`ProfileHeader\` combines an \`Avatar\` with a name, and so on. This mirrors good practice in any programming language: small, single-purpose functions composed together, rather than one enormous function doing everything.

### When to actually split a component

There's no fixed rule for exactly when a component "should" be split — a genuinely useful signal is **reuse**: if a piece of UI (a button style, a card layout, an avatar) appears in more than one place, it belongs in its own component. Another good signal is **complexity**: if a single component's JSX is hard to read at a glance, or its logic handles several unrelated concerns, splitting it usually helps, even if the pieces are only used once.

### Composition over configuration

\`\`\`jsx
// AVOID: a single component trying to handle every possible layout via a growing list of boolean props
function Card({ title, hasHeader, hasFooter, headerText, footerText, children }) {
  return (
    <div className="card">
      {hasHeader && <div className="card-header">{headerText}</div>}
      {children}
      {hasFooter && <div className="card-footer">{footerText}</div>}
    </div>
  )
}

// PREFER: compose smaller pieces together, using the children prop from the previous lesson
function Card({ children }) {
  return <div className="card">{children}</div>
}
function CardHeader({ children }) {
  return <div className="card-header">{children}</div>
}
function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>
}

function App() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <p>Content</p>
      <CardFooter>Actions</CardFooter>
    </Card>
  )
}
\`\`\`

The first version's boolean-prop approach doesn't scale — every new layout variation means another prop, and the component's internal logic grows more tangled with each one. The second version, composing several small components together using \`children\`, is more flexible: any combination or ordering of \`CardHeader\`/\`CardFooter\`/plain content is possible without ever touching \`Card\`'s own code. This "composition over configuration" instinct — reaching for smaller, combinable pieces over one component with a growing prop list — is one of the most important habits for writing maintainable React, covered in much greater depth in module 10.

### Passing data down through several levels: prop drilling, briefly introduced

\`\`\`jsx
function App({ currentUser }) {
  return <Dashboard currentUser={currentUser} />
}
function Dashboard({ currentUser }) {
  return <Sidebar currentUser={currentUser} />
}
function Sidebar({ currentUser }) {
  return <UserBadge currentUser={currentUser} />   // finally used, 3 levels down
}
\`\`\`

Passing \`currentUser\` through \`Dashboard\` and \`Sidebar\`, neither of which actually use it themselves, just to reach \`UserBadge\`, is called **prop drilling** — it works, but becomes unwieldy as an app grows. This is a real, common pain point worth naming now; module 8 covers \`useContext\`, React's built-in tool for sidestepping it when it becomes a genuine problem, rather than reaching for it prematurely on every prop.

> **Key idea:** React favors many small, focused, composable components over few large ones — reuse and internal complexity are the signals for when to split. Composing components together via \`children\` (rather than an ever-growing list of configuration props) is a more flexible, more maintainable default than it might initially seem.`,
    },
    {
      name: "PropTypes & Runtime Validation",
      minutes: 6,
      intro: "Catching a wrong prop type before it causes a confusing bug, without necessarily adopting TypeScript.",
      content: `### The problem: nothing stops a caller from passing the wrong type

\`\`\`jsx
function Greeting({ name, age }) {
  return <p>{name} is {age} years old.</p>
}

<Greeting name="Ada" age="thirty" />   // age is a STRING here — no error, just wrong behavior downstream
\`\`\`

In plain JavaScript/JSX, nothing enforces that \`age\` is actually a number — passing the wrong type doesn't throw an error; it just quietly produces incorrect behavior somewhere downstream, often far from where the mistake was actually made, making it hard to trace.

### prop-types: a lightweight runtime check

\`\`\`bash
npm install prop-types
\`\`\`

\`\`\`jsx
import PropTypes from "prop-types"

function Greeting({ name, age }) {
  return <p>{name} is {age} years old.</p>
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
}
\`\`\`

The \`prop-types\` package lets you declare the expected shape of a component's props — in development mode, passing the wrong type logs a clear console warning (never a hard crash), naming exactly which prop and which component got it wrong. \`.isRequired\` additionally warns if a required prop is missing entirely.

### Common PropTypes validators

\`\`\`jsx
Component.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  isActive: PropTypes.bool,
  items: PropTypes.array,
  onSave: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  status: PropTypes.oneOf(["pending", "active", "done"]),
  children: PropTypes.node,   // anything renderable: a string, a number, JSX, an array of these
}
\`\`\`

\`PropTypes.shape\` validates the structure of an object prop; \`PropTypes.oneOf\` restricts a prop to a specific set of allowed values (useful for something like a \`variant\` or \`status\` prop); \`PropTypes.node\` is the correct type for a \`children\` prop, since it needs to accept anything JSX can render, not just one specific type.

### Where prop-types fits today

\`prop-types\` predates TypeScript's dominance in the React ecosystem, and it only catches problems **at runtime**, in development — it does nothing in production, and it can't catch a mistake before the code even runs, unlike a real type system. In modern React projects, **TypeScript** (covered in the next lesson) has largely replaced \`prop-types\` for new projects, since it catches the exact same category of mistake — and many more — at build time, before the code ever executes, with editor autocomplete as a direct bonus.

### Why this lesson exists anyway

You'll still encounter \`prop-types\` regularly in existing, real-world React codebases that predate TypeScript's current popularity — recognizing it, and knowing what it's for, matters even if you'd choose TypeScript for a new project today. It's also occasionally still chosen deliberately for smaller JavaScript-only projects that want *some* prop validation without taking on TypeScript's full learning curve and build-tooling requirements.

> **Key idea:** \`prop-types\` gives runtime-only, development-mode warnings for incorrectly-typed props — genuinely useful, and common in existing codebases, but TypeScript (next lesson) has become the standard choice for new projects, since it catches the same mistakes earlier (at build time) and more thoroughly.`,
    },
    {
      name: "TypeScript with React",
      minutes: 9,
      intro: "Typing components and props properly — catching mistakes before the code ever runs.",
      content: `### Typing a component's props with an interface

\`\`\`tsx
interface GreetingProps {
  name: string
  age: number
}

function Greeting({ name, age }: GreetingProps) {
  return <p>{name} is {age} years old.</p>
}

// <Greeting name="Ada" age="thirty" />   // build ERROR: Type 'string' is not assignable to type 'number'
\`\`\`

This is directly the previous lesson's \`prop-types\` problem, solved differently: TypeScript catches the wrong-type mistake **at build time** (and immediately in your editor, before you even save) — recall this platform's Next.js course's TypeScript coverage of typing a component's props with an \`interface\`, applied here identically, since the underlying language and type system are the same regardless of framework.

### Optional props and defaults

\`\`\`tsx
interface GreetingProps {
  name: string
  age?: number         // the ? marks this prop as optional
}

function Greeting({ name, age = 0 }: GreetingProps) {
  return <p>{name} is {age} years old.</p>
}

<Greeting name="Ada" />   // fine — age is optional, and defaults to 0
\`\`\`

\`?\` after a property name marks it optional in the type — combined with the JavaScript default-parameter syntax from module 1's props lesson, this is the standard pattern for an optional prop with a sensible fallback.

### Typing children

\`\`\`tsx
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>
}
\`\`\`

\`ReactNode\` is the correct, broad type for a \`children\` prop — it covers everything JSX can actually render: a string, a number, a JSX element, an array of these, or \`null\`. This is directly the TypeScript equivalent of the previous lesson's \`PropTypes.node\`.

### Typing event handlers

\`\`\`tsx
import type { ChangeEvent, MouseEvent } from "react"

interface ButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

function Button({ onClick }: ButtonProps) {
  return <button onClick={onClick}>Click me</button>
}

function handleChange(event: ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value)
}
\`\`\`

React provides its own specific event types (\`MouseEvent\`, \`ChangeEvent\`, \`KeyboardEvent\`, and more — covered further in module 4) rather than using the plain DOM event types directly — they're generic over the specific HTML element involved (\`HTMLButtonElement\`, \`HTMLInputElement\`), which is what gives you correctly-typed access to element-specific properties like \`event.target.value\`.

### Typing useState (a brief preview of module 4)

\`\`\`tsx
import { useState } from "react"

function Counter() {
  const [count, setCount] = useState<number>(0)   // explicit type, though often unnecessary
  const [count2, setCount2] = useState(0)             // TypeScript INFERS number automatically here

  const [user, setUser] = useState<{ name: string } | null>(null)   // explicit type IS needed here,
  // since there's no non-null initial value for TypeScript to infer a shape from
  return null
}
\`\`\`

TypeScript can usually **infer** the type of a piece of state from its initial value (\`useState(0)\` is inferred as \`number\`, no annotation needed) — the explicit \`<Type>\` syntax is mainly needed when the initial value doesn't fully describe the type on its own, like \`null\` standing in for "no user yet, but eventually an object shaped like this."

### Should you use TypeScript for this course's remaining examples?

The remaining modules in this course mix plain JSX and TypeScript-annotated examples, matching the reality of the React ecosystem itself — both are genuinely common in real projects. The concepts (hooks, patterns, routing, testing) are identical either way; TypeScript just adds a layer of compile-time safety on top, exactly as it does in this platform's Next.js course. For any new, real project today, TypeScript is the broadly recommended default.

> **Key idea:** TypeScript typing for React props follows the same \`interface\` pattern covered in this platform's Next.js course — it catches the exact category of mistake \`prop-types\` warns about at runtime, but at build time instead, with \`ReactNode\` for typing \`children\` and React's own generic event types for correctly-typed event handlers.`,
    },
  ],
}
