import type { Module } from "../types"

export const module5: Module = {
  id: 5,
  title: "Process Management",
  status: "upcoming",
  lessons: [
    {
      name: "ps",
      minutes: 9,
      intro:
        "Take a snapshot of the running processes with the ps command.",
      content: `## Snapshotting Processes with ps

### What it does

\`ps\` prints a **snapshot** of the current processes. Unlike \`top\`, it does not refresh — you capture a moment in time.

\`\`\`bash
ps
\`\`\`

Example output:

\`\`\`
  PID TTY          TIME CMD
 4321 pts/0    00:00:00 bash
 4400 pts/0    00:00:01 ps
\`\`\`

### Column meanings

- \`PID\` — process ID, the number that identifies each process
- \`TTY\` — the terminal it is attached to
- \`TIME\` — accumulated CPU time
- \`CMD\` — the command that started it

### See every process

\`ps\` alone only shows your terminal's processes. To see all processes for every user:

\`\`\`bash
ps aux
\`\`\`

- \`a\` — all users
- \`u\` — show the owner and CPU/memory usage
- \`x\` — include processes with no terminal

Example output:

\`\`\`
USER  PID %CPU %MEM  VSZ  RSS TTY STAT START TIME COMMAND
root    1  0.0  0.1 168596 13920 ?  Ss   08:00 0:01 /sbin/init
gokul 2456 12.5  2.1 1234  56000 ?  Sl   09:12 0:34 /usr/bin/firefox
\`\`\`

### Watch a specific process

\`\`\`bash
ps -p 2456
\`\`\`

The \`-p\` flag shows only the process with a given PID.

> **Key idea:** \`ps aux\` is the classic one-liner for "what is running on this machine?" Combine it with \`grep\` to filter: \`ps aux | grep firefox\`.

### Key recap

- \`ps\` prints a snapshot of running processes.
- \`ps aux\` shows all processes for all users.
- \`PID\` and \`COMMAND\` are the columns you care about most.
`,
    },
    {
      name: "top",
      minutes: 9,
      intro:
        "Watch running processes live with a refreshing, interactive view.",
      content: `## Watching Processes Live with top

### What it does

\`top\` shows a **live, refreshing** list of processes sorted by CPU use. It updates every couple of seconds, making it ideal for finding what is slowing things down.

\`\`\`bash
top
\`\`\`

### The header

The first few lines summarize the whole system:

- number of tasks and states
- CPU breakdown (\`us\`, \`sy\`, \`id\` for user, system, idle)
- memory used and free
- load average

### The process list

Each row is a process with columns like:

- \`PID\` — process id
- \`%CPU\` — percent of CPU in use
- \`%MEM\` — percent of RAM in use
- \`COMMAND\` — the program name

### Interactive keys

While \`top\` is running, press keys to change it:

- \`q\` — quit
- \`Shift+M\` — sort by memory instead of CPU
- \`Shift+P\` — sort by CPU again
- \`k\` — kill a process (enter its PID)
- \`Shift+H\` — toggle thread view

### A real moment

\`\`\`bash
top
\`\`\`

Example (partial) output:

\`\`\`
top - 09:30:00 up 3 days,  2:10,  2 users,  load average: 0.20
Tasks: 180 total,   1 running, 179 sleeping
Mem:  7.7G total, 3.1G used, 4.6G free

  PID    USER  %CPU  %MEM COMMAND
 2456   gokul  45.0  5.1  firefox
 3120    root   2.5  0.4  sshd
\`\`\`

> **Key Idea:** \`top\` sorts by the busiest processes by default. If something is eating your machine, \`top\` tells you its \`PID\` and command — the first step to stopping it.

### Key recap

- \`top\` gives a live, refreshing process view.
- Sort by CPU (\`Shift+P\`) or memory (\`Shift+M\`).
- Press \`q\` to quit and \`k\` to kill a process.
`,
    },
    {
      name: "htop",
      minutes: 8,
      intro:
        "A friendlier, color-coded, mouse-friendly process viewer.",
      content: `## htop

### What it does

\`htop\` is an interactive, color coded process viewer. It is friendlier than \`top\`, with clearer output and navigation.

\`\`\`bash
htop
\`\`\`

### What makes it nicer

- CPU and memory bars per core at the top
- easy scrolling up and down through processes
- color-coded columns for CPU and memory
- search with \`F3\`
- sort with \`F6\`
- call-by-name process search

### Common keys

- \`F3\` — search
- \`F5\` — tree view
- \`F6\` — choose sort column
- \`F9\` — kill the highlighted process
- \`q\` — quit

### Why use it over top

| pro | |
|-----|------|
| color | easier to scan |
| sort | click columns with \`F6\` |
| kill | \`F9\` without typing a PID |

### Install if missing

\`\`\`bash
sudo apt install htop
\`\`\`

> **Pro Tip:** htop is not preinstalled on every minimal server image, so \`htop\` may be missing while \`top\` is always there. It is a judgement-free upgrade for daily process work.

### Key recap

- \`htop\` is an interactive, colorizing process viewer.
- Use \`F3\` search, \`F5\` tree view, \`F9\` to kill.
- Install it with your package manager if it is missing.
`,
    },
    {
      name: "kill",
      minutes: 8,
      intro:
        "Send signals to a process by its PID to stop or control it.",
      content: `## Sending Signals: kill

### What it does

\`kill\` **sends a signal** to a process identified by its \`PID\`. Despite the name, it is not always about destroying the process — the default signal asks it to end gracefully.

### Find the PID first

\`\`\`bash
ps aux | grep firefox
\`\`\`

Example output:

\`\`\`
gokul 3001 ... firefox
\`\`\`

### Terminate gracefully

\`\`\`bash
kill 3001
\`\`\`

This sends \`SIGTERM\` (signal 15), the default. The program gets a chance to save work and close cleanly.

### Force it hard

If the process ignores \`SIGTERM\`, escalate:

\`\`\`bash
kill -9 3001
\`\`\`

\`-9\` sends \`SIGKILL\`, which the kernel enforces immediately — no chance to clean up.

### List all signals

\`\`\`bash
kill -l
\`\`\`

### A few common signals

- \`SIGTERM\` (15) — request to stop; default
- \`SIGKILL\` (9) — force kill immediately
- \`SIGHUP\` (1) — hang up, often restarts daemons
- \`SIGSTOP\` (19) — pause a process

> **Warning:** Prefer \`kill\` (SIGTERM) and let the program close itself. Reserve \`kill -9\` for processes that refuse to die — a forced kill can leave files in a bad state.

### Key recap

- \`kill PID\` sends SIGTERM by default.
- \`kill -9 PID\` forces a kill.
- Find the PID with \`ps aux | grep\`.
`,
    },
    {
      name: "killall",
      minutes: 7,
      intro:
        "Terminate every process that matches a command name.",
      content: `## Stopping by Name with killall

### What it does

\`killall\` sends a signal to **every process with a matching name**, so timing does not need a PID lookup.

\`\`\`bash
killall firefox
\`\`\`

This sends \`SIGTERM\` to all firefox processes.

### Force with name

\`\`\`bash
killall -9 firefox
\`\`\`

Sends \`SIGKILL\` to all of them at once.

### Same signals, name-based

- \`killall firefox\` — SIGTERM to all firefox
- \`killall -9 firefox\` — SIGKILL to all firefox
- \`killall -u gokul\` — signal all processes owned by a user

\`\`\`bash
killall -u gokul
\`\`\`

### kill vs killany

| utilities |   how |
|-----------|-------|
| \`kill\` | needs the exact PID |
| \`killall\` | matches by the process name |

Example output

\`\`\`bash
killall ping
\`\`\`

There is no output when it works; with all processes gone, all the ping instances are ended at once.

> **Pro Tip:** Running \`killall\` without arguments stops all processes of the user — that deletes every session at once. Be explicit with a name to avoid this.

### Key recap

- \`killall NAME\` signal every matching process.
- \`killall -9 NAME\` forces those processes.
- Useful over \`kill\` when you do not know or will get the PID.
`,
    },
    {
      name: "pkill",
      minutes: 7,
      intro:
        "Signal processes by name or a pattern without hunting PIDs.",
      content: `## Signal by Name or Pattern: pkill

### What it does

\`pkill\` sends a signal to processes **matching a name or pattern**. It is like a quick killall, but it also supports search patterns.

\`\`\`bash
pkill firefox
\`\`\`

Sends \`SIGTERM\` to all processes named firefox.

### Match a pattern

\`pkill\` matches the process name as a regex, so a partial name can match more than intended:

\`\`\`bash
pkill node
\`\`\`

Careful: \`pkill node\` matches every process whose name contains \`node\`, not just the Node.js runtime.

### Show what you would match

\`\`\`bash
pgrep -l node
\`\`\`

Use \`pgrep\` to preview which PIDs match before killing them.

### Force

\`\`\`bash
pkill -9 firefox
\`\`\`

Forcibly sends \`SIGKILL\` to the matches.

> **Warned:** \`pkill\` pattern matches can catch unintended processes. When in doubt run \`pgrep -l TERM\` (here the pattern) first to preview.

### Key recap

1. \`pkill NAME\` signals every matching process.
2. Patterns can overmatch; \`pgrep -l\` previews them.
3. \`pkill -9 NAME\` sends SIGKILL.
`,
    },
    {
      name: "jobs",
      minutes: 7,
      intro:
        "Track jobs running inside your current shell session.",
      content: `## Tracking Jobs with jobs

### What it does

\`jobs\` lists the **background and suspended jobs** of the current shell session.

Run a command and send it to the background with an ampersand:

\`\`\`bash
sleep 100 &
\`\`\`

Example output:

\`\`\`
[1] 5566
\`\`\`

The \`[1]\` is the job number and \`5566\` is the PID.

### See the job list

\`\`\`bash
jobs
\`\`\`

Example output:

\`\`\`
[1]+  Running               sleep 100 &
\`\`\`

### Bring a job back to the foreground

\`\`\`bash
fg %1
\`\`\`

The \`%1\` refers to job 1.

### Suspend and resume

- \`Ctrl+Z\` suspends the current foreground job.
- \`bg %1\` resumes a suspended job in the background.
- \`fg %1\` resumes it in the foreground.

\`\`\`bash
sleep 30
# press Ctrl+Z -> stops
bg %1
# continues in background
\`\`\`

> **Key idea:** Jobs are the same inside one bash session. If you close the shell or hop to another, the job list disappears, yet the processes can still be running on the system.

### Key recap

1. \`jobs\` lists shell background and suspended jobs.
2. \`fg %N\` brings a job to foreground.
3. \`Ctrl+Z\` suspends; \`bg %N\` resumes in background.
`,
    },
    {
      name: "Background processes (&)",
      minutes: 7,
      intro:
        "Run a command in the background so the terminal stays for you.",
      content: `## Background processes (&)

### The problem

A long command blocks the terminal. While it runs, you cannot type anything else. The solution is to send it to the **background**.

### Send to background with &

Adding an ampersand to the start of a command runs it in the background and returns your prompt immediately:

\`\`\`bash
sleep 500 &
\`\`\`

Example output:

\`\`\`
[1] 4242
\`\`\`

The terminal is free for more commands while \`sleep\` runs.

### See it in the job list

\`\`\`bash
jobs
\`\`\`

Example output:

\`\`\`
[1]+  Running                 sleep 500 &
\`\`\`

### Bring it back

\`\`\`bash
fg %1
\`\`\`

This moves job 1 to the foreground.

### Keep going after logout

A background process started with \`&\` may still be killed when you log out. For truly independent, persist jobs use \`nohup\` or a service manager:

\`\`\`bash
nohup sleep 500 &
\`\`\`

> **Pro tip:** Redirect background output so it does not clutter the terminal: \`command > log.txt 2>&1 &\`. This keeps logs in a file and the prompt clean.

### Key recap

1. \`cmd &\` returns the prompt while running the command.
2. \`jobs\` and \`fg %1\` manage the job.
3. \`nohup cmd &\` survives terminal closing.
`,
    },
    {
      name: "nohup",
      minutes: 8,
      intro:
        "Run a process that stays alive even after you log out.",
      content: `## Run Past Logout with nohup

### The problem

When a shell session ends, its background processes usually receive \`SIGHUP\` (hang up) and stop. \`nohup\` tells a command to **ignore that hang-up signal**.

\`\`\`bash
nohup ./backup.sh &
\`\`\`

### What nohup does

- Ignores \`SIGHUP\` so the process survives logout
- Redirects output to \`nohup.out\` if no output file is given

### Redirect output yourself

\`\`\`bash
nohup ./backup.sh > backup.log 2>&1 &
\`\`\`

- \`>\`\` sends standard output to \`backup.log\`
- \`2>&1\` merges errors into the same file
- \`&\` background it

### Check on it later

\`\`\`bash
ps aux | grep backup
tail -f backup.log
\`\`\`

### Compare with &

- \`cmd &\` — runs in the background but may die on logout
- \`nohup cmd & \` — survives logout

> **Key idea:** nohup pairs with & for unattended, long running work — a script that continues after you close the terminal, ideal on a server.

### Key recap

1. \`nohup cmd &\` survives logout.
2. Output lands in \`nohup.out\` by default.
3. \`nohup cmd > log 2>&1 &\` keeps a clean log file.
`,
    },
    {
      name: "Process priorities (nice, renice)",
      minutes: 10,
      intro:
        "Shape CPU attention using nice and renice prioritize.",
      content: `## Process Priorities: nice and renice

### Why priorities matter

The CPU shares time among processes. A **priority** tells the scheduler how much of that time divide to a process. Priorities run from \`-20\` (most favorable) to \`19\` (least favorable). Higher nice = lower priority.

### Check your nice value

\`\`\`bash
nice
ps -o pid,ni,cmd
\`\`\`

The \`ni\` column shows the nice value.

### Launch with a lower priority

\`\`\`bash
nice -n 10 ./bigjob.sh &
\`\`\`

This starts \`bigjob.sh\` with nice value 10, so it yields CPU to more important work.

### Lower nice (higher priority)

\`\`\`bash
nice -n -5 ./urgent.sh &
\`\`\`

Only root can set a negative nice value. As a normal user, you can only make processes **lower** priority, not higher.

### Change an existing process: renice

\`\`\`bash
renice 5 -p 3000
\`\`\`

Changes the nice value of PID 3000 to 5.

### Common choices

- \`nice -n 10\` — lower priority for a big batch job
- \`nice -n 19\` — background work that should never steal CPU
- \`nice -n -5\` — higher priority, usually root-only

> **Warning:** Setting a very negative nice value (like \`-20\`) on a busy process can starve the rest of the system of CPU time. Use negative values only when truly necessary, and remember that normal users cannot set them.

### Key recap

1. Nice values run from \`-20\` (urgent) to \`19\` (lowest priority).
2. \`nice -n N cmd\` sets priority at launch.
3. \`renice N -p PID\` changes it on a running process.
`,
    },
  ],
}