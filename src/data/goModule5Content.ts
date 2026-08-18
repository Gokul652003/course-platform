import type { Module } from "../types"

export const goModule5: Module = {
  id: 5,
  title: "Interfaces & Polymorphism",
  status: "upcoming",
  lessons: [
    {
      name: "Defining and Implementing Interfaces",
      minutes: 10,
      intro: "Go interfaces are satisfied implicitly — no \`implements\` keyword required.",
      content: `## What an interface is

An interface in Go is a **set of method signatures**. Any type that has methods matching that set automatically satisfies the interface — there's no explicit declaration linking a type to an interface.

\`\`\`go
type Shape interface {
    Area() float64
}
\`\`\`

That's it. \`Shape\` says: "anything with an \`Area() float64\` method counts as a Shape."

### Implicit satisfaction

This is the single biggest difference from Java, C#, or Kotlin. You never write \`class Circle implements Shape\`. You just give \`Circle\` the right methods, and the compiler figures out the rest.

\`\`\`go
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
\`\`\`

Neither \`Circle\` nor \`Rectangle\` mentions \`Shape\` anywhere. They satisfy it purely by having the right method signature.

### Using the interface

\`\`\`go
func describe(s Shape) {
    fmt.Printf("Area: %.2f\\n", s.Area())
}

func main() {
    shapes := []Shape{
        Circle{Radius: 2},
        Rectangle{Width: 3, Height: 4},
    }

    for _, s := range shapes {
        describe(s)
    }
}
\`\`\`

\`describe\` doesn't know or care whether it received a \`Circle\` or a \`Rectangle\`. It only knows it got something with an \`Area() float64\` method. That's polymorphism — one function, many concrete behaviors.

### Why implicit satisfaction matters

| Explicit (Java-style) | Implicit (Go-style) |
|---|---|
| Type must declare \`implements Interface\` at definition time | Type just needs the right methods — no declaration |
| Interface must exist before the type is written | You can define an interface *after* the type, in a totally different package |
| Adding a new interface to an old type requires editing that type | Adding a new interface anywhere just requires the type to already have matching methods |

This decouples the *provider* of a type from the *consumer* who defines what shape they need. A caller can define a tiny interface describing exactly the behavior it needs, and any existing type — even one from a third-party library you can't edit — satisfies it automatically as long as the method signatures line up.

### A second implementer, no changes needed elsewhere

\`\`\`go
type Square struct {
    Side float64
}

func (s Square) Area() float64 {
    return s.Side * s.Side
}
\`\`\`

\`Square\` now also satisfies \`Shape\`, and nothing about \`Shape\`, \`describe\`, \`Circle\`, or \`Rectangle\` had to change. This is what "decoupling" buys you: consumers and producers evolve independently.

### Interface values hold type + value

Under the hood, a variable of interface type stores both the concrete type and the concrete value. That's how \`s.Area()\` knows which \`Area\` method to actually call at runtime — this is Go's version of dynamic dispatch.

\`\`\`go
var s Shape = Circle{Radius: 5}
fmt.Printf("%T\\n", s) // main.Circle
\`\`\`

> **Key idea:** In Go, you design to behavior, not to hierarchy. A type satisfies an interface just by having the right methods — no explicit binding, no inheritance chain, no keyword. Define small interfaces where you need them, and let existing types satisfy them for free.`,
    },
    {
      name: "The Empty Interface and any",
      minutes: 8,
      intro: "interface{} accepts anything — which is exactly why you should reach for it sparingly.",
      content: `## The interface with zero methods

\`interface{}\` is an interface with **no method requirements at all**. Since every type has at least zero methods, *every value in Go* satisfies \`interface{}\`.

\`\`\`go
var anything interface{}

anything = 42
anything = "hello"
anything = []int{1, 2, 3}
anything = Circle{Radius: 1}
\`\`\`

### The any alias

Since Go 1.18, \`any\` is a built-in alias for \`interface{}\`. They are identical — \`any\` just reads better.

\`\`\`go
var anything any = 42   // exactly the same as interface{}
\`\`\`

Idiomatic modern Go uses \`any\` everywhere \`interface{}\` used to appear.

### Where you'll see it

**Variadic functions that print or format anything:**

\`\`\`go
func Println(a ...any) (n int, err error)
\`\`\`

This is why \`fmt.Println(1, "two", 3.0, true)\` compiles — every argument, regardless of type, satisfies \`any\`.

**Generic-ish containers, pre-generics:**

Before Go 1.18 introduced real generics, a "container that holds anything" had to use \`interface{}\`:

\`\`\`go
type Box struct {
    Value interface{}
}

b := Box{Value: "a string"}
b2 := Box{Value: 99}
\`\`\`

You'll still see this pattern in older codebases and in places like \`encoding/json\`, where a JSON value's shape isn't known until runtime:

\`\`\`go
var data map[string]any
json.Unmarshal(body, &data)
\`\`\`

### The cost: you lose the compiler's help

The moment a value becomes \`any\`, the compiler can no longer check what you do with it. This code compiles fine and blows up at runtime:

\`\`\`go
func process(v any) {
    n := v.(int) // panics if v isn't actually an int
    fmt.Println(n * 2)
}

process("not a number") // compiles, panics at runtime
\`\`\`

Compare that to a typed parameter, where the same mistake is caught before the program ever runs:

\`\`\`go
func process(n int) {
    fmt.Println(n * 2)
}

process("not a number") // compile error, caught immediately
\`\`\`

| Using a concrete/specific type | Using \`any\` |
|---|---|
| Compiler checks usage at compile time | Errors surface only at runtime |
| Editor autocompletion works fully | No autocompletion — could be anything |
| Self-documenting signature | Signature says nothing about what's expected |
| Preferred whenever the type is knowable | Reserve for truly type-agnostic cases (formatting, generic containers, JSON) |

### Prefer generics or a specific interface first

Since Go 1.18, most places that used to reach for \`interface{}\` as a "hold anything" generic container are better served by **type parameters** (generics), which keep compile-time checking:

\`\`\`go
func First[T any](items []T) T {
    return items[0]
}
\`\`\`

Note \`any\` still appears here — but as a *constraint* on a type parameter, not as the parameter's actual runtime type. The compiler still enforces that every call to \`First\` uses one consistent, concrete \`T\`.

> **Key idea:** \`any\` (a.k.a. \`interface{}\`) means "I accept literally anything," which also means "the compiler can no longer help you." Use it only where the code genuinely must be type-agnostic — printing, serialization, truly generic containers — and prefer a specific type, interface, or type parameter everywhere else.`,
    },
    {
      name: "Type Assertions and Type Switches",
      minutes: 10,
      intro: "Recover the concrete type hiding inside an interface value — safely.",
      content: `## Getting the concrete type back out

Once a value is stored in an interface (like \`any\`), you often need to know its actual underlying type again. Go gives you two tools: **type assertions** and **type switches**.

### The unsafe, single-value form

\`\`\`go
var x any = "hello"

s := x.(string) // works, s is "hello"
n := x.(int)    // panics! x does not hold an int
\`\`\`

\`x.(int)\` asserts "I'm certain \`x\` holds an \`int\`." If you're wrong, the program **panics** and crashes (unless recovered — see the next lesson). Never use the single-value form unless you are absolutely certain of the type.

### The safe, comma-ok form

\`\`\`go
v, ok := x.(int)
if !ok {
    fmt.Println("x is not an int")
} else {
    fmt.Println("got int:", v)
}
\`\`\`

\`ok\` is \`true\` if the assertion succeeded, \`false\` otherwise. On failure, \`v\` is simply the zero value of the asserted type — no panic. This is the idiomatic way to do a type assertion whenever you're not 100% sure of the type.

\`\`\`go
func printLength(x any) {
    if s, ok := x.(string); ok {
        fmt.Println("string of length", len(s))
        return
    }
    fmt.Println("not a string")
}
\`\`\`

### Type switches — checking against many types at once

When you need to branch on several possible types, a **type switch** is cleaner than a chain of \`if\`/\`ok\` assertions:

\`\`\`go
func describe(x any) {
    switch v := x.(type) {
    case int:
        fmt.Printf("int: %d\\n", v)
    case string:
        fmt.Printf("string: %q\\n", v)
    case bool:
        fmt.Printf("bool: %t\\n", v)
    case []int:
        fmt.Printf("slice of %d ints\\n", len(v))
    case nil:
        fmt.Println("x is nil")
    default:
        fmt.Printf("unknown type: %T\\n", v)
    }
}
\`\`\`

Inside each \`case\`, \`v\` has the **specific type of that case** — in the \`int\` branch, \`v\` is an \`int\`; in the \`string\` branch, \`v\` is a \`string\`. The compiler narrows the type for you per-branch, similar to \`when\` with smart-casting in Kotlin.

### Type switch on interfaces, not just concrete types

A \`case\` can also be an interface type, which matches if the underlying concrete type satisfies that interface:

\`\`\`go
func report(x any) {
    switch v := x.(type) {
    case Shape:
        fmt.Println("shape with area", v.Area())
    default:
        fmt.Println("not a shape")
    }
}
\`\`\`

### Assertion vs switch — when to use which

| Situation | Tool |
|---|---|
| Checking for exactly one possible type | Comma-ok assertion (\`v, ok := x.(T)\`) |
| Branching across three or more possible types | Type switch |
| You are certain of the type and a wrong guess should be a bug | Single-value assertion \`x.(T)\` (rare — usually still prefer comma-ok) |

> **Key idea:** Never use a bare \`x.(T)\` assertion unless a failure would mean a genuine programmer bug you *want* to crash loudly. Reach for the comma-ok form or a type switch anywhere the type is truly dynamic.`,
    },
    {
      name: "Interface Design Idioms",
      minutes: 10,
      intro: "Small interfaces, concrete returns — the shape of idiomatic Go APIs.",
      content: `## "Accept interfaces, return structs"

This is one of the most quoted Go proverbs, and it drives most well-designed Go APIs.

- **Function parameters** should accept the narrowest interface that covers what the function needs — this makes the function usable with the widest range of callers.
- **Function return values** should be concrete types (structs) — this gives the *caller* full access to every field and method, and lets them decide later how much to abstract away.

\`\`\`go
// Good: accepts an interface, so it works with files, network
// connections, buffers, or anything else that can be read from.
func CountLines(r io.Reader) (int, error) {
    // ...
}

// Good: returns a concrete struct — the caller gets full access
// to every field and method of Client, not just some subset.
func NewClient(addr string) *Client {
    return &Client{addr: addr}
}
\`\`\`

If \`NewClient\` returned an interface instead, callers would be stuck with whatever subset of behavior that interface exposed — even though the underlying \`*Client\` might have many more useful methods.

### Small, single-method interfaces

Go's standard library is built almost entirely from tiny interfaces — often just one method. The two most famous:

\`\`\`go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
\`\`\`

\`io.Reader\` and \`io.Writer\` are satisfied by files, network sockets, in-memory buffers, compressors, and countless other types — because the contract is tiny, almost anything can implement it, and functions written against it work with all of them for free.

\`\`\`go
func Copy(dst Writer, src Reader) (int64, error)
\`\`\`

\`io.Copy\` works identically whether you're copying a file to a network connection, a buffer to a file, or stdin to stdout — because it only ever asks for \`Read\` and \`Write\`.

### Composing small interfaces into bigger ones

Because interfaces are cheap, Go composes them by embedding rather than by writing one big interface upfront:

\`\`\`go
type ReadWriter interface {
    Reader
    Writer
}
\`\`\`

Anything satisfying both \`Read\` and \`Write\` automatically satisfies \`ReadWriter\` too — no extra work.

### Many tiny interfaces vs. one big interface

| Few large interfaces | Many small interfaces (Go idiom) |
|---|---|
| Implementers must provide every method, even unused ones | Implementers only provide what they actually support |
| Hard to satisfy by accident — tight coupling | Easy to satisfy — decoupled, flexible |
| One interface tries to describe an entire type | Each interface describes one capability |
| Common in Java/C# style OOP | Common in Go, functional-influenced design |

The rule of thumb: **the consumer defines the interface**, and it should ask for the minimum it actually needs. A function that only reads shouldn't demand a full \`ReadWriteCloser\` — it should ask for a plain \`Reader\`.

### Implementing Stringer for custom formatting

The \`fmt\` package looks for one specific single-method interface to control how a value prints:

\`\`\`go
type Stringer interface {
    String() string
}
\`\`\`

\`\`\`go
type Point struct {
    X, Y int
}

func (p Point) String() string {
    return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

func main() {
    p := Point{X: 3, Y: 4}
    fmt.Println(p) // prints: (3, 4)
}
\`\`\`

Without \`String()\`, \`fmt.Println(p)\` would print the default struct dump \`{3 4}\`. Implementing \`Stringer\` is the idiomatic way to control how your types render in logs, errors, and debug output.

> **Key idea:** Design interfaces from the consumer's point of view, keep them as small as possible — ideally one method — and return concrete types from constructors so callers keep full access. Small interfaces compose; big interfaces just constrain.`,
    },
  ],
}
