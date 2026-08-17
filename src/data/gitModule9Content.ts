import type { Module } from "../types"

export const gitModule9: Module = {
  id: 9,
  title: "Stashing, Tags & Housekeeping",
  status: "upcoming",
  lessons: [
    {
      name: "Stashing Work in Progress",
      minutes: 7,
      intro: "A temporary shelf for unfinished changes you need out of the way, right now.",
      content: `### The problem stash solves

\`\`\`bash
git switch other-branch
error: Your local changes to the following files would be overwritten by checkout
\`\`\`

You're mid-change, nowhere near ready to commit, and suddenly need to switch branches — to fix an urgent bug, check something on \`main\`, or just aren't ready to commit yet but need a clean working directory. Committing an unfinished, half-broken change just to switch branches is awkward; \`git stash\` solves exactly this.

### Stashing and restoring

\`\`\`bash
git stash
\`\`\`
\`\`\`
Saved working directory and index state WIP on feature-login: a1b2c3d Add login form
\`\`\`

\`git stash\` takes every uncommitted change (both staged and unstaged) and stores it away on a stack, restoring your working directory to a clean state matching the last commit — as if the changes never happened, but genuinely recoverable.

\`\`\`bash
git stash pop
\`\`\`

\`git stash pop\` reapplies the most recently stashed changes to your working directory, and removes them from the stash stack. This is the version you'll use most: grab your stashed work back, exactly where you left off.

### The stash is a stack — you can have several

\`\`\`bash
git stash list
\`\`\`
\`\`\`
stash@{0}: WIP on feature-login: a1b2c3d Add login form
stash@{1}: WIP on main: d4e5f6a Fix typo in README
\`\`\`

You can stash multiple times without popping in between — each stash gets pushed onto a stack, most recent first (\`stash@{0}\`). \`git stash apply stash@{1}\` reapplies a specific, older stash without touching the ones above it; \`apply\` (unlike \`pop\`) leaves the stash in the list afterward, useful if you might want to apply the same stash again elsewhere.

### Stashing with a descriptive message

\`\`\`bash
git stash push -m "half-finished refactor of the auth module"
\`\`\`

With more than one stash sitting around, "WIP on feature-login" entries become genuinely hard to tell apart — \`push -m\` (the more explicit, modern form of plain \`git stash\`) lets you label each one, which is worth the extra few words of typing the moment you have two or more stashes at once.

### Including untracked files

\`\`\`bash
git stash -u
\`\`\`

Plain \`git stash\` ignores new, untracked files entirely — they're left sitting in your working directory. \`-u\` (\`--include-untracked\`) sweeps those up into the stash too, useful when your unfinished work includes brand-new files that haven't been \`git add\`'ed yet.

> **Key idea:** \`git stash\` shelves all uncommitted work (staged and unstaged) onto a stack, cleaning your working directory instantly; \`git stash pop\` restores the most recent one — a genuinely everyday tool for "I need a clean working directory right now, but I'm not done with this."`,
    },
    {
      name: "Tags: Lightweight vs. Annotated",
      minutes: 6,
      intro: "Marking a specific commit as meaningful — most commonly, a release.",
      content: `### What a tag is for

A **tag** is a permanent, human-readable name pointing at one specific commit — unlike a branch, a tag doesn't move as new commits are made; it marks one exact point in history forever (by convention — nothing technically prevents deleting or moving one, but doing so is unusual and generally discouraged). The overwhelmingly common use case is marking release points: \`v1.0.0\`, \`v2.3.1\`, and so on.

### Lightweight tags: just a name

\`\`\`bash
git tag v1.0.0
git tag v1.0.0 a1b2c3d      # tag a specific past commit, not just the current one
\`\`\`

A lightweight tag is the simplest possible form — barely more than a branch that never moves. It has no message, no author, no date of its own; it's just a name pointing at a commit.

### Annotated tags: a full, permanent object

\`\`\`bash
git tag -a v1.0.0 -m "First stable release"
git show v1.0.0
\`\`\`
\`\`\`
tag v1.0.0
Tagger: Ada Lovelace <ada@example.com>
Date:   Mon Aug 17 10:00:00 2026 +0000

First stable release

commit a1b2c3d4e5f...
\`\`\`

An annotated tag (\`-a\`) is a genuine, separate object in Git's database — it stores a message, the tagger's name and email, and a date, all independent from the commit it points at. This is the recommended form for anything meaningful, like an actual release, since it carries real metadata about the release itself, not just a bare pointer.

### Listing and viewing tags

\`\`\`bash
git tag                    # list every tag
git tag -l "v1.*"          # filter by pattern
git show v1.0.0            # full details plus the commit's diff
\`\`\`

Tags support the same pattern-matching as many other Git listing commands, useful once a project has accumulated dozens of version tags over its lifetime.

### Pushing tags to a remote

\`\`\`bash
git push origin v1.0.0        # push one specific tag
git push origin --tags        # push every tag at once
\`\`\`

Critically, tags are **not** pushed automatically along with a normal \`git push\` — they need this explicit, separate step. This surprises people the first time: you can tag a release locally and be genuinely confused later about why it's missing from GitHub's releases page, simply because the tag itself was never pushed.

### Deleting a tag

\`\`\`bash
git tag -d v1.0.0                    # delete locally
git push origin --delete v1.0.0       # delete from the remote
\`\`\`

Same two-step pattern you saw with branches: local and remote deletion are separate operations, each needing its own command.

> **Key idea:** a tag marks one specific commit permanently, most commonly for releases — lightweight tags are just a name, annotated tags (\`-a\`, with \`-m\`) carry real metadata and are the recommended default for anything meaningful; tags require an explicit \`git push --tags\` (or a named tag) to reach the remote at all.`,
    },
    {
      name: "Aliases & Git Configuration",
      minutes: 6,
      intro: "Shaving real time off commands you type dozens of times a day.",
      content: `### Creating a simple alias

\`\`\`bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
\`\`\`

An alias lets you type \`git st\` instead of \`git status\` — trivial individually, but these are commands you'll type an enormous number of times over a career, and shaving a few keystrokes off each adds up in a real, if modest, way. These four (\`st\`, \`co\`, \`br\`, \`ci\`) are close to a universal convention among experienced Git users.

### More powerful aliases combining flags

\`\`\`bash
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.undo "reset --soft HEAD~1"
\`\`\`

Aliases aren't limited to renaming a single command — you can bundle an entire set of flags you always use together into one short word. \`git lg\` for the graph view from module 3, or \`git undo\` for the common "undo my last commit, keep everything staged" pattern from module 5, are both genuinely popular examples.

### Where aliases (and all config) live

\`\`\`bash
cat ~/.gitconfig
\`\`\`
\`\`\`
[user]
	name = Ada Lovelace
	email = ada@example.com
[alias]
	st = status
	co = checkout
	lg = log --oneline --graph --all
\`\`\`

Every \`git config --global\` command writes to this one plain-text file — you can also just open it directly in a text editor and add or edit entries by hand, which is often faster than typing out several separate \`git config\` commands.

### Useful non-alias config

\`\`\`bash
git config --global core.autocrlf input     # line-ending normalization (Mac/Linux)
git config --global pull.rebase true         # default git pull to rebase, not merge
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
\`\`\`

Beyond aliases, a handful of config values are worth setting once on any new machine — \`pull.rebase true\` in particular changes the default behavior of \`git pull\` covered back in module 6, from a merge to a rebase, matching a workflow preference many developers settle on.

### Per-project config overrides

\`\`\`bash
cd some-work-project
git config user.email "ada@work-company.com"
\`\`\`

Running \`git config\` **without** \`--global\` inside a specific repository sets a local override for just that repository — the standard way to use a different email for work versus personal projects on the same machine, without needing to switch your global setting back and forth.

> **Key idea:** \`git config --global alias.<name> "<command>"\` creates a shortcut for any command (or combination of flags) you type often — all config lives in \`~/.gitconfig\` for global settings, with per-repository local overrides available by omitting \`--global\` inside that repo.`,
    },
    {
      name: "Searching History: log filters, blame, and bisect",
      minutes: 8,
      intro: "Finding exactly who changed what, when, and — in the hardest case — which commit broke something.",
      content: `### Searching commit messages and content

\`\`\`bash
git log --grep="payment"              # commits whose MESSAGE mentions "payment"
git log -S"calculateTotal"            # commits that added/removed this exact string
git log -G"total.*=.*price"           # commits matching a regex pattern in the diff
\`\`\`

\`--grep\` searches commit *messages*; \`-S\` (the "pickaxe") finds commits where a specific string's **count of occurrences changed** — genuinely useful for finding exactly when a function was introduced or removed, which a message search alone can't reliably do. \`-G\` is similar but matches a regex against the actual diff content, not just an occurrence count.

### git blame: who last touched each line

\`\`\`bash
git blame app.js
\`\`\`
\`\`\`
a1b2c3d4 (Ada Lovelace  2026-06-01) function calculateTotal(items) {
d4e5f6a7 (Grace Hopper  2026-07-15)   if (items.length === 0) return 0
a1b2c3d4 (Ada Lovelace  2026-06-01)   return items.reduce((sum, i) => sum + i.price, 0)
\`\`\`

\`git blame <file>\` annotates every line of a file with the commit, author, and date that last changed it — the go-to tool for "who wrote this, and why" when a piece of code is confusing or looks suspicious. Combine it with \`git show <hash>\` on the commit it points to, to see the full context of that change, not just the one line.

### Blame with a twist: -w and following through renames

\`\`\`bash
git blame -w app.js               # ignore whitespace-only changes when attributing lines
git log --follow --oneline app.js  # full history across renames, from module 2
\`\`\`

\`-w\` is a genuinely useful flag for avoiding false attributions — without it, someone who only reformatted indentation gets blamed for a line's *content*, which is misleading.

### git bisect: binary-searching for the commit that broke something

\`\`\`bash
git bisect start
git bisect bad                    # the current commit is broken
git bisect good v1.2.0            # this earlier tagged commit was fine

# Git checks out a commit halfway between — you test it, then say:
git bisect good    # or: git bisect bad

# ... repeat; Git narrows the range by half each time ...
\`\`\`
\`\`\`
a1b2c3d is the first bad commit
\`\`\`

When you know a bug exists now but not exactly when it was introduced, checking every commit one by one between "known good" and "known bad" doesn't scale. \`git bisect\` performs a **binary search** instead: it checks out a commit roughly halfway between the two, you test it and report \`good\` or \`bad\`, and it narrows the range by half again — for a range of, say, 1,000 commits, this finds the exact culprit in about 10 steps instead of up to 1,000.

### Automating bisect with a test script

\`\`\`bash
git bisect start
git bisect bad HEAD
git bisect good v1.2.0
git bisect run npm test
\`\`\`

If you have an automated test (or any script that exits \`0\` for good, nonzero for bad) that reproduces the bug, \`bisect run\` automates the entire search — Git checks out each candidate commit, runs your script, reads the exit code, and narrows the range with zero manual intervention, printing the culprit commit at the end.

> **Key idea:** \`git blame\` finds who last touched each line of a file; \`git log -S"text"\` finds commits that added/removed a specific string; \`git bisect\` (especially \`bisect run\` with an automated test) binary-searches history to pinpoint exactly which commit introduced a bug, turning a linear search through hundreds of commits into roughly a dozen steps.`,
    },
    {
      name: "Cleaning Up",
      minutes: 5,
      intro: "git clean, garbage collection, and keeping a repository tidy.",
      content: `### Removing untracked files with git clean

\`\`\`bash
git clean -n
\`\`\`
\`\`\`
Would remove build/
Would remove temp-notes.txt
\`\`\`

\`git clean -n\` (dry run) shows exactly what *would* be deleted, without deleting anything yet — always run this first. It lists every untracked file and directory (things Git has never tracked at all, distinct from tracked-but-modified files, which \`clean\` never touches).

\`\`\`bash
git clean -f            # actually delete untracked files
git clean -fd           # also delete untracked directories
git clean -fx           # also delete files matched by .gitignore
\`\`\`

\`-f\` (force) is required for \`clean\` to actually delete anything — a deliberate safety requirement, since this is a genuinely destructive, no-undo operation for any file it removes. \`-d\` extends it to untracked directories (ignored by default); \`-x\` additionally removes files your \`.gitignore\` would normally protect (like \`node_modules/\` or \`dist/\`) — useful for a truly from-scratch rebuild, but the most dangerous variant, worth double-checking with \`-n\` first every single time.

### Why "detached history" accumulates, and gc

Every amend, reset, and rebase leaves the *old* version of a commit sitting around, unreachable from any branch but not immediately deleted — this is exactly what makes \`git reflog\` recovery possible. Over time, a very active repository accumulates a meaningful amount of this unreachable data.

\`\`\`bash
git gc
\`\`\`

\`git gc\` (garbage collect) compresses and cleans up this loose, unreachable data, reclaiming disk space and improving performance. Git runs this automatically in the background periodically as part of normal operations — running it manually is rarely necessary, but it exists for cases like a repository that's grown unusually large or slow.

### Pruning stale remote-tracking branches

\`\`\`bash
git fetch --prune
# or, set it permanently:
git config --global fetch.prune true
\`\`\`

Remote-tracking branches (module 6) for branches that have since been deleted *on the remote* don't disappear from your local copy automatically — they linger, cluttering \`git branch -r\` output. \`--prune\` cleans these up during a fetch, and setting it as a permanent default is a common, low-risk habit worth adopting.

### A periodic housekeeping routine

\`\`\`bash
git branch --merged main | grep -v "main\\|master" | xargs -r git branch -d
git fetch --prune
git clean -n
\`\`\`

Combining the \`--merged\` cleanup from module 3 with \`--prune\` and a \`clean\` dry-run is a reasonable, low-effort routine to run periodically on any repository you work in daily — keeping both your local branches and your working directory from accumulating clutter over time.

> **Key idea:** \`git clean -n\` (always run first) previews untracked-file deletion, \`-f\`/\`-fd\`/\`-fx\` progressively widen what gets deleted with no undo; \`git fetch --prune\` clears out stale remote-tracking branches for branches already deleted on the remote — both are cheap, worthwhile habits for keeping an active repository tidy.`,
    },
  ],
}
