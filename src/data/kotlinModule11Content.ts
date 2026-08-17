import type { Module } from "../types"

export const kotlinModule11: Module = {
  id: 11,
  title: "Compose Layouts, Lists & State",
  status: "upcoming",
  lessons: [
    {
      name: "Box",
      minutes: 8,
      intro: "Stacking composables on top of each other.",
      content: `### The overlapping container

\`\`\`kotlin
Box {
    Image(
        painter = painterResource(id = R.drawable.banner),
        contentDescription = null,
        modifier = Modifier.fillMaxWidth()
    )
    Text(
        text = "50% OFF",
        color = Color.White,
        modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp)
    )
}
\`\`\`

Where \`Column\` and \`Row\` lay children out in a stack of non-overlapping slots, \`Box\` layers every child **on top of one another**, all sized independently — it's how you badge an icon, caption an image, or overlay a loading spinner.

### Positioning children within a Box

\`\`\`kotlin
Box(modifier = Modifier.fillMaxSize()) {
    Text("Bottom-right corner", modifier = Modifier.align(Alignment.BottomEnd))
    Text("Top-left corner", modifier = Modifier.align(Alignment.TopStart))
}
\`\`\`

Each child gets its own \`Modifier.align(...)\` to say where inside the Box it should sit — \`Alignment.Center\`, \`TopStart\`, \`BottomEnd\`, and so on.

### A badge over an icon — the classic Box use case

\`\`\`kotlin
Box {
    Icon(Icons.Filled.Notifications, contentDescription = "Notifications")
    Box(
        modifier = Modifier
            .align(Alignment.TopEnd)
            .size(8.dp)
            .background(Color.Red, CircleShape)
    )
}
\`\`\`

A small red dot, positioned in the corner of an icon — this pattern (a small \`Box\` inside a bigger \`Box\`) is everywhere in real UIs.

### contentAlignment for a default

\`\`\`kotlin
Box(contentAlignment = Alignment.Center) {
    CircularProgressIndicator()
}
\`\`\`

If every child should share the same alignment, set it once on the Box itself instead of repeating \`Modifier.align\` on each child.

> **Key idea:** Reach for \`Box\` whenever you need layering, not stacking — overlays, badges, and centered content on top of a background all start with \`Box\`.`,
    },
    {
      name: "LazyColumn",
      minutes: 10,
      intro: "Efficient scrolling lists — Compose's replacement for RecyclerView.",
      content: `### The problem with a plain Column of many items

\`\`\`kotlin
// Don't do this for long lists
Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
    items.forEach { Text(it.name) }
}
\`\`\`

A regular \`Column\` composes **every** child immediately, even the ones off-screen. For a list of 5 that's fine; for a list of 5,000 it's wasteful and slow.

### LazyColumn — only compose what's visible

\`\`\`kotlin
LazyColumn {
    items(taskList) { task ->
        Text(task.title, modifier = Modifier.padding(16.dp))
    }
}
\`\`\`

\`LazyColumn\` only creates and lays out the rows currently on (or near) screen, recycling composables as you scroll — exactly the efficiency \`RecyclerView\` gave the old View system, but without an Adapter/ViewHolder class to write.

### Giving each item a stable key

\`\`\`kotlin
LazyColumn {
    items(taskList, key = { it.id }) { task ->
        TaskRow(task)
    }
}
\`\`\`

The \`key\` tells Compose how to track an item's identity across list changes (reordering, insertion, deletion) so it can animate and recompose correctly instead of confusing one row for another.

### Mixing item types

\`\`\`kotlin
LazyColumn {
    item { Text("Header", fontWeight = FontWeight.Bold) }
    items(taskList) { task -> TaskRow(task) }
    item { Text("End of list") }
}
\`\`\`

\`item { }\` adds a single composable; \`items(list) { }\` adds one row per element. You can freely mix both inside the same \`LazyColumn\` — useful for headers, footers, and section dividers.

> **Key idea:** Use \`LazyColumn\` for any list that could grow — it only builds what's on screen, and \`items(list, key = ...)\` is the pattern you'll reach for constantly.`,
    },
    {
      name: "LazyRow",
      minutes: 7,
      intro: "The horizontal-scrolling counterpart to LazyColumn.",
      content: `### Same idea, sideways

\`\`\`kotlin
LazyRow {
    items(categories) { category ->
        CategoryChip(category)
    }
}
\`\`\`

\`LazyRow\` is \`LazyColumn\` rotated 90 degrees — efficient, recycling, horizontally scrolling. It's what powers horizontally-scrolling category chips, image carousels, and "recently viewed" strips.

### Spacing between items

\`\`\`kotlin
LazyRow(
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    contentPadding = PaddingValues(horizontal = 16.dp)
) {
    items(products) { product -> ProductCard(product) }
}
\`\`\`

\`contentPadding\` adds padding around the whole scrollable content — critically, it still applies **inside** the scrolling area, so the first and last items get breathing room without cutting off the scroll bounds (unlike a plain \`Modifier.padding\` on the LazyRow itself).

### LazyColumn and LazyRow share the same API shape

| Concept | LazyColumn | LazyRow |
|---------|-----------|---------|
| Axis | Vertical | Horizontal |
| Add one item | \`item { }\` | \`item { }\` |
| Add many items | \`items(list) { }\` | \`items(list) { }\` |
| Stable identity | \`key = { it.id }\` | \`key = { it.id }\` |

Once you've learned one, you already know the other.

### Nesting a LazyRow inside a LazyColumn

\`\`\`kotlin
LazyColumn {
    item {
        LazyRow { items(featured) { FeaturedCard(it) } }
    }
    items(allProducts) { ProductRow(it) }
}
\`\`\`

A common real-world pattern — a horizontally-scrolling "featured" strip as one row inside an otherwise vertically-scrolling screen.

> **Key idea:** \`LazyRow\` mirrors \`LazyColumn\` exactly, just on the other axis — the same \`item\`/\`items\`/\`key\` vocabulary applies to both.`,
    },
    {
      name: "State",
      minutes: 9,
      intro: "The idea that drives everything in Compose: UI is a function of state.",
      content: `### UI = f(state)

Compose's core idea: your UI at any moment is simply what your composable function produces, given the current data. Change the data, Compose re-runs the function, the UI updates. This is why Compose calls itself **declarative** — you never write "update the text to X," you just say "the text is whatever \`name\` currently is."

\`\`\`kotlin
@Composable
fun Counter(count: Int) {
    Text("Count: $count")
}
\`\`\`

Call \`Counter(0)\`, then later \`Counter(1)\` — Compose diffs what actually changed and updates only that, a process called **recomposition**.

### Why a plain var doesn't work

\`\`\`kotlin
@Composable
fun Counter() {
    var count = 0   // does NOT trigger recomposition
    Button(onClick = { count++ }) {
        Text("Count: $count")   // never updates on screen
    }
}
\`\`\`

Compose has no way of knowing a plain Kotlin variable changed — it doesn't watch memory, it watches **State objects**. Changing \`count\` here does nothing visible, because nothing told Compose to re-run the function.

### The fix, previewed

\`\`\`kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
\`\`\`

\`mutableStateOf\` wraps a value in an observable **State** object; Compose automatically tracks which composables read it, and reruns exactly those when it changes. The next two lessons unpack \`remember\` and \`mutableStateOf\` individually — for now, the concept to hold onto is: **state is the only thing that triggers a composable to redraw.**

> **Key idea:** Nothing updates on screen just because a variable changed value — it updates because a *State object* changed and Compose noticed. Everything about Compose's reactivity flows from that one fact.`,
    },
    {
      name: "Remember",
      minutes: 9,
      intro: "Surviving recomposition without surviving configuration changes.",
      content: `### The problem remember solves

\`\`\`kotlin
@Composable
fun Counter() {
    val state = mutableStateOf(0)   // recreated every recomposition!
    Button(onClick = { state.value++ }) {
        Text("Count: ${'$'}{state.value}")
    }
}
\`\`\`

Every time this composable **recomposes**, the function body runs again from the top — including \`mutableStateOf(0)\`, which would reset the count back to 0 on every redraw. That defeats the purpose entirely.

### remember caches a value across recompositions

\`\`\`kotlin
@Composable
fun Counter() {
    val state = remember { mutableStateOf(0) }
    Button(onClick = { state.value++ }) {
        Text("Count: ${'$'}{state.value}")
    }
}
\`\`\`

\`remember { }\` runs its lambda **once**, the first time this composable enters the UI, and hands back the same object on every subsequent recomposition — so the counter keeps its value as it redraws.

### What remember does NOT survive

\`remember\` state is lost when the composable leaves the composition entirely — most notably, a **configuration change** like screen rotation destroys and recreates the whole Activity by default, taking \`remember\`ed state with it. (\`rememberSaveable\`, a small variation, survives rotation by saving into the same instance-state bundle covered in Phase 2 — worth knowing exists, though not covered in depth here.)

### remember vs a plain val outside the function

\`\`\`kotlin
val counter = mutableStateOf(0)   // module-level: shared across every call, survives forever

@Composable
fun Counter() {
    val state = remember { mutableStateOf(0) }   // scoped: fresh per call site, survives recomposition
}
\`\`\`

\`remember\` gives you a middle ground — state that's private to one composable call, but doesn't get wiped on every redraw.

> **Key idea:** Without \`remember\`, every recomposition throws your state away and starts over. \`remember\` is what lets a composable's local state actually persist while the UI keeps redrawing around it.`,
    },
  ],
}
