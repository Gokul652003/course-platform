import { scssModule1 } from "./scssModule1Content"
import { scssModule2 } from "./scssModule2Content"
import { scssModule3 } from "./scssModule3Content"
import { scssModule4 } from "./scssModule4Content"
import { scssModule5 } from "./scssModule5Content"
import { scssModule6 } from "./scssModule6Content"
import { scssModule7 } from "./scssModule7Content"
import { scssModule8 } from "./scssModule8Content"
import { scssModule9 } from "./scssModule9Content"
import { scssModule10 } from "./scssModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const scssModules: Module[] = [
  scssModule1,
  scssModule2,
  scssModule3,
  scssModule4,
  scssModule5,
  scssModule6,
  scssModule7,
  scssModule8,
  scssModule9,
  scssModule10,
]

export const scssCourse: Course = {
  title: "Complete Sass (SCSS) Course",
  tagline: "Variables & nesting → mixins & functions → control flow & maps → architecture, end to end",
  description:
    "A hands-on, milestone-based journey through Sass — from installing and compiling SCSS, through variables, nesting, the modern @use/@forward module system, mixins, functions and #{} interpolation, @extend and placeholder selectors, control directives and loops, maps and lists as a design-token system, real-world architecture patterns like 7-1, and finishing with an honest, practical comparison of Sass against what native modern CSS can now do on its own.",
  stats: {
    modules: scssModules.length,
    level: "Beginner → Advanced",
    lessons: scssModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      scssModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
