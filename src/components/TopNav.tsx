import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { GraduationCap, ChevronRight, LogOut, Sun, Moon } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../data/auth.tsx"
import { useTheme } from "../data/theme.tsx"
import SearchPalette, { SearchTrigger } from "./SearchPalette.tsx"

export interface Crumb {
  label: string
  to?: string
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24 C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}

function AuthControl() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
      >
        <GoogleIcon />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    )
  }

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Account"
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <button
      onClick={() => signOut()}
      title="Sign out"
      className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-6 w-6 rounded-full" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white dark:bg-slate-700">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
      <LogOut size={13} className="shrink-0 text-slate-400 transition group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white" />
    </button>
  )
}

export default function TopNav({ crumbs = [], right }: { crumbs?: Crumb[]; right?: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <nav className="flex items-center justify-between gap-4 py-6">
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
            <GraduationCap size={24} />
          </span>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-slate-900 dark:text-white">Course Platform</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Learn at your own pace</div>
          </div>
        </Link>

        {crumbs.map((c, i) => (
          <span key={i} className="flex min-w-0 items-center gap-2">
            <ChevronRight size={14} className="shrink-0 text-slate-300 dark:text-slate-700" />
            {c.to ? (
              <Link
                to={c.to}
                className="truncate text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {c.label}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{c.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {right}
        <SearchTrigger onClick={() => setSearchOpen(true)} />
        <ThemeToggle />
        <AuthControl />
      </div>
    </nav>
  )
}
