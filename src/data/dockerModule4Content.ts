import type { Module } from "../types"

export const dockerModule4: Module = {
  id: 4,
  title: "Multi-Stage Builds & Image Optimization",
  status: "upcoming",
  lessons: [
    {
      name: "Layer Caching for Faster Builds",
      minutes: 9,
      intro: "Ordering your Dockerfile so rebuilds only redo the work that actually changed.",
      content: `### Docker caches each layer

When you rebuild an image, Docker checks each instruction against its cache: if the instruction and its inputs haven't changed since the last build, Docker reuses the cached layer instead of re-executing it. The moment one instruction's cache is invalidated, **every instruction after it** must be re-run too — the cache is a chain, not independent per-line.

### The classic mistake

\`\`\`dockerfile
# BAD: invalidates npm install on every code change
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
\`\`\`

Here, \`COPY . .\` copies your *entire* project — including source files that change on every commit. Since Docker's cache is invalidated the moment any copied file changes, \`RUN npm install\` re-runs on **every single build**, even if you only edited one line of application code and didn't touch a single dependency.

### The fix: copy dependency manifests first

\`\`\`dockerfile
# GOOD: npm install only reruns when dependencies actually change
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
\`\`\`

Now \`package.json\`/\`package-lock.json\` are copied — and cached — separately from the rest of the source. \`npm install\` only re-runs when those specific files change. Editing application code invalidates only the final \`COPY . .\` and anything after it, leaving the (often slowest) dependency install step cached.

### General principle: order from least to most frequently changing

\`\`\`
FROM ...              <- changes rarely
RUN apt-get install    <- changes rarely
COPY package.json ...  <- changes occasionally
RUN npm install         <- changes occasionally
COPY . .                <- changes on every build
\`\`\`

Put instructions that change rarely near the top, and instructions that change on every build (like copying your actual source code) as late as possible.

### Verifying it's working

\`\`\`bash
docker build -t my-app .
# edit only application code, not dependencies
docker build -t my-app .
\`\`\`

On the second build, watch for \`CACHED\` next to the dependency-install step in the output — confirmation the ordering is paying off.

> **Key idea:** Docker's build cache is a chain — one invalidated layer invalidates everything after it. Ordering instructions from "rarely changes" to "changes constantly" is the single highest-leverage Dockerfile optimization.`,
    },
    {
      name: "Multi-Stage Builds",
      minutes: 10,
      intro: "Using one stage to build your app, and a second, leaner stage to actually ship it.",
      content: `### The problem: build tools bloat your final image

Compiling a typical app needs a compiler, dev dependencies, and build tooling — none of which are needed once the app is actually built. Shipping all of that in your production image wastes space and increases attack surface for no benefit.

\`\`\`dockerfile
# single-stage: ships the entire toolchain, unnecessarily
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/server.js"]
\`\`\`

### The fix: multiple FROM stages

\`\`\`dockerfile
# Stage 1: build
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: run
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
CMD ["node", "dist/server.js"]
\`\`\`

- **Stage 1 (\`build\`)** — uses the full \`node:20\` image, installs all dependencies, compiles/bundles the app.
- **Stage 2** — starts completely fresh from a minimal \`node:20-alpine\` base, and \`COPY --from=build\` pulls **only** the compiled output from the first stage — none of the build tools, dev dependencies, or intermediate files make it into the final image.

### Why this matters

The final image contains only what's needed to *run* the app — often a fraction of the size of the single-stage version. This is the standard approach for compiled languages (Go, Rust, Java) where the build toolchain (a full compiler suite) is enormous compared to the resulting binary.

\`\`\`dockerfile
# Go example: final image has NO Go toolchain at all
FROM golang:1.22 AS build
WORKDIR /app
COPY . .
RUN go build -o server .

FROM alpine:latest
COPY --from=build /app/server /server
CMD ["/server"]
\`\`\`

The final Alpine-based image here doesn't contain the Go compiler at all — just a single compiled binary and a minimal base OS, often shrinking a multi-hundred-megabyte build image down to under 20MB.

### Naming and targeting stages

\`\`\`bash
docker build --target build -t my-app:build-only .
\`\`\`

\`--target\` lets you build (and stop at) just one named stage — useful for a debugging image that includes dev tools, separate from the lean production image.

> **Key idea:** multi-stage builds let you use a "fat" image with a full toolchain to *build* your app, then discard everything except the finished artifact in a lean final image — best of both worlds, in one Dockerfile.`,
    },
    {
      name: "Choosing a Base Image",
      minutes: 8,
      intro: "Alpine, slim, distroless, or full — weighing the real tradeoffs.",
      content: `### The size/compatibility spectrum

\`\`\`
distroless < alpine < slim < full (debian/ubuntu)
   ~2MB      ~5-50MB   ~50-150MB   ~500MB-1GB+
\`\`\`

- **Full images** (\`node:20\`, \`python:3.12\`, \`ubuntu:22.04\`) — based on Debian or Ubuntu, include a complete shell, package manager, and common utilities. Largest, but maximally compatible — anything you'd expect from a normal Linux system is there.
- **Slim images** (\`node:20-slim\`, \`python:3.12-slim\`) — Debian-based but stripped of extras (docs, some locales, build tools). A middle ground: still \`glibc\`-based (fewer compatibility surprises) but noticeably smaller than the full image.
- **Alpine images** (\`node:20-alpine\`) — built on Alpine Linux, using \`musl\` libc instead of \`glibc\` and \`busybox\` instead of GNU coreutils. Dramatically smaller, but native dependencies compiled against \`glibc\` can fail mysteriously — a real, recurring gotcha with some npm/pip packages.
- **Distroless** (\`gcr.io/distroless/nodejs20\`) — no shell, no package manager, no OS utilities at all — just the language runtime and your app. The smallest attack surface possible, but effectively impossible to \`docker exec\` into and debug interactively.

### The alpine gotcha

\`\`\`bash
docker run -it node:20-alpine sh
# apk add curl   <- alpine's package manager is apk, not apt
\`\`\`

Alpine uses \`apk\`, not \`apt\`/\`apt-get\` — a common early mistake when switching a Dockerfile from a Debian-based image to Alpine. Also, some npm packages with native (C/C++) bindings need to be rebuilt against \`musl\`, or need an extra \`apk add python3 make g++\` before \`npm install\` will succeed.

### A practical decision guide

| Situation | Reach for |
|---|---|
| Prototyping, want zero friction | Full image |
| Production web app, standard dependencies | \`slim\` or \`alpine\` |
| Production, dependencies with native bindings that fight Alpine | \`slim\` |
| Maximum security, minimal image, no interactive debugging needed | \`distroless\` |

### Verify with actual size, not assumption

\`\`\`bash
docker images | grep node
\`\`\`

\`\`\`
node   20         ...   1.1GB
node   20-slim    ...   240MB
node   20-alpine  ...   180MB
\`\`\`

Always check the actual numbers for the specific image you're using — the general ranking holds, but exact sizes vary a lot by language and what additional system libraries the runtime needs.

> **Key idea:** Alpine isn't automatically the "correct" choice — it's a real tradeoff between size and compatibility. For most production apps, \`alpine\` or \`slim\` is right; reach for distroless only when you specifically want to eliminate the shell as an attack surface.`,
    },
    {
      name: "Reducing Image Size Further",
      minutes: 7,
      intro: "A checklist of smaller techniques that compound with layer caching and multi-stage builds.",
      content: `### Clean up in the same RUN layer

\`\`\`dockerfile
# BAD: the apt cache still exists in an earlier layer, even though this RUN removes it
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# GOOD: cleanup happens within the SAME layer, so it never gets committed
RUN apt-get update && apt-get install -y curl \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

Because each layer is an immutable diff, deleting a file in a *later* \`RUN\` doesn't shrink the image — the file still exists in the earlier layer, just hidden. The image on disk still contains it. Cleanup must happen within the *same* \`RUN\` instruction that created the mess.

### Combine related RUN instructions

\`\`\`dockerfile
# 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# 1 layer, smaller and faster
RUN apt-get update && apt-get install -y curl git
\`\`\`

Fewer, larger layers generally beat many small ones — less per-layer overhead, and cleanup (like the apt cache above) actually takes effect.

### Only install what you need

\`\`\`dockerfile
RUN npm install --omit=dev
\`\`\`

\`--omit=dev\` (or the older \`--production\` flag) skips devDependencies — testing frameworks, linters, build tools — none of which the running application needs. Combined with a multi-stage build, this trims real weight from the final image.

### Use --no-cache with package managers

\`\`\`dockerfile
RUN apk add --no-cache curl
\`\`\`

Alpine's \`apk add --no-cache\` skips writing the package index to disk in the first place, avoiding the "install then clean up" dance entirely.

### Check what's actually taking up space

\`\`\`bash
docker history my-app:1.0
\`\`\`

Lists every layer with its size — the fastest way to spot the actual culprit (often a forgotten build tool, or an uncached package manager index) rather than guessing.

\`dive\` (a popular third-party CLI tool, \`docker run --rm -it wagoodman/dive my-app:1.0\`) goes further, letting you interactively browse each layer's exact file changes — genuinely useful when hunting for unexpected bloat.

> **Key idea:** layers are immutable diffs — a later \`RUN rm\` doesn't shrink an image, it just hides the file while the space stays allocated. Cleanup only "counts" when it happens in the same layer that created the mess.`,
    },
  ],
}
