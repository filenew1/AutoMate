import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Menu } from 'lucide-react'

export const Header: React.FC = () => {
  const { selectedAgentId, agents, theme } = useAppStore()

  const selectedAgent = React.useMemo(() => {
    if (!selectedAgentId) return null
    for (const group of agents) {
      const agent = group.agents.find(a => a.id === selectedAgentId)
      if (agent) return agent
    }
    return null
  }, [selectedAgentId, agents])

  const getHeaderClasses = () => {
    let baseClasses = 'h-16 border-b flex items-center justify-between px-6'
    
    if (theme === 'dark') {
      baseClasses += ' border-gray-700'
    } else {
      baseClasses += ' border-gray-200'
    }
    
    return baseClasses
  }

  const getAvatarGradient = (color: string) => {
    switch (color) {
      case 'purple':
        return 'from-purple-500 to-purple-600'
      case 'orange':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-blue-500 to-purple-600'
    }
  }

  const getAvatarIcon = (color: string) => {
    switch (color) {
      case 'purple':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        )
      case 'orange':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  return (
    <header className={getHeaderClasses()}>
      <div className="flex items-center gap-4">
        <button 
          className="mobile-menu-btn" 
          id="mobileMenuBtn" 
          aria-label="打开菜单"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>
        <div className={`w-10 h-10 bg-gradient-to-br ${selectedAgent ? getAvatarGradient(selectedAgent.avatarColor) : 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center`}>
          {selectedAgent ? getAvatarIcon(selectedAgent.avatarColor) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
        <div>
          <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            {selectedAgent ? selectedAgent.name : 'AutoMate'}
          </h1>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {selectedAgent ? selectedAgent.description : '智能体交互平台'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>欢迎回来,用户</span>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: theme === 'dark' ? '#4b5563' : '#d1d5db'
          }}
        >
          <svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280'
            }}
          >
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  )
}
