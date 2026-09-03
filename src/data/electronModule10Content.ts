import type { Module } from "../types"

export const electronModule10: Module = {
  id: 10,
  title: "Packaging & Distribution with Electron Builder",
  status: "in_progress",
  lessons: [
    {
      name: "Introduction to electron-builder",
      minutes: 9,
      intro: "Configure electron-builder to turn a working Electron project into real, installable, per-platform packages.",
      content: `## From "runs via electron ." to a real installer

Everything up to this point in the course runs an app via \`electron .\` — fine for development, but not something you can hand to a user. **electron-builder** is the most widely used tool for turning an Electron project into actual distributable artifacts: a \`.exe\` installer on Windows, a \`.dmg\`/\`.app\` on macOS, an \`.AppImage\`/\`.deb\` on Linux — each one a real, double-click-to-install package.

\`\`\`bash
npm install --save-dev electron-builder
\`\`\`

## Minimal configuration

electron-builder reads its config from a \`build\` key in \`package.json\` (or a separate \`electron-builder.yml\` file, preferred once the config grows large):

\`\`\`json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "files": ["main.js", "preload.js", "dist/**/*"],
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
\`\`\`

- **\`appId\`** — a reverse-DNS-style unique identifier for the app, used by the OS for things like distinguishing your app's settings/updater state from any other app.
- **\`productName\`** — the human-readable name shown in the installer, window titles, and the OS's app list (can differ from \`package.json\`'s \`name\`, which has npm's stricter naming rules).
- **\`files\`** — an explicit allow-list of what actually ships inside the packaged app. Getting this wrong is a very common early mistake — forgetting to include a file here means it's simply missing at runtime in the packaged build, even though it worked fine via \`electron .\` (which just reads straight from the project directory, config-free).
- **\`win\` / \`mac\` / \`linux\`** — per-platform target format(s); each accepts an array if you want to produce more than one format per platform (e.g. both \`AppImage\` and \`deb\` on Linux).

## Building

\`\`\`bash
npx electron-builder --win
npx electron-builder --mac
npx electron-builder --linux
npx electron-builder -mwl   # all three platforms in one invocation, where supported
\`\`\`

An important limitation: **building a macOS \`.dmg\` reliably requires actually running on macOS** — cross-compiling a Mac target from Windows or Linux is unsupported for anything beyond an unsigned, best-effort build, because macOS packaging tools like \`hdiutil\` are macOS-only. Teams shipping to all three platforms from CI typically run a matrix build across macOS, Windows, and Linux runners rather than trying to cross-compile from a single machine.

## \`files\` vs. a real build step

Note that electron-builder packages whatever's on disk — it doesn't bundle or transpile your renderer code itself. A React/Vite-based renderer needs its own build step (\`vite build\`, producing a \`dist/\` folder) to run *before* \`electron-builder\`, with that output folder listed in \`files\` — packaging your raw, un-bundled source is rarely what you want for a production app, both for bundle size and because dev-only tooling (source maps, HMR client code) shouldn't ship to end users by default.

> **Key idea:** electron-builder turns a working \`electron .\` project into real per-platform installers, configured via a \`build\` key naming an \`appId\`, \`productName\`, an explicit \`files\` allow-list (forgetting a file here is a common source of "works in dev, broken when packaged" bugs), and per-platform \`win\`/\`mac\`/\`linux\` targets — with macOS builds needing to actually run on macOS.`,
    },
  ],
}
