import type { Module } from "../types"

export const htmlModule10: Module = {
  id: 10,
  title: "Capstone: Building a Real Page",
  status: "upcoming",
  lessons: [
    {
      name: "Planning a Multi-Section Page",
      minutes: 8,
      intro: "Sketching a page's structure before writing a single tag.",
      content: `### Structure before syntax

Every technique in this course — headings, lists, links, images, forms, tables, semantic layout — comes together on a real page. The habit that separates clean markup from a tangle of divs is **planning the outline before typing HTML**.

### Sketch the landmarks first

For a typical marketing/portfolio page, sketch the big regions as an outline, in plain English, before touching code:

\`\`\`
Header
  - logo / site name
  - nav: Home, Work, About, Contact
Main
  - Hero section (h1, tagline, CTA button)
  - Featured work (section, grid of article cards)
  - About section (section, bio + photo)
  - Contact form (section, form)
Footer
  - copyright, social links
\`\`\`

This maps almost directly onto semantic elements: \`<header>\`, \`<nav>\`, \`<main>\`, a \`<section>\` per region, \`<article>\` for each repeatable card, \`<footer>\`.

### Ask "what is this, not what does it look like"

For every chunk of content, ask what it *is* before deciding how to mark it up:

| Content | Ask | Element |
|---|---|---|
| Page title | Is this the one main heading? | \`<h1>\` |
| A blog post preview | Standalone, could exist elsewhere on its own? | \`<article>\` |
| A sidebar of related links | Tangential to the main content? | \`<aside>\` |
| A row of nav links | Is this navigation? | \`<nav><ul>\` |
| A decorative background image | Does it carry information? | CSS background, not \`<img>\` |

### One heading level per nesting depth

As you sketch, keep the heading hierarchy consistent with the outline — the page \`<h1>\`, then \`<h2>\` for each major section, \`<h3>\` for subsections within those, matching the nesting you sketched above, not skipping around based on how big you want the text.

> **Key idea:** a five-minute plain-text outline, mapped to landmarks and heading levels before you write a line of markup, is what prevents the "div wrapping a div wrapping a div" mess that's hard to untangle later.`,
    },
    {
      name: "Validation & Best Practices Checklist",
      minutes: 8,
      intro: "A practical pass to run over any page before calling it done.",
      content: `### The checklist

Run through this before considering any real page finished:

**Structure**
- [ ] \`<!DOCTYPE html>\` is the first line
- [ ] Exactly one \`<h1>\`, headings don't skip levels
- [ ] Exactly one \`<main>\`, not nested inside \`<article>\`/\`<aside>\`
- [ ] Semantic elements used where they fit (\`<nav>\`, \`<article>\`, \`<section>\`) — \`<div>\` only as a fallback

**Content correctness**
- [ ] Every \`<img>\` has \`alt\` (real description, or \`alt=""\` if decorative)
- [ ] Every form \`<input>\` has an associated \`<label>\`
- [ ] Every link's text makes sense out of context (no bare "click here")
- [ ] Tags are closed and correctly nested (no crossed tags)

**Metadata**
- [ ] \`<meta charset="UTF-8">\` present
- [ ] \`<meta name="viewport" ...>\` present
- [ ] \`<title>\` is specific to the page, not generic
- [ ] \`<meta name="description">\` written for this specific page

**Accessibility pass**
- [ ] Tab through the whole page with the mouse unplugged — can you reach and operate everything?
- [ ] Run the browser's Lighthouse accessibility audit
- [ ] Check color contrast on body text and buttons

**Validation**
- [ ] Paste the page into the [W3C Markup Validator](https://validator.w3.org/) and fix reported errors

### Why the checklist form works

Each of these is easy to get right individually, and easy to silently skip under deadline pressure. A page that "looks done" in the browser can still fail half this list — the browser's error tolerance means broken markup often *looks* fine while carrying real bugs for screen readers, SEO, or future maintainers.

### A five-minute version

If you only have five minutes: run Lighthouse, tab through the page once with no mouse, and confirm every image has real alt text. Those three catch the majority of real-world issues.

> **Key idea:** "renders correctly for me, in my browser, with my mouse" is a low bar. This checklist is what closes the gap between that and a page that actually works for every visitor and every tool that reads it.`,
    },
    {
      name: "A Complete Worked Example",
      minutes: 12,
      intro: "One full page, tying every module in this course together.",
      content: `### The full page

Here's a complete, valid HTML document combining structure, semantics, navigation, media, a table, and a form — everything covered in this course, in one place.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jordan Lee — Freelance Photographer</title>
  <meta name="description" content="Portfolio and booking page for Jordan Lee, freelance photographer specializing in landscape and event photography.">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <h1>Jordan Lee Photography</h1>
    <nav aria-label="Primary">
      <ul>
        <li><a href="#work" aria-current="page">Work</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">

    <section id="work">
      <h2>Featured Work</h2>

      <article>
        <figure>
          <img src="landscape.jpg" alt="Sunrise over a misty mountain valley" width="800" height="500">
          <figcaption>Blue Ridge Mountains, early morning</figcaption>
        </figure>
        <p>Landscape and nature photography across the region.</p>
      </article>

      <article>
        <video src="event-reel.mp4" controls width="800" height="450" poster="event-thumb.jpg">
          Your browser doesn't support video playback.
        </video>
        <p>Event highlight reel — 2025 season.</p>
      </article>
    </section>

    <section id="pricing">
      <h2>Pricing</h2>
      <table>
        <caption>Session packages</caption>
        <thead>
          <tr>
            <th scope="col">Package</th>
            <th scope="col">Duration</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Portrait</th>
            <td>1 hour</td>
            <td>$150</td>
          </tr>
          <tr>
            <th scope="row">Event</th>
            <td>4 hours</td>
            <td>$600</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section id="contact">
      <h2>Get in Touch</h2>
      <form action="/inquiries" method="post">
        <fieldset>
          <legend>Booking inquiry</legend>

          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>

          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>

          <label for="package">Package</label>
          <select id="package" name="package">
            <option value="portrait">Portrait</option>
            <option value="event">Event</option>
          </select>

          <label for="message">Message</label>
          <textarea id="message" name="message" rows="4"></textarea>

          <button type="submit">Send Inquiry</button>
        </fieldset>
      </form>
    </section>

  </main>

  <footer>
    <p>&copy; 2026 Jordan Lee Photography</p>
    <nav aria-label="Footer">
      <ul>
        <li><a href="mailto:hello@jordanlee.example">hello@jordanlee.example</a></li>
        <li><a href="tel:+15551234567">(555) 123-4567</a></li>
      </ul>
    </nav>
  </footer>

  <script src="app.js" defer></script>
</body>
</html>
\`\`\`

### What to notice

Every element here was covered in an earlier module: the skip link, \`aria-label\`/\`aria-current\` for navigation, \`<figure>\`/\`<figcaption>\`, \`<video>\` with a poster, an accessible \`<table>\` with \`scope\` and \`<caption>\`, a fully labeled \`<form>\` inside a \`<fieldset>\`, and metadata in \`<head>\`. Nothing here is exotic — it's the same handful of patterns, composed.

> **Key idea:** a real page is just these individual patterns stacked together with a clear outline. If any one piece looks unfamiliar, that's the module to revisit.`,
    },
    {
      name: "Where to Go Next",
      minutes: 6,
      intro: "You've covered HTML end to end — here's how it connects to what comes after.",
      content: `### What you've covered

This course took you from a blank \`.html\` file through the full breadth of the language: document structure, text content, links, images and media, tables, forms, semantic layout, accessibility, document metadata, and a handful of advanced elements — everything needed to build a complete, real, accessible page.

### HTML's boundary — and what's next

HTML describes structure and content. Two more languages pick up from here:

- **CSS** — controls how that structure *looks*: colors, spacing, layout (flexbox, grid), responsive design, animation. Every semantic element you've learned styles exactly the same as a \`<div>\` would — nothing about semantic HTML fights against CSS.
- **JavaScript** — controls *behavior*: responding to clicks, validating forms dynamically, fetching data, updating the page without a reload. The \`data-*\` attributes, \`<template>\`, and \`<dialog>\` elements from the advanced module are exactly the seams where JavaScript typically hooks in.

### Things worth exploring from here

- **CSS layout** — Flexbox and Grid are how modern pages are actually laid out (tables, remember, are for tabular *data* only).
- **A CSS framework or component library** — once you're comfortable with plain CSS, tools like Tailwind speed up styling considerably.
- **Web accessibility guidelines (WCAG)** — this course covered the practical 80%; WCAG is the full formal standard if you want to go deeper.
- **A static site generator or framework** — once pages get repetitive, tools that let you reuse markup (React, or simpler static site generators) save a lot of copy-pasting.

### The real test

The best next step is to build something real — a portfolio page, a small project page, a resume site — and put every element from this course to use without a tutorial telling you which tag to reach for. That's the point where the vocabulary stops being "things I read about" and becomes "things I reach for automatically."

> **Key idea:** HTML is the foundation every other web technology sits on top of. You now have the complete vocabulary — the next step is CSS for appearance, and using that vocabulary on something real.`,
    },
  ],
}
