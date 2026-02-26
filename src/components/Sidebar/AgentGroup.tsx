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
    let baseClasses = 'group-header px-4 py-3 cursor-pointer flex items-center justify-between group relative'
    
    if (theme === 'dark') {
      baseClasses += ' bg-gray-700/30'
    } else {
      baseClasses += ' bg-gray-100'
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
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-in-out ${isCollapsed ? '-rotate-90' : ''}`}
          />
          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
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
