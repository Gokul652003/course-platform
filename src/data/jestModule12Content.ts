import type { Module } from "../types"

export const jestModule12: Module = {
  id: 12,
  title: "CI, Performance & Capstone",
  status: "upcoming",
  lessons: [
    {
      name: "Running Jest in CI",
      minutes: 8,
      intro: "Making tests an automatic, enforced gate on every change, not just something run manually.",
      content: `### Why CI matters: a test suite only run manually eventually gets skipped

A test suite is genuinely valuable only if it's actually run consistently — recall this course's opening lesson (module 1) on tests catching regressions *later*, automatically. If running tests is a manual, optional step someone has to remember to do before merging code, it will, eventually and predictably, get skipped under time pressure — exactly when a regression is most likely to slip through unnoticed. **CI (Continuous Integration)** solves this by running the test suite automatically, on every single change, with no reliance on anyone remembering to do it manually.

### A GitHub Actions example

\`\`\`yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --coverage
\`\`\`

This runs automatically on every push and every pull request — \`npm ci\` (a stricter, reproducible variant of \`npm install\`, using the exact versions locked in \`package-lock.json\`) installs dependencies, then \`npm test\` (recall module 1's \`"test": "jest"\` script convention) actually runs the suite, with \`--coverage\` additionally generating the report from module 9.

### The exit code is the entire mechanism

\`\`\`bash
npx jest
echo $?   # 0 if every test passed; 1 if ANY test failed, or if a coverage threshold (module 9) wasn't met
\`\`\`

This is worth understanding precisely, since it's the actual mechanism behind every CI integration: \`jest\`'s process exit code is what CI actually checks to decide pass/fail — a non-zero exit code (any failing test, or an unmet coverage threshold from module 9) marks the whole CI run as failed, which is typically what blocks a pull request from being merged at all, directly enforcing "tests must pass" as a hard requirement rather than a suggestion.

### Caching dependencies for faster CI runs

\`\`\`yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"   # caches node_modules between runs, based on package-lock.json's hash
\`\`\`

Reinstalling every dependency from scratch on every single CI run is genuinely wasteful — caching \`node_modules\` (invalidated automatically whenever \`package-lock.json\` actually changes) meaningfully speeds up every subsequent CI run, directly reducing the feedback loop's length, echoing module 1's emphasis on fast feedback, just applied at the CI level instead of local watch mode.

### Running tests against multiple Node.js versions

\`\`\`yaml
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
\`\`\`

For a library or package intended to run across several Node.js versions, a **matrix** build runs the entire test suite once per listed version — genuinely important for catching a version-specific bug (a newer JavaScript feature used that an older, still-supported Node version doesn't support) that testing against only one version would completely miss.

### Requiring passing CI as a branch protection rule

Beyond just running tests, most real projects configure their git hosting platform (GitHub, GitLab) to **require** the CI check to pass before a pull request can be merged at all — this is what actually turns "we have CI" into a genuine, enforced guarantee, rather than a check that runs but whose result nobody's actually required to look at or respect before merging anyway.

> **Key idea:** CI runs the test suite automatically on every change, using the process exit code (module 9's coverage threshold included) to gate whether a change can merge — turning "tests should pass" from a manual reminder into an automatically enforced requirement, which is genuinely the only way a test suite's value reliably compounds over time rather than eventually being skipped under deadline pressure.`,
    },
    {
      name: "Performance, Parallelization & Flaky Tests",
      minutes: 8,
      intro: "Keeping a growing test suite fast, and diagnosing tests that fail unpredictably.",
      content: `### Jest runs test files in parallel, across worker processes, by default

\`\`\`bash
npx jest --maxWorkers=4   # explicitly cap at 4 parallel worker processes
npx jest --maxWorkers=50%   # or a percentage of available CPU cores
\`\`\`

By default, Jest automatically runs different **test files** in parallel across multiple worker processes (roughly one per CPU core) — this is precisely why keeping tests within a single file properly isolated (module 3's core lesson) matters so much: tests *within* one file still run sequentially, but different files genuinely execute concurrently, and any assumption about global, cross-file ordering or shared external state (a real database, a shared port) can break in ways a purely sequential run would never reveal.

### --runInBand: running everything sequentially, in one process

\`\`\`bash
npx jest --runInBand
\`\`\`

Recall module 3's diagnostic suggestion for suspected isolation bugs — \`--runInBand\` disables parallelization entirely, running every test file sequentially in a single process. Genuinely useful for two purposes: diagnosing whether a failure is related to parallel execution at all (a test that fails in parallel but passes with \`--runInBand\` strongly suggests some form of shared, contended external resource), and sometimes actually *faster* in a CI environment with very limited CPU resources, where spinning up multiple worker processes has real overhead that isn't worth paying when there aren't enough actual cores to benefit from it.

### Finding genuinely slow tests

\`\`\`bash
npx jest --verbose   # recall module 11's verbose option — shows each test's individual duration
\`\`\`

\`\`\`
✓ formats currency correctly (2 ms)
✓ fetches user data (1834 ms)   <- genuinely slow, worth investigating
\`\`\`

Reviewing individual test durations periodically (not just watching the whole suite's total time) is worth doing on a real, growing project — a single genuinely slow test (often one that should be mocking something, recall module 4's boundary-mocking principle, but accidentally isn't) can quietly become a meaningful drag on the whole suite's total run time, especially once repeated across dozens of similar tests.

### Flaky tests: the genuine danger of a test that sometimes fails for no real reason

A **flaky test** — one that passes most of the time but occasionally fails without any actual code change — is genuinely more damaging to a team's trust in a test suite than an honestly, consistently failing one. Once a team learns "oh, that test is just flaky, ignore it and re-run," they've effectively stopped trusting *any* of that test's failures, including genuine ones — precisely undermining the entire premise from module 1 that a test suite reliably catches real regressions.

### Common causes of flakiness, mapped directly to earlier modules

- **Real timers instead of fake ones** (module 7) — timing-dependent tests genuinely subject to real machine scheduling variance.
- **Leaked state between tests** (module 3) — a test's outcome depending on execution order or another test's side effects.
- **Un-awaited async code** (module 6, lesson 1) — an assertion that sometimes runs before its data is actually ready, sometimes after.
- **Genuine external dependencies** (module 4's boundary-mocking principle) — a test that actually hits a real, sometimes-slow-or-unavailable network service or database instead of a mock.

Nearly every flakiness case traces back to one of these four specific patterns, each covered in depth in its own earlier module — this lesson's real contribution is naming flakiness as a category worth actively watching for, and pointing back at exactly which earlier techniques prevent each specific cause.

### The discipline: never just "re-run until it passes"

\`\`\`bash
# the tempting, wrong response to a flaky test:
npx jest --testNamePattern="the flaky one" # ...run again... and again... until it happens to pass
\`\`\`

Re-running a flaky test until it happens to pass, rather than actually diagnosing and fixing its root cause, is a genuinely tempting but corrosive habit — it doesn't fix anything, it just delays the next confusing failure, while further eroding trust in the whole suite. Treating flakiness as a real bug in the *test* (not the application code) worth root-causing — using the four patterns above as a checklist — is the only approach that actually prevents it from compounding into a suite nobody trusts anymore.

> **Key idea:** Jest parallelizes across test files by default, which is exactly why proper test isolation (module 3) matters — \`--runInBand\` helps diagnose parallelization-related issues. Flaky tests are more damaging than consistent failures, since they erode trust in the entire suite; nearly every case traces back to real timers, leaked state, un-awaited async code, or an un-mocked external dependency — all directly addressed by earlier modules in this course.`,
    },
    {
      name: "Testing Philosophy: What's Actually Worth Testing",
      minutes: 7,
      intro: "Consolidating the judgment this course has been building toward, module by module.",
      content: `### The recurring theme across this entire course, stated directly

Nearly every module in this course has touched, in its own specific context, the same underlying question: not "how do I write a test," but "is this test actually worth writing, and does it verify something genuinely meaningful?" This lesson pulls those individual threads — module 1's edge-case principle, module 4's boundary-mocking guidance, module 8's snapshot-review discipline, module 9's coverage-isn't-verification lesson — into one consolidated view.

### The testing pyramid, recalled from this platform's React course

\`\`\`
     /\\
    /E2E\\        <- few: complete user/system flows, slowest, highest confidence per test
   /------\\
  /Integr.\\      <- more: several real units interacting together, minimal mocking
 /----------\\
/ Unit tests \\    <- most: individual functions/classes in isolation, fastest
\`------------\`
\`\`\`

Recall this platform's React course's module 13 introduction of this exact model — it applies directly and generally to Jest-based testing of any kind of code, not just React components: many fast, focused unit tests (this course's modules 1-2's core material), a meaningful number of integration tests (module 4's closing lesson on deliberately mocking less), and few, carefully chosen end-to-end tests for the highest-stakes flows specifically.

### High-value tests: what to prioritize writing

- **Business logic with real consequences** — pricing calculations, validation rules, permission checks — code where a bug genuinely, tangibly matters.
- **Edge cases, not just the happy path** — module 1's founding principle, applied consistently: zero, negative, empty, boundary values, error paths (module 6).
- **Code that's changed or broken before** — a bug that happened once, without a regression test added for it, is a bug genuinely likely to happen again; adding a test for the exact scenario that broke is one of the highest-value things you can do with newly-gained information about your own codebase.
- **Public, stable interfaces** — a class's public methods (module 10), a module's actual exports — not private implementation details likely to change during a routine refactor.

### Low-value tests: what to deliberately avoid or deprioritize

- **Testing the framework/library itself** — a test asserting that \`useState\` updates state, or that \`Array.prototype.map\` transforms an array, verifies behavior the library/language itself already guarantees and already tests far more thoroughly than you could.
- **Implementation details likely to change** — recall this platform's React course's module 13 philosophy directly: testing an internal variable's exact name or a specific intermediate function call, rather than genuinely observable behavior.
- **Tests with no real assertions** — module 9's exact example: code that merely *executes* without actually verifying anything meaningful about the result.
- **Over-mocked tests** — module 4's closing lesson: a test so thoroughly mocked that almost no real logic actually runs during it.

### A practical question to ask before writing any given test

**"If this specific test breaks, would that genuinely indicate a real problem worth immediately investigating — or just that some unrelated implementation detail happened to change?"** A test failing for the first reason is providing real, ongoing value, exactly the compounding payoff module 1 opened this course with. A test failing for the second reason is actively harmful — it's the "cry wolf" pattern from this module's flaky-tests lesson, just caused by brittleness instead of genuine non-determinism, but producing the identical corrosive effect on trust in the suite.

### Testing is a tool in service of confidence, not an end in itself

The actual goal was never "have tests" or "hit 100% coverage" (module 9) — it's **confidence that a change didn't break something important**, achieved efficiently, without excessive maintenance burden. A smaller, well-targeted, thoughtfully-written test suite genuinely produces more real confidence — and costs meaningfully less to maintain — than a much larger one full of brittle, low-value, over-mocked, or purely coverage-chasing tests. Every technique this course has covered exists in service of that one underlying, practical goal.

> **Key idea:** this entire course's recurring theme, consolidated: prioritize tests covering real business logic, genuine edge cases, and previously-broken scenarios; actively avoid tests of the framework itself, brittle implementation details, or empty assertions. The actual goal is confidence achieved efficiently — never the test count or coverage percentage as ends in themselves.`,
    },
    {
      name: "Capstone: A Complete, Well-Tested Module",
      minutes: 10,
      intro: "One worked example combining every technique from this course, and where to go from here.",
      content: `### The code under test: a small order-processing module

\`\`\`js
// orderService.js
const paymentGateway = require("./paymentGateway")

class InsufficientStockError extends Error {
  constructor(itemId) {
    super(\`Item \${itemId} is out of stock\`)
    this.name = "InsufficientStockError"
  }
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

async function processOrder(items, inventory) {
  for (const item of items) {
    if ((inventory[item.id] ?? 0) < item.quantity) {
      throw new InsufficientStockError(item.id)
    }
  }

  const total = calculateTotal(items)
  const payment = await paymentGateway.charge(total)

  return { total, paymentId: payment.id, status: "completed" }
}

module.exports = { calculateTotal, processOrder, InsufficientStockError }
\`\`\`

### The complete test suite

\`\`\`js
// orderService.test.js
jest.mock("./paymentGateway")   // module 5 — mocking a genuine external boundary

const paymentGateway = require("./paymentGateway")
const { calculateTotal, processOrder, InsufficientStockError } = require("./orderService")

describe("calculateTotal", () => {
  test.each([
    { items: [{ price: 10, quantity: 2 }], expected: 20, description: "a single item" },
    { items: [{ price: 10, quantity: 2 }, { price: 5, quantity: 3 }], expected: 35, description: "multiple items" },
    { items: [], expected: 0, description: "an empty order" },
  ])("returns $expected for $description", ({ items, expected }) => {
    expect(calculateTotal(items)).toBe(expected)   // module 2 — toBe for a primitive
  })
})

describe("processOrder", () => {
  const inventory = { "item-1": 5, "item-2": 0 }

  beforeEach(() => {
    jest.clearAllMocks()   // module 5 — clean mock state between every test
  })

  test("processes a valid order successfully", async () => {
    paymentGateway.charge.mockResolvedValue({ id: "pay_123" })   // module 4 — mockResolvedValue

    const result = await processOrder([{ id: "item-1", price: 10, quantity: 2 }], inventory)

    expect(result).toEqual({ total: 20, paymentId: "pay_123", status: "completed" })   // module 2 — toEqual
    expect(paymentGateway.charge).toHaveBeenCalledWith(20)   // module 4 — call verification
  })

  test("throws InsufficientStockError for an out-of-stock item", async () => {
    await expect(
      processOrder([{ id: "item-2", price: 10, quantity: 1 }], inventory)
    ).rejects.toThrow(InsufficientStockError)   // module 6 — .rejects, module 2 — specific error type

    expect(paymentGateway.charge).not.toHaveBeenCalled()   // module 4 — confirms payment was correctly SKIPPED
  })

  test("propagates a payment gateway failure", async () => {
    paymentGateway.charge.mockRejectedValue(new Error("Card declined"))   // module 4 — mockRejectedValue

    await expect(
      processOrder([{ id: "item-1", price: 10, quantity: 1 }], inventory)
    ).rejects.toThrow("Card declined")   // module 6 — testing the error path, not just the happy path
  })
})
\`\`\`

### What this draws on, module by module

Nearly every module in this course contributed something directly: descriptive test names and \`describe\` organization (module 1), \`toBe\`/\`toEqual\` chosen precisely per module 2's reference-vs-value guidance, \`beforeEach\`/\`clearAllMocks\` for isolation (module 3), \`jest.mock\`/\`mockResolvedValue\`/\`mockRejectedValue\`/call verification for the genuine external boundary (modules 4-5), \`.rejects\`/\`.toThrow\` for both the success and — just as thoroughly — the error paths (module 6), and \`test.each\` for concisely covering several \`calculateTotal\` cases (module 10). Notice, too, what's *not* mocked: \`calculateTotal\` itself runs for real inside \`processOrder\`'s test, exactly module 4's closing guidance against over-mocking internal logic.

### What a real project would add from here

This capstone deliberately keeps scope tight — a real project would likely add: fake timers (module 7) if \`processOrder\` had any timeout/retry logic, a coverage threshold (module 9) enforced in CI (module 12, lesson 1) for this file specifically, and possibly a custom \`toBeValidMoneyAmount\` matcher (module 11) if similar monetary-value assertions recur elsewhere in the codebase.

### Where to go from here

- **This platform's React course's module 13** — everything in this course applies directly underneath React Testing Library; that module's \`render\`/\`screen\`/\`userEvent\` all run on top of Jest exactly as covered here.
- **Vitest** — a newer, Vite-native test runner with a nearly identical API to Jest (\`describe\`/\`test\`/\`expect\`/\`vi.fn()\` instead of \`jest.fn()\`) — genuinely worth knowing about as an alternative, especially for a project already using Vite (like this platform's React course's setup), since migrating between the two is usually a small, mechanical effort given how closely their APIs mirror each other.
- **End-to-end testing** — Playwright or Cypress, for the small number of highest-stakes, full-system flows this lesson's testing-pyramid discussion placed at the top.

> **Key idea:** a genuinely well-tested module combines nearly every technique from this course working together — precise matchers, proper isolation, deliberate mocking only at real external boundaries, thorough coverage of both success and error paths — exactly the synthesis this course has been building toward, applicable directly underneath any framework (including this platform's React course) built on top of Jest.`,
    },
  ],
}
