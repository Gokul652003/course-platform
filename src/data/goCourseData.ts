import { goModule1 } from "./goModule1Content"
import { goModule2 } from "./goModule2Content"
import { goModule3 } from "./goModule3Content"
import { goModule4 } from "./goModule4Content"
import { goModule5 } from "./goModule5Content"
import { goModule6 } from "./goModule6Content"
import { goModule7 } from "./goModule7Content"
import { goModule8 } from "./goModule8Content"
import { goModule9 } from "./goModule9Content"
import { goModule10 } from "./goModule10Content"
import { goModule11 } from "./goModule11Content"
import { goModule12 } from "./goModule12Content"
import { goModule13 } from "./goModule13Content"
import { goModule14 } from "./goModule14Content"
import { goModule15 } from "./goModule15Content"
import { goModule16 } from "./goModule16Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const goModules: Module[] = [
  goModule1,
  goModule2,
  goModule3,
  goModule4,
  goModule5,
  goModule6,
  goModule7,
  goModule8,
  goModule9,
  goModule10,
  goModule11,
  goModule12,
  goModule13,
  goModule14,
  goModule15,
  goModule16,
]

export const goCourse: Course = {
  title: "Complete Go Course",
  tagline: "Syntax → Concurrency → APIs → Production",
  description:
    "A hands-on, milestone-based journey through Go — core syntax, structs, interfaces, and error handling, then goroutines and channels, the standard library, testing, building REST APIs and working with databases, generics, and shipping production-ready services.",
  stats: {
    modules: goModules.length,
    level: "Beginner → Advanced",
    lessons: goModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      goModules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0), 0) /
        60,
    ),
  },
}
