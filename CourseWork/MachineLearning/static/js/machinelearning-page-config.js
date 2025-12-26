/**
 * 机器学习课程页面配置
 * 定义该页面的所有sections和内容
 */

const machinelearningPageConfig = {
  sections: [
    {
      type: 'hero',
      title: '机器学习',
      subtitle: '<b>课程简介:</b> 本课程涵盖了机器学习的大部分内容，从机器学习原理到实际应用，从传统机器学习方法到深度学习等领域前沿方向，具体包括：机器学习基本原理、支持向量机、决策树、贝叶斯学习、聚类、表示学习、深度学习、基于实例的学习、强化学习等。本课程注重理论教学与实验的结合，注重学生实践能力的培养，设立实践环节来提高学生对机器学习算法的理解和实际动手能力，帮助学生能够在实际项目的研究中运用机器学习方法加速工作，跟踪前沿的机器学习算法、思想和应用等，为学生从事机器学习、人工智能等相关领域的研究或实践打下坚实的基础。',
      titleStyle: 'font-size: 2.2rem; margin-bottom: 1rem;',
      subtitleStyle: 'margin-top: 1.5rem;'
    },
    {
      type: 'image',
      title: '算法框架图',
      description: '模型采用变分自编码器（Variational Autoencoder, VAE）架构，实现从稀疏点云到连续几何表面的隐式重建。该架构由三个核心模块组成：点云编码器、变分自编码器和SDF解码器。给定输入点云 $P = \\{p_i\\}_{i=1}^n$，模型通过端到端训练学习潜在表示 $z$，使得对于任意查询点 $x \\in \\mathbb{R}^3$，能够预测其符号距离值 $s = \\Phi(x, z)$。',
      sectionClass: 'image-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      descriptionStyle: 'margin-bottom: 2rem; color: #555; line-height: 1.8;',
      columnClass: 'is-10',
      imageConfig: {
        containerId: 'algorithm-framework-image-container',
        imagePath: './resource/figure/method.png',
        alt: '算法框架图',
        footerId: 'algorithm-framework-image-footer',
        footerNote: '图：机器学习算法框架图'
      },
      footerId: 'algorithm-framework-image-footer'
    },
    {
      type: 'table',
      title: '实验结果',
      sectionClass: 'results-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      tableConfig: {
        containerId: 'mesh-results-table-container',
        dataPath: './resource/table/table-data.json',
        footerId: 'mesh-results-table-footer',
        headerOrder: ['metric', 'dishwasher', 'microwave', 'oven', 'refrigerator', 'storage_cabinet', 'table', 'washing_machine'],
        boldColumns: [],
        fallbackData: null,
        columnStyles: {
          metric: {
            minWidth: '100px',
            whiteSpace: 'nowrap'
          }
        }
      },
      footerId: 'mesh-results-table-footer'
    },
    {
      type: 'visualization',
      title: '可视化展示',
      sectionClass: 'visualization-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      itemColumnClass: 'is-12',
      items: [
        {
          title: '洗碗机 (11622)',
          image: './resource/video/Dishwasher_11622.gif',
          alt: '洗碗机可视化实例 11622'
        },
        {
          title: '洗碗机 (11700)',
          image: './resource/video/Dishwasher_11700.gif',
          alt: '洗碗机可视化实例 11700'
        },
        {
          title: '微波炉 (7221)',
          image: './resource/video/Microwave_7221.gif',
          alt: '微波炉可视化实例 7221'
        },
        {
          title: '微波炉 (7366)',
          image: './resource/video/Microwave_7366.gif',
          alt: '微波炉可视化实例 7366'
        },
        {
          title: '烤箱 (7138)',
          image: './resource/video/Oven_7138.gif',
          alt: '烤箱可视化实例 7138'
        },
        {
          title: '烤箱 (7290)',
          image: './resource/video/Oven_7290.gif',
          alt: '烤箱可视化实例 7290'
        },
        {
          title: '冰箱 (10586)',
          image: './resource/video/Refrigerator_10586.gif',
          alt: '冰箱可视化实例 10586'
        },
        {
          title: '冰箱 (10797)',
          image: './resource/video/Refrigerator_10797.gif',
          alt: '冰箱可视化实例 10797'
        },
        {
          title: '存储柜 (35059)',
          image: './resource/video/StorageFurniture_35059.gif',
          alt: '存储柜可视化实例 35059'
        },
        {
          title: '存储柜 (41004)',
          image: './resource/video/StorageFurniture_41004.gif',
          alt: '存储柜可视化实例 41004'
        },
        {
          title: '存储柜 (45166)',
          image: './resource/video/StorageFurniture_45166.gif',
          alt: '存储柜可视化实例 45166'
        },
        {
          title: '存储柜 (47021)',
          image: './resource/video/StorageFurniture_47021.gif',
          alt: '存储柜可视化实例 47021'
        },
        {
          title: '存储柜 (47168)',
          image: './resource/video/StorageFurniture_47168.gif',
          alt: '存储柜可视化实例 47168'
        },
        {
          title: '存储柜 (48467)',
          image: './resource/video/StorageFurniture_48467.gif',
          alt: '存储柜可视化实例 48467'
        },
        {
          title: '桌子 (19825)',
          image: './resource/video/Table_19825.gif',
          alt: '桌子可视化实例 19825'
        },
        {
          title: '桌子 (20411)',
          image: './resource/video/Table_20411.gif',
          alt: '桌子可视化实例 20411'
        },
        {
          title: '桌子 (26670)',
          image: './resource/video/Table_26670.gif',
          alt: '桌子可视化实例 26670'
        },
        {
          title: '桌子 (32566)',
          image: './resource/video/Table_32566.gif',
          alt: '桌子可视化实例 32566'
        },
        {
          title: '洗衣机 (100282)',
          image: './resource/video/WashingMachine_100282.gif',
          alt: '洗衣机可视化实例 100282'
        },
        {
          title: '洗衣机 (103778)',
          image: './resource/video/WashingMachine_103778.gif',
          alt: '洗衣机可视化实例 103778'
        }
      ]
    }
  ],
  
  /**
   * 页面渲染完成后的回调函数
   * 用于初始化需要特殊处理的组件（如表格加载器）
   */
  onRenderComplete() {
    // 表格加载器会自动初始化（通过 table-loader.js 的 initAutoLoad）
    if (typeof TableLoader !== 'undefined' && TableLoader.initAutoLoad) {
      setTimeout(() => {
        TableLoader.initAutoLoad();
      }, 100);
    }
    // 图片加载器会自动初始化（通过 image-loader.js 的 initAutoLoad）
    if (typeof ImageLoader !== 'undefined' && ImageLoader.initAutoLoad) {
      setTimeout(() => {
        ImageLoader.initAutoLoad();
      }, 100);
    }
  }
};

