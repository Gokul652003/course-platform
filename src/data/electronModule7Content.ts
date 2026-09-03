import type { Module } from "../types"

export const electronModule7: Module = {
  id: 7,
  title: "File System, Dialogs & Native OS Integration",
  status: "in_progress",
  lessons: [
    {
      name: "Native Dialogs",
      minutes: 8,
      intro: "Use the dialog module to show real OS file pickers, save dialogs, and message boxes instead of building fake ones out of HTML.",
      content: `## Why use native dialogs at all

A file picker, a "save as" prompt, an alert box — these could all technically be built as HTML/CSS inside a renderer. Almost no desktop app does this for good reason: native dialogs look and behave exactly like every other app on the user's OS (same keyboard navigation, same recent-locations sidebar, same accessibility support), something an HTML reimplementation can approximate but never fully match. Electron's \`dialog\` module gives you the real, OS-native versions directly.

## Opening files: \`showOpenDialog\`

\`\`\`js
// main.js
const { dialog, ipcMain } = require("electron")

ipcMain.handle("open-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt", "md"] },
      { name: "All Files", extensions: ["*"] },
    ],
  })

  if (result.canceled) return null
  return result.filePaths[0]
})
\`\`\`

\`properties\` controls the dialog's mode — \`"openFile"\`, \`"openDirectory"\`, \`"multiSelections"\` (combinable, e.g. \`["openFile", "multiSelections"]\` for picking several files at once). The result always carries a \`canceled\` boolean — checking it before touching \`filePaths\` is essential, since a user dismissing the dialog is a completely normal outcome, not an error.

## Saving files: \`showSaveDialog\`

\`\`\`js
ipcMain.handle("save-file-as", async () => {
  const result = await dialog.showSaveDialog({
    defaultPath: "untitled.md",
    filters: [{ name: "Markdown", extensions: ["md"] }],
  })

  if (result.canceled || !result.filePath) return null
  return result.filePath
})
\`\`\`

\`showSaveDialog\` returns a chosen \`filePath\` (a string, not an array — unlike \`showOpenDialog\`) that your code then actually writes to using Node's \`fs\` module, covered in the next lesson — the dialog itself only handles *choosing where*, not the actual write.

## Message boxes: \`showMessageBox\`

\`\`\`js
const result = await dialog.showMessageBox({
  type: "warning",
  buttons: ["Discard Changes", "Cancel"],
  defaultId: 1,
  message: "You have unsaved changes",
  detail: "Discarding will permanently lose your edits.",
})

if (result.response === 0) {
  // user chose "Discard Changes" (index 0 in the buttons array)
}
\`\`\`

This is the natural pairing with the cancelable \`close\` window event from Module 3 — showing a confirmation \`messageBox\` inside a \`win.on("close", ...)\` handler, calling \`event.preventDefault()\` until the user confirms, is the standard way to implement an "unsaved changes" guard.

## Dialogs run in the main process, always

Note that every example here calls \`dialog\` from the main process, exposed to the renderer via IPC exactly like the file-reading examples in Module 4 — a renderer never calls \`dialog\` directly, both because it doesn't have access to Electron's main-process-only modules (Module 2) and because native dialogs are inherently attached to a specific OS window, which only the main process manages directly.

> **Key idea:** \`dialog.showOpenDialog\`, \`showSaveDialog\`, and \`showMessageBox\` show real, OS-native pickers and prompts from the main process (always check \`result.canceled\` before trusting the result), giving an app native-feeling file interactions that an HTML-built dialog could only approximate.`,
    },
    {
      name: "Reading & Writing Files Safely",
      minutes: 9,
      intro: "Understand why file I/O belongs in the main process behind IPC, not the renderer, and build a safe, validated read/write API for a note-taking app's data.",
      content: `## File I/O is main-process work

Node's \`fs\` module — \`readFile\`, \`writeFile\`, \`mkdir\`, and the rest — is unavailable in a renderer by default, for exactly the reasons covered in Module 2: a renderer is treated as untrusted, and unrestricted filesystem access from there would undermine that boundary entirely. In practice, this means every real file operation in an Electron app is main-process code, requested by the renderer via IPC:

\`\`\`js
// main.js
const fs = require("fs/promises")
const path = require("path")
const { app, ipcMain } = require("electron")

const notesDir = path.join(app.getPath("userData"), "notes")

ipcMain.handle("notes:read", async (event, filename) => {
  const filePath = path.join(notesDir, filename)
  return fs.readFile(filePath, "utf-8")
})

ipcMain.handle("notes:write", async (event, filename, content) => {
  await fs.mkdir(notesDir, { recursive: true })
  const filePath = path.join(notesDir, filename)
  await fs.writeFile(filePath, content, "utf-8")
})
\`\`\`

## Validate paths — don't trust renderer-supplied filenames blindly

Because the renderer is treated as untrusted (Module 2, Module 9), a filename argument coming across IPC deserves the same suspicion you'd give user input on a web server — a renderer that's been compromised, or simply a bug, could pass something like \`"../../../.ssh/id_rsa"\` and, without a check, \`path.join\` would happily resolve that outside \`notesDir\`:

\`\`\`js
ipcMain.handle("notes:read", async (event, filename) => {
  const filePath = path.join(notesDir, filename)

  // resolve both paths and confirm the result is still inside notesDir
  if (!path.resolve(filePath).startsWith(path.resolve(notesDir))) {
    throw new Error("Invalid file path")
  }

  return fs.readFile(filePath, "utf-8")
})
\`\`\`

This mirrors the "safe directory" check from Module 4's error-propagation example — the underlying lesson is the same: an IPC handler is effectively a small API endpoint, and it should validate its inputs with the same care a server-side API would, rather than assuming the renderer will only ever send well-formed, well-intentioned arguments.

## Prefer async \`fs/promises\` over sync calls in the main process

Node offers both synchronous (\`fs.readFileSync\`) and asynchronous (\`fs.promises.readFile\` / \`fs/promises\`) file APIs. In the main process specifically, synchronous file calls **block the entire process** — including, notably, any IPC handling and window-management code — for however long the disk operation takes. On a large file or a slow disk, that can make the whole app briefly unresponsive. The async \`fs/promises\` API (as used throughout this lesson) avoids that entirely, and is the right default for essentially all file I/O in a main process, reserving sync calls for the rare case of genuinely tiny, startup-time-only reads where blocking briefly is a deliberate, acceptable tradeoff.

> **Key idea:** File I/O happens in the main process — never directly in a renderer — exposed through IPC handlers that should validate any renderer-supplied path (resolving it and confirming it stays inside an expected directory) exactly like a server would validate untrusted input, and should use async \`fs/promises\` calls rather than synchronous ones to avoid blocking the whole main process during disk I/O.`,
    },
    {
      name: "Drag & Drop and the Clipboard",
      minutes: 8,
      intro: "Accept dragged-in files using standard HTML5 drag-and-drop events, and read/write the system clipboard from the main process.",
      content: `## Drag-and-drop is mostly ordinary web platform code

Because a renderer is a real Chromium page, dragging a file from the OS's file manager onto a window fires the exact same \`dragover\`/\`drop\` DOM events a regular web page would receive — no Electron-specific API needed for the drag gesture itself:

\`\`\`js
// renderer.js
const dropZone = document.getElementById("drop-zone")

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault() // required — without it, drop never fires
})

dropZone.addEventListener("drop", (event) => {
  event.preventDefault()

  for (const file of event.dataTransfer.files) {
    console.log("Dropped file:", file.path, file.name, file.size)
  }
})
\`\`\`

The one Electron-specific detail: a dropped \`File\` object carries a \`path\` property (the file's absolute path on disk) that a browser's sandboxed \`File\` object never exposes — Electron adds it specifically because, unlike a web page, a renderer's dropped files are genuinely meant to be operated on by the app's (main-process, IPC-mediated) file-reading code from the previous lesson, using that real path.

## Starting a drag from inside the app

The reverse direction — a user dragging something *out* of your app's window onto the OS desktop or another application — needs an explicit main-process API, \`webContents.startDrag()\`, triggered from an IPC message the renderer sends on \`dragstart\`:

\`\`\`js
// main.js
ipcMain.on("start-native-drag", (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: path.join(__dirname, "drag-icon.png"),
  })
})
\`\`\`

This pattern — an app-internal item (e.g. a note in a list) that a user can drag out onto their desktop as a real file — is a small but genuinely native-feeling touch that a pure web app has no way to offer at all.

## The clipboard module

Reading and writing the system clipboard is a main-process API, \`clipboard\`, exposed to the renderer through IPC/preload the same way everything else in this module has been:

\`\`\`js
// main.js
const { clipboard, ipcMain } = require("electron")

ipcMain.handle("clipboard:write", (event, text) => {
  clipboard.writeText(text)
})

ipcMain.handle("clipboard:read", () => {
  return clipboard.readText()
})
\`\`\`

\`clipboard\` also supports \`writeHTML\`/\`readHTML\`, \`writeImage\`/\`readImage\`, and \`writeRTF\`/\`readRTF\` for richer clipboard content beyond plain text — useful for something like a "copy formatted table" feature — following the exact same read/write pattern shown above.

> **Key idea:** Drag-and-drop *into* a window uses ordinary HTML5 \`dragover\`/\`drop\` events (Electron additionally exposes a real \`path\` on dropped files), dragging *out* of a window needs the explicit \`webContents.startDrag()\` main-process API, and clipboard access goes through the \`clipboard\` module — all following the same main-process-does-the-work, renderer-requests-via-IPC shape as every other native integration in this course.`,
    },
  ],
}
