# SQLite + IndexedDB 混合存储方案实现计划

## 目标

按照数据存储设计文档的要求，实现聊天记录与技能调用的 SQLite + IndexedDB 混合存储方案。

## 实现步骤

### 1. 创建后端 SQLite 服务层

**文件**: `src-tauri/src/services/database.rs`

- 实现 SQLite 数据库连接管理
- 创建 chat_messages 和 skill_calls 表的 CRUD 操作
- 添加事务支持
- 暴露 Tauri 命令供前端调用

### 2. 创建 Tauri 命令接口

**文件**: `src-tauri/src/commands/mod.rs` 或 `src-tauri/src/main.rs`

添加以下命令：
- `sync_message`: 同步消息到 SQLite
- `sync_skill_call`: 同步技能调用到 SQLite
- `get_messages`: 从 SQLite 获取消息
- `get_skill_calls`: 从 SQLite 获取技能调用
- `clean_expired_data`: 清理过期数据（可选）

### 3. 更新前端 IndexedDB 服务

**文件**: `src/services/chatHistoryService.ts`

- 添加 IndexedDB 热数据淘汰逻辑（清理3天前数据）
- 同步写入 SQLite 的调用
- 优先从 IndexedDB 读取，未命中则从 SQLite 读取

### 4. 创建混合存储核心类

**文件**: `src/services/hybridStorage.ts`

新建混合存储服务：
- HybridStorage 类封装读写逻辑
- 热数据天数配置（默认3天）
- 定时清理任务
- SQLite/IndexedDB 数据同步

### 5. 更新 ChatContainer 组件

**文件**: `src/components/chat/ChatContainer.tsx`

- 使用新的混合存储服务
- 确保消息和技能调用正确存储

### 6. 添加数据库初始化脚本

**文件**: `src-tauri/scripts/init_db.sql`

- 创建表结构
- 创建索引（符合设计文档中的复合索引）

## 技术细节

### 存储流程

```
写入:
用户发送消息 → 同步写入SQLite → 异步批量写IndexedDB → 返回成功

读取:
页面加载 → 优先读取IndexedDB(近3天) → 未命中则读取SQLite
```

### 热数据淘汰

- 每天首次启动时清理3天前的 IndexedDB 数据
- 使用事务批量删除

### 关键配置

- 热数据保留天数: 3天（可配置）
- SQLite 路径: `./data/automate.db`
- IndexedDB 名称: `automate-db`

## 验收标准

1. 聊天消息同时写入 SQLite 和 IndexedDB
2. 技能调用同时写入 SQLite 和 IndexedDB
3. 页面加载优先从 IndexedDB 读取
4. 超过3天的数据从 SQLite 读取
5. 自动清理过期热数据
6. 设计文档与代码实现一致
