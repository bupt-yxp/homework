/**
 * MathJax 配置和初始化工具
 * 统一管理 MathJax 的配置和加载，避免代码重复
 * 
 * 使用方法：
 * 1. 在 HTML 的 <head> 中引入此脚本
 * 2. 调用 MathJaxUtils.init() 来初始化 MathJax
 * 3. 可选：传入容器选择器数组，用于在加载完成后自动渲染
 * 
 * 示例：
 * MathJaxUtils.init({
 *   autoRenderSelectors: ['.algorithm-content', '.table-container']
 * });
 */

const MathJaxUtils = {
  /**
   * 初始化 MathJax 配置
   * @param {Object} options - 配置选项
   * @param {Array<string>} options.autoRenderSelectors - 自动渲染的容器选择器数组（可选）
   */
  init(options = {}) {
    const { autoRenderSelectors = [] } = options;

    // 配置 MathJax
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        processRefs: true,
        autoload: {
          color: [],
          colorv2: ['color'],
          bbox: ['bbox'],
          cancel: ['cancel', 'bcancel', 'xcancel', 'cancelto'],
          enclose: ['enclose', 'cancel', 'color']
        },
        packages: {'[+]': ['base', 'ams', 'newcommand', 'configMacros', 'cases', 'autoload']}
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      startup: {
        ready: () => {
          console.log('MathJax is loaded and ready');
          MathJax.startup.defaultReady();
          
          // 如果有自动渲染选择器，延迟渲染确保所有内容都已加载
          if (autoRenderSelectors.length > 0) {
            setTimeout(() => {
              autoRenderSelectors.forEach(selector => {
                const containers = document.querySelectorAll(selector);
                if (containers.length > 0) {
                  console.log(`找到 ${containers.length} 个 ${selector} 容器，开始渲染MathJax`);
                  containers.forEach((container, index) => {
                    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                      MathJax.typesetPromise([container]).then(() => {
                        console.log(`${selector} 容器 ${index + 1} MathJax渲染完成`);
                      }).catch(err => {
                        console.warn(`${selector} 容器 ${index + 1} MathJax渲染错误:`, err);
                      });
                    }
                  });
                }
              });
            }, 500);
          }
        }
      }
    };

    // 加载 MathJax CDN - 使用多个备用源，优先使用更可靠的CDN
    this.loadMathJaxScript();
  },

  /**
   * 动态加载 MathJax 脚本，支持多个备用 CDN
   */
  loadMathJaxScript() {
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js',  // Cloudflare CDN (更可靠)
      'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',  // jsDelivr CDN
      'https://unpkg.com/mathjax@3/es5/tex-mml-chtml.js'  // unpkg CDN
    ];
    
    const tryLoadScript = (index) => {
      if (index >= scripts.length) {
        console.error('所有MathJax CDN都加载失败，数学公式可能无法正确显示');
        return;
      }
      
      // 检查是否已经存在MathJax脚本
      const existingScript = document.getElementById('MathJax-script');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = 'MathJax-script';
      script.async = true;
      script.src = scripts[index];
      script.onerror = () => {
        console.warn(`MathJax CDN ${index + 1} (${scripts[index]}) 加载失败，尝试下一个...`);
        tryLoadScript(index + 1);
      };
      script.onload = () => {
        console.log(`✓ MathJax从CDN ${index + 1}加载成功: ${scripts[index]}`);
      };
      document.head.appendChild(script);
    };
    
    tryLoadScript(0);
  },

  /**
   * 等待MathJax加载完成
   * @returns {Promise}
   */
  waitForMathJax() {
    return new Promise((resolve) => {
      // 如果MathJax已经加载
      if (typeof MathJax !== 'undefined') {
        if (MathJax.typesetPromise) {
          // MathJax 3.x
          resolve();
        } else if (MathJax.Hub) {
          // MathJax 2.x
          resolve();
        } else {
          // MathJax正在加载，等待
          const checkInterval = setInterval(() => {
            if (typeof MathJax !== 'undefined' && (MathJax.typesetPromise || MathJax.Hub)) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          // 最多等待10秒
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 10000);
        }
      } else {
        // MathJax未加载，等待
        const checkInterval = setInterval(() => {
          if (typeof MathJax !== 'undefined' && (MathJax.typesetPromise || MathJax.Hub)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        // 最多等待10秒
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 10000);
      }
    });
  },

  /**
   * 触发MathJax重新渲染（如果可用）
   * @param {HTMLElement} element - 要渲染的元素
   * @param {string} context - 渲染上下文（用于日志，可选）
   */
  async triggerMathJaxRender(element, context = '') {
    await this.waitForMathJax();
    
    if (typeof MathJax !== 'undefined') {
      if (MathJax.typesetPromise) {
        // MathJax 3.x
        try {
          await MathJax.typesetPromise([element]);
          const logMsg = context ? `${context} MathJax渲染完成` : 'MathJax渲染完成';
          console.log(logMsg);
        } catch (err) {
          const warnMsg = context ? `${context} MathJax渲染错误` : 'MathJax渲染错误';
          console.warn(warnMsg + ':', err);
        }
      } else if (MathJax.Hub) {
        // MathJax 2.x
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
      }
    } else {
      console.warn('MathJax未加载，无法渲染数学公式');
    }
  }
};

