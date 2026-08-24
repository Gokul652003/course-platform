import type { Module } from "../types"

export const tsModule5: Module = {
  id: 5,
  title: "Classes & Object-Oriented TypeScript",
  status: "upcoming",
  lessons: [
    {
      name: "Classes: Properties, Constructors & Access Modifiers",
      minutes: 10,
      intro:
        "Learn how TypeScript adds typed properties, constructor parameter properties, and access modifiers on top of JavaScript classes — and why those modifiers are a compile-time contract, not a runtime lock.",
      content: `## Classes are still JavaScript classes

TypeScript doesn't invent a new class system — it types the one JavaScript already has. Every \`class\` you write compiles down to an ordinary ES2015+ JavaScript class once the type annotations are stripped away. What TypeScript adds is the ability to declare, up front, exactly what shape an instance has and to have the compiler check every assignment against it.

In plain JavaScript, a class property only exists once a constructor assigns it — there's no way to declare "this class has an \`x\` and a \`y\`" independently of the constructor body. TypeScript requires (or at least strongly encourages, under \`strict\` mode) that you declare each property's type explicitly:

\`\`\`ts
class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

const p = new Point(3, 4)
p.x = "not a number" // Error: Type 'string' is not assignable to type 'number'
\`\`\`

With \`strictPropertyInitialization\` on (part of \`strict\` mode), the compiler also checks that every declared property is actually assigned by the end of the constructor — either directly, via an inline initializer (\`x: number = 0\`), or you mark it as possibly \`undefined\` until later (\`x?: number\`) or promise the compiler you'll assign it some other way with a definite assignment assertion (\`x!: number\`). Leaving a declared property genuinely unassigned is a class of bug TypeScript is specifically designed to catch before it becomes a runtime \`undefined\`.

## Constructor parameter properties (a shorthand)

Writing "declare the property, then assign it in the constructor" for every single field gets repetitive fast, so TypeScript offers a shorthand: prefix a constructor parameter with an access modifier (\`public\`, \`private\`, \`protected\`, or \`readonly\`) and TypeScript both declares the property *and* assigns it from the parameter automatically.

\`\`\`ts
// Without parameter properties — three lines of ceremony per field
class PointVerbose {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

// With parameter properties — identical result, one line
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

const p = new Point(3, 4)
p.x // 3, typed as number
\`\`\`

The constructor body can stay empty (or hold other logic) — the property declaration and the assignment both happen implicitly from the parameter list. This shorthand is idiomatic TypeScript and shows up constantly in real codebases, especially for small data-holding classes and for dependency-injection-style constructors.

## public, private, and protected

TypeScript adds three access modifiers you can put on any property or method, controlling where it's visible *to the type checker*:

| Modifier | Visible from | Typical use |
|---|---|---|
| \`public\` (default) | Anywhere — inside the class, subclasses, and outside callers | Ordinary API surface |
| \`protected\` | Inside the class and any subclass, not from outside | Shared implementation details for a class hierarchy |
| \`private\` | Only inside the declaring class itself, not subclasses, not outside | Internal state nothing else should touch |

\`\`\`ts
class BankAccount {
  private balance: number

  constructor(openingBalance: number) {
    this.balance = openingBalance
  }

  deposit(amount: number): void {
    this.balance += amount
  }

  get currentBalance(): number {
    return this.balance
  }
}

const acct = new BankAccount(100)
acct.deposit(50)
acct.balance // Error: Property 'balance' is private and only accessible within class 'BankAccount'
\`\`\`

That last line is a **compile-time** error only. This is the detail that trips people up: \`private\` and \`protected\` are erased completely when TypeScript compiles to JavaScript. Compile the \`BankAccount\` class above and inspect the output, and \`balance\` is an entirely ordinary property:

\`\`\`js
// compiled output — no trace of "private" survives
class BankAccount {
  constructor(openingBalance) {
    this.balance = openingBalance
  }
  deposit(amount) {
    this.balance += amount
  }
  get currentBalance() {
    return this.balance
  }
}
\`\`\`

At runtime, \`acct.balance\` is a completely ordinary, readable, writable property — \`console.log(acct.balance)\` prints \`150\` without complaint, and so does \`acct.balance = 99999\`. Anyone with access to the compiled JavaScript (which is *everyone*, since that's what actually ships to a browser or Node process) can read or mutate it directly, bypassing the class entirely. \`private\` in TypeScript is a tool for catching mistakes and communicating intent among people using the type checker — a teammate, your own future self, an IDE's autocomplete — not a security or encapsulation boundary enforced by the language runtime.

## True runtime privacy: \`#\` private fields

JavaScript itself (independent of TypeScript, standardized in ES2022) has a genuinely private field syntax: prefix the name with \`#\`. TypeScript fully supports this native syntax, and unlike \`private\`, it is **not** erased — it compiles to real, runtime-enforced private state.

\`\`\`ts
class BankAccount {
  #balance: number

  constructor(openingBalance: number) {
    this.#balance = openingBalance
  }

  deposit(amount: number): void {
    this.#balance += amount
  }

  get currentBalance(): number {
    return this.#balance
  }
}

const acct = new BankAccount(100)
acct.#balance // SyntaxError at compile time — AND genuinely inaccessible at runtime
\`\`\`

Even after compiling down to plain JavaScript, \`#balance\` remains truly private: it doesn't show up in \`Object.keys(acct)\`, \`JSON.stringify(acct)\` silently omits it, and there is no bracket-notation trick (\`acct["#balance"]\` doesn't work — the \`#\` isn't part of the property's string name at all) that reaches it from outside the class. The JavaScript engine itself enforces the boundary.

| | \`private\` (TypeScript) | \`#field\` (native JavaScript) |
|---|---|---|
| Enforced by | The type checker, at compile time only | The JavaScript runtime itself |
| Survives compilation to JS | No — becomes an ordinary property | Yes — stays genuinely private |
| Accessible via bracket notation, \`Object.keys\`, reflection | Yes, always | No, never |
| Requires a modern JS target | No | Effectively yes — needs an ES2022-aware target/runtime, or a compiler downlevel transform |
| Works on any class member kind | Properties, methods, accessors | Properties, methods, accessors |

Given native private fields exist and are genuinely enforced, when should you still reach for \`private\`? In practice, most application codebases where the entire team goes through \`tsc\` use \`private\` for everyday internal state — it's slightly more concise, plays a little more smoothly with some tooling and decorators, and "the whole team only ever interacts with this through the compiler" makes the compile-time-only guarantee good enough. Reach for \`#field\` specifically when you need encapsulation that survives past the type checker — most notably when authoring a **published library** whose compiled JavaScript output will be consumed by code the type checker never sees at all, including plain-JavaScript callers with no type safety of their own.

> **Key idea:** TypeScript's \`public\`/\`protected\`/\`private\` modifiers are compile-time-only — they vanish entirely from the emitted JavaScript, so they document intent and catch mistakes for anyone going through the type checker, but do not stop runtime access. Native \`#field\` syntax, by contrast, is enforced by the JavaScript engine itself and remains genuinely private after compilation — reach for it when real encapsulation matters, such as in a published library consumed by untyped code.`,
    },
    {
      name: "Interfaces, implements & Abstract Classes",
      minutes: 10,
      intro:
        "Have a class implement one or more interfaces to satisfy a shape contract, and use abstract classes to share partial implementation while still forcing subclasses to fill in specifics.",
      content: `## implements: satisfying a shape contract

An interface describes a shape — what properties and methods something must have — without providing any implementation. A class can declare that it \`implements\` one or more interfaces, and the compiler checks that the class's public surface actually matches:

\`\`\`ts
interface Shape {
  area(): number
  perimeter(): number
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius
  }
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number,
  ) {}

  area(): number {
    return this.width * this.height
  }

  perimeter(): number {
    return 2 * (this.width + this.height)
  }
}
\`\`\`

If \`Circle\` forgot to implement \`perimeter()\`, or implemented it with the wrong signature (say, returning a \`string\`), TypeScript would flag it immediately at the class declaration — you don't have to wait until something calls the missing method to find out it's broken. A class can implement more than one interface at once, separated by commas, and it must satisfy every one of them:

\`\`\`ts
interface Named {
  name: string
}

interface Runnable {
  run(): void
}

class Robot implements Named, Runnable {
  constructor(public name: string) {}
  run(): void {
    console.log(\`\${this.name} is running\`)
  }
}
\`\`\`

## implements vs extends

It's easy to conflate these because both appear on a class declaration, but they do fundamentally different jobs:

| | \`extends\` | \`implements\` |
|---|---|---|
| What it inherits from | Exactly one class | Any number of interfaces |
| Shares implementation | Yes — inherited methods/properties actually run | No — only checks the shape matches, provides zero code |
| Access to \`super\` | Yes, calls the parent class's constructor/methods | No — there's no implementation to call into |
| Can be combined | A class can \`extends\` one class **and** \`implements\` several interfaces at once | |

\`\`\`ts
class Animal {
  constructor(public name: string) {}
  describe(): string {
    return \`This is \${this.name}\`
  }
}

class Dog extends Animal implements Runnable {
  run(): void {
    console.log(\`\${this.name} is running\`)
  }
}
\`\`\`

\`Dog\` inherits \`describe()\` and the constructor behavior from \`Animal\` via \`extends\`, while separately promising to satisfy the \`Runnable\` shape via \`implements\` — and it has to provide \`run()\` itself, because interfaces never contribute code.

## Abstract classes and abstract methods

An abstract class sits between a plain class and an interface: it **can** hold real implementation and state (unlike an interface), but it can also declare methods with no body — \`abstract\` methods — that every concrete subclass is required to implement. And critically, an abstract class can never be instantiated directly.

\`\`\`ts
abstract class Shape {
  abstract area(): number

  // a concrete method, shared by every subclass automatically
  describe(): string {
    return \`This shape has an area of \${this.area().toFixed(2)}\`
  }
}

class Circle extends Shape {
  constructor(private radius: number) {}
  area(): number {
    return Math.PI * this.radius ** 2
  }
}

const s = new Shape() // Error: Cannot create an instance of an abstract class
const c = new Circle(5)
c.describe() // "This shape has an area of 78.54" — describe() is inherited, unimplemented in Circle
\`\`\`

\`Shape\` provides \`describe()\` once, for free, to every subclass — something an interface can never do, since an interface has no method bodies at all. But it still forces every concrete subclass to supply its own \`area()\`, the same way an interface would. If \`Circle\` forgot to implement \`area()\`, TypeScript would refuse to compile it as a concrete class.

## Choosing between an interface and an abstract class

| Use... | When... |
|---|---|
| An interface | You only need to describe a shape — no shared code, and you want a class to be able to satisfy several unrelated contracts at once |
| An abstract class | You want to share real implementation and state across a family of related subclasses, in addition to forcing them to fill in specifics |
| Both together | Very common — a class \`extends\` one abstract base for shared behavior, and separately \`implements\` one or more interfaces for additional shape contracts |

A useful rule of thumb: reach for an interface first, since it's the more flexible, lower-commitment tool — a class can implement any number of them, and so can completely unrelated classes elsewhere in the codebase. Reach for an abstract class specifically when you catch yourself copy-pasting the same method body into every class implementing an interface — that's the signal that there's real, shared implementation worth centralizing, not just a shape to satisfy.

> **Key idea:** \`implements\` only checks that a class's public shape matches one or more interfaces — it contributes zero code. \`extends\` shares real implementation from exactly one parent class. \`abstract\` classes combine both ideas: they can hold genuine shared implementation while still forcing subclasses to fill in specific \`abstract\` members, and — unlike an ordinary class — can never be instantiated directly.`,
    },
    {
      name: "Readonly, Static Members & Class Fields",
      minutes: 9,
      intro:
        "Lock a property after construction with readonly, share state and behavior across all instances with static members, and see how typed getters/setters and generics extend what a class can express.",
      content: `## readonly properties

Prefixing a property with \`readonly\` tells the compiler that, once set, it can never be reassigned — with one exception: assignment is still allowed inside the declaring class's own constructor, since that's considered part of initialization.

\`\`\`ts
class Config {
  readonly apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl // fine — this is the constructor
  }

  changeUrl(newUrl: string): void {
    this.apiUrl = newUrl // Error: Cannot assign to 'apiUrl' because it is a read-only property
  }
}
\`\`\`

Like \`private\`, \`readonly\` is a compile-time-only guarantee — it's checked by the type checker and erased from the emitted JavaScript, so it doesn't stop a determined caller working outside the type system, but it does stop an entire class of accidental bugs where a value that should be immutable after construction gets quietly mutated somewhere deep in a method. Think of it as the property-level equivalent of declaring a variable with \`const\` instead of \`let\` — \`const\` prevents *reassigning the binding*, and \`readonly\` prevents *reassigning the property*, both purely as compile-time discipline. \`readonly\` also combines with the constructor parameter property shorthand from the first lesson: \`constructor(readonly id: string) {}\` declares, assigns, and locks a property in one line.

## static properties and methods

Every property and method covered so far belongs to an **instance** — each \`new\` call gets its own copy. A \`static\` member instead belongs to the class itself, shared across every instance, and is accessed through the class name rather than through an instance:

\`\`\`ts
class Counter {
  static instanceCount = 0

  constructor() {
    Counter.instanceCount++
  }
}

new Counter()
new Counter()
new Counter()
Counter.instanceCount // 3
\`\`\`

There is exactly one \`instanceCount\`, not one per \`Counter\` instance — it tracks something about the class as a whole. Static methods are just as common, and one of the most useful patterns is the **static factory method**: a named, static constructor-like function that can do validation or alternate construction logic that a real constructor can't (constructors can't be conditionally skipped or return a different type):

\`\`\`ts
class UserId {
  private constructor(private readonly value: string) {}

  static fromString(raw: string): UserId {
    if (!raw.startsWith("usr_")) {
      throw new Error("Invalid user id format")
    }
    return new UserId(raw)
  }

  toString(): string {
    return this.value
  }
}

const id = UserId.fromString("usr_42") // the only way to get a UserId
const bad = new UserId("42") // Error: Constructor of class 'UserId' is private
\`\`\`

Marking the real constructor \`private\` and routing every construction through a static factory is a common pattern for enforcing validation at the single point where instances come into existence.

## Getters and setters with types

Accessor pairs — \`get\` and \`set\` — let a property-looking access (\`obj.value\`, no parentheses) actually run a method behind the scenes, and TypeScript types them like any other member. This is useful for computed, derived values, or for validating a value on write:

\`\`\`ts
class Temperature {
  #celsius: number

  constructor(celsius: number) {
    this.#celsius = celsius
  }

  get fahrenheit(): number {
    return (this.#celsius * 9) / 5 + 32
  }

  set fahrenheit(value: number) {
    this.#celsius = ((value - 32) * 5) / 9
  }

  get celsius(): number {
    return this.#celsius
  }
}

const t = new Temperature(0)
t.fahrenheit // 32 — reads like a property, runs the getter
t.fahrenheit = 212 // writes like a property, runs the setter
t.celsius // 100
\`\`\`

From the outside, \`t.fahrenheit\` looks exactly like accessing a plain field — the caller has no idea (and shouldn't need to care) that it's actually recomputing a value from \`#celsius\` on every read. TypeScript checks the getter's return type and the setter's parameter type independently, and — as of modern TypeScript versions — even allows them to differ, which is handy for a setter that accepts a looser input type than the getter returns.

## A forward glance: generic classes

Everything in this module has used concrete, fixed types — a \`Point\` is always made of \`number\`s, a \`Counter\`'s count is always a \`number\`. But classes, like functions and interfaces, can also be parameterized over a type that's decided at the point of use:

\`\`\`ts
class Box<T> {
  constructor(private value: T) {}
  get(): T {
    return this.value
  }
}

const numberBox = new Box<number>(42)
const stringBox = new Box<string>("hello")
\`\`\`

\`Box<T>\` is the same class definition reused for any type, with full type safety preserved at every call site — \`numberBox.get()\` is known to return \`number\`, not \`unknown\` or \`any\`. This is exactly the generics feature covered in full starting next module — everything from a typed \`Stack<T>\` to constrained type parameters builds directly on the class fundamentals from this module.

> **Key idea:** \`readonly\` locks a property after construction as a compile-time-only guarantee, \`static\` members belong to the class itself rather than any one instance (and enable patterns like private-constructor static factories), and typed \`get\`/\`set\` accessors let property-style access run real logic behind the scenes — all of it composing directly with the generic classes covered next.`,
    },
  ],
}
