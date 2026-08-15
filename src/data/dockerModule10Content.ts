import type { Module } from "../types"

export const dockerModule10: Module = {
  id: 10,
  title: "Capstone: Building & Deploying a Multi-Service App",
  status: "upcoming",
  lessons: [
    {
      name: "Planning the Application",
      minutes: 7,
      intro: "Sketching a real multi-service app before writing a single Dockerfile.",
      content: `### The app: a link-shortener service

To tie every module in this course together, imagine building a small link-shortening service, made of three pieces:

\`\`\`
web   — a frontend that lets users submit a URL and see their shortened links
api   — a backend that creates/resolves short links, talking to the database and cache
db    — Postgres, storing the actual URL mappings
cache — Redis, caching frequently-accessed short links for speed
\`\`\`

### Sketching the architecture first

\`\`\`
[ user's browser ]
        |
     (port 80)
        v
     [ web ] ---> [ api ] ---> [ db ]
                     |
                     v
                  [ cache ]
\`\`\`

Only \`web\` needs a port published to the host — everything else communicates over the internal Docker network, exactly as covered in the networking module. This is worth sketching before writing any YAML: it tells you which services need \`ports\`, and which just need to be reachable by name from another service.

### Deciding what needs to persist

- \`db\` — needs a named volume; losing URL mappings on every restart would break the whole app.
- \`cache\` — deliberately **doesn't** need a volume; it's a cache, meant to be rebuildable from the database at any time. Losing it on restart just means a few slower requests until it warms back up.

Not everything that writes data needs a volume — this distinction (source of truth vs. disposable cache) is worth making explicit before deciding what to persist.

### Deciding what needs to be built vs pulled

- \`web\`, \`api\` — your own code, built from a \`Dockerfile\` (\`build: .\`)
- \`db\`, \`cache\` — third-party, official images (\`image: postgres:16\`, \`image: redis:7\`)

### The plan, before any code

1. Write a Dockerfile for \`api\` (multi-stage if it has a build step, non-root user, dependency-first layer ordering).
2. Write a Dockerfile for \`web\`.
3. Write a \`docker-compose.yml\` wiring all four services together on one custom network.
4. Add a named volume for \`db\` only.
5. Move all credentials into environment variables, sourced from an \`.env\` file excluded from git.

> **Key idea:** sketching which services talk to which, which need persistence, and which are your own code vs third-party images — before writing any Dockerfile or Compose YAML — is what turns "four containers" into a coherent architecture instead of a guess-and-check exercise.`,
    },
    {
      name: "The Full Compose Setup",
      minutes: 12,
      intro: "A complete, realistic docker-compose.yml combining everything from this course.",
      content: `### The Dockerfile for api (multi-stage, non-root, cache-friendly layering)

\`\`\`dockerfile
# backend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

Every technique from modules 3 and 4 in one file: multi-stage build, dependency-first \`COPY\` for cache efficiency, non-root user, exec-form \`CMD\`.

### The full docker-compose.yml

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
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: linkshortener
    volumes:
      - pgdata:/var/lib/postgresql/data
    secrets:
      - db_password
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  pgdata:

secrets:
  db_password:
    file: ./db_password.txt
\`\`\`

### What each piece demonstrates

- **\`web\`/\`api\`**: \`build\` instead of \`image\`, since these are your own application code.
- **\`ports\`**: only \`web\` and \`api\` publish ports to the host — \`db\`/\`cache\` are reachable *only* by other containers on the shared network, never directly from outside.
- **\`env_file\`**: keeps \`api\`'s configuration out of the committed \`docker-compose.yml\`.
- **\`secrets\`**: the database password never appears as a plain environment variable — it's mounted as a file, and \`db_password.txt\` is excluded from git via \`.gitignore\`.
- **\`healthcheck\` + \`condition: service_healthy\`**: \`api\` genuinely waits for Postgres to be ready to accept connections, not just for the container to have started.
- **\`volumes\`**: only \`db\` gets a named volume — \`cache\` deliberately has none, per the planning lesson.

### Bringing it up

\`\`\`bash
docker compose up --build
\`\`\`

One command builds \`web\` and \`api\` from their Dockerfiles, pulls \`postgres\` and \`redis\`, creates the shared network and the \`pgdata\` volume, and starts everything in the correct dependency order.

> **Key idea:** this file is every module in the course applied to one coherent app — multi-stage builds, layer caching, volumes reserved for genuine persistent state, a shared custom network for service discovery, and secrets handled as files rather than plain environment variables.`,
    },
    {
      name: "Debugging the Running Stack",
      minutes: 8,
      intro: "Applying the diagnostic tools from earlier modules to a real multi-container failure.",
      content: `### Scenario: api can't reach the database

\`\`\`bash
docker compose logs api
\`\`\`

\`\`\`
Error: connect ECONNREFUSED db:5432
\`\`\`

Working through this systematically, using tools from earlier modules:

\`\`\`bash
docker compose ps
\`\`\`

First check: is \`db\` even running? If it shows as \`Exit 1\` or similar, the problem is with \`db\` itself, not the network — check its own logs next (\`docker compose logs db\`), most commonly a misconfigured environment variable or a corrupted volume from a previous run.

### Confirming the network

\`\`\`bash
docker network inspect linkshortener_default
\`\`\`

Confirms both \`api\` and \`db\` are actually attached to the same Compose-managed network — a genuine mismatch here (one service pinned to a different, manually specified network) would explain DNS resolution failing entirely.

### Testing DNS resolution directly

\`\`\`bash
docker compose exec api sh
# inside the container:
nslookup db
ping db
\`\`\`

If \`db\` doesn't resolve at all from inside \`api\`'s container, that confirms a networking-layer problem. If it *does* resolve but the connection is still refused, the problem has narrowed to Postgres itself — likely not fully started yet, or not listening on the expected port.

### Checking the healthcheck did its job

\`\`\`bash
docker compose ps
\`\`\`

\`\`\`
NAME                STATUS
linkshortener-db-1   Up 12 seconds (healthy)
\`\`\`

If \`db\` shows \`(unhealthy)\` or no health status at all, \`api\`'s \`condition: service_healthy\` dependency wasn't actually satisfied before \`api\` started — worth double-checking the \`healthcheck\` command actually matches how the service is configured (a wrong \`pg_isready\` username/database name, for instance, silently fails the check forever).

### Checking secrets and environment actually landed correctly

\`\`\`bash
docker compose exec api env | grep DATABASE
docker compose exec db cat /run/secrets/db_password
\`\`\`

A surprisingly common category of bug: the app or database *is* running fine, but with the wrong credentials — an \`.env\` file in the wrong directory, a typo in a variable name, or a secret file that doesn't exist at the expected path. Directly inspecting what actually landed inside the container is far faster than guessing from the Compose file alone.

> **Key idea:** debugging a multi-container failure is the same systematic sequence from the networking module's troubleshooting lesson, just applied through \`docker compose\` commands instead of plain \`docker\` ones — check status, check the network, check DNS resolution, check what actually landed inside the container.`,
    },
    {
      name: "Where to Go Next",
      minutes: 6,
      intro: "You've covered Docker end to end — here's how it connects to what comes after.",
      content: `### What you've covered

This course took you from "what is a container" through the full breadth of everyday Docker: images and the container lifecycle, writing and optimizing Dockerfiles, persisting data with volumes, networking containers together, orchestrating a multi-service app with Compose, handling configuration and secrets properly, and the security/best-practices habits that separate a "works on my machine" Dockerfile from a production-ready one.

### Docker's boundary — and what's next

Everything in this course runs on a **single machine**. Docker Compose is excellent for local development and small deployments, but it doesn't handle:

- Running the same app across **multiple machines**, with traffic automatically balanced between them
- Automatically **replacing** a container that crashes or a machine that fails
- **Rolling updates** — deploying a new version with zero downtime
- **Auto-scaling** — adding more instances of a service under load, automatically

### Orchestration: Kubernetes and Swarm

- **Kubernetes** — the dominant orchestration platform, designed exactly for the multi-machine problems above. Concepts you already know transfer directly: a Kubernetes Pod is close to a running container, a Kubernetes Service does what Docker's internal DNS does (name-based discovery), and a Deployment manages replicas the way \`--scale\` did in Compose — just across an entire cluster instead of one machine.
- **Docker Swarm** — Docker's own, simpler built-in orchestrator. Less commonly used in new projects today than Kubernetes, but a gentler conceptual step if Kubernetes feels like a big jump — the \`docker-compose.yml\` you already know how to write is largely reusable as a Swarm stack file.

### Things worth exploring from here

- **CI/CD pipelines** that automatically build, tag, scan, and push images on every commit — turning the manual \`docker build\`/\`docker push\` workflow from this course into an automated one.
- **Container registries with vulnerability scanning built in**, so the scanning habit from the security module happens automatically on every push.
- **Kubernetes fundamentals** — Pods, Deployments, Services, and \`kubectl\`, the natural next step once you're comfortable orchestrating locally with Compose.

### The real test

Take the link-shortener stack from this capstone (or a project of your own) and actually deploy it somewhere beyond your laptop — a small cloud VM running \`docker compose up -d\` is a completely reasonable first deployment target, and doing it for real surfaces details (firewall rules, DNS, TLS certificates) that no tutorial fully prepares you for.

> **Key idea:** Docker is the foundation — packaging and running a single machine's worth of containers reliably. Orchestration tools like Kubernetes pick up exactly where Docker Compose's single-machine limit ends, and nearly every concept from this course (services, networks, volumes, secrets) has a direct equivalent there.`,
    },
  ],
}
