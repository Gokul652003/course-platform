import { electronModule1 } from "./electronModule1Content"
import { electronModule2 } from "./electronModule2Content"
import { electronModule3 } from "./electronModule3Content"
import { electronModule4 } from "./electronModule4Content"
import { electronModule5 } from "./electronModule5Content"
import { electronModule6 } from "./electronModule6Content"
import { electronModule7 } from "./electronModule7Content"
import { electronModule8 } from "./electronModule8Content"
import { electronModule9 } from "./electronModule9Content"
import { electronModule10 } from "./electronModule10Content"
import { electronModule11 } from "./electronModule11Content"
import { electronModule12 } from "./electronModule12Content"
import { electronModule13 } from "./electronModule13Content"
import { lessonCount, lessonDuration } from "./courseData"
import type { Course, Module } from "../types"

export const electronModules: Module[] = [
  electronModule1,
  electronModule2,
  electronModule3,
  electronModule4,
  electronModule5,
  electronModule6,
  electronModule7,
  electronModule8,
  electronModule9,
  electronModule10,
  electronModule11,
  electronModule12,
  electronModule13,
]

export const electronCourse: Course = {
  title: "Complete Electron.js Course",
  tagline: "Your first window → processes & IPC → security & preload scripts → packaging, auto-updates & production practices, end to end",
  description:
    "A hands-on, milestone-based journey through Electron — from installing the package and opening your first BrowserWindow, through the main/renderer process split, inter-process communication and preload scripts, native menus, tray icons and file dialogs, deep linking and app lifecycle, a full module on security hardening, packaging and code signing with electron-builder, auto-updates and native notifications, and finishing with real-world project structure, testing, and an honest comparison against alternatives like Tauri and Wails.",
  stats: {
    modules: electronModules.length,
    level: "Beginner → Advanced",
    lessons: electronModules.reduce((acc, m) => acc + lessonCount(m), 0),
    hours: Math.round(
      electronModules.reduce(
        (acc, m) => acc + m.lessons.reduce((a, l) => a + lessonDuration(l), 0),
        0,
      ) / 60,
    ),
  },
}
