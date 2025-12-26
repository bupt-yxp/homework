/**
 * 通用算法可视化器
 * 用于从JSON文件加载算法内容并渲染为美观的算法卡片
 * 
 * 算法JSON格式：
 * {
 *   "title": "算法标题",
 *   "description": "算法描述（可选）",
 *   "initialization": "初始化步骤",
 *   "steps": [
 *     {
 *       "number": 1,
 *       "condition": "条件描述（可选）",
 *       "actions": ["动作1", "动作2", ...]
 *     },
 *     ...
 *   ]
 * }
 */

const AlgorithmVisualizer = {
  /**
   * 解析路径，支持相对路径和绝对路径
   * @param {string} dataPath - JSON 文件路径（相对于当前HTML文件）
   * @returns {string} 解析后的路径
   */
  resolvePath(dataPath) {
    // 使用公共的路径解析工具
    if (typeof PathResolver !== 'undefined' && PathResolver.resolve) {
      return PathResolver.resolve(dataPath);
    }
    // 降级方案：如果 PathResolver 不可用，使用简单实现
    if (dataPath.startsWith('/')) {
      return dataPath;
    }
    const currentPath = window.location.pathname;
    const htmlDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (dataPath.startsWith('./')) {
      return htmlDir + '/' + dataPath.substring(2);
    } else if (dataPath.startsWith('../')) {
      let path = htmlDir;
      let relativePath = dataPath;
      while (relativePath.startsWith('../')) {
        path = path.substring(0, path.lastIndexOf('/'));
        relativePath = relativePath.substring(3);
      }
      return path + '/' + relativePath;
    } else {
      return htmlDir + '/' + dataPath;
    }
  },

  /**
   * 从 JSON 文件加载算法数据
   * @param {string} dataPath - JSON 文件路径
   * @param {object} fallbackData - 备用数据（可选）
   * @returns {Promise<object|null>}
   */
  async loadAlgorithmData(dataPath, fallbackData = null) {
    try {
      // 解析路径
      const resolvedPath = this.resolvePath(dataPath);
      console.log('算法文件原始路径:', dataPath);
      console.log('算法文件解析后路径:', resolvedPath);
      
      const response = await fetch(resolvedPath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('算法数据加载成功:', data);
      return data;
    } catch (error) {
      console.warn('从JSON文件加载算法失败:', error.message);
      console.warn('尝试的路径:', this.resolvePath(dataPath));
      if (fallbackData) {
        console.log('使用备用数据');
        return fallbackData;
      }
      return null;
    }
  },

  /**
   * 渲染算法步骤
   * @param {Array} steps - 算法步骤数组
   * @returns {string} HTML字符串
   */
  renderSteps(steps) {
    if (!steps || !Array.isArray(steps)) {
      return '';
    }

    let stepsHTML = '<div class="algorithm-steps">';
    
    steps.forEach(step => {
      stepsHTML += '<div class="algorithm-step">';
      
      // 步骤编号
      if (step.number !== undefined) {
        stepsHTML += `<div class="step-number">(${step.number})</div>`;
      }
      
      stepsHTML += '<div class="step-content">';
      
      // 条件（如果有）
      if (step.condition) {
        stepsHTML += `<div class="step-condition">${step.condition}</div>`;
      }
      
      // 动作列表
      if (step.actions && Array.isArray(step.actions)) {
        stepsHTML += '<div class="step-actions">';
        step.actions.forEach(action => {
          stepsHTML += `<div class="step-action">${action}</div>`;
        });
        stepsHTML += '</div>';
      }
      
      // 如果步骤是纯文本
      if (step.text) {
        stepsHTML += `<div class="step-text">${step.text}</div>`;
      }
      
      stepsHTML += '</div>'; // step-content
      stepsHTML += '</div>'; // algorithm-step
    });
    
    stepsHTML += '</div>';
    return stepsHTML;
  },


  /**
   * 渲染算法内容
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 容器ID
   * @param {object} config.data - 算法数据
   */
  renderAlgorithm(config) {
    const {
      containerId,
      data
    } = config;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`算法容器不存在: ${containerId}`);
      return;
    }
    
    if (!data) {
      console.error('算法数据无效');
      container.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">加载算法数据失败，请检查控制台错误信息。</p></div>';
      return;
    }

    let html = '<div class="algorithm-content tex2jax_process">';
    
    // 开始横线
    html += '<div class="algorithm-divider algorithm-divider-top"></div>';
    
    // 标题
    if (data.title) {
      html += `<h3 class="algorithm-title">${data.title}</h3>`;
    }
    
    // 描述
    if (data.description) {
      html += `<div class="algorithm-description">${data.description}</div>`;
    }
    
    // 初始化
    if (data.initialization) {
      html += '<div class="algorithm-initialization" style="display: block;">';
      html += '<span class="init-label" style="display: inline; white-space: nowrap;"><strong>初始化：</strong></span> ';
      html += `<span class="init-content" style="display: inline;">${data.initialization}</span>`;
      html += '</div>';
    }
    
    // 步骤
    if (data.steps && data.steps.length > 0) {
      html += this.renderSteps(data.steps);
    }
    
    // 结束横线
    html += '<div class="algorithm-divider algorithm-divider-bottom"></div>';
    
    html += '</div>';

    container.innerHTML = html;
    
    // 触发MathJax渲染（延迟执行，确保DOM已更新，并等待MathJax加载）
    // 使用更长的延迟，确保MathJax完全初始化
    const renderMathJax = async () => {
      // 使用公共的 MathJaxUtils 工具
      if (typeof MathJaxUtils !== 'undefined' && MathJaxUtils.triggerMathJaxRender) {
        await MathJaxUtils.triggerMathJaxRender(container, '算法');
      }
      // 多次尝试渲染，确保在GitHub Pages等环境中也能正确渲染
      for (let i = 0; i < 3; i++) {
        setTimeout(async () => {
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            const algorithmContent = container.querySelector('.algorithm-content');
            if (algorithmContent) {
              try {
                await MathJax.typesetPromise([algorithmContent]);
                console.log(`MathJax第${i + 2}次渲染完成`);
              } catch (err) {
                console.warn(`MathJax第${i + 2}次渲染错误:`, err);
              }
            }
          }
        }, 300 + i * 200);
      }
    };
    
    setTimeout(renderMathJax, 300);
  },

  /**
   * 加载并渲染算法
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 容器ID
   * @param {string} config.dataPath - JSON 数据文件路径
   * @param {object} config.fallbackData - 备用数据（可选）
   */
  async load(config) {
    const {
      containerId,
      dataPath,
      fallbackData = null
    } = config;

    const data = await this.loadAlgorithmData(dataPath, fallbackData);
    
    if (data) {
      this.renderAlgorithm({
        containerId,
        data
      });
    } else {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">无法加载算法数据。请确保JSON文件存在且路径正确。</p></div>';
      }
    }
  }
};

