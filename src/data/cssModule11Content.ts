import type { Module } from "../types"

export const cssModule11: Module = {
  id: 11,
  title: "Pseudo-classes & Pseudo-elements",
  status: "upcoming",
  lessons: [
    {
      name: "Structural & Interactive Pseudo-classes",
      minutes: 12,
      intro: "Master the pseudo-classes that react to user interaction and DOM position — from :hover to the an+b syntax of :nth-child().",
      content: `## What a pseudo-class actually is

A **pseudo-class** is a keyword added to a selector, prefixed with a single colon (\`:\`), that selects elements based on a *state* or *position* the browser tracks for you — something you can't express with a plain tag, class, or attribute selector. \`a:hover\` doesn't mean "an element with class hover," it means "an \`<a>\`, but only while the pointer is over it." No extra markup, no JavaScript, no class toggling required.

Pseudo-classes fall into a few natural families, and this lesson covers two of them: **interactive** pseudo-classes that respond to user action (\`:hover\`, \`:focus\`, \`:active\`), and **structural** pseudo-classes that match elements by their position in the document tree (\`:first-child\`, \`:nth-child()\`, and friends). A third family — form/state pseudo-classes like \`:checked\` and \`:invalid\` — gets its own lesson later in this module, and pseudo-*elements* (double colon, a different thing entirely) get the lesson after that.

## The interaction states: :hover, :active, :focus

These three map directly onto how a user physically engages with an element:

\`\`\`css
.button {
  background: #2563eb;
  color: white;
  transition: background-color 150ms ease, transform 100ms ease;
}

.button:hover {
  background: #1d4ed8;
}

.button:active {
  background: #1e40af;
  transform: translateY(1px);
}

.button:focus {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}
\`\`\`

- \`:hover\` matches while the pointer sits over the element. It's pointer-only — there's no true hover on a touchscreen, so never hide essential functionality behind hover alone.
- \`:active\` matches during the moment of activation: mouse button down (or finger down) on the element. It's typically the shortest-lived of the three, which is exactly why it's good for the "pressed" feedback of a button.
- \`:focus\` matches when the element has **keyboard focus** — the thing that would receive the next keystroke. Only focusable elements (links, form controls, buttons, or anything with \`tabindex\`) can match it.

A useful mental model: \`:hover\` is about the pointer's *position*, \`:active\` is about a *press in progress*, and \`:focus\` is about *which element is "listening"* — independent of the mouse entirely. A keyboard-only user tabbing through a form never triggers \`:hover\` or \`:active\` on anything, but hits \`:focus\` on every stop.

## :focus-visible — fixing the "everyone gets an outline" problem

For years, browsers drew the same focus ring for a link focused by \`Tab\` and a button focused by a mouse click, because both use \`:focus\`. That created a real dilemma for teams: keyboard users *need* a visible focus ring to know where they are, but a lot of designers removed it globally with \`outline: none\` because it looked ugly appearing on every mouse click — which broke keyboard navigation entirely for accessibility.

\`:focus-visible\` solves this by asking the browser to decide, using its own heuristics, whether a focus ring is likely to be *useful* right now. In practice: keyboard-driven focus (Tab, arrow keys, programmatic focus following a keyboard action) matches \`:focus-visible\`; a plain mouse click on a button generally does not, while a mouse click into a text input does (because you're about to type, and knowing where the cursor lives is useful regardless of input method).

\`\`\`css
/* Bad — removes focus indication for everyone, including keyboard users */
button:focus {
  outline: none;
}

/* Good — no visible ring for a mouse click, full ring for keyboard focus */
button:focus {
  outline: none;
}
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
\`\`\`

This pattern — suppress the default \`:focus\` outline, then re-add it scoped to \`:focus-visible\` — is now the standard, accessible way to build custom focus styles. It gives designers the clean mouse-click look they want without ever sacrificing keyboard usability. Never ship \`outline: none\` without a \`:focus-visible\` replacement; an invisible focus state is a genuine accessibility failure, not just a stylistic choice.

## :focus-within — styling a container because something inside it has focus

\`:focus-within\` matches an element if *it or any of its descendants* currently has focus. It's the tool for "highlight the whole form group when the user is typing in one of its fields":

\`\`\`css
.search-field {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.search-field:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15);
}
\`\`\`

\`\`\`html
<div class="search-field">
  <svg><!-- icon --></svg>
  <input type="text" placeholder="Search..." />
</div>
\`\`\`

The \`<input>\` receives actual keyboard focus, but the visual "focused" treatment applies to the whole wrapper \`<div>\` — something that used to require a JavaScript focus/blur listener toggling a class, now solved with one CSS rule.

## Structural pseudo-classes: position within the parent

Structural pseudo-classes match elements based on their index among sibling elements — no class, no JavaScript, purely positional.

\`\`\`css
li:first-child {
  font-weight: 700;
}

li:last-child {
  border-bottom: none;
}
\`\`\`

- \`:first-child\` — matches an element only if it's the first child of its parent.
- \`:last-child\` — matches an element only if it's the last child of its parent.
- \`:only-child\` — matches an element that is both the first *and* the last — i.e. an only child, with no sibling elements at all.

A subtlety worth internalizing: these match based on position among *all* sibling elements, not just siblings of the same tag. \`p:first-child\` only matches a \`<p>\` that is literally the first element inside its parent — if a \`<div>\` comes before it, the \`<p>\` is not \`:first-child\` no matter how many other paragraphs follow.

## The nth-child() family and the an+b syntax

\`:nth-child()\` is the generalized tool for "match the Nth element," and it accepts a formula in the form **an+b**, where \`n\` starts at \`0\` and counts up (0, 1, 2, 3, ...):

| Expression | Matches | Worked-out indices |
|---|---|---|
| \`:nth-child(1)\` | Just the first child | 1 |
| \`:nth-child(3)\` | Just the third child | 3 |
| \`:nth-child(odd)\` | Same as \`2n+1\` | 1, 3, 5, 7, ... |
| \`:nth-child(even)\` | Same as \`2n\` | 2, 4, 6, 8, ... |
| \`:nth-child(3n)\` | Every 3rd child | 3, 6, 9, 12, ... |
| \`:nth-child(3n+1)\` | Every 3rd child, starting at the 1st | 1, 4, 7, 10, ... |
| \`:nth-child(-n+3)\` | Only the first 3 children | 1, 2, 3 |
| \`:nth-child(n+4)\` | Everything from the 4th child onward | 4, 5, 6, ... |

To read a formula, plug in \`n = 0, 1, 2, 3...\` and see what index each one produces. For \`3n+1\`: when \`n=0\` you get \`1\`, when \`n=1\` you get \`4\`, when \`n=2\` you get \`7\` — every third element, offset by one. For \`-n+3\`, the coefficient is negative, so the sequence counts *down* from 3: \`n=0\` gives \`3\`, \`n=1\` gives \`2\`, \`n=2\` gives \`1\`, and every \`n\` after that produces a value at or below zero, which never matches an actual child — so in practice it only ever selects children 1 through 3.

A classic use — zebra-striping a table without adding a single class:

\`\`\`css
tbody tr:nth-child(odd) {
  background: #f9fafb;
}
\`\`\`

Or laying out a 4-column grid where every 4th item shouldn't get a right margin:

\`\`\`css
.grid-item {
  margin-right: 1rem;
}
.grid-item:nth-child(4n) {
  margin-right: 0;
}
\`\`\`

\`:nth-last-child()\` works identically but counts from the *end* of the sibling list instead of the start — \`:nth-last-child(1)\` is another way to write \`:last-child\`.

### :nth-of-type() — counting only same-tag siblings

\`:nth-child()\` counts *all* sibling elements regardless of tag. \`:nth-of-type()\` counts only siblings that share the same tag name as the matched element, which matters a lot when siblings are mixed:

\`\`\`html
<article>
  <h2>Title</h2>
  <p>First paragraph</p>
  <p>Second paragraph</p>
  <p>Third paragraph</p>
</article>
\`\`\`

\`\`\`css
/* Matches nothing — the first <p> is the SECOND child overall (after <h2>) */
p:nth-child(1) {
  color: red;
}

/* Matches the first paragraph — it's the 1st <p> among <p> siblings */
p:nth-of-type(1) {
  color: blue;
}
\`\`\`

Reach for \`:nth-of-type()\` whenever you're counting one specific tag inside a parent that also holds other tags; reach for \`:nth-child()\` when you're counting positions in a uniform list like \`<li>\` items in a \`<ul>\`.

## :not() — excluding matches

\`:not()\` takes a selector argument and matches any element that *doesn't* match it. It's most valuable for expressing "all of these except that one" without adding an exception class to every other element:

\`\`\`css
/* Every button except the primary one gets a border */
.button:not(.button--primary) {
  border: 1px solid #d1d5db;
}

/* Every input except checkboxes and radios gets full-width styling */
input:not([type="checkbox"]):not([type="radio"]) {
  width: 100%;
  padding: 0.5rem;
}

/* Add spacing between items, but not after the last one */
.list-item:not(:last-child) {
  margin-bottom: 1rem;
}
\`\`\`

That last example is one of the most common real-world uses of \`:not()\` — it replaces the older, fragile pattern of adding margin to every item and then separately zeroing it on the last one. Modern CSS also allows chaining multiple simple selectors inside a single \`:not()\` in current browsers (e.g. \`:not(.a, .b)\`), which reads even more cleanly than chaining several separate \`:not()\` calls.

## :first-of-type / :last-of-type

Just as \`:nth-of-type()\` is the "same tag only" version of \`:nth-child()\`, \`:first-of-type\` and \`:last-of-type\` are the "same tag only" versions of \`:first-child\` and \`:last-child\`:

\`\`\`css
/* Style the first heading inside an article, regardless of what precedes it */
article h2:first-of-type {
  margin-top: 0;
}
\`\`\`

Given \`<article><p>Intro</p><h2>Section</h2>...</article>\`, \`h2:first-child\` matches nothing (the \`<p>\` occupies the first-child slot), while \`h2:first-of-type\` correctly matches that \`<h2>\` because it's the first \`<h2>\` among its siblings, regardless of what other tags come before it.

## Quick reference

| Pseudo-class | Matches |
|---|---|
| \`:hover\` | Pointer is over the element |
| \`:active\` | Element is being pressed/activated |
| \`:focus\` | Element has keyboard focus |
| \`:focus-visible\` | Element has focus AND the browser judges a visible ring is useful |
| \`:focus-within\` | Element or a descendant has focus |
| \`:first-child\` / \`:last-child\` | First/last element among all siblings |
| \`:only-child\` | The only sibling element |
| \`:nth-child(an+b)\` | Nth element among all siblings, by formula |
| \`:nth-of-type(an+b)\` | Nth element among same-tag siblings |
| \`:not(selector)\` | Elements that don't match the given selector |
| \`:first-of-type\` / \`:last-of-type\` | First/last among same-tag siblings |

> **Key idea:** Interactive pseudo-classes react to user state (prefer \`:focus-visible\` over bare \`:focus\` for outlines, to avoid punishing mouse users while still protecting keyboard users), while structural pseudo-classes like \`:nth-child()\` let you style by position using the an+b formula — both eliminate whole categories of "add a class just to select this" JavaScript.`,
    },
    {
      name: "Pseudo-elements",
      minutes: 11,
      intro: "Learn ::before, ::after, and the other pseudo-elements that let you style a sub-part of an element that doesn't exist in the DOM.",
      content: `## Pseudo-class vs pseudo-element — the colon count matters

A **pseudo-element**, written with a **double colon** (\`::\`), doesn't match an existing element based on state or position — it lets you style (and in some cases generate) a specific **sub-part** of an element that has no tag of its own in the DOM. \`p::first-line\` doesn't mean "a \`<p>\` in some state," it means "the rendered first line of text inside this \`<p>\`" — a region the browser computes at layout time, which doesn't correspond to any real node you could \`querySelector\`.

The single-colon syntax (\`:hover\`, \`:first-child\`) is reserved for pseudo-*classes* from the last lesson. Older CSS (through CSS2) allowed \`:before\` and \`:after\` with a single colon, and browsers still accept that for backward compatibility — but modern code should always use the double-colon form for pseudo-elements, since that's the distinction CSS3 introduced on purpose:

| | Pseudo-class (\`:\`) | Pseudo-element (\`::\`) |
|---|---|---|
| Colons | One (\`:hover\`) | Two (\`::before\`) |
| What it targets | The whole element, in some state or position | A specific sub-part of the element, often not a real node |
| Examples | \`:hover\`, \`:checked\`, \`:nth-child()\` | \`::before\`, \`::first-line\`, \`::marker\` |
| Can it match multiple times per element? | No — one match per element | N/A — always exactly one location per pseudo-element type |
| Requires new content? | Never | \`::before\`/\`::after\` require \`content\` to render anything |

## ::before and ::after

\`::before\` and \`::after\` insert a generated, styleable "phantom" child at the start or end of an element's content — inside the element, before/after its real children. They are the single most useful pseudo-elements in CSS, and they share one hard rule: **they do nothing without a \`content\` property**, even if it's just an empty string.

\`\`\`css
.tag::before {
  content: "#";
  color: #9ca3af;
}
\`\`\`

\`\`\`html
<span class="tag">css</span>
<!-- renders as: #css -->
\`\`\`

Forgetting \`content\` is the single most common mistake with these — every other property (\`background\`, \`border\`, \`width\`) is silently ignored until \`content\` is present, even \`content: "";\`.

### Common use 1: icons and decorative marks

\`\`\`css
.external-link::after {
  content: " ↗";
  font-size: 0.8em;
  color: #6b7280;
}

.required-field::after {
  content: "*";
  color: #dc2626;
  margin-left: 0.25rem;
}
\`\`\`

### Common use 2: decorative shapes without extra markup

Because \`::before\`/\`::after\` are real boxes once given \`content: ""\`, they can be sized, positioned, and colored like any element — useful for decorative shapes that shouldn't clutter the HTML:

\`\`\`css
.quote {
  position: relative;
  padding-left: 1.5rem;
}

.quote::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2563eb;
  border-radius: 2px;
}
\`\`\`

### Common use 3: pure-CSS tooltips

\`\`\`css
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
}

.tooltip:hover::after {
  opacity: 1;
}
\`\`\`

\`\`\`html
<button class="tooltip" data-tooltip="Copy to clipboard">Copy</button>
\`\`\`

Note the \`content: attr(data-tooltip)\` — \`content\` can pull live text straight from an HTML attribute, not just static strings, which keeps the tooltip text in the markup where it belongs rather than duplicated in CSS.

### Common use 4: the clearfix, revisited

Before \`display: flex\` and modern layout, a float-based layout would collapse its container's height because floated children were removed from normal flow. The classic fix used \`::after\` to insert an invisible, block-level element that forces the container to account for the floats:

\`\`\`css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
\`\`\`

You'll rarely need this on new code — \`display: flex\`, \`display: grid\`, and \`display: flow-root\` all sidestep float-collapse entirely — but it's worth recognizing in legacy CSS, since it's one of the reasons \`::after\` became such a load-bearing pseudo-element historically, well before generated content became common for icons and tooltips.

## ::first-line and ::first-letter

These target the *rendered* first line or first character of a block-level element's content — recalculated automatically as the layout reflows (window resize, font change, etc.), which is exactly why they can't be done by wrapping text in a \`<span>\` by hand.

\`\`\`css
p::first-line {
  font-weight: 600;
  color: #111827;
}
\`\`\`

The classic **drop cap** effect, a print-design convention of an oversized initial letter:

\`\`\`css
.article p:first-of-type::first-letter {
  float: left;
  font-size: 3.5em;
  line-height: 0.8;
  font-weight: 700;
  padding-right: 0.1em;
  color: #2563eb;
}
\`\`\`

Combining \`:first-of-type\` (a pseudo-*class*, picking which \`<p>\`) with \`::first-letter\` (a pseudo-*element*, picking a piece of that \`<p>\`) shows how the two families compose — one narrows *which element*, the other narrows *which part of it*.

Only a limited set of properties apply to \`::first-line\` (font, color, background, and similar text-level properties — no box-model properties like \`width\`), since it doesn't correspond to a real box the way \`::first-letter\` roughly does.

## ::placeholder

Styles the placeholder text of an \`<input>\` or \`<textarea>\` — the greyed-out hint text shown before the user types anything:

\`\`\`css
input::placeholder {
  color: #9ca3af;
  font-style: italic;
  opacity: 1; /* Firefox applies a lower default opacity; this normalizes it */
}
\`\`\`

## ::selection

Styles the portion of text currently highlighted by the user (click-drag select, or Ctrl/Cmd+A). Only a small set of properties are allowed — \`color\`, \`background-color\`, \`text-shadow\`, and a few others:

\`\`\`css
::selection {
  background: #bfdbfe;
  color: #1e3a8a;
}
\`\`\`

A small brand touch that's easy to miss but noticeable when done: matching the highlight color to your palette instead of leaving the OS default blue.

## ::marker

Styles the marker box of a list item — the bullet of a \`<ul>\` or the number of an \`<ol>\`:

\`\`\`css
li::marker {
  color: #2563eb;
  font-weight: 700;
}

ol::marker {
  font-variant-numeric: tabular-nums;
}
\`\`\`

Before \`::marker\` shipped broadly, changing a bullet's color meant either setting \`color\` on the whole \`<li>\` (which recolored the text too) or abandoning native markers entirely with \`list-style: none\` plus a hand-rolled \`::before\` bullet. \`::marker\` targets just the marker box directly, though the set of properties it accepts is intentionally narrow — mostly \`color\`, \`content\`, and font/text properties, not full box-model control.

## Full pseudo-element reference

| Pseudo-element | Targets |
|---|---|
| \`::before\` | Generated content inserted before an element's real content |
| \`::after\` | Generated content inserted after an element's real content |
| \`::first-line\` | The rendered first line of a block's text |
| \`::first-letter\` | The rendered first character of a block's text |
| \`::placeholder\` | Placeholder text of a form field |
| \`::selection\` | User-highlighted text |
| \`::marker\` | The bullet/number of a list item |

> **Key idea:** Pseudo-elements (\`::\`) style a sub-part of an element that has no tag of its own — \`::before\`/\`::after\` require \`content\` to render at all and are the backbone of icon, tooltip, and decorative-shape tricks that avoid extra markup, while \`::first-line\`, \`::first-letter\`, \`::placeholder\`, \`::selection\`, and \`::marker\` each target one specific, browser-computed region.`,
    },
    {
      name: "Form & State Pseudo-classes",
      minutes: 12,
      intro: "Style form controls by their live state — checked, disabled, valid — and build a fully custom checkbox and validation pattern with zero JavaScript.",
      content: `## Why forms get their own pseudo-class family

Native form controls carry state that has nothing to do with pointer position or DOM structure — a checkbox is either checked or not, a field is either required or not, an input's value either satisfies its constraints or doesn't. CSS exposes all of this directly as pseudo-classes, which means a huge amount of form styling and validation feedback can be built with zero JavaScript.

## The core state pseudo-classes

\`\`\`css
input:checked {
  accent-color: #2563eb;
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input:enabled {
  cursor: pointer;
}
\`\`\`

- \`:checked\` — matches a checked checkbox, a checked/selected radio button, or a selected \`<option>\`.
- \`:disabled\` — matches any form control with the \`disabled\` attribute; it can't be focused or submitted.
- \`:enabled\` — the inverse of \`:disabled\`; matches any form control that *can* currently be interacted with.

\`\`\`css
input:required {
  border-left: 3px solid #dc2626;
}

input:optional {
  border-left: 3px solid transparent;
}
\`\`\`

- \`:required\` — matches a field with the \`required\` attribute.
- \`:optional\` — matches a field *without* \`required\` — useful for styling optional fields distinctly, or just as the natural complement to \`:required\` in a selector.

## Validity: :valid and :invalid

Every form control with constraints (\`type="email"\`, \`required\`, \`pattern\`, \`min\`/\`max\`, etc.) is continuously evaluated by the browser's built-in constraint validation, and \`:valid\`/\`:invalid\` reflect the result live, as the user types:

\`\`\`css
input:invalid {
  border-color: #dc2626;
}

input:valid {
  border-color: #16a34a;
}
\`\`\`

Used carelessly, though, this style fires the instant the page loads — an empty \`required\` field is invalid before the user has typed a single character, so the form appears to be yelling at them before they've done anything. The fix for that is later in this lesson.

## :placeholder-shown

Matches an input *only while its placeholder is currently visible* — which, practically, means the field is empty (a non-empty value hides the placeholder). This is the key building block for "don't show an error until the user has actually typed something":

\`\`\`css
input:placeholder-shown {
  border-color: #d1d5db;
}
\`\`\`

## :in-range and :out-of-range

For numeric/date inputs constrained with \`min\`/\`max\`, these reflect whether the current value falls inside that range:

\`\`\`css
input[type="number"]:out-of-range {
  border-color: #dc2626;
  background: #fef2f2;
}
\`\`\`

\`\`\`html
<input type="number" min="1" max="10" />
\`\`\`

Typing \`15\` into that field matches \`:out-of-range\` live, with no JavaScript involved — the browser is already tracking the constraint for its own native validation UI, and CSS just taps into that same state.

## Building a custom checkbox with :checked + a sibling combinator

Native checkboxes are notoriously hard to restyle directly — browsers restrict how far you can push \`appearance\` and box-model properties on the control itself. The standard workaround: keep the real \`<input type="checkbox">\` in the DOM for correct behavior and accessibility, visually hide it, and style a sibling element based on the input's \`:checked\` state.

\`\`\`html
<label class="custom-checkbox">
  <input type="checkbox" class="custom-checkbox__input" />
  <span class="custom-checkbox__box"></span>
  Subscribe to updates
</label>
\`\`\`

\`\`\`css
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Hide the native box visually, but keep it functional and focusable */
.custom-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.custom-checkbox__box {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #9ca3af;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms ease, border-color 150ms ease;
}

/* The core trick: style the sibling <span> based on the checkbox's state */
.custom-checkbox__input:checked + .custom-checkbox__box {
  background: #2563eb;
  border-color: #2563eb;
}

.custom-checkbox__input:checked + .custom-checkbox__box::after {
  content: "✓";
  color: white;
  font-size: 0.875rem;
  line-height: 1;
}

/* Don't forget keyboard focus on the hidden input */
.custom-checkbox__input:focus-visible + .custom-checkbox__box {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}
\`\`\`

Two things make this work together: the \`+\` **adjacent sibling combinator** only matches an element immediately following the one before it in markup — so \`.custom-checkbox__input:checked + .custom-checkbox__box\` reads as "the box, but only when the checkbox right before it is checked." And critically, the real \`<input>\` is hidden with clipping techniques (not \`display: none\`, which would remove it from keyboard tab order and screen reader access entirely) — so the control stays fully accessible while looking completely custom. This pattern generalizes to custom radio buttons and toggle switches with the same structure.

## A practical validation pattern: don't shout before they've typed

Combine \`:invalid\`, \`:valid\`, and \`:placeholder-shown\` (via \`:not()\`) to only show error styling once the user has interacted with a field and left it in an invalid state — never on first render:

\`\`\`html
<input type="email" required placeholder="you@example.com" />
\`\`\`

\`\`\`css
input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

/* Only flag red once the field has content AND that content is invalid */
input:invalid:not(:placeholder-shown) {
  border-color: #dc2626;
  background: #fef2f2;
}

/* Confirm success once the field has content AND is valid */
input:valid:not(:placeholder-shown) {
  border-color: #16a34a;
}
\`\`\`

Why this works: while the field is empty, the placeholder is showing, so \`:placeholder-shown\` matches and \`:not(:placeholder-shown)\` excludes it from both rules — no styling at all yet, even though an empty \`required\` field is technically \`:invalid\`. The instant the user types even one character, the placeholder disappears, \`:not(:placeholder-shown)\` starts matching, and the red or green state kicks in live as they type — reacting immediately rather than waiting for blur or submit. This is a widely used pattern precisely because it gets the UX right (no premature shaming) using only CSS.

It's worth pairing this visual feedback with real accessible error text (an associated element updated via \`aria-describedby\`, or the browser's native \`:invalid\` + \`reportValidity()\` messaging) — border color alone isn't enough information for users who can't perceive color, so treat this pattern as the polish layer on top of a properly labeled error, not a replacement for one.

## Quick reference

| Pseudo-class | Matches |
|---|---|
| \`:checked\` | A checked checkbox/radio or selected \`<option>\` |
| \`:disabled\` / \`:enabled\` | Form control that is/isn't disabled |
| \`:required\` / \`:optional\` | Field with/without the \`required\` attribute |
| \`:valid\` / \`:invalid\` | Field currently passing/failing its constraints |
| \`:placeholder-shown\` | Field is empty enough for its placeholder to show |
| \`:in-range\` / \`:out-of-range\` | Numeric/date value inside or outside \`min\`/\`max\` |

> **Key idea:** Form pseudo-classes turn native, browser-tracked field state — checked, disabled, valid, empty — into styling hooks with zero JavaScript; combining \`:invalid\` or \`:valid\` with \`:not(:placeholder-shown)\` is the standard way to give live validation feedback without shaming the user before they've typed anything.`,
    },
  ],
}
