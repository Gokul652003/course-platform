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
    {
      name: "Timers",
      minutes: 11,
      intro:
        "Replace cron with systemd timers: calendar, monotonic, and dependency-aware scheduling.",
      content: `## Timers

systemd timers are the modern cron. They offer calendar expressions, fixed intervals that respect wakeups, missed-run catch-up, and full logging.

### A calendar timer (like cron)

\`/etc/systemd/system/backup.timer\`:

\`\`\`ini
[Unit]
Description=Nightly backup

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

\`Persistent=true\` runs a missed job immediately after boot instead of skipping it.

### The paired service

\`/etc/systemd/system/backup.service\`:

\`\`\`ini
[Unit]
Description=Run backups

[Service]
ExecStart=/usr/local/bin/backup.sh
\`\`\`

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable --now backup.timer
systemctl list-timers
\`\`\`

### Monotonic interval (after boot)

\`\`\`ini
[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
\`\`\`

### Calendar syntax

\`\`\`ini
OnCalendar=Mon..Fri 09:00:00
OnCalendar=*-*-1..7 00:00:00      # first week of each month
OnCalendar=hourly
\`\`\`

### When will it fire?

\`\`\`bash
systemd-analyze calendar "Mon..Fri 09:00:00"
\`\`\`

> **Pro tip:** \`persist\` + \`OnCalendar\` is the killer feature over cron — a laptop that was off at 2:30 runs the backup the moment it wakes. Cron silently skips it.

### Key recap

- A timer unit pairs with a service unit of the same name.
- \`OnCalendar\` = cron-style, \`OnBootSec\`/\`OnUnitActiveSec\` = relative.
- \`Persistent=true\` catches up missed runs.
- \`systemctl list-timers\` shows the next triggers.`,
    },
    {
      name: "Socket activation",
      minutes: 11,
      intro:
        "Start services on demand the moment a connection arrives — lazily and defensively.",
      content: `## Socket activation

systemd can own a listening port and only start the service when traffic hits it. Services stay stopped until needed, save resources, and never leak open ports.

### A socket unit

\`/etc/systemd/system/myapp.socket\`:

\`\`\`ini
[Unit]
Description=myapp socket

[Socket]
ListenStream=8080

[Install]
WantedBy=sockets.target
\`\`\`

### The service accepts the socket

\`/etc/systemd/system/myapp.service\`:

\`\`\`ini
[Unit]
Description=myapp

[Service]
ExecStart=/usr/local/bin/myapp
Type=simple
\`\`\`

\`\`\`bash
sudo systemctl enable --now myapp.socket
ss -tulpn | grep 8080      # socket listening, service stopped
systemctl is-active myapp   # inactive — until someone connects
\`\`\`

### Verify demand-start

\`\`\`bash
curl http://localhost:8080
systemctl status myapp --no-pager
\`\`\`

The first connection spawns the service; the socket passes its file descriptor to the process.

### When it shines

- **On-demand services** — a rarely used admin tool that costs nothing until touched
- **Empty ports show as closed** to scanners when the service is stopped
- **Connect on inactive** — when the socket is listening but the service isn't, systemd can decide

> **Key idea:** The socket unit owns the port *before* the app exists. systemd binds the fd and hands it over, so there's never a race between "listening" and "ready".

### Key recap

- \`ListenStream\` in a .socket unit owns the port.
- The service starts on first connection, lazily.
- Enable the socket, not the service, for on-demand behavior.
- Works perfectly with Type=simple services that accept a passed fd.`,
    },
    {
      name: "Journald configuration",
      minutes: 10,
      intro:
        "Persist logs, control retention, and route boot-time noise so the journal stays useful.",
      content: `## Journald configuration

By default the journal lives in memory and evaporates on reboot. A few config lines make it permanent, bounded, and searchable.

### The config

\`/etc/systemd/journald.conf\` (or a drop-in):

\`\`\`ini
[Journal]
Storage=persistent          # auto | volatile | persistent | none
SystemMaxUse=1G
SystemMaxFileSize=50M
MaxRetentionSec=30day
Compress=yes
\`\`\`

Apply:

\`\`\`bash
sudo systemctl restart systemd-journald
\`\`\`

\`Storage=persistent\` logs to \`/var/log/journal/\`; \`auto\` keeps volatile unless that directory already exists.

### Search the persistent journal

\`\`\`bash
journalctl --since "2 days ago"
journalctl -u nginx -S today
journalctl -p err -b           # everything at error level this boot
journalctl --until "2024-01-01 00:00"
\`\`\`

### Follow and page

\`\`\`bash
journalctl -f
journalctl -n 100
\`\`\`

### Hand the journal to rsyslog

If legacy tools still read \`/var/log/NNN\`, export:

\`\`\`ini
ForwardToSyslog=yes
\`\`\`

### Confirm your storage

\`\`\`bash
journalctl --disk-usage
sudo journalctl --vacuum-size=500M
\`\`\`

> **Pro tip:** Set \`Storage=persistent\` early — debugging a crash that happened "last boot" is impossible if the log died with it. Bounded sizes (\`SystemMaxUse\`) stop the journal from eating your disk.

### Key recap

- \`Storage=persistent\` survives reboots under \`/var/log/journal\`.
- \`SystemMaxUse\` and \`MaxRetentionSec\` bound growth.
- \`journalctl\` filters by time, unit, priority, and boot.
- \`--vacuum-size\` trims the journal on demand.`,
    },
    {
      name: "Targets & bootup",
      minutes: 11,
      intro:
        "Understand runlevels as targets and how systemd decides which units start at boot.",
      content: `## Targets & bootup

Old init systems had runlevels 0-6. systemd replaces them with **targets** — named sets of units — and boot walks a chain of them.

### The boot chain

\`\`\`
kernel --> systemd (PID 1)
           --> basic.target
           --> sysinit.target
           --> multi-user.target
           --> graphical.target (GUI)
\`\`\`

\`\`\`bash
systemctl list-dependencies multi-user.target
\`\`\`

### Default target

\`\`\`bash
systemctl get-default
sudo systemctl set-default multi-user.target   # headless server
sudo systemctl isolate graphical.target        # switch now
\`\`\`

### Common targets

| Target         | Purpose                         |
|----------------|---------------------------------|
| \`emergency\`     | minimal shell, fix broken boot |
| \`rescue\`       | one user + core services        |
| \`multi-user\`    | normal multi-user, no GUI       |
| \`graphical\`     | multi-user + display manager    |

### Why WantedBy matters

A unit's \`[Install]\` section names the target that pulls it in:

\`\`\`ini
[Install]
WantedBy=multi-user.target
\`\`\`

\`systemctl enable\` symlinks the unit into that target's \`wants\` directory — visible as \`/etc/systemd/system/multi-user.target.wants/\`.

### Boot health

\`\`\`bash
systemd-analyze
systemd-analyze critical-chain
systemctl --failed
\`\`\`

> **Key idea:** "Runlevel 3" ≈ \`multi-user.target\`; "runlevel 5" ≈ \`graphical.target\`. Enabling a unit just registers it under a target — boot "wants" it to start.

### Key recap

- Targets replace runlevels; boot walks a target chain.
- \`get-default\`/\`set-default\` control the boot target.
- \`WantedBy=multi-user.target\` is how services get enabled.
- \`systemd-analyze\` and \`systemctl --failed\` expose boot problems.`,
    },
    {
      name: "Resource control",
      minutes: 11,
      intro:
        "Give every service a CPU, memory, and I/O budget with systemd + cgroups.",
      content: `## Resource control

Every systemd service runs inside a **cgroup**. That gives you real quotas: this service may use 50% CPU, 512 MB RAM, whatever you decide.

### Set limits in a unit

\`\`\`ini
[Service]
CPUQuota=50%
MemoryMax=1G
MemoryHigh=768M
TasksMax=512
IOWeight=500
\`\`\`

- \`MemoryMax\` hard cap — service is OOM-killed above this
- \`MemoryHigh\` soft throttle point
- \`CPUQuota\` percent of one core (100% = one core)
- \`TasksMax\` cap on spawned threads/processes

### Live tooling

\`\`\`bash
systemd-cgtop
systemctl status myapp
\`\`\`

\`systemd-cgtop\` is \`htop\` for cgroups.

### See the current usage

\`\`\`bash
systemctl show myapp -p MemoryCurrent -p CPUUsageNSec
\`\`\`

### Slicing a hierarchy

\`\`\`ini
[Service]
Slice=system-foo.slice
\`\`\`

Slices organize services into groups — useful for "all this project's microservices, shared budget":

\`\`\`ini
# /etc/systemd/system/myproj.slice
[Slice]
MemoryMax=4G
CPUQuota=200%
\`\`\`

> **Pro tip:** Start with \`MemoryHigh\` (soft) before \`MemoryMax\` (hard). A service that gets killed is worse than one that gets throttled; ratchet down only after you see the steady-state usage.

### Key recap

- systemd allocates limits through cgroups per service.
- \`CPUQuota\`, \`MemoryMax\`, \`TasksMax\`, \`IOWeight\` are the dials.
- \`systemd-cgtop\` shows real usage per unit.
- Slices group services so budgets apply across them.`,
    },
    {
      name: "systemd-networkd",
      minutes: 10,
      intro:
        "Manage interfaces, addresses, and DHCP declaratively without NetworkManager.",
      content: `## systemd-networkd

systemd can own the network too — a lightweight, declarative alternative to NetworkManager for servers.

### Enable it

\`\`\`bash
sudo systemctl enable --now systemd-networkd
\`\`\`

Disable NetworkManager to avoid competing \`\`\`systemctl disable NetworkManager\`\`\`.

### DHCP on the first interface

\`/etc/systemd/network/10-eth0.network\`:

\`\`\`ini
[Match]
Name=eth0

[Network]
DHCP=yes

[DHCP]
UseDNS=yes
\`\`\`

### Static address

\`/etc/systemd/network/10-lan.network\`:

\`\`\`ini
[Match]
Name=enp1s0

[Address]
Address=192.168.1.10/24

[Route]
Gateway=192.168.1.1
DNS=1.1.1.1

[Network]
DNS=8.8.8.8
\`\`\`

### Apply changes

\`\`\`bash
sudo systemctl restart systemd-networkd
ip addr show eth0
resolvectl status
\`\`\`

### Bridging for VMs

\`/etc/systemd/network/20-bridge.netdev\`:

\`\`\`ini
[NetDev]
Name=br0
Kind=bridge
\`\`\`

> **Key idea:** networkd pairs neatly with systemd-resolved for DNS. On a single-service server, three small .network files replace the whole GUI network stack.

### Key recap

- \`.network\` files match interfaces and set addresses/DHCP.
- \`systemctl restart systemd-networkd\` applies changes.
- \`resolvectl\` reports the DNS state from systemd-resolved.
- Bridges are declared with \`.netdev\` files.`,
    },
    {
      name: "Debugging systemd",
      minutes: 12,
      intro:
        "Systematically diagnose services that flake, hang, or refuse to start.",
      content: `## Debugging systemd

A service that won't start usually falls into one of four buckets: config not reloaded, permission issue, dependency problem, or the process crashing immediately. Here's the method.

### 1. See what actually happened

\`\`\`bash
systemctl status myapp --no-pager -l
journalctl -u myapp --since "10 min ago" --no-pager
\`\`\`

\`\`\`bash
systemctl show myapp -p ExecMainStatus,Result
\`\`\`

### 2. Confirm the config was loaded

Unit files change constantly — check the file you *think* you edited was the one loaded:

\`\`\`bash
systemctl cat myapp
systemctl show myapp -p FragmentPath
\`\`\`

### 3. Is it a dependency?

\`\`\`bash
systemctl list-dependencies myapp
systemctl --state=failed
\`\`\`

### 4. Crash-on-start

\`\`\`bash
systemctl start myapp; sleep 2; systemctl status myapp
grep -i "start request repeated too quickly" /var/log/syslog
\`\`\`

Rapid restarts hit the rate-limiter; \`StartLimitBurst\`/\`StartLimitIntervalSec\` control it.

### 5. It *thinks* it's active but isn't

\`\`\`bash
systemctl show myapp -p ActiveState,SubState,MainPID
ps -p $(systemctl show myapp -p MainPID --value)
\`\`\`

Type=ping checks rely on the pid file: \`PIDFile=\` pointing nowhere gives a lying "active (running)".

> **Pro tip:** Start at \`journalctl -u myapp -n 50\`. The moment something fails, the reason is usually in the last twenty lines — don't debug by guessing.

### Key recap

- \`status\`, \`journalctl -u\`, \`show -p\` reveal the failure.
- \`systemctl cat\` confirms which unit file is loaded.
- Crash loops trip \`StartLimit\` — raise the burst window if intentional.
- A mismatch of \`Type=\`/\`PIDFile=\` makes active-but-dead services.`,
    },
  ],
}