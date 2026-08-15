import type { Module } from "../types"

export const jestModule8: Module = {
  id: 8,
  title: "Snapshot Testing",
  status: "upcoming",
  lessons: [
    {
      name: "How Snapshots Work",
      minutes: 8,
      intro: "A fundamentally different kind of test — saving output rather than writing an expected value by hand.",
      content: `### The problem: writing out an expected value by hand is tedious for large output

\`\`\`js
function generateInvoice(order) {
  return {
    id: order.id,
    items: order.items.map((i) => ({ name: i.name, total: i.price * i.quantity })),
    subtotal: order.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    tax: 0,
    total: 0,
    generatedAt: new Date().toISOString(),
  }
}
\`\`\`

Recall module 2's \`toEqual\` for objects — writing out the *entire* expected shape of a large, nested object by hand, every time it changes even slightly, is genuinely tedious, and the expected value in the test becomes just as much a maintenance burden as the code itself.

### toMatchSnapshot: capturing output automatically, the first time

\`\`\`js
test("generates an invoice with the correct structure", () => {
  const invoice = generateInvoice({ id: 1, items: [{ name: "Book", price: 15, quantity: 2 }] })
  expect(invoice).toMatchSnapshot()
})
\`\`\`

The **first time** this test runs, Jest doesn't compare against anything — it simply captures \`invoice\`'s current value and saves it to a snapshot file, then passes automatically. Every subsequent run compares the *new* output against that saved snapshot — if they match, the test passes; if they differ, the test fails, showing a diff between the old and new output.

### Where the snapshot actually lives

\`\`\`
src/
  invoice.js
  invoice.test.js
  __snapshots__/
    invoice.test.js.snap    <- auto-generated, and (by convention) committed to version control
\`\`\`

\`\`\`js
// __snapshots__/invoice.test.js.snap (auto-generated content)
exports[\`generates an invoice with the correct structure 1\`] = \`
{
  "id": 1,
  "items": [{ "name": "Book", "total": 30 }],
  "subtotal": 30,
  ...
}
\`
\`\`\`

Jest automatically creates a \`__snapshots__\` folder next to the test file, with one \`.snap\` file per test file, keyed by each test's full name. This file **should be committed to git** — it's not a throwaway artifact; it's the actual "expected value" for every snapshot test in that file, and reviewing changes to it in a pull request is precisely how a teammate notices an unintended change to your output (covered fully in lesson 3).

### When a snapshot genuinely fails: an intentional change vs. a real bug

\`\`\`
- Snapshot
+ Received

  {
    "id": 1,
-   "tax": 0,
+   "tax": 2.4,
    "total": 0,
  }
\`\`\`

A snapshot failure means exactly one of two things: either the code has a genuine, unintended bug that changed its output (here, perhaps a tax calculation was accidentally introduced or broken), or the change was **intentional** — you deliberately changed \`generateInvoice\` to include real tax, and the snapshot simply needs updating to reflect the new, correct expected output. Distinguishing between these two is precisely what makes reviewing a snapshot diff before updating it genuinely important, covered directly in lesson 3.

### Updating a snapshot deliberately

\`\`\`bash
npx jest --updateSnapshot   # or the shorthand: npx jest -u
\`\`\`

Once you've reviewed the diff and confirmed the new output is correct and intentional, \`--updateSnapshot\` (or pressing \`u\` interactively in watch mode) overwrites the saved snapshot with the new value — from that point forward, the new output becomes the expected baseline for future runs.

> **Key idea:** \`toMatchSnapshot()\` captures a value's actual output the first time a test runs and compares against that saved baseline on every future run — the \`.snap\` file should be committed to version control, and a failure means either a real bug or an intentional change, which only reviewing the actual diff (lesson 3) can distinguish.`,
    },
    {
      name: "Inline Snapshots",
      minutes: 6,
      intro: "Storing a snapshot's expected value directly in the test file, rather than a separate .snap file.",
      content: `### toMatchInlineSnapshot: the snapshot lives right in the test

\`\`\`js
test("formats a short greeting", () => {
  expect(formatGreeting("Ada")).toMatchInlineSnapshot()
})
\`\`\`

Running this test for the first time, Jest doesn't just save the value to a separate file — it **rewrites the test file itself**, inserting the captured value directly as an argument:

\`\`\`js
test("formats a short greeting", () => {
  expect(formatGreeting("Ada")).toMatchInlineSnapshot(\`"Hello, Ada!"\`)
})
\`\`\`

On every future run, the assertion compares against this inline value directly — functionally identical to the previous lesson's \`toMatchSnapshot\`, just stored differently: as a literal argument in the source file, rather than a separate, generated \`.snap\` file.

### The genuine tradeoff: visibility vs. file size

\`\`\`js
// inline: the expected value is RIGHT THERE, visible while reading the test — no need to open another file
test("computes a small summary", () => {
  expect(summarize(data)).toMatchInlineSnapshot(\`
    {
      "count": 3,
      "total": 45,
    }
  \`)
})
\`\`\`

The genuine advantage of an inline snapshot: reading the test, you immediately see exactly what's expected, without needing to separately open a \`.snap\` file to understand what the test is actually verifying — this directly improves on the previous lesson's separate-file approach for **small**, easily-readable output. The tradeoff, just as genuine: for large output (the full invoice example from the previous lesson), an inline snapshot bloats the test file itself, making the actual test logic harder to read amid a large block of embedded, generated data — exactly the case where a separate \`.snap\` file remains the better fit.

### The practical rule: inline for small values, regular for large ones

| Output size | Reach for |
|---|---|
| A short string, a small object (a handful of fields) | \`toMatchInlineSnapshot\` |
| A large object, a full rendered component tree, a big array | \`toMatchSnapshot\` (separate \`.snap\` file) |

This isn't a strict, enforced rule — but it's worth treating as a genuine default, since it directly optimizes for what each format is actually good at: inline snapshots keep small expected values visible right where they're used; separate \`.snap\` files keep a test file's actual logic readable even when the expected output itself is large.

### Updating inline snapshots works identically

\`\`\`bash
npx jest --updateSnapshot   # updates BOTH inline and regular snapshots, in the same command
\`\`\`

The same \`--updateSnapshot\`/\`-u\` flag from the previous lesson updates inline snapshots too — Jest rewrites the literal argument in the source file directly, exactly as it did on the very first run, just with the new value instead of creating it for the first time.

> **Key idea:** \`toMatchInlineSnapshot\` stores the expected value directly in the test file (auto-written by Jest on first run) rather than a separate \`.snap\` file — genuinely better for small, easily-readable values where seeing the expectation right in the test aids readability; regular \`toMatchSnapshot\` remains the better fit once the expected output grows large enough to clutter the test file itself.`,
    },
    {
      name: "When Snapshots Help — and When They Quietly Hurt",
      minutes: 8,
      intro: "The real, well-known danger of snapshot testing, and how to use it in a way that avoids it.",
      content: `### The danger, stated plainly: snapshots are extremely easy to approve without actually looking

\`\`\`bash
npx jest --updateSnapshot   # updates EVERY failing snapshot in the entire project, all at once, no review required
\`\`\`

This is the single most important thing to understand about snapshot testing, and it's a genuinely well-known, real criticism of the technique: because updating a snapshot is a single command that blindly accepts whatever the *current* output is, it's entirely possible to run \`--updateSnapshot\` reflexively whenever a test fails — without actually reading the diff — silently baking a genuine regression into the new "expected" baseline. From that point on, the bug is permanently invisible to the test suite, since the snapshot now matches the buggy output by definition.

### A concrete illustration of the trap

\`\`\`
- Snapshot
+ Received

  {
    "price": "$29.99",
+   "price": "$NaN",
  }
\`\`\`

If you run \`--updateSnapshot\` here without reading this diff, you've just permanently taught the test suite that \`"$NaN"\` is the *correct*, expected output for this case — the test will now pass forever, even though the output is obviously, genuinely broken. This is precisely why the discipline of **actually reading every snapshot diff before approving it** is not optional advice — it's the entire difference between a snapshot test providing real protection versus providing none at all while *appearing* to.

### Where snapshots genuinely earn their place

\`\`\`js
test("renders the design system Button with default props", () => {
  const button = render(<Button>Click me</Button>)
  expect(button.container).toMatchSnapshot()
})
\`\`\`

Recall this platform's React course's module 13 mention of snapshot testing — the strongest, most genuinely valuable case is exactly this: a component (or any output) that should **only** change when someone *deliberately* changes it, where any unexpected diff is inherently suspicious and worth investigating. A shared design-system component's rendered output is a good fit precisely because it changes rarely and deliberately.

### Where snapshots quietly hurt: output that changes often and legitimately

\`\`\`js
// AVOID: this output changes on every single code change to ANY part of a complex page,
// producing a huge, hard-to-review diff nearly every time, training reviewers to skim past it
test("renders the entire dashboard page", () => {
  const dashboard = render(<Dashboard />)
  expect(dashboard.container).toMatchSnapshot()   // hundreds of lines of nested HTML
})
\`\`\`

A snapshot of something large and frequently, legitimately changing produces enormous diffs on nearly every run — and genuinely, predictably, this trains developers to stop actually reading them carefully, since doing so thoroughly every single time becomes impractical. At that point, the snapshot test has stopped providing real protection; it's become pure ceremony, a checkbox to blindly approve. This is the exact mechanism behind snapshot testing's well-earned reputation as easy to misuse.

### The practical guidance: prefer specific assertions; use snapshots narrowly and deliberately

\`\`\`js
// PREFER specific, targeted assertions over a broad snapshot, whenever practical
test("renders the button with the correct label", () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()   // recall the React course's module 13
})
\`\`\`

Recall this platform's React course's module 13 testing-philosophy lesson directly: a specific assertion (\`getByRole\`, a precise \`toEqual\`) states exactly what you expect and produces a genuinely readable failure message when it's wrong — this remains the preferred default for most tests. Reach for a snapshot specifically when the output is: genuinely large and tedious to assert on piece by piece, expected to change rarely, and where any diff at all is inherently worth a human's attention — not as a default, low-effort substitute for actually thinking about what a test should verify.

### A practical habit: review every snapshot diff like a real code review

Before running \`--updateSnapshot\`, actually read what changed, and ask the same question you would of any code review: is this change *intentional and correct*? Treating a snapshot update with the same scrutiny as reviewing a teammate's pull request — not as a mechanical "make the red text go away" action — is genuinely what determines whether a project's snapshot tests provide real, ongoing value or just false confidence.

> **Key idea:** a snapshot test's entire value depends on someone actually reading the diff before approving an update — reflexively running \`--updateSnapshot\` without review can permanently bake a real bug into the accepted baseline. Prefer specific, targeted assertions by default; reach for snapshots deliberately, only for output that's large, changes rarely, and where any diff genuinely deserves scrutiny.`,
    },
  ],
}
