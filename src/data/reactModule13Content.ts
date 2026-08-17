import type { Module } from "../types"

export const reactModule13: Module = {
  id: 13,
  title: "Testing React Applications",
  status: "upcoming",
  lessons: [
    {
      name: "Testing Philosophy & Setup",
      minutes: 8,
      intro: "Why React Testing Library tests behavior, not implementation — and getting it running.",
      content: `### The guiding principle: test what the user sees and does

React Testing Library (RTL), the standard tool for testing React components, is built around one deliberate philosophy, stated directly in its own documentation: **"the more your tests resemble the way your software is used, the more confidence they can give you."** Concretely, this means tests interact with a component the way a real user would — finding a button by its visible text and clicking it — rather than reaching into a component's internal state or calling its methods directly.

### Setting up

\`\`\`bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
\`\`\`

\`\`\`js
// vite.config.js
export default defineConfig({
  test: {
    environment: "jsdom",   // simulates a browser DOM in Node, since tests don't run in a real browser
    globals: true,
  },
})
\`\`\`

**Vitest** (built by the Vite team, and integrating directly with a Vite project's existing configuration) is the current standard test runner for React projects built with Vite — genuinely the natural pairing, the same way Jest paired with Create React App historically. \`jsdom\` simulates enough of a real browser's DOM in plain Node.js for component tests to run without an actual browser.

### A first test

\`\`\`jsx
// Greeting.jsx
export function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}
\`\`\`

\`\`\`jsx
// Greeting.test.jsx
import { render, screen } from "@testing-library/react"
import { Greeting } from "./Greeting"

test("renders a greeting with the given name", () => {
  render(<Greeting name="Ada" />)
  expect(screen.getByText("Hello, Ada!")).toBeInTheDocument()
})
\`\`\`

\`render(<Greeting name="Ada" />)\` renders the component into a simulated DOM (via \`jsdom\`); \`screen.getByText(...)\` searches that rendered output for an element containing the given text, exactly as a real user would visually scan the page — this is the core RTL pattern: render, then query for what should be visible, then assert.

### Why this philosophy matters: tests that survive refactoring

\`\`\`jsx
// this test does NOT care whether Greeting uses useState internally, a class component,
// or any particular internal structure — only that "Hello, Ada!" actually appears on screen
test("renders a greeting", () => {
  render(<Greeting name="Ada" />)
  expect(screen.getByText("Hello, Ada!")).toBeInTheDocument()
})
\`\`\`

A test written this way keeps passing even if you completely rewrite \`Greeting\`'s internals (switch from \`useState\` to \`useReducer\`, restructure how it's built) — as long as the *user-visible behavior* stays the same. This is a deliberate, genuinely important design goal: tests that verify behavior, not implementation details, don't need constant rewriting every time you refactor, which is precisely what makes a test suite trustworthy and worth maintaining long-term rather than becoming a maintenance burden itself.

### The queries RTL provides, by priority

\`\`\`jsx
screen.getByRole("button", { name: "Submit" })   // preferred — matches how assistive tech identifies elements
screen.getByLabelText("Email")                     // preferred for form fields — matches a label to its input
screen.getByText("Welcome back")                     // matches by visible text content
screen.getByTestId("custom-element")                   // last resort — a data-testid attribute, no semantic meaning
\`\`\`

RTL's own documentation recommends a specific priority order, and it's worth taking seriously: \`getByRole\` (directly connects to this platform's HTML course's accessibility module — if a query can't find an element by its accessible role, that's often a sign the markup itself has an accessibility gap) should be your first choice; \`getByTestId\` should be a genuine last resort, used only when no semantic query can locate the element at all.

> **Key idea:** React Testing Library deliberately tests components the way a real user experiences them — rendering, then querying for visible text/roles, then asserting — rather than reaching into internal implementation details, which is precisely what keeps tests valid across refactors and forces query priority toward genuinely accessible markup.`,
    },
    {
      name: "Testing User Interaction",
      minutes: 9,
      intro: "Simulating real clicks, typing, and form submissions — not just checking static rendered output.",
      content: `### userEvent: simulating realistic user interaction

\`\`\`jsx
// Counter.jsx
export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
\`\`\`

\`\`\`jsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Counter } from "./Counter"

test("increments the count when clicked", async () => {
  const user = userEvent.setup()
  render(<Counter />)

  expect(screen.getByText("Count: 0")).toBeInTheDocument()

  await user.click(screen.getByRole("button"))

  expect(screen.getByText("Count: 1")).toBeInTheDocument()
})
\`\`\`

\`@testing-library/user-event\` simulates a genuinely realistic sequence of browser events (not just a single synthetic click event, but the full sequence a real click actually triggers) — it's the recommended way to interact with a rendered component in a test, preferred over RTL's lower-level \`fireEvent\` for anything resembling real user behavior. Note it's \`async\` — every \`user\` interaction returns a Promise (recall this platform's JavaScript course, module 8), since \`userEvent\` models realistic timing between events.

### Testing typing into an input

\`\`\`jsx
// SearchBox.jsx
export function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("")
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(query) }}>
      <input aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  )
}
\`\`\`

\`\`\`jsx
test("calls onSearch with the typed query", async () => {
  const user = userEvent.setup()
  const handleSearch = vi.fn()   // a mock function, covered fully in the next lesson

  render(<SearchBox onSearch={handleSearch} />)

  await user.type(screen.getByLabelText("Search"), "react hooks")
  await user.click(screen.getByRole("button", { name: "Search" }))

  expect(handleSearch).toHaveBeenCalledWith("react hooks")
})
\`\`\`

This directly tests module 9's controlled-input pattern — \`user.type\` simulates realistic keystrokes into the input (each one individually, triggering the same \`onChange\` cascade a real user's typing would), and the assertion confirms the *end result* (what \`onSearch\` was called with) rather than checking the input's internal state directly at any point.

### Testing conditional rendering

\`\`\`jsx
// LoginForm.jsx
export function LoginForm() {
  const [error, setError] = useState(null)

  function handleSubmit(email) {
    if (!email.includes("@")) {
      setError("Enter a valid email")
      return
    }
    setError(null)
  }

  return (
    <div>
      <input aria-label="Email" onChange={(e) => handleSubmit(e.target.value)} />
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
\`\`\`

\`\`\`jsx
test("shows a validation error for an invalid email", async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText("Email"), "not-an-email")

  expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email")
})

test("does not show an error for a valid email", async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText("Email"), "ada@example.com")

  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
})
\`\`\`

Recall module 2's \`&&\` conditional-rendering pattern — testing it directly checks whether the error element is present or absent after a given interaction. Notice the second test uses \`queryByRole\`, not \`getByRole\`: RTL's \`getBy*\` queries **throw** if nothing matches (appropriate when you expect the element to exist), while \`queryBy*\` returns \`null\` instead (necessary specifically when asserting something is *absent*, since \`getBy*\` would fail the test with an unhelpful "not found" error before your actual assertion even runs).

### findBy: querying for something that appears asynchronously

\`\`\`jsx
test("shows the user's name after loading", async () => {
  render(<UserProfile userId="1" />)

  expect(screen.getByText("Loading...")).toBeInTheDocument()

  const name = await screen.findByText("Ada Lovelace")   // waits for it to appear, up to a timeout
  expect(name).toBeInTheDocument()
})
\`\`\`

For content that appears after an asynchronous operation (module 5/12's data fetching), \`findBy*\` queries return a Promise that resolves once the matching element actually appears (or rejects after a timeout if it never does) — the correct tool specifically for async UI, as distinct from \`getBy*\` (synchronous, must already be present) and \`queryBy*\` (synchronous, for asserting absence).

> **Key idea:** \`userEvent\` (not the lower-level \`fireEvent\`) is the standard way to simulate realistic interaction; \`getBy*\` asserts presence and throws if missing, \`queryBy*\` returns \`null\` for asserting absence, and \`findBy*\` awaits something that appears asynchronously — picking the right one of these three query types is the core skill for testing interactive, dynamic components correctly.`,
    },
    {
      name: "Mocking & Testing Async Code",
      minutes: 9,
      intro: "Isolating a component from real network requests and external dependencies during a test.",
      content: `### The problem: tests shouldn't depend on a real, live server

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`).then((res) => res.json()).then(setUser)
  }, [userId])
  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
\`\`\`

A test that renders \`UserProfile\` and lets its real \`fetch\` call hit an actual server is genuinely undesirable: it's slow, it's flaky (fails if the network or server has any issue unrelated to the actual code being tested), and it depends on specific server-side data existing, which can change or not be available at all in a test environment.

### Mocking fetch directly

\`\`\`jsx
import { vi } from "vitest"

test("displays the user's name after fetching", async () => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ name: "Ada Lovelace" }),
    })
  ))

  render(<UserProfile userId="1" />)

  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument()
})
\`\`\`

\`vi.fn()\` creates a **mock function** — a fake, controllable stand-in that records how it was called and returns whatever you tell it to, rather than performing the real operation. \`vi.stubGlobal("fetch", ...)\` replaces the global \`fetch\` for the duration of this test with the mock, so \`UserProfile\`'s effect calls the fake version instead of making a real network request.

### Mock Service Worker (MSW): mocking at the network level instead

\`\`\`jsx
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const server = setupServer(
  http.get("/api/users/:userId", ({ params }) => {
    return HttpResponse.json({ id: params.userId, name: "Ada Lovelace" })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test("displays the user's name", async () => {
  render(<UserProfile userId="1" />)
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument()
})
\`\`\`

**MSW** intercepts requests at the network level, rather than replacing \`fetch\` itself — the component's code runs completely unmodified, genuinely calling \`fetch\`, with MSW intercepting that call before it leaves the process and responding with mock data. This is the current, widely recommended approach for anything beyond the simplest single-test mock, since the exact same mock handlers can be reused across many tests (and even in local development), and the component under test never needs any awareness that it's being tested at all.

### Checking that a function was called correctly

\`\`\`jsx
test("calls onDelete with the correct id when delete is clicked", async () => {
  const user = userEvent.setup()
  const handleDelete = vi.fn()

  render(<TodoItem todo={{ id: 5, text: "Buy milk" }} onDelete={handleDelete} />)

  await user.click(screen.getByRole("button", { name: "Delete" }))

  expect(handleDelete).toHaveBeenCalledTimes(1)
  expect(handleDelete).toHaveBeenCalledWith(5)
})
\`\`\`

This directly tests module 3's props/callback pattern — rather than trying to verify some internal effect of clicking delete, the test simply confirms the *callback prop* was invoked with the correct argument, which is precisely the observable, user-facing contract \`TodoItem\` actually promises to its parent.

### Testing a custom hook directly

\`\`\`jsx
import { renderHook, act } from "@testing-library/react"
import { useCounter } from "./useCounter"

test("increments the count", () => {
  const { result } = renderHook(() => useCounter(0))

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
\`\`\`

Recall module 7's custom hooks — since a hook can't be called outside a component (the rules of hooks), \`renderHook\` provides a minimal, invisible wrapper component specifically so a hook's behavior can be tested in isolation, without needing to render (and interact with) a full UI component that happens to use it. \`act(...)\` ensures React fully processes the resulting state update before the assertion runs — necessary because, recall module 4, \`setState\` schedules an update rather than applying it synchronously.

> **Key idea:** mocking (via \`vi.fn()\`/\`vi.stubGlobal\`, or more thoroughly via MSW's network-level interception) isolates a test from real network requests, making it fast and reliable; assertions on interactive components should verify the observable, user-facing contract (a callback prop being called correctly) rather than internal implementation, and \`renderHook\` lets a custom hook be tested directly, honoring the rules of hooks without a full component render.`,
    },
    {
      name: "What (and What Not) to Test",
      minutes: 7,
      intro: "Building good testing judgment — where tests provide real, ongoing value, and where they're wasted effort.",
      content: `### The testing pyramid, applied to a React app

\`\`\`
       /\\
      /E2E\\           <- few: full user flows through a real (or near-real) app, slowest, most confidence
     /------\\
    /Integr. \\        <- more: multiple components working together, medium speed
   /----------\\
  / Unit tests \\      <- most: individual functions/hooks/small components, fastest, most numerous
 /--------------\\
\`\`\`

A healthy test suite generally has many fast, focused **unit tests** (individual functions, hooks, or small components in isolation), a moderate number of **integration tests** (several components working together, closer to how the app is actually used — most of this module's examples are integration-style tests, in this sense), and a small number of **end-to-end tests** (Cypress or Playwright, driving an actual running app through a real browser) covering only the most critical user flows, since they're the slowest and most expensive to maintain.

### What's genuinely worth testing

- **Business logic and utility functions** — a pure function computing a total, formatting a date, validating input (recall the JavaScript course's pure-function discussion) — fast, isolated, high-value unit tests.
- **User interactions with real consequences** — submitting a form, adding an item to a cart, a validation error appearing correctly — exactly this module's earlier lessons' examples.
- **Custom hooks with non-trivial logic** — module 7's \`useDebounce\`, \`useLocalStorage\`, and similar, tested directly via \`renderHook\`.
- **Critical, high-stakes user flows** — signup, checkout, login — worth a genuine end-to-end test, since these are the flows where a real, production bug is most costly.

### What's usually a waste of effort

\`\`\`jsx
// testing that a div has a specific className — brittle, and tells you nothing about actual USER-FACING behavior
test("has the correct className", () => {
  render(<Card />)
  expect(screen.getByTestId("card")).toHaveClass("card-container")
})
\`\`\`

Testing purely implementation-level details — an exact CSS class name, an internal variable's name, the precise number of times an internal (not user-visible) function was called — produces tests that break the moment you refactor, without the refactor introducing any actual bug at all. Recall this lesson's opening philosophy: a test should verify *behavior*, not internal structure — a test asserting a specific CSS class exists tells you almost nothing about whether the component actually works correctly for a real user.

### Snapshot testing: useful in moderation, easy to misuse

\`\`\`jsx
test("matches snapshot", () => {
  const { container } = render(<Card title="Hello" />)
  expect(container).toMatchSnapshot()
})
\`\`\`

A **snapshot test** saves a component's rendered output and fails if it ever changes — genuinely useful for catching *unintentional* changes to something like a design-system component's output. The real danger: snapshot tests are extremely easy to blindly "update" (re-approve) without actually reviewing what changed, at which point they provide no real protection at all — worth using sparingly, and always genuinely reviewing a snapshot diff before approving it, not just running the update command reflexively.

### Coverage percentage: a signal, not a target

\`\`\`bash
npm run test -- --coverage
\`\`\`

Test coverage tools report what percentage of your code's lines/branches are executed by your test suite — a useful signal for spotting genuinely untested areas, but a dangerous target to chase for its own sake: 100% coverage is achievable while testing almost nothing meaningful (calling every function once, asserting nothing useful about its actual behavior). Treat a coverage report as a tool for finding gaps to investigate, never as a goal to hit for its own sake, disconnected from whether the tests that produced that number actually verify anything real.

> **Key idea:** the most valuable tests verify genuine, observable user-facing behavior — business logic, interactions with real consequences, critical flows — while tests asserting internal implementation details (exact class names, internal call counts) are brittle and low-value; a healthy suite has many fast unit/integration tests and only a few, carefully chosen end-to-end tests for the highest-stakes flows.`,
    },
  ],
}
