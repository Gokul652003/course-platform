import { courses } from "./courses.tsx"

export interface SearchItem {
  type: "course" | "module" | "lesson"
  title: string
  breadcrumb: string
  href: string
  accentText: string
  keywords: string
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = []

  for (const c of courses) {
    items.push({
      type: "course",
      title: c.title,
      breadcrumb: c.tagline,
      href: `/course/${c.id}`,
      accentText: c.accent.text,
      keywords: `${c.title} ${c.tagline} ${c.tags.join(" ")}`.toLowerCase(),
    })

    for (const m of c.modules) {
      items.push({
        type: "module",
        title: m.title,
        breadcrumb: c.title,
        href: `/course/${c.id}`,
        accentText: c.accent.text,
        keywords: `${m.title} ${c.title}`.toLowerCase(),
      })

      m.lessons.forEach((l, i) => {
        items.push({
          type: "lesson",
          title: l.name,
          breadcrumb: `${c.title} · ${m.title}`,
          href: `/course/${c.id}/module/${m.id}/lesson/${i}`,
          accentText: c.accent.text,
          keywords: `${l.name} ${l.intro} ${m.title} ${c.title}`.toLowerCase(),
        })
      })
    }
  }

  return items
}

let index: SearchItem[] | null = null

function getIndex(): SearchItem[] {
  if (!index) index = buildIndex()
  return index
}

const TYPE_RANK: Record<SearchItem["type"], number> = { lesson: 0, module: 1, course: 2 }

export function searchCourses(query: string, limit = 8): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored: { item: SearchItem; score: number }[] = []

  for (const item of getIndex()) {
    const title = item.title.toLowerCase()
    let score: number
    if (title === q) score = 0
    else if (title.startsWith(q)) score = 1
    else if (title.includes(q)) score = 2
    else if (item.keywords.includes(q)) score = 3
    else continue

    scored.push({ item, score: score * 10 + TYPE_RANK[item.type] })
  }

  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map((s) => s.item)
}
