import {
  ArrowRight,
  ArrowDown,
  Sparkles,
  BookOpen,
  Clock,
  PlayCircle,
  Trophy,
} from "lucide-react"
import { Link } from "react-router-dom"
import { courses, courseProgress } from "../data/courses.tsx"
import { useCourseProgress } from "../data/progress.tsx"
import TopNav from "./TopNav.tsx"
import ProgressBar from "./ProgressBar.tsx"

export default function HomePage() {
  const { keysForCourse } = useCourseProgress()

  const stats = courses.map((c) => ({
    bundle: c,
    progress: courseProgress(c, keysForCourse),
  }))

  const resumed =
    stats
      .filter((s) => s.progress.done > 0 && s.progress.done < s.progress.total)
      .sort((a, b) => b.progress.pct - a.progress.pct)[0] ?? null

  const allDone = stats.filter((s) => s.progress.total > 0 && s.progress.done === s.progress.total)
  const started = stats.filter((s) => s.progress.done > 0)

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 animate-pulse rounded-full bg-violet-500/10 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8">
          <TopNav
            right={
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm dark:text-emerald-300">
                {courses.length} courses live
              </span>
            }
          />

          <header className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center md:py-20">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              Linux · Kotlin · AWS Cloud Practitioner · Hands-on mastery
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
              Courses, built
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                for real learning
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              A structured, milestone-based course platform. Study the complete Linux track,
              the Kotlin Fundamentals phase, and a full AWS Cloud Practitioner (CLF-C02)
              exam-preparation course.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                Browse courses
                <ArrowDown size={16} />
              </a>
              {resumed?.progress.nextHref && (
                <Link
                  to={resumed.progress.nextHref}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                >
                  <PlayCircle size={16} className={resumed.bundle.accent.text} />
                  Continue learning
                </Link>
              )}
            </div>
          </header>

          {resumed && (
            <section className="pb-4">
              <Link
                to={resumed.progress.nextHref!}
                className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between ${resumed.bundle.accent.border} bg-white/60 backdrop-blur-sm dark:bg-slate-900/60`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${resumed.bundle.accent.gradient}`}
                  >
                    <PlayCircle size={22} />
                  </span>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Continue learning
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {resumed.bundle.course.title} · {resumed.progress.pct}% complete
                    </div>
                    <ProgressBar
                      pct={resumed.progress.pct}
                      gradient={resumed.bundle.accent.gradient}
                      className="mt-1.5 w-56"
                    />
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:scale-105 ${resumed.bundle.accent.gradient}`}
                >
                  Resume
                  <ArrowRight size={16} />
                </span>
              </Link>
            </section>
          )}

          {started.length > 0 && (
            <div className="mb-6 mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400" />
                {stats.reduce((a, s) => a + s.progress.done, 0)} lessons completed
              </span>
              <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-500 dark:text-amber-400" />
                {allDone.length} course{allDone.length === 1 ? "" : "s"} finished
              </span>
            </div>
          )}

          <section id="courses" className="pb-20 pt-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Courses</h2>
                <p className="mt-1 text-sm text-slate-500">Pick a track and start learning</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stats.map(({ bundle: c, progress }) => (
                <Link key={c.id} to={`/course/${c.id}`} className="group block h-full text-left">
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/60 ${c.accent.border}`}
                  >
                    <div className="flex items-center justify-center py-8 transition-transform group-hover:scale-105">
                      {c.icon}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      {c.featured && (
                        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          <Sparkles size={14} />
                          Featured
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">{c.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{c.description}</p>

                      {progress.done > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <ProgressBar pct={progress.pct} gradient={c.accent.gradient} className="flex-1" />
                          <span className="shrink-0 font-medium text-slate-700 dark:text-slate-300">
                            {progress.pct}%
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-slate-300 bg-slate-100/60 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                        <div
                          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl ${c.accent.gradient}`}
                        >
                          {progress.done > 0 ? "Continue" : "Start course"}
                          <ArrowRight size={16} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {progress.total} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {c.course.stats.hours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          <footer className="border-t border-slate-200 pt-6 pb-10 text-center text-xs text-slate-500 dark:border-slate-800">
            Course Platform · Built with React + Tailwind
          </footer>
        </div>
      </div>
    </div>
  )
}
