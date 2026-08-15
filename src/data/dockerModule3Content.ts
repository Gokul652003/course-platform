import type { Module } from "../types"

export const dockerModule3: Module = {
  id: 3,
  title: "Writing Dockerfiles",
  status: "upcoming",
  lessons: [
    {
      name: "Your First Dockerfile",
      minutes: 10,
      intro: "The recipe that turns your application into a Docker image.",
      content: `### A Dockerfile is a build recipe

A \`Dockerfile\` is a plain text file of instructions, executed top to bottom, that produces an image. Here's a complete one for a small Node.js app:

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

### Instruction by instruction

- **\`FROM node:20-alpine\`** — every Dockerfile starts here: the base image everything else builds on top of.
- **\`WORKDIR /app\`** — sets the working directory inside the image for every instruction that follows. Creates the directory if it doesn't exist.
- **\`COPY package.json package-lock.json ./\`** — copies files from your build context (your project folder) into the image.
- **\`RUN npm install\`** — executes a command *during the build*, and bakes its result into a new layer.
- **\`COPY . .\`** — copies the rest of your project into the image.
- **\`EXPOSE 3000\`** — documents which port the container listens on. Purely informational — it doesn't actually publish the port (that's still \`-p\` at \`docker run\` time).
- **\`CMD ["node", "server.js"]\`** — the default command run when a container starts from this image.

### Building the image

\`\`\`bash
docker build -t my-app:1.0 .
\`\`\`

- \`-t my-app:1.0\` — tags the resulting image with a name and version.
- \`.\` — the **build context**: the directory Docker sends to the daemon, and the root that \`COPY\`/\`ADD\` paths are relative to.

### Running it

\`\`\`bash
docker run -d -p 3000:3000 my-app:1.0
\`\`\`

Now visiting \`http://localhost:3000\` hits your app, running fully inside its own isolated container.

> **Key idea:** a Dockerfile describes how to *build* an image, step by step. Every instruction that changes the filesystem (\`RUN\`, \`COPY\`, \`ADD\`) creates a new layer stacked on the one before it.`,
    },
    {
      name: "COPY, RUN, CMD & ENTRYPOINT",
      minutes: 10,
      intro: "The instructions that trip people up most — especially the CMD vs ENTRYPOINT distinction.",
      content: `### COPY vs ADD

\`\`\`dockerfile
COPY src/ /app/src/
ADD archive.tar.gz /app/
ADD https://example.com/file.txt /app/
\`\`\`

\`COPY\` does exactly one thing: copies files/folders from the build context into the image. \`ADD\` does that too, but *also* auto-extracts local \`.tar\` archives and can fetch remote URLs. Because of that implicit "magic," the general guidance is: **use \`COPY\` by default, reach for \`ADD\` only when you specifically need archive extraction.**

### RUN: executed at build time

\`\`\`dockerfile
RUN apt-get update && apt-get install -y curl
\`\`\`

Each \`RUN\` executes a shell command while the image is being built, and its result (files created, packages installed) is committed as a new layer. Chain related commands with \`&&\` in a single \`RUN\` rather than multiple separate ones — each \`RUN\` is a layer, and unnecessary layers bloat the final image (you'll see why in the next module).

### CMD: the default command

\`\`\`dockerfile
CMD ["node", "server.js"]
\`\`\`

\`CMD\` specifies what runs when a container **starts** (not during build). Crucially, it's a *default* — easily overridden:

\`\`\`bash
docker run my-app                  # runs: node server.js
docker run my-app npm test         # runs: npm test instead
\`\`\`

Whatever you put after the image name on \`docker run\` replaces the entire \`CMD\`.

### ENTRYPOINT: the command that isn't overridden

\`\`\`dockerfile
ENTRYPOINT ["node", "server.js"]
\`\`\`

\`\`\`bash
docker run my-app                  # runs: node server.js
docker run my-app --port=4000      # runs: node server.js --port=4000 (appended, not replaced!)
\`\`\`

Anything after the image name is **appended as arguments** to \`ENTRYPOINT\` rather than replacing it — the container always runs that fixed command.

### Combining both: fixed command, overridable defaults

\`\`\`dockerfile
ENTRYPOINT ["node", "server.js"]
CMD ["--port=3000"]
\`\`\`

\`\`\`bash
docker run my-app                  # node server.js --port=3000
docker run my-app --port=8080      # node server.js --port=8080
\`\`\`

This pattern — \`ENTRYPOINT\` for the fixed program, \`CMD\` for its default (overridable) arguments — is exactly how many official images (like \`postgres\`) are built, and it's worth recognizing when you read their Dockerfiles.

### exec form vs shell form

\`\`\`dockerfile
CMD ["node", "server.js"]     # exec form — preferred
CMD node server.js            # shell form — runs via /bin/sh -c
\`\`\`

The exec form (JSON array) runs the command directly, without wrapping it in a shell — this matters because it means the process becomes PID 1 and correctly receives signals like \`SIGTERM\` from \`docker stop\`. The shell form wraps it in \`sh -c\`, which can swallow those signals, leaving the container to hang until the timeout forces a \`SIGKILL\`.

> **Key idea:** \`CMD\` is an overridable default; \`ENTRYPOINT\` is a fixed command that \`CMD\`'s value (or \`docker run\` arguments) gets appended to. Prefer the exec (array) form of both for correct signal handling.`,
    },
    {
      name: "Build Context & .dockerignore",
      minutes: 8,
      intro: "What actually gets sent to the Docker daemon when you build — and how to keep it small.",
      content: `### What "build context" means

\`\`\`bash
docker build -t my-app .
\`\`\`

That trailing \`.\` is the **build context** — the entire directory tree gets sent to the Docker daemon *before* the build even starts, because \`COPY\`/\`ADD\` instructions can only reference files within it. If your project folder contains a bloated \`node_modules/\`, a \`.git/\` history, or gigabytes of log files, all of that gets bundled up and sent, slowing every single build.

### .dockerignore

Exactly like \`.gitignore\`, but for build context:

\`\`\`
node_modules
.git
.env
*.log
dist
.DS_Store
npm-debug.log
\`\`\`

Place a \`.dockerignore\` file next to your Dockerfile, and Docker excludes those paths from what gets sent to the daemon — faster builds, and no risk of accidentally \`COPY .\`-ing secrets or bloat into your image.

### Why excluding node_modules specifically matters

\`\`\`dockerfile
COPY package.json package-lock.json ./
RUN npm install
COPY . .
\`\`\`

If \`node_modules\` isn't excluded and you also \`COPY . .\`, you risk copying your *host's* \`node_modules\` (built for your OS/architecture) over the one \`npm install\` just built correctly *inside* the Linux container — a classic source of "works on my machine, breaks in the container" bugs, especially with packages that include native binaries.

### Excluding secrets

\`\`\`
.env
*.pem
secrets/
\`\`\`

Never rely on \`.dockerignore\` alone as your only safeguard against leaking secrets into an image — but it's an essential first line of defense, since anything not excluded and referenced by \`COPY\` becomes permanently baked into the image's layers (and remains there even if a *later* layer deletes the file).

### Checking what's actually in the context

\`\`\`bash
docker build --no-cache -t my-app . 2>&1 | head -5
\`\`\`

The first line of build output reports the context size ("Sending build context to Docker daemon  45.2MB") — a quick sanity check that your \`.dockerignore\` is doing its job. A multi-gigabyte number here almost always means something that should be ignored isn't.

> **Key idea:** everything in the build context directory gets sent to the daemon before the build even begins — a \`.dockerignore\` isn't optional polish, it's what keeps builds fast and prevents host-specific files or secrets from silently ending up baked into your image.`,
    },
    {
      name: "Environment Variables & Working Directory",
      minutes: 7,
      intro: "ENV, ARG, WORKDIR, and USER — the instructions that configure the image's runtime environment.",
      content: `### ENV: baked-in environment variables

\`\`\`dockerfile
ENV NODE_ENV=production
ENV PORT=3000
\`\`\`

Sets an environment variable that persists into every container run from this image — available to your app via \`process.env.NODE_ENV\` (Node) or the equivalent in any language. Unlike \`RUN\`, this isn't a one-time build step — it's part of the image's runtime configuration.

### ARG: build-time-only variables

\`\`\`dockerfile
ARG NODE_VERSION=20
FROM node:\${NODE_VERSION}-alpine
\`\`\`

\`\`\`bash
docker build --build-arg NODE_VERSION=18 -t my-app .
\`\`\`

\`ARG\` variables exist only *during the build* — they're not available inside a running container, and (unlike \`ENV\`) aren't baked into the final image. Use \`ARG\` for build-time choices (which base version, which build flags); use \`ENV\` for anything the running application itself needs to read.

### WORKDIR: setting the default directory

\`\`\`dockerfile
WORKDIR /app
COPY . .
RUN npm install
\`\`\`

Every subsequent instruction (\`COPY\`, \`RUN\`, \`CMD\`) executes relative to the last \`WORKDIR\`. Prefer \`WORKDIR\` over \`RUN cd /app\` — a \`cd\` inside one \`RUN\` doesn't persist to the next instruction, since each \`RUN\` executes in its own shell process.

### USER: don't run as root

\`\`\`dockerfile
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "server.js"]
\`\`\`

By default, containers run as \`root\` — meaning any process compromise inside the container has root privileges within it. \`USER\` switches to an unprivileged user for everything after it, so the running application has only the permissions it actually needs. Covered more in the security module, but the pattern is worth internalizing early — add it as a habit to every Dockerfile you write.

> **Key idea:** \`ENV\` persists into the running container, \`ARG\` exists only during the build. \`WORKDIR\` is the correct way to set a working directory (never \`RUN cd\`), and \`USER\` should be a default habit, not an afterthought.`,
    },
  ],
}
