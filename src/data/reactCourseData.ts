import { reactModule1 } from "./reactModule1Content"
import { reactModule2 } from "./reactModule2Content"
import { reactModule3 } from "./reactModule3Content"
import { reactModule4 } from "./reactModule4Content"
import { reactModule5 } from "./reactModule5Content"
import { reactModule6 } from "./reactModule6Content"
import { reactModule7 } from "./reactModule7Content"
import { reactModule8 } from "./reactModule8Content"
import { reactModule9 } from "./reactModule9Content"
import { reactModule10 } from "./reactModule10Content"
import { reactModule11 } from "./reactModule11Content"
import { reactModule12 } from "./reactModule12Content"
import { reactModule13 } from "./reactModule13Content"
import { reactModule14 } from "./reactModule14Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const reactModules: Module[] = [
  reactModule1,
  reactModule2,
  reactModule3,
  reactModule4,
  reactModule5,
  reactModule6,
  reactModule7,
  reactModule8,
  reactModule9,
  reactModule10,
  reactModule11,
  reactModule12,
  reactModule13,
  reactModule14,
]

export const reactCourse: Course = {
  title: "Complete React Course",
  tagline: "From your first component to production-ready patterns — beginner to professional, end to end",
  description:
    "A hands-on, end-to-end journey through React — covering JSX and rendering, components and props, state and events, useEffect and side effects, refs and performance hooks, custom hooks, useReducer/useContext, forms, component composition patterns, routing with React Router, data fetching and async state, testing with React Testing Library, and a final capstone covering error boundaries, state management at scale, accessibility, and project architecture.",
  stats: {
    modules: reactModules.length,
    level: "Beginner → Professional",
    lessons: reactModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      reactModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
