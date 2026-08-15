import type { Module } from "../types"

export const htmlModule3: Module = {
  id: 3,
  title: "Links & Navigation",
  status: "upcoming",
  lessons: [
    {
      name: "Anchor Tags & href",
      minutes: 8,
      intro: "The <a> element — how every clickable link on the web is built.",
      content: `### The anchor element

Links are made with \`<a>\` (anchor) and an \`href\` (hypertext reference) attribute pointing to the destination:

\`\`\`html
<a href="https://example.com">Visit Example</a>
\`\`\`

Anything can go inside an \`<a>\` — text, an image, even a block of other elements — and the whole thing becomes clickable.

\`\`\`html
<a href="https://example.com">
  <img src="banner.png" alt="Example Inc. logo">
</a>
\`\`\`

### Opening in a new tab

\`\`\`html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Visit Example</a>
\`\`\`

- \`target="_blank"\` opens the link in a new tab.
- \`rel="noopener noreferrer"\` is a **security best practice** — without it, the new page can access \`window.opener\` and manipulate the tab you came from (a technique called tabnabbing).

### The title attribute

\`\`\`html
<a href="/pricing" title="See our current plans and pricing">Pricing</a>
\`\`\`

Shows a tooltip on hover. Useful for extra context, but don't rely on it for anything essential — it's not visible on touch devices.

### Link text matters

\`\`\`html
<!-- bad: meaningless out of context -->
<p>To learn more, <a href="/docs">click here</a>.</p>

<!-- good: link text describes the destination -->
<p>Learn more in the <a href="/docs">documentation</a>.</p>
\`\`\`

Screen reader users often navigate by pulling up a list of all links on a page — a list full of "click here" links tells them nothing. Write link text that makes sense on its own.

> **Key idea:** \`href\` is what makes an anchor a link. Everything else — \`target\`, \`title\`, \`rel\` — refines *how* it behaves, not *whether* it works.`,
    },
    {
      name: "Relative vs Absolute Paths",
      minutes: 9,
      intro: "How the browser resolves where a link or resource actually points.",
      content: `### Absolute URLs

A full address, including the protocol and domain — works from anywhere:

\`\`\`html
<a href="https://example.com/about">About</a>
\`\`\`

### Relative paths

A path resolved *relative to the current page's location* — used for linking within your own site:

\`\`\`html
<a href="about.html">About</a>          <!-- same folder -->
<a href="pages/about.html">About</a>    <!-- into a subfolder -->
<a href="../index.html">Home</a>        <!-- up one folder -->
<a href="/about.html">About</a>         <!-- from site root, regardless of current page -->
\`\`\`

| Path | Meaning |
|---|---|
| \`about.html\` | Same directory as the current page |
| \`./about.html\` | Same as above — \`./\` means "here" |
| \`../about.html\` | One directory up |
| \`../../about.html\` | Two directories up |
| \`/about.html\` | Root of the domain, no matter where you are |

### Why it matters

If \`index.html\` links to \`pages/about.html\` using a relative path, that link only works correctly from \`index.html\`'s location. Move the file, and every relative link breaks. Root-relative paths (\`/about.html\`) are more robust for a site with a consistent folder structure, since they always resolve from the domain root.

### Linking to files and downloads

\`\`\`html
<a href="report.pdf">Download the report (PDF)</a>
<a href="report.pdf" download>Download the report</a>
\`\`\`

The \`download\` attribute forces the browser to download the file instead of navigating to it — useful for PDFs, images, or any file you don't want opened inline.

> **Key idea:** relative paths are resolved against the *current page's* location, not the file on disk where you're editing. Test links by actually clicking through your site's folder structure, not just by eyeballing the path.`,
    },
    {
      name: "In-Page, Email & Tel Links",
      minutes: 8,
      intro: "Jumping to a section on the same page, and links that open other apps.",
      content: `### Linking within the same page

Give any element an \`id\`, then link to it with \`#id\`:

\`\`\`html
<a href="#contact">Jump to Contact</a>

<!-- ...further down the page... -->

<h2 id="contact">Contact Us</h2>
\`\`\`

Clicking the link scrolls the page so that element is in view. This is how "back to top" links and single-page table-of-contents navigation work.

\`\`\`html
<a href="#top">Back to top</a>
<!-- and near the very top of the page: -->
<div id="top"></div>
\`\`\`

### Linking to another page's section

Combine a path with a hash — the browser loads the page, then scrolls to that section:

\`\`\`html
<a href="/docs/setup.html#installation">Installation instructions</a>
\`\`\`

### Email links

\`mailto:\` opens the user's default email client with a pre-filled draft:

\`\`\`html
<a href="mailto:hello@example.com">Email us</a>

<!-- pre-fill subject and body -->
<a href="mailto:hello@example.com?subject=Support%20Request&body=Hi%20there">Email support</a>
\`\`\`

Spaces and special characters in the query string must be URL-encoded (\`%20\` for a space).

### Phone links

\`tel:\` triggers a phone call on devices that support it (mobile phones, some desktop apps):

\`\`\`html
<a href="tel:+15551234567">Call us: (555) 123-4567</a>
\`\`\`

Use the full international format (\`+1...\`) so it works correctly regardless of the device's region settings.

> **Key idea:** \`href\` isn't limited to web pages — \`#id\`, \`mailto:\`, and \`tel:\` are all valid schemes that make an anchor do something other than navigate to another page.`,
    },
    {
      name: "Building a Navigation Menu",
      minutes: 9,
      intro: "Combining lists and links into the pattern every site header uses.",
      content: `### The standard pattern: nav + ul + li + a

Navigation menus are, structurally, just a list of links — wrapped in \`<nav>\` to mark that list as navigation:

\`\`\`html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/services.html">Services</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
</nav>
\`\`\`

Why a list, and not just a row of \`<a>\` tags? Semantically, a navigation menu *is* a list of options — screen readers will announce "list, 4 items" and let users jump through it, exactly like any other list.

### Marking the current page

There's no dedicated HTML attribute for "current page," so the convention is \`aria-current="page"\`:

\`\`\`html
<nav>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about.html">About</a></li>
  </ul>
</nav>
\`\`\`

This lets assistive tech announce which link represents the page the user is already on. CSS can also target \`[aria-current="page"]\` to visually highlight it — no separate class needed.

### Multiple navs on one page

A page can have more than one \`<nav>\` — a main menu and a footer nav, for instance. Use \`aria-label\` to distinguish them for screen reader users:

\`\`\`html
<nav aria-label="Primary">
  <ul>...</ul>
</nav>

<nav aria-label="Footer">
  <ul>...</ul>
</nav>
\`\`\`

### A skip link

A common accessibility pattern: a hidden link at the very top of the page that lets keyboard users jump straight past the navigation to the main content:

\`\`\`html
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>...</nav>

<main id="main-content">
  ...
</main>
\`\`\`

CSS typically hides this link visually until it receives keyboard focus (Tab), so sighted mouse users never see it, but keyboard users can use it to skip repetitive navigation.

> **Key idea:** a nav menu is just \`<nav><ul><li><a>\`. The semantics — not any special "menu" element — are what makes it navigable and accessible.`,
    },
  ],
}
