/**
 * 通用图片数据加载器
 * 从配置加载图片并动态显示，支持多种图片格式
 * 
 * 使用方法：
 * 1. 在HTML中添加图片容器，并设置 data-image-config 属性：
 *    <div id="image-container" data-image-config='{"imagePath": "./resource/figure/method.png", "alt": "算法框架图", "footerId": "image-footer"}'></div>
 * 
 * 2. 或者使用 JavaScript API：
 *    ImageLoader.load({
 *      containerId: 'image-container',
 *      imagePath: './resource/figure/method.png',
 *      alt: '算法框架图',
 *      footerId: 'image-footer'
 *    });
 */

const ImageLoader = {
  /**
   * 解析路径，支持相对路径和绝对路径
   * @param {string} imagePath - 图片文件路径（相对于当前HTML文件）
   * @returns {string} 解析后的路径
   */
  resolvePath(imagePath) {
    // 使用公共的路径解析工具
    if (typeof PathResolver !== 'undefined' && PathResolver.resolve) {
      return PathResolver.resolve(imagePath);
    }
    // 降级方案：如果 PathResolver 不可用，使用简单实现
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    const currentPath = window.location.pathname;
    const htmlDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (imagePath.startsWith('./')) {
      return htmlDir + '/' + imagePath.substring(2);
    } else if (imagePath.startsWith('../')) {
      let path = htmlDir;
      let relativePath = imagePath;
      while (relativePath.startsWith('../')) {
        path = path.substring(0, path.lastIndexOf('/'));
        relativePath = relativePath.substring(3);
      }
      return path + '/' + relativePath;
    } else {
      return htmlDir + '/' + imagePath;
    }
  },

  /**
   * 渲染图片
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 图片容器ID
   * @param {string} config.imagePath - 图片文件路径
   * @param {string} config.alt - 图片替代文本（可选）
   * @param {string} config.footerId - 脚注容器ID（可选）
   * @param {string} config.footerNote - 脚注内容（可选）
   * @param {string} config.imageStyle - 图片样式（可选，默认：'width: 100%; height: auto; border-radius: 8px;'）
   */
  renderImage(config) {
    const {
      containerId,
      imagePath,
      alt = '',
      footerId = null,
      footerNote = null,
      imageStyle = 'width: 100%; height: auto; border-radius: 8px;'
    } = config;

    const imageContainer = document.getElementById(containerId);
    if (!imageContainer) {
      console.error(`图片容器不存在: ${containerId}`);
      return;
    }
    
    if (!imagePath) {
      console.error('图片路径未指定');
      imageContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">图片路径未指定。</p></div>';
      return;
    }

    // 解析图片路径
    const resolvedPath = this.resolvePath(imagePath);
    console.log('原始图片路径:', imagePath);
    console.log('解析后图片路径:', resolvedPath);

    // 创建图片元素
    const figure = document.createElement('figure');
    figure.className = 'image';
    figure.style.textAlign = 'center';
    
    const img = document.createElement('img');
    img.src = resolvedPath;
    img.alt = alt || '图片';
    img.style.cssText = imageStyle;
    
    // 添加加载错误处理
    img.onerror = () => {
      console.error(`图片加载失败: ${resolvedPath}`);
      imageContainer.innerHTML = `<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">图片加载失败，请检查路径是否正确：${imagePath}</p></div>`;
    };
    
    // 添加加载成功提示
    img.onload = () => {
      console.log(`图片加载成功: ${resolvedPath}`);
    };
    
    figure.appendChild(img);
    
    // 清空容器并添加图片
    imageContainer.innerHTML = '';
    imageContainer.style.margin = '0';
    imageContainer.style.padding = '0';
    imageContainer.appendChild(figure);

    // 添加脚注
    if (footerId && footerNote) {
      const footerElement = document.getElementById(footerId);
      if (footerElement) {
        footerElement.textContent = footerNote;
      }
    }
  },

  /**
   * 加载并渲染图片
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 图片容器ID
   * @param {string} config.imagePath - 图片文件路径
   * @param {string} config.alt - 图片替代文本（可选）
   * @param {string} config.footerId - 脚注容器ID（可选）
   * @param {string} config.footerNote - 脚注内容（可选）
   * @param {string} config.imageStyle - 图片样式（可选）
   */
  load(config) {
    this.renderImage(config);
  },

  /**
   * 自动初始化所有带有 data-image-config 属性的图片容器
   */
  initAutoLoad() {
    const containers = document.querySelectorAll('[data-image-config]');
    
    containers.forEach(container => {
      try {
        const configStr = container.getAttribute('data-image-config');
        const config = JSON.parse(configStr);
        
        // 从容器ID或配置中获取容器ID
        const containerId = config.containerId || container.id;
        if (!containerId) {
          console.error('图片容器缺少ID');
          return;
        }
        
        // 确保容器ID在配置中
        config.containerId = containerId;
        
        // 验证必要配置
        if (!config.imagePath) {
          console.error('图片配置缺少 imagePath 属性');
          const imageContainer = document.getElementById(containerId);
          if (imageContainer) {
            imageContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">图片配置错误：缺少 imagePath 属性。请在 data-image-config 中指定 imagePath。</p></div>';
          }
          return;
        }
        
        // 显示路径信息（用于调试）
        const resolvedPath = this.resolvePath(config.imagePath);
        console.log(`图片容器: ${containerId}`);
        console.log(`原始路径: ${config.imagePath}`);
        console.log(`解析后路径: ${resolvedPath}`);
        
        // 加载图片（config 已经包含了所有需要的属性）
        this.load({
          containerId: containerId,
          imagePath: config.imagePath,
          alt: config.alt || '',
          footerId: config.footerId || null,
          footerNote: config.footerNote || null,
          imageStyle: config.imageStyle || 'width: 100%; height: auto; border-radius: 8px;'
        });
      } catch (error) {
        console.error('解析图片配置失败:', error);
      }
    });
  }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ImageLoader.initAutoLoad();
  });
} else {
  // DOM已经加载完成
  ImageLoader.initAutoLoad();
}

