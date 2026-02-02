# 项目技术栈规范

## 前端技术栈
- React：18.2.0+（推荐使用函数组件和Hooks）
- TypeScript：5.0.0+（提供类型安全）
- Tailwind CSS：3.3.0+（用于快速构建响应式UI）
- Vite：4.4.0+（作为构建工具，Tauri推荐使用Vite）
- 改完后需要使用 @[ui-ux-pro-max] 进行更新UI组件

## 后端技术栈
- Tauri：1.5.0+（基于Rust的桌面应用框架）
- Rust：1.70.0+（系统级编程语言，提供高性能和安全性）
- Node.js：18.0.0+（通过子进程调用playwright进行自动化测试）
- Playwright：1.36.0+（用于浏览器自动化测试）

## 数据库
- SQLite：3.40.0+（轻量级嵌入式数据库）
- tauri-plugin-sqlite：2.0.0+（Tauri的SQLite插件，用于在Rust中操作SQLite）