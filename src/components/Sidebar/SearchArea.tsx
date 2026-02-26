import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface SearchAreaProps {
  onSearchChange: (query: string) => void
  onClear: () => void
  searchQuery: string
}

export const SearchArea: React.FC<SearchAreaProps> = ({ onSearchChange, onClear, searchQuery }) => {
  const { theme } = useAppStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const [showClear, setShowClear] = useState(false)

  useEffect(() => {
    setInputValue(searchQuery)
    setShowClear(searchQuery.trim() !== '')
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setShowClear(value.trim() !== '')
    onSearchChange(value)
  }

  const handleClear = () => {
    setInputValue('')
    setShowClear(false)
    onClear()
  }

  const getInputClasses = () => {
    let baseClasses = 'w-full rounded-lg px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all duration-200'
    
    if (theme === 'dark') {
      baseClasses += ' bg-gray-700 text-white border border-gray-600'
    } else {
      baseClasses += ' bg-gray-100 text-gray-900 border border-gray-200'
    }
    
    return baseClasses
  }

  const getSearchContainerClasses = () => {
    let baseClasses = 'search-container p-4 border-b'
    
    if (theme === 'dark') {
      baseClasses += ' border-gray-700'
    } else {
      baseClasses += ' border-gray-200'
    }
    
    return baseClasses
  }

  return (
    <div className={getSearchContainerClasses()}>
      <div className="relative">
        <input
          type="text"
          id="searchInput"
          placeholder="搜索智能体..."
          value={inputValue}
          onChange={handleInputChange}
          className={getInputClasses()}
          aria-label="搜索智能体"
          autoComplete="off"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        {showClear && (
          <button
            id="searchClearBtn"
            onClick={handleClear}
            className={`search-clear-btn ${showClear ? 'visible' : ''}`}
            title="清空搜索"
            aria-label="清空搜索"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: theme === 'dark' ? '#4b5563' : '#e5e7eb',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: showClear ? '1' : '0',
              visibility: showClear ? 'visible' : 'hidden',
              transition: 'all 0.2s ease',
              padding: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#6b7280' : '#d1d5db'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#4b5563' : '#e5e7eb'
            }}
          >
            <svg 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                width: '12px',
                height: '12px',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
