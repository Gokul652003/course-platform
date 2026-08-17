import type { Module } from "../types"

export const kotlinModule12: Module = {
  id: 12,
  title: "Compose State, Input & Navigation",
  status: "upcoming",
  lessons: [
    {
      name: "MutableState",
      minutes: 10,
      intro: "The observable value type that makes remember { mutableStateOf(...) } work.",
      content: `### Unwrapping mutableStateOf

\`\`\`kotlin
val state: MutableState<Int> = mutableStateOf(0)

state.value        // read: 0
state.value = 5     // write: triggers recomposition of anything reading .value
\`\`\`

\`mutableStateOf(initial)\` creates a \`MutableState<T>\` — a box holding a value, where reading \`.value\` inside a composable subscribes that composable to future changes, and writing \`.value\` schedules a recomposition of every subscriber.

### The by keyword removes the .value boilerplate

\`\`\`kotlin
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

var count by remember { mutableStateOf(0) }

count++              // instead of state.value++
Text("Count: $count") // instead of state.value
\`\`\`

\`by\` uses Kotlin **property delegation** — \`getValue\`/\`setValue\` extension functions let a \`MutableState<Int>\` behave like a plain \`Int\` variable at the call site, while still going through the observable state object underneath. This is the form you'll see in almost every real Compose codebase.

### Reading vs writing — which triggers what

\`\`\`kotlin
var name by remember { mutableStateOf("") }

TextField(
    value = name,                     // reading name — subscribes this composable
    onValueChange = { name = it }     // writing name — triggers recomposition
)
\`\`\`

Only composables that actually **read** \`name\` get recomposed when it changes — a \`Text\` elsewhere that never reads \`name\` is untouched, which is why Compose can update huge screens efficiently even though state can live "high up" in a hierarchy.

### State must be immutable data, mutated only through .value

\`\`\`kotlin
data class User(val name: String, val age: Int)

var user by remember { mutableStateOf(User("Gokul", 30)) }

// Wrong: mutating a field directly does nothing observable
// user.age = 31

// Right: create a new value, assign it through the delegate
user = user.copy(age = 31)
\`\`\`

Compose only notices a **new value being assigned**, not a field being mutated inside an existing object — this is why state classes are typically immutable \`data class\`es updated via \`.copy()\`.

> **Key idea:** \`mutableStateOf\` is the object; \`remember\` is what keeps it alive across recompositions; \`by\` is just syntax sugar so you can treat it like a normal variable. All three together are the standard Compose state pattern.`,
    },
    {
      name: "TextField",
      minutes: 10,
      intro: "Text input, and the state-hoisting pattern behind every Compose input.",
      content: `### A controlled input

\`\`\`kotlin
var text by remember { mutableStateOf("") }

TextField(
    value = text,
    onValueChange = { text = it },
    label = { Text("Your name") }
)
\`\`\`

Unlike an XML \`EditText\`, a Compose \`TextField\` doesn't manage its own text internally — it's a **controlled input**: it always shows exactly \`value\`, and every keystroke calls \`onValueChange\` with the new string, which you're responsible for storing back into state.

### Why "controlled" matters

\`\`\`kotlin
TextField(
    value = text,
    onValueChange = { new ->
        if (new.length <= 10) text = new   // reject input over 10 chars
    }
)
\`\`\`

Because you own the state, you can intercept every change — validate it, transform it (e.g. force uppercase), or reject it outright — before it ever reaches the screen. An uncontrolled input can't do this cleanly.

### State hoisting — the pattern this demonstrates

\`\`\`kotlin
@Composable
fun NameField(name: String, onNameChange: (String) -> Unit) {
    TextField(value = name, onValueChange = onNameChange, label = { Text("Name") })
}

@Composable
fun SignUpForm() {
    var name by remember { mutableStateOf("") }
    NameField(name = name, onNameChange = { name = it })
}
\`\`\`

\`NameField\` itself holds no state — it receives a value and a callback, and its parent owns the actual \`remember\`ed state. This is called **state hoisting**: pushing state up to the lowest common owner that needs it, which keeps individual composables simple, reusable, and easy to test.

### Common TextField parameters

\`\`\`kotlin
TextField(
    value = amount,
    onValueChange = { amount = it },
    label = { Text("Amount") },
    placeholder = { Text("0.00") },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
    singleLine = true
)
\`\`\`

\`keyboardType\` swaps which on-screen keyboard appears (numeric, email, phone...); \`singleLine\` prevents the field from wrapping to multiple lines.

> **Key idea:** Every Compose input is "controlled" — value in, onValueChange out. Hoisting that state to a parent composable is the standard way to keep reusable UI pieces free of their own internal state.`,
    },
    {
      name: "Card",
      minutes: 7,
      intro: "A styled surface for grouping related content.",
      content: `### A basic Card

\`\`\`kotlin
Card(
    modifier = Modifier.padding(16.dp).fillMaxWidth(),
    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Task title", fontWeight = FontWeight.Bold)
        Text("Due tomorrow", color = Color.Gray)
    }
}
\`\`\`

\`Card\` is a \`Box\`-like container with rounded corners, a background surface color, and (optionally) elevation — a drop shadow that visually lifts it off the page. It's the standard way to group related content into a distinct visual unit, the same job \`CardView\` did in the XML/View system.

### Elevation communicates hierarchy

\`\`\`kotlin
Card(elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)) { }   // subtle
Card(elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)) { }   // prominent
\`\`\`

Higher elevation reads as "closer to the user" — reserve it for content that should stand out, like a selected item or a floating summary.

### A clickable Card

\`\`\`kotlin
Card(
    onClick = { openTaskDetail(task.id) },
    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
) {
    Text(task.title, modifier = Modifier.padding(16.dp))
}
\`\`\`

Passing \`onClick\` directly to \`Card\` gives it the correct ripple feedback and touch target automatically — you don't need to wrap it in a separate clickable modifier.

### A Card inside a LazyColumn — the common combination

\`\`\`kotlin
LazyColumn {
    items(tasks, key = { it.id }) { task ->
        Card(modifier = Modifier.padding(8.dp)) {
            Text(task.title, modifier = Modifier.padding(16.dp))
        }
    }
}
\`\`\`

This pairing — a \`Card\` per row inside a \`LazyColumn\` — is probably the single most common layout pattern in real Compose apps.

> **Key idea:** \`Card\` is a styled, elevated container for grouping content — reach for it any time a chunk of UI should read as "one distinct thing" rather than blending into the background.`,
    },
    {
      name: "Scaffold",
      minutes: 9,
      intro: "The composable that assembles a whole screen's standard structure.",
      content: `### The screen shell

\`\`\`kotlin
Scaffold(
    topBar = {
        TopAppBar(title = { Text("My Tasks") })
    },
    floatingActionButton = {
        FloatingActionButton(onClick = { addNewTask() }) {
            Icon(Icons.Filled.Add, contentDescription = "Add task")
        }
    }
) { innerPadding ->
    LazyColumn(modifier = Modifier.padding(innerPadding)) {
        items(tasks) { TaskRow(it) }
    }
}
\`\`\`

\`Scaffold\` provides the standard slots a screen usually needs — top app bar, bottom bar, floating action button, snackbar host — and arranges them correctly around your main content, which goes in its trailing lambda.

### Why innerPadding matters

The trailing lambda receives a \`PaddingValues\` parameter (here named \`innerPadding\`) that accounts for the space the top bar, bottom bar, and FAB actually take up. Apply it to your content's modifier — skip it, and your content can render underneath the app bar or FAB.

### Common slots

| Slot | Purpose |
|------|---------|
| \`topBar\` | App bar with title, navigation icon, actions |
| \`bottomBar\` | Bottom navigation or a bottom app bar |
| \`floatingActionButton\` | The primary action button, bottom-right by default |
| \`snackbarHost\` | Where transient messages appear |

### A bottom navigation example

\`\`\`kotlin
Scaffold(
    bottomBar = {
        NavigationBar {
            NavigationBarItem(selected = true, onClick = { }, icon = { Icon(Icons.Filled.Home, null) }, label = { Text("Home") })
            NavigationBarItem(selected = false, onClick = { }, icon = { Icon(Icons.Filled.Settings, null) }, label = { Text("Settings") })
        }
    }
) { innerPadding ->
    HomeContent(modifier = Modifier.padding(innerPadding))
}
\`\`\`

> **Key idea:** \`Scaffold\` isn't a layout you nest things inside for visual effect — it's a structural template for "a screen," and the \`innerPadding\` it hands back is not optional to apply.`,
    },
    {
      name: "Navigation",
      minutes: 11,
      intro: "Moving between composable screens with Navigation Compose.",
      content: `### Why navigation needs a library

Composables aren't Activities — you can't \`startActivity\` your way between two \`@Composable\` screens. **Navigation Compose** manages a back stack of composable "destinations" within a single Activity, the Compose-native replacement for starting new Activities per screen.

### Defining routes with NavHost

\`\`\`kotlin
val navController = rememberNavController()

NavHost(navController = navController, startDestination = "home") {
    composable("home") { HomeScreen(navController) }
    composable("detail") { DetailScreen(navController) }
}
\`\`\`

- \`rememberNavController()\` creates and remembers the controller that tracks the back stack
- \`NavHost\` is a container that swaps its content based on the current route
- Each \`composable("route") { }\` registers one destination

### Navigating between screens

\`\`\`kotlin
@Composable
fun HomeScreen(navController: NavController) {
    Button(onClick = { navController.navigate("detail") }) {
        Text("View details")
    }
}
\`\`\`

\`navController.navigate("detail")\` pushes the \`"detail"\` destination onto the back stack — the system back button (or a back arrow you wire up) pops it automatically via \`navController.popBackStack()\`.

### Passing arguments through a route

\`\`\`kotlin
NavHost(navController, startDestination = "home") {
    composable("home") { HomeScreen(navController) }
    composable("detail/{taskId}") { backStackEntry ->
        val taskId = backStackEntry.arguments?.getString("taskId")
        DetailScreen(taskId)
    }
}

// navigating with an argument
navController.navigate("detail/42")
\`\`\`

The \`{taskId}\` segment in the route string is a placeholder, filled in when you navigate and read back out of \`backStackEntry.arguments\` on the receiving screen — Navigation Compose's version of the \`Intent\` extras from Phase 2.

> **Key idea:** \`NavController\` + \`NavHost\` + \`composable("route")\` replace starting new Activities — routes are just strings, and the whole back stack lives inside one Activity.`,
    },
  ],
}
