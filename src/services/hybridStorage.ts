import { openDB, DBSchema, IDBPDatabase } from 'idb';

const HOT_DATA_DAYS = 3;

export interface ChatMessageRecord {
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

export interface SkillCallRecord {
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

export async function cleanExpiredIndexedDBData(): Promise<void> {
  const db = await getDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HOT_DATA_DAYS);
  const cutoffStr = cutoffDate.toISOString();

  const allChatMessages = await db.getAll('chat_messages');
  const allSkillCalls = await db.getAll('skill_calls');

  let deletedMessages = 0;
  for (const msg of allChatMessages) {
    if (msg.send_time < cutoffStr && msg.id) {
      await db.delete('chat_messages', msg.id);
      deletedMessages++;
    }
  }

  let deletedSkills = 0;
  for (const call of allSkillCalls) {
    if (call.call_time < cutoffStr && call.id) {
      await db.delete('skill_calls', call.id);
      deletedSkills++;
    }
  }

  console.log(`[HybridStorage] 已清理过期数据: ${deletedMessages} 条消息, ${deletedSkills} 条技能调用`);
}

async function checkAndCleanExpiredData(): Promise<void> {
  const lastCleanKey = 'last-indexeddb-clean';
  const lastClean = localStorage.getItem(lastCleanKey);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (lastClean !== today) {
    await cleanExpiredIndexedDBData();
    localStorage.setItem(lastCleanKey, today);
  }
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
  await checkAndCleanExpiredData();

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

  const db = await getDB();
  const id = await db.add('chat_messages', record);

  console.log('[HybridStorage] 消息保存成功, id:', id);
  return id as number;
}

export async function getLast24HoursChatMessages(agentId: string): Promise<ChatMessageRecord[]> {
  await checkAndCleanExpiredData();

  const db = await getDB();
  const since = new Date();
  since.setDate(since.getDate() - 1);
  const sinceStr = since.toISOString();

  const allMessages = await db.getAllFromIndex('chat_messages', 'by-agent', agentId);
  const recentMessages = allMessages.filter(m => m.send_time >= sinceStr);

  if (recentMessages.length > 0) {
    recentMessages.sort((a, b) => new Date(a.send_time).getTime() - new Date(b.send_time).getTime());
    console.log('[HybridStorage] 从 IndexedDB 加载', recentMessages.length, '条消息');
    return recentMessages;
  }

  console.log('[HybridStorage] IndexedDB 无数据');
  return [];
}

export async function deleteLastAiMessage(agentId: string): Promise<number | null> {
  const db = await getDB();
  const messages = await db.getAllFromIndex('chat_messages', 'by-agent', agentId);

  const aiMessages = messages
    .filter(m => m.message_type === 'assistant')
    .sort((a, b) => new Date(b.send_time).getTime() - new Date(a.send_time).getTime());

  if (aiMessages.length > 0 && aiMessages[0].id) {
    await db.delete('chat_messages', aiMessages[0].id);
    console.log('[HybridStorage] 删除最后 AI 消息, id:', aiMessages[0].id);
    return aiMessages[0].id;
  }
  return null;
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

  console.log('[HybridStorage] 技能调用保存成功, id:', id);
  return id as number;
}

export async function getSkillCalls(agentId: string): Promise<SkillCallRecord[]> {
  await checkAndCleanExpiredData();

  const db = await getDB();
  const allCalls = await db.getAllFromIndex('skill_calls', 'by-agent', agentId);

  if (allCalls.length > 0) {
    allCalls.sort((a, b) => new Date(a.call_time).getTime() - new Date(b.call_time).getTime());
    console.log('[HybridStorage] 从 IndexedDB 加载', allCalls.length, '条技能调用');
    return allCalls;
  }

  console.log('[HybridStorage] IndexedDB 无技能调用');
  return [];
}

export async function deleteSkillCallByMessageId(messageId: number): Promise<void> {
  const db = await getDB();
  const calls = await db.getAllFromIndex('skill_calls', 'by-message', messageId);
  for (const call of calls) {
    if (call.id) {
      await db.delete('skill_calls', call.id);
    }
  }
  console.log('[HybridStorage] 删除技能调用, messageId:', messageId);
}

export async function initHybridStorage(): Promise<void> {
  await getDB();
  await checkAndCleanExpiredData();
  console.log('[HybridStorage] IndexedDB 存储初始化完成');
}
