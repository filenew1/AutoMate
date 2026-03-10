import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessageRecord {
  id?: number;
  agent_id: string;
  agent_name: string;
  user_id: string;
  user_name: string;
  content: string;
  message_type: 'user' | 'assistant' | 'system';
  send_time: string;
  status: string;
  message_length: number;
  has_attachment: boolean;
  attachment_path?: string;
  skill_activated?: string;
  thinking_content?: string;
  created_at: string;
  updated_at: string;
}

interface SkillCallRecord {
  id?: number;
  message_id?: number;
  agent_id: string;
  skill_name: string;
  parameters?: string;
  call_time: string;
  status: 'pending' | 'success' | 'failed' | 'timeout';
  result?: string;
  execution_time: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface AutoMateDB extends DBSchema {
  chat_messages: {
    key: number;
    value: ChatMessageRecord;
    indexes: {
      'by-agent': string;
      'by-send-time': string;
      'by-agent-send-time': [string, string];
      'by-skill-activated': string;
    };
  };
  skill_calls: {
    key: number;
    value: SkillCallRecord;
    indexes: {
      'by-message': number;
      'by-call-time': string;
      'by-agent': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<AutoMateDB>> | null = null;

function getDB(): Promise<IDBPDatabase<AutoMateDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AutoMateDB>('automate-db', 1, {
      upgrade(db) {
        const chatStore = db.createObjectStore('chat_messages', {
          keyPath: 'id',
          autoIncrement: true,
        });
        chatStore.createIndex('by-agent', 'agent_id');
        chatStore.createIndex('by-send-time', 'send_time');
        chatStore.createIndex('by-agent-send-time', ['agent_id', 'send_time']);
        chatStore.createIndex('by-skill-activated', 'skill_activated');

        const skillStore = db.createObjectStore('skill_calls', {
          keyPath: 'id',
          autoIncrement: true,
        });
        skillStore.createIndex('by-message', 'message_id');
        skillStore.createIndex('by-call-time', 'call_time');
        skillStore.createIndex('by-agent', 'agent_id');
      },
    });
  }
  return dbPromise;
}

export async function saveChatMessage(
  agentId: string,
  agentName: string,
  content: string,
  messageType: 'user' | 'assistant' | 'system',
  skillActivated?: string[],
  thinkingContent?: string,
  status: string = 'sent'
): Promise<number> {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const record: ChatMessageRecord = {
    agent_id: agentId,
    agent_name: agentName,
    user_id: 'default_user',
    user_name: '用户',
    content,
    message_type: messageType,
    send_time: now,
    status,
    message_length: content.length,
    has_attachment: false,
    skill_activated: skillActivated ? skillActivated.join(',') : undefined,
    thinking_content: thinkingContent,
    created_at: now,
    updated_at: now,
  };

  console.log('[ChatHistory] 保存消息:', { agentId, messageType, content: content.substring(0, 50) });
  const id = await db.add('chat_messages', record);
  console.log('[ChatHistory] 消息保存成功, id:', id);
  return id as number;
}

export async function updateChatMessage(
  id: number,
  updates: Partial<Pick<ChatMessageRecord, 'content' | 'status' | 'skill_activated' | 'thinking_content'>>
): Promise<void> {
  const db = await getDB();
  const record = await db.get('chat_messages', id);
  if (record) {
    const updated = {
      ...record,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await db.put('chat_messages', updated);
  }
}

export async function deleteChatMessage(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('chat_messages', id);
}

export async function deleteLastAiMessage(agentId: string): Promise<number | null> {
  const db = await getDB();
  const messages = await db.getAllFromIndex('chat_messages', 'by-agent', agentId);
  
  const aiMessages = messages
    .filter(m => m.message_type === 'assistant')
    .sort((a, b) => new Date(b.send_time).getTime() - new Date(a.send_time).getTime());
  
  if (aiMessages.length > 0 && aiMessages[0].id) {
    await db.delete('chat_messages', aiMessages[0].id);
    return aiMessages[0].id;
  }
  return null;
}

export async function deleteSkillCallByMessageId(messageId: number): Promise<void> {
  const db = await getDB();
  const calls = await db.getAllFromIndex('skill_calls', 'by-message', messageId);
  for (const call of calls) {
    if (call.id) {
      await db.delete('skill_calls', call.id);
    }
  }
}

export async function saveSkillCall(
  agentId: string,
  skillName: string,
  messageId?: number,
  parameters?: Record<string, unknown>,
  status: 'pending' | 'success' | 'failed' | 'timeout' = 'pending'
): Promise<number> {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const record: SkillCallRecord = {
    message_id: messageId,
    agent_id: agentId,
    skill_name: skillName,
    parameters: parameters ? JSON.stringify(parameters) : undefined,
    call_time: now,
    status,
    execution_time: 0,
    created_at: now,
    updated_at: now,
  };

  const id = await db.add('skill_calls', record);
  return id as number;
}

export async function updateSkillCall(
  id: number,
  updates: Partial<Pick<SkillCallRecord, 'status' | 'result' | 'execution_time' | 'error_message'>>
): Promise<void> {
  const db = await getDB();
  const record = await db.get('skill_calls', id);
  if (record) {
    const updated = {
      ...record,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await db.put('skill_calls', updated);
  }
}

export async function getChatMessages(
  agentId: string,
  since?: Date
): Promise<ChatMessageRecord[]> {
  const db = await getDB();
  let messages: ChatMessageRecord[];
  
  if (since) {
    messages = await db.getAllFromIndex('chat_messages', 'by-agent', agentId);
    const sinceStr = since.toISOString();
    messages = messages.filter(m => m.send_time >= sinceStr);
  } else {
    messages = await db.getAllFromIndex('chat_messages', 'by-agent', agentId);
  }
  
  console.log('[ChatHistory] 获取消息:', { agentId, count: messages.length, since: since?.toISOString() });
  return messages.sort((a, b) => 
    new Date(a.send_time).getTime() - new Date(b.send_time).getTime()
  );
}

export async function getSkillCalls(agentId: string): Promise<SkillCallRecord[]> {
  const db = await getDB();
  const calls = await db.getAllFromIndex('skill_calls', 'by-agent', agentId);
  return calls.sort((a, b) => 
    new Date(a.call_time).getTime() - new Date(b.call_time).getTime()
  );
}

export async function getLast24HoursChatMessages(agentId: string): Promise<ChatMessageRecord[]> {
  const since = new Date();
  since.setDate(since.getDate() - 1);
  return getChatMessages(agentId, since);
}
