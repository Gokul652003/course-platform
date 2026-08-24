import type { Module } from "../types"

export const tsModule3: Module = {
  id: 3,
  title: "Functions & Object Types",
  status: "upcoming",
  lessons: [
    {
      name: "Typing Functions",
      minutes: 10,
      intro:
        "Annotate parameters and return values, handle optional/default/rest parameters, write function type expressions, and layer multiple call signatures with overloads.",
      content: `## Why type a function at all

A JavaScript function gives you no guarantees about what it accepts or what it hands back. Call \`formatPrice(19.99, "USD")\` today, and next month someone refactors it to take an options object instead — every call site keeps compiling, keeps running, and silently produces garbage until a user notices a broken price on a checkout page. TypeScript closes that gap at the boundary that matters most: the function signature. Once a function's parameters and return type are annotated, every call site is checked against that contract at compile time, and every change to the contract immediately lights up every call site that no longer satisfies it.

\`\`\`ts
function formatPrice(amount: number, currency: string): string {
  return \`\${currency} \${amount.toFixed(2)}\`
}

formatPrice(19.99, "USD") // ok
formatPrice("19.99", "USD") // Error: Argument of type 'string' is not assignable to parameter of type 'number'.
\`\`\`

The pieces here are exactly what you'd expect: each parameter gets a \`: type\` annotation, and the return type is annotated after the closing parenthesis, before the function body's \`{\`. Note that the *return type* is often something TypeScript can infer perfectly well on its own — but writing it explicitly on any function that's part of a module's public surface (exported, used elsewhere) is a strong habit. It documents intent, and it catches the case where a change to the function body accidentally changes what it returns, rather than letting that change propagate silently to every caller.

## Optional parameters

Not every parameter is required. Mark a parameter optional with \`?\` right after its name, and TypeScript will allow callers to omit it — but inside the function body, that parameter's type is now unioned with \`undefined\`, since "omitted" and "\`undefined\`" are the same thing at the call boundary:

\`\`\`ts
function greet(name: string, title?: string): string {
  // title: string | undefined
  if (title) {
    return \`Hello, \${title} \${name}\`
  }
  return \`Hello, \${name}\`
}

greet("Ortiz") // "Hello, Ortiz"
greet("Ortiz", "Dr.") // "Hello, Dr. Ortiz"
\`\`\`

A hard rule worth internalizing early: **optional parameters must come after all required parameters.** \`function f(a?: number, b: number)\` is a compile error — TypeScript (like JavaScript itself) has no way to let a caller skip \`a\` while still supplying \`b\` positionally, so it refuses to let you write a signature that could never be satisfied unambiguously.

## Default parameters

A default parameter supplies a fallback value that's used whenever the caller omits the argument (or explicitly passes \`undefined\`). Unlike an optional parameter, you don't need a \`?\` — the presence of a default value already tells TypeScript the parameter can be left out, and it infers the parameter's type from the default value if you don't annotate it yourself:

\`\`\`ts
function createUser(name: string, role = "member") {
  // role: string, inferred from the default value "member"
  return { name, role }
}

createUser("Priya") // { name: "Priya", role: "member" }
createUser("Priya", "admin") // { name: "Priya", role: "admin" }
\`\`\`

Default parameters can reference earlier parameters, and — like optional parameters — must generally come after required ones for the same call-site reasons.

## Rest parameters

A rest parameter collects any number of trailing arguments into a single typed array, using the same \`...\` syntax as JavaScript, now with a type annotation on the array itself:

\`\`\`ts
function sum(...values: number[]): number {
  return values.reduce((total, n) => total + n, 0)
}

sum(1, 2, 3) // 6
sum(1, 2, 3, 4, 5) // 15
\`\`\`

There can be at most one rest parameter, and it must be the last parameter in the list — again mirroring plain JavaScript's own rule, just now with a type attached to the collected array.

## Function type expressions

So far every function has been a *declaration*. But you'll constantly need to describe the *type of a function itself* — as a parameter to a higher-order function, a property on an object, or a variable holding a callback. That's what a **function type expression** is for: \`(param: type, ...) => returnType\`, which looks like an arrow function but is a type, not a value.

\`\`\`ts
function applyDiscount(price: number, discountFn: (p: number) => number): number {
  return discountFn(price)
}

applyDiscount(100, (p) => p * 0.9) // 90
\`\`\`

Here \`discountFn: (p: number) => number\` says "a function that takes a number and returns a number" — TypeScript then checks the arrow function passed at the call site against that shape. This is the same mechanism you'll use constantly for event handlers, array callbacks with custom logic, and any place a function is treated as data rather than immediately called.

You can also name a function type with a type alias, which is usually clearer once the shape gets reused:

\`\`\`ts
type Comparator<T> = (a: T, b: T) => number

function sortBy<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare)
}
\`\`\`

(The \`<T>\` generic syntax here is previewed for context — Module 6 covers generics in full depth. For now, just recognize \`Comparator<T>\` as a reusable named function type.)

## Function overloads

Occasionally a single function genuinely behaves differently depending on the *shape* of its arguments — not just their values — in a way one signature can't capture precisely. TypeScript lets you declare multiple **overload signatures** above a single implementation:

\`\`\`ts
function parseInput(value: string): string[]
function parseInput(value: string, delimiter: string): string[]
function parseInput(value: string, delimiter = ","): string[] {
  return value.split(delimiter)
}

parseInput("a,b,c") // string[], uses the first overload
parseInput("a|b|c", "|") // string[], uses the second overload
\`\`\`

Each line ending in \`: string[]\` above the real implementation is an overload signature — a possible way this function can be called, from the caller's point of view. The final function (with the body) is the **implementation signature**, and it is not itself visible to callers — it must be general enough to handle every overload's parameter shapes, which is why its \`delimiter\` parameter has a default rather than being simply optional like the second overload declares. TypeScript checks calls against the overload signatures, not the implementation signature directly.

A more realistic case is when the *return type* genuinely differs based on an argument's literal value:

\`\`\`ts
function createElement(tag: "img"): HTMLImageElement
function createElement(tag: "a"): HTMLAnchorElement
function createElement(tag: string): HTMLElement
function createElement(tag: string): HTMLElement {
  return document.createElement(tag)
}

const img = createElement("img") // HTMLImageElement, not just HTMLElement
const link = createElement("a") // HTMLAnchorElement
\`\`\`

Overloads are a real feature, but reach for them sparingly — they add real complexity, and a union parameter type or a generic function can often express the same idea with a single signature that's easier to read and maintain. Use overloads specifically when the *relationship* between an argument and the return type can't be captured any other way, as in the \`createElement\` example above, where the return type depends on the literal value of the argument rather than just its general type.

> **Key idea:** Annotate a function's parameters and return type to turn its signature into a checked contract; use \`?\` for optional parameters, \`= value\` for defaults, and \`...rest: T[]\` for variadic arguments (optional and default parameters must trail required ones); describe a function *as a value* — a callback, a stored handler — with a function type expression like \`(x: T) => U\`, optionally named via a type alias; and reach for overload signatures only when a single signature genuinely cannot express how the return type depends on which argument shape was passed.`,
    },
    {
      name: "Object Types & Interfaces",
      minutes: 10,
      intro:
        "Describe the shape of objects with inline object type literals and named interface declarations, including optional properties, readonly properties, index signatures, and nested shapes.",
      content: `## Inline object type literals

The simplest way to describe an object's shape is to write the shape directly, right where you need it — an **object type literal**, using the same \`{ }\` syntax you'd use for the value itself, but with types instead of values:

\`\`\`ts
function printCoordinate(point: { x: number; y: number }) {
  console.log(\`(\${point.x}, \${point.y})\`)
}

printCoordinate({ x: 3, y: 7 }) // ok
printCoordinate({ x: 3 }) // Error: Property 'y' is missing
printCoordinate({ x: 3, y: 7, z: 1 }) // Error: Object literal may only specify known properties
\`\`\`

Two things worth noticing immediately. First, properties are separated with \`;\` or \`,\` inside a type literal (both are accepted; \`;\` is the more common convention and what this course uses). Second, that last error — passing an *extra* property \`z\` — is a TypeScript-specific check called **excess property checking**, and it only fires on object literals passed directly at a call site. It exists because a typo like \`{ x: 3, y: 7, zz: 1 }\` (meant to be \`z\`) is far more likely to be a mistake than an intentional extra field, and TypeScript would otherwise have no way to catch it — structurally, an object with an extra property is still assignable to a type that only requires a subset of properties (this is explored further in the next lesson).

## Named interfaces

Writing the same object shape inline every time it's needed gets repetitive and, worse, gives TypeScript no way to tell you two functions expect *the same kind of thing*. An \`interface\` gives a shape a name you can reuse everywhere:

\`\`\`ts
interface Point {
  x: number
  y: number
}

function printCoordinate(point: Point) {
  console.log(\`(\${point.x}, \${point.y})\`)
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}
\`\`\`

Both functions now clearly operate on the same concept, and if \`Point\` ever needs a third dimension, adding \`z: number\` to the interface immediately flags every function that isn't ready to handle it.

## Structural typing: what actually satisfies an interface

This is the single most important idea to internalize about TypeScript's type system, and it's genuinely different from how nominally-typed languages like Java or C# work. In those languages, a class must explicitly declare \`implements SomeInterface\` to be considered compatible with it — compatibility is a matter of declared *identity*. TypeScript instead uses **structural typing**: any value whose *shape* matches an interface satisfies it, with no explicit relationship required at all.

\`\`\`ts
interface Point {
  x: number
  y: number
}

const location = { x: 10, y: 20, label: "home" }

printCoordinate(location) // ok — location has at least an x and a y, structurally
\`\`\`

Notice \`location\` was never declared as a \`Point\` anywhere, and it has an *extra* property (\`label\`) beyond what \`Point\` requires — and it's still accepted, because this is a plain variable being passed, not an object literal written directly at the call site (excess property checking, from the previous section, is specifically a check on *literals*, not on values already assigned to a variable). This "if it walks like a duck" model is why TypeScript can add types to existing untyped JavaScript so smoothly: values don't need to be constructed with any particular type in mind to satisfy one.

## Optional and readonly properties

Object type properties support the same \`?\` you saw on function parameters, and add a new modifier, \`readonly\`, that has no function-parameter equivalent:

\`\`\`ts
interface Config {
  readonly apiUrl: string
  timeout?: number
}

function loadConfig(): Config {
  return { apiUrl: "https://api.example.com" }
}

const config = loadConfig()
config.timeout = 5000 // ok — timeout is optional, not readonly
config.apiUrl = "https://evil.example.com" // Error: Cannot assign to 'apiUrl' because it is a read-only property
\`\`\`

\`readonly\` is a compile-time-only guarantee — it prevents *reassignment through this type*, but it does not deep-freeze the object at runtime the way \`Object.freeze()\` does, and it doesn't stop some other piece of code holding a differently-typed (or untyped) reference to the same object from mutating it. It's a discipline tool for the code that goes through the typed reference, not a runtime lock.

## Index signatures

Sometimes you don't know a value's property names ahead of time — only the shape those names and their values take, such as a dictionary keyed by arbitrary strings. An **index signature** describes exactly that:

\`\`\`ts
interface WordCounts {
  [word: string]: number
}

const counts: WordCounts = { the: 42, a: 17, and: 9 }
counts.the // number
counts["something-not-yet-set"] // still typed as number, even though the key doesn't exist yet
\`\`\`

That last line is the sharp edge of index signatures worth knowing up front: TypeScript trusts the index signature completely, so reading a key that was never actually set still type-checks as \`number\` — it just happens to be \`undefined\` at runtime. Enabling the \`noUncheckedIndexedAccess\` compiler flag (covered in Module 9) changes this by folding \`| undefined\` into every indexed read, which is often what you actually want for dictionary-shaped data.

An interface can mix a known, named property with an index signature, as long as the named property's type is compatible with the index signature's value type:

\`\`\`ts
interface Scoreboard {
  [player: string]: number
  highestPossible: number // must be a number, same as the index signature's value type
}
\`\`\`

## Nested object types

Object types nest exactly the way the JavaScript objects they describe do — a property's type can itself be another object type or interface:

\`\`\`ts
interface Address {
  street: string
  city: string
  postalCode: string
}

interface Customer {
  name: string
  address: Address
  shippingAddress?: Address // optional — falls back to 'address' if not provided
}

function formatShipping(customer: Customer): Address {
  return customer.shippingAddress ?? customer.address
}
\`\`\`

Breaking a large shape into smaller named interfaces like \`Address\` above, rather than inlining everything into one sprawling \`Customer\` type, keeps each piece independently reusable (a function that only cares about addresses can accept \`Address\` directly) and keeps error messages focused on the specific nested piece that's actually wrong, rather than dumping the entire outer shape into every type error.

> **Key idea:** Describe an object's shape either inline (\`{ x: number; y: number }\`) for a one-off, or with a named \`interface\` for anything reused across a codebase; remember TypeScript checks shape *structurally* — any value with matching properties satisfies an interface regardless of how it was created — and reach for \`?\` for optional properties, \`readonly\` for compile-time-only immutability, and index signatures (\`[key: string]: T\`) when property names aren't known ahead of time.`,
    },
    {
      name: "Type Aliases vs Interfaces",
      minutes: 9,
      intro:
        "Compare what type aliases and interfaces can each express — declaration merging, unions, extending versus intersecting — and get practical guidance on which to reach for by default.",
      content: `## Two ways to name a type

By this point you've seen \`interface\` used to name an object shape. There's a second, more general tool for naming *any* type at all: the **type alias**, written with the \`type\` keyword:

\`\`\`ts
type Point = {
  x: number
  y: number
}

interface PointI {
  x: number
  y: number
}
\`\`\`

For a plain object shape like this, \`type\` and \`interface\` are close to interchangeable — both name the same structural shape, both are checked structurally, and a value satisfying one satisfies the other. The real differences show up in what each one can express beyond a plain object shape, and that's where the practical guidance for choosing between them actually comes from.

## What only a type alias can do

A type alias can name *any* type — not just object shapes. This is the capability interfaces simply don't have:

\`\`\`ts
// Union types — interfaces cannot express this at all
type Status = "pending" | "active" | "completed"

// A primitive alias
type UserId = string

// A function type
type Handler = (event: Event) => void

// A tuple
type Coordinate = [number, number]

// A mapped or conditional type (covered in Module 7)
type Nullable<T> = T | null
\`\`\`

Unions in particular come up constantly — discriminated unions (Module 4's final lesson) are built entirely from type aliases, precisely because an \`interface\` has no syntax for "one of these several shapes." If what you're naming isn't a plain object shape, reach for \`type\` — there usually isn't a choice to make.

## What only an interface can do: declaration merging

Interfaces have exactly one capability type aliases lack, and it's a significant one: **declaration merging**. Declare an interface with the same name more than once in the same scope, and TypeScript merges the declarations into a single interface with all their members combined, rather than raising a duplicate-declaration error:

\`\`\`ts
interface Window {
  myCustomGlobal: string
}

interface Window {
  anotherCustomGlobal: number
}

// Window now has BOTH myCustomGlobal and anotherCustomGlobal
\`\`\`

A duplicate \`type Window = { ... }\` written twice would instead be a hard compile error — type aliases cannot be redeclared. Declaration merging looks like a strange feature in isolation, but it's exactly what makes it possible for a library (or your own code) to *extend* a type that was declared somewhere else entirely, without needing access to edit that original declaration. This is precisely how augmenting global types like \`Window\`, or adding custom properties to Express's \`Request\` type, works in practice — a pattern Module 8's declaration-files coverage returns to directly.

## Extending vs intersecting

Both tools have a way to build a new shape out of an existing one, but the mechanism differs. Interfaces use \`extends\`:

\`\`\`ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

const rex: Dog = { name: "Rex", breed: "Labrador" }
\`\`\`

Type aliases use the \`&\` intersection operator to combine multiple types into one:

\`\`\`ts
type Animal = {
  name: string
}

type Dog = Animal & {
  breed: string
}

const rex: Dog = { name: "Rex", breed: "Labrador" }
\`\`\`

Both produce, for this example, an equivalent resulting shape. The practical difference shows up when a conflict exists between the pieces being combined: \`extends\` on an interface will raise a compile error immediately if a property's type in the extending interface is incompatible with the same property in the base interface, catching the mistake right at the declaration. An intersection (\`&\`) instead resolves a property present in both sides by intersecting *its* type too — which, for two incompatible primitive types, silently collapses to \`never\` (a type with no possible values) rather than erroring at the declaration site, and the error only surfaces later, confusingly, wherever you try to actually construct a value of that type. This is a real, if narrow, ergonomic point in favor of interfaces for straightforward inheritance-shaped hierarchies.

## Practical guidance

Given the overlap, most style guides — including TypeScript's own team — converge on similar defaults:

| Situation | Prefer |
|---|---|
| Naming a plain object/class shape | \`interface\` — slightly better error messages, supports \`extends\`, and can be merged into by consumers |
| Naming a union, tuple, function type, or primitive alias | \`type\` — interfaces cannot express these at all |
| A public library API that consumers might need to augment | \`interface\` — declaration merging is the only way to let them |
| Everything else, no strong reason either way | Either — pick one convention and apply it consistently within a codebase |

In practice, a large share of real-world TypeScript code uses \`interface\` for object/class shapes and reaches for \`type\` specifically when a union, tuple, or other non-object shape is needed — not because \`type\` can't handle plain objects too, but because the difference in capability (unions on one side, declaration merging on the other) makes each tool's "home turf" reasonably clear. What matters far more than picking the theoretically optimal tool for every declaration is consistency: a codebase that mixes both without any pattern makes it harder to predict, at a glance, whether a given named type can be extended by other code later.

> **Key idea:** A type alias (\`type\`) can name any type at all — unions, tuples, function types, primitives, object shapes — but cannot be redeclared; an interface can only name object/class-like shapes but supports \`extends\` with earlier conflict detection and declaration merging, letting other code add to it later. Default to \`interface\` for plain object and class shapes, \`type\` for anything else, and stay consistent within a codebase.`,
    },
  ],
}
