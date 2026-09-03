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
    {
      name: "Case Studies & Choosing Electron vs. Alternatives",
      minutes: 8,
      intro: "Revisit Electron against Tauri and Wails with the full picture this course has built, and get an honest framework for when Electron is — and isn't — the right call for a real project.",
      content: `## What real apps have chosen, and why

Revisiting the examples from Module 1's opening lesson with everything this course has since covered in view:

- **Visual Studio Code** leans hard into Electron's maturity — a deep, native-feeling extension ecosystem, tight OS integration (file associations, jump lists, native menus — Modules 6 and 8), and genuinely competitive startup/runtime performance achieved through exactly the discipline this course has emphasized: careful process separation, lazy-loaded features, and a heavily optimized renderer bundle.
- **Slack and Discord** lean on Electron for a single, richly interactive UI codebase shared across three OSes, with heavy investment in the native-polish layer from Module 11 — notifications, badges, tray integration — that makes each feel meaningfully "installed" rather than a wrapped website.
- Teams newer to desktop, especially ones prioritizing a minimal install size and memory footprint over ecosystem maturity, increasingly evaluate **Tauri** or **Wails** instead, particularly for smaller utility apps where Electron's Chromium-bundling overhead is a proportionally larger cost.

## Revisiting the comparison, now with real depth behind it

| | Electron | Tauri | Wails |
|---|---|---|---|
| Native-side language | Node.js (JavaScript/TypeScript) | Rust | Go |
| Rendering engine | Bundled Chromium (identical everywhere) | OS's native WebView (can differ subtly per OS) | OS's native WebView |
| IPC model | \`ipcMain\`/\`ipcRenderer\`, \`contextBridge\` (Modules 4–5) | Rust \`#[tauri::command]\` functions called from JS | Go methods bound and called from JS |
| Typical bundle size | ~150–200 MB | ~10–20 MB | ~10–20 MB |
| Ecosystem/tooling maturity | Very high — electron-builder, electron-updater, huge community | Growing quickly, smaller than Electron's | Smaller, Go-community-focused |

The core tradeoff hasn't changed since Module 1: Electron trades bundle size for consistency (one Chromium version, identical rendering across every OS) and ecosystem depth (electron-builder and electron-updater, covered in Modules 10–11, are mature, widely battle-tested tools with enormous real-world mileage); Tauri and Wails trade some of that consistency and maturity for a dramatically smaller footprint and a different native-language backend.

## A practical framework for the decision

- **Team's existing skills matter more than raw technical merit.** A team fluent in Node.js/TypeScript ships an Electron app's native-side logic faster than the same team would ship Rust-based Tauri commands from a standing start — and vice versa for a team already comfortable in Rust or Go.
- **Bundle size matters more for some apps than others.** A utility that should feel lightweight and disposable (a quick screenshot tool, a small menu-bar widget) suffers more from a 150 MB install than a full-featured productivity app users expect to invest real disk space in already (an IDE, a chat client, a design tool).
- **Ecosystem maturity compounds over a project's lifetime.** electron-builder, electron-updater, and years of accumulated Stack Overflow answers and battle-tested patterns (much of what this course has taught) reduce the number of genuinely novel problems a team has to solve themselves — a real, if hard-to-quantify, advantage for a long-lived production app.

## Closing thought

None of this course's material — process separation, IPC, preload scripts, security defaults, packaging, auto-updates — is really Electron-specific in spirit; it's the general shape of "how does a privileged native layer safely expose functionality to an untrusted web-rendered UI," a problem every one of these frameworks solves in its own way. Understanding it deeply in Electron's specific vocabulary, as this course has, transfers directly to reading Tauri's or Wails' documentation later — the concepts (a privileged backend, an isolated frontend, an explicit bridge between them, and getting that bridge's security right) are the same idea wearing a different framework's syntax.

> **Key idea:** Electron remains the right default for teams with strong Node.js/TypeScript skills building apps where ecosystem maturity and consistent, identical-everywhere rendering outweigh install size — Tauri and Wails are the honest alternative when a smaller footprint and a Rust/Go backend are worth more than that maturity — and the underlying concepts this course covered (process separation, IPC, security boundaries) transfer directly to either alternative regardless of which one a project ultimately chooses.`,
    },
  ],
}
