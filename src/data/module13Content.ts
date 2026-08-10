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
    {
      name: "auditd",
      minutes: 10,
      intro:
        "Log every file access and system call to know exactly who did what, when.",
      content: `## auditd

The Linux Audit daemon records system events — who read a file, who ran a command, what authentication failed — and writes them to \`/var/log/audit/audit.log\`.

### Install and start

\`\`\`bash
sudo apt install -y auditd
sudo systemctl enable --now auditd
sudo auditctl -s
\`\`\`

### Watch a file

\`\`\`bash
sudo auditctl -w /etc/ssh/sshd_config -p wa -k sshd_config
\`\`\`

- \`-w\` watch path, \`-p wa\` audit write+attribute changes, \`-k\` adds a searchable key

### Watch a directory recursively

\`\`\`bash
sudo auditctl -w /etc/nginx/ -p rwxa -k nginx
\`\`\`

### Search the log

\`\`\`bash
sudo ausearch -k sshd_config
sudo ausearch -m USER_LOGIN -ts today
sudo auvirt --summary
\`\`\`

### Make watches permanent

Add them to \`/etc/audit/rules.d/audit.rules\` and restart:

\`\`\`bash
sudo systemctl restart auditd
sudo auditctl -l
\`\`\`

> **Key idea:** auditd answers the "who, what, when" questions. It's how you prove a config was edited after the fact — pair watches with a backup and you can always diff what changed.

### Key recap

- \`auditctl -w path -p wa -k key\` watches files and dirs.
- \`ausearch\` queries the audit log by key, event type, or time.
- Persist rules in \`/etc/audit/rules.d/\`.
- It records writes, reads, and attribute changes for forensic review.`,
    },
    {
      name: "GPG & encryption",
      minutes: 12,
      intro:
        "Encrypt files, folders, and messages, and verify downloads with digital signatures.",
      content: `## GPG & encryption

GPG (GNU Privacy Guard) brings public-key cryptography to your terminal: encrypt files for someone, sign messages, and verify that downloaded software is genuine.

### Generate a key pair

\`\`\`bash
gpg --full-generate-key
gpg --list-keys
\`\`\`

You now own a **private key** (kept in \`~/.gnupg/\`) and a **public key** you can share.

### Encrypt a file for someone

\`\`\`bash
gpg --encrypt --recipient alice@example.com secret.txt
# creates secret.txt.gpg — unreadable without Alice's private key
\`\`\`

### Decrypt

\`\`\`bash
gpg --decrypt secret.txt.gpg
gpg --decrypt secret.txt.gpg > secret.txt
\`\`\`

### Sign a file to prove it's from you

\`\`\`bash
gpg --clearsign message.txt
gpg --verify message.txt.asc
\`\`\`

### Verify software downloads

Projects publish a \`.asc\` signature. Fetch the author's public key, then verify it matches your download:

\`\`\`bash
gpg --verify file.tar.gz.asc file.tar.gz
\`\`\`

> **Warning:** Encrypting is easy; losing the private key is permanent. Back up \`~/.gnupg/\` and remember your passphrase — there is no recovery mechanism.

### Key recap

- \`gpg --full-generate-key\` creates the key pair.
- \`--encrypt\`/\`--decrypt\` scramble and restore files.
- \`--sign\`/\`--verify\` prove authorship and integrity.
- Public keys only encrypt and verify; private keys decrypt and sign.`,
    },
    {
      name: "Hashing & integrity",
      minutes: 10,
      intro:
        "Use hashes to fingerprint files and AIDE to catch unauthorized changes.",
      content: `## Hashing & integrity

A hash is a fixed-length fingerprint of a file. Change one byte and the fingerprint changes completely — which makes hashes perfect for detecting tampering.

### Hash a file

\`\`\`bash
sha256sum backup.iso
md5sum app.tar.gz
\`\`\`

Example output:

\`\`\`
e3b0c44298fc1c149afbf4c8996fb...  backup.iso
\`\`\`

### Verify a download

Compare the hash the maintainer published with yours:

\`\`\`bash
echo "e3b0c442...  backup.iso" | sha256sum -c
\`\`\`

### Mass-monitor with AIDE

AIDE snapshots your filesystem, then reports any deviation:

\`\`\`bash
sudo apt install -y aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
\`\`\`

### Run a check

\`\`\`bash
sudo aide.wrapper --check
\`\`\`

A fresh report shows no changes. Later runs flag anything that was added, removed, or modified — substitute it for a nightly expectation.

> **Key idea:** A hash tells you nothing by itself; it's the *comparison* that matters. Keep the trusted fingerprint somewhere safe (publisher's site, previous snapshot), then spot the difference.

### Key recap

- \`sha256sum\`/\`md5sum\` produce file fingerprints.
- Hash-and-compare catches corrupted or tampered downloads.
- AIDE keeps a database of the filesystem and flags changes.
- Schedule AIDE nightly and review the report for surprises.`,
    },
    {
      name: "Network hardening",
      minutes: 10,
      intro:
        "Lock down the network surface: listen addresses, ports, and kernel protections.",
      content: `## Network hardening

Attackers can only reach what's exposed. Shrinking your listening surface is the cheapest security there is.

### See everything open

\`\`\`bash
ss -tulpn
\`\`\`

Only SSH (22) and web (80/443) should answer on the public interface.

### Bind to localhost, not 0.0.0.0

Services with no internet purpose should listen on 127.0.0.1 only:

\`\`\`ini
# e.g. in /etc/postgresql/*/main/postgresql.conf
listen_addresses = '127.0.0.1'
\`\`\`

### Use a host firewall

\`\`\`bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

### Kernel network protections

\`\`\`ini
# /etc/sysctl.d/99-netsec.conf
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
\`\`\`

Apply with \`sudo sysctl -p\`.

### Disable unused services

\`\`\`bash
sudo systemctl list-unit-files --state=enabled
sudo systemctl disable --now cups-browsed telnet.socket
\`\`\`

> **Pro tip:** Do an audit once a week: \`ss -tulpn\`, \`sudo ufw status\`, and \`systemctl list-unit-files --state=enabled\`. Exposed ports and enabled-but-unused daemons drift back in over time.

### Key recap

- \`ss -tulpn\` reveals every listening socket.
- Bind internal services to 127.0.0.1 and firewall the rest.
- Kernel sysctls block spoofing and broadcast abuse.
- Prune enabled daemons you don't use.`,
    },
    {
      name: "Security auditing",
      minutes: 11,
      intro:
        "Automate the hunt for weak users, open ports, and outdated packages.",
      content: `## Security auditing

Hardening is one-off; auditing is the discipline that keeps it that way. Here are the checks you can run today.

### Outdated packages

\`\`\`bash
sudo apt update && sudo apt list --upgradable
sudo unattended-upgrade --dry-run
\`\`\`

### World-writable and suid files

\`\`\`bash
find / -xdev -perm -002 -type f -exec ls -la {} \\; 2>/dev/null
find / -xdev -perm -4000 -exec ls -la {} \\; 2>/dev/null
\`\`\`

SUID binaries run with the owner's privileges — know every one that exists.

### Users with empty passwords

\`\`\`bash
sudo passwd -S "$(whoami)"
awk -F: '($2 == "" ) {print $1}' /etc/shadow
sudo awk -F: '($3 == 0) {print $1}' /etc/passwd
\`\`\`

### Open ports from outside

\`\`\`bash
nmap -sV YOUR_SERVER_IP
\`\`\`

### Password policy

\`\`\`bash
sudo apt install -y libpam-pwquality
sudo nano /etc/pam.d/common-password
\`\`\`

Set \`minlen=12 minclass=3\` to require length and mixed character classes.

> **Key idea:** An audit is a checklist you automate and review. Turn each check into a script, run it weekly, and look at the diff. The boring regularity is the point.

### Key recap

- Check for unpatched, upgradable packages regularly.
- Audit SUID binaries and world-writable files.
- No empty passwords; no extra UID-0 accounts.
- Use nmap from outside to confirm the firewall.
- Enforce strong passwords via libpam-pwquality.`,
    },
  ],
}