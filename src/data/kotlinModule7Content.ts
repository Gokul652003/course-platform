import type { Module } from "../types"

export const kotlinModule7: Module = {
  id: 7,
  title: "Android Studio & Project Setup",
  status: "upcoming",
  lessons: [
    {
      name: "Android Studio",
      minutes: 9,
      intro: "The official IDE for Android — install it and learn your way around.",
      content: `### What Android Studio is

Android Studio is Google's official IDE for Android development, built on JetBrains' IntelliJ platform. One download gives you:

- A code editor with Kotlin support
- The **Android SDK** (the libraries and tools that let you build for Android)
- An **emulator manager** for testing without a physical phone
- **Gradle** build tooling, wired in automatically

### Installing

Download it from developer.android.com/studio, run the installer, and step through the **Setup Wizard** — it downloads the SDK platform, build tools, and a default emulator image for you.

### Creating your first project

\`\`\`text
File → New → New Project → Empty Views Activity
\`\`\`

You'll be asked for:

| Field | Meaning |
|-------|---------|
| Name | Your app's display name |
| Package name | Unique reverse-domain ID, e.g. \`com.gokul.myapp\` |
| Save location | Where the project folder lives on disk |
| Language | Choose **Kotlin** |
| Minimum SDK | The oldest Android version your app supports |

### The main windows

- **Project pane** (left) — your files, in "Android" view (grouped by type) or "Project" view (raw folders)
- **Editor** (center) — Kotlin and XML files
- **Logcat** (bottom) — live device/emulator output, your \`println\` equivalent on Android
- **Build output** — Gradle sync and compile results

> **Key idea:** Android Studio bundles the SDK, Gradle, and an emulator manager into one tool — you rarely need anything outside it to build an app.`,
    },
    {
      name: "Emulator",
      minutes: 8,
      intro: "Run and test your app on a virtual Android phone.",
      content: `### What an emulator is

An **AVD** (Android Virtual Device) is a full software simulation of an Android phone or tablet, running on your development machine. It lets you test your app without owning the physical device.

### Creating an AVD

\`\`\`text
Tools → Device Manager → Create Device
\`\`\`

You choose two things:

- **Hardware profile** — screen size and resolution (e.g. Pixel 7)
- **System image** — which Android version (API level) it runs

### Running your app on it

1. Select the AVD from the device dropdown in the toolbar
2. Click the green **▶ Run** button
3. Android Studio builds the app, boots the emulator (if not already running), and installs + launches it

### Cold boot vs quick boot

- **Cold boot** — starts fresh, like powering on a real phone (slower)
- **Quick boot** — resumes from a saved snapshot of the last session (much faster, used by default after the first boot)

### When to use a real device instead

Emulators are convenient, but a physical device catches things emulators miss — real touch latency, camera/sensor behavior, and actual performance. Use Developer Options → USB debugging to run on a connected phone the same way.

> **Key idea:** The emulator is a full virtual phone, not a mock — your app runs exactly as it would on real hardware, just slower to boot.`,
    },
    {
      name: "Project Structure",
      minutes: 10,
      intro: "What all those folders and files in a new Android project actually are.",
      content: `### The default layout

\`\`\`text
MyApp/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/gokul/myapp/   ← your Kotlin code
│   │       ├── res/                     ← resources (layouts, strings, images)
│   │       └── AndroidManifest.xml      ← app config & declarations
│   └── build.gradle.kts                 ← module-level build config
├── build.gradle.kts                     ← project-level build config
├── settings.gradle.kts                  ← which modules exist
└── gradle/                              ← the Gradle wrapper
\`\`\`

### The key folders

| Path | Purpose |
|------|---------|
| \`java/\` (or \`kotlin/\`) | Your Kotlin source files, one package per folder |
| \`res/layout/\` | XML files describing screens |
| \`res/values/\` | Strings, colors, dimensions, themes |
| \`res/drawable/\` | Images and vector icons |
| \`AndroidManifest.xml\` | Declares activities, permissions, app metadata |

### "Android" view vs "Project" view

Android Studio's Project pane defaults to **Android view** — a curated, type-grouped layout (\`manifests\`, \`java\`, \`res\`) that hides Gradle boilerplate. Switch to **Project view** from the dropdown at the top of the pane to see the real folder structure on disk — useful when you need to find a file's actual path.

### One project can hold multiple modules

A single project (the top-level folder) can contain several **modules** — \`app\` is the main one, but you might add a \`library\` module for shared code. Each module gets its own \`build.gradle.kts\`.

> **Key idea:** \`app/src/main/\` is where your app lives — \`java/\` for code, \`res/\` for everything else, \`AndroidManifest.xml\` to tie it together.`,
    },
    {
      name: "Gradle",
      minutes: 11,
      intro: "The build system that compiles, packages, and manages dependencies for your app.",
      content: `### What Gradle does

Gradle is the build automation tool Android uses to compile your Kotlin, package resources, resolve dependencies, and produce the final \`.apk\`/\`.aab\` file. Every "Sync Now" you click in Android Studio re-reads your Gradle files and re-resolves the project.

### Three levels of build files

| File | Scope |
|------|-------|
| \`settings.gradle.kts\` | Declares which modules belong to the project |
| \`build.gradle.kts\` (project root) | Settings shared across all modules |
| \`app/build.gradle.kts\` (module) | This module's plugins, SDK versions, dependencies |

### A typical module build file

\`\`\`kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.gokul.myapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.gokul.myapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
}
\`\`\`

### Reading the SDK versions

- **minSdk** — the oldest Android version the app installs on
- **targetSdk** — the version you've tested and designed against
- **compileSdk** — which SDK's APIs are available while compiling

### Adding a dependency

Add a line inside \`dependencies { }\` and click **Sync Now** in the banner that appears — Gradle downloads the library and makes it available to import.

> **Key idea:** Gradle files are the single source of truth for what your app depends on and how it's versioned. If it's not in \`build.gradle.kts\`, it's not part of the build.`,
    },
    {
      name: "Manifest",
      minutes: 9,
      intro: "The file that declares what your app is and what it's allowed to do.",
      content: `### What AndroidManifest.xml is for

Every Android app needs a manifest — it tells the OS what components exist (activities, services...), what permissions the app needs, and basic metadata like the app's icon and name.

### A minimal manifest

\`\`\`xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.MyApp">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>
\`\`\`

### Reading it piece by piece

- \`<uses-permission>\` — declares something the app needs access to (network, camera, location...). Users see these requested at install or runtime.
- \`<application>\` — the app-wide icon, label, and theme
- \`<activity>\` — every screen (Activity) must be declared here to exist
- \`<intent-filter>\` with \`MAIN\` + \`LAUNCHER\` — marks **this** activity as the one that opens when the user taps the app icon

### Only one launcher activity (usually)

Exactly one activity should carry the \`MAIN\`/\`LAUNCHER\` intent-filter — that's your app's entry point. Every other activity is declared but reached by navigating from within the app.

> **Key idea:** If a component or permission isn't in the manifest, Android doesn't know it exists. The manifest is the contract between your app and the OS.`,
    },
  ],
}
