'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemePage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Toggle
          </button>
          <span className="ms-4" suppressHydrationWarning>
            Current theme: {theme}
          </span>
        </div>
      </main>
    </div>
  )
}
