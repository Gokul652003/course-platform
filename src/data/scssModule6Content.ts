import type { Module } from "../types"

export const scssModule6: Module = {
  id: 6,
  title: "Extend & Placeholder Selectors",
  status: "upcoming",
  lessons: [
    {
      name: "@extend Basics",
      minutes: 11,
      intro: "Share declarations between selectors with @extend, and see exactly how the compiled CSS differs from @include.",
      content: `## What @extend does

\`@extend\` lets one selector inherit the declarations of another **by combining selectors in the compiled CSS**, rather than by copying declarations into the extending rule. That distinction — combine vs. copy — is the entire story of this lesson, and it's the thing that trips people up when they first meet \`@extend\` after already knowing mixins.

Here's the minimal example:

\`\`\`scss
.message {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  @extend .message;
  border-color: green;
}
\`\`\`

Compiled output:

\`\`\`css
.message, .success {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  border-color: green;
}
\`\`\`

Notice what happened: Sass did **not** duplicate \`padding: 1rem\`, \`border: 1px solid #ccc\`, and \`border-radius: 4px\` into a second \`.success { ... }\` block. Instead it rewrote the selector list on the *original* \`.message\` rule to \`.message, .success\`, so both classes share one set of declarations in the output. \`.success\` still gets every property \`.message\` has — it just gets there through a shared selector, not a copy.

## The same thing with @include, for comparison

Now do the equivalent with a mixin instead:

\`\`\`scss
@mixin message-base {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.message {
  @include message-base;
}

.success {
  @include message-base;
  border-color: green;
}
\`\`\`

Compiled output:

\`\`\`css
.message {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  border-color: green;
}
\`\`\`

This time the three declarations appear **twice** — once inside \`.message\`, once inside \`.success\` — because \`@include\` is textual copy-paste at compile time. Every selector that includes the mixin gets its own full copy of the declarations.

### Side by side

| | \`@extend .message\` | \`@include message-base\` |
|---|---|---|
| Mechanism | Merges selector into existing rule's selector list | Copies declarations into the calling rule |
| Output shape | One rule, combined selector: \`.message, .success { ... }\` | Two separate rules, each with full declarations |
| Output size (many extenders) | Selector list grows, declarations stay written once | Declarations repeated once per extender — output grows linearly |
| Can take arguments | No | Yes, including default values |
| Can accept a content block (\`@content\`) | No | Yes |
| Where the "source" selector must live | Anywhere Sass can see it at compile time (same module or forwarded) | Anywhere the mixin is \`@use\`d or defined |

The output-size difference matters at scale. If twenty selectors all extend \`.message\`, you get one rule with a twenty-item selector list and the declarations written exactly once. If twenty selectors all \`@include message-base\`, you get twenty separate rules, each carrying its own copy of the same three declarations — noticeably more compiled CSS for no behavioral difference.

## Extending a real class selector — and why that's a trap

The example above extended \`.message\`, an ordinary class that's also used directly in markup as a real, standalone component style. That works, but it quietly creates a coupling that isn't obvious from reading \`.success\` alone.

Think about what "\`.success\` extends \`.message\`" really means: **every future change to \`.message\` automatically applies to \`.success\` too**, forever, whether or not that's still desirable. Six months later, someone adds a subtle box-shadow to \`.message\` for a redesign:

\`\`\`scss
.message {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
\`\`\`

That box-shadow now silently appears on \`.success\` as well — and on every other selector anywhere in the codebase that happens to extend \`.message\`. Nobody touched \`.success\`, nobody reviewed a diff that mentions \`.success\`, and yet its rendered appearance changed. The person editing \`.message\` may not even know \`.success\` exists, especially in a large codebase where the \`@extend\` lives in a completely different file.

There's a second, more surprising problem: \`.message\` itself is a **real class used directly in HTML**. Somewhere in the templates there's presumably a \`<div class="message">\`. That means \`.message\` is doing double duty — it's both a standalone, directly-used component class *and* a shared "base style" that other selectors extend. Those are two different responsibilities pulling in different directions:

- As a standalone class, people expect editing \`.message\` to affect only elements literally marked up with \`class="message"\`.
- As an extend target, editing \`.message\` silently affects every extender too.

This is exactly the kind of implicit, invisible coupling that makes large stylesheets hard to reason about. The fix — covered in the next lesson — is to stop extending real, directly-used classes for this purpose and extend something whose entire job is to be a shared base, and nothing else.

### A quick word on @extend and specificity

Unlike mixins, extended selectors merge at the selector-list level, so specificity is governed by the combined selector as it appears in the output — extending doesn't raise specificity on its own, but a long chain of extends can produce long comma-separated selector lists that are harder to scan and reason about later. That readability cost is worth keeping in mind even before the coupling problem shows up.

> **Key idea:** \`@extend\` merges selectors so declarations are written once in the output, while \`@include\` copies declarations into every call site; that efficiency comes at the cost of coupling — extending a real, directly-used class means every future edit to that class silently reaches every extender too.`,
    },
    {
      name: "Placeholder Selectors (%name)",
      minutes: 11,
      intro: "Define styles that only exist to be extended, using %placeholder selectors that never leak into the compiled CSS on their own.",
      content: `## The problem placeholders solve

The previous lesson ended on a real problem: extending \`.message\` works, but \`.message\` is *also* a real, directly-used class, so it's carrying two jobs at once — "style elements marked up with this class" and "be a shared base for other selectors to extend." Sass gives you a selector kind built specifically to be the second job and nothing else: the **placeholder selector**, written with a \`%\` sigil instead of \`.\`.

\`\`\`scss
%message-base {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  @extend %message-base;
  border-color: green;
}

.error {
  @extend %message-base;
  border-color: red;
}
\`\`\`

Compiled output:

\`\`\`css
.success, .error {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  border-color: green;
}

.error {
  border-color: red;
}
\`\`\`

Look closely: **\`%message-base\` itself never appears in the output at all.** A placeholder that is never extended by anything compiles to nothing — Sass simply omits it, since \`%message-base\` was never a valid CSS selector to begin with and only ever existed to hand its declarations off to extenders. Compare that to what happened with \`.message\` in the previous lesson, where the class name itself always survived into the combined selector list whether or not you wanted it to appear as a standalone rule.

## Why this fixes the coupling problem

With a placeholder, there is no standalone \`<div class="message-base">\` anywhere in your HTML — \`%message-base\` isn't a real class, so it cannot be used directly in markup even if someone tried. Its **only** possible purpose is to be extended. That single-purpose design directly removes the ambiguity from the previous lesson:

- Nobody can accidentally rely on \`%message-base\` as a "real" standalone style, because CSS doesn't understand \`%\` selectors — HTML has no way to reference it.
- Anyone editing \`%message-base\` already knows, from the sigil alone, that this rule exists purely to be shared — there's no second responsibility to worry about breaking.
- The set of things affected by an edit is still "everything that extends this," but at least that's the *only* thing the selector was ever for, so the blast radius is expected rather than surprising.

Placeholders don't eliminate the "editing a shared base affects all its extenders" behavior — that's inherent to \`@extend\` and, honestly, inherent to *any* form of shared styling, mixins included. What placeholders eliminate is the accidental double-duty: a placeholder can never be mistaken for a real, independently-styled class, because it never was one.

## A practical example: %clearfix and %visually-hidden

Two placeholders that show up constantly in real Sass codebases are a legacy clearfix and an accessibility helper for visually hiding content while keeping it available to screen readers.

\`\`\`scss
%clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

%visually-hidden {
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
\`\`\`

These get pulled into dozens of unrelated components across a codebase:

\`\`\`scss
.legacy-media-object {
  @extend %clearfix;
}

.form-label--icon-only {
  @extend %visually-hidden;
}

.skip-link {
  @extend %visually-hidden;

  &:focus {
    position: static;
    width: auto;
    height: auto;
    clip: auto;
  }
}
\`\`\`

Compiled:

\`\`\`css
.legacy-media-object::after {
  content: "";
  display: table;
  clear: both;
}

.form-label--icon-only, .skip-link {
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

.skip-link:focus {
  position: static;
  width: auto;
  height: auto;
  clip: auto;
}
\`\`\`

Neither \`%clearfix\` nor \`%visually-hidden\` shows up in the compiled CSS on its own — only the real component classes that extended them appear, each carrying the merged declarations. This is precisely the pattern that makes placeholders useful: a small library of argument-free, truly-shared style fragments (a clearfix, a visually-hidden pattern, a reset for list markers, a truncation rule) that many unrelated components can pull in without any of them paying for a class that leaks into the output unused.

## Placeholders and modules

Like mixins and variables, placeholders defined in one file need to be made visible to another through Sass's module system:

\`\`\`scss
// _helpers.scss
%visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
\`\`\`

\`\`\`scss
// _skip-link.scss
@use "helpers";

.skip-link {
  @extend helpers.%visually-hidden;
}
\`\`\`

Dart Sass requires the module-namespaced form (\`helpers.%visually-hidden\`) when extending a placeholder brought in via \`@use\` — you can't just write \`%visually-hidden\` and expect Sass to guess which module it came from, the same way you can't call a mixin or function without its namespace.

## Why placeholders are usually the safer default

| | Extending a real class (\`.message\`) | Extending a placeholder (\`%message-base\`) |
|---|---|---|
| Appears in output on its own | Yes, always | Only if never extended (and even then, empty rules with no extenders are dropped) |
| Can be used directly in HTML | Yes — invites double duty | No — impossible by construction |
| Communicates intent | Ambiguous — looks like a normal component class | Explicit — the \`%\` sigil signals "shared base only" |
| Risk of surprising an unrelated author | Higher — they may not know it's an extend target | Lower — the only use is as an extend target |

None of this means real classes should never be extended — sometimes you genuinely want "this new variant is exactly that existing component, plus a tweak," and extending the real class is the honest expression of that. But when the goal is specifically "a reusable fragment of styles with no independent identity of its own," a placeholder says exactly that, and a real class only says it by convention that the next person might not follow.

> **Key idea:** A placeholder (\`%name\`) is a selector that exists solely to be extended — it never appears in the compiled CSS on its own and can never be referenced from HTML, which removes the double-duty ambiguity of extending a real class and makes it the safer default for shared, argument-free style fragments.`,
    },
    {
      name: "@extend vs Mixins vs Placeholders — Choosing the Right Tool",
      minutes: 12,
      intro: "A decision framework for @extend, placeholders, and mixins — plus the common @extend pitfalls that catch people once codebases grow.",
      content: `## The decision, laid out

By now you've seen \`@extend\` on real classes, \`@extend\` on placeholders, and \`@include\` on mixins each produce different compiled output for what can look like the same source-level intent. The right tool depends on three questions: *does it need arguments?*, *how much does output size matter?*, and *how worried should you be about selector coupling?*

| | \`@extend\` real class | \`@extend\` placeholder (\`%name\`) | \`@include\` mixin |
|---|---|---|---|
| Output shape | Combined selector list, declarations written once | Combined selector list, declarations written once | Declarations copied into every call site |
| Output size, many callers | Small — grows by selector text only | Small — grows by selector text only | Grows linearly — full copy per caller |
| Accepts arguments | No | No | Yes |
| Accepts a content block (\`@content\`) | No | No | Yes |
| Can be used directly in HTML/markup | Yes | No | N/A (not a selector at all) |
| Selector coupling risk | High — editing the base silently reaches every extender, and the base has a second identity as a real class | Present but expected — editing the base reaches every extender, but that's the placeholder's only job | None — each call site is independent after compile |
| Best for | "This is genuinely that other component, plus a delta" | Small, argument-free style fragments shared widely (clearfix, visually-hidden, truncate) | Anything parameterized, or anything needing conditional/variable output via \`@content\` |
| Readability at the call site | Good — one line, but hides *which* other selectors are affected | Good — one line, and the \`%\` sigil signals "shared fragment" | Good — arguments make the customization visible right there |

## Realistic scenarios

**Reach for \`@extend\` on a placeholder** when you have a small, truly shared set of declarations that never varies — no arguments, no conditionals, just "give me these exact properties." A clearfix, a visually-hidden pattern, a text-truncation rule, a card's base padding/border/radius before any variant-specific overrides. The moment you'd want to pass in a color, a spacing value, or a breakpoint, a placeholder can't help you — placeholders take no arguments, full stop.

**Reach for \`@extend\` on a real class** only when the relationship genuinely is "is-a," not just "looks-a-bit-like." A \`.btn--danger\` that truly is a \`.btn\` with one color swapped is a legitimate use. If you find yourself extending a class from a completely different, unrelated component just because it happens to have the padding value you want, that's a sign to extract a placeholder (or a variable, or a mixin) instead of creating an accidental dependency between two components that have nothing conceptually to do with each other.

**Reach for a mixin** the instant you need arguments, default parameter values, or \`@content\` to inject a custom block of declarations or nested rules. Responsive breakpoints, color variants, spacing scales — anything where two call sites want "the same shape of thing, but with different values" is a mixin's job, not \`@extend\`'s. Trying to fake this with \`@extend\` and a pile of near-duplicate placeholders (\`%message-base-red\`, \`%message-base-blue\`...) is a strong signal you actually wanted a mixin with a \`$color\` argument.

**Reach for a plain utility class or native CSS** when you don't need Sass's compile-time behavior at all. If the "shared style" is genuinely just \`display: flex\` or a single spacing value, a reusable utility class (or even just repeating the one-liner) is simpler than any Sass abstraction, and it sidesteps every question about coupling raised in this module. Modern CSS custom properties (\`--gap: 1rem\`) can also replace what used to require a Sass variable plus a mixin, particularly when the value needs to change at runtime (e.g. via a media query or JS) — something Sass's compile-time \`$variables\` and placeholders fundamentally cannot do, since they're resolved once, at build time, and never again.

\`\`\`scss
// Mixin: right choice, because it's parameterized
@mixin button-variant($bg, $fg: white) {
  background: $bg;
  color: $fg;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.btn--primary {
  @include button-variant(#2563eb);
}

.btn--danger {
  @include button-variant(#dc2626);
}
\`\`\`

\`\`\`scss
// Placeholder: right choice, because it's a fixed, argument-free fragment
%truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-cell {
  @extend %truncate;
}

.nav-link__label {
  @extend %truncate;
}
\`\`\`

## Common @extend pitfalls

**Extending across unrelated stylesheets.** \`@extend\` works by rewriting a selector list at compile time, and Sass has to be able to see the placeholder or class you're extending — that generally means it needs to be \`@use\`d (and namespaced, for placeholders) like any other module member. Extending something from a completely unrelated part of the codebase, just because it happens to have the right declarations, creates a compile-time dependency between two stylesheets that have no other reason to know about each other. When one of those files gets deleted or refactored, the \`@extend\` breaks the other one in a way that's easy to miss during review.

**Extending inside a media query.** This is the sharpest pitfall. If the selector you're extending was defined *outside* any \`@media\` block, but you try to \`@extend\` it from *inside* one, Dart Sass will raise an error rather than silently produce something wrong — you cannot merge a selector into a rule that lives in a different media context, because the resulting CSS would be invalid (the base rule would need to somehow exist both inside and outside the media query at once). The fix is almost always to switch to a mixin for anything that needs to work both inside and outside conditional contexts like media queries, since a mixin's declarations are copied fresh at each call site and carry no such restriction.

\`\`\`scss
.card {
  padding: 1rem;
}

@media (min-width: 768px) {
  .card--wide {
    @extend .card; // error: base selector isn't in this media context
  }
}
\`\`\`

**Extend chains that produce surprisingly large selector lists.** If \`%base\` is extended by ten selectors, and one of *those* is itself extended by five more, Sass has to compute the full transitive closure of every selector that should end up sharing the base's declarations. The resulting selector list can get long and hard to scan in the compiled output, even though every individual \`@extend\` in the source looked simple. This isn't wrong, exactly, but it's worth knowing the compiled CSS can look surprising compared to what any single file suggests.

**Using \`@extend\` where a mixin was actually wanted.** The most common everyday mistake isn't an error at all — it's reaching for \`@extend\` out of habit on a placeholder that's slowly accumulated an argument-shaped need ("what if this fragment took a \`$color\`?"). Since placeholders can never take arguments, the usual outcome is either a proliferation of near-duplicate placeholders (\`%alert-red\`, \`%alert-blue\`) or a placeholder that gets abandoned in favor of a mixin anyway. If you can already picture wanting an argument someday, save the churn and start with a mixin.

> **Key idea:** Default to a placeholder for small, fixed, widely-shared style fragments; reach for a mixin the moment arguments or \`@content\` are involved; extend a real class only when the relationship is a genuine "is-a," not a convenient coincidence — and watch for \`@extend\` across unrelated files or media-query boundaries, where it either couples code that shouldn't be coupled or fails to compile at all.`,
    },
  ],
}
