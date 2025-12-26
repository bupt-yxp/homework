/**
 * 点云匹配可视化工具（前端版本，适用于 GitHub Pages）
 * 使用 Plotly.js 进行 3D 可视化，无需后端服务器
 */

(function() {
  'use strict';

  // 检查是否已加载 Plotly.js
  if (typeof Plotly === 'undefined') {
    console.error('Plotly.js 未加载，请先引入 Plotly.js 库');
    return;
  }

  // DOM元素引用（延迟获取，在 init 函数中初始化）
  // 注意：pointcloudInput 已移除，现在只支持文件上传
  let fileInput = null;
  let fileName = null;
  let processBtn = null;
  let resultBox = null;
  let resultContainer = null;
  let resultImage = null;
  let resultImageContainer = null;
  let processingNotification = null;
  let errorNotification = null;
  let errorMessage = null;
  let fileUploadProgress = null;
  let overallProgress = null;
  let overallStatus = null;
  let fileStatusList = null;

  // 创建可视化容器（如果不存在）
  let plotContainer = null;

  /**
   * 初始化可视化容器
   */
  function initVisualizationContainer() {
    if (!resultContainer) return;
    
    // 检查是否已有 Plotly 容器
    plotContainer = document.getElementById('plotly-container');
    if (!plotContainer) {
      plotContainer = document.createElement('div');
      plotContainer.id = 'plotly-container';
      plotContainer.style.width = '100%';
      plotContainer.style.height = '600px';
      plotContainer.style.margin = '1rem 0';
      resultContainer.appendChild(plotContainer);
    }
  }

  /**
   * 从点云数据创建匹配对
   */
  function createMatchingPairs(sourcePoints, targetPoints) {
    const n = Math.min(sourcePoints.length, targetPoints.length);
    return Array.from({ length: n }, (_, i) => [i, i]);
  }

  /**
   * 可视化单个点云（不显示匹配）
   */
  function visualizeSinglePointCloud(points, title = '点云可视化') {
    if (!points || points.length === 0) {
      throw new Error('点云数据不能为空');
    }

    const pointArray = points.map(p => Array.isArray(p) ? p : [p.x, p.y, p.z]);
    
    // 计算点的范围
    const xs = pointArray.map(p => p[0]);
    const ys = pointArray.map(p => p[1]);
    const zs = pointArray.map(p => p[2]);
    
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const zMin = Math.min(...zs);
    const zMax = Math.max(...zs);
    
    const xRange = (xMax - xMin) || 1;
    const yRange = (yMax - yMin) || 1;
    const zRange = (zMax - zMin) || 1;
    const maxRange = Math.max(xRange, yRange, zRange);
    const margin = 0.1;
    const halfRange = (maxRange / 2) * (1 + margin);
    
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const zCenter = (zMin + zMax) / 2;
    
    // 创建单个点云的可视化
    const trace = {
      x: pointArray.map(p => p[0]),
      y: pointArray.map(p => p[1]),
      z: pointArray.map(p => p[2]),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 2,
        color: '#2E5C8A',
        opacity: 0.6
      },
      name: title
    };
    
    const layout = {
      scene: {
        xaxis: { range: [xCenter - halfRange, xCenter + halfRange] },
        yaxis: { range: [yCenter - halfRange, yCenter + halfRange] },
        zaxis: { range: [zCenter - halfRange, zCenter + halfRange] },
        aspectmode: 'cube',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      },
      margin: { l: 0, r: 0, t: 20, b: 0 },
      title: {
        text: title,
        x: 0.5,
        xanchor: 'center'
      }
    };
    
    Plotly.newPlot(plotContainer, [trace], layout, {
      responsive: true,
      displayModeBar: true
    });
  }

  /**
   * 生成匹配结果可视化（前端版本）
   * 参考 demo.py 的逻辑：区分静态和动态部件，用不同颜色显示
   */
  function generateMatchVisualizationFrontend(pointCloudData) {
    const sourcePoints = pointCloudData.source;
    const targetPoints = pointCloudData.target;
    const startComponentSizes = pointCloudData.startComponentSizes || [];
    const staticSize = pointCloudData.staticSize || 0;
    
    // 如果只有 source 没有 target，显示单个点云可视化
    if (!targetPoints || targetPoints.length === 0) {
      if (sourcePoints && sourcePoints.length > 0) {
        visualizeSinglePointCloud(sourcePoints, '点云可视化');
        return;
      } else {
        throw new Error('点云数据不能为空');
      }
    }
    
    if (!sourcePoints || sourcePoints.length === 0) {
      throw new Error('源点云数据不能为空');
    }

    // 转换为数组格式
    const source = sourcePoints.map(p => Array.isArray(p) ? p : [p.x, p.y, p.z]);
    const target = targetPoints.map(p => Array.isArray(p) ? p : [p.x, p.y, p.z]);

    // 创建匹配对（ground truth：一一对应）
    const matchedPairs = createMatchingPairs(source, target);
    
    // 按照 demo.py 的逻辑：从静态和动态部件中分别选择点
    const numVisPoints = Math.min(20, matchedPairs.length);
    const numStatic = Math.floor(numVisPoints / 2);
    const numDynamic = numVisPoints - numStatic;
    
    // 静态部件索引范围：0 到 staticSize-1
    const staticIndices = Array.from({ length: Math.min(staticSize, source.length) }, (_, i) => i);
    // 动态部件索引范围：staticSize 到 source.length-1
    const dynamicIndices = Array.from({ length: Math.min(source.length - staticSize, source.length) }, (_, i) => i + staticSize);
    
    // 随机选择静态点
    const selectedStatic = [];
    const staticIndicesCopy = [...staticIndices];
    for (let i = 0; i < numStatic && staticIndicesCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * staticIndicesCopy.length);
      selectedStatic.push(staticIndicesCopy.splice(randomIndex, 1)[0]);
    }
    
    // 随机选择动态点
    const selectedDynamic = [];
    const dynamicIndicesCopy = [...dynamicIndices];
    for (let i = 0; i < numDynamic && dynamicIndicesCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * dynamicIndicesCopy.length);
      selectedDynamic.push(dynamicIndicesCopy.splice(randomIndex, 1)[0]);
    }
    
    // 合并选中的点并打乱
    const selectedIndices = [...selectedStatic, ...selectedDynamic];
    for (let i = selectedIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedIndices[i], selectedIndices[j]] = [selectedIndices[j], selectedIndices[i]];
    }

    // 计算所有点的范围
    const allPoints = [...source, ...target];
    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);
    const zs = allPoints.map(p => p[2]);
    
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const zMin = Math.min(...zs);
    const zMax = Math.max(...zs);
    
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const zRange = zMax - zMin || 1;
    const maxRange = Math.max(xRange, yRange, zRange);
    
    // 为了清晰显示，将 target 点云向右平移
    const offset = maxRange * 1.5;
    const targetOffset = target.map(p => [p[0] + offset, p[1], p[2]]);
    
    // 准备 Plotly 数据
    const traces = [];
    
    // 源点云（半透明）
    traces.push({
      x: source.map(p => p[0]),
      y: source.map(p => p[1]),
      z: source.map(p => p[2]),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 2,
        color: '#2E5C8A',
        opacity: 0.4
      },
      name: '源点云 (Source)',
      showlegend: true
    });
    
    // 目标点云（半透明，已偏移）
    traces.push({
      x: targetOffset.map(p => p[0]),
      y: targetOffset.map(p => p[1]),
      z: targetOffset.map(p => p[2]),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 2,
        color: '#8B4513',
        opacity: 0.4
      },
      name: '目标点云 (Target)',
      showlegend: true
    });
    
    // 绘制选中的点和匹配连线（参考 demo.py：静态用蓝色，动态用红色）
    let firstStaticShown = false;
    let firstDynamicShown = false;
    
    selectedIndices.forEach((sourceIdx, idx) => {
      // 确保 sourceIdx 在匹配对中
      if (sourceIdx >= matchedPairs.length) return;
      
      const [matchedSourceIdx, targetIdx] = matchedPairs[sourceIdx];
      const startPt = source[matchedSourceIdx];
      const endPt = targetOffset[targetIdx];
      
      // 根据是静态还是动态选择颜色和标记（参考 demo.py）
      const isStatic = matchedSourceIdx < staticSize;
      const color = isStatic ? 'blue' : 'red';
      const marker = isStatic ? 'circle' : 'square';
      const label = isStatic ? (firstStaticShown ? '' : '静态匹配点') : (firstDynamicShown ? '' : '动态匹配点');
      
      if (isStatic) firstStaticShown = true;
      else firstDynamicShown = true;
      
      // 源点
      traces.push({
        x: [startPt[0]],
        y: [startPt[1]],
        z: [startPt[2]],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 6,
          color: color,
          symbol: marker,
          line: { color: 'black', width: 1 }
        },
        name: label,
        showlegend: label !== ''
      });
      
      // 目标点
      traces.push({
        x: [endPt[0]],
        y: [endPt[1]],
        z: [endPt[2]],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 6,
          color: color,
          symbol: marker,
          line: { color: 'black', width: 1 }
        },
        name: '',
        showlegend: false
      });
      
      // 连线
      traces.push({
        x: [startPt[0], endPt[0]],
        y: [startPt[1], endPt[1]],
        z: [startPt[2], endPt[2]],
        mode: 'lines',
        type: 'scatter3d',
        line: {
          color: color,
          width: 2,
          dash: 'dash'
        },
        name: '',
        showlegend: false
      });
    });
    
    // 计算布局范围
    const allPointsOffset = [...source, ...targetOffset];
    const xs2 = allPointsOffset.map(p => p[0]);
    const ys2 = allPointsOffset.map(p => p[1]);
    const zs2 = allPointsOffset.map(p => p[2]);
    
    const xMin2 = Math.min(...xs2);
    const xMax2 = Math.max(...xs2);
    const yMin2 = Math.min(...ys2);
    const yMax2 = Math.max(...ys2);
    const zMin2 = Math.min(...zs2);
    const zMax2 = Math.max(...zs2);
    
    const margin = 0.1;
    const xRange2 = (xMax2 - xMin2) || 1;
    const yRange2 = (yMax2 - yMin2) || 1;
    const zRange2 = (zMax2 - zMin2) || 1;
    const maxRange2 = Math.max(xRange2, yRange2, zRange2);
    const halfRange = (maxRange2 / 2) * (1 + margin);
    
    const xCenter = (xMin2 + xMax2) / 2;
    const yCenter = (yMin2 + yMax2) / 2;
    const zCenter = (zMin2 + zMax2) / 2;
    
    // 布局配置
    const layout = {
      scene: {
        xaxis: { range: [xCenter - halfRange, xCenter + halfRange] },
        yaxis: { range: [yCenter - halfRange, yCenter + halfRange] },
        zaxis: { range: [zCenter - halfRange, zCenter + halfRange] },
        aspectmode: 'cube',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      },
      margin: { l: 0, r: 0, t: 20, b: 0 },
      legend: { x: 0.02, y: 0.98 }
    };
    
    // 绘制图形
    Plotly.newPlot(plotContainer, traces, layout, {
      responsive: true,
      displayModeBar: true
    });
    
    return true;
  }

  /**
   * 处理点云数据（已废弃，现在通过文件上传自动处理）
   */
  async function handleProcess() {
    if (errorMessage) {
      errorMessage.textContent = '请通过上传 PLY 文件来生成可视化。文件上传后会自动处理。';
    }
    if (errorNotification) {
      errorNotification.style.display = 'block';
    }
    if (resultBox) {
      resultBox.style.display = 'block';
    }
  }

  /**
   * 更新文件状态显示
   */
  function updateFileStatus(fileIndex, fileName, status, message, pointCount = 0, pointType = '') {
    // 如果元素不存在，尝试重新获取
    let statusList = fileStatusList || document.getElementById('file-status-list');
    if (!statusList) {
      console.warn('fileStatusList 未找到，无法更新文件状态');
      return;
    }
    
    let statusItem = document.getElementById(`file-status-${fileIndex}`);
    if (!statusItem) {
      statusItem = document.createElement('div');
      statusItem.id = `file-status-${fileIndex}`;
      statusItem.className = 'file-status-item';
      statusItem.style.cssText = 'padding: 0.5rem; margin-bottom: 0.5rem; border-left: 3px solid #ddd; background: #f9f9f9; border-radius: 4px;';
      statusList.appendChild(statusItem);
    }
    
    let icon = '';
    let color = '#666';
    let bgColor = '#f9f9f9';
    let borderColor = '#ddd';
    
    switch(status) {
      case 'waiting':
        icon = '<i class="fas fa-clock"></i>';
        color = '#666';
        break;
      case 'processing':
        icon = '<i class="fas fa-spinner fa-spin"></i>';
        color = '#3273dc';
        borderColor = '#3273dc';
        bgColor = '#e8f4f8';
        break;
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        color = '#23d160';
        borderColor = '#23d160';
        bgColor = '#e8f5e9';
        break;
      case 'error':
        icon = '<i class="fas fa-times-circle"></i>';
        color = '#ff3860';
        borderColor = '#ff3860';
        bgColor = '#ffeef1';
        break;
    }
    
    let pointInfo = '';
    if (pointCount > 0) {
      pointInfo = ` <span style="color: #666; font-size: 0.85em;">(${pointCount} ${pointType}点)</span>`;
    }
    
    statusItem.style.borderLeftColor = borderColor;
    statusItem.style.backgroundColor = bgColor;
    statusItem.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="color: ${color}; margin-right: 0.5rem;">${icon}</span>
          <span style="font-weight: 500;">${fileName}</span>
          ${pointInfo}
        </div>
        <div style="color: ${color}; font-size: 0.9em;">${message}</div>
      </div>
    `;
  }

  /**
   * 更新整体进度
   */
  function updateOverallProgress(current, total, message) {
    // 重新获取元素以确保存在
    const prog = overallProgress || document.getElementById('overall-progress');
    const stat = overallStatus || document.getElementById('overall-status');
    
    if (prog) {
      const percent = Math.round((current / total) * 100);
      prog.value = percent;
      prog.textContent = `${percent}%`;
    } else {
      console.warn('overall-progress 元素未找到');
    }
    
    if (stat) {
      stat.textContent = message;
    } else {
      console.warn('overall-status 元素未找到');
    }
  }

  /**
   * 识别文件类型
   */
  function identifyFileType(fileName) {
    const name = fileName.toLowerCase();
    if (name.includes('static')) {
      return { type: 'source', label: '静态点云 (Static)' };
    } else if (name.includes('start') || name.includes('laptop_10211')) {
      return { type: 'source', label: '起始动态点云 (Start Dynamic)' };
    } else if (name.includes('end')) {
      return { type: 'target', label: '结束动态点云 (End Dynamic)' };
    }
    return { type: 'unknown', label: '未知类型' };
  }

  /**
   * 处理文件选择（仅支持 PLY 文件）
   */
  async function handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      if (fileName) {
        fileName.textContent = '未选择文件';
      }
      if (fileUploadProgress) {
        fileUploadProgress.style.display = 'none';
      }
      return;
    }
    
    // 验证文件类型 - 只允许 PLY 文件
    const invalidFiles = Array.from(files).filter(file => !file.name.toLowerCase().endsWith('.ply'));
    if (invalidFiles.length > 0) {
      showError(`只能上传 PLY 文件！检测到非 PLY 文件：${invalidFiles.map(f => f.name).join(', ')}`);
      // 清空文件选择
      if (fileInput) {
        fileInput.value = '';
      }
      return;
    }
    
    // 支持多文件选择（最多3个：static, start_dynamic, end_dynamic）
    if (files.length > 3) {
      showError('最多只能选择3个文件');
      return;
    }
    
    hideError();
    showProcessing();
    
    // 显示进度区域
    if (fileUploadProgress) {
      fileUploadProgress.style.display = 'block';
    } else {
      console.warn('fileUploadProgress 元素未找到');
    }
    if (fileStatusList) {
      fileStatusList.innerHTML = '';
    } else {
      console.warn('fileStatusList 元素未找到');
    }
    
    // 确保所有必要的元素都存在
    if (!fileUploadProgress || !overallProgress || !overallStatus || !fileStatusList) {
      console.error('进度显示元素缺失，无法显示上传进度');
      // 即使元素缺失，也继续处理文件
    }
    
    // 初始化所有文件状态为等待
    for (let i = 0; i < files.length; i++) {
      const fileType = identifyFileType(files[i].name);
      updateFileStatus(i, files[i].name, 'waiting', '等待处理...', 0, fileType.label);
    }
    updateOverallProgress(0, files.length + 1, '准备处理文件...'); // +1 for visualization step
    
    try {
      // 按照 demo.py 的逻辑：分别收集 static、start_dynamic、end_dynamic 文件
      let staticPoints = [];
      let startDynamicPoints = [];
      let endDynamicPoints = [];
      let processedCount = 0;
      let successCount = 0;
      
      // 第一遍：解析所有文件并分类
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileNameLower = file.name.toLowerCase();
        const isPLY = fileNameLower.endsWith('.ply');
        const fileType = identifyFileType(file.name);
        
        // 更新状态为处理中
        updateFileStatus(i, file.name, 'processing', '正在解析...', 0, fileType.label);
        updateOverallProgress(processedCount, files.length + 1, `正在处理文件 ${i + 1}/${files.length}...`);
        
        try {
          // 只处理 PLY 文件
          if (!isPLY) {
            throw new Error('只支持 PLY 文件格式');
          }
          
          // 解析 PLY 文件
          if (typeof PLYParser === 'undefined') {
            throw new Error('PLY 解析器未加载，请刷新页面重试');
          }
          
          const points = await PLYParser.loadFile(file);
          
          // 根据文件名分类：static、start_dynamic、end_dynamic
          if (fileNameLower.includes('static')) {
            staticPoints = staticPoints.concat(points);
            updateFileStatus(i, file.name, 'success', '已识别为静态点云', points.length, '静态');
          } else if (fileNameLower.includes('start') || fileNameLower.includes('laptop_10211')) {
            startDynamicPoints = startDynamicPoints.concat(points);
            updateFileStatus(i, file.name, 'success', '已识别为起始动态点云', points.length, '起始动态');
          } else if (fileNameLower.includes('end')) {
            endDynamicPoints = endDynamicPoints.concat(points);
            updateFileStatus(i, file.name, 'success', '已识别为结束动态点云', points.length, '结束动态');
          } else {
            // 无法识别的文件，根据位置推断
            if (i === 0) {
              staticPoints = staticPoints.concat(points);
              updateFileStatus(i, file.name, 'success', '已识别为静态点云（默认）', points.length, '静态');
            } else {
              // 如果已经有 static，后续文件可能是 dynamic
              if (staticPoints.length > 0 && startDynamicPoints.length === 0) {
                startDynamicPoints = startDynamicPoints.concat(points);
                updateFileStatus(i, file.name, 'success', '已识别为起始动态点云（默认）', points.length, '起始动态');
              } else {
                endDynamicPoints = endDynamicPoints.concat(points);
                updateFileStatus(i, file.name, 'success', '已识别为结束动态点云（默认）', points.length, '结束动态');
              }
            }
          }
          
          successCount++;
        } catch (fileError) {
          console.error(`处理文件 ${file.name} 失败:`, fileError);
          updateFileStatus(i, file.name, 'error', `处理失败: ${fileError.message}`, 0, '');
        }
        
        processedCount++;
        updateOverallProgress(processedCount, files.length + 1, `已处理 ${processedCount}/${files.length} 个文件...`);
      }
      
      // 按照 demo.py 的逻辑合并点云：
      // pc_start = static + start_dynamic
      // pc_end = static + end_dynamic
      const sourcePoints = staticPoints.concat(startDynamicPoints);
      const targetPoints = staticPoints.concat(endDynamicPoints);
      
      // 记录组件大小（用于可视化时区分静态和动态部件）
      const startComponentSizes = [
        staticPoints.length,  // 静态部件大小
        ...(startDynamicPoints.length > 0 ? [startDynamicPoints.length] : [])
      ];
      
      if (sourcePoints.length === 0) {
        throw new Error('未能从 PLY 文件中提取点云数据，请检查文件格式');
      }
      
      // 更新文件名显示
      if (fileName) {
        if (targetPoints.length === 0) {
          fileName.textContent = `${files.length} 个文件已选择 (静态: ${staticPoints.length}, 起始动态: ${startDynamicPoints.length}, 总计: ${sourcePoints.length} 点)`;
        } else {
          fileName.textContent = `${files.length} 个文件已选择 (源点云: ${sourcePoints.length} = 静态${staticPoints.length} + 起始动态${startDynamicPoints.length}, 目标点云: ${targetPoints.length} = 静态${staticPoints.length} + 结束动态${endDynamicPoints.length})`;
        }
      }
      
      // 准备点云数据（包含组件大小信息，用于可视化时区分静态和动态部件）
      const pointCloudData = {
        source: sourcePoints,
        target: targetPoints,
        startComponentSizes: startComponentSizes,  // [static_size, dynamic_size1, dynamic_size2, ...]
        staticSize: staticPoints.length
      };
      
      // 生成可视化
      updateOverallProgress(files.length, files.length + 1, '正在生成可视化...');
      if (!plotContainer) {
        initVisualizationContainer();
      }
      
      try {
        generateMatchVisualizationFrontend(pointCloudData);
        showResult();
        hideError();
        updateOverallProgress(files.length + 1, files.length + 1, `✅ 完成！成功处理 ${successCount}/${files.length} 个文件，可视化已生成`);
        
        // 添加可视化成功提示
        const statusListForViz = document.getElementById('file-status-list');
        if (statusListForViz) {
          const vizStatusItem = document.createElement('div');
          vizStatusItem.className = 'file-status-item';
          vizStatusItem.style.cssText = 'padding: 0.5rem; margin-top: 0.5rem; border-left: 3px solid #23d160; background: #e8f5e9; border-radius: 4px;';
          vizStatusItem.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="color: #23d160; margin-right: 0.5rem;"><i class="fas fa-check-circle"></i></span>
                <span style="font-weight: 500;">可视化生成</span>
              </div>
              <div style="color: #23d160; font-size: 0.9em;">成功</div>
            </div>
          `;
          statusListForViz.appendChild(vizStatusItem);
        }
      } catch (vizError) {
        console.error('生成可视化失败:', vizError);
        updateOverallProgress(files.length + 1, files.length + 1, `⚠️ 文件处理完成，但可视化生成失败`);
        
        // 添加可视化失败提示
        const statusListForError = document.getElementById('file-status-list');
        if (statusListForError) {
          const vizStatusItem = document.createElement('div');
          vizStatusItem.className = 'file-status-item';
          vizStatusItem.style.cssText = 'padding: 0.5rem; margin-top: 0.5rem; border-left: 3px solid #ff3860; background: #ffeef1; border-radius: 4px;';
          vizStatusItem.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="color: #ff3860; margin-right: 0.5rem;"><i class="fas fa-times-circle"></i></span>
                <span style="font-weight: 500;">可视化生成</span>
              </div>
              <div style="color: #ff3860; font-size: 0.9em;">失败: ${vizError.message}</div>
            </div>
          `;
          statusListForError.appendChild(vizStatusItem);
        }
        showError('文件加载成功，但可视化生成失败: ' + vizError.message);
      }
      
    } catch (error) {
      console.error('处理文件失败:', error);
      showError('处理文件失败: ' + error.message);
      if (overallStatus) {
        overallStatus.textContent = `❌ 处理失败: ${error.message}`;
      }
    } finally {
      hideProcessing();
    }
  }

  /**
   * 显示处理中状态
   */
  function showProcessing() {
    if (processingNotification) {
      processingNotification.style.display = 'block';
    }
    if (resultBox) {
      resultBox.style.display = 'block';
    }
  }

  /**
   * 隐藏处理中状态
   */
  function hideProcessing() {
    if (processingNotification) {
      processingNotification.style.display = 'none';
    }
  }

  /**
   * 显示结果
   */
  function showResult() {
    if (plotContainer) {
      plotContainer.style.display = 'block';
    }
    if (resultImageContainer) {
      resultImageContainer.style.display = 'none'; // 隐藏图片容器，显示 Plotly
    }
    if (resultBox) {
      resultBox.style.display = 'block';
    }
  }

  /**
   * 隐藏结果
   */
  function hideResult() {
    if (plotContainer) {
      plotContainer.style.display = 'none';
    }
    if (resultBox) {
      resultBox.style.display = 'none';
    }
  }

  /**
   * 显示错误
   */
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    if (errorNotification) {
      errorNotification.style.display = 'block';
    }
    if (resultBox) {
      resultBox.style.display = 'block';
    }
  }

  /**
   * 隐藏错误
   */
  function hideError() {
    if (errorNotification) {
      errorNotification.style.display = 'none';
    }
  }

  /**
   * 初始化 DOM 元素引用
   */
  function initDOMElements() {
    // pointcloudInput 已移除，现在只支持文件上传
    fileInput = document.getElementById('pointcloud-file-input');
    fileName = document.getElementById('file-name');
    processBtn = document.getElementById('process-pointcloud-btn');
    resultBox = document.getElementById('result-display-box');
    resultContainer = document.getElementById('result-display-container');
    resultImage = document.getElementById('result-image');
    resultImageContainer = document.getElementById('result-image-container');
    processingNotification = document.getElementById('processing-notification');
    errorNotification = document.getElementById('error-notification');
    errorMessage = document.getElementById('error-message');
    fileUploadProgress = document.getElementById('file-upload-progress');
    overallProgress = document.getElementById('overall-progress');
    overallStatus = document.getElementById('overall-status');
    fileStatusList = document.getElementById('file-status-list');
  }

  /**
   * 初始化
   */
  function init() {
    // 初始化 DOM 元素引用
    initDOMElements();
    
    // 现在只需要 fileInput，不再需要 pointcloudInput
    if (!fileInput) {
      console.warn('点云可视化组件未找到，跳过初始化', {
        fileInput: !!fileInput,
        fileName: !!fileName
      });
      return;
    }
    
    initVisualizationContainer();
    
    // 绑定文件上传事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 如果存在处理按钮，绑定事件（虽然现在主要是自动处理）
    if (processBtn) {
      processBtn.addEventListener('click', handleProcess);
    }
    
    console.log('点云可视化组件初始化成功（仅支持 PLY 文件上传）');
  }

  // 页面加载完成后初始化 - 使用更可靠的方式
  function tryInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
      // DOM 已加载，但可能元素还没渲染，延迟一点执行
      setTimeout(init, 100);
    } else {
      init();
    }
  }
  
  tryInit();
  
  // 如果第一次初始化失败，在 window.load 时再试一次
  window.addEventListener('load', function() {
    const fileInputEl = document.getElementById('pointcloud-file-input');
    
    if (fileInputEl && !fileInputEl.hasAttribute('data-initialized')) {
      console.log('在 window.load 时重新初始化点云可视化组件');
      fileInputEl.setAttribute('data-initialized', 'true');
      init();
    }
  });
})();

