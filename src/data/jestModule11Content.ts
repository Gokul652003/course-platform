import type { Module } from "../types"

export const jestModule11: Module = {
  id: 11,
  title: "Configuration & Custom Matchers",
  status: "upcoming",
  lessons: [
    {
      name: "jest.config.js Deep Dive",
      minutes: 9,
      intro: "The options you'll actually reach for when configuring Jest on a real project.",
      content: `### Where configuration lives

\`\`\`js
// jest.config.js
module.exports = {
  testEnvironment: "node",
  // ...more options below
}
\`\`\`

\`\`\`json
// or, inside package.json directly
{
  "jest": {
    "testEnvironment": "node"
  }
}
\`\`\`

Jest reads configuration from either a dedicated \`jest.config.js\` file or a \`"jest"\` key in \`package.json\` — functionally identical, though a separate file is generally preferred once configuration grows beyond a few lines, for the same reason a large \`webpack.config.js\`/\`vite.config.js\` is kept separate from \`package.json\` rather than embedded inline.

### testMatch: controlling which files Jest treats as tests

\`\`\`js
module.exports = {
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],   // Jest's actual default pattern
}
\`\`\`

Recall module 1's file-discovery conventions (\`.test.js\`, \`.spec.js\`, \`__tests__\`) — this is the actual configuration option controlling that behavior, worth knowing about explicitly if a project needs a genuinely different convention (e.g., a monorepo wanting to exclude certain packages, or using a non-standard suffix).

### setupFilesAfterEach / setupFiles: code that runs before every test file

\`\`\`js
module.exports = {
  setupFilesAfterEach: ["<rootDir>/jest.setup.js"],
}
\`\`\`

\`\`\`js
// jest.setup.js
import "@testing-library/jest-dom"   // recall module 10 — extends expect with DOM-specific matchers globally

global.fetch = jest.fn()   // a project-wide default mock, available in every test file automatically
\`\`\`

Rather than importing shared setup (extra matchers, global mocks) individually into every single test file, \`setupFilesAfterEach\` runs a given file once before each test file's own code — genuinely the standard place for project-wide test infrastructure that every file should have access to without repeating the import.

### moduleNameMapper: handling non-JS imports and path aliases

\`\`\`js
module.exports = {
  moduleNameMapper: {
    "\\\\.(css|less|scss)$": "identity-obj-proxy",     // CSS imports become a no-op during tests
    "^@/(.*)$": "<rootDir>/src/$1",                        // matches a "@/..." path alias from your bundler config
  },
}
\`\`\`

Real application code often imports things Jest (running in Node, not a bundler) doesn't natively understand — a CSS file, an image, a path alias like \`@/components/Button\` configured in Vite/webpack. \`moduleNameMapper\` redirects these imports during tests: CSS imports resolve to a harmless stub (since a test doesn't need real styling), and path aliases are mapped to their actual relative location, mirroring whatever alias configuration the bundler itself uses.

### collectCoverageFrom, coverageThreshold: recalling module 9

\`\`\`js
module.exports = {
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.config.js"],
  coverageThreshold: {
    global: { branches: 70, lines: 80 },
  },
}
\`\`\`

Directly covered in module 9 — included here as a reminder that these, too, are genuinely just \`jest.config.js\` options, part of the same overall configuration surface as everything else in this lesson, not a separate system.

### testTimeout: adjusting how long Jest waits before failing a slow test

\`\`\`js
module.exports = {
  testTimeout: 10000,   // 10 seconds, instead of the 5-second default
}
\`\`\`

Recall module 6's \`done\` callback lesson mentioning a default timeout failure — \`testTimeout\` adjusts that default globally, genuinely useful for a project with some legitimately slow integration tests (real database calls, for instance) that need more than the default 5 seconds without being flagged as hung.

### verbose: controlling how much detail the test output shows

\`\`\`js
module.exports = {
  verbose: true,   // prints every individual test's name and pass/fail status, not just a per-file summary
}
\`\`\`

By default, Jest's terminal output summarizes per file; \`verbose: true\` prints every individual test's result — genuinely useful for actively reading through what a suite covers (directly supporting module 3's "tests as documentation" point), though noisier for a quick pass/fail glance in CI, where the summary form is often preferred instead.

> **Key idea:** \`jest.config.js\` centralizes test discovery patterns, project-wide setup files, non-JS import handling (\`moduleNameMapper\`), coverage settings from module 9, and output verbosity — knowing this handful of options covers the large majority of what a real project's Jest configuration actually needs, beyond Jest's already-sensible zero-config defaults.`,
    },
    {
      name: "Multi-Project Configurations",
      minutes: 7,
      intro: "Running genuinely different kinds of tests, with different settings, under one unified command.",
      content: `### The problem: one project, genuinely different testing needs

Recall module 10's environment lesson — a real, larger project often has backend code (needing \`node\`, fast, no DOM) and frontend components (needing \`jsdom\`) side by side. Per-file docblock overrides (module 10) work for a handful of exceptions, but become unwieldy once there are genuinely many files needing a systematically different configuration, not just an occasional one-off.

### The projects configuration: multiple, independently-configured test suites in one run

\`\`\`js
// jest.config.js
module.exports = {
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/server/**/*.test.js"],
    },
    {
      displayName: "client",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/client/**/*.test.js"],
      setupFilesAfterEach: ["<rootDir>/src/client/jest.setup.js"],
    },
  ],
}
\`\`\`

\`\`\`bash
npx jest   # runs BOTH projects, each with its own settings, reported together
\`\`\`

Each entry in \`projects\` is essentially its own independent \`jest.config.js\`, scoped to a specific subset of files via \`testMatch\` — \`server\`'s tests genuinely never load \`jsdom\` at all (keeping them fast, recall module 10's performance point), while \`client\`'s tests get the DOM environment and their own specific setup file, all invoked together under a single \`npx jest\` command.

### Running just one project

\`\`\`bash
npx jest --selectProjects server   # runs ONLY the "server" project's tests
\`\`\`

While actively working on just the backend (or just the frontend), scoping to one specific project keeps the run fast and focused — directly extending module 1's watch-mode/single-file scoping guidance to the project level, for a codebase organized this way.

### A monorepo use case: multiple genuinely separate packages

\`\`\`js
module.exports = {
  projects: ["packages/*/jest.config.js"],   // each package brings its OWN, independent configuration
}
\`\`\`

For a monorepo with several genuinely independent packages, each can maintain its own complete \`jest.config.js\` (its own environment, setup, coverage thresholds — recall module 9's per-path threshold example, achievable here at the whole-package level instead), while still being runnable together, or individually, from the repository root.

### Reporting: distinguishing which project a given test result belongs to

\`\`\`
PASS  server  src/server/api.test.js
PASS  client  src/client/Button.test.jsx
FAIL  server  src/server/auth.test.js
\`\`\`

The \`displayName\` configured for each project labels every test result in the combined output — genuinely useful for quickly identifying which part of a larger, multi-project codebase a given failure actually belongs to, especially in CI output where you can't as easily infer it from file path alone at a glance.

### When multi-project configuration is (and isn't) worth the complexity

For a small-to-medium project with just an occasional \`jsdom\`-needing file among mostly-\`node\` tests, module 10's per-file docblock override remains simpler and perfectly adequate — reach for \`projects\` specifically once there's a genuine, structural, *systematic* split (an entire backend directory vs. an entire frontend directory, or genuinely separate packages in a monorepo) that justifies maintaining fully separate configurations, not for a handful of individual exceptions.

> **Key idea:** \`projects\` runs multiple, independently-configured test suites (different environments, setup files, even entirely separate \`jest.config.js\` files for a monorepo's packages) under one unified \`jest\` invocation, each result labeled by \`displayName\` — the right tool once a codebase has a genuine, structural split in testing needs, not for occasional one-off exceptions better handled by module 10's per-file override.`,
    },
    {
      name: "Custom Matchers with expect.extend",
      minutes: 8,
      intro: "Building your own, domain-specific matchers when the built-in ones don't quite fit.",
      content: `### The problem: a repeated, verbose assertion pattern

\`\`\`js
test("a valid order total", () => {
  const order = calculateOrder(items)
  expect(order.total).toBeGreaterThanOrEqual(0)
  expect(Number.isFinite(order.total)).toBe(true)
  expect(Number.isInteger(order.total * 100)).toBe(true)   // no fractional cents
})
\`\`\`

This same three-line pattern — "is this a valid monetary amount" — might genuinely need repeating across dozens of tests throughout a project. Recall module 9's point about coverage not measuring test *quality* — repeating verbose, easy-to-get-slightly-wrong assertion logic in many places is a genuine, real maintenance risk, exactly the kind of duplication worth extracting.

### expect.extend: defining a new, project-specific matcher

\`\`\`js
// jest.setup.js
expect.extend({
  toBeValidMoneyAmount(received) {
    const pass =
      typeof received === "number" &&
      Number.isFinite(received) &&
      received >= 0 &&
      Number.isInteger(received * 100)

    return {
      pass,
      message: () =>
        pass
          ? \`expected \${received} not to be a valid money amount\`
          : \`expected \${received} to be a valid money amount (non-negative, finite, at most 2 decimal places)\`,
    }
  },
})
\`\`\`

\`\`\`js
test("a valid order total", () => {
  const order = calculateOrder(items)
  expect(order.total).toBeValidMoneyAmount()   // now reads exactly like a built-in matcher
})

test("not asserting a negative amount", () => {
  expect(-5).not.toBeValidMoneyAmount()   // .not still works automatically, exactly like module 2's built-ins
})
\`\`\`

\`expect.extend({...})\` adds a genuinely new matcher, callable exactly like any built-in one (\`toBe\`, \`toEqual\`) — including automatic support for \`.not\` negation, recall module 2's lesson, with zero extra code required for that. The matcher function returns \`{ pass, message }\`: whether the assertion passed, and a function producing the failure message (called only when needed, and receiving the current \`.not\` state automatically to word it correctly either way).

### Registering it project-wide via setup

\`\`\`js
// jest.config.js
module.exports = {
  setupFilesAfterEach: ["<rootDir>/jest.setup.js"],   // recall module 11's lesson 1 — runs before EVERY test file
}
\`\`\`

Placing the \`expect.extend\` call in the project's shared setup file (module 11, lesson 1) makes \`toBeValidMoneyAmount\` available in *every* test file automatically, exactly like a built-in matcher — no need to import it individually wherever it's used.

### A custom matcher taking arguments

\`\`\`js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    return {
      pass,
      message: () =>
        \`expected \${received} \${pass ? "not " : ""}to be within range \${floor}-\${ceiling}\`,
    }
  },
})
\`\`\`

\`\`\`js
test("a discount percentage stays within a valid range", () => {
  expect(calculateDiscount(order)).toBeWithinRange(0, 0.5)
})
\`\`\`

A custom matcher can accept additional arguments beyond the received value, exactly like a built-in one does (recall \`toBeCloseTo(value, precision)\` from module 2) — genuinely useful for expressing a domain-specific range or shape check that's meaningful, and repeated often enough, in this specific project.

### When a custom matcher genuinely earns its place — and when it's overkill

Recall this course's recurring theme (module 4's over-mocking caution, module 9's coverage-as-signal caution): a custom matcher is worth the added indirection specifically when the same non-trivial assertion pattern is genuinely repeated across many tests, and giving it a clear, domain-specific name (\`toBeValidMoneyAmount\`) meaningfully improves readability over the equivalent inline logic. For a check used only once or twice, the inline version (as in this lesson's very first example) remains simpler and doesn't need a custom matcher's added setup and indirection at all.

> **Key idea:** \`expect.extend({...})\` adds project-specific matchers, callable exactly like built-ins including automatic \`.not\` support — genuinely valuable for a non-trivial assertion pattern repeated across many tests, registered project-wide via a setup file (module 11, lesson 1) so every test file gets it automatically, without needing a per-file import.`,
    },
    {
      name: "TypeScript with Jest",
      minutes: 7,
      intro: "Getting type-checked tests, and the two common ways to actually run TypeScript through Jest.",
      content: `### Why TypeScript matters for tests too

\`\`\`ts
function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
\`\`\`

\`\`\`ts
test("calculates the total correctly", () => {
  expect(calculateTotal([{ price: 10, quantity: 2 }])).toBe(20)
  // expect(calculateTotal([{ price: "10", quantity: 2 }])).toBe(20)   // a TYPE ERROR, caught before the test even runs!
})
\`\`\`

Recall this platform's React course's module 3 TypeScript coverage — writing tests in \`.test.ts\`/\`.test.tsx\` gets the exact same build-time safety for test code itself: passing the wrong shape of test data is caught immediately by the type checker, before the test even runs, rather than only being caught by an actual test failure (or worse, not caught at all if the wrong-shaped data happens to produce a coincidentally correct result).

### ts-jest: running TypeScript test files directly through Jest

\`\`\`bash
npm install -D ts-jest @types/jest
\`\`\`

\`\`\`js
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
}
\`\`\`

**ts-jest** is a Jest "preset" (a bundle of pre-configured settings) that type-checks and compiles \`.ts\`/\`.tsx\` files on the fly as Jest runs them — genuinely the more thorough option, since it actually runs the TypeScript compiler itself, catching real type errors as part of running your tests, not just transpiling syntax and hoping the types were already correct elsewhere.

### The alternative: Babel, transpiling without type-checking

\`\`\`bash
npm install -D babel-jest @babel/preset-typescript
\`\`\`

\`\`\`js
// babel.config.js
module.exports = {
  presets: ["@babel/preset-typescript"],
}
\`\`\`

Babel's TypeScript preset **strips** type annotations to produce plain runnable JavaScript, without actually checking whether those types are correct at all — genuinely faster (no real type-checking work happens during the test run), but it means a genuine type error in your code could slip through Jest entirely, only caught separately by running \`tsc --noEmit\` (recall this platform's Next.js course's module 1 mention of this exact command) as its own distinct step, typically in CI, separate from the test run itself.

### The practical choice: ts-jest for thoroughness, Babel for raw speed

| | ts-jest | Babel |
|---|---|---|
| Catches type errors during test runs | Yes | No — needs a separate \`tsc\` check |
| Speed | Slower (real type-checking) | Faster (pure transpilation) |
| Setup complexity | Slightly more | Slightly less |

Many real projects use Babel for the actual test *run* (optimizing for fast feedback, recall module 1's watch-mode emphasis on speed) while running \`tsc --noEmit\` as a **separate**, dedicated step in CI (module 12) specifically for type-checking — getting the speed benefit of Babel day-to-day, while still catching type errors reliably before code merges, just via a different, dedicated command rather than folded into the test run itself.

### Typing a mock function correctly

\`\`\`ts
import type { Mock } from "jest-mock"

const fetchUser: Mock<() => Promise<{ id: number; name: string }>> = jest.fn()
fetchUser.mockResolvedValue({ id: 1, name: "Ada" })
\`\`\`

Recall module 4's \`jest.fn()\` lesson — in TypeScript, a mock function benefits from an explicit type matching the real function it's standing in for, so \`.mockResolvedValue(...)\`'s argument is itself type-checked against the real function's actual return type, catching a mismatched mock (returning the wrong shape of fake data) at build time rather than only at test-run time.

> **Key idea:** TypeScript test files get the same build-time safety as any other TypeScript code — ts-jest actually type-checks during the test run (thorough, slower), while Babel merely strips types for speed (faster, requiring a separate \`tsc --noEmit\` step for real type-checking) — many real projects deliberately combine Babel's speed for day-to-day test runs with a dedicated \`tsc\` check in CI.`,
    },
  ],
}
