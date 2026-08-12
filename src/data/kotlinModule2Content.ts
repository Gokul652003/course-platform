import type { Module } from "../types"

export const kotlinModule2: Module = {
  id: 2,
  title: "Strings & Control Flow",
  status: "upcoming",
  lessons: [
    {
      name: "Strings",
      minutes: 9,
      intro: "Text, string templates, and the functions you'll use daily.",
      content: `### Strings are text

\`\`\`kotlin
val greeting = "Hello"
val multiline = """
    line one
    line two
"""
\`\`\`

### String templates

Insert values directly with \`$\`:

\`\`\`kotlin
val name = "Gokul"
val age = 30

println("Hi, $name")
println("You are \${age + 1} years old")   // expressions inside \${}
\`\`\`

Output:
\`\`\`
Hi, Gokul
You are 31 years old
\`\`\`

### Concatenation

\`\`\`kotlin
val a = "co" + "de"   // "code"
\`\`\`

But templates are cleaner than \`+\` chains.

### Common string functions

\`\`\`kotlin
val s = "Kotlin Fundamentals"

s.length        // 19
s.uppercase()   // "KOTLIN FUNDAMENTALS"
s.lowercase()   // "kotlin fundamentals"
s.startsWith("Kot")   // true
s.contains("in")      // true
s.replace("in", "YN") // "KotlYN Fundamentals"
s.trim()        // removes surrounding whitespace
s.substring(0, 6)     // "Kotlin"
s.split(" ")    // ["Kotlin", "Fundamentals"]
\`\`\`

### Comparing strings

Use \`==\` for value comparison, never worry about reference equality:

\`\`\`kotlin
"abc" == "abc"   // true
\`\`\`

> **Key idea:** Use \`$\{}\` string templates instead of string concatenation — they're the idiomatic Kotlin way and easier to read.`,
    },
    {
      name: "if / else",
      minutes: 8,
      intro: "Branch your code on a condition.",
      content: `### The classic if / else

\`\`\`kotlin
fun main() {
    val score = 75

    if (score >= 60) {
        println("Passed")
    } else {
        println("Failed")
    }
}
\`\`\`

### else if for multiple branches

\`\`\`kotlin
val grade = if (score >= 90) {
    "A"
} else if (score >= 75) {
    "B"
} else if (score >= 60) {
    "C"
} else {
    "F"
}
\`\`\`

### if is an EXPRESSION

In Kotlin, \`if\` returns a value. The example above assigns the result directly to \`grade\`. No separate \`return\` needed.

\`\`\`kotlin
val max = if (a > b) a else b
\`\`\`

### Empty else is optional

\`\`\`kotlin
if (age >= 18)
    println("Adult")
\`\`\`

When the body is a single expression you can even drop the braces. But keeping braces is usually clearer.

> **Key idea:** In Kotlin, \`if\` is an expression, not just a statement — the last line of each branch becomes its value.`,
    },
    {
      name: "when",
      minutes: 9,
      intro: "Kotlin's replacement for switch — cleaner and far more powerful.",
      content: `### when = switch on steroids

\`\`\`kotlin
fun describe(x: Int): String = when (x) {
    1 -> "one"
    2 -> "two"
    else -> "many"
}
\`\`\`

### Multiple values in one branch

\`\`\`kotlin
when (day) {
    "Mon", "Tue", "Wed", "Thu" -> println("Weekday")
    "Fri" -> println("TGIF")
    "Sat", "Sun" -> println("Weekend")
    else -> println("Unknown day")
}
\`\`\`

### Branch without arguments (like a fancy if chain)

\`\`\`kotlin
val grade = when {
    score >= 90 -> "A"
    score >= 75 -> "B"
    score >= 60 -> "C"
    else -> "F"
}
\`\`\`

### when is an expression too

\`\`\`kotlin
fun describe(x: Int): String = when {
    x == 0 -> "zero"
    x < 0 -> "negative"
    else -> "positive"
}
\`\`\`

### Checking types with when

\`\`\`kotlin
fun typeName(x: Any): String = when (x) {
    is String -> "a string"
    is Int -> "an int"
    else -> "something else"
}
\`\`\`

> **Key idea:** Use \`when\` instead of long if/else-if chains. Match on values, ranges, or types, and use it as an expression to return results.`,
    },
    {
      name: "for loops",
      minutes: 9,
      intro: "Iterate over ranges, and collections.",
      content: `### Iterate a range of numbers

\`\`\`kotlin
for (i in 1..5) {
    println(i)   // 1 2 3 4 5
}
\`\`\`

\`1..5\` is a **range** including both endpoints.

### Step and downTo

\`\`\`kotlin
for (i in 1..10 step 2) {
    println(i)   // 1 3 5 7 9
}

for (i in 5 downTo 1) {
    println(i)   // 5 4 3 2 1
}
\`\`\`

### Exclusive range: until

\`\`\`kotlin
for (i in 0 until 5) {
    println(i)   // 0 1 2 3 4  (stops BEFORE 5)
}
\`\`\`

### Iterate a collection

\`\`\`kotlin
val fruits = listOf("apple", "banana", "cherry")
for (fruit in fruits) {
    println(fruit)
}
\`\`\`

### With index

\`\`\`kotlin
for ((index, fruit) in fruits.withIndex()) {
    println("$index: $fruit")
}
\`\`\`

### Iterate a string

\`\`\`kotlin
for (ch in "Kotlin") {
    println(ch)   // K o t l i n
}
\`\`\`

> **Key idea:** \`for (x in something)\` iterates everything — ranges, collections, strings. \`..\` is inclusive, \`until\` is exclusive, \`downTo\` reverses.`,
    },
    {
      name: "while / do-while",
      minutes: 7,
      intro: "Loop while a condition holds — and a variant that checks at the end.",
      content: `### while — check first, then run

\`\`\`kotlin
var count = 0
while (count < 3) {
    println("Count: $count")
    count++
}
// Count: 0
// Count: 1
// Count: 2
\`\`\`

If the condition is false from the start, the body **never** runs.

### do-while — run first, then check

\`\`\`kotlin
var x = 10
do {
    println("x is $x")
    x++
} while (x < 3)
// x is 10   <- runs once even though 10 < 3 is false
\`\`\`

The body runs at least once.

### break and continue

\`\`\`kotlin
var n = 0
while (true) {
    n++
    if (n == 3) continue       // skip printing 3
    if (n > 5) break           // stop the loop
    println(n)                 // 1 2 4 5
}
\`\`\`

- \`break\` — exit the loop entirely
- \`continue\` — skip to the next iteration

> **Key idea:** Use \`while\` when you don't know how many times you'll loop. Use \`for\` when you're iterating a known range or collection.`,
    },
  ],
}