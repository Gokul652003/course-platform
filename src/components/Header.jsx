import { Terminal, Layers, BookOpen, Clock, Signal } from "lucide-react"
import { course } from "../data/courseData"

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}

export default function Header() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-8 md:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Actively building · {course.stats.modules} modules
          </div>

          <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Terminal size={26} className="text-emerald-400" />
            </span>
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-slate-300">{course.tagline}</p>
          <p className="mt-2 text-sm text-slate-400">{course.description}</p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3">
          <Stat label="Lessons" value={course.stats.lessons} icon={BookOpen} />
          <Stat label="Est. Hours" value={course.stats.hours} icon={Clock} />
          <Stat label="Level" value={course.stats.level.split("→")[0]} icon={Signal} />
          <Stat label="Modules" value={`${course.stats.modules}/12`} icon={Layers} />
        </div>
      </div>
    </header>
  )
}