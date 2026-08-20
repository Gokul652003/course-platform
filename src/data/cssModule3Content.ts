import type { Module } from "../types"

export const cssModule3: Module = {
  id: 3,
  title: "Colors, Units & Typography",
  status: "upcoming",
  lessons: [
    {
      name: "Color in CSS",
      minutes: 11,
      intro: "Every way to write a color in CSS — hex, rgb(), hsl(), the newer oklch() — plus currentColor, alpha, and named colors.",
      content: `## Why there are so many ways to write a color

CSS has accumulated color syntaxes over almost three decades, and unlike some redundant CSS features, most of them are still genuinely useful today rather than legacy cruft. Picking the right one is about which mental model — red/green/blue, hue/saturation/lightness, or perceptual lightness — fits the problem you're solving.

### Hex colors

**Hex** notation packs red, green, and blue into a 6-digit (or 3-digit shorthand) base-16 number prefixed with \`#\`:

\`\`\`css
.box {
  background-color: #1e3a8a;   /* a dark blue */
  border-color: #fff;          /* shorthand for #ffffff */
}
\`\`\`

Each pair of digits is one channel: \`#RRGGBB\`. \`#1e3a8a\` is red \`0x1e\` (30), green \`0x3a\` (58), blue \`0x8a\` (138). The 3-digit shorthand (\`#fff\`) duplicates each digit, so \`#fff\` means \`#ffffff\` and \`#0a3\` means \`#00aa33\`.

Hex also supports an **alpha channel** as an optional 4th (or 8th, for full form) pair of digits:

\`\`\`css
.overlay {
  background-color: #00000080; /* black at 50% opacity */
}
\`\`\`

Hex is compact and copy-pastes cleanly from design tools (Figma, browser DevTools eyedroppers), which is why it dominates in practice — but the digits are opaque to read. Nobody can look at \`#1e3a8a\` and know it's "a fairly dark, moderately saturated blue" without a tool.

### rgb() and rgba()

\`rgb()\` writes the same red/green/blue model out as numbers, which is more legible:

\`\`\`css
.box {
  color: rgb(30, 58, 138);
  background-color: rgb(30 58 138 / 50%); /* modern space-separated + alpha */
}
\`\`\`

Historically, \`rgb()\` took 0–255 integers and \`rgba()\` was a separate function that added a 4th alpha argument (0 to 1) separated by commas: \`rgba(30, 58, 138, 0.5)\`. **As of CSS Color Module Level 4, \`rgb()\` and \`rgba()\` are aliases of each other** — either name accepts an optional alpha, and the modern syntax uses spaces between channels and a slash before alpha:

\`\`\`css
/* legacy comma syntax — still works, still extremely common */
background: rgba(30, 58, 138, 0.5);

/* modern space syntax — same result */
background: rgb(30 58 138 / 50%);
\`\`\`

Both are valid in every current browser. New code tends to prefer the space syntax since it's shared across every color function (see \`hsl()\` below), but you'll see the comma form constantly in existing codebases — recognize both.

### hsl() and hsla()

\`hsl()\` describes a color by **hue** (0–360, a position on the color wheel), **saturation** (0–100%, how vivid vs. gray), and **lightness** (0–100%, how close to black or white):

\`\`\`css
.brand {
  color: hsl(217 91% 33%);        /* modern syntax */
  background: hsla(217, 91%, 33%, 0.5); /* legacy alpha syntax */
}
\`\`\`

This is the model most people find genuinely easier to *reason about* than RGB, because the three axes map to real design questions: "same hue, but lighter" is just bumping the lightness percentage — no need to recompute three channel numbers. Building a color scale (e.g. 5 shades of a brand blue for hover/active/disabled states) is far more natural in HSL than RGB, since you hold hue and saturation constant and only vary lightness:

\`\`\`css
:root {
  --brand-h: 217;
  --brand-s: 91%;
  --brand-100: hsl(var(--brand-h) var(--brand-s) 95%);
  --brand-500: hsl(var(--brand-h) var(--brand-s) 55%);
  --brand-900: hsl(var(--brand-h) var(--brand-s) 20%);
}
\`\`\`

### The modern functions: oklch() and oklab()

Both RGB and HSL share a subtle flaw: they're **not perceptually uniform**. If you take two HSL colors with the same lightness value but different hues, they frequently don't *look* equally light to the human eye — pure yellow at \`hsl(60 100% 50%)\` looks dramatically brighter than pure blue at \`hsl(240 100% 50%)\` even though both claim "50% lightness." This makes building a fair, evenly-stepped color scale across hues genuinely hard in HSL.

**\`oklch()\`** (and its Cartesian sibling \`oklab()\`) is a newer color space designed to fix exactly this: it's **perceptually uniform**, meaning equal changes in its lightness value produce equal *perceived* brightness changes, regardless of hue. It takes three values — Lightness (0 to 1, or as a percentage), Chroma (roughly 0 to 0.4, how saturated), and Hue (0–360):

\`\`\`css
.brand {
  background: oklch(55% 0.18 250); /* a blue, similar territory to the hsl() example */
}

:root {
  /* an evenly-stepped scale — because lightness is perceptually uniform,
     these steps actually LOOK evenly spaced, unlike an hsl() equivalent */
  --brand-100: oklch(95% 0.05 250);
  --brand-500: oklch(55% 0.18 250);
  --brand-900: oklch(25% 0.10 250);
}
\`\`\`

\`oklch()\` also covers a **wider gamut** than sRGB (the color space hex/rgb/hsl are limited to), so it can express more vivid colors on displays that support it (P3 and beyond), while gracefully falling back on older screens. Tools like Tailwind CSS v4's default palette and many modern design systems have switched their internal color scales to OKLCH specifically because the generated shades look consistent across every hue, instead of some hues appearing accidentally lighter or more saturated than others at the "same" lightness.

You don't need to hand-author OKLCH values often — reach for a color picker that outputs it — but recognizing it and knowing *why* it exists (perceptual uniformity, wider gamut) matters, because it's increasingly the default in generated design tokens.

### currentColor

\`currentColor\` is a special keyword, not a fixed color — it always resolves to the element's own computed \`color\` value. This makes it useful anywhere you want a property to automatically track text color without repeating a value:

\`\`\`css
.icon-button {
  color: #1e3a8a;
  border: 1px solid currentColor; /* border matches text color, automatically */
}

.icon-button svg {
  fill: currentColor; /* SVG icon inherits the same color as the surrounding text */
}
\`\`\`

Change \`.icon-button\`'s \`color\` once (e.g. on \`:hover\` or a theme variant) and the border and icon fill update with it — no need to touch three properties in sync. \`currentColor\` is also the **default** value for \`border-color\` when you set \`border-width\`/\`border-style\` without specifying a color, which is a common source of "why is my border black by default" confusion — it isn't black, it's inheriting text color, which is usually black.

### Alpha/opacity as a property vs. an alpha channel on the color

These solve similar-looking problems very differently:

\`\`\`css
/* opacity: affects the ENTIRE element and everything inside it */
.a {
  opacity: 0.5; /* text, background, border, children — all faded together */
}

/* alpha channel: affects only that one color value */
.b {
  background: rgb(30 58 138 / 50%); /* only the background is translucent */
  color: #000; /* text stays fully opaque */
}
\`\`\`

\`opacity\` is a separate CSS property applied to the whole rendered element (and its descendants) as a post-processing step — it also creates a new **stacking context**, which affects how \`z-index\` behaves on children. An alpha channel baked into a specific color value (the 4th argument/digit-pair in \`rgb()\`/\`hsl()\`/\`oklch()\`/hex) only fades *that property*, leaving everything else on the element fully opaque. In practice: use a color's alpha channel when you want one thing translucent (a background overlay, a subtle border), and reach for \`opacity\` only when you actually want the whole element — including its children — to fade as a unit (e.g. a disabled button, a fade-out animation).

### Named colors and transparent

CSS defines 148 **named colors** you can use directly, no function needed — things like \`red\`, \`rebeccapurple\`, \`cornflowerblue\`, and \`papayawhip\`:

\`\`\`css
.warning {
  background: gold;
  color: black;
}
\`\`\`

They're handy for quick prototyping and a small set (\`black\`, \`white\`, \`red\`, \`transparent\`) show up in real production CSS too, but most projects move to hex/hsl/oklch once they need an actual design system, since named colors can't be scaled or varied programmatically.

\`transparent\` deserves a special mention: it's technically shorthand for \`rgb(0 0 0 / 0)\` — fully transparent black — and is the initial value of \`background-color\`. It's commonly used to reserve a border's space without showing it (\`border: 2px solid transparent\`), which avoids the layout shift that adding a border later (or on \`:hover\`) would otherwise cause.

## Choosing a color function

| Function | Best for | Alpha support |
|---|---|---|
| \`#hex\` | Copy-pasting from design tools, compact literals | Yes (\`#RRGGBBAA\`) |
| \`rgb()\` | When you're already thinking in red/green/blue (e.g. from an image picker) | Yes |
| \`hsl()\` | Building tints/shades by hand, quick "make it lighter/darker" tweaks | Yes |
| \`oklch()\`/\`oklab()\` | Design-token color scales, perceptually even palettes, wide-gamut color | Yes |
| Named colors | Prototyping, a handful of universal values like \`transparent\` | No (except \`transparent\`) |
| \`currentColor\` | Syncing a property to the element's own text color | Inherits alpha of \`color\` |

> **Key idea:** hex/rgb()/hsl() all encode the same information different ways and are freely interchangeable; oklch() exists because it's perceptually uniform and wide-gamut, which makes it the better choice specifically for generating scales and design tokens, while currentColor and alpha channels solve the narrower problems of "track this element's text color" and "fade just this one value" respectively.`,
    },
    {
      name: "Units — Absolute vs Relative",
      minutes: 12,
      intro: "px, %, em, rem, the viewport units, and ch — what each is relative to, and a table for when to reach for which.",
      content: `## Absolute vs relative, and why it matters

CSS units split into two families. **Absolute** units always resolve to the same physical size regardless of context. **Relative** units resolve based on *something else* — a parent's font size, the root font size, the viewport size — which means the same declaration can compute to a different pixel value depending on where it's used. Understanding which family a unit belongs to, and what it's relative *to*, is the difference between layouts that scale predictably and ones that break the moment a user changes their browser's font size or resizes a window.

### px — the one common absolute unit

\`px\` (pixels) is technically a **CSS pixel**, not a literal hardware pixel — on high-DPI ("Retina") screens, one CSS pixel maps to multiple physical device pixels, handled transparently by the browser. For CSS's purposes, treat \`px\` as a fixed, absolute unit: \`16px\` is always \`16px\`, regardless of parent elements, root font size, or viewport size.

\`\`\`css
.card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
\`\`\`

\`px\` is predictable and easy to reason about, which is exactly why it's still everywhere — for borders, box-shadow offsets, and other detail-level sizing, an absolute unit is often exactly what you want. Its weakness shows up specifically with **text**: font sizes fixed in \`px\` don't respond when a user increases their browser's default font size in accessibility settings, which \`rem\`-based sizing does respect (more below).

CSS technically defines other absolute units too — \`pt\`, \`cm\`, \`mm\`, \`in\` — but these are vestiges of print CSS and essentially never appear in screen-targeted stylesheets.

### % — relative to a containing property

Percentages are always relative to *some other value*, and critically, **which value depends on the property**:

\`\`\`css
.child {
  width: 50%;   /* 50% of the parent's content-box width */
  height: 100%; /* 50% of the parent's content-box height — but ONLY if the parent has an explicit height */
  font-size: 120%; /* 120% of the INHERITED font-size, not the parent element's box size */
}
\`\`\`

\`width\`/\`height\` percentages resolve against the parent's box; \`font-size\`/\`line-height\` percentages resolve against the inherited font size (functionally very similar to \`em\`, covered next); \`top\`/\`bottom\`/\`left\`/\`right\` on a positioned element resolve against the *positioning context's* padding box. There's no single rule — you have to know each property's specific percentage base, which is one of the more error-prone corners of CSS. A common gotcha: giving a child \`height: 100%\` does nothing if the parent's height is \`auto\` (i.e., sized by its content), because there's no explicit parent height to be a percentage *of*.

### em — relative to the parent's (or own) font-size

\`em\` is relative to a font size — but *which* font size depends on the property it's used on:

- On \`font-size\` itself, \`em\` is relative to the **parent's** computed font size.
- On any other property (\`padding\`, \`margin\`, \`width\`, etc.), \`em\` is relative to the **element's own** computed font size.

\`\`\`css
.parent {
  font-size: 20px;
}
.child {
  font-size: 1.5em;  /* 1.5 * 20px = 30px */
  padding: 1em;      /* 1 * 30px (child's OWN font-size) = 30px */
}
\`\`\`

### The compounding gotcha

Because \`em\` on \`font-size\` is relative to the *parent*, nested elements that each set \`font-size\` in \`em\` **compound** — each level multiplies against the last, which snowballs fast and unpredictably:

\`\`\`css
/* if every level of nesting uses font-size: 1.2em... */
.a { font-size: 1.2em; } /* 1.2 * 16px (default) = 19.2px */
.a .b { font-size: 1.2em; } /* 1.2 * 19.2px = 23.04px */
.a .b .c { font-size: 1.2em; } /* 1.2 * 23.04px = 27.65px */
\`\`\`

Three levels of "just slightly bigger" text quietly turns into text 73% larger than the base size, purely because each \`em\` compounded on the last. This is exactly the failure mode \`rem\` was introduced to solve.

\`em\` is still genuinely useful for sizing things that should scale *with their own element's* font size specifically — icon sizing next to text, or padding on a button that should grow proportionally if the button's font size changes — because there it's a deliberate, one-level relationship rather than an accumulating chain.

### rem — relative to the root, and why it's usually preferred for font-size

\`rem\` ("root em") is always relative to the \`<html>\` element's font-size — full stop, no matter how deeply nested the element using it is:

\`\`\`css
html {
  font-size: 16px; /* the browser default, rarely needs overriding */
}

.a { font-size: 1.2rem; }       /* 19.2px */
.a .b { font-size: 1.2rem; }    /* still 19.2px — no compounding */
.a .b .c { font-size: 1.2rem; } /* still 19.2px */
\`\`\`

Because every \`rem\` value reads from the same fixed root, nesting never compounds it. This predictability is why \`rem\` is the default recommendation for font sizes (and increasingly, for spacing too — Tailwind's entire spacing scale is \`rem\`-based) in modern CSS: a value like \`1.5rem\` means the same thing everywhere in the document, regardless of what it's nested inside.

\`rem\` also respects a user's browser-level font size preference (accessibility settings that bump the default away from 16px), the same way \`em\` does — both scale with user preferences, unlike \`px\`, which is one of the strongest reasons to prefer either over \`px\` for text.

### Viewport units: vw, vh, vmin, vmax

These are relative to the **browser viewport's** dimensions, not any element:

\`\`\`css
.hero {
  width: 100vw;         /* 100% of viewport width */
  height: 100vh;         /* 100% of viewport height */
  font-size: 5vmin;      /* 5% of whichever is SMALLER: viewport width or height */
  padding: 2vmax;        /* 2% of whichever is LARGER: viewport width or height */
}
\`\`\`

\`1vw\` = 1% of viewport width, \`1vh\` = 1% of viewport height. \`vmin\`/\`vmax\` pick the smaller/larger of the two, which is particularly handy for things that need to fit regardless of orientation — a value in \`vmin\` guarantees it never overflows whichever dimension happens to be the constrained one, useful for elements like a square logo that must always fit within the shorter viewport axis whether the device is in portrait or landscape.

One well-known pitfall: on mobile browsers, \`100vh\` historically included space that gets covered by the address bar as it appears/disappears while scrolling, causing content to be clipped or a page to jump. Modern CSS added \`svh\` (small viewport height), \`lvh\` (large viewport height), and \`dvh\` (dynamic viewport height, which tracks the address bar in real time) specifically to address this — \`100dvh\` is now the more reliable choice for "fill the visible screen" on mobile than plain \`100vh\`.

Viewport units also see heavy use in modern **fluid typography**, often paired with \`clamp()\` to interpolate a font size between a minimum and maximum bound as the viewport resizes:

\`\`\`css
h1 {
  /* never smaller than 1.75rem, never larger than 3rem,
     scales fluidly with viewport width in between */
  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
}
\`\`\`

### ch — relative to character width

\`ch\` is relative to the width of the \`"0"\` (zero) character in the element's current font. It's a niche unit with one excellent use case: constraining line length for readable text, or sizing something that should hold a specific number of monospace characters:

\`\`\`css
p {
  max-width: 65ch; /* roughly 65 characters per line — the classic readable-text target */
}

input[type="text"].zip-code {
  width: 8ch; /* just wide enough for 8 characters */
}
\`\`\`

Typography research generally puts comfortable line length at 45–75 characters; \`ch\` lets you express that constraint directly in the unit that matters, rather than guessing at a pixel width that happens to produce roughly the right character count for one specific font.

## When to use each unit

| Unit | Relative to | Best for |
|---|---|---|
| \`px\` | Nothing (absolute) | Borders, shadows, fine detail sizing — not font-size |
| \`%\` | Depends on property (parent box, inherited font-size, etc.) | Fluid widths/heights within a known container |
| \`em\` | Parent font-size (on \`font-size\`) or own font-size (elsewhere) | Sizing tied to one element's own type size (icon next to text, padding on a button) |
| \`rem\` | Root (\`html\`) font-size | Font sizes and spacing, project-wide — the default choice |
| \`vw\`/\`vh\` | Viewport width/height | Full-bleed sections, fluid typography with \`clamp()\` |
| \`vmin\`/\`vmax\` | Smaller/larger viewport dimension | Elements that must fit regardless of orientation |
| \`ch\` | Width of the \`"0"\` glyph | Readable text line length, fixed-character-count inputs |

> **Key idea:** reach for \`rem\` as the default for font-size and spacing because it never compounds and respects user font-size preferences, use \`px\` for details that genuinely shouldn't scale, and treat \`%\`/\`em\`/viewport units as deliberate choices for the specific relationship they express rather than defaults.`,
    },
    {
      name: "Typography",
      minutes: 13,
      intro: "Font stacks, loading web fonts with @font-face, sizing and weight, line-height, spacing, and text transforms.",
      content: `## font-family and fallback stacks

\`font-family\` accepts a comma-separated **stack** — the browser tries each name in order and uses the first one actually installed or loaded, falling back down the list:

\`\`\`css
body {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
}
\`\`\`

The last entry in a well-written stack should always be a **generic family** — a keyword the browser guarantees it can resolve to *some* installed font, even if every named font fails to load. CSS defines several generic families:

| Generic family | Typical look |
|---|---|
| \`serif\` | Small decorative strokes at the ends of letters (Times New Roman-like) |
| \`sans-serif\` | No decorative strokes, cleaner/more geometric (Arial/Helvetica-like) |
| \`monospace\` | Every character the same width (code, terminals) |
| \`cursive\` | Handwriting/script-like |
| \`fantasy\` | Decorative, display-oriented |
| \`system-ui\` | The operating system's own default UI font |

\`system-ui\` deserves special mention — it resolves to whatever font the user's OS uses for its own interface (San Francisco on macOS/iOS, Segoe UI on Windows, Roboto on Android), which gives an app a native, platform-appropriate feel for free and with zero loading cost, since it's always already installed:

\`\`\`css
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
\`\`\`

Font names with spaces must be quoted (\`"Helvetica Neue"\`); single-word names don't strictly require quotes but quoting consistently is harmless and reads more clearly.

## @font-face and loading web fonts

To use a custom font that isn't preinstalled on a user's device, declare it with \`@font-face\`, pointing at a font file, then reference that name in \`font-family\` like any other:

\`\`\`css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-variable.woff2") format("woff2");
  font-weight: 100 900; /* variable font — supports the whole weight range */
  font-style: normal;
  font-display: swap;
}

body {
  font-family: "Inter", sans-serif;
}
\`\`\`

\`.woff2\` is the standard modern web font format — smaller and more efficient than older formats like \`.woff\`, \`.ttf\`, or \`.eot\` (those older formats existed mainly for legacy browser compatibility and can generally be skipped in a modern-only setup). A single \`@font-face\` block with a **variable font** file and a \`font-weight\` range (like \`100 900\` above) can cover every weight from Thin to Black from one file, instead of needing a separate \`@font-face\` block per weight.

### font-display

\`font-display\` controls what happens to text **while** the custom font file is still downloading — a real concern since a web font is a network request that might take a noticeable moment. The options trade off differently between avoiding invisible text and avoiding a visual "flash" as the font swaps in:

- \`swap\` (most common default): show fallback text immediately, swap to the custom font whenever it finishes loading, even if that's late. Fast to show *something*, but the swap can cause a visible layout jump if the fonts have different metrics.
- \`block\`: hide text briefly (typically up to ~3s) waiting for the font, then fall back if it's still not ready. Avoids the flash at the cost of briefly invisible text.
- \`fallback\`: a middle ground — a very short invisible period, then fallback text, with a limited window to still swap to the custom font if it arrives soon.
- \`optional\`: like \`fallback\`, but gives the browser permission to skip the custom font entirely if it doesn't already have it cached — best for "nice to have" decorative type where a layout jump is worse than not using the font at all.

For most body text, \`swap\` is the safe default: text is never invisible, and modern browsers optimize the metrics mismatch reasonably well.

## font-size, font-weight, font-style

\`\`\`css
h1 {
  font-size: 2.5rem;
  font-weight: 700;   /* or: bold */
  font-style: normal; /* or: italic / oblique */
}
\`\`\`

\`font-weight\` accepts numeric values from 1–1000 in practice, though the traditional named stops (\`100\` Thin, \`400\` Normal, \`700\` Bold, \`900\` Black) are what most non-variable fonts actually ship. Requesting a weight a loaded font file doesn't have causes the browser to **synthesize** a fake bold/italic by algorithmically skewing or thickening the real glyphs — this tends to look visibly worse than a genuine designed weight, so matching \`font-weight\` to weights the font file actually provides matters more than it might seem.

## line-height — unitless vs. unit, and why unitless wins

\`line-height\` sets the height of each line box, and it's one of the few properties where a **unitless number** is the recommended value, specifically because of how inheritance interacts with it:

\`\`\`css
body {
  line-height: 1.5; /* unitless: 1.5 * THIS element's own font-size */
}

.small-print {
  font-size: 0.75rem;
  /* line-height inherited as the RATIO 1.5, recomputed against 0.75rem
     → still proportionally correct, no override needed */
}
\`\`\`

A unitless \`line-height\` is inherited as a **ratio**, and every descendant recomputes it against its *own* font-size. A \`line-height\` set with a fixed unit (\`24px\`, \`1.5em\` on line-height computed at the parent) is instead inherited as that already-computed pixel value — meaning a child with a smaller font-size than its parent can inherit a line-height that's now disproportionately large for its own text, cramped or overly loose depending on direction:

\`\`\`css
/* the problematic version */
body {
  font-size: 16px;
  line-height: 24px; /* computed once, as a fixed px value */
}
.small-print {
  font-size: 12px;
  /* inherits the literal 24px — way too loose for 12px text,
     because it did NOT recompute against the smaller font-size */
}
\`\`\`

This is exactly why style guides near-universally recommend a bare unitless number like \`1.5\` for \`line-height\`: it stays proportionally correct through inheritance automatically, at every nested font-size, without needing to be reset at each level.

## letter-spacing and word-spacing

\`\`\`css
.eyebrow {
  letter-spacing: 0.08em; /* tracking OUT — common for small uppercase labels */
}
.tight-heading {
  letter-spacing: -0.02em; /* tracking IN — common for large display headings */
}
p {
  word-spacing: 0.05em; /* extra space between words, rarely needed */
}
\`\`\`

\`letter-spacing\` (often called "tracking" in design tools) adjusts space between individual characters; \`word-spacing\` adjusts space between words specifically. Both are typically set in \`em\` so the spacing scales with the element's own font-size rather than staying a fixed pixel gap regardless of type size. Small positive \`letter-spacing\` is common on small uppercase text (it improves legibility at small sizes), while large display headings often get a small *negative* value to tighten visually loose spacing that large type naturally has.

## text-align, text-decoration, text-transform

\`\`\`css
.center { text-align: center; }
.link { text-decoration: underline; }
.no-link-underline { text-decoration: none; }
.label { text-transform: uppercase; }
\`\`\`

\`text-align\` (\`left\`/\`right\`/\`center\`/\`justify\`/\`start\`/\`end\`) positions inline content within its container — note \`start\`/\`end\` are the logical, writing-direction-aware equivalents of \`left\`/\`right\`, worth preferring if the project needs to support right-to-left languages. \`text-decoration\` is a shorthand covering line (\`underline\`/\`overline\`/\`line-through\`/\`none\`), color, and style (\`solid\`/\`wavy\`/\`dotted\`) — \`text-decoration: underline wavy red\` is valid shorthand for a wavy red underline, handy for things like spell-check-style annotations. \`text-transform\` (\`uppercase\`/\`lowercase\`/\`capitalize\`/\`none\`) changes display casing **without touching the underlying text content** — important for accessibility and copy-paste, since screen readers and clipboard copies still get the original casing from the HTML/DOM, only the visual rendering changes.

## white-space

\`white-space\` controls how whitespace characters (spaces, tabs, newlines) in the source and text wrapping are handled:

\`\`\`css
.normal { white-space: normal; }    /* default: collapse whitespace, wrap as needed */
.nowrap { white-space: nowrap; }    /* collapse whitespace, but NEVER wrap to a new line */
.pre { white-space: pre; }          /* preserve whitespace exactly, don't wrap */
.pre-wrap { white-space: pre-wrap; } /* preserve whitespace exactly, DO wrap */
\`\`\`

The default, \`normal\`, collapses any run of whitespace in the HTML source down to a single space and wraps text freely at the container edge — this is why writing multiple spaces or newlines inside HTML text has no visible effect unless you change \`white-space\`. \`nowrap\` is common on things like a table cell or button label that must never break across two lines, often combined with \`text-overflow: ellipsis\` and \`overflow: hidden\` to truncate instead. \`pre\` (used implicitly by the \`<pre>\` element) preserves source formatting exactly — useful for displaying code — while \`pre-wrap\` does the same but still allows normal line wrapping, a good fit for user-submitted text where you want to respect the newlines they typed without letting a single long line overflow the container.

> **Key idea:** build font stacks that end in a generic family so a font failure never leaves text unstyled, load custom fonts with \`@font-face\` and \`font-display: swap\` to avoid invisible text, and default to a unitless \`line-height\` since it recomputes correctly against each descendant's own font-size instead of freezing a mismatched fixed value through inheritance.`,
    },
  ],
}
