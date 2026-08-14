import { Terminal, Code2, Layers, BookOpen, Clock, Signal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { CourseBundle } from "../data/courses.tsx"

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 transition-all hover:border-slate-300 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 ${accent}`}>
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  )
}

export default function Header({ bundle }: { bundle: CourseBundle }) {
  const { course } = bundle
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-50 p-8 shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 md:p-10">
      <div className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${bundle.accent.gradient} opacity-10 blur-3xl`} />
      <div className={`pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full ${bundle.accent.text} opacity-10 blur-3xl`} />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border bg-white/50 px-3 py-1 text-xs font-medium dark:bg-slate-950/50 ${bundle.accent.border} ${bundle.accent.text}`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${bundle.accent.text}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${bundle.accent.text}`} />
            </span>
            Actively building · {course.stats.modules} modules
          </div>

          <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${bundle.accent.gradient}`}
            >
              {bundle.id === "linux" ? <Terminal size={26} /> : <Code2 size={26} />}
            </span>
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">{course.tagline}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{course.description}</p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3">
          <Stat label="Lessons" value={course.stats.lessons} icon={BookOpen} accent={bundle.accent.text} />
          <Stat label="Est. Hours" value={course.stats.hours} icon={Clock} accent={bundle.accent.text} />
          <Stat label="Level" value={course.stats.level.split("→")[0]} icon={Signal} accent={bundle.accent.text} />
          <Stat label="Modules" value={course.stats.modules} icon={Layers} accent={bundle.accent.text} />
        </div>
      </div>
    </header>
  )
}
