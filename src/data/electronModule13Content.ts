import type { Module } from "../types"

export const electronModule13: Module = {
  id: 13,
  title: "Production Deployment & Real-World Patterns",
  status: "in_progress",
  lessons: [
    {
      name: "Structuring a Production Electron + React/Vite App",
      minutes: 9,
      intro: "Lay out a real project combining Electron with a modern React/Vite renderer, with properly separated TypeScript configs for main, preload, and renderer code.",
      content: `## Why a real project needs more structure than the early lessons

Every example so far in this course kept things minimal — a flat \`main.js\`, \`preload.js\`, \`index.html\` — deliberately, to keep each concept isolated. A real production app almost always pairs Electron with a proper front-end build tool (Vite, in this lesson) for the renderer, and needs its main, preload, and renderer code built and typed somewhat independently, since they run in genuinely different environments (Module 2) with different available globals and, often, different TypeScript compiler settings.

## A realistic folder layout

\`\`\`text
my-electron-app/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── main.ts
│   │   ├── ipc-handlers.ts
│   │   └── tsconfig.json        ← targets Node, includes Electron's main-process types
│   ├── preload/
│   │   ├── preload.ts
│   │   └── tsconfig.json        ← targets a narrower, bridge-only surface
│   └── renderer/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.html
│       └── tsconfig.json        ← targets the DOM, no Node types at all
├── shared/
│   └── ipc-channels.ts          ← imported by both main and preload (Module 4)
└── dist/                         ← build output for all three, gitignored
\`\`\`

Separating \`main\`, \`preload\`, and \`renderer\` into sibling directories — each with its own \`tsconfig.json\` — keeps the boundary from Module 2 visible in the project structure itself, not just as a mental model: it becomes structurally awkward (rather than just conceptually wrong) to accidentally \`import\` Node-only code into renderer files, since the renderer's own \`tsconfig.json\` simply doesn't include Node's type definitions at all.

## Build tooling: \`electron-vite\` or a manual Vite setup

Two common approaches handle building all three pieces together:

- **\`electron-vite\`** — a purpose-built tool that configures Vite for all three of main/preload/renderer out of the box, with sensible defaults for each environment's target and externals, and a single \`dev\`/\`build\` command driving all three.
- **A manual multi-config Vite setup** — separate Vite (or plain \`tsc\`) build steps for main/preload, and a standard Vite React app config for the renderer, wired together with npm scripts.

\`electron-vite\` is the lower-friction starting point for a new project specifically because it already encodes the right defaults for each of the three environments; a manual setup gives more control and is worth it once a project's build needs genuinely diverge from those defaults.

## Wiring dev mode: main process loads the Vite dev server

During development, the main process's \`createWindow\` loads the renderer from Vite's dev server (for fast refresh) rather than a built file, switching to \`loadFile\` against built output only in production — the \`loadFile\`/\`loadURL\` distinction from Module 1's first lesson, now used deliberately per environment:

\`\`\`ts
// src/main/main.ts
function createWindow() {
  const win = new BrowserWindow({
    webPreferences: { preload: path.join(__dirname, "../preload/preload.js") },
  })

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173") // Vite's dev server
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}
\`\`\`

\`app.isPackaged\` (introduced in Module 3 for gating DevTools) does double duty here — the same flag distinguishing "development" from "production" cleanly separates which content source the window loads from.

> **Key idea:** A production Electron + React/Vite app separates main, preload, and renderer code into sibling directories with their own \`tsconfig.json\`s (making the process boundary structurally, not just conceptually, enforced), typically built with \`electron-vite\` or a manual multi-config Vite setup, with the main process switching between Vite's dev server and built output based on \`app.isPackaged\`.`,
    },
  ],
}
