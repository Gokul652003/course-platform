import type { Module } from "../types"

export const module1: Module = {
  id: 1,
  title: "Linux Fundamentals",
  status: "complete",
  lessons: [
    {
      name: "What is an Operating System (OS)?",
      minutes: 8,
      intro:
        "Understand the piece of software every computer runs before a single command matters.",
      content: `## Think of this module as understanding how a computer actually works before learning commands.

### Imagine a computer without an OS

Your computer has:

- **CPU** — the brain, does the math
- **RAM** — fast, temporary memory
- **SSD** — slow, permanent storage
- **Keyboard / Mouse** — input devices
- **Monitor** — output device

These are **just hardware**. Without an operating system, the CPU has no idea how to:

- Display text on the screen
- Read a file from the SSD
- Understand keystrokes from the keyboard
- Connect to Wi-Fi

An operating system acts as the **manager between your programs and the hardware**.

\`\`\`
         Applications
        (Chrome, VS Code, Games)
               │
               ▼
         Operating System
               │
               ▼
      CPU  RAM  SSD  Keyboard
\`\`\`

### Responsibilities of an OS

- **Process management** — which program runs, for how long, on which core
- **Memory management** — allocating RAM fairly between programs
- **File management** — organizing data into files and directories
- **Device management** — talking to keyboards, disks, network cards
- **Security** — protecting one program from interfering with another
- **Networking** — pushing and pulling bytes across a network

### Examples

- Windows
- macOS
- Linux
- Android (uses the Linux kernel)

> **Key idea:** The OS is a middleman. Programs almost never touch the hardware directly — they ask the OS to do it for them.

### Quick recap

Without an OS, an application cannot read a file, show text, or use your keyboard. The OS is the manager that sits between software and hardware.`,
    },
    {
      name: "What is Unix?",
      minutes: 8,
      intro: "The 1969 Bell Labs project that gave Linux its core philosophy.",
      content: `### The origin

Unix was created in **1969 at Bell Labs**.

**Before Unix:** every computer had a different operating system, and programs written for one machine often couldn't run on another.

### Ideas Unix introduced that are still used today

- **Everything is a file** — devices, sockets, and processes are represented as files
- **Small programs that do one thing well** — each tool does a single job and does it well
- **Composable** — small tools can be connected together with pipes
- **Multiuser** — many users on one machine at once
- **Multitasking** — several programs run at (seemingly) the same time
- **Hierarchical file system** — directories nested inside directories

### Little tools that became famous

Commands like \`ls\`, \`cat\`, and \`grep\` originated on Unix and are still the backbone of every Linux terminal.

> **Why it matters:** When you understand "do one thing well + combine the pieces," you start seeing how \`ls | grep foo\` is the natural Unix way to work.

### Key recap

Unix contributed the philosophy: small tools, everything-is-a-file, and a hierarchical layout — the DNA that Linux inherits.`,
    },
    {
      name: "What is GNU?",
      minutes: 7,
      intro: "The free-software project that gave the Linux command line its soul.",
      content: `### The GNU Project

**GNU** began in **1983** with the goal of creating a **free Unix-like operating system** — software anyone could use, study, modify, and share.

### GNU developed many famous tools

- **Bash** — the most common shell
- **GCC** — the GNU C Compiler
- **GDB** — the GNU debugger
- **Coreutils** — \`ls\`, \`cp\`, \`mv\`, \`rm\`, \`cat\` and dozens more
- **glibc** — the GNU C standard library

### GNU + Linux = complete system

A Linux "distribution" isn't just the kernel:

\`\`\`
GNU Tools
    +
Linux Kernel
    =
  GNU/Linux
\`\`\`

**Linux (the kernel) would be nothing without GNU tools** — without them you would have a bare kernel and no way to interact with it.

### Popular GNU/Linux distributions

- Ubuntu
- Debian
- Fedora
- Arch Linux

> **Terminology note:** Technically, a full system is "GNU/Linux." In everyday speech people just say "Linux," but the distinction matters historically.

### Key recap

GNU contributes the tools (Bash, GCC, coreutils, glibc) that make the Linux kernel usable.`,
    },
    {
      name: "What is Linux?",
      minutes: 7,
      intro: "Linux is only the kernel — not the whole system.",
      content: `### The common misconception

Many people think Linux is a complete operating system.

Technically: **Linux is the kernel** — the core that manages hardware.

### The full picture

A complete operating system you actually use is a combination:

\`\`\`
GNU Tools
     +
Linux Kernel
     =
    GNU/Linux
\`\`\`

### Linux:

- handles the hardware
- schedules processes
- manages memory
- talks to disks and devices

But the graphical desktop, the commands, and the tools you use come from other projects.

### Distributions

Different distributions package the kernel **plus** tools, applications, and management software into a usable system.

**Examples:**

- Ubuntu
- Debian
- Fedora
- Arch Linux

> **Key idea:** When someone says "I use Linux," they usually mean a full distribution whose core is the Linux kernel.

### Key summary

- Linux = kernel (core)
- GNU tools = the software layer on top
- Distribution = the packaged, usable system
- "GNU/Linux" is the technically correct full name`,
    },
    {
      name: "Linux Architecture",
      minutes: 10,
      intro: "The layering that keeps your apps safe from your hardware.",
      content: `### The stack at a glance

\`\`\`
+----------------------------+
| Applications               |
| VS Code, Firefox, Docker   |
+----------------------------+
| Shell                      |
| Bash, Zsh                  |
+----------------------------+
| System Libraries           |
| glibc                      |
+----------------------------+
| Linux Kernel               |
+----------------------------+
| Hardware                   |
| CPU Ram SSD Keyboard NIC   |
+----------------------------+
\`\`\`

### Applications

Programs you use every day:

- Chrome
- VS Code
- Docker
- Git

**Applications cannot access hardware directly.** Every request is filtered through the kernel.

### Shell

The command interpreter — the layer where **you** type commands.

### System Libraries

Libraries provide reusable functionality, so every program doesn't have to re-invent how to talk to the kernel.

Consider a simple example:

\`\`\`c
printf("Hello");
\`\`\`

\`printf()\` comes from the **C standard library**. When the program needs to actually output text, the library code makes a **system call** into the kernel.

### Kernel

The core of Linux. It manages:

- **CPU scheduling** — which process runs and when
- **Memory** — how RAM is split
- **Files** — reading and writing disks
- **Devices** — disks, keyboards, networks
- **Networking** — moving data
- **Security** — permissions and isolation

**Only the kernel communicates directly with hardware**.

### Hardware

- CPU
- RAM
- SSD
- GPU
- Keyboard
- Mouse
- Network card

> **Safety idea:** Applications never touch hardware directly — they ask the kernel for everything. This isolation protects the whole system if one program crashes.

### Key recap

App → Shell → Libraries → Kernel → Hardware. As you go down, each layer is closer to the metal and has more privileged access.`,
    },
    {
      name: "The Kernel",
      minutes: 9,
      intro: "The always-on core that juggles memory, processes, and files.",
      content: `The kernel is **always running** while Linux is running. It performs a few core jobs.

### Memory Management

If Chrome needs more memory:

\`\`\`
Chrome
   │
   ▼
Kernel
   │
Allocates RAM
\`\`\`

Programs **cannot simply claim memory on their own** — they must ask the kernel.

### Process Management

When you run:

\`\`\`bash
firefox
\`\`\`

The kernel will:

1. **Create a process**
2. Assign it a **Process ID (PID)**
3. Schedule **CPU time** for it
4. Later, clean it up when it exits

### File Management

Running:

\`\`\`bash
cat file.txt
\`\`\`

\`\`\`
cat
 │
 ▼
Kernel
 │
 ▼
SSD
\`\`\`

The \`cat\` program asks the **kernel** to read the file from the SSD.

### Device Drivers

When you press the **A** key, the keyboard sends a signal to the **kernel**. The kernel passes that input to the appropriate application.

### Other duties

- CPU scheduling and priorities
- Networking
- Security and isolation

> **Key idea:** The kernel is the "boss" that all other software talks to. Everything in userspace goes through it.`,
    },
    {
      name: "Shell",
      minutes: 7,
      intro: "The command interpreter that reads what you type.",
      content: `### What it is

The **shell** is a **command interpreter**.

### Examples

- **Bash** (Bourne Again Shell — the default on most distros)
- **Zsh** (Z shell)
- **Fish**
- **Dash** (fast, script-oriented)

### What happens when you type

\`\`\`bash
ls
\`\`\`

The shell interprets your command and splits it into tokens. Then it decides what to do:

- Run a **built-in** command
- **Launch** an external program found on PATH
- Report a **"command not found"** error if it doesn't exist

### Under the hood

A shell session also does a lot of background work:

- Expands variables and shortcuts such as \`$HOME\`, \`~\`, and \`*\` wildcards
- Sets up pipes and redirections (\`|\`, \`>\`, \`<\`)
- Passes environment variables with \`export\` to child processes

> **Key idea:** You type; the shell is the translator that figures out *what* to run and *how* to run it.

### Tip

Pick one shell (usually Bash) and stick to it. Most Linux shells behave alike enough that you can stay productive anywhere.`,
    },
    {
      name: "Terminal",
      minutes: 7,
      intro: "The window you type in, and the shell running inside it — not the same thing.",
      content: `Many beginners mix these up.

### Terminal

The **terminal** is the program you interact with — the window where you type.

examples:

- GNOME Terminal
- Konsole
- Windows Terminal

It displays text and **sends your keystrokes to the shell**.

### Shell

The **shell** is the program **running inside** the terminal that interprets commands.

\`\`\`
You
 │
 ▼
Terminal
 │
 ▼
Bash
 │
 ▼
Kernel
\`\`\`

### A useful analogy

- **Terminal** = the restaurant counter where you talk.
- **Shell** = the kitchen behind it that turns your order into the actual work.

> **Key idea:** The terminal is the **interface**; the shell is the **engine**. One terminal can host one shell — or you can open many terminals, each running its own shell.

### Practice

\`\`\`bash
echo $SHELL
\`\`\`

This prints the path of the shell running inside your current terminal.`,
    },
    {
      name: "Built-in vs External Commands",
      minutes: 8,
      intro: "Whether Bash handles the command itself, or launches a separate program.",
      content: `### Built-in commands

Handled **directly by the shell** — no separate program is launched.

Examples:

- \`cd\`
- \`exit\`
- \`export\`
- \`alias\`
- \`history\`

### External commands

Separate **executable programs** in your filesystem.

Examples:

- \`ls\`
- \`cp\`
- \`mv\`
- \`grep\`
- \`find\`

### How Bash finds external commands

When you type:

\`\`\`bash
ls
\`\`\`

1. Bash checks for a matching **alias**
2. Then a **function** defined by the user
3. Then a **built-in** if one exists
4. Finally it **searches \`PATH\`** directories in order

Bash finds \`/usr/bin/ls\`, and asks the **kernel** to execute it.

\`\`\`
You type: ls
        │
        ▼
       Shell (Bash)
        │
        ├── Check alias
        ├── Check function
        ├── Check builtin
        └── Search PATH
                │
                ▼
            /usr/bin/ls
                │
                ▼
      Kernel loads the program
                │
                ▼
   ls requests directory contents
                │
                ▼
   Kernel reads the filesystem
                │
                ▼
    ls formats the output
                │
                ▼
   Terminal displays the result
\`\`\`

### Check which kind

\`\`\`bash
type cd
type ls
\`\`\`

\`type\` tells you whether a command is a shell builtin or an external binary.

> **Key idea:** Builtins are fast because Bash already knows them; external commands spawn a full process. If you wonder, \`type cmd\` will tell you the difference.`,
    },
    {
      name: "Environment Variables",
      minutes: 10,
      intro: "Name-value pairs that shape how programs and the shell behave.",
      content: `### What they are

Environment variables are **name-value pairs** that influence how programs behave.

### View a variable

\`\`\`bash
echo $HOME
\`\`\`

Example output:

\`\`\`
/home/gokul
\`\`\`

### Other common variables

\`\`\`bash
echo $USER
echo $PATH
echo $SHELL
echo $PWD
\`\`\`

### Why is PATH so important?

Suppose \`PATH\` contains:

\`\`\`
/usr/local/bin:/usr/bin:/bin
\`\`\`

When you type:

\`\`\`bash
ls
\`\`\`

Bash checks each directory **in order** until it finds the executable.

- /usr/local/bin/ls (not found)
- /usr/bin/ls (found — done!)

If \`PATH\` were empty, Bash wouldn't know where to look. You'd have to type the full path each time:

\`\`\`bash
/usr/bin/ls
\`\`\`

### Complete flow for ls

\`\`\`
You type: ls
        │
        ▼
Terminal
        │
        ▼
Shell (Bash)
        │
        ├── Check alias
        ├── Check function
        ├── Check builtin
        └── Search PATH
                │
                ▼
            /usr/bin/ls
                │
                ▼
      Kernel loads the program
                │
                ▼
   ls requests directory contents
                │
                ▼
   Kernel reads the filesystem
                │
                ▼
    ls formats the output
                │
                ▼
 Terminal displays the result
\`\`\`

### Set your own

\`\`\`bash
export MY_VAR="hello"
echo $MY_VAR
\`\`\`

> **Key idea:** PATH is why you can type \`ls\` anywhere. Understand PATH and you understand why your terminal finds programs automatically.`,
    },
  ],
}