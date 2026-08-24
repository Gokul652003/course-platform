import type { Module } from "../types"

export const tsModule4: Module = {
  id: 4,
  title: "Union, Intersection & Narrowing",
  status: "upcoming",
  lessons: [
    {
      name: "Union & Intersection Types",
      minutes: 9,
      intro:
        "Combine types with the | union and & intersection operators, see how each interacts with object types, and learn where each one earns its keep in practice.",
      content: `## Union types: "one of these"

A **union type**, written with \`|\`, describes a value that can be *one of several* possible types. It's the direct type-level counterpart to a value that genuinely varies at runtime — a function's return value that might be a result or an error, a form field that's a string until it's parsed into a number, an API response field that's sometimes present as one shape and sometimes another.

\`\`\`ts
function formatId(id: string | number): string {
  return \`ID-\${id}\`
}

formatId("abc123") // ok
formatId(42) // ok
formatId(true) // Error: Argument of type 'boolean' is not assignable to parameter of type 'string | number'
\`\`\`

Inside a function that receives a union-typed value, TypeScript only lets you use operations that are valid for *every* member of the union — this is the safety the union type is actually buying you. Call \`id.toUpperCase()\` inside \`formatId\` above and you'll get an error, because \`toUpperCase\` doesn't exist on \`number\`. To use a member-specific operation, you first need to **narrow** the union down to a single member — the entire subject of this lesson's next section.

Unions aren't limited to two members, and aren't limited to primitives:

\`\`\`ts
type Size = "small" | "medium" | "large"
type Input = string | number | boolean | null

interface Circle {
  kind: "circle"
  radius: number
}
interface Square {
  kind: "square"
  side: number
}
type Shape = Circle | Square
\`\`\`

That last example — a union of object types sharing a common literal \`kind\` property — is a **discriminated union**, and it's important enough to get a full lesson to itself later in this module.

## Intersection types: "all of these, combined"

An **intersection type**, written with \`&\`, combines multiple types into one type that has *everything* from each side at once. Where a union says "one of," an intersection says "all of, merged together":

\`\`\`ts
type Timestamped = {
  createdAt: Date
}

type Named = {
  name: string
}

type NamedAndTimestamped = Timestamped & Named

const record: NamedAndTimestamped = {
  name: "Invoice #204",
  createdAt: new Date(),
}
\`\`\`

A value of type \`NamedAndTimestamped\` must satisfy *both* \`Timestamped\` and \`Named\` — it needs every property from every intersected type, not just one of them. This is the mirror image of a union in a very literal sense: a union widens what's *acceptable* (any one of several shapes passes), while an intersection narrows what's acceptable by demanding more (every combined shape's requirements must all be met at once).

## Where each one actually gets used

Unions show up constantly for values that are genuinely one of several possibilities — parsing input, modeling API responses, representing state that can be in one of several distinct modes (loading, success, error), or accepting a flexible parameter (a function that takes either a single item or an array of items: \`T | T[]\`).

Intersections show up most often for **composing** smaller, independently meaningful shapes into a larger one, especially when you want to keep the smaller pieces reusable on their own:

\`\`\`ts
type WithId = { id: string }
type WithTimestamps = { createdAt: Date; updatedAt: Date }

type User = WithId & WithTimestamps & {
  name: string
  email: string
}

type Post = WithId & WithTimestamps & {
  title: string
  body: string
}
\`\`\`

Here \`WithId\` and \`WithTimestamps\` describe two independently reusable concerns — "has an id" and "is timestamped" — that both \`User\` and \`Post\` need, without \`User\` and \`Post\` needing to know anything about each other. This mirrors composition patterns you may already know from other type systems (mixins, traits, or interface composition), expressed here through plain type intersection rather than a dedicated language feature.

## A subtlety: intersecting incompatible primitives

One sharp edge worth knowing about early: intersecting two *incompatible* primitive types produces \`never\` — the type with no possible values — because nothing could simultaneously be, say, both a \`string\` and a \`number\`:

\`\`\`ts
type Impossible = string & number // type is 'never'
\`\`\`

This rarely happens on purpose, but it's a useful thing to recognize if you ever see a confusing \`never\` type appear from an intersection you didn't expect — it usually means two of the intersected pieces conflict on a shared property's type, exactly as covered in the previous lesson's comparison of \`extends\` versus \`&\` for interfaces and type aliases.

## Union and intersection together

The two combine freely, and precedence matters: \`&\` binds tighter than \`|\`, the same way \`*\` binds tighter than \`+\` in ordinary arithmetic, so parentheses are often worth adding for clarity even when not strictly required:

\`\`\`ts
type Admin = { role: "admin"; permissions: string[] }
type Guest = { role: "guest" }

type Session = (Admin | Guest) & { sessionId: string }

const s1: Session = { role: "admin", permissions: ["read", "write"], sessionId: "abc" }
const s2: Session = { role: "guest", sessionId: "def" }
\`\`\`

\`Session\` here means "either an \`Admin\` or a \`Guest\`, and *also* has a \`sessionId\`" — a union of shapes, intersected with a shape common to both. This pattern — a union of variant-specific shapes merged with shared fields — comes up often enough in real modeling that it's worth recognizing on sight.

> **Key idea:** A union (\`A | B\`) means "a value that's one of these types," and only operations valid on every member are allowed without narrowing first; an intersection (\`A & B\`) means "a value that satisfies every one of these types at once," commonly used to compose smaller reusable shapes into a larger one. The two combine freely, with \`&\` binding tighter than \`|\`.`,
    },
    {
      name: "Narrowing & Type Guards",
      minutes: 10,
      intro:
        "Use typeof, instanceof, the in operator, and truthiness checks to narrow a union down to a single member, then write your own custom type guard functions.",
      content: `## What narrowing means

A union type like \`string | number\` tells TypeScript "this value is one of these" — but to actually *do* something type-specific with it (call \`.toUpperCase()\`, do arithmetic), TypeScript needs to know, at a specific point in the code, *which* member of the union it's currently dealing with. **Narrowing** is the process of writing a runtime check that TypeScript recognizes, after which it treats the value as a smaller, more specific type for the rest of that code branch. This isn't a special TypeScript-only syntax — it's TypeScript recognizing patterns you'd already write in plain JavaScript, and using them to sharpen its own understanding of your code.

## typeof narrowing

The most common narrowing check for primitives is a plain JavaScript \`typeof\` check:

\`\`\`ts
function describe(value: string | number): string {
  if (typeof value === "string") {
    // value: string, inside this branch
    return \`text: \${value.toUpperCase()}\`
  }
  // value: number, here — the only other member left in the union
  return \`number: \${value.toFixed(2)}\`
}
\`\`\`

Notice the second branch didn't need its own explicit check — once the \`string\` case is handled and returned, TypeScript knows the only remaining possibility inside the rest of the function is \`number\`, and narrows accordingly. This falls directly out of how TypeScript tracks **control flow**: it follows each branch of your \`if\`/\`else\`, understanding that a \`return\` (or \`throw\`, or \`continue\`) inside one branch means later code can't have come from that branch.

## instanceof narrowing

For class instances, \`instanceof\` narrows the same way \`typeof\` does for primitives:

\`\`\`ts
class ValidationError extends Error {
  field: string
  constructor(field: string, message: string) {
    super(message)
    this.field = field
  }
}

function handleError(error: Error | ValidationError) {
  if (error instanceof ValidationError) {
    // error: ValidationError — .field is now accessible
    console.log(\`Invalid field "\${error.field}": \${error.message}\`)
  } else {
    // error: Error
    console.log(\`Unexpected error: \${error.message}\`)
  }
}
\`\`\`

This is especially common in \`catch\` blocks, since a caught value in TypeScript is typed \`unknown\` by default (a deliberate safety choice, since JavaScript allows \`throw\`-ing any value at all, not just \`Error\` instances) — \`instanceof Error\` is the standard way to narrow a caught \`unknown\` down to something with a \`.message\` property you can safely read.

## The in operator

The \`in\` operator checks whether a given property name exists on an object at runtime, and TypeScript uses that same check to narrow between object shapes that don't share a discriminant property:

\`\`\`ts
interface Bird {
  fly(): void
  layEggs(): void
}
interface Fish {
  swim(): void
  layEggs(): void
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    // animal: Bird
    animal.fly()
  } else {
    // animal: Fish
    animal.swim()
  }
}
\`\`\`

\`in\` narrowing is particularly useful specifically when the union members don't share a clean literal discriminant field (like the \`kind\` property covered in the next lesson) — it lets you narrow based on *structural* differences between the shapes instead.

## Truthiness narrowing

Plain JavaScript truthiness checks narrow too, most commonly to rule out \`null\` or \`undefined\` from a type:

\`\`\`ts
function printLength(value: string | null) {
  if (value) {
    // value: string — null is falsy, so it's excluded from this branch
    console.log(value.length)
  }
}
\`\`\`

Be careful with this one for non-string primitives: truthiness narrowing rules out *every* falsy value in that type, not just \`null\`/\`undefined\` — so for a \`number | null\` value, a truthiness check also (probably unintentionally) treats \`0\` as if it needed to be excluded, since \`0\` is falsy too. An explicit \`value !== null\` check is more precise, and generally preferable, whenever the type includes a primitive that has its own falsy values (\`0\`, \`""\`, \`false\`).

## Custom type guards

The built-in checks above cover a lot, but sometimes the logic that determines "is this a \`T\`?" is more involved than a single \`typeof\`/\`instanceof\`/\`in\` check — it might need to inspect several properties, or call a validation function. For that, you can write your own **type guard function**, whose return type is a **type predicate**: \`parameterName is Type\`, instead of a plain \`boolean\`.

\`\`\`ts
interface Cat {
  meow(): void
}
interface Dog {
  bark(): void
}

function isCat(animal: Cat | Dog): animal is Cat {
  return typeof (animal as Cat).meow === "function"
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    // animal: Cat
    animal.meow()
  } else {
    // animal: Dog
    animal.bark()
  }
}
\`\`\`

The function body of \`isCat\` still just returns a plain \`boolean\` at runtime — \`animal is Cat\` is purely a compile-time signal telling TypeScript "whenever this function returns \`true\`, treat the argument as narrowed to \`Cat\` in the calling code from that point on." This is what makes custom type guards powerful: you write the narrowing *logic* once, in one place, and every call site that uses the guard gets the narrowing applied automatically, rather than needing to inline the same structural check everywhere it's needed.

A genuinely important caveat: **the type predicate is not verified against the function body** — TypeScript trusts what you wrote in the \`is\` clause. Write \`function isCat(animal: Cat | Dog): animal is Cat { return true }\` and it compiles fine, silently lying to every caller. A type guard is only as trustworthy as the check it actually performs, so writing one is a real responsibility, not just syntax to satisfy the compiler.

> **Key idea:** Narrowing turns a runtime check TypeScript already recognizes — \`typeof\`, \`instanceof\`, \`in\`, truthiness, or \`===\` against a literal — into a compile-time guarantee for the rest of that branch; when built-in checks aren't precise enough, write a custom type guard function returning \`param is Type\`, but remember TypeScript trusts that annotation completely, so the check inside must actually be correct.`,
    },
    {
      name: "Discriminated Unions",
      minutes: 10,
      intro:
        "Model variant data with a shared literal discriminant field, narrow safely with a switch, and meet the never-based exhaustiveness check that catches unhandled cases at compile time.",
      content: `## The problem with loosely related union members

Union types of *unrelated* object shapes work, but as a union grows, narrowing between members using \`in\` checks against arbitrary properties gets increasingly awkward to write and to read. **Discriminated unions** (also called "tagged unions") fix this by convention: give every member of the union a shared property — commonly named \`kind\` or \`type\` — whose value is a distinct string *literal* per member. That single shared field becomes a clean, reliable switch for narrowing the whole union.

\`\`\`ts
interface Circle {
  kind: "circle"
  radius: number
}

interface Square {
  kind: "square"
  side: number
}

interface Rectangle {
  kind: "rectangle"
  width: number
  height: number
}

type Shape = Circle | Square | Rectangle
\`\`\`

Every member shares the \`kind\` field's *name*, but each gives it a different literal *value* — \`"circle"\`, \`"square"\`, \`"rectangle"\` — and TypeScript treats each of those as its own distinct type (a **literal type**, covered in Module 2), not just as \`string\`. That's what makes the discriminant checkable.

## Narrowing with a switch

Checking \`shape.kind\` narrows \`Shape\` down to the exact matching interface, and a \`switch\` statement is the natural way to branch across every member:

\`\`\`ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: Circle
      return Math.PI * shape.radius ** 2
    case "square":
      // shape: Square
      return shape.side ** 2
    case "rectangle":
      // shape: Rectangle
      return shape.width * shape.height
  }
}
\`\`\`

Inside each \`case\`, TypeScript has narrowed \`shape\` to exactly the interface whose \`kind\` literal matches that case — \`shape.radius\` is accessible in the \`"circle"\` case and nowhere else, and trying to access \`shape.radius\` inside the \`"square"\` case would be a compile error, because \`Square\` has no \`radius\` property. This is the entire payoff of the discriminated union pattern: one property drives narrowing across an arbitrarily large number of otherwise-unrelated shapes, cleanly and safely.

## The exhaustiveness problem

The \`area\` function above has a real bug waiting to happen: what if a fourth shape, \`Triangle\`, gets added to the \`Shape\` union next month, and the developer making that change forgets to add a corresponding \`case\` to every \`switch\` over \`Shape\` scattered across the codebase? Without a default case, \`area\` would silently return \`undefined\` for any triangle at runtime — a bug that compiles cleanly and might not surface until it reaches production.

## The never-based exhaustiveness check

TypeScript can catch exactly this mistake at compile time, using the \`never\` type introduced in Module 2. The trick: add a \`default\` case that assigns the still-unhandled value to a variable explicitly typed \`never\`.

\`\`\`ts
function assertNever(value: never): never {
  throw new Error(\`Unhandled case: \${JSON.stringify(value)}\`)
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "square":
      return shape.side ** 2
    case "rectangle":
      return shape.width * shape.height
    default:
      return assertNever(shape)
  }
}
\`\`\`

Here's why this works: after every real \`case\` has been handled, TypeScript narrows whatever's *left* for the \`default\` branch — and if every member of \`Shape\` was actually covered by a \`case\` above, nothing is left, so TypeScript narrows \`shape\` inside \`default\` down to \`never\`, the type with no possible values. \`never\` is assignable to *any* type-annotated parameter (an empty set of possibilities trivially satisfies any requirement), so \`assertNever(shape)\` compiles cleanly — but only because there was truly nothing left to handle.

Now add \`Triangle\` to the union without updating \`area\`:

\`\`\`ts
interface Triangle {
  kind: "triangle"
  base: number
  height: number
}

type Shape = Circle | Square | Rectangle | Triangle
\`\`\`

Recompiling immediately produces an error at the \`assertNever(shape)\` call — inside \`default\`, \`shape\` is now narrowed to \`Triangle\` (the one member no \`case\` handled), and \`Triangle\` is not assignable to the \`never\` parameter \`assertNever\` expects. The compiler has turned "a developer forgot to update this \`switch\`" from a silent runtime bug into a build failure, pointing at the exact function that needs updating.

## Why this matters at scale

This pattern is one of the most genuinely valuable payoffs of TypeScript's structural type system in real, evolving codebases. Discriminated unions plus \`never\`-based exhaustiveness checks mean that adding a new variant to a union is *guaranteed* to surface every single place in the codebase that needs to handle it — the compiler does the searching for you, exhaustively and immediately, rather than relying on a developer remembering to grep for every \`switch (shape.kind)\` by hand. Module 10 returns to this exact pattern in more depth as one of several type-safe design techniques worth adopting deliberately in production code.

> **Key idea:** A discriminated union gives every member a shared literal field (commonly \`kind\`) that lets a \`switch\` narrow cleanly to the exact matching shape per case; add a \`default: return assertNever(value)\` branch using a \`never\`-typed parameter, and the compiler will flag any future variant that isn't handled by an existing \`case\` — turning an easy-to-miss runtime bug into an immediate, precise compile error.`,
    },
  ],
}
