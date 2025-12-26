/**
 * 图论及其应用课程页面配置
 * 定义该页面的所有sections和内容
 */

const graphthyPageConfig = {
  sections: [
    {
      type: 'hero',
      title: '图论及其应用',
      subtitle: '<b>课程简介:</b> 随着计算机和网络的快速发展和广泛应用，图论及其应用课程已快速发展成为一门独立的数学分支，成为通信、信息、网络、大数据、人工智能、系统科学、计算机科学及工程以及经济和社会科学等领域中都有着广泛应用的一门学科。通过本课程的学习，学生能够掌握图论的基本理论和方法，熟悉一些经典的图论算法和实现，快速提高数据分析、算法设计、复杂性分析等技术，学会应用图论的方法去灵活解决各自领域中经常遇到的一些实际问题；通过本课程的学习，能够了解当今最前沿的应用数学发展动态。',
      titleStyle: 'font-size: 2.2rem; margin-bottom: 1rem;',
      subtitleStyle: 'margin-top: 1.5rem;'
    },
    {
      type: 'algorithm',
      title: 'Kuhn-Munker 算法',
      sectionClass: 'algorithm-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      algorithmConfig: {
        containerId: 'algorithm-container',
        dataPath: './resource/algorithm/Kuhn-Munker.json',
        fallbackData: null
      }
    },
    {
      type: 'table',
      title: '实验结果',
      sectionClass: 'results-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      tableConfig: {
        containerId: 'results-table-container',
        dataPath: './resource/table/table-data.json',
        footerId: 'results-table-footer',
        headerOrder: ['metric', 'tablet', 'stapler', 'washer', 'average'],
        boldColumns: ['average'],
        fallbackData: null
      },
      footerId: 'results-table-footer'
    },
    {
      type: 'visualization',
      title: '可视化展示',
      sectionClass: 'visualization-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      description: '利用匈牙利算法建立的匹配映射关系在物理语义上保持了高度一致。',
      items: [
        {
          title: '平板电脑 (10211)',
          image: './resource/video/laptop.gif',
          alt: '平板电脑匹配结果演示'
        },
        {
          title: '订书机 (103111)',
          image: './resource/video/stapler.gif',
          alt: '订书机匹配结果演示'
        },
        {
          title: '洗衣机 (103776)',
          image: './resource/video/washer.gif',
          alt: '洗衣机匹配结果演示'
        }
      ],
      itemColumnClass: 'is-4',
      footnote: '图：红蓝虚线连接的匹配对在物理语义上保持高度一致。'
    },
    {
      type: 'pointcloud',
      title: '点云匹配可视化',
      sectionClass: 'pointcloud-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10'
    }
  ],
  
  /**
   * 页面渲染完成后的回调函数
   * 用于初始化需要特殊处理的组件（如表格加载器）
   */
  onRenderComplete() {
    // 表格加载器会自动初始化（通过 table-loader.js 的 initAutoLoad）
    // 这里可以添加其他需要在渲染后执行的初始化逻辑
    if (typeof TableLoader !== 'undefined' && TableLoader.initAutoLoad) {
      // 确保表格加载器重新扫描并加载表格
      setTimeout(() => {
        TableLoader.initAutoLoad();
      }, 100);
    }
    
    // 初始化算法可视化器
    if (typeof AlgorithmVisualizer !== 'undefined') {
      // 增加延迟，确保所有资源都已加载（特别是GitHub Pages环境）
      setTimeout(async () => {
        const algorithmContainers = document.querySelectorAll('[data-algorithm-config]');
        for (const container of algorithmContainers) {
          try {
            const configStr = container.getAttribute('data-algorithm-config');
            const config = JSON.parse(configStr);
            const containerId = config.containerId || container.id;
            if (containerId && config.dataPath) {
              await AlgorithmVisualizer.load({
                containerId: containerId,
                dataPath: config.dataPath,
                fallbackData: config.fallbackData || null
              });
              // 额外触发一次MathJax渲染，确保在GitHub Pages上也能正确显示
              setTimeout(() => {
                if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                  const algorithmContent = document.querySelector(`#${containerId} .algorithm-content`);
                  if (algorithmContent) {
                    MathJax.typesetPromise([algorithmContent]).catch(err => {
                      console.warn('算法MathJax额外渲染错误:', err);
                    });
                  }
                }
              }, 1000);
            }
          } catch (error) {
            console.error('解析算法配置失败:', error);
          }
        }
      }, 300);
    }
  }
};

