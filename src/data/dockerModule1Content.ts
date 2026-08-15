import type { Module } from "../types"

export const dockerModule1: Module = {
  id: 1,
  title: "Getting Started with Docker",
  status: "in_progress",
  lessons: [
    {
      name: "What is Docker?",
      minutes: 8,
      intro: "Why containers exist, and the problem Docker was built to solve.",
      content: `### "It works on my machine"

Every developer has shipped code that worked perfectly locally and broke in production — a different OS version, a missing dependency, a mismatched library version. **Docker packages an application together with everything it needs to run** — code, runtime, system libraries, configuration — into a single unit called a **container**, so it behaves identically everywhere.

### Containers vs virtual machines

Both solve "isolate this app from the host," but very differently:

| | Virtual Machine | Container |
|---|---|---|
| Isolation | Full OS, own kernel | Shares the host's kernel |
| Size | Gigabytes | Megabytes |
| Startup time | Minutes | Seconds (often less) |
| Overhead | Heavy — runs a whole OS | Light — just the app + its dependencies |

A VM virtualizes an entire computer, including its own operating system kernel. A container virtualizes only at the *process* level — it looks and feels like an isolated machine to the application running inside it, but it's actually just a regular process on the host, with the host kernel enforcing strict boundaries around what it can see and touch.

### Image vs container — the vocabulary

- An **image** is a read-only template — the packaged application and its dependencies, frozen at a point in time. Think of it like a class.
- A **container** is a running (or stopped) instance of an image. Think of it like an object instantiated from that class.

You can run many containers from the same image, each isolated from the others, exactly like creating multiple objects from one class.

### Why it caught on

- **Consistency** — the same image runs identically on your laptop, a teammate's laptop, and a production server.
- **Isolation** — one container's crash or dependency conflict can't affect another running alongside it.
- **Efficiency** — containers share the host kernel, so you can run far more containers than VMs on the same hardware.
- **Portability** — an image built once can run on any machine with Docker installed, regardless of what else is installed on that machine.

> **Key idea:** a container is not a lightweight VM — it's an isolated process sharing the host's kernel. That distinction is *why* containers are so much faster and smaller than VMs.`,
    },
    {
      name: "Installing Docker & the CLI",
      minutes: 7,
      intro: "Getting Docker running on your machine, and the tools you'll use every day.",
      content: `### Docker Desktop vs Docker Engine

- **Docker Desktop** — the easiest path on Mac and Windows. A GUI app that bundles the Docker daemon, CLI, and a Kubernetes cluster you can toggle on, running inside a lightweight VM under the hood.
- **Docker Engine** — the native install on Linux, running directly on the host kernel with no VM layer in between (which is why containers on Linux are marginally faster/lighter than on Mac/Windows).

\`\`\`bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # run docker without sudo
\`\`\`

After installing, log out and back in (or run \`newgrp docker\`) for the group change to take effect.

### Verifying the install

\`\`\`bash
docker --version
docker info
\`\`\`

\`docker info\` prints details about the running Docker daemon — number of containers, storage driver, and more. If it errors out, the Docker daemon isn't running yet.

### The client/daemon architecture

The \`docker\` command you type is a **client** — it talks to a background **daemon** (\`dockerd\`) that does the actual work of building images and running containers. This is why Docker Desktop needs to be *running* (not just installed) before any \`docker\` command works.

\`\`\`
docker CLI (client)  --->  dockerd (daemon)  --->  containers
\`\`\`

### Your first command

\`\`\`bash
docker run hello-world
\`\`\`

This single command: checks if the \`hello-world\` image exists locally, downloads it from Docker Hub if not, creates a container from it, runs it (which prints a message), and the container exits. You'll see confirmation text explaining exactly what just happened — worth reading once.

> **Key idea:** the \`docker\` CLI is just a client talking to a background daemon. If commands hang or fail with a connection error, the daemon (Docker Desktop, or the \`docker\` service on Linux) usually isn't running.`,
    },
    {
      name: "Running Your First Container",
      minutes: 9,
      intro: "The docker run command, and the handful of flags you'll reach for constantly.",
      content: `### docker run: the core command

\`\`\`bash
docker run nginx
\`\`\`

Pulls the \`nginx\` image (if not already local) and starts a container from it. Without any flags, it runs in the **foreground** — your terminal is attached to the container's output, and Ctrl+C stops it.

### Detached mode

\`\`\`bash
docker run -d nginx
\`\`\`

\`-d\` (\`--detach\`) runs the container in the background and immediately returns your terminal, printing the new container's ID.

### Publishing a port

Containers are isolated by default — nothing outside can reach them unless you explicitly publish a port:

\`\`\`bash
docker run -d -p 8080:80 nginx
\`\`\`

\`-p 8080:80\` maps port 8080 on your host machine to port 80 inside the container (nginx's default port). Visit \`http://localhost:8080\` and you'll see nginx's welcome page. The format is always \`host:container\`.

### Naming a container

\`\`\`bash
docker run -d -p 8080:80 --name my-web nginx
\`\`\`

Without \`--name\`, Docker assigns a random name (something like \`vigorous_curie\`). Naming it makes later commands (\`docker stop my-web\`) much easier to type and remember.

### Listing running containers

\`\`\`bash
docker ps          # running containers only
docker ps -a       # all containers, including stopped ones
\`\`\`

\`\`\`
CONTAINER ID   IMAGE   COMMAND                  STATUS         PORTS                  NAMES
a1b2c3d4e5f6   nginx   "/docker-entrypoint.…"   Up 2 minutes   0.0.0.0:8080->80/tcp   my-web
\`\`\`

### Stopping and removing

\`\`\`bash
docker stop my-web
docker rm my-web
\`\`\`

\`docker stop\` gracefully shuts down a running container; \`docker rm\` deletes a stopped container entirely. A stopped container still exists on disk (and shows up in \`docker ps -a\`) until it's explicitly removed.

> **Key idea:** \`docker run\` is really "pull if needed, then create and start." The flags you'll type in nearly every real command are \`-d\` (background), \`-p\` (expose a port), and \`--name\` (give it a memorable handle).`,
    },
    {
      name: "Exploring an Image on Docker Hub",
      minutes: 6,
      intro: "Where images come from, and how to read an image's tags before you pull it.",
      content: `### Docker Hub: the default registry

When you run \`docker run nginx\`, Docker looks for that image on [Docker Hub](https://hub.docker.com), the default public **registry** — a hosted collection of images anyone can pull from, and (with an account) push to.

### Official images

Images like \`nginx\`, \`postgres\`, \`node\`, and \`python\` without a username prefix are **official images** — maintained by Docker or the project itself, vetted for security and best practices. Always prefer an official image over a random third-party one when available.

\`\`\`bash
docker pull node        # official Node.js image
docker pull bitnami/node  # community-maintained alternative
\`\`\`

### Tags: picking a specific version

\`\`\`bash
docker pull node:20
docker pull node:20-alpine
docker pull node:latest   # same as just "node" — implicit default
\`\`\`

A **tag** (after the \`:\`) pins a specific version or variant. \`latest\` is just a convention, not a guarantee of the newest version — it's whatever the maintainer chose to tag as \`latest\`, and relying on it in production is a common source of "it worked yesterday" surprises.

### Alpine variants

\`\`\`bash
docker pull node:20          # ~1.1 GB, based on Debian
docker pull node:20-alpine   # ~180 MB, based on Alpine Linux
\`\`\`

Alpine-based images use a minimal Linux distribution built around \`musl\` libc instead of \`glibc\` — dramatically smaller, which speeds up pulls and deployments. The tradeoff: occasional compatibility issues with native dependencies that expect \`glibc\`, and a different (busybox-based) set of shell utilities.

### Pulling without running

\`\`\`bash
docker pull redis:7
docker images
\`\`\`

\`docker pull\` downloads an image without starting a container — useful for pre-fetching images, or just inspecting what's locally cached. \`docker images\` lists everything currently stored on your machine.

> **Key idea:** always pin a specific tag in real projects rather than relying on \`latest\` — it's the difference between a build that's reproducible and one that silently changes underneath you.`,
    },
  ],
}
