import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export const ThemeSettings: React.FC = () => {
  const { userSettings, setTheme, setThemeConfig } = useAppStore()
  const { theme, themeConfig } = userSettings

  const [localConfig, setLocalConfig] = useState(themeConfig)

  const lightThemeDefaults = {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    fontSize: '16px',
    fontWeight: '400',
    animationEnabled: true,
    animationDuration: '300ms',
  }

  const darkThemeDefaults = {
    primaryColor: '#60a5fa',
    secondaryColor: '#a78bfa',
    textColor: '#f9fafb',
    backgroundColor: '#111827',
    borderColor: '#4b5563',
    fontSize: '16px',
    fontWeight: '400',
    animationEnabled: true,
    animationDuration: '300ms',
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    setLocalConfig(newTheme === 'light' ? lightThemeDefaults : darkThemeDefaults)
    setThemeConfig(newTheme === 'light' ? lightThemeDefaults : darkThemeDefaults)
  }

  const handleConfigChange = (key: keyof typeof localConfig, value: string | boolean) => {
    const newConfig = { ...localConfig, [key]: value }
    setLocalConfig(newConfig)
    setThemeConfig(newConfig)
  }

  const handleReset = () => {
    const defaults = theme === 'light' ? lightThemeDefaults : darkThemeDefaults
    setLocalConfig(defaults)
    setThemeConfig(defaults)
  }

  const getThemeButtonClasses = (buttonTheme: 'light' | 'dark') => {
    if (theme === buttonTheme) {
      return 'flex-1 px-4 py-2 rounded-lg transition-colors bg-blue-500 text-white'
    }
    return theme === 'dark' 
      ? 'flex-1 px-4 py-2 rounded-lg transition-colors bg-gray-700 text-white hover:bg-gray-600'
      : 'flex-1 px-4 py-2 rounded-lg transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300'
  }

  const getSelectClasses = () => {
    return theme === 'dark'
      ? 'w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600'
      : 'w-full px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200'
  }

  const getResetButtonClasses = () => {
    return theme === 'dark'
      ? 'flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors'
      : 'flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors'
  }

  const handleExport = () => {
    const configData = {
      theme,
      themeConfig: localConfig,
    }
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `automate-theme-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        if (config.theme && config.themeConfig) {
          setTheme(config.theme)
          setLocalConfig(config.themeConfig)
          setThemeConfig(config.themeConfig)
        }
      } catch (error) {
        console.error('导入主题配置失败:', error)
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">主题设置</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">主题模式</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={getThemeButtonClasses('light')}
            >
              浅色
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={getThemeButtonClasses('dark')}
            >
              深色
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">主色调</label>
          <input
            type="color"
            value={localConfig.primaryColor}
            onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">辅助色</label>
          <input
            type="color"
            value={localConfig.secondaryColor}
            onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">文本颜色</label>
          <input
            type="color"
            value={localConfig.textColor}
            onChange={(e) => handleConfigChange('textColor', e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">背景颜色</label>
          <input
            type="color"
            value={localConfig.backgroundColor}
            onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">边框颜色</label>
          <input
            type="color"
            value={localConfig.borderColor}
            onChange={(e) => handleConfigChange('borderColor', e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">字体大小</label>
          <select
            value={localConfig.fontSize}
            onChange={(e) => handleConfigChange('fontSize', e.target.value)}
            className={getSelectClasses()}
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">字体粗细</label>
          <select
            value={localConfig.fontWeight}
            onChange={(e) => handleConfigChange('fontWeight', e.target.value)}
            className={getSelectClasses()}
          >
            <option value="400">常规</option>
            <option value="500">中等</option>
            <option value="600">半粗</option>
            <option value="700">粗体</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="animation-enabled"
            checked={localConfig.animationEnabled}
            onChange={(e) => handleConfigChange('animationEnabled', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="animation-enabled" className="text-sm font-medium">
            启用动画
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">动画时长</label>
          <select
            value={localConfig.animationDuration}
            onChange={(e) => handleConfigChange('animationDuration', e.target.value)}
            className={getSelectClasses()}
          >
            <option value="150ms">150ms</option>
            <option value="300ms">300ms</option>
            <option value="500ms">500ms</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className={getResetButtonClasses()}
        >
          重置默认
        </button>
        <button
          onClick={handleExport}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          导出主题
        </button>
        <label className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer text-center">
          导入主题
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
