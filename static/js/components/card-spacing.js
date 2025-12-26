// 统一的卡片间距管理
// 统一设置整个项目中所有卡片的左右间距
(function() {
  // 统一的间距配置
  const spacingConfig = {
    // 非第一个卡片（intro-card）的左右 padding
    cardPadding: '1rem',
    // Hero卡片（第一张卡片）的左右 padding（稍大一些）
    heroCardPadding: '3rem',
    // intro-card 中内容的列宽度（Bulma 的 12 列系统）
    introCardColumnWidth: 'is-11'
  };

  // 设置卡片 padding
  function setCardPadding() {
    // 设置所有 hero-card 的 padding
    // 保持上下 padding 为 3rem，使用更大的左右 padding（3rem）
    // 如果已有内联样式（由 PageRenderer 设置），则跳过
    const heroCards = document.querySelectorAll('.hero-card');
    heroCards.forEach(card => {
      // 检查是否已有内联padding样式（PageRenderer已设置）
      const existingPadding = card.style.padding;
      if (!existingPadding || !existingPadding.includes('3rem')) {
        card.style.setProperty('padding', `3rem ${spacingConfig.heroCardPadding}`, 'important');
      }
    });

    // 设置所有 intro-card 的 padding
    // 保持上下 padding 为 3rem，使用较小的左右 padding（1rem）
    // 如果已有内联样式（由 PageRenderer 设置），则跳过
    const introCards = document.querySelectorAll('.intro-card');
    introCards.forEach(card => {
      // 检查是否已有内联padding样式（PageRenderer已设置）
      const existingPadding = card.style.padding;
      if (!existingPadding || !existingPadding.includes('1rem')) {
        card.style.setProperty('padding', `3rem ${spacingConfig.cardPadding}`, 'important');
      }
    });
  }

  // 统一设置 intro-card 中的 column 宽度
  function setIntroCardColumnWidth() {
    const introCards = document.querySelectorAll('.intro-card');
    introCards.forEach(card => {
      // 查找 intro-card 内的 column 元素
      const columns = card.querySelectorAll('.columns');
      columns.forEach(columnContainer => {
        const columnsInside = columnContainer.querySelectorAll('.column');
        columnsInside.forEach(col => {
          // 如果 column 有 is-10、is-11 或 is-12 类，统一改为配置的宽度
          // 但保留嵌套的列（如视频展示中的 is-4）不变
          const isNestedColumn = col.closest('.columns.is-multiline') !== columnContainer;
          if (!isNestedColumn && (col.classList.contains('is-10') || col.classList.contains('is-11') || col.classList.contains('is-12'))) {
            col.classList.remove('is-10', 'is-11', 'is-12');
            col.classList.add(spacingConfig.introCardColumnWidth);
          }
        });
      });
    });
  }

  // 初始化函数（暴露为全局函数，供其他模块调用）
  function initCardSpacing() {
    setCardPadding();
    setIntroCardColumnWidth();
  }

  // 暴露为全局函数，供 PageRenderer 等模块调用
  window.CardSpacing = {
    init: initCardSpacing,
    setCardPadding: setCardPadding,
    setIntroCardColumnWidth: setIntroCardColumnWidth
  };

  // 在页面加载时执行（延迟执行，确保动态内容已渲染）
  function tryInitCardSpacing() {
    // 如果已经有卡片元素，立即执行
    if (document.querySelector('.hero-card') || document.querySelector('.intro-card')) {
      initCardSpacing();
    } else {
      // 如果没有，延迟再试（等待动态内容渲染）
      setTimeout(tryInitCardSpacing, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // 延迟执行，确保动态渲染的内容已经加载
      setTimeout(tryInitCardSpacing, 50);
    });
  } else {
    // DOM 已经加载完成，延迟执行
    setTimeout(tryInitCardSpacing, 50);
  }
})();

