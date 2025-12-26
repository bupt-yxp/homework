/**
 * 统一的页面渲染器
 * 遵循软件工程原则：单一职责、开闭原则、DRY
 * 负责根据配置渲染页面结构，不关心具体内容
 */

const PageRenderer = {
  /**
   * 获取基础路径（使用公共工具）
   */
  getBasePath() {
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
  },

  /**
   * 渲染 Hero Section
   * @param {Object} config - Hero配置 {title, subtitle, titleStyle, subtitleStyle}
   */
  renderHeroSection(config) {
    if (!config || !config.title) return '';
    
    const titleStyle = config.titleStyle || 'font-size: 2.2rem; margin-bottom: 1rem;';
    // 为第一个卡片的文字部分设置行间距为1.2
    let subtitleStyle = config.subtitleStyle || 'margin-top: 1.5rem;';
    // 如果 subtitleStyle 中没有 line-height，则添加默认的 line-height: 1.2
    if (!subtitleStyle.includes('line-height')) {
      subtitleStyle += ' line-height: 1.5;';
    }
    // 直接内联padding样式，避免闪烁（Hero卡片使用更大的左右间距）
    const cardPadding = '3rem 3rem'; // 上下3rem，左右3rem（第一张卡片稍大）
    
    let subtitleHTML = '';
    if (config.subtitle) {
      subtitleHTML = `<h2 class="subtitle" style="${subtitleStyle}">${config.subtitle}</h2>`;
    }
    
    return `
<!-- Hero Section - 渐变背景卡片风格 -->
<section class="section hero-section">
  <div class="container is-max-desktop">
    <div class="hero-card" style="padding: ${cardPadding} !important;">
      <div class="columns is-centered">
        <div class="column">
          <h1 class="title is-3 publication-title has-text-centered" style="${titleStyle}">${config.title}</h1>
          ${subtitleHTML}
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染 Intro Section（通用内容卡片）
   * @param {Object} config - Intro配置 {title, content, titleStyle, contentStyle}
   */
  renderIntroSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'intro-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 1.5rem; color: #2c3e50;';
    const contentStyle = config.contentStyle || 'line-height: 1.8; color: #555;';
    const columnClass = config.columnClass || 'is-10';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    let contentHTML = '';
    if (typeof config.content === 'string') {
      contentHTML = `<p style="${contentStyle}">${config.content}</p>`;
    } else if (config.content) {
      // 如果content是HTML字符串，直接使用
      contentHTML = config.content;
    }
    
    return `
<!-- ${config.title || 'Content'} Section - 简洁居中风格 -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      ${config.title ? `<h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>` : ''}
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          <div class="content">
            ${contentHTML}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染表格 Section
   * @param {Object} config - 表格配置 {title, tableConfig, footerId}
   */
  renderTableSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'results-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 2rem; color: #2c3e50;';
    const columnClass = config.columnClass || 'is-10';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    const tableConfigStr = JSON.stringify(config.tableConfig || {});
    const containerId = config.tableConfig?.containerId || 'results-table-container';
    const footerId = config.footerId || 'results-table-footer';
    
    return `
<!-- ${config.title || 'Table'} Section -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      <h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          <div class="table-container" id="${containerId}" data-table-config='${tableConfigStr}'>
            <!-- 表格将通过 JavaScript 动态加载 -->
            <div class="has-text-centered" style="padding: 2rem;">
              <p>正在加载表格数据...</p>
            </div>
          </div>
          <p class="help" id="${footerId}">
            <!-- 脚注将通过 JavaScript 动态加载 -->
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染图片 Section
   * @param {Object} config - 图片配置 {title, description, imageConfig, footerId}
   */
  renderImageSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'image-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 2rem; color: #2c3e50;';
    const columnClass = config.columnClass || 'is-10';
    const descriptionStyle = config.descriptionStyle || 'margin-bottom: 2rem; color: #555; line-height: 1.8;';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    const imageConfigStr = JSON.stringify(config.imageConfig || {});
    const containerId = config.imageConfig?.containerId || 'image-container';
    const footerId = config.footerId || 'image-footer';
    
    // 处理描述文本（支持 HTML 和 LaTeX）
    let descriptionHTML = '';
    if (config.description) {
      descriptionHTML = `<div class="content" style="${descriptionStyle}">${config.description}</div>`;
    }
    
    return `
<!-- ${config.title || 'Image'} Section -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      <h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          ${descriptionHTML}
          <div class="image-container" id="${containerId}" data-image-config='${imageConfigStr}'>
            <!-- 图片将通过 JavaScript 动态加载 -->
            <div class="has-text-centered" style="padding: 2rem;">
              <p>正在加载图片...</p>
            </div>
          </div>
          <p class="help" id="${footerId}">
            <!-- 脚注将通过 JavaScript 动态加载 -->
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染可视化 Section（GIF/图片展示）
   * @param {Object} config - 可视化配置 {title, description, items: [{title, image, alt}]}
   */
  renderVisualizationSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'visualization-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 2rem; color: #2c3e50;';
    const columnClass = config.columnClass || 'is-10';
    const itemColumnClass = config.itemColumnClass || 'is-4';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    let itemsHTML = '';
    if (config.items && Array.isArray(config.items)) {
      itemsHTML = config.items.map(item => `
            <!-- ${item.title} -->
            <div class="column ${itemColumnClass}">
              <div class="box" style="padding: 1rem; text-align: center;">
                <figure class="image" style="margin-bottom: 1rem;">
                  <img src="${item.image}" alt="${item.alt || item.title}" style="width: 100%; height: auto; border-radius: 8px;">
                </figure>
                <h3 class="title is-5" style="margin-top: 0.5rem; color: #2c3e50;">${item.title}</h3>
              </div>
            </div>
      `).join('');
    }
    
    let descriptionHTML = '';
    if (config.description) {
      descriptionHTML = `<p style="margin-bottom: 2rem; color: #555;">${config.description}</p>`;
    }
    
    let footnoteHTML = '';
    if (config.footnote) {
      footnoteHTML = `<p class="is-size-7" style="margin-top: 1.5rem; color: #777;">${config.footnote}</p>`;
    }
    
    return `
<!-- ${config.title || 'Visualization'} Section -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      <h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          ${descriptionHTML}
          <div class="columns is-multiline is-centered">
            ${itemsHTML}
          </div>
          ${footnoteHTML}
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染点云可视化 Section（特殊交互式组件）
   * @param {Object} config - 点云配置 {title}
   */
  renderPointCloudSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'pointcloud-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 2rem; color: #2c3e50;';
    const columnClass = config.columnClass || 'is-10';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    // 点云可视化部分的HTML结构保持不变
    const pointCloudHTML = `
          <div class="box" style="margin-bottom: 2rem;">
            <h3 class="title is-5" style="margin-bottom: 1rem; color: #2c3e50;">上传点云文件</h3>
            <div class="field">
              <label class="label">选择 PLY 文件</label>
              <p class="help" style="margin-bottom: 0.5rem;">
                请上传 PLY 格式的点云文件，支持以下类型：
                <br>• static.ply（静态部件的点云）
                <br>• start_dynamic*.ply（起始可动部件的点云）
                <br>• end_dynamic*.ply（结束可动部件的点云）
              </p>
              <div class="file has-name">
                <label class="file-label">
                  <input class="file-input" type="file" id="pointcloud-file-input" accept=".ply" multiple>
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">选择 PLY 文件（可多选）</span>
                  </span>
                  <span class="file-name" id="file-name">未选择文件</span>
                </label>
              </div>
              <!-- 文件上传进度显示 -->
              <div id="file-upload-progress" style="display: none; margin-top: 1rem;">
                <div class="notification is-info is-light" style="padding: 1rem;">
                  <p class="has-text-weight-bold" style="margin-bottom: 0.5rem;">文件处理进度</p>
                  <!-- 整体进度条 -->
                  <progress id="overall-progress" class="progress is-primary" value="0" max="100" style="margin-bottom: 1rem;">0%</progress>
                  <div id="overall-status" class="has-text-left" style="margin-bottom: 1rem; font-size: 0.9rem;"></div>
                  <!-- 单个文件状态列表 -->
                  <div id="file-status-list" style="margin-top: 0.5rem;"></div>
                </div>
              </div>
            </div>
            <div class="field" style="margin-top: 1.5rem;">
                <div class="control">
                <button class="button is-primary is-fullwidth" id="process-pointcloud-btn">
                  <span class="icon">
                    <i class="fas fa-play"></i>
                  </span>
                  <span>生成匹配结果可视化</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="box" id="result-display-box" style="display: none;">
            <h3 class="title is-5" style="margin-bottom: 1rem; color: #2c3e50;">匹配结果可视化</h3>
            <div class="has-text-centered" id="result-display-container">
              <div class="notification is-info is-light" id="processing-notification" style="display: none;">
                <p>正在处理点云数据并生成匹配结果...</p>
              </div>
              <!-- Plotly.js 3D visualization container -->
              <div id="plotly-container" style="display: none;"></div>
              <figure class="image" id="result-image-container" style="display: none;">
                <img id="result-image" src="" alt="点云匹配结果" style="max-width: 100%; height: auto; border-radius: 8px;">
              </figure>
              <div class="notification is-danger is-light" id="error-notification" style="display: none;">
                <p id="error-message"></p>
              </div>
            </div>
          </div>
    `;
    
    return `
<!-- ${config.title || 'Point Cloud'} Section -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      <h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          ${pointCloudHTML}
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 渲染算法 Section（算法展示卡片）
   * @param {Object} config - 算法配置 {title, algorithmConfig}
   */
  renderAlgorithmSection(config) {
    if (!config) return '';
    
    const sectionClass = config.sectionClass || 'algorithm-section';
    const sectionStyle = config.sectionStyle || 'padding: 2rem 0;';
    const titleStyle = config.titleStyle || 'margin-bottom: 2rem; color: #2c3e50;';
    const columnClass = config.columnClass || 'is-10';
    // 直接内联padding样式，避免闪烁（非第一个卡片使用较小的左右间距）
    const cardPadding = '3rem 1rem'; // 上下3rem，左右1rem（非第一个卡片）
    
    const algorithmConfigStr = JSON.stringify(config.algorithmConfig || {});
    const containerId = config.algorithmConfig?.containerId || 'algorithm-container';
    
    return `
<!-- ${config.title || 'Algorithm'} Section -->
<section class="section ${sectionClass}" style="${sectionStyle}">
  <div class="container is-max-desktop">
    <div class="intro-card" style="padding: ${cardPadding} !important;">
      <h2 class="title is-3 has-text-centered" style="${titleStyle}">${config.title}</h2>
      <div class="columns is-centered">
        <div class="column ${columnClass}">
          <div class="algorithm-container" id="${containerId}" data-algorithm-config='${algorithmConfigStr}'>
            <!-- 算法内容将通过 JavaScript 动态加载 -->
            <div class="has-text-centered" style="padding: 2rem;">
              <p>正在加载算法数据...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    `;
  },

  /**
   * 根据页面配置渲染整个页面
   * @param {Object} pageConfig - 页面配置对象
   */
  renderPage(pageConfig) {
    if (!pageConfig || !pageConfig.sections) {
      console.warn('页面配置无效或缺少sections');
      return;
    }
    
    const container = document.getElementById('page-content-container');
    if (!container) {
      console.error('找不到页面内容容器 #page-content-container');
      return;
    }
    
    let html = '';
    
    // 按顺序渲染所有sections
    pageConfig.sections.forEach(section => {
      switch (section.type) {
        case 'hero':
          html += this.renderHeroSection(section);
          break;
        case 'intro':
          html += this.renderIntroSection(section);
          break;
        case 'table':
          html += this.renderTableSection(section);
          break;
        case 'image':
          html += this.renderImageSection(section);
          break;
        case 'visualization':
          html += this.renderVisualizationSection(section);
          break;
        case 'pointcloud':
          html += this.renderPointCloudSection(section);
          break;
        case 'algorithm':
          html += this.renderAlgorithmSection(section);
          break;
        default:
          console.warn(`未知的section类型: ${section.type}`);
      }
    });
    
    container.innerHTML = html;
    
    // 渲染完成后，立即设置卡片间距（如果 CardSpacing 可用）
    if (typeof window.CardSpacing !== 'undefined' && window.CardSpacing.init) {
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        window.CardSpacing.init();
      }, 0);
    }
    
    // 如果配置了额外的初始化函数，执行它
    if (pageConfig.onRenderComplete && typeof pageConfig.onRenderComplete === 'function') {
      // 延迟执行回调，确保间距已设置
      setTimeout(() => {
        pageConfig.onRenderComplete();
      }, 10);
    }
  },

  /**
   * 初始化页面（在DOM加载完成后调用）
   * @param {Object} pageConfig - 页面配置对象
   */
  init(pageConfig) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.renderPage(pageConfig);
      });
    } else {
      this.renderPage(pageConfig);
    }
  }
};

