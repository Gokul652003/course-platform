import type { Module } from "../types"

export const tsModule10: Module = {
  id: 10,
  title: "Advanced Patterns & Production Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Type-Safe Design Patterns",
      minutes: 10,
      intro:
        "Simulate nominal typing with branded types, type a generic builder pattern, and deepen the never-based exhaustiveness check first introduced with discriminated unions.",
      content: `## The problem structural typing creates

Module 3 covered why TypeScript's structural typing is usually a strength — any value with a matching shape satisfies a type, with no explicit declaration required. But that same flexibility becomes a liability when two types happen to share an identical structure while meaning something completely different:

\`\`\`ts
type UserId = string
type PostId = string

function getUser(id: UserId) {
  /* ... */
}

const postId: PostId = "post_492"
getUser(postId) // No error! Both are just 'string' underneath.
\`\`\`

Structurally, \`UserId\` and \`PostId\` are both plain \`string\` — TypeScript has no way to tell them apart, so passing a post's id where a user's id is expected compiles cleanly and fails only at runtime, likely as a confusing "user not found" bug far from where the mistake was actually made.

## Branded types

A **branded type** (also called a nominal type, or tagged type) fixes this by intersecting the real type with a small, otherwise-meaningless marker property that only exists at the type level — never at runtime:

\`\`\`ts
type UserId = string & { readonly __brand: "UserId" }
type PostId = string & { readonly __brand: "PostId" }

function getUser(id: UserId) {
  /* ... */
}

function toUserId(raw: string): UserId {
  return raw as UserId
}

const userId = toUserId("user_17")
const postId = "post_492" as PostId

getUser(userId) // ok
getUser(postId) // Error: Argument of type 'PostId' is not assignable to parameter of type 'UserId'
\`\`\`

Two things make this work. First, \`__brand\` is never actually present on any real value at runtime — no object literal naturally has that property, so the *only* way to obtain a \`UserId\` is through an explicit type assertion, typically wrapped in a small constructor function like \`toUserId\` that becomes the single, deliberate place a plain \`string\` is "promoted" into a \`UserId\`. Second, because the brand differs (\`"UserId"\` vs \`"PostId"\`), the two types are no longer structurally interchangeable, even though at runtime they're both still just ordinary strings — the entire mechanism is compile-time-only, with zero runtime cost or behavior change. This pattern is exactly how you simulate the nominal typing found by default in languages like Java or C#, opting into it deliberately for the specific handful of types in a codebase where mixing them up would be a genuine, hard-to-catch bug (ids, currency amounts of different units, sanitized versus unsanitized strings).

## A generic builder pattern

Generics (Module 6) and method chaining combine naturally into a type-safe **builder pattern** — an object that accumulates configuration through chained calls, where each call returns a type reflecting what's been configured so far:

\`\`\`ts
class RequestBuilder<T = {}> {
  private config: T

  constructor(config: T) {
    this.config = config
  }

  withUrl(url: string): RequestBuilder<T & { url: string }> {
    return new RequestBuilder({ ...this.config, url })
  }

  withMethod(method: "GET" | "POST"): RequestBuilder<T & { method: "GET" | "POST" }> {
    return new RequestBuilder({ ...this.config, method })
  }

  build(this: RequestBuilder<{ url: string; method: "GET" | "POST" }>): T {
    return this.config
  }
}

const request = new RequestBuilder({})
  .withUrl("/api/users")
  .withMethod("GET")
  .build() // ok — both url and method were set

const incomplete = new RequestBuilder({})
  .withUrl("/api/users")
  .build() // Error: 'method' is missing — the 'this' parameter type isn't satisfied yet
\`\`\`

Each \`with...\` method returns a \`RequestBuilder\` whose generic parameter has grown by intersecting in a new required field, and \`build()\`'s special \`this\` parameter type (a TypeScript feature that constrains what \`build\` can be called on, without adding a real parameter) only accepts a fully-configured builder. Calling \`.build()\` before every required field has been chained in is a compile error, not a runtime surprise — the type system enforces the builder's completion order without any runtime validation code at all. This is a more advanced pattern than most day-to-day code needs, but it's a genuinely instructive example of generics doing real structural work, accumulating a type across a chain of calls.

## Revisiting exhaustiveness checking

Module 4's discriminated unions lesson introduced the \`never\`-based exhaustiveness check — a \`default\` case that assigns the unhandled remainder of a \`switch\` to a \`never\`-typed parameter, so adding a new union member without updating every relevant \`switch\` becomes a compile error rather than a silent runtime bug. That same technique generalizes beyond \`switch\` statements to any place you're meant to handle every member of a union exhaustively — a chain of \`if\`/\`else if\` branches, for instance:

\`\`\`ts
type PaymentMethod = "card" | "paypal" | "bank_transfer"

function processingFee(method: PaymentMethod): number {
  if (method === "card") return 0.029
  if (method === "paypal") return 0.034
  if (method === "bank_transfer") return 0.008
  const _exhaustive: never = method
  return _exhaustive
}
\`\`\`

Adding a fourth \`PaymentMethod\` without adding a matching \`if\` branch immediately breaks the \`const _exhaustive: never = method\` line, since \`method\` would then still be narrowed to that new, unhandled literal at that point — not \`never\`. This is worth treating as a standing habit any time a function branches over every member of a known, closed union: write the exhaustiveness check once, and every future addition to that union gets a free, precise compile-time reminder pointing at exactly the function that needs updating.

> **Key idea:** Branded types (\`T & { readonly __brand: "X" }\`) simulate nominal typing to stop structurally-identical-but-conceptually-different values (like two different kinds of id) from being interchanged by mistake; a generic builder can accumulate required fields into its type through a chain of calls, rejecting an incomplete build at compile time; and the \`never\`-based exhaustiveness check from Module 4 generalizes to any exhaustive branching over a closed union, not just \`switch\` statements.`,
    },
    {
      name: "Linting, Type Checking & Performance in CI",
      minutes: 9,
      intro:
        "Run tsc as an explicit CI type-check step, understand what ESLint's TypeScript plugin adds on top of the compiler, and keep the type checker itself fast as a codebase grows.",
      content: `## Type checking is not automatically part of your build

This is worth restating plainly, because it's a genuinely common production surprise, and Module 1's second lesson flagged it as a forward reference to this exact point: bundlers like Vite (via esbuild) and many other modern build tools **strip TypeScript types without checking them**. They transpile \`.ts\` to \`.js\` file-by-file, deleting type annotations as they go, entirely for speed — esbuild in particular does not build or consult a full type graph at all. That means a project can have type errors scattered throughout its source and still build and deploy successfully, with the errors only surfacing later if a developer happens to run \`tsc\` locally, or not at all until they cause a runtime crash.

\`\`\`bash
npm run build
# ✓ built in 1.2s — even if the source has real type errors, because esbuild never checked them
\`\`\`

The fix is straightforward but easy to skip: **run \`tsc\` as an explicit step**, separate from the bundler build, and fail the pipeline if it reports any errors.

\`\`\`bash
npx tsc --noEmit
\`\`\`

\`--noEmit\` tells \`tsc\` to do the full type-check pass and report every error, but skip writing out any compiled \`.js\` files — appropriate here because the bundler is what's actually producing the shipped output; \`tsc\`'s only job in this setup is verification. This repo's own \`package.json\` already reflects the correct pattern:

\`\`\`json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty"
  }
}
\`\`\`

Notice \`build\` runs \`tsc -b\` (build mode, which type-checks using project references) *before* \`vite build\` — if \`tsc\` reports any error, the \`&&\` means \`vite build\` never even runs, and the whole command exits non-zero. Wiring exactly this — a real \`tsc\` invocation that can fail the build — into a CI pipeline's required checks is what actually turns TypeScript's promises into an enforced guarantee, rather than a suggestion individual developers may or may not follow before pushing.

## What ESLint adds beyond tsc

\`tsc\` answers one question: "does this code type-check?" It says nothing about code *style*, and relatively little about patterns that are *technically* type-safe but still risky or unidiomatic. That's the gap **ESLint**, specifically its \`@typescript-eslint\` plugin, fills — it's a linter that understands TypeScript's type information and can flag things \`tsc\` has no opinion on at all:

\`\`\`ts
// tsc: perfectly valid, no error at all
const value: any = fetchSomething()
value.whatever.deeply.nested.property

// @typescript-eslint, with the right rule enabled, flags this:
// "Unexpected any. Specify a different type." (no-explicit-any)
\`\`\`

Other common \`@typescript-eslint\` rules include flagging unnecessary type assertions, unsafe non-null assertions (\`value!\`) used carelessly, floating (unhandled) Promises, and inconsistent use of \`type\` versus \`interface\`. The relationship between the two tools is complementary, not competitive: \`tsc\` is the non-negotiable correctness gate (code that doesn't type-check is simply wrong), while ESLint enforces a team's chosen style and catches type-safe-but-risky patterns the compiler was never designed to flag. A mature project's CI pipeline typically runs both as separate, independent checks — this repo uses \`oxlint\` (visible as the \`lint\` script in \`package.json\`), a fast Rust-based linter in the same category, as its own choice of that second layer.

## Keeping the type checker fast

As a codebase grows, \`tsc\`'s check time can grow with it — noticeably, on a large enough project. A few concrete levers keep it manageable:

- **\`skipLibCheck: true\`** (already set in this repo's \`tsconfig.app.json\`) skips type-checking the internals of \`.d.ts\` files from \`node_modules\`, trusting that published library types are already correct. This is overwhelmingly the biggest single win for check speed on most real projects, since a large share of total declaration volume in \`node_modules\` would otherwise be re-verified on every run for no practical benefit.
- **Project references and incremental builds** (\`tsc -b\`, backed by a \`.tsbuildinfo\` cache file — this repo's \`tsconfig.app.json\` points one at \`./node_modules/.tmp/tsconfig.app.tsbuildinfo\`) let \`tsc\` skip re-checking files that haven't changed since the last run, splitting a large project into independently-cacheable pieces rather than re-verifying everything from scratch on every invocation.
- **Avoid deeply recursive or excessively complex conditional/mapped types** in your own code. The type checker itself has to *evaluate* these at compile time, and a sufficiently deep recursive type (say, a hand-rolled deep-clone or deep-partial type applied to a very large, deeply nested interface) can measurably slow down checking across an entire project, or in extreme cases hit TypeScript's own recursion depth limits.

None of these need constant attention — they're mostly "set once, in the project's tsconfig, and forget," but worth recognizing as the actual levers available if a project's \`tsc\` step starts noticeably slowing down CI as it grows.

> **Key idea:** Bundlers like Vite strip types without checking them, so a project must run \`tsc --noEmit\` (or \`tsc -b\`) as its own explicit, CI-enforced step, or type errors can ship undetected; \`@typescript-eslint\` complements the compiler by catching type-safe-but-risky patterns and style issues \`tsc\` has no opinion on; and \`skipLibCheck\` plus incremental/project-reference builds are the main levers for keeping the type checker itself fast as a codebase grows.`,
    },
    {
      name: "TypeScript vs JavaScript: An Honest Comparison",
      minutes: 11,
      intro:
        "Weigh what TypeScript genuinely buys you against what it genuinely costs, and close out the course with a clear-eyed view of when it's the right tool and when plain JavaScript still is.",
      content: `## What this comparison is, and isn't

Ten modules in, you've written real generics, narrowed real unions, typed real classes, read real declaration files, and wired a real strictness-flagged \`tsconfig.json\`. That hands-on experience is what makes an honest comparison possible now, rather than at the very start of the course, where it would have just been a list of claims to take on faith. This lesson doesn't argue TypeScript is strictly better than JavaScript, or the reverse — it lays out, plainly, what each side of that tradeoff actually costs and buys, so the choice for a given project can be a genuinely informed one.

## What TypeScript definitively buys you

**Refactor safety.** This is arguably TypeScript's single biggest practical payoff on any codebase past a small size. Rename a function's parameter, change a return type, remove a property from an interface — every affected call site across the entire project lights up immediately, at the exact line that needs attention, rather than being discovered one at a time as runtime errors, possibly in production, possibly weeks later. The discriminated-union exhaustiveness pattern from Modules 4 and 10 is this same benefit taken to its logical extreme: adding a new case to a closed set of variants is *guaranteed* to surface every place that needs updating.

**Editor tooling.** Autocomplete that actually knows what properties and methods exist on a value, inline documentation on hover, "go to definition" that reliably lands on the right declaration, "find all references" that's actually accurate rather than a text search — all of this is powered directly by the same type information the compiler checks. This isn't a separate feature bolted on top; it's the same static analysis serving two purposes at once, and it materially changes how fast unfamiliar code (your own from six months ago, or a large open-source dependency) can be explored and understood.

**Self-documenting APIs.** A function signature like \`function createUser(name: string, role?: "admin" | "member"): User\` tells a reader everything about how to call it correctly without needing to open the implementation, read a comment, or guess from a call site found elsewhere in the codebase. That documentation can't silently drift out of date the way a prose comment can, either — the compiler enforces that the signature and the implementation actually agree.

**Catching a real, common class of bugs before runtime.** Passing the wrong argument type, forgetting to handle \`null\`/\`undefined\`, misspelling a property name, mixing up two similarly-shaped objects — none of these are exotic mistakes; they're everyday typos and oversights, and TypeScript catches an enormous share of them at the point they're written, in the editor, rather than at the point a user triggers them in production.

## What it genuinely costs

**A real build step, and a real relationship with your bundler to understand.** Module 1 and this module's second lesson both covered this directly: TypeScript needs to be compiled (or at minimum, transpiled and separately type-checked) before it runs anywhere, and getting that pipeline wrong — skipping the explicit \`tsc\` check, as bundlers like Vite don't do it for you — genuinely does let type errors ship. That's not a hypothetical risk; it's a config mistake that happens on real projects.

**No runtime effect, and no runtime honesty guarantee.** Every type annotation is erased by the time code actually runs. An incorrect type assertion (\`value as SomeType\`), an \`any\` slipped in somewhere, or data arriving from an external API with a shape that doesn't match its declared type — none of these are caught at runtime, because TypeScript's checking only ever happens once, at compile time. A codebase can look fully, confidently typed and still have real, silent gaps at every boundary where data enters from outside the type system's view (an HTTP response, \`JSON.parse\`, user input) unless that boundary is validated explicitly.

**Authoring overhead and a real learning curve.** Writing correct, precise types — especially the advanced ones from Modules 6 and 7: generic constraints, conditional types, \`infer\`, mapped types — takes real time and real practice to get comfortable with, and a team without that comfort can end up either reaching for \`any\` everywhere (forfeiting most of the actual benefit) or getting stuck fighting the type checker on code that would have worked fine, untyped, in plain JavaScript.

**Not every project needs it.** A ten-line script, a quick one-off data-processing task, a throwaway prototype meant to be deleted in a week — the overhead of types, a build step, and a \`tsconfig.json\` genuinely isn't worth it for code that short-lived and that small in scope. Plain JavaScript remains the pragmatic, faster choice for a large category of small, disposable, or exploratory code.

## Where the honest line actually falls

The pattern across nearly every point above is the same: TypeScript's value scales with a project's **size, lifetime, and number of collaborators**. A small script touched once stays a script. A shared library, a production application maintained by a team over years, an API contract consumed by other services — these are exactly the situations where refactor safety, self-documenting signatures, and compile-time bug-catching compound in value the longest, and where the up-front cost of a build step and a learning curve pays for itself many times over across the project's lifetime. The honest recommendation, then, isn't "always use TypeScript" or "only use it for large projects" as a rigid rule — it's to actually weigh, for a given piece of code, how long it will live and how many people will touch it, and let that answer the question rather than defaulting reflexively in either direction.

> **Key idea:** TypeScript buys real, compounding value — refactor safety, accurate editor tooling, self-documenting signatures, and a large class of bugs caught before runtime — in exchange for a real build step, zero runtime enforcement (types are erased, so external data still needs validation at the boundary), and genuine authoring overhead while learning its more advanced features. That tradeoff tips further toward TypeScript the larger, longer-lived, and more collaborative a project is — and toward plain JavaScript for small, short-lived, disposable code — which is exactly the judgment this course set out to make possible from real experience rather than from a summary paragraph read on day one.`,
    },
  ],
}
