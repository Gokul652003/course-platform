import { tsModule1 } from "./tsModule1Content"
import { tsModule2 } from "./tsModule2Content"
import { tsModule3 } from "./tsModule3Content"
import { tsModule4 } from "./tsModule4Content"
import { tsModule5 } from "./tsModule5Content"
import { tsModule6 } from "./tsModule6Content"
import { tsModule7 } from "./tsModule7Content"
import { tsModule8 } from "./tsModule8Content"
import { tsModule9 } from "./tsModule9Content"
import { tsModule10 } from "./tsModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const tsModules: Module[] = [
  tsModule1,
  tsModule2,
  tsModule3,
  tsModule4,
  tsModule5,
  tsModule6,
  tsModule7,
  tsModule8,
  tsModule9,
  tsModule10,
]

export const tsCourse: Course = {
  title: "Complete TypeScript Course",
  tagline: "Types & inference → generics & advanced types → real projects & production practices, end to end",
  description:
    "A hands-on, milestone-based journey through TypeScript — from installing the compiler and annotating your first variables, through functions, object types, unions and narrowing, classes, generics, and the advanced type system (mapped, conditional, and template literal types), into real-world concerns like declaration files, tsconfig strictness, using TypeScript with React and Node, migrating a JavaScript codebase, and finishing with an honest, practical comparison of TypeScript against plain JavaScript.",
  stats: {
    modules: tsModules.length,
    level: "Beginner → Advanced",
    lessons: tsModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      tsModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
