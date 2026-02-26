# 后端API接口

本文档定义了AutoMate项目后端API接口规范，使用Node.js框架实现（如Express.js）。

## 1. API概述

### 1.1 API设计原则

- 遵循RESTful设计风格
- 使用HTTP动词表示操作类型
- 使用HTTP状态码表示响应状态
- 统一的响应格式
- 支持异步处理

### 1.2 基础URL

- 开发环境：`http://localhost:8000/api`
- 生产环境：根据部署配置

### 1.3 通用响应格式

**成功响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**错误响应：**

```json
{
  "code": 400,
  "message": "Bad Request",
  "details": {
    "field": "content",
    "error": "This field is required."
  }
}
```

### 1.4 HTTP状态码

| 状态码 | 说明 |
| :--- | :--- |
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 2. 智能体管理API

### 2.1 获取智能体列表

**接口描述：**

获取所有智能体列表。

**请求信息：**

- **URL**：`/api/agents`
- **方法**：`GET`
- **认证**：不需要

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `group_name` | string | 否 | 分组名称，用于筛选 |
| `online_status` | boolean | 否 | 在线状态，用于筛选 |

**请求示例：**

```bash
GET /api/agents?group_name=chat&online_status=true
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "agents": [
      {
        "id": "agent1",
        "name": "Assistant",
        "description": "智能助手",
        "avatar": "/avatars/agent1.png",
        "type": "chat",
        "group_name": "chat",
        "online_status": true,
        "response_time": 150
      }
    ],
    "total": 1
  }
}
```

### 2.2 获取单个智能体

**接口描述：**

获取指定智能体的详细信息。

**请求信息：**

- **URL**：`/api/agents/{agent_id}`
- **方法**：`GET`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `agent_id` | string | 是 | 智能体ID |

**请求示例：**

```bash
GET /api/agents/agent1
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "agent1",
    "name": "Assistant",
    "description": "智能助手",
    "avatar": "/avatars/agent1.png",
    "type": "chat",
    "group_name": "chat",
    "online_status": true,
    "response_time": 150,
    "skills": [
      {
        "name": "search",
        "version": "1.0.0",
        "description": "搜索功能"
      }
    ]
  }
}
```

### 2.3 更新智能体状态

**接口描述：**

更新智能体的在线状态和响应时间。

**请求信息：**

- **URL**：`/api/agents/{agent_id}/status`
- **方法**：`PUT`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `agent_id` | string | 是 | 智能体ID |

**请求体：**

```json
{
  "online_status": true,
  "response_time": 150,
  "status_message": "Online"
}
```

**请求示例：**

```bash
PUT /api/agents/agent1/status
Content-Type: application/json

{
  "online_status": true,
  "response_time": 150,
  "status_message": "Online"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "Agent status updated successfully",
  "data": null
}
```

## 3. 聊天消息API

### 3.1 发送消息

**接口描述：**

向智能体发送消息。

**请求信息：**

- **URL**：`/api/messages`
- **方法**：`POST`
- **认证**：不需要

**请求体：**

```json
{
  "content": "你好",
  "agent_id": "agent1",
  "message_type": "user"
}
```

**请求示例：**

```bash
POST /api/messages
Content-Type: application/json

{
  "content": "你好",
  "agent_id": "agent1",
  "message_type": "user"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "Message sent successfully",
  "data": {
    "id": 1,
    "content": "你好",
    "agent_id": "agent1",
    "agent_name": "Assistant",
    "user_id": "user1",
    "user_name": "User",
    "message_type": "user",
    "send_time": "2024-01-01T00:00:00Z",
    "status": "sent",
    "message_length": 2,
    "has_attachment": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 获取聊天记录

**接口描述：**

获取指定智能体的聊天记录。

**请求信息：**

- **URL**：`/api/messages`
- **方法**：`GET`
- **认证**：不需要

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `agent_id` | string | 是 | 智能体ID |
| `page` | integer | 否 | 页码，默认1 |
| `page_size` | integer | 否 | 每页数量，默认50 |
| `start_time` | string | 否 | 开始时间 |
| `end_time` | string | 否 | 结束时间 |

**请求示例：**

```bash
GET /api/messages?agent_id=agent1&page=1&page_size=50
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "messages": [
      {
        "id": 1,
        "content": "你好",
        "agent_id": "agent1",
        "agent_name": "Assistant",
        "user_id": "user1",
        "user_name": "User",
        "message_type": "user",
        "send_time": "2024-01-01T00:00:00Z",
        "status": "read",
        "message_length": 2,
        "has_attachment": false,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 50
  }
}
```

### 3.3 更新消息状态

**接口描述：**

更新消息的状态（已发送、已送达、已读等）。

**请求信息：**

- **URL**：`/api/messages/{message_id}/status`
- **方法**：`PUT`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `message_id` | integer | 是 | 消息ID |

**请求体：**

```json
{
  "status": "read"
}
```

**请求示例：**

```bash
PUT /api/messages/1/status
Content-Type: application/json

{
  "status": "read"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "Message status updated successfully",
  "data": null
}
```

### 3.4 删除消息

**接口描述：**

删除指定消息。

**请求信息：**

- **URL**：`/api/messages/{message_id}`
- **方法**：`DELETE`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `message_id` | integer | 是 | 消息ID |

**请求示例：**

```bash
DELETE /api/messages/1
```

**响应示例：**

```json
{
  "code": 200,
  "message": "Message deleted successfully",
  "data": null
}
```

## 4. 技能调用API

### 4.1 调用技能

**接口描述：**

调用指定技能。

**请求信息：**

- **URL**：`/api/skills/call`
- **方法**：`POST`
- **认证**：不需要

**请求体：**

```json
{
  "skill_name": "search",
  "parameters": {
    "query": "AutoMate"
  },
  "message_id": 1,
  "agent_id": "agent1"
}
```

**请求示例：**

```bash
POST /api/skills/call
Content-Type: application/json

{
  "skill_name": "search",
  "parameters": {
    "query": "AutoMate"
  },
  "message_id": 1,
  "agent_id": "agent1"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "Skill called successfully",
  "data": {
    "id": 1,
    "message_id": 1,
    "agent_id": "agent1",
    "skill_name": "search",
    "parameters": {
      "query": "AutoMate"
    },
    "call_time": "2024-01-01T00:00:00Z",
    "status": "success",
    "result": {
      "results": [
        {
          "title": "AutoMate",
          "url": "https://example.com/automate"
        }
      ]
    },
    "execution_time": 500,
    "error_message": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 获取技能调用记录

**接口描述：**

获取技能调用记录。

**请求信息：**

- **URL**：`/api/skills/calls`
- **方法**：`GET`
- **认证**：不需要

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `message_id` | integer | 否 | 消息ID |
| `agent_id` | string | 否 | 智能体ID |
| `skill_name` | string | 否 | 技能名称 |
| `status` | string | 否 | 执行状态 |
| `page` | integer | 否 | 页码，默认1 |
| `page_size` | integer | 否 | 每页数量，默认50 |

**请求示例：**

```bash
GET /api/skills/calls?message_id=1&page=1&page_size=50
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "calls": [
      {
        "id": 1,
        "message_id": 1,
        "agent_id": "agent1",
        "skill_name": "search",
        "parameters": {
          "query": "AutoMate"
        },
        "call_time": "2024-01-01T00:00:00Z",
        "status": "success",
        "result": {
          "results": []
        },
        "execution_time": 500,
        "error_message": null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 50
  }
}
```

## 5. 文件上传API

### 5.1 上传文件

**接口描述：**

上传文件到服务器。

**请求信息：**

- **URL**：`/api/files/upload`
- **方法**：`POST`
- **认证**：不需要
- **Content-Type**：`multipart/form-data`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `file` | File | 是 | 上传的文件 |
| `message_id` | integer | 否 | 关联的消息ID |

**请求示例：**

```bash
POST /api/files/upload
Content-Type: multipart/form-data

file=@example.txt
message_id=1
```

**响应示例：**

```json
{
  "code": 200,
  "message": "File uploaded successfully",
  "data": {
    "file_name": "example.txt",
    "file_type": "text/plain",
    "file_size": 1024,
    "storage_path": "/data/files/attachments/example.txt",
    "file_hash": "abc123...",
    "upload_time": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5.2 下载文件

**接口描述：**

下载指定文件。

**请求信息：**

- **URL**：`/api/files/{file_hash}`
- **方法**：`GET`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `file_hash` | string | 是 | 文件哈希值 |

**请求示例：**

```bash
GET /api/files/abc123...
```

**响应：**

- 文件流
- Content-Type：根据文件类型
- Content-Disposition：`attachment; filename="example.txt"`

### 5.3 删除文件

**接口描述：**

删除指定文件。

**请求信息：**

- **URL**：`/api/files/{file_hash}`
- **方法**：`DELETE`
- **认证**：不需要

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `file_hash` | string | 是 | 文件哈希值 |

**请求示例：**

```bash
DELETE /api/files/abc123...
```

**响应示例：**

```json
{
  "code": 200,
  "message": "File deleted successfully",
  "data": null
}
```

## 6. 系统API

### 6.1 健康检查

**接口描述：**

检查系统健康状态。

**请求信息：**

- **URL**：`/api/health`
- **方法**：`GET`
- **认证**：不需要

**请求示例：**

```bash
GET /api/health
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 6.2 获取系统信息

**接口描述：**

获取系统信息。

**请求信息：**

- **URL**：`/api/system/info`
- **方法**：`GET`
- **认证**：不需要

**请求示例：**

```bash
GET /api/system/info
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "platform": "windows",
    "node_version": "18.0.0",
    "database_size": 1024000,
    "uptime": 3600
  }
}
```

## 7. 错误处理

### 7.1 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "code": 400,
  "message": "Bad Request",
  "details": {
    "field": "content",
    "error": "This field is required."
  }
}
```

### 7.2 常见错误码

| 错误码 | 说明 |
| :--- | :--- |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 7.3 错误处理示例

**参数验证错误：**

```json
{
  "code": 400,
  "message": "Validation error",
  "details": {
    "field": "content",
    "error": "This field is required."
  }
}
```

**资源不存在错误：**

```json
{
  "code": 404,
  "message": "Agent not found",
  "details": {
    "agent_id": "agent1"
  }
}
```

## 8. API版本控制

### 8.1 版本策略

- 使用URL路径进行版本控制
- 示例：`/api/v1/agents`
- 当前版本：`v1`

### 8.2 版本升级

- 新版本API在旧版本API废弃后至少保留6个月
- 提供版本升级指南
- 在响应头中添加API版本信息

## 9. API限流

### 9.1 限流策略

- 每个IP每分钟最多100次请求
- 超过限制返回429状态码

### 9.2 限流响应

```json
{
  "code": 429,
  "message": "Too Many Requests",
  "details": {
    "retry_after": 60
  }
}
```

## 10. 参考资源

- [Express.js官方文档](https://expressjs.com/)
- [Node.js官方文档](https://nodejs.org/docs/latest-v18.x/api/)
- [RESTful API设计指南](https://restfulapi.net/)
