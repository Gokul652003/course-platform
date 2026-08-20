import type { Module } from "../types"

export const scssModule10: Module = {
  id: 10,
  title: "Advanced Sass & Production Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Migrating Off Legacy @import & Fixing Deprecation Warnings",
      minutes: 14,
      intro: "A practical checklist for moving a real codebase from global @import to @use/@forward, resolving deprecation warnings, and wiring up source maps.",
      content: `## Why this migration matters now

For years, every Sass file started the same way: a pile of \`@import\` statements at the top, pulling in variables, mixins, and partials into one shared global namespace. It worked, but it had real problems — every \`@import\`ed file's members landed in the *same* global scope, so two partials could silently define the same \`$color\` variable and clobber each other, and Sass had no way to tell you which file a given mixin actually came from.

Dart Sass — the only actively maintained Sass implementation today (Ruby Sass and LibSass were both retired) — has deprecated \`@import\` entirely. It still compiles for now, but every build prints a deprecation warning, and the feature is on a real removal timeline. If your project still leans on \`@import\`, migrating to \`@use\` and \`@forward\` is no longer optional polish, it's overdue maintenance.

This lesson is a checklist, not a theory dump: what to change, in what order, and how to read the warnings Sass gives you along the way.

## Step 1: understand what \`@use\` changes

The replacement for \`@import\` is \`@use\`, and the single biggest behavioral difference is **namespacing**. Where \`@import\` dumped everything into the global scope, \`@use\` loads a module behind a namespace derived from its filename:

\`\`\`scss
// _colors.scss
$primary: #6366f1;
$danger: #ef4444;

@function tint($color, $amount) {
  @return mix(white, $color, $amount);
}
\`\`\`

\`\`\`scss
// button.scss
@use "colors";

.button {
  background: colors.$primary;
  border-color: colors.tint(colors.$danger, 20%);
}
\`\`\`

Notice every reference to something from \`_colors.scss\` is prefixed with \`colors.\`. There's no ambiguity about where \`$primary\` came from, and two different partials can each define their own \`$primary\` without collision, because each lives inside its own namespace.

A few defaults worth knowing:
- The namespace defaults to the filename, minus any leading underscore and the extension — \`_colors.scss\` becomes \`colors\`.
- You can rename it: \`@use "colors" as c;\` gives you \`c.$primary\`.
- \`@use "colors" as *;\` imports without a namespace prefix (use sparingly — it reintroduces the collision risk \`@use\` exists to prevent).
- Each file is only ever evaluated **once** per compilation, no matter how many other files \`@use\` it — \`@import\`, by contrast, would re-run a file's code every time it was imported, which was a real performance and correctness footgun with things like counters or one-time CSS output.

## Step 2: understand \`@forward\` — rebuilding your "barrel" files

Lots of legacy codebases have an \`_index.scss\` or \`_all.scss\` that just imports every partial, so consumers only need one \`@import "styles"\` line. \`@forward\` is the direct replacement for that pattern — it re-exports another module's members through your module, without making them usable in the forwarding file itself (for that you still need \`@use\`).

\`\`\`scss
// _index.scss — the new "barrel" file
@forward "colors";
@forward "typography";
@forward "spacing";
\`\`\`

\`\`\`scss
// main.scss
@use "index";

.card {
  color: index.$primary;
  font-family: index.$font-body;
}
\`\`\`

Everything forwarded from \`colors\`, \`typography\`, and \`spacing\` is now available under the single \`index\` namespace. This is the shape most design-system entry points should take after migration: a thin \`@forward\`-only file that consumers \`@use\` once.

You can control what gets forwarded, too — useful when a partial has internal helpers it shouldn't expose:

\`\`\`scss
// only forward the public-facing names, hide the rest
@forward "colors" show $primary, $danger, tint;

// or forward everything except a couple of internal helpers
@forward "spacing" hide $_internal-step;
\`\`\`

Prefixing is also available directly on \`@forward\`, which is handy for avoiding long chains of namespace renaming:

\`\`\`scss
@forward "colors" as color-*;
// consumers see color-primary, color-danger, etc. inside this module's namespace
\`\`\`

## Step 3: handling \`!default\` configuration with \`@use ... with (...)\`

A very common legacy pattern was a "settings" partial full of \`!default\` variables, imported first so the rest of the codebase could override them before anything else loaded:

\`\`\`scss
// OLD, @import-era pattern
// _settings.scss
$base-font-size: 16px !default;
$grid-columns: 12 !default;
\`\`\`

\`\`\`scss
// main.scss (old)
$grid-columns: 16; // override BEFORE importing
@import "settings";
@import "grid";
\`\`\`

That "override before import" ordering trick doesn't exist under \`@use\` — modules are self-contained and don't leak configuration in from whatever loaded them first. Instead, Dart Sass gives you an explicit configuration syntax: \`@use "module" with (...)\`.

\`\`\`scss
// _settings.scss — unchanged, still uses !default
$base-font-size: 16px !default;
$grid-columns: 12 !default;
\`\`\`

\`\`\`scss
// main.scss (new)
@use "settings" with (
  $grid-columns: 16,
  $base-font-size: 18px
);
@use "grid";
\`\`\`

The rules to remember:
- Only variables marked \`!default\` in the target module can be configured this way — trying to configure a non-\`!default\` variable is an error.
- A module can only be configured the **first** time it's \`@use\`d anywhere in the compilation. If something else already loaded \`settings\` without configuration before your \`with (...)\` runs, Sass throws an error. In practice this means your configuration should happen as early as possible, typically in your single top-level entry file.
- If you need a shared settings module configured from several different forwarding chains, forward it with configuration passed through:

\`\`\`scss
// _index.scss
@forward "settings" with (
  $grid-columns: 16
);
\`\`\`

This is the direct, supported replacement for the old "define your overrides, then import" dance — it's more explicit about *what* is being configured and enforces that it only happens once, which is exactly the kind of silent bug \`@import\` allowed.

## Step 4: a practical migration checklist

For a real codebase, work file by file, leaves first:

1. **Run the automated migrator first.** Dart Sass ships a companion tool, the Sass migrator, that can rewrite most \`@import\`s to \`@use\`/\`@forward\` automatically:
   \`\`\`bash
   npx sass-migrator module --migrate-deps main.scss
   \`\`\`
   It handles namespacing mechanically but won't always pick ideal namespace aliases or catch every \`!default\` configuration case — treat its output as a strong first draft, not a final answer.
2. **Identify your leaf partials** (variables, functions, mixins with no dependencies on other partials) and convert those first — add \`@use\` for anything they depend on, verify they compile standalone.
3. **Rebuild your barrel/index files as \`@forward\` chains**, as shown above, instead of giant \`@import\` lists.
4. **Move configuration to \`@use ... with (...)\`** wherever the old code relied on "override the variable, then import the settings file" ordering.
5. **Search for member collisions the old code was silently tolerating.** \`@use\`'s namespacing will surface these as "undefined variable" errors the moment two files that used to share a global \`$primary\` now each need their own explicit reference — this is usually a sign the collision was already a latent bug.
6. **Delete now-unused global names.** Once everything routes through namespaces, any old un-namespaced usage left behind is dead code (or a bug you haven't caught yet).
7. **Compile with \`--fatal-deprecation\` and \`--future-deprecation\` during the transition** to catch remaining legacy usage early rather than discovering it in production output.

## Step 5: reading deprecation warnings

Modern Dart Sass is verbose about upcoming breaking changes, and it's worth learning to read the shape of these warnings instead of skimming past them. A typical one looks like:

\`\`\`text
DEPRECATION WARNING [import]: Sass @import rules are deprecated and will be
removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

   ╷
 3 │ @import "colors";
   │ ^^^^^^^^^^^^^^^^^
   ╵
  src/main.scss 3:1  root stylesheet
\`\`\`

Three things to read off this every time:
- The bracketed tag (\`[import]\` here) identifies *which* deprecation — Sass has several independent ones (\`import\`, \`global-builtin\`, \`slash-div\`, \`color-functions\`, and others), and you can silence specific ones you've already handled with \`--silence-deprecation=slash-div\` while still seeing the ones you haven't.
- The file and line number pinpoint the exact statement to fix — with large codebases, redirect this output to a file and work through it as a punch list.
- The linked migrator URL — Sass's documentation site keeps an up-to-date automated fix or explanation for nearly every deprecation category, so it's worth actually opening rather than guessing at a fix.

A second extremely common one during this exact migration is the **global built-in function** warning, because functions like \`darken()\`, \`lighten()\`, and \`map-get()\` used to be available globally and are being moved into explicit built-in modules:

\`\`\`scss
// OLD — global built-in, now deprecated
.button {
  background: darken(#6366f1, 10%);
}
\`\`\`

\`\`\`scss
// NEW — explicit module use
@use "sass:color";

.button {
  background: color.adjust(#6366f1, $lightness: -10%);
}
\`\`\`

Note this isn't just a rename — \`darken()\`/\`lighten()\` operated in a way that could produce unintuitive results at extreme values, and \`color.adjust()\`/\`color.scale()\` from the \`sass:color\` built-in module are the actively maintained replacements. Migrating deprecation-by-deprecation like this, rather than all at once, keeps each change reviewable.

## Source maps: tracing compiled CSS back to your .scss

Once your source is namespaced and warning-free, the next production concern is debuggability: when you inspect an element in devtools and see a compiled CSS rule, can you jump straight to the \`.scss\` line that produced it? That's what source maps are for.

With the Dart Sass CLI:

\`\`\`bash
sass --source-map src/main.scss dist/main.css
\`\`\`

This emits \`dist/main.css.map\` alongside the compiled file, plus a comment at the bottom of the CSS pointing to it:

\`\`\`css
/*# sourceMappingURL=main.css.map */
\`\`\`

With build tools this is usually already wired up — Vite, webpack's \`sass-loader\`, and most bundlers enable Sass source maps by default in development and let you toggle them for production. What actually matters is checking your browser devtools honor them: Chrome and Firefox both have a "CSS source maps" toggle in devtools settings, on by default, that swaps the "Sources" panel view from the compiled \`.css\` file to the original \`.scss\` partial and line.

A couple of things worth knowing about source maps in production:
- They add a request (or an inlined base64 blob) but no runtime cost — browsers only fetch/parse them when devtools is open.
- Most teams ship source maps to production behind a build flag rather than omitting them entirely, since being able to debug a live styling issue by jumping straight to source is usually worth the small artifact size increase — treat this the same way you'd treat JS source maps.
- If your compiled CSS goes through a second transform (PostCSS autoprefixing, a minifier), make sure that tool is configured to consume the incoming source map and produce a merged one — otherwise you'll get maps that point to the *intermediate* CSS rather than your original Sass.

> **Key idea:** migrating off \`@import\` isn't just satisfying a deprecation warning — \`@use\`/\`@forward\` namespacing eliminates a whole category of silent global-collision bugs, and \`@use ... with (...)\` gives you an explicit, once-only configuration mechanism to replace the fragile "override before import" ordering trick.`,
    },
    {
      name: "Sass Performance & Output Size",
      minutes: 12,
      intro: "How @extend, deep nesting, and unsplit entry points quietly bloat compiled CSS — and how to catch it before it ships.",
      content: `## Compiled CSS is the product, not your .scss

It's easy to forget, while writing Sass, that none of it ships. The browser only ever sees the compiled CSS output — so every convenience in your source (a mixin, an \`@extend\`, a deeply nested selector) is worth judging by what it turns *into*, not how nice it looks in the \`.scss\` file. This lesson covers the three most common ways Sass source that looks clean quietly produces bloated output, plus how to check.

## \`@extend\` and selector-list bloat

\`@extend\` lets one selector inherit another selector's declared styles by *merging selector lists*, rather than duplicating the declaration block. That sounds like it should always be a size win over a mixin (which copies the declarations wherever it's called) — and for a small, contained set of extends, it is. The problem is how it scales.

\`\`\`scss
%button-base {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.btn-primary { @extend %button-base; background: #6366f1; }
.btn-danger  { @extend %button-base; background: #ef4444; }
.btn-ghost   { @extend %button-base; background: transparent; }
\`\`\`

That compiles to a single shared rule with a combined selector list, which is genuinely efficient:

\`\`\`css
.btn-primary, .btn-danger, .btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
}
.btn-primary { background: #6366f1; }
.btn-danger { background: #ef4444; }
.btn-ghost { background: transparent; }
\`\`\`

Now scale that pattern up. If \`%button-base\` gets extended from 40 different selectors across a large component library — including selectors nested inside media queries, pseudo-classes, and descendant combinators — Sass has to preserve **every** context each extend happened in. The single combined selector list can balloon into an enormous, hard-to-read rule, sometimes spanning hundreds of characters on one line, and because extend merges happen at compile time across the *entire* stylesheet, a placeholder extended from many unrelated partials produces one giant rule far from any of the call sites that produced it — which also makes it painful to trace in devtools.

The practical guidance:
- \`@extend\` is fine for a small, tightly-scoped set of variants that all genuinely share the *exact* same base ruleset (like the button example above).
- Avoid extending a shared placeholder from dozens of unrelated components across a large codebase — the selector-list growth is compounding, not linear, once media queries and nesting contexts multiply the combinations.
- A **mixin** is usually the safer default for anything used widely, because its cost (duplicated declarations at every call site) is easy to reason about and shows up proportionally in file size, whereas \`@extend\`'s cost is a single rule that can grow unpredictably as unrelated code changes.

\`\`\`scss
// safer at scale: duplicates declarations, but each call site is independent
// and the output cost is easy to predict
@mixin button-base {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.btn-primary { @include button-base; background: #6366f1; }
\`\`\`

## Deep nesting and specificity bloat

Sass nesting is convenient for mirroring your markup structure, but every level of nesting becomes part of the compiled selector — and compiled selectors are what determine both **output size** and **specificity**.

\`\`\`scss
// looks tidy in source...
.card {
  .header {
    .title {
      .icon {
        &:hover {
          color: blue;
        }
      }
    }
  }
}
\`\`\`

\`\`\`css
/* ...but compiles to this, which is long AND has high specificity */
.card .header .title .icon:hover {
  color: blue;
}
\`\`\`

That selector now has a specificity of five class-level selectors plus a pseudo-class, meaning any later rule trying to override just the icon color needs an equal-or-higher-specificity selector — which typically pushes teams toward \`!important\` or copy-pasting the same deep chain elsewhere, both of which make the stylesheet harder to maintain, not easier. The nesting *saved* typing at the source level while *costing* both bytes and long-term flexibility in the output.

The generally accepted guidance (this predates Sass — it's the same advice for native CSS nesting) is to cap meaningful nesting at around **three levels**, and to prefer flatter, single-class selectors combined with a naming convention (BEM, or utility-driven markup) over deep structural nesting:

\`\`\`scss
// flatter: one real class per rule, still readable, low fixed specificity
.card-icon {
  &:hover {
    color: blue;
  }
}
\`\`\`

Worth noting honestly: **native CSS nesting** (standardized and shipping in every major browser now) has the *exact same* specificity behavior as Sass nesting — nesting was never a Sass-only performance problem, it's a CSS selector-composition problem that Sass happened to make very easy to fall into early, before native nesting existed. The advice to keep nesting shallow applies identically whether you're compiling Sass or writing native \`&\`-nested CSS directly.

## Splitting output: critical vs non-critical entry points

A single monolithic \`main.scss\` that \`@forward\`s the entire design system, compiled to one \`main.css\`, means every page pays the download and parse cost of every style in the app — including styles for a modal, a settings page, or a rarely-visited admin panel that most visitors never see.

The fix is architectural, not a Sass feature: maintain **multiple entry points**, each \`@use\`-ing only what a given page or route actually needs, and let your build tool emit separate CSS files.

\`\`\`scss
// critical.scss — above-the-fold layout, typography, nav; loaded on every page
@use "settings";
@use "layout";
@use "typography";
@use "nav";
\`\`\`

\`\`\`scss
// admin.scss — only loaded on admin routes
@use "settings";
@use "admin-table";
@use "admin-charts";
\`\`\`

Because \`@use\` deduplicates — a module already evaluated once in a compilation isn't re-run — sharing \`settings\` across both entry points doesn't double its cost within a single compile, but note that \`critical.scss\` and \`admin.scss\` are typically two **separate** \`sass\` compilation runs (two separate output files), so shared partials do get compiled into both outputs unless your bundler additionally does CSS-level deduplication across chunks. The Sass-level win is organizational: you get to reason about exactly what belongs to which bundle, and only load \`admin.css\` on the admin route rather than shipping it globally.

This split pays off most clearly with:
- **Critical CSS** for the initial viewport, inlined or loaded with highest priority.
- **Route-based splitting** in an SPA, where each route's bundle only pulls the partials it needs — most modern bundlers (Vite, webpack) will code-split CSS this way automatically if your JS entry points are already split and each imports its own \`.scss\`.
- **Rarely-used feature CSS** (a rich text editor, a chart library's overrides) kept out of the main bundle and loaded on demand.

## Auditing compiled output size

You don't have to guess — there are direct ways to measure what your Sass is actually producing:

| Tool | What it tells you |
|---|---|
| \`sass --no-source-map\` + \`du -h\` | Raw compiled file size, quick sanity check |
| PurgeCSS / \`@fullhuman/postcss-purgecss\` | Which compiled selectors are never matched by anything in your markup |
| \`cssstats\` (cssstats.com or the CLI) | Selector count, specificity distribution, unique color/font-size counts across compiled CSS |
| Chrome DevTools Coverage tab | Percentage of loaded CSS actually applied on the current page, live |
| \`webpack-bundle-analyzer\` / Vite's \`rollup-plugin-visualizer\` | Per-chunk CSS size when output is split across bundles |

Run one of these as part of a periodic audit (not necessarily every CI run) — a sudden jump in compiled size after adding what looked like "just a few more \`@extend\`s" or a new deeply nested component is usually the signal that one of the two patterns above has crept back in.

> **Key idea:** Sass source size and compiled CSS size are not the same thing — \`@extend\` and deep nesting both trade tidy-looking source for output costs (selector-list bloat and specificity bloat, respectively) that compound at scale, and splitting entry points by route or criticality is what actually controls how much CSS any single page has to pay for.`,
    },
    {
      name: "Sass vs Modern Native CSS — an Honest Comparison",
      minutes: 13,
      intro: "A fair, feature-by-feature comparison of what Sass still uniquely offers versus what native CSS has genuinely caught up on — and a practical rule for choosing between them today.",
      content: `## Why this comparison needs to be honest

When Sass first became popular in the early 2010s, the gap between it and plain CSS was enormous — CSS had no variables, no nesting, no math, no conditionals, and no module system. Every one of those was a Sass-only capability, which made "just use Sass" close to a default recommendation for any nontrivial project.

That gap has narrowed a lot since then, but not evenly. Some Sass features now have a native CSS equivalent that's genuinely as good or better (variables, nesting). Some have a *partial* native equivalent that covers most but not all cases (math, color). And one category — control flow and the module system — still has **no native CSS equivalent at all**, and isn't likely to any time soon. This lesson goes through each category honestly, then closes with a practical recommendation.

## The comparison table

| Feature | Sass | Native CSS | Verdict |
|---|---|---|---|
| Variables | \`$var: value;\` — compile-time, resolved once when Sass compiles | \`--var: value;\` (custom properties) — runtime, resolved by the browser, can change via JS/media queries/cascade | Different tools, not a strict upgrade either way — see below |
| Nesting | \`&\`-based nesting, has existed since Sass's start | Native CSS nesting, standardized and shipping in all major evergreen browsers | Near feature parity now |
| Math | \`sass:math\` module — \`math.div()\`, \`math.round()\`, arbitrary compile-time arithmetic | \`calc()\`, \`min()\`, \`max()\`, \`clamp()\` — runtime, can mix units impossible at compile time (like \`vw\` + \`rem\`) | Native covers most everyday cases; Sass math is still more general-purpose |
| Color functions | \`sass:color\` module — \`color.adjust()\`, \`color.scale()\`, \`color.mix()\`, evaluated at compile time | \`color-mix()\`, relative color syntax (\`oklch(from var(--c) l c h / 0.5)\`) — evaluated at runtime, can operate on colors not known until runtime (e.g. a custom property) | Native has closed most of the gap and can do things Sass structurally cannot (mix a runtime CSS variable) |
| Conditionals / loops | \`@if\`/\`@else\`, \`@each\`, \`@for\`, \`@while\` — full compile-time control flow | None. No native CSS equivalent exists. | Sass's biggest remaining unique advantage |
| Maps & data structures | \`sass:map\` module — \`$breakpoints: (sm: 640px, md: 768px, lg: 1024px)\`, iterable, queryable | None — custom properties can only ever hold a single value, not a structured collection | Sass-only |
| Functions | \`@function\` — reusable, named, compile-time computation with real return values | None (custom properties + \`calc()\` can approximate simple cases, but there's no user-defined function with arguments and branching) | Sass-only, though CSS's proposed \`@function\` rule is on a future standards track, not yet broadly shipped |
| Module system | \`@use\`/\`@forward\` — real namespacing, explicit configuration, one-time evaluation | Nothing comparable — \`@import\` in native CSS just concatenates stylesheets with no namespacing or scoping | Sass-only |

## Variables: compile-time vs runtime, in practice

This is the comparison people get wrong most often by treating it as "which one is better," when they actually solve different problems.

\`\`\`scss
// Sass — resolved once, at compile time
$spacing-unit: 8px;

.card {
  padding: $spacing-unit * 2;
}
\`\`\`

\`\`\`css
/* compiles to a fixed value — the browser never sees $spacing-unit */
.card {
  padding: 16px;
}
\`\`\`

\`\`\`css
/* custom properties — resolved live, in the browser, and can change */
:root {
  --spacing-unit: 8px;
}
.card {
  padding: calc(var(--spacing-unit) * 2);
}

@media (min-width: 768px) {
  :root { --spacing-unit: 12px; } /* .card padding updates automatically */
}
\`\`\`

Because custom properties are resolved at runtime, they can respond to media queries, be toggled by JavaScript (\`element.style.setProperty(...)\`), inherit down the DOM tree and be overridden per-component, and participate in the cascade like any other CSS value. A Sass \`$variable\` can do none of that — once compiled, it's just a literal value baked into the output, indistinguishable from having typed the number directly.

The honest takeaway: **custom properties are strictly more capable for anything that needs to vary at runtime** — theming, dark mode, JS-driven interaction, responsive value changes. Sass \`$variables\` are still useful for pure build-time bookkeeping — a config value used to *generate* other CSS (like a breakpoint value fed into a \`@media\` query, or a value used inside a compile-time loop) — the two aren't really competing for the same job. Most modern Sass codebases use both together: \`$variables\` for build-time constants and logic, custom properties for anything that needs to live in the cascade.

## Nesting: close to parity

Native CSS nesting adopted syntax deliberately close to Sass's, including \`&\`:

\`\`\`css
/* native CSS nesting — no preprocessor required */
.card {
  padding: 1rem;

  & .title {
    font-weight: 700;
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
\`\`\`

The remaining differences are small: native nesting requires the \`&\` (or a nesting selector) to be explicit in a couple of edge cases where Sass is more forgiving, and native nesting compiles selectors using \`:is()\` internally for combined contexts, which has minor specificity implications worth knowing about but rarely matters in practice. For the overwhelming majority of everyday nesting, they're interchangeable today — this is the category where native CSS has caught up the most completely.

## Math: \`calc()\` covers a lot, but not everything

\`clamp()\`, \`min()\`, and \`max()\` in particular removed a huge chunk of what used to require Sass — fluid typography that used to need a mixin with breakpoint math can now be one line:

\`\`\`css
h1 {
  font-size: clamp(1.5rem, 1rem + 2vw, 3rem);
}
\`\`\`

What native math still can't do that Sass's \`sass:math\` module can:
- Arbitrary compile-time computation with no runtime cost at all (useful when generating a large number of fixed values, like a full spacing scale).
- Operations across a loop, producing many rules from one calculation (see below).
- A few operations \`calc()\` simply doesn't support, like rounding to an arbitrary precision or modulo in older browser support windows (native CSS gained \`round()\`, \`mod()\`, and \`rem()\` more recently, narrowing this further).

## Color: native has genuinely closed most of the gap

\`color-mix()\` and relative color syntax are the two biggest recent native CSS wins, because — unlike Sass color functions — they can operate on a color that isn't known until runtime:

\`\`\`css
/* mix a CSS custom property with white, at runtime — Sass structurally cannot do this,
   because Sass never sees the resolved value of a custom property at compile time */
.button:hover {
  background: color-mix(in oklch, var(--brand-color) 80%, white);
}
\`\`\`

\`\`\`scss
// Sass color.mix() — only works on colors known at compile time
@use "sass:color";
$hover-color: color.mix(white, $brand-color, 20%);
\`\`\`

If your brand color is a fixed Sass variable, both approaches work equally well. If your brand color is themeable at runtime (a very common requirement now — user-selectable themes, white-labeling), only the native approach can even express the operation, because Sass has already finished running before the browser knows what \`--brand-color\` actually is. This is a case where native CSS isn't just "caught up," it's doing something Sass cannot do at all.

## Conditionals, loops, and maps: still Sass's clearest advantage

This is the one category where the gap hasn't narrowed, and isn't expected to any time soon. Generating a whole spacing scale or color palette from a map, with a loop, has no native CSS equivalent:

\`\`\`scss
@use "sass:map";

$spacing: (
  xs: 4px,
  sm: 8px,
  md: 16px,
  lg: 24px,
  xl: 32px,
);

@each $name, $value in $spacing {
  .p-#{$name} { padding: $value; }
  .m-#{$name} { margin: $value; }
}
\`\`\`

That one \`@each\` loop generates ten rules. There is no way to do this in native CSS — no loop construct, no way to iterate a structured collection and emit rules per entry. The closest native approximations (a large number of manually written custom properties, or generating the CSS at build time with a JS tool instead of Sass) either don't scale the same way or just move the logic into a different preprocessor-like tool, which somewhat proves the point rather than refuting it.

Combined with real \`@function\`s (named, reusable, with parameters, conditionals, and return values) and the \`@use\`/\`@forward\` module system (real namespacing, one-time evaluation, explicit \`with (...)\` configuration — none of which \`@import\`-based native CSS concatenation offers), this is the category to weigh most heavily when deciding whether a project needs Sass at all.

## The practical recommendation

**Sass genuinely still earns its place when:**
- You're building a **design system or component library** that needs to *generate* CSS from data — spacing scales, color palettes, breakpoint maps, utility class generators — rather than just write it by hand.
- You need real reusable **functions** with branching logic (a fluid-type-scale calculator, a contrast-ratio checker, a z-index registry function) that native CSS has no way to express.
- The project is **large enough** that the \`@use\`/\`@forward\` module system's namespacing and explicit configuration meaningfully reduce collision risk and improve discoverability across many contributors.
- You already have vendor/legacy Sass and the migration cost outweighs the benefit of dropping it (a completely valid, non-technical reason).

**Native CSS alone is now genuinely enough when:**
- The project is **small to medium**, with a handful of contributors and a modest number of components.
- Theming and dynamic values are a bigger need than compile-time computation — custom properties, \`color-mix()\`, and relative color syntax directly solve runtime theming in a way Sass never could.
- Fluid, responsive sizing is the main "math" need — \`clamp()\`/\`min()\`/\`max()\` cover the vast majority of what used to require a Sass mixin.
- Nesting was the main reason Sass was adopted in the first place — native nesting now covers that need directly, with zero build step.

The honest summary is that native CSS absorbed the *convenience* features (variables, nesting, basic math, basic color manipulation) almost completely, while Sass kept the *programming language* features (conditionals, loops, maps, real functions, a real module system) that CSS was never designed to have and still doesn't. The right question for a new project isn't "is Sass still relevant" in the abstract — it's "does this project need to generate CSS from logic and data," and for a growing number of projects, honestly, the answer is no.

> **Key idea:** Native CSS has closed almost all of the gap on variables, nesting, math, and color — but conditionals, loops, maps, real functions, and a true module system remain Sass-exclusive, so the decision to reach for Sass today should hinge specifically on whether a project needs to generate CSS from logic, not on habit.`,
    },
  ],
}
