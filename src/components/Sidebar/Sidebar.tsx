import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

interface SidebarProps {
  children: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { userSettings, toggleSidebar, setSidebarWidth, theme } = useAppStore()
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  
  const minWidth = 200
  const maxWidth = 500
  const collapsedWidth = 60
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (userSettings.sidebarCollapsed) return
    setIsResizing(true)
    setIsDragging(true)
    e.preventDefault()
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return
    
    const sidebarRect = sidebarRef.current.getBoundingClientRect()
    const newWidth = e.clientX - sidebarRect.left
    
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    setSidebarWidth(clampedWidth)
  }
  
  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false)
      setIsDragging(false)
    }
  }
  
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])
  
  const handleToggle = () => {
    toggleSidebar()
  }
  
  const getSidebarClasses = () => {
    let baseClasses = 'sidebar flex flex-col relative'
    
    if (theme === 'dark') {
      baseClasses += ' bg-gray-800 border-r border-gray-700'
    } else {
      baseClasses += ' bg-white border-r border-gray-300'
    }
    
    if (userSettings.sidebarCollapsed) {
      baseClasses += ' sidebar-collapsed'
    }
    
    return baseClasses
  }
  
  const sidebarStyle: React.CSSProperties = {
    width: userSettings.sidebarCollapsed ? collapsedWidth : `${userSettings.sidebarWidth}px`,
    transition: isResizing ? 'none' : 'width 0.3s ease',
  }
  
  return (
    <aside
      ref={sidebarRef}
      className={getSidebarClasses()}
      style={sidebarStyle}
    >
      {children}
      
      <div
        className="sidebar-toggle"
        onClick={handleToggle}
        title={userSettings.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        style={{
          position: 'absolute',
          right: '-6px',
          top: '33.33%',
          width: '12px',
          height: '40px',
          background: 'linear-gradient(135deg, #4b5563, #6b7280)',
          border: '1px solid #374151',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
        onMouseEnter={(e) => {
          if (!userSettings.sidebarCollapsed) {
            e.currentTarget.style.width = '16px'
            e.currentTarget.style.height = '60px'
            e.currentTarget.style.right = '-8px'
            e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280, #9ca3af)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (!userSettings.sidebarCollapsed) {
            e.currentTarget.style.width = '12px'
            e.currentTarget.style.height = '40px'
            e.currentTarget.style.right = '-6px'
            e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563, #6b7280)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <div
          style={{
            width: '4px',
            height: '16px',
            background: 'linear-gradient(to bottom, #d1d5db, #9ca3af)',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: userSettings.sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </div>
      
      <div
        ref={resizeHandleRef}
        className={`sidebar-resize-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        title="拖拽调整宽度"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'col-resize',
          background: 'transparent',
          transition: 'background 0.2s ease',
          zIndex: 5
        }}
        onMouseEnter={(e) => {
          if (!userSettings.sidebarCollapsed) {
            e.currentTarget.style.background = '#3b82f6'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      />
    </aside>
  )
}
