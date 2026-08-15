import type { Module } from "../types"

export const htmlModule2: Module = {
  id: 2,
  title: "Text & Content Basics",
  status: "upcoming",
  lessons: [
    {
      name: "Headings & Paragraphs",
      minutes: 8,
      intro: "Structuring text content with headings and paragraphs — the most-used elements in HTML.",
      content: `### Headings: h1 through h6

HTML gives you six levels of heading, from most to least important:

\`\`\`html
<h1>Page Title</h1>
<h2>Major Section</h2>
<h3>Subsection</h3>
<h4>Sub-subsection</h4>
<h5>Rarely used</h5>
<h6>Rarely used</h6>
\`\`\`

### One h1 per page

Convention (and accessibility guidance) is **exactly one \`<h1>\`** per page — it's the page's main title. Everything else nests logically underneath, like an outline:

\`\`\`html
<h1>Cooking Basics</h1>
  <h2>Knife Skills</h2>
    <h3>Holding the Knife</h3>
    <h3>The Rocking Chop</h3>
  <h2>Heat Control</h2>
\`\`\`

**Don't skip levels** to get a smaller font (e.g. jumping from \`<h2>\` to \`<h4>\`) — that's what CSS is for. Heading levels communicate document *structure* to screen readers, which let users jump between headings the way you'd skim a table of contents.

### Paragraphs

\`<p>\` is a block of text — the workhorse element for body copy:

\`\`\`html
<p>HTML gives every piece of content a role. A paragraph is just running text — no special meaning beyond "this is a block of prose."</p>
\`\`\`

A common mistake: using multiple \`<br>\` tags to fake paragraph spacing instead of separate \`<p>\` elements.

\`\`\`html
<!-- avoid -->
<p>First paragraph.<br><br>Second paragraph.</p>

<!-- correct -->
<p>First paragraph.</p>
<p>Second paragraph.</p>
\`\`\`

\`<br>\` means "line break within the same thought" (like an address or a poem line) — not "new paragraph."

> **Key idea:** headings form a document outline; use them for structure, not for font size. Paragraphs are for the actual prose.`,
    },
    {
      name: "Text Formatting & Emphasis",
      minutes: 9,
      intro: "Bold, italic, and the semantic elements that mean more than they look.",
      content: `### Bold and italic: two ways each

HTML has both a *visual* and a *semantic* way to bold or italicize text — they often look identical but mean different things.

\`\`\`html
<strong>Important text</strong>   <!-- semantic: this matters -->
<b>Bold text</b>                  <!-- visual only, no extra meaning -->

<em>Emphasized text</em>          <!-- semantic: stress/emphasis -->
<i>Italic text</i>                <!-- visual only, e.g. a term or name -->
\`\`\`

Screen readers change their tone of voice for \`<strong>\` and \`<em>\` — they carry real meaning. \`<b>\` and \`<i>\` are purely visual, appropriate for things like a keyword in a definition or a foreign-language phrase, where there's no added *emphasis*, just a different treatment.

> **Rule of thumb:** if bolding it changes the meaning of the sentence when read aloud, use \`<strong>\`. If it's just a style choice, \`<b>\` is fine — but honestly, reach for \`<strong>\`/\`<em>\` by default.

### Other useful inline elements

\`\`\`html
<mark>highlighted text</mark>          <!-- highlighter/search match -->
<small>fine print</small>              <!-- side comments, disclaimers -->
<del>deleted text</del>                <!-- struck through -->
<ins>inserted text</ins>               <!-- underlined -->
<sub>H<sub>2</sub>O</sub>              <!-- subscript -->
<sup>x<sup>2</sup></sup>              <!-- superscript -->
<abbr title="HyperText Markup Language">HTML</abbr>  <!-- hover for full term -->
<code>const x = 5;</code>              <!-- inline code -->
\`\`\`

\`<abbr>\` is worth calling out: the \`title\` attribute gives the full expansion, which shows as a tooltip and helps screen readers announce it correctly.

### Line breaks and horizontal rules

\`\`\`html
<p>123 Main St<br>Springfield, IL</p>

<hr>
\`\`\`

\`<br>\` forces a line break inside running text (addresses, poems). \`<hr>\` draws a horizontal rule that represents a *thematic break* — a shift in topic — not just a decorative line.

> **Key idea:** HTML separates "looks bold" from "is important." Reach for the semantic tag first; it benefits screen readers, SEO, and future-you skimming the source.`,
    },
    {
      name: "Lists",
      minutes: 9,
      intro: "Ordered, unordered, and description lists — three tools for grouped content.",
      content: `### Unordered lists

For items where order doesn't matter:

\`\`\`html
<ul>
  <li>Milk</li>
  <li>Eggs</li>
  <li>Bread</li>
</ul>
\`\`\`

Renders as bullet points. Every \`<li>\` must live inside a \`<ul>\` or \`<ol>\` — never on its own.

### Ordered lists

For sequences and rankings:

\`\`\`html
<ol>
  <li>Preheat the oven</li>
  <li>Mix the batter</li>
  <li>Bake for 25 minutes</li>
</ol>
\`\`\`

Renders as \`1. 2. 3.\` by default. You can customize the start number or direction:

\`\`\`html
<ol start="5">          <!-- starts counting at 5 -->
<ol reversed>            <!-- counts down -->
<ol type="A">             <!-- A, B, C instead of 1, 2, 3 -->
\`\`\`

### Nested lists

Lists can nest inside a list item to represent sub-items:

\`\`\`html
<ul>
  <li>Fruits
    <ul>
      <li>Apple</li>
      <li>Banana</li>
    </ul>
  </li>
  <li>Vegetables</li>
</ul>
\`\`\`

The inner \`<ul>\` goes *inside* the \`<li>\` it belongs to, not after it.

### Description lists

For term/definition pairs — glossaries, key-value data, metadata:

\`\`\`html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets</dd>
</dl>
\`\`\`

\`<dl>\` wraps the whole list, \`<dt>\` is the term, \`<dd>\` is its definition. A term can have multiple definitions, and vice versa.

> **Key idea:** pick the list type by meaning — \`<ol>\` when sequence matters, \`<ul>\` when it doesn't, \`<dl>\` for term/definition pairs. Don't fake a list with \`<br>\`-separated \`<p>\` tags — screen readers announce "list with 3 items" only for real list markup.`,
    },
    {
      name: "Block vs Inline & div/span",
      minutes: 8,
      intro: "The two fundamental display categories, and the two generic containers that hold anything.",
      content: `### Block vs inline

Every HTML element falls roughly into one of two display categories:

| | Block | Inline |
|---|---|---|
| Takes full width | Yes — starts on a new line | No — flows within text |
| Examples | \`<p>\` \`<h1>\` \`<ul>\` \`<div>\` | \`<a>\` \`<strong>\` \`<img>\` \`<span>\` |
| Can contain | Block and inline elements | Only inline elements (generally) |

\`\`\`html
<p>This is a block element.</p>
<p>It starts on its own new line.</p>

<span>This is inline.</span> <span>It flows right next to</span> other inline content.
\`\`\`

Block elements stack vertically like paragraphs in a document; inline elements sit within a line of text like a word does.

### div: the generic block container

\`<div>\` has **no semantic meaning** — it's a plain block-level box, used purely for grouping content so you can style or position it with CSS:

\`\`\`html
<div class="card">
  <h2>Product Name</h2>
  <p>Description text.</p>
</div>
\`\`\`

### span: the generic inline container

\`<span>\` is the inline equivalent — no meaning, just a hook for styling part of a line:

\`\`\`html
<p>The price is <span class="price">$29.99</span> today only.</p>
\`\`\`

### When to use them

Use \`<div>\`/\`<span>\` only when **no semantic element fits better**. A section of navigation should be \`<nav>\`, not \`<div class="nav">\`; a piece of emphasized text should be \`<em>\`, not \`<span class="italic">\`. You'll meet the full set of semantic elements in a later module — for now, know that \`<div>\`/\`<span>\` are the fallback, not the default.

> **Key idea:** block elements stack, inline elements flow. \`<div>\` and \`<span>\` are meaning-free containers — reach for a semantic tag first, and fall back to these only when nothing more specific applies.`,
    },
  ],
}
