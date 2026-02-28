import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { chatWithAgent, loadAllSkillsDescriptions, streamChatWithAgent, Agent, ChatResponse } from '@/types/chat';

export interface StreamHandler {
  onChunk: (content: string) => void;
  onDone: (finalContent: string) => void;
  onError: (error: string) => void;
}

interface UseAgentChatReturn {
  sendMessage: (agentId: string, message: string) => Promise<ChatResponse | null>;
  streamMessage: (agentId: string, message: string, handler: StreamHandler) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAgentChat = (): UseAgentChatReturn => {
  const { } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillDescriptions, setSkillDescriptions] = useState<Map<string, string>>(new Map());
  const [fullAgentsConfig, setFullAgentsConfig] = useState<Agent[]>([]);

  useEffect(() => {
    const loadFullConfig = async () => {
      try {
        const response = await fetch('/config/agents.json');
        if (!response.ok) throw new Error('Failed to load config');
        const data = await response.json();
        
        const allAgents: Agent[] = [];
        for (const group of data.agents) {
          for (const agent of group.agents) {
            allAgents.push(agent as Agent);
          }
        }
        
        setFullAgentsConfig(allAgents);
        
        const skills = await loadAllSkillsDescriptions(allAgents);
        setSkillDescriptions(skills);
      } catch (err) {
        console.error('Error loading agent config:', err);
      }
    };

    loadFullConfig();
  }, []);

  const sendMessage = useCallback(async (agentId: string, message: string): Promise<ChatResponse | null> => {
    const agent = fullAgentsConfig.find(a => a.id === agentId);
    
    if (!agent) {
      setError(`智能体 ${agentId} 未找到`);
      return null;
    }

    if (!agent.config?.url || !agent.config?.api_key) {
      setError(`智能体 ${agent.name} 缺少API配置`);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await chatWithAgent(agent, message, skillDescriptions);
      
      if (response.error) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fullAgentsConfig, skillDescriptions]);

  const streamMessage = useCallback(async (agentId: string, message: string, handler: StreamHandler): Promise<void> => {
    const agent = fullAgentsConfig.find(a => a.id === agentId);
    
    if (!agent) {
      handler.onError(`智能体 ${agentId} 未找到`);
      return;
    }

    if (!agent.config?.url || !agent.config?.api_key) {
      handler.onError(`智能体 ${agent.name} 缺少API配置`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fullContent = '';
      
      for await (const chunk of streamChatWithAgent(agent, message, skillDescriptions)) {
        if (chunk.done) {
          break;
        }
        fullContent += chunk.content;
        handler.onChunk(chunk.content);
      }
      
      handler.onDone(fullContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '流式输出失败';
      setError(errorMessage);
      handler.onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fullAgentsConfig, skillDescriptions]);

  return {
    sendMessage,
    streamMessage,
    isLoading,
    error
  };
};
