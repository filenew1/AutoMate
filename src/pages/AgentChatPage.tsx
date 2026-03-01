import { useParams, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ChatContainer } from '@/components/chat/ChatContainer'

export const AgentChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>()
  const setSelectedAgentId = useAppStore((state) => state.setSelectedAgentId)

  useEffect(() => {
    if (agentId) {
      setSelectedAgentId(agentId)
    }
  }, [agentId, setSelectedAgentId])

  if (!agentId) {
    return <Navigate to="/" replace />
  }

  return (
    <ChatContainer agentId={agentId} />
  )
}
