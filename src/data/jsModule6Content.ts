import type { Module } from "../types"

export const jsModule6: Module = {
  id: 6,
  title: "Arrays, Destructuring & Iteration",
  status: "upcoming",
  lessons: [
    {
      name: "Array Fundamentals & Mutation Gotchas",
      minutes: 9,
      intro: "Arrays are objects too — and knowing which methods mutate is essential, not optional.",
      content: `### Arrays are a special kind of object

\`\`\`js
const fruits = ["apple", "banana", "cherry"]

console.log(typeof fruits)      // "object" — arrays ARE objects
console.log(Array.isArray(fruits))   // true — the correct way to actually check for an array
console.log(fruits.length)         // 3
console.log(fruits[0])              // "apple"
\`\`\`

Recall module 1's \`typeof\` coverage: arrays return \`"object"\`, not a distinct \`"array"\` type — because under the hood, an array is just an object with numeric keys (\`"0"\`, \`"1"\`, \`"2"\`...) and a special, automatically-managed \`length\` property. \`Array.isArray()\` exists specifically because \`typeof\` can't distinguish an array from a plain object.

### Adding and removing elements

\`\`\`js
const arr = [1, 2, 3]

arr.push(4)         // adds to the end -> [1, 2, 3, 4]
arr.pop()             // removes from the end, returns it -> [1, 2, 3]
arr.unshift(0)         // adds to the start -> [0, 1, 2, 3]
arr.shift()             // removes from the start, returns it -> [1, 2, 3]

console.log(arr)   // [1, 2, 3]
\`\`\`

\`push\`/\`pop\` (end of the array) are fast operations; \`unshift\`/\`shift\` (start of the array) are slower on large arrays, since every other element has to shift position — worth knowing if you're working with genuinely large arrays, though rarely a concern otherwise.

### The critical distinction: mutating methods vs non-mutating methods

\`\`\`js
const original = [3, 1, 4, 1, 5]

const sorted = original.sort()          // MUTATES original in place, then returns it
console.log(original)                     // [1, 1, 3, 4, 5] — original itself changed!
console.log(sorted === original)            // true — same array, not a new one

const numbers = [1, 2, 3]
const doubled = numbers.map(n => n * 2)   // does NOT mutate — returns a brand new array
console.log(numbers)                        // [1, 2, 3] — completely unchanged
console.log(doubled)                          // [2, 4, 6]
\`\`\`

This is one of the most important things to internalize about JavaScript arrays: some methods **mutate the original array in place**, others **return a new array and leave the original untouched**. Confusing the two is a genuinely common, real source of bugs — mutating an array you didn't expect to change, especially one shared elsewhere (recall the reference-sharing lesson from module 5).

### The methods that mutate — memorize this short list

\`\`\`
push, pop, shift, unshift, splice, sort, reverse, fill, copyWithin
\`\`\`

Everything else commonly used (\`map\`, \`filter\`, \`slice\`, \`concat\`, the methods covered in the next lesson) returns a new array without touching the original.

### sort's other gotcha: it sorts as strings by default

\`\`\`js
const numbers = [10, 2, 33, 4]
console.log(numbers.sort())   // [10, 2, 33, 4] -> [10, 2, 33, 4] sorted as STRINGS: [10, 2, 33, 4]
// actual output: [10, 2, 33, 4] sorted lexicographically -> [10, 2, 33, 4]... let's be precise:
console.log([10, 2, 33, 4].sort())   // [10, 2, 33, 4] sorted as strings -> [10, 2, 33, 4]
\`\`\`

\`\`\`js
console.log([10, 2, 33, 4].sort())              // [10, 2, 33, 4] -> becomes [10, 2, 33, 4]
console.log([10, 2, 33, 4].sort((a, b) => a - b))  // [2, 4, 10, 33] — CORRECT numeric sort
\`\`\`

Without a comparator function, \`.sort()\` converts every element to a **string** and sorts lexicographically — \`"10"\` sorts before \`"2"\`, because \`"1"\` < \`"2"\` as characters. For numbers, always pass \`(a, b) => a - b\` (ascending) or \`(a, b) => b - a\` (descending) explicitly — relying on the default is a very common, very real bug.

### Copying an array before mutating, when you need to preserve the original

\`\`\`js
const original = [3, 1, 2]
const sorted = [...original].sort((a, b) => a - b)   // spread makes a copy FIRST
console.log(original)   // [3, 1, 2] — untouched
console.log(sorted)       // [1, 2, 3]
\`\`\`

Spreading into a new array (\`[...original]\`) before calling a mutating method is the standard way to get a sorted/modified copy while leaving the original array exactly as it was.

> **Key idea:** arrays are objects with numeric keys under the hood; knowing which methods mutate (\`push\`, \`sort\`, \`splice\`, ...) versus which return a new array (\`map\`, \`filter\`, \`slice\`, ...) is essential, not a minor detail — and \`.sort()\` without a comparator silently sorts as strings, a classic, easy-to-miss bug with numbers.`,
    },
    {
      name: "The Core Iteration Methods: map, filter & reduce",
      minutes: 11,
      intro: "The three methods that replace the vast majority of manual loops over arrays.",
      content: `### map: transform every element, get a new array of the same length

\`\`\`js
const numbers = [1, 2, 3, 4]
const doubled = numbers.map(n => n * 2)
console.log(doubled)   // [2, 4, 6, 8]

const users = [{ name: "Ada" }, { name: "Grace" }]
const names = users.map(user => user.name)
console.log(names)       // ["Ada", "Grace"]
\`\`\`

\`.map()\` calls the given function once per element and collects the **return values** into a new array — always the same length as the original. This is directly the higher-order-function pattern from module 3's \`processArray\` example, built into the language.

### filter: keep only elements that pass a test

\`\`\`js
const numbers = [1, 2, 3, 4, 5, 6]
const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)   // [2, 4, 6]

const users = [{ name: "Ada", active: true }, { name: "Grace", active: false }]
const activeUsers = users.filter(user => user.active)
console.log(activeUsers)   // [{ name: "Ada", active: true }]
\`\`\`

\`.filter()\` calls the function once per element and keeps only the ones where it returned something truthy (recall module 2's truthy/falsy rules) — the result can be shorter than, equal to, or (never longer than) the original.

### reduce: fold an entire array down to a single value

\`\`\`js
const numbers = [1, 2, 3, 4]
const sum = numbers.reduce((accumulator, current) => accumulator + current, 0)
console.log(sum)   // 10
\`\`\`

\`.reduce()\` is the most general — and most initially confusing — of the three. It takes a function of \`(accumulator, currentElement)\`, and an initial value for the accumulator (\`0\` here). For each element, it calls the function with the *running* accumulator and the current element, and whatever that returns becomes the accumulator for the *next* call. After the last element, the final accumulator value is returned.

\`\`\`
reduce([1, 2, 3, 4], (acc, n) => acc + n, 0)

step 1: acc = 0, n = 1  -> returns 1
step 2: acc = 1, n = 2  -> returns 3
step 3: acc = 3, n = 3  -> returns 6
step 4: acc = 6, n = 4  -> returns 10
final result: 10
\`\`\`

Tracing through it step by step like this — writing out the accumulator's value before and after each call — is genuinely the best way to build intuition for \`reduce\`, since it's easy to read the syntax without actually following what's happening.

### reduce can build anything — not just a sum

\`\`\`js
const words = ["the", "quick", "brown", "fox"]

// building an object from an array
const wordLengths = words.reduce((acc, word) => {
  acc[word] = word.length
  return acc
}, {})
console.log(wordLengths)   // { the: 3, quick: 5, brown: 5, fox: 3 }

// building a new array (reduce can even replace map/filter, though usually map/filter read more clearly)
const onlyLongWords = words.reduce((acc, word) => {
  if (word.length > 3) acc.push(word)
  return acc
}, [])
console.log(onlyLongWords)   // ["quick", "brown"]
\`\`\`

Because the accumulator can be *anything* — a number, an object, an array, even another function — \`reduce\` can express any "fold the array down to X" computation. In practice, use \`map\`/\`filter\` when they fit naturally (they communicate intent more clearly), and reach for \`reduce\` when the transformation genuinely doesn't fit either shape — building an object or a running aggregate, as above.

### Chaining them together

\`\`\`js
const orders = [
  { item: "book", price: 15, quantity: 2 },
  { item: "pen", price: 2, quantity: 5 },
  { item: "laptop", price: 800, quantity: 1 },
]

const total = orders
  .filter(order => order.price < 100)          // exclude the laptop
  .map(order => order.price * order.quantity)    // compute each line total
  .reduce((sum, lineTotal) => sum + lineTotal, 0)  // sum them all

console.log(total)   // 40 — (15*2) + (2*5)
\`\`\`

Chaining \`filter\` → \`map\` → \`reduce\` is an extremely common, readable pattern for expressing a multi-step data transformation as a clear pipeline, each step doing exactly one job — often clearer than the equivalent hand-written loop with intermediate variables.

> **Key idea:** \`map\` transforms every element (same length out), \`filter\` keeps a subset (shorter or equal length out), \`reduce\` folds everything into one final value of any shape — together they cover the overwhelming majority of array processing you'll ever need, usually more clearly than a manual loop.`,
    },
    {
      name: "More Array Methods You'll Use Constantly",
      minutes: 9,
      intro: "find, some, every, includes, slice, and the rest of the everyday toolkit.",
      content: `### find & findIndex: locate a single matching element

\`\`\`js
const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
]

const user = users.find(u => u.id === 2)
console.log(user)   // { id: 2, name: "Grace" }

const index = users.findIndex(u => u.id === 2)
console.log(index)   // 1

const missing = users.find(u => u.id === 99)
console.log(missing)   // undefined — no match found
\`\`\`

\`.find()\` returns the **first** matching element itself (or \`undefined\` if none match); \`.findIndex()\` returns its **index** (or \`-1\` if none match). Both stop searching as soon as a match is found, unlike \`filter\`, which always checks every element.

### some & every: does at least one / do all elements pass a test?

\`\`\`js
const numbers = [1, 2, 3, 4]

console.log(numbers.some(n => n > 3))    // true — at least one element is > 3
console.log(numbers.every(n => n > 0))     // true — every element is > 0
console.log(numbers.every(n => n > 2))      // false — not all are > 2
\`\`\`

Both return a single boolean. \`.some()\` short-circuits and returns \`true\` the moment it finds one match; \`.every()\` short-circuits and returns \`false\` the moment it finds one failure — neither necessarily checks the whole array.

### includes: does the array contain this exact value?

\`\`\`js
const fruits = ["apple", "banana", "cherry"]
console.log(fruits.includes("banana"))   // true
console.log(fruits.includes("grape"))      // false

console.log([NaN].includes(NaN))            // true — unlike indexOf/===, includes correctly finds NaN
console.log([NaN].indexOf(NaN))               // -1 — indexOf uses ===, and NaN === NaN is false!
\`\`\`

\`.includes()\` is the clear, readable way to check for a value's presence — and it's the one array method that correctly handles \`NaN\` (recall module 2: \`NaN === NaN\` is \`false\`, which is why the older \`.indexOf()\` fails at this specific case).

### slice vs splice: a genuinely important naming trap

\`\`\`js
const arr = [1, 2, 3, 4, 5]

const sliced = arr.slice(1, 3)    // does NOT mutate — returns a new array
console.log(sliced)                 // [2, 3]
console.log(arr)                      // [1, 2, 3, 4, 5] — unchanged

const spliced = arr.splice(1, 2)    // DOES mutate — removes elements from arr itself
console.log(spliced)                  // [2, 3] — the REMOVED elements
console.log(arr)                        // [1, 4, 5] — arr itself is now shorter!
\`\`\`

These two names are dangerously similar, and mixing them up is a genuinely common real bug. \`.slice(start, end)\` is non-mutating — it returns a new array containing a portion of the original, leaving it untouched. \`.splice(start, deleteCount, ...itemsToInsert)\` **mutates** the original array in place — removing (and optionally inserting) elements — and returns the removed elements, not the modified array. When in doubt, double-check which one you meant.

### join & flat: string-ifying and flattening

\`\`\`js
console.log(["a", "b", "c"].join(", "))    // "a, b, c"
console.log([1, [2, 3], [4, [5, 6]]].flat())    // [1, 2, 3, 4, [5, 6]] — flattens ONE level by default
console.log([1, [2, 3], [4, [5, 6]]].flat(Infinity))   // [1, 2, 3, 4, 5, 6] — fully flattened
\`\`\`

\`.join()\` combines all elements into a single string, separated by the given string. \`.flat()\` flattens nested arrays — one level deep by default, or pass a depth (\`Infinity\` for "however deeply nested").

### Array.from: turning array-like or iterable things into real arrays

\`\`\`js
console.log(Array.from("hello"))          // ["h", "e", "l", "l", "o"] — a string is iterable
console.log(Array.from({ length: 3 }, (_, i) => i * 2))   // [0, 2, 4] — a mapping function, applied while building
\`\`\`

Recall module 3's mention of the array-*like* (but not real-array) \`arguments\` object — \`Array.from\` is the standard tool for converting anything array-like or iterable into a genuine array with full method access.

> **Key idea:** \`find\`/\`findIndex\` locate one element and stop early; \`some\`/\`every\` answer a yes/no question about the whole array, also stopping early when possible; \`slice\` (safe, returns new) and \`splice\` (mutates in place) are easy to confuse by name alone — always double check which one a piece of code is actually using.`,
    },
    {
      name: "Destructuring & Spread/Rest",
      minutes: 9,
      intro: "Pulling values out of arrays and objects with concise, readable syntax.",
      content: `### Array destructuring

\`\`\`js
const point = [10, 20, 30]
const [x, y, z] = point
console.log(x, y, z)   // 10 20 30

const [first, , third] = point   // skip the second element with an empty slot
console.log(first, third)          // 10 30

const [a = 100, b = 200] = [5]      // default values, used when the position is missing
console.log(a, b)                     // 5 200
\`\`\`

Array destructuring unpacks values **by position** — the variable names on the left don't need to match anything; they're assigned in order. A default kicks in exactly like a function's default parameter (module 3) — only when the value at that position is missing or \`undefined\`.

### Object destructuring

\`\`\`js
const person = { name: "Ada", age: 30, city: "London" }
const { name, age } = person
console.log(name, age)   // "Ada" 30

const { name: fullName } = person   // rename while destructuring
console.log(fullName)                  // "Ada"

const { country = "Unknown" } = person   // default, since person has no "country" key
console.log(country)                      // "Unknown"
\`\`\`

Object destructuring unpacks **by key name**, not position — the variable names must match the object's property keys (unless you use the \`propertyName: newName\` rename syntax).

### Swapping variables without a temporary

\`\`\`js
let a = 1
let b = 2
;[a, b] = [b, a]
console.log(a, b)   // 2 1
\`\`\`

A classic, genuinely useful trick: destructuring a freshly-created array of \`[b, a]\` back into \`[a, b]\` swaps their values in one line, no temporary third variable required.

### Nested destructuring

\`\`\`js
const user = {
  name: "Ada",
  address: { city: "London", zip: "SW1A" },
}

const { name, address: { city } } = user
console.log(name, city)   // "Ada" "London"
// note: this does NOT create an "address" variable — only "name" and "city"
\`\`\`

Destructuring patterns can mirror arbitrarily nested structures — pull \`city\` directly out of the nested \`address\` object in one statement, without an intermediate \`user.address\` reference.

### Rest in destructuring: gathering "everything else"

\`\`\`js
const [first, ...rest] = [1, 2, 3, 4, 5]
console.log(first)   // 1
console.log(rest)      // [2, 3, 4, 5]

const { name, ...otherFields } = { name: "Ada", age: 30, city: "London" }
console.log(name)          // "Ada"
console.log(otherFields)     // { age: 30, city: "London" }
\`\`\`

The same \`...\` syntax from module 3's rest parameters works in destructuring too — it must come **last** in the pattern, and collects whatever wasn't explicitly destructured into a new array or object.

### Spread: the reverse operation — expanding, not collecting

\`\`\`js
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]        // spreads arr1's elements out, then adds more
console.log(arr2)                     // [1, 2, 3, 4, 5]

function sum(a, b, c) {
  return a + b + c
}
const numbers = [1, 2, 3]
console.log(sum(...numbers))            // 6 — spreads the array out into individual arguments
\`\`\`

The exact same \`...\` syntax means the **opposite** thing depending on context: inside a destructuring pattern or function parameter list, it *collects* (rest); inside an array/object literal or a function call, it *spreads/expands*. Context disambiguates which behavior applies — worth being explicit about this, since the symbol looks identical either way.

> **Key idea:** destructuring unpacks array elements by position or object properties by key, both supporting defaults, renaming, nesting, and a trailing rest pattern to collect "everything else." Spread is the reverse operation, expanding a collection out — the same \`...\` syntax means "collect" in a destructuring/parameter context and "expand" in a literal/call context.`,
    },
  ],
}
