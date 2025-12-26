// 统一的 Footer 内容管理
(function() {
  // 生成统一的 Footer HTML
  function generateFooter() {
    return `
<footer class="footer">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-8">
        <div class="content">
          <p>
            本网页模板改编自 <a href="https://github.com/nerfies/nerfies.github.io">Nerfies</a> 和 <a href="https://github.com/silent-chen/AutoPartGen/tree/gh-page?tab=readme-ov-file">AutoPartGen</a>，采用 <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 许可证</a>。
          </p>
        </div>
      </div>
    </div>
  </div>
</footer>
    `;
  }

  // 插入 Footer 的函数
  function insertFooter() {
    // 检查是否已经存在 footer
    const existingFooter = document.querySelector('footer.footer');
    if (existingFooter) {
      return; // 如果已经存在，不重复插入
    }
    
    // 在 body 末尾插入 footer（在 </body> 之前）
    const body = document.body;
    if (!body) {
      console.warn('footer.js: document.body is not available');
      return;
    }
    
    body.insertAdjacentHTML('beforeend', generateFooter());
  }

  // 在页面加载时插入 Footer
  // 使用多种方式确保执行
  function initFooter() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertFooter);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
      // DOM 已经加载完成，立即执行
      insertFooter();
    } else {
      // 如果还没准备好，等待一下
      setTimeout(insertFooter, 100);
    }
  }
  
  // 立即尝试初始化
  initFooter();
  
  // 也监听 window.onload 作为备用
  window.addEventListener('load', function() {
    if (!document.querySelector('footer.footer')) {
      insertFooter();
    }
  });
})();

