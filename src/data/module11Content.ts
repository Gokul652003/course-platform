import type { Module } from "../types"

export const module11: Module = {
  id: 11,
  title: "Advanced Linux",
  status: "upcoming",
  lessons: [
    {
      name: "Permissions deep dive",
      minutes: 10,
      intro: "Move beyond chmod basics: numeric modes, special bits, and the octal math behind every rwx.",
      content: `## Permissions deep dive

You know \`rwx\`. Now learn what those letters actually are and how octal numbers encode them.

### Everything is a number

Each permission is a bit: read (4), write (2), execute (1).

\`\`\`
r = 4
w = 2
x = 1
rwx = 4+2+1 = 7
rw- = 4+2+0 = 6
r-x = 4+0+1 = 5
--- = 0
\`\`\`

So \`chmod 750\` means owner \`rwx\`, group \`r-x\`, others \`---\`.

\`\`\`bash
ls -l script.sh
\`\`\`

Example output:

\`\`\`
-rwxr-x--- 1 alice developers 2048 Aug 06 10:00 script.sh
\`\`\`

### Apply the numbers

\`\`\`bash
chmod 755 script.sh
chmod 640 notes.txt
chmod 600 id_ed25519
\`\`\`

- \`755\` — owner can do everything, others can read and run
- \`600\` — only the owner, ideal for private keys

### The special bits

\`\`\`bash
chmod +t shared_dir
chmod u+s /usr/bin/passwd
chmod g+s /project
\`\`\`

- \`t\` (sticky) — in \`/tmp\`, only owners delete their files
- \`u+s\` (setuid) — runs with the file owner's privileges
- \`g+s\` (setgid) — files inherit the directory's group

### They show up as letters

\`\`\`bash
ls -l /usr/bin/passwd /tmp
\`\`\`

Example output:

\`\`\`
-rwsr-xr-x 1 root root 64152 Jul 15 2026 /usr/bin/passwd
drwxrwxrwt 14 root root 4096 Aug  6 09:00 /tmp
\`\`\`

> **Key idea:** \`passwd\` needs setuid to write the password file as root — that tiny \`s\` is how normal users can change their own password.

### Key recap

- Permissions are bits: r=4, w=2, x=1
- Octal modes like \`750\` map directly to \`rwx\`
- Sticky bit, setuid, and setgid are the special bits
- \`600\` is the right mode for private keys`,
    },
    {
      name: "ACLs",
      minutes: 9,
      intro: "Access control lists grant permissions to specific users or groups beyond the standard three.",
      content: `## ACLs

Standard permissions only cover one owner, one group, and "everyone else." **ACLs** (access control lists) let you give a file to *any* user or group individually.

### Check support and current ACLs

\`\`\`bash
getfacl report.txt
\`\`\`

Example output:

\`\`\`
# file: report.txt
# owner: alice
# group: developers
user::rw-
group::r--
other::r--
\`\`\`

No \`user:bob\` lines yet — just the standard permissions.

### Add an entry for one user

\`\`\`bash
setfacl -m u:bob:rw report.txt
setfacl -m g:webmasters:r report.txt
\`\`\`

Now check:

\`\`\`bash
getfacl report.txt
\`\`\`

You will see \`user:bob:rw-\` and \`group:webmasters:r--\`. Bob can edit the file even though he is not the owner.

### Remove entries

\`\`\`bash
setfacl -x u:bob report.txt
setfacl -b report.txt
\`\`\`

- \`-x\` removes one entry
- \`-b\` removes all ACL entries

### Apply to a directory tree

\`\`\`bash
setfacl -R -m u:carol:rwx /srv/shared
setfacl -d -m u:carol:rwx /srv/shared
\`\`\`

\`-R\` affects existing files, \`-d\` sets a default so new files inherit the ACL.

### The plus sign

\`\`\`bash
ls -l report.txt
\`\`\`

Example output:

\`\`\`
-rw-rw-r--+ 1 alice developers 1024 Aug 06 10:00 report.txt
\`\`\`

The trailing \`+\` means "this file has ACLs."

> **Key idea:** The group bit can't express "Bob AND Carol, but not Dave." ACLs exist exactly for that. Use them when the three standard roles are not enough.

### Key recap

- ACLs add per-user and per-group permissions
- \`setfacl -m\` adds, \`-x\` removes, \`-b\` clears
- \`getfacl\` shows the current list
- A \`+\` in \`ls -l\` means ACLs are active`,
    },
    {
      name: "File descriptors",
      minutes: 9,
      intro: "Every open file is a number the process refers to, and stdin/stdout are just descriptors 0, 1, and 2.",
      content: `## File descriptors

On Linux, "everything is a file," and processes track open files by **file descriptors** — small integers.

### The big three

Every process starts with three:

\`\`\`
0  stdin   — input (keyboard by default)
1  stdout  — output (terminal by default)
2  stderr  — errors (terminal by default)
\`\`\`

### Redirection uses them

\`\`\`bash
echo "hi" > out.txt       # stdout (1) to a file
cat missing.txt 2> err.log   # stderr (2) to a file
cat missing.txt > all.log 2>&1  # both to the same file
\`\`\`

\`2>&1\` says "make descriptor 2 point where descriptor 1 points."

### View your descriptors

\`\`\`bash
ls -l /proc/$$/fd
\`\`\`

Example output:

\`\`\`
lrwx------ 1 gokul gokul 64 Aug  6 10:00 0 -> /dev/pts/0
lrwx------ 1 gokul gokul 64 Aug  6 10:00 1 -> /dev/pts/0
lrwx------ 1 gokul gokul 64 Aug  6 10:00 2 -> /dev/pts/0
\`\`\`

Each \`$$/fd/N\` entry is a symbolic link to what that descriptor points to.

### Pipes are descriptors too

\`\`\`bash
ls -l | grep total
\`\`\`

The pipe connects \`ls\`'s stdout to \`grep\`'s stdin behind the scenes.

### Process substitution

\`\`\`bash
diff <(sort file1.txt) <(sort file2.txt)
\`\`\`

Each \`<(...)\` is presented as a special file descriptor, like \`/dev/fd/63\`.

> **Key idea:** "Everything is a file" means every open file, pipe, socket, and even the terminal is just a descriptor. Redirecting is manipulating those numbers.

### Key recap

- Descriptors 0, 1, 2 are stdin, stdout, stderr
- \`>\`, \`2>\`, and \`2>&1\` redirect them
- \`/proc/$$/fd\` shows a process's open descriptors
- Pipes and \`<(...)\` are descriptors too`,
    },
    {
      name: "Signals",
      minutes: 9,
      intro: "Signals are short kernel-to-process messages — like Ctrl+C — that tell a process to stop, pause, or reload.",
      content: `## Signals

A **signal** is a tiny message the kernel (or another process) sends to a process. It is how you tell a program to stop, pause, or re-read its config.

### The signals you already use

\`\`\`bash
# in a terminal
Ctrl+C   → SIGINT  (2)  interrupt the foreground program
Ctrl+Z   → SIGTSTP (20) pause it
kill -9 1234 → SIGKILL (9) force kill, uncatchable
kill 1234 → SIGTERM (15) politely ask it to quit
\`\`\`

### List every signal

\`\`\`bash
kill -l
\`\`\`

Example output (abridged):

\`\`\`
 1) SIGHUP       2) SIGINT    3) SIGQUIT   9) SIGKILL
15) SIGTERM     17) SIGCHLD   18) SIGCONT  20) SIGTSTP
\`\`\`

### Sending signals

\`\`\`bash
kill 1234              # SIGTERM
kill -HUP 1234         # SIGHUP — many daemons reload config
kill -9 1234           # SIGKILL — last resort
\`\`\`

\`SIGHUP\` (1) historically meant "your terminal hung up." Today many services treat it as "reload your config":

\`\`\`bash
sudo systemctl reload ssh
# is the same idea as
sudo kill -HUP $(cat /var/run/sshd.pid)
\`\`\`

### Watch what happens

\`\`\`bash
sleep 300 &
kill %1
jobs
\`\`\`

- \`&\` runs a job in the background
- \`kill %1\` targets job number 1
- \`jobs\` lists background jobs

> **Pro tip:** Prefer \`SIGTERM\` first — it lets a program save state. \`SIGKILL\` cannot be caught, so files can be left corrupt. Reach for \`kill -9\` only when the process ignores everything.

### Key recap

- Signals are kernel-to-process messages
- \`Ctrl+C\` sends SIGINT, \`Ctrl+Z\` sends SIGTSTP
- \`kill -15\` is graceful, \`kill -9\` is forced
- \`SIGHUP\` commonly reloads daemon configs`,
    },
    {
      name: "strace",
      minutes: 10,
      intro: "strace reveals every system call a program makes — the ultimate tool for understanding what a program does.",
      content: `## strace

A program talks to the kernel through **system calls**. \`strace\` records every single one — think of it as wiretapping your own program.

### Trace a command

\`\`\`bash
strace -c ls
\`\`\`

The \`-c\` flag gives a summary instead of the full flood:

\`\`\`
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 61.2    0.000712         711         1           statfs
 23.4    0.000272          10        27           getdents64
  7.4    0.000086          43         2           write
------ ----------- ----------- --------- --------- ----------------
100.00    0.001163                   127        13 total
\`\`\`

### See the actual calls

\`\`\`bash
strace cat /etc/hostname
\`\`\`

Example output (abridged):

\`\`\`
openat(AT_FDCWD, "/etc/hostname", O_RDONLY) = 3
read(3, "web-server\n", 8192)         = 11
write(1, "web-server\n", 11)          = 11
close(3)                               = 0
\`\`\`

You can see it open the file (descriptor 3), read it, write it to stdout, and close it.

### Follow child processes

\`\`\`bash
strace -f -o /tmp/trace.log ./server
\`\`\`

- \`-f\` follows forks
- \`-o\` writes the trace to a file

### Attach to a running process

\`\`\`bash
sudo strace -p 1234
\`\`\`

This watches a live process. Press \`Ctrl+C\` to detach.

### Filter by syscall

\`\`\`bash
strace -e trace=open,read,write ls
\`\`\`

> **Pro tip:** When a program fails in a confusing way, trace it. You will see the exact file it tried to open and the error code, which beats guessing from the error message.

### Key recap

- \`strace\` logs every system call
- \`-c\` summarizes, plain mode shows each call
- \`-p\` attaches to a running process
- It reveals the exact file, descriptor, and error a program hits`,
    },
    {
      name: "lsof",
      minutes: 8,
      intro: "lsof lists open files and the processes that hold them — essential when a file or port is mysteriously busy.",
      content: `## lsof

\`lsof\` stands for **list open files**. Since nearly everything on Linux is a file, it shows files, sockets, and pipes — and which process holds them.

### List everything

\`\`\`bash
lsof | wc -l
\`\`\`

This prints how many open files exist system-wide. On a busy server that can be thousands.

### Which process holds a file?

\`\`\`bash
lsof /var/log/syslog
\`\`\`

Example output:

\`\`\`
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
rsyslogd 592 root    1w   REG    8,2    12345   12 /var/log/syslog
\`\`\`

### Which process owns a port?

\`\`\`bash
lsof -i :80
\`\`\`

Example output:

\`\`\`
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nginx    1234 root    6u  IPv4  56432      0t0  TCP *:http (LISTEN)
\`\`\`

This is the classic answer to "what is using port 80?"

### Who deleted the file but still writes it?

\`\`\`bash
lsof +L1
\`\`\`

\`+L1\` shows files with no link — deleted files that processes still hold open, which fill up your disk until the process closes them.

### All files for one user or process

\`\`\`bash
lsof -u gokul
lsof -p 1234
\`\`\`

> **Key idea:** "Port 80 is already in use" is lsof's favorite problem. Run \`lsof -i :80\` and you instantly know which process to investigate.

### Key recap

- \`lsof\` lists open files and their owning processes
- \`lsof -i :PORT\` finds who uses a port
- \`lsof FILE\` finds who has a file open
- \`+L1\` reveals deleted-but-open files eating disk`,
    },
    {
      name: "tar",
      minutes: 8,
      intro: "tar bundles many files into one archive and is the standard format for distributing Linux software.",
      content: `## tar

\`tar\` (tape archive) joins many files into a single file — ideal for backups and downloads. You will see \`.tar.gz\` everywhere.

### Create an archive

\`\`\`bash
tar -cvf backup.tar /home/alice/docs
\`\`\`

- \`c\` create
- \`v\` verbose — list each file
- \`f\` use the filename that follows

### Extract an archive

\`\`\`bash
tar -xvf backup.tar
\`\`\`

\`x\` extracts. Without \`f\`, tar reads or writes a device — so never forget \`f\`.

### The ubiquitous .tar.gz

Most downloads are \`.tar.gz\` — a tar archive compressed with gzip. Add \`z\`:

\`\`\`bash
tar -czvf app.tar.gz /home/alice/app
tar -xzvf app.tar.gz
\`\`\`

\`j\` does the same with bzip2 (\`.tar.bz2\`), \`J\` with xz (\`.tar.xz\`).

### Look inside without extracting

\`\`\`bash
tar -tvf app.tar.gz
\`\`\`

Example output (abridged):

\`\`\`
drwxr-xr-x alice/alice     0 2026-08-06 10:00 app/
-rw-r--r-- alice/alice  2048 2026-08-06 10:00 app/main.js
\`\`\`

### Extract to a specific directory

\`\`\`bash
tar -xzf app.tar.gz -C /opt/
\`\`\`

> **Key idea:** \`tar -czvf\` create, \`tar -xzvf\` extract. \`c\` for compress, \`x\` for extract, \`z\` for gzip, \`f\` for file — the letters read like a checklist.

### Key recap

- \`c\` create, \`x\` extract, \`t\` list, \`v\` verbose, \`f\` file
- \`z\` adds gzip compression
- \`-C\` extracts into a target directory
- \`.tar.gz\` is tar plus gzip in one file`,
    },
    {
      name: "gzip",
      minutes: 6,
      intro: "gzip compresses single files with fast, standard compression — and gzip -d restores them.",
      content: `## gzip

\`gzip\` compresses a single file, adding a \`.gz\` suffix. It works on one file at a time; that is why tar exists to bundle many files first.

### Compress a file

\`\`\`bash
gzip access.log
ls -lh access.log.gz
\`\`\`

Example output:

\`\`\`
-rw-r--r-- 1 alice alice 112K Aug  6 10:00 access.log.gz
\`\`\`

The original \`access.log\` is replaced. \`-k\` keeps it:

\`\`\`bash
gzip -k access.log
\`\`\`

### Decompress

\`\`\`bash
gzip -d access.log.gz
gunzip access.log.gz
\`\`\`

Both commands do the same thing and restore \`access.log\`.

### Compression level

\`\`\`bash
gzip -1 file   # fastest, least compression
gzip -9 file   # slowest, most compression
\`\`\`

The default is \`-6\` — a good middle ground.

### Read without decompressing

\`\`\`bash
zcat access.log.gz | head -5
zcat access.log.gz | grep 404
zgrep "404" access.log.gz
\`\`\`

\`zcat\` and \`zgrep\` read compressed files directly, saving disk space and time.

### Compare tools

\`\`\`bash
gzip -l access.log.gz
\`\`\`

Example output:

\`\`\`
  compressed uncompressed  ratio uncompressed_name
      112K        512K  78.1%   access.log
\`\`\`

> **Key idea:** gzip compresses one file; tar packs many files; together they form \`.tar.gz\`. Use \`-k\` while learning so you don't lose originals.

### Key recap

- \`gzip\` compresses a single file to \`file.gz\`
- \`gzip -d\` / \`gunzip\` decompress
- \`-1\` to \`-9\` trade speed for size
- \`zcat\` and \`zgrep\` read \`.gz\` files directly`,
    },
    {
      name: "zip",
      minutes: 6,
      intro: "zip bundles and compresses files into one portable archive that works across every operating system.",
      content: `## zip

Unlike tar + gzip, \`zip\` does both jobs at once: it bundles many files **and** compresses them into one \`.zip\` file.

### Create a zip

\`\`\`bash
zip -r site.zip /home/alice/site
\`\`\`

- \`-r\` recurse into subdirectories — without it, folders are skipped

### Zip specific files

\`\`\`bash
zip docs.zip readme.txt notes.md
\`\`\`

### List and test contents

\`\`\`bash
unzip -l docs.zip
unzip -t docs.zip
\`\`\`

Example output from \`-l\`:

\`\`\`
Archive:  docs.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     2048  2026-08-06 10:00   readme.txt
     5120  2026-08-06 10:00   notes.md
---------                     -------
     7168                     2 files
\`\`\`

### Extract

\`\`\`bash
unzip docs.zip
unzip docs.zip -d /tmp/restored
\`\`\`

\`-d\` sends everything to a target directory.

### Add or remove files later

\`\`\`bash
zip docs.zip -u newfile.md
zip docs.zip -d oldfile.md
\`\`\`

- \`-u\` updates or adds
- \`-d\` deletes from the archive

### Protect with a password

\`\`\`bash
zip -e secret.zip data.csv
\`\`\`

> **Key idea:** zip is the interoperable choice — Windows, macOS, and Linux all open \`.zip\` natively. For pure Linux work, \`.tar.gz\` often compresses smaller.

### Key recap

- \`zip -r\` bundles and compresses in one step
- \`unzip\` extracts, \`-l\` lists, \`-t\` tests
- \`-u\` and \`-d\` update and remove entries
- \`-e\` encrypts with a password`,
    },
    {
      name: "sed",
      minutes: 10,
      intro: "sed is a stream editor that transforms text line by line — perfect for find-and-replace across files.",
      content: `## sed

**sed** (stream editor) reads text line by line, applies edits, and prints the result. It is the classic tool for find-and-replace.

### Substitute text

\`\`\`bash
echo "hello world" | sed 's/hello/hi/'
\`\`\`

Example output:

\`\`\`
hi world
\`\`\`

\`s/old/new/\` replaces the first match per line. Add \`g\` for every match:

\`\`\`bash
echo "a a a" | sed 's/a/b/g'
\`\`\`

\`\`\`
b b b
\`\`\`

### Edit a file in place

\`\`\`bash
sed -i 's/old/config/g' settings.conf
\`\`\`

\`-i\` writes changes back to the file. Add a backup suffix to be safe:

\`\`\`bash
sed -i.bak 's/old/config/g' settings.conf
\`\`\`

### Delete lines

\`\`\`bash
sed '/^#/d' config.conf
\`\`\`

\`/^#/d\` deletes every line starting with a hash — stripping comments while printing the rest.

### Print matching lines only

\`\`\`bash
sed -n '/error/p' app.log
\`\`\`

- \`-n\` suppresses default printing
- \`p\` prints only matching lines

### Using a different delimiter

When text contains slashes, use another delimiter:

\`\`\`bash
sed 's|/usr/local|/opt|g' paths.txt
\`\`\`

> **Key idea:** \`s/old/new/\` + \`-i\` is the killer combo — scriptable find-and-replace without opening an editor. Always test without \`-i\` first.

### Key recap

- \`sed 's/old/new/g'\` replaces text
- \`-i\` edits files in place, \`-i.bak\` backs up first
- \`/pattern/d\` deletes lines, \`-n\` + \`/pattern/p\` prints matches
- A different delimiter like \`|\` avoids escaping slashes`,
    },
    {
      name: "awk",
      minutes: 11,
      intro: "awk is a full programming language for processing columns of text — more powerful than cut.",
      content: `## awk

**awk** treats text as rows (records) of columns (fields). It is small but surprisingly powerful — ideal for parsing command output.

### Print specific columns

\`\`\`bash
awk '{print $1, $3}' /etc/passwd
\`\`\`

Fields are split on whitespace: \`$1\` is the first column, \`$2\` the second, and \`$0\` the whole line. In \`/etc/passwd\` the username is field 1.

### Custom field separator

\`\`\`bash
awk -F: '{print $1, $7}' /etc/passwd
\`\`\`

\`-F:\` splits on colons instead of whitespace, so \`$1\` is the username and \`$7\` the login shell.

### Filter rows with a condition

\`\`\`bash
awk -F: '$7 == "/bin/bash" {print $1}' /etc/passwd
awk '$2 > 1000 {print $1, $2}' numbers.txt
\`\`\`

The condition before the braces decides which lines print.

### Sum a column

\`\`\`bash
awk '{sum += $1} END {print sum}' sales.txt
\`\`\`

- statements run for every line
- the \`END\` block runs once, after all lines

### Count and average

\`\`\`bash
awk '{sum += $1; n++} END {print sum/n}' sales.txt
\`\`\`

### A real-world example

\`\`\`bash
free -m | awk '/Mem/ {print $3 " MB in use"}'
\`\`\`

Example output:

\`\`\`
1523 MB in use
\`\`\`

It finds the \`Mem\` line and prints the used-memory column.

> **Key idea:** awk's skeleton is \`awk 'condition {action}'\`. Master that plus the field variables, and you can slice almost any command output.

### Key recap

- \`$1\`, \`$2\`, \`$0\` address columns and whole lines
- \`-F:\` changes the field separator
- \`condition {action}\` filters and processes rows
- \`END\` runs once after the final line`,
    },
    {
      name: "Advanced grep",
      minutes: 9,
      intro: "Grep goes beyond simple searches with extended regex, context lines, and recursive whole-tree searches.",
      content: `## Advanced grep

You know \`grep pattern file\`. Here is how grep becomes a power tool for the command line.

### Recursive search

Search an entire tree for a pattern:

\`\`\`bash
grep -r "FIXME" src/
grep -ri "TODO" src/
\`\`\`

\`-r\` recurses into subdirectories, \`-i\` ignores case.

### Show context

\`\`\`bash
grep -B2 "error" app.log   # 2 lines before
grep -A3 "error" app.log   # 3 lines after
grep -C2 "error" app.log   # 2 lines around
\`\`\`

### Extended regular expressions

With plain grep, \`|\` and \`+\` are literal. \`-E\` unlocks them:

\`\`\`bash
grep -E "error|fatal|panic" app.log
grep -E "^[0-9]{4}-" dates.txt
\`\`\`

- \`a|b\` matches a or b
- \`[0-9]{4}\` matches four digits

### Count matches

\`\`\`bash
grep -c "error" app.log
\`\`\`

Example output:

\`\`\`
17
\`\`\`

\`-c\` counts matching lines, not total matches. Use \`-o\` to see each match:

\`\`\`bash
grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" app.log | wc -l
\`\`\`

This counts every IP address that appears.

### Invert and only-list

\`\`\`bash
grep -v "^#" config.conf    # lines NOT starting with #
grep -rl "secret" /etc      # only filenames with matches
\`\`\`

- \`-v\` inverts the match
- \`-l\` prints filenames only

> **Key idea:** \`grep -rniE\` is the Swiss-army combo: recursive, case-insensitive, show line numbers, extended regex. Memorize that one string and you win.

### Key recap

- \`-r\` searches recursively, \`-i\` ignores case
- \`-E\` enables extended regex like \`|\`
- \`-B\`, \`-A\`, \`-C\` add context lines
- \`-v\` inverts, \`-l\` lists filenames, \`-o\` prints each match`,
    },
    {
      name: "systemd",
      minutes: 10,
      intro: "systemd is PID 1 — the init system that starts everything, managed through unit files.",
      content: `## systemd

\`systemd\` is the **init system** — the first process at boot (PID 1) that starts and supervises everything else. You manage it with \`systemctl\`.

### Units

systemd manages **units**: services (\`.service\`), mounts (\`.mount\`), timers (\`.timer\`), sockets, and more. A unit file describes one thing.

\`\`\`bash
systemctl list-units --type=service
\`\`\`

### Anatomy of a unit file

\`\`\`bash
cat /etc/systemd/system/myapp.service
\`\`\`

Example:

\`\`\`
[Unit]
Description=My demo app
After=network.target

[Service]
ExecStart=/usr/local/bin/myapp
Restart=on-failure

[Install]
WantedBy=multi-user.target
\`\`\`

- \`[Unit]\` — description and ordering (\`After=\`)
- \`[Service]\` — how to run the process and when to restart it
- \`[Install]\` — which target links to it at boot

### The command-line toolkit

\`\`\`bash
sudo systemctl start myapp
sudo systemctl enable myapp
sudo systemctl restart myapp
systemctl status myapp
\`\`\`

### Targets instead of runlevels

Old Linux used runlevels. systemd uses **targets** — named groups of units:

\`\`\`bash
systemctl get-default
systemctl isolate multi-user.target
\`\`\`

\`graphical.target\` gives you the desktop; \`multi-user.target\` is a headless server.

### Timers

systemd timers are a modern replacement for cron:

\`\`\`bash
systemctl list-timers
\`\`\`

> **Key idea:** systemd runs the show: it is PID 1, reads unit files in \`/etc/systemd/system\`, and \`systemctl\` is your single control point for everything.

### Key recap

- systemd is PID 1, the init system
- \`systemctl\` manages units
- Unit files have \`[Unit]\`, \`[Service]\`, and \`[Install]\` sections
- Targets group units and replace runlevels`,
    },
    {
      name: "Kernel basics",
      minutes: 10,
      intro: "The kernel manages processes, memory, and drivers — and a few commands let you see what it is doing.",
      content: `## Kernel basics

The **kernel** is the core of Linux: it schedules processes, manages memory, and talks to hardware. Userspace is just programs asking the kernel for things.

### Find your kernel version

\`\`\`bash
uname -r
\`\`\`

Example output:

\`\`\`
6.8.0-1014-aws
\`\`\`

### Processes

When you run a program, the kernel creates a **process** with a PID and schedules CPU time for it:

\`\`\`bash
ps aux --sort=-%mem | head
top
\`\`\`

\`\`\`
  PID USER      %CPU %MEM    RSS   COMMAND
 1234 gokul      1.2  0.5  2456k  firefox
\`\`\`

### Memory

The kernel keeps each process in its own virtual memory space, so one program cannot corrupt another. See real usage:

\`\`\`bash
free -h
\`\`\`

Example output:

\`\`\`
              total        used        free
Mem:          7.7Gi       3.1Gi       3.6Gi
Swap:         2.0Gi          0B       2.0Gi
\`\`\`

### Hardware and drivers

Drivers live in the kernel or as **modules** that can be loaded on demand:

\`\`\`bash
lsmod | head
lsusb
lspci
\`\`\`

\`lsmod\` lists loaded kernel modules, \`lsusb\` and \`lspci\` list hardware.

### Kernel messages

The kernel reports problems through the ring buffer:

\`\`\`bash
dmesg | tail -20
journalctl -k
\`\`\`

### Where kernel files live

\`\`\`bash
ls /boot
\`\`\`

Example output:

\`\`\`
vmlinuz-6.8.0-1014-aws  initrd.img-6.8.0-1014-aws
\`\`\`

\`vmlinuz\` is the compressed kernel image; \`initrd\` is the initial filesystem used during boot.

> **Key idea:** You do not write to the kernel — you ask it through system calls. Tools like \`ps\`, \`free\`, and \`dmesg\` are just windows showing what the kernel already knows.

### Key recap

- \`uname -r\` shows the kernel version
- The kernel schedules processes, memory, and drivers
- \`ps\`, \`free\`, \`lsmod\`, and \`dmesg\` inspect it
- The boot image lives in \`/boot\` as \`vmlinuz\``,
    },
  ],
}
