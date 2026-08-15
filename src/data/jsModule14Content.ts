import type { Module } from "../types"

export const jsModule14: Module = {
  id: 14,
  title: "Modern Syntax & Meta-programming",
  status: "upcoming",
  lessons: [
    {
      name: "Optional Chaining & Logical Assignment",
      minutes: 8,
      intro: "Two small but extremely common pieces of modern syntax that eliminate a lot of defensive boilerplate.",
      content: `### The problem optional chaining solves

\`\`\`js
const user = { profile: { address: { city: "London" } } }
const userNoAddress = { profile: {} }

// the old, defensive way — checking every level before accessing the next
const city = user.profile && user.profile.address && user.profile.address.city
console.log(city)   // "London"

console.log(userNoAddress.profile.address.city)   // TypeError: Cannot read properties of undefined
\`\`\`

Accessing a nested property when an intermediate step might be missing has always required verbose, defensive checking — recall module 5: reading a property of \`undefined\`/\`null\` throws immediately.

### Optional chaining: ?.

\`\`\`js
const user = { profile: { address: { city: "London" } } }
const userNoAddress = { profile: {} }

console.log(user?.profile?.address?.city)          // "London"
console.log(userNoAddress?.profile?.address?.city)    // undefined — no error, just undefined!
\`\`\`

\`?.\` checks whether the value immediately to its left is \`null\` or \`undefined\` — if so, the **entire expression short-circuits** to \`undefined\` immediately, without attempting the rest of the chain (and without throwing). If it's not \`null\`/\`undefined\`, it proceeds exactly like a normal \`.\` access. This directly replaces the verbose \`&&\`-chained defensive check above with one clean expression.

### Optional chaining with function calls and array access

\`\`\`js
const obj = { greet: () => "hi" }
const obj2 = {}

console.log(obj.greet?.())    // "hi" — calls greet only if it exists
console.log(obj2.greet?.())     // undefined — greet doesn't exist, so the call is safely skipped, no TypeError

const arr = null
console.log(arr?.[0])   // undefined — safely accesses an array index, even though arr itself is null
\`\`\`

\`?.()\` optionally calls a function (only if it exists); \`?.[...]\` optionally accesses a computed/array index — both follow the identical short-circuiting rule as plain \`?.\`.

### The critical distinction: ?. checks for null/undefined specifically, not falsy

\`\`\`js
const user = { score: 0 }
console.log(user?.score)   // 0 — correctly returns the actual value; ?. does NOT treat 0 as "missing"
\`\`\`

Unlike \`&&\`-based defensive checks (which treat *any* falsy value as "stop here" — recall module 2's truthy/falsy lesson), \`?.\` specifically checks only for \`null\`/\`undefined\` — a legitimate \`0\`, \`""\`, or \`false\` value passes through correctly. This is a genuine, meaningful improvement over the old \`&&\` pattern, not just shorter syntax.

### Logical assignment operators: ||=, &&= and ??=

\`\`\`js
let config = { theme: null, retries: 0 }

config.theme ||= "light"      // same as: config.theme = config.theme || "light"
config.retries ??= 3            // same as: config.retries = config.retries ?? 3

console.log(config.theme)      // "light" — was null (falsy), so it got assigned
console.log(config.retries)      // 0 — NOT reassigned, because ?? only triggers on null/undefined, and 0 isn't either
\`\`\`

These three combine an assignment with the corresponding logical operator, only performing the assignment when the check passes — directly extending module 2's \`||\`/\`??\` default-value patterns into a compact assignment form:

- **\`x ||= y\`** — assign \`y\` to \`x\` only if \`x\` is currently falsy.
- **\`x &&= y\`** — assign \`y\` to \`x\` only if \`x\` is currently truthy (useful for conditionally updating a value only when it already exists).
- **\`x ??= y\`** — assign \`y\` to \`x\` only if \`x\` is currently \`null\`/\`undefined\` — the safest default for the same reason \`??\` was preferred over \`||\` in module 2, when \`0\`/\`""\`/\`false\` are legitimate values that shouldn't be overwritten.

### A combined, realistic example

\`\`\`js
function processUser(user) {
  user.settings ??= {}                          // ensure settings exists, without overwriting a real one
  user.settings.notifications ??= true             // same idea, one level deeper

  const city = user?.profile?.address?.city ?? "Unknown"   // optional chaining + a final fallback
  return { ...user, city }
}
\`\`\`

Optional chaining and \`??\`/\`??=\` are frequently used together like this — safely reading deeply nested, possibly-missing data, with a sensible fallback at the end.

> **Key idea:** \`?.\` short-circuits to \`undefined\` the moment it hits a \`null\`/\`undefined\` in a chain, without throwing — and unlike \`&&\`, it correctly treats \`0\`/\`""\`/\`false\` as legitimate values, not "missing." \`||=\`/\`&&=\`/\`??=\` fold module 2's logical-default patterns directly into an assignment, with \`??=\` being the safest default for the same reason \`??\` was preferred there.`,
    },
    {
      name: "Property Descriptors & Object.defineProperty",
      minutes: 8,
      intro: "The hidden configuration behind every object property — what module 5's Object.freeze was actually built on.",
      content: `### Every property has more to it than just a value

\`\`\`js
const obj = { name: "Ada" }
console.log(Object.getOwnPropertyDescriptor(obj, "name"))
// { value: "Ada", writable: true, enumerable: true, configurable: true }
\`\`\`

Every object property, even one created with plain \`{ name: "Ada" }\` syntax, actually has a full **property descriptor** behind it — not just a value, but three additional boolean flags controlling exactly how that property behaves. Ordinary object-literal properties default to all three flags being \`true\`.

### The three flags, precisely

\`\`\`js
const obj = {}
Object.defineProperty(obj, "id", {
  value: 1,
  writable: false,      // can the value be changed by reassignment?
  enumerable: false,       // does it show up in Object.keys / for...in / JSON.stringify?
  configurable: false,       // can the descriptor itself be changed, or the property deleted, later?
})

obj.id = 999               // silently fails (writable: false) — no error in non-strict mode, throws in strict mode
console.log(obj.id)          // still 1

console.log(Object.keys(obj))   // [] — id is hidden from enumeration!
console.log(obj.id)                // 1 — but it's still directly accessible by name

delete obj.id                        // silently fails — configurable: false prevents removal
console.log(obj.id)                    // still 1
\`\`\`

\`Object.defineProperty\` creates or modifies a single property with full, explicit control over these flags — something a plain object literal or ordinary assignment can't do. This is genuinely how libraries implement things like a "hidden" internal property that still works normally but doesn't clutter \`Object.keys()\` output or accidental \`JSON.stringify\` serialization.

### This is what Object.freeze is actually built on

\`\`\`js
const config = { apiUrl: "https://api.example.com" }
Object.freeze(config)

// this is roughly equivalent to setting writable: false and configurable: false
// on EVERY existing property, via defineProperty, all at once
\`\`\`

Recall module 5's \`Object.freeze\` — this lesson reveals the actual mechanism underneath it: freezing an object is, conceptually, setting \`writable: false\` and \`configurable: false\` on every one of its own properties in one step, using exactly the descriptor system covered here.

### Defining a getter/setter via defineProperty (an alternative to module 5's get/set syntax)

\`\`\`js
const person = { firstName: "Ada", lastName: "Lovelace" }

Object.defineProperty(person, "fullName", {
  get() {
    return \`\${this.firstName} \${this.lastName}\`
  },
  enumerable: true,
})

console.log(person.fullName)   // "Ada Lovelace"
\`\`\`

Recall module 5's \`get\`/\`set\` object-literal syntax — \`defineProperty\` with a \`get\`/\`set\` in its descriptor achieves the identical result, just with the explicit enumerable/configurable control this lesson covers, useful when you need that extra control or are adding the getter to an object *after* it already exists.

### A practical use case: a read-only, hidden internal counter

\`\`\`js
function createIdGenerator() {
  let nextId = 1
  const generator = {}

  Object.defineProperty(generator, "next", {
    value() {
      return nextId++
    },
    enumerable: false,   // hidden from casual inspection/serialization
  })

  return generator
}

const gen = createIdGenerator()
console.log(gen.next())         // 1
console.log(gen.next())           // 2
console.log(Object.keys(gen))       // [] — next is intentionally hidden from enumeration
\`\`\`

This combines module 4's closures (\`nextId\` stays private via the closure) with this lesson's \`enumerable: false\` (the \`next\` method itself is hidden from casual inspection) — two different privacy mechanisms working together.

> **Key idea:** every object property carries \`writable\`/\`enumerable\`/\`configurable\` flags, defaulting to \`true\` for ordinary object-literal properties — \`Object.defineProperty\` gives explicit control over all three, and it's the actual underlying mechanism module 5's \`Object.freeze\` uses, not a separate, unrelated feature.`,
    },
    {
      name: "Proxy & Reflect",
      minutes: 9,
      intro: "Intercepting fundamental object operations — reads, writes, deletions — before they happen.",
      content: `### What a Proxy does

\`\`\`js
const target = { name: "Ada" }

const handler = {
  get(obj, prop) {
    console.log(\`Reading property: \${String(prop)}\`)
    return obj[prop]
  },
}

const proxy = new Proxy(target, handler)

console.log(proxy.name)
// "Reading property: name"
// "Ada"
\`\`\`

A \`Proxy\` wraps a target object and lets you intercept fundamental operations on it — reading a property, writing one, checking \`in\`, deleting a key, and more — via **trap** functions in the handler object. Every operation on \`proxy\` that isn't explicitly trapped passes through to the real \`target\` unchanged; here, only \`get\` is trapped, so reads are logged, but everything else (like setting a property) behaves normally.

### Validation via the set trap

\`\`\`js
function createValidatedUser(initial) {
  return new Proxy(initial, {
    set(obj, prop, value) {
      if (prop === "age" && (typeof value !== "number" || value < 0)) {
        throw new TypeError("age must be a non-negative number")
      }
      obj[prop] = value
      return true   // must return true to indicate the set succeeded
    },
  })
}

const user = createValidatedUser({ name: "Ada", age: 30 })
user.age = 31            // fine
console.log(user.age)      // 31

user.age = -5               // throws TypeError immediately — validation runs on EVERY assignment
\`\`\`

This is a genuinely practical use case: enforcing validation rules on **every** property assignment automatically, without needing every part of the codebase to remember to call a separate \`validate()\` function manually before each write.

### Default values via the get trap

\`\`\`js
function withDefault(obj, defaultValue) {
  return new Proxy(obj, {
    get(target, prop) {
      return prop in target ? target[prop] : defaultValue
    },
  })
}

const settings = withDefault({ theme: "dark" }, "not set")
console.log(settings.theme)      // "dark"
console.log(settings.language)     // "not set" — a key that was never defined, handled gracefully
\`\`\`

Unlike optional chaining from the previous lesson (which handles one specific access defensively), this Proxy makes **every** property read on \`settings\` automatically fall back to a default — a different, broader tool for a related problem.

### Reflect: the natural companion to Proxy

\`\`\`js
const handler = {
  get(target, prop, receiver) {
    console.log(\`Reading: \${String(prop)}\`)
    return Reflect.get(target, prop, receiver)   // the "correct" way to forward the default behavior
  },
}
\`\`\`

\`Reflect\` provides the same set of fundamental operations as \`Proxy\`'s traps (\`Reflect.get\`, \`Reflect.set\`, \`Reflect.deleteProperty\`, etc.), but as plain, callable functions instead of interception hooks. Inside a Proxy trap, using \`Reflect.get(...)\` (rather than plain \`target[prop]\`) to forward to the default behavior is considered the more correct, robust approach, since it properly preserves certain edge cases (like \`this\` binding through inheritance) that manual property access can subtly get wrong.

### When you'd actually reach for this

Proxies are genuinely advanced and have real performance overhead — every trapped operation on a proxied object goes through the interception function. They're not something you'd reach for in everyday application code. Their real-world use is mostly inside **frameworks and libraries**: reactive state systems (Vue 3's reactivity system is built directly on \`Proxy\`), ORMs providing a query-builder-like interface, and validation/logging layers like the examples above. Recognizing the pattern is valuable even if you rarely write one yourself — you'll encounter \`Proxy\`-based behavior "under the hood" of tools you use.

> **Key idea:** \`Proxy\` intercepts fundamental operations (get/set/delete/etc.) on an object via trap functions, enabling things like automatic validation or default values applied uniformly across every access; \`Reflect\` provides the matching default-behavior functions, and using it to forward a trap's default case is the correct, robust pattern. This is a genuinely advanced tool, mostly encountered inside frameworks rather than everyday code.`,
    },
    {
      name: "WeakMap, WeakSet & Modern Async Extras",
      minutes: 8,
      intro: "Garbage-collection-friendly collections, and the newer pieces of the async/module story.",
      content: `### The problem WeakMap solves: preventing memory leaks from metadata

\`\`\`js
const cache = new Map()

function processElement(el) {
  if (cache.has(el)) return cache.get(el)
  const result = expensiveComputation(el)
  cache.set(el, result)
  return result
}
\`\`\`

Recall module 11's \`Map\` and module 12's garbage collection lesson: a regular \`Map\` holds a **strong reference** to every key stored in it — meaning an object used as a \`Map\` key stays reachable, and therefore alive, for as long as the \`Map\` itself exists, *even if nothing else in the program still references it*. If \`el\` (say, a removed DOM element, or any object that should otherwise be garbage-collected) is only kept alive by being a key in this cache, that's a real, if subtle, memory leak.

### WeakMap: keys don't prevent garbage collection

\`\`\`js
const cache = new WeakMap()

function processElement(el) {
  if (cache.has(el)) return cache.get(el)
  const result = expensiveComputation(el)
  cache.set(el, result)
  return result
}
// if \`el\` becomes unreachable everywhere else in the program, it (and its cache entry)
// can be garbage collected normally — the WeakMap does NOT keep it alive
\`\`\`

A \`WeakMap\` holds its keys **weakly** — it doesn't count as a reference that prevents garbage collection (recall module 12's reachability model). The moment an object used as a \`WeakMap\` key becomes otherwise unreachable, it (and its associated cache entry) can be collected normally, exactly as if the \`WeakMap\` didn't exist. This makes \`WeakMap\` the correct tool for attaching metadata or a cache to objects you don't own the lifecycle of, without accidentally keeping them alive forever.

### WeakMap's real restrictions, as a direct consequence

\`\`\`js
const wm = new WeakMap()
const key = {}
wm.set(key, "data")

console.log(wm.size)              // undefined — WeakMap has NO size property
// for (const [k, v] of wm) {}     // TypeError — WeakMap is NOT iterable

wm.set("string key", "value")    // TypeError — keys MUST be objects, never primitives
\`\`\`

Because entries can silently disappear at any moment (whenever garbage collection runs), a \`WeakMap\` deliberately has **no** \`.size\`, is **not** iterable, and only accepts objects as keys (never primitives, which aren't subject to garbage collection the same way) — all direct, necessary consequences of the "weak" behavior, not arbitrary limitations.

### WeakSet: the same idea, for a set of objects

\`\`\`js
const processedElements = new WeakSet()

function markProcessed(el) {
  processedElements.add(el)
}

function isProcessed(el) {
  return processedElements.has(el)
}
\`\`\`

Exactly the same relationship \`Set\` has to \`Map\`, applied to the weak versions — a \`WeakSet\` tracks membership of objects without preventing them from being garbage collected once nothing else references them. A common real use: marking which DOM elements (or other objects) have already been processed, without leaking memory for elements later removed from the page.

### Dynamic import(): loading a module on demand

\`\`\`js
async function loadChart() {
  const { Chart } = await import("./chart.js")   // only downloaded/executed when actually called
  return new Chart()
}

button.addEventListener("click", async () => {
  const chart = await loadChart()   // the chart module loads only when the button is actually clicked
})
\`\`\`

Recall module 11's static \`import\` — that form loads a module unconditionally, upfront. \`import(...)\` as a **function call** (returning a Promise) loads a module dynamically, at runtime, exactly when it's needed — commonly used for code-splitting, where a large or rarely-needed piece of a web application only downloads when a user actually reaches the feature that needs it.

### Top-level await: await without wrapping in an async function

\`\`\`js
// at the top level of an ES module — no surrounding async function needed
const data = await fetch("https://api.example.com/config").then(r => r.json())
console.log(data)

export const config = data
\`\`\`

Recall module 8: \`await\` normally requires being inside an \`async function\`. Inside an ES module specifically (module 11), \`await\` is allowed directly at the top level — useful for a module that needs to fetch or compute something before it can even define its exports.

### Async generators: combining modules 8, 9, and 11's generator lesson

\`\`\`js
async function* fetchPages(url) {
  let nextUrl = url
  while (nextUrl) {
    const response = await fetch(nextUrl)
    const data = await response.json()
    yield data.items
    nextUrl = data.nextPageUrl
  }
}

for await (const items of fetchPages("https://api.example.com/items")) {
  console.log(items)
}
\`\`\`

An **async generator** (\`async function*\`) combines module 11's \`yield\`-based generators with \`await\` — each \`yield\` can be preceded by asynchronous work. \`for await...of\` (note the added \`await\`) is the matching consumer, correctly awaiting each yielded value's underlying Promise. This is a genuinely practical pattern for paginated API results: it lets you write a loop over "all the pages," while each page is actually fetched lazily, on demand, exactly one at a time.

> **Key idea:** \`WeakMap\`/\`WeakSet\` don't prevent their object keys/members from being garbage collected, making them the correct tool for attaching metadata to objects you don't control the lifecycle of — at the direct cost of no \`.size\` and no iteration. Dynamic \`import()\`, top-level \`await\`, and async generators are the more recent extensions to modules 8/11's async and module coverage, each solving a genuinely practical, common problem: on-demand loading, module-level async setup, and lazily-fetched paginated data.`,
    },
  ],
}
