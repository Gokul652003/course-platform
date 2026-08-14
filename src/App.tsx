import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage.tsx"
import CourseDashboard from "./components/CourseDashboard.tsx"
import LessonPage from "./components/LessonPage.tsx"
import { CourseProgressProvider } from "./data/progress.tsx"
import { AuthProvider } from "./data/auth.tsx"
import { ThemeProvider } from "./data/theme.tsx"
import "./index.css"

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CourseProgressProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/course/:courseId" element={<CourseDashboard />} />
              <Route
                path="/course/:courseId/module/:moduleId/lesson/:lessonIndex"
                element={<LessonPage />}
              />
            </Routes>
          </CourseProgressProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}