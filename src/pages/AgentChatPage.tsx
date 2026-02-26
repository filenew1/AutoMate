import { useParams, Navigate } from 'react-router-dom'
import { ChatContainer } from '@/components/chat/ChatContainer'

export const AgentChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>()

  if (!agentId) {
    return <Navigate to="/" replace />
  }

  return (
    <ChatContainer agentId={agentId} />
  )
}
