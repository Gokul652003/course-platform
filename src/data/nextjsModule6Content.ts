import type { Module } from "../types"

export const nextjsModule6: Module = {
  id: 6,
  title: "Styling in Next.js",
  status: "upcoming",
  lessons: [
    {
      name: "Global CSS & CSS Modules",
      minutes: 8,
      intro: "The two built-in styling approaches, and when to reach for each.",
      content: `### Global CSS

\`\`\`css
/* app/globals.css */
body {
  font-family: sans-serif;
  margin: 0;
}

h1 {
  font-size: 2rem;
}
\`\`\`

\`\`\`tsx
// app/layout.tsx
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

Global CSS can only be imported **once**, in the root layout — it applies to the entire application, exactly like a traditional site-wide stylesheet. Reach for it for true global concerns: CSS resets, base typography, CSS custom properties (variables) shared across the whole app.

### The problem global CSS doesn't solve: naming collisions

\`\`\`css
/* two different components both define ".card" — whichever loads last wins, unpredictably */
.card { padding: 1rem; }
\`\`\`

In a large app, plain global class names inevitably collide between unrelated components — a classic source of "why did my styles just break" bugs as a codebase grows.

### CSS Modules: automatically scoped class names

\`\`\`css
/* app/dashboard/Card.module.css */
.card {
  padding: 1rem;
  border-radius: 8px;
}
\`\`\`

\`\`\`tsx
// app/dashboard/Card.tsx
import styles from "./Card.module.css"

export function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>
}
\`\`\`

A file named \`*.module.css\` is a **CSS Module** — Next.js (via its bundler) automatically rewrites \`.card\` into a unique, scoped class name (something like \`Card_card__a1b2c\`) at build time, guaranteeing it can never collide with a \`.card\` class defined anywhere else in the app. You still write plain CSS — the scoping is entirely automatic.

### Combining multiple classes conditionally

\`\`\`tsx
import styles from "./Card.module.css"

export function Card({ featured }: { featured?: boolean }) {
  return (
    <div className={\`\${styles.card} \${featured ? styles.featured : ""}\`}>
      Content
    </div>
  )
}
\`\`\`

Since \`styles.card\` is just a string (the generated scoped class name), combining conditional classes works the same way it would with any plain \`className\` string — no special API needed, though a small utility like \`clsx\` is common for readability once conditions get more complex.

> **Key idea:** global CSS (imported once, in the root layout) for true app-wide styles; CSS Modules (\`*.module.css\`, imported per-component) for anything component-specific, getting automatic name-collision safety for free.`,
    },
    {
      name: "Tailwind CSS in Next.js",
      minutes: 8,
      intro: "The most common styling choice in the Next.js ecosystem, and how it's wired up.",
      content: `### Setup, via create-next-app

\`\`\`bash
npx create-next-app@latest my-app
# select "Yes" when asked about Tailwind CSS
\`\`\`

Choosing Tailwind during \`create-next-app\` scaffolds everything needed automatically — the PostCSS config, a \`globals.css\` with Tailwind's directives, and the generated project ready to use utility classes immediately, no manual configuration required.

### Utility classes instead of separate stylesheets

\`\`\`tsx
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {children}
    </div>
  )
}
\`\`\`

Rather than writing CSS in a separate file (as with CSS Modules), Tailwind styles are applied directly via class names in the markup itself — each class maps to one specific CSS rule (\`p-4\` = padding, \`rounded-lg\` = border-radius). No naming-collision problem to solve at all, since you're rarely inventing new class names — just composing existing utilities.

### Why Tailwind pairs particularly well with Server Components

Because Tailwind's classes are static strings resolved entirely at build time (an included build step scans your source for class names and generates only the CSS actually used), there's no runtime JavaScript needed to apply styles — unlike some older CSS-in-JS approaches. This fits naturally with Server Components shipping zero JS: the styling story doesn't fight against that goal the way a runtime CSS-in-JS library historically could.

### Responsive and state-based styling, inline

\`\`\`tsx
<button className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 md:px-6 px-4 py-2 rounded text-white">
  Submit
</button>
\`\`\`

Prefixes like \`hover:\`, \`disabled:\`, and breakpoint prefixes like \`md:\` let you express interaction and responsive states directly alongside the base styles, without writing separate media queries or pseudo-class rules by hand.

### Sharing repeated utility combinations

\`\`\`tsx
// components/Button.tsx
export function Button({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      {...props}
    >
      {children}
    </button>
  )
}
\`\`\`

Rather than repeating a long class string on every button across the app, extract a small React component — the standard way to avoid duplication with Tailwind, since Tailwind itself has no built-in "define a reusable class combination" mechanism beyond React composition.

> **Key idea:** Tailwind moves styling into the markup as composable utility classes, resolved at build time with no runtime cost — a natural fit alongside Server Components, and the most common styling choice in current Next.js projects.`,
    },
    {
      name: "Choosing a Styling Approach",
      minutes: 6,
      intro: "Weighing CSS Modules, Tailwind, and component libraries against real project needs.",
      content: `### The realistic options

| Approach | Best for |
|---|---|
| Global CSS | App-wide resets, base typography, CSS variables |
| CSS Modules | Component-scoped styles, teams already comfortable with plain CSS |
| Tailwind CSS | Fast iteration, consistent design tokens, the current ecosystem default |
| Component library (shadcn/ui, MUI, Chakra) | Pre-built, accessible components — less styling written by hand at all |

### CSS-in-JS: a note on Server Components

Older CSS-in-JS libraries (styled-components, Emotion) that generate styles **at runtime in JavaScript** face a real tension with Server Components — that runtime style-generation is exactly the kind of client-side JavaScript work Server Components are designed to avoid shipping. Some of these libraries have added App Router support, but it typically requires extra configuration, and the fit is less natural than Tailwind or CSS Modules, both of which resolve entirely at build/server time. Worth knowing about as a tradeoff if a project is already invested in one of these libraries — not something to newly adopt for a Server-Component-first app without a specific reason.

### Component libraries: a different tradeoff

\`\`\`bash
npx shadcn@latest add button
\`\`\`

Rather than styling from scratch, tools like **shadcn/ui** generate the actual component *source code* directly into your project (not an installed dependency you can't see inside) — pre-built on top of Tailwind, with accessibility (keyboard navigation, ARIA attributes) handled for you. This is a meaningfully different model from a traditional component library like Material UI, which you install and import as an opaque package — shadcn's components live in your own codebase, fully editable.

### A practical default for a new project

For most new Next.js projects today, **Tailwind CSS**, optionally layered with a component library like shadcn/ui for common interactive pieces (dialogs, dropdowns, date pickers), is the most common and well-supported combination — extensive documentation, broad community usage, and no runtime-CSS-in-JS tension with Server Components.

### It's genuinely fine to mix approaches

\`\`\`tsx
import styles from "./ComplexChart.module.css"   // CSS Modules for one intricate component

export function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">   {/* Tailwind for the layout */}
      <div className={styles.chartContainer}>   {/* CSS Modules for something with lots of specific, one-off styling */}
        <Chart />
      </div>
    </div>
  )
}
\`\`\`

Nothing about Next.js forces a single styling approach across an entire project — using Tailwind for most of an app and CSS Modules for one component with unusually complex, hard-to-express-as-utilities styling is a completely reasonable choice, not an anti-pattern.

> **Key idea:** there's no single "correct" styling approach in Next.js — Tailwind is the current ecosystem default for good practical reasons (build-time resolution, no Server Component tension), but CSS Modules remain a solid, simpler choice, and mixing approaches within one project is normal.`,
    },
  ],
}
