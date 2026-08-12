import type { Module } from "../types"

export const kotlinModule1: Module = {
  id: 1,
  title: "Hello, Kotlin",
  status: "in_progress",
  lessons: [
    {
      name: "Kotlin Setup + First Program",
      minutes: 10,
      intro: "Install the tools and print your very first Hello, World.",
      content: `## What you need before writing Kotlin

Kotlin runs on the **JVM**. To compile and run Kotlin files you need two things:

- **JDK** (Java Development Kit) — provides the Java runtime
- **Kotlin compiler** (\`kotlinc\`) — turns .kt files into JVM bytecode

### Installing on Linux

\`\`\`bash
# Ubuntu / Debian
sudo snap install kotlin --classic
# or via SDKMAN
curl -s "https://get.sdkman.io" | bash
sdk install kotlin
\`\`\`

You can also use **IntelliJ IDEA** (free Community edition), which bundles the Kotlin plugin and lets you run Kotlin files without touching the terminal.

### Your first program

\`\`\`kotlin
fun main() {
    println("Hello, World!")
}
\`\`\`

- \`fun\` declares a function (here named \`main\`)
- \`main\` is the special **entry point** — the JVM looks for it and runs it
- \`println(...)\` prints a line of text

### Run it from the terminal

\`\`\`bash
kotlinc Hello.kt -include-runtime -d hello.jar
java -jar hello.jar
\`\`\`

Or with modern \`kotlinc\` you can run a script directly:

\`\`\`bash
kotlinc -script Hello.kts
\`\`\`

> **Key idea:** Every Kotlin program starts at \`main\`. Whatever you write inside the braces runs first.

### Try it

\`\`\`kotlin
fun main() {
    println("Hello from Kotlin!")
    println(6 * 7)
}
\`\`\`

Guess what prints first, then run it.`,
    },
    {
      name: "val and var",
      minutes: 7,
      intro: "Immutable vs mutable — the two ways to store a value.",
      content: `### Two keywords, one purpose: storing values

- **\`val\`** — a read-only reference. Assigned once, cannot be reassigned.
- **\`var\`** — a mutable reference. Can be reassigned any number of times.

\`\`\`kotlin
fun main() {
    val name = "Gokul"   // immutable
    var score = 42       // mutable

    // name = "Bob"      // ERROR: Val cannot be reassigned
    score = 55           // OK
    println("$name scored $score")
}
\`\`\`

### Prefer val over var

Reassigning a variable later is the #1 source of bugs. If a value never changes, declare it as \`val\`. The compiler will catch you if you try to reassign it.

### Type is inferred

You don't have to write the type — Kotlin infers it:

\`\`\`kotlin
val message = "hello"    // inferred String
val count = 10           // inferred Int
\`\`\`

You can also write the type explicitly:

\`\`\`kotlin
val message: String = "hello"
\`\`\`

> **Rule of thumb:** default to \`val\`. Only switch to \`var\` when you know the value will change.`,
    },
    {
      name: "Data Types",
      minutes: 10,
      intro: "The box types every value lives in: numbers, booleans, text.",
      content: `### The core types

| Type | Example | Meaning |
|------|---------|---------|
| \`Int\` | \`42\` | Whole number (32-bit) |
| \`Long\` | \`42L\` | Big whole number (64-bit) |
| \`Double\` | \`3.14\` | Decimal number |
| \`Float\` | \`3.14f\` | Decimal number (less precise) |
| \`Boolean\` | \`true\` | True or false |
| \`Char\` | \`'A'\` | A single character |
| \`String\` | \`"hi"\` | A sequence of characters |

### Whole numbers: Int vs Long

\`\`\`kotlin
val small: Int = 2_000_000_000
val big: Long = 5_000_000_000L   // the L marks it as Long
\`\`\`

Underscores between digits are just for readability — \`1_000\` is \`1000\`.

### Decimal numbers: Double vs Float

\`\`\`kotlin
val pi: Double = 3.14159
val approx: Float = 3.14f     // the f marks it as Float
\`\`\`

**Double** is the default for decimals. Use **Float** mainly when you need to save memory.

### Boolean

\`\`\`kotlin
val isDone = true
val isLearning = false
\`\`\`

### Type conversion

Kotlin will **not** silently convert between number types. You must convert explicitly:

\`\`\`kotlin
val a: Int = 5
val b: Long = a.toLong()   // explicit conversion
\`\`\`

> **Key idea:** Pick the type that matches the data. Use Int for ordinary counting, Long for large counts, Double for math with fractions, Boolean for yes/no flags.`,
    },
    {
      name: "Operators",
      minutes: 10,
      intro: "Arithmetic, comparison, logical, and assignment operators.",
      content: `### Arithmetic operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`+\` | Addition | \`4 + 3\` → \`7\` |
| \`-\` | Subtraction | \`9 - 2\` → \`7\` |
| \`*\` | Multiplication | \`3 * 4\` → \`12\` |
| \`/\` | Division | \`10 / 3\` → \`3\` (Int division!) |
| \`%\` | Remainder | \`10 % 3\` → \`1\` |

**Int division gotcha:** \`10 / 3\` gives \`3\`, not \`3.33\`, because both operands are Int. Use a Double if you want the fraction:

\`\`\`kotlin
val a = 10 / 3        // 3
val b = 10.0 / 3      // 3.3333...
val c = 10 % 3        // 1 (10 divided by 3 leaves remainder 1)
\`\`\`

### Comparison operators

\`\`\`kotlin
10 > 5      // true
10 < 5      // false
10 >= 10    // true
10 == 5     // false
10 != 5     // true
\`\`\`

### Logical operators

\`\`\`kotlin
val sunny = true
val warm = false

sunny && warm   // false  (AND — both must be true)
sunny || warm   // true   (OR — at least one true)
!sunny          // false  (NOT — flips it)
\`\`\`

### Assignment shortcuts

\`\`\`kotlin
var n = 10
n += 2   // n = 12
n -= 1   // n = 11
n *= 2   // n = 22
n /= 2   // n = 11
n++      // n = 12
n--      // n = 11
\`\`\`

> **Key idea:** \`/\` on two Ints returns an Int and drops the remainder. Use \`%\` to get what's left over — essential for "is even/odd" checks and cycling through ranges.`,
    },
  ],
}