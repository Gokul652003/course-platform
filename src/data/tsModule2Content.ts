import type { Module } from "../types"

export const tsModule2: Module = {
  id: 2,
  title: "Core Types & Type Annotations",
  status: "upcoming",
  lessons: [
    {
      name: "Primitives, Arrays & Tuples",
      minutes: 9,
      intro: "Cover every JavaScript primitive's TypeScript type, the two ways to type an array, and how tuples add fixed-length, fixed-position typing that plain arrays can't.",
      content: `## The primitive types

TypeScript has a type corresponding to every JavaScript primitive value. These are the building blocks nearly everything else in the type system is composed from:

\`\`\`ts
let title: string = "Learn TypeScript"
let price: number = 19.99
let inStock: boolean = true
let bigCount: bigint = 9_007_199_254_740_993n
let uniqueKey: symbol = Symbol("id")
let nothingYet: undefined = undefined
let deliberatelyEmpty: null = null
\`\`\`

A few things worth noting about this list:

- **\`number\` covers every numeric value** — there's no separate \`int\`, \`float\`, or \`double\` the way many other typed languages have, because JavaScript itself only has one numeric type under the hood (a 64-bit floating point number). \`bigint\` is a distinct type for arbitrary-precision integers (created with the \`n\` suffix, like \`123n\`), and TypeScript keeps \`number\` and \`bigint\` strictly separate — they can't be mixed in arithmetic without an explicit conversion, matching how JavaScript itself behaves.
- **\`string\` covers any string value**, regardless of whether it was written with single quotes, double quotes, or backticks/template literals.
- **\`undefined\` and \`null\` are both distinct types**, each with exactly one possible value (\`undefined\` and \`null\` respectively). Under \`"strict"\` mode's \`strictNullChecks\` flag, neither is automatically assignable to other types — a plain \`string\` cannot be \`null\` unless you explicitly say so, covered in the next module.

### Type inference still applies

Just as with the previous lesson, none of the primitive annotations above are actually required when there's an initial value — TypeScript infers all of them:

\`\`\`ts
let title = "Learn TypeScript"   // inferred: string
let price = 19.99                // inferred: number
let inStock = true               // inferred: boolean
\`\`\`

Annotations on primitives are most useful for function parameters (which always need them) and for variables declared without an initial value.

## Arrays: two equivalent syntaxes

TypeScript offers two ways to write an array type, and they mean exactly the same thing:

\`\`\`ts
let scores: number[] = [88, 92, 76]
let scoresAlt: Array<number> = [88, 92, 76]   // identical meaning, generic syntax
\`\`\`

\`T[]\` is by far the more common style in everyday code — it's shorter and reads naturally. \`Array<T>\` (using the generic type \`Array\`, covered in depth in module 6) becomes more useful once the element type itself gets more complex, where the bracket syntax can start to look cramped:

\`\`\`ts
let matrix: number[][] = [[1, 2], [3, 4]]           // array of arrays
let callbacks: Array<() => void> = []                // arguably clearer with generic syntax
\`\`\`

Both forms are checked identically by the compiler — arrays are homogeneous in TypeScript by default, meaning every element must match the declared element type:

\`\`\`ts
let names: string[] = ["Ada", "Grace"]
names.push(42)
// Error: Argument of type 'number' is not assignable to parameter of type 'string'.
\`\`\`

### readonly arrays

Prefixing an array type with \`readonly\` (or using the \`ReadonlyArray<T>\` generic form) produces a type that disallows any mutating method — \`push\`, \`pop\`, \`splice\`, index assignment, and so on — while still allowing non-mutating methods like \`map\` and \`filter\`, which return new arrays rather than modifying the original:

\`\`\`ts
function printAll(items: readonly string[]): void {
  items.push("nope")
  // Error: Property 'push' does not exist on type 'readonly string[]'.

  console.log(items.join(", "))  // fine — .join() doesn't mutate
}
\`\`\`

This is a genuinely useful signal in function parameters: a \`readonly string[]\` parameter documents — and enforces — that a function only reads the array it's given and never mutates the caller's data, without needing a comment to say so.

## Tuples: fixed-length, fixed-position arrays

A plain array type says "every element is a \`string\`" or "every element is a \`number\`" — but it says nothing about *how many* elements there are, or that different positions might hold different types. A **tuple** fixes both: it's an array type with a known, fixed length, where each position has its own declared type.

\`\`\`ts
let point: [number, number] = [12, 8]
// exactly two numbers — position 0 is x, position 1 is y

let entry: [string, number] = ["temperature", 21.5]
// position 0 must be a string, position 1 must be a number

entry = [21.5, "temperature"]
// Error: Type 'number' is not assignable to type 'string'. (position 0 mismatch)

entry = ["temperature", 21.5, "extra"]
// Error: Source has 3 element(s) but target allows only 2.
\`\`\`

This is a common way to type a function that returns a small, fixed, ordered bundle of values — a pattern JavaScript itself uses for things like \`useState\` in React (\`const [value, setValue] = useState(0)\` relies on tuple typing to know that \`value\` and \`setValue\` are specifically what they are, and in that specific order, rather than just "some array of two things").

\`\`\`ts
function divide(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b]  // [quotient, remainder]
}

const [quotient, remainder] = divide(17, 5)
// quotient: number, remainder: number — positions are tracked precisely
\`\`\`

### Optional tuple elements

A tuple position can be marked optional with \`?\`, the same syntax used for optional function parameters (covered in module 3):

\`\`\`ts
let range: [number, number?] = [0]
range = [0, 100]   // also valid
range = [0, 100, 200]
// Error: Source has 3 element(s) but target allows only 2.
\`\`\`

### readonly tuples

Just like arrays, tuples can be marked \`readonly\` to prevent element reassignment and disallow mutating array methods:

\`\`\`ts
function midpoint([x1, y1]: readonly [number, number], [x2, y2]: readonly [number, number]): [number, number] {
  return [(x1 + x2) / 2, (y1 + y2) / 2]
}
\`\`\`

Combined with destructuring (as shown above), tuples are a lightweight way to give ordered, fixed-shape data real, checked structure — without needing to define a full object type for something as small as a coordinate pair or a \`[key, value]\` entry.

> **Key idea:** Every JavaScript primitive has a matching TypeScript type (\`string\`, \`number\`, \`boolean\`, \`bigint\`, \`symbol\`, \`undefined\`, \`null\`), arrays can be written as \`T[]\` or \`Array<T>\` and are homogeneous by default, and tuples (\`[T1, T2, ...]\`) extend that with a fixed length and per-position types — reach for \`readonly\` on either an array or a tuple whenever a function should only read, never mutate, the data it receives.`,
    },
    {
      name: "Enums & Literal Types",
      minutes: 9,
      intro: "Compare numeric and string enums, understand why const enums are often discouraged in modern bundler setups, and see literal types as a simpler alternative for many of the same use cases.",
      content: `## Enums: a named set of related constants

An **enum** (short for "enumeration") declares a fixed set of named constant values, useful for things like a status field, a direction, or a category that only ever takes one of a small handful of known values:

\`\`\`ts
enum OrderStatus {
  Pending,
  Shipped,
  Delivered,
  Cancelled,
}

let status: OrderStatus = OrderStatus.Shipped
\`\`\`

By default, TypeScript enums are **numeric** — each member is automatically assigned an incrementing number starting from \`0\` unless you specify otherwise:

\`\`\`ts
enum OrderStatus {
  Pending,     // 0
  Shipped,     // 1
  Delivered,   // 2
  Cancelled,   // 3
}

console.log(OrderStatus.Shipped)      // 1
console.log(OrderStatus[1])           // "Shipped" — numeric enums support this reverse lookup
\`\`\`

That reverse mapping — going from the numeric value back to its name — is a distinguishing feature of numeric enums specifically, implemented by the compiler generating both directions into the compiled output. You can also assign explicit numeric values, which then determines the auto-increment for any members that follow:

\`\`\`ts
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
}
\`\`\`

### String enums

An enum can use string values instead, which trades away the reverse lookup but produces far more readable output when the value is logged, serialized, or sent over the network — a numeric \`1\` in a debug log or a JSON payload tells you nothing on its own, while \`"Shipped"\` does:

\`\`\`ts
enum OrderStatus {
  Pending = "PENDING",
  Shipped = "SHIPPED",
  Delivered = "DELIVERED",
  Cancelled = "CANCELLED",
}

console.log(OrderStatus.Shipped)  // "SHIPPED"
\`\`\`

Every member of a string enum must be explicitly initialized — there's no auto-increment for strings the way there is for numbers, since TypeScript has no sensible default "next string" to generate.

### const enums, and why they're often avoided

Prefixing \`enum\` with \`const\` asks the compiler to *inline* every usage of the enum's members directly, rather than generating a runtime object for the enum at all:

\`\`\`ts
const enum Direction {
  Up,
  Down,
}

let d = Direction.Up   // compiles to: let d = 0; — no Direction object exists at runtime
\`\`\`

This produces smaller, slightly faster output, but it comes with real practical costs that lead many teams and style guides — including TypeScript's own compiler team, in public guidance — to steer away from it in modern projects: \`const enum\` requires whole-program knowledge at compile time (which breaks under tools that transpile files in isolation, such as Babel or, notably, esbuild — the same transpiler Vite's dev server uses, as covered in module 1), and it's incompatible with \`isolatedModules\`, a compiler option many modern build setups enable specifically to support that kind of per-file transpilation. In short: \`const enum\` can silently fail to work correctly in a Vite-based project like this one, which is a strong practical reason to avoid it entirely rather than a purely stylistic preference.

## Literal types: often a simpler alternative

TypeScript also lets you use a specific literal value — a specific string, number, or boolean — directly as a type. A variable typed as the literal \`"pending"\` can only ever hold that exact value:

\`\`\`ts
let status: "pending" = "pending"
status = "shipped"
// Error: Type '"shipped"' is not assignable to type '"pending"'.
\`\`\`

On its own that's not very useful — but combined with a union type (the \`|\` syntax, covered fully in module 4), a set of literal types can describe exactly the same "one of a small fixed set of values" idea that an enum does, using plain strings instead of a separate declared construct:

\`\`\`ts
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled"

function printStatus(status: OrderStatus): void {
  console.log(status)
}

printStatus("shipped")     // OK
printStatus("in transit")
// Error: Argument of type '"in transit"' is not assignable to parameter of type 'OrderStatus'.
\`\`\`

### Enum vs. literal union: which to reach for

| | Enum | Literal union |
|---|---|---|
| Runtime footprint | Generates a real object (unless \`const enum\`) | Zero — literal unions are pure compile-time types, fully erased |
| Values used | Enum member (\`OrderStatus.Shipped\`) | Plain string/number values directly (\`"shipped"\`) |
| Works with plain JSON/API data | Requires mapping raw strings to enum members | Matches naturally — API strings often already look like \`"shipped"\` |
| Namespacing | Groups related constants under one name automatically | No grouping — just a type alias name |
| Common modern guidance | Used more sparingly, especially avoiding \`const enum\` | Frequently preferred for simple "one of these values" cases |

Neither is strictly wrong, and plenty of real, well-maintained codebases use enums heavily. But a large and growing portion of the TypeScript community — including much of the guidance around modern bundler-based projects — leans toward literal unions for simple fixed-value cases specifically because they add zero runtime code, interoperate directly with plain string data from JSON APIs without any mapping step, and avoid the \`const enum\`/\`isolatedModules\` pitfall entirely. A reasonable default for this course going forward: reach for a literal union first, and reach for an enum specifically when you want the grouping, the reverse lookup (numeric enums), or you're working in a codebase/team that has already standardized on enums.

> **Key idea:** Enums (numeric or string) group a named, fixed set of constant values and generate a real runtime object — except \`const enum\`, which inlines usages but can break under per-file transpilers like esbuild/Vite and is generally best avoided; literal types, especially combined into a union, describe the same "one of these fixed values" idea with zero runtime footprint and often map more naturally onto plain string data from JSON APIs.`,
    },
    {
      name: "any, unknown, never & void",
      minutes: 10,
      intro: "Contrast any's total opt-out with unknown's safe top type, understand never as the type of an unreachable value, and separate void from undefined.",
      content: `## A quick recap: any

Module 1 introduced \`any\` as an escape hatch that disables type checking entirely for a value — anything can be assigned to it, and it can be used anywhere without restriction, with no compiler safety net:

\`\`\`ts
let value: any = "hello"
value.toUpperCase().thisMethodDoesNotExist()  // No error, but this crashes at runtime
value = 42
value = { anything: "goes" }
\`\`\`

This lesson introduces the type most \`any\` usages should actually reach for instead.

## unknown: the safe top type

\`unknown\` is, like \`any\`, a type that can hold literally any value — but with one critical difference: **you cannot do anything with an \`unknown\` value until you've proven what it actually is.**

\`\`\`ts
let value: unknown = "hello"

value.toUpperCase()
// Error: Object is of type 'unknown'.
// (Even though the actual runtime value IS a string, TypeScript won't
// let you call a string method until it's been narrowed.)
\`\`\`

To use an \`unknown\` value, you first have to narrow it — check what it actually is, using \`typeof\`, \`instanceof\`, or another type guard (covered in full in module 4) — and TypeScript only allows the corresponding operations once that check has happened:

\`\`\`ts
function printLength(value: unknown): void {
  if (typeof value === "string") {
    console.log(value.length)   // OK — narrowed to string inside this branch
  } else if (Array.isArray(value)) {
    console.log(value.length)   // OK — narrowed to an array
  } else {
    console.log("no length available")
  }
}
\`\`\`

This is exactly the situation \`any\` gets reached for constantly and shouldn't be: data of a genuinely unknown shape, most commonly the result of \`JSON.parse()\`, an API response, or user input. \`unknown\` accepts that value just as freely as \`any\` would, but forces every subsequent usage to first prove — to the compiler's satisfaction — what the value actually is, which is precisely the safety \`any\` throws away.

\`\`\`ts
function parseConfig(raw: string): unknown {
  return JSON.parse(raw)   // JSON.parse's return type is genuinely unknown shape
}

const config = parseConfig('{"port": 3000}')
config.port
// Error: Object is of type 'unknown'.
// Forces you to check/assert the shape before trusting it — exactly
// the gap between compile-time types and runtime data flagged in module 1.
\`\`\`

**The practical rule going forward in this course: default to \`unknown\` over \`any\` for any value whose shape genuinely isn't known yet**, and treat \`any\` as reserved for rare, deliberate exceptions (like an untyped third-party library, covered in module 8) rather than a convenient shortcut past the type checker.

## never: the type of a value that can't exist

\`never\` represents a value that logically cannot occur. It shows up in two main situations.

**A function that never returns normally** — either because it always throws, or because it loops forever — is typed as returning \`never\`:

\`\`\`ts
function fail(message: string): never {
  throw new Error(message)
}

function loopForever(): never {
  while (true) {
    // ...
  }
}
\`\`\`

This is distinct from \`void\` (covered next): a \`void\` function returns normally, just without a useful value; a \`never\` function never reaches a point where it "returns" at all.

**Exhaustiveness checking** is the more commonly useful appearance of \`never\`, and it becomes a genuinely powerful tool once you've covered union types in module 4. The idea: in a branch that should be provably unreachable — every real case has already been handled — the remaining value's type narrows down to \`never\`. Assigning it to a variable explicitly typed \`never\` turns "I forgot to handle a case" into a compile error instead of a silent runtime gap:

\`\`\`ts
type Direction = "up" | "down" | "left" | "right"

function move(direction: Direction): string {
  switch (direction) {
    case "up": return "moving up"
    case "down": return "moving down"
    case "left": return "moving left"
    case "right": return "moving right"
    default:
      const exhaustiveCheck: never = direction
      // If a new direction is ever added to the Direction type and this
      // switch isn't updated to handle it, 'direction' in the default
      // branch is no longer 'never' — it's the new, unhandled literal —
      // and this line becomes a compile error, catching the gap immediately.
      return exhaustiveCheck
  }
}
\`\`\`

This pattern — an unreachable \`default\` branch assigned to a \`never\`-typed variable — is one of the most practically useful idioms in TypeScript once discriminated unions are in your toolkit (module 4), because it turns "someone added a new case and forgot to update this switch statement" from a silent bug into an immediate compiler error.

## void: "returns nothing useful"

\`void\` describes the return type of a function that doesn't return a meaningful value — most commonly because it performs a side effect (logging, mutating something, sending a network request) rather than computing a result:

\`\`\`ts
function logMessage(message: string): void {
  console.log(message)
  // no return statement — or "return;" with no value — is fine for void
}
\`\`\`

### void vs. undefined: a subtle but real distinction

At runtime, a function with no \`return\` statement genuinely returns \`undefined\` — so it's tempting to assume \`void\` and \`undefined\` are just two names for the same thing. They're close, but TypeScript treats them differently in one useful way: **a callback typed to return \`void\` is allowed to actually return something else, and that return value is simply ignored.**

\`\`\`ts
function forEachItem(items: string[], callback: (item: string) => void): void {
  for (const item of items) {
    callback(item)
  }
}

// This callback's arrow function body actually returns a boolean
// (the result of .push(), which is the new array length) — but since
// the expected type is "(item: string) => void", that return value
// is simply discarded, and this is not a type error:
const collected: string[] = []
forEachItem(["a", "b", "c"], (item) => collected.push(item))
\`\`\`

If \`callback\`'s type had instead been \`(item: string) => undefined\`, that same call would be a type error — \`push()\`'s numeric return value isn't assignable to \`undefined\`. This distinction exists specifically so that passing an existing function (like an array method's callback, or any function with a "real" return value) into a slot that only cares about the *side effect*, not the result, doesn't require wrapping it in an unnecessary arrow function just to throw the return value away. In practice: use \`void\` for "this function's return value isn't meant to be used," and reserve \`undefined\` for situations where the literal absence of a value is itself meaningful and worth checking for.

> **Key idea:** Prefer \`unknown\` over \`any\` whenever a value's shape isn't known yet — it accepts anything but forces narrowing before use, unlike \`any\` which disables checking outright; \`never\` types a value that can't occur, most usefully for compiler-enforced exhaustiveness checks over unions; and \`void\` marks a function's return value as unused (and, unlike \`undefined\`, tolerates callbacks that return something anyway), which is subtly different from a value literally being \`undefined\`.`,
    },
  ],
}
