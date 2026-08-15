import type { Module } from "../types"

export const htmlModule8: Module = {
  id: 8,
  title: "Metadata & Document Head",
  status: "upcoming",
  lessons: [
    {
      name: "The head Element & Meta Tags",
      minutes: 8,
      intro: "The metadata that describes a page without appearing on it.",
      content: `### What lives in head

Nothing inside \`<head>\` is directly visible on the rendered page — it's all metadata *about* the page, read by the browser, search engines, and other tools.

\`\`\`html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <meta name="description" content="A short summary of this page's content.">
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

### meta name="description"

Shown as the snippet text under your page's title in search results:

\`\`\`html
<meta name="description" content="Learn HTML from scratch with hands-on lessons covering structure, forms, accessibility, and more.">
\`\`\`

Keep it around 150–160 characters — longer gets truncated in search results. Every page should have a *unique* description; don't reuse the same one site-wide.

### meta name="author" and other basics

\`\`\`html
<meta name="author" content="Jane Smith">
<meta name="keywords" content="html, web development, tutorial">
\`\`\`

\`keywords\` is effectively ignored by modern search engines (long abused by spam) — including it does no harm but also no good. \`description\` is the one that still matters.

### title is not optional

\`\`\`html
<title>Pricing — Acme Inc.</title>
\`\`\`

Shown in the browser tab, bookmarks, browser history, and as the clickable headline in search results. A missing or generic \`<title>\` ("Untitled Document," "Home") is one of the most common real-world SEO mistakes. Make it specific to the page, not just the site name repeated everywhere.

> **Key idea:** \`<head>\` content is invisible on the page but highly visible everywhere else — browser tabs, bookmarks, and search results. Treat \`<title>\` and \`<meta name="description">\` as the first thing a stranger sees about your page, because for search results, they often are.`,
    },
    {
      name: "Viewport & Responsive Meta",
      minutes: 7,
      intro: "The single meta tag that makes a page usable on a phone.",
      content: `### The problem it solves

Mobile browsers historically rendered pages at a fixed "desktop" width (often 980px) and then zoomed out to fit the screen — making text tiny and forcing users to pinch-zoom to read anything. The viewport meta tag turns that off.

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

- \`width=device-width\` — render at the device's actual CSS pixel width, not a fixed desktop assumption.
- \`initial-scale=1.0\` — start at 100% zoom, no automatic zooming out.

### Without this tag

A page with responsive CSS (media queries, flexible layouts) will still look broken on a phone without this meta tag — the browser renders it as if on a wide desktop screen first, then shrinks the whole thing down, defeating the responsive CSS entirely. This is one line that's easy to forget and produces a very visible bug.

### Common mistake: disabling zoom

\`\`\`html
<!-- avoid: this is an accessibility problem -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
\`\`\`

\`user-scalable=no\` and \`maximum-scale=1.0\` prevent users from pinch-zooming to read small text — a real barrier for low-vision users. Modern guidance is to always allow zooming; use responsive CSS to get sizing right instead of blocking the user's own accessibility tool.

### Testing responsiveness

Browser DevTools has a device toolbar (Ctrl/Cmd+Shift+M in Chrome) that simulates various phone and tablet screen sizes directly — the fastest way to check how a page behaves without an actual device.

> **Key idea:** \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\` is close to mandatory on every page you write — without it, "responsive" CSS never even gets a chance to run correctly on mobile.`,
    },
    {
      name: "Favicons & Social Preview Tags",
      minutes: 8,
      intro: "The small icon in the browser tab, and how link previews get their image and title.",
      content: `### Favicon

The small icon shown in the browser tab, bookmarks bar, and history:

\`\`\`html
<link rel="icon" type="image/png" href="/favicon.png">
\`\`\`

Browsers also check for \`/favicon.ico\` at the site root automatically as a fallback, even with no \`<link>\` tag — but an explicit tag is more reliable and lets you use a modern format like PNG or SVG.

### Multiple sizes for different contexts

\`\`\`html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
\`\`\`

\`apple-touch-icon\` is the icon shown when someone adds your site to their iPhone home screen — a completely different size requirement than a browser tab icon.

### Open Graph tags: link previews

When a page URL is pasted into Slack, X, Discord, or iMessage, the preview card (image, title, description) is generated from **Open Graph** meta tags, a convention originally from Facebook, now universally supported:

\`\`\`html
<meta property="og:title" content="Complete HTML Course">
<meta property="og:description" content="Learn HTML from scratch — structure, forms, accessibility, and more.">
<meta property="og:image" content="https://example.com/preview.png">
<meta property="og:url" content="https://example.com/courses/html">
<meta property="og:type" content="website">
\`\`\`

Without these tags, a shared link either shows no preview at all, or falls back to guessing from the page's regular \`<title>\`/\`<meta description>\` — inconsistent across platforms.

### Twitter/X-specific card tags

\`\`\`html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Complete HTML Course">
<meta name="twitter:image" content="https://example.com/preview.png">
\`\`\`

X reads its own \`twitter:*\` tags first, falling back to Open Graph tags if they're absent — including both covers the most platforms with the least duplication.

> **Key idea:** a favicon and social preview tags cost a handful of \`<meta>\`/\`<link>\` lines but are the difference between a professional-looking shared link and a blank gray box with no image or title.`,
    },
    {
      name: "Linking CSS & JavaScript",
      minutes: 8,
      intro: "Connecting external stylesheets and scripts to your HTML document.",
      content: `### Linking a stylesheet

\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

\`<link>\` always goes in \`<head>\` — this ensures the CSS is loaded and applied *before* the page's content renders, avoiding a flash of unstyled content.

### Inline styles and style blocks

\`\`\`html
<head>
  <style>
    body { font-family: sans-serif; }
  </style>
</head>
\`\`\`

\`\`\`html
<p style="color: red;">Inline-styled text</p>
\`\`\`

\`<style>\` blocks and the \`style\` attribute both work, but an external \`.css\` file (via \`<link>\`) is preferred for anything beyond a quick prototype — it's cacheable by the browser and keeps structure separate from presentation.

### Linking JavaScript

\`\`\`html
<body>
  ...page content...
  <script src="app.js"></script>
</body>
\`\`\`

Unlike CSS, \`<script>\` tags are conventionally placed at the **end of \`<body>\`**, right before the closing tag — this lets the browser render all the visible HTML first, so the page doesn't sit blank while a script downloads and runs.

### defer and async

\`\`\`html
<head>
  <script src="app.js" defer></script>
</head>
\`\`\`

Modern practice is to put \`<script>\` in \`<head>\` with a loading attribute instead:

- \`defer\` — downloads the script in the background, but waits until the HTML is fully parsed before running it, and runs multiple deferred scripts in order. This is the right default for most app scripts.
- \`async\` — downloads in the background and runs **as soon as it's ready**, potentially before the HTML finishes parsing, and with no guaranteed order relative to other scripts. Best for independent scripts like analytics that don't touch the page's content.

\`\`\`html
<script src="analytics.js" async></script>
<script src="app.js" defer></script>
\`\`\`

### Inline scripts

\`\`\`html
<script>
  console.log("Hello from inline JS");
</script>
\`\`\`

Runs immediately at that point in the HTML — useful for tiny snippets, but external files are preferred for anything substantial (cacheable, and keeps HTML readable).

> **Key idea:** CSS goes in \`<head>\` so styles are ready before content renders. JavaScript goes at the end of \`<body>\`, or in \`<head>\` with \`defer\`, so it doesn't block the page from displaying while it downloads.`,
    },
  ],
}
