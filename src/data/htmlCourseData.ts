import { htmlModule1 } from "./htmlModule1Content"
import { htmlModule2 } from "./htmlModule2Content"
import { htmlModule3 } from "./htmlModule3Content"
import { htmlModule4 } from "./htmlModule4Content"
import { htmlModule5 } from "./htmlModule5Content"
import { htmlModule6 } from "./htmlModule6Content"
import { htmlModule7 } from "./htmlModule7Content"
import { htmlModule8 } from "./htmlModule8Content"
import { htmlModule9 } from "./htmlModule9Content"
import { htmlModule10 } from "./htmlModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const htmlModules: Module[] = [
  htmlModule1,
  htmlModule2,
  htmlModule3,
  htmlModule4,
  htmlModule5,
  htmlModule6,
  htmlModule7,
  htmlModule8,
  htmlModule9,
  htmlModule10,
]

export const htmlCourse: Course = {
  title: "Complete HTML Course",
  tagline: "From tags to semantic, accessible pages — the full language, end to end",
  description:
    "A hands-on, end-to-end journey through HTML — covering document structure, text and lists, links, images and media, tables, forms, semantic layout, accessibility, document metadata, and advanced elements, finishing with a full worked capstone page.",
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
