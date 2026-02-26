import React, { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const ThemeImportExport: React.FC = () => {
  const { userSettings, themeConfig, theme } = useAppStore()
  const [importError, setImportError] = useState<string>('')
  const [exportSuccess, setExportSuccess] = useState(false)

  const getDescriptionTextClasses = () => {
    return theme === 'dark' ? 'text-sm text-gray-400 mb-4' : 'text-sm text-gray-600 mb-4'
  }

  const getSuccessTextClasses = () => {
    return theme === 'dark' ? 'mt-3 text-sm text-green-400' : 'mt-3 text-sm text-green-600'
  }

  const getErrorTextClasses = () => {
    return theme === 'dark' ? 'mt-3 text-sm text-red-400' : 'mt-3 text-sm text-red-600'
  }

  const getFileFormatBoxClasses = () => {
    return theme === 'dark' ? 'mt-6 p-4 bg-gray-800 rounded-lg' : 'mt-6 p-4 bg-gray-100 rounded-lg'
  }

  const getFileFormatTitleClasses = () => {
    return 'text-sm font-semibold mb-2'
  }

  const getFileFormatPreClasses = () => {
    return theme === 'dark' ? 'text-xs text-gray-300 overflow-x-auto' : 'text-xs text-gray-700 overflow-x-auto'
  }

  const handleExport = () => {
    try {
      const configData = {
        theme: userSettings.theme,
        themeConfig: themeConfig,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `automate-theme-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('导出主题配置失败:', error)
      alert('导出失败：' + (error as Error).message)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const config = JSON.parse(content)

        if (!config.theme || !config.themeConfig) {
          setImportError('文件格式错误：缺少主题或主题配置数据')
          return
        }

        if (!['light', 'dark'].includes(config.theme)) {
          setImportError('文件格式错误：主题模式必须是 light 或 dark')
          return
        }

        const requiredFields = ['primaryColor', 'secondaryColor', 'textColor', 'backgroundColor', 'borderColor']
        const missingFields = requiredFields.filter(field => !config.themeConfig[field])

        if (missingFields.length > 0) {
          setImportError(`文件格式错误：缺少必需字段 ${missingFields.join(', ')}`)
          return
        }

        setImportError('')
        alert('主题配置导入成功！')
      } catch (error) {
        console.error('导入主题配置失败:', error)
        if ((error as Error).message.includes('JSON')) {
          setImportError('文件格式错误：请选择有效的JSON文件')
        } else {
          setImportError('文件格式错误：' + (error as Error).message)
        }
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">主题导入/导出</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">导出当前主题</h3>
          <p className={getDescriptionTextClasses()}>
            将当前主题配置导出为JSON文件，方便备份或分享
          </p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出主题配置
          </button>
          {exportSuccess && (
            <div className={getSuccessTextClasses()}>
              ✓ 主题配置已成功导出
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">导入主题配置</h3>
          <p className={getDescriptionTextClasses()}>
            从JSON文件导入主题配置，恢复或应用自定义主题
          </p>
          <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>选择主题配置文件</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          {importError && (
            <div className={getErrorTextClasses()}>
              ✗ {importError}
            </div>
          )}
        </div>
      </div>
      <div className={getFileFormatBoxClasses()}>
        <h4 className={getFileFormatTitleClasses()}>文件格式说明</h4>
        <pre className={getFileFormatPreClasses()}>
{`{
  "theme": "light" | "dark",
  "themeConfig": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#8b5cf6",
    "textColor": "#1f2937",
    "backgroundColor": "#ffffff",
    "borderColor": "#e5e7eb",
    "fontSize": "16px",
    "fontWeight": "400",
    "animationEnabled": true,
    "animationDuration": "300ms"
  }
}`}
        </pre>
      </div>
    </div>
  )
}
