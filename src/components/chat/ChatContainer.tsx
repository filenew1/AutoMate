import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Send, Paperclip, Square } from 'lucide-react'

interface ChatContainerProps {
  agentId: string
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ agentId }) => {
  const { agents, chats, addMessage, setTyping, theme } = useAppStore()
  const [inputText, setInputText] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isSending, setIsSending] = useState(false)
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

    setIsSending(true)
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
        setIsSending(false)
        addMessage(agentId, {
          content: `这是智能体的回复：${inputText}`,
          isUser: false,
          status: 'sent',
        })
      }, 1000)
    }, 500)
  }

  const handleStop = () => {
    setIsSending(false)
    setTyping(agentId, false)
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
    let baseClasses = 'max-w-[500px] px-4 py-2 rounded-lg break-words'
    if (isUser) {
      baseClasses += ' bg-[#95EC69] text-gray-900 rounded-tr-sm'
    } else {
      baseClasses += theme === 'dark' ? ' bg-gray-700 text-white rounded-bl-sm' : ' bg-gray-200 text-gray-900 rounded-bl-sm'
    }
    return baseClasses
  }

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true
    
    const currentTime = new Date(currentMessage.timestamp)
    const previousTime = new Date(previousMessage.timestamp)
    
    const timeDiff = currentTime.getTime() - previousTime.getTime()
    const minutesDiff = timeDiff / (1000 * 60)
    
    return minutesDiff >= 1
  }

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
  }

  const getTimestampSeparatorClasses = () => {
    return theme === 'dark' ? 'flex justify-center my-4' : 'flex justify-center my-4'
  }

  const getTimestampBubbleClasses = () => {
    return theme === 'dark' ? 'bg-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full' : 'bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full'
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

  const getInputWrapperClasses = () => {
    let baseClasses = 'border rounded-lg overflow-hidden'
    baseClasses += theme === 'dark' ? ' border-gray-600' : ' border-gray-200'
    return baseClasses
  }

  const getAvatarGradient = (color: string) => {
    switch (color) {
      case 'purple':
        return 'from-purple-400 to-purple-600'
      case 'orange':
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-blue-400 to-blue-600'
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  const getAttachmentButtonClasses = () => {
    return theme === 'dark' 
      ? 'w-10 h-10 rounded-full hover:bg-gray-600 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105' 
      : 'w-10 h-10 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105'
  }

  const getInputClasses = () => {
    return theme === 'dark' ? 'w-full bg-gray-700 text-white px-4 py-3 focus:outline-none placeholder-gray-400 resize-none scrollbar-thin border-none flex-grow' : 'w-full bg-white text-gray-900 px-4 py-3 focus:outline-none placeholder-gray-400 resize-none scrollbar-thin border-none flex-grow'
  }

  const getButtonAreaClasses = () => {
    return theme === 'dark' ? 'flex items-center justify-between p-1 bg-gray-700' : 'flex items-center justify-between p-1'
  }

  const getSendButtonClasses = () => {
    if (chat.isTyping || isSending) {
      return theme === 'dark' 
        ? 'w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer' 
        : 'w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
    } else if (!inputText.trim()) {
      return theme === 'dark' 
        ? 'w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 transition-all duration-300 flex items-center justify-center shadow-lg cursor-not-allowed opacity-50' 
        : 'w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 transition-all duration-300 flex items-center justify-center shadow-lg cursor-not-allowed opacity-50'
    } else {
      return theme === 'dark' 
        ? 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer' 
        : 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
    }
  }

  return (
    <div className={getContainerClasses()}>
      <header className={getHeaderClasses()}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${agent ? getAvatarGradient(agent.avatarColor) : 'from-blue-400 to-blue-600'} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 flex-shrink-0`}>
            {agent ? getAvatarIcon(agent.avatarColor) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
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

        {chat.messages.map((message, index) => {
          const previousMessage = chat.messages[index - 1]
          const showTimestamp = shouldShowTimestamp(message, previousMessage)
          
          return (
            <React.Fragment key={message.id}>
              {showTimestamp && (
                <div className={getTimestampSeparatorClasses()}>
                  <span className={getTimestampBubbleClasses()}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={getMessageClasses(message.isUser)}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </React.Fragment>
          )
        })}

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
          className="absolute bottom-36 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 cursor-pointer flex items-center justify-center"
          title="滚动到底部"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <div className={getInputAreaClasses()}>
        <div className={getInputWrapperClasses()}>
          <div className="relative flex flex-grow">
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
          </div>
          <div className={getButtonAreaClasses()}>
            <div className="flex items-center gap-2">
              <button className={getAttachmentButtonClasses()} aria-label="添加附件">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <button
                id={`send-btn-${agentId}`}
                onClick={chat.isTyping || isSending ? handleStop : handleSend}
                className={getSendButtonClasses()}
                title={chat.isTyping || isSending ? "停止生成" : "发送消息"}
              >
                {chat.isTyping || isSending ? (
                  <Square className="w-5 h-5 text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
