export const module6 = {
  id: 6,
  title: "Disk & Storage",
  status: "upcoming",
  lessons: [
    {
      name: "df",
      minutes: 7,
      intro: "Report free disk space on every mounted filesystem at a glance.",
      content: `## Checking Disk Free Space with df

### What df shows

\`df\` (disk free) reports how much disk space is **free** on mounted filesystems. It does not look at individual files.

Run it plain:

\`\`\`bash
df
\`\`\`

Example output:

\`\`\`
Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1        5004992 2104736   2653408  45% /
tmpfs             802152     788    801364   1% /dev/shm
/dev/sda2        9949032 5530304   3915208  59% /home
\`\`\`

Each line is one **mounted filesystem**.

### Human-readable output

Raw 1K-block numbers are hard to read. Add \`-h\`:

\`\`\`bash
df -h
\`\`\`

\`\`\`
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       4.8G  2.0G  2.6G  45% /
\`\`\`

Now sizes appear as K, M, G, and T.

### Inspect one mount

\`\`\`bash
df -h /home
\`\`\`

### Reading the columns

- **Size** — total capacity
- **Used** — space already taken
- **Avail** — space left for your files
- **Use%** — how full the filesystem is
- **Mounted on** — where it attaches in the directory tree

> **Pro tip:** Watch \`Use%\`. A filesystem at 100% stops new writes, which can break logs, databases, and running services.

### Key recap

- \`df\` shows **free space per filesystem**, not per file
- \`df -h\` prints human-readable sizes
- \`df -h /path\` filters to a single mount
- \`Mounted on\` tells you where each filesystem lives`,
    },
    {
      name: "du",
      minutes: 8,
      intro: "Measure how much disk space directories and files actually use.",
      content: `## Measuring Disk Usage with du

### What du shows

\`du\` (disk usage) reports how much space **directories and files** consume. Where \`df\` looks at filesystems, \`du\` walks your actual files.

### Basic usage

\`\`\`bash
du
\`\`\`

This prints the size of the current directory and every subdirectory.

### Human-readable sizes

\`\`\`bash
du -h
\`\`\`

\`\`\`
4.0K    ./scripts
1.2M    ./images
856K    ./src
2.1M    .
\`\`\`

### Summarize a directory

\`\`\`bash
du -sh /home/gokul
\`\`\`

The \`-s\` flag gives a **total** only, and \`-h\` makes it readable. Output:

\`\`\`
12G     /home/gokul
\`\`\`

### Sort biggest directories first

\`\`\`bash
du -h /var/log | sort -h | tail -5
\`\`\`

This is the classic way to find which directory is eating your disk.

> **Key idea:** Always combine \`du\` with a tool that sorts, because raw output lists every subdirectory with no order.

### Common flags

- \`-s\` — summarize (one total)
- \`-h\` — human-readable
- \`-a\` — include files, not just directories
- \`-c\` — grand total at the end

> **Warning:** On huge trees \`du\` scans every file and can be slow. Limit it to the directory you actually suspect.

### Key recap

- \`du\` measures **directory and file usage**
- \`du -sh dir\` gives a clean total
- Pipe \`du -h\` into \`sort -h\` to find disk hogs
- Use \`df\` for filesystems, \`du\` for directories`,
    },
    {
      name: "mount",
      minutes: 10,
      intro: "Attach a filesystem to a directory so its files become visible.",
      content: `## Attaching Filesystems with mount

### What mounting means

A filesystem is useless until it is attached to the directory tree. **Mounting** attaches a storage device to a directory, called the **mount point**. Once mounted, the device's files appear under that directory.

\`\`\`
/dev/sdb1  ──mount──►  /mnt/backup
\`\`\`

### List current mounts

\`\`\`bash
mount
\`\`\`

Output lines look like:

\`\`\`
/dev/sda1 on / type ext4 (rw,relatime)
\`\`\`

This reads: device \`/dev/sda1\` is mounted **on** \`/\` as an ext4 filesystem with the options in parentheses.

### Mounting a device manually

\`\`\`bash
sudo mount /dev/sdb1 /mnt/backup
\`\`\`

After this, everything stored on \`/dev/sdb1\` is reachable under \`/mnt/backup\`.

### Mounting with a filesystem type

\`\`\`bash
sudo mount -t ext4 /dev/sdb1 /mnt/backup
\`\`\`

Normally Linux auto-detects the type, so \`-t\` is optional.

### About /etc/fstab

Permanent mounts belong in **\`/etc/fstab\`**. Mounts you run by hand disappear after a reboot.

> **Key idea:** A manual mount is temporary — it lasts until reboot or \`umount\`. For drives you always want, edit \`/etc/fstab\`.

> **Warning:** Mounting requires root privileges. You will see \`Permission denied\` without \`sudo\`.

### Key recap

- Mounting attaches a device to a **mount point directory**
- \`mount\` lists current mounts or attaches a device
- \`mount /dev/device /dir\` is the manual form
- Manual mounts vanish on reboot; permanent ones live in \`/etc/fstab\``,
    },
    {
      name: "umount",
      minutes: 8,
      intro: "Detach a mounted filesystem safely before removing a device.",
      content: `## Detaching Filesystems with umount

### Why unmount matters

Before you unplug a USB drive or shut down, you must **unmount** it. The kernel keeps pending writes in cache; unmounting flushes those writes to disk. Yanking a drive without unmounting can corrupt files.

### The command

\`\`\`bash
sudo umount /mnt/backup
\`\`\`

You can also name the device instead of the mount point:

\`\`\`bash
sudo umount /dev/sdb1
\`\`\`

### If a device is busy

\`\`\`
umount: /mnt/backup: target is busy.
\`\`\`

Something is using the mount — a process has files open, or your shell's working directory is inside it.

Fix it by leaving the directory and closing programs:

\`\`\`bash
cd /
sudo umount /mnt/backup
\`\`\`

### Force detach (last resort)

\`\`\`bash
sudo umount -l /mnt/backup
\`\`\`

The \`-l\` (lazy) flag detaches now and cleans up later. Use it only when nothing else works, because it can leave writing processes with errors.

> **Pro tip:** If \`umount\` says \`target is busy\`, run \`lsof /mnt/backup\` to see exactly which process is holding it open.

### Key recap

- \`umount\` safely **detaches** a filesystem
- It flushes cached writes before removing the mount
- A busy mount must be freed by closing the files using it
- \`umount -l\` forces a lazy detach when needed`,
    },
    {
      name: "lsblk",
      minutes: 7,
      intro: "List block devices in a clean tree showing your whole storage layout.",
      content: `## Listing Block Devices with lsblk

### What lsblk shows

\`lsblk\` (list block devices) prints every disk and partition in a **tree layout**. It reads data from the kernel via \`sysfs\`, so it is fast and needs no sudo for basic info.

Run it:

\`\`\`bash
lsblk
\`\`\`

Example output:

\`\`\`
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   10G  0 disk
├─sda1   8:1    0    5G  0 part /
└─sda2   8:2    0    5G  0 part /home
sdb      8:16   0    1G  0 disk
\`\`\`

### Reading the tree

- \`sda\` is a whole disk
- \`sda1\` and \`sda2\` are **partitions** inside it
- **TYPE** column: \`disk\` for whole drives, \`part\` for partitions
- **MOUNTPOINT** shows where each partition is attached

### Add size and model info

\`\`\`bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL
\`\`\`

### Show everything

\`\`\`bash
lsblk -f
\`\`\`

The \`-f\` flag adds the filesystem type and UUID:

\`\`\`
sda1  ext4 8b3f1a…  /
\`\`\`

> **Key idea:** \`lsblk\` gives you a map of the whole disk setup in one glance — far easier to read than \`fdisk -l\`.

### Key recap

- \`lsblk\` shows disks and partitions as a tree
- TYPE column separates whole disks from partitions
- \`lsblk -f\` adds filesystem type and UUID
- MOUNTPOINT reveals what is attached where`,
    },
    {
      name: "blkid",
      minutes: 7,
      intro: "Show the filesystem type and UUID that identifies each device.",
      content: `## Identifying Devices with blkid

### What blkid shows

\`blkid\` prints identifying attributes of block devices: their **filesystem type**, **UUID**, and **label**. The UUID is the stable identity of a filesystem, independent of its device name.

Run it:

\`\`\`bash
sudo blkid
\`\`\`

Example output:

\`\`\`
/dev/sda1: UUID="8b3f1a2c-…" TYPE="ext4"
/dev/sdb1: LABEL="BACKUP" UUID="c9d2e04f-…" TYPE="ext4"
\`\`\`

### Why UUIDs matter

Device names like \`/dev/sda1\` can change when you add or remove disks. A **UUID does not change**. That is why \`/etc/fstab\` usually references mounts by UUID:

\`\`\`
UUID=8b3f1a2c-… / ext4 defaults 0 1
\`\`\`

> **Key idea:** Never rely on \`/dev/sdX\` names in permanent configuration — use the UUID, which stays stable across reboots.

### Query one device

\`\`\`bash
sudo blkid /dev/sdb1
\`\`\`

### Field output only

\`\`\`bash
sudo blkid -s UUID /dev/sda1
\`\`\`

> **Warning:** \`blkid\` needs root to read some devices, so run it with \`sudo\` to avoid empty output.

### Key recap

- \`blkid\` reports filesystem type, UUID, and label
- UUIDs are stable; device names are not
- Use UUIDs in \`/etc/fstab\` for reliable boots
- Run with \`sudo\` for complete results`,
    },
    {
      name: "Partitions",
      minutes: 11,
      intro: "Divide a physical disk into sections that can each hold their own filesystem.",
      content: `## Dividing Disks into Partitions

### What is a partition?

A **partition** is a section of a physical disk reserved for its own use. Each partition can hold a filesystem, be mounted independently, or be used for swap.

\`\`\`
Physical disk /dev/sda (10G)
┌────────────┬────────────┬────────────┐
│ sda1 ext4  │ sda2 ext4  │ sda3 swap  │
│ 5G  /      │ 3G  /home  │ 2G         │
└────────────┴────────────┴────────────┘
\`\`\`

### Partition table types

- **MBR** — older standard, limited to 2TB and four primary partitions
- **GPT** — modern standard, supports huge disks and many partitions

### Create partitions with fdisk

\`\`\`bash
sudo fdisk /dev/sdb
\`\`\`

Interactive commands inside fdisk:

- \`n\` — new partition
- \`p\` — print the current table
- \`d\` — delete a partition
- \`w\` — write changes and exit

### Create partitions non-interactively

\`\`\`bash
sudo parted /dev/sdb mkpart primary ext4 1MiB 100%
\`\`\`

### View the table

\`\`\`bash
sudo fdisk -l /dev/sdb
\`\`\`

> **Key idea:** A partition is just a boundary on the disk. You still need to create a filesystem on it (see the Filesystems lesson) before it can store files.

> **Warning:** Repartitioning a disk destroys data on the affected areas. Back up first, and double-check the device name — \`fdisk /dev/sdb\` is not \`/dev/sda\`.

### Key recap

- Partitions split a disk into independent regions
- GPT is the modern standard; MBR is legacy
- \`fdisk\` and \`parted\` manage partitions
- A partition needs a filesystem before it can hold data`,
    },
    {
      name: "Filesystems",
      minutes: 12,
      intro: "Create and understand the formats that organize files on a partition.",
      content: `## Creating Filesystems

### What is a filesystem?

A **filesystem** is the structure that organizes how files and directories are stored on a partition — how names map to data, and where metadata lives. Without one, a partition is just raw space.

### Common Linux filesystems

- **ext4** — default on most distributions, reliable and mature
- **XFS** — great for very large files and high performance
- **btrfs** — supports snapshots and compression
- **swap** — special type used for virtual memory

### Creating an ext4 filesystem

After partitioning \`/dev/sdb1\`:

\`\`\`bash
sudo mkfs.ext4 /dev/sdb1
\`\`\`

Output ends with:

\`\`\`
Writing superblocks and filesystem accounting information: done
\`\`\`

### Add a label

\`\`\`bash
sudo mkfs.ext4 -L BACKUP /dev/sdb1
\`\`\`

### Create an XFS filesystem

\`\`\`bash
sudo mkfs.xfs /dev/sdc1
\`\`\`

> **Key idea:** \`mkfs\` stands for "make filesystem." The \`-t\` flag also works: \`mkfs -t ext4 /dev/sdb1\`. Destroying the filesystem wipes all data on that partition.

> **Warning:** There is no undo. Double-check the device before running \`mkfs\` — the only prompt is a one-time confirmation.

### Mount and use it

\`\`\`bash
sudo mount /dev/sdb1 /mnt/backup
\`\`\`

### Key recap

- A filesystem organizes files and directories on a partition
- ext4 is the common default; XFS and btrfs suit specific needs
- \`mkfs.ext4 /dev/sdbX\` creates the filesystem
- Only after \`mkfs\` can a partition be mounted and used`,
    },
    {
      name: "Swap",
      minutes: 9,
      intro: "Use disk space as extra memory when RAM runs low.",
      content: `## Using Disk Space as Memory: Swap

### What swap is

**Swap** is disk space that the kernel uses as an overflow for RAM. When physical memory fills up, the kernel moves cold pages to swap, freeing RAM for active programs.

### Why it matters

- Prevents OOM crashes when memory spikes
- Lets you run more processes than fit in RAM
- Is **much slower** than RAM — swap is not a substitute

### Check current swap

\`\`\`bash
free -h
\`\`\`

\`\`\`
              total   used   free   shared  buff/cache  available
Mem:           7.6G   5.9G   420M    200M       1.3G       1.3G
Swap:          2.0G   100M   1.9G
\`\`\`

The **Swap** row shows total, used, and free swap space.

### Create a swap file

1. Create a file of the desired size:

\`\`\`bash
sudo fallocate -l 2G /swapfile
\`\`\`

2. Set secure permissions:

\`\`\`bash
sudo chmod 600 /swapfile
\`\`\`

3. Mark it as swap:

\`\`\`bash
sudo mkswap /swapfile
\`\`\`

4. Enable it:

\`\`\`bash
sudo swapon /swapfile
\`\`\`

Verify with \`free -h\` — the Swap row should now show 2.0G total.

### Make it permanent

Add to \`/etc/fstab\`:

\`\`\`
/swapfile  none  swap  sw  0 0
\`\`\`

> **Key idea:** Swap is your safety net. A system without swap may kill processes abruptly instead of slowing down gracefully.

> **Pro tip:** If \`free -h\` shows swap constantly at 100%, you need more RAM — adding swap only delays the problem.

### Key recap

- Swap extends RAM using disk space
- \`free -h\` shows current swap usage
- A swap file is created with \`mkswap\` and enabled with \`swapon\`
- Persistent swap goes in \`/etc/fstab\``,
    },
    {
      name: "Disk usage analysis",
      minutes: 12,
      intro: "Combine df, du, and sorting to find exactly what fills your disk.",
      content: `## Finding What Fills Your Disk

### The detective workflow

A full disk usually means one oversized directory. Use these three steps to find it.

### 1. Check overall space with df

\`\`\`bash
df -h
\`\`\`

Find the filesystem that is nearly full.

### 2. Scan top-level directories

\`\`\`bash
sudo du -h --max-depth=1 / 2>/dev/null | sort -h
\`\`\`

\`\`\`
4.0K    /opt
12K     /tmp
1.2G    /usr
14G     /var
2.1M    /boot
21G     /
\`\`\`

\`/var\` is the obvious suspect.

### 3. Drill into the suspect

\`\`\`bash
sudo du -h --max-depth=1 /var 2>/dev/null | sort -h
\`\`\`

\`\`\`
12G     /var/log
1.5G    /var/cache
120M    /var/lib
\`\`\`

Logs are eating the disk.

### See the biggest individual files

\`\`\`bash
sudo du -ah /var/log | sort -h | tail -5
\`\`\`

### Clean up

Large log files are safe to rotate or truncate:

\`\`\`bash
sudo truncate -s 0 /var/log/nginx/access.log
\`\`\`

> **Pro tip:** \`du\` can be slow over an entire disk. Always start with \`--max-depth=1\` so you identify the guilty directory before drilling down.

> **Key idea:** This three-step loop — \`df\` → \`du\` → sort — is the same workflow system admins use on real servers.

### Key recap

- Start with \`df -h\` to find the full filesystem
- Use \`du -h --max-depth=1\` to rank top directories
- Drill down with \`sort -h\` and \`tail\`
- Clear space with safe actions like truncating logs`,
    },
  ],
}
