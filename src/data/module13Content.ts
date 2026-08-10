import type { Module } from "../types"

export const module13: Module = {
  id: 13,
  title: "Security & Hardening",
  status: "upcoming",
  lessons: [
    {
      name: "SELinux",
      minutes: 12,
      intro:
        "Understand mandatory access control and why SELinux can block perfectly valid commands.",
      content: `## SELinux

Normal Linux permissions (read/write/execute) are called **discretionary access control** — each file's owner decides who may use it. SELinux adds a second layer: **mandatory access control (MAC)**. Even if a process holds every UNIX permission, SELinux can still deny it.

### Modes

\`\`\`bash
getenforce
setenforce 1        # enforcing (needs root)
setenforce 0        # permissive
\`\`\`

- **Enforcing** — policy is applied, denials are blocked and logged
- **Permissive** — policy is evaluated and logged but not enforced (good for troubleshooting)
- **Disabled** — not running at all (usually picked at boot)

### Check for denials

\`\`\`bash
sudo ausearch -m avc -ts recent | head -30
sudo journalctl | grep -i selinux
\`\`\`

### The most common fix: restore context

Wrong security context is the classic "why won't my website start" cause:

\`\`\`bash
sudo restorecon -Rv /var/www
sudo restorecon -v /etc/nginx/nginx.conf
\`\`\`

### Inspect file context

\`\`\`bash
ls -Z /etc/passwd
ps -eZ | grep nginx
\`\`\`

Each file carries a label like \`system_u:object_r:etc_t:s0\`; each process carries one too. SELinux allows the process to touch the file only when the policy says its label may.

> **Key idea:** When a service "mysteriously" can't read its own config, check SELinux first. \`ausearch -m avc\` tells you exactly which file and which process were in conflict.

### Key recap

- SELinux enforces policy on top of normal permissions.
- \`getenforce\` shows the mode; \`setenforce 0\` gives permissive trial mode.
- \`restorecon\` resets a file's security label.
- \`ls -Z\` and \`ps -eZ\` display labels.`,
    },
    {
      name: "AppArmor",
      minutes: 11,
      intro:
        "The Ubuntu alternative to SELinux that restricts programs with easy-to-read profiles.",
      content: `## AppArmor

AppArmor is MAC for Ubuntu and Debian. Instead of labeling every file, it attaches a **profile** to each program that lists which files and capabilities it may access.

### Status

\`\`\`bash
sudo aa-status
\`\`\`

You'll see a list of profiles and which processes are confined.

### Load and enforce a profile

Profile files live in \`/etc/apparmor.d/\`:

\`\`\`bash
sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.mysqld
sudo aa-enforce /etc/apparmor.d/usr.sbin.mysqld
sudo aa-complain /etc/apparmor.d/usr.sbin.mysqld
\`\`\`

### A minimal profile

\`\`\`apparmor
#include <tunables/global>

/usr/bin/hello {
  #include <abstractions/base>

  /usr/bin/hello r,
  /etc/hello.conf r,
  /var/lib/hello/ w,
  /var/log/hello.log w,
  network inet stream,
}
\`\`\`

The policy file uses an access-control-quoted path with permissions (\`r\` read, \`w\` write, \`x\` execute).

### Troubleshoot in complain mode

\`\`\`bash
sudo aa-complain /usr/bin/myapp
sudo tail -f /var/log/kern.log
\`\`\`

Complain mode logs would-be denials instead of blocking. Watch the log, add the flagged paths to the profile, then switch to enforce.

> **Pro tip:** SELinux and AppArmor solve the same problem — pick whichever your distro defaults to. Don't run both.

### Key recap

- AppArmor confines programs through human-readable profiles.
- \`aa-status\` lists profiles; \`aa-complain\` tests without blocking.
- Profiles grant file access in \`path permissions\` rules.
- Logs during complain mode tell you exactly what to allow.`,
    },
    {
      name: "iptables",
      minutes: 12,
      intro:
        "Hand-craft firewall rules with the classic Linux packet filter.",
      content: `## iptables

iptables is the traditional Linux firewall. Packets flow through **chains** — \`INPUT\` (incoming), \`OUTPUT\` (outgoing), \`FORWARD\` (routed) — where rules decide whether they are \`ACCEPT\`, \`DROP\`, or diverted.

### View rules

\`\`\`bash
sudo iptables -L -n -v
sudo iptables -S
\`\`\`

### Allow SSH, block the rest

\`\`\`bash
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -P INPUT DROP
sudo iptables -P OUTPUT ACCEPT
\`\`\`

-\`-A\` appends a rule, \`-p\` selects the protocol, \`--dport\` matches the destination port, \`-j\` sets the target.

### Allow established connections

Answer traffic that already opened a connection, so replies aren't dropped:

\`\`\`bash
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
\`\`\`

### Save rules permanently

Rules vanish on reboot unless saved:

\`\`\`bash
sudo netfilter-persistent save
sudo netfilter-persistent reload
\`\`\`

> **Warning:** Never \`DROP\` the \`INPUT\` chain without first allowing SSH (port 22) or a bad rule locks you out of your own server. Keep a second SSH session open when experimenting.

### Key recap

- \`-A INPUT\`, \`-p tcp\`, \`--dport\`, \`-j\` build a rule.
- Default policies with \`-P\` drop everything not explicitly allowed.
- Allow \`ESTABLISHED,RELATED\` so replies get through.
- Save rules or they're gone after reboot.`,
    },
    {
      name: "nftables",
      minutes: 11,
      intro:
        "The modern replacement for iptables with cleaner syntax and better performance.",
      content: `## nftables

nftables supersedes iptables — simpler syntax, one framework, and it's the default on modern distros like Debian 12 and Fedora.

### FLUSH old rules

If iptables rules exist, nftables won't see them. Rebuild a clean table:

\`\`\`bash
sudo nft flush ruleset
\`\`\`

### Create a table and chain

\`\`\`bash
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \\; policy drop \\; }
\`\`\`

### Basic rules

\`\`\`bash
sudo nft add rule inet filter input ct state established,related accept
sudo nft add rule inet filter input tcp dport 22 accept
sudo nft add rule inet filter input icmp type echo-request accept
\`\`\`

### List and save

\`\`\`bash
sudo nft list ruleset
sudo nft list ruleset > /etc/nftables.conf
\`\`\`

> **Key idea:** iptables and nftables both manipulate the kernel's packet-filtering netfilter subsystem — nftables just gives you a saner front end. If you're learning fresh, learn nftables.

### Key recap

- \`nft add table\` creates a namespaced ruleset.
- Tables hold \`input\`/output\`/forward chains with hook priorities.
- \`nft list ruleset\` exports rules to a file for persistence.
- nftables is the modern default; iptables remains for legacy knowledge.`,
    },
    {
      name: "fail2ban",
      minutes: 10,
      intro:
        "Ban the bots hammering SSH before they ever guess a password.",
      content: `## fail2ban

fail2ban watches authentication logs and temporarily bans IPs that fail too many times. It's the simplest win against brute-force bots that scan the internet 24/7.

### Install

\`\`\`bash
sudo apt update
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
\`\`\`

### Write a jail

Config lives in \`/etc/fail2ban/jail.local\` (the default config in \`jail.conf\` should not be edited directly):

\`\`\`ini
[DEFAULT]
bantime = 10m
maxretry = 5
findtime = 10m

[sshd]
enabled = true
backend = systemd
\`\`\`

### See bans in action

\`\`\`bash
sudo fail2ban-client status sshd
sudo fail2ban-client set sshd unbanip 203.0.113.5
\`\`\`

### Test it

\`\`\`bash
sudo fail2ban-client set sshd banip 192.0.2.10
sudo iptables -L -n | grep 192.0.2.10
\`\`\`

> **Pro tip:** Banned IPs are recorded in the ban action (usually iptables/nftables). \`fail2ban-client status sshd\` shows the currently banned addresses and their counts.

### Key recap

- fail2ban parses logs and bans repeated failures.
- Enable the \`sshd\` jail and tune \`bantime\`/\`maxretry\`.
- Combine with key-only SSH: no passwords means nothing to guess.
- \`fail2ban-client status\` verifies everything is watching.`,
    },
  ],
}