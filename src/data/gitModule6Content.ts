import type { Module } from "../types"

export const gitModule6: Module = {
  id: 6,
  title: "Working with Remotes",
  status: "upcoming",
  lessons: [
    {
      name: "What a Remote Actually Is",
      minutes: 7,
      intro: "Just another copy of the repository, living somewhere else.",
      content: `### A remote is just another full copy

A **remote** is simply another copy of the same repository, living somewhere else — usually a server (GitHub, GitLab, a company's internal Git server), but it could just as easily be another folder on your own machine, or a colleague's laptop reachable over the network. Because Git is distributed (module 1), every one of these copies holds a complete history, not a partial one — there's nothing structurally special about the copy hosted on GitHub compared to the one on your laptop, aside from convention (it's the one everyone agrees to treat as the shared source of truth).

### Viewing configured remotes

\`\`\`bash
git remote -v
\`\`\`
\`\`\`
origin  https://github.com/ada/my-project.git (fetch)
origin  https://github.com/ada/my-project.git (push)
\`\`\`

\`git remote -v\` lists every remote your local repository knows about, along with its URL. \`origin\` is simply the **conventional default name** for "the remote I cloned this from" — there's nothing magic about the name itself, and you're free to rename it or add others (covered later in this module), but nearly every project you'll touch uses \`origin\` for its primary remote.

### Adding a remote manually

\`\`\`bash
git remote add origin https://github.com/ada/my-project.git
\`\`\`

If you started a repository with \`git init\` locally rather than cloning it, it has no remotes configured at all yet — you connect it to a hosted copy explicitly with \`git remote add <name> <url>\`. This is the standard second step right after creating a brand-new repository on GitHub for a project that already exists locally.

### Remote-tracking branches

\`\`\`bash
git branch -r
\`\`\`
\`\`\`
  origin/main
  origin/feature-login
\`\`\`

Alongside your own local branches, Git keeps **remote-tracking branches** — read-only bookmarks like \`origin/main\` that record where each branch on the remote was, as of your last communication with it. These update only when you explicitly talk to the remote (via \`fetch\`, \`pull\`, or \`push\`) — they are not live, and can silently fall behind the actual remote if you haven't synced in a while.

> **Key idea:** a remote is just another full copy of the repository, most commonly hosted on a server; \`origin\` is only a naming convention, and remote-tracking branches (\`origin/main\`) are local, read-only bookmarks of the remote's state as of your last sync — not a live connection.`,
    },
    {
      name: "Cloning a Repository",
      minutes: 6,
      intro: "Getting a full working copy of an existing project.",
      content: `### The basic clone

\`\`\`bash
git clone https://github.com/ada/my-project.git
cd my-project
\`\`\`

\`git clone\` downloads the **entire repository** — every commit, every branch, the complete history — into a new folder, and automatically sets up a remote named \`origin\` pointing back at the URL you cloned from. This is the standard way you start working on essentially any existing project, and it's the single command that most concretely demonstrates Git's distributed nature: you now hold a complete, independent copy of the whole project's history, not a thin reference to it.

### What happens immediately after cloning

\`\`\`bash
git branch -a
\`\`\`
\`\`\`
* main
  remotes/origin/main
  remotes/origin/feature-login
\`\`\`

A fresh clone checks out one local branch (typically \`main\`, matching whatever the remote's default branch is), while every other branch on the remote is available as a remote-tracking branch, ready to check out locally on demand.

### Cloning into a specific folder name

\`\`\`bash
git clone https://github.com/ada/my-project.git backend-service
\`\`\`

By default the folder is named after the repository; passing a second argument clones into a folder with whatever name you choose instead — handy when you're cloning multiple related repos, or the default name would collide with something already present.

### A shallow clone, for very large repositories

\`\`\`bash
git clone --depth 1 https://github.com/ada/huge-project.git
\`\`\`

\`--depth 1\` fetches only the most recent commit's snapshot, skipping the full history — much faster and smaller for enormous repositories where you don't need history at all (a CI pipeline that just needs the current code to build, for instance). The tradeoff is real: most history-dependent commands (\`git log\` beyond the one commit, \`git blame\` reaching further back, etc.) won't have anything to work with in a shallow clone.

### SSH vs. HTTPS URLs

\`\`\`bash
git clone git@github.com:ada/my-project.git        # SSH — uses an SSH key for auth
git clone https://github.com/ada/my-project.git    # HTTPS — uses a token or credential helper
\`\`\`

Both point at the identical repository; they only differ in how you authenticate for subsequent pushes. SSH is common for a personal machine with a key already set up; HTTPS with a credential helper is common in CI environments and for contributors who haven't configured SSH keys.

> **Key idea:** \`git clone <url>\` downloads a repository's complete history into a new folder and wires up \`origin\` automatically — you end up with a genuinely full, independent copy, not a partial reference, which is the clearest demonstration of Git being distributed rather than centralized.`,
    },
    {
      name: "Fetch vs. Pull: What's the Difference",
      minutes: 8,
      intro: "The single most misunderstood distinction for anyone new to Git.",
      content: `### git fetch: download, but don't touch my branches

\`\`\`bash
git fetch origin
\`\`\`

\`git fetch\` downloads any new commits from the remote and updates your **remote-tracking branches** (\`origin/main\`, etc.) to match — but it does **not** touch your own local branches or working directory at all. After a fetch, \`origin/main\` might now be ahead of your local \`main\`, and nothing about your actual work changes until you decide what to do about that.

### git pull: fetch, then immediately merge

\`\`\`bash
git pull origin main
# equivalent to:
git fetch origin
git merge origin/main
\`\`\`

\`git pull\` is genuinely just those two steps combined into one command: fetch the latest from the remote, then immediately merge the corresponding remote-tracking branch into your current local branch. This is convenient, but it means \`pull\` can trigger a merge conflict on the spot, with no chance to inspect what's incoming first — which is exactly the tradeoff \`fetch\` avoids.

### Why experienced developers often prefer fetch-then-merge separately

\`\`\`bash
git fetch origin
git log main..origin/main --oneline    # preview exactly what's incoming, before touching anything
git merge origin/main                   # merge only once you've looked
\`\`\`

Doing it as two explicit steps gives you a chance to inspect exactly what's about to be merged in — genuinely useful before merging into a branch with uncommitted work nearby, or just as a habit for staying deliberate about what's landing in your history.

### Pull with rebase instead of merge

\`\`\`bash
git pull --rebase origin main
\`\`\`

Instead of creating a merge commit for incoming changes, \`--rebase\` replays your local commits on top of the freshly-fetched remote history instead — producing a cleaner, linear history with no extra merge commits. This is popular enough as a default that many developers configure it permanently: \`git config --global pull.rebase true\`. (Rebasing itself, including its important caveats, gets a full module later in this course.)

### The most common real confusion

New Git users are frequently surprised that fetching alone doesn't update their files — this is the point of the distinction, not a limitation: fetch is a **safe, non-destructive check-in** with the remote, while pull is a genuine, potentially conflict-triggering change to your current branch.

> **Key idea:** \`fetch\` downloads remote changes and updates remote-tracking branches only — safe, no local impact; \`pull\` is \`fetch\` immediately followed by a \`merge\` (or, with \`--rebase\`, a rebase) into your current branch — the command that actually changes your working directory.`,
    },
    {
      name: "Pushing Changes & Tracking Branches",
      minutes: 7,
      intro: "Sending your local commits up to the remote, and setting up branches to do it easily.",
      content: `### The basic push

\`\`\`bash
git push origin main
\`\`\`

\`git push <remote> <branch>\` uploads your local branch's commits to the named branch on the named remote. This only works cleanly if the remote branch hasn't gained commits your local copy doesn't have — if it has, Git rejects the push (covered below), since blindly overwriting someone else's work is exactly what Git is designed to prevent by default.

### Pushing a new branch for the first time

\`\`\`bash
git push -u origin feature-login
# -u is short for --set-upstream
\`\`\`

The first time you push a brand-new local branch, \`-u\` (or \`--set-upstream\`) does two things: it creates the branch on the remote, and it links your local branch to it as its **upstream** — after this one-time setup, plain \`git push\` and \`git pull\` with no arguments know exactly where to go, since the link remembers it for you.

### Checking upstream tracking

\`\`\`bash
git branch -vv
\`\`\`
\`\`\`
* feature-login  a1b2c3d [origin/feature-login] Add login form
  main            d4e5f6a [origin/main] Initial commit
\`\`\`

\`-vv\` shows each local branch alongside the remote branch it's tracking, in brackets — a quick way to confirm the linkage is set up correctly, especially useful when something unexpected happens on a \`push\` or \`pull\` with no explicit arguments.

### When a push is rejected

\`\`\`bash
git push origin main
\`\`\`
\`\`\`
! [rejected]        main -> main (fetch first)
error: failed to push some refs
hint: Updates were rejected because the remote contains work that you do not have locally.
\`\`\`

This means someone else pushed to the same branch since you last synced. The correct response is almost always \`git pull\` (fetch and merge/rebase their changes in), resolve any conflicts, and then push again — **not** force-pushing over their work, which is covered, along with when it's genuinely appropriate, in the rebasing module.

### Deleting a remote branch

\`\`\`bash
git push origin --delete feature-login
\`\`\`

Deleting a branch locally (\`git branch -d\`) has no effect on the remote copy — it needs this separate, explicit push-based delete to remove it there too. On platforms like GitHub, merging a pull request often offers to do this automatically for you.

> **Key idea:** \`git push -u origin <branch>\` both creates the remote branch and links it as your local branch's upstream, so future plain \`push\`/\`pull\` need no arguments; a rejected push almost always means "pull first," not "force push" — force-pushing over someone else's work is a deliberate, rare action, not the default fix.`,
    },
    {
      name: "Working with Multiple Remotes",
      minutes: 6,
      intro: "Fork-and-clone workflows, backups, and mirroring — beyond a single origin.",
      content: `### Why you'd have more than one remote

A single \`origin\` covers most projects, but several common situations need more: contributing to an open-source project via a **fork** (your own copy on GitHub, separate from the original), pushing the same repository to two different hosts as a backup or mirror, or working across a company's internal server and a public one simultaneously.

### The classic fork workflow

\`\`\`bash
git clone https://github.com/YOUR-USERNAME/some-project.git
cd some-project
git remote add upstream https://github.com/original-owner/some-project.git

git remote -v
\`\`\`
\`\`\`
origin    https://github.com/YOUR-USERNAME/some-project.git (fetch/push)
upstream  https://github.com/original-owner/some-project.git (fetch/push)
\`\`\`

After forking a repository on GitHub and cloning **your fork**, \`origin\` points at your own copy (where you push your changes and open pull requests from). \`upstream\` is a conventional second remote name for the *original* project, letting you pull in the original's latest changes to keep your fork up to date — this exact pattern is covered hands-on in the next module, on collaborating via GitHub.

### Keeping a fork in sync with upstream

\`\`\`bash
git fetch upstream
git switch main
git merge upstream/main
git push origin main
\`\`\`

This is the routine maintenance loop for any fork: pull the original project's latest changes in from \`upstream\`, then push the now-updated \`main\` back up to your own \`origin\` — keeping your fork from drifting too far behind the original over time.

### Pushing to multiple remotes at once

\`\`\`bash
git remote set-url --add --push origin https://github.com/ada/project.git
git remote set-url --add --push origin https://gitlab.com/ada/project.git
\`\`\`

Configuring multiple push URLs under one remote name means a single \`git push origin\` sends to both destinations — a real (if fairly niche) pattern for teams that mirror a repository across two hosting providers for redundancy.

### Removing a remote

\`\`\`bash
git remote remove upstream
\`\`\`

Only removes the local reference to that remote and its remote-tracking branches — it has no effect whatsoever on the actual remote repository itself, which continues existing exactly as it was.

> **Key idea:** \`origin\` and \`upstream\` is the standard naming pattern for a fork workflow — your own copy vs. the original project you forked from — and a repository can have any number of remotes at once, each independently fetchable and pushable.`,
    },
  ],
}
