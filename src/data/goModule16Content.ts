import type { Module } from "../types"

export const goModule16: Module = {
  id: 16,
  title: "Production Go: Deployment, Profiling & Best Practices",
  status: "upcoming",
  lessons: [
    {
      name: "Structuring a Production Application",
      minutes: 10,
      intro: "Separate config from code, log like a production system, and wire dependencies by hand.",
      content: `## Config doesn't belong in your code

Hard-coding a database URL or port number means every environment (dev, staging, prod) needs a different binary. Instead, load configuration from the environment at startup into a typed struct.

\`\`\`go
type Config struct {
	Port        int
	DatabaseURL string
	Debug       bool
}

func loadConfig() (Config, error) {
	port, err := strconv.Atoi(getEnv("PORT", "8080"))
	if err != nil {
		return Config{}, fmt.Errorf("invalid PORT: %w", err)
	}

	return Config{
		Port:        port,
		DatabaseURL: getEnv("DATABASE_URL", ""),
		Debug:       getEnv("DEBUG", "false") == "true",
	}, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
\`\`\`

One \`Config\` struct, built once at startup, passed down to whatever needs it — no scattered \`os.Getenv\` calls throughout the codebase.

### Flags for local overrides

The standard \`flag\` package complements environment variables nicely for local development:

\`\`\`go
var port = flag.Int("port", 8080, "port to listen on")

func main() {
	flag.Parse()
	fmt.Println("starting on port", *port)
}
\`\`\`

\`\`\`bash
go run main.go -port 9090
\`\`\`

### Structured logging with log/slog

\`fmt.Println\` debugging doesn't scale to production — you need logs that are searchable and machine-parseable. Go 1.21 added \`log/slog\` to the standard library for exactly this: structured, leveled logging.

\`\`\`go
import "log/slog"

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	slog.Info("server starting", "port", 8080, "env", "production")
	slog.Warn("cache miss", "key", "user:42")
	slog.Error("db query failed", "error", err, "query", "SELECT * FROM users")
}
\`\`\`

Output (one JSON object per line — trivial for log aggregators to parse):

\`\`\`json
{"time":"2026-08-18T10:00:00Z","level":"INFO","msg":"server starting","port":8080,"env":"production"}
\`\`\`

Compare that to \`fmt.Println("server starting on port", 8080)\` — readable to a human, but useless for querying "show me every error where query contains 'users'" in a log system.

| | fmt.Println | log/slog |
|---|---|---|
| Format | Free text | Structured key-value pairs |
| Levels | None | Debug/Info/Warn/Error |
| Machine-parseable | No | Yes (JSON handler) |
| Context per call | Manual string building | Attached as fields |

### Dependency injection: plain constructors, no framework

"Dependency injection" sounds like it needs a framework, but in Go it's usually just passing dependencies into a constructor function:

\`\`\`go
type UserService struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewUserService(db *sql.DB, logger *slog.Logger) *UserService {
	return &UserService{db: db, logger: logger}
}

func (s *UserService) GetUser(ctx context.Context, id int) (User, error) {
	s.logger.Info("fetching user", "id", id)
	// ... query db ...
}
\`\`\`

\`\`\`go
func main() {
	cfg, _ := loadConfig()
	db, _ := newDB(cfg.DatabaseURL)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	userService := NewUserService(db, logger)
	// pass userService into your HTTP handlers
}
\`\`\`

Everything is wired together explicitly in \`main\`, in plain Go — testable (pass in a fake \`*sql.DB\` or logger), readable (no reflection-based magic deciding what gets injected), and dependency-free.

> **Key idea:** Production-ready Go structure is mostly discipline, not tooling — load config into a typed struct once, log in structured key-value form with \`log/slog\`, and wire dependencies together with ordinary constructor functions instead of a DI framework.`,
    },
    {
      name: "Dockerizing a Go App",
      minutes: 9,
      intro: "Ship a Go service as a tiny, fast-starting container image.",
      content: `## Why Go containers can be tiny

Go compiles to a single **statically linked binary** — no runtime, no interpreter, no dependency tree to install inside the container. That means the final image can contain almost nothing but your binary.

### A naive (bloated) approach

\`\`\`dockerfile
FROM golang:1.22
WORKDIR /app
COPY . .
RUN go build -o server .
CMD ["./server"]
\`\`\`

This works, but ships the entire \`golang\` build image — compiler, standard library source, build cache — as your production container. That's often 800MB+ for a binary that might be 10MB.

### Multi-stage builds

A **multi-stage** Dockerfile uses one stage to compile, then copies only the finished binary into a minimal final image:

\`\`\`dockerfile
# ---- build stage ----
FROM golang:1.22 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# ---- final stage ----
FROM scratch
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
\`\`\`

### What each piece is doing

| Line | Purpose |
|------|---------|
| \`FROM golang:1.22 AS builder\` | Named build stage — has the full Go toolchain |
| \`COPY go.mod go.sum ./\` then \`RUN go mod download\` | Cache dependency downloads separately from source changes |
| \`CGO_ENABLED=0\` | Disables cgo, forcing a fully static binary with no C library dependency |
| \`FROM scratch\` | An empty base image — no shell, no OS, nothing |
| \`COPY --from=builder ...\` | Pulls only the compiled binary out of the build stage |

Copying \`go.mod\`/\`go.sum\` and running \`go mod download\` *before* copying the rest of the source means Docker's layer cache can skip re-downloading dependencies whenever only application code changes.

### scratch vs alpine

\`scratch\` produces the smallest possible image, but it has no shell, no CA certificates, and no way to \`docker exec\` in and poke around — fine for a pure API server, painful for debugging.

\`\`\`dockerfile
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
\`\`\`

| Base image | Size | Shell/debugging | CA certs (for outbound HTTPS) |
|---|---|---|---|
| \`scratch\` | Smallest (just your binary) | None | Must copy in manually |
| \`alpine\` | ~5-8MB extra | Yes (\`sh\`, \`apk\`) | One line to install |
| \`golang\` (single-stage) | 800MB+ | Full toolchain | Included |

### Why this matters in production

- **Fast pulls and cold starts** — a 15MB image pulls and starts in a fraction of the time an 800MB one does, which matters directly for autoscaling and rolling deploys
- **Smaller attack surface** — no shell, no package manager, no OS utilities an attacker could abuse if they got code execution
- **Reproducible builds** — the build stage is isolated from your host machine's Go version or installed packages

> **Key idea:** A multi-stage Dockerfile compiles with the full \`golang\` image but ships only the static binary in a \`scratch\` or \`alpine\` final image — turning Go's single-binary compilation model into dramatically smaller, faster, safer containers than most other languages can achieve.`,
    },
    {
      name: "Profiling and Performance",
      minutes: 11,
      intro: "Measure before you optimize — Go gives you the tools to see exactly where time and memory go.",
      content: `## Don't guess — profile

The single most common performance mistake is optimizing code that was never actually slow. Go's tooling makes it cheap to find out for certain before changing anything.

### net/http/pprof: live profiling

Importing \`net/http/pprof\` for its side effect registers profiling endpoints on your HTTP server:

\`\`\`go
import (
	"net/http"
	_ "net/http/pprof"
)

func main() {
	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	// ...your real application server...
}
\`\`\`

This exposes endpoints like \`/debug/pprof/profile\` (CPU) and \`/debug/pprof/heap\` (memory) on a separate internal port — never expose this port publicly, since it reveals internal details about your running process.

### go tool pprof

Point the \`pprof\` tool at a running server to capture and analyze a profile:

\`\`\`bash
# capture 30 seconds of CPU activity, then drop into an interactive prompt
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# capture current heap usage
go tool pprof http://localhost:6060/debug/pprof/heap
\`\`\`

Inside the interactive prompt, useful commands include:

\`\`\`text
(pprof) top       # highest-cost functions, sorted
(pprof) list Foo  # line-by-line cost inside function Foo
(pprof) web       # open a call graph in your browser (needs graphviz)
\`\`\`

### CPU profile vs memory profile

| Profile type | Answers | Common finding |
|---|---|---|
| CPU (\`profile\`) | Which functions burn the most CPU time | An unexpectedly hot loop, excessive JSON marshaling, regex recompiled per call |
| Heap (\`heap\`) | Where memory is currently allocated | A cache that never evicts, large slices held longer than needed |
| Goroutine (\`goroutine\`) | What every goroutine is doing right now | Leaked goroutines blocked forever on a channel |

### Benchmarking with go test -bench

For isolated, repeatable measurements (not tied to a live server), write a Go benchmark:

\`\`\`go
func BenchmarkConcat(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = strings.Join([]string{"a", "b", "c"}, "-")
	}
}
\`\`\`

\`\`\`bash
go test -bench=. -benchmem ./...
\`\`\`

\`\`\`text
BenchmarkConcat-8   50000000   23.4 ns/op   16 B/op   1 allocs/op
\`\`\`

\`go test\` runs \`BenchmarkConcat\` enough times (\`b.N\` iterations) to get a stable measurement, then reports time and allocations per operation.

### Comparing runs with benchstat

A single benchmark run is noisy. \`benchstat\` compares multiple runs (e.g., before and after a change) and tells you whether a difference is statistically meaningful:

\`\`\`bash
go test -bench=. -count=10 ./... > old.txt
# make your optimization
go test -bench=. -count=10 ./... > new.txt

benchstat old.txt new.txt
\`\`\`

\`\`\`text
name       old time/op    new time/op    delta
Concat-8     23.4ns ± 2%    14.1ns ± 1%   -39.7%  (p=0.000 n=10+10)
\`\`\`

### General performance advice

- **Measure first.** A hunch about what's slow is right surprisingly rarely
- **Profile in production-like conditions.** Micro-benchmarks in isolation can mislead you about real bottlenecks
- **Optimize the hot path only.** Speeding up code that runs once at startup rarely matters
- **Prefer clarity until a profile says otherwise.** Premature optimization trades away readability for a performance gain that may not even exist

> **Key idea:** \`net/http/pprof\` plus \`go tool pprof\` show you where a running program actually spends time and memory, and \`go test -bench\` plus \`benchstat\` turn "did that change help?" into a measured, statistically-grounded answer instead of a guess.`,
    },
    {
      name: "Go Idioms and What's Next",
      minutes: 8,
      intro: "A closing checklist of idiomatic Go, and where to go from here.",
      content: `## The idiomatic Go checklist

You've now covered the language, concurrency, HTTP servers, databases, generics, and production concerns. A few principles tie all of it together — the habits that separate Go code that merely compiles from Go code that reads like Go.

### Accept interfaces, return structs

\`\`\`go
// good: accepts the narrowest interface it needs
func SaveReport(w io.Writer, r Report) error {
	_, err := w.Write(r.Bytes())
	return err
}

// good: returns a concrete type, giving callers full access
func NewReport(title string) *Report {
	return &Report{Title: title}
}
\`\`\`

Accepting an interface (like \`io.Writer\`) lets callers pass a file, a buffer, an HTTP response, or a test double — whatever satisfies the method. Returning a concrete struct gives callers the full API to work with, rather than an artificially narrowed view.

### Handle errors immediately

\`\`\`go
data, err := os.ReadFile("config.json")
if err != nil {
	return fmt.Errorf("reading config: %w", err)
}
// use data, knowing err was nil here
\`\`\`

Go's \`if err != nil\` right after every fallible call looks repetitive next to exceptions, but it means every error is dealt with (or deliberately propagated) at the exact point it can occur — nothing is silently swallowed several stack frames away.

### Composition over inheritance

Go has no class hierarchies. Instead, structs embed other structs, and behavior is composed:

\`\`\`go
type Base struct {
	CreatedAt time.Time
}

type User struct {
	Base
	Name string
}
\`\`\`

\`user.CreatedAt\` works directly — \`User\` gets \`Base\`'s fields and methods through embedding, without an inheritance hierarchy or a \`super()\` call anywhere.

### gofmt everything, always

\`\`\`bash
gofmt -w .
# or
go fmt ./...
\`\`\`

Go famously has one blessed formatting style, applied automatically. This ends bikeshedding about brace placement or indentation in code review — every Go codebase in the world is formatted the same way.

### Keep interfaces small

\`\`\`go
// idiomatic: one method, does one thing
type Reader interface {
	Read(p []byte) (n int, err error)
}

// a red flag: interfaces with 15 methods are hard to implement and hard to fake in tests
\`\`\`

The standard library's own interfaces (\`io.Reader\`, \`io.Writer\`, \`sort.Interface\`) are famously tiny — one or two methods — which is exactly what makes them so widely implementable and so easy to mock in tests.

### Recap table

| Idiom | In short |
|---|---|
| Accept interfaces, return structs | Flexible inputs, full-featured outputs |
| Handle errors immediately | \`if err != nil\` right where it happens |
| Composition over inheritance | Embed structs instead of building class trees |
| gofmt everything | One style, no debate |
| Small interfaces | Easier to implement, easier to test against |

### Where to go from here

This course covered the language and standard library deeply — deliberately, since the standard library alone can carry you a long way in Go. From here, a few natural directions:

- **A web framework** — \`gin\` or \`echo\`, once you outgrow what \`net/http\` + \`ServeMux\` comfortably gives you, or want their ecosystem of middleware
- **gRPC** — for typed, high-performance service-to-service communication, especially in a microservices setup
- **Kubernetes operators** — Go is the dominant language for the Kubernetes ecosystem itself; writing controllers/operators is a natural next step if you're working in that world
- **Contributing to open source Go projects** — the standard library's own source is remarkably readable, and a great way to see these idioms applied at scale

> **Key idea:** Idiomatic Go isn't a long list of rules — it's a small set of habits (accept interfaces, handle errors where they occur, compose instead of inherit, format automatically, keep interfaces small) applied consistently. Master those, and every new package or framework you pick up next will read as an extension of what you already know rather than a new language to learn.`,
    },
  ],
}
