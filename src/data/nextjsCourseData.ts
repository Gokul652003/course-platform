import { nextjsModule1 } from "./nextjsModule1Content"
import { nextjsModule2 } from "./nextjsModule2Content"
import { nextjsModule3 } from "./nextjsModule3Content"
import { nextjsModule4 } from "./nextjsModule4Content"
import { nextjsModule5 } from "./nextjsModule5Content"
import { nextjsModule6 } from "./nextjsModule6Content"
import { nextjsModule7 } from "./nextjsModule7Content"
import { nextjsModule8 } from "./nextjsModule8Content"
import { nextjsModule9 } from "./nextjsModule9Content"
import { nextjsModule10 } from "./nextjsModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const nextjsModules: Module[] = [
  nextjsModule1,
  nextjsModule2,
  nextjsModule3,
  nextjsModule4,
  nextjsModule5,
  nextjsModule6,
  nextjsModule7,
  nextjsModule8,
  nextjsModule9,
  nextjsModule10,
]

export const nextjsCourse: Course = {
  title: "Complete Next.js Course",
  tagline: "From the App Router to a deployed production app — the full framework, end to end",
  description:
    "A hands-on, end-to-end journey through Next.js — covering the App Router, Server and Client Components, every rendering strategy, data fetching and caching, Server Actions, styling, API route handlers and middleware, metadata and performance optimization, authentication, finishing with a full worked capstone on configuration and deployment.",
  stats: {
    modules: nextjsModules.length,
    level: "Intermediate",
    lessons: nextjsModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      nextjsModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
