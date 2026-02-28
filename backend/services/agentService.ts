import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface AgentConfig {
  url: string;
  api_key: string;
  model: string;
}

interface Skill {
  name: string;
  description: string;
  type: string;
  storage_path: string;
  version: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  type: string;
  config: AgentConfig;
  skills: Skill[];
}

interface AgentsConfig {
  agents: AgentGroup[];
}

interface AgentGroup {
  group_name: string;
  agents: Agent[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  skill_used?: string;
  agent_id: string;
  error?: string;
}

interface ChatError {
  message: string;
  code?: string;
}

const CONFIG_PATH = path.resolve(process.cwd(), 'config', 'agents.json');
const SKILLS_DIR = path.resolve(process.cwd(), 'skills');

function loadAgentsConfig(): AgentGroup[] {
  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config: AgentsConfig = JSON.parse(configData);
    return config.agents;
  } catch (error) {
    console.error('Failed to load agents config:', error);
    return [];
  }
}

function findAgent(agentId: string): Agent | null {
  const groups = loadAgentsConfig();
  for (const group of groups) {
    const agent = group.agents.find(a => a.id === agentId);
    if (agent) {
      return agent;
    }
  }
  return null;
}

function loadSkillDescription(skillPath: string): string {
  try {
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const match = content.match(/## When to Use[\s\S]*?(?=##|$)/i);
      if (match) {
        return match[0].replace(/## When to Use\n\n/i, '').trim();
      }
      return content.substring(0, 500);
    }
    return '';
  } catch (error) {
    console.error(`Failed to load skill from ${skillPath}:`, error);
    return '';
  }
}

function buildSystemPrompt(agent: Agent): string {
  const skillPrompts: string[] = [];

  for (const skill of agent.skills) {
    const skillDescription = loadSkillDescription(skill.storage_path);
    if (skillDescription) {
      skillPrompts.push(`【技能: ${skill.name}】\n${skillDescription}`);
    }
  }

  let systemPrompt = `你是 ${agent.name}。${agent.description || ''}\n\n`;

  if (skillPrompts.length > 0) {
    systemPrompt += `你可以使用以下技能：\n\n${skillPrompts.join('\n\n')}\n\n`;
    systemPrompt += `当用户请求涉及技能相关内容时，请自动调用相应技能。\n`;
  }

  return systemPrompt;
}

export async function chatWithAgent(agentId: string, userMessage: string): Promise<ChatResponse> {
  const agent = findAgent(agentId);

  if (!agent) {
    return {
      content: '',
      agent_id: agentId,
      error: `Agent ${agentId} not found`
    };
  }

  const systemPrompt = buildSystemPrompt(agent);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await axios.post(
      `${agent.config.url}/chat/completions`,
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
      agent_id: agentId,
      skill_used: agent.skills.length > 0 ? agent.skills[0].name : undefined
    };

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Chat API error:', axiosError.message);

    if (axiosError.response) {
      return {
        content: '',
        agent_id: agentId,
        error: `API错误: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
      };
    } else if (axiosError.request) {
      return {
        content: '',
        agent_id: agentId,
        error: '网络连接失败，请检查网络配置'
      };
    } else {
      return {
        content: '',
        agent_id: agentId,
        error: `请求失败: ${axiosError.message}`
      };
    }
  }
}

export function getAgentList(): Agent[] {
  const groups = loadAgentsConfig();
  const agents: Agent[] = [];
  for (const group of groups) {
    agents.push(...group.agents);
  }
  return agents;
}

export function getAgent(agentId: string): Agent | null {
  return findAgent(agentId);
}

export async function callSkill(
  skillName: string,
  parameters: Record<string, unknown>,
  agentId: string
): Promise<{ result: unknown; error?: string }> {
  const agent = findAgent(agentId);
  if (!agent) {
    return { result: null, error: `Agent ${agentId} not found` };
  }

  const skill = agent.skills.find(s => s.name === skillName);
  if (!skill) {
    return { result: null, error: `Skill ${skillName} not found` };
  }

  try {
    const skillDescription = loadSkillDescription(skill.storage_path);
    const systemPrompt = `你是一个技能执行器。请根据以下技能描述执行用户的请求。\n\n技能: ${skillName}\n${skillDescription}\n\n用户请求参数: ${JSON.stringify(parameters)}`;

    const response = await axios.post(
      `${agent.config.url}/chat/completions`,
      {
        model: agent.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请执行技能 ${skillName}，参数: ${JSON.stringify(parameters)}` }
        ],
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${agent.config.api_key}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return { result: response.data.choices?.[0]?.message?.content };

  } catch (error) {
    const axiosError = error as AxiosError;
    return { result: null, error: axiosError.message };
  }
}
