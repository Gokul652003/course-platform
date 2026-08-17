import type { Module } from "../types"

export const reactModule9: Module = {
  id: 9,
  title: "Forms & Controlled Components",
  status: "upcoming",
  lessons: [
    {
      name: "Building a Multi-Field Form",
      minutes: 9,
      intro: "Managing several controlled inputs together, without repeating the same pattern for every field.",
      content: `### The repetitive version: one useState per field

\`\`\`jsx
function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
    </form>
  )
}
\`\`\`

Recall module 4's controlled-input pattern — this works correctly, but for a form with many fields, writing a separate \`useState\` and a separate inline \`onChange\` handler for every single one grows repetitive fast.

### Consolidating into one state object

\`\`\`jsx
function SignupForm() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <input name="password" type="password" value={formData.password} onChange={handleChange} />
    </form>
  )
}
\`\`\`

This combines several concepts from earlier modules: the HTML \`name\` attribute on each input identifies *which* field changed; \`event.target\` (module 4's SyntheticEvent) gives access to both \`name\` and \`value\`; the JavaScript course's computed property names (module 5, \`{ [name]: value }\`) dynamically set the right key; and module 4's functional updater form (\`prev => ...\`) combined with spread (JavaScript course module 6) correctly updates just one field while preserving the rest. One single \`handleChange\` function now handles every field in the form.

### Handling checkboxes and other input types within the same pattern

\`\`\`jsx
function handleChange(event) {
  const { name, value, type, checked } = event.target
  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }))
}
\`\`\`

Recall module 4: a checkbox's relevant property is \`checked\`, not \`value\` — extending the consolidated handler to branch on \`event.target.type\` lets one function correctly handle text inputs, checkboxes, and other input types uniformly, rather than needing separate handlers per type.

### Submitting the form

\`\`\`jsx
function SignupForm() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()   // module 4: stop the browser's default full-page-reload submission
    console.log("Submitting:", formData)
    // send formData to a server, typically via fetch — covered in module 12
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <button type="submit">Sign up</button>
    </form>
  )
}
\`\`\`

The complete pattern: one state object holding every field, one \`handleChange\` reused across every input, and a \`handleSubmit\` that reads the entire current \`formData\` at once, already up to date, since it's the same state the inputs themselves are controlled by.

### Resetting a form after successful submission

\`\`\`jsx
function handleSubmit(event) {
  event.preventDefault()
  submitToServer(formData)
  setFormData({ name: "", email: "", password: "" })   // reset every field back to its initial value
}
\`\`\`

Because every field is driven entirely by state (module 4's controlled-input principle), resetting the form is just resetting that one state object — no need to manually clear each DOM input individually, the way you would with plain, uncontrolled HTML.

> **Key idea:** consolidating multiple related fields into a single state object, combined with one shared \`handleChange\` that reads \`event.target.name\` to know which field changed, scales the controlled-input pattern from module 4 to a real, multi-field form without repeating the same boilerplate for every input.`,
    },
    {
      name: "Form Validation",
      minutes: 9,
      intro: "Giving the user useful feedback before submission — and the timing decisions that make validation feel right.",
      content: `### Validating on submit: the simplest starting point

\`\`\`jsx
function SignupForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})

  function validate(data) {
    const newErrors = {}
    if (!data.email.includes("@")) newErrors.email = "Enter a valid email"
    if (data.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      console.log("Submitting:", formData)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={formData.email} onChange={/* ... */} />
      {errors.email && <p className="error">{errors.email}</p>}

      <input name="password" type="password" value={formData.password} onChange={/* ... */} />
      {errors.password && <p className="error">{errors.password}</p>}

      <button type="submit">Sign up</button>
    </form>
  )
}
\`\`\`

A separate \`errors\` state object, keyed the same way as \`formData\`, holds the current validation messages — recomputed by \`validate()\` (recall the JavaScript course's module 6 \`Object.keys\`) each time the form is submitted, and rendered conditionally (module 2's \`&&\` pattern) beneath each field.

### Validating on blur: feedback before the user even submits

\`\`\`jsx
function handleBlur(event) {
  const { name, value } = event.target
  const fieldErrors = validate({ ...formData, [name]: value })
  setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }))
}

<input name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
\`\`\`

\`onBlur\` fires when a field loses focus (the user clicks or tabs away from it) — validating at that point gives feedback earlier than waiting for a full form submission, without the more aggressive experience of validating on every single keystroke (which tends to show an error message while the user is still mid-typing a valid value, feeling naggy and premature).

### A common UX refinement: only show an error after the field has been "touched"

\`\`\`jsx
const [touched, setTouched] = useState({})

function handleBlur(event) {
  const { name } = event.target
  setTouched((prev) => ({ ...prev, [name]: true }))
}

// only show the error if the user has actually interacted with (and left) this specific field
{touched.email && errors.email && <p className="error">{errors.email}</p>}
\`\`\`

Without tracking which fields have been "touched," every field's error would show immediately on the very first render, before the user has typed anything at all — a poor experience. Tracking \`touched\` separately from both \`formData\` and \`errors\` is the standard way to avoid showing an error prematurely, only surfacing it once the user has actually interacted with that specific field.

### Disabling submission until the form is valid

\`\`\`jsx
const isValid = formData.email.includes("@") && formData.password.length >= 8

<button type="submit" disabled={!isValid}>Sign up</button>
\`\`\`

Recall module 4's controlled-input lesson demonstrating exactly this pattern: because \`formData\` is plain, readable state, deriving a boolean like \`isValid\` directly from it — no extra state, no effect — and using it to conditionally disable the submit button is straightforward, entirely computed during render.

### Validation libraries: what they add once forms get genuinely complex

For a form with many fields, complex cross-field validation rules (e.g., "confirm password" must match "password"), or validation rules that need to be reused across several forms, hand-writing every \`validate()\` function becomes unwieldy. Libraries like **Zod** (schema-based validation, works well with TypeScript) or **Yup** let you *declare* a form's validation rules as a schema, rather than writing imperative \`if\` checks by hand — genuinely worth reaching for once a form's validation logic grows past a handful of simple rules; the underlying concepts (errors state, touched state, deriving validity) covered in this lesson remain exactly the same either way.

> **Key idea:** validating on submit is the simplest starting point; validating on blur (combined with tracking which fields have been "touched") gives earlier feedback without the nagging feel of validating on every keystroke — and a form's validity is usually a plain, derivable boolean, not something that needs its own separate piece of state.`,
    },
    {
      name: "Complex Forms & Form Libraries",
      minutes: 8,
      intro: "Where the hand-rolled pattern starts to strain, and the tools built to handle that scale.",
      content: `### Where hand-rolled forms start to strain

The patterns from the previous two lessons work well for a form with a handful of fields and straightforward validation. They start to genuinely strain once a form grows to include: dynamic fields (an "add another item" button that grows the form), deeply nested field structures (an address object inside a user object), cross-field validation, and careful re-render performance (recall module 6 — every keystroke in a large, hand-rolled form triggers a re-render of the *entire* form component, which can become noticeably slow for a genuinely large form).

### React Hook Form: minimizing re-renders with uncontrolled inputs under the hood

\`\`\`jsx
import { useForm } from "react-hook-form"

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  function onSubmit(data) {
    console.log(data)   // { email: "...", password: "..." } — collected automatically
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email", { required: "Email is required" })} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register("password", { minLength: 8 })} />

      <button type="submit">Sign up</button>
    </form>
  )
}
\`\`\`

**React Hook Form** is the most widely used form library in the current React ecosystem. Notice what's different from the hand-rolled pattern: there's no \`useState\` for \`formData\` at all — \`register("email", {...})\` connects an input directly to the library's internal, ref-based tracking (recall module 6's refs lesson) rather than a controlled-input pattern, which is precisely what avoids triggering a React re-render on every single keystroke — a genuine, measurable performance advantage for large forms.

### Schema-based validation, connected directly

\`\`\`jsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  // ...
}
\`\`\`

Recall the previous lesson's mention of Zod — React Hook Form integrates directly with schema-validation libraries via a "resolver," so the validation rules live in one declarative schema object, and the library handles wiring validation errors up to \`formState.errors\` automatically, without any hand-written \`validate()\` function at all.

### Formik: the older, still-common alternative

\`\`\`jsx
import { Formik, Form, Field, ErrorMessage } from "formik"

function SignupForm() {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <Field name="email" />
        <ErrorMessage name="email" />
        <button type="submit">Sign up</button>
      </Form>
    </Formik>
  )
}
\`\`\`

**Formik** predates React Hook Form's current popularity and uses controlled inputs internally (more re-renders than React Hook Form's ref-based approach, but a more explicitly "React-y" mental model, closer to the hand-rolled patterns from the previous two lessons). You'll still encounter it regularly in existing codebases — worth recognizing even if React Hook Form is the more common choice for a new project today.

### When to actually reach for a library vs hand-rolling

For a small form (a login form, a simple contact form, a search box), the hand-rolled patterns from the previous two lessons are genuinely simpler and don't need an extra dependency at all. Reach for a library like React Hook Form specifically once a form has: many fields, meaningful re-render performance concerns, complex validation rules worth expressing declaratively via a schema, or dynamic/repeatable field groups — the exact pain points a hand-rolled approach starts to show at scale.

> **Key idea:** hand-rolled controlled forms (previous two lessons) are the right, simple default for small forms — React Hook Form (the current ecosystem standard) avoids controlled-input re-render costs via refs under the hood and integrates cleanly with schema validation like Zod, earning its complexity specifically once a form's size, validation needs, or performance characteristics outgrow the hand-rolled pattern.`,
    },
  ],
}
