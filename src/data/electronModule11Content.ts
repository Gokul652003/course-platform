import type { Module } from "../types"

export const electronModule11: Module = {
  id: 11,
  title: "Auto-Updates & Native Notifications",
  status: "in_progress",
  lessons: [
    {
      name: "Auto-Updates with electron-updater",
      minutes: 10,
      intro: "Wire up electron-updater to check for, download, and install new versions in the background, using the publish config from the previous module.",
      content: `## Why auto-updates matter more for desktop apps than web apps

A web app updates the instant you deploy new code — every user gets it on their next page load, with no action required from them. A desktop app has no such guarantee: once installed, it keeps running whatever version was on disk at install time, indefinitely, unless something actively checks for and applies updates. Without auto-updates, a security fix or critical bug fix might never reach a meaningful fraction of your users at all. **electron-updater** (a companion package to electron-builder, sharing its \`publish\` configuration from the previous module) is the standard way to close that gap.

## Basic setup

\`\`\`bash
npm install electron-updater
\`\`\`

\`\`\`js
// main.js
const { autoUpdater } = require("electron-updater")
const { app } = require("electron")

app.whenReady().then(() => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})
\`\`\`

\`checkForUpdatesAndNotify()\` is the simplest entry point: it checks the configured \`publish\` provider (GitHub Releases, in the previous module's example) for a newer version, and if one exists, downloads it in the background and shows a native OS notification once it's ready — with zero additional UI code required.

## The update lifecycle, event by event

For more control than the all-in-one \`checkForUpdatesAndNotify\`, \`autoUpdater\` emits events at each stage, letting you build custom UI (a progress bar, a "restart to update" button) around the process:

\`\`\`js
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...")
})

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info.version)
})

autoUpdater.on("update-not-available", () => {
  console.log("Already on the latest version")
})

autoUpdater.on("download-progress", (progress) => {
  console.log(\`Downloaded \${progress.percent.toFixed(1)}%\`)
})

autoUpdater.on("update-downloaded", () => {
  // the new version is fully downloaded and verified — safe to restart now
  autoUpdater.quitAndInstall()
})

autoUpdater.on("error", (err) => {
  console.error("Auto-update error:", err)
})
\`\`\`

A common, more polished pattern: don't call \`quitAndInstall()\` immediately on \`update-downloaded\` — instead, notify the user (an in-app banner, a tray menu item) and let *them* choose when to restart, since forcibly quitting mid-session is disruptive if they're in the middle of unsaved work.

## Update servers: GitHub Releases vs. a generic server

The \`publish\` config from Module 10 isn't limited to GitHub — electron-updater also supports a generic static file server (any host serving the right metadata files alongside your installers) and a few other providers, useful for teams that can't or don't want to distribute through GitHub Releases:

\`\`\`json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://updates.example.com/my-app/"
    }
  }
}
\`\`\`

Whichever provider is used, electron-updater relies on metadata files (\`latest.yml\` on Windows, \`latest-mac.yml\` on macOS) that electron-builder generates automatically alongside the installers during a \`--publish\` build — these describe the current version and where to download it, and are what a running app's \`autoUpdater.checkForUpdatesAndNotify()\` actually reads to decide whether a newer version exists.

## Auto-updates require a signed build (on most platforms)

A meaningful gotcha: on macOS, electron-updater generally requires the app to be code-signed (Module 10) to apply updates at all — an unsigned app can check for and download an update but may fail to actually install it. This is one more concrete reason signing isn't optional for a production macOS release, beyond just avoiding Gatekeeper warnings on first install.

> **Key idea:** \`autoUpdater.checkForUpdatesAndNotify()\` (or its individual events — \`update-available\`, \`download-progress\`, \`update-downloaded\`) checks the same \`publish\` provider electron-builder uploads to, downloads new versions in the background, and installs them via \`quitAndInstall()\` — best triggered by explicit user choice rather than forced immediately on download completion, and generally requiring a signed build on macOS to actually apply.`,
    },
    {
      name: "Native Notifications API",
      minutes: 8,
      intro: "Show real OS notifications from the main process with Electron's Notification module, including action buttons, and know the platform-specific setup each OS needs.",
      content: `## The \`Notification\` module

Electron's \`Notification\` class shows a genuine OS-native notification — the same visual style and placement as any other app's notifications on that platform (Notification Center on macOS, the Action Center on Windows, the desktop's own notification daemon on Linux):

\`\`\`js
const { Notification } = require("electron")

function showNotification(title, body) {
  if (!Notification.isSupported()) return

  new Notification({ title, body }).show()
}

showNotification("Download complete", "your-file.zip is ready")
\`\`\`

\`Notification.isSupported()\` is worth checking before constructing one — while rare, some environments (certain Linux setups without a running notification daemon) genuinely don't support them, and this check avoids an unnecessary crash or silent failure path.

## Reacting to interaction

A notification instance is an \`EventEmitter\`, firing events for how the user interacts with it — clicking it, or dismissing it:

\`\`\`js
const notification = new Notification({ title: "New message", body: "..." })

notification.on("click", () => {
  mainWindow.show()
  mainWindow.focus()
})

notification.on("close", () => {
  console.log("Notification dismissed")
})

notification.show()
\`\`\`

A very common pattern — clicking a notification bringing the (possibly hidden or minimized) main window to the front — combines directly with the tray-resident hide/show pattern from Module 8.

## Action buttons

On platforms that support it, a notification can include actionable buttons directly in the notification itself, without requiring the user to first click into the app:

\`\`\`js
const notification = new Notification({
  title: "Update available",
  body: "Version 2.0 is ready to install",
  actions: [
    { type: "button", text: "Install Now" },
    { type: "button", text: "Later" },
  ],
})

notification.on("action", (event, index) => {
  if (index === 0) autoUpdater.quitAndInstall()
})

notification.show()
\`\`\`

\`actions\` support is platform-dependent — most reliable on macOS, with more limited or absent support elsewhere, so an app relying heavily on action buttons should have a working fallback path (e.g. a normal click opening a window with the same choice) for platforms where they're unavailable rather than assuming they always render.

## Platform-specific setup quirks

- **macOS** — a packaged, signed app generally works immediately; notifications from an app running via plain \`electron .\` in development sometimes don't display correctly due to how macOS ties notification permissions to a registered, signed bundle identity — testing against a packaged dev build is more reliable than assuming dev-mode behavior matches production.
- **Windows** — reliable notification delivery, particularly the app's icon showing correctly, benefits from the app having a proper Start Menu shortcut with a correctly associated \`AppUserModelID\` — something electron-builder's \`nsis\` installer sets up automatically, another reason a genuine installer (not just a portable \`.exe\`) tends to behave more predictably here.
- **Linux** — depends on a notification daemon being present and running (true on essentially every mainstream desktop environment, but worth knowing as the one platform where \`Notification.isSupported()\` returning \`false\` is a real, non-hypothetical possibility).

> **Key idea:** \`new Notification({ title, body }).show()\` shows a real OS-native notification, with \`click\`/\`close\`/\`action\` events for interaction (action buttons being platform-dependent, most reliable on macOS) — always guard with \`Notification.isSupported()\` first, and be aware each platform has its own setup quirks around signing and shortcuts that affect real-world reliability.`,
    },
  ],
}
