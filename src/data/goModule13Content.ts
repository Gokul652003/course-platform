import type { Module } from "../types"

export const goModule13: Module = {
  id: 13,
  title: "Building HTTP Servers & REST APIs",
  status: "upcoming",
  lessons: [
    {
      name: "net/http Basics",
      minutes: 8,
      intro: "Stand up a working web server in Go with nothing but the standard library.",
      content: `## Go ships a real web server in the box

Most languages need a framework before you can serve a single HTTP request. Go's standard library, \`net/http\`, already gives you a production-capable server. No Express, no Flask — just \`import "net/http"\`.

### The two core pieces

- **\`http.HandleFunc(pattern, handler)\`** — registers a function to run when a request matches \`pattern\`
- **\`http.ListenAndServe(addr, handler)\`** — starts the server and blocks, listening on \`addr\`

### Your first server

\`\`\`go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})

	fmt.Println("listening on :8080")
	http.ListenAndServe(":8080", nil)
}
\`\`\`

Run it with \`go run main.go\`, then visit \`http://localhost:8080\` — or hit it from the terminal:

\`\`\`bash
curl http://localhost:8080
\`\`\`

### The handler signature

Every handler function has the exact same shape:

\`\`\`go
func(w http.ResponseWriter, r *http.Request)
\`\`\`

| Parameter | Type | Purpose |
|-----------|------|---------|
| \`w\` | \`http.ResponseWriter\` | Write the response — headers, status code, body |
| \`r\` | \`*http.Request\` | Read the request — method, URL, headers, body |

### Writing a response

\`http.ResponseWriter\` is an interface with a \`Write([]byte) (int, error)\` method, so anything that writes bytes works:

\`\`\`go
func handler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("plain bytes\\n"))
	fmt.Fprintf(w, "formatted: %d\\n", 42)
}
\`\`\`

If you don't call \`w.WriteHeader(status)\` explicitly, Go sends \`200 OK\` automatically the first time you write to \`w\`.

### Reading the request

\`*http.Request\` carries everything about the incoming call:

\`\`\`go
func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "method:", r.Method)
	fmt.Fprintln(w, "path:", r.URL.Path)
	fmt.Fprintln(w, "query:", r.URL.Query().Get("name"))
	fmt.Fprintln(w, "user-agent:", r.Header.Get("User-Agent"))
}
\`\`\`

Try \`curl "http://localhost:8080/greet?name=Gokul"\` and watch each field populate.

### Serving on nil vs a custom mux

Passing \`nil\` as the second argument to \`http.ListenAndServe\` tells Go to use \`http.DefaultServeMux\`, a global router that \`http.HandleFunc\` registers into behind the scenes. That's convenient for small programs, but for anything real you'll want your own mux — covered in the next lesson.

> **Key idea:** A Go HTTP server is just handler functions of the shape \`func(w http.ResponseWriter, r *http.Request)\`, registered against paths and served by \`http.ListenAndServe\`. There's no framework tax to pay before you write your first byte of business logic.`,
    },
    {
      name: "Routing with ServeMux",
      minutes: 10,
      intro: "Route requests by method and path — no third-party router required.",
      content: `## From one handler to many routes

Real APIs need more than a single \`/\` route. Go's \`http.ServeMux\` is a request router built into the standard library — and since Go 1.22 it's genuinely good enough for most projects.

### Creating your own mux

Instead of relying on the global default mux, create one explicitly:

\`\`\`go
func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", home)
	mux.HandleFunc("/about", about)

	http.ListenAndServe(":8080", mux)
}

func home(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "home page")
}

func about(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "about page")
}
\`\`\`

An explicit \`*http.ServeMux\` is easier to test and avoids surprises from other packages registering into the global mux.

### Go 1.22+: method and wildcard patterns

Before Go 1.22, \`ServeMux\` could only match paths, so every handler had to manually check \`r.Method\`. Go 1.22 added **method prefixes** and **path wildcards** directly to the pattern string:

\`\`\`go
mux := http.NewServeMux()

mux.HandleFunc("GET /users", listUsers)
mux.HandleFunc("GET /users/{id}", getUser)
mux.HandleFunc("POST /users", createUser)
mux.HandleFunc("PUT /users/{id}", updateUser)
mux.HandleFunc("DELETE /users/{id}", deleteUser)
\`\`\`

Each pattern is \`"METHOD /path"\`. A request that matches the path but not the method gets an automatic \`405 Method Not Allowed\`.

### Reading wildcard values

Inside a handler, pull the \`{id}\` segment out with \`r.PathValue\`:

\`\`\`go
func getUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	fmt.Fprintf(w, "fetching user %s\\n", id)
}
\`\`\`

Wildcards can appear anywhere in the pattern, including multiple times:

\`\`\`go
mux.HandleFunc("GET /teams/{teamID}/members/{memberID}", getMember)
\`\`\`

### Pattern specificity

\`ServeMux\` picks the **most specific** matching pattern, not the first one registered:

\`\`\`go
mux.HandleFunc("GET /users/{id}", getUser)
mux.HandleFunc("GET /users/me", currentUser)   // wins for /users/me
\`\`\`

A trailing \`{$}\` anchors a pattern to match only the exact path, useful for \`"/{$}"\` when you don't want \`/\` to also match every unmatched subpath.

### When to reach for a third-party router

| Situation | Standard library \`ServeMux\` | chi / gorilla/mux |
|-----------|------------------------------|--------------------|
| Go 1.22+, simple REST routes | Plenty | Overkill |
| Need regex constraints on segments | Not supported | Supported |
| Nested route groups, rich middleware chaining | Manual | Built-in helpers |
| Targeting Go < 1.22 | No method/wildcard syntax | Fully supported |

For most new projects on a modern Go version, the standard library is enough — pull in \`chi\` or \`gorilla/mux\` only when you actually hit a limitation.

> **Key idea:** Since Go 1.22, \`"METHOD /path/{param}"\` patterns plus \`r.PathValue("param")\` give you real REST routing from the standard library alone — reach for a third-party router only when you outgrow it.`,
    },
    {
      name: "Building a JSON REST API",
      minutes: 12,
      intro: "Decode JSON in, encode JSON out, and return the right status codes.",
      content: `## JSON in, JSON out

A REST API mostly does one thing over and over: turn incoming JSON into Go values, do something with them, and turn Go values back into outgoing JSON. The \`encoding/json\` package handles both directions.

### The shape of a resource

\`\`\`go
type Task struct {
	ID     int    \`json:"id"\`
	Title  string \`json:"title"\`
	Done   bool   \`json:"done"\`
}
\`\`\`

Struct tags like \`json:"title"\` tell the encoder/decoder what field name to use in JSON — without them, Go would default to the exported Go field name (\`Title\`).

### Decoding a request body

\`\`\`go
func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}

	t.ID = nextID()
	tasks[t.ID] = t

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}
\`\`\`

\`json.NewDecoder(r.Body).Decode(&t)\` streams the request body straight into \`t\` — no need to read it into a \`[]byte\` first.

### Encoding a response

Two common ways to write JSON out:

\`\`\`go
// stream directly to the response writer
json.NewEncoder(w).Encode(t)

// or build bytes first (useful if you need to inspect them)
data, err := json.Marshal(t)
if err != nil {
	http.Error(w, "encoding failed", http.StatusInternalServerError)
	return
}
w.Write(data)
\`\`\`

Always set the \`Content-Type\` header so clients know to parse the body as JSON:

\`\`\`go
w.Header().Set("Content-Type", "application/json")
\`\`\`

**Order matters:** set headers and call \`w.WriteHeader\` *before* you write the body — once bytes are written, headers are already flushed.

### Choosing status codes

| Situation | Status |
|-----------|--------|
| Resource created | \`http.StatusCreated\` (201) |
| Successful GET/PUT with a body | \`http.StatusOK\` (200) |
| Successful DELETE, no body | \`http.StatusNoContent\` (204) |
| Bad request body / validation failure | \`http.StatusBadRequest\` (400) |
| Resource doesn't exist | \`http.StatusNotFound\` (404) |
| Server-side failure | \`http.StatusInternalServerError\` (500) |

### A small CRUD-ish handler

\`\`\`go
var (
	tasks  = map[int]Task{}
	nextID = func() func() int {
		id := 0
		return func() int { id++; return id }
	}()
)

func getTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	t, ok := tasks[id]
	if !ok {
		http.Error(w, "task not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /tasks", createTask)
	mux.HandleFunc("GET /tasks/{id}", getTask)
	http.ListenAndServe(":8080", mux)
}
\`\`\`

\`http.Error\` is a small helper that sets the status code, sets \`Content-Type: text/plain\`, and writes the message — handy for error paths where you don't need a JSON body.

> **Key idea:** \`json.NewDecoder(r.Body).Decode(&v)\` and \`json.NewEncoder(w).Encode(v)\` are the two workhorses of a JSON API — pair them with an accurate status code and a \`Content-Type\` header, and you've covered 90% of REST handler bodies.`,
    },
    {
      name: "Middleware and Graceful Shutdown",
      minutes: 11,
      intro: "Wrap handlers with cross-cutting behavior, then shut the server down cleanly.",
      content: `## Middleware: functions that wrap handlers

Logging, auth checks, and recovering from panics all need to run around *every* request. Go doesn't need a special middleware system for this — an \`http.Handler\` is just an interface, so middleware is simply a function that takes a handler and returns a new one.

### The pattern

\`\`\`go
type Middleware func(http.Handler) http.Handler

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s (%v)", r.Method, r.URL.Path, time.Since(start))
	})
}
\`\`\`

\`http.HandlerFunc\` is an adapter: it turns an ordinary function with the right signature into something satisfying the \`http.Handler\` interface (which just requires a \`ServeHTTP(w, r)\` method).

### Applying one middleware

\`\`\`go
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", getUser)

wrapped := logging(mux)
http.ListenAndServe(":8080", wrapped)
\`\`\`

Every request now flows through \`logging\` before reaching the mux.

### Chaining several middleware

Wrap once per concern, from the inside out:

\`\`\`go
func recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("panic: %v", err)
				http.Error(w, "internal error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func chain(h http.Handler, mws ...Middleware) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

handler := chain(mux, recoverPanic, logging)
http.ListenAndServe(":8080", handler)
\`\`\`

Reading top to bottom, a request hits \`recoverPanic\` first, then \`logging\`, then the mux — because \`chain\` wraps from the last middleware inward.

### Graceful shutdown

Killing a server mid-request drops in-flight work. \`http.Server\` has a \`Shutdown(ctx)\` method that stops accepting new connections and waits for active ones to finish.

\`\`\`go
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ok")
	})

	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()
	log.Println("listening on :8080")

	<-ctx.Done()
	log.Println("shutting down...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("shutdown complete")
}
\`\`\`

### What's happening, step by step

1. \`signal.NotifyContext\` returns a context that's cancelled the moment \`Ctrl+C\` (SIGINT) or \`SIGTERM\` arrives
2. The server runs in a goroutine so \`main\` can keep watching for that signal
3. \`<-ctx.Done()\` blocks until the signal fires
4. \`srv.Shutdown(shutdownCtx)\` stops taking new connections and gives existing ones up to 5 seconds to finish
5. If shutdown doesn't finish in time, the context deadline forces it

> **Key idea:** Middleware is just \`func(http.Handler) http.Handler\` — no framework magic. Combine it with \`signal.NotifyContext\` and \`srv.Shutdown(ctx)\` so deploys and restarts don't cut requests off mid-flight.`,
    },
  ],
}
