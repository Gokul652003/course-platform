import type { Module } from "../types"

export const kotlinModule3: Module = {
  id: 3,
  title: "Functions",
  status: "upcoming",
  lessons: [
    {
      name: "Functions",
      minutes: 8,
      intro: "The building block of every Kotlin program.",
      content: `### Anatomy of a function

\`\`\`kotlin
fun greet() {
    println("Hello!")
}

fun main() {
    greet()          // call it
    greet()          // call it again
}
\`\`\`

- \`fun\` keyword declares the function
- \`greet\` is the name
- \`()\` holds the parameters (empty here)
- \`{ }\` is the body

### Single-expression functions

When a function is just one expression, you can drop the braces and use \`=\`:

\`\`\`kotlin
fun square(x: Int) = x * x
\`\`\`

This is idiomatic Kotlin for short functions — the return type is inferred.

### Why functions?

- **Reuse** — write once, call many times
- **Readability** — a well-named function reads like a sentence
- **Isolation** — each function does one narrow job

> **Key idea:** \`fun\` makes a callable unit. With a one-line body you can write \`fun name(args) = expression\` and skip the braces entirely.`,
    },
    {
      name: "Function Parameters & Return Values",
      minutes: 9,
      intro: "How data flows into a function and back out.",
      content: `### Parameters

\`\`\`kotlin
fun add(a: Int, b: Int): Int {
    return a + b
}

val result = add(3, 4)   // 7
\`\`\`

Every parameter needs a **name** and a **type**.

### Return type

After the parameter list, \`: Int\` declares what the function returns.

- Use \`return\` to hand a value back
- If nothing is returned, the type is \`Unit\` (like void) and can be omitted

\`\`\`kotlin
fun greet(name: String) {          // returns Unit, omitted
    println("Hi, \$name")
}

fun getName(): String = "Gokul"    // returns String from single expression
\`\`\`

### Multiple parameters

\`\`\`kotlin
fun combine(a: String, b: String, sep: String): String {
    return a + sep + b
}

combine("left", "right", " * ")   // "left * right"
\`\`\`

### When you call it

You pass arguments in the same order as the parameters:

\`\`\`kotlin
fun subtract(x: Int, y: Int) = x - y

subtract(10, 4)   // 6  (x=10, y=4)
subtract(4, 10)   // -6 (x=4, y=10)
\`\`\`

> **Key idea:** Inputs go in the parentheses, the output comes back via the return type. Order of arguments matters — unless you use named arguments.`,
    },
    {
      name: "Default & Named Arguments",
      minutes: 9,
      intro: "Skip parameters you don't care about, and call in any order.",
      content: `### Default parameters

Give a parameter a default value and callers can drop it:

\`\`\`kotlin
fun greet(name: String, greeting: String = "Hello") {
    println("\$greeting, \$name")
}

greet("Gokul")                 // Hello, Gokul
greet("Gokul", "Namaste")      // Namaste, Gokul
\`\`\`

### Named arguments — call in any order

When a function has several parameters, names make the call self-documenting and let you skip the middle ones:

\`\`\`kotlin
fun createOrder(
    item: String,
    qty: Int = 1,
    urgent: Boolean = false,
) = "\$qty x \$item" + if (urgent) " (URGENT)" else ""

createOrder(item = "Laptop", urgent = true)          // 1 x Laptop (URGENT)
createOrder("Mouse", qty = 3)                        // 3 x Mouse
createOrder(urgent = true, item = "Monitor", qty = 2)
\`\`\`

Once you use a named argument, the rest must be named too (if in order you can mix, but consistency is cleaner).

### Why this matters

- Defaults make functions **flexible** without overloads
- Named arguments remove the "which parameter was this again?" confusion
- Reading \`createOrder(item = "Laptop", urgent = true)\` is self-explanatory

> **Key idea:** Defaults reduce boilerplate; names remove ambiguity. Together they let callers use only the arguments they care about, in any order.`,
    },
  ],
}