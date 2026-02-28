import { create } from 'zustand'

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  avatarColor: 'blue' | 'purple' | 'orange'
  skills: string[]
}

export interface AgentGroup {
  group_name: string
  agents: Agent[]
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  skillActivated?: string
  thinkingContent?: string
  isStreaming?: boolean
}

export interface ChatState {
  [agentId: string]: {
    messages: Message[]
    isTyping: boolean
  }
}

export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: string
  fontWeight: string
  animationEnabled: boolean
  animationDuration: string
}

export interface UserSettings {
  sidebarCollapsed: boolean
  sidebarWidth: number
  theme: 'light' | 'dark'
  themeConfig: ThemeConfig
  language: string
  notifications: boolean
}

interface AppState {
  agents: AgentGroup[]
  selectedAgentId: string | null
  searchQuery: string
  collapsedGroups: Set<string>
  chats: ChatState
  userSettings: UserSettings
  theme: 'light' | 'dark'
  themeConfig: ThemeConfig
  globalStatus: 'online' | 'offline'
  
  setAgents: (agents: AgentGroup[]) => void
  setSelectedAgentId: (agentId: string | null) => void
  setSearchQuery: (query: string) => void
  toggleGroup: (groupName: string) => void
  addMessage: (agentId: string, message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessageContent: (agentId: string, messageId: string, newContent: string, isStreaming?: boolean) => void
  removeLastAiMessage: (agentId: string) => string | null
  setTyping: (agentId: string, isTyping: boolean) => void
  updateUserSettings: (settings: Partial<UserSettings>) => void
  setTheme: (theme: 'light' | 'dark') => void
  setThemeConfig: (config: Partial<ThemeConfig>) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setGlobalStatus: (status: 'online' | 'offline') => void
  toggleGlobalStatus: () => void
}

const lightThemeConfig: ThemeConfig = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  textColor: '#1f2937',
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  fontSize: '16px',
  fontWeight: '400',
  animationEnabled: true,
  animationDuration: '300ms',
}

const darkThemeConfig: ThemeConfig = {
  primaryColor: '#60a5fa',
  secondaryColor: '#a78bfa',
  textColor: '#f9fafb',
  backgroundColor: '#111827',
  borderColor: '#4b5563',
  fontSize: '16px',
  fontWeight: '400',
  animationEnabled: true,
  animationDuration: '300ms',
}

export const useAppStore = create<AppState>()((set) => ({
  agents: [],
  selectedAgentId: null,
  searchQuery: '',
  collapsedGroups: new Set(),
  chats: {},
  userSettings: {
    sidebarCollapsed: false,
    sidebarWidth: 280,
    theme: 'light',
    themeConfig: lightThemeConfig,
    language: 'zh-CN',
    notifications: true,
  },
  theme: 'light',
  themeConfig: lightThemeConfig,
  globalStatus: 'online',
  
  setAgents: (agents) => set({ agents }),
  
  setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleGroup: (groupName) => set((state) => {
    const newCollapsedGroups = new Set(state.collapsedGroups)
    if (newCollapsedGroups.has(groupName)) {
      newCollapsedGroups.delete(groupName)
    } else {
      newCollapsedGroups.add(groupName)
    }
    return { collapsedGroups: newCollapsedGroups }
  }),
  
  addMessage: (agentId: string, message: Omit<Message, 'id' | 'timestamp'>): string => {
    let messageId = '';
    set((state) => {
      messageId = `${agentId}-${Date.now()}-${Math.random()}`;
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        ...message,
      }
      
      const agentChats = state.chats[agentId] || { messages: [], isTyping: false }
      return {
        chats: {
          ...state.chats,
          [agentId]: {
            ...agentChats,
            messages: [...agentChats.messages, newMessage],
          },
        },
      }
    })
    return messageId;
  },

  updateMessageContent: (agentId, messageId, newContent, isStreaming = false) => set((state) => {
    const agentChats = state.chats[agentId];
    if (!agentChats) return state;

    const updatedMessages = agentChats.messages.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, content: newContent, isStreaming };
      }
      return msg;
    });

    return {
      chats: {
        ...state.chats,
        [agentId]: {
          ...agentChats,
          messages: updatedMessages,
        },
      },
    };
  }),

  removeLastAiMessage: (agentId) => {
    let removedContent: string | null = null
    set((state) => {
      const agentChats = state.chats[agentId]
      if (!agentChats || agentChats.messages.length === 0) {
        return state
      }
      
      const messages = [...agentChats.messages]
      
      for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].isUser) {
          removedContent = messages[i].content
          messages.splice(i, 1)
          break
        }
      }
      
      return {
        chats: {
          ...state.chats,
          [agentId]: {
            ...agentChats,
            messages,
          },
        },
      }
    })
    return removedContent
  },
  
  setTyping: (agentId, isTyping) => set((state) => {
    const agentChats = state.chats[agentId] || { messages: [], isTyping: false }
    return {
      chats: {
        ...state.chats,
        [agentId]: {
          ...agentChats,
          isTyping,
        },
      },
    }
  }),
  
  updateUserSettings: (settings) => set((state) => ({
    userSettings: {
      ...state.userSettings,
      ...settings,
    },
  })),
  
  setTheme: (theme) => set((state) => ({
    theme,
    themeConfig: theme === 'dark' ? darkThemeConfig : lightThemeConfig,
    userSettings: {
      ...state.userSettings,
      theme,
      themeConfig: theme === 'dark' ? darkThemeConfig : lightThemeConfig,
    },
  })),
  
  setThemeConfig: (config) => set((state) => ({
    themeConfig: {
      ...state.themeConfig,
      ...config,
    },
    userSettings: {
      ...state.userSettings,
      themeConfig: {
        ...state.userSettings.themeConfig,
        ...config,
      },
    },
  })),
  
  toggleSidebar: () => set((state) => ({
    userSettings: {
      ...state.userSettings,
      sidebarCollapsed: !state.userSettings.sidebarCollapsed,
    },
  })),
  
  setSidebarWidth: (width) => set((state) => ({
    userSettings: {
      ...state.userSettings,
      sidebarWidth: width,
    },
  })),
  
  setGlobalStatus: (status) => set({ globalStatus: status }),
  
  toggleGlobalStatus: () => set((state) => ({
    globalStatus: state.globalStatus === 'online' ? 'offline' : 'online',
  })),
}))
