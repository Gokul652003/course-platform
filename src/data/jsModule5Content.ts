import type { Module } from "../types"

export const jsModule5: Module = {
  id: 5,
  title: "Objects & Prototypes",
  status: "upcoming",
  lessons: [
    {
      name: "Object Literals & Property Access",
      minutes: 8,
      intro: "The everyday syntax for creating and working with objects.",
      content: `### Creating an object

\`\`\`js
const person = {
  name: "Ada",
  age: 30,
  isEmployed: true,
}
\`\`\`

An **object literal** — the \`{ key: value, ... }\` syntax — is by far the most common way to create an object in JavaScript. Keys are strings (even when written without quotes); values can be absolutely anything — strings, numbers, other objects, arrays, even functions.

### Two ways to access a property

\`\`\`js
console.log(person.name)         // "Ada" — dot notation
console.log(person["name"])       // "Ada" — bracket notation, identical result
\`\`\`

**Dot notation** is the common default — shorter, more readable. **Bracket notation** is required when the key isn't a valid identifier (contains a space or starts with a number), or — the far more common real reason — when the key is stored in a **variable**:

\`\`\`js
const key = "age"
console.log(person[key])   // 30 — dot notation CAN'T do this: person.key would look for a literal "key" property
\`\`\`

\`person.key\` looks for a property literally named \`"key"\` — it has no way to substitute in a variable's value. Bracket notation is the only option whenever the property name itself is dynamic.

### Adding, updating & deleting properties

\`\`\`js
person.email = "ada@example.com"   // add a new property
person.age = 31                     // update an existing one
delete person.isEmployed              // remove it entirely

console.log(person)
// { name: "Ada", age: 31, email: "ada@example.com" }
\`\`\`

Objects are mutable by default (recall from module 1: this is exactly why \`const\` didn't prevent any of this) — properties can be freely added, changed, or removed after creation.

### Shorthand property names & methods

\`\`\`js
const name = "Ada"
const age = 30

const person2 = { name, age }   // shorthand — same as { name: name, age: age }

const person3 = {
  name: "Ada",
  greet() {              // method shorthand — same as greet: function() {...}
    return \`Hi, I'm \${this.name}\`
  },
}

console.log(person3.greet())   // "Hi, I'm Ada"
\`\`\`

When a variable's name matches the property name you want, the shorthand avoids repeating it. Method shorthand (\`greet() {}\` instead of \`greet: function() {}\`) is the standard modern way to define a function as an object property — \`this\` inside it gets covered fully in module 7.

### Checking whether a property exists

\`\`\`js
console.log(person.nonExistent)         // undefined — no error, just undefined
console.log("name" in person)            // true — checks for the key, regardless of value
console.log(person.hasOwnProperty("name")) // true

const obj = { valid: undefined }
console.log("valid" in obj)                // true — the key exists, even though its value is undefined
console.log(obj.valid !== undefined)         // false — this check would incorrectly say "missing"
\`\`\`

Accessing a missing property never throws — it just returns \`undefined\`, which is why \`in\` (or \`hasOwnProperty\`) is the more reliable way to check for a key's actual presence, rather than checking \`!== undefined\`, which is fooled by a property that genuinely holds \`undefined\` as its value.

### Computed property names

\`\`\`js
const propName = "score"
const result = {
  [propName]: 100,   // the brackets here evaluate propName as an expression
}
console.log(result)   // { score: 100 }
\`\`\`

Square brackets inside an object literal let you compute a key's name from an expression at creation time — useful whenever the property name itself isn't known until runtime.

> **Key idea:** dot notation is the readable default; bracket notation is required whenever the key is dynamic (stored in a variable) or not a valid identifier. \`in\`/\`hasOwnProperty\` correctly detect a key's presence even when its value is \`undefined\`, unlike a plain \`!== undefined\` check.`,
    },
    {
      name: "Prototypal Inheritance & the Prototype Chain",
      minutes: 11,
      intro: "How objects share behavior in JavaScript — a genuinely different model from class-based languages.",
      content: `### Every object has a hidden link to another object

\`\`\`js
const person = { name: "Ada" }
console.log(person.toString())   // "[object Object]" — but we never defined toString!
\`\`\`

Where did \`toString\` come from? Every object in JavaScript has an internal, hidden link — called its **prototype** — to another object, and if a property isn't found on the object itself, the engine automatically looks it up on the prototype instead. \`person\`'s prototype is \`Object.prototype\`, which defines \`toString\` (among other things) — this is why it "just works," without \`person\` ever defining it directly.

### Walking the chain explicitly

\`\`\`js
const animal = {
  eats: true,
  walk() {
    return "Animal walks"
  },
}

const rabbit = Object.create(animal)   // rabbit's prototype is set to animal
rabbit.jumps = true

console.log(rabbit.eats)     // true — not found on rabbit itself, found on its prototype (animal)
console.log(rabbit.jumps)     // true — found directly on rabbit
console.log(rabbit.walk())     // "Animal walks" — a method, found via the prototype

console.log(Object.getPrototypeOf(rabbit) === animal)   // true
\`\`\`

\`Object.create(animal)\` creates a new object whose prototype is explicitly set to \`animal\`. Property lookup then works exactly as the previous example implied: check the object itself first; if not found, check its prototype; if still not found, check *that* object's prototype, and so on — this chain of prototypes is called the **prototype chain**, and it ends when a prototype of \`null\` is reached (which is where \`Object.prototype\` itself sits).

### This is genuinely different from classical inheritance

If you've used a class-based language before, prototypal inheritance can feel unusual at first: there's no fixed "blueprint" (a class) that objects are stamped out from — objects simply link **directly to other, real, live objects**, and can even have their prototype changed after creation. \`rabbit\` doesn't have a *copy* of \`animal\`'s properties — it has a live *reference* to \`animal\` itself, so a later change to \`animal\` is visible through \`rabbit\` too:

\`\`\`js
animal.newProperty = "added later"
console.log(rabbit.newProperty)   // "added later" — rabbit sees it immediately, via the live link
\`\`\`

### Shadowing: an own property hides a prototype property

\`\`\`js
console.log(rabbit.eats)   // true — from animal, via the prototype

rabbit.eats = false          // now rabbit has its OWN "eats" property
console.log(rabbit.eats)      // false — the own property is found FIRST, shadowing the prototype's

console.log(animal.eats)       // true — animal itself is completely unaffected
\`\`\`

Setting a property directly on \`rabbit\` doesn't modify \`animal\` at all — it creates a new property directly on \`rabbit\` that simply gets checked *before* the engine ever needs to walk up to the prototype. This is called **shadowing**.

### Where function prototypes fit in

\`\`\`js
function Animal(name) {
  this.name = name
}

Animal.prototype.speak = function () {
  return \`\${this.name} makes a sound.\`
}

const dog = new Animal("Rex")
console.log(dog.speak())   // "Rex makes a sound."
console.log(Object.getPrototypeOf(dog) === Animal.prototype)   // true
\`\`\`

Every **function** in JavaScript automatically has a \`.prototype\` property (a plain object) — when you call a function with \`new\` (covered more in module 7), the newly created object's prototype is set to that function's \`.prototype\`. This is the actual mechanism that powers what \`class\` syntax (also module 7) compiles down to underneath — \`class\` is, ultimately, a cleaner syntax layered on top of exactly this prototype-based system, not a fundamentally different inheritance model.

> **Key idea:** JavaScript objects link directly to other live objects via a prototype, and property lookup walks up this chain until it finds a match — there's no separate "class" concept underneath; even \`class\` syntax is built entirely on this same prototype mechanism, which is why understanding it here pays off directly in module 7.`,
    },
    {
      name: "Object Methods, Getters & Setters",
      minutes: 9,
      intro: "The built-in toolkit for working with an object's keys, values, and computed properties.",
      content: `### Object.keys, Object.values & Object.entries

\`\`\`js
const person = { name: "Ada", age: 30, city: "London" }

console.log(Object.keys(person))     // ["name", "age", "city"]
console.log(Object.values(person))     // ["Ada", 30, "London"]
console.log(Object.entries(person))     // [["name", "Ada"], ["age", 30], ["city", "London"]]

for (const [key, value] of Object.entries(person)) {
  console.log(\`\${key}: \${value}\`)
}
\`\`\`

These three are the standard, modern way to iterate over an object's own properties — each returns a genuine **array**, so every array method from module 6 (\`.map\`, \`.filter\`, etc.) is immediately usable on the result. \`Object.entries\` combined with \`for...of\` and array destructuring (also module 6) is the clean, modern replacement for the \`for...in\` pattern from module 2.

### Object.assign & the spread operator: copying and merging

\`\`\`js
const defaults = { theme: "light", fontSize: 14 }
const userPrefs = { fontSize: 18 }

const merged = Object.assign({}, defaults, userPrefs)
console.log(merged)   // { theme: "light", fontSize: 18 } — userPrefs overwrites matching keys

const merged2 = { ...defaults, ...userPrefs }   // the spread operator — the modern, preferred syntax
console.log(merged2)   // identical result
\`\`\`

Both merge objects left to right — later sources overwrite earlier ones on matching keys. The spread syntax (\`{ ...obj }\`) is generally preferred today for its readability, though \`Object.assign\` is still common, especially when the target needs to be an existing object rather than a fresh \`{}\`.

### Both are shallow copies — a genuinely important gotcha

\`\`\`js
const original = { name: "Ada", address: { city: "London" } }
const copy = { ...original }

copy.name = "Grace"                  // fine — doesn't affect original
console.log(original.name)            // still "Ada"

copy.address.city = "Paris"            // mutates the NESTED object — which is SHARED!
console.log(original.address.city)      // "Paris" — original changed too!
\`\`\`

Spread (and \`Object.assign\`) only copies **one level deep** — nested objects/arrays are still shared *references* between the original and the copy, not independent copies. Mutating a nested value through the copy affects the original too, since both point at the exact same inner object. A genuine, deep copy needs \`structuredClone(original)\` (a modern built-in) or a recursive copying function.

### Getters and setters: properties that run code

\`\`\`js
const person = {
  firstName: "Ada",
  lastName: "Lovelace",
  get fullName() {
    return \`\${this.firstName} \${this.lastName}\`
  },
  set fullName(value) {
    const [first, last] = value.split(" ")
    this.firstName = first
    this.lastName = last
  },
}

console.log(person.fullName)   // "Ada Lovelace" — reads like a property, but runs a function
person.fullName = "Grace Hopper"   // writes like a property, but runs a function
console.log(person.firstName)      // "Grace"
\`\`\`

A \`get\`/\`set\` pair lets a property look and behave like an ordinary value from the *caller's* side (\`person.fullName\`, no parentheses) while actually running computed logic behind the scenes — useful for derived/computed values, or for validating a value on write without changing how the property is used externally.

### Object.freeze: true immutability, when you actually need it

\`\`\`js
const config = Object.freeze({ apiUrl: "https://api.example.com" })
config.apiUrl = "https://evil.com"   // silently fails (or throws, in strict mode)
console.log(config.apiUrl)             // still "https://api.example.com" — unchanged
\`\`\`

Recall from module 1: \`const\` alone does **not** prevent mutating an object's contents. \`Object.freeze\` is the actual tool for that — it prevents adding, removing, or changing any of an object's own properties (though, like spread, it's shallow — nested objects inside a frozen object are still mutable unless frozen separately too).

> **Key idea:** \`Object.entries\` + destructuring is the modern way to iterate an object; spread/\`Object.assign\` copy and merge objects, but only shallowly — nested objects remain shared references, a common source of subtle bugs. Getters/setters let a property run code while still looking like a plain value from the outside.`,
    },
    {
      name: "Equality, Reference vs Value & Object Copying",
      minutes: 8,
      intro: "Why two seemingly identical objects are never === equal — and what that actually means in practice.",
      content: `### Primitives are compared by value; objects are compared by reference

\`\`\`js
console.log(5 === 5)                    // true — same value
console.log("hi" === "hi")               // true — same value

console.log({ a: 1 } === { a: 1 })        // false — two DIFFERENT objects, even with identical contents!
console.log([1, 2, 3] === [1, 2, 3])       // false — same reasoning

const obj1 = { a: 1 }
const obj2 = obj1
console.log(obj1 === obj2)                // true — obj2 is the SAME object, not a copy
\`\`\`

This is one of the most important distinctions in the entire language: primitives (\`number\`, \`string\`, \`boolean\`, etc.) are compared **by value** — two separately-created \`5\`s are simply equal. Objects (including arrays and functions) are compared **by reference** — \`===\` asks "do these two variables point at the exact same object in memory?", not "do they look the same?" Two separately created objects are never \`===\` equal, no matter how identical their contents are.

### Assignment copies the reference, not the object

\`\`\`js
const original = { count: 0 }
const alias = original          // alias now points to the SAME object as original

alias.count = 100
console.log(original.count)      // 100 — original changed too, because they're the same object!
\`\`\`

This is the single most common source of confusing bugs for people newer to JavaScript: assigning an object to a new variable doesn't copy it — both variables end up pointing at the identical underlying object, so mutating it through either one is visible through the other. Contrast this with primitives, which are genuinely, independently copied on assignment:

\`\`\`js
let x = 5
let y = x
y = 10
console.log(x)   // still 5 — x and y are independent, because numbers are copied by value
\`\`\`

### How to actually get an independent copy

\`\`\`js
const original = { name: "Ada", scores: [90, 85] }

const shallowCopy = { ...original }             // one level deep, as covered last lesson
const deepCopy = structuredClone(original)        // genuinely independent, including nested objects/arrays

deepCopy.scores.push(100)
console.log(original.scores)                        // [90, 85] — untouched
\`\`\`

\`structuredClone\` (a relatively modern, globally available built-in) is the standard, reliable way to create a true deep copy — every level of nesting gets its own independent copy, unlike spread's shallow, one-level copy from the previous lesson.

### Passing objects to functions: same reference-sharing rule applies

\`\`\`js
function addItem(cart, item) {
  cart.items.push(item)   // mutates the ORIGINAL object passed in — no copy was made
}

const myCart = { items: ["apple"] }
addItem(myCart, "banana")
console.log(myCart.items)   // ["apple", "banana"] — the original was mutated!
\`\`\`

JavaScript passes arguments by value — but for an object, the "value" being passed is the **reference** itself, not a copy of the object. This is why a function can mutate an object passed into it, and that change is visible to the caller after the function returns — genuinely important to understand, since it's the source of a lot of real, hard-to-trace bugs when a function unexpectedly mutates something the caller didn't expect to change.

> **Key idea:** primitives compare and copy by value; objects compare and copy by *reference* — two structurally identical objects are never \`===\`, and assigning or passing an object shares the same underlying reference rather than copying it, which is exactly why mutating an object inside a function is visible to the caller afterward.`,
    },
  ],
}
