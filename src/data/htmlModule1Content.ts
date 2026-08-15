import type { Module } from "../types"

export const htmlModule1: Module = {
  id: 1,
  title: "Getting Started with HTML",
  status: "in_progress",
  lessons: [
    {
      name: "What is HTML?",
      minutes: 8,
      intro: "The language every web page is built on, and the tools you need to write it.",
      content: `### HTML in one sentence

**HTML (HyperText Markup Language)** describes the *structure* and *content* of a web page — headings, paragraphs, images, links, forms. It is not a programming language; it has no logic or loops. It's a **markup language**: you wrap content in tags that tell the browser what that content *is*.

\`\`\`html
<h1>Hello, World!</h1>
<p>This is a paragraph of text.</p>
\`\`\`

The browser reads this and renders a big heading followed by a paragraph.

### The three layers of the web

| Layer | Job | Language |
|---|---|---|
| Structure | What the content *is* | HTML |
| Presentation | What it *looks like* | CSS |
| Behavior | What it *does* | JavaScript |

This course is entirely about the first layer. Get the structure right and everything else (styling, interactivity) has something solid to build on.

### What you need

- **A text editor** — VS Code is the standard choice, free and cross-platform.
- **A web browser** — Chrome, Firefox, or Edge all work; their DevTools (F12) let you inspect and debug HTML live.
- That's it. No compiler, no build step. You write a \`.html\` file and open it in a browser.

### Your first file

Create a file named \`index.html\` with this content:

\`\`\`html
<h1>My First Page</h1>
<p>I'm learning HTML.</p>
\`\`\`

Double-click it (or drag it into a browser tab) and you'll see it rendered. No server needed — the browser can open local files directly via a \`file://\` URL.

> **Key idea:** HTML describes *meaning*, not appearance. A \`<h1>\` is a top-level heading regardless of how big or small it happens to look — that's CSS's job.`,
    },
    {
      name: "Anatomy of an HTML Document",
      minutes: 10,
      intro: "The boilerplate every HTML page starts with, and what each line means.",
      content: `### The standard skeleton

Every real HTML page starts with the same boilerplate:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
\`\`\`

### Line by line

- **\`<!DOCTYPE html>\`** — tells the browser "render this in modern standards mode." Always the very first line, not a tag that needs closing.
- **\`<html lang="en">\`** — the root element. Everything else lives inside it. \`lang\` tells screen readers and translators what language the page is in.
- **\`<head>\`** — metadata *about* the page: title, character encoding, linked stylesheets/scripts. Nothing in \`<head>\` is visible on the page itself.
- **\`<meta charset="UTF-8">\`** — sets the character encoding so text (emoji, accented letters, non-Latin scripts) renders correctly. Always include this.
- **\`<meta name="viewport" ...>\`** — tells mobile browsers to render at the device's actual width instead of zooming out to fit a "desktop" layout. Essential for responsive pages.
- **\`<title>\`** — the text shown in the browser tab and bookmarks.
- **\`<body>\`** — everything visible on the page lives here. This is where you'll spend most of your time.

### Nesting and indentation

HTML elements nest inside each other, and indentation (2 spaces is common) makes that nesting visible:

\`\`\`html
<body>
  <h1>Title</h1>
  <p>A paragraph.</p>
</body>
\`\`\`

The browser doesn't care about indentation or whitespace — it's purely for humans reading the source. But consistent indentation is what makes a page's structure readable at a glance.

> **Key idea:** Always start a real HTML file from this exact skeleton. It's boilerplate you'll type (or snippet) hundreds of times.`,
    },
    {
      name: "Elements, Tags & Attributes",
      minutes: 10,
      intro: "The three building blocks of every line of HTML you'll ever write.",
      content: `### Tags vs elements

A **tag** is the markup itself: \`<p>\`. An **element** is the tag plus its content plus its closing tag: \`<p>Hello</p>\`. People often say "tag" loosely to mean the whole element — that's fine in casual conversation, but it's worth knowing the precise distinction.

\`\`\`html
<p>This is a paragraph.</p>
\`\`\`

- \`<p>\` — opening tag
- \`This is a paragraph.\` — content
- \`</p>\` — closing tag (note the \`/\`)

### Void elements

Some elements have no content and no closing tag — they're self-contained:

\`\`\`html
<img src="cat.jpg" alt="A cat">
<br>
<hr>
<input type="text">
\`\`\`

These are called **void elements**. Writing \`<br />\` with a trailing slash is old XHTML habit — modern HTML doesn't require it, though it's harmless.

### Attributes

Attributes add extra information *to* an opening tag, as \`name="value"\` pairs:

\`\`\`html
<a href="https://example.com" target="_blank">Visit site</a>
\`\`\`

- \`href\` — where the link goes
- \`target="_blank"\` — open in a new tab

Rules of thumb:
- Attribute values go in quotes (double quotes is the convention).
- An element can have any number of attributes, space-separated.
- Some attributes are boolean — just their presence means "on": \`<input disabled>\`.

### Nesting rules

Elements must **close in the reverse order they opened** — think of it like nested parentheses:

\`\`\`html
<!-- correct -->
<p>Some <strong>bold</strong> text.</p>

<!-- wrong: tags cross each other -->
<p>Some <strong>bold</p></strong> text.
\`\`\`

Browsers try to recover from broken nesting, but the result is unpredictable. Always close tags in the right order.

> **Key idea:** tag = markup, element = tag + content, attribute = extra info on the opening tag. Master this vocabulary now — every lesson from here builds on it.`,
    },
    {
      name: "Comments & Validating Your HTML",
      minutes: 7,
      intro: "Leaving notes in your markup, and catching mistakes before they bite you.",
      content: `### Comments

HTML comments are ignored by the browser entirely — useful for notes to yourself or temporarily disabling a block:

\`\`\`html
<!-- This is a comment -->

<!--
  Multi-line comments
  work too.
-->

<!-- <p>This paragraph is commented out and won't render.</p> -->
\`\`\`

Comments can't be nested, and they're visible to anyone who views the page source — never put secrets or sensitive info in one.

### Why validate

The browser is extremely forgiving: unclosed tags, wrong nesting, missing attributes — it'll try to render something anyway, silently guessing what you meant. That "helpfulness" hides real bugs, especially ones that only show up in a different browser or with a screen reader.

### The W3C validator

The [W3C Markup Validator](https://validator.w3.org/) checks your HTML against the spec and reports errors like:
- Unclosed tags
- Missing required attributes (like \`alt\` on \`<img>\`)
- Elements nested where they're not allowed (e.g. a \`<div>\` inside a \`<p>\`)

You can paste raw HTML, upload a file, or point it at a live URL.

### A common real bug it catches

\`\`\`html
<!-- browser renders this fine, but it's invalid -->
<p>Some text
<p>More text</p>
\`\`\`

The first \`<p>\` is never closed. Browsers auto-close it when they hit the next \`<p>\`, so it *looks* right — but relying on that auto-recovery is fragile. Always close what you open.

> **Key idea:** "renders fine in my browser" is not the same as "correct." Validate your markup, especially before shipping anything real — it catches the invisible bugs that only surface later, in a different browser or for a user relying on assistive tech.`,
    },
  ],
}
