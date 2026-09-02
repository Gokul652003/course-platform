import { systemDesignModule1 } from "./systemDesignModule1Content"
import { systemDesignModule2 } from "./systemDesignModule2Content"
import { systemDesignModule3 } from "./systemDesignModule3Content"
import { systemDesignModule4 } from "./systemDesignModule4Content"
import { systemDesignModule5 } from "./systemDesignModule5Content"
import { systemDesignModule6 } from "./systemDesignModule6Content"
import { systemDesignModule7 } from "./systemDesignModule7Content"
import { systemDesignModule8 } from "./systemDesignModule8Content"
import { systemDesignModule9 } from "./systemDesignModule9Content"
import { systemDesignModule10 } from "./systemDesignModule10Content"
import { systemDesignModule11 } from "./systemDesignModule11Content"
import { systemDesignModule12 } from "./systemDesignModule12Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const systemDesignModules: Module[] = [
  systemDesignModule1,
  systemDesignModule2,
  systemDesignModule3,
  systemDesignModule4,
  systemDesignModule5,
  systemDesignModule6,
  systemDesignModule7,
  systemDesignModule8,
  systemDesignModule9,
  systemDesignModule10,
  systemDesignModule11,
  systemDesignModule12,
]

export const systemDesignCourse: Course = {
  title: "Complete System Design Course",
  tagline: "HLD & requirements → scalability, databases & caching → load balancing, messaging & distributed systems → LLD & interview playbook, end to end",
  description:
    "A hands-on, milestone-based journey through System Design — from high-level vs low-level design and functional/non-functional requirements, through architectural styles, scalability, databases, availability/consistency/reliability, load balancing, caching and CDNs, API gateways and messaging, networking and real-time communication, event-driven and distributed systems, security and production readiness, and finishing with object-oriented low-level design, design patterns, and a repeatable framework for cracking system design interviews with worked case studies.",
  stats: {
    modules: systemDesignModules.length,
    level: "Beginner → Advanced",
    lessons: systemDesignModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      systemDesignModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
