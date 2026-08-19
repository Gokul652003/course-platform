import type { Module } from "../types"

export const tailwindModule5: Module = {
  id: 5,
  title: "Layout Fundamentals",
  status: "upcoming",
  lessons: [
    {
      name: "Display & Box Sizing",
      minutes: 9,
      intro: "Every element starts life with a display value and a box-sizing rule — control both explicitly before you touch layout.",
      content: `### Why display is the first decision

Before you can position anything, wrap it in a flex container, or lay it into a grid, the browser needs to know what *kind* of box an element renders as. CSS's \`display\` property controls that, and Tailwind gives you a utility for every common value. Get comfortable with these first — \`flex\` and \`grid\` (covered in depth in later modules) are both just display values underneath.

### Block-level utilities

\`\`\`html
<div class="block">I take the full width, stack vertically</div>
<span class="inline">I flow with surrounding text</span>
<span class="inline-block">I flow with text, but accept width/height</span>
\`\`\`

| Class | CSS | Behavior |
|-------|-----|----------|
| \`block\` | \`display: block;\` | Takes the full available width, starts on its own line, respects \`width\`/\`height\`/margin on all sides |
| \`inline\` | \`display: inline;\` | Flows within surrounding text, ignores \`width\`/\`height\`, only horizontal margin/padding visually pushes neighbors |
| \`inline-block\` | \`display: inline-block;\` | Flows like inline, but respects \`width\`/\`height\`/vertical margin — the best of both when you need a sized element mid-sentence |

A common real case: a "Pro" badge sitting inline with a heading, but big enough to need padding on all sides.

\`\`\`html
<h2 class="text-xl font-semibold">
  Dashboard
  <span class="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
    Pro
  </span>
</h2>
\`\`\`

If that badge were plain \`inline\` instead of \`inline-block\`, the \`py-1\` vertical padding would visually overlap the line above/below it instead of pushing the line height out — \`inline\` never grows the box vertically.

### Flex and grid containers

\`\`\`html
<div class="flex">...</div>
<div class="inline-flex">...</div>
<div class="grid">...</div>
<div class="inline-grid">...</div>
\`\`\`

| Class | CSS |
|-------|-----|
| \`flex\` | \`display: flex;\` |
| \`inline-flex\` | \`display: inline-flex;\` |
| \`grid\` | \`display: grid;\` |
| \`inline-grid\` | \`display: inline-grid;\` |

The \`inline-*\` variants make the container itself behave like an inline-block from the *outside* (it sits in a line of text, sized to its content) while everything *inside* it still follows flex or grid rules. You'll reach for \`inline-flex\` a lot for small, self-sizing widgets like buttons with an icon and label that need to sit next to other inline content.

\`\`\`html
<button class="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-white">
  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" /></svg>
  Save changes
</button>
\`\`\`

Flexbox and Grid each get a full module later — for now just know these four classes are how you turn any element into a flex or grid *container*.

### Hiding elements: hidden

\`\`\`html
<div class="hidden">Never rendered, takes up no space</div>
<div class="hidden md:block">Hidden on mobile, block from md upward</div>
\`\`\`

\`hidden\` maps to \`display: none;\` — the element is removed from layout entirely, as opposed to \`invisible\` (covered in the next lesson), which merely hides it visually while its space remains. Pairing \`hidden\` with a responsive prefix like \`md:block\` or \`md:flex\` is the standard Tailwind pattern for "show this only above a breakpoint."

### contents — the box that disappears

\`\`\`html
<ul class="flex gap-4">
  <li class="contents">
    <a href="/a">A</a>
    <a href="/b">B</a>
  </li>
  <li><a href="/c">C</a></li>
</ul>
\`\`\`

\`display: contents\` is unusual: the element's *own* box vanishes (no margin, padding, or background renders for it), but its children are promoted to act as direct children of its parent for layout purposes. In the example above, the \`<li class="contents">\` disappears and its two \`<a>\` tags become direct flex items of the \`<ul>\`, sitting alongside the third \`<li>\` as if the wrapping \`<li>\` were never there. It's a niche tool — useful when semantic HTML (a wrapping element you need for meaning or accessibility) conflicts with the flat structure a flex or grid layout wants — but worth knowing it exists so you're not tempted to reach for JavaScript instead.

### Box sizing: box-border vs box-content

This is the one that surprises people coming from plain CSS. The CSS \`box-sizing\` property decides whether \`width\`/\`height\` include padding and border, or exclude them.

| Class | CSS | \`width: 200px; padding: 20px; border: 4px\` renders as |
|-------|-----|------|
| \`box-border\` | \`box-sizing: border-box;\` | Total rendered width stays **200px** — padding and border are subtracted from the content area |
| \`box-content\` | \`box-sizing: content-box;\` | Total rendered width becomes **248px** (200 + 20+20 padding + 4+4 border) — the browser default |

\`\`\`html
<div class="box-border w-48 border-4 border-indigo-500 p-4">
  I am exactly 12rem (w-48) wide, no matter the border/padding
</div>

<div class="box-content w-48 border-4 border-indigo-500 p-4">
  I am 12rem of *content*, plus border and padding added on top
</div>
\`\`\`

Here's the important part: Tailwind's Preflight (its CSS reset, loaded automatically) sets \`box-sizing: border-box\` on every single element, globally, before any utility classes are applied. That means you almost never need to write \`box-border\` explicitly — it's already the default everywhere in a Tailwind project. You'll only reach for \`box-content\` on the rare occasion you're embedding third-party markup that expects the old content-box behavior, or replicating a design spec that explicitly measures content size separately from padding/border.

### Quick reference

| Utility | display value |
|---------|---------------|
| \`block\` | \`block\` |
| \`inline-block\` | \`inline-block\` |
| \`inline\` | \`inline\` |
| \`flex\` | \`flex\` |
| \`inline-flex\` | \`inline-flex\` |
| \`grid\` | \`grid\` |
| \`inline-grid\` | \`inline-grid\` |
| \`hidden\` | \`none\` |
| \`contents\` | \`contents\` |

> **Key idea:** \`display\` decides what kind of box an element is (block, inline, flex container, grid container, or nothing at all with \`hidden\`); \`box-sizing\` decides how that box's declared width/height interacts with its own padding and border. Tailwind defaults every element to \`border-box\` via Preflight, so \`box-border\` is rarely written explicitly — but knowing it's there explains why a \`w-48\` box with padding doesn't grow past 12rem.`,
    },
    {
      name: "Position, Inset & Z-Index",
      minutes: 9,
      intro: "Pull an element out of normal flow with position utilities, place it precisely with inset, and control what sits on top with z-index.",
      content: `### The five position values

\`\`\`html
<div class="static">...</div>
<div class="relative">...</div>
<div class="absolute">...</div>
<div class="fixed">...</div>
<div class="sticky">...</div>
\`\`\`

| Class | CSS | What it does |
|-------|-----|------|
| \`static\` | \`position: static;\` | Default. Element sits in normal document flow; \`top\`/\`right\`/\`bottom\`/\`left\` have no effect |
| \`relative\` | \`position: relative;\` | Still occupies its normal-flow space, but can now be nudged with \`top\`/\`right\`/\`bottom\`/\`left\`, and becomes a positioning **anchor** for any \`absolute\` descendant |
| \`absolute\` | \`position: absolute;\` | Removed from normal flow entirely; positioned relative to the nearest ancestor that is *not* \`static\` (falls back to the document if none exists) |
| \`fixed\` | \`position: fixed;\` | Removed from flow, positioned relative to the browser viewport — stays put when the page scrolls |
| \`sticky\` | \`position: sticky;\` | Behaves like \`relative\` until the scroll position crosses a threshold you set with \`top\`/\`bottom\`, then behaves like \`fixed\` within its parent's bounds |

The single most important rule to internalize: **\`absolute\` only makes sense paired with \`relative\` on an ancestor.** Without a positioned ancestor, an \`absolute\` element positions itself against the whole page, which is almost never what you want.

### Inset, top, right, bottom, left

Tailwind's inset utilities set one or more of the four offset properties, using the same spacing scale as margin/padding:

\`\`\`html
<div class="absolute inset-0">Fills the positioned parent exactly</div>
<div class="absolute inset-x-0 top-0">Full width, pinned to the top</div>
<div class="absolute top-4 right-4">4 units (1rem) from the top-right corner</div>
<div class="absolute bottom-0 left-1/2 -translate-x-1/2">Bottom-center, offset by half its own width</div>
\`\`\`

| Class pattern | Sets |
|-------|------|
| \`inset-0\` / \`inset-4\` / \`inset-px\` | \`top\`, \`right\`, \`bottom\`, \`left\` — all four at once |
| \`inset-x-0\` | \`left\` and \`right\` only |
| \`inset-y-0\` | \`top\` and \`bottom\` only |
| \`top-4\`, \`right-4\`, \`bottom-4\`, \`left-4\` | one side individually |
| \`inset-1/2\`, \`top-1/2\`, \`left-1/2\` | fractional (percentage) offsets |
| \`-top-2\`, \`-inset-1\` | negative offsets (note the leading dash *before* the utility name) |

\`inset-0\` is worth memorizing on its own — "pin this element to fill its positioned parent completely" is one of the most common layout moves in Tailwind, used for overlays, image backgrounds, and full-bleed absolute children.

### Practical example: a badge on a card

\`\`\`html
<div class="relative w-72 rounded-xl border border-slate-200 p-4 shadow-sm">
  <span class="absolute -top-2 -right-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
    New
  </span>
  <h3 class="font-semibold text-slate-900">Starter Plan</h3>
  <p class="mt-1 text-sm text-slate-500">Everything you need to get going.</p>
</div>
\`\`\`

The card is \`relative\` — that's what makes it the anchor. The badge is \`absolute\`, nudged slightly outside the card's top-right corner with negative offsets (\`-top-2 -right-2\`), a common trick for "floating" badges and notification dots that overlap an edge rather than sitting flush inside it.

### Practical example: a sticky header

\`\`\`html
<header class="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4">
  <nav class="flex items-center justify-between">
    <span class="font-bold">Acme</span>
    <a href="/pricing" class="text-sm text-slate-600">Pricing</a>
  </nav>
</header>
<main class="p-6">
  <!-- long scrolling content -->
</main>
\`\`\`

\`sticky top-0\` means: behave normally until the header would scroll past the top of its scrolling container, then stick at \`top: 0\` from that point on. Unlike \`fixed\`, a sticky element still reserves its own space in the flow and stays constrained to its parent — it doesn't jump out to the whole viewport, and it stops sticking once its parent's bottom edge scrolls past.

### z-index and stacking contexts

\`\`\`html
<div class="z-0">...</div>
<div class="z-10">...</div>
<div class="z-20">...</div>
<div class="z-50">...</div>
<div class="-z-10">...</div>
\`\`\`

Tailwind's default z-index scale is \`0\`, \`10\`, \`20\`, \`30\`, \`40\`, \`50\`, plus \`auto\` and negative values. The gaps of 10 are deliberate — they leave room to slot a new layer (\`z-15\` via an arbitrary value, \`z-[15]\`) between two existing ones later without renumbering everything.

\`\`\`html
<div class="relative">
  <div class="absolute inset-0 z-0 bg-slate-100"></div>
  <div class="relative z-10">Content above the background</div>
  <div class="fixed inset-0 z-50 bg-black/50">Modal overlay, on top of everything</div>
</div>
\`\`\`

The part that catches people out: \`z-index\` only compares elements **within the same stacking context**. A \`z-50\` element can still render *behind* a \`z-10\` element if they belong to different stacking contexts — and a new stacking context is created by more than just \`position\` + \`z-index\`. Setting \`opacity\` below 1, using \`transform\`, \`filter\`, \`will-change\`, or \`isolation-isolate\` on an ancestor all silently create one too. If a z-index value "isn't working," the usual culprit is that the element (or one of its ancestors) is trapped inside a stacking context you didn't intend to create, so your high z-index is only winning locally, against siblings inside that context, not against the element you actually wanted to beat.

\`\`\`html
<div class="isolate">
  <!-- creates a fresh stacking context on purpose, containing
       all z-index comparisons inside it -->
</div>
\`\`\`

Tailwind exposes this deliberately with the \`isolate\` utility (\`isolation: isolate;\`), handy when you want to guarantee a component's internal stacking never leaks out to interfere with the rest of the page.

> **Key idea:** \`relative\` + \`absolute\` is a pair — the parent opts into being an anchor, the child positions against it — while \`fixed\` anchors to the viewport and \`sticky\` toggles between the two based on scroll position. When z-index seems to misbehave, look for an ancestor with \`opacity\`, \`transform\`, or \`filter\` creating an unexpected stacking context before assuming the number itself is wrong.`,
    },
    {
      name: "Overflow, Visibility & Object Fit",
      minutes: 9,
      intro: "Decide what happens when content doesn't fit its box, whether a box takes up space while invisible, and how media fills its frame.",
      content: `### Overflow: what happens when content is too big

By default, content that's larger than its container simply spills out of it (\`overflow: visible\`). Tailwind's overflow utilities let you clip it, scroll it, or force scrollbars to always show.

\`\`\`html
<div class="h-24 overflow-auto">Scrolls only if content exceeds 6rem tall</div>
<div class="h-24 overflow-hidden">Clips anything past 6rem, no scrollbar</div>
<div class="h-24 overflow-scroll">Always shows scrollbars, even if content fits</div>
<div class="h-24 overflow-visible">Content spills outside the box (the default)</div>
\`\`\`

| Class | CSS |
|-------|-----|
| \`overflow-auto\` | \`overflow: auto;\` — browser adds scrollbars only when needed |
| \`overflow-hidden\` | \`overflow: hidden;\` — excess content is clipped and inaccessible |
| \`overflow-clip\` | \`overflow: clip;\` — similar to hidden, but disallows programmatic scrolling too |
| \`overflow-visible\` | \`overflow: visible;\` — content overflows freely (default) |
| \`overflow-scroll\` | \`overflow: scroll;\` — scrollbars always rendered, both axes |

In practice \`overflow-auto\` is what you want nearly all the time — it behaves exactly like \`overflow-scroll\` when there's too much content, but doesn't show a permanent empty scrollbar when there isn't. Reach for \`overflow-hidden\` deliberately, for cases like clipping an image to its rounded-corner container, or truncating a dropdown's contents.

### Per-axis overflow

Every value above also has \`-x-\` and \`-y-\` variants to control just one axis:

\`\`\`html
<div class="overflow-x-auto overflow-y-hidden">
  <!-- horizontal scroll only, e.g. a table or a row of cards -->
</div>
\`\`\`

A classic use: a horizontally-scrolling row of cards on mobile that doesn't wrap.

\`\`\`html
<div class="flex gap-4 overflow-x-auto pb-2">
  <div class="w-64 shrink-0 rounded-lg border p-4">Card 1</div>
  <div class="w-64 shrink-0 rounded-lg border p-4">Card 2</div>
  <div class="w-64 shrink-0 rounded-lg border p-4">Card 3</div>
</div>
\`\`\`

\`shrink-0\` (covered in the next module) is doing important work here too — without it, flex would try to squeeze the cards to fit instead of letting the row scroll.

### Visibility: visible and invisible

\`\`\`html
<div class="visible">I'm shown normally</div>
<div class="invisible">I'm hidden, but my space is preserved</div>
\`\`\`

This is the utility people confuse with \`hidden\` from the last lesson, and the distinction matters:

| Class | CSS | Occupies layout space? | Removed from flow? |
|-------|-----|------|------|
| \`hidden\` | \`display: none;\` | No | Yes — as if it doesn't exist |
| \`invisible\` | \`visibility: hidden;\` | **Yes** | No — the gap remains |

\`\`\`html
<div class="flex gap-4">
  <div class="invisible w-20 h-20 bg-red-500"></div>
  <div class="w-20 h-20 bg-blue-500"></div>
</div>
<!-- Blue box still sits to the right of the red box's empty slot -->
\`\`\`

Reach for \`invisible\` when a layout needs to keep its shape even while one piece is temporarily absent — a placeholder icon that only appears on hover, for instance, where you don't want neighboring elements to shift when it appears:

\`\`\`html
<button class="group flex items-center gap-2">
  <span>Delete</span>
  <svg class="invisible h-4 w-4 group-hover:visible" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" />
  </svg>
</button>
\`\`\`

Because the icon's space is reserved even when \`invisible\`, the "Delete" label never shifts left/right when the icon fades in on hover — swap in \`hidden\`/\`group-hover:block\` instead and the whole button would visibly resize.

### Object fit and object position

\`object-fit\` and \`object-position\` only apply to replaced elements — \`<img>\`, \`<video>\`, and a few others — where the element has intrinsic content (the image/video itself) that may not match the box's aspect ratio.

\`\`\`html
<img class="h-48 w-full object-cover" src="/photo.jpg" alt="" />
<img class="h-48 w-full object-contain bg-slate-100" src="/logo.png" alt="" />
\`\`\`

| Class | CSS | Behavior |
|-------|-----|------|
| \`object-cover\` | \`object-fit: cover;\` | Fills the box completely, cropping overflow — never leaves gaps, may cut off edges |
| \`object-contain\` | \`object-fit: contain;\` | Shrinks to fit entirely inside the box, preserving aspect ratio — may leave empty space (letterboxing) |
| \`object-fill\` | \`object-fit: fill;\` | Stretches to fill the box exactly, ignoring aspect ratio — usually distorts the image |
| \`object-scale-down\` | \`object-fit: scale-down;\` | Behaves like \`contain\` or the image's natural size, whichever is smaller |
| \`object-none\` | \`object-fit: none;\` | Ignores the box entirely, renders at natural size (and gets clipped by any overflow rule) |

\`object-cover\` is what you reach for the vast majority of the time — it's how you get a photo grid where every thumbnail is a perfect, uncropped-looking square or rectangle regardless of the source image's original dimensions.

\`\`\`html
<div class="grid grid-cols-3 gap-2">
  <img class="aspect-square w-full object-cover rounded-md" src="/a.jpg" alt="" />
  <img class="aspect-square w-full object-cover rounded-md" src="/b.jpg" alt="" />
  <img class="aspect-square w-full object-cover rounded-md" src="/c.jpg" alt="" />
</div>
\`\`\`

\`object-contain\` is the right call for things like logos on a colored banner, where cropping would look broken but the source assets come in inconsistent aspect ratios.

### object-position

When \`object-cover\` crops, \`object-position\` controls which part of the image survives the crop:

\`\`\`html
<img class="h-48 w-full object-cover object-top" src="/portrait.jpg" alt="" />
<img class="h-48 w-full object-cover object-bottom" src="/landscape.jpg" alt="" />
<img class="h-48 w-full object-cover object-left" src="/wide.jpg" alt="" />
\`\`\`

The available positions mirror \`background-position\` keywords: \`object-top\`, \`object-bottom\`, \`object-left\`, \`object-right\`, \`object-center\` (default), plus the four corners like \`object-left-top\`. For a portrait photo cropped into a short wide banner, \`object-top\` usually keeps the subject's face in frame where \`object-center\` (the default) might crop it out.

> **Key idea:** \`overflow-hidden\` clips, \`overflow-auto\` scrolls only when needed; \`hidden\` removes an element and its space, \`invisible\` removes only its visibility while keeping its space reserved. For images and video, \`object-cover\` fills the box by cropping (use \`object-position\` to choose what survives the crop), while \`object-contain\` shrinks to fit without cropping.`,
    },
  ],
}
