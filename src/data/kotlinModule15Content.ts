import type { Module } from "../types"

export const kotlinModule15: Module = {
  id: 15,
  title: "Jetpack Architecture Libraries",
  status: "upcoming",
  lessons: [
    {
      name: "LiveData",
      minutes: 8,
      intro: "The original lifecycle-aware observable holder — still common in existing codebases.",
      content: `### What LiveData is

\`\`\`kotlin
class TaskListViewModel : ViewModel() {
    private val _tasks = MutableLiveData<List<Task>>(emptyList())
    val tasks: LiveData<List<Task>> = _tasks

    fun load() {
        _tasks.value = repository.getAllTasks()
    }
}
\`\`\`

\`LiveData\` is an observable data holder, similar in spirit to Compose's \`MutableState\` (module 11) — it wraps a value and notifies observers when it changes. It predates Compose by several years and is still common in older or mixed View/Compose codebases.

### Exposing it as read-only

Notice the pattern: a private \`MutableLiveData\` the ViewModel can update, and a public \`LiveData\` (no "Mutable") that only exposes reading and observing. This mirrors the \`private set\` pattern from module 14 — the View can watch the data but never assign to it directly.

### Observing from a View-based Activity

\`\`\`kotlin
viewModel.tasks.observe(this) { taskList ->
    adapter.submitList(taskList)
}
\`\`\`

\`observe(this, ...)\` ties the subscription to the Activity's own lifecycle — \`this\` here is a \`LifecycleOwner\`. LiveData automatically stops delivering updates when the Activity is stopped, and never delivers to a destroyed one, which is what "lifecycle-aware" means and why it was reached for so heavily before Compose existed.

### Using it from Compose

\`\`\`kotlin
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val tasks by viewModel.tasks.observeAsState(initial = emptyList())
    LazyColumn {
        items(tasks) { TaskRow(it) }
    }
}
\`\`\`

\`observeAsState()\` bridges a \`LiveData\` into Compose's \`State\` system — necessary when a ViewModel (perhaps shared with legacy View-based screens) still exposes \`LiveData\` rather than the more Compose-native option covered next.

### Where LiveData fits today

New, Compose-only code typically reaches for \`StateFlow\` instead (next lesson) — it's more flexible and integrates more naturally with Kotlin coroutines. LiveData is worth recognizing because it's everywhere in existing production Android code, not because it's what you'd choose to write today.

> **Key idea:** LiveData is an observable holder that respects the Android lifecycle automatically. Know it to read existing codebases; reach for StateFlow when writing new ones.`,
    },
    {
      name: "StateFlow",
      minutes: 10,
      intro: "The modern, Compose-native way to expose observable state from a ViewModel.",
      content: `### What StateFlow is

\`\`\`kotlin
class TaskListViewModel(private val repository: TaskRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(TaskListUiState())
    val uiState: StateFlow<TaskListUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val tasks = repository.getAllTasks()
            _uiState.value = _uiState.value.copy(tasks = tasks, isLoading = false)
        }
    }
}
\`\`\`

\`StateFlow\` is Kotlin's own observable holder, built on **coroutine Flows** — a "hot" stream that always has a current value (\`.value\`), and emits a new one to every collector whenever it changes. The private-mutable / public-read-only split is the exact same pattern as LiveData and \`private set\` before it.

### Collecting it in Compose

\`\`\`kotlin
@Composable
fun TaskListScreen(viewModel: TaskListViewModel) {
    val state by viewModel.uiState.collectAsState()

    if (state.isLoading) CircularProgressIndicator()
    LazyColumn {
        items(state.tasks) { TaskRow(it) }
    }
}
\`\`\`

\`collectAsState()\` is StateFlow's version of \`observeAsState()\` — it bridges the Flow into Compose's \`State\` system, and the composable automatically recomposes whenever a new value is emitted.

### Why StateFlow over LiveData for new code

- Built on coroutines — composes naturally with \`suspend\` functions, \`viewModelScope.launch\`, and Flow operators (\`map\`, \`combine\`, \`debounce\`...)
- Usable outside Android entirely (LiveData is an Android-only type; StateFlow is plain Kotlin)
- \`collectAsState()\` reads just as cleanly as \`observeAsState()\` did

### Always has a current value

\`\`\`kotlin
val current = _uiState.value   // synchronous read, always available — never null, never "not yet emitted"
\`\`\`

This is the defining trait of StateFlow, and the reason it's called *State*Flow specifically — it always represents "the current state of something," never a stream of one-off happenings. That distinction matters for the next lesson.

> **Key idea:** StateFlow is the modern default for exposing ViewModel state to Compose — same shape as LiveData (private mutable, public read-only, collected in the View), built on coroutines instead of Android's lifecycle system directly.`,
    },
    {
      name: "SharedFlow",
      minutes: 9,
      intro: "For one-off events, where StateFlow's 'always has a current value' behavior gets in the way.",
      content: `### Why StateFlow is the wrong tool for events

\`\`\`kotlin
// Awkward: modeling a one-time event as state
private val _showError = MutableStateFlow<String?>(null)
val showError: StateFlow<String?> = _showError.asStateFlow()

fun onSaveFailed() {
    _showError.value = "Save failed"
    // ...now what? If you don't manually reset it to null, re-collecting
    // (e.g. after rotation) re-shows the same error again.
}
\`\`\`

StateFlow always has a **current value** that any new collector immediately receives — great for "what's the state right now," actively wrong for "something just happened, tell whoever's listening exactly once." A screen that starts collecting after the event already fired would see stale state and misfire.

### SharedFlow: a stream of events, not a snapshot of state

\`\`\`kotlin
class TaskListViewModel : ViewModel() {
    private val _events = MutableSharedFlow<String>()
    val events: SharedFlow<String> = _events.asSharedFlow()

    fun onSaveFailed() {
        viewModelScope.launch {
            _events.emit("Save failed — check your connection")
        }
    }
}
\`\`\`

\`SharedFlow\` has no \`.value\` and no built-in current state — by default, a new collector only sees events emitted *after* it started collecting. That's exactly the semantics a one-off notification needs.

### Collecting it in Compose

\`\`\`kotlin
@Composable
fun TaskListScreen(viewModel: TaskListViewModel, snackbarHostState: SnackbarHostState) {
    LaunchedEffect(Unit) {
        viewModel.events.collect { message ->
            snackbarHostState.showSnackbar(message)
        }
    }
    // ... rest of the screen
}
\`\`\`

\`LaunchedEffect\` runs a coroutine tied to this composable's lifetime — here, continuously collecting events and showing each one as a snackbar exactly once, with no lingering "state" left over to accidentally re-show.

### StateFlow vs SharedFlow — the deciding question

| | StateFlow | SharedFlow |
|---|---|---|
| Has a "current value" | Yes, always | No, by default |
| New collector sees | The latest value immediately | Only future emissions |
| Use for | The list of tasks, loading flag, form field values | "Show this snackbar," "navigate now," "task deleted" |

Ask: *"If a screen started observing this a moment late, should it see what already happened?"* Yes → StateFlow. No → SharedFlow.

> **Key idea:** StateFlow answers "what is the state right now"; SharedFlow answers "something just happened." Modeling a one-off event as StateFlow is the most common Flow mistake in real Android code.`,
    },
    {
      name: "Lifecycle",
      minutes: 9,
      intro: "The Android component that everything lifecycle-aware — LiveData, coroutines, and more — is built on top of.",
      content: `### Where "lifecycle-aware" comes from

Every \`LifecycleOwner\` (an Activity, a Fragment) exposes a \`Lifecycle\` object tracking its current state — this is the exact mechanism \`LiveData.observe(this, ...)\` from earlier in this module relies on to know when to stop delivering updates.

### The Lifecycle.State values

\`\`\`text
DESTROYED → INITIALIZED → CREATED → STARTED → RESUMED
\`\`\`

These map directly to the Activity callback sequence from Phase 2 (\`onCreate\`, \`onStart\`, \`onResume\`...) — \`Lifecycle\` is just that same sequence, represented as an observable state instead of a series of method overrides.

### Observing lifecycle events directly

\`\`\`kotlin
class AnalyticsTracker : DefaultLifecycleObserver {
    override fun onStart(owner: LifecycleOwner) {
        logScreenView()
    }
    override fun onStop(owner: LifecycleOwner) {
        flushPendingEvents()
    }
}

// registering it
lifecycle.addObserver(AnalyticsTracker())
\`\`\`

Instead of overriding \`onStart\`/\`onStop\` inside every Activity that needs this behavior, the logic lives in one reusable observer class that any \`LifecycleOwner\` can attach.

### Why this matters for coroutines specifically: repeatOnLifecycle

\`\`\`kotlin
class TaskListActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state -> render(state) }
            }
        }
    }
}
\`\`\`

Collecting a Flow runs forever unless something stops it — without lifecycle awareness, an Activity that's backgrounded would keep collecting (and rendering, and wasting battery) invisibly. \`repeatOnLifecycle(STARTED)\` automatically cancels the collection when the Activity drops below \`STARTED\` and restarts it when it comes back — the coroutine equivalent of what \`LiveData.observe\` gave you automatically.

### Compose already handles this for you

Composables built with \`collectAsState()\` (module before) or \`collectAsStateWithLifecycle()\` wire this up internally — you rarely write \`repeatOnLifecycle\` by hand in a Compose screen. It's worth understanding because it's the mechanism underneath, and because you'll still write it directly in non-Compose code.

> **Key idea:** \`Lifecycle\` is the observable state machine behind every "stops updating in the background" behavior in Android — LiveData used it implicitly for years; Compose's \`collectAsStateWithLifecycle\` uses the exact same mechanism today.`,
    },
    {
      name: "SavedStateHandle",
      minutes: 9,
      intro: "Surviving process death, not just rotation.",
      content: `### A gap ViewModel doesn't cover

Module 14 established that \`ViewModel\` survives configuration changes (rotation). It does **not** survive **process death** — when the OS kills your app's entire process to reclaim memory while it's in the background (e.g. the user switched to several other heavy apps). On return, Android recreates the Activity and a fresh ViewModel — any in-memory state, including everything in a ViewModel, is gone.

### SavedStateHandle: a small bundle that does survive

\`\`\`kotlin
class TaskDetailViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val repository: TaskRepository
) : ViewModel() {

    var draftTitle: String
        get() = savedStateHandle["draftTitle"] ?: ""
        set(value) { savedStateHandle["draftTitle"] = value }
}
\`\`\`

\`SavedStateHandle\` is a key-value store, automatically provided to any ViewModel that declares it as a constructor parameter, whose contents are saved into the same instance-state mechanism the OS already uses to restore your Activity — meaning it survives process death, not just rotation.

### Reading a navigation argument

\`\`\`kotlin
class TaskDetailViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val taskId: Int = savedStateHandle["taskId"] ?: -1
    // fetch the task using taskId in init { }
}
\`\`\`

Navigation Compose (Phase 3) automatically forwards route arguments into a screen's \`SavedStateHandle\`, so a ViewModel can read \`taskId\` without the Composable needing to pass it through manually — one more reason \`SavedStateHandle\` shows up constantly in real apps, beyond just surviving process death.

### What belongs here vs a full StateFlow

\`\`\`kotlin
// Small, worth surviving process death: put it in SavedStateHandle
var searchQuery: String
    get() = savedStateHandle["query"] ?: ""
    set(value) { savedStateHandle["query"] = value }

// Large or re-fetchable: keep as a regular StateFlow — re-fetch on restart instead
private val _searchResults = MutableStateFlow<List<Task>>(emptyList())
\`\`\`

\`SavedStateHandle\` is meant for small, primitive-ish values (a search query, a scroll position, a selected tab) — not for caching the actual list of search results, which is cheap enough to re-fetch and often stale by the time the process restarts anyway.

### The full survival picture

| Survives... | \`remember\` | \`ViewModel\` state | \`SavedStateHandle\` |
|---|---|---|---|
| Recomposition | Yes | Yes | Yes |
| Configuration change (rotation) | No | Yes | Yes |
| Process death | No | No | Yes |

> **Key idea:** \`SavedStateHandle\` is for the small slice of state genuinely worth surviving process death — everything else is fine living in a plain ViewModel property, and most visual-only state is fine in \`remember\`.`,
    },
  ],
}
