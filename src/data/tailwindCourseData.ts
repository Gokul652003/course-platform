import { tailwindModule1 } from "./tailwindModule1Content"
import { tailwindModule2 } from "./tailwindModule2Content"
import { tailwindModule3 } from "./tailwindModule3Content"
import { tailwindModule4 } from "./tailwindModule4Content"
import { tailwindModule5 } from "./tailwindModule5Content"
import { tailwindModule6 } from "./tailwindModule6Content"
import { tailwindModule7 } from "./tailwindModule7Content"
import { tailwindModule8 } from "./tailwindModule8Content"
import { tailwindModule9 } from "./tailwindModule9Content"
import { tailwindModule10 } from "./tailwindModule10Content"
import { tailwindModule11 } from "./tailwindModule11Content"
import { tailwindModule12 } from "./tailwindModule12Content"
import { tailwindModule13 } from "./tailwindModule13Content"
import { tailwindModule14 } from "./tailwindModule14Content"
import { tailwindModule15 } from "./tailwindModule15Content"
import { tailwindModule16 } from "./tailwindModule16Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const tailwindModules: Module[] = [
  tailwindModule1,
  tailwindModule2,
  tailwindModule3,
  tailwindModule4,
  tailwindModule5,
  tailwindModule6,
  tailwindModule7,
  tailwindModule8,
  tailwindModule9,
  tailwindModule10,
  tailwindModule11,
  tailwindModule12,
  tailwindModule13,
  tailwindModule14,
  tailwindModule15,
  tailwindModule16,
]

export const tailwindCourse: Course = {
  title: "Complete Tailwind CSS Course",
  tagline: "Utility-first fundamentals → layout & responsive design → theming → production v4",
  description:
    "A hands-on, milestone-based journey through Tailwind CSS — from the utility-first philosophy and core styling primitives, through flexbox/grid layout, responsive design, interactive states, dark mode, animations, and deep theme customization, to forms, reusable component patterns, the plugin ecosystem, Tailwind v4's CSS-first engine, and production best practices.",
  stats: {
    modules: tailwindModules.length,
    level: "Beginner → Advanced",
    lessons: tailwindModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      tailwindModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
