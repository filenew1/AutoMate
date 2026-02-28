import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAppStore } from '@/store/useAppStore'
import { ChevronDown, ChevronUp, Sparkles, Copy, RefreshCw, Check } from 'lucide-react'

interface EnhancedMessageBubbleProps {
  content: string
  isUser: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  skillActivated?: string
  thinkingContent?: string
  isStreaming?: boolean
  onRetry?: () => void
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  content,
  isUser,
  status = 'sent',
  skillActivated,
  thinkingContent,
  isStreaming,
  onRetry,
}) => {
  const { theme } = useAppStore()
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const getBubbleStyle = () => {
    if (isUser) {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-green-500 to-green-600 text-gray-900 rounded-tr-sm'
        : 'bg-[#95EC69] text-gray-900 rounded-tr-sm'
    }
    return theme === 'dark'
      ? 'bg-gray-700 text-white rounded-bl-sm'
      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
  }

  const getThinkingBubbleStyle = () => {
    return theme === 'dark'
      ? 'bg-amber-900/30 border border-amber-700/50 text-amber-200'
      : 'bg-amber-50 border border-amber-200 text-amber-800'
  }

  const getSkillBadgeClasses = () => {
    return theme === 'dark'
      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
      : 'bg-purple-100 text-purple-700 border border-purple-200'
  }

  const renderThinkingContent = () => {
    if (!thinkingContent) return null

    return (
      <div className={`mb-3 rounded-lg border ${getThinkingBubbleStyle()}`}>
        <button
          onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">思考信息</span>
          </div>
          {isThinkingExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isThinkingExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3">
            <ReactMarkdown className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
              {thinkingContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  const renderSkillActivation = () => {
    if (!skillActivated) return null

    return (
      <div className={`mb-2 px-2 py-1 rounded-md inline-flex items-center gap-1.5 ${getSkillBadgeClasses()}`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">技能: {skillActivated}</span>
        <span className="text-xs opacity-70">已激活</span>
      </div>
    )
  }

  const getActionButtonClasses = () => {
    if (isUser) {
      return theme === 'dark'
        ? 'p-1.5 rounded-md hover:bg-black/20 transition-colors cursor-pointer'
        : 'p-1.5 rounded-md hover:bg-black/10 transition-colors cursor-pointer'
    }
    return theme === 'dark'
      ? 'p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer'
      : 'p-1.5 rounded-md hover:bg-gray-300/50 transition-colors cursor-pointer'
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const renderActionButtons = () => {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          className={getActionButtonClasses()}
          title="复制内容"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        {!isUser && onRetry && (
          <button
            onClick={onRetry}
            className={getActionButtonClasses()}
            title="重新生成"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`max-w-[800px] w-full px-4 py-2 rounded-lg break-words ${getBubbleStyle()}`}>
      {renderSkillActivation()}
      {renderThinkingContent()}
      <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
        )}
      </div>
      <div className="flex items-center justify-end mt-2">
        {renderActionButtons()}
        {isUser && status === 'failed' && (
          <span className="text-xs text-red-500 ml-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </div>
    </div>
  )
}
