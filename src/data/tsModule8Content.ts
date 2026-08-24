import type { Module } from "../types"

export const tsModule8: Module = {
  id: 8,
  title: "Modules & Declaration Files",
  status: "upcoming",
  lessons: [
    {
      name: "TypeScript's Module System",
      minutes: 9,
      intro:
        "Use ES module import/export syntax in TypeScript, separate type-only imports from value imports, and understand the module resolution and CommonJS interop settings behind the scenes.",
      content: `## Modules in TypeScript are ES modules

TypeScript doesn't invent its own module syntax — it uses the same \`import\`/\`export\` syntax as modern JavaScript, and simply adds type checking on top. Any file with a top-level \`import\` or \`export\` is treated as a module, with its own scope, exactly like plain JS:

\`\`\`ts
// math.ts
export function add(a: number, b: number): number {
  return a + b
}

export const PI = 3.14159

export default class Calculator {
  total = 0
}
\`\`\`

\`\`\`ts
// main.ts
import Calculator, { add, PI } from "./math"

const calc = new Calculator()
console.log(add(2, PI))
\`\`\`

Named exports (\`add\`, \`PI\`) and a default export (\`Calculator\`) both work exactly as they do in plain JavaScript. TypeScript's contribution is purely in checking that what you import actually exists on the module you're importing from, with the correct type — try \`import { subtract } from "./math"\` and TypeScript flags it immediately as a missing export, well before you'd discover it at runtime as \`undefined\`.

## Type-only imports and exports

Sometimes an import exists purely to bring in a *type* — an interface, a type alias — with nothing at that import ever needed at runtime. TypeScript lets you mark exactly that with the \`type\` modifier:

\`\`\`ts
// user.ts
export interface User {
  id: string
  name: string
}

export function createUser(name: string): User {
  return { id: crypto.randomUUID(), name }
}
\`\`\`

\`\`\`ts
// profile.ts
import { createUser } from "./user"
import type { User } from "./user" // type-only — erased entirely from the compiled output

function printUser(user: User) {
  console.log(user.name)
}
\`\`\`

Both imports can also be combined on a single line as \`import { createUser, type User } from "./user"\`. The practical benefit: a type-only import is guaranteed to be completely erased from the compiled JavaScript output, with zero risk of an accidental runtime dependency on a module that, in a differently-configured build, might not even exist at runtime (a \`.d.ts\`-only package, for instance). This repo's own \`tsconfig.app.json\` sets \`"verbatimModuleSyntax": true\`, which actually *requires* this distinction explicitly — under that setting, an import used only as a type must be written with the \`type\` modifier, or TypeScript raises an error, precisely to keep the compiled output's module graph predictable and avoid accidentally importing something that only exists as types.

The same modifier works for re-exports:

\`\`\`ts
export type { User } from "./user"
\`\`\`

## Module resolution: how an import path gets found

When you write \`import { add } from "./math"\`, something has to decide which actual file that resolves to — \`math.ts\`? \`math/index.ts\`? Does the extension matter? That process is **module resolution**, and its behavior is controlled by the \`moduleResolution\` compiler option. This repo uses \`"moduleResolution": "bundler"\` (visible in \`tsconfig.app.json\`), which mirrors how modern bundlers like Vite and esbuild actually resolve imports at build time — it's the recommended setting for any project whose TypeScript output is handed to a bundler rather than run directly by Node.

A closely related, easy-to-misunderstand setting is \`allowImportingTsExtensions\`, also enabled in this repo's config. Normally TypeScript forbids writing the \`.ts\` extension explicitly in an import path (\`import "./math.ts"\`), because historically that path wouldn't resolve correctly once compiled to \`.js\`. With \`allowImportingTsExtensions\` on — paired with \`noEmit\` (TypeScript strictly type-checking, and something else, like Vite/esbuild, doing the actual compiling) — writing the real \`.ts\` extension is permitted and even expected in some setups, since the bundler resolving the import never needs TypeScript's own emit step to rewrite it.

## CommonJS interop

Before ES modules were standardized, Node.js used a different module system, **CommonJS** (\`require()\` / \`module.exports\`), and a large amount of the npm ecosystem — especially older packages — still ships in that format. Importing a CommonJS package from TypeScript's ES module syntax needs an interop layer, controlled by the \`esModuleInterop\` compiler option. With it enabled (the near-universal default in modern configs), \`import someLib from "some-cjs-package"\` works even when \`some-cjs-package\` was written entirely with \`module.exports = ...\`, papering over the structural mismatch between the two module formats. Without it, you'd sometimes need the more awkward \`import * as someLib from "some-cjs-package"\` form instead. In practice, virtually every modern project starter enables \`esModuleInterop\`, and it's worth knowing the flag exists mainly so an unfamiliar import error involving a CommonJS package doesn't come as a total surprise.

> **Key idea:** TypeScript modules are plain ES modules with type checking layered on top — use \`import type\`/\`export type\` for anything that's purely a type, so it's guaranteed to be erased from the compiled output (and required outright under \`verbatimModuleSyntax\`); \`moduleResolution: "bundler"\` matches how modern bundlers actually resolve imports, and \`esModuleInterop\` smooths over importing older CommonJS packages from ES module syntax.`,
    },
    {
      name: "Declaration Files (.d.ts) & declare",
      minutes: 10,
      intro:
        "Understand what a .d.ts file is, use the declare keyword to describe ambient globals and modules, and see how @types packages bring type information to untyped third-party JavaScript.",
      content: `## What a .d.ts file actually is

A **declaration file** (\`.d.ts\`) contains *only type information* — no implementation, no runtime code, nothing that gets executed. It exists to describe the shape of something whose actual code lives elsewhere, or is written in plain JavaScript with no types of its own. Every \`.ts\` file you write actually gets a matching \`.d.ts\` generated for it during a real build (when \`declaration: true\` is set) — that generated file is what lets other TypeScript projects import your compiled package and still get full type checking and autocomplete, without needing your original \`.ts\` source at all.

\`\`\`ts
// math.d.ts — pure type information, no implementation
export function add(a: number, b: number): number
export const PI: number
\`\`\`

\`\`\`js
// math.js — the actual runtime implementation, plain JavaScript
export function add(a, b) {
  return a + b
}
export const PI = 3.14159
\`\`\`

When another file imports \`"./math"\`, TypeScript uses \`math.d.ts\` for type checking while the actual code that runs at runtime is \`math.js\`. This split — types in one file, implementation in another — is exactly how the npm ecosystem ships type information for JavaScript packages that were never written in TypeScript at all.

## The declare keyword

\`declare\` tells TypeScript "trust me, this exists somewhere at runtime — just take my word for its type, and don't try to compile any implementation for it." It's the core building block of declaration files, and it comes in a few common shapes.

**Declaring a global variable** — useful when something is injected into the global scope by an external \`<script>\` tag rather than imported as a module:

\`\`\`ts
// globals.d.ts
declare const APP_VERSION: string
declare function trackEvent(name: string, data?: Record<string, unknown>): void
\`\`\`

With that declaration file included in the project, \`APP_VERSION\` and \`trackEvent(...)\` can now be referenced anywhere in the codebase as if they were ordinary in-scope values — TypeScript checks their usage against the declared types, but emits no code for the \`declare\` statements themselves; they're erased entirely, since they describe something that already exists at runtime through some other mechanism.

**Declaring an ambient module** — describing the shape of an entire module that has no types of its own, often because it's not even a JavaScript module (a build-tool-specific asset import, for instance):

\`\`\`ts
// assets.d.ts
declare module "*.svg" {
  const content: string
  export default content
}
\`\`\`

This tells TypeScript "any import path matching \`*.svg\` resolves to a module whose default export is a \`string\`" — precisely what's needed for \`import logo from "./logo.svg"\` to type-check in a Vite-style project where the bundler handles turning an SVG file into a URL string at build time, something TypeScript itself has no built-in awareness of.

## @types packages: types for existing JavaScript libraries

Most popular JavaScript libraries that weren't originally written in TypeScript have their type definitions published separately, as a companion package under the \`@types\` npm scope, maintained through the community-run **DefinitelyTyped** project:

\`\`\`bash
npm install lodash
npm install --save-dev @types/lodash
\`\`\`

Once both are installed, \`import _ from "lodash"\` gets full type checking and autocomplete, even though \`lodash\` itself ships no types — TypeScript automatically looks for a matching \`@types/<package-name>\` package during module resolution and uses its declaration files transparently. This is why installing a new untyped dependency in a TypeScript project is so often followed immediately by \`npm install --save-dev @types/<package-name>\` as a matching step, and why a "Could not find a declaration file for module 'x'" error is one of the first errors most developers learn to recognize and fix this exact way. Some packages (an increasing share, in modern releases) now ship their own \`.d.ts\` files directly inside the package itself, in which case no separate \`@types\` package is needed at all — TypeScript checks for bundled types first, before falling back to \`@types\`.

## Where declaration files come from in a project

Practically, most projects encounter \`.d.ts\` files in three ways: generated automatically for your own published packages (via the \`declaration\` compiler option), installed from \`@types/*\` for third-party libraries, or written by hand — a small \`.d.ts\` file living directly in \`src/\` (commonly \`src/vite-env.d.ts\` or similar) to declare things specific to the current project's build setup, like the SVG-import example above. The next lesson covers writing that last category yourself.

> **Key idea:** A \`.d.ts\` file carries only type information, never runtime code; \`declare\` describes something TypeScript should trust exists at runtime without compiling it — a global, or an entire ambient module pattern like \`declare module "*.svg"\`; and for third-party JavaScript libraries without their own bundled types, an \`@types/<package-name>\` package from DefinitelyTyped is usually the fastest way to get full type checking.`,
    },
    {
      name: "Writing Your Own Type Declarations",
      minutes: 9,
      intro:
        "Write a .d.ts file for an untyped module you own, augment an existing module's or global's types, and get an honest look at namespaces as a mostly-legacy feature.",
      content: `## Typing an untyped JS module you own

Suppose a project has a legacy, unconverted JavaScript utility file that other TypeScript files need to import — a realistic situation during any incremental migration (covered in full in Module 9's final lesson):

\`\`\`js
// legacy/formatters.js
export function formatCurrency(amount, currency) {
  return \`\${currency} \${amount.toFixed(2)}\`
}

export function formatPercent(value) {
  return \`\${(value * 100).toFixed(1)}%\`
}
\`\`\`

Rather than rewriting this file in TypeScript immediately, you can write a sibling declaration file describing its shape, letting every *importer* get full type checking right away while the implementation itself stays untouched:

\`\`\`ts
// legacy/formatters.d.ts
export function formatCurrency(amount: number, currency: string): string
export function formatPercent(value: number): string
\`\`\`

TypeScript automatically pairs a \`.d.ts\` file with a same-named \`.js\` file sitting alongside it — importing \`"./legacy/formatters"\` now gets type-checked against \`formatters.d.ts\`, while \`formatters.js\` continues to be exactly what actually runs. This pairing pattern is a genuinely practical incremental-adoption tool: it lets a large, gradual migration prioritize typing the *interfaces between* files before rewriting every file's internals.

## Module augmentation

Sometimes you need to *add* to a type that's declared somewhere else entirely — a library's own types, or one of TypeScript's built-in global types — without editing that original declaration (which you may not even have write access to, if it lives inside \`node_modules\`). This is **module augmentation**, and it leans directly on the declaration-merging behavior covered in Module 3's interfaces lesson.

A common real example: attaching custom data to an Express \`Request\` object after an authentication middleware runs.

\`\`\`ts
// express-augmentation.d.ts
import "express"

declare module "express" {
  interface Request {
    user?: { id: string; role: string }
  }
}
\`\`\`

That \`import "express"\` line matters — it's what marks this file as *augmenting* the existing \`"express"\` module rather than accidentally declaring a brand-new, unrelated ambient module that happens to share the name. With the augmentation in place, \`req.user\` is now a recognized, typed property everywhere an Express \`Request\` is used across the project, without ever touching Express's own shipped type definitions.

The same merging mechanism lets you extend genuinely global types, like adding a custom property to \`Window\`:

\`\`\`ts
// window-augmentation.d.ts
export {}

declare global {
  interface Window {
    analytics: {
      track(event: string, data?: Record<string, unknown>): void
    }
  }
}
\`\`\`

The empty \`export {}\` at the top forces this file to be treated as a module (rather than a script with implicitly global scope), which is what makes the explicit \`declare global { ... }\` block necessary and meaningful — inside it, declarations genuinely affect the global scope, letting \`window.analytics.track(...)\` type-check anywhere in the project.

## Namespaces: a mostly-legacy feature

Before ES modules existed as a language standard, TypeScript had its own way of organizing and namespacing code: the \`namespace\` keyword (originally called "internal modules").

\`\`\`ts
namespace Validation {
  export function isEmail(value: string): boolean {
    return value.includes("@")
  }
}

Validation.isEmail("test@example.com") // true
\`\`\`

In virtually all modern TypeScript code, ES modules (\`import\`/\`export\`, covered in this module's first lesson) have fully superseded namespaces for organizing application code — they're standard JavaScript, work with every bundler, and don't require a TypeScript-specific concept. You're unlikely to need to *write* a namespace in a typical modern project.

Where namespaces still legitimately show up is in declaration files for older, pre-ES-module JavaScript libraries — particularly ones distributed as a single global UMD-style script (think an older jQuery plugin, loaded via a \`<script>\` tag, that attaches itself to \`window\`). Their \`@types\` packages sometimes use \`namespace\` internally to group related global types and functions under one name without polluting the global scope with dozens of separate top-level declarations. If you ever open a \`.d.ts\` file for an older library and see \`namespace\`, it's worth recognizing as a historical pattern rather than something to imitate in new code — it's essentially never the right choice for project code written today, and this course mentions it here specifically so it isn't a mysterious, unrecognized keyword the first time it's encountered inside someone else's declaration file.

> **Key idea:** Pair a hand-written \`.d.ts\` file with an untyped \`.js\` file you own to type-check its importers before rewriting its internals; use module augmentation (\`declare module "existing-module" { ... }\`, or \`declare global { ... }\` alongside \`export {}\`) to add to a type declared elsewhere, leaning on the same declaration-merging behavior interfaces use; and recognize \`namespace\` as a legacy, pre-ES-module feature that still appears in older libraries' declaration files but has no real place in new application code.`,
    },
  ],
}
