import type { Module } from "../types"

export const kotlinModule8: Module = {
  id: 8,
  title: "Activities, Intents & Fragments",
  status: "upcoming",
  lessons: [
    {
      name: "Activities",
      minutes: 10,
      intro: "The building block of a screen in Android.",
      content: `### What an Activity is

An **Activity** represents a single, focused screen with a UI — think "one screen the user looks at and interacts with." A simple app might have just one; a bigger app has many, one per screen.

### A minimal Activity

\`\`\`kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
\`\`\`

- It extends \`AppCompatActivity\`, the standard base class
- \`onCreate\` runs once when the Activity is first created — this is where setup happens
- \`setContentView(R.layout.activity_main)\` tells it which XML layout to draw

### Finding views

\`\`\`kotlin
val button = findViewById<Button>(R.id.submitButton)
button.setOnClickListener {
    Toast.makeText(this, "Clicked!", Toast.LENGTH_SHORT).show()
}
\`\`\`

\`findViewById\` looks up a view by the \`id\` you gave it in the XML layout, using the generated \`R\` class.

### Every Activity must be declared

An Activity class alone does nothing — it has to be listed in \`AndroidManifest.xml\` or the OS won't know it exists:

\`\`\`xml
<activity android:name=".MainActivity" />
\`\`\`

### Multiple activities, one app

\`\`\`kotlin
startActivity(Intent(this, DetailActivity::class.java))
\`\`\`

Navigating between screens means starting a new Activity — covered next, in Intents.

> **Key idea:** An Activity is one screen. \`onCreate\` + \`setContentView\` is the pattern you'll write at the top of almost every one.`,
    },
    {
      name: "Intents",
      minutes: 10,
      intro: "The messages Android uses to start activities and talk to other apps.",
      content: `### What an Intent is

An **Intent** is an object describing an action to perform — most commonly, "start this Activity." There are two kinds: explicit and implicit.

### Explicit intents — starting your own screen

\`\`\`kotlin
val intent = Intent(this, DetailActivity::class.java)
startActivity(intent)
\`\`\`

You name the exact class to launch. This is how you navigate between screens inside your own app.

### Passing data with an intent

\`\`\`kotlin
// Sending
val intent = Intent(this, DetailActivity::class.java)
intent.putExtra("USER_ID", 42)
startActivity(intent)

// Receiving, in DetailActivity
val userId = intent.getIntExtra("USER_ID", -1)
\`\`\`

Extras are key-value pairs bundled onto the Intent — Android's way of passing arguments between screens.

### Implicit intents — asking the system for help

\`\`\`kotlin
val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://developer.android.com"))
startActivity(intent)
\`\`\`

You don't name a class — you describe an **action** (\`ACTION_VIEW\`) and let Android find an app that can handle it (a browser, in this case). This is how "share," "open in maps," and "dial a number" work.

### The action + data pattern

| Action | Data | Result |
|--------|------|--------|
| \`ACTION_VIEW\` | a URL | Opens in a browser |
| \`ACTION_DIAL\` | \`tel:555-1234\` | Opens the dialer |
| \`ACTION_SEND\` | text + type | Opens the share sheet |

> **Key idea:** Explicit intents name a class (navigation within your app); implicit intents describe an action and let the OS pick the handler (talking to other apps).`,
    },
    {
      name: "Fragments",
      minutes: 11,
      intro: "Reusable pieces of UI that live inside an Activity.",
      content: `### What a Fragment is

A **Fragment** is a modular, reusable chunk of UI and behavior that must live inside an Activity — it can't exist on its own. Think of an Activity as a container and Fragments as swappable panels inside it.

### Why use them

- Reuse the same UI piece across multiple screens
- Build adaptive layouts — e.g. a list + detail fragment side by side on tablets, stacked on phones
- Break a complex screen into independently manageable pieces

### A minimal Fragment

\`\`\`kotlin
class ProfileFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }
}
\`\`\`

Instead of \`setContentView\`, a Fragment **inflates** its own layout and returns it — the hosting Activity places that view where it belongs.

### Hosting a fragment in an Activity's layout

\`\`\`xml
<FrameLayout
    android:id="@+id/fragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
\`\`\`

\`\`\`kotlin
supportFragmentManager.beginTransaction()
    .replace(R.id.fragmentContainer, ProfileFragment())
    .commit()
\`\`\`

The \`FragmentManager\` swaps fragments in and out of a container view at runtime — this is how tabs and multi-step flows are usually built.

> **Key idea:** A Fragment is UI that lives *inside* an Activity, managed by the FragmentManager — it has its own lifecycle, but always rides on top of a host Activity's.`,
    },
    {
      name: "App Lifecycle",
      minutes: 10,
      intro: "The sequence of callbacks every Activity goes through, from creation to destruction.",
      content: `### The lifecycle callbacks

Every Activity moves through a predictable sequence of method calls as the user interacts with it, backgrounds it, or the system reclaims memory:

\`\`\`text
onCreate → onStart → onResume → [running] → onPause → onStop → onDestroy
\`\`\`

### What each one means

| Method | Called when | Typical use |
|--------|-------------|-------------|
| \`onCreate\` | Activity is first created | One-time setup: \`setContentView\`, find views |
| \`onStart\` | Becoming visible | Register listeners |
| \`onResume\` | Gaining focus, interactive | Start animations, camera preview |
| \`onPause\` | Losing focus (e.g. dialog on top) | Save lightweight state, pause video |
| \`onStop\` | No longer visible | Release heavier resources |
| \`onDestroy\` | Being finished or recreated | Final cleanup |

### Why this matters in practice

\`\`\`kotlin
override fun onPause() {
    super.onPause()
    videoPlayer.pause()   // don't keep playing audio in the background
}

override fun onResume() {
    super.onResume()
    videoPlayer.resume()
}
\`\`\`

If you acquire a resource (camera, sensor, media player) in \`onResume\`, release it in \`onPause\` — that pairing keeps your app from draining battery or crashing when it's not visible.

### Rotation recreates the Activity

By default, rotating the screen destroys and recreates the Activity (\`onDestroy\` → \`onCreate\` again). This is why you shouldn't rely on plain variables to survive rotation — \`onSaveInstanceState\`/\`savedInstanceState\` exists specifically to carry small bits of UI state across that recreation.

> **Key idea:** \`onCreate\`/\`onDestroy\` bookend the Activity's whole life; \`onResume\`/\`onPause\` bookend every moment it's actually on screen. Pair your setup and teardown accordingly.`,
    },
    {
      name: "Resources",
      minutes: 8,
      intro: "Everything that isn't code — strings, images, layouts — and how Android organizes it.",
      content: `### What counts as a "resource"

Anything your app uses that isn't Kotlin code lives in \`res/\` as a **resource**: text, colors, images, layout definitions, even raw files. Externalizing them (instead of hardcoding in Kotlin) is what makes localization, theming, and different screen densities possible.

### The res/ subfolders

| Folder | Holds |
|--------|-------|
| \`res/layout/\` | XML screen/UI definitions |
| \`res/values/\` | strings.xml, colors.xml, dimens.xml, themes.xml |
| \`res/drawable/\` | Images and vector graphics |
| \`res/mipmap/\` | App launcher icons, at multiple resolutions |

### Accessing resources from Kotlin

Every resource gets a generated numeric ID in the auto-generated \`R\` class:

\`\`\`kotlin
val title = getString(R.string.app_name)
val color = ContextCompat.getColor(this, R.color.primary)
val icon = ContextCompat.getDrawable(this, R.drawable.ic_logo)
\`\`\`

### Accessing resources from XML

\`\`\`xml
<TextView
    android:text="@string/app_name"
    android:textColor="@color/primary" />
\`\`\`

The \`@type/name\` syntax is how one resource file references another.

### Why bother externalizing

- **Localization** — swap \`res/values-fr/strings.xml\` in automatically for French devices, no code change
- **Density** — provide multiple drawable resolutions (\`drawable-hdpi\`, \`drawable-xhdpi\`...) and Android picks the right one
- **Consistency** — one place to change a color or spacing value across the whole app

> **Key idea:** If it's not Kotlin logic, it probably belongs in \`res/\` — referenced by name through the generated \`R\` class, never hardcoded inline.`,
    },
  ],
}
