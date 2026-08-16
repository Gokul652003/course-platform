import type { Module } from "../types"

export const jestModule10: Module = {
  id: 10,
  title: "Testing in Practice",
  status: "upcoming",
  lessons: [
    {
      name: "Test Environments: node vs jsdom",
      minutes: 8,
      intro: "Choosing what environment your tests actually run in, and why it matters.",
      content: `### Two fundamentally different environments

\`\`\`js
// jest.config.js
module.exports = {
  testEnvironment: "node",   // or "jsdom"
}
\`\`\`

Jest tests don't run in a real browser — they run in Node.js, but Jest can optionally simulate a browser-like environment on top of it. **\`node\`** (the default in recent Jest versions) gives you plain Node.js globals only — no \`window\`, no \`document\`. **\`jsdom\`** additionally simulates a browser DOM (recall this platform's React course's module 13 setup lesson, which used exactly this environment for testing components) — \`document.createElement\`, \`window.location\`, and similar browser APIs all become available, implemented in pure JavaScript rather than an actual browser.

### Choosing node: for pure logic, with no DOM involved

\`\`\`js
// mathUtils.test.js — plain functions, no DOM interaction at all
test("calculates a discount correctly", () => {
  expect(calculateDiscount(100, 0.1)).toBe(90)
})
\`\`\`

For testing plain functions, backend/server-side logic, or any code that never touches \`document\`/\`window\`, the \`node\` environment is both the correct choice and genuinely faster — no simulated DOM to set up at all, since there's nothing that needs it.

### Choosing jsdom: for anything that touches the DOM

\`\`\`js
// Card.test.jsx — needs a simulated DOM to render into
test("renders the card title", () => {
  render(<Card title="Hello" />)   // recall the React course's module 13 — this needs jsdom
  expect(screen.getByText("Hello")).toBeInTheDocument()
})
\`\`\`

Recall this platform's React course's module 13 setup — testing any React component (or plain DOM manipulation code) requires \`jsdom\`, since \`render\` and React Testing Library's queries fundamentally need a \`document\` to render into and query against.

### Setting the environment per-file, when a project needs both

\`\`\`js
/**
 * @jest-environment jsdom
 */
test("renders a component", () => {
  // this specific file uses jsdom, even if the project's default config is "node"
})
\`\`\`

A single docblock comment at the top of a test file overrides the project-wide default from \`jest.config.js\` — genuinely useful for a project with a mix of backend logic (fast, \`node\`) and frontend components (needs \`jsdom\`), letting each individual test file use only what it actually needs, rather than paying the (real, if modest) overhead of \`jsdom\` for every single test file project-wide.

### Multiple environments in one project via the projects config

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
    },
  ],
}
\`\`\`

For a larger project with a clear, structural split (a server-side and a client-side codebase, for instance), the \`projects\` configuration (covered more fully in module 11) formalizes this rather than relying on per-file docblock comments — each "project" gets its own environment, test file matching, and configuration, all run together under one \`jest\` invocation, with results labeled by \`displayName\`.

### Global setup available specifically in jsdom

\`\`\`js
// setupTests.js
import "@testing-library/jest-dom"   // adds matchers like toBeInTheDocument() — recall React course module 13

// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEach: ["./setupTests.js"],
}
\`\`\`

Recall this platform's React course's module 13 mention of \`@testing-library/jest-dom\` — this is exactly the DOM-specific matcher library that extends Jest's core \`expect\` with assertions like \`.toBeInTheDocument()\`, only meaningful (and only installable) in a \`jsdom\` environment where a real DOM tree actually exists to make assertions about.

> **Key idea:** \`node\` (faster, no DOM) is correct for pure logic and backend code; \`jsdom\` (a simulated browser DOM) is required for anything touching \`document\`/\`window\`, including every React component test from this platform's React course. A per-file docblock or the \`projects\` config lets one codebase mix both, using only what each specific test file actually needs.`,
    },
    {
      name: "test.each: Parameterized Tests",
      minutes: 8,
      intro: "Testing many input/output combinations without copy-pasting the same test structure repeatedly.",
      content: `### The problem: nearly-identical tests, repeated for each case

\`\`\`js
test("returns true for a valid email", () => {
  expect(isValidEmail("ada@example.com")).toBe(true)
})

test("returns false for an email missing the @", () => {
  expect(isValidEmail("not-an-email")).toBe(false)
})

test("returns false for an email missing the domain", () => {
  expect(isValidEmail("ada@")).toBe(false)
})

test("returns false for an empty string", () => {
  expect(isValidEmail("")).toBe(false)
})
\`\`\`

Recall module 1's edge-case-testing principle — thoroughly testing a function like this genuinely means covering many distinct input cases, but each one here repeats the identical test structure, differing only in the specific input and expected output — real, avoidable duplication.

### test.each: one test definition, many data rows

\`\`\`js
test.each([
  ["ada@example.com", true],
  ["not-an-email", false],
  ["ada@", false],
  ["", false],
])("isValidEmail(%s) returns %s", (input, expected) => {
  expect(isValidEmail(input)).toBe(expected)
})
\`\`\`

\`\`\`
✓ isValidEmail(ada@example.com) returns true
✓ isValidEmail(not-an-email) returns false
✓ isValidEmail(ada@) returns false
✓ isValidEmail() returns false
\`\`\`

\`test.each([...])(name, fn)\` runs \`fn\` once for **every** row in the array, with each row's values passed as \`fn\`'s arguments — and critically, each row still shows up as its **own, individually named, individually pass/fail test** in the output (via the \`%s\`/\`%i\`/\`%p\` placeholders in the name, substituted per row), not one combined test that fails as a single opaque unit if any single case breaks.

### Using an array of objects, for more descriptive row data

\`\`\`js
test.each([
  { input: "ada@example.com", expected: true, description: "a valid email" },
  { input: "not-an-email", expected: false, description: "missing the @ symbol" },
  { input: "ada@", expected: false, description: "missing the domain" },
])("returns $expected for $description", ({ input, expected }) => {
  expect(isValidEmail(input)).toBe(expected)
})
\`\`\`

For rows with more than two or three values, an array of objects (destructured directly, recall this platform's JavaScript course's module 6) is generally more readable than an array of positional arrays — and \`$propertyName\` placeholders in the test name (rather than positional \`%s\`) make each generated test's name genuinely self-documenting, directly describing *what specific case* it covers.

### A genuinely practical, larger example

\`\`\`js
describe("calculateShippingCost", () => {
  test.each([
    { weight: 0.5, distance: 10, expected: 5.0, description: "light package, short distance" },
    { weight: 0.5, distance: 1000, expected: 15.0, description: "light package, long distance" },
    { weight: 20, distance: 10, expected: 25.0, description: "heavy package, short distance" },
    { weight: 20, distance: 1000, expected: 45.0, description: "heavy package, long distance" },
    { weight: 0, distance: 10, expected: 0, description: "zero weight" },
  ])("$description: weight=$weight, distance=$distance -> $expected", ({ weight, distance, expected }) => {
    expect(calculateShippingCost(weight, distance)).toBe(expected)
  })
})
\`\`\`

This is a genuinely realistic use case: a pricing function with several interacting factors (weight, distance) — \`test.each\` makes covering a meaningful matrix of combinations (light/heavy × short/long, plus a zero-weight edge case, recall module 1's edge-case principle again) concise, readable, and easy to extend by simply adding another row, rather than copy-pasting an entire new \`test(...)\` block for every additional case.

### it.each: the identical tool, for those preferring it over test

\`\`\`js
it.each([
  [1, 1, 2],
  [2, 3, 5],
])("add(%i, %i) returns %i", (a, b, expected) => {
  expect(add(a, b)).toBe(expected)
})
\`\`\`

Recall module 1's \`test\`/\`it\` alias lesson — \`it.each\` is the identical mechanism, just using the \`it\` alias instead of \`test\`, for projects that prefer that naming convention consistently.

> **Key idea:** \`test.each\`/\`it.each\` runs one test definition against many rows of input/expected-output data, with each row still reported as its own individually named, individually pass/fail test — eliminating the repetition of nearly-identical test blocks while keeping per-case failure diagnosis exactly as clear as separately written tests would provide.`,
    },
    {
      name: "Testing Classes & Custom Error Handling",
      minutes: 7,
      intro: "Applying everything from this module to testing object-oriented code and thorough error handling.",
      content: `### Testing a class: exercising its public interface

\`\`\`js
class BankAccount {
  #balance = 0

  constructor(initialBalance = 0) {
    this.#balance = initialBalance
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit amount must be positive")
    this.#balance += amount
    return this.#balance
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds")
    this.#balance -= amount
    return this.#balance
  }

  getBalance() {
    return this.#balance
  }
}
\`\`\`

Recall this platform's JavaScript course's module 7 private-fields lesson — \`#balance\` is genuinely inaccessible from outside the class, which means tests can **only** exercise \`BankAccount\` through its actual public methods, exactly as any real consumer of the class would — this is a genuine strength, not a limitation: it keeps tests honest about testing observable behavior, never able to accidentally peek at or assert on private internal state.

### A well-organized test suite for the class

\`\`\`js
describe("BankAccount", () => {
  let account

  beforeEach(() => {
    account = new BankAccount(100)   // recall module 3's beforeEach isolation lesson
  })

  describe("deposit", () => {
    test("increases the balance", () => {
      account.deposit(50)
      expect(account.getBalance()).toBe(150)
    })

    test("returns the new balance", () => {
      expect(account.deposit(50)).toBe(150)
    })

    test.each([0, -10, -100])("throws for a non-positive amount: %i", (amount) => {
      expect(() => account.deposit(amount)).toThrow("Deposit amount must be positive")
    })
  })

  describe("withdraw", () => {
    test("decreases the balance", () => {
      account.withdraw(30)
      expect(account.getBalance()).toBe(70)
    })

    test("throws when withdrawing more than the balance", () => {
      expect(() => account.withdraw(500)).toThrow("Insufficient funds")
    })

    test("allows withdrawing the exact full balance", () => {
      account.withdraw(100)
      expect(account.getBalance()).toBe(0)
    })
  })
})
\`\`\`

This combines nearly every technique from this course: module 3's nested \`describe\`/\`beforeEach\` for organization and isolation, module 2's \`.toThrow\` and this module's \`test.each\` for testing several invalid-amount cases concisely, and module 1's edge-case principle applied directly — the exact-full-balance withdrawal is precisely the kind of boundary case (neither "normal" nor obviously invalid) worth deliberately testing.

### Testing that state changes are correctly isolated between instances

\`\`\`js
test("two separate accounts have independent balances", () => {
  const account1 = new BankAccount(100)
  const account2 = new BankAccount(50)

  account1.deposit(20)

  expect(account1.getBalance()).toBe(120)
  expect(account2.getBalance()).toBe(50)   // completely unaffected by account1's deposit
})
\`\`\`

Recall this platform's JavaScript course's module 7 class-instance lesson — genuinely worth an explicit test verifying instances don't share state unexpectedly, especially for a class managing meaningful internal state like a balance; this is exactly the kind of subtle correctness property that's easy to assume works and genuinely worth confirming directly.

### Testing a custom error hierarchy

\`\`\`js
class InsufficientFundsError extends Error {
  constructor(message) {
    super(message)
    this.name = "InsufficientFundsError"
  }
}
\`\`\`

\`\`\`js
test("withdraw throws the SPECIFIC InsufficientFundsError type, not a generic Error", () => {
  expect(() => account.withdraw(500)).toThrow(InsufficientFundsError)
})
\`\`\`

Recall module 2's lesson on testing a *specific* error class, and this platform's JavaScript course's module 10 custom-error hierarchy — verifying the exact error type, not just that *some* error was thrown, catches a real, genuine bug category: code that accidentally throws a generic \`Error\` where calling code specifically needs to \`instanceof\`-check for a particular custom error type to handle it correctly.

> **Key idea:** testing a class means exercising only its public interface — private fields (module 7 of the JavaScript course) genuinely enforce this, keeping tests honest about observable behavior. Combining nested \`describe\`/\`beforeEach\` for organization, \`test.each\` for multiple invalid-input cases, and specific error-type assertions produces a thorough, well-organized suite applying nearly every technique from this entire course together.`,
    },
    {
      name: "Organizing a Real, Growing Test Suite",
      minutes: 7,
      intro: "Practical conventions for keeping tests maintainable as a project genuinely grows.",
      content: `### Test file organization, mirroring this platform's React course's feature-based structure

\`\`\`
src/
  features/
    cart/
      cartReducer.js
      cartReducer.test.js       <- colocated (module 1), tests pure logic
      useCart.js
      useCart.test.js
    checkout/
      validatePayment.js
      validatePayment.test.js
  shared/
    utils/
      formatCurrency.js
      formatCurrency.test.js
\`\`\`

Recall this platform's React course's module 14 feature-based folder structure lesson — the exact same colocation principle applies directly to test files: keeping a test right next to the code it tests (module 1's convention) scales naturally alongside a feature-organized project, since a feature's tests move and stay discoverable together with its actual implementation.

### Shared test utilities and fixtures

\`\`\`js
// testUtils/fixtures.js
function createTestUser(overrides = {}) {
  return {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "admin",
    ...overrides,   // recall the JavaScript course's module 6 spread operator
  }
}
module.exports = { createTestUser }
\`\`\`

\`\`\`js
const { createTestUser } = require("../../testUtils/fixtures")

test("admin users can delete posts", () => {
  const admin = createTestUser({ role: "admin" })
  expect(canDeletePost(admin)).toBe(true)
})

test("viewer users cannot delete posts", () => {
  const viewer = createTestUser({ role: "viewer" })
  expect(canDeletePost(viewer)).toBe(false)
})
\`\`\`

A **fixture** function like \`createTestUser\` — building a realistic, complete test object with sensible defaults, letting individual tests override only the specific fields that matter to that particular case — is a genuinely common, valuable pattern once similar test data is needed across many test files. This directly avoids two problems at once: repeating a large, mostly-identical object literal in every test, and (more subtly) tests becoming coupled to *every* field of an object when they only actually care about one or two.

### A naming convention for the describe/test hierarchy

\`\`\`js
describe("validatePayment", () => {
  describe("when the card number is invalid", () => {
    test("throws a validation error", () => { /* ... */ })
  })

  describe("when the card is expired", () => {
    test("throws a validation error", () => { /* ... */ })
  })

  describe("when all fields are valid", () => {
    test("returns true", () => { /* ... */ })
  })
})
\`\`\`

A genuinely useful, common convention: structure nested \`describe\` blocks around **conditions** ("when X"), with \`test\` names stating the resulting **behavior** — this produces output that reads almost like a specification document (recall module 3's "tests as living documentation" observation), directly useful to anyone trying to understand the function's intended behavior without reading its implementation.

### A pragmatic checklist for a test file that's grown too large

If a single test file has grown to hundreds of lines or dozens of tests covering genuinely distinct areas of behavior, it's often worth splitting along the same lines a nested \`describe\` structure would suggest — e.g., \`validatePayment.test.js\` growing into \`validatePayment.cardNumber.test.js\` and \`validatePayment.expiry.test.js\`, mirroring how you'd split an overly large source file into smaller, more focused modules (recall this platform's React course's module 10 composition lessons, applied here to test organization instead of components).

> **Key idea:** colocating tests with the source they test (mirroring feature-based project structure), extracting shared fixture-builder functions for realistic, overridable test data, and structuring nested \`describe\`/\`test\` names around "when X, then Y" are the practical conventions that keep a test suite genuinely maintainable and readable as a project — and its number of tests — grows substantially over time.`,
    },
  ],
}
