import type { Module } from "../types"

export const dockerModule2: Module = {
  id: 2,
  title: "Images & Containers",
  status: "upcoming",
  lessons: [
    {
      name: "Understanding Image Layers",
      minutes: 9,
      intro: "Why Docker images build and pull so fast — the layer cache underneath everything.",
      content: `### Images are stacks of layers

A Docker image isn't one big file — it's a stack of read-only **layers**, each representing one step in how the image was built (installing a package, copying in code, setting an environment variable). Layers stack on top of each other, and the final image is the combined result.

\`\`\`bash
docker history node:20-alpine
\`\`\`

This prints every layer in the image, in order, with the command that created it and how much space it added.

### Layers are shared and cached

If two images both start \`FROM node:20-alpine\`, they share that base layer on disk — it's only stored once. This is why pulling a second image that shares a base with one you already have is often much faster: Docker skips re-downloading layers it already has.

\`\`\`
Layer 4: COPY . .              <- your app code (changes often)
Layer 3: RUN npm install       <- dependencies (changes sometimes)
Layer 2: WORKDIR /app          <- rarely changes
Layer 1: FROM node:20-alpine   <- base image (rarely changes)
\`\`\`

### The container layer: one more on top

When you run a container, Docker adds one more layer on top of the image's layers — a thin, **writable** layer unique to that container. Any file changes made while the container runs happen here, not in the image itself.

\`\`\`
Container layer (writable) <- unique per container, deleted with the container
─────────────────────────
Image layers (read-only)   <- shared across every container from this image
\`\`\`

This is why running the same image twice gives you two fully independent containers — each has its own writable layer, even though they share the same underlying read-only image.

### Why this matters practically

- Deleting a container **discards its writable layer** — any data written inside it (without a volume) is gone.
- Images are naturally efficient to store and transfer, because shared layers between images aren't duplicated.
- Build order matters a lot for speed — you'll see exactly why in the Dockerfile module, where layer caching becomes a hands-on optimization technique.

> **Key idea:** an image is a stack of read-only layers; a container adds one writable layer on top. Understanding that split explains both why containers are cheap to spin up, and why anything written inside one disappears when it's removed.`,
    },
    {
      name: "The Container Lifecycle",
      minutes: 9,
      intro: "Start, stop, pause, and remove — the states a container moves through.",
      content: `### The states

\`\`\`
created -> running -> paused -> running -> stopped -> removed
\`\`\`

\`\`\`bash
docker create --name web nginx   # creates, doesn't start
docker start web                 # created/stopped -> running
docker pause web                 # running -> paused (freezes all processes)
docker unpause web                # paused -> running
docker stop web                  # running -> stopped (graceful shutdown)
docker kill web                  # running -> stopped (immediate, no cleanup)
docker rm web                    # stopped -> removed (gone)
\`\`\`

In practice, \`docker run\` is shorthand for \`docker create\` + \`docker start\` combined — you'll rarely use \`create\`/\`start\` separately, but knowing they're two distinct steps clarifies what \`run\` is actually doing.

### stop vs kill

\`docker stop\` sends \`SIGTERM\` (a polite "please shut down") and waits up to 10 seconds for the process to exit cleanly, then sends \`SIGKILL\` if it hasn't. \`docker kill\` sends \`SIGKILL\` immediately — no grace period. Use \`stop\` in normal operation; reach for \`kill\` only when a container is hung and unresponsive.

### Restarting and removing

\`\`\`bash
docker restart web           # stop, then start again
docker rm web                # remove a stopped container
docker rm -f web              # force: stop (if running) and remove in one step
docker container prune       # remove ALL stopped containers at once
\`\`\`

### Restart policies

\`\`\`bash
docker run -d --restart unless-stopped nginx
\`\`\`

- \`no\` (default) — never restart automatically.
- \`on-failure\` — restart only if it exits with a non-zero (error) status.
- \`always\` — always restart, even after a Docker daemon restart.
- \`unless-stopped\` — same as \`always\`, but respects a manual \`docker stop\` (won't restart until you explicitly start it again).

For anything meant to run long-term (a web server, a database), \`unless-stopped\` is usually the right default.

### Auto-removing on exit

\`\`\`bash
docker run --rm alpine echo "hello"
\`\`\`

\`--rm\` automatically deletes the container the moment it exits — handy for short-lived, one-off commands where you don't want stopped containers piling up in \`docker ps -a\`.

> **Key idea:** \`stop\` is graceful, \`kill\` is immediate. A stopped container isn't gone — it still occupies disk until \`rm\`. \`--rm\` and sensible \`--restart\` policies are two flags worth using by default.`,
    },
    {
      name: "Inspecting, Logs & Exec",
      minutes: 9,
      intro: "The three commands you'll reach for constantly when debugging a running container.",
      content: `### docker logs: what did it print?

\`\`\`bash
docker logs my-web
docker logs -f my-web       # follow, like tail -f
docker logs --tail 50 my-web  # last 50 lines only
\`\`\`

Shows everything the container's main process has written to stdout/stderr since it started — the first place to look when a container is misbehaving.

### docker exec: run a command inside a running container

\`\`\`bash
docker exec my-web ls /usr/share/nginx/html
docker exec -it my-web sh     # open an interactive shell inside the container
\`\`\`

\`-it\` combines two flags: \`-i\` (interactive, keep stdin open) and \`-t\` (allocate a pseudo-terminal) — together they give you a usable interactive shell, exactly as if you'd SSH'd into the container. Use \`sh\` for Alpine-based images (no \`bash\` by default) or \`bash\` for Debian/Ubuntu-based ones.

This is the single most useful debugging technique for a container that's running but behaving unexpectedly — you can look around the filesystem, check environment variables, and run diagnostic commands directly inside its isolated environment.

### docker inspect: the full JSON detail

\`\`\`bash
docker inspect my-web
\`\`\`

Dumps a large JSON blob with everything Docker knows about the container — its IP address, mounted volumes, environment variables, restart policy, and more. Usually you filter it down to what you need:

\`\`\`bash
docker inspect -f '{{.NetworkSettings.IPAddress}}' my-web
docker inspect -f '{{.State.Status}}' my-web
\`\`\`

\`-f\` (\`--format\`) takes a Go template expression to extract just one field — much more useful in scripts than parsing the full JSON dump by hand.

### docker stats: live resource usage

\`\`\`bash
docker stats
\`\`\`

A live-updating table of CPU, memory, network, and disk I/O for every running container — the container equivalent of \`top\`. Essential for spotting a container that's silently eating all your CPU or leaking memory.

> **Key idea:** \`logs\` for what it printed, \`exec\` for poking around live, \`inspect\` for structured metadata, \`stats\` for resource usage. Together they cover the vast majority of "why is this container not working" investigations.`,
    },
    {
      name: "Copying Files & Cleaning Up",
      minutes: 7,
      intro: "Moving files between host and container, and keeping disk usage under control.",
      content: `### docker cp: host <-> container

\`\`\`bash
docker cp my-web:/etc/nginx/nginx.conf ./nginx.conf   # container -> host
docker cp ./index.html my-web:/usr/share/nginx/html/   # host -> container
\`\`\`

Works in both directions, and doesn't require the container to be running for the container-to-host direction. Useful for quickly grabbing a log file or config to inspect, without needing a volume set up.

### Disk usage adds up fast

Images, stopped containers, unused volumes, and build cache all accumulate over time — it's common for a development machine to quietly fill up with gigabytes of Docker leftovers.

\`\`\`bash
docker system df
\`\`\`

Shows a summary of exactly how much space images, containers, volumes, and build cache are each using.

### Cleaning up individually

\`\`\`bash
docker container prune   # remove all stopped containers
docker image prune       # remove dangling (untagged) images
docker image prune -a    # remove ALL images not used by a running container
docker volume prune      # remove unused volumes
docker network prune     # remove unused networks
\`\`\`

### The nuclear option

\`\`\`bash
docker system prune -a --volumes
\`\`\`

Removes every stopped container, every unused image, every unused network, and every unused volume in one command. Extremely effective for reclaiming disk space — and also extremely destructive if you had something you meant to keep. Always double-check \`docker system df\` first, and never run this against a machine hosting containers you don't fully understand.

> **Key idea:** \`docker system df\` tells you where space is going; the \`prune\` family reclaims it. \`system prune -a --volumes\` is powerful but irreversible — treat it with the same caution as \`rm -rf\`.`,
    },
  ],
}
