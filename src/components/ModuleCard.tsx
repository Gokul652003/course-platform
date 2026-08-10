import { statusMeta, lessonCount, lessonsDoneCount } from "../data/courseData.ts"
import type { StatusMeta } from "../data/courseData.ts"
import { Clock, ChevronRight, Check, Lock } from "lucide-react"
import type { Lesson, Module, ModuleStatus } from "../types.ts"

const barGradient = {
  emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  amber: "bg-gradient-to-r from-amber-400 to-amber-600",
  slate: "bg-slate-700",
}

const accentBar = {
  emerald: "bg-gradient-to-r from-emerald-500 to-cyan-500",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500",
  slate: "bg-slate-700",
}

interface LessonTileProps {
  lesson: Lesson | string
  index: number
  status: ModuleStatus
  done: boolean
  onOpen: (index: number) => void
}

function LessonTile({ lesson, index, status, done, onOpen }: LessonTileProps) {
  const isInProgress = status === "in_progress"
  const hasContent = lesson !== null && typeof lesson === "object" && !!lesson.content
  const pending = isInProgress && !done
  const locked = status === "upcoming"
  const name = typeof lesson === "string" ? lesson : lesson.name

  return (
    <button
      onClick={() => hasContent && onOpen(index)}
      disabled={!hasContent}
      className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
        hasContent
          ? "border-slate-800 bg-slate-950/50 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-emerald-500/5"
          : locked
          ? "border-slate-800/60 bg-slate-950/20 cursor-default"
          : "border-slate-800/60 bg-slate-950/20 cursor-default"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          done
            ? "bg-emerald-500 text-slate-950"
            : pending
            ? "border-2 border-amber-400/70 text-amber-300"
            : hasContent
            ? "bg-slate-800 text-slate-300"
            : "bg-slate-800/60 text-slate-500"
        }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : locked ? <Lock size={13} /> : index + 1}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-medium ${
            done ? "text-slate-100" : hasContent ? "text-slate-200" : "text-slate-400"
          }`}
        >
          {name}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
          {hasContent && typeof lesson === "object" ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {lesson.minutes || 8} min
              </span>
              <span className="h-3 w-px bg-slate-700" />
              <span className={done ? "text-emerald-400" : ""}>
                {done ? "Completed" : "Not started"}
              </span>
            </>
          ) : locked ? (
            <span>Locked</span>
          ) : pending ? (
            <span className="text-amber-400/80">In progress</span>
          ) : (
            <span>{done ? "Completed" : "Queued"}</span>
          )}
        </span>
      </span>

      {hasContent && (
        <ChevronRight
          size={16}
          className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400"
        />
      )}
    </button>
  )
}

interface ModuleCardProps {
  mod: Module
  onOpenLesson: (index: number) => void
  isDone?: (index: number) => boolean
}

export default function ModuleCard({ mod, onOpenLesson, isDone }: ModuleCardProps) {
  const meta: StatusMeta = statusMeta[mod.status]
  const total = lessonCount(mod)
  const doneCount = lessonsDoneCount(mod)
  const barPct = Math.round((doneCount / total) * 100)
  const showTiles =
    mod.status === "in_progress" || mod.lessons.some((l) => typeof l === "object" && l.content)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-all hover:border-slate-700 hover:bg-slate-900">
      <div className={`h-1 ${accentBar[meta.color]}`} />

      <div className="flex items-center gap-4 p-5 pb-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.ring} ${meta.color === "emerald" ? "bg-emerald-500/15" : meta.color === "amber" ? "bg-amber-500/15" : "bg-slate-800/80"}`}
        >
          <meta.icon
            size={22}
            className={
              meta.color === "emerald"
                ? "text-emerald-400"
                : meta.color === "amber"
                ? "text-amber-400"
                : "text-slate-400"
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Module {mod.id}
          </div>
          <h3 className="truncate text-lg font-semibold text-white">{mod.title}</h3>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.badge}`}
        >
          <meta.icon size={12} className="mr-1 inline" />
          {meta.label}
        </span>
      </div>

      <div className="px-5 pb-1">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>
            {doneCount} / {total} lessons
          </span>
          <span className="font-semibold text-slate-400">{barPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${barGradient[meta.color]}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex-1 px-4 pb-4">
        {showTiles ? (
          <div>
            <div className="grid gap-2 sm:grid-cols-1">
              {mod.lessons.map((l, i) => (
                <LessonTile
                  key={i}
                  lesson={l}
                  index={i}
                  status={mod.status}
                  done={isDone ? isDone(i) : (l && l.done) === true}
                  onOpen={onOpenLesson}
                />
              ))}
            </div>
            {mod.status === "in_progress" && total - doneCount > 0 && (
              <p className="mt-3 flex items-center gap-1.5 px-2 text-xs font-medium text-amber-400/90">
                <Clock size={13} />
                {total - doneCount} lessons remaining in this module
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-3">
            <span className="text-sm text-slate-400">{total} lessons</span>
            <span className="flex gap-1.5">
              {Array.from({ length: Math.min(total, 6) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${
                    meta.color === "emerald" ? "bg-emerald-500/70" : "bg-slate-800"
                  }`}
                />
              ))}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}