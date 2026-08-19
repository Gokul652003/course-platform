import type { Module } from "../types"

export const tailwindModule3: Module = {
  id: 3,
  title: "Typography",
  status: "upcoming",
  lessons: [
    {
      name: "Font Family, Size & Weight",
      minutes: 9,
      intro: "Pick a typeface stack, move through the type scale, and dial in weight and italics.",
      content: `### The three built-in font families

Tailwind ships three font-family utilities out of the box, each backed by a sensible cross-platform stack rather than a single named font:

| Utility | Stack purpose |
|---------|---------------|
| \`font-sans\` | UI text — a system-first sans-serif stack (San Francisco, Segoe UI, Roboto, etc.) |
| \`font-serif\` | Long-form reading — a serif stack (Georgia, Cambria, Times New Roman, etc.) |
| \`font-mono\` | Code and tabular data — a monospace stack (ui-monospace, Menlo, Consolas, etc.) |

\`\`\`html
<p class="font-sans">This is the default UI typeface.</p>
<p class="font-serif">This reads a little more like a printed article.</p>
<code class="font-mono">const x = 1</code>
\`\`\`

\`font-sans\` is applied by Tailwind's preflight to the \`html\` element already, so most of the time you're only reaching for \`font-serif\` or \`font-mono\` to break out of the default.

### Customizing the font stacks (v4)

In Tailwind v4, theme values — including font families — live in CSS via the \`@theme\` directive instead of a \`tailwind.config.js\` object. Define your own stacks, or override the built-in ones, directly in your main stylesheet:

\`\`\`css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Clash Display", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
\`\`\`

Any \`--font-*\` variable you add becomes a new utility automatically — \`--font-display\` above gives you a \`font-display\` class for free, no separate config step needed. That's the core mental model shift in v4: the theme *is* the utility source.

\`\`\`html
<h1 class="font-display text-4xl">Landing page headline</h1>
\`\`\`

### The font-size scale

Tailwind's type scale runs from \`text-xs\` to \`text-9xl\`. Each step bundles a matching default \`line-height\`, so you rarely need to set size and leading separately:

| Utility | Font size | Default line-height |
|---------|-----------|----------------------|
| \`text-xs\` | 0.75rem (12px) | 1rem |
| \`text-sm\` | 0.875rem (14px) | 1.25rem |
| \`text-base\` | 1rem (16px) | 1.5rem |
| \`text-lg\` | 1.125rem (18px) | 1.75rem |
| \`text-xl\` | 1.25rem (20px) | 1.75rem |
| \`text-2xl\` | 1.5rem (24px) | 2rem |
| \`text-3xl\` | 1.875rem (30px) | 2.25rem |
| \`text-4xl\` | 2.25rem (36px) | 2.5rem |
| \`text-5xl\` | 3rem (48px) | 1 |
| \`text-6xl\` | 3.75rem (60px) | 1 |
| \`text-7xl\` | 4.5rem (72px) | 1 |
| \`text-8xl\` | 6rem (96px) | 1 |
| \`text-9xl\` | 8rem (128px) | 1 |

\`\`\`html
<p class="text-sm">Fine print</p>
<p class="text-base">Body copy — this is the baseline size.</p>
<h2 class="text-3xl">Section heading</h2>
<h1 class="text-6xl">Hero headline</h1>
\`\`\`

If you need a size the scale doesn't have, drop into an arbitrary value: \`text-[13px]\` or even \`text-[2.75rem]\`. You can also pair a size with a specific line-height in one utility using a slash: \`text-base/7\` sets \`font-size: 1rem\` with \`line-height: 1.75rem\`, overriding the paired default.

### Font weight

| Utility | Weight |
|---------|--------|
| \`font-thin\` | 100 |
| \`font-extralight\` | 200 |
| \`font-light\` | 300 |
| \`font-normal\` | 400 |
| \`font-medium\` | 500 |
| \`font-semibold\` | 600 |
| \`font-bold\` | 700 |
| \`font-extrabold\` | 800 |
| \`font-black\` | 900 |

\`\`\`html
<p class="font-normal">Regular body text.</p>
<p class="font-semibold">Slightly emphasized text.</p>
<p class="font-bold">Strongly emphasized text.</p>
\`\`\`

A weight utility only renders visually if the loaded font file actually ships that weight — a variable font like Inter will happily render all nine steps, but a font family loaded with only 400 and 700 weights will silently fall back to the nearest available weight in the browser.

### Italics

Two simple toggles, useful for overriding a parent's style or emphasizing inline text:

\`\`\`html
<p>Regular text with an <em class="italic">emphasized</em> word.</p>
<p class="italic">This entire block is italic.</p>
<p class="not-italic">Force upright text, e.g. inside an <cite> that defaults to italic.</p>
\`\`\`

\`not-italic\` matters more than it looks — some elements (\`<em>\`, \`<i>\`, \`<cite>\`) are italic by browser default, and \`not-italic\` is how you cancel that without touching the element choice.

### Putting it together

\`\`\`html
<article class="font-sans">
  <h1 class="text-4xl font-extrabold">Shipping Update</h1>
  <p class="text-sm font-medium text-gray-500">Posted 2 hours ago</p>
  <p class="text-base font-normal">
    We're rolling out the new dashboard to all
    <span class="font-semibold italic">Pro</span> accounts this week.
  </p>
</article>
\`\`\`

> **Key idea:** Font utilities compose independently — family, size, weight, and style are four separate decisions in Tailwind, not one combined "typography style" like you might set in a design tool. Reach for \`@theme\` variables once and every \`font-*\` utility you need falls out of it automatically.`,
    },
    {
      name: "Text Color, Alignment, Decoration & Spacing",
      minutes: 9,
      intro: "Color and align text, control underlines and strikethroughs, and fine-tune letter and line spacing.",
      content: `### Text color

\`text-{color}-{shade}\` sets \`color\`, pulling from the same palette as every other color utility in Tailwind:

\`\`\`html
<p class="text-gray-900">Primary body text</p>
<p class="text-gray-500">Secondary / muted text</p>
<p class="text-red-600">Error message</p>
<p class="text-blue-600">A link-styled span</p>
\`\`\`

Every color utility also accepts an opacity modifier with a slash, which is far more convenient than reaching for a separate opacity utility just for text:

\`\`\`html
<p class="text-blue-600/75">75% opacity blue</p>
<p class="text-black/50">50% opacity black — a common "muted" trick</p>
\`\`\`

### Text alignment

\`\`\`html
<p class="text-left">Left aligned (the default)</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified — stretches each line to fill the container width.</p>
\`\`\`

For layouts that need to support right-to-left languages, prefer the logical variants \`text-start\` and \`text-end\` over \`text-left\`/\`text-right\` — they flip automatically with the document's writing direction instead of always meaning "left."

### Text decoration

\`\`\`html
<a class="underline" href="#">Underlined link</a>
<p class="line-through">Discontinued item</p>
<s class="no-underline">Remove a browser-default underline</s>
<p class="overline">Rare, but available</p>
\`\`\`

Beyond the on/off toggles, Tailwind gives you fine control over the underline/strikethrough line itself:

| Category | Utilities |
|----------|-----------|
| Color | \`decoration-red-500\`, \`decoration-current\`, \`decoration-blue-500/50\` |
| Style | \`decoration-solid\`, \`decoration-dashed\`, \`decoration-dotted\`, \`decoration-double\`, \`decoration-wavy\` |
| Thickness | \`decoration-auto\`, \`decoration-0\`, \`decoration-1\`, \`decoration-2\`, \`decoration-4\`, \`decoration-8\` |
| Offset (gap from text) | \`underline-offset-auto\`, \`underline-offset-1\`, \`underline-offset-2\`, \`underline-offset-4\`, \`underline-offset-8\` |

\`\`\`html
<a class="underline decoration-blue-500 decoration-2 underline-offset-4 hover:decoration-4">
  A link with a colored, spaced-out underline that thickens on hover
</a>

<p class="line-through decoration-red-500 decoration-wavy">
  Wavy red strikethrough — handy for "flagged" content
</p>
\`\`\`

\`decoration-{color}\` only affects the line, not the text itself — that's what makes it possible to have blue link text with a red squiggly underline for a spell-check-style effect.

### Letter spacing (tracking)

\`\`\`html
<p class="tracking-tighter">Tighter letter spacing</p>
<p class="tracking-tight">Slightly tighter</p>
<p class="tracking-normal">Normal (default)</p>
<p class="tracking-wide">Slightly wider</p>
<p class="tracking-wider">Wider</p>
<p class="tracking-widest">Widest — common for small uppercase labels</p>
\`\`\`

A very common pairing is a wide-tracked, uppercase, small label:

\`\`\`html
<span class="text-xs font-semibold tracking-widest uppercase text-gray-500">
  New Feature
</span>
\`\`\`

### Line height (leading)

Named steps, unitless relative to the element's own font size:

| Utility | line-height |
|---------|-------------|
| \`leading-none\` | 1 |
| \`leading-tight\` | 1.25 |
| \`leading-snug\` | 1.375 |
| \`leading-normal\` | 1.5 |
| \`leading-relaxed\` | 1.625 |
| \`leading-loose\` | 2 |

There's also a fixed numeric scale (\`leading-3\` through \`leading-10\`, in \`0.25rem\` steps) and arbitrary values (\`leading-[1.4]\`, \`leading-[2.25rem]\`) for anything in between:

\`\`\`html
<h1 class="text-5xl leading-tight">
  A big headline that needs<br />tighter line spacing
</h1>
<p class="text-base leading-relaxed">
  Long-form paragraph copy reads more comfortably with a bit
  of extra line height, especially at narrower widths.
</p>
\`\`\`

### Wrapping utilities: text-wrap, text-balance, text-pretty

Newer Tailwind releases expose the CSS \`text-wrap\` property directly, which is particularly good for headlines and short blurbs:

| Utility | \`text-wrap\` value | Effect |
|---------|---------------------|--------|
| \`text-wrap\` | \`wrap\` | Default browser wrapping |
| \`text-nowrap\` | \`nowrap\` | Force a single line |
| \`text-balance\` | \`balance\` | Evens out line lengths — great for headings |
| \`text-pretty\` | \`pretty\` | Avoids a lone short word ("orphan") on the last line |

\`\`\`html
<h2 class="text-3xl font-bold text-balance">
  This headline wraps onto two lines of roughly equal length instead of one long line and one short one
</h2>

<p class="text-pretty">
  A longer paragraph that avoids leaving a single orphaned
  word dangling on its own final line.
</p>
\`\`\`

\`text-balance\` has a browser-enforced line-count limit (around 4-6 lines depending on the engine), so it's meant for headlines and short callouts, not full paragraphs — use \`text-pretty\` for body copy instead.

> **Key idea:** Color, alignment, decoration, tracking, and leading are all independent axes — combine them freely, and reach for \`text-balance\`/\`text-pretty\` before you reach for manual \`<br>\` tags to fix awkward text wrapping.`,
    },
    {
      name: "Lists, Truncation & the Typography Plugin",
      minutes: 10,
      intro: "Style HTML lists, cut off overflowing text cleanly, and style raw markdown with the prose classes.",
      content: `### List style type

By default, Tailwind's preflight strips list markers and padding from \`<ul>\` and \`<ol>\`. To bring markers back deliberately, use the \`list-*\` utilities:

\`\`\`html
<ul class="list-disc list-inside">
  <li>First item</li>
  <li>Second item</li>
</ul>

<ol class="list-decimal list-inside">
  <li>Step one</li>
  <li>Step two</li>
</ol>

<ul class="list-none">
  <li>No marker at all — common for nav lists</li>
</ul>
\`\`\`

| Utility | Effect |
|---------|--------|
| \`list-disc\` | Filled circle bullets |
| \`list-decimal\` | Numbered (1, 2, 3…) |
| \`list-none\` | No marker |
| \`list-inside\` | Marker sits inside the content box — text wraps under the marker's indent |
| \`list-outside\` | Marker sits outside the content box — wrapped text aligns with the first line, not the marker |

\`list-outside\` generally looks more polished for multi-line list items since wrapped lines align with the text rather than hanging under the bullet:

\`\`\`html
<ul class="list-disc list-outside ml-5 space-y-2">
  <li>A longer list item whose text wraps onto a second line and stays aligned with the first line instead of the marker.</li>
  <li>Another item</li>
</ul>
\`\`\`

Note \`list-outside\` needs some margin/padding on the list itself (\`ml-5\` above) or the markers get clipped off the edge of the container.

### Truncating single-line text

\`truncate\` is shorthand for three properties working together — \`overflow: hidden\`, \`text-overflow: ellipsis\`, and \`white-space: nowrap\`:

\`\`\`html
<p class="truncate w-48">
  This sentence is way too long to fit and gets cut off with an ellipsis
</p>
\`\`\`

\`truncate\` only works on a block-level element with a constrained width — without \`w-48\` (or a flex/grid context that constrains it) there's nothing to overflow against.

### Clamping to multiple lines

\`line-clamp-*\` extends the same idea to a fixed number of lines instead of one:

\`\`\`html
<p class="line-clamp-3">
  A longer piece of body copy — a card description, a comment,
  an excerpt — that gets cut off after exactly three lines
  regardless of how much text is actually in it, with a trailing
  ellipsis appended automatically by the browser.
</p>

<p class="line-clamp-none">Remove a clamp applied at a smaller breakpoint</p>
\`\`\`

\`line-clamp-{n}\` is available for \`n\` from 1 to 6 by default. It's implemented with the \`-webkit-line-clamp\` property plus \`display: -webkit-box\`, which has full support across current browsers despite the \`-webkit-\` prefix. It's the standard tool for card grids and comment previews where every card needs the same height.

\`\`\`html
<div class="grid grid-cols-3 gap-4">
  <div class="rounded-lg border p-4">
    <h3 class="font-semibold">Card title</h3>
    <p class="line-clamp-2 text-sm text-gray-600">
      Excerpt text that will be clamped to exactly two lines so
      every card in the grid stays the same height no matter
      how long the underlying content is.
    </p>
  </div>
</div>
\`\`\`

### Styling raw HTML with @tailwindcss/typography

Tailwind's utility classes are great when you control the markup, but markdown-rendered blog posts or CMS content produce raw \`<h1>\`, \`<p>\`, \`<ul>\`, \`<blockquote>\`, etc. with no classes on them at all — and preflight has stripped all their default styling. The official **typography plugin** solves exactly this by giving you one class, \`prose\`, that styles everything inside it.

**Install:**

\`\`\`bash
npm install -D @tailwindcss/typography
\`\`\`

**Enable it** — in Tailwind v4, plugins are registered in CSS with \`@plugin\` instead of a \`plugins\` array in a config file:

\`\`\`css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
\`\`\`

**Use it** by wrapping a block of unstyled HTML (or a markdown-rendered container) in \`prose\`:

\`\`\`html
<article class="prose">
  <h1>Article Title</h1>
  <p>Lead paragraph explaining what this post is about...</p>
  <h2>A subheading</h2>
  <p>More body copy, with a <a href="#">link</a> and some
  <strong>bold text</strong> mixed in.</p>
  <ul>
    <li>Point one</li>
    <li>Point two</li>
  </ul>
  <blockquote>A pull quote styled automatically.</blockquote>
</article>
\`\`\`

Every heading level, paragraph, list, blockquote, code block, table, and link inside \`.prose\` gets sensible, professionally-set typographic styles — spacing, sizing, color contrast — without you writing a single utility class on the inner elements.

### Sizing the prose block

\`\`\`html
<article class="prose prose-sm">Compact — good for sidebars</article>
<article class="prose">Default size</article>
<article class="prose prose-lg">Larger — good for a focused reading page</article>
<article class="prose prose-xl">Larger still</article>
<article class="prose prose-2xl">Largest preset</article>
\`\`\`

### Dark mode with prose-invert

\`prose\` assumes a light background by default. Add \`prose-invert\` alongside a \`dark:\` variant to flip every color inside the block for dark backgrounds:

\`\`\`html
<article class="prose dark:prose-invert">
  <h1>This heading is dark text on light mode...</h1>
  <p>...and light text on dark mode, automatically.</p>
</article>
\`\`\`

### Customizing prose colors

You rarely want to fight the plugin's defaults with manual overrides on inner elements — instead, target the specific element groups the plugin exposes as modifiers:

\`\`\`html
<article class="prose prose-headings:text-indigo-700 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:text-pink-600">
  <h2>Custom-colored heading</h2>
  <p>Text with a <a href="#">custom-colored link</a> and
  <code>custom-colored inline code</code>.</p>
</article>
\`\`\`

For a full custom palette, you can also override the CSS variables the plugin reads from, scoped to your own theme:

\`\`\`css
@theme {
  --color-gray-700: oklch(0.35 0.02 260); /* shifts prose body text globally */
}
\`\`\`

> **Key idea:** Reach for \`list-*\`, \`truncate\`, and \`line-clamp-*\` when you control the markup and just need overflow behavior; reach for \`@tailwindcss/typography\`'s \`prose\` class the moment you're rendering markdown or CMS HTML you don't control element-by-element.`,
    },
  ],
}
