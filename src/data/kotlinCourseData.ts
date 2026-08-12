import { kotlinModule1 } from "./kotlinModule1Content"
import { kotlinModule2 } from "./kotlinModule2Content"
import { kotlinModule3 } from "./kotlinModule3Content"
import { kotlinModule4 } from "./kotlinModule4Content"
import { kotlinModule5 } from "./kotlinModule5Content"
import { kotlinModule6 } from "./kotlinModule6Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const kotlinModules: Module[] = [
  kotlinModule1,
  kotlinModule2,
  kotlinModule3,
  kotlinModule4,
  kotlinModule5,
  kotlinModule6,
]

export const kotlinCourse: Course = {
  title: "Complete Kotlin Course",
  tagline: "Phase 1: Kotlin Fundamentals — from first program to advanced features",
  description:
    "A hands-on journey through Kotlin — covering setup, core syntax, functions, null safety, object-oriented programming, and functional programming.",
  stats: {
    modules: kotlinModules.length,
    level: "Beginner → Intermediate",
    lessons: kotlinModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      kotlinModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}