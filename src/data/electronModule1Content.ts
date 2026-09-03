import type { Module } from "../types"

export const electronModule1: Module = {
  id: 1,
  title: "Getting Started with Electron",
  status: "in_progress",
  lessons: [
    {
      name: "What Is Electron & Why Use It",
      minutes: 9,
      intro: "See what problem Electron actually solves, understand the Chromium + Node.js combination underneath it, and place it next to the alternatives you'll hear about.",
      content: `## The problem: one codebase, every desktop

Shipping a native desktop app traditionally meant picking a platform-specific toolkit — Win32 or WPF on Windows, Cocoa on macOS, GTK or Qt on Linux — and either maintaining three separate codebases or adopting a cross-platform native framework with its own learning curve and quirks per platform. **Electron** takes a different bet: package a full Chromium browser engine and a Node.js runtime together, and let you build the entire application — UI, business logic, file access, native menus — using HTML, CSS, and JavaScript, the same stack most web developers already know.

The result ships as a single, self-contained desktop app: your users double-click an icon, and what launches is effectively a dedicated, chrome-less browser window running your web app, with full access to the operating system that a regular browser tab would never be allowed.

## What's actually inside an Electron app

Every Electron app bundles two things together:

- **Chromium** — the same open-source rendering engine behind Google Chrome. It's what parses your HTML/CSS, runs your JavaScript in the UI, and paints pixels to the screen. This is why an Electron app's UI code looks and behaves exactly like a regular web page.
- **Node.js** — a full JavaScript runtime with filesystem, process, and networking access. This is what lets Electron code do things a web page in a browser tab is normally sandboxed away from: read and write arbitrary files, spawn processes, open native OS dialogs, register global keyboard shortcuts.

Neither piece alone is new. Electron's actual contribution is the glue between them — a defined way for a privileged Node.js process and one or more Chromium-rendered windows to run side by side and talk to each other safely, which later modules in this course (especially the ones on processes and IPC) are almost entirely about.

## Real apps built on it

Electron isn't a toy — it's the foundation of several apps used daily by millions of people:

- **Visual Studio Code** — Microsoft's editor, arguably Electron's best advertisement for "this can be genuinely fast and polished."
- **Slack** and **Discord** — both chat apps with heavy real-time UI, native notifications, and system tray integration.
- **Figma's desktop app**, **Notion**, and **1Password** — each choosing Electron specifically to share one UI codebase across Windows, macOS, and Linux rather than maintaining three.

## Electron vs. the alternatives

Electron isn't the only way to ship a web-tech desktop app, and it's worth an honest comparison before committing to it:

| | Electron | Tauri | NW.js | PWA |
|---|---|---|---|---|
| Rendering engine | Bundled Chromium (every app) | OS's native WebView | Bundled Chromium | The user's own browser |
| Backend language | Node.js | Rust | Node.js | None (browser sandbox only) |
| Typical install size | ~150–200 MB | ~10–20 MB | ~150–200 MB | 0 (no install) |
| Full OS/filesystem access | Yes | Yes (via Rust commands) | Yes | No — browser-sandboxed |
| Ecosystem maturity | Very mature, huge npm ecosystem | Younger, growing fast | Niche, smaller community | N/A — just web APIs |

Tauri's biggest pitch is bundle size and memory footprint, since it reuses the OS's existing WebView instead of shipping a private copy of Chromium — the tradeoff is writing your native-side logic in Rust instead of Node.js, and a rendering engine that can subtly differ between Windows, macOS, and Linux since each OS's WebView is a bit different. Electron's tradeoff runs the other way: a heavier bundle, but one Chromium version, identical everywhere, plus the largest ecosystem of native-integration packages and the most production mileage of any option here. This course focuses on Electron specifically because that maturity and consistency is still, for most teams, the deciding factor.

> **Key idea:** Electron bundles Chromium (for rendering your UI with ordinary HTML/CSS/JS) and Node.js (for privileged OS access) into one runtime, letting a single web-tech codebase ship as a real desktop app on Windows, macOS, and Linux — trading a larger install size for a mature, consistent, battle-tested platform compared to lighter-weight alternatives like Tauri.`,
    },
    {
      name: "Installing Electron & Project Setup",
      minutes: 8,
      intro: "Scaffold a bare Electron project from scratch: npm init, install Electron as a dev dependency, and understand what package.json's main field actually controls.",
      content: `## Starting from an empty folder

Unlike some frameworks, Electron doesn't require a special CLI to get going — it's just an npm package. Start the way you'd start any Node.js project:

\`\`\`bash
mkdir my-electron-app
cd my-electron-app
npm init -y
\`\`\`

That produces a minimal \`package.json\`. Electron itself is installed as a **dev dependency**, not a regular one — this matters and is easy to get backwards. Electron isn't a library your app *imports and calls*; it's a runtime binary that *runs* your app, similar to how \`vite\` or \`webpack\` are dev-time tools rather than something your shipped code depends on at runtime:

\`\`\`bash
npm install --save-dev electron
\`\`\`

This downloads a prebuilt Electron binary (bundling Chromium and Node.js as covered in the previous lesson) matched to your platform, plus the \`electron\` npm package that exposes the path to that binary so it can be launched from the command line or from npm scripts.

## The \`main\` field: your app's entry point

Open \`package.json\` and add a \`main\` field pointing at a JavaScript file:

\`\`\`json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^33.0.0"
  }
}
\`\`\`

\`main\` tells Electron which file to run as the **main process** the moment the app launches — it's the equivalent of a regular Node.js script's entry point, except Electron itself invokes it instead of you running \`node main.js\` directly. Running \`electron .\` (note the dot — "run the Electron app located in this directory") reads \`package.json\`, finds \`main\`, and executes that file inside Electron's bundled Node.js runtime, with the full \`electron\` API available to it via \`require("electron")\`.

## A minimal project layout

A small, real Electron project typically looks like this before any UI has been added:

\`\`\`text
my-electron-app/
├── package.json
├── main.js          ← the main process entry point (from "main" in package.json)
├── preload.js        ← bridges main and renderer (Module 5 covers this in depth)
└── index.html         ← the first page a window will load
\`\`\`

Nothing here is enforced by Electron beyond \`main\` pointing at a real file — file names and folder structure are entirely up to you, and larger projects usually organize \`main.js\`, \`preload.js\`, and renderer code into separate directories (\`src/main\`, \`src/preload\`, \`src/renderer\`) once the app grows past a single window. The next lesson fills in \`main.js\` with just enough code to open a real window.

> **Key idea:** Electron is installed as a devDependency via npm, and \`package.json\`'s \`main\` field names the JavaScript file Electron runs as the main process on launch — running \`electron .\` in a folder is what actually starts the app using that entry point.`,
    },
  ],
}
