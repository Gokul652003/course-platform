import type { Module } from "../types"

export const gitModule7: Module = {
  id: 7,
  title: "Collaborating with GitHub",
  status: "upcoming",
  lessons: [
    {
      name: "From Local Repo to GitHub",
      minutes: 7,
      intro: "Getting an existing local project hosted and shared for the first time.",
      content: `### Git vs. GitHub: an important distinction

Git is the version control tool itself — it works entirely locally, with no account, no internet connection, and no company behind it required. **GitHub** (along with alternatives like GitLab and Bitbucket) is a separate, commercial hosting service *built on top of* Git — it stores your repositories on its servers and adds collaboration features (pull requests, issue tracking, code review, CI integration) that aren't part of Git itself. You could use Git your entire career without ever touching GitHub; in practice, though, GitHub has become the default place teams host and collaborate around Git repositories.

### Pushing an existing local project to GitHub

\`\`\`bash
# after creating an empty repository on github.com (no README, no .gitignore)
git remote add origin https://github.com/ada/my-project.git
git branch -M main
git push -u origin main
\`\`\`

This is the exact sequence GitHub itself suggests when you create a new empty repository through its interface: connect your existing local repo to the new remote, make sure your default branch is named \`main\` (\`-M\` renames it, forcing the rename even if a branch with the target name already exists — rarely an issue here), then push with \`-u\` to establish the tracking link covered in the previous module.

### Cloning instead, for a brand-new project

\`\`\`bash
git clone https://github.com/ada/my-project.git
\`\`\`

If the project doesn't exist locally yet at all, it's simpler to create the repository on GitHub first (optionally with a README, \`.gitignore\`, and license already generated) and clone it down — \`origin\` and the initial commit are both already set up for you, with nothing to wire together manually.

### Authentication: SSH keys vs. personal access tokens

\`\`\`bash
ssh-keygen -t ed25519 -C "ada@example.com"
# then add the resulting public key to GitHub under Settings -> SSH and GPG keys
\`\`\`

GitHub no longer accepts plain passwords for Git operations over HTTPS — you need either an SSH key (generated once, added to your GitHub account, then used automatically for every SSH-URL repository) or a **personal access token** used in place of a password for HTTPS URLs. Setting this up once, correctly, saves a lot of repeated friction — it's worth doing properly rather than repeatedly typing credentials.

### Making a repository private or public

Repository visibility (public — anyone can view it; private — only people you explicitly grant access) is a GitHub-level setting, not a Git concept at all — Git itself has no notion of "private," it just tracks history. This distinction matters: even a private GitHub repository's full history is still a complete, standard Git repository underneath, following every rule covered in this course so far.

> **Key idea:** Git is the underlying tool; GitHub is a hosting and collaboration service built on top of it — connecting an existing local repo means \`git remote add\` + \`push -u\`, while starting fresh usually means creating on GitHub first and cloning down; set up SSH keys or a token once to avoid repeated authentication friction.`,
    },
    {
      name: "Forks vs. Clones vs. Branches",
      minutes: 6,
      intro: "Three different ways to get 'a copy' of a project — and when each one applies.",
      content: `### The confusion these three cause

New contributors frequently conflate these three, since all of them involve, in some sense, "getting your own copy" — but they solve genuinely different problems and exist at different levels.

### A branch: a pointer within one repository

Covered in full in module 3 — a branch is a lightweight pointer inside a *single* repository, used for working on something in isolation from \`main\` before merging back. Two branches of the same repository share the exact same underlying repository and remote.

### A clone: a full local copy of one specific repository

Covered in the previous module — cloning downloads the complete history of one specific repository (whichever URL you clone) onto your machine. If you have push access to that repository, you can push directly back to it after cloning; if you don't, a push attempt will simply be rejected by the server due to insufficient permissions.

### A fork: your own separate copy, on the hosting platform itself

\`\`\`
github.com/original-owner/project   (the original)
        |
        | (Fork button on GitHub)
        v
github.com/YOUR-USERNAME/project    (your fork — a separate repository you own)
\`\`\`

A **fork** is a GitHub-level (not a Git-level) concept: clicking "Fork" creates an entirely new, independent repository *on GitHub's servers*, owned by your account, that starts as a copy of the original. You then \`clone\` **your fork** to your machine (not the original), giving you push access to your own copy even though you have no write access to the original project at all.

### Why forking exists: contributing without write access

This is the entire point of forking: open-source maintainers can't grant every potential contributor push access to the main repository — that would be an enormous security and quality-control problem. Instead, anyone can fork, make changes freely on their own copy, and then propose those changes back via a **pull request** (next lesson) — a formal request for the maintainer to review and, if they approve, merge the changes into the original project.

### Putting all three together

\`\`\`bash
# 1. Fork on GitHub's website (creates YOUR-USERNAME/project)
# 2. Clone YOUR fork, not the original
git clone https://github.com/YOUR-USERNAME/project.git
cd project
# 3. Branch, as always, for the specific change you're making
git switch -c fix/typo-in-docs
# ... make changes, commit ...
git push -u origin fix/typo-in-docs
# 4. Open a pull request from your fork's branch back to the original repo
\`\`\`

This full sequence — fork, clone your fork, branch, commit, push, open a PR — is the standard path for contributing to essentially any open-source project you don't have direct write access to, and it's worth having memorized.

> **Key idea:** a branch isolates work within one repository; a clone is a full local copy of one specific repository; a fork is a separate, independent repository on the hosting platform, owned by you — forking exists specifically to let anyone propose changes to a project without needing write access to it.`,
    },
    {
      name: "Pull Requests: The Real Workflow",
      minutes: 8,
      intro: "How proposed changes actually get reviewed and merged on a real team.",
      content: `### What a pull request actually is

A **pull request** (PR — called a "merge request" on GitLab) is a request to merge one branch into another, paired with a space for discussion, automated checks, and review — it is not a Git concept at all, but a feature every major hosting platform layers on top of Git's branching and merging. Underneath, it's ultimately still just \`git merge\`, but with a structured, visible process wrapped around it before that merge happens.

### Opening a pull request

\`\`\`bash
git push -u origin fix/login-redirect-bug
# then, on GitHub: "Compare & pull request" button appears automatically
\`\`\`

Once a branch is pushed, GitHub (and similar platforms) detects it and offers to open a PR directly from the web interface — you pick the base branch (almost always \`main\`) and the compare branch (your feature branch), write a title and description explaining the change, and submit it for review.

### What reviewers see and can do

\`\`\`
+ Added retry logic to webhook handler
- Removed the old timeout constant
\`\`\`

A PR shows the full diff of every change across every commit on the branch, lets reviewers leave comments on specific lines, approve, request changes, or leave general discussion — all without touching their own local checkout at all; it's entirely a web-interface-driven review process layered on top of the underlying Git history.

### Responding to review feedback

\`\`\`bash
# make the requested changes locally
git add .
git commit -m "Address review feedback: extract magic number to a constant"
git push
\`\`\`

Because your branch is still tracked and pushed via ordinary Git commands, addressing feedback is just... more normal commits, pushed to the same branch — the open PR automatically updates to show the new commits, and reviewers get notified. There's no separate "resubmit" step; the PR simply reflects whatever the branch currently contains.

### Automated checks (CI)

Most real projects run automated tests, linters, and build checks against every PR automatically (via GitHub Actions or a similar CI system) — a PR typically can't (or, by convention, shouldn't) be merged until these checks pass, catching broken code before it ever reaches \`main\`. This is a major reason PRs exist at all beyond just code review: they're the natural checkpoint to run automated verification before anything lands.

### Merging the PR

Once approved and checks pass, merging is usually done through the platform's UI, and (per the merge strategies from module 4) it typically offers a choice: a regular merge commit, a squash merge, or a rebase-and-merge — the same underlying Git operations you already understand, just triggered from a button instead of your own terminal.

> **Key idea:** a pull request is a review-and-discussion layer built on top of ordinary Git branches and merges — pushing new commits to the same branch automatically updates an open PR, and merging via the platform's UI performs the exact same fast-forward/merge/squash operations you already know from the command line.`,
    },
    {
      name: "Code Review Etiquette & Resolving PR Feedback",
      minutes: 6,
      intro: "The human side of pull requests, and the Git mechanics behind common feedback.",
      content: `### Writing a PR description that helps reviewers

\`\`\`markdown
## What
Adds exponential backoff retry logic to the payment webhook handler.

## Why
Webhook deliveries were failing silently on transient network errors,
with no retry — this was causing real revenue-impacting missed payments.

## Testing
Verified locally by simulating a 3x transient failure then success.
\`\`\`

A PR description that explains **what** changed, **why**, and **how it was tested** dramatically speeds up review — a reviewer without that context has to reverse-engineer your intent from the diff alone, which is slower and more error-prone for everyone involved.

### Keeping PRs small

The single biggest lever for getting fast, high-quality review is **PR size** — a 50-line, focused PR gets thorough review in minutes; a 2,000-line PR touching twelve unrelated things gets a rubber-stamp approval nobody actually read carefully, or sits ignored for days. Splitting large work into a sequence of small, reviewable PRs is a skill worth deliberately practicing.

### Common review feedback and the Git mechanics to address it

\`\`\`bash
# "please squash your wip commits before merging"
git rebase -i HEAD~5      # covered in full in the next module

# "this conflicts with main now, please resolve"
git switch main && git pull
git switch fix/login-redirect-bug
git merge main             # or: git rebase main

# "please split this into two smaller PRs"
git switch -c fix/part-1 main
git cherry-pick <relevant-commit-hashes>    # covered in the next module
\`\`\`

Almost every category of review feedback maps directly onto a Git operation you've either already learned or will learn in the next module — review feedback is rarely asking for something Git can't do cleanly, once you know which command applies.

### Marking conversations resolved and re-requesting review

On GitHub specifically, individual review comments can be marked "resolved" once addressed, and pushing new commits to an already-reviewed PR typically dismisses stale approvals (configurable per-repository) — re-requesting review after pushing fixes is a normal, expected part of the loop, not something that signals you've done anything wrong.

### Receiving feedback gracefully

Code review comments are about the code, not a judgment of the author — the healthiest teams treat review feedback as routine and collaborative, not adversarial. Asking a clarifying question in a review thread when feedback is unclear is always better than guessing at what a reviewer meant.

> **Key idea:** small, well-described PRs get faster and better review than large, vague ones; nearly every category of review feedback ("squash these," "resolve this conflict," "split this up") corresponds directly to a specific Git operation, most of which you've already learned by this point in the course.`,
    },
    {
      name: "Keeping Your Fork/Branch in Sync",
      minutes: 6,
      intro: "Preventing a PR from going stale while it waits for review.",
      content: `### Why staying in sync matters

The longer a feature branch or open PR sits without incorporating \`main\`'s latest changes, the more it drifts — and the harder the eventual merge or rebase becomes, since more time means more potential for the same files to have changed on both sides. Syncing periodically, even before it's strictly required, keeps conflicts small and manageable instead of one enormous conflict at the very end.

### Updating a feature branch with main's latest changes: merge approach

\`\`\`bash
git switch feature-login
git fetch origin
git merge origin/main
\`\`\`

Merging \`main\` into your feature branch brings its latest commits in as a normal merge — safe, non-destructive, but it does add a merge commit to your feature branch's history, which some teams prefer to avoid for cleanliness.

### Updating a feature branch: rebase approach

\`\`\`bash
git switch feature-login
git fetch origin
git rebase origin/main
\`\`\`

Rebasing replays your feature branch's commits on top of \`main\`'s latest tip instead, producing a clean, linear history with no extra merge commit — the tradeoff, covered fully in the next module, is that rebasing rewrites your branch's commit hashes, which matters if you've already pushed and others have based work on your branch.

### After rebasing an already-pushed branch

\`\`\`bash
git push --force-with-lease
\`\`\`

Because rebasing changes commit hashes, a normal push will be rejected (the remote sees what looks like diverged history). \`--force-with-lease\` is the safer form of force-push — covered in depth in the next module — that refuses to overwrite the remote if someone else has pushed to that branch since you last fetched, unlike a plain \`--force\`, which would blindly overwrite regardless.

### Syncing a fork specifically

\`\`\`bash
git fetch upstream
git switch main
git merge upstream/main
git push origin main
\`\`\`

This is the exact fork-sync loop from the previous module — worth repeating here because it's the specific version of "staying in sync" that applies when your work lives on a fork rather than a branch of the same repository.

### A practical habit

Syncing your feature branch with \`main\` once a day (or right before requesting review) on anything longer-lived than a few hours is a cheap habit that pays for itself the first time it prevents a genuinely painful, large conflict at merge time.

> **Key idea:** merging \`main\` into a feature branch is safe but adds a merge commit; rebasing onto \`main\` keeps history linear but rewrites commit hashes, requiring \`--force-with-lease\` to push — either way, syncing frequently keeps conflicts small instead of letting them accumulate into one large one.`,
    },
  ],
}
