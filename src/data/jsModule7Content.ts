import type { Module } from "../types"

export const jsModule7: Module = {
  id: 7,
  title: "this, Classes & OOP",
  status: "upcoming",
  lessons: [
    {
      name: "Understanding this",
      minutes: 11,
      intro: "The single most confusing keyword in JavaScript — determined by how a function is called, not where it's defined.",
      content: `### this is NOT determined by where a function is written

This is the single biggest source of confusion around \`this\`, so it's worth stating plainly up front, in direct contrast to lexical scope from module 4: while variable scope is fixed by where a function is *written*, \`this\` is determined by **how a function is called** — the exact same function can have a completely different \`this\` depending on the call.

### Rule 1: called as a method — this is the object before the dot

\`\`\`js
const person = {
  name: "Ada",
  greet() {
    return \`Hi, I'm \${this.name}\`
  },
}

console.log(person.greet())   // "Hi, I'm Ada" — this === person
\`\`\`

### Rule 2: called as a plain function — this is undefined (in strict mode/modules) or the global object

\`\`\`js
function whoAmI() {
  return this
}

console.log(whoAmI())   // undefined, in a module or strict mode — NOT person, NOT anything meaningful
\`\`\`

### The classic bug: losing this when a method is passed around

\`\`\`js
const person = {
  name: "Ada",
  greet() {
    return \`Hi, I'm \${this.name}\`
  },
}

const greetFn = person.greet    // extracted from person — the connection is lost!
console.log(greetFn())            // "Hi, I'm undefined" — this is no longer person

setTimeout(person.greet, 1000)    // SAME bug — passed as a plain function reference
// prints "Hi, I'm undefined" after 1 second
\`\`\`

This is a genuinely common, real bug: \`this\` is decided **at call time**, based on how the function is actually invoked — not by which object it was originally attached to when it was written. The moment \`person.greet\` is extracted and called on its own (as \`greetFn()\`, or handed to \`setTimeout\`), it's Rule 2's plain-function call, and \`this\` is no longer \`person\` at all.

### Rule 3: called with new — this is the newly created object

\`\`\`js
function Person(name) {
  this.name = name
}

const ada = new Person("Ada")
console.log(ada.name)   // "Ada" — this, inside the function, was the new object being constructed
\`\`\`

Covered in depth in the next lesson — \`new\` creates a fresh object and calls the function with \`this\` bound to it.

### Rule 4: explicit control — call, apply & bind

\`\`\`js
function greet() {
  return \`Hi, I'm \${this.name}\`
}

const person = { name: "Ada" }

console.log(greet.call(person))          // "Hi, I'm Ada" — call sets this explicitly, args individually
console.log(greet.apply(person))          // "Hi, I'm Ada" — apply is identical, but takes args as an array

const boundGreet = greet.bind(person)       // bind returns a NEW function, permanently bound to person
console.log(boundGreet())                     // "Hi, I'm Ada" — works even called standalone
setTimeout(boundGreet, 1000)                    // safe now — the binding survives being passed around
\`\`\`

\`.call(thisArg, arg1, arg2, ...)\` and \`.apply(thisArg, [arg1, arg2, ...])\` both invoke a function *immediately*, explicitly setting \`this\` for that one call — they differ only in how they accept additional arguments. \`.bind(thisArg)\` is different: it doesn't call the function at all — it returns a **new function** permanently locked to that \`this\`, safe to pass around or call later without losing the binding, directly fixing the bug from two examples above.

### Rule 5: arrow functions — this is inherited, never rebound

\`\`\`js
const person = {
  name: "Ada",
  greet: () => {
    return \`Hi, I'm \${this.name}\`   // arrow function — this comes from the ENCLOSING scope, not person!
  },
}

console.log(person.greet())   // "Hi, I'm undefined" — this is whatever "this" was outside the object literal
\`\`\`

Recall module 3's early flag: arrow functions don't have their *own* \`this\` at all — they use \`this\` from wherever they were lexically defined, exactly like a regular variable would follow the scope chain. This makes arrow functions the **wrong choice** for an object method that needs \`this\` to refer to that object — but it makes them the **right choice**, and a very common one, for a callback defined *inside* a method, where you specifically want to keep the surrounding \`this\`:

\`\`\`js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++   // arrow function inherits "this" from start() — correctly refers to timer
      console.log(this.seconds)
    }, 1000)
  },
}
timer.start()   // 1, 2, 3, ...

const brokenTimer = {
  seconds: 0,
  start() {
    setInterval(function () {
      this.seconds++   // regular function — this is NOT brokenTimer here (Rule 2 applies)
    }, 1000)            // silently does nothing useful; this.seconds is undefined++, which is NaN
  },
}
\`\`\`

### The priority order, when rules could conflict

\`\`\`
new binding  >  explicit binding (call/apply/bind)  >  method call (obj.method())  >  plain function call
\`\`\`

Arrow functions sit outside this order entirely — they never participate in any of these rules; they simply use the enclosing scope's \`this\`, permanently, decided once at the moment they're defined.

> **Key idea:** \`this\` is determined by *how* a function is called, not where it's written — the same function can have wildly different \`this\` values across different calls. Arrow functions are the one exception: they never have their own \`this\`, always inheriting it from their enclosing scope instead — which is exactly why they're the right choice for callbacks inside a method, but the wrong choice for the method itself.`,
    },
    {
      name: "Constructor Functions & new",
      minutes: 9,
      intro: "How objects were created with shared behavior before class syntax existed — and what new actually does.",
      content: `### A constructor function

\`\`\`js
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.greet = function () {
  return \`Hi, I'm \${this.name}\`
}

const ada = new Person("Ada", 30)
console.log(ada.name)      // "Ada"
console.log(ada.greet())    // "Hi, I'm Ada"
\`\`\`

A **constructor function** is an ordinary function, called with \`new\`, conventionally named with a capital letter to signal that it's meant to be used this way. Methods are attached to \`Function.prototype\` (recall module 5's prototype chain lesson) rather than defined inside the function itself, so every instance shares the *same* function in memory rather than each getting its own copy.

### What new actually does, step by step

\`\`\`js
// new Person("Ada", 30) does, roughly, all of this:
const obj = Object.create(Person.prototype)   // 1. create a new object, linked to Person.prototype
Person.call(obj, "Ada", 30)                     // 2. call Person with \`this\` set to that new object
// 3. (implicitly) return obj, since Person doesn't return an object of its own
\`\`\`

This directly connects two earlier lessons: module 5's \`Object.create\`-based prototype chain, and this module's \`this\`-binding rules — \`new\` is really just a language feature that automates exactly those steps. Understanding this sequence demystifies \`new\` completely; it isn't a separate, special mechanism, just a convenient shorthand for a pattern you could write out by hand.

### Forgetting new: a classic, dangerous bug

\`\`\`js
function Person(name) {
  this.name = name
}

const oops = Person("Ada")   // forgot "new"!
console.log(oops)               // undefined — Person doesn't return anything

console.log(typeof window !== "undefined" ? window.name : "no global leak in Node/modules")
// in a non-strict browser script (no "use strict", not a module), \`this\` inside Person defaults to
// the global object, so \`this.name = "Ada"\` accidentally creates a GLOBAL "name" variable!
\`\`\`

Without \`new\`, \`Person(...)\` is just an ordinary function call — Rule 2 from the previous lesson applies, and \`this\` is either \`undefined\` (strict mode/modules, where it throws immediately trying to set a property) or, in old-style non-strict scripts, the global object — silently polluting global state instead of throwing a helpful error. This exact class of bug is a significant part of *why* \`class\` syntax (next lesson) was introduced: calling a class without \`new\` throws a clear, immediate \`TypeError\`, rather than failing silently or dangerously.

### instanceof: checking what a function constructed

\`\`\`js
console.log(ada instanceof Person)   // true — ada's prototype chain includes Person.prototype
console.log(ada instanceof Object)     // true — Person.prototype's own prototype is Object.prototype
\`\`\`

\`instanceof\` walks the prototype chain (module 5) checking whether \`Function.prototype\` appears anywhere in it — which is why \`ada\` is correctly reported as an instance of both \`Person\` and, further up the chain, the built-in \`Object\`.

> **Key idea:** \`new\` automates creating an object linked to a function's \`.prototype\` and calling that function with \`this\` bound to it — not a fundamentally separate mechanism, just a convenient shorthand over exactly the prototype and \`this\`-binding rules covered in the previous two lessons. Forgetting \`new\` is a classic, sometimes dangerous bug — one of the concrete motivations behind \`class\` syntax, covered next.`,
    },
    {
      name: "ES6 Classes & Inheritance",
      minutes: 10,
      intro: "Cleaner syntax for the exact same prototype-based system — not a different inheritance model.",
      content: `### A class, translated directly from the previous lesson's constructor function

\`\`\`js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return \`Hi, I'm \${this.name}\`
  }
}

const ada = new Person("Ada", 30)
console.log(ada.greet())   // "Hi, I'm Ada"
console.log(ada instanceof Person)   // true
\`\`\`

This is genuinely, functionally equivalent to the previous lesson's \`Person\` constructor function plus its \`Person.prototype.greet\` assignment — \`class\` is **syntactic sugar** over the exact same prototype mechanism from module 5, not a new inheritance model underneath. Methods defined inside a \`class\` body are automatically placed on the prototype, exactly as if you'd written \`Person.prototype.greet = ...\` by hand.

### Classes throw if called without new — fixing the previous lesson's bug

\`\`\`js
const oops = Person("Ada", 30)   // TypeError: Class constructor Person cannot be invoked without 'new'
\`\`\`

This is a real, deliberate improvement \`class\` syntax adds over plain constructor functions — the exact silent-failure bug from the previous lesson becomes a loud, immediate, easy-to-diagnose error instead.

### Inheritance with extends and super

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name
  }
  speak() {
    return \`\${this.name} makes a sound.\`
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)          // MUST call super() before using "this" in a derived class
    this.breed = breed
  }
  speak() {
    return \`\${this.name} barks.\`   // overrides Animal's speak
  }
  parentSpeak() {
    return super.speak()   // explicitly calls the PARENT's version
  }
}

const rex = new Dog("Rex", "Labrador")
console.log(rex.speak())         // "Rex barks." — Dog's own override
console.log(rex.parentSpeak())    // "Rex makes a sound." — explicitly calling Animal's version
console.log(rex instanceof Dog)     // true
console.log(rex instanceof Animal)   // true — inheritance chain, via the prototype chain underneath
\`\`\`

\`extends\` sets up the prototype chain automatically (\`Dog.prototype\`'s prototype becomes \`Animal.prototype\`) — the same mechanism from module 5, just wired up for you. \`super(...)\` in the constructor calls the parent class's constructor — **mandatory** before you can use \`this\` in a derived class's constructor, since the parent is responsible for the initial setup of the object being built. \`super.methodName()\` explicitly calls the parent's version of an overridden method.

### Static members: belong to the class itself, not instances

\`\`\`js
class Person {
  static count = 0

  constructor(name) {
    this.name = name
    Person.count++
  }

  static describe() {
    return \`Person class — \${Person.count} instances created so far\`
  }
}

new Person("Ada")
new Person("Grace")
console.log(Person.describe())   // "Person class — 2 instances created so far"
// console.log(ada.describe())     // TypeError — static methods aren't available on instances
\`\`\`

A \`static\` property or method belongs to the **class itself**, not to any individual instance — useful for utility functions related to the class conceptually, or for tracking data across all instances, as \`count\` does here.

### Field declarations: a cleaner way to declare instance properties

\`\`\`js
class Person {
  name = "Unnamed"       // a field with a default, set before the constructor body runs
  age

  constructor(name, age) {
    this.name = name       // overrides the default above
    this.age = age
  }
}
\`\`\`

Class fields (available without needing them assigned inside the constructor) are a more modern, explicit way to declare what properties an instance will have — useful for documenting a class's shape at a glance, even without reading the whole constructor.

> **Key idea:** \`class\` is syntactic sugar over the exact prototype mechanism from module 5 — \`extends\`/\`super\` automate setting up the prototype chain and calling the parent constructor, and calling a class without \`new\` now throws immediately instead of failing silently, a genuine improvement over the older constructor-function pattern.`,
    },
    {
      name: "Private Fields, Encapsulation & OOP in Practice",
      minutes: 8,
      intro: "True private state with # fields, and when object-oriented patterns actually help.",
      content: `### Private fields with #

\`\`\`js
class BankAccount {
  #balance = 0   // the # makes this GENUINELY private — not just a naming convention

  constructor(initialBalance) {
    this.#balance = initialBalance
  }

  deposit(amount) {
    this.#balance += amount
    return this.#balance
  }

  getBalance() {
    return this.#balance
  }
}

const account = new BankAccount(100)
console.log(account.deposit(50))      // 150
console.log(account.getBalance())      // 150
console.log(account.#balance)            // SyntaxError: Private field '#balance' must be declared in an enclosing class
\`\`\`

Unlike a regular property (which is always accessible from outside, however inconvenient you make it feel with naming conventions like \`_balance\`), a \`#\`-prefixed field is **enforced by the language itself** — there is no way to read or write \`#balance\` from outside the class, not even via bracket notation or reflection tricks. This is the modern, direct replacement for the closure-based privacy pattern from module 4's bank account example — same underlying goal (data privacy), a cleaner, purpose-built syntax.

### Private methods too

\`\`\`js
class BankAccount {
  #balance = 0

  #validateAmount(amount) {   // a PRIVATE method — an internal helper, not part of the public API
    if (amount <= 0) throw new Error("Amount must be positive")
  }

  deposit(amount) {
    this.#validateAmount(amount)
    this.#balance += amount
    return this.#balance
  }
}
\`\`\`

Private methods work exactly like private fields — useful for internal helper logic that supports the public methods but was never meant to be called directly from outside the class.

### Encapsulation: the actual point of all this

The broader idea private fields serve is **encapsulation** — bundling data together with the specific operations allowed to touch it, and hiding everything else. This is valuable because it makes a class's actual public *contract* explicit: anything not marked private is the intended way to interact with an instance; anything private is an implementation detail that can be freely changed later without breaking code that uses the class, since external code was never able to depend on it in the first place.

### A word of caution: not everything needs to be a class

\`\`\`js
// sometimes a plain function is genuinely the better fit
function calculateTax(amount, rate) {
  return amount * rate
}

// vs. forcing it into an unnecessary class
class TaxCalculator {
  calculate(amount, rate) {
    return amount * rate
  }
}
\`\`\`

JavaScript is a genuinely **multi-paradigm** language — classes and OOP are one available tool, not a mandatory default the way they are in some other languages. A lot of real, idiomatic JavaScript (especially the functional-style patterns from module 3's higher-order functions, and module 6's array methods) doesn't reach for classes at all. Use a class when you genuinely have multiple related pieces of state and behavior that benefit from bundling and encapsulation (like the \`BankAccount\` example) — not by default, for every single piece of logic.

> **Key idea:** \`#\`-prefixed fields and methods provide genuine, language-enforced privacy — the direct modern replacement for module 4's closure-based privacy pattern. Classes are a useful tool for encapsulating related state and behavior, but JavaScript doesn't require an OOP style everywhere — plain functions remain the right, common choice for a great deal of real code.`,
    },
  ],
}
