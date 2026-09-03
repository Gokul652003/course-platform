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
  ],
}
