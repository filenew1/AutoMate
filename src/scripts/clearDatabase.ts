// 清空混合存储数据库的脚本
// 使用方法：在浏览器控制台中执行此代码

async function clearAllDatabase() {
  console.log('开始清空数据库...');

  // 1. 清空 localStorage 中的 SQLite 数据
  localStorage.removeItem('automate-sqlite-db');
  console.log('✅ SQLite 数据已清空 (localStorage)');

  // 2. 清空 IndexedDB 数据
  const databases = ['automate-db'];
  
  for (const dbName of databases) {
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => {
        console.log(`✅ IndexedDB "${dbName}" 已删除`);
        resolve(true);
      };
      request.onerror = (event) => {
        console.error(`❌ 删除 IndexedDB "${dbName}" 失败:`, event);
        reject(event);
      };
    });
  }

  // 3. 清除混合存储的清理标记
  localStorage.removeItem('last-indexeddb-clean');
  console.log('✅ 清理标记已清除');

  console.log('🎉 所有数据库数据已清空！');
  console.log('请刷新页面以重新初始化数据库。');
}

// 导出函数供控制台调用
window.clearAllDatabase = clearAllDatabase;

// 自动执行
clearAllDatabase();
