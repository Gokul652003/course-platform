import type { Module } from "../types"

export const cssModule1: Module = {
  id: 1,
  title: "CSS Foundations",
  status: "in_progress",
  lessons: [
    {
      name: "How CSS Works & How to Add It",
      minutes: 10,
      intro: "Learn the anatomy of a CSS rule, the three ways to attach CSS to a page, and how the browser turns HTML and CSS into pixels.",
      content: `## What CSS actually is

**CSS** (Cascading Style Sheets) is a language for describing how HTML elements should *look* and where they should *sit* on the page. HTML gives a document structure and meaning — this is a heading, this is a paragraph, this is a list. CSS takes that structure and gives it a visual presentation: colors, spacing, typography, layout, even motion. Neither language does the other's job well, and modern web development keeps them deliberately separate — a principle usually called **separation of concerns**.

## Anatomy of a CSS rule

Every CSS **rule** (sometimes called a rule set) has exactly the same shape: a **selector**, followed by a **declaration block** wrapped in curly braces.

\`\`\`css
h1 {
  color: navy;
  font-size: 2rem;
}
\`\`\`

Breaking that down piece by piece:

- \`h1\` is the **selector** — it says *which* elements this rule applies to. Here, every \`<h1>\` element on the page.
- \`{ ... }\` is the **declaration block** — everything between the opening and closing curly braces.
- \`color: navy;\` and \`font-size: 2rem;\` are each a **declaration** — one property/value pair, ending in a semicolon.
- \`color\` and \`font-size\` are **properties** — the specific visual aspect being controlled.
- \`navy\` and \`2rem\` are **values** — the setting applied to that property.
- The colon \`:\` separates a property from its value. The semicolon \`;\` ends a declaration and separates it from the next one.

A single rule can (and usually does) carry many declarations. Technically the semicolon after the *last* declaration in a block is optional — the closing \`}\` also terminates it — but leaving it off is a common source of bugs when you add a new declaration afterward and forget to add the missing semicolon first. Always include the trailing semicolon.

\`\`\`css
.card {
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
\`\`\`

Whitespace (spaces, tabs, newlines) between tokens is not meaningful to CSS the way it is in some languages — the browser doesn't care whether a rule is on one line or spread across ten. Formatting like the examples above exists purely for humans, and is worth keeping consistent for readability.

## Three ways to add CSS to a page

There are exactly three mechanisms for attaching CSS to HTML: **inline styles**, an **internal stylesheet**, and an **external stylesheet**. All three ultimately produce the same rendering engine behavior — they just differ in *where the rules live* and how reusable they are.

### 1. Inline styles

The \`style\` attribute lets you write declarations directly on a single HTML element, with no selector at all (the "selector" is implicitly just that one element):

\`\`\`html
<p style="color: red; font-weight: bold;">Payment failed. Please try again.</p>
\`\`\`

Inline styles apply only to the exact element they're written on — they can't be reused anywhere else, and they mix presentation directly into your markup, which HTML/CSS separation of concerns generally tries to avoid. They also carry very high priority in the cascade (covered in a later lesson), which makes them hard to override later from a stylesheet. In practice, inline styles are mostly reserved for values computed dynamically at runtime by JavaScript — for example, setting an exact pixel width calculated from a chart library — rather than for styling written by hand.

### 2. Internal (embedded) stylesheet

A \`<style>\` element, usually placed in the \`<head>\`, holds a block of ordinary CSS rules that apply to the whole document they're embedded in:

\`\`\`html
<head>
  <style>
    p {
      color: red;
    }
    .highlight {
      background-color: yellow;
    }
  </style>
</head>
\`\`\`

This keeps CSS out of individual tags, but it still lives inside one specific HTML file — it can't be shared with any other page. Internal stylesheets show up most often in single-file demos, HTML emails (where external stylesheets are frequently stripped by email clients for security reasons), and quick prototypes where creating a separate file isn't worth the overhead yet.

### 3. External stylesheet

An external stylesheet is a separate \`.css\` file, linked into an HTML document with a \`<link>\` element:

\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

\`\`\`css
/* styles.css */
p {
  color: red;
}
.highlight {
  background-color: yellow;
}
\`\`\`

This is how virtually every real project ships CSS. One \`styles.css\` file can be linked from every page in a site, so writing a rule once styles every page that references it.

There's also an in-CSS way to pull one stylesheet into another, using \`@import\`:

\`\`\`css
@import url("reset.css");
@import "typography.css";
\`\`\`

\`@import\` is convenient for splitting CSS into logical files without adding more \`<link>\` tags to your HTML, but it has a real performance cost worth knowing about: a browser cannot fetch an \`@import\`-ed file until it has already downloaded and started parsing the stylesheet that imports it, so imports chain up sequentially rather than downloading in parallel. Multiple \`<link>\` tags, by contrast, can all be requested by the browser at the same time. For that reason, \`@import\` in raw CSS is best reserved for small projects, and is more commonly seen today as a *build-time* feature of CSS preprocessors and bundlers, where it gets resolved and merged into a single file before it ever reaches the browser.

### Why external stylesheets are usually preferred

| Approach | Reusable across pages? | Browser-cached? | Keeps HTML clean? | Best for |
|---|---|---|---|---|
| Inline (\`style="..."\`) | No — one element only | Never | No — styling mixed into markup | Dynamic, JS-computed one-off values |
| Internal (\`<style>\`) | No — one document only | Not separately (ships with the HTML) | Mostly | Single-page demos, HTML email |
| External (\`.css\` file + \`<link>\`) | Yes — any page can link it | Yes, independently of the HTML | Yes | Real projects, production sites |

Caching is the underrated advantage here: once a browser has downloaded \`styles.css\` for one page, it can reuse the cached copy on every other page that links the same file, without downloading it again. Inline and internal CSS get no such benefit — they're re-parsed with every single page load because they're never treated as an independent, cacheable resource.

## How the browser turns HTML + CSS into pixels

It's worth having a mental model of what happens between "the browser receives some files" and "you see a styled page," even without digging into browser-internals-level detail.

1. **Parsing HTML into the DOM.** As the browser downloads HTML, it parses it top to bottom and builds the **DOM** (Document Object Model) — a tree of nodes representing every element, in the nested structure your HTML describes.
2. **Parsing CSS into the CSSOM.** In parallel (or as CSS is discovered — inline, internal, or via a \`<link>\`), the browser parses all of it into the **CSSOM** (CSS Object Model) — a separate tree of style rules and their computed relationships. This step includes resolving the cascade: for every property on every node, figuring out which declaration ultimately wins.
3. **Combining into a render tree.** The browser merges the DOM and the CSSOM into a **render tree**: essentially the DOM, but with every node's final computed styles attached, and with nodes that shouldn't be visually rendered at all (elements styled with \`display: none\`, or non-visual elements like \`<head>\` and \`<script>\`) excluded entirely.
4. **Layout (reflow).** The browser walks the render tree and calculates the exact size and position of every remaining node on the page — a process often called layout, or reflow when it happens again after something changes.
5. **Paint.** The browser fills in actual pixels for each node — background colors, text, borders, shadows, images — based on the layout it just computed.
6. **Composite.** Finally, painted layers are combined onto the screen in the correct stacking order. Certain properties (\`transform\` and \`opacity\` in particular) can be handled at this compositing stage without re-running layout or paint, which is a big part of why animating them tends to be far smoother than animating properties like \`width\` or \`top\`.

The detail worth internalizing from this pipeline: **the CSSOM has to be fully built before the render tree can be produced**, and nothing paints until the render tree exists. This is why CSS is described as **render-blocking** — a browser deliberately won't show anything until it knows how that content should look, to avoid a flash of unstyled content. It's also the practical reason performance advice pushes CSS to load as early and as small as possible: an external stylesheet linked in \`<head>\` lets the browser start that CSSOM-building download immediately, in parallel with the rest of HTML parsing, rather than waiting.

## Comments in CSS

CSS comments use \`/* ... */\` — there is no single-line \`//\` comment syntax in plain CSS, unlike JavaScript or preprocessors such as Sass.

\`\`\`css
/* This entire block styles the primary navigation */
nav {
  display: flex;
  gap: 1rem; /* space between nav links */
}

/* TODO: revisit this color once the design system ships */
.badge {
  background-color: #f43f5e;
}
\`\`\`

Comments are stripped out before CSS is applied — they have zero effect on rendering. In larger stylesheets, comments are commonly used to divide the file into labeled sections (\`/* ==== Header ==== */\`, \`/* ==== Forms ==== */\`) purely to help humans navigate, since CSS itself has no concept of sections or namespaces.

> **Key idea:** A CSS rule is a selector plus a declaration block of property/value pairs; you can attach that CSS inline, internally, or externally, but external stylesheets win on reusability and caching for anything beyond a quick demo — and none of it renders until the browser has built a CSSOM from your CSS and merged it with the DOM into a render tree.`,
    },
    {
      name: "Selectors",
      minutes: 11,
      intro: "Target the right elements: type, class, and ID selectors, attribute matching, the four combinators, and grouping selectors together.",
      content: `## Type (element) selectors

A **type selector** — also called an element selector — matches every instance of a given HTML tag on the page:

\`\`\`css
p {
  line-height: 1.6;
}

h1 {
  font-weight: 800;
}
\`\`\`

This rule applies to every \`<p>\` and every \`<h1>\` in the document, with no exceptions and no way to opt individual elements out short of overriding the rule elsewhere. Type selectors are the right tool when you're styling something based on its semantic role across the entire page — every link should look like a link, every \`<blockquote>\` should have the same treatment — not for one-off, purpose-specific styling.

## The universal selector

The **universal selector**, written \`*\`, matches literally every element:

\`\`\`css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
\`\`\`

This exact pattern — a \`box-sizing\` and margin/padding reset applied to \`*\` — is extremely common at the top of a stylesheet, because browsers ship inconsistent default spacing on things like \`<h1>\`, \`<ul>\`, and \`<body>\`, and \`content-box\` sizing (the default) makes width math annoying once padding and borders are involved. Because \`*\` touches every single element, use it sparingly — broad, low-cost resets are a good fit; anything more opinionated belongs on a narrower selector.

## Class selectors

A **class selector**, prefixed with a dot (\`.\`), matches any element carrying that class in its \`class\` attribute:

\`\`\`css
.card {
  border-radius: 8px;
  padding: 1.5rem;
}
\`\`\`

\`\`\`html
<div class="card">...</div>
\`\`\`

An element can carry multiple classes, space-separated, and each one is matched independently:

\`\`\`html
<div class="card card--featured">...</div>
\`\`\`

\`\`\`css
.card { border-radius: 8px; }
.card--featured { border: 2px solid gold; }
\`\`\`

Classes are, by far, the most-used selector in real-world CSS. Unlike a type selector, a class only applies to elements you've explicitly opted in, and unlike an ID (next), a class can be reused on any number of elements. That combination — precise, reusable, unlimited — is why classes are the default choice for styling components, cards, buttons, and anything else meant to appear more than once.

## ID selectors

An **ID selector**, prefixed with a hash (\`#\`), matches the single element carrying a matching \`id\` attribute:

\`\`\`css
#site-header {
  position: sticky;
  top: 0;
}
\`\`\`

\`\`\`html
<header id="site-header">...</header>
\`\`\`

HTML rules say an \`id\` should be unique within a page — CSS doesn't enforce that, but relying on an ID assumes it holds. In practice, IDs are more useful for two other jobs: being a target for in-page fragment links (\`href="#site-header"\`) and being a stable hook for JavaScript (\`document.getElementById(...)\`) — than for CSS styling. The reason is specificity, covered fully in the next lesson: an ID selector outranks basically any class-based override, which makes styles attached to an ID unusually hard to adjust or override later from anywhere else. Most style guides recommend reaching for a class first, and reserving IDs for non-styling purposes.

## Attribute selectors

**Attribute selectors** match elements based on the presence or content of an HTML attribute, using square brackets:

\`\`\`css
[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

input[type="email"] {
  border-color: #94a3b8;
}
\`\`\`

Beyond exact and presence matching, CSS supports several **substring-matching** operators borrowed from regular-expression-like thinking, which are especially useful for matching URL patterns or naming conventions without needing an extra class:

\`\`\`css
a[href^="https://"] {
  /* href starts with https:// — likely an external/secure link */
}

a[href$=".pdf"] {
  /* href ends with .pdf */
}

[class*="btn"] {
  /* class attribute contains "btn" anywhere in the string */
}
\`\`\`

| Selector | Matches | Example |
|---|---|---|
| \`[attr]\` | Element has the attribute at all, any value | \`[disabled]\` |
| \`[attr="val"]\` | Attribute value is exactly \`val\` | \`[type="text"]\` |
| \`[attr^="val"]\` | Value **starts with** \`val\` | \`[href^="https"]\` |
| \`[attr$="val"]\` | Value **ends with** \`val\` | \`[href$=".pdf"]\` |
| \`[attr*="val"]\` | Value **contains** \`val\` anywhere | \`[class*="btn"]\` |
| \`[attr~="val"]\` | Value is one word in a space-separated list | \`[class~="active"]\` |
| \`[attr\\|="val"]\` | Value equals \`val\`, or starts with \`val\` followed by a hyphen | \`[lang\\|="en"]\` (matches \`en\` and \`en-US\`) |

Attribute selectors shine on form elements (\`input[required]\`, \`input[type="checkbox"]\`) and on styling based on existing markup conventions without adding classes purely for styling hooks.

## Combinators

A **combinator** describes a *relationship* between two selectors, letting you target an element based on where it sits relative to another one.

### Descendant combinator (space)

The simplest and most common combinator is just a space — it matches any element nested **anywhere** inside another, no matter how deep:

\`\`\`css
article p {
  margin-bottom: 1em;
}
\`\`\`

This matches every \`<p>\` inside an \`<article>\`, whether it's a direct child or nested three levels deeper inside other elements.

### Child combinator (\`>\`)

The child combinator restricts the match to **direct children only**:

\`\`\`css
ul > li {
  list-style: square;
}
\`\`\`

If a \`<li>\` is nested inside a \`<div>\` that's inside the \`<ul>\`, this rule will *not* match it — only \`<li>\` elements that are immediate children of the \`<ul>\` qualify. This is the right tool whenever the descendant combinator's "anywhere inside" reach is too loose and risks matching nested structures you didn't intend to style.

### Adjacent sibling combinator (\`+\`)

The adjacent sibling combinator matches an element that comes **immediately after** another, sharing the same parent, with nothing in between:

\`\`\`css
h2 + p {
  margin-top: 0;
}
\`\`\`

This matches a \`<p>\` only when it directly follows an \`<h2>\` with no other element between them — useful for "the first paragraph right after a heading" style spacing rules.

### General sibling combinator (\`~\`)

The general sibling combinator is the looser cousin of \`+\`: it matches any element that comes after another, sharing the same parent, at any distance — not just immediately next:

\`\`\`css
h2 ~ p {
  color: #475569;
}
\`\`\`

Every \`<p>\` that appears anywhere after the \`<h2>\` among its siblings matches, even with other elements between them, as long as they share the same parent and the \`<p>\` comes later in the source.

### Grouping selectors with commas

A comma lets a single declaration block apply to multiple, otherwise unrelated selectors at once:

\`\`\`css
h1, h2, h3 {
  font-family: "Georgia", serif;
  color: #1e293b;
}
\`\`\`

This is exactly equivalent to writing the same declarations three separate times, once per heading level — grouping just avoids the repetition. Each selector in the comma-separated list is evaluated completely independently; they don't combine into some single compound relationship the way combinators do.

## Choosing a selector: quick reference

| Selector type | Reach for it when |
|---|---|
| Type/element (\`p\`) | Styling native semantics broadly — every link, every paragraph |
| Universal (\`*\`) | Global resets, box-sizing normalization |
| Class (\`.card\`) | The default choice — reusable, purpose-built component/element styling |
| ID (\`#header\`) | JS hooks, fragment-link anchors — rarely for styling |
| Attribute (\`[type="email"]\`) | Styling by existing state/attribute without adding a class |
| Descendant (\`article p\`) | Loose "somewhere inside" relationships |
| Child (\`ul > li\`) | Tight, structural, one-level-only relationships |
| Adjacent sibling (\`h2 + p\`) | "The element immediately following this one" |
| General sibling (\`h2 ~ p\`) | "Any later sibling," regardless of exact position |
| Grouping (\`h1, h2\`) | Sharing identical declarations across unrelated selectors |

One category deliberately left out here is **pseudo-classes** and **pseudo-elements** (things like \`:hover\`, \`:nth-child()\`, and \`::before\`) — they're selectors too, but they get a full module of their own later in this course rather than a passing mention here.

> **Key idea:** Selectors are how you aim CSS — classes should be your default reach, IDs and type selectors are for narrower jobs, attribute selectors let you match on existing markup instead of adding classes just for styling, and combinators (\`space\`, \`>\`, \`+\`, \`~\`) let you target elements by their relationship to each other rather than in isolation.`,
    },
    {
      name: "The Cascade, Specificity & Inheritance",
      minutes: 12,
      intro: "Understand how the browser resolves conflicting CSS rules, how to calculate specificity by hand, and which properties inherit down the tree by default.",
      content: `## The problem the cascade solves

In any real stylesheet, more than one rule can target the same element at the same time. A \`<p class="intro">\` might be matched by a type selector (\`p\`), a class selector (\`.intro\`), and a descendant selector (\`article p\`) all at once — possibly with conflicting values for the same property. The **cascade** is the deterministic algorithm the browser uses to decide, for every property on every element, which single declaration actually wins. "Cascading" is even in the language's name for exactly this reason.

The cascade resolves conflicts by checking, in order:

1. **Origin and importance** — where the rule came from, and whether it's marked \`!important\`.
2. **Specificity** — how precisely the selector targets the element.
3. **Source order** — which rule appears later, when everything above is tied.

Each step only gets consulted if the previous one ends in a tie. Origin is checked first; if two competing declarations come from different origins, specificity and source order never even get compared.

## Origin

CSS declarations can come from a few different places, roughly in this order of precedence (lowest to highest, ignoring \`!important\` for a moment):

1. **User-agent stylesheet** — the browser's own built-in defaults (why an unstyled \`<button>\` looks like a button at all).
2. **User styles** — CSS a person applies themselves, e.g. through browser accessibility settings or extensions. Rare, but takes precedence over the page's own normal styles.
3. **Author styles** — the CSS you write and ship with the page. This is virtually all of what this course covers.

Then \`!important\` versions of each of those origins get layered on top, in *reverse* order of precedence — an \`!important\` author declaration beats a normal user declaration, but a \`!important\` user declaration still beats an \`!important\` author declaration. In everyday development, you can usually simplify this whole hierarchy to: **browser defaults lose to your CSS, and your CSS loses to your own \`!important\` CSS** — the user-origin tiers rarely come into play unless someone is deliberately overriding your site via a browser extension.

## Specificity

When two competing declarations are in the same origin tier, the browser compares **specificity** — a score describing how precisely each selector targets the element. Specificity is best thought of as an ordered triple of counts, compared column by column, left to right, like a version number rather than a single summed total:

| Column | Counts |
|---|---|
| 1st | ID selectors (\`#header\`) |
| 2nd | Class selectors, attribute selectors, and pseudo-classes (\`.card\`, \`[type="text"]\`, \`:hover\`) |
| 3rd | Type selectors and pseudo-elements (\`p\`, \`::before\`) |

Crucially, combinators (\`>\`, \`+\`, \`~\`, and the descendant space) and the grouping comma add **zero** specificity themselves — only the actual selectors on either side of them count.

### Worked examples

\`\`\`css
p { color: black; }                /* (0, 0, 1) — one type selector */
.intro { color: blue; }            /* (0, 1, 0) — one class selector */
#hero p { color: green; }          /* (1, 0, 1) — one ID, one type */
p.intro.featured { color: red; }   /* (0, 2, 1) — one type, two classes */
\`\`\`

If \`#hero p\` and \`p.intro.featured\` both matched the same element, \`#hero p\` — scoring \`(1, 0, 1)\` — wins over \`p.intro.featured\` at \`(0, 2, 1)\`, purely because it's the *first column* that's compared first: 1 beats 0 regardless of anything in the columns after it. A single ID always outranks any number of classes; a single class always outranks any number of type selectors.

A few more reference points worth memorizing:

\`\`\`css
.card .title { }        /* (0, 2, 0) — two classes */
nav ul li a { }         /* (0, 0, 4) — four type selectors */
.nav-list a:hover { }   /* (0, 2, 1) — one class, one pseudo-class, one type */
\`\`\`

Inline styles (\`style="color: red;"\` written directly on an element) outrank every selector-based rule, regardless of how many IDs it has — they're sometimes described as sitting in an implicit fourth, highest column ahead of IDs. \`!important\` is a separate mechanism layered on top of all of this, covered next — it doesn't participate in the specificity calculation at all; it short-circuits it.

## Source order

When specificity is exactly tied, the tiebreaker is simple: **whichever rule was declared later wins.** "Later" means later in cascade order — later in the same file, or in a file linked after another.

\`\`\`css
.btn {
  color: blue;
}

.btn {
  color: green; /* wins — identical specificity, declared second */
}
\`\`\`

This is exactly why the order of \`<link>\` tags in \`<head>\`, and the order of rules within a single file, is never purely cosmetic — reordering two equally-specific rules can silently flip which one wins.

## \`!important\` — and why to avoid it

Appending \`!important\` to a declaration forces it to win, overriding the normal specificity comparison entirely (within its origin tier):

\`\`\`css
p {
  color: red !important;
}
\`\`\`

This declaration will beat *any* competing non-\`!important\` rule for \`color\` on a matched \`<p>\`, no matter how specific that other selector is. It looks like a convenient escape hatch the first time a style "just won't apply," which is exactly why it's so tempting — and exactly why it causes long-term pain:

- It breaks the normal, predictable cascade — a reader can no longer tell which rule wins just by comparing selectors.
- It starts an arms race: the only way to override an \`!important\` declaration later is with *another* \`!important\` declaration (of equal or higher origin/order), and those compound over a codebase's lifetime.
- It usually signals that a specificity problem was patched over by force, rather than fixed at its source — often the real fix is simplifying an overly specific selector elsewhere, not adding \`!important\` here.

The rare legitimate uses tend to be narrow and deliberate: certain utility-class systems mark their utilities \`!important\` on purpose so a single override class reliably wins regardless of context, or you need to override third-party CSS you have no ability to edit directly. As a default habit, treat \`!important\` as a last resort, not a first attempt.

## Inheritance

Separately from the cascade, some CSS properties **inherit** automatically: if you set them on a parent element, every descendant picks up that same computed value without the property being repeated anywhere. Other properties **don't inherit** — every element gets that property's normal default unless something explicitly sets it.

The pattern isn't arbitrary: text-related properties tend to inherit, because it's almost always what you want — set \`font-family\` once on \`<body>\` and every heading, paragraph, and button label inherits it. Box-model and layout properties don't inherit, because the opposite would be unworkable — if \`border\` or \`width\` inherited by default, setting either on any container would draw a border, or force a width, on every single element nested inside it.

| Property | Inherits by default? |
|---|---|
| \`color\` | Yes |
| \`font-family\` | Yes |
| \`font-size\` | Yes |
| \`line-height\` | Yes |
| \`text-align\` | Yes |
| \`letter-spacing\` | Yes |
| \`visibility\` | Yes |
| \`list-style\` | Yes |
| \`margin\` | No |
| \`padding\` | No |
| \`border\` | No |
| \`width\` / \`height\` | No |
| \`background\` | No |
| \`display\` | No |

When in doubt about a specific property, this is genuinely something to look up rather than guess — but the rough rule of thumb ("typography-adjacent properties inherit, box/layout properties don't") covers the large majority of everyday cases.

### Controlling inheritance explicitly

Four keywords let you override the default inheritance behavior on any property:

- **\`inherit\`** — forces this property to take its parent's computed value, even on properties that don't normally inherit.
- **\`initial\`** — resets the property to its CSS-specification-defined default value, ignoring both the cascade and inheritance entirely.
- **\`unset\`** — acts like \`inherit\` for properties that naturally inherit, and like \`initial\` for properties that don't. Effectively: "behave as if no author CSS touched this property at all."
- **\`revert\`** — resets the property back to what the *user-agent stylesheet* (or user styles) would have set, rolling back only the author CSS layer. This is the one to reach for when you want to undo your own override on a native element while keeping the browser's built-in behavior — for example, restoring a \`<button>\`'s native focus outline after some earlier rule stripped it.

\`\`\`css
button {
  all: unset; /* strip essentially every default, common trick when fully re-skinning a native control */
}

.card {
  border: 3px solid red;
}

.card.no-border {
  border: initial; /* back to CSS's spec default for border, i.e. none */
}
\`\`\`

The \`all\` property deserves a special mention: it isn't a real visual property, it's a shorthand that applies whichever keyword you give it (\`inherit\`, \`initial\`, \`unset\`, or \`revert\`) to *every* property at once — \`all: unset\` is the standard trick for stripping a native \`<button>\` or \`<input>\` down to a blank slate before restyling it from scratch.

> **Key idea:** The cascade resolves competing declarations by origin/importance first, specificity second, and source order last — specificity itself is an ID/class/type triple compared column by column, not summed — while inheritance is a separate mechanism that only a subset of (mostly typography) properties use by default, with \`inherit\`/\`initial\`/\`unset\`/\`revert\` available to override that behavior explicitly on any property.`,
    },
  ],
}
