import type { Module } from "../types"

export const gitModule2: Module = {
  id: 2,
  title: "The Core Workflow: Tracking Changes",
  status: "upcoming",
  lessons: [
    {
      name: "Staging Changes: git add in Depth",
      minutes: 8,
      intro: "Precise control over exactly what goes into your next commit.",
      content: `### Staging isn't all-or-nothing

\`\`\`bash
git add file1.js              # one specific file
git add src/ tests/           # entire directories
git add "*.md"                 # every file matching a pattern
git add .                      # everything below the current directory
\`\`\`

You can stage as narrowly or broadly as you want. This matters because it lets you build **focused commits** — if you've been editing three unrelated things at once, you can stage and commit just one of them, leaving the others in your working directory for later.

### Staging part of a file: git add -p

\`\`\`bash
git add -p file.js
\`\`\`
\`\`\`
@@ -12,6 +12,9 @@ function calculateTotal(items) {
+  if (items.length === 0) return 0
+
Stage this hunk [y,n,q,a,d,s,e,?]?
\`\`\`

\`git add -p\` (patch mode) walks through your changes one **hunk** (a contiguous block of changed lines) at a time and asks whether to stage each one individually. This is the tool for splitting one file's changes into multiple logical commits — press \`y\` to stage a hunk, \`n\` to skip it, \`s\` to try splitting it into smaller hunks, or \`q\` to stop. It feels slow at first but becomes second nature, and disciplined developers use it constantly to keep commits clean.

### Unstaging a file

\`\`\`bash
git restore --staged file.js
\`\`\`

If you've staged something by mistake, \`git restore --staged\` moves it back out of the staging area without touching the actual changes in your working directory — the edits are still there, just no longer marked for the next commit. (Older tutorials use \`git reset HEAD file.js\` for the same thing — both still work; \`restore\` is the modern, clearer-named command, introduced specifically to make staging-related commands less confusing.)

### Checking exactly what's staged

\`\`\`bash
git status                 # summary: which files are staged
git diff --staged          # the actual line-by-line staged changes
\`\`\`

\`git status\` tells you *which files* are staged; \`git diff --staged\` (also written \`--cached\`) shows the *actual content* that will go into the next commit — always worth a glance right before committing, so there are no surprises in what you're about to record.

> **Key idea:** \`git add\` supports files, directories, and patterns, but \`git add -p\` gives you hunk-by-hunk control for building precise, focused commits out of a messy working directory — and \`git restore --staged\` undoes an accidental \`git add\` without losing any actual work.`,
    },
    {
      name: "Reviewing Changes: git diff",
      minutes: 7,
      intro: "Reading exactly what changed, before you stage or commit it.",
      content: `### Working directory vs. staging area

\`\`\`bash
git diff
\`\`\`

Plain \`git diff\` (no arguments) shows the difference between your **working directory** and the **staging area** — in other words, changes you've made but haven't staged yet. Once you stage a file, it disappears from this view (since staged content now matches, by definition, what's in the staging area).

### Staged changes vs. the last commit

\`\`\`bash
git diff --staged
\`\`\`

This shows the difference between the **staging area** and the last commit — exactly what will be recorded if you run \`git commit\` right now. Between these two commands, you can always answer "what exactly is about to happen?" at any point in the workflow.

### Reading diff output

\`\`\`diff
diff --git a/app.js b/app.js
index e69de29..8f3a1c2 100644
--- a/app.js
+++ b/app.js
@@ -10,6 +10,8 @@ function greet(name) {
   console.log("Hello, " + name)
+  console.log("Welcome!")
+
   return true
 }
\`\`\`

Lines starting with \`-\` were removed, lines with \`+\` were added, and unmarked lines are unchanged context shown so the change makes sense at a glance. The \`@@ -10,6 +10,8 @@\` line is a **hunk header** — it tells you where in the file this block of changes starts and how many lines it spans, in the old and new versions respectively.

### Comparing specific things

\`\`\`bash
git diff HEAD~1 HEAD          # last commit vs. the one before it
git diff main feature         # one branch vs. another
git diff -- file.js           # limit the diff to one file
git diff --stat                # just a summary of files changed, not full content
\`\`\`

\`git diff\` accepts almost any two things that identify a snapshot — commits, branches, or the special references you'll learn about soon — making it useful well beyond the basic working-directory-vs-staged case. \`--stat\` is worth knowing for a quick "how big was this change" overview without scrolling through every line.

> **Key idea:** plain \`git diff\` is working directory vs. staged; \`git diff --staged\` is staged vs. last commit — together they let you inspect a change at every stage before it becomes permanent history.`,
    },
    {
      name: "Writing Good Commits",
      minutes: 9,
      intro: "What makes a commit message actually useful six months from now.",
      content: `### The two-part anatomy of a good commit message

\`\`\`
Add retry logic to the payment webhook handler

Webhook deliveries were failing silently on transient network
errors. This adds up to 3 retries with exponential backoff
before giving up and logging to the dead-letter queue.
\`\`\`

A good commit message has a short **summary line** (ideally under ~50 characters, written in the imperative mood — "Add", not "Added" or "Adds") followed by a blank line and an optional longer **body** explaining *why* the change was made, not just what changed. The "what" is usually visible in the diff itself; the "why" is the part that disappears forever if you don't write it down, and it's the part someone reading this commit in a year will actually need.

### Writing a multi-line message

\`\`\`bash
git commit -m "Add retry logic to the payment webhook handler" \\
           -m "Webhook deliveries were failing silently on transient
network errors. Retries up to 3 times with backoff."

# or, without -m at all, to open your configured editor:
git commit
\`\`\`

Using \`-m\` twice creates a summary line and a body paragraph. For anything longer or more carefully worded, running \`git commit\` with no \`-m\` opens your editor, which is usually more comfortable for writing more than one sentence.

### Atomic commits: one logical change per commit

A commit should represent **one coherent, self-contained change** — not "fixed a bunch of stuff" covering five unrelated files. Atomic commits matter for reasons that only show up later: \`git revert\` (undoing one commit) is safe and predictable; \`git bisect\` (binary-searching history for a bug) actually works; and anyone reading history — including future you — can understand *what happened* commit by commit instead of untangling one giant diff.

### What makes a commit message bad

\`\`\`
fix                    # fix what?
updates                # what was updated, and why?
asdf                   # tells the reader nothing at all
final fix for real this time    # a sign the previous commits should've been squashed
\`\`\`

These are common, and every one of them fails the test that matters: could a teammate (or you, in six months) understand what happened and why, without re-reading the entire diff? If not, the message has failed at its one job.

> **Key idea:** a good commit message explains **why**, not just what (the diff already shows what); write summary lines in the imperative mood under ~50 characters, and keep commits atomic — one logical change each — since that's what makes \`revert\`, \`bisect\`, and history review actually work well later.`,
    },
    {
      name: "Ignoring Files: .gitignore",
      minutes: 7,
      intro: "Keeping build output, secrets, and machine-specific files out of history.",
      content: `### Creating a .gitignore

\`\`\`bash
# .gitignore
node_modules/
dist/
*.log
.env
.DS_Store
\`\`\`

A file named exactly \`.gitignore\`, placed at the root of your repository, tells Git which files and folders to never treat as untracked — they simply won't show up in \`git status\` or get staged by \`git add .\`. Every serious project has one: dependency folders (\`node_modules/\`), build output (\`dist/\`, \`build/\`), secrets and local config (\`.env\`), OS clutter (\`.DS_Store\`), and editor-specific files are the classic candidates.

### Pattern syntax

\`\`\`
*.log              # any file ending in .log, anywhere
/config.json        # only config.json at the repo root, not nested copies
logs/               # an entire directory, wherever it appears
!important.log      # an exception — un-ignore one specific file
\`\`\`

Patterns support wildcards (\`*\`), a leading \`/\` to anchor to the repo root instead of matching everywhere, a trailing \`/\` to match directories specifically, and a leading \`!\` to carve out an exception to an earlier, broader rule.

### .gitignore only affects untracked files

\`\`\`bash
git rm --cached config.json
echo "config.json" >> .gitignore
\`\`\`

This is the single most common \`.gitignore\` mistake: adding a pattern to \`.gitignore\` does **nothing** to a file Git is already tracking — it only stops *new, untracked* files from matching. If a file was committed before you added it to \`.gitignore\`, you have to explicitly stop tracking it with \`git rm --cached <file>\` (which removes it from Git's tracking and the next commit, but leaves the actual file on disk) before the ignore rule takes effect.

### Global gitignore for personal, machine-specific files

\`\`\`bash
git config --global core.excludesfile ~/.gitignore_global
\`\`\`

Editor swap files or OS-specific junk that's about *your* machine, not the project, don't belong in a project's shared \`.gitignore\` (which is itself committed and shared with every collaborator). A global excludes file, set once per machine, keeps that clutter out of every repository without polluting the shared \`.gitignore\` other contributors see.

> **Key idea:** \`.gitignore\` only prevents Git from noticing *new* files — it does nothing for files already tracked, which need an explicit \`git rm --cached\` first; use a global excludes file for personal, machine-specific ignores instead of adding them to a shared project \`.gitignore\`.`,
    },
    {
      name: "Renaming, Moving & Removing Files",
      minutes: 6,
      intro: "Keeping history accurate when files move, get renamed, or disappear.",
      content: `### Removing a tracked file

\`\`\`bash
git rm old-file.js
git commit -m "Remove unused old-file.js"
\`\`\`

\`git rm\` deletes the file from your working directory **and** stages that removal in one step — the next commit will record that the file is gone. Using plain \`rm\` (the shell command) only deletes the file from disk; Git will then show it as staged-for-deletion only after you separately run \`git add\`, so \`git rm\` is simply the one-step version of that.

### Removing from Git but keeping the file on disk

\`\`\`bash
git rm --cached secrets.env
\`\`\`

This is the command from the previous lesson — it untracks a file (staging its removal from history going forward) while leaving the actual file sitting on disk untouched. The standard use case: a file was committed by accident and needs to stop being tracked, but you still want to keep it locally.

### Renaming or moving a file

\`\`\`bash
git mv old-name.js new-name.js
# equivalent to:
mv old-name.js new-name.js && git rm old-name.js && git add new-name.js
\`\`\`

\`git mv\` is a convenience wrapper — it performs the rename on disk and stages both halves (the removal of the old name, the addition of the new one) in a single command. You could do the same thing manually with the shell's \`mv\` plus \`git add\`/\`git rm\`, but \`git mv\` is one command instead of three.

### Git detects renames automatically, even without git mv

\`\`\`bash
git log --follow new-name.js
\`\`\`

Here's a detail that surprises people: Git doesn't actually store "this was renamed" as a special record. Instead, when you view history, Git *compares file contents* between commits and detects that a new file is similar enough to a deleted one to display it as a rename — this works whether or not you used \`git mv\`, plain \`mv\`, or even renamed the file in a file browser outside Git entirely. \`git log --follow <file>\` continues showing a file's history across renames, which is genuinely useful for tracing a file's full history even after it's been renamed multiple times.

> **Key idea:** \`git rm\` deletes and stages the deletion in one step (\`--cached\` to untrack without deleting the actual file); \`git mv\` is a one-command rename+stage; and Git detects renames by comparing file *content* after the fact rather than storing an explicit "renamed" record.`,
    },
  ],
}
