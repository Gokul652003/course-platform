import type { Module } from "../types"

export const module10: Module = {
  id: 10,
  title: "System Administration",
  status: "upcoming",
  lessons: [
    {
      name: "Users",
      minutes: 8,
      intro: "Every Linux account is a user, and every user is tied to a numeric ID that the kernel actually tracks.",
      content: `## Users

Linux is a multiuser system. Each person (or service) gets a **user account** so the kernel can track who owns what.

### The account behind the name

Linux cares about numbers, not names. Every user has a **UID** (user ID) and the kernel uses it for ownership checks.

View your own identity:

\`\`\`bash
id
\`\`\`

Example output:

\`\`\`
uid=1000(gokul) gid=1000(gokul) groups=1000(gokul),4(adm),27(sudo)
\`\`\`

- **uid** — your numeric identity
- **gid** — your primary group
- **groups** — every group you belong to

### The three files

\`\`\`
/etc/passwd   — user names, UIDs, home dirs, login shells
/etc/shadow   — hashed passwords (root-only readable)
/etc/group    — group names and membership
\`\`\`

### Creating and managing users

\`\`\`bash
sudo useradd -m -s /bin/bash alice
sudo passwd alice
sudo userdel -r alice
\`\`\`

- \`-m\` creates a home directory
- \`-s /bin/bash\` sets the login shell
- \`userdel -r\` removes the user and their home directory

### The superuser

The **root** user has UID \`0\` and bypasses almost every permission check. Use \`sudo\` to run single commands as root instead of logging in as root.

> **Key idea:** Never log in as root for everyday work. Use \`sudo\` so actions are logged and mistakes are contained.

### Key recap

- Every user is backed by a numeric UID
- Accounts live in \`/etc/passwd\`, passwords in \`/etc/shadow\`
- \`useradd\`, \`passwd\`, and \`userdel\` manage accounts
- \`sudo\` runs one command with root privileges`,
    },
    {
      name: "Groups",
      minutes: 7,
      intro: "Groups bundle many users together so you can grant permissions once, to everyone at once.",
      content: `## Groups

A **group** is a collection of users. Instead of granting a file to ten people one by one, you grant it to one group.

### Why groups exist

Permission checks happen like this: the kernel checks whether you are the file **owner**, or whether you belong to the file's **group**. Groups let you share without giving access to everyone.

### Listing groups

\`\`\`bash
groups
cat /etc/group
\`\`\`

Example output:

\`\`\`
gokul adm cdrom sudo dip plugdev
\`\`\`

### Creating and managing groups

\`\`\`bash
sudo groupadd developers
sudo usermod -aG developers alice
sudo gpasswd -d alice developers
sudo groupdel developers
\`\`\`

- \`groupadd\` creates a group
- \`usermod -aG\` adds a user to a group (always keep \`-a\` so you do not remove them from other groups)
- \`gpasswd -d\` removes a user
- \`groupdel\` deletes a group

### A practical example

\`\`\`bash
sudo groupadd webmasters
sudo usermod -aG webmasters alice
sudo chgrp webmasters /var/www
ls -ld /var/www
\`\`\`

Example output:

\`\`\`
drwxrwsr-x 2 root webmasters 4096 Aug  6 10:00 /var/www
\`\`\`

Now every member of \`webmasters\` can share access to that directory.

> **Key idea:** Groups are the classic way to share. One group membership grants access to many files at once.

### Key recap

- Groups bundle users for shared permissions
- \`/etc/group\` defines group membership
- \`groupadd\`, \`usermod -aG\`, and \`groupdel\` manage them
- \`chgrp\` sets a file's group`,
    },
    {
      name: "Services (systemctl)",
      minutes: 9,
      intro: "Services are background programs that start at boot, and systemctl is the command that runs them.",
      content: `## Services (systemctl)

A **service** is a background program such as a web server or a database. On modern Linux, \`systemd\` runs services and \`systemctl\` is your control panel for them.

### Check if a service is running

\`\`\`bash
systemctl status nginx
\`\`\`

Example output (abridged):

\`\`\`
● nginx.service - A high performance web server
     Active: active (running)
   Main PID: 1234 (nginx)
\`\`\`

### Starting, stopping, and restarting

\`\`\`bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
\`\`\`

- \`restart\` stops then starts the service
- \`reload\` asks it to re-read its config without a full stop — less downtime

### Start at boot

\`\`\`bash
sudo systemctl enable nginx
sudo systemctl disable nginx
\`\`\`

- \`enable\` makes the service start automatically at boot
- \`disable\` turns that off

### Common troubleshooting

\`\`\`bash
systemctl status nginx
journalctl -u nginx
systemctl list-units --type=service
\`\`\`

If a service fails, \`systemctl status\` shows the error and \`journalctl -u\` shows its logs.

> **Key idea:** \`start\`/\`stop\` affect right now, \`enable\`/\`disable\` affect the next boot. You often want both.

### Key recap

- \`systemctl\` controls systemd services
- \`status\`, \`start\`, \`stop\`, \`restart\`, \`reload\` manage the live state
- \`enable\`/\`disable\` control boot-time behavior
- \`journalctl -u\` reads a service's logs`,
    },
    {
      name: "Logs (journalctl)",
      minutes: 8,
      intro: "journalctl is the window into every log that systemd collects, from boot to kernel messages.",
      content: `## Logs (journalctl)

Logs are the trail every program leaves behind. \`journalctl\` reads the binary journal that systemd maintains.

### See recent logs

\`\`\`bash
journalctl
journalctl -n 20
journalctl -f
\`\`\`

- no flags — everything (huge)
- \`-n 20\` — just the last 20 lines
- \`-f\` — follow mode, like \`tail -f\`

### Filter by service or time

\`\`\`bash
journalctl -u nginx
journalctl -u ssh.service --since today
journalctl --since "2 hours ago"
journalctl --until "2026-08-01 12:00"
\`\`\`

### Example output

\`\`\`
Aug 06 09:41:12 host systemd[1]: Started A high performance web server.
Aug 06 09:41:12 host nginx[1234]: nginx: configuration file /etc/nginx/nginx.conf test is successful
\`\`\`

Each line shows the timestamp, the hostname, the source program, and the message.

### Boot and kernel messages

\`\`\`bash
journalctl -b
journalctl -k
\`\`\`

- \`-b\` — messages from the current boot
- \`-k\` — kernel messages, useful for hardware problems

### Making the journal survive reboots

\`\`\`bash
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
\`\`\`

> **Key idea:** The journal is a goldmine. When diagnosing any problem, start with \`journalctl -u <service> -f\` and watch the log live.

### Key recap

- \`journalctl\` reads the systemd journal
- \`-n\`, \`-f\`, \`--since\`, and \`-u\` narrow the view
- \`-b\` scopes to the current boot, \`-k\` to kernel messages
- \`/var/log/journal\` makes logs persist across reboots`,
    },
    {
      name: "Boot process",
      minutes: 9,
      intro: "Follow the chain from the power button to a login prompt: firmware, bootloader, kernel, init.",
      content: `## Boot process

Booting is a relay race. Each stage hands control to the next until you see a login prompt.

### Stage by stage

\`\`\`
1. BIOS / UEFI firmware
2. Bootloader (GRUB)
3. Linux kernel
4. systemd (PID 1)
5. Login prompt
\`\`\`

### 1. Firmware

The firmware in the motherboard initializes hardware and looks for a bootable disk. With **UEFI**, the bootloader lives on an \`EFI\` partition.

### 2. Bootloader

**GRUB** shows the menu you may have seen at startup. It loads the kernel image and the \`initramfs\` (a small temporary filesystem with drivers needed early).

### 3. Kernel

The kernel decompresses itself, mounts the real root filesystem, and hands control to the first process.

### 4. systemd

\`systemd\` becomes **PID 1** — the first process. It starts everything else:

\`\`\`bash
ps -p 1
\`\`\`

Example output:

\`\`\`
  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
\`\`\`

systemd reads targets and units, starts services in parallel, and brings up your graphical login.

### Inspect your boot

\`\`\`bash
systemd-analyze time
systemd-analyze blame
\`\`\`

\`\`\`
Startup finished in 3.2s (firmware) + 1.1s (loader) + 2.8s (kernel) + 4.5s (userspace)
\`\`\`

> **Key idea:** Everything you care about starts *after* PID 1 exists. If a service is slow to start, \`systemd-analyze blame\` shows which one delays boot.

### Key recap

- Boot flows firmware → bootloader → kernel → systemd
- GRUB loads the kernel and initramfs
- \`systemd\` is PID 1 and starts all other services
- \`systemd-analyze\` measures where boot time goes`,
    },
    {
      name: "SSH server",
      minutes: 10,
      intro: "Secure Shell lets you log into a machine remotely, and a server runs as the sshd service.",
      content: `## SSH server

**SSH (Secure Shell)** lets you log into another machine over an encrypted connection. The server software is \`openssh-server\` and runs as the \`sshd\` service.

### Install and start the server

\`\`\`bash
sudo apt install openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh
\`\`\`

### Connect from a client

On your laptop, run:

\`\`\`bash
ssh alice@192.168.1.50
\`\`\`

You get a password prompt, then a shell on the remote machine.

### The config file

\`\`\`bash
sudo vim /etc/ssh/sshd_config
\`\`\`

Common settings:

\`\`\`
Port 22
PermitRootLogin no
PasswordAuthentication yes
\`\`\`

After editing, reload:

\`\`\`bash
sudo systemctl reload ssh
\`\`\`

### Keys instead of passwords

\`\`\`bash
ssh-keygen -t ed25519
ssh-copy-id alice@192.168.1.50
ssh alice@192.168.1.50
\`\`\`

The key pair replaces the password — much stronger and convenient.

### Read the logs

\`\`\`bash
journalctl -u ssh
sudo tail -f /var/log/auth.log
\`\`\`

> **Pro tip:** Disable password logins (\`PasswordAuthentication no\`) once keys work, and keep \`PermitRootLogin no\`. Those two settings stop most brute-force attacks.

### Key recap

- \`openssh-server\` provides the \`sshd\` service
- Connect with \`ssh user@host\`
- Settings live in \`/etc/ssh/sshd_config\`
- \`ssh-keygen\` + \`ssh-copy-id\` replaces passwords with keys`,
    },
    {
      name: "Scheduling (cron)",
      minutes: 8,
      intro: "cron runs commands automatically at set times, using a simple minute-hour-day-month-weekday format.",
      content: `## Scheduling (cron)

**cron** runs commands on a schedule — backups at night, cleanup every Sunday, reports every morning.

### The crontab

Each user has their own **crontab** (cron table). Edit yours with:

\`\`\`bash
crontab -e
\`\`\`

List your jobs:

\`\`\`bash
crontab -l
\`\`\`

### The time fields

\`\`\`
*  *  *  *  *  command
│  │  │  │  │
│  │  │  │  └─ weekday (0-7, Sun=0)
│  │  │  └──── month   (1-12)
│  │  └─────── day     (1-31)
│  └────────── hour    (0-23)
└───────────── minute  (0-59)
\`\`\`

### Practical examples

\`\`\`bash
# every day at 2:30 AM
30 2 * * * /usr/local/bin/backup.sh

# every 15 minutes
*/15 * * * * /usr/local/bin/check.sh

# every Monday at 9 AM
0 9 * * 1 /usr/local/bin/report.sh
\`\`\`

### Log the output

If a job fails, you want to know. Redirect output to a log:

\`\`\`bash
30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
\`\`\`

\`2>&1\` sends error messages to the same file.

### View system-wide jobs

\`\`\`bash
ls /etc/cron.d/
cat /etc/crontab
\`\`\`

> **Key idea:** cron jobs run with minimal environment — no \`PATH\`, no \`HOME\`. Always use absolute paths (like \`/usr/local/bin/backup.sh\`) inside cron lines.

### Key recap

- \`crontab -e\` edits your schedule
- Five fields: minute, hour, day, month, weekday
- \`*\` means "every", \`*/15\` means "every 15"
- Redirect output to a log so failures are visible`,
    },
    {
      name: "Environment variables",
      minutes: 7,
      intro: "Environment variables are name-value pairs handed from parent to child processes.",
      content: `## Environment variables

Environment variables are **name-value pairs** that processes inherit from their parents. They tell programs where to look and how to behave.

### View them

\`\`\`bash
echo $USER
echo $HOME
env
\`\`\`

\`env\` lists everything in your current environment.

### Make a temporary variable

\`\`\`bash
MY_VAR="hello"
echo $MY_VAR
\`\`\`

This variable exists only in the current shell — child programs will not see it.

### Export to children

\`\`\`bash
export MY_VAR="hello"
bash
echo $MY_VAR
\`\`\`

After \`export\`, any program the shell starts inherits the variable.

### Make it permanent

Add the line to your shell's startup file:

\`\`\`bash
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc
echo $EDITOR
\`\`\`

### The PATH variable

\`PATH\` is a list of directories searched when you type a command:

\`\`\`bash
echo $PATH
\`\`\`

Example output:

\`\`\`
/usr/local/bin:/usr/bin:/bin:/usr/games
\`\`\`

### Common variables

\`\`\`bash
echo $HOME $USER $SHELL $PWD $LANG
\`\`\`

> **Key idea:** A variable set with \`export\` flows from parent to child only. That is why \`~/.bashrc\` must re-export it for every new shell.

### Key recap

- \`$NAME\` reads a variable, \`export\` passes it to children
- \`env\` lists the environment
- \`~/.bashrc\` + \`source\` makes variables permanent
- \`PATH\` controls where the shell finds commands`,
    },
    {
      name: "Hostname",
      minutes: 5,
      intro: "The hostname is your machine's name on the network, and a few commands change it.",
      content: `## Hostname

The **hostname** is the name your machine answers to on the network. In \`alice@web-server\`, the part after \`@\` is the hostname.

### See your hostname

\`\`\`bash
hostname
hostname -f
hostname -i
\`\`\`

- \`hostname\` — the short name
- \`hostname -f\` — the fully qualified domain name
- \`hostname -i\` — the machine's IP address

Example output:

\`\`\`
web-server
web-server.example.com
192.168.1.50
\`\`\`

### The short vs the long name

- **short** — \`web-server\`
- **FQDN** — \`web-server.example.com\`

The FQDN combines the short name with your domain.

### Change it temporarily

\`\`\`bash
sudo hostnamectl set-hostname web-server
\`\`\`

This is the modern way on systemd systems. The change survives a reboot.

### Change it permanently, the old way

Edit two files and reboot:

\`\`\`bash
sudo vim /etc/hostname
sudo vim /etc/hosts
\`\`\`

\`/etc/hosts\` maps names to IP addresses and should list your own hostname:

\`\`\`
127.0.0.1   localhost
192.168.1.50  web-server.example.com web-server
\`\`\`

### Verify the change

\`\`\`bash
hostnamectl
hostname
\`\`\`

> **Key idea:** A clean hostname helps you and your tools. Logs, emails, and network tools all record it — pick something descriptive like \`web-server\`, not \`pc-42\`.

### Key recap

- \`hostname\` shows the machine's name
- \`hostnamectl set-hostname\` changes it persistently
- \`/etc/hostname\` and \`/etc/hosts\` hold the permanent config
- The FQDN is the short name plus your domain`,
    },
    {
      name: "Time synchronization",
      minutes: 6,
      intro: "NTP keeps your clock accurate by asking time servers around the world, and timesyncd handles it.",
      content: `## Time synchronization

Machines drift — their clocks slowly fall out of sync. **NTP (Network Time Protocol)** fixes that by asking time servers for the correct time.

### Who does this on modern Linux

\`systemd-timesyncd\` is the built-in NTP client. Check its status:

\`\`\`bash
timedatectl status
\`\`\`

Example output:

\`\`\`
               Local time: Thu 2026-08-06 10:15:03 UTC
           Universal time: Thu 2026-08-06 10:15:03 UTC
                 RTC time: Thu 2026-08-06 10:15:02
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
\`\`\`

Look for \`NTP service: active\` and \`System clock synchronized: yes\`.

### Turn NTP on

\`\`\`bash
sudo timedatectl set-ntp true
\`\`\`

### Set the time zone

\`\`\`bash
timedatectl list-timezones | grep -i paris
sudo timedatectl set-timezone Europe/Paris
\`\`\`

### Force an immediate sync

\`\`\`bash
sudo systemctl restart systemd-timesyncd
\`\`\`

Or use \`chrony\` for stricter needs:

\`\`\`bash
sudo apt install chrony
systemctl status chronyd
\`\`\`

> **Key idea:** An accurate clock is not a nicety — TLS certificates, log timestamps, and \`cron\` all trust the system time. A wrong clock breaks HTTPS and mystifies logs.

### Key recap

- NTP keeps clocks accurate via network time servers
- \`systemd-timesyncd\` is the default NTP client
- \`timedatectl\` controls sync and time zone
- \`chrony\` is the heavier alternative for serious setups`,
    },
  ],
}
