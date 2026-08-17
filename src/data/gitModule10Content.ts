import type { Module } from "../types"

export const gitModule10: Module = {
  id: 10,
  title: "Branching Strategies & Team Workflows",
  status: "upcoming",
  lessons: [
    {
      name: "Git Flow",
      minutes: 8,
      intro: "The original, structured branching model — and where it still fits today.",
      content: `### The core branches

\`\`\`
main        — always reflects production, tagged at every release
develop     — the integration branch; latest completed work
feature/*   — one branch per feature, branched from and merged back into develop
release/*   — a short-lived branch to stabilize before a release
hotfix/*    — an urgent fix branched directly from main
\`\`\`

**Git Flow**, popularized by Vincent Driessen in 2010, is a formalized branching model built around two permanent branches (\`main\` and \`develop\`) and several kinds of short-lived, purpose-specific branches around them. It was hugely influential — many teams' branching conventions today are simplified descendants of it, even when they don't use the full model.

### The feature branch lifecycle

\`\`\`bash
git switch develop
git switch -c feature/user-avatar-upload
# ... work, commit ...
git switch develop
git merge --no-ff feature/user-avatar-upload
git branch -d feature/user-avatar-upload
\`\`\`

Feature branches always branch from \`develop\` and merge back into \`develop\` — never touching \`main\` directly. The \`--no-ff\` from module 4 is a deliberate, standard part of Git Flow: it preserves a visible record of every feature as a distinct unit in \`develop\`'s history.

### Release branches: stabilizing before shipping

\`\`\`bash
git switch develop
git switch -c release/1.2.0
# only bug fixes and final polish here — no new features
git switch main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git switch develop
git merge --no-ff release/1.2.0
\`\`\`

A release branch freezes scope — no new features land here, only fixes needed to ship. Once stable, it merges into **both** \`main\` (tagged as the actual release, using the tagging skills from the previous module) and back into \`develop\`, so develop doesn't lose any last-minute fixes made during stabilization.

### Hotfixes: urgent fixes that can't wait for the normal cycle

\`\`\`bash
git switch main
git switch -c hotfix/critical-payment-bug
# ... fix, commit ...
git switch main
git merge --no-ff hotfix/critical-payment-bug
git tag -a v1.2.1 -m "Hotfix: critical payment bug"
git switch develop
git merge --no-ff hotfix/critical-payment-bug
\`\`\`

Unlike a normal feature, a hotfix branches directly from \`main\` (since it needs to reach production immediately, without waiting for whatever is currently in progress on \`develop\`) and, like a release, merges into both \`main\` and \`develop\` afterward.

### Where Git Flow fits today

Git Flow's rigidity is a deliberate strength for projects with **scheduled, versioned releases** — desktop software, libraries with semantic versioning, anything shipped in discrete numbered versions. For teams that deploy continuously (many times a day, straight to production), it's often considered too heavyweight — which is exactly the gap the next lesson's trunk-based development fills.

> **Key idea:** Git Flow structures work around \`main\` (production) and \`develop\` (integration), with \`feature/*\`, \`release/*\`, and \`hotfix/*\` branches each merging back in specific, prescribed ways — a strong fit for scheduled, versioned releases, less so for teams shipping continuously.`,
    },
    {
      name: "Trunk-Based Development & Feature Flags",
      minutes: 7,
      intro: "One branch, tiny commits, and deploying constantly.",
      content: `### The core idea

\`\`\`
main (the "trunk")  — every commit lands here, directly or via very short-lived branches
\`\`\`

**Trunk-based development** is close to the opposite of Git Flow's structure: there's essentially one long-lived branch (\`main\`, the "trunk"), and developers integrate their work into it constantly — often multiple times a day — via branches that live for hours, not weeks. There's no \`develop\`, no long-lived \`release/*\` branches; \`main\` itself is always kept in a deployable state.

### Why this works: very small, frequent changes

\`\`\`bash
git switch -c quick-fix
# a small, focused change — hours, not days
git push -u origin quick-fix
# open a PR, get quick review, merge same day
\`\`\`

The entire model depends on changes being **small**. A branch that lives an hour or two has almost no chance to drift meaningfully from \`main\`, which means merges are nearly always trivial and conflicts are rare — this is the direct, practical payoff of the "short-lived branches" habit recommended all the way back in module 3, taken to its logical extreme.

### The problem: how do you ship an unfinished feature safely?

If everything merges to \`main\` constantly, and \`main\` is deployed continuously, how do you work on something that takes two weeks without exposing half-finished functionality to real users the entire time? The answer isn't a long-lived branch — it's a **feature flag**.

### Feature flags: hiding unfinished code behind a toggle

\`\`\`js
if (featureFlags.isEnabled("new-checkout-flow")) {
  renderNewCheckout()
} else {
  renderOldCheckout()
}
\`\`\`

A feature flag is a runtime toggle — the new code merges into \`main\` and deploys to production immediately, but stays inactive (hidden behind the flag, defaulting to off) until it's ready. This completely decouples **deploying** code (which happens constantly, trunk-based) from **releasing** a feature to users (which happens whenever the flag gets flipped on, independent of any deploy). It also enables gradual rollouts — turning a flag on for 1% of users, then 10%, then everyone, watching for problems at each step.

### Trunk-based vs. Git Flow: not a strict either/or

\`\`\`
Git Flow:            structure comes from branches (develop, release/*, hotfix/*)
Trunk-based + flags:  structure comes from runtime toggles, not branch topology
\`\`\`

Most modern teams practicing continuous deployment lean trunk-based, since Git Flow's branch overhead adds friction that doesn't pay for itself when you're not doing scheduled, versioned releases. But plenty of successful projects land somewhere in between — short-lived branches with a lightweight review step, without the full Git Flow ceremony, and without full continuous deployment either.

> **Key idea:** trunk-based development merges small, short-lived branches into \`main\` constantly, keeping it always deployable — feature flags decouple "deployed" from "released to users," letting large, in-progress features live safely in \`main\` without a long-lived feature branch or exposure to real users before they're ready.`,
    },
    {
      name: "Semantic Commit Messages & Conventional Commits",
      minutes: 6,
      intro: "A structured format that makes history machine-readable, not just human-readable.",
      content: `### The Conventional Commits format

\`\`\`
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
\`\`\`

\`\`\`
feat(auth): add password strength meter to signup form
fix(webhook): retry payment notifications on transient network errors
docs(readme): correct outdated installation instructions
refactor(api): extract shared validation logic into a helper
\`\`\`

**Conventional Commits** is a widely-adopted specification that structures every commit message's summary line into a \`type\`, an optional \`scope\` (which part of the codebase), and a description — building directly on the "explain why, keep it atomic" habits from module 2, but formalizing the summary line into something a machine can parse too, not just a human.

### The common types

\`\`\`
feat     — a new feature
fix      — a bug fix
docs     — documentation only
refactor — code change that neither fixes a bug nor adds a feature
test     — adding or correcting tests
chore    — routine maintenance (dependency bumps, config tweaks)
style    — formatting only, no logic change
\`\`\`

These aren't officially fixed by any authority — some teams add their own (\`perf\`, \`ci\`, \`build\`) — but this core set covers the overwhelming majority of real commits, and consistency in using them is what makes the format valuable.

### Why the machine-readable part matters: automated versioning

\`\`\`
feat: ...     ->  bumps the MINOR version (1.2.0 -> 1.3.0)
fix: ...      ->  bumps the PATCH version (1.2.0 -> 1.2.1)
feat!: ...    ->  a "!" marks a BREAKING CHANGE, bumps MAJOR (1.2.0 -> 2.0.0)
\`\`\`

Tools like \`semantic-release\` and \`standard-version\` can read a project's entire commit history since the last release and **automatically determine the next version number and generate a changelog** — entirely from consistently-typed commit messages, with zero manual changelog-writing required. This is the real payoff beyond just readability: structured commits become an input other tooling can build on.

### Breaking changes

\`\`\`
feat(api)!: remove deprecated /v1/users endpoint

BREAKING CHANGE: /v1/users has been removed. Use /v2/users instead,
which requires an additional 'role' field on every request.
\`\`\`

A \`!\` right after the type/scope, or a \`BREAKING CHANGE:\` footer, explicitly flags a change that consumers of the code need to know about and possibly adjust for — exactly the kind of detail that's easy to bury in a long diff but critical not to miss.

### Enforcing the convention

\`\`\`bash
npx commitlint --edit
\`\`\`

Teams that adopt this format seriously often enforce it with a Git hook (covered in the final module) running a tool like \`commitlint\`, which rejects a commit outright if its message doesn't match the expected format — turning a convention that could quietly erode over time into one that's actually guaranteed.

> **Key idea:** Conventional Commits structures the summary line as \`type(scope): description\` (\`feat\`, \`fix\`, \`docs\`, \`refactor\`, and more) — beyond readability, this consistent structure is what lets tooling auto-generate changelogs and determine semantic version bumps directly from commit history, with no manual bookkeeping.`,
    },
    {
      name: "Protecting Branches & CI Gates",
      minutes: 6,
      intro: "Enforcing quality and process through the hosting platform, not just convention.",
      content: `### The problem with convention alone

Everything covered so far — small PRs, good commit messages, code review — works as long as everyone follows it. **Branch protection rules** turn some of these conventions from "things we agreed to do" into "things the platform will not let you skip," which matters enormously as a team grows past the size where everyone can informally keep each other honest.

### Common branch protection rules

\`\`\`
- Require a pull request before merging (no direct pushes to main)
- Require at least 1 (or more) approving reviews
- Require status checks to pass (tests, linting, build) before merging
- Require branches to be up to date with main before merging
- Restrict who can push to this branch at all
\`\`\`

On GitHub, these are configured per-repository under Settings → Branches, applied to \`main\` (and often \`develop\`, on projects using Git Flow) specifically. Once enabled, even a repository administrator typically can't bypass them without explicitly disabling the rule first — the whole point is removing the ability to skip the process under pressure.

### CI status checks as a gate

\`\`\`yaml
# .github/workflows/ci.yml (simplified)
on: pull_request
jobs:
  test:
    steps:
      - run: npm test
      - run: npm run lint
\`\`\`

Connecting this back to the earlier PR lesson: a CI workflow that runs on every pull request produces a pass/fail **status check**, and branch protection can require that check to be green before the merge button is even enabled. This is what makes "tests must pass before merging" an enforced rule rather than a hopeful guideline.

### Requiring branches to be up to date

This specific rule connects directly to module 7's syncing lesson: it forces a PR branch to have \`main\`'s latest changes merged or rebased in *before* it can be merged, preventing a subtle class of bug where two individually-passing PRs, once both merged, combine to break something neither one broke alone.

### Balancing protection against friction

Every rule added here is a real tradeoff — strict protection catches more mistakes but adds process overhead to every single change, including trivial ones. Most teams tune this over time: very strict on \`main\` for a mature product with paying users, often looser (or entirely absent) for a fast-moving early-stage project or a personal repository where the overhead isn't yet worth it.

> **Key idea:** branch protection rules turn team conventions (PR required, review required, tests must pass) into platform-enforced gates that can't be silently skipped under pressure — the right amount of protection is a genuine tradeoff between safety and process overhead, tuned to a project's actual stakes.`,
    },
    {
      name: "Choosing a Workflow for Your Team",
      minutes: 5,
      intro: "There's no universally correct answer — only the right fit for your context.",
      content: `### The real question isn't "which is best"

Every workflow covered in this module — Git Flow, trunk-based development with feature flags, Conventional Commits, branch protection — solves a real problem, but each adds real overhead too. The question worth asking isn't "which is objectively superior," it's "which problems do we actually have, and which of these solutions are worth their cost for us."

### A rough decision framework

\`\`\`
Do you ship scheduled, numbered versions (a library, desktop app)?
  -> Git Flow's structure (release/* branches, semantic tags) genuinely fits.

Do you deploy continuously, many times a day, straight to production?
  -> Trunk-based development + feature flags fits much better than Git Flow.

Is your team small (under ~5) and moving fast on one thing at a time?
  -> Heavy process may cost more than it saves; keep it simple —
     short-lived branches and lightweight PRs may be all you need.

Is your team large, or does the codebase have serious compliance/safety stakes?
  -> Branch protection and required reviews stop being optional.
\`\`\`

None of these are strict rules — real teams routinely mix elements: trunk-based development *with* required PR review and CI gates is extremely common, for instance, combining ideas from different parts of this module rather than adopting one wholesale.

### Start simpler than you think you need

A very common mistake, especially on new or small projects, is over-engineering the workflow before there's a team size or release cadence that actually justifies it. Starting with "everyone branches for their work, opens a PR, gets one review, merges" and adding structure only when a specific, real problem shows up (release coordination gets messy → consider Git Flow; a bad commit reached production → add required CI checks) tends to work out better than adopting a full framework speculatively.

### What matters more than any specific workflow

Across every workflow in this module, the same underlying habits keep showing up: small, focused commits and PRs; clear commit messages explaining *why*; short-lived branches merged frequently; and a shared, explicit convention the whole team actually follows consistently. Any reasonable workflow works fine with those habits in place — and no workflow, however well-designed, fully compensates for their absence.

> **Key idea:** pick a workflow based on your actual release cadence and team size, not based on which one sounds most sophisticated — and prioritize the underlying habits (small commits, short-lived branches, clear messages, consistent convention) over the specific framework, since those matter more than which named workflow you've adopted.`,
    },
  ],
}
