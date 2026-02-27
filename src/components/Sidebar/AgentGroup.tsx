import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface AgentGroupProps {
  groupName: string
  agents: any[]
  children: React.ReactNode
}

export const AgentGroup: React.FC<AgentGroupProps> = ({ groupName, children }) => {
  const { collapsedGroups, toggleGroup, theme } = useAppStore()
  const isCollapsed = collapsedGroups.has(groupName)

  const handleToggle = () => {
    toggleGroup(groupName)
  }

  const getGroupHeaderClasses = () => {
    let baseClasses = 'group-header px-4 py-3 cursor-pointer flex items-center justify-between group relative rounded-lg transition-all duration-300 hover:shadow-md border'
    
    if (theme === 'dark') {
      baseClasses += ' bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/60 hover:to-gray-700/60 border-gray-600/30'
    } else {
      baseClasses += ' bg-gradient-to-r from-gray-100 to-gray-200/50 hover:from-gray-200 hover:to-gray-300/50 border-gray-300/50'
    }
    
    return baseClasses
  }

  return (
    <div className="mb-2">
      <div
        className={getGroupHeaderClasses()}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-300 ease-in-out ${isCollapsed ? '-rotate-90' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
          />
          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {groupName}
          </span>
        </div>
      </div>
      {!isCollapsed && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}
