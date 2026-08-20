import type { Module } from "../types"

export const cssModule2: Module = {
  id: 2,
  title: "The Box Model & Display",
  status: "upcoming",
  lessons: [
    {
      name: "The Box Model",
      minutes: 11,
      intro: "Understand the four boxes every element is built from, why box-sizing: border-box became the default everyone reaches for, and how margins collapse.",
      content: `## Every element is four nested boxes

Before you can reliably size or space anything in CSS, you need a mental model of what a single element actually *is*. Every rendered element — a \`<div>\`, a \`<p>\`, a button — is made of four nested rectangular boxes, from the inside out:

1. **Content box** — where your text or child elements actually render, sized by \`width\`/\`height\`.
2. **Padding box** — transparent space around the content, inside the border. Set with \`padding\`.
3. **Border box** — a visible (or invisible) line wrapping the padding. Set with \`border\`.
4. **Margin box** — transparent space *outside* the border, separating this element from its neighbors. Set with \`margin\`.

This is called, unsurprisingly, the **box model**, and it applies to every element on the page whether you think about it or not. The visual difference between padding and margin trips up beginners constantly: **padding is inside the border and takes the element's own background color with it; margin is outside the border and is always transparent, showing whatever is behind the element.** If you give an element a background color and some padding, the padding area is colored. Give it margin instead, and that space stays see-through no matter what.

\`\`\`css
.card {
  width: 300px;
  padding: 24px;
  border: 2px solid #1e293b;
  margin: 16px;
  background: #f1f5f9;
}
\`\`\`

In that example, the background color fills the content box *and* the padding box (both are inside the border), but stops dead at the border line. The 16px margin outside is never colored — it just pushes neighboring elements away.

### The sizing gotcha: what does \`width\` actually measure?

Here's where the box model causes real bugs. By default, CSS uses \`box-sizing: content-box\`, which means \`width\` and \`height\` apply **only to the content box** — padding and border are added *on top of* that width, making the element's total rendered size bigger than the number you wrote.

\`\`\`css
.box {
  box-sizing: content-box; /* the default, if unset */
  width: 300px;
  padding: 20px;
  border: 5px solid black;
}
/* Rendered width = 300 (content) + 20 + 20 (padding) + 5 + 5 (border) = 350px */
\`\`\`

You asked for \`width: 300px\` and got an element that's 350px wide on screen. That's rarely what anyone wants, especially in layouts where you're trying to fit elements into a fixed-width row or grid track — add padding to one of them and it silently overflows its container.

### box-sizing: border-box fixes this

\`box-sizing: border-box\` changes what \`width\`/\`height\` measure: they now include padding and border, so the number you set *is* the final rendered size, and the content area shrinks to make room instead.

\`\`\`css
.box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 5px solid black;
}
/* Rendered width = 300px, exactly as written.
   Content area shrinks to 300 - 20 - 20 - 5 - 5 = 250px. */
\`\`\`

| | \`content-box\` (default) | \`border-box\` |
|---|---|---|
| \`width\`/\`height\` measures | Content only | Content + padding + border |
| Adding padding/border | Grows the total element size | Shrinks the content area, total size unchanged |
| Mixing % widths with px padding | Frequently overflows the parent | Always fits as specified |
| Mental overhead | You must add padding/border by hand to predict size | \`width\` is the size, full stop |

Because \`border-box\` is so much easier to reason about, nearly every real-world project applies it globally with a universal selector reset near the top of the stylesheet:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

This is one of the few "just always do this" rules in CSS. It doesn't change how anything looks by default — it changes how \`width\`, \`height\`, padding, and border interact, so that sizes stay predictable once you start combining them. You'll see this reset at the top of essentially every stylesheet, every CSS framework, and every browser reset file (including modern ones like \`modern-normalize\`). If you only remember one line from this lesson, make it this one.

### Margin collapsing

Margins have a quirk that padding and border don't: **vertical margins between block-level elements can collapse into a single margin**, instead of adding together. This is one of the most confusing parts of CSS for newcomers, mostly because it only happens in specific situations and never to horizontal margins.

**Adjacent siblings.** When one block element's bottom margin touches the next element's top margin, the two don't stack — the browser keeps only the *larger* of the two as the actual gap.

\`\`\`css
p {
  margin-top: 20px;
  margin-bottom: 30px;
}
\`\`\`

\`\`\`html
<p>First paragraph.</p>
<p>Second paragraph.</p>
\`\`\`

You might expect a 50px gap between the paragraphs (30px + 20px). What you actually get is **30px** — the larger of the two collapses the smaller one away entirely. This is intentional: it's meant to make stacked vertical rhythm (headings, paragraphs) behave sensibly without every author having to manually zero out either the top or bottom margin.

**Parent and first/last child.** If a parent element has no border, no padding, and no content separating it from its child, the child's margin can "escape" through the parent and collapse with the parent's own margin — as if the child's margin were applied to the parent instead.

\`\`\`html
<div class="parent">
  <p class="child">I have margin-top: 40px.</p>
</div>
\`\`\`

\`\`\`css
.child {
  margin-top: 40px;
}
\`\`\`

If \`.parent\` has no border/padding, that 40px doesn't push the \`<p>\` down *inside* the div — it pushes the whole \`.parent\` div down, because the margin collapsed straight through the parent's boundary. This surprises people constantly: "I set margin on the child, why did the *parent* move?"

**What stops collapsing.** Any of the following on the parent breaks the collapse between parent and child, because they create a real boundary the margin can no longer cross:

- Any \`border\` on the parent
- Any \`padding\` on the parent
- An established **Block Formatting Context** on the parent, e.g. \`overflow: hidden\`/\`auto\` (not \`visible\`), \`display: flow-root\`, \`display: flex\`/\`grid\` (these also stop collapsing between the children themselves, since flex/grid items don't use normal margin collapsing at all — more on flex and grid layout in a later module)
- \`display: flow-root\` exists specifically as a zero-side-effect way to say "contain everything inside this box, including margins" without the older \`overflow: hidden\` hack, which had the side effect of also clipping overflowing content.

Margins **never** collapse horizontally, and they never collapse across elements that use \`display: flex\`, \`display: grid\`, or float/absolute positioning — collapsing is strictly a "normal-flow, block-level, vertical" phenomenon.

### Negative margins

Margins can be negative, which pulls an element (or its neighbors) closer together than normal flow would allow — effectively the opposite of positive margin's "push apart."

\`\`\`css
.overlap {
  margin-top: -10px; /* pulls this element upward, overlapping whatever is above it */
}
\`\`\`

A negative margin on one side of an element makes it overlap adjacent content on that side; a negative margin can also make an element's *effective* width larger than its container by pulling its edges outward. It's a legitimate tool (overlapping cards, pulling an element flush against a container edge that has padding) but it's easy to overuse as a layout hack where flexbox/grid gap or spacing utilities would be clearer — treat it as a small correction, not a primary layout mechanism.

> **Key idea:** Every element is content + padding + border + margin nested inside each other; set \`box-sizing: border-box\` globally so \`width\`/\`height\` describe the element's actual rendered size instead of just its content, and remember that adjacent vertical margins (and certain parent/child margins) collapse to the larger value rather than adding together.`,
    },
    {
      name: "Display & Normal Flow",
      minutes: 10,
      intro: "See how the display property decides whether an element behaves like a block, a line of text, or disappears entirely — and how block, inline, and inline-block differ in practice.",
      content: `## display controls how a box participates in layout

Every element has a \`display\` value that determines two things at once: how the element itself behaves relative to its siblings (does it start a new line, or flow inline with text?), and — for elements with children — how *its children* are laid out inside it. This lesson covers **normal flow**: the default block/inline behavior every element has before you opt into something like flexbox or grid.

### display: block

Block-level elements (\`<div>\`, \`<p>\`, \`<h1>\`–\`<h6>\`, \`<section>\`, \`<ul>\`/\`<li>\`, and many more by default) behave like this:

- Each one starts on its own new line, and forces whatever comes after it onto a new line too — they stack vertically.
- They expand to fill **100% of their parent's available width** by default, regardless of how much content they contain.
- \`width\`, \`height\`, and all four margins (top/right/bottom/left) are fully respected.
- Vertical margins on block elements are the ones subject to margin collapsing, covered in the previous lesson.

\`\`\`css
.block-demo {
  display: block; /* the default for div, p, section, etc. */
  width: 200px;
  margin: 10px 0;
}
\`\`\`

Even with an explicit \`width: 200px\`, a block element still occupies the full line — nothing else will sit beside it horizontally unless you take it out of normal flow (float, position, or a flex/grid container).

### display: inline

Inline elements (\`<span>\`, \`<a>\`, \`<strong>\`, \`<em>\`, and similar by default) behave almost oppositely:

- They flow **within a line of text**, alongside other inline content, wrapping to the next line only when they run out of horizontal room — like a word does.
- \`width\` and \`height\` are **ignored entirely**. An inline element sizes itself purely to its content; there is no way to force it wider with those properties.
- Horizontal margin and padding (\`margin-left\`/\`margin-right\`, \`padding-left\`/\`padding-right\`) work and push neighboring inline content away.
- **Vertical** margin (\`margin-top\`/\`margin-bottom\`) is accepted but has **no visual effect** — it doesn't push surrounding lines apart. Vertical padding is applied visually (you'll see the background/border grow) but it can visually overlap the line above/below without pushing them, since it doesn't affect line-box height in the way block padding does.

\`\`\`css
span {
  display: inline; /* the default for span, a, strong, em, etc. */
  width: 300px;    /* silently ignored */
  margin-top: 40px; /* silently has no layout effect */
  padding: 10px;    /* applied, but can overlap adjacent lines */
}
\`\`\`

This is the single most common "why isn't my CSS working" moment for beginners: setting \`width\` or vertical \`margin\` on a \`<span>\` or \`<a>\` and seeing nothing happen, because inline elements were never designed to be sized like boxes — they're designed to behave like a run of text.

### display: inline-block

\`inline-block\` is a deliberate hybrid: the element flows inline with surrounding content like an inline element, but internally behaves like a block for sizing purposes.

- Sits inline with neighboring content, doesn't force a line break before/after itself.
- \`width\`, \`height\`, and **all four margins** (including vertical) are fully respected, just like a block element.
- Commonly used for things like nav links or badges that need explicit padding/width but should still sit in a row of text or alongside siblings.

\`\`\`css
.badge {
  display: inline-block;
  width: 80px;
  padding: 4px 8px;
  margin: 0 4px; /* vertical margin here would actually apply */
}
\`\`\`

One easy-to-miss quirk: because \`inline-block\` (and \`inline\`) elements participate in text layout, whitespace in your HTML between them (a newline or space in the source) can render as a visible gap, since the browser treats that whitespace like a space character between words. Flexbox sidesteps this entirely, which is one small reason it's largely replaced inline-block for row-of-boxes layouts today.

### Quick comparison

| | \`block\` | \`inline\`| \`inline-block\` |
|---|---|---|---|
| Starts on a new line | Yes | No — flows with text | No — flows with text |
| Fills parent's width by default | Yes | No — sized to content | No — sized to content |
| \`width\` / \`height\` respected | Yes | No, ignored | Yes |
| Horizontal margin/padding | Yes | Yes | Yes |
| Vertical margin respected | Yes | No effect | Yes |
| Typical elements | \`div\`, \`p\`, \`section\`, \`h1\` | \`span\`, \`a\`, \`strong\` | Explicit choice — badges, nav items, buttons |

### display: none and display: contents

Two more values are worth knowing now, even though they're not part of the block/inline spectrum:

\`display: none\` removes the element from layout entirely — it takes up no space, as if it were never in the document. It still exists in the DOM (scripts can find it, its properties are still set), it just renders nothing and occupies nothing. This is distinct from \`visibility: hidden\` and \`opacity: 0\`, which the next lesson covers in detail.

\`display: contents\` is the opposite kind of unusual: the element itself disappears as a box (no size, no background, no border rendered for it) but its **children render exactly as if they'd been direct children of the element's own parent**. It's useful for wrapper elements that exist only for semantic/scripting reasons but shouldn't participate in layout — for example, removing an unwanted wrapping \`<div>\` from a CSS grid's item list without removing it from the DOM. Support is solid in modern browsers, but be aware some accessibility tooling has historically handled it inconsistently, so test with a screen reader if you lean on it for anything content-bearing.

### Where this is heading

Everything in this lesson describes **normal flow** — the default block/inline behavior every element has out of the box, with no layout system opted into. The moment you set \`display: flex\` or \`display: grid\` on a container, its *direct children* stop following these block/inline rules entirely and instead follow flexbox's or grid's own layout algorithm — widths, margins, and line-wrapping all work differently for flex/grid items than they do in normal flow. Those systems get their own dedicated modules later in this course; for now, the important thing is recognizing that block/inline/inline-block is the baseline every other layout system deliberately overrides.

> **Key idea:** \`display\` decides both how an element sits among its siblings and how its own sizing rules work — block elements stack and fill width, inline elements flow like text and ignore width/height/vertical-margin, and inline-block gets you inline flow with block-style sizing; flexbox and grid later replace this baseline for a container's direct children.`,
    },
    {
      name: "Overflow & Visibility",
      minutes: 9,
      intro: "Control what happens when content doesn't fit its box, and learn the real differences between hiding an element with visibility, display, and opacity.",
      content: `## When content doesn't fit its box

Every box has a size — set explicitly or determined by its content — but the *content inside* it doesn't always cooperate. A long unbreakable word, an image bigger than its container, or simply more text than a fixed-height box can hold will overflow the box's edges unless you tell the browser what to do about it. That's the \`overflow\` property's job.

### The overflow property

\`overflow\` accepts four core values, and can be set per-axis with \`overflow-x\`/\`overflow-y\`, or both at once with the shorthand \`overflow\`:

- \`visible\` (the default) — content that doesn't fit simply spills outside the box, unclipped. Nothing is hidden and no scrollbar appears; the box's border doesn't actually constrain its content.
- \`hidden\` — anything outside the box's bounds is clipped and invisible. No scrollbar is offered, so clipped content is permanently inaccessible to a mouse or trackpad user (though it may still be reachable via \`scrollIntoView\` from script, or via find-in-page).
- \`scroll\` — the box always shows a scrollbar (or scroll affordance) on that axis, even if the content currently fits and there's nothing to scroll. This can look odd (empty scrollbar track) but guarantees stable layout — the scrollbar's presence never shifts other content around as content length changes.
- \`auto\` — the browser adds a scrollbar only when content actually overflows, and omits it otherwise. This is the value people usually want when they say "make it scrollable" — \`scroll\` is rarely the better choice unless you specifically want a permanently reserved scrollbar gutter.

\`\`\`css
.card-list {
  height: 300px;
  overflow-y: auto;   /* scrolls vertically only if content exceeds 300px */
  overflow-x: hidden;  /* never scroll horizontally, clip anything that would */
}
\`\`\`

Setting \`overflow\` to anything other than \`visible\` on an axis also has a side effect worth knowing: it establishes a new **Block Formatting Context** on that box, which (as mentioned in the box model lesson) stops margin collapsing between that box and its children, and also prevents floated children from "escaping" the box's bottom edge uncontained. This is why \`overflow: hidden\` shows up in a lot of older layout code as a general-purpose fix for float-related bugs, even on elements that have nothing to actually overflow.

| Value | Extra content | Scrollbar |
|---|---|---|
| \`visible\` (default) | Spills outside the box, unclipped | Never |
| \`hidden\` | Clipped, inaccessible to pointer users | Never |
| \`scroll\` | Clipped, reachable by scrolling | Always shown, even if not needed |
| \`auto\` | Clipped, reachable by scrolling | Shown only when content overflows |

A modern CSS feature worth knowing here: \`overflow: clip\`, a newer sibling of \`hidden\` that clips content similarly but explicitly disallows programmatic scrolling to the clipped region and — unlike \`hidden\` — does **not** create a scroll container or a new formatting context tied to scrolling, which makes it marginally cheaper for the browser in some cases. For everyday use, \`hidden\` remains the one you'll reach for by habit; \`clip\` is worth knowing exists once you hit its edge cases.

## visibility: hidden vs display: none vs opacity: 0

There are three completely different ways to make an element invisible in CSS, and they get confused constantly because they all produce "you can't see it" — but they differ in every other respect: whether the element still takes up space, whether it can be clicked or focused, and whether it's exposed to screen readers.

\`\`\`css
.a { display: none; }      /* removed from layout entirely */
.b { visibility: hidden; } /* invisible, but space is preserved */
.c { opacity: 0; }         /* fully transparent, but otherwise fully present */
\`\`\`

**\`display: none\`** removes the element from the layout completely — it's as if it isn't there. Its space collapses, siblings move in to fill the gap, and it's not exposed to assistive technology (screen readers skip it, same as if it weren't in the DOM). It can't be clicked, tabbed to, or interacted with in any way, since there's nothing there to interact with. This is what you want for content that's genuinely not part of the current view — a closed modal, a tab panel that isn't active.

**\`visibility: hidden\`** keeps the element's box exactly where it was — space is preserved, layout of siblings doesn't shift — but the element itself is invisible, unclickable, and (in most browsers/screen readers) removed from the accessibility tree, similar to \`display: none\` on that front. One useful trick: \`visibility\` is inherited, so a hidden parent can have a specific child set back to \`visibility: visible\` to reveal just that one child while the rest of the parent's content stays hidden — \`display: none\` offers no equivalent, since a display-none parent has no rendered children to selectively re-show.

**\`opacity: 0\`** makes the element fully transparent, but it is otherwise entirely unchanged: it still occupies its layout space, siblings don't shift, it's still exposed to screen readers by default, and critically — **it's still clickable**. Because \`opacity\` is a purely visual/paint property, the element's hit-testing box is untouched; an invisible \`opacity: 0\` button sitting on top of other content will still intercept clicks meant for what's visually underneath it. This is also the only one of the three that's meaningfully **animatable** with a CSS \`transition\`, since you can't sensibly transition between "in the layout" and "not in the layout," and most engines special-case \`visibility\` transitions to a hard flip rather than a smooth fade — \`opacity\` is the standard tool for fade in/out effects for exactly this reason.

| | Layout space kept? | Clickable? | Exposed to screen readers? | Smoothly animatable? |
|---|---|---|---|---|
| \`display: none\` | No | No | No | No |
| \`visibility: hidden\` | Yes | No | No (typically) | Not smoothly — flips instantly |
| \`opacity: 0\` | Yes | **Yes** | Yes | Yes |

That "clickable" row for \`opacity: 0\` is the one that causes real production bugs — an element faded out with \`opacity: 0\` (during a transition, say) that hasn't finished its exit animation, or was left at \`opacity: 0\` by mistake, will silently eat clicks meant for whatever's visually beneath it. If you want an element gone from interaction as well as sight, pair \`opacity: 0\` with \`pointer-events: none\`, or use \`visibility: hidden\` (or \`display: none\`) instead once any transition has finished.

## Truncating text with text-overflow: ellipsis

A common UI need — a single line of text that shows "…" instead of overflowing or wrapping when it's too long for its box — requires **three** properties working together; setting only \`text-overflow: ellipsis\` by itself does nothing visible.

\`\`\`css
.truncate {
  white-space: nowrap;     /* 1. force text onto a single line, no wrapping */
  overflow: hidden;        /* 2. clip the text that doesn't fit */
  text-overflow: ellipsis; /* 3. replace the clipped end with "…" */
}
\`\`\`

\`\`\`html
<p class="truncate" style="max-width: 200px;">
  This sentence is definitely too long to fit on one line at 200px.
</p>
\`\`\`

Each property has a specific job, and skipping any one breaks the effect: \`white-space: nowrap\` stops the browser from wrapping to a second line (without it, the text would just wrap and never overflow, so there'd be nothing to clip); \`overflow: hidden\` is what actually clips the excess text at the box's edge (without it, the text just spills out visibly past the box, per the default \`visible\` behavior); and \`text-overflow: ellipsis\` only changes *what the clipped edge looks like* — it requires the first two to already be in place, since it has nothing to do without content actually being clipped by overflow.

This single-line technique doesn't extend to multiple lines with plain CSS properties — truncating to, say, 3 lines with a trailing ellipsis needs the \`-webkit-line-clamp\` property (now supported across all major engines despite the \`-webkit-\` prefix, though it still requires pairing with \`display: -webkit-box\` and \`-webkit-box-orient: vertical\` for legacy reasons) or, in the newest browsers, the standardized \`line-clamp\` property directly.

> **Key idea:** \`overflow\` decides what happens to content too large for its box (spill out, clip, or scroll); of the three "invisible" tools, only \`display: none\` frees up its layout space and only \`opacity\` animates smoothly and stays clickable — mismatching the tool to the intent (e.g. leaving a faded \`opacity: 0\` element clickable) is a common source of subtle UI bugs; and single-line ellipsis truncation always needs \`white-space: nowrap\` + \`overflow: hidden\` + \`text-overflow: ellipsis\` together, not \`text-overflow\` alone.`,
    },
  ],
}
