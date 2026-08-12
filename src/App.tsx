import { useState } from "react"
import HomePage from "./components/HomePage.tsx"
import CourseDashboard from "./components/CourseDashboard.tsx"
import { getCourse } from "./data/courses.tsx"
import "./index.css"

export default function App() {
  const [courseId, setCourseId] = useState<string | null>(null)

  const bundle = courseId ? getCourse(courseId) : undefined

  if (bundle) {
    return <CourseDashboard bundle={bundle} onBack={() => setCourseId(null)} />
  }

  return <HomePage onOpenCourse={setCourseId} />
}