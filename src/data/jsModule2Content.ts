import type { Module } from "../types"

export const jsModule2: Module = {
  id: 2,
  title: "Operators, Coercion & Control Flow",
  status: "upcoming",
  lessons: [
    {
      name: "Arithmetic, Assignment & Comparison Operators",
      minutes: 8,
      intro: "The operators you'll use in nearly every line of JavaScript you write.",
      content: `### Arithmetic operators

\`\`\`js
5 + 3     // 8
5 - 3     // 2
5 * 3     // 15
5 / 3     // 1.6666666666666667 — no integer division in JS
5 % 3     // 2 — remainder
5 ** 3    // 125 — exponentiation (5 to the power of 3)
\`\`\`

Unlike some languages, \`/\` on two numbers always gives a full decimal result — there's no separate integer-division operator, because recall from the previous module, JavaScript has only one \`number\` type.

### Increment, decrement & compound assignment

\`\`\`js
let count = 5
count++          // count is now 6 (post-increment)
count--          // count is now 5 again
count += 10       // count is now 15
count -= 3        // count is now 12
count *= 2         // count is now 24
\`\`\`

\`x++\` and \`++x\` both increment \`x\`, but differ in what the *expression itself* evaluates to — \`x++\` returns the old value then increments, \`++x\` increments then returns the new value. This distinction rarely matters in modern code (most people just use \`x++\` on its own line), but it explains a classic interview-question gotcha:

\`\`\`js
let x = 5
console.log(x++)   // 5 (prints old value, THEN increments)
console.log(x)      // 6
console.log(++x)    // 7 (increments FIRST, then prints)
\`\`\`

### Comparison operators

\`\`\`js
5 > 3     // true
5 < 3     // false
5 >= 5    // true
5 <= 4    // false
\`\`\`

Straightforward for numbers — the interesting (and dangerous) comparison operators, \`==\` and \`===\`, get their own dedicated lesson next, because they're a common source of real bugs.

### Logical operators

\`\`\`js
true && false    // false — AND: both must be true
true || false    // true — OR: at least one true
!true             // false — NOT: flips it
\`\`\`

These don't just work on booleans — the next lesson covers how they actually behave with any value, which is more useful (and more surprising) than it first appears.

### The ternary operator: a compact if/else

\`\`\`js
const age = 20
const status = age >= 18 ? "adult" : "minor"
console.log(status)   // "adult"
\`\`\`

\`condition ? valueIfTrue : valueIfFalse\` — reach for this when you need a simple conditional *expression* (a value), not when you need to run multiple statements — for that, a real \`if\`/\`else\` (covered later this module) is clearer.

### Operator precedence: why 2 + 3 * 4 is 14, not 20

\`\`\`js
2 + 3 * 4        // 14 — multiplication happens first
(2 + 3) * 4       // 20 — parentheses override precedence
\`\`\`

JavaScript follows the same mathematical order of operations you likely already know (multiplication/division before addition/subtraction) — when in doubt, parentheses make the intended order explicit and remove any ambiguity for a reader.

> **Key idea:** most operators behave exactly as you'd expect from math class — the two genuine traps in this list are \`/\` never doing integer division, and \`==\`/\`===\` (next lesson), which look like ordinary comparison operators but hide real complexity.`,
    },
    {
      name: "Type Coercion & == vs ===",
      minutes: 10,
      intro: "JavaScript's habit of silently converting types — and the operator that avoids it entirely.",
      content: `### JavaScript converts types automatically — often silently

\`\`\`js
console.log("5" + 3)      // "53" — number coerced to string, then concatenated
console.log("5" - 3)      // 2 — string coerced to number, then subtracted
console.log("5" * "2")     // 10 — both coerced to numbers
console.log(1 + true)       // 2 — true coerced to 1
console.log("" + null)       // "null"
console.log(1 + {})           // "1[object Object]"
\`\`\`

This is **type coercion**: JavaScript trying to make an operation "work" by converting one or both operands, rather than throwing an error. \`+\` is the trickiest operator here, because it means both addition *and* string concatenation — if either operand is a string, \`+\` concatenates; otherwise it does arithmetic (coercing non-numbers to numbers first).

### == coerces types before comparing; === does not

\`\`\`js
"5" == 5      // true — "5" is coerced to 5, then compared
"5" === 5     // false — different types, no coercion, so not equal

0 == false     // true
0 === false    // false

null == undefined     // true — a special-cased exception
null === undefined     // false

"" == 0        // true — both coerced, then compared
NaN == NaN     // false — NaN is never equal to anything, including itself
\`\`\`

\`==\` (**loose equality**) converts both sides to a common type before comparing, following a set of rules that are genuinely difficult to memorize completely. \`===\` (**strict equality**) never converts anything — if the types differ, the result is simply \`false\`, no exceptions, no surprises.

### The practical rule: always use ===

The near-universal modern guidance is: **always use \`===\` and \`!==\`, never \`==\` or \`!=\`**, unless you have one specific, deliberate reason to use loose equality (checking for either \`null\` or \`undefined\` at once, via \`x == null\`, is the one commonly accepted exception). This single habit eliminates an entire category of confusing bugs before they happen.

### Truthy and falsy: how any value behaves in a condition

\`\`\`js
if ("hello") { }    // truthy — runs
if (0) { }            // falsy — doesn't run
if ("") { }            // falsy — doesn't run
if ([]) { }              // truthy — an empty array IS truthy!
if ({}) { }                // truthy — an empty object IS truthy!
\`\`\`

There are exactly **eight falsy values** in JavaScript — everything else is truthy:

\`\`\`
false, 0, -0, 0n, "", null, undefined, NaN
\`\`\`

This trips people up constantly: an empty array \`[]\` and an empty object \`{}\` are both **truthy**, despite "feeling empty" — only the eight values listed above are falsy. This is why \`if (someArray.length)\` is the correct way to check for an empty array, not \`if (someArray)\`.

### && and || return a value, not just true/false

\`\`\`js
const name = userInput || "Anonymous"    // fallback if userInput is falsy
const result = isLoggedIn && renderDashboard()   // only calls renderDashboard if isLoggedIn is truthy
\`\`\`

A subtlety worth knowing: \`&&\` and \`||\` don't actually return \`true\`/\`false\` — they return one of their *actual operands*. \`||\` returns the first truthy operand (or the last one, if none are truthy); \`&&\` returns the first falsy operand (or the last one, if all are truthy). This is exactly what makes the \`someValue || "default"\` fallback pattern above work.

### The safer default-value operator: ??

\`\`\`js
const count = 0
console.log(count || 10)     // 10 — WRONG if 0 is a legitimate value!
console.log(count ?? 10)      // 0 — correct: only falls back for null/undefined
\`\`\`

\`??\` (the **nullish coalescing operator**) only falls back when the left side is specifically \`null\` or \`undefined\` — not for other falsy values like \`0\` or \`""\`. This fixes a real, common bug with \`||\`-based defaults: if \`0\` or an empty string is a genuinely valid value, \`||\` would incorrectly discard it.

> **Key idea:** \`==\` coerces types before comparing and should be avoided; \`===\` never does and should be your default. Only eight values are falsy — everything else, including \`[]\` and \`{}\`, is truthy. Prefer \`??\` over \`||\` for default values when \`0\`/\`""\`/\`false\` are legitimate inputs, not just placeholder absence.`,
    },
    {
      name: "Conditionals: if, else & switch",
      minutes: 8,
      intro: "Branching logic — running different code depending on a condition.",
      content: `### if / else if / else

\`\`\`js
const score = 75

if (score >= 90) {
  console.log("A")
} else if (score >= 80) {
  console.log("B")
} else if (score >= 70) {
  console.log("C")
} else {
  console.log("F")
}
// prints "C"
\`\`\`

Conditions are checked top to bottom; the first one that's truthy runs, and the rest are skipped entirely — even if a later condition would also have been true. Order matters: this is why the checks go from highest threshold to lowest.

### The condition is coerced to a boolean

\`\`\`js
const items = []

if (items) {
  console.log("This runs — items is a truthy empty array!")
}

if (items.length) {
  console.log("This does NOT run — 0 is falsy")
}
\`\`\`

Recall from the previous lesson: \`if\` doesn't require an actual boolean — it coerces whatever's inside the parentheses to truthy/falsy. This is exactly why checking \`if (array)\` to test for emptiness is a bug — you need \`if (array.length)\` instead.

### switch: matching one value against several cases

\`\`\`js
const day = "Tuesday"

switch (day) {
  case "Monday":
    console.log("Start of the week")
    break
  case "Tuesday":
  case "Wednesday":
  case "Thursday":
    console.log("Midweek")
    break
  case "Friday":
    console.log("Almost the weekend")
    break
  default:
    console.log("Weekend")
}
// prints "Midweek"
\`\`\`

\`switch\` compares the value using strict equality (\`===\`) against each \`case\`. Stacking cases with no code between them (like \`Tuesday\`/\`Wednesday\`/\`Thursday\` above) makes them share the same block — a common, intentional pattern for grouping related cases.

### The break gotcha: fall-through

\`\`\`js
switch (day) {
  case "Monday":
    console.log("Start of the week")
    // no break here!
  case "Tuesday":
    console.log("Midweek")
    break
  default:
    console.log("Other")
}
// if day is "Monday", THIS PRINTS BOTH LINES — a bug!
\`\`\`

Forgetting \`break\` is a classic, easy-to-miss bug: without it, execution **falls through** to the next case's code regardless of whether that case actually matched. Every \`case\` needs an explicit \`break\` (or a \`return\`, if inside a function) unless you specifically intend fall-through — always double-check this when writing a \`switch\`.

### When to reach for switch vs if/else

\`switch\` reads more clearly than a long \`if\`/\`else if\` chain specifically when you're comparing **one single value** against many possible exact matches. For range checks (like the grading example above) or conditions involving multiple different variables, \`if\`/\`else\` is the right tool — \`switch\` can't naturally express "is this value greater than 90."

> **Key idea:** \`if\`/\`else\` branches on any truthy/falsy condition and handles ranges naturally; \`switch\` compares one value against multiple exact matches using \`===\`, but requires an explicit \`break\` in every case to avoid the classic fall-through bug.`,
    },
    {
      name: "Loops: for, while & the rest",
      minutes: 9,
      intro: "Repeating code — the handful of loop constructs JavaScript gives you, and when to reach for each.",
      content: `### The classic for loop

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log(i)
}
// prints 0, 1, 2, 3, 4
\`\`\`

Three parts, separated by semicolons: an initializer (\`let i = 0\`, runs once), a condition (\`i < 5\`, checked before every iteration), and an increment (\`i++\`, runs after every iteration). Use a \`for\` loop when you know you need to count through a range, or need direct access to an index.

### while and do...while

\`\`\`js
let count = 0
while (count < 3) {
  console.log(count)
  count++
}
// prints 0, 1, 2
\`\`\`

\`\`\`js
let n = 0
do {
  console.log(n)
  n++
} while (n < 3)
// prints 0, 1, 2 — same result here, but...

let x = 10
do {
  console.log("runs once even though the condition is false")
} while (x < 5)
\`\`\`

\`while\` checks its condition **before** each iteration — if it's false immediately, the body never runs at all. \`do...while\` checks **after** — so the body always runs at least once, even if the condition was false from the start. This is the one meaningful difference, and it's why \`do...while\` is comparatively rare — it's only the right choice when you specifically need "run once, then keep going while true."

### for...of: iterating over values

\`\`\`js
const fruits = ["apple", "banana", "cherry"]

for (const fruit of fruits) {
  console.log(fruit)
}
// prints "apple", "banana", "cherry"
\`\`\`

\`for...of\` iterates directly over the **values** of anything iterable — arrays, strings, Maps, Sets (iterables are covered formally in a later module). This is the clearest, most common way to loop over an array's contents when you don't need the index.

### for...in: iterating over keys — and why it's usually the wrong tool

\`\`\`js
const person = { name: "Ada", age: 30 }

for (const key in person) {
  console.log(key, person[key])
}
// prints "name Ada", "age 30"
\`\`\`

\`for...in\` iterates over an object's **enumerable property keys** — useful for plain objects. But using \`for...in\` on an *array* is a well-known anti-pattern: it iterates over indices as strings (\`"0"\`, \`"1"\`, ...), can pick up inherited properties unexpectedly, and doesn't guarantee order the way \`for...of\` does. **Use \`for...of\` for arrays, \`for...in\` (or better, \`Object.keys\`/\`Object.entries\`, covered in module 5) for plain objects.**

### break and continue

\`\`\`js
for (let i = 0; i < 10; i++) {
  if (i === 5) break        // exits the loop entirely
  if (i % 2 === 0) continue  // skips to the next iteration
  console.log(i)
}
// prints 1, 3
\`\`\`

\`break\` exits the loop immediately, skipping any remaining iterations. \`continue\` skips just the *rest of the current iteration*, moving straight to the next one — the loop keeps going.

### Choosing the right loop

| Situation | Reach for |
|---|---|
| Need an index, or counting through a range | \`for\` |
| Looping over an array's/iterable's values | \`for...of\` |
| Looping over a plain object's keys | \`for...in\`, or \`Object.entries\` |
| Repeat until some condition changes, unknown iteration count | \`while\` |
| Must run at least once regardless of the condition | \`do...while\` |

> **Key idea:** \`for...of\` is the right default for arrays and other iterables; \`for...in\` is for plain object keys and is a genuine anti-pattern on arrays. \`while\` checks its condition before running; \`do...while\` checks after, guaranteeing at least one run.`,
    },
  ],
}
