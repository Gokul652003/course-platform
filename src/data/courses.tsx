import type { ReactNode } from "react"
import { Terminal, Code2, Cloud, CodeXml, Container, Triangle, Braces, TestTube, GitBranch, Atom, Gauge, Wind, Palette, Wand2, FileType2, RefreshCw } from "lucide-react"
import { linuxModules, linuxCourse } from "./courseData"
import { kotlinModules, kotlinCourse } from "./kotlinCourseData"
import { goModules, goCourse } from "./goCourseData"
import { tailwindModules, tailwindCourse } from "./tailwindCourseData"
import { cssModules, cssCourse } from "./cssCourseData"
import { scssModules, scssCourse } from "./scssCourseData"
import { tsModules, tsCourse } from "./tsCourseData"
import { tanstackQueryModules, tanstackQueryCourse } from "./tanstackQueryCourseData"
import { awsModules, awsCourse } from "./awsCourseData"
import { htmlModules, htmlCourse } from "./htmlCourseData"
import { dockerModules, dockerCourse } from "./dockerCourseData"
import { nextjsModules, nextjsCourse } from "./nextjsCourseData"
import { jsModules, jsCourse } from "./jsCourseData"
import { jestModules, jestCourse } from "./jestCourseData"
import { gitModules, gitCourse } from "./gitCourseData"
import { reactModules, reactCourse } from "./reactCourseData"
import type { Course, Module } from "../types"

export interface CourseBundle {
  id: string
  title: string
  tagline: string
  description: string
  modules: Module[]
  course: Course
  icon: ReactNode
  tags: string[]
  featured?: boolean
  accent: {
    gradient: string
    text: string
    border: string
  }
}

function LinuxGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
      <Terminal size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function KotlinGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
      <Code2 size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function GoGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
      <Gauge size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function TailwindGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 shadow-lg shadow-cyan-500/20">
      <Wind size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function CssGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
      <Palette size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function ScssGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/20">
      <Wand2 size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function TsGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20">
      <FileType2 size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function TanstackQueryGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
      <RefreshCw size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function AwsGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
      <Cloud size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function HtmlGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/20">
      <CodeXml size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function DockerGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
      <Container size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function NextjsGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-lg shadow-zinc-500/20">
      <Triangle size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function JsGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/20">
      <Braces size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function JestGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-pink-700 shadow-lg shadow-rose-500/20">
      <TestTube size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function GitGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/20">
      <GitBranch size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

function ReactGlyph() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20">
      <Atom size={40} strokeWidth={1.8} className="text-white" />
    </span>
  )
}

export const courses: CourseBundle[] = [
  {
    id: "linux",
    title: linuxCourse.title,
    tagline: linuxCourse.tagline,
    description:
      "A hands-on, milestone-based journey through Linux — from absolute beginner to developer-ready system administration and DevOps.",
    modules: linuxModules,
    course: linuxCourse,
    icon: <LinuxGlyph />,
    tags: [`Beginner → Advanced`, `${linuxCourse.stats.lessons} lessons`, "Hands-on", "DevOps ready"],
    featured: true,
    accent: {
      gradient: "from-emerald-500 to-cyan-600",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/30",
    },
  },
  {
    id: "kotlin",
    title: kotlinCourse.title,
    tagline: kotlinCourse.tagline,
    description:
      "A hands-on, milestone-based journey through Kotlin — covering fundamentals, functions, null safety, OOP, and functional programming.",
    modules: kotlinModules,
    course: kotlinCourse,
    icon: <KotlinGlyph />,
    tags: [
      "Beginner → Advanced",
      `${kotlinCourse.stats.lessons} lessons`,
      "Compose & Architecture",
      "JVM",
    ],
    accent: {
      gradient: "from-violet-500 to-fuchsia-600",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/30",
    },
  },
  {
    id: "go",
    title: goCourse.title,
    tagline: goCourse.tagline,
    description: goCourse.description,
    modules: goModules,
    course: goCourse,
    icon: <GoGlyph />,
    tags: [
      "Beginner → Advanced",
      `${goCourse.stats.lessons} lessons`,
      "Concurrency & generics",
      "APIs & databases",
    ],
    accent: {
      gradient: "from-teal-500 to-cyan-600",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-500/30",
    },
  },
  {
    id: "tailwind",
    title: tailwindCourse.title,
    tagline: tailwindCourse.tagline,
    description: tailwindCourse.description,
    modules: tailwindModules,
    course: tailwindCourse,
    icon: <TailwindGlyph />,
    tags: [
      "Beginner → Advanced",
      `${tailwindCourse.stats.lessons} lessons`,
      "Layout & theming",
      "v4 CSS-first",
    ],
    accent: {
      gradient: "from-cyan-400 to-sky-600",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/30",
    },
  },
  {
    id: "css",
    title: cssCourse.title,
    tagline: cssCourse.tagline,
    description: cssCourse.description,
    modules: cssModules,
    course: cssCourse,
    icon: <CssGlyph />,
    tags: [
      "Beginner → Advanced",
      `${cssCourse.stats.lessons} lessons`,
      "Flexbox & Grid mastery",
      "Animations & modern CSS",
    ],
    accent: {
      gradient: "from-blue-500 to-indigo-600",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/30",
    },
  },
  {
    id: "scss",
    title: scssCourse.title,
    tagline: scssCourse.tagline,
    description: scssCourse.description,
    modules: scssModules,
    course: scssCourse,
    icon: <ScssGlyph />,
    tags: [
      "Beginner → Advanced",
      `${scssCourse.stats.lessons} lessons`,
      "Mixins, functions & maps",
      "@use/@forward modules",
    ],
    accent: {
      gradient: "from-fuchsia-500 to-pink-600",
      text: "text-fuchsia-600 dark:text-fuchsia-400",
      border: "border-fuchsia-500/30",
    },
  },
  {
    id: "typescript",
    title: tsCourse.title,
    tagline: tsCourse.tagline,
    description: tsCourse.description,
    modules: tsModules,
    course: tsCourse,
    icon: <TsGlyph />,
    tags: [
      "Beginner → Advanced",
      `${tsCourse.stats.lessons} lessons`,
      "Generics & advanced types",
      "Real-project practices",
    ],
    accent: {
      gradient: "from-blue-600 to-blue-800",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-600/30",
    },
  },
  {
    id: "tanstack-query",
    title: tanstackQueryCourse.title,
    tagline: tanstackQueryCourse.tagline,
    description: tanstackQueryCourse.description,
    modules: tanstackQueryModules,
    course: tanstackQueryCourse,
    icon: <TanstackQueryGlyph />,
    tags: [
      "Beginner → Advanced",
      `${tanstackQueryCourse.stats.lessons} lessons`,
      "Caching & mutations",
      "SSR & Next.js",
    ],
    accent: {
      gradient: "from-red-500 to-rose-600",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/30",
    },
  },
  {
    id: "aws",
    title: awsCourse.title,
    tagline: awsCourse.tagline,
    description: awsCourse.description,
    modules: awsModules,
    course: awsCourse,
    icon: <AwsGlyph />,
    tags: [
      "Exam prep",
      `${awsCourse.stats.lessons} lessons`,
      "CLF-C02 blueprint",
      "Beginner",
    ],
    accent: {
      gradient: "from-orange-500 to-amber-500",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/30",
    },
  },
  {
    id: "html",
    title: htmlCourse.title,
    tagline: htmlCourse.tagline,
    description: htmlCourse.description,
    modules: htmlModules,
    course: htmlCourse,
    icon: <HtmlGlyph />,
    tags: [
      "Beginner",
      `${htmlCourse.stats.lessons} lessons`,
      "Markup fundamentals",
      "Accessibility",
    ],
    accent: {
      gradient: "from-rose-500 to-orange-600",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
    },
  },
  {
    id: "docker",
    title: dockerCourse.title,
    tagline: dockerCourse.tagline,
    description: dockerCourse.description,
    modules: dockerModules,
    course: dockerCourse,
    icon: <DockerGlyph />,
    tags: [
      "Beginner → Intermediate",
      `${dockerCourse.stats.lessons} lessons`,
      "Compose & networking",
      "Containers",
    ],
    accent: {
      gradient: "from-sky-500 to-blue-600",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/30",
    },
  },
  {
    id: "nextjs",
    title: nextjsCourse.title,
    tagline: nextjsCourse.tagline,
    description: nextjsCourse.description,
    modules: nextjsModules,
    course: nextjsCourse,
    icon: <NextjsGlyph />,
    tags: [
      "Intermediate",
      `${nextjsCourse.stats.lessons} lessons`,
      "App Router",
      "Full-stack React",
    ],
    accent: {
      gradient: "from-zinc-700 to-zinc-950",
      text: "text-zinc-700 dark:text-zinc-300",
      border: "border-zinc-500/30",
    },
  },
  {
    id: "javascript",
    title: jsCourse.title,
    tagline: jsCourse.tagline,
    description: jsCourse.description,
    modules: jsModules,
    course: jsCourse,
    icon: <JsGlyph />,
    tags: [
      "Beginner → Advanced",
      `${jsCourse.stats.lessons} lessons`,
      "Event loop & closures",
      "Core language",
    ],
    accent: {
      gradient: "from-yellow-400 to-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
    },
  },
  {
    id: "jest",
    title: jestCourse.title,
    tagline: jestCourse.tagline,
    description: jestCourse.description,
    modules: jestModules,
    course: jestCourse,
    icon: <JestGlyph />,
    tags: [
      "Beginner → Professional",
      `${jestCourse.stats.lessons} lessons`,
      "Mocking & coverage",
      "CI-ready",
    ],
    accent: {
      gradient: "from-rose-600 to-pink-700",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
    },
  },
  {
    id: "git",
    title: gitCourse.title,
    tagline: gitCourse.tagline,
    description: gitCourse.description,
    modules: gitModules,
    course: gitCourse,
    icon: <GitGlyph />,
    tags: [
      "Beginner → Advanced",
      `${gitCourse.stats.lessons} lessons`,
      "Rebasing & internals",
      "Team workflows",
    ],
    accent: {
      gradient: "from-red-500 to-orange-600",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/30",
    },
  },
  {
    id: "react",
    title: reactCourse.title,
    tagline: reactCourse.tagline,
    description: reactCourse.description,
    modules: reactModules,
    course: reactCourse,
    icon: <ReactGlyph />,
    tags: [
      "Beginner → Professional",
      `${reactCourse.stats.lessons} lessons`,
      "Hooks & patterns",
      "Testing included",
    ],
    accent: {
      gradient: "from-cyan-500 to-blue-500",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/30",
    },
  },
]

export function getCourse(id: string): CourseBundle | undefined {
  return courses.find((c) => c.id === id)
}

export function courseTotalLessons(bundle: CourseBundle): number {
  return bundle.modules.reduce((acc, m) => acc + m.lessons.length, 0)
}

export function courseProgress(
  bundle: CourseBundle,
  keysForCourse: (courseId: string) => string[],
): { done: number; total: number; pct: number; nextHref: string | null } {
  const keys = keysForCourse(bundle.id)
  const total = courseTotalLessons(bundle)
  let done = 0
  let nextHref: string | null = null
  for (const mod of bundle.modules) {
    for (let i = 0; i < mod.lessons.length; i++) {
      if (keys.includes(`${mod.id}:${i}`)) done += 1
      else if (nextHref === null)
        nextHref = `/course/${bundle.id}/module/${mod.id}/lesson/${i}`
    }
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, nextHref }
}