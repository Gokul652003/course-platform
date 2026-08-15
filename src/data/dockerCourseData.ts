import { dockerModule1 } from "./dockerModule1Content"
import { dockerModule2 } from "./dockerModule2Content"
import { dockerModule3 } from "./dockerModule3Content"
import { dockerModule4 } from "./dockerModule4Content"
import { dockerModule5 } from "./dockerModule5Content"
import { dockerModule6 } from "./dockerModule6Content"
import { dockerModule7 } from "./dockerModule7Content"
import { dockerModule8 } from "./dockerModule8Content"
import { dockerModule9 } from "./dockerModule9Content"
import { dockerModule10 } from "./dockerModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const dockerModules: Module[] = [
  dockerModule1,
  dockerModule2,
  dockerModule3,
  dockerModule4,
  dockerModule5,
  dockerModule6,
  dockerModule7,
  dockerModule8,
  dockerModule9,
  dockerModule10,
]

export const dockerCourse: Course = {
  title: "Complete Docker Course",
  tagline: "From containers vs VMs to a deployed multi-service app — the full workflow, end to end",
  description:
    "A hands-on, end-to-end journey through Docker — covering images and containers, writing and optimizing Dockerfiles, volumes and data persistence, networking, Docker Compose, configuration and secrets, registries and security, finishing with a full worked capstone deploying a multi-service app.",
  stats: {
    modules: dockerModules.length,
    level: "Beginner → Intermediate",
    lessons: dockerModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      dockerModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
