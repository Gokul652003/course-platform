import {
  GraduationCap,
  ArrowRight,
  ArrowDown,
  Sparkles,
  BookOpen,
  Clock,
  Award,
} from "lucide-react"
import { Link } from "react-router-dom"
import { courses } from "../data/courses.tsx"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 animate-pulse rounded-full bg-violet-500/10 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-110">
                <GraduationCap size={24} />
              </span>
              <div>
                <div className="text-lg font-bold text-white">Course Platform</div>
                <div className="text-xs text-slate-500">Learn at your own pace</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-sm">
              {courses.length} courses live
            </span>
          </nav>

          <header className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center md:py-24">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
              <Sparkles size={14} className="text-emerald-400" />
              Linux · Kotlin · Hands-on mastery
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              Courses, built
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                {" "}
                for real learning
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              A structured, milestone-based course platform. Study the complete Linux track and
              the Kotlin Fundamentals phase, with hands-on practice files alongside.
            </p>
            <a
              href="#courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Browse courses
              <ArrowDown size={16} />
            </a>
          </header>

          <section id="courses" className="pb-20 pt-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Browse Courses</h2>
                <p className="mt-1 text-sm text-slate-500">Pick a track and start learning</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/course/${c.id}`}
                  className={`text-left transition-all hover:-translate-y-1 ${
                    c.featured ? "md:col-span-2" : ""
                  }`}
                >
                  <article
                    className={`flex flex-col overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur-sm transition-all hover:shadow-xl ${
                      c.featured
                        ? `shadow-lg ${c.accent.border} md:flex-row ${c.accent.border.replace("30", "10")} hover:shadow-emerald-500/10`
                        : c.accent.border
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center transition-all ${
                        c.featured ? `bg-gradient-to-br md:w-72 hover:scale-105` : "py-10 hover:scale-110"
                      }`}
                    >
                      {c.icon}
                    </div>

                    <div className="flex-1 p-6 md:p-8">
                      {c.featured && (
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          <Sparkles size={14} />
                          Featured
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-emerald-300">{c.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center gap-4">
                        <div
                          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl ${c.accent.gradient}`}
                        >
                          Open course
                          <ArrowRight size={16} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {c.course.stats.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {c.course.stats.hours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={14} />
                            {c.course.stats.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
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