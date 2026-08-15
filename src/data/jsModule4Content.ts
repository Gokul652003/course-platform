import type { Module } from "../types"

export const jsModule4: Module = {
  id: 4,
  title: "Scope, Hoisting & Closures",
  status: "upcoming",
  lessons: [
    {
      name: "Execution Context & the Scope Chain",
      minutes: 9,
      intro: "What actually happens when JavaScript runs a function — the mechanism behind variable lookup.",
      content: `### Every function call creates an execution context

\`\`\`js
function outer() {
  const a = 1
  function inner() {
    const b = 2
    console.log(a + b)   // 3 — inner can "see" a, even though a belongs to outer
  }
  inner()
}
outer()
\`\`\`

Every time a function is called, the engine creates a new **execution context** — a fresh space holding that call's local variables, its arguments, and a reference to *where it was defined* (not where it was called from — an important distinction covered next). \`inner\`'s execution context includes a link back to \`outer\`'s, which is why \`inner\` can read \`a\`.

### The scope chain: how variable lookup actually works

\`\`\`js
const globalVar = "global"

function outer() {
  const outerVar = "outer"

  function inner() {
    const innerVar = "inner"
    console.log(innerVar)    // found immediately, in inner's own scope
    console.log(outerVar)    // not found locally, so look up one level -> found in outer's scope
    console.log(globalVar)    // not found in inner or outer, so look up again -> found in global scope
  }

  inner()
}

outer()
\`\`\`

When code references a variable, the engine searches the **current scope first**, and if not found, walks *outward* through each enclosing scope, one level at a time, until it either finds the variable or reaches the global scope and gives up (throwing a \`ReferenceError\`). This outward chain of scopes is called the **scope chain**, and it's determined entirely by **where a function is physically written in the code** — not by which function called it.

### Lexical scope: determined by where you write code, not how it runs

\`\`\`js
function a() {
  const x = "from a"
  b()
}

function b() {
  console.log(x)   // ReferenceError: x is not defined
}

a()
\`\`\`

This is a genuinely important idea, worth sitting with: even though \`a\` calls \`b\`, \`b\` does **not** get access to \`a\`'s variables — \`b\` was defined at the top level, alongside \`a\`, not physically *inside* it. JavaScript uses **lexical scoping**: a function's available variables are fixed by where it's *written* in the source code, permanently, regardless of who calls it or from where. This is what makes reading code to determine what's in scope reliable — you never have to trace *runtime* call chains to know what a function can see, only its *written* nesting.

### Block scope vs function scope, revisited

\`\`\`js
function example() {
  if (true) {
    let blockScoped = "only visible in this block"
    var functionScoped = "visible throughout the whole function"
  }
  // console.log(blockScoped)     // ReferenceError
  console.log(functionScoped)      // "visible throughout the whole function" — works
}
\`\`\`

Recall from module 1: \`let\`/\`const\` create a new scope at every \`{ }\` block; \`var\` only respects function boundaries. This lesson's scope-chain model applies to both — the only difference is *which* boundaries count as a new scope level.

> **Key idea:** every function call gets its own execution context, linked to the scope where it was *written* (not where it's called from) — variable lookup walks outward through this chain of scopes until it finds a match or runs out. This single mechanism, called lexical scoping, is what the next lesson's closures are built entirely on top of.`,
    },
    {
      name: "Hoisting & the Temporal Dead Zone",
      minutes: 9,
      intro: "Why some code works before it's declared, and why other code throws an error instead.",
      content: `### var and function declarations are hoisted

\`\`\`js
console.log(hoistedVar)   // undefined — NOT a ReferenceError!
var hoistedVar = "value"

sayHi()                     // "Hi!" — works even though called before the declaration
function sayHi() {
  console.log("Hi!")
}
\`\`\`

**Hoisting** describes how the engine processes a scope in two passes: first, it scans for all \`var\` and function declarations and sets them up *before* running any code line by line; only then does it actually execute the code top to bottom. This is why \`sayHi()\` works even called above its own definition — by the time execution starts, the entire function is already fully set up.

\`var\`, specifically, is hoisted but only its **declaration**, not its assigned value — which is why \`hoistedVar\` is \`undefined\` (not an error) when read before its assignment line: the variable exists from the start of its scope, just without a value yet.

### let and const are hoisted too — but stay in the "temporal dead zone"

\`\`\`js
console.log(notYetInitialized)   // ReferenceError: Cannot access before initialization
let notYetInitialized = "value"
\`\`\`

This surprises people: \`let\`/\`const\` **are** technically hoisted (the engine knows they exist from the start of the scope) — but unlike \`var\`, they remain in an inaccessible state called the **Temporal Dead Zone (TDZ)** from the start of the scope until the actual declaration line executes. Accessing them during that window throws a \`ReferenceError\`, rather than silently returning \`undefined\`.

This is a deliberate, genuinely useful safety net — it turns a whole category of "used a variable before I meant to" bugs into an immediate, loud error instead of a silent \`undefined\` that might not surface until much later.

### Function declarations vs function expressions — a different story

\`\`\`js
sayHi()             // works — "Hi!"
function sayHi() {
  console.log("Hi!")
}

sayBye()             // TypeError: sayBye is not a function
var sayBye = function () {
  console.log("Bye!")
}
\`\`\`

Only a **function declaration** (\`function name() {}\`) is fully hoisted, body and all. A function *expression* assigned to a \`var\` — recall module 3's distinction — only hoists the \`var\` declaration itself (as \`undefined\`), not the function assigned to it. Calling it too early doesn't throw the TDZ error \`let\`/\`const\` would; instead it fails because you're trying to *call* \`undefined\`, which isn't a function.

### Class declarations are hoisted into the TDZ too

\`\`\`js
const p = new Person()   // ReferenceError — classes are hoisted, but stay in the TDZ
class Person {}
\`\`\`

Worth knowing ahead of module 7's class coverage: classes behave like \`let\`/\`const\` here, not like function declarations — they exist in the TDZ until their definition actually runs.

### The practical takeaway

\`\`\`js
// Good practice: declare before use, regardless of what hoisting technically allows
const value = "hi"
console.log(value)
\`\`\`

None of this is a reason to deliberately rely on hoisting — relying on a function or variable working before its declaration line makes code harder to read top-to-bottom. Understanding hoisting is really about correctly diagnosing *why* a particular \`ReferenceError\` or \`undefined\` shows up, not a technique to lean on while writing new code.

> **Key idea:** \`var\` and function declarations are fully hoisted and usable before their line; \`let\`/\`const\`/classes are hoisted too, but sit in an inaccessible Temporal Dead Zone until their declaration line runs, throwing a clear error instead of silently returning \`undefined\` — a real safety improvement over \`var\`'s older behavior.`,
    },
    {
      name: "Closures",
      minutes: 10,
      intro: "The mechanism that lets a function remember variables from a scope that has already finished running.",
      content: `### The core example

\`\`\`js
function makeCounter() {
  let count = 0
  return function () {
    count++
    return count
  }
}

const counter = makeCounter()
console.log(counter())   // 1
console.log(counter())    // 2
console.log(counter())     // 3
\`\`\`

By the time \`counter()\` is called the first time, \`makeCounter()\` has already **finished executing** and returned. And yet, the inner function still has full access to \`count\` — reading and updating it, with the update persisting across calls. This is a **closure**: a function permanently retains access to the variables from the scope it was defined in, even after that outer scope has finished running.

### Why this actually works: it's the scope chain, made persistent

Recall the previous two lessons: a function's scope chain is fixed by where it was *written*, not by when its outer function finishes. Normally, a function's local variables are discarded once it returns — but if an *inner* function defined inside it is returned (or otherwise escapes, e.g. stored somewhere, or used as a callback), the engine keeps those outer variables alive for as long as the inner function might still need them. This isn't magic — it's a direct, logical consequence of lexical scoping combined with the fact that functions are values that can outlive their creating call.

### Each call creates an independent closure

\`\`\`js
const counterA = makeCounter()
const counterB = makeCounter()

console.log(counterA())   // 1
console.log(counterA())    // 2
console.log(counterB())     // 1 — a completely separate \`count\`, unaffected by counterA
\`\`\`

Every call to \`makeCounter()\` creates a **fresh** \`count\` variable and a fresh closure over it — \`counterA\` and \`counterB\` don't share any state, even though they came from the exact same function.

### A genuinely practical use: data privacy

\`\`\`js
function createBankAccount(initialBalance) {
  let balance = initialBalance   // NOT accessible from outside — no direct reference exists

  return {
    deposit(amount) {
      balance += amount
      return balance
    },
    withdraw(amount) {
      if (amount > balance) {
        console.log("Insufficient funds")
        return balance
      }
      balance -= amount
      return balance
    },
    getBalance() {
      return balance
    },
  }
}

const account = createBankAccount(100)
console.log(account.deposit(50))    // 150
console.log(account.withdraw(30))    // 120
console.log(account.balance)          // undefined — there's no direct property at all
\`\`\`

This is a genuinely important, common pattern: \`balance\` is completely inaccessible from outside \`createBankAccount\` — there's no way to reach in and set it directly, bypassing the \`deposit\`/\`withdraw\` logic. The only way to interact with it is through the functions that closed over it. This is how JavaScript achieved private state *before* the class private-fields syntax (covered in module 7) existed — and it's still a common, valid pattern today.

### Revisiting the var-in-a-loop bug from module 1, now fully explained

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 3, 3, 3 — every closure shares the SAME i (var is function-scoped, not per-iteration)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0)
}
// 0, 1, 2 — let creates a NEW binding each iteration, so each closure captures its own j
\`\`\`

This example was flagged as "will make sense later" back in module 1 — this is that moment. Each arrow function passed to \`setTimeout\` is a closure over its loop variable. With \`var\`, there's only ever one \`i\` (function-scoped, shared across every iteration), so all three closures see whatever \`i\` ends up being after the loop finishes: \`3\`. With \`let\`, the language creates a **distinct binding of \`j\` for every single iteration** — each closure captures its own separate copy, correctly frozen at the value it had during that iteration.

> **Key idea:** a closure is a function that retains access to its defining scope's variables even after that scope has finished executing — a direct, logical result of lexical scoping. This single mechanism explains private-state patterns, why \`let\` fixed the classic loop-callback bug, and is the foundation the module pattern (next lesson) is built on.`,
    },
    {
      name: "IIFEs & the Module Pattern",
      minutes: 7,
      intro: "Using closures deliberately to create private scope — a pattern that predates ES modules.",
      content: `### The Immediately Invoked Function Expression (IIFE)

\`\`\`js
(function () {
  console.log("This runs immediately, once, and its scope disappears afterward")
})()
\`\`\`

An **IIFE** is a function expression that's defined and called in the same statement — wrapping it in parentheses turns what would otherwise be a (syntactically invalid, on its own) function declaration into an expression, which can then be immediately invoked with a trailing \`()\`.

### Why you'd want a function that runs once and disappears

\`\`\`js
// without an IIFE — pollutes the surrounding scope
var total = 0
for (var i = 0; i < 10; i++) total += i
console.log(total)

// with an IIFE — total and i never leak outside
(function () {
  var total = 0
  for (var i = 0; i < 10; i++) total += i
  console.log(total)
})()

console.log(typeof total)   // "undefined" — safely contained
\`\`\`

Before \`let\`/\`const\`'s block scoping existed, \`var\`'s function-scoping (from module 1) meant an IIFE was the *only* reliable way to create a private, throwaway scope that didn't leak variables into the surrounding code — a real, common problem in older JavaScript, where every script on a page shared one single global scope.

### The module pattern: an IIFE that closes over private state and returns a public interface

\`\`\`js
const counterModule = (function () {
  let count = 0   // private — no way to reach this from outside

  function increment() {
    count++
    return count
  }

  function reset() {
    count = 0
  }

  return { increment, reset }   // only these two are exposed
})()

console.log(counterModule.increment())   // 1
console.log(counterModule.increment())    // 2
counterModule.reset()
console.log(counterModule.increment())     // 1
console.log(counterModule.count)             // undefined — count itself was never exposed
\`\`\`

This combines the IIFE's private scope with the closure pattern from the previous lesson: the returned object's methods **close over** \`count\`, keeping access to it permanently, while the surrounding code has no way to reach \`count\` directly at all. This exact pattern — called the **module pattern** — was the standard way to organize and encapsulate JavaScript code for years, before real ES modules (\`import\`/\`export\`, covered in module 11) existed.

### Is this pattern still relevant today?

For organizing code across *files*, ES modules have fully replaced this pattern — reach for real \`import\`/\`export\` for that. But the underlying technique — an IIFE (or any function) closing over private state and returning a controlled public interface — remains a genuinely useful pattern *within* a single file or scope, whenever you want to guarantee some state simply cannot be reached or mutated except through the specific functions you've deliberately exposed.

> **Key idea:** an IIFE runs once immediately and creates a throwaway private scope; combined with closures, it produces the module pattern — private state, with only a deliberate, controlled interface exposed. ES modules have replaced this for organizing code across files, but the closure-based privacy technique itself remains useful within a single scope.`,
    },
  ],
}
