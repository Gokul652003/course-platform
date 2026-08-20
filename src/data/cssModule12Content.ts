import type { Module } from "../types"

export const cssModule12: Module = {
  id: 12,
  title: "Custom Properties & Modern CSS Functions",
  status: "upcoming",
  lessons: [
    {
      name: "CSS Custom Properties (Variables)",
      minutes: 12,
      intro: "Declare and read custom properties, understand how they scope, cascade, and inherit, and use them to build a real light/dark theme.",
      content: `## Custom properties, in one sentence

CSS **custom properties** — informally called *CSS variables* — let you store a value once under an author-defined name and reuse it anywhere a value is expected. You declare one with \`--name: value\` and read it back with \`var(--name)\`. Unlike preprocessor variables (Sass \`$variable\`, Less \`@variable\`), custom properties are a genuine part of the CSS language: they live in the DOM, they participate in the cascade, they inherit down the element tree, and — unlike a Sass variable, which is erased at compile time — they can be read and changed at runtime, including from JavaScript.

That last point is the real difference. A Sass variable is a find-and-replace trick that happens before the browser ever sees your CSS. A custom property is still there, live, when the page is running — which is what makes it possible to flip a theme, respond to a media query, or animate a value, all without recompiling anything.

### Declaring a custom property

Any selector can declare a custom property. The name must start with two dashes, and after that almost anything goes — letters, numbers, and hyphens are typical:

\`\`\`css
:root {
  --brand-color: #6366f1;
  --spacing-unit: 8px;
  --max-content-width: 72rem;
}
\`\`\`

Custom property **values are not type-checked** at declaration time. \`--brand-color: #6366f1\` and \`--brand-color: "not a color"\` are both perfectly valid declarations as far as the parser is concerned — CSS just stores the raw token sequence. The value only gets checked for validity at the point it's *used* inside a real property, via \`var()\`. This is different from a normal property like \`color: not-a-color\`, which the browser rejects immediately.

### Reading with var() and fallbacks

You read a custom property with the \`var()\` function, which takes the property name and an optional fallback used when the property is unset:

\`\`\`css
.button {
  background: var(--brand-color);
  padding: var(--spacing-unit);
  /* fallback: if --gap isn't defined anywhere, use 16px */
  gap: var(--gap, 16px);
}
\`\`\`

The fallback only kicks in when the custom property is **not defined at all** (or is an invalid value for that spot). It does not kick in just because you'd prefer a different default in some other context — for that, redeclare the custom property itself in a more specific selector.

Fallbacks can themselves reference other custom properties, chaining nicely:

\`\`\`css
.card {
  padding: var(--card-padding, var(--spacing-unit, 8px));
}
\`\`\`

### Scope: :root vs local scope

Where you declare a custom property determines who can see it, because custom properties resolve through the same selector-matching and inheritance machinery as every other CSS property.

Declaring on \`:root\` (the \`<html>\` element, effectively) makes a property visible everywhere, since every element in the document descends from \`:root\` and inherits from it:

\`\`\`css
:root {
  --brand-color: #6366f1;
}
\`\`\`

Declaring on any other selector scopes the property to that element and its descendants:

\`\`\`css
.card {
  --card-padding: 1.5rem;
}

.card p {
  /* sees --card-padding because it's a descendant of .card */
  margin-bottom: var(--card-padding);
}

.sidebar {
  /* --card-padding is NOT visible here — .sidebar isn't inside .card */
  padding: var(--card-padding, 1rem); /* falls back to 1rem */
}
\`\`\`

This is the pattern for **component-local design tokens**: define a small set of custom properties on a component's root class, then reference them throughout that component's own rules. It keeps the "knobs" for a component in one place, right at the top of its stylesheet section, instead of scattered magic numbers.

### Custom properties and the cascade

Custom properties are ordinary CSS declarations, so they follow the **same cascade rules** as any other property — specificity, source order, and \`!important\` all apply exactly as you'd expect:

\`\`\`css
:root {
  --button-bg: gray;
}

.button {
  --button-bg: blue; /* more specific selector wins here */
  background: var(--button-bg);
}

.button.is-danger {
  --button-bg: crimson; /* even more specific, wins over .button */
}
\`\`\`

An element resolves \`var(--button-bg)\` by looking at whatever value **wins the cascade** for that property on that element — which might come from the element's own rule, or might be inherited from an ancestor if nothing more specific set it locally.

### Custom properties inherit (unlike preprocessor variables)

By default, custom properties are **inherited properties** — like \`color\` or \`font-family\`, and unlike layout properties such as \`margin\` or \`width\`. A value set on a parent flows down to every descendant that doesn't override it:

\`\`\`css
.theme-dark {
  --text-color: white;
  --bg-color: #111827;
}

.theme-dark p,
.theme-dark span,
.theme-dark li {
  /* all inherit --text-color from .theme-dark without redeclaring it */
  color: var(--text-color);
}
\`\`\`

This inheritance is exactly what makes custom properties so useful for theming: set a handful of them once, near the top of the tree, and every descendant that references them automatically picks up the right value — no need to repeat the declaration on every single element.

If you want a custom property to explicitly *not* inherit and to have real type-checking and an initial value, you can register it with \`@property\`, which is a more advanced tool for building custom properties that behave like built-in ones (including being animatable). For everyday theming, the plain \`--name: value\` form covers the vast majority of use cases.

### A practical theming example: light/dark via data-theme

The cleanest way to implement a light/dark theme toggle is to define your color tokens as custom properties once, then **redefine only those tokens** under a theme selector — every rule that uses \`var()\` updates automatically, with zero duplicated CSS.

\`\`\`css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-border: #e5e7eb;
  --color-accent: #6366f1;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-border: #334155;
  --color-accent: #818cf8;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

.card {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
}

.button-primary {
  background: var(--color-accent);
  color: white;
}
\`\`\`

\`\`\`html
<html data-theme="dark">
  <body>
    <div class="card">...</div>
  </body>
</html>
\`\`\`

Every component's CSS stays completely unaware that theming exists — it just reads \`var(--color-bg)\`, \`var(--color-text)\`, and so on. The theme switch is a single attribute change on \`<html>\`, and because \`[data-theme="dark"]\` sits at the root of the document, every descendant inherits the new values instantly. A class-based version (\`.dark\` instead of \`[data-theme="dark"]\`) works identically — the attribute selector is just a common convention because it reads clearly as "this is a mode, not a style."

You can also respect the user's OS-level preference as the initial theme, then let an explicit toggle override it:

\`\`\`css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #0f172a;
    --color-text: #f1f5f9;
  }
}

:root[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
}
\`\`\`

This gives three layers, from lowest to highest priority in practice: a light default, an OS-preference override when no explicit theme is chosen, and an explicit \`data-theme\` attribute that always wins once the user picks one.

### Reading and writing custom properties from JavaScript

Because custom properties are live, JavaScript can read and set them on any element through the standard style APIs — no rebuild, no re-render of CSS required:

\`\`\`js
// Read the resolved value of a custom property
const styles = getComputedStyle(document.documentElement)
const accent = styles.getPropertyValue("--color-accent").trim()

// Set (or override) a custom property on an element
document.documentElement.style.setProperty("--color-accent", "#f97316")

// Toggling a theme is often just this one line:
document.documentElement.setAttribute("data-theme", "dark")
\`\`\`

This is the mechanism behind most dynamic theming systems, including user-configurable accent colors, animated custom properties driven by scroll or pointer position, and design tools that let non-developers tweak spacing or color live. Because the property is just a DOM style, setting it re-triggers layout/paint the same way changing any other inline style would — no special framework glue needed.

### Custom properties vs preprocessor variables

| | Sass/Less variables | CSS custom properties |
|---|---|---|
| When resolved | Compile time (before the browser sees CSS) | Runtime, live in the browser |
| Can change after page load | No — fixed at build | Yes — via JS, media queries, or cascade |
| Participate in the cascade | No — pure text substitution | Yes — behave like real CSS declarations |
| Inherit through the DOM | No such concept | Yes, by default |
| Scoped to a selector | No — global to the compile | Yes — scoped to wherever declared |
| Usable in media queries as values | No | Yes, with some limitations |
| Naming syntax | \`$name\` / \`@name\` | \`--name\`, read via \`var(--name)\` |

The two aren't mutually exclusive — plenty of codebases use Sass variables for build-time constants (like breakpoint numbers used in \`@media\` conditions) while using custom properties for anything that needs to change at runtime, like theme colors.

### Gotchas worth knowing

- A custom property's fallback is evaluated **lazily** — an unused fallback with an invalid value doesn't break anything, since it's never actually applied.
- Custom properties **cannot** be used as property *names* or selector names — only as values. You can't write \`var(--prop): red\` to dynamically name a property.
- If a custom property resolves to something invalid for the property using it (e.g. \`--size: red\` used inside \`width: var(--size)\`), that property becomes **invalid at computed-value time** and falls back to its own initial or inherited value — not to the \`var()\` fallback, which only applies when the custom property is unset.
- Custom property names are **case-sensitive**: \`--Color\` and \`--color\` are two different properties.

> **Key idea:** Custom properties aren't a compile-time text substitution like Sass variables — they're live, cascading, inheriting CSS values you can read and write at runtime, which is exactly what makes attribute-driven theming (and JS-driven dynamic styling) possible with almost no extra code.`,
    },
    {
      name: "calc(), min(), max(), clamp()",
      minutes: 12,
      intro: "Do real math in CSS values — mix units with calc(), pick bounds with min()/max(), and build fluid, responsive values with clamp().",
      content: `## calc() — mixing units safely

\`calc()\` lets you write a mathematical expression as a CSS value, and — critically — it lets you **mix units that CSS otherwise can't combine directly**, like percentages and fixed lengths:

\`\`\`css
.sidebar-content {
  /* full width, minus a fixed 2rem gutter on each side */
  width: calc(100% - 4rem);
}

.sticky-header-offset {
  /* fill the viewport height below a fixed-height header */
  min-height: calc(100vh - 64px);
}
\`\`\`

Without \`calc()\`, there's no way to express "100% of the parent, minus a fixed number of pixels" in a single declaration — percentages and pixels aren't combinable by plain CSS arithmetic outside of a \`calc()\` expression. This is the single most common reason to reach for it.

The four basic operators all work — \`+\`, \`-\`, \`*\`, \`/\` — with one syntax rule that trips people up constantly: **\`+\` and \`-\` must have whitespace on both sides**, while \`*\` and \`/\` don't require it:

\`\`\`css
/* correct */
width: calc(100% - 20px);
width: calc(100%-20px); /* INVALID — no space around - */

/* multiply/divide are more forgiving, but stay consistent */
width: calc(100% / 3);
padding: calc(var(--spacing-unit) * 2);
\`\`\`

That's not a style preference — \`calc(100%-20px)\` is a parse error, because without the spaces the parser can't tell \`-20px\` from a unary-negative token attached to \`20px\` versus a subtraction operator. Always write \`calc(a - b)\` and \`calc(a + b)\` with spaces.

\`calc()\` also works nested inside itself, and can freely reference custom properties:

\`\`\`css
:root {
  --gutter: 1.5rem;
}

.grid-item {
  width: calc((100% - calc(var(--gutter) * 2)) / 3);
}
\`\`\`

### min() — picking the smaller of several values

\`min()\` takes a comma-separated list of values and resolves to whichever one is **smallest** at render time. It's most often used to cap a value that would otherwise grow unbounded:

\`\`\`css
.modal {
  /* never wider than 600px, but shrink on narrow viewports */
  width: min(600px, 90vw);
}
\`\`\`

Read that as: "600px, unless 90% of the viewport width is smaller — in which case, use that instead." On a wide desktop screen, \`90vw\` is huge, so \`600px\` wins and the modal caps out at a fixed size. On a narrow phone, \`90vw\` is smaller than \`600px\`, so the modal shrinks to fit with a comfortable margin, with no media query required.

### max() — picking the larger of several values

\`max()\` is the mirror image — it resolves to whichever value is **largest**, which makes it the natural tool for enforcing a *minimum*:

\`\`\`css
.container {
  /* at least 320px wide, but grow with the viewport past that */
  width: max(320px, 50vw);
}

.button {
  /* never let padding collapse below 12px, even at small type scales */
  padding-inline: max(12px, 1em);
}
\`\`\`

A useful mnemonic: \`min()\` sets a **ceiling** (the value can't exceed the smallest option), and \`max()\` sets a **floor** (the value can't drop below the largest option). It feels backwards the first few times — the function name describes what the browser picks, not the effect on your layout — so it's worth internalizing deliberately.

### clamp() — fluid values with a floor and a ceiling

\`clamp()\` combines both ideas into one function: it takes three arguments — a **minimum**, a **preferred** value, and a **maximum** — and resolves to the preferred value, except it never goes below the minimum or above the maximum:

\`\`\`css
font-size: clamp(1rem, 2vw, 1.5rem);
\`\`\`

This is exactly equivalent to nesting \`min()\` and \`max()\`:

\`\`\`css
font-size: max(1rem, min(2vw, 1.5rem));
\`\`\`

\`clamp(MIN, PREFERRED, MAX)\` reads as: "try to use PREFERRED, but never let the result fall below MIN, and never let it rise above MAX." The middle argument is usually a viewport-relative unit (\`vw\`) or a mix via \`calc()\`, so the value actually *scales* between the floor and ceiling as the viewport resizes, rather than jumping abruptly the way a media query breakpoint would.

### Worked example: fluid typography

The classic use case is a heading that scales smoothly with viewport width instead of using two or three fixed sizes behind media queries:

\`\`\`css
h1 {
  /* never smaller than 1.75rem, never larger than 3.5rem,
     scales smoothly in between based on viewport width */
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
}
\`\`\`

Why \`4vw + 1rem\` instead of a plain \`4vw\`? A pure \`vw\` value is 0 at a 0-width viewport, which means the *rate of change* is all that \`vw\` contributes — adding a fixed \`rem\` offset shifts the whole curve up so it starts from a sane baseline and only the "extra" scales with viewport width. This combination of a fixed part plus a viewport-relative part is the standard recipe for fluid type:

\`\`\`css
/* general shape: clamp(MIN, FIXED + FLEXIBLE, MAX) */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
\`\`\`

At narrow viewports, the preferred value undershoots \`1rem\` and the clamp locks to the floor. At wide viewports, the preferred value overshoots \`1.25rem\` and the clamp locks to the ceiling. In between, the size genuinely interpolates — no breakpoint jumps, no "flash" of a new size at a specific width.

### Worked example: fluid spacing

The same pattern works for padding, margin, and gap — anywhere you'd otherwise write three fixed values across three media queries:

\`\`\`css
.section {
  padding-block: clamp(2rem, 5vw, 6rem);
}

.card-grid {
  gap: clamp(0.75rem, 2vw, 2rem);
}
\`\`\`

Compare that to the older, breakpoint-driven equivalent:

\`\`\`css
.section {
  padding-block: 2rem;
}

@media (min-width: 640px) {
  .section { padding-block: 3.5rem; }
}

@media (min-width: 1200px) {
  .section { padding-block: 6rem; }
}
\`\`\`

The \`clamp()\` version is one line instead of three blocks, and — more importantly — the value changes continuously rather than snapping at two arbitrary pixel widths, which tends to look and feel smoother, especially on resizable desktop windows rather than fixed-size phones.

### Nesting these functions together

\`calc()\`, \`min()\`, and \`max()\` can all be arguments to each other, and to \`clamp()\`, letting you express fairly sophisticated sizing logic in one declaration:

\`\`\`css
.layout {
  /* at least 280px, ideally 25% of viewport minus the gutter,
     but never more than 400px */
  width: clamp(280px, calc(25vw - 1rem), 400px);
}

.avatar {
  /* scale with font size, but stay within a sane pixel range */
  width: clamp(32px, min(3em, 8vw), 96px);
}
\`\`\`

These compose because every one of these functions ultimately resolves to a single numeric value with a unit — a \`min()\` inside a \`clamp()\` is just another value as far as the outer \`clamp()\` is concerned.

### Combining with custom properties for a design-token system

The real payoff comes from pairing these functions with custom properties: define your fluid scale **once**, as tokens, and reference the tokens everywhere instead of repeating the math:

\`\`\`css
:root {
  --font-size-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.95rem);
  --font-size-base: clamp(1rem, 0.95rem + 0.3vw, 1.15rem);
  --font-size-lg: clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem);
  --font-size-xl: clamp(1.75rem, 1.4rem + 2vw, 3rem);

  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
}

h1 { font-size: var(--font-size-xl); }
h2 { font-size: var(--font-size-lg); }
p { font-size: var(--font-size-base); }

.section { padding-block: var(--space-lg); }
.card { padding: var(--space-md); gap: var(--space-sm); }
\`\`\`

This is effectively a hand-rolled fluid design-token scale — the same idea behind tools like Utopia (a popular fluid-scale generator) — and it composes with the theming pattern from the previous lesson: nothing stops a \`[data-theme]\` or a component-scoped selector from overriding one of these tokens locally, since they're just custom properties like any other.

### Function comparison

| Function | Arguments | Resolves to | Typical use |
|---|---|---|---|
| \`calc()\` | Any math expression | The computed result | Mixing units (\`100% - 2rem\`) |
| \`min()\` | 2+ values | The smallest value | Capping a maximum size |
| \`max()\` | 2+ values | The largest value | Enforcing a minimum size |
| \`clamp()\` | min, preferred, max | Preferred, bounded by min/max | Fluid typography & spacing |

### A note on browser math and units

All four functions can mix compatible unit types freely inside their expressions — lengths with lengths, or lengths with percentages via \`calc()\` — and the browser resolves everything down to a single value at layout time. You generally don't need to worry about unit conversion yourself; write the expression in whatever units make each part's *intent* clearest (percentages for "relative to the container," \`rem\` for "relative to the root font size," \`vw\` for "relative to the viewport"), and let \`calc()\`/\`clamp()\` reconcile them.

> **Key idea:** \`calc()\` mixes units that plain CSS can't combine, \`min()\`/\`max()\` pick a bound from a list of candidates, and \`clamp(min, preferred, max)\` fuses both into a single fluid value — together they replace most breakpoint-driven sizing with continuous, viewport-aware math, especially once wired up through custom properties as design tokens.`,
    },
    {
      name: "Modern Color & Math Functions",
      minutes: 11,
      intro: "Blend colors with color-mix(), derive variants with relative color syntax, understand oklch()/oklab(), and meet round() and mod().",
      content: `## color-mix() — blending colors in CSS

\`color-mix()\` blends two colors together directly in CSS, in a chosen color space, without any preprocessor or JavaScript color math. The basic form takes a color space and two colors, each optionally weighted by a percentage:

\`\`\`css
.tinted {
  /* 80% brand color, 20% white — a lighter tint */
  background: color-mix(in srgb, var(--brand-color) 80%, white);
}
\`\`\`

The percentage describes how much of *that* color contributes to the mix — so \`color-mix(in srgb, red 80%, white)\` is mostly red with a little white folded in, not the other way around. If you omit percentages entirely, the two colors are mixed 50/50.

### Worked example: tinting a brand color

A very common real need: generate lighter and darker variants of a single brand color for hover states, disabled states, or a tonal palette, without hand-picking hex values for each one:

\`\`\`css
:root {
  --brand: #6366f1;
}

.button-primary {
  background: var(--brand);
}

.button-primary:hover {
  /* 15% darker: mix in black */
  background: color-mix(in srgb, var(--brand) 85%, black);
}

.button-primary:disabled {
  /* washed out: mix in a lot of white */
  background: color-mix(in srgb, var(--brand) 40%, white);
}

.badge-subtle {
  /* a soft tinted background for a badge, from the same one brand color */
  background: color-mix(in srgb, var(--brand) 15%, white);
  color: color-mix(in srgb, var(--brand) 70%, black);
}
\`\`\`

This is the "one source color, many derived shades" pattern: keep a single \`--brand\` custom property as the source of truth, and let \`color-mix()\` generate every tint, shade, and tonal variant from it at the point of use, rather than maintaining ten separate hardcoded hex values that can drift out of sync when the brand color changes.

You can also mix two entirely different colors — useful for building a small gradient-like relationship between a "start" and "end" brand color, or for simulating an alpha-blend against a background:

\`\`\`css
.overlay {
  /* blend brand color over the current background, simulating transparency */
  background: color-mix(in srgb, var(--brand-color) 30%, var(--bg-color));
}
\`\`\`

The \`in srgb\` part chooses the **color space the mixing math happens in** — \`srgb\`, \`srgb-linear\`, \`hsl\`, \`lab\`, \`lch\`, \`oklab\`, and \`oklch\` are all valid choices, and the choice changes the *path* the blend takes between the two colors, not just the output format. \`oklch\` in particular tends to produce smoother, more perceptually even blends than plain \`srgb\`, which is worth trying if a mix looks muddier or duller than expected.

### Relative color syntax — deriving a variant from an existing color

**Relative color syntax** lets you take an existing color and construct a new one by referencing and modifying its individual channels, using the \`from\` keyword inside a color function:

\`\`\`css
:root {
  --brand: oklch(60% 0.15 280);
}

.button-primary:hover {
  /* same hue and chroma, but darker lightness */
  background: oklch(from var(--brand) calc(l - 0.1) c h);
}

.icon-muted {
  /* same color, 50% opacity */
  color: rgb(from var(--brand) r g b / 0.5);
}
\`\`\`

Inside \`oklch(from var(--brand) ...)\`, the letters \`l\`, \`c\`, and \`h\` refer to the **lightness, chroma, and hue channels of the source color**, and can be used directly or fed into \`calc()\` to shift just one channel while leaving the others untouched. The \`rgb(from ...)\` form works the same way with \`r\`, \`g\`, \`b\`, and \`alpha\` channels.

This solves a specific problem \`color-mix()\` doesn't: "give me this exact color, just darker" or "this exact color, just half transparent," without guessing what percentage of black or white would land on the right result. It reads directly as an edit to one channel, which is both easier to write and easier to review than a mix percentage tuned by trial and error.

### oklch() and oklab() — perceptually uniform color

\`oklch()\` and \`oklab()\` describe colors in the **OKLCH** and **OKLAB** color spaces — modern, **perceptually uniform** alternatives to \`hsl()\` and \`rgb()\`. \`oklch()\` takes three values that map closely to how humans actually perceive color: lightness, chroma (roughly, saturation/intensity), and hue angle:

\`\`\`css
.brand {
  /* lightness 60%, chroma 0.15, hue 280deg */
  color: oklch(60% 0.15 280);
}

.brand-with-alpha {
  color: oklch(60% 0.15 280 / 0.8);
}
\`\`\`

\`oklab()\` is the same underlying space expressed in Cartesian coordinates (lightness, plus \`a\`/\`b\` axes) rather than lightness/chroma/hue — \`oklch\` is almost always the more convenient one to hand-author, since chroma and hue are more intuitive knobs than two abstract axes.

### Why oklch beats hsl for building color scales

\`hsl()\`'s lightness channel is **not perceptually uniform** — two colors with the same HSL lightness value can look wildly different in actual perceived brightness depending on their hue. A pure yellow at \`hsl(60 100% 50%)\` looks much brighter to the eye than a pure blue at \`hsl(240 100% 50%)\`, even though both claim "50% lightness." This makes HSL a poor tool for generating a color *scale* (a set of tints/shades of a hue, or a multi-hue palette meant to feel evenly stepped) — the numbers lie about the perceived result.

\`oklch()\`'s lightness channel is calibrated to actually match human perception, so two \`oklch()\` colors with the same lightness value **look equally bright**, regardless of hue. That property makes it dramatically easier to build a consistent set of shades:

\`\`\`css
:root {
  /* a genuinely even lightness ramp, same hue and chroma throughout */
  --blue-100: oklch(95% 0.03 250);
  --blue-300: oklch(80% 0.08 250);
  --blue-500: oklch(60% 0.15 250);
  --blue-700: oklch(45% 0.15 250);
  --blue-900: oklch(25% 0.1 250);
}
\`\`\`

Each step down genuinely reads as "one step darker" to the eye, because the lightness axis actually tracks perceived brightness. Building the same ramp in HSL usually requires manually eyeballing and adjusting each stop, because equal steps in HSL's lightness number do not produce equal steps in how dark the color looks.

\`oklch()\` also has a **wider addressable gamut** than \`hsl()\`/\`rgb()\`, meaning it can express colors — particularly certain vivid greens and blues — that sRGB-based functions simply cannot represent, which matters increasingly as wide-gamut (P3) displays become common.

### Color function comparison

| | \`hsl()\` | \`oklch()\` | \`color-mix()\` |
|---|---|---|---|
| What it does | Defines a color | Defines a color | Blends two existing colors |
| Lightness perceptually uniform | No | Yes | Depends on chosen space |
| Good for hand-built color scales | Poor — uneven steps | Good — even steps | N/A, it blends rather than scales |
| Typical use | Legacy / simple one-off colors | New color definitions, scales, tokens | Hover/tint/shade variants from one source color |

### round() and mod() — newer math functions, briefly

Two more recent additions round out CSS's small math-function toolkit. \`round()\` rounds a value to a given step, with a rounding strategy as its first argument (\`nearest\`, \`up\`, \`down\`, or \`to-zero\`):

\`\`\`css
/* round up to the nearest multiple of 8px — useful for snapping to a grid */
width: round(up, 101px, 8px);
\`\`\`

\`mod()\` returns the remainder of dividing one value by another (taking the sign of the divisor), useful for things like cycling a value through a fixed set of steps:

\`\`\`css
/* wraps back to 0 once it would exceed 360deg */
--hue: mod(var(--raw-hue), 360deg);
\`\`\`

Neither is as commonly reached for as \`calc()\`/\`clamp()\`/\`color-mix()\` day to day, but both are worth recognizing when you see them — they're part of the same family of "do real math directly in CSS" functions, extending the pattern from plain arithmetic into rounding and modular arithmetic.

> **Key idea:** \`color-mix()\` blends existing colors, relative color syntax edits one channel of an existing color, and \`oklch()\`/\`oklab()\` replace \`hsl()\`/\`rgb()\` as the color space of choice for anything that needs to *look* evenly stepped — because their lightness axis is calibrated to human perception instead of raw math, which is exactly what \`hsl()\` lacks.`,
    },
  ],
}
