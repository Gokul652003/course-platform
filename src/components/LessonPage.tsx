import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, PanelLeftClose, PanelLeft } from "lucide-react"
import { lessonDuration, lessonCount } from "../data/courseData.ts"
import { getCourse } from "../data/courses.tsx"
import { useCourseProgress } from "../data/progress.tsx"
import TopNav from "./TopNav.tsx"
import ProgressBar from "./ProgressBar.tsx"
import type { Module } from "../types.ts"

function findLessonTarget(
  bundleModules: Module[],
  fromModId: number,
  fromIndex: number,
  offset: number,
): { modId: number; index: number } | null {
  let modIdx = bundleModules.findIndex((m) => m.id === fromModId)
  let index = fromIndex
  for (let hops = 0; hops < bundleModules.length; hops++) {
    const lessons = bundleModules[modIdx].lessons
    if (offset > 0) {
      if (index + 1 < lessons.length) return { modId: bundleModules[modIdx].id, index: index + 1 }
      if (modIdx + 1 < bundleModules.length) {
        modIdx += 1
        index = 0
        continue
      }
    } else {
      if (index > 0) return { modId: bundleModules[modIdx].id, index: index - 1 }
      if (modIdx > 0) {
        modIdx -= 1
        index = bundleModules[modIdx].lessons.length - 1
        continue
      }
    }
    return null
  }
  return null
}

export default function LessonPage() {
  const { courseId = "", moduleId = "", lessonIndex = "" } = useParams()
  const navigate = useNavigate()
  const bundle = getCourse(courseId)
  const { isDone, toggleDone } = useCourseProgress()

  const modId = Number(moduleId)
  const index = Number(lessonIndex)
  const mod = bundle?.modules.find((m) => m.id === modId)
  const lesson = mod?.lessons[index]
  const done = isDone(courseId, modId, index)
  const mainRef = useRef<HTMLDivElement>(null)
  const activeModuleRef = useRef<HTMLButtonElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [lessonIndex])

  useEffect(() => {
    activeModuleRef.current?.scrollIntoView({ block: "nearest" })
  }, [modId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!bundle || lessonIndex === "") return
      if (e.key === "ArrowRight") {
        const next = findLessonTarget(bundle.modules, modId, index, 1)
        if (next) navigate(`/course/${courseId}/module/${next.modId}/lesson/${next.index}`)
      }
      if (e.key === "ArrowLeft") {
        const prev = findLessonTarget(bundle.modules, modId, index, -1)
        if (prev) navigate(`/course/${courseId}/module/${prev.modId}/lesson/${prev.index}`)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [bundle, courseId, modId, index, lessonIndex, navigate])

  if (!bundle || !mod || !lesson || lessonIndex === "") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">Lesson not found.</p>
        <Link to={`/course/${courseId}`} className="mt-4 inline-block text-sm font-medium text-slate-900 underline dark:text-white">
          Back to course
        </Link>
      </div>
    )
  }

  const total = mod.lessons.length
  const next = findLessonTarget(bundle.modules, modId, index, 1)
  const prev = findLessonTarget(bundle.modules, modId, index, -1)
  const nextLink = next ? `/course/${courseId}/module/${next.modId}/lesson/${next.index}` : null
  const prevLink = prev ? `/course/${courseId}/module/${prev.modId}/lesson/${prev.index}` : null
  const nextLesson = next ? bundle.modules.find((m) => m.id === next.modId)?.lessons[next.index] : null
  const prevLesson = prev ? bundle.modules.find((m) => m.id === prev.modId)?.lessons[prev.index] : null
  const nextCrossesModule = next ? next.modId !== modId : false
  const prevCrossesModule = prev ? prev.modId !== modId : false

  const courseDoneTotal = bundle.modules.reduce(
    (acc, m) => acc + m.lessons.filter((_, i) => isDone(courseId, m.id, i)).length,
    0,
  )
  const lessonsTotal = bundle.modules.reduce((acc, m) => acc + lessonCount(m), 0)
  const courseDonePct = Math.round((courseDoneTotal / Math.max(lessonsTotal, 1)) * 100)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 px-4 dark:border-slate-800 md:px-8">
        <TopNav
          crumbs={[
            { label: bundle.title, to: `/course/${courseId}` },
            { label: mod.title },
          ]}
          right={
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="hidden items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white lg:inline-flex"
              aria-label={sidebarOpen ? "Hide course explorer" : "Show course explorer"}
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </button>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 lg:flex xl:w-80">
            <div className={`shrink-0 border-b p-5 ${bundle.accent.border}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 ${bundle.accent.text}`}>
                  <BookOpen size={14} />
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Course explorer</span>
              </div>
              <ProgressBar pct={courseDonePct} gradient={bundle.accent.gradient} className="mt-3" />
              <p className="mt-2.5 text-xs text-slate-500">{courseDonePct}% · {courseDoneTotal} lessons done</p>
            </div>
            <nav className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              {bundle.modules.map((m) => {
                const modTotal = lessonCount(m)
                const doneAmt = m.lessons.filter((_, i) => isDone(courseId, m.id, i)).length
                const modComplete = modTotal > 0 && doneAmt === modTotal
                const isActiveModule = m.id === modId
                return (
                  <div key={m.id} className={isActiveModule ? "" : "opacity-60"}>
                    <button
                      ref={isActiveModule ? activeModuleRef : undefined}
                      onClick={() => navigate(`/course/${courseId}/module/${m.id}/lesson/0`)}
                      className={`flex w-full flex-col gap-2 rounded-xl border-l-2 px-3 py-2.5 text-left transition hover:bg-slate-100/70 dark:hover:bg-slate-800/60 ${
                        isActiveModule ? bundle.accent.border.replace("/30", "") : "border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                            modComplete
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : isActiveModule
                                ? `bg-slate-200 dark:bg-slate-800 ${bundle.accent.text}`
                                : "bg-slate-200/70 text-slate-500 dark:bg-slate-800/70"
                          }`}
                        >
                          {modComplete ? <Check size={13} strokeWidth={3} /> : m.id}
                        </span>
                        <span className={`min-w-0 flex-1 truncate text-sm ${isActiveModule ? "font-medium text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                          {m.title}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 pl-8">
                        <ProgressBar
                          pct={modTotal ? (doneAmt / modTotal) * 100 : 0}
                          gradient={bundle.accent.gradient}
                          size="sm"
                          className="flex-1"
                        />
                        <span className="shrink-0 text-[10px] text-slate-500">
                          {doneAmt}/{modTotal}
                        </span>
                      </span>
                    </button>
                    {isActiveModule && (
                      <div className="mt-1.5 space-y-1 pb-2">
                        {m.lessons.map((l, i) => {
                          const isCurrent = i === index
                          const isItDone = isDone(courseId, m.id, i)
                          return (
                            <Link
                              key={i}
                              to={`/course/${courseId}/module/${m.id}/lesson/${i}`}
                              className={`flex items-center gap-2.5 rounded-lg py-2.5 pl-8 pr-3 text-[13px] transition ${
                                isCurrent
                                  ? `${bundle.accent.text} bg-slate-200/80 font-medium dark:bg-slate-800/80`
                                  : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                              }`}
                            >
                              <span className="w-4 shrink-0 text-center">
                                {isItDone ? (
                                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  i + 1
                                )}
                              </span>
                              <span className="truncate">{l.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>
        )}

        <div ref={mainRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8 md:px-10 md:py-12">
            <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
              {mod.lessons.map((_l, i) => (
                <Link
                  key={i}
                  to={`/course/${courseId}/module/${modId}/lesson/${i}`}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    i === index
                      ? `border-transparent text-slate-950 bg-gradient-to-r ${bundle.accent.gradient}`
                      : isDone(courseId, modId, i)
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-300 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-wide ${bundle.accent.text}`}>
                  <span>Lesson {index + 1} of {total}</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="normal-case text-slate-500">Module {mod.id}: {mod.title}</span>
                </div>
                <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 md:text-4xl dark:text-white">{lesson.name}</h1>
                <div className="mt-2 text-sm text-slate-500">
                  {lessonDuration(lesson)} min read
                  {lesson.intro && <span className="mx-2">·</span>}
                  {lesson.intro && <span className="text-slate-600 dark:text-slate-400">{lesson.intro}</span>}
                </div>
              </div>

              <button
                onClick={() => toggleDone(courseId, modId, index)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  done
                    ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                    : `border border-transparent bg-gradient-to-r text-white shadow-lg hover:scale-105 hover:shadow-xl ${bundle.accent.gradient}`
                }`}
              >
                <CheckCircle2 size={16} />
                {done ? "Completed" : "Mark complete"}
              </button>
            </div>

            <div className="prose-mod">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-2">
              {prevLink && prevLesson ? (
                <Link
                  to={prevLink}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 px-6 py-5 transition hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                >
                  <ArrowLeft size={18} className="shrink-0 text-slate-400 transition group-hover:-translate-x-0.5 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Previous{prevCrossesModule ? " · new module" : ""}
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
                      {prevLesson.name}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextLink && nextLesson ? (
                <Link
                  to={nextLink}
                  className={`group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r px-6 py-5 text-right shadow-lg transition hover:brightness-110 ${bundle.accent.gradient}`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-white/70">
                      Next{nextCrossesModule ? " · new module" : ""}
                    </div>
                    <div className="truncate text-sm font-semibold text-white">{nextLesson.name}</div>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-white transition group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  to={`/course/${courseId}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
                >
                  <CheckCircle2 size={16} />
                  Finish course · All modules
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
