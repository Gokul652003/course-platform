import type { Module } from "../types"

export const tailwindModule6: Module = {
  id: 6,
  title: "Flexbox in Tailwind",
  status: "upcoming",
  lessons: [
    {
      name: "Flex Container Basics",
      minutes: 9,
      intro: "Turn any element into a flex container and control which direction its children flow.",
      content: `### Making a flex container

Flexbox is a one-dimensional layout model — it arranges children along a single axis (row or column) and gives you fine control over how they grow, shrink, and align. Everything starts with turning a parent into a flex container:

\`\`\`html
<div class="flex">
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</div>
\`\`\`

\`flex\` sets \`display: flex;\` on the parent. The moment you do this, every direct child becomes a **flex item**, and a whole new set of layout rules kicks in for how those children are sized and spaced — \`float\`, \`vertical-align\`, and \`column-*\` properties on the children stop having any effect.

\`inline-flex\` (\`display: inline-flex;\`) does the same thing but makes the container itself sit inline with surrounding content instead of taking the full available width — useful for compact widgets like a toolbar or a button with an icon that needs to flow next to text.

\`\`\`html
<span class="inline-flex items-center gap-1">
  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" /></svg>
  Online
</span>
\`\`\`

### flex-direction: row vs column

By default, a flex container lays its children out horizontally, left to right. \`flex-direction\` utilities change that:

\`\`\`html
<div class="flex flex-row">Left-to-right (default)</div>
<div class="flex flex-row-reverse">Right-to-left</div>
<div class="flex flex-col">Top-to-bottom</div>
<div class="flex flex-col-reverse">Bottom-to-top</div>
\`\`\`

| Class | CSS | Main axis |
|-------|-----|------|
| \`flex-row\` | \`flex-direction: row;\` | horizontal, left → right |
| \`flex-row-reverse\` | \`flex-direction: row-reverse;\` | horizontal, right → left |
| \`flex-col\` | \`flex-direction: column;\` | vertical, top → bottom |
| \`flex-col-reverse\` | \`flex-direction: column-reverse;\` | vertical, bottom → top |

This choice matters for everything downstream: the "main axis" is whichever direction \`flex-direction\` points, and utilities like \`justify-*\` (next lesson) always act along the main axis, while \`items-*\` always act along the perpendicular **cross axis**. Switching from \`flex-row\` to \`flex-col\` doesn't just stack things vertically — it swaps which axis every alignment utility affects.

\`\`\`html
<!-- A typical responsive pattern: stacked on mobile, row on larger screens -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1 rounded-lg border p-4">Sidebar</div>
  <div class="flex-1 rounded-lg border p-4">Content</div>
</div>
\`\`\`

### flex-wrap: single line vs multiple lines

By default, flex items all try to fit on one line, shrinking if necessary (sometimes painfully so). \`flex-wrap\` lets items drop to a new line instead of being squeezed indefinitely.

\`\`\`html
<div class="flex flex-nowrap">Everything forced onto one line (default)</div>
<div class="flex flex-wrap">Items wrap onto new lines as needed</div>
<div class="flex flex-wrap-reverse">Wraps, but new lines stack above instead of below</div>
\`\`\`

| Class | CSS | Behavior |
|-------|-----|------|
| \`flex-nowrap\` | \`flex-wrap: nowrap;\` | All items stay on one line, shrinking to fit (default) |
| \`flex-wrap\` | \`flex-wrap: wrap;\` | Items that don't fit flow onto additional lines below |
| \`flex-wrap-reverse\` | \`flex-wrap: wrap-reverse;\` | Same wrapping, but the line order is reversed (new lines go above) |

A tag list is the classic case for \`flex-wrap\` — you don't know ahead of time how many tags there'll be or how wide the container is, so you want them to flow naturally like text instead of getting crushed onto a single overflowing line:

\`\`\`html
<div class="flex flex-wrap gap-2">
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">design</span>
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">frontend</span>
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">accessibility</span>
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">performance</span>
  <span class="rounded-full bg-slate-100 px-3 py-1 text-sm">tailwind</span>
</div>
\`\`\`

Without \`flex-wrap\`, that same markup would either overflow its container horizontally or squash every tag down to an unreadable sliver, depending on whether the children can shrink.

### Combining direction and wrap

These two properties are independent and commonly combined:

\`\`\`html
<div class="flex flex-col flex-wrap h-64">
  <!-- fills one column top-to-bottom, then starts a new column -->
</div>
\`\`\`

That pattern — a fixed-height column-flex container with wrapping enabled — is a quick way to get a masonry-ish "fill down then across" arrangement without reaching for CSS Grid.

> **Key idea:** \`flex\` creates the container, \`flex-direction\` (\`flex-row\`/\`flex-col\`, etc.) decides which axis is "main," and \`flex-wrap\` decides whether items that don't fit shrink in place or spill onto new lines. Get these three right first — every alignment and sizing utility in the rest of this module builds on top of them.`,
    },
    {
      name: "Aligning & Justifying Flex Items",
      minutes: 9,
      intro: "Position items along the main axis with justify, along the cross axis with items, and override either per-item with self.",
      content: `### Two axes, two families of utilities

Once you have a flex container, there are two independent questions to answer: how should items be spread out along the **main axis** (the direction \`flex-direction\` points), and how should they line up along the **cross axis** (perpendicular to it)? Tailwind splits these into two utility families: \`justify-*\` for the main axis, \`items-*\` for the cross axis.

\`\`\`html
<div class="flex justify-between items-center h-20 border">
  <div>Left</div>
  <div>Right</div>
</div>
\`\`\`

In a default \`flex-row\` container, that's "spread horizontally, center vertically" — the layout behind more navbars and toolbars than any other single line of Tailwind.

### justify-* — main axis distribution

\`\`\`html
<div class="flex justify-start">...</div>
<div class="flex justify-center">...</div>
<div class="flex justify-end">...</div>
<div class="flex justify-between">...</div>
<div class="flex justify-around">...</div>
<div class="flex justify-evenly">...</div>
\`\`\`

| Class | CSS | Behavior |
|-------|-----|------|
| \`justify-start\` | \`justify-content: flex-start;\` | Items packed at the start of the main axis (default) |
| \`justify-center\` | \`justify-content: center;\` | Items packed together in the center |
| \`justify-end\` | \`justify-content: flex-end;\` | Items packed at the end |
| \`justify-between\` | \`justify-content: space-between;\` | First item flush start, last item flush end, remaining space distributed evenly between |
| \`justify-around\` | \`justify-content: space-around;\` | Equal space around each item (edges get half as much as gaps between items) |
| \`justify-evenly\` | \`justify-content: space-evenly;\` | Truly equal space everywhere, including the outer edges |

\`justify-between\` vs \`justify-around\` vs \`justify-evenly\` is easy to mix up — the difference is entirely about the outer edges. \`between\` gives them none, \`around\` gives them half a gap, \`evenly\` gives them a full gap, same as between any two items.

### items-* — cross axis alignment

\`\`\`html
<div class="flex items-start">...</div>
<div class="flex items-center">...</div>
<div class="flex items-end">...</div>
<div class="flex items-baseline">...</div>
<div class="flex items-stretch">...</div>
\`\`\`

| Class | CSS | Behavior |
|-------|-----|------|
| \`items-start\` | \`align-items: flex-start;\` | Items align to the start of the cross axis |
| \`items-center\` | \`align-items: center;\` | Items centered on the cross axis |
| \`items-end\` | \`align-items: flex-end;\` | Items align to the end of the cross axis |
| \`items-baseline\` | \`align-items: baseline;\` | Items align by their text baselines — ideal when mixing different font sizes |
| \`items-stretch\` | \`align-items: stretch;\` | Items stretch to fill the container's cross-axis size (default) |

\`items-stretch\` being the default is why, without any \`items-*\` class, flex children in a row often all end up the same height — they're stretching to match whichever sibling is tallest. This is genuinely useful (equal-height cards) but surprises people who expected children to size purely to their own content.

\`items-baseline\` earns its own mention: it's the right choice whenever you're aligning text of different sizes side by side, like a price and its "/month" suffix, so the baselines line up instead of the boxes' edges.

\`\`\`html
<div class="flex items-baseline gap-1">
  <span class="text-3xl font-bold">$29</span>
  <span class="text-sm text-slate-500">/month</span>
</div>
\`\`\`

### self-* — overriding alignment per item

\`items-*\` sets the cross-axis alignment for every child at once. Any individual child can override that with a \`self-*\` utility on itself:

\`\`\`html
<div class="flex items-center h-32 border">
  <div class="p-2 bg-slate-100">Centered like its siblings</div>
  <div class="self-start p-2 bg-slate-100">Pinned to the top instead</div>
  <div class="self-end p-2 bg-slate-100">Pinned to the bottom instead</div>
</div>
\`\`\`

\`self-auto\`, \`self-start\`, \`self-center\`, \`self-end\`, \`self-stretch\`, and \`self-baseline\` mirror the \`items-*\` options exactly, just scoped to one flex item instead of the whole container.

### gap-* vs space-x/y-*

Both \`gap-*\` and \`space-x-*\`/\`space-y-*\` put visual space between flex children, but they work differently and it's worth knowing why \`gap-*\` is generally the better default in modern Tailwind.

\`\`\`html
<div class="flex gap-4">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>

<div class="flex space-x-4">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
\`\`\`

| | \`gap-4\` | \`space-x-4\` |
|---|---|---|
| CSS mechanism | \`gap\` property on the container | negative margin trick via \`margin-left\` on all-but-first child |
| Works with \`flex-wrap\` | Yes — applies evenly between wrapped lines too | Awkward — horizontal gaps don't carry to the next line correctly |
| Affects child's own margin | No | Yes — adds a real \`margin-left\`, which can interact oddly with other margin utilities on the same child |
| Direction-aware (RTL) | Automatically | Requires the separate \`space-x-reverse\` utility |

\`gap-*\` is the newer, cleaner mechanism (backed by the actual CSS \`gap\` property, which flexbox has supported for years now) and is almost always what you want for spacing flex or grid children. \`space-x-*\`/\`space-y-*\` still show up in a lot of existing Tailwind code and work fine for simple non-wrapping rows, but reach for \`gap-*\` by default in new code — especially anything that might wrap.

\`\`\`html
<div class="flex flex-wrap gap-3">
  <!-- gap-3 correctly spaces items both horizontally AND between wrapped rows -->
</div>
\`\`\`

> **Key idea:** \`justify-*\` distributes items along the main axis, \`items-*\` aligns them along the cross axis, and \`self-*\` lets one item break from the group's cross-axis alignment. For spacing between items, prefer \`gap-*\` over \`space-x/y-*\` — it uses the real CSS \`gap\` property, handles wrapped lines correctly, and doesn't leave stray margins on your children.`,
    },
    {
      name: "Flex Sizing & Real Layout Patterns",
      minutes: 10,
      intro: "Control how items grow and shrink with flex/grow/shrink/basis, then build three layouts you'll reuse constantly.",
      content: `### grow, shrink, and basis individually

Every flex item has three underlying properties that decide how it's sized: \`flex-grow\` (does it expand into leftover space?), \`flex-shrink\` (does it compress when space is tight?), and \`flex-basis\` (what's its size before growing/shrinking is applied?). Tailwind exposes each on its own:

\`\`\`html
<div class="grow">Grows to fill available space (flex-grow: 1)</div>
<div class="grow-0">Never grows (flex-grow: 0, default)</div>

<div class="shrink">Shrinks if needed (flex-shrink: 1, default)</div>
<div class="shrink-0">Never shrinks below its content size</div>

<div class="basis-64">Starting size of 16rem before grow/shrink apply</div>
<div class="basis-1/3">Starting size of one third of the container</div>
<div class="basis-auto">Starting size based on content/width (default)</div>
\`\`\`

| Class | CSS |
|-------|-----|
| \`grow\` | \`flex-grow: 1;\` |
| \`grow-0\` | \`flex-grow: 0;\` |
| \`shrink\` | \`flex-shrink: 1;\` |
| \`shrink-0\` | \`flex-shrink: 0;\` |
| \`basis-<size>\` | \`flex-basis: <size>;\` (spacing scale, fractions, or \`auto\`) |

\`shrink-0\` is one of the most useful individual utilities in this whole family — it's what stops an image, icon, or avatar from getting visually crushed when its flex row runs out of room, forcing everything else to shrink instead.

\`\`\`html
<div class="flex items-center gap-3">
  <img class="h-10 w-10 shrink-0 rounded-full" src="/avatar.jpg" alt="" />
  <p class="truncate">A long piece of text that might otherwise squeeze the avatar</p>
</div>
\`\`\`

### The flex-* shorthands

Because grow/shrink/basis are so often set together, Tailwind also ships shorthand combinations matching CSS's own \`flex\` shorthand:

\`\`\`html
<div class="flex-1">flex: 1 1 0%     — grow, shrink, ignore content size</div>
<div class="flex-auto">flex: 1 1 auto  — grow, shrink, start from content size</div>
<div class="flex-initial">flex: 0 1 auto — shrink only, start from content size (default-ish)</div>
<div class="flex-none">flex: none      — never grow or shrink, fixed at content size</div>
\`\`\`

| Class | CSS | When to use it |
|-------|-----|------|
| \`flex-1\` | \`flex: 1 1 0%;\` | Equal-width/height items that should split remaining space evenly, ignoring their own content size |
| \`flex-auto\` | \`flex: 1 1 auto;\` | Items that should grow/shrink but start from their natural content size as a baseline |
| \`flex-initial\` | \`flex: 0 1 auto;\` | Items that can shrink if needed but won't grow to fill extra space |
| \`flex-none\` | \`flex: none;\` | Items that must stay exactly their content/declared size — sidebars, icons, fixed-width columns |

\`flex-1\` is the one you'll type constantly — "take up whatever space is left, split evenly with any sibling that also has \`flex-1\`."

### Pattern 1: a responsive navbar with a spacer

\`\`\`html
<header class="flex items-center gap-4 border-b px-6 py-3">
  <span class="font-bold text-lg">Acme</span>
  <nav class="flex gap-4 text-sm text-slate-600">
    <a href="/product">Product</a>
    <a href="/pricing">Pricing</a>
    <a href="/docs">Docs</a>
  </nav>
  <div class="flex-1"></div>
  <button class="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Sign in</button>
</header>
\`\`\`

The empty \`<div class="flex-1"></div>\` is the classic "spacer" trick: an invisible flex item that absorbs every pixel of leftover space, pushing everything after it (the sign-in button) to the far end of the row without needing \`justify-between\` to split the whole layout into just two groups. It's especially handy once you have three or more logical groups and \`justify-between\`'s even two-way split stops being flexible enough.

### Pattern 2: a card row that wraps and stays evenly sized

\`\`\`html
<div class="flex flex-wrap gap-4">
  <div class="flex-1 min-w-64 rounded-lg border p-4">
    <h3 class="font-semibold">Starter</h3>
    <p class="mt-1 text-sm text-slate-500">For small teams getting started.</p>
  </div>
  <div class="flex-1 min-w-64 rounded-lg border p-4">
    <h3 class="font-semibold">Growth</h3>
    <p class="mt-1 text-sm text-slate-500">For teams scaling fast.</p>
  </div>
  <div class="flex-1 min-w-64 rounded-lg border p-4">
    <h3 class="font-semibold">Enterprise</h3>
    <p class="mt-1 text-sm text-slate-500">Custom limits and support.</p>
  </div>
</div>
\`\`\`

\`flex-1\` makes the three cards share space evenly when there's room for all of them on one line. \`min-w-64\` combined with \`flex-wrap\` is what makes this responsive without a single media query: once the container gets too narrow for three 16rem-minimum cards side by side, they wrap onto additional lines instead of being crushed thinner and thinner.

### Pattern 3: a sidebar + content layout

\`\`\`html
<div class="flex min-h-screen">
  <aside class="w-64 shrink-0 border-r bg-slate-50 p-4">
    <nav class="flex flex-col gap-2 text-sm">
      <a href="/overview" class="rounded-md px-3 py-2 hover:bg-slate-100">Overview</a>
      <a href="/analytics" class="rounded-md px-3 py-2 hover:bg-slate-100">Analytics</a>
      <a href="/settings" class="rounded-md px-3 py-2 hover:bg-slate-100">Settings</a>
    </nav>
  </aside>
  <main class="flex-1 p-6">
    <h1 class="text-2xl font-semibold">Overview</h1>
    <p class="mt-2 text-slate-600">Main content area, fills all remaining width.</p>
  </main>
</div>
\`\`\`

This is the workhorse app-shell layout: the outer container is \`flex\` (row by default), the sidebar is a fixed \`w-64\` with \`shrink-0\` so it never gets compressed even on a narrow viewport, and \`<main>\` is \`flex-1\` so it silently claims every remaining pixel of width. Inside the sidebar, \`flex\` \`flex-col\` stacks the nav links vertically — a reminder that nothing stops you from nesting flex containers with different \`flex-direction\` values inside each other; it's the normal way complex layouts get built.

> **Key idea:** \`flex-1\` (grow, shrink, ignore basis) is your default for "split remaining space evenly"; \`shrink-0\` protects fixed-size elements like avatars and sidebars from being crushed; and an empty \`flex-1\` spacer div is the standard trick for pushing a navbar's trailing items to the far edge. Combine \`flex-wrap\` with a \`min-w-*\` on each item to get responsive card grids without writing a single media query.`,
    },
  ],
}
