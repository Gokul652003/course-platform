import type { Module } from "../types"

export const kotlinModule5: Module = {
  id: 5,
  title: "Object-Oriented Kotlin",
  status: "upcoming",
  lessons: [
    {
      name: "Classes & Objects",
      minutes: 10,
      intro: "Blueprint, then instance — modeling the world as objects.",
      content: `### A class is a blueprint

\`\`\`kotlin
class Car {
    var color = "red"
    var speed = 0

    fun accelerate() {
        speed += 10
    }
}
\`\`\`

### An object is an instance

\`\`\`kotlin
fun main() {
    val myCar = Car()        // build one from the blueprint
    println(myCar.color)     // red
    myCar.accelerate()       // call its method
    println(myCar.speed)     // 10

    val otherCar = Car()     // independent instance
    println(otherCar.speed)  // 0
}
\`\`\`

Creating an instance with \`Car()\` calls the class **constructor**.

### Properties vs methods

- **Properties** — data held by the object (\`color\`, \`speed\`)
- **Methods** — behavior (\`accelerate()\`)

### Properties are automatically accessible

\`\`\`kotlin
myCar.color = "blue"    // readable and writable by default
\`\`\`

> **Key idea:** The class is the template; \`YourClass()\` stamps out a real instance with its own copy of the data.`,
    },
    {
      name: "Constructors",
      minutes: 10,
      intro: "Primary and secondary constructors — pass setup data in.",
      content: `### Primary constructor

Declared right after the class name:

\`\`\`kotlin
class Car(val color: String, val brand: String) {
    var speed = 0
}

val car = Car("red", "Toyota")
println(car.brand)   // Toyota
\`\`\`

\`val\`/\`var\` in the constructor **automatically creates properties**. No boilerplate fields needed.

### Property with a default

\`\`\`kotlin
class Car(val color: String, val brand: String = "unknown") {
    var speed = 0
}

val car = Car("red")   // brand defaults to "unknown"
\`\`\`

### Class body can initialize more

\`\`\`kotlin
class Car(val color: String) {
    var speed = 0
    init {
        println("Car $color created")
    }
}
\`\`\`

The \`init\` block runs when the object is constructed.

### Secondary constructors

Use when you need extra ways to build the object. They must delegate to the primary:

\`\`\`kotlin
class Car(val color: String) {
    var speed = 0
    constructor(color: String, speed: Int) : this(color) {
        this.speed = speed
    }
}
\`\`\`

> **Key idea:** Constructor parameters + \`val\`/\`var\` = automatic properties. Prefer primary constructors with defaults over secondary ones.`,
    },
    {
      name: "Inheritance",
      minutes: 11,
      intro: "Extending a class — reusing and overriding behavior.",
      content: `### Classes are closed by default

In Kotlin, a class must be marked \`open\` before another can inherit from it:

\`\`\`kotlin
open class Animal(val name: String) {
    open fun speak() {
        println("$name makes a sound")
    }
}
\`\`\`

### Create a subclass with : Parent(...)

\`\`\`kotlin
class Dog(name: String) : Animal(name) {
    override fun speak() {
        println("$name barks")
    }
}

fun main() {
    val dog = Dog("Rex")
    dog.speak()   // Rex barks
}
\`\`\`

- \`: Animal(name)\` — call the parent's constructor
- \`override\` — replaces the parent's implementation (parent's method must be \`open\`)

### Calling the parent

\`\`\`kotlin
override fun speak() {
    super.speak()      // run parent version first
    println("$name barks additionally")
}
\`\`\`

### Using the base type

\`\`\`kotlin
val pet: Animal = Dog("Rex")
pet.speak()   // Rex barks — polymorphism
\`\`\`

A \`Dog\` *is an* \`Animal\`, so it fits anywhere an \`Animal\` is expected.

> **Key idea:** Mark parents and methods \`open\`, inherit with \`:\`, and override with \`override\`. This enables reuse and polymorphism.`,
    },
    {
      name: "Interfaces",
      minutes: 9,
      intro: "A contract of behavior that classes agree to implement.",
      content: `### Declare an interface

\`\`\`kotlin
interface Drivable {
    fun start()              // must be implemented
    fun stop()               // must be implemented
    fun honk() {             // has a default implementation
        println("Beep!")
    }
}
\`\`\`

### Implement with :

\`\`\`kotlin
class Car : Drivable {
    override fun start() {
        println("Car starting")
    }
    override fun stop() {
        println("Car stopping")
    }
    // honk() is inherited as-is
}

class Bike : Drivable {
    override fun start() = println("Bike ready")
    override fun stop() = println("Bike stopped")
    override fun honk() = println("Ring ring!")
}
\`\`\`

### A class can implement many interfaces

\`\`\`kotlin
class AmphibiousCar : Drivable, Floatable
\`\`\`

(Unlike a class, you can have only **one** parent, but **many** interfaces.)

### Use the interface type

\`\`\`kotlin
fun go(d: Drivable) {
    d.start()
    d.honk()
}

go(Car())
go(Bike())
\`\`\`

> **Key idea:** An interface says *what* a thing can do, not *how*. Any class that matches the contract can be used as that interface.`,
    },
    {
      name: "Data Classes",
      minutes: 9,
      intro: "Classes that hold data — with equals, toString and more for free.",
      content: `### The boilerplate problem

In other languages, a data holder needs lots of boilerplate. In Kotlin:

\`\`\`kotlin
data class User(val name: String, val email: String)

val user = User("Gokul", "gokul@example.com")
\`\`\`

### What you get for free

\`\`\`kotlin
data class Point(val x: Int, val y: Int)

val p1 = Point(1, 2)
val p2 = Point(1, 2)

p1 == p2            // true — structural equality (compares values!)
println(p1)         // Point(x=1, y=2) — nice toString
p1.copy(y = 99)     // Point(x=1, y=99) — copied with change
val (x, y) = p1     // destructuring — x=1, y=2
\`\`\`

A data class automatically generates:

- \`equals()\` — value equality instead of reference equality
- \`hashCode()\`
- \`toString()\` — readable debug output
- \`copy()\` — clone with modifications
- \`componentN()\` — destructuring

### Rules

- The primary constructor must have at least one \`val\`/\`var\` parameter
- All primary constructor params must be \`val\`/\`var\`
- Data classes can't be \`open\` (sealed by default, effectively final)

> **Key idea:** If your class is mostly data, make it a \`data class\`. Comparisons, printing, copying and destructuring just work.`,
    },
    {
      name: "Enum Classes",
      minutes: 8,
      intro: "A fixed set of named constants, with properties and methods.",
      content: `### A simple enum

\`\`\`kotlin
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

val d = Direction.NORTH
\`\`\`

### Enums can carry data

\`\`\`kotlin
enum class Day(val short: String) {
    MONDAY("Mon"),
    TUESDAY("Tue"),
    FRIDAY("Fri"),
}
\`\`\`

### Each constant can have its own behavior

\`\`\`kotlin
enum class Operation {
    ADD { override fun apply(a: Int, b: Int) = a + b },
    MULTIPLY { override fun apply(a: Int, b: Int) = a * b };

    abstract fun apply(a: Int, b: Int): Int
}

Operation.MULTIPLY.apply(3, 4)   // 12
\`\`\`

### Useful built-ins

\`\`\`kotlin
Direction.values()           // all constants
Direction.valueOf("NORTH")   // the matching constant (throws if none)
Direction.NORTH.name         // "NORTH"
Direction.NORTH.ordinal      // 0 (position)
\`\`\`

### Enum vs when — perfect partners

\`\`\`kotlin
fun describe(dir: Direction) = when (dir) {
    Direction.NORTH -> "up"
    Direction.SOUTH -> "down"
    Direction.EAST -> "right"
    Direction.WEST -> "left"
}
\`\`\`

> **Key idea:** Enums model a small, known set of values. Combine them with \`when\` for exhaustive, safe branching.`,
    },
    {
      name: "Sealed Classes",
      minutes: 10,
      intro: "A restricted hierarchy — every possible subtype is known in advance.",
      content: `### The problem sealed solves

Imagine a result that is either Success or Error. With a regular \`open\` class you'd handle unknown cases forever. A **sealed class** restricts who can subclass it — all subtypes live in the same file/package, and the compiler knows them all.

\`\`\`kotlin
sealed class Result<out T> {
    data class Success<T>(val value: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
}
\`\`\`

### Exhaustive when — no else needed

Because the compiler knows every subtype, a \`when\` over a sealed type doesn't need an \`else\`:

\`\`\`kotlin
fun handle(r: Result<Int>): String = when (r) {
    is Result.Success -> "Got \${r.value}"
    is Result.Error -> "Failed: \${r.message}"
}
\`\`\`

Add a new subtype and the compiler **forces** you to handle it everywhere.

### Why it matters

- **Safety** — exhaustive handling is checked at compile time
- **Expressiveness** — models "either/or" states beautifully (network states, form states, UI states)
- **Maintainability** — the compiler tells you exactly where to update

### Common usage — UI state

\`\`\`kotlin
sealed class UiState {
    object Loading : UiState()
    data class Ready(val data: String) : UiState()
    data class Error(val message: String) : UiState()
}
\`\`\`

> **Key idea:** Sealed classes create a closed set of types. Combine with \`when\` to get compile-time exhaustiveness — the compiler guarantees you handled every case.`,
    },
  ],
}