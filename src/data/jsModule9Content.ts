import type { Module } from "../types"

export const jsModule9: Module = {
  id: 9,
  title: "The Event Loop & Runtime Internals",
  status: "upcoming",
  lessons: [
    {
      name: "The Call Stack & the Heap",
      minutes: 9,
      intro: "The two memory structures every running piece of JavaScript uses.",
      content: `### The call stack: tracking what's currently running

\`\`\`js
function third() {
  console.log("in third")
}
function second() {
  third()
}
function first() {
  second()
}
first()
\`\`\`

\`\`\`
call stack, at the deepest point:
  third
  second
  first
  (global)
\`\`\`

The **call stack** is exactly what it sounds like: a stack (last in, first out) tracking every function call currently in progress. Calling \`first()\` pushes a frame for it; \`first\` calling \`second()\` pushes another frame on top; \`second\` calling \`third()\` pushes a third. Each function *returning* pops its frame back off, in reverse order. This directly explains **stack traces** — an error's printed trace is literally a snapshot of the call stack at the moment it was thrown, read from the innermost call outward.

### Stack overflow: what happens when the stack fills up

\`\`\`js
function recurse() {
  return recurse()   // calls itself with no base case — never returns, never pops
}
recurse()   // RangeError: Maximum call stack size exceeded
\`\`\`

The call stack has a finite size. A function that calls itself (or otherwise nests calls) without ever returning eventually exhausts it — this is precisely what "stack overflow" means, and it's the origin of the well-known website's name.

### The heap: where objects actually live

\`\`\`js
function createUser() {
  const user = { name: "Ada" }   // the OBJECT itself lives in the heap
  return user                      // only a REFERENCE to it is returned/stored
}
\`\`\`

While the call stack holds primitive values and *references* to objects, the objects themselves (recall module 5's reference-vs-value distinction) live in a separate, much larger memory region called the **heap** — an unstructured pool of memory for anything whose size isn't known ahead of time or needs to outlive the function call that created it. This split — stack for the call sequence and small fixed-size values, heap for objects — is standard across most programming language runtimes, not unique to JavaScript.

### Why this matters for the closures you learned in module 4

\`\`\`js
function makeCounter() {
  let count = 0   // lives in a scope tied to this call...
  return function () {
    count++          // ...but this returned function still references it, so it can't be discarded
    return count
  }
}
\`\`\`

Recall module 4's closures: variables from a finished function call normally get cleaned up once that call returns and its stack frame pops. But if something (like the returned inner function here) still holds a *reference* to one of those variables, the engine can't safely discard it — so it lives on in the heap for as long as something can still reach it. This is the actual mechanism, precisely, that makes closures possible: it's not magic, it's the heap keeping variables alive exactly as long as they're reachable, exactly the same as it would for any other object.

### A single-threaded stack is exactly why blocking code is dangerous

\`\`\`js
function blockFor(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {}   // busy-waits, doing nothing useful, but occupying the ONE thread completely
}

console.log("before")
blockFor(3000)   // the entire page/program freezes for 3 seconds — nothing else can run
console.log("after")
\`\`\`

Because there's only one call stack and one thread executing it (module 1), any function that takes a long time to run **blocks everything** — no other code, no UI updates, no timers, nothing can run until that function finishes and its frame pops off the stack. This single fact is the entire motivation for the rest of this module: JavaScript needed a way to handle slow operations *without* occupying the stack the whole time they're in progress.

> **Key idea:** the call stack tracks in-progress function calls (last in, first out — directly producing stack traces); the heap holds objects and anything reachable from still-active code, including variables kept alive by closures. Because there's only one stack on one thread, any long-running synchronous code blocks everything else — the exact problem the event loop, covered next, exists to solve.`,
    },
    {
      name: "The Event Loop",
      minutes: 11,
      intro: "The actual mechanism behind async code — how JavaScript does many things without true parallelism.",
      content: `### The pieces involved

\`\`\`
Call Stack   <- runs your code, one frame at a time (module 1: single-threaded)
Web APIs / Node APIs   <- setTimeout, fetch, file I/O — NOT part of the JS engine itself
Callback Queue (a.k.a. Task Queue)   <- finished async work waits here
Event Loop   <- constantly checks: is the stack empty? if so, move the next queued callback onto it
\`\`\`

This is the mechanism that makes asynchronous JavaScript possible on a single thread. \`setTimeout\`, \`fetch\`, and similar APIs aren't actually part of the JavaScript language or engine at all — they're provided by the surrounding environment (the browser, or Node.js), running the actual waiting **outside** the single JS thread entirely.

### Walking through an example, step by step

\`\`\`js
console.log("1")

setTimeout(() => {
  console.log("2")
}, 0)

console.log("3")
\`\`\`

\`\`\`
1
3
2
\`\`\`

Even with a delay of \`0\` milliseconds, \`"2"\` still prints **last**. Here's exactly what happens:

1. \`console.log("1")\` runs immediately on the call stack, then pops off.
2. \`setTimeout(...)\` is called — it hands its callback off to the Web/Node API to manage the timer, and immediately returns, popping off the stack. The callback is **not** run yet, and not even queued yet — it's just being timed, off to the side.
3. \`console.log("3")\` runs immediately, then pops off.
4. The call stack is now empty. Only *now* does the timer's callback (already finished waiting, even at 0ms) get moved from the API into the callback queue, and the event loop notices the stack is empty and moves it onto the stack to run.
5. \`console.log("2")\` finally runs.

### The key rule: queued callbacks NEVER run until the stack is completely empty

\`\`\`js
console.log("start")
setTimeout(() => console.log("timeout"), 0)

// a long-running SYNCHRONOUS block
let sum = 0
for (let i = 0; i < 1e9; i++) sum += i
console.log("loop finished, sum:", sum)
\`\`\`

Even with a \`0ms\` delay, the timeout callback **cannot** interrupt the currently-running synchronous loop — it has to wait until the loop finishes and the stack is empty, no matter how long that takes. This is a direct, practical consequence of the single call stack from the previous lesson: the event loop only ever moves work onto the stack when it's completely empty, never interrupting code that's already running.

### The full picture

\`\`\`
while (true) {
  if (callStack.isEmpty()) {
    if (callbackQueue.hasWork()) {
      callStack.push(callbackQueue.dequeue())
    }
  }
}
\`\`\`

This is a simplified but genuinely accurate mental model of the event loop: an infinite loop, constantly checking whether the call stack is empty, and if so, pulling the next piece of finished async work off the queue and running it. It's called an "event loop" because this is precisely the mechanism used to respond to *any* event — a finished timer, a completed network request, a button click — not just the async patterns from the previous module.

### This is why JavaScript "does many things at once" without true multithreading

The concurrency JavaScript appears to have (handling a network request while also responding to a click while also running a timer) isn't parallel execution — it's the *illusion* of concurrency, created by very quickly interleaving many short pieces of work through this single stack, with the actual slow waiting (network latency, timer duration) happening entirely outside the JS thread, in the surrounding environment.

> **Key idea:** async APIs (\`setTimeout\`, \`fetch\`, etc.) hand their waiting off to the browser/Node environment, not the JS engine itself — their callbacks only get moved onto the call stack once it's completely empty, checked continuously by the event loop. This is why a \`0ms\` \`setTimeout\` still runs after all currently-queued synchronous code, and why long-running synchronous code blocks every pending async callback until it finishes.`,
    },
    {
      name: "Microtasks vs Macrotasks",
      minutes: 10,
      intro: "Not all queued work is treated equally — Promises jump the line ahead of setTimeout.",
      content: `### Two separate queues, not one

\`\`\`js
console.log("1: start")

setTimeout(() => console.log("2: setTimeout"), 0)

Promise.resolve().then(() => console.log("3: promise"))

console.log("4: end")
\`\`\`

\`\`\`
1: start
4: end
3: promise
2: setTimeout
\`\`\`

This is a genuinely important refinement to the previous lesson's model: there isn't just one callback queue — there are two, with different priority. \`setTimeout\` callbacks go into the **macrotask queue** (also called the task queue). Promise callbacks (\`.then\`, \`.catch\`, \`.finally\`, and — since it's built on Promises — anything after an \`await\`) go into a separate, higher-priority **microtask queue**.

### The actual rule: drain ALL microtasks before running even one macrotask

\`\`\`
1. Run all currently synchronous code (the stack empties)
2. Run EVERY microtask currently in the queue, one at a time — including any NEW
   microtasks that get added while draining this queue — until it's completely empty
3. ONLY THEN, run exactly ONE macrotask
4. Go back to step 2 (drain microtasks again) before the next macrotask
\`\`\`

This is why \`"3: promise"\` printed before \`"2: setTimeout"\` above, even though both were scheduled with the shortest possible delay: after the synchronous code finishes, the event loop always fully drains the microtask queue **first**, and only then picks up a single macrotask.

### A microtask can add more microtasks, and they still all run first

\`\`\`js
console.log("1")

setTimeout(() => console.log("2: macrotask"), 0)

Promise.resolve()
  .then(() => {
    console.log("3: microtask A")
    return Promise.resolve()
  })
  .then(() => console.log("4: microtask B — added DURING draining, still runs before the macrotask"))

console.log("5")
\`\`\`

\`\`\`
1
5
3: microtask A
4: microtask B — added DURING draining, still runs before the macrotask
2: macrotask
\`\`\`

Even though \`"4"\`'s \`.then\` was only registered *while the microtask queue was already being drained* (as a result of \`"3"\`'s callback returning another Promise), it still runs before the macrotask — the queue genuinely isn't considered empty until no more microtasks are being added to it. This means a chain of many \`.then()\`s, or a recursive pattern that keeps scheduling more microtasks, can in principle starve macrotasks (including rendering and timers) indefinitely — a real, if uncommon, pitfall worth knowing about.

### Why this design exists

Microtasks getting priority means Promise-based code behaves as predictably and "immediately" as possible once the current synchronous work finishes — rather than potentially being interleaved with unrelated \`setTimeout\`-scheduled work from elsewhere in the app. This is precisely why \`await\`, built on Promises, "feels" fast and immediate in practice, even though it's technically still asynchronous.

### A worked example, tying it all together

\`\`\`js
console.log("A: sync")

setTimeout(() => console.log("B: macrotask"), 0)

Promise.resolve().then(() => console.log("C: microtask"))

async function asyncFn() {
  console.log("D: sync, inside async function, before any await")
  await null
  console.log("E: microtask, after await")
}
asyncFn()

console.log("F: sync")
\`\`\`

\`\`\`
A: sync
D: sync, inside async function, before any await
F: sync
C: microtask
E: microtask, after await
B: macrotask
\`\`\`

Note that \`"D"\` runs synchronously, immediately, alongside \`"A"\` and \`"F"\` — an \`async\` function runs completely normally, synchronously, right up until its **first** \`await\`. Only at that \`await\` does it pause and effectively schedule the rest of the function as a microtask, exactly like a \`.then()\` callback would.

> **Key idea:** microtasks (Promise callbacks, code after \`await\`) always run before the next macrotask (\`setTimeout\`, and similar), and the *entire* microtask queue is drained — including newly added microtasks — before even one macrotask runs. This ordering, more than anything else, is why Promise-based async code consistently "feels" faster and more immediate than \`setTimeout\`-based code.`,
    },
    {
      name: "Web APIs, Timers & the Node.js Event Loop",
      minutes: 8,
      intro: "What actually provides setTimeout and fetch, and how Node's event loop differs from the browser's.",
      content: `### setTimeout and fetch aren't part of JavaScript the language at all

\`\`\`js
console.log(typeof setTimeout)   // "function" — but it's NOT defined by the ECMAScript spec
console.log(typeof fetch)         // "function" — same story
\`\`\`

Recall module 1: the ECMAScript specification defines the *language* — syntax, types, functions, closures, and so on. It does **not** define \`setTimeout\`, \`fetch\`, or \`document\` — those are provided entirely by the **runtime environment** (the browser or Node.js) that happens to be running the engine. This is exactly why \`fetch\` works differently, or doesn't exist at all, depending on the JavaScript environment (older Node.js versions genuinely didn't have it built in).

### setTimeout's delay is a minimum, not a guarantee

\`\`\`js
console.log("start")
setTimeout(() => console.log("delayed"), 1000)

// a long, blocking synchronous operation
let sum = 0
for (let i = 0; i < 5e9; i++) sum += i   // takes, say, 3 real seconds to finish
\`\`\`

Because the callback can only run once the call stack is empty (this module's earlier lessons), a busy synchronous block running *longer* than the specified delay pushes the callback's actual execution later than requested. \`setTimeout(fn, 1000)\` genuinely means "run this **no sooner** than 1000ms from now, whenever the stack next happens to be free" — never a hard, precise guarantee.

### setInterval: the repeating version, with the same caveats

\`\`\`js
let count = 0
const id = setInterval(() => {
  count++
  console.log(count)
  if (count === 3) clearInterval(id)   // always provide a way to stop it!
}, 1000)
\`\`\`

\`setInterval\` schedules its callback repeatedly, on the same interval — and like \`setTimeout\`, each individual run is still subject to the event loop's rules from the previous two lessons. Forgetting \`clearInterval\` is a common, real source of memory leaks and unwanted ongoing work, especially in a long-running application.

### Node.js has its own, more detailed event loop — with several phases

\`\`\`
timers -> pending callbacks -> poll -> check -> close callbacks
   ^ (setTimeout/setInterval)              ^ (setImmediate)
\`\`\`

Node.js's event loop (distinct from the browser's, though conceptually similar) actually has multiple named **phases**, each handling a different category of callback — timers, I/O callbacks, and so on — cycling through them in order, repeatedly. This level of detail is mostly relevant for genuinely performance-sensitive Node.js server code; for typical application code, the mental model from the previous two lessons (macrotasks vs. microtasks, stack must be empty first) is sufficient and accurate enough day to day.

### process.nextTick in Node: an even higher priority than microtasks

\`\`\`js
console.log("1")
setTimeout(() => console.log("2: timeout"), 0)
Promise.resolve().then(() => console.log("3: promise"))
process.nextTick(() => console.log("4: nextTick"))
console.log("5")
\`\`\`

\`\`\`
1
5
4: nextTick
3: promise
2: timeout
\`\`\`

Node-specific, worth knowing if you write server-side JavaScript: \`process.nextTick\`'s queue is drained even *before* the regular microtask (Promise) queue — the single highest-priority queue in Node.js. It has no direct browser equivalent.

### The practical takeaway

You don't need to memorize every phase of Node's event loop to write correct, effective asynchronous JavaScript — what matters, and what this entire module has built toward, is the core mental model: synchronous code always runs first and to completion; microtasks (Promises/\`await\`) drain completely next; macrotasks (timers, and similar) run one at a time after that, with the whole cycle repeating. Every async bug you'll encounter — an unexpected ordering, a callback that "should have" run sooner — traces back to this exact model.

> **Key idea:** \`setTimeout\`/\`fetch\` are provided by the runtime environment (browser or Node), not the JavaScript language itself, and a timer's delay is always a minimum, never a guarantee, since callbacks still wait for an empty call stack. Node.js has a more detailed, phased event loop than the browser's simplified model, plus its own even-higher-priority \`process.nextTick\` queue — but the core sync-then-microtasks-then-macrotasks model from this module holds everywhere.`,
    },
  ],
}
