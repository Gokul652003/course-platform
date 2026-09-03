import type { Module } from "../types"

export const electronModule2: Module = {
  id: 2,
  title: "Main & Renderer Process Architecture",
  status: "in_progress",
  lessons: [
    {
      name: "The Two-Process Model",
      minutes: 9,
      intro: "Understand why Electron splits an app into a main process and one renderer process per window, and what each side is and isn't allowed to do.",
      content: `## Two very different kinds of process

Every Electron app is, at minimum, two separate operating-system processes running side by side:

- **The main process** — exactly one per app, running in Electron's bundled Node.js runtime. It has full Node.js access (filesystem, child processes, native modules) plus Electron's app-control APIs (\`app\`, \`BrowserWindow\`, \`Menu\`, \`Tray\`, \`dialog\`). It has no DOM and renders no UI itself — it's the "backend" of a desktop app.
- **The renderer process** — one per \`BrowserWindow\` (and per \`<webview>\`, if used). Each renderer runs inside its own Chromium instance, rendering HTML/CSS/JS exactly like a browser tab. By default, a renderer has **no direct Node.js or Electron API access** — it's sandboxed the same way a regular web page is.

This isn't an arbitrary API design choice — it mirrors how Chrome itself is built. Chrome runs one browser process controlling the app and a separate, sandboxed renderer process per tab, specifically so that a compromised or crashed tab can't take down the whole browser or reach outside its sandbox. Electron reuses that exact architecture and adds a Node.js-capable main process on top of it.

## Why the split exists

Handing every renderer full Node.js access — reading any file, spawning any process — would mean any web content loaded into a window (including, on a careless app, remote or third-party content) has the same power as a native app running with the user's full permissions. A bug or a successfully injected script in the renderer becomes a bug or an exploit in the *entire operating system*, not just a browser tab.

By keeping Node.js and Electron's privileged APIs on the main process only, and requiring anything a renderer needs from the OS to go through a deliberate, explicit bridge (covered starting in Module 4's IPC and Module 5's preload scripts), Electron gives you a clear boundary to reason about: **the main process is trusted, the renderer is treated like it's showing untrusted web content, even when you wrote every line of it yourself.** Module 9 goes deep on why this discipline matters even for an app with no untrusted content at all.

## A simple mental model

\`\`\`text
┌─────────────────────────────┐
│         Main Process         │   ← one per app, Node.js + Electron APIs
│   (app, BrowserWindow, ...)  │      no DOM, no rendering
└──────────────┬────────────────┘
               │  creates & controls
               ▼
┌─────────────────────────────┐
│      Renderer Process         │   ← one per window, Chromium + your HTML/JS
│   (your app's UI, the DOM)    │      no Node.js/Electron access by default
└─────────────────────────────┘
\`\`\`

The main process creates renderer processes (by constructing \`BrowserWindow\`s), and can also destroy them, but a renderer never directly touches another renderer's memory or the main process's memory — everything that crosses that boundary does so through a small, explicit set of communication mechanisms, which is exactly what the rest of this module and Module 4 are about.

## What this means day to day

In practice, this split shows up as a very concrete rule while writing code: if you're inside a file that's part of \`main.js\` (or anything it \`require\`s), you can freely use \`require("fs")\`, \`require("child_process")\`, or any Node built-in. If you're inside a file that runs in the browser window — your \`index.html\`'s \`<script>\`, or a React/Vue app bundled into the renderer — none of that is available by default, and reaching for it means designing an explicit main-process API surface and exposing a safe slice of it, which is the whole subject of the IPC and preload-script modules ahead.

> **Key idea:** Electron apps are always at least two OS processes — one main process (Node.js + Electron APIs, no DOM) and one renderer process per window (Chromium, your UI, no Node.js access by default) — mirroring Chrome's own browser/tab process split, and every piece of privileged functionality a renderer needs has to cross that boundary deliberately rather than being available for free.`,
    },
    {
      name: "The App Module & Lifecycle Events",
      minutes: 9,
      intro: "Learn the app-level events every Electron app hooks into — whenReady, window-all-closed, activate, before-quit — and why macOS needs different handling than Windows and Linux.",
      content: `## \`app\`: the object that represents your whole application

The \`app\` module (\`require("electron").app\`) is a singleton — there's exactly one, shared across your entire main process — representing the running application itself, as opposed to any individual window. It emits events at key points in the app's life, and the main process's job is largely just responding to those events correctly.

## The core lifecycle events

\`\`\`js
const { app, BrowserWindow } = require("electron")

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    // macOS: re-create a window when the dock icon is clicked
    // and there are currently no open windows
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  // Quit when all windows are closed — except on macOS
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("before-quit", () => {
  // last chance to run cleanup — e.g. flush unsaved state to disk
})
\`\`\`

- **\`ready\`** (via \`whenReady()\`) — fires once, when Electron and Chromium have finished internal initialization. Covered in the previous module; nothing app-related should happen before this.
- **\`window-all-closed\`** — fires when every open \`BrowserWindow\` has been closed. This is where most apps decide whether to actually quit.
- **\`activate\`** — macOS-specific in practice; fires when the user clicks the app's dock icon (or otherwise "activates" it) while the app is already running.
- **\`before-quit\`** — fires just before the app starts quitting, one last opportunity to run cleanup (saving state, closing database connections) before the process exits.

## Why macOS needs an \`if (process.platform !== "darwin")\` check

This is the single most common "why does my code look like that" question for anyone new to Electron. macOS convention is that closing every window does **not** quit an application — the app stays running (visible in the dock) until the user explicitly quits it (Cmd+Q, or Quit from the menu). Windows and Linux have no such convention: closing the last window normally *does* mean "the app is done."

Electron doesn't guess this for you — \`window-all-closed\` fires identically on every platform, and it's your code's job to branch on \`process.platform\` (\`"darwin"\` for macOS, \`"win32"\` for Windows, \`"linux"\` for Linux) to match each OS's expected behavior. The matching \`activate\` handler exists for the same reason: on macOS, a user can click the dock icon of a still-running, window-less app and expect a new window to open, which has no equivalent gesture on Windows/Linux (there, if the app is still running with no windows, something has usually gone wrong).

## Putting it together correctly

The standard, correct skeleton nearly every Electron main process starts from combines all three:

\`\`\`js
app.whenReady().then(() => {
  createWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
\`\`\`

Skipping the \`window-all-closed\` platform check is a very common beginner mistake — either the app never quits properly on Windows (leaving an orphaned background process), or, less commonly, quits unexpectedly early on macOS when a user was just closing one window among several intended workflows.

> **Key idea:** The \`app\` singleton emits lifecycle events — \`whenReady\`, \`window-all-closed\`, \`activate\`, \`before-quit\` — that every Electron main process hooks into, and \`window-all-closed\`/\`activate\` specifically need a \`process.platform !== "darwin"\` branch because macOS keeps an app running in the dock after its last window closes, unlike Windows and Linux.`,
    },
    {
      name: "The Renderer Process & the DOM",
      minutes: 8,
      intro: "See exactly what a renderer can and can't touch by default, and understand the history behind nodeIntegration — why it existed, and why it's off by default today.",
      content: `## A renderer is (almost) a regular web page

Once a \`BrowserWindow\` loads \`index.html\`, everything inside that window behaves like an ordinary browser tab: the DOM, \`fetch\`, \`localStorage\`, CSS animations, \`<canvas>\`, service workers — the full surface of standard web APIs works exactly as it does in Chrome, because it *is* Chrome's rendering engine underneath. Any front-end framework — React, Vue, Svelte, or no framework at all — runs in a renderer exactly as it would in a browser tab.

\`\`\`html
<!-- index.html — this is genuinely just a web page -->
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script src="renderer.js"></script>
  </body>
</html>
\`\`\`

\`\`\`js
// renderer.js — standard DOM/browser APIs, nothing Electron-specific
document.getElementById("root").textContent = "Hello!"
console.log(window.navigator.userAgent) // a real Chromium user agent string
\`\`\`

## What's missing by default

What a renderer does **not** get, out of the box in a modern Electron app, is any of the following: \`require()\`, Node's \`fs\`/\`path\`/\`child_process\` modules, or Electron's own privileged modules like \`app\` or \`dialog\`. Typing \`require("fs")\` into a renderer's console throws \`ReferenceError: require is not defined\` — by design, matching the security boundary from the previous lesson.

## A bit of history: \`nodeIntegration\`

Early Electron (and its predecessor, Atom Shell) took the opposite default: renderers had Node.js access baked in via a \`nodeIntegration: true\` \`webPreferences\` option, so \`require("fs")\` worked directly from renderer JavaScript with zero extra setup. It was convenient — but it meant that **any** content a window could be tricked into loading (a malicious ad in a webview, a compromised third-party script, a crafted URL opened via \`shell.openExternal\`) had a direct path to full filesystem and process access on the user's machine, since it was running as ordinary renderer JavaScript with Node fully attached.

As Electron matured and its apps grew more security-conscious, the ecosystem's stance flipped: \`nodeIntegration\` now defaults to \`false\` for every new \`BrowserWindow\`, and current best practice (Module 9 covers this in full) is to leave it off entirely, even for a window that only ever loads your own trusted, locally bundled code — defense in depth against a bug that somehow lets untrusted content or a script injection reach that window.

## So how does a renderer do anything privileged?

If a renderer can't \`require("fs")\` and can't touch Electron's main-process-only APIs, useful desktop features — opening a native save dialog, reading a config file, showing a tray icon — have to be requested *from* the renderer but actually *performed* by the main process, with the result handed back. That request/response bridge is **IPC** (inter-process communication), the subject of Module 4, and the safe way to expose a curated, minimal slice of it to a renderer is a **preload script**, the subject of Module 5. Together they're the answer to "renderer can't touch Node — so how does anything real get built?"

> **Key idea:** A renderer process behaves like a normal, sandboxed web page — full DOM and browser APIs, no Node.js or Electron access by default — because \`nodeIntegration\` (which used to expose Node directly to renderers) is off by default in modern Electron for security; privileged functionality reaches a renderer instead through IPC and a preload script, covered in the next two modules.`,
    },
  ],
}
