import type { ReactNode } from "react"
import { Terminal, Code2, Cloud, CodeXml } from "lucide-react"
import { linuxModules, linuxCourse } from "./courseData"
import { kotlinModules, kotlinCourse } from "./kotlinCourseData"
import { awsModules, awsCourse } from "./awsCourseData"
import { htmlModules, htmlCourse } from "./htmlCourseData"
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

function AwsGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
      <Cloud size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function HtmlGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/20">
      <CodeXml size={40} strokeWidth={1.8} className="text-white" />
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
      text: "text-emerald-600 dark:text-emerald-400",
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
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/30",
    },
  },
  {
    id: "aws",
    title: awsCourse.title,
    tagline: awsCourse.tagline,
    description: awsCourse.description,
    modules: awsModules,
    course: awsCourse,
    icon: <AwsGlyph />,
    tags: [
      "Exam prep",
      `${awsCourse.stats.lessons} lessons`,
      "CLF-C02 blueprint",
      "Beginner",
    ],
    accent: {
      gradient: "from-orange-500 to-amber-500",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/30",
    },
  },
  {
    id: "html",
    title: htmlCourse.title,
    tagline: htmlCourse.tagline,
    description:
      "A hands-on journey through HTML — covering document structure, semantic markup, forms, media, and accessibility.",
    modules: htmlModules,
    course: htmlCourse,
    icon: <HtmlGlyph />,
    tags: ["Beginner", `${htmlCourse.stats.lessons} lessons`, "Markup fundamentals"],
    accent: {
      gradient: "from-rose-500 to-orange-600",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
    },
  },
]

export function getCourse(id: string): CourseBundle | undefined {
  return courses.find((c) => c.id === id)
}

export function courseTotalLessons(bundle: CourseBundle): number {
  return bundle.modules.reduce((acc, m) => acc + m.lessons.length, 0)
}

export function courseProgress(
  bundle: CourseBundle,
  keysForCourse: (courseId: string) => string[],
): { done: number; total: number; pct: number; nextHref: string | null } {
  const keys = keysForCourse(bundle.id)
  const total = courseTotalLessons(bundle)
  let done = 0
  let nextHref: string | null = null
  for (const mod of bundle.modules) {
    for (let i = 0; i < mod.lessons.length; i++) {
      if (keys.includes(`${mod.id}:${i}`)) done += 1
      else if (nextHref === null)
        nextHref = `/course/${bundle.id}/module/${mod.id}/lesson/${i}`
    }
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, nextHref }
}