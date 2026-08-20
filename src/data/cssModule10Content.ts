import type { Module } from "../types"

export const cssModule10: Module = {
  id: 10,
  title: "Animations",
  status: "upcoming",
  lessons: [
    {
      name: "@keyframes & the animation Shorthand",
      minutes: 12,
      intro: "Define motion with @keyframes and drive it with the animation properties — duration, timing, iteration, direction, and fill mode.",
      content: `## From transitions to animations

**Transitions** (covered in the previous module) interpolate between two states — a starting value and an ending value — and only run in response to a trigger like \`:hover\` or a class toggle. **Animations** are a different tool: they let you define an arbitrary sequence of states with \`@keyframes\`, then play that sequence automatically, repeatedly, and independently of any user interaction. If a transition is "move from A to B when something changes," an animation is "run this whole choreographed sequence, on a loop, starting now."

Animations are what you reach for when you need a spinner that never stops turning, a pulsing notification badge, an entrance effect that plays on page load, or any multi-step motion that a simple two-state transition can't express.

### Defining a @keyframes sequence

A \`@keyframes\` rule is a named list of style snapshots at specific points along the animation's timeline. The simplest form uses \`from\` and \`to\`, which are just aliases for 0% and 100%:

\`\`\`css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
\`\`\`

This says nothing about *how long* the animation takes or *when* it plays — \`@keyframes\` only describes the shape of the motion. Duration, timing, and playback are all controlled separately by the \`animation-*\` properties on the element itself. That separation is deliberate: the same \`@keyframes\` definition can be reused by many elements, each with its own duration or delay.

For anything more than a simple A-to-B fade, use percentage-based steps:

\`\`\`css
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.85;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
\`\`\`

Each percentage is a checkpoint along the timeline, and the browser interpolates smoothly between consecutive checkpoints — exactly like a transition, just chained across multiple stops instead of one. You can add as many percentage stops as you need, and you don't have to space them evenly:

\`\`\`css
@keyframes attention-bounce {
  0% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-12px);
  }
  50% {
    transform: translateY(0);
  }
  70% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}
\`\`\`

A property left unset at a given keyframe simply isn't animated at that point — if only \`opacity\` appears in a keyframe, \`transform\` (if animated elsewhere) keeps interpolating from its own last defined value. Only properties that are genuinely **animatable** work here — the same category as transitions: things like \`transform\`, \`opacity\`, \`color\`, \`background-color\`, and lengths. Properties like \`display\` don't have anything to interpolate between and jump instantly at whichever keyframe defines them.

### Attaching the animation to an element

Once \`@keyframes\` exists, an element opts in with \`animation-name\` and \`animation-duration\` — duration is required, or the animation runs with a duration of \`0s\` and produces no visible motion at all:

\`\`\`css
.badge {
  animation-name: pulse;
  animation-duration: 1.5s;
}
\`\`\`

### animation-timing-function

Just like \`transition-timing-function\`, this controls the *pacing* of the interpolation between keyframes, not the keyframes themselves. The same keyword and \`cubic-bezier()\` values from the transitions module apply here:

| Value | Feel |
|---|---|
| \`linear\` | Constant speed, mechanical — good for spinners |
| \`ease\` (default) | Slight ease-in, stronger ease-out |
| \`ease-in\` | Starts slow, ends fast |
| \`ease-out\` | Starts fast, ends slow |
| \`ease-in-out\` | Slow at both ends, fast in the middle |
| \`cubic-bezier(...)\` | Fully custom curve |
| \`steps(n)\` | Jumps through \`n\` discrete positions instead of interpolating smoothly |

\`steps()\` deserves a callout here because it's far more common in animations than in transitions — it's the standard technique for sprite-sheet-style animations (like an old-school flipbook or a loading-dots effect where each "frame" should snap rather than glide):

\`\`\`css
@keyframes dot-cycle {
  0%, 100% {
    content: "";
  }
}

.loading-dots::after {
  animation: dot-cycle 1.2s steps(4) infinite;
}
\`\`\`

You can also set a timing function *per keyframe stop* by writing \`animation-timing-function\` inside an individual keyframe block, which overrides the element-level value just for the segment leaving that stop — useful for a bounce that eases out on the way up and eases in on the way down.

### animation-delay

Like \`transition-delay\`, this waits before the animation starts:

\`\`\`css
.toast {
  animation-name: slide-in;
  animation-duration: 0.4s;
  animation-delay: 0.2s;
}
\`\`\`

A negative delay is also legal and has a specific meaning: the animation starts immediately, but as if it had already been running for that long — effectively skipping ahead into the sequence. \`animation-delay: -1s\` on a 2s animation starts it already halfway through. This is a common trick for staggering multiple copies of the *same* looping animation so they don't all pulse in lockstep.

### animation-iteration-count

Controls how many times the sequence repeats. A plain number repeats that many times (fractional values are allowed too, and stop partway through the final cycle):

\`\`\`css
.shake-once {
  animation-name: shake;
  animation-duration: 0.3s;
  animation-iteration-count: 1;
}

.spinner {
  animation-name: spin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
\`\`\`

\`infinite\` is the keyword you'll reach for constantly — spinners, pulsing indicators, background shimmer effects, anything meant to keep running as long as it's on screen.

### animation-direction

Controls which way the timeline plays on each iteration:

| Value | Behavior |
|---|---|
| \`normal\` (default) | Always plays 0% -> 100% |
| \`reverse\` | Always plays 100% -> 0% |
| \`alternate\` | Odd iterations play forward, even iterations play backward |
| \`alternate-reverse\` | Odd iterations play backward, even iterations play forward |

\`alternate\` is what makes a "breathing" pulse animation look smooth and continuous — without it, an \`infinite\` animation snaps back to 0% instantly at the end of every cycle, producing a visible jump. With \`alternate\`, the animation plays forward, then backward, then forward again, so the motion reverses smoothly instead of resetting.

### animation-fill-mode

This is the property beginners misunderstand most often, because it governs what happens *outside* the animation's active window — before it starts (during a delay) and after it finishes. By default, \`@keyframes\` styles only apply *while the animation is actually running*; the moment it ends, the element snaps back to whatever its normal CSS says, undoing every bit of the animation's visual effect.

| Value | Before start (during delay) | After end |
|---|---|---|
| \`none\` (default) | Element uses its normal, non-animated styles | Element snaps back to its normal, non-animated styles |
| \`forwards\` | Element uses its normal styles | Element **keeps** the styles from the final keyframe (100%, or the last one reached) |
| \`backwards\` | Element **takes on** the styles from the first keyframe (0%) immediately, even during the delay | Element snaps back to normal styles |
| \`both\` | Applies the first keyframe's styles during the delay (like \`backwards\`) | Keeps the last keyframe's styles after finishing (like \`forwards\`) |

In concrete terms: a fade-in animation that goes from \`opacity: 0\` to \`opacity: 1\` will, without a fill-mode, flash to full opacity and then instantly snap back to whatever \`opacity\` the element's normal CSS specifies — often \`1\` anyway, which can hide the bug, but if the base style is something else, the jump is obvious and jarring. \`animation-fill-mode: forwards\` fixes this by keeping the element at \`opacity: 1\` once the animation completes, instead of reverting.

\`backwards\` matters specifically when there's a delay: without it, during the delay period the element shows its normal styles (e.g. fully visible), then abruptly jumps to the 0% keyframe's styles (e.g. invisible) the instant the animation begins — a visible pop right before the animation starts. With \`backwards\`, the 0% styles apply immediately, even during the delay, so there's no pop.

For a one-shot entrance animation with a delay, \`both\` is almost always the right choice — it prevents the pre-start pop *and* keeps the post-end result.

### The animation shorthand

Like \`transition\`, all of these properties have a combined shorthand. The accepted order is:

\`\`\`
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
\`\`\`

In practice, most real animations only need a handful of these values, and the shorthand is forgiving about which ones you include — a duration is recognized as the first \`<time>\` value, a delay as the second:

\`\`\`css
.spinner {
  animation: spin 1s linear infinite;
}

.toast {
  animation: slide-in 0.4s ease-out 0.2s both;
}
\`\`\`

Multiple animations can run on one element by comma-separating full shorthand declarations:

\`\`\`css
.card {
  animation:
    fade-in 0.3s ease-out both,
    slide-up 0.3s ease-out both;
}
\`\`\`

As with the \`transition\` shorthand, reaching for the longhand properties instead is often clearer once you have more than two or three values to set, especially \`animation-fill-mode\`, which is easy to lose track of buried in a long shorthand list.

\`\`\`css
/* Full example, longhand for clarity */
.notification {
  animation-name: slide-in;
  animation-duration: 0.35s;
  animation-timing-function: ease-out;
  animation-delay: 0.1s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: both;
}
\`\`\`

> **Key idea:** \`@keyframes\` describes the *shape* of a motion sequence as named percentage checkpoints; the \`animation-*\` properties control how that sequence *plays* — and \`animation-fill-mode\` is the property that decides whether the element keeps its animated appearance before the delay ends and after the animation finishes, instead of snapping back to its unanimated CSS.`,
    },
    {
      name: "Animation Control & Performance",
      minutes: 11,
      intro: "Pause and resume animations, hint the browser with will-change, animate cheap properties only, and respect prefers-reduced-motion.",
      content: `## Pausing and resuming with animation-play-state

\`animation-play-state\` lets you freeze a running animation exactly where it is, and resume it from that same point — the animation doesn't restart, it just stops advancing. The two values are \`running\` (default) and \`paused\`.

The most common use is pausing an infinite animation on hover, so a user can inspect something mid-motion:

\`\`\`css
.spinner {
  animation: spin 1s linear infinite;
}

.spinner:hover {
  animation-play-state: paused;
}
\`\`\`

This also works well for decorative background animations that should pause when a user hovers over a card to read its content, or for a carousel that should stop auto-advancing while the pointer is over it:

\`\`\`css
.marquee {
  animation: scroll-left 20s linear infinite;
}

.marquee:hover {
  animation-play-state: paused;
}
\`\`\`

It's toggled from JavaScript too, by setting \`element.style.animationPlayState = "paused"\` — useful for pausing animations when a tab loses focus, or synchronizing a "play/pause" UI control with a CSS-driven animation instead of reimplementing the animation in JS.

## will-change

\`will-change\` is a hint to the browser that a property is *about* to change, so the browser can prepare ahead of time — typically by promoting the element to its own compositor layer before the change happens, rather than scrambling to do so at the first frame of the animation.

\`\`\`css
.card {
  will-change: transform;
}

.card:hover {
  transform: translateY(-4px);
}
\`\`\`

It sounds like a free performance switch to flip on everything, but it isn't, and using it carelessly can make performance *worse*:

- Promoting an element to its own layer consumes GPU memory, and every layer the browser has to manage and composite has a cost. Applying \`will-change\` broadly (or leaving it on permanently) can multiply that cost across dozens of elements for no benefit.
- Browsers already optimize \`transform\` and \`opacity\` animations well **without** \`will-change\` in most modern engines — so applying it "just in case" often creates memory overhead with no measurable speedup.
- \`will-change\` is a hint, not a guarantee, and some browsers cap how many layers they'll create from it.

The practical guidance: reserve \`will-change\` for animations you've actually observed being janky in devtools, apply it only to the specific property that's changing, and — ideally — add and remove it dynamically right before and after the animation runs (e.g. on \`:hover\` start, or via a short-lived class toggled in JS) rather than leaving it set permanently in your base CSS. Setting it on hover, as in the example above, is a reasonable middle ground since it only applies while relevant.

## Cheap vs expensive properties to animate

This ties directly back to the transitions module's coverage of the rendering pipeline: **layout -> paint -> composite**. The same rule applies to \`@keyframes\` animations, and it matters even more here because animations often run continuously and for longer durations than a one-off transition.

| Property category | Examples | Pipeline stage | Cost |
|---|---|---|---|
| Transform & opacity | \`transform\` (translate/scale/rotate), \`opacity\` | Composite only | Cheap — runs on the GPU, skips layout and paint |
| Paint-only properties | \`color\`, \`background-color\`, \`box-shadow\`, \`border-color\` | Paint + composite | Moderate — repaints pixels every frame, no layout |
| Layout-triggering properties | \`width\`, \`height\`, \`top\`/\`left\` (with positioned elements), \`margin\`, \`padding\` | Layout + paint + composite | Expensive — recalculates geometry for the element and potentially its neighbors, every frame |

Animating \`width\` to grow a box, or animating \`top\`/\`left\` to move it, forces the browser to run **layout** on every single frame of the animation — often 60 times a second. On a complex page, that's enough to drop frames and produce visibly janky motion. The fix is almost always the same one used for transitions: animate \`transform: translateX()\`/\`translateY()\` instead of \`left\`/\`top\`, and \`transform: scale()\` instead of \`width\`/\`height\`, whenever the visual result is equivalent.

\`\`\`css
/* Expensive: triggers layout every frame */
@keyframes slide-bad {
  from { left: 0; }
  to { left: 300px; }
}

/* Cheap: composite-only, GPU-accelerated */
@keyframes slide-good {
  from { transform: translateX(0); }
  to { transform: translateX(300px); }
}
\`\`\`

A spinning loader is a good example of a "for free" animation done right: \`transform: rotate()\` never touches layout or paint at all, so it can run \`infinite\` indefinitely with essentially zero ongoing cost.

## Respecting prefers-reduced-motion

Some users experience genuine discomfort — dizziness, nausea, or triggered vestibular disorders — from large-scale motion, parallax, or constantly-looping animations. Operating systems expose a setting for this (e.g. "Reduce Motion" in macOS/iOS Accessibility settings, a similar toggle in Windows and Android), and CSS can read it via the \`prefers-reduced-motion\` media feature.

The respectful default is to wrap non-essential animations in a media query, so they're skipped entirely for users who've opted out at the OS level:

\`\`\`css
.hero-banner {
  animation: fade-in-slide 0.6s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-banner {
    animation: none;
  }
}
\`\`\`

An even more robust pattern is to write the *reduced* styles as the default, and only opt into motion when the user hasn't asked to reduce it — this way, any animation you forget to gate explicitly still fails safe:

\`\`\`css
@media (prefers-reduced-motion: no-preference) {
  .hero-banner {
    animation: fade-in-slide 0.6s ease-out both;
  }
}
\`\`\`

This isn't just an edge case for a tiny minority — it's increasingly treated as a baseline accessibility requirement, similar to color contrast, and is worth budgeting time for on any project with more than incidental motion. Purely decorative, large, or fast-looping animations (auto-playing carousels, parallax scroll effects, aggressive attention-grabbing bounces) are the highest-priority candidates to gate; small, subtle transitions like a button's hover-color change are generally left alone since they carry negligible risk.

## Debugging animations in devtools

Browser devtools (Chrome, Firefox, Safari all have some version of this) include an **Animations panel** that shows every running CSS animation and transition on the page as a scrubbable timeline. It lets you slow playback down, pause at any point, and inspect exactly which keyframe or interpolated value is active at a given moment — far more precise than eyeballing motion in real time. When an animation looks wrong (wrong easing, wrong duration, snapping instead of easing), this panel is the fastest way to confirm what's actually happening versus what the CSS says should happen. Chrome's Elements panel also flags an element's active \`will-change\` and animation state directly in the Styles pane, which is useful for confirming a layer promotion actually took effect.

> **Key idea:** Pause animations with \`animation-play-state\`, reserve \`will-change\` for observed jank rather than blanket use, stick to animating \`transform\`/\`opacity\` wherever possible to keep animations on the cheap composite-only path, and always gate non-essential motion behind \`prefers-reduced-motion\` so it can be turned off for users who need it off.`,
    },
    {
      name: "Building Real Animations",
      minutes: 12,
      intro: "Put it all together: a loading spinner, a card entrance animation, a staggered list, and a look at scroll-driven animations on the horizon.",
      content: `## A loading spinner

The classic spinner is a single rotating element — cheap, GPU-accelerated, and infinitely repeatable without ever touching layout or paint. The trick to a clean spinner shape is a circular border where one side is a different color, so rotation reads as motion rather than a static ring:

\`\`\`html
<div class="spinner" role="status" aria-label="Loading"></div>
\`\`\`

\`\`\`css
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 2.5s;
  }
}
\`\`\`

A few details worth noting: \`linear\` timing is essential here — any easing would make the rotation speed up and slow down every cycle, which looks broken rather than smooth. \`role="status"\` and \`aria-label\` matter because a purely visual spinner communicates nothing to a screen reader without them. And rather than disabling the spinner's motion entirely under \`prefers-reduced-motion\` (which would leave users with no loading indicator at all), slowing it down is a reasonable compromise for an animation that's communicating real state rather than decorating the page — reserve outright removal for animations that are purely decorative.

## A fade/slide entrance for a card

A common real-world pattern: a card that fades in and slides up slightly when it first appears, giving new content a bit of visual weight instead of popping in abruptly.

\`\`\`html
<div class="card">
  <h3>New message</h3>
  <p>Your export finished processing.</p>
</div>
\`\`\`

\`\`\`css
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: card-enter 0.35s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
  }
}
\`\`\`

The \`both\` fill mode is doing important work: without it, the card would flash back to \`opacity: 0\` (its base state before any animation styles apply) the instant the 0.35s animation ends, since the browser reverts to non-animated CSS once the animation completes. \`both\` keeps the final keyframe's \`opacity: 1\` / \`translateY(0)\` applied permanently after the animation finishes. Only \`transform\` and \`opacity\` are animated, so this stays on the cheap composite-only path even though the card has a shadow and padding that never change.

## A staggered list entrance

Staggering means each item in a list starts its entrance animation slightly after the one before it, so items appear to cascade in one at a time rather than all at once. The mechanism is \`animation-delay\`, set per item via \`:nth-child()\`:

\`\`\`html
<ul class="results">
  <li>Result one</li>
  <li>Result two</li>
  <li>Result three</li>
  <li>Result four</li>
</ul>
\`\`\`

\`\`\`css
@keyframes item-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results li {
  animation: item-enter 0.3s ease-out both;
}

.results li:nth-child(1) { animation-delay: 0s; }
.results li:nth-child(2) { animation-delay: 0.06s; }
.results li:nth-child(3) { animation-delay: 0.12s; }
.results li:nth-child(4) { animation-delay: 0.18s; }
\`\`\`

Hand-writing a delay per \`:nth-child()\` doesn't scale past a handful of known items, so for longer or dynamic lists, generate the rule with a preprocessor loop or, more simply, set a **custom property** per item from a small inline style or a light script and reference it in the delay calculation:

\`\`\`html
<li style="--i: 0">Result one</li>
<li style="--i: 1">Result two</li>
<li style="--i: 2">Result three</li>
\`\`\`

\`\`\`css
.results li {
  animation: item-enter 0.3s ease-out both;
  animation-delay: calc(var(--i) * 0.06s);
}
\`\`\`

This scales to any list length without writing a rule per index, and it's a good example of custom properties and \`calc()\` doing real work together rather than just holding a static color or spacing value. As always, \`both\` keeps each item visible after its own entrance finishes instead of reverting, and the whole pattern should sit behind \`prefers-reduced-motion\` for users who've asked for reduced motion — either by zeroing out the animation entirely or by dropping the \`translateY\` and keeping only a fast opacity fade.

## On the horizon: scroll-driven animations

Everything in this module so far runs on a fixed timeline driven by time — an animation starts and plays for however many seconds you gave it, regardless of what the user is doing. **Scroll-driven animations** are a newer capability that ties an animation's progress to *scroll position* instead of time, using \`animation-timeline\`.

\`\`\`css
@keyframes reveal-on-scroll {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  animation: reveal-on-scroll linear both;
  animation-timeline: scroll();
}
\`\`\`

With \`animation-timeline: scroll()\`, the browser scrubs the keyframes based on how far the page (or a scroll container) has scrolled, instead of how much time has elapsed — no \`animation-duration\` in seconds needed, and no JavaScript scroll listener recalculating styles on every scroll event, which used to be the only way to build effects like scroll-linked progress bars or parallax reveals. There's a related \`view()\` timeline function for tying an animation's progress specifically to an element's visibility within the viewport (a "scroll-into-view" reveal), rather than to the page's overall scroll position.

Support for this landed in Chromium-based browsers first, with other engines catching up, so treat it as a **progressive enhancement** for now — wrap usage behind \`@supports (animation-timeline: scroll())\` and provide a sensible non-animated (or time-based) fallback, rather than depending on it as your only implementation for anything user-facing today. It's mentioned here because it's the clearest sign of where CSS animation is headed: more of what used to require a scroll-event listener and manual style recalculation in JavaScript is steadily moving into declarative CSS.

> **Key idea:** Real animations combine everything from this module — cheap composite-only properties, a fill mode that prevents snapping back, and a reduced-motion fallback — and the next frontier, scroll-driven timelines via \`animation-timeline\`, extends the same \`@keyframes\` mental model to scroll position instead of just time.`,
    },
  ],
}
