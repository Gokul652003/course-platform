import type { Module } from "../types"

export const cssModule5: Module = {
  id: 5,
  title: "Positioning & Stacking",
  status: "upcoming",
  lessons: [
    {
      name: "The position Property",
      minutes: 14,
      intro: "Learn what each of the five position values actually does to layout flow and offsets, and what \`absolute\` is positioned against.",
      content: `## Five values, one property, very different behavior

Every element in CSS has a \`position\` value whether you set one or not — it defaults to \`static\`. The \`position\` property controls two separate things at once, and most confusion about it comes from not separating them:

1. **Does the element stay in normal document flow, or get pulled out of it?**
2. **What are \`top\`, \`right\`, \`bottom\`, and \`left\` measured against, if anything?**

There are five values: \`static\`, \`relative\`, \`absolute\`, \`fixed\`, and \`sticky\`. This lesson walks through each one against those two questions, then closes with a table you can use as a reference.

## \`position: static\` — the default

\`\`\`css
.box {
  position: static;
}
\`\`\`

This is what every element has unless you say otherwise. In static positioning:

- The element sits exactly where normal document flow puts it — block elements stack top to bottom, inline elements flow left to right and wrap.
- The \`top\`, \`right\`, \`bottom\`, \`left\`, and \`z-index\` properties **do nothing at all**. They're not just ignored quietly — they have no effect on a statically positioned element, full stop.

If you've never explicitly set \`position\` on something, it's static, and that's usually correct. You only reach for the other four values when you specifically need one of: an offset anchor, removal from flow, or stacking control.

## \`position: relative\` — offset, but still in flow

\`\`\`css
.box {
  position: relative;
  top: 10px;
  left: 20px;
}
\`\`\`

Relative positioning does something deceptively simple: the element is laid out **exactly as if it were static** — flow, siblings, and space reservation all behave normally — and then it is shifted visually by the given offsets, without affecting anything around it.

Two consequences fall out of that:

- The element's **original space is preserved**. Other elements lay out as though it never moved. If you shift a relatively positioned box down 40px, you'll see it overlap whatever was below it, because that sibling didn't budge.
- The offsets are relative to the element's **own normal position** — \`top: 10px\` moves it 10px down from where it would otherwise sit, not from some ancestor's edge.

\`\`\`html
<div class="row">
  <div class="a">A</div>
  <div class="b">B (shifted)</div>
  <div class="c">C</div>
</div>
\`\`\`

\`\`\`css
.b {
  position: relative;
  top: 15px;
}
\`\`\`

Here, B visually drops 15px and may overlap C, but A and C are laid out as if B never moved — the gap B would have occupied stays exactly where it was.

Relative positioning has a second job that's arguably more common than the offset trick: **it establishes a containing block for absolutely positioned descendants.** That's covered next, and it's the single most important thing to remember about \`relative\`.

## \`position: absolute\` — removed from flow, positioned against an ancestor

\`\`\`css
.box {
  position: absolute;
  top: 0;
  right: 0;
}
\`\`\`

This is where things get more involved, because two things happen simultaneously:

1. The element is **completely removed from normal flow**. It no longer takes up space — siblings lay out exactly as if it didn't exist, and it can overlap them freely.
2. Its \`top\`/\`right\`/\`bottom\`/\`left\` offsets are measured against its **containing block** — not necessarily its direct parent.

### What "containing block" actually means

This is the concept that trips people up, so let's be precise about it. An absolutely positioned element's containing block is **the nearest ancestor whose \`position\` is anything other than \`static\`** (i.e. \`relative\`, \`absolute\`, \`fixed\`, or \`sticky\`). If no ancestor qualifies, the containing block falls all the way back to the **initial containing block** — effectively the viewport, at the root of the document.

That's why \`position: relative\` is so often applied to a parent that otherwise does nothing visually — it isn't there to be offset itself, it's there purely to **catch** any absolutely positioned children and give them something closer than the viewport to anchor against.

\`\`\`html
<div class="card">
  <span class="badge">New</span>
  <h3>Product name</h3>
  <p>Description text goes here.</p>
</div>
\`\`\`

\`\`\`css
.card {
  position: relative; /* establishes the containing block */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: crimson;
  color: white;
  padding: 2px 8px;
  border-radius: 999px;
}
\`\`\`

Walk through what actually happens here: \`.badge\` is pulled out of flow entirely, so it takes up zero space inside \`.card\` — the heading and paragraph lay out as if the badge weren't there. Its \`top: -8px; right: -8px\` are then measured against \`.card\`'s padding box, because \`.card\` is the nearest positioned ancestor, pinning the badge just outside the card's top-right corner.

Now remove \`position: relative\` from \`.card\`. Nothing else changes, but the badge's containing block jumps all the way up to the viewport — it would now sit pinned near the top-right corner of the entire page, wherever the card happens to be scrolled to. This is the single most common "why is my absolutely positioned element in the wrong place" bug, and the fix is almost always: add \`position: relative\` to the intended parent.

A few more details worth knowing:

- Setting \`position: absolute\` without setting any of \`top\`/\`right\`/\`bottom\`/\`left\` leaves the element at its normal in-flow position visually, but it's still removed from flow for layout purposes (siblings act like it's gone).
- Absolutely positioned elements normally shrink-to-fit their content for width/height unless offsets on opposing sides (e.g. both \`left\` and \`right\`) are set, in which case the element stretches to fill the gap between them.
- \`display\` is computed as \`block\` for absolutely positioned elements regardless of what you set — an absolutely positioned \`span\` behaves like a block box.

## \`position: fixed\` — anchored to the viewport

\`\`\`css
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
\`\`\`

Fixed positioning behaves like absolute positioning in every way — removed from flow, offsets active — except its containing block is **always the viewport**, not the nearest positioned ancestor. That's what makes it useful for things like sticky headers, cookie banners, and "back to top" buttons: no matter how far the page scrolls, a fixed element stays glued to the same spot on screen.

There's an important gotcha: a \`fixed\` element's containing block stops being the viewport if any ancestor has a \`transform\`, \`filter\`, \`perspective\`, or \`will-change\` value that creates a new containing block context (most commonly \`transform\` set to anything other than \`none\`). In that case the fixed element becomes anchored to that transformed ancestor instead of the viewport — a frequent source of "my \`position: fixed\` modal stopped working" bugs after someone added an animation \`transform\` to a parent.

## \`position: sticky\` — a hybrid of relative and fixed

\`\`\`css
.header {
  position: sticky;
  top: 0;
}
\`\`\`

Sticky positioning behaves like \`relative\` (in flow, taking up its normal space) **until** the element would scroll past a threshold you define with an offset (\`top: 0\` here), at which point it behaves like \`fixed\` **within the bounds of its nearest scrolling ancestor** — it sticks in place as the page keeps scrolling, then un-sticks and resumes normal flow once its containing block scrolls out of view.

Practical example: a section header that should stay visible at the top of the viewport while its section scrolls by, then get pushed out once the next section's own sticky header takes over.

\`\`\`html
<section>
  <h2 class="section-header">Chapter 1</h2>
  <p>...lots of content...</p>
</section>
<section>
  <h2 class="section-header">Chapter 2</h2>
  <p>...lots of content...</p>
</section>
\`\`\`

\`\`\`css
.section-header {
  position: sticky;
  top: 0;
  background: white;
}
\`\`\`

Each \`h2\` sticks to the top of the viewport as its section scrolls, then gets shoved offscreen by the next section's own sticky \`h2\` arriving — no JavaScript required.

### Sticky's common gotchas

- **A \`top\` (or equivalent) offset is required.** Without one, a sticky element behaves exactly like \`relative\` — it has no threshold to stick at.
- **\`overflow\` on an ancestor breaks stickiness.** If any ancestor between the sticky element and the scrolling container has \`overflow: hidden\`, \`overflow: auto\`, or \`overflow: scroll\` (and isn't itself the intended scroll container), the sticky behavior can silently stop working, because the element's scroll boundary is now that ancestor's box, not the one you expected.
- **Sticky is scoped to its immediate containing block**, not the whole page — it stops sticking once its parent scrolls out of view, it doesn't stay stuck forever.
- **Height matters.** A sticky element with no defined bounds on its parent behaves oddly — sticky positioning is inherently bounded by the parent's box, so a parent that's only as tall as its sticky child gives the child no room to actually "stick" for any noticeable scroll distance.

## Comparing all five

| Value | In normal flow? | Takes up space? | Offsets relative to | Typical use |
|---|---|---|---|---|
| \`static\` | Yes | Yes | N/A (offsets ignored) | Default — most elements |
| \`relative\` | Yes | Yes (original space kept) | Its own normal position | Nudging visually, or anchoring absolute children |
| \`absolute\` | No | No | Nearest positioned ancestor (or viewport) | Badges, dropdowns, tooltips, overlays |
| \`fixed\` | No | No | Viewport (unless a transformed ancestor intervenes) | Sticky headers, modals, toasts |
| \`sticky\` | Yes, until threshold | Yes | Nearest scrolling ancestor, within its containing block's bounds | Section headers, sticky table headers |

> **Key idea:** \`position\` answers two questions at once — whether an element stays in flow, and what its offsets are measured against — and \`absolute\`'s containing block is the nearest ancestor with any non-\`static\` position, falling back to the viewport if none exists, which is why "just add \`position: relative\` to the parent" fixes so many layout bugs.`,
    },
    {
      name: "Z-index & Stacking Contexts",
      minutes: 15,
      intro: "Understand what actually determines paint order, why z-index sometimes does nothing, and how nested stacking contexts trap z-index values.",
      content: `## Stacking order without z-index

Before touching \`z-index\` at all, it helps to know that the browser already has a well-defined answer for "what paints on top of what" — \`z-index\` only ever overrides part of it.

With no positioning and no \`z-index\` anywhere, elements stack in a fairly intuitive order, back to front:

1. The root element's background and borders.
2. Non-positioned block-level descendants, in **source order** (later elements in the HTML paint over earlier ones where they overlap).
3. Non-positioned floated elements.
4. Inline content.
5. Positioned elements (anything with \`position\` other than \`static\`), again in source order among themselves, on top of everything above.

That last rule is worth sitting with: **merely giving an element \`position: relative\` (with no \`z-index\` at all) already lifts it above all non-positioned content**, purely because "positioned" outranks "not positioned" in the default stacking order. This is a common source of confusion — someone adds \`position: relative\` to fix an absolute-positioning containing-block issue, and unrelated content nearby suddenly appears to change stacking order, even though no \`z-index\` was touched.

## What z-index actually does

\`\`\`css
.modal {
  position: fixed;
  z-index: 1000;
}
\`\`\`

\`z-index\` lets you override source order for **positioned elements** — it only has an effect on an element whose \`position\` is \`relative\`, \`absolute\`, \`fixed\`, or \`sticky\`. Set \`z-index\` on a statically positioned element and, like the offset properties, it simply does nothing.

That said, positioning isn't the only way to make \`z-index\` apply. Modern CSS also honors \`z-index\` on:

- Flex items and grid items (children of a \`display: flex\` or \`display: grid\` container), even without \`position\` set.
- Elements with \`opacity\` less than \`1\`.
- Elements with a \`transform\`, \`filter\`, \`will-change\`, \`isolation: isolate\`, or a handful of other properties — all of these create a stacking context of their own (more on that next), and once an element has a stacking context, its \`z-index\` becomes meaningful even outside classic positioning.

Higher \`z-index\` values paint on top of lower ones, among elements that are being compared **within the same stacking context**. That qualifier — "within the same stacking context" — is the part that causes almost every real \`z-index\` bug.

## Stacking contexts: the part that actually matters

A **stacking context** is a self-contained unit for paint order. Once an element creates one, every positioned/z-indexed descendant inside it is compared *only against its siblings inside that same context* — never directly against elements in a different stacking context, no matter what z-index values are involved.

An element creates a new stacking context when any of these are true (this is a partial but practical list):

- It's the root element (\`<html>\`).
- It has \`position: relative\` or \`position: sticky\` **and** a \`z-index\` other than \`auto\`.
- It has \`position: absolute\` or \`position: fixed\` **and** a \`z-index\` other than \`auto\`.
- It has \`opacity\` less than \`1\`.
- It has a \`transform\`, \`filter\`, \`backdrop-filter\`, \`perspective\`, or \`will-change\` set to a value that triggers one.
- It has \`isolation: isolate\` (a property that exists specifically to force a new stacking context on purpose, without side effects like \`opacity\` or \`transform\` would carry).
- It's a flex or grid container item with a \`z-index\` other than \`auto\`.

### The trap, concretely

\`\`\`html
<div class="panel">
  <div class="child" style="z-index: 9999;">I have a huge z-index</div>
</div>
<div class="overlay" style="z-index: 1;">I have a tiny z-index</div>
\`\`\`

\`\`\`css
.panel {
  position: relative;
  z-index: 1; /* this alone creates a new stacking context for .panel */
  opacity: 0.99; /* also creates one, just to illustrate — either is enough */
}
.child {
  position: relative;
}
.overlay {
  position: relative;
}
\`\`\`

Even though \`.child\` has \`z-index: 9999\` — enormously higher than \`.overlay\`'s \`z-index: 1\` — \`.overlay\` still paints on top. Here's why: \`.panel\` created its own stacking context (because it's positioned with a real \`z-index\`). Everything inside \`.panel\`, including \`.child\`'s \`z-index: 9999\`, is only ever compared against other things **inside \`.panel\`**. From the outside, the entire \`.panel\` context is represented as a single unit, ranked by \`.panel\`'s own \`z-index: 1\` against \`.overlay\`'s \`z-index: 1\`. \`.child\`'s huge number never gets compared to \`.overlay\` directly — it's trapped inside its parent's context.

This is the rule to internalize: **a z-index value can only ever win or lose against z-index values inside the same stacking context.** No number is "high enough" to escape a parent context — 9999 loses to 2 if the 2 belongs to a sibling of an ancestor stacking context and the 9999 is nested inside a lower-ranked one.

## The classic real bug: "my modal won't go on top"

A near-universal version of this bug: you build a modal with \`position: fixed; z-index: 9999\`, and it still renders underneath some header or card elsewhere on the page, no matter how high you push the number.

The usual cause: some ancestor of the modal (often a layout wrapper, a card, or an animated container) has \`transform\`, \`opacity < 1\`, or a positioned element with its own \`z-index\` — which created a stacking context — and the modal is rendered as a descendant of that wrapper in the DOM. The modal's \`z-index: 9999\` is real, but it's only being compared against siblings inside that wrapper's stacking context, not against the header sitting outside it.

### How to actually debug it

1. **Check the DOM position, not just the CSS.** Is the modal actually rendered as a child of some wrapper with a transform or reduced opacity? Portal it out (render it as a direct child of \`<body>\`, which is exactly what libraries like React's \`createPortal\` exist for) and the problem often disappears immediately, because the modal escapes the trapping context entirely.
2. **Walk up the ancestor chain in devtools** looking for any element with \`transform\`, \`opacity\`, \`filter\`, or a positioned+\`z-index\`'d element — any of these is a stacking-context boundary the modal's z-index can't cross.
3. **Use \`isolation: isolate\` deliberately** when you want to contain stacking on purpose (e.g. so a component's internal z-index values can never leak out and clash with the rest of the page) — it's the "I meant to do this" version of the same mechanism that causes the modal bug by accident.
4. **Resist the urge to just raise the number further.** If \`z-index: 9999\` didn't work, \`z-index: 999999\` won't either — the problem is almost never "not a high enough number," it's a stacking context boundary somewhere in the ancestor chain.

> **Key idea:** \`z-index\` values only ever compete against other z-index values inside the same stacking context — a new context (from positioning + z-index, \`opacity < 1\`, transforms, and more) walls off everything nested inside it, so a huge z-index can still lose to a small one if it's trapped one level too deep.`,
    },
    {
      name: "Classic Layout Techniques & Centering",
      minutes: 13,
      intro: "See why floats once carried entire layouts, meet the clearfix hack, and get a practical map of every centering technique CSS has offered.",
      content: `## Floats: layout's original workaround

Before flexbox (2017-ish browser support) and grid (2017 as well), CSS had no purpose-built layout system at all — \`display: block\` and \`display: inline\` were essentially the only tools, and neither could do "two columns side by side" or "wrap text around an image" on their own. \`float\` was designed for the second problem — image/text wrapping, like a magazine layout — and the community bent it into a general-purpose layout tool because it was the only property that could pull an element out of normal block stacking and let something else flow beside it.

\`\`\`css
.sidebar {
  float: left;
  width: 200px;
}
.main {
  margin-left: 220px;
}
\`\`\`

A floated element is taken out of normal flow horizontally — it shifts to one side, and inline content in the same block context wraps around it. That's genuinely useful for its original purpose (an image floated left with a paragraph wrapping around it) and was, for about a decade, the least-bad way to build multi-column page layouts before anything better existed.

### The clearfix problem

Floats have a specific, famously annoying side effect: **a container with only floated children collapses to zero height**, because floated elements don't contribute to their parent's height calculation the way normal in-flow children do.

\`\`\`html
<div class="row">
  <div class="col" style="float: left;">A</div>
  <div class="col" style="float: left;">B</div>
</div>
\`\`\`

\`\`\`css
.row {
  border: 1px solid red; /* this border collapses to a sliver — .row thinks it's empty */
}
\`\`\`

The fix that became a near-universal convention was the **clearfix hack** — a pseudo-element that forces the container to acknowledge the floats:

\`\`\`css
.row::after {
  content: "";
  display: table;
  clear: both;
}
\`\`\`

This inserts an invisible block after the floated children and clears past them, which forces \`.row\` to expand and contain their height. Every serious CSS framework from the 2010s (Bootstrap included) shipped a variant of this exact hack, usually as a \`.clearfix\` utility class you'd slap onto any container with floated children.

### Why float-based layout mostly disappeared

Float layout worked, but it was never actually designed for this job, and it showed:

- Column heights didn't naturally match — a shorter float column left a visible gap rather than stretching to match its sibling.
- Reordering columns visually independent of source order required extra tricks.
- Vertical centering inside a float layout was close to impossible without absolute positioning or table hacks.
- Every layout needed its own clearfix, and forgetting one silently broke height calculations elsewhere on the page.

Flexbox and grid were built from the ground up to solve exactly these problems — matched heights, real gap control, easy reordering, and genuine centering in both axes — which is why float-based layout is now considered legacy for anything beyond its original job of wrapping text around an occasional image.

## Centering: a tour across CSS history

"How do I center this?" has a different right answer depending on what you're centering and along which axis. Here's the full map.

### 1. \`margin: 0 auto\` — centering a block horizontally

\`\`\`css
.container {
  width: 600px;
  margin: 0 auto;
}
\`\`\`

This only centers a **block-level element horizontally**, and only if it has an explicit (non-auto) \`width\` that's narrower than its parent. Setting both left and right margins to \`auto\` tells the browser to split the remaining horizontal space evenly between them. It does nothing for vertical centering, and does nothing if the element doesn't have a constrained width — a block with no width set already fills its parent, leaving no space to split.

### 2. \`text-align: center\` — centering inline content

\`\`\`css
.caption {
  text-align: center;
}
\`\`\`

This centers **inline and inline-block content** (text, images set to \`inline-block\`, inline links) within their containing block-level element. It has no effect on the block-level container itself — it only affects how that container's inline content is laid out inside it. A very common mistake is reaching for \`text-align: center\` to center a block-level \`div\`, which does nothing; that's a job for margin auto or flex/grid.

### 3. Flexbox centering — the modern default for most cases

\`\`\`css
.center {
  display: flex;
  justify-content: center; /* centers along the main axis */
  align-items: center;     /* centers along the cross axis */
}
\`\`\`

This is genuinely both-axis centering, and it works regardless of whether the child's size is known ahead of time — no explicit width/height required on the centered child, unlike the margin-auto trick. \`justify-content\` centers along whichever axis \`flex-direction\` is set to (row by default, so horizontally), and \`align-items\` centers along the perpendicular axis. This combination — often nicknamed "flexbox centering" — became the default recommendation for centering a single child inside a container almost as soon as flex support landed everywhere, because it replaced a half-dozen older hacks with two lines that always work.

### 4. Grid centering — just as capable, sometimes more convenient

\`\`\`css
.center {
  display: grid;
  place-items: center;
}
\`\`\`

\`place-items: center\` is shorthand for \`align-items: center; justify-items: center;\` and centers a grid item on both axes in a single declaration — even shorter than the flex version for the single-child case. Grid tends to be preferred over flex once you have more than one child that needs independent placement (e.g. centering one element while pinning another to a corner via \`place-self\`), since grid's two-dimensional placement model handles that more directly than flex's single-axis-at-a-time model.

### 5. Absolute + transform — centering without a flex/grid container

\`\`\`css
.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
\`\`\`

This is the classic pre-flexbox trick for centering an element **whose size you don't know in advance**, inside a parent you can't (or don't want to) turn into a flex/grid container. \`top: 50%; left: 50%\` moves the child's top-left corner to the center of its containing block, and \`translate(-50%, -50%)\` then shifts the child back by exactly half of *its own* width and height — which is the part that makes this work for unknown sizes, since percentage values in \`transform\` are resolved against the element's own box, not the parent's.

This technique still earns its place today for cases like centering a tooltip or badge over an arbitrary anchor point, or centering something absolutely positioned that must stay out of document flow for other reasons — it's not obsolete, just narrower in scope than flex/grid centering.

### Choosing between them

| Technique | Axes | Needs known size? | Needs container change? | Best for |
|---|---|---|---|---|
| \`margin: 0 auto\` | Horizontal only | Yes (explicit width) | No | Centering a fixed-width block, e.g. a page container |
| \`text-align: center\` | Horizontal only | No | No | Centering inline content/text inside a block |
| Flexbox (\`justify-content\` + \`align-items\`) | Both | No | Yes — container becomes flex | General-purpose single or multi-child centering |
| Grid (\`place-items: center\`) | Both | No | Yes — container becomes grid | Same as flex, plus independent multi-child placement |
| Absolute + \`translate(-50%, -50%)\` | Both | No | No (container just needs \`position: relative\`) | Centering over an anchor without touching the container's display/layout |

In new code, flexbox or grid centering is the right first instinct for almost everything — it's simple, handles unknown sizes, and doesn't require pulling anything out of flow. Reach for \`margin: 0 auto\` specifically for a classic centered page container, \`text-align: center\` specifically for text, and the absolute+transform trick specifically when you need to center something without disturbing the parent's existing layout mode.

> **Key idea:** float-based layout was a workaround the web outgrew once flexbox and grid arrived, but its clearfix hack still explains a specific "collapsed container" bug you'll meet in older code — and centering has no single right technique, only the right technique per axis and per situation, from \`margin: 0 auto\` to flexbox/grid to the absolute+transform trick.`,
    },
  ],
}
