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
    {
      name: "Two-Way IPC with invoke/handle",
      minutes: 10,
      intro: "Use ipcRenderer.invoke and ipcMain.handle to turn IPC into a clean async request/response call, including how errors thrown in the main process propagate back.",
      content: `## A request that actually returns a value

\`ipcRenderer.invoke\` and \`ipcMain.handle\` give IPC the shape most calls actually want: "ask the main process to do something, and give me a promise for the result" — much closer to calling an async function than manually pairing up \`send\`/\`on\` channels.

\`\`\`js
// main.js
const { ipcMain, app } = require("electron")

ipcMain.handle("get-app-version", () => {
  return app.getVersion()
})

ipcMain.handle("read-config", async () => {
  const data = await fs.promises.readFile(configPath, "utf-8")
  return JSON.parse(data)
})
\`\`\`

\`\`\`js
// renderer (via preload bridge)
const version = await ipcRenderer.invoke("get-app-version")
console.log(version) // "1.4.2"

const config = await ipcRenderer.invoke("read-config")
\`\`\`

\`ipcMain.handle(channel, listener)\` registers a handler whose **return value** (or resolved promise, if the handler is \`async\`) becomes the value \`ipcRenderer.invoke\` resolves with on the renderer side. One channel, one call, one return value — no manually pairing up a second reply channel the way the previous lesson's \`send\`/\`on\` example needed.

## Passing arguments

Arguments flow through \`invoke\` exactly like a normal function call, after the channel name:

\`\`\`js
// main.js
ipcMain.handle("save-note", (event, note) => {
  return saveNoteToDisk(note)
})
\`\`\`

\`\`\`js
// renderer
await ipcRenderer.invoke("save-note", { title: "Ideas", body: "..." })
\`\`\`

As with \`ipcMain.on\`, the handler's first parameter is always the \`IpcMainInvokeEvent\`, with your actual arguments following it.

## Errors propagate as rejected promises

If a handler throws (or its returned promise rejects), that failure crosses the process boundary as a **rejected promise** on the renderer side — letting ordinary \`try\`/\`catch\` (or \`.catch()\`) handle IPC failures exactly like any other async error:

\`\`\`js
// main.js
ipcMain.handle("delete-file", async (event, filePath) => {
  if (!filePath.startsWith(SAFE_DIRECTORY)) {
    throw new Error("Refusing to delete outside the app's data directory")
  }
  await fs.promises.unlink(filePath)
})
\`\`\`

\`\`\`js
// renderer
try {
  await ipcRenderer.invoke("delete-file", somePath)
} catch (err) {
  console.error("Delete failed:", err.message)
}
\`\`\`

One caveat worth knowing: the error that arrives in the renderer is a **serialized copy**, not the original \`Error\` instance — its \`message\` crosses over reliably, but custom error subclasses, custom properties, and stack traces from the main process don't survive the trip intact. For most apps, checking \`err.message\` (and designing deliberate, descriptive messages on the main-process side, as in the example above) is sufficient; anything requiring richer structured error data is usually better sent back as a plain \`{ ok: false, reason: "..." }\` object from the handler instead of relying on a thrown \`Error\`'s full shape surviving.

## \`invoke\`/\`handle\` vs. \`send\`/\`on\`: when to use which

| | \`invoke\`/\`handle\` | \`send\`/\`on\` |
|---|---|---|
| Shape | Request → single response | Fire-and-forget, or main-initiated push |
| Return value | Yes — a promise | No — needs a manual reply channel |
| Error propagation | Automatic (rejected promise) | Manual |
| Typical use | "Get the app version," "read this file," "show a dialog" | "The window resized," "a background download progressed" (main → renderer push, no reply expected) |

In practice, most request-shaped IPC in a modern Electron app uses \`invoke\`/\`handle\`; \`send\`/\`on\` remains the right tool specifically for the main process *pushing* an event to a renderer with nothing to reply (a progress update, a menu action) rather than a renderer asking a question.

> **Key idea:** \`ipcRenderer.invoke(channel, ...args)\` paired with \`ipcMain.handle(channel, listener)\` turns IPC into a clean async call — the handler's return value (or thrown error) becomes the invoking promise's resolution (or rejection) — and is the right default for request/response IPC, leaving \`send\`/\`on\` for fire-and-forget or main-initiated pushes.`,
    },
  ],
}
