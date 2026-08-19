import type { Module } from "../types"

export const tailwindModule9: Module = {
  id: 9,
  title: "Interactive States",
  status: "upcoming",
  lessons: [
    {
      name: "Hover, Focus & Active States",
      minutes: 9,
      intro: "Style buttons, links, and inputs the moment a user hovers, focuses, or clicks — and learn why focus-visible beats focus for accessibility.",
      content: `### Variants are just conditional class prefixes

Every Tailwind utility can be prefixed with a **variant** that tells the browser \`only apply this class when...\`. \`hover:bg-blue-700\` compiles to a real CSS rule using \`:hover\`, not JavaScript — there's no runtime cost, and it works even if JS never loads.

\`\`\`html
<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
  Save changes
</button>
\`\`\`

Stack as many utilities as you like after the same variant — \`hover:bg-blue-700 hover:shadow-lg\` both fire together on \`:hover\`.

### hover: — pointer devices only

\`hover:\` maps to the \`:hover\` pseudo-class. Worth knowing: on touch devices, \`:hover\` can behave inconsistently (some browsers fire it on tap and \`stick\` until the next tap elsewhere). Don't rely on \`hover:\` alone to reveal content a touch user *must* be able to reach — pair it with a click/tap-triggered state when the hovered content is essential, not just decorative.

\`\`\`html
<a href="/docs" class="text-slate-600 hover:text-slate-900 hover:underline">
  Read the docs
</a>
\`\`\`

### focus: vs focus-visible: — the one that matters for a11y

Both map to real CSS pseudo-classes, but they fire under different conditions:

| Variant | CSS pseudo-class | Fires on... |
|---------|-------------------|--------------|
| \`focus:\` | \`:focus\` | **any** focus — keyboard tab, mouse click, programmatic \`.focus()\` |
| \`focus-visible:\` | \`:focus-visible\` | only when the browser thinks focus should be visibly indicated — almost always keyboard navigation |

The practical problem with \`focus:\` is that clicking a button with a mouse *also* focuses it, so a chunky focus ring appears on every click — something most sighted mouse users find visually noisy, even though keyboard users genuinely need it. \`focus-visible:\` fixes this: the browser suppresses the indicator for a mouse click but shows it for a Tab press.

\`\`\`html
<!-- Bad: ring flashes on every mouse click too -->
<button class="focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2 rounded-md">
  Submit
</button>

<!-- Good: ring only appears for keyboard users -->
<button class="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none px-4 py-2 rounded-md">
  Submit
</button>
\`\`\`

> Never combine \`focus-visible:outline-none\` without replacing it with a visible ring or border. Removing the focus indicator entirely is a common accessibility failure — you're allowed to *restyle* focus, never to delete it.

### focus-within: — style a parent when any child is focused

\`focus-within:\` matches an element when it, or **any descendant**, has focus. It's the tool for \`highlight the whole form field when the user is typing in its input\`:

\`\`\`html
<div class="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2
            focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
  <svg class="h-4 w-4 text-slate-400"><!-- search icon --></svg>
  <input type="text" placeholder="Search..." class="flex-1 outline-none" />
</div>
\`\`\`

Here the \`<input>\` itself has no focus styles at all — the wrapping \`<div>\` reacts instead, so the icon and border move together as one unit.

### active: — the moment of the click

\`active:\` maps to \`:active\`, which is true only while the mouse button (or touch) is actually pressed down on the element. It's useful for a tactile \`press\` feedback:

\`\`\`html
<button class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98]
               transition text-white px-4 py-2 rounded-md">
  Confirm
</button>
\`\`\`

\`active:scale-[0.98]\` gives a subtle \`push in\` feel for the split second the button is held down.

### disabled: — styling non-interactive elements

\`disabled:\` matches elements with the HTML \`disabled\` attribute — buttons, inputs, selects, fieldsets. It's almost always paired with \`disabled:opacity-*\` and \`disabled:cursor-not-allowed\`:

\`\`\`html
<button
  disabled
  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
>
  Processing...
</button>
\`\`\`

Notice \`disabled:hover:bg-blue-600\` — stacking \`disabled:\` in front of \`hover:\` cancels the hover darkening while the button is disabled, so it doesn't look interactive on mouseover.

### Putting it together

A realistic form input touches four or five of these variants at once:

\`\`\`html
<input
  type="email"
  placeholder="you@example.com"
  class="w-full rounded-md border border-slate-300 px-3 py-2
         hover:border-slate-400
         focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none
         disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
/>
\`\`\`

| Variant | Prefix | Typical use |
|---------|--------|-------------|
| Hover | \`hover:\` | pointer feedback on buttons, links, cards |
| Focus (any) | \`focus:\` | rarely used alone anymore — prefer focus-visible |
| Focus (keyboard) | \`focus-visible:\` | accessible focus rings without mouse-click noise |
| Focus within | \`focus-within:\` | highlight a wrapper when a child is focused |
| Active | \`active:\` | pressed/click feedback |
| Disabled | \`disabled:\` | dim and block interaction on disabled controls |

> **Key idea:** Reach for \`focus-visible:\` instead of \`focus:\` on anything clickable — it gives keyboard users a clear indicator without putting a ring around every button a mouse user clicks.`,
    },
    {
      name: "Group & Peer Modifiers",
      minutes: 10,
      intro: "Style a child based on its parent's state with group, and style an element based on a sibling's state with peer.",
      content: `### The problem these solve

Plain variants like \`hover:\` only affect the element they're written on. But UI constantly needs cross-element reactions: hover a card and change the color of text three levels deep, or check a checkbox and change how its *label* looks. \`group\` and \`peer\` are Tailwind's answer — no JavaScript required.

### group / group-hover: — parent state, child style

Mark the **ancestor** with the \`group\` class, then use \`group-hover:\`, \`group-focus:\`, \`group-active:\` etc. on any **descendant**:

\`\`\`html
<a href="/post/1" class="group block rounded-lg border border-slate-200 p-4">
  <h3 class="font-semibold text-slate-900 group-hover:text-blue-600">
    Understanding Tailwind's group modifier
  </h3>
  <p class="text-slate-500 group-hover:text-slate-700">
    A deep dive into ancestor-driven styling.
  </p>
  <svg class="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition">
    <!-- arrow icon -->
  </svg>
</a>
\`\`\`

Hovering *anywhere* on the \`<a>\` (the \`group\`) changes the heading color, the paragraph color, and slides the arrow — three independent elements reacting to one ancestor's state. Under the hood, Tailwind generates a selector like \`.group:hover .group-hover\\\\:text-blue-600\`.

\`group-focus:\`, \`group-focus-within:\`, and \`group-active:\` all work the same way, just keyed to a different pseudo-class on the ancestor.

### peer / peer-checked: — sibling state, sibling style

\`peer\` works like \`group\`, but for **siblings** instead of descendants. Mark one element \`peer\`, and any element **after it in the DOM** can react to its state with \`peer-*:\` — this is the classic trick for styling a custom checkbox or a floating label, where CSS has no \`previous sibling\` selector to fall back on.

\`\`\`html
<label class="flex items-center gap-2">
  <input type="checkbox" class="peer sr-only" />
  <span class="h-5 w-5 rounded border border-slate-300
               peer-checked:bg-blue-600 peer-checked:border-blue-600
               peer-focus-visible:ring-2 peer-focus-visible:ring-blue-200"></span>
  <span class="peer-checked:text-slate-900 text-slate-500">
    Email me about updates
  </span>
</label>
\`\`\`

The real \`<input>\` is visually hidden (\`sr-only\` — still there for screen readers and keyboard focus), and a styled \`<span>\` acts as the fake checkbox box. When the input becomes \`:checked\`, both the box and the label text react via \`peer-checked:\`.

### peer-invalid: — live form validation styling

\`peer-invalid:\` reacts to native HTML5 validation state, letting you show an error message the instant a field becomes invalid, with zero JavaScript:

\`\`\`html
<div>
  <input
    type="email"
    required
    class="peer w-full rounded-md border border-slate-300 px-3 py-2
           invalid:border-red-500 focus:outline-none"
  />
  <p class="mt-1 hidden text-sm text-red-600 peer-invalid:block">
    Please enter a valid email address.
  </p>
</div>
\`\`\`

The paragraph starts \`hidden\` and flips to \`block\` only once its peer input fails validation. Note the input also uses a plain \`invalid:\` variant on itself — \`peer-*\` is only needed when the *reacting* element is a different element than the one whose state you're checking.

### Named groups and peers — nesting without collisions

Plain \`group\` and \`peer\` only track the **nearest** ancestor/preceding element carrying that class. Nest a \`group\` inside another \`group\`, and \`group-hover:\` becomes ambiguous — which one? Name them to disambiguate: \`group/name\` on the element, \`group-hover/name:\` on the utility.

\`\`\`html
<ul class="group/list">
  <li class="group/item flex items-center justify-between p-3 hover:bg-slate-50">
    <span>Invoice #1042</span>
    <button class="opacity-0 group-hover/item:opacity-100 text-sm text-blue-600">
      View
    </button>
  </li>
  <li class="group/item flex items-center justify-between p-3 hover:bg-slate-50">
    <span>Invoice #1043</span>
    <button class="opacity-0 group-hover/item:opacity-100 text-sm text-blue-600">
      View
    </button>
  </li>
</ul>
\`\`\`

Here \`group-hover/item:\` scopes each button's reveal to *its own* \`<li>\`, so hovering row 1 never reveals row 2's button — even though both \`group/item\` elements share an outer \`group/list\` ancestor. The same naming pattern works for \`peer/name\` when a form has multiple independent peer/reactor pairs.

### Quick reference

| Pattern | Mark the source with | React on descendants/siblings with |
|---------|----------------------|--------------------------------------|
| Ancestor → descendant | \`group\` | \`group-hover:\`, \`group-focus:\`, \`group-active:\` |
| Element → later sibling | \`peer\` | \`peer-checked:\`, \`peer-invalid:\`, \`peer-focus:\` |
| Nested/multiple groups | \`group/name\` | \`group-hover/name:\` |
| Nested/multiple peers | \`peer/name\` | \`peer-checked/name:\` |

> **Key idea:** \`group\` reaches *down* into children, \`peer\` reaches *sideways* into later siblings — and neither needs a line of JavaScript. Reach for named variants only once you have more than one group or peer relationship on the same page that could otherwise collide.`,
    },
    {
      name: "ARIA, Data Attributes & Stacking Modifiers",
      minutes: 10,
      intro: "Style elements off ARIA state, JS-driven data attributes, descendant presence, and structural position — then combine several modifiers at once.",
      content: `### aria-*: — styling from accessibility state

Tailwind can read boolean and enumerated \`aria-*\` attributes directly and turn them into variants. This is exactly the kind of state a headless UI library (Radix, React Aria, Headless UI) already puts on the DOM for you — so you style it instead of duplicating it in a JS class-toggle.

\`\`\`html
<button
  role="checkbox"
  aria-checked="true"
  class="h-5 w-5 rounded border border-slate-300 aria-checked:bg-blue-600 aria-checked:border-blue-600"
>
</button>

<button
  aria-expanded="false"
  class="flex items-center gap-1 [&>svg]:aria-expanded:rotate-180"
>
  Filters
  <svg class="h-4 w-4 transition-transform"><!-- chevron --></svg>
</button>
\`\`\`

\`aria-checked:\` compiles to \`[aria-checked="true"]\`, and \`aria-expanded:\` to \`[aria-expanded="true"]\` — Tailwind ships variants for the common boolean ARIA attributes (\`aria-checked\`, \`aria-disabled\`, \`aria-expanded\`, \`aria-hidden\`, \`aria-pressed\`, \`aria-readonly\`, \`aria-required\`, \`aria-selected\`) out of the box. For anything else, use the arbitrary form \`aria-[sort=ascending]:*\`.

### data-*: — styling from JS-driven state

Many component libraries toggle \`data-state\`, \`data-open\`, or similar attributes instead of classes. Tailwind's arbitrary data variant reads them directly:

\`\`\`html
<div
  data-state="open"
  class="data-[state=open]:block data-[state=closed]:hidden
         rounded-md border border-slate-200 p-4 shadow-lg"
>
  Dropdown content
</div>

<div data-loading class="opacity-100 data-loading:opacity-50 data-loading:pointer-events-none">
  <!-- disabled shimmer while a boolean data-loading attribute is present -->
</div>
\`\`\`

\`data-[state=open]:\` compiles to \`[data-state="open"]\`; a bare \`data-loading:\` compiles to \`[data-loading]\`, matching whenever the attribute exists regardless of its value. This lets you drive Tailwind styling from a library's internal state machine without ever touching a \`className\` toggle yourself.

### has-*: — styling a parent based on a descendant

\`has-*\` wraps the CSS \`:has()\` relational pseudo-class, letting a **parent** react to something happening **inside** it — the reverse direction of \`group\`, and without needing to add a \`group\` class at all:

\`\`\`html
<div class="rounded-lg border border-slate-200 p-4 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
  <label class="flex items-center gap-2">
    <input type="checkbox" />
    <span>Enable notifications</span>
  </label>
</div>

<fieldset class="has-[:invalid]:border-red-500 border rounded-md p-4">
  <input type="email" required />
</fieldset>
\`\`\`

\`has-[:checked]:\` compiles to \`:has(:checked)\`. Because \`:has()\` accepts any selector, you can also use the shorthand variants Tailwind derives from it, like \`has-checked:\` or \`has-disabled:\`, for the common cases.

### not-*: — the inverse of any variant

\`not-*\` wraps CSS's \`:not()\`, negating whatever variant you give it:

\`\`\`html
<button class="not-hover:opacity-75 bg-blue-600 text-white px-4 py-2 rounded-md">
  Only fully opaque while hovered
</button>

<li class="not-last:border-b border-slate-200 py-2">
  <!-- every item gets a divider except the last one -->
</li>
\`\`\`

\`not-last:border-b\` is often clearer to read than reaching for \`:not(:last-child)\` by hand, and it composes with any other variant Tailwind knows about.

### Structural variants — position within a list of siblings

These map to CSS structural pseudo-classes and don't need any attribute at all — just DOM position:

| Variant | CSS | Matches |
|---------|-----|---------|
| \`first:\` | \`:first-child\` | the first element among its siblings |
| \`last:\` | \`:last-child\` | the last element among its siblings |
| \`only:\` | \`:only-child\` | an element with no siblings at all |
| \`odd:\` | \`:nth-child(odd)\` | 1st, 3rd, 5th... sibling |
| \`even:\` | \`:nth-child(even)\` | 2nd, 4th, 6th... sibling |

\`\`\`html
<table class="w-full text-left">
  <tbody>
    <tr class="odd:bg-white even:bg-slate-50">
      <td class="p-2">Row one</td>
    </tr>
    <tr class="odd:bg-white even:bg-slate-50">
      <td class="p-2">Row two</td>
    </tr>
  </tbody>
</table>

<div class="flex gap-4">
  <div class="p-3 first:ml-0 last:mr-0 mx-2 rounded bg-slate-100">Item</div>
</div>
\`\`\`

Zebra-striped tables (\`odd:\`/\`even:\`) and \`remove the outer margin on the first/last item\` (\`first:\`/\`last:\`) are the two patterns you'll reach for constantly — both save you from adding a conditional class in your JS.

### Stacking modifiers — order doesn't matter, all conditions must hold

Every variant you've seen — responsive (\`md:\`), dark mode (\`dark:\`), state (\`hover:\`, \`group-hover:\`) — can be chained. Tailwind ANDs them together: the utility only applies when *every* stacked condition is true.

\`\`\`html
<a
  href="/settings"
  class="group block rounded-lg p-4
         md:group-hover:dark:text-white
         md:group-hover:dark:bg-slate-800"
>
  <span class="text-slate-700 dark:text-slate-300">Settings</span>
</a>
\`\`\`

\`md:group-hover:dark:text-white\` only applies when **all three** are true at once: the viewport is \`md\` or wider, the \`group\` ancestor is hovered, and dark mode is active. Read a stacked class left to right as a chain of \`AND\`s — there's no fixed ordering requirement, but Tailwind's own convention (and its class sorter, if you use the Prettier plugin) puts responsive first, then interaction state, then color scheme, then the base utility last.

> **Key idea:** \`aria-*\` and \`data-*\` variants let Tailwind style off state a component library already puts on the DOM, \`has-*\`/\`not-*\` cover relational and negated selectors CSS itself supports, and any of these can be chained with responsive/dark-mode variants — Tailwind just ANDs every prefix together into one compound condition.`,
    },
  ],
}
