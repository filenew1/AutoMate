import axios from 'axios';

export interface AgentConfig {
  url: string;
  api_key: string;
  model: string;
}

export interface Skill {
  name: string;
  description: string;
  type: string;
  storage_path: string;
  version: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  type: string;
  config: AgentConfig;
  skills: Skill[];
}

export interface AgentGroup {
  group_name: string;
  agents: Agent[];
}

export interface AgentsConfig {
  agents: AgentGroup[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  skill_used?: string;
  agent_id: string;
  error?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

async function loadSkillDescription(skillPath: string): Promise<string> {
  try {
    const match = skillPath.match(/\.\/skills\/(.+)/);
    const skillName = match ? match[1] : skillPath.replace(/^\.\//, '');
    const response = await fetch(`/skills/${skillName}/SKILL.md`);
    if (response.ok) {
      const content = await response.text();
      const whenToUseMatch = content.match(/## When to Use[\s\S]*?(?=##\s|$)/i);
      if (whenToUseMatch) {
        return whenToUseMatch[0].replace(/## When to Use\n+/i, '').trim();
      }
      const descMatch = content.match(/#\s+(.+)/);
      if (descMatch) {
        return descMatch[1].trim();
      }
      return content.substring(0, 500);
    }
    return '';
  } catch {
    return '';
  }
}

function buildSystemPrompt(agent: Agent, skillDescriptions: Map<string, string>): string {
  const skillPrompts: string[] = [];

  for (const skill of agent.skills) {
    const desc = skillDescriptions.get(skill.name);
    if (desc) {
      skillPrompts.push(`【技能: ${skill.name}】\n${desc}`);
    }
  }

  let systemPrompt = `你是 ${agent.name}。${agent.description || ''}\n\n`;

  if (skillPrompts.length > 0) {
    systemPrompt += `你可以使用以下技能：\n\n${skillPrompts.join('\n\n')}\n\n`;
    systemPrompt += `当用户请求涉及技能相关内容时，请自动调用相应技能。\n`;
  }

  return systemPrompt;
}

export async function* streamChatWithAgent(
  agent: Agent,
  userMessage: string,
  skillDescriptions: Map<string, string> = new Map()
): AsyncGenerator<StreamChunk, void, unknown> {
  const systemPrompt = buildSystemPrompt(agent, skillDescriptions);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const apiUrl = agent.config.url.includes('api.fgw.sz.gov.cn') 
    ? '/api/chat/completions'
    : agent.config.url;

  const fullUrl = apiUrl.includes('/chat/completions') ? apiUrl : `${apiUrl}/chat/completions`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${agent.config.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: agent.config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API错误: ${response.status} - ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            const content = data.choices?.[0]?.delta?.content || '';
            if (content) {
              yield { content, done: false };
            }
          } catch {
          }
        }
        yield { content: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
        
        if (trimmedLine === 'data: [DONE]') {
          yield { content: '', done: true };
          return;
        }

        const jsonStr = trimmedLine.slice(6);
        try {
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content || '';
          if (content) {
            yield { content, done: false };
          }
        } catch {
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function chatWithAgent(
  agent: Agent,
  userMessage: string,
  skillDescriptions: Map<string, string> = new Map()
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(agent, skillDescriptions);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const apiUrl = agent.config.url.includes('api.fgw.sz.gov.cn') 
    ? '/api/chat/completions'
    : agent.config.url;

  try {
    const response = await axios.post(
      apiUrl.includes('/chat/completions') ? apiUrl : `${apiUrl}/chat/completions`,
      {
        model: agent.config.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${agent.config.api_key}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices?.[0]?.message?.content || '';

    return {
      content: content,
      agent_id: agent.id,
      skill_used: agent.skills.length > 0 ? agent.skills[0].name : undefined
    };

  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { status?: number; data?: unknown } };

    if (axiosError.response) {
      return {
        content: '',
        agent_id: agent.id,
        error: `API错误: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
      };
    } else if (axiosError.message === 'Network Error') {
      return {
        content: '',
        agent_id: agent.id,
        error: '网络连接失败，请检查网络配置'
      };
    } else {
      return {
        content: '',
        agent_id: agent.id,
        error: `请求失败: ${axiosError.message}`
      };
    }
  }
}

export async function loadAllSkillsDescriptions(agents: Agent[]): Promise<Map<string, string>> {
  const skillDescriptions = new Map<string, string>();
  const loadedSkills = new Set<string>();

  for (const agent of agents) {
    for (const skill of agent.skills) {
      if (!loadedSkills.has(skill.name)) {
        const desc = await loadSkillDescription(skill.storage_path);
        if (desc) {
          skillDescriptions.set(skill.name, desc);
          loadedSkills.add(skill.name);
        }
      }
    }
  }

  return skillDescriptions;
}
