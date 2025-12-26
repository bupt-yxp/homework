// 统一的 favicon 设置
(function() {
  // 获取基础路径（使用公共工具）
  function getBasePath() {
    if (typeof PathResolver !== 'undefined' && PathResolver.getBasePath) {
      return PathResolver.getBasePath();
    }
    // 降级方案
    const currentPath = window.location.pathname;
    if (typeof homeworkList !== 'undefined') {
      for (const homework of homeworkList) {
        const urlPath = homework.url.replace('./', '');
        if (currentPath.includes(urlPath)) {
          return '../../';
        }
      }
    }
    return './';
  }
  
  // 设置 favicon
  function setFavicon() {
    const basePath = getBasePath();
    const faviconPath = basePath + 'static/images/favicon.svg';
    
    // 检查是否已经存在 favicon 链接
    let faviconLink = document.querySelector('link[rel="icon"]');
    
    if (!faviconLink) {
      // 创建新的 favicon 链接
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/svg+xml';
      document.head.appendChild(faviconLink);
    }
    
    // 设置 favicon 路径
    faviconLink.href = faviconPath;
  }
  
  // 在 DOM 加载时设置 favicon
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setFavicon);
  } else {
    setFavicon();
  }
})();

