import type { Module } from "../types"

export const gitModule4: Module = {
  id: 4,
  title: "Merging",
  status: "upcoming",
  lessons: [
    {
      name: "True Merges & the Three-Way Merge",
      minutes: 8,
      intro: "What happens when both branches have moved forward on their own.",
      content: `### When a fast-forward isn't possible

\`\`\`
        C -- D   (feature)
       /
A -- B -- E -- F   (main)
\`\`\`

Once both branches have their own new commits since diverging, Git can't just slide a pointer forward — it needs to actually combine both lines of history. Merging in this case creates a brand-new **merge commit** with two parents instead of one, which is what makes it possible to represent "these two lines of development came back together" at all.

### The three-way merge

\`\`\`
     common ancestor (B)
      /         \\
  main (F)    feature (D)
\`\`\`

Git determines what changed by comparing three snapshots: the **common ancestor** (the last commit both branches share, \`B\` here), and the tip of each branch (\`F\` and \`D\`). For every changed piece of a file, Git asks: did only \`main\` change it, only \`feature\` change it, or did both change it? If only one side changed something, that change is taken automatically — no conflict, no decision needed. Conflicts only arise from the third case, covered in the next lesson.

### Performing the merge

\`\`\`bash
git switch main
git merge feature
\`\`\`
\`\`\`
Merge made by the 'recursive' strategy.
 login.js | 8 ++++++++
 1 file changed, 8 insertions(+)
\`\`\`

\`git merge <branch>\` merges the named branch **into** the branch you currently have checked out — always double check which branch you're on before merging, since it's easy to accidentally merge in the wrong direction.

### After the merge

\`\`\`
        C -- D
       /      \\
A -- B -- E -- F -- G   (main, HEAD)
                  (feature)
\`\`\`

The new commit \`G\` has **two parents** — \`F\` (main's previous tip) and \`D\` (feature's tip) — which is exactly how Git records that two lines of history rejoined here. \`main\` now moves forward to point at \`G\`; \`feature\` stays where it was unless you delete it.

> **Key idea:** a true merge compares the common ancestor against both branch tips and creates a new commit with two parents, recording that two lines of development came back together — automatic where only one side changed something, and a conflict (next lesson) only where both sides changed the same thing.`,
    },
    {
      name: "Merge Conflicts: What They Are and Why",
      minutes: 7,
      intro: "The one case Git genuinely can't resolve on its own.",
      content: `### Why conflicts happen

A merge conflict happens when **both branches changed the same part of the same file** in different ways since they diverged — Git has no way to know which change you actually want, so it stops and asks you. This is the *only* case Git can't resolve automatically; every other combination (one side changed something, the other didn't) merges cleanly without any input from you.

### What a conflict looks like mid-merge

\`\`\`bash
git merge feature
\`\`\`
\`\`\`
Auto-merging config.js
CONFLICT (content): Merge conflict in config.js
Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

Git pauses the merge right here — it has already merged every file it *could* resolve automatically, and is now waiting for you to manually resolve the ones it couldn't.

### Reading conflict markers

\`\`\`js
const timeout = <<<<<<< HEAD
  3000
=======
  5000
>>>>>>> feature
\`\`\`

Git inserts **conflict markers** directly into the file at the exact conflicting spot: everything between \`<<<<<<< HEAD\` and \`=======\` is what *your current branch* has; everything between \`=======\` and \`>>>>>>> feature\` is what the *branch being merged in* has. Both versions exist side by side, and it's now on you to decide what the correct final version should be.

### Checking which files are conflicted

\`\`\`bash
git status
\`\`\`
\`\`\`
Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   config.js
\`\`\`

\`git status\` during a mid-merge state clearly lists every file still needing attention under "Unmerged paths" — a repository can have any number of conflicted files at once, and none of them block you from resolving the others one at a time.

### This is normal, not a failure state

Conflicts are an expected, routine part of working with branches on any active project — they're not a sign something went wrong, just Git correctly recognizing it needs a human decision. The next lesson covers resolving them calmly and correctly, step by step.

> **Key idea:** a conflict only happens when both branches changed the *same* part of the *same* file; Git marks the exact spot with \`<<<<<<<\`/\`=======\`/\`>>>>>>>\` and pauses, waiting for you to decide the correct final content — a normal, routine part of branch-based work, not an error state.`,
    },
    {
      name: "Resolving Conflicts Step by Step",
      minutes: 9,
      intro: "The actual process, from conflict markers to a finished merge commit.",
      content: `### Step 1: identify what's conflicted

\`\`\`bash
git status
\`\`\`

Start here every time — get the full list of conflicted files before touching anything, so you have a clear checklist of what needs resolving.

### Step 2: open each file and decide

\`\`\`js
// before
const timeout = <<<<<<< HEAD
  3000
=======
  5000
>>>>>>> feature

// after — decided the higher value makes sense, and removed all markers
const timeout = 5000
\`\`\`

Open the file, read both versions, and edit it into the single correct final state — this might mean keeping one side entirely, keeping the other entirely, or writing something new that combines ideas from both. Critically, **every** conflict marker (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) must be removed; leaving one behind is a very common mistake that silently breaks the file (and often doesn't fail until much later).

### Step 3: stage the resolved file

\`\`\`bash
git add config.js
\`\`\`

Staging a conflicted file tells Git "I've resolved this one" — it's the same \`git add\` you already know, just doing double duty here as a signal that resolution is complete for this particular file.

### Step 4: repeat for every conflicted file, then commit

\`\`\`bash
git status
\`\`\`
\`\`\`
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)
\`\`\`

\`\`\`bash
git commit
\`\`\`

Once every conflicted file is staged, \`git status\` confirms there's nothing left to resolve. Running \`git commit\` with no message argument opens your editor with an **auto-generated merge message already filled in** (typically "Merge branch 'feature' into main") — you can usually accept it as-is, though adding a line about what the conflict was and how you resolved it can be genuinely useful for anyone reading history later.

### Using a visual merge tool

\`\`\`bash
git mergetool
\`\`\`

For conflicts that are large or genuinely hard to reason about in raw text, \`git mergetool\` launches a configured visual diff/merge tool (VS Code, Meld, and many others all work) showing both versions side by side with the resolution area in between — often much easier to work through than reading raw conflict markers, especially for bigger conflicts.

> **Key idea:** the resolution loop is: find conflicted files with \`git status\` → edit each one, removing every marker → \`git add\` each resolved file → \`git commit\` once all are staged; \`git mergetool\` is worth reaching for on anything more than a small, obvious conflict.`,
    },
    {
      name: "Merge Strategies & Options",
      minutes: 7,
      intro: "--no-ff, --squash, and choosing how a merge should look in history.",
      content: `### Forcing a merge commit with --no-ff

\`\`\`bash
git merge --no-ff feature
\`\`\`
\`\`\`
      C -- D
     /      \\
A - B -- E -- F   (main)
\`\`\`

Even when a fast-forward *would* be possible (no divergence on main), \`--no-ff\` forces Git to create a real merge commit anyway. Some teams prefer this deliberately: it preserves a visible record in history that "this was a feature branch, merged as a unit," which a plain fast-forward would otherwise erase — with a fast-forward, the individual feature commits just look like they happened directly on \`main\`, with no trace that a branch was ever involved.

### Squashing a branch into one commit

\`\`\`bash
git merge --squash feature
git commit -m "Add user avatar upload feature"
\`\`\`

\`--squash\` takes every commit on the feature branch and combines their combined changes into your working directory as a single staged change — but does **not** create a commit or preserve the individual commits' history at all. You then commit it yourself as one clean, single commit. This is popular for feature branches that accumulated a messy sequence of "wip", "fix typo", "actually fix it" commits during development that nobody needs to see in \`main\`'s permanent history.

### Comparing the three approaches

\`\`\`
Fast-forward:  main's history simply extends — no trace a branch existed
--no-ff:       a merge commit is created, preserving the branch's shape
--squash:      all of feature's commits become exactly one new commit
\`\`\`

There's no universally "correct" choice — it's a team convention. Fast-forward keeps history linear and simple; \`--no-ff\` preserves the most detail about how work was organized; \`--squash\` (or, alternatively, an interactive rebase before merging — covered in a later module) produces the cleanest, most readable final history at the cost of losing the granular in-progress commits.

### Setting a default

\`\`\`bash
git config --global merge.ff false     # always create a merge commit, never fast-forward
\`\`\`

Many teams standardize this at the repository or personal config level so every merge looks consistent, rather than depending on whether that particular branch happened to have diverged or not.

> **Key idea:** \`--no-ff\` forces a merge commit even when a fast-forward is possible, preserving the branch's shape in history; \`--squash\` compresses every commit on a branch into one — pick based on whether your team values a detailed history or a clean, linear one.`,
    },
    {
      name: "Aborting a Merge",
      minutes: 5,
      intro: "The one command that gets you safely back out of a merge gone wrong.",
      content: `### When to abort

Sometimes, mid-conflict-resolution, you realize something's gone wrong — you misunderstood the conflict, resolved several files incorrectly, or simply want to reconsider before committing to a resolution. Git provides a full, clean escape hatch for exactly this.

### Aborting cleanly

\`\`\`bash
git merge --abort
\`\`\`

\`git merge --abort\` completely cancels the in-progress merge and restores your working directory to exactly how it was **before** you ran \`git merge\` in the first place — every conflict marker, every partial resolution, gone, as if the merge attempt never happened. This only works while a merge is actually in progress (i.e., you're mid-conflict-resolution); it can't undo an already-completed merge commit.

### Checking whether you're mid-merge

\`\`\`bash
git status
\`\`\`
\`\`\`
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)
\`\`\`

Git status is helpful enough to remind you \`--abort\` is available right there in its output whenever you're in this state — worth remembering it exists even under pressure, since panicking mid-merge and making the conflict worse is a very avoidable mistake.

### Undoing an already-completed merge

\`\`\`bash
git reset --hard HEAD~1     # if the merge commit is your very latest commit and hasn't been shared
\`\`\`

If you already finished and committed the merge, and then realize it was a mistake, \`--abort\` won't help (there's no merge in progress anymore) — you'd instead need \`git reset\` (covered in full, along with its important cautions about already-pushed history, in the next module) or \`git revert\` to undo it after the fact.

> **Key idea:** \`git merge --abort\` fully cancels an in-progress merge and restores your working directory to its exact pre-merge state — it's your safety net for a conflict resolution gone wrong, but it only works *before* you commit the merge, not after.`,
    },
  ],
}
