import type { Module } from "../types"

export const tailwindModule8: Module = {
  id: 8,
  title: "Responsive Design",
  status: "upcoming",
  lessons: [
    {
      name: "Mobile-First Breakpoints",
      minutes: 9,
      intro: "Understand Tailwind's mobile-first breakpoint scale and how prefixed utilities layer on top of it.",
      content: `### Mobile-first, not desktop-first

Tailwind's responsive system is **mobile-first**: every utility you write with no breakpoint prefix applies to *all* screen sizes, starting from the smallest. A breakpoint prefix like \`md:\` doesn't mean "only on medium screens" — it means "from medium screens **and up**." You're layering overrides on top of a base, not switching between separate fixed designs.

\`\`\`html
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
\`\`\`

Read this left to right as a story: "By default (which covers phones), the text is \`text-sm\`. Once the viewport reaches the \`md\` breakpoint, override it to \`text-base\`. Once it reaches \`lg\`, override it again to \`text-lg\`." At any given viewport width, exactly one of these three rules is "active" — whichever was declared at the largest breakpoint that's still ≤ the current width.

### The default breakpoint scale

Tailwind ships five breakpoints out of the box, all defined as \`min-width\` media queries:

| Prefix | Min-width | Typical target |
|--------|-----------|-----------------|
| (none) | \`0px\` | all screens — the mobile-first base |
| \`sm:\` | \`40rem\` (640px) | large phones, small tablets |
| \`md:\` | \`48rem\` (768px) | tablets |
| \`lg:\` | \`64rem\` (1024px) | small laptops |
| \`xl:\` | \`80rem\` (1280px) | desktops |
| \`2xl:\` | \`96rem\` (1536px) | large/wide desktops |

Every one of these compiles to a \`@media (min-width: ...)\` block, so \`sm:flex\` becomes:

\`\`\`css
@media (min-width: 40rem) {
  .sm\\:flex { display: flex; }
}
\`\`\`

### Applying prefixes to any utility

Any utility in Tailwind — layout, spacing, color, typography, even things like \`hover:\` combined with a breakpoint — can take a responsive prefix:

\`\`\`html
<div class="flex flex-col md:flex-row gap-4 p-4 md:p-8">
  <div class="w-full md:w-1/3 bg-blue-100 p-4">Sidebar</div>
  <div class="w-full md:w-2/3 bg-white p-4">Content</div>
</div>
\`\`\`

On phones, this stacks vertically with less padding; from \`md\` up, it becomes a horizontal two-column layout with more breathing room. Notice there's no explicit "mobile" class needed — the unprefixed \`flex-col\`, \`p-4\`, and \`w-full\` classes *are* the mobile styles, simply by virtue of having no prefix.

### Why the cascade order matters

Because each breakpoint is a wider \`min-width\` query layered on top of the last, later (larger) breakpoints in Tailwind's generated CSS naturally win over earlier ones at the same specificity, provided they appear later in the stylesheet — which Tailwind's build always guarantees regardless of the order you type classes in your HTML:

\`\`\`html
<div class="text-red-500 md:text-green-500 lg:text-blue-500">
  Text color changes as the viewport grows
</div>
\`\`\`

Below \`md\`: red. From \`md\` to just under \`lg\`: green. From \`lg\` up: blue. You never need an "unset" utility to cancel a smaller breakpoint's value — the next matching breakpoint's declaration simply overrides it because it's a more specific media query that also matches.

### Common mistake: writing desktop-first by accident

The single most common bug newcomers hit is applying a utility unprefixed when they meant it to be the *desktop* layout, then trying to "undo" it for mobile with a smaller-screen-only override that doesn't exist:

\`\`\`html
<!-- WRONG — this makes 3 columns the default (mobile) behavior, -->
<!-- then only DROPS to 1 column above md, backwards from the intent -->
<div class="grid grid-cols-3 md:grid-cols-1">
  ...
</div>
\`\`\`

Because there's no \`max-width\`-style "up to md" utility by default (see the next lesson for \`max-md:\`), the fix is to flip your thinking: design the unprefixed classes for the *smallest* screen first, then add prefixes only for the breakpoints where the design needs to change:

\`\`\`html
<!-- RIGHT — 1 column by default (mobile), 3 columns from md up -->
<div class="grid grid-cols-1 md:grid-cols-3">
  ...
</div>
\`\`\`

A second common mistake: forgetting that prefixes stack rather than reset. Writing \`sm:hidden lg:block\` does **not** mean "hidden only at \`sm\`, visible only at \`lg\`" — it means "hidden from \`sm\` up, then overridden back to \`block\` from \`lg\` up," so the element is actually *visible* below \`sm\` too (nothing hid it there), hidden from \`sm\`-\`lg\`, and visible again from \`lg\` up. If you want "hidden only in a specific range," you need both a lower and an upper bound, which the next lesson covers with \`max-*\` variants.

### A quick mental checklist

| Question | Answer |
|----------|--------|
| Does an unprefixed utility apply on desktop too? | Yes, unless a larger breakpoint overrides it |
| Does \`lg:flex\` apply on phones? | No — only from 1024px wide and up |
| Do I need a "default"/mobile-specific prefix? | No — no prefix *is* the mobile/base style |
| What order should I design in? | Smallest screen first, then add overrides going up |

> **Key idea:** Write your base (unprefixed) classes for the smallest screen, then add \`sm:\`/\`md:\`/\`lg:\`/\`xl:\`/\`2xl:\` overrides only where the design actually needs to change — every prefix means "this breakpoint and wider," never "this breakpoint only."`,
    },
    {
      name: "Customizing Breakpoints & Container Queries",
      minutes: 10,
      intro: "Redefine the screens scale, use max-width variants, and reach for native container queries in v4.",
      content: `### Why customize breakpoints at all

The default \`sm\`/\`md\`/\`lg\`/\`xl\`/\`2xl\` scale is a good general-purpose default, but a real product often has its own natural breakpoints — a specific point where a sidebar needs to appear, or a design handed off by a designer with different numbers. Tailwind lets you redefine the whole scale, or add to it, project-wide.

### Customizing screens the v3 way (tailwind.config.js)

In Tailwind v3, breakpoints live under \`theme.screens\` in the config file:

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px", // adding a custom breakpoint above 2xl
    },
  },
}
\`\`\`

Extending instead of replacing (so you keep the defaults and only add new ones) goes under \`theme.extend.screens\` instead of \`theme.screens\` directly — putting it under \`theme.screens\` replaces the whole scale, which is easy to trip over if you only wanted to add one breakpoint.

### Customizing screens the v4 way (@theme in CSS)

Tailwind v4 moves configuration into CSS itself via \`@theme\`, using \`--breakpoint-*\` custom properties instead of a JS object. This repo is on v4, so this is the form you'll actually reach for:

\`\`\`css
/* app.css */
@import "tailwindcss";

@theme {
  --breakpoint-sm: 30rem;   /* 480px, narrower than the v4 default */
  --breakpoint-md: 48rem;   /* 768px, same as default */
  --breakpoint-lg: 64rem;   /* 1024px, same as default */
  --breakpoint-xl: 80rem;   /* 1280px, same as default */
  --breakpoint-2xl: 96rem;  /* 1536px, same as default */
  --breakpoint-3xl: 120rem; /* 1920px — a brand-new breakpoint */
}
\`\`\`

Once \`--breakpoint-3xl\` is defined, \`3xl:\` immediately becomes a usable prefix everywhere in your markup, exactly like the built-in ones:

\`\`\`html
<div class="grid grid-cols-2 3xl:grid-cols-6">
  ...
</div>
\`\`\`

Because these are just CSS custom properties, you can also reference them directly in arbitrary values or your own CSS with \`theme(--breakpoint-lg)\`-style lookups, which keeps a single source of truth between your Tailwind classes and any hand-written CSS.

### max-width variants: max-md, max-lg, etc.

Every default breakpoint also has a \`max-*\` counterpart that generates a \`max-width\` media query instead of \`min-width\` — the inverse of the normal mobile-first prefixes. This is exactly the tool the previous lesson said you'd need for "hidden only in a specific range":

\`\`\`html
<!-- visible by default, hidden ONLY below the md breakpoint -->
<div class="max-md:hidden">
  Desktop-and-up only content
</div>
\`\`\`

| Class | Applies when |
|-------|--------------|
| \`max-sm:*\` | viewport \`< 40rem\` (640px) |
| \`max-md:*\` | viewport \`< 48rem\` (768px) |
| \`max-lg:*\` | viewport \`< 64rem\` (1024px) |
| \`md:*\` | viewport \`≥ 48rem\` |
| \`md:max-lg:*\` | viewport is \`≥ md\` **and** \`< lg\` — a true range |

That last row is the real payoff — stacking a \`min-width\` prefix with a \`max-width\` prefix gives you a genuine "only between these two breakpoints" range, without any extra CSS:

\`\`\`html
<div class="hidden md:max-lg:block">
  Visible only on tablet-sized viewports (md up to, but not including, lg)
</div>
\`\`\`

Use \`max-*\` sparingly, though — reaching for it constantly is often a sign you're thinking desktop-first again. It's the right tool for genuine exceptions (a banner that should disappear only in one specific range), not for your primary responsive layout logic.

### Container queries: responding to the parent, not the viewport

Viewport breakpoints have a real limitation: a component doesn't know how wide *it* is, only how wide the whole browser window is. A card component that looks great at three columns inside a full-width page might get crushed into an unreadable single column when the exact same component is dropped into a narrow sidebar — because the viewport is still "large," even though the card's actual available space isn't.

Tailwind v4 ships native **container queries** to solve this. First, mark an ancestor as a query container with \`@container\`:

\`\`\`html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded shadow">Card</div>
    <div class="bg-white p-4 rounded shadow">Card</div>
    <div class="bg-white p-4 rounded shadow">Card</div>
  </div>
</div>
\`\`\`

The \`@sm:\`/\`@md:\`/\`@lg:\` (note the leading \`@\`) variants behave just like \`sm:\`/\`md:\`/\`lg:\`, except they respond to the width of the nearest \`@container\` ancestor instead of the browser viewport. Drop that same markup into a 300px-wide sidebar or a 1200px-wide main column, and the grid genuinely adapts to *its own* available space either way — which is exactly the reusability viewport breakpoints can't give a component.

### Named containers for nested cases

If you have nested containers and a deeply-nested element needs to query a specific ancestor rather than its nearest one, name the container:

\`\`\`html
<div class="@container/main">
  <div class="@container/card">
    <div class="@lg/card:flex @lg/main:gap-8">
      ...
    </div>
  </div>
</div>
\`\`\`

\`@container/main\` and \`@container/card\` register two independently-named containers, and \`@lg/card:\` / \`@lg/main:\` each target a specific one by name — otherwise a variant always resolves against the *nearest* \`@container\` ancestor.

| Tool | Responds to | Best for |
|------|-------------|----------|
| \`sm:\`/\`md:\`/\`lg:\` (viewport) | browser window width | page-level layout |
| \`max-md:\` etc. | inverse viewport range | narrow exceptions/ranges |
| \`@container\` + \`@sm:\`/\`@md:\` | nearest container's width | reusable components used in varying contexts |

> **Key idea:** Customize the breakpoint scale in v4 with \`--breakpoint-*\` variables inside \`@theme\`, use \`max-*\` variants (or a stacked \`md:max-lg:\`) when you need an inverse or ranged condition, and reach for \`@container\`/\`@sm:\` container queries instead of viewport breakpoints whenever a component needs to adapt to its own box rather than the whole page.`,
    },
    {
      name: "Responsive Design Patterns",
      minutes: 9,
      intro: "Apply everything so far to real UI patterns: nav bars, scaling type, responsive images, and show/hide toggles.",
      content: `### Pattern 1: responsive navigation

The classic pattern — a hamburger button below a breakpoint, a full inline nav above it — is really just two elements with opposite \`hidden\`/\`flex\` toggles at the same breakpoint:

\`\`\`html
<nav class="flex items-center justify-between p-4">
  <span class="font-bold text-lg">Brand</span>

  <!-- full nav: hidden on mobile, visible from md up -->
  <ul class="hidden md:flex items-center gap-6">
    <li><a href="#" class="hover:text-blue-600">Product</a></li>
    <li><a href="#" class="hover:text-blue-600">Pricing</a></li>
    <li><a href="#" class="hover:text-blue-600">Docs</a></li>
    <li><a href="#" class="bg-blue-600 text-white px-4 py-2 rounded">Sign up</a></li>
  </ul>

  <!-- hamburger button: visible on mobile, hidden from md up -->
  <button class="md:hidden" aria-label="Open menu">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</nav>
\`\`\`

Both elements exist in the DOM at all times — Tailwind's \`hidden\`/\`md:flex\` and \`md:hidden\` just decide which one is actually rendered at a given width. Actually opening/closing the mobile menu itself (toggling a class or some state) needs a little JavaScript, but the *responsive switch* between hamburger and full nav is pure CSS.

### Pattern 2: responsive typography

Headings almost always need to be smaller on phones and larger on desktop, or they either overflow or look cartoonishly oversized. Stack \`text-*\` utilities across breakpoints the same way you would any other property:

\`\`\`html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
  Build faster with Tailwind
</h1>
<p class="text-base md:text-lg text-slate-600 mt-4">
  A responsive subheading that grows a little less aggressively than the heading.
</p>
\`\`\`

| Breakpoint | \`h1\` size | Roughly |
|------------|-----------|---------|
| base (phone) | \`text-2xl\` | 24px |
| \`sm:\` | \`text-3xl\` | 30px |
| \`md:\` | \`text-4xl\` | 36px |
| \`lg:\` | \`text-5xl\` | 48px |

A good rule of thumb: body text (\`<p>\`) usually only needs one, maybe two steps across the whole breakpoint range, while large display headings can reasonably jump three or four steps — the bigger the text, the more its size needs to be tamed on small screens.

### Pattern 3: responsive images and object-fit

Images need two separate concerns handled: making them *fluid* (never overflow their container) and controlling how they *crop* when their aspect ratio doesn't match their box.

\`\`\`html
<img
  src="/hero.jpg"
  alt="Product hero"
  class="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
/>
\`\`\`

- \`w-full\` makes the image fluid — it always fills its container's width instead of overflowing at its native pixel size.
- \`h-48 sm:h-64 md:h-80\` gives the image a fixed, growing height at each breakpoint — necessary because a fluid width alone would otherwise let the height balloon unpredictably based on the source image's aspect ratio.
- \`object-cover\` tells the browser to crop the image to fill that box without distorting it (same idea as \`background-size: cover\`), rather than squashing it.

| Class | \`object-fit\` value | Effect |
|-------|----------------------|--------|
| \`object-cover\` | \`cover\` | fills the box, cropping overflow, no distortion |
| \`object-contain\` | \`contain\` | fits entirely inside the box, may letterbox |
| \`object-fill\` | \`fill\` | stretches to fill exactly, can distort |
| \`object-none\` | \`none\` | ignores the box, shows at native size |
| \`object-scale-down\` | \`scale-down\` | like \`contain\`, but never scales up past native size |

\`object-cover\` is by far the most common choice for hero images, avatars, and card thumbnails, since distortion (\`object-fill\`) almost always looks wrong.

### Pattern 4: show/hide utilities

\`hidden\` sets \`display: none\`, and combined with a breakpoint prefix it becomes the core building block for "show this on some screens, not others." The two directions you'll write constantly:

\`\`\`html
<!-- hidden on mobile, appears from md up -->
<div class="hidden md:block">
  Desktop-only content (e.g. a sidebar)
</div>

<!-- visible on mobile, disappears from md up -->
<div class="md:hidden">
  Mobile-only content (e.g. the hamburger button)
</div>
\`\`\`

The display value you switch *to* doesn't have to be \`block\` — pick whatever the element actually needs, since \`hidden\`'s only job is removing it from layout entirely:

\`\`\`html
<div class="hidden md:flex items-center gap-2">...</div>   <!-- becomes a flex row -->
<div class="hidden md:grid grid-cols-2 gap-4">...</div>     <!-- becomes a grid -->
<div class="hidden lg:inline">...</div>                     <!-- becomes inline text -->
\`\`\`

A quick warning worth repeating from the mobile-first lesson: \`hidden\` alone (no prefix) hides an element at *every* size, since there's no larger breakpoint to override it back on. You always need the prefixed \`display\` utility (\`md:block\`, \`md:flex\`, ...) paired with the unprefixed \`hidden\` to get a clean toggle.

### Putting patterns together: a responsive card

\`\`\`html
<div class="bg-white rounded-lg shadow overflow-hidden">
  <img src="/card.jpg" alt="" class="w-full h-40 sm:h-48 object-cover" />
  <div class="p-4 sm:p-6">
    <h3 class="text-lg md:text-xl font-semibold">Card title</h3>
    <p class="text-sm md:text-base text-slate-600 mt-1">
      Supporting copy that stays readable at any width.
    </p>
    <div class="mt-4 hidden sm:flex items-center gap-2">
      <span class="text-xs bg-slate-100 px-2 py-1 rounded">Tag</span>
      <span class="text-xs bg-slate-100 px-2 py-1 rounded">Tag</span>
    </div>
  </div>
</div>
\`\`\`

Every technique from this module shows up here: a fluid, cropped image; type that scales down a notch on small screens; padding that tightens up on mobile; and a tag row that's simply omitted below \`sm\` rather than squeezed in.

> **Key idea:** Real responsive UI is built from a handful of repeating moves — toggle visibility with \`hidden\`/\`md:flex\`, scale type and spacing across breakpoints, keep images fluid with \`w-full\` + a fixed height + \`object-cover\`, and combine all three inside one component rather than treating "mobile" and "desktop" as separate designs.`,
    },
  ],
}
