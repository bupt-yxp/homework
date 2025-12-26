/**
 * 智慧交通与自动驾驶课程页面配置
 * 定义该页面的所有sections和内容
 */

const intelltransautodrivePageConfig = {
  sections: [
    {
      type: 'hero',
      title: '智慧交通与自动驾驶',
      subtitle: '<b>课程简介:</b> 通过本课程的学习，研究生可以了解智慧交通技术的理论研究和示范工程的应用成果，深入掌握自动驾驶汽车的核心技术；通过本课程的学习，可以培养学生智慧交通系统的设计能力。智慧交通系统将人、车、路以及环境综合起来考虑，并把先进的信息技术、数据通信技术及电子控制技术等有效的综合运用于交通运输体系，从而建立起一种大范围、全方位发挥作用、实时准确高效的交通运输系统。智慧交通系统是现代高新技术与交通运输行业深度融合的产物，同时伴随着现代高新技术的发展而发展。',
      titleStyle: 'font-size: 2.2rem; margin-bottom: 1rem;',
      subtitleStyle: 'margin-top: 1.5rem;'
    },
    {
      type: 'intro',
      title: '说明',
      content: '这是智慧交通与自动驾驶课程页面。内容待补充。',
      sectionClass: 'intro-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 1.5rem; color: #2c3e50;',
      contentStyle: 'line-height: 1.8; color: #555;',
      columnClass: 'is-10'
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
  }
};

