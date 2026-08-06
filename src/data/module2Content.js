export const module2 = {
  id: 2,
  title: "Files & Directories",
  status: "complete",
  lessons: [
    {
      name: "pwd",
      minutes: 6,
      intro:
        "The print working directory command that tells you exactly where your shell is sitting.",
      content: `## Print Working Directory (pwd)

### What it does

\`pwd\` (print working directory) prints the absolute path of the directory your shell is currently in.

### Try it

\`\`\`bash
pwd
\`\`\`

Example output:

\`\`\`
/home/gokul
\`\`\`

### Why it matters

- The shell always runs inside a current directory
- \`pwd\` confirms exactly where you are before running other commands
- Nearly every command that touches files starts from the current directory

### Absolute vs relative paths

- **Absolute path** — starts at the root, for example \`/home/gokul/projects\`
- **Relative path** — resolved from the current directory, for example \`projects\`

\`pwd\` always prints the absolute path, never a relative one.

> **Key idea:** If a command seems to "not find" a file, run \`pwd\` first and confirm where your shell actually is.

### Key recap

- \`pwd\` prints the current working directory.
- The output is always an absolute path starting at \`/\`.
- Use it whenever you are unsure where you are.
`,
    },
    {
      name: "ls",
      minutes: 8,
      intro:
        "List the contents of a directory and read the metadata columns of each file.",
      content: `## Listing Files with ls

### What it does

\`ls\` lists the contents of a directory.

### Basic usage

\`\`\`bash
ls
\`\`\`

This prints the names of files and directories in the current directory.

### Common options

- \`ls -l\` — long format with permissions, owner, size, and date
- \`ls -a\` — show hidden files (those starting with a dot)
- \`ls -la\` — long format plus hidden files
- \`ls -lh\` — human-readable sizes like 4.0K or 1.2M

### Example

\`\`\`bash
ls -la
\`\`\`

Example output:

\`\`\`
drwxr-xr-x 4 gokul gokul 4096 Aug  6 10:00 .
drwxr-xr-x 3 gokul gokul 4096 Aug  6 09:00 ..
-rw-r--r-- 1 gokul gokul  220 Aug  6 09:15 notes.txt
\`\`\`

### Reading the columns

- **First character** — \`d\` means directory, \`-\` means a regular file
- **Next nine characters** — the permissions (covered fully in the Permissions module)
- **Owner and group** — who owns the file
- **Size** — in bytes unless you pass \`-h\`
- **Timestamp** — when the file was last modified

> **Pro tip:** \`ls -l\` on a file tells you far more than its name. That first ten-character block is the foundation for the entire Permissions module.

### Key recap

- \`ls\` lists directory contents.
- \`ls -l\` adds permissions, ownership, size, and dates.
- \`ls -a\` reveals hidden files.
`,
    },
    {
      name: "cd",
      minutes: 6,
      intro:
        "Change your current directory and navigate the filesystem with shortcuts.",
      content: `## Changing Directories with cd

### What it does

\`cd\` (change directory) moves your shell into a different directory.

### Basic usage

\`\`\`bash
cd /home/gokul
\`\`\`

After this, \`pwd\` prints \`/home/gokul\`.

### Special destinations

- \`cd ~\` — go to your home directory
- \`cd ..\` — go up one level
- \`cd -\` — go back to the previous directory
- \`cd\` with no arguments — also goes to your home directory

### Example

\`\`\`bash
cd /etc
pwd
cd ..
pwd
\`\`\`

Example output:

\`\`\`
/etc
/
\`\`\`

### Moving with relative paths

If you are in \`/home/gokul\` and want \`/home/gokul/projects\`:

\`\`\`bash
cd projects
\`\`\`

The path is resolved relative to where you are, so \`projects\` means \`/home/gokul/projects\`.

> **Warning:** You cannot go above the root. Typing \`cd ../..\` from \`/\` just keeps you at \`/\`.

### Key recap

- \`cd\` changes your current directory.
- Use the \`~\`, \`..\`, and \`-\` shortcuts.
- Relative paths are resolved from your current directory.
`,
    },
    {
      name: "mkdir",
      minutes: 7,
      intro:
        "Create new directories, including entire nested paths at once.",
      content: `## Creating Directories with mkdir

### What it does

\`mkdir\` (make directory) creates new directories.

### Basic usage

\`\`\`bash
mkdir projects
\`\`\`

This creates a \`projects\` directory in your current directory.

### Creating nested directories

\`mkdir\` fails if a parent directory is missing:

\`\`\`bash
mkdir reports/2026/january
\`\`\`

Add \`-p\` to create the whole chain at once:

\`\`\`bash
mkdir -p reports/2026/january
\`\`\`

### Other useful options

- \`mkdir -v\` — verbose, prints what was created
- \`mkdir -m 700\` — set specific permissions at creation time

### Example

\`\`\`bash
mkdir -pv backups/projects/site
\`\`\`

Example output:

\`\`\`
mkdir: created directory 'backups'
mkdir: created directory 'backups/projects'
mkdir: created directory 'backups/projects/site'
\`\`\`

> **Pro tip:** Double-check the path before pressing Enter. \`mkdir\` will not silently skip a typo — you get an explicit \`File exists\` or \`No such file or directory\` error instead.

### Key recap

- \`mkdir NAME\` creates one directory.
- \`mkdir -p\` creates an entire path including parents.
- \`mkdir -m 700\` sets permissions at creation time.
`,
    },
    {
      name: "touch",
      minutes: 6,
      intro:
        "Create empty files and update timestamps, the quickest way to scaffold a project.",
      content: `## Creating and Updating Files with touch

### What it does

\`touch\` creates an empty file if it does not exist, and updates the timestamp if it already exists.

### Basic usage

\`\`\`bash
touch notes.txt
\`\`\`

This creates an empty \`notes.txt\` in your current directory.

### Creating several files at once

\`\`\`bash
touch file1.txt file2.txt file3.txt
\`\`\`

### Touching an existing file

\`\`\`bash
touch notes.txt
\`\`\`

The file's modification time updates to "now" — useful for forcing tools to re-process it.

### Verify with ls -l

\`\`\`bash
ls -l notes.txt
\`\`\`

Example output:

\`\`\`
-rw-r--r-- 1 gokul gokul 0 Aug  6 11:00 notes.txt
\`\`\`

The \`0\` is the file size in bytes: the file is empty but it exists.

> **Key idea:** \`touch\` is not just for empty files. It is the standard way to refresh timestamps so scripts or build tools notice a change.

### Key recap

- \`touch FILE\` creates an empty file.
- On an existing file it only updates the timestamp.
- Run \`ls -l\` to verify size and modification time.
`,
    },
    {
      name: "cp",
      minutes: 8,
      intro:
        "Copy files and directories, with options to preserve attributes and guard overwrites.",
      content: `## Copying Files with cp

### What it does

\`cp\` copies files and directories from one location to another.

### Copy a single file

\`\`\`bash
cp notes.txt backup.txt
\`\`\`

Now both \`notes.txt\` and \`backup.txt\` exist with the same content.

### Copy keeping the original name

\`\`\`bash
cp notes.txt backup/
\`\`\`

This copies \`notes.txt\` into the \`backup\` directory keeping its name.

### Common options

- \`cp -r\` — copy directories recursively
- \`cp -i\` — ask before overwriting
- \`cp -p\` — preserve permissions and timestamps
- \`cp -v\` — verbose, show each copy

### Copying a directory

\`\`\`bash
cp -r projects projects-backup
\`\`\`

Without \`-r\`, \`cp\` refuses to copy directories.

### Example with output

\`\`\`bash
cp -iv notes.txt backup/
\`\`\`

Example output:

\`\`\`
cp: overwrite 'backup/notes.txt'? y
'notes.txt' -> 'backup/notes.txt'
\`\`\`

> **Warning:** \`cp\` silently overwrites files by default. Use \`cp -i\` until you are confident about what you are overwriting.

### Key recap

- \`cp SOURCE DEST\` copies files.
- Use \`cp -r\` for directories.
- Use \`-i\` to guard against accidental overwrites.
`,
    },
    {
      name: "mv",
      minutes: 7,
      intro:
        "Move and rename files or directories with a single, simple command.",
      content: `## Moving and Renaming with mv

### What it does

\`mv\` moves files or directories, and renames them when the target is just a new name.

### Rename a file

\`\`\`bash
mv notes.txt notes-final.txt
\`\`\`

The file content is unchanged — only the name changes.

### Move a file into a directory

\`\`\`bash
mv notes.txt backups/
\`\`\`

### Move a directory

\`\`\`bash
mv projects projects-archive
\`\`\`

\`mv\` works on directories without any special flag, unlike \`cp -r\`.

### Example

\`\`\`bash
mv report.pdf reports/2026/
\`\`\`

After the move, \`report.pdf\` no longer exists in the current directory — it now lives at \`reports/2026/report.pdf\`.

> **Pro tip:** \`mv\` is the quickest way to "rename" an entire directory. Because renaming within the same filesystem is just a metadata change, it is instant even for huge directories.

### Key recap

- \`mv\` both moves and renames in one command.
- No \`-r\` flag is needed for directories.
- The source no longer exists after the move.
`,
    },
    {
      name: "rm",
      minutes: 7,
      intro:
        "Permanently delete files and directory trees with an understanding of the risks.",
      content: `## Removing Files with rm

### What it does

\`rm\` deletes files and directories. There is no trash folder — deletion is permanent.

### Remove a single file

\`\`\`bash
rm notes.txt
\`\`\`

### Common options

- \`rm -r\` — remove directories recursively
- \`rm -f\` — force, suppress "no such file" errors
- \`rm -i\` — ask before each deletion

### Remove an entire directory tree

\`\`\`bash
rm -r old-project
\`\`\`

### Example with confirmation

\`\`\`bash
rm -ri old-project
\`\`\`

Example output:

\`\`\`
rm: remove 'old-project'? y
rm: remove 'old-project/subdir'? y
\`\`\`

> **Warning:** There is no undo. Once \`rm\` deletes a file, recovery is usually impossible. Double-check the path before pressing Enter.

### Key recap

- \`rm FILE\` deletes a file permanently.
- \`rm -r\` deletes directories and their contents.
- There is no recycle bin in the terminal.
`,
    },
    {
      name: "rmdir",
      minutes: 6,
      intro:
        "Safely remove directories, but only when they are already empty.",
      content: `## Removing Empty Directories with rmdir

### What it does

\`rmdir\` removes empty directories. If a directory has any files inside, \`rmdir\` refuses to touch it.

### Basic usage

\`\`\`bash
rmdir emptydir
\`\`\`

### When it fails

If the directory is not empty:

\`\`\`bash
rmdir project
\`\`\`

Example error:

\`\`\`
rmdir: failed to remove 'project': Directory not empty
\`\`\`

### Remove a chain of empty directories

\`\`\`bash
rmdir -p a/b/c
\`\`\`

This removes \`c\`, then \`b\`, then \`a\` — but only if each one becomes empty at that step.

> **Key idea:** \`rmdir\` is the safe version of removing directories. It only deletes what it can cleanly remove, protecting you from wiping non-empty content by accident.

### Key recap

- \`rmdir\` only removes empty directories.
- It errors out on non-empty directories.
- \`rmdir -p\` removes a chain of empty directories.
`,
    },
    {
      name: "Links (ln)",
      minutes: 9,
      intro:
        "Create hard links and symbolic links that reference the same underlying data.",
      content: `## Understanding Links with ln

### What it does

\`ln\` creates links — extra names that point to the same file data.

### Hard links

A hard link is another name for the same file on disk:

\`\`\`bash
ln notes.txt notes-hard.txt
\`\`\`

Both names point to the same data. Editing one edits both, and deleting one name leaves the data safe while another name still exists.

### Symbolic (soft) links

A soft link is a small file that stores a path to another file:

\`\`\`bash
ln -s notes.txt notes-soft.txt
\`\`\`

If you delete the original file, the soft link is left broken — "dangling".

### See the difference

\`\`\`bash
ln notes.txt hard
ln -s notes.txt soft
ls -l hard soft
\`\`\`

Example output:

\`\`\`
-rw-r--r-- 2 gokul gokul 100 Aug  6 12:00 hard
lrwxrwxrwx 1 gokul gokul   9 Aug  6 12:00 soft -> notes.txt
\`\`\`

The \`l\` at the start marks a symbolic link. The link count of \`2\` on \`hard\` shows the data has two names.

> **Pro tip:** Reach for \`ln -s\` in everyday work. Hard links cannot span filesystems and cannot link directories, while symbolic links handle both.

### Key recap

- \`ln\` creates hard links — extra names for the same data.
- \`ln -s\` creates symbolic links — shortcuts to a path.
- Symbolic links break if the target is removed; hard links survive.
`,
    },
  ],
}