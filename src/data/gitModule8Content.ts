import type { Module } from "../types"

export const gitModule8: Module = {
  id: 8,
  title: "Rewriting History",
  status: "upcoming",
  lessons: [
    {
      name: "Interactive Rebase: The Basics",
      minutes: 9,
      intro: "Editing, reordering, and cleaning up your own recent commits.",
      content: `### What rebase fundamentally does

\`\`\`
Before:
        C -- D   (feature)
       /
A -- B -- E -- F   (main)

After: git rebase main (while on feature)
                        C' -- D'   (feature)
                       /
A -- B -- E -- F   (main)
\`\`\`

Rebasing takes a sequence of commits and **replays them one by one on top of a different starting point** — here, feature's commits \`C\` and \`D\` are reconstructed as \`C'\` and \`D'\`, with the identical changes but new parent commits (and, critically, new hashes — they are technically brand-new commits, not the originals moved). The result looks as if \`feature\` had been branched from \`main\`'s current tip all along, producing a clean, linear history with no merge commit.

### Interactive rebase: editing your own recent history

\`\`\`bash
git rebase -i HEAD~4
\`\`\`
\`\`\`
pick a1b2c3d Add login form
pick c3d4e5f wip
pick d4e5f6a fix typo
pick e5f6a7b Add password validation

# Rebase b2c3d4e..e5f6a7b onto b2c3d4e (4 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's message
# d, drop <commit> = remove commit
\`\`\`

\`git rebase -i <commit>\` opens an editor listing every commit from \`<commit>\` up to your current \`HEAD\`, each on its own line with a command word (\`pick\` by default). This is genuinely one of the most powerful tools in Git — you edit this list before it runs, and Git executes your instructions top to bottom to reconstruct history exactly as you specify.

### The core commands, in practice

\`\`\`
pick a1b2c3d Add login form
squash c3d4e5f wip
squash d4e5f6a fix typo
reword e5f6a7b Add password validation
\`\`\`

Changing \`pick\` to \`squash\` on the "wip" and "fix typo" lines folds them into the commit directly above — Git will then prompt you to write one combined commit message for all three. Changing \`pick\` to \`reword\` on the last line lets you edit just that commit's message, without touching its content at all. \`fixup\` behaves like \`squash\` but silently discards the fixed-up commit's message rather than prompting to combine them.

### Reordering commits

Simply reordering the lines in the editor reorders the commits themselves — Git replays them in whatever order the list specifies, top to bottom. This is genuinely useful for grouping related changes together before a PR, even if you didn't commit them in a logical order originally.

### After running it

\`\`\`bash
git log --oneline
\`\`\`
\`\`\`
f6a7b8c Add password validation
e7b8c9d Add login form with validation
\`\`\`

The result is a cleaner, more intentional-looking history — exactly what you'd have written if you'd planned every commit perfectly the first time, even though real work is rarely that tidy in the moment.

> **Key idea:** \`git rebase -i <commit>\` opens an editable list of your recent commits where \`pick\`/\`squash\`/\`fixup\`/\`reword\`/\`drop\` (and simply reordering lines) let you rewrite your own history into a clean, logical sequence — every replayed commit gets a genuinely new hash.`,
    },
    {
      name: "Rebase vs. Merge: When to Use Which",
      minutes: 7,
      intro: "Two different philosophies for combining diverged history.",
      content: `### The visible difference

\`\`\`
Merge result:
        C -- D
       /      \\
A -- B -- E -- F -- G   (a merge commit, two parents)

Rebase result:
A -- B -- E -- F -- C' -- D'   (linear, no merge commit)
\`\`\`

A merge preserves exactly what happened — two branches genuinely diverged and were reconciled, recorded as a merge commit with two parents. A rebase produces history that looks as though the divergence never happened at all — a single straight line, achieved by literally creating new commits with different parents (and different hashes) than the originals.

### The tradeoff, precisely

Merge is **non-destructive** — it never alters existing commits, only adds a new one — which is exactly why it's always safe, even on already-shared branches. Rebase **rewrites commits**, producing cleaner-looking history at the direct cost of changing commit identities — which is exactly why it's dangerous on anything already shared, and the entire subject of the next lesson's golden rule.

### A common team convention

\`\`\`bash
# updating your OWN, not-yet-shared feature branch — rebase is fine
git switch feature-login
git rebase main

# bringing feature-login's finished work into main — usually a merge (often via PR)
git switch main
git merge feature-login
\`\`\`

A widely-used pattern: rebase freely on your *own* branches that nobody else has based work on, to keep your personal history clean before it's shared or merged — but merge (often via a squash-merge through a pull request) when finally combining a finished branch into \`main\`, since \`main\`'s history is inherently shared and its integrity matters to everyone.

### Neither is universally "correct"

Some teams and projects (the Linux kernel among them) rebase extensively and enforce a strictly linear history throughout. Others merge liberally and treat the resulting graph, merge commits and all, as valuable historical record of how work actually unfolded. Both are legitimate, well-established conventions — what matters is that a team agrees on one and applies it consistently, not which one is objectively better.

### What each preserves and loses

\`\`\`
Merge:   preserves the true shape of how work diverged and reconverged
Rebase:  preserves a simpler, linear story — at the cost of that true shape
\`\`\`

If knowing "these five commits were originally developed together, in parallel with these other three" matters to your project, merges preserve that. If a clean, easy-to-read straight line matters more than that detail, rebase (often paired with squashing) delivers it.

> **Key idea:** merge is always safe because it never rewrites existing commits, at the cost of a less linear history; rebase produces a cleaner, linear history at the cost of rewriting commit identities — safe on your own unshared branches, dangerous on anything already shared with others.`,
    },
    {
      name: "Squashing Commits",
      minutes: 6,
      intro: "Compressing a messy sequence of commits into one clean one.",
      content: `### Why squash at all

Real development is messy in the moment: "wip", "actually fix the thing", "typo", "ok now it really works" is a completely normal sequence of commits *while you're working* — but none of those intermediate states are useful to anyone reading history later. Squashing compresses that sequence into the one commit that actually matters: the final, working change.

### Squashing via interactive rebase

\`\`\`bash
git rebase -i HEAD~4
\`\`\`
\`\`\`
pick a1b2c3d Add login form
squash c3d4e5f wip
squash d4e5f6a fix typo
squash e5f6a7b now it actually works
\`\`\`

Marking every commit after the first as \`squash\` (or \`s\`) folds them all into that first one — Git then opens an editor showing all four original messages concatenated, letting you write one final, clean combined message (or just delete the boilerplate and keep it short).

### fixup: squash without the message prompt

\`\`\`bash
pick a1b2c3d Add login form
fixup c3d4e5f wip
fixup d4e5f6a fix typo
fixup e5f6a7b now it actually works
\`\`\`

\`fixup\` does the same folding as \`squash\`, but silently discards the folded-in commits' messages entirely rather than prompting you to combine them — the fastest option when those intermediate messages ("wip", "typo") add no value at all and you just want them gone.

### Squashing during a merge, instead of rebasing first

\`\`\`bash
git merge --squash feature-login
git commit -m "Add login form with validation"
\`\`\`

You saw this option back in module 4 — \`--squash\` at merge time achieves a very similar end result (one clean commit on \`main\`) without needing an interactive rebase first, useful for a branch whose intermediate commits you have no interest in preserving even locally.

### Squashing via GitHub's PR merge button

Most hosting platforms offer "Squash and merge" as a one-click PR merge option, which does exactly this same operation server-side — extremely common for teams that want every PR to land on \`main\` as exactly one commit, regardless of how many commits the contributor made while developing it.

### When not to squash everything

Squashing loses the granular step-by-step history of *how* something was built — for a genuinely large, multi-day feature made of several logically distinct commits (not just "wip" noise), squashing everything into one giant commit can actually make history *less* useful, not more. Judgment matters here more than a blanket rule.

> **Key idea:** squashing compresses a messy sequence of in-progress commits into one clean final commit — available via interactive rebase (\`squash\`/\`fixup\`), \`git merge --squash\`, or a platform's "squash and merge" button — genuinely useful for noise, but use judgment on commits that represent real, distinct logical steps.`,
    },
    {
      name: "Cherry-Picking Commits",
      minutes: 6,
      intro: "Taking exactly one commit from a branch, without merging everything else.",
      content: `### What cherry-pick does

\`\`\`bash
git cherry-pick a1b2c3d
\`\`\`

\`git cherry-pick <commit>\` applies the exact changes from one specific commit onto your current branch, creating a new commit with those same changes (and a new hash) — without bringing along anything else from the branch that commit originally lived on. It's essentially a rebase of exactly one commit, applied to wherever you currently are.

### A common real use case: a critical fix on the wrong branch

\`\`\`bash
git switch hotfix-branch
git cherry-pick a1b2c3d       # the specific fix commit, made on a feature branch
\`\`\`

Imagine a critical bug fix was accidentally committed on a long-running feature branch that won't be merged for weeks — but production needs that fix *now*. Cherry-picking lets you grab just that one commit onto a hotfix branch (or directly onto \`main\`) without pulling in any of the feature branch's unfinished, unrelated work.

### Cherry-picking multiple commits

\`\`\`bash
git cherry-pick a1b2c3d d4e5f6a
git cherry-pick a1b2c3d..e5f6a7b    # a range, exclusive of the first commit
\`\`\`

You can cherry-pick several commits by hash, or an entire range at once — the range form excludes the first hash listed and includes everything after it up through the second, applying each one in order.

### Handling a conflict during cherry-pick

\`\`\`bash
git cherry-pick a1b2c3d
# CONFLICT (content): Merge conflict in app.js
# ... resolve exactly like any other conflict ...
git add app.js
git cherry-pick --continue
\`\`\`

Cherry-pick can absolutely conflict, exactly like a merge or rebase can — the same resolution process from module 4 applies: edit the conflicted file, remove the markers, \`git add\` it, then \`--continue\` instead of \`git commit\` (cherry-pick has its own continue/abort flow, since it may be applying several commits).

### Aborting a cherry-pick

\`\`\`bash
git cherry-pick --abort
\`\`\`

Exactly like \`merge --abort\`, this cleanly cancels an in-progress cherry-pick and restores your working directory to how it was before you started — your safety net here works the same way.

> **Key idea:** \`git cherry-pick <hash>\` applies one specific commit's changes onto your current branch as a new commit, without bringing anything else along — genuinely useful for pulling a single fix across branches without a full merge; conflicts resolve the same way as anywhere else, with \`--continue\`/\`--abort\` managing the process.`,
    },
    {
      name: "The Golden Rule of Rebasing",
      minutes: 6,
      intro: "The one rule that prevents rebasing from becoming a genuine disaster.",
      content: `### The rule itself

**Never rewrite (rebase, amend, or force-push over) commits that other people may have already pulled.** This single rule — often called Git's "golden rule" — is the difference between rebasing being a genuinely powerful cleanup tool and it being a source of real, confusing chaos for everyone else on a shared branch.

### Why rewriting shared history causes real problems

\`\`\`
Your rebase creates:  A -- B -- C'         (new hashes)
Their copy still has: A -- B -- C          (old hashes)
\`\`\`

If a teammate already pulled the original \`C\` before you rebased it into \`C'\`, their local repository and yours now disagree about history — from Git's perspective, these look like two genuinely different commits, even though the actual content might be identical. When they next try to pull, Git sees what looks like diverged, conflicting history, and things get confusing fast: duplicate-looking commits, unexpected conflicts, or a forced, manual reconciliation that's entirely avoidable in the first place.

### The practical rule of thumb

\`\`\`
Safe to rewrite:     branches only you have pushed to, or that are entirely local
Unsafe to rewrite:    main, develop, or any branch others are actively basing work on
\`\`\`

Your own feature branch, before opening a PR (or before anyone else has pulled it) is fair game for as much interactive rebasing, amending, and cleanup as you like. Once a branch is genuinely shared — anyone else has pulled it, based their own work on it, or it's a long-lived branch like \`main\` — treat it as append-only from that point forward: merge and revert, don't rebase or reset it.

### force-push: the command that makes rewritten history "official"

\`\`\`bash
git push --force-with-lease
\`\`\`

A normal \`push\` is rejected when your rewritten branch no longer shares history with what's on the remote — a \`--force\` push overrides that rejection, telling the remote "trust my version, discard yours." \`--force-with-lease\` is the safer variant: it double-checks that nobody else has pushed to that branch since you last fetched, and refuses if they have — protecting against silently clobbering a teammate's work you simply hadn't seen yet. Prefer \`--force-with-lease\` over plain \`--force\` essentially always.

### If you accidentally break this rule

If you rewrite a branch others have already pulled, the cleanest fix is usually communication, not a clever Git trick: tell your team what happened and when, so everyone can re-sync deliberately (often by deleting and re-fetching their local copy of that branch) rather than fighting confusing conflicts blind.

> **Key idea:** never rewrite commits that others may have already pulled — rebasing, amending, and resetting are all genuinely safe on your own unshared work, and genuinely risky on anything shared; when you do need to force-push a legitimately rewritten branch, always prefer \`--force-with-lease\` over plain \`--force\`.`,
    },
  ],
}
