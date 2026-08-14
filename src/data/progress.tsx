import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { supabase } from "../lib/supabaseClient.ts"
import { useAuth } from "./auth.tsx"

interface ProgressContextValue {
  isDone: (courseId: string, modId: number, index: number) => boolean
  toggleDone: (courseId: string, modId: number, index: number) => void
  doneCount: (courseId: string, modId: number) => number
  keysForCourse: (courseId: string) => string[]
}

const STORAGE_KEY = "course-platform-progress"

const ProgressContext = createContext<ProgressContextValue | null>(null)

function loadProgress(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const remoteKey = (courseId: string, lessonKey: string) => `${courseId}::${lessonKey}`

export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Record<string, string[]>>(() => loadProgress())
  const syncedUserId = useRef<string | null>(null)
  const prevUserId = useRef<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  // On sign-out (or switching to a different account): the local cache
  // belonged to the previous account, not the browser — clear it so it
  // doesn't keep showing as "done", and doesn't leak into whichever
  // account is now signed in on this device.
  useEffect(() => {
    const nextUserId = user?.id ?? null
    if (prevUserId.current && prevUserId.current !== nextUserId) {
      syncedUserId.current = null
      setProgress({})
    }
    prevUserId.current = nextUserId
  }, [user])

  // On login: pull the user's saved progress from Supabase, merge it with
  // whatever's in localStorage, and push up any local-only completions.
  useEffect(() => {
    if (!user || syncedUserId.current === user.id) return
    syncedUserId.current = user.id

    supabase
      .from("progress")
      .select("course_id, lesson_key")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error || !data) return

        setProgress((prev) => {
          const merged: Record<string, string[]> = { ...prev }
          for (const row of data) {
            const list = merged[row.course_id] ?? []
            if (!list.includes(row.lesson_key)) merged[row.course_id] = [...list, row.lesson_key]
          }

          const remoteSet = new Set(data.map((r) => remoteKey(r.course_id, r.lesson_key)))
          const toUpload = Object.entries(merged).flatMap(([courseId, keys]) =>
            keys
              .filter((key) => !remoteSet.has(remoteKey(courseId, key)))
              .map((key) => ({ user_id: user.id, course_id: courseId, lesson_key: key })),
          )
          if (toUpload.length > 0) {
            supabase.from("progress").upsert(toUpload).then(undefined, () => {})
          }

          return merged
        })
      }, () => {})
  }, [user])

  const isDone = (courseId: string, modId: number, index: number) =>
    progress[courseId]?.includes(`${modId}:${index}`) ?? false

  const toggleDone = (courseId: string, modId: number, index: number) => {
    const key = `${modId}:${index}`
    const wasDone = progress[courseId]?.includes(key) ?? false

    setProgress((prev) => {
      const list = prev[courseId] ?? []
      const nextList = list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
      return { ...prev, [courseId]: nextList }
    })

    if (user) {
      const query = wasDone
        ? supabase.from("progress").delete().match({ user_id: user.id, course_id: courseId, lesson_key: key })
        : supabase.from("progress").upsert({ user_id: user.id, course_id: courseId, lesson_key: key })
      query.then(undefined, () => {})
    }
  }

  const doneCount = (courseId: string, modId: number) =>
    progress[courseId]?.filter((k) => k.startsWith(`${modId}:`)).length ?? 0

  const keysForCourse = (courseId: string) => progress[courseId] ?? []

  return (
    <ProgressContext.Provider value={{ isDone, toggleDone, doneCount, keysForCourse }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useCourseProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error("useCourseProgress must be used within CourseProgressProvider")
  return ctx
}