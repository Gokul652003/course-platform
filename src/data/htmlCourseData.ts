import { htmlModule1 } from "./htmlModule1Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const htmlModules: Module[] = [htmlModule1]

export const htmlCourse: Course = {
  title: "Complete HTML Course",
  tagline: "From tags to semantic, accessible pages",
  description:
    "A hands-on journey through HTML — covering structure, semantic markup, forms, media, and accessibility.",
  stats: {
    modules: htmlModules.length,
    level: "Beginner",
    lessons: htmlModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      htmlModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
