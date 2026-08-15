import type { Module } from "../types"

export const nextjsModule5: Module = {
  id: 5,
  title: "Server Actions & Mutations",
  status: "upcoming",
  lessons: [
    {
      name: "Your First Server Action",
      minutes: 9,
      intro: "Writing a server-side mutation as if it were a regular function, callable directly from a form.",
      content: `### The problem Server Actions solve

Before Server Actions, submitting a form to a server typically meant writing a separate API route, then wiring up a client-side \`fetch\` call, request body, error handling, and re-fetching data afterward — a lot of boilerplate for "save this data." Server Actions collapse that into one function.

### Defining a Server Action

\`\`\`tsx
// app/actions.ts
"use server"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  await db.post.create({ data: { title } })
}
\`\`\`

The \`"use server"\` directive marks this function to run **only on the server** — even though you'll call it directly from client-side form markup, it never actually executes in the browser. Next.js generates a secure endpoint behind the scenes and wires the call up for you.

### Using it directly on a form

\`\`\`tsx
import { createPost } from "./actions"

export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" type="text" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
\`\`\`

Passing the Server Action directly to a \`<form>\`'s \`action\` prop is enough — no \`onSubmit\` handler, no manual \`fetch\`, no manually reading form fields into a request body. The browser's native form submission mechanism, combined with Next.js's handling of the \`action\` prop, does all of it.

### Server Actions work without JavaScript too

Because this builds on the browser's native \`<form action="...">\` behavior rather than intercepting the submit with JavaScript, a form using a Server Action still works even if client-side JavaScript hasn't loaded yet (or fails to load) — a real, practical resilience benefit that a hand-rolled \`fetch\`-based submit handler doesn't get for free.

### Inline Server Actions

\`\`\`tsx
export default function NewPostForm() {
  async function createPost(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    await db.post.create({ data: { title } })
  }

  return (
    <form action={createPost}>
      <input name="title" type="text" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
\`\`\`

\`"use server"\` can also mark a single function defined inline inside a Server Component, rather than an entire separate file — convenient for a mutation used by exactly one form and nowhere else.

> **Key idea:** a Server Action is an ordinary \`async\` function marked \`"use server"\`, callable directly as a form's \`action\` — Next.js handles turning that into a real server request, without you writing a separate API route or client-side fetch call.`,
    },
    {
      name: "Revalidating Data After a Mutation",
      minutes: 8,
      intro: "Making sure the UI reflects a change immediately after a Server Action runs.",
      content: `### The problem: stale cached data after a write

\`\`\`tsx
"use server"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  await db.post.create({ data: { title } })
  // without revalidation, the posts list page still shows CACHED, stale data
}
\`\`\`

Recall from the data-fetching module: \`fetch\` (and, similarly, cached data more broadly) is cached by default. After a Server Action successfully writes new data, the page showing that data needs to be told its cache is now stale — otherwise a user creates a post and doesn't see it appear.

### revalidatePath: invalidate a specific route

\`\`\`tsx
"use server"

import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  await db.post.create({ data: { title } })
  revalidatePath("/posts")
}
\`\`\`

\`revalidatePath("/posts")\` tells Next.js: the next time \`/posts\` is visited, treat its cached data as stale and regenerate it. The new post now shows up immediately on the next request to that route.

### revalidateTag: invalidate by tag, across routes

\`\`\`tsx
"use server"

import { revalidateTag } from "next/cache"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  await db.post.create({ data: { title } })
  revalidateTag("posts")
}
\`\`\`

Recall the tagged \`fetch\` from the previous module — \`revalidateTag("posts")\` invalidates *every* cached fetch tagged \`"posts"\`, regardless of which route it lives on. Useful when the same data appears in multiple places (a homepage preview, a full posts list, a sidebar) that all need to refresh together after one mutation.

### Redirecting after a mutation

\`\`\`tsx
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  const post = await db.post.create({ data: { title } })
  revalidatePath("/posts")
  redirect(\`/posts/\${post.id}\`)
}
\`\`\`

\`redirect\` (from \`next/navigation\`) inside a Server Action sends the user to a new page after the mutation completes — a common pattern for "create something, then view the thing you just created."

> **Key idea:** a Server Action performing a write doesn't automatically refresh any cached data that depended on it — \`revalidatePath\`/\`revalidateTag\` are how you explicitly tell Next.js "this cached data is now stale," and \`redirect\` sends the user somewhere new afterward.`,
    },
    {
      name: "Handling Errors & Pending State",
      minutes: 9,
      intro: "useActionState and useFormStatus — showing validation errors and loading indicators without hand-rolled state.",
      content: `### The problem: forms need feedback

A plain \`<form action={serverAction}>\` submits and (eventually) shows the result — but users need to see validation errors, and some indication the form is actively submitting. Two hooks handle this cleanly.

### useActionState: capturing a Server Action's return value

\`\`\`tsx
"use server"

export async function createPost(prevState: unknown, formData: FormData) {
  const title = formData.get("title") as string
  if (!title || title.length < 3) {
    return { error: "Title must be at least 3 characters." }
  }
  await db.post.create({ data: { title } })
  return { error: null }
}
\`\`\`

\`\`\`tsx
"use client"

import { useActionState } from "react"
import { createPost } from "./actions"

export function NewPostForm() {
  const [state, formAction] = useActionState(createPost, { error: null })

  return (
    <form action={formAction}>
      <input name="title" type="text" required />
      {state.error && <p className="text-red-600">{state.error}</p>}
      <button type="submit">Create Post</button>
    </form>
  )
}
\`\`\`

\`useActionState\` wraps a Server Action and gives you back its most recent return value as \`state\`, plus a wrapped \`formAction\` to pass to the form instead of the raw action. This is the standard way to surface server-side validation errors directly in the UI, without any manual \`fetch\`/error-state plumbing.

### useFormStatus: a pending indicator, without prop drilling

\`\`\`tsx
"use client"

import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create Post"}
    </button>
  )
}
\`\`\`

\`\`\`tsx
import { createPost } from "./actions"
import { SubmitButton } from "./SubmitButton"

export function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" type="text" required />
      <SubmitButton />
    </form>
  )
}
\`\`\`

\`useFormStatus\` must be called from a component **rendered inside** the \`<form>\` — it reads the pending state of the nearest parent form automatically, with no props passed down manually. This is why \`SubmitButton\` is pulled out into its own component here: calling \`useFormStatus\` directly in \`NewPostForm\` (the component containing the \`<form>\` itself, not nested inside it) wouldn't work — it needs to be a descendant of the \`<form>\`, not the same component that renders it.

### Combining both

\`\`\`tsx
"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createPost } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? "Saving…" : "Save"}</button>
}

export function NewPostForm() {
  const [state, formAction] = useActionState(createPost, { error: null })
  return (
    <form action={formAction}>
      <input name="title" type="text" required />
      {state.error && <p>{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
\`\`\`

Together, these two hooks cover the two things every real form needs — validation feedback and a pending/loading indicator — without a single \`useState\` or manual \`fetch\` call anywhere in this component.

> **Key idea:** \`useActionState\` surfaces a Server Action's return value (typically validation errors) back into the UI; \`useFormStatus\` reads pending state from the nearest enclosing \`<form>\`, which is why it needs its own small component nested inside the form, not the component that renders the form itself.`,
    },
    {
      name: "Server Actions Beyond Forms",
      minutes: 7,
      intro: "Calling a Server Action from a button click, and understanding its security model.",
      content: `### Calling a Server Action outside of a form

\`\`\`tsx
"use client"

import { deletePost } from "./actions"

export function DeleteButton({ postId }: { postId: string }) {
  return (
    <button onClick={() => deletePost(postId)}>
      Delete
    </button>
  )
}
\`\`\`

Server Actions aren't limited to \`<form action={...}>\` — they're callable like ordinary async functions from any event handler in a Client Component (a button click, a drag-and-drop, a timer). The \`"use server"\` function still executes only on the server; calling it from client code triggers that same generated request under the hood.

### Passing extra arguments with bind

\`\`\`tsx
"use server"

export async function deletePost(postId: string, formData: FormData) {
  await db.post.delete({ where: { id: postId } })
}
\`\`\`

\`\`\`tsx
"use client"

import { deletePost } from "./actions"

export function DeleteForm({ postId }: { postId: string }) {
  const deletePostWithId = deletePost.bind(null, postId)
  return (
    <form action={deletePostWithId}>
      <button type="submit">Delete</button>
    </form>
  )
}
\`\`\`

When a Server Action used as a form's \`action\` needs extra data beyond what's in the form fields (like an ID from the surrounding page's props), \`.bind\` pre-fills the first argument(s) — the form's \`FormData\` still arrives as the *last* parameter automatically.

### The security model: Server Actions are public endpoints

\`\`\`tsx
"use server"

export async function deletePost(postId: string) {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  await db.post.delete({ where: { id: postId, authorId: session.user.id } })
}
\`\`\`

This is worth internalizing clearly: a Server Action, once shipped, becomes a **callable, public HTTP endpoint** — Next.js generates a real network-reachable ID for it. Anyone who can inspect your app's network requests could, in principle, call that endpoint directly, bypassing whatever UI you built around it. **Never assume a Server Action can only be invoked the way your UI invokes it** — always re-check authentication and authorization *inside* the action itself, exactly as you would for a traditional API route. Treating a Server Action as somehow inherently "private" because it's defined server-side is a real, common security mistake.

> **Key idea:** Server Actions can be triggered from any event, not just form submissions, using \`.bind\` to pass extra arguments — but always remember they're publicly callable endpoints once deployed, so authentication/authorization checks belong inside the action, never assumed from the UI alone.`,
    },
  ],
}
