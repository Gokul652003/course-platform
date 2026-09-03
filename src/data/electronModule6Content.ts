import type { Module } from "../types"

export const electronModule6: Module = {
  id: 6,
  title: "Native Menus, Tray & Global Shortcuts",
  status: "in_progress",
  lessons: [
    {
      name: "Application Menus with Menu & MenuItem",
      minutes: 9,
      intro: "Build a native application menu from a template, wire up click handlers, and use the role property to get standard OS behavior for free.",
      content: `## Menus are built from a plain template

Electron's \`Menu\` module builds a native, OS-rendered menu bar from a plain JavaScript array describing each top-level menu and its items — no HTML, no CSS, entirely native widgets on every platform:

\`\`\`js
const { app, Menu } = require("electron")

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Note",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          console.log("New Note clicked")
        },
      },
      { type: "separator" },
      { label: "Quit", role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
    ],
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
\`\`\`

\`Menu.buildFromTemplate(template)\` turns the array into an actual \`Menu\` instance, and \`Menu.setApplicationMenu(menu)\` installs it as the app's menu bar (the top-of-screen bar on macOS, or the per-window menu bar on Windows/Linux).

## \`click\` vs. \`role\`

Each menu item does one of two things, and mixing them on the same item is invalid:

- **\`click\`** — a function you provide, called when the item is selected. This is where custom app logic lives (as in "New Note" above).
- **\`role\`** — a string naming a *built-in* behavior Electron implements for you — \`"quit"\`, \`"undo"\`, \`"copy"\`, \`"toggleDevTools"\`, \`"reload"\`, \`"about"\`, and many more. Using \`role\` instead of hand-writing a \`click\` handler gets you the exact native behavior the OS expects (correct keyboard shortcut conventions, correct enabled/disabled state tied to text selection for things like Cut/Copy) essentially for free.

Standard editing commands (\`undo\`, \`redo\`, \`cut\`, \`copy\`, \`paste\`, \`selectAll\`) are almost always better left as \`role\` entries rather than hand-implemented — getting them exactly right (including edge cases like enabling Paste only when the clipboard has content) is easy to get subtly wrong by hand and Electron already does it correctly.

## \`accelerator\`: keyboard shortcuts tied to a menu item

The \`accelerator\` field (\`"CmdOrCtrl+N"\` above) attaches a keyboard shortcut to a menu item, displayed next to its label in the menu and active whenever the app has focus. \`CmdOrCtrl\` is a cross-platform placeholder — it resolves to \`Cmd\` on macOS and \`Ctrl\` on Windows/Linux, letting one template describe a shortcut that follows each OS's own convention rather than writing platform-specific accelerators by hand.

## macOS needs an app-name menu

On macOS, convention requires the very first menu to be the app's own name, containing items like About, Preferences, and Quit — omitting it looks visibly wrong to a macOS user and is one of the most common "this doesn't feel like a real Mac app" mistakes:

\`\`\`js
const template = [
  ...(process.platform === "darwin"
    ? [{ label: app.name, submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }] }]
    : []),
  { label: "File", submenu: [/* ... */] },
]
\`\`\`

This is the same \`process.platform\` branching pattern from Module 2's lifecycle events, applied to menu structure instead of quit behavior.

> **Key idea:** \`Menu.buildFromTemplate\` turns a plain array into a native application menu installed via \`Menu.setApplicationMenu\`; use \`role\` for standard commands (undo/copy/quit/...) to get correct native behavior for free rather than hand-writing \`click\` handlers for them, and remember macOS expects an app-name menu as the first entry.`,
    },
    {
      name: "Context Menus & Tray Icons",
      minutes: 9,
      intro: "Show a right-click context menu on demand with Menu.popup, and build a system tray icon with its own menu for a background-resident app.",
      content: `## Context menus: built the same way, shown on demand

A right-click context menu uses the exact same \`Menu.buildFromTemplate\` API as an application menu — the only difference is *how* it's displayed: instead of \`setApplicationMenu\`, you call \`.popup()\` on demand, typically in response to a \`contextmenu\` event forwarded from the renderer via IPC:

\`\`\`js
// preload.js
contextBridge.exposeInMainWorld("api", {
  showContextMenu: () => ipcRenderer.send("show-context-menu"),
})
\`\`\`

\`\`\`js
// main.js
const { Menu, ipcMain, BrowserWindow } = require("electron")

ipcMain.on("show-context-menu", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const menu = Menu.buildFromTemplate([
    { label: "Copy", role: "copy" },
    { label: "Delete Note", click: () => console.log("delete") },
  ])
  menu.popup({ window: win })
})
\`\`\`

\`\`\`js
// renderer.js
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
  window.api.showContextMenu()
})
\`\`\`

\`Menu.popup({ window })\` shows the menu at the current cursor position by default, attached to the given window — the same building blocks as the app menu, just triggered by a right-click instead of installed permanently.

## System tray icons

A \`Tray\` instance puts a persistent icon in the OS's system tray (or menu bar, on macOS) — the standard way a background-resident app (a chat client, a sync tool) stays reachable without an always-open window:

\`\`\`js
const { app, Tray, Menu } = require("electron")
const path = require("path")

let tray = null

app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "tray-icon.png"))
  tray.setToolTip("My App")

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open", click: () => showMainWindow() },
    { label: "Quit", role: "quit" },
  ])
  tray.setContextMenu(contextMenu)

  tray.on("click", () => showMainWindow())
})
\`\`\`

A few practical details:

- \`tray\` must be kept referenced at module scope (or similar) for the exact same garbage-collection reason covered in Module 3 for windows — an unreferenced \`Tray\` instance can disappear unexpectedly.
- \`setContextMenu\` attaches a menu shown on right-click (or on any click, on some platforms); the separate \`click\` event lets you define what a plain left-click does, commonly toggling the main window's visibility.
- Tray icon assets typically need multiple resolutions/formats per platform for a crisp look (e.g. a template image on macOS that adapts to light/dark menu bars) — this is one of the more platform-fiddly parts of Electron, worth testing on every OS you target rather than assuming one icon file looks right everywhere.

> **Key idea:** \`Menu.popup({ window })\` shows a menu on demand (the mechanism behind right-click context menus, usually triggered via IPC from a renderer's \`contextmenu\` event), and \`Tray\` puts a persistent, always-reachable icon in the system tray with its own \`setContextMenu\` — both reuse the same \`Menu.buildFromTemplate\` API as the application menu.`,
    },
    {
      name: "Global Shortcuts & Accelerators",
      minutes: 8,
      intro: "Register OS-wide keyboard shortcuts with globalShortcut, understand how they differ from menu accelerators, and why cleaning them up on quit isn't optional.",
      content: `## Global shortcuts work even when the app isn't focused

A menu \`accelerator\` (previous lesson) only fires while the app has focus — normal for menu commands. Some features genuinely need to work no matter what the user is doing elsewhere on their machine: a screenshot tool activated from anywhere, a music player's play/pause bound to a media key, a quick-capture note app. That's what \`globalShortcut\` is for — it registers a key combination at the **operating-system** level, firing a callback regardless of which app currently has focus:

\`\`\`js
const { app, globalShortcut } = require("electron")

app.whenReady().then(() => {
  const registered = globalShortcut.register("CommandOrControl+Shift+Space", () => {
    console.log("Global shortcut triggered!")
    showQuickCaptureWindow()
  })

  if (!registered) {
    console.warn("Failed to register global shortcut — likely already taken by another app")
  }
})
\`\`\`

\`globalShortcut.register(accelerator, callback)\` returns \`false\` (rather than throwing) if the combination couldn't be registered — most commonly because another application already claimed it first. Checking the return value matters: silently failing to register a shortcut the user expects to work is a confusing, hard-to-diagnose support issue if left unchecked.

## Always unregister on quit

Because a global shortcut is a genuinely OS-level hook, **failing to release it can leave that key combination unusable system-wide** even after your app has closed, until the process that registered it is confirmed gone — behavior that varies somewhat by platform, but is exactly the kind of side effect a well-behaved app avoids entirely by cleaning up properly:

\`\`\`js
app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})
\`\`\`

\`will-quit\` (distinct from \`before-quit\` covered in Module 2 — \`will-quit\` fires slightly later, once the app has committed to quitting and windows are closing) is the standard place for this cleanup, and \`unregisterAll()\` is simpler and safer than manually unregistering each shortcut by name one at a time.

## Global shortcuts are a limited, shared resource — use sparingly

Because every app on a user's machine that registers global shortcuts is drawing from the same OS-wide namespace, and a user has no built-in way to see which app "owns" a given combination, registering an unusual, unlikely-to-collide combination (as in the \`CommandOrControl+Shift+Space\` example) is far friendlier than claiming a common one a user might expect some other app to already use. A genuinely well-behaved app also typically makes its global shortcuts user-configurable in settings, rather than hardcoding a fixed combination forever — precisely because collisions with other installed software are common and outside your control.

> **Key idea:** \`globalShortcut.register(accelerator, callback)\` binds a key combination at the OS level so it fires even when the app isn't focused, returns \`false\` (not a thrown error) if the combination is already taken elsewhere, and must be released via \`globalShortcut.unregisterAll()\` on the \`will-quit\` event — skipping that cleanup can leave a key combination unusable system-wide after the app closes.`,
    },
  ],
}
