import type { Module } from "../types"

export const jestModule7: Module = {
  id: 7,
  title: "Testing Timers",
  status: "upcoming",
  lessons: [
    {
      name: "Why Real Timers Make Tests Slow and Flaky",
      minutes: 7,
      intro: "The problem fake timers exist to solve, seen concretely first.",
      content: `### Testing code that uses setTimeout, the naive way

\`\`\`js
function delayedGreeting(callback) {
  setTimeout(() => {
    callback("Hello!")
  }, 3000)
}
\`\`\`

\`\`\`js
test("calls back with a greeting after 3 seconds", (done) => {
  delayedGreeting((message) => {
    expect(message).toBe("Hello!")
    done()
  })
})
// this test PASSES, but takes a REAL 3 seconds to run — using module 6's done() pattern
\`\`\`

This test is correct, using module 6's \`done\` pattern for callback-based async code — but it genuinely takes 3 real seconds to complete, because \`setTimeout\` actually waits 3 real seconds before firing. Multiply this across a test suite with dozens of timer-dependent tests, each waiting anywhere from milliseconds to minutes, and the *entire suite* becomes painfully slow to run — directly undermining module 1's point about tests needing a fast feedback loop to be genuinely useful day to day.

### The problem compounds for genuinely long delays

\`\`\`js
function remindUserAfterOneHour(callback) {
  setTimeout(callback, 60 * 60 * 1000)   // one real hour
}
\`\`\`

A real-world reminder feature, a session-timeout warning, a long polling interval — testing any of these by actually waiting for the real delay isn't just slow, it's genuinely impractical. Nobody writes (or should write) a test that waits a literal hour to complete.

### A second, subtler problem: flakiness

\`\`\`js
test("debounced search fires after 300ms of inactivity", (done) => {
  const search = jest.fn()
  const debouncedSearch = debounce(search, 300)

  debouncedSearch("query")

  setTimeout(() => {
    expect(search).toHaveBeenCalledWith("query")
    done()
  }, 310)   // "close enough" to 300ms — but on a genuinely slow CI machine, is 10ms of margin always enough?
})
\`\`\`

Beyond raw slowness, tests relying on real timers are prone to **flakiness** — intermittent, non-deterministic failures — because they depend on the actual wall-clock timing of the machine running them. A CI runner under heavy load might take slightly longer than expected to schedule the callback, causing a test with a tight timing margin to fail unpredictably, entirely unrelated to whether the code being tested actually has a bug. A flaky test is genuinely worse than a slow one — it erodes trust in the whole suite, since a failure stops reliably meaning "something is actually broken."

### The solution, previewed: fake timers

\`\`\`js
test("calls back with a greeting — INSTANTLY, using fake timers", () => {
  jest.useFakeTimers()
  const callback = jest.fn()

  delayedGreeting(callback)
  jest.advanceTimersByTime(3000)   // simulates 3 seconds passing, INSTANTLY, with no real waiting at all

  expect(callback).toHaveBeenCalledWith("Hello!")
})
\`\`\`

This test verifies the exact same behavior as the very first example in this lesson, but runs in milliseconds, not 3 real seconds, and has zero dependency on actual wall-clock timing — no flakiness possible from scheduling variance. The rest of this module covers exactly how this works and how to use it correctly; this lesson exists specifically to make the *motivation* concrete before diving into the mechanics.

> **Key idea:** tests that rely on real timers are both slow (multiplying real wait time across every timer-dependent test in a suite) and genuinely flaky (subject to real-world scheduling variance on a loaded machine) — fake timers, covered in the rest of this module, solve both problems by letting a test simulate time passing instantly and deterministically.`,
    },
    {
      name: "Fake Timers: The Basics",
      minutes: 9,
      intro: "Taking manual, deterministic control over setTimeout, setInterval, and the system clock.",
      content: `### Enabling fake timers

\`\`\`js
beforeEach(() => {
  jest.useFakeTimers()   // from this point on, setTimeout/setInterval do NOT actually schedule real callbacks
})

afterEach(() => {
  jest.useRealTimers()   // recall module 3's isolation lesson — always restore, so OTHER tests aren't affected
})
\`\`\`

\`jest.useFakeTimers()\` replaces the global \`setTimeout\`, \`setInterval\`, \`setImmediate\`, and \`Date\` with Jest's own, fully controllable fake implementations — calling \`setTimeout(fn, 3000)\` no longer waits 3 real seconds; it registers \`fn\` to run once the *fake* clock is advanced far enough, entirely under the test's explicit control. Recall module 3's test-isolation lesson directly: always pair this with \`jest.useRealTimers()\` in \`afterEach\`, otherwise fake timers leak into every subsequent test in the file, exactly the shared-state bug module 3 warned about.

### advanceTimersByTime: moving the fake clock forward explicitly

\`\`\`js
test("calls the callback after exactly 3 seconds", () => {
  const callback = jest.fn()
  setTimeout(callback, 3000)

  expect(callback).not.toHaveBeenCalled()   // hasn't fired yet — no time has passed

  jest.advanceTimersByTime(2999)
  expect(callback).not.toHaveBeenCalled()     // still hasn't fired — one millisecond short

  jest.advanceTimersByTime(1)
  expect(callback).toHaveBeenCalledTimes(1)     // NOW it fires, exactly at the 3000ms mark
})
\`\`\`

\`jest.advanceTimersByTime(ms)\` moves the fake clock forward by exactly \`ms\` milliseconds, firing any timer callbacks scheduled to run within that window — instantly, with no actual waiting. This lets you assert precisely *when* a timer fires, down to the exact millisecond, which is genuinely more precise than a real-timer test could ever reliably verify (recall the previous lesson's flakiness discussion).

### runAllTimers: fast-forwarding through every pending timer

\`\`\`js
test("eventually calls back, regardless of the exact delay", () => {
  const callback = jest.fn()
  setTimeout(callback, 10000)   // some genuinely long delay

  jest.runAllTimers()   // fires EVERY pending timer immediately, however long its delay actually was

  expect(callback).toHaveBeenCalled()
})
\`\`\`

\`jest.runAllTimers()\` is a convenient shortcut when the *exact* timing doesn't matter to the test, only that the callback eventually fires — it runs every currently pending timer to completion instantly. Worth a genuine caution: for a \`setInterval\` that never stops itself, \`runAllTimers()\` would loop forever (there's always another pending "next" interval fire) — Jest actually detects this specific case and throws an error after a large number of iterations, but it's a real footgun worth being aware of; \`advanceTimersByTime\` with a specific, bounded value is the safer default for interval-based code.

### Testing setInterval specifically

\`\`\`js
function startPolling(callback) {
  return setInterval(callback, 1000)
}
\`\`\`

\`\`\`js
test("polls every second", () => {
  const callback = jest.fn()
  startPolling(callback)

  jest.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(2)

  jest.advanceTimersByTime(3000)   // three MORE intervals
  expect(callback).toHaveBeenCalledTimes(5)
})
\`\`\`

Advancing the fake clock by a multiple of the interval correctly fires the callback that many additional times — this precise, deterministic counting is exactly what makes fake timers meaningfully better than a real-timer test for verifying interval-based logic behaves correctly over an extended, simulated period.

### Faking (or not faking) the system clock specifically

\`\`\`js
test("uses the current year", () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-06-15"))

  expect(getCurrentYear()).toBe(2026)

  jest.useRealTimers()
})
\`\`\`

Recall module 4's decision-guide lesson explicitly listing "the current date/time" as a genuine boundary worth mocking, for deterministic tests — \`jest.useFakeTimers()\` combined with \`.setSystemTime(...)\` is the standard, Jest-native way to do exactly that: freeze \`Date.now()\`/\`new Date()\` at a fixed, known point, so any date-dependent logic becomes fully deterministic and testable, rather than depending on whatever the actual date happens to be whenever the test runs.

> **Key idea:** \`jest.useFakeTimers()\` replaces real timers with fully controllable fake ones — \`advanceTimersByTime(ms)\` moves the clock forward precisely, and \`runAllTimers()\` fast-forwards through everything pending (with a real footgun for never-ending intervals). \`.setSystemTime(...)\` additionally freezes the current date/time for fully deterministic, date-dependent tests — always paired with \`jest.useRealTimers()\` afterward to avoid leaking into other tests.`,
    },
    {
      name: "Testing Debounce & Throttle with Fake Timers",
      minutes: 8,
      intro: "A genuinely practical, complete example combining everything from this module.",
      content: `### The code under test: a debounce utility

\`\`\`js
function debounce(fn, delayMs) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
\`\`\`

Recall this platform's React course's module 7 \`useDebounce\` hook — this is the plain-JavaScript utility function version of that same idea: delay calling \`fn\` until \`delayMs\` has passed with no further calls, restarting the delay on every new call. Genuinely worth testing thoroughly, since debounce logic has several distinct, easy-to-get-wrong behaviors.

### Testing that debounce delays the call correctly

\`\`\`js
describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test("does not call the function immediately", () => {
    const fn = jest.fn()
    const debounced = debounce(fn, 300)

    debounced()

    expect(fn).not.toHaveBeenCalled()
  })

  test("calls the function after the delay has elapsed", () => {
    const fn = jest.fn()
    const debounced = debounce(fn, 300)

    debounced()
    jest.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
\`\`\`

This directly combines the previous lesson's \`advanceTimersByTime\` with module 3's \`beforeEach\`/\`afterEach\` isolation pattern — two clear, individually-named tests (recall module 1's descriptive-naming lesson) each verifying one specific, distinct behavior.

### Testing debounce's actual defining behavior: restarting on repeated calls

\`\`\`js
test("resets the delay on each new call, only firing once for a rapid burst", () => {
  const fn = jest.fn()
  const debounced = debounce(fn, 300)

  debounced()
  jest.advanceTimersByTime(200)   // not yet 300ms

  debounced()   // called AGAIN before the first delay finished — this should RESET the timer
  jest.advanceTimersByTime(200)   // now 400ms total has passed, but only 200ms since the SECOND call

  expect(fn).not.toHaveBeenCalled()   // still shouldn't have fired — the second call reset the clock

  jest.advanceTimersByTime(100)   // now a full 300ms has passed since the SECOND call specifically
  expect(fn).toHaveBeenCalledTimes(1)   // fires exactly once, not twice, despite two debounced() calls
})
\`\`\`

This is genuinely the most important test in this whole example — it verifies the *actual defining characteristic* of debounce (repeated rapid calls collapse into a single, delayed call), not just that a delay happens at all. Writing out the precise sequence of \`advanceTimersByTime\` calls, tracking exactly how much simulated time has passed relative to each \`debounced()\` call, is exactly the kind of precise, deterministic verification real timers could never reliably provide (recall lesson 1's flakiness discussion).

### Testing that the function receives the correct, most recent arguments

\`\`\`js
test("calls the function with the arguments from the LAST call", () => {
  const fn = jest.fn()
  const debounced = debounce(fn, 300)

  debounced("first")
  debounced("second")
  debounced("third")

  jest.advanceTimersByTime(300)

  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith("third")   // NOT "first" — debounce should use the LATEST call's arguments
})
\`\`\`

This combines module 4's \`toHaveBeenCalledWith\` with this module's fake-timer control to verify a second genuinely important, easy-to-get-wrong behavior: which specific call's arguments actually get used once the debounced function finally fires.

### Testing clearTimeout cleanup: no lingering calls after test completion

\`\`\`js
test("does not call fn if the component/consumer stops calling debounced entirely", () => {
  const fn = jest.fn()
  const debounced = debounce(fn, 300)

  debounced()
  jest.advanceTimersByTime(300)
  fn.mockClear()   // recall module 5's mock-lifecycle lesson — clear the FIRST call's record

  jest.advanceTimersByTime(10000)   // a long time passes with NO further debounced() calls

  expect(fn).not.toHaveBeenCalled()   // confirms no unexpected, lingering repeated calls
})
\`\`\`

A final, worthwhile edge case (recall module 1's principle once more): confirming the debounced function doesn't keep firing repeatedly or unexpectedly once its one legitimate call has already happened — genuinely the kind of test that would only ever occur to someone actively thinking about edge cases, not just the primary intended behavior.

> **Key idea:** this module's full toolkit — \`useFakeTimers\`, \`advanceTimersByTime\`, paired with module 3's \`beforeEach\`/\`afterEach\` isolation and module 4's call-tracking matchers — combines directly to thoroughly test something like debounce: not just "it eventually calls the function," but its precise, defining behaviors (resetting on repeated calls, using only the latest arguments) that a real-timer test could never verify with this level of deterministic precision.`,
    },
  ],
}
