import type { Module } from "../types"

export const jsModule11: Module = {
  id: 11,
  title: "Modules, Iterators & Generators",
  status: "upcoming",
  lessons: [
    {
      name: "ES Modules: import & export",
      minutes: 9,
      intro: "Splitting code across files with a real, standardized module system.",
      content: `### Named exports

\`\`\`js
// math.js
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

export const PI = 3.14159
\`\`\`

\`\`\`js
// main.js
import { add, subtract, PI } from "./math.js"

console.log(add(2, 3))   // 5
console.log(PI)            // 3.14159
\`\`\`

\`export\` marks a function, variable, or class as available to other files; \`import { name }\` pulls specific named exports from a given file. This directly replaces the module-pattern IIFE from module 4 — the same underlying goal (organizing code, controlling what's exposed) with a real, standardized syntax the language itself understands, rather than a closure-based workaround.

### Default exports

\`\`\`js
// user.js
export default class User {
  constructor(name) {
    this.name = name
  }
}
\`\`\`

\`\`\`js
// main.js
import User from "./user.js"   // no curly braces for a default import — and you can name it anything

const u = new User("Ada")
\`\`\`

A file can have **at most one** default export — conventionally used for a file's single primary thing (one main class, one main function). Unlike named imports, a default import's local name is entirely up to the importer — it doesn't need to match anything from the original file.

### Mixing default and named exports

\`\`\`js
// api.js
export default function fetchData() { /* ... */ }
export const BASE_URL = "https://api.example.com"
export function buildUrl(path) {
  return \`\${BASE_URL}\${path}\`
}
\`\`\`

\`\`\`js
import fetchData, { BASE_URL, buildUrl } from "./api.js"
\`\`\`

A single file can freely combine one default export with any number of named exports — a common real pattern for a module with one primary export plus a few smaller, related utilities.

### Renaming on import or export

\`\`\`js
export { add as sum }

import { sum as addNumbers } from "./math.js"
\`\`\`

\`as\` renames an export or import — useful for resolving a naming collision between two modules, or simply preferring a clearer local name than the original.

### import * as: grabbing everything as one namespace object

\`\`\`js
import * as MathUtils from "./math.js"

console.log(MathUtils.add(2, 3))   // 5
console.log(MathUtils.PI)            // 3.14159
\`\`\`

Useful when you want every export from a module, accessed through one consistent namespace, rather than listing each one individually.

### Modules are singletons — evaluated once, shared everywhere

\`\`\`js
// counter.js
export let count = 0
export function increment() {
  count++
}
\`\`\`

\`\`\`js
// a.js
import { count, increment } from "./counter.js"
increment()
console.log(count)   // 1
\`\`\`

\`\`\`js
// b.js — imports the SAME module instance as a.js, not a fresh copy
import { count } from "./counter.js"
console.log(count)   // 1 — sees a.js's change, because it's the exact same module instance
\`\`\`

A module's code runs exactly **once**, no matter how many other files import from it — every importer shares the identical instance of its exported values, not independent copies. This is genuinely useful for things like a shared configuration object or a singleton service, and worth knowing so shared mutable module state (like \`count\` here) doesn't come as a surprise.

### Modules run in strict mode automatically, and have their own top-level scope

Unlike a plain, non-module script, ES module code automatically runs in **strict mode** (recall module 7's \`this\`-in-plain-functions behavior: \`undefined\`, not the global object — this is exactly why) and each module has its own top-level scope — a top-level \`const\` in one file never leaks into or collides with another file's top-level \`const\`, even without any wrapping function.

> **Key idea:** \`export\`/\`import\` is the real, standardized replacement for module 4's closure-based module pattern — named exports for multiple related items, a single default export for a file's primary thing, and every module is evaluated exactly once, with its exports shared (not copied) across every file that imports it.`,
    },
    {
      name: "The Iterable & Iterator Protocol",
      minutes: 9,
      intro: "The actual mechanism that lets for...of and spread work on arrays, strings, Maps, and Sets alike.",
      content: `### What makes something work with for...of

\`\`\`js
for (const char of "hello") { console.log(char) }      // works — strings are iterable
for (const n of [1, 2, 3]) { console.log(n) }             // works — arrays are iterable
for (const key of { a: 1, b: 2 }) { console.log(key) }      // TypeError — plain objects are NOT iterable!
\`\`\`

Recall module 2's introduction of \`for...of\`: it works on arrays and strings, but explicitly **not** on plain objects — this lesson explains precisely *why*, by looking at the actual protocol underneath.

### The iterator protocol: an object with a specific .next() shape

\`\`\`js
function makeRangeIterator(start, end) {
  let current = start
  return {
    next() {
      if (current < end) {
        return { value: current++, done: false }
      }
      return { value: undefined, done: true }
    },
  }
}

const it = makeRangeIterator(1, 4)
console.log(it.next())   // { value: 1, done: false }
console.log(it.next())    // { value: 2, done: false }
console.log(it.next())     // { value: 3, done: false }
console.log(it.next())      // { value: undefined, done: true }
\`\`\`

An **iterator** is simply any object with a \`.next()\` method that returns \`{ value, done }\` — call it repeatedly, and it hands back the next value each time, until \`done: true\` signals there's nothing left. This is a plain, ordinary object obeying a specific, agreed-upon shape — nothing more exotic than that.

### The iterable protocol: an object with a Symbol.iterator method

\`\`\`js
const range = {
  from: 1,
  to: 4,
  [Symbol.iterator]() {           // this makes \`range\` ITERABLE
    let current = this.from
    const last = this.to
    return {                       // returns an ITERATOR, exactly matching the shape above
      next() {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  },
}

for (const n of range) { console.log(n) }   // 1, 2, 3, 4 — for...of works on our OWN custom object!
console.log([...range])                        // [1, 2, 3, 4] — spread works too!
\`\`\`

An **iterable** is any object with a method keyed by the special built-in \`Symbol.iterator\` (recall module 1's brief mention of \`Symbol\` as a guaranteed-unique value — this is its primary real-world use), which, when called, must return a valid iterator matching the shape from the previous example. \`for...of\`, the spread operator, destructuring, and \`Array.from\` all work by looking for and calling this exact method — this is precisely why they work uniformly on arrays, strings, Maps, and Sets (all built-in iterables), but not on plain objects, which simply don't define \`Symbol.iterator\`.

### Manually consuming an iterable, the way for...of does it internally

\`\`\`js
const arr = [10, 20, 30]
const iterator = arr[Symbol.iterator]()   // get the iterator directly

let result = iterator.next()
while (!result.done) {
  console.log(result.value)
  result = iterator.next()
}
// 10, 20, 30 — this loop is functionally what \`for (const x of arr)\` does automatically
\`\`\`

This makes the "magic" of \`for...of\` completely transparent: it's simply calling \`[Symbol.iterator]()\` to get an iterator, then repeatedly calling \`.next()\` until \`done\` is \`true\` — exactly the manual loop above, just with cleaner syntax handling it for you.

### Why this matters beyond curiosity

Understanding this protocol means you can make **your own** custom data structures (a linked list, a custom collection, a paginated data source) work seamlessly with \`for...of\`, spread, and destructuring — by simply implementing \`Symbol.iterator\` correctly, exactly as the \`range\` example did — rather than being limited to only the built-in iterables JavaScript ships with.

> **Key idea:** an iterable is any object with a \`Symbol.iterator\` method returning a valid iterator (an object with \`.next()\` returning \`{ value, done }\`) — this precise, uniform protocol is the actual mechanism behind \`for...of\`, spread, and destructuring, and implementing it on your own objects makes them work with all three automatically.`,
    },
    {
      name: "Generators",
      minutes: 10,
      intro: "A special kind of function that can pause and resume itself, and the easiest way to build an iterator.",
      content: `### The problem generators solve: writing the previous lesson's iterator by hand is tedious

Recall the previous lesson's \`makeRangeIterator\` — manually tracking \`current\`, checking a condition, returning \`{ value, done }\` by hand every single time. Generators let you write the exact same logic as ordinary, sequential code instead.

### A generator function: function* and yield

\`\`\`js
function* rangeGenerator(start, end) {
  let current = start
  while (current < end) {
    yield current   // PAUSES here, handing back current, resuming exactly here on the next .next()
    current++
  }
}

const gen = rangeGenerator(1, 4)
console.log(gen.next())   // { value: 1, done: false }
console.log(gen.next())    // { value: 2, done: false }
console.log(gen.next())     // { value: 3, done: false }
console.log(gen.next())      // { value: undefined, done: true }
\`\`\`

The \`function*\` syntax (note the asterisk) marks a **generator function**. Calling it doesn't run its body immediately — it returns a generator object, which **already correctly implements** both the iterator protocol (\`.next()\`) *and* the iterable protocol (it has its own \`Symbol.iterator\`, returning itself). Every call to \`.next()\` resumes the function's body from exactly where it last paused, running until the next \`yield\` (or the function ends).

### This means generators work directly with for...of and spread

\`\`\`js
for (const n of rangeGenerator(1, 4)) {
  console.log(n)
}
// 1, 2, 3 — works immediately, no Symbol.iterator boilerplate needed

console.log([...rangeGenerator(1, 4)])   // [1, 2, 3]
\`\`\`

Compare this directly against the previous lesson's hand-written \`range\` object with its explicit \`[Symbol.iterator]()\` method — a generator function gives you the exact same iterable behavior, automatically, just by using \`yield\` inside an ordinary-looking function with a loop.

### yield can receive values back too — a two-way conversation

\`\`\`js
function* conversation() {
  const name = yield "What's your name?"
  const age = yield \`Hi \${name}, how old are you?\`
  return \`\${name} is \${age} years old\`
}

const convo = conversation()
console.log(convo.next())            // { value: "What's your name?", done: false }
console.log(convo.next("Ada"))         // { value: "Hi Ada, how old are you?", done: false } — "Ada" becomes the value of the FIRST yield
console.log(convo.next("30"))           // { value: "Ada is 30 years old", done: true }
\`\`\`

This is more advanced, but worth knowing: whatever value you pass into \`.next(value)\` becomes the result of the \`yield\` expression that's currently paused — allowing genuine two-way communication between the generator and whatever is driving it, not just one-way value production.

### An infinite generator — genuinely useful, since values are produced lazily

\`\`\`js
function* naturalNumbers() {
  let n = 1
  while (true) {
    yield n++
  }
}

const numbers = naturalNumbers()
console.log(numbers.next().value)   // 1
console.log(numbers.next().value)    // 2
console.log(numbers.next().value)     // 3
// this generator NEVER actually finishes, and that's fine — values are produced one at a time, on demand
\`\`\`

Because a generator only computes the *next* value when \`.next()\` is actually called, an infinite sequence like this is completely safe — unlike trying to build an infinite array, which would immediately exhaust memory. This "produce values lazily, on demand" property is genuinely useful for things like paginated API results, or any sequence too large (or truly infinite) to materialize all at once.

### yield*: delegating to another iterable

\`\`\`js
function* letters() {
  yield "a"
  yield "b"
}

function* combined() {
  yield 1
  yield* letters()   // delegates to another generator/iterable, yielding each of ITS values in turn
  yield 2
}

console.log([...combined()])   // [1, "a", "b", 2]
\`\`\`

\`yield*\` hands off to another iterable, yielding each of its values one by one, as though they'd been \`yield\`ed directly — useful for composing generators out of smaller, reusable pieces.

> **Key idea:** a generator function (\`function*\`, with \`yield\`) automatically produces something that satisfies both the iterator and iterable protocols from the previous lesson, letting you write pausable, resumable, lazily-evaluated sequences as ordinary sequential code — including genuinely infinite sequences, since each value is only computed when actually requested.`,
    },
    {
      name: "Symbols, Map & Set",
      minutes: 8,
      intro: "A truly unique primitive type, and the two built-in collection types beyond plain objects and arrays.",
      content: `### Symbol: a value guaranteed unique, even with an identical description

\`\`\`js
const id1 = Symbol("id")
const id2 = Symbol("id")
console.log(id1 === id2)   // false — always unique, regardless of the description string

const obj = {
  [id1]: "first value",
  [id2]: "second value",
  name: "regular property",
}
console.log(obj[id1])   // "first value"
console.log(Object.keys(obj))   // ["name"] — Symbol keys are NOT included in normal enumeration!
\`\`\`

Recall module 1's brief introduction, and the previous lesson's \`Symbol.iterator\` — a \`Symbol\` is a primitive value guaranteed unique, useful precisely as an object key that won't accidentally collide with any string key (including ones added later by other code) and won't show up in \`Object.keys\`/\`for...in\`/\`JSON.stringify\` by default — useful for adding metadata to an object without any risk of interfering with its normal, visible properties.

### Map: key-value pairs, with any type of key

\`\`\`js
const scores = new Map()
scores.set("Ada", 95)
scores.set("Grace", 88)

console.log(scores.get("Ada"))   // 95
console.log(scores.has("Grace"))   // true
console.log(scores.size)             // 2

scores.delete("Grace")
console.log(scores.size)     // 1

for (const [name, score] of scores) {   // Map is iterable — yields [key, value] pairs
  console.log(name, score)
}
\`\`\`

A plain object's keys are always coerced to strings (recall module 5) — a \`Map\` allows **any value at all** as a key, including objects, functions, or numbers, without coercion:

\`\`\`js
const objKey = { id: 1 }
const map = new Map()
map.set(objKey, "some data")
console.log(map.get(objKey))         // "some data"
console.log(map.get({ id: 1 }))        // undefined — a DIFFERENT object, even with identical contents (module 5's reference equality!)
\`\`\`

This directly reflects module 5's reference-vs-value lesson: looking up a different object with identical contents fails, because \`Map\` keys are compared the same way \`===\` compares objects — by reference, not structural equality.

### When to reach for Map instead of a plain object

Use \`Map\` when keys aren't naturally strings (objects, or values determined at runtime you don't want silently coerced), when you need a reliable \`.size\`, or when you'll be frequently adding/removing keys — a plain object works fine for most everyday key-value needs, but \`Map\` is the more correct, more explicit tool for these specific cases.

### Set: a collection of unique values

\`\`\`js
const uniqueNumbers = new Set([1, 2, 2, 3, 3, 3])
console.log(uniqueNumbers)          // Set(3) { 1, 2, 3 } — duplicates automatically removed
console.log(uniqueNumbers.size)       // 3
console.log(uniqueNumbers.has(2))       // true

uniqueNumbers.add(4)
uniqueNumbers.delete(1)
console.log([...uniqueNumbers])           // [2, 3, 4] — spread works, since Set is iterable too
\`\`\`

A \`Set\` stores only **unique** values — adding a value already present does nothing. A genuinely common, idiomatic use: deduplicating an array in one line, \`[...new Set(arrayWithDuplicates)]\`, far more concise than manually filtering for uniqueness.

### Deduplicating an array of objects requires more care

\`\`\`js
const people = [{ name: "Ada" }, { name: "Ada" }]
console.log(new Set(people).size)   // 2 — NOT deduplicated! Two different objects, even with identical contents
\`\`\`

Exactly like \`Map\`'s key comparison, \`Set\` uses reference equality for objects — this only deduplicates primitives directly, not objects with matching contents. Deduplicating objects by some specific field requires a different approach (commonly, a \`Map\` keyed by that field).

> **Key idea:** \`Symbol\` creates a guaranteed-unique value, commonly used as a collision-proof object key hidden from normal enumeration; \`Map\` allows any value (not just strings) as a key with reliable size tracking; \`Set\` stores only unique values — both are iterable, and both compare objects by reference, exactly like \`===\`, not by structural content.`,
    },
  ],
}
