import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAgentChat } from '@/hooks/useAgentChat'
import { Send, Paperclip, Square } from 'lucide-react'
import { EnhancedMessageBubble } from './EnhancedMessageBubble'
import { saveChatMessage, saveSkillCall, getLast24HoursChatMessages, deleteLastAiMessage, deleteSkillCallByMessageId, initHybridStorage } from '@/services/hybridStorage'
import { callSkill } from '@/services/skillService'

interface ChatContainerProps {
  agentId: string
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ agentId }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    const init = async () => {
      try {
        await initHybridStorage()
        console.log('[ChatContainer] 混合存储初始化完成')
        setIsInitialized(true)
      } catch (err) {
        console.error('混合存储初始化失败:', err)
        setIsInitialized(true)
      }
    }
    init()
  }, [])
  const { agents, chats, addMessage, updateMessageContent, updateMessageThinkingContent, setTyping, theme } = useAppStore()
  const { streamMessage } = useAgentChat()
  const [inputText, setInputText] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const currentAiMessageIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const agent = agents.flatMap(group => group.agents).find(a => a.id === agentId)
  const chat = chats[agentId] || { messages: [], isTyping: false }

  const scrollToBottom = (smooth?: boolean) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: (smooth ?? true) ? 'smooth' : 'auto' 
    })
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [agentId])

  useEffect(() => {
    if (!isInitialized || !agentId) return
    
    const chat = chats[agentId]
    if (chat?.messages?.length > 0) return
    
    const loadHistory = async () => {
      try {
        console.log('[ChatContainer] 开始加载历史记录, agentId:', agentId)
        const historyMessages = await getLast24HoursChatMessages(agentId)
        console.log('[ChatContainer] 获取到历史消息, count:', historyMessages.length)
        
        const currentChat = chats[agentId]
        if (historyMessages.length > 0 && (!currentChat || currentChat.messages.length === 0)) {
          for (const msg of historyMessages) {
            addMessage(agentId, {
              content: msg.content,
              isUser: msg.message_type === 'user',
              status: msg.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed',
              skillActivated: msg.skill_activated ? msg.skill_activated.split(',') : undefined,
              thinkingContent: msg.thinking_content,
            })
          }
          console.log('[ChatContainer] 已加载', historyMessages.length, '条历史消息')
        }
      } catch (err) {
        console.error('加载历史记录失败:', err)
      }
    }
    loadHistory()
  }, [agentId, isInitialized])

  const skillKeywordMap: Record<string, string[]> = {
    'todo-query': ['待办', 'todo', '查询待办', '待办事项', '待办查询', '待办', '有多少个待办', '待办事项'],
    'official-doc-optimize': ['文档', '优化', 'doc', '文档优化'],
    'code_generate': ['代码生成', '生成代码', '写代码'],
    'code_debug': ['调试', 'debug', '修复代码'],
    'code_optimize': ['优化代码', '代码优化'],
    'todo_create': ['创建待办', '新建待办', '添加待办'],
    'todo_update': ['更新待办', '修改待办'],
    'todo_query': ['查询待办', '待办查询', '待办', '有多少个待办', '待办事项'],
  }

  const findActivatedSkills = (userMessage: string, skills?: string[]): string[] => {
    if (!skills || skills.length === 0) return [];
    
    const activatedSkills: string[] = [];
    const messageLower = userMessage.toLowerCase();
    const messageClean = messageLower.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
    
    for (const skillName of skills) {
      const keywords = skillKeywordMap[skillName] || [];
      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        if (messageLower.includes(keywordLower) || messageClean.includes(keywordLower)) {
          if (!activatedSkills.includes(skillName)) {
            activatedSkills.push(skillName);
          }
        }
      }
    }
    
    if (activatedSkills.length > 0) return activatedSkills;
    
    for (const skillName of skills) {
      const skillNameLower = skillName.toLowerCase();
      const skillKeywords = [
        skillNameLower,
        skillName.replace(/-/g, '').replace(/_/g, ''),
      ];
      
      for (const keyword of skillKeywords) {
        if (keyword && messageLower.includes(keyword)) {
          if (!activatedSkills.includes(skillName)) {
            activatedSkills.push(skillName);
          }
        }
      }

      const skillParts = skillName.toLowerCase().split(/[-_]/);
      for (const part of skillParts) {
        if (part && messageLower.includes(part)) {
          if (!activatedSkills.includes(skillName)) {
            activatedSkills.push(skillName);
          }
        }
      }
      
      for (const part of skillParts) {
        if (part && messageClean.includes(part)) {
          if (!activatedSkills.includes(skillName)) {
            activatedSkills.push(skillName);
          }
        }
      }
    }
    
    return activatedSkills;
  }

  const executeSkillsBeforeResponse = async (userMessage: string, activatedSkills: string[]): Promise<{ skillResults: string; hasSkills: boolean }> => {
  console.log('[executeSkillsBeforeResponse] 开始在 AI 回复前执行技能，activatedSkills:', activatedSkills)
  if (!activatedSkills || activatedSkills.length === 0) {
    console.log('[executeSkillsBeforeResponse] 没有激活的技能')
    return { skillResults: '', hasSkills: false };
    }

  const skillResults: string[] = [];

  console.log('[executeSkillsBeforeResponse] 进入 for 循环，技能数量:', activatedSkills.length)

    for(const skillName of activatedSkills) {
    console.log('[executeSkillsBeforeResponse] 处理技能:', skillName)
      try {
      console.log(`[Skill] 执行技能：${skillName}, 输入：${userMessage}`);
      const result = await callSkill(skillName, { input: userMessage }, undefined, agentId);
      console.log(`[Skill] 技能结果:`, result);
        
      if (result.success && result.result) {
        skillResults.push(`【${skillName} 执行结果】\n${result.result}`);
        } else if (result.error) {
        skillResults.push(`【${skillName} 执行失败】\n${result.error}`);
        }
      } catch (error) {
      console.error(`[Skill] 技能 ${skillName} 执行异常:`, error);
      skillResults.push(`【${skillName} 执行异常】\n${error instanceof Error ? error.message: String(error)}`);
      }
    }

  if (skillResults.length > 0) {
    return { 
      skillResults: skillResults.join('\n\n'),
        hasSkills: true
      };
    }

  return { skillResults: '', hasSkills: false };
  }

  const handleSend = () => {
    if (!inputText.trim() || isSending) return

    const userMessage = inputText.trim()
    setIsSending(true)
    
    saveChatMessage(agentId, agent?.name || '智能体', userMessage, 'user').catch(err => 
      console.error('保存用户消息失败:', err)
    )
    
    addMessage(agentId, {
      content: userMessage,
      isUser: true,
      status: 'sending',
    })

    setInputText('')

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    const skillActivated = findActivatedSkills(userMessage, agent?.skills)
    console.log('[ChatContainer] 发送消息:', userMessage, '技能:', skillActivated, '可用技能:', agent?.skills)
    handleStreamSend(userMessage, skillActivated)
  }

  const handleStreamSend = async (userMessage: string, skillActivated?: string[]) => {
    // 先执行技能（如果有）
   const finalSkillActivated = skillActivated && skillActivated.length > 0 
      ? skillActivated 
      : findActivatedSkills(userMessage, agent?.skills)
    
    let skillContext = '';
   if (finalSkillActivated && finalSkillActivated.length > 0) {
     const skillResult = await executeSkillsBeforeResponse(userMessage, finalSkillActivated);
     if (skillResult.hasSkills) {
       skillContext = skillResult.skillResults;
      }
    }

    setTyping(agentId, true)

   const messageId = addMessage(agentId, {
     content: '',
      isUser: false,
      status: 'sending',
      isStreaming: true,
    })
    currentAiMessageIdRef.current = messageId

    let accumulatedContent = ''
    let updateTimer: ReturnType<typeof setTimeout> | null = null

   const flushContent = () => {
     if (accumulatedContent && currentAiMessageIdRef.current) {
        updateMessageContent(agentId, currentAiMessageIdRef.current, accumulatedContent, true)
        scrollToBottom(false)
      }
    }

    // 如果有技能结果，将其添加到用户消息中作为上下文
   const messageWithContext = skillContext
      ? `${userMessage}\n\n相关技能执行结果:\n${skillContext}`
      : userMessage;

    streamMessage(agentId, messageWithContext, {
      onChunk: (chunk) => {
        accumulatedContent += chunk
        
        if (updateTimer) {
          clearTimeout(updateTimer)
        }
        
        if (accumulatedContent.length >= 1) {
          flushContent()
        } else {
          updateTimer = setTimeout(() => {
            flushContent()
          }, 10)
        }

        const thinkMatch = accumulatedContent.match(/<think>([\s\S]*?)<\/think>/i)
        if (thinkMatch) {
          const rawThinking = thinkMatch[1]
          const thinkingContent = rawThinking
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim()
          if (currentAiMessageIdRef.current) {
            updateMessageThinkingContent(agentId, currentAiMessageIdRef.current, thinkingContent)
          }
        }
      },
     onDone: async (fullContent) => {
       if (updateTimer) {
          clearTimeout(updateTimer)
        }
        flushContent()

       const messageId = currentAiMessageIdRef.current
        setTyping(agentId, false)
        setIsSending(false)
        currentAiMessageIdRef.current = null

       const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i)
       const thinkingMatch = fullContent.match(/(?:思考 | 分析 | 推理)[:：]\s*([\s\S]+?)(?=\n\n|$)/i)

        let thinkingContent: string | undefined
       if (thinkMatch) {
          thinkingContent = thinkMatch[1]
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim()
        } else if (thinkingMatch) {
          thinkingContent = thinkingMatch[1].trim()
        }
        
        let mainContent = fullContent
          .replace(/<hr\s*\/?>/gi, '')
          .replace(/【技能:\s*[^】]+】\s*(已激活)?\n*/g, '')
          .replace(/【调用技能:\s*[^】]+】\s*content:\s*["']?[\s\S]*?["']?\s*/gi, '')
          .replace(/【调用技能:\s*[^】]+】\s*/gi, '')
          .replace(/<p>【[^:]+:\s*[^】]+】<\/p>/gi, '')
          .replace(/<p>【[^:]+:\s*[^】]+】content:/gi, '')
          .replace(/<p>\s*<\/p>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/(?:思考 | 分析 | 推理)[:：]\s*[\s\S]+?(?=\n\n|$)/gi, '')
          .trim()

        // 不再在 AI 回复后执行技能，因为已经在前面执行过了

       if (messageId) {
          const agentChats = useAppStore.getState().chats[agentId]
          if (agentChats) {
            useAppStore.setState({
              chats: {
                ...useAppStore.getState().chats,
                [agentId]: {
                  ...agentChats,
                  messages: agentChats.messages.map(m => 
                    m.id === messageId 
                      ? { ...m, content: mainContent || fullContent, status: 'sent' as const, skillActivated: finalSkillActivated, thinkingContent, isStreaming: false }
                      : m
                  ),
                },
              },
            })
          }
          
          saveChatMessage(agentId, agent?.name || '智能体', mainContent || fullContent, 'assistant', finalSkillActivated, thinkingContent, 'sent')
            .then(async (dbMessageId) => {
              if (finalSkillActivated && finalSkillActivated.length > 0) {
                for (const skillName of finalSkillActivated) {
                  await saveSkillCall(agentId, skillName, dbMessageId, undefined, 'success')
                }
              }
            })
            .catch(err => console.error('保存AI回复失败:', err))
        }
      },
      onError: (error) => {
        setTyping(agentId, false)
        setIsSending(false)
        currentAiMessageIdRef.current = null
        
        saveChatMessage(agentId, agent?.name || '智能体', error, 'assistant', undefined, undefined, 'failed')
          .catch(err => console.error('保存错误消息失败:', err))
        
        addMessage(agentId, {
          content: error,
          isUser: false,
          status: 'failed',
        })
      },
    })
  }

  const handleStop = () => {
    setIsSending(false)
    setTyping(agentId, false)
    currentAiMessageIdRef.current = null
  }

  const handleRetry = () => {
    console.log('[Retry] Starting retry...')
    const chat = chats[agentId]
    console.log('[Retry] Chat:', chat ? 'exists' : 'null', 'messages:', chat?.messages.length, 'isSending:', isSending)
    if (!chat || chat.messages.length === 0 || isSending) {
      console.log('[Retry] Early return: no chat, no messages, or isSending')
      return
    }

    let lastUserMessage = ''
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      if (chat.messages[i].isUser) {
        lastUserMessage = chat.messages[i].content
        break
      }
    }

    console.log('[Retry] Last user message:', lastUserMessage ? 'found' : 'not found')
    if (!lastUserMessage) return

    const removedContent = useAppStore.getState().removeLastAiMessage(agentId)
    console.log('[Retry] Removed content:', removedContent ? 'success' : 'failed')
    if (!removedContent) return

    deleteLastAiMessage(agentId).then(deletedId => {
      if (deletedId) {
        deleteSkillCallByMessageId(deletedId).catch(err => console.error('[Retry] 删除技能调用失败:', err))
      }
    }).catch(err => console.error('[Retry] 删除消息失败:', err))

    console.log('[Retry] Calling handleStreamSend...')
    const skillActivated = findActivatedSkills(lastUserMessage, agent?.skills)
    handleStreamSend(lastUserMessage, skillActivated)
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
    let baseClasses = 'flex-1 overflow-y-auto p-4'
    return baseClasses
  }

  const getMessageWrapperClasses = () => {
    return 'w-full'
  }

  const getEmptyMessageClasses = () => {
    let baseClasses = 'flex items-center justify-center h-full'
    baseClasses += theme === 'dark' ? ' text-gray-500' : ' text-gray-400'
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
    baseClasses += theme === 'dark' ? ' border-gray-600' : ' border-gray-300'
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

  const getUserAvatarClasses = () => {
    return theme === 'dark' ? 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 shadow-lg flex items-center justify-center' : 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 shadow-md flex items-center justify-center'
  }

  const getAgentAvatarClasses = () => {
    const avatarColor = agent?.avatarColor || 'blue'
    const gradient = getAvatarGradient(avatarColor)
    return theme === 'dark' 
      ? `w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 shadow-lg flex items-center justify-center` 
      : `w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 shadow-md flex items-center justify-center`
  }

  const getMessageContainerClasses = (isUser: boolean) => {
    return `flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2 mb-4`
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
        <div className={getMessageWrapperClasses()}>
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
              <div className={getMessageContainerClasses(message.isUser)}>
                {!message.isUser && (
                  <div className={getAgentAvatarClasses()}>
                    {agent ? getAvatarIcon(agent.avatarColor) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                )}
                <EnhancedMessageBubble
                  content={message.content}
                  isUser={message.isUser}
                  status={message.status}
                  skillActivated={message.skillActivated}
                  thinkingContent={message.thinkingContent}
                  isStreaming={message.isStreaming}
                  onRetry={!message.isUser ? handleRetry : undefined}
                />
                {message.isUser && (
                  <div className={getUserAvatarClasses()}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
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
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
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
              ref={inputRef}
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
