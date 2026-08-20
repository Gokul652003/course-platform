import type { Module } from "../types"

export const scssModule3: Module = {
  id: 3,
  title: "Partials & the Module System",
  status: "upcoming",
  lessons: [
    {
      name: "Partials & Splitting Your Styles",
      minutes: 11,
      intro: "Learn what a Sass partial is, why real projects split styles across many small files, and see a realistic folder layout.",
      content: `## The problem: one giant stylesheet

Every non-trivial project eventually outgrows a single \`styles.css\` file. Variables, component rules, layout helpers, and one-off overrides all pile into the same document, and finding "the rule that controls the button's hover color" turns into a scroll-and-search exercise. Plain CSS has had \`@import\` for this since the beginning, but browser-native \`@import\` issues a **separate network request per file** at runtime, which is a real performance cost — so for years, teams avoided splitting CSS into many files even when they wanted to.

Sass solves this differently. Its \`@import\` (and its modern replacement, \`@use\`, covered in the next lesson) is a **build-time** operation: the Sass compiler reads every file you reference and inlines everything into one compiled CSS output before it ever reaches a browser. Splitting your source into ten files costs nothing at runtime — the browser still only ever downloads one stylesheet. This is what makes it practical to split Sass aggressively.

## What a partial is

A **partial** is a Sass file meant to be loaded *into* another file, not compiled on its own. You mark a file as a partial by prefixing its filename with an underscore:

\`\`\`scss
// _variables.scss  <- this is a partial
$primary-color: #3b82f6;
$spacing-unit: 8px;
\`\`\`

That leading underscore tells the Sass compiler: "don't generate a standalone \`_variables.css\` output file for this — it only exists to be loaded by other files." If you're using the Sass CLI or a build tool configured to compile every \`.scss\` file it finds in a directory, partials are skipped automatically. Without the underscore, you'd end up with a stray, useless \`variables.css\` sitting next to your real stylesheet for every single file you split out — dozens of orphaned CSS files with no \`<link>\` tag pointing at them.

The underscore is a naming convention, not a location convention — a partial can live anywhere in your source tree, and non-partial files can still load it from any relative path.

### Loading a partial

You load a partial with \`@use\` (the modern syntax, detailed in the next lesson) or the older \`@import\`, and in both cases you **omit the underscore and the file extension** when referencing it:

\`\`\`scss
// styles.scss
@use "variables";   // loads _variables.scss, NOT variables.scss
\`\`\`

Sass looks for a file named \`_variables.scss\` (or \`_variables.sass\`) in the referenced location. If no partial with that name exists, it falls back to looking for a non-partial file named \`variables.scss\`. In practice, almost every file you split out for internal reuse should be a partial — the underscore is cheap to type and it accurately communicates "this file is a building block, not a page."

## Why split styles across files at all

Splitting isn't just tidiness for its own sake — each category of style tends to change for a different reason and at a different rate, and keeping them apart pays off in a few concrete ways:

- **Findability.** "Where do I change the primary color?" has one obvious answer (\`_variables.scss\`) instead of requiring a text search through a 3,000-line file.
- **Reduced merge conflicts.** Two developers editing the button component and the grid layout in the same sprint touch different files instead of adjacent lines in one file, so Git merges cleanly far more often.
- **Clear ownership boundaries.** A component's partial can be reviewed, tested, and even deleted in isolation without scrolling past unrelated rules to find its edges.
- **Encourages small, focused mixins and functions.** When a file's whole purpose is "utilities for spacing," you naturally keep it about spacing — sprawl gets much more obvious once it's isolated in its own file.

Common categories teams split into their own partials include:

| Category | Typical filename | Contains |
|---|---|---|
| Design tokens | \`_variables.scss\` | Colors, spacing scale, font sizes, breakpoints |
| Reusable logic | \`_mixins.scss\`, \`_functions.scss\` | \`@mixin\` and \`@function\` definitions |
| Base/reset | \`_reset.scss\`, \`_base.scss\` | Element defaults, box-sizing, typography baseline |
| Layout | \`_grid.scss\`, \`_header.scss\` | Structural, page-level rules |
| Components | \`_button.scss\`, \`_card.scss\`, \`_modal.scss\` | One file per UI component |
| Utilities | \`_utilities.scss\` | Small single-purpose helper classes |
| Vendor overrides | \`_vendor.scss\` | Tweaks to third-party CSS |

## A realistic file structure

A widely used convention (a lighter version of the older "7-1 pattern") looks something like this for a mid-sized app:

\`\`\`
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _functions.scss
├── base/
│   ├── _reset.scss
│   └── _typography.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _modal.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _grid.scss
└── main.scss
\`\`\`

\`main.scss\` is the one file that is *not* a partial — it's the actual entry point your build tool compiles, and its whole job is to pull every partial together in the right order:

\`\`\`scss
// main.scss
@use "abstracts/variables";
@use "abstracts/mixins";
@use "base/reset";
@use "base/typography";
@use "layout/header";
@use "layout/footer";
@use "layout/grid";
@use "components/button";
@use "components/card";
@use "components/modal";
\`\`\`

Notice the paths include subfolders (\`abstracts/variables\`) but still drop the underscore and extension — that rule applies no matter how deeply nested the partial is. Order matters here in one specific way: a partial has to be \`@use\`-d *before* another partial that depends on its members (variables, mixins, functions), because \`@use\` makes each file's own members visible only to files that load it directly, which the next lesson covers in depth.

### Why not just use folders without partials?

You technically could split into folders using plain, non-underscored \`.scss\` files, but then every single one of them compiles to its own standalone CSS file — you'd need a build step to concatenate them back together yourself, which is exactly the problem the underscore convention exists to solve for free. The underscore is a one-character signal that says "this file's output doesn't matter, only its contents do," and it's the reason Sass partials feel closer to importing a module in a programming language than to linking a separate stylesheet.

> **Key idea:** A partial (\`_name.scss\`) is a Sass file meant only to be loaded by others — the underscore stops it from being compiled to its own standalone CSS file — and splitting styles into partials by responsibility (tokens, mixins, components, layout) keeps large stylesheets findable and mergeable without costing anything at runtime, since Sass inlines everything into one compiled file at build time.`,
    },
    {
      name: "@use and @forward (the Modern Module System)",
      minutes: 13,
      intro: "Load partials with namespaced @use, and re-export an entire design system through one entry point with @forward.",
      content: `## @use: loading a partial with a namespace

\`@use\` is the modern way to load one Sass file's members (variables, mixins, functions) into another. Where the legacy \`@import\` dumped everything into one shared global namespace (the subject of the next lesson), \`@use\` loads a file's members behind a **namespace** — a prefix you use every time you reference something from it.

\`\`\`scss
// _colors.scss
$primary: #3b82f6;
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
  color: white;

  &:hover {
    background: colors.tint(colors.$primary, 20%);
  }
}
\`\`\`

By default, the namespace is derived automatically from the filename — \`"colors"\` here, because the file (once you strip the underscore and extension) is named \`colors\`. Every variable, mixin, and function defined in \`_colors.scss\` must now be accessed through that \`colors.\` prefix: \`colors.$primary\`, not a bare \`$primary\`. This is the single biggest practical difference from \`@import\` — there is no risk of a variable named \`$primary\` in one partial silently colliding with an unrelated \`$primary\` in another, because each file's members live in their own namespace.

### Choosing a custom namespace with \`as\`

Auto-derived namespaces get unwieldy for files with long or nested names — \`@use "abstracts/design-tokens/colors"\` would default to the namespace \`colors\` (Sass uses only the final path segment), but sometimes you want something shorter or something that avoids a clash between two files that happen to share a final segment. Use \`as\` to rename the namespace explicitly:

\`\`\`scss
@use "abstracts/design-tokens/colors" as c;

.button {
  background: c.$primary;
}
\`\`\`

You can also load a module with **no** namespace at all using \`as *\`, which makes its members accessible unprefixed — this is occasionally useful for a file you load in exactly one place, but it reintroduces the collision risk \`@use\` normally prevents, so reach for it sparingly.

\`\`\`scss
@use "abstracts/mixins" as *;

.card {
  @include flex-center; // no namespace needed with \`as *\`
}
\`\`\`

### @use only loads a file once

However many times a given partial is \`@use\`-d across your whole project — directly or indirectly through other files that also \`@use\` it — Sass only ever evaluates it **once** and caches the result. This matters in practice: if both \`_button.scss\` and \`_card.scss\` \`@use "colors"\`, and \`main.scss\` in turn \`@use\`-s both of them, \`_colors.scss\` still only runs once. There's no risk of duplicate CSS output from loading the same dependency through multiple paths — a real, common problem with the old \`@import\` that the next lesson covers.

## @forward: re-exporting a partial's members

\`@use\` alone only makes a module's members visible to the *specific file* that wrote the \`@use\` statement — it is not transitive. If \`main.scss\` does \`@use "button"\`, and \`_button.scss\` itself did \`@use "colors"\`, \`main.scss\` does **not** automatically gain access to \`colors.$primary\` — it would need its own separate \`@use "colors"\` line.

That's normally exactly what you want (explicit dependencies, no hidden coupling), but it becomes inconvenient for one common case: building a single **entry-point file** that gathers an entire design system so consumers only need one \`@use\` line instead of ten. That's what \`@forward\` is for — it re-exports another module's members through the file that forwards it, without needing a separate \`@use\`.

\`\`\`scss
// _index.scss  (the design system's single entry point)
@forward "abstracts/variables";
@forward "abstracts/mixins";
@forward "abstracts/functions";
@forward "base/reset";
@forward "components/button";
@forward "components/card";
\`\`\`

Now any file elsewhere in the project can reach the entire system with one line:

\`\`\`scss
// page.scss
@use "design-system" as ds;

.hero {
  padding: ds.$spacing-lg;
  color: ds.$primary;
}
\`\`\`

Every variable, mixin, and function forwarded by \`_index.scss\` — regardless of which of its own partials originally defined it — is now available under the single \`ds.\` namespace. This is the pattern behind most well-organized Sass component libraries: internal files stay small and focused, and one \`_index.scss\` (sometimes named \`_forward.scss\` or just placed as \`styles/index.scss\`) is the only file the rest of the app ever needs to know about.

### @forward also emits any CSS the module generates

If a forwarded file contains actual CSS rules (not just variables/mixins/functions — e.g. \`base/reset\` above), that CSS is included in the compiled output wherever the *forwarding* file is eventually \`@use\`-d, following the normal load-once rule. \`@forward\` is purely about re-exporting availability of members and rules through a chain of files — it doesn't change when or whether the underlying CSS is emitted.

### Configuring forwarded modules

Design-token files are often written with \`!default\` values so consumers can override them — a pattern borrowed from how Sass has always supported optional variable overrides:

\`\`\`scss
// _variables.scss
$primary: #3b82f6 !default;
$border-radius: 4px !default;
\`\`\`

\`@use\` and \`@forward\` can both pass a \`with (...)\` clause that overrides any \`!default\` variable in the loaded module, **before** that module's own code runs:

\`\`\`scss
// main.scss — override the design system's defaults for this project
@use "design-system" with (
  $primary: #7c3aed,
  $border-radius: 8px
);
\`\`\`

This is what makes a shared Sass "design system" partial genuinely reusable across multiple projects or themes rather than hardcoded to one brand — the library author marks its tunable values \`!default\`, and each consumer configures only the ones it wants to change. \`@forward\` supports the same mechanism when you want an entry-point file to expose configuration further upstream, using \`@forward "module" with (...)\` — with one restriction: only variables the forwarded file itself marked \`!default\` are configurable this way, and \`with\` can only be applied to a module the very first time it's loaded anywhere in the project.

## @use vs @forward vs plain rules, at a glance

| | Purpose | Namespaces members? | Transitive to further consumers? |
|---|---|---|---|
| \`@use "x"\` | Consume a module's members yourself | Yes (\`x.$var\`) | No — only visible in this file |
| \`@forward "x"\` | Re-export a module's members through this file | No extra namespace added — passes through | Yes — visible to whoever \`@use\`s this file |
| \`@use "x" as *\` | Consume without a prefix | No | No |
| \`@forward "x" show $y\` | Re-export, but only specific members | No extra namespace added | Yes, limited to \`$y\` |

\`@forward\` also supports \`show\` and \`hide\` clauses to control exactly which members pass through, which is worth reaching for once an entry-point file starts forwarding internal helper mixins you never intended consumers to use directly.

> **Key idea:** \`@use\` loads a module behind an explicit namespace so members never collide and never re-run twice, while \`@forward\` re-exports a module's members through whichever file forwards it — combine them to build a single design-system entry point that the rest of the app consumes with one \`@use\` line, optionally configured with \`with (...)\` overrides of any \`!default\` values.`,
    },
    {
      name: "Why @import Is Deprecated",
      minutes: 10,
      intro: "Understand what the old global @import did wrong, why Sass is removing it, and how to migrate old code to @use.",
      content: `## What the old @import actually did

Before \`@use\` and \`@forward\` existed (they landed in Dart Sass 1.23, in late 2019), Sass only had \`@import\` — syntactically similar to CSS's own \`@import\`, but resolved entirely at build time. It's important to understand what it did, because plenty of Sass code still in production — and plenty of tutorials still floating around online — was written before the module system existed.

\`\`\`scss
// _variables.scss
$primary: #3b82f6;

// _buttons.scss
@import "variables";

.button {
  background: $primary; // bare, unnamespaced — works, but why?
}
\`\`\`

That worked, but it worked by doing something much blunter than \`@use\`: \`@import\` copy-pasted the entire contents of \`_variables.scss\` directly into whatever file imported it, dumping every variable, mixin, and function into **one single global scope shared by the entire project**. There was no namespace, no \`variables.$primary\` — every imported file's members became bare, global names available everywhere, forever, for the rest of the compilation.

## The three problems this caused

**1. No namespacing — naming collisions.** If \`_theme-a.scss\` and \`_theme-b.scss\` both defined \`$primary\`, whichever was \`@import\`-ed last silently won, with no error and no warning. On a large team, or with any third-party Sass library, this was a constant, quiet source of bugs — you couldn't even tell where a given variable's *value* actually came from just by reading the file that used it.

**2. Everything in one global scope.** Because \`@import\` had no concept of "this file's own members," there was no way to keep an internal helper mixin private to the file that defined it. Every mixin and function in every imported partial was reachable from anywhere else in the project — intentionally or not — which made it impossible to tell, just by reading a file, which of the bare names it used were genuinely meant to be public API versus internal implementation detail.

**3. Files could be loaded multiple times, duplicating output.** \`@import\` re-ran a file's contents in full every single time it was imported — it had no load-once caching. If both \`_button.scss\` and \`_card.scss\` imported \`_mixins.scss\`, and a top-level file imported both \`_button.scss\` and \`_card.scss\`, \`_mixins.scss\` effectively ran twice. For a file containing only variable and mixin *definitions* that's mostly wasted compile time, but for a partial that also emitted actual CSS rules, this meant **duplicate rules in the compiled output** — real, shipped bytes of repeated CSS that developers had to work around by carefully tracking which files had already been imported anywhere in the chain.

## Why the Sass team is removing it

The Sass core team documented these exact problems as the motivation for the new module system, and — notably — committed to fully removing \`@import\` from the language rather than leaving it as a permanent legacy option. As of Dart Sass 1.80 (2024), using \`@import\` emits a deprecation warning, and the Sass team's published plan is to make it a hard error in a future major version. The reasoning is that a "soft deprecation that lives forever" tends to mean a language carries two competing systems permanently, with newcomers unsure which one to learn — better to give teams a long, clearly-signposted runway to migrate, then actually finish the removal.

This mirrors a broader trend across the CSS ecosystem: native CSS itself only ever had one flat global scope for decades (every class name, every custom property, potentially visible and overridable from anywhere), and newer native features like \`@scope\` and \`@layer\` exist specifically to claw back some of the encapsulation that a flat global namespace gives up. Sass's move from \`@import\` to \`@use\`/\`@forward\` is the same lesson arriving a few years earlier, inside the preprocessor rather than the browser.

## Migrating: a concrete before/after

Before — global \`@import\`, bare names, no idea where \`$primary\` is defined without checking every imported file:

\`\`\`scss
// OLD
@import "variables";
@import "mixins";

.card {
  padding: $spacing-md;
  @include flex-center;
  color: $primary;
}
\`\`\`

After — explicit \`@use\`, namespaced members, unambiguous at the call site:

\`\`\`scss
// NEW
@use "variables" as vars;
@use "mixins" as mix;

.card {
  padding: vars.$spacing-md;
  @include mix.flex-center;
  color: vars.$primary;
}
\`\`\`

The migration is mechanical in most codebases: replace each \`@import "x";\` with \`@use "x" as name;\`, then prefix every bare variable, mixin call, and function call that came from that file with \`name.\`. Dart Sass ships an official migration tool, the **Sass migrator** (\`sass-migrator module\`), that automates exactly this rewrite across an entire project, including picking sensible default namespaces and adding the right prefixes throughout.

### A quick comparison

| | \`@import\` (deprecated) | \`@use\` (current) |
|---|---|---|
| Namespacing | None — everything global | Required, unless \`as *\` |
| Repeated loads | Re-runs every time, can duplicate CSS output | Runs once, cached |
| Private members | Not possible | Yes — anything not \`@forward\`-ed stays file-local |
| Configuring defaults | Global variable reassignment before import | \`with (...)\` clause, scoped to that load |
| Status | Deprecated since Dart Sass 1.80, being removed | The recommended default for all new code |

## When you'll still see @import, and how to read it

You'll still run into \`@import\` in the wild in a few predictable places: older open-source Sass libraries that haven't migrated, tutorials and Stack Overflow answers written before 2020, legacy internal codebases with years of accumulated Sass nobody has had time to touch, and CSS's own native \`@import url(...)\` syntax — which is a completely different, browser-runtime feature that happens to share a keyword with Sass's deprecated one and is not being removed.

When reading old Sass \`@import\`-based code, the main adjustment is mental: every bare \`$variable\`, \`@mixin\` call, or function call could be coming from **any** file imported anywhere earlier in the chain, not just the current file. There's no namespace to follow, so tracing a variable's definition usually means searching the whole project for where it's first assigned, rather than jumping straight to one namespaced module. If you're maintaining such a codebase rather than just reading it, migrating to \`@use\`/\`@forward\` — ideally with the Sass migrator rather than by hand — pays for itself quickly, since it turns that same search into a one-line jump to the module's own file.

> **Key idea:** \`@import\` dumped every loaded file's members into one shared global scope with no namespacing and no load-once guarantee, which caused silent naming collisions and duplicated CSS output at scale — \`@use\`/\`@forward\` fix all three problems, which is why Sass deprecated \`@import\` and is actively removing it; new code should never use it, and old code should be migrated with the official Sass migrator.`,
    },
  ],
}
