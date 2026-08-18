import type { Module } from "../types"

export const goModule3: Module = {
  id: 3,
  title: "Arrays, Slices & Maps",
  status: "upcoming",
  lessons: [
    {
      name: "Arrays",
      minutes: 8,
      intro: "Fixed-length, value-type, and the foundation everything else builds on.",
      content: `### Declaring an array

An array in Go has a **fixed length that's part of its type**. \`[5]int\` and \`[10]int\` are different types, not the same type with different sizes.

\`\`\`go
var nums [5]int // [0 0 0 0 0] — all elements get the zero value
nums[0] = 10
nums[4] = 50
fmt.Println(nums) // [10 0 0 0 50]
\`\`\`

### Array literals

\`\`\`go
primes := [5]int{2, 3, 5, 7, 11}

// let the compiler count the elements for you
weekdays := [...]string{"Mon", "Tue", "Wed", "Thu", "Fri"}
fmt.Println(len(weekdays)) // 5
\`\`\`

The difference between \`[5]int{...}\` and \`[...]int{...}\`: with \`[5]\` you're asserting the length yourself (and it's a compile error if the literal doesn't match); with \`[...]\` you're asking the compiler to count the elements and fill in the length for you.

\`\`\`go
a := [3]int{1, 2, 3}     // explicit length, must have exactly 3 elements
b := [...]int{1, 2, 3, 4} // compiler infers length 4
\`\`\`

### Arrays are value types

This is the big one. Assigning an array, or passing it to a function, **copies every element**. Go arrays behave like structs, not like references:

\`\`\`go
original := [3]int{1, 2, 3}
copy := original
copy[0] = 999

fmt.Println(original) // [1 2 3]   — unchanged!
fmt.Println(copy)     // [999 2 3]
\`\`\`

\`\`\`go
func modify(arr [3]int) {
    arr[0] = 999 // only modifies the local copy
}

nums := [3]int{1, 2, 3}
modify(nums)
fmt.Println(nums) // [1 2 3] — untouched
\`\`\`

### Why arrays are rarely used directly

Because of this copy-everything behavior, and the fact that the length is baked into the type, plain arrays are actually uncommon in everyday Go code. They're mostly a building block for **slices**, which is what you'll reach for almost every time you need a growable list. That's the whole next lesson.

> **Key idea:** An array's length is part of its type, and arrays copy by value. If you find yourself wanting a resizable, cheaply-passed-around collection — which is most of the time — you want a slice, not an array.`,
    },
    {
      name: "Slices",
      minutes: 11,
      intro: "A view over an array — with a pointer, a length, and a capacity.",
      content: `### What a slice actually is

A slice looks like a resizable array, but under the hood it's a small struct with three fields:

\`\`\`go
// conceptually:
type sliceHeader struct {
    ptr *T   // pointer to the first element in a backing array
    len int  // number of elements currently visible
    cap int  // how many elements the backing array can hold before reallocating
}
\`\`\`

You never see this struct directly — it's just useful to know it exists, because it explains everything slices do.

### Creating slices

\`\`\`go
// slice literal — Go creates the backing array for you
nums := []int{1, 2, 3}

// make(type, length, capacity)
scores := make([]int, 3)      // len=3, cap=3, all zero values
buffer := make([]byte, 0, 64) // len=0, cap=64 — room to grow without reallocating
\`\`\`

### len() vs cap()

\`\`\`go
s := make([]int, 2, 5)
fmt.Println(len(s), cap(s)) // 2 5
\`\`\`

\`len\` is how many elements you can currently access. \`cap\` is how many the backing array can hold before Go needs to allocate a bigger one.

### append and reallocation

\`\`\`go
s := make([]int, 0, 2)
s = append(s, 1) // len=1 cap=2 — fits, same backing array
s = append(s, 2) // len=2 cap=2 — fits exactly
s = append(s, 3) // len=3 cap=4 — didn't fit! Go allocates a NEW backing array
\`\`\`

Because \`append\` can allocate a new backing array, you **must** reassign the result: \`s = append(s, x)\`. Ignoring the return value is a common bug — the original variable won't see the new element if a reallocation happened.

### Slicing syntax

\`\`\`go
nums := []int{10, 20, 30, 40, 50}

sub := nums[1:3] // elements at index 1 up to (not including) 3
fmt.Println(sub) // [20 30]

fmt.Println(nums[:2])  // [10 20]        — from the start
fmt.Println(nums[3:])  // [40 50]        — to the end
fmt.Println(nums[:])   // [10 20 30 40 50] — the whole thing
\`\`\`

### The "slices share a backing array" gotcha

Slicing an existing slice does **not** copy data — the new slice points into the same backing array. Mutating through one is visible through the other:

\`\`\`go
original := []int{1, 2, 3, 4, 5}
view := original[1:4] // [2 3 4], same backing array

view[0] = 999
fmt.Println(original) // [1 999 3 4 5] — original changed too!
\`\`\`

If you need an independent copy, use the built-in \`copy\` function:

\`\`\`go
src := []int{1, 2, 3}
dst := make([]int, len(src))
copy(dst, src)

dst[0] = 999
fmt.Println(src) // [1 2 3] — unaffected
\`\`\`

> **Key idea:** A slice is a lightweight window (pointer + length + capacity) over a backing array, not a container that owns its data outright. That's why re-slicing is cheap, but also why two slices can silently share — and corrupt — the same memory.`,
    },
    {
      name: "Maps",
      minutes: 9,
      intro: "Go's built-in hash map — creation, the comma-ok idiom, and deliberately random order.",
      content: `### Creating maps

\`\`\`go
// make(map[KeyType]ValueType)
ages := make(map[string]int)
ages["Ann"] = 30
ages["Ben"] = 25

// map literal
scores := map[string]int{
    "Ann": 95,
    "Ben": 88,
}
\`\`\`

### Reading and writing

\`\`\`go
fmt.Println(scores["Ann"]) // 95

scores["Cara"] = 100  // add a new key
scores["Ann"] = 97    // overwrite an existing key
\`\`\`

### The comma-ok idiom

Reading a missing key doesn't panic — it silently returns the value type's zero value, which can hide bugs. The **comma-ok** idiom gives you a second boolean telling you whether the key actually existed:

\`\`\`go
value, ok := scores["Dave"]
fmt.Println(value, ok) // 0 false — Dave isn't in the map

value, ok = scores["Ann"]
fmt.Println(value, ok) // 97 true
\`\`\`

Use it whenever the zero value is a valid result and you need to tell "present but zero" apart from "absent":

\`\`\`go
if score, ok := scores["Ann"]; ok {
    fmt.Println("Ann scored", score)
} else {
    fmt.Println("Ann has no score on record")
}
\`\`\`

### delete()

\`\`\`go
delete(scores, "Ben")
_, ok := scores["Ben"]
fmt.Println(ok) // false
\`\`\`

\`delete\` on a key that doesn't exist is a harmless no-op, not an error.

### Map iteration order is randomized — on purpose

\`\`\`go
for name, score := range scores {
    fmt.Println(name, score)
}
\`\`\`

Every run of this loop can print the entries in a **different order**. This isn't a bug or an implementation detail you can rely on — Go's runtime deliberately randomizes map iteration order to stop developers from accidentally depending on an order that was never guaranteed. If you need a predictable order, collect the keys into a slice and sort them yourself:

\`\`\`go
keys := make([]string, 0, len(scores))
for k := range scores {
    keys = append(keys, k)
}
sort.Strings(keys)

for _, k := range keys {
    fmt.Println(k, scores[k])
}
\`\`\`

> **Key idea:** Never assume map iteration order — Go actively shuffles it between runs to catch that mistake early. If order matters, sort the keys explicitly.`,
    },
    {
      name: "Slices and Maps Together",
      minutes: 10,
      intro: "Nest them, copy them safely, and build a real grouping example.",
      content: `### Nesting: slice of structs

\`\`\`go
type Task struct {
    Name string
    Done bool
}

tasks := []Task{
    {Name: "Write code", Done: true},
    {Name: "Write tests", Done: false},
}

for _, t := range tasks {
    fmt.Println(t.Name, t.Done)
}
\`\`\`

### Nesting: map of slices

\`\`\`go
teams := map[string][]string{
    "Backend":  {"Ann", "Ben"},
    "Frontend": {"Cara", "Dave", "Ela"},
}

teams["Backend"] = append(teams["Backend"], "Finn")
fmt.Println(teams["Backend"]) // [Ann Ben Finn]
\`\`\`

Appending directly into a map's slice value works because \`teams["Backend"]\` reads the current slice, \`append\` may extend it, and the assignment writes the (possibly reallocated) slice back into the map.

### copy() vs slice aliasing — pick the right tool

From the previous lesson: re-slicing shares memory, \`copy()\` duplicates it. This matters even more once slices live inside structs and maps, because an aliasing bug can now spread across a much bigger data structure:

\`\`\`go
original := []int{1, 2, 3}

aliased := original         // same backing array — mutations are shared
duplicated := make([]int, len(original))
copy(duplicated, original)  // independent backing array

aliased[0] = 999
duplicated[0] = -1

fmt.Println(original)   // [999 2 3] — aliased mutated it
fmt.Println(duplicated) // [-1 2 3]  — untouched by the copy's mutation
\`\`\`

### Worked example: grouping words by first letter

A classic small program that combines everything from this module — a \`map[string][]string\` built up from a slice of words:

\`\`\`go
package main

import "fmt"

func groupByFirstLetter(words []string) map[string][]string {
    groups := make(map[string][]string)

    for _, w := range words {
        if w == "" {
            continue
        }
        key := string(w[0]) // first byte as a string
        groups[key] = append(groups[key], w)
    }

    return groups
}

func main() {
    words := []string{"apple", "ant", "banana", "bee", "cat", "avocado"}
    groups := groupByFirstLetter(words)

    for letter, list := range groups {
        fmt.Println(letter, "->", list)
    }
    // a -> [apple ant avocado]
    // b -> [banana bee]
    // c -> [cat]
    // (order of letters printed will vary — see previous lesson)
}
\`\`\`

Notice \`groups[key] = append(groups[key], w)\`: when \`key\` isn't in the map yet, \`groups[key]\` reads the **zero value** for \`[]string\`, which is \`nil\`. Appending to a \`nil\` slice is perfectly safe in Go — it allocates a fresh backing array — so there's no need to check for existence first.

> **Key idea:** Appending to a missing map key's slice "just works" because a nil slice's zero value plays nicely with append — one of the small design choices that makes Go's zero values genuinely useful rather than just a safety net.`,
    },
  ],
}
