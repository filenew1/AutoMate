import React from 'react'
import { useAppStore } from '@/store/useAppStore'

interface MessageBubbleProps {
  content: string
  isUser: boolean
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isUser,
  timestamp,
  status = 'sent',
}) => {
  const { theme } = useAppStore()

  const statusIcons = {
    sending: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    sent: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    delivered: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 17l4 4L19 11" />
      </svg>
    ),
    read: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 17l4 4L19 11M5 21l4 4L19 15" />
      </svg>
    ),
    failed: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  }

  const getBubbleStyle = () => {
    if (isUser) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm shadow-md'
    }
    return theme === 'dark' 
      ? 'bg-gray-700/90 text-gray-100 rounded-tl-sm shadow-md backdrop-blur-sm' 
      : 'bg-white text-gray-900 rounded-tl-sm shadow-md border border-gray-200'
  }

  const getTimestampClasses = () => {
    if (isUser) {
      return 'text-xs text-white'
    }
    return theme === 'dark' ? 'text-xs text-gray-400' : 'text-xs text-gray-500'
  }

  const getStatusIconClasses = () => {
    if (isUser) {
      return 'text-xs text-white'
    }
    return theme === 'dark' ? 'text-xs text-gray-400' : 'text-xs text-gray-400'
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-4`}>
      <div
        className={`max-w-[500px] px-4 py-2.5 rounded-2xl ${getBubbleStyle()} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{content}</p>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={getTimestampClasses()}>
            {new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && (
            <span className={getStatusIconClasses()}>
              {statusIcons[status]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
