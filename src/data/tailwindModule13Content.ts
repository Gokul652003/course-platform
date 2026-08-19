import type { Module } from "../types"

export const tailwindModule13: Module = {
  id: 13,
  title: "Forms & Reusable Components",
  status: "upcoming",
  lessons: [
    {
      name: "Styling Forms & the Forms Plugin",
      minutes: 10,
      intro: "Tame native form elements' inconsistent default styling with utilities and @tailwindcss/forms.",
      content: `### Why forms are the hard part of utility-first CSS

Most HTML elements render pretty much the same in every browser once you strip Tailwind's Preflight reset on top of them. Form elements are the exception. \`<input>\`, \`<select>\`, \`<textarea>\`, checkboxes, and radios each carry a pile of browser- and OS-specific chrome — different padding, different border styles, a totally different checkbox widget on macOS Safari vs Windows Chrome vs Android. Preflight neutralizes a lot of this, but checkboxes, radios, and \`<select>\` arrows are still stubbornly inconsistent because their appearance is tied to native OS widgets, not just CSS.

This lesson covers styling every common form element with plain utilities first, then introduces \`@tailwindcss/forms\`, the official plugin that gives you a clean, predictable base to build on.

### Styling text inputs and textareas

Text-like inputs (\`text\`, \`email\`, \`password\`, \`number\`, \`search\`, \`<textarea>\`) respond to ordinary box-model and typography utilities:

\`\`\`html
<input
  type="email"
  placeholder="you@example.com"
  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
/>
\`\`\`

A few utilities worth knowing specifically for inputs:

| Utility | Effect |
|---|---|
| \`placeholder:text-slate-400\` | styles placeholder text via the \`placeholder:\` variant |
| \`focus:ring-2\` + \`focus:ring-indigo-500/30\` | a soft focus ring instead of the browser's default outline |
| \`focus:outline-none\` | removes the default outline so your custom ring is the only focus indicator |
| \`disabled:opacity-50\` \`disabled:cursor-not-allowed\` | visually communicates a disabled field |
| \`invalid:border-red-500\` | styles based on native HTML5 validation state |

\`\`\`html
<input
  type="text"
  required
  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
/>
\`\`\`

Never remove \`focus:outline-none\` without replacing it with a visible \`focus:ring-*\` or \`focus:border-*\` treatment — doing so breaks keyboard-only navigation for anyone tabbing through your form.

### The checkbox and radio problem

This is where hand-rolled utilities start to strain. A bare checkbox looks like this:

\`\`\`html
<input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600" />
\`\`\`

That \`text-indigo-600\` looks odd on a checkbox, but it's intentional — modern browsers use \`accent-color\` (which Tailwind's \`text-*\` utilities map to on checkboxes/radios) to tint the native check glyph. It works well in Chrome and Firefox, but the *box itself* — its border radius, border color, size — still varies more than you'd like across browsers, and older browser support for \`accent-color\`-driven styling is patchier than for ordinary box-model utilities.

### Installing @tailwindcss/forms

\`@tailwindcss/forms\` fixes this by resetting every form element to an unstyled, consistent baseline that utilities then apply cleanly on top of — similar in spirit to what Preflight does for the rest of your HTML.

\`\`\`bash
npm install -D @tailwindcss/forms
\`\`\`

In Tailwind v4, register it in your CSS entry point with \`@plugin\`:

\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
\`\`\`

(In a v3 project you'd instead add it to the \`plugins\` array in \`tailwind.config.js\` — you may see that pattern in older codebases.)

### Two opt-in strategies

The plugin ships with two strategies, chosen via a \`strategy\` option:

| Strategy | Behavior |
|---|---|
| \`class\` (recommended) | you opt in per-element with classes like \`form-input\`, \`form-select\`, \`form-checkbox\`, \`form-radio\`, \`form-textarea\` |
| \`base\` (default if unset) | resets **every** matching element globally, no class needed |

The global \`base\` strategy is convenient for a form-heavy admin app where you want every input reset without thinking about it. But in a design system shared across many pages, an unannounced global reset can surprise you the moment someone drops in a plain \`<input>\` expecting no plugin styling. The explicit \`class\` strategy is safer for most component-based apps:

\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/forms" {
  strategy: class;
}
\`\`\`

With \`class\` strategy, you now opt in explicitly:

\`\`\`html
<input type="text" class="form-input rounded-md border-slate-300" />
<select class="form-select rounded-md border-slate-300">
  <option>Option A</option>
</select>
<input type="checkbox" class="form-checkbox rounded text-indigo-600" />
<input type="radio" class="form-radio text-indigo-600" />
<textarea class="form-textarea rounded-md border-slate-300"></textarea>
\`\`\`

The \`form-*\` classes give you a normalized starting point (removed native appearance, consistent box sizing, a sane default border) — your own utilities layer on top for color, radius, spacing, and focus states.

### A complete styled login form

Putting it together — a login form using the \`class\` strategy plugin classes plus ordinary utilities for layout and states:

\`\`\`html
<form class="mx-auto max-w-sm space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <div>
    <h2 class="text-lg font-semibold text-slate-900">Sign in</h2>
    <p class="mt-1 text-sm text-slate-500">Welcome back — enter your details below.</p>
  </div>

  <div>
    <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
    <input
      id="email"
      type="email"
      required
      class="form-input w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 invalid:border-red-500"
    />
  </div>

  <div>
    <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Password</label>
    <input
      id="password"
      type="password"
      required
      class="form-input w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
    />
  </div>

  <div class="flex items-center justify-between">
    <label class="flex items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" class="form-checkbox rounded text-indigo-600 focus:ring-indigo-500/30" />
      Remember me
    </label>
    <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
  </div>

  <button
    type="submit"
    class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Sign in
  </button>
</form>
\`\`\`

Every visual decision here — spacing, color, radius, focus ring — is still an ordinary utility. The plugin's only job was to give the checkbox and inputs a neutral, cross-browser-consistent starting point so those utilities apply predictably.

> **Key idea:** Text-like inputs style fine with plain utilities, but checkboxes, radios, and selects carry native OS chrome that varies by browser — \`@tailwindcss/forms\` resets them to a neutral baseline (opt-in per element with the \`class\` strategy) so your own utilities render consistently everywhere.`,
    },
    {
      name: "@apply and Extracting Components",
      minutes: 9,
      intro: "Bundle repeated utility combos into a semantic class with @apply, and know when a real component beats it.",
      content: `### The repetition problem

Once a project has more than a handful of buttons, you'll notice the same utility string copy-pasted everywhere:

\`\`\`html
<button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
  Save
</button>
<button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
  Continue
</button>
\`\`\`

Change the brand color once, and you're now hunting down every copy of that string across the codebase. Tailwind gives you a CSS-level escape hatch for this: \`@apply\`.

### @apply basics

Inside any CSS file processed by Tailwind, \`@apply\` lets you pull a set of utility classes into a custom, semantic class name:

\`\`\`css
@import "tailwindcss";

.btn-primary {
  @apply rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50;
}
\`\`\`

Now the markup collapses to one class:

\`\`\`html
<button class="btn-primary">Save</button>
<button class="btn-primary">Continue</button>
\`\`\`

Under the hood, \`@apply\` doesn't add anything special — it literally copies each utility's underlying CSS declarations into your custom rule at build time. \`.btn-primary\` compiles out to the exact same \`border-radius\`, \`background-color\`, \`padding\`, etc. that the utilities would have produced.

You can combine \`@apply\`-authored rules with ordinary CSS properties in the same block, which is handy for anything utilities don't cover cleanly (complex \`background\` gradients, unusual \`transition\` timing functions, and so on):

\`\`\`css
.btn-primary {
  @apply rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white;
  transition: transform 150ms ease;
}

.btn-primary:active {
  transform: scale(0.97);
}
\`\`\`

### The tradeoff: you're back to naming things

\`@apply\` feels like a free win at first, but it reintroduces the exact problem utility-first CSS was designed to avoid: naming. Every \`.btn-primary\`, \`.card\`, \`.badge-success\` you invent is a new abstraction someone has to learn, remember, and keep in sync with its intent. Worse, once several \`.btn-*\` variants exist, they tend to accumulate their own one-off overrides and drift out of sync with each other — the classic maintenance problem CSS component classes always had, just with utilities as the implementation detail instead of raw properties.

### Why a real component is usually better

In a component-based framework like React, you already have a first-class mechanism for "bundle this markup and these classes under one reusable name": a component.

\`\`\`tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function PrimaryButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={\`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 \${className}\`}
      {...props}
    />
  )
}
\`\`\`

\`\`\`tsx
<PrimaryButton onClick={handleSave}>Save</PrimaryButton>
<PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
\`\`\`

This wins over \`@apply\` in almost every way that matters for app code:

| | \`@apply\` class | React component |
|---|---|---|
| Encapsulates markup (not just classes) | No — you still repeat the \`<button>\` tag and its attributes | Yes |
| Type-safe props (variant, size, disabled state) | No | Yes, with TypeScript |
| Colocated with JS behavior (onClick, loading state) | No | Yes |
| Editor autocomplete / "go to definition" | Weak — it's a string in a CSS file | Strong |
| Tree-shakeable, testable in isolation | No | Yes |

The official Tailwind docs themselves recommend reaching for a framework component before \`@apply\` for exactly this reason — \`@apply\` was never meant to replace componentization, only to cover the gap for teams or codebases that don't have components available.

### Where @apply still earns its keep

\`@apply\` isn't obsolete. It's the right tool in a few specific situations:

- **Markup you don't control.** Content rendered from a CMS, a markdown-to-HTML pipeline, or a third-party widget often can't carry your component's props — you only get to touch the CSS. A \`.cms-content h2 { @apply text-2xl font-bold mt-8; }\` rule is the only lever you have.
- **Long-form prose content.** Blog posts and docs pages rendered from markdown produce raw \`<h1>\`–\`<p>\`–\`<ul>\` tags with no chance to add utility classes per element. (In practice, \`@tailwindcss/typography\`'s \`prose\` class handles most of this — but for the pieces it doesn't cover, \`@apply\` fills the gap.)
- **Non-component codebases.** Plain HTML/CSS sites, email templates, or legacy jQuery-driven pages with no component layer at all.
- **A handful of truly global, rarely-changing patterns**, like a site-wide \`.container\` or a print stylesheet override, where the overhead of a component doesn't buy you much.

### A hybrid, pragmatic approach

Many real projects do both: components for anything interactive or reusable across the app, and a small \`components.css\` layer with \`@apply\` for prose/CMS content and a couple of truly global patterns.

\`\`\`css
@import "tailwindcss";

@layer components {
  .prose-cms h2 {
    @apply mt-8 text-2xl font-bold text-slate-900;
  }
  .prose-cms p {
    @apply mt-4 leading-relaxed text-slate-700;
  }
}
\`\`\`

Wrapping these in \`@layer components\` matters: it tells Tailwind these rules belong in the same cascade layer as its own component-level styles, so a later utility class in your markup (like an ad-hoc \`text-3xl\` override) still wins over \`.prose-cms h2\` without a specificity fight.

> **Key idea:** \`@apply\` bundles utilities into a named CSS class, but it trades utility-first's biggest win — no naming, no indirection — for a small convenience. In component-based apps, prefer an actual component; save \`@apply\` for markup you don't control, like CMS or markdown-rendered content.`,
    },
    {
      name: "Managing Class Strings — clsx, tailwind-merge & cva",
      minutes: 10,
      intro: "Stop hand-building conditional className strings — clsx, tailwind-merge, and cva each solve a different piece of that puzzle.",
      content: `### The problem: conditional classNames get messy fast

A component with even a couple of visual states quickly turns into unreadable string concatenation:

\`\`\`tsx
function Button({ variant, disabled, className }: ButtonProps) {
  return (
    <button
      className={
        "rounded-md px-4 py-2 text-sm font-semibold " +
        (variant === "primary" ? "bg-indigo-600 text-white hover:bg-indigo-500 " : "") +
        (variant === "secondary" ? "bg-slate-100 text-slate-900 hover:bg-slate-200 " : "") +
        (disabled ? "cursor-not-allowed opacity-50 " : "") +
        (className || "")
      }
    />
  )
}
\`\`\`

This works, but it's fragile: stray spaces, awkward ternaries, and no protection against two conflicting classes (say, a default \`bg-indigo-600\` and a caller-supplied \`bg-red-600\`) both ending up in the final string, where the winner depends on CSS source order rather than intent. Three small libraries, often used together, solve this cleanly.

### clsx — conditional joining

\`clsx\` (a smaller, faster descendant of the older \`classnames\` package) takes strings, objects, and arrays and joins whichever ones are truthy:

\`\`\`bash
npm install clsx
\`\`\`

\`\`\`tsx
import clsx from "clsx"

clsx("px-4 py-2", isActive && "bg-indigo-600", isDisabled && "opacity-50")
// isActive=true, isDisabled=false -> "px-4 py-2 bg-indigo-600"

clsx("px-4 py-2", {
  "bg-indigo-600 text-white": variant === "primary",
  "bg-slate-100 text-slate-900": variant === "secondary",
})
\`\`\`

\`clsx\` only solves *joining* — it has no idea that \`bg-indigo-600\` and \`bg-red-600\` are both background-color utilities that shouldn't coexist. If both end up in the string, whichever is defined later in Tailwind's generated stylesheet wins, which is rarely what you intended and hard to reason about from the component call site.

### tailwind-merge — resolving conflicting utilities

\`tailwind-merge\` (commonly imported as \`twMerge\`) is purpose-built for exactly that conflict: it understands Tailwind's utility groups and, when two classes target the same CSS property, keeps only the last one.

\`\`\`bash
npm install tailwind-merge
\`\`\`

\`\`\`tsx
import { twMerge } from "tailwind-merge"

twMerge("bg-indigo-600 px-2 py-1", "bg-red-600")
// "px-2 py-1 bg-red-600" -- bg-indigo-600 was dropped, not just overridden by source order
\`\`\`

This matters most in the classic "base classes + caller override" pattern:

\`\`\`tsx
function Card({ className }: { className?: string }) {
  return <div className={twMerge("rounded-lg bg-white p-4 shadow-sm", className)} />
}

<Card className="bg-slate-900 p-6" />
// result: "rounded-lg shadow-sm bg-slate-900 p-6" -- caller's bg and padding cleanly win
\`\`\`

Without \`twMerge\`, a plain template-literal join of \`"rounded-lg bg-white p-4 shadow-sm"\` and the caller's \`className\` would put \`bg-slate-900\` *after* \`bg-white\` in the string, which usually works by luck (later class wins when specificity ties) — but \`p-4\` and \`p-6\` fight over the exact same property, and depending on Tailwind's internal stylesheet order, the result is not guaranteed to be the one the caller wanted. \`twMerge\` removes the guesswork entirely by resolving conflicts explicitly.

A common pairing is \`clsx\` for conditionals feeding into \`twMerge\` for conflict resolution — often wrapped in a tiny \`cn()\` helper:

\`\`\`ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

\`\`\`tsx
<div className={cn("rounded-lg bg-white p-4", isSelected && "bg-indigo-50", className)} />
\`\`\`

This \`cn()\` helper is so common it's become a de facto convention across the React + Tailwind ecosystem — you'll see it by this exact name in most shadcn/ui-based projects.

### cva — structured variant props

\`clsx\`/\`twMerge\` handle joining and conflict resolution, but neither gives you a *schema* for a component's variants. That's what \`class-variance-authority\` (cva) is for: it lets you declare a component's variant and size axes once, with Tailwind classes attached to each option, and get a fully-typed function back.

\`\`\`bash
npm install class-variance-authority
\`\`\`

\`\`\`tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  // base classes applied to every variant
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400",
        danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)
\`\`\`

\`cva\` computes the right class string for any combination of \`variant\`/\`size\`, filling in defaults for anything omitted:

\`\`\`ts
buttonVariants({ variant: "danger", size: "lg" })
// "inline-flex ... rounded-md ... bg-red-600 text-white hover:bg-red-500 ... px-5 py-2.5 text-base"

buttonVariants()
// falls back to defaultVariants: primary + md
\`\`\`

### Putting it all together: a complete Button component

Combining \`cva\` for the variant schema with \`cn()\` (\`clsx\` + \`twMerge\`) for merging in a caller-supplied override:

\`\`\`tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400",
        danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
\`\`\`

\`\`\`tsx
<Button variant="danger" size="lg" onClick={handleDelete}>
  Delete account
</Button>

// a caller can still override anything cleanly, thanks to twMerge inside cn()
<Button variant="primary" className="w-full rounded-full">
  Full-width, pill-shaped
</Button>
\`\`\`

Each library earns its place because they solve different layers of the same problem:

| Library | Solves |
|---|---|
| \`clsx\` | conditionally including/excluding classes without messy string concatenation |
| \`tailwind-merge\` | resolving two conflicting utility classes so the *intended* one wins, not the *last-generated-in-CSS* one |
| \`cva\` | declaring a component's variant/size prop schema once, fully typed, instead of ad-hoc if/else chains |

> **Key idea:** \`clsx\` joins classes conditionally, \`tailwind-merge\` resolves conflicts when a base className meets a caller override, and \`cva\` gives a component's variants a typed schema — combine all three and you get a Button component that's both flexible and impossible to misuse.`,
    },
  ],
}
