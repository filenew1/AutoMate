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
  addMessage: (agentId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
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
  
  addMessage: (agentId, message) => set((state) => {
    const newMessage: Message = {
      id: `${agentId}-${Date.now()}-${Math.random()}`,
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
  }),
  
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
