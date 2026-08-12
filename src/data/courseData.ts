import { module1 } from "./module1Content"
import { module2 } from "./module2Content"
import { module3 } from "./module3Content"
import { module4 } from "./module4Content"
import { module5 } from "./module5Content"
import { module6 } from "./module6Content"
import { module7 } from "./module7Content"
import { module8 } from "./module8Content"
import { module9 } from "./module9Content"
import { module10 } from "./module10Content"
import { module11 } from "./module11Content"
import { module12 } from "./module12Content"
import { module13 } from "./module13Content"
import { module14 } from "./module14Content"
import { module15 } from "./module15Content"
import { module16 } from "./module16Content"
import { CheckCircle2, Clock, BookOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Course, Lesson, Module } from "../types"

export const linuxModules: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
  module9,
  module10,
  module11,
  module12,
  module13,
  module14,
  module15,
  module16,
]

export function lessonCount(mod: Module): number {
  return mod.lessons.length
}

export function lessonsDoneCount(mod: Module): number {
  if (mod.status === "complete") return mod.lessons.length
  if (mod.status === "in_progress") {
    const done = mod.lessonsDone ?? mod.lessons.filter((l) => l.done === true).length
    return done
  }
  return 0
}

export function hasLessonContent(mod: Module): boolean {
  return mod.lessons.some((l) => typeof l === "object" && l.content)
}

export function lessonDuration(l: Lesson): number {
  return l.minutes ?? 8
}

export const linuxCourse: Course = {
  title: "Complete Linux Course",
  tagline: "From absolute beginner to developer-ready Linux",
  description:
    "A hands-on, milestone-based journey through Linux — covering fundamentals, system administration, and developer/DevOps workflows.",
  stats: {
    modules: 16,
    level: "Beginner → Advanced",
    lessons: linuxModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      linuxModules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0), 0) /
        60,
    ),
  },
}

export interface StatusMeta {
  label: string
  icon: LucideIcon
  color: "emerald" | "amber" | "slate"
  ring: string
  badge: string
}

export const statusMeta: Record<Module["status"], StatusMeta> = {
  complete: {
    label: "Completed",
    icon: CheckCircle2,
    color: "emerald",
    ring: "ring-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "amber",
    ring: "ring-amber-500/40",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  upcoming: {
    label: "Upcoming",
    icon: BookOpen,
    color: "slate",
    ring: "ring-slate-700",
    badge: "bg-slate-500/10 text-slate-400 border-slate-600/40",
  },
}
