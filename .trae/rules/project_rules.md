---
alwaysApply: true
---
# AutoMate 项目技术栈规范

## 1. 技术栈

**前端**: React 18+, TypeScript 5.0+, Tailwind CSS 3.0+, Vite 5.0+, Radix UI, Lucide React, Zustand, React Router, react-markdown, @tauri-apps/plugin-fs, @tauri-apps/plugin-dialog, Axios

**后端**: Node.js 18.0+, Playwright 1.30+, SQLite 3.40+, sqlite3, better-sqlite3

**桌面框架**: Tauri 2.x

## 2. 开发约定

**代码规范**: 遵循 React/TypeScript/Node.js 规范，提交前必须通过 lint 和 typecheck，新功能必须编写测试用例，UI/UX 设计必须使用 @[ui-ux-pro-max] skill

**测试规范**: 前端测试使用 Playwright MCP 框架，后端测试使用 Chrome DevTools MCP 框架，测试函数名以 test_ 开头，测试文件放在 /tests/ 目录

**日期时间**: 使用 datetime.now() 获取当前时间，数据库时间字段用 DATETIME 类型，API 响应时间戳用 ISO 8601 格式

**安全约定**: 敏感信息加密存储，用户数据本地化存储，防止 SQL 注入和 XSS 攻击，文件传输存储安全保护，技能执行沙箱隔离

**配置约定**: 智能体配置 ./config/agents.json，技能存储 ./skills/，数据库 ./data/automate.db，日志 ./logs/

**版本约定**: 遵循语义化版本规范 MAJOR.MINOR.PATCH

## 3. 文档约定

所有文档使用 Markdown 格式编写，代码块必须指定语言类型，文件路径基于 docs 目录，文档更新需同步更新相关引用

## 4. 模块划分

基础规范: 命名规范 编码规范

数据层: 数据库设计 数据存储设计

接口层: 前端组件接口 后端API接口 Tauri通信接口

业务模块: 智能体模块 聊天交互模块 主题模块 启动页模块

非功能设计: 性能设计 安全设计 兼容性设计 可用性设计 可维护性设计 可扩展性设计

技术架构: 前端技术栈 后端技术栈 数据库技术 架构设计
