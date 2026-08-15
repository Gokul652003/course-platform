import type { Module } from "../types"

export const htmlModule4: Module = {
  id: 4,
  title: "Images & Media",
  status: "upcoming",
  lessons: [
    {
      name: "The img Element & Alt Text",
      minutes: 9,
      intro: "Embedding images correctly, and why the alt attribute is never optional.",
      content: `### Basic image embedding

\`\`\`html
<img src="cat.jpg" alt="A gray tabby cat sleeping on a windowsill">
\`\`\`

\`<img>\` is a **void element** — no closing tag, no content between tags. Two attributes matter most:

- **\`src\`** — the path to the image file (relative or absolute, same rules as links).
- **\`alt\`** — a text description of the image.

### Why alt is mandatory, not optional

\`alt\` serves three separate purposes, all important:

1. **Screen readers** read it aloud in place of the image — it's the *only* way a blind user knows what the image shows.
2. **Broken images** show the alt text if the file fails to load.
3. **Search engines** use it to understand and index the image.

\`\`\`html
<!-- bad: no alt at all -->
<img src="chart.png">

<!-- bad: useless alt -->
<img src="chart.png" alt="image">

<!-- good: describes the actual content -->
<img src="chart.png" alt="Bar chart showing revenue growing 40% year over year">
\`\`\`

### Decorative images

If an image is purely decorative and adds no information (a background flourish, a repeated icon next to text that already says the same thing), use an **empty** alt — not a missing one:

\`\`\`html
<img src="divider-flourish.png" alt="">
\`\`\`

An empty \`alt=""\` tells screen readers to skip the image entirely. A *missing* \`alt\` attribute makes some screen readers announce the whole filename instead — worse than nothing.

### Sizing images

\`\`\`html
<img src="photo.jpg" alt="Mountain sunrise" width="800" height="600">
\`\`\`

Always include \`width\` and \`height\` (the image's natural pixel dimensions). The browser reserves that space before the image loads, preventing the rest of the page from jumping around as images pop in — a real, measurable improvement to how a page feels to use.

> **Key idea:** every \`<img>\` needs an \`alt\` — either a real description, or an explicit empty string for decoration. There is no valid case for omitting it entirely.`,
    },
    {
      name: "Responsive Images",
      minutes: 9,
      intro: "Serving the right image size for the screen, using srcset and picture.",
      content: `### The problem

A single 3000px-wide image looks great on a desktop monitor but wastes bandwidth on a phone screen that only needs 400px. Responsive images let the browser pick an appropriately sized file.

### srcset with width descriptors

\`\`\`html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Mountain sunrise"
>
\`\`\`

- \`srcset\` lists available image files with their actual width (\`400w\` = 400 pixels wide).
- \`sizes\` tells the browser how much space the image will occupy in the layout, so it can pick the best-fitting file — here, full viewport width on small screens, half the viewport otherwise.
- \`src\` is the fallback for browsers that don't support \`srcset\`.

The browser — not you — decides which file to download, based on screen size and pixel density.

### picture for art direction

When you want a genuinely *different* image (not just a different size) depending on screen size — e.g. a cropped version for mobile — use \`<picture>\`:

\`\`\`html
<picture>
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg">
  <source media="(max-width: 1200px)" srcset="hero-tablet.jpg">
  <img src="hero-desktop.jpg" alt="Team collaborating around a table">
</picture>
\`\`\`

The browser checks each \`<source>\` top to bottom and uses the first matching \`media\` condition. The \`<img>\` at the end is both the fallback and where \`alt\` always lives — \`<source>\` elements never get their own \`alt\`.

### Serving modern formats with a fallback

\`\`\`html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="Mountain sunrise">
</picture>
\`\`\`

Browsers that understand AVIF or WebP (smaller file sizes) use those; older browsers fall through to the plain JPEG.

> **Key idea:** \`srcset\` is for "same image, different sizes." \`<picture>\` is for "different image depending on context," or serving next-gen formats with a safe fallback.`,
    },
    {
      name: "Audio & Video",
      minutes: 9,
      intro: "Embedding native media playback without a plugin or third-party library.",
      content: `### Video

\`\`\`html
<video src="demo.mp4" controls width="640" height="360">
  Your browser doesn't support video playback.
</video>
\`\`\`

- \`controls\` shows the browser's built-in play/pause/volume/fullscreen UI. Without it, the video is invisible and unplayable to the user — always include it unless you're building fully custom JS controls.
- The text inside the tag is a fallback shown only in ancient browsers that don't support \`<video>\` at all.

### Multiple sources for format compatibility

\`\`\`html
<video controls width="640" height="360">
  <source src="demo.webm" type="video/webm">
  <source src="demo.mp4" type="video/mp4">
  Your browser doesn't support video playback.
</video>
\`\`\`

The browser picks the first \`<source>\` it can actually play.

### Useful video attributes

\`\`\`html
<video src="hero-bg.mp4" autoplay muted loop playsinline></video>
\`\`\`

- \`autoplay\` — starts playing automatically. Browsers **require** \`muted\` alongside it, or autoplay is silently blocked — unmuted autoplay is a well-known abusive pattern browsers actively prevent.
- \`loop\` — restarts from the beginning when it ends.
- \`playsinline\` — on iOS, plays inline instead of forcing fullscreen.
- \`poster="thumbnail.jpg"\` — an image shown before playback starts.

### Audio

Same idea, audio-only:

\`\`\`html
<audio src="podcast-episode.mp3" controls></audio>
\`\`\`

Also supports multiple \`<source>\` children for format fallback, exactly like \`<video>\`.

### Captions and subtitles

\`\`\`html
<video src="lecture.mp4" controls>
  <track kind="subtitles" src="lecture-en.vtt" srclang="en" label="English">
  <track kind="captions" src="lecture-en-cc.vtt" srclang="en" label="English (captions)">
</video>
\`\`\`

\`<track>\` points to a \`.vtt\` (WebVTT) file of timestamped text. \`subtitles\` assumes viewers can hear but not understand the language; \`captions\` includes non-speech audio cues (\`[music]\`, \`[door slams]\`) for deaf and hard-of-hearing viewers.

> **Key idea:** always include \`controls\` for user-initiated playback, always pair \`autoplay\` with \`muted\`, and provide captions for any video with spoken or important audio content.`,
    },
    {
      name: "Embedding, iframes & figure/figcaption",
      minutes: 8,
      intro: "Pulling in outside content, and giving media a proper caption.",
      content: `### iframe: embedding another page

\`<iframe>\` embeds an entire external document — a YouTube player, a Google Map, another site's widget — inside your page:

\`\`\`html
<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  width="560"
  height="315"
  title="Video player"
  allowfullscreen
></iframe>
\`\`\`

Always give an \`<iframe>\` a \`title\` — screen readers announce it so users know what the embedded frame contains before deciding whether to interact with it.

### iframes are a security boundary

Content inside an \`<iframe>\` runs in its own isolated context — it can't reach into your page's JavaScript or DOM (and vice versa) unless both sides explicitly opt in. This is exactly why they're safe for embedding third-party content like ads or widgets.

\`\`\`html
<iframe src="https://maps.example.com/embed?q=..." sandbox="allow-scripts"></iframe>
\`\`\`

The \`sandbox\` attribute can further restrict what an embedded page is allowed to do (run scripts, submit forms, open popups) — useful when embedding untrusted content.

### figure and figcaption

\`<figure>\` groups a piece of self-contained content (usually an image, but also a code block, chart, or quote) with its caption:

\`\`\`html
<figure>
  <img src="chart.png" alt="Bar chart showing quarterly revenue">
  <figcaption>Fig. 1 — Revenue by quarter, 2025</figcaption>
</figure>
\`\`\`

The key semantic idea: a \`<figure>\` is content that could be moved to an appendix or a different part of the page **without breaking the flow of the surrounding text** — it's referenced, not embedded inline like a word.

### figure with a quote

\`\`\`html
<figure>
  <blockquote>
    <p>The best way to predict the future is to invent it.</p>
  </blockquote>
  <figcaption>— Alan Kay</figcaption>
</figure>
\`\`\`

\`<figcaption>\` can be the first or last child of \`<figure>\` — it associates with whichever position it's placed in.

> **Key idea:** \`<iframe>\` embeds a whole separate document with real isolation; \`<figure>\`/\`<figcaption>\` is purely semantic — a caption tied to its content, movable as a unit.`,
    },
  ],
}
