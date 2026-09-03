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
  ],
}
