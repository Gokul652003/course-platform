import type { Module } from "../types"

export const scssModule7: Module = {
  id: 7,
  title: "Control Directives & Loops",
  status: "upcoming",
  lessons: [
    {
      name: "@if / @else — Conditional Logic",
      minutes: 11,
      intro: "Branch on conditions inside Sass with @if, @else if, and @else, and learn the comparison and boolean operators that drive them.",
      content: `## Why Sass needs conditionals at all

Plain CSS has no way to say "if this variable is set to X, output these declarations, otherwise output those." **Custom properties** can be swapped at runtime via the cascade, and modern CSS has picked up conditional-ish tools like \`@media\`, \`@supports\`, and even a native \`if()\` function proposal — but none of that is the same as compile-time branching over arbitrary values, including your own custom data structures. Sass's \`@if\` / \`@else if\` / \`@else\` gives you that: a way to make a mixin or function produce genuinely different CSS depending on the arguments it receives, decided once, at build time, with zero runtime cost.

This matters most inside **mixins** and **functions**, where you often want one reusable block of logic to behave differently based on a flag, a theme name, or a computed value.

## Basic syntax

\`@if\` takes a Sass expression that evaluates to truthy or falsy. If it's truthy, the block runs; otherwise Sass checks the next \`@else if\`, and finally falls through to \`@else\` if none matched.

\`\`\`scss
@mixin badge-color($status) {
  @if $status == success {
    background: #16a34a;
    color: white;
  } @else if $status == warning {
    background: #f59e0b;
    color: #1f2937;
  } @else if $status == error {
    background: #dc2626;
    color: white;
  } @else {
    background: #6b7280;
    color: white;
  }
}

.badge--ok {
  @include badge-color(success);
}
\`\`\`

Compiles to:

\`\`\`css
.badge--ok {
  background: #16a34a;
  color: white;
}
\`\`\`

Note the exact formatting Sass requires: \`@else if\` and \`@else\` must appear on the **same line** as the closing brace of the previous branch (\`} @else if ... {\`), not on a new line. This is a common source of syntax errors for people coming from JavaScript or other languages where brace placement is more flexible.

### What counts as "falsy"

Sass treats exactly two values as falsy: \`false\` and \`null\`. Everything else — including \`0\`, empty strings, and empty lists — is truthy. This trips people up coming from JavaScript, where \`0\` and \`""\` are falsy. In Sass:

\`\`\`scss
@if 0 {
  // this DOES run — 0 is truthy in Sass
}
@if "" {
  // this DOES run — empty string is truthy
}
@if null {
  // this does NOT run
}
\`\`\`

If you want to check "is this variable unset," compare against \`null\` explicitly, or use the built-in \`not\` operator, rather than relying on truthiness the way you might in JS.

## Comparison operators

| Operator | Meaning | Works on |
|---|---|---|
| \`==\` | Equal | Any type |
| \`!=\` | Not equal | Any type |
| \`<\`, \`>\`, \`<=\`, \`>=\` | Less/greater than (or equal) | Numbers only |

\`\`\`scss
@mixin font-size-for($level) {
  @if $level >= 3 {
    font-size: 2rem;
  } @else if $level == 2 {
    font-size: 1.5rem;
  } @else {
    font-size: 1rem;
  }
}
\`\`\`

Sass numbers carry their **unit** as part of the value, so \`10px == 10\` is \`false\`, and comparing \`10px\` to \`1em\` with \`<\` throws an error — Sass won't guess whether \`px\` is bigger or smaller than \`em\`. Always compare like units, or strip units deliberately with division (covered in the functions module) when you need a unitless comparison.

## Boolean operators

Sass provides \`and\`, \`or\`, and \`not\` — written as words, not symbols (\`&&\`, \`||\`, \`!\` are not valid Sass syntax, unlike plain CSS's \`not\` inside \`@supports\`/\`@media\` which is unrelated).

\`\`\`scss
@mixin button-variant($size, $disabled) {
  @if $size == large and not $disabled {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  } @else if $size == large and $disabled {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    opacity: 0.5;
    cursor: not-allowed;
  } @else if not $disabled {
    padding: 0.5rem 1rem;
  } @else {
    padding: 0.5rem 1rem;
    opacity: 0.5;
    cursor: not-allowed;
  }
}
\`\`\`

You can combine several conditions and parenthesize for clarity exactly as you would in most programming languages:

\`\`\`scss
@if ($size == large or $size == xlarge) and not $disabled {
  // ...
}
\`\`\`

## A practical example: a theme-aware mixin with validation

A common real use of \`@if\` is a mixin that accepts a limited set of valid values and actively rejects anything else, rather than silently producing broken CSS. This is where \`@error\` comes in — it halts compilation immediately with a message, which is far more useful than shipping a stylesheet with a typo baked in.

\`\`\`scss
@mixin theme-surface($theme) {
  @if $theme == light {
    background: #ffffff;
    color: #111827;
    border: 1px solid #e5e7eb;
  } @else if $theme == dark {
    background: #111827;
    color: #f9fafb;
    border: 1px solid #374151;
  } @else if $theme == brand {
    background: #4f46e5;
    color: #ffffff;
    border: 1px solid #4338ca;
  } @else {
    @error "theme-surface: unknown theme '#{$theme}' — expected light, dark, or brand.";
  }
}

.card {
  @include theme-surface(dark);
}

// .card {
//   @include theme-surface(midnight); // fails the build immediately, with a clear message
// }
\`\`\`

Because \`@error\` stops compilation with a stack trace pointing at the offending \`@include\`, mistakes get caught at build time instead of shipping as silently-missing styles — the mixin simply produces nothing for an unrecognized \`$theme\` if you leave off the \`@error\` branch, which is far worse to debug. This "validate arguments, fail loud" pattern is worth adopting for any mixin whose argument set is a closed list of known-good values.

## @if vs plain CSS conditionals

It's worth being honest about overlap here. Native CSS has grown its own conditional-shaped tools, but they solve a different problem than Sass's \`@if\`:

| Tool | Decides based on | Evaluated |
|---|---|---|
| Sass \`@if\` | Any Sass value — arguments, variables, maps | Compile time, before any CSS ships |
| CSS \`@media\` | Runtime environment (viewport, preferences) | Runtime, in the browser |
| CSS \`@supports\` | Whether the browser supports a feature | Runtime, in the browser |
| CSS \`if()\` (newly proposed) | A CSS value/condition, similar to a ternary | Runtime, in the browser |

They're not competitors — \`@if\` decides **which CSS gets written at all**, while \`@media\`/\`@supports\`/\`if()\` decide **which of several already-shipped rules applies** in a given browser. A mixin frequently uses \`@if\` internally to decide *how* to write the \`@media\` query in the first place.

> **Key idea:** \`@if\`/\`@else if\`/\`@else\` branch at compile time over Sass values (with \`false\` and \`null\` as the only falsy values), giving mixins and functions the power to validate inputs and fail fast with \`@error\` — a capability with no real native-CSS equivalent, since browser-side conditionals like \`@media\` and \`@supports\` only choose between rules that already exist.`,
    },
    {
      name: "@each and @for — Loops",
      minutes: 12,
      intro: "Iterate over lists and maps with @each, and count through ranges with @for, to generate whole families of utility classes from a handful of lines.",
      content: `## Why loops matter in Sass

The single biggest practical win control directives give you over plain CSS is **generation**: writing one small block of logic once and having Sass expand it into dozens of concrete rules. Native CSS has no equivalent — every class you want has to be written out by hand (or generated by an external build tool, which is exactly the gap Sass fills natively). This lesson covers the two loop constructs you'll reach for constantly: \`@each\` for iterating over existing collections, and \`@for\` for counting through a numeric range.

## @each over a list

\`@each\` walks a **list**, binding each item to a variable in turn:

\`\`\`scss
$sizes: small, medium, large;

@each $size in $sizes {
  .btn--#{$size} {
    padding: if($size == small, 0.375rem 0.75rem, if($size == medium, 0.5rem 1rem, 0.75rem 1.5rem));
  }
}
\`\`\`

That nested \`if()\` is awkward — a cleaner pattern pairs \`@each\` with a **map** instead, which is by far the more common real-world usage.

## @each over a map

When you \`@each\` over a map, you destructure each entry into a **key** and a **value** in one step:

\`\`\`scss
$button-sizes: (
  small: (padding: 0.375rem 0.75rem, font-size: 0.75rem),
  medium: (padding: 0.5rem 1rem, font-size: 0.875rem),
  large: (padding: 0.75rem 1.5rem, font-size: 1rem),
);

@each $name, $props in $button-sizes {
  .btn--#{$name} {
    padding: map-get($props, padding);
    font-size: map-get($props, font-size);
  }
}
\`\`\`

Compiles to:

\`\`\`css
.btn--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}
.btn--medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
.btn--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
\`\`\`

Three class definitions from four lines of loop body — and adding a fourth size later means editing the map, not hand-writing a fourth rule.

## Practical example: brand color utility classes

This is one of the most common real jobs \`@each\` does in production Sass codebases — turning a single source-of-truth color map into a full set of utility classes:

\`\`\`scss
$brand-colors: (
  primary: #4f46e5,
  secondary: #64748b,
  success: #16a34a,
  warning: #f59e0b,
  danger: #dc2626,
);

@each $name, $color in $brand-colors {
  .text-#{$name} {
    color: $color;
  }
  .bg-#{$name} {
    background-color: $color;
  }
  .border-#{$name} {
    border-color: $color;
  }
}
\`\`\`

Five map entries expand into fifteen classes (\`.text-primary\`, \`.bg-primary\`, \`.border-primary\`, \`.text-secondary\`, ...). Add a sixth brand color to the map and you get three more classes for free, with the naming convention guaranteed consistent because it's generated, not retyped.

## @for — counting through a range

\`@for\` counts a variable through a numeric range and runs its body once per number. It comes in two forms that differ in exactly one word, and mixing them up is the single most common \`@for\` bug:

| Form | Range | Example |
|---|---|---|
| \`@for $i from 1 through 5\` | **Inclusive** — includes 5 | Runs for 1, 2, 3, 4, 5 |
| \`@for $i from 1 to 5\` | **Exclusive** — stops before 5 | Runs for 1, 2, 3, 4 |

\`\`\`scss
@for $i from 1 through 3 {
  .col-#{$i} { width: percentage($i / 3); }
}
// generates .col-1, .col-2, .col-3

@for $i from 1 to 3 {
  .row-#{$i} { order: $i; }
}
// generates .row-1, .row-2 only — 3 is excluded
\`\`\`

If your generated set is coming up one short (or one too many), check whether you meant \`through\` and typed \`to\`, or vice versa — this is worth internalizing precisely because the two keywords look so similar at a glance.

## Practical example: a spacing utility scale

Generating a Tailwind-style spacing scale is a canonical \`@for\` use case — one rule of arithmetic, expanded into a full set of classes:

\`\`\`scss
$spacer: 0.25rem;

@for $i from 1 through 10 {
  .mt-#{$i} {
    margin-top: $spacer * $i;
  }
  .mb-#{$i} {
    margin-bottom: $spacer * $i;
  }
  .p-#{$i} {
    padding: $spacer * $i;
  }
}
\`\`\`

This produces \`.mt-1\` through \`.mt-10\` (0.25rem through 2.5rem in quarter-rem steps), plus the matching \`.mb-*\` and \`.p-*\` sets — thirty rules from six lines. Changing \`$spacer\` to \`0.2rem\` rescales every generated class in one edit, which is precisely the kind of systemic control that hand-written CSS can't offer without a find-and-replace across the whole file.

## Choosing between @each and @for

| | \`@each\` | \`@for\` |
|---|---|---|
| Iterates over | An existing list or map | A numeric range you specify |
| Best for | Named things: colors, breakpoints, themes | Counted things: scales, grid columns, indexed variants |
| Naming source | Comes from the collection's keys/items | You build the name from the counter, e.g. \`#{$i}\` |
| Adding an entry | Edit the map/list | Change the range bounds |

In practice these are often combined — a \`@for\` loop generating a range of numbers that's then used to build a map, or an \`@each\` loop over a map whose values were themselves built by an earlier \`@for\`. Neither is "better"; they answer different questions: "for each of these named things" versus "for each number in this range."

> **Key idea:** \`@each\` (list or map) and \`@for\` (numeric range, inclusive \`through\` vs exclusive \`to\`) turn a handful of lines into dozens of generated rules, which is the sharpest advantage compile-time Sass still holds over native CSS — there's no browser-side equivalent for "generate N classes from one pattern."`,
    },
    {
      name: "@while & Real-World Loop Patterns",
      minutes: 12,
      intro: "Cover Sass's least-used loop, then combine everything into one design-token-driven utility generator, and learn how to debug Sass logic with @debug, @warn, and @error.",
      content: `## @while — the loop you'll rarely reach for

Sass also has a \`@while\` loop, which repeats its body as long as a condition stays truthy. It's the most general of the three loop constructs — and the least used in practice, because \`@each\` and \`@for\` cover the vast majority of real generation tasks more safely and more readably. It's still worth knowing completely, because occasionally a loop's step size or exit condition isn't a clean linear count, and \`@while\` is the only tool flexible enough for that.

\`\`\`scss
$i: 1;
$max: 5;

@while $i <= $max {
  .scale-#{$i} {
    transform: scale(1 + $i * 0.1);
  }
  $i: $i + 1;
}
\`\`\`

This generates \`.scale-1\` through \`.scale-5\`, functionally identical to what \`@for $i from 1 through 5\` would produce more simply — which is exactly the point: **prefer \`@for\` whenever the loop is a straightforward numeric count**, and reach for \`@while\` only when the termination condition or step isn't a plain \`+1\` counter (for example, doubling a value each iteration, or stopping once a running total crosses a threshold).

### The critical warning: you must update the loop variable yourself

Unlike \`@for\`, which manages its own counter, \`@while\` will run forever unless *you* explicitly change the condition variable inside the loop body. Forgetting the \`$i: $i + 1;\` line above — or writing it wrong so the condition never becomes false — causes Sass's compiler to loop indefinitely, hanging your build (or crashing it once Sass's internal call-stack or iteration limit is hit). This is the one real hazard of \`@while\`, and it's the main reason it isn't the default loop construct:

\`\`\`scss
// DANGER — infinite compilation loop, $i is never modified:
$i: 1;
@while $i <= 5 {
  .broken-#{$i} { opacity: 0.1; }
  // missing: $i: $i + 1;
}
\`\`\`

Always double-check, before shipping a \`@while\` loop, that every code path through the body moves the condition toward becoming false. If you're not confident you can guarantee that, it's a strong signal you actually want \`@for\` or \`@each\` instead.

## A larger worked example: a full token-driven utility set

Real Sass codebases often keep a single map as the **source of truth** for a design token category, then generate every related utility class from it with one \`@each\` loop plus string interpolation. Here's a complete example generating both text-color and background-color utilities from one shared color map — the same pattern scales to spacing, border-radius, shadows, or any other token category:

\`\`\`scss
$colors: (
  slate: #64748b,
  indigo: #4f46e5,
  emerald: #059669,
  amber: #d97706,
  rose: #e11d48,
);

@each $name, $value in $colors {
  .text-#{$name} {
    color: #{$value};
  }
  .bg-#{$name} {
    background-color: #{$value};
  }
  .bg-#{$name}-soft {
    background-color: rgba($value, 0.12);
    color: $value;
  }
  .border-#{$name} {
    border: 1px solid #{$value};
  }
}
\`\`\`

Compiles to a complete, consistent utility set — twenty classes from one map and one loop:

\`\`\`css
.text-slate { color: #64748b; }
.bg-slate { background-color: #64748b; }
.bg-slate-soft { background-color: rgba(100, 116, 139, 0.12); color: #64748b; }
.border-slate { border: 1px solid #64748b; }
/* ...repeated for indigo, emerald, amber, rose */
\`\`\`

Notice the \`.bg-#{$name}-soft\` variant: because \`$value\` is a real Sass color, you can pass it straight into \`rgba()\` to derive a translucent tint, generated automatically for every color in the map — no separate "soft" map needed. This is the compounding benefit of token-driven generation: richer variants (tints, shades, hover states) can be *derived* from the same five source colors instead of hand-authored five more times each.

### Where native CSS narrows this gap — and where it doesn't

Modern CSS custom properties plus \`color-mix()\` can now express a fair amount of this at runtime — a single \`--brand-slate: #64748b\` custom property combined with \`color-mix(in srgb, var(--brand-slate) 12%, transparent)\` gets you a comparable soft tint, computed in the browser instead of at build time. That's a genuine, welcome overlap. What native CSS still can't do is the **generation step itself**: nothing in the CSS spec lets you say "for every entry in this collection, emit a class named after it." \`color-mix()\` transforms one value you already have a selector for; \`@each\` conjures the selectors themselves. For a fixed, small palette the runtime approach is often simpler and avoids a build step entirely — but the moment you want the class names to exist as classes (for use in markup, frameworks, or utility-class ecosystems), you're back to needing compile-time generation, which remains Sass's territory alone among widely-used CSS tooling.

## Debugging Sass logic: @debug, @warn, and @error

Loops and conditionals are where Sass bugs like to hide, because the generated CSS is often the only visible output — and by the time you're looking at compiled CSS, the loop that produced it is gone. Three directives exist specifically to make Sass's own execution visible while you're developing:

| Directive | Purpose | Compilation continues? |
|---|---|---|
| \`@debug\` | Print a value to the console, for inspecting what a variable/expression actually holds | Yes |
| \`@warn\` | Print a warning to the console, typically for deprecated mixin usage or risky input | Yes |
| \`@error\` | Print an error and halt compilation immediately | No — build fails |

\`\`\`scss
@mixin spacing($multiplier) {
  @debug "spacing called with multiplier: #{$multiplier}";

  @if $multiplier < 0 {
    @error "spacing: multiplier must be non-negative, got #{$multiplier}.";
  }

  @if $multiplier > 20 {
    @warn "spacing: multiplier #{$multiplier} is unusually large — did you mean to divide by 10?";
  }

  margin: 0.25rem * $multiplier;
}
\`\`\`

\`@debug\` is your everyday tool while writing or troubleshooting a loop — drop one inside the loop body to confirm each iteration is producing the value you expect before you trust the generated CSS. \`@warn\` is for softer problems: something that isn't wrong enough to stop the build but that a caller should probably know about (a deprecated mixin, an argument combination that works but isn't recommended). \`@error\` is reserved for genuinely invalid input, exactly as in the theme-validation example from the first lesson — anything that would otherwise silently produce broken or meaningless CSS.

All three print to the terminal/build output, never into the compiled CSS itself, so they're free to leave in place during development and strip out (or leave — \`@debug\`/\`@warn\` cost nothing in the final stylesheet) once things are working.

> **Key idea:** \`@while\` is the general-purpose loop of last resort — powerful but requiring a manually-updated, guaranteed-to-terminate condition — while \`@each\` over a shared token map remains the workhorse pattern for generating whole utility sets in one pass; \`@debug\`/\`@warn\`/\`@error\` are how you see and guard that generation logic while you build it.`,
    },
  ],
}
