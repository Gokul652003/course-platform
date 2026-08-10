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
    {
      name: "perf",
      minutes: 12,
      intro:
        "Find out where CPU time actually goes using Linux's built-in profiler.",
      content: `## perf

\`perf\` is Linux's native performance profiler. CPU time, cache misses, call graphs — if the kernel can count it, perf can record and report it.

### Record what a command does

\`\`\`bash
sudo perf record -g -o /tmp/perf.data mycommand
\`\`\`

\`-g\` captures call graphs so you see *why* a function is called.

### Report

\`\`\`bash
sudo perf report -i /tmp/perf.data --stdio | head -40
\`\`\`

Example output:

\`\`\`
Samples: 10K of event 'cpu-clock', 5000 Hz
 99.91%  mycommand
   --99.10%-- main
              |--59.10%-- parse_config
              |--25.30%-- do_sort
              --14.70%-- free_mem
\`\`\`

Top of the tree = where the time goes.

### Profile a running process

\`\`\`bash
sudo perf top
sudo perf top -p $(pidof nginx | awk '{print $1}')
\`\`\`

\`perf top\` is live \`top\` for CPU-in-kernel-times.

### Different events

\`\`\`bash
sudo perf stat mycommand
sudo perf stat -e cache-misses,cache-references mycommand
\`\`\`

\`perf stat\` gives aggregate counters instead of per-symbol samples.

> **Pro tip:** \`perf\` needs \`kernel.perf_event_paranoid\` relaxed on some systems (\`sudo sysctl -w kernel.perf_event_paranoid=1\`). Start with \`perf stat\` (cheap, aggregate) before \`perf record\` (detailed, heavier).

### Key recap

- \`perf record -g\` \`perf report\` profiles call graphs.
- \`perf top\` watches live who burns CPU.
- \`perf stat -e <events>\` gives counter totals.
- It reads the Linux perf_events subsystem — no special tools to install.`,
    },
    {
      name: "sysstat (sar, iostat)",
      minutes: 11,
      intro:
        "Collect historical CPU, memory, disk, and network stats so you can blame the right thing.",
      content: `## sysstat (sar, iostat)

sysstat's \`sar\` is the long-tail recorder: it samples system activity every 10 minutes and saves it. When the boss asks "what happened last night", \`sar\` has the answer.

### Install and enable

\`\`\`bash
sudo apt install -y sysstat
sudo systemctl enable --now sysstat
\`\`\`

### See what's recorded

\`\`\`bash
sar          # all data today
sar -u 1 5   # CPU, every 1s, 5 samples
sar -r       # memory
sar -b       # I/O
sar -n DEV   # network per device
sar -q       # load queue
\`\`\`

### Yesterday

\`\`\`bash
sar -f /var/log/sysstat/sa$(date -d yesterday +%d) -u
\`\`\`

### iostat for disk

\`\`\`bash
iostat -x 2 3
\`\`\`

Watch \`%util\` (how busy the device is) and \`await\` (service time, includes queueing).

### pidstat for per-process

\`\`\`bash
pidstat -d 2
pidstat -r -p ALL
\`\`\`

> **Key idea:** \`top\` shows now; \`sar\` shows *then*. When a server "feels slow", compare today's \`sar\` to last week's — a shifted bottleneck appears instantly in the history.

### Key recap

- sysstat saves 10-minute samples to \`/var/log/sysstat/\`.
- \`sar -u/-r/-b/-n DEV/-q\` cover CPU, RAM, I/O, net.
- \`iostat -x\` flags busy disks via \`%util\` and \`await\`.
- \`pidstat\` attributes usage to specific processes.`,
    },
    {
      name: "I/O monitoring",
      minutes: 10,
      intro:
        "Discover which process is hammering the disk, and how fast it can go.",
      content: `## I/O monitoring

Slow storage shows up as symptoms everywhere else. These tools trace performance back to the specific process on the specific device.

### Per-process I/O

\`\`\`bash
sudo apt install -y iotop
sudo iotop -o
\`\`\`

\`-o\` shows only processes that have done I/O, which keeps a busy screen readable.

### Per-device I/O

\`\`\`bash
iostat -x 2
blktrace -d /dev/sda -o /tmp/bt | timeout 5 tail
sudo blkparse -i /tmp/bt -O
\`\`\`

### A simpler one-shot

\`\`\`bash
sudo iotop -b -n 3
\`\`\`

Batch mode prints samples and exits — scriptable.

### Filesystem-level insight

\`\`\`bash
du -sh /var/log
lsof | grep deleted
\`\`\`

**Deleted-but-open files** still hold disk space until released — \`lsof | grep deleted\` finds them, and killing the process frees the space.

> **Pro tip:** When "disk full" but \`du\` shows normal usage, it's almost always deleted files still held open by a process. \`lsof +L1\` lists them directly.

### Key recap

- \`iotop -o\` ranks processes by current I/O.
- \`iostat -x\` reports device utilization and latency.
- \`blktrace\`/\`blkparse\` capture block-level detail.
- Deleted-but-open files hide free space — \`lsof +L1\` reveals them.`,
    },
    {
      name: "CPU governors",
      minutes: 10,
      intro:
        "Control how fast CPUs turbo, idle, and scale between battery and performance.",
      content: `## CPU governors

The CPU frequency governor decides how aggressively the processor ramps up and down. It's the lever behind "why is my server slow one second, fast the next".

### Check the governor

\`\`\`bash
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
cpupower frequency-info
\`\`\`

### Common governors

| Governor | Behavior |
|----------|----------|
| \`performance\` | always maximum frequency |
| \`powersave\` | always minimum frequency |
| \`ondemand\` | ramp up on load, down immediately after |
| \`schedutil\` | tied to scheduler decisions (modern default) |

### Set it for all cores

\`\`\`bash
sudo apt install -y linux-cpupower
sudo cpupower frequency-set -g performance
\`\`\`

### Confirm frequencies actually ramp

\`\`\`bash
cpupower frequency-info | grep -E 'current CPU|drivers'
watch -n1 'cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq'
\`\`\`

> **Pro tip:** A "many-core" benchmark on a laptop that \`ondemand\` keeps at idle speed looks terrible. For latency-sensitive production work, \`performance\` governor removes the ramp-up delay — you pay in watts.

### Key recap

- Governors define the CPU frequency policy.
- \`performance\` wins for latency; \`powersave\`/ondemand\` for power.
- \`cpupower frequency-set -g\` switches all logical CPUs.
- Verify with \`scaling_cur_freq\` in sysfs.`,
    },
    {
      name: "Kernel messaging (dmesg)",
      minutes: 10,
      intro:
        "Read the kernel's own log to diagnose hardware and driver panics.",
      content: `## Kernel messaging (dmesg)

The kernel talks constantly. \`dmesg\` reads ring buffer of boot-time and runtime hardware/driver messages — where OOM kills, disk errors, and USB dramas get written.

### View recent kernel messages

\`\`\`bash
dmesg | tail -40
dmesg -w
\`\`\`

\`-w\` follows new messages in real time — plug in a device and watch the kernel react.

### Search for trouble

\`\`\`bash
dmesg | grep -iE "error|fail|warn" | tail -30
dmesg | grep -i "oom"
dmesg -l err,crit,alert,emerg
\`\`\`

### Boot-time history via journal

The journal stores the full boot, so \`journalctl -k -b\` is usually more convenient than live \`dmesg\`:

\`\`\`bash
journalctl -k | tail -50
journalctl -k -b -1      # previous boot
\`\`\`

### See a specific device

\`\`\`bash
dmesg | grep -i usb | tail -20
lsusb && dmesg | grep -i nvme
\`\`\`

> **Key idea:** When hardware "just isn't recognized" — a disk, a NIC, a camera — \`dmesg\` is the first stop. The kernel names the exact reason it gave up.

### Key recap

- \`dmesg\` reads the kernel ring buffer; \`-w\` follows live.
- \`journalctl -k -b\` replays any boot's kernel log.
- Grep for \`error\`/\`oom\`/disk names to find the story.
- Hardware that "doesn't work" always leaves a kernel message.`,
    },
  ],
}