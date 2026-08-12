import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

interface ProgressContextValue {
  isDone: (courseId: string, modId: number, index: number) => boolean
  toggleDone: (courseId: string, modId: number, index: number) => void
  doneCount: (courseId: string, modId: number) => number
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

export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, string[]>>(() => loadProgress())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const isDone = (courseId: string, modId: number, index: number) =>
    progress[courseId]?.includes(`${modId}:${index}`) ?? false

  const toggleDone = (courseId: string, modId: number, index: number) => {
    const key = `${modId}:${index}`
    setProgress((prev) => {
      const list = prev[courseId] ?? []
      const nextList = list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
      return { ...prev, [courseId]: nextList }
    })
  }

  const doneCount = (courseId: string, modId: number) =>
    progress[courseId]?.filter((k) => k.startsWith(`${modId}:`)).length ?? 0

  return (
    <ProgressContext.Provider value={{ isDone, toggleDone, doneCount }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useCourseProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error("useCourseProgress must be used within CourseProgressProvider")
  return ctx
}