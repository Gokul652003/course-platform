export default function ProgressBar({
  pct,
  gradient = "from-emerald-500 to-cyan-500",
  size = "md",
  className = "",
}: {
  pct: number
  gradient?: string
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${size === "sm" ? "h-1" : "h-1.5"} ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all ${gradient}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}
