import type { Module } from "../types"

export const tailwindModule4: Module = {
  id: 4,
  title: "Backgrounds, Borders & Effects",
  status: "upcoming",
  lessons: [
    {
      name: "Backgrounds & Gradients",
      minutes: 9,
      intro: "Fill elements with colors and images, control how they scroll and scale, and build gradients.",
      content: `### Background color

\`bg-{color}-{shade}\` works exactly like \`text-{color}\`, and every shade also accepts an opacity modifier:

\`\`\`html
<div class="bg-white">Plain white panel</div>
<div class="bg-gray-100">Light gray panel</div>
<div class="bg-indigo-600 text-white">Solid brand-colored panel</div>
<div class="bg-black/60 text-white">60% opacity black overlay</div>
\`\`\`

The \`/opacity\` modifier is the modern way to get a translucent fill — no separate \`bg-opacity-*\` utility or extra \`rgba()\` value needed, and it composes with arbitrary colors too: \`bg-[#1e293b]/80\`.

### Background image attachment

\`bg-fixed\`, \`bg-local\`, and \`bg-scroll\` control the CSS \`background-attachment\` property — how a background image behaves relative to scrolling:

| Utility | Behavior |
|---------|----------|
| \`bg-scroll\` | Default — image scrolls with the page |
| \`bg-fixed\` | Image stays fixed relative to the viewport (classic "parallax" effect) |
| \`bg-local\` | Image scrolls with the element's own content, not just the page |

\`\`\`html
<div class="bg-[url('/hero.jpg')] bg-fixed bg-cover h-screen">
  Content scrolls over a background image that stays pinned in place.
</div>
\`\`\`

### Background size

\`\`\`html
<div class="bg-[url('/photo.jpg')] bg-cover bg-center h-64"></div>
<div class="bg-[url('/logo.png')] bg-contain bg-no-repeat h-64"></div>
<div class="bg-[url('/pattern.png')] bg-auto"></div>
\`\`\`

| Utility | Effect |
|---------|--------|
| \`bg-cover\` | Scales the image up to fully cover the element, cropping if needed |
| \`bg-contain\` | Scales the image to fit entirely inside the element, no cropping |
| \`bg-auto\` | Uses the image's native size |

### Background position

\`\`\`html
<div class="bg-[url('/photo.jpg')] bg-cover bg-center"></div>
<div class="bg-[url('/photo.jpg')] bg-cover bg-top"></div>
<div class="bg-[url('/photo.jpg')] bg-cover bg-bottom"></div>
<div class="bg-[url('/photo.jpg')] bg-cover bg-left-top"></div>
<div class="bg-[url('/photo.jpg')] bg-cover bg-right-bottom"></div>
\`\`\`

The full set: \`bg-top\`, \`bg-bottom\`, \`bg-left\`, \`bg-right\`, \`bg-center\`, plus the four corner combinations (\`bg-left-top\`, \`bg-left-bottom\`, \`bg-right-top\`, \`bg-right-bottom\`). For a precise offset the named positions don't cover, use an arbitrary value: \`bg-[position:25%_75%]\`.

### Linear gradients

Tailwind v4 names its gradient utilities around the CSS gradient function they use — \`bg-linear-*\` for \`linear-gradient()\`. You set a direction, then one or more color stops:

\`\`\`html
<div class="bg-linear-to-r from-cyan-500 to-blue-500 h-24"></div>
<div class="bg-linear-to-br from-purple-600 via-pink-500 to-orange-400 h-24"></div>
\`\`\`

| Direction utility | CSS angle |
|--------------------|-----------|
| \`bg-linear-to-t\` | to top |
| \`bg-linear-to-tr\` | to top right |
| \`bg-linear-to-r\` | to right |
| \`bg-linear-to-br\` | to bottom right |
| \`bg-linear-to-b\` | to bottom |
| \`bg-linear-to-bl\` | to bottom left |
| \`bg-linear-to-l\` | to left |
| \`bg-linear-to-tl\` | to top left |

- \`from-{color}\` sets the starting color stop.
- \`via-{color}\` adds an optional middle stop.
- \`to-{color}\` sets the ending color stop.

Each stop also accepts an opacity modifier and an explicit position: \`from-blue-500/50\`, \`from-blue-500 from-10%\`, \`to-purple-500 to-90%\`.

### Arbitrary gradient angles (v4)

Instead of being limited to the eight named directions, v4 lets you specify any angle directly as the direction value:

\`\`\`html
<div class="bg-linear-45 from-indigo-500 to-pink-500 h-24"></div>
<div class="bg-linear-[110deg] from-emerald-400 to-cyan-500 h-24"></div>
\`\`\`

\`bg-linear-45\` is shorthand for a 45-degree angle; the bracketed form accepts any valid CSS angle for cases the shorthand doesn't cover.

### Radial and conic gradients

v4 also ships first-class utilities for the other two CSS gradient types:

\`\`\`html
<div class="bg-radial from-white to-gray-300 size-32 rounded-full"></div>
<div class="bg-conic from-red-500 via-yellow-500 to-red-500 size-32 rounded-full"></div>
\`\`\`

\`bg-radial\` produces \`radial-gradient()\` and \`bg-conic\` produces \`conic-gradient()\` — conic gradients are especially useful for building pie-chart-style indicators or color wheels without any JavaScript.

### A realistic example: a hero section

\`\`\`html
<section class="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 bg-cover bg-center min-h-screen flex items-center justify-center">
  <div class="text-center text-white">
    <h1 class="text-5xl font-bold">Build faster with Tailwind</h1>
    <p class="mt-4 text-slate-300">Utility-first styling for modern UIs</p>
  </div>
</section>
\`\`\`

> **Key idea:** Background utilities separate the *what* (color or image), the *how it fits* (size/position/attachment), and gradients layer a direction (\`bg-linear-to-r\`, or any angle) with independent \`from-\`/\`via-\`/\`to-\` stops — mix and match rather than reaching for a single "background style" preset.`,
    },
    {
      name: "Borders, Rings & Divide",
      minutes: 9,
      intro: "Draw borders and rounded corners, add accessible focus rings, and space dividers between children.",
      content: `### Border width

\`border\` on its own adds a 1px border on all sides; numbered variants scale it up:

\`\`\`html
<div class="border">1px border, all sides</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>
<div class="border-8">8px border</div>
\`\`\`

A border only becomes visible once it has both a width and a color — without an explicit \`border-{color}\`, Tailwind falls back to \`currentColor\`, which is often not what you want, so get in the habit of pairing them.

### Border sides

Apply width to just one edge, or a pair of opposite edges:

\`\`\`html
<div class="border-t-4 border-t-blue-500">Top border only</div>
<div class="border-b border-b-gray-200">Bottom border only — a common list-item divider</div>
<div class="border-x-2 border-x-gray-300">Left + right borders</div>
<div class="border-y border-y-gray-300">Top + bottom borders</div>
\`\`\`

For layouts that need to respect right-to-left text direction, use the logical variants \`border-s\` (start) and \`border-e\` (end) instead of \`border-l\`/\`border-r\` — they flip automatically with writing direction.

### Border color and style

\`\`\`html
<div class="border-2 border-red-500">Red border</div>
<div class="border-2 border-gray-300/50">50% opacity gray border</div>
<div class="border-2 border-dashed border-gray-400">Dashed</div>
<div class="border-2 border-dotted border-gray-400">Dotted</div>
<div class="border-4 border-double border-gray-400">Double line</div>
<div class="border-2 border-none">Explicitly no border</div>
\`\`\`

### Border radius

The \`rounded-*\` scale runs from barely-there to a full pill/circle:

| Utility | Radius |
|---------|--------|
| \`rounded-none\` | 0 |
| \`rounded-sm\` | 0.25rem |
| \`rounded\` | 0.25rem (Tailwind v4 default alias, same as \`rounded-sm\` in most setups) |
| \`rounded-md\` | 0.375rem |
| \`rounded-lg\` | 0.5rem |
| \`rounded-xl\` | 0.75rem |
| \`rounded-2xl\` | 1rem |
| \`rounded-3xl\` | 1.5rem |
| \`rounded-full\` | 9999px — a full pill or circle |

\`\`\`html
<div class="rounded-lg border p-4">Card with rounded corners</div>
<button class="rounded-full bg-blue-600 px-6 py-2 text-white">Pill button</button>
<img class="rounded-full size-12" src="/avatar.jpg" alt="Avatar" />
\`\`\`

### Per-corner radius

Round individual corners by combining a corner suffix with the same size scale:

\`\`\`html
<div class="rounded-t-lg bg-gray-100 p-4">Rounded top corners only</div>
<div class="rounded-tl-2xl rounded-br-2xl bg-gray-100 p-4">
  Rounded top-left and bottom-right — a common "notched" card look
</div>
\`\`\`

The corner suffixes are \`-t\`, \`-r\`, \`-b\`, \`-l\` for whole edges, and \`-tl\`, \`-tr\`, \`-br\`, \`-bl\` for individual corners (plus logical \`-s\`/\`-e\`/\`-ss\`/\`-se\`/\`-es\`/\`-ee\` for RTL-aware layouts).

### Ring utilities — focus states and outlines

Rings are box-shadow-based outlines that sit outside an element without affecting layout — they're the standard tool for accessible focus indicators:

\`\`\`html
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click or tab to me
</button>
\`\`\`

| Utility | Effect |
|---------|--------|
| \`ring\` / \`ring-1\` | Thin ring |
| \`ring-2\`, \`ring-4\`, \`ring-8\` | Progressively thicker rings |
| \`ring-{color}\` | Ring color, e.g. \`ring-blue-500\` |
| \`ring-inset\` | Draws the ring inside the element's edge instead of outside |

Note: in Tailwind v4 the bare \`ring\` utility defaults to a **1px** ring (v3 defaulted to 3px) — be explicit with \`ring-2\` or \`ring-4\` if you want the older, chunkier look.

### Ring offset

\`ring-offset-*\` inserts a gap of solid color between the element and its ring — useful when the ring color would otherwise blend into the element itself:

\`\`\`html
<button class="rounded-full bg-blue-600 p-2 ring-2 ring-blue-600 ring-offset-2 ring-offset-white focus:outline-none">
  <span class="sr-only">Notifications</span>
</button>
\`\`\`

\`ring-offset-{width}\` sets the gap size (\`ring-offset-1\` through \`ring-offset-8\`), and \`ring-offset-{color}\` sets the gap's fill color — it should normally match the page or card background behind the element.

### Divide utilities

\`divide-x\`/\`divide-y\` add a border **between** children of a flex or block container — without you needing to add a manual border to every child except the last one:

\`\`\`html
<div class="divide-y divide-gray-200">
  <div class="py-3">Item one</div>
  <div class="py-3">Item two</div>
  <div class="py-3">Item three</div>
</div>

<div class="flex divide-x divide-gray-300">
  <div class="px-4">Home</div>
  <div class="px-4">Docs</div>
  <div class="px-4">Blog</div>
</div>
\`\`\`

Divide utilities work by applying the border only to non-first children via a sibling selector, which is exactly the boilerplate they save you from writing by hand. They accept the same width, color, and style modifiers as regular borders — \`divide-x-2\`, \`divide-dashed\`, \`divide-gray-300/50\` — and \`divide-x-reverse\`/\`divide-y-reverse\` flip which side gets the border in a reversed flex row.

> **Key idea:** \`border-*\` draws boundaries, \`rounded-*\` softens them, \`ring-*\` layers a non-layout-affecting outline on top (the accessible way to show focus), and \`divide-*\` is a shortcut for borders-between-children you'd otherwise hand-write with \`:not(:last-child)\`.`,
    },
    {
      name: "Shadows, Opacity & Filters",
      minutes: 10,
      intro: "Add depth with box shadows, fade elements with opacity, and reach for filters and backdrop effects.",
      content: `### The box-shadow scale

Tailwind's shadow scale goes from a barely-there hint of elevation to a dramatic drop shadow:

| Utility | Feel |
|---------|------|
| \`shadow-xs\` | Very subtle, tight shadow |
| \`shadow-sm\` | Small shadow — good for inputs, subtle cards |
| \`shadow\` | Default — everyday card elevation |
| \`shadow-md\` | Noticeably raised |
| \`shadow-lg\` | Strongly raised — dropdowns, popovers |
| \`shadow-xl\` | Large, soft shadow — modals |
| \`shadow-2xl\` | Very large, dramatic shadow |
| \`shadow-none\` | Removes any shadow |

\`\`\`html
<div class="rounded-lg bg-white p-6 shadow-sm">Subtly raised card</div>
<div class="rounded-lg bg-white p-6 shadow-lg">Clearly floating card</div>
<div class="rounded-xl bg-white p-8 shadow-2xl">Modal-level elevation</div>
\`\`\`

### Colored shadows

By default a shadow renders as a soft black. Pair the shadow utility with \`shadow-{color}\` to tint it — useful for glowing call-to-action buttons:

\`\`\`html
<button class="rounded-lg bg-indigo-600 px-5 py-2.5 text-white shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70">
  Get started
</button>
\`\`\`

The opacity modifier on the color (\`/50\`) matters a lot here — a fully-opaque colored shadow usually looks too heavy; keep it translucent so it reads as a soft glow rather than a solid block.

### Opacity

\`opacity-*\` fades the entire element — including its children, background, borders, and text — as one unit, on a 0-100 scale in steps of 5 (plus a few finer steps near the ends):

\`\`\`html
<button class="opacity-50 cursor-not-allowed" disabled>Disabled button</button>
<img class="opacity-75 hover:opacity-100 transition-opacity" src="/thumb.jpg" alt="" />
<div class="opacity-0 group-hover:opacity-100 transition-opacity">Reveals on hover</div>
\`\`\`

This is different from a per-color opacity modifier like \`bg-black/50\` — \`opacity-50\` fades *everything inside the element together*, whereas \`bg-black/50\` only affects that one background color, leaving child text fully opaque. Reach for the color-level modifier whenever you only want one layer translucent.

### Filter utilities

CSS filters apply visual effects — the same category of effect you'd get from a Photoshop adjustment layer — directly to an element and everything rendered inside it:

| Utility | CSS filter |
|---------|------------|
| \`blur-sm\`, \`blur\`, \`blur-md\`, \`blur-lg\`, \`blur-xl\`, \`blur-2xl\`, \`blur-3xl\` | \`blur()\` |
| \`brightness-50\` ... \`brightness-200\` | \`brightness()\` |
| \`contrast-50\` ... \`contrast-200\` | \`contrast()\` |
| \`grayscale\`, \`grayscale-0\` | \`grayscale()\` |
| \`saturate-0\` ... \`saturate-200\` | \`saturate()\` |
| \`invert\`, \`invert-0\` | \`invert()\` |
| \`sepia\`, \`sepia-0\` | \`sepia()\` |
| \`hue-rotate-15\` ... \`hue-rotate-180\` | \`hue-rotate()\` |
| \`drop-shadow-sm\` ... \`drop-shadow-2xl\` | \`drop-shadow()\` |

\`\`\`html
<img class="grayscale hover:grayscale-0 transition" src="/team.jpg" alt="" />
<img class="blur-sm" src="/loading-placeholder.jpg" alt="" />
<div class="brightness-75 contrast-125">Dimmed, higher-contrast panel</div>
\`\`\`

A common pattern is a photo that desaturates by default and returns to full color on hover — cheap to build, and it reads as a polished interaction:

\`\`\`html
<a href="#" class="block overflow-hidden rounded-lg">
  <img class="grayscale saturate-0 transition duration-300 hover:grayscale-0 hover:saturate-100" src="/product.jpg" alt="Product" />
</a>
\`\`\`

\`drop-shadow-*\` is worth calling out separately from \`shadow-*\`: \`shadow\` draws a rectangular shadow behind an element's box, while \`drop-shadow\` follows the actual alpha shape of the content (a PNG logo with transparency, an SVG icon) — use \`drop-shadow\` for non-rectangular graphics.

### Backdrop filters — glassmorphism

Backdrop filters apply the same set of effects to whatever is *behind* an element, through it — the effect that powers frosted-glass UI panels:

| Utility | CSS filter |
|---------|------------|
| \`backdrop-blur-sm\` ... \`backdrop-blur-2xl\` | \`backdrop-filter: blur()\` |
| \`backdrop-brightness-*\` | \`backdrop-filter: brightness()\` |
| \`backdrop-contrast-*\` | \`backdrop-filter: contrast()\` |
| \`backdrop-saturate-*\` | \`backdrop-filter: saturate()\` |
| \`backdrop-opacity-*\` | \`backdrop-filter: opacity()\` |
| \`backdrop-grayscale\` | \`backdrop-filter: grayscale()\` |

A backdrop filter only has something to blur if the element itself is translucent — that's why glassmorphism panels always pair \`backdrop-blur-*\` with a semi-transparent background color:

\`\`\`html
<div class="relative min-h-screen bg-[url('/wallpaper.jpg')] bg-cover">
  <nav class="absolute inset-x-0 top-0 flex justify-between border-b border-white/20 bg-white/10 px-6 py-4 backdrop-blur-md">
    <span class="font-semibold text-white">Brand</span>
    <div class="flex gap-4 text-white/90">
      <a href="#">Docs</a>
      <a href="#">Pricing</a>
    </div>
  </nav>
</div>
\`\`\`

That combination — \`bg-white/10\`, \`backdrop-blur-md\`, and a faint \`border-white/20\` — is the standard recipe for a frosted-glass navbar or card sitting over a photo or gradient background.

> **Key idea:** \`shadow-*\` fakes elevation, \`opacity-*\` fades a whole element as one unit, \`filter\` utilities (\`blur\`, \`grayscale\`, \`brightness\`...) transform the element's own rendering, and \`backdrop-*\` variants apply that same transform to whatever sits behind it — the last pairing with a translucent background is what makes glassmorphism work.`,
    },
  ],
}
