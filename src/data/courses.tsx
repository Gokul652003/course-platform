import type { ReactNode } from "react"
import { Terminal, Code2 } from "lucide-react"
import { linuxModules, linuxCourse } from "./courseData"
import { kotlinModules, kotlinCourse } from "./kotlinCourseData"
import type { Course, Module } from "../types"

export interface CourseBundle {
  id: string
  title: string
  tagline: string
  description: string
  modules: Module[]
  course: Course
  icon: ReactNode
  tags: string[]
  featured?: boolean
  accent: {
    gradient: string
    text: string
    border: string
  }
}

function LinuxGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
      <Terminal size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function KotlinGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
      <Code2 size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

export const courses: CourseBundle[] = [
  {
    id: "linux",
    title: linuxCourse.title,
    tagline: linuxCourse.tagline,
    description:
      "A hands-on, milestone-based journey through Linux — from absolute beginner to developer-ready system administration and DevOps.",
    modules: linuxModules,
    course: linuxCourse,
    icon: <LinuxGlyph />,
    tags: [`Beginner → Advanced`, `${linuxCourse.stats.lessons} lessons`, "Hands-on", "DevOps ready"],
    featured: true,
    accent: {
      gradient: "from-emerald-500 to-cyan-600",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
  },
  {
    id: "kotlin",
    title: kotlinCourse.title,
    tagline: kotlinCourse.tagline,
    description:
      "A hands-on, milestone-based journey through Kotlin — covering fundamentals, functions, null safety, OOP, and functional programming.",
    modules: kotlinModules,
    course: kotlinCourse,
    icon: <KotlinGlyph />,
    tags: [
      "Beginner → Intermediate",
      `${kotlinCourse.stats.lessons} lessons`,
      "Phase 1: Fundamentals",
      "JVM",
    ],
    accent: {
      gradient: "from-violet-500 to-fuchsia-600",
      text: "text-violet-400",
      border: "border-violet-500/30",
    },
  },
]

export function getCourse(id: string): CourseBundle | undefined {
  return courses.find((c) => c.id === id)
}