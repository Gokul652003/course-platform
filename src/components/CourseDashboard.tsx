import { useState } from "react"
import { GraduationCap, ArrowLeft, ArrowRight, PlayCircle, Terminal, Code2 } from "lucide-react"
import Header from "./Header.tsx"
import Sidebar from "./Sidebar.tsx"
import ModuleCard from "./ModuleCard.tsx"
import LessonPage from "./LessonPage.tsx"
import { lessonDuration } from "../data/courseData.ts"
import type { CourseBundle } from "../data/courses.tsx"
import type { Module } from "../types.ts"

function MobileNav({
  modules,
  activeId,
  onSelect,
  accentBg,
}: {
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
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
            m.id === activeId
              ? `border-transparent text-slate-950 ${accentBg}`
              : "border-slate-800 bg-slate-900 text-slate-400"
          }`}
        >
          M{m.id}
        </button>
      ))}
    </div>
  )
}

export default function CourseDashboard({ bundle, onBack }: { bundle: CourseBundle; onBack: () => void }) {
  const [activeId, setActiveId] = useState(1)
  const [lessonModuleId, setLessonModuleId] = useState<number | null>(null)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(() => {
    const done = new Set<string>()
    bundle.modules.forEach((m) => {
      if (m.status === "complete") {
        m.lessons.forEach((l, i) => {
          if (typeof l === "object" && l.content) done.add(`${m.id}:${i}`)
        })
      }
    })
    return done
  })

  const activeModule = bundle.modules.find((m) => m.id === activeId)
  const openLesson = (modId: number, index: number) => {
    setLessonModuleId(modId)
    setLessonIndex(index)
  }

  const lessonMod =
    lessonModuleId !== null ? bundle.modules.find((m) => m.id === lessonModuleId) : null

  const toggleDone = (index: number) => {
    if (!lessonMod) return
    const key = `${lessonMod.id}:${index}`
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const isLessonDone = (modId: number, index: number) => completed.has(`${modId}:${index}`)

  const handleModuleSelect = (id: number) => {
    setActiveId(id)
    setLessonModuleId(null)
  }

  const isLinux = bundle.id === "linux"
  const CourseIcon = isLinux ? Terminal : Code2

  const nextUp = (() => {
    for (const m of bundle.modules) {
      for (let i = 0; i < m.lessons.length; i++) {
        const l = m.lessons[i]
        if (typeof l === "object" && l.content && !isLessonDone(m.id, i)) {
          return { mod: m, index: i }
        }
      }
    }
    return null
  })()

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </button>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white ${bundle.accent.gradient}`}
            >
              <GraduationCap size={24} />
            </span>
            <div>
              <div className="text-lg font-bold text-white">Course Platform</div>
              <div className="text-xs text-slate-500">Course dashboard</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
              <CourseIcon size={14} className={bundle.accent.text} />
              {isLinux ? "Linux · The complete course" : "Kotlin · The complete course"}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <Sidebar bundle={bundle} activeId={activeId} onSelect={handleModuleSelect} />

          <main>
            {lessonMod ? (
              <LessonPage
                mod={lessonMod}
                lessonIndex={lessonIndex}
                onSelect={setLessonIndex}
                onBack={() => setLessonModuleId(null)}
                isDone={(i) => isLessonDone(lessonMod.id, i)}
                onToggleDone={toggleDone}
              />
            ) : (
              <>
                <Header bundle={bundle} />
                <div className="mt-8 lg:hidden">
                  <MobileNav
                    modules={bundle.modules}
                    activeId={activeId}
                    onSelect={handleModuleSelect}
                    accentBg={bundle.id === "linux" ? "bg-emerald-500/15" : "bg-violet-500/15"}
                  />
                </div>

                {nextUp && (
                  <section
                    className={`mt-8 flex flex-col gap-5 overflow-hidden rounded-2xl border p-6 md:flex-row md:items-center md:justify-between ${bundle.accent.border} bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900`}
                  >
                    <div className="pointer-events-none absolute hidden" />
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${bundle.accent.gradient}`}
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
                      className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 ${bundle.accent.gradient}`}
                    >
                      Start lesson
                      <ArrowRight size={16} />
                    </button>
                  </section>
                )}

                <div className="mb-4 mt-8 flex items-center justify-between lg:mt-8">
                  <h2 className="text-xl font-bold text-white">Course Modules</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-1 xl:grid-cols-2">
                  {bundle.modules.map((m) => (
                    <ModuleCard
                      key={m.id}
                      mod={m}
                      onOpenLesson={(i) => openLesson(m.id, i)}
                      isDone={(i) => isLessonDone(m.id, i)}
                      defaultExpanded={nextUp?.mod.id === m.id}
                      nextLessonIndex={nextUp?.mod.id === m.id ? nextUp.index : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          {lessonMod
            ? `Reading Lesson ${lessonIndex + 1} · ${lessonMod.title}`
            : activeModule
            ? `Currently viewing Module ${activeModule.id} · ${activeModule.title}`
            : ""}{" "}
          · Built with React + Tailwind
        </footer>
      </div>
    </div>
  )
}