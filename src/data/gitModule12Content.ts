import type { Module } from "../types"

export const gitModule12: Module = {
  id: 12,
  title: "Advanced Git & Capstone",
  status: "upcoming",
  lessons: [
    {
      name: "Submodules & Subtrees",
      minutes: 8,
      intro: "Including one Git repository inside another.",
      content: `### The problem: a repository that depends on another repository

Occasionally a project needs to include another entire Git repository as part of itself — a shared internal library, a vendored dependency you need to track at the source level rather than through a package manager. Git offers two genuinely different solutions to this: submodules and subtrees.

### Submodules: a pointer to a specific commit of another repo

\`\`\`bash
git submodule add https://github.com/ada/shared-lib.git libs/shared-lib
git commit -m "Add shared-lib as a submodule"
\`\`\`

A **submodule** doesn't copy another repository's files into yours — it records a reference to a *specific commit* of that other repository, in a special \`.gitmodules\` file, at a specific path. Your repository stays lightweight; the submodule's actual content lives in its own separate \`.git\` history, checked out into that subdirectory.

### Cloning a repository that has submodules

\`\`\`bash
git clone --recurse-submodules https://github.com/ada/main-project.git
# or, if you already cloned without that flag:
git submodule update --init --recursive
\`\`\`

This is the single most common submodule mistake: a plain \`git clone\` leaves submodule directories **empty** — you have to explicitly ask Git to also fetch and check out the submodules' content, either at clone time or afterward.

### Updating a submodule to a newer commit

\`\`\`bash
cd libs/shared-lib
git pull origin main
cd ../..
git add libs/shared-lib
git commit -m "Update shared-lib to latest main"
\`\`\`

Bumping a submodule to a newer version of the other repository is itself a two-step commit: update the submodule's own checkout, then commit *in the parent repository* that you're now pointing at a different commit hash for that submodule.

### Subtrees: an alternative that copies content in directly

\`\`\`bash
git subtree add --prefix=libs/shared-lib https://github.com/ada/shared-lib.git main --squash
\`\`\`

A **subtree** takes the opposite approach: it actually merges the other repository's files directly into yours, as real, ordinary tracked files, with no separate \`.gitmodules\` reference and no risk of an "empty folder" clone surprise. The tradeoff: your repository grows larger (it now genuinely contains that history), and pushing updates back upstream to the original repository is more involved than with a submodule.

### Which to reach for

Submodules fit best when the dependency changes independently and you want a clean, explicit pointer to exactly which version you're using. Subtrees fit best when you want the simplicity of "it's just part of my repo" for anyone cloning it, and don't need to frequently push changes back to the original. Both are genuinely more complex than a normal package manager dependency, and many teams reach for one only when a package manager truly isn't a good fit for the situation.

> **Key idea:** a submodule stores a lightweight *pointer* to a specific commit of another repository (requiring \`--recurse-submodules\` or \`submodule update --init\` to actually populate); a subtree *merges* another repository's content directly in as real tracked files — both solve "repository inside a repository," with real tradeoffs in either direction.`,
    },
    {
      name: "Worktrees: Multiple Checkouts at Once",
      minutes: 6,
      intro: "Working on two branches simultaneously, without stashing or cloning twice.",
      content: `### The problem worktrees solve

You're deep in unfinished work on \`feature-login\`, and an urgent bug needs fixing on \`main\` right now. Module 9 covered \`git stash\` for exactly this kind of interruption — but stashing means completely leaving your in-progress branch's checked-out state, and switching back and forth is friction if this happens often, or if you genuinely want both checked out and visible at once (in two editor windows, say).

### Creating a worktree

\`\`\`bash
git worktree add ../my-project-hotfix main
cd ../my-project-hotfix
\`\`\`

\`git worktree add <path> <branch>\` checks out \`main\` into a **separate folder**, entirely independent from your primary working directory — but both folders share the exact same underlying \`.git\` repository (the same commits, branches, and history, all internally consistent). You now have two genuinely separate working directories, each with a different branch checked out, with no stashing and no need to clone the repository a second time.

### Working across both

\`\`\`bash
# in ../my-project (original), on feature-login — untouched, exactly as you left it
# in ../my-project-hotfix (new worktree), on main — fix the bug, commit, push
git push origin main
\`\`\`

Each worktree behaves like an entirely normal working directory — you can edit, stage, and commit in either one independently, and both immediately see each other's commits (since they share the same repository) the moment you check \`git log\` or switch branches, without any fetching or pulling needed.

### Listing and removing worktrees

\`\`\`bash
git worktree list
\`\`\`
\`\`\`
/home/ada/my-project          a1b2c3d [feature-login]
/home/ada/my-project-hotfix   d4e5f6a [main]
\`\`\`

\`\`\`bash
git worktree remove ../my-project-hotfix
\`\`\`

Removing a worktree you're finished with cleans up both the folder and Git's internal tracking of it — much cleaner than manually deleting the directory, which would leave stale internal references behind.

### A genuinely common real use case

Beyond urgent interruptions, worktrees are popular for running a slow test suite or a long build against one branch while continuing to code on another, or for reviewing a colleague's PR branch in its own folder without disturbing your own in-progress work at all — no stash, no context-switch, no risk of accidentally mixing the two.

> **Key idea:** \`git worktree add <path> <branch>\` checks out a branch into an entirely separate folder while sharing the same underlying repository — genuinely useful for working on two branches literally at the same time, without the back-and-forth of stashing and switching.`,
    },
    {
      name: "Git Hooks: Automating Your Workflow",
      minutes: 8,
      intro: "Running your own scripts automatically at key points in Git's workflow.",
      content: `### What a hook is

A **hook** is a script Git runs automatically at a specific point in its workflow — before a commit is finalized, after a checkout, before a push, and many other points. They live in \`.git/hooks/\`, and Git ships that folder pre-populated with sample scripts (named like \`pre-commit.sample\`) — rename one (dropping \`.sample\`) and make it executable to activate it.

### A simple pre-commit hook

\`\`\`bash
#!/bin/sh
# .git/hooks/pre-commit
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed — commit aborted."
  exit 1
fi
\`\`\`

\`\`\`bash
chmod +x .git/hooks/pre-commit
\`\`\`

A \`pre-commit\` hook runs right before Git finalizes a commit — if the script exits with a nonzero status, the commit is aborted entirely, before it's ever written to history. This is a genuinely common real use: automatically running a linter or a fast subset of tests, catching an obvious mistake before it ever becomes a commit rather than after.

### Other common hooks

\`\`\`
pre-commit    — before a commit is created (linting, fast tests)
commit-msg    — validate or modify the commit message itself (enforcing Conventional Commits, module 10)
pre-push      — before pushing to a remote (run the full test suite one last time)
post-checkout — after switching branches (e.g., auto-install dependencies if package.json changed)
\`\`\`

Each hook receives relevant context as arguments or environment variables (\`commit-msg\`, for instance, receives the path to a temp file containing the message, letting a script validate or even rewrite it) — the exact mechanics vary per hook, documented in Git's own reference.

### The real problem with .git/hooks: it isn't shared

Here's the catch that trips up nearly every team the first time: \`.git/hooks/\` lives **inside** \`.git\`, which is never tracked or pushed — every teammate who clones the repository gets an empty hooks folder, with none of your carefully written hooks active for them at all. A hook you set up only helps you, locally, unless you solve this distribution problem separately.

### Solving it with a hook manager

\`\`\`bash
npm install --save-dev husky
npx husky init
echo "npm run lint" > .husky/pre-commit
\`\`\`

Tools like **Husky** (for Node projects) solve exactly this: hook scripts live in a regular, tracked directory (\`.husky/\`) inside the repository itself, and Husky installs them into \`.git/hooks/\` automatically for every teammate the moment they run \`npm install\` — turning "a hook I have locally" into "a hook the whole team actually runs," which is what makes hooks genuinely useful on a real team rather than just a personal convenience.

> **Key idea:** hooks are scripts Git runs automatically at points like \`pre-commit\` or \`pre-push\`, living in \`.git/hooks/\` — but that folder is never tracked or shared by default, so real teams use a tool like Husky to keep hook scripts in the repository itself and install them automatically for every contributor.`,
    },
    {
      name: "Debugging with git bisect: A Hands-On Walkthrough",
      minutes: 7,
      intro: "Putting the binary-search debugging tool from module 9 into full practice.",
      content: `### Setting the scene

\`\`\`bash
git log --oneline
\`\`\`
\`\`\`
f8e9d0c (HEAD -> main) Update dependency versions
e7f8e9d Refactor checkout total calculation
d6e7f8e Add gift card redemption
c5d6e7f Add coupon code support
b4c5d6e Add tax calculation
a3b4c5d Initial checkout flow
\`\`\`

Imagine discount codes are silently applying twice on checkout — a real bug, but you don't know which of these six commits introduced it, and \`f8e9d0c\` (current \`HEAD\`) is confirmed broken. \`a3b4c5d\`, the very first commit, is confirmed fine (there was no discount logic at all yet).

### Starting the bisect

\`\`\`bash
git bisect start
git bisect bad HEAD
git bisect good a3b4c5d
\`\`\`
\`\`\`
Bisecting: 2 revisions left to test after this (roughly 2 steps)
[c5d6e7f] Add coupon code support
\`\`\`

Git automatically checks out a commit roughly halfway through the range (\`c5d6e7f\` here) and tells you how many steps remain, roughly — this is the binary search in action: 5 candidate commits collapse to about 2-3 test steps instead of testing all 5 individually.

### Testing and narrowing

\`\`\`bash
# manually test the discount code behavior on this checkout
git bisect good        # this commit is NOT broken — the bug is later
\`\`\`
\`\`\`
Bisecting: 0 revisions left to test after this (roughly 1 step)
[e7f8e9d] Refactor checkout total calculation
\`\`\`

\`\`\`bash
git bisect bad          # this one IS broken
\`\`\`
\`\`\`
e7f8e9d is the first bad commit
\`\`\`

Two test steps, and bisect has pinpointed the exact commit: the checkout total refactor is where the double-discount bug was introduced — not the coupon code commit itself, which is the kind of non-obvious result bisect is genuinely good at finding (the bug wasn't in the feature that seems most related; it was in a "refactor" that seemed safe).

### Cleaning up

\`\`\`bash
git bisect reset
\`\`\`

\`bisect reset\` returns you to the branch and commit you were on before starting — always run this once you've found the culprit, since bisect leaves you in a detached HEAD state (module 11) on whatever commit you last tested.

### Now that you know the commit

\`\`\`bash
git show e7f8e9d
\`\`\`

With the exact culprit identified, \`git show\` (module 1) reveals the precise diff — often enough on its own to spot the actual mistake, turning what started as "somewhere in six commits and an unfamiliar part of the codebase" into a focused, five-second read of one specific, small diff.

> **Key idea:** this is the full \`bisect start\` → \`bisect bad\`/\`bisect good\` (repeated, narrowing the range each time) → \`bisect reset\` loop from module 9, worked through concretely — turning "the bug is somewhere in these N commits" into an exact culprit in roughly log₂(N) test steps.`,
    },
    {
      name: "Capstone: A Realistic End-to-End Git Workflow",
      minutes: 10,
      intro: "Every concept from this course, applied together in one continuous scenario.",
      content: `### The scenario

You're adding a "dark mode" feature to a small team project. Walking through this from start to finish exercises nearly every concept from this entire course, in the order you'd actually use them on a real team.

### 1. Start from an up-to-date main, branch, and work incrementally

\`\`\`bash
git switch main
git pull
git switch -c feature/dark-mode-toggle

git add src/theme.js
git commit -m "feat(theme): add dark mode state and toggle function"
git add src/components/Header.js
git commit -m "feat(header): wire dark mode toggle button into header"
\`\`\`

Short-lived branch, from up-to-date \`main\` (modules 3, 10), Conventional Commit messages explaining the *why* alongside the *what* (modules 2, 10) — two atomic, logically separate commits rather than one giant one.

### 2. Realize you need to fix your own recent work, before anyone's seen it

\`\`\`bash
git add src/theme.js       # forgot to export one function
git commit --amend --no-edit
\`\`\`

Since this commit hasn't been pushed yet, amending it is completely safe (module 5) — no golden-rule violation, since nobody else could possibly have pulled it.

### 3. Stash to handle an urgent interruption, then return

\`\`\`bash
git stash push -m "wip: dark mode CSS variables"
git switch main
git switch -c hotfix/broken-signup-link
# ... fix, commit, push, PR merged elsewhere ...
git switch feature/dark-mode-toggle
git stash pop
\`\`\`

An urgent bug interrupts you mid-work — stash (module 9) shelves your unfinished CSS changes cleanly, letting you fully context-switch to the hotfix and back without losing anything or awkwardly committing half-finished work.

### 4. Push, open a PR, and keep it in sync with main while it's reviewed

\`\`\`bash
git push -u origin feature/dark-mode-toggle
# open PR on GitHub (module 7); review requested

# a day later, main has moved on — sync before it drifts too far
git fetch origin
git rebase origin/main
git push --force-with-lease
\`\`\`

Pushing establishes the upstream tracking link (module 6); the PR triggers CI checks and review (module 7); rebasing onto \`main\`'s latest keeps history linear and the eventual merge trivial (module 8) — \`--force-with-lease\`, not plain \`--force\`, since this branch is now shared with reviewers (the golden rule, module 8).

### 5. Address review feedback, resolve a real conflict, and clean up history

\`\`\`bash
git add src/theme.js
git commit -m "fix: address review feedback on theme variable naming"
git push

git fetch origin
git rebase origin/main
# CONFLICT in src/theme.js — someone else touched the same lines
# ... resolve, remove markers ...
git add src/theme.js
git rebase --continue
git push --force-with-lease

git rebase -i HEAD~4      # squash the review-feedback and wip-fix commits together
git push --force-with-lease
\`\`\`

A genuine conflict during the rebase, resolved exactly like a merge conflict (modules 4, 8); an interactive rebase squashing the messier, in-progress commits into clean ones before final merge (module 8) — leaving a readable history for anyone who looks at this later.

### 6. Merge, tag a release, and clean up

\`\`\`bash
# PR approved, CI green, branch protection satisfied (module 10) -- merged via GitHub

git switch main
git pull
git branch -d feature/dark-mode-toggle
git tag -a v2.4.0 -m "Add dark mode support"
git push origin v2.4.0
\`\`\`

The finished feature lands on \`main\` through a protected, reviewed PR (module 10); the local branch is deleted now that its work is safely merged elsewhere (module 3); and the release is marked permanently with an annotated tag, explicitly pushed since tags don't travel automatically (module 9).

### What this scenario demonstrates

Every command here traces back to a specific lesson in this course — and, as the internals module showed, every one of them ultimately resolves down to the same handful of underlying concepts: commits as snapshots, branches as movable pointers, and refs mapping human names onto a content-addressed object database. That's the real destination of this entire course: not memorizing a list of commands, but a working, connected mental model you can reason through in any situation Git throws at you, including ones this course never explicitly covered.

> **Key idea:** a realistic feature, start to finish, touches branching, atomic commits, amending, stashing, remotes, pull requests, rebasing, conflict resolution, squashing, tagging, and cleanup — not as a checklist to memorize separately, but as one continuous, connected workflow built on the small set of core ideas covered throughout this entire course.`,
    },
  ],
}
