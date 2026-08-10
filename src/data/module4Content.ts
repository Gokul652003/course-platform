import type { Module } from "../types"

export const module4: Module = {
  id: 4,
  title: "Searching",
  status: "complete",
  lessons: [
    {
      name: "find",
      minutes: 11,
      intro:
        "Walk the filesystem looking for files by name, type, size, and age.",
      content: `## Finding Files with find

### What it does

\`find\` walks a directory tree and prints every file that matches your rules. It is the most powerful searching tool on the command line.

### Search by name

\`\`\`bash
find /home -name "notes.txt"
\`\`\`

Example output:

\`\`\`
/home/gokul/notes.txt
/home/gokul/docs/notes.txt
\`\`\`

Use \`-iname\` for case-insensitive matches, and quotes to stop the shell from expanding wildcards:

\`\`\`bash
find . -iname "*.log"
\`\`\`

### Search by type

- \`find . -type f\` — regular files
- \`find . -type d\` — directories
- \`find . -type l\` — symbolic links

### Search by size and age

\`\`\`bash
find /var -size +100M
find . -mtime -7
find . -mtime +30
\`\`\`

- \`+100M\` — larger than 100 MB
- \`-mtime -7\` — modified in the last 7 days
- \`-mtime +30\` — modified more than 30 days ago

### Limit the depth

\`find . -maxdepth 2 -name "*.txt"\` stops at two levels down, which keeps the search fast.

> **Pro tip:** Start a search at the smallest directory that could contain what you need — \`find /\` over the whole system can be slow.

### Key recap

- \`find DIR -name "PATTERN"\` finds by name.
- \`-type f|d|l\` filters by kind.
- \`-size\`, \`-mtime\`, and \`-maxdepth\` narrow results.
`,
    },
    {
      name: "locate",
      minutes: 7,
      intro:
        "Search a prebuilt database for instant results instead of walking the disk.",
      content: `## Blazing-Fast Lookups with locate

### What it does

\`locate\` searches a **prebuilt database** of filenames instead of scanning the disk, so it returns results instantly.

### Example

\`\`\`bash
locate notes.txt
\`\`\`

Example output:

\`\`\`
/home/gokul/notes.txt
/usr/share/doc/notes.txt
\`\`\`

### How it stays fast

A background job periodically runs \`updatedb\`, which rebuilds the index of every path on the system.

### The trade-off

- **Pro:** results in milliseconds
- **Con:** the database may be stale

Files created after the last \`updatedb\` run won't appear until the database refreshes.

### Refresh manually

\`\`\`bash
sudo updatedb
\`\`\`

Then try \`locate\` again to confirm the new file appears.

> **Key idea:** \`locate\` answers "where is this file on disk right now?" from an index. \`find\` answers it by actually looking, which is slower but always current.

### Key recap

- \`locate\` reads a prebuilt filename database.
- \`updatedb\` rebuilds that database.
- Use \`locate\` for speed, \`find\` for current accuracy.
`,
    },
    {
      name: "which",
      minutes: 6,
      intro:
        "Report the exact path of the executable the shell would run.",
      content: `## Where Is the Program? Ask which

### What it does

\`which\` tells you the **full path** of an executable found in your \`PATH\`.

\`\`\`bash
which ls
\`\`\`

Example output:

\`\`\`
/usr/bin/ls
\`\`\`

### Why PATH matters

When you type \`ls\`, the shell searches each directory in \`PATH\` in order until it finds the program. \`which\` performs that same search and shows the winner.

### Check several commands at once

\`\`\`bash
which cp mv rm
\`\`\`

Example output:

\`\`\`
/usr/bin/cp
/usr/bin/mv
/usr/bin/rm
\`\`\`

### What about built-ins?

Shell built-ins like \`cd\` and \`exit\` have no separate file, so \`which\` finds nothing:

\`\`\`bash
which cd
\`\`\`

If you need the full resolution — alias, function, built-in, then path — use \`type\`:

\`\`\`bash
type ls
type cd
\`\`\`

> **Pro tip:** When you have two versions of a tool installed, \`which\` shows which one actually runs. It is the fastest way to debug "why is my command doing the wrong thing?"

### Key recap

- \`which CMD\` prints the path that \`PATH\` resolves.
- Built-ins have no path, so \`which\` returns nothing for them.
- Use \`type\` to see the full resolution order.
`,
    },
    {
      name: "whereis",
      minutes: 6,
      intro:
        "Find a command's binary, source, and manual page in one shot.",
      content: `## Locating Everything with whereis

### What it does

\`whereis\` searches standard locations for a command's **binary**, **source**, and **manual page** all at once.

\`\`\`bash
whereis grep
\`\`\`

Example output:

\`\`\`
grep: /usr/bin/grep /usr/share/man/man1/grep.1.gz
\`\`\`

### The three sections

- **binary** — the executable itself
- **source** — source code, if installed
- **man** — the manual page

### Compare with which

\`which grep\` prints only the binary path:

\`\`\`
/usr/bin/grep
\`\`\`

\`whereis grep\` also points you at the man page, which is great when you want the docs without guessing.

### Useful flags

\`\`\`bash
whereis -b grep
whereis -m grep
\`\`\`

- \`-b\` — binary only
- \`-m\` — man page only
- \`-s\` — source only

> **Key idea:** \`which\` answers "what binary runs?", \`whereis\` answers "where is all of it?" — program, source, and manual page in one command.

### Key recap

- \`whereis CMD\` shows binary, source, and man page.
- \`whereis -b\` shows the binary alone.
- Pair it with \`which\` when you want just the executable path.
`,
    },
    {
      name: "grep",
      minutes: 11,
      intro:
        "Search text inside files using patterns, and become the most famous Unix command.",
      content: `## Searching Text with grep

### What it does

\`grep\` reads input and prints the **lines that match** a pattern. It is the essential tool for working with logs, configs, and output.

### Basic search

\`\`\`bash
grep "error" server.log
\`\`\`

Example output:

\`\`\`
12:31:05 error: connection refused
12:47:22 error: timeout on port 8080
\`\`\`

### Useful flags

- \`grep -i\` — ignore case
- \`grep -r\` — search recursively through directories
- \`grep -n\` — show line numbers
- \`grep -c\` — count matching lines
- \`grep -v\` — show lines that do **not** match

\`\`\`bash
grep -in "error" server.log
grep -vc "debug" server.log
\`\`\`

### Piping into grep

\`grep\` shines when it filters other commands:

\`\`\`bash
ps aux | grep firefox
\`\`\`

This lists every process line containing \`firefox\`.

### Regular expressions

\`grep\` supports regex. \`^Start\` matches lines that begin with Start, and \`\\.$ \` matches lines ending in a period. Use \`grep -E\` for extended syntax like alternation:

\`\`\`bash
grep -E "error|fatal" server.log
\`\`\`

> **Pro tip:** Always quote the pattern so the shell does not expand it. \`grep "*.txt"\` and \`grep '*.txt'\` search for the literal text, not the wildcard.

### Key recap

- \`grep PATTERN FILE\` prints matching lines.
- \`-i\`, \`-n\`, \`-c\`, \`-v\`, \`-r\` cover most needs.
- Pipe other commands into \`grep\` to filter output.
`,
    },
    {
      name: "xargs",
      minutes: 10,
      intro:
        "Turn a list of names from standard input into arguments for another command.",
      content: `## Building Commands with xargs

### The problem

Many commands accept files as arguments but not from standard input. \`find . -name "*.log"\` prints a list; how do you delete all of them? \`rm\` does not read standard input.

\`xargs\` reads items from standard input and runs another command with those items as arguments.

### Basic usage

\`\`\`bash
find . -name "*.log" | xargs rm
\`\`\`

\`find\` prints the filenames, and \`xargs\` hands them to \`rm\`.

### Control how many per run

\`-n\` limits arguments per invocation:

\`\`\`bash
echo a b c d | xargs -n 2 echo
\`\`\`

Example output:

\`\`\`
a b
c d
\`\`\`

### Handle tricky filenames

Filenames with spaces or newlines break naive \`xargs\`. Use \`-0\` to split on null bytes:

\`\`\`bash
find . -name "*.tmp" -print0 | xargs -0 rm
\`\`\`

### Insert the item anywhere

By default \`xargs\` appends the item at the end. \`-I{}\` lets you place it anywhere:

\`\`\`bash
find . -name "*.txt" | xargs -I{} mv {} ~/archive/
\`\`\`

> **Warning:** Never pipe into \`xargs rm -rf\` without carefully checking the list first. Running \`find\` alone to preview output before adding \`| xargs rm\` can save you from disaster.

### Key recap

- \`cmd | xargs other\` passes each line as an argument.
- \`-n\` controls arguments per command run.
- \`-0\` safely handles spaces and special characters.
`,
    },
    {
      name: "Pipes (|) and combining commands",
      minutes: 9,
      intro:
        "Chain small commands into pipelines, and combine them with &&, ||, and ;.",
      content: `## Pipes and Combining Commands

### What a pipe does

The pipe character \`|\` sends the **standard output** of one command into the **standard input** of the next. It is the heart of the Unix philosophy: small tools joined into one workflow.

\`\`\`bash
cat server.log | grep "error" | head -20
\`\`\`

This reads the log, keeps only error lines, and shows the first 20.

### Common pipeline patterns

\`\`\`bash
ps aux | grep firefox
ls -l | wc -l
history | grep git
\`\`\`

- \`ps aux | grep\` — find a process
- \`ls -l | wc -l\` — count files
- \`history | grep\` — find past commands

### Running commands in sequence with ;

The semicolon runs commands one after another regardless of success:

\`\`\`bash
cd /tmp; ls; pwd
\`\`\`

### Run only on success with &&

\`\`\`bash
mkdir build && cd build && touch app.js
\`\`\`

If \`mkdir build\` fails, the rest never runs.

### Run on failure with ||

\`\`\`bash
cd /tmp || echo "failed to enter /tmp"
\`\`\`

The right side runs only when the left side fails — handy for fallbacks.

> **Pro tip:** Combine operators for real logic: \`make && ./run\` builds first and only then runs. The pipe is about data flow; \`&&\`, \`||\`, and \`;\` are about control flow.

### Key recap

- \`|\` feeds one command's output into another.
- \`;\` runs commands in sequence.
- \`&&\` runs the next command only on success.
- \`||\` runs the next command only on failure.
`,
    },
  ],
}
