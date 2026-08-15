import { jsModule1 } from "./jsModule1Content"
import { jsModule2 } from "./jsModule2Content"
import { jsModule3 } from "./jsModule3Content"
import { jsModule4 } from "./jsModule4Content"
import { jsModule5 } from "./jsModule5Content"
import { jsModule6 } from "./jsModule6Content"
import { jsModule7 } from "./jsModule7Content"
import { jsModule8 } from "./jsModule8Content"
import { jsModule9 } from "./jsModule9Content"
import { jsModule10 } from "./jsModule10Content"
import { jsModule11 } from "./jsModule11Content"
import { jsModule12 } from "./jsModule12Content"
import { jsModule13 } from "./jsModule13Content"
import { jsModule14 } from "./jsModule14Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const jsModules: Module[] = [
  jsModule1,
  jsModule2,
  jsModule3,
  jsModule4,
  jsModule5,
  jsModule6,
  jsModule7,
  jsModule8,
  jsModule9,
  jsModule10,
  jsModule11,
  jsModule12,
  jsModule13,
  jsModule14,
]

export const jsCourse: Course = {
  title: "Complete JavaScript Course",
  tagline: "From your first console.log to the event loop and closures — the full language, end to end",
  description:
    "A hands-on, end-to-end journey through JavaScript — covering fundamentals and how the engine actually runs your code, operators and control flow, functions, scope and closures, objects and prototypes, arrays and iteration, this/classes/OOP, asynchronous JavaScript, the event loop and runtime internals, error handling, modules/iterators/generators, built-in objects (Numbers, Strings, Dates, JSON), modern syntax and meta-programming (optional chaining, Proxy/Reflect, WeakMap/WeakSet), and a final capstone tying every concept together.",
  stats: {
    modules: jsModules.length,
    level: "Beginner → Advanced",
    lessons: jsModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      jsModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
