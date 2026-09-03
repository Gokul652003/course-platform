import type { Module } from "../types"

export const electronModule12: Module = {
  id: 12,
  title: "Testing, Debugging & Performance",
  status: "in_progress",
  lessons: [
    {
      name: "Debugging Main & Renderer Processes",
      minutes: 9,
      intro: "Debug the main process with Node's --inspect flag and a VS Code launch config, and the renderer with ordinary Chrome DevTools.",
      content: `## Two processes, two separate debugging stories

Because the main and renderer processes are genuinely different runtimes (Node.js vs. Chromium's renderer engine, from Module 2), debugging each uses different tooling — there's no single "attach a debugger" step that covers both at once.

## Debugging the renderer: it's just Chrome DevTools

Since a renderer is a real Chromium page, \`webContents.openDevTools()\` (covered back in Module 3) opens the exact same DevTools experience as debugging a Chrome tab — breakpoints in renderer JavaScript, the Elements panel for inspecting the live DOM, the Network tab for any \`fetch\` calls, and the Console for logging and quick expression evaluation, all working identically to web development.

## Debugging the main process: Node's \`--inspect\`

The main process is a Node.js process, so it uses Node's standard debugging protocol — launching Electron with an \`--inspect\` flag opens a debugging port that any Node-compatible debugger (Chrome's own \`chrome://inspect\`, or an editor's built-in debugger) can attach to:

\`\`\`bash
electron --inspect=5858 .
\`\`\`

With that running, opening \`chrome://inspect\` in an actual Chrome browser window, then clicking "Configure" to add \`localhost:5858\`, surfaces the main process as an inspectable Node target — full breakpoints, call stack, and variable inspection in \`main.js\` and anything it \`require\`s, from inside a completely ordinary Chrome tab.

## A VS Code launch config for one-click debugging

Most day-to-day main-process debugging goes through an editor's integrated debugger rather than manually opening \`chrome://inspect\` each time. A \`.vscode/launch.json\` entry wires this up directly:

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "\${workspaceFolder}",
      "runtimeExecutable": "\${workspaceFolder}/node_modules/.bin/electron",
      "program": "\${workspaceFolder}/main.js",
      "console": "integratedTerminal"
    }
  ]
}
\`\`\`

With this configuration, pressing VS Code's Run/Debug button launches the app with the main process already attached to VS Code's debugger — breakpoints set directly in the editor's gutter, right next to the code, without any manual \`--inspect\`/\`chrome://inspect\` steps.

## Debugging both at once

For a bug that spans the IPC boundary (Module 4) — say, a value that looks wrong by the time it reaches the renderer, and it's unclear whether the bug is in the main-process handler or the renderer's handling of the response — the practical approach is running both debugging setups simultaneously: the VS Code launch config (or \`--inspect\`) attached to the main process, and \`webContents.openDevTools()\` open for the renderer, with breakpoints set on both sides of the IPC call. Stepping through an \`ipcMain.handle\` call in one debugger and the corresponding \`ipcRenderer.invoke\` await in the other is usually the fastest way to pin down exactly where a cross-process value transformation is going wrong.

> **Key idea:** The renderer debugs with ordinary Chrome DevTools via \`webContents.openDevTools()\`; the main process debugs as a regular Node.js process via \`--inspect\` (attachable through \`chrome://inspect\` or a VS Code \`launch.json\` configuration) — and a bug spanning the IPC boundary between them is best tackled with both debuggers open at once.`,
    },
  ],
}
