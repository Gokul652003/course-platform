import type { Module } from "../types"

export const tailwindModule2: Module = {
  id: 2,
  title: "Core Utility Fundamentals",
  status: "upcoming",
  lessons: [
    {
      name: "The Spacing Scale — Padding & Margin",
      minutes: 9,
      intro: "Learn Tailwind's numeric spacing scale and every padding/margin utility built on top of it.",
      content: `## One scale, used everywhere

Tailwind's biggest quiet superpower is that padding, margin, width, height, gap, and positioning all pull from the **same spacing scale**. Once you know that scale, you already half-know a dozen different utility families.

The scale is unitless-looking (\`4\`, \`6\`, \`8\`...) but each step maps to a fixed \`rem\` value, which in turn maps to pixels at the default \`16px\` root font size:

| Token | rem | px |
|---|---|---|
| \`0\` | 0rem | 0px |
| \`px\` | 1px | 1px |
| \`0.5\` | 0.125rem | 2px |
| \`1\` | 0.25rem | 4px |
| \`1.5\` | 0.375rem | 6px |
| \`2\` | 0.5rem | 8px |
| \`2.5\` | 0.625rem | 10px |
| \`3\` | 0.75rem | 12px |
| \`4\` | 1rem | 16px |
| \`5\` | 1.25rem | 20px |
| \`6\` | 1.5rem | 24px |
| \`8\` | 2rem | 32px |
| \`10\` | 2.5rem | 40px |
| \`12\` | 3rem | 48px |
| \`16\` | 4rem | 64px |
| \`20\` | 5rem | 80px |
| \`24\` | 6rem | 96px |
| \`32\` | 8rem | 128px |

Everything above \`2\` climbs by whole numbers that step by 4px; below that, the scale gets finer (\`0.5\`, \`1.5\`, \`2.5\`) for tight adjustments like icon padding or 1px borders' visual companions. Because it's a shared, curated scale rather than "any pixel value," spacing across your whole app stays visually consistent almost by accident.

### Padding: p-, px-, py-, pt-/pr-/pb-/pl-

\`\`\`html
<div class="p-4">All sides: 1rem</div>
<div class="px-4">Left + right: 1rem</div>
<div class="py-4">Top + bottom: 1rem</div>
<div class="pt-4">Top only: 1rem</div>
<div class="pr-4">Right only: 1rem</div>
<div class="pb-4">Bottom only: 1rem</div>
<div class="pl-4">Left only: 1rem</div>
\`\`\`

These compose — the more specific side wins when it appears later in your source, but the cleanest pattern is to just pick the narrowest utility that says what you mean:

\`\`\`html
<div class="px-6 pt-8 pb-4">
  <!-- horizontal 1.5rem, top 2rem, bottom 1rem -->
</div>
\`\`\`

Tailwind v4 also ships **logical property** variants for internationalized layouts — \`ps-4\` (padding-inline-start) and \`pe-4\` (padding-inline-end) — which flip automatically in right-to-left contexts instead of always meaning "left" and "right."

### Margin: the same letters, m instead of p

\`\`\`html
<div class="m-4">All sides</div>
<div class="mx-4">Left + right</div>
<div class="my-4">Top + bottom</div>
<div class="mt-4 mr-4 mb-4 ml-4">Individual sides</div>
\`\`\`

A very common pattern is centering a fixed-width block horizontally with \`mx-auto\`:

\`\`\`html
<div class="mx-auto max-w-2xl">
  Centered content column
</div>
\`\`\`

### Negative margins

Prefix any margin utility with a \`-\` to pull an element in the opposite direction — useful for intentionally overlapping elements or counteracting a parent's padding:

\`\`\`html
<div class="p-6">
  <img class="-mt-10 -mx-6 rounded-t-lg" src="/banner.jpg" />
</div>
\`\`\`

Note the \`-\` goes **before** the utility name, not before the number: \`-mt-4\`, not \`mt--4\`. There's no negative padding — padding can't meaningfully be negative, so only margin utilities support this prefix.

### space-x-* / space-y-* — spacing between children

Rather than adding margin to every child of a list, \`space-x-*\` and \`space-y-*\` add spacing **between** sibling elements automatically, leaving the first and last child untouched:

\`\`\`html
<div class="flex space-x-4">
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</div>
\`\`\`

This renders 1rem of horizontal gap between each button, but no extra space on the outer edges. Under the hood it works by applying margin to every child except the first via a CSS selector — you don't need to think about that mechanism day to day, just know it targets *gaps between*, not *the whole element*.

For flex and grid containers specifically, reaching for \`gap-*\` instead is usually simpler and handles wrapping more predictably:

\`\`\`html
<div class="flex flex-wrap gap-4">
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</div>
\`\`\`

\`space-x-*\`/\`space-y-*\` still earns its keep for non-flex/grid contexts, or when you want the gap rule to also apply conditionally with a variant.

### Arbitrary and fractional spacing

Anything outside the scale is available with square-bracket arbitrary values:

\`\`\`html
<div class="pt-[3px]">Exactly 3px, off-scale</div>
<div class="mt-[10%]">10% of the containing block</div>
\`\`\`

Reach for these sparingly — the whole point of the scale is consistency, so an arbitrary value is best reserved for the rare case (matching a design spec's exact pixel, aligning with an external element) where the scale genuinely doesn't have what you need.

> **Key idea:** Padding and margin utilities are just \`p\`/\`m\` plus an optional side (\`t\`/\`r\`/\`b\`/\`l\`/\`x\`/\`y\`) plus a scale step — learn the scale once and every spacing utility in Tailwind follows the same pattern.`,
    },
    {
      name: "Sizing — Width, Height & Constraints",
      minutes: 9,
      intro: "Set explicit, fractional, and viewport-relative sizes, then constrain them with min/max utilities and the v4 size- shorthand.",
      content: `## Width and height share the spacing scale

Just like padding and margin, \`w-*\` and \`h-*\` pull from the same numeric spacing scale you already know:

\`\`\`html
<div class="w-4 h-4">1rem square</div>
<div class="w-16 h-16">4rem square</div>
<div class="w-64">16rem wide</div>
\`\`\`

On top of the shared scale, sizing utilities add a few categories the spacing scale alone doesn't need: fractions, keywords, and viewport units.

### Fractional widths

\`w-{n}/{d}\` sets a percentage width as a fraction, which is especially handy for quick grid-less layouts:

\`\`\`html
<div class="flex">
  <div class="w-1/3 bg-slate-100">Sidebar</div>
  <div class="w-2/3 bg-white">Main content</div>
</div>
\`\`\`

| Class | Percentage |
|---|---|
| \`w-1/2\` | 50% |
| \`w-1/3\`, \`w-2/3\` | 33.33%, 66.67% |
| \`w-1/4\`, \`w-3/4\` | 25%, 75% |
| \`w-1/5\` ... \`w-4/5\` | 20% steps |
| \`w-1/6\` ... \`w-5/6\` | ~16.67% steps |
| \`w-1/12\` ... \`w-11/12\` | ~8.33% steps |
| \`w-full\` | 100% |

\`h-*\` supports the identical fraction syntax (\`h-1/2\`, \`h-full\`, etc.) for the rarer cases where a parent has an explicit height to divide.

### Keyword sizes

Beyond numbers and fractions, both \`w-*\` and \`h-*\` accept content-driven keywords:

| Class | Behavior |
|---|---|
| \`w-auto\` | Browser default sizing |
| \`w-full\` | 100% of the parent |
| \`w-min\` | \`min-content\` — as small as content allows without overflowing |
| \`w-max\` | \`max-content\` — as wide as the content wants, ignoring the parent |
| \`w-fit\` | \`fit-content\` — shrinks to content, but won't exceed the parent |

### Viewport-relative sizes

For layouts that need to reason about the actual browser viewport rather than a parent element:

\`\`\`html
<div class="w-screen">Full viewport width</div>
<div class="h-screen">Full viewport height</div>
\`\`\`

\`h-screen\` uses \`100vh\`, which on mobile browsers is famously unreliable — it's measured against the *largest possible* viewport, so it can leave a gap (or force scrolling) once the browser's address bar collapses or expands. Tailwind also exposes the newer, more accurate dynamic-viewport units directly:

\`\`\`html
<div class="h-dvh">Height that tracks the *actual* visible viewport</div>
<div class="h-svh">Height using the *smallest* possible viewport (safest, no jump)</div>
<div class="h-lvh">Height using the *largest* possible viewport (same idea as vh)</div>
\`\`\`

For any full-height mobile layout built today, \`h-dvh\` or \`h-svh\` is almost always the better default over the classic \`h-screen\`.

### min-w-, max-w-, min-h-, max-h-

Constraints let content flex within bounds instead of being pinned to one exact size. \`min-w-*\`/\`min-h-*\` use the same numeric scale and keywords as \`w-*\`/\`h-*\`, while \`max-w-*\` additionally ships a dedicated **named scale** built for typography and content columns:

| Class | Value |
|---|---|
| \`max-w-xs\` | 20rem (320px) |
| \`max-w-sm\` | 24rem (384px) |
| \`max-w-md\` | 28rem (448px) |
| \`max-w-lg\` | 32rem (512px) |
| \`max-w-xl\` | 36rem (576px) |
| \`max-w-2xl\` | 42rem (672px) |
| \`max-w-4xl\` | 56rem (896px) |
| \`max-w-7xl\` | 80rem (1280px) |
| \`max-w-prose\` | ~65 characters wide — tuned for readable body text |
| \`max-w-full\` | 100% of the parent |
| \`max-w-none\` | No maximum at all |

A very common pattern combines a max width with automatic centering:

\`\`\`html
<article class="mx-auto max-w-prose px-4">
  <p>Long-form text that stays comfortably readable no matter how wide the browser window gets.</p>
</article>
\`\`\`

\`min-w-0\` deserves a special mention: flex children default to a minimum width based on their content, which can silently break text truncation (\`truncate\`) inside a flex layout. Adding \`min-w-0\` overrides that default and lets the child actually shrink below its content size:

\`\`\`html
<div class="flex items-center gap-2">
  <img class="h-10 w-10 shrink-0 rounded-full" src="/avatar.jpg" />
  <span class="min-w-0 truncate">A very long name that needs to truncate with an ellipsis</span>
</div>
\`\`\`

### size-* — width and height together (v4)

A very frequent pattern — an avatar, an icon button, a square thumbnail — needs identical width and height. Tailwind v4 added \`size-*\` as shorthand for setting both at once:

\`\`\`html
<!-- before: two classes -->
<img class="w-10 h-10 rounded-full" src="/avatar.jpg" />

<!-- after: one class -->
<img class="size-10 rounded-full" src="/avatar.jpg" />
\`\`\`

\`size-*\` accepts the same scale, fractions, and keywords as \`w-*\`/\`h-*\` (\`size-full\`, \`size-1/2\`, \`size-[3.25rem]\`, and so on). It doesn't replace \`w-*\`/\`h-*\` — you still need those whenever width and height genuinely differ — but for anything square, it's one class instead of two.

> **Key idea:** Width and height reuse the spacing scale plus fractions, keywords, and viewport units for edge cases; reach for the named \`max-w-*\` scale to constrain readable content, \`min-w-0\` to fix flex-child truncation, and \`size-*\` any time width and height should just match.`,
    },
    {
      name: "Working With Color",
      minutes: 10,
      intro: "Tour Tailwind's default palette and shade scale, then apply color to text, backgrounds, borders, and SVGs — with opacity and arbitrary values.",
      content: `## The default palette

Tailwind ships with a large, carefully curated default color palette rather than a handful of named colors. Every color comes as a **family** — a set of related shades — rather than a single fixed value:

| Family | Character |
|---|---|
| \`slate\`, \`gray\`, \`zinc\`, \`neutral\`, \`stone\` | Neutrals, each with a slightly different tint (slate leans blue, stone leans warm) |
| \`red\`, \`orange\`, \`amber\`, \`yellow\` | Warm accents |
| \`lime\`, \`green\`, \`emerald\`, \`teal\` | Greens |
| \`cyan\`, \`sky\`, \`blue\`, \`indigo\` | Blues |
| \`violet\`, \`purple\`, \`fuchsia\`, \`pink\`, \`rose\` | Purples/pinks |

Having five different neutral families (rather than one generic \`gray\`) is deliberate — \`slate\`, \`zinc\`, \`neutral\`, and \`stone\` each carry a faint undertone, so you can pick whichever reads best against your brand color instead of fighting a single gray that clashes.

### The 50–950 shade scale

Every color family shares the same eleven-step lightness scale, from near-white to near-black:

| Shade | Typical use |
|---|---|
| \`50\` | Barely-there tint — subtle backgrounds |
| \`100\` | Light backgrounds, hover states on light UI |
| \`200\` | Borders on light UI, disabled states |
| \`300\` | Stronger borders, muted icons |
| \`400\` | Placeholder text, muted UI on dark backgrounds |
| \`500\` | The "base" color — often what you reach for first |
| \`600\` | Common for buttons, links — a bit more contrast than 500 |
| \`700\` | Hover/active states for buttons |
| \`800\` | Dark UI backgrounds, strong text on light backgrounds |
| \`900\` | Near-black text, dark mode surfaces |
| \`950\` | Deepest shade — dark mode page backgrounds |

\`\`\`html
<div class="bg-blue-50 text-blue-900">Light info banner</div>
<div class="bg-blue-600 text-white hover:bg-blue-700">Primary button</div>
<div class="bg-blue-950 text-blue-100">Dark mode card</div>
\`\`\`

Because every family shares this same eleven-step scale, swapping a whole UI from \`blue\` to \`indigo\` is usually just a find-and-replace of the family name — the shade numbers already mean the same relative lightness.

### Applying color: text, bg, border, fill, stroke

Color utilities follow a consistent \`{property}-{color}-{shade}\` pattern:

\`\`\`html
<p class="text-slate-700">Body text</p>
<div class="bg-slate-100">Section background</div>
<div class="border border-slate-300">Bordered box</div>
\`\`\`

\`fill-*\` and \`stroke-*\` apply the same palette to SVG elements — \`fill\` for the shape's interior, \`stroke\` for its outline:

\`\`\`html
<svg class="h-6 w-6 fill-none stroke-emerald-500" viewBox="0 0 24 24">
  <path stroke-width="2" d="M5 13l4 4L19 7" />
</svg>
\`\`\`

This is the standard way to recolor an inline SVG icon without touching the SVG file itself — the icon inherits color from whichever \`fill-*\`/\`stroke-*\` utility is applied to it (or to \`currentColor\` if the SVG was authored that way, in which case \`text-*\` controls it instead).

### Opacity with the slash syntax

Rather than a separate \`bg-opacity-*\` utility (how this worked in Tailwind v2), any color utility accepts an opacity modifier directly, using a slash:

\`\`\`html
<div class="bg-black/50">50% opaque black background</div>
<div class="bg-blue-600/75">75% opaque blue</div>
<div class="text-white/60">60% opaque white text</div>
<div class="border-slate-900/10">Very faint dark border — a common "subtle divider" trick</div>
\`\`\`

The number after the slash is a percentage (0–100), and it works with any color anywhere a color utility is accepted — backgrounds, text, borders, fill, stroke, ring, and more. This is especially useful for building a translucent overlay or a soft divider without needing a whole new named color.

### Arbitrary colors

When a design calls for an exact color outside the default palette — matching a brand hex code, for instance — square-bracket arbitrary values work directly on any color utility:

\`\`\`html
<div class="bg-[#1da1f2]">Exact brand blue</div>
<div class="text-[#1da1f2]">Same color, as text</div>
<div class="bg-[#1da1f2]/40">Arbitrary color, still with opacity</div>
\`\`\`

Arbitrary values also accept other CSS color formats — \`bg-[rgb(29,161,242)]\`, \`bg-[hsl(203,89%,53%)]\` — and can reference a CSS variable directly with \`bg-[var(--brand)]\`. As with spacing, arbitrary colors are meant to be an escape hatch: for anything you'll reuse more than once or twice, it's worth promoting it into a named token via \`@theme\` (covered in a later module) instead of repeating the same bracket value across your codebase.

> **Key idea:** Every default Tailwind color is a family of eleven consistent shades (\`50\`–\`950\`) applied through the same \`{property}-{color}-{shade}\` pattern across text, backgrounds, borders, and SVGs — reach for the slash syntax for opacity and square brackets only when the palette genuinely doesn't have the exact color you need.`,
    },
  ],
}
