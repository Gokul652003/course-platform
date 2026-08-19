import type { Module } from "../types"

export const tailwindModule14: Module = {
  id: 14,
  title: "The Tailwind Plugin Ecosystem",
  status: "upcoming",
  lessons: [
    {
      name: "Official Plugins Tour",
      minutes: 9,
      intro: "A quick tour of Tailwind's four official plugins and which of them v4's native utilities have quietly absorbed.",
      content: `### Why "official" plugins exist at all

Tailwind's core ships with hundreds of utilities, but a handful of concerns are common enough across many projects, yet specialized enough, that the Tailwind team maintains them as separate, optional packages instead of bloating the core. You install only the ones you need. This lesson tours all four, and flags the two that Tailwind v4's native utilities have substantially — though not entirely — replaced.

### @tailwindcss/typography

You've likely already met this one when styling long-form content. It adds a single \`prose\` class (plus size variants like \`prose-lg\` and color variants like \`prose-invert\`) that applies sensible, opinionated typographic styling to a block of raw HTML you don't control the individual tags of — markdown output, CMS content, rendered docs.

\`\`\`bash
npm install -D @tailwindcss/typography
\`\`\`

\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
\`\`\`

\`\`\`html
<article class="prose prose-slate lg:prose-lg dark:prose-invert">
  <h1>Post title</h1>
  <p>Body copy, rendered from markdown, with no per-tag classes at all.</p>
</article>
\`\`\`

This is covered in much more depth in the module on long-form content — here it's enough to remember it exists and solves "I have raw HTML I can't add classes to."

### @tailwindcss/forms

Covered in full in the previous module's forms lesson: it resets native \`<input>\`, \`<select>\`, \`<textarea>\`, checkbox, and radio elements to a neutral, cross-browser-consistent baseline so your own utilities style them predictably.

\`\`\`bash
npm install -D @tailwindcss/forms
\`\`\`

\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
\`\`\`

### @tailwindcss/aspect-ratio — mostly superseded in v4

This plugin used to be the *only* reliable, broadly-supported way to keep an element (typically an embedded video or image placeholder) at a fixed width-to-height ratio, using the classic "padding-top percentage hack":

\`\`\`html
<!-- old approach, plugin-provided -->
<div class="aspect-w-16 aspect-h-9">
  <iframe src="..."></iframe>
</div>
\`\`\`

That hack was necessary because the CSS \`aspect-ratio\` property itself wasn't well supported in browsers when the plugin was written. That's no longer true — \`aspect-ratio\` now has excellent support across all modern browsers, so Tailwind v4 (and late v3) ships native \`aspect-*\` utilities built directly on the CSS property, no plugin required:

\`\`\`html
<div class="aspect-video">
  <iframe src="..." class="h-full w-full"></iframe>
</div>

<div class="aspect-square w-48">
  <img src="/avatar.jpg" class="h-full w-full object-cover" />
</div>

<div class="aspect-[4/3]">
  <!-- arbitrary custom ratio -->
</div>
\`\`\`

| Utility | CSS |
|---|---|
| \`aspect-auto\` | \`aspect-ratio: auto\` |
| \`aspect-square\` | \`aspect-ratio: 1 / 1\` |
| \`aspect-video\` | \`aspect-ratio: 16 / 9\` |
| \`aspect-[4/3]\` | \`aspect-ratio: 4 / 3\` (arbitrary value) |

For a new v4 project, you almost never need to install \`@tailwindcss/aspect-ratio\` — reach for it only if you're maintaining an older codebase that already depends on its specific \`aspect-w-*\`/\`aspect-h-*\` class names, or need a legacy browser fallback.

### @tailwindcss/container-queries — mostly superseded in v4

Container queries let an element respond to the size of its *containing element* rather than the viewport — essential for components (like a card) that need to look different depending on whether they're rendered in a narrow sidebar or a wide main column, regardless of the browser window's size. Before Tailwind had built-in support, this plugin added the \`@container\` marker class and \`@sm:\`/\`@md:\`-style variants to make that possible.

Tailwind v4 bakes container queries into core. You mark a container and use \`@\`-prefixed variants directly, with no plugin:

\`\`\`html
<div class="@container">
  <div class="flex flex-col @md:flex-row">
    <img class="@md:w-1/3" src="/thumb.jpg" />
    <div class="p-4 @md:p-6">
      <h3 class="text-base @lg:text-lg">Card title</h3>
    </div>
  </div>
</div>
\`\`\`

| Utility | Purpose |
|---|---|
| \`@container\` | marks an element as a query container |
| \`@container/sidebar\` | a *named* container, for targeting a specific ancestor when containers are nested |
| \`@md:flex-row\` | applies \`flex-row\` when the nearest container is at least the \`md\` container breakpoint |
| \`@md/sidebar:p-6\` | targets the named \`sidebar\` container specifically |

As with \`aspect-ratio\`, you'd only reach for the standalone \`@tailwindcss/container-queries\` plugin today if you're on an older Tailwind version that lacks native support, or maintaining code already written against the plugin's exact class names.

### Installing and registering plugins — the pattern

Every official plugin follows the same two-step pattern in v4: install via npm, then register with \`@plugin\` in your main CSS file.

\`\`\`bash
npm install -D @tailwindcss/typography @tailwindcss/forms
\`\`\`

\`\`\`css
@import "tailwindcss";

@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
\`\`\`

No \`tailwind.config.js\` \`plugins\` array is needed in v4 — that was the v3 pattern (\`plugins: [require("@tailwindcss/forms")]\`), which you'll still see referenced in older tutorials and codebases.

### Summary — what's still worth installing

| Plugin | Still needed in v4? |
|---|---|
| \`@tailwindcss/typography\` | Yes — no native equivalent |
| \`@tailwindcss/forms\` | Yes — no native equivalent |
| \`@tailwindcss/aspect-ratio\` | Rarely — native \`aspect-*\` utilities cover almost all cases |
| \`@tailwindcss/container-queries\` | Rarely — native \`@container\`/\`@\`-variants cover almost all cases |

> **Key idea:** \`@tailwindcss/typography\` and \`@tailwindcss/forms\` remain essential for content you don't control and cross-browser form styling respectively — but \`@tailwindcss/aspect-ratio\` and \`@tailwindcss/container-queries\` have been mostly absorbed into v4's core as native \`aspect-*\` utilities and \`@container\` variants, so check whether you need the plugin at all before installing it.`,
    },
    {
      name: "Writing a Custom Plugin",
      minutes: 10,
      intro: "Use the plugin() API — addUtilities, addComponents, addBase, and matchUtilities — to build your own text-shadow utility set.",
      content: `### Why write a plugin instead of just writing CSS

For a one-off style, plain CSS is simpler. A plugin earns its place when you want a reusable, *utility-shaped* API — classes that compose with variants (\`hover:\`, \`md:\`, \`dark:\`) and arbitrary values, just like Tailwind's own utilities — for a pattern you'll reuse across projects or want to share as a package. Tailwind exposes a small, well-documented plugin API for exactly this.

### The plugin() function

Every plugin is built with the \`plugin()\` helper from \`tailwindcss/plugin\`. It receives a callback with a handful of registration functions:

\`\`\`js
// text-shadow-plugin.js
import plugin from "tailwindcss/plugin"

export default plugin(function ({ addUtilities, addComponents, addBase, matchUtilities, theme }) {
  // register utilities, components, base styles, and dynamic utilities here
})
\`\`\`

Register it in your CSS entry point the same way as an official plugin, pointing \`@plugin\` at the local file:

\`\`\`css
@import "tailwindcss";
@plugin "./text-shadow-plugin.js";
\`\`\`

### addBase — global element defaults

\`addBase\` sets base styles on raw HTML selectors, similar to what Preflight does. Use it sparingly — it's global and not opted into per-element.

\`\`\`js
addBase({
  "h1, h2, h3": { fontWeight: "700" },
  "a": { textDecorationSkipInk: "auto" },
})
\`\`\`

### addComponents — multi-property, semantic classes

\`addComponents\` registers class-based rules meant to be used directly in markup, similar in spirit to what \`@apply\`-based classes look like, but authored in JS and shipped as part of a reusable plugin:

\`\`\`js
addComponents({
  ".card": {
    borderRadius: "0.5rem",
    backgroundColor: "white",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
})
\`\`\`

\`\`\`html
<div class="card">...</div>
\`\`\`

### addUtilities — single-purpose utility classes

\`addUtilities\` is the same idea, but for utility-style classes: small, single-purpose, meant to compose with variants automatically (\`hover:\`, \`md:\`, \`dark:\` all work on them for free, since Tailwind's variant system wraps any registered utility).

\`\`\`js
addUtilities({
  ".text-shadow-sm": {
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
  },
  ".text-shadow": {
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  ".text-shadow-lg": {
    textShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
  },
  ".text-shadow-none": {
    textShadow: "none",
  },
})
\`\`\`

\`\`\`html
<h1 class="text-shadow-lg hover:text-shadow-none">Hover to flatten</h1>
\`\`\`

That \`hover:\` prefix works immediately — you didn't write any hover-specific CSS. Every variant Tailwind knows about applies automatically to any utility registered through \`addUtilities\`.

### matchUtilities — dynamic, arbitrary-value-aware utilities

A fixed set of \`.text-shadow-sm\`/\`.text-shadow\`/\`.text-shadow-lg\` classes covers common cases, but what about a one-off value, the way \`w-[137px]\` works for width? That's what \`matchUtilities\` is for — it generates utilities dynamically from a value map *and* automatically supports the \`[...]\` arbitrary-value syntax.

\`\`\`js
matchUtilities(
  {
    "text-shadow": (value) => ({
      textShadow: value,
    }),
  },
  {
    values: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.15)",
      DEFAULT: "0 2px 4px rgba(0, 0, 0, 0.2)",
      lg: "0 4px 8px rgba(0, 0, 0, 0.25)",
    },
  }
)
\`\`\`

This single call generates \`text-shadow-sm\`, \`text-shadow\` (the \`DEFAULT\` key maps to the bare utility name), and \`text-shadow-lg\` — but it *also* unlocks:

\`\`\`html
<h1 class="text-shadow-[0_3px_6px_rgba(0,0,0,0.3)]">Custom shadow, no plugin change needed</h1>
\`\`\`

Anyone using the plugin can now reach for a bespoke shadow value without you having to anticipate and hardcode it — exactly like Tailwind's own \`matchUtilities\`-powered core utilities (\`w-[...]\`, \`bg-[...]\`, \`grid-cols-[...]\`) behave.

### A complete worked example

Putting the pieces together into one small, shippable plugin that adds a full \`text-shadow-*\` utility set with both named and arbitrary values:

\`\`\`js
// plugins/text-shadow.js
import plugin from "tailwindcss/plugin"

export default plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      "text-shadow": (value) => ({
        textShadow: value,
      }),
    },
    {
      values: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.15)",
        DEFAULT: "0 2px 4px rgba(0, 0, 0, 0.2)",
        lg: "0 4px 8px rgba(0, 0, 0, 0.25)",
        xl: "0 8px 16px rgba(0, 0, 0, 0.3)",
        none: "none",
      },
      // lets theme() lookups and arbitrary values both resolve sanely
      type: ["shadow", "any"],
    }
  )
})
\`\`\`

\`\`\`css
@import "tailwindcss";
@plugin "./plugins/text-shadow.js";
\`\`\`

\`\`\`html
<h1 class="text-4xl font-bold text-shadow-lg">
  Readable heading over a busy background image
</h1>

<p class="text-shadow-sm hover:text-shadow-none transition-[text-shadow]">
  Shrinks on hover
</p>

<h2 class="text-shadow-[0_0_12px_rgba(99,102,241,0.6)]">
  One-off glow effect via an arbitrary value
</h2>
\`\`\`

### When to reach for each API

| API | Use for |
|---|---|
| \`addBase\` | global defaults on raw HTML tags (rare — Preflight usually already covers this) |
| \`addComponents\` | multi-property, semantic classes meant to be used as-is (\`.card\`, \`.btn\`) |
| \`addUtilities\` | small, fixed, single-purpose utility classes that should get variant support for free |
| \`matchUtilities\` | the same, but generated from a value map and open to arbitrary \`[...]\` values |

> **Key idea:** \`plugin()\` gives you the same building blocks Tailwind's own core is written with — \`addBase\` for global defaults, \`addComponents\` for semantic multi-property classes, and \`addUtilities\`/\`matchUtilities\` for real utilities that automatically get variant and arbitrary-value support, exactly like \`hover:\` or \`w-[...]\` do on built-in classes.`,
    },
    {
      name: "Headless UI & Component Libraries",
      minutes: 9,
      intro: "Pair unstyled, accessible component logic from Headless UI or Radix with Tailwind — and understand why shadcn/ui's copy-paste model took over.",
      content: `### The problem utility-first CSS doesn't solve

Tailwind is extremely good at *styling* a dropdown menu, a modal, or a combobox. It has no opinion at all about the *behavior* those components need: focus trapping inside a modal, closing a menu on outside click or Escape, arrow-key navigation through options, correct ARIA attributes for screen readers, managing which element receives focus when a dialog opens and closes. That logic is genuinely hard to get right, easy to get subtly wrong, and has nothing to do with CSS.

"Headless" component libraries exist to solve exactly that half of the problem, while leaving 100% of the visual styling to you.

### What "headless" means

A headless component ships all the interactive behavior and accessibility wiring, but renders with **no built-in styles at all** — you apply your own classes to every part.

**Headless UI** (from the Tailwind Labs team itself) is the most direct pairing:

\`\`\`bash
npm install @headlessui/react
\`\`\`

\`\`\`tsx
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"

function ActionsMenu() {
  return (
    <Menu as="div" class="relative inline-block text-left">
      <MenuButton class="rounded-md bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">
        Options
      </MenuButton>
      <MenuItems class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <MenuItem>
          {({ focus }) => (
            <a
              href="#"
              class={\`block px-4 py-2 text-sm \${focus ? "bg-indigo-600 text-white" : "text-slate-700"}\`}
            >
              Edit
            </a>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
\`\`\`

Every class here is yours to choose — Headless UI contributes focus management, keyboard navigation (arrow keys, Enter, Escape), and correct \`role\`/\`aria-*\` attributes, and exposes render-prop state like \`focus\` so your Tailwind classes can react to it.

**Radix UI** (now Radix Primitives, from the WorkOS/shadcn team) covers a much broader set of components — dialogs, popovers, tooltips, accordions, sliders, tabs — with the same unstyled philosophy, using a slightly different API built on individually-composed primitives:

\`\`\`bash
npm install @radix-ui/react-dialog
\`\`\`

\`\`\`tsx
import * as Dialog from "@radix-ui/react-dialog"

function ConfirmDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">
        Delete
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 bg-black/50" />
        <Dialog.Content class="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title class="text-lg font-semibold">Delete item?</Dialog.Title>
          <Dialog.Description class="mt-2 text-sm text-slate-600">
            This can't be undone.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
\`\`\`

Both libraries solve the same core promise: correct behavior and accessibility, zero visual opinion, full Tailwind styling control.

### The old alternative — opaque component libraries

Before headless libraries were common, the typical choice was a fully-styled component library (Material UI, Ant Design, Bootstrap's JS components) installed as an npm dependency. These ship both behavior *and* CSS baked in, which is fast to start with but fights Tailwind constantly:

- Overriding their built-in styles means fighting specificity, \`!important\`, or CSS-in-JS theme objects instead of just writing utilities.
- Your bundle carries a full design system's CSS even for the 5% of it you actually use.
- Deep customization often means forking or wrapping components in ways the library never anticipated.

Headless libraries sidestep all of this by simply not shipping any styles to override in the first place.

### shadcn/ui — the copy-paste model

\`shadcn/ui\` isn't an npm package you install and import from \`node_modules\` — that's the whole point. It's a CLI and a collection of ready-made component *source files*, each built on a Radix primitive for behavior and styled with Tailwind + \`cva\` for variants, that you copy directly into your own project:

\`\`\`bash
npx shadcn@latest add button dialog dropdown-menu
\`\`\`

That command doesn't add a dependency to \`package.json\` for "the button" — it writes an actual \`button.tsx\` file into your project's \`components/ui/\` folder, source code and all:

\`\`\`tsx
// components/ui/button.tsx (generated — now yours)
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-slate-200 hover:bg-slate-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
\`\`\`

You now own this file exactly as much as any other component you wrote by hand. Want to change the default border radius, add a new \`variant\`, rip out a size you never use? Edit the file directly — no wrapping, no \`!important\`, no waiting on an upstream maintainer, no fighting a black-box npm package's API surface.

### Why this model took over in the Tailwind ecosystem

| Traditional npm library | shadcn/ui copy-paste |
|---|---|
| Opaque — customization fights the library's API | Transparent — it's just your code |
| One version for the whole app; upgrading can break customizations | No "upgrading" — you already have the source, change it whenever |
| Ships CSS/behavior you didn't ask for | Only the components you explicitly add exist in your project |
| Bundle includes unused parts unless carefully tree-shaken | Every line in your bundle is a component you're actually using |
| Standard behavior across all apps using it | Naturally diverges per project — for better (control) and worse (behind on upstream fixes) |

The tradeoff is real: you don't get automatic bug fixes or new features from upstream, and if you add fifteen components you're now responsible for maintaining fifteen files. But for a component-based, utility-first stack, "own the code, style it with utilities you already know, built on accessibility primitives someone else got right" turned out to resonate strongly — it's the same instinct that makes \`@apply\`-free components preferable to \`@apply\`-based CSS classes, applied one layer up, to whole components instead of just class strings.

> **Key idea:** Headless UI and Radix supply correct interactive behavior and accessibility with zero visual opinion, so Tailwind utilities do all the styling; shadcn/ui takes that one step further by having you copy the resulting component source directly into your project instead of installing it as an opaque dependency — trading automatic upstream updates for full ownership and zero styling fights.`,
    },
  ],
}
