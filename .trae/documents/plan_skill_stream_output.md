# 计划：将技能响应改为流式输出

## 目标

将技能响应（official-doc-optimize 等）从非流式输出改为流式输出，让用户能看到逐步输出的内容。

## 问题分析

当前逻辑（第75-81行）：

```typescript
const skillUsed = agent?.skills?.[0]
const shouldStream = !isSkillResponse(skillUsed)  // 技能响应不走流式

if (shouldStream) {
  handleStreamSend(userMessage, skillUsed)
} else {
  handleNonStreamSend(userMessage, skillUsed)  // 非流式
}
```

## 修改步骤

### 1. 修改 ChatContainer.tsx

移除技能响应不走流式的限制，改为全部使用流式输出：

* 删除或修改第75行的逻辑：`const shouldStream = !isSkillResponse(skillUsed)`

* 改为全部使用 `handleStreamSend`：`handleStreamSend(userMessage, skillUsed)`

* 或者直接移除条件判断，始终使用流式

### 2. 验证

* 测试发送带有技能的请求，观察是否流式输出

* 确保流式输出过程中，光标闪烁动画正常

* 检查 TypeScript 编译无误

