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
    {
      name: "contextBridge & exposeInMainWorld",
      minutes: 9,
      intro: "Use contextBridge.exposeInMainWorld to safely publish a curated API from an isolated preload script into the page's own JavaScript world, and understand exactly what contextIsolation protects against.",
      content: `## Two separate JavaScript worlds, one window

With \`contextIsolation: true\` (the default, and the setting this course always assumes), Electron runs a preload script and the page's own JavaScript in two genuinely separate JS contexts, even though they share the same rendered DOM. Objects created in one context — including anything assigned directly to \`window\` — are not visible in the other. This isn't a bug to work around; it's a deliberate wall, and \`contextBridge\` is the one sanctioned door through it.

## \`contextBridge.exposeInMainWorld\`

\`\`\`js
// preload.js
const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (event, pct) => callback(pct))
  },
})
\`\`\`

\`\`\`js
// renderer.js — the page's own script, running in the isolated "main world"
const version = await window.api.getVersion()
await window.api.saveNote({ title: "Ideas", body: "..." })
window.api.onDownloadProgress((pct) => console.log(\`\${pct}% done\`))
\`\`\`

\`exposeInMainWorld(name, api)\` publishes \`api\` onto the page's \`window\` under \`window[name]\`, but does so through Electron's own bridging mechanism rather than a plain assignment — which is precisely what makes it work despite context isolation being on. The page's code sees a normal-looking object with normal-looking async methods; it has no idea (and doesn't need to know) that \`ipcRenderer\` or Node.js exist anywhere in the picture.

## What this actually protects against

The threat context isolation defends against isn't your own trusted preload code — it's what happens if the page ever runs untrusted or compromised JavaScript, whether from a bug, a supply-chain-compromised npm dependency bundled into your renderer code, or (for an app that loads any remote content at all) a malicious script. Without context isolation, that untrusted code, running in the same JS context as the preload script, could reach back and directly manipulate \`ipcRenderer\`, \`require\`, or anything else the preload script touched — walking straight past the boundary preload scripts are supposed to enforce. With it on, the *only* thing untrusted page code can ever see is exactly the object your preload script chose to hand over via \`exposeInMainWorld\` — nothing more, no matter what that page code does.

## The narrower the exposed API, the better

Because \`exposeInMainWorld\` is the entire surface area a renderer gets, the guiding principle is exposing the smallest, most specific API that the renderer actually needs — never something broad like "here's \`ipcRenderer\`, call whatever channel you want":

\`\`\`js
// AVOID — hands the entire ipcRenderer.invoke surface to the page,
// defeating the purpose of a curated bridge
contextBridge.exposeInMainWorld("ipc", {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
})

// PREFER — specific, named methods; the renderer can't invoke an
// arbitrary channel even if it wanted to
contextBridge.exposeInMainWorld("api", {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
})
\`\`\`

The first version technically "works" but re-opens exactly the wide-open door context isolation exists to close — any code running in that renderer can now call *any* IPC channel the main process has registered, including ones never meant for renderer-triggered use. The second version is genuinely locked down to just the two operations the renderer needs.

> **Key idea:** \`contextBridge.exposeInMainWorld(name, api)\` is the sanctioned way to publish an API from an isolated preload script onto the page's \`window\`, protecting against untrusted or compromised page code reaching \`ipcRenderer\`/Node directly — and the API exposed should be a narrow, named set of specific operations, never a raw pass-through to \`ipcRenderer.invoke\` itself.`,
    },
    {
      name: "Building a Typed API Bridge",
      minutes: 9,
      intro: "Share one TypeScript interface between a preload script and renderer code so window.api is fully typed and autocompleted, instead of an untyped any.",
      content: `## The problem: \`window.api\` has no type by default

In a TypeScript-based Electron + renderer setup, \`window\` is typed by the standard DOM library, which knows nothing about an \`api\` property a preload script attached at runtime. Left alone, \`window.api\` types as \`any\`, silently discarding every benefit TypeScript would otherwise offer — no autocomplete, no compile-time typo-catching, no protection if a method's signature changes.

## One shared interface, two consumers

The fix is a single interface describing the exposed API's shape, imported by both the preload script (to type-check what it actually exposes) and a global declaration file (to type what the renderer sees on \`window\`):

\`\`\`ts
// shared/preload-api.ts — the single source of truth for the bridge's shape
export interface PreloadApi {
  getVersion: () => Promise<string>
  saveNote: (note: { title: string; body: string }) => Promise<void>
  onDownloadProgress: (callback: (pct: number) => void) => void
}
\`\`\`

\`\`\`ts
// preload.ts
import { contextBridge, ipcRenderer } from "electron"
import type { PreloadApi } from "../shared/preload-api"

const api: PreloadApi = {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (_event, pct) => callback(pct))
  },
}

contextBridge.exposeInMainWorld("api", api)
\`\`\`

Typing \`api\` as \`PreloadApi\` here means TypeScript now checks the preload script itself — if a method's implementation doesn't match the interface's declared shape, that's a compile error caught long before it becomes a confusing runtime bug in the renderer.

## Declaring the global \`window.api\`

The renderer side needs a global augmentation — extending the built-in \`Window\` interface with the shape from the shared file:

\`\`\`ts
// renderer/global.d.ts
import type { PreloadApi } from "../shared/preload-api"

declare global {
  interface Window {
    api: PreloadApi
  }
}

export {} // makes this a module, required for "declare global" to work
\`\`\`

With this file included in the renderer's TypeScript project, \`window.api\` is now fully typed everywhere in renderer code:

\`\`\`ts
// some renderer component
const version = await window.api.getVersion() // string, autocompleted
await window.api.saveNote({ title: "Ideas", body: "..." }) // arg shape checked
await window.api.saveNote({ title: "Ideas" }) // ← compile error: missing "body"
\`\`\`

## Why the \`export {}\` line matters

A \`.d.ts\` file with no top-level \`import\`/\`export\` is treated by TypeScript as a global *script*, and a \`declare global\` block inside a script (rather than a module) behaves differently and can silently fail to merge correctly. Adding an empty \`export {}\` forces the file to be treated as a module, which is what makes \`declare global\` reliably augment the built-in \`Window\` type. This is a genuinely easy detail to miss — a global augmentation file that's missing it can compile without error yet not actually add anything.

> **Key idea:** Defining the preload API's shape as one shared TypeScript interface — used both to type-check the preload script's implementation and, via \`declare global { interface Window { api: PreloadApi } }\` in a module-scoped \`.d.ts\` file, to type \`window.api\` in the renderer — gives full autocomplete and compile-time safety across the preload/renderer boundary instead of leaving \`window.api\` as an untyped \`any\`.`,
    },
  ],
}
