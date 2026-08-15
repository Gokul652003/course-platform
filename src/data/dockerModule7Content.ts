import type { Module } from "../types"

export const dockerModule7: Module = {
  id: 7,
  title: "Docker Compose",
  status: "upcoming",
  lessons: [
    {
      name: "Why Compose Exists",
      minutes: 7,
      intro: "Replacing a page of docker run commands with one declarative file.",
      content: `### The problem: real apps are multiple containers

A typical app isn't one container — it's a web server, a database, maybe a cache, maybe a background worker, all needing their own network and volumes, wired together correctly:

\`\`\`bash
docker network create my-app-net
docker volume create pgdata
docker run -d --network my-app-net --name db -v pgdata:/var/lib/postgresql/data \\
  -e POSTGRES_PASSWORD=secret postgres:16
docker run -d --network my-app-net --name redis redis:7
docker run -d --network my-app-net --name api -p 3000:3000 \\
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/postgres my-api
\`\`\`

Typing (and remembering, and keeping in sync as requirements change) this every time is error-prone and doesn't version well — there's no single file to check into git describing "this is the whole app."

### The fix: one YAML file

\`\`\`yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/postgres
    depends_on:
      - db
      - redis

volumes:
  pgdata:
\`\`\`

\`\`\`bash
docker compose up
\`\`\`

One command, and Compose creates a network, creates the volume, starts all three services with their configuration, and wires them together with DNS resolution by service name — everything the manual \`docker run\` commands did, described declaratively and checked into version control.

### What Compose actually is

Docker Compose is not a different tool from what you already know — it's a layer on top of the same \`docker\` primitives (networks, volumes, containers), reading a YAML file and translating it into the equivalent \`docker\` commands under the hood. Everything from previous modules — images, volumes, networks, environment variables — still applies; Compose just gives you one declarative file instead of a growing shell script.

> **Key idea:** Compose trades a fragile sequence of \`docker run\` commands for one version-controlled YAML file describing the whole application — same underlying concepts, far more maintainable in practice.`,
    },
    {
      name: "Writing a Compose File",
      minutes: 10,
      intro: "The core structure — services, build vs image, ports, environment, and depends_on.",
      content: `### Top-level structure

\`\`\`yaml
services:
  service-name-1:
    # config for this service
  service-name-2:
    # config for this service

volumes:
  volume-name:

networks:
  network-name:
\`\`\`

Every container-to-be-run is a **service** under \`services:\`. \`volumes:\` and \`networks:\` at the top level declare named resources those services can reference — Compose creates a default network for the whole file automatically, so you often don't need to declare one explicitly at all.

### image vs build

\`\`\`yaml
services:
  db:
    image: postgres:16       # pull a pre-built image

  api:
    build: .                  # build from a Dockerfile in this directory
    # or, more explicitly:
    build:
      context: .
      dockerfile: Dockerfile.prod
\`\`\`

Use \`image\` for third-party services you're just running (databases, caches). Use \`build\` for your own application — Compose builds the image from your Dockerfile the first time, and rebuilds automatically when you run \`docker compose up --build\`.

### Ports, environment, and volumes — same concepts, YAML syntax

\`\`\`yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:secret@db:5432/postgres
    volumes:
      - ./src:/app/src
    depends_on:
      - db
\`\`\`

Every one of these maps directly to a \`docker run\` flag you already know: \`ports\` is \`-p\`, \`environment\` is \`-e\`, \`volumes\` is \`-v\`. Nothing new conceptually — just YAML instead of flags.

### depends_on: start order, not readiness

\`\`\`yaml
services:
  api:
    depends_on:
      - db
\`\`\`

\`depends_on\` guarantees \`db\`'s container **starts** before \`api\`'s — but it does *not* wait for Postgres to actually be ready to accept connections, which can take a few seconds after the container starts. Apps that connect to a database on startup often need their own retry logic to handle this gap; \`depends_on\` alone isn't a readiness check.

### env_file: loading variables from a file

\`\`\`yaml
services:
  api:
    env_file:
      - .env
\`\`\`

Instead of listing every variable inline under \`environment\`, \`env_file\` loads them from a separate file — handy for keeping secrets and per-environment config out of the committed \`docker-compose.yml\` itself (more in the next module).

> **Key idea:** a Compose file is just YAML syntax for the same \`docker run\` flags you already know — the real value is having the whole multi-service setup in one reviewable, version-controlled file.`,
    },
    {
      name: "The Compose CLI",
      minutes: 8,
      intro: "The day-to-day commands for running, rebuilding, and inspecting a Compose app.",
      content: `### Starting and stopping everything

\`\`\`bash
docker compose up          # start all services, attached (see logs live)
docker compose up -d       # start all services, detached (background)
docker compose down        # stop and remove all containers + the default network
\`\`\`

\`docker compose down\` removes containers and networks Compose created, but **not** volumes by default — your database data survives a \`down\`/\`up\` cycle unless you explicitly ask for volumes to go too:

\`\`\`bash
docker compose down -v     # also remove volumes — data is gone
\`\`\`

### Rebuilding after a Dockerfile change

\`\`\`bash
docker compose up --build
\`\`\`

Compose caches the built image and won't rebuild it automatically just because \`docker-compose.yml\` changed unrelated fields — \`--build\` forces a rebuild, which you'll want any time you change a Dockerfile or the files it copies in.

### Logs across every service

\`\`\`bash
docker compose logs
docker compose logs -f          # follow, all services interleaved
docker compose logs -f api      # follow just one service
\`\`\`

One command tails logs from every service at once, each line prefixed with which service it came from — far more convenient than running \`docker logs\` separately per container.

### Running a one-off command in a service

\`\`\`bash
docker compose exec api sh
docker compose run api npm test
\`\`\`

\`exec\` runs a command in an **already-running** service container (same idea as \`docker exec\`). \`run\` starts a brand-new, one-off container from that service's image/config — useful for tasks like database migrations or test suites that shouldn't run as part of the normal \`up\`.

### Checking status

\`\`\`bash
docker compose ps
\`\`\`

Like \`docker ps\`, but scoped to just the containers belonging to this Compose project — quick way to see which services are up, and their port mappings.

### Scaling a service

\`\`\`bash
docker compose up -d --scale api=3
\`\`\`

Runs multiple instances of the same service — useful for testing how an app behaves under simple horizontal scaling, though a published host port (\`3000:3000\`) can't be shared by three containers at once, so this typically pairs with a load balancer in front, or omitting a fixed host port and letting Docker assign random ones.

> **Key idea:** \`docker compose\` commands mostly mirror the plain \`docker\` commands you already know (\`ps\`, \`logs\`, \`exec\`) — scoped automatically to the services defined in your Compose file, so you don't need to track container names or IDs by hand.`,
    },
    {
      name: "Multi-Service App Patterns",
      minutes: 9,
      intro: "Wiring together a realistic web + API + database + cache stack.",
      content: `### A realistic full-stack example

\`\`\`yaml
services:
  web:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/appdb
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7

volumes:
  pgdata:
\`\`\`

Four services, each with a distinct role — a frontend, an API, a database, a cache — all wired together purely by service name (\`db\`, \`cache\`) thanks to Compose's automatic DNS, exactly as discussed in the networking module.

### Different Compose files for different environments

\`\`\`yaml
# docker-compose.override.yml (merged automatically with docker-compose.yml)
services:
  api:
    volumes:
      - ./backend/src:/app/src   # live-reload source code in dev
    environment:
      NODE_ENV: development
\`\`\`

Compose automatically merges \`docker-compose.yml\` with a \`docker-compose.override.yml\` in the same directory — a common pattern for keeping the base file environment-agnostic, with dev-only overrides (bind mounts for live reload, debug ports) layered on top locally.

\`\`\`bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
\`\`\`

For a *production* variant, you instead explicitly specify multiple files with \`-f\`, layering a \`docker-compose.prod.yml\` (removing dev bind mounts, adding restart policies) on top of the base file.

### Healthchecks: a better signal than depends_on alone

\`\`\`yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
\`\`\`

This closes the gap noted in the previous lesson: \`condition: service_healthy\` makes \`api\` wait until \`db\`'s healthcheck actually passes (not just until the container starts), giving you a real readiness guarantee instead of just a start-order guarantee.

> **Key idea:** real Compose setups typically split configuration across a base file plus environment-specific overrides, and use \`healthcheck\` + \`condition: service_healthy\` to get genuine "is it actually ready" dependency ordering, not just "has it started."`,
    },
  ],
}
