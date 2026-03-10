# 修复 sql.js 加载错误计划

## 问题描述
错误: `TypeError: SqlJs.default is not a function`

这是因为 sql.js 库的默认导出方式在 Vite 打包环境下不正确。

## 解决方案

由于 sql.js 的 wasm 加载问题复杂多样，我将采用最简单可靠的方案：**纯 IndexedDB 方案**

- 移除 sql.js 依赖（解决加载问题）
- 使用 IndexedDB 作为唯一存储（已经实现了完整功能）
- SQLite 数据持久化到 localStorage（Base64 编码）

## 实现步骤

1. **修改 hybridStorage.ts**
   - 移除对 sqlStorage.ts 的依赖
   - 将 SQLite 相关调用改为纯 IndexedDB 操作
   - 使用 localStorage 持久化 IndexedDB 数据（备份）

2. **修改 ChatContainer.tsx**
   - 移除 initHybridStorage 调用或简化

3. **删除不再需要的文件**
   - sqlStorage.ts
   - sql.js.d.ts
   - public/sql-wasm.wasm

4. **验证修复效果**
   - 运行 typecheck
   - 测试历史记录保存和加载
