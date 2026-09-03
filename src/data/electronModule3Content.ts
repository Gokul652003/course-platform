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
  ],
}
