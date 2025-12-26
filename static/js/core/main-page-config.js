/**
 * 主页面配置
 * 定义主页面的所有sections和内容
 */

const mainPageConfig = {
  sections: [
    {
      type: 'hero',
      title: 'Homework展示页面',
      subtitle: '<b>简介:</b> 本网站集中展示了部分课程与项目的可视化成果。目前仍在持续开发与更新中。',
      titleStyle: 'font-size: 2.2rem; margin-bottom: 1rem;',
      subtitleStyle: 'margin-top: 1.5rem;'
    },
    {
      type: 'intro',
      title: '说明',
      content: '这是一个homework展示网站的主页面。您可以通过顶部导航栏中的"More Homework"下拉菜单访问不同的作业页面。每个作业页面都包含详细的内容和展示。',
      sectionClass: 'intro-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 1.5rem; color: #2c3e50;',
      contentStyle: 'line-height: 1.8; color: #555;',
      columnClass: 'is-10'
    }
  ]
};

