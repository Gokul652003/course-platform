import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react"
import { lessonDuration } from "../data/courseData.ts"
import type { Module } from "../types.ts"

interface LessonPageProps {
  mod: Module
  lessonIndex: number
  onSelect: (index: number) => void
  onBack: () => void
  isDone: (index: number) => boolean
  onToggleDone: (index: number) => void
}

export default function LessonPage({ mod, lessonIndex, onSelect, onBack, isDone, onToggleDone }: LessonPageProps) {
  const lesson = mod.lessons[lessonIndex]
  const total = mod.lessons.length
  const next = lessonIndex + 1 < total
  const done = isDone(lessonIndex)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [lessonIndex])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight" && next) onSelect(lessonIndex + 1)
      if (e.key === "ArrowLeft" && lessonIndex > 0) onSelect(lessonIndex - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lessonIndex, next, onSelect])

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <ArrowLeft size={16} />
          All modules
        </button>
        <span className="text-xs text-slate-500">
          Module {mod.id} · {mod.title}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-5 md:px-8">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
              style={{ width: `${((lessonIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                Lesson {lessonIndex + 1} of {total}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{lesson.name}</h1>
              <div className="mt-1.5 text-sm text-slate-500">
                {lessonDuration(lesson)} min read
                {lesson.intro && <span className="mx-2">·</span>}
                {lesson.intro && <span className="text-slate-400">{lesson.intro}</span>}
              </div>
            </div>

            <button
              onClick={() => onToggleDone(lessonIndex)}
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
          <button
            onClick={() => lessonIndex > 0 && onSelect(lessonIndex - 1)}
            disabled={lessonIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition enabled:hover:border-slate-500 enabled:hover:text-white disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {next ? (
            <button
              onClick={() => onSelect(lessonIndex + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
            >
              Next lesson
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <CheckCircle2 size={16} />
              Finish module · All modules
            </button>
          )}
        </div>
      </div>
    </div>
  )
}