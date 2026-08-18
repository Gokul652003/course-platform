import type { Module } from "../types"

export const goModule10: Module = {
  id: 10,
  title: "Concurrency Patterns",
  status: "upcoming",
  lessons: [
    {
      name: "Mutexes and the sync Package",
      minutes: 10,
      intro: "When goroutines share memory, a mutex is what stops them from tearing it apart.",
      content: `### The problem: a race condition

When two or more goroutines read and write the same variable without coordination, and at least one of them writes, you have a **race condition**. The classic example is an unprotected counter:

\`\`\`go
package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter++ // NOT safe: read-modify-write, not atomic
		}()
	}

	wg.Wait()
	fmt.Println(counter) // almost never prints 1000
}
\`\`\`

\`counter++\` looks like one operation, but it's really three: read the value, add one, write it back. When two goroutines interleave those three steps, one increment can get silently lost. Run this program a few times and you'll get a different (wrong) number each time.

### sync.Mutex: mutual exclusion

A \`sync.Mutex\` guarantees only one goroutine can hold the lock at a time. Wrap the critical section between \`Lock\` and \`Unlock\`:

\`\`\`go
package main

import (
	"fmt"
	"sync"
)

func main() {
	counter := 0
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			defer mu.Unlock()
			counter++ // safe: only one goroutine here at a time
		}()
	}

	wg.Wait()
	fmt.Println(counter) // always 1000
}
\`\`\`

\`defer mu.Unlock()\` right after \`mu.Lock()\` is the idiomatic pattern — it guarantees the lock is released even if the function returns early or panics, and it keeps the lock/unlock pairing visually obvious.

### sync.RWMutex: many readers, one writer

If your data is read far more often than it's written, \`sync.RWMutex\` lets multiple readers hold the lock simultaneously, while a writer still gets exclusive access:

\`\`\`go
var mu sync.RWMutex
data := map[string]int{"a": 1}

// many goroutines can do this at once:
mu.RLock()
v := data["a"]
mu.RUnlock()

// but a write excludes everyone else:
mu.Lock()
data["b"] = 2
mu.Unlock()
\`\`\`

| | \`sync.Mutex\` | \`sync.RWMutex\` |
|---|---|---|
| Readers at once | 1 | many, via \`RLock\`/\`RUnlock\` |
| Writers at once | 1, via \`Lock\`/\`Unlock\` | 1, via \`Lock\`/\`Unlock\` (blocks readers too) |
| Best for | balanced or write-heavy access | read-heavy access |

### sync.Once: run something exactly one time

\`sync.Once\` guarantees a function runs exactly once, no matter how many goroutines call it or how many times:

\`\`\`go
var once sync.Once
var config map[string]string

func loadConfig() {
	once.Do(func() {
		fmt.Println("loading config...")
		config = map[string]string{"env": "prod"}
	})
}

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			loadConfig() // "loading config..." prints only once, ever
		}()
	}
	wg.Wait()
}
\`\`\`

This is the standard, thread-safe way to do lazy one-time initialization — building a singleton, opening a shared resource, parsing a config file once no matter how many goroutines ask for it concurrently.

> **Key idea:** if goroutines never touch shared memory, you never need a lock — that's why channels are often preferred. But when they must share memory, \`sync.Mutex\` protects a critical section, \`sync.RWMutex\` optimizes for read-heavy access, and \`sync.Once\` protects one-time setup. Always pair \`Lock\` with a \`defer Unlock\`.`,
    },
    {
      name: "Worker Pools",
      minutes: 10,
      intro: "A fixed number of workers pulling from a jobs channel bounds how much work runs at once.",
      content: `### Why bound concurrency?

Launching a goroutine per unit of work is cheap, but "cheap" isn't "free." If you have a million jobs and spin up a million goroutines, you can still exhaust memory, overwhelm a downstream API, or flood a database with connections. A **worker pool** fixes the number of concurrent workers while still processing an unbounded stream of jobs.

### The shape of a worker pool

Three pieces: a \`jobs\` channel work flows in on, a fixed number of worker goroutines that read from \`jobs\` and do the work, and a \`results\` channel they write their output to.

\`\`\`go
package main

import "fmt"

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs { // keeps pulling until jobs is closed and drained
		results <- j * j
	}
}

func main() {
	const numJobs = 9
	const numWorkers = 3

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)

	// start a fixed pool of workers
	for w := 1; w <= numWorkers; w++ {
		go worker(w, jobs, results)
	}

	// send all the work
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs) // no more jobs coming — workers' range loops will end

	// collect all the results
	sum := 0
	for a := 1; a <= numJobs; a++ {
		sum += <-results
	}
	fmt.Println("sum of squares:", sum)
}
\`\`\`

Only 3 workers ever run at once, no matter how many jobs are queued up. Each worker's \`for j := range jobs\` loop naturally exits once \`jobs\` is closed and empty, so there's no explicit shutdown signal needed here.

### Why the channel directions matter

Notice \`worker\`'s signature: \`jobs <-chan int\` (receive-only) and \`results chan<- int\` (send-only). These directional types are optional but valuable documentation and safety — the compiler will refuse to let \`worker\` accidentally send on \`jobs\` or receive from \`results\`.

\`\`\`go
func worker(id int, jobs <-chan int, results chan<- int) {
	// jobs <- 5        // compile error: jobs is receive-only here
	// v := <-results   // compile error: results is send-only here
}
\`\`\`

### Sizing the pool

| Workload type | Pool size guideline |
|---|---|
| CPU-bound (heavy computation) | around \`runtime.NumCPU()\` |
| I/O-bound (network calls, disk) | often much higher than CPU count — workers spend most of their time blocked waiting |
| Rate-limited external API | sized to match the API's concurrency limit, not your hardware |

There's no single right number — it depends on what the workers are actually waiting on. Benchmark with realistic load rather than guessing.

> **Key idea:** a worker pool decouples "how much work exists" from "how much work runs at once." Feed unbounded work into a \`jobs\` channel, keep a fixed, deliberately-sized set of goroutines pulling from it, and \`close(jobs)\` when there's no more work so the workers' \`range\` loops can exit cleanly.`,
    },
    {
      name: "The context Package",
      minutes: 10,
      intro: "context.Context carries cancellation, deadlines, and request-scoped values across API boundaries.",
      content: `### Why context exists

Real programs chain calls across goroutines, network requests, and API boundaries — an HTTP handler calls a database query which calls a downstream service. If the original request is cancelled or times out, every one of those in-flight calls should stop too, instead of wasting work on an answer nobody wants anymore. \`context.Context\` is the standard way to propagate that cancellation signal.

### context.WithCancel

\`context.WithCancel\` returns a derived context and a \`cancel\` function. Calling \`cancel\` closes the context's \`Done()\` channel, signalling every goroutine holding that context to stop:

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("worker: stopping,", ctx.Err())
			return
		default:
			// do a small unit of work
			time.Sleep(50 * time.Millisecond)
		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())

	go worker(ctx)

	time.Sleep(200 * time.Millisecond)
	cancel() // tells the worker to stop
	time.Sleep(50 * time.Millisecond)
}
\`\`\`

\`context.Background()\` is the root of any context tree — an empty, never-cancelled starting point you derive everything else from.

### context.WithTimeout and WithDeadline

\`context.WithTimeout\` cancels automatically after a duration elapses — no need to call \`cancel\` yourself for that to happen, though you should still \`defer cancel()\` to release resources promptly if the work finishes early:

\`\`\`go
func fetchData(ctx context.Context) (string, error) {
	select {
	case <-time.After(2 * time.Second): // pretend this is a slow network call
		return "data", nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	result, err := fetchData(ctx)
	if err != nil {
		fmt.Println("failed:", err) // "failed: context deadline exceeded"
		return
	}
	fmt.Println(result)
}
\`\`\`

\`context.WithDeadline\` is the same idea but takes an absolute \`time.Time\` instead of a relative duration.

### The Done() channel

\`ctx.Done()\` returns a channel that's closed exactly once, when the context is cancelled or its deadline passes. Because a closed channel always returns immediately from a receive, \`<-ctx.Done()\` in a \`select\` is the idiomatic way to react to cancellation from anywhere the context is passed. \`ctx.Err()\` then tells you *why*: \`context.Canceled\` or \`context.DeadlineExceeded\`.

### Passing values with WithValue

\`context.WithValue\` attaches a request-scoped key/value pair to a context:

\`\`\`go
type ctxKey string

ctx := context.WithValue(context.Background(), ctxKey("requestID"), "abc-123")

func handler(ctx context.Context) {
	if id, ok := ctx.Value(ctxKey("requestID")).(string); ok {
		fmt.Println("handling request", id)
	}
}
\`\`\`

Use \`WithValue\` sparingly — it's meant for request-scoped metadata like a trace ID or an authenticated user, not for passing ordinary function parameters or optional arguments. If a value is important to a function's logic, put it in the function signature instead; burying it in a context makes the dependency invisible and hard to test.

> **Key idea:** pass a \`context.Context\` as the first parameter of any function that does I/O or might run for a while. Derive contexts with \`WithCancel\`/\`WithTimeout\`/\`WithDeadline\`, watch \`ctx.Done()\` in a \`select\` to react promptly, and reserve \`WithValue\` for request-scoped metadata — not general-purpose parameter passing.`,
    },
    {
      name: "Race Conditions and the Race Detector",
      minutes: 9,
      intro: "Go can find your data races for you — go test -race and go run -race catch what review alone often misses.",
      content: `### What a data race actually is

A **data race** occurs when two or more goroutines access the same memory location concurrently, at least one of the accesses is a write, and there's no synchronization ordering the accesses. It's a precise technical term — not just "code that behaves unpredictably" but specifically this pattern of unsynchronized concurrent access.

\`\`\`go
package main

func main() {
	m := map[string]int{}

	go func() { m["a"] = 1 }() // write
	go func() { _ = m["a"] }() // read, concurrently — this is a data race

	select {} // block forever just to let both run
}
\`\`\`

Data races are especially dangerous because they often *seem* to work — the program might run correctly a thousand times in a row in development and then corrupt data or crash under production load, because timing determines whether the race is actually hit.

### The built-in race detector

Go ships with a race detector you enable with the \`-race\` flag:

\`\`\`bash
go run -race main.go
go test -race ./...
go build -race -o myapp .
\`\`\`

It instruments memory accesses at compile time and reports the exact goroutines, stack traces, and memory location involved the moment a race actually happens during execution — dramatically easier than debugging a "sometimes wrong" value by inspection. The tradeoff is runtime and memory overhead (often 2-10x slower), which is why \`-race\` is used in testing and CI, not in production builds.

\`\`\`text
==================
WARNING: DATA RACE
Write at 0x00c0000a4018 by goroutine 8:
  main.main.func1()
      /tmp/race.go:7 +0x33

Previous read at 0x00c0000a4018 by goroutine 7:
  main.main.func2()
      /tmp/race.go:8 +0x1e
==================
\`\`\`

Running your test suite with \`-race\` regularly (ideally on every CI run) catches races that only manifest under specific goroutine scheduling — races that could otherwise sit dormant in production code for months.

### A quick idiomatic-concurrency checklist

- **Don't communicate by sharing memory; share memory by communicating.** Prefer passing ownership of data through a channel over letting multiple goroutines mutate the same variable.
- If goroutines genuinely must share memory, protect every access with the *same* \`sync.Mutex\` — a lock only some of the accesses go through protects nothing.
- Never copy a \`sync.Mutex\` (or anything containing one) after first use; pass it by pointer.
- Always give a goroutine a way to stop — a \`context\`, a \`done\` channel, or a closed channel it ranges over — so it can't leak.
- Run \`go test -race ./...\` as a normal part of your test cycle, not just when something looks broken.
- Prefer \`sync.WaitGroup\` or channels over \`time.Sleep\` for waiting on other goroutines — sleeping "long enough" is a guess, not a guarantee.

> **Key idea:** a data race is unsynchronized concurrent access where at least one side writes — and it can hide in code that appears to work fine for a long time. \`-race\` turns that invisible bug class into a loud, specific, actionable report; run it early and run it often.`,
    },
  ],
}
