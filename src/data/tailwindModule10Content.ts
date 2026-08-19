import type { Module } from "../types"

export const tailwindModule10: Module = {
  id: 10,
  title: "Dark Mode & Theming Basics",
  status: "upcoming",
  lessons: [
    {
      name: "Enabling & Using Dark Mode",
      minutes: 9,
      intro: "Turn on the dark: variant, choose between following OS preference or a user-controlled toggle, and wire up whichever strategy v4 or v3 needs.",
      content: `### The dark: variant

Tailwind ships a \`dark:\` variant that works exactly like any other variant you've already used — it just applies its utilities only when \`dark mode\` is considered active:

\`\`\`html
<div class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-6 rounded-lg">
  <h2 class="font-semibold">Account settings</h2>
  <p class="text-slate-500 dark:text-slate-400">Manage your profile and preferences.</p>
</div>
\`\`\`

What actually *triggers* \`dark:\` — the OS setting, or a class you toggle yourself — depends on which of two strategies you configure.

### Strategy 1: media — follow the OS

By default, Tailwind's dark mode uses the \`prefers-color-scheme\` media query. If the user's operating system is set to dark mode, every \`dark:\` utility on the page applies automatically — no HTML changes, no JavaScript, nothing to store.

\`\`\`css
/* what Tailwind generates under the hood, conceptually */
@media (prefers-color-scheme: dark) {
  .dark\\:bg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
\`\`\`

This is the zero-config default and it's genuinely enough for a lot of sites: respect the user's system setting and move on. Its limitation is that **you can't offer an in-app toggle** — there's no \`class\` for your JavaScript to flip, because the browser is deciding based purely on OS state.

### Strategy 2: class / selector — a user-controlled toggle

The moment a product needs a light/dark **switch** in its UI (independent of, or in addition to, the OS setting), you need dark mode driven by a class instead of a media query. Add a class — conventionally \`dark\` — to the \`<html>\` element, and every \`dark:\` utility on the page activates:

\`\`\`html
<html class="dark">
  <body class="bg-white dark:bg-slate-900">
    <!-- dark: utilities are now active everywhere on this page -->
  </body>
</html>
\`\`\`

Remove the class, and dark styles turn off — entirely under your app's control, independent of the OS.

### Configuring the strategy in Tailwind v4

Tailwind v4 has no JS config file for this — dark mode is configured with the \`@custom-variant\` at-rule directly in your CSS entry file (the one with \`@import "tailwindcss"\`):

\`\`\`css
/* app.css — v4, class-based dark mode */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
\`\`\`

This redefines what \`dark:\` means: instead of the built-in \`prefers-color-scheme\` media query, it now matches any element that is, or is inside, an element carrying the \`.dark\` class. If you omit this line entirely, v4's \`dark:\` variant defaults to the \`media\` strategy — you only need \`@custom-variant\` when you want the class-based toggle.

A common variant of this rule targets a \`data-theme\` attribute instead of a class, if that fits your app's conventions better:

\`\`\`css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
\`\`\`

### Configuring the strategy in Tailwind v3

In v3, this lived in \`tailwind.config.js\` as the \`darkMode\` option:

\`\`\`js
// tailwind.config.js — v3
module.exports = {
  darkMode: "class", // was "media" by default
  // ...
}
\`\`\`

| Value | Behavior |
|-------|----------|
| \`"media"\` (v3 default) | follows \`prefers-color-scheme\`, no toggle possible |
| \`"class"\` | \`dark:\` activates when an ancestor has class \`dark\` |
| \`"selector"\` (v3.4+) | same idea as \`"class"\`, but generates a \`:where()\`-wrapped selector so it doesn't accidentally increase specificity in ways that fight your own overrides |

If you're on v3.4 or later and don't have a specific reason to use plain \`"class"\`, prefer \`"selector"\` — it's what v4's default \`@custom-variant\` example above is effectively replicating.

### Which one should you pick?

| Situation | Strategy |
|-----------|----------|
| Simple site/blog, no in-app preference needed | \`media\` (the default — do nothing) |
| App needs a visible light/dark switch | \`class\`/\`selector\` with \`@custom-variant\` |
| Want to *default* to OS preference but still allow override | \`class\`/\`selector\`, with JS that seeds the class from \`matchMedia\` on first load |

That last row is the most common real-world setup: check \`prefers-color-scheme\` once when no saved preference exists, but let a manual toggle win from then on. You'll build exactly that in the next lesson.

> **Key idea:** \`dark:\` is just a variant — what decides whether it's \`active\` is either the OS media query (\`media\`, the default, zero config) or a class/attribute you control (\`class\`/\`selector\`, configured via \`@custom-variant dark\` in v4 or \`darkMode\` in v3's config). Pick \`class\`-based whenever the product needs a toggle.`,
    },
    {
      name: "Building Dark-Mode-Aware Components",
      minutes: 9,
      intro: "Pair up light/dark classes across a card, a nav, and a button, handle inverted icons, and wire a React theme toggle backed by localStorage.",
      content: `### The paired-class pattern

Once \`dark:\` is configured, dark-mode-aware components almost always follow the same shape: every color utility gets a \`dark:\` sibling right next to it. Keeping the pair adjacent in the class list — rather than scattered — makes components far easier to scan and maintain.

\`\`\`html
<!-- A card -->
<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            rounded-lg shadow-sm dark:shadow-none p-6">
  <h3 class="text-slate-900 dark:text-white font-semibold">Plan: Pro</h3>
  <p class="text-slate-500 dark:text-slate-400 mt-1">Billed monthly, cancel anytime.</p>
  <button class="mt-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600
                 text-white px-4 py-2 rounded-md">
    Manage plan
  </button>
</div>
\`\`\`

A few consistent moves worth noting: shadows often get dropped or softened in dark mode (\`shadow-sm dark:shadow-none\`) because a drop shadow reads as an odd dark smudge against an already-dark background; borders usually shift to a lighter-relative-to-background slate step; and \`bg-blue-600 dark:bg-blue-500\` nudges accent colors one step lighter in dark mode, since saturated colors tend to look muddier on a dark background at the same lightness.

### A dark-mode-aware nav

\`\`\`html
<nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  <div class="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
    <span class="font-semibold text-slate-900 dark:text-white">Acme</span>
    <div class="flex gap-6 text-sm">
      <a href="/docs" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
        Docs
      </a>
      <a href="/pricing" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
        Pricing
      </a>
    </div>
  </div>
</nav>
\`\`\`

Notice \`hover:\` still gets its own \`dark:\` pair — \`hover:text-slate-900 dark:hover:text-white\` — because the hover destination color is different in each theme too. Stacked variants like this (\`dark:hover:\`) behave exactly like the \`md:group-hover:dark:\` stacking you saw in the previous module: all conditions must hold.

### Icons and images that need to invert or swap

A plain \`<img>\` doesn't automatically adapt to dark mode. Three common techniques, in order of how often you'll reach for them:

**1. Invert with a filter (best for simple black-line icons/logos):**

\`\`\`html
<img src="/logo-mark.svg" alt="Acme" class="h-8 dark:invert" />
\`\`\`

\`dark:invert\` flips lightness, which works well for a monochrome icon but will produce wrong colors on anything with real color in it.

**2. Swap the source entirely (best for full-color logos/illustrations):**

\`\`\`html
<img src="/logo-light.svg" alt="Acme" class="block dark:hidden" />
<img src="/logo-dark.svg" alt="Acme" class="hidden dark:block" />
\`\`\`

Two \`<img>\` tags, each shown/hidden by \`dark:\` — the browser only requests both if you don't lazy-load, so for a large hero image prefer a \`<picture>\` element with \`prefers-color-scheme\` media queries instead, which avoids double-downloading.

**3. Use currentColor for SVGs you own:**

\`\`\`html
<svg class="h-5 w-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 20 20">
  <path d="..." />
</svg>
\`\`\`

If you control the SVG markup, set its fill/stroke to \`currentColor\` and let a normal \`text-*\`/\`dark:text-*\` pair drive its color — no filters, no duplicate assets, and it composes with hover/focus states too.

### A React theme toggle with localStorage

The full pattern: read a saved preference (falling back to OS preference), apply it to \`<html>\` before paint, and let a button flip it.

\`\`\`tsx
import { useEffect, useState } from "react"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme")
  if (saved === "light" || saved === "dark") return saved

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="rounded-md p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  )
}
\`\`\`

Two details matter here. First, \`getInitialTheme\` checks \`localStorage\` before falling back to \`matchMedia\` — a manual choice always wins over the OS default once one has been made. Second, in a real app you should apply the saved theme class in a tiny inline \`<script>\` in \`index.html\`, *before* React hydrates — otherwise there's a visible flash of the wrong theme while JS loads (often called \`FOUC\` for dark mode). The \`useEffect\` above keeps things in sync after that initial paint, but shouldn't be the only place the class gets set.

> **Key idea:** Keep every color pair (\`bg-white dark:bg-slate-800\`, \`text-slate-900 dark:text-white\`) written adjacently so components stay scannable, prefer \`currentColor\` SVGs over image filters when you control the markup, and always seed the \`dark\` class before React mounts to avoid a flash of the wrong theme.`,
    },
    {
      name: "Color Scales & Semantic Tokens",
      minutes: 9,
      intro: "Stop scattering bg-blue-600 across the codebase — define semantic CSS-variable tokens once and let light/dark become a values swap.",
      content: `### The problem with raw palette classes everywhere

Tailwind's default palette (\`slate\`, \`blue\`, \`red\`, and so on, each with steps \`50\`–\`950\`) is great for prototyping, but using raw palette classes like \`bg-blue-600\` and \`text-slate-900\` directly in fifty different components creates two long-term problems:

1. **Rebranding is a find-and-replace nightmare.** If the brand color changes from blue to indigo, you're hunting down every \`blue-600\`, \`blue-700\`, \`hover:blue-800\` across the codebase — and inevitably missing some.
2. **Dark mode doubles every color decision.** Every \`bg-white\` needs a \`dark:bg-slate-900\` sibling, every \`text-slate-900\` needs a \`dark:text-white\` sibling — written out at every call site, as you saw in the previous lesson. That's manageable for a handful of components; it gets noisy fast across a whole design system.

\`\`\`html
<!-- What this looks like at scale — repeated everywhere, easy to get inconsistent -->
<button class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
  Save
</button>
<a class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
  Learn more
</a>
\`\`\`

Two different components, two different pairings of the \`same conceptual color\` — nothing enforces that they stay consistent as the brand evolves.

### The fix: semantic tokens as CSS variables

Instead of components reaching for a *palette step* (\`blue-600\`), have them reach for a *role* (\`primary\`, \`surface\`, \`danger\`) — a semantic name that describes what the color is **for**, not what it literally looks like. Define each role once as a CSS custom property, and point it at a palette color:

\`\`\`css
/* app.css */
@import "tailwindcss";

@theme {
  --color-surface: var(--color-white);
  --color-surface-muted: var(--color-slate-50);
  --color-on-surface: var(--color-slate-900);
  --color-on-surface-muted: var(--color-slate-500);
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-border: var(--color-slate-200);
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-surface: var(--color-slate-900);
  --color-surface-muted: var(--color-slate-800);
  --color-on-surface: var(--color-white);
  --color-on-surface-muted: var(--color-slate-400);
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  --color-border: var(--color-slate-700);
}
\`\`\`

Declaring these inside \`@theme\` (Tailwind v4's CSS-based config block) does double duty: it registers the variables **and** generates matching utility classes automatically — \`bg-surface\`, \`text-on-surface\`, \`border-border\`, and so on become real Tailwind utilities, exactly like \`bg-blue-600\` is.

### Components now reach for roles, not palette steps

\`\`\`html
<button class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md">
  Save
</button>
<a class="text-primary hover:text-primary-hover">
  Learn more
</a>

<div class="bg-surface text-on-surface border border-border rounded-lg p-6">
  <h3 class="font-semibold">Plan: Pro</h3>
  <p class="text-on-surface-muted">Billed monthly, cancel anytime.</p>
</div>
\`\`\`

No \`dark:\` prefix anywhere in this markup — dark mode is no longer a per-component decision. The \`.dark\` class swaps every \`--color-*\` variable's *value* once, and every component using the token automatically follows, because the utility classes resolve through the variable at paint time, not at build time.

### Comparing the two approaches

| | Raw palette classes | Semantic tokens |
|---|---|---|
| Example | \`bg-blue-600 dark:bg-blue-500\` | \`bg-primary\` |
| Rebrand blue → indigo | edit every call site | edit one variable definition |
| Dark mode | every color needs a \`dark:\` sibling at every call site | handled once, centrally, per token |
| Discoverability | \`what shade is this button?\` — you have to look | \`what role is this button?\` — self-documenting in the class name |
| Best for | quick prototypes, one-off pages | design systems, apps that will be maintained and reskinned |

### A minimal, practical token set to start with

You don't need dozens of tokens on day one. A small set covers most product UI:

| Token | Typical mapping | Used for |
|-------|------------------|----------|
| \`--color-surface\` | white / slate-900 | page and card backgrounds |
| \`--color-surface-muted\` | slate-50 / slate-800 | secondary panels, subtle backgrounds |
| \`--color-on-surface\` | slate-900 / white | primary text |
| \`--color-on-surface-muted\` | slate-500 / slate-400 | secondary/help text |
| \`--color-primary\` | blue-600 / blue-500 | primary actions, links |
| \`--color-border\` | slate-200 / slate-700 | dividers, input borders |
| \`--color-danger\` | red-600 / red-500 | destructive actions, error text |

Grow this list only when a real component needs a distinction the current tokens can't express — resist defining a token \`just in case\`. The whole point is fewer decisions per component, not a second palette to memorize.

> **Key idea:** Raw palette classes are fine for a quick page, but the moment a codebase has more than a handful of components, define semantic CSS-variable tokens (\`--color-primary\`, \`--color-surface\`) once via \`@theme\`, redefine their values under \`.dark\`, and let components reach for the role instead of the shade — dark mode and rebranding both become a values swap instead of a find-and-replace.`,
    },
  ],
}
