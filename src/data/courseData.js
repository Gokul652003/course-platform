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
import { CheckCircle2, Clock, BookOpen } from "lucide-react"

export const course = {
  title: "Complete Linux Course",
  tagline: "From absolute beginner to developer-ready Linux",
  description:
    "A hands-on, milestone-based journey through Linux — covering fundamentals, system administration, and developer/DevOps workflows.",
  stats: {
    modules: 12,
    level: "Beginner → Advanced",
  },
}

export const modules = [
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
]

export function lessonCount(mod) {
  return mod.lessons.length
}

export function lessonsDoneCount(mod) {
  if (mod.status === "complete") return mod.lessons.length
  if (mod.status === "in_progress") {
    const done = mod.lessonsDone ?? mod.lessons.filter((l) => l.done === true).length
    return done
  }
  return 0
}

export function hasLessonContent(mod) {
  return mod.lessons.some((l) => typeof l === "object" && l.content)
}

export function lessonDuration(l) {
  return l.minutes ?? 8
}

course.stats.lessons = modules.reduce((acc, m) => acc + lessonCount(m), 0)
course.stats.hours = Math.round(
  modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0), 0) / 60,
)

export const statusMeta = {
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