import type { Module } from "../types"

export const goModule11: Module = {
  id: 11,
  title: "Standard Library Essentials",
  status: "upcoming",
  lessons: [
    {
      name: "strings and strconv",
      minutes: 9,
      intro: "Two small packages you'll import in almost every Go file you ever write.",
      content: `### The strings package

Go strings are immutable byte sequences, and the \`strings\` package is the toolbox for working with them without hand-rolling loops.

\`\`\`go
package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Hello, Go World  "

	fmt.Println(strings.Contains(s, "Go"))          // true
	fmt.Println(strings.TrimSpace(s))                 // "Hello, Go World"
	fmt.Println(strings.ToUpper(s))                    // "  HELLO, GO WORLD  "
	fmt.Println(strings.ToLower(s))                    // "  hello, go world  "
	fmt.Println(strings.Split("a,b,c", ","))           // [a b c]
	fmt.Println(strings.Join([]string{"a", "b", "c"}, "-")) // "a-b-c"
	fmt.Println(strings.ReplaceAll("foo bar foo", "foo", "baz")) // "baz bar baz"
	fmt.Println(strings.HasPrefix("golang.org", "go")) // true
	fmt.Println(strings.Index("chicken", "ken"))       // 4
}
\`\`\`

| Function | Purpose |
|---|---|
| \`strings.Contains(s, sub)\` | does \`s\` contain \`sub\`? |
| \`strings.Split(s, sep)\` | cut \`s\` into a \`[]string\` on every \`sep\` |
| \`strings.Join(parts, sep)\` | glue a \`[]string\` back together |
| \`strings.TrimSpace(s)\` | strip leading/trailing whitespace |
| \`strings.ToUpper\` / \`ToLower\` | case conversion |
| \`strings.HasPrefix\` / \`HasSuffix\` | prefix/suffix check |
| \`strings.Fields(s)\` | split on runs of whitespace |

### strings.Builder: efficient concatenation

Because strings are immutable, \`s += more\` in a loop reallocates a new string every single time — quadratic cost for large inputs. \`strings.Builder\` accumulates writes into a growable buffer and produces the final string once:

\`\`\`go
var b strings.Builder
for i := 0; i < 5; i++ {
	b.WriteString("go")
	b.WriteByte(' ')
}
fmt.Println(b.String()) // "go go go go go "
\`\`\`

Reach for a \`Builder\` any time you're assembling a string piece by piece inside a loop.

### The strconv package

\`strconv\` converts between strings and Go's numeric types — something Go never does implicitly.

\`\`\`go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("42") // string -> int
	if err != nil {
		fmt.Println("conversion failed:", err)
	}
	fmt.Println(n + 1) // 43

	s := strconv.Itoa(100) // int -> string
	fmt.Println(s + "%")   // "100%"

	f, _ := strconv.ParseFloat("3.14", 64)
	fmt.Println(f * 2) // 6.28

	fmt.Println(strconv.FormatInt(255, 16)) // "ff" — base 16
}
\`\`\`

\`strconv.Atoi\` returns \`(int, error)\` because not every string is a valid number — \`strconv.Atoi("abc")\` fails rather than silently returning \`0\`. Always check that error rather than discarding it with \`_\`, unless you're certain the input is well-formed.

| Function | Direction |
|---|---|
| \`strconv.Atoi(s)\` | \`string\` → \`int\`, returns \`(int, error)\` |
| \`strconv.Itoa(n)\` | \`int\` → \`string\` |
| \`strconv.ParseFloat(s, 64)\` | \`string\` → \`float64\`, returns \`(float64, error)\` |
| \`strconv.FormatInt(n, base)\` | \`int64\` → \`string\` in the given base |

> **Key idea:** \`strings\` operates on the text you already have in memory; \`strconv\` moves values across the string/number boundary. Both return plain values with no hidden magic — always check the \`error\` that the parsing functions return.`,
    },
    {
      name: "The time Package",
      minutes: 9,
      intro: "Dates, durations, timers, and Go's famously odd reference-date formatting layout.",
      content: `### time.Now and time.Duration

\`time.Now()\` returns the current \`time.Time\`. Arithmetic on times produces a \`time.Duration\` — a plain \`int64\` count of nanoseconds with a friendly API:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	start := time.Now()
	time.Sleep(150 * time.Millisecond)
	elapsed := time.Since(start)

	fmt.Println(elapsed)                 // e.g. "150.2ms"
	fmt.Println(elapsed < time.Second)    // true
	fmt.Println(2 * time.Hour + 30*time.Minute) // "2h30m0s"
}
\`\`\`

Durations are typed, so \`3\` (a bare int) and \`3 * time.Second\` are not interchangeable — this catches an entire class of "did they mean seconds or milliseconds?" bugs at compile time.

### Formatting and parsing: the reference date

Go doesn't use \`YYYY-MM-DD\`-style format codes. Instead you write a **layout** using this exact reference moment:

\`\`\`text
Mon Jan 2 15:04:05 MST 2006
\`\`\`

That's \`01/02 03:04:05PM '06 -0700\` if you read the numbers in order — 1, 2, 3, 4, 5, 6, 7. Whatever positions those reference values land in, your real date's values land in the same positions:

\`\`\`go
now := time.Now()

fmt.Println(now.Format("2006-01-02"))            // "2026-08-18"
fmt.Println(now.Format("2006-01-02 15:04:05"))     // "2026-08-18 14:30:00"
fmt.Println(now.Format("Jan 2, 2006"))             // "Aug 18, 2026"

parsed, err := time.Parse("2006-01-02", "2025-12-25")
if err != nil {
	fmt.Println("bad date:", err)
}
fmt.Println(parsed.Weekday()) // Thursday
\`\`\`

It feels strange at first, but it's consistent and unambiguous once memorized — there's no confusing \`MM\` vs \`mm\` vs \`M\` convention to look up like other languages use.

### time.Sleep

\`time.Sleep(d)\` pauses the current goroutine for duration \`d\`. It's fine for demos and simple delays, but for anything that needs to be cancellable, prefer \`select\` with \`ctx.Done()\` or \`time.After\` instead (covered in Module 10).

### time.Timer and time.Ticker

A \`Timer\` fires once after a duration; a \`Ticker\` fires repeatedly at an interval:

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	timer := time.NewTimer(1 * time.Second)
	<-timer.C
	fmt.Println("timer fired once")

	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()

	count := 0
	for range ticker.C {
		count++
		fmt.Println("tick", count)
		if count == 3 {
			break
		}
	}
}
\`\`\`

Always \`Stop()\` a \`Ticker\` when you're done with it (typically via \`defer\`) — otherwise it keeps firing and holding resources for as long as the program runs.

> **Key idea:** durations are typed values, not bare numbers — always multiply by a \`time\` unit constant. To format or parse a date, write a layout string using the exact reference date \`Mon Jan 2 15:04:05 MST 2006\`, and reach for \`Timer\`/\`Ticker\` instead of a sleep loop when you need repeated or cancellable timing.`,
    },
    {
      name: "os and io Basics",
      minutes: 8,
      intro: "os gets you into the outside world; io.Reader and io.Writer are the interfaces everything else builds on.",
      content: `### Command-line arguments

\`os.Args\` is a \`[]string\` holding the program's arguments — \`os.Args[0]\` is the program name itself, and the real arguments start at index 1:

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("program:", os.Args[0])
	if len(os.Args) > 1 {
		fmt.Println("first arg:", os.Args[1])
	}
}
\`\`\`

### Environment variables

\`os.Getenv\` reads an environment variable, returning \`""\` if it's unset. \`os.LookupEnv\` distinguishes "unset" from "set to empty string":

\`\`\`go
port := os.Getenv("PORT")
if port == "" {
	port = "8080" // fall back to a default
}

if val, ok := os.LookupEnv("DEBUG"); ok {
	fmt.Println("DEBUG is explicitly set to:", val)
}
\`\`\`

### io.Reader and io.Writer: the backbone of Go I/O

Almost everything that produces or consumes bytes in Go — files, network connections, in-memory buffers, HTTP request bodies — implements one of two tiny interfaces:

\`\`\`go
type Reader interface {
	Read(p []byte) (n int, err error)
}

type Writer interface {
	Write(p []byte) (n int, err error)
}
\`\`\`

That's the entire contract: \`Read\` fills \`p\` with up to \`len(p)\` bytes and reports how many it actually read; \`Write\` consumes bytes from \`p\`. Because the interfaces are this small, an enormous range of types satisfy them — \`os.File\`, \`bytes.Buffer\`, \`strings.Reader\`, \`net.Conn\`, \`http.Response.Body\`, and more — and any function written against \`io.Reader\`/\`io.Writer\` works with all of them without modification.

\`\`\`go
package main

import (
	"fmt"
	"io"
	"strings"
)

func countBytes(r io.Reader) (int, error) {
	buf := make([]byte, 512)
	total := 0
	for {
		n, err := r.Read(buf)
		total += n
		if err == io.EOF {
			return total, nil
		}
		if err != nil {
			return total, err
		}
	}
}

func main() {
	n, _ := countBytes(strings.NewReader("hello, io!"))
	fmt.Println(n) // 10
}
\`\`\`

\`io.EOF\` is a sentinel error meaning "there's nothing left to read" — it's an expected, normal signal to stop, not a failure.

### io.Copy

Most of the time you don't need to hand-write a read loop like the one above — \`io.Copy\` streams everything from a \`Reader\` to a \`Writer\` for you:

\`\`\`go
n, err := io.Copy(os.Stdout, strings.NewReader("streamed straight through\\n"))
if err != nil {
	fmt.Println("copy failed:", err)
}
fmt.Println("copied", n, "bytes")
\`\`\`

This one line is how Go idiomatically pipes a file to an HTTP response, a network stream to a file on disk, or one buffer to another — the source and destination can be *any* pair of types that satisfy \`Reader\` and \`Writer\`.

> **Key idea:** \`io.Reader\` and \`io.Writer\` are one-method interfaces, and that smallness is the whole point — it's why file I/O, network I/O, compression, and in-memory buffers can all be composed with the exact same functions like \`io.Copy\`.`,
    },
    {
      name: "bufio and File I/O",
      minutes: 9,
      intro: "Simple whole-file helpers for small data, buffered scanners and writers for everything else.",
      content: `### The simple case: whole files at once

For small files, \`os.ReadFile\` and \`os.WriteFile\` are the least ceremony you can write:

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func main() {
	err := os.WriteFile("notes.txt", []byte("hello file\\n"), 0644)
	if err != nil {
		fmt.Println("write failed:", err)
		return
	}

	data, err := os.ReadFile("notes.txt")
	if err != nil {
		fmt.Println("read failed:", err)
		return
	}
	fmt.Print(string(data))
}
\`\`\`

Both load or write the entire file in one call — fine for config files and small text, wasteful for anything large since it all has to fit in memory at once.

### Opening files for streaming access

For anything bigger, or when you want to read/write incrementally, use \`os.Open\` (read) and \`os.Create\` (write, truncating if the file exists):

\`\`\`go
f, err := os.Open("data.txt")
if err != nil {
	// handle error
}
defer f.Close()
\`\`\`

\`defer file.Close()\` immediately after a successful open is close to a Go reflex — it guarantees the file descriptor is released when the function returns, no matter which return path is taken.

### bufio.Scanner: line-by-line reading

Reading a file line by line with raw \`Read\` calls is fiddly. \`bufio.NewScanner\` wraps any \`io.Reader\` and hands you one line at a time:

\`\`\`go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	f, err := os.Open("data.txt")
	if err != nil {
		fmt.Println("open failed:", err)
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	lineNum := 0
	for scanner.Scan() {
		lineNum++
		fmt.Printf("%d: %s\\n", lineNum, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("scan error:", err)
	}
}
\`\`\`

\`scanner.Scan()\` advances one token (a line, by default) and returns \`false\` when input runs out or an error occurs — always check \`scanner.Err()\` afterward, since \`Scan\` returning \`false\` doesn't by itself tell you whether it was a clean EOF or a real error.

### bufio.Writer: buffered writes

Writing to a file one small piece at a time is slow if every write hits the OS directly. \`bufio.NewWriter\` batches writes in memory and flushes them together:

\`\`\`go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	f, err := os.Create("output.txt")
	if err != nil {
		fmt.Println("create failed:", err)
		return
	}
	defer f.Close()

	w := bufio.NewWriter(f)
	for i := 1; i <= 5; i++ {
		fmt.Fprintf(w, "line %d\\n", i)
	}
	w.Flush() // don't forget this — buffered data isn't on disk until flushed
}
\`\`\`

\`w.Flush()\` is easy to forget and easy to lose data over — anything still sitting in the buffer when the program exits without a \`Flush\` never reaches the file.

| Tool | Use when |
|---|---|
| \`os.ReadFile\` / \`os.WriteFile\` | small file, whole contents at once |
| \`os.Open\` + \`bufio.Scanner\` | reading large files line by line |
| \`os.Create\` + \`bufio.Writer\` | writing many small pieces efficiently |

> **Key idea:** reach for \`os.ReadFile\`/\`os.WriteFile\` first — only step up to \`os.Open\`/\`os.Create\` plus \`bufio\` when the file is large or you need streaming access. Either way, \`defer file.Close()\` right after a successful open, and always \`Flush()\` a \`bufio.Writer\` before you're done with it.`,
    },
    {
      name: "encoding/json",
      minutes: 10,
      intro: "Struct tags tell Go exactly how your types map onto JSON, in both directions.",
      content: `### Marshal: Go values to JSON

\`json.Marshal\` converts a Go value into a JSON-encoded \`[]byte\`:

\`\`\`go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name  string
	Email string
	Age   int
}

func main() {
	u := User{Name: "Ada", Email: "ada@example.com", Age: 30}

	data, err := json.Marshal(u)
	if err != nil {
		fmt.Println("marshal failed:", err)
		return
	}
	fmt.Println(string(data))
	// {"Name":"Ada","Email":"ada@example.com","Age":30}
}
\`\`\`

By default, \`json.Marshal\` only sees **exported** fields (capitalized) and uses the Go field name verbatim as the JSON key — which is rarely the naming convention you actually want in an API response.

### Struct tags: controlling the JSON shape

A struct tag is a raw string literal attached to a field, written right after its type, and \`encoding/json\` reads a \`json:"..."\` tag to decide the key name and behavior for that field:

\`\`\`go
type User struct {
	Name  string \`json:"name"\`
	Email string \`json:"email,omitempty"\`
	Age   int    \`json:"age"\`
	password string // unexported — never marshaled, ever
}
\`\`\`

- \`json:"name"\` renames the JSON key from \`Name\` to \`name\`.
- \`json:"email,omitempty"\` renames it *and* omits the field entirely from the output if it holds its zero value (empty string, 0, nil, etc).
- \`json:"-"\` (a literal dash) excludes a field from JSON entirely, even though it's exported.
- Unexported fields like \`password\` are always invisible to \`encoding/json\`, tag or no tag — this is a common, deliberate way to keep secrets out of API responses.

\`\`\`go
type Account struct {
	Username string \`json:"username"\`
	Token    string \`json:"-"\`
	Nickname string \`json:"nickname,omitempty"\`
}

func main() {
	a := Account{Username: "gokul", Token: "secret-abc", Nickname: ""}
	data, _ := json.Marshal(a)
	fmt.Println(string(data))
	// {"username":"gokul"}  — Token is excluded, empty Nickname is omitted
}
\`\`\`

### Unmarshal: JSON to Go values

\`json.Unmarshal\` does the reverse — it needs a pointer to the destination so it can write into it:

\`\`\`go
raw := []byte(\`{"name":"Grace","email":"grace@example.com","age":36}\`)

type Person struct {
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
	Age   int    \`json:"age"\`
}

var p Person
if err := json.Unmarshal(raw, &p); err != nil {
	fmt.Println("unmarshal failed:", err)
}
fmt.Printf("%+v\\n", p) // {Name:Grace Email:grace@example.com Age:36}
\`\`\`

Field matching is case-insensitive and driven by the \`json\` tags — \`Unmarshal\` will happily match \`"name"\` in the JSON to a field tagged \`json:"name"\` regardless of how the Go field itself is capitalized.

### Streaming with Encoder and Decoder

For reading or writing JSON directly to/from an \`io.Writer\`/\`io.Reader\` — a file, an HTTP body, standard output — \`json.NewEncoder\` and \`json.NewDecoder\` skip the intermediate \`[]byte\` entirely:

\`\`\`go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
)

type Event struct {
	Name string \`json:"name"\`
	Code int    \`json:"code"\`
}

func main() {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.Encode(Event{Name: "deploy", Code: 200})

	dec := json.NewDecoder(&buf)
	var e Event
	dec.Decode(&e)
	fmt.Printf("%+v\\n", e) // {Name:deploy Code:200}
}
\`\`\`

This pattern is exactly what you'll use to write a JSON response straight to an \`http.ResponseWriter\`, or to read a JSON request body straight from \`r.Body\`, without ever materializing the whole payload as a byte slice.

> **Key idea:** struct tags like \`\`json:"name,omitempty"\`\` (written as a raw backtick-delimited string right after the field's type) are how you decouple your Go field names from your JSON's wire format — rename fields, omit empty ones, and hide secrets with \`json:"-"\`, all without changing how the rest of your Go code refers to the struct.`,
    },
  ],
}
