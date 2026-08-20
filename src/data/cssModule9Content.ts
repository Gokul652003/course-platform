import type { Module } from "../types"

export const cssModule9: Module = {
  id: 9,
  title: "Transitions & Transforms",
  status: "upcoming",
  lessons: [
    {
      name: "CSS Transitions",
      minutes: 11,
      intro: "Animate property changes smoothly with transition-property, duration, timing functions, and delay — and learn which properties can even be animated.",
      content: `## Why transitions exist

Without any animation, a CSS property change is instant — a button's background flips from blue to dark blue the moment \`:hover\` engages, with no visual continuity between the two states. **Transitions** let the browser interpolate between the old value and the new value over time, so the change reads as smooth motion instead of a jarring snap.

Transitions are triggered by a **state change**, not by the page loading. Common triggers: a \`:hover\` or \`:focus\` pseudo-class engaging, a class being toggled with JavaScript, a media query flipping, or an attribute changing. If nothing changes the computed value of a property, a transition never fires — it has nothing to interpolate between.

\`\`\`css
.button {
  background-color: #2563eb;
  transition: background-color 200ms ease;
}

.button:hover {
  background-color: #1e40af;
}
\`\`\`

Hover the button and the background eases from one blue to the other over 200 milliseconds, instead of jumping.

## The four transition properties

A transition is really four separate properties working together, and it helps to understand each one before reaching for the shorthand.

### transition-property

Declares **which** CSS properties should animate when they change. You can name one property, a comma-separated list, or the keyword \`all\` to animate everything that changes.

\`\`\`css
.card {
  transition-property: transform, box-shadow;
}
\`\`\`

\`all\` is convenient but has a real cost: the browser has to watch every animatable property for changes, which is more work than watching two or three, and it makes it easy to accidentally animate something you didn't intend to (like a color change nobody asked for). Prefer naming the specific properties you care about once a project matures past the prototyping stage.

### transition-duration

How long the transition takes, in \`s\` or \`ms\`. \`0.2s\` and \`200ms\` are equivalent.

\`\`\`css
.card {
  transition-duration: 200ms;
}
\`\`\`

If you don't set a duration, it defaults to \`0s\` — meaning **no transition happens at all**, even if \`transition-property\` is set. This is the single most common reason a transition "doesn't work": the property list is correct, but the duration was left at its default.

### transition-timing-function

Controls the **pacing** of the animation — whether it moves at a constant speed or accelerates and decelerates. This is where a transition goes from mechanical to natural-feeling.

| Keyword | Behavior | Feel |
|---|---|---|
| \`linear\` | Constant speed throughout | Mechanical, robotic |
| \`ease\` | Slow start, fast middle, slow end (default) | Natural, general-purpose |
| \`ease-in\` | Slow start, speeds up | Good for elements leaving the screen |
| \`ease-out\` | Fast start, slows down | Good for elements entering the screen |
| \`ease-in-out\` | Slow start and end, fast middle | Symmetric, good for looping or reversible motion |
| \`cubic-bezier(x1, y1, x2, y2)\` | Fully custom curve | Precise control, brand-specific motion |

\`ease\`, \`ease-in\`, \`ease-out\`, and \`ease-in-out\` are all just presets built on \`cubic-bezier()\` under the hood — for example \`ease\` is shorthand for \`cubic-bezier(0.25, 0.1, 0.25, 1)\`. When a preset isn't quite right, you can write your own curve directly:

\`\`\`css
.modal {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
\`\`\`

That particular curve overshoots past 100% before settling back — a small "bounce" at the end, often used for playful pop-in effects. Tools like cubic-bezier.com let you drag control points visually and copy the resulting function, which is far easier than guessing numbers.

### transition-delay

How long to wait **before** the transition starts, after the property change happens. Useful for staggering multiple elements or waiting out a deliberate pause before motion begins.

\`\`\`css
.tooltip {
  transition-property: opacity;
  transition-duration: 150ms;
  transition-delay: 400ms;
}
\`\`\`

Here, the tooltip waits 400ms after triggering before it starts fading in — long enough that a mouse just passing over the target doesn't trigger a flash of tooltip.

## The transition shorthand

Writing all four longhands is verbose for something this common, so most real code uses the \`transition\` shorthand:

\`\`\`
transition: <property> <duration> <timing-function> <delay>;
\`\`\`

\`\`\`css
.button {
  transition: background-color 200ms ease-in-out 0ms;
}
\`\`\`

The delay and timing function are optional and can be dropped:

\`\`\`css
.button {
  transition: background-color 200ms;
}
\`\`\`

Order matters for the two time values: the **first** time-like value is always read as the duration, and the **second**, if present, is the delay. \`transition: opacity 200ms 100ms;\` means a 200ms duration with a 100ms delay — not the other way around.

## Transitioning multiple properties, each with its own timing

The shorthand accepts a comma-separated list, letting different properties animate with completely different pacing in one declaration:

\`\`\`css
.card {
  transition:
    transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 250ms ease-out,
    opacity 150ms linear 50ms;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  opacity: 1;
}
\`\`\`

This is common in polished UI: the lift (\`transform\`) gets a bouncy, slightly overshooting curve, while the shadow eases out smoothly underneath it, and an unrelated opacity fade gets its own short, linear, delayed timing entirely independent of the other two.

## Which properties can even transition

Not every CSS property is **animatable**. A property can only transition if the browser knows how to compute intermediate values between the start and end — this is straightforward for numbers, lengths, colors, and transforms, but meaningless for something like \`display\` (there's no "60% of the way between \`block\` and \`none\`") or \`font-family\` (there's no halfway point between two typefaces).

| Category | Examples | Animatable? |
|---|---|---|
| Lengths & numbers | \`width\`, \`padding\`, \`opacity\`, \`line-height\` | Yes |
| Colors | \`color\`, \`background-color\`, \`border-color\` | Yes |
| Transforms | \`transform\` (translate/rotate/scale/skew) | Yes |
| Shadows & filters | \`box-shadow\`, \`filter\` | Yes |
| Grid/flex sizing | \`flex-grow\`, \`grid-template-columns\` (fixed tracks) | Yes, with caveats |
| Keyword-only properties | \`display\`, \`visibility\`, \`font-family\`, \`position\` | No (see below) |

\`visibility\` is a special, useful exception: it can't fade between \`visible\` and \`hidden\` numerically, but the browser will still respect a transition **delay** on it — flipping instantly, but at a scheduled time. That makes it possible to combine an opacity fade-out with a delayed \`visibility: hidden\`, so the element becomes unclickable only after it's already invisible:

\`\`\`css
.dropdown {
  opacity: 1;
  visibility: visible;
  transition: opacity 150ms ease, visibility 0s linear 0s;
}

.dropdown.closed {
  opacity: 0;
  visibility: hidden;
  transition: opacity 150ms ease, visibility 0s linear 150ms;
}
\`\`\`

\`display\` has no such trick — it can't be transitioned or delayed in the same way, which is one of several reasons modern CSS added the dedicated \`transition-behavior: allow-discrete\` mechanism for animating discrete properties like \`display\` directly, alongside \`@starting-style\` for entry animations. Those are worth knowing exist, but \`opacity\` + \`visibility\` remains the more broadly understood pattern.

## A note on triggering transitions from JavaScript

If you add a class via JavaScript in the same frame the element was inserted into the DOM, the browser may not register the "before" state and the transition can silently skip. The common fix is to force a style change on the next frame:

\`\`\`css
.toast {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 200ms ease, transform 200ms ease;
}

.toast.visible {
  opacity: 1;
  transform: translateY(0);
}
\`\`\`

\`\`\`js
const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

requestAnimationFrame(() => {
  toast.classList.add("visible");
});
\`\`\`

Appending the element and adding the \`visible\` class in the same synchronous block often collapses into a single paint, skipping the transition entirely — deferring the class add to the next animation frame guarantees the browser paints the "before" state first.

> **Key idea:** A transition only animates properties that both (1) actually change value and (2) are numerically animatable — set \`transition-property\`, give it a nonzero \`transition-duration\`, and pick a \`transition-timing-function\` that matches the motion you want; everything else defaults to instant.`,
    },
    {
      name: "2D & 3D Transforms",
      minutes: 12,
      intro: "Move, rotate, scale, and skew elements with transform functions, understand why order matters, and get an introduction to 3D transforms and perspective.",
      content: `## What transform does

The \`transform\` property changes an element's position, size, or orientation **visually**, without affecting document flow. A rotated or scaled element still occupies its original space in the layout as far as surrounding elements are concerned — only the rendered pixels move. This is a big part of why transforms are cheap to animate (covered in depth in the next lesson) and why they're the right tool for hover effects, drag previews, and modal animations instead of nudging \`top\`/\`left\` or resizing \`width\`/\`height\`.

## The 2D transform functions

### translate — moving an element

\`translate()\` shifts an element along the X and/or Y axis, measured in any length unit (commonly \`px\`, \`%\`, or \`rem\`).

\`\`\`css
.el {
  transform: translateX(20px);
  transform: translateY(-10px);
  transform: translate(20px, -10px); /* X, then Y */
}
\`\`\`

Percentage values in \`translate\` are relative to the **element's own size**, not its container — this makes true centering possible without knowing the element's dimensions in advance:

\`\`\`css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
\`\`\`

### rotate — spinning an element

\`rotate()\` takes an angle, most commonly in \`deg\`. Positive values rotate clockwise.

\`\`\`css
.icon {
  transform: rotate(45deg);
}

.chevron.open {
  transform: rotate(180deg);
}
\`\`\`

### scale — resizing an element

\`scale()\` multiplies the element's size by a factor. \`1\` is unchanged, \`2\` is double size, \`0.5\` is half size, and negative values flip the element (rarely used deliberately).

\`\`\`css
.thumbnail {
  transform: scale(1);
  transition: transform 200ms ease;
}

.thumbnail:hover {
  transform: scale(1.05);
}
\`\`\`

\`scaleX()\` and \`scaleY()\` scale a single axis independently; \`scale(x, y)\` sets both in one call.

### skew — slanting an element

\`skew()\` shears an element along an axis by an angle, distorting rectangles into parallelograms. It's the least commonly used of the four, showing up mostly in decorative section dividers or stylized card treatments.

\`\`\`css
.banner {
  transform: skewY(-3deg);
}
\`\`\`

## Combining multiple functions — and why order matters

A single \`transform\` declaration can chain several functions, space-separated:

\`\`\`css
.el {
  transform: translateX(100px) rotate(45deg);
}
\`\`\`

Transform functions apply **right to left**, each one operating in the coordinate space left behind by the previous one — and that makes the order you write them in produce genuinely different results, not just a stylistic preference.

\`\`\`css
/* Translate first, then rotate around the (now-shifted) element's own center */
.a {
  transform: rotate(45deg) translateX(100px);
}

/* Rotate first, then translate along the ORIGINAL, unrotated X axis */
.b {
  transform: translateX(100px) rotate(45deg);
}
\`\`\`

In \`.a\`, the browser applies \`translateX(100px)\` first (moving the element 100px right along the normal horizontal axis), and *then* rotates the whole result 45 degrees — so the element ends up both shifted and rotated, swung around the origin. In \`.b\`, the element rotates first, which tilts its local axes, and *then* translates 100px along that now-tilted axis — so it slides off at a 45-degree diagonal instead of straight sideways. Same two functions, same two values, visibly different end position. When a combined effect looks wrong, this reversed-order evaluation is almost always why — try swapping the order before assuming the values are wrong.

## The individual translate/rotate/scale properties

Modern CSS also exposes \`translate\`, \`rotate\`, and \`scale\` as **standalone properties**, separate from the \`transform\` shorthand function of the same name:

\`\`\`css
.el {
  translate: 20px -10px;
  rotate: 45deg;
  scale: 1.1;
}
\`\`\`

| | \`transform: translateX() rotate() scale()\` | \`translate\` / \`rotate\` / \`scale\` |
|---|---|---|
| Syntax | One property, chained functions | Three separate properties |
| Order sensitivity | Yes — write order changes the result | No — browser applies translate, then rotate, then scale, always in that fixed order |
| Overriding just one axis of motion | Requires rewriting the whole \`transform\` value | Can set \`rotate\` alone without touching \`translate\`/\`scale\` |
| Animating just one aspect independently | Awkward — one \`transform\` value to animate | Natural — each can transition independently |
| Browser support | Universal, long-standing | Baseline widely available in the last few years |

The standalone properties are the more ergonomic modern choice when you only need to animate or override one aspect (say, a hover state that only changes \`scale\` while \`rotate\` stays fixed from elsewhere) since you no longer have to reconstruct the entire combined \`transform\` string to change one piece of it. \`transform\` itself isn't deprecated and remains the right choice when a component's structure is easier to reason about as one combined, explicitly-ordered value — the two can even be mixed, with \`transform\` applying on top of the standalone properties.

## transform-origin — where transforms pivot from

By default, rotation and scaling happen around an element's **center** (\`50% 50%\`). \`transform-origin\` moves that pivot point.

\`\`\`css
.dropdown {
  transform-origin: top center;
  transform: scaleY(0);
  transition: transform 150ms ease-out;
}

.dropdown.open {
  transform: scaleY(1);
}
\`\`\`

Setting the origin to \`top center\` makes the dropdown grow downward from its top edge, like it's unrolling, instead of expanding outward from its center in both directions — a small detail that makes a big difference in how "physical" the motion feels.

## Introducing 3D transforms

CSS transforms aren't limited to the 2D plane — a Z axis exists too, coming straight out of the screen toward the viewer.

### rotateX and rotateY

Where \`rotate()\` spins an element flat within the screen's plane, \`rotateX()\` tips it forward/backward around a horizontal axis, and \`rotateY()\` spins it around a vertical axis — like swinging a door.

\`\`\`css
.card {
  transform: rotateY(180deg);
}
\`\`\`

### translateZ and perspective

\`translateZ()\` moves an element along the Z axis, toward or away from the viewer. On its own this does very little visually, because without a vanishing point there's nothing to make "closer" look bigger — that vanishing point is supplied by the \`perspective\` property, set on the **parent** of the element being transformed in 3D.

\`\`\`css
.scene {
  perspective: 800px;
}

.card {
  transform: rotateY(20deg) translateZ(20px);
}
\`\`\`

Smaller \`perspective\` values create a more extreme, dramatic 3D effect (the viewer is "closer" to the scene); larger values create a subtler one. \`perspective\` can alternatively be set as part of the \`transform\` chain itself using the \`perspective()\` function, but setting it on the parent is the more common and predictable pattern, since it establishes one consistent vanishing point for every 3D child at once.

### backface-visibility

When a 3D-rotated element turns past 90 degrees, you're looking at its **back face** — by default, the browser still renders it (mirrored). For effects like card flips, you almost always want the back face hidden so it doesn't show through:

\`\`\`css
.flip-card-inner {
  transform-style: preserve-3d;
}

.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
}
\`\`\`

\`transform-style: preserve-3d\`, set on the parent, tells the browser to keep its children in the same 3D space rather than flattening them into a single 2D plane — necessary for a stacked front/back flip card to render correctly rather than collapsing both faces on top of each other.

3D transforms are covered here only at an introductory depth — enough to recognize \`rotateX\`/\`rotateY\`/\`translateZ\`/\`perspective\`/\`backface-visibility\` and know what each does. The next lesson puts a couple of these to direct use in a card flip.

> **Key idea:** \`transform\` functions apply right-to-left, so combining \`translate\` and \`rotate\` in a different order produces genuinely different results — and because transforms never affect layout, they're the right tool for movement, scaling, and rotation whether you reach for the \`transform\` shorthand or the standalone \`translate\`/\`rotate\`/\`scale\` properties.`,
    },
    {
      name: "Combining Transforms & Transitions for Micro-interactions",
      minutes: 13,
      intro: "Build a hover lift, a card flip, and a modal enter animation, then learn exactly why transform and opacity are the properties to reach for on the performance-critical path.",
      content: `## Micro-interactions: small motion, big perceived quality

A **micro-interaction** is a small, purposeful piece of feedback — a button lifting on hover, a card flipping to reveal detail, a modal easing into view instead of appearing instantly. None of these change what the interface *does*; they change how it *feels*, and that gap is often what separates an interface that feels "cheap" from one that feels considered. Transitions and transforms are the two tools that build almost all of them.

## Pattern 1: the button hover lift

The classic pattern: a subtle upward shift and a deepening shadow, both easing in together.

\`\`\`css
.btn {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition:
    transform 150ms ease-out,
    box-shadow 150ms ease-out;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition-duration: 50ms;
}
\`\`\`

Three details make this feel right rather than just "technically animated":
- The \`:active\` state snaps back near-instantly (\`50ms\`) rather than easing at the same speed as the hover-in — a press should feel immediate.
- Both properties share the same duration and easing on hover so the lift and the shadow growth read as one motion, not two independent ones drifting out of sync.
- The lift distance is small (\`-2px\`) — restraint is what makes it read as "polished" instead of "bouncy."

## Pattern 2: a card flip

Combining several of the previous lesson's 3D transform pieces into one component. The structure needs a front face and a back face stacked on top of each other, inside a shared 3D container.

\`\`\`html
<div class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-card-front">Front</div>
    <div class="flip-card-back">Back</div>
  </div>
</div>
\`\`\`

\`\`\`css
.flip-card {
  perspective: 1000px;
  width: 240px;
  height: 320px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 500ms cubic-bezier(0.4, 0.2, 0.2, 1);
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 0.75rem;
}

.flip-card-back {
  transform: rotateY(180deg);
}
\`\`\`

Walking through why each piece is there: \`perspective\` on the outer \`.flip-card\` establishes the 3D vanishing point for everything inside it. \`preserve-3d\` on \`.flip-card-inner\` keeps the front and back faces in the same 3D space instead of flattening. Both faces are absolutely positioned on top of each other so the flip pivots around one shared center rather than two separately-placed elements. The back face is pre-rotated \`180deg\` so that once the whole \`.flip-card-inner\` rotates, the back face arrives right-side-up instead of mirrored. And \`backface-visibility: hidden\` on both faces is what stops you from seeing the front face's mirrored backside bleeding through mid-flip.

## Pattern 3: a modal enter animation

Modals and dropdowns almost universally combine a translate/scale with an opacity fade, rather than using either alone — motion alone can feel mechanical, and opacity alone can feel like it's teleporting into place.

\`\`\`css
.modal-backdrop {
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.modal-backdrop.open {
  opacity: 1;
}

.modal {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}

.modal.open {
  opacity: 1;
  transform: scale(1) translateY(0);
}
\`\`\`

The modal starts very slightly smaller and shifted down, then eases up to full size and position while fading in — a subtle, fast motion (\`200ms\`, a small \`0.95\` starting scale) reads as polish; anything larger or slower starts to feel like it's in the user's way. The backdrop fades independently and doesn't need a transform at all, since a full-screen overlay has no meaningful position or scale to animate.

## Performance: why transform and opacity are the cheap properties

Every one of the three patterns above used only \`transform\` and \`opacity\`. That's not a coincidence — it's the single most important performance rule for CSS animation, and it's worth understanding *why*, not just memorizing it.

Rendering a frame roughly breaks down into three stages:

1. **Layout** — figuring out the size and position of every element on the page, given the current CSS. This is the most expensive stage, because changing one element's size or position can ripple outward and force the browser to recompute the position of everything around it.
2. **Paint** — filling in actual pixels for each element (colors, text, borders, shadows) into layers.
3. **Composite** — taking those already-painted layers and assembling them onto the screen, including any positioning, scaling, or opacity blending needed to place them correctly.

| Property being animated | Layout? | Paint? | Composite? | Cost |
|---|---|---|---|---|
| \`width\`, \`height\`, \`padding\`, \`top\`, \`left\` | Yes | Yes | Yes | Expensive |
| \`background-color\`, \`box-shadow\`, \`border-color\` | No | Yes | Yes | Moderate |
| \`transform\`, \`opacity\` | No | No | Yes | Cheap |

Animating \`width\` or \`left\` forces the browser to redo layout on **every single frame** of the animation — at 60 frames per second, that's up to 60 full layout passes per second, and on a busy page with many elements, that layout cost can be enough to drop frames and make the motion look janky. Animating \`background-color\` skips layout (the element's size and position aren't changing) but still needs to repaint the pixels each frame.

\`transform\` and \`opacity\`, by contrast, can typically be handled entirely on the **compositor** — a browser subsystem that works with already-painted layers and can reposition, resize, rotate, or fade them essentially the same way a graphics card repositions an image, without asking layout or paint to redo any work. This is also frequently offloaded to the GPU, which is built exactly for this kind of bulk pixel transformation. That's the whole reason \`transform: translateY()\` was used above instead of animating \`top\`, and \`transform: scale()\` instead of animating \`width\`/\`height\` — visually similar results, but one skips two entire rendering stages and the other doesn't.

A couple of practical footnotes: this compositor fast path generally requires the element to already be promoted to its own layer, which the browser mostly handles automatically once it detects an active \`transform\`/\`opacity\` transition — you don't need to manage this by hand in the vast majority of cases. And this doesn't mean *only* transform and opacity are ever animatable well; it means they're the properties that are cheap **by default**, which is exactly why the three patterns in this lesson lean on them so consistently rather than reaching for \`top\`/\`left\`/\`width\`/\`height\`.

> **Key idea:** Reach for \`transform\` and \`opacity\` first for any animation — they skip layout and paint entirely and run on the compositor, while properties like \`width\`, \`top\`, and \`left\` force a full layout recalculation on every animated frame and are far more likely to visibly stutter.`,
    },
  ],
}
