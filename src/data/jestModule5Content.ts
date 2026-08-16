import type { Module } from "../types"

export const jestModule5: Module = {
  id: 5,
  title: "Mocking Modules",
  status: "upcoming",
  lessons: [
    {
      name: "jest.mock(): Mocking an Entire Module",
      minutes: 9,
      intro: "Replacing everything a module exports, automatically, across an entire test file.",
      content: `### The problem: a module with its own real, unwanted side effects

\`\`\`js
// emailService.js
function sendWelcomeEmail(user) {
  // sends a REAL email via a third-party service — definitely not something a test should actually do
}
module.exports = { sendWelcomeEmail }
\`\`\`

\`\`\`js
// signup.js
const { sendWelcomeEmail } = require("./emailService")

function signupUser(userData) {
  const user = createUser(userData)
  sendWelcomeEmail(user)
  return user
}
module.exports = signupUser
\`\`\`

Testing \`signupUser\` shouldn't actually send a real email every time the test runs — recall module 4's boundary-mocking principle, extended here from a single function (module 4's \`jest.fn()\`/\`jest.spyOn\`) to an entire **module**.

### jest.mock(): auto-mocking a whole module

\`\`\`js
// signup.test.js
const signupUser = require("./signup")
const { sendWelcomeEmail } = require("./emailService")

jest.mock("./emailService")   // replaces EVERY export from this module with an auto-mocked jest.fn()

test("sends a welcome email on signup", () => {
  signupUser({ name: "Ada", email: "ada@example.com" })

  expect(sendWelcomeEmail).toHaveBeenCalledTimes(1)
  expect(sendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({ name: "Ada" }))
})
\`\`\`

\`jest.mock("./emailService")\` (called at the top level of the test file — this matters, covered below) tells Jest: whenever *any* code in this test file imports \`./emailService\` — including indirectly, through \`signup.js\`'s own \`require\` — give it an **automatically mocked** version instead, where every exported function is replaced with a fresh \`jest.fn()\`. \`signup.js\` itself is completely unaware its dependency has been swapped; it just calls \`sendWelcomeEmail\` normally, and that call is now tracked and controllable exactly like module 4's \`jest.fn()\` examples.

### jest.mock calls are hoisted to the top of the file

\`\`\`js
const signupUser = require("./signup")
jest.mock("./emailService")   // this line is HOISTED above the require() calls above it, automatically
const { sendWelcomeEmail } = require("./emailService")
\`\`\`

This is a genuinely important, easy-to-miss detail: Jest automatically hoists \`jest.mock(...)\` calls to the very top of the file, *before* any \`require\`/\`import\` statements — specifically so the mock is guaranteed to be in place before any module that depends on it is actually loaded, regardless of where in the file you happened to write the \`jest.mock\` call. In practice, write it near the top anyway for readability, but understand that its actual execution order is different from its written position.

### Combining jest.mock with a specific implementation

\`\`\`js
jest.mock("./emailService")

const { sendWelcomeEmail } = require("./emailService")
sendWelcomeEmail.mockResolvedValue(undefined)   // configuring the auto-mocked function, using module 4's API

test("signupUser succeeds even though sendWelcomeEmail is mocked", async () => {
  await signupUser({ name: "Ada" })
  expect(sendWelcomeEmail).toHaveBeenCalled()
})
\`\`\`

Once auto-mocked via \`jest.mock\`, each export behaves exactly like module 4's \`jest.fn()\` — every configuration method (\`mockReturnValue\`, \`mockResolvedValue\`, \`mockImplementation\`) works identically, since under the hood, that's precisely what an auto-mocked export actually is.

### Mocking with a factory function: full control over the replacement

\`\`\`js
jest.mock("./emailService", () => ({
  sendWelcomeEmail: jest.fn(),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
}))
\`\`\`

Passing a second argument — a **factory function** returning the mock module's shape — gives explicit, complete control over exactly what the mocked module exports, rather than relying on Jest's automatic mock generation. Genuinely useful when a module's real shape is complex, or when you want every export explicitly, visibly defined right where the mock is declared, rather than configured separately afterward.

> **Key idea:** \`jest.mock("./path")\` replaces an entire module's exports with auto-mocked \`jest.fn()\`s for every test in that file — including indirectly, for any code the file under test itself imports — and is automatically hoisted above all \`require\`/\`import\` statements regardless of where it's written. A factory-function second argument gives full, explicit control over the mock's exact shape.`,
    },
    {
      name: "Mocking npm Packages",
      minutes: 8,
      intro: "Applying jest.mock to third-party dependencies, not just your own project's files.",
      content: `### The exact same mechanism, applied to a package name instead of a relative path

\`\`\`js
// weatherService.js
const axios = require("axios")

async function getWeather(city) {
  const response = await axios.get(\`https://api.weather.com/\${city}\`)
  return response.data.temperature
}
module.exports = getWeather
\`\`\`

\`\`\`js
// weatherService.test.js
jest.mock("axios")   // works IDENTICALLY for an npm package as for a local file — just a different specifier
const axios = require("axios")
const getWeather = require("./weatherService")

test("returns the temperature from the API response", async () => {
  axios.get.mockResolvedValue({ data: { temperature: 72 } })

  const temp = await getWeather("London")

  expect(temp).toBe(72)
  expect(axios.get).toHaveBeenCalledWith("https://api.weather.com/London")
})
\`\`\`

\`jest.mock("axios")\` works exactly the same way as mocking a local file from the previous lesson — the module specifier is simply a package name instead of a relative path. This is genuinely the standard, correct way to test any code depending on a third-party HTTP client, database driver, or similar package: real tests shouldn't make real network requests or database calls, no matter whether the dependency making them is your own code or an installed package.

### Mocking fetch specifically: a common, slightly different case

\`\`\`js
// fetch is a GLOBAL, not something you require/import — jest.mock doesn't apply the same way
global.fetch = jest.fn()

test("fetches user data", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ name: "Ada" }),
  })

  const user = await fetchUserName(1)
  expect(user).toBe("Ada")
})
\`\`\`

Recall module 4's brief \`fetch\`-mocking example — because \`fetch\` (in a browser or a modern Node.js runtime) is a **global**, not something explicitly imported via \`require\`, it's mocked by directly assigning \`global.fetch = jest.fn()\` rather than \`jest.mock(...)\`. This is a genuinely common, slightly different pattern worth recognizing, distinct from mocking an actually-imported module or package.

### Mocking only specific exports from a package

\`\`\`js
jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),   // keep every REAL export...
  format: jest.fn(() => "mocked-date"),   // ...except override this ONE specific function
}))
\`\`\`

\`jest.requireActual(moduleName)\` retrieves the **real**, unmocked module — spreading its actual exports and then overriding just one or two specific functions is the standard pattern for a **partial mock**: you want most of a package's real behavior, but need to control one specific, non-deterministic piece (like a date-formatting function whose real output would make test assertions brittle or environment-dependent).

### Mocking a package used deep within your dependency tree

\`\`\`js
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}))
\`\`\`

A common, practical need: mocking a package that generates non-deterministic values (\`uuid\` for random IDs, similar to module 4's date/randomness guidance) specifically so assertions can check for a fixed, predictable value instead — recall module 4's decision guide explicitly listing randomness as a genuine boundary worth mocking, exactly like the current date/time.

### A word on how much of a package to mock

Recall module 4's over-mocking warning, directly applicable here at the package level too: mock the *specific* functions your code actually calls, not an entire large library's full surface just because \`jest.mock\` makes it easy to auto-mock everything at once. An overly broad mock of a large package can silently hide real integration issues (a changed function signature in a new version of the package, for instance) that a more targeted mock — or, better, an integration test using the real package against a test/sandbox environment — would have caught.

> **Key idea:** \`jest.mock\` works identically for npm packages as for local files — the same mechanism, just a package name instead of a relative path. \`fetch\` (a global, not an import) is mocked differently, via direct assignment; \`jest.requireActual\` combined with a factory function is the standard way to keep most of a package's real behavior while overriding just the specific, non-deterministic pieces that make tests brittle.`,
    },
    {
      name: "Manual Mocks with __mocks__",
      minutes: 7,
      intro: "Defining a reusable mock once, shared automatically across every test file that needs it.",
      content: `### The problem: repeating the same mock factory in every test file

\`\`\`js
// userService.test.js
jest.mock("./apiClient", () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

// orderService.test.js
jest.mock("./apiClient", () => ({    // the SAME mock shape, duplicated in a completely different file
  get: jest.fn(),
  post: jest.fn(),
}))
\`\`\`

For a dependency mocked identically across many different test files, repeating the same factory function everywhere is genuinely repetitive — and if the real module's shape ever changes (a new method added), every single duplicated mock needs updating individually.

### __mocks__: a manual mock Jest finds automatically

\`\`\`
src/
  apiClient.js
  __mocks__/
    apiClient.js       <- Jest automatically uses THIS whenever apiClient is mocked, anywhere
\`\`\`

\`\`\`js
// __mocks__/apiClient.js
module.exports = {
  get: jest.fn(),
  post: jest.fn(),
}
\`\`\`

\`\`\`js
// userService.test.js
jest.mock("./apiClient")   // no factory needed — Jest automatically finds and uses __mocks__/apiClient.js

const apiClient = require("./apiClient")

test("fetches a user", async () => {
  apiClient.get.mockResolvedValue({ data: { id: 1, name: "Ada" } })
  // ...
})
\`\`\`

Placing a file with the identical name inside a sibling \`__mocks__\` folder is a convention Jest recognizes automatically — any \`jest.mock("./apiClient")\` call (with no factory function argument) across *any* test file in the project uses this one, shared, manually-written mock, rather than requiring each file to redefine it. This is genuinely the standard approach for a dependency mocked consistently across many test files.

### Manual mocks for node_modules packages: at the project root

\`\`\`
project-root/
  __mocks__/
    axios.js       <- mocks the "axios" PACKAGE, project-wide
  src/
\`\`\`

\`\`\`js
// __mocks__/axios.js
module.exports = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}
\`\`\`

For mocking an actual npm package (rather than your own local file) this way, the \`__mocks__\` folder needs to live at the project root, adjacent to \`node_modules\`, rather than next to the file being tested — this reflects that a package's mock is inherently project-wide, not specific to one particular file's location.

### A genuinely important gotcha: node_modules mocks require jest.mock() explicitly, every time

\`\`\`js
jest.mock("axios")   // REQUIRED, even with a __mocks__/axios.js present — this line is NOT automatic for packages
\`\`\`

Unlike a manual mock for your *own* local file (which still requires \`jest.mock("./apiClient")\` to actually activate it too, worth being clear about), a \`__mocks__\` file for a node_modules package is genuinely never applied automatically just by existing — every test file that wants it still needs its own explicit \`jest.mock("axios")\` call. This is a deliberate Jest design decision, specifically so a package mock never silently, invisibly affects a test file that didn't explicitly opt into it.

### When a manual mock is worth the extra file, vs. an inline factory

For a dependency mocked identically, the same way, across three or more different test files, a \`__mocks__\` file removes real, meaningful duplication. For a dependency mocked only in one or two files, or where each usage needs a genuinely different mock shape anyway, an inline factory function (previous lesson) is simpler and keeps the mock's definition visible directly at its point of use — reach for \`__mocks__\` specifically once duplication becomes a real, felt maintenance cost, not as a default starting point for every mocked dependency.

> **Key idea:** a file in a sibling (or project-root, for packages) \`__mocks__\` folder, matching the real module's name, is automatically used by any \`jest.mock(path)\` call with no factory argument — genuinely valuable for a dependency mocked consistently across many test files, though every file still needs its own explicit \`jest.mock()\` call to actually activate it.`,
    },
    {
      name: "Mock Lifecycle: Clear, Reset & Restore",
      minutes: 7,
      intro: "The three, easily-confused methods for cleaning up a mock's state between tests — and getting the right one.",
      content: `### The problem this lesson solves, directly connected to module 3

\`\`\`js
const sendEmail = jest.fn()

test("first test calls sendEmail once", () => {
  triggerAction(sendEmail)
  expect(sendEmail).toHaveBeenCalledTimes(1)
})

test("second test — but the mock REMEMBERS the previous test's call!", () => {
  triggerAction(sendEmail)
  expect(sendEmail).toHaveBeenCalledTimes(1)   // FAILS — actually 2, since the mock's history wasn't cleared!
})
\`\`\`

This is precisely module 3's shared-state pitfall, applied specifically to mocks: a \`jest.fn()\`'s call history persists across tests unless explicitly cleared — exactly the kind of leaked state module 3 warned produces confusing, order-dependent failures.

### mockClear(): resetting call history only

\`\`\`js
afterEach(() => {
  sendEmail.mockClear()   // resets .mock.calls and .mock.results — but KEEPS any mockImplementation/mockReturnValue
})
\`\`\`

\`.mockClear()\` resets \`.mock.calls\`, \`.mock.instances\`, and \`.mock.results\` back to empty — but leaves any configured implementation or return value **untouched**. Use this when you want a clean call-history slate between tests, but the mock's actual configured *behavior* should stay the same throughout the file.

### mockReset(): clearing AND removing any configured implementation

\`\`\`js
afterEach(() => {
  sendEmail.mockReset()   // clears call history AND removes any mockImplementation/mockReturnValue entirely
})
// after mockReset(), calling sendEmail() returns undefined, until reconfigured
\`\`\`

\`.mockReset()\` does everything \`.mockClear()\` does, *plus* it removes any implementation or return value you'd configured — the mock reverts to a completely bare \`jest.fn()\` with no behavior at all. Use this when different tests in the same file need genuinely different mock behavior, and you don't want one test's configuration accidentally leaking into the next (recall module 3's exact concern).

### mockRestore(): specifically for jest.spyOn — restoring the REAL implementation

\`\`\`js
afterEach(() => {
  trackSpy.mockRestore()   // recall module 4's spyOn lesson — puts the ORIGINAL, real method back
})
\`\`\`

Recall module 4's \`jest.spyOn\` lesson — \`.mockRestore()\` is specifically meaningful for a *spy* (which wraps a real, original implementation): it undoes the wrapping entirely, restoring the genuinely original method. Calling \`.mockRestore()\` on a plain \`jest.fn()\` (which was never wrapping anything real to begin with) is roughly equivalent to \`.mockReset()\`.

### The automatic, project-wide versions in jest.config.js

\`\`\`js
// jest.config.js
module.exports = {
  clearMocks: true,     // automatically calls mockClear() on every mock, before every test
  resetMocks: true,        // automatically calls mockReset() on every mock, before every test
  restoreMocks: true,        // automatically calls mockRestore() on every mock, before every test
}
\`\`\`

Rather than remembering to manually call one of these three in an \`afterEach\` for every single mock across a whole project, Jest's configuration (covered in full in module 11) can apply one of them **automatically**, before every single test, project-wide — genuinely the more reliable, common approach in a real codebase, since it removes the possibility of simply forgetting the cleanup call in some specific file.

### The practical rule for choosing between the three

| Method | Clears call history | Removes configured behavior | Restores original (spyOn only) |
|---|---|---|---|
| \`mockClear\` | Yes | No | No |
| \`mockReset\` | Yes | Yes | No |
| \`mockRestore\` | Yes | Yes | Yes |

The safest, most conservative default for most projects is \`restoreMocks: true\` in configuration — it's the strictest of the three (clears everything, including restoring spies to their real implementations), which means it's very unlikely to accidentally leak configured mock behavior between tests, directly addressing module 3's core isolation concern as a blanket, project-wide default rather than something to remember file by file.

> **Key idea:** \`mockClear\` resets only call history; \`mockReset\` additionally removes configured behavior; \`mockRestore\` (spies only) additionally restores the real, original implementation — each strictly does more than the last. Configuring \`restoreMocks: true\` project-wide is the safest default, applying the strictest cleanup automatically before every test rather than relying on remembering it in every file's \`afterEach\`.`,
    },
  ],
}
