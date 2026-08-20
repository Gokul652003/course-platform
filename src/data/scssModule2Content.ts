import type { Module } from "../types"

export const scssModule2: Module = {
  id: 2,
  title: "Variables & Nesting",
  status: "upcoming",
  lessons: [
    {
      name: "Sass Variables",
      minutes: 11,
      intro: "Declare reusable values with $variables, understand !default and scope, and see exactly how they differ from native CSS custom properties.",
      content: `## Declaring a variable

Sass variables are declared with a dollar sign, a name, a colon, and a value — terminated with a semicolon, just like a CSS declaration:

\`\`\`scss
$brand-color: #3454d1;
$base-spacing: 16px;
$font-stack: "Inter", system-ui, sans-serif;
\`\`\`

Once declared, you reference the variable anywhere a value is expected, and Sass substitutes it at **compile time**:

\`\`\`scss
.button {
  background: $brand-color;
  padding: $base-spacing / 2 $base-spacing;
  font-family: $font-stack;
}
\`\`\`

Compiles to:

\`\`\`css
.button {
  background: #3454d1;
  padding: 8px 16px;
  font-family: "Inter", system-ui, sans-serif;
}
\`\`\`

Notice there is no \`$brand-color\` left anywhere in the output — by the time the browser sees this CSS, the variable is gone, replaced with its literal value. This is the single most important thing to internalize about Sass variables: they are a **build-time convenience for you, the author**, not a runtime feature of the stylesheet.

The core motivation is the same one that drives variables in any language: **name a value once, reuse it everywhere, change it in one place**. Without variables, updating a brand color used in forty places means forty find-and-replace edits (and the risk of missing one, or replacing a coincidentally identical hex code that meant something else). With a variable, you edit line one and recompile.

## Variable types

Sass variables aren't typed the way TypeScript variables are, but the *values* you assign them fall into a handful of Sass data types. A quick preview — later modules go deep on lists, maps, and functions that operate on them:

\`\`\`scss
// Number (with or without a unit)
$columns: 12;
$gutter: 1.5rem;

// String (quoted or unquoted — both are valid Sass strings)
$font-family: "Helvetica Neue";
$direction: ltr;

// Color
$primary: #1d4ed8;
$primary-alt: rgb(29, 78, 216);

// Boolean
$debug-mode: false;

// Null (represents "no value" — useful in conditionals, covered later)
$override: null;

// List (space- or comma-separated)
$sizes: 4px 8px 16px 32px;
$font-family-stack: "Inter", Helvetica, Arial, sans-serif;

// Map (key-value pairs — the closest thing Sass has to an object)
$breakpoints: (
  "sm": 640px,
  "md": 768px,
  "lg": 1024px,
);
\`\`\`

Lists and maps deserve their own dedicated treatment (loops, \`map-get()\`, \`@each\`, and so on show up in a later module on control flow), but it's worth knowing this early: **a single variable can hold a whole structured value**, not just a scalar. That's a capability CSS's native variables genuinely do not have.

## Default values with \`!default\`

The \`!default\` flag tells Sass: *"assign this value only if the variable isn't already set."* It's the mechanism that makes a Sass partial or a shared library **configurable** by whoever imports it.

\`\`\`scss
// _config.scss — a partial meant to be shared/imported by consumers
$primary-color: #2563eb !default;
$border-radius: 4px !default;
$font-size-base: 16px !default;
\`\`\`

If a consuming file sets \`$primary-color\` **before** forwarding or using this partial, that value wins and the \`!default\` assignment is skipped entirely. If nothing else sets it, the partial's own value is used as a fallback.

\`\`\`scss
// app.scss
@use "config" with (
  $primary-color: #16a34a,
  $border-radius: 8px
);
\`\`\`

Here, \`@use ... with (...)\` overrides the defaults defined inside \`_config.scss\` — \`$primary-color\` becomes green, \`$font-size-base\` stays at the partial's own default of \`16px\` since it wasn't overridden. This is the standard, modern (Dart Sass, \`@use\`/\`@forward\`) way to build a themeable design-system partial: define sensible defaults with \`!default\`, and let consumers override only what they care about.

Without \`!default\`, a plain assignment always wins, which makes a partial rigid — anyone importing it gets your exact value with no clean way to override it before the fact. \`!default\` is what turns "a file of constants" into "a configuration surface."

\`\`\`scss
// Without !default — consumers can't cleanly configure this before use
$spacing-unit: 8px;

// With !default — consumers CAN configure this
$spacing-unit: 8px !default;
\`\`\`

## Scope: global vs. local

A variable declared at the top level of a stylesheet (outside any rule, mixin, or function) is a **global variable** — visible everywhere in that file, and, once forwarded, anywhere it's imported.

A variable declared **inside** a rule, mixin, or function is **local** to that block — it does not leak out.

\`\`\`scss
$theme-color: teal; // global

.card {
  $card-padding: 20px; // local to this rule only
  padding: $card-padding;
  background: $theme-color; // globals are visible inside locals
}

// $card-padding does not exist out here — it's out of scope
.footer {
  padding: $card-padding; // ERROR: Undefined variable
}
\`\`\`

This mirrors how block scoping works in most programming languages: inner scopes can read outer (global) variables, but outer scopes can never see into inner ones.

### The \`!global\` flag

Sometimes you genuinely want a local assignment to reach out and modify a global variable — usually inside a mixin that's meant to toggle shared state. The \`!global\` flag does exactly that:

\`\`\`scss
$counter: 0;

@mixin increment-counter() {
  $counter: $counter + 1 !global; // reassigns the GLOBAL $counter
}

.a { @include increment-counter(); } // $counter is now 1 globally
.b { @include increment-counter(); } // $counter is now 2 globally
\`\`\`

Without \`!global\`, that assignment inside the mixin would create a brand-new *local* \`$counter\` shadowing the global one, and the global would never change. \`!global\` is a fairly rare tool in practice — reach for it deliberately, since code that mutates global state from inside a nested block can get confusing fast — but it's important to recognize when you see it.

## Sass \`$variables\` vs. native CSS custom properties

This comparison matters more with every year that passes, because native CSS custom properties (\`--like-this\`, read with \`var(--like-this)\`) have matured into a powerful tool in their own right. They are **not** interchangeable with Sass variables — they solve different problems.

| | Sass \`$variable\` | CSS custom property (\`--variable\`) |
|---|---|---|
| Resolved | At **compile time**, by the Sass compiler | At **runtime**, by the browser |
| Exists in shipped CSS? | No — fully substituted away | Yes — stays in the CSS, inspectable in devtools |
| Can change after page load? | No (would require recompiling) | Yes — via JS (\`element.style.setProperty\`), media queries, \`:hover\`, etc. |
| Follows the cascade / inherits? | No — pure text substitution, cascade-unaware | Yes — behaves like any other CSS property, inherits and can be overridden per-selector |
| Scope model | Sass block scope (file / rule / mixin) | CSS selector scope (wherever the custom property is set, and its descendants) |
| Can hold complex values (maps, lists)? | Yes | No — only a single CSS value (or token list) per property |
| Works without a build step? | No — requires compiling Sass to CSS | Yes — native to the browser |
| Best for | Build-time constants, configuration, math, logic | Runtime theming, values that change per-state/user/media-query |

### Why this distinction matters for theming

A light/dark theme toggle is the clearest example of where they differ in practice. With only Sass variables, "switching themes" means compiling two separate stylesheets (or duplicating every rule under a \`.dark\` selector) — because once compiled, \`$brand-color\` is just baked-in text and can never change without a rebuild.

\`\`\`css
/* Runtime theming with custom properties — one ruleset, two states */
:root {
  --surface: #ffffff;
  --text: #111111;
}
[data-theme="dark"] {
  --surface: #111111;
  --text: #f5f5f5;
}
.card {
  background: var(--surface);
  color: var(--text);
}
\`\`\`

Flipping \`data-theme\` on \`<html>\` re-paints every \`.card\` on the page instantly, with zero rebuild and zero JavaScript beyond toggling one attribute. A Sass-only version of this same behavior isn't possible — Sass has already finished its job long before the browser paints anything.

In real projects, the two tools are almost always used **together**, not as competitors: Sass variables drive build-time logic (loops that generate utility classes, math, shared configuration read by mixins), and the values often get **written out** as CSS custom properties precisely so the browser can vary them at runtime.

\`\`\`scss
$brand-color: #2563eb;

:root {
  // A Sass variable used to SET a runtime-capable custom property
  --brand-color: #{$brand-color};
}

.button {
  // Consumed at runtime, so it can still be themed/overridden per-scope
  background: var(--brand-color);
}
\`\`\`

(The \`#{...}\` here is **interpolation** — dropping a Sass value into a context that expects literal text. A later module covers interpolation in full; for now, just recognize the pattern of "Sass variable in, CSS custom property out.")

> **Key idea:** Sass \`$variables\` are compile-time text substitution — powerful for build-time logic, math, and configuration, but invisible and immutable once CSS ships; native CSS custom properties are runtime values that follow the cascade and can change live, making them the right tool for anything that needs to vary after the page has loaded, like theming.`,
    },
    {
      name: "Nesting Selectors",
      minutes: 10,
      intro: "Nest child rules inside a parent to mirror your HTML structure, see exactly how it flattens to CSS, and learn where nesting starts to hurt you.",
      content: `## Why nesting exists

Plain CSS forces you to repeat the parent selector every time you want to style something inside it:

\`\`\`css
.card { border: 1px solid #ddd; }
.card .title { font-size: 1.25rem; }
.card .title strong { color: #111; }
.card .footer { padding-top: 8px; }
\`\`\`

Every rule restates \`.card\`, and as the parent's name gets more specific (or gets renamed), you're editing it in several places. Sass nesting lets you write the relationship once, structurally, the same way your HTML nests elements inside each other:

\`\`\`scss
.card {
  border: 1px solid #ddd;

  .title {
    font-size: 1.25rem;

    strong {
      color: #111;
    }
  }

  .footer {
    padding-top: 8px;
  }
}
\`\`\`

## How it compiles: before and after

This is the part to internalize first, because everything else about nesting follows from it: **Sass nesting is purely a shorthand for writing flat CSS.** Nothing about specificity, cascade order, or selector matching is changed by using it — the compiler just concatenates each nested selector onto its ancestor chain, separated by a space (a descendant combinator), before emitting ordinary flat rules.

Sass source:

\`\`\`scss
.sidebar {
  width: 240px;

  nav {
    padding: 12px;

    ul {
      list-style: none;

      li {
        margin-bottom: 4px;
      }
    }
  }
}
\`\`\`

Compiled CSS:

\`\`\`css
.sidebar {
  width: 240px;
}
.sidebar nav {
  padding: 12px;
}
.sidebar nav ul {
  list-style: none;
}
.sidebar nav ul li {
  margin-bottom: 4px;
}
\`\`\`

Four nested levels in the source became four separate, fully-qualified flat rules in the output — each one just as specific as if you'd hand-typed \`.sidebar nav ul li { ... }\` yourself. Nesting doesn't create any new CSS capability; it's a purely organizational, authoring-time convenience.

## Nesting pseudo-classes and pseudo-elements

Pseudo-classes (\`:hover\`, \`:focus\`, \`:first-child\`) and pseudo-elements (\`::before\`, \`::after\`) nest the same way ordinary descendant selectors do, because Sass doesn't distinguish selector kinds — it just concatenates whatever you write:

\`\`\`scss
.link {
  color: blue;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid blue;
  }

  &::after {
    content: "→";
    margin-left: 4px;
  }
}
\`\`\`

\`\`\`css
.link {
  color: blue;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.link:focus-visible {
  outline: 2px solid blue;
}
.link::after {
  content: "→";
  margin-left: 4px;
}
\`\`\`

Notice the \`&\` immediately before \`:hover\` and \`::after\` — without it, Sass would insert a space and produce the descendant selector \`.link :hover\` (meaning "anything hovered *inside* \`.link\`"), which is almost never what you want for a pseudo-class on the element itself. The next lesson covers \`&\` in full detail; for now, just remember: **pseudo-classes and pseudo-elements almost always need \`&\` glued directly in front of them.**

## Nesting media queries and other at-rules

One of the most genuinely useful forms of nesting is putting a \`@media\` query — or another at-rule like \`@supports\` — **inside** the selector it affects, instead of duplicating the selector inside a separate media query block elsewhere in the file:

\`\`\`scss
.hero {
  padding: 24px;
  font-size: 1.5rem;

  @media (min-width: 768px) {
    padding: 48px;
    font-size: 2.25rem;
  }

  @supports (display: grid) {
    display: grid;
  }
}
\`\`\`

Compiles to:

\`\`\`css
.hero {
  padding: 24px;
  font-size: 1.5rem;
}
@media (min-width: 768px) {
  .hero {
    padding: 48px;
    font-size: 2.25rem;
  }
}
@supports (display: grid) {
  .hero {
    display: grid;
  }
}
\`\`\`

Sass hoists the selector *into* the at-rule block during compilation, producing exactly the flat structure CSS requires (a \`@media\` block can only contain full selector rules, never a bare property). The authoring win is real: the responsive behavior for \`.hero\` lives right next to its base styles, instead of in a separate \`@media\` block that might be hundreds of lines away in a traditional stylesheet — you read the whole story of one component in one place.

It's worth knowing that modern native CSS has now caught up here too: browsers support nesting \`@media\` directly inside a selector without any preprocessor, using the same visual shape shown above. If your target browsers are modern enough, this specific win is no longer Sass-exclusive — see the next lesson's closing note and later modules for more on native CSS nesting.

## The "inception rule" — don't nest too deep

Sass nesting has no hard limit, but that's exactly the danger: it's easy to keep nesting "just one more level" until you've built a selector like \`.sidebar nav ul li a span\`, which has three real problems:

1. **Specificity creep.** Each added element/class raises the compiled selector's specificity, making it progressively harder to override later without reaching for \`!important\` or even deeper nesting elsewhere.
2. **Fragile coupling to HTML structure.** A selector nested five levels deep silently assumes your markup will always have exactly that structure. Restructure the HTML — wrap something in one extra \`<div>\` — and the styles quietly stop matching.
3. **Output bloat.** Every level of nesting gets fully repeated in the compiled CSS for every rule beneath it. Deep nesting trees generate long, repetitive selectors across the whole file.

The community rule of thumb, often called the **Inception rule** (after the film's joke about not going too many dream-layers deep), is: **don't nest more than about three levels.** If you find yourself needing a fourth or fifth level, it's usually a sign you should either flatten using a new class name on the deeply-nested element, or reach for the \`&\` parent selector (next lesson) to build a modifier class instead of relying on structural depth.

\`\`\`scss
// Getting risky — 4 levels deep, tightly bound to exact HTML structure
.card {
  .body {
    .list {
      li {
        a {
          color: blue; // .card .body .list li a — five compound selectors deep
        }
      }
    }
  }
}
\`\`\`

\`\`\`scss
// Flatter and more resilient — a dedicated class instead of structural depth
.card {
  .list-link {
    color: blue; // .card .list-link — two levels, survives markup changes
  }
}
\`\`\`

> **Key idea:** Sass nesting compiles down to ordinary flat CSS selectors with no new capability of its own — it's purely an authoring convenience for mirroring HTML structure — so use it to keep related rules visually grouped, but stop around three levels deep before the compiled specificity and markup coupling start working against you.`,
    },
    {
      name: "The Parent Selector &",
      minutes: 11,
      intro: "Use the & symbol to build modifier classes, attach pseudo-classes correctly, and structure clean BEM components without repeating selector names.",
      content: `## What \`&\` actually does

Inside a nested rule, \`&\` is a placeholder that Sass replaces with the **fully-compiled parent selector** at that point — not just the immediate parent's name, but the whole selector chain built up so far. Where a bare nested selector gets a *space* inserted before it (a descendant combinator), \`&\` gets glued on with **no space**, which is exactly what you need for compound selectors like modifier classes and pseudo-classes.

\`\`\`scss
.btn {
  &.is-active {
    font-weight: bold;
  }
}
\`\`\`

\`\`\`css
.btn.is-active {
  font-weight: bold;
}
\`\`\`

Compare that to leaving \`&\` out:

\`\`\`scss
.btn {
  .is-active {
    font-weight: bold;
  }
}
\`\`\`

\`\`\`css
.btn .is-active {
  font-weight: bold;
}
\`\`\`

These compile to two completely different selectors with two completely different meanings: \`.btn.is-active\` matches **one element that has both classes**; \`.btn .is-active\` matches **any \`.is-active\` element nested inside a \`.btn\`**. This is the single most common nesting mistake — forgetting \`&\` and accidentally creating a descendant selector when you meant a compound one.

## Modifier classes with \`&--modifier\`

A very common pattern — especially in BEM-flavored codebases — is a base component class plus one or more modifier suffixes. \`&\` lets you write the modifier's full name without repeating the block name:

\`\`\`scss
.btn {
  padding: 8px 16px;
  border-radius: 4px;

  &--primary {
    background: #2563eb;
    color: white;
  }

  &--danger {
    background: #dc2626;
    color: white;
  }

  &--large {
    padding: 12px 24px;
    font-size: 1.125rem;
  }
}
\`\`\`

\`\`\`css
.btn {
  padding: 8px 16px;
  border-radius: 4px;
}
.btn--primary {
  background: #2563eb;
  color: white;
}
.btn--danger {
  background: #dc2626;
  color: white;
}
.btn--large {
  padding: 12px 24px;
  font-size: 1.125rem;
}
\`\`\`

Because \`&\` performs direct text concatenation (no space), \`&--primary\` inside \`.btn\` becomes the single flat class \`.btn--primary\` — not a nested \`.btn\`'s descendant, but a sibling-level class that happens to be grouped visually with its base class in the source. This is purely an authoring convenience again: \`.btn--primary\` in the compiled CSS has no structural relationship to \`.btn\` at all, it's just a class name that happens to share a naming convention.

## \`&\` with pseudo-classes and pseudo-elements

As shown briefly in the previous lesson, \`&\` is what makes nested pseudo-classes and pseudo-elements attach directly instead of becoming (incorrect) descendant selectors:

\`\`\`scss
.btn {
  background: #2563eb;
  transition: background 0.15s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: 2px;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
  }
}
\`\`\`

Every one of those compiles to a directly-attached compound selector: \`.btn:hover\`, \`.btn:focus-visible\`, \`.btn:disabled\`, \`.btn::before\`. None of them would make sense as descendant selectors — \`.btn :hover\` would mean "anything hovered inside a \`.btn\`," which is a different, much broader selector you'd rarely want.

## Building BEM structures with \`&\`

BEM (**B**lock **E**lement **M**odifier) is a naming convention — \`.block\`, \`.block__element\`, \`.block--modifier\`, \`.block__element--modifier\` — designed to keep every class name self-describing and free of nesting-based specificity issues in the *compiled CSS*, even though the *Sass source* can still be nested for readability. \`&\` is what makes writing BEM in Sass pleasant instead of repetitive:

\`\`\`scss
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  &__header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  &__body {
    padding: 16px;
  }

  &--highlighted {
    border-color: #2563eb;

    .card__header {
      background: #eff6ff;
    }
  }
}
\`\`\`

\`\`\`css
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.card__header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.card__title {
  font-size: 1.125rem;
  font-weight: 600;
}
.card__body {
  padding: 16px;
}
.card--highlighted {
  border-color: #2563eb;
}
.card--highlighted .card__header {
  background: #eff6ff;
}
\`\`\`

Every generated class — \`.card__header\`, \`.card__title\`, \`.card--highlighted\` — is completely flat with a single class of specificity, exactly as BEM intends, even though the source visually groups all of a block's elements and modifiers together under one \`.card { }\` rule. This is \`&\`'s strongest practical case: it lets the *source* mirror the *component*, while the *output* stays flat and BEM-correct.

## \`&\` with interpolation (a brief preview)

\`&\` can also be combined with \`#{}\` interpolation for cases where you need to build a selector dynamically — for example, generating a whole family of modifier classes from a Sass list inside a loop:

\`\`\`scss
@each $size in small, medium, large {
  .btn--#{$size} {
    // one rule generated per loop iteration
  }
}
\`\`\`

That specific example doesn't need \`&\` at all since it isn't nested, but once you're inside a nested block and need to construct part of a selector programmatically, you'll see patterns like \`&-#{$variant}\` combining both concepts. Full interpolation mechanics — string building, dynamic property names, dynamic values — get their own dedicated treatment in a later module; the important thing to take from this preview is just that \`&\` and \`#{}\` compose together when static modifier names aren't enough.

## A realistic component: a complete button

Putting it all together — base styles, a state pseudo-class, a disabled state, and a modifier — in one component block:

\`\`\`scss
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  background: #e5e7eb;
  color: #111827;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover {
    background: #d1d5db;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: #2563eb;
    color: white;

    &:hover {
      background: #1d4ed8;
    }

    &:disabled {
      background: #93c5fd;
    }
  }
}
\`\`\`

Notice \`&:hover\` and \`&:disabled\` appear **again**, nested inside \`&--primary\` — that's a second, independent \`&\`, resolving relative to *its* nearest parent, which at that point is the already-compiled \`.btn--primary\`. It compiles to \`.btn--primary:hover\` and \`.btn--primary:disabled\` respectively, letting the primary variant override the base hover/disabled treatment without repeating \`.btn--primary\` by hand:

\`\`\`css
.btn { /* ...base styles... */ }
.btn:hover { background: #d1d5db; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: #2563eb; color: white; }
.btn--primary:hover { background: #1d4ed8; }
.btn--primary:disabled { background: #93c5fd; }
\`\`\`

Six clean, flat, single-purpose rules — from one compact, readable block of source that visually keeps the whole component's states together. This is roughly the depth the inception rule from the previous lesson has in mind: nesting used for organization and state variants, not for chasing HTML structure five levels down.

| Pattern | Source | Compiles to |
|---|---|---|
| Modifier class | \`&--primary\` | \`.btn--primary\` |
| State toggle class | \`&.is-active\` | \`.btn.is-active\` |
| Pseudo-class | \`&:hover\` | \`.btn:hover\` |
| Pseudo-element | \`&::before\` | \`.btn::before\` |
| BEM element | \`&__icon\` | \`.btn__icon\` |
| Descendant (no \`&\`) | \`.icon\` | \`.btn .icon\` |

> **Key idea:** \`&\` inserts the fully-compiled parent selector with no space, which is what turns nesting from "always descendant selectors" into a tool for compound classes, pseudo-classes/elements, and BEM modifiers — leave it out and you get a (usually unintended) descendant selector instead.`,
    },
  ],
}
