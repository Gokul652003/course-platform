import type { Module } from "../types"

export const gitModule11: Module = {
  id: 11,
  title: "Git Internals",
  status: "upcoming",
  lessons: [
    {
      name: "The .git Directory, Demystified",
      minutes: 7,
      intro: "Everything Git knows about your project lives in one hidden folder.",
      content: `### Everything lives right here

\`\`\`bash
ls -la .git
\`\`\`
\`\`\`
HEAD
config
description
hooks/
index
objects/
refs/
\`\`\`

Every commit, branch, tag, and setting you've learned about so far in this course is stored somewhere inside this one hidden folder, created the moment you ran \`git init\`. There is genuinely nothing magic or hidden elsewhere — a Git repository *is* this folder, plus your working directory's files. Understanding its handful of key pieces demystifies commands that otherwise feel like magic.

### HEAD: a plain text file

\`\`\`bash
cat .git/HEAD
\`\`\`
\`\`\`
ref: refs/heads/main
\`\`\`

Remember \`HEAD\` from module 3 — "the branch you currently have checked out"? It's implemented as literally nothing more than this one-line text file, pointing at another file (\`refs/heads/main\`) rather than a commit hash directly. When you \`git switch\` to a different branch, this file's content is simply what gets rewritten.

### refs/: where branches and tags actually live

\`\`\`bash
cat .git/refs/heads/main
\`\`\`
\`\`\`
a1b2c3d4e5f678901234567890abcdef12345678
\`\`\`

A branch, as promised back in module 3, really is nothing more than a text file containing a single commit hash — \`refs/heads/main\` is exactly that file for the \`main\` branch. \`git commit\` moving the branch pointer forward means, literally, overwriting this one file with the new commit's hash. Tags live in the parallel \`refs/tags/\` directory, the same basic idea.

### objects/: the actual content of your history

\`\`\`bash
ls .git/objects
\`\`\`
\`\`\`
a1/  c3/  d4/  ...  pack/
\`\`\`

This is where every commit, every file's content, and every directory snapshot in your entire history is actually stored, addressed by content — covered in full in the next lesson. This directory is, by far, the largest part of a real repository's \`.git\` folder.

### index: the staging area, as an actual file

\`\`\`bash
git ls-files --stage
\`\`\`

Remember the staging area from module 1? \`.git/index\` is its literal, physical implementation — a binary file listing exactly what will go into the next commit. \`git add\` writes to this file; \`git commit\` reads from it.

### config: your local settings

Exactly the local, per-repository config from the previous module — anything set without \`--global\` while inside this repository lives here, in plain, human-readable text, editable by hand if you prefer.

> **Key idea:** the entire repository — every commit, branch, tag, and local setting — lives inside \`.git\`, implemented as surprisingly simple pieces: \`HEAD\` and every branch/tag are just tiny text files pointing at a hash, \`index\` is the staging area as an actual file, and \`objects/\` holds the real content, covered next.`,
    },
    {
      name: "Objects: Blobs, Trees & Commits",
      minutes: 9,
      intro: "The three building blocks every single piece of Git history is made from.",
      content: `### Three object types, one system

Every single thing Git tracks — file content, directory structure, and the commits themselves — is stored as one of exactly three object types, each identified by a **SHA-1 hash** of its own content (this is what a "commit hash" actually is: a hash of the commit object itself). Understanding these three fully demystifies what a "snapshot" concretely means.

### Blob: a file's raw content

\`\`\`bash
echo "console.log('hello')" | git hash-object --stdin
\`\`\`
\`\`\`
557db03de997c86a4a028e1ebd3a1ceb225be238
\`\`\`

A **blob** stores a file's raw content — and nothing else at all: not its filename, not its permissions, none of that. This is a genuinely important detail: if two files anywhere in your entire repository (even in completely different directories, even across unrelated commits) have byte-for-byte identical content, they are stored as the exact same single blob. Git deduplicates automatically, for free, as a natural side effect of content-addressing.

### Tree: a directory listing

\`\`\`bash
git cat-file -p HEAD^{tree}
\`\`\`
\`\`\`
100644 blob 557db03d...  app.js
100644 blob 8f3a1c2b...  README.md
040000 tree c3d4e5f6...  src
\`\`\`

A **tree** represents one directory's contents — a list of entries, each pointing to either a blob (a file) or another tree (a subdirectory), along with the filename and permissions for that entry. This is where filenames actually live in Git's model — notice they weren't part of the blob at all. A commit's full directory structure is one top-level tree, containing other trees, containing blobs, all the way down.

### Commit: a snapshot, with metadata and a parent

\`\`\`bash
git cat-file -p HEAD
\`\`\`
\`\`\`
tree c3d4e5f678901234567890abcdef1234567890ab
parent a1b2c3d4e5f678901234567890abcdef12345678
author Ada Lovelace <ada@example.com> 1786873658 +0000
committer Ada Lovelace <ada@example.com> 1786873658 +0000

Add password validation
\`\`\`

A **commit** object ties everything together: a pointer to exactly one tree (the complete directory snapshot at that point), a pointer to its parent commit (or commits, for a merge — this is literally where a commit's "parent" comes from), author/committer info, a timestamp, and the message. This is the object whose hash is a "commit hash" — and it's why changing *anything* about a commit (its content, its parent, even just its message) produces a completely different hash: the hash is a function of everything inside it.

### Putting it together: what "a snapshot" really means

\`\`\`
commit -> tree (root directory) -> tree (subdirectory) -> blob (file content)
                                 -> blob (another file)
\`\`\`

Back in module 1, "a commit is a full snapshot" was stated as a simplification worth trusting before you understood the mechanism — now you can see exactly how: a commit points to one tree that fully describes the entire directory structure at that moment, recursively, all the way down to file content. This is also precisely why unchanged files cost virtually nothing to "snapshot" again: an unchanged file's blob already exists, and an unchanged directory's tree can simply be reused, hash and all.

> **Key idea:** a blob stores raw file content (no filename); a tree maps names to blobs/other trees, describing directory structure; a commit points to one root tree plus its parent(s) and metadata — every commit hash is a hash of that commit object's exact content, which is why any change anywhere produces an entirely new hash.`,
    },
    {
      name: "Refs, HEAD & the Object Database",
      minutes: 6,
      intro: "How human-readable names map onto the raw, hash-addressed objects underneath.",
      content: `### The object database is content-addressed, not location-addressed

Every object (blob, tree, or commit) is stored and retrieved purely by the hash of its own content — there's no separate index mapping "commit #47" to some object; the hash *is* the address, and it's derived entirely from what's inside. This property is called **content-addressable storage**, and it has a genuinely elegant consequence: two repositories, anywhere in the world, that happen to contain the exact same commit will compute the exact identical hash for it — hashes aren't assigned by any central authority, they're a pure function of content.

### Why humans need refs at all

Nobody wants to type or remember a 40-character hash to refer to \`main\` — this is the entire reason **refs** (branches, tags, and \`HEAD\`) exist: a thin, human-friendly naming layer sitting on top of the raw, hash-addressed object database underneath. Every ref, ultimately, resolves down to a specific commit hash.

### The chain, traced end to end

\`\`\`
"main"  (a name you type)
  -> .git/refs/heads/main  (a file containing a hash)
    -> a1b2c3d4...  (a commit object)
      -> tree c3d4e5f6...  (the root directory snapshot)
        -> blob 557db03d...  (one file's content)
\`\`\`

Every single Git command you've used throughout this course ultimately resolves down to walking exactly this chain — \`git switch main\` follows it to find which commit to check out; \`git log\` walks backward from a commit through its \`parent\` pointers; \`git show <hash>\` just reads one object directly. There's no additional hidden machinery beyond what's described in this and the previous lesson.

### Symbolic refs

\`\`\`bash
cat .git/HEAD
\`\`\`
\`\`\`
ref: refs/heads/main
\`\`\`

\`HEAD\` is what's called a **symbolic ref** — a ref that points at another ref (\`refs/heads/main\`), rather than directly at a commit hash. This one extra layer of indirection is exactly what makes \`HEAD\` automatically "follow" whichever branch you're on: switch branches, and this one file's content changes to point at a different ref, with nothing else needing to update.

### Detached HEAD: when HEAD points directly at a commit

\`\`\`bash
git checkout a1b2c3d
\`\`\`
\`\`\`
Note: switching to 'a1b2c3d'.
You are in 'detached HEAD' state.
\`\`\`

Checking out a raw commit hash (rather than a branch name) breaks that indirection — \`HEAD\` now points directly at a commit, with no branch in between. Any new commits made in this state have no branch pointer tracking them, so they can become unreachable and eventually garbage-collected once you switch away, unless you create a branch there first (\`git switch -c new-branch-name\`) to give them a permanent home.

> **Key idea:** every ref (a branch, a tag, or \`HEAD\`) is a human-friendly name that ultimately resolves down to a raw commit hash in the content-addressed object database — \`HEAD\` is usually a symbolic ref pointing at a branch, and "detached HEAD" is simply what happens when that extra layer of indirection is bypassed.`,
    },
    {
      name: "Plumbing vs. Porcelain Commands",
      minutes: 5,
      intro: "The everyday commands you use are a friendly layer over simpler, low-level ones.",
      content: `### Two layers of the same tool

Git's own documentation makes this distinction explicitly: **porcelain** commands are the user-friendly, high-level ones designed for daily use — \`status\`, \`commit\`, \`merge\`, \`log\`, everything covered throughout this entire course up to this point. **Plumbing** commands are the low-level building blocks porcelain is actually implemented on top of — you've already used a few of them in this module without necessarily noticing: \`git hash-object\`, \`git cat-file\`.

### Common plumbing commands

\`\`\`bash
git hash-object --stdin      # compute (and optionally store) a blob's hash
git cat-file -p <hash>       # print any object's raw content, given its hash
git rev-parse HEAD           # resolve any ref down to its raw commit hash
git ls-tree HEAD             # list a tree object's entries directly
\`\`\`

Each of these does exactly one small, precise thing at the object level — no user-friendly formatting, no safety confirmations, just direct access to the mechanism underneath. \`git rev-parse\`, in particular, is genuinely useful in scripts: it's the reliable way to resolve "whatever HEAD currently is" down to an exact hash for further processing.

### Why porcelain commands feel "friendly" by comparison

Every porcelain command you've used throughout this course is, underneath, some combination of plumbing operations plus a layer of user experience: sensible defaults, readable formatting, confirmation prompts on genuinely destructive actions, and helpful error messages. \`git commit\`, for instance, is roughly "write a tree object from the index, write a commit object pointing at that tree and the current HEAD, then update the current branch's ref" — several plumbing-level steps, wrapped into one friendly command.

### When you'd actually reach for plumbing

In completely ordinary day-to-day work, you'll essentially never need plumbing commands directly — porcelain covers everything covered throughout this entire course. Plumbing becomes genuinely useful in two situations: writing scripts or tooling that needs to inspect or manipulate a repository programmatically (many Git GUI tools and CI integrations are built directly on plumbing), or — as in this module — building a rock-solid mental model of what's actually happening underneath the friendly commands you use every day.

### This module's real payoff

Every mental model from this course — "a branch is a pointer," "a commit is a snapshot," "HEAD tracks where you are" — has now been traced all the way down to the literal files and hashes that implement it. That's not trivia: it's exactly what makes commands like \`reset\`, \`rebase\`, and \`reflog\` feel predictable instead of mysterious, since you now know precisely what they're moving and why.

> **Key idea:** porcelain commands (\`commit\`, \`merge\`, \`log\`, everything you use daily) are user-friendly wrappers implemented on top of low-level plumbing commands (\`hash-object\`, \`cat-file\`, \`rev-parse\`) that operate directly on objects and refs — you'll rarely touch plumbing directly, but understanding it is what turns Git from a set of memorized commands into a system you genuinely understand.`,
    },
    {
      name: "How Git Actually Stores History",
      minutes: 6,
      intro: "Putting every internals concept together into one complete, working picture.",
      content: `### The complete picture, from a single commit

\`\`\`
git commit -m "Add password validation"
        |
        v
1. Snapshot the staging area (.git/index) into tree objects
   — reusing any unchanged blob/tree from the previous commit unchanged
2. Create a new commit object:
     - pointing at that root tree
     - pointing at the current commit as its parent
     - your name/email/timestamp, and your message
3. Write both the tree(s) and the commit object into .git/objects,
   each addressed by the hash of its own content
4. Update the current branch's ref (.git/refs/heads/main)
   to point at this new commit's hash
5. Move HEAD -- automatically, since it's a symbolic ref pointing at that branch
\`\`\`

This is the complete, accurate version of "commit" — every step in this list corresponds directly to something covered in this module. Nothing about it is more mysterious than this.

### Why unchanged files are essentially free

Because objects are content-addressed, a commit that only touches one file out of a thousand doesn't need a thousand new blobs — 999 of them are byte-identical to what already exists in \`.git/objects\`, so the new commit's tree simply reuses those existing hashes. This is the concrete mechanism behind something stated back in module 1 as a simplification: Git records a "full snapshot" every commit, but storage cost scales with what actually *changed*, not with total project size.

### Compression: packfiles

\`\`\`bash
git gc
ls .git/objects/pack
\`\`\`

Individual "loose" objects (one file per object, as described above) are simple but not maximally space-efficient — \`git gc\` (from the previous module) periodically compresses many loose objects together into **packfiles**, using delta compression (storing many objects as small diffs against a similar one, rather than each in full) for genuinely significant space savings on a repository with a long history. This is entirely transparent — every command you've learned works identically whether an object is loose or packed.

### Integrity: why history can't be silently altered

Because every object's hash is a function of its own content, and every commit's hash additionally depends on its parent's hash, tampering with *any* historical commit changes that commit's hash — which changes every single descendant commit's hash after it, all the way to the current tip. This is a direct, structural consequence of content-addressing, not a bolted-on security feature: Git's history is effectively tamper-evident by construction, the same underlying idea blockchains later became known for.

### Closing the loop on this entire course

Every command from every earlier module — \`add\`, \`commit\`, \`branch\`, \`merge\`, \`rebase\`, \`reset\`, \`reflog\`, \`cherry-pick\` — is now traceable down to blobs, trees, commits, refs, and a content-addressed object database. That's the real goal of this internals module: not to make you write plumbing commands day to day, but to replace "memorized commands that sometimes do surprising things" with a system whose behavior you can actually predict, in any situation, including ones this course never explicitly covered.

> **Key idea:** a commit is, precisely, a new tree (reusing every unchanged blob/tree by hash) plus a new commit object pointing at that tree and its parent, with the current branch's ref updated to match — content-addressing is what makes unchanged files free to "re-snapshot" and makes history tamper-evident, and it's the single idea every other Git concept in this course ultimately rests on.`,
    },
  ],
}
