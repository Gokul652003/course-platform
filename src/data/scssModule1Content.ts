import type { Module } from "../types"

export const scssModule1: Module = {
  id: 1,
  title: "Getting Started with Sass",
  status: "in_progress",
  lessons: [
    {
      name: "What Is Sass & Why Preprocess CSS",
      minutes: 9,
      intro: "Understand the problem CSS preprocessing solves, meet Sass's two syntaxes, and see honestly where Sass still earns its keep against modern native CSS.",
      content: `## The problem, before the tool

CSS was never designed with programming in mind. It's a declarative styling language — selectors and property-value pairs — and for a long time it deliberately had none of the mechanisms developers reach for in almost every other language. For roughly two decades, plain CSS had:

- **No variables.** If your brand color \`#3366ff\` appeared in 40 places across a stylesheet, it was typed out 40 times. Change the brand color, and you're doing a find-and-replace across every file, hoping you don't miss one or accidentally match an unrelated value.
- **No nesting.** A rule like \`.card .card__title\` had to be written as a single flat selector. There was no way to write the child rule visually "inside" the parent rule the way the HTML itself is nested.
- **No reuse mechanism.** If five different components needed the same combination of \`display: flex; align-items: center; gap: 0.5rem;\`, that block got copy-pasted five times. There was no function, no include, no way to name a chunk of styles and reuse it.
- **No real logic.** No loops to generate a set of repetitive rules (say, ten spacing utility classes), no conditionals to vary output based on a parameter, no way to do math beyond what \`calc()\` could offer once it finally arrived.

None of this made CSS broken — it did exactly what it was built to do, and still does. But as stylesheets grew from a few dozen rules to thousands of lines across large applications, the lack of abstraction became a real maintenance cost. Teams wanted the things every other part of their toolchain already had: named constants, composition, loops, functions.

**Sass** (Syntactically Awesome Style Sheets) was created in 2006 to close that gap. It isn't a new styling language — it's a **CSS preprocessor**: you write source files in Sass's syntax, and a compiler turns them into plain \`.css\` files that a browser can actually load. The browser never sees Sass. It only ever sees the CSS that comes out the other end.

\`\`\`scss
// input.scss — this is NOT valid CSS, browsers can't read this directly
$brand-color: #3366ff;

.button {
  background: $brand-color;

  &:hover {
    background: darken($brand-color, 10%);
  }
}
\`\`\`

\`\`\`css
/* output.css — this IS valid CSS, and this is what actually ships */
.button {
  background: #3366ff;
}
.button:hover {
  background: #1a4dff;
}
\`\`\`

That's the entire mental model for this whole course: you author \`.scss\` files, a compiler expands variables, nesting, functions, and logic into flat, ordinary CSS rules, and that generated CSS is what you link in your HTML or bundle through your build tool. Every feature covered in later modules — nesting, mixins, functions, loops, the module system — is ultimately just a more convenient way of writing rules that a build step turns into CSS a browser already understands.

## Sass's two syntaxes: .sass vs .scss

Something that trips up newcomers immediately: **Sass has two different syntaxes**, and they are not the same file format with a different extension — they parse differently.

### The indented syntax (\`.sass\`)

This is Sass's original syntax from 2006. It drops curly braces and semicolons entirely and uses indentation to indicate nesting, the same way Python uses indentation instead of \`{ }\`:

\`\`\`sass
// styles.sass — the indented syntax
.card
  padding: 1rem
  border-radius: 8px

  .card__title
    font-weight: bold
\`\`\`

No \`{\`, no \`}\`, no \`;\`. Whitespace is meaningful — get the indentation wrong and the file fails to compile, exactly like a Python \`IndentationError\`.

### SCSS (\`.scss\`) — "Sassy CSS"

SCSS was introduced in Sass 3 (2010) specifically to solve an adoption problem: the indented syntax meant you couldn't just rename an existing \`.css\` file to \`.sass\` and start using Sass features — you'd have to rewrite every rule's punctuation. SCSS fixed that by being a **strict superset of CSS**: every valid CSS file is already valid SCSS. You can rename \`styles.css\` to \`styles.scss\`, change nothing, and it compiles as-is.

\`\`\`scss
// styles.scss — the SCSS syntax
.card {
  padding: 1rem;
  border-radius: 8px;

  .card__title {
    font-weight: bold;
  }
}
\`\`\`

Curly braces, semicolons, ordinary CSS-like structure — Sass features (variables, nesting, mixins, etc.) are layered on top without changing that fundamental shape.

### Why this course uses SCSS

| | \`.sass\` (indented) | \`.scss\` |
|---|---|---|
| Delimiters | Indentation, no braces/semicolons | Curly braces \`{ }\`, semicolons \`;\` |
| Superset of CSS | No — different syntax entirely | Yes — valid CSS is valid SCSS |
| Copy-paste CSS snippets | Requires rewriting punctuation | Works unchanged |
| Community/ecosystem usage | Minority | Overwhelming majority |
| Tooling, editor support, examples online | Less common | Default assumption almost everywhere |

SCSS won in practice. The vast majority of real-world Sass code, npm packages, framework source (Bootstrap's Sass source, for instance), and Stack Overflow answers are written in SCSS, not the indented syntax. Every example in this course uses \`.scss\` files exclusively — it's the syntax you'll actually encounter, and being CSS-compatible means your existing CSS knowledge transfers directly rather than requiring you to learn a second punctuation scheme on top of a second feature set.

## An honest note: hasn't CSS caught up?

It's a fair question, and worth answering upfront rather than pretending the CSS landscape hasn't moved. Native CSS genuinely has closed part of the gap that Sass was originally built to fill:

- **CSS custom properties** (\`--brand-color: #3366ff;\` read via \`var(--brand-color)\`) give you real, runtime variables — something Sass's \`$variables\` cannot do, since Sass variables are compiled away and don't exist in the browser at all.
- **Native CSS nesting** (standardized and now broadly supported in evergreen browsers) lets you nest a child selector inside a parent rule without any preprocessor, using syntax close to what Sass popularized.
- **\`calc()\`, \`clamp()\`, \`color-mix()\`**, and other modern functions handle math and color manipulation that once required a preprocessor.

So if variables and nesting were the *only* reasons to reach for Sass, the case has genuinely weakened. But that's not the whole feature set, and it's not why Sass remains widely used in 2026. Sass still offers things native CSS has no equivalent for at all:

- **Real control flow** — \`@if\`/\`@else\`, \`@each\`, \`@for\`, and \`@while\` let you branch and loop at compile time to *generate* CSS rules programmatically. Native CSS has no loop construct; you cannot ask a browser stylesheet to "generate ten utility classes for me."
- **Functions with return values** — Sass functions (\`@function\`) take arguments and return computed values, reusable anywhere a value is expected. CSS has no user-defined functions.
- **A real module system** — \`@use\`/\`@forward\` let you split styles across files with actual namespacing and private/public members, closer to how JavaScript modules work, well beyond what a plain \`@import\` of a CSS file offers.
- **Maps** — a genuine key-value data structure (\`$sizes: (sm: 4px, md: 8px, lg: 16px)\`) that you can loop over, look values up in, and pass around. CSS has nothing comparable.

The honest summary: native CSS is a much stronger default than it was a decade ago, and some projects genuinely no longer need Sass for the basics. But "variables and nesting" was never Sass's full pitch — control flow, functions, a module system, and maps are still Sass-only territory, and they're exactly what make large stylesheets maintainable at scale. This course covers all of it, and the final module returns to this comparison in full depth once you've actually used every Sass feature yourself and can judge the tradeoff from experience rather than from a summary paragraph.

> **Key idea:** Sass is a compiler, not a runtime — it turns an extended, more expressive syntax (variables, nesting, logic, functions, modules) into plain CSS before the browser ever sees it; use the SCSS syntax (a strict superset of CSS) throughout, and understand that while native CSS has absorbed some of Sass's original value (custom properties, nesting), Sass's control flow, functions, module system, and maps remain capabilities plain CSS still doesn't have.`,
    },
    {
      name: "Installing & Compiling Sass",
      minutes: 11,
      intro: "Install Dart Sass, compile .scss to .css from the command line, watch files for changes, and wire Sass into a Vite build.",
      content: `## Dart Sass: the one implementation that matters

Historically there were three Sass implementations: **Ruby Sass** (the original, deprecated in 2019), **LibSass** (a fast C/C++ port, deprecated in 2020), and **Dart Sass**. As of today, **Dart Sass is the only actively maintained implementation**, and it's what every tool in this course — and virtually every tool in the wider ecosystem — uses under the hood, including the Sass integrations built into Vite, webpack, and other bundlers. When documentation or a package simply says "Sass" without qualification, it means Dart Sass. This course does too.

## Installing Sass via npm

Dart Sass ships as an npm package, which is by far the most common way to install it in a JavaScript/TypeScript project:

\`\`\`bash
npm install --save-dev sass
\`\`\`

That's the entire installation. It's a \`devDependency\` because Sass is a build-time tool — it compiles your \`.scss\` files during development and build, but none of it ships to the browser. The package name is simply \`sass\` (not \`node-sass\`, which was a now-deprecated LibSass binding for Node — if you see \`node-sass\` mentioned anywhere, treat it as legacy advice and use \`sass\` instead).

Once installed, the \`sass\` CLI is available via \`npx sass\` (or directly if installed globally, though a project-local devDependency is the recommended approach so every contributor compiles with the same version).

## Compiling a file from the command line

Given a source file:

\`\`\`scss
// src/styles/main.scss
$spacing: 16px;

.container {
  padding: $spacing;

  .title {
    font-size: 1.5rem;
    margin-bottom: $spacing / 2;
  }
}
\`\`\`

Compile it to CSS with a single one-off command — source path, then output path:

\`\`\`bash
npx sass src/styles/main.scss dist/main.css
\`\`\`

The resulting \`dist/main.css\` is ordinary, browser-ready CSS:

\`\`\`css
.container {
  padding: 16px;
}
.container .title {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
\`\`\`

Notice what happened: \`$spacing\` was substituted with its literal value everywhere it was used, the division \`$spacing / 2\` was computed at compile time into \`8px\`, and the nested \`.title\` rule was flattened into the fully-qualified selector \`.container .title\`. None of that logic exists in the output — only its result does. This is the core thing to internalize about a preprocessor: the browser only ever receives the *outcome* of the Sass code running, never the Sass code itself.

### Useful CLI flags

| Flag | What it does |
|---|---|
| \`--watch\` | Recompiles automatically whenever the source file changes |
| \`--style=compressed\` | Minifies the output (no whitespace/newlines) — use for production |
| \`--style=expanded\` | Default, human-readable output — use for development |
| \`--no-source-map\` | Skips generating a \`.css.map\` file (source maps are on by default) |
| \`--load-path=<dir>\` | Adds a directory Sass should search when resolving \`@use\`/\`@forward\` |

### Watching for changes during development

Add \`--watch\` and Sass keeps running, recompiling every time you save the source file:

\`\`\`bash
npx sass --watch src/styles/main.scss:dist/main.css
\`\`\`

Note the colon-separated \`source:destination\` pairing syntax here — this is how you tell the watch mode which output file corresponds to which input file. You can watch an entire directory the same way, mapping a source folder to an output folder:

\`\`\`bash
npx sass --watch src/styles:dist/css
\`\`\`

Every \`.scss\` file inside \`src/styles\` (that isn't a partial — more on partials in a later module) gets its own corresponding compiled file inside \`dist/css\`, and any of them recompiles automatically the moment you save it. This is the workflow most developers actually use day to day: leave \`sass --watch\` running in a terminal tab and never think about the compile step again until it's time to build for production, at which point you'd drop \`--watch\` and add \`--style=compressed\`.

A typical \`package.json\` captures both modes as scripts:

\`\`\`json
{
  "scripts": {
    "sass:watch": "sass --watch src/styles:dist/css",
    "sass:build": "sass --style=compressed --no-source-map src/styles:dist/css"
  }
}
\`\`\`

## Integrating Sass into a Vite project

If you're using a bundler like Vite (as this course platform itself does for its own styles), you generally don't invoke the \`sass\` CLI directly at all — Vite has built-in support for Sass baked into its CSS pipeline. The only requirement is that the \`sass\` package is installed; Vite detects it automatically:

\`\`\`bash
npm install --save-dev sass
\`\`\`

With that installed, importing a \`.scss\` file works immediately, no config changes required:

\`\`\`ts
// main.tsx
import "./styles/main.scss"
\`\`\`

\`\`\`scss
/* src/styles/main.scss */
$brand: #3366ff;

body {
  font-family: system-ui, sans-serif;
  color: $brand;
}
\`\`\`

Vite's dev server compiles that \`.scss\` file to CSS on the fly and injects it, with hot-module-replacement updating the page instantly on save — no separate \`sass --watch\` process needed alongside it. For a production build (\`vite build\`), Vite compiles every imported \`.scss\` file to CSS and bundles it into the output, same as it does for plain \`.css\` imports.

If you need to pass options to the underlying Sass compiler — for example, adding extra \`@use\` load paths so imports resolve from a shared directory — that's configured under \`css.preprocessorOptions.scss\` in \`vite.config.ts\`:

\`\`\`ts
import { defineConfig } from "vite"

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ["src/styles"],
      },
    },
  },
})
\`\`\`

That's genuinely the entire integration surface for most projects: install \`sass\`, import \`.scss\` files like you'd import \`.css\` files, and optionally add \`loadPaths\` once your stylesheets start splitting across multiple files with a shared module system (covered in a later module).

> **Key idea:** Install Dart Sass via \`npm install --save-dev sass\`; use the \`sass\` CLI with \`--watch\` for standalone compilation during development, or simply import \`.scss\` files directly in a Vite (or similar bundler) project, since Vite's CSS pipeline compiles Sass automatically once the \`sass\` package is present — either way, the browser only ever receives the compiled, plain-CSS output.`,
    },
    {
      name: "SCSS Syntax Basics",
      minutes: 8,
      intro: "Learn the two comment styles, confirm that ordinary CSS is already valid SCSS, and get a map of every feature the rest of this course will cover.",
      content: `## Ordinary CSS is your starting point

The single most useful fact about SCSS, worth repeating from the first lesson: **it's a strict superset of CSS**. Every selector, every property, every value, every at-rule you already know how to write in a \`.css\` file is already correct, valid SCSS. There is no new syntax to learn just to write a plain rule:

\`\`\`scss
.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: #3366ff;
  color: white;
  font-weight: 600;
}

.button:hover {
  background-color: #254edb;
}

@media (min-width: 768px) {
  .button {
    padding: 0.75rem 1.5rem;
  }
}
\`\`\`

That file would compile to itself, byte-for-byte equivalent CSS (modulo formatting) — nothing Sass-specific is happening in it yet. Everything covered from this point forward in the course is *additional* syntax layered on top of this baseline, not a replacement for it. You don't lose any CSS knowledge moving to SCSS; you only gain capability.

## Comments: two kinds, one important difference

CSS has one comment syntax, \`/* ... */\`, and it always survives into the compiled output (unless a minifier strips it). SCSS adds a second comment style, and the distinction between the two matters:

\`\`\`scss
// This is a "silent" comment — SCSS-only syntax
// It never appears anywhere in the compiled CSS output, no matter what.

/* This is a CSS comment.
   It gets preserved in the compiled output (in expanded/development mode). */

.card {
  // silent comment — a note to yourself or a teammate, invisible downstream
  padding: 1rem; /* CSS comment — ships in the output CSS */
}
\`\`\`

Compiled (with \`--style=expanded\`, the default):

\`\`\`css
.card {
  /* CSS comment — ships in the output CSS */
  padding: 1rem;
}
\`\`\`

Notice the \`//\` line and its content disappeared entirely, while the \`/* */\` comment survived. This gives you a genuinely useful distinction that plain CSS never had: use \`//\` for internal notes — reminders to yourself, explanations of *why* a value is what it is, TODOs, anything that's only useful while reading the source — and reserve \`/* */\` for the rare comment you actually want a person inspecting the shipped CSS (via browser devtools, for instance) to be able to read. In compressed/minified production builds, \`/* */\` comments are typically stripped too unless explicitly preserved (Dart Sass keeps a comment starting with \`/*!\` even under compression, a convention borrowed from tools like Sass and various CSS minifiers for license headers) — but during normal development, \`/* */\` output is a reliable way to leave a note that shows up in the actual generated stylesheet.

| | \`// silent comment\` | \`/* CSS comment */\` |
|---|---|---|
| Valid in plain CSS | No — SCSS-only | Yes — standard CSS |
| Appears in compiled output | Never | Yes (unless minified away) |
| Typical use | Internal notes, explanations, TODOs | Notes meant to survive into shipped CSS, license headers |
| Works mid-line | Yes, like most \`//\` comments | Yes |
| Works across multiple lines | No — one \`//\` per line | Yes, spans multiple lines |

A small practical habit worth adopting immediately: default to \`//\` for everything. It's almost always what you actually want — notes for the next developer reading the source, not the next developer inspecting compiled output in a browser's devtools panel. Reach for \`/* */\` only when you specifically want the comment to ship.

## Selectors and declarations: still just CSS

Nothing about how you write a selector or a declaration changes in SCSS. Class selectors, id selectors, element selectors, attribute selectors, pseudo-classes, pseudo-elements, combinators (\`>\`, \`+\`, \`~\`), at-rules like \`@media\` and \`@font-face\` — all identical to plain CSS, because SCSS doesn't touch any of it. What SCSS adds sits *around* these familiar building blocks: variables that get substituted into values, nesting that expands into flat selectors, directives that generate or reuse rules — but the atoms themselves (a selector, a declaration, a value) are exactly the CSS you already know.

## A map of what's ahead

This module covered the "why" and the installation/compilation mechanics — no actual new SCSS *features* yet beyond the two comment styles. Everything that makes Sass worth reaching for lives in the modules ahead. Briefly, so you have a mental map of where the course is going:

- **Variables (\`$name: value\`)** — named, reusable values (colors, spacing, breakpoints) substituted at compile time, plus how they differ from native CSS custom properties and when to reach for each.
- **Nesting** — writing child selectors visually inside their parent rule, using \`&\` to reference the parent selector for pseudo-classes, modifiers, and compound selectors, and where native CSS nesting now overlaps with this.
- **Mixins (\`@mixin\` / \`@include\`)** — named, reusable blocks of declarations, optionally parameterized, that get pasted into any rule that includes them — the closest thing Sass has to a function that returns a whole block of CSS rather than a single value.
- **Functions (\`@function\`)** — reusable logic that computes and returns a single value (a color, a number, a string) usable anywhere a value is expected, plus Sass's large library of built-in color, math, string, and list functions.
- **Control flow (\`@if\`/\`@else\`, \`@each\`, \`@for\`, \`@while\`)** — compile-time branching and looping, used heavily to generate repetitive rule sets (utility classes, color scales, grid columns) programmatically instead of by hand.
- **The module system (\`@use\` / \`@forward\`)** — splitting styles across multiple files with real namespacing, private-by-default members, and explicit re-exports, replacing the legacy global \`@import\` (which is deprecated and scheduled for eventual removal from the language — this course only mentions it where historically relevant).
- **Maps** — an actual key-value data structure for things like a full spacing scale or color palette, iterable with \`@each\` and queryable by key.

By the end of the course, the final module circles back to the comparison raised in this module's first lesson — Sass versus modern native CSS — and by then you'll have hands-on experience with every feature involved, so that comparison can be a genuinely informed judgment call for your own projects rather than a guess.

> **Key idea:** SCSS is CSS you already know, plus two comment styles (\`//\` silent, never compiled; \`/* */\` CSS-standard, usually compiled) layered on top — everything else that makes Sass powerful (variables, nesting, mixins, functions, control flow, modules, maps) is genuinely new syntax covered one feature at a time starting next module.`,
    },
  ],
}
