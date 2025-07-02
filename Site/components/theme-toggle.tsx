"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed bottom-32 left-[-56px] z-[100] flex flex-row items-center select-none" style={{ transform: 'rotate(-90deg)' }}>
      <div className="flex flex-row gap-2 theme_colors">
        <button
          onClick={theme === "light" ? undefined : toggleTheme}
          className={`theme_btn flex items-center gap-1 px-2 py-1 rounded transition-colors
            ${theme === "light" ? "is-selected text-neutral-900 dark:text-neutral-100 underline underline-offset-4" : "hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-500"}`}
          aria-pressed={theme === "light"}
        >
          <span className={`_box w-3 h-3 mr-1 flex-shrink-0 rounded-full border-2 ${theme === "light" ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100" : "bg-transparent border-neutral-400 dark:border-neutral-600"}`} />
          <span className="_text text-xs font-semibold">Light</span>
        </button>
        <button
          onClick={theme === "dark" ? undefined : toggleTheme}
          className={`theme_btn flex items-center gap-1 px-2 py-1 rounded transition-colors
            ${theme === "dark" ? "is-selected text-neutral-900 dark:text-neutral-100 underline underline-offset-4" : "hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-500"}`}
          aria-pressed={theme === "dark"}
        >
          <span className={`_box w-3 h-3 mr-1 flex-shrink-0 rounded-full border-2 ${theme === "dark" ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100" : "bg-transparent border-neutral-400 dark:border-neutral-600"}`} />
          <span className="_text text-xs font-semibold">Dark</span>
        </button>
      </div>
    </div>
  )
}
