import type { Module } from "../types"

export const dockerModule9: Module = {
  id: 9,
  title: "Registries, Security & Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Tagging & Pushing to Docker Hub",
      minutes: 8,
      intro: "Sharing an image you've built by publishing it to a registry.",
      content: `### Creating a Docker Hub account and logging in

\`\`\`bash
docker login
\`\`\`

Prompts for your Docker Hub username and password (or an access token, which is the more secure option and what Docker Hub itself recommends over a raw password).

### Tagging an image for your namespace

\`\`\`bash
docker build -t my-app:1.0 .
docker tag my-app:1.0 gokul652003/my-app:1.0
\`\`\`

Docker Hub namespaces images as \`username/repository:tag\`. \`docker tag\` doesn't duplicate the image data — it just adds another name pointing at the same underlying image layers, which is why it's instant regardless of image size.

### Pushing

\`\`\`bash
docker push gokul652003/my-app:1.0
\`\`\`

Uploads the image's layers to Docker Hub — but only the layers Docker Hub doesn't already have (from a public base image, for instance) actually transfer, thanks to the same layer-sharing mechanism covered in the images module.

### Pulling it elsewhere

\`\`\`bash
docker pull gokul652003/my-app:1.0
docker run gokul652003/my-app:1.0
\`\`\`

Anyone (if the repository is public) or anyone you've granted access (if private) can now pull and run the exact same image — this is the entire mechanism behind "it works the same everywhere," extended from your own machine to any machine with Docker installed.

### Versioning tags sensibly

\`\`\`bash
docker tag my-app:1.0 gokul652003/my-app:1.0
docker tag my-app:1.0 gokul652003/my-app:latest
docker push gokul652003/my-app:1.0
docker push gokul652003/my-app:latest
\`\`\`

Push both a specific version tag *and* update \`latest\` to point at it — gives consumers of your image the choice between pinning an exact version (reproducible) or tracking the newest release (convenient, less predictable). Recall from the getting-started module: never let production infrastructure rely on \`latest\` alone.

### Multi-architecture images

\`\`\`bash
docker buildx build --platform linux/amd64,linux/arm64 -t gokul652003/my-app:1.0 --push .
\`\`\`

\`docker buildx\` (Docker's extended build tooling) can build and push a single tag that actually contains images for multiple CPU architectures at once — important if your image needs to run on both typical cloud servers (amd64) and Apple Silicon or ARM-based servers (arm64); Docker automatically pulls the right variant for whichever machine runs it.

> **Key idea:** \`docker tag\` is free (just a pointer, no data copied) and \`docker push\` only transfers layers the registry doesn't already have — publishing an image is cheap precisely because of the same layer-sharing that makes local builds fast.`,
    },
    {
      name: "Private Registries",
      minutes: 7,
      intro: "Hosting your own images outside the public Docker Hub.",
      content: `### Why a private registry

Public Docker Hub repositories are visible to anyone. For proprietary application code, or for organizations with compliance requirements around where artifacts are stored, a **private registry** keeps images accessible only to authorized users/systems.

### Options

- **Docker Hub private repositories** — the simplest path: same Docker Hub account, just mark specific repositories private (free tier includes a limited number).
- **Cloud provider registries** — AWS ECR, Google Artifact Registry, Azure Container Registry — tightly integrated with each cloud's IAM and deployment tooling, the common choice when your app is already deployed on that cloud.
- **Self-hosted registry** — running the open-source \`registry\` image yourself.

### Running your own registry

\`\`\`bash
docker run -d -p 5000:5000 --name registry registry:2
\`\`\`

That single command stands up a fully functional private registry, listening on port 5000.

### Tagging and pushing to a private registry

\`\`\`bash
docker tag my-app:1.0 localhost:5000/my-app:1.0
docker push localhost:5000/my-app:1.0
docker pull localhost:5000/my-app:1.0
\`\`\`

The registry's host and port become part of the image name itself — the exact mechanism that tells Docker where to push/pull from, versus assuming Docker Hub by default.

\`\`\`bash
docker tag my-app:1.0 registry.mycompany.com/team/my-app:1.0
docker push registry.mycompany.com/team/my-app:1.0
\`\`\`

Same pattern for a real, remotely-hosted private registry — just a different host prefix.

### Authenticating against a private registry

\`\`\`bash
docker login registry.mycompany.com
\`\`\`

Same \`docker login\` command as Docker Hub, just pointed at a different registry host — credentials are cached (in \`~/.docker/config.json\`) so you don't need to log in again for every subsequent push/pull.

### CI/CD systems need registry access too

In practice, most image pushes happen automatically from a CI/CD pipeline rather than a developer's laptop — meaning the CI system needs its own registry credentials, typically injected as a secret in the CI configuration rather than a developer's personal login.

> **Key idea:** the registry's hostname becomes a literal prefix on the image name (\`registry.host/repo:tag\`) — that's the entire mechanism Docker uses to route a push or pull to the right place, whether that's Docker Hub, a cloud provider registry, or one you host yourself.`,
    },
    {
      name: "Container Security Fundamentals",
      minutes: 9,
      intro: "The practical security habits that matter most for everyday container use.",
      content: `### Don't run as root

\`\`\`dockerfile
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "server.js"]
\`\`\`

Covered briefly in the Dockerfile module — worth restating as a security default, not just a nicety. If a container running as root is ever compromised (through a vulnerable dependency, for instance), the attacker has root privileges within that container's filesystem and namespace — a meaningfully worse starting position than a compromised process running as an unprivileged user.

### Scan images for known vulnerabilities

\`\`\`bash
docker scout cveS my-app:1.0
\`\`\`

\`docker scout\` (built into recent Docker Desktop/CLI versions) scans an image's layers against known vulnerability databases and reports which installed packages have known CVEs — often surfacing outdated base image versions or transitive dependencies you weren't aware you were shipping. Third-party tools like \`trivy\` and \`grype\` do the same job and are common in CI pipelines.

### Keep base images updated

\`\`\`dockerfile
FROM node:20-alpine   # rebuild periodically to pick up security patches
\`\`\`

An image built six months ago and never rebuilt is running six-month-old versions of every OS package in its base layer, including any security patches released since. Rebuilding periodically (even without any application code changes) pulls in the latest patched base image.

### Never bake secrets into an image

Already covered in the previous module, worth repeating here as a security point specifically: anything \`COPY\`'d or \`ARG\`'d into an image is retrievable from its layer history by anyone with access to the image — even after a later layer deletes the file.

### Limit what a container can do

\`\`\`bash
docker run --read-only --tmpfs /tmp my-app
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE my-app
\`\`\`

- \`--read-only\` makes the container's entire filesystem read-only except explicitly mounted writable paths (like \`--tmpfs\`) — if an app has no legitimate reason to write to its own filesystem, this closes off a whole category of attack (writing a malicious script to disk, for instance).
- \`--cap-drop=ALL\` strips all Linux capabilities (a finer-grained permission system than just root/non-root) and re-adds only the specific ones needed — a strict form of least-privilege.

### Don't trust random third-party images blindly

\`\`\`bash
docker pull someuser/cool-tool
\`\`\`

An image is, among other things, arbitrary code that will run on your machine. Prefer official images or images from a verified, well-known publisher; check a random image's Dockerfile/source (if available) before running it, especially with elevated privileges or sensitive mounted volumes.

> **Key idea:** the highest-leverage security habits are simple and cheap — a non-root \`USER\`, periodic base image updates, vulnerability scanning, and never baking secrets into a layer. None of them require deep security expertise, just consistent habit.`,
    },
    {
      name: "Dockerfile Best Practices Checklist",
      minutes: 7,
      intro: "A practical review pass to run over any Dockerfile before considering it production-ready.",
      content: `### The checklist

**Base image**
- [ ] Pinned to a specific version tag, not \`latest\`
- [ ] Using the smallest base that's actually compatible (\`alpine\`/\`slim\` over the full image, where practical)

**Layer ordering**
- [ ] Dependency manifests (\`package.json\`, \`requirements.txt\`, etc.) copied and installed **before** the rest of the source code
- [ ] Related \`RUN\` commands chained with \`&&\` in a single layer, with cleanup in the *same* layer
- [ ] Multi-stage build used if there's a meaningful build step (compiling, bundling) so build tools don't ship in the final image

**Security**
- [ ] Runs as a non-root \`USER\`, not the default root
- [ ] No secrets baked in via \`COPY\`, \`ARG\`, or hardcoded \`ENV\`
- [ ] \`.dockerignore\` present, excluding \`.git\`, \`node_modules\`/equivalent, \`.env\`, and any local secrets

**Runtime correctness**
- [ ] \`CMD\`/\`ENTRYPOINT\` uses the exec (JSON array) form, not the shell form, for correct signal handling
- [ ] \`EXPOSE\` documents the actual listening port (even though it's informational only)
- [ ] App inside the container binds to \`0.0.0.0\`, not \`127.0.0.1\`, if it needs to be reachable via published ports

**Size**
- [ ] \`docker images\` checked to confirm the final size is reasonable for what the app actually needs
- [ ] No forgotten build tools, package manager caches, or dev dependencies in the final stage

### Running the checklist against the example from module 3

\`\`\`dockerfile
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

This passes nearly every item: pinned Alpine base, dependency-first layer ordering, non-root user, production-only dependencies, exec-form \`CMD\`, documented port. The one thing missing for a compiled/bundled app would be a multi-stage build — appropriate here since Node.js doesn't need a separate compile step for plain JavaScript.

> **Key idea:** this checklist compresses every lesson from this module and the previous two into a single review pass — running it against any Dockerfile before shipping catches the overwhelming majority of common, avoidable mistakes.`,
    },
  ],
}
