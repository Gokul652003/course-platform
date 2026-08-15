import type { Module } from "../types"

export const nextjsModule10: Module = {
  id: 10,
  title: "Capstone: Building & Deploying a Full App",
  status: "upcoming",
  lessons: [
    {
      name: "Environment Variables & Configuration",
      minutes: 8,
      intro: "Managing secrets and per-environment config correctly in a Next.js project.",
      content: `### .env files and Next.js's built-in loading

\`\`\`
# .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
SESSION_SECRET=a-long-random-string
\`\`\`

Next.js automatically loads \`.env.local\` (and \`.env\`, \`.env.development\`, \`.env.production\`) with no extra package required — a meaningful difference from a plain Node.js project, which typically needs a library like \`dotenv\`.

\`\`\`
.gitignore
.env.local
\`\`\`

\`.env.local\` is excluded from git by \`create-next-app\`'s default \`.gitignore\` — real secrets (database credentials, API keys, the session secret from the previous module) belong here, never committed.

### Server-only vs client-exposed variables

\`\`\`
# server-only — NOT accessible in the browser
DATABASE_URL=postgresql://...

# exposed to the browser — accessible via process.env.NEXT_PUBLIC_...
NEXT_PUBLIC_ANALYTICS_ID=UA-12345
\`\`\`

This is a genuinely important security boundary, worth internalizing clearly: **only** variables prefixed with \`NEXT_PUBLIC_\` are bundled into client-side JavaScript and become readable in the browser. Everything else is available only in server-side code (Server Components, Server Actions, Route Handlers, middleware) — accidentally reading a non-prefixed variable in a Client Component just returns \`undefined\`, rather than leaking the secret, but the reverse mistake — prefixing something sensitive with \`NEXT_PUBLIC_\` by accident — genuinely ships that value to every visitor's browser.

\`\`\`tsx
// Server Component — fine
const dbUrl = process.env.DATABASE_URL

// Client Component — this would be undefined, and DATABASE_URL should never be prefixed anyway
"use client"
const dbUrl = process.env.DATABASE_URL  // undefined, and rightly so
\`\`\`

### Validating environment variables at startup

\`\`\`ts
// lib/env.ts
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(\`Missing required environment variable: \${name}\`)
  return value
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  SESSION_SECRET: requireEnv("SESSION_SECRET"),
}
\`\`\`

Failing loudly and immediately if a required variable is missing (rather than discovering it later as a confusing runtime error deep in some unrelated code path) is worth the small amount of upfront code — a common, low-effort habit worth adopting on any real project.

### Different values per environment

\`\`\`
.env.development     <- loaded automatically when running \`next dev\`
.env.production       <- loaded automatically when running \`next build\` / \`next start\`
\`\`\`

Beyond \`.env.local\` (for anything truly local and never committed), environment-specific files let you check in *non-sensitive* environment-specific defaults — a different API base URL for development versus production, for instance — while secrets still live only in \`.env.local\` or your hosting platform's own environment variable configuration.

> **Key idea:** Next.js loads \`.env\` files with no extra setup, but the \`NEXT_PUBLIC_\` prefix is a hard security boundary, not just a naming convention — get it backwards, and a secret meant to stay server-side ends up shipped to every visitor's browser.`,
    },
    {
      name: "Building for Production",
      minutes: 7,
      intro: "What next build actually does, and catching issues before they reach real users.",
      content: `### Running a production build

\`\`\`bash
npm run build
\`\`\`

Unlike \`next dev\` (optimized for fast rebuilds and helpful error overlays during development), \`next build\` produces the actual optimized output you'd deploy: minified JavaScript, statically pre-rendered pages wherever possible, and a build-time type-check across the whole project — recall from the first module, a TypeScript error fails this build outright, not just an editor warning.

### Reading the build output

\`\`\`
Route (app)                    Size     First Load JS
┌ ○ /                          142 B    87.3 kB
├ ○ /about                     142 B    87.3 kB
├ ƒ /dashboard                 1.2 kB   94.1 kB
└ ● /blog/[slug]               891 B    89.4 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
\`\`\`

This summary directly reflects the rendering strategies covered earlier in the course — worth actually reading after every build, not skipping past. A route you expected to be static (\`○\`) showing up as dynamic (\`ƒ\`) usually means something in that route (an uncached \`fetch\`, a call to \`cookies()\`) is forcing dynamic rendering, possibly unintentionally.

### Testing the actual production build locally

\`\`\`bash
npm run build
npm run start
\`\`\`

\`next dev\`'s behavior is genuinely different from a production build in some cases — certain caching behaviors, and any bug that only manifests once minification/bundling has happened, won't show up in \`dev\` mode at all. Always run \`build\` + \`start\` and click through the app at least once before considering a change ready to ship — this is the same principle from the HTML/Docker modules of this course: a check that only runs in your convenience environment isn't the same as a check against what actually ships.

### Linting and type-checking as separate, earlier gates

\`\`\`bash
npm run lint
npx tsc --noEmit
\`\`\`

Running these explicitly (often wired into CI, so they run automatically on every pull request) catches issues *before* a full build, which is slower — a fast feedback loop during development, with the full \`build\` as the final, authoritative gate before deployment.

> **Key idea:** \`next build\`'s route-by-route output (\`○\`/\`ƒ\`/\`●\`) is a direct, readable summary of every rendering-strategy decision covered in this course — and testing the real production build (\`build\` + \`start\`), not just \`dev\`, is what catches the bugs that only appear once optimization and minification have actually happened.`,
    },
    {
      name: "Deploying to Production",
      minutes: 8,
      intro: "Getting a Next.js app live — on Vercel, and as a self-hosted alternative.",
      content: `### Deploying to Vercel

\`\`\`bash
npx vercel
\`\`\`

Vercel is built by the same team behind Next.js, and is the path with the least configuration — connecting a GitHub repository through Vercel's dashboard gives you automatic deployments on every push, preview URLs for every pull request, and every rendering strategy from this course (static, ISR, dynamic, streaming) working correctly with zero extra setup. For most teams, this is the practical default.

### Self-hosting: the standalone output mode

\`\`\`js
// next.config.js
module.exports = {
  output: "standalone",
}
\`\`\`

For deploying anywhere other than Vercel — your own server, a container platform, a different cloud provider — \`output: "standalone"\` produces a minimal, self-contained build with only the exact dependencies actually needed to run the app, rather than requiring the full \`node_modules\` folder in production.

### Deploying with Docker

\`\`\`dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

If you've taken this course platform's Docker course, this Dockerfile should look immediately familiar — a multi-stage build, exactly as covered there, with the standalone output copied into a lean final image. This is the natural intersection of the two courses: a Next.js app is, ultimately, just another application that can be containerized and deployed the same way any other Node.js service can.

### Required environment variables at deploy time

Whichever platform you deploy to, the production environment needs the same environment variables covered in the previous lesson (\`DATABASE_URL\`, \`SESSION_SECRET\`, etc.) configured through that platform's own settings — \`.env.local\` never gets deployed (it's git-ignored, by design), so production secrets are configured separately, directly on the hosting platform.

### A pre-deploy checklist

- [ ] \`npm run build\` succeeds locally with no errors
- [ ] All required environment variables are configured on the hosting platform
- [ ] \`NEXT_PUBLIC_\` variables reviewed — nothing sensitive accidentally prefixed
- [ ] Tested with \`npm run build && npm run start\`, not just \`npm run dev\`
- [ ] Database migrations (if any) have been run against the production database

> **Key idea:** Vercel offers the least-friction path since it's purpose-built for Next.js's full feature set; self-hosting (including via the same Docker multi-stage pattern from this platform's Docker course) works too, via \`output: "standalone"\` — either way, production environment variables are configured on the platform itself, never deployed from \`.env.local\`.`,
    },
    {
      name: "Where to Go Next",
      minutes: 6,
      intro: "You've covered Next.js end to end — here's how it connects to what comes after.",
      content: `### What you've covered

This course took you from "what is Next.js and why" through the full breadth of building a real application with it: the App Router's file-based routing and layouts, the Server/Client Component split, every rendering strategy (static, dynamic, ISR, streaming), data fetching and caching, Server Actions for mutations, styling approaches, building genuine API endpoints with Route Handlers, metadata/image/font optimization, authentication, and finally configuring and deploying a production build.

### How this connects to the rest of this platform's courses

- **HTML** — every semantic element, accessibility practice, and metadata convention from that course applies directly inside JSX; Next.js doesn't change what good markup looks like, it changes how that markup gets rendered and delivered.
- **Docker** — the capstone's Dockerfile reused the exact multi-stage build pattern from the Docker course's own capstone; a Next.js app in \`output: "standalone"\` mode is, ultimately, just another Node.js service to containerize.

### A realistic next project

The best way to cement this course is building something with a genuine data model and at least one real mutation flow — a small internal tool, a personal blog with an admin panel for writing posts (touching routing, data fetching, Server Actions, and auth all at once), or a link-shortener like the one built in the Docker course's capstone, this time as the actual Next.js app instead of a conceptual example.

### Things worth exploring from here

- **A real database and ORM** — Prisma or Drizzle, replacing the placeholder \`db.post.findMany()\` calls used as examples throughout this course with an actual schema and migrations.
- **Testing** — component testing with tools like Vitest and React Testing Library, and end-to-end testing with Playwright, for confidence that changes don't silently break existing flows.
- **The React Compiler and further React fundamentals** — Next.js sits on top of React, so a deeper understanding of React itself (concurrent rendering, the \`use\` hook, context) pays off directly here too.
- **Observability** — structured logging and error tracking (tools like Sentry) for a production app, so failures surface as actionable reports rather than silent, unnoticed errors.

> **Key idea:** Next.js is a framework, not a full stack on its own — a database/ORM, testing setup, and observability tooling are the natural next layers on top of everything covered in this course, and the Docker/HTML courses on this platform already cover two pieces (containerization, markup fundamentals) that combine directly with what you've just learned.`,
    },
  ],
}
