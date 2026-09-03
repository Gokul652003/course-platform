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
    {
      name: "Code Signing & Notarization",
      minutes: 9,
      intro: "Understand why unsigned builds trigger scary OS warnings, and what code signing and macOS notarization actually verify.",
      content: `## Why an unsigned app looks alarming to install

Try installing an unsigned build on either major OS and the experience is deliberately unpleasant: Windows SmartScreen shows "Windows protected your PC" with the publisher listed as "Unknown," and macOS refuses to open the app at all with "cannot be opened because the developer cannot be verified" unless the user goes out of their way through System Settings to override it. Neither OS is detecting anything actually malicious about your specific app — they're enforcing a baseline: **any code that isn't cryptographically signed by an identifiable publisher gets treated as untrusted by default**, precisely because unsigned executables are how a huge fraction of real malware spreads.

## What code signing actually verifies

Signing an app with a certificate tied to your (or your company's) verified identity doesn't scan your code for safety — it cryptographically proves two things: the binary hasn't been tampered with since you built it, and it genuinely came from whoever the certificate says it came from. That's enough for the OS to show the user your actual publisher name instead of "Unknown," and, on Windows, for SmartScreen's reputation system to stop flagging it as suspicious once enough signed copies have been seen in the wild.

## Windows: Authenticode signing

Windows code signing uses a certificate from a recognized Certificate Authority, configured for electron-builder via environment variables or config pointing at a \`.pfx\` file (or, increasingly, a cloud-based HSM-backed signing service, since standalone \`.pfx\` certificates have become harder for CAs to issue under current industry rules):

\`\`\`json
{
  "build": {
    "win": {
      "certificateFile": "cert.pfx",
      "certificatePassword": "..."
    }
  }
}
\`\`\`

The certificate password (and the certificate file itself) should never be committed to source control — in CI, both are supplied as encrypted secrets, read from environment variables at build time, exactly like any other credential.

## macOS: signing *and* notarization

macOS requires two separate steps, not just one. **Signing** works similarly to Windows, using an Apple Developer identity certificate. **Notarization** is an additional, Apple-specific step on top: after signing, the built app is uploaded to Apple's servers, which scan it for known-malicious content and, if it passes, issue a notarization ticket that gets stapled to the app. Without this second step, even a properly *signed* macOS app still shows a Gatekeeper warning on first launch — as of recent macOS versions, notarization (not just signing) is required for a fully warning-free install experience.

\`\`\`json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "notarize": true
    },
    "afterSign": "scripts/notarize.js"
  }
}
\`\`\`

\`hardenedRuntime: true\` is a prerequisite Apple requires for notarization eligibility, tightening what the app's process is permitted to do at runtime (similar in spirit to Module 9's \`sandbox\` setting, but macOS/Apple-specific). Notarization itself requires an active Apple Developer Program membership and app-specific credentials supplied via environment variables at build time.

## The honest tradeoff

Both signing and notarization cost real money and setup time (a paid Apple Developer account, a paid code-signing certificate on Windows) and add friction to a CI pipeline. For a genuinely internal tool distributed only to a small trusted team, skipping this may be an acceptable, deliberate tradeoff. For anything distributed publicly, the scary OS warnings an unsigned build produces are enough to tank adoption on their own — most users reasonably won't push through an "Unknown publisher" prompt for software they don't already trust, making signing (and, on macOS, notarization) a practical requirement rather than a nice-to-have for any public release.

> **Key idea:** Unsigned apps trigger real OS-level warnings (SmartScreen on Windows, Gatekeeper on macOS) because signing cryptographically proves an app's publisher identity and integrity, not its safety; macOS additionally requires notarization — an Apple malware scan performed after signing — for a fully warning-free install, and both require paid developer accounts/certificates that are worth budgeting for before a public release.`,
    },
  ],
}
