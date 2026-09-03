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
    {
      name: "Custom Protocols & Deep Linking",
      minutes: 9,
      intro: "Register your app as the handler for a custom URL scheme like myapp://, and route incoming deep links to the right place inside an already-running window.",
      content: `## What a deep link actually is

A deep link is a URL using a custom scheme — \`myapp://open?note=42\` instead of \`https://\` — that the operating system routes to a specific installed application instead of a browser, the same mechanism behind things like \`slack://\` or \`spotify://\` links you've likely clicked from a web page before. Electron supports registering your app as the OS-level handler for a scheme of your choosing.

## Registering the protocol

\`\`\`js
const { app } = require("electron")

if (process.defaultApp) {
  // running unpackaged in development (via "electron .") — the OS needs
  // the full node + script path to relaunch correctly
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("myapp", process.execPath, [
      require("path").resolve(process.argv[1]),
    ])
  }
} else {
  app.setAsDefaultProtocolClient("myapp")
}
\`\`\`

The \`process.defaultApp\` branch exists because a packaged app (Module 10 covers packaging) and an app still running via \`electron .\` during development need slightly different arguments to correctly register themselves — the packaged case is the simple one-argument call; the development case needs to tell the OS to relaunch Electron itself with your script path, since there's no standalone executable yet.

## Handling the incoming link

How the link actually reaches your running app differs by platform, and both paths need handling for full cross-platform support:

\`\`\`js
// macOS: fires as its own dedicated event
app.on("open-url", (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

// Windows/Linux: the URL arrives as a command-line argument,
// which is exactly why single-instance handling (previous lesson)
// matters here — a deep link click launches what looks like a
// second instance, carrying the URL in argv
app.on("second-instance", (event, argv) => {
  const url = argv.find((arg) => arg.startsWith("myapp://"))
  if (url) handleDeepLink(url)
})

function handleDeepLink(url) {
  const parsed = new URL(url)
  const noteId = parsed.searchParams.get("note")
  // e.g. focus the main window and navigate its renderer to that note,
  // via the same IPC/webContents.send mechanism covered in Module 4
}
\`\`\`

macOS delivers deep links through a dedicated \`open-url\` app event even while the app is already running; Windows and Linux instead relaunch the app with the URL as a plain command-line argument, which the single-instance lock's \`second-instance\` handler from the previous lesson is exactly positioned to catch — this is precisely why that lesson came first.

## A note on packaging

Protocol registration written in \`main.js\` only takes effect once the app has actually been installed via a proper installer (Module 10) — running via \`electron .\` during development, the registration call executes, but the OS-level association it creates is genuinely temporary and platform-dependent, so testing deep links thoroughly is best done against a packaged build rather than assumed to work identically in dev.

> **Key idea:** \`app.setAsDefaultProtocolClient("myapp")\` registers a custom URL scheme with the OS; macOS delivers incoming links via the \`open-url\` event while Windows/Linux deliver them as a command-line argument caught through the single-instance lock's \`second-instance\` handler — both platforms need explicit handling for deep linking to work everywhere.`,
    },
  ],
}
