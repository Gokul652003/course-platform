import type { Module } from "../types"

export const scssModule5: Module = {
  id: 5,
  title: "Functions",
  status: "upcoming",
  lessons: [
    {
      name: "Built-in Sass Functions",
      minutes: 12,
      intro: "Tour Sass's built-in modules — sass:math, sass:color, sass:list, sass:map, sass:string — and why they're namespaced now.",
      content: `## Sass ships a standard library

Beyond nesting and variables, Sass gives you a genuine **standard library** of functions for doing real work with numbers, colors, strings, lists, and maps — the kind of logic that plain CSS either can't express at all, or only recently gained a narrow native equivalent for (\`calc()\`, \`color-mix()\`, \`clamp()\`). These functions live in **built-in modules**, and since Dart Sass 1.23, you load them the same way you load your own partials: with \`@use\`.

\`\`\`scss
@use "sass:math";
@use "sass:color";
@use "sass:list";
@use "sass:map";
@use "sass:string";
\`\`\`

Each \`@use "sass:X"\` line pulls in one module, and every function inside it is called with a **namespace prefix**: \`math.div(10, 2)\`, \`color.adjust($c, $lightness: 10%)\`, \`list.length($items)\`. This is a deliberate design choice, not boilerplate for its own sake — understanding *why* it changed will save you from stale tutorials and Stack Overflow answers that predate it.

### Why namespacing replaced global functions

Older Sass (and early Dart Sass, before modules) exposed every built-in as a bare global name: \`lighten($color, 10%)\`, \`length($list)\`, \`map-get($map, key)\`. That worked, but it created two problems as Sass matured:

1. **Name collisions.** If you wrote your own \`length()\` helper — say, one that formats a CSS length value — it silently shadowed (or clashed with) the built-in \`length()\`. There was no way to tell, from the call site, whether \`length($x)\` meant "yours" or "Sass's."
2. **No discoverability.** A flat global namespace of 100+ functions gives you no hint about what's related. Is \`nth()\` a list function or a string function? You had to know, or go look it up.

Namespaced modules fix both: \`list.nth()\` is unambiguous and self-documenting, and your own function named \`length\` can happily coexist with \`math.length\`-shaped calls because they're never confused. The old global names (\`lighten\`, \`darken\`, \`map-get\`, etc.) still work in Dart Sass for backward compatibility, but they're considered **legacy** — new code should use the namespaced \`sass:\` modules, and some legacy global functions (like \`lighten\`/\`darken\`) are slated for eventual removal in favor of their \`color.*\` replacements.

| | Legacy global function | Namespaced module function |
|---|---|---|
| Division | \`$a / $b\` (deprecated for math) | \`math.div($a, $b)\` |
| Lighten a color | \`lighten($c, 10%)\` | \`color.adjust($c, $lightness: 10%)\` |
| List length | \`length($list)\` | \`list.length($list)\` |
| Map lookup | \`map-get($map, $key)\` | \`map.get($map, $key)\` |
| Status | Works, but discouraged | Current, recommended |

The rest of this lesson uses namespaced calls throughout — treat that as the default going forward.

## sass:math — real arithmetic

Sass numbers carry units, and \`sass:math\` is where you do precise, unit-aware arithmetic on them.

### math.div — and why plain \`/\` stopped meaning division

For a long time, \`$a / $b\` in Sass meant division — a holdover from Sass's early days, before CSS itself used \`/\` for anything else. But modern CSS overloaded \`/\` for its own purposes: the shorthand \`font: 16px/1.5 sans-serif\`, \`grid-column: 1 / 3\`, and \`hsl(0 100% 50% / 0.5)\` all use \`/\` as a **separator**, not an operator. That created a genuine ambiguity — Sass couldn't always tell whether you meant "divide these two numbers" or "pass these two values through separated by a slash," and guessing wrong silently produced broken CSS.

Dart Sass's fix was to deprecate \`/\` as a division operator entirely and introduce \`math.div()\` as the unambiguous replacement:

\`\`\`scss
@use "sass:math";

.sidebar {
  // Old, deprecated way — emits a deprecation warning:
  // width: 100% / 3;

  // Correct, unambiguous way:
  width: math.div(100%, 3);
}
\`\`\`

Plain \`/\` still works as a CSS separator (for \`font\`, \`grid-column\`, and similar shorthand), and Sass leaves it alone in those contexts. What changed is that \`/\` is no longer *also* silently interpreted as division — if you want division, you say so explicitly with \`math.div()\`.

\`\`\`scss
@use "sass:math";

$container-width: 1200px;
$columns: 12;
$gutter: 24px;

.column {
  width: math.div($container-width - ($gutter * ($columns - 1)), $columns);
}
\`\`\`

### Rounding and clamping

\`\`\`scss
@use "sass:math";

math.round(4.3);   // 4
math.round(4.5);   // 5
math.ceil(4.1);    // 5
math.floor(4.9);   // 4
math.abs(-12px);   // 12px
math.min(10px, 4px, 8px); // 4px
math.max(10px, 4px, 8px); // 10px
\`\`\`

These are the kind of building blocks that make a spacing scale or a fluid-typography helper possible — you'll write functions using exactly these in the next lesson.

### math constants and other helpers

\`sass:math\` also exposes constants like \`math.$pi\`, and functions like \`math.sqrt()\`, \`math.pow()\`, and \`math.percentage()\` (which converts a unitless ratio to a percentage — \`math.percentage(math.div(1, 3))\` gives \`33.3333%\`).

## sass:color — computing colors, not just naming them

\`sass:color\` lets you derive new colors from existing ones at compile time, which is one of the genuinely hard-to-replace Sass features — plain CSS variables can't compute a lighter or more saturated version of a color on their own; they can only substitute a value.

### color.adjust — nudge a channel by a fixed amount

\`color.adjust()\` takes a color and one or more channel adjustments, applied additively:

\`\`\`scss
@use "sass:color";

$brand: #3366cc;

.button:hover {
  background: color.adjust($brand, $lightness: 8%);
}

.button:active {
  background: color.adjust($brand, $lightness: -8%, $saturation: -5%);
}
\`\`\`

This replaces the older \`lighten($color, $amount)\` / \`darken($color, $amount)\` globals, which only ever adjusted lightness. \`color.adjust\` is more general: it can shift \`$red\`, \`$green\`, \`$blue\`, \`$hue\`, \`$saturation\`, \`$lightness\`, or \`$alpha\` in one call.

### color.scale — adjust proportionally, toward a limit

Where \`color.adjust\` adds a fixed amount, \`color.scale\` moves a channel a *percentage of the remaining distance* toward its maximum or minimum — which tends to look more natural, especially near the extremes (adjusting a very light color by a flat \`+10%\` lightness can blow it out to pure white; scaling never overshoots).

\`\`\`scss
@use "sass:color";

// Scale lightness 20% of the way toward white:
$hover: color.scale(#3366cc, $lightness: 20%);

// Scale alpha 50% of the way toward fully transparent:
$faded: color.scale(#3366cc, $alpha: -50%);
\`\`\`

### color.mix — blend two colors together

\`color.mix()\` blends two colors, optionally weighted toward one of them:

\`\`\`scss
@use "sass:color";

$blended: color.mix(#3366cc, #ffffff);       // 50/50 mix
$mostly-blue: color.mix(#3366cc, #ffffff, 80%); // 80% blue, 20% white
\`\`\`

### Sass color functions vs native CSS color-mix() and relative color syntax

This is a place where native CSS has genuinely caught up, and it's worth being honest about it. Modern browsers now support \`color-mix()\` and **relative color syntax** directly in CSS:

\`\`\`css
.button:hover {
  background: color-mix(in srgb, #3366cc 80%, white);
}

.button:active {
  /* relative color syntax: derive from an existing color */
  background: hsl(from #3366cc h s calc(l - 10%));
}
\`\`\`

| | Sass (\`color.*\`) | Native CSS (\`color-mix()\` / relative color) |
|---|---|---|
| When it runs | Compile time — fixed output, zero runtime cost | Runtime, in the browser |
| Can use a CSS custom property as input | No — Sass can't see runtime CSS variable values | Yes — this is the killer feature |
| Browser support needed | None — output is plain CSS | Requires reasonably modern browsers |
| Best for | Colors known at build time (your design system's palette) | Colors that depend on a runtime custom property or user input |

The practical takeaway: if a color is baked into your design tokens and never changes at runtime, Sass color functions are simpler and have zero browser-compatibility concerns, because the math happens once, at build time. If you need to derive a color *from a CSS custom property* — something that can change via a theme toggle or user setting — Sass literally cannot help, because it never sees runtime values; that's exactly the case native \`color-mix()\` and relative color syntax were built for.

## sass:list and sass:map — brief overview

You'll use these heavily once you reach control-flow directives (\`@each\`, \`@for\`) in the next module, but the core functions are worth knowing now:

\`\`\`scss
@use "sass:list";
@use "sass:map";

$sizes: (small, medium, large);
list.length($sizes);        // 3
list.nth($sizes, 2);        // medium
list.append($sizes, xlarge); // (small, medium, large, xlarge)

$spacing: (sm: 8px, md: 16px, lg: 24px);
map.get($spacing, md);      // 16px
map.keys($spacing);         // (sm, md, lg)
map.has-key($spacing, xl);  // false
\`\`\`

## sass:string — basic string helpers

\`\`\`scss
@use "sass:string";

string.length("hello");           // 5
string.to-upper-case("btn");      // "BTN"
string.slice("hello-world", 1, 5); // "hello"
string.index("hello-world", "-"); // 6
\`\`\`

These come up most often when generating class names or debug output programmatically — you'll see a practical use of interpolation with dynamically-built strings later in this module.

> **Key idea:** Sass's built-in functions live in namespaced \`sass:\` modules you load with \`@use\` — \`math.div\` replaced \`/\` for division because CSS itself now overloads \`/\` as a separator, and \`color.adjust\`/\`color.scale\`/\`color.mix\` remain the most convenient way to compute colors that are fixed at build time, even though native \`color-mix()\` and relative color syntax have closed the gap for colors that need to be derived from a runtime custom property.`,
    },
    {
      name: "Writing Custom Functions",
      minutes: 11,
      intro: "Write your own reusable value-producing logic with @function and @return, and understand exactly how a function differs from a mixin.",
      content: `## @function: logic that returns a value

Every built-in function you used in the last lesson — \`math.div\`, \`color.adjust\`, \`list.nth\` — takes some input and **returns a value**. Sass lets you write your own with the same shape, using \`@function\`:

\`\`\`scss
@function double($n) {
  @return $n * 2;
}

.box {
  width: double(50px); // 100px
}
\`\`\`

The two pieces that define a function:

- \`@function name($args) { ... }\` — declares the function and its parameters, exactly like a mixin declaration but with the \`@function\` keyword.
- \`@return\` — the value the function produces. Execution stops at the first \`@return\` reached, just like \`return\` in most programming languages.

A function is called like any other value producer — by writing its name and parentheses — and the result can be used **anywhere a value is expected**: a property value, an argument to another function, a variable assignment, a condition.

## A practical example: px to rem

One of the most common custom Sass functions in real projects converts a fixed pixel value to \`rem\`, relative to a base font size:

\`\`\`scss
@use "sass:math";

$base-font-size: 16px;

@function rem($px) {
  @return math.div($px, $base-font-size) * 1rem;
}
\`\`\`

Using it:

\`\`\`scss
.card {
  padding: rem(24px);    // 1.5rem
  font-size: rem(18px);  // 1.125rem
  border-radius: rem(4px); // 0.25rem
}
\`\`\`

Compiled output:

\`\`\`css
.card {
  padding: 1.5rem;
  font-size: 1.125rem;
  border-radius: 0.25rem;
}
\`\`\`

Notice what this buys you: every call site expresses **intent in pixels** (which is how most design tools and specs communicate measurements) while the compiled CSS uses \`rem\` (which respects the user's root font-size setting for accessibility). Without the function, you'd either hand-calculate every value or hardcode \`rem\` values that are hard to eyeball against a design spec.

### A second example: a spacing scale function

Design systems typically define spacing as multiples of a base unit rather than arbitrary pixel values. A function makes that scale queryable by step number instead of by raw value:

\`\`\`scss
@use "sass:math";

$spacing-unit: 8px;

@function spacing($step) {
  @return $spacing-unit * $step;
}
\`\`\`

\`\`\`scss
.stack > * + * {
  margin-top: spacing(2); // 16px
}

.card {
  padding: spacing(3);      // 24px
  gap: spacing(1);          // 8px
}

.section {
  margin-bottom: spacing(6); // 48px
}
\`\`\`

This reads far better at the call site than scattered magic numbers like \`16px\`, \`24px\`, \`48px\` — \`spacing(6)\` tells the next reader "six steps on the spacing scale," and if the design system's base unit ever changes from \`8px\` to \`4px\`, exactly one line changes.

### Default parameter values and validation

Functions accept default values and keyword arguments exactly like mixins do:

\`\`\`scss
@use "sass:math";

@function rem($px, $base: 16px) {
  @return math.div($px, $base) * 1rem;
}

// Uses the default 16px base:
$a: rem(24px);

// Overrides the base for a component with a different root size:
$b: rem(24px, $base: 20px);
\`\`\`

It's also common to guard a function against bad input using \`@if\` and \`@error\` (covered fully in the control-flow module, but worth previewing here since it's a natural fit for functions):

\`\`\`scss
@function spacing($step) {
  @if $step < 0 {
    @error "spacing() expects a non-negative step, got #{$step}.";
  }
  @return $spacing-unit * $step;
}
\`\`\`

Failing fast with a clear \`@error\` message at compile time is far friendlier than shipping a broken \`margin-top: -24px\` and debugging it visually later.

## Function vs mixin: the distinction that matters

Beginners frequently reach for a mixin when they need a function, or vice versa, because both start with an \`@\`-keyword, both take arguments, and both feel like "reusable style logic." The distinction is precise and worth memorizing:

| | \`@function\` | \`@mixin\` |
|---|---|---|
| Produces | A single **value** | Zero or more CSS **declarations/rules** |
| Called with | Bare function-call syntax: \`spacing(2)\` | \`@include name(...)\` |
| Used in | A value position — right-hand side of a property, inside an expression | A rule body — anywhere declarations or nested rules can appear |
| Must contain | At least one \`@return\` | No \`@return\` — instead outputs \`property: value;\` pairs directly |
| Typical example | \`rem(24px)\`, \`spacing(3)\`, a color computation | \`@include flex-center;\`, \`@include respond-to(md) { ... }\` |

Concretely:

\`\`\`scss
// Function: returns ONE value, used inside a property.
@function rem($px) {
  @return math.div($px, 16px) * 1rem;
}

// Mixin: emits actual style declarations.
@mixin card-shadow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.card {
  padding: rem(24px);   // function used as a value
  @include card-shadow; // mixin included as a set of declarations
}
\`\`\`

A useful mental shortcut: if what you're writing computes to a **single CSS value** (a length, a color, a number, a string), it's a function. If what you're writing produces **one or more property: value pairs** (or entire nested rules), it's a mixin. Trying to \`@include\` a function, or trying to use a mixin's name as if it returned a value, is a compile error — Sass enforces the distinction strictly, which is a good thing: it keeps the two concerns from blurring together as a codebase grows.

> **Key idea:** \`@function\` plus \`@return\` lets you package computation — like a px-to-rem converter or a spacing-scale lookup — into a reusable, named value producer; the hard rule that separates it from a mixin is that a function always returns exactly one value for use in a value position, while a mixin always emits style declarations for use in a rule body.`,
    },
    {
      name: "Interpolation with #{}",
      minutes: 10,
      intro: "Use #{} to drop a Sass expression into a selector, property name, or value wherever plain Sass syntax can't go.",
      content: `## The problem interpolation solves

Sass variables and expressions work naturally in most places you'd want them — the right-hand side of a property declaration, a function argument, a condition. But there are several places in a stylesheet where **plain Sass syntax simply isn't valid**, because that position expects a literal CSS identifier, not an expression:

\`\`\`scss
$side: left;

// This does NOT work — Sass can't parse a variable as part of a property name:
.box {
  border-$side: 1px solid red; // syntax error
}
\`\`\`

\`\`\`scss
$prefix: btn;

// This does NOT work either — a variable can't be pasted into a selector:
.$prefix-primary { // syntax error
  color: white;
}
\`\`\`

**Interpolation** — wrapping an expression in \`#{ }\` — is the escape hatch. It tells Sass "evaluate this expression and splice the resulting text in here, as literal characters," which works in selectors, property names, values, and even inside strings.

## Interpolation in a property name

\`\`\`scss
$side: left;

.box {
  border-#{$side}: 1px solid red;
}
\`\`\`

compiles to:

\`\`\`css
.box {
  border-left: 1px solid red;
}
\`\`\`

This is genuinely the only way to build a dynamic property name in Sass — there's no other syntax for it. It's most useful inside a mixin that needs to target a directional property based on an argument:

\`\`\`scss
@mixin margin-side($side, $value) {
  margin-#{$side}: $value;
}

.sidebar {
  @include margin-side(right, 24px);
}
\`\`\`

## Interpolation in a selector

\`\`\`scss
$component: btn;

.#{$component} {
  padding: 8px 16px;

  &.#{$component}--primary {
    background: blue;
  }
}
\`\`\`

compiles to:

\`\`\`css
.btn {
  padding: 8px 16px;
}
.btn.btn--primary {
  background: blue;
}
\`\`\`

This is how you build BEM-style modifier and element class names programmatically inside a mixin, rather than hardcoding every variant by hand:

\`\`\`scss
@mixin variant($name) {
  &--#{$name} {
    @content;
  }
}

.alert {
  @include variant(danger) {
    background: crimson;
  }
  @include variant(success) {
    background: seagreen;
  }
}
\`\`\`

## Interpolation in a value or string

Interpolation also works inside property values and quoted strings, which is handy for building up things like \`url()\` paths, \`content\` strings, or CSS custom property names:

\`\`\`scss
$icon-name: chevron;
$version: 3;

.icon {
  background-image: url("icons/#{$icon-name}.svg");
}

.badge::after {
  content: "v#{$version}";
}
\`\`\`

compiles to:

\`\`\`css
.icon {
  background-image: url("icons/chevron.svg");
}
.badge::after {
  content: "v3";
}
\`\`\`

### When you don't need it

It's worth being precise about where interpolation is required versus where it's just unnecessary noise. In a normal value position, a variable works fine on its own:

\`\`\`scss
$radius: 4px;

.card {
  border-radius: $radius;       // correct — no #{} needed
  border-radius: #{$radius};    // also works, but the #{} is pointless here
}
\`\`\`

Reach for \`#{}\` only where plain Sass syntax is rejected: selectors, property names, and inside strings/URLs where you need to mix literal text with a computed piece. Sprinkling interpolation everywhere "just in case" makes code harder to read for no benefit.

## A practical example: generating numbered utility classes

Interpolation becomes especially powerful once combined with a loop — the next module covers \`@each\` and \`@for\` in full, but here's a preview to show why interpolation matters for that use case. Imagine generating a set of spacing utility classes, numbered 1 through 5, without writing each one by hand:

\`\`\`scss
@use "sass:math";

$spacing-unit: 8px;

@for $i from 1 through 5 {
  .mt-#{$i} {
    margin-top: $spacing-unit * $i;
  }
}
\`\`\`

compiles to:

\`\`\`css
.mt-1 {
  margin-top: 8px;
}
.mt-2 {
  margin-top: 16px;
}
.mt-3 {
  margin-top: 24px;
}
.mt-4 {
  margin-top: 32px;
}
.mt-5 {
  margin-top: 40px;
}
\`\`\`

Here, \`#{$i}\` is doing the same job as in every earlier example — splicing a computed value (the current loop index) into a selector, where plain Sass syntax can't go — but repeated across an iteration, it turns five lines of intent into a whole numbered utility scale. This pattern (loop plus interpolated selector) is exactly how small hand-rolled "utility-first" class sets, and larger frameworks that generate scales of classes, are built under the hood. You'll write the loop side of this properly in the next module; for now, the important part is recognizing that interpolation is what makes the generated class name possible at all.

### Interpolation vs a native CSS approach

It's worth noting what native CSS can and can't do here. Native CSS has no mechanism to generate a *family* of selectors like \`.mt-1\` through \`.mt-5\` from a loop — there is no looping construct in CSS itself. The closest native tool, custom properties combined with \`calc()\`, lets a *single* rule scale a value dynamically (\`margin-top: calc(var(--step) * 8px)\`), but it still requires \`--step\` to be set per element, and it can't invent new class names. Generating a whole numbered set of classes at build time, ahead of use, is squarely in Sass's territory — this is one of the clearest cases where a preprocessor still does something native CSS structurally cannot.

> **Key idea:** \`#{}\` interpolation splices an evaluated Sass expression into raw text wherever plain syntax is disallowed — selectors, property names, and inside strings — and it's the mechanism that makes loop-generated selectors (like a numbered utility class scale) possible, a capability native CSS still has no equivalent for.`,
    },
  ],
}
