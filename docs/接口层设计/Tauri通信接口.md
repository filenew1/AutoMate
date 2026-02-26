# Tauri通信接口

本文档定义了AutoMate项目中Tauri前后端通信接口规范。

## 1. Tauri通信概述

### 1.1 通信方式

AutoMate使用Tauri框架进行前后端通信，支持以下通信方式：

- **invoke API**：前端调用后端函数
- **事件系统**：后端向前端推送消息
- **双向通信**：支持前端和后端的双向通信

### 1.2 通信架构

```
前端（React）
    ↓ invoke API
后端（Node.js）
    ↓ 事件系统
前端（React）
```

## 2. invoke API

### 2.1 基本用法

**前端调用后端函数：**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// 调用后端函数
const result = await invoke('function_name', { param1: 'value1', param2: 'value2' });

console.log(result);
```

**后端定义函数：**

```javascript
// src-tauri/src/main.rs
// 注意：Tauri的后端函数定义在Rust中，但我们可以通过Rust调用Node.js

// 或者使用Tauri的插件系统，在Node.js中实现后端逻辑

// 以下是Node.js实现示例（通过子进程或插件调用）

// Node.js函数实现
function function_name(param1, param2) {
  """后端函数实现."""
  return {
    'result': 'success',
    'data': {
      'param1': param1,
      'param2': param2
    }
  };
}
```

### 2.2 智能体管理接口

**获取智能体列表：**

```typescript
// 前端调用
const agents = await invoke('get_agents', {
  group_name: 'chat',
  online_status: true
});

console.log(agents);
```

```javascript
// 后端实现
function get_agents(group_name = null, online_status = null) {
  """获取智能体列表."""
  const agents = load_agents_from_config();

  if (group_name) {
    agents = agents.filter(agent => agent.group_name === group_name);
  }

  if (online_status !== null) {
    agents = agents.filter(agent => agent.online_status === online_status);
  }

  return agents;
}

// 加载智能体配置
function load_agents_from_config() {
  const fs = require('fs');
  const path = require('path');
  const configPath = path.resolve(__dirname, '..', 'config', 'agents.json');
  
  try {
    const config = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(config);
  } catch (error) {
    console.error('Error loading agents config:', error);
    return [];
  }
}
```

**获取单个智能体：**

```typescript
// 前端调用
const agent = await invoke('get_agent', { agent_id: 'agent1' });

console.log(agent);
```

```javascript
// 后端实现
function get_agent(agent_id) {
  """获取单个智能体."""
  const agents = load_agents_from_config();

  for (const agent of agents) {
    if (agent.id === agent_id) {
      return agent;
    }
  }

  throw new Error(`Agent ${agent_id} not found`);
}
```

**更新智能体状态：**

```typescript
// 前端调用
await invoke('update_agent_status', {
  agent_id: 'agent1',
  online_status: true,
  response_time: 150,
  status_message: 'Online'
});
```

```javascript
// 后端实现
function update_agent_status(agent_id, online_status, response_time, status_message) {
  """更新智能体状态."""
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE agent_states
       SET online_status = ?, response_time = ?, status_message = ?, updated_at = CURRENT_TIMESTAMP
       WHERE agent_id = ?`,
      [online_status, response_time, status_message, agent_id],
      function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ result: 'success' });
        }
      }
    );
  });
}
```

### 2.3 聊天消息接口

**发送消息：**

```typescript
// 前端调用
const message = await invoke('send_message', {
  content: '你好',
  agent_id: 'agent1',
  message_type: 'user'
});

console.log(message);
```

```javascript
// 后端实现
function send_message(content, agent_id, message_type) {
  """发送消息."""
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    // 计算消息长度
    const message_length = content.length;

    // 插入消息到数据库
    db.run(
      `INSERT INTO chat_messages
       (content, agent_id, message_type, message_length)
       VALUES (?, ?, ?, ?)`,
      [content, agent_id, message_type, message_length],
      function(err) {
        if (err) {
          db.close();
          reject(err);
        } else {
          const message_id = this.lastID;
          db.close();
          // 返回消息信息
          get_message(message_id).then(resolve).catch(reject);
        }
      }
    );
  });
}

// 获取消息详情
function get_message(message_id) {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM chat_messages WHERE id = ?',
      [message_id],
      (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}
```

**获取聊天记录：**

```typescript
// 前端调用
const messages = await invoke('get_messages', {
  agent_id: 'agent1',
  page: 1,
  page_size: 50
});

console.log(messages);
```

```javascript
// 后端实现
function get_messages(agent_id, page = 1, page_size = 50) {
  """获取聊天记录."""
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    const offset = (page - 1) * page_size;

    // 获取消息列表
    db.all(
      `SELECT * FROM chat_messages
       WHERE agent_id = ?
       ORDER BY send_time DESC
       LIMIT ? OFFSET ?`,
      [agent_id, page_size, offset],
      (err, messages) => {
        if (err) {
          db.close();
          reject(err);
        } else {
          // 获取总数
          db.get(
            'SELECT COUNT(*) as total FROM chat_messages WHERE agent_id = ?',
            [agent_id],
            (err, row) => {
              db.close();
              if (err) {
                reject(err);
              } else {
                resolve({
                  'messages': messages,
                  'total': row.total,
                  'page': page,
                  'page_size': page_size
                });
              }
            }
          );
        }
      }
    );
  });
}
```

**更新消息状态：**

```typescript
// 前端调用
await invoke('update_message_status', {
  message_id: 1,
  status: 'read'
});
```

```javascript
// 后端实现
function update_message_status(message_id, status) {
  """更新消息状态."""
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE chat_messages
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, message_id],
      function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ result: 'success' });
        }
      }
    );
  });
}
```

### 2.4 技能调用接口

**调用技能：**

```typescript
// 前端调用
const result = await invoke('call_skill', {
  skill_name: 'search',
  parameters: { query: 'AutoMate' },
  message_id: 1,
  agent_id: 'agent1'
});

console.log(result);
```

```javascript
// 后端实现
function call_skill(skill_name, parameters, message_id, agent_id) {
  """调用技能."""
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./data/automate.db');

  return new Promise((resolve, reject) => {
    // 插入技能调用记录
    db.run(
      `INSERT INTO skill_calls
       (message_id, agent_id, skill_name, parameters, status)
       VALUES (?, ?, ?, ?, ?)`,
      [message_id, agent_id, skill_name, JSON.stringify(parameters), 'pending'],
      function(err) {
        if (err) {
          db.close();
          reject(err);
        } else {
          const call_id = this.lastID;
          db.close();

          // 执行技能
          try {
            const start_time = Date.now();
            execute_skill(skill_name, parameters).then(result => {
              const execution_time = Date.now() - start_time;

              // 更新技能调用记录
              const db2 = new sqlite3.Database('./data/automate.db');
              db2.run(
                `UPDATE skill_calls
                   SET status = ?, result = ?, execution_time = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`,
                ['success', JSON.stringify(result), execution_time, call_id],
                function(err) {
                  db2.close();
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      'id': call_id,
                      'result': result,
                      'execution_time': execution_time
                    });
                  }
                }
              );
            }).catch(error => {
              // 更新技能调用记录为失败
              const db2 = new sqlite3.Database('./data/automate.db');
              db2.run(
                `UPDATE skill_calls
                   SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`,
                ['failed', error.message, call_id],
                function(err) {
                  db2.close();
                  reject(error);
                }
              );
            });
          } catch (error) {
            // 更新技能调用记录为失败
            const db2 = new sqlite3.Database('./data/automate.db');
            db2.run(
              `UPDATE skill_calls
                 SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
              ['failed', error.message, call_id],
              function(err) {
                db2.close();
                reject(error);
              }
            );
          }
        }
      }
    );
  });
}

// 执行技能
function execute_skill(skill_name, parameters) {
  return new Promise((resolve, reject) => {
    // 这里实现技能执行逻辑
    // 例如，调用外部API或执行本地脚本
    setTimeout(() => {
      resolve({ result: 'Skill executed successfully', data: parameters });
    }, 1000);
  });
}
```

### 2.5 文件上传接口

**上传文件：**

```typescript
// 前端调用
const result = await invoke('upload_file', {
  file_path: '/path/to/file.txt',
  message_id: 1
});

console.log(result);
```

```javascript
// 后端实现
function upload_file(file_path, message_id) {
  """上传文件."""
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  return new Promise((resolve, reject) => {
    // 读取文件信息
    const file_name = path.basename(file_path);
    const file_size = fs.statSync(file_path).size;
    const file_type = require('mime-types').lookup(file_name) || 'application/octet-stream';

    // 计算文件哈希
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file_path);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      const file_hash = hash.digest('hex');

      // 确定存储目录
      let storage_dir;
      if (file_type.startsWith('image/')) {
        storage_dir = './data/files/attachments/images';
      } else if (file_type.startsWith('text/')) {
        storage_dir = './data/files/attachments/documents';
      } else {
        storage_dir = './data/files/attachments/others';
      }

      // 确保目录存在
      if (!fs.existsSync(storage_dir)) {
        fs.mkdirSync(storage_dir, { recursive: true });
      }

      // 生成存储路径
      const storage_path = path.join(storage_dir, file_hash + path.extname(file_name));

      // 复制文件
      fs.copyFile(file_path, storage_path, (err) => {
        if (err) {
          reject(err);
        } else {
          // 保存文件元数据到数据库
          const sqlite3 = require('sqlite3').verbose();
          const db = new sqlite3.Database('./data/automate.db');

          db.run(
            `INSERT INTO file_attachments
               (message_id, file_name, file_type, file_size, storage_path, file_hash)
               VALUES (?, ?, ?, ?, ?, ?)`,
            [message_id, file_name, file_type, file_size, storage_path, file_hash],
            function(err) {
              db.close();
              if (err) {
                reject(err);
              } else {
                resolve({
                  'file_name': file_name,
                  'file_type': file_type,
                  'file_size': file_size,
                  'storage_path': storage_path,
                  'file_hash': file_hash
                });
              }
            }
          );
        }
      });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
```

## 3. 事件系统

### 3.1 基本用法

**前端监听事件：**

```typescript
import { listen } from '@tauri-apps/api/event';

// 监听事件
const unlisten = await listen('event-name', (event) => {
  console.log('Received event:', event.payload);
});

// 取消监听
unlisten();
```

**后端发送事件：**

```javascript
// 后端发送事件
function send_event(app, event_name, payload) {
  """发送事件到前端."""
  // 注意：Tauri的事件发送在Rust中实现
  // 这里是通过Node.js调用Rust函数的示例
  // 实际实现需要根据Tauri的插件系统或IPC机制
  
  // 示例：通过子进程调用Rust命令发送事件
  const { exec } = require('child_process');
  exec(`tauri emit ${event_name} ${JSON.stringify(payload)}`);
}
```

### 3.2 智能体事件

**智能体状态变化事件：**

```typescript
// 前端监听
await listen('agent-status-changed', (event) => {
  const { agent_id, online_status, response_time } = event.payload;
  console.log(`Agent ${agent_id} status changed: ${online_status}`);
});
```

```javascript
// 后端发送
function on_agent_status_changed(agent_id, online_status, response_time) {
  """智能体状态变化时发送事件."""
  send_event(app, 'agent-status-changed', {
    'agent_id': agent_id,
    'online_status': online_status,
    'response_time': response_time
  });
}
```

**智能体配置更新事件：**

```typescript
// 前端监听
await listen('agent-config-updated', (event) => {
  const { agents } = event.payload;
  console.log('Agent config updated:', agents);
});
```

```javascript
// 后端发送
function on_agent_config_updated(agents) {
  """智能体配置更新时发送事件."""
  send_event(app, 'agent-config-updated', {
    'agents': agents
  });
}
```

### 3.3 聊天消息事件

**新消息事件：**

```typescript
// 前端监听
await listen('new-message', (event) => {
  const { message } = event.payload;
  console.log('New message:', message);
});
```

```javascript
// 后端发送
function on_new_message(message) {
  """新消息时发送事件."""
  send_event(app, 'new-message', {
    'message': message
  });
}
```

**消息状态变化事件：**

```typescript
// 前端监听
await listen('message-status-changed', (event) => {
  const { message_id, status } = event.payload;
  console.log(`Message ${message_id} status changed: ${status}`);
});
```

```javascript
// 后端发送
function on_message_status_changed(message_id, status) {
  """消息状态变化时发送事件."""
  send_event(app, 'message-status-changed', {
    'message_id': message_id,
    'status': status
  });
}
```

### 3.4 技能调用事件

**技能调用开始事件：**

```typescript
// 前端监听
await listen('skill-call-started', (event) => {
  const { call_id, skill_name } = event.payload;
  console.log(`Skill ${skill_name} started: ${call_id}`);
});
```

```javascript
// 后端发送
function on_skill_call_started(call_id, skill_name) {
  """技能调用开始时发送事件."""
  send_event(app, 'skill-call-started', {
    'call_id': call_id,
    'skill_name': skill_name
  });
}
```

**技能调用完成事件：**

```typescript
// 前端监听
await listen('skill-call-completed', (event) => {
  const { call_id, result, execution_time } = event.payload;
  console.log(`Skill call completed: ${call_id}`, result);
});
```

```javascript
// 后端发送
function on_skill_call_completed(call_id, result, execution_time) {
  """技能调用完成时发送事件."""
  send_event(app, 'skill-call-completed', {
    'call_id': call_id,
    'result': result,
    'execution_time': execution_time
  });
}
```

**技能调用失败事件：**

```typescript
// 前端监听
await listen('skill-call-failed', (event) => {
  const { call_id, error } = event.payload;
  console.error(`Skill call failed: ${call_id}`, error);
});
```

```javascript
// 后端发送
function on_skill_call_failed(call_id, error) {
  """技能调用失败时发送事件."""
  send_event(app, 'skill-call-failed', {
    'call_id': call_id,
    'error': error
  });
}
```

## 4. 错误处理

### 4.1 错误处理策略

**前端错误处理：**

```typescript
try {
  const result = await invoke('function_name', { param: 'value' });
  console.log(result);
} catch (error) {
  console.error('Error invoking function:', error);
  // 处理错误
}
```

**后端错误处理：**

```javascript
// 后端错误处理
function function_name(param) {
  """后端函数实现."""
  try {
    // 函数逻辑
    return {'result': 'success'};
  } catch (error) {
    // 记录错误
    console.error('Error in function_name:', error);

    // 发送错误事件到前端
    send_event(app, 'error', {
      'function': 'function_name',
      'error': error.message
    });

    // 重新抛出异常
    throw error;
  }
}
```

### 4.2 错误类型

**常见错误类型：**

- `InvokeError`: invoke调用失败
- `TimeoutError`: 调用超时
- `ValidationError`: 参数验证失败
- `DatabaseError`: 数据库操作失败

**错误处理示例：**

```typescript
try {
  const result = await invoke('function_name', { param: 'value' });
} catch (error) {
  if (error instanceof InvokeError) {
    console.error('Invoke error:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Timeout error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 5. 性能优化

### 5.1 批量调用

**批量调用示例：**

```typescript
// 批量调用多个函数
const results = await Promise.all([
  invoke('get_agents'),
  invoke('get_messages', { agent_id: 'agent1' }),
  invoke('get_skills')
]);

console.log(results);
```

### 5.2 缓存策略

**缓存调用结果：**

```typescript
// 使用缓存
let cachedAgents: Agent[] | null = null;

async function getAgents(): Promise<Agent[]> {
  if (cachedAgents) {
    return cachedAgents;
  }

  cachedAgents = await invoke('get_agents');
  return cachedAgents;
}
```

### 5.3 防抖和节流

**防抖示例：**

```typescript
import { debounce } from 'lodash-es';

const debouncedSearch = debounce(async (searchTerm: string) => {
  const results = await invoke('search_agents', { term: searchTerm });
  console.log(results);
}, 300);

// 使用防抖函数
debouncedSearch('search term');
```

## 6. 安全性

### 6.1 参数验证

**前端参数验证：**

```typescript
function validateParams(params: any): boolean {
  if (!params || typeof params !== 'object') {
    return false;
  }

  // 验证必需参数
  if (!params.required_param) {
    return false;
  }

  return true;
}

// 调用前验证
if (validateParams(params)) {
  const result = await invoke('function_name', params);
}
```

**后端参数验证：**

```javascript
// 后端参数验证
function validateParams(params) {
  """验证函数参数."""
  if (!params || typeof params !== 'object') {
    throw new Error('Params must be an object');
  }

  // 验证必需参数
  if (!params.required_param) {
    throw new Error('required_param must not be empty');
  }

  // 验证参数类型
  if (typeof params.required_param !== 'string') {
    throw new Error('required_param must be a string');
  }

  // 验证可选参数
  if (params.optional_param && typeof params.optional_param !== 'string') {
    throw new Error('optional_param must be a string');
  }

  return true;
}

function function_name(params) {
  """后端函数实现."""
  // 验证参数
  validateParams(params);

  return {'result': 'success'};
}
```

### 6.2 权限控制

**权限检查：**

```javascript
// 后端实现
function check_permission(permission) {
  """检查权限."""
  // 实现权限检查逻辑
  return true;
}

function function_name(params) {
  """后端函数实现."""
  // 检查权限
  if (!check_permission('function_name')) {
    throw new Error('Permission denied');
  }

  // 函数逻辑
  return {'result': 'success'};
}
```

## 7. 调试

### 7.1 日志记录

**前端日志：**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// 调用前记录日志
console.log('Invoking function_name with params:', params);

const result = await invoke('function_name', params);

// 调用后记录日志
console.log('Function result:', result);
```

**后端日志：**

```javascript
// 后端日志
function function_name(params) {
  """后端函数实现."""
  console.log('function_name called with params:', params);

  try {
    // 函数逻辑
    const result = {'result': 'success'};
    console.log('function_name result:', result);
    return result;
  } catch (error) {
    console.error('Error in function_name:', error);
    throw error;
  }
}

// 或者使用更复杂的日志库
// const winston = require('winston');
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' })
//   ]
// });
```

### 7.2 错误追踪

**错误追踪示例：**

```typescript
try {
  const result = await invoke('function_name', params);
} catch (error) {
  // 记录错误堆栈
  console.error('Error stack:', error.stack);

  // 发送错误到服务器
  await invoke('log_error', {
    function: 'function_name',
    error: error.message,
    stack: error.stack
  });
}
```

## 8. 参考资源

- [Tauri官方文档](https://tauri.app/)
- [Tauri invoke API文档](https://tauri.app/v1/api/js/modules/tauri/)
- [Tauri事件系统文档](https://tauri.app/v1/api/js/modules/tauri/event/)
