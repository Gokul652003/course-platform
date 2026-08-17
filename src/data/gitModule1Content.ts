import type { Module } from "../types"

export const gitModule1: Module = {
  id: 1,
  title: "Fundamentals & Your First Repo",
  status: "in_progress",
  lessons: [
    {
      name: "What Is Version Control, and Why Git?",
      minutes: 7,
      intro: "The problem Git solves, and why it won over every alternative.",
      content: `### The problem: "final_v3_ACTUALLY_final.docx"

Before version control, tracking changes to a project meant renaming files by hand — \`report.docx\`, \`report_v2.docx\`, \`report_v2_edited.docx\` — or emailing zip files back and forth. This breaks down almost immediately: nobody can tell what changed between versions, two people editing at once silently overwrite each other, and there's no way to see *why* a change was made, only that it was.

A **version control system (VCS)** solves this by recording a complete, searchable history of every change to a project — who made it, when, and why — while letting multiple people work on the same files without stepping on each other.

### Centralized vs. distributed

\`\`\`
Centralized (e.g. old Subversion/CVS)
  Your machine  <---->  One central server (the only full history)

Distributed (Git)
  Your machine  <---->  Any other machine
  (every clone has the FULL history, not just a snapshot)
\`\`\`

Older systems like Subversion kept the *one true history* on a central server; your machine only had whatever revision you'd checked out. Git is **distributed**: every time you clone a Git repository, you get the entire history — every commit, every branch — on your own machine. This is why Git works fully offline (you can commit, branch, and view history with no network at all) and why there's no single point of failure — any clone can restore the whole project.

### Why Git specifically won

Git was created in 2005 by Linus Torvalds to manage the Linux kernel — a project with thousands of contributors and no tolerance for a slow or fragile tool. That origin shaped its design goals directly: it had to be extremely fast, handle non-linear development (thousands of parallel branches) gracefully, and guarantee that history couldn't be silently corrupted. Those same properties are why, two decades later, Git is the version control system nearly the entire software industry has standardized on, and why platforms like GitHub, GitLab, and Bitbucket all exist to host Git repositories specifically.

### What Git actually tracks

Git doesn't track "files" the way you might assume — it tracks **snapshots**. Every time you save your work with Git (a "commit"), it records the complete state of every tracked file at that moment, not just a list of what lines changed. Behind the scenes it's smart about storage (unchanged files aren't duplicated), but conceptually, think of each commit as a full snapshot of your project, with a link back to the snapshot before it — a chain of snapshots is what "history" means in Git.

> **Key idea:** Git is a *distributed* version control system — every clone holds the full history, not just the latest state — built for speed and non-linear collaboration, and it works by recording a chain of full project snapshots ("commits"), not a list of line-by-line edits.`,
    },
    {
      name: "Installing Git & First-Time Setup",
      minutes: 8,
      intro: "Getting Git running, and the three config values every install needs.",
      content: `### Checking if Git is already installed

\`\`\`bash
git --version
# git version 2.43.0
\`\`\`

Most Linux distributions and macOS ship with Git preinstalled, or make it a one-line install:

\`\`\`bash
# Debian/Ubuntu
sudo apt install git

# macOS (via Homebrew)
brew install git

# Windows
# Download and run the installer from git-scm.com
\`\`\`

### The three settings every install needs

\`\`\`bash
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
git config --global init.defaultBranch main
\`\`\`

Before making your first commit, Git needs to know **who you are** — your name and email get permanently baked into every commit you make, which is how history shows who did what. The \`--global\` flag means these apply to every repository on your machine; without it, a setting only applies to the repository you're currently in. \`init.defaultBranch main\` sets the name new repositories use for their first branch (historically \`master\`; \`main\` is the modern convention most platforms now default to).

### Checking your configuration

\`\`\`bash
git config --list
git config user.name        # just one value
\`\`\`

\`git config --list\` shows every setting currently in effect, useful for confirming your setup or debugging an unexpected value. Configuration is layered: **system** (everyone on the machine) → **global** (your user account, what \`--global\` writes to) → **local** (one specific repository, stored in its \`.git/config\`) — more specific levels override more general ones, so a local repo setting always wins over your global one.

### Picking an editor for commit messages

\`\`\`bash
git config --global core.editor "code --wait"
# or: "vim", "nano", "emacs"
\`\`\`

Some Git commands (like writing a commit message without \`-m\`) open a text editor. If you don't set this, Git falls back to a system default (often Vim, which surprises people who've never used it — type \`:wq\` and Enter to save and quit if you land there unexpectedly).

> **Key idea:** \`git config --global user.name/user.email\` is mandatory before your first commit since it's permanently attached to your history; config is layered system → global → local, with the more specific level always winning.`,
    },
    {
      name: "The Three Trees: Working Directory, Staging Area, Repository",
      minutes: 9,
      intro: "The single mental model that makes every Git command make sense.",
      content: `### The model that unlocks everything else

\`\`\`
Working Directory  --git add-->  Staging Area  --git commit-->  Repository (.git)
   (your files)        (the "index")              (permanent history)
\`\`\`

Nearly every confusing Git command becomes obvious once you internalize that Git manages **three distinct areas**, and almost every command's job is to move content between them. This is the single most important mental model in this entire course — refer back to this diagram whenever a command feels unclear.

### Working Directory

This is just your project folder as it exists on disk right now — the files you open in your editor and see in your file browser. Git watches this directory for changes, but a change here is not yet recorded anywhere; it's just a difference between what's on disk and what Git last knew about.

### Staging Area (the "index")

\`\`\`bash
git add report.md
\`\`\`

The staging area is a holding zone — a draft of what your *next* commit will contain. Running \`git add <file>\` doesn't save the file into history yet; it copies the file's current state into this staging area, marking it as "ready to be included in the next commit." This extra step is deliberate: it lets you build a commit out of exactly the changes you want, even if your working directory has other, unrelated changes you're not ready to commit yet.

### Repository (the committed history)

\`\`\`bash
git commit -m "Add quarterly report draft"
\`\`\`

\`git commit\` takes everything currently in the staging area and permanently records it as a new snapshot in the repository's history (stored inside the hidden \`.git\` folder). Once committed, that snapshot is safe — part of the permanent, replayable history of the project.

### Seeing which area a file is in

\`\`\`bash
git status
\`\`\`

\`git status\` is the command you'll run more than any other — it tells you exactly which files have changes in your working directory that aren't staged yet, and which staged changes are ready to be committed. Get comfortable running it constantly; there's no such thing as checking it too often.

> **Key idea:** every file's changes flow Working Directory → (\`git add\`) → Staging Area → (\`git commit\`) → Repository; \`git add\` doesn't save history, it only *prepares* what the next commit will contain, and \`git status\` is how you see where everything currently stands.`,
    },
    {
      name: "git init, git status, and Your First Commit",
      minutes: 9,
      intro: "Turning a folder into a Git repository and recording your first snapshot.",
      content: `### Creating a repository

\`\`\`bash
mkdir my-project && cd my-project
git init
\`\`\`

\`git init\` turns the current folder into a Git repository by creating a hidden \`.git\` subdirectory — this is where all of Git's history, configuration, and internal data lives. Everything Git does happens through this folder; delete it and the folder goes back to being a plain, untracked directory (your files stay, but every commit and all history is gone).

### Checking status after creating a file

\`\`\`bash
echo "# My Project" > README.md
git status
\`\`\`
\`\`\`
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
\`\`\`

A newly created file shows as **untracked** — Git has noticed it exists but isn't tracking changes to it yet. This is a deliberate, safe default: Git never automatically starts tracking a file, so build artifacts, temporary files, and secrets don't accidentally end up in history.

### Staging and committing

\`\`\`bash
git add README.md
git status
\`\`\`
\`\`\`
Changes to be committed:
        new file:   README.md
\`\`\`

\`\`\`bash
git commit -m "Initial commit"
\`\`\`
\`\`\`
[main (root-commit) a1b2c3d] Initial commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
\`\`\`

After \`git add\`, \`git status\` shows the file under "Changes to be committed" — it's staged and ready. \`git commit -m "..."\` writes that staged snapshot permanently into history with the given message. The output confirms which branch it landed on, a short identifier for the new commit (\`a1b2c3d\` — more on these identifiers soon), and a summary of what changed.

### A shortcut: staging everything at once

\`\`\`bash
git add .          # stage every change in and below the current directory
git add -A         # stage every change in the entire repository
git commit -am "Quick fix"   # stage all TRACKED changes and commit, in one step
\`\`\`

\`git add .\` is the most common way to stage everything at once. \`git commit -am\` is a convenient shortcut, but it only stages files Git is *already tracking* — it will not pick up brand-new untracked files, which still need an explicit \`git add\` first.

> **Key idea:** \`git init\` creates the repository, new files start **untracked** until \`git add\`'ed, and \`git commit -m "message"\` permanently saves whatever is currently staged — \`git status\` after each step is the best way to build the habit of always knowing exactly what Git will do next.`,
    },
    {
      name: "Viewing History: git log and git show",
      minutes: 8,
      intro: "How to read the commit history you've just started building.",
      content: `### The default log view

\`\`\`bash
git log
\`\`\`
\`\`\`
commit a1b2c3d4e5f678901234567890abcdef12345678 (HEAD -> main)
Author: Ada Lovelace <ada@example.com>
Date:   Mon Aug 17 10:03:21 2026 +0000

    Initial commit
\`\`\`

Each entry shows the full **commit hash** (a 40-character identifier, unique to that exact snapshot — covered in depth in the internals module later), the author, the date, and the commit message. \`HEAD -> main\` tells you that \`main\` is the branch you're on, and it currently points at this commit — \`HEAD\` always means "where you are right now," a concept that comes up constantly throughout this course.

### More readable log formats

\`\`\`bash
git log --oneline
\`\`\`
\`\`\`
a1b2c3d Initial commit
\`\`\`

\`\`\`bash
git log --oneline --graph --all
\`\`\`
\`\`\`
* a1b2c3d (HEAD -> main) Initial commit
\`\`\`

\`--oneline\` condenses each commit to a short hash and its message — the view you'll reach for constantly once history has more than a couple of commits. \`--graph\` draws the branch/merge structure as ASCII art, and \`--all\` shows every branch, not just the one you're currently on — combined, this is one of the most useful commands in this whole course for understanding a project's shape at a glance.

### Filtering history

\`\`\`bash
git log -3                       # last 3 commits
git log --author="Ada"           # commits by a specific author
git log --since="2 weeks ago"    # commits after a relative or absolute date
git log -- README.md             # commits that touched one specific file
\`\`\`

\`git log\` accepts a long list of filters, all combinable — this is genuinely useful for real archaeology, like finding out who last touched a file and why.

### Inspecting one commit in detail

\`\`\`bash
git show a1b2c3d
\`\`\`

\`git show <hash>\` displays everything about one specific commit: its metadata (same as \`git log\`) plus the *actual diff* — every line that was added or removed. Where \`git log\` tells you *that* something changed, \`git show\` tells you exactly *what* changed.

> **Key idea:** \`git log --oneline --graph --all\` is the fastest way to see a project's shape; \`git show <hash>\` drills into exactly one commit's full diff — and \`HEAD\` always means "the commit you currently have checked out," a term you'll see everywhere from here on.`,
    },
  ],
}
