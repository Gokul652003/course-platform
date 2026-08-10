import { useState } from "react"
import { GraduationCap, ArrowLeft, Terminal } from "lucide-react"
import Header from "./Header.tsx"
import Sidebar from "./Sidebar.tsx"
import ModuleCard from "./ModuleCard.tsx"
import LessonPage from "./LessonPage.tsx"
import { modules } from "../data/courseData.ts"

function MobileNav({ activeId, onSelect }: { activeId: number; onSelect: (id: number) => void }) {
  return (
    <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
      {modules.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
            m.id === activeId
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-slate-800 bg-slate-900 text-slate-400"
          }`}
        >
          M{m.id}
        </button>
      ))}
    </div>
  )
}

export default function CourseDashboard({ onBack }: { onBack: () => void }) {
  const [activeId, setActiveId] = useState(1)
  const [lessonModuleId, setLessonModuleId] = useState<number | null>(null)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(() => {
    const done = new Set<string>()
    modules.forEach((m) => {
      if (m.status === "complete") {
        m.lessons.forEach((l, i) => {
          if (typeof l === "object" && l.content) done.add(`${m.id}:${i}`)
        })
      }
    })
    return done
  })

  const activeModule = modules.find((m) => m.id === activeId)
  const openLesson = (modId: number, index: number) => {
    setLessonModuleId(modId)
    setLessonIndex(index)
  }

  const lessonMod = lessonModuleId !== null ? modules.find((m) => m.id === lessonModuleId) : null

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
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
              <GraduationCap size={24} />
            </span>
            <div>
              <div className="text-lg font-bold text-white">Course Platform</div>
              <div className="text-xs text-slate-500">Course dashboard</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
              <Terminal size={14} className="text-emerald-400" />
              Linux · The complete course
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <Sidebar activeId={activeId} onSelect={handleModuleSelect} />

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
                <Header />
                <div className="mt-8 lg:hidden">
                  <MobileNav activeId={activeId} onSelect={handleModuleSelect} />
                </div>
                <div className="mb-4 mt-8 flex items-center justify-between lg:mt-8">
                  <h2 className="text-xl font-bold text-white">Course Modules</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-1 xl:grid-cols-2">
                  {modules.map((m) => (
                    <ModuleCard
                      key={m.id}
                      mod={m}
                      onOpenLesson={(i) => openLesson(m.id, i)}
                      isDone={(i) => isLessonDone(m.id, i)}
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