import type { Module } from "../types"

export const electronModule9: Module = {
  id: 9,
  title: "Security Best Practices",
  status: "in_progress",
  lessons: [
    {
      name: "The Electron Security Model",
      minutes: 10,
      intro: "Understand why nodeIntegration, contextIsolation, and sandbox default the way they do today, and why that changed significantly over Electron's history.",
      content: `## Treat every renderer as if it might run untrusted code

The single organizing principle behind Electron's security defaults, stated plainly: **a renderer process should be treated the same way a browser treats a random web page — potentially hostile — even when you personally wrote every line of code it will ever load.** This sounds excessive for an app whose only content is your own bundled UI, but it's defense in depth against a real and common failure mode: a supply-chain-compromised npm dependency bundled into your renderer code, a bug that lets user-provided content (a pasted URL, a rendered Markdown file) execute as script, or a future you or teammate accidentally introducing an XSS-shaped bug. If any of those happen, the blast radius should be "a compromised web page," not "full Node.js and filesystem access to the user's entire machine."

## The three settings that define the boundary

| Setting | Modern default | What it does |
|---|---|---|
| \`nodeIntegration\` | \`false\` | Whether the renderer gets \`require()\` and Node globals directly |
| \`contextIsolation\` | \`true\` | Whether a preload script's JS context is isolated from the page's own |
| \`sandbox\` | \`true\` | Whether the renderer process runs inside Chromium's OS-level sandbox |

Modules 2 and 5 covered \`nodeIntegration\` and \`contextIsolation\` individually — this lesson's job is tying them together as one coherent model, and introducing \`sandbox\`, which goes a layer deeper than either.

## \`sandbox\`: restricting the renderer at the OS level

Even with \`nodeIntegration: false\`, a renderer process is still a real OS process capable of things like opening file descriptors or making raw system calls, unless further restricted. \`sandbox: true\` (the modern default) runs the renderer inside Chromium's OS-level sandbox — the same technology that confines a Chrome browser tab — which restricts what the underlying OS process itself is permitted to do, independent of what JavaScript APIs happen to be exposed to it. This is a meaningfully deeper layer of protection than \`nodeIntegration\`/\`contextIsolation\` alone: even a renderer that somehow found a way to execute arbitrary native code would still be constrained by what the OS sandbox permits.

## A brief, important history

Electron's defaults have not always been this safe, and understanding why they changed is useful context for reading older code or tutorials found online: early Electron shipped with \`nodeIntegration: true\` and no context isolation by default, because it made getting started dramatically simpler — a renderer could \`require("fs")\` directly, with no preload script or IPC bridge needed at all. As Electron apps became widespread and security research caught up to the platform, this default was recognized as a serious liability: any XSS-shaped bug, in an app with these old defaults, was a straight line to full system access. Electron's maintainers flipped the defaults over several major versions (\`contextIsolation\` becoming default-on in Electron 12, \`sandbox\` following later), and a large fraction of security tutorials, Stack Overflow answers, and older third-party packages still written against the old defaults are worth reading with real skepticism today.

## The practical rule for this entire course

Every example in this course — starting from Module 1's first window — has assumed \`nodeIntegration: false\`, \`contextIsolation: true\`, and (implicitly) \`sandbox: true\`, communicating with the main process exclusively through a preload script's \`contextBridge\`-exposed API and IPC. That's not a stylistic choice; it's the floor a production Electron app should start from, with any deviation being a deliberate, documented, narrowly-scoped exception — never the default posture.

> **Key idea:** Electron's security model treats every renderer as potentially hostile regardless of who wrote its code, enforced through \`nodeIntegration: false\` (no direct Node access), \`contextIsolation: true\` (preload and page JS contexts kept separate), and \`sandbox: true\` (OS-level process restriction) — all three now default-on after Electron's history of tightening these defaults following real security research, and all three should be left on for a production app.`,
    },
  ],
}
