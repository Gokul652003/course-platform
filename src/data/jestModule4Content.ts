import type { Module } from "../types"

export const jestModule4: Module = {
  id: 4,
  title: "Mocking Functions",
  status: "upcoming",
  lessons: [
    {
      name: "jest.fn(): Creating a Mock Function",
      minutes: 9,
      intro: "A fake, controllable, observable function — the foundation of everything else in this module.",
      content: `### The problem: verifying a callback was actually called correctly

\`\`\`js
function processOrder(order, onComplete) {
  // ...processing...
  onComplete(order.id)
}
\`\`\`

\`\`\`js
test("calls onComplete with the order id", () => {
  // how do we verify onComplete was actually CALLED, and with the RIGHT argument,
  // without writing a real function and somehow inspecting it after the fact?
})
\`\`\`

Recall this platform's React course's module 13 testing lesson on verifying a callback prop was called correctly — the exact same need applies to any function that accepts a callback: you need a way to both provide a working function *and* inspect, afterward, whether and how it was called.

### jest.fn(): a fake function that remembers everything about how it was called

\`\`\`js
test("calls onComplete with the order id", () => {
  const onComplete = jest.fn()

  processOrder({ id: 42 }, onComplete)

  expect(onComplete).toHaveBeenCalled()
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(onComplete).toHaveBeenCalledWith(42)
})
\`\`\`

\`jest.fn()\` creates a **mock function** — a real, callable function that, every time it's called, records the arguments it received and how many times it's been called, without you writing any of that tracking logic yourself. \`.toHaveBeenCalled()\`, \`.toHaveBeenCalledTimes(n)\`, and \`.toHaveBeenCalledWith(...args)\` are matchers specifically for asserting on a mock function's call history.

### Checking that a mock was NOT called

\`\`\`js
test("does not call onError when the order is valid", () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  processOrder({ id: 42 }, onComplete, onError)

  expect(onError).not.toHaveBeenCalled()   // recall module 2's .not lesson, applied to mock assertions
})
\`\`\`

Recall module 2's \`.not\` lesson — negating a mock-call assertion is exactly as meaningful as asserting a call *did* happen: confirming an error handler was correctly *not* triggered for valid input is a genuinely important part of testing error-handling logic correctly.

### Inspecting every call, in detail

\`\`\`js
test("records every call's arguments", () => {
  const logger = jest.fn()

  logger("first message")
  logger("second message", { level: "warn" })

  expect(logger.mock.calls).toEqual([
    ["first message"],
    ["second message", { level: "warn" }],
  ])

  expect(logger.mock.calls[0][0]).toBe("first message")   // call 0, argument 0
  expect(logger.mock.calls.length).toBe(2)
})
\`\`\`

Every \`jest.fn()\` exposes a \`.mock\` property with the complete raw call history — \`.mock.calls\` is an array of arrays, one per call, each containing that call's arguments in order. The \`toHaveBeenCalledWith\`/\`toHaveBeenCalledTimes\` matchers from the first example are really just convenient, readable wrappers around inspecting this same underlying \`.mock.calls\` data directly.

### toHaveBeenCalledWith and asymmetric matchers, combined

\`\`\`js
test("calls the API with the correct shape, ignoring the timestamp", () => {
  const apiCall = jest.fn()

  logEvent(apiCall, "user_signup")

  expect(apiCall).toHaveBeenCalledWith({
    event: "user_signup",
    timestamp: expect.any(Number),   // recall module 2's expect.any — usable here too
  })
})
\`\`\`

\`toHaveBeenCalledWith\` accepts the exact same asymmetric matchers (\`expect.any\`, \`expect.objectContaining\`) covered in module 2 — genuinely useful when a call's arguments include something non-deterministic (a timestamp, a generated ID) that shouldn't be asserted exactly, while the rest of the call's shape still matters.

### toHaveBeenLastCalledWith and toHaveBeenNthCalledWith

\`\`\`js
test("checking specific calls out of several", () => {
  const logger = jest.fn()
  logger("first")
  logger("second")
  logger("third")

  expect(logger).toHaveBeenLastCalledWith("third")
  expect(logger).toHaveBeenNthCalledWith(2, "second")   // 1-indexed: the 2nd call
})
\`\`\`

For a mock called multiple times where only a *specific* call's arguments matter (the most recent one, or a specific one by position), these two matchers are more precise and readable than manually indexing into \`.mock.calls\`.

> **Key idea:** \`jest.fn()\` creates a callable, fake function that automatically records every call's arguments and count in \`.mock.calls\` — \`toHaveBeenCalled(Times/With)\` and its variants (\`toHaveBeenLastCalledWith\`, \`toHaveBeenNthCalledWith\`) are the readable, standard way to assert on that call history, and they compose directly with module 2's asymmetric matchers for arguments that aren't fully deterministic.`,
    },
    {
      name: "Mock Implementations & Return Values",
      minutes: 8,
      intro: "Controlling exactly what a mock function actually does or returns when called.",
      content: `### mockReturnValue: a fixed return value on every call

\`\`\`js
test("uses a mocked return value", () => {
  const getDiscount = jest.fn()
  getDiscount.mockReturnValue(0.1)

  expect(getDiscount()).toBe(0.1)
  expect(getDiscount("any", "arguments", "ignored")).toBe(0.1)   // ignores arguments, always returns 0.1
})
\`\`\`

\`.mockReturnValue(value)\` makes the mock return that fixed \`value\` every time it's called, regardless of what arguments it receives — genuinely useful for a dependency you want to stand in for with a simple, constant, predictable value.

### mockReturnValueOnce: different values across successive calls

\`\`\`js
test("returns different values on successive calls", () => {
  const fetchStatus = jest.fn()
  fetchStatus
    .mockReturnValueOnce("pending")
    .mockReturnValueOnce("pending")
    .mockReturnValueOnce("completed")

  expect(fetchStatus()).toBe("pending")
  expect(fetchStatus()).toBe("pending")
  expect(fetchStatus()).toBe("completed")
  expect(fetchStatus()).toBeUndefined()   // once the queued "Once" values run out, falls back to undefined
})
\`\`\`

Chained \`.mockReturnValueOnce(...)\` calls queue up values consumed one at a time, in order — genuinely useful for simulating a value that changes across repeated calls (like a status that transitions from pending to completed), which a single \`.mockReturnValue\` can't express.

### mockImplementation: full control over the mock's behavior

\`\`\`js
test("mockImplementation runs actual logic", () => {
  const add = jest.fn((a, b) => a + b)

  expect(add(2, 3)).toBe(5)
  expect(add).toHaveBeenCalledWith(2, 3)   // still tracks calls, exactly like a plain jest.fn()
})
\`\`\`

Passing a real function directly to \`jest.fn(implementation)\` (or calling \`.mockImplementation(fn)\` afterward) gives the mock genuine logic — it still tracks every call exactly like a plain \`jest.fn()\`, but now also actually *computes* a result based on its arguments, rather than always returning one fixed value.

### Mocking an async function: mockResolvedValue / mockRejectedValue

\`\`\`js
test("mocks a resolved promise", async () => {
  const fetchUser = jest.fn().mockResolvedValue({ id: 1, name: "Ada" })

  const user = await fetchUser()
  expect(user).toEqual({ id: 1, name: "Ada" })
})

test("mocks a rejected promise", async () => {
  const fetchUser = jest.fn().mockRejectedValue(new Error("Network error"))

  await expect(fetchUser()).rejects.toThrow("Network error")   // covered fully in module 6
})
\`\`\`

\`.mockResolvedValue(value)\`/\`.mockRejectedValue(error)\` are shorthand for \`.mockImplementation(() => Promise.resolve(value))\`/\`.mockImplementation(() => Promise.reject(error))\` — recall this platform's JavaScript course's module 8 Promises lesson, directly applicable here: these are the standard way to mock any function that returns a Promise, which in practice means the overwhelming majority of real-world mocked dependencies (an API client, a database call).

### Combining implementations to simulate a realistic sequence

\`\`\`js
test("simulates a retry that eventually succeeds", async () => {
  const fetchData = jest
    .fn()
    .mockRejectedValueOnce(new Error("Timeout"))
    .mockRejectedValueOnce(new Error("Timeout"))
    .mockResolvedValueOnce({ data: "success" })

  await expect(fetchData()).rejects.toThrow("Timeout")
  await expect(fetchData()).rejects.toThrow("Timeout")
  await expect(fetchData()).resolves.toEqual({ data: "success" })
})
\`\`\`

Combining \`Once\`-suffixed variants lets you simulate a genuinely realistic sequence of behavior across repeated calls — here, a dependency that fails twice before eventually succeeding, useful for testing retry logic (recall this platform's React course's module 12 React Query retry coverage) without needing a real, actually-flaky dependency to test against.

> **Key idea:** \`mockReturnValue\`/\`mockImplementation\` control what a mock does when called, with \`Once\`-suffixed variants queuing up different behavior for successive calls — \`mockResolvedValue\`/\`mockRejectedValue\` are the standard shorthand for mocking async dependencies, covering the majority of real-world mocking needs like API clients and database calls.`,
    },
    {
      name: "jest.spyOn: Watching Without Replacing",
      minutes: 8,
      intro: "Observing calls to a real, existing function or object method, while optionally keeping its actual behavior.",
      content: `### The problem: sometimes you need to watch a REAL function, not replace it entirely

\`\`\`js
const analytics = {
  track(event) {
    // sends a real network request
    fetch("/api/track", { method: "POST", body: JSON.stringify({ event }) })
  },
}

function handleSignup(analytics) {
  analytics.track("user_signup")
  // ...other real signup logic...
}
\`\`\`

Testing \`handleSignup\`, you want to verify \`analytics.track\` was called correctly — but you don't necessarily want to replace the *entire* \`analytics\` object with a fresh mock, especially if other methods on it are also used and you'd rather keep the real object intact except for this one method.

### jest.spyOn: wrapping an existing method with mock tracking

\`\`\`js
test("calls analytics.track on signup", () => {
  const trackSpy = jest.spyOn(analytics, "track")
  trackSpy.mockImplementation(() => {})   // prevent the REAL implementation (a network call) from running

  handleSignup(analytics)

  expect(trackSpy).toHaveBeenCalledWith("user_signup")

  trackSpy.mockRestore()   // put the ORIGINAL, real analytics.track back afterward
})
\`\`\`

\`jest.spyOn(object, methodName)\` replaces \`object[methodName]\` with a mock function — but critically, that mock **wraps the original implementation by default**, unless you explicitly override it (as \`.mockImplementation(() => {})\` does here, specifically to prevent an actual network request during a test). The spy still exposes the exact same \`.mock.calls\`/\`toHaveBeenCalledWith\` tracking as a plain \`jest.fn()\`.

### Spying while still calling through to the real implementation

\`\`\`js
test("spy calls through to the real implementation by default", () => {
  const mathUtils = { double: (n) => n * 2 }
  const spy = jest.spyOn(mathUtils, "double")   // no mockImplementation override — real logic still runs

  const result = mathUtils.double(5)

  expect(result).toBe(10)               // the REAL implementation actually ran
  expect(spy).toHaveBeenCalledWith(5)     // AND it was tracked, exactly like a mock
})
\`\`\`

Without an explicit \`.mockImplementation()\` override, a spy calls through to the real, original method — genuinely useful when you want to verify a method was called correctly *and* let its actual behavior run normally, rather than replacing it entirely. This is the key distinction from \`jest.fn()\`: a spy starts from real behavior and optionally overrides it; a plain \`jest.fn()\` starts from nothing.

### Always restoring a spy afterward

\`\`\`js
describe("signup analytics", () => {
  let trackSpy

  beforeEach(() => {
    trackSpy = jest.spyOn(analytics, "track").mockImplementation(() => {})
  })

  afterEach(() => {
    trackSpy.mockRestore()   // recall module 3's isolation lesson — always undo global/shared mutations
  })

  test("tracks signup", () => {
    handleSignup(analytics)
    expect(trackSpy).toHaveBeenCalledWith("user_signup")
  })
})
\`\`\`

This directly applies module 3's test-isolation lesson: \`jest.spyOn\` mutates a *real, shared* object (\`analytics\`, here) — without \`.mockRestore()\` in a matching \`afterEach\`, that mutation leaks into every subsequent test, exactly the kind of shared-state bug module 3 warned about. \`jest.restoreAllMocks()\` (mentioned briefly in module 3) restores *every* active spy at once, a common, convenient shortcut in a global \`afterEach\`.

### Spying on console methods: a common, practical example

\`\`\`js
test("logs a warning for a deprecated option", () => {
  const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {})

  configureWithDeprecatedOption()

  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("deprecated"))

  consoleSpy.mockRestore()
})
\`\`\`

A genuinely common, practical use: verifying code correctly calls \`console.warn\`/\`console.error\` under specific conditions (recall this platform's JavaScript course's module 10 debugging lesson on \`console\` methods), while suppressing the actual console output during the test run itself, keeping test output clean.

> **Key idea:** \`jest.spyOn(object, method)\` wraps a real, existing method with mock tracking — calling through to the real implementation by default, unless explicitly overridden with \`.mockImplementation()\` — the right tool when you need to observe or selectively override one method on an object you don't want to fully replace. Because it mutates a real, shared object, always pair it with \`.mockRestore()\` in an \`afterEach\`.`,
    },
    {
      name: "Choosing What (and What Not) to Mock",
      minutes: 7,
      intro: "Building judgment for when mocking genuinely helps a test, and when it quietly makes tests worse.",
      content: `### Mock at the boundary, not the thing you're actually testing

\`\`\`js
// testing formatCurrency — a pure function, no external dependencies
function formatCurrency(cents) {
  return \`$\${(cents / 100).toFixed(2)}\`
}

test("formats correctly", () => {
  expect(formatCurrency(500)).toBe("$5.00")   // NO mocking needed at all — it's pure, just call it directly
})
\`\`\`

\`\`\`js
// testing a function that depends on an EXTERNAL boundary — a network call
async function fetchUserName(userId) {
  const response = await fetch(\`/api/users/\${userId}\`)
  const user = await response.json()
  return user.name
}

test("returns the fetched user's name", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ name: "Ada" }),
  })

  const name = await fetchUserName(1)
  expect(name).toBe("Ada")
})
\`\`\`

This is the core principle worth internalizing: mock at the **boundary** of your system — a network request, a database call, the filesystem, the current time (module 7), a third-party service — never the function or unit you're actually trying to test. \`formatCurrency\` needs zero mocking, since it has no external dependencies at all (recall this platform's JavaScript course's pure-function discussions); \`fetchUserName\` needs \`fetch\` mocked specifically because a real test genuinely shouldn't depend on network access.

### Over-mocking: a real, common anti-pattern

\`\`\`js
// AVOID: mocking so much that the test barely exercises any real logic at all
test("processes an order", () => {
  const validateOrder = jest.fn().mockReturnValue(true)
  const calculateTotal = jest.fn().mockReturnValue(100)
  const applyDiscount = jest.fn().mockReturnValue(90)
  const saveOrder = jest.fn()

  processOrder({ validateOrder, calculateTotal, applyDiscount, saveOrder })

  expect(saveOrder).toHaveBeenCalled()
  // this test barely verifies ANYTHING about processOrder's actual real logic —
  // nearly everything it touches has been replaced with a fake
})
\`\`\`

If a test mocks so many of a function's actual dependencies that almost nothing *real* executes during the test, it stops providing much genuine confidence — it mostly just verifies that mocked functions get called in some order, not that the actual business logic (validation, discount calculation, the real interaction between these pieces) works correctly. This is a genuinely common trap: reaching for \`jest.fn()\` reflexively for *everything* a function touches, rather than only the genuine external boundaries.

### A practical decision guide

| The dependency is... | Mock it? |
|---|---|
| A pure, deterministic function with no external effects | No — call it directly |
| A network request, database call, or filesystem access | Yes — these are genuine boundaries; real tests shouldn't depend on them |
| The current date/time, or randomness | Yes — needed for deterministic, repeatable tests (module 7 covers time specifically) |
| Another function *within the same unit* you're testing | Usually no — mocking it hides whether the real interaction between them actually works |
| A slow or flaky third-party service | Yes — for the same reason as network requests generally |

### Integration tests: deliberately mocking less

\`\`\`js
test("processOrder correctly validates, discounts, and saves — end to end", async () => {
  const saveOrder = jest.fn()   // still mock the actual database write — a genuine boundary

  await processOrder({ id: 1, items: [...], saveOrder })
  // validateOrder, calculateTotal, applyDiscount all run for REAL here — genuinely exercising the logic

  expect(saveOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 90 }))
})
\`\`\`

Recall this platform's React course's module 13 testing-pyramid lesson — a genuine **integration test** deliberately mocks *less*, letting real internal logic actually run and interact, only replacing genuine external boundaries (like \`saveOrder\`'s database write here). This provides meaningfully more real confidence than the over-mocked example above, at the cost of being somewhat less isolated — a real, worthwhile tradeoff to make deliberately, not accidentally.

> **Key idea:** mock at genuine external boundaries — network, database, filesystem, time, randomness — never the actual logic you're trying to verify works correctly. Over-mocking a test's own internal dependencies produces a test that mostly checks mocked functions were called, providing far less real confidence than deliberately letting internal logic run for real, as a genuine integration test does.`,
    },
  ],
}
