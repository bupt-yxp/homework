// 统一的 Title 管理
(function() {

  // 根据当前页面路径设置 title
  function setPageTitle() {
    const currentPath = window.location.pathname;
    let pageTitle = "Homework展示"; // 默认标题
    
    // 使用 homeworkList 动态匹配页面路径
    if (typeof homeworkList !== 'undefined') {
      for (const homework of homeworkList) {
        // 从 URL 中提取路径部分进行匹配
        const urlPath = homework.url.replace('./', '');
        if (currentPath.includes(urlPath)) {
          pageTitle = homework.name;
          break;
        }
      }
    }
    
    // 设置页面标题（立即执行，不需要等待 DOM）
    if (document.title !== pageTitle) {
      document.title = pageTitle;
    }
  }

  // 立即设置标题（不需要等待 DOM 加载）
  setPageTitle();
  
  // 也监听 DOMContentLoaded 作为备用（防止某些边缘情况）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setPageTitle);
  }
})();

