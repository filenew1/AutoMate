import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Send, Paperclip } from 'lucide-react'

interface ChatContainerProps {
  agentId: string
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ agentId }) => {
  const { agents, chats, addMessage, setTyping, theme } = useAppStore()
  const [inputText, setInputText] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  const agent = agents.flatMap(group => group.agents).find(a => a.id === agentId)
  const chat = chats[agentId] || { messages: [], isTyping: false }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!chatAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat.messages.length, chat.isTyping])

  useEffect(() => {
    const chatArea = chatAreaRef.current
    if (!chatArea) return

    chatArea.addEventListener('scroll', handleScroll)
    return () => chatArea.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSend = () => {
    if (!inputText.trim()) return

    addMessage(agentId, {
      content: inputText,
      isUser: true,
      status: 'sending',
    })

    setInputText('')

    setTimeout(() => {
      setTyping(agentId, true)

      setTimeout(() => {
        setTyping(agentId, false)
        addMessage(agentId, {
          content: `这是智能体的回复：${inputText}`,
          isUser: false,
          status: 'sent',
        })
      }, 1000)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    setInputText(textarea.value)
    
    textarea.style.height = 'auto'
    const newHeight = Math.min(300, Math.max(100, textarea.scrollHeight))
    textarea.style.height = `${newHeight}px`
  }

  const getContainerClasses = () => {
    let baseClasses = 'flex-1 flex flex-col h-screen'
    baseClasses += theme === 'dark' ? ' bg-gray-900' : ' bg-white'
    return baseClasses
  }

  const getHeaderClasses = () => {
    let baseClasses = 'h-16 border-b flex items-center px-4'
    baseClasses += theme === 'dark' ? ' border-gray-700 bg-gray-800' : ' border-gray-200 bg-white'
    return baseClasses
  }

  const getChatAreaClasses = () => {
    let baseClasses = 'flex-1 overflow-y-auto p-4 space-y-4'
    return baseClasses
  }

  const getEmptyMessageClasses = () => {
    let baseClasses = 'flex items-center justify-center h-full'
    baseClasses += theme === 'dark' ? ' text-gray-500' : ' text-gray-400'
    return baseClasses
  }

  const getMessageClasses = (isUser: boolean) => {
    let baseClasses = 'max-w-[500px] px-4 py-2 rounded-lg'
    if (isUser) {
      baseClasses += ' bg-blue-500 text-white rounded-tr-sm'
    } else {
      baseClasses += theme === 'dark' ? ' bg-gray-700 text-white rounded-bl-sm' : ' bg-gray-200 text-gray-900 rounded-bl-sm'
    }
    return baseClasses
  }

  const getTimestampClasses = () => {
    return theme === 'dark' ? 'text-xs text-gray-500 mt-1 block' : 'text-xs text-gray-400 mt-1 block'
  }

  const getTypingIndicatorClasses = () => {
    return theme === 'dark' ? 'bg-gray-700 px-4 py-2 rounded-lg rounded-bl-sm' : 'bg-gray-200 px-4 py-2 rounded-lg rounded-bl-sm'
  }

  const getTypingDotClasses = () => {
    return theme === 'dark' ? 'w-2 h-2 bg-gray-500 rounded-full animate-typing-bounce' : 'w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce'
  }

  const getInputAreaClasses = () => {
    let baseClasses = 'border-t p-4'
    baseClasses += theme === 'dark' ? ' border-gray-700 bg-gray-800' : ' border-gray-200 bg-white'
    return baseClasses
  }

  const getAttachmentButtonClasses = () => {
    return theme === 'dark' ? 'w-10 h-10 rounded-full hover:bg-gray-700 transition-colors' : 'w-10 h-10 rounded-full hover:bg-gray-100 transition-colors'
  }

  const getInputClasses = () => {
    return theme === 'dark' ? 'flex-1 resize-none border-0 bg-transparent text-white placeholder-gray-400 focus:outline-none' : 'flex-1 resize-none border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none'
  }

  return (
    <div className={getContainerClasses()}>
      <header className={getHeaderClasses()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {agent?.name || '智能体'}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {agent?.description || '智能体描述'}
            </p>
          </div>
        </div>
      </header>

      <div
        ref={chatAreaRef}
        className={getChatAreaClasses()}
      >
        {chat.messages.length === 0 && (
          <div className={getEmptyMessageClasses()}>
            <p>开始与智能体对话吧！</p>
          </div>
        )}

        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={getMessageClasses(message.isUser)}>
              <p className="text-sm">{message.content}</p>
              <span className={getTimestampClasses()}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {chat.isTyping && (
          <div className="flex justify-start">
            <div className={getTypingIndicatorClasses()}>
              <div className="flex gap-1">
                <div className={getTypingDotClasses()} style={{ animationDelay: '0ms' }} />
                <div className={getTypingDotClasses()} style={{ animationDelay: '150ms' }} />
                <div className={getTypingDotClasses()} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-8 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="滚动到底部"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <div className={getInputAreaClasses()}>
        <div className="flex items-end gap-3">
          <button className={getAttachmentButtonClasses()}>
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          <textarea
            id={`message-input-${agentId}`}
            placeholder="输入消息..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={getInputClasses()}
            style={{ minHeight: '100px', maxHeight: '300px' }}
            rows={1}
          />
          <button
            id={`send-btn-${agentId}`}
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="发送消息"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
