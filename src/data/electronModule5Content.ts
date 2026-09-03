import type { Module } from "../types"

export const electronModule5: Module = {
  id: 5,
  title: "Preload Scripts & Context Isolation",
  status: "in_progress",
  lessons: [
    {
      name: "What Preload Scripts Do",
      minutes: 8,
      intro: "Understand where a preload script fits between main and renderer, when it runs, and why it exists as a distinct third piece rather than just being main-process code.",
      content: `## A privileged script that runs inside the renderer's window

A **preload script** is a file that runs in the context of a specific \`BrowserWindow\`, *before* that window's web page loads — specified via the \`preload\` field in \`webPreferences\`:

\`\`\`js
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
  },
})
\`\`\`

What makes it unusual is which world it straddles: it runs attached to that window's renderer (so it *does* have access to the DOM's \`window\`/\`document\` objects, unlike the main process), but — unlike a script loaded via a \`<script>\` tag in your HTML — it also has access to a limited, curated set of Node.js and Electron APIs, including \`ipcRenderer\`. It's the one place in an Electron app that legitimately sees both worlds at once.

## Why not just put this logic in the main process?

The main process can't touch a renderer's \`window\`/\`document\` objects at all — it doesn't share memory with a renderer, only messages via IPC. A preload script is what actually lives *inside* that renderer's process, able to attach things onto its \`window\` object before the page's own JavaScript starts running, which is exactly the mechanism needed to hand the page a safe API to call into the main process.

## When it runs

The preload script executes after the renderer process starts but strictly before the HTML page's own script tags run — so anything a preload script attaches to \`window\` is already there and ready by the time your page's own code (a React app, a plain \`<script>\`) starts executing:

\`\`\`text
Renderer process starts
        │
        ▼
  preload.js runs         ← has Node/Electron access, sees the DOM
        │
        ▼
  index.html's own scripts run   ← the "normal" web page, sandboxed
\`\`\`

## A first, unsafe example (why this needs Module 5's next lesson)

The naive approach is directly attaching things onto \`window\`:

\`\`\`js
// preload.js — this works, but is NOT how a real app should do it
const { ipcRenderer } = require("electron")

window.myAPI = {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
}
\`\`\`

\`\`\`js
// renderer.js — the page's own script
window.myAPI.getVersion().then(console.log)
\`\`\`

This works when \`contextIsolation\` is off — but with it on (the modern default, and the right setting per Module 2), a preload script's JavaScript context is deliberately *isolated* from the page's own JavaScript context, meaning \`window.myAPI = ...\` set from the preload script simply doesn't appear on the page's \`window\` at all. Reaching \`window\` safely across that isolation boundary is exactly what \`contextBridge\`, covered in the next lesson, exists to do.

> **Key idea:** A preload script runs inside a specific renderer's process, before the page's own scripts, and is the only piece of an Electron app with access to both the DOM and a curated slice of Node/Electron APIs — making it the natural place to build a safe bridge, though attaching directly to \`window\` doesn't actually work once \`contextIsolation\` is on, which is where the next lesson picks up.`,
    },
  ],
}
