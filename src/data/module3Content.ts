import type { Module } from "../types"

export const module3: Module = {
  id: 3,
  title: "Permissions",
  status: "complete",
  lessons: [
    {
      name: "Reading ls -l",
      minutes: 8,
      intro:
        "Decode the long listing output that reveals a file's type, permissions, and ownership.",
      content: `## Reading the ls -l Output

### What it does

\`ls -l\` shows detailed metadata for every file. Reading it is the first step to understanding permissions.

### Example

\`\`\`bash
ls -l notes.txt
\`\`\`

Example output:

\`\`\`
-rw-r--r-- 1 gokul gokul 1200 Aug  6 10:00 notes.txt
\`\`\`

### The columns, left to right

- **File type** — \`-\` regular file, \`d\` directory, \`l\` symbolic link
- **Permissions** — three trios for owner, group, and others
- **Link count** — how many hard links point to the file
- **Owner** — the user who owns the file
- **Group** — the group that owns the file
- **Size** — in bytes
- **Timestamp** — when the file was last modified
- **Name** — the file name

### The permission block

\`\`\`
-rwxr-xr-x
│ └┬┘└┬┘└┬┘
│  │  │  └── others (everyone else)
│  │  └───── group
│  └──────── owner
└─────────── file type
\`\`\`

Each character is \`r\` (read), \`w\` (write), \`x\` (execute), or \`-\` (not set).

> **Key idea:** The permission string is always read as three trios in a fixed order: read, write, execute.

### Key recap

- \`ls -l\` prints type, permissions, owner, group, size, date, and name.
- Permissions are three trios: owner, group, others.
- \`r\`, \`w\`, \`x\` mean read, write, execute.
`,
    },
    {
      name: "Numeric permissions",
      minutes: 9,
      intro:
        "Represent permissions as octal numbers so they can be written in three digits.",
      content: `## Numeric (Octal) Permissions

### What it is

Every permission can also be expressed as a number, which makes permissions compact and easy to set.

### The values

- \`r\` (read) = 4
- \`w\` (write) = 2
- \`x\` (execute) = 1
- \`-\` (none) = 0

For each trio, add the numbers of the permissions that are set.

### Converting an example

Take \`rwxr-xr--\` and split it into trios:

- owner \`rwx\` → 4 + 2 + 1 = **7**
- group \`r-x\` → 4 + 0 + 1 = **5**
- others \`r--\` → 4 + 0 + 0 = **4**

The file is \`754\`.

### Common values to memorize

- \`755\` — owner full access; group and others read + execute (typical for programs)
- \`644\` — owner read + write; group and others read only (typical for files)
- \`700\` — owner full access; nobody else (private directories)
- \`600\` — owner read + write only (private files)

### Practice conversion

\`\`\`
rwx = 4+2+1 = 7
r-x = 4+0+1 = 5
r-- = 4+0+0 = 4
\`\`\`

Result: \`754\`.

> **Pro tip:** Memorize the building blocks — \`7\` all, \`6\` read + write, \`5\` read + execute, \`4\` read only. Nearly every real-world file is \`755\` or \`644\`.

### Key recap

- \`r\` = 4, \`w\` = 2, \`x\` = 1; add them per trio.
- Three digits describe owner, group, and others.
- \`755\` and \`644\` cover most real-world cases.
`,
    },
    {
      name: "chmod",
      minutes: 9,
      intro:
        "Change permissions with numeric mode or flexible symbolic expressions.",
      content: `## Changing Permissions with chmod

### What it does

\`chmod\` (change mode) modifies the permissions of files and directories.

### Numeric mode

\`\`\`bash
chmod 755 script.sh
\`\`\`

This sets the file to \`rwxr-xr-x\` regardless of what it was before.

### Symbolic mode

Symbolic mode edits a specific set using letters:

- \`u\` owner, \`g\` group, \`o\` others, \`a\` all
- \`+\` add, \`-\` remove, \`=\` set exactly
- \`r\`, \`w\`, \`x\` permissions

### Common examples

\`\`\`bash
chmod +x script.sh
chmod u-w notes.txt
chmod go-rw secret.txt
\`\`\`

- \`chmod +x\` adds execute for everyone
- \`chmod u-w\` removes write from the owner
- \`chmod go-rw\` strips read and write from group and others

### Directories

Execute permission on a directory means "allowed to enter it":

\`\`\`bash
chmod 700 ~/private
\`\`\`

Now only the owner can enter \`~/private\`.

### Verify

\`\`\`bash
ls -l script.sh
\`\`\`

Example output:

\`\`\`
-rwxr-xr-x 1 gokul gokul 512 Aug  6 12:30 script.sh
\`\`\`

> **Pro tip:** Use symbolic mode for quick tweaks and numeric mode when you want an exact result. \`chmod +x\` is the most common permission command you will ever run.

### Key recap

- \`chmod 755 FILE\` sets exact permissions numerically.
- \`chmod +x FILE\` adds execute access.
- Symbols \`u\`, \`g\`, \`o\`, \`a\` and operators \`+\`, \`-\`, \`=\` build any tweak.
`,
    },
    {
      name: "Ownership (chown, chgrp)",
      minutes: 8,
      intro:
        "Assign files to users and groups using chown and chgrp.",
      content: `## Ownership with chown and chgrp

### What it is

Every file has an owner user and an owner group. \`chown\` changes the user, \`chgrp\` changes the group.

### Check current ownership

\`\`\`bash
ls -l notes.txt
\`\`\`

Example output:

\`\`\`
-rw-r--r-- 1 gokul gokul 1200 Aug  6 10:00 notes.txt
\`\`\`

The owner is \`gokul\` and the group is \`gokul\`.

### Change the owner

\`\`\`bash
sudo chown alice notes.txt
\`\`\`

Now \`alice\` owns the file. Changing ownership usually needs root, hence \`sudo\`.

### Change the group

\`\`\`bash
sudo chgrp staff notes.txt
\`\`\`

### Change both at once

\`\`\`bash
sudo chown alice:staff notes.txt
\`\`\`

The \`user:group\` syntax changes both in a single command.

### Preserve ownership while copying

\`\`\`bash
cp -p notes.txt backup.txt
\`\`\`

The \`-p\` flag keeps owner, group, and permissions intact.

> **Warning:** Misassigning ownership can break systems. A service that suddenly owns files it should not is a serious risk — change ownership deliberately, not casually.

### Key recap

- \`chown USER FILE\` changes the owner.
- \`chgrp GROUP FILE\` changes the group.
- \`chown USER:GROUP FILE\` changes both at once.
`,
    },
    {
      name: "umask",
      minutes: 8,
      intro:
        "Control the default permissions that every new file and directory starts with.",
      content: `## Default Permissions with umask

### What it is

\`umask\` controls the default permissions applied to every new file and directory you create.

### The defaults

- New files start from \`666\` (\`rw-rw-rw-\`)
- New directories start from \`777\` (\`rwxrwxrwx\`)

The umask value is subtracted from those defaults.

### View your current umask

\`\`\`bash
umask
\`\`\`

Example output:

\`\`\`
0022
\`\`\`

### What 0022 produces

- Files: \`666 - 022\` → \`644\` (\`rw-r--r--\`)
- Directories: \`777 - 022\` → \`755\` (\`rwxr-xr-x\`)

### Change the umask

\`\`\`bash
umask 077
touch new.txt
ls -l new.txt
\`\`\`

Example output:

\`\`\`
-rw------- 1 gokul gokul 0 Aug  6 13:00 new.txt
\`\`\`

With umask \`077\`, new files are readable only by you.

> **Pro tip:** On a shared or multi-user machine, \`umask 077\` keeps new files private by default. Remember it only lasts for the current session unless you add it to your shell startup file.

### Key recap

- \`umask\` subtracts permissions from the defaults.
- Defaults are \`666\` for files and \`777\` for directories.
- Umask \`0022\` yields \`644\` files and \`755\` directories.
`,
    },
    {
      name: "Special permissions (SUID, SGID, Sticky Bit)",
      minutes: 11,
      intro:
        "Go beyond rwx with SUID, SGID, and the sticky bit for advanced file behavior.",
      content: `## Special Permissions: SUID, SGID, Sticky Bit

### What they are

Three extra bits change how files and directories behave beyond read, write, and execute.

### SUID (set user ID) — value 4

When a file with SUID runs, it runs with the file owner's privileges instead of the runner's:

\`\`\`bash
chmod u+s program
\`\`\`

The \`passwd\` command uses SUID so any user can change their password using root privileges. In \`ls -l\`, SUID appears as \`s\` in the owner execute position:

\`\`\`
-rwsr-xr-x
\`\`\`

### SGID (set group ID) — value 2

On a file, SGID runs the program with the file's group. On a directory, new files inherit the directory's group:

\`\`\`bash
chmod g+s shared/
\`\`\`

SGID shows as \`s\` in the group execute position.

### Sticky Bit — value 1

On a directory, the sticky bit means only the owner (or root) can delete files inside:

\`\`\`bash
chmod +t /tmp
\`\`\`

This is why \`/tmp\` works: everyone can create files there, but only owners can remove them. It shows as a \`t\`.

### Setting them numerically

\`\`\`bash
chmod 4755 program
chmod 2755 shared/
chmod 1777 /tmp
\`\`\`

The extra leading digit is the sum of SUID (4), SGID (2), and sticky (1).

> **Warning:** SUID is powerful and dangerous. A SUID binary owned by root runs with root power for anyone — only use it when you truly understand the risk.

### Key recap

- SUID (4) runs a program with the owner's privileges.
- SGID (2) makes directories inherit their group.
- Sticky bit (1) protects files from deletion by non-owners.
`,
    },
  ],
}