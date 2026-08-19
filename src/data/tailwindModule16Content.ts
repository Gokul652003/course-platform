import type { Module } from "../types"

export const tailwindModule16: Module = {
  id: 16,
  title: "Production, Performance & Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "How Content Scanning & the JIT Engine Work",
      minutes: 9,
      intro: "See how Tailwind finds your classes as plain text and why fully dynamic class names break.",
      content: `### There's no Tailwind "runtime"

It's worth being precise about what Tailwind actually is: a **build-time CSS generator**, not a runtime library. Nothing ships to the browser that "is Tailwind" — by the time your app runs, Tailwind has already finished its job and handed off a plain \`.css\` file full of ordinary class selectors. There's no JavaScript watching your DOM, no client-side style computation, no bundle size cost from "using more of Tailwind."

This is fundamentally different from something like a CSS-in-JS library that generates styles at runtime based on props. Tailwind's entire value proposition — including its performance story — comes from doing all the work ahead of time, once, at build.

### Scanning is just text search

Here's the part that surprises people: Tailwind doesn't parse your JSX, understand your component tree, or evaluate any JavaScript to figure out what classes you're using. It scans your source files **as plain text**, looking for strings that look like they could be class names, using a set of pattern rules tuned to catch real-world usage.

\`\`\`tsx
function Button({ variant }: { variant: "primary" | "danger" }) {
  return (
    <button className="rounded-lg px-4 py-2 font-semibold hover:opacity-90">
      Click me
    </button>
  )
}
\`\`\`

Tailwind's scanner sees this file as text, finds \`rounded-lg\`, \`px-4\`, \`py-2\`, \`font-semibold\`, and \`hover:opacity-90\` as candidate strings, checks each one against its utility-generation rules, and — because they're all valid utilities — generates the matching CSS. It doesn't know or care that these are inside a \`className\` attribute specifically; it would find the same strings in a comment, a \`.md\` file, or a config object, and generate CSS for them just the same.

### Why this means it can't see fully dynamic class names

Because scanning is textual, not semantic, Tailwind can only generate CSS for strings that literally appear, complete, somewhere in your source. This breaks a pattern that feels natural coming from most templating systems — building a class name via string interpolation:

\`\`\`tsx
// BROKEN — Tailwind will never generate this CSS
function Badge({ color }: { color: "red" | "green" | "blue" }) {
  return <span className={\`text-\${color}-500\`}>Status</span>
}
\`\`\`

The literal text in the source file is \`text-\${color}-500\` — that's not a valid utility name, so nothing gets generated. At runtime, when \`color\` is \`"red"\`, the DOM ends up with \`class="text-red-500"\`, but there's no CSS rule for \`.text-red-500\` in your stylesheet, because it never existed as text at build time. The element renders with no color styling at all, and — this is the frustrating part — nothing errors. It just silently doesn't work.

### The fix: write out full class strings

The rule of thumb is simple: **every class name Tailwind should generate must appear complete, as a literal string, in some file it scans.** The cleanest fix is a lookup object mapping your dynamic value to a full, static class string:

\`\`\`tsx
// WORKS — every possible class name is written out in full
const colorClasses = {
  red: "text-red-500",
  green: "text-green-500",
  blue: "text-blue-500",
} as const

function Badge({ color }: { color: keyof typeof colorClasses }) {
  return <span className={colorClasses[color]}>Status</span>
}
\`\`\`

Now \`text-red-500\`, \`text-green-500\`, and \`text-blue-500\` all appear as complete literal strings in this file, so Tailwind's scanner finds all three, generates CSS for all three, and the runtime lookup just picks which already-generated class to apply. This costs a little more upfront typing than string interpolation, but it's the pattern that actually works — and it also makes every possible visual state of the component grep-able and self-documenting.

### Safelisting as a last resort

Sometimes you genuinely can't enumerate the classes ahead of time — e.g. class names coming from a CMS or a third-party API response. For that narrow case, v4 supports \`@source inline()\` in your CSS to force-generate a set of classes even though they won't be found by normal scanning:

\`\`\`css
@import "tailwindcss";

/* generate these regardless of whether the scanner finds them in source */
@source inline("{,hover:,focus:}text-{red,green,blue}-{400,500,600}");
\`\`\`

The brace syntax expands combinatorially — that one line generates every combination of the three variant prefixes, three colors, and three shades. Reach for this only when the lookup-object pattern truly doesn't fit; it's an escape hatch, not a first choice, because it generates CSS whether or not you end up using every combination.

### Content detection: v3 vs v4

| | Tailwind v3 | Tailwind v4 |
|---|---|---|
| How files are found | Manual \`content: [...]\` glob array in \`tailwind.config.js\` | Automatic — walks the project from the CSS file, respects \`.gitignore\` |
| Forgetting to register a directory | Silent missing styles, common bug | Rare — new directories are picked up automatically |
| Extra/unusual sources (e.g. outside the project, or gitignored on purpose) | Add to \`content\` array | Add explicitly via \`@source "path"\` |
| Force-generating specific classes | \`safelist\` option in config | \`@source inline("...")\` in CSS |

Both versions share the same fundamental constraint, though: scanning is text-based in both, so the "no fully dynamic class names" rule applies equally to v3 and v4 — automatic detection solves *where to look*, not *what counts as a valid class name*.

> **Key idea:** Tailwind generates CSS only for class name strings that appear complete and literal somewhere in your scanned source — so build dynamic styling with a lookup object of full class strings, never with string interpolation, and reach for \`@source inline()\` safelisting only when enumeration truly isn't possible.`,
    },
    {
      name: "Optimizing Build Size",
      minutes: 9,
      intro: "Understand what actually drives CSS bundle size and how to keep it lean in production.",
      content: `### Bundle size tracks distinct usage, not utility count

A common misconception: "Tailwind ships thousands of utilities, so using Tailwind means a huge CSS file." In practice the opposite is true. Tailwind's whole design is that **only the utilities you actually use get generated** — the thousands of possible classes in the framework's surface area cost you nothing until you write them in your markup.

What actually determines your final CSS size is the number of **distinct class names your project references**, not which specific ones, and not how many total elements use them. Using \`p-4\` on 500 different elements costs the same as using it on one — it's a single CSS rule either way, since it's a shared class, not per-element inline styles.

\`\`\`html
<!-- these three divs cost exactly ONE rule's worth of CSS: .p-4 { padding: 1rem; } -->
<div class="p-4">A</div>
<div class="p-4">B</div>
<div class="p-4">C</div>
\`\`\`

So the lever that actually grows your stylesheet is **the number of unique utility combinations across your whole app** — not usage count, and not which of Tailwind's thousands of possible utilities you happen to use.

### Where size actually creeps in: one-off arbitrary values

The most common way projects accidentally bloat their CSS is through arbitrary values that are each slightly different from the last, generating a new, unshared rule every time:

\`\`\`html
<!-- three different developers, three slightly different one-off values -->
<div class="mt-[13px]">...</div>
<div class="mt-[15px]">...</div>
<div class="mt-[14px]">...</div>
\`\`\`

Each of these is a distinct class, so each generates its own CSS rule — three rules doing almost the same job, none of them reusable elsewhere in the app. Compare that to sticking to the design scale:

\`\`\`html
<div class="mt-3">...</div> <!-- 0.75rem -->
<div class="mt-4">...</div> <!-- 1rem -->
\`\`\`

Design-scale values are shared across the entire app, so the marginal cost of using \`mt-4\` somewhere new is zero — that rule already exists. Arbitrary values aren't wrong (they're genuinely useful for one-off alignment against a design mockup, or matching a third-party widget's exact pixel dimensions), but treat them as an exception, not a habit — a codebase with hundreds of near-duplicate arbitrary values pays for it in both CSS size and in "why are these six components almost-but-not-quite aligned" maintenance headaches.

### Minification in production

Tailwind's Vite and PostCSS plugins produce readable, unminified CSS in development for fast rebuilds and easier debugging. Your production build step handles minification — Vite (and most modern bundlers) does this automatically for the final build output:

\`\`\`bash
vite build
\`\`\`

Minification strips whitespace and comments and can merge/shorten selectors, typically cutting file size substantially beyond gzip alone. You don't need to configure anything extra for this in a standard Vite/Tailwind v4 setup — just make sure you're actually running the production build command (\`vite build\`), not shipping the dev-server output.

Beyond minification, standard HTTP compression (gzip or, better, Brotli) at your CDN/server layer does most of the remaining heavy lifting — Tailwind's generated CSS compresses extremely well because of how repetitive utility class syntax is (lots of shared prefixes like \`text-\`, \`bg-\`, \`hover:\`).

### @layer: keep custom CSS from fighting utilities

Tailwind v4 generates CSS using native **cascade layers** (\`@layer\`), which gives you a clean, predictable way to mix hand-written CSS with utilities without specificity wars. The layers, in increasing priority, are roughly: \`theme\`, \`base\`, \`components\`, \`utilities\`.

The rule that matters day-to-day: **any custom CSS you write for reusable component classes should go inside \`@layer components\`**, so it stays lower-priority than utilities and can still be overridden by a utility class on the element, exactly the way you'd expect:

\`\`\`css
@import "tailwindcss";

@layer components {
  .btn {
    @apply rounded-lg px-4 py-2 font-semibold text-white;
    background: var(--color-brand);
  }
}
\`\`\`

\`\`\`html
<!-- utility on the element still wins, because utilities are a higher layer -->
<button class="btn bg-red-500">Danger button</button>
\`\`\`

Without \`@layer\`, plain custom CSS is added outside the cascade layer system entirely, which typically means it ends up with *higher* effective priority than Tailwind's utilities (because of source order and Tailwind's internal layering), so a utility class you add later to override it silently loses. Getting bitten by this once is usually what teaches people to always reach for \`@layer components\` for reusable custom classes, and \`@layer base\` for element-level resets/defaults:

\`\`\`css
@layer base {
  h1 {
    @apply text-3xl font-bold;
  }
}
\`\`\`

### A quick build-size checklist

| Do | Avoid |
|---|---|
| Use design-scale spacing/sizing utilities | One-off arbitrary values sprinkled everywhere |
| Share component classes via \`@layer components\` + \`@apply\` for truly repeated patterns | Hand-written CSS outside any \`@layer\`, fighting utility specificity |
| Let the production build step (\`vite build\`) minify | Shipping unminified dev CSS to production |
| Rely on gzip/Brotli at the server/CDN | Assuming you need a Tailwind-specific compression step (you don't) |
| Use \`@source inline()\` sparingly, only for truly dynamic classes | Safelisting broad combinatorial ranges "just in case" |

> **Key idea:** Your CSS bundle size is driven by how many *distinct* utility combinations exist across your app, not by how many times each is used or how many utilities Tailwind ships — keep to the design scale instead of one-off arbitrary values, and put custom CSS inside \`@layer components\`/\`@layer base\` so it cooperates with, instead of fights, utility specificity.`,
    },
    {
      name: "Accessibility, Design Systems & Real-World Project Structure",
      minutes: 10,
      intro: "Wire up real focus states and motion preferences, and organize a large Tailwind codebase.",
      content: `### focus-visible over focus

The plain \`focus:\` variant applies whenever an element has focus — including when a mouse click focused it, which is often visually unwanted (nobody wants a chunky ring around a button after clicking it with a mouse). \`focus-visible:\` targets the browser's own heuristic for "this focus should be visibly indicated," which in practice means keyboard and other non-pointer navigation:

\`\`\`html
<button
  class="rounded-lg bg-blue-600 px-4 py-2 text-white
         focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
>
  Save changes
</button>
\`\`\`

This pattern — suppress the default outline, then explicitly draw your own ring only on \`focus-visible\` — gives keyboard users (and switch/voice-control users, and anyone tabbing through a form) a clear, unmissable indicator of where focus is, without adding visual noise for mouse users. Recall from module 15 that Tailwind v4 changed the *default* \`ring\` to a thin 1px \`currentColor\` outline — for real focus indicators you should still be explicit about width and color, as above, rather than relying on defaults.

Never suppress \`outline\`/\`ring\` without replacing it with something equally visible. \`focus:outline-none\` on its own, with no \`focus-visible\` ring to replace it, is one of the most common accessibility regressions in real codebases — it looks clean during a quick visual pass and fails completely for keyboard-only users.

### Respecting prefers-reduced-motion

Some users configure their OS to reduce animation — often for vestibular disorders where motion can trigger real physical discomfort, sometimes just personal preference. Tailwind exposes this as two variants tied to the \`prefers-reduced-motion\` media query:

\`\`\`html
<div
  class="transition-transform duration-300
         motion-safe:hover:scale-105
         motion-reduce:transition-none"
>
  Product card
</div>
\`\`\`

- \`motion-safe:\` applies only when the user has **not** requested reduced motion — put your fun hover/entrance animations behind this variant.
- \`motion-reduce:\` applies only when the user **has** requested reduced motion — use it to explicitly strip an animation down (\`transition-none\`, \`animate-none\`) for a class that would otherwise always animate.

A practical pattern for a whole app: default your loud, decorative animations (page transitions, hover scale/rotate effects, autoplaying carousels) behind \`motion-safe:\`, and keep purely functional feedback (a focus ring appearing, a color change) unconditional since those aren't the kind of motion \`prefers-reduced-motion\` is about.

### Color contrast

Tailwind's default palette gives you a lot of shades to pick from, but picking two that merely "look fine" isn't the same as picking two that pass WCAG contrast guidelines. As a rule of thumb across Tailwind's default palette:

| Combination | Typical result |
|---|---|
| \`text-slate-400\` on \`bg-white\` | Usually fails — too light for body text |
| \`text-slate-600\` on \`bg-white\` | Usually passes AA for normal text |
| \`text-slate-900\` on \`bg-white\` | Comfortably passes |
| \`text-white\` on \`bg-blue-500\` | Borderline — check with a real tool |
| \`text-white\` on \`bg-blue-700\` | Usually passes |

These are rules of thumb, not guarantees — actual contrast depends on the exact shades and font size/weight, so run real combinations through a checker (browser devtools' contrast inspector, or a dedicated contrast-ratio tool) rather than eyeballing it, especially for small text and for anything below WCAG AA's 4.5:1 threshold for normal text (3:1 for large text).

A useful habit: when you introduce a new brand color into \`@theme\`, generate a few shades of it (e.g. \`50\` through \`900\`, the way Tailwind's own palette is structured) and explicitly verify which shade pairs safely with white text and which needs dark text, once, rather than re-deciding it ad hoc at every usage site.

### Structuring a large real-world project

As a Tailwind project grows past a handful of pages, a few structural decisions save a lot of pain later.

**Splitting global CSS.** One \`index.css\` with the single \`@import "tailwindcss";\` plus a couple of \`@layer\` blocks is fine for small apps, but a larger app benefits from splitting concerns into files and importing them from the entry point:

\`\`\`css
/* src/styles/index.css */
@import "tailwindcss";
@import "./theme.css";      /* @theme block: colors, fonts, spacing */
@import "./base.css";       /* @layer base: element defaults, resets */
@import "./components.css"; /* @layer components: shared component classes */
\`\`\`

This keeps the design tokens, the element-level resets, and the reusable component classes each in their own reviewable file, instead of one file that grows without bound.

**Component patterns from module 13.** As covered earlier in the course, the two big levers for not repeating long utility strings are (1) extracting a real UI component (a React/Vue/etc. component function) when the repeated thing has behavior or props, and (2) an \`@layer components\` class with \`@apply\` when it's purely a static visual pattern with no logic attached, used in a context where a framework component isn't natural (e.g. CMS-rendered HTML). Default to actual components first — they compose better, are easier to find usages of, and let you pass real props instead of string-concatenating class names.

**When to add a design-system layer on top of raw Tailwind.** For a small app or a solo project, raw utility classes are usually enough — the overhead of an abstraction layer isn't worth it yet. Reach for a proper design-system layer (a component library like shadcn/ui-style generated components, or your own \`<Button variant="primary" size="sm">\`-style API) once you notice:

- The same 4-5 line utility string for "the app's primary button" is copy-pasted across many files, and it's starting to drift (some buttons missing \`focus-visible\`, some using a slightly different shade).
- Multiple developers are making slightly different visual decisions for what should be one canonical component.
- You need runtime variants (size, intent, disabled state) that go beyond what a single \`@apply\`'d class can express cleanly.

At that point, a small internal component library — built with Tailwind classes under the hood, but exposing a typed prop API — gives you the consistency of a design system while keeping Tailwind as the actual styling mechanism. That's the natural end state for most production Tailwind codebases: not "Tailwind vs. a design system," but Tailwind utilities *as* the implementation detail of a small, well-typed set of components.

### Closing the course

Across this course you went from single utility classes to a full mental model: the utility-first philosophy, responsive and state variants, the box and flex/grid layout systems, dark mode, theming, component extraction, and now — in these last two modules — how the v4 engine actually works and how to run Tailwind responsibly in production. The utilities themselves are easy to look up; the judgment about *when* to reach for a raw utility, an \`@apply\`'d class, or a real component is what turns "I know Tailwind's classes" into "I can build and maintain a large UI with it."

> **Key idea:** Accessibility in a utility-first codebase isn't a separate pass bolted on at the end — \`focus-visible:\`, \`motion-safe:\`/\`motion-reduce:\`, and deliberately-checked contrast are just more variants and tokens, and a large Tailwind project stays maintainable the same way any large codebase does: split your global CSS by concern, prefer real components over copy-pasted utility strings, and only add a formal design-system layer once duplication and drift actually start costing you.`,
    },
  ],
}
