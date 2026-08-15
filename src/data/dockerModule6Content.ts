import type { Module } from "../types"

export const dockerModule6: Module = {
  id: 6,
  title: "Networking",
  status: "upcoming",
  lessons: [
    {
      name: "Docker's Network Drivers",
      minutes: 8,
      intro: "How containers talk to the outside world, and to each other — the three drivers you'll actually use.",
      content: `### The default: bridge

\`\`\`bash
docker network ls
\`\`\`

\`\`\`
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5f6   bridge    bridge    local
b2c3d4e5f6a1   host      host      local
c3d4e5f6a1b2   none      null      local
\`\`\`

Every Docker install starts with three built-in networks. Unless you specify otherwise, every container connects to the default **bridge** network — a private, isolated virtual network on the host. Containers on the same bridge network can reach each other by IP address; the outside world can only reach them through explicitly published ports (\`-p\`).

### host: no isolation at all

\`\`\`bash
docker run -d --network host nginx
\`\`\`

The container shares the host's network stack directly — no isolation, no port mapping needed (a service listening on port 80 inside the container is immediately reachable on port 80 of the host itself). Faster (no network translation overhead) but sacrifices the isolation that's usually one of the main reasons to containerize in the first place. Used sparingly, mostly for network-performance-sensitive tools.

### none: fully isolated

\`\`\`bash
docker run -d --network none my-batch-job
\`\`\`

No networking at all — not even the default bridge. Useful for a container that should have zero network access as a security measure (a sandboxed batch job processing local files, for instance).

### Custom bridge networks: the practical default

\`\`\`bash
docker network create my-app-network
docker run -d --network my-app-network --name api my-api
docker run -d --network my-app-network --name db postgres:16
\`\`\`

Creating your own named bridge network (instead of using the default one) is standard practice for any real multi-container app — covered in depth in the next lesson, because it unlocks something the default bridge network doesn't give you: **automatic DNS resolution by container name**.

### Inspecting a network

\`\`\`bash
docker network inspect my-app-network
\`\`\`

Shows every container currently attached, their IP addresses on that network, and the network's configuration (subnet, gateway).

> **Key idea:** the default bridge network is isolated but has no built-in service discovery. A custom bridge network is almost always the right choice for multi-container apps — it's what makes containers findable by name instead of by IP.`,
    },
    {
      name: "Publishing Ports",
      minutes: 8,
      intro: "Controlling exactly how a container's ports become reachable from outside.",
      content: `### The -p flag in detail

\`\`\`bash
docker run -d -p 8080:80 nginx
\`\`\`

Format is always \`host_port:container_port\`. Here, anything hitting port 8080 on the host machine gets forwarded to port 80 inside the container.

### Binding to a specific host interface

\`\`\`bash
docker run -d -p 127.0.0.1:8080:80 nginx
\`\`\`

By default, \`-p\` binds to all network interfaces (\`0.0.0.0\`) — meaning the container's port is reachable from *any* machine that can reach your host, not just \`localhost\`. Prefixing with \`127.0.0.1:\` restricts it to local connections only — an easy-to-miss detail that matters a lot if you're running Docker on a machine with a public IP; without this, a "local dev" container can be unintentionally reachable from the internet.

### Publishing multiple ports

\`\`\`bash
docker run -d -p 8080:80 -p 8443:443 nginx
\`\`\`

Repeat \`-p\` for each port you need mapped.

### Publish all EXPOSEd ports to random host ports

\`\`\`bash
docker run -d -P nginx
docker port <container>
\`\`\`

Capital \`-P\` publishes every port the image's Dockerfile declared with \`EXPOSE\`, each to a randomly chosen free host port — useful for quick testing when you don't care which exact host port gets used, though you'll need \`docker port\` afterward to find out what Docker actually picked.

### UDP instead of TCP

\`\`\`bash
docker run -d -p 53:53/udp my-dns-server
\`\`\`

\`-p\` defaults to TCP; append \`/udp\` for protocols that need it (DNS, some game servers, streaming protocols).

### Why containers on the same bridge don't need -p between themselves

\`\`\`bash
docker network create my-net
docker run -d --network my-net --name api my-api        # no -p needed
docker run -d --network my-net --name db postgres:16    # no -p needed
docker run -d --network my-net -p 3000:3000 --name web my-web
\`\`\`

\`-p\` is only for exposing a port to the **host** (and, through it, the outside world). Containers on the *same* Docker network can already reach each other's ports directly over the internal network, with no publishing required — \`api\` can reach \`db\` on Postgres's port 5432 without either container declaring \`-p\` at all. Only \`web\`, the one users need to reach from outside Docker entirely, needs a published port.

> **Key idea:** \`-p\` bridges a container's port to the host (and the outside world) — it's not needed for container-to-container communication on a shared network, and by default it binds to every network interface, not just localhost.`,
    },
    {
      name: "Container-to-Container Communication & DNS",
      minutes: 9,
      intro: "How containers find each other by name — the feature that makes multi-container apps practical.",
      content: `### The problem with IP addresses

\`\`\`bash
docker network create my-net
docker run -d --network my-net --name db postgres:16
docker inspect -f '{{.NetworkSettings.Networks.my-net.IPAddress}}' db
# 172.18.0.2
\`\`\`

You *could* hardcode \`172.18.0.2\` into your app's database connection string — but container IPs are assigned dynamically and change whenever a container restarts. Hardcoding them is fragile and breaks the moment anything gets recreated.

### The fix: Docker's built-in DNS

\`\`\`bash
docker network create my-net
docker run -d --network my-net --name db postgres:16
docker run -d --network my-net --name api my-api
\`\`\`

Any **custom** (non-default) bridge network comes with automatic DNS resolution: from inside the \`api\` container, the hostname \`db\` resolves to whatever IP the \`db\` container currently has — even after \`db\` gets recreated with a new IP. Your application code just connects to \`db\` (or \`db:5432\`) as if it were a normal hostname, and Docker handles the resolution transparently.

\`\`\`
# inside the api container's environment/code
DATABASE_URL=postgresql://user:pass@db:5432/mydb
\`\`\`

### This is why the default bridge network is different

The **default** bridge network (the one containers join automatically if you don't specify \`--network\`) does *not* provide this DNS resolution — only user-created networks do. This is one of the concrete, practical reasons "always create a custom network for multi-container apps" is standard advice, not just tidiness.

### Verifying it works

\`\`\`bash
docker exec api ping db
docker exec api nslookup db
\`\`\`

From inside any container on the shared network, you can ping or resolve any other container on that same network purely by its \`--name\`.

### Connecting a running container to another network

\`\`\`bash
docker network connect my-net some-other-container
docker network disconnect my-net some-other-container
\`\`\`

A container isn't locked to a single network for its whole lifetime — it can be attached to (or detached from) additional networks after it's already running, useful when wiring together services that weren't originally started with the same \`--network\` flag.

> **Key idea:** create a custom bridge network for any multi-container setup, and reference other containers by their \`--name\` — Docker's embedded DNS resolves it to the correct (and current) IP automatically, which the default bridge network doesn't provide.`,
    },
    {
      name: "Troubleshooting Network Issues",
      minutes: 7,
      intro: "A practical playbook for \"the containers can't reach each other\" and \"I can't reach the container\" bugs.",
      content: `### Symptom: "connection refused" from outside

\`\`\`bash
docker ps  # confirm the port mapping actually exists
\`\`\`

Check the \`PORTS\` column — if it shows nothing (or doesn't match what you expected), the container likely wasn't started with \`-p\`, or was started with the wrong host/container port order. This is the single most common networking mistake — remember the format is always \`host:container\`, easy to accidentally reverse.

### Symptom: app inside the container works, but isn't reachable

\`\`\`bash
docker exec my-app curl localhost:3000
\`\`\`

If this succeeds *inside* the container but the app still isn't reachable from outside, the likely cause is the app binding to \`127.0.0.1\` internally instead of \`0.0.0.0\`. A server bound only to \`127.0.0.1\` inside a container only accepts connections from *within that same container* — Docker's port forwarding can't reach it, because from the container's own perspective, the forwarded traffic isn't "localhost." Fix: bind your app to \`0.0.0.0\` (all interfaces) inside the container.

### Symptom: containers can't reach each other by name

\`\`\`bash
docker network inspect my-net
\`\`\`

Confirm both containers actually show up as connected to the *same* network in this output. A very common mistake: starting one container with \`--network my-net\` and forgetting the flag on the other, leaving it on the default bridge network instead — where the custom network's DNS resolution doesn't apply.

### Symptom: "port is already allocated"

\`\`\`
Error: listen tcp 0.0.0.0:8080: bind: address already in use
\`\`\`

Something on the host (another container, or a non-Docker process) already has that host port bound. Find and stop it, or just pick a different host port:

\`\`\`bash
docker ps --filter "publish=8080"    # find a container using that host port
lsof -i :8080                         # find ANY process (Docker or not) using it
\`\`\`

### A general diagnostic sequence

1. Is the container actually running? (\`docker ps\`)
2. Is the port actually published, and to the port you expect? (\`docker ps\`, check the \`PORTS\` column)
3. Does the app work when tested *from inside* the container? (\`docker exec ... curl localhost:PORT\`)
4. Is the app bound to \`0.0.0.0\`, not \`127.0.0.1\`, inside the container?
5. For container-to-container: are both containers on the *same* custom network? (\`docker network inspect\`)

> **Key idea:** most Docker networking bugs fall into one of two buckets — a port that isn't actually published the way you think it is, or an app bound to \`127.0.0.1\` instead of \`0.0.0.0\` inside the container. Check both first before assuming something more exotic is wrong.`,
    },
  ],
}
