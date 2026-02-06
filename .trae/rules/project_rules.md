# AutoMate 项目技术栈规范

## 项目概述
AutoMate 是一款基于纯前端技术栈构建的跨平台桌面智能体聊天系统，参照OpenClaw实现方式。该系统旨在为用户提供一个界面精美、安装轻量、功能强大的智能体交互平台。用户可以通过类似 QQ 等即时通讯软件的聊天界面与各种智能体进行对话交互，智能体根据用户输入调用相应的 skill 执行操作，并将执行过程或结果返回给用户。系统使用Node.js作为核心运行环境，实现数据库访问和大模型接口调用，智能体配置统一以 JSON 格式存储。



## 前端技术栈
- React：18.2.0+（推荐使用函数组件和Hooks）
- TypeScript：5.0.0+（提供类型安全）
- Tailwind CSS：3.3.0+（用于快速构建响应式UI）
- Vite：4.4.0+（作为构建工具，Tauri推荐使用Vite）
- 改完后需要使用 @[ui-ux-pro-max] 进行更新UI组件

## 后端技术栈
- Node.js：18.0.0+（核心运行环境，用于实现数据库访问、API调用和服务层逻辑）
- Playwright：1.36.0+（用于浏览器自动化测试）

## 数据库
- SQLite：3.40.0+（轻量级嵌入式数据库）
- node-sqlite3 或 better-sqlite3：用于Node.js中操作SQLite数据库

## 打包工具
- pkg 或 nexe：用于将Node.js应用打包为独立可执行文件
- Vite：4.4.0+（用于前端代码构建和打包）

## 目录结构
```
AutoMate/
├── .github/             # GitHub配置文件
│   └── workflows/       # CI/CD工作流
├── .trae/               # Trae IDE配置
│   └── rules/           # 项目规则文件
├── .trae-cn/            # 中文Trae配置
│   └── skills/          # 技能配置
├── config/              # 配置文件目录
│   └── agents.json      # 智能体配置文件
├── prototypes/          # 原型设计文件
│   ├── css/             # CSS文件
│   └── MainLayout.html  # 主布局原型
├── task/                # 任务管理目录
│   ├── todo_list.md     # 待办任务列表
│   ├── task_completed_list.md # 已完成任务列表
│   └── task_logs_list.md # 任务执行日志
├── test/                # 测试目录
├── README.md            # 项目说明文档
├── package.json         # 项目依赖配置
└── 详细设计说明书.md      # 详细设计文档
```
