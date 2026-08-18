import type { Module } from "../types"

export const goModule6: Module = {
  id: 6,
  title: "Error Handling",
  status: "upcoming",
  lessons: [
    {
      name: "The error Interface",
      minutes: 8,
      intro: "Go treats errors as ordinary values you check, not exceptions you catch.",
      content: `## Errors are just values

Go has no \`try\`/\`catch\`. Instead, an error is simply a value of type \`error\` — a built-in interface with exactly one method:

\`\`\`go
type error interface {
    Error() string
}
\`\`\`

Any type with an \`Error() string\` method satisfies \`error\` — the same implicit-satisfaction rule you saw for every other interface.

### The value, err := ... idiom

Functions that can fail return **two values**: the result, and an \`error\`. By convention the error is always last.

\`\`\`go
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
\`\`\`

Calling code immediately checks the error before touching the result:

\`\`\`go
result, err := Divide(10, 0)
if err != nil {
    fmt.Println("error:", err)
    return
}
fmt.Println("result:", result)
\`\`\`

### nil means success

When there's no error, functions return \`nil\` for the error value. \`nil\` is the zero value for any interface — "no concrete value stored here."

\`\`\`go
result, err := Divide(10, 2)
if err != nil {
    // not reached — err is nil
}
fmt.Println(result) // 5
\`\`\`

### Always check err immediately

The idiomatic pattern is to check \`err\` right after the call that produced it, before doing anything else with the other return value:

\`\`\`go
file, err := os.Open("data.txt")
if err != nil {
    log.Fatal(err)
}
defer file.Close()
\`\`\`

This produces Go's signature "staircase" of \`if err != nil\` blocks. It looks repetitive compared to try/catch, but it has a real benefit: **every possible failure point is visible right where it happens**, not hidden behind an invisible control-flow jump somewhere else in the file.

### Why not exceptions?

| Exceptions (try/catch) | Go's error values |
|---|---|
| Control flow can jump from deep in a call stack to a distant catch block | Errors flow through normal return values — no hidden jumps |
| Easy to accidentally swallow an error with an empty catch | \`err\` sits right there — ignoring it requires a visible, deliberate omission |
| Expected failures (file not found) and true crashes (out of memory) often use the same mechanism | Expected failures use \`error\`; only truly exceptional situations use \`panic\` (next lesson) |
| Cost of throwing can be significant in some languages | Returning a value has no special runtime cost |

Go's designers consider "expected, recoverable failure" (file doesn't exist, network timeout, bad user input) fundamentally different from "the program's invariants have been violated" (index out of bounds, nil dereference). Errors handle the first case; \`panic\` is reserved for the second.

### Ignoring an error is legal but dangerous

\`\`\`go
result, _ := Divide(10, 0) // the underscore discards err
fmt.Println(result)        // prints 0, silently — the failure vanished
\`\`\`

Go lets you discard an error with \`_\`, but tools like \`go vet\` and linters will often flag this, because a silently discarded error is one of the most common sources of confusing bugs.

> **Key idea:** An \`error\` is just a value satisfying a one-method interface. Check it immediately after every call that can fail, and treat \`nil\` as the only "everything's fine" signal.`,
    },
    {
      name: "Creating Custom Errors",
      minutes: 9,
      intro: "From a one-line message to a fully structured error type.",
      content: `## The simplest error: errors.New

\`\`\`go
import "errors"

func Withdraw(balance, amount float64) (float64, error) {
    if amount > balance {
        return balance, errors.New("insufficient funds")
    }
    return balance - amount, nil
}
\`\`\`

\`errors.New\` builds a basic error whose \`Error()\` method just returns the string you gave it.

### fmt.Errorf — errors with formatting

When the message needs to include dynamic values, \`fmt.Errorf\` works like \`fmt.Sprintf\` but returns an \`error\`:

\`\`\`go
func Withdraw(balance, amount float64) (float64, error) {
    if amount > balance {
        return balance, fmt.Errorf("insufficient funds: have %.2f, need %.2f", balance, amount)
    }
    return balance - amount, nil
}
\`\`\`

### Sentinel errors — predefined, comparable errors

A **sentinel error** is a package-level \`error\` value that callers can compare against directly. This lets calling code distinguish *which* failure happened, not just that *a* failure happened.

\`\`\`go
var ErrNotFound = errors.New("item not found")
var ErrPermission = errors.New("permission denied")

func Lookup(id int) (string, error) {
    if id == 0 {
        return "", ErrNotFound
    }
    if id < 0 {
        return "", ErrPermission
    }
    return "item-42", nil
}
\`\`\`

\`\`\`go
item, err := Lookup(0)
if err == ErrNotFound {
    fmt.Println("no such item, maybe create one")
}
\`\`\`

By convention, sentinel error names start with \`Err\`. The standard library follows this too — \`sql.ErrNoRows\`, \`io.EOF\`.

### Custom error types — carrying structured data

A plain string can only tell you *that* something failed. A custom error **type** — a struct implementing \`Error() string\` — can carry structured data about *what* failed, letting callers programmatically inspect it instead of parsing a message string.

\`\`\`go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

func ValidateAge(age int) error {
    if age < 0 {
        return &ValidationError{Field: "age", Message: "must not be negative"}
    }
    if age > 150 {
        return &ValidationError{Field: "age", Message: "unrealistically large"}
    }
    return nil
}
\`\`\`

Calling code can now recover the structured fields (using a type assertion, covered fully in the next lesson):

\`\`\`go
err := ValidateAge(-5)
if ve, ok := err.(*ValidationError); ok {
    fmt.Println("bad field:", ve.Field)
}
\`\`\`

### Choosing between the three approaches

| Approach | Use when |
|---|---|
| \`errors.New("message")\` | A simple, one-off failure with no useful metadata |
| \`fmt.Errorf("...: %v", val)\` | You need to interpolate dynamic values into the message |
| Sentinel \`var ErrX = errors.New(...)\` | Callers need to check *which specific* known failure occurred |
| Custom struct implementing \`Error()\` | Callers need structured data about the failure (field name, status code, retry hint, etc.) |

> **Key idea:** Start with \`errors.New\` or \`fmt.Errorf\` for simple cases. Reach for sentinel errors when callers need to branch on "which error," and a custom error type when callers need more than just a message — actual structured data about the failure.`,
    },
    {
      name: "Wrapping and Inspecting Errors",
      minutes: 10,
      intro: "Keep the original error alive as it travels up the call stack, with context attached.",
      content: `## The problem: losing context

Imagine an error bubbling up through three function calls. If each layer just returns a brand-new \`errors.New\`, you lose all information about what actually failed at the bottom.

\`\`\`go
func readConfig() error {
    _, err := os.Open("config.yaml")
    if err != nil {
        return errors.New("could not read config") // original err is thrown away!
    }
    return nil
}
\`\`\`

The caller of \`readConfig\` now has no idea *why* it failed — file missing? permissions? disk full? All that detail was in the original \`err\`, and it just got discarded.

### Wrapping with %w

\`fmt.Errorf\` has a special verb, \`%w\`, that **wraps** an existing error instead of just stringifying it. The result is a new error whose message includes the original, while still keeping the original error retrievable.

\`\`\`go
func readConfig() error {
    _, err := os.Open("config.yaml")
    if err != nil {
        return fmt.Errorf("reading config: %w", err)
    }
    return nil
}
\`\`\`

If \`os.Open\` failed because the file doesn't exist, the wrapped error's message becomes something like:

\`\`\`
reading config: open config.yaml: no such file or directory
\`\`\`

Each layer adds its own context while preserving the original underlying cause — a chain, not a replacement.

### errors.Is — checking against a sentinel through the chain

\`errors.Is\` walks the whole wrap chain looking for a match, instead of comparing only the outermost error:

\`\`\`go
err := readConfig()
if errors.Is(err, os.ErrNotExist) {
    fmt.Println("config file is missing — using defaults")
}
\`\`\`

This works even though \`readConfig\` wrapped the original \`os.ErrNotExist\` inside a new message — a plain \`==\` comparison would fail here, but \`errors.Is\` unwraps layer by layer until it finds a match (or doesn't).

### errors.As — extracting a typed error through the chain

\`errors.As\` is the wrap-aware version of the type assertion from the previous lesson. It walks the chain looking for an error of a specific *type*, and if found, populates a variable of that type:

\`\`\`go
var ve *ValidationError
if errors.As(err, &ve) {
    fmt.Println("bad field:", ve.Field)
}
\`\`\`

Even if \`err\` is actually \`fmt.Errorf("processing form: %w", validationErr)\`, \`errors.As\` digs through the wrapping to find the \`*ValidationError\` underneath.

### errors.Unwrap — the mechanism underneath

Both \`errors.Is\` and \`errors.As\` are built on \`errors.Unwrap\`, which any wrapped error exposes because \`fmt.Errorf\` with \`%w\` generates a type implementing:

\`\`\`go
type unwrapper interface {
    Unwrap() error
}
\`\`\`

You'll rarely call \`errors.Unwrap\` directly, but it's useful to know it's what \`Is\` and \`As\` call in a loop internally — one layer at a time — until they find a match or hit \`nil\`.

\`\`\`go
err := fmt.Errorf("layer 2: %w", fmt.Errorf("layer 1: %w", os.ErrNotExist))
fmt.Println(errors.Unwrap(err)) // "layer 1: file does not exist"
\`\`\`

### Quick reference

| Function | Purpose |
|---|---|
| \`fmt.Errorf("...: %w", err)\` | Wrap \`err\` with additional context, preserving it in the chain |
| \`errors.Is(err, target)\` | "Is \`target\` anywhere in this error's chain?" — for sentinel errors |
| \`errors.As(err, &target)\` | "Is there an error of this type anywhere in the chain? If so, extract it." |
| \`errors.Unwrap(err)\` | Peel off exactly one layer of wrapping |

> **Key idea:** Wrap errors with \`%w\` as they cross function boundaries so context accumulates instead of getting lost, and always use \`errors.Is\`/\`errors.As\` — never \`==\` or a bare type assertion — to inspect an error that might have been wrapped.`,
    },
    {
      name: "panic, recover, and When to Use Them",
      minutes: 9,
      intro: "Reserved for programmer bugs, not expected failures — and rarely used at all.",
      content: `## panic: stopping the program immediately

\`panic\` immediately halts normal execution of the current function, runs any deferred calls, then does the same in its caller, and so on up the stack — unwinding until either something \`recover\`s, or the program crashes with a stack trace.

\`\`\`go
func mustPositive(n int) int {
    if n < 0 {
        panic("mustPositive: n must not be negative")
    }
    return n
}
\`\`\`

\`\`\`go
mustPositive(-5)
// panic: mustPositive: n must not be negative
// [stack trace...]
// program exits with a non-zero status
\`\`\`

### recover: catching a panic

\`recover\` stops an in-progress panic — but only if called **directly inside a deferred function**. Anywhere else, it does nothing.

\`\`\`go
func safeCall() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("recovered from panic:", r)
        }
    }()

    panic("something went badly wrong")
}

func main() {
    safeCall()
    fmt.Println("program continues normally")
}
\`\`\`

Output:

\`\`\`
recovered from panic: something went badly wrong
program continues normally
\`\`\`

Without the \`defer\`/\`recover\` pair, that same \`panic\` would have crashed the whole program.

### Why idiomatic Go rarely panics

Coming from languages with exceptions, it's tempting to reach for \`panic\`/\`recover\` as a drop-in replacement for try/catch. Don't — idiomatic Go treats them very differently from ordinary errors.

| Use \`error\` for... | Use \`panic\` for... |
|---|---|
| Expected, recoverable failures: file not found, network timeout, invalid user input | Programmer bugs that should never happen if the code is correct: nil dereference, index out of range, broken invariants |
| Anything a caller could reasonably want to handle and continue past | Situations where continuing would be unsafe or meaningless |
| The normal, everyday path through your API | The exceptional, "this should be impossible" path |

A function like \`Divide(a, b float64)\` should return an \`error\` for \`b == 0\` — that's an entirely expected input a caller might pass. It should **not** \`panic\`, because the caller has no reasonable way to "catch" a panic mid-computation the way they can check an \`error\`.

### A safe wrapper using recover

One legitimate use of \`recover\` is at a boundary — say, a goroutine or an HTTP handler — where you want one failing unit of work to not take down the whole program, and you're willing to convert an unexpected panic back into an ordinary error:

\`\`\`go
func safeRun(f func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered from panic: %v", r)
        }
    }()
    f()
    return nil
}
\`\`\`

\`\`\`go
err := safeRun(func() {
    var m map[string]int
    m["key"] = 1 // panics: assignment to entry in nil map
})
if err != nil {
    fmt.Println("caught:", err)
}
\`\`\`

This pattern shows up in web servers: a single handler panicking (say, from an unexpected nil somewhere deep in the code) gets recovered by middleware and converted into a 500 response, instead of crashing the entire server process for every other in-flight request.

### The rule of thumb

- Library code should almost never \`panic\` — return an \`error\` instead, so callers can decide what to do.
- \`panic\` is acceptable for truly unrecoverable setup failures (e.g. a required config file is malformed at startup) where continuing makes no sense.
- \`recover\` belongs at a narrow, deliberate boundary — not sprinkled throughout your code as a substitute for checking errors.

> **Key idea:** \`error\` is for things you expect might go wrong; \`panic\` is for things that should be impossible if your code is correct. Reach for \`recover\` only at deliberate boundaries, never as your everyday error-handling strategy.`,
    },
  ],
}
