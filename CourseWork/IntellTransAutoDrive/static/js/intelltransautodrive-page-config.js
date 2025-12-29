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
      type: 'experiment',
      title: '基于 Highway 环境的决策实验',
      description: '本实验在 Highway 环境中进行自动驾驶决策算法的研究，采用深度 Q 网络（DQN）和近端策略优化（PPO）两种算法进行对比实验。',
      sectionClass: 'experiment-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      algorithms: [
        {
          title: 'DQN 算法',
          algorithmConfig: {
            containerId: 'dqn-algorithm-container',
            dataPath: './resource/algorithm/dqn.json',
            fallbackData: null
          }
        },
        {
          title: 'PPO 算法',
          algorithmConfig: {
            containerId: 'ppo-algorithm-container',
            dataPath: './resource/algorithm/ppo.json',
            fallbackData: null
          }
        }
      ],
      videos: [
        {
          title: 'DQN',
          image: './resource/video/highway_dqn.gif',
          alt: 'Highway 环境 DQN 算法可视化结果'
        },
        {
          title: 'PPO',
          image: './resource/video/highway_ppo.gif',
          alt: 'Highway 环境 PPO 算法可视化结果'
        }
      ],
      videoColumnClass: 'is-12'
    },
    {
      type: 'experiment',
      title: '基于注意力机制的 PPO 算法',
      description: '本实验在 Racetrack 环境中，采用基于注意力机制的近端策略优化（PPO with Attention）算法，通过多头注意力机制提取周围车辆的特征信息，提升自动驾驶决策的准确性。',
      sectionClass: 'experiment-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      algorithms: [
        {
          title: 'PPO with Attention 算法',
          algorithmConfig: {
            containerId: 'ppo-attn-algorithm-container',
            dataPath: './resource/algorithm/ppo-attn.json',
            fallbackData: null
          }
        }
      ],
      videos: [
        {
          title: 'PPO-Attention',
          image: './resource/video/racetrack_ppo_attn.gif',
          alt: 'Racetrack 环境 PPO-Attn 算法可视化结果'
        }
      ],
      videoColumnClass: 'is-12'
    },
    {
      type: 'experiment',
      title: 'Intersection 环境下的多智能体强化学习',
      description: '本实验在 Intersection 环境中进行多智能体强化学习研究，采用基于注意力机制的多智能体深度 Q 网络（Multi-Agent DQN with Attention）算法，实现多车辆协同决策。',
      sectionClass: 'experiment-section',
      sectionStyle: 'padding: 2rem 0;',
      titleStyle: 'margin-bottom: 2rem; color: #2c3e50;',
      columnClass: 'is-10',
      algorithms: [
        {
          title: 'Multi-Agent DQN with Attention 算法',
          algorithmConfig: {
            containerId: 'marl-algorithm-container',
            dataPath: './resource/algorithm/marl.json',
            fallbackData: null
          }
        }
      ],
      videos: [
        {
          title: 'Multi-Agent DQN-Attention',
          image: './resource/video/intersection-marl.gif',
          alt: 'Intersection 环境多智能体强化学习可视化结果'
        }
      ],
      videoColumnClass: 'is-12'
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
