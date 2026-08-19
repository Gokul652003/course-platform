import type { Module } from "../types"

export const tailwindModule11: Module = {
  id: 11,
  title: "Transitions, Animations & Transforms",
  status: "upcoming",
  lessons: [
    {
      name: "Transitions — Property, Duration & Easing",
      minutes: 9,
      intro: "Add smooth, performant hover and state transitions without writing a single line of CSS.",
      content: `### Why transitions matter

Without a transition, every state change — a hover, a focus, a class toggle — snaps instantly. A single \`transition-*\` utility turns that snap into a smooth interpolation between the old value and the new one, and it's one of the cheapest ways to make an interface feel considered.

Tailwind's transition utilities are really just shorthand for three CSS properties working together: \`transition-property\`, \`transition-duration\`, and \`transition-timing-function\`. You almost always combine at least two of them.

### Picking what to transition

| Class | \`transition-property\` value | Use for |
|-------|-------------------------------|---------|
| \`transition\` | \`color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter\` | a sensible default covering most interactive states |
| \`transition-colors\` | \`color, background-color, border-color, text-decoration-color, fill, stroke\` | hover states that only change color |
| \`transition-opacity\` | \`opacity\` | fade in/out |
| \`transition-shadow\` | \`box-shadow\` | elevation changes on hover |
| \`transition-transform\` | \`transform\` | scale/rotate/translate on hover |
| \`transition-all\` | \`all\` | everything |
| \`transition-none\` | none | disable transitions |

\`\`\`html
<button class="bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700">
  Save changes
</button>
\`\`\`

### Why transition-all can hurt performance

\`transition-all\` looks convenient — you never have to think about which property changed — but it comes with a real cost. The browser has to watch *every* animatable property on the element for changes, including ones you never intended to animate, like \`width\` or \`height\` shifting during a layout reflow. On a complex component this can:

- trigger transitions on properties you didn't mean to animate (a surprise "slide" when a sibling's size change nudges layout)
- force the browser to do more work per frame, since it can't optimize for a known, narrow set of properties
- make debugging animation jank harder, because you can't tell from the class name what's actually moving

In practice, reach for the narrowest utility that describes what's actually changing — \`transition-colors\` for a hover background, \`transition-transform\` for a hover scale — and save \`transition-all\` for quick prototypes or genuinely multi-property changes (like a card that changes background, shadow, *and* scale together, where listing each property individually wouldn't save you much).

### The duration scale

\`duration-*\` sets \`transition-duration\` in milliseconds:

| Class | Duration |
|-------|----------|
| \`duration-75\` | 75ms |
| \`duration-100\` | 100ms |
| \`duration-150\` | 150ms |
| \`duration-200\` | 200ms |
| \`duration-300\` | 300ms |
| \`duration-500\` | 500ms |
| \`duration-700\` | 700ms |
| \`duration-1000\` | 1000ms |

You can also use an arbitrary value for anything off the scale, e.g. \`duration-[250ms]\`. As a rule of thumb: 100–200ms feels instant-but-smooth for small UI feedback (hover, focus rings), and 300–500ms suits larger movements (a modal sliding in, a panel expanding).

### Easing curves

\`transition-timing-function\` controls the *rate* of change over the duration — not just linear interpolation, but acceleration and deceleration:

| Class | Curve | Feel |
|-------|-------|------|
| \`ease-linear\` | constant speed | mechanical, best for spinners/progress bars |
| \`ease-in\` | slow start, fast end | elements leaving the screen |
| \`ease-out\` | fast start, slow end | elements entering the screen — usually the best default for hover states |
| \`ease-in-out\` | slow start and end, fast middle | balanced, general purpose |

\`\`\`html
<div class="transition-transform duration-300 ease-out hover:scale-105">
  Hover me
</div>
\`\`\`

### Delaying a transition

\`delay-*\` uses the same scale as \`duration-*\`, but sets \`transition-delay\` instead — the pause before the transition starts:

\`\`\`html
<div class="transition-opacity duration-200 delay-150 opacity-0 group-hover:opacity-100">
  Tooltip content
</div>
\`\`\`

This is especially useful for staggering — for example, delaying a tooltip's fade-in slightly so it doesn't flicker on a quick mouse pass-over.

### A full worked example: hover card

\`\`\`html
<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm
            transition-shadow duration-300 ease-out
            hover:shadow-lg">
  <h3 class="font-semibold text-gray-900">Pro plan</h3>
  <p class="mt-1 text-sm text-gray-500">Everything in Free, plus priority support.</p>
  <button class="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white
                 transition-colors duration-150 ease-out
                 hover:bg-gray-700
                 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
    Upgrade
  </button>
</div>
\`\`\`

Notice the card and the button each declare their *own* transition — the card only ever transitions its shadow, the button only its background color. That's the narrow-utility habit from above in practice: two small, purposeful transitions instead of one \`transition-all\` covering both.

> **Key idea:** Reach for the narrowest \`transition-*\` utility that matches what's actually changing — \`transition-colors\`, \`transition-transform\`, \`transition-shadow\` — and save \`transition-all\` for genuinely multi-property changes. Pair it with a \`duration-*\` and an \`ease-*\` that matches the motion: \`ease-out\` for things entering or growing, \`ease-in\` for things leaving or shrinking.`,
    },
    {
      name: "Transform Utilities",
      minutes: 9,
      intro: "Scale, rotate, translate, and skew elements with utility classes — and combine them without fighting the cascade.",
      content: `### How Tailwind's transforms work

Every transform utility in Tailwind ultimately writes to a single CSS \`transform\` property behind the scenes, using CSS variables so that multiple transform utilities can stack on one element without overwriting each other. That's why you can write \`scale-105 rotate-3 -translate-y-1\` all on the same element and get a combined transform, instead of the last class silently winning.

In Tailwind v4, transforms are enabled by default — there's no separate \`transform\` utility you need to add before the others will work (that was required pre-v3.0, and still shows up in some older tutorials). Just apply \`scale-*\`, \`rotate-*\`, etc. directly.

### Scale

\`scale-*\` scales an element on both axes at once; \`scale-x-*\` and \`scale-y-*\` scale a single axis:

\`\`\`html
<img class="transition-transform duration-200 hover:scale-110" src="/thumb.jpg" />
\`\`\`

| Class | \`scale()\` value |
|-------|-------------------|
| \`scale-0\` | 0 |
| \`scale-50\` | 0.5 |
| \`scale-75\` | 0.75 |
| \`scale-90\` | 0.9 |
| \`scale-95\` | 0.95 |
| \`scale-100\` | 1 (no change) |
| \`scale-105\` | 1.05 |
| \`scale-110\` | 1.1 |
| \`scale-125\` | 1.25 |
| \`scale-150\` | 1.5 |

A subtle \`scale-105\` on hover reads as "responsive" without feeling gimmicky; \`scale-95\` on \`active:\` gives a nice "pressed" feel on buttons.

### Rotate

\`\`\`html
<button class="transition-transform duration-150 hover:rotate-3">Tilt</button>
<svg class="h-5 w-5 transition-transform duration-200" :class="open && 'rotate-180'">
  <!-- chevron icon -->
</svg>
\`\`\`

The scale runs \`rotate-0\`, \`rotate-1\`, \`rotate-2\`, \`rotate-3\`, \`rotate-6\`, \`rotate-12\`, \`rotate-45\`, \`rotate-90\`, \`rotate-180\` (degrees). Prefix with \`-\` for the opposite direction: \`-rotate-45\`. A rotating chevron on an accordion or dropdown is the single most common real-world use.

### Translate

\`translate-x-*\` and \`translate-y-*\` move an element along an axis, using the same spacing scale as \`margin\`/\`padding\` (plus fraction and \`full\` values):

\`\`\`html
<div class="translate-y-0 transition-transform duration-300 hover:-translate-y-1">
  Lifts slightly on hover
</div>

<span class="absolute -top-1 -right-1 translate-x-1/2 -translate-y-1/2">
  <!-- a badge nudged to straddle a corner -->
</span>
\`\`\`

| Class | Meaning |
|-------|---------|
| \`translate-x-4\` | move right by \`1rem\` (spacing scale) |
| \`-translate-x-4\` | move left by \`1rem\` |
| \`translate-x-1/2\` | move right by 50% of the element's own width |
| \`translate-x-full\` | move right by 100% of the element's own width |

That last row — percentage-of-self — is what makes \`translate-x-1/2 -translate-y-1/2\` such a common combo for perfectly centering a badge or tooltip arrow over a corner, independent of the element's actual pixel size.

### Skew

\`skew-x-*\` and \`skew-y-*\` shear an element along an axis — far less common than the others, but useful for decorative diagonal dividers or "peeling corner" effects:

\`\`\`html
<div class="skew-y-3 bg-indigo-600 px-6 py-12">
  <div class="-skew-y-3">
    <!-- un-skew inner content so text stays readable -->
    <h2 class="text-white">Straight text on a skewed banner</h2>
  </div>
</div>
\`\`\`

### Combining transforms

Because Tailwind composes transforms via CSS variables, you can freely stack scale, rotate, and translate on one element:

\`\`\`html
<div class="transition-transform duration-300 ease-out
            hover:scale-105 hover:rotate-1 hover:-translate-y-1">
  Card that lifts, tilts, and grows together
</div>
\`\`\`

All three apply as a single combined \`transform\`, in a fixed order (translate, rotate, skew, scale) regardless of the order you write the classes in.

### transform-origin

By default, transforms pivot around the element's center. \`origin-*\` moves that pivot point — essential for things like a dropdown that should grow *from* its trigger button rather than from its own center:

\`\`\`html
<div class="origin-top-right scale-95 opacity-0 transition
            data-[open]:scale-100 data-[open]:opacity-100">
  Dropdown menu
</div>
\`\`\`

| Class | Pivot point |
|-------|-------------|
| \`origin-center\` | center (default) |
| \`origin-top\` | top edge, horizontally centered |
| \`origin-top-right\` | top-right corner |
| \`origin-bottom-left\` | bottom-left corner |

### transform-gpu — hinting at compositing

\`transform-gpu\` forces the browser to promote the transform onto its own compositor layer (by using a 3D transform under the hood, e.g. \`translateZ(0)\`), which can make animations smoother on elements that are expensive to repaint — large images, elements with heavy box-shadows, or anything animating at 60fps continuously.

\`\`\`html
<div class="transform-gpu transition-transform duration-200 hover:scale-105">
  Large hero image
</div>
\`\`\`

Don't reach for it reflexively, though — forcing every animated element onto its own layer has memory costs too. Use \`transform-gpu\` when you actually notice jank on a specific element, not as a default on everything with a \`transition-transform\`.

> **Key idea:** Transform utilities stack — \`scale-*\`, \`rotate-*\`, \`translate-*\`, and \`skew-*\` combine into one \`transform\` on the element, in a fixed internal order. Adjust the pivot with \`origin-*\` when an element should grow from a corner instead of its center, and reach for \`transform-gpu\` only when a specific animated element is visibly janky.`,
    },
    {
      name: "Keyframe Animations",
      minutes: 10,
      intro: "Use Tailwind's built-in animations for common UI patterns, then define and register your own.",
      content: `### The four built-in animations

Tailwind ships four ready-made \`animate-*\` utilities, each backed by a predefined \`@keyframes\` rule. They cover the vast majority of "small looping UI motion" needs without you writing any CSS.

| Class | Motion | Typical use |
|-------|--------|--------------|
| \`animate-spin\` | continuous 360° rotation | loading spinners |
| \`animate-ping\` | scale up + fade out, repeating | notification "radar" dots |
| \`animate-pulse\` | opacity fades in and out | skeleton loading placeholders |
| \`animate-bounce\` | vertical bounce | "scroll down" hints, drawing attention to an icon |

### animate-spin — loading spinners

\`\`\`html
<svg class="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
</svg>
\`\`\`

Pair it with a disabled button state so users can't double-submit while a spinner is showing:

\`\`\`html
<button disabled class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white opacity-70">
  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><!-- spinner path --></svg>
  Saving…
</button>
\`\`\`

### animate-ping — notification dots

\`animate-ping\` scales an element up while fading it out, on a loop — it's built to be layered *behind* a solid dot to create a "radar pulse" effect, not used alone:

\`\`\`html
<span class="relative flex h-3 w-3">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
</span>
\`\`\`

The first \`<span>\` is the pulsing "echo," positioned absolutely so it expands outward from behind the second, solid dot.

### animate-pulse — skeleton loaders

\`animate-pulse\` gently fades opacity in and out — the standard way to show "content is loading" placeholders:

\`\`\`html
<div class="animate-pulse space-y-3">
  <div class="h-4 w-3/4 rounded bg-gray-200"></div>
  <div class="h-4 w-1/2 rounded bg-gray-200"></div>
  <div class="h-32 w-full rounded bg-gray-200"></div>
</div>
\`\`\`

### animate-bounce — drawing attention

\`\`\`html
<div class="flex justify-center">
  <svg class="h-6 w-6 animate-bounce text-gray-400" viewBox="0 0 24 24">
    <!-- down-chevron path -->
  </svg>
</div>
\`\`\`

Used sparingly, \`animate-bounce\` is good for "scroll for more" indicators or nudging attention toward a single call-to-action icon. Applied to more than one element on a page at once, it tends to feel noisy rather than helpful.

### Building your own animation (Tailwind v4)

The built-ins won't cover everything — say you want a toast notification that slides in from the right and settles. In v4, you define the \`@keyframes\` in your CSS as usual, then register the animation as a theme variable using the \`--animate-*\` namespace inside \`@theme\`. Tailwind automatically generates an \`animate-slide-in\` utility from it:

\`\`\`css
@import "tailwindcss";

@theme {
  --animate-slide-in: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
\`\`\`

\`\`\`html
<div class="animate-slide-in rounded-lg bg-white p-4 shadow-lg">
  Changes saved
</div>
\`\`\`

The name after \`--animate-\` (\`slide-in\` here) becomes the utility suffix (\`animate-slide-in\`), exactly the same pattern as \`--color-brand\` becoming \`bg-brand\`/\`text-brand\`/etc. The \`@keyframes\` rule itself is just plain CSS — Tailwind doesn't generate it for you, it only wires up the \`animation\` shorthand as a utility.

### The v3 way (theme.extend), for reference

If you're on Tailwind v3 (or maintaining a v3 project), the equivalent setup lives in \`tailwind.config.js\` under \`theme.extend\`, with \`keyframes\` and \`animation\` as separate keys:

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
}
\`\`\`

Usage is identical either way — \`class="animate-slide-in"\` — because both approaches ultimately generate the same CSS \`animation\` utility. The difference is purely where the definition lives: co-located CSS in v4's \`@theme\`, or a separate JS config object in v3.

### When to write custom @keyframes vs use a JS animation library

For simple, self-contained motion — a fade, a slide, a subtle attention-grabber — a custom \`animate-*\` utility is lighter weight than pulling in a JS animation library and easier to keep consistent with the rest of your design tokens. Reach for a dedicated animation library once you need sequencing, interruption/reversal mid-animation, physics-based spring motion, or animations driven by gesture/scroll position — those are genuinely hard to express in declarative \`@keyframes\`.

> **Key idea:** \`animate-spin\`, \`animate-ping\`, \`animate-pulse\`, and \`animate-bounce\` cover the common "small looping motion" cases out of the box. For anything custom, write a plain CSS \`@keyframes\` rule and register it once as an \`--animate-*\` variable inside \`@theme\` (v4) or \`theme.extend.animation\` (v3) — either way you get back a reusable \`animate-*\` utility instead of a one-off inline animation.`,
    },
  ],
}
