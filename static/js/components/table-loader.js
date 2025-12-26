/**
 * 通用表格数据加载器
 * 从 JSON 文件加载表格数据并动态生成表格
 * 
 * 使用方法：
 * 1. 在HTML中添加表格容器，并设置 data-table-config 属性：
 *    <div id="table-container" data-table-config='{"dataPath": "./resource/table/table-data.json", "footerId": "table-footer"}'></div>
 * 
 * 2. 或者使用 JavaScript API：
 *    TableLoader.load({
 *      containerId: 'table-container',
 *      dataPath: './resource/table/table-data.json',
 *      footerId: 'table-footer',
 *      headerOrder: ['metric', 'tablet', 'stapler', 'washer', 'average'],
 *      boldColumns: ['average']
 *    });
 */

const TableLoader = {
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
   * 从 JSON 文件加载数据
   * @param {string} dataPath - JSON 文件路径（相对于当前HTML文件）
   * @param {object} fallbackData - 备用数据（可选）
   * @returns {Promise<object|null>}
   */
  async loadTableData(dataPath, fallbackData = null) {
    try {
      // 解析路径
      const resolvedPath = this.resolvePath(dataPath);
      console.log('原始路径:', dataPath);
      console.log('解析后路径:', resolvedPath);
      
      const response = await fetch(resolvedPath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('表格数据加载成功:', data);
      return data;
    } catch (error) {
      console.warn('从JSON文件加载失败:', error.message);
      console.warn('尝试的路径:', this.resolvePath(dataPath));
      if (fallbackData) {
        console.log('使用备用数据');
        return fallbackData;
      }
      return null;
    }
  },


  /**
   * 渲染表格
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 表格容器ID
   * @param {object} config.data - 表格数据
   * @param {string} config.footerId - 脚注容器ID（可选）
   * @param {array} config.headerOrder - 表头顺序（可选，默认使用数据中的顺序）
   * @param {array} config.boldColumns - 需要加粗的列键名（可选）
   * @param {string} config.tableClass - 表格CSS类（可选，默认: 'table is-fullwidth is-striped is-hoverable'）
   * @param {object} config.columnStyles - 列样式配置（可选，格式：{columnKey: {minWidth, whiteSpace}}）
   */
  renderTable(config) {
    const {
      containerId,
      data,
      footerId = null,
      headerOrder = null,
      boldColumns = [],
      tableClass = 'table is-fullwidth is-striped is-hoverable',
      columnStyles = {}
    } = config;

    const tableContainer = document.getElementById(containerId);
    if (!tableContainer) {
      console.error(`表格容器不存在: ${containerId}`);
      return;
    }
    
    if (!data || !data.headers || !data.rows) {
      console.error('数据格式无效');
      tableContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">加载表格数据失败，请检查控制台错误信息。</p></div>';
      return;
    }

    // 创建表格元素
    const table = document.createElement('table');
    table.className = tableClass;

    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = data.headers;
    
    // 确定表头顺序
    let order = headerOrder;
    if (!order) {
      // 如果没有指定顺序，使用数据中的键顺序
      order = Object.keys(headers);
    }
    
    order.forEach((key, index) => {
      if (headers[key]) {
        const th = document.createElement('th');
        // 使用innerHTML以支持LaTeX公式
        th.innerHTML = headers[key];
        // 所有列居中对齐
        th.style.textAlign = 'center';
        // 应用列样式配置（如果存在）
        if (columnStyles[key]) {
          if (columnStyles[key].minWidth) {
            th.style.minWidth = columnStyles[key].minWidth;
          }
          if (columnStyles[key].whiteSpace) {
            th.style.whiteSpace = columnStyles[key].whiteSpace;
          }
        } else if (index === 0) {
          // 默认：第一列（指标列）设置最小宽度和防止换行
          th.style.minWidth = '100px';
          th.style.whiteSpace = 'nowrap';
        }
        headerRow.appendChild(th);
      }
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表体
    const tbody = document.createElement('tbody');
    
    data.rows.forEach(row => {
      const tr = document.createElement('tr');
      
      order.forEach((key, index) => {
        if (headers[key] && row.hasOwnProperty(key)) {
          const td = document.createElement('td');
          
          // 所有列居中对齐
          td.style.textAlign = 'center';
          
          // 应用列样式配置（如果存在）
          if (columnStyles[key]) {
            if (columnStyles[key].minWidth) {
              td.style.minWidth = columnStyles[key].minWidth;
            }
            if (columnStyles[key].whiteSpace) {
              td.style.whiteSpace = columnStyles[key].whiteSpace;
            }
          } else if (index === 0) {
            // 默认：第一列（指标列）设置最小宽度和防止换行
            td.style.minWidth = '100px';
            td.style.whiteSpace = 'nowrap';
          }
          
          // 检查是否需要加粗
          if (boldColumns.includes(key)) {
            const bold = document.createElement('b');
            // 使用innerHTML以支持LaTeX公式
            bold.innerHTML = row[key];
            td.appendChild(bold);
          } else {
            // 使用innerHTML以支持LaTeX公式
            td.innerHTML = row[key];
          }
          
          tr.appendChild(td);
        }
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);

    // 清空容器并添加表格
    // 确保表格容器不会破坏卡片的左右边距设置
    tableContainer.innerHTML = '';
    // 确保容器没有额外的 margin，保持卡片的边距设置
    tableContainer.style.margin = '0';
    tableContainer.style.padding = '0';
    tableContainer.appendChild(table);

    // 添加脚注
    if (footerId && data.footer && data.footer.note) {
      const footerNote = document.getElementById(footerId);
      if (footerNote) {
        footerNote.textContent = data.footer.note;
      }
    }

    // 触发MathJax渲染（如果可用）
    if (typeof MathJaxUtils !== 'undefined' && MathJaxUtils.triggerMathJaxRender) {
      MathJaxUtils.triggerMathJaxRender(tableContainer, '表格');
    }
  },

  /**
   * 加载并渲染表格
   * @param {object} config - 配置对象
   * @param {string} config.containerId - 表格容器ID
   * @param {string} config.dataPath - JSON 数据文件路径
   * @param {string} config.footerId - 脚注容器ID（可选）
   * @param {array} config.headerOrder - 表头顺序（可选）
   * @param {array} config.boldColumns - 需要加粗的列键名（可选）
   * @param {object} config.fallbackData - 备用数据（可选）
   * @param {string} config.tableClass - 表格CSS类（可选）
   * @param {object} config.columnStyles - 列样式配置（可选）
   */
  async load(config) {
    const {
      containerId,
      dataPath,
      footerId = null,
      headerOrder = null,
      boldColumns = [],
      fallbackData = null,
      tableClass = 'table is-fullwidth is-striped is-hoverable',
      columnStyles = {}
    } = config;

    const data = await this.loadTableData(dataPath, fallbackData);
    
    if (data) {
      this.renderTable({
        containerId,
        data,
        footerId,
        headerOrder,
        boldColumns,
        tableClass,
        columnStyles
      });
    } else {
      const tableContainer = document.getElementById(containerId);
      if (tableContainer) {
        tableContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">无法加载表格数据。请确保JSON文件存在且路径正确。</p></div>';
      }
    }
  },

  /**
   * 自动初始化所有带有 data-table-config 属性的表格容器
   */
  initAutoLoad() {
    const containers = document.querySelectorAll('[data-table-config]');
    
    containers.forEach(container => {
      try {
        const configStr = container.getAttribute('data-table-config');
        const config = JSON.parse(configStr);
        
        // 从容器ID或配置中获取容器ID
        const containerId = config.containerId || container.id;
        if (!containerId) {
          console.error('表格容器缺少ID');
          return;
        }
        
        // 确保容器ID在配置中
        config.containerId = containerId;
        
        // 验证必要配置
        if (!config.dataPath) {
          console.error('表格配置缺少 dataPath 属性');
          const tableContainer = document.getElementById(containerId);
          if (tableContainer) {
            tableContainer.innerHTML = '<div class="has-text-centered" style="padding: 2rem;"><p style="color: #d32f2f;">表格配置错误：缺少 dataPath 属性。请在 data-table-config 中指定 dataPath。</p></div>';
          }
          return;
        }
        
        // 显示路径信息（用于调试）
        const resolvedPath = this.resolvePath(config.dataPath);
        console.log(`表格容器: ${containerId}`);
        console.log(`原始路径: ${config.dataPath}`);
        console.log(`解析后路径: ${resolvedPath}`);
        
        // 加载表格
        this.load(config);
      } catch (error) {
        console.error('解析表格配置失败:', error);
      }
    });
  }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TableLoader.initAutoLoad();
  });
} else {
  // DOM已经加载完成
  TableLoader.initAutoLoad();
}

