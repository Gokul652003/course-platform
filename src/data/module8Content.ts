import type { Module } from "../types"

export const module8: Module = {
  id: 8,
  title: "Package Management",
  status: "upcoming",
  lessons: [
    {
      name: "apt",
      minutes: 8,
      intro: "Work with the Advanced Package Tool used by Debian and Ubuntu.",
      content: `## The Advanced Package Tool

**apt** is the package manager used by Debian, Ubuntu, and their derivatives. It resolves dependencies automatically and pulls packages from configured repositories.

### Update your package index

Run this before installing anything so the lists are current:

\`\`\`bash
sudo apt update
\`\`\`

### Search for a package

\`\`\`bash
apt search curl
\`\`\`

### Install a package

\`\`\`bash
sudo apt install curl
\`\`\`

Use the \`-y\` flag to accept prompts automatically in scripts:

\`\`\`bash
sudo apt install -y htop
\`\`\`

### See a package's details

\`\`\`bash
apt show curl
\`\`\`

### List installed packages

\`\`\`bash
apt list --installed
\`\`\`

> **Pro tip:** \`apt search\` searches names and descriptions. Pipe it to a filter when you only want exact matches: \`apt search something | grep -i exact\`.

### apt vs apt-get

- **apt-get** is the older, lower-level tool
- **apt** is a friendlier front end with niceties such as color and progress bars
- Both read from the same sources; pick **apt** for everyday use

### Key recap

- \`sudo apt update\` refreshes the package index from configured repositories
- \`sudo apt install package\` installs a package and its dependencies
- \`apt search package\` and \`apt show package\` help you discover and inspect software
- \`apt list --installed\` shows everything currently on your system`,
    },
    {
      name: "dnf",
      minutes: 8,
      intro: "Manage packages on Fedora and RHEL-family systems with dnf.",
      content: `## Dandified YUM

**dnf** is the package manager for Fedora, RHEL, and other Red Hat-family distributions. It replaces the older \`yum\` and installs \`.rpm\` packages.

### Update metadata

\`\`\`bash
sudo dnf check-update
\`\`\`

### Install a package

\`\`\`bash
sudo dnf install htop
\`\`\`

### Search

\`\`\`bash
dnf search htop
\`\`\`

### Show package info

\`\`\`bash
dnf info htop
\`\`\`

### Upgrade everything

\`\`\`bash
sudo dnf upgrade
\`\`\`

### List installed

\`\`\`bash
dnf list installed
\`\`\`

> **Key idea:** \`check-update\` only reports available updates, while \`upgrade\` actually applies them. Check first, then upgrade, to review what is changing.

### Transaction grouping

With \`dnf\` you can group changes and undo them as one unit. For example, group a set of installs:

\`\`\`bash
sudo dnf install -y tmux git curl
\`\`\`

The package manager resolves the whole dependency tree before touching the disk, so a partial failure should not leave the system half-updated.

### Key recap

- \`dnf\` is the modern package manager for Fedora and RHEL-family systems
- \`sudo dnf install pkg\` installs, \`sudo dnf upgrade\` updates everything
- \`dnf search\` and \`dnf info\` let you investigate packages before installing
- \`dnf\` resolves dependencies for the entire transaction up front`,
    },
    {
      name: "pacman",
      minutes: 8,
      intro: "Use Arch Linux's fast, minimalist package manager.",
      content: `## pacman

**pacman** is the package manager used by Arch Linux and its derivatives. It is fast, but it expects you to manage your own system and check updates regularly.

### Synchronize the repository database

\`\`\`bash
sudo pacman -Syu
\`\`\`

- \`-S\` means sync
- \`-y\` refreshes the package database
- \`-u\` upgrades all out-of-date packages

### Install a package

\`\`\`bash
sudo pacman -S htop
\`\`\`

### Search the remote repos

\`\`\`bash
pacman -Ss htop
\`\`\`

### Search installed packages

\`\`\`bash
pacman -Qs htop
\`\`\`

### Show package info

\`\`\`bash
pacman -Si htop
\`\`\`

### Remove a package and its config

\`\`\`bash
sudo pacman -Rns htop
\`\`\`

> **Warning:** Arch uses a rolling release model. If you do not update for a long time, some packages may conflict. Update regularly and read the Arch news before a big partial upgrade.

### Own a file lookup

To find which package owns a given file:

\`\`\`bash
pacman -Qo /usr/bin/htop
\`\`\`

### Key recap

- \`sudo pacman -Syu\` refreshes the database and upgrades the system
- \`sudo pacman -S pkg\` installs; \`sudo pacman -Rns pkg\` removes a package and its config
- \`-Ss\` searches remote repos while \`-Qs\` searches what is already installed
- Arch is rolling-release: update regularly and read news before big upgrades`,
    },
    {
      name: "Installing software",
      minutes: 10,
      intro: "Pick the right tool and the right privilege level for a clean install.",
      content: `## Installing software

Installing software on Linux is not one command but a family of approaches. Know which one fits your situation.

### Use your system package manager first

On Debian or Ubuntu install \`curl\` with apt:

\`\`\`bash
sudo apt install curl
\`\`\`

On Fedora and RHEL:

\`\`\`bash
sudo dnf install curl
\`\`\`

On Arch:

\`\`\`bash
sudo pacman -S curl
\`\`\`

> **Key idea:** The package manager handles dependencies, updates, and removal for you. Prefer it whenever the software is available there.

### Grabbing a downloaded binary

Some tools publish a tarball you unpack into your home directory:

\`\`\`bash
tar -xzf tool.tar.gz
./tool
\`\`\`

### Building from source

When software is not packaged, clone the repo and build with its build tooling:

\`\`\`bash
git clone https://example.com/repo.git
cd repo
make
sudo make install
\`\`\`

### Install a single user, no sudo

Tools installed with the flag \`--user\` land in your home directory, so no root access is needed:

\`\`\`bash
pip install --user requests
\`\`\`

### Verify the install

Confirm the binary is on your \`$PATH\` and report its version:

\`\`\`bash
which curl
curl --version
\`\`\`

> **Pro tip:** Binaries installed with \`sudo\` go into system locations such as \`/usr/bin\`. The \`--user\` pattern installs into \`$HOME/.local/bin\`, which you may need to add to your PATH.

### Key recap

- Start with the native package manager for the easiest handling of dependencies
- Unpack tarballs or build from source only when a package is unavailable
- Prefer user-scope installs (the \`--user\` pattern) to avoid needing root privileges
- Always verify with \`which\` and \`--version\` after installing`,
    },
    {
      name: "Updating packages",
      minutes: 6,
      intro: "Keep your system current and secure by upgrading packages safely.",
      content: `## Updating packages

Updates bring security fixes and new features, but a careless upgrade can cause downtime. Build a safe routine.

### Refresh and then upgrade

The two-step pattern separates finding changes from applying them. On Debian and Ubuntu:

\`\`\`bash
sudo apt update
sudo apt upgrade
\`\`\`

### Full upgrade that also changes installs and removals

\`\`\`bash
sudo apt full-upgrade
\`\`\`

### The Arch equivalent

\`\`\`bash
sudo pacman -Syu
\`\`\`

### See what would change without touching the disk

On Fedora:

\`\`\`bash
sudo dnf check-update
\`\`\`

### Reboot if the kernel changed

After a kernel upgrade, a reboot is usually required:

\`\`\`bash
uname -r
\`\`\`

Check that the running kernel matches the newest installed kernel before you worry.

> **Warning:** Do not upgrade a production server during peak hours. A kernel update can force a reboot and drop every service for a few minutes.

### Schedule updates

Many servers use a lockfile so only one update process runs:

\`\`\`bash
sudo apt-get install -y unattended-upgrades
\`\`\`

### Key recap

- Refresh the index first with \`update\`; then apply with \`upgrade\`
- \`full-upgrade\` and \`dist-upgrade\` handle package installs and removals too
- A kernel upgrade needs a reboot to take effect
- Prefer scheduled, tested updates over an ad hoc during production`,
    },
    {
      name: "Removing packages",
      minutes: 6,
      intro: "Cleanly remove software without leaving orphaned dependencies behind.",
      content: `## Removing packages

Leaving unused packages piled up wastes disk space and can slow updates. Remove them cleanly.

### Remove a package on Debian

\`\`\`bash
sudo apt remove htop
\`\`\`

### Remove the package and its configuration

Use \`purge\` when you also want the config files gone:

\`\`\`bash
sudo apt purge htop
\`\`\`

### Remove orphaned dependencies

\`apt-get autoremove\` clears dependencies that nothing needs anymore:

\`\`\`bash
sudo apt autoremove
\`\`\`

### On Fedora and RHEL

\`\`\`bash
sudo dnf remove htop
\`\`\`

### On Arch

\`\`\`bash
sudo pacman -Rns htop
\`\`\`

The \`-n\` removes configuration and data files owned by no other package.

> **Pro tip:** Do not \`purge\` or \`autoremove\` immediately after an install fails. The error output often points to the orphaned package you need exactly.

### Review what will be touched first

Run a dry run to see the change list before you commit:

\`\`\`bash
sudo apt autoremove --simulate
\`\`\`

### Key recap

- \`remove\` deletes the binary, \`purge\` also deletes configuration files
- \`autoremove\` cleans up dependencies nothing else uses anymore
- \`dnf remove\` and \`pacman -Rns\` are the equivalents on other families
- Simulate first with \`--simulate\` to review before you commit`,
    },
    {
      name: "Repositories",
      minutes: 8,
      intro: "Understand package repositories as the trusted sources of software.",
      content: `## Repositories

A repository is a remote collection of packages your system trusts. The package manager fetches from these to install and update software.

### Where the sources live

On Debian and Ubuntu the list of repositories lives here:

\`\`\`bash
cat /etc/apt/sources.list
\`\`\`

Additional entries can be dropped in as separate files in \`/etc/apt/sources.list.d/\`.

### Listing configured repos

On Fedora systems, list what repos are enabled:

\`\`\`bash
dnf repolist
\`\`\`

### Arch mirrors

Arch uses a list of mirrors rated for speed in \`/etc/pacman.conf\`:

\`\`\`bash
cat /etc/pacman.d/mirrorlist
\`\`\`

### Adding a third-party repo

Some vendors ask you to install their keys and add a new source:

\`\`\`bash
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
\`\`\`

> **Warning:** Only add repositories you trust. A repository is able to install arbitrary code with full \`sudo\` rights, so a bad source is a security risk.

### Keys and signedness

Packages are signed with keys. The package manager verifies these signatures so tampered packages are rejected.

\`\`\`bash
apt-key list
\`\`\`

> **Key idea:** Priority matters. Overriding official packages with a third-party rebuild forces unofficial binaries can break dependency guarantees.

### Key recap

- A repository is a curated remote source of packages
- Configured sources are stored in \`/etc/apt/sources.list\` and its \`.d\` directory
- Adding a repo means installing a key and running \`update\` first
- Only trust repos you have reason to, because they run with full root rights`,
    },
    {
      name: "Package cache",
      minutes: 6,
      intro: "Understand how downloaded packages are cached locally, and clean it up.",
      content: `## Package cache

When you install a package, the manager downloads it and usually keeps a local copy in a cache directory. Cached files speed up reinstalls and let you roll back, but they take space.

### Where the cache lives

On Debian and Ubuntu:

\`\`\`bash
du -sh /var/cache/apt/archives
\`\`\`

### Clean old cache automatically

\`\`\`bash
sudo apt autoclean
\`\`\`

\`autoclean\` removes cached packages that can no longer be downloaded anymore.

### Remove the whole cache

\`\`\`bash
sudo apt clean
\`\`\`

### On Fedora and RHEL

\`dnf\` keeps its downloaded packages in its cache too. Clean them with:

\`\`\`bash
sudo dnf clean
\`\`\`

\`\`\`bash
sudo dnf clean all
\`\`\`

### On Arch

The package cache lives in one tube under \`/var/cache/pacman/pkg\`:

\`\`\`bash
sudo pacman -Sc
\`\`\`

You can limit how many old versions are kept with:

\`\`\`bash
sudo pacman -cc
\`\`\`

> **Key idea:** Files cached are re-recorded so installing the same package again after a
temporary failure uses the local copy, which speeds up the install disk nearly.

### Key recap

- Package managers keep a local cache of downloaded \`.deb\`, \`.rpm\`, and \`.pkg\` files
- \`apt autoclean\` and \`apt clean\` free space on Debian-family systems
- \`dnf clean\` and \`pacman -cc\` do the equivalent on Fedora and Arch
- Keep enough cache to be useful but clean it when it grows out of hand`,
    },
  ],
};