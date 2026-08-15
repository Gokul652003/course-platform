import type { Module } from "../types"

export const jsModule3: Module = {
  id: 3,
  title: "Functions Deep Dive",
  status: "upcoming",
  lessons: [
    {
      name: "Declarations, Expressions & Arrow Functions",
      minutes: 9,
      intro: "Three syntaxes for creating a function, and the real differences between them.",
      content: `### Function declaration

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet("Ada"))   // "Hello, Ada!"
\`\`\`

The classic \`function\` keyword syntax, with a name. Its defining trait, covered in depth next module: it's **hoisted** — fully usable even *before* the line it's defined on, elsewhere in the same scope.

### Function expression

\`\`\`js
const greet = function (name) {
  return \`Hello, \${name}!\`
}

console.log(greet("Ada"))   // "Hello, Ada!"
\`\`\`

A function assigned to a variable, as a value. Unlike a declaration, a function expression is **not** usable before the line it's defined on — the variable follows the normal \`let\`/\`const\` rules covered in the previous module.

### Arrow functions

\`\`\`js
const greet = (name) => {
  return \`Hello, \${name}!\`
}

// implicit return: no braces, no \`return\` keyword, for a single expression
const greetShort = (name) => \`Hello, \${name}!\`

// single parameter: parentheses are optional
const double = x => x * 2

// no parameters: empty parentheses required
const sayHi = () => "Hi!"

console.log(greetShort("Ada"))   // "Hello, Ada!"
console.log(double(5))            // 10
\`\`\`

The most compact syntax, introduced in ES6 (2015). When the body is a single expression, omitting the braces makes that expression the **implicit return value** — no \`return\` keyword needed. This is extremely common for short, inline functions (especially ones passed to array methods, covered in module 6).

### Arrow functions are not just shorter syntax — they behave differently

Arrow functions deliberately **do not have their own \`this\`** — they inherit \`this\` from the surrounding scope where they're defined, rather than from how they're called. This is a genuinely important behavioral difference, not just a style choice, and it gets a full, dedicated explanation in module 7 once \`this\` itself has been properly introduced. For now, just know: arrow functions and regular functions are not fully interchangeable — the choice sometimes matters for correctness, not just brevity.

### Named vs anonymous function expressions

\`\`\`js
const greet = function sayHello(name) {   // "sayHello" is a named function expression
  return \`Hello, \${name}!\`
}

const greet2 = function (name) {           // anonymous — no name at all
  return \`Hello, \${name}!\`
}
\`\`\`

A named function expression's name is useful in stack traces (error messages showing exactly which function failed) and for the function to reference itself recursively — but it's only accessible from *inside* its own body, not from the outer scope (which still only has \`greet\`, not \`sayHello\`).

### Choosing between them

| | Hoisted? | Has own \`this\`? | Typical use |
|---|---|---|---|
| Function declaration | Yes | Yes | Named, reusable functions defined at the top level |
| Function expression | No | Yes | When you need a function as a value (assigned conditionally, etc.) |
| Arrow function | No | No — inherits from enclosing scope | Short callbacks, and anywhere you specifically want \`this\` to NOT change |

> **Key idea:** all three syntaxes create a callable function, but they differ in real, sometimes load-bearing ways — hoisting (declarations only) and \`this\` binding (arrow functions only) — not just in how many characters they take to type.`,
    },
    {
      name: "Parameters, Defaults & Rest",
      minutes: 8,
      intro: "Flexible ways to accept input into a function — defaults, gathering the rest, and destructured params.",
      content: `### Default parameters

\`\`\`js
function greet(name = "friend") {
  return \`Hello, \${name}!\`
}

console.log(greet("Ada"))   // "Hello, Ada!"
console.log(greet())         // "Hello, friend!" — no argument passed
console.log(greet(undefined)) // "Hello, friend!" — undefined ALSO triggers the default
\`\`\`

A default only kicks in when the argument is missing entirely, or explicitly \`undefined\` — passing \`null\`, \`0\`, or \`""\` does **not** trigger the default, since those are legitimate values, not "absent."

\`\`\`js
console.log(greet(null))   // "Hello, null!" — null does NOT trigger the default
\`\`\`

### Rest parameters: gathering any number of extra arguments

\`\`\`js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0)
}

console.log(sum(1, 2, 3))       // 6
console.log(sum(1, 2, 3, 4, 5))  // 15
console.log(sum())                 // 0
\`\`\`

The \`...\` (rest syntax) before the last parameter collects **any number** of remaining arguments into a real array. This is how you write a function that accepts a variable number of arguments — \`numbers\` is a genuine array, with all array methods available (\`.reduce\` is covered fully in module 6).

### The old way: the arguments object (function declarations/expressions only)

\`\`\`js
function oldSum() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i]
  }
  return total
}
\`\`\`

Before rest parameters existed, functions used the built-in \`arguments\` object — array-*like*, but not a real array (no \`.map\`, \`.reduce\`, etc., without first converting it). Worth recognizing when reading older code, but rest parameters are strictly better and are what you should write today. Notably, **arrow functions don't have their own \`arguments\` object at all** — another real behavioral difference from the previous lesson.

### Destructuring parameters directly

\`\`\`js
function printUser({ name, age }) {
  console.log(\`\${name} is \${age} years old\`)
}

printUser({ name: "Ada", age: 30 })   // "Ada is 30 years old"
\`\`\`

Rather than accepting a whole object and reaching into it (\`user.name\`, \`user.age\`) inside the function body, destructuring pulls the needed properties directly out in the parameter list. This is an extremely common pattern once a function takes several related pieces of data — it also self-documents exactly which properties the function actually uses, without reading the whole body.

### Combining default values with destructuring

\`\`\`js
function printUser({ name, age = "unknown" } = {}) {
  console.log(\`\${name} is \${age} years old\`)
}

printUser({ name: "Ada" })   // "Ada is unknown years old"
printUser()                    // TypeError without the \`= {}\` fallback — destructuring undefined fails!
\`\`\`

The \`= {}\` after the destructuring pattern matters: without it, calling \`printUser()\` with no argument at all tries to destructure \`undefined\`, which throws immediately — a genuinely common real bug when this default is forgotten.

> **Key idea:** default parameters only trigger on missing/\`undefined\` arguments (not \`null\`/\`0\`/\`""\`); rest parameters (\`...args\`) collect extras into a real array, replacing the older, array-like \`arguments\` object; and destructured parameters are a common, readable way to accept an options object.`,
    },
    {
      name: "Return Values & First-Class Functions",
      minutes: 8,
      intro: "What a function gives back, and the idea that functions are values just like any other.",
      content: `### return exits immediately with a value

\`\`\`js
function absoluteValue(n) {
  if (n < 0) {
    return -n     // exits here if n is negative
  }
  return n         // otherwise exits here
}

console.log(absoluteValue(-5))   // 5
console.log(absoluteValue(5))     // 5
\`\`\`

The moment \`return\` executes, the function stops immediately — any code after it in the same execution path never runs. A function can have multiple \`return\` statements in different branches, but only one ever actually executes per call.

### No return means undefined

\`\`\`js
function logMessage(message) {
  console.log(message)
  // no return statement
}

const result = logMessage("hi")   // prints "hi"
console.log(result)                  // undefined
\`\`\`

A function with no explicit \`return\` — or a bare \`return\` with nothing after it — implicitly returns \`undefined\`. This is intentional and common for functions called purely for their *side effects* (like logging, or modifying something), where the return value was never meant to be used.

### The classic gotcha: automatic semicolon insertion after return

\`\`\`js
function getObject() {
  return
  {
    name: "Ada"
  }
}

console.log(getObject())   // undefined — NOT the object!
\`\`\`

JavaScript automatically inserts a semicolon after \`return\` if a newline immediately follows it — turning this into \`return;\` followed by an unreachable block, rather than \`return { name: "Ada" }\`. The fix: always start the returned value on the *same line* as \`return\`, or wrap a multi-line object in parentheses:

\`\`\`js
function getObject() {
  return {
    name: "Ada"
  }
}
\`\`\`

### Functions are values: first-class functions

\`\`\`js
function sayHi() {
  return "Hi!"
}

const alsoSayHi = sayHi          // assign a function to another variable — no () means don't CALL it
console.log(alsoSayHi())          // "Hi!" — calling it through the new name works fine

const functions = [sayHi, () => "Hello", () => "Hey"]
console.log(functions[1]())        // "Hello" — a function stored in an array, then called
\`\`\`

This is one of the most important ideas in JavaScript: functions are **values**, exactly like numbers, strings, or objects. They can be assigned to variables, stored in arrays or object properties, and — most importantly, covered next — passed as arguments to other functions, or returned from them. This property, called being "first-class," is what makes callbacks, array methods like \`.map\`, and much of modern JavaScript's style possible at all.

### Functions as arguments and return values

\`\`\`js
function repeat(action, times) {
  for (let i = 0; i < times; i++) {
    action(i)
  }
}

repeat(i => console.log(\`Iteration \${i}\`), 3)
// prints "Iteration 0", "Iteration 1", "Iteration 2"

function makeMultiplier(factor) {
  return function (n) {
    return n * factor
  }
}

const double = makeMultiplier(2)
console.log(double(5))   // 10
\`\`\`

A function that accepts another function as an argument (like \`repeat\` above, taking \`action\`) or returns one (like \`makeMultiplier\`, returning a new function) is called a **higher-order function** — covered in depth in the next lesson. This pattern is everywhere in real JavaScript, from array methods to event handlers to the async patterns covered later in this course.

> **Key idea:** \`return\` exits a function immediately with a value (or \`undefined\`, if omitted) — watch for the automatic-semicolon gotcha on a bare \`return\` followed by a newline. Functions being ordinary, first-class values — assignable, passable, returnable — is the foundation nearly everything else advanced in JavaScript builds on.`,
    },
    {
      name: "Higher-Order Functions",
      minutes: 7,
      intro: "Functions that operate on other functions — the pattern behind most of modern JavaScript's style.",
      content: `### The definition, concretely

A **higher-order function** is any function that does at least one of: (1) accepts another function as an argument, or (2) returns a function. Nothing exotic — just a natural consequence of functions being ordinary values, as the previous lesson established.

### Accepting a function as an argument: callbacks

\`\`\`js
function processArray(array, callback) {
  const results = []
  for (const item of array) {
    results.push(callback(item))
  }
  return results
}

const doubled = processArray([1, 2, 3], n => n * 2)
console.log(doubled)   // [2, 4, 6]

const greeted = processArray(["Ada", "Grace"], name => \`Hello, \${name}!\`)
console.log(greeted)     // ["Hello, Ada!", "Hello, Grace!"]
\`\`\`

Here, \`callback\` is a function passed *into* \`processArray\`, called once per item — this exact pattern, generalized and built into the language, is precisely what array methods like \`.map\` (covered in module 6) actually are. Understanding \`processArray\` above means you already understand how \`.map\` works internally.

### Returning a function: closures over configuration

\`\`\`js
function greaterThan(threshold) {
  return function (n) {
    return n > threshold
  }
}

const isAdult = greaterThan(17)
console.log(isAdult(20))   // true
console.log(isAdult(10))    // false
\`\`\`

\`greaterThan\` returns a *new, specialized* function each time it's called, "remembering" the \`threshold\` it was given. This works because of **closures** — the returned function keeps access to \`threshold\` even after \`greaterThan\` itself has finished running. This is a preview; closures get a complete, dedicated explanation in the next module, because there's real depth to *why* this works, not just *that* it works.

### A genuinely practical example: function composition

\`\`\`js
function compose(f, g) {
  return function (x) {
    return f(g(x))
  }
}

const addOne = n => n + 1
const double = n => n * 2

const addThenDouble = compose(double, addOne)
console.log(addThenDouble(3))   // 8 — (3 + 1) * 2
\`\`\`

\`compose\` takes two functions and returns a *new* function that runs them in sequence — a small building block behind a lot of real-world data-processing code, where a value flows through a pipeline of transformations.

### Why this pattern matters so much in JavaScript

Higher-order functions are what let JavaScript avoid a lot of repetitive, hand-written loops in favor of clear, declarative code: \`array.map(fn)\` reads as "transform every item with \`fn\`," rather than a multi-line loop with an index variable and a manually-built results array. The entire array-methods module (module 6) and much of the asynchronous-code module (module 8, where callbacks and \`.then()\` are themselves higher-order-function patterns) build directly on the concept introduced in this lesson.

> **Key idea:** a higher-order function accepts and/or returns other functions — this single idea, made possible only because functions are first-class values, is the foundation behind callbacks, array methods, function composition, and (as later modules will show) much of how asynchronous JavaScript is structured.`,
    },
  ],
}
