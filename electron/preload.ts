// 预加载脚本
console.log('预加载脚本开始执行');

try {
  const { ipcRenderer } = require('electron');
  console.log('成功加载electron模块');
  
  // 向渲染进程暴露窗口控制API
  (window as any).electronAPI = {
    // 最小化窗口
    minimizeWindow: () => {
      console.log('调用minimizeWindow');
      ipcRenderer.send('minimize-window');
    },
    // 最大化/还原窗口
    toggleMaximizeWindow: () => {
      console.log('调用toggleMaximizeWindow');
      ipcRenderer.send('toggle-maximize-window');
    },
    // 关闭窗口
    closeWindow: () => {
      console.log('调用closeWindow');
      ipcRenderer.send('close-window');
    }
  };
  
  console.log('成功暴露electronAPI');
} catch (error) {
  console.error('预加载脚本执行出错:', error);
}

console.log('预加载脚本执行完成')
