import {
  GraduationCap,
  ArrowRight,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { courses } from "../data/courses.tsx"

export default function HomePage({ onOpenCourse }: { onOpenCourse: (id: string) => void }) {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                <GraduationCap size={24} />
              </span>
              <div>
                <div className="text-lg font-bold text-white">Course Platform</div>
                <div className="text-xs text-slate-500">Learn at your own pace</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              {courses.length} courses live
            </span>
          </nav>

          <header className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center md:py-24">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-300">
              <Sparkles size={14} className="text-emerald-400" />
              Linux · Kotlin · Hand-on mastery
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              Courses, built
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                for real learning
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              A structured, milestone-based course platform. Study the complete Linux track and
              the Kotlin Fundamentals phase, with hands-on practice files alongside.
            </p>
            <a
              href="#courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
            >
              Browse courses
              <ArrowDown size={16} />
            </a>
          </header>

          <section id="courses" className="pb-20 pt-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Browse Courses</h2>
                <p className="text-sm text-slate-500">Pick a track and start learning</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenCourse(c.id)}
                  className={`text-left transition-all hover:-translate-y-1 ${
                    c.featured ? "md:col-span-2" : ""
                  }`}
                >
                  <article
                    className={`flex flex-col overflow-hidden rounded-2xl border bg-slate-900/60 ${
                      c.featured
                        ? `shadow-xl ${c.accent.border} md:flex-row ${c.accent.border.replace("30", "10")}`
                        : c.accent.border
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center ${
                        c.featured ? `bg-gradient-to-br md:w-72` : "py-10"
                      }`}
                    >
                      {c.icon}
                    </div>

                    <div className="flex-1 p-6 md:p-8">
                      {c.featured && (
                        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-400">
                          <Sparkles size={14} />
                          Featured
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-white">{c.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{c.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div
                        className={`mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 ${c.accent.gradient}`}
                      >
                        Open course
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </article>
                </button>
              ))}
            </div>
          </section>

          <footer className="border-t border-slate-800 pt-6 pb-10 text-center text-xs text-slate-500">
            Course Platform · Built with React + Tailwind
          </footer>
        </div>
      </div>
    </div>
  )
}