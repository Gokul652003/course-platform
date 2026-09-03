import type { Module } from "../types"

export const electronModule8: Module = {
  id: 8,
  title: "App Lifecycle, Protocols & Deep Linking",
  status: "in_progress",
  lessons: [
    {
      name: "Single Instance Lock & App Events",
      minutes: 8,
      intro: "Prevent a user from accidentally launching a second copy of your app, and forward whatever they were trying to do to the already-running instance instead.",
      content: `## The problem: double-launching a desktop app

Unlike a web app (where opening a second browser tab to the same URL is completely normal), most desktop apps are expected to behave as a **single running instance** — double-clicking the icon again, or clicking a second desktop shortcut, should bring the existing window to the front rather than opening a confusing second, entirely separate copy of the app with its own windows and, potentially, its own lock on shared local data.

## \`requestSingleInstanceLock\`

Electron provides this directly via \`app.requestSingleInstanceLock()\`, called as early as possible in \`main.js\`:

\`\`\`js
const { app, BrowserWindow } = require("electron")

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  // another instance already holds the lock — quit this new one immediately
  app.quit()
} else {
  app.on("second-instance", (event, argv, workingDirectory) => {
    // someone tried to launch a second copy — focus the existing window instead
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
  })
}
\`\`\`

The logic reads almost like a real-world lock: the first instance to run \`requestSingleInstanceLock()\` gets \`true\` and proceeds normally. Every subsequent launch attempt gets \`false\` back immediately — at which point that new process's correct behavior is simply to quit right away, since it isn't going to be the "real" running instance. Meanwhile, the *original*, already-running instance receives a \`second-instance\` event, carrying the new launch attempt's command-line arguments (\`argv\`) and working directory — enough information to, for example, open whatever file was passed on that second command line inside the *existing* window, rather than losing that intent entirely.

## Why this matters for file associations and deep links

This pattern isn't just about avoiding visual clutter from duplicate windows — it's the actual mechanism that makes "double-click a file to open it in this app" or "click a deep link" work correctly once an instance is already running. If a user has your app open and double-clicks a file your app is registered to handle, the OS launches what looks like a second instance of your app *with that file path as a command-line argument* — the single-instance lock intercepts that, quits the redundant new process, and lets the \`second-instance\` handler in the original instance open the file, exactly the behavior a user expects. Without this handling, they'd instead end up with two separate, disconnected windows of your app. The next lesson builds on this exact mechanism for custom URL protocols.

## Not every app needs this

A few genuinely multi-instance-friendly apps intentionally skip the single-instance lock — a terminal emulator, for instance, where launching a "new window" from the OS really should be a fully independent instance. The right default for most apps (anything with shared local state, a single data directory, or file-association behavior) is to use the lock; the exception is worth knowing about rather than assuming every app needs it.

> **Key idea:** \`app.requestSingleInstanceLock()\` returns \`false\` for every launch attempt after the first, at which point that redundant process should \`app.quit()\` immediately, while the original instance receives a \`second-instance\` event carrying the new attempt's \`argv\` — the mechanism that makes focusing an existing window, and later, opening files or deep links in that window instead of a new one, actually work.`,
    },
  ],
}
