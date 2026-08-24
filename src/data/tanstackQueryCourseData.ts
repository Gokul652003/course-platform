import { tanstackQueryModule1 } from "./tanstackQueryModule1Content"
import { tanstackQueryModule2 } from "./tanstackQueryModule2Content"
import { tanstackQueryModule3 } from "./tanstackQueryModule3Content"
import { tanstackQueryModule4 } from "./tanstackQueryModule4Content"
import { tanstackQueryModule5 } from "./tanstackQueryModule5Content"
import { tanstackQueryModule6 } from "./tanstackQueryModule6Content"
import { tanstackQueryModule7 } from "./tanstackQueryModule7Content"
import { tanstackQueryModule8 } from "./tanstackQueryModule8Content"
import { tanstackQueryModule9 } from "./tanstackQueryModule9Content"
import { tanstackQueryModule10 } from "./tanstackQueryModule10Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const tanstackQueryModules: Module[] = [
  tanstackQueryModule1,
  tanstackQueryModule2,
  tanstackQueryModule3,
  tanstackQueryModule4,
  tanstackQueryModule5,
  tanstackQueryModule6,
  tanstackQueryModule7,
  tanstackQueryModule8,
  tanstackQueryModule9,
  tanstackQueryModule10,
]

export const tanstackQueryCourse: Course = {
  title: "Complete TanStack Query Course",
  tagline: "Queries & caching → mutations & optimistic updates → pagination, SSR & production practices, end to end",
  description:
    "A hands-on, milestone-based journey through TanStack Query (React Query) — from installing the client and firing your first useQuery, through query keys, caching and stale time, mutations and optimistic updates, dependent and parallel queries, pagination and infinite queries, server-side rendering and prefetching in Next.js, and finishing with an honest, practical comparison against SWR, RTK Query, and plain fetch-based data fetching.",
  stats: {
    modules: tanstackQueryModules.length,
    level: "Beginner → Advanced",
    lessons: tanstackQueryModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      tanstackQueryModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
