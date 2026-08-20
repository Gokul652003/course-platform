import type { Module } from "../types"

export const cssModule8: Module = {
  id: 8,
  title: "Responsive Design & Media Queries",
  status: "upcoming",
  lessons: [
    {
      name: "Mobile-First Responsive Design",
      minutes: 11,
      intro: "Understand why min-width media queries beat max-width, how @media syntax actually works, and how to pick breakpoints that follow your content instead of specific devices.",
      content: `## What "mobile-first" actually means

**Mobile-first** is a design and development strategy where you write your base CSS — the styles with no media query attached — to target the smallest, simplest layout first, then layer on complexity as the viewport grows. The base styles are a single-column, narrow-screen layout; every \`@media\` block after that only ever *adds* or *adjusts* rules for wider screens.

This sounds like a small detail, but it flips the entire structure of your stylesheet. Compare the two approaches on the same three-column-becomes-one-column layout:

\`\`\`css
/* Desktop-first: base styles assume the widest layout,
   then override downward with max-width */
.layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
\`\`\`

\`\`\`css
/* Mobile-first: base styles are the simplest layout,
   then override upward with min-width */
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .layout {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
\`\`\`

Both end up rendering identically at every width. The difference is entirely about which styles are the **default** a browser has to parse and apply before any media query is even evaluated.

## Why min-width wins in practice

There are a few concrete reasons \`min-width\` (mobile-first) is the convention nearly every modern codebase, framework, and design system (Tailwind, Bootstrap 4+, Material) has converged on:

- **It matches how CSS cascades naturally.** Later rules override earlier ones. With mobile-first, "later" (wider breakpoints) naturally means "more specific device," which lines up with the cascade instead of fighting it. With desktop-first, you're constantly writing overrides that *undo* earlier declarations (setting a column count back down, then back down again), which is more rules doing more work.
- **It forces you to design the constrained case first.** Small screens have the least room for error — you can't hide problems behind extra whitespace or a sidebar. Starting there tends to produce a cleaner content hierarchy that then just gets *enhanced* for more space, rather than a spacious desktop design that gets awkwardly squeezed.
- **It's lighter for the majority of real-world traffic.** A huge share of page loads worldwide are on phones. A phone loading a mobile-first site parses a small, simple base ruleset and then simply never matches most of the wider \`min-width\` queries — no wasted override work. A phone loading a desktop-first site parses the *full* desktop ruleset as the default and then has to apply override after override to shrink it back down.
- **It composes better with unknown future widths.** \`min-width: 900px\` says "900px and up, however wide that gets" — correct all the way to an ultrawide monitor with no extra query needed. A \`max-width\` chain has to explicitly account for the top end or it silently stops adapting.

None of this means \`max-width\` queries are *wrong* — they're occasionally the right tool for a one-off "collapse this one thing below X" rule bolted onto an otherwise mobile-first sheet. But as the default philosophy for a whole project, mobile-first/min-width is the stronger default.

## @media syntax

A media query has two parts: an optional **media type**, and one or more **media features** wrapped in parentheses.

\`\`\`css
@media screen and (min-width: 768px) {
  /* applies to screens 768px and wider */
}
\`\`\`

In practice, the media type is almost always omitted today — \`screen\` is implied, and \`print\` is the only other type worth knowing (used for print stylesheets, e.g. \`@media print { .no-print { display: none; } }\`). So most real queries just start straight with the feature:

\`\`\`css
@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
}
\`\`\`

You can place an \`@media\` block anywhere in your stylesheet, and it can wrap any number of rules, including nested selectors:

\`\`\`css
@media (min-width: 1024px) {
  .card { padding: 2rem; }
  .card__title { font-size: 1.5rem; }
  .card__footer { display: flex; justify-content: space-between; }
}
\`\`\`

Modern CSS (nesting, baseline in all current browsers) also lets you nest \`@media\` directly inside a selector's own rule block, which keeps a component's responsive behavior physically next to its base styles instead of scattered across separate blocks at the bottom of the file:

\`\`\`css
.card {
  padding: 1rem;

  @media (min-width: 1024px) {
    padding: 2rem;
  }
}
\`\`\`

Both forms compile to the same result. The nested form is newer and increasingly preferred for component-scoped stylesheets; the flat form is still extremely common and necessary when a single breakpoint affects many unrelated selectors at once (in which case grouping them under one \`@media\` avoids repeating the query).

## Combining conditions: and / or / not

Media features combine with a small set of logical keywords.

**\`and\`** — every listed condition must be true:

\`\`\`css
@media (min-width: 600px) and (max-width: 900px) {
  /* only in this width band — a "between" range */
}
\`\`\`

This is the standard way to target a specific band rather than an open-ended "and up." It's common when you want tablet-specific styles that shouldn't also apply once desktop's own \`min-width\` query takes over.

**Comma-separated list** — acts as **or**: the block applies if *any* listed query matches:

\`\`\`css
@media (min-width: 1200px), print {
  /* applies on wide screens OR when printing */
}
\`\`\`

**\`not\`** — negates an entire query (rarely needed day to day, but good to recognize):

\`\`\`css
@media not screen {
  /* applies to anything that is NOT screen media */
}
\`\`\`

There's also **range syntax**, a newer and considerably more readable alternative to writing out \`min-width\`/\`max-width\` pairs, baseline in all current major browsers:

\`\`\`css
/* old pair syntax */
@media (min-width: 600px) and (max-width: 900px) { }

/* modern range syntax — reads like actual math */
@media (600px <= width <= 900px) { }
\`\`\`

Range syntax is worth adopting for new code — it's shorter and harder to get backwards — but you'll see the \`and\`-joined pair form constantly in existing codebases, so both are worth being fluent in.

## Choosing breakpoints: content-based vs device-based

There are two philosophies for picking the actual pixel values in your \`min-width\` queries.

**Device-based breakpoints** pick values that correspond to popular device widths at the time — historically things like 375px (a common phone width), 768px (iPad portrait), 1024px (iPad landscape), 1440px (a common laptop width). The appeal is that it feels like you're "targeting real devices." The problem is that device sizes change constantly, there is no longer any single dominant phone or tablet width, and a breakpoint tuned to one specific device today looks arbitrary in two years.

**Content-based breakpoints** — the approach virtually all serious modern projects use — ignore devices entirely and instead resize the browser window on the *actual design* until it starts looking bad (text lines get too long, a nav wraps awkwardly, cards get too cramped), and place a breakpoint exactly there. The breakpoint value is a side effect of your content and layout, not a guess about hardware.

| Approach | Basis | Weakness |
|---|---|---|
| Device-based | Popular device widths (375px, 768px, 1024px...) | Devices change; "768px = tablet" is already outdated; ignores your actual content |
| Content-based | Where *this specific design* starts to break | Requires manually testing your own layout, no shortcut list to copy |

In practice, most teams still land on a small, reusable *set* of breakpoints (often close to the old device-based numbers, because those roughly correspond to common ranges of browser widths anyway) — but the values are chosen by testing the design, and any component is free to add its own extra breakpoint if its content demands one at a width nothing else uses. A typical shared set looks something like:

\`\`\`css
/* small utility custom properties are a common way to document a team's scale
   (media query values themselves can't use var(), so these are just reference points) */
:root {
  /* sm: 640px  — a bit more than the smallest phones */
  /* md: 768px  — small tablets / large phones landscape */
  /* lg: 1024px — tablets landscape / small laptops */
  /* xl: 1280px — typical laptop and up */
}
\`\`\`

That last comment matters: **you cannot substitute a custom property inside a media query's parentheses** in standard CSS today — \`@media (min-width: var(--bp-md))\` does not work. Breakpoint values have to be written as literal numbers wherever they're used (or generated by a preprocessor/build tool ahead of time, which is exactly what frameworks like Tailwind do under the hood).

## prefers-color-scheme and prefers-reduced-motion (brief mention)

Media queries aren't only about size — a category called **user preference media features** lets you respond to settings the user has configured at the OS or browser level, independent of viewport.

\`\`\`css
@media (prefers-color-scheme: dark) {
  body {
    background: #111;
    color: #eee;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

\`prefers-color-scheme\` reflects whether the user has chosen a light or dark OS theme, and is the standard mechanism for shipping a dark mode without JavaScript. \`prefers-reduced-motion\` reflects an accessibility setting for users sensitive to motion, and should gate or shrink any non-essential animation. Both deserve a full treatment elsewhere in this course (dark theming and accessibility are big enough topics on their own) — the thing to remember here is simply that \`@media\` is a general-purpose conditional-styling tool, not just a "screen size" tool.

## A complete mobile-first example

Pulling it together — a simple card grid, written mobile-first from a single column up to three:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

.card {
  padding: 1rem;
  border-radius: 0.5rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }

  .card {
    padding: 1.5rem;
  }
}
\`\`\`

Every rule at every width is additive relative to the base — nothing is ever fighting an earlier override to shrink itself back down.

> **Key idea:** Write your unadorned base CSS for the smallest screen, then use \`min-width\` media queries to layer on complexity as space increases — it aligns with how the cascade works, is lighter for the majority-mobile web, and scales cleanly to any width above your last breakpoint without extra queries.`,
    },
    {
      name: "Viewport Units & Fluid Sizing",
      minutes: 11,
      intro: "Use vw/vh, the newer dvh/svh/lvh units that fix mobile browser chrome bugs, and clamp() to build type and spacing that scale smoothly without a pile of breakpoints.",
      content: `## Viewport units: vw and vh

**Viewport units** size an element relative to the browser's viewport instead of relative to its parent, the font size, or a fixed pixel value.

- \`1vw\` = 1% of the viewport's width
- \`1vh\` = 1% of the viewport's height
- \`vmin\` = 1% of whichever of width/height is *smaller*
- \`vmax\` = 1% of whichever of width/height is *larger*

\`\`\`css
.hero {
  height: 100vh;   /* fills the full viewport height */
  width: 100vw;    /* fills the full viewport width */
}

.hero__title {
  font-size: 8vw;  /* scales continuously with viewport width */
}
\`\`\`

These are genuinely useful for full-bleed hero sections, "text that should always roughly fill this banner" effects, and square-ish elements that need to track the smaller viewport dimension (\`vmin\`). But used carelessly they cause two well-known problems.

**Problem 1: unconstrained viewport-unit text has no minimum or maximum.** \`font-size: 8vw\` looks reasonable on a laptop, becomes tiny on a narrow phone, and becomes enormous on an ultrawide monitor — because it never stops scaling. You'll fix this with \`clamp()\` shortly.

**Problem 2: \`100vh\` is unreliable on mobile browsers.** This is worth understanding in detail because it trips up nearly every developer at least once.

## The mobile 100vh problem

On mobile browsers (Safari on iOS especially, but historically Chrome on Android too), the browser's UI — the address bar, tab strip, bottom toolbar — can show and hide dynamically as the user scrolls. The question that created years of bugs was: when that chrome is visible versus hidden, what does \`100vh\` mean?

Originally, \`vh\` units were defined against the **largest possible viewport** — the height available when all that browser UI is hidden. The practical effect: an element set to \`height: 100vh\` would be *taller than the currently visible area* whenever the address bar was showing, so the bottom of the page (often containing a footer, a submit button, or navigation) would be clipped below the fold, hidden behind browser chrome the user had to scroll to reveal or that address bar would auto-hide to expose. A full-screen modal built with \`100vh\` was a classic case: it would render taller than the visible screen, cutting off its own close button.

## The fix: dvh, svh, lvh

To resolve the ambiguity, CSS added three explicit viewport-height (and matching viewport-width) units instead of leaving \`vh\` to guess:

| Unit | Meaning | Use when |
|---|---|---|
| \`svh\` (small viewport height) | Height when browser UI is fully **visible** (the smallest the viewport ever is) | You need a guarantee content is never hidden behind chrome |
| \`lvh\` (large viewport height) | Height when browser UI is fully **hidden** (the largest the viewport ever is) | Rare — mostly matches old \`vh\` behavior |
| \`dvh\` (dynamic viewport height) | Height that **tracks live**, updating as browser UI shows/hides | The general-purpose "give me the real usable height right now" unit |

\`\`\`css
.full-screen-modal {
  /* old behavior — can be taller than the visible area on mobile */
  height: 100vh;
}

.full-screen-modal {
  /* fixes the clipping problem by tracking the real visible height */
  height: 100dvh;
}
\`\`\`

\`dvh\` is the one to reach for by default for anything that must exactly fill the visible screen (full-screen overlays, mobile app-shell layouts, "hero fills the screen" sections) — it's baseline-supported in all current browsers. \`svh\` is worth using instead when you specifically want the *safe minimum* guarantee (e.g. you'd rather have a small gap appear/disappear than ever risk clipping), and \`lvh\` is rarely reached for directly since it mostly reproduces the old, buggy \`vh\` behavior.

A common defensive pattern is to layer them, letting older browsers fall back gracefully since a browser that doesn't recognize \`dvh\` simply ignores that later declaration and keeps the \`vh\` value:

\`\`\`css
.full-screen-modal {
  height: 100vh;   /* fallback for very old browsers */
  height: 100dvh;  /* modern browsers override with the correct value */
}
\`\`\`

## clamp() for fluid sizing

\`clamp(min, preferred, max)\` takes three values and returns the *preferred* value, but never lets the result go below *min* or above *max*. It's the tool that turns raw viewport-unit scaling into something actually usable.

\`\`\`css
.hero__title {
  /* never smaller than 1.75rem, never larger than 3.5rem,
     scales fluidly with viewport width in between */
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
}
\`\`\`

Walking through this: at a narrow viewport, \`4vw + 1rem\` evaluates below \`1.75rem\`, so \`clamp()\` returns the floor, \`1.75rem\`, and the text stops shrinking further. At a very wide viewport, the same expression evaluates above \`3.5rem\`, so \`clamp()\` returns the ceiling instead. Only in the middle range does the viewport-unit expression actually take effect, producing smooth scaling with hard, safe limits on both ends.

The middle "preferred" value is typically a mix of a viewport unit (so it scales) and a fixed unit like \`rem\` (so the scaling has a sensible baseline and doesn't hit zero) — \`4vw + 1rem\` reads as "grow with the viewport, but start from a rem-based floor." Tuning the multiplier on the viewport unit controls *how aggressively* it scales between the min and max: a bigger multiplier reaches the max sooner (over a narrower width range), a smaller one stretches the transition out over a wider range.

### Fluid spacing, not just type

The same technique works for any length — padding, margin, gap, border-radius:

\`\`\`css
.section {
  padding-block: clamp(2rem, 5vw, 6rem);
  padding-inline: clamp(1rem, 4vw, 4rem);
}

.card {
  gap: clamp(0.5rem, 2vw, 1.5rem);
  border-radius: clamp(0.5rem, 1vw, 1rem);
}
\`\`\`

This produces spacing that visibly breathes more on a large screen and tightens up on a small one, without a single \`@media\` block.

### A worked example: a fluid type scale

Here's a small heading scale built entirely with \`clamp()\`, going from a phone-appropriate size up to a desktop-appropriate size for each level:

\`\`\`css
h1 { font-size: clamp(2rem, 5vw + 1rem, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw + 1rem, 2.75rem); }
h3 { font-size: clamp(1.25rem, 2vw + 0.75rem, 2rem); }
p  { font-size: clamp(1rem, 0.5vw + 0.9rem, 1.125rem); }
\`\`\`

Notice the multiplier shrinks as you go down the scale — \`h1\` scales the most dramatically between breakpoints, while body text barely moves, which matches how real designs behave: headline sizes swing a lot between mobile and desktop, body copy stays close to a stable, readable size throughout.

## Why clamp() reduces the need for extra media queries

Before \`clamp()\` was widely available, fluid type/spacing was commonly approximated with a *staircase* of fixed values, one per breakpoint:

\`\`\`css
/* the old staircase approach — discrete jumps at each breakpoint */
.hero__title {
  font-size: 1.75rem;
}
@media (min-width: 480px) {
  .hero__title { font-size: 2.25rem; }
}
@media (min-width: 768px) {
  .hero__title { font-size: 2.75rem; }
}
@media (min-width: 1024px) {
  .hero__title { font-size: 3.5rem; }
}
\`\`\`

That works, but it produces visible *jumps* right at each breakpoint, requires picking and maintaining several breakpoint-specific values for every fluid property, and the sizing is wrong for every width that falls between two breakpoints (a 700px-wide window gets the same size as a 481px-wide window, even though there's meaningfully more room). \`clamp()\` replaces the entire staircase with one line that scales continuously and correctly at *every* width, not just at the handful of widths you happened to write a query for.

This doesn't eliminate media queries from your toolkit — you'll still reach for them for genuinely structural changes (going from a single column to a multi-column grid isn't something \`clamp()\` can express, since it only interpolates a single numeric value, not a layout). But for anything that's fundamentally "this one number should be bigger on bigger screens" — font sizes, padding, gaps, radii — \`clamp()\` is very often a full replacement for a breakpoint staircase, with better results and less code.

> **Key idea:** \`dvh\`/\`svh\`/\`lvh\` fix the long-standing mobile bug where \`100vh\` didn't account for browser chrome showing and hiding, and \`clamp(min, preferred, max)\` turns raw, unbounded viewport-unit scaling into safe, continuous fluid sizing that frequently replaces an entire staircase of breakpoint-specific values with a single declaration.`,
    },
    {
      name: "Container Queries",
      minutes: 12,
      intro: "Solve the layout problem media queries can't: making a component respond to the size of the box it's actually in, not the size of the whole screen.",
      content: `## The problem media queries can't solve

Media queries answer one question: *how big is the viewport?* That's fine when a component's ideal layout only ever depends on overall page width — but it breaks down the moment a component can be placed in **more than one context** on the same page at the same viewport width.

Consider a card component that should show a compact, stacked layout when narrow and a wider, side-by-side layout when it has more room. If that card lives in a wide main content area *and* in a narrow sidebar on the same page, a media query can't tell them apart — it only knows the viewport is, say, 1400px wide, and has no way to know that the sidebar instance only actually has 320px of horizontal room to work with. Any \`@media (min-width: ...)\` rule you write applies identically to both instances, because both instances are on the same page at the same viewport width.

\`\`\`css
/* This can't distinguish "card in a wide main area"
   from "card in a narrow sidebar" — both see the same
   viewport width and get the same styles */
@media (min-width: 700px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}
\`\`\`

This is an increasingly common situation in component-based UIs (React, Vue, design systems) — the same component gets dropped into dashboards, sidebars, modals, grids of varying column counts — and it's exactly the gap **container queries** were built to close.

## container-type: inline-size

A **container query** lets an element respond to the size of its *nearest ancestor that has been explicitly marked as a query container*, rather than the viewport. You opt an element into being a container with \`container-type\`:

\`\`\`css
.card-wrapper {
  container-type: inline-size;
}
\`\`\`

\`inline-size\` is by far the most common value — it means "track this element's width" (in a standard horizontal writing mode, the inline axis is the horizontal axis), which is what nearly every real container query cares about. There's also \`size\` (tracks both width and height, but has layout containment restrictions that make it awkward for most real layouts) and \`normal\` (the default — not a query container at all). In practice, reach for \`inline-size\` unless you have a specific reason not to.

Setting \`container-type\` on an element also gives it CSS **containment**, which is what makes container queries technically possible in the first place — it tells the browser "this element's internal layout doesn't affect anything outside it," which avoids the circular-dependency problem of a container's children trying to query a size that the children themselves might otherwise influence.

## Naming containers with container-name

You can optionally name a container, which matters once you have more than one container ancestor and need a query to target a specific one rather than just "the nearest container":

\`\`\`css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}
\`\`\`

Both properties combine into the \`container\` shorthand (\`name / type\`), which is the form you'll see most often in real code:

\`\`\`css
.sidebar {
  container: sidebar / inline-size;
}
\`\`\`

## @container syntax

With a container established, any descendant can be styled conditionally on that container's size using \`@container\`, which reads almost identically to \`@media\`:

\`\`\`css
.card-wrapper {
  container-type: inline-size;
}

.card {
  display: flex;
  flex-direction: column;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
\`\`\`

Here, \`.card\` switches to a row layout once its **container** — \`.card-wrapper\`, not the viewport — reaches 400px wide. If a named container was set up, you can target it specifically instead of just the nearest one:

\`\`\`css
@container sidebar (min-width: 300px) {
  .card {
    flex-direction: row;
  }
}
\`\`\`

One important rule: **a selector inside \`@container\` cannot style the container element itself**, only its descendants — the container query has to look at an ancestor's size and apply the resulting styles further down the tree. If you need an element to respond to its *own* box size, wrap it in an extra element that becomes the container instead.

## Container query units: cqw, cqh, and friends

Just as \`vw\`/\`vh\` size relative to the viewport, **container query units** size relative to the nearest query container instead:

| Unit | Relative to |
|---|---|
| \`cqw\` | 1% of the query container's width |
| \`cqh\` | 1% of the query container's height |
| \`cqi\` | 1% of the container's inline size (width, in standard writing modes — matches \`cqw\` normally) |
| \`cqb\` | 1% of the container's block size (height, in standard writing modes) |
| \`cqmin\` | 1% of whichever of the container's width/height is smaller |
| \`cqmax\` | 1% of whichever of the container's width/height is larger |

This means the fluid-sizing technique from the previous lesson — \`clamp()\` combined with a scaling unit — works at the *component* level too, not just the page level:

\`\`\`css
.card-wrapper {
  container-type: inline-size;
}

.card__title {
  /* scales with the CARD's own width, not the viewport's */
  font-size: clamp(1rem, 4cqw, 1.5rem);
}
\`\`\`

A card dropped into a wide grid column gets larger title text automatically; the same card dropped into a narrow sidebar gets smaller title text automatically — with zero JavaScript and no media query, because the sizing is driven entirely by the box the card actually occupies.

## A realistic example: a card that goes horizontal when it has room

Pulling every piece together — a card component that stacks vertically by default and switches to a horizontal image-plus-content layout once its *container* (not the viewport) is wide enough:

\`\`\`html
<div class="card-slot">
  <article class="card">
    <img class="card__image" src="thumb.jpg" alt="" />
    <div class="card__body">
      <h3 class="card__title">Article headline</h3>
      <p class="card__excerpt">A short summary of the article contents goes here.</p>
    </div>
  </article>
</div>
\`\`\`

\`\`\`css
.card-slot {
  container-type: inline-size;
  container-name: card-slot;
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.card__body {
  padding: 1rem;
}

.card__title {
  font-size: clamp(1rem, 3cqw, 1.25rem);
}

/* Once the SLOT this card sits in has at least 480px of width,
   regardless of the viewport, switch to a horizontal layout */
@container card-slot (min-width: 480px) {
  .card {
    flex-direction: row;
  }

  .card__image {
    width: 40%;
    aspect-ratio: 4 / 3;
  }

  .card__body {
    width: 60%;
  }
}
\`\`\`

Drop this exact card markup into a full-width main content column and it goes horizontal, because that slot is wide. Drop the identical markup into a 300px sidebar on the very same page, at the very same viewport width, and it stays stacked — because container queries measure the box the component is actually sitting in, which is precisely the thing a viewport-based media query has no way to know.

## Media queries vs container queries

| | Media queries | Container queries |
|---|---|---|
| Measures | The viewport (whole browser window) | A specific ancestor element you've marked as a container |
| Good for | Page-level structural layout (overall column counts, nav patterns) | Component-level layout that must adapt to wherever it's reused |
| Setup required | None — works out of the box | Needs \`container-type\` set on an ancestor first |
| Can style the queried element itself | Yes | No — only descendants of the container |
| Units available | \`vw\`, \`vh\`, \`dvh\`, etc. | \`cqw\`, \`cqh\`, \`cqi\`, \`cqb\`, \`cqmin\`, \`cqmax\` |

The two aren't competitors — most real projects use both: media queries for the page's overall structural shape, container queries for individual components (cards, widgets, panels) that need to look right no matter which part of that structure they end up placed in. Container queries are baseline-supported in all current major browsers, so reaching for them for genuinely reusable, context-independent components is a safe default going forward rather than a bleeding-edge experiment.

> **Key idea:** Media queries measure the viewport, so they can't distinguish between two instances of the same component sitting in differently-sized contexts on the same page — container queries fix this by letting a component respond to the size of its actual containing box, via \`container-type: inline-size\` on an ancestor and \`@container\` rules (plus \`cqw\`/\`cqh\`-family units) on its descendants.`,
    },
  ],
}
