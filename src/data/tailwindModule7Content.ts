import type { Module } from "../types"

export const tailwindModule7: Module = {
  id: 7,
  title: "CSS Grid in Tailwind",
  status: "upcoming",
  lessons: [
    {
      name: "Grid Container Basics",
      minutes: 9,
      intro: "Turn an element into a grid container and control its columns, rows, and gaps.",
      content: `### Turning an element into a grid

Everything starts with the \`grid\` utility, which sets \`display: grid\` on the element. Its children automatically become grid items — no extra class needed on them:

\`\`\`html
<div class="grid grid-cols-3 gap-4">
  <div class="bg-slate-200 p-4">1</div>
  <div class="bg-slate-200 p-4">2</div>
  <div class="bg-slate-200 p-4">3</div>
</div>
\`\`\`

There's also \`inline-grid\` for \`display: inline-grid\`, which behaves like \`grid\` but sits inline with surrounding content instead of taking a full block-level row.

### grid-cols-* — defining columns

\`grid-cols-{n}\` creates \`n\` equal-width columns using \`repeat(n, minmax(0, 1fr))\`. Tailwind ships numbered utilities from \`grid-cols-1\` through \`grid-cols-12\`, which covers the vast majority of layouts:

| Class | Generated CSS |
|-------|----------------|
| \`grid-cols-1\` | \`grid-template-columns: repeat(1, minmax(0, 1fr));\` |
| \`grid-cols-2\` | \`grid-template-columns: repeat(2, minmax(0, 1fr));\` |
| \`grid-cols-4\` | \`grid-template-columns: repeat(4, minmax(0, 1fr));\` |
| \`grid-cols-12\` | \`grid-template-columns: repeat(12, minmax(0, 1fr));\` |
| \`grid-cols-none\` | \`grid-template-columns: none;\` — no explicit columns at all |

\`\`\`html
<div class="grid grid-cols-4 gap-2">
  <div class="bg-indigo-200 p-4">A</div>
  <div class="bg-indigo-200 p-4">B</div>
  <div class="bg-indigo-200 p-4">C</div>
  <div class="bg-indigo-200 p-4">D</div>
</div>
\`\`\`

That \`minmax(0, 1fr)\` (rather than plain \`1fr\`) matters more than it looks — it's what stops a grid track from stretching past its share of space just because a child (like a long unbreakable string, or an image) wants to be wider. Without the \`minmax(0, ...)\` floor, grid tracks default to \`auto\` as their minimum size and can blow out the layout.

Need a column count Tailwind doesn't ship a named utility for, or a custom track template entirely? Drop into an arbitrary value:

\`\`\`html
<div class="grid grid-cols-[200px_1fr_100px] gap-4">
  <div>sidebar</div>
  <div>content</div>
  <div>ads</div>
</div>
\`\`\`

Underscores inside an arbitrary value stand in for spaces, since class names can't contain literal spaces.

### grid-rows-* — defining rows

\`grid-rows-{n}\` works the same way for the row axis, generating \`repeat(n, minmax(0, 1fr))\` for \`grid-template-rows\`. It's most useful when you want the grid container's own height (set explicitly, or via a flex parent) divided evenly:

\`\`\`html
<div class="grid grid-rows-3 h-72 gap-2">
  <div class="bg-emerald-200">row 1</div>
  <div class="bg-emerald-200">row 2</div>
  <div class="bg-emerald-200">row 3</div>
</div>
\`\`\`

Tailwind provides \`grid-rows-1\` through \`grid-rows-6\` out of the box, plus \`grid-rows-none\`. Most UIs don't need an explicit row template at all — rows are usually left to size automatically based on content, which is what happens if you skip \`grid-rows-*\` entirely.

### gap-*, gap-x-*, gap-y-*

Grid gutters use the same \`gap\` scale as flexbox, based on Tailwind's spacing scale (the same numbers you already know from \`p-4\`, \`m-2\`, etc.):

\`\`\`html
<div class="grid grid-cols-3 gap-4">      <!-- 1rem gap on both axes -->
<div class="grid grid-cols-3 gap-x-8">    <!-- 2rem horizontal gap only -->
<div class="grid grid-cols-3 gap-y-2">    <!-- 0.5rem vertical gap only -->
<div class="grid grid-cols-3 gap-x-6 gap-y-2"> <!-- different gap per axis -->
\`\`\`

| Class | Gap |
|-------|-----|
| \`gap-0\` | \`0px\` |
| \`gap-1\` | \`0.25rem\` (4px) |
| \`gap-2\` | \`0.5rem\` (8px) |
| \`gap-4\` | \`1rem\` (16px) |
| \`gap-8\` | \`2rem\` (32px) |
| \`gap-x-4\` | \`column-gap: 1rem\` |
| \`gap-y-4\` | \`row-gap: 1rem\` |

Reach for \`gap-*\` instead of margins between grid children whenever you can — margins on individual items get fiddly at the edges of a grid (you end up needing to strip the margin on the first/last item), whereas \`gap\` only ever adds space *between* tracks, never around the outside of the grid.

### Putting it together: a simple dashboard shell

\`\`\`html
<div class="grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] gap-0 h-screen">
  <header class="col-span-2 bg-slate-900 text-white flex items-center px-4">
    Dashboard
  </header>
  <aside class="bg-slate-100 p-4">Sidebar</aside>
  <main class="bg-white p-6">Content</main>
</div>
\`\`\`

This combines an explicit column template, an explicit row template, and \`col-span-2\` (covered next lesson) to make the header stretch across both columns.

> **Key idea:** \`grid\` + \`grid-cols-*\`/\`grid-rows-*\` define the *tracks* of your layout, and \`gap-*\` controls the space between them — reach for named utilities (\`grid-cols-4\`) for even splits and arbitrary values (\`grid-cols-[200px_1fr]\`) the moment you need asymmetric or fixed-size tracks.`,
    },
    {
      name: "Placing & Spanning Items",
      minutes: 9,
      intro: "Control exactly which cells a grid item occupies with span and line-based placement.",
      content: `### col-span-* and row-span-*

By default, each grid item occupies exactly one cell. \`col-span-{n}\` makes an item stretch across \`n\` columns, and \`row-span-{n}\` does the same for rows:

\`\`\`html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2 bg-sky-200 p-4">Spans 2 columns</div>
  <div class="bg-sky-200 p-4">Normal</div>
  <div class="bg-sky-200 p-4">Normal</div>
  <div class="col-span-3 bg-sky-300 p-4">Spans all 3 columns</div>
</div>
\`\`\`

Tailwind ships \`col-span-1\` through \`col-span-12\`, plus \`col-span-full\` (equivalent to \`1 / -1\` — always spans every column regardless of the grid's size, handy for a full-width banner row inside a grid you don't want to hardcode a number into):

\`\`\`html
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-full bg-amber-200 p-4">Always full width</div>
  <div class="bg-white p-4">1</div>
  <div class="bg-white p-4">2</div>
  <div class="bg-white p-4">3</div>
  <div class="bg-white p-4">4</div>
</div>
\`\`\`

\`row-span-{n}\` and \`row-span-full\` mirror this for the row axis — useful for a sidebar or a featured card that needs to stand taller than its neighbors:

\`\`\`html
<div class="grid grid-cols-3 grid-rows-3 gap-4 h-96">
  <div class="row-span-3 bg-rose-200 p-4">Tall sidebar</div>
  <div class="bg-white p-4">A</div>
  <div class="bg-white p-4">B</div>
  <div class="bg-white p-4">C</div>
  <div class="bg-white p-4">D</div>
</div>
\`\`\`

### Line-based placement: col-start / col-end / row-start / row-end

\`span\` utilities are relative ("cover 2 tracks from wherever I land"). Sometimes you need to pin an item to *specific* grid lines instead — Tailwind exposes that with \`col-start-{n}\`, \`col-end-{n}\`, \`row-start-{n}\`, and \`row-end-{n}\`, where \`{n}\` is a grid line number (lines are numbered starting at 1, and a grid with \`n\` columns has \`n + 1\` column lines):

\`\`\`html
<div class="grid grid-cols-6 gap-2">
  <div class="col-start-2 col-end-5 bg-purple-200 p-4">
    Starts at line 2, ends at line 5 (spans 3 columns)
  </div>
</div>
\`\`\`

| Class | CSS |
|-------|-----|
| \`col-start-2\` | \`grid-column-start: 2;\` |
| \`col-end-5\` | \`grid-column-end: 5;\` |
| \`col-start-1\` | start at the first line |
| \`col-end-7\` | end at the last line of a 6-column grid |
| \`col-start-auto\` | resets to \`auto\` (let the grid decide) |

You can combine a start line with a span using the arbitrary-value \`col-start-*\` plus \`col-span-*\` together, or express a span directly in an arbitrary value:

\`\`\`html
<!-- equivalent ways to say "start at line 3, cover 2 columns" -->
<div class="col-start-3 col-span-2">...</div>
<div class="col-[3_/_span_2]">...</div>
\`\`\`

Negative line numbers count from the end, which is exactly how \`col-span-full\`'s \`1 / -1\` works under the hood — line \`-1\` is always the last line of the grid, no matter how many columns it has.

\`row-start-*\` / \`row-end-*\` behave identically on the row axis:

\`\`\`html
<div class="grid grid-cols-3 grid-rows-4 gap-2 h-96">
  <div class="row-start-1 row-end-3 col-start-1 bg-teal-200 p-4">
    Occupies rows 1-2 in column 1
  </div>
</div>
\`\`\`

### grid-flow-row, grid-flow-col, grid-flow-dense

\`grid-auto-flow\` controls how items that *aren't* explicitly placed get auto-placed into the grid:

| Class | Behavior |
|-------|----------|
| \`grid-flow-row\` | Default — fills row by row, adding new rows as needed |
| \`grid-flow-col\` | Fills column by column instead, adding new columns as needed |
| \`grid-flow-dense\` | Like \`grid-flow-row\`, but backfills earlier gaps left by spanning items |
| \`grid-flow-row-dense\` | Explicit dense + row |
| \`grid-flow-col-dense\` | Explicit dense + column |

\`grid-flow-dense\` is worth knowing specifically: without it, a spanning item can leave an awkward empty cell behind it that the algorithm won't backfill. With \`dense\`, the browser is allowed to reorder later items visually to plug that hole — great for masonry-ish photo grids where visual order matters more than DOM order:

\`\`\`html
<div class="grid grid-cols-4 grid-flow-dense gap-2">
  <div class="col-span-2 row-span-2 bg-orange-200 p-4">Big</div>
  <div class="bg-orange-100 p-4">1</div>
  <div class="bg-orange-100 p-4">2</div>
  <div class="bg-orange-100 p-4">3</div>
  <div class="bg-orange-100 p-4">4</div>
  <div class="bg-orange-100 p-4">5</div>
</div>
\`\`\`

Without \`grid-flow-dense\`, items 3-5 would shuffle around the big item's footprint in strict DOM order and potentially leave a gap; with it, the browser fills in whatever fits first.

> **Key idea:** Use \`col-span-*\`/\`row-span-*\` for relative sizing ("cover N tracks"), \`col-start-*\`/\`col-end-*\` (and the row equivalents) when you need to pin an item to exact grid lines, and \`grid-flow-dense\` when auto-placed items are leaving visual gaps you want backfilled.`,
    },
    {
      name: "Responsive & Auto-Fit Grid Layouts",
      minutes: 10,
      intro: "Build self-wrapping card grids with auto-fit/auto-fill and align content with place-* shorthands.",
      content: `### The problem with fixed breakpoint grids

A common first attempt at a responsive card grid looks like this:

\`\`\`html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- cards -->
</div>
\`\`\`

That works, but it hardcodes exactly three "modes." If the container is 900px wide because it's next to a sidebar (not because the *viewport* is small), you're stuck with whatever column count that breakpoint mapped to — even if 4 columns would actually fit better. CSS Grid has a more flexible answer that doesn't need breakpoints at all: \`auto-fit\`/\`auto-fill\` with \`minmax()\`.

### auto-fit and auto-fill with arbitrary values

Tailwind doesn't ship named utilities for this pattern (it's too open-ended), so you reach for an arbitrary value on \`grid-cols-*\` containing raw CSS:

\`\`\`html
<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
</div>
\`\`\`

Read that as: "generate as many columns as fit, each at least 200px wide, and let them share the remaining space equally (\`1fr\`)." The grid recalculates its column count continuously as the container resizes — no breakpoints, no JavaScript, and it responds to the *container's* width, not the viewport's.

\`auto-fit\` and \`auto-fill\` differ only when there aren't enough items to fill a row:

| Keyword | Behavior with too few items |
|---------|------------------------------|
| \`auto-fit\` | Collapses unused empty tracks to \`0\`, letting existing items stretch to fill the row |
| \`auto-fill\` | Keeps unused empty tracks at their minimum size, so items stay their natural width and leave visible gaps |

\`\`\`html
<!-- 2 cards in a wide container: auto-fit stretches them to fill the row -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
</div>

<!-- same but auto-fill: the 2 cards stay 200px-ish, empty tracks remain -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  <div class="bg-cyan-200 p-4">Card</div>
  <div class="bg-cyan-200 p-4">Card</div>
</div>
\`\`\`

In practice \`auto-fit\` is what you want almost every time you're building a card grid — you rarely want mystery empty columns sitting to the right of your last card.

### Combining grid with responsive prefixes

Auto-fit grids and breakpoint-prefixed grids aren't mutually exclusive — you can still use \`sm:\`/\`lg:\` etc. to adjust the *minimum* card width, gap, or padding at different sizes, which is often the most practical real-world pattern:

\`\`\`html
<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3
            sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] sm:gap-4
            lg:gap-6">
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
</div>
\`\`\`

Or the more traditional explicit-breakpoint version, which is easier to reason about when you want exact control over column counts at each size (e.g. "never more than 4, even on ultrawide monitors"):

\`\`\`html
<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
  <div class="bg-white rounded-lg shadow p-4">Product</div>
</div>
\`\`\`

Both are valid — pick auto-fit when column count genuinely doesn't matter (a photo wall, a tag list), and explicit breakpoints when you need a predictable, designed number of columns at each size (a pricing table, a dashboard).

### place-items, place-content, place-self

These are shorthands that set both the row-axis and column-axis alignment in one utility — \`place-items\` combines \`align-items\` + \`justify-items\`, \`place-content\` combines \`align-content\` + \`justify-content\`, and \`place-self\` combines \`align-self\` + \`justify-self\`.

| Class | Sets |
|-------|------|
| \`place-items-start\` | items to the start of their cell on both axes |
| \`place-items-center\` | items centered on both axes |
| \`place-items-end\` | items to the end of their cell on both axes |
| \`place-items-stretch\` | items stretched to fill their cell (default) |
| \`place-content-center\` | the whole track grid centered within the container (when tracks don't fill it) |
| \`place-content-between\` | extra space distributed between tracks |
| \`place-self-center\` | a single item centered within its own cell, overriding \`place-items\` |

\`\`\`html
<!-- perfectly centered single item, both axes, in one class -->
<div class="grid h-64 place-items-center bg-slate-100">
  <div class="bg-indigo-500 text-white px-6 py-3 rounded">Centered</div>
</div>
\`\`\`

\`\`\`html
<!-- most items align top, one item overrides itself to center -->
<div class="grid grid-cols-3 gap-4 h-40">
  <div class="bg-white p-2">A</div>
  <div class="place-self-center bg-white p-2">B (centered)</div>
  <div class="bg-white p-2">C</div>
</div>
\`\`\`

\`place-items-center\` on a \`grid\` container is one of the most common ways to center a single child both horizontally and vertically — it replaces what used to take several flexbox utilities plus extra markup.

> **Key idea:** \`grid-cols-[repeat(auto-fit,minmax(Npx,1fr))]\` gives you a genuinely responsive grid that reacts to available space rather than fixed breakpoints — reach for it for card/tile layouts, and reach for \`place-items-center\` any time you just need to center something inside a grid cell without extra flexbox wrapper divs.`,
    },
  ],
}
