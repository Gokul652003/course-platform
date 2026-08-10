import type { Module } from "../types"

export const module15: Module = {
  id: 15,
  title: "Kernel & Performance",
  status: "upcoming",
  lessons: [
    {
      name: "Kernel modules",
      minutes: 11,
      intro:
        "Load, unload, and inspect the drivers and features the kernel runs as plug-ins.",
      content: `## Kernel modules

The kernel is a monolithic core plus **modules** — drivers and features you can load and unload at runtime. This keeps the base kernel tiny while supporting any hardware.

### List loaded modules

\`\`\`bash
lsmod
\`\`\`

\`\`\`bash
Module                  Size  Used by
nft_masq               20480  1
veth                   20480  0
\`\`\`

### Get details about a module

\`\`\`bash
modinfo sg
modinfo vhost_net | head
\`\`\`

### Load and unload

\`\`\`bash
sudo modprobe 8021q          # load with dependencies
sudo modprobe -r 8021q       # unload
sudo insmod ./my.ko          # raw load a built module
sudo rmmod my                # raw unload
\`\`\`

\`modprobe\` is preferred — it resolves dependencies automatically from \`/lib/modules/\$(uname -r)/\`.

### What's exposed from the kernel

\`\`\`bash
uname -r
cat /proc/modules
\`\`\`

### Boot-time modules

Add to \`/etc/modules\` to load at boot, or drop files into \`/etc/modprobe.d/\` to set options.

> **Key idea:** \`lsmod\` shows the *current* picture; \`modinfo\` explains a module; \`modprobe\` is the gentle way to make changes. You almost never need the raw \`insmod\`.

### Key recap

- Modules are optional kernel extensions loaded at runtime.
- \`lsmod\`, \`modinfo\`, and \`modprobe\` are the daily toolkit.
- \`\$(uname -r)\` names the directory holding module files.
- Add to \`/etc/modules\` for boot-time autoload.`,
    },
    {
      name: "/proc filesystem",
      minutes: 12,
      intro:
        "Read a live view of the kernel and processes from the filesystem itself.",
      content: `## /proc filesystem

\`/proc\` is a **virtual filesystem** — files there don't exist on disk. They are live views into the kernel and its processes.

### Peek at processes

\`\`\`bash
ls /proc
cat /proc/version
cat /proc/cpuinfo | head
cat /proc/meminfo | head
\`\`\`

### A process's directory

\`\`\`bash
PID=$(pidof bash | awk '{print $1}')
ls /proc/$PID
cat /proc/$PID/cmdline | tr '\\0' ' '
cat /proc/$PID/status | grep -E '^(State|VmRSS|Threads)'
readlink /proc/$PID/cwd
\`\`\`

\`/proc/<pid>\` holds cmdline, environment, mappings, open files, and more — the foundation of tools like \`ps\` and \`lsof\`.

### Kernel knobs you can read (and write)

\`\`\`bash
cat /proc/sys/vm/swappiness
cat /proc/sys/net/ipv4/ip_forward
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
\`\`\`

Writes here are temporary — persist them in \`/etc/sysctl.d/\` instead.

### Count open files

\`\`\`bash
ls /proc/$PID/fd | wc -l
\`\`\`

> **Pro tip:** When a tool surprises you, it's often reading \`/proc\`. \`top\` reads \`/proc/\<pid\>\` files, \`free\` reads \`/proc/meminfo\`, \`df\` reads mounts — understanding \`/proc\` demystifies them all.

### Key recap

- \`/proc\` is a virtual, always-updated kernel view.
- \`/proc/\<pid\>\` exposes cmdline, env, fd, and memory per process.
- \`/proc/sys/\` holds writable kernel tunables.
- Tools like \`ps\`, \`free\`, and \`top\` are basically \`/proc\` readers.`,
    },
    {
      name: "/sys filesystem",
      minutes: 10,
      intro:
        "Control devices and kernel subsystems through the modern sysfs tree.",
      content: `## /sys filesystem

While \`/proc\` mixes process and kernel data, \`/sys\` (sysfs) is organized by **device and subsystem**. It's how you query and control hardware: CPUs, PCI, USB, block devices, power, and thermal.

### The shape of sysfs

\`\`\`bash
ls /sys/class
ls /sys/class/block
ls /sys/class/net
ls /sys/bus/pci/devices | head
\`\`\`

### Inspect a block device

\`\`\`bash
cat /sys/class/block/sda/queue/scheduler
cat /sys/class/block/sda/size
\`\`\`

### Read CPU topology

\`\`\`bash
ls /sys/devices/system/cpu
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
\`\`\`

### Power and thermal

\`\`\`bash
ls /sys/class/power_supply/
cat /sys/class/thermal/thermal_zone0/temp   # millidegrees C
\`\`\`

### Sysfs is writable where it matters

\`\`\`bash
echo on | sudo tee /sys/block/sda/device/state >/dev/null
\`\`\`

Most writes here are transient and reset at reboot — the exception is \`sysctl\` (which is \`/proc/sys\`).

> **Key idea:** \`/proc\` answers "what is the kernel doing?"; \`/sys\` answers "what hardware is here and how is it configured?". Diagnostics tools read one, other, or both.

### Key recap

- \`/sys\` organizes devices by class, bus, and subsystem.
- Power, thermal, block, net, and CPU data live here.
- \`/proc\` = processes + kernel; \`/sys\` = devices + hardware control.
- Kernel \`sysctl\` settings persist via \`/etc/sysctl.d\`, not direct \`/sys\` writes.`,
    },
    {
      name: "cgroups",
      minutes: 12,
      intro:
        "Constrain and measure whole groups of processes — the technology Docker and systemd build on.",
      content: `## cgroups

**cgroups** (control groups) constrain and measure groups of processes: CPU, memory, I/O, and more. Containers and systemd's resource limits both run on cgroups v2.

### Who's in which cgroup?

\`\`\`bash
cat /proc/self/cgroup
\`\`\`

On a systemd system you'll see a menu like \`0::/user.slice/...\`.

### Cgroup fs v2

\`\`\`bash
mount | grep cgroup
ls /sys/fs/cgroup
\`\`\`

### systemctl is the easy interface

\`\`\`ini
[Service]
MemoryMax=1G
CPUQuota=150%
TasksMax=512
\`\`\`

These become cgroup limits automatically.

### The manual way

\`\`\`bash
mkdir /sys/fs/cgroup/exp
echo 100000 50000 | sudo tee /sys/fs/cgroup/exp/cpu.max
echo 2147483648 | sudo tee /sys/fs/cgroup/exp/memory.max
echo $BASHPID | sudo tee /sys/fs/cgroup/exp/cgroup.procs
\`\`\`

\`cpu.max\` reads as \`quota period\` — 50% of a core here.

### Run a command in a cgroup

\`\`\`bash
sudo systemd-run --scope -p MemoryMax=512M /usr/local/bin/bigjob
\`\`\`

\`systemd-run\` is the cleanest way to run one-off sandboxed processes.

> **Key idea:** Containers "cheat" by giving each one its own cgroup — Docker is mostly namespaces (isolation) + cgroups (limits). Learn cgroups and containers stop being magic.

### Key recap

- cgroups limit and measure groups of processes.
- systemd settings like \`MemoryMax\` map directly onto cgroup files.
- v2 lives at \`/sys/fs/cgroup\`; \`cpu.max\` = quota/period.
- \`systemd-run --scope\` isolates one command.`,
    },
    {
      name: "sysctl tuning",
      minutes: 11,
      intro:
        "Tune kernel parameters safely and persistently across every boot.",
      content: `## sysctl tuning

Sysctl exposes kernel parameters as files under \`/proc/sys\` — tweak them at runtime and persist with files in \`/etc/sysctl.d/\`.

### See current values

\`\`\`bash
sysctl vm.swappiness
sysctl net.core.somaxconn
sysctl -a | grep -i tcp_keepalive
\`\`\`

### Set a value now

\`\`\`bash
sudo sysctl -w vm.swappiness=10
sudo sysctl -w net.ipv4.tcp_fastopen=3
\`\`\`

### Make it persistent

\`/etc/sysctl.d/99-tuning.conf\`:

\`\`\`ini
vm.swappiness = 10
net.core.somaxconn = 65535
net.ipv4.tcp_tw_reuse = 1
fs.file-max = 2097152
\`\`\`

\`\`\`bash
sudo sysctl -p /etc/sysctl.d/99-tuning.conf
sudo sysctl --system
\`\`\`

### Common recipes

| Parameter | Effect |
|-----------|--------|
| \`vm.swappiness\` | how eagerly the kernel swaps |
| \`fs.file-max\` | system-wide open-file ceiling |
| \`net.core.somaxconn\` | accept-queue depth for sockets |
| \`net.ipv4.ip_forward\` | routing (routers/VPNs) |

### Verify persistence

\`\`\`bash
cat /proc/sys/vm/swappiness
sysctl vm.swappiness
\`\`\`

> **Warning:** The classic mistake is setting values that are permanently lost on reboot because you never wrote them to \`/etc/sysctl.d/\`. Always add the file *before* you reboot.

### Key recap

- \`sysctl -w\` changes values live; files persist them.
- \`/etc/sysctl.d/\` with numeric prefixes loads in order.
- Tune one or two knobs and measure — don't shotgun.
- Verify with \`cat /proc/sys/...\` after applying.`,
    },
  ],
}