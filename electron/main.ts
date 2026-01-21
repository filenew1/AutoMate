import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

// ES模块中获取__dirname的方法
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 隐藏控制台窗口（仅在生产模式）
if (app.isPackaged) {
  // 移除可能导致错误的代码
  // 控制台窗口会通过electron-packager的--windows-no-console选项隐藏
}

function createWindow() {
  try {
    // 检查dist/index.html文件是否存在
    const indexHtmlPath = path.join(__dirname, '../dist/index.html')
    
    // 确保窗口总是显示在最前面
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      title: 'QQ风格应用',
      show: false, // 先隐藏窗口
      alwaysOnTop: false, // 不总是在最前面
      resizable: true, // 允许调整窗口大小
      transparent: true, // 透明窗口
      hasShadow: true, // 有阴影
      backgroundColor: '#00000000', // 完全透明的背景色
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.ts'),
      },
    })
    
    // 创建系统托盘图标
    let tray: Tray | null = null
    
    try {
        // 创建系统托盘图标
        // 优先使用文件图标，因为base64编码的SVG图标在Windows系统上可能显示有问题
        try {
          // 方法1：使用项目中的logo.png文件（备选路径）
          const iconPath1 = path.join(process.cwd(), 'public', 'logo.png');
          console.log('尝试使用图标路径1:', iconPath1);
          const fileIcon1 = nativeImage.createFromPath(iconPath1);
          tray = new Tray(fileIcon1);
          console.log('使用文件图标1创建系统托盘成功');
        } catch (error) {
          console.error('使用文件图标1失败:', error);
        
          try {
            // 方法2：使用项目中的logo.png文件（开发模式路径）
            const iconPath2 = path.join(__dirname, '../public/logo.png');
            console.log('尝试使用图标路径2:', iconPath2);
            const fileIcon2 = nativeImage.createFromPath(iconPath2);
            tray = new Tray(fileIcon2);
            console.log('使用文件图标2创建系统托盘成功');
          } catch (error) {
            console.error('使用文件图标2失败:', error);
        
            try {
              // 方法3：使用项目中的vite.svg文件作为备选
              const iconPath3 = path.join(process.cwd(), 'public', 'vite.svg');
              console.log('尝试使用图标路径3:', iconPath3);
              const fileIcon3 = nativeImage.createFromPath(iconPath3);
              tray = new Tray(fileIcon3);
              console.log('使用文件图标3创建系统托盘成功');
            } catch (error) {
              console.error('使用文件图标3失败:', error);
        
              try {
                // 方法4：使用src目录中的图标文件
                const iconPath4 = path.join(__dirname, '../src/typescript.svg');
                console.log('尝试使用图标路径4:', iconPath4);
                const fileIcon4 = nativeImage.createFromPath(iconPath4);
                tray = new Tray(fileIcon4);
                console.log('使用文件图标4创建系统托盘成功');
              } catch (error) {
                console.error('使用文件图标4失败:', error);
        
                try {
                  // 方法5：使用base64编码的图标作为最后的备选
                  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <rect width="32" height="32" rx="8" fill="#4A90E2"/>
                  <circle cx="16" cy="12" r="4" fill="white"/>
                  <path d="M8 22C8 20.9 8.9 20 10 20H22C23.1 20 24 20.9 24 22V24C24 25.1 23.1 26 22 26H10C8.9 26 8 25.1 8 24V22Z" fill="white"/>
                </svg>`;
                  
                  const base64Icon = Buffer.from(svgIcon).toString('base64');
                  const dataUrl = `data:image/svg+xml;base64,${base64Icon}`;
                  const trayIcon = nativeImage.createFromDataURL(dataUrl);
                  tray = new Tray(trayIcon);
                  console.log('使用base64编码的图标创建系统托盘成功');
                } catch (error) {
                  console.error('使用base64图标失败:', error);
          
                  try {
                    // 方法6：使用nativeImage.createEmpty()创建一个空图标
                    const emptyIcon = nativeImage.createEmpty();
                    tray = new Tray(emptyIcon);
                    console.log('使用空图标创建系统托盘成功');
                  } catch (error) {
                    console.error('创建空图标失败:', error);
                  }
                }
              }
            }
          }
        }
      
      if (tray) {
        console.log('系统托盘创建成功')
      } else {
        console.error('所有创建系统托盘的方法都失败了')
      }
    } catch (error) {
      console.error('创建系统托盘失败:', error)
      // 如果创建托盘失败，仍然继续运行应用程序
    }
    
    // 创建系统托盘上下文菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          win.show()
        }
      },
      {
        label: '隐藏窗口',
        click: () => {
          win.hide()
        }
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])
    
    // 设置系统托盘的属性
    if (tray) {
      // 设置系统托盘的提示文本
      tray.setToolTip('QQ风格应用')
      
      // 设置系统托盘的上下文菜单
      tray.setContextMenu(contextMenu)
      
      // 点击系统托盘图标时切换窗口的显示状态
      tray.on('click', () => {
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
        }
      })
    }

    // 加载应用
    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(indexHtmlPath)
    }
    
    // 确保应用可以最小化到任务栏
    win.on('minimize', (event) => {
      event.preventDefault()
      win.hide()
    })
    
    // 点击任务栏图标时显示窗口
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      } else {
        win.show()
      }
    })
    
    // 窗口加载完成后显示
    win.on('ready-to-show', () => {
      win.show()
    })
    
    // 监听窗口控制事件
    console.log('开始监听窗口控制事件');
    
    ipcMain.on('minimize-window', () => {
      console.log('接收到minimize-window事件');
      win.hide(); // 隐藏窗口到系统托盘
      console.log('窗口已隐藏到系统托盘');
    });
    
    ipcMain.on('toggle-maximize-window', () => {
      console.log('接收到toggle-maximize-window事件');
      if (win.isMaximized()) {
        win.unmaximize();
        console.log('窗口已还原');
      } else {
        win.maximize();
        console.log('窗口已最大化');
      }
    });
    
    ipcMain.on('close-window', () => {
      console.log('接收到close-window事件');
      win.close();
      console.log('窗口已关闭');
    });
    
  } catch (error) {
    // 静默处理错误，避免控制台输出
  }
}

app.whenReady().then(() => {
  try {
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    // 静默处理错误，避免控制台输出
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason)
})
