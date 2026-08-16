import type { Module } from "../types"

export const jestModule2: Module = {
  id: 2,
  title: "Matchers Deep Dive",
  status: "upcoming",
  lessons: [
    {
      name: "toBe vs toEqual: Reference vs Value, in Testing",
      minutes: 9,
      intro: "The single most common source of confusing Jest test failures for anyone new to it.",
      content: `### toBe: strict equality, ===

\`\`\`js
test("toBe compares primitives correctly", () => {
  expect(2 + 2).toBe(4)
  expect("hello").toBe("hello")
  expect(true).toBe(true)
})
\`\`\`

\`.toBe(expected)\` uses \`Object.is\` under the hood — for practical purposes, identical to \`===\` (recall this platform's JavaScript course's module 2 coverage of strict equality). For primitives (numbers, strings, booleans), this is exactly what you want, and works intuitively.

### The trap: toBe fails on objects/arrays with identical contents

\`\`\`js
test("toBe FAILS here, even though the objects LOOK identical", () => {
  expect({ name: "Ada" }).toBe({ name: "Ada" })   // FAILS!
})
\`\`\`

\`\`\`
Expected: {"name": "Ada"}
Received: serializes to the same string, but received: {"name": "Ada"}

expect(received).toBe(expected)

If it should pass with deep equality, replace "toBe" with "toStrictEqual"
\`\`\`

This directly connects to the JavaScript course's module 5 reference-vs-value lesson: \`toBe\`/\`===\` compares objects by **reference** — two separately created objects are never \`===\`, no matter how identical their contents look. Jest's own error message even suggests the fix directly, which is the next matcher.

### toEqual: deep, structural equality

\`\`\`js
test("toEqual compares CONTENTS, recursively", () => {
  expect({ name: "Ada" }).toEqual({ name: "Ada" })   // passes — same STRUCTURE, not same reference
  expect([1, 2, 3]).toEqual([1, 2, 3])
  expect({ user: { name: "Ada", roles: ["admin"] } }).toEqual({ user: { name: "Ada", roles: ["admin"] } })
})
\`\`\`

\`.toEqual(expected)\` recursively compares every property/element's *value*, ignoring whether they're the same underlying reference — this is what you want for objects and arrays the overwhelming majority of the time, since you're almost always testing "does this function return data shaped like this," not "does this function return this *exact* object instance."

### The practical rule: toBe for primitives, toEqual for objects/arrays

\`\`\`js
function createUser(name) {
  return { name, createdAt: new Date(), active: true }
}

test("createUser returns the correct shape", () => {
  const user = createUser("Ada")
  expect(user.name).toBe("Ada")            // primitive — toBe
  expect(user.active).toBe(true)               // primitive — toBe
  // expect(user).toBe({ name: "Ada", ... })   // would ALWAYS fail — different object reference every time
})
\`\`\`

This is worth internalizing as close to a hard rule: reach for \`.toBe\` when comparing a primitive value, and \`.toEqual\` the moment you're comparing an object or array — genuinely the single most common early mistake in writing Jest tests, and the one this lesson exists specifically to prevent.

### toStrictEqual: an even stricter version of toEqual

\`\`\`js
test("toEqual treats these as equal, toStrictEqual does NOT", () => {
  expect({ a: 1, b: undefined }).toEqual({ a: 1 })          // passes — toEqual ignores undefined properties
  expect({ a: 1, b: undefined }).toStrictEqual({ a: 1 })      // FAILS — toStrictEqual does NOT ignore them

  class Point {
    constructor(x, y) { this.x = x; this.y = y }
  }
  expect(new Point(1, 2)).toEqual({ x: 1, y: 2 })              // passes — toEqual ignores the class/prototype
  expect(new Point(1, 2)).toStrictEqual({ x: 1, y: 2 })          // FAILS — toStrictEqual checks the prototype too
})
\`\`\`

\`.toStrictEqual\` additionally checks that \`undefined\`-valued properties are actually present (not just absent, recall the JavaScript course's module 5 \`in\`/\`hasOwnProperty\` lesson on this exact distinction) and that both values share the same prototype/class — genuinely useful when a value's *exact* type or the explicit presence of an \`undefined\` property is meaningful to what you're testing, not just its visible contents.

### toMatchObject: checking a subset of properties

\`\`\`js
test("toMatchObject checks only the SPECIFIED properties, ignoring extras", () => {
  const user = { id: 1, name: "Ada", email: "ada@example.com", createdAt: new Date() }
  expect(user).toMatchObject({ name: "Ada", email: "ada@example.com" })   // passes — id/createdAt are ignored
})
\`\`\`

Unlike \`toEqual\` (which requires an *exact* match of every property), \`.toMatchObject\` passes as long as the received object contains *at least* the specified properties with matching values — genuinely useful when testing a large object where only a few specific fields are relevant to what this particular test is actually verifying, and asserting the rest would just be unrelated noise.

> **Key idea:** \`toBe\` (\`===\`) for primitives, \`toEqual\` (deep structural equality) for objects/arrays — this single distinction is the most common source of confusing early Jest failures. \`toStrictEqual\` additionally checks \`undefined\` properties and prototypes; \`toMatchObject\` checks only a specified subset of an object's properties.`,
    },
    {
      name: "Truthiness, Numbers & Strings",
      minutes: 8,
      intro: "The matchers built specifically for boolean-like conditions, numeric comparisons, and text patterns.",
      content: `### Truthiness matchers

\`\`\`js
test("truthiness matchers", () => {
  expect(true).toBeTruthy()
  expect(1).toBeTruthy()
  expect("hello").toBeTruthy()

  expect(false).toBeFalsy()
  expect(0).toBeFalsy()
  expect("").toBeFalsy()

  expect(null).toBeNull()
  expect(undefined).toBeUndefined()
  expect(0).toBeDefined()   // toBeDefined = NOT undefined (0 is defined, just falsy)
})
\`\`\`

Recall this platform's JavaScript course's module 2 truthy/falsy lesson, applied directly: \`.toBeTruthy()\`/\`.toBeFalsy()\` check whether a value coerces to \`true\`/\`false\` in a boolean context — genuinely useful when you care that a value is "present" or "absent" in the general sense, not its *exact* value. \`.toBeNull()\` and \`.toBeUndefined()\` are more precise — they check for that *specific* value, not just falsiness (recall the JS course's distinction between \`null\` and \`undefined\`, module 1) — worth reaching for whenever the exact value, not just its truthiness, is what actually matters.

### The common trap: toBeTruthy hides which specific value you got

\`\`\`js
// if this test fails, the error just says "expected truthy, received falsy" — unhelpful!
test("bad: too vague", () => {
  expect(getUser()).toBeTruthy()
})

// if this fails, the error shows the EXACT wrong value received — much more useful for debugging
test("good: specific", () => {
  expect(getUser()).toEqual({ id: 1, name: "Ada" })
})
\`\`\`

\`.toBeTruthy()\` is convenient, but its failure message is genuinely less useful than a more specific matcher — when a more precise assertion is available (\`toBe\`, \`toEqual\`, \`toBeNull\`), prefer it; reach for \`.toBeTruthy()\`/\`.toBeFalsy()\` specifically when the *exact* value genuinely doesn't matter, only its truthiness.

### Number matchers

\`\`\`js
test("number matchers", () => {
  expect(4).toBeGreaterThan(3)
  expect(4).toBeGreaterThanOrEqual(4)
  expect(4).toBeLessThan(5)
  expect(4).toBeLessThanOrEqual(4)

  expect(0.1 + 0.2).toBeCloseTo(0.3)   // handles floating-point imprecision — see below
  // expect(0.1 + 0.2).toBe(0.3)          would FAIL — recall the JS course's module 13 float-precision lesson
})
\`\`\`

\`.toBeCloseTo(expected, numDigits?)\` exists specifically because of the floating-point imprecision this platform's JavaScript course's module 13 covered in depth (\`0.1 + 0.2 !== 0.3\`) — it checks the value is *close enough*, within a configurable number of decimal digits (defaulting to 2), rather than requiring exact equality. **Never use \`.toBe\` for a computed decimal result** — reach for \`.toBeCloseTo\` instead, every time.

### String matchers

\`\`\`js
test("string matchers", () => {
  expect("Hello, World!").toMatch(/World/)         // matches a REGULAR EXPRESSION
  expect("Hello, World!").toMatch("World")           // or a plain substring
  expect("hello@example.com").toMatch(/^[\\w.-]+@[\\w.-]+$/)
})
\`\`\`

\`.toMatch\` accepts either a regular expression (recall the JavaScript course's module 12 regex lesson) or a plain substring — genuinely the right tool whenever you need to verify a string *contains* or *matches a pattern*, rather than being an exact, complete match (which \`.toBe\` handles for full-string comparisons).

### Array/iterable containment: toContain

\`\`\`js
test("toContain checks for a specific element", () => {
  expect(["apple", "banana", "cherry"]).toContain("banana")
  expect("hello world").toContain("world")   // works on strings too — checks for a substring
  expect(new Set([1, 2, 3])).toContain(2)       // works on any iterable (recall JS course module 11)
})
\`\`\`

\`.toContain\` checks whether an array (or any iterable, or a string as a substring check) contains a specific element — reach for this instead of manually writing \`array.includes(x)\` inside a \`toBe(true)\`, since \`.toContain\`'s failure message directly shows the *entire* array/string and what was actually missing, which is far more useful for debugging than a bare \`true\`/\`false\` mismatch.

> **Key idea:** prefer a specific matcher (\`toBe\`, \`toEqual\`, \`toBeNull\`) over a vague truthiness check whenever possible, since specific matchers produce far more useful failure messages. \`.toBeCloseTo\` exists specifically to handle floating-point imprecision — never \`.toBe\` a computed decimal result — and \`.toMatch\`/\`.toContain\` are the right tools for pattern/substring and containment checks respectively.`,
    },
    {
      name: "Array & Object Matchers",
      minutes: 8,
      intro: "Asserting on the shape and contents of arrays and objects with precision.",
      content: `### Checking array length and specific elements

\`\`\`js
test("array-specific assertions", () => {
  const fruits = ["apple", "banana", "cherry"]

  expect(fruits).toHaveLength(3)
  expect(fruits[0]).toBe("apple")
  expect(fruits).toContain("banana")
  expect(fruits).toEqual(["apple", "banana", "cherry"])   // exact order and contents
})
\`\`\`

\`.toHaveLength(n)\` works on anything with a \`.length\` property (recall the JavaScript course's module 6: arrays and strings both qualify) — a small but genuinely more readable alternative to \`expect(fruits.length).toBe(3)\`, and its failure message directly shows the actual length received alongside the full array.

### Checking array contents regardless of order

\`\`\`js
test("toEqual cares about order; toEqual with expect.arrayContaining does not", () => {
  const roles = ["admin", "editor", "viewer"]

  expect(roles).toEqual(["admin", "editor", "viewer"])          // exact order required
  // expect(roles).toEqual(["editor", "admin", "viewer"])         would FAIL — wrong order!

  expect(roles).toEqual(expect.arrayContaining(["editor", "admin"]))   // order-independent, subset check
})
\`\`\`

\`expect.arrayContaining([...])\` — an **asymmetric matcher**, usable nested inside another matcher — checks that the received array contains *at least* the given elements, in *any* order, ignoring extras. Genuinely useful when a function's exact output order isn't meaningful to what you're testing, only which elements are present.

### Checking that every array element matches a shape

\`\`\`js
test("every element matches a pattern", () => {
  const users = [
    { id: 1, name: "Ada", role: "admin" },
    { id: 2, name: "Grace", role: "editor" },
  ]

  expect(users).toEqual([
    expect.objectContaining({ name: "Ada" }),
    expect.objectContaining({ name: "Grace" }),
  ])
})
\`\`\`

\`expect.objectContaining({...})\` is the object equivalent of \`arrayContaining\` — an asymmetric matcher checking that an object contains *at least* the specified properties (essentially \`toMatchObject\`'s logic, but usable *nested* inside a larger \`toEqual\`, which \`toMatchObject\` alone can't do).

### Checking a property exists at a given path

\`\`\`js
test("toHaveProperty checks a nested path directly", () => {
  const response = {
    data: {
      user: { id: 1, name: "Ada" },
    },
    status: 200,
  }

  expect(response).toHaveProperty("status", 200)
  expect(response).toHaveProperty("data.user.name", "Ada")   // dot-notation for nested paths
  expect(response).toHaveProperty("data.user.id")               // just checks presence, no value required
})
\`\`\`

\`.toHaveProperty(path, value?)\` navigates a dot-separated path directly into a nested object — often clearer than \`expect(response.data.user.name).toBe("Ada")\`, especially useful when only one or two specific nested fields matter out of a much larger response object, without asserting the entire structure via \`toEqual\`.

### Combining asymmetric matchers with expect.any

\`\`\`js
test("expect.any checks TYPE, not a specific value", () => {
  const user = { id: 1, name: "Ada", createdAt: new Date() }

  expect(user).toEqual({
    id: expect.any(Number),
    name: expect.any(String),
    createdAt: expect.any(Date),
  })
})
\`\`\`

\`expect.any(Constructor)\` matches *any* value of the given type — genuinely useful for fields whose exact value is non-deterministic or irrelevant (an auto-generated ID, a \`createdAt\` timestamp) but whose *type* still matters and is worth verifying, letting the rest of a \`toEqual\` check the specific, deterministic fields exactly.

> **Key idea:** \`toHaveLength\`/\`toContain\` cover common array checks directly and readably; \`expect.arrayContaining\`/\`expect.objectContaining\`/\`expect.any\` are asymmetric matchers that can nest inside a larger \`toEqual\`, letting you assert "this shape, with these specific values, except this one field just needs to be *a* Date" — precise where it matters, flexible where it doesn't.`,
    },
    {
      name: "Negation, throw & Custom Messages",
      minutes: 7,
      intro: "Asserting the opposite of a matcher, testing that code throws correctly, and improving failure clarity.",
      content: `### .not: negating any matcher

\`\`\`js
test("not negates any matcher", () => {
  expect(2 + 2).not.toBe(5)
  expect([1, 2, 3]).not.toContain(4)
  expect({ name: "Ada" }).not.toEqual({ name: "Grace" })
})
\`\`\`

Every matcher has a negated form via \`.not\` — genuinely useful for asserting something *shouldn't* happen (a value that shouldn't be present, an array that shouldn't contain a specific removed element after some operation), which is exactly as meaningful a thing to test as asserting something *should* happen.

### toThrow: testing that code throws an error correctly

\`\`\`js
function withdraw(balance, amount) {
  if (amount > balance) {
    throw new Error("Insufficient funds")
  }
  return balance - amount
}

test("throws when amount exceeds balance", () => {
  expect(() => withdraw(100, 500)).toThrow()                          // just checks it threw AT ALL
  expect(() => withdraw(100, 500)).toThrow("Insufficient funds")        // checks the message CONTAINS this
  expect(() => withdraw(100, 500)).toThrow(/insufficient/i)               // checks against a regex
  expect(() => withdraw(100, 500)).toThrow(Error)                          // checks the ERROR TYPE
})
\`\`\`

Recall this platform's JavaScript course's module 10 custom-error-classes lesson — \`.toThrow\` can check that *something* threw, that the message contains specific text (or matches a regex), or that a specific \`Error\` subclass was thrown, all directly. The critical, easy-to-forget detail: **the function must be wrapped in an arrow function** (\`() => withdraw(...)\`, not \`withdraw(100, 500)\` called directly) — \`expect\` needs to invoke it itself, inside a \`try\`/\`catch\`, to actually catch the thrown error; passing an already-evaluated (and already-thrown) call crashes the test file entirely, before the assertion even runs.

### Testing a custom error class specifically

\`\`\`js
class InsufficientFundsError extends Error {
  constructor(message) {
    super(message)
    this.name = "InsufficientFundsError"
  }
}

test("throws the specific custom error type", () => {
  expect(() => withdraw(100, 500)).toThrow(InsufficientFundsError)
})
\`\`\`

This directly extends the JavaScript course's module 10 custom-error hierarchy — verifying the *specific* error class was thrown (not just any error) is meaningfully more precise, and catches a real bug category: code that accidentally throws a generic \`Error\` where a caller expects to \`instanceof\`-check for a specific custom type.

### Custom failure messages with a second argument

\`\`\`js
test("balance never goes negative", () => {
  const result = withdraw(100, 50)
  expect(result >= 0).toBe(true)
  // if this fails: "Expected: true, Received: false" — not very informative on its own
})
\`\`\`

For a boolean assertion like this, Jest's default failure message doesn't show *why* — for genuinely complex conditions where a more specific matcher doesn't exist, writing a small custom helper function (or, more idiomatically, restructuring the assertion to use \`toBeGreaterThanOrEqual\`, from lesson 2) that produces a clearer message is worth the extra effort. In practice, reaching for the most *specific* built-in matcher available (as this whole module has emphasized) solves this far more often than needing genuinely custom messaging.

### Testing multiple related assertions in one test — and when to split them

\`\`\`js
test("withdraw updates balance correctly", () => {
  const result = withdraw(100, 30)
  expect(result).toBe(70)
})

test("withdraw throws for an amount exceeding balance", () => {
  expect(() => withdraw(100, 500)).toThrow("Insufficient funds")
})
\`\`\`

A common, worthwhile convention: **one test, one specific behavior** — rather than combining "returns the right value AND throws under the right condition" into a single test with multiple, loosely related assertions. Splitting them means a failure immediately names the *specific* behavior that broke (via the test name, recall lesson 3's descriptive-naming lesson), rather than requiring you to scroll through a longer test to figure out which of several assertions actually failed.

> **Key idea:** \`.not\` negates any matcher for asserting something shouldn't be true; \`.toThrow\` requires wrapping the call in an arrow function (a common, easy mistake to make) and can check the error's message, pattern, or specific class. Keeping one test focused on one specific behavior — rather than bundling several loosely related assertions together — is what keeps a failure immediately diagnosable from its name alone.`,
    },
  ],
}
