import type { Module } from "../types"

export const tsModule7: Module = {
  id: 7,
  title: "Advanced Types",
  status: "upcoming",
  lessons: [
    {
      name: "Mapped Types & Built-in Utility Types",
      minutes: 11,
      intro: "Learn how mapped types transform one object type into another, then meet the built-in utility types — Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract — that are themselves just mapped/conditional types shipped with the language.",
      content: `## Transforming a type instead of writing a new one

Every type you've written so far in this course has been declared from scratch. A **mapped type** does something different: it takes an existing type and produces a *new* type by transforming each of its properties, using a syntax that looks like a \`for...in\` loop written at the type level:

\`\`\`ts
interface User {
  id: string
  name: string
  email: string
}

type ReadonlyUser = {
  readonly [K in keyof User]: User[K]
}
// equivalent to:
// { readonly id: string; readonly name: string; readonly email: string }
\`\`\`

Break that down piece by piece:

- \`keyof User\` produces the union of \`User\`'s property names as a type: \`"id" | "name" | "email"\`.
- \`[K in keyof User]\` iterates \`K\` over that union, once per member, the same way \`for (const k of keys)\` would iterate at runtime.
- \`User[K]\` is an **indexed access type** — "look up the type of property \`K\` on \`User\`" — so for \`K = "id"\` it resolves to \`string\`.
- \`readonly\` in front applies that modifier to every generated property.

The result is a brand-new object type with the same property names and value types as \`User\`, but every property additionally marked \`readonly\`. Nothing about \`User\` itself changed — \`ReadonlyUser\` is a separate, derived type.

## Adding and removing modifiers

Mapped types can add \`readonly\` and \`?\` (optional) the same way the example above added \`readonly\`, and they can also **remove** a modifier using a \`-\` prefix:

\`\`\`ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}

type Concrete<T> = {
  [K in keyof T]-?: T[K]
}
\`\`\`

\`Mutable<T>\` strips \`readonly\` from every property of whatever type \`T\` you pass in; \`Concrete<T>\` strips \`?\` so every property becomes required. This is exactly how TypeScript's own built-in utility types are implemented — there's no special compiler magic for \`Readonly<T>\` or \`Required<T>\`, they're mapped types written in a \`.d.ts\` file that ships with every TypeScript installation. Once you can read a mapped type, you can read the actual source of the utility types you use every day.

## Partial, Required, Readonly

These three are the simplest utility types — each applies one modifier across every property of \`T\`:

\`\`\`ts
interface Draft {
  title: string
  body: string
  publishedAt: Date
}

// Partial<T> — every property becomes optional
function updateDraft(id: string, patch: Partial<Draft>) {
  // patch might only include { title: "New title" } — that's fine
}

// Required<T> — every property becomes mandatory, even ones declared optional
interface Config {
  timeout?: number
  retries?: number
}
function finalizeConfig(cfg: Required<Config>) {
  // cfg.timeout and cfg.retries are guaranteed to be present here
}

// Readonly<T> — every property becomes readonly
const frozen: Readonly<Draft> = { title: "Launch", body: "...", publishedAt: new Date() }
// frozen.title = "New title" // Error: Cannot assign to 'title' because it is a read-only property
\`\`\`

\`Partial<T>\` is the one you'll reach for constantly — it's the standard shape for a "patch" or "update" argument, where a caller only needs to supply the fields they actually want to change, and everything else keeps its current value.

## Pick and Omit

\`Pick<T, K>\` and \`Omit<T, K>\` both derive a *subset* of an object type's properties, in opposite directions — \`Pick\` keeps only the listed keys, \`Omit\` keeps everything *except* the listed keys:

\`\`\`ts
interface Product {
  id: string
  name: string
  price: number
  internalCost: number
  supplierNotes: string
}

// Pick — select only the properties a public API should expose
type ProductSummary = Pick<Product, "id" | "name" | "price">
// { id: string; name: string; price: number }

// Omit — take everything except the internal-only fields
type PublicProduct = Omit<Product, "internalCost" | "supplierNotes">
// { id: string; name: string; price: number }
\`\`\`

Both are extremely common when a component or API needs "the same shape as \`X\`, minus a couple of fields" — rather than hand-writing a second, parallel interface that can silently drift out of sync with \`Product\` as it evolves, \`Omit<Product, "internalCost" | "supplierNotes">\` stays automatically correct whenever \`Product\` gains or loses unrelated fields.

## Record

\`Record<K, V>\` builds an object type where every key of type \`K\` maps to a value of type \`V\` — it's the type-level equivalent of "a dictionary from \`K\` to \`V\`":

\`\`\`ts
type Role = "admin" | "editor" | "viewer"

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
}
// Omitting a key, e.g. "viewer", is a compile error — Record requires all of them
// Adding an unlisted key, e.g. "guest", is also a compile error
</br>
type ScoreBoard = Record<string, number>
const scores: ScoreBoard = { alice: 10, bob: 7 } // any string key is allowed here
\`\`\`

\`Record<Role, string>\` is especially useful paired with a literal union like \`Role\`: TypeScript checks, at compile time, that your object supplies a value for *every* member of the union and no extras — a lookup table that can never silently miss a case as the union grows.

## Exclude and Extract

\`Exclude<T, U>\` and \`Extract<T, U>\` operate on *union types* rather than object types — they filter a union's members against another type:

\`\`\`ts
type Status = "idle" | "loading" | "success" | "error"

type NotIdle = Exclude<Status, "idle">
// "loading" | "success" | "error"

type Settled = Extract<Status, "success" | "error">
// "success" | "error"
\`\`\`

\`Exclude<T, U>\` keeps the members of \`T\` that are *not* assignable to \`U\`; \`Extract<T, U>\` keeps the members of \`T\` that *are* assignable to \`U\` — opposite filters over the same union, the same relationship \`Omit\`/\`Pick\` have for object keys.

## Summary table

| Utility type | What it does | Typical use case |
|---|---|---|
| \`Partial<T>\` | Makes every property optional | Update/patch function arguments |
| \`Required<T>\` | Makes every property mandatory | Validating a fully-resolved config |
| \`Readonly<T>\` | Makes every property readonly | Freezing a value against mutation |
| \`Pick<T, K>\` | Keeps only the listed keys | Deriving a public/summary shape |
| \`Omit<T, K>\` | Keeps everything except the listed keys | Hiding internal-only fields |
| \`Record<K, V>\` | Builds a \`{ [key]: value }\` dictionary type | Lookup tables keyed by a literal union |
| \`Exclude<T, U>\` | Removes union members assignable to \`U\` | Narrowing a union by removing cases |
| \`Extract<T, U>\` | Keeps only union members assignable to \`U\` | Narrowing a union to specific cases |

All eight are declared in TypeScript's built-in \`lib.es5.d.ts\`, available globally with no import required — and now that you've seen how \`keyof\`, indexed access, and mapped-type modifiers combine to build them, you have the tools to write your own whenever the built-in set doesn't quite match what you need.

> **Key idea:** A mapped type — \`{ [K in keyof T]: ... }\` — transforms an existing object type property-by-property, and can add or strip \`readonly\`/\`?\` modifiers with \`-readonly\`/\`-?\`; TypeScript's built-in utility types (\`Partial\`, \`Required\`, \`Readonly\`, \`Pick\`, \`Omit\`, \`Record\`, \`Exclude\`, \`Extract\`) are not compiler magic, they're ordinary mapped/conditional types written this way and shipped in the standard library.`,
    },
    {
      name: "Conditional Types & infer",
      minutes: 12,
      intro: "Write types that branch on a condition with T extends U ? X : Y, understand how conditional types distribute over unions, and use the infer keyword to pull a type out from inside another type.",
      content: `## A type-level if/else

A **conditional type** lets a type depend on a condition, evaluated at compile time, using syntax that deliberately echoes JavaScript's ternary operator:

\`\`\`ts
type IsString<T> = T extends string ? true : false

type A = IsString<"hello">  // true
type B = IsString<42>       // false
\`\`\`

Read \`T extends U ? X : Y\` as "if \`T\` is assignable to \`U\`, the result is \`X\`; otherwise, the result is \`Y\`." This isn't evaluated at runtime — there's no branch left in the compiled JavaScript at all. It's resolved entirely by the type checker while it processes your source, exactly like a Sass \`@if\` directive resolves entirely at Sass-compile time and leaves no trace in the output CSS.

A more useful, realistic example — normalizing a type so that arrays are unwrapped to their element type, but non-arrays pass through unchanged:

\`\`\`ts
type ElementType<T> = T extends (infer E)[] ? E : T

type A = ElementType<string[]>  // string
type B = ElementType<number>    // number (not an array, passes through)
\`\`\`

That example already uses \`infer\`, covered properly below — but notice the shape: a conditional type is a small function that takes a type in and produces a (possibly different) type out, branching on a structural test.

## Distributive conditional types

Something non-obvious happens when the type being tested is a **naked type parameter** and you pass it a union: the conditional type doesn't run once against the whole union, it runs once *per member* of the union and the results are unioned back together. This is called **distribution**:

\`\`\`ts
type ToArray<T> = T extends unknown ? T[] : never

type Result = ToArray<string | number>
// NOT (string | number)[]
// Actually: string[] | number[]
\`\`\`

Mentally, TypeScript treats \`ToArray<string | number>\` as \`ToArray<string> | ToArray<number>\`, evaluates each branch separately (\`string[]\` and \`number[]\`), and unions the results. This is exactly how the built-in \`Exclude<T, U>\` from the previous lesson works under the hood — its real definition is:

\`\`\`ts
type Exclude<T, U> = T extends U ? never : T
\`\`\`

Given \`Exclude<"a" | "b" | "c", "b">\`, distribution checks each member separately: \`"a" extends "b" ? never : "a"\` → \`"a"\`, \`"b" extends "b" ? never : "b"\` → \`never\`, \`"c" extends "b" ? never : "c"\` → \`"c"\`. Union those three results together and \`never\` contributes nothing (a union absorbs \`never\`), leaving \`"a" | "c"\` — exactly the filtered union you'd expect. If you ever want to opt *out* of distribution and test the union as a single whole, wrap both sides in a tuple: \`[T] extends [U] ? X : Y\` disables the per-member behavior.

## infer: pulling a type out of a type

\`infer\` can only appear inside the \`extends\` clause of a conditional type, and it declares a new type variable that TypeScript fills in by pattern-matching the structure you're testing against:

\`\`\`ts
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T

type A = UnwrapPromise<Promise<string>>  // string
type B = UnwrapPromise<number>           // number (doesn't match Promise<...>, passes through)
\`\`\`

Read \`T extends Promise<infer V>\` as: "if \`T\` has the shape \`Promise<something>\`, capture that *something* into a new type variable \`V\`, and make the result of the whole expression be \`V\`." It's structural pattern matching at the type level — you're not just testing "is this a Promise," you're reaching *inside* the Promise and pulling out its resolved-value type.

The same technique works to extract a function's return type:

\`\`\`ts
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never

function getUser() {
  return { id: "u1", name: "Ada" }
}

type User = MyReturnType<typeof getUser>
// { id: string; name: string }
\`\`\`

\`T extends (...args: never[]) => infer R\` matches any function type and captures whatever comes after the \`=>\` into \`R\`. \`typeof getUser\` (covered back in an earlier module) turns the *value* \`getUser\` into the *type* of that function, which is then fed into \`MyReturnType\`.

## Where the built-ins come from

\`MyReturnType\` above isn't a toy — it's essentially the real implementation of TypeScript's built-in \`ReturnType<T>\` utility type, and the same pattern extends naturally to a couple of other utilities you'll use constantly:

\`\`\`ts
// ReturnType<T> — extract a function's return type
type Handler = () => { status: number; body: string }
type HandlerResult = ReturnType<Handler>
// { status: number; body: string }

// Parameters<T> — extract a function's parameter types as a tuple
type Fn = (id: string, retries: number) => void
type FnArgs = Parameters<Fn>
// [id: string, retries: number]

// Awaited<T> — recursively unwrap nested Promises (handles Promise<Promise<T>> too)
async function fetchUser() {
  return { id: "u1" }
}
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>
// { id: string }
\`\`\`

\`Awaited<T>\` in particular is what makes \`async\`/\`await\` type-safe throughout your codebase — every \`await someAsyncFn()\` expression is typed by feeding \`ReturnType<typeof someAsyncFn>\` (which is a \`Promise<...>\`) through something conceptually identical to \`Awaited\`, recursively unwrapping until it hits a non-Promise. You'll rarely write \`infer\` yourself day to day, but recognizing it means the built-in utility types stop being a memorized list and become things you could derive yourself.

> **Key idea:** \`T extends U ? X : Y\` branches on a structural test at compile time, distributing automatically over each member when \`T\` is a naked union type parameter; \`infer\` inside the \`extends\` clause captures a piece of the matched structure into a new type variable, which is exactly how built-ins like \`ReturnType\`, \`Parameters\`, and \`Awaited\` extract information from function and Promise types.`,
    },
    {
      name: "Template Literal Types",
      minutes: 10,
      intro: "Build string types out of literal pieces and unions with template literal type syntax, and use TypeScript's intrinsic string manipulation types to model precise, typo-proof string shapes like event names.",
      content: `## String types with structure

Every string literal type you've used so far has been a single fixed value — \`"success"\`, \`"admin"\`, and so on. **Template literal types** let you build a string type out of a template, using the exact same \`\${ }\` interpolation syntax as a runtime JavaScript template literal, but at the type level:

\`\`\`ts
type Greeting = \`hello \${string}\`

const a: Greeting = "hello world"   // OK — matches the pattern
const b: Greeting = "hello"          // Error — missing the required " " + string after "hello"
const c: Greeting = "hi there"       // Error — doesn't start with "hello "
\`\`\`

\`hello \${string}\` isn't one value, it's a whole *category* of string values — anything starting with the literal text \`"hello "\` followed by any \`string\`. This on its own is a fairly loose constraint (any string can follow), but the real power shows up once you interpolate a union instead of the wide \`string\` type.

## Interpolating a union produces a union

When you place a union of literal types inside the \`\${ }\`, TypeScript doesn't produce one loose string pattern — it expands the template across every member of the union, producing a union of every resulting combination:

\`\`\`ts
type Corner = "top" | "bottom"
type Side = "left" | "right"

type Position = \`\${Corner}-\${Side}\`
// "top-left" | "top-right" | "bottom-left" | "bottom-right"
\`\`\`

TypeScript computed the full cross product of \`Corner\` and \`Side\` and produced exactly those four literal strings as a union — nothing else is assignable to \`Position\`. This scales the same way with more pieces or larger unions; a template literal type with two three-member unions interpolated into it would produce nine literal combinations, all still individually checked at compile time.

## A practical example: typed event names

A very common real-world use is deriving a set of valid "handler" or "event" names from a set of base event names, mirroring a naming convention your code actually follows at runtime:

\`\`\`ts
type DomEvent = "click" | "focus" | "scroll"

type HandlerName = \`on\${Capitalize<DomEvent>}\`
// "onClick" | "onFocus" | "onScroll"

interface Handlers {
  onClick?: () => void
  onFocus?: () => void
  onScroll?: () => void
}

function registerHandler(name: HandlerName, fn: () => void) {
  // ...
}

registerHandler("onClick", () => console.log("clicked"))
registerHandler("onSubmit", () => {})
// Error: Argument of type '"onSubmit"' is not assignable to parameter of type 'HandlerName'
\`\`\`

\`registerHandler("onSubmit", ...)\` fails to compile immediately — there's no runtime check needed, no unit test needed, to catch that \`"onSubmit"\` isn't a real handler name for this system. The typo (or genuinely nonexistent event) is caught the moment it's written, the same category of guarantee a discriminated union gave you for a fixed set of object shapes back in an earlier module, now applied to strings themselves.

## The four intrinsic string manipulation types

That \`Capitalize<DomEvent>\` in the example above is one of four built-in **intrinsic types** the compiler provides specifically for use inside template literal types — they don't exist as ordinary TypeScript code, they're implemented directly in the compiler because manipulating individual characters isn't otherwise expressible in the type system:

\`\`\`ts
type A = Uppercase<"click">    // "CLICK"
type B = Lowercase<"CLICK">    // "click"
type C = Capitalize<"click">   // "Click"
type D = Uncapitalize<"Click"> // "click"
\`\`\`

| Intrinsic type | Effect |
|---|---|
| \`Uppercase<S>\` | Converts every character to upper case |
| \`Lowercase<S>\` | Converts every character to lower case |
| \`Capitalize<S>\` | Upper-cases only the first character |
| \`Uncapitalize<S>\` | Lower-cases only the first character |

Combined with plain template literal interpolation, these four cover the overwhelming majority of real-world string-shape modeling: prefixing (\`get\${Capitalize<Field>}\` for a getter name), namespacing (\`app:\${EventName}\`), CSS-like key generation (\`--\${string}\` for a custom property name), and route-parameter patterns (\`/users/\${string}\`).

## Where this stops being worth it

Template literal types are precise, but that precision comes at a cost worth naming honestly: a large interpolated union (say, three unions of ten members each) produces a thousand-member literal union under the hood, which can slow down type checking and produce genuinely unreadable error messages if something doesn't match. Reach for a template literal type when the string shape is a real, load-bearing contract in your code — event names, route patterns, a small fixed set of CSS custom property names — not as a reflex for every string field. For a field that's just "some free-form text a user typed," \`string\` remains the right, honest type.

> **Key idea:** A template literal type builds string types from a pattern using \`\${ }\` interpolation, and interpolating a union produces the full cross-product union of literal strings rather than a single loose pattern; combined with the four intrinsic types (\`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`), this lets you model precise, typo-checked string contracts like event names — reserve it for genuine string contracts, not every \`string\` field in your codebase.`,
    },
  ],
}
