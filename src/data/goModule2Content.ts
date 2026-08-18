import type { Module } from "../types"

export const goModule2: Module = {
  id: 2,
  title: "Control Flow & Functions",
  status: "upcoming",
  lessons: [
    {
      name: "if/else and switch",
      minutes: 9,
      intro: "No parens, mandatory braces, and a switch that doesn't need a tag.",
      content: `### if / else — no parentheses required

Go's \`if\` drops the parentheses around the condition that C, Java, and Kotlin require, but it makes curly braces **mandatory** even for one-line bodies:

\`\`\`go
age := 20

if age >= 18 {
    fmt.Println("adult")
} else if age >= 13 {
    fmt.Println("teen")
} else {
    fmt.Println("child")
}
\`\`\`

\`\`\`go
// if age >= 18 fmt.Println("adult") // ERROR: missing braces
\`\`\`

### if with an init statement

A distinctive Go idiom: \`if\` can run a statement before the condition, scoping the result to just the \`if\`/\`else\` blocks:

\`\`\`go
if x := computeScore(); x > 90 {
    fmt.Println("excellent:", x)
} else if x > 50 {
    fmt.Println("okay:", x)
} else {
    fmt.Println("needs work:", x)
}
// x does not exist here — it was scoped to the if statement
\`\`\`

This pattern shows up constantly with error handling:

\`\`\`go
if err := doSomething(); err != nil {
    fmt.Println("failed:", err)
    return
}
\`\`\`

### switch — no tag needed

Go's \`switch\` doesn't require an expression at all. Without one, it behaves like a cleaner chain of \`if\`/\`else if\`:

\`\`\`go
score := 82

switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
case score >= 70:
    fmt.Println("C")
default:
    fmt.Println("F")
}
\`\`\`

With a tag expression it works like other languages, but with one big difference: **each case breaks automatically**, no \`break\` needed.

\`\`\`go
day := "Sat"

switch day {
case "Sat", "Sun": // multiple values in one case
    fmt.Println("weekend")
case "Mon", "Tue", "Wed", "Thu", "Fri":
    fmt.Println("weekday")
default:
    fmt.Println("unknown")
}
\`\`\`

### fallthrough

If you actually want C-style fall-through behavior into the next case, you opt in explicitly with \`fallthrough\`:

\`\`\`go
switch n := 1; n {
case 1:
    fmt.Println("one")
    fallthrough
case 2:
    fmt.Println("two") // runs even though n != 2
case 3:
    fmt.Println("three")
}
// prints: one
//         two
\`\`\`

\`fallthrough\` must be the last statement in a case, and it always drops into the *next* case regardless of whether that case's condition matches.

> **Key idea:** Go's \`switch\` cases don't fall through by default — the opposite of C — which removes an entire category of accidental bugs. Reach for \`fallthrough\` only on the rare occasion you actually want the old behavior.`,
    },
    {
      name: "The for loop",
      minutes: 10,
      intro: "One keyword, four shapes: classic, while-style, infinite, and range.",
      content: `### Go has exactly one looping keyword

Unlike languages with \`for\`, \`while\`, and \`do-while\`, Go has just \`for\` — but it flexes into every shape you need.

### 1. Classic C-style for

\`\`\`go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
\`\`\`

### 2. Condition-only — the "while" loop

Drop the init and post statements and \`for\` behaves like \`while\`:

\`\`\`go
n := 1
for n < 100 {
    n *= 2
}
fmt.Println(n) // 128
\`\`\`

### 3. Infinite loop

Drop everything and you get an infinite loop — common for servers, workers, and game loops, always paired with a \`break\` somewhere inside:

\`\`\`go
count := 0
for {
    count++
    if count == 3 {
        break
    }
}
fmt.Println(count) // 3
\`\`\`

### 4. for range — iterating collections

\`for range\` walks slices, arrays, strings, and maps, yielding an index/key and a value:

\`\`\`go
nums := []int{10, 20, 30}
for i, v := range nums {
    fmt.Println(i, v)
}
// 0 10
// 1 20
// 2 30

// ignore the index with _
for _, v := range nums {
    fmt.Println(v)
}

ages := map[string]int{"Ann": 30, "Ben": 25}
for name, age := range ages {
    fmt.Println(name, age) // order is randomized, see Module 3
}
\`\`\`

### break and continue

\`\`\`go
for i := 0; i < 10; i++ {
    if i == 5 {
        break // exit the loop entirely
    }
    if i%2 == 0 {
        continue // skip to the next iteration
    }
    fmt.Println(i) // prints 1, 3
}
\`\`\`

### Labeled loops

When loops are nested, a plain \`break\`/\`continue\` only affects the innermost loop. Label the outer loop to control it directly:

\`\`\`go
outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 {
            continue outer // skips to next i, not just next j
        }
        fmt.Println(i, j)
    }
}
\`\`\`

> **Key idea:** Every loop you've ever written in another language — for, while, do-while, forever, for-each — is spelled \`for\` in Go. The shape is decided entirely by what you put (or leave out) between \`for\` and \`{\`.`,
    },
    {
      name: "Functions & Multiple Return Values",
      minutes: 10,
      intro: "Parameters, returning more than one value, and the value/err idiom.",
      content: `### Basic function syntax

\`\`\`go
func add(a int, b int) int {
    return a + b
}
\`\`\`

When consecutive parameters share a type, you can collapse the type annotations:

\`\`\`go
func add(a, b int) int {
    return a + b
}
\`\`\`

### Multiple return values

This is one of Go's defining features: a function can return more than one value, no wrapper object or tuple type required.

\`\`\`go
func divide(a, b int) (int, int) {
    quotient := a / b
    remainder := a % b
    return quotient, remainder
}

q, r := divide(17, 5)
fmt.Println(q, r) // 3 2
\`\`\`

### The value, err idiom

Go has no exceptions. Instead, functions that can fail return an \`error\` as their **last** return value, and callers are expected to check it immediately:

\`\`\`go
func parseAge(s string) (int, error) {
    age, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("invalid age %q: %w", s, err)
    }
    return age, nil
}

age, err := parseAge("28")
if err != nil {
    fmt.Println("error:", err)
    return
}
fmt.Println("age is", age)
\`\`\`

### Why multiple returns instead of exceptions

- The failure path is visible right in the function signature — you can't accidentally ignore it the way you can miss a \`catch\` block.
- Control flow stays linear: no stack unwinding, no invisible jumps.
- \`if err != nil { ... }\` becomes a predictable, greppable pattern across an entire codebase.

The tradeoff is verbosity — you'll write \`if err != nil\` a lot — but Go's designers consider that an acceptable price for explicitness.

### Named return values

You can name the return values in the signature; \`return\` with no arguments sends back whatever they currently hold:

\`\`\`go
func divide(a, b int) (quotient int, remainder int) {
    quotient = a / b
    remainder = a % b
    return // "naked" return — sends back quotient and remainder
}
\`\`\`

Named returns also act as documentation and are handy combined with \`defer\` (covered next lesson) for adjusting a result right before a function exits.

> **Key idea:** When you see a Go function ending in \`(T, error)\`, that's not a convention someone chose for style — it's how the whole language expresses "this might fail" without exceptions.`,
    },
    {
      name: "Variadic Functions & defer",
      minutes: 9,
      intro: "Accept any number of arguments, and schedule cleanup that always runs.",
      content: `### Variadic parameters

A parameter prefixed with \`...\` accepts zero or more values of that type, collected into a slice inside the function:

\`\`\`go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

sum()           // 0
sum(1, 2, 3)    // 6
sum(5, 10, 15, 20) // 50
\`\`\`

A variadic parameter must be the **last** parameter in the list, and there can only be one.

### Spreading a slice into a variadic call

If you already have a slice and want to pass its elements as individual arguments, spread it with \`...\`:

\`\`\`go
nums := []int{4, 8, 15, 16, 23, 42}
total := sum(nums...) // spreads the slice
fmt.Println(total)
\`\`\`

This is exactly how \`fmt.Println\` itself works under the hood — it's declared as \`func Println(a ...any)\`.

### defer — schedule a call for later

\`defer\` postpones a function call until the surrounding function returns, no matter how it returns (normal return, or a \`panic\`):

\`\`\`go
func readFile(path string) {
    f, err := os.Open(path)
    if err != nil {
        return
    }
    defer f.Close() // guaranteed to run when readFile exits

    // ... use f ...
}
\`\`\`

This \`defer f.Close()\` pattern is idiomatic Go — you open a resource and immediately defer its cleanup, right next to each other, instead of hoping you remember to close it at every possible exit point.

### defer runs in LIFO order

Multiple \`defer\` calls stack up and run in **last-in, first-out** order — like a stack of plates:

\`\`\`go
func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
    fmt.Println("running main")
}
// output:
// running main
// 3
// 2
// 1
\`\`\`

### Arguments are captured at defer-time, not run-time

This trips people up: the deferred function's *arguments* are evaluated immediately when \`defer\` runs, even though the call itself happens later.

\`\`\`go
func demo() {
    x := 1
    defer fmt.Println("deferred x:", x) // x is captured as 1 right now
    x = 99
    fmt.Println("current x:", x)
}
// current x: 99
// deferred x: 1
\`\`\`

If you need the deferred call to see the *latest* value, wrap it in a closure instead:

\`\`\`go
func demo() {
    x := 1
    defer func() {
        fmt.Println("deferred x:", x) // reads x when the closure finally runs
    }()
    x = 99
}
// deferred x: 99
\`\`\`

> **Key idea:** \`defer\` pairs naturally with resource setup — open/close, lock/unlock, start/stop — because writing the cleanup right next to the setup makes it impossible to forget, and LIFO order unwinds nested resources correctly.`,
    },
  ],
}
