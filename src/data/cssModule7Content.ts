import type { Module } from "../types"

export const cssModule7: Module = {
  id: 7,
  title: "CSS Grid",
  status: "upcoming",
  lessons: [
    {
      name: "Grid Containers",
      minutes: 12,
      intro: "Turn an element into a grid, define its tracks with the fr unit and repeat(), control spacing with gap, and understand what happens when content overflows the grid you defined.",
      content: `## From one dimension to two

Flexbox is fundamentally **one-dimensional** — you lay items out along a single row or a single column, and while wrapping lets a flex container spill onto multiple lines, each line doesn't know or care what the others are doing. **CSS Grid** is different: it's **two-dimensional** by design. You define rows and columns together, as a single coordinated layout, and items can be placed precisely into that structure — spanning multiple rows, multiple columns, or both.

This doesn't make Grid "better" than Flexbox — they solve different problems, and most real interfaces use both. Flexbox is usually the right tool for a toolbar, a button group, or anything where content should dictate size along one axis. Grid is the right tool the moment you're thinking in terms of a page layout, a card grid, or anything where you want rows *and* columns to line up together.

### Turning an element into a grid container

Like Flexbox, Grid starts with one declaration on the parent:

\`\`\`css
.container {
  display: grid;
}
\`\`\`

This makes \`.container\` a **grid container** and every direct child a **grid item**. On its own, \`display: grid\` doesn't do much visually — by default you get a single-column grid where each child stacks on its own implicit row, similar to block layout. The real power shows up once you start defining tracks.

There's also \`display: inline-grid\`, the grid equivalent of \`inline-block\`: the container itself participates in inline layout (it sits alongside text or other inline elements rather than taking a full line), while its *contents* are still laid out using the full grid algorithm. It's rare in practice — most grid containers are block-level regions like page sections or card wrappers — but it exists for the same reason \`inline-block\` does.

### Defining columns and rows

The columns and rows of a grid are called **tracks**. You define them explicitly with \`grid-template-columns\` and \`grid-template-rows\`, listing a size for each track you want:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
}
\`\`\`

This creates a grid with **three column tracks**, each 200px wide, and **two row tracks**, each 100px tall — six cells total. Grid items are placed into these cells automatically, one per cell, in source order, filling left-to-right then wrapping to the next row (this is the default *auto-placement* behavior — lesson 2 covers controlling it explicitly).

Track sizes aren't limited to fixed lengths. Any valid length or percentage works, along with a few grid-specific keywords:

| Value | Meaning |
|---|---|
| \`200px\` | Fixed size, never changes |
| \`25%\` | Percentage of the grid container's size |
| \`auto\` | Sized to fit its content, up to the space available |
| \`min-content\` | Smallest size that avoids overflow (e.g. the widest unbreakable word) |
| \`max-content\` | Size the content would take with no wrapping at all |
| \`minmax(150px, 300px)\` | Never smaller than 150px, never larger than 300px |
| \`1fr\` | A share of the leftover space (see below) |

### The fr unit

The \`fr\` unit is the piece that makes Grid genuinely pleasant to work with, and it doesn't exist anywhere else in CSS. It stands for a **fraction of the leftover space** in the grid container — space that remains *after* every fixed-size, content-sized, and non-\`fr\` track has already claimed what it needs.

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
\`\`\`

Three equal columns, each getting one-third of the container's width. Change the ratio and the split changes with it:

\`\`\`css
.container {
  grid-template-columns: 2fr 1fr 1fr;
}
\`\`\`

Now the first column gets **half** the space (2 parts out of 4 total parts), and the other two get a quarter each. This is conceptually similar to \`flex-grow\`, but it's simpler to reason about because it applies to a whole track, defined in one place, instead of accumulating from individual item declarations.

\`fr\` tracks can mix freely with fixed tracks — this is one of the most common real layouts on the web:

\`\`\`css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
}
\`\`\`

A fixed 240px sidebar, and a main content column that fills *everything else*, however wide the viewport happens to be. No calc(), no percentage math, no flex-basis juggling — the \`1fr\` track simply absorbs whatever is left.

One subtlety worth knowing: \`fr\` distributes space that's left over *after* content minimums are respected. If a \`1fr\` track contains content that can't shrink below, say, 400px (an image, a long unbreakable string), that track will grow past its "fair share" to accommodate it, taking space from other \`fr\` tracks in the process. In practice this rarely surprises you, but it's why Grid is described as content-aware rather than purely proportional.

### repeat()

Writing \`1fr 1fr 1fr 1fr 1fr 1fr\` for a six-column grid works, but it's noisy and error-prone to edit. \`repeat()\` generates a pattern of tracks for you:

\`\`\`css
.container {
  grid-template-columns: repeat(6, 1fr);
}
\`\`\`

That's identical to writing \`1fr\` six times. The pattern inside \`repeat()\` can itself contain more than one track size, and it repeats the whole group:

\`\`\`css
.container {
  grid-template-columns: repeat(3, 100px 1fr);
}
\`\`\`

This produces six tracks total: \`100px 1fr 100px 1fr 100px 1fr\` — a repeating "label, value" pattern, useful for things like a form-style two-column grid where every row has a fixed-width label and a flexible value field.

\`repeat()\` also accepts the keyword \`auto-fill\` or \`auto-fit\` in place of a number, which tells the browser to generate as many tracks as fit — that combination (paired with \`minmax()\`) is the backbone of responsive card grids, covered in depth in lesson 3.

### gap, row-gap, column-gap

Before Grid (and later, Flexbox), spacing between items had to be faked with margins — and margins on edge items had to be manually corrected or wrapped in an extra container to avoid uneven outer edges. Grid has real, built-in gutters:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
\`\`\`

\`gap\` is shorthand for \`row-gap\` and \`column-gap\`. Set them independently when rows and columns need different spacing:

\`\`\`css
.container {
  row-gap: 24px;
  column-gap: 16px;
}
\`\`\`

Gaps only ever apply *between* tracks — never at the outer edge of the grid — so you don't get the classic "extra margin on the first/last item" problem that plagued pre-gap flex and float layouts. If you need space around the whole grid too, that's ordinary padding on the container, not part of \`gap\` at all.

Note that \`gap\` works on Flexbox containers too (it's not Grid-exclusive), but it shipped for Grid first and remains far more central to how Grid layouts are typically written, since Grid almost always has both rows and columns to space out.

### Implicit vs explicit grid

Everything so far has been the **explicit grid** — tracks you named yourself with \`grid-template-columns\`/\`grid-template-rows\`. But what happens when there are more items than defined cells?

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* only columns defined — no grid-template-rows */
}
\`\`\`

With nine items in a three-column grid, you get three rows — but those row tracks were never declared. The browser generates them automatically, and this auto-generated territory is the **implicit grid**. By default, implicit rows size themselves to \`auto\` (fit their content), but you can control that with \`grid-auto-rows\`:

\`\`\`css
.container {
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 120px;
}
\`\`\`

Now every implicitly-created row is a fixed 120px, no matter how many items overflow into new rows. \`grid-auto-rows\` accepts the same values as \`grid-template-rows\` — including \`minmax()\`, which is a common pairing:

\`\`\`css
.container {
  grid-auto-rows: minmax(100px, auto);
}
\`\`\`

That guarantees every implicit row is *at least* 100px tall, but lets it grow if its content needs more. The equivalent for the column axis is \`grid-auto-columns\`, used when items overflow the *column* dimension instead — which only happens when \`grid-auto-flow: column\` is in play (see below), since the default flow direction is row-by-row.

\`grid-auto-flow\` controls the *direction* new implicit tracks get added in, and it's worth knowing the three common values now even though full placement control is lesson 2's topic:

\`\`\`css
.container {
  grid-auto-flow: row; /* default: fill across, wrap to new rows */
}
\`\`\`

\`row\` (the default) fills the explicit column tracks left-to-right, then creates new implicit *rows* as needed. \`grid-auto-flow: column\` flips this: it fills defined row tracks top-to-bottom and creates new implicit *columns* — useful for things like a fixed-height row of cards that should scroll horizontally rather than wrap. There's also a \`dense\` keyword that can be appended to either (\`grid-auto-flow: row dense\`) which back-fills earlier gaps left by irregularly-sized items instead of always moving forward — covered alongside placement in lesson 2, since it only matters once items span multiple tracks.

### A complete example

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(150px, auto);
  gap: 12px;
}
\`\`\`

\`\`\`html
<div class="gallery">
  <img src="a.jpg" alt="" />
  <img src="b.jpg" alt="" />
  <img src="c.jpg" alt="" />
  <!-- ...more images... -->
</div>
\`\`\`

Four equal columns (explicit), rows that are at least 150px but can grow (implicit, since no \`grid-template-rows\` was set), and consistent 12px gutters in both directions — a complete, responsive-ready photo grid in five lines of CSS, with no media queries required yet to reflow at different widths (that comes with \`auto-fit\`/\`auto-fill\` in lesson 3).

> **Key idea:** \`display: grid\` plus \`grid-template-columns\`/\`rows\` defines your **explicit** tracks, where the \`fr\` unit distributes leftover space proportionally and \`repeat()\` avoids repeating yourself; anything that overflows those tracks lands in the **implicit** grid, whose size and growth direction you still control via \`grid-auto-rows\`/\`columns\`/\`flow\`.`,
    },
    {
      name: "Placing Items",
      minutes: 13,
      intro: "Move beyond auto-placement: position items precisely with line numbers, name whole regions with grid-template-areas, and understand how the auto-placement algorithm fills in the gaps.",
      content: `## Two ways to place an item

By default, Grid places items for you — in source order, one per cell, following whatever \`grid-auto-flow\` direction is active. That's often exactly what you want. But Grid also lets you take over placement completely, in two complementary ways: **line-based placement**, where you position an item by the numbered grid lines it should span between, and **named areas**, where you sketch the whole layout as a picture made of names. Most real layouts end up using a mix of both.

### Grid lines are numbered, not the cells

Every grid has numbered **lines** running between its tracks — not the cells themselves. A three-column grid has four vertical column lines (1, 2, 3, 4); a two-row grid has three horizontal row lines. Line numbers start at 1 on the outer edge and count up; negative numbers (\`-1\`, \`-2\`, ...) count from the *opposite* edge inward, which is handy for "span to the last line" without knowing exactly how many tracks exist.

\`\`\`
   col-line 1   col-line 2   col-line 3   col-line 4
       |            |            |            |
       [  track 1   ][  track 2  ][  track 3   ]
\`\`\`

### grid-column and grid-row

\`grid-column\` and \`grid-row\` place an item by naming the start and end line it should occupy, separated by a slash:

\`\`\`css
.item {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
\`\`\`

This item starts at column line 1 and ends at column line 3 — spanning **two column tracks** (tracks 1 and 2) — while occupying a single row track (between row lines 1 and 2). The shorthand is genuinely a shorthand: \`grid-column\` sets \`grid-column-start\`/\`grid-column-end\`, and \`grid-row\` sets \`grid-row-start\`/\`grid-row-end\`, which you can also set individually.

Instead of specifying an end line explicitly, you can say how many tracks to span with the \`span\` keyword — often more robust, since it doesn't depend on knowing the exact total line count:

\`\`\`css
.item {
  grid-column: 1 / span 2; /* start at line 1, span 2 columns */
  grid-row: span 3; /* span 3 rows, starting wherever auto-placement puts it */
}
\`\`\`

To make an item stretch across the *entire* grid regardless of how many columns exist, negative line numbers are the idiomatic move:

\`\`\`css
.banner {
  grid-column: 1 / -1;
}
\`\`\`

\`-1\` always refers to the last line, no matter how many tracks the grid ends up having — so this rule keeps working even if \`grid-template-columns\` changes later.

| Declaration | Meaning |
|---|---|
| \`grid-column: 2\` | Start at line 2, default 1-track span |
| \`grid-column: 2 / 4\` | Start at line 2, end at line 4 (spans 2 tracks) |
| \`grid-column: 2 / span 2\` | Start at line 2, span 2 tracks forward |
| \`grid-column: span 2 / 4\` | End at line 4, span 2 tracks backward |
| \`grid-column: 1 / -1\` | Full width, edge to edge |

### grid-template-areas: naming the layout itself

Line numbers are precise, but they don't read like a layout — you have to mentally reconstruct the grid to understand what \`grid-column: 2 / 4\` actually produces. \`grid-template-areas\` takes the opposite approach: you draw the layout using names, and the CSS visually resembles the page it describes.

First, name each cell's area on the container using \`grid-template-areas\`, then assign each item to one of those names with \`grid-area\`:

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
\`\`\`

\`\`\`html
<div class="page">
  <aside class="sidebar">Nav</aside>
  <header class="header">Header</header>
  <main class="main">Content</main>
  <footer class="footer">Footer</footer>
</div>
\`\`\`

Read the \`grid-template-areas\` value and you're looking at an ASCII picture of the page: a sidebar running down the full left side across all three rows, with header/main/footer stacked in the right column. That's the entire point of this syntax — the CSS *is* the wireframe. Changing the layout later (say, moving the sidebar to the right) is a matter of editing a string, not recalculating line numbers.

A few rules the syntax enforces:

- Each row of the string is one row of the grid; each quoted word is one cell.
- An area's cells must form a solid **rectangle** — an L-shape or a non-rectangular region is invalid and gets ignored by the browser.
- The same name can repeat across multiple cells (row-wise and/or column-wise) to make one item span that whole rectangle, as \`sidebar\` does above.
- Use a period, \`.\`, to leave a cell deliberately empty (no item placed there):

\`\`\`css
grid-template-areas:
  "header header header"
  "sidebar main   ."
  "footer footer footer";
\`\`\`

Here the bottom-right cell in the main row is intentionally blank — nothing occupies it, and no item can accidentally auto-place there.

### Auto-placement: the algorithm behind the defaults

Every item that *doesn't* get explicit placement (no \`grid-column\`/\`grid-row\`/\`grid-area\`) still needs to land somewhere, and that's governed by the **auto-placement algorithm** — the same mechanism that made lesson 1's plain \`display: grid\` examples "just work."

The algorithm walks through un-placed items in source order and, for each one, finds the next open cell according to the current \`grid-auto-flow\`:

- \`grid-auto-flow: row\` (the default) — scan left-to-right along the current row; if no free cell fits, move to the next row (creating an implicit one if needed) and continue from its start.
- \`grid-auto-flow: column\` — the same idea rotated 90 degrees: scan top-to-bottom down the current column, then move to the next column.
- \`grid-auto-flow: row dense\` / \`column dense\` — appending \`dense\` changes the algorithm from "always move forward" to "backfill any earlier gap that's now big enough," which packs the grid more tightly when items of different sizes are mixed in.

\`dense\` is worth seeing in context, because the difference is easy to miss in the abstract. Take a grid where one item explicitly spans two columns:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: row; /* try changing to: row dense */
}
.featured {
  grid-column: span 2;
}
\`\`\`

Without \`dense\`, if \`.featured\` can't fit in the remaining space of its row, the algorithm leaves that gap behind and moves every following item forward past it — the gap stays empty. With \`row dense\`, later smaller items are allowed to backfill that leftover gap out of strict source order, producing a visually tighter grid with no holes. The tradeoff is exactly that reordering: DOM order and visual order can diverge, which matters for keyboard and screen-reader navigation, so \`dense\` is best reserved for layouts where visual density genuinely matters more than reading order (masonry-style image grids, dashboards) — not content people are meant to tab through in a meaningful sequence.

### Mixing explicit and auto-placed items

In practice, most grids don't choose one placement style exclusively. A dashboard might explicitly place one "hero" widget with \`grid-area\` or \`grid-column: span 2\`, while leaving a dozen smaller cards to auto-place around it in normal source order — the algorithm simply treats already-placed cells as unavailable and flows everything else around them.

> **Key idea:** line-based placement (\`grid-column\`/\`grid-row\`, with \`span\` and negative indices) gives precise numeric control, \`grid-template-areas\` + \`grid-area\` gives a self-documenting visual layout for named regions, and anything left unplaced falls through to the auto-placement algorithm, whose direction (\`row\`/\`column\`) and packing behavior (\`dense\`) you control with \`grid-auto-flow\`.`,
    },
    {
      name: "Real-World Grid Patterns",
      minutes: 14,
      intro: "Build a responsive card grid with auto-fit vs auto-fill, assemble a full holy-grail page layout from grid-template-areas, and get a first look at subgrid.",
      content: `## Pattern 1: the responsive card grid

The single most common real-world Grid pattern is a card gallery that reflows its column count automatically as the viewport resizes — with **zero media queries**. It's built from three pieces you've already seen individually: \`repeat()\`, \`minmax()\`, and one of two keywords, \`auto-fit\` or \`auto-fill\`, used in place of a track count.

\`\`\`css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
\`\`\`

Read this as: "fit as many 220px-minimum columns as will comfortably fit the container, and let them share any leftover space equally." As the container narrows, columns drop out and remaining ones reflow to fill the width; as it widens, more columns appear. No breakpoints, no JavaScript — the algorithm figures out the count from available space alone.

### auto-fit vs auto-fill — the actual difference

These two keywords are nearly identical and this is one of the most common points of confusion in Grid, so it's worth being precise. Both compute the **same number of tracks** — as many as will fit the container at the given minimum size. The difference only shows up when there are **fewer items than tracks that could fit**, i.e. when the row isn't full:

- \`auto-fill\` keeps every track it computed, even the empty ones. Those empty tracks still take up their share of space, so existing items **don't stretch** to fill the row — they stay their \`minmax()\` size (or their \`1fr\` share of only the *occupied plus filled* space), leaving visible empty columns.
- \`auto-fit\` collapses any track that ends up with no item in it down to zero width, effectively removing it from the layout. The leftover space that track would have taken gets redistributed to the *fr* portion of the remaining, actually-occupied tracks — so they stretch to fill the row.

\`\`\`css
/* 3 items in a container wide enough for 5 columns */
.auto-fill { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.auto-fit  { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
\`\`\`

With \`auto-fill\`, you'd see 3 cards at 200px-ish width followed by visible empty space where the 2 unused tracks still reserve room. With \`auto-fit\`, those 2 empty tracks collapse to nothing and the 3 real cards stretch to share the full row between them.

| | auto-fill | auto-fit |
|---|---|---|
| Empty tracks | Kept at full size, stay empty | Collapsed to 0, removed from layout |
| Items with room to spare | Stay at their minmax size | Stretch to fill available space |
| Best for | Grids that should keep a fixed "slot" rhythm (e.g. a form grid, a calendar) | Card/gallery grids where fewer items should still fill the row nicely |

In practice, **\`auto-fit\` is what most people actually want** for a card gallery — it's why so much copy-pasted "responsive grid" CSS uses it. Reach for \`auto-fill\` specifically when you want unused tracks to keep reserving their visual slot rather than collapsing (imagine a grid of calendar day-slots, where you want a consistent grid rhythm even on a sparse month).

### Pattern 2: the holy-grail layout

The "holy grail" layout — header, footer, a main content area, and sidebars on one or both sides — was notoriously fiddly with floats, and workable-but-verbose with Flexbox (nested flex containers, source-order tricks for a visually-first sidebar). With \`grid-template-areas\` it becomes close to literal:

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header header"
    "sidebar main   aside"
    "footer  footer footer";
  min-height: 100vh;
  gap: 16px;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
\`\`\`

\`\`\`html
<div class="page">
  <header class="header">Site Header</header>
  <nav class="sidebar">Navigation</nav>
  <main class="main">Main content</main>
  <aside class="aside">Related links</aside>
  <footer class="footer">Site Footer</footer>
</div>
\`\`\`

\`header\` and \`footer\` each span all three columns because their name repeats across the whole top and bottom rows of the area string. \`main\`'s width is entirely governed by the \`1fr\` middle column track — it automatically absorbs whatever space the two fixed 200px sidebars don't use, exactly like the two-column sidebar layout from lesson 1, just with a third column mirrored on the other side.

Making this responsive for narrow viewports is a matter of redefining the *same* area names inside a media query — the elements themselves and their class names never change, only the shape of the grid they're placed into:

\`\`\`css
@media (max-width: 700px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
  }
}
\`\`\`

Every area collapses to a single column and stacks in whatever order the strings list them — no need to touch HTML source order or fight visual-order CSS tricks the way a Flexbox version of this often requires.

### Pattern 3: an intro to subgrid

Everything so far treats each grid as its own independent coordinate system — a grid item that is *itself* a grid container defines a completely new set of tracks, unrelated to its parent's. That's usually fine, but it breaks down when nested content needs to **line up** with the outer grid — the classic case is a row of cards where each card has an image, a title, and a description, and you want every card's title to align horizontally with every other card's title, even though the amount of text (and therefore the "natural" title height) differs card to card.

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* image row, title row, description row */
}
\`\`\`

With \`grid-template-rows: subgrid\`, \`.card\` stops defining its own independent row tracks and instead **adopts the row tracks of its parent grid** for the rows it spans. If one card's title wraps to two lines and pushes that card's title-row taller, every sibling card's title row grows to match, because they're now all sharing the same set of tracks rather than each sizing itself in isolation. Without \`subgrid\`, each \`.card\` would size its own rows purely from its own content, and titles across cards would drift out of alignment the moment their text lengths differed.

The same idea applies to columns via \`grid-template-columns: subgrid\`, and a subgrid can adopt rows, columns, or both. Browser support for subgrid is solidly baseline-available now, but it's a feature that rewards a slow, deliberate introduction — the mental model of "this nested grid has no tracks of its own, it borrows its parent's" takes a beat to click, and the full depth of subgrid (naming lines through multiple levels, combining it with \`grid-template-areas\`, gap inheritance) is its own dedicated module later in this course. For now, the takeaway is narrower: reach for subgrid specifically when nested items need to align to an *ancestor's* tracks, not just to each other.

### Choosing between the patterns

| Situation | Reach for |
|---|---|
| Unknown number of same-sized cards, want auto reflow | \`repeat(auto-fit, minmax(...))\` |
| Fixed page regions (header/sidebar/main/footer) | \`grid-template-areas\` |
| Precise, few-item placement by coordinates | \`grid-column\`/\`grid-row\` line numbers |
| Nested grid items must align to an outer grid's tracks | \`subgrid\` |

These aren't mutually exclusive — the holy-grail example above already nests naturally: each \`main\` region could itself be a \`repeat(auto-fit, minmax(...))\` card grid, and any of those cards could use \`subgrid\` internally. Grid layouts compose the same way components do.

> **Key idea:** \`repeat(auto-fit, minmax(...))\` builds a reflowing card grid with zero media queries — reach for \`auto-fit\` when empty tracks should collapse and remaining items should stretch, \`auto-fill\` when they should hold their slot; \`grid-template-areas\` turns a page-level layout into a literal, editable ASCII wireframe; and \`subgrid\` lets nested grid items line up with an ancestor's tracks instead of sizing themselves in isolation.`,
    },
  ],
}
