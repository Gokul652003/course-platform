import type { Module } from "../types"

export const jsModule8: Module = {
  id: 8,
  title: "Asynchronous JavaScript",
  status: "upcoming",
  lessons: [
    {
      name: "Callbacks & Callback Hell",
      minutes: 8,
      intro: "The original way JavaScript handled things that take time — and the mess it led to.",
      content: `### Why asynchronous code exists at all

\`\`\`js
console.log("1: start")
setTimeout(() => console.log("2: this runs later"), 1000)
console.log("3: this runs before '2', immediately")
\`\`\`

\`\`\`
1: start
3: this runs before '2', immediately
2: this runs later
\`\`\`

Recall module 1: JavaScript runs on a single thread — it cannot simply *pause* and wait for something slow (a timer, a network request, reading a file) without freezing everything else, including the page's UI. **Asynchronous** operations solve this: instead of blocking, they register "run this later, when the result is ready" and let the rest of the program keep going in the meantime. \`setTimeout\`'s second argument is exactly this: a **callback**, run later.

### The callback pattern

\`\`\`js
function fetchUser(id, callback) {
  setTimeout(() => {
    callback({ id, name: "Ada" })   // simulates a slow operation completing
  }, 1000)
}

fetchUser(1, (user) => {
  console.log(user)   // { id: 1, name: "Ada" } — logged after ~1 second
})
console.log("This logs immediately, before the user data")
\`\`\`

This is directly the higher-order-function pattern from module 3 — \`fetchUser\` accepts a function to call once its (simulated) slow work finishes. For years, this was the standard way to handle anything asynchronous in JavaScript.

### The problem: nesting callbacks for sequential async steps

\`\`\`js
fetchUser(1, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      fetchAuthor(comments[0].authorId, (author) => {
        console.log(author)
        // four levels deep, and this keeps growing with each additional async step
      })
    })
  })
})
\`\`\`

When one async operation needs to run only *after* another finishes — a common, ordinary requirement — callbacks force you to nest each step inside the previous one's callback. This produces the infamous **"callback hell"** (also called "the pyramid of doom"): code that drifts rightward with every additional step, genuinely hard to read, hard to modify, and hard to correctly handle errors in.

### Error handling gets messy too

\`\`\`js
function fetchUser(id, onSuccess, onError) {
  setTimeout(() => {
    if (id < 0) {
      onError(new Error("Invalid ID"))
      return
    }
    onSuccess({ id, name: "Ada" })
  }, 1000)
}

fetchUser(
  1,
  (user) => console.log(user),
  (error) => console.error(error),
)
\`\`\`

Without a single, unified way to propagate an error, callback-based code typically needs a **separate error callback** for every single async step — and it's alarmingly easy to forget to wire one up correctly at every level of a deeply nested chain, silently swallowing errors.

### Why this module exists

This lesson deliberately shows the *problem* before the solution — Promises (next lesson) and \`async\`/\`await\` (the lesson after) were both created specifically to fix callback hell and its error-handling mess. Seeing the pain directly is what makes the improvement genuinely click, rather than just memorizing new syntax for its own sake. You'll still encounter callbacks in real code (many older APIs, and some newer ones like \`addEventListener\`, are callback-based by design) — so recognizing the pattern remains essential, even once you're writing Promise-based code yourself.

> **Key idea:** a callback is just a function passed in to be called later, once async work finishes — the pattern itself is simple, but sequencing multiple async steps with nested callbacks produces "callback hell": deeply nested, hard-to-read code with fragile, easy-to-miss error handling. This specific pain is exactly what the next two lessons' tools were built to solve.`,
    },
    {
      name: "Promises",
      minutes: 11,
      intro: "An object representing a value that isn't ready yet — and the mechanism that fixed callback hell.",
      content: `### A Promise represents an eventual value

\`\`\`js
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id < 0) {
        reject(new Error("Invalid ID"))
        return
      }
      resolve({ id, name: "Ada" })
    }, 1000)
  })
}

const userPromise = fetchUser(1)
console.log(userPromise)   // Promise { <pending> } — immediately, before it resolves
\`\`\`

A **Promise** is an object representing a value that will exist eventually — either successfully (resolved) or unsuccessfully (rejected). Creating one wraps async work in \`new Promise((resolve, reject) => { ... })\`: call \`resolve(value)\` on success, \`reject(error)\` on failure. A Promise is always in exactly one of three states: **pending** (not yet settled), **fulfilled** (resolved successfully), or **rejected** (failed) — and once it settles into fulfilled or rejected, it can never change state again.

### Consuming a Promise: .then and .catch

\`\`\`js
fetchUser(1)
  .then((user) => {
    console.log(user)   // { id: 1, name: "Ada" }
  })
  .catch((error) => {
    console.error(error.message)
  })
\`\`\`

\`.then(onFulfilled)\` registers a callback for when the Promise resolves successfully; \`.catch(onRejected)\` registers one for when it rejects. This already reads more linearly than the nested callback pattern — but the real fix for callback hell is what happens next.

### Chaining: the actual solution to nested callbacks

\`\`\`js
fetchUser(1)
  .then((user) => fetchPosts(user.id))       // returning a Promise here is the key
  .then((posts) => fetchComments(posts[0].id))
  .then((comments) => fetchAuthor(comments[0].authorId))
  .then((author) => console.log(author))
  .catch((error) => console.error("Something failed:", error.message))
\`\`\`

This is the crucial mechanism: **returning a Promise from inside a \`.then()\` callback flattens the chain** — the *next* \`.then()\` automatically waits for that returned Promise to settle before running, rather than nesting deeper. Compare this directly to the previous lesson's four-level-deep callback pyramid: the exact same sequence of dependent async steps, but flat, linear, and readable top to bottom.

### One .catch handles errors from anywhere earlier in the chain

\`\`\`js
fetchUser(-1)                                  // this will reject
  .then((user) => fetchPosts(user.id))          // skipped entirely — the rejection short-circuits the chain
  .then((posts) => fetchComments(posts[0].id))    // also skipped
  .catch((error) => console.error(error.message))  // catches the ORIGINAL rejection from fetchUser
\`\`\`

This directly fixes the previous lesson's messy, per-step error callbacks: a rejection at *any* point in the chain skips straight past every remaining \`.then()\` to the nearest \`.catch()\` — one single place to handle failure, no matter which step actually failed.

### Promise.all: running multiple independent Promises in parallel

\`\`\`js
Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
  .then((users) => {
    console.log(users)   // an array of all three results, in the SAME order they were passed in
  })
  .catch((error) => {
    console.error("At least one failed:", error.message)   // ANY single rejection rejects the whole thing
  })
\`\`\`

When multiple async operations don't depend on each other's results, \`Promise.all\` runs them **concurrently** rather than one after another — directly mirroring the \`Promise.all\`/parallel-fetching concept, if you've seen it applied in a framework context elsewhere. It resolves once *every* Promise has resolved, or rejects immediately the moment *any single one* rejects.

### Promises that are already-settled values

\`\`\`js
const already = Promise.resolve(42)
already.then((value) => console.log(value))   // 42

const alreadyFailed = Promise.reject(new Error("oops"))
alreadyFailed.catch((error) => console.error(error.message))   // "oops"
\`\`\`

\`Promise.resolve\`/\`Promise.reject\` create an already-settled Promise directly — useful for consistently returning a Promise from a function even in a code path that doesn't actually need to do anything asynchronous.

> **Key idea:** a Promise represents an eventual pending/fulfilled/rejected value; returning a Promise from inside \`.then()\` is what flattens a sequence of dependent async steps into one readable chain instead of nested callbacks, and a single \`.catch()\` anywhere downstream catches a rejection from any earlier step in that chain.`,
    },
    {
      name: "async/await",
      minutes: 10,
      intro: "Writing asynchronous code that reads like ordinary, synchronous code — built directly on Promises.",
      content: `### The same chain, rewritten with async/await

\`\`\`js
async function getAuthorOfFirstComment(userId) {
  const user = await fetchUser(userId)
  const posts = await fetchPosts(user.id)
  const comments = await fetchComments(posts[0].id)
  const author = await fetchAuthor(comments[0].authorId)
  return author
}

getAuthorOfFirstComment(1)
  .then((author) => console.log(author))
  .catch((error) => console.error(error.message))
\`\`\`

Compare this directly against the previous lesson's \`.then()\` chain: same sequence of dependent async steps, same underlying Promises — but written to *read* like ordinary, synchronous, top-to-bottom code. \`async\`/\`await\` is not a separate mechanism from Promises; it's syntax that sits directly **on top of** them.

### The two keywords, precisely

- **\`async\`** before a function declaration makes that function **always return a Promise** — even if you \`return\` a plain value inside it, JavaScript automatically wraps it in a resolved Promise.
- **\`await\`** before a Promise **pauses** the async function at that line until the Promise settles, then either gives you the resolved value directly, or (if it rejected) throws that rejection as a regular, catchable error.

\`\`\`js
async function example() {
  return 42
}
example().then((value) => console.log(value))   // 42 — wrapped in a Promise automatically

console.log(example())   // Promise { <pending> } — calling it returns a Promise immediately, not 42 directly
\`\`\`

### await only pauses that one function — not the whole program

\`\`\`js
async function slowTask() {
  console.log("1: starting")
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("3: one second later")
}

slowTask()
console.log("2: this runs immediately, while slowTask is paused at await")
\`\`\`

\`\`\`
1: starting
2: this runs immediately, while slowTask is paused at await
3: one second later
\`\`\`

This is worth being precise about, connecting back to module 1's single-threaded fact: \`await\` does **not** block the entire JavaScript engine while waiting — it only pauses execution *within that specific async function*, letting everything else (other code, other events) continue running normally in the meantime. This will be explained mechanically, in full, in the next module on the event loop.

### Error handling: back to ordinary try/catch

\`\`\`js
async function getUser(id) {
  try {
    const user = await fetchUser(id)
    return user
  } catch (error) {
    console.error("Failed to fetch user:", error.message)
    return null
  }
}
\`\`\`

Because \`await\` turns a rejected Promise into a regular thrown error, ordinary \`try\`/\`catch\` (covered in full in module 10) works directly — no special \`.catch()\` chaining syntax needed. This is a genuine readability win for anyone already comfortable with synchronous error handling.

### await works with Promise.all too

\`\`\`js
async function getAllUsers() {
  const users = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
  return users
}
\`\`\`

\`async\`/\`await\` and Promises aren't competing tools — \`await\` is just a cleaner way to *consume* a Promise, including the combinators like \`Promise.all\` from the previous lesson.

### A common mistake: accidentally serializing independent work

\`\`\`js
// SLOWER than necessary: each await blocks the next line from even starting
async function slow() {
  const a = await fetchUser(1)     // waits ~1s
  const b = await fetchUser(2)      // THEN waits another ~1s — total ~2s
  return [a, b]
}

// FASTER: start both immediately, THEN await both
async function fast() {
  const [a, b] = await Promise.all([fetchUser(1), fetchUser(2)])   // total ~1s
  return [a, b]
}
\`\`\`

Writing sequential \`await\`s for operations that don't actually depend on each other's results is a genuinely common, real inefficiency — exactly the same underlying issue as an accidental request waterfall in any async codebase. \`await\`-ing a \`Promise.all\` (or starting the Promises first, awaiting them after) runs independent work concurrently instead.

> **Key idea:** \`async\`/\`await\` is syntax built directly on top of Promises, not a separate mechanism — \`async\` makes a function always return a Promise, \`await\` pauses just that function (never the whole program) until a Promise settles, and ordinary \`try\`/\`catch\` becomes usable for async errors. Sequential \`await\`s on independent operations is a common, avoidable slowdown — reach for \`Promise.all\` when steps don't actually depend on each other.`,
    },
    {
      name: "Promise Combinators & Robust Async Error Handling",
      minutes: 8,
      intro: "Beyond Promise.all — the other combinators, and patterns for handling failure gracefully.",
      content: `### Promise.allSettled: get every result, success or failure

\`\`\`js
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(-1),   // this one will reject
  fetchUser(3),
])

console.log(results)
// [
//   { status: "fulfilled", value: { id: 1, name: "Ada" } },
//   { status: "rejected", reason: Error: Invalid ID },
//   { status: "fulfilled", value: { id: 3, name: "Ada" } },
// ]
\`\`\`

Recall from the Promises lesson: \`Promise.all\` rejects entirely the moment *any single* Promise rejects, discarding the results of everything else. \`Promise.allSettled\` never short-circuits — it waits for every Promise to settle, one way or another, and gives you a full report of what succeeded and what failed. Use this when partial success is meaningful and you don't want one failure to discard everything else's results.

### Promise.race & Promise.any: two different "first one wins" semantics

\`\`\`js
const result = await Promise.race([
  fetchUser(1),                                             // resolves in ~1s
  new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 500)),  // rejects in 0.5s
])
// throws "timeout" — whichever settles FIRST wins, success or failure
\`\`\`

\`Promise.race\` settles as soon as the **first** Promise settles at all — whether that's a fulfillment or a rejection. A common real use: racing a slow operation against a timeout Promise, so a hung request fails fast instead of waiting forever.

\`\`\`js
const result = await Promise.any([
  fetchUser(-1),   // rejects
  fetchUser(-2),    // also rejects
  fetchUser(3),      // this one succeeds
])
console.log(result)   // { id: 3, name: "Ada" } — the first SUCCESSFUL one, ignoring earlier rejections
\`\`\`

\`Promise.any\` is subtly different: it resolves with the first **successful** result, ignoring rejections along the way — only rejecting itself if *every* Promise rejects. Useful when trying several equivalent sources (mirrors, fallback servers) and you just want whichever one responds successfully first.

### A quick reference

| Combinator | Settles when | Use it when |
|---|---|---|
| \`Promise.all\` | All resolve, or the first rejection | You need every result, and any failure should abort everything |
| \`Promise.allSettled\` | All settle (regardless of outcome) | Partial success is meaningful — you want every result, failures included |
| \`Promise.race\` | The first one settles (success OR failure) | Timeout patterns, "whichever finishes first, win or lose" |
| \`Promise.any\` | The first success, or all reject | Trying redundant sources — first success wins, ignore failures |

### Handling errors at multiple levels, deliberately

\`\`\`js
async function getUserSafely(id) {
  try {
    return await fetchUser(id)
  } catch (error) {
    console.error(\`Failed to fetch user \${id}:\`, error.message)
    return null   // a sensible fallback, rather than letting the error propagate further
  }
}

async function main() {
  const user = await getUserSafely(-1)
  if (!user) {
    console.log("Proceeding without user data")
    return
  }
  console.log(user)
}
\`\`\`

A deliberate, common pattern: catch and handle an error **close to where it happens**, converting it into a sensible fallback value (\`null\`, an empty array, a default) rather than letting every single caller up the chain need its own \`try\`/\`catch\` for the same failure. Not every error needs to propagate all the way up — deciding *where* to actually handle a given failure is a real design choice, not just a mechanical requirement.

### An unhandled rejection is a real, visible problem

\`\`\`js
async function riskyOperation() {
  throw new Error("Something went wrong")
}

riskyOperation()   // no .catch(), and not inside a try/catch — this is an UNHANDLED rejection
\`\`\`

Forgetting to handle a rejected Promise doesn't fail silently forever — both browsers and Node.js log a visible warning (\`UnhandledPromiseRejection\` or similar) precisely so this class of bug doesn't go unnoticed. Treat that warning exactly like an uncaught synchronous error: something that needs a \`.catch()\` or \`try\`/\`catch\` somewhere in the chain.

> **Key idea:** beyond \`Promise.all\`, three more combinators exist for different needs — \`allSettled\` for "give me everything, failures included," \`race\` for "first to settle, win or lose," \`any\` for "first success, ignore failures." Deciding deliberately *where* in an async chain to actually catch and handle an error — rather than reflexively wrapping every single call — is a real design skill, not just boilerplate.`,
    },
  ],
}
