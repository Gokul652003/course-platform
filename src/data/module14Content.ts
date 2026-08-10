import type { Module } from "../types"

export const module14: Module = {
  id: 14,
  title: "Advanced systemd",
  status: "upcoming",
  lessons: [
    {
      name: "systemd units",
      minutes: 12,
      intro:
        "Learn how a unit file turns a plain command into a managed, restartable service.",
      content: `## systemd units

Almost everything systemd manages is described by a **unit file**. Services, timers to run, mounts, sockets, and devices are all units with the same underlying structure.

### Anatomy of a service unit

\`\`\`ini
[Unit]
Description=My web app
After=network-online.target postgresql.service
Wants=postgresql.service

[Service]
ExecStart=/usr/local/bin/myapp --port 3000
Restart=on-failure
RestartSec=3
User=deploy
EnvironmentFile=/etc/myapp.env

[Install]
WantedBy=multi-user.target
\`\`\`

- **\`[Unit]\`** — metadata and ordering (answers *when*)
- **\`[Service]\`** — how to run the process (answers *how*)
- **\`[Install]\`** — when to enable it (answers *where*)

### Where units live

\`\`\`bash
ls /etc/systemd/system          # admin-created units
ls /usr/lib/systemd/system      # package-provided units
\`\`\`

Files in \`/etc/systemd/system\` override the same-name files in \`/usr/lib\`.

### Load and activate

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable --now myapp
systemctl status myapp --no-pager
\`\`\`

\`daemon-reload\` re-reads changed unit files — forget it and systemd runs your old config.

### Inspect a unit

\`\`\`bash
systemctl cat myapp
systemctl show myapp -p Restart,ExecStart
systemctl list-dependencies myapp
\`\`\`

> **Key idea:** A unit file is just declarative config — but \`ExecStart\` is the only line that actually runs a program. Everything else describes *when* and *under what conditions*.

### Key recap

- Units live in \`/etc/systemd/system\` (and \`/usr/lib\`).
- \`[Unit]\` orders, \`[Service]\` executes, \`[Install]\` enables.
- \`systemctl daemon-reload\` after editing; then \`enable --now\`.
- \`systemctl cat\` shows the effective merged config.`,
    },
    {
      name: "Unit dependencies",
      minutes: 11,
      intro:
        "Control start order and failure relationships between services with Wants, Requires, and After.",
      content: `## Unit dependencies

"Start the app after the DB is ready" sounds easy until you meet the fine print of \`After\` vs \`Requires\`.

### Wants vs Requires

\`\`\`ini
[Unit]
# start postgres if possible, tolerate failure
Wants=postgresql.service

# hard dependency: fail myapp if postgres fails
Requires=postgresql.service
After=postgresql.service
\`\`\`

- \`Wants\` — "try to start this too", best-effort
- \`Requires\` — "must be active", strict
- \`After\` — ordering only: myapp starts *after* postgres starts

### Ordering is not dependency

\`After=\` changes only the order, not the requirement. You can declare \`After=\` alone. Conversely, \`Requires\` without \`After\` starts both in parallel — dangerous.

### A real composite

\`\`\`ini
[Unit]
Description=Web frontend
Wants=network-online.target
After=network-online.target
Requires=app-backend.service
After=app-backend.service
\`\`\`

### Inspect relationships

\`\`\`bash
systemctl list-dependencies --reverse nginx
systemctl show nginx -p After -p Requires -p Wants
\`\`\`

### PartOf and BindsTo

\`\`\`ini
[Unit]
BindsTo=app.service      # stop app.service -> also stop this
PartOf=app.target
\`\`\`

\`BindsTo\` ties lifecycle together; \`PartOf\` just performs stop/restart together.

> **Pro tip:** When a service won't start "because network", check \`After=network-online.target\` and \`Wants=network-online.target\` together — \`network.target\` alone fires before the interface has an address.

### Key recap

- \`Wants\` is optional, \`Requires\` is strict, \`After\` is ordering.
- Always pair \`Requires\` with \`After\` for sensible ordering.
- \`BindsTo\` couples whole lifecycles; \`PartOf\` joins restart/stop.
- \`systemctl list-dependencies\` visualizes the graph.`,
    },
    {
      name: "Systemd services deep dive",
      minutes: 13,
      intro:
        "Master ExecStart variants, sandboxing, environment, and the hardening options built into systemd.",
      content: `## Systemd services deep dive

Beyond \`ExecStart\`, systemd gives a process a fully isolated runtime: user, cgroup, namespaces, environment, and hard limits — all from one unit file.

### ExecStart variants

\`\`\`ini
[Service]
ExecStart=/usr/bin/app                      # plain foreground program
ExecStart=-/usr/bin/app --ignore-failure    # leading '-' ignores the exit code
ExecStart=/bin/sh -c "app --flag"           # run through a shell
ExecStartPre=/usr/local/bin/preflight.sh    # run before starting
ExecStartPost=sleep 1                        # run right after start
ExecStop=/usr/local/bin/shutdown.sh          # custom stop command
\`\`\`

### Environment and working directory

\`\`\`ini
[Service]
WorkingDirectory=/srv/app
Environment=NODE_ENV=production
EnvironmentFile=/etc/myapp.env         # KEY=VALUE lines
PassEnvironment=HTTP_PROXY
\`\`\`

### Restart policy

\`\`\`ini
[Service]
Restart=on-failure        # never, always, on-success, on-abnormal, on-failure
RestartSec=3
StartLimitIntervalSec=60
StartLimitBurst=5
\`\`\`

### Run filesystem read-only

\`\`\`ini
[Service]
ReadOnlyPaths=/
ReadWritePaths=/var/lib/myapp /run/myapp
PrivateTmp=yes
ProtectSystem=strict
\`\`\`

### Limit as a user

\`\`\`ini
[Service]
User=deploy
Group=deploy
NoNewPrivileges=yes
LimitNOFILE=65536
\`\`\`

> **Key idea:** systemd's \`Restart=on-failure\` with \`RestartSec\` is the backbone of self-healing services. Combine with \`User=\` + \`NoNewPrivileges\` and your service is both resilient and sandboxed.

### Key recap

- \`Exec-\` variants handle pre/post/stop steps.
- \`EnvironmentFile\` injects config without touching code.
- \`Restart=on-failure\` + \`RestartSec\` self-heal crashed apps.
- \`ProtectSystem\`, \`PrivateTmp\`, \`NoNewPrivileges\` harden services.
- Drop privileges with \`User=\`/\`Group=\`.`,
    },
  ],
}