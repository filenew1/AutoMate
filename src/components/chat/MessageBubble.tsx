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
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    sent: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    delivered: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 17l4 4L19 11" />
      </svg>
    ),
    read: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 17l4 4L19 11M5 21l4 4L19 15" />
      </svg>
    ),
    failed: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  }

  const getBubbleStyle = () => {
    if (isUser) {
      return 'bg-blue-500 text-white rounded-tr-sm'
    }
    return theme === 'dark' ? 'bg-gray-700 text-white rounded-bl-sm' : 'bg-gray-200 text-gray-900 rounded-bl-sm'
  }

  const getTimestampClasses = () => {
    return theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-gray-400'
  }

  const getStatusIconClasses = () => {
    return theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-gray-400'
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`max-w-[500px] px-4 py-2 rounded-lg ${getBubbleStyle()} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className={getTimestampClasses()}>
            {new Date(timestamp).toLocaleTimeString()}
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
