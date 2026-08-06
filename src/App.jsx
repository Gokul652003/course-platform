import { useState } from "react"
import HomePage from "./components/HomePage"
import CourseDashboard from "./components/CourseDashboard"
import "./index.css"

export default function App() {
  const [courseId, setCourseId] = useState(null)

  if (courseId === "linux") {
    return <CourseDashboard onBack={() => setCourseId(null)} />
  }

  return <HomePage onOpenCourse={setCourseId} />
}