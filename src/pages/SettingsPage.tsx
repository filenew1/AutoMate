import { ThemeSettings } from '@/components/theme/ThemeSettings'
import { ThemeImportExport } from '@/components/theme/ThemeImportExport'
import { useAppStore } from '@/store/useAppStore'

export const SettingsPage = () => {
  const { theme } = useAppStore()

  const getContainerClasses = () => {
    let baseClasses = 'min-h-screen p-8'
    baseClasses += theme === 'dark' ? ' bg-gray-900' : ' bg-white'
    return baseClasses
  }

  const getTitleClasses = () => {
    return theme === 'dark' ? 'text-3xl font-bold text-white mb-8' : 'text-3xl font-bold text-gray-900 mb-8'
  }

  return (
    <div className={getContainerClasses()}>
      <div className="max-w-4xl mx-auto">
        <h1 className={getTitleClasses()}>
          设置
        </h1>

        <div className="space-y-8">
          <ThemeSettings />
          <ThemeImportExport />
        </div>
      </div>
    </div>
  )
}
