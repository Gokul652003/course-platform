import type { Module } from "../types"

export const jestModule1: Module = {
  id: 1,
  title: "Getting Started with Jest",
  status: "in_progress",
  lessons: [
    {
      name: "What is Jest, and Why Test at All?",
      minutes: 8,
      intro: "The problem automated testing solves, and where Jest fits.",
      content: `### The problem: manually checking your code doesn't scale

When you write a function, you naturally check it works — running it once in a console, or clicking through the app in a browser. This is fine for the moment you write it. The problem is *later*: six months from now, someone (possibly you) changes a completely unrelated piece of code, and that manual check never happens again — nothing tells you whether the original function still works correctly. This is precisely the problem automated tests solve: a test, once written, can be re-run in seconds, forever, catching exactly this kind of regression the instant it happens.

### What Jest actually is

**Jest** is a JavaScript testing framework — it gives you three things bundled together: a **test runner** (finds and executes your test files), an **assertion library** (\`expect(...).toBe(...)\` and similar, for stating what should be true), and built-in **mocking** utilities (covered in depth in modules 4-5). Originally built by Facebook for testing React apps, Jest today is a general-purpose JavaScript/TypeScript test framework, used across backend Node.js code, plain utility functions, and frontend frameworks alike — nothing about it is React-specific at its core.

### A minimal first look

\`\`\`js
// sum.js
function sum(a, b) {
  return a + b
}
module.exports = sum
\`\`\`

\`\`\`js
// sum.test.js
const sum = require("./sum")

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3)
})
\`\`\`

\`\`\`bash
npx jest
\`\`\`

\`test(name, fn)\` declares one test; \`expect(actual).toBe(expected)\` is an **assertion** — a statement of what should be true. Running \`jest\` finds every file matching a test naming convention (covered in the next lesson), runs each one, and reports which passed and which failed, with a clear diff for any mismatch.

### The value compounds over time, not immediately

Writing this test doesn't feel especially valuable the moment you write it — \`sum\` obviously works, you just watched it pass. The actual payoff arrives later: if someone changes \`sum\` to accidentally return \`a - b\`, this exact test immediately fails, with a clear message pointing at precisely what broke — catching the bug in seconds, in your editor or CI, rather than in production, reported by a confused user. This delayed, compounding payoff is genuinely the entire case for automated testing — it's an investment against future changes, not a way to verify today's code is correct (you likely already know that).

### Why Jest specifically, among several options

Jest's defining trait, especially historically, is being extremely close to **zero-configuration** — install it, write a \`.test.js\` file, run \`jest\`, and it works, with sensible defaults for test discovery, assertions, mocking, and coverage all bundled together, rather than requiring you to separately choose and wire together a test runner, an assertion library, and a mocking library yourself. This "batteries included" design is precisely why it became, for years, the dominant choice for JavaScript testing — module 12 covers how it compares to newer alternatives like Vitest.

> **Key idea:** an automated test's value isn't in confirming code works *today* — it's in catching a regression *later*, automatically, the moment an unrelated change breaks something. Jest bundles a test runner, assertion library, and mocking utilities into one near-zero-config package, which is exactly why it became the dominant default for JavaScript testing.`,
    },
    {
      name: "Installing Jest & Running Your First Test",
      minutes: 8,
      intro: "Getting Jest set up in a real project, and the file conventions it looks for automatically.",
      content: `### Installing Jest

\`\`\`bash
npm install -D jest
\`\`\`

\`-D\` (\`--save-dev\`) installs it as a **development** dependency — Jest is a tool you run while developing and in CI, never something your actual shipped application code depends on at runtime.

### The npm script convention

\`\`\`json
{
  "scripts": {
    "test": "jest"
  }
}
\`\`\`

\`\`\`bash
npm test
\`\`\`

Wiring \`jest\` up as the \`test\` script is the near-universal convention — \`npm test\` is what most tooling (including CI systems, covered in module 12) expects to run by default for any Node.js project, regardless of which test framework is actually being used underneath.

### How Jest finds your test files

\`\`\`
src/
  sum.js
  sum.test.js          <- matches: *.test.js
  utils/
    format.js
    format.spec.js       <- matches: *.spec.js
  __tests__/
    integration.js          <- matches: anything inside a __tests__ folder
\`\`\`

Jest automatically discovers test files using three conventions, with no configuration required: any file ending in \`.test.js\` (or \`.test.jsx\`/\`.ts\`/\`.tsx\`), any file ending in \`.spec.js\`, or any file inside a folder named \`__tests__\`. \`.test.js\` is the more common convention in practice — pick one and use it consistently across a project, since mixing conventions arbitrarily makes test files harder to locate at a glance.

### Where to put a test file: colocated, by convention

\`\`\`
src/
  utils/
    formatCurrency.js
    formatCurrency.test.js   <- lives right next to the code it tests
\`\`\`

The standard convention is **colocating** a test file directly next to the source file it tests, sharing the same base name — this mirrors this platform's React course's feature-based colocation lesson, applied here to tests specifically: instantly obvious which file tests which, and both move together naturally if the source file is ever relocated.

### Watch mode: the tight feedback loop you'll actually live in

\`\`\`bash
npx jest --watch
\`\`\`

\`--watch\` keeps Jest running, automatically re-running only the tests affected by whatever file you just saved — genuinely the mode you'll use for the vast majority of actual test-writing time, since it gives feedback in a second or two rather than requiring you to manually re-run the full suite after every small change. Jest is smart enough to only run tests related to changed files (based on git, when available) rather than the entire suite every time, keeping this loop fast even in a large project.

### Running a single test file, or filtering by name

\`\`\`bash
npx jest sum.test.js              # run just this one file
npx jest -t "adds 1"                # run only tests whose NAME matches this string
npx jest --watch sum.test.js          # watch mode, scoped to just this file
\`\`\`

While actively working on one specific piece of functionality, scoping Jest to just the relevant file (or even a specific test by name, via \`-t\`) keeps the feedback loop tight — no need to wait for or scroll through the entire project's test output while iterating on one small piece.

> **Key idea:** Jest discovers \`.test.js\`/\`.spec.js\` files (or anything in \`__tests__\`) automatically with zero configuration, and the standard convention is colocating a test file directly next to the source it tests. \`--watch\` mode, re-running only affected tests on save, is the tight feedback loop you'll actually spend most of your test-writing time in.`,
    },
    {
      name: "describe, test & the Structure of a Test File",
      minutes: 8,
      intro: "Organizing related tests into groups, and the vocabulary every Jest test file uses.",
      content: `### test and it are the same thing

\`\`\`js
test("adds two numbers", () => {
  expect(sum(1, 2)).toBe(3)
})

it("adds two numbers", () => {   // functionally IDENTICAL to test() above — "it" is just an alias
  expect(sum(1, 2)).toBe(3)
})
\`\`\`

\`it\` is a plain alias for \`test\` — genuinely no behavioral difference between them. \`it\` reads slightly more naturally in a sentence ("it adds two numbers"), which is why some codebases prefer it; \`test\` reads more directly ("test: adds two numbers"). Pick one convention for a given project and stay consistent — mixing both arbitrarily in the same codebase is just visual noise.

### describe: grouping related tests

\`\`\`js
describe("sum", () => {
  test("adds two positive numbers", () => {
    expect(sum(1, 2)).toBe(3)
  })

  test("adds negative numbers", () => {
    expect(sum(-1, -2)).toBe(-3)
  })

  test("adds zero", () => {
    expect(sum(0, 5)).toBe(5)
  })
})
\`\`\`

\`describe(name, fn)\` groups related tests together — purely organizational, with no effect on whether the tests pass or fail. The real payoff is in the output: failures are reported nested under their \`describe\` block's name, making a large test file's results far easier to scan (\`sum > adds negative numbers\` immediately tells you both *what* failed and *which broader area* it belongs to).

### Nesting describe blocks

\`\`\`js
describe("Calculator", () => {
  describe("addition", () => {
    test("adds two positive numbers", () => { /* ... */ })
    test("adds negative numbers", () => { /* ... */ })
  })

  describe("division", () => {
    test("divides two numbers", () => { /* ... */ })
    test("throws when dividing by zero", () => { /* ... */ })
  })
})
\`\`\`

\`describe\` blocks can nest arbitrarily — genuinely useful once a file tests a larger unit (a whole class or module, like \`Calculator\` here) with several distinct areas of behavior, each deserving its own grouping. This is purely a readability and organizational tool, worth reaching for once a test file grows past a handful of flat, ungrouped tests.

### Writing a descriptive test name: a real skill worth developing

\`\`\`js
// vague — doesn't say WHAT should happen or under what condition
test("works", () => { /* ... */ })

// specific — states the exact input/condition and the exact expected outcome
test("returns 0 when both arguments are 0", () => { /* ... */ })
test("throws a TypeError when the second argument is not a number", () => { /* ... */ })
\`\`\`

A test's name is read constantly — in the terminal when it fails, in CI logs, when skimming a test file to understand what's covered. A vague name like \`"works"\` gives you nothing when it fails at 2am in CI; a specific one immediately tells you exactly what broke, without even opening the file. The convention worth adopting: state the specific behavior and condition, not just that "it works" — this alone is one of the highest-value habits in writing tests that stay genuinely useful over time.

### test.skip and test.only: controlling which tests actually run

\`\`\`js
test.skip("a test that's currently broken and being worked on", () => { /* ... */ })

test.only("focus on just this one test while debugging", () => {
  expect(sum(1, 2)).toBe(3)
})
// with test.only present, EVERY OTHER test in this file is skipped, until it's removed
\`\`\`

\`.skip\` marks a test as intentionally not run (reported as "skipped," not silently ignored, so it stays visible) — useful for a test you're in the middle of writing, or one temporarily broken by a known, tracked issue. \`.only\` does the opposite: runs *only* this test, skipping every other one in the file — genuinely useful while actively debugging one specific test, but **never commit \`.only\` to version control** — it's an extremely common, real mistake that silently disables an entire file's worth of other tests in CI without anyone noticing until much later.

> **Key idea:** \`test\`/\`it\` are identical, aliased for readability preference; \`describe\` groups related tests purely for organization and clearer failure output, and nests naturally for larger units under test. A specific, descriptive test name (stating the exact condition and expected outcome) is genuinely one of the highest-value habits — and \`.only\` should never survive to a commit, since it silently disables everything else in that file.`,
    },
    {
      name: "Your First Real Assertions",
      minutes: 8,
      intro: "The expect API's basic shape, and writing a handful of genuinely meaningful tests.",
      content: `### The expect(...).matcher(...) shape

\`\`\`js
expect(actualValue).toBe(expectedValue)
\`\`\`

Every Jest assertion follows this same shape: \`expect(...)\` wraps the value you actually got from running some code, and a chained **matcher** (\`.toBe(...)\`, and dozens of others covered fully in module 2) states what that value should be. If the matcher's condition isn't met, the test fails immediately with a message showing exactly what was expected versus what was actually received.

### A first, genuinely meaningful test

\`\`\`js
// formatCurrency.js
function formatCurrency(cents) {
  return \`$\${(cents / 100).toFixed(2)}\`
}
module.exports = formatCurrency
\`\`\`

\`\`\`js
// formatCurrency.test.js
const formatCurrency = require("./formatCurrency")

describe("formatCurrency", () => {
  test("formats whole dollars correctly", () => {
    expect(formatCurrency(500)).toBe("$5.00")
  })

  test("formats cents correctly", () => {
    expect(formatCurrency(99)).toBe("$0.99")
  })

  test("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })
})
\`\`\`

Recall this platform's JavaScript course's module 13 discussion of \`.toFixed()\` returning a string — this test directly verifies \`formatCurrency\`'s actual, real behavior across a few genuinely distinct, meaningful cases (whole dollars, cents-only, zero), not just one trivial happy-path check.

### Reading a failure message

\`\`\`
FAIL  src/formatCurrency.test.js
  formatCurrency
    ✓ formats whole dollars correctly (2 ms)
    ✕ formats cents correctly (3 ms)

  ● formatCurrency › formats cents correctly

    expect(received).toBe(expected)

    Expected: "$0.99"
    Received: "$.99"

      8 |   test("formats cents correctly", () => {
      9 |     expect(formatCurrency(99)).toBe("$0.99")
    > 10 |   })
\`\`\`

Jest's failure output is deliberately detailed: which \`describe\`/\`test\` failed, the exact expected vs. actual values, and the specific line of the assertion — genuinely worth reading carefully rather than skimming past, since it usually tells you precisely what's wrong without needing to add your own debug logging.

### Testing edge cases, not just the obvious case

\`\`\`js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero")
  }
  return a / b
}
\`\`\`

\`\`\`js
describe("divide", () => {
  test("divides two positive numbers", () => {
    expect(divide(10, 2)).toBe(5)
  })

  test("throws when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero")
  })
})
\`\`\`

A test suite that only checks the "normal," happy-path input misses the majority of a function's actual value as a safety net — the interesting, bug-prone cases are almost always at the **edges**: zero, negative numbers, empty strings/arrays, \`null\`/\`undefined\`. Note \`() => divide(10, 0)\` — wrapping the call in an arrow function is required when testing that something *throws* (covered fully in module 2), since \`expect\` needs to call the function itself to catch the exception, rather than receiving an already-thrown error as its argument.

### What makes a test genuinely worth writing, even this early

Recall this platform's React course's module 13 testing-philosophy lesson, applicable here in its purest form since Jest predates and underlies that entire discussion: a good test verifies real, meaningful *behavior* — a specific input producing a specific, correct output, including at the edges — not an implementation detail that happens to be true right now. Even at this introductory stage, writing a test for \`formatCurrency(0)\` (an edge case, not just the "normal" case) is already applying that principle correctly.

> **Key idea:** every Jest assertion follows \`expect(actual).matcher(expected)\`; Jest's failure output shows the exact expected-vs-received diff and the failing line, genuinely worth reading in full. Testing edge cases (zero, negative, empty, throwing) — not just the obvious happy path — is where a test suite's real value as a safety net comes from, a principle worth internalizing from your very first tests.`,
    },
  ],
}
