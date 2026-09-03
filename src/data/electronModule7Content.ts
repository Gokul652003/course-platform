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
  ],
}
