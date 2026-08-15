import type { Module } from "../types"

export const jsModule12: Module = {
  id: 12,
  title: "Advanced Topics & Capstone",
  status: "upcoming",
  lessons: [
    {
      name: "Memory Management & Garbage Collection",
      minutes: 9,
      intro: "How JavaScript decides when memory can be reclaimed — and the patterns that accidentally prevent it.",
      content: `### JavaScript manages memory automatically — mostly

\`\`\`js
function createUser() {
  const user = { name: "Ada", data: new Array(1000000) }
  return user.name   // only the string is returned; the big object becomes unreachable
}

const name = createUser()
// the { name, data } object from inside createUser is now eligible for garbage collection —
// nothing references it anymore, even though it briefly existed on the heap (module 9)
\`\`\`

Unlike some languages, JavaScript never requires you to manually allocate or free memory — a **garbage collector** runs automatically, identifying objects on the heap (recall module 9) that are no longer **reachable** from anywhere your code could still access, and reclaiming their memory. "Reachable" is the key concept: as long as *something* still holds a reference to an object — a variable, a closure, an array, another object's property — it stays alive; the moment nothing does, it becomes eligible for collection.

### Reachability, traced through references

\`\`\`js
let obj = { data: "important" }   // reachable: referenced by the variable "obj"
let obj2 = obj                       // now TWO references to the same object

obj = null   // the FIRST reference is gone, but obj2 still holds a reference — NOT collected yet

obj2 = null   // now NOTHING references the original object — NOW it's eligible for collection
\`\`\`

This connects directly to module 5's reference-vs-value model: an object stays alive as long as *any* reachable reference to it exists anywhere — not just its original variable.

### Closures keeping more alive than you might expect

\`\`\`js
function setup() {
  const hugeData = new Array(1000000).fill("data")
  const smallValue = 42

  return function () {
    return smallValue   // this closure only USES smallValue...
    // ...but depending on the engine, hugeData may be kept alive too, simply because
    // it's in the same enclosing scope as something the closure DOES reference
  }
}

const fn = setup()
\`\`\`

This directly extends module 4's closures and module 9's heap lesson: a closure keeps its *entire* enclosing scope reachable for as long as it exists, not just the specific variables it happens to reference — in older engines especially, this could keep surprisingly large, unrelated data alive far longer than intended. Modern engines have gotten smarter about this specific case, but it remains a genuinely useful thing to be aware of: a long-lived closure over a scope containing large data is a real, if often small, memory cost.

### A classic real-world leak: forgotten event listeners and timers

\`\`\`js
function setupWidget(element) {
  const largeState = { /* lots of data */ }

  function handleClick() {
    console.log(largeState)   // the closure keeps largeState alive as long as this listener exists
  }

  element.addEventListener("click", handleClick)
  // if this widget is later removed from the page WITHOUT removeEventListener,
  // the listener (and everything it closes over) stays alive indefinitely — a real leak
}
\`\`\`

\`\`\`js
element.removeEventListener("click", handleClick)   // the fix — explicitly break the reference
\`\`\`

This is one of the most common real-world memory leaks in long-running JavaScript applications (especially single-page apps): an event listener or an uncleared \`setInterval\` (recall module 9) keeps a closure — and everything it references — alive far longer than intended, because the listener itself is still "reachable" from the browser's internal event system, even after the element it was attached to is gone. Always pair \`addEventListener\` with a corresponding \`removeEventListener\`, and every \`setInterval\` with a \`clearInterval\`, once they're no longer needed.

### Why understanding this matters even though GC is "automatic"

Garbage collection freeing you from *manual* memory management doesn't mean memory problems are impossible — it just changes their shape from "forgot to free memory" to "accidentally kept something reachable longer than intended." The practical skill is recognizing the patterns (lingering event listeners, timers, and large data captured by long-lived closures) that create unintentional reachability, not manually tracking every allocation.

> **Key idea:** an object stays in memory exactly as long as something reachable still references it — garbage collection is automatic, but "accidentally still reachable" (via a forgotten event listener, an uncleared timer, or a closure over a larger scope than intended) is a real, common source of memory leaks even in a garbage-collected language.`,
    },
    {
      name: "Strict Mode & Common Pitfalls",
      minutes: 8,
      intro: "A safer subset of the language, and a checklist of the classic mistakes covered across this course.",
      content: `### "use strict": opting into safer behavior

\`\`\`js
"use strict"

x = 10   // ReferenceError: x is not defined — strict mode catches this
// without "use strict", this would silently create a global variable!
\`\`\`

Recall module 11: ES modules are automatically strict, everywhere, with no need for this directive at all — but plain, non-module scripts are not, unless they opt in explicitly with \`"use strict"\` at the very top of a file or function. Strict mode turns several previously-silent mistakes (accidentally creating global variables, assigning to a read-only property, using a reserved word as a variable name) into immediate, loud errors — a real safety improvement, which is exactly why modules adopt it by default.

### A checklist of classic pitfalls, gathered from across this whole course

**Equality and coercion (module 2)**
\`\`\`js
if (userInput == "0") { }   // use === instead — == coerces types unpredictably
if (count || 10) { }          // wrong if 0 is a valid count — use ?? instead
\`\`\`

**Mutation and reference sharing (modules 5 & 6)**
\`\`\`js
const arr = [1, 2, 3]
someFunction(arr)   // does someFunction mutate arr? check — objects/arrays are passed by reference
const copy = { ...original }   // remember: this is a SHALLOW copy only
\`\`\`

**Lost this (module 7)**
\`\`\`js
element.addEventListener("click", obj.handleClick)   // loses "this" — use .bind(obj) or an arrow wrapper
\`\`\`

**Async ordering assumptions (modules 8 & 9)**
\`\`\`js
let data
fetchData().then(result => { data = result })
console.log(data)   // undefined — this runs BEFORE the .then callback, not after
\`\`\`

**var's function-scoping and loop closures (modules 1 & 4)**
\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)   // prints 3, 3, 3 — use let instead
}
\`\`\`

**sort() without a comparator (module 6)**
\`\`\`js
[10, 2, 33].sort()   // sorts as STRINGS — pass (a, b) => a - b for numbers
\`\`\`

### Why revisiting these together, at the end, is worth doing

Every single one of these was covered in depth earlier in this course, in its own context — the value of this checklist isn't new information, it's **pattern recognition**: real bugs rarely announce which module's lesson they relate to. Being able to look at a piece of broken code and immediately think "this smells like a reference-sharing issue" or "this looks like a lost-\`this\` bug" is what separates having *read* about these pitfalls from actually being able to *diagnose* them quickly in unfamiliar code.

### Linting: catching many of these automatically

Tools like ESLint can automatically flag a meaningful fraction of this checklist — \`==\` instead of \`===\`, an unused variable, a missing \`break\` in a \`switch\` (module 2) — before the code even runs. Worth setting up on any real project; it won't catch everything (it can't know your *intent*), but it reliably catches the purely mechanical mistakes.

> **Key idea:** \`"use strict"\` (automatic in ES modules) turns several silent JavaScript mistakes into loud errors; the pitfalls checklist above isn't new material — it's every earlier module's key gotcha gathered in one place, specifically to build the pattern-recognition skill of diagnosing *which* kind of bug a piece of broken code is exhibiting.`,
    },
    {
      name: "Regular Expressions Basics",
      minutes: 8,
      intro: "Pattern matching for text — the essentials you'll actually reach for regularly.",
      content: `### Creating a regular expression

\`\`\`js
const pattern1 = /hello/          // literal syntax — the common way
const pattern2 = new RegExp("hello")   // constructor syntax — useful when the pattern is built dynamically

console.log(pattern1.test("hello world"))   // true — .test() returns a boolean: does it match?
console.log(pattern1.test("goodbye"))         // false
\`\`\`

A **regular expression** (regex) describes a *pattern* to match against text, rather than an exact literal string. \`.test()\` is the simplest way to check whether a string matches at all.

### Common patterns you'll actually use

\`\`\`js
/\\d/          // any single digit (0-9)
/\\d+/          // one or more digits
/[a-z]/          // any single lowercase letter
/[a-zA-Z]+/       // one or more letters, either case
/^hello/           // "hello" at the very START of the string
/world$/             // "world" at the very END of the string
/^hello$/             // the string is EXACTLY "hello", nothing more
/colou?r/               // "color" OR "colour" — the ? makes the preceding character optional
\`\`\`

You don't need to memorize every possible regex feature — the ones above cover the large majority of everyday pattern matching: \`\\d\` for digits, \`[...]\` for a character set, \`+\` for "one or more," \`?\` for "optional," and \`^\`/\`$\` for anchoring to the start/end.

### A practical, common example: validating an email's shape

\`\`\`js
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/

console.log(emailPattern.test("ada@example.com"))   // true
console.log(emailPattern.test("not an email"))         // false
\`\`\`

This checks for a plausible email *shape* (something, an \`@\`, something, a \`.\`, something, with no spaces) — genuinely useful for catching obviously malformed input, though worth knowing that fully, perfectly validating every technically-legal email address requires a vastly more complex pattern than is practical to hand-write; most real applications use a pattern like this one as a first-pass sanity check, not a complete guarantee.

### Extracting matches, not just testing for them

\`\`\`js
const text = "Contact us at ada@example.com or grace@example.com"
const emailPattern = /[^\\s@]+@[^\\s@]+\\.[^\\s@]+/g   // the "g" flag: find ALL matches, not just the first

console.log(text.match(emailPattern))
// ["ada@example.com", "grace@example.com"]
\`\`\`

\`.match()\` (called on a string) returns the actual matched text — with the \`g\` (global) flag, every match in the string, not just the first one it finds.

### Using regex with string methods you may already know

\`\`\`js
console.log("Hello World".replace(/o/g, "0"))     // "Hell0 W0rld" — replace ALL matches
console.log("Hello World".replace(/o/, "0"))         // "Hell0 World" — without "g", only the FIRST match

console.log("a1b2c3".split(/\\d/))                    // ["a", "b", "c"] — split on any digit
\`\`\`

\`.replace()\` and \`.split()\` both accept a regex in place of a plain string — extending their behavior from "match this exact substring" to "match anything fitting this pattern," which is often exactly what's needed for real text processing.

### When NOT to reach for regex

\`\`\`js
// overkill for a simple, exact check:
if (/^hello$/.test(str)) { }
// just use ===:
if (str === "hello") { }
\`\`\`

For a simple, exact string comparison, plain \`===\` or \`.includes()\`/\`.startsWith()\`/\`.endsWith()\` (ordinary string methods) are clearer and faster than reaching for a regex. Regex earns its complexity specifically when you need genuine *pattern* matching — variable text, optional parts, repetition — not as a default replacement for simple string comparisons.

> **Key idea:** \`\\d\`, \`[...]\`, \`+\`, \`?\`, and \`^\`/\`$\` cover the majority of everyday pattern matching — \`.test()\` for a yes/no check, \`.match()\`/\`.replace()\`/\`.split()\` (called on strings) for extracting or transforming matched text. Reach for regex specifically when matching a genuine *pattern*, not as a habit for simple exact-string comparisons that \`===\` already handles clearly.`,
    },
    {
      name: "Capstone: Putting It All Together",
      minutes: 10,
      intro: "One worked example combining nearly every concept from this course — and where to go from here.",
      content: `### A small, complete task manager, built from this course's concepts

\`\`\`js
class TaskManager {
  #tasks = []                 // private field (module 7)
  #nextId = 1

  addTask(title, { priority = "normal" } = {}) {   // default params + destructuring (module 3)
    const task = {
      id: this.#nextId++,
      title,
      priority,
      done: false,
      createdAt: new Date(),
    }
    this.#tasks.push(task)     // array method (module 6)
    return task
  }

  completeTask(id) {
    const task = this.#tasks.find(t => t.id === id)   // find + arrow function (modules 3 & 6)
    if (!task) {
      throw new TaskNotFoundError(id)   // custom error (module 10)
    }
    task.done = true
    return task
  }

  getPendingTasks() {
    return this.#tasks.filter(t => !t.done)   // filter (module 6)
  }

  getSummary() {
    return this.#tasks.reduce(     // reduce (module 6)
      (summary, task) => {
        summary.total++
        if (task.done) summary.completed++
        return summary
      },
      { total: 0, completed: 0 },
    )
  }

  *[Symbol.iterator]() {   // generator as the iterator implementation (modules 9 & 11)
    for (const task of this.#tasks) {
      yield task
    }
  }
}

class TaskNotFoundError extends Error {   // custom error class (module 10)
  constructor(id) {
    super(\`Task with id \${id} not found\`)
    this.name = "TaskNotFoundError"
    this.id = id
  }
}

async function saveTasksToServer(tasks) {   // async/await (module 8)
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(tasks),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to save:", error.message)
    return false
  }
}
\`\`\`

### Using it

\`\`\`js
const manager = new TaskManager()

manager.addTask("Write course capstone", { priority: "high" })
manager.addTask("Review pull requests")
const secondTask = manager.addTask("Deploy to production", { priority: "high" })

manager.completeTask(secondTask.id)

console.log(manager.getSummary())   // { total: 3, completed: 1 }

for (const task of manager) {         // works because of Symbol.iterator, via a generator
  console.log(\`[\${task.done ? "x" : " "}] \${task.title}\`)
}

try {
  manager.completeTask(999)
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    console.error(\`Could not find task \${error.id}\`)
  }
}
\`\`\`

### What this example draws on, module by module

Nearly every module in this course contributed something here: variables and types (1), control flow (2), default parameters and arrow functions (3), the private \`#tasks\` field relying on closures' underlying idea of encapsulation (4), object property access and shorthand (5), \`push\`/\`find\`/\`filter\`/\`reduce\` (6), classes and \`this\` (7), \`async\`/\`await\` (8), a generator implementing \`Symbol.iterator\` so the class works with \`for...of\` (9 & 11), and a custom \`Error\` subclass with proper \`try\`/\`catch\` handling (10). This is deliberately the point: real JavaScript code is rarely "using module 6's material" in isolation — it's all of these ideas, composed together, all the time.

### Where to go from here

This course covered the **language** — everything that's true in a browser, in Node.js, or anywhere else JavaScript runs. From here, the natural next steps branch in a few directions:

- **The DOM & browser APIs** — if you want to build for the web specifically: \`document\`, events, the actual browser environment this course deliberately set aside to focus on the language itself.
- **TypeScript** — adds static types on top of everything in this course, catching many of the bugs from this module's pitfalls checklist *before* the code even runs.
- **Node.js specifically** — file systems, servers, npm packages — building on this course's async/event-loop coverage, applied server-side.
- **A framework** — this platform's own Next.js course builds directly on Server/Client Components, which are ultimately just JavaScript functions — everything from this course (closures, async, modules) applies directly there too.

> **Key idea:** real JavaScript code composes ideas from across the entire language at once, not one module's concept in isolation — this capstone's task manager, small as it is, genuinely uses material from all twelve modules together, which is exactly the skill this whole course has been building toward.`,
    },
  ],
}
