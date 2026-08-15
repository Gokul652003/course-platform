import type { Module } from "../types"

export const htmlModule9: Module = {
  id: 9,
  title: "Advanced HTML",
  status: "upcoming",
  lessons: [
    {
      name: "iframe, embed & object",
      minutes: 8,
      intro: "Three different ways to embed foreign content, and when to reach for each.",
      content: `### iframe: embedding another HTML document

Covered briefly in the media module — worth a closer look here as part of the embedding family:

\`\`\`html
<iframe src="https://www.youtube.com/embed/xyz" title="Product demo video" width="560" height="315"></iframe>
\`\`\`

Use \`<iframe>\` for embedding another *page* — video players, maps, third-party widgets, ads. It's the most common of the three by far.

### embed: for plugin content

\`\`\`html
<embed src="animation.swf" width="400" height="300">
\`\`\`

Originally designed for browser plugin content (Flash, Java applets). Flash is dead and applets are gone, so \`<embed>\` sees little modern use — it occasionally appears for embedding a PDF viewer:

\`\`\`html
<embed src="document.pdf" type="application/pdf" width="100%" height="600">
\`\`\`

### object: the generic embed

\`\`\`html
<object data="document.pdf" type="application/pdf" width="100%" height="600">
  <p>PDF cannot be displayed. <a href="document.pdf">Download it instead</a>.</p>
</object>
\`\`\`

\`<object>\` is the most flexible of the three — it can embed PDFs, other HTML pages, or even SVG images — and, unlike \`<embed>\`, it supports fallback content between the opening and closing tags for when the embed fails.

### object for SVG

\`\`\`html
<object data="icon.svg" type="image/svg+xml"></object>
\`\`\`

An alternative to \`<img src="icon.svg">\` when you need the SVG's *internal* elements to be scriptable or stylable from the parent page (an \`<img>\`-embedded SVG is opaque; an \`<object>\`- or inline-embedded one is not).

### Practical guidance

In practice, reach for \`<iframe>\` for embedding other pages/widgets, and a plain \`<img>\` for SVG images unless you specifically need to script into it. \`<embed>\`/\`<object>\` mostly show up for PDF embedding today — everything else they were built for has moved on.

> **Key idea:** \`<iframe>\` for embedding another page, \`<object>\` when you need fallback content or scriptable SVG, \`<embed>\` mostly legacy. When in doubt, \`<iframe>\` is almost always the right choice for modern embedding.`,
    },
    {
      name: "Data Attributes",
      minutes: 7,
      intro: "Attaching custom data to HTML elements that JavaScript and CSS can read.",
      content: `### The data-* pattern

Any attribute prefixed with \`data-\` is valid HTML, and is a sanctioned place to stash custom data on an element:

\`\`\`html
<button data-user-id="482" data-role="admin">Edit User</button>

<li data-status="completed" data-priority="high">Ship the release</li>
\`\`\`

The browser ignores these for rendering purposes — they exist purely as a data channel between your HTML and your JavaScript/CSS.

### Reading data attributes in JavaScript

\`\`\`html
<button id="edit-btn" data-user-id="482">Edit User</button>

<script>
  const btn = document.getElementById("edit-btn");
  console.log(btn.dataset.userId); // "482"
</script>
\`\`\`

The \`dataset\` API automatically converts \`data-user-id\` to camelCase \`userId\` — a naming convention worth knowing so the two sides match up.

### Styling based on data attributes in CSS

\`\`\`html
<li data-status="completed">Task one</li>
<li data-status="pending">Task two</li>
\`\`\`

\`\`\`css
li[data-status="completed"] {
  text-decoration: line-through;
  color: gray;
}
\`\`\`

CSS attribute selectors can target elements by their \`data-*\` value directly — no extra class needed.

### When to use data-* vs a class

- **Class** — for styling hooks and grouping ("this is a card," "this is active").
- **data-\\*** — for actual *values* attached to an element ("this row represents user 482," "this task's priority is high").

Don't stuff meaningful state into class names like \`class="user-482"\` — that's what \`data-*\` exists for, and it keeps classes purely about styling.

> **Key idea:** \`data-*\` attributes are the sanctioned bridge between markup and script — any custom name works, and JavaScript reads them all through the uniform \`element.dataset\` API.`,
    },
    {
      name: "details/summary & dialog",
      minutes: 9,
      intro: "Native collapsible content and modal dialogs — no JavaScript required for the basics.",
      content: `### details & summary: a native accordion

\`\`\`html
<details>
  <summary>What is HTML?</summary>
  <p>HTML is the standard markup language for creating web pages.</p>
</details>
\`\`\`

Renders as a collapsed disclosure triangle — click \`<summary>\` (always the *first* child) to reveal the rest of the content inside \`<details>\`. Fully keyboard-accessible and screen-reader-friendly, with zero JavaScript or CSS required.

### Starting open

\`\`\`html
<details open>
  <summary>Already expanded</summary>
  <p>This content is visible by default.</p>
</details>
\`\`\`

### A real use case: FAQ sections

\`\`\`html
<h2>Frequently Asked Questions</h2>

<details>
  <summary>Do you offer refunds?</summary>
  <p>Yes, within 30 days of purchase.</p>
</details>

<details>
  <summary>Is there a free trial?</summary>
  <p>Yes, 14 days, no credit card required.</p>
</details>
\`\`\`

Before \`<details>\` existed, this pattern required a chunk of JavaScript to toggle visibility and manage ARIA attributes by hand. Now it's two native tags.

### dialog: a native modal

\`\`\`html
<dialog id="my-dialog">
  <p>This is a modal dialog.</p>
  <button onclick="document.getElementById('my-dialog').close()">Close</button>
</dialog>

<button onclick="document.getElementById('my-dialog').showModal()">Open Dialog</button>
\`\`\`

\`<dialog>\` is hidden by default. Calling \`.showModal()\` via JavaScript opens it as a true modal: it traps keyboard focus inside, dims the rest of the page behind a backdrop, and closes on the Escape key — all automatically, all behavior that used to require a JavaScript library to build correctly.

### dialog vs a plain div "modal"

A hand-rolled \`<div class="modal">\` needs manual work to trap focus, handle Escape, and manage \`aria-modal\`. \`<dialog>\` gets all of that natively — it's a rare case where the *easy* HTML-only path is also the *more* accessible one.

> **Key idea:** \`<details>\`/\`<summary>\` and \`<dialog>\` deliver two of the most commonly hand-rolled-in-JavaScript UI patterns — accordions and modals — as native, accessible HTML with a fraction of the code.`,
    },
    {
      name: "The template Element",
      minutes: 7,
      intro: "Inert HTML fragments meant to be cloned by JavaScript, not rendered directly.",
      content: `### What makes template different

\`\`\`html
<template id="row-template">
  <tr>
    <td class="name"></td>
    <td class="email"></td>
  </tr>
</template>
\`\`\`

Content inside \`<template>\` is **parsed but never rendered** and never runs (images don't load, scripts don't execute) — it just sits inertly in the DOM until JavaScript explicitly clones it.

### Using it from JavaScript

\`\`\`html
<table id="users"></table>
<template id="row-template">
  <tr>
    <td class="name"></td>
    <td class="email"></td>
  </tr>
</template>

<script>
  const template = document.getElementById("row-template");
  const table = document.getElementById("users");

  function addRow(name, email) {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".name").textContent = name;
    clone.querySelector(".email").textContent = email;
    table.appendChild(clone);
  }

  addRow("Alice", "alice@example.com");
</script>
\`\`\`

Each call to \`addRow\` clones a fresh copy of the template's content and fills in the blanks — a pattern used constantly for rendering lists of data (search results, chat messages, table rows) without string-concatenating raw HTML.

### Why not just build the HTML with a string?

\`\`\`js
// works, but risky: unescaped user data becomes executable HTML
table.innerHTML += \`<tr><td>\${name}</td><td>\${email}</td></tr>\`;
\`\`\`

Building HTML via string concatenation and \`innerHTML\` is a classic **XSS (cross-site scripting)** vector — if \`name\` contains \`<script>\`, it executes. Cloning a \`<template>\` and setting \`.textContent\` on specific elements avoids that risk entirely, since \`.textContent\` never interprets its input as markup.

### valid anywhere, renders nowhere

A \`<template>\` can be placed inside a \`<table>\`, \`<select>\`, or anywhere else with strict content rules, because it's inert — the browser doesn't validate its *contents* against the parent's normal rules the way it would for real rendered content.

> **Key idea:** \`<template>\` is HTML that exists purely as a stamp for JavaScript to clone — safer and faster than building markup from strings, and the standard tool for rendering repeated, data-driven UI.`,
    },
  ],
}
