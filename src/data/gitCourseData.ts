import { gitModule1 } from "./gitModule1Content"
import { gitModule2 } from "./gitModule2Content"
import { gitModule3 } from "./gitModule3Content"
import { gitModule4 } from "./gitModule4Content"
import { gitModule5 } from "./gitModule5Content"
import { gitModule6 } from "./gitModule6Content"
import { gitModule7 } from "./gitModule7Content"
import { gitModule8 } from "./gitModule8Content"
import { gitModule9 } from "./gitModule9Content"
import { gitModule10 } from "./gitModule10Content"
import { gitModule11 } from "./gitModule11Content"
import { gitModule12 } from "./gitModule12Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const gitModules: Module[] = [
  gitModule1,
  gitModule2,
  gitModule3,
  gitModule4,
  gitModule5,
  gitModule6,
  gitModule7,
  gitModule8,
  gitModule9,
  gitModule10,
  gitModule11,
  gitModule12,
]

export const gitCourse: Course = {
  title: "Complete Git Course",
  tagline: "From your first commit to rebasing, internals, and real team workflows — end to end",
  description:
    "A hands-on, end-to-end journey through Git — covering the core workflow, branching and merging, undoing changes safely, working with remotes, collaborating through GitHub pull requests, rewriting history with rebase and cherry-pick, stashing and tags, real team branching strategies, Git's internals (objects, refs, and the object database), and a final capstone tying every concept together into one realistic workflow.",
  stats: {
    modules: gitModules.length,
    level: "Beginner → Advanced",
    lessons: gitModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      gitModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
