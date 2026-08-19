import type { Module } from "../types"

export const tailwindModule12: Module = {
  id: 12,
  title: "Customizing Tailwind",
  status: "upcoming",
  lessons: [
    {
      name: "theme vs extend & Customizing Design Tokens",
      minutes: 10,
      intro: "Learn when to extend Tailwind's design tokens and when to replace them outright, then rebrand the default palette.",
      content: `### Two very different operations

Every utility class Tailwind generates — \`p-4\`, \`text-blue-500\`, \`font-sans\` — is derived from a value sitting in Tailwind's **theme**: a big set of named design tokens for color, spacing, fonts, breakpoints, and more. Customizing Tailwind almost always means doing one of two things to that theme, and mixing them up is the single most common source of "why did my spacing scale disappear?" confusion:

- **Extending** — add new tokens alongside the defaults. \`p-4\` and \`bg-blue-500\` keep working exactly as before; you're only adding new names.
- **Replacing** — override a token namespace entirely. If you replace the default color palette, \`bg-blue-500\` stops existing unless you also redefine it yourself.

### Tailwind v4: it's all in your CSS

In v4, the theme lives in your CSS file, inside an \`@theme\` block, as CSS custom properties with specific prefixes (\`--color-*\`, \`--spacing-*\`, \`--font-*\`, \`--breakpoint-*\`, and more). Writing a new variable inside \`@theme\` is an **extend** — it adds to the defaults without touching them:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #7c3aed;
  --color-brand-dark: #5b21b6;
}
\`\`\`

\`\`\`html
<button class="bg-brand hover:bg-brand-dark text-white">Get started</button>
\`\`\`

\`bg-blue-500\`, \`bg-red-500\`, and every other default color utility still work — you've simply added \`bg-brand\` and \`bg-brand-dark\` to the set Tailwind already knew about.

To **replace** an entire namespace in v4, you redeclare it using the special \`@theme\` syntax that clears the namespace first:

\`\`\`css
@theme {
  --color-*: initial; /* wipes every default color */

  --color-brand: #7c3aed;
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-900: #171717;
  /* ...you now own the entire color palette */
}
\`\`\`

After that, \`bg-blue-500\` no longer generates anything — Tailwind only knows the colors you explicitly listed. This is the CSS-first equivalent of setting \`theme.colors\` (not \`theme.extend.colors\`) in a v3 config, and it's a deliberate, opt-in step — you have to write \`--color-*: initial\` to trigger it, so there's no risk of accidentally nuking the defaults just by adding one custom color.

### Tailwind v3: the same idea, in JS config

If you're working in (or maintaining) a v3 project, the same two operations happen in \`tailwind.config.js\`:

\`\`\`js
// tailwind.config.js — EXTEND: keeps all defaults, adds new tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#7c3aed",
        "brand-dark": "#5b21b6",
      },
    },
  },
}
\`\`\`

\`\`\`js
// tailwind.config.js — REPLACE: you now own the whole colors object
module.exports = {
  theme: {
    colors: {
      brand: "#7c3aed",
      white: "#ffffff",
      gray: { 50: "#fafafa", 900: "#171717" },
    },
  },
}
\`\`\`

The rule of thumb carries over directly: top-level \`theme.colors\` **replaces**, \`theme.extend.colors\` **adds**. The v4 \`@theme\` block defaults to "add" behavior, and only replaces a namespace when you explicitly clear it with \`--color-*: initial\`.

### Worked example: rebranding colors, spacing, and fonts

Say your brand uses a specific purple, a slightly denser spacing scale for a data-heavy dashboard, and a custom typeface. Here's a realistic v4 \`@theme\` block combining extension (safe, additive) with one deliberate replacement (fonts, where you *do* want to fully take over):

\`\`\`css
@import "tailwindcss";

@theme {
  /* extend: new brand colors alongside the full default palette */
  --color-brand-50: #f5f3ff;
  --color-brand-500: #7c3aed;
  --color-brand-600: #6d28d9;
  --color-brand-900: #4c1d95;

  /* extend: a tighter in-between spacing step */
  --spacing-4-5: 1.125rem; /* between spacing-4 (1rem) and spacing-5 (1.25rem) */

  /* replace: this app only ever uses one typeface, so we fully own font-sans */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
\`\`\`

\`\`\`html
<div class="bg-brand-50 p-4-5 font-sans">
  <h2 class="text-brand-900">Q3 revenue</h2>
  <p class="text-brand-600">Up 12% from last quarter</p>
</div>
\`\`\`

\`--font-sans\` is a case where replacing rather than extending is usually right: you're not adding a *second* sans-serif option, you're changing what "sans" means for the whole project, and \`font-sans\` already existed as a token name — assigning it a new value overrides that one entry without needing the \`initial\` trick (that trick is only for wiping and rebuilding an entire namespace like all of \`--color-*\`).

### Choosing extend vs replace

| Situation | Choose |
|-----------|--------|
| Adding brand colors on top of Tailwind's palette | Extend |
| Your project has a small, fixed set of colors and you want unused ones to be impossible to reach for | Replace |
| Adding one non-standard spacing value (e.g. a specific icon size) | Extend |
| Your design system defines its own complete spacing scale | Replace |
| Swapping the default typeface | Replace that one token (\`--font-sans\`), not the whole namespace |

> **Key idea:** Adding a new \`--color-*\`/\`--spacing-*\`/etc. variable inside \`@theme\` extends Tailwind's defaults for free — nothing breaks. Only reach for \`--color-*: initial\` (v4) or top-level \`theme.colors\` (v3) when you deliberately want to replace an entire namespace and take full ownership of every value in it.`,
    },
    {
      name: "Arbitrary Values & Arbitrary Properties",
      minutes: 9,
      intro: "Escape the theme when you truly need to — with arbitrary values, properties, and variants — without turning your markup into inline CSS.",
      content: `### Arbitrary values: square brackets on existing utilities

Sometimes a value simply isn't in your theme, and adding a permanent token for a one-off number would be overkill. Tailwind lets you drop any CSS value directly into a utility using square brackets:

\`\`\`html
<div class="w-[137px] bg-[#1da1f2] top-[calc(100%-4px)]">
  Precisely positioned tooltip arrow
</div>
\`\`\`

| Class | Generates |
|-------|-----------|
| \`w-[137px]\` | \`width: 137px\` |
| \`bg-[#1da1f2]\` | \`background-color: #1da1f2\` |
| \`top-[calc(100%-4px)]\` | \`top: calc(100% - 4px)\` |
| \`text-[15px]\` | \`font-size: 15px\` |
| \`grid-cols-[1fr_2fr_1fr]\` | \`grid-template-columns: 1fr 2fr 1fr\` |

Spaces inside an arbitrary value must be written as underscores (Tailwind converts \`_\` back to a space when it isn't otherwise meaningful) — that's why the grid-template-columns example above uses \`1fr_2fr_1fr\` rather than a literal space, which would be parsed as three separate classes.

### Arbitrary properties: CSS Tailwind doesn't have a utility for

Occasionally you need a CSS property Tailwind simply doesn't ship a named utility for at all. Arbitrary properties let you write the property name itself inside the brackets:

\`\`\`html
<div class="[mask-type:luminance] [content-visibility:auto]">
  Uses raw CSS properties with no Tailwind utility equivalent
</div>
\`\`\`

\`\`\`html
<!-- combine with a modifier just like any other utility -->
<div class="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">
  Vertical text on mobile, horizontal on larger screens
</div>
\`\`\`

This is the escape hatch for genuinely obscure or brand-new CSS properties — you get Tailwind's variant system (hover, responsive, dark mode, etc.) applied to a property it has no built-in concept of.

### Arbitrary variants: selectors Tailwind doesn't name

The same square-bracket syntax works on the *variant* side of a class too, letting you target a CSS selector Tailwind doesn't provide a named modifier for:

\`\`\`html
<ul>
  <li class="[&:nth-child(3)]:text-red-500">Item 1</li>
  <li class="[&:nth-child(3)]:text-red-500">Item 2</li>
  <li class="[&:nth-child(3)]:text-red-500">Item 3</li>
</ul>
\`\`\`

The \`&\` stands in for the element the class is applied to — so \`[&:nth-child(3)]:text-red-500\` compiles to a rule equivalent to \`&:nth-child(3) { color: ... }\` scoped to that element. It composes with descendant selectors too:

\`\`\`html
<div class="[&>p]:mt-2 [&_a]:underline">
  <!-- direct-child <p> elements get margin-top; any descendant <a> gets underline -->
  <p>First paragraph</p>
  <p>Second paragraph with <a href="#">a link</a></p>
</div>
\`\`\`

\`[&>p]\` targets direct \`<p>\` children; \`[&_a]\` (underscore = descendant combinator space) targets any \`<a>\` anywhere inside.

### When arbitrary values are the right call

Arbitrary values are a pressure release valve, not a replacement for the theme system. They're the right tool when:

- the value is genuinely one-off — a pixel-perfect alignment against a third-party embed, matching an exact dimension from a design file that doesn't map to your spacing scale
- you're prototyping quickly and don't yet know if a value deserves to become a permanent token
- the CSS feature has no Tailwind utility at all (arbitrary properties) or you need a selector Tailwind doesn't name (arbitrary variants)

### When you should add a real theme token instead

Reach for a named \`@theme\` token rather than repeating an arbitrary value when:

- the **same** arbitrary value shows up more than two or three times across your codebase — that's a sign it's actually a design decision, not a one-off
- the value represents something meaningful in your design system (a brand color, a standard card width) that a teammate should be able to reuse by name rather than by memorizing a magic number
- you want IDE autocomplete, consistent naming, and a single place to update the value later

\`\`\`html
<!-- before: the same magic number, copy-pasted everywhere -->
<div class="w-[18.75rem]">Card</div>
<div class="w-[18.75rem]">Another card</div>
<div class="w-[18.75rem]">Yet another card</div>
\`\`\`

\`\`\`css
/* after: promoted to a real token once the pattern is clear */
@theme {
  --spacing-card: 18.75rem;
}
\`\`\`

\`\`\`html
<div class="w-card">Card</div>
<div class="w-card">Another card</div>
<div class="w-card">Yet another card</div>
\`\`\`

A useful heuristic: arbitrary values are for values, theme tokens are for *decisions*. If you'd have to explain to a teammate why \`18.75rem\` specifically, it probably belongs in \`@theme\` with a name that explains itself.

> **Key idea:** Square brackets — on a value (\`w-[137px]\`), a property (\`[mask-type:luminance]\`), or a variant (\`[&:nth-child(3)]:underline\`) — let you reach past the theme for a genuine one-off. The moment a "one-off" value repeats across the codebase, promote it to a real \`@theme\` token instead, so it has a name your whole team can share.`,
    },
    {
      name: "Custom Screens, Containers & the Design Token Mindset",
      minutes: 9,
      intro: "Customize the container and breakpoints, then zoom out to why a well-maintained theme is a project's shared design language.",
      content: `### The container utility, by default

Tailwind's \`container\` class sets an element's \`max-width\` to match the current breakpoint (so it never grows wider than the viewport's active breakpoint), but by default it is **not** centered and has **no** padding — both are common enough customizations that Tailwind expects most projects to configure them.

\`\`\`html
<div class="container">
  <!-- max-width jumps at each breakpoint, but hugs the left edge with no padding -->
</div>
\`\`\`

### Centering and padding the container (v4)

In v4, you customize \`container\` behavior with the \`@utility\` directive, which lets you extend a built-in utility's generated CSS:

\`\`\`css
@import "tailwindcss";

@utility container {
  margin-inline: auto;
  padding-inline: 1.5rem;
}
\`\`\`

\`\`\`html
<div class="container">
  <!-- now centered, with 1.5rem of padding on each side -->
</div>
\`\`\`

If you want different padding at different breakpoints, add the responsive rules inside the same block:

\`\`\`css
@utility container {
  margin-inline: auto;
  padding-inline: 1rem;

  @media (min-width: theme(--breakpoint-lg)) {
    padding-inline: 2rem;
  }
}
\`\`\`

### The v3 way, for reference

In v3, the same customization lived under \`theme.container\` in the config file:

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
    },
  },
}
\`\`\`

Same outcome, same reasoning — Tailwind ships \`container\` unopinionated about centering and padding because different projects want different defaults, so it's one of the first things most teams configure once, project-wide.

### Custom breakpoints

Tailwind's default breakpoints (\`sm\`, \`md\`, \`lg\`, \`xl\`, \`2xl\`) cover most projects, but you can add to or override them. In v4, breakpoints are theme variables under the \`--breakpoint-*\` namespace:

\`\`\`css
@theme {
  /* extend: add a breakpoint between the defaults */
  --breakpoint-xs: 30rem;

  /* extend: add one larger than the largest default */
  --breakpoint-3xl: 120rem;
}
\`\`\`

\`\`\`html
<div class="hidden xs:block 3xl:max-w-7xl">
  Visible from the new xs breakpoint up, capped in width past 3xl
</div>
\`\`\`

Just like colors and spacing, this is additive — \`sm\`/\`md\`/\`lg\`/\`xl\`/\`2xl\` keep working. To fully replace the breakpoint set (say, your product only ever targets three fixed device widths), clear the namespace first the same way you would for colors:

\`\`\`css
@theme {
  --breakpoint-*: initial;

  --breakpoint-tablet: 48rem;
  --breakpoint-desktop: 80rem;
  --breakpoint-wide: 100rem;
}
\`\`\`

\`\`\`html
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  <!-- named for what they mean in this product, not generic sm/md/lg -->
</div>
\`\`\`

In v3, this lived under \`theme.screens\` (extend for additive, top-level for replace) — same distinction as \`colors\`/\`theme.extend.colors\` from the earlier lesson, applied to breakpoints instead.

### The design token mindset

Everything across this module — colors, spacing, fonts, breakpoints, the container — is really one idea wearing different hats: **your \`@theme\` block is your project's single source of design truth.**

Without a shared theme, "brand purple" ends up as \`#7c3aed\` in one component, \`#7c3aede0\` in another (someone eyeballed a slightly-off value), and \`#7d3bde\` in a third (a typo nobody caught in review). Every one of those is an arbitrary value — technically valid Tailwind, semantically invisible. A reviewer glancing at \`bg-[#7c3aede0]\` has no way to tell whether that's intentional or drift.

With a named token, the same idea only exists once:

\`\`\`css
@theme {
  --color-brand-500: #7c3aed;
}
\`\`\`

\`\`\`html
<button class="bg-brand-500">Every brand-purple button, guaranteed identical</button>
\`\`\`

This is also where Tailwind's theme starts to double as a communication tool between design and engineering. When a designer says "use the brand color" and an engineer reaches for \`bg-brand-500\`, there's no translation step and no room for drift — the name in the design file and the name in the class list are the same string. That's the real payoff of the extend/replace distinction, arbitrary-value discipline, and named breakpoints you've now seen across this module: not that any single one is powerful on its own, but that together they turn "a bunch of CSS values" into a shared, named vocabulary your whole team can reason about.

> **Key idea:** Configure \`container\` centering/padding and any custom breakpoints once, project-wide, the same way you configure colors and spacing — as named theme tokens, not repeated arbitrary values. The broader habit worth keeping from this whole module: every recurring design decision deserves a name in \`@theme\`, so your CSS and your design system stay the same source of truth instead of quietly drifting apart.`,
    },
  ],
}
