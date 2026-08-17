import type { Module } from "../types"

export const kotlinModule14: Module = {
  id: 14,
  title: "MVVM & Dependency Injection",
  status: "upcoming",
  lessons: [
    {
      name: "MVVM",
      minutes: 10,
      intro: "The architecture pattern that separates what's on screen from how it's computed.",
      content: `### The problem it solves

Cram data-fetching, business logic, and UI code into the same composable and you get something that's hard to test (you can't unit-test a screen), hard to reuse, and hard to reason about as it grows. **MVVM** — Model, View, ViewModel — is the standard structure Android apps use to keep those concerns separate.

### The three pieces

| Layer | Responsibility |
|-------|----------------|
| **Model** | The data and business logic — plain Kotlin classes, repositories, data sources |
| **View** | What's on screen — in Compose, your \`@Composable\` functions. Displays state, forwards user actions. |
| **ViewModel** | Sits between them — holds UI state, talks to the Model, exposes state the View observes |

### The rule that makes it work: one-way visibility

\`\`\`kotlin
// ViewModel knows nothing about Compose, Activities, or any specific screen
class TaskListViewModel(private val repository: TaskRepository) {
    // exposes state; has zero imports from androidx.compose
}

// View knows about the ViewModel, and only reads its exposed state
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val tasks = viewModel.tasks   // View → ViewModel: allowed
    // viewModel never references TaskListScreen back
}
\`\`\`

The View depends on the ViewModel; the ViewModel **never** depends on the View. That's what makes a ViewModel testable without touching UI at all — you can construct one in a plain unit test and assert on its state directly.

### A minimal example

\`\`\`kotlin
data class Task(val id: Int, val title: String, val done: Boolean)

class TaskListViewModel(private val repository: TaskRepository) {
    var tasks by mutableStateOf<List<Task>>(emptyList())
        private set

    fun load() {
        tasks = repository.getAllTasks()
    }

    fun toggle(id: Int) {
        tasks = tasks.map { if (it.id == id) it.copy(done = !it.done) else it }
    }
}
\`\`\`

\`private set\` lets the View read \`tasks\` but only the ViewModel itself can reassign it — the same "single source of truth, mutated in one place" discipline from Phase 3, now enforced across a layer boundary instead of within one composable.

### Where this is headed

This lesson describes the *shape* of MVVM using plain state. The next three lessons fill in the real pieces: **Repository** (what \`TaskRepository\` actually is), **ViewModel** (the real Android class, not a plain Kotlin one), and how it survives configuration changes that would otherwise wipe \`remember\`ed state (Phase 3).

> **Key idea:** MVVM's entire value is a one-way dependency: View → ViewModel → Model. The moment a ViewModel imports something UI-specific, the pattern has broken down.`,
    },
    {
      name: "Repository Pattern",
      minutes: 9,
      intro: "One class standing between your ViewModel and wherever data actually lives.",
      content: `### The problem it solves

A ViewModel that calls a network API directly, and separately queries a local database directly, has two different data-fetching mechanisms tangled into its logic — and no clean way to decide "use the cache if the network is down" or to swap one data source for a fake one in tests.

### The pattern

\`\`\`kotlin
interface TaskRepository {
    suspend fun getAllTasks(): List<Task>
    suspend fun addTask(title: String)
}
\`\`\`

A **Repository** is a single class (or interface) the ViewModel talks to, which internally decides where the data actually comes from — network, local database, in-memory cache, or some combination.

### A real implementation, combining sources

\`\`\`kotlin
class DefaultTaskRepository(
    private val api: TaskApiService,
    private val dao: TaskDao
) : TaskRepository {

    override suspend fun getAllTasks(): List<Task> {
        return try {
            val fresh = api.fetchTasks()
            dao.saveAll(fresh)   // cache it locally
            fresh
        } catch (e: IOException) {
            dao.getAll()        // network failed — fall back to the local cache
        }
    }

    override suspend fun addTask(title: String) {
        api.createTask(title)
        dao.insert(Task(title = title))
    }
}
\`\`\`

The ViewModel calling \`repository.getAllTasks()\` has no idea whether that data came from the network or a local cache — and doesn't need to. That decision lives in exactly one place.

### Why an interface, not just a class

\`\`\`kotlin
class FakeTaskRepository : TaskRepository {
    private val tasks = mutableListOf<Task>()
    override suspend fun getAllTasks() = tasks.toList()
    override suspend fun addTask(title: String) { tasks.add(Task(title = title)) }
}
\`\`\`

In a unit test, construct a \`TaskListViewModel(FakeTaskRepository())\` — no real network, no real database, no flakiness, and the test runs instantly. This substitutability is the entire payoff of coding against an interface rather than a concrete class, and it's the setup the next lesson's dependency injection relies on.

> **Key idea:** A ViewModel should ask a Repository "give me the tasks" and never know or care whether that meant a network call, a database query, or both. The Repository is where that decision — and the swap-in-a-fake-for-testing trick — lives.`,
    },
    {
      name: "Dependency Injection",
      minutes: 10,
      intro: "Passing dependencies in from outside, instead of constructing them internally.",
      content: `### The problem it solves

\`\`\`kotlin
class TaskListViewModel {
    private val repository = DefaultTaskRepository(RealApi(), RealDatabase())
    // ...
}
\`\`\`

This ViewModel **constructs its own repository**, hardcoding exactly which implementation it uses. Want to substitute \`FakeTaskRepository\` in a test? You can't, without editing this class — the dependency is baked in.

### Dependency injection: pass it in instead

\`\`\`kotlin
class TaskListViewModel(private val repository: TaskRepository) {
    // never constructs a repository itself — receives one
}

// Production
val viewModel = TaskListViewModel(DefaultTaskRepository(RealApi(), RealDatabase()))

// Test
val testViewModel = TaskListViewModel(FakeTaskRepository())
\`\`\`

**Dependency injection (DI)** just means: a class declares what it needs as constructor parameters, and something else decides what concrete implementation to hand it. The class itself never says \`new\` (or in Kotlin, calls a constructor directly) on its own dependencies.

### Why this is worth the extra indirection

- **Testability** — swap real implementations for fakes without touching the class under test
- **Swappability** — change \`DefaultTaskRepository\` to \`OfflineFirstTaskRepository\` in one place (wherever the ViewModel is constructed), not everywhere it's used
- **Clear dependencies** — a constructor signature is an honest list of everything a class needs to function

### Manual DI vs a framework

Everything above is **manual DI** — you're just passing constructor arguments. It works fine for small apps. Larger codebases typically adopt a DI framework like **Hilt** (built on Dagger) that generates this wiring for you:

\`\`\`kotlin
@HiltViewModel
class TaskListViewModel @Inject constructor(
    private val repository: TaskRepository
) : ViewModel()
\`\`\`

\`@Inject\` marks the constructor Hilt should use to build this class automatically, resolving \`TaskRepository\` from wherever it was declared (typically an \`@Module\` telling Hilt "when someone asks for a \`TaskRepository\`, give them a \`DefaultTaskRepository\`"). The mechanics of Hilt itself are a deeper topic — the concept to take away here is that a DI framework automates exactly the manual constructor-passing shown above, at scale.

> **Key idea:** DI isn't a library — it's the discipline of a class receiving what it needs instead of constructing it. Frameworks like Hilt just automate the wiring once manual passing gets tedious.`,
    },
    {
      name: "State Management",
      minutes: 9,
      intro: "Unidirectional data flow — the discipline that keeps state predictable as an app grows.",
      content: `### UI state vs event

Two different things flow through an MVVM screen, and confusing them causes real bugs:

- **UI state** — a snapshot of what should currently be on screen (a list of tasks, a loading flag, an error message). It has a *current value* at all times.
- **Events** — one-off things that happened (a task was deleted, navigate to a detail screen, show a snackbar). They don't have a "current value" — they happened once and are gone.

### Modeling UI state as one object

\`\`\`kotlin
data class TaskListUiState(
    val tasks: List<Task> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
\`\`\`

Instead of three separate \`remember\`ed variables (loose, easy to get out of sync — the same problem module 13's expense tracker sidestepped by deriving state), bundle everything the screen needs into **one** state object. There's exactly one thing to read to know what the screen should show.

### Unidirectional data flow (UDF)

\`\`\`text
User action → ViewModel function → new UiState → View re-renders
     ↑                                                  │
     └──────────────── (nothing flows back up) ─────────┘
\`\`\`

State flows down from ViewModel to View; **events** flow up from View to ViewModel as function calls, never as direct state mutation from the View's side. The View never reaches into the ViewModel's state and changes it directly — it calls a function and waits for a new state to arrive.

\`\`\`kotlin
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val state = viewModel.uiState   // read-only from here

    if (state.isLoading) CircularProgressIndicator()

    LazyColumn {
        items(state.tasks) { task ->
            TaskRow(task, onToggle = { viewModel.toggle(task.id) })   // event flows up
        }
    }
}
\`\`\`

\`onToggle\` doesn't mutate \`state\` — it calls \`viewModel.toggle(...)\`, which the ViewModel handles internally and then produces a *new* \`uiState\` for the View to render.

### Why this discipline pays off

With two-way binding (View and ViewModel both freely mutating shared state), tracking down "what changed this value" means searching the entire codebase. With strict UDF, exactly one place changes state — the ViewModel — so every state change has exactly one possible origin.

> **Key idea:** Bundle related state into one object, and enforce a single direction: state flows down, events flow up. It's more ceremony for a toy app, and the reason larger apps stay debuggable.`,
    },
    {
      name: "ViewModel",
      minutes: 11,
      intro: "The real androidx.lifecycle.ViewModel class, and the configuration-change problem it solves.",
      content: `### The gap this fills

Phase 3's \`remember { mutableStateOf(...) }\` loses its value on a **configuration change** — screen rotation destroys and recreates the whole Activity by default, and anything \`remember\`ed goes with it. \`ViewModel\` is Android's answer: state that survives exactly that.

### Extending ViewModel

\`\`\`kotlin
class TaskListViewModel(private val repository: TaskRepository) : ViewModel() {
    var uiState by mutableStateOf(TaskListUiState())
        private set

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true)
            val tasks = repository.getAllTasks()
            uiState = uiState.copy(tasks = tasks, isLoading = false)
        }
    }

    fun toggle(id: Int) {
        uiState = uiState.copy(
            tasks = uiState.tasks.map { if (it.id == id) it.copy(done = !it.done) else it }
        )
    }
}
\`\`\`

\`viewModelScope\` is a coroutine scope tied to this ViewModel's own lifetime — launching work in it means that work is automatically cancelled when the ViewModel itself is cleared, so you never leak an in-flight network call after the user has navigated away.

### Obtaining one in a composable

\`\`\`kotlin
@Composable
fun TaskListScreen(viewModel: TaskListViewModel = viewModel()) {
    val state = viewModel.uiState
    // ...
}
\`\`\`

The \`viewModel()\` composable function (from \`androidx.lifecycle.viewmodel.compose\`) fetches an existing instance tied to the current screen if one exists, or creates one if not — and critically, **the same instance survives recomposition and configuration changes**, unlike anything wrapped in plain \`remember\`.

### Why it survives rotation when remember doesn't

A \`ViewModel\` is deliberately scoped to something that outlives a single Activity instance — internally, it's retained across the Activity being destroyed and recreated, and only actually cleared when the screen is truly finished (the user navigates away for good, not just rotates the device). This is the single concrete reason MVVM apps put state in a ViewModel instead of a composable's \`remember\`ed state.

### remember vs ViewModel — when to use which

| | \`remember\` | \`ViewModel\` |
|---|---|---|
| Survives recomposition | Yes | Yes |
| Survives configuration change (rotation) | No | Yes |
| Appropriate for | Purely visual, transient state (is a dropdown expanded?) | Actual screen data (the task list, form data worth keeping) |

> **Key idea:** Reach for \`ViewModel\` the moment state represents real data the user would be annoyed to lose on rotation — everything else can stay as simple \`remember\`ed Compose state.`,
    },
  ],
}
