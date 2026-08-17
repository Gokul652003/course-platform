import { kotlinModule1 } from "./kotlinModule1Content"
import { kotlinModule2 } from "./kotlinModule2Content"
import { kotlinModule3 } from "./kotlinModule3Content"
import { kotlinModule4 } from "./kotlinModule4Content"
import { kotlinModule5 } from "./kotlinModule5Content"
import { kotlinModule6 } from "./kotlinModule6Content"
import { kotlinModule7 } from "./kotlinModule7Content"
import { kotlinModule8 } from "./kotlinModule8Content"
import { kotlinModule9 } from "./kotlinModule9Content"
import { kotlinModule10 } from "./kotlinModule10Content"
import { kotlinModule11 } from "./kotlinModule11Content"
import { kotlinModule12 } from "./kotlinModule12Content"
import { kotlinModule13 } from "./kotlinModule13Content"
import { kotlinModule14 } from "./kotlinModule14Content"
import { kotlinModule15 } from "./kotlinModule15Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const kotlinModules: Module[] = [
  kotlinModule1,
  kotlinModule2,
  kotlinModule3,
  kotlinModule4,
  kotlinModule5,
  kotlinModule6,
  kotlinModule7,
  kotlinModule8,
  kotlinModule9,
  kotlinModule10,
  kotlinModule11,
  kotlinModule12,
  kotlinModule13,
  kotlinModule14,
  kotlinModule15,
]

export const kotlinCourse: Course = {
  title: "Complete Kotlin Course",
  tagline: "Fundamentals → Android Basics → Jetpack Compose → Architecture",
  description:
    "A hands-on journey through Kotlin and Android — core syntax, null safety, OOP, and functional programming, then building real Android UI with Activities and XML, modern UI with Jetpack Compose, and clean app architecture with MVVM and Jetpack libraries.",
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