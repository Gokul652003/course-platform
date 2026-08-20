import type { Module } from "../types"

export const scssModule4: Module = {
  id: 4,
  title: "Mixins",
  status: "upcoming",
  lessons: [
    {
      name: "@mixin & @include Basics",
      minutes: 10,
      intro: "Define reusable, parameterizable blocks of styles with @mixin and drop them into any rule with @include.",
      content: `## The problem mixins solve

A native CSS class gives you reuse, but only one kind: you can apply the same fixed set of declarations to many elements by giving them the same class. What a class **can't** do is bundle up a group of declarations that varies slightly each time you use it, or that needs to be woven into a selector that already has its own class name. That's the gap **mixins** fill.

A **mixin** is a named, reusable block of styles — think of it as a function that returns CSS declarations instead of a value. You define it once with \`@mixin\`, then pull its contents into as many rules as you like with \`@include\`. Unlike a CSS class, a mixin's output is copied into every place you include it, so it can live alongside other declarations in the same rule, and (as the next lesson covers) it can accept arguments that change its output each time.

## Defining a mixin

Use the \`@mixin\` at-rule, give it a name, and write ordinary declarations inside the block:

\`\`\`scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
\`\`\`

That's it — no parentheses required if the mixin takes no arguments (though \`@mixin flex-center()\` with empty parens is also legal and equivalent). Nothing is generated yet; a mixin definition on its own produces zero CSS output. It only becomes real output once something \`@include\`s it.

## Using a mixin with @include

\`@include\` pulls a mixin's declarations into the current rule, at the point where you write it:

\`\`\`scss
.hero-banner {
  @include flex-center;
  min-height: 40vh;
  background: #0f172a;
}
\`\`\`

Compiles to:

\`\`\`css
.hero-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  background: #0f172a;
}
\`\`\`

Notice the mixin's three declarations land exactly where \`@include\` was written, mixed in with the rule's own declarations. You can \`@include\` the same mixin in as many rules as you want — each inclusion copies the declarations fresh into that rule. There's no shared class name, no extra selector in the compiled CSS, and no risk that two unrelated elements accidentally couple to each other the way they would if they both carried a literal \`.flex-center\` class.

## Why not just use a CSS class?

It's fair to ask: couldn't \`.flex-center { display: flex; align-items: center; justify-content: center; }\` do the same job? For this exact example, yes — and if a style truly never varies and never needs to combine with other rule-specific styles, a plain class is often simpler and produces less duplicated CSS. Mixins earn their place once any of these become true:

- The block needs to accept **arguments** that change its output per use site (covered next lesson) — a class can't parameterize itself.
- You need the declarations to live **inside** a rule that already has its own selector and other styles, rather than requiring the element to carry an extra class name in your markup.
- The block includes **nested rules, media queries, or pseudo-selectors** that need to be spliced into wherever it's included, not just flat declarations.
- You want the logic centralized so a change to the mixin definition ripples out to every inclusion, without forcing every consuming element to also carry a shared class.

## A realistic first example: a flex-center mixin

Centering something with flexbox is one of the most repeated patterns in any codebase. Defining it once means every consumer gets the same three declarations without retyping them:

\`\`\`scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  @include flex-center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.icon-button {
  @include flex-center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}
\`\`\`

Both rules get the centering declarations, plus their own unrelated styles, with no shared selector connecting them in the compiled output:

\`\`\`css
.modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}
\`\`\`

## A second example: a visually-hidden accessibility mixin

A very common accessibility pattern is hiding content **visually** while keeping it available to screen readers — used for skip links, form labels that are implied by context, and similar cases. It's a fixed recipe of several declarations that's easy to get subtly wrong by hand, which makes it an ideal mixin candidate:

\`\`\`scss
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  @include visually-hidden;

  &:focus {
    position: fixed;
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    padding: 0.75rem 1rem;
    background: #fff;
    clip: auto;
  }
}
\`\`\`

Here the mixin supplies the "hidden by default" baseline, and the rule's own \`&:focus\` block overrides it back to visible when the link receives keyboard focus — exactly the kind of composition a shared CSS class alone would make awkward, since you'd need to fight the class's specificity from a second selector instead of simply writing more declarations in the same rule.

## Where mixins can be included

\`@include\` isn't limited to top-level rules — it works anywhere a declaration or nested rule is valid, including inside media queries, nested selectors, and other mixins:

\`\`\`scss
.card {
  padding: 1rem;

  @media (min-width: 768px) {
    @include flex-center;
  }
}
\`\`\`

This flexibility — splicing pre-written blocks of styles into arbitrary locations in your stylesheet — is the core capability a mixin adds over a plain CSS class, and it's the foundation the next two lessons build on: first by making mixins accept arguments, then by letting the *caller* hand a block of styles back into the mixin with \`@content\`.

## Native CSS has closed part of this gap

It's worth being honest about how much of "I want to reuse a bundle of declarations" native CSS now handles on its own. **CSS custom properties** (\`--gap: 1rem\`) let you centralize a *value* without Sass. **Nesting** is now native in all modern browsers, so you don't need Sass just to write \`&:focus\` inside a rule. What native CSS still can't do is what this lesson is really about: define a reusable block of multiple declarations, parameterize it, and splice it into an arbitrary rule with a single line. There's a native \`@mixin\`-like proposal (CSS \`@function\` and custom "mixin" ideas) in early stages as of this writing, but nothing shipped and stable yet — so for parameterized, spliceable reusable style blocks, Sass mixins remain uniquely valuable today.

> **Key idea:** \`@mixin\` defines a reusable, named block of declarations that produces no output on its own; \`@include\` copies that block's contents into the rule where you write it, letting you reuse styles across unrelated selectors without coupling them through a shared class name.`,
    },
    {
      name: "Mixin Arguments",
      minutes: 12,
      intro: "Parameterize mixins with positional and named arguments, default values, and variable-length argument lists.",
      content: `## Why arguments matter

A mixin with no arguments is useful, but limited — it always produces exactly the same declarations. The real power of mixins shows up once they can accept **arguments**, turning them from "a fixed block of styles" into something closer to a genuine function: you call it with different inputs and get differently-shaped output each time, while still writing the underlying logic only once.

## Positional arguments

Declare parameters in parentheses after the mixin name, prefixed with \`$\` just like any Sass variable. Callers supply values in the same order:

\`\`\`scss
@mixin button-variant($bg, $text) {
  background: $bg;
  color: $text;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.btn-primary {
  @include button-variant(#2563eb, #fff);
}

.btn-danger {
  @include button-variant(#dc2626, #fff);
}
\`\`\`

Compiles to:

\`\`\`css
.btn-primary {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
\`\`\`

Each \`@include\` supplies its own values for \`$bg\` and \`$text\`, and the mixin body runs fresh for each call — this is the same evaluation model a function has, just producing CSS declarations as output instead of a returned value.

## Default argument values

Give a parameter a default with \`$name: default-value\` in the mixin's signature. Callers can then omit that argument entirely and the default is used:

\`\`\`scss
@mixin button-variant($bg, $text: #fff, $radius: 0.375rem) {
  background: $bg;
  color: $text;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: $radius;
}

.btn-primary {
  @include button-variant(#2563eb);
}

.btn-outline {
  @include button-variant(#f8fafc, #0f172a, 999px);
}
\`\`\`

\`.btn-primary\` supplies only \`$bg\`, so \`$text\` falls back to \`#fff\` and \`$radius\` falls back to \`0.375rem\`. \`.btn-outline\` supplies all three positionally, overriding every default. Parameters with defaults are conventionally placed after required parameters, mirroring the convention in most programming languages — Sass doesn't strictly enforce an ordering rule here, but putting required arguments first keeps call sites readable.

## Keyword (named) arguments

Instead of relying on position, you can pass arguments by name at the call site, using the same \`$name: value\` syntax as the definition. This is especially useful when a mixin has several optional parameters and you only want to override one that isn't first in the list:

\`\`\`scss
.btn-ghost {
  @include button-variant($bg: transparent, $radius: 999px);
}
\`\`\`

Here \`$text\` is skipped entirely and falls back to its default \`#fff\`, while \`$bg\` and \`$radius\` are set explicitly by name, in whatever order is convenient — keyword arguments don't need to appear in declaration order. This reads more like self-documenting code than a bare positional call, and it also protects you from an easy class of bugs: reordering positional arguments by mistake silently swaps which value goes where, while keyword arguments name the mismatch away.

You can freely mix positional and keyword arguments in a single call, as long as every positional argument comes before the keyword ones:

\`\`\`scss
.btn-warning {
  @include button-variant(#f59e0b, $radius: 999px);
}
\`\`\`

## Variable arguments with ...

Sometimes you don't know in advance how many arguments a mixin should accept — for example, a mixin that forwards its arguments straight into a CSS function like \`box-shadow\` or \`transition\`, which themselves accept a variable-length, comma-separated list. Sass supports this with the **arglist** syntax: append \`...\` to the last parameter name to collect any extra arguments into a list.

\`\`\`scss
@mixin transition-props($props...) {
  $result: ();

  @each $prop in $props {
    $result: append($result, $prop 0.2s ease, comma);
  }

  transition: $result;
}

.card {
  @include transition-props(transform, box-shadow, opacity);
}
\`\`\`

Compiles to:

\`\`\`css
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
\`\`\`

Whether the caller passes one property or five, \`$props\` collects them all into a single Sass list that the mixin body can loop over with \`@each\`. This is the same idea as "rest parameters" (\`...args\`) in JavaScript, or \`*args\` in Python — an unlimited tail of arguments gathered into one variable.

\`...\` also works in reverse, to **spread** a list or map back out into an actual argument call — handy when you've built up a list of values and want to forward them all into another mixin or CSS function in one go:

\`\`\`scss
$shadow-layers: (0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1));

.elevated {
  box-shadow: $shadow-layers...;
}
\`\`\`

## Practical example: a responsive breakpoint mixin

A very common real-world mixin wraps a media query behind a friendlier name, taking the breakpoint size as an argument so call sites read as intent rather than raw pixel math:

\`\`\`scss
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
);

@mixin respond-above($size) {
  @media (min-width: map.get($breakpoints, $size)) {
    @content;
  }
}
\`\`\`

(That \`@content\` line is a preview of the next lesson — it's what lets the *caller* supply the declarations that go inside the media query, rather than the mixin hardcoding them. Called like this:)

\`\`\`scss
.sidebar {
  width: 100%;

  @include respond-above(md) {
    width: 240px;
  }
}
\`\`\`

## Practical example: a button-variant mixin with real defaults

Pulling the earlier button example together into something closer to production shape — required color, optional everything else:

\`\`\`scss
@mixin button-variant($bg, $text: #fff, $padding-y: 0.5rem, $padding-x: 1rem, $radius: 0.375rem) {
  display: inline-block;
  background: $bg;
  color: $text;
  border: none;
  padding: $padding-y $padding-x;
  border-radius: $radius;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    filter: brightness(0.92);
  }
}

.btn-sm {
  @include button-variant(#2563eb, $padding-y: 0.25rem, $padding-x: 0.75rem);
}
\`\`\`

Only \`$bg\` is required; every other knob has a sensible default that individual call sites can override selectively by name, which is exactly the flexibility a hand-written CSS class can't offer without duplicating the whole rule.

## Comparing the argument styles

| Style | Syntax at call site | Best when |
|---|---|---|
| Positional | \`@include mixin(val1, val2)\` | Few arguments, order is obvious and stable |
| Default values | Declared as \`$name: default\` in the signature | Most calls should use a sensible fallback |
| Keyword | \`@include mixin($name: val)\` | Many optional arguments, or skipping earlier ones |
| Arglist (\`...\`) | \`@include mixin($a, $b, $c)\` collected into \`$args...\` | Unknown/variable number of values, often forwarded to a CSS function |

> **Key idea:** Mixin arguments — positional, defaulted, keyword, and variable-length via \`...\` — are what turn a mixin from a fixed block of styles into a genuine reusable abstraction, letting one definition serve many differently-configured call sites without duplicating logic.`,
    },
    {
      name: "@content — Passing a Style Block into a Mixin",
      minutes: 11,
      intro: "Let the caller inject their own declarations into a mixin with @content, and know when to reach for a mixin versus a function or a placeholder.",
      content: `## The problem @content solves

Arguments let a caller pass **values** into a mixin. But sometimes what you want to pass in isn't a single value — it's an entire block of arbitrary declarations, nested rules, or even other at-rules. A media-query wrapper is the clearest example: the mixin knows the breakpoint logic, but has no idea what CSS the caller actually wants applied at that breakpoint, and it would be absurd to invent an argument for every possible declaration.

Sass solves this with the \`@content\` directive. A mixin that includes \`@content\` in its body has a placeholder where the *caller's own style block* gets spliced in, at the exact point \`@content\` appears.

## Basic @content usage

\`\`\`scss
@mixin respond-above($min-width) {
  @media (min-width: $min-width) {
    @content;
  }
}
\`\`\`

To pass a block of styles into a mixin, wrap the \`@include\` call in curly braces, just like a normal rule:

\`\`\`scss
.nav {
  display: block;

  @include respond-above(768px) {
    display: flex;
    justify-content: space-between;
  }
}
\`\`\`

Compiles to:

\`\`\`css
.nav {
  display: block;
}

@media (min-width: 768px) {
  .nav {
    display: flex;
    justify-content: space-between;
  }
}
\`\`\`

The two declarations between the curly braces at the \`@include\` call site are exactly what replaces \`@content\` inside the mixin. The mixin owns the *structure* (a media query, in this case) and the caller owns the *content* — a clean separation that arguments alone can't express, since arguments are single values, not open-ended blocks of CSS.

## A named-breakpoint version

Combining this with the breakpoint map from the previous lesson gives a genuinely pleasant API for responsive styles:

\`\`\`scss
@use "sass:map";

$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
);

@mixin respond-above($size) {
  @media (min-width: map.get($breakpoints, $size)) {
    @content;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;

  @include respond-above(md) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-above(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

Each \`@include respond-above(...) { ... }\` block generates its own \`@media\` rule wrapping whatever declarations were passed, all driven by one small mixin definition. This is the pattern most real Sass codebases use instead of hand-writing \`@media (min-width: 768px) { ... }\` everywhere and hoping the pixel values stay consistent.

## @content can appear more than once, or not at all

A mixin can include \`@content\` zero, one, or multiple times. If it's included more than once, the *same* caller-supplied block is duplicated at every location:

\`\`\`scss
@mixin print-and-screen {
  @media screen {
    @content;
  }
  @media print {
    @content;
  }
}
\`\`\`

If a mixin containing \`@content\` is \`@include\`d *without* a trailing block, Sass simply inserts nothing at that point — it's not an error by default, though it can produce an empty at-rule if that's all the mixin contains.

## Passing arguments to @content blocks

A newer, less commonly known Sass feature lets a mixin pass arguments *into* the content block it's given, similar to how a callback function receives arguments. Declare the parameters the content block should receive using \`@content(...)\`, and the caller receives them by naming parameters in \`using (...)\` after their block:

\`\`\`scss
@mixin styled-list($items) {
  ul {
    list-style: none;
    padding: 0;

    @each $item in $items {
      li {
        @content ($item);
      }
    }
  }
}

.tags {
  @include styled-list($tag-names) using ($name) {
    content: $name;
  }
}
\`\`\`

Here, every iteration of the \`@each\` loop inside the mixin hands the current \`$item\` back out to the caller's block, which receives it as \`$name\`. This is genuinely powerful for mixins that loop internally but need the caller to decide what happens on each iteration — without it, the caller would have no way to access loop-local values the mixin computes.

## Mixins vs functions vs placeholders (@extend) — when to reach for each

Sass gives you three different tools for reuse, and it's easy to reach for the wrong one out of habit. The next module covers \`@extend\` and placeholder selectors (\`%name\`) in full, but it's worth previewing the comparison here since all three solve overlapping "don't repeat yourself" problems in different ways.

| | Mixin (\`@mixin\` / \`@include\`) | Function (\`@function\` / \`@return\`) | Placeholder (\`%name\` / \`@extend\`) |
|---|---|---|---|
| Returns | Nothing — emits declarations/rules directly | A single Sass value (\`@return\`) | Nothing — merges selectors together |
| Output shape | Copies its body into every \`@include\` site | Used inline wherever a value is expected | Groups all extending selectors under one shared rule |
| Takes arguments | Yes — positional, default, keyword, arglist | Yes — same argument features as mixins | No |
| Accepts a content block | Yes, via \`@content\` | No | No |
| CSS duplication | Duplicates declarations at every \`@include\` | N/A — no declarations of its own | No duplication — selectors are combined |
| Best for | Reusable blocks of declarations/rules, especially ones needing structure (media queries, pseudo-selectors) or a caller-supplied block | Computing a value — a color shade, a spacing unit, a converted number | Sharing a fixed set of declarations across selectors that share a real semantic relationship |

The rule of thumb: reach for a **function** when you want a *value* back (\`darken($color, 10%)\`, a spacing calculation). Reach for a **mixin** when you want to emit *declarations or structure*, especially if arguments or a caller-supplied \`@content\` block are involved. Reach for a **placeholder/\`@extend\`** only when a fixed group of selectors are genuinely variations of the same underlying thing and you specifically want the compiled CSS to combine their selectors into one rule instead of duplicating declarations — which, as the next module explains, comes with its own sharp edges around selector ordering and specificity that make it the least commonly recommended of the three in modern Sass style guides.

## What native CSS offers here

Native CSS nesting and custom properties cover some of what a simple no-argument mixin used to be needed for, but \`@content\` has no native equivalent at all — there's no way in plain CSS to define a rule that accepts an arbitrary block of caller-supplied declarations and splices it into a specific structural location like a media query. Container queries and \`@media\` are native, but the *abstraction* of "wrap whatever the caller gives me in this structure" is a Sass-only capability, and it's one of the strongest remaining reasons to reach for a preprocessor even in a codebase that otherwise leans on modern native CSS features.

> **Key idea:** \`@content\` lets a mixin accept not just values but an entire block of caller-supplied styles, spliced into a specific structural location — the tool of choice whenever a mixin needs to wrap arbitrary declarations (media queries, pseudo-selectors, loops) rather than just compute or apply fixed ones; use a function for a returned value, a mixin (with or without \`@content\`) for emitted declarations/structure, and a placeholder/\`@extend\` only for genuinely shared selector groups.`,
    },
  ],
}
