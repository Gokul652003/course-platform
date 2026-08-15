import type { Module } from "../types"

export const jsModule10: Module = {
  id: 10,
  title: "Error Handling & Debugging",
  status: "upcoming",
  lessons: [
    {
      name: "try, catch, finally & Error Types",
      minutes: 9,
      intro: "Catching problems gracefully instead of letting them crash the program.",
      content: `### The basic shape

\`\`\`js
try {
  const result = JSON.parse("{ invalid json")
  console.log(result)
} catch (error) {
  console.error("Parsing failed:", error.message)
}

console.log("The program keeps running")
\`\`\`

Code inside \`try\` runs normally; if anything inside it **throws**, execution immediately jumps to \`catch\`, skipping the rest of the \`try\` block entirely — and critically, the program continues running afterward instead of crashing. Without a \`try\`/\`catch\`, an uncaught error stops execution of the current script (or, for a single event handler/async callback, just that one call) entirely.

### finally: always runs, no matter what

\`\`\`js
function readConfig() {
  console.log("opening file")
  try {
    throw new Error("file not found")
  } catch (error) {
    console.error("Error:", error.message)
    return null
  } finally {
    console.log("closing file — this ALWAYS runs, even after the return above")
  }
}

readConfig()
// "opening file"
// "Error: file not found"
// "closing file — this ALWAYS runs, even after the return above"
\`\`\`

\`finally\` runs whether the \`try\` block succeeded, threw an error that got caught, or even if \`catch\`/\`try\` contains a \`return\` statement — genuinely always, making it the right place for cleanup code (closing a file, releasing a resource) that must happen regardless of outcome.

### The built-in Error types

\`\`\`js
try {
  null.someProperty
} catch (error) {
  console.log(error instanceof TypeError)   // true
  console.log(error.message)                  // "Cannot read properties of null (reading 'someProperty')"
}

try {
  undefinedVariable
} catch (error) {
  console.log(error instanceof ReferenceError)   // true
}

try {
  JSON.parse("not valid json")
} catch (error) {
  console.log(error instanceof SyntaxError)   // true
}
\`\`\`

JavaScript throws different built-in error **types** depending on what went wrong — \`TypeError\` (an operation on the wrong type, like calling something that isn't a function, or reading a property of \`null\`/\`undefined\`), \`ReferenceError\` (using a variable that doesn't exist — recall module 4's TDZ errors), \`SyntaxError\` (malformed code — either the source itself, or something like \`JSON.parse\` fed invalid text), \`RangeError\` (a value outside an allowed range, like the module 9 stack-overflow error), and a few others. All inherit from a common base \`Error\` type.

### Checking the error type to handle different failures differently

\`\`\`js
function processData(data) {
  try {
    return JSON.parse(data).value * 2
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON provided")
    } else if (error instanceof TypeError) {
      console.error("The parsed data doesn't have the expected shape")
    } else {
      throw error   // re-throw anything we don't specifically know how to handle
    }
    return null
  }
}
\`\`\`

**Re-throwing** an error you don't specifically know how to handle (the \`else\` branch above) is an important, deliberate pattern — catching *everything* indiscriminately and silently swallowing it hides real bugs. Only catch what you can meaningfully respond to; let anything else propagate up to somewhere that can.

### Catching without needing the error object

\`\`\`js
try {
  riskyOperation()
} catch {
  console.log("Something went wrong — details don't matter here")
}
\`\`\`

Modern JavaScript allows omitting the \`catch\` parameter entirely when you don't need to inspect the error itself — a small, common convenience for cases where any failure is handled identically regardless of its details.

> **Key idea:** \`try\`/\`catch\` stops an error from crashing the program, letting execution continue past the failure; \`finally\` always runs for cleanup, regardless of outcome. JavaScript's built-in error types (\`TypeError\`, \`ReferenceError\`, \`SyntaxError\`, \`RangeError\`, ...) let you distinguish *what* went wrong — and deliberately re-throwing errors you don't know how to handle is what prevents \`catch\` from silently hiding real bugs.`,
    },
    {
      name: "Throwing & Creating Custom Errors",
      minutes: 8,
      intro: "Signaling failure deliberately, with errors that carry meaningful, structured information.",
      content: `### throw: signaling failure explicitly

\`\`\`js
function withdraw(balance, amount) {
  if (amount > balance) {
    throw new Error("Insufficient funds")
  }
  return balance - amount
}

try {
  withdraw(100, 500)
} catch (error) {
  console.error(error.message)   // "Insufficient funds"
}
\`\`\`

\`throw\` immediately stops normal execution and hands control to the nearest enclosing \`catch\` (or, if there isn't one, crashes the program/that call) — exactly like a built-in error being thrown automatically, but triggered deliberately, at the exact point your own code detects something has gone wrong.

### You can throw anything — but always throw an Error object

\`\`\`js
throw "Something broke"           // works, but a bad practice
throw { code: 500 }                // also works, also a bad practice
throw new Error("Something broke")   // the correct, standard approach
\`\`\`

Technically, \`throw\` accepts any value at all — but only an actual \`Error\` object (or a subclass of it) automatically captures a **stack trace** at the point it's created, which is often the single most useful piece of information for actually diagnosing what went wrong. Throwing a plain string or object discards this, making bugs meaningfully harder to track down later.

### Custom error classes: extending Error

\`\`\`js
class ValidationError extends Error {
  constructor(message, field) {
    super(message)               // must call super(), exactly like module 7's class inheritance
    this.name = "ValidationError"   // overrides the default "Error" name shown in stack traces
    this.field = field                // custom, additional data specific to this error type
  }
}

function validateAge(age) {
  if (age < 0) {
    throw new ValidationError("Age cannot be negative", "age")
  }
  return age
}

try {
  validateAge(-5)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(\`Validation failed on field "\${error.field}": \${error.message}\`)
  } else {
    throw error
  }
}
\`\`\`

This directly applies module 7's \`class\`/\`extends\`/\`super\` — a custom error class inherits everything a normal \`Error\` has (message, stack trace) while adding your own meaningful, structured data (\`field\`, here) and a distinct \`name\` so \`instanceof\` checks (as in the previous lesson) can distinguish it from other error types.

### Building a small hierarchy of custom errors

\`\`\`js
class AppError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name   // automatically uses the actual subclass's name
  }
}

class NotFoundError extends AppError {}
class UnauthorizedError extends AppError {}

function getResource(id, isLoggedIn) {
  if (!isLoggedIn) throw new UnauthorizedError("You must be logged in")
  if (id > 100) throw new NotFoundError(\`Resource \${id} not found\`)
  return { id, data: "..." }
}

try {
  getResource(200, true)
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("404 — show a not-found page")
  } else if (error instanceof UnauthorizedError) {
    console.log("401 — redirect to login")
  } else {
    throw error
  }
}
\`\`\`

A common, real pattern in larger applications: a small hierarchy of custom error classes (all sharing a common \`AppError\` base) that let calling code distinguish and respond to different failure categories cleanly with \`instanceof\`, rather than parsing error messages as strings to guess what went wrong — a fragile approach that breaks the moment a message's wording changes.

> **Key idea:** always \`throw new Error(...)\` (or a subclass) rather than a plain string or object, since only real \`Error\` instances capture a useful stack trace. Custom error classes, built with \`extends Error\`, let you attach structured, meaningful data to a failure and let callers distinguish error categories reliably via \`instanceof\`.`,
    },
    {
      name: "Debugging Techniques",
      minutes: 8,
      intro: "Practical tools and habits for finding out why code isn't doing what you expect.",
      content: `### Beyond console.log: the console object's other tools

\`\`\`js
console.table([
  { name: "Ada", age: 30 },
  { name: "Grace", age: 40 },
])
// renders an actual formatted table in the console — far easier to scan than nested console.logs

console.group("Processing user")
console.log("Step 1: validating")
console.log("Step 2: saving")
console.groupEnd()
// visually indents the grouped logs, making a multi-step process easier to follow

console.time("expensive operation")
// ... some code ...
console.timeEnd("expensive operation")   // prints exactly how long that block took to run
\`\`\`

\`console.log\` covers most needs, but \`console.table\` (arrays of objects), \`console.group\`/\`groupEnd\` (visually nesting related logs), and \`console.time\`/\`timeEnd\` (measuring how long something actually takes) are genuinely useful, underused tools for specific debugging situations.

### The debugger statement & breakpoints

\`\`\`js
function calculateTotal(items) {
  let total = 0
  for (const item of items) {
    debugger   // execution PAUSES here, if DevTools is open — like a breakpoint written directly in code
    total += item.price
  }
  return total
}
\`\`\`

The \`debugger\` statement pauses execution at that exact line, *if* the browser's (or Node's) developer tools are open — letting you inspect every variable's current value, and step through the code one line at a time from there. This is a more powerful debugging tool than scattering \`console.log\` calls everywhere, since you can freely inspect the *entire* current state, not just the specific values you thought in advance to log.

### Reading a stack trace properly

\`\`\`
TypeError: Cannot read properties of undefined (reading 'name')
    at getUserName (app.js:15:20)
    at displayGreeting (app.js:22:18)
    at main (app.js:30:3)
    at app.js:35:1
\`\`\`

Recall module 9's call stack lesson: a stack trace is a direct, literal snapshot of the call stack at the moment an error was thrown, read from the **innermost call first** (where the error actually occurred) outward to how execution got there. Reading top-to-bottom traces the exact path: \`main\` called \`displayGreeting\`, which called \`getUserName\`, which is where the actual failure happened, on line 15. Always start reading from the top, not the bottom.

### The most useful debugging habit: isolate the problem

Rather than staring at a large chunk of code trying to spot the bug by inspection alone, the single most effective technique is **systematically narrowing down exactly where** things go wrong — comment out or bypass sections, add a \`console.log\` (or \`debugger\`) at a specific midpoint, and check whether the value there is what you expect. If it is, the bug is *after* that point; if not, it's *before*. Repeating this bisection quickly narrows even a large, unfamiliar codebase down to the exact failing line, far faster than reading every line hoping to spot the issue by eye.

### Common bug patterns worth specifically checking for

Given everything covered so far in this course, a short, genuinely useful mental checklist when something isn't working as expected:

- **Off-by-one or wrong comparison** — module 2's operators, especially loop conditions.
- **\`==\` instead of \`===\`**, or an unexpected coercion — module 2.
- **Mutating an object/array you didn't mean to** — module 5/6's reference-sharing gotchas.
- **Lost \`this\`** — module 7, a method extracted and called on its own, or passed as a callback.
- **Assuming synchronous order for async code** — module 8/9, forgetting an \`await\`, or misjudging microtask/macrotask ordering.
- **A variable shadowed or captured incorrectly in a closure/loop** — module 4.

> **Key idea:** \`console.table\`/\`group\`/\`time\`, the \`debugger\` statement, and careful stack-trace reading (innermost call first) are the practical tools for finding a bug — but the most valuable *technique* is systematically narrowing down exactly where expected behavior diverges from actual behavior, rather than reading code end-to-end hoping to spot the issue by eye.`,
    },
  ],
}
