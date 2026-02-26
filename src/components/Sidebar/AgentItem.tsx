import React, { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'

interface AgentItemProps {
  agent: {
    id: string
    name: string
    description: string
    avatar?: string
    avatarColor?: 'blue' | 'purple' | 'orange'
  }
  searchQuery: string
  onClick?: () => void
}

export const AgentItem: React.FC<AgentItemProps> = ({ agent, searchQuery, onClick }) => {
  const { selectedAgentId, setSelectedAgentId, theme, globalStatus } = useAppStore()
  const isSelected = selectedAgentId === agent.id
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setSelectedAgentId(agent.id)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span key={index} className="search-highlight">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const isMatch = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return true
    const lowerSearchQuery = searchQuery.toLowerCase()
    const lowerName = agent.name.toLowerCase()
    const lowerDescription = agent.description.toLowerCase()
    return lowerName.includes(lowerSearchQuery) || lowerDescription.includes(lowerSearchQuery)
  }, [searchQuery, agent.name, agent.description])

  const avatarGradient = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
  }

  const avatarIcon = {
    blue: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    purple: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    orange: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  }

  const statusColor = globalStatus === 'online' ? 'bg-green-500' : 'bg-red-500'

  const getAvatarConfig = () => {
    // 首先检查agent.avatar属性
    if (agent.avatar) {
      if (agent.avatar === 'avatar-1.png') {
        return { color: 'blue', icon: avatarIcon.blue, gradient: avatarGradient.blue }
      }
      if (agent.avatar === 'avatar-2.png') {
        return { color: 'purple', icon: avatarIcon.purple, gradient: avatarGradient.purple }
      }
      if (agent.avatar === 'avatar-3.png') {
        return { color: 'orange', icon: avatarIcon.orange, gradient: avatarGradient.orange }
      }
    }
    // 然后检查agent.avatarColor属性
    if (agent.avatarColor) {
      return { color: agent.avatarColor, icon: avatarIcon[agent.avatarColor], gradient: avatarGradient[agent.avatarColor] }
    }
    // 默认返回蓝色图标
    return { color: 'blue', icon: avatarIcon.blue, gradient: avatarGradient.blue }
  }

  const config = getAvatarConfig()
  const transformScale = isHovered ? 'scale(1.08)' : 'scale(1)'
  
  const getContainerClasses = () => {
    let classes = 'agent-item mx-2 px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-3 relative overflow-hidden'
    
    if (theme === 'dark') {
      if (isSelected) {
        classes += ' bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/20'
      } else if (isHovered) {
        classes += ' bg-slate-700/50 border border-slate-600/30'
      } else {
        classes += ' border border-transparent hover:border-slate-600/20'
      }
    } else {
      if (isSelected) {
        classes += ' bg-blue-50 border border-blue-300 shadow-lg shadow-blue-200/50'
      } else if (isHovered) {
        classes += ' bg-gray-100 border border-gray-200'
      } else {
        classes += ' border border-transparent hover:border-gray-200'
      }
    }
    
    return classes
  }

  const descriptionClasses = theme === 'dark' ? 'text-xs text-gray-400 truncate' : 'text-xs text-gray-400 truncate'
  const statusTextClasses = globalStatus === 'online' ? 'text-xs text-green-400' : 'text-xs text-red-400'

  const containerStyle: React.CSSProperties = {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
  }

  if (!isMatch) {
    return null
  }

  return (
    <div
      className={getContainerClasses()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-agent-id={agent.id}
      data-agent-name={agent.name}
      data-agent-avatar={agent.avatarColor}
      style={containerStyle}
    >
      <div className="relative">
        <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center avatar-container relative z-10 transition-transform duration-200`} style={{
          transform: transformScale,
          ...(isSelected && {
            boxShadow: theme === 'dark' ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.3)'
          })
        }}>
          {config.icon}
        </div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white z-20`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate transition-colors duration-200 ${isSelected ? (theme === 'dark' ? 'text-blue-300' : 'text-blue-700') : (theme === 'dark' ? 'text-gray-200' : 'text-gray-700')}`}>
            {highlightText(agent.name, searchQuery)}
          </span>
          <span className={`status-badge ${statusTextClasses} transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
            {globalStatus === 'online' ? '在线' : '离线'}
          </span>
        </div>
        <p className={descriptionClasses}>
          {highlightText(agent.description, searchQuery)}
        </p>
      </div>
    </div>
  )
}
