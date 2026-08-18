import type { Module } from "../types"

export const goModule12: Module = {
  id: 12,
  title: "Testing in Go",
  status: "upcoming",
  lessons: [
    {
      name: "Your First Test",
      minutes: 8,
      intro: "Testing is built into the language — no framework to install, just a naming convention and one package.",
      content: `### The testing package and file naming

Go's standard library ships a full testing toolkit in the \`testing\` package, and the tooling around it is opinionated by design: test files must end in \`_test.go\`, and they live right next to the code they test.

\`\`\`text
math/
  add.go
  add_test.go
\`\`\`

\`\`\`go
// add.go
package math

func Add(a, b int) int {
	return a + b
}
\`\`\`

### Writing a test function

A test function must be named \`TestXxx\` (capital first letter after \`Test\`) and take exactly one parameter, \`t *testing.T\`:

\`\`\`go
// add_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}
}
\`\`\`

Go's \`go test\` tool finds every function matching that \`TestXxx(t *testing.T)\` shape in \`_test.go\` files and runs it — there's no registration step, no decorators, nothing to wire up.

### Reporting failures: Error vs Fatal

| Method | Behavior |
|---|---|
| \`t.Error(...)\` / \`t.Errorf(...)\` | marks the test failed, keeps running the rest of the function |
| \`t.Fatal(...)\` / \`t.Fatalf(...)\` | marks the test failed, stops the function immediately |

\`\`\`go
func TestDivide(t *testing.T) {
	result, err := Divide(10, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err) // no point checking result if err != nil
	}
	if result != 5 {
		t.Errorf("Divide(10, 2) = %d; want 5", result)
	}
}
\`\`\`

Use \`Fatal\` when continuing the test after a failure would be meaningless or would panic (like dereferencing a value that failed to load); use \`Error\` when you want to report multiple independent problems from a single test run.

### Running your tests

\`\`\`bash
go test ./...          # run every test in the module, recursively
go test ./math/...     # run tests under one directory tree
go test -v ./...       # verbose: prints each test name and PASS/FAIL
go test -run TestAdd   # run only tests whose name matches this pattern
\`\`\`

A clean run looks like:

\`\`\`text
ok  	example.com/myproject/math	0.002s
\`\`\`

And a failure points straight at the line and the message you gave it:

\`\`\`text
--- FAIL: TestAdd (0.00s)
    add_test.go:8: Add(2, 3) = 6; want 5
FAIL
\`\`\`

> **Key idea:** a Go test is just a function named \`TestXxx\` taking \`*testing.T\`, in a file named \`_test.go\`. No test runner to configure, no assertion library required to get started — \`go test ./...\` finds and runs everything.`,
    },
    {
      name: "Table-Driven Tests and Subtests",
      minutes: 9,
      intro: "The idiomatic Go pattern: a slice of test cases, looped, each run as its own named subtest.",
      content: `### The problem with one test function per case

You could write a separate \`TestAdd_PositiveNumbers\`, \`TestAdd_NegativeNumbers\`, \`TestAdd_Zero\`, and so on — but that scales badly. Each one duplicates the same setup and assertion logic, and adding a new case means writing a whole new function.

### Table-driven tests

The idiomatic fix: describe your test cases as data, and loop over them with one shared assertion:

\`\`\`go
package math

import "testing"

func TestAdd(t *testing.T) {
	tests := []struct {
		name string
		a, b int
		want int
	}{
		{name: "two positives", a: 2, b: 3, want: 5},
		{name: "negative and positive", a: -2, b: 3, want: 1},
		{name: "both negative", a: -2, b: -3, want: -5},
		{name: "with zero", a: 0, b: 5, want: 5},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := Add(tc.a, tc.b)
			if got != tc.want {
				t.Errorf("Add(%d, %d) = %d; want %d", tc.a, tc.b, got, tc.want)
			}
		})
	}
}
\`\`\`

Adding a new case is now a one-line addition to the \`tests\` slice — no new function, no copy-pasted assertion logic.

### t.Run and subtests

\`t.Run(name, func(t *testing.T) {...})\` registers each table entry as its own named **subtest**. This gives you three things a plain loop without \`t.Run\` wouldn't:

- Each case shows up individually in \`-v\` output and in failure messages, so you know exactly which case broke.
- You can run one specific case with \`go test -run "TestAdd/both_negative"\` (spaces in the name become underscores).
- A failure in one subtest doesn't stop the others in the table from running (unlike a bare \`t.Fatal\` in a shared loop body).

\`\`\`text
--- FAIL: TestAdd (0.00s)
    --- PASS: TestAdd/two_positives (0.00s)
    --- FAIL: TestAdd/negative_and_positive (0.00s)
        add_test.go:19: Add(-2, 3) = 0; want 1
    --- PASS: TestAdd/both_negative (0.00s)
    --- PASS: TestAdd/with_zero (0.00s)
FAIL
\`\`\`

### A closure gotcha to watch for

Just like with goroutines in a loop, if you reference the loop variable \`tc\` from inside a closure that might outlive one iteration, you need to be careful. In modern Go (1.22+), each loop iteration gets its own copy of \`tc\` automatically, so the pattern above is safe as written. On older Go versions, the fix is to shadow the variable inside the loop body: \`tc := tc\` before using it in the closure.

> **Key idea:** describe test cases as a slice of structs, loop over them, and wrap each case in \`t.Run(tc.name, ...)\`. It's more code up front than a single hardcoded assertion, but every additional case afterward is just one more line in the table.`,
    },
    {
      name: "Mocks and Test Doubles via Interfaces",
      minutes: 9,
      intro: "Go has no mocking framework in the standard library — small interfaces are how you get the same effect.",
      content: `### Why Go doesn't need a mocking framework

Many languages need a dedicated mocking library because their code depends directly on concrete classes. Go's implicit interfaces sidestep the problem: if your code depends on an **interface** instead of a concrete type, you can substitute any type that satisfies it — including a small, hand-written fake built just for tests.

### Defining a narrow interface

Say you have code that sends notifications. Instead of coupling it directly to a real email/SMS client, define the smallest interface that describes what it needs:

\`\`\`go
package notify

type Notifier interface {
	Notify(to string, message string) error
}

type OrderService struct {
	notifier Notifier
}

func NewOrderService(n Notifier) *OrderService {
	return &OrderService{notifier: n}
}

func (s *OrderService) PlaceOrder(customerEmail string) error {
	// ... order placement logic ...
	return s.notifier.Notify(customerEmail, "Your order has been placed!")
}
\`\`\`

In production, \`Notifier\` might be backed by a real email API client. In tests, it's backed by something much simpler.

### A fake implementation for tests

\`\`\`go
package notify

import "testing"

type fakeNotifier struct {
	calls []string
	err   error
}

func (f *fakeNotifier) Notify(to string, message string) error {
	f.calls = append(f.calls, to)
	return f.err
}

func TestPlaceOrder_SendsNotification(t *testing.T) {
	fake := &fakeNotifier{}
	svc := NewOrderService(fake)

	if err := svc.PlaceOrder("customer@example.com"); err != nil {
		t.Fatalf("PlaceOrder returned error: %v", err)
	}

	if len(fake.calls) != 1 {
		t.Fatalf("expected 1 notification, got %d", len(fake.calls))
	}
	if fake.calls[0] != "customer@example.com" {
		t.Errorf("notified %q; want customer@example.com", fake.calls[0])
	}
}
\`\`\`

\`fakeNotifier\` never touches a network, a real inbox, or an external service. It just records what it was asked to do so the test can assert on it — this is a **test double**: any stand-in object used in place of a real dependency for testing.

### Simulating failures

Because \`fakeNotifier\` is just a plain struct you control, testing an error path is just as easy — set \`err\` and the fake returns it:

\`\`\`go
func TestPlaceOrder_NotificationFails(t *testing.T) {
	fake := &fakeNotifier{err: errors.New("smtp down")}
	svc := NewOrderService(fake)

	if err := svc.PlaceOrder("customer@example.com"); err == nil {
		t.Fatal("expected an error, got nil")
	}
}
\`\`\`

### When to reach for a library

For small interfaces like this, hand-written fakes are usually clearer and easier to maintain than generated mocks. Once a project has dozens of interfaces and tests need finer-grained control — asserting call order, argument matching, call counts — a library like \`testify/mock\` (or code-generated mocks via \`mockgen\`) can save repetitive boilerplate. But it's an optional addition on top of the interface pattern, not a replacement for it — the interface is still what makes substitution possible in the first place.

> **Key idea:** design around small interfaces, and testing becomes substitution rather than interception. A hand-written fake that satisfies the interface is often all the "mocking" you need — reach for a library like \`testify/mock\` only once hand-written fakes get repetitive.`,
    },
    {
      name: "Benchmarks, Coverage, and Fuzzing",
      minutes: 10,
      intro: "Go's testing tools go beyond pass/fail: measure speed, measure coverage, and let the tool hunt for edge cases.",
      content: `### Writing a benchmark

A benchmark function is named \`BenchmarkXxx\` and takes \`b *testing.B\`. The testing framework runs your code in \`b.N\` iterations, automatically increasing \`N\` until the timing is statistically stable:

\`\`\`go
package strutil

import (
	"strings"
	"testing"
)

func ConcatNaive(parts []string) string {
	s := ""
	for _, p := range parts {
		s += p
	}
	return s
}

func ConcatBuilder(parts []string) string {
	var b strings.Builder
	for _, p := range parts {
		b.WriteString(p)
	}
	return b.String()
}

func BenchmarkConcatNaive(b *testing.B) {
	parts := []string{"a", "b", "c", "d", "e", "f", "g", "h"}
	for i := 0; i < b.N; i++ {
		ConcatNaive(parts)
	}
}

func BenchmarkConcatBuilder(b *testing.B) {
	parts := []string{"a", "b", "c", "d", "e", "f", "g", "h"}
	for i := 0; i < b.N; i++ {
		ConcatBuilder(parts)
	}
}
\`\`\`

Run benchmarks with \`-bench\` (regular tests are skipped by default when you pass this flag alone, add \`-run=^$\` to skip them explicitly, or just note that \`-bench\` runs tests too unless you filter):

\`\`\`bash
go test -bench=. -benchmem ./...
\`\`\`

\`\`\`text
BenchmarkConcatNaive-8       500000     2841 ns/op     896 B/op    7 allocs/op
BenchmarkConcatBuilder-8    2000000      612 ns/op     128 B/op    1 allocs/op
\`\`\`

\`-benchmem\` adds memory stats, making it easy to see exactly why \`strings.Builder\` wins here: far fewer allocations per operation.

### Measuring test coverage

\`go test -cover\` reports what percentage of your code's statements were exercised by the test suite:

\`\`\`bash
go test -cover ./...
\`\`\`

\`\`\`text
ok  	example.com/myproject/math	0.003s	coverage: 87.5% of statements
\`\`\`

For a visual, line-by-line breakdown of exactly what was and wasn't covered:

\`\`\`bash
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
\`\`\`

The HTML report opens in a browser with covered lines highlighted green and uncovered lines red — useful for spotting an entire error branch nobody's tests ever trigger. Treat the percentage as a signal to investigate, not a target to chase blindly — 100% coverage with weak assertions still misses real bugs.

### Fuzzing: let the tool find the edge cases

Since Go 1.18, fuzzing is built in. A fuzz test is named \`FuzzXxx\`, takes \`f *testing.F\`, and provides "seed" inputs the fuzzer mutates to search for inputs that crash or fail an assertion:

\`\`\`go
package strutil

import "testing"

func Reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func FuzzReverse(f *testing.F) {
	f.Add("hello") // seed corpus
	f.Add("")
	f.Add("a")

	f.Fuzz(func(t *testing.T, s string) {
		reversed := Reverse(s)
		roundTrip := Reverse(reversed)
		if roundTrip != s {
			t.Errorf("Reverse(Reverse(%q)) = %q; want %q", s, roundTrip, s)
		}
	})
}
\`\`\`

Run it with:

\`\`\`bash
go test -fuzz=FuzzReverse -fuzztime=30s
\`\`\`

The fuzzer generates thousands of inputs — empty strings, huge strings, invalid UTF-8, unicode edge cases — well beyond what you'd think to write by hand, and it saves any failing input under \`testdata/fuzz/\` so it automatically becomes a regression test on every future \`go test\` run.

| Tool | Question it answers |
|---|---|
| \`go test\` | does the code behave correctly on the cases I thought of? |
| \`go test -bench\` | how fast is it, and how much does it allocate? |
| \`go test -cover\` | how much of the code did my tests actually exercise? |
| \`go test -fuzz\` | are there inputs I *didn't* think of that break it? |

> **Key idea:** \`go test\` alone gets you correctness on the cases you wrote. Layer \`-bench\` to catch performance regressions, \`-cover\` to see what your tests actually touch, and \`-fuzz\` to let the tool discover the inputs you never thought to try.`,
    },
  ],
}
