import type { Module } from "../types"

export const jestModule6: Module = {
  id: 6,
  title: "Testing Asynchronous Code",
  status: "upcoming",
  lessons: [
    {
      name: "The Classic Async Testing Mistake",
      minutes: 8,
      intro: "Why a test can pass even when the code it's testing is actually broken — and how to avoid it.",
      content: `### A test that lies: passing when it shouldn't

\`\`\`js
function fetchUser(id) {
  return fetch(\`/api/users/\${id}\`).then((res) => res.json())
}
\`\`\`

\`\`\`js
// THE CLASSIC MISTAKE
test("fetches a user", () => {
  fetchUser(1).then((user) => {
    expect(user.name).toBe("Ada")   // this assertion NEVER actually runs before the test is considered done!
  })
})
// this test PASSES, even if the assertion inside .then() would have FAILED —
// Jest doesn't know to wait for the Promise, and the test function returns immediately
\`\`\`

This is genuinely the single most common mistake when first testing asynchronous code, and it's dangerous precisely because it fails silently — the test reports as **passing**, giving false confidence, even if \`user.name\` is actually wrong. The test function itself (the arrow function passed to \`test\`) returns immediately, before the \`.then()\` callback ever runs — Jest considers the test complete the moment the function returns, with no way to know an assertion is still pending inside an unresolved Promise.

### The fix: return the Promise from the test

\`\`\`js
test("fetches a user", () => {
  return fetchUser(1).then((user) => {
    expect(user.name).toBe("Ada")   // now Jest WAITS for this Promise to settle before finishing the test
  })
})
\`\`\`

Returning the Promise from the test function tells Jest to wait for it to resolve (or reject) before considering the test complete — now, if the assertion inside \`.then()\` actually fails, that rejection propagates through the returned Promise, and the test correctly, genuinely fails.

### The clearer, modern fix: async/await

\`\`\`js
test("fetches a user", async () => {
  const user = await fetchUser(1)
  expect(user.name).toBe("Ada")
})
\`\`\`

Recall this platform's JavaScript course's module 8 \`async\`/\`await\` lesson — marking the test function \`async\` and \`await\`-ing the Promise directly is functionally identical to returning it, but reads as ordinary, sequential code, exactly the readability payoff the JavaScript course's async module emphasized. **This is the standard, correct way to test asynchronous code in Jest today** — the previous two examples exist specifically to show *why* it's necessary, not as equally valid alternatives.

### Confirming the mistake is real: intentionally breaking the assertion

\`\`\`js
// with the classic mistake (no return, no await):
test("demonstrates the bug", () => {
  fetchUser(1).then((user) => {
    expect(user.name).toBe("A COMPLETELY WRONG NAME")   // this should obviously FAIL...
  })
})
// ...and yet this test still reports as PASSING — proving the assertion never actually ran in time
\`\`\`

Genuinely worth trying this once, deliberately, to see it happen: write an assertion that's obviously, deterministically wrong, without \`await\`/\`return\`, and watch the test pass anyway. This is the clearest possible demonstration of why this specific mistake is so dangerous — it doesn't just occasionally miss a bug, it structurally *cannot* catch one, no matter how wrong the code actually is.

### An ESLint rule that catches this automatically

\`\`\`bash
npm install -D eslint-plugin-jest
\`\`\`

Exactly like this platform's React course's module 5 mention of \`eslint-plugin-react-hooks\` catching missing effect dependencies automatically, \`eslint-plugin-jest\`'s \`no-done-callback\`/async-related rules (particularly \`jest/valid-expect\` and similar) can flag a Promise-returning call inside a test that's neither \`await\`-ed nor \`return\`-ed — genuinely worth enabling on any real project, since this mistake is common enough, and dangerous enough (silent false positives), to be worth catching automatically rather than relying purely on developer vigilance.

> **Key idea:** a test function that doesn't \`await\` or \`return\` a Promise finishes before that Promise's \`.then()\` callback ever runs — meaning any assertion inside it silently never executes, and the test passes regardless of whether the code is actually correct. Always \`await\` (preferred) or explicitly \`return\` a Promise in an async test — this is quite possibly the single most important habit in this entire module.`,
    },
    {
      name: "Testing Promises & async/await Thoroughly",
      minutes: 9,
      intro: "The full toolkit for testing both the success and failure paths of asynchronous code.",
      content: `### The standard pattern, for the success case

\`\`\`js
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  return response.json()
}
\`\`\`

\`\`\`js
test("returns the user data on success", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: "Ada" }),
  })

  const user = await fetchUser(1)

  expect(user).toEqual({ id: 1, name: "Ada" })
})
\`\`\`

This directly combines the previous lesson's \`async\`/\`await\` pattern with module 5's global \`fetch\` mocking — the standard, complete shape for testing an async function's happy path.

### Testing that a Promise resolves: the resolves matcher

\`\`\`js
test("resolves with the correct user", () => {
  return expect(fetchUser(1)).resolves.toEqual({ id: 1, name: "Ada" })
})

// or, equivalently, with async/await:
test("resolves with the correct user", async () => {
  await expect(fetchUser(1)).resolves.toEqual({ id: 1, name: "Ada" })
})
\`\`\`

\`.resolves\` unwraps a Promise's resolved value automatically, letting you chain any normal matcher (recall module 2) directly onto it, rather than manually \`await\`-ing first and asserting on the plain value separately. Genuinely just a slightly more compact, expressive alternative to \`const result = await promise; expect(result).toEqual(...)\` — both are equally correct, this is purely a style/readability choice.

### Testing that a Promise rejects: the rejects matcher

\`\`\`js
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  return response.json()
}
\`\`\`

\`\`\`js
test("throws when the response is not ok", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 })

  await expect(fetchUser(999)).rejects.toThrow("HTTP 404")
})
\`\`\`

\`.rejects\` is the direct counterpart to \`.resolves\`, specifically for testing that a Promise-returning function correctly rejects/throws — recall module 2's \`.toThrow\` lesson for synchronous code; \`.rejects.toThrow(...)\` is precisely its asynchronous equivalent, and just as essential to test as the success path (recall module 1's edge-case-testing lesson: an untested error path is exactly the kind of edge case most likely to hide a real bug).

### The equivalent with a manual try/catch — and why rejects is usually cleaner

\`\`\`js
// works, but more verbose than .rejects
test("throws when the response is not ok (manual version)", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 })

  try {
    await fetchUser(999)
    fail("Expected fetchUser to throw, but it did not")   // IMPORTANT: without this, a non-throwing call passes silently!
  } catch (error) {
    expect(error.message).toBe("HTTP 404")
  }
})
\`\`\`

This manual version works, but has a genuine, easy-to-miss trap: if \`fetchUser\` *doesn't* throw (perhaps due to a bug that should be caught), the \`catch\` block simply never runs, and — without an explicit \`fail(...)\` call right after the \`await\` inside \`try\` — the test would pass anyway, exactly the classic mistake from the previous lesson in a new disguise. \`.rejects\` avoids this trap entirely, since it fails automatically if the Promise doesn't actually reject — this is precisely why \`.rejects\`/\`.resolves\` are the preferred, safer pattern over a hand-rolled \`try\`/\`catch\`.

### Testing multiple async calls, sequentially and in parallel

\`\`\`js
test("fetches two users sequentially", async () => {
  const user1 = await fetchUser(1)
  const user2 = await fetchUser(2)
  expect(user1.id).toBe(1)
  expect(user2.id).toBe(2)
})

test("fetches two users in parallel", async () => {
  const [user1, user2] = await Promise.all([fetchUser(1), fetchUser(2)])
  expect(user1.id).toBe(1)
  expect(user2.id).toBe(2)
})
\`\`\`

Recall this platform's JavaScript course's module 8 \`Promise.all\` lesson, and its distinction between genuinely independent vs. dependent async operations — the exact same reasoning applies directly inside a test: if a test needs multiple independent pieces of async data, \`Promise.all\` fetches them concurrently, exactly as it would in real application code, keeping the test itself fast.

> **Key idea:** \`.resolves\`/\`.rejects\` are the preferred way to test a Promise's success/failure outcome — they unwrap the value automatically for chaining any normal matcher, and critically, \`.rejects\` fails automatically if the Promise doesn't actually reject, avoiding the classic \`try\`/\`catch\`-without-a-\`fail()\`-call trap that can silently let a broken, non-throwing function pass.`,
    },
    {
      name: "Testing Callback-Based Async Code",
      minutes: 6,
      intro: "Handling older-style, callback-based APIs that don't return a Promise at all.",
      content: `### The problem: not everything uses Promises

\`\`\`js
function fetchUserCallback(id, callback) {
  setTimeout(() => {
    callback(null, { id, name: "Ada" })   // callback(error, result) — the classic Node.js convention
  }, 100)
}
\`\`\`

Recall this platform's JavaScript course's module 8 opening lesson on callback-based async code, predating Promises — some real-world APIs, particularly older Node.js libraries, still use this pattern directly, with no Promise involved at all. \`async\`/\`await\`/\`.resolves\`/\`.rejects\` (previous lesson) only work with Promises — they don't apply here.

### The done callback: Jest's tool for callback-based async tests

\`\`\`js
test("fetches a user via callback", (done) => {
  fetchUserCallback(1, (error, user) => {
    expect(error).toBeNull()
    expect(user).toEqual({ id: 1, name: "Ada" })
    done()   // tells Jest: "the async work is now genuinely complete, you can finish the test"
  })
})
\`\`\`

Accepting a \`done\` parameter in the test function tells Jest not to consider the test finished until \`done()\` is explicitly called — directly solving the same core problem as the previous lesson's \`await\`/\`return\` requirement, but for a callback-based API instead of a Promise-based one, since there's no Promise here for Jest to automatically wait on.

### The critical, common mistake: forgetting to call done at all

\`\`\`js
test("this test will TIME OUT", (done) => {
  fetchUserCallback(1, (error, user) => {
    expect(user.name).toBe("Ada")
    // forgot to call done()! Jest waits, then eventually fails with a timeout error
  })
})
\`\`\`

If \`done()\` is never called, Jest waits for a default timeout (5 seconds) and then fails the test with a timeout error — not a silent false pass like the previous lesson's classic mistake, but still a real, common source of confusing failures for anyone new to this pattern. Always double check every code path inside the callback actually reaches \`done()\`.

### Handling an error path with done

\`\`\`js
function fetchUserCallback(id, callback) {
  setTimeout(() => {
    if (id < 0) {
      callback(new Error("Invalid ID"))
      return
    }
    callback(null, { id, name: "Ada" })
  }, 100)
}
\`\`\`

\`\`\`js
test("calls back with an error for an invalid id", (done) => {
  fetchUserCallback(-1, (error, user) => {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe("Invalid ID")
    expect(user).toBeUndefined()
    done()
  })
})
\`\`\`

The same \`done()\` pattern applies to testing the callback's error path — recall module 1's edge-case principle, applied here just as directly as to any Promise-based or synchronous code.

### Preferring to convert callback-based code to Promises, when you can

\`\`\`js
const { promisify } = require("util")
const fetchUserAsync = promisify(fetchUserCallback)

test("fetches a user, using promisify to avoid done()", async () => {
  const user = await fetchUserAsync(1)
  expect(user).toEqual({ id: 1, name: "Ada" })
})
\`\`\`

Node.js's built-in \`util.promisify\` (for a function following the standard \`callback(error, result)\` convention) converts a callback-based function into a Promise-returning one — letting the test use the previous lesson's cleaner \`async\`/\`await\` pattern instead of \`done\`. When you control the code being tested, converting to Promises/\`async\`/\`await\` entirely (rather than keeping the callback style) is generally preferable for exactly this reason; \`done\` remains necessary specifically when testing third-party, callback-only code you don't control or can't easily wrap.

> **Key idea:** the \`done\` callback parameter is Jest's tool for callback-based (pre-Promise) async code, telling Jest explicitly when the test's async work is complete — forgetting to call it produces a timeout failure, not a silent false pass. Prefer converting to Promises (via \`util.promisify\` or otherwise) and using \`async\`/\`await\` whenever you have that option; reach for \`done\` specifically for genuinely callback-only APIs.`,
    },
    {
      name: "Testing Error Handling Paths",
      minutes: 7,
      intro: "Making sure your test suite covers what happens when things go wrong, not just when they go right.",
      content: `### Recalling why this matters: module 1's edge-case principle, applied specifically to errors

Module 1 introduced the general principle that a test suite's real value comes from covering edge cases, not just the obvious happy path. For asynchronous code specifically, the most commonly under-tested edge case is the **error path** — what happens when a network request fails, a database call times out, or invalid data is returned. This lesson focuses specifically on testing that path thoroughly.

### Testing a network failure, not just an HTTP error status

\`\`\`js
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`)
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  return response.json()
}
\`\`\`

\`\`\`js
test("throws when the response has a non-ok status", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 })
  await expect(fetchUser(1)).rejects.toThrow("HTTP 500")
})

test("throws when the network request itself fails", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Network request failed"))
  await expect(fetchUser(1)).rejects.toThrow("Network request failed")
})
\`\`\`

These are two genuinely **different** failure modes, worth testing separately: an HTTP error status (the server responded, but with an error) versus a network failure (the request never got a response at all, recall this platform's React course's module 12 discussion of \`fetch\` not rejecting on HTTP errors specifically, only on genuine network failures) — real production code needs to correctly handle both, and a test suite only covering one leaves a genuine gap.

### Testing that a retry mechanism actually retries correctly

\`\`\`js
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url).then((r) => r.json())
    } catch (error) {
      if (attempt === maxRetries) throw error
    }
  }
}
\`\`\`

\`\`\`js
test("retries on failure and eventually succeeds", async () => {
  global.fetch = jest
    .fn()
    .mockRejectedValueOnce(new Error("Timeout"))
    .mockRejectedValueOnce(new Error("Timeout"))
    .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) })

  const result = await fetchWithRetry("/api/data")

  expect(result).toEqual({ success: true })
  expect(global.fetch).toHaveBeenCalledTimes(3)   // confirms it genuinely retried, not just that it eventually worked
})

test("throws after exhausting all retries", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Timeout"))

  await expect(fetchWithRetry("/api/data", 3)).rejects.toThrow("Timeout")
  expect(global.fetch).toHaveBeenCalledTimes(3)
})
\`\`\`

This directly combines module 4's \`mockRejectedValueOnce\` sequencing with module 5's over-mocking guidance — genuinely testing the *retry logic itself*, not just the eventual outcome: \`toHaveBeenCalledTimes(3)\` confirms the function actually retried the expected number of times, which a test only checking the final return value would completely miss.

### Testing error boundaries around user-facing error messages

\`\`\`js
function getUserFriendlyErrorMessage(error) {
  if (error.message.includes("HTTP 404")) return "User not found"
  if (error.message.includes("HTTP 500")) return "Something went wrong on our end"
  return "An unexpected error occurred"
}
\`\`\`

\`\`\`js
describe("getUserFriendlyErrorMessage", () => {
  test("returns a specific message for a 404", () => {
    expect(getUserFriendlyErrorMessage(new Error("HTTP 404"))).toBe("User not found")
  })

  test("returns a specific message for a 500", () => {
    expect(getUserFriendlyErrorMessage(new Error("HTTP 500"))).toBe("Something went wrong on our end")
  })

  test("returns a generic message for an unrecognized error", () => {
    expect(getUserFriendlyErrorMessage(new Error("Something totally unexpected"))).toBe("An unexpected error occurred")
  })
})
\`\`\`

Error-*handling* logic (deciding what to actually show or do when something fails, as distinct from the error-*throwing* logic tested earlier in this lesson) is just as testable, and just as important — this directly connects to this platform's React course's module 12 error-handling patterns, verifying the mapping from a raw technical error to a genuinely user-facing message is correct across every case it's meant to handle.

> **Key idea:** the error path of async code deserves the same thorough testing as the success path — distinguishing between different failure modes (an HTTP error status vs. a genuine network failure), verifying retry logic actually retries the expected number of times (not just that it eventually succeeds), and testing the mapping from raw errors to user-facing messages are all genuinely part of a complete test suite, not optional extras.`,
    },
  ],
}
