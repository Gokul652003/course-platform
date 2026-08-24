import type { Module } from "../types"

export const tsModule1: Module = {
  id: 1,
  title: "Getting Started with TypeScript",
  status: "in_progress",
  lessons: [
    {
      name: "What Is TypeScript & Why Use It",
      minutes: 9,
      intro: "Understand the problem JavaScript's dynamic typing creates at scale, meet structural typing, and get an honest picture of what TypeScript can and can't catch.",
      content: `## The problem, before the tool

JavaScript was designed as a small scripting language for validating form fields in a browser. It has no compile step, no static types, and nothing stopping you from calling a function with the wrong arguments, reading a property that doesn't exist, or passing a string where a number was expected. None of that is a mistake in JavaScript's design — it's exactly what made the language approachable and flexible. But as codebases grew from a few hundred lines to applications with thousands of files and dozens of contributors, that same flexibility became a real cost:

- **Typos become runtime crashes.** \`user.name\` versus \`user.nmae\` looks like a small mistake, but JavaScript won't tell you about it until that exact line executes — possibly in production, possibly only for one specific user with one specific shape of data.
- **Function contracts are invisible.** Given \`function formatPrice(amount, currency)\`, nothing in the source tells you whether \`amount\` is a number of cents or a string like \`"$12.00"\`, or whether \`currency\` is optional. You either read the implementation or the documentation, if either exists.
- **Refactoring is dangerous.** Rename a property on an object that's passed through six functions across four files, and JavaScript gives you no way to find every place that still expects the old name — except running the code and seeing what breaks.
- **Editor tooling is guesswork.** Autocomplete, "go to definition," and inline documentation all have to guess at a variable's shape from how it's used, because there's no declared shape to read.

None of this means JavaScript is broken. It does exactly what a dynamically-typed scripting language is supposed to do. But teams building large, long-lived applications wanted something JavaScript never offered: a way to describe the *shape* of data and the *contract* of a function, and have a tool check that every place using that data or calling that function actually honors the contract — before any of it runs.

**TypeScript**, created by Microsoft and first released in 2012, is that tool. It is not a new language that replaces JavaScript — it's a **typed superset of JavaScript**. Every valid JavaScript program is already (almost) valid TypeScript. TypeScript adds an optional type system on top, and a compiler that checks your code against that type system and then strips the types away, emitting plain JavaScript that runs anywhere JavaScript already runs.

\`\`\`ts
// greet.ts — this is TypeScript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

greet("Ada")     // OK
greet(42)        // Error, caught before the code ever runs:
                  // Argument of type 'number' is not assignable to parameter of type 'string'.
\`\`\`

\`\`\`js
// greet.js — this is what actually ships to the browser or Node
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

That's the entire mental model for this whole course: you write \`.ts\` files with type annotations, the TypeScript compiler checks that every usage matches its declared types, and once it's satisfied, it emits ordinary \`.js\` files with the types completely erased. The browser or Node.js runtime never sees a type annotation — it only ever executes the same JavaScript it always could. Every feature covered in later modules — interfaces, generics, unions, the advanced type system — is ultimately just a more precise way of describing what your JavaScript is supposed to do, checked entirely before a single line of it runs.

## Structural typing: TypeScript's core design choice

If you've used a statically-typed language like Java, C#, or Kotlin before, TypeScript's type system will feel both familiar and subtly different in one specific way: **TypeScript uses structural typing, not nominal typing.**

In a nominally-typed language, two types are compatible only if one explicitly declares that it implements or extends the other — compatibility is about the *name* and declared relationship. In a structurally-typed language like TypeScript, two types are compatible if they have the same *shape* — the same properties with compatible types — regardless of what they're named or how they were declared.

\`\`\`ts
interface Point {
  x: number
  y: number
}

function logPoint(point: Point): void {
  console.log(\`(\${point.x}, \${point.y})\`)
}

// This object never mentions "Point" anywhere, and yet:
const coordinate = { x: 12, y: 8 }
logPoint(coordinate) // OK — coordinate has the right shape

// This one has an extra property, and is still fine:
const labeledPoint = { x: 3, y: 4, label: "origin" }
logPoint(labeledPoint) // OK — extra properties are allowed on existing variables

// This one is missing a required property:
const incomplete = { x: 1 }
logPoint(incomplete) // Error: Property 'y' is missing
\`\`\`

Nothing declared \`coordinate\` or \`labeledPoint\` to *be* a \`Point\`. TypeScript looked at their shape — do they have a numeric \`x\` and a numeric \`y\`? — and decided that shape satisfies what \`logPoint\` requires. This is sometimes called "duck typing, but checked at compile time": if it has the properties a \`Point\` needs, TypeScript treats it as a \`Point\`, no explicit declaration required. This design choice matters throughout the course — it's why TypeScript interfaces and type aliases can describe plain object literals, JSON responses, and third-party data without those values ever being constructed through a class or explicitly tagged with a type.

## Compile-time only: types don't exist at runtime

The single most important fact to internalize before writing a line of TypeScript: **types are completely erased during compilation.** They exist only to help the compiler check your code and to help your editor give you better tooling. They have zero presence in the JavaScript that ships.

\`\`\`ts
let age: number = 30
\`\`\`

compiles to:

\`\`\`js
let age = 30
\`\`\`

The \`: number\` simply vanishes — there's no runtime check anywhere in the emitted JavaScript verifying that \`age\` stays a number. This has a very practical consequence worth stating plainly: **you cannot use a TypeScript type to validate data you don't control**, such as the JSON body of an HTTP response, form input, or the contents of a file. A type annotation like \`response: User\` is a promise you're making to the compiler about what shape you expect — it does nothing to verify that the actual data returned over the network really has that shape at runtime. If an API changes and starts returning \`age\` as a string instead of a number, TypeScript will happily let your code run, because by the time that data exists, the types are already gone. (Later in the course, you'll see patterns and tools — runtime validation libraries, type guards — that exist specifically to bridge this gap between compile-time types and runtime reality.)

## An honest note: what TypeScript doesn't do

It's worth being direct about TypeScript's limits before spending a whole course learning its features:

- **It does not change how JavaScript runs.** TypeScript catches mistakes before execution; it has no effect on performance, and the emitted JavaScript behaves identically to equivalent hand-written JavaScript.
- **It cannot validate external data at runtime**, as covered above — API responses, \`localStorage\` contents, environment variables, and file contents are all untyped as far as the actual running program is concerned, no matter what type you annotate them with.
- **\`any\` opts out of checking entirely.** TypeScript provides an escape hatch type, \`any\`, that disables type checking for a value. Overusing \`any\` — often out of impatience or unfamiliarity — quietly turns a TypeScript codebase back into an unchecked JavaScript one, just with extra syntax. This course treats \`any\` as a last resort and introduces \`unknown\` (module 2) as the safer alternative for most of the situations people reach for \`any\`.
- **It's a tool, not a guarantee of correctness.** TypeScript catches an entire category of bugs — shape mismatches, wrong argument types, typo'd property names — but it says nothing about whether your business logic is actually correct. A function can be perfectly type-safe and still compute the wrong answer.

None of this diminishes what TypeScript is good at. Catching an enormous, common class of bugs before code ever runs, making function contracts and data shapes explicit and machine-checked, and giving editors enough information to offer accurate autocomplete and safe refactoring — that's a substantial, well-earned reputation, and it's what the rest of this course is spent building real fluency in.

> **Key idea:** TypeScript is a structurally-typed superset of JavaScript — it checks your code against declared types and then erases those types entirely, emitting plain JavaScript with zero runtime trace of them; that means TypeScript is powerful at catching shape and contract mistakes before code runs, but it cannot validate data at runtime and offers no guarantee of correctness beyond the types you actually write.`,
    },
    {
      name: "Installing & Compiling TypeScript",
      minutes: 10,
      intro: "Install the TypeScript compiler, write a minimal tsconfig.json, compile from the command line, and see how a bundler like Vite integrates TypeScript for day-to-day development.",
      content: `## Installing TypeScript via npm

TypeScript ships as an npm package containing the compiler (\`tsc\`) and the type-checking engine every editor integration relies on. Installing it in a project is a single command:

\`\`\`bash
npm install --save-dev typescript
\`\`\`

It's a \`devDependency\` for the same reason Sass or any other build-time tool is: TypeScript compiles your source during development and build, but none of the compiler itself ships to the browser or a Node.js production runtime — only the plain JavaScript it emits does. Once installed, the \`tsc\` CLI is available via \`npx tsc\`, and most editors (including VS Code, which bundles its own copy) will automatically use the project's local \`typescript\` version for in-editor type checking and autocomplete rather than any globally installed copy.

## A minimal tsconfig.json

A \`tsconfig.json\` file at your project root tells \`tsc\` (and any editor or bundler that reads TypeScript configuration) how to compile your project — which files to include, which JavaScript version to target, and which type-checking rules to enforce. You can generate a starter one with:

\`\`\`bash
npx tsc --init
\`\`\`

which produces a heavily-commented file with most options left at their defaults and commented out. A practical minimal configuration for a modern project looks like this:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
\`\`\`

| Option | What it does |
|---|---|
| \`target\` | The JavaScript language version the compiler emits (e.g. \`ES2022\` uses native classes, optional chaining, etc. rather than down-leveling them) |
| \`module\` | The module system used in the emitted output (\`ESNext\` keeps \`import\`/\`export\` as native ES modules) |
| \`moduleResolution\` | How \`tsc\` resolves import paths — \`"bundler"\` matches how modern bundlers like Vite and webpack resolve modules |
| \`strict\` | Turns on the full set of strict type-checking flags (covered in depth in module 9) — the single most important setting for actually catching bugs |
| \`esModuleInterop\` | Smooths over interop between CommonJS and ES module import styles |
| \`skipLibCheck\` | Skips type-checking \`.d.ts\` files from dependencies, which speeds up compilation and avoids errors in third-party type definitions you don't control |
| \`outDir\` | Where compiled \`.js\` output is written when \`tsc\` emits files |
| \`include\` | Which files/folders \`tsc\` should compile |

**Always start new projects with \`"strict": true\`.** It's off by default for backward compatibility with old TypeScript projects, but every option it enables — non-nullable types by default, no implicit \`any\`, and more — is what makes TypeScript actually effective at catching mistakes. Turning it on later, after hundreds of files have accumulated without it, is a much larger effort than starting with it from day one.

## Compiling from the command line

Given a source file:

\`\`\`ts
// src/index.ts
function add(a: number, b: number): number {
  return a + b
}

console.log(add(2, 3))
\`\`\`

running \`tsc\` (with a \`tsconfig.json\` present) type-checks every included file and, if there are no errors, emits compiled JavaScript into \`outDir\`:

\`\`\`bash
npx tsc
\`\`\`

\`\`\`js
// dist/index.js
function add(a, b) {
    return a + b;
}
console.log(add(2, 3));
\`\`\`

If a type error exists anywhere in the project, \`tsc\` reports it and — by default — still refuses to consider the build clean, though depending on configuration it may or may not still emit output for the files without errors. The important habit: **a successful \`tsc\` run is your project's actual source of truth that the types check out**, not just a subjective read of the code.

### Watching for changes during development

Add \`--watch\` and \`tsc\` stays running, re-checking and re-emitting every time you save a file:

\`\`\`bash
npx tsc --watch
\`\`\`

This is a common workflow for backend or library projects with no bundler involved — leave \`tsc --watch\` running in a terminal, and get immediate feedback the moment a file breaks type-checking.

### Type-checking without emitting files

Many projects — especially ones using a bundler that handles the actual JavaScript output — only want \`tsc\` for its type-checking, not its compiled output. The \`--noEmit\` flag runs the full type check and reports errors without writing any \`.js\` files:

\`\`\`bash
npx tsc --noEmit
\`\`\`

This is exactly what this course platform's own \`npm run typecheck\` script does under the hood — it exists purely as a correctness gate, separate from the actual build.

## Integrating TypeScript into a Vite project

If you're using a bundler like Vite (as this course platform itself does), you generally don't run \`tsc\` for the day-to-day dev server at all. Vite's dev server uses **esbuild** to strip TypeScript syntax and transpile each file on the fly — it is deliberately not a type checker, only a fast syntax transformer. That means during \`vite dev\`, a type error in your code will **not** stop the page from loading; only an actual syntax error will. This trade-off is intentional: it keeps the dev server's feedback loop nearly instant, since checking types across an entire project is far slower than transpiling one file.

\`\`\`ts
// main.tsx — importing a .ts file works immediately, no config beyond tsconfig.json
import { add } from "./math"
\`\`\`

Full, whole-project type checking still matters, though — it's just handled separately, typically as part of the production build. This project's own \`package.json\` shows the common pattern:

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty"
  }
}
\`\`\`

\`vite\` alone (used for \`dev\`) never runs \`tsc\` — it's purely the fast, unchecked dev server. \`npm run build\` runs \`tsc -b\` (a "build mode" invocation that type-checks the whole project, respecting any project references) *before* \`vite build\`, so a type error fails the production build even though it would never have been caught by the dev server alone. And \`npm run typecheck\` runs the same check on its own, useful as a fast CI step or a manual sanity check without doing a full production build.

The practical takeaway: **the dev server catches syntax errors instantly but not type errors; \`tsc\` (via \`build\` or \`typecheck\`) is what actually enforces your types**, and a healthy TypeScript + Vite project runs both — fast unchecked iteration during development, and a real type check before anything ships.

> **Key idea:** Install TypeScript with \`npm install --save-dev typescript\`, configure it with a \`tsconfig.json\` (starting with \`"strict": true\`), and use \`tsc\` (or \`tsc --noEmit\`) as your actual type-checking gate — a bundler like Vite transpiles TypeScript syntax instantly for a fast dev server, but only \`tsc\` verifies your types are correct, which is why it belongs in your build and CI, not just your editor.`,
    },
    {
      name: "Your First Types & Type Inference",
      minutes: 9,
      intro: "Annotate variables and function parameters, learn when TypeScript can infer a type on its own, see how let and const affect inference, and meet any as an escape hatch to avoid.",
      content: `## Type annotations: the basic syntax

A type annotation attaches a type to a variable, parameter, or return value using a colon followed by the type:

\`\`\`ts
let username: string = "ada"
let age: number = 36
let isActive: boolean = true

function formatName(first: string, last: string): string {
  return \`\${first} \${last}\`
}
\`\`\`

Once \`username\` is annotated (or inferred, covered next) as \`string\`, TypeScript will flag any later attempt to assign it something incompatible:

\`\`\`ts
username = 42
// Error: Type 'number' is not assignable to type 'string'.
\`\`\`

This is the whole mechanism, repeated everywhere in TypeScript: declare or infer a type once, and every subsequent usage is checked against it.

## Type inference: TypeScript is watching even when you don't annotate

Writing \`: string\` and \`: number\` on every single variable would be tedious, and TypeScript doesn't require it. Whenever a variable is declared with an initial value, TypeScript **infers** its type from that value automatically — no annotation needed:

\`\`\`ts
let username = "ada"     // inferred as string
let age = 36             // inferred as number
let isActive = true      // inferred as boolean

username = 42
// Error: Type 'number' is not assignable to type 'string'.
// Even with no annotation written, TypeScript inferred 'string' from the
// initial value and is still enforcing it.
\`\`\`

Hovering over \`username\` in an editor with TypeScript support shows \`let username: string\`, exactly as if you'd written the annotation yourself — inference isn't a weaker fallback, it's the same type system, just derived rather than declared. This is why a huge fraction of real-world TypeScript code has very few explicit annotations on local variables: they're usually unnecessary noise once a value is already assigned.

### When annotations are actually necessary

Inference has one obvious limitation: it needs a value to infer *from*. Wherever there's no initial value to look at, an annotation is required, or the type defaults to something far less useful:

\`\`\`ts
// No initial value — inference has nothing to work from.
let total: number   // must annotate, or TypeScript infers 'any' (in non-strict mode)
total = 10
total = "ten"        // caught only because we annotated

// Function parameters are never inferred from usage — they must be
// annotated, because TypeScript doesn't look at every call site to guess.
function double(n: number): number {
  return n * 2
}
\`\`\`

Function **parameters** are the most important case to internalize: TypeScript does not scan every place a function is called to infer what type its parameters should be — that would be backwards and fragile. Parameters need explicit annotations (or, as you'll see in later modules, they can sometimes be inferred from context in specific situations like callbacks). Return types, on the other hand, usually don't need annotating — TypeScript infers a function's return type from its \`return\` statements, though many teams annotate return types on exported/public functions anyway as a form of intentional documentation and an extra safety net against accidentally changing what a function returns.

## let vs const and how it affects inference

TypeScript infers a narrower, more specific type for \`const\` than for \`let\`, because a \`const\` binding can never be reassigned:

\`\`\`ts
let direction = "north"
// inferred as: string — because 'direction' could later be reassigned
// to any other string value

const direction2 = "north"
// inferred as: "north" — the literal type itself, because 'direction2'
// can never become any other value
\`\`\`

This distinction — a general type like \`string\` versus an exact **literal type** like \`"north"\` — becomes genuinely useful once you reach union types and discriminated unions (module 4), where matching one specific literal value is often exactly the check you want. For now, the practical rule of thumb: reach for \`const\` by default, the same habit you'd already have in plain JavaScript, and TypeScript rewards it with more precise inference for free.

Arrays follow the same logic, inferring the union of element types encountered:

\`\`\`ts
const numbers = [1, 2, 3]
// inferred as: number[]

const mixed = [1, "two", 3]
// inferred as: (string | number)[] — a union, covered in module 4
\`\`\`

## any: the escape hatch, and why to avoid it

TypeScript has one type that turns off type checking entirely for a value: \`any\`. A variable typed \`any\` can be assigned anything, have any property accessed on it, and be passed anywhere — TypeScript simply stops checking it.

\`\`\`ts
let payload: any = { status: 200, body: "ok" }

payload.doesNotExist.deeplyNested.access  // No error — 'any' disables all checking
payload = "now I'm a string"              // Also no error
payload()                                  // Also no error, even though calling
                                            // a string would crash at runtime
\`\`\`

That last line is the actual danger: none of those mistakes are caught at compile time, and all of them would crash — or silently misbehave — the moment the code actually runs. Using \`any\` doesn't make code safer than plain JavaScript; it makes it *look* like type-checked TypeScript while behaving exactly like unchecked JavaScript for that value, and worse, it can silently spread — anything derived from an \`any\` value tends to also become \`any\`, quietly widening the untyped surface of a codebase over time.

\`any\` does have legitimate, narrow uses — most commonly as a temporary stopgap while migrating a JavaScript file to TypeScript (covered in module 9), or in rare cases interfacing with a genuinely untyped third-party library with no type definitions available. But reaching for it out of impatience with the type checker, rather than as a deliberate, temporary, well-understood exception, is the single most common way a TypeScript codebase quietly loses the benefits it was adopted for. Module 2 introduces \`unknown\`, a type that covers most of the situations people reach for \`any\` — accepting a value of genuinely unknown shape — while still requiring you to prove what it is before using it.

> **Key idea:** TypeScript infers types automatically from initial values, so most local variables need no annotation at all — annotations become necessary mainly for function parameters and variables declared without an initial value; \`const\` infers narrower, literal types than \`let\`; and \`any\` disables type checking entirely for a value, making it a last resort rather than a convenient default.`,
    },
  ],
}
