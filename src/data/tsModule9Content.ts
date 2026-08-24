import type { Module } from "../types"

export const tsModule9: Module = {
  id: 9,
  title: "TypeScript in Real Projects",
  status: "upcoming",
  lessons: [
    {
      name: "tsconfig.json & Strictness Flags",
      minutes: 11,
      intro: "Understand what tsconfig.json actually controls, what the strict flag bundles, and the module/resolution/path options every real project ends up configuring.",
      content: `## tsconfig.json is the compiler's entire contract

Every non-trivial TypeScript project has a \`tsconfig.json\` at its root, and it's easy to treat it as boilerplate you copy from another project and never think about again. That's a mistake — this file is where you decide how strict the compiler is, which JavaScript features it assumes exist, how it resolves imports, and what actually gets emitted. A badly configured \`tsconfig.json\` can leave real bugs completely invisible to the type checker while feeling like everything is "working."

A minimal, realistic one looks like this:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
\`\`\`

Every field here earns its place, and this lesson goes through the ones that matter most in practice.

## \`strict\`: one flag, several behaviors

\`strict: true\` isn't a single setting — it's a bundle switch that turns on a whole group of individually-toggleable flags at once. Knowing what's inside it matters, because you'll sometimes want to enable strictness incrementally (covered in the next lesson) rather than flip it all on at once.

| Flag (enabled by \`strict\`) | What it actually catches |
|---|---|
| \`noImplicitAny\` | Any parameter or variable the compiler can't infer a type for, and would otherwise silently treat as \`any\`, becomes an error instead |
| \`strictNullChecks\` | \`null\` and \`undefined\` are no longer assignable to every other type — you must explicitly include them in a type (\`string \\| null\`) to allow them |
| \`strictFunctionTypes\` | Function parameter types are checked contravariantly, catching genuinely unsound function assignments |
| \`strictBindCallApply\` | \`.bind()\`, \`.call()\`, and \`.apply()\` are type-checked against the function's actual signature |
| \`strictPropertyInitialization\` | Class properties must be initialized in the constructor or have a definite assignment assertion, catching properties that could be read as \`undefined\` |
| \`noImplicitThis\` | \`this\` in a function must have a known type — no silent \`any\` |
| \`alwaysStrict\` | Emits \`"use strict"\` and parses files in strict JS mode |
| \`useUnknownInCatchVariables\` | A caught error is typed \`unknown\` instead of \`any\`, forcing you to narrow it before use |

Of all of these, \`noImplicitAny\` and \`strictNullChecks\` are the two that catch the overwhelming majority of real bugs, and they're also the two most disruptive to turn on in an existing loosely-typed codebase — which is exactly why the migration lesson later in this module treats them as a deliberate, staged step rather than a single flip.

\`\`\`ts
// with strictNullChecks OFF — compiles, crashes at runtime
function getLength(s: string) {
  return s.length
}
getLength(null) // no compile error — but throws at runtime without the flag

// with strictNullChecks ON — the bug is caught before it ships
function getLength2(s: string) {
  return s.length
}
getLength2(null) // Argument of type 'null' is not assignable to parameter of type 'string'
\`\`\`

The practical rule: for any new project, turn \`strict\` on from day one. There is no ramp-up cost when a codebase starts empty, and every hour spent writing loosely-typed code in a new project is an hour of debt you'll eventually have to pay off, usually at a worse exchange rate.

## \`target\` and \`module\`: what JavaScript you emit and how

\`target\` controls which JavaScript language version the compiler downlevels your TypeScript to — it decides whether things like optional chaining (\`?.\`), async generators, or class fields get compiled down to older equivalents or left as-is.

\`\`\`json
{ "compilerOptions": { "target": "ES2022" } }
\`\`\`

Set \`target\` to the oldest JavaScript runtime you actually need to support. Targeting an ancient version (\`ES5\`) when you only ship to modern browsers or a current Node.js version adds unnecessary polyfill-like downleveling and larger output for no benefit — most projects in 2026 can safely target \`ES2020\` or newer.

\`module\` controls the emitted module syntax (\`import\`/\`export\` vs \`require\`/\`module.exports\`) and interacts closely with \`moduleResolution\`, which controls *how* the compiler resolves an import specifier like \`import { foo } from "./bar"\` to an actual file on disk.

| \`module\` value | Typical use case |
|---|---|
| \`CommonJS\` | Traditional Node.js projects without \`"type": "module"\` |
| \`ESNext\` / \`ES2022\` | Projects that emit native ES modules, or are bundled by a tool that handles module output itself |
| \`NodeNext\` | Modern Node.js projects that need TypeScript to mirror Node's actual dual CJS/ESM resolution rules exactly |

For \`moduleResolution\`, most projects using a bundler (Vite, webpack, esbuild) should use \`"Bundler"\` — added specifically to match how bundlers resolve imports (allowing extensionless imports, \`package.json\` \`exports\` fields, etc.) rather than emulating Node's stricter resolution algorithm. Projects that run directly under Node without a bundler should match \`moduleResolution\` to \`NodeNext\` alongside \`module: "NodeNext"\`.

## \`esModuleInterop\` and \`skipLibCheck\`: two flags nearly every project wants

\`esModuleInterop\` fixes a long-standing mismatch between how CommonJS and ES modules handle default exports, letting you write \`import React from "react"\` instead of the more awkward \`import * as React from "react"\` that was technically required without it. Turn it on; there's essentially no real-world downside.

\`skipLibCheck\` tells the compiler not to type-check the contents of \`.d.ts\` declaration files (including everything under \`node_modules\`) — only your own source. Without it, a type error inside some dependency's shipped type definitions (which happens more often than you'd hope, especially across incompatible major versions of shared dependencies) can break your build even though your own code is completely correct. Virtually every real project enables this; it trades a small amount of type safety at dependency boundaries for a much more stable and faster build.

## \`baseUrl\` and \`paths\`: import aliases

As a project grows, relative imports like \`../../../components/Button\` become brittle and ugly. \`paths\` lets you define aliases the compiler (and, with matching bundler configuration, your build tool) understands:

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
\`\`\`

\`\`\`ts
// instead of:
import { Button } from "../../../components/Button"

// you can write:
import { Button } from "@/components/Button"
\`\`\`

One critical thing to know: \`tsconfig.json\`'s \`paths\` only affects *type-checking* — it tells the compiler how to resolve the import for type purposes. It does **not** rewrite the import at runtime. Your bundler (Vite's \`resolve.alias\`, webpack's \`resolve.alias\`) needs a matching configuration, or the code will type-check fine and then fail to actually run because Node or the browser has no idea what \`@/components/Button\` means. This mismatch — types resolving one way, the runtime resolving another — is one of the most common "but it compiled!" surprises in real projects.

## Project references: \`tsc -b\` for multi-package repos

In a monorepo or any project split into multiple TypeScript "sub-projects" (a shared \`packages/ui\` consumed by \`apps/web\`, for instance), a single flat \`tsconfig.json\` compiling everything together gets slow and loses isolation — a change anywhere forces a full recheck of everything. **Project references** let you declare that one \`tsconfig.json\` depends on another, and compile them incrementally as a graph:

\`\`\`json
// apps/web/tsconfig.json
{
  "compilerOptions": { "composite": true },
  "references": [{ "path": "../../packages/ui" }]
}
\`\`\`

Compiling with \`tsc -b\` (build mode) instead of plain \`tsc\` respects this graph — it only rebuilds a referenced project if its inputs actually changed, and produces \`.tsbuildinfo\` files that make subsequent builds significantly faster. This repo's own \`package.json\` build script, for reference, already uses \`tsc -b\` for exactly this reason. Project references are worth reaching for once a codebase is genuinely split into independent packages; for a single-package app, a flat \`tsconfig.json\` is simpler and entirely sufficient.

> **Key idea:** \`tsconfig.json\` is a real, consequential configuration surface, not boilerplate — \`strict\` bundles the flags that catch the vast majority of real bugs (lead with \`noImplicitAny\` and \`strictNullChecks\`), \`target\`/\`module\`/\`moduleResolution\` should match your actual runtime and bundler, \`esModuleInterop\` and \`skipLibCheck\` are safe defaults nearly every project wants, and \`paths\` aliases require matching bundler configuration since the compiler alone can't rewrite runtime imports.`,
    },
    {
      name: "TypeScript with React & Node",
      minutes: 12,
      intro: "Type React function components, props, hooks, and event handlers, then do the same for a small Node.js script and see what @types/node provides.",
      content: `## Typing a React function component

A React function component, at its simplest, is just a function that takes a props object and returns JSX. Typing it is mostly about typing that props object well:

\`\`\`tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: "primary" | "danger"
  disabled?: boolean
}

function Button({ label, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button className={\`btn btn-\${variant}\`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
\`\`\`

A few things worth noticing: the props type is a plain \`interface\`, not anything React-specific — there's no requirement to reach for a special "component props" utility type for a basic case like this. The optional props (\`variant?\`, \`disabled?\`) use ordinary optional-property syntax, and default values are supplied through destructuring defaults exactly like a non-React function would. The return type of the function (JSX) is inferred automatically — you don't need to annotate it explicitly, though some codebases add an explicit return type for consistency once components get more complex.

For a component that renders its children, \`React\`'s own \`ReactNode\` type covers everything JSX is allowed to render — strings, numbers, elements, fragments, arrays of any of those, or nothing at all:

\`\`\`tsx
interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
\`\`\`

## Typing hooks

\`useState\` infers its type from the initial value in the common case, and that's usually all you need:

\`\`\`tsx
const [count, setCount] = React.useState(0) // inferred as number
const [name, setName] = React.useState("") // inferred as string
\`\`\`

The case that actually needs an explicit type argument is when the initial value doesn't tell the whole story — most commonly, state that starts out \`null\` but will later hold something more specific:

\`\`\`tsx
interface User {
  id: string
  name: string
}

// without the type argument, this would infer as User | null forever being narrowed
// to just "null" wouldn't be useful — the explicit generic tells React the eventual shape
const [user, setUser] = React.useState<User | null>(null)

// later:
setUser({ id: "1", name: "Ada" })
\`\`\`

\`useRef\` has two meaningfully different typing situations. A ref attached to a DOM node should be typed with that element's type and initialized with \`null\`, which React treats specially for DOM refs:

\`\`\`tsx
function TextInput() {
  const inputRef = React.useRef<HTMLInputElement>(null)

  function focus() {
    inputRef.current?.focus() // .current is HTMLInputElement | null, so optional chaining is required
  }

  return <input ref={inputRef} />
}
\`\`\`

A ref used as a mutable value container (not attached to the DOM at all) is typed the same way but the \`.current\` property is freely mutable rather than read-only:

\`\`\`tsx
const renderCount = React.useRef(0)
renderCount.current += 1 // fine — this ref isn't a DOM ref, so .current isn't read-only
\`\`\`

## Typing event handlers

React re-exports its own event types (\`React.MouseEvent\`, \`React.ChangeEvent\`, \`React.FormEvent\`, and others), parameterized by the element the handler is attached to. Getting the element type argument right is what gives you a correctly typed \`event.target\`:

\`\`\`tsx
function Search() {
  const [query, setQuery] = React.useState("")

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value) // event.target is known to be HTMLInputElement, so .value exists
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("searching for", query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} />
    </form>
  )
}
\`\`\`

If you instead wrote \`event: any\` (or omitted the type and let strict mode reject the implicit any), \`event.target.value\` would either be an unchecked, unsafe access or a compile error — the explicit, element-parameterized event type is what makes the handler both safe and self-documenting about which element it's meant to be attached to.

## The Node.js side: typing a small script

TypeScript on the server doesn't need React at all, but it does need type information for Node's built-in APIs — things like \`process\`, \`fs\`, and \`path\` aren't part of the JavaScript language itself, they're runtime globals and modules Node provides. TypeScript doesn't know about them out of the box:

\`\`\`bash
npm install --save-dev @types/node
\`\`\`

\`@types/node\` is a pure declaration package (no runtime code) that describes Node's built-in modules and globals, published under DefinitelyTyped's \`@types\` scope (the same pattern used for typing many JavaScript packages that don't ship their own types — covered in the next module). With it installed, Node's APIs are fully typed:

\`\`\`ts
import { readFile } from "node:fs/promises"
import path from "node:path"

async function loadConfig(dir: string) {
  const configPath = path.join(dir, "config.json") // path.join is now typed: (...paths: string[]) => string
  const raw = await readFile(configPath, "utf-8") // readFile's overloads are typed based on the encoding argument
  return JSON.parse(raw) as { port: number; host: string }
}

console.log(process.env.NODE_ENV) // process.env is typed as NodeJS.ProcessEnv, an index signature of string | undefined
\`\`\`

Note the \`as { port: number; host: string }\` on the \`JSON.parse\` result — \`JSON.parse\` always returns \`any\`, because TypeScript has no way to know the shape of arbitrary parsed JSON at compile time. A type assertion here is a claim you're making, not something the compiler verified; if \`config.json\` doesn't actually match that shape, nothing catches it until something downstream breaks. This is a preview of a theme the final module returns to: type assertions describe intent, they don't validate runtime data.

## A minimal typed request handler

Without pulling in a full framework's own types, a plain Node HTTP handler still benefits from typing its inputs and outputs explicitly:

\`\`\`ts
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"

function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok" }))
    return
  }
  res.writeHead(404)
  res.end("Not found")
}

createServer(handleRequest).listen(3000)
\`\`\`

Frameworks like Express ship their own \`@types/express\` (or bundled types in newer versions) that type \`req\`/\`res\` more richly — typed route params, typed \`req.body\` when paired with a validation library — but the underlying idea is identical: the framework's declaration files are what let the compiler check your handler code against the actual shape of the request and response objects the framework hands you at runtime.

> **Key idea:** React's own types (\`React.ReactNode\`, the element-parameterized event types, generic \`useState<T>\`/\`useRef<T>\`) cover the component layer, while \`@types/node\` provides the equivalent for Node's built-in modules and globals — in both environments, TypeScript is only as good as the type information available for the runtime APIs you're calling, which is why installing the right \`@types\` package (or a framework's bundled types) is as important as writing your own types correctly.`,
    },
    {
      name: "Migrating a JavaScript Codebase to TypeScript",
      minutes: 12,
      intro: "A staged, low-risk migration strategy for an existing JavaScript codebase — allowJs, checkJs, incremental file conversion, and tightening strictness over time.",
      content: `## Why "just switch it all to strict TypeScript" doesn't work

For a brand-new project, turning on \`strict: true\` from the first commit is free — there's no existing code to fight with. A real, existing JavaScript codebase is a completely different situation: it might have tens of thousands of lines, years of implicit assumptions baked in, and no tests covering every edge case. Converting it to strict TypeScript in one pass is rarely realistic and often actively risky — a rushed, mechanical conversion tends to produce a codebase full of \`as any\` escape hatches sprinkled in just to make the compiler stop complaining, which gives you all of TypeScript's build-time cost with almost none of its safety benefit.

The realistic approach is staged: let TypeScript and JavaScript coexist, convert files gradually, and only tighten strictness once there's real type coverage to tighten against.

## Stage 1: \`// @ts-check\` — type-checking a single JS file, no conversion required

The lightest possible first step doesn't even require installing TypeScript as a build dependency for that file, or renaming anything. Adding a single comment to the top of an existing \`.js\` file turns on type checking for it, using JSDoc comments and inference from the existing code:

\`\`\`js
// @ts-check

/**
 * @param {string} name
 * @param {number} age
 */
function greet(name, age) {
  return \\\`Hello \\\${name}, you are \\\${age} years old\\\`
}

greet("Ada", "thirty") // Argument of type 'string' is not assignable to parameter of type 'number'
\`\`\`

This is a genuinely underrated migration tool. It lets a team try TypeScript's checking against real, unmodified production code, file by file, with zero build changes and zero risk — if a file causes too much noise, just remove the comment. It's also a reasonable *permanent* choice for files that will probably never be worth fully converting (a one-off build script, for instance).

## Stage 2: \`allowJs\` + \`checkJs\` — project-wide JS checking

Once a team is comfortable with \`// @ts-check\` on individual files, the natural next step is enabling it project-wide via \`tsconfig.json\`, which lets \`.ts\` and \`.js\` files coexist in the same compilation and optionally type-checks the \`.js\` files too:

\`\`\`json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "outDir": "dist"
  },
  "include": ["src"]
}
\`\`\`

Note \`checkJs: false\` here initially — \`allowJs\` alone just lets \`.js\` files be part of the compilation (so newly-added \`.ts\` files can import them without error), without forcing every existing \`.js\` file to suddenly pass type checking. Flip \`checkJs\` to \`true\` once the codebase is ready to have its untouched JavaScript checked too — at that point, JSDoc comments (like in Stage 1) become the way to add type information to files you haven't converted yet, without renaming them.

## Stage 3: convert files, leaves first

With \`allowJs\` in place, start renaming files from \`.js\` to \`.ts\` (or \`.jsx\` to \`.tsx\`) one at a time. The order matters: convert files with the fewest internal dependencies first — utility modules, constants, small helper functions — before working up to the files that import many other things. Converting a leaf module first means you can add real, specific types to it without needing to have already typed everything it depends on.

\`\`\`js
// utils/formatCurrency.js — before
export function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}
\`\`\`

\`\`\`ts
// utils/formatCurrency.ts — after
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}
\`\`\`

Each converted file should compile with as few \`any\`s as honestly possible — but "as few as honestly possible" is doing real work in that sentence. It's fine, and often correct, to reach for \`any\` (or better, \`unknown\` with a comment) on a genuinely complex or legacy piece of logic you don't fully understand yet, rather than spending a day reverse-engineering its exact shape mid-migration. The goal of this stage is broad coverage, not perfection on the first pass — you can come back and tighten specific files later once the majority of the codebase has basic type coverage.

## Stage 4: start with \`strict: false\`, then tighten flag by flag

Once most files are converted, resist enabling \`strict: true\` all at once — it will likely surface hundreds of errors simultaneously, which is discouraging and hard to review as a single change. Instead, enable individual strictness flags one at a time, in roughly this order, fixing what each one surfaces before moving to the next:

\`\`\`json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": false
  }
}
\`\`\`

1. **\`noImplicitAny\` first** — this surfaces every place the compiler couldn't infer a type and silently fell back to \`any\`. Fixing these adds real type coverage without touching your codebase's actual runtime behavior at all — you're purely adding annotations.
2. **\`strictNullChecks\` second, and expect it to be the biggest one.** This is almost always where the largest number of new errors appear, because it exposes every place the existing code implicitly assumed a value could never be \`null\`/\`undefined\` — assumptions that were previously invisible and are very often where real production bugs were already hiding.
3. **The remaining strict-family flags last** (\`strictFunctionTypes\`, \`strictPropertyInitialization\`, \`noImplicitThis\`, and the rest) — these typically surface far fewer errors once the two above are handled, and can usually be turned on together.

Once every individual flag is enabled, \`strict: true\` can replace the itemized list — at that point it's a no-op summary of what's already been achieved, rather than a disruptive single jump.

## Common friction points, honestly

- **Third-party packages without types.** Some older or smaller npm packages ship no \`.d.ts\` files and have no corresponding \`@types/\` package on DefinitelyTyped. You'll need a local ambient declaration (covered in the next module) or, as a last resort, an explicit \`any\`-typed shim — better to be explicit about the gap than to let it silently infect surrounding code.
- **Dynamic, "clever" JavaScript patterns.** Code that builds objects with computed keys in a loop, monkey-patches a prototype, or relies on \`arguments\` in ways that don't map cleanly to a fixed parameter list tends to resist typing and often needs an actual rewrite, not just an annotation — this is usually a sign the code was already fragile, and the migration is surfacing that rather than causing it.
- **Team velocity during the transition.** Migrating touches files across the whole codebase, which conflicts with active feature work touching the same files. Doing the migration in small, mergeable batches (one directory or one flag at a time) rather than a single giant branch avoids painful, long-lived merge conflicts.
- **The temptation to over-use \`as any\`.** Under deadline pressure, it's tempting to silence an error with \`as any\` rather than actually work out the correct type. Each one of these is a small hole in the exact safety net the migration exists to build — treat a growing count of them as a metric worth tracking, not a detail to ignore.

> **Key idea:** migrating a real JavaScript codebase to TypeScript works best as a staged process — \`// @ts-check\` and \`allowJs\` let TypeScript and JavaScript coexist with zero risk, convert files leaves-first, and enable strictness flags one at a time (\`noImplicitAny\`, then \`strictNullChecks\`, then the rest) rather than flipping \`strict: true\` all at once on a codebase that isn't ready for it.`,
    },
  ],
}
