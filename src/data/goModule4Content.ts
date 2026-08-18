import type { Module } from "../types"

export const goModule4: Module = {
  id: 4,
  title: "Structs & Methods",
  status: "upcoming",
  lessons: [
    {
      name: "Defining Structs",
      minutes: 8,
      intro: "Group related fields into a named type — Go's answer to a class's data.",
      content: `### Declaring a struct

A struct bundles named fields into a single type:

\`\`\`go
type User struct {
    Name  string
    Email string
    Age   int
}
\`\`\`

Field names starting with an uppercase letter are **exported** (visible outside the package); lowercase fields are package-private. This is Go's entire visibility system — no \`public\`/\`private\` keywords.

### Struct literals — keyed

The clearest, most common way to build a struct value names each field explicitly:

\`\`\`go
u := User{
    Name:  "Gokul",
    Email: "gokul@example.com",
    Age:   28,
}
\`\`\`

Keyed literals can appear in any order, and you're free to omit fields — omitted fields get their zero value:

\`\`\`go
partial := User{Name: "Ann"} // Email: "", Age: 0
\`\`\`

### Struct literals — positional

You can also list values in field-declaration order, with no keys — but every field must be provided, and this style breaks silently if the struct's fields are ever reordered:

\`\`\`go
u := User{"Gokul", "gokul@example.com", 28}
\`\`\`

Keyed literals are considered idiomatic for anything beyond trivial structs, precisely because positional literals are fragile against future edits.

### Field access

\`\`\`go
fmt.Println(u.Name)  // Gokul
u.Age = 29            // fields are mutable through a variable
fmt.Println(u.Age)   // 29
\`\`\`

### Nested structs

Struct fields can themselves be structs, letting you model real-world hierarchies:

\`\`\`go
type Address struct {
    City    string
    Country string
}

type User struct {
    Name    string
    Age     int
    Address Address // nested struct field
}

u := User{
    Name: "Gokul",
    Age:  28,
    Address: Address{
        City:    "Bengaluru",
        Country: "India",
    },
}

fmt.Println(u.Address.City) // Bengaluru
\`\`\`

Access chains right through with dots, same as any other field.

> **Key idea:** A struct is just a typed bundle of fields — no behavior, no constructors, no inheritance built in. Everything struct-related that feels "object-oriented" in Go — methods, composition — is layered on top of this plain data shape, which we cover next.`,
    },
    {
      name: "Methods & Receivers",
      minutes: 10,
      intro: "Attach functions to a type, and know when you must use a pointer.",
      content: `### What a method is

A method is a function with an extra parameter — the **receiver** — written between \`func\` and the method name:

\`\`\`go
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

rect := Rectangle{Width: 3, Height: 4}
fmt.Println(rect.Area()) // 12
\`\`\`

\`(r Rectangle)\` is the receiver — it makes \`Area\` callable as \`rect.Area()\` instead of \`Area(rect)\`.

### Value receivers — work on a copy

\`\`\`go
func (r Rectangle) Double() {
    r.Width *= 2  // only changes the local copy
    r.Height *= 2
}

rect := Rectangle{Width: 3, Height: 4}
rect.Double()
fmt.Println(rect) // {3 4} — unchanged!
\`\`\`

Just like passing a struct to a plain function, a value receiver gets a **copy**. Mutations inside the method vanish when it returns.

### Pointer receivers — work on the original

To actually mutate the caller's struct, use a pointer receiver:

\`\`\`go
func (r *Rectangle) Double() {
    r.Width *= 2
    r.Height *= 2
}

rect := Rectangle{Width: 3, Height: 4}
rect.Double()
fmt.Println(rect) // {6 8} — mutated!
\`\`\`

Notice you still call it as \`rect.Double()\`, not \`(&rect).Double()\` — Go automatically takes the address for you when calling a pointer-receiver method on an addressable value.

### When a pointer receiver is required

| Situation | Receiver to use |
|-----------|------------------|
| Method needs to mutate the receiver | pointer (\`*T\`) |
| Struct is large and copying it is wasteful | pointer (\`*T\`) |
| Method just reads fields, struct is small | value (\`T\`) is fine |
| Type already has other pointer-receiver methods | pointer, for consistency |

\`\`\`go
type Counter struct {
    count int
}

func (c *Counter) Increment() {
    c.count++
}

func (c Counter) Value() int {
    return c.count
}

c := Counter{}
c.Increment()
c.Increment()
fmt.Println(c.Value()) // 2
\`\`\`

### Method sets

A type's **method set** determines which methods it can call. A value of type \`T\` can call value-receiver methods directly, but calling a pointer-receiver method requires an addressable value (Go handles this automatically for local variables, but not, for example, for a map value, which isn't addressable).

> **Key idea:** Reach for a pointer receiver any time a method needs to mutate the struct, and for consistency, mix value and pointer receivers on the same type as rarely as possible — pick one style per type.`,
    },
    {
      name: "Struct Embedding & Composition",
      minutes: 10,
      intro: "No inheritance in Go — embedding promotes fields and methods instead.",
      content: `### Go has no inheritance

There's no \`extends\`, no \`: BaseClass\`, no class hierarchy. Instead, Go favors **composition**: you build new types by embedding existing ones inside them.

### Embedding a struct

\`\`\`go
type Animal struct {
    Name string
}

func (a Animal) Describe() string {
    return "I am " + a.Name
}

type Dog struct {
    Animal // embedded — note: no field name, just the type
    Breed  string
}
\`\`\`

Because \`Animal\` is embedded (not given an explicit field name), its fields and methods are **promoted** — they become directly accessible on \`Dog\`, as if \`Dog\` had declared them itself:

\`\`\`go
d := Dog{
    Animal: Animal{Name: "Rex"},
    Breed:  "Labrador",
}

fmt.Println(d.Name)        // Rex — promoted field
fmt.Println(d.Describe())  // I am Rex — promoted method
fmt.Println(d.Breed)       // Labrador
\`\`\`

You can still reach the embedded value explicitly by its type name when you need to be precise:

\`\`\`go
fmt.Println(d.Animal.Name) // same as d.Name
\`\`\`

### Overriding a promoted method

Defining a method with the same name directly on \`Dog\` shadows the promoted one — Go picks the most specific match:

\`\`\`go
func (d Dog) Describe() string {
    return "I am " + d.Name + ", a " + d.Breed
}

fmt.Println(d.Describe()) // I am Rex, a Labrador — Dog's version wins
\`\`\`

### How this differs from classical inheritance

| Classical inheritance | Go embedding |
|------------------------|--------------|
| \`Dog\` **is-a** \`Animal\` | \`Dog\` **has-a** \`Animal\`, with fields/methods promoted |
| Often a rigid single hierarchy | Freely embed multiple types, no hierarchy at all |
| Polymorphism via virtual dispatch | Achieved separately, via interfaces |
| A subclass can be passed where the base type is expected | A \`Dog\` is not automatically a valid \`Animal\` value — you'd assign \`d.Animal\` explicitly |

\`\`\`go
type Named interface {
    Describe() string
}

// Dog satisfies Named because it has a Describe() method —
// this works through Go's interfaces, not through embedding itself
var n Named = d
fmt.Println(n.Describe())
\`\`\`

You can also embed more than one type, effectively mixing in multiple sets of behavior — something single-inheritance languages can't do directly:

\`\`\`go
type Swimmer struct{}
func (Swimmer) Swim() string { return "swimming" }

type Duck struct {
    Animal
    Swimmer
}

duck := Duck{Animal: Animal{Name: "Donald"}}
fmt.Println(duck.Describe(), duck.Swim())
\`\`\`

> **Key idea:** Embedding gives you code reuse (promoted fields and methods) without a class hierarchy. Whether a type can stand in for another is decided separately, by interfaces — embedding alone does not create an is-a relationship.`,
    },
    {
      name: "Constructors & the Zero Value",
      minutes: 9,
      intro: "Go skips constructors — design for a useful zero value, or write a New function.",
      content: `### Go has no constructors

There's no special method that automatically runs when you create a struct. You always build values through a literal, \`make\`, \`new\`, or a plain function you write yourself.

### The NewX(...) convention

When creating a value needs setup logic — defaults, validation, allocating nested fields — the idiomatic pattern is a plain function named \`NewX\` that returns \`*X\`:

\`\`\`go
type Server struct {
    Host    string
    Port    int
    Timeout time.Duration
}

func NewServer(host string, port int) *Server {
    return &Server{
        Host:    host,
        Port:    port,
        Timeout: 30 * time.Second, // sensible default
    }
}

srv := NewServer("localhost", 8080)
fmt.Println(srv.Host, srv.Port, srv.Timeout)
\`\`\`

Callers use \`NewServer(...)\` exactly the way they'd use a constructor in another language — it's a convention, not a language feature.

### Design for a useful zero value

Whenever practical, Go favors designing a type so its **zero value** (the state you get from \`var s Server\` or \`Server{}\`, with no explicit initialization at all) is already usable. The standard library leans on this constantly:

\`\`\`go
var buf bytes.Buffer // zero value — no "New" needed
buf.WriteString("hello")
fmt.Println(buf.String()) // hello

var mu sync.Mutex // zero value is already a valid, unlocked mutex
mu.Lock()
mu.Unlock()
\`\`\`

If your own type can be made to work this way, prefer it — it means callers don't have to remember to call a constructor at all, and a struct field of that type just works without extra initialization code.

### Functional options — configuring a NewX with optional settings

When a constructor has many optional parameters, positional arguments get unwieldy fast. The **functional options** pattern solves this with a slice of configuring functions:

\`\`\`go
type Server struct {
    Host    string
    Port    int
    Timeout time.Duration
}

type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) {
        s.Port = port
    }
}

func WithTimeout(d time.Duration) Option {
    return func(s *Server) {
        s.Timeout = d
    }
}

func NewServer(host string, opts ...Option) *Server {
    s := &Server{
        Host:    host,
        Port:    8080,             // defaults
        Timeout: 30 * time.Second,
    }
    for _, opt := range opts {
        opt(s) // each option mutates the server being built
    }
    return s
}
\`\`\`

Callers only specify what they want to override, in any order:

\`\`\`go
srv := NewServer("localhost", WithPort(9090), WithTimeout(5*time.Second))
plain := NewServer("localhost") // all defaults
\`\`\`

> **Key idea:** Without constructors, Go pushes you toward two complementary habits: make the zero value useful whenever you can, and reach for a \`NewX\` function — optionally powered by functional options — whenever setup actually requires logic.`,
    },
  ],
}
