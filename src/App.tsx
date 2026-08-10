import { useState } from "react"
import HomePage from "./components/HomePage.tsx"
import CourseDashboard from "./components/CourseDashboard.tsx"
import "./index.css"

export default function App() {
  const [courseId, setCourseId] = useState<string | null>(null)

  if (courseId === "linux") {
    return <CourseDashboard onBack={() => setCourseId(null)} />
  }

  return <HomePage onOpenCourse={setCourseId} />
}