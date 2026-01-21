function App() {
  return (
    <div className="h-screen w-screen bg-transparent overflow-hidden">
      {/* QQ风格窗口 */}
      <div className="h-full w-full shadow-lg" style={{ clipPath: 'inset(0px round 12px)' }}>
        {/* 顶部导航栏 */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between" style={{ '-webkit-app-region': 'drag' } as any}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-blue-600 font-bold">Q</span>
            </div>
            <span className="font-semibold">QQ</span>
          </div>
          <div className="flex gap-2" style={{ '-webkit-app-region': 'no-drag' } as any}>
            <button className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center" onClick={() => {
              console.log('点击最小化按钮');
              if (window.electronAPI) {
                console.log('electronAPI存在，调用minimizeWindow');
                window.electronAPI.minimizeWindow();
              } else {
                console.error('electronAPI不存在');
              }
            }}>
              <span className="text-xs">−</span>
            </button>
            <button className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center" onClick={() => {
              console.log('点击最大化按钮');
              if (window.electronAPI) {
                console.log('electronAPI存在，调用toggleMaximizeWindow');
                window.electronAPI.toggleMaximizeWindow();
              } else {
                console.error('electronAPI不存在');
              }
            }}>
              <span className="text-xs">□</span>
            </button>
            <button className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center" onClick={() => {
              console.log('点击关闭按钮');
              if (window.electronAPI) {
                console.log('electronAPI存在，调用closeWindow');
                window.electronAPI.closeWindow();
              } else {
                console.error('electronAPI不存在');
              }
            }}>
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
        
        {/* 左侧导航 */}
        <div className="flex h-[calc(100%-48px)] bg-white">
          <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-4">
            <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center">
              <span className="text-white text-sm">☺</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm">✉</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm">♫</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm">✎</span>
            </button>
          </div>
          
          {/* 右侧内容区域 */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-800">Hello World</div>
            <div className="mt-4 text-gray-500">欢迎使用QQ风格应用</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App