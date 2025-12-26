/**
 * 主题初始化工具
 * 统一处理页面加载时的主题应用，避免闪烁
 * 必须在页面加载的最早期执行，在 <head> 中内联或尽早引入
 * 
 * 使用方法：
 * 在 HTML 的 <head> 中引入此脚本，或内联调用：
 * ThemeInit.apply();
 */

const ThemeInit = {
  /**
   * 立即应用保存的主题，避免闪烁
   */
  apply() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
};

// 如果脚本直接加载（非模块），立即执行
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  ThemeInit.apply();
} else if (typeof document !== 'undefined') {
  // DOM 已经加载，立即应用
  ThemeInit.apply();
}

