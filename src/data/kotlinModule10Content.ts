import type { Module } from "../types"

export const kotlinModule10: Module = {
  id: 10,
  title: "Compose Basics: Text, Buttons & Layout",
  status: "upcoming",
  lessons: [
    {
      name: "Text",
      minutes: 8,
      intro: "Your first composable, and the mental shift from XML to Compose.",
      content: `### Composable functions, not XML

Jetpack Compose replaces XML layouts with plain Kotlin functions marked \`@Composable\`. Instead of describing a view tree in markup, you describe your UI by calling functions.

\`\`\`kotlin
@Composable
fun Greeting() {
    Text(text = "Hello, Compose!")
}
\`\`\`

\`Text\` is Compose's equivalent of \`TextView\` — but it's a function call, not an XML tag.

### Styling a Text

\`\`\`kotlin
Text(
    text = "Welcome back",
    fontSize = 24.sp,
    fontWeight = FontWeight.Bold,
    color = Color(0xFF6200EE)
)
\`\`\`

Notice \`sp\` still shows up for text size — the density-independent units from Phase 2 carry over directly into Compose code.

### Declarative, not imperative

In the XML/View world, you *mutate* a view: \`textView.text = "new value"\`. In Compose, you *describe* what the UI should look like for the current data, and Compose figures out what changed and redraws only that:

\`\`\`kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
\`\`\`

Call \`Greeting("Gokul")\` and you get "Hello, Gokul!" — call it again with a different \`name\` and Compose re-runs the function and updates the text. This "re-run the function on change" model is called **recomposition**, and it's the core idea the rest of this phase builds on.

### Rendering it

\`\`\`kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Greeting("Gokul")
        }
    }
}
\`\`\`

\`setContent { }\` replaces \`setContentView(R.layout...)\` — it's where a Compose UI attaches to an Activity.

> **Key idea:** A composable is just a function. Compose doesn't remember "the text view" — it re-runs your function and figures out the minimal update whenever the data behind it changes.`,
    },
    {
      name: "Button",
      minutes: 8,
      intro: "The tappable composable, and how content slots work.",
      content: `### A basic Button

\`\`\`kotlin
Button(onClick = { println("Clicked!") }) {
    Text("Submit")
}
\`\`\`

Two things to notice:

- \`onClick\` is a lambda — no separate listener object, no \`findViewById\`
- The \`{ }\` after the parentheses is a **content slot** — whatever composables you put inside become the button's content. Usually that's a \`Text\`, but it could be an \`Icon\`, or both.

### Button variants

\`\`\`kotlin
Button(onClick = { }) { Text("Filled") }
OutlinedButton(onClick = { }) { Text("Outlined") }
TextButton(onClick = { }) { Text("Text only") }
\`\`\`

Same shape, different visual weight — pick based on how much emphasis the action deserves (filled for primary actions, text for the least prominent).

### Disabling a button

\`\`\`kotlin
Button(
    onClick = { submitForm() },
    enabled = formIsValid
) {
    Text("Submit")
}
\`\`\`

\`enabled\` is just a Boolean parameter — when it depends on some piece of state, the button automatically greys out and stops responding to taps as soon as that state changes, because Compose recomposes it.

### Icon inside a button

\`\`\`kotlin
Button(onClick = { }) {
    Icon(Icons.Filled.Add, contentDescription = null)
    Spacer(Modifier.width(4.dp))
    Text("Add item")
}
\`\`\`

\`Spacer\` is a composable whose only job is to take up space — the Compose equivalent of a margin between two inline elements.

> **Key idea:** Composables take other composables as content, not just strings — a Button's label isn't a "text" property, it's whatever you put in its trailing lambda.`,
    },
    {
      name: "Image",
      minutes: 7,
      intro: "Displaying pictures and icons, and why contentDescription matters.",
      content: `### Showing a drawable resource

\`\`\`kotlin
Image(
    painter = painterResource(id = R.drawable.logo),
    contentDescription = "Company logo"
)
\`\`\`

\`painterResource\` loads an image from \`res/drawable/\`, the same folder used for XML-based apps — Compose reuses the resource system from Phase 2 entirely.

### contentDescription is not optional

\`\`\`kotlin
Image(
    painter = painterResource(id = R.drawable.ic_delete),
    contentDescription = "Delete item"   // read aloud by TalkBack
)
\`\`\`

Screen readers use \`contentDescription\` to announce what an image represents. If the image is purely decorative and conveys no information, pass \`contentDescription = null\` explicitly — that's Compose's way of saying "I considered accessibility and this one genuinely needs no label," rather than an accidental omission.

### Sizing and cropping with Modifier

\`\`\`kotlin
Image(
    painter = painterResource(id = R.drawable.avatar),
    contentDescription = "User avatar",
    modifier = Modifier
        .size(64.dp)
        .clip(CircleShape),
    contentScale = ContentScale.Crop
)
\`\`\`

\`Modifier\` is Compose's way of adjusting a composable's size, shape, padding, and behavior — nearly every composable accepts one. \`contentScale = ContentScale.Crop\` fills the bounds and crops overflow, the Compose equivalent of \`android:scaleType="centerCrop"\`.

### Icons

\`\`\`kotlin
Icon(
    imageVector = Icons.Filled.Favorite,
    contentDescription = "Favorite",
    tint = Color.Red
)
\`\`\`

\`Icon\` is a specialized \`Image\` for vector icons — it adds a \`tint\` parameter since icons are usually meant to pick up a single color.

> **Key idea:** \`Image\` reuses the same \`res/drawable/\` resources from XML-based Android — the only new concept is \`Modifier\` for sizing/shaping, and \`contentDescription\` for accessibility.`,
    },
    {
      name: "Column",
      minutes: 8,
      intro: "Stacking composables vertically.",
      content: `### The vertical container

\`\`\`kotlin
Column {
    Text("Line one")
    Text("Line two")
    Button(onClick = { }) { Text("Go") }
}
\`\`\`

Everything inside a \`Column\`'s \`{ }\` is laid out top to bottom, in the order it's written — this is Compose's replacement for \`LinearLayout android:orientation="vertical"\`.

### Controlling spacing and alignment

\`\`\`kotlin
Column(
    modifier = Modifier.fillMaxWidth().padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp),
    horizontalAlignment = Alignment.CenterHorizontally
) {
    Text("Welcome")
    Text("Sign in to continue")
}
\`\`\`

| Parameter | Controls |
|-----------|----------|
| \`verticalArrangement\` | Spacing/distribution along the stacking axis (top-to-bottom) |
| \`horizontalAlignment\` | Where children sit on the cross axis (left/center/right) |
| \`modifier\` | Size, padding, background — applied to the Column itself |

\`Arrangement.spacedBy(8.dp)\` puts a consistent 8dp gap between every child — cleaner than adding a \`Spacer\` between each one manually.

### Filling available space

\`\`\`kotlin
Modifier.fillMaxWidth()    // as wide as the parent allows
Modifier.fillMaxHeight()   // as tall as the parent allows
Modifier.fillMaxSize()     // both
\`\`\`

These are the Compose equivalents of \`layout_width="match_parent"\` / \`layout_height="match_parent"\` — but expressed as modifiers, composable on the same line as padding, background, and click handling.

> **Key idea:** \`Column\` stacks vertically in source order — \`verticalArrangement\` controls spacing along that stack, \`horizontalAlignment\` controls the cross-axis, and \`Modifier\` controls the container's own size and spacing.`,
    },
    {
      name: "Row",
      minutes: 7,
      intro: "The horizontal counterpart to Column.",
      content: `### Laying children out side by side

\`\`\`kotlin
Row {
    Icon(Icons.Filled.Star, contentDescription = null)
    Text("4.8 rating")
}
\`\`\`

\`Row\` is \`Column\`'s mirror image — children flow left to right instead of top to bottom. It's the replacement for \`LinearLayout android:orientation="horizontal"\`.

### Same alignment concepts, axes swapped

\`\`\`kotlin
Row(
    modifier = Modifier.fillMaxWidth().padding(16.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
) {
    Text("Total")
    Text("$42.00")
}
\`\`\`

| Parameter | Controls |
|-----------|----------|
| \`horizontalArrangement\` | Spacing/distribution along the stacking axis (left-to-right) |
| \`verticalAlignment\` | Where children sit on the cross axis (top/center/bottom) |

\`Arrangement.SpaceBetween\` pushes the first child to the start and the last to the end, spreading any remaining children evenly — a common pattern for a label-and-value row like the one above.

### Combining Row and Column

\`\`\`kotlin
Column {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Filled.Person, contentDescription = null)
        Spacer(Modifier.width(8.dp))
        Text("Gokul")
    }
    Text("Software Engineer", fontSize = 14.sp, color = Color.Gray)
}
\`\`\`

Real screens are almost always a nested mix of \`Column\`s containing \`Row\`s containing more \`Column\`s — exactly like nested \`LinearLayout\`s in XML, but composed as plain function calls instead of a markup tree.

> **Key idea:** \`Row\` and \`Column\` are the two basic layout primitives in Compose — everything from a simple form to a complex screen is built by nesting them.`,
    },
  ],
}
