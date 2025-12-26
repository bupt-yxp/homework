// 主题切换器
const ThemeSwitcher = {
  themes: [
    { id: 'default', name: '默认', icon: '🎨' },
    { id: 'dark', name: '深色', icon: '🌙' },
    { id: 'blue', name: '蓝色', icon: '💙' },
    { id: 'green', name: '绿色', icon: '💚' },
    { id: 'purple', name: '紫色', icon: '💜' }
  ],
  
  currentTheme: 'default',
  
  init: function() {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && this.themes.find(t => t.id === savedTheme)) {
      this.currentTheme = savedTheme;
    }
    
    // 应用主题
    this.applyTheme(this.currentTheme);
    
    // 创建主题选择器 UI
    this.createThemeSelector();
  },
  
  applyTheme: function(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    this.currentTheme = themeId;
    localStorage.setItem('selectedTheme', themeId);
    
    // 更新选择器中的活动状态
    this.updateActiveTheme(themeId);
  },
  
  createThemeSelector: function() {
    // 检查是否已经存在主题选择器
    if (document.getElementById('theme-selector-container')) {
      return;
    }
    
    const navbar = document.querySelector('.navbar-menu');
    if (!navbar) return;
    
    // 创建 navbar-end 容器（如果不存在）
    let navbarEnd = navbar.querySelector('.navbar-end');
    if (!navbarEnd) {
      navbarEnd = document.createElement('div');
      navbarEnd.className = 'navbar-end';
      navbar.appendChild(navbarEnd);
    }
    
    // 创建主题选择器
    const container = document.createElement('div');
    container.id = 'theme-selector-container';
    container.className = 'navbar-item has-dropdown is-hoverable';
    
    const link = document.createElement('a');
    link.className = 'navbar-link';
    link.innerHTML = `
      <span class="icon">
        <svg class="svg-inline--fa fa-palette fa-w-16" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="palette" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" d="M204.3 5.104C109.1 15.71 32 95.75 32 192c0 70.75 57.25 128 128 128 17.75 0 32-14.25 32-32 0-17.75-14.25-32-32-32-35.38 0-64-28.62-64-64 0-70.75 57.25-128 128-128 17.75 0 32-14.25 32-32S222.1 5.854 204.3 5.104zM415.1 32c-35.38 0-64 28.62-64 64 0 17.75 14.25 32 32 32 35.38 0 64 28.62 64 64 0 70.75-57.25 128-128 128-17.75 0-32 14.25-32 32s14.25 32 32 32c70.75 0 128-57.25 128-128C512 124.2 470.1 72.35 415.1 32zM96 256c-17.75 0-32 14.25-32 32s14.25 32 32 32c70.75 0 128 57.25 128 128 0 17.75 14.25 32 32 32s32-14.25 32-32C288 334.1 198.1 256 96 256zM416 256c-102.1 0-192 78.13-192 192 0 17.75 14.25 32 32 32s32-14.25 32-32c0-70.75 57.25-128 128-128 17.75 0 32-14.25 32-32S433.8 256 416 256z"></path>
        </svg>
      </span>
      <span>主题</span>
    `;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'navbar-dropdown is-right';
    
    // 添加主题选项
    this.themes.forEach(theme => {
      const item = document.createElement('a');
      item.className = 'navbar-item theme-option';
      item.setAttribute('data-theme-id', theme.id);
      item.innerHTML = `<span style="margin-right: 0.5rem;">${theme.icon}</span>${theme.name}`;
      
      if (theme.id === this.currentTheme) {
        item.classList.add('is-active');
        item.innerHTML += ' <span style="margin-left: 0.5rem;">✓</span>';
      }
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyTheme(theme.id);
      });
      
      dropdown.appendChild(item);
    });
    
    container.appendChild(link);
    container.appendChild(dropdown);
    navbarEnd.appendChild(container);
    
    // 当鼠标悬停在下拉菜单上时，给容器添加类以改变"主题"按钮颜色
    dropdown.addEventListener('mouseenter', function() {
      container.classList.add('dropdown-hovered');
    });
    
    dropdown.addEventListener('mouseleave', function() {
      container.classList.remove('dropdown-hovered');
    });
  },
  
  updateActiveTheme: function(themeId) {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      const id = option.getAttribute('data-theme-id');
      if (id === themeId) {
        option.classList.add('is-active');
        if (!option.innerHTML.includes('✓')) {
          option.innerHTML = option.innerHTML.replace(/<span[^>]*>✓<\/span>/, '') + ' <span style="margin-left: 0.5rem;">✓</span>';
        }
      } else {
        option.classList.remove('is-active');
        option.innerHTML = option.innerHTML.replace(/<span[^>]*>✓<\/span>/, '');
        // 重新添加图标和名称
        const theme = this.themes.find(t => t.id === id);
        if (theme) {
          option.innerHTML = `<span style="margin-right: 0.5rem;">${theme.icon}</span>${theme.name}`;
        }
      }
    });
  }
};

// 页面加载时初始化
// 确保在 navigation.js 执行后再初始化
document.addEventListener('DOMContentLoaded', function() {
  // 使用 requestAnimationFrame 确保在 navigation.js 执行后立即初始化
  requestAnimationFrame(function() {
    // 如果 navigation.js 还没执行完，再等待一下
    const checkNavigation = function() {
      if (document.querySelector('.navbar-start .navbar-item.has-dropdown') || 
          document.getElementById('homework-dropdown-placeholder')) {
        ThemeSwitcher.init();
        // 标记导航栏已加载完成
        const navbarMenu = document.querySelector('.navbar-menu');
        if (navbarMenu) {
          navbarMenu.classList.add('loaded');
        }
      } else {
        setTimeout(checkNavigation, 10);
      }
    };
    checkNavigation();
  });
});

