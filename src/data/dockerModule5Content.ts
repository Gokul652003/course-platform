import type { Module } from "../types"

export const dockerModule5: Module = {
  id: 5,
  title: "Volumes & Data Persistence",
  status: "upcoming",
  lessons: [
    {
      name: "Why Container Data Disappears",
      minutes: 7,
      intro: "The writable layer is temporary — and why that's a problem for real applications.",
      content: `### The default: ephemeral by design

\`\`\`bash
docker run -d --name db postgres:16
# ... database runs, data gets written ...
docker rm -f db
# all that data is now gone, permanently
\`\`\`

Recall from the layers lesson: a container's writable layer exists only as long as the container does. Remove the container, and anything written inside it — a database's data files, uploaded user files, generated logs — is deleted along with it. This is *intentional* — containers are meant to be disposable, replaceable at any moment without ceremony.

### The problem for stateful apps

A database, a file upload directory, or any data that needs to outlive a container restart can't live only in the writable layer. If you're constantly rebuilding and replacing containers (which you should be — that's the whole point of containers being disposable), any data stored only inside one is at permanent risk of being wiped on the next deploy.

### The solution: separate storage from compute

Docker's answer is to store persistent data **outside** the container's writable layer, in storage that exists independently and can be reattached to a new container:

\`\`\`bash
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
\`\`\`

The \`-v pgdata:/var/lib/postgresql/data\` flag mounts a **named volume** at that path inside the container. Even if this specific container is destroyed and replaced, the \`pgdata\` volume — and everything Postgres wrote to it — survives, and a new container can mount the exact same volume and pick up right where the old one left off.

### Two mechanisms, one goal

Docker gives you two ways to persist data outside the container: **volumes** (Docker-managed) and **bind mounts** (a path from your host filesystem). Both are covered in the next lesson — the short version is: volumes for anything Docker should manage (databases, app state), bind mounts for syncing your own source code or config into a container during development.

> **Key idea:** a container's own filesystem is temporary by design — treat every container as disposable. Anything that needs to survive a container being replaced belongs in a volume or bind mount, not in the container's writable layer.`,
    },
    {
      name: "Volumes vs Bind Mounts",
      minutes: 10,
      intro: "The two ways to attach outside storage to a container, and when to use each.",
      content: `### Named volumes: Docker-managed storage

\`\`\`bash
docker volume create pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
\`\`\`

Docker creates and manages the storage location on disk (typically somewhere under \`/var/lib/docker/volumes/\` on Linux) — you never need to know or care about the exact path. Volumes are the recommended mechanism for any data a container itself generates and needs to persist: database files, message queue state, cache data.

\`\`\`bash
docker volume ls              # list all volumes
docker volume inspect pgdata  # see where it actually lives, and what's using it
docker volume rm pgdata       # delete it (only if unused)
\`\`\`

### Bind mounts: a specific host path

\`\`\`bash
docker run -d -v /home/user/myapp/src:/app/src my-app
# or the more explicit --mount syntax
docker run -d --mount type=bind,source=/home/user/myapp/src,target=/app/src my-app
\`\`\`

A bind mount maps an **exact path you choose on your host machine** into the container. Unlike a volume, you control exactly where the data lives and can access/edit it directly with your normal tools, outside of Docker entirely.

### The classic bind mount use case: live development

\`\`\`bash
docker run -d -v $(pwd):/app -p 3000:3000 my-app
\`\`\`

Bind-mounting your project directory into a container means edits made on your host (in your editor) are instantly reflected inside the running container — combined with a file-watching dev server, this gives you live-reload development *inside* a container, without rebuilding the image on every change.

### Comparing the two

| | Named Volume | Bind Mount |
|---|---|---|
| Managed by | Docker | You (exact host path) |
| Best for | App/database data | Syncing source code in dev |
| Portable across hosts | Yes | No — tied to a specific host path |
| Visible/editable from host directly | Only via Docker commands | Yes, normal filesystem tools |

### Anonymous volumes: usually accidental

\`\`\`bash
docker run -d -v /var/lib/postgresql/data postgres:16
\`\`\`

Providing a container path with **no** source before the colon creates an anonymous volume — it persists data, but with an auto-generated name you'll never remember, making it easy to lose track of and accumulate orphaned volumes over time. Almost always, you want a named volume (or a bind mount) instead, so you can find and manage it later.

> **Key idea:** named volumes for data your app/database owns and manages; bind mounts for syncing your own host files (usually source code during development) into a container. Avoid anonymous volumes — they're easy to lose track of.`,
    },
    {
      name: "Managing Volumes in Practice",
      minutes: 8,
      intro: "Backing up, inspecting, and safely working with volume data.",
      content: `### Backing up a volume

Volumes aren't directly accessible as a normal folder on Mac/Windows (they live inside the Docker Desktop VM), so backups go through a temporary container:

\`\`\`bash
docker run --rm \\
  -v pgdata:/data \\
  -v $(pwd):/backup \\
  alpine tar czf /backup/pgdata-backup.tar.gz -C /data .
\`\`\`

This spins up a throwaway Alpine container with the volume mounted at \`/data\` and your current host directory mounted at \`/backup\`, runs \`tar\` to compress the volume's contents, and — thanks to \`--rm\` — cleans itself up immediately after.

### Restoring a volume from a backup

\`\`\`bash
docker run --rm \\
  -v pgdata:/data \\
  -v $(pwd):/backup \\
  alpine sh -c "cd /data && tar xzf /backup/pgdata-backup.tar.gz"
\`\`\`

The same pattern in reverse — a disposable container as the bridge between the archive on your host and the volume's contents.

### Sharing a volume across containers

\`\`\`bash
docker run -d -v shared-data:/data --name writer my-writer-app
docker run -d -v shared-data:/data --name reader my-reader-app
\`\`\`

Multiple containers can mount the same named volume simultaneously — a common pattern for a producer/consumer pair, or a shared cache between a web server and a background worker. Docker doesn't add any file-locking on top, though — your application is responsible for handling concurrent access safely if that matters for your use case.

### Read-only mounts

\`\`\`bash
docker run -v config-data:/etc/app/config:ro my-app
\`\`\`

Appending \`:ro\` mounts the volume (or bind mount) read-only inside the container — the process can read from it but can't modify it. Useful for configuration data or reference files that a container should never accidentally overwrite.

### Cleaning up unused volumes

\`\`\`bash
docker volume ls -f dangling=true   # volumes not attached to any container
docker volume prune                  # remove them
\`\`\`

Volumes are **not** automatically deleted when a container that used them is removed (this is intentional — it's what makes them safe for persistence). Over time, unused volumes from old, deleted containers can accumulate and quietly consume disk space.

> **Key idea:** volumes outlive their containers by design, which means backup/restore always goes through a temporary bridge container, and cleanup is a separate, deliberate step — \`docker rm\` on a container never touches its volumes.`,
    },
  ],
}
