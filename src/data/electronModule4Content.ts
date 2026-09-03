import type { Module } from "../types"

export const electronModule4: Module = {
  id: 4,
  title: "Inter-Process Communication (IPC)",
  status: "in_progress",
  lessons: [
    {
      name: "ipcMain & ipcRenderer Basics",
      minutes: 9,
      intro: "Send a one-way message from a renderer to the main process (and back) using ipcRenderer.send and ipcMain.on — the simplest form of Electron's IPC system.",
      content: `## Crossing the process boundary, deliberately

Module 2 established that a renderer can't directly call Node.js or Electron APIs — so how does clicking a button in the UI ever trigger something like "save this file to disk," which can only happen in the main process? The answer is **IPC (inter-process communication)**: a message-passing system built into Electron specifically for the main process and a renderer to talk to each other, via named **channels**.

Two modules provide this: \`ipcRenderer\` (used from a renderer or preload script) and \`ipcMain\` (used from the main process). Neither can be used from the other side — \`ipcMain\` doesn't exist in a renderer, and vice versa.

## One-way messaging: \`send\` and \`on\`

The simplest pattern is fire-and-forget: a renderer sends a message on a named channel, and the main process listens for it.

\`\`\`js
// preload.js — exposes ipcRenderer's send through a safe bridge
// (contextBridge is covered in Module 5 — for this lesson, imagine
// the renderer calls ipcRenderer.send directly for simplicity)
const { ipcRenderer } = require("electron")

ipcRenderer.send("log-message", "Button was clicked")
\`\`\`

\`\`\`js
// main.js
const { ipcMain } = require("electron")

ipcMain.on("log-message", (event, message) => {
  console.log("Renderer says:", message)
})
\`\`\`

\`ipcRenderer.send(channel, ...args)\` fires a message on \`channel\` carrying whatever arguments you pass; \`ipcMain.on(channel, listener)\` registers a listener whose first parameter is always an \`IpcMainEvent\` object (carrying metadata like which \`webContents\` sent it), followed by whatever arguments the sender passed.

## Replying: \`event.sender.send\`

\`send\`/\`on\` is inherently one-directional — the main process doesn't get to "return" a value to the caller the way a function call would. To reply, the main process sends a *separate* message back down a channel the renderer is listening on:

\`\`\`js
// main.js
ipcMain.on("get-app-version", (event) => {
  event.sender.send("app-version-reply", app.getVersion())
})
\`\`\`

\`\`\`js
// renderer (via preload bridge)
ipcRenderer.send("get-app-version")
ipcRenderer.on("app-version-reply", (event, version) => {
  console.log("App version:", version)
})
\`\`\`

This works, but notice the shape: two separate channels, a listener registered ahead of time, and no clean way to match a specific request to a specific reply if multiple requests are in flight at once — it reads like manually building a request/response protocol on top of a one-way messaging primitive, because that's exactly what it is. The next lesson covers \`invoke\`/\`handle\`, which is Electron's built-in solution to precisely this awkwardness, and is what real apps reach for almost all of the time instead.

## Channel names are just strings — pick good ones

Nothing about \`ipcMain\`/\`ipcRenderer\` enforces any structure on channel names — they're plain strings, matched exactly. This flexibility is also a footgun: a typo in a channel name (\`"get-app-verison"\` vs \`"get-app-version"\`) fails silently — no error, the listener on the correct channel simply never fires. The next module's final lesson covers naming conventions that make this class of bug much rarer.

> **Key idea:** \`ipcRenderer.send(channel, ...args)\` fires a one-way message to \`ipcMain.on(channel, listener)\` in the main process, and a reply (if needed) is a separate message sent back via \`event.sender.send\` — functional, but awkward for anything shaped like a request expecting a response, which is exactly what \`invoke\`/\`handle\` (next lesson) solves directly.`,
    },
  ],
}
