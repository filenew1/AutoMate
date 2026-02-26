import React from 'react'
import { Sun, Moon, Settings } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const BottomSettings: React.FC = () => {
  const { setTheme, theme, globalStatus, toggleGlobalStatus } = useAppStore()

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const handleSettingsClick = () => {
    console.log('打开设置页面')
  }

  const handleStatusClick = () => {
    toggleGlobalStatus()
  }

  const statusColor = globalStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
  const statusText = globalStatus === 'online' ? '在线' : '离线'

  return (
    <div className={`p-4 border-t flex items-center justify-between ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          onClick={handleThemeToggle}
          aria-label="切换主题"
          title="主题"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-gray-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-300" />
          )}
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>主题</span>
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          onClick={handleSettingsClick}
          aria-label="设置"
          title="设置"
        >
          <Settings className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`} />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>设置</span>
        </button>
      </div>
      <div className={`flex items-center gap-4 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <button
          className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${globalStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}
          onClick={handleStatusClick}
          title="点击切换状态"
        >
          <span className={`w-2 h-2 ${statusColor} rounded-full`}></span>
          {statusText}
        </button>
        <span>v1.0.0</span>
      </div>
    </div>
  )
}
