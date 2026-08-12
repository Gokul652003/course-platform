import type { Module } from "../types"

export const kotlinModule6: Module = {
  id: 6,
  title: "Functional & Advanced",
  status: "upcoming",
  lessons: [
    {
      name: "Lambda Functions",
      minutes: 9,
      intro: "Anonymous functions you can pass around like data.",
      content: `### A lambda is a function without a name

\`\`\`kotlin
val add: (Int, Int) -> Int = { a, b -> a + b }

println(add(3, 4))   // 7
\`\`\`

Read the type: a function that takes two Ints and returns an Int.

### Structure

\`\`\`kotlin
{ parameterList -> body }
\`\`\`

The last expression in the body is the result.

### The implicit 'it'

For a single-parameter lambda you can skip naming it:

\`\`\`kotlin
val double = { x: Int -> x * 2 }   // explicit
val square: (Int) -> Int = { it * it }   // implicit it
\`\`\`

### A lambda is a value

\`\`\`kotlin
fun apply(op: (Int, Int) -> Int, a: Int, b: Int): Int {
    return op(a, b)
}

apply({ x, y -> x + y }, 3, 4)     // 7
apply({ x, y -> x * y }, 3, 4)     // 12
\`\`\`

You're passing behavior itself as an argument.

> **Key idea:** A lambda is an object that *is* a function. Name its parameters or use \`it\`; the last expression is the return value.`,
    },
    {
      name: "Higher-Order Functions",
      minutes: 10,
      intro: "Functions that take functions or return them — the heart of Kotlin's style.",
      content: `### Taking a function as a parameter

\`\`\`kotlin
fun repeat(times: Int, action: () -> Unit) {
    for (i in 1..times) {
        action()
    }
}

repeat(3) { println("Hello!") }
\`\`\`

The trailing lambda syntax — when the last argument is a lambda, it goes outside the parentheses.

### Trailing lambda readability

\`\`\`kotlin
val numbers = listOf(1, 2, 3, 4, 5)

numbers.filter { it % 2 == 0 }
numbers.map { it * it }
numbers.reduce { acc, n -> acc + n }
\`\`\`

These all take lambdas. The trailing abbreviation makes them read like built-in language features.

### Returning a function

\`\`\`kotlin
fun multiplier(factor: Int): (Int) -> Int = { it * factor }

val timesThree = multiplier(3)
timesThree(5)   // 15
\`\`\`

### Function types recap

| Syntax | Meaning |
|--------|---------|
| \`() -> Unit\` | takes nothing, returns nothing |
| \`(Int) -> Int\` | takes Int, returns Int |
| \`(Int, Int) -> Int\` | takes two Ints, returns Int |

> **Key idea:** Higher-order functions let you pass behavior as data. When the last arg is a lambda, drop it outside the parens for clean code.`,
    },
    {
      name: "Scope Functions",
      minutes: 11,
      intro: "let, run, with, apply, also — five tools that shape how you write Kotlin.",
      content: `### The five scope functions

They let you run code *in the context* of an object. The difference is **how the object is referenced** (\`it\` vs \`this\`) and **what's returned**.

\`\`\`kotlin
data class Person(var name: String, var age: Int)
\`\`\`

### apply — configure and return the object

\`\`\`kotlin
val person = Person("", 0).apply {
    name = "Gokul"
    age = 30
}
// apply returns the object itself → perfect for setup
\`\`\`

### also — side effects, returns the object

\`\`\`kotlin
val list = mutableListOf(1, 2, 3).also {
    println("Created: $it")   // see the object, keep working with it
}
\`\`\`

### let — run code on a value, return the result

\`\`\`kotlin
val doubled = "42".let { it.toInt() * 2 }   // 84
// Great with nullable values + safe call
val name: String? = "Gokul"
name?.let { println("Not null: $it") }
\`\`\`

### run — return a result, work with this

\`\`\`kotlin
val length = "Kotlin".run {
    println("Processing $this")
    this.length
}
// 6
\`\`\`

### with — like run but called differently

\`\`\`kotlin
with(person) {
    println("$name is $age")
}
\`\`\`

### Cheat sheet

| Function | Refers to | Returns | Use for |
|----------|-----------|---------|---------|
| \`let\` | \`it\` | lambda result | nullable + transform |
| \`run\` | \`this\` | lambda result | compute + transform |
| \`with\` | \`this\` | lambda result | group calls on an object |
| \`apply\` | \`this\` | the object | configure object |
| \`also\` | \`it\` | the object | side effects / logging |

> **Key idea:** Pick by two questions — do you need the object back (apply/also) or a computed result (let/run/with)? And do you prefer \`it\` or \`this\`?`,
    },
    {
      name: "Extension Functions",
      minutes: 9,
      intro: "Add new functions to existing types you don't own.",
      content: `### Add behavior to any type

\`\`\`kotlin
fun String.isPalindrome(): Boolean {
    return this == this.reversed()
}

fun main() {
    println("racecar".isPalindrome())   // true
    println("hello".isPalindrome())     // false
}
\`\`\`

Inside the extension, \`this\` is the receiver — the value you called it on.

### You can't see private members

Extensions can use only the public API of the type. They can't break encapsulation.

### Extensions are still just functions

Under the hood, \`isPalindrome()\` compiles to a static function taking a String. That means:

- You can't truly *override* in a subclass — dispatch is on the static type
- They can be simulated easily and cost nothing

### Real-world examples

\`\`\`kotlin
fun String?.isNullOrBlank(): Boolean = this == null || this.isBlank()

fun Int.isEven(): Boolean = this % 2 == 0

listOf(1, 2, 3, 4).filter { it.isEven() }   // [2, 4]
\`\`\`

### Extending existing library types

\`\`\`kotlin
fun StringBuilder.wrap(tag: String) {
    insert(0, "<$tag>")
    append("</$tag>")
}
\`\`\`

You can even extend \`String\`, \`List\`, or any Java class — you don't need to own the code.

> **Key idea:** Extensions let you add methods to types you didn't write. The receiver is \`this\`. They're static helpers under the hood — powerful and cheap.`,
    },
    {
      name: "Generics",
      minutes: 12,
      intro: "Write once, work with any type — safely.",
      content: `### The problem: code that works for any type

Without generics you'd copy-paste a class for every type. Generics parameterize the type:

\`\`\`kotlin
class Box<T>(val value: T)

val intBox = Box(42)              // Box<Int>
val strBox = Box("hello")         // Box<String>
val mixed = Box(3.14)             // Box<Double>
\`\`\`

\`T\` is a placeholder for "some type". The compiler infers it.

### Simpler — generic functions

\`\`\`kotlin
fun <T> repeatValue(v: T, times: Int): List<T> =
    List(times) { v }

repeatValue("a", 3)    // [a, a, a]
repeatValue(7, 2)      // [7, 7]
\`\`\`

### Type parameters with bounds

Constrain what T can be:

\`\`\`kotlin
fun <T : Comparable<T>> maxOf(a: T, b: T): T =
    if (a > b) a else b

maxOf(3, 7)     // 7
maxOf("a", "z") // "z"
\`\`\`

\`T : Comparable<T>\` means "T must be a Comparable". The compiler enforces it.

### Generic collection types everywhere

\`\`\`kotlin
val names: List<String> = listOf("a", "b")
val scores: Map<String, Int> = mapOf("A" to 10)
val seats: Set<Int> = setOf(1, 2, 3)
\`\`\`

### Multiple type parameters

\`\`\`kotlin
class Pair<A, B>(val first: A, val second: B)
val p = Pair("key", 42)
\`\`\`

> **Key idea:** Generics write behavior once and let any type plug in. Bounds (\`T : SomeType\`) add safety by restricting which types are allowed.`,
    },
  ],
}