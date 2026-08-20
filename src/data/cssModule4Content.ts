import type { Module } from "../types"

export const cssModule4: Module = {
  id: 4,
  title: "Backgrounds, Borders & Shadows",
  status: "upcoming",
  lessons: [
    {
      name: "Backgrounds",
      minutes: 12,
      intro: "Master every background-* property — color, image, position, sizing, repeat, attachment — plus the shorthand pitfalls and how to layer multiple backgrounds on one element.",
      content: `## The background properties, as a family

Every element in CSS has a background — by default it's transparent, but a whole family of \`background-*\` properties lets you control exactly what fills the box behind its content. These properties are independent of each other (each has its own initial value), and they can also be combined into the single \`background\` shorthand — which is convenient, but has a sharp edge covered later in this lesson.

The individual longhand properties are:

| Property | Controls | Common values |
|---|---|---|
| \`background-color\` | Solid fill color | \`transparent\`, hex, \`rgb()\`, \`oklch()\` |
| \`background-image\` | One or more images/gradients | \`url(...)\`, \`linear-gradient(...)\`, \`none\` |
| \`background-position\` | Where the image starts | \`center\`, \`top right\`, \`50% 50%\` |
| \`background-size\` | How large the image renders | \`cover\`, \`contain\`, \`200px auto\` |
| \`background-repeat\` | Whether/how it tiles | \`repeat\`, \`no-repeat\`, \`repeat-x\` |
| \`background-attachment\` | Whether it scrolls with content | \`scroll\`, \`fixed\`, \`local\` |
| \`background-origin\` | Positioning reference box | \`padding-box\`, \`border-box\`, \`content-box\` |
| \`background-clip\` | Where the paint is clipped | \`border-box\`, \`padding-box\`, \`text\` |

You'll use \`background-color\` and \`background-image\` constantly; the rest are refinements you reach for as needed.

## background-color

The simplest of the set — paints a flat color behind the content and padding (and border, if the border itself has transparency, since borders paint on top of the background by default).

\`\`\`css
.card {
  background-color: #0f172a;
}
.badge {
  background-color: rgb(220 38 38 / 0.15);
}
\`\`\`

Notice the second example uses an **alpha channel** via the modern space-separated \`rgb()\` syntax (\`rgb(r g b / a)\`) — no commas needed, and the slash separates the alpha value. This is the current standard syntax; the older comma form (\`rgba(220, 38, 38, 0.15)\`) still works but is now considered legacy. A translucent background color lets whatever is behind the element show through, which is useful for badges, overlays, and hover states without needing a whole separate gradient.

## background-image

Accepts one or more image sources, most commonly a \`url()\` reference or a CSS gradient function (gradients are covered in depth in the next lesson, but they're valid \`background-image\` values too):

\`\`\`css
.hero {
  background-image: url("/images/hero.jpg");
}
.banner {
  background-image: linear-gradient(to right, #7c3aed, #ec4899);
}
\`\`\`

A critical, easy-to-miss detail: \`background-image\` **stacks on top of** \`background-color\`, not the other way around. If both are set, the image paints in front, and the color only shows through where the image is transparent or doesn't cover the box. This makes \`background-color\` a great fallback for slow-loading images or images with transparency:

\`\`\`css
.avatar {
  background-color: #64748b; /* shows while the image loads, or if it 404s */
  background-image: url("/avatars/user-42.png");
  background-size: cover;
}
\`\`\`

## background-position

Controls where the image is anchored within its positioning area. Accepts keywords (\`top\`, \`bottom\`, \`left\`, \`right\`, \`center\`), percentages, or lengths — and you can mix a horizontal and vertical value:

\`\`\`css
.hero {
  background-image: url("/images/hero.jpg");
  background-position: center top;   /* keywords */
  background-position: 50% 0%;        /* equivalent percentages */
  background-position: right 20px top 10px; /* offset from an edge */
}
\`\`\`

That last form — \`right 20px top 10px\` — is the four-value syntax: it lets you offset from a specific edge rather than always measuring from the top-left, which is much easier to reason about for things like "pin a logo 20px from the right, 10px from the top" without doing subtraction.

Percentages are relative to the box **and** the image size together — \`50% 50%\` doesn't mean "the image's center pixel sits at the box's center," it means "the point 50% into the image aligns with the point 50% into the box," which happens to be the same thing for centering, but matters once you use non-center percentages with images that don't match the box's aspect ratio.

## background-size

Controls how large the image renders inside its box. Two keywords cover almost every real use case:

- \`cover\` — scales the image up (preserving aspect ratio) until it **completely fills** the box, cropping any overflow. Use this for hero images and photo backgrounds where you never want to see empty space, and cropping the edges is acceptable.
- \`contain\` — scales the image up until it **just fits** inside the box without cropping, which can leave empty space (filled by \`background-color\`, if set) on two sides. Use this for logos or images where nothing may ever be cropped.

\`\`\`css
.hero {
  background-image: url("/images/hero.jpg");
  background-size: cover;
  background-position: center;
}
.logo-tile {
  background-image: url("/logo.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #fff;
}
\`\`\`

You can also give explicit dimensions — a single length scales width and lets height follow proportionally (\`auto\`), or two lengths/percentages set both explicitly:

\`\`\`css
.icon-bg {
  background-size: 24px 24px;
}
.pattern {
  background-size: 40% auto;
}
\`\`\`

## background-repeat

By default, a background image **tiles** in both directions to fill the box. That's desired for small repeating patterns, but almost never desired for photos — forgetting \`background-repeat: no-repeat\` on a hero image is one of the most common background bugs, producing a tiled wall of the same photo.

| Value | Behavior |
|---|---|
| \`repeat\` (default) | Tiles in both directions |
| \`no-repeat\` | Shows the image once, no tiling |
| \`repeat-x\` | Tiles horizontally only |
| \`repeat-y\` | Tiles vertically only |
| \`space\` | Tiles with even gaps, no clipped tiles |
| \`round\` | Tiles and stretches tiles to avoid clipping |

\`space\` and \`round\` are worth knowing for tiled patterns: instead of letting the last tile get cut off at the edge, \`space\` inserts whitespace between whole tiles, and \`round\` stretches each tile slightly so a whole number fits exactly. Both avoid the "half a tile chopped off at the edge" look that plain \`repeat\` produces.

## background-attachment

Controls whether the background image scrolls with the page/element content, or stays fixed relative to the viewport:

- \`scroll\` (default) — the background is fixed relative to the element itself, so it scrolls along with the page.
- \`fixed\` — the background is fixed relative to the **viewport**, producing the classic "parallax" effect where content scrolls over a static image.
- \`local\` — the background scrolls with the element's own content, which matters for scrollable elements (like a \`overflow: auto\` div) rather than the whole page.

\`\`\`css
.parallax-section {
  background-image: url("/images/mountains.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
\`\`\`

Two caveats worth knowing: \`background-attachment: fixed\` is disabled on iOS Safari for most of its history (it silently falls back to \`scroll\`), and it can hurt scroll performance on lower-powered devices because the browser has to repaint the background on every scroll frame. For a "fake parallax" that works everywhere, many teams instead animate a \`transform\` on a background layer using \`Intersection Observer\` or CSS scroll-driven animations, which is outside this lesson's scope but worth knowing exists.

## The background shorthand — and its trap

The \`background\` shorthand lets you set several sub-properties in one declaration:

\`\`\`css
.hero {
  background: url("/images/hero.jpg") center / cover no-repeat fixed;
}
\`\`\`

Reading that syntax: \`background: <image> <position> / <size> <repeat> <attachment>\`. The slash is required when both position and size are present, to disambiguate them (both accept similar-looking values).

**The pitfall:** the shorthand doesn't just set the properties you mention — it **resets every background sub-property to its initial value** for any you omit. This is the single most common background bug in real codebases. Consider:

\`\`\`css
.card {
  background-color: #0f172a;
  background-image: url("/pattern.svg");
  background-repeat: no-repeat;
}

/* Later, some other rule does this: */
.card.featured {
  background: linear-gradient(to right, #7c3aed, #ec4899);
}
\`\`\`

That second rule doesn't just add a gradient on top — because \`background\` is shorthand, it silently resets \`background-repeat\` back to \`repeat\` and, since no image other than the gradient is specified, effectively removes the pattern. The fix is either to specify everything you care about explicitly inside the shorthand, or — often simpler and safer in real projects — to avoid the shorthand entirely and set only the specific longhand property you mean to change:

\`\`\`css
.card.featured {
  background-image: linear-gradient(to right, #7c3aed, #ec4899);
}
\`\`\`

This preserves \`background-color\` and \`background-repeat\` untouched. As a rule of thumb: reach for the \`background\` shorthand when you're setting the *entire* background of an element in one place, and prefer longhands when you're overriding or layering on top of styles defined elsewhere (a different selector, a different cascade layer, a component variant class).

## Layering multiple backgrounds

A single element can have more than one background image, stacked like layers in a design tool — the first one listed paints on top, the last one paints on the bottom. Each layer can have its own position, size, and repeat, matched up positionally with commas:

\`\`\`css
.hero {
  background-image:
    linear-gradient(to bottom, rgb(15 23 42 / 0.6), rgb(15 23 42 / 0.6)),
    url("/images/hero.jpg");
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
}
\`\`\`

This is a very common real-world recipe: a semi-transparent gradient (here, a flat color repeated as both gradient stops, which effectively produces a solid tint) layered over a photo, so that white text laid on top stays readable regardless of what's in the photo. Each comma-separated value lines up across every background property by position — the first \`background-size\` applies to the first \`background-image\`, and so on. If a property has fewer comma-separated values than there are layers, its list simply repeats from the start to fill the gap, which is why \`background-color\` (which only ever paints one flat layer, always at the very back) doesn't need a matching value per layer.

Layering is also how you build things like a dotted-grid background using two repeating gradients, or a card with both a subtle noise texture and a color wash, without needing extra wrapper \`<div>\`s purely for visual layering.

> **Key idea:** the background-* properties are independent controls (color, image, position, size, repeat, attachment) that combine into the \`background\` shorthand — but that shorthand resets every unspecified sub-property, so prefer longhands when layering styles from different rules, and remember that multiple comma-separated \`background-image\` values stack with the first listed on top.`,
    },
    {
      name: "Gradients",
      minutes: 13,
      intro: "Build linear, radial, and conic gradients from scratch — angles, color stops, hints, repeating variants — and use them as drop-in background-image values.",
      content: `## Gradients are images, not colors

The first thing to internalize about CSS gradients: \`linear-gradient()\`, \`radial-gradient()\`, and \`conic-gradient()\` are **\`<image>\` values**, exactly like \`url("photo.jpg")\`. That means anywhere an image is accepted — \`background-image\`, \`border-image\`, \`mask-image\` — a gradient is a valid, drop-in replacement. There is no separate "gradient property"; you're just generating an image on the fly instead of loading one from a file, which means no network request, infinite scalability with no pixelation, and values you can tweak live in a custom property or media query.

## linear-gradient()

A linear gradient paints a smooth transition between colors along a straight line. The simplest form takes just two colors, transitioning top-to-bottom by default:

\`\`\`css
.banner {
  background-image: linear-gradient(#7c3aed, #ec4899);
}
\`\`\`

### Controlling direction

The first argument, if present, sets the direction — either a keyword phrase starting with \`to\`, or an angle:

\`\`\`css
.a { background-image: linear-gradient(to right, #7c3aed, #ec4899); }
.b { background-image: linear-gradient(to bottom right, #7c3aed, #ec4899); }
.c { background-image: linear-gradient(90deg, #7c3aed, #ec4899); }
.d { background-image: linear-gradient(45deg, #7c3aed, #ec4899); }
\`\`\`

Keyword and angle are **not** simple mirror images of each other in a way most people expect: \`to right\` is exactly \`90deg\`, but \`to bottom right\` is *not* exactly \`135deg\` — the keyword form points precisely at the corner of the box, while the angle form points in a fixed compass direction regardless of the box's aspect ratio. For a square box they coincide; for a wide rectangle they visibly diverge. If you want the gradient to always terminate exactly at a corner, use the \`to <corner>\` keyword form; if you want a fixed visual angle regardless of box shape, use degrees.

Angles follow clock-style convention: \`0deg\` points up, and the angle increases clockwise, so \`90deg\` points right, \`180deg\` points down, and \`270deg\` (or \`-90deg\`) points left.

### Color stops

Beyond two colors, you can list any number of stops, and you can pin any stop to a specific position with a percentage or length:

\`\`\`css
.rainbow {
  background-image: linear-gradient(
    to right,
    red,
    orange,
    yellow,
    green,
    blue
  );
}

.pinned {
  background-image: linear-gradient(
    to right,
    #7c3aed 0%,
    #7c3aed 40%,
    #ec4899 100%
  );
}
\`\`\`

That \`.pinned\` example is a common trick: repeating the same color at two adjacent stops (\`0%\` and \`40%\`) creates a **solid band** with no visible transition, before the gradient begins — useful for a color block that transitions only in its final portion. Without explicit positions, stops are spaced evenly along the line automatically.

### Color hints

A lone percentage between two color stops (with no color attached) is a **hint** — it shifts where the 50%-mixed midpoint of the transition falls, without adding a new color:

\`\`\`css
.eased {
  background-image: linear-gradient(to right, #7c3aed 0%, 25%, #ec4899 100%);
}
\`\`\`

Here the midpoint of the purple-to-pink blend is pulled to sit at 25% along the line instead of the default 50%, making the transition feel like it accelerates rather than moving at a constant rate. Hints are a subtle tool, mostly reached for when a gradient needs to look less mechanically linear.

## radial-gradient()

A radial gradient radiates outward from a center point instead of moving along a straight line. Default shape and position: an ellipse, centered, sized to reach the farthest corner.

\`\`\`css
.spotlight {
  background-image: radial-gradient(circle, #fef3c7, #78350f);
}
\`\`\`

The full syntax is \`radial-gradient(<shape> <size> at <position>, <color-stops>)\`, and every part is optional with sensible defaults:

- **Shape**: \`circle\` or \`ellipse\` (default — matches the box's aspect ratio).
- **Size keyword**: \`closest-side\`, \`closest-corner\`, \`farthest-side\`, \`farthest-corner\` (default).
- **Position**: same syntax as \`background-position\`, e.g. \`at top left\`, \`at 30% 70%\`.

\`\`\`css
.glow {
  background-image: radial-gradient(
    circle at top left,
    rgb(124 58 237 / 0.4),
    transparent 60%
  );
}
\`\`\`

That recipe — a translucent color fading to \`transparent\` — is the standard way to build a soft glow or light-source effect anchored to a corner, and it composes well as one layer in a multi-background stack (see the previous lesson).

## conic-gradient()

Instead of moving along a line or radiating outward, a conic gradient sweeps colors **around a center point**, like the hands of a clock or a pie chart:

\`\`\`css
.pie-chart {
  background-image: conic-gradient(
    #7c3aed 0deg 90deg,
    #ec4899 90deg 220deg,
    #f59e0b 220deg 360deg
  );
  border-radius: 50%;
}
\`\`\`

This is the natural way to build pie/donut charts, color wheels, and loading-spinner sweeps in pure CSS — no SVG or canvas required. The syntax mirrors linear/radial: an optional starting angle (\`from <angle>\`) and position (\`at <position>\`), then color stops, except stops here are measured as angles (degrees or \`turn\` units) around the circle instead of distances along a line.

\`\`\`css
.color-wheel {
  background-image: conic-gradient(
    from 0deg,
    red, yellow, lime, cyan, blue, magenta, red
  );
  border-radius: 50%;
}
\`\`\`

## Repeating variants

\`repeating-linear-gradient()\`, \`repeating-radial-gradient()\`, and \`repeating-conic-gradient()\` take the same arguments as their base counterparts, but instead of the color stops running once from start to end, the whole stop pattern **repeats** for as long as the gradient needs to fill the box — driven by where the *last* color stop lands.

\`\`\`css
.stripes {
  background-image: repeating-linear-gradient(
    45deg,
    #f8fafc 0px,
    #f8fafc 10px,
    #e2e8f0 10px,
    #e2e8f0 20px
  );
}
\`\`\`

Here the pattern "light 0-10px, dark 10-20px" repeats indefinitely because the last stop is at \`20px\` rather than \`100%\` — shrink that final number and the stripes get narrower and more frequent; grow it and they widen. This is the standard technique for diagonal stripe patterns, dashed placeholder textures, and barber-pole loading bars, all without a single image file.

\`\`\`css
.target {
  background-image: repeating-radial-gradient(
    circle,
    #ef4444 0px,
    #ef4444 10px,
    #fff 10px,
    #fff 20px
  );
  border-radius: 50%;
}
\`\`\`

## Gradients as background-image: full recipes

### Recipe: subtle overlay for legible text on a photo

\`\`\`css
.hero {
  background-image:
    linear-gradient(
      to top,
      rgb(15 23 42 / 0.85) 0%,
      rgb(15 23 42 / 0.2) 40%,
      transparent 70%
    ),
    url("/images/hero.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
\`\`\`

The gradient is darkest at the bottom (where captions usually sit) and fades to fully transparent by 70% up the image, so the top of the photo stays untouched while text anchored at the bottom gets guaranteed contrast — a much better result than a single flat, uniformly dark overlay, which dims the whole photo even where no text sits.

### Recipe: button sheen (glossy highlight)

\`\`\`css
.button {
  background-color: #7c3aed;
  background-image: linear-gradient(
    to bottom,
    rgb(255 255 255 / 0.25) 0%,
    rgb(255 255 255 / 0.05) 50%,
    rgb(255 255 255 / 0) 50%
  );
  border-radius: 8px;
  padding: 10px 18px;
  color: white;
}
\`\`\`

This layers a bright-to-transparent gradient over the top half of the button (note the repeated \`50%\` stop, which is the same "two stops at one position" trick from the linear-gradient section — it draws a hard cutoff instead of a smooth fade past the midpoint), producing the classic glassy highlight seen on early skeuomorphic UI buttons, still used tastefully today as a subtle depth cue on flat-colored buttons.

## Comparison at a glance

| Function | Shape of transition | Typical use |
|---|---|---|
| \`linear-gradient()\` | Straight line, any angle | Overlays, banners, backgrounds |
| \`radial-gradient()\` | Radiates from a center point | Spotlights, glows, vignettes |
| \`conic-gradient()\` | Sweeps around a center point | Pie charts, color wheels, spinners |
| \`repeating-*-gradient()\` | Any of the above, tiled | Stripes, textures, dashed patterns |

> **Key idea:** every gradient function produces an \`<image>\` value usable anywhere an image is accepted — pick linear for directional transitions, radial for emanating/spotlight effects, conic for sweeps like pie charts, and reach for the \`repeating-*\` variants when you want the stop pattern to tile instead of stretch once across the box.`,
    },
    {
      name: "Borders, Radius, Shadows & Filters",
      minutes: 13,
      intro: "Shape and finish elements with border shorthands, elliptical border-radius, layered box-shadow, and CSS filter/backdrop-filter effects like blur and frosted glass.",
      content: `## Borders: shorthand and per-side control

A border has three independent aspects — width, style, and color — controllable together via the \`border\` shorthand, or split per side:

\`\`\`css
.card {
  border: 1px solid #e2e8f0;
}
\`\`\`

That single line is shorthand for \`border-width\`, \`border-style\`, and \`border-color\` on all four sides at once. \`border-style\` is worth calling out on its own, because a border is invisible without it — \`border-width\` and \`border-color\` alone render nothing, since \`border-style\` defaults to \`none\`. Forgetting the style value (usually \`solid\`, but also \`dashed\`, \`dotted\`, \`double\`, \`groove\`, \`ridge\`) is a common "why isn't my border showing up" bug.

To target one side, use the per-side shorthands, or drop down further to the individual longhands:

\`\`\`css
.input {
  border: 1px solid #cbd5e1;
  border-bottom: 2px solid #7c3aed; /* overrides just the bottom side */
}

.divider {
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: #e2e8f0;
}
\`\`\`

The same shorthand-resets-unspecified-parts trap from the \`background\` shorthand applies here too: \`border-bottom: 2px solid #7c3aed\` only touches the bottom side's width/style/color — it does not affect the other three sides, because \`border-bottom\` is scoped to that one side already. Where the trap resurfaces is the *unscoped* \`border\` shorthand: setting \`border: 1px solid black\` after previously setting \`border-bottom-width: 4px\` elsewhere will silently reset that bottom width back down to \`1px\`, since the unscoped shorthand touches all four sides' width/style/color together.

Logical properties are worth knowing for internationalized layouts: \`border-inline-start\` and \`border-block-end\` (and friends) follow text direction rather than physical left/right, so a \`border-inline-start\` automatically flips sides in a right-to-left layout without any extra CSS.

## border-radius

Rounds corners. A single value applies to all four corners uniformly:

\`\`\`css
.card {
  border-radius: 12px;
}
.pill {
  border-radius: 999px; /* larger than half the height = fully pill-shaped */
}
.circle {
  border-radius: 50%; /* on a square box, produces a perfect circle */
}
\`\`\`

Up to four values target each corner individually, in **top-left, top-right, bottom-right, bottom-left** order (clockwise from top-left, the same pattern as \`margin\`/\`padding\` shorthand):

\`\`\`css
.tab {
  border-radius: 8px 8px 0 0; /* rounded top, square bottom — classic tab shape */
}
\`\`\`

### Elliptical corners with slash syntax

Every corner in CSS actually has *two* radii — a horizontal and a vertical one — which are equal by default, producing the familiar circular-arc corner. Setting them independently produces an elliptical corner instead, using a slash to separate horizontal values from vertical values:

\`\`\`css
.blob {
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}
\`\`\`

Read that as two separate four-value lists: everything before the slash sets the horizontal radius of each corner (top-left, top-right, bottom-right, bottom-left), and everything after the slash sets the vertical radius of each corner in the same order. This is the technique behind organic "blob" shapes used in illustration-heavy marketing pages — each corner stretches unevenly, producing a shape that reads as hand-drawn rather than a rounded rectangle. For simpler cases, a single corner can also take two values directly (e.g. \`border-top-left-radius: 20px 10px\` — 20px horizontal, 10px vertical) without needing the full shorthand slash syntax.

## box-shadow

Draws a shadow (or several) outside — or inside — the element's border box, without affecting layout at all (unlike a border, a shadow never takes up space or pushes neighboring content).

\`\`\`css
.card {
  box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
}
\`\`\`

The value list, in required order, is: **offset-x, offset-y, blur-radius (optional), spread-radius (optional), color**.

| Part | Meaning | Notes |
|---|---|---|
| offset-x | Horizontal shift | Positive = right, negative = left |
| offset-y | Vertical shift | Positive = down, negative = up |
| blur-radius | Softens the edge | 0 = hard edge; larger = softer/larger blur |
| spread-radius | Grows/shrinks the shadow shape | Positive expands, negative shrinks — before blurring |
| color | Shadow color | Usually semi-transparent black or a tinted color |

\`\`\`css
.elevated {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
\`\`\`

That example — two comma-separated shadows — demonstrates **stacking multiple shadows** on one element, which is how most modern design systems build convincing elevation: a larger, softer, more spread-out shadow for the ambient glow, combined with a tighter, sharper shadow close to the edge for contact shadow. Real light doesn't produce a single uniform shadow, so combining two (or three) with different blur/spread/opacity reads as noticeably more natural than one large shadow alone.

### inset shadows

Adding the \`inset\` keyword flips the shadow to render **inside** the border box instead of outside it, producing a pressed-in or recessed look rather than a raised one:

\`\`\`css
.input:focus {
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.2);
}
.pressed-button {
  box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.3);
}
\`\`\`

You can combine outer and inset shadows in the same comma-separated list — a common pattern for form inputs is an outer focus ring plus an inner recessed shadow together, giving both an accessible focus indicator and a tactile "sunken field" appearance in one declaration.

## filter

\`filter\` applies one or more graphical effects — borrowed conceptually from image editing — to an element and everything painted inside it (its own background, border, and all of its descendants), before it's composited into the page.

| Function | Effect |
|---|---|
| \`blur(<length>)\` | Gaussian blur |
| \`brightness(<percent>)\` | Lighten/darken (100% = unchanged) |
| \`contrast(<percent>)\` | Increase/decrease contrast |
| \`grayscale(<percent>)\` | Desaturate toward gray |
| \`saturate(<percent>)\` | Increase/decrease color saturation |
| \`drop-shadow(<x> <y> <blur> <color>)\` | Shadow that follows the element's actual alpha shape |

Multiple functions can be chained, space-separated, and apply in the order written:

\`\`\`css
.thumbnail {
  filter: grayscale(100%) contrast(110%);
  transition: filter 0.2s ease;
}
.thumbnail:hover {
  filter: none;
}
\`\`\`

That's a common gallery pattern: photos render desaturated by default and snap to full color on hover, purely in CSS with a smooth transition, no duplicate image assets required.

### drop-shadow vs box-shadow

These look similar but behave differently, and mixing them up produces visibly wrong results on non-rectangular content. \`box-shadow\` always follows the element's **border box** — a rectangle (or rounded rectangle) — regardless of what's actually opaque inside it. \`filter: drop-shadow()\` instead follows the actual **alpha channel** of the rendered content, so it correctly hugs the silhouette of a transparent PNG icon, an SVG shape, or text — something \`box-shadow\` cannot do, since it only knows about the box, not the pixels inside it.

\`\`\`css
.icon {
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.4));
}
\`\`\`

Use \`box-shadow\` for rectangular UI elements (cards, buttons, inputs); use \`filter: drop-shadow()\` for icons, logos, and any image or SVG with real transparency where you want the shadow to trace the visible shape rather than a bounding rectangle.

## backdrop-filter and glass/frosted effects

\`backdrop-filter\` accepts the exact same function list as \`filter\`, but applies the effect to whatever is **behind** the element — content that's already been painted below it in the stacking order — rather than to the element's own content. This is the mechanism behind the "frosted glass" UI look that's become common in modern interfaces (translucent navbars, blurred modal backdrops, glassmorphic panels):

\`\`\`css
.glass-panel {
  background-color: rgb(255 255 255 / 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgb(255 255 255 / 0.2);
  border-radius: 16px;
}
\`\`\`

For this to visibly do anything, there must be content *behind* the element for it to blur — a photo, a gradient, or other UI elements scrolling underneath a translucent navbar. A semi-transparent \`background-color\` is typically paired with it so the panel still reads as a distinct surface rather than a perfectly clear window.

A couple of practical notes: \`backdrop-filter\` is a genuinely expensive effect to render, since the browser has to continuously recompute the blur of everything moving underneath it — used sparingly (a navbar, a single modal) it's fine, but on many elements at once it can visibly hurt scroll performance, especially on lower-powered devices. It also needs the element to actually be layered above other painted content to have any visible effect — on a plain solid-colored page background, blurring "nothing interesting" looks identical to not blurring at all.

## Filter vs backdrop-filter, side by side

| | \`filter\` | \`backdrop-filter\` |
|---|---|---|
| Affects | The element and its own descendants | Whatever is rendered *behind* the element |
| Needs transparency to show? | No | Effectively yes — needs visible content behind it |
| Typical use | Image effects, hover states, icon shadows | Frosted glass panels, translucent navbars/modals |
| Performance cost | Moderate | Higher — recalculated as background content moves |

> **Key idea:** borders, radius, and shadows shape an element's outline and depth without affecting layout — stack multiple \`box-shadow\` values for realistic elevation, use \`filter: drop-shadow()\` instead of \`box-shadow\` when a shadow needs to trace real alpha-channel transparency, and reach for \`backdrop-filter: blur()\` (paired with a translucent background color) whenever you need the modern frosted-glass look.`,
    },
  ],
}
