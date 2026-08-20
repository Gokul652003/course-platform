import type { Module } from "../types"

export const scssModule8: Module = {
  id: 8,
  title: "Maps & Lists",
  status: "upcoming",
  lessons: [
    {
      name: "Sass Lists",
      minutes: 12,
      intro: "Learn how Sass lists are declared, iterated, and manipulated with the sass:list module — including the 1-indexed gotcha that trips everyone up once.",
      content: `## What a Sass list actually is

A **list** in Sass is an ordered sequence of values. That's a familiar idea from almost every programming language, but Sass lists have a couple of quirks worth internalizing early: they can be separated by commas *or* spaces, they can be nested, and — unlike almost every other language you've used — they are **1-indexed**, not 0-indexed. That last point causes more early bugs than anything else in this module, so it gets its own section below.

Lists show up constantly in real Sass code, often without you deliberately "declaring" one — \`font-family: Helvetica, Arial, sans-serif;\` is a comma-separated list, and \`margin: 0 auto 1rem;\` is a space-separated list. Sass just gives you tools to build, inspect, and transform lists like these programmatically.

## Declaring lists

You can separate list items with commas or with spaces. Both are valid, and the separator you choose becomes part of the list's identity (Sass tracks it internally):

\`\`\`scss
// Comma-separated
$brand-fonts: "Inter", "Helvetica Neue", sans-serif;

// Space-separated
$card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

// A list of "bare" identifiers — common for things like breakpoint names
$breakpoint-names: small, medium, large, xlarge;
\`\`\`

If you need a list where the separator itself matters — say, you want a space-separated list nested inside a comma-separated one — wrap the inner list in parentheses:

\`\`\`scss
$grid-areas: (header header) (sidebar content) (footer footer);
\`\`\`

That's a comma-separated list of three space-separated sub-lists — a nested list, discussed more below.

### Single-item lists

A single value is technically a list of length 1 in Sass — most list functions treat a lone value as if it were wrapped in a one-item list. This matters because some functions (like \`list.join\`) accept either a list or a single value interchangeably, so you rarely need to special-case "just one item."

## Nested lists

Because list items can themselves be lists, you can build small two-dimensional structures without reaching for a map. A common real pattern is pairing related values — like a breakpoint name with its pixel width:

\`\`\`scss
$breakpoints: (small 480px), (medium 768px), (large 1024px), (xlarge 1280px);
\`\`\`

This is a comma-separated list of four space-separated 2-item lists. You'll see this pattern again in the next lesson, reshaped as a **map** — maps are usually the better tool once your data has clear "key" and "value" roles, but plain nested lists are still common for lightweight, ordered pairings like this.

## List functions (the \`sass:list\` module)

All of these live in the built-in \`sass:list\` module, so you load it with \`@use "sass:list";\` at the top of the file and call functions as \`list.<name>(...)\`.

| Function | What it does | Example |
|---|---|---|
| \`list.length($list)\` | Number of items in the list | \`list.length(1px 2px 3px)\` -> \`3\` |
| \`list.nth($list, $n)\` | Item at position \`$n\` — **1-indexed** | \`list.nth(1px 2px 3px, 1)\` -> \`1px\` |
| \`list.append($list, $val)\` | Returns a new list with \`$val\` added at the end | \`list.append(1px 2px, 3px)\` -> \`1px 2px 3px\` |
| \`list.index($list, $val)\` | Position of \`$val\` in the list, or \`null\` if absent | \`list.index(a b c, b)\` -> \`2\` |
| \`list.join($list1, $list2)\` | Concatenates two lists into one | \`list.join(1px 2px, 3px 4px)\` -> \`1px 2px 3px 4px\` |
| \`list.separator($list)\` | Returns \`comma\`, \`space\`, or \`slash\` | \`list.separator(1px, 2px)\` -> \`comma\` |
| \`list.is-bracketed($list)\` | Whether the list uses \`[...]\` bracket syntax | \`list.is-bracketed([1px, 2px])\` -> \`true\` |

\`\`\`scss
@use "sass:list";

$sizes: 8px, 16px, 24px, 32px;

.debug {
  count: list.length($sizes);        // 4
  first: list.nth($sizes, 1);        // 8px
  last: list.nth($sizes, -1);        // 32px — negative indices count from the end
}
\`\`\`

### The 1-indexed gotcha, explained clearly

This is the single most common Sass list bug, so read it twice. Every mainstream language you've probably used — JavaScript, Python, C, Java, Rust — indexes arrays/lists starting at \`0\`. The first element is index \`0\`, the second is index \`1\`, and so on. **Sass does not do this.** In Sass, \`list.nth($list, 1)\` returns the *first* item, not the second:

\`\`\`scss
@use "sass:list";

$colors: red, green, blue;

$first: list.nth($colors, 1);  // red   (NOT green — this is the first item)
$last: list.nth($colors, 3);   // blue
// list.nth($colors, 0) is an ERROR — 0 is not a valid Sass list index
\`\`\`

If you're porting a loop from a language that's 0-indexed, or writing a generic \`@for $i from 0 to list.length($list)\` loop out of habit, you will either get an off-by-one error or an outright crash on \`list.nth($list, 0)\`. The safe pattern for iterating by index is \`@for $i from 1 through list.length($list)\`, using \`through\` (inclusive) rather than \`to\` (exclusive) so the loop naturally covers every valid 1-based index:

\`\`\`scss
@use "sass:list";

$sizes: 8px, 16px, 24px;

@for $i from 1 through list.length($sizes) {
  .size-#{$i} {
    padding: list.nth($sizes, $i);
  }
}
\`\`\`

Negative indices are the one place Sass borrows a more familiar convention: \`-1\` means "last item," \`-2\` means "second to last," and so on — handy for grabbing the tail of a list without computing its length first.

## Iterating a list with \`@each\`

The previous module covered \`@each\` for maps; the same directive works directly on lists, and it's usually cleaner than an indexed \`@for\` loop when you don't actually need the position:

\`\`\`scss
$breakpoint-names: small, medium, large, xlarge;

@each $name in $breakpoint-names {
  .hide-on-#{$name} {
    // ...
  }
}
\`\`\`

\`@each\` also destructures nested 2-item lists directly into two loop variables, which is exactly the shape of the breakpoint pairs from earlier:

\`\`\`scss
$breakpoints: (small 480px), (medium 768px), (large 1024px);

@each $name, $width in $breakpoints {
  .container-#{$name} {
    max-width: $width;
  }
}
\`\`\`

That destructuring form — \`@each $a, $b in $list-of-pairs\` — is one of the more elegant corners of Sass and worth remembering; it avoids a manual \`list.nth($pair, 1)\` / \`list.nth($pair, 2)\` dance entirely.

## Practical example: generating breakpoint mixins from a list

Here's a realistic use case that ties lists directly to something you'll reach for constantly: a small set of named breakpoints, used to generate a matching set of media-query mixins.

\`\`\`scss
@use "sass:list";
@use "sass:map";

$breakpoint-names: small, medium, large, xlarge;
$breakpoint-widths: 480px, 768px, 1024px, 1280px;

@mixin respond-above($name) {
  $index: list.index($breakpoint-names, $name);

  @if $index == null {
    @error "Unknown breakpoint '#{$name}'. Expected one of: #{$breakpoint-names}.";
  }

  $width: list.nth($breakpoint-widths, $index);

  @media (min-width: $width) {
    @content;
  }
}
\`\`\`

Usage at a call site:

\`\`\`scss
.sidebar {
  display: none;

  @include respond-above(medium) {
    display: block;
  }
}
\`\`\`

\`\`\`css
.sidebar {
  display: none;
}
@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
}
\`\`\`

Note the \`@error\` guard: because \`list.index\` returns \`null\` when the value isn't found, calling \`respond-above(mediumm)\` (typo) fails loudly at compile time instead of silently producing broken CSS — a small but genuinely valuable safety net that plain CSS custom properties can't give you, since there's no compile step to catch a mistyped value.

This two-list approach works, but keeping breakpoint names and widths in sync across two separate lists is fragile — add one to \`$breakpoint-names\` and forget the matching entry in \`$breakpoint-widths\`, and \`list.nth\` will silently pull the wrong width. That fragility is exactly the motivation for the next lesson: a **map** lets you pair a name directly with its value in one structure, with no positional bookkeeping required.

> **Key idea:** Sass lists are comma- or space-separated, can nest, and are 1-indexed with \`list.nth\` — always loop with \`@for $i from 1 through list.length($list)\` (not \`from 0\`), and prefer \`@each\` with destructuring over manual indexing whenever you don't need the position itself.`,
    },
    {
      name: "Sass Maps",
      minutes: 13,
      intro: "Move from parallel lists to real key-value structures with sass:map — including nested maps for structured design tokens.",
      content: `## From lists to maps

The breakpoint example at the end of the last lesson exposed a real problem: two parallel lists (names, widths) that have to stay in sync by position alone. A **map** fixes that by pairing each key directly with its value, so there's no positional bookkeeping and no risk of the lists drifting out of alignment.

## Declaring a map

A Sass map is written as a comma-separated list of \`key: value\` pairs, wrapped in parentheses:

\`\`\`scss
$breakpoints: (
  "small": 480px,
  "medium": 768px,
  "large": 1024px,
  "xlarge": 1280px,
);
\`\`\`

A few conventions worth adopting from the start:
- Keys are usually quoted strings (\`"small"\`), though unquoted identifiers work too — quoting avoids ambiguity if a key ever needs to be something like a number or a value with special characters.
- The trailing comma after the last pair is optional but idiomatic — it keeps future diffs clean when someone adds a new entry.
- Maps are almost always written multi-line, one pair per line, once they have more than two or three entries — a single-line map with many keys is hard to scan and harder to diff in code review.

## Map functions (the \`sass:map\` module)

Load these with \`@use "sass:map";\`, same pattern as \`sass:list\`.

| Function | What it does | Example |
|---|---|---|
| \`map.get($map, $key)\` | Value for \`$key\`, or \`null\` if absent | \`map.get($breakpoints, "medium")\` -> \`768px\` |
| \`map.keys($map)\` | All keys, as a comma-separated list | \`map.keys($breakpoints)\` -> \`"small", "medium", ...\` |
| \`map.values($map)\` | All values, as a comma-separated list | \`map.values($breakpoints)\` -> \`480px, 768px, ...\` |
| \`map.merge($map1, $map2)\` | New map combining both — \`$map2\`'s keys win on conflict | \`map.merge($base, $overrides)\` |
| \`map.has-key($map, $key)\` | Whether \`$key\` exists in the map | \`map.has-key($breakpoints, "xxl")\` -> \`false\` |
| \`map.remove($map, $key)\` | New map with \`$key\` removed | \`map.remove($breakpoints, "small")\` |
| \`map.set($map, $key, $val)\` | New map with \`$key\` set to \`$val\` (added or overwritten) | \`map.set($breakpoints, "xxl", 1536px)\` |

Every one of these is **non-mutating** — they all return a new map rather than modifying the original in place, consistent with Sass values generally being immutable. If you want to "update" a map variable, you reassign it:

\`\`\`scss
@use "sass:map";

$colors: ("primary": blue, "secondary": gray);
$colors: map.set($colors, "danger", red); // reassign to "add" a key
\`\`\`

### Using \`map.get\` safely

\`map.get\` returns \`null\` for a missing key rather than erroring, which is convenient but also means a typo silently produces \`null\` instead of a compile failure — that \`null\` then usually surfaces later as an obviously-broken CSS declaration, which is harder to trace back to its source. It's a common and worthwhile pattern to wrap lookups in a small function that fails loudly instead:

\`\`\`scss
@use "sass:map";

@function color($key) {
  @if not map.has-key($colors, $key) {
    @error "Unknown color key '#{$key}'. Available: #{map.keys($colors)}.";
  }
  @return map.get($colors, $key);
}
\`\`\`

Now \`color("primry")\` (typo) fails at compile time with a helpful message, instead of quietly emitting \`color: null;\` — or worse, being silently dropped from the compiled CSS entirely, since Sass omits declarations whose value is \`null\`.

## Nested maps for structured design tokens

Map values can themselves be maps, which is exactly what you want once a single token needs more than one dimension — the classic example is a brand color that needs multiple **shades**:

\`\`\`scss
$colors: (
  "brand": (
    "50": #eff6ff,
    "100": #dbeafe,
    "500": #3b82f6,
    "700": #1d4ed8,
    "900": #1e3a8a,
  ),
  "gray": (
    "50": #f9fafb,
    "500": #6b7280,
    "900": #111827,
  ),
);
\`\`\`

Reading a nested value chains two \`map.get\` calls — get the inner map first, then get the shade from it:

\`\`\`scss
@use "sass:map";

.button-primary {
  background: map.get(map.get($colors, "brand"), "500");
  border-color: map.get(map.get($colors, "brand"), "700");
}
\`\`\`

That nested-call syntax gets noisy fast, so it's worth writing a small helper function once and reusing it everywhere:

\`\`\`scss
@use "sass:map";

@function color($group, $shade) {
  $group-map: map.get($colors, $group);

  @if $group-map == null {
    @error "Unknown color group '#{$group}'.";
  }

  $value: map.get($group-map, $shade);

  @if $value == null {
    @error "Unknown shade '#{$shade}' in group '#{$group}'.";
  }

  @return $value;
}
\`\`\`

\`\`\`scss
.button-primary {
  background: color("brand", "500");
  border-color: color("brand", "700");
}
\`\`\`

This is the pattern real design systems converge on: a nested map holding the raw data, plus one thin accessor function that both simplifies the call site and centralizes error handling.

## Practical example: a full spacing map used throughout a project

Spacing is one of the highest-value places to centralize as a map, because a spacing scale gets referenced everywhere — margin, padding, gap, position offsets — and drift between components is one of the fastest ways a design starts to look inconsistent.

\`\`\`scss
@use "sass:map";

$spacing: (
  "0": 0,
  "1": 0.25rem,
  "2": 0.5rem,
  "3": 0.75rem,
  "4": 1rem,
  "6": 1.5rem,
  "8": 2rem,
  "12": 3rem,
  "16": 4rem,
);

@function space($key) {
  @if not map.has-key($spacing, $key) {
    @error "Unknown spacing key '#{$key}'. Available: #{map.keys($spacing)}.";
  }
  @return map.get($spacing, $key);
}
\`\`\`

Used across completely unrelated components, all pulling from the same single source of truth:

\`\`\`scss
.card {
  padding: space("6");
  margin-bottom: space("4");
}

.button {
  padding: space("2") space("4");
}

.stack > * + * {
  margin-top: space("3");
}
\`\`\`

Change \`"6": 1.5rem\` to \`"6": 1.75rem\` in one place, recompile, and every component that referenced \`space("6")\` updates together — the exact same "single source of truth" benefit a \`--spacing-6\` custom property gives you, except this version can also be iterated over, validated, and used inside real computation at compile time, which is where the next lesson picks up.

> **Key idea:** Maps pair keys directly with values, removing the positional-alignment risk that parallel lists carry — nest maps for multi-dimensional tokens like color shades, and wrap lookups in a small accessor function so a typo'd key fails loudly at compile time instead of quietly emitting \`null\`.`,
    },
    {
      name: "Maps as a Design Token System",
      minutes: 14,
      intro: "Build a complete design-token system out of Sass maps and generator mixins, then compare it honestly to CSS custom properties.",
      content: `## Building the token system

This lesson puts everything from the module together into one small, realistic design-token system: colors, spacing, breakpoints, and font sizes, each stored as a map, plus generator mixins/functions that read from them. This is close to the actual shape of the token layer in a lot of production Sass codebases.

### The tokens

\`\`\`scss
// _tokens.scss
$colors: (
  "brand": (
    "100": #dbeafe,
    "500": #3b82f6,
    "700": #1d4ed8,
  ),
  "gray": (
    "100": #f3f4f6,
    "500": #6b7280,
    "900": #111827,
  ),
  "danger": (
    "500": #ef4444,
  ),
);

$spacing: (
  "1": 0.25rem,
  "2": 0.5rem,
  "4": 1rem,
  "6": 1.5rem,
  "8": 2rem,
);

$breakpoints: (
  "sm": 480px,
  "md": 768px,
  "lg": 1024px,
  "xl": 1280px,
);

$font-sizes: (
  "sm": 0.875rem,
  "base": 1rem,
  "lg": 1.125rem,
  "xl": 1.25rem,
  "2xl": 1.5rem,
);
\`\`\`

### The accessor functions

\`\`\`scss
// _functions.scss
@use "sass:map";
@use "tokens" as t;

@function color($group, $shade: "500") {
  $group-map: map.get(t.$colors, $group);
  @if $group-map == null {
    @error "Unknown color group '#{$group}'.";
  }
  @return map.get($group-map, $shade);
}

@function space($key) {
  @if not map.has-key(t.$spacing, $key) {
    @error "Unknown spacing key '#{$key}'.";
  }
  @return map.get(t.$spacing, $key);
}

@function font-size($key) {
  @if not map.has-key(t.$font-sizes, $key) {
    @error "Unknown font-size key '#{$key}'.";
  }
  @return map.get(t.$font-sizes, $key);
}
\`\`\`

### The generator mixin

A single \`@mixin respond-above($breakpoint)\` reads from \`$breakpoints\` so every media query in the project stays consistent, exactly as built in the first lesson of this module — plus a generator that builds a whole set of spacing utility classes at once:

\`\`\`scss
// _mixins.scss
@use "sass:map";
@use "tokens" as t;

@mixin respond-above($name) {
  @if not map.has-key(t.$breakpoints, $name) {
    @error "Unknown breakpoint '#{$name}'.";
  }
  @media (min-width: map.get(t.$breakpoints, $name)) {
    @content;
  }
}

// Generates .p-1, .p-2, .p-4, ... and .m-1, .m-2, .m-4, ... from $spacing
@each $key, $value in t.$spacing {
  .p-#{$key} { padding: $value; }
  .m-#{$key} { margin: $value; }
}
\`\`\`

That \`@each\` loop is doing real work: it walks the entire \`$spacing\` map once and emits a matched pair of utility classes per entry, with zero repetition and zero risk of one class's value drifting from another's. Add a new key to \`$spacing\` and both a \`.p-*\` and \`.m-*\` class appear for it automatically, everywhere the stylesheet is compiled.

### Using the system

\`\`\`scss
@use "functions" as f;
@use "mixins" as m;

.card {
  background: f.color("gray", "100");
  border: 1px solid f.color("gray", "500");
  padding: f.space("4");
  font-size: f.font-size("lg");

  @include m.respond-above("md") {
    padding: f.space("6");
  }
}
\`\`\`

\`\`\`css
.card {
  background: #f3f4f6;
  border: 1px solid #6b7280;
  padding: 1rem;
  font-size: 1.125rem;
}
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}
\`\`\`

Every value in that compiled CSS traces back to exactly one map entry. Rename a shade, adjust a breakpoint, tweak the spacing scale — one edit in \`_tokens.scss\`, and the whole project recompiles consistently.

## Honest comparison: Sass maps vs CSS custom properties

Both solve "centralize a design value so it's defined once." They are not interchangeable, though, and picking the wrong one for the job causes real friction. Here's the comparison, without favoring either side:

| | Sass maps | CSS custom properties |
|---|---|---|
| When resolved | Compile time — baked into the output CSS | Runtime — resolved by the browser, can change after load |
| Can respond to media queries / user interaction at runtime | No — a value is fixed once compiled | Yes — redefine \`--spacing-6\` inside a \`@media\` block or \`:hover\`, and every user of it updates live |
| Real iteration (\`@each\`, \`@for\`) | Yes — full loop constructs over the data | No — no iteration construct in CSS itself |
| Nesting / structured data | Yes — maps of maps, arbitrary depth | Flat by nature — one property, one value; "nesting" is simulated via naming conventions like \`--color-brand-500\` |
| Computation (math, string building, conditionals) | Yes — full Sass function/expression language | Limited — \`calc()\`, \`min()\`/\`max()\`/\`clamp()\` only; no conditionals, no string manipulation |
| Inspectable/changeable via DevTools | No — gone by the time CSS ships | Yes — visible and editable live in browser DevTools |
| Theming / dark mode | Awkward — needs a full separate compile per theme, or emitting both variants manually | Natural fit — swap a value at a \`[data-theme]\` or \`prefers-color-scheme\` boundary, everything downstream updates |
| Works without a build step | No — requires the Sass compiler | Yes — native to the browser |

The honest takeaway: Sass maps are **compile-time data** — you get real programming-language features (loops, nested structures, computation, validation) but the result is frozen the moment the CSS ships. Custom properties are **runtime values** — comparatively primitive on their own (no iteration, no real nesting, limited math) but genuinely alive in the browser, which is exactly what theming, dark mode, and user-adjustable settings need.

Neither replaces the other, and this course won't pretend one has quietly made the other obsolete.

## The pattern most real projects actually use: both, together

In practice, mature Sass codebases tend to use maps and custom properties for different jobs, in the same project:

- **Sass maps generate the comprehensive set** — every spacing step, every color shade, every breakpoint, every font size — because that's a job maps are strictly better at: looping over dozens of values, validating keys, computing derived values, with zero runtime cost.
- **Custom properties carry anything that needs to change after load** — the small subset of tokens actually involved in theming, typically just the semantic layer (\`--color-bg\`, \`--color-text\`, \`--color-accent\`) rather than the entire raw palette.

A common bridge pattern is to generate the custom properties themselves from a Sass map, getting the authoring convenience of maps and the runtime flexibility of custom properties at once:

\`\`\`scss
@use "sass:map";
@use "tokens" as t;

:root {
  @each $key, $value in map.get(t.$colors, "brand") {
    --color-brand-#{$key}: #{$value};
  }
}

[data-theme="dark"] {
  --color-brand-500: #{map.get(map.get(t.$colors, "brand"), "700")};
}
\`\`\`

\`\`\`css
:root {
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-700: #1d4ed8;
}
[data-theme="dark"] {
  --color-brand-500: #1d4ed8;
}
\`\`\`

The map still owns the full, structured source of truth and does the iteration; the custom properties it emits are the only part exposed to runtime theme-switching. That's usually the right split — reach for a map first for anything fixed and comprehensive, promote a value to a custom property only once something concrete needs it to change without a rebuild.

> **Key idea:** Sass maps and CSS custom properties solve different halves of the same problem — maps give you compile-time iteration, nesting, and computation to generate a complete token set with zero runtime cost, while custom properties give you the runtime flexibility maps can never have; most real projects use maps to generate the bulk of their tokens and custom properties for the specific subset that needs to change live, such as theming or dark mode.`,
    },
  ],
}
