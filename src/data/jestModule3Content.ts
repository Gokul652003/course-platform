import type { Module } from "../types"

export const jestModule3: Module = {
  id: 3,
  title: "Setup, Teardown & Test Isolation",
  status: "upcoming",
  lessons: [
    {
      name: "beforeEach & afterEach",
      minutes: 8,
      intro: "Running shared setup and cleanup code around every test, without repeating it manually in each one.",
      content: `### The problem: repeated setup code in every test

\`\`\`js
test("adding an item increases the count", () => {
  const cart = new ShoppingCart()
  cart.addItem({ id: 1, price: 10 })
  expect(cart.itemCount()).toBe(1)
})

test("removing an item decreases the count", () => {
  const cart = new ShoppingCart()   // the SAME setup, repeated
  cart.addItem({ id: 1, price: 10 })
  cart.removeItem(1)
  expect(cart.itemCount()).toBe(0)
})
\`\`\`

Creating a fresh \`ShoppingCart\` and adding the same initial item is repeated in both tests — for two tests this is mildly annoying; for a file with dozens of tests sharing the same setup, it's genuinely repetitive and error-prone to keep synchronized if the setup logic ever needs to change.

### beforeEach: running setup automatically before every test

\`\`\`js
describe("ShoppingCart", () => {
  let cart

  beforeEach(() => {
    cart = new ShoppingCart()
    cart.addItem({ id: 1, price: 10 })
  })

  test("adding an item increases the count", () => {
    cart.addItem({ id: 2, price: 20 })
    expect(cart.itemCount()).toBe(2)
  })

  test("removing an item decreases the count", () => {
    cart.removeItem(1)
    expect(cart.itemCount()).toBe(0)
  })
})
\`\`\`

\`beforeEach(fn)\` runs \`fn\` automatically before **every single test** in its enclosing \`describe\` block (or the whole file, if declared outside any \`describe\`) — the shared setup lives in exactly one place, and each test starts from the identical, freshly-created state without needing to repeat the setup code itself.

### afterEach: cleanup after every test

\`\`\`js
describe("Database", () => {
  let connection

  beforeEach(() => {
    connection = createTestConnection()
  })

  afterEach(() => {
    connection.close()   // ALWAYS runs, even if the test itself failed
  })

  test("saves a record", () => {
    connection.save({ id: 1 })
    expect(connection.count()).toBe(1)
  })
})
\`\`\`

\`afterEach(fn)\` runs after every test, mirroring \`beforeEach\` — genuinely important for anything that needs explicit teardown (closing a connection, clearing a temporary file, resetting a mock, covered in module 4) to avoid one test's leftover state leaking into the next. This directly parallels this platform's React course's module 5 \`useEffect\` cleanup-function lesson — same underlying principle (set something up, guarantee it's torn down), applied here to the test lifecycle instead of a component's lifecycle.

### The critical guarantee: afterEach runs even if the test fails

\`\`\`js
afterEach(() => {
  connection.close()   // this STILL runs, even if the test above threw or an assertion failed
})
\`\`\`

This is genuinely important, not incidental: without this guarantee, a single failing test could leave a resource (an open connection, a temp file) uncleaned, silently corrupting the state for every test that runs afterward — potentially turning one real failure into a confusing cascade of unrelated-looking failures. \`afterEach\` (and \`afterAll\`, covered next lesson) are guaranteed to run regardless of the test's outcome, specifically to prevent this.

### Async setup and teardown

\`\`\`js
beforeEach(async () => {
  connection = await createTestConnection()
})

afterEach(async () => {
  await connection.close()
})
\`\`\`

Recall this platform's JavaScript course's module 8 \`async\`/\`await\` — \`beforeEach\`/\`afterEach\` support an \`async\` function exactly like a test itself does (covered fully in module 6): Jest correctly waits for the returned Promise to resolve before proceeding, whether that's before running the next test or before considering teardown complete.

### Multiple beforeEach/afterEach hooks in the same scope

\`\`\`js
describe("Order processing", () => {
  beforeEach(() => { setupDatabase() })
  beforeEach(() => { setupMockPaymentGateway() })   // runs AFTER the first beforeEach, same order as declared

  // ...tests...
})
\`\`\`

Multiple \`beforeEach\` calls in the same scope all run, in the order they're declared — genuinely useful for keeping unrelated pieces of setup (a database, a mock service) in separate, individually-readable hooks rather than one large, combined function that does everything at once.

> **Key idea:** \`beforeEach\`/\`afterEach\` run automatically around every test in their scope, eliminating repeated setup/teardown code — \`afterEach\` is guaranteed to run even if the test itself fails, which is precisely what prevents one failing test from corrupting the state every subsequent test depends on. Both support \`async\` exactly like a test does.`,
    },
    {
      name: "beforeAll & afterAll",
      minutes: 7,
      intro: "Running expensive setup once for an entire file or block, rather than repeating it before every test.",
      content: `### The problem: beforeEach can be wasteful for genuinely expensive setup

\`\`\`js
describe("API integration", () => {
  let server

  beforeEach(async () => {
    server = await startTestServer()   // if this takes 2 seconds, and there are 20 tests, that's 40 wasted seconds
  })

  afterEach(async () => {
    await server.stop()
  })
})
\`\`\`

Some setup is genuinely expensive — starting a test server, establishing a database connection, seeding a large dataset — and doesn't actually need to happen fresh before *every single test*; it only needs to happen *once*, for the whole file or block.

### beforeAll / afterAll: once per describe block (or file), not once per test

\`\`\`js
describe("API integration", () => {
  let server

  beforeAll(async () => {
    server = await startTestServer()   // runs ONCE, before any test in this block
  })

  afterAll(async () => {
    await server.stop()   // runs ONCE, after every test in this block has finished
  })

  test("GET /users returns a list", async () => {
    const response = await fetch(\`\${server.url}/users\`)
    expect(response.status).toBe(200)
  })

  test("GET /users/1 returns a single user", async () => {
    const response = await fetch(\`\${server.url}/users/1\`)
    expect(response.status).toBe(200)
  })
})
\`\`\`

\`beforeAll\`/\`afterAll\` run exactly once for their enclosing \`describe\` block (or the whole file, if declared at the top level) — the server starts once, both tests reuse it, and it stops once, after both tests finish. This is meaningfully faster than \`beforeEach\`/\`afterEach\` would be for this specific kind of expensive, one-time setup.

### The real tradeoff: beforeAll shares state between tests

\`\`\`js
describe("Counter service", () => {
  let counter

  beforeAll(() => {
    counter = new Counter()   // ONE shared instance across every test below
  })

  test("starts at zero", () => {
    expect(counter.value).toBe(0)
  })

  test("increments correctly", () => {
    counter.increment()
    expect(counter.value).toBe(1)   // this depends on the PREVIOUS test's counter.increment() NOT having run yet!
    // if test ORDER changes, or a new test is inserted between these two, this breaks
  })
})
\`\`\`

This is the real, important tradeoff, worth understanding precisely: because \`counter\` is created only *once* via \`beforeAll\`, every test in this block shares the *same* instance, and any mutation from one test is still visible in the next — the second test here is silently depending on running *after* the first, in that exact order. This is a genuinely fragile pattern: reordering tests, running a single test in isolation (\`jest -t "increments"\`, from module 1), or adding a new test between them can all break in confusing ways.

### The practical rule: beforeEach for test isolation, beforeAll only for genuinely shared, read-only, expensive resources

\`\`\`js
describe("Counter service", () => {
  let counter

  beforeEach(() => {
    counter = new Counter()   // a FRESH instance for every single test — no shared, order-dependent state
  })

  test("starts at zero", () => {
    expect(counter.value).toBe(0)
  })

  test("increments correctly", () => {
    counter.increment()
    expect(counter.value).toBe(1)   // now genuinely independent of any other test's order
  })
})
\`\`\`

The general, strong default is \`beforeEach\` — it guarantees every test starts from clean, independent state, which is precisely what makes tests safe to reorder, run individually, or run in parallel (module 12 covers Jest's actual parallel execution). Reach for \`beforeAll\` specifically for read-only or genuinely expensive setup that every test in the block can safely *share without mutating* — a test server, a static reference dataset — never for state that tests will individually change.

> **Key idea:** \`beforeAll\`/\`afterAll\` run once per block rather than once per test, genuinely valuable for expensive setup — but they share state across every test in that block, which is fine for read-only resources and fragile for anything tests mutate. \`beforeEach\` remains the strong default specifically because it guarantees test isolation; only reach for \`beforeAll\` deliberately, for setup that's both expensive and safely shareable.`,
    },
    {
      name: "Test Isolation & Shared State Pitfalls",
      minutes: 8,
      intro: "Why tests that pass individually but fail when run together are almost always a state-leakage bug.",
      content: `### The symptom: tests pass alone, fail together

\`\`\`bash
npx jest sum.test.js -t "adds negative numbers"   # passes, run alone
npx jest sum.test.js                                # this SAME test now fails, run with the others!
\`\`\`

This is one of the most genuinely confusing categories of test bug, and it has almost always one root cause: **state is leaking between tests** — something set up or mutated in one test is still present, unexpectedly, when a later test runs, even though the two tests appear to have no relationship to each other.

### A classic culprit: module-level mutable state

\`\`\`js
// cache.js
let cache = {}
function setCache(key, value) { cache[key] = value }
function getCache(key) { return cache[key] }
module.exports = { setCache, getCache }
\`\`\`

\`\`\`js
test("stores and retrieves a value", () => {
  setCache("user", "Ada")
  expect(getCache("user")).toBe("Ada")
})

test("cache starts empty for a new key", () => {
  expect(getCache("other")).toBeUndefined()   // passes alone, but what if a PREVIOUS test set "other"?
})
\`\`\`

Because \`cache\` is a plain module-level variable (recall this platform's JavaScript course's module 11: a module's code runs *once*, and every importer shares the *same* instance of its exported state), it persists across every test in the file — one test's \`setCache\` call is still visible to a later, supposedly unrelated test. The fix is usually resetting shared module state explicitly:

\`\`\`js
const { setCache, getCache } = require("./cache")

afterEach(() => {
  // reset any module-level state the module doesn't provide its own reset function for
  jest.resetModules()   // or, better: have the module itself expose a resetCache() for tests to call
})
\`\`\`

### Another classic culprit: mocked global state (covered fully in modules 4-5)

\`\`\`js
test("uses a fixed date", () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-01-01"))
  expect(getCurrentYear()).toBe(2026)
  // forgot to call jest.useRealTimers() — this affects EVERY subsequent test in the file!
})

test("uses the real current date", () => {
  expect(getCurrentYear()).toBe(new Date().getFullYear())   // FAILS — still using the fake 2026 date!
})
\`\`\`

Module 7 covers fake timers in depth — this example previews the same underlying pitfall: mocking something global (the system clock, here) without restoring it afterward leaks that mocked state into every test that runs after it in the same file, exactly like the shared-cache example above.

### The fix, generalized: reset shared state in afterEach, every time

\`\`\`js
afterEach(() => {
  jest.useRealTimers()      // restore real timers, if they were faked
  jest.restoreAllMocks()      // restore any spied-on functions (module 4) to their original implementation
  cache = {}                    // reset any module-level state your own code introduces
})
\`\`\`

The general, reliable habit: whenever a test mutates *anything* that isn't scoped to that test alone (a module-level variable, a global mock, the system clock, a database), pair it with an \`afterEach\` (recall lesson 1) that restores it — treating this exactly like the JavaScript course's module 12 event-listener-cleanup discipline, applied to test state instead of runtime memory.

### Diagnosing a suspected isolation bug

\`\`\`bash
npx jest --runInBand        # runs tests SERIALLY, in file order, rather than in parallel across workers
npx jest -t "the specific failing test name"    # confirms it passes when run completely alone
\`\`\`

If a test fails only when run as part of the full suite, but passes when run alone (\`-t\`), that's close to definitive confirmation of a state-leakage bug — the next step is looking for what shared, unreset state the two (or more) interacting tests have in common, using the patterns above as a checklist of the usual suspects.

> **Key idea:** a test that passes in isolation but fails as part of a larger suite almost always indicates leaked state between tests — module-level mutable variables, un-restored mocks, or a faked system clock are the classic culprits. The reliable fix is a matching \`afterEach\` that resets anything a test mutates outside its own local scope, every time, as a consistent discipline.`,
    },
    {
      name: "Organizing a Real Test File with describe",
      minutes: 6,
      intro: "Combining everything from this module into a well-structured, readable real-world test file.",
      content: `### A complete, well-organized example

\`\`\`js
const ShoppingCart = require("./ShoppingCart")

describe("ShoppingCart", () => {
  let cart

  beforeEach(() => {
    cart = new ShoppingCart()
  })

  describe("adding items", () => {
    test("increases the item count", () => {
      cart.addItem({ id: 1, price: 10 })
      expect(cart.itemCount()).toBe(1)
    })

    test("increases the total price", () => {
      cart.addItem({ id: 1, price: 10 })
      cart.addItem({ id: 2, price: 15 })
      expect(cart.total()).toBe(25)
    })

    test("throws when adding an item with a negative price", () => {
      expect(() => cart.addItem({ id: 1, price: -5 })).toThrow("Price cannot be negative")
    })
  })

  describe("removing items", () => {
    beforeEach(() => {
      cart.addItem({ id: 1, price: 10 })   // shared setup SPECIFIC to this nested describe block
    })

    test("decreases the item count", () => {
      cart.removeItem(1)
      expect(cart.itemCount()).toBe(0)
    })

    test("does nothing when removing a non-existent item", () => {
      cart.removeItem(999)
      expect(cart.itemCount()).toBe(1)   // unaffected
    })
  })
})
\`\`\`

This combines every concept from this module: an outer \`beforeEach\` giving every test a fresh \`cart\` (lesson 1's test-isolation principle), nested \`describe\` blocks (module 1's organizational tool) grouping "adding" and "removing" behavior separately, and — genuinely worth noticing — a *second*, more specific \`beforeEach\` inside the \`"removing items"\` block, adding an item that only *those* tests need as their starting state.

### Nested beforeEach hooks run outer-to-inner

\`\`\`
For a test inside "removing items":
  1. outer beforeEach runs first   -> cart = new ShoppingCart()
  2. inner beforeEach runs second   -> cart.addItem({ id: 1, price: 10 })
  3. THEN the actual test runs
\`\`\`

When \`describe\` blocks nest, their \`beforeEach\` hooks run in order from the outermost block inward — this is precisely what lets the inner \`"removing items"\` block layer its own, more specific setup on top of the outer block's general setup, without repeating \`new ShoppingCart()\` itself.

### The resulting output: readable, hierarchical, and specific

\`\`\`
ShoppingCart
  adding items
    ✓ increases the item count
    ✓ increases the total price
    ✓ throws when adding an item with a negative price
  removing items
    ✓ decreases the item count
    ✓ does nothing when removing a non-existent item
\`\`\`

This directly demonstrates the payoff of module 1's descriptive-naming lesson combined with this module's organizational tools: the test output alone — with no need to open the file — clearly documents exactly what \`ShoppingCart\` is supposed to do, organized by behavior area, in a way that would be genuinely useful even to someone unfamiliar with the codebase.

### A file-organization checklist for a growing test suite

- **One \`describe\` per unit under test** (a class, a module, a function) at the top level.
- **Nested \`describe\` blocks** for distinct behavior areas within that unit, once there are enough tests to benefit from the grouping.
- **\`beforeEach\` for isolation**, as the strong default (lesson 2's guidance) — \`beforeAll\` only for genuinely shared, read-only, expensive setup.
- **Specific, behavior-stating test names** (module 1, lesson 3) — the test output should read like documentation.

> **Key idea:** nested \`describe\` blocks with their own, progressively more specific \`beforeEach\` hooks (running outer-to-inner) is the standard way to organize a real test file — combined with descriptive test names, the resulting output reads as genuine, living documentation of a unit's behavior, not just a pass/fail report.`,
    },
  ],
}
