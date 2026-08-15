import type { Module } from "../types"

export const jsModule1: Module = {
  id: 1,
  title: "Fundamentals & How JavaScript Runs",
  status: "in_progress",
  lessons: [
    {
      name: "What is JavaScript, Really?",
      minutes: 8,
      intro: "The language, the engine that runs it, and why it behaves the way it does.",
      content: `### JavaScript is a language — an engine runs it

JavaScript itself is just a specification (called **ECMAScript**) — a written description of syntax and behavior. It doesn't run on its own. A **JavaScript engine** is the actual program that reads your code and executes it. The most common one is **V8**, built by Google, which powers Chrome, Node.js, and Deno. Firefox uses SpiderMonkey; Safari uses JavaScriptCore. Different engines, same language spec — this is why JavaScript behaves (almost) identically everywhere, but performance and some edge-case timing can differ between them.

### Two places JavaScript runs

\`\`\`
Browser (V8 + Web APIs: DOM, fetch, setTimeout, ...)
Node.js (V8 + Node APIs: fs, http, process, ...)
\`\`\`

The *language* — variables, functions, objects, loops — is identical in both. What differs is the surrounding environment: a browser gives you \`document\` and \`window\` to manipulate a web page; Node.js gives you \`fs\` to read files and no \`document\` at all, since there's no page. This course focuses on the language itself — the part that's the same everywhere.

### Interpreted, then compiled — not one or the other

A common oversimplification is "JavaScript is interpreted, not compiled." In reality, modern engines like V8 do both: code is initially interpreted for a fast start, and any code that runs repeatedly (a "hot" function called many times) gets compiled down to optimized machine code on the fly — a technique called **JIT (Just-In-Time) compilation**. This is worth knowing because it explains real behavior: the first few runs of a function can be measurably slower than later ones, once the engine has optimized it.

### Single-threaded, with help

JavaScript itself runs on a **single thread** — one line of code executes at a time, never truly in parallel within your JS code. This single fact explains an enormous amount of JavaScript's behavior, and it's why an entire later module in this course (the event loop) exists — the language needed a clever mechanism to handle waiting on slow things (network requests, timers) without simply freezing while it waits. That mechanism, not multithreading, is how JavaScript achieves the appearance of doing many things "at once."

### Where your code actually goes

\`\`\`
your .js file -> parsed into an AST (Abstract Syntax Tree) -> compiled/interpreted -> executed
\`\`\`

You don't need to write a parser or understand AST internals to use JavaScript well — but knowing this pipeline exists demystifies error messages like \`SyntaxError\`, which happen at the *parsing* stage, before your code has even started running (unlike a \`TypeError\`, which happens during execution).

> **Key idea:** JavaScript is a specification; an engine (V8, SpiderMonkey, etc.) is what actually runs it, using a mix of interpretation and JIT compilation, on a single thread — nearly everything unusual about how JS behaves traces back to one of these three facts.`,
    },
    {
      name: "Setting Up & Running Your First Code",
      minutes: 7,
      intro: "Three ways to run JavaScript, and the tools you'll actually use day to day.",
      content: `### Running JavaScript in a browser console

Open any browser, press F12 (or Cmd+Option+I on Mac) to open DevTools, click the **Console** tab, and type:

\`\`\`js
console.log("Hello, World!")
\`\`\`

Press Enter — it runs immediately. The console is the fastest way to try a small snippet of JavaScript with zero setup, and it's where you'll spend a lot of time experimenting and debugging throughout this course.

### Running JavaScript with Node.js

\`\`\`bash
node --version
\`\`\`

[Node.js](https://nodejs.org) lets you run JavaScript outside a browser — directly from the command line. Once installed:

\`\`\`bash
node
> console.log("Hello from Node!")
\`\`\`

Running \`node\` with no arguments drops you into a **REPL** (Read-Eval-Print Loop) — type an expression, see the result immediately, exactly like the browser console but in your terminal.

### Running a JavaScript file

\`\`\`js
// hello.js
console.log("Hello, World!")
console.log(2 + 2)
\`\`\`

\`\`\`bash
node hello.js
\`\`\`

For anything beyond a one-line experiment, write code in a \`.js\` file and run it with \`node filename.js\` — this is how you'll run every real example in this course.

### console.log: your primary tool for seeing what's happening

\`\`\`js
console.log("a string")
console.log(42)
console.log(true)
console.log([1, 2, 3])
console.log({ name: "Ada", age: 30 })
\`\`\`

\`console.log\` prints a value so you can inspect it — it's the single most-used debugging tool in JavaScript, used constantly throughout this course to show what a piece of code actually produces. Other useful variants: \`console.error\` (prints in red, for errors), \`console.warn\` (yellow, for warnings), and \`console.table\` (renders an array of objects as an actual table).

### A note on this course's code examples

Every code example in this course can be run exactly as written, either pasted into a browser console or saved to a \`.js\` file and run with \`node\`. Actually running the examples — not just reading them — is the single biggest thing that separates understanding JavaScript from just recognizing its syntax.

> **Key idea:** the browser console and \`node\` (both the REPL and running \`.js\` files) are the two places you'll run every example in this course — \`console.log\` is how you'll see what any piece of code actually does, and you should be running these examples yourself, not just reading them.`,
    },
    {
      name: "Variables: var, let & const",
      minutes: 10,
      intro: "Three ways to declare a variable, and why two of them exist to fix the third.",
      content: `### Declaring a variable

\`\`\`js
let score = 10
score = 15          // OK — let allows reassignment

const name = "Ada"
// name = "Bob"     // TypeError: Assignment to constant variable

var oldStyle = "legacy"
\`\`\`

- **\`let\`** — a variable that can be reassigned. The modern default when a value needs to change.
- **\`const\`** — a variable that **cannot be reassigned** after its initial value. The modern default for everything else — prefer it unless you know the value needs to change.
- **\`var\`** — the original way to declare a variable, from JavaScript's earliest days. Still valid, but has quirks (covered next) that make it the wrong choice in modern code.

### const doesn't mean "immutable" — it means "can't be reassigned"

\`\`\`js
const person = { name: "Ada" }
person.name = "Grace"     // totally fine — we're not reassigning \`person\` itself
console.log(person.name)  // "Grace"

const numbers = [1, 2, 3]
numbers.push(4)             // also fine — mutating the array, not reassigning it
console.log(numbers)        // [1, 2, 3, 4]

// person = {}              // TypeError — THIS would be reassignment
\`\`\`

This trips up nearly everyone at first: \`const\` locks the *binding* (the variable name pointing to a value), not the *contents* of an object or array. You can freely mutate an object's properties or an array's contents through a \`const\` variable — you just can't point that variable at a completely different value afterward.

### var's real problem: it ignores block scope

\`\`\`js
if (true) {
  var x = 1
  let y = 2
}
console.log(x)   // 1 — leaked outside the if block!
console.log(y)   // ReferenceError: y is not defined — correctly stayed inside the block
\`\`\`

A variable declared with \`var\` inside a block (\`{ }\` — an \`if\`, a \`for\` loop, anywhere) leaks out to the nearest enclosing *function* (or the global scope, if there's no enclosing function) — the block itself does nothing to contain it. \`let\`/\`const\` respect the block they're declared in, which matches how nearly every other modern language behaves, and is almost always what you actually want.

### The classic var-in-a-loop bug

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// prints: 3, 3, 3 — NOT 0, 1, 2!

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0)
}
// prints: 0, 1, 2 — as expected
\`\`\`

This is a genuinely famous JavaScript gotcha, and it's a direct consequence of \`var\` ignoring block scope: all three \`setTimeout\` callbacks share the *same single* \`i\`, which has finished looping (and equals 3) by the time any of them actually run. \`let\` creates a **fresh binding for every loop iteration**, so each callback captures its own separate \`j\`. This example will make complete sense once you've covered closures and the event loop later in this course — for now, just recognize it as the canonical reason \`let\` replaced \`var\` for loop counters.

### The practical rule

Default to \`const\`. Use \`let\` only when you know the variable needs to be reassigned (a loop counter, an accumulator). Avoid \`var\` entirely in new code — it exists today only for reading older codebases.

> **Key idea:** \`const\` prevents reassignment, not mutation; \`let\`/\`const\` are block-scoped (contained to the \`{ }\` they're declared in), while \`var\` is function-scoped and leaks out of blocks — the source of several classic JavaScript bugs, including the famous var-in-a-loop-with-setTimeout gotcha.`,
    },
    {
      name: "Primitive Types & typeof",
      minutes: 9,
      intro: "The seven basic kinds of value every piece of JavaScript data is built from.",
      content: `### The seven primitive types

\`\`\`js
typeof "hello"        // "string"
typeof 42              // "number"
typeof 42n             // "bigint"
typeof true             // "boolean"
typeof undefined         // "undefined"
typeof Symbol("id")       // "symbol"
typeof null                // "object" — a famous, long-standing bug (see below)
\`\`\`

Every value in JavaScript is either a **primitive** (one of these seven kinds) or an **object** (covered in depth in module 5). Primitives are the atoms everything else is built from.

### number: there's only one numeric type

\`\`\`js
let a = 42
let b = 3.14
let c = -7
let d = 1e6           // 1,000,000 — scientific notation
\`\`\`

Unlike many languages, JavaScript has **no separate integer type** — \`42\` and \`3.14\` are both just \`number\`, stored as 64-bit floating point. This has real consequences, covered in the next module, around precision with decimal math.

### string: always immutable

\`\`\`js
let greeting = "Hello"
let name = 'Ada'
let template = \`Hi, \${name}!\`   // template literal — allows embedded expressions

greeting[0] = "J"        // silently does nothing — strings can't be mutated
console.log(greeting)    // still "Hello"
\`\`\`

All three quote styles create the same type of value. Template literals (backticks) are the only one that supports \`\${...}\` interpolation and multi-line strings without special escape characters. Strings are **immutable** — no operation ever changes a string in place; string methods like \`.toUpperCase()\` always return a *new* string.

### undefined vs null: two different flavors of "nothing"

\`\`\`js
let notYetSet
console.log(notYetSet)          // undefined — a variable declared but never assigned

let deliberatelyEmpty = null
console.log(deliberatelyEmpty)   // null — a value explicitly set to "nothing"
\`\`\`

\`undefined\` is what JavaScript gives you automatically when something doesn't have a value yet (an unassigned variable, a missing object property, a function with no \`return\`). \`null\` is a value a programmer sets deliberately to represent "intentionally empty." Both represent absence, but the distinction — automatic vs. deliberate — matters for reading other people's code and for one specific bug worth knowing: \`typeof null\` returns \`"object"\`, a mistake baked into JavaScript since 1995 that can never be fixed without breaking the web, so you just have to remember it.

### boolean: only two values, but many things convert to them

\`\`\`js
typeof true    // "boolean"
typeof false    // "boolean"
\`\`\`

Only \`true\` and \`false\` are actually booleans — but as the next module covers, JavaScript will happily treat almost any value as "truthy" or "falsy" in a condition, without it actually being a boolean.

### bigint and symbol: the two you'll rarely need

\`\`\`js
const huge = 9007199254740993n   // the trailing n makes it a BigInt
const id = Symbol("unique id")    // a guaranteed-unique value
\`\`\`

\`BigInt\` handles integers larger than \`number\` can represent precisely; \`Symbol\` creates a value guaranteed unique even from another \`Symbol\` with the identical description — used for special object keys, covered later in this course. Both exist for narrow, specific use cases — you won't reach for either often as a beginner.

> **Key idea:** seven primitive types exist — \`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`symbol\`, and (despite \`typeof null\` lying about it) \`null\` — everything else in JavaScript is an object, built from these atoms.`,
    },
  ],
}
