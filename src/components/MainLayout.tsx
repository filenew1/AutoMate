import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { SearchArea } from '@/components/Sidebar/SearchArea'
import { AgentGroup } from '@/components/Sidebar/AgentGroup'
import { AgentItem } from '@/components/Sidebar/AgentItem'
import { BottomSettings } from '@/components/Sidebar/BottomSettings'
import { Header } from '@/components/Header'


export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { agents, setAgents, userSettings, setSelectedAgentId, searchQuery, setSearchQuery } = useAppStore()
  const { theme } = userSettings
  const navigate = useNavigate()

  useEffect(() => {
    const loadAgentsConfig = async () => {
      try {
        const response = await fetch('/config/agents.json')
        if (!response.ok) {
          throw new Error('Failed to load agents configuration')
        }
        const data = await response.json()
        
        const processedAgents = data.agents.map((group: any) => ({
          ...group,
          agents: group.agents.map((agent: any) => {
            let avatarColor: 'blue' | 'purple' | 'orange' = 'blue'
            if (agent.avatar === 'avatar-1.png') avatarColor = 'blue'
            if (agent.avatar === 'avatar-2.png') avatarColor = 'purple'
            if (agent.avatar === 'avatar-3.png') avatarColor = 'orange'
            
            return {
              ...agent,
              avatarColor,
              skills: agent.skills ? agent.skills.map((s: any) => s.name) : []
            }
          })
        }))
        
        setAgents(processedAgents)
      } catch (error) {
        console.error('Error loading agents config:', error)
      }
    }

    loadAgentsConfig()
  }, [])

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId)
    navigate(`/agent/${agentId}`)
  }

  const hasSearchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return true
    const lowerSearchQuery = searchQuery.toLowerCase()
    return agents.some(group => 
      group.agents.some(agent => 
        agent.name.toLowerCase().includes(lowerSearchQuery) || 
        agent.description.toLowerCase().includes(lowerSearchQuery)
      )
    )
  }, [searchQuery, agents])

  const getMainClasses = () => {
    let baseClasses = 'flex-1 flex flex-col'
    
    if (theme === 'dark') {
      baseClasses += ' bg-gray-900'
    } else {
      baseClasses += ' bg-gray-50'
    }
    
    return baseClasses
  }

  return (
    <div className={`flex h-full ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <Sidebar>
        <SearchArea
          onSearchChange={(query) => setSearchQuery(query)}
          onClear={() => setSearchQuery('')}
          searchQuery={searchQuery}
        />
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {hasSearchResults ? (
            agents.map((group) => (
              <AgentGroup
                key={group.group_name}
                groupName={group.group_name}
                agents={group.agents}
              >
                {group.agents.map((agent) => (
                  <AgentItem
                    key={agent.id}
                    agent={agent}
                    searchQuery={searchQuery}
                    onClick={() => handleAgentClick(agent.id)}
                  />
                ))}
              </AgentGroup>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                未找到 <strong className="font-semibold">{searchQuery}</strong>
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>请尝试其他关键词</p>
            </div>
          )}
        </div>
        
        <BottomSettings />
      </Sidebar>
      
      <main className={getMainClasses()}>
        <Header />
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
