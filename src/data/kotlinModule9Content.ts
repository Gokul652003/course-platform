import type { Module } from "../types"

export const kotlinModule9: Module = {
  id: 9,
  title: "XML Layouts & Styling",
  status: "upcoming",
  lessons: [
    {
      name: "XML Layouts",
      minutes: 12,
      intro: "The markup language that defines what's on screen.",
      content: `### What a layout file is

A layout is an XML file describing a tree of **Views** (widgets like TextView, Button) and **ViewGroups** (containers like LinearLayout) — this tree is what an Activity or Fragment inflates onto the screen.

### A simple layout

\`\`\`xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Welcome" />

    <Button
        android:id="@+id/submitButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Submit" />

</LinearLayout>
\`\`\`

### Reading the common attributes

| Attribute | Meaning |
|-----------|---------|
| \`layout_width\` / \`layout_height\` | \`match_parent\` (fill), \`wrap_content\` (fit content), or a fixed size |
| \`android:id="@+id/name"\` | Gives the view an ID so Kotlin can find it |
| \`android:orientation\` | For LinearLayout: stack children vertically or horizontally |
| \`android:padding\` | Space inside the view's own edges |

### LinearLayout vs ConstraintLayout

- **LinearLayout** — stacks children in a single row or column. Simple, predictable, but nests awkwardly for complex screens.
- **ConstraintLayout** — positions each view by constraining it relative to other views or the parent's edges. Flatter hierarchy, better for anything beyond a simple list of stacked elements.

\`\`\`xml
<androidx.constraintlayout.widget.ConstraintLayout ...>
    <Button
        android:id="@+id/btn"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>
\`\`\`

> **Key idea:** A layout XML file is a tree of Views inside ViewGroups. \`match_parent\`/\`wrap_content\` control sizing; an \`id\` is what lets your Kotlin code reach in and grab a specific view.`,
    },
    {
      name: "Strings",
      minutes: 7,
      intro: "Centralizing your app's text in strings.xml.",
      content: `### Why not just write text inline

\`\`\`xml
<!-- avoid -->
<TextView android:text="Welcome back!" />
\`\`\`

Hardcoding text works, but breaks the moment you need a second language, want to reuse the same phrase twice, or want to change copy without touching layout files. Android Studio's lint even warns you about it.

### strings.xml

\`\`\`xml
<!-- res/values/strings.xml -->
<resources>
    <string name="app_name">My App</string>
    <string name="welcome_message">Welcome back!</string>
</resources>
\`\`\`

### Referencing it

From XML:

\`\`\`xml
<TextView android:text="@string/welcome_message" />
\`\`\`

From Kotlin:

\`\`\`kotlin
val message = getString(R.string.welcome_message)
\`\`\`

### Strings with placeholders

\`\`\`xml
<string name="greeting">Hello, %1$s! You have %2$d new messages.</string>
\`\`\`

\`\`\`kotlin
val text = getString(R.string.greeting, userName, messageCount)
\`\`\`

\`%1$s\` and \`%2$d\` are positional format specifiers — \`s\` for string, \`d\` for integer — filled in order by the arguments you pass.

### Localization, for free

Add \`res/values-fr/strings.xml\` with the same \`name\` attributes translated, and a device set to French automatically picks that file up — no code changes required.

> **Key idea:** Every user-facing piece of text belongs in \`strings.xml\`, referenced by name — never hardcoded in a layout or in Kotlin.`,
    },
    {
      name: "Colors",
      minutes: 7,
      intro: "Naming and reusing colors instead of scattering hex codes everywhere.",
      content: `### colors.xml

\`\`\`xml
<!-- res/values/colors.xml -->
<resources>
    <color name="primary">#6200EE</color>
    <color name="primary_dark">#3700B3</color>
    <color name="text_light">#FFFFFF</color>
</resources>
\`\`\`

Each entry gives a hex color a reusable name.

### Using a color from XML

\`\`\`xml
<TextView
    android:textColor="@color/text_light"
    android:background="@color/primary" />
\`\`\`

### Using a color from Kotlin

\`\`\`kotlin
val color = ContextCompat.getColor(this, R.color.primary)
view.setBackgroundColor(color)
\`\`\`

\`ContextCompat.getColor\` resolves the resource ID to an actual color integer, safely across Android versions.

### Why name colors instead of pasting hex everywhere

If your brand color changes, you edit one line in \`colors.xml\` instead of hunting through every layout. It also makes intent clear — \`@color/primary\` says *what* the color is for, not just what it looks like.

### Light and dark variants

\`\`\`xml
<!-- res/values/colors.xml -->
<color name="surface">#FFFFFF</color>

<!-- res/values-night/colors.xml -->
<color name="surface">#121212</color>
\`\`\`

Same name, different value per folder — Android picks the right one automatically based on the device's light/dark setting.

> **Key idea:** Name every color once in \`colors.xml\` and reference it everywhere — that single source of truth is what makes theming and dark mode manageable.`,
    },
    {
      name: "Dimensions",
      minutes: 7,
      intro: "dp and sp — Android's density-independent units for sizing.",
      content: `### The problem plain pixels cause

Screens vary wildly in pixel density. A button that's 100 pixels wide looks tiny on a high-density phone and huge on a low-density one. Android solves this with density-independent units.

### dp — density-independent pixels

Used for **layout sizes**: widths, heights, margins, padding. \`1dp\` renders as roughly the same physical size across devices, regardless of pixel density.

\`\`\`xml
<Button
    android:layout_width="120dp"
    android:layout_height="48dp"
    android:layout_margin="16dp" />
\`\`\`

### sp — scale-independent pixels

Used only for **text size**. It behaves like \`dp\`, but also scales with the user's font-size preference set in system accessibility settings.

\`\`\`xml
<TextView android:textSize="16sp" />
\`\`\`

### dp vs sp — the rule

| Use | Unit |
|-----|------|
| Width, height, margin, padding | \`dp\` |
| Text size | \`sp\` |

Using \`dp\` for text size means it ignores the user's accessibility font-size setting — a real usability problem for low-vision users.

### dimens.xml — naming reusable sizes

\`\`\`xml
<!-- res/values/dimens.xml -->
<resources>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">16dp</dimen>
    <dimen name="text_body">16sp</dimen>
</resources>
\`\`\`

\`\`\`xml
<TextView
    android:padding="@dimen/spacing_medium"
    android:textSize="@dimen/text_body" />
\`\`\`

> **Key idea:** Never size anything in raw pixels. Use \`dp\` for layout, \`sp\` for text — and name your common values in \`dimens.xml\` the same way you named colors.`,
    },
    {
      name: "Themes",
      minutes: 9,
      intro: "The app-wide default style everything else builds on.",
      content: `### Style vs Theme

A **style** is a named bundle of attributes (color, padding, text size...) you can apply to a single view. A **theme** is a style applied to an entire Activity or app — it sets the defaults every view inherits unless overridden.

### A style, applied to one view

\`\`\`xml
<!-- res/values/styles.xml -->
<style name="RoundedButton">
    <item name="android:background">@drawable/rounded_bg</item>
    <item name="android:textColor">@color/text_light</item>
</style>
\`\`\`

\`\`\`xml
<Button style="@style/RoundedButton" android:text="Go" />
\`\`\`

### A theme, applied app-wide

\`\`\`xml
<!-- res/values/themes.xml -->
<style name="Theme.MyApp" parent="Theme.Material3.DayNight">
    <item name="colorPrimary">@color/primary</item>
    <item name="colorOnPrimary">@color/text_light</item>
</style>
\`\`\`

Themes typically **inherit** from a parent — here, Material 3's day/night theme — and override just the pieces that make it yours.

### Wiring the theme into the manifest

\`\`\`xml
<application android:theme="@style/Theme.MyApp">
\`\`\`

Every Activity in the app now defaults to this theme unless a specific \`<activity>\` entry overrides it with its own \`android:theme\`.

### Why inherit instead of starting from scratch

\`Theme.Material3.DayNight\` already defines sensible defaults for hundreds of attributes — button ripple effects, dialog styling, dark mode swapping. You only specify what should differ from the platform's baseline.

> **Key idea:** A style is scoped to one view; a theme is scoped to an Activity or the whole app. Both are "override what you need, inherit the rest" — themes just inherit from a much bigger foundation.`,
    },
  ],
}
