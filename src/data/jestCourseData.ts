import { jestModule1 } from "./jestModule1Content"
import { jestModule2 } from "./jestModule2Content"
import { jestModule3 } from "./jestModule3Content"
import { jestModule4 } from "./jestModule4Content"
import { jestModule5 } from "./jestModule5Content"
import { jestModule6 } from "./jestModule6Content"
import { jestModule7 } from "./jestModule7Content"
import { jestModule8 } from "./jestModule8Content"
import { jestModule9 } from "./jestModule9Content"
import { jestModule10 } from "./jestModule10Content"
import { jestModule11 } from "./jestModule11Content"
import { jestModule12 } from "./jestModule12Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const jestModules: Module[] = [
  jestModule1,
  jestModule2,
  jestModule3,
  jestModule4,
  jestModule5,
  jestModule6,
  jestModule7,
  jestModule8,
  jestModule9,
  jestModule10,
  jestModule11,
  jestModule12,
]

export const jestCourse: Course = {
  title: "Complete Jest Course",
  tagline: "From your first test to CI-enforced coverage — testing JavaScript end to end",
  description:
    "A hands-on, end-to-end journey through Jest — covering matchers and test structure, setup/teardown and test isolation, mocking functions and modules, testing asynchronous code and timers, snapshot testing, code coverage, testing classes and parameterized tests, configuration and custom matchers, and CI/performance practices with a final capstone tying every technique together.",
  stats: {
    modules: jestModules.length,
    level: "Beginner → Professional",
    lessons: jestModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      jestModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
