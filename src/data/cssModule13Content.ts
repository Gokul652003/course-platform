import type { Module } from "../types"

export const cssModule13: Module = {
  id: 13,
  title: "Advanced Selectors & Modern Layout",
  status: "upcoming",
  lessons: [
    {
      name: ":is(), :where(), :has()",
      minutes: 12,
      intro: "Collapse repetitive selector lists with :is() and :where(), then reach past pure selectors entirely with :has(), the long-awaited parent selector.",
      content: `## The problem these three solve

Before these functional pseudo-classes existed, CSS selectors could only describe a fixed path down the DOM tree — never "does this element contain that one," and never "match any of these variations" without spelling every variation out. \`:is()\`, \`:where()\`, and \`:has()\` all landed in Baseline-widely-available browsers in the last few years, and together they close two long-standing gaps: repetitive selector lists, and the total inability to select based on descendants. Once you have all three, a huge amount of layout logic that used to require JavaScript class-toggling can live entirely in CSS.

## :is() — collapsing repetitive selector lists

Selectors that repeat the same prefix over and over are extremely common. Take heading resets scoped to an article:

\`\`\`css
/* Before :is() */
article h1,
article h2,
article h3,
article h4 {
  font-family: "Georgia", serif;
  line-height: 1.25;
}

article h1 a,
article h2 a,
article h3 a,
article h4 a {
  color: inherit;
  text-decoration: none;
}
\`\`\`

Every rule repeats \`article\` four times, and adding \`h5\` means editing two places. \`:is()\` takes a comma-separated list of selectors and matches anything that matches *any* of them, so the whole thing collapses:

\`\`\`css
/* After :is() */
article :is(h1, h2, h3, h4) {
  font-family: "Georgia", serif;
  line-height: 1.25;
}

article :is(h1, h2, h3, h4) a {
  color: inherit;
  text-decoration: none;
}
\`\`\`

This isn't just shorter — it's a single source of truth. Add \`h5\` to the list once and both rules pick it up. \`:is()\` is also useful for combining otherwise-unrelated ancestor paths:

\`\`\`css
:is(.sidebar, .modal, .drawer) .close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
\`\`\`

One subtlety: **:is() takes the highest specificity of its arguments**, not zero. \`:is(#id, .class)\` behaves, specificity-wise, as if you'd written \`#id\` — the whole selector becomes as specific as its most specific argument. That matters when you're trying to predict which rule wins later, and it's exactly the problem \`:where()\` was designed to avoid.

Also note: if *any* selector in the \`:is()\` list is invalid or unsupported, older behavior (and its older sibling \`:matches()\`/\`-webkit-\` prefixed versions) would invalidate the whole rule. Modern \`:is()\` is **forgiving** — an unsupported argument inside the list is simply ignored rather than breaking the entire selector, which makes it safer to use with newer selector syntax mixed in.

## :where() — same matching, zero specificity

\`:where()\` matches *exactly* the same elements as \`:is()\` with the same argument list. The only difference is specificity: **:where() always contributes zero specificity**, regardless of what's inside it, even \`#id\` selectors.

\`\`\`css
/* This rule has the specificity of .close-button — 0,1,0 — not the ID */
:where(.sidebar, .modal, #legacy-drawer) .close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
\`\`\`

Why does zero specificity matter? Because it makes rules trivially overridable by anything downstream, without needing to win a specificity fight first. This is the exact tool CSS resets and component libraries reach for:

\`\`\`css
/* A base reset that a consumer can override with a single class,
   no !important and no specificity math required */
:where(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  font-weight: 600;
}
\`\`\`

Without \`:where()\`, writing \`h1, h2, h3 { margin: 0; }\` still has real specificity (0,0,1), which is low but not *zero* — and if you'd instead written something like \`.card h2\`, that beats a lone \`.reset-heading\` class trying to override it. Wrapping the reset in \`:where()\` guarantees the reset never out-competes anything, no matter how the reset selector itself is written. This is precisely why component libraries (design systems shipping default styles that consumers are expected to override) lean on \`:where()\` heavily — it lets them write selectors as complex as they like internally without ever risking a specificity war with the consumer's own CSS.

| | \`:is()\` | \`:where()\` |
|---|---|---|
| Matches | Same as its argument list | Same as its argument list |
| Specificity | Highest of any argument | Always zero |
| Typical use | Shortening repetitive selectors | Writing overridable base/reset styles |
| Forgiving parsing | Yes | Yes |

## :has() — the parent selector, finally

For as long as CSS has existed, there was no way to select an element based on what's *inside* it or *after* it in the markup — only based on ancestors and preceding siblings. \`:has()\` removes that restriction. It matches an element if the selector passed to it matches something relative to that element — a descendant, a following sibling, or several other relationships.

### Example 1: a card that reacts to containing an image

\`\`\`css
.card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

/* Only cards that actually contain an image get a taller layout
   and a subtle border — no JS class-toggling needed */
.card:has(img) {
  grid-template-rows: auto 1fr auto;
  border: 1px solid #e2e8f0;
}
\`\`\`

Before \`:has()\`, doing this required either JavaScript to inspect the DOM and add a modifier class like \`.card--with-image\`, or a server-side/build-time check. Now it's a plain CSS rule that stays correct even if the markup is generated dynamically and you have no easy hook to add a class at the right time.

### Example 2: a form group that highlights on invalid input

\`\`\`css
.form-group {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

/* Highlight the whole group, not just the input, when it contains
   an :invalid field the user has already interacted with */
.form-group:has(:invalid:not(:placeholder-shown)) {
  border-color: #ef4444;
  background-color: #fef2f2;
}
\`\`\`

This is a genuinely new capability: styling a *container* based on the validation state of a *descendant*. \`:invalid\` alone only ever styled the input itself; combined with \`:has()\`, the whole surrounding group can react.

### Example 3: styling a label from a sibling checkbox, via :has()

\`:has()\` also unlocks relationships that used to be impossible: reacting to a sibling that comes *before* the element you're styling, going through a shared parent.

\`\`\`html
<div class="option">
  <input type="checkbox" id="opt-1" />
  <label for="opt-1">Enable notifications</label>
</div>
\`\`\`

\`\`\`css
.option {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

/* Style the *container* (and therefore, visually, the label inside it)
   whenever its checkbox is checked */
.option:has(input:checked) {
  background: #eff6ff;
}

.option:has(input:checked) label {
  font-weight: 600;
  color: #1d4ed8;
}
\`\`\`

The classic CSS-only "checked styling" trick relied on the general sibling combinator (\`input:checked ~ label\`), which only works when the label comes *after* the input in markup, and only styles following siblings — it could never reach backward to style something before the input, or style a shared parent. \`:has()\` removes that ordering constraint entirely: it doesn't matter whether the label comes before or after the checkbox in the DOM, because you're matching the shared ancestor and letting normal descendant selectors do the rest.

### A quick word on performance

\`:has()\` looks like it could be expensive — matching it in the worst case means the browser has to check descendants of every candidate element. In practice, browser engines optimize this well for the common cases (shallow \`:has(img)\`-style checks), but it's still worth keeping the argument narrow and specific rather than something like \`body:has(*)\`, and avoiding \`:has()\` inside extremely hot, deeply nested render paths if you notice actual jank — profile before assuming it's a problem, but don't reach for it reflexively on every rule either.

> **Key idea:** \`:is()\` and \`:where()\` solve the same matching problem — collapsing repetitive selector lists — but differ entirely in specificity, making \`:where()\` the right choice for anything meant to be easily overridden; \`:has()\` is a different kind of tool altogether, letting a selector react to its descendants and unlocking "parent selector" and "sibling-aware" patterns that were previously only possible with JavaScript.`,
    },
    {
      name: "CSS Nesting",
      minutes: 11,
      intro: "Write nested selectors natively in CSS, master the & selector for compound and pseudo-class nesting, and see how it compares to Sass and Less.",
      content: `## Nesting arrives natively

For over a decade, nesting selectors inside a parent — the way Sass and Less have always allowed — required a preprocessor. Native CSS nesting is now Baseline widely available, meaning you can write nested rules directly in a \`.css\` file with no build step required, though it works identically when your project already runs through a bundler.

## The basic syntax

A rule nested inside another rule is implicitly scoped to descendants of the outer selector:

\`\`\`css
.card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
  }

  p {
    color: #64748b;
    margin-top: 0.25rem;
  }
}
\`\`\`

This compiles down to (conceptually) the same thing you'd get by hand-writing \`.card h2\` and \`.card p\` as separate top-level rules — nesting is sugar for descendant selectors, not a new matching mechanism. The benefit is purely organizational: everything related to \`.card\` lives in one block, and renaming \`.card\` to \`.product-card\` is a single edit instead of a find-and-replace across the file.

## The & selector — referencing the parent explicitly

Plain nesting like the example above works because a bare selector (\`h2\`, \`p\`) nested inside a rule is automatically treated as a descendant combinator. But the moment you need to attach something *directly* to the parent — a compound selector, a pseudo-class, a pseudo-element, or an attribute selector with no combinator between it and the parent — you need the explicit \`&\` symbol, which stands in for "the parent selector, right here."

\`\`\`css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: #3b82f6;
  color: white;

  /* Pseudo-classes: & is required */
  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Compound selector: attaches directly, no descendant gap */
  &.button--outline {
    background: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
  }

  /* Pseudo-element */
  &::after {
    content: "";
    display: inline-block;
  }
}
\`\`\`

Without \`&\`, writing \`:hover { ... }\` nested inside \`.button\` would be interpreted as \`.button :hover\` — a descendant combinator matching any hovered element *inside* a button, which is almost never what you want. \`&:hover\` correctly produces \`.button:hover\`.

\`&\` can also appear on the *right* side, or in the middle, of a nested selector — useful for styling based on an ancestor further up the tree, or writing sibling relationships:

\`\`\`css
.dark-theme {
  & .card {
    background: #1e293b;
    color: #f1f5f9;
  }
}

.item {
  & + & {
    /* an .item immediately following another .item */
    margin-top: 0.5rem;
  }
}
\`\`\`

## Nesting at-rules: media and container queries

One of the most practical wins of native nesting is being able to nest \`@media\` and \`@container\` queries directly inside a rule, keeping responsive overrides next to the base styles they modify instead of in a separate block far down the file:

\`\`\`css
.sidebar {
  width: 100%;
  padding: 1rem;

  @media (min-width: 768px) {
    width: 240px;
    padding: 1.5rem;
  }

  @container (min-width: 400px) {
    font-size: 1.0625rem;
  }
}
\`\`\`

Inside a nested \`@media\` block, an implicit \`&\` still applies to bare declarations for that block — this reads naturally as "when the container is at least 768px wide, *this same element* gets these overrides," without repeating \`.sidebar\` as a selector inside the media query the way you'd have to in flat CSS.

## Nesting vs. Sass / Less

Developers coming from Sass or Less will find native nesting mostly familiar, but there are real differences worth knowing before assuming old muscle memory transfers directly.

| | Sass / Less | Native CSS nesting |
|---|---|---|
| Requires a build step | Yes | No — runs directly in the browser |
| Bare selector nesting (\`h2 { }\` inside \`.card\`) | Works, implicit descendant | Works, implicit descendant (same behavior) |
| Compound/pseudo-class nesting (\`&:hover\`, \`&.active\`) | \`&\` optional in many cases, often omitted | \`&\` **required** for anything attaching directly to the parent |
| Nesting media queries | Supported, own syntax | Supported, standard \`@media\` syntax |
| Nesting nested selectors arbitrarily deep | Yes, no practical limit | Yes, but deep nesting still generates equally deep descendant selectors underneath — same specificity cost |
| Variables | \`$variable\` (Sass) | CSS custom properties (\`--variable\`), usable with or without nesting |
| Mixins, functions, loops | Yes | No — nesting is purely a selector-writing convenience, not a programming layer |

The single biggest gotcha migrating from Sass: **Sass lets you nest a bare element or type selector as a compound with no combinator by just writing it adjacent**, and it also lets you omit \`&\` in more places due to its own parsing rules being looser. Native CSS nesting is stricter — if what follows the parent isn't a plain type/class/ID/attribute selector meant as a descendant, and it needs to attach *directly* to the parent (a pseudo-class, pseudo-element, or the parent itself as part of a compound), you must write \`&\` explicitly. Forgetting it doesn't error — it just silently produces a descendant selector instead of the compound one you meant, which can be a confusing bug to track down.

Another difference: native nesting has no mixins, no \`@extend\`, no functions or loops, and no arithmetic — it only nests selectors and at-rules. For anything beyond that, you still reach for CSS custom properties, \`calc()\`, and the cascade itself, or keep using a preprocessor if your project genuinely needs programmatic style generation.

> **Key idea:** Native CSS nesting is sugar for writing descendant selectors in one organized block, not a new selector-matching capability — bare selectors nest as descendants automatically, but anything that needs to attach directly to the parent (pseudo-classes, pseudo-elements, compound selectors) requires the explicit \`&\`, which is stricter than Sass's more permissive nesting rules.`,
    },
    {
      name: "Cascade Layers (@layer) & Subgrid",
      minutes: 13,
      intro: "Take explicit control of the cascade with @layer, independent of specificity and source order, then use subgrid to align nested grid items to their parent's tracks.",
      content: `## The problem @layer solves

The cascade normally resolves conflicting rules using specificity first, then source order as a tiebreaker. That works fine for small stylesheets, but at scale — especially once a third-party library, a component library, and your own overrides are all in play — it turns into a losing game of "add one more class, or reach for \`!important\`" every time you need something to win. **Cascade layers**, declared with \`@layer\`, add a new axis to the cascade that's resolved *before* specificity and source order: which layer a rule belongs to.

## Declaring layer order up front

The first thing you typically do is declare the order of your layers, before any of them have rules in them:

\`\`\`css
@layer reset, base, components, utilities, overrides;
\`\`\`

This single statement fixes the priority order for the whole stylesheet: \`reset\` loses to everything, \`base\` loses to everything after it, and so on up to \`overrides\`, which wins against every other named layer no matter how specific their selectors are or where their rules appear in the file. Order here means **cascade priority**, not necessarily the order the \`@layer\` blocks appear later in the file — you can define \`utilities\` rules physically above \`base\` rules in the source, and \`utilities\` still wins, because the layer order was declared explicitly up front.

## Adding rules to layers

Once layers are declared, you assign rules to them with named \`@layer\` blocks:

\`\`\`css
@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: #1e293b;
  }

  a {
    color: #2563eb;
  }
}

@layer components {
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    background: #e2e8f0;
  }
}

@layer utilities {
  .text-center {
    text-align: center;
  }
}
\`\`\`

Here's the payoff: a rule in \`utilities\` beats a rule in \`components\` even if the \`components\` selector is more specific. Given \`.btn.text-center\` in markup, \`.text-center { text-align: center }\` (in \`utilities\`) wins over a hypothetical \`.btn.some-id { text-align: left }\` rule sitting in \`components\`, purely because \`utilities\` was declared later in the layer order — specificity is never even consulted, because layer order settles it first.

## Unlayered styles always win

This is the rule that trips people up most: **any CSS not inside an \`@layer\` block is treated as if it's in its own layer that comes after every named layer** — meaning plain, unlayered rules always beat layered ones, regardless of specificity.

\`\`\`css
@layer reset, base;

@layer base {
  .card {
    background: white;
  }
}

/* Unlayered — this wins over the .card rule in @layer base,
   even though the selectors have identical specificity */
.card {
  background: #f8fafc;
}
\`\`\`

This is intentional and useful: it means you can always reach for a plain, un-layered override as an escape hatch that's guaranteed to win against anything layered, without needing to know or care what layer the thing you're overriding lives in.

## A practical use case: resetting a specificity war with third-party CSS

A common real scenario: you're importing a third-party component library's CSS, and some of its selectors are more specific than you'd like, making them hard to override with your own plain classes. Wrapping the import in a layer solves this cleanly:

\`\`\`css
@layer third-party, base, overrides;

@import url("some-library.css") layer(third-party);

@layer overrides {
  /* This now beats anything in some-library.css, no matter how
     specific the library's internal selectors are, because
     overrides was declared after third-party */
  .some-library-widget .inner-thing {
    color: inherit;
  }
}
\`\`\`

Because \`third-party\` is declared first (lowest priority) in the layer order, literally nothing you write in \`overrides\` needs to out-specificity it — layer order already guarantees the win. This is a dramatically cleaner alternative to piling on extra classes or \`!important\` to fight a library's internal CSS.

The same pattern — \`reset\`, \`base\`, \`components\`, \`utilities\`, \`overrides\` — is also exactly how a from-scratch design system tends to organize itself, giving every category of style a predictable, guaranteed priority relative to every other category, decided once, up front, instead of re-litigated selector by selector.

| | Specificity (traditional cascade) | Cascade layers |
|---|---|---|
| What decides priority | Selector specificity, then source order | Layer order first, specificity only within the same layer |
| Predictability at scale | Degrades — deeply nested overrides pile up | Stays predictable — priority is declared once, up front |
| Overriding 3rd-party CSS | Often needs \`!important\` or selector escalation | Put 3rd-party in an early layer; anything unlayered wins automatically |
| Where unlayered styles rank | N/A | Always highest priority, above every named layer |

## Subgrid — aligning nested grids to the parent's tracks

Subgrid is a separate feature that happens to pair well with any layout system built on Grid. The problem it solves: when a grid item is itself a grid container (a "nested grid"), that nested grid normally defines its own independent set of tracks — it has no awareness of the parent grid's column or row boundaries at all.

### The classic problem: cards with independently-heighted content

Picture a row of cards, each with an image, a title, and a description of varying length. If each card lays out its own internal content with its own grid, nothing forces the titles across all the cards to align at the same vertical position — a short description in one card lets its neighbor's content push up higher, breaking the visual rhythm of the row.

\`\`\`css
.card-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.card {
  display: grid;
  /* Without subgrid, this row sizing is local to each .card —
     it has no idea what row heights its siblings ended up with */
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
}
\`\`\`

This gets each card *internally* aligned (image, then flexible body, then footer), but the three cards in the row don't share row-track sizing with each other, because each card's \`grid-template-rows\` is a wholly separate grid. If one card's title wraps to two lines and another's doesn't, the description text below starts at different vertical positions across cards.

### The fix: grid-template-rows: subgrid

\`\`\`css
.card-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* Define explicit row tracks on the OUTER grid so there's
     something for children to subgrid into */
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
}

.card {
  display: grid;
  grid-row: span 3;
  /* Instead of defining its own rows, this card adopts the
     parent's row tracks directly */
  grid-template-rows: subgrid;
  gap: 0.5rem;
}
\`\`\`

With \`grid-template-rows: subgrid\`, the card no longer invents its own row sizing — it reaches up and uses the *parent's* row tracks, sized by the parent based on the tallest content across every card in the row. The card's own children (image, body, footer) are placed into those shared tracks, so row 1 (image) ends at the same vertical position in every card, row 2 (body) grows or shrinks per-card but starts and ends aligned with its siblings, and row 3 (footer) sits flush at the same baseline across the whole row — all without a single line of JavaScript measuring heights.

The same idea works on the column axis with \`grid-template-columns: subgrid\`, useful for things like a nested grid of form fields that needs its columns to line up with an outer form's label/input columns.

### Why this couldn't be done with regular nested grids

Before subgrid, the only ways to force this kind of cross-card alignment were: flattening the whole card row into one giant grid with no per-card grouping (losing the semantic/structural separation of "each card owns its own layout"), or measuring rendered heights with JavaScript and setting explicit pixel heights — fragile, and it re-runs on every resize and content change. Subgrid keeps each card as its own real grid container (clean, self-contained CSS) while still letting the browser handle cross-card alignment natively, because the row sizing genuinely comes from one shared source of truth: the parent grid.

One thing to watch: an item needs \`grid-row: span 3\` (or however many parent tracks it should cover) for \`subgrid\` to have enough tracks to subgrid *into* — a subgridded axis without a span wide enough simply won't have tracks to align to, and the nested grid falls back to acting like it has no tracks defined on that axis at all.

> **Key idea:** \`@layer\` adds an explicit priority axis to the cascade that's resolved before specificity — letting you guarantee, once and up front, that (say) utilities always beat components, and that unlayered CSS always wins as an escape hatch — while subgrid solves an unrelated but equally common problem: letting a nested grid item stop inventing its own track sizing and instead align to the parent grid's actual tracks, which is exactly what's needed to keep independently-heighted card content lined up across a row.`,
    },
  ],
}
