---
alwaysApply: true
---
# AutoMate 项目规则

## 1. 技术栈
- **前端**: React 18+, TypeScript 5.0+, Tailwind CSS 3.0+, Vite 5.0+, Radix UI, Lucide React, Zustand, React Router, react-markdown, @tauri-apps/plugin-fs, @tauri-apps/plugin-dialog, Axios
- **后端**: Node.js 18.0+, Playwright 1.30+, SQLite 3.40+, sqlite3, better-sqlite3
- **桌面框架**: Tauri 2.x

## 2. 开发规范
- **代码**: 遵循 React/TypeScript/Node.js 规范，提交前通过 lint 和 typecheck，新功能编写测试，UI/UX 使用 @[ui-skill]
- **测试**: 前端用 Playwright MCP，后端用 Chrome DevTools MCP，测试函数以 test_ 开头，文件放 /tests/
- **时间**: datetime.now()，数据库用 DATETIME，API 用 ISO 8601
- **安全**: 敏感信息加密、用户数据本地化、防 SQL 注入/XSS、文件安全、技能沙箱隔离
- **配置**: 智能体 ./config/agents.json，技能 ./skills/，数据库 ./data/automate.db，日志 ./logs/
- **版本**: 语义化版本 MAJOR.MINOR.PATCH

## 3. 文档约定
Markdown 格式，代码块指定语言，路径基于 docs 目录

## 4. 模块划分
- 基础规范: 命名规范 编码规范
- 数据层: 数据库设计 数据存储设计
- 接口层: 前端组件接口 后端API接口 Tauri通信接口
- 业务模块: 智能体模块 聊天交互模块 主题模块 启动页模块
- 非功能设计: 性能设计 安全设计 兼容性设计 可用性设计 可维护性设计 可扩展性设计
- 技术架构: 前端技术栈 后端技术栈 数据库技术 架构设计
