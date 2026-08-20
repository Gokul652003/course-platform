import type { Module } from "../types"

export const cssModule14: Module = {
  id: 14,
  title: "Architecture, Performance & Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Naming & Architecture",
      minutes: 12,
      intro: "See what large stylesheets turn into without a naming convention, then learn BEM, CSS Modules, and how to organize CSS at scale.",
      content: `## The problem: CSS has no boundaries

Every class you write in CSS lives in one giant, global namespace. There's no built-in way to say "this \`.title\` rule only applies inside my card component" — a selector named \`.title\` matches every element with \`class="title"\` anywhere in the document, forever, no matter which file it was written in.

On a small page this is harmless. On a real product, after a year of feature work from a dozen different contributors, it becomes the single biggest source of CSS pain:

- Someone adds a new \`.header\` class for a marketing banner, not realizing \`.header\` already styles the site's top nav. Both break.
- Deleting a rule is terrifying, because nobody can be sure what still depends on \`.card\` — grepping the codebase only tells you where the *class name* appears, not which of those usages actually needed *this* rule's specific styles.
- Specificity creeps upward over time as people fight collisions with more specific selectors (\`.page .sidebar .widget .title\`), which then need even *more* specific selectors to override later, and the stylesheet becomes an arms race.
- New team members can't tell, just by reading a class name, whether it's safe to reuse or whether it's tightly coupled to one specific spot in the markup.

None of this is a CSS "bug" — it's the direct consequence of global, uncoordinated naming. The fix isn't a language feature (CSS didn't have real scoping for decades); it's a **convention** that the whole team agrees to follow, or **tooling** that manufactures scoping for you. This lesson covers both paths.

## BEM: Block, Element, Modifier

**BEM** is a naming convention — not a library, not a build tool, just a pattern for class names that makes structure and relationships visible from the name alone. It breaks every interface into three kinds of pieces:

- **Block** — a standalone, reusable component: \`card\`, \`nav\`, \`search-form\`. A block should make sense on its own.
- **Element** — a part of a block that has no meaning outside it: \`card__title\`, \`card__price\`, \`search-form__input\`. Written as \`block__element\`, double underscore.
- **Modifier** — a variant or state of a block or element: \`card--featured\`, \`search-form__input--invalid\`. Written as \`block--modifier\` or \`block__element--modifier\`, double hyphen.

### A worked example

Markup for a pricing card, fully BEM-named:

\`\`\`html
<div class="card card--featured">
  <h2 class="card__title">Plan: Pro</h2>
  <p class="card__price">$29/mo</p>
  <ul class="card__features">
    <li class="card__feature">Unlimited projects</li>
    <li class="card__feature card__feature--highlighted">Priority support</li>
  </ul>
  <button class="card__cta">Choose Pro</button>
</div>
\`\`\`

And the CSS. Notice every selector is a single class — no nesting, no descendant combinators like \`.card .title\`:

\`\`\`css
.card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.card--featured {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px #6366f1;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 700;
}

.card__price {
  color: #64748b;
  font-size: 1.5rem;
}

.card__feature--highlighted {
  font-weight: 600;
  color: #6366f1;
}
\`\`\`

Two things fall out of this immediately. First, **flat specificity** — every rule is exactly one class selector (specificity 0-1-0), so nothing ever needs to out-specificity anything else to win; order in the file is the only thing that matters, and even that rarely comes up because names don't collide. Second, **safety by construction** — \`.card__title\` cannot possibly collide with an unrelated \`.title\` class elsewhere in the app, because nobody else would ever name something \`card__title\` unless they specifically meant "the title inside a card block." The naming itself carries the scoping.

The tradeoff is verbosity: names get long (\`search-form__input--invalid\` is a mouthful), and you must actually follow the convention — BEM enforces nothing at the tooling level, it only works if the team is disciplined about it.

## A different answer: utility-first CSS

BEM's whole premise is that you'll invent a name for every visual concept, then write CSS for that name. **Utility-first** frameworks reject that premise entirely — instead of naming things, you compose pre-built single-purpose classes (\`flex\`, \`p-6\`, \`text-slate-500\`) directly on elements, and no custom class names get invented at all. That sidesteps naming collisions structurally: there's no \`.card\` to collide with anything, because there's no \`.card\`.

**Tailwind CSS** is the dominant utility-first framework today, and this platform has a separate, full course dedicated to it — so this lesson won't re-teach utility classes here. The point worth internalizing now is just that BEM and utility-first are two different answers to the *same* underlying problem (uncoordinated global naming), and they trade off differently: BEM keeps markup terse and styles in a stylesheet but demands naming discipline; utility-first eliminates naming decisions but makes markup more verbose.

## CSS Modules and scoped CSS: solving it with tooling

A third path skips convention altogether and lets a **build step** guarantee uniqueness. **CSS Modules** is the most common form of this in the React/Vite/webpack world: you write an ordinary-looking CSS file, but name it \`Card.module.css\`, and the bundler rewrites every class name in it to something globally unique before it ever reaches the browser.

\`\`\`css
/* Card.module.css */
.title {
  font-size: 1.25rem;
  font-weight: 700;
}
\`\`\`

\`\`\`tsx
import styles from "./Card.module.css"

function Card() {
  return <h2 className={styles.title}>Plan: Pro</h2>
}
\`\`\`

At build time, \`styles.title\` doesn't resolve to \`"title"\` — it resolves to something like \`"Card_title__a3f9k"\`, a hash derived from the file and class name. You can write \`.title\` in fifty different \`*.module.css\` files across the codebase and none of them will ever collide, because each one compiles to a different final string. You get to write plain, short, unscoped-*looking* CSS, and the scoping is enforced mechanically instead of by discipline.

Vue's \`<style scoped>\` blocks and Svelte's component \`<style>\` tags solve the identical problem a different way: instead of renaming classes, the framework adds a unique data attribute to every element the component renders (e.g. \`data-v-7ba5bd90\`) and rewrites your selectors to require that attribute. Same goal — the browser sees selectors that only match elements from one component — different mechanism.

The native browser answer to this same problem is the **\`:where()\`/\`@scope\`** CSS-only scoping features, which let you declare a scoping root directly in CSS without any build step — worth knowing exists, though CSS Modules remain far more common in production React apps today because of how naturally they fit a component-per-file structure.

## Organizing a large stylesheet

Even with a scoping strategy chosen, a real app's CSS needs a filesystem structure, or a single 5,000-line \`styles.css\` becomes its own problem regardless of naming convention.

**Partials and imports** — split CSS into focused files and pull them together with \`@import\` (native CSS import, or a bundler's CSS import, which is now fast and doesn't cost an extra HTTP request once bundled):

\`\`\`css
/* main.css */
@import "./reset.css";
@import "./tokens.css";
@import "./layout.css";
@import "./components/card.css";
@import "./components/nav.css";
@import "./utilities.css";
\`\`\`

**ITCSS** (Inverted Triangle CSS) is a widely-used ordering principle for exactly this kind of file: organize partials from *least specific and broadest-reaching* at the top, to *most specific and narrowest-reaching* at the bottom, so specificity naturally increases as the cascade proceeds and later rules can override earlier ones without a specificity fight. A simplified version of the layering:

1. **Settings** — custom properties, design tokens (no actual CSS output, just variables)
2. **Generic** — resets, box-sizing, base defaults
3. **Elements** — bare HTML element styling (\`h1\`, \`a\`, \`ul\`) with no classes
4. **Objects** — layout patterns with no visual styling (a grid wrapper, a container)
5. **Components** — actual UI pieces: \`.card\`, \`.nav\`, \`.modal\`
6. **Utilities** — small, high-specificity overrides like \`.hidden\` or \`.text-center\`, meant to win against everything above them

You don't need to adopt ITCSS wholesale to benefit from the idea — even just "tokens and resets first, components in the middle, utility overrides last" prevents a lot of the specificity fights that make legacy stylesheets miserable to touch.

## Comparing the three approaches

| | BEM | Utility-first (Tailwind) | CSS Modules |
|---|---|---|---|
| Naming burden | High — name every block/element/modifier | None — utilities are pre-named | Low — short local names are fine, uniqueness is automatic |
| Collision risk | Low, if convention is followed correctly | None — no custom class names exist | None — enforced by the build |
| Tooling required | None — works in plain CSS | Build step (JIT compiler) | Build step (bundler with CSS Modules loader) |
| Where styles live | Separate CSS file | Inline in markup/JSX | Separate CSS file, imported per-component |
| Enforcement | Human discipline only | Structural (nothing to misuse) | Structural (build guarantees it) |
| Markup verbosity | Moderate (long class names) | High (many classes per element) | Low (short local class names) |

None of these is strictly "correct" — teams successfully ship products with any of the three, and it's common to see them combined (e.g. CSS Modules for component styling, with a handful of Tailwind-style utility classes for one-off spacing tweaks). What matters is that the whole team uses the *same* answer consistently; the worst outcome is a codebase with several of these half-applied at once, which reintroduces the exact collision risk all of them exist to prevent.

> **Key idea:** Global class names are CSS's fundamental scoping problem — BEM solves it through naming discipline, utility-first sidesteps it by never naming things, and CSS Modules solve it mechanically at build time; pick one convention deliberately and apply it consistently rather than mixing approaches ad hoc.`,
    },
    {
      name: "Performance",
      minutes: 11,
      intro: "Understand the critical rendering path, why layout thrash happens, and how content-visibility and contain keep large pages fast.",
      content: `## The critical rendering path, briefly

Before a browser can show anything on screen, it has to turn HTML and CSS into pixels. The simplified version of that pipeline, known as the **critical rendering path**:

1. Parse HTML into the **DOM** (Document Object Model — a tree of elements).
2. Parse CSS into the **CSSOM** (CSS Object Model — a tree of every rule and which elements it applies to).
3. Combine DOM + CSSOM into the **render tree** — only the elements that will actually be visible, with their computed styles attached.
4. **Layout** (a.k.a. reflow) — calculate the exact size and position of every box in the render tree.
5. **Paint** — fill in pixels: colors, text, borders, shadows, images.
6. **Composite** — combine painted layers onto the screen, honoring \`z-index\`, transforms, and opacity.

The detail that matters most for real-world performance: **CSS is render-blocking**. The browser cannot build the render tree — and therefore cannot paint anything — until it has finished downloading and parsing *all* CSS the page has requested via \`<link>\` or blocking \`@import\`. It has to wait, because showing unstyled content and then immediately restyling it (a flash of unstyled content, or FOUC) is worse than a short blank delay.

This is exactly why \`<link rel="stylesheet">\` belongs in \`<head>\`, loaded early, rather than at the bottom of \`<body>\`: the browser needs to discover and start downloading it as early as possible, because everything downstream of "first paint" is blocked on it finishing. A large, unoptimized CSS file — or CSS split across many separate \`<link>\` requests that can't all start downloading immediately — directly delays the moment a user sees anything at all. This is one of the concrete reasons frameworks bundle and minify CSS into as few files as practical for production.

## Layout thrash

**Layout thrash** (or "forced synchronous layout") happens when JavaScript alternates between *reading* a layout-dependent value (like \`element.offsetHeight\`) and *writing* a style that changes layout (like \`element.style.width = "..."\`), repeatedly, in a loop. Each read after a write forces the browser to run layout again immediately, synchronously, instead of waiting to batch it with the next natural repaint — because the browser can't answer "what is this element's height right now" without first recomputing layout to account for the write that just happened.

Conceptually, the fix is to **batch all your reads, then batch all your writes**, never interleave them:

\`\`\`js
// Bad: forces layout on every iteration (read, write, read, write...)
boxes.forEach((box) => {
  const height = box.offsetHeight // read — forces layout if prior write is pending
  box.style.height = height * 2 + "px" // write
})

// Better: read everything first, then write everything
const heights = boxes.map((box) => box.offsetHeight) // all reads
boxes.forEach((box, i) => {
  box.style.height = heights[i] * 2 + "px" // all writes
})
\`\`\`

This is primarily a JavaScript-and-DOM concern rather than a pure CSS one, but it's worth knowing as a CSS author because the *properties you choose* determine how expensive layout is in the first place — animating \`width\`, \`top\`, or \`margin\` triggers layout on every frame, while animating \`transform\` and \`opacity\` (covered in the animations module) can often skip layout and even paint entirely, handled purely by compositing.

## content-visibility: auto

Modern browsers give CSS itself a tool for skipping rendering work on content the user can't see yet: the **\`content-visibility\`** property.

\`\`\`css
.long-article section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
\`\`\`

Setting \`content-visibility: auto\` on an element tells the browser: skip layout, paint, and rendering work for this element's contents entirely while it's off-screen, and only do that work once it scrolls near the viewport. For a long page — a huge article, a big table, an infinite feed rendered server-side without virtualization — this can cut initial rendering cost dramatically, because the browser never bothers computing layout for the 90% of content nobody has scrolled to yet.

The companion property, **\`contain-intrinsic-size\`**, matters because skipping layout means the browser doesn't actually know how tall that section is — without a size estimate, the page's scrollbar would jump around unpredictably as sections get measured for the first time on scroll. \`contain-intrinsic-size: auto 500px\` gives the browser a placeholder size (500px tall) to reserve until the real content is measured, keeping scroll position stable.

## The contain property

**\`contain\`** is a more general tool that tells the browser "the effects of what's inside this element are contained — you don't need to look outside it, or check the rest of the page, to know how this box lays out or paints." That's a promise from you to the browser, and it lets the browser skip a lot of the whole-document recalculation work it would otherwise do defensively.

| Value | What it contains | What it lets the browser skip |
|---|---|---|
| \`contain: size\` | This element's size doesn't depend on its children | Doesn't need to measure children before laying out this box |
| \`contain: layout\` | Nothing inside affects layout outside this box | Can skip re-laying-out the rest of the page when this subtree changes |
| \`contain: paint\` | Nothing inside paints outside this box's bounds (acts like \`overflow: hidden\` for paint purposes) | Can skip painting this subtree if it's off-screen or covered |
| \`contain: style\` | Counters/quotes inside don't leak outside | Can skip recomputing scoped counter state elsewhere |
| \`contain: content\` | Shorthand for \`layout paint style\` | Combination of the above |
| \`contain: strict\` | Shorthand for \`size layout paint style\` | Maximum containment — strongest browser optimization |

A concrete case: a card in a grid of independent, unrelated cards is a natural candidate for \`contain: content\` — nothing that happens inside one card (text reflowing, an image loading) should ever need to ripple out and re-layout the other 200 cards on the page, and \`contain\` lets the browser act on that guarantee instead of conservatively re-checking. \`content-visibility: auto\`, in fact, implicitly applies strong containment for exactly this reason — the two properties are closely related.

## Reducing unused CSS

Shipping CSS the page never actually uses costs download time, parse time, and CSSOM construction time, all for nothing. A few standard approaches, briefly:

- **Build-time purging** — tools like Tailwind's JIT engine only ever generate CSS for classes actually found in your source files, so unused utilities never exist in the first place.
- **Coverage analysis** — browser DevTools' "Coverage" tab shows exactly which CSS rules were and weren't used while loading a page, useful for auditing a legacy stylesheet.
- **Code-splitting CSS** — bundlers like Vite can emit a separate CSS file per route/component so a user only downloads styles for the page they're actually on, rather than one global stylesheet covering the entire app.

This is a fairly deep rabbit hole with a lot of tool-specific detail, so treat it as "know these exist and what problem they solve" rather than something to memorize deeply — the tooling in a real project (bundler, framework, CSS framework) usually handles most of this automatically once configured correctly.

> **Key idea:** CSS blocks first paint by design, so keep it lean and load it early; for runtime cost, \`content-visibility: auto\` and \`contain\` let you tell the browser "don't bother rendering or recalculating what you don't need to," which is often a bigger win on long pages than micro-optimizing individual selectors.`,
    },
    {
      name: "Accessibility & Production Best Practices",
      minutes: 12,
      intro: "Cover reduced motion, color contrast, focus styles, print stylesheets, and @supports — then wrap up the course with a production checklist.",
      content: `## Respecting prefers-reduced-motion

Some users experience real physical discomfort — dizziness, nausea, migraines — from large-scale motion on screen, whether from a vestibular disorder or just personal sensitivity. Operating systems expose a setting for this, and CSS can read it directly with the **\`prefers-reduced-motion\`** media feature, which the animations module touched on — this lesson treats it as a non-negotiable production checklist item rather than an optional nicety.

\`\`\`css
.hero-banner {
  animation: slide-in-and-bounce 0.8s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .hero-banner {
    animation: none;
  }
}
\`\`\`

The safest default for a whole codebase is a global rule that neutralizes motion broadly, so individual components don't each need to remember to opt in:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`

Note this reduces durations to near-zero rather than setting \`animation: none\` globally — that preserves *end states* (an element an animation was supposed to reveal still ends up visible) while eliminating the actual motion, which matters because a blanket \`display: none\`-style override can leave things in a broken half-animated visual state.

## Color contrast

Text that's technically readable to someone with strong eyesight in good lighting can be genuinely unreadable to someone with low vision, color blindness, or just a phone screen in bright sunlight. The **Web Content Accessibility Guidelines (WCAG)** define minimum **contrast ratios** between text and its background, and level **AA** (the standard most legal and organizational requirements target) sets two thresholds:

- **4.5:1** for normal-sized text
- **3:1** for large text (roughly 18pt+, or 14pt+ bold)

Contrast ratio is a mathematical relationship between the luminance of two colors, not something you can eyeball reliably — light gray text (\`#999999\`) on white looks fine to many people but is under 3:1, well below the threshold. Use a contrast checker (browser DevTools' color picker shows a live ratio when you inspect text, and standalone tools exist too) rather than guessing.

\`\`\`css
/* Fails AA for normal text — roughly 2.8:1 */
.muted-text {
  color: #999999;
  background: #ffffff;
}

/* Passes AA for normal text — roughly 4.6:1 */
.muted-text {
  color: #767676;
  background: #ffffff;
}
\`\`\`

A closely related rule: **never convey information by color alone**. A form field that only turns red to indicate an error is invisible to a color-blind user, and invisible on a black-and-white printout. Pair color with a second signal — an icon, an underline, explicit text ("This field is required"):

\`\`\`css
.field--invalid {
  border-color: #dc2626;
}

.field--invalid::after {
  content: "⚠ Required";
  color: #dc2626;
  display: block;
  font-size: 0.875rem;
}
\`\`\`

## Visible focus styles

When a user navigates with a keyboard (Tab, Shift+Tab, arrow keys) rather than a mouse, the **\`:focus\`** (or, better, **\`:focus-visible\`**) outline is the only signal on screen of where they currently are. Removing it — \`outline: none\` on a button or link with nothing put in its place — is one of the single most damaging accessibility mistakes a stylesheet can make: it doesn't just look worse, it makes the page genuinely unusable for anyone who can't or doesn't use a mouse.

\`\`\`css
/* Never do this alone: */
button:focus {
  outline: none;
}

/* Do this instead — replace, don't remove: */
button:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
\`\`\`

\`:focus-visible\` specifically (rather than plain \`:focus\`) is worth using here because it lets the browser apply its own heuristic for *when* a focus ring is actually useful — showing it for keyboard navigation, and generally suppressing it for a mouse click, which is the behavior most designers actually want without having to hand-roll that distinction in JavaScript. The rule is simple either way: it is always acceptable to *restyle* focus indication to match your design, and never acceptable to delete it with nothing replacing it.

## Print stylesheets

**\`@media print\`** lets you ship CSS that only applies when a page is printed (or exported to PDF via a browser's print dialog) — genuinely useful for documentation, receipts, articles, or invoices, where the printed page has different needs than the screen: no navigation to click, no point in showing interactive controls, and links that can't be clicked need their destination visible as text.

\`\`\`css
@media print {
  nav,
  .sidebar,
  .no-print,
  button {
    display: none;
  }

  body {
    color: #000;
    background: #fff;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #555;
  }
}
\`\`\`

That last rule is a classic, genuinely useful print pattern: \`a[href]::after\` with \`content: attr(href)\` pulls the actual URL out of every link's \`href\` attribute and prints it in parentheses right after the link text, since a printed page obviously can't be clicked — a reader with the physical page in hand can still see (and type, or scan) exactly where a link pointed.

## @supports: feature detection in CSS

Not every browser a site's users run supports every CSS feature on day one. **\`@supports\`** lets a stylesheet check whether a browser understands a given property/value pair before relying on it, providing a plain-CSS fallback path with no JavaScript involved:

\`\`\`css
.gallery {
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
\`\`\`

The browser evaluates the flexbox rule first (broad support, a safe universal fallback), then overrides it with the grid rule only if \`display: grid\` is actually supported — a browser that doesn't understand \`@supports\` at all simply ignores the whole block and keeps the flexbox layout, which is itself a graceful fallback. This pattern — write the safe baseline first, layer progressive enhancement on top inside \`@supports\` — is the standard way to adopt newer CSS (container queries, \`:has()\`, subgrid) without breaking older browsers outright; you get to ship the modern feature to browsers that support it and a reasonable fallback everywhere else, from a single stylesheet.

## Closing checklist: production CSS, top to bottom

This module closes out the course, so here's a consolidated checklist pulling together what "production-ready CSS" means across everything covered:

- [ ] **Naming/architecture** is consistent across the codebase — BEM, utility-first, or CSS Modules, chosen deliberately and not mixed ad hoc.
- [ ] Large stylesheets are **organized into partials**, roughly ordered from broad/global (resets, tokens) to narrow/specific (components, utility overrides).
- [ ] Custom properties/**design tokens** are used for colors, spacing, and type scale rather than repeated magic values.
- [ ] Layout uses **Flexbox and Grid** appropriately rather than legacy floats or absolute-positioning hacks.
- [ ] Responsive behavior uses **relative units** (\`rem\`, \`%\`, \`fr\`, \`clamp()\`) and container/media queries rather than fixed pixel breakpoints only.
- [ ] \`<link rel="stylesheet">\` is loaded early in \`<head>\`, and the CSS bundle is kept lean — no dead, unused rules shipped to production.
- [ ] Expensive off-screen content uses \`content-visibility: auto\`; independent components use \`contain\` where it's a genuine fit.
- [ ] Animations respect \`prefers-reduced-motion\`, and prefer \`transform\`/\`opacity\` over layout-triggering properties.
- [ ] Text meets **WCAG AA contrast** (4.5:1 normal, 3:1 large), and no state is conveyed by color alone.
- [ ] **Focus styles are never removed** without an equally visible replacement.
- [ ] Newer CSS features are adopted behind **\`@supports\`** with a safe fallback, not assumed universally available.

None of these individually is exotic — the point of this checklist is that production quality is less about any single clever technique and more about consistently applying the *fundamentals* covered across this course: sound structure, real accessibility, and a rendering path you've actually thought about, on every page, not just the ones that happen to get the most attention.

> **Key idea:** Production CSS is measured by what happens for the users a happy-path demo never shows — the keyboard-only user, the low-vision user, the printed page, the older browser, the slow scroll through a huge list — and every technique in this lesson exists to make those cases work correctly rather than by accident.`,
    },
  ],
}
