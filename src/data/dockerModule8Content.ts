import type { Module } from "../types"

export const dockerModule8: Module = {
  id: 8,
  title: "Configuration: Environment & Secrets",
  status: "upcoming",
  lessons: [
    {
      name: "Environment Variables in Practice",
      minutes: 8,
      intro: "Passing configuration into a container without baking it into the image.",
      content: `### Why environment variables, not hardcoded config

\`\`\`dockerfile
# BAD: bakes a specific database host into the image itself
ENV DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/app
\`\`\`

An image should be a generic, reusable artifact — the *same* image ought to run in development, staging, and production, with only its configuration changing between them. Baking environment-specific values into the Dockerfile defeats that entirely; you'd need a separate image per environment.

### Passing variables at run time instead

\`\`\`bash
docker run -e DATABASE_URL=postgresql://user:pass@db:5432/app my-api
docker run -e NODE_ENV=production -e PORT=3000 my-api
\`\`\`

\`-e\` injects a variable into the container's environment at **run** time — the same image, run with different \`-e\` values, behaves correctly in each environment without ever being rebuilt.

### Loading many variables from a file

\`\`\`bash
# .env
DATABASE_URL=postgresql://user:pass@db:5432/app
REDIS_URL=redis://cache:6379
LOG_LEVEL=debug
\`\`\`

\`\`\`bash
docker run --env-file .env my-api
\`\`\`

\`--env-file\` reads an entire file of \`KEY=VALUE\` lines at once — much more manageable than a long list of individual \`-e\` flags once you have more than a handful of variables.

### Reading variables inside the app

Nothing Docker-specific here — your application reads environment variables exactly like it would outside a container:

\`\`\`js
// Node.js
const port = process.env.PORT || 3000;
\`\`\`

\`\`\`python
# Python
import os
port = os.environ.get("PORT", 3000)
\`\`\`

Docker's job is only to make the variable *available* inside the container's environment — how your application code reads it is entirely ordinary, language-specific environment variable handling.

### Compose: the same idea, YAML syntax

\`\`\`yaml
services:
  api:
    build: .
    environment:
      NODE_ENV: production
    env_file:
      - .env
\`\`\`

Covered in the Compose module — \`environment\` and \`env_file\` in a Compose file map directly onto \`-e\` and \`--env-file\` on the CLI.

> **Key idea:** configuration belongs at run time (\`-e\`, \`--env-file\`), not baked into the image with \`ENV\`. The goal is one image that behaves correctly across every environment, purely by varying what's passed in when it starts.`,
    },
    {
      name: "ARG vs ENV, Revisited",
      minutes: 6,
      intro: "A closer look at the build-time/run-time boundary, and where each variable type actually belongs.",
      content: `### The core distinction, restated

- **\`ARG\`** — exists only during \`docker build\`. Not present in the running container. Not baked into the final image at all (unless you explicitly copy its value into an \`ENV\`).
- **\`ENV\`** — baked into the image, present in every container run from it, and overridable at \`docker run\` time with \`-e\`.

### A concrete example showing the difference

\`\`\`dockerfile
ARG APP_VERSION=1.0.0
ENV APP_VERSION=\${APP_VERSION}

RUN echo "Building version \${APP_VERSION}"
\`\`\`

\`\`\`bash
docker build --build-arg APP_VERSION=2.1.0 -t my-app .
docker run my-app env | grep APP_VERSION
# APP_VERSION=2.1.0
\`\`\`

Here, \`ARG\` captures the value at build time, and explicitly promoting it into \`ENV\` is what makes it visible inside the running container afterward. Without that \`ENV\` line, \`APP_VERSION\` would be usable during the build (in \`RUN\` commands) but invisible to the app at runtime.

### Never put secrets in ARG

\`\`\`dockerfile
# NEVER do this
ARG API_KEY
RUN curl -H "Authorization: Bearer \${API_KEY}" https://api.example.com/setup
\`\`\`

Even though \`ARG\` values aren't automatically baked into the final image's environment, they **are** visible in the image's build history:

\`\`\`bash
docker history --no-trunc my-app
\`\`\`

Anyone with access to the built image can extract build-time \`ARG\` values from its layer history — meaning secrets passed via \`--build-arg\` are effectively not secret at all. The correct way to handle build-time secrets is Docker's dedicated \`--secret\` mechanism, covered in the next lesson.

### When to use which

| Use case | Reach for |
|---|---|
| Which base image version to build from | \`ARG\` |
| A value the running app needs to read | \`ENV\` |
| Environment-specific config (dev/staging/prod) | \`ENV\`, set via \`-e\` at run time, never hardcoded |
| Any password, API key, or token | Neither — use \`--secret\` (next lesson) |

> **Key idea:** \`ARG\` is a build-time input, invisible at runtime unless explicitly promoted to \`ENV\`. Neither is safe for secrets — \`ARG\` values leak through \`docker history\`, and \`ENV\` values leak through \`docker inspect\` and any process able to read the container's environment.`,
    },
    {
      name: "Handling Secrets Properly",
      minutes: 8,
      intro: "Why -e and ENV aren't safe for passwords and API keys, and what to use instead.",
      content: `### Why -e/ENV are the wrong tool for secrets

\`\`\`bash
docker run -e DB_PASSWORD=supersecret my-api
docker inspect my-api | grep DB_PASSWORD
\`\`\`

Any environment variable set on a container is fully visible via \`docker inspect\`, and readable by anyone with \`exec\` access to the container (\`docker exec my-api env\`) — plus, environment variables are often accidentally leaked into error logs, monitoring tools, or crash reports that dump the process environment for debugging. None of this is a safe home for a database password or API key.

### Docker secrets (Swarm) and Compose secrets

\`\`\`yaml
# docker-compose.yml
services:
  api:
    image: my-api
    secrets:
      - db_password

secrets:
  db_password:
    file: ./db_password.txt
\`\`\`

Instead of an environment variable, the secret is mounted as a **file** inside the container, at \`/run/secrets/db_password\` by default. Your app reads the file's contents directly, rather than an environment variable:

\`\`\`js
const fs = require("fs");
const dbPassword = fs.readFileSync("/run/secrets/db_password", "utf8").trim();
\`\`\`

Files aren't captured by \`docker inspect\` the way environment variables are, and don't get accidentally dumped into logs that print "the current environment."

### Build-time secrets: docker build --secret

\`\`\`dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npm_token \\
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm install
\`\`\`

\`\`\`bash
docker build --secret id=npm_token,src=./npm_token.txt -t my-app .
\`\`\`

This is the correct replacement for the "never do this" \`ARG API_KEY\` pattern from the previous lesson — the secret is available to that specific \`RUN\` instruction only, and critically, it is **never** written into any image layer or the build history, unlike an \`ARG\`.

### In simpler setups: .env files kept out of version control

\`\`\`
# .gitignore
.env
\`\`\`

For projects not using Swarm secrets, a common pragmatic approach is an \`.env\` file (loaded via \`env_file\` in Compose) that's explicitly excluded from git — better than committing a password directly into \`docker-compose.yml\`, though not as strong a guarantee as true secret mounting, since the values still end up as regular environment variables once the container is running.

### The practical hierarchy

1. **Best**: a dedicated secrets manager (cloud provider's, or Docker/Swarm secrets) — secrets never touch environment variables or image layers.
2. **Good**: \`.env\` files, excluded from git, loaded via \`env_file\`.
3. **Never**: hardcoded in a Dockerfile, or passed via \`ARG\` for anything actually sensitive.

> **Key idea:** environment variables are visible to anything that can inspect or exec into a container — genuinely sensitive values belong in a mounted secret file, not an \`-e\` flag or a baked-in \`ENV\`.`,
    },
  ],
}
