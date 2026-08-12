import type { Module } from "../types"

export const kotlinModule4: Module = {
  id: 4,
  title: "Null Safety & Collections",
  status: "upcoming",
  lessons: [
    {
      name: "Null Safety",
      minutes: 12,
      intro: "The feature that kills an entire class of crashes — handled at compile time.",
      content: `### The null problem

Other languages crash at runtime:
\`\`\`java
String name = null;
name.length();   // NullPointerException at runtime 💥
\`\`\`

Kotlin moves this check to **compile time**. By default, a variable simply *cannot* be null.

### Types are explicitly nullable or not

\`\`\`kotlin
val name: String = "Gokul"    // non-null — always safe
val nick: String? = null      // nullable — marked with ?
\`\`\`

- \`String\` → cannot hold null
- \`String?\` → may hold null

### String?.length → compiler error

\`\`\`kotlin
val nick: String? = null
nick.length   // ERROR: only safe (?.) or non-null asserted (!!.) calls allowed
\`\`\`

### Safe call — ?.

\`\`\`kotlin
val nick: String? = "goku"
println(nick?.length)   // 4, or null if nick was null

val nobody: String? = null
println(nobody?.length) // null — doesn't crash
\`\`\`

### Elvis operator — ?:

Provide a default when the value is null:

\`\`\`kotlin
val len = nick?.length ?: 0    // if nick null, use 0
\`\`\`

### The !! non-null assertion

Use only when you are 100% sure it isn't null. If you're wrong, it throws:

\`\`\`kotlin
val len = nick!!.length   // crashes if nick is null
\`\`\`

### Smart cast

After a null check, Kotlin automatically treats the value as non-null:

\`\`\`kotlin
fun printLen(s: String?) {
    if (s != null) {
        println(s.length)   // smart cast — safe here
    }
}
\`\`\`

> **Key idea:** Nullability is part of the type: \`String?\` may be null, \`String\` never is. Use \`?.\` for safety and \`?:\` to fill in defaults.`,
    },
    {
      name: "Collections",
      minutes: 12,
      intro: "Lists, sets, and maps — the containers you'll use constantly.",
      content: `### List — ordered, with duplicates

\`\`\`kotlin
val fruits = listOf("apple", "banana", "apple")   // immutable
val mutable = mutableListOf("apple")

mutable.add("cherry")        // can change
println(fruits[0])           // apple
println(fruits.size)         // 3
\`\`\`

### Set — unique, unordered

\`\`\`kotlin
val unique = setOf(1, 2, 2, 3)   // {1, 2, 3} — duplicates dropped
val present = 2 in unique        // true  (fast lookup)
\`\`\`

### Map — key → value

\`\`\`kotlin
val scores = mapOf("Alice" to 90, "Bob" to 78)
println(scores["Alice"])     // 90
val mutableScores = mutableMapOf("Alice" to 90)
mutableScores["Bob"] = 78
\`\`\`

The \`to\` makes a key-value pair.

### Read-only vs mutable

Kotlin splits the two:

- \`listOf\`, \`setOf\`, \`mapOf\` → read-only (can't add/remove)
- \`mutableListOf\`, \`mutableSetOf\`, \`mutableMapOf\` → changeable

Read-only doesn't mean immutable deep down, but it signals intent — prefer read-only and only switch when you must mutate.

### Common operations

\`\`\`kotlin
val numbers = listOf(3, 1, 4, 1, 5)

numbers.first()     // 3
numbers.last()      // 5
numbers.sum()       // 14
numbers.sorted()    // [1, 1, 3, 4, 5]
numbers.filter { it > 2 }    // [3, 4, 5]
numbers.map { it * 10 }      // [30, 10, 40, 10, 50]
\`\`\`

### Iterating

\`\`\`kotlin
for (n in numbers) {
    println(n)
}
\`\`\`

> **Key idea:** List = ordered stack of items (dupes ok). Set = uniqueness. Map = key→value lookup. Prefer the read-only \`...Of\` variants by default.`,
    },
  ],
}