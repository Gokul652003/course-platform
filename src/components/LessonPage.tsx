import { useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { lessonDuration, lessonCount, lessonsDoneCount } from "../data/courseData.ts"
import { getCourse } from "../data/courses.tsx"
import { useCourseProgress } from "../data/progress.tsx"
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
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [lessonIndex])

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
        <p className="text-slate-400">Lesson not found.</p>
        <Link to={`/course/${courseId}`} className="mt-4 inline-block text-sm font-medium text-white underline">
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

  const courseDoneTotal = bundle.modules.reduce((acc, m) => acc + lessonsDoneCount(m), 0)
  const lessonsTotal = bundle.modules.reduce((acc, m) => acc + lessonCount(m), 0)
  const courseDonePct = Math.round((courseDoneTotal / Math.max(lessonsTotal, 1)) * 100)

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to={`/course/${courseId}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft size={16} />
            {bundle.title}
          </Link>
          <span className="text-xs text-slate-500">
            Module {mod.id} · {mod.title}
          </span>
        </div>

        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
          {mod.lessons.map((_l, i) => (
            <Link
              key={i}
              to={`/course/${courseId}/module/${modId}/lesson/${i}`}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                i === index
                  ? `border-transparent text-slate-950 bg-gradient-to-r ${bundle.accent.gradient}`
                  : isDone(courseId, modId, i)
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="border-b border-slate-800 p-4">
                <span className="text-sm font-semibold text-white">Course explorer</span>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all ${bundle.accent.gradient}`}
                    style={{ width: `${courseDonePct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{courseDonePct}% · {courseDoneTotal} lessons done</p>
              </div>
              <nav className="space-y-1 p-3">
                {bundle.modules.map((m) => {
                  const doneAmt = lessonsDoneCount(m)
                  return (
                    <div key={m.id} className={m.id === modId ? "" : "opacity-70"}>
                      <button
                        onClick={() => navigate(`/course/${courseId}/module/${m.id}/lesson/0`)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800/60"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          <span className="text-xs text-slate-500">M{m.id} · </span>
                          {m.title}
                        </span>
                        <span className="ml-2 shrink-0 text-[10px] text-slate-500">
                          {doneAmt}/{lessonCount(m)}
                        </span>
                      </button>
                      {m.id === modId && (
                        <div className="space-y-0.5 pb-2">
                          {m.lessons.map((l, i) => {
                            const isCurrent = i === index
                            const isItDone = isDone(courseId, m.id, i)
                            return (
                              <Link
                                key={i}
                                to={`/course/${courseId}/module/${m.id}/lesson/${i}`}
                                className={`flex items-center gap-2 rounded-lg py-1.5 pl-5 pr-2 text-xs transition ${
                                  isCurrent
                                    ? `${bundle.accent.text} bg-slate-800/80`
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                }`}
                              >
                                <span className="w-4 shrink-0 text-center">
                                  {isItDone ? (
                                    <CheckCircle2 size={13} className="text-emerald-400" />
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
            </div>
          </aside>

          <main>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className={`border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 px-6 py-5 md:px-8 ${bundle.accent.border}`}>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all ${bundle.accent.gradient}`}
                    style={{ width: `${((index + 1) / total) * 100}%` }}
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className={`text-xs font-medium uppercase tracking-wide ${bundle.accent.text}`}>
                      Lesson {index + 1} of {total}
                    </div>
                    <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{lesson.name}</h1>
                    <div className="mt-1.5 text-sm text-slate-500">
                      {lessonDuration(lesson)} min read
                      {lesson.intro && <span className="mx-2">·</span>}
                      {lesson.intro && <span className="text-slate-400">{lesson.intro}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDone(courseId, modId, index)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      done
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300"
                    }`}
                  >
                    {done ? <CheckCircle2 size={16} /> : <CheckCircle2 size={16} />}
                    {done ? "Completed" : "Mark complete"}
                  </button>
                </div>
              </div>

              <div className="prose-mod px-6 py-6 md:px-8">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/80 px-6 py-5 md:px-8">
                {prevLink ? (
                  <Link
                    to={prevLink}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </Link>
                ) : (
                  <span />
                )}

                {nextLink ? (
                  <Link
                    to={nextLink}
                    className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 ${bundle.accent.gradient}`}
                  >
                    Next lesson
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link
                    to={`/course/${courseId}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 size={16} />
                    Finish course · All modules
                  </Link>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}