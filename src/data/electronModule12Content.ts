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
    {
      name: "End-to-End Testing Electron Apps",
      minutes: 9,
      intro: "Use Playwright's Electron support to drive a real, packaged-like instance of your app in tests, clicking through actual windows the way a user would.",
      content: `## Why unit tests alone aren't enough

Unit tests can verify individual functions — an IPC handler's logic, a utility that formats a file path — in isolation, and are worth having for exactly that. But they can't catch the class of bug that only shows up when the whole app is actually running: a preload script that fails to expose an API correctly, an IPC channel name mismatch between main and renderer, a window that never becomes visible because \`ready-to-show\` never fires. Catching those requires actually launching the app and driving it the way a real user would — end-to-end (E2E) testing.

## Playwright's Electron support

**Playwright**, primarily known as a browser-automation tool, has built-in support for launching and driving a real Electron app, making it the most common modern choice for Electron E2E testing:

\`\`\`bash
npm install --save-dev @playwright/test
\`\`\`

\`\`\`ts
// tests/app.spec.ts
import { test, expect, _electron as electron } from "@playwright/test"

test("opens a window with the correct title", async () => {
  const app = await electron.launch({ args: ["."] })
  const window = await app.firstWindow()

  await expect(window).toHaveTitle("My Electron App")

  await app.close()
})
\`\`\`

\`electron.launch({ args: ["."] })\` starts a genuine instance of the app (the same way \`electron .\` would from a terminal), and \`app.firstWindow()\` returns a Playwright \`Page\` object for the first \`BrowserWindow\` that opens — from there, every normal Playwright API (\`click\`, \`fill\`, \`waitForSelector\`, assertions like \`toHaveText\`) works exactly as it would against a web page, because under the hood, it is one.

## Testing a full user flow

\`\`\`ts
test("creates and saves a note", async () => {
  const app = await electron.launch({ args: ["."] })
  const window = await app.firstWindow()

  await window.click("#new-note-button")
  await window.fill("#note-title", "Grocery list")
  await window.click("#save-button")

  await expect(window.locator(".note-list-item")).toContainText("Grocery list")

  await app.close()
})
\`\`\`

This test exercises the real UI, the real IPC call to save the note, and the real main-process file-write from Module 7's file-saving lesson — genuinely end-to-end, closer to how a human tester would verify the feature than any unit test could be.

## Asserting on main-process behavior

Playwright's Electron support also exposes the main process's \`app\` and \`BrowserWindow\` state directly through \`app.evaluate()\`, letting a test assert on things only the main process knows about:

\`\`\`ts
test("app version matches package.json", async () => {
  const app = await electron.launch({ args: ["."] })

  const version = await app.evaluate(({ app }) => app.getVersion())
  expect(version).toBe("1.0.0")

  await app.close()
})
\`\`\`

\`app.evaluate(callback)\` runs \`callback\` inside the actual main process, with Electron's \`app\` module passed in — a genuinely unique capability compared to testing a regular web app, where there's no equivalent "main process" to reach into at all.

## Where this fits in a testing strategy

A healthy Electron test suite typically layers: unit tests for pure logic (IPC handler bodies, utility functions, tested directly without launching Electron at all), and a smaller number of Playwright E2E tests covering the critical user-facing flows end to end (app launches, core features work, IPC actually round-trips correctly) — mirroring the standard testing-pyramid advice from web development, just with Playwright's Electron mode filling the E2E layer instead of driving a browser against a deployed URL.

> **Key idea:** Playwright's \`_electron\` module launches a real instance of an Electron app for testing, with \`app.firstWindow()\` returning an ordinary Playwright \`Page\` for driving the UI and \`app.evaluate()\` reaching into the actual main process — giving genuine end-to-end coverage of flows that unit tests alone (which can't launch real windows or exercise real IPC) can't verify.`,
    },
  ],
}
