/**
 * 点云匹配可视化工具
 * 处理点云数据输入和匹配结果可视化
 */

(function() {
  'use strict';

  // DOM元素引用
  const pointcloudInput = document.getElementById('pointcloud-input');
  const fileInput = document.getElementById('pointcloud-file-input');
  const fileName = document.getElementById('file-name');
  const processBtn = document.getElementById('process-pointcloud-btn');
  const resultBox = document.getElementById('result-display-box');
  const resultContainer = document.getElementById('result-display-container');
  const resultImage = document.getElementById('result-image');
  const resultImageContainer = document.getElementById('result-image-container');
  const processingNotification = document.getElementById('processing-notification');
  const errorNotification = document.getElementById('error-notification');
  const errorMessage = document.getElementById('error-message');

  // 默认点云数据示例
  const defaultPointCloudData = {
    "source": [
      [0.0, 0.0, 0.0],
      [1.0, 0.0, 0.0],
      [0.0, 1.0, 0.0],
      [0.0, 0.0, 1.0],
      [1.0, 1.0, 0.0],
      [1.0, 0.0, 1.0],
      [0.0, 1.0, 1.0],
      [1.0, 1.0, 1.0]
    ],
    "target": [
      [0.1, 0.1, 0.1],
      [1.1, 0.1, 0.1],
      [0.1, 1.1, 0.1],
      [0.1, 0.1, 1.1],
      [1.1, 1.1, 0.1],
      [1.1, 0.1, 1.1],
      [0.1, 1.1, 1.1],
      [1.1, 1.1, 1.1]
    ]
  };

  // 初始化
  function init() {
    if (!pointcloudInput || !fileInput || !processBtn) {
      console.warn('点云可视化组件未找到，跳过初始化');
      return;
    }

    // 如果输入框为空或只有空白字符，填充默认示例数据
    const currentValue = pointcloudInput.value || '';
    if (!currentValue.trim()) {
      pointcloudInput.value = JSON.stringify(defaultPointCloudData, null, 2);
      // 触发input事件以确保界面更新
      pointcloudInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 处理按钮点击事件
    processBtn.addEventListener('click', handleProcess);
    
    // 文本输入框变化时清除文件名显示
    pointcloudInput.addEventListener('input', () => {
      if (fileInput.files.length === 0) {
        fileName.textContent = '未选择文件';
      }
    });
  }

  // 处理文件选择
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      fileName.textContent = '未选择文件';
      // 如果取消选择文件，恢复默认示例数据
      if (!pointcloudInput.value.trim()) {
        pointcloudInput.value = JSON.stringify(defaultPointCloudData, null, 2);
      }
      return;
    }

    fileName.textContent = file.name;

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        
        // 如果是JSON文件，直接显示在文本框中
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          pointcloudInput.value = JSON.stringify(data, null, 2);
        } else {
          // 其他格式文件，显示原始内容
          pointcloudInput.value = content;
        }
      } catch (error) {
        console.error('读取文件失败:', error);
        showError('读取文件失败: ' + error.message);
      }
    };
    
    reader.onerror = function() {
      showError('文件读取错误');
    };

    // 根据文件类型选择读取方式
    if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      showError('暂不支持此文件格式，请使用 .json 或 .txt 文件');
    }
  }

  // 验证点云数据格式
  function validatePointCloudData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '数据格式错误：必须是对象' };
    }

    if (!data.source || !Array.isArray(data.source)) {
      return { valid: false, error: '数据格式错误：缺少 source 数组' };
    }

    if (!data.target || !Array.isArray(data.target)) {
      return { valid: false, error: '数据格式错误：缺少 target 数组' };
    }

    // 验证点的格式
    for (let i = 0; i < data.source.length; i++) {
      const point = data.source[i];
      if (!Array.isArray(point) || point.length < 3) {
        return { valid: false, error: `source 点 ${i} 格式错误：应为 [x, y, z] 数组` };
      }
    }

    for (let i = 0; i < data.target.length; i++) {
      const point = data.target[i];
      if (!Array.isArray(point) || point.length < 3) {
        return { valid: false, error: `target 点 ${i} 格式错误：应为 [x, y, z] 数组` };
      }
    }

    return { valid: true };
  }

  // 处理点云数据
  async function handleProcess() {
    // 隐藏之前的错误和结果
    hideError();
    hideResult();

    // 获取输入数据
    const inputText = pointcloudInput.value.trim();
    if (!inputText) {
      showError('请输入点云数据或上传文件');
      return;
    }

    // 解析JSON数据
    let pointCloudData;
    try {
      pointCloudData = JSON.parse(inputText);
    } catch (error) {
      showError('JSON格式错误: ' + error.message);
      return;
    }

    // 验证数据格式
    const validation = validatePointCloudData(pointCloudData);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    // 显示处理中状态
    showProcessing();

    // 禁用按钮
    processBtn.disabled = true;
    processBtn.classList.add('is-loading');

    try {
      // 调用后端API生成匹配结果图片
      // 注意：这里需要后端API支持，如果后端不可用，可以显示示例图片
      const resultImageUrl = await generateMatchVisualization(pointCloudData);
      
      // 显示结果
      showResult(resultImageUrl);
    } catch (error) {
      console.error('处理点云数据失败:', error);
      showError('处理失败: ' + error.message);
    } finally {
      // 恢复按钮状态
      processBtn.disabled = false;
      processBtn.classList.remove('is-loading');
      hideProcessing();
    }
  }

  // 生成匹配结果可视化
  // 调用后端API生成匹配结果图片
  async function generateMatchVisualization(pointCloudData) {
    // 后端API地址（默认本地服务器）
    const apiUrl = 'http://localhost:5000/api/pointcloud/match';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: pointCloudData.source,
          target: pointCloudData.target,
          num_vis_points: 20,  // 可视化的点数
          seed: 42  // 随机种子
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }));
        throw new Error(errorData.error || `API错误: ${response.status}`);
      }
      
      // 将响应转换为 blob，然后创建 URL
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      // 如果是网络错误（CORS 或连接失败），提供更友好的错误信息
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到后端服务器。请确保已启动 API 服务器（运行 api_server.py）。');
      }
      throw error;
    }
  }

  // 显示处理中状态
  function showProcessing() {
    processingNotification.style.display = 'block';
    resultBox.style.display = 'block';
  }

  // 隐藏处理中状态
  function hideProcessing() {
    processingNotification.style.display = 'none';
  }

  // 显示结果
  function showResult(imageUrl) {
    resultImage.src = imageUrl;
    resultImageContainer.style.display = 'block';
    resultBox.style.display = 'block';
  }

  // 隐藏结果
  function hideResult() {
    resultImageContainer.style.display = 'none';
    resultBox.style.display = 'none';
  }

  // 显示错误
  function showError(message) {
    errorMessage.textContent = message;
    errorNotification.style.display = 'block';
    resultBox.style.display = 'block';
  }

  // 隐藏错误
  function hideError() {
    errorNotification.style.display = 'none';
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

