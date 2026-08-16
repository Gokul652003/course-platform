import type { Module } from "../types"

export const jestModule9: Module = {
  id: 9,
  title: "Code Coverage",
  status: "upcoming",
  lessons: [
    {
      name: "Generating & Reading a Coverage Report",
      minutes: 8,
      intro: "Measuring exactly which lines of your code your test suite actually exercises.",
      content: `### Running Jest with coverage enabled

\`\`\`bash
npx jest --coverage
\`\`\`

\`\`\`
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files              |   78.26 |    66.67 |   83.33 |   78.26 |
 formatCurrency.js       |     100 |      100 |     100 |     100 |
 validateEmail.js          |   57.14 |       50 |      50 |   57.14 | 8-12
----------------------|---------|----------|---------|---------|-------------------
\`\`\`

\`--coverage\` instruments your code (rewrites it internally to track which parts actually execute) as your test suite runs, then reports exactly what percentage of your source code was exercised by at least one test. This gives a genuinely concrete, file-by-file view of untested code, rather than a vague sense of "we have some tests."

### The four coverage metrics, precisely

- **Statements** — the percentage of individual statements (roughly, lines of executable code) that ran at least once.
- **Branches** — the percentage of *conditional branches* (both sides of an \`if\`, every \`case\` in a \`switch\`, recall this platform's JavaScript course's module 2) that were actually taken by some test.
- **Functions** — the percentage of functions called at least once by any test.
- **Lines** — very similar to statements, but counted per physical source line rather than per logical statement.

Branch coverage is genuinely the most informative of the four, worth paying closest attention to — a file can have 100% *statement* coverage while still missing an entire, untested \`if\`/\`else\` branch, if every test happens to only ever exercise one side of that condition.

### A concrete example: high statement coverage, hiding an untested branch

\`\`\`js
function processPayment(amount, currency) {
  if (currency === "USD") {
    return amount
  } else {
    return amount * 1.1   // a currency conversion fee — completely untested if no test uses a non-USD currency!
  }
}
\`\`\`

\`\`\`js
test("processes a USD payment", () => {
  expect(processPayment(100, "USD")).toBe(100)
})
// 100% statement coverage for this function... but the ENTIRE else branch never actually ran!
\`\`\`

This is precisely why branch coverage matters more than statement coverage alone: every *line* in \`processPayment\` did technically execute across the test suite (recall module 1's edge-case-testing principle — this is exactly the kind of untested edge case that principle is meant to catch), but the \`else\` branch — genuinely important, real logic — has zero test coverage, invisible if you only glance at the statement-coverage percentage.

### The HTML coverage report: a genuinely useful, detailed view

\`\`\`bash
npx jest --coverage --coverageReporters=html
open coverage/lcov-report/index.html
\`\`\`

Beyond the terminal summary, Jest can generate a full HTML report — browsable file by file, with **every individual line color-coded**: green for covered, red for never executed. This is genuinely the most useful way to actually *find* specific untested code, rather than just seeing an aggregate percentage per file; worth generating and actually browsing periodically on a real project, not just glancing at the terminal summary.

### Excluding files that genuinely don't need coverage

\`\`\`js
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.config.js",       // config files
    "!src/index.js",                // a pure entry point, with no real logic of its own
    "!src/**/*.stories.js",           // Storybook files, not application logic
  ],
}
\`\`\`

Not every file genuinely benefits from coverage tracking — configuration files, simple re-export files, and similar have no real logic to exercise. \`collectCoverageFrom\` explicitly scopes which files coverage even considers, keeping the report focused on files where coverage percentage is actually a meaningful signal.

> **Key idea:** \`jest --coverage\` reports four metrics — statements, branches, functions, lines — with branch coverage the most informative, since a file can have high statement coverage while an entire conditional branch remains genuinely untested. The HTML report, browsed file by file, is the most practical way to actually locate specific untested code, more useful than the terminal summary's aggregate percentages alone.`,
    },
    {
      name: "Coverage Thresholds & Enforcing Them in CI",
      minutes: 7,
      intro: "Making a build fail automatically if coverage drops below an agreed-upon bar.",
      content: `### Setting a coverage threshold

\`\`\`js
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
}
\`\`\`

Configuring \`coverageThreshold\` makes \`jest --coverage\` **fail** (a non-zero exit code, exactly the signal covered in this module's next lesson's CI discussion) if actual coverage falls below any of these specified percentages — turning coverage from a passive report you might or might not glance at into an actively enforced quality bar, exactly like a lint rule or a type check failing a build.

### Per-file (or per-directory) thresholds

\`\`\`js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      lines: 80,
    },
    "./src/utils/": {
      branches: 90,   // utility functions, expected to be thoroughly tested — a higher bar
      lines: 95,
    },
    "./src/legacy/": {
      branches: 40,     // an older, gradually-being-tested part of the codebase — a lower, realistic bar for now
      lines: 50,
    },
  },
}
\`\`\`

Thresholds can be scoped to specific paths, not just the whole project globally — genuinely useful for a real, existing codebase where different areas have meaningfully different testing maturity: hold well-established utility code to a strict bar, while setting a more realistic, lower threshold for legacy code you haven't fully covered yet, without blocking every build on catching that up all at once.

### The failing exit code, and why it matters for CI specifically

\`\`\`bash
npx jest --coverage
echo $?   # 1 if coverage is below any configured threshold, 0 if everything passes
\`\`\`

This exit code is precisely the mechanism CI systems (module 12 covers this fully) use to decide whether a build passes or fails — a coverage threshold failure blocks a pull request from merging exactly the same way a failing test or a lint error would, treating "coverage regressed" as seriously as "a test broke."

### Ratcheting coverage upward over time, for an existing codebase

A genuinely practical strategy for a real, existing project with initially low coverage: set the threshold at (or just slightly below) the *current* actual coverage percentage, so the build passes today — then, as coverage genuinely improves over time (new code arriving with tests, existing code gradually gaining them), periodically raise the threshold to match, and re-commit the updated, higher number. This "ratchet" prevents coverage from silently regressing further, without requiring an unrealistic, immediate jump to some ambitious target percentage all at once.

### The genuine risk: chasing the number itself, not what it represents

\`\`\`js
// technically "covers" every line and branch, asserts absolutely nothing meaningful
test("covers processPayment", () => {
  processPayment(100, "USD")
  processPayment(100, "EUR")
  // no expect() calls at all — the coverage tool is satisfied, but this test verifies NOTHING
})
\`\`\`

This is worth stating directly and taking seriously: a coverage threshold can be satisfied by tests that execute every line without ever actually *asserting* anything meaningful about the result — recall this platform's React course's module 13 closing lesson on coverage as "a signal, not a target." A threshold enforced in CI is a genuinely useful guardrail against *regression* (coverage silently dropping over time), but it is not, on its own, proof that the tests satisfying it are actually any good.

> **Key idea:** \`coverageThreshold\` turns a coverage report into an enforced CI gate, failing the build if coverage drops below a configured bar — genuinely useful for preventing regression, and can be ratcheted upward gradually for an existing codebase. It remains only a guardrail against coverage *dropping*, never proof that the tests satisfying it are meaningfully verifying real behavior — a test with zero real assertions can still fully satisfy a coverage threshold.`,
    },
    {
      name: "What Coverage Does and Doesn't Tell You",
      minutes: 6,
      intro: "Building the right mental model for a metric that's genuinely useful, but easy to over-trust.",
      content: `### What coverage genuinely, reliably tells you

Coverage answers exactly one specific, narrow, well-defined question: **which lines of code did the test suite execute at least once?** That's a genuinely useful thing to know — it directly, reliably reveals code with **zero** tests at all: an entire untested function, an unexercised \`else\` branch (lesson 1's concrete example), a \`catch\` block that never actually runs during any test. For finding completely untested code, coverage is a reliable, trustworthy tool.

### What coverage does NOT tell you: whether the tests are actually correct

\`\`\`js
function add(a, b) {
  return a + b
}

test("adds two numbers", () => {
  add(2, 3)   // no expect() at all — 100% coverage of add(), but verifies literally nothing
})
\`\`\`

Recall the previous lesson's exact example — 100% coverage here is genuinely, technically true, and genuinely meaningless: the test calls \`add\`, "covering" its one line, but asserts nothing about the result at all. \`add\` could be completely broken (returning \`a - b\`, or always \`0\`) and this test would still pass, with full coverage, forever. Coverage measures **execution**, not **verification** — a distinction genuinely worth internalizing precisely, since the two are easy to conflate.

### A more realistic, subtler version of the same trap

\`\`\`js
function validateEmail(email) {
  if (!email.includes("@")) return false
  if (email.length > 254) return false
  return true
}

test("validates an email", () => {
  expect(validateEmail("ada@example.com")).toBe(true)   // covers the "valid" path
  expect(validateEmail("not-an-email")).toBe(false)         // covers the FIRST if branch
  // the SECOND if (length > 254) is never tested — but overall coverage still LOOKS reasonably high
})
\`\`\`

Both explicit branches technically execute across these two tests (100% branch coverage for the first \`if\`), but the second \`if\` (checking for an overly long email) is entirely untested — a genuine gap that a glance at an aggregate coverage percentage alone wouldn't necessarily surface, especially in a larger, more complex function with many conditions.

### 100% coverage is neither necessary nor sufficient for a good test suite

This is worth stating as directly as possible, since it directly counters an intuitive but genuinely mistaken belief: 100% coverage does not mean your code is well-tested (as both examples above demonstrate) — and less-than-100% coverage does not necessarily mean your test suite is inadequate either. Some code (a thin wrapper around a well-tested library, a trivial getter) genuinely doesn't need dedicated tests of its own; chasing 100% everywhere can produce exactly the kind of assertion-free, low-value tests shown above, written purely to satisfy the number.

### The correct way to use coverage: a tool for finding gaps, then thinking

The practically useful workflow: run coverage, and use the HTML report (lesson 1) to identify **completely untested** code — that's the genuine, reliable signal. Then, for each gap found, actually *think* about whether it's worth testing (is this genuinely important logic, or a trivial passthrough?) and, if so, write a test with real, meaningful assertions (recall this platform's React course's module 13's discussion of what's genuinely worth testing) — never simply write a test that merely *executes* the uncovered line to make the percentage go up.

> **Key idea:** coverage reliably tells you what code was never executed by any test — genuinely useful for finding real gaps. It does not, and cannot, tell you whether existing tests actually verify anything meaningful, since a test can achieve full coverage while asserting nothing at all. Use it to find untested code, then apply real judgment about what's actually worth testing — never chase the percentage itself as the goal.`,
    },
  ],
}
