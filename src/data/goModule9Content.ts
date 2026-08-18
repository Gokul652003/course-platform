import type { Module } from "../types"

export const goModule9: Module = {
  id: 9,
  title: "Goroutines & Channels",
  status: "upcoming",
  lessons: [
    {
      name: "Goroutines",
      minutes: 8,
      intro: "The \`go\` keyword turns any function call into a concurrently running goroutine.",
      content: `### What is a goroutine

A **goroutine** is a function that runs concurrently with other code, managed by the Go runtime instead of the operating system. You start one by putting the \`go\` keyword in front of a function call:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func sayHello() {
	fmt.Println("Hello from a goroutine!")
}

func main() {
	go sayHello()             // starts running concurrently
	time.Sleep(100 * time.Millisecond) // give it a chance to run
	fmt.Println("Hello from main!")
}
\`\`\`

Without that \`time.Sleep\`, \`main\` would very likely exit before \`sayHello\` ever gets to run — when \`main\` returns, the whole program stops, no matter what other goroutines are still in flight. We'll see the proper fix for this (\`sync.WaitGroup\`) later in this module; for now, just notice that goroutines don't block their caller.

### Goroutines vs OS threads

Goroutines look like threads, but they are much cheaper. The Go runtime multiplexes many goroutines onto a small number of real OS threads, growing and shrinking their stacks as needed.

| | OS thread | Goroutine |
|---|---|---|
| Initial stack size | ~1-8 MB (fixed-ish) | ~2 KB (grows/shrinks) |
| Created by | Operating system | Go runtime |
| Typical count | Hundreds to low thousands | Hundreds of thousands, millions |
| Scheduling | OS kernel scheduler | Go runtime scheduler (cooperative, on top of OS threads) |
| Creation cost | Expensive (syscall) | Cheap (just a function call away) |

Because goroutines are so cheap, it's completely normal Go style to spin up a goroutine per incoming request, per connection, or per unit of work — something you'd think twice about with OS threads.

### Concurrency vs parallelism

These two words get mixed up constantly:

- **Concurrency** is about *structure*: dealing with multiple things at once, potentially interleaved on a single core.
- **Parallelism** is about *execution*: multiple things actually running at the same literal instant, which requires multiple cores.

Go gives you concurrency for free with goroutines. Whether that concurrency becomes parallelism depends on \`GOMAXPROCS\` (the number of OS threads the runtime will use to execute Go code simultaneously) and how many CPU cores are available.

> As Rob Pike put it: "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once." Concurrency is a way of structuring a program; parallelism is a side effect of having enough hardware.

### Unpredictable interleaving

Because the Go scheduler decides when each goroutine runs, output ordering across goroutines is **not guaranteed** unless you synchronize it yourself:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func printLetters() {
	for _, c := range "ABCDE" {
		fmt.Printf("%c", c)
		time.Sleep(time.Millisecond)
	}
}

func printNumbers() {
	for i := 1; i <= 5; i++ {
		fmt.Printf("%d", i)
		time.Sleep(time.Millisecond)
	}
}

func main() {
	go printLetters()
	go printNumbers()
	time.Sleep(20 * time.Millisecond)
	fmt.Println()
}
\`\`\`

Run this a few times and you'll see different interleavings — something like \`A1B2C3D4E5\` one run, \`1A2B3C4D5E\` the next. Neither is "correct" — the two goroutines simply race to print, and the scheduler decides who goes when. This is exactly the kind of nondeterminism channels and \`sync\` primitives exist to tame.

> **Key idea:** \`go f()\` schedules \`f\` to run concurrently and returns immediately — it never blocks the caller and it never guarantees ordering relative to other goroutines. Goroutines are cheap enough to launch by the thousand, but "cheap to start" doesn't mean "safe to leave unsynchronized."`,
    },
    {
      name: "Channels Basics",
      minutes: 10,
      intro: "Channels are typed pipes goroutines use to send and receive values safely.",
      content: `### Declaring a channel

A channel is a typed conduit for communication between goroutines, created with \`make\`:

\`\`\`go
ch := make(chan int)       // unbuffered channel of ints
buffered := make(chan int, 3) // buffered channel, capacity 3
\`\`\`

### Unbuffered channels: blocking by design

An **unbuffered** channel has no storage. A send on it blocks until another goroutine is ready to receive, and a receive blocks until another goroutine sends. This is what makes channels useful for synchronization, not just data passing:

\`\`\`go
package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		ch <- "done" // blocks here until main receives
	}()

	msg := <-ch // blocks here until the goroutine sends
	fmt.Println(msg)
}
\`\`\`

Both sides rendezvous at exactly the same moment — the send completes only once the receive is ready, and vice versa.

### Buffered channels: some slack

A **buffered** channel has capacity. Sends only block once the buffer is full; receives only block once the buffer is empty:

\`\`\`go
ch := make(chan int, 2)
ch <- 1 // does not block, buffer has room
ch <- 2 // does not block, buffer now full
// ch <- 3 // would block: buffer is full and nobody is receiving

fmt.Println(<-ch) // 1
fmt.Println(<-ch) // 2
\`\`\`

| | Unbuffered \`make(chan T)\` | Buffered \`make(chan T, N)\` |
|---|---|---|
| Send blocks until | a receiver is ready | buffer has free space |
| Receive blocks until | a sender is ready | buffer has a value |
| Good for | synchronization, handoff | decoupling producer/consumer speed |

### Closing a channel

\`close(ch)\` signals that no more values will ever be sent. Only the **sender** should close a channel — closing from the receiving side, or closing twice, causes a panic:

\`\`\`go
ch := make(chan int, 3)
ch <- 1
ch <- 2
close(ch)

for v := range ch {
	fmt.Println(v) // prints 1, then 2, then the loop exits cleanly
}
\`\`\`

### Ranging over a channel

\`for v := range ch\` receives values until the channel is closed and drained — it's the idiomatic way to consume a stream of results without knowing how many there will be.

### The comma-ok form

A plain receive from a closed, empty channel returns the zero value with no error — which is ambiguous. Use the two-value form to tell the difference between "a real zero value was sent" and "the channel is closed":

\`\`\`go
ch := make(chan int, 1)
ch <- 0
close(ch)

v, ok := <-ch
fmt.Println(v, ok) // 0 true  — a real value was received

v, ok = <-ch
fmt.Println(v, ok) // 0 false — channel is closed and empty
\`\`\`

> **Key idea:** channels are a way to *hand off* values, not a shared mutable box. An unbuffered channel synchronizes two goroutines at the moment of handoff; a buffered channel decouples them up to its capacity. Always let the sender \`close\` the channel, and use \`v, ok := <-ch\` whenever "closed" is a meaningful outcome you need to detect.`,
    },
    {
      name: "The select Statement",
      minutes: 9,
      intro: "select waits on multiple channel operations at once and runs whichever is ready first.",
      content: `### Waiting on more than one channel

\`select\` lets a goroutine wait on several channel operations simultaneously. It blocks until one of its cases can proceed, then runs that case. If multiple cases are ready at once, Go picks one at random:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(50 * time.Millisecond)
		ch1 <- "from ch1"
	}()
	go func() {
		time.Sleep(20 * time.Millisecond)
		ch2 <- "from ch2"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println("received:", msg1)
		case msg2 := <-ch2:
			fmt.Println("received:", msg2)
		}
	}
}
\`\`\`

Because \`ch2\` fires sooner in this example, "received: from ch2" prints first, then "received: from ch1" — \`select\` reacts to whichever channel becomes ready.

### Non-blocking attempts with default

Adding a \`default\` case makes \`select\` non-blocking: if no other case is ready *right now*, \`default\` runs immediately instead of waiting:

\`\`\`go
ch := make(chan int)

select {
case v := <-ch:
	fmt.Println("got", v)
default:
	fmt.Println("no value ready, moving on")
}
\`\`\`

This pattern is handy for polling a channel without stalling the goroutine — check once, and if nothing's there, go do something else.

### Timeouts with time.After

Combining \`select\` with \`time.After\` is the idiomatic way to avoid waiting forever on a channel:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func slowOperation(ch chan<- string) {
	time.Sleep(2 * time.Second)
	ch <- "finally done"
}

func main() {
	ch := make(chan string)
	go slowOperation(ch)

	select {
	case result := <-ch:
		fmt.Println(result)
	case <-time.After(500 * time.Millisecond):
		fmt.Println("timed out waiting for the operation")
	}
}
\`\`\`

\`time.After(d)\` returns a channel that receives a single value after duration \`d\` elapses. Racing it against your real channel in a \`select\` gives you a clean timeout without any extra goroutine bookkeeping.

### select with multiple sends

\`select\` cases aren't limited to receives — a send can be a case too, useful for "send if there's room, otherwise do something else":

\`\`\`go
select {
case out <- result:
	// sent successfully
default:
	// nobody was ready to receive; drop or log it
}
\`\`\`

> **Key idea:** \`select\` is Go's way of saying "whichever of these channel operations is ready first, do that one." Add \`default\` when you want to poll without blocking, and race against \`time.After\` when you want to bound how long you're willing to wait.`,
    },
    {
      name: "Goroutine Leaks and sync.WaitGroup",
      minutes: 10,
      intro: "A goroutine blocked forever never gets cleaned up — WaitGroup is how you wait for a batch to finish.",
      content: `### How a goroutine leaks

A goroutine "leaks" when it's permanently blocked — usually sending on or receiving from a channel that nobody will ever use on the other end — and so it never terminates. Unlike garbage in the heap, the Go runtime cannot detect or reclaim a stuck goroutine; it just sits there consuming its stack forever.

\`\`\`go
func leaky() {
	ch := make(chan int) // unbuffered
	go func() {
		ch <- 42 // no one is ever going to receive this
	}()
	// function returns without ever reading from ch —
	// the goroutine above is now blocked forever
}
\`\`\`

Every call to \`leaky\` spawns one more goroutine that will never finish. Call it in a loop and you have a slow, silent memory leak — a very common real-world Go bug. The fix is almost always one of: make sure someone reads what you write, use a buffered channel sized so the send can't block, or give the goroutine a way to bail out (a \`context\` — covered in the next module — or a \`done\` channel).

### sync.WaitGroup: waiting for a batch of goroutines

When you launch several goroutines and just need to know "are they all done yet," reach for \`sync.WaitGroup\` instead of ad-hoc channels:

\`\`\`go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1) // register one goroutine before starting it
		go func(id int) {
			defer wg.Done() // signal completion when this returns
			fmt.Printf("worker %d done\\n", id)
		}(i)
	}

	wg.Wait() // blocks until the count drops to zero
	fmt.Println("all workers finished")
}
\`\`\`

- \`wg.Add(n)\` increments an internal counter — call it *before* starting the goroutine it counts, not inside it, to avoid a race against \`Wait\`.
- \`wg.Done()\` decrements the counter by one — almost always deferred so it runs even if the goroutine panics partway through.
- \`wg.Wait()\` blocks the calling goroutine until the counter reaches zero.

Notice \`id\` is passed as a parameter to the closure rather than captured directly — capturing the loop variable directly used to be a classic bug (all goroutines seeing the final value of \`i\`); passing it as an argument copies the value at launch time and sidesteps the issue entirely.

### A worked fan-out example

Here workers process a slice of inputs concurrently and a \`WaitGroup\` ensures \`main\` doesn't exit before they're all finished:

\`\`\`go
package main

import (
	"fmt"
	"sync"
)

func square(n int) int {
	return n * n
}

func main() {
	inputs := []int{2, 4, 6, 8, 10}
	var wg sync.WaitGroup
	results := make([]int, len(inputs))

	for i, n := range inputs {
		wg.Add(1)
		go func(i, n int) {
			defer wg.Done()
			results[i] = square(n)
		}(i, n)
	}

	wg.Wait()
	fmt.Println(results) // [4 16 36 64 100]
}
\`\`\`

Each goroutine writes to its own index of \`results\`, so there's no shared-write conflict between them — that's what makes it safe to fan out without a mutex here. \`wg.Wait()\` is the synchronization point that guarantees every \`results[i]\` has been written before we print the slice.

> **Key idea:** a goroutine that blocks with nothing on the other end of the channel leaks silently and forever — always make sure a goroutine has a way to finish. \`sync.WaitGroup\` is the standard tool for "start N goroutines, then wait until every single one has called \`Done\`."`,
    },
  ],
}
