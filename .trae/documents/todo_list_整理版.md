# AutoMate 桌面智能体聊天系统开发任务待办清单

## 一、前端基础目录结构搭建

### 1.1 前端基础目录结构搭建

* [ ] 创建 src 目录

* [ ] 创建 src/components 子目录

* [ ] 创建 src/pages 子目录

* [ ] 创建 src/hooks 子目录

* [ ] 创建 src/stores 子目录

* [ ] 创建 src/utils 子目录

* [ ] 创建 src/types 子目录

* [ ] 创建 src/styles 子目录

* [ ] 创建 src/assets 子目录

* [ ] **验证**：检查所有目录是否成功创建，目录命名符合小驼峰命名规范

### 1.2 前端核心文件创建

* [ ] 创建 package.json（包含 React 18+、TypeScript 5.0+、Vite 5.0+、Tailwind CSS 3.0+等依赖）

* [ ] 创建 tsconfig.json（配置严格模式）

* [ ] 创建 vite.config.ts（配置路径别名和开发服务器）

* [ ] 创建 tailwind.config.js（配置深色模式支持）

* [ ] 创建 index.html

* [ ] 创建 main.tsx

* [ ] 创建 App.tsx

* [ ] **验证**：检查所有配置文件是否符合项目技术栈要求

### 1.3 前端组件目录结构搭建

* [ ] 创建 src/components/agent 子目录

* [ ] 创建 src/components/chat 子目录

* [ ] 创建 src/components/theme 子目录

* [ ] 创建 src/components/startup 子目录

* [ ] 创建 src/components/common 子目录

* [ ] 在每个子目录下创建 index.ts 导出文件

* [ ] **验证**：检查所有组件子目录和 index.ts 文件是否成功创建

### 1.4 前端页面目录结构搭建

* [ ] 创建 src/pages/WelcomePage 子目录

* [ ] 创建 src/pages/ChatPage 子目录

* [ ] 创建 src/pages/SettingsPage 子目录

* [ ] 在每个页面目录下创建 index.tsx 文件

* [ ] 在每个页面目录下创建对应的样式文件（.css或.module.css）

* [ ] **验证**：检查所有页面目录和文件是否成功创建

### 1.5 前端状态管理目录结构搭建

* [ ] 创建 src/stores/agentStore.ts（智能体状态）

* [ ] 创建 src/stores/chatStore.ts（聊天状态）

* [ ] 创建 src/stores/themeStore.ts（主题状态）

* [ ] 在每个 store 文件中定义状态和操作函数

* [ ] **验证**：检查所有 store 文件是否包含状态定义和操作函数

### 1.6 前端类型定义目录结构搭建

* [ ] 创建 src/types/agent.ts（智能体类型）

* [ ] 创建 src/types/chat.ts（聊天类型）

* [ ] 创建 src/types/message.ts（消息类型）

* [ ] 创建 src/types/file.ts（文件类型）

* [ ] 在每个类型文件中定义 TypeScript 接口或类型

* [ ] **验证**：检查所有类型定义是否完整且符合接口规范

### 1.7 前端工具函数目录结构搭建

* [ ] 创建 src/utils/logger.ts（日志工具）

* [ ] 创建 src/utils/encryption.ts（加密工具）

* [ ] 创建 src/utils/fileHandler.ts（文件处理工具）

* [ ] 创建 src/utils/dateFormatter.ts（日期格式化工具）

* [ ] 在每个工具函数文件中添加完整的类型注解

* [ ] **验证**：检查所有工具函数是否可复用且有完整类型注解

### 1.8 前端样式目录结构搭建

* [ ] 创建 src/styles/global.css（全局样式，包含基础样式重置）

* [ ] 创建 src/styles/variables.css（CSS变量）

* [ ] 创建 src/styles/themes.css（浅色和深色主题样式）

* [ ] **验证**：检查所有样式文件是否符合 Tailwind CSS 规范

### 1.9 前端资源目录结构搭建

* [ ] 创建 src/assets/images 子目录

* [ ] 创建 src/assets/icons 子目录

* [ ] 创建 src/assets/fonts 子目录

* [ ] 在每个子目录下创建 README 说明文件或示例资源文件

* [ ] **验证**：检查所有资源子目录是否创建成功

### 1.10 前端路由配置目录结构搭建

* [ ] 创建 src/router 目录

* [ ] 创建 src/router/index.tsx（路由配置文件）

* [ ] 配置 BrowserRouter、Routes、Route

* [ ] 定义 /、/chat/:agentId、/settings 路由

* [ ] **验证**：检查路由配置是否正确，使用 React Router 6.0+

### 1.11 前端hooks目录结构搭建

* [ ] 创建 src/hooks/useLocalStorage.ts（本地存储hook）

* [ ] 创建 src/hooks/useTheme.ts（主题hook）

* [ ] 创建 src/hooks/useAgent.ts（智能体hook）

* [ ] 在每个 hook 文件中添加完整的类型注解

* [ ] **验证**：检查所有 hooks 是否可复用且符合 React 规范

### 1.12 前端目录结构验证测试

* [ ] 检查所有目录是否按照设计文档要求创建

* [ ] 检查目录命名是否规范

* [ ] 检查文件组织是否合理

* [ ] 检查是否有冗余目录或文件

* [ ] 检查目录结构是否清晰可辨

* [ ] **验证**：所有目录和文件符合设计文档要求

## 二、后端基础目录结构搭建

### 2.1 后端基础目录结构搭建

* [ ] 创建 backend 目录

* [ ] 创建 backend/api 子目录

* [ ] 创建 backend/services 子目录

* [ ] 创建 backend/models 子目录

* [ ] 创建 backend/utils 子目录

* [ ] 创建 backend/config 子目录

* [ ] 创建 backend/data 子目录

* [ ] **验证**：检查所有目录是否成功创建，目录命名符合小写命名规范

### 2.2 后端核心文件创建

* [ ] 创建 backend/package.json（包含 Node.js 18.0+、sqlite3 或 better-sqlite3、playwright 等依赖）

* [ ] 创建 backend/main.js（应用入口，包含应用启动逻辑）

* [ ] 创建 backend/.env（环境变量配置）

* [ ] **验证**：检查所有核心文件是否符合 Node.js 18.0+ 和项目技术栈要求

### 2.3 后端API目录结构搭建

* [ ] 创建 backend/api/agents.js（智能体API）

* [ ] 创建 backend/api/messages.js（消息API）

* [ ] 创建 backend/api/skills.js（技能API）

* [ ] 在每个 API 文件中添加路由定义和处理函数

* [ ] 添加参数验证和错误处理

* [ ] **验证**：检查所有 API 文件是否包含路由定义和处理函数

### 2.4 后端服务目录结构搭建

* [ ] 创建 backend/services/agentService.js（智能体服务）

* [ ] 创建 backend/services/chatService.js（聊天服务）

* [ ] 创建 backend/services/skillService.js（技能服务）

* [ ] 创建 backend/services/fileService.js（文件服务）

* [ ] 在每个服务文件中添加业务逻辑、错误处理和日志记录

* [ ] **验证**：检查所有服务文件是否包含完整的业务逻辑

### 2.5 后端模型目录结构搭建

* [ ] 创建 backend/models/agent.js（智能体模型）

* [ ] 创建 backend/models/message.js（消息模型）

* [ ] 创建 backend/models/file.js（文件模型）

* [ ] 在每个模型文件中添加数据结构定义和 CRUD 操作方法

* [ ] **验证**：检查所有模型文件是否包含数据结构定义和数据库操作

### 2.6 后端工具函数目录结构搭建

* [ ] 创建 backend/utils/logger.js（日志工具）

* [ ] 创建 backend/utils/encryption.js（加密工具）

* [ ] 创建 backend/utils/fileHandler.js（文件处理工具）

* [ ] 创建 backend/utils/db.js（数据库连接工具）

* [ ] 在每个工具函数文件中添加完整的错误处理

* [ ] **验证**：检查所有工具函数是否可复用且有完整错误处理

### 2.7 后端配置目录结构搭建

* [ ] 创建 backend/config/settings.js（应用配置）

* [ ] 创建 backend/config/database.js（数据库配置）

* [ ] 在 settings.js 中添加应用配置项（使用环境变量）

* [ ] 在 database.js 中添加数据库连接配置（使用环境变量）

* [ ] **验证**：检查所有配置文件是否可管理且符合安全规范

### 2.8 后端数据目录结构搭建

* [ ] 创建 backend/data/automate.db（SQLite数据库文件，空数据库）

* [ ] 创建 backend/data/messages 子目录（消息存储目录）

* [ ] 创建 backend/data/uploads 子目录（文件上传目录）

* [ ] **验证**：检查数据存储结构是否符合设计要求

### 2.9 后端目录结构验证测试

* [ ] 检查所有目录是否按照设计文档要求创建

* [ ] 检查目录命名是否规范

* [ ] 检查文件组织是否合理

* [ ] 检查是否有冗余目录或文件

* [ ] 检查目录结构是否清晰可辨

* [ ] **验证**：所有目录和文件符合设计文档要求

## 三、测试目录结构搭建

### 3.1 测试目录结构搭建

* [ ] 创建 tests 目录

* [ ] 创建 tests/frontend 子目录（使用 Playwright MCP 框架）

* [ ] 创建 tests/backend 子目录（使用 Chrome DevTools MCP 框架）

* [ ] 在每个子目录下创建 README 说明文件

* [ ] **验证**：检查测试目录结构是否正确配置

### 3.2 前端测试目录结构搭建

* [ ] 创建 tests/frontend/agent.test.ts（智能体模块测试）

* [ ] 创建 tests/frontend/chat.test.ts（聊天模块测试）

* [ ] 创建 tests/frontend/theme.test.ts（主题模块测试）

* [ ] 在每个测试文件中添加以 test\_ 开头的测试函数

* [ ] **验证**：检查所有测试函数命名是否清晰且以 test\_ 开头

### 3.3 后端测试目录结构搭建

* [ ] 创建 tests/backend/agent.test.js（智能体服务测试）

* [ ] 创建 tests/backend/chat.test.js（聊天服务测试）

* [ ] 创建 tests/backend/skill.test.js（技能服务测试）

* [ ] 在每个测试文件中添加以 test\_ 开头的测试函数

* [ ] **验证**：检查所有测试函数命名是否清晰且以 test\_ 开头

### 3.4 测试目录结构验证测试

* [ ] 检查所有目录是否按照设计文档要求创建

* [ ] 检查测试框架是否正确配置

* [ ] 检查测试函数命名是否符合规范（以 test\_ 开头）

* [ ] 检查测试目录结构是否清晰可辨

* [ ] **验证**：所有测试目录和文件符合设计文档要求

## 四、配置和日志目录结构搭建

### 4.1 配置文件目录结构搭建

* [ ] 创建 config 目录

* [ ] 创建 config/agents.json（智能体配置示例）

* [ ] 创建 config/settings.json（应用配置项）

* [ ] **验证**：检查配置文件格式是否符合 JSON 规范

### 4.2 技能目录结构搭建

* [ ] 创建 skills 目录

* [ ] 创建 skills/core 子目录（核心技能）

* [ ] 创建 skills/custom 子目录（自定义技能）

* [ ] 在每个子目录下创建 README 说明文件

* [ ] **验证**：检查技能目录结构是否清晰

### 4.3 日志目录结构搭建

* [ ] 创建 logs 目录

* [ ] 创建 logs/app 子目录（应用日志）

* [ ] 创建 logs/error 子目录（错误日志）

* [ ] 创建 logs/access 子目录（访问日志）

* [ ] 在每个子目录下创建 README 说明文件或保持为空

* [ ] **验证**：检查日志目录结构是否合理

### 4.4 配置和日志目录结构验证测试

* [ ] 检查所有目录是否按照设计文档要求创建

* [ ] 检查配置文件格式是否正确（JSON 规范）

* [ ] 检查日志目录结构是否合理

* [ ] 检查是否有冗余目录或文件

* [ ] **验证**：所有配置和日志目录符合设计文档要求

## 五、项目根目录文件创建

### 5.1 项目根目录文件创建

* [ ] 创建 .gitignore（包含 node\_modules、.env、logs 等忽略项）

* [ ] 创建 README.md（包含项目说明）

* [ ] 创建 package.json（包含项目依赖和脚本）

* [ ] 创建 .env.example（环境变量示例）

* [ ] **验证**：检查所有根目录文件是否创建成功

## 六、项目目录结构整体验证测试

### 6.1 项目目录结构整体验证测试

* [ ] 检查所有目录是否按照设计文档要求创建

* [ ] 检查目录命名是否规范

* [ ] 检查文件组织是否合理

* [ ] 检查项目结构是否符合前后端分离架构

* [ ] 检查是否有冗余目录或文件

* [ ] 检查目录结构是否清晰可辨

* [ ] **验证**：整个项目目录结构符合设计文档要求

