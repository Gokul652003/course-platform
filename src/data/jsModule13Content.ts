import type { Module } from "../types"

export const jsModule13: Module = {
  id: 13,
  title: "Built-in Objects You'll Use Constantly",
  status: "upcoming",
  lessons: [
    {
      name: "Numbers & Math in Depth",
      minutes: 9,
      intro: "Why 0.1 + 0.2 isn't 0.3, and the built-in tools for working with numbers correctly.",
      content: `### The floating-point precision problem

\`\`\`js
console.log(0.1 + 0.2)          // 0.30000000000000004 — NOT 0.3!
console.log(0.1 + 0.2 === 0.3)   // false
\`\`\`

Recall module 1: JavaScript has exactly one numeric type, stored as 64-bit floating point (IEEE 754). This format simply **cannot represent every decimal fraction exactly** — the same way \`1/3\` has no exact finite decimal representation, some decimals (like \`0.1\`) have no exact finite *binary* representation, which is what the engine actually stores under the hood. This is not a JavaScript bug — every language using standard floating-point arithmetic has this exact behavior.

### The practical fix: never compare floats with ===

\`\`\`js
function roughlyEqual(a, b, epsilon = 0.0001) {
  return Math.abs(a - b) < epsilon
}

console.log(roughlyEqual(0.1 + 0.2, 0.3))   // true
\`\`\`

For money or anything requiring exact decimal precision, the standard advice is to work in the smallest whole unit (cents instead of dollars) using integers, or use a dedicated decimal library — never rely on raw floating-point math for financial calculations.

### Number conversion: parseInt, parseFloat & Number()

\`\`\`js
console.log(parseInt("42px"))       // 42 — stops at the first non-digit character
console.log(parseFloat("3.14 meters"))   // 3.14
console.log(Number("42px"))           // NaN — Number() requires the ENTIRE string to be numeric
console.log(Number("42"))               // 42 — works fine when the whole string is numeric
console.log(Number(""))                   // 0 — an empty string converts to 0, a common surprise

console.log(parseInt("101", 2))   // 5 — a second argument specifies the radix (base 2 = binary here)
\`\`\`

\`parseInt\`/\`parseFloat\` parse as much of a string as looks numeric from the start, ignoring trailing garbage; \`Number()\` is stricter — the whole string must be a valid number, or you get \`NaN\`. Always pass a radix to \`parseInt\` explicitly (\`parseInt(str, 10)\` for decimal) — omitting it can cause it to auto-detect an unexpected base in some edge cases.

### Checking for valid numbers

\`\`\`js
console.log(isNaN("hello"))          // true — but isNaN COERCES its argument first, which can mislead
console.log(Number.isNaN("hello"))    // false — Number.isNaN does NOT coerce; "hello" isn't literally NaN
console.log(Number.isNaN(NaN))          // true — the correct, safe way to check for NaN

console.log(Number.isInteger(5))        // true
console.log(Number.isInteger(5.5))        // false
console.log(Number.isFinite(1 / 0))         // false — Infinity is not finite
\`\`\`

The global \`isNaN()\` coerces its argument to a number first, producing surprising results for non-numeric input. \`Number.isNaN()\` (no coercion) is the modern, correct way to check specifically whether a value *is* the actual \`NaN\` value.

### The Math object

\`\`\`js
console.log(Math.max(1, 5, 3))       // 5
console.log(Math.min(1, 5, 3))         // 1
console.log(Math.round(4.5))             // 5
console.log(Math.floor(4.9))               // 4 — always rounds down
console.log(Math.ceil(4.1))                  // 5 — always rounds up
console.log(Math.abs(-7))                      // 7
console.log(Math.pow(2, 10))                     // 1024 — same as 2 ** 10
console.log(Math.sqrt(16))                         // 4
console.log(Math.random())                           // a random number between 0 (inclusive) and 1 (exclusive)

// a common pattern: random integer in a range
const randomInt = Math.floor(Math.random() * (max - min + 1)) + min
\`\`\`

\`Math\` is a built-in object (not a class — you never \`new\` it) holding common mathematical constants and functions. \`Math.random()\` alone only gives a decimal between 0 and 1 — the "random integer in a range" formula above is the standard way to turn it into a usable random integer.

### toFixed: formatting a number for display

\`\`\`js
console.log((3.14159).toFixed(2))   // "3.14" — NOTE: returns a STRING, not a number
console.log((5).toFixed(2))            // "5.00"
\`\`\`

\`.toFixed(n)\` rounds to \`n\` decimal places for *display* purposes — genuinely useful for showing currency or percentages, but remember it returns a string, so further arithmetic needs converting it back with \`Number()\` first.

> **Key idea:** floating-point precision issues are a real, structural property of how numbers are stored, not a bug — never compare decimals with \`===\`. \`Number.isNaN\`/\`Number.isInteger\` (no coercion) are safer than the older global \`isNaN\`, and \`Math\` plus \`.toFixed()\` cover the everyday numeric operations beyond plain arithmetic.`,
    },
    {
      name: "Strings in Depth",
      minutes: 10,
      intro: "The full everyday string toolkit, and what's actually happening under the hood with Unicode.",
      content: `### The string methods you'll reach for constantly

\`\`\`js
const str = "  Hello, World!  "

console.log(str.trim())              // "Hello, World!" — removes leading/trailing whitespace
console.log(str.trimStart())            // "Hello, World!  " — only leading
console.log(str.trimEnd())                // "  Hello, World!" — only trailing

console.log("hello".toUpperCase())          // "HELLO"
console.log("HELLO".toLowerCase())            // "hello"

console.log("hello world".slice(0, 5))          // "hello" — like array slice (module 6), non-mutating
console.log("hello world".slice(-5))              // "world" — negative indices count from the end

console.log("hello".includes("ell"))                // true
console.log("hello".startsWith("he"))                 // true
console.log("hello".endsWith("lo"))                     // true

console.log("hello".repeat(3))                            // "hellohellohello"
console.log("5".padStart(3, "0"))                            // "005" — common for formatting, e.g. "05:09"
console.log("5".padEnd(3, "0"))                                // "500"

console.log("a,b,,c".split(","))                                 // ["a", "b", "", "c"]
console.log(["a", "b", "c"].join("-"))                             // "a-b-c"

console.log("Hello".replace("l", "L"))                               // "HeLlo" — only the FIRST match
console.log("Hello".replaceAll("l", "L"))                              // "HeLLo" — every match
\`\`\`

All string methods are non-mutating — recall module 1: strings are immutable, so every one of these returns a **new** string, leaving the original untouched, exactly like array methods such as \`.map()\`/\`.slice()\` from module 6.

### Template literals, revisited: multi-line and expression-friendly

\`\`\`js
const name = "Ada"
const multiline = \`Line one
Line two, and \${name} is right here too\`

console.log(multiline)
\`\`\`

Recall module 1's brief introduction — worth reiterating that template literals (backticks) are the only string syntax supporting genuine multi-line text without explicit \`\\n\` escapes, alongside \`\${...}\` interpolation.

### Tagged template literals: a function that processes a template literal

\`\`\`js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? \`**\${values[i]}**\` : ""
    return result + str + value
  }, "")
}

const name = "Ada"
const age = 30
console.log(highlight\`Name: \${name}, Age: \${age}\`)
// "Name: **Ada**, Age: **30**"
\`\`\`

A function placed directly before a template literal (no parentheses, no space) becomes a **tag** — it receives the literal string pieces as an array (\`strings\`) and the interpolated values separately (as rest parameters, from module 3), letting you fully control how they're combined. This is a genuinely advanced feature — its most common real-world use is libraries like styled-components, or safely escaping values (e.g. a \`sql\` or \`html\` tag that automatically sanitizes interpolated values to prevent injection).

### Unicode and UTF-16: why .length can lie

\`\`\`js
console.log("hello".length)     // 5 — matches intuition
console.log("😀".length)          // 2 — NOT 1! surprising

const emoji = "😀"
console.log([...emoji].length)     // 1 — spreading (module 6) correctly counts it as ONE character
\`\`\`

JavaScript strings are encoded internally as UTF-16, where most characters take one 16-bit code unit — but some characters (many emoji, some rare written scripts) require **two** code units, called a **surrogate pair**. \`.length\` counts code units, not actual visible characters, which is why an emoji can report a length of 2. Spreading a string (\`[...str]\`) or using \`for...of\` (both from module 6/11's iterable coverage) correctly iterates by actual Unicode character, sidestepping this surprise — worth knowing whenever you're processing user-generated text that might contain emoji or non-Latin scripts.

### String comparison and localeCompare

\`\`\`js
console.log("apple" < "banana")   // true — compares character codes, works fine for simple ASCII cases
console.log(["banana", "Apple", "cherry"].sort())   // ["Apple", "banana", "cherry"] — capital letters sort BEFORE lowercase!

console.log(["banana", "Apple", "cherry"].sort((a, b) => a.localeCompare(b)))
// ["Apple", "banana", "cherry"] — actually the same here, but localeCompare handles accents/locale correctly
\`\`\`

Plain \`<\`/\`>\`/default \`.sort()\` on strings compares by raw character code — which sorts all uppercase letters before all lowercase ones (an "A" is a lower character code than "a"), and doesn't handle accented characters or different languages correctly. \`.localeCompare()\` performs a proper, locale-aware comparison — worth using instead of the default whenever sorting user-facing text.

> **Key idea:** every string method returns a new string, never mutating the original; tagged template literals let a function fully control how a template literal's pieces are combined (used for sanitization and specialized formatting); and \`.length\` counts UTF-16 code units, not visible characters — spreading a string or using \`for...of\` is the correct way to handle multi-code-unit characters like emoji.`,
    },
    {
      name: "Dates",
      minutes: 8,
      intro: "Creating, reading, and formatting dates — and the classic gotchas that trip everyone up at least once.",
      content: `### Creating a Date

\`\`\`js
const now = new Date()                            // the current date and time
const specific = new Date(2026, 2, 15)               // year, month, day — month is ZERO-INDEXED!
const fromString = new Date("2026-03-15")              // parsed from an ISO 8601 string
const fromTimestamp = new Date(1000 * 60 * 60 * 24)      // milliseconds since Jan 1, 1970 (the "epoch")

console.log(specific)   // Sun Mar 15 2026 00:00:00 ...
\`\`\`

### The classic gotcha: months are zero-indexed

\`\`\`js
const march = new Date(2026, 2, 15)    // month 2 means MARCH, not February!
console.log(march.getMonth())            // 2

const wrong = new Date(2026, 3, 15)        // this is APRIL, a common off-by-one mistake
\`\`\`

This is one of the most consistently reported JavaScript gotchas: \`getMonth()\`/the month argument to the constructor both use \`0\` for January through \`11\` for December — a decision baked into the language from its earliest days and impossible to change now without breaking the entire web. Always double-check when constructing or reading a specific month.

### Reading parts of a date

\`\`\`js
const d = new Date(2026, 2, 15, 14, 30)

console.log(d.getFullYear())    // 2026
console.log(d.getMonth())         // 2 (March — remember, zero-indexed)
console.log(d.getDate())            // 15 (day of the MONTH)
console.log(d.getDay())               // day of the WEEK: 0 (Sunday) through 6 (Saturday)
console.log(d.getHours())               // 14
console.log(d.getMinutes())               // 30
\`\`\`

Note the naming trap: \`getDate()\` returns the day-of-month (1-31); \`getDay()\` returns the day-of-week (0-6) — easy to confuse by name alone, similar to module 6's \`slice\`/\`splice\` naming trap.

### Formatting a date for display

\`\`\`js
const d = new Date(2026, 2, 15)

console.log(d.toISOString())          // "2026-03-15T00:00:00.000Z" — standard, unambiguous, good for APIs/storage
console.log(d.toLocaleDateString())     // "3/15/2026" — formatted for the user's locale (varies by system settings)
console.log(d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))
// "Sunday, March 15, 2026"
\`\`\`

Use \`.toISOString()\` when sending a date to a server or storing it — a consistent, unambiguous, timezone-explicit format. Use \`.toLocaleDateString()\` (with format options) when displaying a date to a user — it automatically adapts to their locale's conventions.

### Date arithmetic: everything is milliseconds underneath

\`\`\`js
const start = new Date(2026, 0, 1)
const end = new Date(2026, 0, 10)

const diffMs = end - start                        // Dates subtract to a NUMBER of milliseconds
const diffDays = diffMs / (1000 * 60 * 60 * 24)
console.log(diffDays)   // 9

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)             // add a day by mutating in place
\`\`\`

Subtracting two \`Date\` objects gives the difference in milliseconds — this is because a \`Date\` is, underneath, just a timestamp (milliseconds since the epoch) with a friendly interface wrapped around it. \`setDate(getDate() + n)\` is the standard pattern for date arithmetic — it correctly rolls over into the next month/year automatically, since \`Date\` objects self-normalize.

### Dates are mutable — a real gotcha given module 5's reference lessons

\`\`\`js
const d1 = new Date(2026, 0, 1)
const d2 = d1                    // same reference, exactly like module 5's object-sharing lesson

d2.setDate(15)
console.log(d1.getDate())   // 15 — d1 changed too!
\`\`\`

Unlike the *primitive* types from module 1, \`Date\` is an object — assignment copies the reference, not the value, exactly as covered in module 5. Mutating a \`Date\` through one variable affects every other variable pointing at the same object.

> **Key idea:** month is zero-indexed (\`0\` = January) — the single most common \`Date\` bug. Use \`.toISOString()\` for storage/APIs, \`.toLocaleDateString()\` for display. Date subtraction gives milliseconds, since a Date is fundamentally just a timestamp — and Dates are mutable objects, subject to exactly the same reference-sharing behavior as any other object from module 5.`,
    },
    {
      name: "JSON in Depth",
      minutes: 7,
      intro: "Serializing and parsing data — the format nearly every API speaks, and its real limitations.",
      content: `### The basics, recapped

\`\`\`js
const obj = { name: "Ada", age: 30, active: true }

const json = JSON.stringify(obj)
console.log(json)              // '{"name":"Ada","age":30,"active":true}' — a STRING

const parsed = JSON.parse(json)
console.log(parsed)              // { name: "Ada", age: 30, active: true } — back to an object
console.log(parsed === obj)         // false — a brand new object, not the same reference (module 5)
\`\`\`

\`JSON.stringify\` converts a JavaScript value into a JSON-formatted string; \`JSON.parse\` does the reverse. This is precisely the format nearly every web API sends and receives — the "JSON" in fetching JSON data.

### Not everything survives the round trip

\`\`\`js
const obj = {
  name: "Ada",
  greet: function () { return "hi" },   // functions are SILENTLY DROPPED
  when: undefined,                        // undefined properties are SILENTLY DROPPED
  missing: NaN,                             // NaN becomes null
  big: 9007199254740993n,                     // BigInt THROWS — cannot be serialized at all
}

console.log(JSON.stringify(obj))
// throws: TypeError: Do not know how to serialize a BigInt
\`\`\`

\`\`\`js
const obj2 = { name: "Ada", greet: function () {}, when: undefined, missing: NaN }
console.log(JSON.stringify(obj2))
// '{"name":"Ada","missing":null}' — greet and when are GONE entirely; NaN became null
\`\`\`

JSON has a genuinely limited set of supported types (strings, numbers, booleans, \`null\`, arrays, plain objects) — functions and \`undefined\` values are silently dropped from the output, \`NaN\`/\`Infinity\` become \`null\`, and \`BigInt\` throws outright unless you provide custom handling. Worth knowing before assuming \`JSON.stringify\` faithfully preserves *any* JavaScript value.

### Formatting output with the indentation argument

\`\`\`js
const obj = { name: "Ada", age: 30 }
console.log(JSON.stringify(obj, null, 2))
// {
//   "name": "Ada",
//   "age": 30
// }
\`\`\`

The third argument to \`JSON.stringify\` specifies indentation — genuinely useful for human-readable debug output or pretty-printed config files, versus the compact single-line default used for actual network transmission.

### The replacer function: filtering or transforming during stringify

\`\`\`js
const user = { name: "Ada", password: "secret123", age: 30 }

const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined   // omit this key entirely
  return value
})
console.log(safe)   // '{"name":"Ada","age":30}'
\`\`\`

A function as the second argument runs for every key/value pair during serialization — returning \`undefined\` for a given key omits it from the output. A genuinely useful, real pattern for stripping sensitive fields (like \`password\`) before sending an object somewhere.

### The reviver function: transforming during parse

\`\`\`js
const json = '{"name":"Ada","createdAt":"2026-03-15T00:00:00.000Z"}'

const parsed = JSON.parse(json, (key, value) => {
  if (key === "createdAt") return new Date(value)   // convert the ISO string BACK into a real Date
  return value
})

console.log(parsed.createdAt instanceof Date)   // true
\`\`\`

Recall the previous lesson: \`JSON.stringify\`ing a \`Date\` automatically converts it to an ISO string (\`Date\` objects have a \`toJSON()\` method the serializer calls) — but parsing it back gives you a plain string, not a real \`Date\`, unless you explicitly reconstruct it. A reviver function is the standard way to restore specific fields to their intended type after parsing.

### Circular references: a hard limitation

\`\`\`js
const obj = { name: "Ada" }
obj.self = obj   // a circular reference

JSON.stringify(obj)   // TypeError: Converting circular structure to JSON
\`\`\`

\`JSON.stringify\` cannot handle an object that references itself (directly or indirectly) — it throws immediately. Recall module 5's \`structuredClone\` — unlike \`JSON.stringify\`, it *can* handle circular references correctly, which is one concrete reason to prefer it over the "\`JSON.parse(JSON.stringify(x))\`" trick some code uses as a quick-and-dirty deep clone.

> **Key idea:** \`JSON.stringify\`/\`parse\` cover the common case well, but functions, \`undefined\`, \`NaN\`/\`Infinity\`, \`BigInt\`, and circular references all fail or silently vanish — the replacer/reviver function arguments give you control over exactly what gets included and how types are restored, but for a genuine deep clone with full type fidelity, module 5's \`structuredClone\` is the more correct tool.`,
    },
  ],
}
