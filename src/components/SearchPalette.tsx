import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, BookOpen, Layers, PlayCircle, CornerDownLeft } from "lucide-react"
import { searchCourses, type SearchItem } from "../data/search.ts"

const TYPE_ICON: Record<SearchItem["type"], typeof BookOpen> = {
  course: BookOpen,
  module: Layers,
  lesson: PlayCircle,
}

const TYPE_LABEL: Record<SearchItem["type"], string> = {
  course: "Course",
  module: "Module",
  lesson: "Lesson",
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Search (Ctrl+K)"
      aria-label="Search"
      className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
    >
      <Search size={14} />
      <span className="hidden text-xs font-medium sm:inline">Search</span>
      <kbd className="hidden rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        Ctrl K
      </kbd>
    </button>
  )
}

export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => searchCourses(query), [query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const select = (item: SearchItem) => {
    navigate(item.href)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = results[activeIndex]
        if (item) select(item)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, modules, lessons..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto thin-scroll">
          {query.trim() === "" ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Start typing to search across every course
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="p-1.5">
              {results.map((item, i) => {
                const Icon = TYPE_ICON[item.type]
                const active = i === activeIndex
                return (
                  <li key={`${item.type}-${item.href}-${item.title}`}>
                    <button
                      onClick={() => select(item)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-slate-100 dark:bg-slate-800" : ""
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ${item.accentText}`}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {TYPE_LABEL[item.type]} · {item.breadcrumb}
                        </span>
                      </span>
                      {active && <CornerDownLeft size={13} className="shrink-0 text-slate-400" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
