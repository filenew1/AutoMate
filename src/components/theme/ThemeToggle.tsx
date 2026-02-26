import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const ThemeToggle: React.FC = () => {
  const { userSettings, setTheme } = useAppStore()
  const { theme } = userSettings

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        theme === 'light'
          ? 'hover:bg-gray-200'
          : 'hover:bg-gray-700'
      }`}
      aria-label="切换主题"
      title="主题"
    >
      {theme === 'light' ? (
        <Sun className="w-4 h-4 text-gray-400 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-gray-300 transition-transform duration-300" />
      )}
      <span className={`text-sm ${
        theme === 'light'
          ? 'text-gray-600'
          : 'text-gray-300'
      }`}>
        主题
      </span>
    </button>
  )
}
