# 修复思考内容与正式内容分离问题

## 问题描述

用户使用 DeepSeek-R1 模型时，思考内容没有与正式内容分离。

**根本原因**：
- 当前正则表达式只匹配中文格式：`/(?:思考|分析|推理)[:：]\s*([\s\S]+?)(?=\n\n|$)/i`
- DeepSeek-R1 使用的是 `<think>...</think>` 标签格式
- 输出的内容中包含 HTML 实体编码（如 `&lt;think&gt;`），需要解码

## 修复方案

### 1. 修改正则表达式（ChatContainer.tsx）

需要同时支持两种格式：
- 中文格式：`思考:`、`分析:`、`推理:`
- DeepSeek-R1 格式：`<think>...</think>`

### 2. 添加 HTML 实体解码

清理思考内容中的 HTML 实体编码：
- `&lt;` → `<`
- `&gt;` → `>`
- `&amp;` → `&`

### 3. 清理主内容中的 think 标签

从主内容中移除 `<think>...</think>` 标签

## 修改位置

### 文件：`f:\AI软件\AutoMate\src\components\chat\ChatContainer.tsx`

1. **第128-129行**：消息完成时的正则提取
2. **第131-134行**：主内容清理逻辑
3. **第209-210行**：流式输出时的正则提取  
4. **第212-215行**：主内容清理逻辑

## 具体修改

### 第128-134行修改为：

```typescript
// 提取思考内容 - 支持中文格式和 <think> 标签格式
const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i)
const thinkingMatch = fullContent.match(/(?:思考|分析|推理)[:：]\s*([\s\S]+?)(?=\n\n|$)/i)

let thinkingContent: string | undefined
if (thinkMatch) {
  // 解码 HTML 实体
  thinkingContent = thinkMatch[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
} else if (thinkingMatch) {
  thinkingContent = thinkingMatch[1].trim()
}

// 清理主内容 - 移除 think 标签和中文思考标记
const mainContent = fullContent
  .replace(/【技能:\s*[^】]+】\s*(已激活)?\n*/g, '')
  .replace(/<think>[\s\S]*?<\/think>/gi, '')
  .replace(/(?:思考|分析|推理)[:：]\s*[\s\S]+?(?=\n\n|$)/gi, '')
  .trim()
```

### 第209-215行做相同修改
