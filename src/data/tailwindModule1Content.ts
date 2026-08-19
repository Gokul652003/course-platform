import type { Module } from "../types"

export const tailwindModule1: Module = {
  id: 1,
  title: "Getting Started with Tailwind CSS",
  status: "in_progress",
  lessons: [
    {
      name: "What Is Tailwind & the Utility-First Philosophy",
      minutes: 9,
      intro: "Understand what utility-first CSS actually means, and why Tailwind trades named classes for composable primitives.",
      content: `## Utility-first, in one sentence

Tailwind CSS is a CSS framework built almost entirely out of small, single-purpose classes — **utilities** — that you compose directly in your markup instead of writing custom CSS. Instead of inventing a class name and then writing rules for it in a stylesheet, you reach for existing classes like \`flex\`, \`pt-4\`, \`text-lg\`, and \`bg-slate-900\` and combine them on the element itself.

There's no \`.card\` class to define anywhere. There's no stylesheet to keep in sync with your markup. The styling lives where the element lives.

### Semantic CSS, side by side with Tailwind

Here's the same card built the "traditional" way — a semantic class name, styled separately in CSS (this is the BEM-flavored approach a lot of teams settled on):

\`\`\`html
<div class="card">
  <h2 class="card__title">Plan: Pro</h2>
  <p class="card__price">$29/mo</p>
</div>
\`\`\`

\`\`\`css
.card {
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.card__title {
  font-size: 1.25rem;
  font-weight: 700;
}
.card__price {
  color: #64748b;
}
\`\`\`

And here's the same result with Tailwind utilities — no separate CSS file involved:

\`\`\`html
<div class="rounded-lg p-6 shadow">
  <h2 class="text-xl font-bold">Plan: Pro</h2>
  <p class="text-slate-500">$29/mo</p>
</div>
\`\`\`

Nothing here is called \`card\`. There's no \`.card\` rule to hunt down in a 4,000-line stylesheet, no risk that some other page also uses \`.card__title\` for something visually different, and no moment where you have to stop and think of a name for "the price text inside a plan card."

### Utility-first vs semantic CSS / BEM

| | Semantic CSS (BEM etc.) | Utility-first (Tailwind) |
|---|---|---|
| Where styles live | Separate \`.css\` file | Inline on the element, in \`class\` |
| Naming burden | You name every component and part | None — utilities are pre-named |
| Context switching | Constant: markup file <-> CSS file | None: one file, one place to look |
| CSS file growth | Grows forever as features are added | Bounded — same utilities get reused |
| Unused CSS | Easy to accumulate, hard to prune safely | Tailwind only generates classes you actually use |
| Changing one element's look | Edit CSS, hope nothing else uses that class | Edit the \`class\` attribute directly, nothing else affected |

That last row is the sharpest difference in practice. With a shared \`.card\` class, tweaking padding for one card risks changing every other \`.card\` on the site. With utilities, each element's classes are its own — changing one instance never touches another.

### Utility-first vs component frameworks (Bootstrap, etc.)

It's worth separating Tailwind from frameworks like Bootstrap, because they solve a different problem. Bootstrap ships **pre-designed components**: \`.btn\`, \`.btn-primary\`, \`.card\`, \`.navbar\`. Drop one in and you get a fully styled, opinionated button or navbar out of the box — quick to start, but every Bootstrap site tends to look recognizably like a Bootstrap site unless you fight the defaults.

Tailwind ships **no components at all** — only low-level primitives (spacing, color, typography, layout). There's no \`.btn\` class waiting for you; you build your button's look from utilities, once, and then reuse that combination (often by extracting it into a framework component like a React \`<Button />\`, not a CSS class). The tradeoff is more upfront decisions, in exchange for a design that's entirely yours rather than a re-skinned default.

### The tradeoffs, honestly

**Costs:**
- HTML gets more verbose — a styled button might carry 8-10 classes instead of one.
- Skimming markup for structure is harder when style classes are interleaved with it.
- It looks alarming the first time you see it, especially in a code review.

**Benefits:**
- No naming fatigue — you never again have to decide between \`.card-header\`, \`.cardHeader\`, and \`.card__header\`.
- No context switching — you almost never leave the file you're already editing to go tweak a stylesheet.
- No unused CSS growth — Tailwind's build only ever generates CSS for classes it finds actually used in your project, so the shipped stylesheet doesn't creep upward release after release the way hand-written CSS tends to.
- Changes are local — editing one element's classes can never have a surprising effect on a different, unrelated element.

In practice, most of the "verbose HTML" complaint fades once you're working inside a component-based framework (React, Vue, Svelte, etc.): you write the utility soup once inside a \`<Card>\` component, and every usage site stays clean.

### Where this idea comes from

Utility-first isn't a Tailwind invention — it's usually traced back to **atomic CSS** / **functional CSS**, an approach popularized by libraries like Tachyons and Basscss in the mid-2010s: tiny, single-property classes such as \`.mt3\` or \`.flex\`. Tailwind, released in 2017, took that idea and layered a cohesive, constrained **design system** on top of it — a fixed spacing scale, a fixed color palette, fixed type sizes — so the utilities aren't just atomic, they're also consistent with each other by construction. Later, Tailwind's **Just-in-Time engine** (now just how Tailwind always works, as of v3+) made it practical at scale by generating CSS on demand instead of shipping a giant precompiled utility sheet.

### When utility-first is (and isn't) a good fit

**Good fit:**
- Product UIs built with a component framework, where repeated utility combinations get absorbed into one reusable component.
- Teams that want visual consistency without agreeing on a CSS naming convention first.
- Fast iteration — prototyping a layout by editing classes directly is often quicker than round-tripping through a separate stylesheet.

**Weaker fit:**
- Large amounts of raw, non-templated static HTML with no way to extract repeated markup into partials or components — verbosity has nowhere to hide.
- Teams with a hard split between "designers who only touch CSS" and "developers who only touch markup," where mixing style into markup breaks that workflow.
- Content that's genuinely one-off and unlikely to share visual patterns with anything else — in those narrow cases, a couple of hand-written CSS rules can be simpler than a wall of utility classes.

None of these are dealbreakers so much as signals — most real-world teams land on "utility-first as the default, escape hatch to custom CSS when it genuinely helps," which is exactly the model Tailwind is built around.

> **Key idea:** Utility-first isn't "no CSS," it's CSS with the abstraction moved from named classes to composable, pre-designed primitives — you trade some markup verbosity for the elimination of naming, context-switching, and unbounded stylesheet growth.`,
    },
    {
      name: "Installing Tailwind CSS",
      minutes: 10,
      intro: "Set Tailwind up with Vite, PostCSS, the standalone CLI, or Next.js — and know when the CDN build is (and isn't) okay.",
      content: `## Picking an install path

Tailwind v4 simplified installation considerably compared to v3 — there's no longer a required \`tailwind.config.js\`, and setup for most build tools is two commands and one CSS line. This lesson walks through every common path: Vite, generic PostCSS, the standalone CLI, Next.js, and the CDN script for quick demos.

### Option 1: Vite (recommended for most SPAs)

This repo itself uses this exact setup. Install Tailwind and its first-party Vite plugin:

\`\`\`bash
npm install tailwindcss @tailwindcss/vite
\`\`\`

Register the plugin in \`vite.config.ts\`:

\`\`\`ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
\`\`\`

Then, in your main CSS file (often \`src/index.css\` or \`src/main.css\`), pull in Tailwind with a single import:

\`\`\`css
@import "tailwindcss";
\`\`\`

Make sure that CSS file is imported once from your app's entry point (e.g. \`main.tsx\`):

\`\`\`ts
import "./index.css"
\`\`\`

That's the entire setup — no config file is required to get started. \`@tailwindcss/vite\` hooks into Vite's dev server and build pipeline directly, so class detection and rebuilds are fast and automatic.

### Option 2: PostCSS (any other bundler — webpack, esbuild, Parcel, etc.)

If you're not on Vite, Tailwind still works as a standard PostCSS plugin:

\`\`\`bash
npm install tailwindcss @tailwindcss/postcss postcss
\`\`\`

Create (or edit) \`postcss.config.js\`:

\`\`\`js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
\`\`\`

Same CSS entry point as before:

\`\`\`css
@import "tailwindcss";
\`\`\`

Whatever already runs PostCSS in your build (webpack's \`postcss-loader\`, Parcel's built-in PostCSS support, etc.) will now process Tailwind's directives automatically.

### Option 3: Standalone CLI (no Node.js project at all)

Tailwind ships a standalone executable with no Node.js or npm dependency — useful for static sites, non-JS backends (Django, Rails, Go templates), or just trying Tailwind out without setting up a JS toolchain:

\`\`\`bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
chmod +x tailwindcss-linux-x64
mv tailwindcss-linux-x64 tailwindcss
\`\`\`

Create an input CSS file:

\`\`\`css
/* input.css */
@import "tailwindcss";
\`\`\`

Then build (or watch) it against your HTML/templates:

\`\`\`bash
./tailwindcss -i input.css -o output.css --watch
\`\`\`

Link the generated \`output.css\` in your HTML like any normal stylesheet. If you do have Node available but don't want the CLI as a project dependency, \`npx @tailwindcss/cli\` runs the same tool without a separate download:

\`\`\`bash
npx @tailwindcss/cli -i input.css -o output.css --watch
\`\`\`

### Option 4: Next.js

Next.js projects use PostCSS under the hood, so the setup mirrors Option 2:

\`\`\`bash
npm install tailwindcss @tailwindcss/postcss postcss
\`\`\`

\`\`\`js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
\`\`\`

Add the import to \`app/globals.css\` (App Router) or \`styles/globals.css\` (Pages Router):

\`\`\`css
@import "tailwindcss";
\`\`\`

And make sure it's imported once, from your root layout:

\`\`\`tsx
// app/layout.tsx
import "./globals.css"
\`\`\`

If you scaffold a new project with \`create-next-app\`, recent versions offer a "Tailwind CSS" checkbox that does all of this for you automatically.

### The Play CDN — prototyping only

For a zero-install way to try a snippet in a plain \`.html\` file — a CodePen-style scratchpad, a bug repro, a quick demo — Tailwind offers a CDN script:

\`\`\`html
<!doctype html>
<html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Hello, Tailwind</h1>
  </body>
</html>
\`\`\`

This compiles Tailwind classes **in the browser, at runtime**, on every page load.

> **Warning:** The Play CDN is explicitly not intended for production. It ships the entire compiler to the client, recompiles on every load, can't be purged to a minimal stylesheet, and doesn't support \`@theme\` customization or plugins the way a real build does. Use it only for throwaway demos and prototypes — every real project should go through one of the build-tool installs above.

### Quick reference

| Setup | Install command | Where Tailwind is invoked |
|---|---|---|
| Vite | \`npm install tailwindcss @tailwindcss/vite\` | \`vite.config.ts\` plugin |
| PostCSS (generic) | \`npm install tailwindcss @tailwindcss/postcss postcss\` | \`postcss.config.js\` |
| Standalone CLI | download binary or \`npx @tailwindcss/cli\` | command line, \`--watch\` |
| Next.js | \`npm install tailwindcss @tailwindcss/postcss postcss\` | \`postcss.config.mjs\` |
| Play CDN | \`<script src="...">\` | in-browser, prototyping only |

> **Key idea:** Every real build setup boils down to the same two steps — add Tailwind to your build tool's pipeline (Vite plugin, PostCSS plugin, or the standalone CLI), then write \`@import "tailwindcss";\` once in your CSS entry point. The CDN script skips both steps but isn't safe to ship.`,
    },
    {
      name: "Project Structure, Config & Editor Tooling",
      minutes: 9,
      intro: "Learn the v4 CSS-first config, how it differs from v3's config file, and the two editor tools you shouldn't skip.",
      content: `## The v4 CSS-first entry point

In Tailwind v4, your entire Tailwind setup can start from a single line in a CSS file:

\`\`\`css
@import "tailwindcss";
\`\`\`

That one import pulls in Tailwind's reset (Preflight), the design tokens (spacing scale, color palette, font sizes, etc.), and every utility class Tailwind knows how to generate. There's no required config file — customization, when you need it, happens directly in CSS via an \`@theme\` block:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #6d28d9;
  --font-display: "Cal Sans", sans-serif;
  --breakpoint-3xl: 1920px;
}
\`\`\`

Every variable defined in \`@theme\` immediately becomes usable as a utility — \`--color-brand\` gives you \`bg-brand\`, \`text-brand\`, \`border-brand\`, and so on, for free. This module doesn't go deep on \`@theme\` — a later module in this course covers v4 theming in detail — but it's worth knowing upfront that in v4, your design tokens live in CSS, not JavaScript.

### How this differs from v3

Tailwind v3 (and earlier) used three explicit **directives** instead of a single import, plus a required JavaScript config file:

\`\`\`css
/* v3 style */
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

\`\`\`js
// tailwind.config.js (v3 style)
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#6d28d9",
      },
    },
  },
  plugins: [],
}
\`\`\`

The \`content\` array in v3 was mandatory and easy to get wrong — if a file glob didn't match where your components actually lived, Tailwind simply wouldn't see the classes used there, and they'd silently be missing from the built CSS. v4 replaces this with automatic content detection: it scans your project for files itself (respecting \`.gitignore\`), so there's usually nothing to configure at all. You only need an explicit \`@source\` directive in v4 if you're pulling class names from somewhere its automatic detection wouldn't look (e.g. a separate package outside your project root).

| | v3 | v4 |
|---|---|---|
| CSS entry | \`@tailwind base/components/utilities\` | \`@import "tailwindcss";\` |
| Config file | \`tailwind.config.js\`, usually required | Optional — theming via \`@theme\` in CSS |
| Content scanning | Manual \`content: [...]\` glob array | Automatic, opt-out via \`@source\` |
| Customizing tokens | \`theme.extend\` in JS | CSS custom properties in \`@theme\` |

### The base / components / utilities cascade

Whichever version you're on, Tailwind's generated CSS is organized into three conceptual **layers**, applied in this order:

1. **base** — resets and sane defaults (Preflight): margins zeroed out, consistent \`box-sizing\`, unstyled headings, etc. This is the CSS equivalent of a lightweight normalize.css.
2. **components** — reusable multi-property class definitions, typically added via a plugin or your own \`@layer components\` block (things like a hand-authored \`.btn\` class, if you choose to define one).
3. **utilities** — every single-purpose class Tailwind generates: \`flex\`, \`pt-4\`, \`text-lg\`, and so on.

The order matters for specificity. Because utilities are emitted last, a utility class on an element reliably overrides a component class of otherwise-equal CSS specificity — which is exactly why you can drop \`px-8\` onto something using a custom \`.btn\` class and have the override actually take effect, without fighting \`!important\` or specificity wars. Tailwind implements this ordering internally using native CSS **cascade layers** (\`@layer\`), so the guarantee holds regardless of the order your classes happen to appear in the compiled stylesheet.

### Editor tooling: Tailwind CSS IntelliSense

The single most valuable addition to your editor when working with Tailwind is the **Tailwind CSS IntelliSense** extension (available for VS Code and most VS Code-compatible editors). It gives you:

- Autocomplete for utility class names as you type, including your project's custom \`@theme\` values.
- Hover previews that show the actual CSS a class compiles to (hover \`px-4\` and see \`padding-left: 1rem; padding-right: 1rem;\`).
- Linting for things like conflicting classes on the same element (\`px-4 px-6\`) or unknown class names.
- Color swatches inline next to color utilities like \`bg-rose-500\`.

Install it from your editor's extension marketplace by searching "Tailwind CSS IntelliSense" (publisher: Tailwind Labs).

### Editor tooling: automatic class sorting

Because a single element can easily carry 10+ utility classes, Tailwind's team publishes an official Prettier plugin, \`prettier-plugin-tailwindcss\`, that automatically sorts classes into a consistent, recommended order every time you format:

\`\`\`bash
npm install -D prettier prettier-plugin-tailwindcss
\`\`\`

\`\`\`json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
\`\`\`

Once installed, running Prettier (or format-on-save) reorders classes into Tailwind's canonical order — layout, then box model, then typography, then color, then state variants — automatically. This does two things worth caring about: it keeps class order consistent across an entire team (so diffs don't churn on reordering alone), and it makes duplicate or conflicting classes easier to spot at a glance, since related classes always end up next to each other.

> **Key idea:** v4 collapses setup to one CSS import with optional CSS-native theming, replacing v3's directive trio and \`tailwind.config.js\`; either way, install the IntelliSense extension and the Prettier plugin early — they make working with a lot of utility classes noticeably less painful.`,
    },
  ],
}
