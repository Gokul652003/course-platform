import type { Module } from "../types"

export const cssModule6: Module = {
  id: 6,
  title: "Flexbox",
  status: "upcoming",
  lessons: [
    {
      name: "Flex Containers",
      minutes: 12,
      intro: "Turn any element into a flex container and learn how the main axis, wrapping, and alignment properties actually work together.",
      content: `## Turning an element into a flex container

Everything in flexbox starts with one declaration on a parent element:

\`\`\`css
.row {
  display: flex;
}
\`\`\`

The moment you set \`display: flex\`, two things happen. First, the element itself still participates in normal layout the way a block-level box would (it takes up the full available width by default, stacks with siblings normally). Second — and this is the important part — every **direct child** of that element becomes a **flex item**, and stops following normal block/inline flow entirely. Floats stop working on them, \`vertical-align\` stops applying, and they line up along a single row (or column) governed by an entirely different set of rules.

There's also \`display: inline-flex\`, which does the exact same thing to the children but makes the container itself behave like an inline-level box — it sits inline with surrounding text/elements instead of forcing a line break before and after it, similar to how \`inline-block\` relates to \`block\`. In practice \`inline-flex\` is rare; you reach for it only when you need a flex row that flows inline with text, like a small badge containing an icon and a label sitting mid-sentence.

Only **direct children** become flex items. Grandchildren are untouched — a \`<div>\` nested two levels deep inside a flex container lays out with completely normal block/inline rules unless it's made into a flex or grid container of its own.

## The main axis and the cross axis

This is the single idea that unlocks the rest of flexbox: every flex container has a **main axis** and a **cross axis**, and almost every flexbox property is defined *relative to those axes*, not to literal "horizontal" and "vertical."

By default, \`flex-direction: row\` is in effect, which means:
- The **main axis** runs left-to-right (in a left-to-right language) — items are laid out in a horizontal row.
- The **cross axis** runs top-to-bottom, perpendicular to the main axis.

Picture a container with three boxes side by side. An arrow pointing rightward, labeled "main axis," runs through the center of the row from the first box to the last. A second arrow, perpendicular to it and pointing downward, labeled "cross axis," runs through the height of the row. Every alignment property either controls placement *along* the main axis or *along* the cross axis — never "horizontal" or "vertical" directly, because \`flex-direction\` can flip which is which.

\`\`\`css
.row {
  display: flex;
  flex-direction: row; /* default: main axis = horizontal, cross axis = vertical */
}
\`\`\`

Change \`flex-direction\` to \`column\`, and the axes **rotate 90 degrees**:

\`\`\`css
.column {
  display: flex;
  flex-direction: column; /* main axis = vertical, cross axis = horizontal */
}
\`\`\`

Now items stack top-to-bottom, the main axis runs downward, and the cross axis runs horizontally. This matters enormously because \`justify-content\` (which we'll cover next) always aligns things *along the main axis* — so in a \`row\` it controls horizontal spacing, but in a \`column\` it controls vertical spacing. A lot of flexbox confusion for beginners traces back to expecting \`justify-content\` to always mean "horizontal."

There are two more direction values worth knowing:

\`\`\`css
flex-direction: row-reverse;    /* main axis flipped: last item first, right-to-left */
flex-direction: column-reverse; /* main axis flipped: last item first, bottom-to-top */
\`\`\`

These reverse the *painting order* along the main axis without touching the DOM order — useful occasionally, but be cautious: reversing visual order while keeping DOM/tab order the same can create a confusing mismatch between what a keyboard user tabs through and what a mouse user sees.

## Wrapping onto multiple lines: flex-wrap

By default, flex items try to fit onto **one single line**, shrinking if necessary (more on shrinking in the next lesson) — they never wrap to a new line on their own. That default is \`flex-wrap: nowrap\`.

\`\`\`css
.row {
  display: flex;
  flex-wrap: nowrap; /* default: everything squeezes onto one line */
}
\`\`\`

Set \`flex-wrap: wrap\` and items that no longer fit on the current line flow onto a new line instead of shrinking indefinitely:

\`\`\`css
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
\`\`\`

This is exactly the pattern for something like a row of tags or chips that should reflow onto multiple lines on a narrow screen rather than being crushed unreadably thin.

\`flex-wrap: wrap-reverse\` wraps too, but stacks the new lines in the opposite direction along the cross axis (new lines appear above instead of below, for a \`row\` container). It's rarely used — reach for it only in the unusual case where visually reversing wrapped line order is actually the design intent.

The shorthand \`flex-flow\` combines \`flex-direction\` and \`flex-wrap\` in one declaration:

\`\`\`css
.row {
  flex-flow: row wrap; /* same as flex-direction: row; flex-wrap: wrap; */
}
\`\`\`

## Aligning along the main axis: justify-content

\`justify-content\` distributes items' *extra leftover space* along the main axis. It has no effect if items already fill the container exactly — it only matters when there's slack space to distribute.

\`\`\`css
.row {
  display: flex;
  justify-content: space-between;
}
\`\`\`

| Value | Behavior |
|---|---|
| \`flex-start\` (default) | Items packed at the start of the main axis, extra space after the last item |
| \`flex-end\` | Items packed at the end of the main axis, extra space before the first item |
| \`center\` | Items packed together in the center, extra space split evenly on both ends |
| \`space-between\` | Equal gaps *between* items, no gap at the outer edges (first/last items touch the container edges) |
| \`space-around\` | Equal gaps *around* each item — so edge gaps are half the size of the gaps between items |
| \`space-evenly\` | All gaps, including the outer edges, are exactly equal |

\`space-between\` is the workhorse for things like a navbar (logo on one end, links on the other) or a card footer (price on the left, button on the right). \`space-around\` vs \`space-evenly\` trips people up because they look similar — the difference only becomes visible with items that don't perfectly fill a row: \`space-around\` gives each item's *own* half-gap on either side (so the visual gap between two items is double the edge gap), while \`space-evenly\` normalizes every gap, edges included, to the same width.

## Aligning along the cross axis: align-items

\`align-items\` is the cross-axis counterpart to \`justify-content\` — it controls how items are positioned *perpendicular* to the main axis, within the height (for a row) or width (for a column) of the flex line.

\`\`\`css
.row {
  display: flex;
  align-items: center; /* vertically centers items in a row container */
}
\`\`\`

| Value | Behavior |
|---|---|
| \`stretch\` (default) | Items stretch to fill the cross-axis size of the container (unless they have an explicit size set) |
| \`flex-start\` | Items align to the start of the cross axis |
| \`flex-end\` | Items align to the end of the cross axis |
| \`center\` | Items centered on the cross axis |
| \`baseline\` | Items aligned so their text baselines line up, regardless of individual font size or box height |

The default value, \`stretch\`, is why flex children in a row often end up the same height as each other even though you never set a height anywhere — this is one of flexbox's most useful implicit behaviors, and it's exactly what makes the "equal-height card row" pattern (covered in lesson 3) fall out for free.

\`align-items: baseline\` is the one non-obvious value: it's built for rows where items have mismatched font sizes but you want their *text* to visually line up, like a price label ($) next to a large number next to a small "/mo" suffix.

## align-content: alignment for wrapped lines

\`align-content\` is easy to confuse with \`align-items\` because both sound like they control cross-axis alignment — the difference is that \`align-content\` only does anything **when there are multiple flex lines** (i.e. \`flex-wrap: wrap\` is active and items have actually wrapped). It controls how those *lines*, as a group, are distributed within the container's cross-axis space — the multi-line equivalent of \`justify-content\`, but operating on the cross axis instead of the main axis.

\`\`\`css
.grid-ish {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between; /* spreads wrapped lines apart vertically */
}
\`\`\`

If there's only one line (no wrapping, or the container is exactly tall enough for one line), \`align-content\` has **no visible effect** — \`align-items\` is what governs that single line's alignment instead. This is the single most common reason someone sets \`align-content\` and sees nothing change: their container isn't actually wrapping.

It accepts the same keyword set as \`justify-content\` (\`flex-start\`, \`flex-end\`, \`center\`, \`space-between\`, \`space-around\`, \`space-evenly\`) plus \`stretch\` (the default), which stretches lines to fill the container's cross-axis space evenly.

## Spacing between items: gap, row-gap, column-gap

Before \`gap\` was supported in flexbox, spacing between items required margin tricks — typically a margin on every item except the last, which meant extra selectors like \`:not(:last-child)\` or negative-margin hacks on the container. \`gap\` (and its longhands \`row-gap\` / \`column-gap\`) made all of that unnecessary:

\`\`\`css
.row {
  display: flex;
  gap: 1rem;             /* applies to both row-gap and column-gap */
  /* equivalently: */
  row-gap: 1rem;
  column-gap: 1rem;
}
\`\`\`

\`gap\` creates space **only between items**, never at the outer edges of the container — it behaves like \`space-between\` in that sense, but unlike \`justify-content\`, it's a fixed size rather than a distribution of leftover space, and it applies even when items don't fill the full width. In a \`flex-wrap: wrap\` container, \`row-gap\` controls the space between wrapped lines and \`column-gap\` controls the space between items within a line (these swap meaning if \`flex-direction\` is \`column\`, since "row" and "column" here refer to the visual rows/columns produced by wrapping, not the main axis).

\`gap\` is baseline-available in every modern browser now and is unambiguously the modern default — there's essentially no reason left to reach for margin-based spacing hacks in a flex container.

> **Key idea:** Flexbox properties operate relative to the **main axis** (set by \`flex-direction\`) and the **cross axis** (perpendicular to it) rather than fixed horizontal/vertical directions — \`justify-content\` distributes space along the main axis, \`align-items\`/\`align-content\` align along the cross axis (per-line vs across-all-lines respectively), and \`gap\` adds fixed spacing between items without any margin hacks.`,
    },
    {
      name: "Flex Items",
      minutes: 12,
      intro: "Control how individual items grow, shrink, and reorder with flex-grow, flex-shrink, flex-basis, the flex shorthand, order, and align-self.",
      content: `## Sizing individual items: the three longhands

While the properties in the previous lesson lived on the **container**, the properties in this lesson live on the **items** themselves. Three properties — \`flex-grow\`, \`flex-shrink\`, and \`flex-basis\` — control how each item's size is calculated, and they interact in a way that's worth understanding piece by piece before combining them.

### flex-basis: the starting size

\`flex-basis\` sets an item's size along the main axis *before* any growing or shrinking is applied — think of it as "the size this item would like to start at."

\`\`\`css
.item {
  flex-basis: 200px;
}
\`\`\`

Its default value is \`auto\`, which means "use the item's \`width\` (in a row) or \`height\` (in a column) if set, otherwise size based on content." You can also set it to \`0\` (or \`0%\`), which explicitly ignores content size and starts every item at zero, letting \`flex-grow\` alone decide the final proportions — a common technique for building evenly-proportioned columns.

### flex-grow: sharing extra space

\`flex-grow\` is a unitless number that determines how much of the container's **leftover space** (space left over after every item's basis is accounted for) an item should absorb, relative to its siblings.

\`\`\`css
.item-a { flex-grow: 1; }
.item-b { flex-grow: 2; }
\`\`\`

With this setup, if there's 300px of leftover space, it's divided into 3 shares (1 + 2 = 3): \`.item-a\` gets 1 share (100px extra) and \`.item-b\` gets 2 shares (200px extra) added on top of their respective bases. The default is \`flex-grow: 0\`, meaning items **do not grow** to fill extra space by default — they sit at their basis size and leave any leftover space empty (typically absorbed by \`justify-content\` instead).

Setting \`flex-grow: 1\` on every item in a row is the single most common flexbox idiom in existence — it makes all items share available space equally, growing to fill the container completely.

### flex-shrink: giving up space when there isn't enough

\`flex-shrink\` is the mirror image of \`flex-grow\`: it's a unitless number controlling how much an item shrinks, relative to its siblings, when the container is **too small** to fit everyone at their basis size.

\`\`\`css
.item-a { flex-shrink: 0; } /* never shrinks — stays at its basis size */
.item-b { flex-shrink: 1; } /* absorbs the squeeze */
\`\`\`

The default is \`flex-shrink: 1\`, meaning **items shrink by default** — this is a common source of surprise, since it means flex items can end up smaller than their content unless something stops them (see the min-width gotcha in the next lesson). Setting \`flex-shrink: 0\` on an item — commonly an icon, an avatar, or a fixed-width sidebar — pins it at its basis size and forces everything else to absorb the squeeze instead.

### The flex shorthand

In practice, almost nobody writes \`flex-grow\`, \`flex-shrink\`, and \`flex-basis\` as three separate declarations — the \`flex\` shorthand combines all three, in that order:

\`\`\`css
.item {
  flex: <flex-grow> <flex-shrink> <flex-basis>;
}
\`\`\`

By far the most common value you'll see in real codebases is:

\`\`\`css
.item {
  flex: 1;
}
\`\`\`

\`flex: 1\` expands to \`flex-grow: 1; flex-shrink: 1; flex-basis: 0%\`. That last part is the detail people miss — it's not \`flex-basis: auto\`, it's \`flex-basis: 0%\`, meaning the item's content size is ignored as a starting point and the entire size is computed purely from its \`flex-grow\` share of the container. This is exactly why \`flex: 1\` on a row of items produces perfectly equal-width columns regardless of how much text is inside each one.

A few other shorthand forms worth recognizing:

| Shorthand | Expands to | Common use |
|---|---|---|
| \`flex: 1\` | \`1 1 0%\` | Equal-share growing/shrinking column, ignoring content size |
| \`flex: auto\` | \`1 1 auto\` | Grows and shrinks, but starts from the item's natural content size |
| \`flex: none\` | \`0 0 auto\` | Fixed size — never grows, never shrinks, sized by content/width |
| \`flex: 0 0 200px\` | (explicit) | Fixed 200px item, immune to growing or shrinking — a rigid sidebar |
| \`flex-basis: content\` alone | — | Rare; sizes strictly by content, ignoring \`width\`/\`height\` |

\`flex: auto\` vs \`flex: 1\` is a subtle but real distinction: \`flex: auto\` lets naturally larger content claim more space *before* growth is distributed (because its basis is its content size, not zero), while \`flex: 1\` flattens every item's starting size to zero and distributes purely by the grow ratio, ignoring content size entirely.

### flex-basis vs width: which wins?

A common question: if an item has both \`width: 300px\` and \`flex-basis: 200px\`, which one applies? **\`flex-basis\` takes precedence over \`width\`** (and over \`height\` in a column container) whenever \`flex-basis\` is anything other than \`auto\`. Since \`flex-basis\`'s default is \`auto\`, and \`auto\` explicitly means "fall back to \`width\`/\`height\`," in the common case where you never set \`flex-basis\` explicitly, \`width\` behaves as you'd expect. But the instant a shorthand like \`flex: 1\` sets \`flex-basis: 0%\`, any \`width\` you also declared on that element is effectively overridden for main-axis sizing purposes (it still applies in a column container's cross-axis direction, since that's governed by \`width\` independent of \`flex-basis\`).

The practical rule: if you're using the \`flex\` shorthand to control an item's main-axis size, don't also fight it with \`width\` — pick one source of truth.

## Reordering items: order

\`order\` lets you change an item's *visual* position without touching markup, independent of its DOM order:

\`\`\`css
.item {
  order: 2;
}
\`\`\`

Every flex item has a default \`order\` of \`0\`. Items are laid out in ascending \`order\` value; items with equal \`order\` fall back to DOM order among themselves. Negative values are allowed, useful for pulling one item ahead of everything else without renumbering all the others.

\`\`\`css
.sidebar { order: -1; } /* moves visually first, regardless of DOM position */
\`\`\`

Use \`order\` sparingly. It's genuinely useful for things like "show the primary action button before secondary ones on mobile but after them on desktop," accomplished with a media query. But because it changes *visual* order while leaving DOM order (and therefore tab order and screen-reader reading order) untouched, overusing it creates a mismatch between what sighted mouse users experience and what keyboard/assistive-tech users experience — treat it as a targeted tool, not a general-purpose layout mechanism.

## Overriding cross-axis alignment per item: align-self

\`align-self\` lets one individual item override the container's \`align-items\` value, using the exact same set of keywords (\`flex-start\`, \`flex-end\`, \`center\`, \`baseline\`, \`stretch\`), plus \`auto\` (the default), which means "defer to the container's \`align-items\`."

\`\`\`css
.row {
  display: flex;
  align-items: center; /* everyone centers on the cross axis... */
}

.special-item {
  align-self: flex-start; /* ...except this one, which sticks to the top */
}
\`\`\`

This is the escape hatch for the common case of "everything in this row is vertically centered except one badge that should hug the top" — without \`align-self\`, you'd need a wrapper element or a different layout mechanism entirely just to special-case one item.

> **Key idea:** \`flex-grow\`/\`flex-shrink\`/\`flex-basis\` (usually written as the \`flex\` shorthand) determine an item's size along the main axis, with \`flex-basis\` overriding \`width\`/\`height\` whenever it's not \`auto\` — \`flex: 1\` is the common "share space equally" idiom because it zeroes out content-based basis entirely, while \`order\` and \`align-self\` give individual items visual escape hatches from the container's default order and cross-axis alignment.`,
    },
    {
      name: "Real-World Flexbox Patterns",
      minutes: 11,
      intro: "Build a navbar, an equal-height card row, and a sticky footer with flexbox — plus the shrinking gotchas that catch almost everyone at least once.",
      content: `## Pattern 1: A navbar (logo left, links right)

The classic navbar layout — a logo pinned to the left edge and a cluster of nav links pinned to the right edge — has two equally common flexbox solutions.

**Option A: \`justify-content: space-between\`**, when the navbar has exactly two groups (logo, and a links wrapper):

\`\`\`html
<nav class="navbar">
  <a href="/" class="logo">Acme</a>
  <div class="links">
    <a href="/pricing">Pricing</a>
    <a href="/docs">Docs</a>
    <a href="/login">Log in</a>
  </div>
</nav>
\`\`\`

\`\`\`css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.links {
  display: flex; /* nested flex container for the links themselves */
  gap: 1.5rem;
  align-items: center;
}
\`\`\`

Notice the nested flex container: \`.navbar\` is a flex row with exactly two children (\`.logo\` and \`.links\`), and \`.links\` is *itself* a separate flex row for laying out the individual link items with a \`gap\`. Flex containers nest freely — this two-level structure (outer row splits into two zones, inner row lays out one zone's contents) is extremely common in real navbars, toolbars, and card headers.

**Option B: \`margin-left: auto\` on the item that should "push right."** This works when you don't want to wrap the trailing items in their own container, or you have more than two logical groups:

\`\`\`html
<nav class="navbar">
  <a href="/" class="logo">Acme</a>
  <a href="/pricing">Pricing</a>
  <a href="/docs">Docs</a>
  <a href="/login" class="push-right">Log in</a>
</nav>
\`\`\`

\`\`\`css
.navbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
}

.push-right {
  margin-left: auto; /* absorbs ALL leftover main-axis space to its left */
}
\`\`\`

The trick: a flex item's \`auto\` margin absorbs *all* remaining leftover space on that side, which is why a single \`margin-left: auto\` on "Log in" shoves it (and everything after it, if there were more items) all the way to the right edge, while the items before it stay clustered on the left with their normal \`gap\`. This same trick works in reverse with \`margin-right: auto\` on the second item of a two-item row, achieving an identical result to \`space-between\` without touching \`justify-content\` at all.

Both options are correct; \`space-between\` communicates "two zones" more clearly in the markup, while \`margin-left: auto\` is more flexible when the split point is one item among many rather than a clean two-group structure.

## Pattern 2: An equal-height card row

A row of cards where every card should be the same height — regardless of how much text each one contains — is one of flexbox's best "free" behaviors, because it falls directly out of the default \`align-items: stretch\`:

\`\`\`html
<div class="card-row">
  <article class="card">
    <h3>Short title</h3>
    <p>A little bit of body text here.</p>
  </article>
  <article class="card">
    <h3>A considerably longer title that wraps to two lines</h3>
    <p>Much more body text in this card, enough that it would naturally be a lot taller than its neighbor if nothing forced it to match.</p>
  </article>
  <article class="card">
    <h3>Medium</h3>
    <p>Some medium-length text.</p>
  </article>
</div>
\`\`\`

\`\`\`css
.card-row {
  display: flex;
  gap: 1.5rem;
  align-items: stretch; /* the default — written here for clarity */
}

.card {
  flex: 1; /* equal widths too, if that's desired */
  display: flex;
  flex-direction: column; /* so the card's own children can be arranged vertically */
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
\`\`\`

Because \`.card-row\` never overrides \`align-items\` away from \`stretch\`, every \`.card\` stretches to match the height of the tallest card in the row automatically — no JavaScript measuring, no explicit heights. Making each \`.card\` itself \`display: flex; flex-direction: column\` is a common follow-up move, since it lets you then use \`margin-top: auto\` on a footer element inside the card (a "price" or a "buy" button) to pin it to the card's bottom edge regardless of how much text is above it — the exact same \`auto\`-margin trick from the navbar pattern, just rotated onto the vertical axis of a column container.

## Pattern 3: A sticky footer layout

A "sticky footer" — a footer that stays at the bottom of the viewport on short pages, but gets pushed down naturally by content on long pages (never overlapping it) — is a classic layout problem flexbox solves cleanly:

\`\`\`html
<body class="page">
  <header>...</header>
  <main class="content">...</main>
  <footer>...</footer>
</body>
\`\`\`

\`\`\`css
html, body {
  height: 100%;
}

.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* at least the full viewport height */
}

.content {
  flex: 1; /* absorbs all leftover vertical space, pushing the footer down */
}
\`\`\`

The container is a \`column\` flex box at least as tall as the viewport. The header and footer size themselves by content (their \`flex-grow\` defaults to \`0\`), while \`.content\` has \`flex: 1\`, so it expands to soak up every remaining pixel of vertical space. On a short page, that means \`.content\` stretches tall and the footer sits right at the viewport's bottom edge. On a long page, \`.content\` simply grows past the viewport height (the flex column as a whole grows past \`100vh\` too, since \`min-height\` rather than a fixed \`height\` was used), and the footer is pushed down after it in totally normal document flow — never fixed, never overlapping.

## Gotcha 1: the min-width: auto default causes overflow

This is the single most common flexbox surprise. Flex items have an **implicit default \`min-width: auto\`** (and \`min-height: auto\` in a column container) — which, for content like text or an unbreakable long string, effectively means "never shrink smaller than my content's intrinsic minimum size," *no matter what \`flex-shrink\` says*.

\`\`\`css
.row {
  display: flex;
  width: 300px;
}

.item {
  flex: 1; /* flex-shrink: 1, so this SHOULD be able to shrink... */
  /* ...but min-width: auto silently overrides that if content can't shrink further */
}
\`\`\`

If \`.item\` contains a long unbreakable word, a wide \`<pre>\` block, or a fixed-size image, it will refuse to shrink below that content's natural width even though \`flex-shrink\` says it should — and the row will **overflow its container** instead, often invisibly (no scrollbar, content just clipped or spilling outside the layout). The fix is to explicitly override the default:

\`\`\`css
.item {
  flex: 1;
  min-width: 0; /* explicitly allow shrinking below content's natural size */
}
\`\`\`

Setting \`min-width: 0\` (or \`min-height: 0\` for a column container) is close to a required companion to \`flex: 1\` any time an item might contain long text, a table, or other wide content — it's easy to forget because everything looks fine until content long enough to trigger it shows up.

## Gotcha 2: images don't shrink without min-width: 0 either

The same root cause bites images specifically, often inside cards or media objects:

\`\`\`html
<div class="media">
  <img src="photo.jpg" alt="" />
  <div class="body">
    <p>Some caption text that should wrap normally next to the image.</p>
  </div>
</div>
\`\`\`

\`\`\`css
.media {
  display: flex;
  gap: 1rem;
}

.media img {
  flex-shrink: 0; /* usually intentional: don't squash the image */
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.media .body {
  flex: 1;
  min-width: 0; /* without this, long unbreakable text can force the row to overflow */
}
\`\`\`

Here the image is deliberately pinned with \`flex-shrink: 0\` (you rarely want an avatar squished into an oval), but the *text* sibling still needs \`min-width: 0\` — otherwise a long URL, filename, or other unbreakable string inside \`.body\` refuses to wrap and pushes the whole \`.media\` box wider than its container. The pattern to remember: any flex item holding text or replaced content (images, \`<pre>\`, embeds) that's supposed to wrap or truncate needs an explicit \`min-width: 0\` (or \`overflow: hidden\`, which also establishes a new formatting context that suppresses the intrinsic minimum) if it sits next to a fixed-size sibling.

## Quick reference: the gotchas at a glance

| Symptom | Cause | Fix |
|---|---|---|
| Row overflows container despite \`flex-shrink: 1\` | Default \`min-width: auto\` blocks shrinking below content size | \`min-width: 0\` on the item |
| Text won't wrap, forces horizontal scroll | Same \`min-width: auto\` issue, applied to a text container | \`min-width: 0\` (and \`overflow-wrap: break-word\` if a single long word is the culprit) |
| Column layout overflows vertically | Same issue on the cross axis | \`min-height: 0\` on the item |
| \`align-content\` seems to do nothing | Container isn't actually wrapping onto multiple lines | Check \`flex-wrap: wrap\` is set and the container is actually narrow enough to wrap |

These two gotchas — \`min-width\`/\`min-height: auto\` — are worth committing to memory precisely because the failure mode is silent: no console warning, no obviously broken layout in the common case, just an overflow that only appears once real (long, variable) content replaces your placeholder text during development.

> **Key idea:** Real flexbox layouts are usually a composition of small, well-known idioms — \`space-between\`/\`margin-left: auto\` for two-zone rows, \`flex: 1\` plus the default \`stretch\` for equal-height cards, and a \`column\` flex container with one \`flex: 1\` child for sticky footers — but every one of them can silently overflow unless you remember that flex items default to \`min-width\`/\`min-height: auto\`, which blocks shrinking below content size until you override it explicitly.`,
    },
  ],
}
