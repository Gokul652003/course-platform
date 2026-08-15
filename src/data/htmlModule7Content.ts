import type { Module } from "../types"

export const htmlModule7: Module = {
  id: 7,
  title: "Semantic HTML & Accessibility",
  status: "upcoming",
  lessons: [
    {
      name: "Why Semantic HTML Matters",
      minutes: 8,
      intro: "The difference between markup that looks right and markup that means something.",
      content: `### div-soup vs semantic markup

Both of these render *identically* in a browser with the right CSS:

\`\`\`html
<!-- div-soup -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">...</div>
</div>
<div class="footer">...</div>
\`\`\`

\`\`\`html
<!-- semantic -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>
\`\`\`

Visually, no difference. But the semantic version communicates *what each region is* to machines: screen readers, search engines, browser extensions like reader mode, and even your own teammates reading the source six months from now.

### Three concrete payoffs

1. **Screen readers** let users jump directly to "navigation," "main content," or "footer" via a landmarks menu — instead of tabbing through the entire page linearly.
2. **SEO** — search engines weight content inside \`<article>\`/\`<main>\` more heavily than the same text in a generic \`<div>\`, and use semantic structure to generate rich search snippets.
3. **Maintainability** — six months later, \`<nav>\` unambiguously tells you what that block is; \`<div class="nav">\` only tells you what someone *named* it, and that name can drift from the truth as code changes.

### It costs nothing

Semantic elements aren't harder to write or style than \`<div>\` — most behave exactly like a block-level \`<div>\` by default and can be styled with the exact same CSS. There's essentially no reason to reach for \`<div>\` when a matching semantic element exists.

> **Key idea:** semantic HTML is a free upgrade — same visual result, but the markup itself becomes machine-readable *meaning*, not just a styling hook.`,
    },
    {
      name: "Page Layout Elements",
      minutes: 10,
      intro: "The semantic elements that structure a typical page — header, nav, main, and friends.",
      content: `### The core layout elements

\`\`\`html
<body>
  <header>
    <h1>Site Name</h1>
    <nav>...</nav>
  </header>

  <main>
    <article>
      <h2>Article Title</h2>
      <section>
        <h3>Section Heading</h3>
        <p>...</p>
      </section>
    </article>

    <aside>
      <h2>Related Links</h2>
    </aside>
  </main>

  <footer>
    <p>&copy; 2026 My Site</p>
  </footer>
</body>
\`\`\`

### What each one means

- **\`<header>\`** — introductory content for the page *or* for a section/article it's placed inside. Not necessarily "the top banner" — an \`<article>\` can have its own \`<header>\` with its title and byline.
- **\`<nav>\`** — a block of navigation links (main menu, breadcrumbs, table of contents). Not every group of links needs \`<nav>\` — just the significant navigation blocks.
- **\`<main>\`** — the primary content of the page, unique to that page. **Exactly one per page**, never nested inside \`<article>\`/\`<aside>\`/\`<header>\`/\`<footer>\`.
- **\`<article>\`** — a self-contained piece of content that would make sense distributed on its own (a blog post, a news story, a forum comment, a product card).
- **\`<section>\`** — a thematic grouping of content, usually with its own heading. Use it when content forms a distinct part of the document outline — not as a generic wrapper.
- **\`<aside>\`** — content tangentially related to the surrounding content (a sidebar, a pull quote, related links) — could be removed without losing the main point.
- **\`<footer>\`** — closing content for the page or an enclosing section (copyright, site links, or — inside an \`<article>\` — the author bio and publish date).

### section vs div: the real test

Ask: **"does this content deserve its own entry in the document outline, ideally with a heading?"** If yes, \`<section>\`. If it's just a grouping for styling purposes with no thematic identity, \`<div>\`.

\`\`\`html
<!-- section: a real thematic grouping -->
<section>
  <h2>Customer Reviews</h2>
  ...
</section>

<!-- div: purely a styling wrapper, no heading, no outline meaning -->
<div class="card-grid">
  ...
</div>
\`\`\`

> **Key idea:** these elements form the skeleton screen readers use to navigate a page by landmark. \`<main>\` once per page, \`<article>\` for standalone content, \`<section>\` only when there's a real thematic grouping — not as a \`<div>\` replacement.`,
    },
    {
      name: "ARIA Basics",
      minutes: 9,
      intro: "Filling the gaps HTML doesn't cover — and knowing when not to use ARIA at all.",
      content: `### The first rule of ARIA

> **"No ARIA is better than bad ARIA."** Always prefer a native HTML element with built-in semantics over recreating its behavior with a \`<div>\` and ARIA attributes.

\`\`\`html
<!-- avoid: reinventing a button, and easy to get wrong -->
<div role="button" tabindex="0" onclick="submit()">Submit</div>

<!-- correct: native button, all the behavior for free -->
<button onclick="submit()">Submit</button>
\`\`\`

A native \`<button>\` is automatically focusable, triggerable by both Enter and Space, and announced as "button" by screen readers — all without a single ARIA attribute. Recreating that with \`<div role="button">\` means manually reimplementing focus, keyboard handling, and more, and it's easy to miss a case.

### role: describing what something is

Use \`role\` when you must build a widget with no native equivalent, or to clarify a generic element's purpose:

\`\`\`html
<div role="alert">Your session is about to expire.</div>
<ul role="tablist">
  <li role="tab">Tab 1</li>
</ul>
\`\`\`

\`role="alert"\` makes a screen reader announce the content immediately when it appears — useful for live error messages or status updates.

### aria-label and aria-labelledby

For giving an accessible name to an element that has no visible text (an icon-only button):

\`\`\`html
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<h2 id="settings-heading">Settings</h2>
<section aria-labelledby="settings-heading">...</section>
\`\`\`

- \`aria-label\` — a string provided directly.
- \`aria-labelledby\` — points to the \`id\` of an element that already contains the label text (avoids duplicating text that already exists on the page).

### aria-hidden: hiding decorative content

\`\`\`html
<button>
  <svg aria-hidden="true">...</svg>
  Save
</button>
\`\`\`

Hides purely decorative content (like an icon next to text that already says the same thing) from screen readers, so it isn't announced redundantly.

### Common states

\`\`\`html
<button aria-expanded="false">Menu</button>
<input aria-invalid="true">
<div aria-current="page">Home</div>
\`\`\`

These describe dynamic state — whether a menu is open, whether a field failed validation. They're typically toggled by JavaScript as the UI changes.

> **Key idea:** ARIA supplements HTML, it doesn't replace it. Reach for a native element first; use ARIA to fill in genuine gaps, like naming an icon-only button or announcing dynamic state changes.`,
    },
    {
      name: "Accessibility Best Practices",
      minutes: 9,
      intro: "A practical checklist that catches the majority of real accessibility bugs.",
      content: `### Keyboard navigation

Every interactive element must be reachable and operable with a keyboard alone — no mouse. Native elements (\`<a>\`, \`<button>\`, \`<input>\`) get this for free. Test it yourself: unplug the mouse and Tab through your page.

\`\`\`html
<!-- Tab order follows document order by default — usually correct -->
<a href="#">Link 1</a>
<button>Button 1</button>
<input type="text">
\`\`\`

Avoid \`tabindex\` values greater than 0 — they override the natural tab order and almost always create a confusing experience. \`tabindex="0"\` (make a normally non-focusable element focusable) and \`tabindex="-1"\` (remove from tab order, but still focusable via JS) are the only values you generally need.

### Color contrast

Text needs sufficient contrast against its background — WCAG AA requires at least 4.5:1 for normal text, 3:1 for large text. Low-contrast gray-on-white text is one of the most common real-world accessibility failures, easy to check with any contrast-checker tool.

### Don't rely on color alone

\`\`\`html
<!-- bad: only color distinguishes the states -->
<span style="color: red">Failed</span>
<span style="color: green">Passed</span>

<!-- good: icon/text reinforces the meaning -->
<span style="color: red">✗ Failed</span>
<span style="color: green">✓ Passed</span>
\`\`\`

Roughly 1 in 12 men have some form of color blindness — red/green status indicators with no other cue are invisible to a meaningful chunk of users.

### Focus indicators

Never remove the browser's default focus outline without replacing it with an equally visible alternative:

\`\`\`css
/* never do this with nothing to replace it */
:focus { outline: none; }
\`\`\`

Keyboard users rely entirely on the focus outline to know where they are on the page. Removing it silently breaks navigation for them.

### Alt text, labels, and headings — the recap

These three, covered in earlier lessons, are worth repeating as the highest-leverage fixes:
- Every \`<img>\` has meaningful \`alt\` (or \`alt=""\` if decorative).
- Every form input has an associated \`<label>\`.
- Headings form a logical, unskipped outline (\`h1\` → \`h2\` → \`h3\`).

### Testing tools

- Browser DevTools **Accessibility** panel (Chrome/Firefox) shows the computed accessibility tree for any element.
- **Lighthouse** (built into Chrome DevTools) runs an automated accessibility audit and flags common issues.
- Actually tabbing through your page with a keyboard, and trying a screen reader (VoiceOver on Mac, NVDA on Windows, both free) for five minutes, surfaces problems no automated tool catches.

> **Key idea:** most accessibility wins come from a handful of habits — real semantic elements, labeled inputs, alt text, sufficient contrast, and a visible focus state — not from exotic ARIA. Automated tools catch maybe a third of real issues; five minutes of keyboard-only testing catches the rest.`,
    },
  ],
}
