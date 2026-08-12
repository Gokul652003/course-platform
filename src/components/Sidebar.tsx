import { statusMeta, lessonCount, lessonsDoneCount } from "../data/courseData.ts"
import type { StatusMeta } from "../data/courseData.ts"
import type { CourseBundle } from "../data/courses.tsx"

interface SidebarProps {
  bundle: CourseBundle
  activeId: number
  onSelect: (id: number) => void
}

export default function Sidebar({ bundle, activeId, onSelect }: SidebarProps) {
  const modules = bundle.modules
  const totalDone = modules.reduce((acc, m) => acc + lessonsDoneCount(m), 0)
  const totalLessons = modules.reduce((acc, m) => acc + lessonCount(m), 0)
  const pct = Math.round((totalDone / totalLessons) * 100)
  const accentBar = bundle.id === "linux" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-gradient-to-r from-violet-500 to-fuchsia-500"

  return (
    <aside className="hidden w-80 shrink-0 lg:block">
      <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Course Progress</span>
            <span className={`text-sm font-bold ${bundle.accent.text}`}>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${accentBar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {totalDone} of {totalLessons} lessons completed
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {modules.map((m) => {
            const meta: StatusMeta = statusMeta[m.status]
            const active = m.id === activeId
            const total = lessonCount(m)
            const done = lessonsDoneCount(m)
            const barPct = Math.round((done / total) * 100)

            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? `border-current ${bundle.accent.text}`
                    : "border-transparent hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    active
                      ? bundle.id === "linux"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-violet-500/20 text-violet-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {m.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-medium ${
                      active ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {m.title}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <meta.icon size={12} className={active ? bundle.accent.text : ""} />
                    {done}/{total} lessons
                  </span>
                </span>
                <span className="hidden w-12 text-right text-[10px] font-medium text-slate-500 xl:block">
                  {barPct}%
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}