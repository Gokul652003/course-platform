import type { Module } from "../types"

export const tailwindModule15: Module = {
  id: 15,
  title: "Tailwind v4 — The New Engine",
  status: "upcoming",
  lessons: [
    {
      name: "What's New in Tailwind v4",
      minutes: 9,
      intro: "Meet the Rust-powered Oxide engine, automatic content detection, and CSS-native config.",
      content: `### A rewritten engine, not just new utilities

Tailwind v4 isn't a typical point release with a handful of new utility classes bolted on — it's a ground-up rewrite of the engine that scans your files and generates CSS. The old engine was pure JavaScript. The new one, nicknamed **Oxide**, moves the hot paths (file scanning, candidate extraction, CSS generation) into Rust, with a thin JS layer on top for the parts that still need it.

The practical effect is speed. On real-world projects the v4 team measured:

| Task | v3 | v4 |
|------|----|----|
| Full build (cold) | ~medium | up to ~5x faster |
| Incremental rebuild (no new classes) | tens of ms | often **sub-millisecond**, measured in microseconds |
| Incremental rebuild (new classes found) | tens to hundreds of ms | up to ~100x faster |

You feel this most during development. Every time you save a file and add a new class like \`hover:translate-y-1\`, Tailwind has to notice the new class exists and generate CSS for it. In v3 that recompilation step was noticeable on large projects; in v4 it's fast enough that it essentially disappears from your workflow.

### Automatic content detection

In Tailwind v3, you had to tell the engine where to look for class names, by hand, in \`tailwind.config.js\`:

\`\`\`js
// v3 — tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
\`\`\`

Forget to add a new directory (a \`packages/ui\` folder in a monorepo, say) and Tailwind would silently fail to generate CSS for classes used there — a very common source of "why isn't this style applying?!" bug reports.

Tailwind v4 detects your content **automatically**. It walks your project from the CSS file's location, respects your \`.gitignore\` so it skips \`node_modules\`, \`dist\`, build output, and other generated/ignored directories, and picks up any file extension where Tailwind classes plausibly live. There's no \`content\` array to remember to update.

You can still register extra sources explicitly with \`@source\` in your CSS when needed — for example a directory outside the project root, or one intentionally excluded by \`.gitignore\`:

\`\`\`css
@import "tailwindcss";
@source "../node_modules/@acme/ui-kit";
\`\`\`

That's the escape hatch for the unusual cases; the common case now needs zero configuration.

### From JS config to CSS-native config

This is the headline architectural shift. In v3, your design tokens — colors, spacing, fonts, breakpoints — lived in a JavaScript object inside \`tailwind.config.js\`:

\`\`\`js
// v3 — tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#5b21b6",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
    },
  },
}
\`\`\`

In v4, that same customization lives directly in your CSS file, using an \`@theme\` block full of real CSS custom properties:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #5b21b6;
  --font-display: "Poppins", sans-serif;
}
\`\`\`

Both approaches generate the same utility, \`bg-brand\` / \`font-display\`, but the v4 version requires no build-tool-specific config file, no JavaScript, and — as you'll see in the next lesson — the resulting variables are visible and usable everywhere, not just to Tailwind's utility generator.

### Do you still need tailwind.config.js?

For most new projects, no. A \`tailwind.config.js\` is now **optional**. If you're migrating an older project (covered in lesson 3) you can keep using one — v4 still supports it via an explicit \`@config\` directive — but greenfield v4 projects typically skip it entirely and configure everything in CSS.

### Setup, in short

\`\`\`bash
npm install tailwindcss @tailwindcss/vite
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss()],
})
\`\`\`

\`\`\`css
/* src/index.css */
@import "tailwindcss";
\`\`\`

That's the entire setup for a Vite project — one plugin, one import line. No PostCSS config file, no \`content\` array, no \`tailwind.config.js\` unless you choose to add one.

> **Key idea:** Tailwind v4 is faster because its scanning and generation engine moved to Rust, simpler because it finds your content files automatically, and more portable because your design tokens are now plain CSS custom properties instead of a JavaScript config object.`,
    },
    {
      name: "CSS-First Configuration with @theme",
      minutes: 10,
      intro: "Define your design tokens as real CSS variables Tailwind reads to generate utilities.",
      content: `### One import, one place to configure

Every v4 project starts the same way:

\`\`\`css
@import "tailwindcss";
\`\`\`

That single line replaces the three separate \`@tailwind base;\`, \`@tailwind components;\`, and \`@tailwind utilities;\` directives from v3. Everything Tailwind needs — resets, utility generation, the works — comes in through that one import.

Configuration then happens in the same file, using an \`@theme\` block:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #5b21b6;
  --color-brand-light: #a78bfa;
  --font-display: "Poppins", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 1920px;
}
\`\`\`

Each declaration inside \`@theme\` does two things at once: it defines a normal CSS custom property (so \`var(--color-brand)\` works anywhere), and it tells Tailwind's generator "make utilities out of this."

### Namespaces Tailwind understands

The prefix of the variable name determines which utilities it feeds. Tailwind ships with a fixed set of namespaces it recognizes inside \`@theme\`:

| Namespace prefix | Feeds utilities like | Example |
|---|---|---|
| \`--color-*\` | \`bg-*\`, \`text-*\`, \`border-*\`, \`fill-*\`, \`ring-*\` | \`--color-brand: #5b21b6\` → \`bg-brand\` |
| \`--font-*\` | \`font-*\` (family) | \`--font-display: ...\` → \`font-display\` |
| \`--text-*\` | \`text-*\` (font size) | \`--text-huge: 4rem\` → \`text-huge\` |
| \`--spacing-*\` | \`p-*\`, \`m-*\`, \`gap-*\`, \`w-*\`, \`h-*\`, etc. | \`--spacing-18: 4.5rem\` → \`p-18\`, \`w-18\` |
| \`--breakpoint-*\` | \`sm:\`, \`md:\`, ... responsive variants | \`--breakpoint-3xl: 1920px\` → \`3xl:flex\` |
| \`--radius-*\` | \`rounded-*\` | \`--radius-xl: 1rem\` → \`rounded-xl\` |
| \`--shadow-*\` | \`shadow-*\` | \`--shadow-glow: 0 0 20px ...\` → \`shadow-glow\` |
| \`--ease-*\` | \`ease-*\` (transition timing) | \`--ease-snap: cubic-bezier(...)\` → \`ease-snap\` |
| \`--animate-*\` | \`animate-*\` | \`--animate-wiggle: wiggle 1s ease-in-out infinite\` → \`animate-wiggle\` |

Notice the naming pattern: \`--{namespace}-{key}\` becomes \`{utility-prefix}-{key}\`. A variable named \`--color-brand\` generates \`bg-brand\`, \`text-brand\`, \`border-brand\`, and every other color-consuming utility — you define the color once and get the full family of utilities for free.

### Extending vs. replacing the default palette

If you just add new \`--color-*\` variables, they're additive — your custom colors sit alongside the full default Tailwind palette (\`slate\`, \`emerald\`, \`red\`, and so on all still work). If you want to **replace** the defaults entirely (common for design-system-constrained projects that only want their own brand palette available), use \`@theme\` with the special \`default\` reset:

\`\`\`css
@theme {
  /* wipes Tailwind's default color palette */
  --color-*: initial;

  --color-brand: #5b21b6;
  --color-surface: #f8fafc;
  --color-danger: #dc2626;
}
\`\`\`

After that, \`bg-slate-100\` no longer exists — only \`bg-brand\`, \`bg-surface\`, and \`bg-danger\` do. This is a deliberate way to enforce "only these tokens are allowed" across a whole team.

### The theme is just CSS variables — use them anywhere

Because \`@theme\` declarations are ordinary custom properties under the hood, they aren't locked inside Tailwind's utility generator. Open your browser devtools on any v4 project and inspect \`:root\` — you'll see \`--color-brand\`, \`--spacing-18\`, and friends sitting right there as real, inspectable CSS variables.

That means you can reach for them directly, outside of any Tailwind class:

\`\`\`html
<!-- in a plain style attribute -->
<div style="background: var(--color-brand); border-radius: var(--radius-xl);">
  Still on-brand, no utility class needed
</div>
\`\`\`

\`\`\`css
/* in hand-written CSS, e.g. a third-party widget you can't add classes to */
.chart-tooltip {
  background: var(--color-surface);
  font-family: var(--font-display);
  box-shadow: var(--shadow-glow);
}
\`\`\`

This is a genuinely new capability compared to v3. Previously your theme lived in a JS object that only the Tailwind build pipeline could read — a chart library, an inline \`style\`, or a \`<canvas>\` drawing routine had no clean way to reuse "the brand purple" without hardcoding it a second time. In v4, the theme *is* the CSS, so there is only one source of truth.

### Referencing theme values inside @theme itself

You can also compose new tokens out of existing ones:

\`\`\`css
@theme {
  --color-brand: #5b21b6;
  --color-brand-muted: color-mix(in srgb, var(--color-brand) 40%, white);
}
\`\`\`

\`color-mix()\` is a modern CSS function (not Tailwind-specific) that blends two colors — handy for deriving lighter/darker variants from a single brand color without hand-picking hex values.

### theme() vs var() in custom CSS

Inside \`@theme\`, or in plain CSS, prefer \`var(--color-brand)\`. The old \`theme(colors.brand)\` function-call syntax from v3 still works in v4 for backward compatibility, but \`var(--color-brand)\` is now the idiomatic form, is understood natively by the browser (not just by a build step), and works even outside a Tailwind-processed file.

> **Key idea:** \`@theme\` doesn't hand config to a separate JavaScript layer — it defines real CSS custom properties that Tailwind reads to generate utilities and that you can \`var()\` into any style, anywhere, making your design tokens a single shared source of truth instead of a build-tool-only concept.`,
    },
    {
      name: "Migrating a v3 Project to v4",
      minutes: 9,
      intro: "Run the official codemod, know the breaking changes, and follow a safe step-by-step checklist.",
      content: `### Start with the automated upgrade tool

Tailwind ships an official codemod that handles most of the mechanical migration work for you:

\`\`\`bash
npx @tailwindcss/upgrade
\`\`\`

Run it from your project root, on a clean git working tree (it modifies files in place, so you want an easy way to diff or revert). It will:

- Update your \`package.json\` dependencies to v4
- Convert \`tailwind.config.js\` theme values into an \`@theme\` block in your CSS where it safely can
- Replace \`@tailwind base/components/utilities\` with \`@import "tailwindcss";\`
- Rename utility classes that changed names
- Flag anything it couldn't convert automatically so you can fix it by hand

It's a huge head start, but treat its output as a first draft — always review the diff, and always re-test your UI visually afterward.

### Key breaking changes to know about

| Area | v3 | v4 |
|------|----|----|
| CSS entry point | \`@tailwind base;\` \`@tailwind components;\` \`@tailwind utilities;\` | \`@import "tailwindcss";\` |
| Config file | \`tailwind.config.js\` required | Optional — \`@theme\` in CSS is the default path |
| Content paths | Manual \`content: [...]\` array | Automatic detection (+ optional \`@source\`) |
| Opacity modifiers | \`bg-opacity-50\`, \`text-opacity-75\`, etc. | Removed — use the slash syntax: \`bg-black/50\` |
| Default ring | \`ring\` = 3px, blue by default | \`ring\` = 1px, matches \`currentColor\` by default |
| Default border color | gray-200 | \`currentColor\` (be explicit: \`border-slate-200\`) |
| \`shadow-sm\` / \`shadow\` scale | \`shadow-sm\`, \`shadow\`, \`shadow-md\`... | Renamed a step: old \`shadow\` is now \`shadow-sm\`, etc. — check your shadows visually |
| PostCSS setup | \`tailwindcss\` + \`autoprefixer\` as separate PostCSS plugins | Prefer the dedicated \`@tailwindcss/postcss\` or \`@tailwindcss/vite\` plugin (autoprefixing is built in) |
| Browser support | Wider (older browsers) | Targets modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+) — uses native CSS cascade layers, \`@property\`, \`color-mix()\` |

The **opacity slash syntax** deserves a closer look since it's one of the most common breakages:

\`\`\`html
<!-- v3 -->
<div class="bg-black bg-opacity-50 text-white text-opacity-90">...</div>

<!-- v4 -->
<div class="bg-black/50 text-white/90">...</div>
\`\`\`

The slash syntax actually shipped in v3 too (as the modern alternative), but v4 removes the separate \`*-opacity-*\` utilities entirely — the codemod rewrites these automatically, but it's worth knowing why they disappeared if you see it in a diff.

The **ring** change is a subtler trap because it doesn't error — your UI just looks different. If your project used the bare \`ring\` class expecting a visible 3px blue focus ring, you'll now get a barely-visible 1px \`currentColor\` ring. Be explicit after migrating:

\`\`\`html
<button class="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Sign in
</button>
\`\`\`

### Step-by-step migration checklist

1. **Commit or stash everything.** You want a clean baseline to diff against.
2. **Check Node and browser targets.** v4 requires a modern build toolchain and targets modern browsers — confirm your supported browser matrix (see table above) is compatible before committing to the upgrade.
3. **Run the codemod:** \`npx @tailwindcss/upgrade\`.
4. **Review the CSS entry file.** Confirm \`@tailwind ...\` directives became \`@import "tailwindcss";\`, and that your old \`theme.extend\` values landed correctly inside \`@theme\`.
5. **Decide whether to keep \`tailwind.config.js\`.** If the codemod left one behind (e.g. for a \`plugins\` array it couldn't convert to CSS), keep it and reference it explicitly:
   \`\`\`css
   @import "tailwindcss";
   @config "../tailwind.config.js";
   \`\`\`
   Otherwise, delete it once everything's represented in \`@theme\`.
6. **Search your codebase for removed utilities** — particularly \`*-opacity-*\` classes the codemod might have missed inside string-concatenated class names.
7. **Audit rings, borders, and shadows visually.** These are the "silent" breakages — nothing errors, components just look subtly different. Click through your key screens.
8. **Update your PostCSS/Vite config** to the dedicated \`@tailwindcss/postcss\` or \`@tailwindcss/vite\` plugin, and remove \`autoprefixer\` if it was only there for Tailwind's sake.
9. **Run your full test suite and do a visual pass** in both light and dark mode, at each breakpoint you support.
10. **Re-run the app in a real browser matching your minimum supported version** to catch any modern-CSS-feature gaps (cascade layers, \`color-mix()\`) before shipping.

### When migration isn't worth it yet

If a project is in maintenance mode, has heavy use of a JS plugin ecosystem that hasn't updated for v4, or you simply don't have time to do the visual QA pass, it's completely reasonable to stay on v3 for now. v4 adoption is worth planning deliberately, not rushing — the speed and DX gains are real, but so is the QA cost of a framework-wide visual diff.

> **Key idea:** The \`@tailwindcss/upgrade\` codemod does most of the mechanical work, but the dangerous breakages — opacity utilities, ring defaults, border colors, shadow scale — are silent visual changes, not compile errors, so budget time for an actual eyes-on-screen QA pass after running it.`,
    },
  ],
}
