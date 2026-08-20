import { cssModule1 } from "./cssModule1Content"
import { cssModule2 } from "./cssModule2Content"
import { cssModule3 } from "./cssModule3Content"
import { cssModule4 } from "./cssModule4Content"
import { cssModule5 } from "./cssModule5Content"
import { cssModule6 } from "./cssModule6Content"
import { cssModule7 } from "./cssModule7Content"
import { cssModule8 } from "./cssModule8Content"
import { cssModule9 } from "./cssModule9Content"
import { cssModule10 } from "./cssModule10Content"
import { cssModule11 } from "./cssModule11Content"
import { cssModule12 } from "./cssModule12Content"
import { cssModule13 } from "./cssModule13Content"
import { cssModule14 } from "./cssModule14Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const cssModules: Module[] = [
  cssModule1,
  cssModule2,
  cssModule3,
  cssModule4,
  cssModule5,
  cssModule6,
  cssModule7,
  cssModule8,
  cssModule9,
  cssModule10,
  cssModule11,
  cssModule12,
  cssModule13,
  cssModule14,
]

export const cssCourse: Course = {
  title: "Complete CSS Course",
  tagline: "Selectors & the cascade → box model & layout → Flexbox & Grid → animation → modern CSS, end to end",
  description:
    "A hands-on, milestone-based journey through CSS itself — from selectors, the cascade, and the box model, through colors, units, typography, backgrounds, and positioning, into a deep dive on Flexbox and Grid layout, responsive design and container queries, transitions and animations, pseudo-classes and pseudo-elements, custom properties and modern CSS functions, cutting-edge selectors like :has() and native nesting, and finishing with architecture, performance, and accessibility best practices.",
  stats: {
    modules: cssModules.length,
    level: "Beginner → Advanced",
    lessons: cssModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      cssModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
