import { useRef, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Layers, PlayCircle, Terminal, Code2, Cloud, CodeXml, ChevronLeft, ChevronRight } from "lucide-react"
import Header from "./Header.tsx"
import ModuleCard from "./ModuleCard.tsx"
import TopNav from "./TopNav.tsx"
import ProgressBar from "./ProgressBar.tsx"
import { lessonDuration } from "../data/courseData.ts"
import { getCourse } from "../data/courses.tsx"
import { useCourseProgress } from "../data/progress.tsx"
import type { Module } from "../types.ts"

function MobileNav({ modules, activeId, onSelect, accentBg }: {
  modules: Module[]
  activeId: number
  onSelect: (id: number) => void
  accentBg: string
}) {
  return (
    <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
      {modules.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
            m.id === activeId
              ? `border-transparent text-slate-950 ${accentBg} shadow-md`
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
          }`}
        >
          M{m.id}
        </button>
      ))}
    </div>
  )
}

export default function CourseDashboard() {
  const { courseId = "" } = useParams()
  const navigate = useNavigate()
  const bundle = getCourse(courseId)
  const { isDone } = useCourseProgress()

  const courseIcons: Record<string, typeof Terminal> = {
    linux: Terminal,
    aws: Cloud,
    html: CodeXml,
  }
  const CourseIcon = (bundle && courseIcons[bundle.id]) ?? Code2

  const nextUp = (() => {
    for (const m of bundle?.modules ?? []) {
      for (let i = 0; i < m.lessons.length; i++) {
        const l = m.lessons[i]
        if (typeof l === "object" && l.content && !isDone(bundle!.id, m.id, i)) {
          return { mod: m, index: i }
        }
      }
    }
    return null
  })()

  const mainRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState(nextUp?.mod.id ?? bundle?.modules[0]?.id ?? 1)

  const selectModule = (id: number) => {
    setActiveId(id)
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  if (!bundle) {
    return (
      <div className="min-h-screen px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">Course not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-900 underline dark:text-white">Back home</Link>
      </div>
    )
  }

  const openLesson = (modId: number, index: number) =>
    navigate(`/course/${bundle.id}/module/${modId}/lesson/${index}`)

  const totalLessons = bundle.course.stats.lessons
  const completedLessons = bundle.modules.reduce((acc, m) => acc + m.lessons.filter((_, i) => isDone(bundle.id, m.id, i)).length, 0)
  const progressPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  const activeIdx = bundle.modules.findIndex((m) => m.id === activeId)
  const activeMod = bundle.modules[activeIdx] ?? bundle.modules[0]
  const prevMod = activeIdx > 0 ? bundle.modules[activeIdx - 1] : null
  const nextMod = activeIdx >= 0 && activeIdx < bundle.modules.length - 1 ? bundle.modules[activeIdx + 1] : null

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 px-4 dark:border-slate-800 md:px-8">
        <TopNav
          crumbs={[{ label: bundle.title }]}
          right={
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:inline-flex">
              <CourseIcon size={14} className={bundle.accent.text} />
              {bundle.title} · The complete course
            </span>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 lg:flex xl:w-80">
          <div className={`shrink-0 border-b p-5 ${bundle.accent.border}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 ${bundle.accent.text}`}>
                <Layers size={14} />
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Modules</span>
            </div>
            <ProgressBar pct={progressPct} gradient={bundle.accent.gradient} className="mt-3" />
            <p className="mt-2.5 text-xs text-slate-500">{completedLessons} of {totalLessons} lessons · {progressPct}%</p>
          </div>
          <div className="thin-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-4">
            {bundle.modules.map((m) => {
              const active = m.id === activeId
              const total = m.lessons.length
              const doneAmt = m.lessons.filter((_, i) => isDone(bundle.id, m.id, i)).length
              return (
                <button
                  key={m.id}
                  onClick={() => selectModule(m.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-left transition-all ${
                    active
                      ? `${bundle.accent.border.replace("/30", "")} bg-slate-100/70 dark:bg-slate-800/50`
                      : "border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      active
                        ? `bg-slate-200 shadow-sm dark:bg-slate-800 ${bundle.accent.text}`
                        : "bg-slate-200 text-slate-500 group-hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    {m.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-medium ${
                        active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {doneAmt}/{total} lessons
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div ref={mainRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10">
            <Header bundle={bundle} />

            <div className="mt-8 lg:hidden">
              <MobileNav
                modules={bundle.modules}
                activeId={activeId}
                onSelect={selectModule}
                accentBg={`bg-gradient-to-r ${bundle.accent.gradient}`}
              />
            </div>

            {nextUp && (
              <section
                className={`mt-8 flex flex-col gap-5 overflow-hidden rounded-2xl border p-6 md:flex-row md:items-center md:justify-between ${bundle.accent.border} bg-gradient-to-r from-slate-50 via-slate-50 to-slate-50 shadow-lg dark:from-slate-900 dark:via-slate-900 dark:to-slate-900`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform hover:scale-110 ${bundle.accent.gradient}`}
                  >
                    <PlayCircle size={26} />
                  </span>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Continue learning
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {nextUp.mod.title}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-400">
                      Up next: {nextUp.mod.lessons[nextUp.index].name} ·{" "}
                      {lessonDuration(nextUp.mod.lessons[nextUp.index])} min
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openLesson(nextUp.mod.id, nextUp.index)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl ${bundle.accent.gradient}`}
                >
                  Start lesson
                </button>
              </section>
            )}

            <div ref={panelRef} className="mt-8 scroll-mt-6">
              <ModuleCard
                key={activeMod.id}
                mod={activeMod}
                courseId={bundle.id}
                onOpenLesson={(i) => openLesson(activeMod.id, i)}
                defaultExpanded
                nextLessonIndex={nextUp?.mod.id === activeMod.id ? nextUp.index : undefined}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                disabled={!prevMod}
                onClick={() => prevMod && selectModule(prevMod.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition enabled:hover:border-slate-400 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:enabled:hover:border-slate-600 dark:enabled:hover:text-white"
              >
                <ChevronLeft size={16} />
                {prevMod ? prevMod.title : "First module"}
              </button>
              <button
                disabled={!nextMod}
                onClick={() => nextMod && selectModule(nextMod.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition enabled:hover:border-slate-400 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:enabled:hover:border-slate-600 dark:enabled:hover:text-white"
              >
                {nextMod ? nextMod.title : "Last module"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
