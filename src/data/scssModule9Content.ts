import type { Module } from "../types"

export const scssModule9: Module = {
  id: 9,
  title: "Architecture & Real-World Patterns",
  status: "upcoming",
  lessons: [
    {
      name: "Organizing a Large Sass Codebase — the 7-1 Pattern",
      minutes: 14,
      intro: "Learn the classic 7-1 folder architecture for scaling Sass across a real project, and how @forward is what actually makes it hold together.",
      content: `## The problem 7-1 solves

A single \`styles.scss\` file works fine for a weekend project. It stops working somewhere around month three of a real one: the file balloons past a thousand lines, nobody remembers where the button styles live, two people add a \`.card\` rule in different places, and every merge conflict touches the same file. **7-1** is a folder architecture for Sass projects, popularized by Hugo Giraudel (Kitty Giraudel), that gives every kind of style a single, predictable home so a codebase can grow without turning into a junk drawer.

The name comes from its shape: **7** folders holding partials, **1** main file that stitches them together.

\`\`\`
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _placeholders.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _animations.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _modal.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _grid.scss
│   └── _sidebar.scss
├── pages/
│   ├── _home.scss
│   └── _pricing.scss
├── themes/
│   ├── _default.scss
│   └── _admin.scss
├── vendors/
│   └── _normalize.scss
└── main.scss
\`\`\`

Nothing here is Sass-specific magic — it's a **naming and filing convention**. What makes it actually work as Sass rather than just a folder of CSS files is the module system from earlier in this course: every partial is written to be pulled in with \`@use\`/\`@forward\`, not copy-pasted or globally imported.

## What belongs in each folder

### \`abstracts/\` — nothing that outputs CSS

This folder holds Sass tooling: variables, functions, mixins, and placeholder selectors. Critically, **nothing in \`abstracts/\` should compile to a single line of CSS on its own** — it's all definitions, consumed elsewhere.

\`\`\`scss
// abstracts/_variables.scss
$color-primary: #4f46e5;
$color-danger: #dc2626;
$spacing-unit: 8px;
$breakpoint-md: 768px;

// abstracts/_mixins.scss
@mixin flex-center($gap: 0) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $gap;
}

// abstracts/_functions.scss
@function rem($px, $base: 16px) {
  @return math.div($px, $base) * 1rem;
}
\`\`\`

If a file in \`abstracts/\` ever produces actual output CSS when compiled alone, that's a sign something belongs in \`base/\` or \`components/\` instead.

### \`base/\` — project-wide defaults, no classes

Resets, element-level typography defaults, \`@font-face\`, global \`@keyframes\`. This is styling for bare HTML tags (\`body\`, \`h1\`, \`a\`, \`ul\`) before any component-specific class gets involved.

\`\`\`scss
// base/_typography.scss
body {
  font-family: "Inter", system-ui, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

h1, h2, h3 {
  font-weight: 700;
  line-height: 1.2;
}
\`\`\`

### \`components/\` — one file per reusable UI piece

Buttons, cards, modals, badges, form controls — anything reusable across multiple pages gets its own partial here, named after the component. This is usually the largest, fastest-growing folder in a real project, which is exactly why it needs one-file-per-thing discipline rather than a single \`_components.scss\` grab-bag.

\`\`\`scss
// components/_button.scss
@use "../abstracts/variables" as v;
@use "../abstracts/mixins" as m;

.btn {
  @include m.flex-center(8px);
  padding: 0.5em 1.25em;
  border-radius: 6px;
  background: v.$color-primary;
  color: white;

  &--danger {
    background: v.$color-danger;
  }
}
\`\`\`

### \`layout/\` — the macro structure of the page

Header, footer, main grid, sidebar, navigation shell — the pieces that arrange the page rather than decorate a widget. The line between \`layout/\` and \`components/\` is judgment, not a strict rule: a \`Header\` that only ever appears once per page and defines page structure is layout; a \`Card\` that repeats dozens of times inside that structure is a component.

### \`pages/\` — styles specific to a single page or route

If the pricing page has a weird one-off hero layout that nothing else uses, it lives in \`pages/_pricing.scss\`, scoped under a page-level class or route wrapper, rather than polluting a shared component file with a special case.

\`\`\`scss
// pages/_pricing.scss
.page-pricing {
  .hero {
    padding-block: 6rem;
    text-align: center;
  }
}
\`\`\`

### \`themes/\` — visual variants layered on top of everything else

Multi-theme or white-label projects (dark mode, an admin skin, a client-specific brand) put their overrides here, so a theme can be swapped without touching component logic. In a modern codebase this folder increasingly hands off to CSS custom properties for the runtime-switchable parts (see the native-CSS comparison below), while Sass maps still drive anything that needs to be known at compile time.

### \`vendors/\` — third-party CSS you don't own

Copies or \`@forward\`-wrapped entry points for things like Normalize.css or a date-picker library's base styles. Keeping these separate makes it obvious, at a glance, which rules in the codebase are yours to edit and which came from someone else's package.

## Wiring it together with \`main.scss\`

The single entry point forwards every folder in a deliberate order — abstracts first (nothing else can compile without them), vendors and base next, then components, layout, pages, and themes last so later rules can build on earlier ones.

\`\`\`scss
// main.scss
@forward "abstracts/variables";
@forward "abstracts/functions";
@forward "abstracts/mixins";

@forward "vendors/normalize";
@forward "base/reset";
@forward "base/typography";

@forward "components/button";
@forward "components/card";
@forward "components/modal";

@forward "layout/header";
@forward "layout/footer";
@forward "layout/grid";

@forward "pages/home";
@forward "pages/pricing";

@forward "themes/default";
\`\`\`

This is the payoff of \`@forward\`, covered earlier in this course: each folder gets its own tiny "barrel" index (or \`main.scss\` forwards the partials directly, as above), and the build tool only ever needs to \`@use "main"\` once, from one place, to pull in the whole compiled stylesheet. Compare that to the legacy \`@import\`-based version of this same pattern, which was the original way 7-1 was written before Dart Sass had a module system:

\`\`\`scss
// the old, deprecated way — global @import, no encapsulation
@import "abstracts/variables";
@import "abstracts/mixins";
@import "components/button";
// every variable and mixin above is now a global, for every file after this line
\`\`\`

With \`@import\`, every name from every file lands in one shared global namespace — a \`$color-primary\` defined in \`abstracts/_variables.scss\` and a same-named variable accidentally redefined in \`components/_card.scss\` silently clash, and the compiler gives you no warning about which one wins. With \`@use\`/\`@forward\`, each partial's names stay namespaced (or explicitly re-exported), so a collision like that becomes a visible \`v.$color-primary\` vs \`card.$color-primary\`, not a silent bug. This is precisely why 7-1 is far more maintainable today than it was in the \`@import\` era — the folder structure organizes files for *humans*, and the module system organizes names for the *compiler*, and you need both.

## When 7-1 is (and isn't) the right amount of structure

| Project size | Recommendation |
|---|---|
| Small landing page, a few components | Full 7-1 is overkill — 2-3 files (\`_variables\`, \`_components\`, \`main\`) is enough |
| Mid-size app, multiple pages, shared design system | 7-1 earns its keep — predictable homes for everything, scales with the team |
| Component-framework app (React/Vue), styles live next to components | A modified 7-1 — keep \`abstracts/\`, \`base/\`, \`themes/\` global, but let \`components/\` styles live beside their component files instead of centralized (more on this in the next lesson) |

7-1 isn't a law, it's a starting template — most real teams trim folders they don't need (a project with no theming drops \`themes/\`, a project with no third-party CSS drops \`vendors/\`) rather than keeping empty folders out of dogma.

> **Key idea:** 7-1 gives every category of style a predictable folder, but it only stays maintainable at scale because \`@use\`/\`@forward\` namespaces what each partial exports — the folder structure organizes files for humans, the module system organizes names for the compiler.`,
    },
    {
      name: "Component-Driven Sass in a Modern Frontend",
      minutes: 13,
      intro: "See how Sass fits into React/Vue-style component architectures — one .module.scss per component, local scoping, and where centralized 7-1 still applies.",
      content: `## Two different mental models for "where do styles live"

7-1, from the last lesson, assumes styles are organized by **category** — all buttons together, all layout together — independent of which page or component uses them. Component-based frontend frameworks (React, Vue, Svelte, Angular) usually flip that: styles are organized by **component**, living right next to the \`.tsx\`/\`.vue\` file they style.

\`\`\`
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.scss
│   │   └── index.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.module.scss
│   │   └── index.ts
│   └── Modal/
│       ├── Modal.tsx
│       ├── Modal.module.scss
│       └── index.ts
├── styles/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _tokens.scss
└── main.tsx
\`\`\`

Neither model is "more correct" — they solve different problems. 7-1 optimizes for **browsing by category** ("where are all the buttons styled"); co-location optimizes for **deleting a component cleanly** (delete the \`Button/\` folder, its styles go with it — no orphaned CSS left behind in a shared file). Most real component-framework projects land on a hybrid: global tokens, mixins, and resets stay centralized (a trimmed-down \`abstracts/\` + \`base/\`), while everything component-specific is co-located.

## CSS Modules: local scoping for free

The \`.module.scss\` extension is a convention understood by bundlers (Vite, webpack, Next.js) called **CSS Modules**. Any class name written in a \`.module.scss\` file gets automatically rewritten to a unique, scoped name at build time — so \`.card\` in \`Card.module.scss\` never collides with an unrelated \`.card\` in some other component's file, even if both literally write the same class name.

\`\`\`scss
// Card.module.scss
.card {
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &.featured {
    border: 2px solid #4f46e5;
  }
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
}
\`\`\`

\`\`\`tsx
// Card.tsx
import styles from "./Card.module.scss"

function Card({ featured, title }: { featured?: boolean; title: string }) {
  return (
    <div className={\`\${styles.card} \${featured ? styles.featured : ""}\`}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  )
}
\`\`\`

At build time, \`.card\` might become something like \`.Card_card__a3f9x\` in the compiled CSS, and \`styles.card\` in the JS resolves to that exact generated string. You get the ergonomics of writing a plain, short class name, with none of the global-namespace collision risk that plain CSS classes have always had.

## Why pair Sass with CSS Modules instead of plain CSS

CSS Modules solve **scoping** — Sass solves everything else. They're complementary, not competing:

| Concern | CSS Modules alone | + Sass |
|---|---|---|
| Class name collisions across components | Solved | Solved |
| Reusable logic (mixins, functions) | Not addressed | \`@include\`, \`@function\` |
| Shared design tokens (colors, spacing) | Copy-paste or CSS custom properties only | \`@use\` a shared \`_tokens.scss\`, real values at compile time |
| Nesting for pseudo-classes / states | Not addressed | Native to Sass |
| Conditional logic (variants, responsive maps) | Not addressed | \`@if\`, \`@each\`, maps |

A component's \`.module.scss\` file typically \`@use\`s the project's shared abstracts, then writes component-local rules using Sass nesting and logic:

\`\`\`scss
// Modal.module.scss
@use "../../styles/variables" as v;
@use "../../styles/mixins" as m;

.overlay {
  @include m.flex-center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.panel {
  background: white;
  border-radius: 12px;
  padding: v.$spacing-lg;
  max-width: 480px;

  &:focus-visible {
    outline: 2px solid v.$color-primary;
  }
}

$sizes: (
  sm: 320px,
  md: 480px,
  lg: 640px,
);

@each $name, $width in $sizes {
  .panel--#{$name} {
    max-width: $width;
  }
}
\`\`\`

That last block — generating \`.panel--sm\`, \`.panel--md\`, \`.panel--lg\` from a Sass map with \`@each\` — is a good example of logic that CSS Modules alone can't give you; the scoping mechanism only rewrites names, it has no opinion on how many rules exist or where they came from.

## A practical example: a Button with variants

Put together, a typical component pairs a small, typed prop API in the framework with a Sass map driving the variant styles:

\`\`\`scss
// Button.module.scss
@use "../../styles/variables" as v;

$variants: (
  primary: v.$color-primary,
  danger: v.$color-danger,
  neutral: #6b7280,
);

.btn {
  padding: 0.5em 1.25em;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

@each $name, $color in $variants {
  .btn--#{$name} {
    background: $color;
    color: white;

    &:hover {
      background: color.adjust($color, $lightness: -8%);
    }
  }
}
\`\`\`

\`\`\`tsx
// Button.tsx
import styles from "./Button.module.scss"

type Variant = "primary" | "danger" | "neutral"

function Button({ variant = "primary", children }: { variant?: Variant; children: React.ReactNode }) {
  return <button className={\`\${styles.btn} \${styles[\`btn--\${variant}\`]}\`}>{children}</button>
}
\`\`\`

The TypeScript \`Variant\` union and the Sass \`$variants\` map are two separate sources of truth here — worth flagging honestly rather than glossing over. If someone adds \`"success"\` to the Sass map but forgets to update the TS union (or vice versa), nothing catches it automatically; some teams generate one from the other at build time to close that gap, but plenty of production codebases simply keep both in sync by hand and rely on visual QA or a shared constants file imported by both sides.

## Where native CSS narrows the gap

Modern CSS nesting (native, no preprocessor needed) plus CSS custom properties can reproduce a fair amount of what a \`.module.scss\` file above is doing — nested selectors, and swapping a variable per variant with a custom property set inline or via a data attribute. What native CSS still doesn't give you inside a plain \`.module.css\` file is the \`@each\`-over-a-map code generation, real compile-time math, or a shared \`@use\`d function/mixin library — those stay a Sass (or JS-in-CSS-in-JS) advantage. For a component with two or three simple variants, plain CSS custom properties are often genuinely simpler than reaching for a Sass map; the map starts paying for itself once a component has enough variants, or enough shared logic across components, that hand-writing each variant's rule becomes repetitive.

> **Key idea:** CSS Modules and Sass solve different problems — Modules give you automatic per-component class scoping, Sass gives you the logic (mixins, functions, maps, control flow) to generate and share styles — and co-locating a \`.module.scss\` next to its component combines both without needing the centralized 7-1 folder tree for component-specific styles.`,
    },
    {
      name: "Sass with Design Systems & Build Tools",
      minutes: 13,
      intro: "Wire Sass into a Vite/webpack pipeline, use Sass maps to generate a utility set or themeable component library, and know honestly when that power is worth the build step.",
      content: `## Getting Sass into a build pipeline

Modern bundlers don't understand \`.scss\` natively — they hand it off to Dart Sass through a small integration layer, then treat the compiled CSS like any other CSS the bundler already knows how to process (bundling, minifying, injecting into the page).

### Vite

Vite has Sass support built in — install the \`sass\` package (Vite auto-detects and uses it, no plugin or config needed for basic usage) and \`.scss\`/\`.module.scss\` files just work:

\`\`\`bash
npm install -D sass
\`\`\`

\`\`\`ts
// vite.config.ts — only needed for extra options, not for basic Sass support
import { defineConfig } from "vite"

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // shared partial injected into every .scss file automatically,
        // handy for a project-wide token map without repeating @use everywhere
        additionalData: \`@use "@/styles/tokens" as *;\`,
      },
    },
  },
})
\`\`\`

### webpack

webpack needs an explicit loader chain: \`sass-loader\` compiles Sass to CSS, \`css-loader\` resolves \`@import\`/\`url()\` and (for \`.module.scss\`) applies CSS Modules scoping, and \`style-loader\` or \`MiniCssExtractPlugin\` gets the result onto the page.

\`\`\`js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\\.module\\.scss$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { modules: true } },
          "sass-loader",
        ],
      },
      {
        test: /\\.scss$/,
        exclude: /\\.module\\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
}
\`\`\`

The loader order matters and reads right-to-left / bottom-to-top: \`sass-loader\` runs first (Sass to plain CSS), then \`css-loader\`, then \`style-loader\` last. This is the same pipeline Vite runs under the hood — Vite just pre-wires it so most projects never see the loader config directly.

## Generating a utility set from a Sass map

Tailwind-style utility classes (\`.p-4\`, \`.m-2\`, \`.text-lg\`) are themselves just a big, mechanical list of near-identical rules — exactly the kind of repetition \`@each\` over a Sass map is good at generating, if you wanted to hand-roll a small utility layer rather than pull in the full Tailwind toolchain:

\`\`\`scss
@use "sass:math";

$spacing-scale: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  4: 1rem,
  6: 1.5rem,
  8: 2rem,
);

@each $key, $value in $spacing-scale {
  .p-#{$key} { padding: $value; }
  .m-#{$key} { margin: $value; }
  .pt-#{$key} { padding-top: $value; }
  .mt-#{$key} { margin-top: $value; }
}
\`\`\`

That loop alone generates 24 rules from 6 lines of map data. Extending it to cover left/right/bottom variants, or breakpoint-prefixed versions (\`.md\\:p-4\`) inside an \`@each\` over a breakpoints map too, is how a hand-rolled utility layer scales without the file growing linearly with the number of classes. This is a genuinely useful exercise for understanding how Tailwind's generation model works internally — but it's worth being direct about the tradeoff: Tailwind itself ships a JIT engine, a full color/spacing/typography scale considered together, purging of unused classes, arbitrary-value support (\`p-[13px]\`), and years of design-system tuning. A hand-rolled Sass utility layer can match a narrow slice of that for a small project, but re-implementing the whole thing in Sass maps is rarely a good use of engineering time once a project's utility needs grow past a handful of properties — reach for actual Tailwind (or another maintained utility framework) at that point instead.

## A themeable component library with Sass maps

Where Sass maps earn their keep more clearly is generating a **themed component variant system** for a design system package — something with genuine per-brand or per-mode logic, not just a mechanical spacing scale:

\`\`\`scss
@use "sass:map";
@use "sass:color";

$themes: (
  light: (
    bg: #ffffff,
    text: #111827,
    primary: #4f46e5,
  ),
  dark: (
    bg: #111827,
    text: #f9fafb,
    primary: #818cf8,
  ),
);

@mixin themed() {
  @each $theme-name, $theme-map in $themes {
    [data-theme="#{$theme-name}"] & {
      $t: $theme-map;
      @content;
    }
  }
}

.card {
  @include themed() {
    background: map.get($t, bg);
    color: map.get($t, text);
    border-color: color.adjust(map.get($t, primary), $alpha: -0.7);
  }
}
\`\`\`

This compiles \`.card\`'s rules once per theme, scoped under \`[data-theme="light"]\` and \`[data-theme="dark"]\` ancestor selectors — every themed component in the library reuses the same \`themed()\` mixin and the same \`$themes\` map, so adding a third theme means adding one entry to the map, not touching every component file.

### The honest comparison: is this still worth it over native CSS?

A large amount of what that mixin does can now be done with plain CSS custom properties and zero build step, and it's worth actually weighing the two rather than defaulting to Sass out of habit:

\`\`\`css
:root[data-theme="light"] {
  --bg: #ffffff;
  --text: #111827;
  --primary: #4f46e5;
}
:root[data-theme="dark"] {
  --bg: #111827;
  --text: #f9fafb;
  --primary: #818cf8;
}
.card {
  background: var(--bg);
  color: var(--text);
  border-color: color-mix(in srgb, var(--primary) 30%, transparent);
}
\`\`\`

| | Sass maps + mixin | Native custom properties |
|---|---|---|
| Runtime theme switching (no reload) | Needs a class/attribute swap, values are baked in at compile time | Native — \`data-theme\` swap just works, values resolve live |
| Compile-time validation (typo in a token name) | Sass errors on \`map.get\` for a missing key (with \`$default\`) or silently returns \`null\` depending on usage | Silently falls back or produces invalid CSS — no build-time check |
| Color math (\`color.adjust\`, \`color.scale\`) | Full control, computed once at build time | \`color-mix()\` exists and covers common cases, less precise control than Sass's color module |
| Adding a new theme | Add one map entry, mixin handles the rest | Add one \`:root[data-theme=...]\` block |
| Build step required | Yes | No |

Neither column is strictly better — they optimize for different things. Custom properties win when themes need to change **at runtime** without a rebuild (a user-facing dark-mode toggle, a live theme editor). Sass maps win when the values genuinely need **compile-time computation** (derived color math run once, not shipped as a live calculation) or when a whole design system needs the same generation logic applied consistently across dozens of components sharing one build.

## When to actually reach for Sass, honestly

This entire course has built toward real capability — variables, nesting, mixins, functions, modules, math, maps, control flow, a plugin ecosystem, and now architecture. It's worth closing with the same honesty this lesson opened with: **not every project needs any of it.**

| Signal | Lean toward |
|---|---|
| Small project, few components, no design-system ambitions | Plain modern CSS — nesting, \`@layer\`, \`clamp()\`, \`color-mix()\`, and custom properties now cover most of what used to require a preprocessor |
| Team already has a build step (bundler, framework) for other reasons | Sass costs little extra — \`sass-loader\`/Vite support is one dependency away, so its logic features (maps, \`@each\`, real functions) are close to free to add |
| No build step at all, static HTML/CSS only | Native CSS — adding a Sass compile step purely for Sass, with no other build tooling in the project, is real added complexity for a small site |
| Multi-brand / multi-theme design system, dozens of components sharing tokens and logic | Sass maps + mixins pull their weight clearly here — or a JS-based design-token pipeline (Style Dictionary etc.) doing a similar job |
| Team wants runtime theme switching without a rebuild | Lean on native custom properties for the switchable values, even inside an otherwise Sass-built system |

The honest summary of this whole course: Dart Sass earns its place wherever a project already has a build step and needs real logic — loops, conditionals, functions, a proper module system — applied consistently across many files. Where native CSS has genuinely caught up (variables via custom properties, nesting, \`@layer\`, \`clamp()\`, \`color-mix()\`) it's worth using those directly rather than reaching for Sass out of habit; the two aren't in a fight, and most production frontends in 2026 use both together — native CSS for what it now does well, Sass layered on top for the logic native CSS still doesn't have.

> **Key idea:** Sass integrates into Vite or webpack as a one-dependency compile step, and its maps/functions genuinely shine for generating utility sets or themeable component systems at scale — but the right call for a small project without an existing build step is often plain modern CSS, and knowing which situation you're in is the actual skill.`,
    },
  ],
}
