import type { Module } from "../types"

export const htmlModule6: Module = {
  id: 6,
  title: "Forms",
  status: "upcoming",
  lessons: [
    {
      name: "Form Basics & Input Types",
      minutes: 10,
      intro: "The <form> element, and the wide range of specialized <input> types.",
      content: `### The form element

\`\`\`html
<form action="/submit" method="post">
  <input type="text" name="username">
  <button type="submit">Submit</button>
</form>
\`\`\`

- \`action\` — the URL the form data is sent to.
- \`method\` — \`get\` (data appended to the URL, for searches/filters) or \`post\` (data sent in the request body, for anything that changes data — signups, orders, comments).
- Every input needs a \`name\` attribute — that's the key the server receives the value under. An input without \`name\` is not submitted at all.

### Text-like input types

\`\`\`html
<input type="text" name="fullname">
<input type="email" name="email">
<input type="password" name="password">
<input type="tel" name="phone">
<input type="url" name="website">
<input type="search" name="query">
\`\`\`

These all look like a plain text box, but the type matters: \`type="email"\` triggers built-in format validation and, on mobile, shows an @-optimized keyboard. \`type="tel"\` shows a numeric phone keypad. \`type="password"\` masks input. Always pick the specific type — it costs nothing and improves both validation and the on-screen keyboard.

### Numeric and date types

\`\`\`html
<input type="number" name="quantity" min="1" max="10">
<input type="range" name="volume" min="0" max="100">
<input type="date" name="birthday">
<input type="time" name="appointment">
<input type="month" name="expiry">
\`\`\`

These render native pickers (a calendar for \`date\`, a slider for \`range\`) — built into the browser, no JavaScript library required.

### Other common types

\`\`\`html
<input type="checkbox" name="subscribe">
<input type="radio" name="plan" value="basic">
<input type="file" name="upload">
<input type="hidden" name="csrf_token" value="abc123">
<input type="color" name="theme">
\`\`\`

\`type="hidden"\` submits a value with the form without showing any UI — commonly used for tokens or IDs the server needs but the user doesn't edit.

> **Key idea:** \`<input>\` is one element with dozens of behaviors depending on \`type\`. Picking the *specific* type — not just defaulting to \`text\` — gets you free validation, the right mobile keyboard, and native browser UI.`,
    },
    {
      name: "Labels, Placeholders & Validation Attributes",
      minutes: 9,
      intro: "Connecting inputs to labels correctly, and declaring validation rules without JavaScript.",
      content: `### label: not optional

Every input needs a \`<label>\` — connected via a matching \`id\`/\`for\` pair:

\`\`\`html
<label for="email">Email address</label>
<input type="email" id="email" name="email">
\`\`\`

Clicking the label text focuses the input — a real usability win, especially for small checkboxes and radio buttons. Screen readers announce the label whenever the input receives focus. Without it, a screen reader user hears nothing but "edit text" — no idea what to type.

### Wrapping instead of for/id

\`\`\`html
<label>
  Email address
  <input type="email" name="email">
</label>
\`\`\`

Also valid — the association is implicit because the input is nested inside the label. Either pattern works; the \`for\`/\`id\` version is more common because it allows the label and input to be positioned separately in the layout.

### placeholder is not a label

\`\`\`html
<!-- wrong: placeholder as the only guidance -->
<input type="text" name="name" placeholder="Full name">

<!-- correct: label + optional placeholder for extra hint -->
<label for="name">Full name</label>
<input type="text" id="name" name="name" placeholder="e.g. Jane Smith">
\`\`\`

Placeholder text disappears the moment the user starts typing, and has low contrast by design — it fails as the *only* source of context. Always pair it with a real \`<label>\`.

### Built-in validation attributes

\`\`\`html
<input type="text" name="username" required minlength="3" maxlength="20">
<input type="number" name="age" min="18" max="120">
<input type="email" name="email" required>
<input type="text" name="zipcode" pattern="[0-9]{5}">
\`\`\`

- \`required\` — form won't submit until filled in
- \`minlength\` / \`maxlength\` — character bounds for text
- \`min\` / \`max\` — bounds for numbers, dates, ranges
- \`pattern\` — a regular expression the value must match

The browser blocks submission and shows a native error message automatically — no JavaScript needed for basic validation.

> **Key idea:** a label is not decoration — it's the mechanism that makes an input usable by mouse (click to focus) and by screen reader (announced on focus). Validation attributes give you real, working constraints for free.`,
    },
    {
      name: "Select, Textarea, Checkboxes & Radio",
      minutes: 9,
      intro: "Grouped choices and multi-line text — the other core form controls.",
      content: `### select: a dropdown

\`\`\`html
<label for="country">Country</label>
<select id="country" name="country">
  <option value="">Choose a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
  <option value="uk" selected>United Kingdom</option>
</select>
\`\`\`

- \`value\` is what's submitted; the text between the tags is what's displayed.
- \`selected\` marks the default choice.
- Group related options with \`<optgroup>\`:

\`\`\`html
<select name="animal">
  <optgroup label="Pets">
    <option value="dog">Dog</option>
    <option value="cat">Cat</option>
  </optgroup>
  <optgroup label="Farm">
    <option value="cow">Cow</option>
  </optgroup>
</select>
\`\`\`

Add \`multiple\` to allow selecting several options at once (renders as a scrollable list rather than a dropdown).

### textarea: multi-line text

\`\`\`html
<label for="message">Message</label>
<textarea id="message" name="message" rows="5" cols="40"></textarea>
\`\`\`

Unlike \`<input>\`, the default value goes *between* the tags, not in a \`value\` attribute:

\`\`\`html
<textarea name="bio">Write something about yourself...</textarea>
\`\`\`

### checkbox: independent on/off

\`\`\`html
<label><input type="checkbox" name="terms" value="accepted" required> I agree to the terms</label>
\`\`\`

Each checkbox is independent — any combination can be checked. When submitted, only *checked* boxes send their \`value\`; unchecked ones send nothing at all.

### radio: mutually exclusive choice

\`\`\`html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" checked> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
\`\`\`

The key rule: **radio buttons in the same group must share the same \`name\`** — that's what makes them mutually exclusive (selecting one deselects the others in the group). Different \`name\` = different, independent group.

\`<fieldset>\`/\`<legend>\` group related controls with a heading, announced by screen readers as "group: Preferred contact method" — useful for any cluster of related radios or checkboxes.

> **Key idea:** checkboxes are independent (any number checked), radios are exclusive within a shared \`name\` (exactly one checked). Getting the \`name\` wrong on radios is the single most common bug in this pattern.`,
    },
    {
      name: "Buttons & Form Submission",
      minutes: 8,
      intro: "The three kinds of button, and what actually happens when a form is submitted.",
      content: `### Three button types

\`\`\`html
<button type="submit">Submit</button>
<button type="reset">Clear form</button>
<button type="button">Just a button</button>
\`\`\`

- \`type="submit"\` — submits the enclosing form. **This is the default** if you omit \`type\` on a \`<button>\` inside a form — a common source of bugs.
- \`type="reset"\` — clears all fields back to their default values. Rarely useful; risks discarding a user's typed input by accident.
- \`type="button"\` — does nothing on its own; used purely as a hook for JavaScript (e.g. "Add another item").

### The default-submit trap

\`\`\`html
<form>
  <input type="text" name="search">
  <button onclick="doSomething()">Preview</button>  <!-- submits the form! -->
</form>
\`\`\`

Because \`<button>\` defaults to \`type="submit"\`, any button inside a \`<form>\` without an explicit \`type\` will submit and reload the page — even if its only purpose was to trigger a JavaScript function. Always set \`type="button"\` explicitly for non-submit buttons inside a form.

### input type="submit" — the older equivalent

\`\`\`html
<input type="submit" value="Submit">
\`\`\`

Functionally equivalent to \`<button type="submit">Submit</button>\`, but \`<button>\` is generally preferred since it can contain other HTML (icons, nested spans) rather than only plain text.

### What happens on submit

With \`method="get"\`, form data is appended to the URL as a query string:

\`\`\`
/search?query=html+forms
\`\`\`

With \`method="post"\`, the data travels in the request body, invisible in the URL — required for anything sensitive (passwords) or that changes server state (creating an order, posting a comment).

### Disabling the submit button

\`\`\`html
<button type="submit" disabled>Submit</button>
\`\`\`

A \`disabled\` button can't be clicked or focused, and its value isn't submitted. JavaScript typically toggles this off once required fields are validly filled.

> **Key idea:** a \`<button>\` inside a \`<form>\` submits by default — always give non-submit buttons an explicit \`type="button"\`, or you'll trigger accidental submissions.`,
    },
    {
      name: "Form Validation & Accessibility",
      minutes: 9,
      intro: "Making sure errors are visible, understandable, and announced to every user.",
      content: `### Native validation UI

With \`required\`, \`pattern\`, \`min\`/\`max\`, etc., the browser blocks submission and shows a built-in error bubble pointing at the offending field — no JavaScript needed:

\`\`\`html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Sign up</button>
</form>
\`\`\`

Try submitting this empty — the browser stops you and focuses the email field automatically.

### Custom validation messages

\`\`\`html
<input
  type="text"
  name="username"
  pattern="[a-z0-9]{3,16}"
  title="3-16 characters, lowercase letters and numbers only"
>
\`\`\`

The \`title\` attribute becomes part of the browser's validation message when \`pattern\` fails — a lightweight way to explain the rule without JavaScript.

### Associating an error message for screen readers

When you *do* build custom error UI with JavaScript, connect the error text to the input with \`aria-describedby\`:

\`\`\`html
<label for="password">Password</label>
<input
  type="password"
  id="password"
  name="password"
  aria-describedby="password-error"
  aria-invalid="true"
>
<span id="password-error">Password must be at least 8 characters</span>
\`\`\`

- \`aria-describedby\` points to the element with the error text — screen readers announce it alongside the field's label.
- \`aria-invalid="true"\` marks the field as currently failing validation.

Without this wiring, a sighted user sees red error text near the field, but a screen reader user tabbing through the form hears nothing about it at all.

### Grouping and structuring a real form

\`\`\`html
<form action="/signup" method="post">
  <fieldset>
    <legend>Account details</legend>

    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>

    <label for="password">Password</label>
    <input type="password" id="password" name="password" required minlength="8">
  </fieldset>

  <button type="submit">Create account</button>
</form>
\`\`\`

> **Key idea:** built-in HTML validation attributes cover the common cases for free. When you need custom error messaging, \`aria-describedby\` and \`aria-invalid\` are what keep that experience equal for screen reader users — not just a visual red border.`,
    },
  ],
}
