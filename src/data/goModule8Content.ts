import type { Module } from "../types"

export const goModule8: Module = {
  id: 8,
  title: "Packages, Modules & Project Structure",
  status: "upcoming",
  lessons: [
    {
      name: "Packages and Imports",
      minutes: 9,
      intro: "One directory, one package — and capitalization decides what the outside world can see.",
      content: `## Every directory is a package

In Go, source files are grouped into **packages**, and by convention every file in a directory belongs to the same package. The very first line of every \`.go\` file declares which one:

\`\`\`go
package main
\`\`\`

\`\`\`go
package geometry
\`\`\`

A program's entry point always lives in \`package main\`, with a \`func main()\` inside it. Every other package is a **library package** — meant to be imported, not run directly.

### Capitalization controls visibility

Go has no \`public\`/\`private\`/\`protected\` keywords. Instead, visibility is determined entirely by the **first letter** of an identifier's name:

- **Capitalized** (\`Area\`, \`Circle\`, \`MaxRetries\`) → **exported** — visible to other packages that import this one
- **lowercase** (\`radius\`, \`parseInput\`, \`defaultTimeout\`) → **unexported** — visible only inside this package

\`\`\`go
package geometry

// Exported — other packages can use this.
type Circle struct {
    Radius float64
}

// Exported method.
func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

// Unexported — only code inside package geometry can call this.
func validateRadius(r float64) bool {
    return r > 0
}
\`\`\`

This applies to everything: types, functions, struct fields, constants, variables. Even individual struct fields can be exported or not, independently of the struct itself:

\`\`\`go
type Config struct {
    Name     string // exported field
    apiToken string // unexported field — hidden from other packages
}
\`\`\`

### Import paths

To use another package, you \`import\` it by its full import path — usually the module path plus the subdirectory:

\`\`\`go
import (
    "fmt"
    "strings"

    "example.com/myapp/geometry"
)
\`\`\`

\`fmt\` and \`strings\` are standard library packages; \`example.com/myapp/geometry\` is a package inside your own module. Using an imported package's exported identifiers requires qualifying with the package name:

\`\`\`go
c := geometry.Circle{Radius: 2}
fmt.Println(c.Area())
\`\`\`

### Aliasing imports

If two imported packages share a name, or you just want a shorter/clearer local name, you can alias an import:

\`\`\`go
import (
    mrand "math/rand"
    crand "crypto/rand"
)
\`\`\`

Now \`mrand.Intn(100)\` and \`crand.Read(buf)\` refer unambiguously to each package.

### The blank identifier import — side effects only

Sometimes a package needs to be imported purely for its **initialization side effects** (registering a database driver, a codec, an HTTP handler) even though you never reference it by name in your code. Prefixing the import with \`_\` allows this without triggering an "imported and not used" compile error:

\`\`\`go
import (
    "database/sql"

    _ "github.com/lib/pq" // registers the "postgres" driver via its init()
)

func main() {
    db, _ := sql.Open("postgres", "connection-string")
    _ = db
}
\`\`\`

The underscore tells the compiler: "I know I'm not using this package's identifiers directly — import it anyway, just for its \`init()\` function."

### Quick reference

| Symbol | Meaning |
|---|---|
| \`Name\` (capitalized) | Exported — visible outside the package |
| \`name\` (lowercase) | Unexported — package-private |
| \`import "pkg"\` | Normal import, used via \`pkg.Identifier\` |
| \`import alias "pkg"\` | Import under a custom local name |
| \`import _ "pkg"\` | Import purely for side effects, no name binding |

> **Key idea:** A package is a directory of \`.go\` files sharing one \`package\` declaration, and visibility across package boundaries is decided entirely by capitalization — no extra keywords required.`,
    },
    {
      name: "Go Modules",
      minutes: 10,
      intro: "go.mod is your project's identity and dependency manifest, all in one small file.",
      content: `## What a module is

A **module** is a collection of Go packages that are versioned and released together, rooted at a directory containing a \`go.mod\` file. Nearly every Go project today is organized as a single module.

### go mod init

You create a module by running \`go mod init\` with the module's path — typically a repository URL:

\`\`\`bash
go mod init github.com/yourname/myapp
\`\`\`

This generates a minimal \`go.mod\`:

\`\`\`
module github.com/yourname/myapp

go 1.22
\`\`\`

- \`module\` declares the module's import path — every package inside is imported as \`github.com/yourname/myapp/<subdir>\`
- \`go 1.22\` records the minimum Go version the module requires

### go.mod grows as you add dependencies

As soon as you import and use a third-party package, \`go.mod\` records it under a \`require\` block:

\`\`\`
module github.com/yourname/myapp

go 1.22

require (
    github.com/google/uuid v1.6.0
    github.com/stretchr/testify v1.9.0
)
\`\`\`

### go.sum — the integrity ledger

Alongside \`go.mod\`, Go maintains \`go.sum\`, which records **cryptographic checksums** for every dependency (and every dependency of a dependency) it has ever downloaded for this module. It's not something you edit by hand — Go writes and verifies it automatically — but it should always be committed alongside \`go.mod\`. It guarantees that a rebuild pulls in the *exact same bytes* every time, protecting you against tampered or corrupted downloads.

### go get — adding and updating dependencies

\`\`\`bash
go get github.com/google/uuid@v1.6.0   # add or set an exact version
go get github.com/google/uuid@latest   # update to the latest version
go get github.com/google/uuid          # same as @latest in most cases
\`\`\`

\`go get\` updates both \`go.mod\` and \`go.sum\` to reflect the change.

### Semantic versioning basics

Go dependencies follow **semantic versioning**: \`vMAJOR.MINOR.PATCH\`.

| Segment | Bumped when | Example |
|---|---|---|
| MAJOR | Breaking, incompatible API changes | \`v1.x.x\` → \`v2.0.0\` |
| MINOR | New, backward-compatible functionality | \`v1.2.x\` → \`v1.3.0\` |
| PATCH | Backward-compatible bug fixes only | \`v1.2.3\` → \`v1.2.4\` |

A notable Go-specific rule: a major version bump of **v2 or higher** must also change the *import path* itself (e.g. appending \`/v2\`), because Go treats different major versions as genuinely different packages that can even be imported side by side.

### go mod tidy — keeping go.mod accurate

As code evolves, some imports get added and others removed, but \`go.mod\` doesn't update itself. \`go mod tidy\` reconciles it with what your code actually imports:

\`\`\`bash
go mod tidy
\`\`\`

It adds any missing \`require\` entries for packages you're now importing, and removes entries for packages you no longer use anywhere. Running it regularly — and especially before committing — keeps \`go.mod\`/\`go.sum\` honest.

### The module cache

Downloaded dependencies aren't stored per-project. They live once in a shared, global **module cache** (by default under \`$GOPATH/pkg/mod\`, or \`~/go/pkg/mod\`), keyed by module path and exact version. Every project on your machine that needs \`github.com/google/uuid v1.6.0\` reads from the same cached copy — nothing is re-downloaded once it's been fetched anywhere.

\`\`\`bash
go clean -modcache  # wipe the entire shared module cache, if needed
\`\`\`

> **Key idea:** \`go.mod\` names your module and pins its dependencies; \`go.sum\` guarantees their integrity byte-for-byte. Run \`go mod tidy\` regularly so both files always reflect exactly what your code actually imports.`,
    },
    {
      name: "Project Layout Conventions",
      minutes: 8,
      intro: "Go has no enforced project structure — start flat, and only add folders when they earn their keep.",
      content: `## There's no single official layout

Unlike some frameworks that dictate an exact folder structure, Go itself imposes almost no rules about how you organize files beyond "one package per directory." What exists instead is an **informal, community-adopted convention** that most sizable Go projects converge on, loosely known as the "standard Go project layout."

### Start flat

For a small project — a script, a small CLI tool, a service with a handful of files — just put everything in the module's root directory:

\`\`\`
myapp/
├── go.mod
├── main.go
├── handlers.go
└── db.go
\`\`\`

There is nothing unidiomatic about this. Plenty of real, production Go tools never grow beyond a flat layout, and adding structure prematurely just adds navigation overhead for no benefit.

### cmd/ — multiple entry points

Once a module needs more than one runnable program (say, a server and a separate migration tool), each entry point gets its own subdirectory under \`cmd/\`, each containing a \`package main\`:

\`\`\`
myapp/
├── go.mod
├── cmd/
│   ├── server/
│   │   └── main.go      // package main — the web server
│   └── migrate/
│       └── main.go      // package main — a CLI migration tool
\`\`\`

Each is built independently: \`go build ./cmd/server\` or \`go build ./cmd/migrate\`.

### internal/ — compiler-enforced private packages

\`internal/\` is special: it's the **one** directory name Go's compiler itself treats as an access-control boundary, not just a convention. Any package under a path containing \`internal/\` can only be imported by code that lives inside the directory tree **rooted at the parent of that \`internal\`** — never by an outside module.

\`\`\`
myapp/
├── go.mod
├── internal/
│   ├── auth/
│   │   └── auth.go       // importable only from within myapp/...
│   └── billing/
│       └── billing.go
\`\`\`

Code in \`myapp/cmd/server\` can import \`myapp/internal/auth\` freely. A completely different module that imports \`myapp\` as a dependency **cannot** import \`myapp/internal/auth\` — the compiler rejects it. This is how Go lets a module expose a small public API while keeping the bulk of its implementation genuinely private, enforced by the toolchain rather than just a naming convention.

### pkg/ — shared library code (used more sparingly today)

Some projects use \`pkg/\` for code that's meant to be genuinely reusable, including by other modules:

\`\`\`
myapp/
├── go.mod
├── pkg/
│   └── ratelimit/
│       └── ratelimit.go   // intended for external use too
├── internal/
│   └── ...
└── cmd/
    └── ...
\`\`\`

\`pkg/\` has become somewhat controversial in the Go community — plenty of experienced Go developers consider it unnecessary ceremony, since *any* package outside \`internal/\` is already importable by others. Treat it as optional: reach for it only if your team finds the explicit "this is public API surface" signal genuinely useful, not as a mandatory folder every project needs.

### Putting it together — a typical mid-sized layout

\`\`\`
myapp/
├── go.mod
├── go.sum
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── auth/
│   ├── billing/
│   └── storage/
└── README.md
\`\`\`

### The core guidance

| Project size | Recommended layout |
|---|---|
| Small script or single-purpose CLI | Flat — everything in the root |
| One binary, growing codebase | Root \`main.go\` plus a few internal packages as needed |
| Multiple binaries sharing code | \`cmd/\` for entry points, \`internal/\` for shared private logic |
| A library meant for external consumption | Public API in the root or a clearly named package, private helpers under \`internal/\` |

> **Key idea:** Go doesn't force a folder structure on you — \`internal/\` is the only convention with real compiler teeth. Start flat, and reach for \`cmd/\`, \`internal/\`, or \`pkg/\` only once your project's actual shape demands them, not upfront out of habit.`,
    },
    {
      name: "Documentation and Tooling",
      minutes: 9,
      intro: "gofmt ends style debates, go vet catches suspicious code, and doc comments write your docs for you.",
      content: `## Doc comments — documentation lives next to the code

Go documentation is written as an ordinary comment placed **immediately above** the declaration it documents, with no blank line in between. By convention, the comment starts with the identifier's own name:

\`\`\`go
// Circle represents a circle defined by its radius.
type Circle struct {
    Radius float64
}

// Area returns the area of the circle.
func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

// NewCircle constructs a Circle with the given radius.
// It panics if radius is negative.
func NewCircle(radius float64) Circle {
    if radius < 0 {
        panic("radius must not be negative")
    }
    return Circle{Radius: radius}
}
\`\`\`

Because the comment sits right above the declaration and starts with its name, tooling can extract it automatically — there's no separate documentation format to learn, no annotations to memorize.

### go doc — reading documentation from the terminal

\`go doc\` renders these comments straight from source, without needing a running server or generated HTML:

\`\`\`bash
go doc fmt.Println        # docs for one function
go doc strings.Builder     # docs for a type
go doc ./geometry          # docs for an entire local package
\`\`\`

The same mechanism powers pkg.go.dev, the public site that hosts documentation for every published Go module — it's generated entirely from these ordinary source comments.

### gofmt / go fmt — one canonical formatting, no debates

\`gofmt\` is a formatter bundled with the Go toolchain that rewrites source files into Go's single canonical style — indentation, spacing, brace placement, import grouping, all of it.

\`\`\`bash
gofmt -l .        # list files that aren't correctly formatted
gofmt -w .        # rewrite files in place to the canonical format

go fmt ./...      # equivalent convenience wrapper, module-aware
\`\`\`

Because \`gofmt\`'s output is fully deterministic — there are no configuration options for brace style, indent width, or where to put spaces — Go famously has **no style-guide debates** the way many other language communities do. There is exactly one correct formatting, the tool produces it automatically, and virtually every Go codebase in existence looks the same at the formatting level. Most editors run \`gofmt\` automatically on save.

### go vet — catching suspicious, likely-wrong code

\`go vet\` examines your code for constructs that compile fine but are almost certainly bugs — mistakes the compiler's type checker doesn't catch because they're not type errors, just highly suspicious patterns.

\`\`\`bash
go vet ./...
\`\`\`

Typical things \`go vet\` flags:

- A \`fmt.Printf\`-style call whose format verbs don't match its arguments (\`fmt.Printf("%d", "a string")\`)
- A struct copied by value even though it contains a \`sync.Mutex\` (copying a mutex breaks its locking guarantees)
- An \`if\` or loop condition that can never be true
- Unreachable code after a \`return\`

\`go vet\` runs automatically as part of \`go test\`, so many of these get caught even without invoking it directly.

### golangci-lint — going further

For anything beyond what \`go vet\` covers — unused variables, overly complex functions, inconsistent naming, security-sensitive patterns — the community standard tool is **golangci-lint**, a fast runner that bundles dozens of individual linters (including \`go vet\` itself) behind one configurable command:

\`\`\`bash
golangci-lint run ./...
\`\`\`

It's not part of the standard Go toolchain — it's installed separately — but it's close to universal in real-world Go projects and CI pipelines, configured through a \`.golangci.yml\` file at the repository root.

### Quick reference

| Tool | Purpose |
|---|---|
| Doc comments | Documentation written directly above declarations, starting with the identifier's name |
| \`go doc\` | Read those comments from the terminal, no build step needed |
| \`gofmt\` / \`go fmt\` | Enforce the one canonical formatting — ends style debates |
| \`go vet\` | Catch suspicious, likely-buggy code the type checker misses |
| \`golangci-lint\` | Community-standard bundle of many additional linters |

> **Key idea:** Go treats documentation and formatting as solved problems, not matters of taste — write a comment above the declaration and \`gofmt\` handles the rest. Run \`go vet\` (and ideally \`golangci-lint\`) regularly to catch the bugs that compile cleanly but are almost certainly wrong.`,
    },
  ],
}
