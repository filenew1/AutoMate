# 修复主题切换和智能体头像问题 - 实施计划

## 问题分析

### 问题1：主题切换没有效果
- 用户反馈切换主题后完全没有变化
- 需要深入检查所有主题相关组件的实现

### 问题2：智能体列表图标都长一样
- `agents.json` 配置文件中有 `avatar` 属性（如 "avatar-1.png"）
- 但 `useAppStore.ts` 中的 `Agent` 接口只有 `avatarColor`，没有 `avatar`
- `AgentItem.tsx` 只使用 `avatarColor`，没有使用 `avatar` 属性

## 修复任务

### [ ] 任务1：修复 WelcomePage.tsx 的语法错误
- **优先级**：P0
- **描述**：WelcomePage.tsx 中有语法错误，导致组件无法正常渲染
- **修复内容**：
  - 修复第59行的语法错误（多余的 `{`）
  - 修复第136行的语法错误
- **成功标准**：WelcomePage.tsx 可以正常编译和渲染
- **测试要求**：
  - `programmatic`：代码没有 TypeScript 错误
  - `human-judgement`：欢迎页面正常显示

### [ ] 任务2：更新 Agent 接口支持 avatar 属性
- **优先级**：P0
- **描述**：在 useAppStore.ts 中更新 Agent 接口，添加 avatar 属性
- **修复内容**：
  - 在 Agent 接口中添加 `avatar?: string` 属性
- **成功标准**：TypeScript 类型正确，支持 avatar 属性
- **测试要求**：
  - `programmatic`：类型检查通过

### [ ] 任务3：修改 AgentItem.tsx 支持 avatar 显示
- **优先级**：P0
- **描述**：更新 AgentItem.tsx，根据 avatar 属性显示不同的图标
- **修复内容**：
  - 更新接口定义，支持 avatar 属性
  - 根据 avatar 属性（如 "avatar-1.png", "avatar-2.png", "avatar-3.png"）映射到不同的颜色和图标
  - avatar-1.png → 蓝色（机器人图标）
  - avatar-2.png → 紫色（代码图标）
  - avatar-3.png → 橙色（待办图标）
- **成功标准**：每个智能体显示不同的头像
- **测试要求**：
  - `human-judgement`：3个智能体显示不同的图标和颜色

### [ ] 任务4：使用 Chrome DevTools MCP 测试主题切换
- **优先级**：P1
- **描述**：全面测试主题切换功能
- **测试内容**：
  - 点击主题切换按钮
  - 验证欢迎页面的统计卡片颜色变化
  - 验证侧边栏背景色变化
  - 验证文字颜色变化
  - 验证智能体列表项的背景色变化
- **成功标准**：主题切换后所有元素都正确更新
- **测试要求**：
  - `human-judgement`：主题切换有明显的视觉变化
