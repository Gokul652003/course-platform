import { useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react"
import { lessonDuration } from "../data/courseData.ts"
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
        <Link to={`/course/${courseId}`} className="mt-4 inline-block text-sm text-white underline">
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

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to={`/course/${courseId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <ArrowLeft size={16} />
          All modules
        </Link>
        <span className="text-xs text-slate-500">
          Module {mod.id} · {mod.title}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-5 md:px-8">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-400">
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
              {done ? <CheckCircle2 size={16} /> : <Check size={16} />}
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
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
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
    </div>
  )
}