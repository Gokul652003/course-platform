import type { Module } from "../types"

export const electronModule3: Module = {
  id: 3,
  title: "BrowserWindow & Window Management",
  status: "in_progress",
  lessons: [
    {
      name: "BrowserWindow Options Deep Dive",
      minutes: 10,
      intro: "Go beyond width and height: control the window's chrome, appearance, and — most importantly — its webPreferences security defaults.",
      content: `## The constructor options object

Every window's look and behavior is configured through a single options object passed to \`new BrowserWindow(options)\`. The two you've already seen (\`width\`, \`height\`) barely scratch the surface:

\`\`\`js
const win = new BrowserWindow({
  width: 1000,
  height: 700,
  minWidth: 600,
  minHeight: 400,
  title: "My App",
  backgroundColor: "#1e1e1e",
  frame: true,
  titleBarStyle: "default",
  show: false,
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    preload: require("path").join(__dirname, "preload.js"),
  },
})
\`\`\`

## Sizing and chrome

- **\`width\` / \`height\`** — the window's content size in pixels (not counting the OS title bar/frame).
- **\`minWidth\` / \`minHeight\` / \`maxWidth\` / \`maxHeight\`** — constrain how far a user can resize the window.
- **\`frame\`** — set to \`false\` for a completely chrome-less window (no title bar, no OS-drawn border) — common for apps drawing a fully custom title bar in HTML/CSS, but it also removes the native minimize/maximize/close buttons, which then have to be reimplemented by hand.
- **\`titleBarStyle\`** (macOS-focused) — \`"default"\` keeps the standard title bar, \`"hidden"\` removes it while keeping the traffic-light window controls, useful for apps that want a custom-looking header bar without fully reimplementing window controls.
- **\`backgroundColor\`** — the color shown before the page has painted anything; setting this to match your app's actual background avoids a jarring white (or black) flash on launch.

## \`show: false\` and the \`ready-to-show\` event

By default, a new \`BrowserWindow\` appears immediately, which often means the user briefly sees an unstyled or blank white window before the page has finished loading and painting. The standard fix is to create the window hidden and reveal it only once it's actually ready to be seen:

\`\`\`js
const win = new BrowserWindow({ show: false, /* ...other options */ })

win.once("ready-to-show", () => {
  win.show()
})

win.loadFile("index.html")
\`\`\`

\`ready-to-show\` fires once the renderer has completed its first render pass — meaningfully later than \`did-finish-load\` (which only means the page's resources finished loading, not that anything has been painted yet). This two-line pattern is one of the highest-value, lowest-effort polish touches in any Electron app.

## \`webPreferences\`: the security-critical block

The \`webPreferences\` object configures what the window's renderer is allowed to do, and it's the single most important part of this options object from a security standpoint — Module 9 covers it in full, but three fields are worth knowing now:

| Option | Default (modern Electron) | What it controls |
|---|---|---|
| \`nodeIntegration\` | \`false\` | Whether the renderer gets direct \`require()\`/Node access (covered last module) |
| \`contextIsolation\` | \`true\` | Whether a preload script's JS context is isolated from the page's own JS context |
| \`sandbox\` | \`true\` | Whether the renderer runs inside Chromium's OS-level sandbox, further restricting it |
| \`preload\` | none | Path to a script that runs before the page loads, with limited privileged access — this is the bridge covered in Module 5 |

The safe defaults exist for a reason, and this course treats "leave \`nodeIntegration: false\` and \`contextIsolation: true\`" as the baseline for every example from here on, rather than something to opt into later.

> **Key idea:** \`BrowserWindow\`'s options object controls sizing, native chrome (\`frame\`, \`titleBarStyle\`), and — via the \`webPreferences\` sub-object — the renderer's security posture; pairing \`show: false\` with the \`ready-to-show\` event avoids the common flash-of-unstyled-window on launch.`,
    },
    {
      name: "Multiple Windows & Parent/Child Relationships",
      minutes: 9,
      intro: "Open secondary windows correctly, understand parent/child and modal relationships, and track window instances so they don't get garbage collected out from under you.",
      content: `## Every window is an independent instance

Nothing stops an app from creating more than one \`BrowserWindow\` — a settings window, an about dialog, a secondary editor pane are all just another call to \`new BrowserWindow(...)\`:

\`\`\`js
function createSettingsWindow(parentWin) {
  const settingsWin = new BrowserWindow({
    width: 500,
    height: 400,
    parent: parentWin,
    modal: true,
    webPreferences: { preload: PRELOAD_PATH },
  })

  settingsWin.loadFile("settings.html")
  return settingsWin
}
\`\`\`

## \`parent\` and \`modal\`

- **\`parent\`** — associates the new window with an existing one. A child window typically stays above its parent, minimizes/restores together with it on some platforms, and is automatically closed when the parent closes.
- **\`modal\`** (only meaningful together with \`parent\`) — blocks interaction with the parent window until the child is closed, the same behavior as a native "Save changes?" dialog. Use this sparingly — it's appropriate for a genuinely blocking decision (an unsaved-changes prompt) and a poor fit for anything the user might reasonably want to leave open alongside their main window, like a settings or reference panel.

A non-modal child (\`parent\` set, \`modal\` omitted or \`false\`) is the more common choice for something like a floating tool palette or an inspector panel that should stay associated with — but not block — its parent.

## The garbage-collection trap

A subtle, very common bug: creating a window and not keeping a reference to it anywhere.

\`\`\`js
// BUG: win is a local variable with no other reference.
// It can be garbage-collected and the window closed unexpectedly,
// especially once createWindow() returns.
function createWindow() {
  const win = new BrowserWindow({ width: 800, height: 600 })
  win.loadFile("index.html")
}
\`\`\`

Because \`BrowserWindow\` instances are ordinary JavaScript objects under the hood, if nothing in your code keeps a live reference to one, V8's garbage collector is free to reclaim it — which can close the window unexpectedly, sometimes only intermittently, making it a genuinely confusing bug to track down. The fix is simply to hold references somewhere that outlives the function that created them — a module-level variable for a singleton window, or an array/\`Set\` for a collection of same-purpose windows:

\`\`\`js
let mainWindow = null // module-level — survives after createWindow() returns

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  mainWindow.loadFile("index.html")

  mainWindow.on("closed", () => {
    mainWindow = null // release the reference once it's actually closed
  })
}
\`\`\`

For an app that opens an unbounded number of secondary windows (a document editor letting a user open several files), a \`Set<BrowserWindow>\` tracking all currently open instances is the natural extension of the same pattern, with entries removed on each window's own \`closed\` event.

## Querying open windows

\`BrowserWindow.getAllWindows()\` (used in Module 2's \`activate\` handler) and \`BrowserWindow.getFocusedWindow()\` are static methods that let any part of the main process inspect currently open windows without needing to have been the code that created them — useful for a menu action ("close all windows") or an IPC handler that needs to know which window sent a request.

> **Key idea:** \`parent\`/\`modal\` options relate a secondary window to an existing one (modal specifically blocking interaction with the parent until closed), and every created \`BrowserWindow\` must be kept referenced somewhere that outlives its creating function — an unreferenced window can be garbage-collected and close unexpectedly, a subtle and common early bug.`,
    },
    {
      name: "Window State, Events & DevTools",
      minutes: 9,
      intro: "Listen for resize/move/close events, persist a window's size and position across launches, and open Chrome DevTools against a renderer for real debugging.",
      content: `## The events a window emits

A \`BrowserWindow\` instance is an \`EventEmitter\` firing events at every meaningful change to its state:

\`\`\`js
win.on("resize", () => {
  const [width, height] = win.getSize()
  console.log("resized to", width, height)
})

win.on("move", () => {
  const [x, y] = win.getPosition()
  console.log("moved to", x, y)
})

win.on("close", (event) => {
  // fires BEFORE the window actually closes — event.preventDefault()
  // here can cancel the close, e.g. to prompt "save changes?"
})

win.on("closed", () => {
  // fires AFTER the window is gone — too late to prevent anything,
  // this is where you'd clear out any reference you were holding
})
\`\`\`

The distinction between \`close\` and \`closed\` matters: \`close\` is cancelable (call \`event.preventDefault()\` inside the handler to stop the window from closing — the standard way to implement an "unsaved changes" confirmation), while \`closed\` is purely informational, firing once the window is already gone and useful only for cleanup like nulling out a reference (as shown in the previous lesson).

## Persisting window bounds across launches

A common piece of app polish is remembering a window's size and position between launches, rather than always opening at a fixed default size. This isn't a built-in Electron feature — it's a small amount of app code, reading and writing a JSON file yourself:

\`\`\`js
const fs = require("fs")
const path = require("path")
const { app, BrowserWindow } = require("electron")

const statePath = path.join(app.getPath("userData"), "window-state.json")

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf-8"))
  } catch {
    return { width: 1000, height: 700 } // sensible default on first launch
  }
}

function createWindow() {
  const state = loadWindowState()
  const win = new BrowserWindow({ ...state })

  const saveState = () => {
    fs.writeFileSync(statePath, JSON.stringify(win.getBounds()))
  }

  win.on("resize", saveState)
  win.on("move", saveState)
}
\`\`\`

\`app.getPath("userData")\` returns a per-OS, per-app directory intended for exactly this kind of small persisted state (it's where Chromium-based apps traditionally keep things like local storage and cookies too) — always prefer it over guessing a path, since its actual location differs by platform (\`AppData\` on Windows, \`Application Support\` on macOS, a XDG-compliant directory on Linux). A production app would typically debounce \`saveState\` rather than writing synchronously on every single resize/move tick, but the shape above is the core idea.

## Opening DevTools against a renderer

Because a renderer is a real Chromium page, the exact same DevTools you'd use on a Chrome tab work against it:

\`\`\`js
win.webContents.openDevTools()
// or, undockable from the main window:
win.webContents.openDevTools({ mode: "detach" })
\`\`\`

This is invaluable during development — full console, network tab, element inspector, breakpoints in renderer JavaScript — and is typically gated behind a development-only check or a menu item, since shipping a production build with DevTools opening automatically is rarely intended:

\`\`\`js
if (!app.isPackaged) {
  win.webContents.openDevTools()
}
\`\`\`

\`app.isPackaged\` is \`true\` for a built, distributed app and \`false\` while running via \`electron .\` in development — a reliable way to gate dev-only behavior without an extra environment variable.

> **Key idea:** \`BrowserWindow\` fires cancelable \`close\` and informational \`closed\` events (useful for "unsaved changes" prompts and cleanup respectively), window bounds can be persisted to \`app.getPath("userData")\` as plain JSON to restore size/position across launches, and \`webContents.openDevTools()\` opens real Chrome DevTools against any renderer — typically gated behind \`!app.isPackaged\`.`,
    },
  ],
}
