import type { Module } from "../types"

export const goModule7: Module = {
  id: 7,
  title: "Pointers & Memory",
  status: "upcoming",
  lessons: [
    {
      name: "Pointers Basics",
      minutes: 9,
      intro: "A pointer just holds the address of a value — nothing more mysterious than that.",
      content: `## Address-of and dereference

A pointer is a value that stores the **memory address** of another value. Go gives you two operators to work with them:

- \`&x\` — "address of \`x\`" — produces a pointer to \`x\`
- \`*p\` — "dereference \`p\`" — accesses the value \`p\` points to

\`\`\`go
x := 42
p := &x // p is a *int, holding the address of x

fmt.Println(p)  // something like 0xc0000140a0
fmt.Println(*p) // 42 — the value at that address
\`\`\`

### Declaring a pointer type

A pointer to \`int\` has type \`*int\`. A pointer to \`string\` has type \`*string\`. In general, \`*T\` is "pointer to \`T\`."

\`\`\`go
var p *int          // p is nil — points to nothing yet
fmt.Println(p)      // <nil>

x := 10
p = &x               // now p points to x
fmt.Println(*p)      // 10
\`\`\`

### Mutating through a pointer

Dereferencing with \`*p\` doesn't just read — you can also assign through it, which changes the original variable:

\`\`\`go
x := 10
p := &x
*p = 20
fmt.Println(x) // 20 — x itself changed, through the pointer
\`\`\`

### nil pointers

The zero value of any pointer type is \`nil\` — "points to nothing." Dereferencing a nil pointer panics (covered fully in the pitfalls lesson):

\`\`\`go
var p *int
fmt.Println(p == nil) // true
// fmt.Println(*p)     // panic: invalid memory address or nil pointer dereference
\`\`\`

Always make sure a pointer is non-nil before dereferencing it, unless you're certain of its origin.

### Pointers to structs

Pointers to structs are extremely common in Go — they let functions share and mutate a single struct instead of copying it around.

\`\`\`go
type Point struct {
    X, Y int
}

p := Point{X: 1, Y: 2}
ptr := &p
\`\`\`

### Field access shorthand — automatic dereference

You'd expect field access on a pointer to require explicit dereferencing, like \`(*ptr).X\`. Go lets you skip that — \`ptr.X\` works directly, and the compiler inserts the dereference for you:

\`\`\`go
ptr := &Point{X: 1, Y: 2}

fmt.Println((*ptr).X) // 1 — explicit form
fmt.Println(ptr.X)    // 1 — shorthand, does the exact same thing
ptr.X = 99             // also works — mutates the underlying Point
\`\`\`

This shorthand is used constantly — you'll almost never see \`(*ptr).Field\` in real Go code; everyone just writes \`ptr.Field\`.

### Pointers returned from functions

A function can return a pointer to a struct it just built. This is the standard pattern for constructor-style functions:

\`\`\`go
func NewPoint(x, y int) *Point {
    return &Point{X: x, Y: y}
}

p := NewPoint(3, 4)
fmt.Println(p.X, p.Y) // 3 4
\`\`\`

### Quick reference

| Syntax | Meaning |
|---|---|
| \`&x\` | Address of \`x\` — produces a pointer |
| \`*p\` | Value pointed to by \`p\` — dereference |
| \`var p *T\` | Declares a nil pointer to type \`T\` |
| \`p.Field\` | Shorthand for \`(*p).Field\` when \`p\` is a struct pointer |

> **Key idea:** \`&\` takes you from a value to its address; \`*\` takes you from an address back to its value. Struct pointers get automatic field-access shorthand, so \`ptr.Field\` just works without an explicit dereference.`,
    },
    {
      name: "Pointers vs Values — When to Use Each",
      minutes: 10,
      intro: "Copies are safe and simple; pointers are efficient and shared — pick deliberately.",
      content: `## Two ways to pass data around

When you pass a value to a function in Go, it's **copied** by default — this is value semantics. When you pass a pointer, the function gets the address, and can read or mutate the *original* — this is pointer (reference-like) semantics.

\`\`\`go
type Counter struct {
    Count int
}

func incByValue(c Counter) {
    c.Count++ // mutates the local copy only
}

func incByPointer(c *Counter) {
    c.Count++ // mutates the original, through the pointer
}

func main() {
    c := Counter{Count: 0}

    incByValue(c)
    fmt.Println(c.Count) // 0 — unaffected, incByValue got a copy

    incByPointer(&c)
    fmt.Println(c.Count) // 1 — the original was mutated
}
\`\`\`

### When you need to mutate the caller's data

If a function's whole job is to change something the caller has (append to a struct, update a field, reset a counter), it must take a pointer — a value receiver would silently mutate a throwaway copy and the caller would never see the change.

\`\`\`go
func (c *Counter) Reset() {
    c.Count = 0
}
\`\`\`

A pointer *receiver* (\`(c *Counter)\`) works exactly like a pointer parameter — the method can mutate the actual struct the caller holds.

### Efficiency: large structs are expensive to copy

Every time a value is passed by value — as an argument, a return value, or stored into a slice — Go copies its entire contents. For a small struct like \`Counter\` that's trivial. For a struct with many fields, or a large array, copying on every call adds up.

\`\`\`go
type LargeConfig struct {
    Name        string
    Values      [1000]int // a big fixed-size array, copied in full each time
    Description string
}

// Copies all 1000+ ints every call:
func processByValue(cfg LargeConfig) { /* ... */ }

// Only copies one machine word (the pointer) every call:
func processByPointer(cfg *LargeConfig) { /* ... */ }
\`\`\`

For large structs, passing a pointer avoids copying the whole thing on every function call.

### Value semantics vs pointer semantics

| Value (\`T\`) | Pointer (\`*T\`) |
|---|---|
| Function/method gets an independent copy | Function/method shares the original |
| Safe by default — no surprise mutation from elsewhere | Mutations are visible to every holder of the pointer |
| Cheap for small structs (few fields) | Cheap regardless of struct size — always just copies an address |
| Cannot mutate the caller's data | Can mutate the caller's data |
| Good default for small, immutable-feeling data (a \`Point\`, a \`Money\` amount) | Good default for large structs, or anything representing shared, mutable state |

### Be consistent within a type's method set

Go lets you mix value and pointer receivers on the same type, but it's a common source of confusion — pick one and stick with it. If *any* method needs a pointer receiver (to mutate, or because the struct is large), it's idiomatic to make **all** methods on that type use pointer receivers, even the ones that don't strictly need to:

\`\`\`go
type Account struct {
    Balance float64
}

// Consistent: all methods use pointer receivers, because Deposit needs to mutate.
func (a *Account) Deposit(amount float64) {
    a.Balance += amount
}

func (a *Account) Balance2() float64 {
    return a.Balance
}
\`\`\`

Mixing value and pointer receivers on the same type can lead to subtle bugs around whether a given method call actually sees the latest state — Go itself will even refuse to let a value (not addressable, e.g. one stored in a map) satisfy an interface if any required method has a pointer receiver.

> **Key idea:** Default to values for small, simple data you don't need to mutate. Switch to pointers when a function needs to mutate the caller's data, or when the struct is large enough that copying it is wasteful — and once one method on a type needs a pointer receiver, make them all pointer receivers.`,
    },
    {
      name: "new vs make, and Go's Memory Model",
      minutes: 9,
      intro: "Two allocation built-ins with very different jobs, and a compiler that decides where memory lives.",
      content: `## new(T) — a pointer to a zeroed T

\`new\` allocates memory for a value of type \`T\`, zeroes it, and returns a pointer to it — \`*T\`. It works for **any** type.

\`\`\`go
p := new(int)
fmt.Println(*p) // 0 — zero value for int

type Point struct{ X, Y int }
pp := new(Point)
fmt.Println(*pp) // {0 0}
\`\`\`

\`new(Point)\` is essentially equivalent to \`&Point{}\` — both give you a pointer to a zeroed \`Point\`. In practice, \`&Point{}\` (or \`&Point{X: 1, Y: 2}\` with explicit fields) is far more common in real code; \`new\` shows up rarely, mostly for primitive types where there's no literal syntax as convenient.

### make — only for slices, maps, and channels

\`make\` is a completely different built-in that only works on **three** types: slices, maps, and channels. Unlike \`new\`, it doesn't return a pointer — it returns an **initialized, ready-to-use value** of the type itself.

\`\`\`go
s := make([]int, 3)      // slice of length 3, ready to index into
m := make(map[string]int) // empty but initialized map, ready to write into
ch := make(chan int)      // ready-to-use channel
\`\`\`

### Why make exists separately from new

\`new([]int)\` would give you a pointer to a **nil slice header** — technically zeroed, but not actually usable the way a real slice is. Slices, maps, and channels need internal setup (an underlying array, hash buckets, a channel's internal queue) beyond just zeroing memory — \`make\` performs that setup and hands back a working value.

\`\`\`go
var s1 []int              // nil slice — len 0, cap 0, no underlying array
s2 := make([]int, 0)      // non-nil, initialized slice — len 0, cap 0, but usable

fmt.Println(s1 == nil) // true
fmt.Println(s2 == nil) // false
\`\`\`

A nil map is even stricter: reading from it works fine, but **writing** to it panics:

\`\`\`go
var m1 map[string]int
fmt.Println(m1["x"]) // 0 — reading a nil map is fine
// m1["x"] = 1        // panic: assignment to entry in nil map

m2 := make(map[string]int)
m2["x"] = 1 // fine — m2 was properly initialized
\`\`\`

### new vs make at a glance

| | \`new(T)\` | \`make(T, ...)\` |
|---|---|---|
| Works on | Any type | Only slice, map, channel |
| Returns | \`*T\` (a pointer) | \`T\` itself (not a pointer) |
| Result | Zeroed memory | Initialized, ready-to-use value |
| Common in practice | Rare — \`&T{}\` is usually preferred | Extremely common |

### A quick word on stack vs heap

Go doesn't make you choose where a value lives — the compiler decides automatically through a process called **escape analysis**. If a value's lifetime is provably confined to the current function call, it's allocated on the fast, cheap **stack**. If the compiler can't prove that — for example, because a pointer to it is returned or stored somewhere that outlives the function — the value **escapes** to the slower, garbage-collected **heap**.

\`\`\`go
func onStack() int {
    x := 10  // never leaves this function — stays on the stack
    return x
}

func onHeap() *int {
    x := 10   // a pointer to x is returned, so x must outlive this call
    return &x // the compiler allocates x on the heap instead
}
\`\`\`

You can inspect these decisions with \`go build -gcflags="-m"\`, but for day-to-day coding **you don't need to think about it** — write natural code, and let the compiler place things correctly. This is a deliberate contrast with C, where returning the address of a local variable is undefined behavior; in Go it's completely safe (more on this in the next lesson).

> **Key idea:** \`new\` gives you a pointer to zeroed memory of any type; \`make\` initializes a slice, map, or channel into a genuinely usable value. Where that memory physically lives — stack or heap — is the compiler's decision via escape analysis, not yours.`,
    },
    {
      name: "Common Pointer Pitfalls",
      minutes: 10,
      intro: "The mistakes every Go developer makes once — nil dereferences and the loop-variable trap.",
      content: `## Pitfall 1: nil pointer dereference

The most common pointer bug: dereferencing a pointer that's still \`nil\`.

\`\`\`go
type User struct {
    Name string
}

func getUser() *User {
    return nil // pretend this represents "not found"
}

func main() {
    u := getUser()
    fmt.Println(u.Name) // panic: runtime error: invalid memory address or nil pointer dereference
}
\`\`\`

The fix is always the same: check for \`nil\` before dereferencing, just as you'd check an \`error\` before using a result.

\`\`\`go
u := getUser()
if u == nil {
    fmt.Println("no user found")
    return
}
fmt.Println(u.Name)
\`\`\`

This is exactly why functions that can fail to produce a struct commonly return \`(*T, error)\` — the \`error\` tells you clearly *whether* to trust the pointer, instead of relying on an implicit nil check.

## Returning a pointer to a local variable — safe in Go

Coming from C, this looks like a bug waiting to happen:

\`\`\`go
func newPoint(x, y int) *Point {
    p := Point{X: x, Y: y} // a "local" variable...
    return &p               // ...whose address we return
}
\`\`\`

In C, \`p\` would be destroyed when \`newPoint\` returns, leaving \`&p\` dangling — a classic use-after-free bug. **In Go, this is completely safe.** Thanks to escape analysis (previous lesson), the compiler detects that \`p\`'s address outlives the function call, and automatically allocates \`p\` on the heap instead of the stack. The returned pointer stays valid for as long as anything references it, managed by the garbage collector.

\`\`\`go
p1 := newPoint(1, 2)
p2 := newPoint(3, 4)
fmt.Println(p1.X, p2.X) // 1 3 — both independently valid and correct
\`\`\`

You can write this pattern freely and idiomatically in Go — it's how most constructor functions work.

## Pitfall 2: the classic loop-variable capture bug

Before Go 1.22, a \`for\` loop reused **the same variable** on every iteration — meaning a closure that captured the loop variable captured a single shared variable, not a fresh one per item.

\`\`\`go
// Pre-1.22 behavior — buggy!
items := []string{"a", "b", "c"}

for i, v := range items {
    go func() {
        fmt.Println(i, v) // BUG: likely prints "2 c" three times
    }()
}
\`\`\`

By the time the goroutines actually run, the loop has usually already finished, and \`i\`/\`v\` hold their **final** values — because all three closures captured the exact same underlying variables, not independent snapshots.

### Pre-1.22 fix: shadow the variable inside the loop

The traditional workaround was to create a new, per-iteration variable explicitly:

\`\`\`go
for i, v := range items {
    i, v := i, v // shadow: new variables scoped to this iteration
    go func() {
        fmt.Println(i, v) // now correct
    }()
}
\`\`\`

Or pass them as arguments, which has the same effect (a fresh copy per call):

\`\`\`go
for i, v := range items {
    go func(i int, v string) {
        fmt.Println(i, v)
    }(i, v)
}
\`\`\`

### Go 1.22+ fix: per-iteration scoping is now the default

Starting with **Go 1.22**, the language changed \`for\` loop semantics: \`i\` and \`v\` are now a **fresh variable on every iteration**, not one shared variable reused throughout the loop.

\`\`\`go
// Go 1.22+ — correct without any workaround
for i, v := range items {
    go func() {
        fmt.Println(i, v) // each goroutine sees its own iteration's i, v
    }()
}
\`\`\`

This eliminated an entire, very common class of bugs — but it's important to recognize both forms: you'll still see the shadowing workaround (\`i, v := i, v\`) throughout older codebases and tutorials, and it remains harmless to keep writing even on 1.22+.

### Quick reference

| Pitfall | Symptom | Fix |
|---|---|---|
| Nil pointer dereference | Panic: "invalid memory address or nil pointer dereference" | Check \`if p == nil\` before use |
| Returning \`&localVar\` | *(Not actually a bug in Go)* | Nothing to fix — escape analysis handles it |
| Loop variable capture (pre-1.22) | Goroutines all print the same, final value | Shadow the variable, pass as an argument, or upgrade to Go 1.22+ |

> **Key idea:** Always guard a pointer against \`nil\` before dereferencing it. Returning a pointer to a local variable is completely safe in Go. And if you're on Go 1.22 or later, the classic loop-capture bug is fixed by default — but recognize the shadowing pattern, since it's everywhere in code written for older versions.`,
    },
  ],
}
