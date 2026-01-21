# AutoMate
由“Automation”（自动化）和“Mate”（伙伴）结合，朗朗上口。

# AutoMate应用

这是一个基于Electron和React的AutoMate应用程序，具有现代化的界面设计和完整的窗口控制功能。

## 项目结构

```
AgentSkills/
├── dist/                  # 构建输出目录
│   ├── assets/            # 静态资源
│   ├── index.html         # 主HTML文件
│   └── vite.svg           # Vite图标
├── dist-electron/         # Electron构建输出目录
│   ├── builder-effective-config.yaml  # 构建配置文件
│   └── main.js            # Electron主进程文件
├── dist-packager/         # 打包输出目录
│   └── agentskills-win32-x64/  # Windows 64位应用
├── electron/              # Electron相关文件
│   ├── main.ts            # Electron主进程代码
│   └── preload.ts         # 预加载脚本
├── public/                # 公共资源
│   └── vite.svg           # Vite图标
├── src/                   # 源代码目录
│   ├── App.tsx            # 主应用组件
│   ├── counter.ts         # 计数器功能
│   ├── electron-api.d.ts  # Electron API类型声明
│   ├── main.tsx           # 应用入口
│   ├── style.css          # 全局样式
│   └── typescript.svg     # TypeScript图标
├── .gitignore             # Git忽略文件
├── index.html             # HTML模板
├── package-lock.json      # npm依赖锁定文件
├── package.json           # 项目配置文件
├── postcss.config.js      # PostCSS配置
├── tailwind.config.js     # Tailwind CSS配置
├── tsconfig.json          # TypeScript配置
└── vite.config.ts         # Vite配置
```

## 运行命令

### 开发模式
```bash
npm run dev
```

### Electron开发模式
```bash
npm run electron:dev
```

## 构建与打包命令

### 构建应用
```bash
npm run build
```

### 打包为可执行文件  网络问题报错，无法下载electron-v40.0.0-win32-x64.zip 使用下面的方式打包
```bash
npm run electron:build
```

### 使用electron-packager打包
```bash
npx electron-packager . --platform=win32 --arch=x64 --out=dist-packager --overwrite --electron-version=40.0.0
```

## 功能说明

1. **现代化AutoMate界面**：采用蓝色主题和简洁的设计风格，提供类似QQ的用户体验。

2. **完整的窗口控制功能**：
   - 拖动顶部导航栏移动窗口
   - 点击最小化按钮隐藏窗口
   - 点击最大化按钮切换窗口大小
   - 点击关闭按钮退出应用
   - 通过窗口边缘调整窗口大小

3. **响应式布局**：应用会根据窗口大小自动调整布局，提供良好的用户体验。

4. **无窗口框架设计**：移除了默认的窗口框架，使用自定义的界面元素，使应用更加美观。

## 技术栈

- **前端框架**：React 19.2.3
- **样式方案**：Tailwind CSS 3.4.19 + daisyUI 5.5.14
- **构建工具**：Vite 7.2.4
- **类型系统**：TypeScript 5.9.3
- **桌面应用**：Electron 40.0.0

## 注意事项

- 本应用在Windows系统上测试通过
- 运行前请确保已安装Node.js 20.19+或22.12+
- 打包过程中需要联网下载Electron二进制文件
