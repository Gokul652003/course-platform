import { awsModule1 } from "./awsModule1Content"
import { awsModule2 } from "./awsModule2Content"
import { awsModule3 } from "./awsModule3Content"
import { awsModule4 } from "./awsModule4Content"
import { awsModule5 } from "./awsModule5Content"
import { awsModule6 } from "./awsModule6Content"
import { awsModule7 } from "./awsModule7Content"
import { awsModule8 } from "./awsModule8Content"
import { awsModule9 } from "./awsModule9Content"
import { awsModule10 } from "./awsModule10Content"
import { awsModule11 } from "./awsModule11Content"
import { awsModule12 } from "./awsModule12Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const awsModules: Module[] = [
  awsModule1,
  awsModule2,
  awsModule3,
  awsModule4,
  awsModule5,
  awsModule6,
  awsModule7,
  awsModule8,
  awsModule9,
  awsModule10,
  awsModule11,
  awsModule12,
]

export const awsCourse: Course = {
  title: "AWS Cloud Practitioner (CLF-C02)",
  tagline: "From absolute beginner to exam-ready — the complete CLF-C02 blueprint",
  description:
    "A complete, structured study course for the AWS Certified Cloud Practitioner (CLF-C02) exam — covering every domain: cloud concepts, security & compliance, cloud technology & services, and billing, pricing & support.",
  stats: {
    modules: awsModules.length,
    level: "Beginner",
    lessons: awsModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      awsModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}