import type { Module } from "../types"

export const goModule15: Module = {
  id: 15,
  title: "Generics & Advanced Go",
  status: "upcoming",
  lessons: [
    {
      name: "Introduction to Generics",
      minutes: 10,
      intro: "Write one function that works across types, without giving up type safety.",
      content: `## The problem generics solve

Before Go 1.18, writing a \`Max\` function meant either duplicating it for every type, or falling back to \`interface{}\` and losing compile-time type checking.

\`\`\`go
func MaxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func MaxFloat64(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}
// ...and again for every other type you need
\`\`\`

Or the \`interface{}\` escape hatch, which pushes the type check to runtime:

\`\`\`go
func Max(a, b interface{}) interface{} {
	// now you need a type switch, and callers get back interface{}
	// with no compile-time guarantee about what's inside
}
\`\`\`

**Generics**, added in Go 1.18, solve this properly: one function definition, checked by the compiler, for any type that satisfies a constraint.

### Type parameters

\`\`\`go
func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}
\`\`\`

- \`[T cmp.Ordered]\` declares a **type parameter** \`T\`, constrained to types that support \`<\`, \`>\`, etc. (numbers and strings)
- The rest of the function reads exactly like the single-type version — no \`interface{}\`, no type assertions

Calling it:

\`\`\`go
fmt.Println(Max(3, 7))         // T inferred as int    -> 7
fmt.Println(Max(3.5, 1.2))     // T inferred as float64 -> 3.5
fmt.Println(Max("go", "rust")) // T inferred as string  -> "rust"
\`\`\`

The compiler infers \`T\` from the arguments — you rarely have to write \`Max[int](3, 7)\` explicitly.

### The comparable constraint

A different built-in constraint, \`comparable\`, restricts \`T\` to types that support \`==\` and \`!=\`:

\`\`\`go
func Contains[T comparable](items []T, target T) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}
\`\`\`

\`\`\`go
Contains([]int{1, 2, 3}, 2)              // true
Contains([]string{"a", "b"}, "z")        // false
\`\`\`

\`comparable\` is broader than \`cmp.Ordered\` — structs and most types qualify for \`==\`, but not for \`<\`/\`>\`.

### Constraint vs concrete type

| Concept | Example | Meaning |
|---------|---------|---------|
| Concrete type | \`int\`, \`string\`, \`User\` | One specific type |
| Type parameter | \`T\`, \`K\`, \`V\` | A placeholder, filled in per call |
| Constraint | \`comparable\`, \`cmp.Ordered\`, \`any\` | What operations \`T\` must support |

\`any\` (an alias for \`interface{}\`) is the loosest constraint — "any type at all" — useful when the function never needs to compare or operate on the values, just store and return them.

### Why this matters

Generics remove an entire category of Go boilerplate: no more hand-written \`IntSlice\`, \`StringSlice\`, \`FloatSlice\` variants of the same logic, and no more runtime type assertions that the compiler can't check for you. Code stays both reusable *and* type-safe.

> **Key idea:** Type parameters like \`[T cmp.Ordered]\` let one function body work across many types, checked at compile time — replacing the old choice between duplicating code per type or giving up type safety with \`interface{}\`.`,
    },
    {
      name: "Generic Functions and Data Structures",
      minutes: 12,
      intro: "Build reusable Map, Filter, Reduce, and a generic Stack — then meet the standard library that already has them.",
      content: `## Generic slice helpers

Three functions come up in almost every language with generics: transform each element, keep only some, and combine them into one value.

### Map

\`\`\`go
func Map[T, U any](items []T, fn func(T) U) []U {
	result := make([]U, len(items))
	for i, item := range items {
		result[i] = fn(item)
	}
	return result
}
\`\`\`

\`\`\`go
nums := []int{1, 2, 3, 4}
doubled := Map(nums, func(n int) int { return n * 2 })
// [2 4 6 8]

names := Map(nums, func(n int) string { return fmt.Sprintf("#%d", n) })
// [#1 #2 #3 #4]
\`\`\`

\`Map\` uses **two** type parameters, \`T\` and \`U\`, because the input and output element types can differ — here \`[]int\` goes in, \`[]string\` comes out.

### Filter

\`\`\`go
func Filter[T any](items []T, predicate func(T) bool) []T {
	var result []T
	for _, item := range items {
		if predicate(item) {
			result = append(result, item)
		}
	}
	return result
}
\`\`\`

\`\`\`go
evens := Filter(nums, func(n int) bool { return n%2 == 0 })
// [2 4]
\`\`\`

### Reduce

\`\`\`go
func Reduce[T, U any](items []T, initial U, fn func(U, T) U) U {
	acc := initial
	for _, item := range items {
		acc = fn(acc, item)
	}
	return acc
}
\`\`\`

\`\`\`go
sum := Reduce(nums, 0, func(acc, n int) int { return acc + n })
// 10
\`\`\`

### A generic Stack

Generics aren't just for functions — types can take type parameters too:

\`\`\`go
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	last := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return last, true
}
\`\`\`

\`\`\`go
var s Stack[string]
s.Push("a")
s.Push("b")
top, ok := s.Pop() // "b", true
\`\`\`

\`var zero T\` gives the zero value of whatever \`T\` ends up being — \`0\` for \`int\`, \`""\` for \`string\`, \`nil\` for a pointer — without the function needing to know which.

### The standard library already has most of this

Go 1.21 added \`slices\`, \`maps\`, and \`cmp\` to the standard library, covering the most common generic operations so you rarely need to hand-write \`Map\`/\`Filter\`/\`Reduce\` yourself:

\`\`\`go
import "slices"

nums := []int{3, 1, 4, 1, 5}
slices.Sort(nums)                     // [1 1 3 4 5]
fmt.Println(slices.Contains(nums, 4)) // true
fmt.Println(slices.Max(nums))         // 5
fmt.Println(slices.Index(nums, 4))    // position of 4
\`\`\`

\`\`\`go
import "maps"

m := map[string]int{"a": 1, "b": 2}
keys := slices.Collect(maps.Keys(m))
\`\`\`

| Package | Provides |
|---------|----------|
| \`slices\` | \`Sort\`, \`Contains\`, \`Index\`, \`Max\`, \`Min\`, \`Reverse\`, \`Equal\`, and more |
| \`maps\` | \`Keys\`, \`Values\`, \`Equal\`, \`Clone\` |
| \`cmp\` | \`Ordered\` constraint, \`Compare\`, \`Less\` |

> **Key idea:** Write your own generic \`Map\`/\`Filter\`/\`Reduce\`/\`Stack[T]\` to understand how type parameters work — but for day-to-day code, check \`slices\`, \`maps\`, and \`cmp\` first, since Go 1.21+ already ships most of what you'd otherwise hand-roll.`,
    },
    {
      name: "Reflection",
      minutes: 9,
      intro: "Inspect types and values at runtime — a powerful tool used sparingly.",
      content: `## What reflection is for

Normally, Go code knows every type at compile time. **Reflection**, via the \`reflect\` package, lets a program inspect and manipulate values whose types are only known at runtime — the mechanism that makes generic-looking libraries like \`encoding/json\` work without generating code per type.

### TypeOf and ValueOf

\`\`\`go
package main

import (
	"fmt"
	"reflect"
)

func describe(v interface{}) {
	t := reflect.TypeOf(v)
	val := reflect.ValueOf(v)
	fmt.Printf("type: %s, value: %v, kind: %s\\n", t, val, t.Kind())
}

func main() {
	describe(42)
	describe("hello")
	describe(3.14)
}
\`\`\`

Output:

\`\`\`text
type: int, value: 42, kind: int
type: string, value: hello, kind: string
type: float64, value: 3.14, kind: float64
\`\`\`

- \`reflect.TypeOf(v)\` returns the runtime **type** — its name, kind, methods
- \`reflect.ValueOf(v)\` returns the runtime **value**, which you can read (and, carefully, modify)

### Inspecting a struct's fields

This is the piece that powers libraries like \`encoding/json\`: given an arbitrary struct, walk its fields and their tags.

\`\`\`go
type User struct {
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

func printFields(v interface{}) {
	t := reflect.TypeOf(v)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fmt.Printf("%s (%s) json tag: %q\\n",
			field.Name, field.Type, field.Tag.Get("json"))
	}
}
\`\`\`

\`\`\`text
Name (string) json tag: "name"
Email (string) json tag: "email"
\`\`\`

This is exactly how \`json.Marshal\` decides what key name to use for each field, without you writing a \`MarshalJSON\` method by hand.

### Why reflection is a scalpel, not a hammer

| | Normal Go code | Reflection |
|---|---|---|
| Type checking | Compile time | Runtime |
| Performance | Fast — no indirection | Slower — extra runtime bookkeeping |
| Readability | Explicit, IDE-friendly | Indirect — errors surface as panics, not compile failures |
| Typical user | Application code | Library/framework internals |

A reflection-based type error that would have been a one-line compiler message instead becomes a runtime panic, often several calls away from the actual mistake — harder to debug and only caught if your tests happen to exercise that path.

### When you'd actually reach for it

- Writing a generic serializer/deserializer (like \`encoding/json\` itself)
- Building a validation library that inspects arbitrary struct tags
- Writing test helpers like \`reflect.DeepEqual\` for comparing arbitrary values

For everyday application code — HTTP handlers, business logic, database access — you should almost never need \`reflect\` directly. If you catch yourself reaching for it in app code, a generic function or a well-designed interface usually does the same job more safely.

> **Key idea:** \`reflect.TypeOf\` and \`reflect.ValueOf\` let code inspect types and values it didn't know about at compile time — indispensable for library authors, but a last resort in everyday application code because it trades compile-time safety and speed for runtime flexibility.`,
    },
    {
      name: "Struct Tags, Build Tags, and go:embed",
      minutes: 10,
      intro: "Three compiler-level tools: metadata on fields, platform-specific files, and files baked into your binary.",
      content: `## Struct tags: metadata read by reflection

You've already used struct tags to control JSON field names:

\`\`\`go
type Config struct {
	Port    int    \`json:"port" env:"PORT"\`
	Debug   bool   \`json:"debug" env:"DEBUG"\`
}
\`\`\`

A struct tag is just a raw string attached to a field, sitting between backticks. It does nothing on its own — it's inert data until some code, usually via \`reflect\`, reads it with \`field.Tag.Get("json")\` (as seen in the previous lesson). Multiple tags can live side by side, space-separated, each read by whichever library cares about that key — \`encoding/json\` reads \`json:"..."\`, a config loader might read \`env:"..."\`, a validator might read \`validate:"..."\`.

### Build tags: compiling different files per platform

Sometimes you need different code for different operating systems or architectures. A **build constraint** at the top of a file tells the compiler when to include it:

\`\`\`go
//go:build linux

package main

func platformName() string {
	return "linux"
}
\`\`\`

\`\`\`go
//go:build windows

package main

func platformName() string {
	return "windows"
}
\`\`\`

The \`//go:build\` line must be the first thing in the file (only preceded by blank lines and other comments), followed by a blank line before \`package\`. \`go build\` automatically picks the matching file for the current \`GOOS\`/\`GOARCH\` and excludes the rest — both files can declare the same function name because only one is ever compiled in.

Filename suffixes are a shorthand for the same thing — \`server_linux.go\` is implicitly built only on Linux, no \`//go:build\` line required.

\`\`\`text
server_linux.go     // only builds on linux
server_windows.go   // only builds on windows
server_test.go      // only builds during "go test"
\`\`\`

Build tags can also combine conditions:

\`\`\`go
//go:build linux && amd64
\`\`\`

### go:embed: bundling files into the binary

Static files — HTML templates, a default config, small assets — often need to ship *with* the binary rather than as separate files on disk. \`go:embed\` compiles them directly in.

\`\`\`go
package main

import (
	_ "embed"
	"fmt"
)

//go:embed banner.txt
var banner string

func main() {
	fmt.Println(banner)
}
\`\`\`

Whatever is in \`banner.txt\` at build time becomes the value of \`banner\` — no file reads at runtime, and no risk of the file going missing after deployment.

### Embedding a whole directory

\`embed.FS\` embeds a full directory tree as a virtual filesystem:

\`\`\`go
import "embed"

//go:embed templates/*.html
var templatesFS embed.FS

func main() {
	tmpl, err := template.ParseFS(templatesFS, "templates/*.html")
	if err != nil {
		log.Fatal(err)
	}
	// tmpl now serves HTML straight from the compiled binary
}
\`\`\`

This is exactly how single-binary Go web apps ship their entire frontend (HTML, CSS, small JS bundles) as one deployable file with zero external file dependencies.

### Quick comparison

| Feature | Purpose | Read by |
|---------|---------|---------|
| Struct tag | Attach metadata to a field | \`reflect\` (used by libraries like \`encoding/json\`) |
| \`//go:build\` | Include/exclude a file per platform | The \`go\` compiler, at build time |
| \`//go:embed\` | Bundle static files into the binary | The \`go\` compiler, at build time |

> **Key idea:** Struct tags carry metadata for reflection-based libraries, build tags let one codebase compile differently per platform, and \`go:embed\` bakes static assets straight into the binary — three separate compiler-level tools, each solving a different "code needs to know something beyond its own logic" problem.`,
    },
  ],
}
