import type { Module } from "../types"

export const goModule1: Module = {
  id: 1,
  title: "Hello, Go",
  status: "in_progress",
  lessons: [
    {
      name: "Go Setup + First Program",
      minutes: 10,
      intro: "Install Go, understand modules vs GOPATH, and print your first line.",
      content: `## Installing Go on Linux

There are three common ways to get Go on a Linux machine. Pick whichever fits your setup — they all end with the same \`go\` binary on your \`PATH\`.

### Option 1: apt (Debian/Ubuntu)

\`\`\`bash
sudo apt update
sudo apt install golang-go
\`\`\`

This is the quickest path, but distro repositories often lag behind the latest Go release.

### Option 2: snap

\`\`\`bash
sudo snap install go --classic
\`\`\`

### Option 3: official tarball (recommended for the newest version)

\`\`\`bash
curl -OL https://go.dev/dl/go1.22.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.linux-amd64.tar.gz

# add this to ~/.bashrc or ~/.zshrc
export PATH=$PATH:/usr/local/go/bin
\`\`\`

Whichever route you take, confirm the install:

\`\`\`bash
go version
# go version go1.22.0 linux/amd64
\`\`\`

### GOPATH vs Go modules

Old Go tutorials talk a lot about \`GOPATH\` — a single workspace directory where all your Go code had to live. That model is **legacy**. Since Go 1.11, projects use **Go modules**, which let you keep code anywhere on disk and track dependencies in a \`go.mod\` file, similar to \`package.json\` or \`build.gradle\`.

You'll almost never need to think about \`GOPATH\` day to day — just know the term if you see it in older docs.

### Your first program

Create a folder and a file named \`hello.go\`:

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
\`\`\`

- \`package main\` marks this file as belonging to an **executable** package (as opposed to a reusable library package). Only a \`main\` package can produce a runnable binary.
- \`import "fmt"\` pulls in the standard library's formatting/printing package.
- \`func main()\` is the **entry point** — like Kotlin's \`main\`, Go looks for exactly this function in package \`main\` and runs it first.

### Running it

\`\`\`bash
go run hello.go
# Hello, Go!
\`\`\`

\`go run\` compiles the file to a temporary binary and executes it in one step — perfect while you're learning.

### Building a real binary

\`\`\`bash
go build hello.go
./hello
\`\`\`

\`go build\` produces a standalone, statically-linked executable named \`hello\` (no runtime or interpreter needed to run it later — that's a big part of Go's appeal for deployment).

### Setting up a module

Most real projects start with:

\`\`\`bash
mkdir myapp && cd myapp
go mod init myapp
\`\`\`

This creates a \`go.mod\` file that names your module and pins the Go version and dependencies.

> **Key idea:** \`package main\` + \`func main()\` is the only combination Go will compile into a runnable program. Everything else you write is a library package that other code imports.`,
    },
    {
      name: "Variables & Constants",
      minutes: 9,
      intro: "Declare values two ways, meet zero values, and build enums with iota.",
      content: `### Declaring variables with var

The \`var\` keyword declares a variable with an explicit or inferred type:

\`\`\`go
var name string = "Gokul"
var age int = 28
var isAdmin bool // type given, no value — gets the zero value
\`\`\`

You can drop the type when there's an initial value to infer from:

\`\`\`go
var city = "Bengaluru" // inferred as string
\`\`\`

### The short declaration :=

Inside a function, \`:=\` is the idiomatic way to declare and initialize in one step — no \`var\`, no type:

\`\`\`go
func main() {
    name := "Gokul"
    age := 28
    fmt.Println(name, age)
}
\`\`\`

\`:=\` **only works inside functions**, and only when you're declaring at least one new variable. At package level you must use \`var\`.

### Zero values

Unlike some languages, Go never leaves a declared variable in an undefined state. Every type has a **zero value** it gets automatically:

| Type | Zero value |
|------|------------|
| \`int\`, \`float64\` | \`0\` |
| \`string\` | \`""\` (empty string) |
| \`bool\` | \`false\` |
| pointers, slices, maps, channels, funcs, interfaces | \`nil\` |

\`\`\`go
var count int    // 0
var label string // ""
var active bool  // false
\`\`\`

### const

\`const\` declares a compile-time constant. It can never be reassigned, and — unlike \`var\` — its value must be knowable at compile time:

\`\`\`go
const Pi = 3.14159
const AppName = "GoLearn"

// const start = time.Now() // ERROR: not a constant expression
\`\`\`

### iota for enum-like constants

Go has no built-in \`enum\` keyword. Instead, \`iota\` gives you an auto-incrementing counter inside a \`const\` block, starting at 0:

\`\`\`go
type Weekday int

const (
    Sunday Weekday = iota // 0
    Monday                // 1
    Tuesday                // 2
    Wednesday               // 3
    Thursday                // 4
    Friday                  // 5
    Saturday                // 6
)

fmt.Println(Wednesday) // 3
\`\`\`

Each line without an explicit value reuses the previous line's expression with \`iota\` bumped by one — this is how Go simulates enums cheaply.

### Multiple assignment

Go lets you declare or assign several variables in one line, which is especially handy for swaps:

\`\`\`go
a, b := 1, 2
a, b = b, a // swap — no temp variable needed
fmt.Println(a, b) // 2 1

x, y, z := "one", 2, true
\`\`\`

> **Key idea:** Use \`:=\` for local variables whose type is obvious from the right-hand side, \`var\` when you need a specific type or a package-level declaration, and \`const\` + \`iota\` whenever you'd reach for an enum in another language.`,
    },
    {
      name: "Basic Types & Type Conversion",
      minutes: 10,
      intro: "Meet Go's numeric zoo, strings, bytes, runes — and why nothing converts for free.",
      content: `### The numeric types

Go is explicit about integer size, which matters for memory layout and overflow behavior:

| Type | Size | Range (signed) |
|------|------|-----------------|
| \`int8\` | 8-bit | -128 to 127 |
| \`int16\` | 16-bit | -32,768 to 32,767 |
| \`int32\` | 32-bit | ~-2.1B to 2.1B |
| \`int64\` | 64-bit | very large |
| \`int\` | 32 or 64-bit (platform dependent) | usually 64-bit on modern machines |

There are unsigned mirrors of each — \`uint8\`, \`uint16\`, \`uint32\`, \`uint64\`, and plain \`uint\` — which can only hold non-negative numbers but get double the positive range.

\`\`\`go
var small int8 = 120
var big int64 = 9_000_000_000
var count uint = 42
\`\`\`

In everyday code you'll mostly just use plain \`int\` unless you have a specific reason (binary protocols, huge counters, memory-constrained structs) to pick a narrower or unsigned type.

### Floating point

\`\`\`go
var price float32 = 19.99
var pi float64 = 3.14159265358979
\`\`\`

\`float64\` is the default for decimal literals and what you should reach for unless you're optimizing memory in bulk (e.g. large arrays of graphics data).

### string, bool

\`\`\`go
var greeting string = "hello"
var done bool = false
\`\`\`

Strings in Go are immutable sequences of bytes, usually holding UTF-8 text.

### byte and rune — the two aliases

Go defines two type aliases that trip up newcomers:

\`\`\`go
// byte is an alias for uint8 — one raw byte of data
var b byte = 'A' // 65

// rune is an alias for int32 — one Unicode code point
var r rune = '世' // a single character, potentially multi-byte in UTF-8
\`\`\`

This distinction matters because a \`string\` is stored as bytes, but a real-world character (especially outside ASCII) can take more than one byte. Ranging over a string with \`for range\` yields runes, not raw bytes:

\`\`\`go
for i, ch := range "héllo" {
    fmt.Printf("%d: %c\\n", i, ch)
}
// index jumps by more than 1 after a multi-byte character
\`\`\`

### No implicit conversion — ever

This is the single biggest surprise coming from most other languages. Go will **not** silently widen an \`int\` to a \`float64\`, or narrow a \`float64\` to an \`int\`. Mixing types in an expression is a compile error:

\`\`\`go
var i int = 10
var f float64 = 3.5

// result := i + f // ERROR: mismatched types int and float64

result := float64(i) + f // OK — explicit conversion
fmt.Println(result)      // 13.5
\`\`\`

Conversions use the target type as a function-call-looking syntax:

\`\`\`go
i := 42
f := float64(i)   // int -> float64
u := uint(f)       // float64 -> uint (truncates the decimal part)
s := string(rune(65)) // int -> rune -> string: "A"
\`\`\`

Truncation, not rounding, happens when converting a float to an int:

\`\`\`go
n := int(9.99) // 9, not 10
\`\`\`

> **Key idea:** Go trades a little typing convenience for a lot of safety — every numeric conversion is spelled out at the call site, so you can never lose precision or wrap around by accident.`,
    },
    {
      name: "Operators & Formatting",
      minutes: 9,
      intro: "Every operator Go has, plus fmt's Println, Printf, and Sprintf.",
      content: `### Arithmetic operators

\`\`\`go
a, b := 17, 5

a + b // 22
a - b // 12
a * b // 85
a / b // 3   (int division truncates)
a % b // 2   (remainder)
\`\`\`

Just like the type-conversion rule, integer division truncates toward zero — use \`float64\` operands if you need a fractional result:

\`\`\`go
result := float64(a) / float64(b) // 3.4
\`\`\`

### Comparison operators

\`\`\`go
a == b // equal
a != b // not equal
a > b
a < b
a >= b
a <= b
\`\`\`

### Logical operators

\`\`\`go
sunny := true
warm := false

sunny && warm // false — AND
sunny || warm // true  — OR
!sunny        // false — NOT
\`\`\`

Like most C-family languages, \`&&\` and \`||\` short-circuit: the right side isn't evaluated if the left side already determines the result.

### Bitwise operators

| Operator | Meaning |
|----------|---------|
| \`&\` | AND |
| \`\\|\` | OR |
| \`^\` | XOR (also unary NOT when used as a prefix) |
| \`&^\` | AND NOT (bit clear — unique to Go) |
| \`<<\` | left shift |
| \`>>\` | right shift |

\`\`\`go
x := 0b1010 // 10
y := 0b0110 // 6

x & y  // 0010 -> 2
x | y  // 1110 -> 14
x ^ y  // 1100 -> 12
x &^ y // 1000 -> 8  (clears bits set in y)
x << 1 // 20
\`\`\`

### Printing with fmt

Go's \`fmt\` package is your window into every value. Three functions cover almost everything:

\`\`\`go
fmt.Println("hello", 42, true) // hello 42 true  (adds spaces + newline)
fmt.Printf("name=%s age=%d\\n", "Gokul", 28)
line := fmt.Sprintf("total: %d", 99) // returns a string instead of printing
\`\`\`

### Common Printf verbs

| Verb | Meaning |
|------|---------|
| \`%d\` | integer |
| \`%s\` | string |
| \`%v\` | default format for any value |
| \`%+v\` | default format, but include struct field names |
| \`%T\` | the Go type of the value |
| \`%f\` | floating point (\`%.2f\` for 2 decimal places) |
| \`%t\` | boolean |
| \`%c\` | a rune as its character |

\`\`\`go
type Point struct{ X, Y int }
p := Point{3, 4}

fmt.Printf("%v\\n", p)  // {3 4}
fmt.Printf("%+v\\n", p) // {X:3 Y:4}
fmt.Printf("%T\\n", p)  // main.Point
fmt.Printf("%.2f\\n", 3.14159) // 3.14
\`\`\`

> **Key idea:** Reach for \`Println\` for quick debugging, \`Printf\` when you need precise formatting, and \`Sprintf\` when you need the formatted text as a string instead of printed output.`,
    },
  ],
}
