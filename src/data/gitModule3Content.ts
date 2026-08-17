import type { Module } from "../types"

export const gitModule3: Module = {
  id: 3,
  title: "Branching",
  status: "upcoming",
  lessons: [
    {
      name: "What a Branch Really Is",
      minutes: 8,
      intro: "The surprisingly simple truth behind Git's most powerful feature.",
      content: `### A branch is just a movable pointer

\`\`\`
main:  A -- B -- C
                  ^
                 main  (and HEAD, if you're on this branch)
\`\`\`

This is the single fact that demystifies branching: a Git branch is nothing more than a small file containing a commit hash — a **pointer** to one specific commit. That's it. There's no copying of files, no separate storage for a branch's contents; \`main\` is just a name that points at commit \`C\`. This is exactly why creating a branch in Git is nearly instantaneous, unlike some older version control systems where branching meant copying the entire codebase.

### What happens when you commit

\`\`\`
Before:  A -- B -- C
                    ^
                   main

After committing D:  A -- B -- C -- D
                                     ^
                                    main
\`\`\`

Committing while on a branch does two things: it creates the new commit, pointing back at the previous one, and then moves the branch pointer forward to point at this new commit. The branch pointer always automatically follows the tip of its own history as you commit — you never move it manually during normal work.

### HEAD: where you currently are

\`\`\`
main:     A -- B -- C -- D
                          ^
                       HEAD -> main
\`\`\`

**HEAD** is a second pointer — it points at whichever branch (or, in rarer cases, a specific commit) you currently have checked out. Normally \`HEAD\` points *at a branch name*, which in turn points at a commit — so HEAD moves automatically whenever the branch you're on gains a new commit. This two-level indirection (HEAD → branch → commit) is exactly what makes switching branches work.

### Creating a second branch

\`\`\`
main:     A -- B -- C -- D
                          ^
                    main, feature
\`\`\`

When you create a new branch, it starts out pointing at the *exact same commit* as the branch you branched from — the history isn't duplicated, you just now have two names pointing at the same place, free to diverge as each accumulates its own new commits.

> **Key idea:** a branch is just a lightweight, movable pointer to a commit, not a copy of your files — and \`HEAD\` tracks which branch you currently have checked out, moving automatically as that branch gains new commits.`,
    },
    {
      name: "Creating & Switching Branches",
      minutes: 8,
      intro: "git branch, git switch, and the older git checkout.",
      content: `### Creating a branch

\`\`\`bash
git branch feature-login
git branch
\`\`\`
\`\`\`
  feature-login
* main
\`\`\`

\`git branch <name>\` creates a new branch pointer at your current commit, but does **not** switch you onto it — you stay on your current branch (the \`*\` in the listing shows which one that is). This trips people up initially: creating a branch and switching to it are two separate actions.

### Switching branches

\`\`\`bash
git switch feature-login
# or, the older equivalent:
git checkout feature-login
\`\`\`

\`git switch\` moves \`HEAD\` to point at the given branch, and updates every file in your working directory to match that branch's snapshot. \`git switch\` is the modern, purpose-built command (introduced specifically because \`git checkout\` had become overloaded with too many unrelated jobs — switching branches, restoring files, and more, all under one command name); both do the same job for this use case, and you'll see \`checkout\` constantly in older tutorials and existing muscle memory.

### Creating and switching in one step

\`\`\`bash
git switch -c feature-signup
# equivalent to:
git checkout -b feature-signup
\`\`\`

This is the version you'll actually type most often — starting a new piece of work almost always means "create a branch for this, and go there," and both tools offer a single flag for exactly that combined action.

### Switching with uncommitted changes

\`\`\`bash
git switch other-branch
error: Your local changes to the following files would be overwritten by checkout:
	app.js
Please commit your changes or stash them before you switch branches.
\`\`\`

Git refuses to switch branches if doing so would silently overwrite uncommitted changes that conflict with the target branch — this is a safety feature, not a bug. Your options at that point: commit the changes, discard them, or **stash** them (a temporary shelf for unfinished work, covered in a later module) and come back to them afterward.

> **Key idea:** \`git branch <name>\` creates without switching; \`git switch <name>\` (or the older \`git checkout <name>\`) switches; \`git switch -c <name>\` does both at once — and Git will block a switch rather than silently discard conflicting uncommitted work.`,
    },
    {
      name: "Comparing Branches & Fast-Forward Merges",
      minutes: 7,
      intro: "How branches diverge, and the simplest kind of merge there is.",
      content: `### Seeing how branches have diverged

\`\`\`bash
git log --oneline --graph --all
\`\`\`
\`\`\`
* d4e5f6a (feature) Add password strength meter
* c3d4e5f (feature) Add signup form
| * b2c3d4e (main) Fix typo in README
|/
* a1b2c3d (main branched from here) Initial commit
\`\`\`

Once two branches have their own separate commits, \`--graph\` visually shows exactly where they diverged and how each has moved forward independently since. Reading this kind of graph fluently is a genuinely valuable skill — it's how you'll understand a project's history at a glance for the rest of your Git career.

### Fast-forward merges: the simple case

\`\`\`bash
git switch main
git merge feature
\`\`\`
\`\`\`
Updating a1b2c3d..d4e5f6a
Fast-forward
 signup.js | 12 ++++++++++++
\`\`\`

If \`main\` hasn't gained any new commits since \`feature\` branched off, merging is trivial: Git just moves the \`main\` pointer forward to match \`feature\`'s tip. No new commit is created, no conflict is possible — this is called a **fast-forward** merge, and it's the simplest possible case.

### Before and after a fast-forward

\`\`\`
Before:
main:              a1b2c3d
feature: a1b2c3d -- c3d4e5f -- d4e5f6a

After (git merge feature, while on main):
main, feature:  a1b2c3d -- c3d4e5f -- d4e5f6a
\`\`\`

Notice that after a fast-forward, \`main\` and \`feature\` point at the exact same commit — there was never any actual "merging" of divergent work to reconcile, just moving a pointer forward along a history that was already a straight line.

### When a fast-forward isn't possible

If \`main\` *has* gained its own new commits since \`feature\` branched off (as in the diverged example above), Git can't just slide the pointer forward — the histories have genuinely diverged, and merging them requires creating a real **merge commit** that combines both lines of work. That's the more common, more interesting case, covered in full in the next module.

> **Key idea:** a fast-forward merge is just Git moving a branch pointer forward along an already-straight line of commits — no real "merging" happens, and it's only possible when the branch being merged *into* hasn't diverged with commits of its own.`,
    },
    {
      name: "Deleting & Renaming Branches",
      minutes: 6,
      intro: "Cleaning up after a branch has served its purpose.",
      content: `### Deleting a merged branch

\`\`\`bash
git branch -d feature-login
\`\`\`
\`\`\`
Deleted branch feature-login (was d4e5f6a).
\`\`\`

Once a branch's work has been merged elsewhere, it's served its purpose — the commits live on as part of whatever it was merged into, and the branch pointer itself is just a name you no longer need. \`-d\` (lowercase) is a **safe delete**: Git checks that the branch's commits are reachable from somewhere else first, and refuses if they aren't, protecting you from losing unmerged work by accident.

### Force-deleting an unmerged branch

\`\`\`bash
git branch -D abandoned-experiment
\`\`\`

\`-D\` (uppercase — shorthand for \`--delete --force\`) deletes a branch regardless of whether it's been merged. Use this deliberately, when you're certain the work either doesn't matter or is preserved somewhere else — a deleted branch pointer with no other reference to its commits will eventually make those commits eligible for garbage collection (recoverable for a while via \`git reflog\`, covered later, but not indefinitely).

### Renaming a branch

\`\`\`bash
git branch -m old-name new-name
# renaming your current branch:
git branch -m new-name
\`\`\`

\`-m\` (move) renames a branch. If you omit the old name, it renames whichever branch you currently have checked out — the more common case in practice, like fixing a typo in a branch name right after creating it.

### Listing and cleaning up branches

\`\`\`bash
git branch                    # local branches
git branch -r                  # remote-tracking branches
git branch -a                  # both
git branch --merged            # branches already merged into your current one
\`\`\`

\`--merged\` is genuinely useful for cleanup: it lists exactly which local branches are safe to delete because their work already exists elsewhere — a good habit to run periodically on any long-lived repository, since stale branches accumulate fast on active projects.

> **Key idea:** \`-d\` safely deletes only already-merged branches; \`-D\` force-deletes regardless — always prefer \`-d\` unless you're certain, and use \`git branch --merged\` to find branches that are genuinely safe to clean up.`,
    },
    {
      name: "A Practical Branching Workflow",
      minutes: 7,
      intro: "Putting branch creation, work, and cleanup together as a daily habit.",
      content: `### The core habit: never commit directly to main

\`\`\`bash
git switch main
git pull                          # make sure main is up to date first
git switch -c fix/login-redirect-bug
\`\`\`

The near-universal convention on real projects: \`main\` (or \`master\`) stays stable and deployable at all times, and **every** piece of work — a feature, a bug fix, an experiment — happens on its own branch, created from an up-to-date \`main\`. This isolates unfinished, possibly-broken work from the branch everyone else relies on.

### Descriptive branch names

\`\`\`
feature/user-avatar-upload
fix/null-pointer-on-empty-cart
chore/upgrade-eslint-config
experiment/try-redis-caching
\`\`\`

A \`type/short-description\` naming convention (exact prefixes vary by team) makes \`git branch\` output and pull request lists instantly scannable — you can tell what a branch is for without opening it. Consistency here matters more than which exact convention you pick.

### Working, committing, and finishing up

\`\`\`bash
# ... make changes, commit as you go ...
git add .
git commit -m "Fix redirect loop after login on mobile Safari"

# when done, bring main's latest changes in before merging back
git switch main
git pull
git merge fix/login-redirect-bug
git branch -d fix/login-redirect-bug
\`\`\`

The full loop: branch from up-to-date \`main\`, commit your work in logical chunks as you go, then merge back into \`main\` once finished and delete the now-unneeded branch. On a team, the "merge back" step is almost always a **pull request** on GitHub/GitLab rather than a direct local merge — covered in depth in the collaboration module — but the underlying Git mechanics are exactly what you've just learned.

### Short-lived branches over long-lived ones

Branches that live for days, not weeks, dramatically reduce how much \`main\` can drift away from them in the meantime — less drift means smaller, easier merges and far fewer conflicts. This single habit (small, short-lived branches, merged frequently) is one of the biggest predictors of a team having a smooth experience with Git versus a painful one.

> **Key idea:** the standard workflow is branch from up-to-date \`main\` → commit incrementally → merge back → delete the branch; keeping branches short-lived and frequently merged is the single biggest lever for avoiding painful merges later.`,
    },
  ],
}
