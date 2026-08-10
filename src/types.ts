export type ModuleStatus = "complete" | "in_progress" | "upcoming"

export interface Lesson {
  name: string
  minutes: number
  intro: string
  content: string
  done?: boolean
}

export interface Module {
  id: number
  title: string
  status: ModuleStatus
  lessons: Lesson[]
  lessonsDone?: number
}

export interface CourseStats {
  modules: number
  level: string
  lessons: number
  hours: number
}

export interface Course {
  title: string
  tagline: string
  description: string
  stats: CourseStats
}
