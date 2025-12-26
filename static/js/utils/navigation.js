// 统一的作业列表配置

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

// 生成导航栏下拉菜单 HTML
function generateHomeworkDropdown() {
  const basePath = getBasePath();
  let dropdownHTML = `
      <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link">
          More Homework
        </a>
        <div class="navbar-dropdown">
  `;
  
  homeworkList.forEach(homework => {
    // 根据基础路径构建正确的 URL
    let url;
    if (homework.url.startsWith('./')) {
      url = basePath + homework.url.substring(2);
    } else {
      url = homework.url;
    }
    dropdownHTML += `
          <a class="navbar-item" href="${url}">
            ${homework.name}
          </a>
    `;
  });
  
  dropdownHTML += `
        </div>
      </div>
  `;
  
  return dropdownHTML;
}

// 修复 Home 链接路径
function fixHomeLink() {
  // 查找 Home 链接（包含 index.html 的导航项，通常带有 home icon）
  const navbarStart = document.querySelector('.navbar-start');
  if (!navbarStart) return;
  
  // 查找第一个包含 index.html 的导航项（通常是 Home 链接）
  const homeLink = navbarStart.querySelector('.navbar-item[href*="index.html"]');
  if (homeLink) {
    const basePath = getBasePath();
    homeLink.href = basePath + 'index.html';
  }
}

// 在页面加载时插入导航栏
document.addEventListener('DOMContentLoaded', function() {
  const navbarStart = document.querySelector('.navbar-start');
  if (navbarStart) {
    // 修复 Home 链接路径
    fixHomeLink();
    
    // 查找现有的 More Homework 下拉菜单
    const existingDropdown = navbarStart.querySelector('.navbar-item.has-dropdown');
    if (existingDropdown) {
      const linkText = existingDropdown.querySelector('.navbar-link');
      if (linkText && linkText.textContent.trim() === 'More Homework') {
        // 替换现有的下拉菜单
        existingDropdown.outerHTML = generateHomeworkDropdown();
      }
    }
    
    // 或者查找占位符
    const placeholder = document.getElementById('homework-dropdown-placeholder');
    if (placeholder) {
      placeholder.outerHTML = generateHomeworkDropdown();
    }
    
    // 标记导航栏已加载完成
    const navbarMenu = document.querySelector('.navbar-menu');
    if (navbarMenu) {
      navbarMenu.classList.add('loaded');
    }
  }
});

