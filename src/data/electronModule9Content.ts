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
    {
      name: "Content Security Policy & Untrusted Content",
      minutes: 9,
      intro: "Lock down what a renderer's page is allowed to load and execute with a CSP header, and control navigation to untrusted URLs with will-navigate and setWindowOpenHandler.",
      content: `## Content Security Policy, same as on the web

A **Content Security Policy (CSP)** restricts what a page is allowed to load and execute — which script sources are trusted, whether inline \`<script>\` tags run at all, which domains images/styles can come from — and it works identically in an Electron renderer as it does in any browser, because it's the same Chromium engine enforcing it. A tight CSP is one of the most effective defenses against XSS actually executing anything dangerous, even if a script somehow gets injected into the page.

\`\`\`js
// main.js — setting a CSP header on every response the window loads
const { session } = require("electron")

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; script-src 'self'; object-src 'none';",
      ],
    },
  })
})
\`\`\`

\`default-src 'self'\` restricts nearly everything to same-origin (your own bundled files) by default; \`script-src 'self'\` specifically forbids inline scripts and scripts from any other origin; \`object-src 'none'\` blocks plugin content like \`<object>\`/\`<embed>\` entirely, a legacy attack surface with essentially no legitimate use in a modern app. A CSP this strict is the right starting point for an app that only ever loads its own bundled code — it should be *loosened* deliberately and specifically (e.g. adding a particular CDN to \`script-src\`) only when an actual, understood need arises, never left permissive by default.

## \`webSecurity\`: don't turn it off

\`webPreferences.webSecurity\` (default \`true\`) enforces same-origin policy and other standard web security restrictions inside the renderer, exactly like a real browser. Setting it to \`false\` — sometimes suggested online as a quick fix for a CORS error during development — disables same-origin protections entirely for that window, and doing so in a shipped app is a serious, well-documented security mistake. If a CORS issue is blocking legitimate cross-origin requests, the correct fix is addressing it on the server side (proper CORS headers) or proxying the request through the main process, never disabling \`webSecurity\`.

## Controlling navigation to untrusted destinations

A renderer that can navigate to arbitrary URLs — following a link, or loading attacker-controlled content into an \`<iframe>\` or the top-level window — is a real risk if that URL is anything other than your own trusted app content. Two handlers let the main process intervene:

\`\`\`js
// main.js
mainWindow.webContents.on("will-navigate", (event, url) => {
  const allowed = new URL(url).origin === "app://your-app"
  if (!allowed) event.preventDefault()
})

mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  // deny opening new Electron windows entirely; hand external links
  // to the user's actual default browser instead
  require("electron").shell.openExternal(url)
  return { action: "deny" }
})
\`\`\`

\`will-navigate\` fires before the *current* window navigates away from its loaded content — denying it for anything outside your app's own origin prevents a crafted link from replacing your app's UI with attacker-controlled content. \`setWindowOpenHandler\` intercepts attempts to open a *new* window or tab (e.g. a link with \`target="_blank"\`, or \`window.open()\`) — returning \`{ action: "deny" }\` blocks a new Electron \`BrowserWindow\` from opening at all, and routing the URL to \`shell.openExternal\` instead sends it to the user's actual system browser, which is both safer (your app's privileged renderer never loads that content) and matches normal user expectations for external links.

> **Key idea:** A strict Content Security Policy (\`script-src 'self'\`, no inline scripts) blunts what an XSS bug could actually execute even if injection occurs; \`webSecurity\` should never be disabled to work around a CORS error; and \`will-navigate\`/\`setWindowOpenHandler\` let the main process reject navigation to untrusted origins and route external links to the system browser instead of opening them inside a privileged Electron window.`,
    },
    {
      name: "Auditing & Hardening a Real App",
      minutes: 9,
      intro: "Work through a practical security checklist for a real Electron app, avoid the deprecated remote module, and handle permission requests deliberately instead of accepting every default.",
      content: `## A practical checklist

Pulling together everything from this module and the ones before it, a genuine security pass over an existing Electron app should check each of the following, in roughly this order of impact:

1. **\`nodeIntegration: false\`, \`contextIsolation: true\`, \`sandbox: true\`** on every single \`BrowserWindow\` — including secondary windows and any \`<webview>\` tags, which are easy to forget once the main window is locked down correctly.
2. **The preload script's exposed API is narrow** — no raw \`ipcRenderer.invoke\` pass-through (Module 5), each exposed method does one specific, well-understood thing.
3. **IPC handlers validate their inputs** — file paths checked against an expected directory (Module 7), no handler blindly trusting a renderer-supplied argument.
4. **A strict CSP is set**, and \`webSecurity\` is never disabled.
5. **\`will-navigate\` and \`setWindowOpenHandler\` are both implemented** for any window that could conceivably encounter an external link.
6. **Dependencies are kept current** — Electron itself, and any npm packages bundled into the renderer; Electron ships frequent security patches tracking upstream Chromium and Node.js CVEs, and running a version several major releases behind means missing all of them.

## The deprecated \`remote\` module

Older Electron code (and a fair number of outdated tutorials) uses a module called \`remote\`, which let a renderer synchronously call main-process APIs directly (\`remote.dialog.showOpenDialog(...)\` from inside a renderer, no explicit IPC channel needed) by transparently proxying calls across the process boundary. It was removed from Electron core specifically because of the risk it created: it exposed a huge, largely unrestricted surface of main-process functionality directly to renderer code, working against everything context isolation is meant to enforce, and its synchronous cross-process calls also caused real performance problems. If \`remote\` appears in a codebase you're auditing (it survives today only as a separate, explicitly opt-in \`@electron/remote\` package), that's a strong signal the app predates current security norms and deserves a closer look — the fix is migrating that functionality to explicit \`contextBridge\`-exposed, IPC-backed methods, exactly the pattern this course has used throughout.

## Handling permission requests deliberately

Chromium-based renderers can request permissions a browser tab would also prompt for — camera, microphone, geolocation, notifications. Electron's default is permissive (auto-granting many of these), which is rarely what a production app actually wants. A permission handler lets the main process decide explicitly:

\`\`\`js
const { session } = require("electron")

session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
  const allowedPermissions = ["notifications"]
  callback(allowedPermissions.includes(permission))
})
\`\`\`

Explicitly allow-listing exactly the permissions your app genuinely needs (as opposed to relying on Electron's default behavior, or blanket-approving everything) closes off another surface a compromised or buggy renderer could otherwise use — a page unexpectedly requesting camera access, for instance, should be denied rather than silently granted.

## The mindset that ties it together

Every item on this checklist is really one idea applied repeatedly: **the main process is the trust boundary, and every single thing that crosses it — a file path, a URL, a permission request — deserves the same scrutiny a server applies to a request from the public internet**, because functionally, that's what a renderer's request represents, no matter how much you trust the code you personally wrote for it.

> **Key idea:** A real security audit checks that isolation defaults are on everywhere (including secondary windows and webviews), the preload API stays narrow, IPC inputs are validated, CSP/webSecurity/navigation handlers are all in place, dependencies are current, the deprecated \`remote\` module is absent, and permission requests are explicitly allow-listed rather than left to Electron's permissive default — all instances of treating the main process as a trust boundary and the renderer as untrusted input.`,
    },
  ],
}
