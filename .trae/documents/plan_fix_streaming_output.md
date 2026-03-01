# 修复流式输出问题计划

## 问题描述
用户反馈消息内容没有流式输出效果，内容是一次性显示的，而不是逐步显示。

## 问题分析
经过代码分析，问题可能出在以下几个环节：

1. **API 流式响应问题**：虽然请求中设置了 `stream: true`，但可能后端/API 没有正确返回 SSE 流式数据

2. **前端流式处理问题**：可能存在以下情况：
   - API 一次性返回所有数据
   - onChunk 回调没有正确触发 UI 更新
   - 消息内容更新后组件没有重新渲染

3. **状态更新问题**：React 状态更新可能没有正确触发

## 修复步骤

### 步骤 1: 检查 useAgentChat 中的流式处理
- 检查 `streamChatWithAgent` 函数是否正确解析 SSE 流
- 确保 onChunk 回调被正确调用
- 添加调试日志验证流式数据是否到达

### 步骤 2: 检查 ChatContainer 中的状态更新
- 确保 `updateMessageContent` 正确更新状态
- 检查 `isStreaming` 状态是否正确传递到消息组件

### 步骤 3: 检查 EnhancedMessageBubble 组件
- 验证组件是否正确接收 `isStreaming` 属性
- 确保光标闪烁效果正常显示

### 步骤 4: 测试验证
- 使用开发工具验证 API 是否返回流式数据
- 验证内容是否逐步显示

## 实现细节
需要修改的文件：
- `src/types/chat.ts` - 检查流式解析逻辑
- `src/hooks/useAgentChat.ts` - 添加调试日志
- `src/components/chat/ChatContainer.tsx` - 检查状态更新
- `src/components/chat/EnhancedMessageBubble.tsx` - 验证流式显示
