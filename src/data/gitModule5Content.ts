import type { Module } from "../types"

export const gitModule5: Module = {
  id: 5,
  title: "Undoing Things",
  status: "upcoming",
  lessons: [
    {
      name: "Unstaging & Discarding: git restore",
      minutes: 7,
      intro: "Backing out of changes before they're ever committed.",
      content: `### Discarding uncommitted changes in a file

\`\`\`bash
git restore app.js
\`\`\`

This reverts \`app.js\` in your working directory back to how it looked at the last commit, throwing away any uncommitted edits — **permanently and immediately, with no confirmation prompt**. This is one of the few genuinely destructive Git commands that offers no safety net at all, so double-check the filename (and consider \`git diff\` first) before running it.

### Discarding everything at once

\`\`\`bash
git restore .
\`\`\`

Restores every modified file in and below the current directory back to the last commit — useful after an experiment that went nowhere and you want a clean slate, but exactly as irreversible as the single-file version, just applied broadly.

### Unstaging without discarding

\`\`\`bash
git restore --staged app.js
\`\`\`

You saw this one in an earlier module — it moves a file back out of the staging area, but critically, the *actual edits stay in your working directory*, untouched. This is the safe half of \`restore\`; the plain version above (no \`--staged\`) is the destructive half. It's worth internalizing that distinction clearly, since the two flags do very different things to your actual work.

### Restoring one file from a specific commit or branch

\`\`\`bash
git restore --source=HEAD~2 app.js
git restore --source=main app.js
\`\`\`

\`--source\` lets you pull one file's content from any commit or branch — useful for grabbing an old version of a single file without touching anything else, without needing to check out that entire commit or branch.

### Why restore exists as its own command

\`git restore\` was introduced specifically to split apart jobs that \`git checkout\` used to handle all at once (restoring files *and* switching branches *and* more), because that overloading was a genuine, common source of confusion — this course uses \`restore\`/\`switch\` throughout for that reason, though you'll frequently see \`git checkout -- file.js\` used for the same purpose in older material and existing habits.

> **Key idea:** \`git restore <file>\` discards uncommitted changes with **no undo** — always check what you're about to lose first; \`git restore --staged <file>\` is the safe cousin, only unstaging without touching your actual edits.`,
    },
    {
      name: "Amending the Last Commit",
      minutes: 6,
      intro: "Fixing the commit you just made, cleanly, instead of adding a new one.",
      content: `### Fixing a typo in the last commit message

\`\`\`bash
git commit --amend -m "Fix login redirect on mobile Safari"
\`\`\`

\`--amend\` replaces your **most recent commit entirely** with a new one — same parent, but a new message and, if you staged anything beforehand, new content too. It's not editing the old commit in place; under the hood it's creating a brand-new commit and moving the branch pointer to it, while the old one becomes unreachable (and eventually garbage-collected). The visible effect, though, is exactly what it looks like: your last commit's message changed.

### Adding a forgotten file to the last commit

\`\`\`bash
git add forgotten-file.js
git commit --amend --no-edit
\`\`\`

A very common real-world pattern: you commit, then immediately notice you forgot to stage one file that belonged in that same commit. Stage it, then \`--amend --no-edit\` folds it into the previous commit without prompting to change the message at all — the result looks exactly as if you'd staged everything correctly the first time.

### The critical rule: only amend unpushed commits

\`\`\`
Safe:    commit -> amend -> push          (nobody has seen the old version)
Unsafe:  commit -> push -> amend -> push  (rewrites history others may have already pulled)
\`\`\`

Because \`--amend\` genuinely replaces the commit (a new hash, not an edit of the old one), amending a commit **someone else has already pulled** creates a divergence between your history and theirs — their copy still has the old commit, yours has the new one that claims to be its replacement. This is the first of several commands in this course that carry the same warning, formalized as the "golden rule" in the rebasing module: never rewrite commits that have already been shared/pushed to a branch others use.

### Amending doesn't just fix messages

\`\`\`bash
# realize you need to also change some code from the last commit
vim app.js
git add app.js
git commit --amend --no-edit
\`\`\`

\`--amend\` picks up whatever is currently staged, exactly like a normal commit — so it's just as useful for folding in a missed code change as it is for fixing a typo'd message. Anything staged when you run it becomes part of the replacement commit.

> **Key idea:** \`git commit --amend\` replaces your most recent commit with a new one (new hash, same or new content/message) — safe and genuinely useful before pushing, but never do this to a commit others have already pulled, since it creates a history divergence.`,
    },
    {
      name: "git reset: --soft, --mixed, --hard",
      minutes: 9,
      intro: "Moving a branch pointer backward — with three very different blast radii.",
      content: `### What reset fundamentally does

\`\`\`bash
git reset <commit>
\`\`\`

\`git reset\` moves your **current branch's pointer** to a different commit — almost always backward, to "undo" commits by making them no longer part of the branch's history (they still technically exist for a while, recoverable via \`git reflog\`, until eventually garbage-collected). The three modes — \`--soft\`, \`--mixed\`, \`--hard\` — control what happens to your working directory and staging area while that pointer moves, and the differences between them matter enormously.

### --soft: move the pointer, keep everything else staged

\`\`\`bash
git reset --soft HEAD~1
\`\`\`
\`\`\`
Before:  A -- B -- C  (HEAD, main)
After:   A -- B        (HEAD, main) — C's changes are now staged, ready to re-commit
\`\`\`

The branch pointer moves back one commit, but everything that commit changed is placed right back into the **staging area** — nothing is lost, nothing needs re-editing. This is genuinely useful for combining several recent commits into one: soft-reset back past all of them, then make a single fresh commit with everything staged.

### --mixed (the default): move the pointer, unstage everything

\`\`\`bash
git reset HEAD~1
# equivalent to:
git reset --mixed HEAD~1
\`\`\`

Same pointer movement, but this time the changes land back in your **working directory as unstaged edits**, not the staging area. Nothing is lost here either — you'd just need to \`git add\` again before recommitting. This is the default mode when you don't specify \`--soft\` or \`--hard\`.

### --hard: move the pointer, and discard everything

\`\`\`bash
git reset --hard HEAD~1
\`\`\`

This is the dangerous one: the pointer moves back, **and** your working directory is forcibly overwritten to match — any uncommitted changes, and the entire content of the commit(s) being reset past, are gone from your working directory immediately, no confirmation asked. (Not gone from Git's internal storage forever right away — \`git reflog\`, covered next, can often still recover the commit itself for a while — but any uncommitted edits at the time of the \`--hard\` are genuinely gone.)

### A quick comparison

\`\`\`
              staging area        working directory
--soft        kept (staged)        kept
--mixed       cleared              kept (unstaged)
--hard        cleared              OVERWRITTEN (data loss risk)
\`\`\`

### The same critical rule as amend

Exactly like \`--amend\`, \`reset\` moves your branch's pointer, which means it should never be used on commits that have already been pushed and pulled by someone else — for that situation, \`git revert\` (next lesson) is the correct, safe tool instead.

> **Key idea:** all three reset modes move the branch pointer backward; they differ only in what happens to the changes from the commits you're moving past — \`--soft\` keeps them staged, \`--mixed\` (the default) keeps them unstaged, \`--hard\` discards them entirely from your working directory. Never reset commits someone else has already pulled.`,
    },
    {
      name: "git revert: Undoing Safely on Shared History",
      minutes: 6,
      intro: "Undoing a commit by adding a new one, instead of rewriting the past.",
      content: `### The fundamental difference from reset

\`\`\`
reset:   A -- B -- C  becomes  A -- B          (C is removed from history)
revert:  A -- B -- C  becomes  A -- B -- C -- D    (D undoes C's changes, C still exists)
\`\`\`

\`git revert\` takes the opposite approach from \`reset\`: instead of moving the pointer backward and erasing a commit from the branch's history, it creates a **brand-new commit that applies the exact opposite of the target commit's changes**. History only ever moves forward — nothing is rewritten, nothing is removed, which is exactly why revert is safe to use on commits that have already been pushed and shared.

### Reverting a commit

\`\`\`bash
git revert a1b2c3d
\`\`\`
\`\`\`
[main e5f6a7b] Revert "Add experimental caching layer"
 1 file changed, 15 deletions(-)
\`\`\`

Git opens your editor with an auto-generated message (\`Revert "<original message>"\`) — accept it or edit further — and produces exactly one new commit that undoes the target. If the revert conflicts with changes made *after* the target commit, you'll resolve it exactly like a merge conflict (same markers, same process from the earlier lesson), since Git genuinely can't know how to apply an "opposite" change automatically in every case.

### Reverting without immediately committing

\`\`\`bash
git revert --no-commit a1b2c3d
git status   # inspect the staged undo before committing it yourself
git commit
\`\`\`

\`--no-commit\` stages the reverting changes without creating the commit yet, giving you a chance to inspect or adjust before finalizing — useful when you want to combine a revert with other changes in one commit, or double-check exactly what it's about to undo.

### Reverting a merge commit

\`\`\`bash
git revert -m 1 <merge-commit-hash>
\`\`\`

Merge commits have two parents, so Git needs to know which "side" to treat as the mainline when reverting — \`-m 1\` says "keep parent 1's line as the baseline, undo what parent 2 introduced." This is a genuinely common point of confusion the first time you need to revert a merge; the default is nearly always parent 1 (the branch you merged *into*).

### When to use revert vs. reset

Use \`revert\` for anything already pushed and potentially seen by others — it's the safe, collaborative choice. Reserve \`reset\` for commits that only exist on your own machine and haven't been shared yet, where rewriting history carries no risk to anyone else.

> **Key idea:** \`revert\` undoes a commit by creating a new commit with the opposite changes — history only moves forward, making it safe for already-shared work, unlike \`reset\` which erases commits from the branch outright.`,
    },
    {
      name: 'Recovering "Lost" Work with git reflog',
      minutes: 7,
      intro: "The safety net behind nearly every scary-looking Git mistake.",
      content: `### The log you don't normally see

\`\`\`bash
git reflog
\`\`\`
\`\`\`
e5f6a7b HEAD@{0}: commit: Fix login bug
d4e5f6a HEAD@{1}: reset: moving to HEAD~1
c3d4e5f HEAD@{2}: commit: Add experimental caching layer
b2c3d4e HEAD@{3}: checkout: moving from main to feature
\`\`\`

The **reflog** is a local, personal record of every place \`HEAD\` has pointed on your machine — every commit, checkout, reset, rebase, and merge, in order, each with a timestamp. Unlike \`git log\` (which shows the story of the *project*, following commit ancestry), the reflog shows the story of *your local HEAD movements* — and critically, it still lists commits that are no longer reachable from any branch, like the target of a \`git reset --hard\` you regret.

### The recovery pattern

\`\`\`bash
git reflog
# find the entry from right before the mistake, e.g. c3d4e5f above

git reset --hard c3d4e5f
# or, less destructively:
git branch recovered-work c3d4e5f
\`\`\`

This is the pattern behind an enormous number of "I think I just destroyed my work" panics that turn out to be completely recoverable: find the commit hash from just before the mistake in the reflog, and either reset back to it, or — often the better choice — create a brand-new branch pointing at it, so you can inspect it safely without touching your current branch at all.

### What reflog can't save you from

The reflog only helps with commits that were made at some point — it has nothing to offer for changes that were **never committed** (an uncommitted edit wiped out by \`git restore\` or \`git reset --hard\` truly has no Git-level record to recover from, since it was never saved to Git's history in the first place). This is the strongest practical argument for committing early and often, even with rough "wip" messages you'll clean up later — a bad commit is almost always recoverable; an uncommitted change usually isn't.

### Reflog entries eventually expire

Reflog entries aren't permanent — by default they're kept for 90 days (unreachable ones) or 30 days for some categories, after which Git's garbage collector may clean them up. This is generous for realistic "oh no" scenarios, but it does mean the reflog isn't a substitute for actual backups on anything that matters long-term.

> **Key idea:** \`git reflog\` records every place your local \`HEAD\` has pointed, including commits no longer reachable from any branch — it's the recovery tool for nearly any Git mistake involving a commit that existed at some point, though it can't help with changes that were never committed in the first place.`,
    },
  ],
}
