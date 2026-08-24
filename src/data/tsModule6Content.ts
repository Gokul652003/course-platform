import type { Module } from "../types"

export const tsModule6: Module = {
  id: 6,
  title: "Generics",
  status: "upcoming",
  lessons: [
    {
      name: "Generic Functions & Constraints",
      minutes: 10,
      intro:
        "See why any and function overloads don't scale, then write generic functions that stay type-safe across any input type, and constrain type parameters with extends.",
      content: `## The problem generics solve

Suppose you want a function that returns the first element of an array, regardless of what it's an array of. A first attempt might reach for \`any\`:

\`\`\`ts
function firstElement(arr: any[]): any {
  return arr[0]
}

const num = firstElement([1, 2, 3])
num.toFixed(2) // compiles fine...
num.toUpperCase() // ...and so does this, even though num is a number
\`\`\`

That compiles either way, which is exactly the problem — \`any\` opts the value back out of type checking entirely the moment it leaves the function. The caller passed in \`number[]\`, but by the time \`firstElement\` returns, all type information has been thrown away. You could write a separate overload for every element type you care about, but that doesn't scale to arrays of arbitrary, unknown-in-advance types — you'd need one overload per possible type, forever.

**Generics** solve this by letting a function be parameterized over a type, the same way it's parameterized over a value. Instead of hard-coding \`any\`, you introduce a placeholder type — conventionally named \`T\` — that stands for "whatever type the caller actually passes":

\`\`\`ts
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}

const num = firstElement([1, 2, 3]) // T is inferred as number
num?.toFixed(2) // fine — num is number | undefined
num?.toUpperCase() // Error: Property 'toUpperCase' does not exist on type 'number'

const str = firstElement(["a", "b", "c"]) // T is inferred as string
str?.toUpperCase() // fine — str is string | undefined
\`\`\`

The type information isn't lost this time — \`T\` gets *filled in* with the concrete type at each call site, and the return type is expressed in terms of that same \`T\`, so the caller gets back exactly the type they'd expect. Note the return type is \`T | undefined\`, not just \`T\` — accurately reflecting that an empty array has no first element, something the sloppy \`any\` version silently ignored.

## Generic function syntax

The \`<T>\` before the parameter list declares a **type parameter**, scoped to that function. You can use \`T\` anywhere a type is expected within the function signature and body — as a parameter type, a return type, or the type of a local variable. Multiple type parameters are just as easy to declare, separated by commas:

\`\`\`ts
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

const p = pair("age", 30) // inferred as [string, number]
\`\`\`

In almost every real call, you never have to write out the type argument explicitly — TypeScript infers \`T\` (and \`U\`) from the arguments you actually pass, exactly like it inferred \`number\` and \`string\` for \`firstElement\` above. Explicit type arguments (\`pair<string, number>("age", 30)\`) are available and occasionally necessary — most often when there's nothing in the argument list for TypeScript to infer from, such as an empty array literal (\`firstElement<string>([])\`) — but they're the exception, not the norm.

## Constraining generics with extends

An unconstrained \`T\` could be absolutely anything, which means the function body can't assume it has *any* particular properties or methods. This becomes a real limitation quickly:

\`\`\`ts
function longest<T>(a: T, b: T): T {
  return a.length > b.length ? a : b // Error: Property 'length' does not exist on type 'T'
}
\`\`\`

TypeScript is right to reject this — nothing about \`T\` guarantees it has a \`.length\` property at all; a caller could just as easily call \`longest(5, 10)\` with two numbers. The fix is to **constrain** the type parameter with \`extends\`, narrowing "any type at all" down to "any type that has at least this shape":

\`\`\`ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length > b.length ? a : b // fine — every T is guaranteed to have .length
}

longest("hello", "hi") // fine — strings have .length
longest([1, 2, 3], [1]) // fine — arrays have .length
longest(5, 10) // Error: Argument of type 'number' is not assignable to parameter of type '{ length: number }'
\`\`\`

\`T extends { length: number }\` doesn't mean "\`T\` must literally be the interface \`{ length: number }\`" — it means "\`T\` can be any type, as long as it has *at least* a \`length: number\` property somewhere on it." Strings and arrays both qualify structurally; a bare \`number\` doesn't, and TypeScript catches that at the call site rather than inside the function body.

## Multiple constrained type parameters

Constraints and multiple type parameters combine freely. A common pattern is a function that merges two objects, where each type parameter is independently constrained to be an object:

\`\`\`ts
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b }
}

const merged = merge({ name: "Ada" }, { age: 32 })
// merged: { name: string } & { age: number }
merged.name // string
merged.age // number
\`\`\`

The return type \`T & U\` (an intersection type — covered in the previous module) expresses precisely what \`{ ...a, ...b }\` actually produces: an object with every property from both \`a\` and \`b\`. Each generic parameter is constrained just enough to make the function body type-check (\`object\` guarantees spreading is safe), without over-constraining what callers are allowed to pass — this is the general goal with generic constraints: as loose as possible while still letting the compiler verify the body.

> **Key idea:** A generic type parameter (\`<T>\`) lets a function stay fully type-safe across any input type, instead of collapsing to \`any\` and losing that information — TypeScript infers \`T\` from the arguments at each call site. Constrain a type parameter with \`extends\` when the function body needs to assume some minimal shape (like \`.length\` or being an \`object\`), narrowing "any type" down to "any type with at least this shape" without hard-coding one specific type.`,
    },
    {
      name: "Generic Interfaces, Classes & Defaults",
      minutes: 10,
      intro:
        "Apply generics to interfaces and classes to build reusable, type-safe containers like a Stack<T> or a typed ApiResponse<T>, and give type parameters sensible defaults.",
      content: `## Generic interfaces

Generics aren't limited to functions — an interface can declare its own type parameter, to be filled in wherever the interface is used. This is how you describe a shape that wraps *some* other type without committing to which one:

\`\`\`ts
interface Box<T> {
  value: T
}

const numberBox: Box<number> = { value: 42 }
const stringBox: Box<string> = { value: "hello" }
\`\`\`

A far more realistic example is an API response wrapper — the envelope (status, error, timestamp) is always the same shape, but the \`data\` payload differs by endpoint:

\`\`\`ts
interface ApiResponse<T> {
  data: T
  error: string | null
  status: number
}

interface User {
  id: string
  name: string
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(\`/api/users/\${id}\`)
  return res.json()
}

const response = await fetchUser("42")
response.data.name // string — data is known to be a User, not unknown or any
\`\`\`

Every endpoint in an application can reuse the exact same \`ApiResponse<T>\` shape, just filling in a different \`T\` — \`ApiResponse<User>\`, \`ApiResponse<Order[]>\`, \`ApiResponse<{ count: number }>\` — instead of hand-writing a near-identical envelope interface per endpoint.

## Generic classes

Classes take a type parameter the same way interfaces do, and it's available throughout the whole class body — constructor, methods, and property types alike. A classic example is a type-safe stack:

\`\`\`ts
class Stack<T> {
  #items: T[] = []

  push(item: T): void {
    this.#items.push(item)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }

  peek(): T | undefined {
    return this.#items.at(-1)
  }

  get size(): number {
    return this.#items.length
  }
}

const numbers = new Stack<number>()
numbers.push(1)
numbers.push(2)
numbers.pop() // 2, typed as number | undefined

const names = new Stack<string>()
names.push("Ada")
names.push(42) // Error: Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

The exact same \`Stack\` class definition is reused for numbers, strings, or any other type — but once instantiated as \`Stack<number>\`, every method on that particular instance is locked to \`number\`, and the compiler enforces it at every call. A generic class can also implement a generic interface, matching type parameters between the two:

\`\`\`ts
interface Container<T> {
  get(): T
}

class Box<T> implements Container<T> {
  constructor(private value: T) {}
  get(): T {
    return this.value
  }
}
\`\`\`

## Default type parameters

Just like function parameters can have defaults, a generic type parameter can too, using \`= \` syntax. This lets callers omit the type argument entirely and fall back to something sensible:

\`\`\`ts
interface ApiResponse<T = unknown> {
  data: T
  error: string | null
  status: number
}

function handleError(res: ApiResponse) {
  // T defaults to unknown here — fine, since this function never touches res.data
  console.log(res.error)
}

const typed: ApiResponse<User> = { data: { id: "1", name: "Ada" }, error: null, status: 200 }
\`\`\`

Defaults are worth reaching for when there's a genuinely sensible fallback and plenty of call sites don't care what \`T\` is — \`unknown\` is usually the right default (it forces anyone who *does* want to use \`.data\` to narrow it first), rather than \`any\`, which would quietly bring back the type-safety hole generics exist to close. Be cautious about over-using defaults purely to avoid writing out a type argument at genuinely important call sites — if a caller *should* be thinking about what \`T\` is, a required type parameter (no default) is often the more honest signal.

## Constraining a class's type parameter

Generic constraints from the previous lesson apply to classes exactly the same way. A common real pattern is a generic repository that needs every stored item to at least have an \`id\`:

\`\`\`ts
interface HasId {
  id: string
}

class Repository<T extends HasId> {
  #items = new Map<string, T>()

  add(item: T): void {
    this.#items.set(item.id, item)
  }

  findById(id: string): T | undefined {
    return this.#items.get(id)
  }
}

interface User extends HasId {
  name: string
}

const users = new Repository<User>()
users.add({ id: "1", name: "Ada" })
\`\`\`

Without \`T extends HasId\`, the \`add\` method couldn't reference \`item.id\` at all — the compiler would have no guarantee any \`T\` has an \`id\` property. The constraint narrows "store absolutely anything" down to "store anything with at least an \`id\`," which is exactly the guarantee \`add\`'s implementation actually needs.

> **Key idea:** Interfaces and classes can declare their own type parameters, letting a single definition — a \`Box<T>\`, an \`ApiResponse<T>\`, a \`Stack<T>\`, a \`Repository<T extends HasId>\` — serve any concrete type while the compiler still enforces that type at every use. Default type parameters (\`<T = unknown>\`) let callers who don't care about the specific type omit it, without falling back to \`any\` and losing safety altogether.`,
    },
    {
      name: "keyof, typeof & Indexed Access Types",
      minutes: 9,
      intro:
        "Derive types directly from your values and objects with typeof and keyof, look up a specific property's type with indexed access, and combine all three with generics to write a fully type-safe getProp helper.",
      content: `## keyof: turning an object type into a union of its keys

The \`keyof\` operator takes an object type and produces a union of its property names, as string literal types:

\`\`\`ts
interface User {
  id: string
  name: string
  age: number
}

type UserKey = keyof User // "id" | "name" | "age"
\`\`\`

This is enormously useful anywhere you want to accept "a property name of \`User\`" as a parameter, and have the compiler reject anything that isn't actually one of those names:

\`\`\`ts
function printProperty(user: User, key: keyof User) {
  console.log(user[key])
}

printProperty(user, "name") // fine
printProperty(user, "email") // Error: Argument of type '"email"' is not assignable to parameter of type '"id" | "name" | "age"'
\`\`\`

Without \`keyof User\`, that second parameter would have to be typed as plain \`string\`, which would accept any string at all — including typos and properties that don't exist — and only fail at runtime when \`user[key]\` came back \`undefined\`. \`keyof\` moves that check to compile time.

## typeof in type position

This is a genuinely easy thing to conflate: JavaScript's \`typeof\` operator, used in an *expression*, returns a runtime string like \`"string"\` or \`"object"\`. TypeScript separately overloads \`typeof\` for use in a **type position**, where it means something completely different: "give me the compile-time type of this value."

\`\`\`ts
const config = {
  apiUrl: "https://api.example.com",
  retries: 3,
  debug: false,
}

type Config = typeof config
// equivalent to:
// type Config = { apiUrl: string; retries: number; debug: boolean }
\`\`\`

This is especially useful for avoiding a duplicated, hand-written interface that has to be kept in sync with an actual value — instead, the type is *derived* from the value, so if \`config\` gains or loses a field, \`Config\` updates automatically. Combine it with \`keyof\` to get the key union of a plain object, without ever having written a named interface for it at all:

\`\`\`ts
type ConfigKey = keyof typeof config // "apiUrl" | "retries" | "debug"
\`\`\`

## Indexed access types: T[K]

Just as you can look up a value on an object at runtime with \`obj[key]\`, you can look up a **type** on a type with the same bracket syntax, called an indexed access type:

\`\`\`ts
type UserName = User["name"] // string
type UserAge = User["age"] // number
\`\`\`

Passing a union of keys returns a union of the corresponding value types:

\`\`\`ts
type UserValue = User[keyof User] // string | string | number → string | number
\`\`\`

This same syntax works on arrays and tuples too, using the special \`number\` key to mean "the type of any element":

\`\`\`ts
interface Item {
  sku: string
  price: number
}

type Items = Item[]
type SingleItem = Items[number] // Item — the element type of the array
\`\`\`

\`Items[number]\` reads naturally once you know the trick: "index into the \`Items\` array type with a \`number\`," which gives back whatever type sits at any numeric index — the element type.

## Putting it together: a type-safe getProp

\`keyof\`, indexed access, and generics combine into one of the most common type-safe utility patterns in real TypeScript code — a function that looks up any property on any object, with the return type automatically tied to *which* property was requested:

\`\`\`ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user: User = { id: "1", name: "Ada", age: 32 }

const name = getProp(user, "name") // inferred as string
const age = getProp(user, "age") // inferred as number
const bad = getProp(user, "email") // Error: Argument of type '"email"' is not assignable to parameter of type '"id" | "name" | "age"'
\`\`\`

Read the signature the way the compiler does: \`T\` is inferred as \`User\` from the first argument; \`K extends keyof T\` constrains the second argument to be one of \`User\`'s actual keys (and TypeScript infers exactly which one from the literal string passed); and the return type \`T[K]\` looks that specific key up in \`T\`, giving back precisely the right type at each call site — \`string\` for \`"name"\`, \`number\` for \`"age"\` — with zero manual overloads and zero \`any\`. This is the toolkit — deriving new types from existing ones instead of hand-duplicating them — that the next module's mapped and conditional types build directly on top of.

> **Key idea:** \`keyof\` turns an object type into a union of its property-name literals, \`typeof\` (in a type position) extracts the type of an existing value so you don't have to hand-write a matching interface, and indexed access (\`T[K]\`) looks up the type of a specific property or array element. Combined with generics — as in \`getProp<T, K extends keyof T>(obj: T, key: K): T[K]\` — they let you write one function that stays fully type-safe across every property of every object shape, instead of one overload per property.`,
    },
  ],
}
