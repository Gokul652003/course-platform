import type { Module } from "../types"

export const kotlinModule13: Module = {
  id: 13,
  title: "Compose Practice Projects",
  status: "upcoming",
  lessons: [
    {
      name: "Build: Todo App",
      minutes: 14,
      intro: "Combine LazyColumn, MutableState, TextField, and Card into a working task list.",
      content: `### The spec

A single-screen app: a text field + button to add a task, a scrollable list of tasks below, each with a checkbox to mark it done and a way to delete it.

### The data model and state

\`\`\`kotlin
data class Task(val id: Int, val title: String, val done: Boolean = false)

@Composable
fun TodoScreen() {
    var tasks by remember { mutableStateOf(listOf<Task>()) }
    var input by remember { mutableStateOf("") }
    var nextId by remember { mutableStateOf(0) }
    // ...
}
\`\`\`

All state lives at the top of the screen (module 11) — \`tasks\` is the single source of truth the whole UI renders from.

### The input row

\`\`\`kotlin
Row(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
    TextField(
        value = input,
        onValueChange = { input = it },
        modifier = Modifier.weight(1f),
        label = { Text("New task") }
    )
    Button(onClick = {
        if (input.isNotBlank()) {
            tasks = tasks + Task(nextId, input)
            nextId++
            input = ""
        }
    }) {
        Text("Add")
    }
}
\`\`\`

\`Modifier.weight(1f)\` (new here) tells the \`TextField\` to consume all remaining space in the \`Row\` after the \`Button\` takes what it needs — the standard way to make one child in a Row flexible.

Note \`tasks = tasks + Task(...)\` — a **new list**, not \`tasks.add(...)\` on the old one. Mutating a list in place doesn't create a new value, so Compose wouldn't detect the change (module 11's immutability rule).

### The scrollable list

\`\`\`kotlin
LazyColumn {
    items(tasks, key = { it.id }) { task ->
        Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)) {
            Row(
                modifier = Modifier.padding(12.dp).fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = task.done,
                    onCheckedChange = { checked ->
                        tasks = tasks.map { if (it.id == task.id) it.copy(done = checked) else it }
                    }
                )
                Text(
                    text = task.title,
                    modifier = Modifier.weight(1f),
                    textDecoration = if (task.done) TextDecoration.LineThrough else null
                )
                IconButton(onClick = { tasks = tasks.filter { it.id != task.id } }) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete ${'$'}{task.title}")
                }
            }
        }
    }
}
\`\`\`

Every mutation follows the same shape: build a **new** list from the old one (\`.map\`, \`.filter\`), assign it back to \`tasks\`. That reassignment is what triggers recomposition — the \`LazyColumn\` (module 11) then only redraws the rows that actually changed, using \`key = { it.id }\` to track identity through the edits.

### What this exercises

\`Card\`, \`Row\`, \`TextField\`, \`LazyColumn\`, and hoisted \`MutableState\` — everything from this phase's "Learn" modules, combined into one coherent screen.`,
    },
    {
      name: "Build: Expense Tracker",
      minutes: 14,
      intro: "Track a running total by deriving state from a list, instead of storing it separately.",
      content: `### The spec

Add an expense (description + amount), see it appear in a list, and see a running total update automatically at the top of the screen.

### The tempting-but-wrong approach

\`\`\`kotlin
var total by remember { mutableStateOf(0.0) }
var expenses by remember { mutableStateOf(listOf<Expense>()) }

fun addExpense(e: Expense) {
    expenses = expenses + e
    total += e.amount   // a second piece of state to keep in sync — a bug waiting to happen
}
\`\`\`

Two separate pieces of state that must always agree is a common source of bugs — forget to update one (e.g. when deleting an expense) and they silently drift apart.

### The better approach: derive it

\`\`\`kotlin
data class Expense(val id: Int, val description: String, val amount: Double)

@Composable
fun ExpenseTracker() {
    var expenses by remember { mutableStateOf(listOf<Expense>()) }
    val total = expenses.sumOf { it.amount }   // computed fresh every recomposition, never stale
    // ...
}
\`\`\`

\`total\` isn't state at all — it's a plain \`val\` computed from \`expenses\` every time this composable recomposes. There's only one source of truth (\`expenses\`); the total can never disagree with it, because it's recalculated, not tracked separately.

### The input row, with numeric input

\`\`\`kotlin
var description by remember { mutableStateOf("") }
var amountText by remember { mutableStateOf("") }

Row(modifier = Modifier.padding(16.dp)) {
    TextField(
        value = description, onValueChange = { description = it },
        label = { Text("What for?") }, modifier = Modifier.weight(1f)
    )
    TextField(
        value = amountText, onValueChange = { amountText = it },
        label = { Text("Amount") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = Modifier.width(100.dp)
    )
    Button(onClick = {
        val amount = amountText.toDoubleOrNull()
        if (description.isNotBlank() && amount != null) {
            expenses = expenses + Expense(expenses.size, description, amount)
            description = ""
            amountText = ""
        }
    }) { Text("Add") }
}
\`\`\`

\`toDoubleOrNull()\` (from Phase 1's null safety) turns invalid input into \`null\` instead of crashing — the \`Button\`'s \`onClick\` simply does nothing if the amount doesn't parse, a cheap form of validation.

### The total, displayed

\`\`\`kotlin
Text(
    text = "Total: $${'$'}{"%.2f".format(total)}",
    fontSize = 24.sp,
    fontWeight = FontWeight.Bold,
    modifier = Modifier.padding(16.dp)
)
\`\`\`

### What this exercises

The key lesson isn't a new composable — it's a state-design principle: **derive, don't duplicate.** Any value fully computable from existing state shouldn't be its own \`remember\`ed variable.`,
    },
    {
      name: "Build: BMI Calculator",
      minutes: 11,
      intro: "A small form that validates input and shows a conditional result.",
      content: `### The spec

Two number inputs — height (cm) and weight (kg) — a calculate button, and a result that also labels the BMI category (underweight / normal / overweight).

### The state and the calculation

\`\`\`kotlin
@Composable
fun BmiCalculator() {
    var heightText by remember { mutableStateOf("") }
    var weightText by remember { mutableStateOf("") }
    var result by remember { mutableStateOf<Double?>(null) }

    fun calculate() {
        val heightM = heightText.toDoubleOrNull()?.div(100)
        val weight = weightText.toDoubleOrNull()
        result = if (heightM != null && weight != null && heightM > 0) {
            weight / (heightM * heightM)
        } else null
    }
    // ...
}
\`\`\`

\`result\` is typed \`Double?\` — \`null\` means "no valid result yet," which the UI below reads directly instead of needing a separate \`isValid\` flag.

### The form

\`\`\`kotlin
Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
    TextField(
        value = heightText, onValueChange = { heightText = it },
        label = { Text("Height (cm)") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
    )
    TextField(
        value = weightText, onValueChange = { weightText = it },
        label = { Text("Weight (kg)") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
    )
    Button(onClick = { calculate() }) { Text("Calculate") }

    result?.let { bmi ->
        val category = when {
            bmi < 18.5 -> "Underweight"
            bmi < 25.0 -> "Normal"
            bmi < 30.0 -> "Overweight"
            else -> "Obese"
        }
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("BMI: ${'$'}{"%.1f".format(bmi)}", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(category, color = Color.Gray)
            }
        }
    }
}
\`\`\`

\`result?.let { bmi -> ... }\` (Phase 1's null safety) is doing real work here: the whole result \`Card\` only exists in the composition when \`result\` isn't null — no separate \`if (result != null)\` check, no \`!!\`, and \`bmi\` inside the block is smart-cast to a non-null \`Double\`.

\`when\` with boundary conditions (\`bmi < 18.5\`, \`bmi < 25.0\`...) reuses Phase 1's control-flow lesson to turn a number into a category label.

### What this exercises

Two numeric \`TextField\`s, nullable state modeling "no result yet" instead of a sentinel value, and \`Card\` for the result — a small form that only shows output once its input is actually valid.`,
    },
    {
      name: "Build: Weather UI",
      minutes: 12,
      intro: "A layout-focused screen built from mock data — where a ViewModel would plug in later.",
      content: `### The spec

A weather screen: a current-conditions card up top, and a horizontally-scrolling row of hourly forecasts below — built entirely from **mock data**, since real network calls come later in this course.

### The mock data model

\`\`\`kotlin
data class HourlyForecast(val hour: String, val tempC: Int, val icon: ImageVector)

data class WeatherData(
    val city: String,
    val currentTempC: Int,
    val condition: String,
    val hourly: List<HourlyForecast>
)

val mockWeather = WeatherData(
    city = "Bengaluru",
    currentTempC = 27,
    condition = "Partly Cloudy",
    hourly = listOf(
        HourlyForecast("Now", 27, Icons.Filled.WbSunny),
        HourlyForecast("1PM", 28, Icons.Filled.WbSunny),
        HourlyForecast("2PM", 26, Icons.Filled.Cloud),
        HourlyForecast("3PM", 24, Icons.Filled.Umbrella),
    )
)
\`\`\`

Modeling the screen's data as plain Kotlin classes *before* writing any UI is a habit worth keeping — it forces you to decide what the screen actually needs to display, independent of where that data eventually comes from.

### The screen shell

\`\`\`kotlin
@Composable
fun WeatherScreen(weather: WeatherData) {
    Scaffold(topBar = { TopAppBar(title = { Text(weather.city) }) }) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxWidth()) {
            CurrentConditionsCard(weather)
            Spacer(Modifier.height(16.dp))
            HourlyForecastRow(weather.hourly)
        }
    }
}
\`\`\`

\`Scaffold\` (module 12) gives the screen its app bar; the body is a \`Column\` stacking a summary card above a scrolling forecast strip — the same "big block, then a lazy row of smaller items" shape from the practice section's Todo/Expense screens, just with different content.

### The current-conditions card

\`\`\`kotlin
@Composable
fun CurrentConditionsCard(weather: WeatherData) {
    Card(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
        Column(
            modifier = Modifier.padding(24.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("${'$'}{weather.currentTempC}°C", fontSize = 48.sp, fontWeight = FontWeight.Bold)
            Text(weather.condition, color = Color.Gray)
        }
    }
}
\`\`\`

### The hourly forecast strip

\`\`\`kotlin
@Composable
fun HourlyForecastRow(hours: List<HourlyForecast>) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(hours, key = { it.hour }) { hour ->
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(hour.hour, fontSize = 12.sp, color = Color.Gray)
                Icon(hour.icon, contentDescription = null, modifier = Modifier.padding(vertical = 4.dp))
                Text("${'$'}{hour.tempC}°")
            }
        }
    }
}
\`\`\`

### What this exercises, and what's next

Every composable here receives its data as a plain parameter — nothing reaches out to fetch anything itself. That's deliberate: swap \`mockWeather\` for data coming out of a **ViewModel** exposing a **StateFlow**, and none of these composables change at all. Phase 4 is exactly that swap.`,
    },
  ],
}
