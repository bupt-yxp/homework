/**
 * PLY 文件解析器
 * 用于在前端解析 PLY 格式的点云文件
 * 支持 ASCII 和二进制格式
 */

(function() {
  'use strict';

  /**
   * 解析 PLY 文件头部（从文本或二进制数据）
   * @param {string|ArrayBuffer} data - PLY 文件数据
   * @returns {Object} 头部信息 {format, vertexCount, properties, headerEnd, headerText}
   */
  function parsePLYHeader(data) {
    let headerText = '';
    let headerBytes = 0;
    
    if (data instanceof ArrayBuffer) {
      // 二进制文件：读取头部文本部分
      const uint8Array = new Uint8Array(data);
      const textDecoder = new TextDecoder('utf-8');
      let headerEndPos = -1;
      
      // 查找 "end_header\n" 的位置
      const endHeaderMarker = new TextEncoder().encode('end_header\n');
      for (let i = 0; i < uint8Array.length - endHeaderMarker.length; i++) {
        let match = true;
        for (let j = 0; j < endHeaderMarker.length; j++) {
          if (uint8Array[i + j] !== endHeaderMarker[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          headerEndPos = i + endHeaderMarker.length;
          break;
        }
      }
      
      if (headerEndPos === -1) {
        // 尝试查找 "end_header\r\n"
        const endHeaderMarker2 = new TextEncoder().encode('end_header\r\n');
        for (let i = 0; i < uint8Array.length - endHeaderMarker2.length; i++) {
          let match = true;
          for (let j = 0; j < endHeaderMarker2.length; j++) {
            if (uint8Array[i + j] !== endHeaderMarker2[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            headerEndPos = i + endHeaderMarker2.length;
            break;
          }
        }
      }
      
      if (headerEndPos === -1) {
        throw new Error('PLY 文件格式错误：未找到 end_header');
      }
      
      headerText = textDecoder.decode(uint8Array.slice(0, headerEndPos));
      headerBytes = headerEndPos;
    } else {
      // ASCII 文件
      headerText = data;
    }
    
    const lines = headerText.split(/\r?\n/);
    let format = 'ascii';
    let vertexCount = 0;
    let properties = [];
    let headerEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('format')) {
        const parts = line.split(/\s+/);
        format = parts[1];
      } else if (line.startsWith('element vertex')) {
        const parts = line.split(/\s+/);
        vertexCount = parseInt(parts[2], 10);
      } else if (line.startsWith('property')) {
        const parts = line.split(/\s+/);
        if (parts[1] === 'float' || parts[1] === 'double' || parts[1] === 'uchar' || parts[1] === 'uint8') {
          properties.push({
            type: parts[1],
            name: parts[2]
          });
        }
      } else if (line === 'end_header') {
        headerEnd = i;
        break;
      }
    }
    
    if (headerEnd === -1) {
      throw new Error('PLY 文件格式错误：未找到 end_header');
    }
    
    return { format, vertexCount, properties, headerEnd, headerText, headerBytes };
  }

  /**
   * 解析 ASCII 格式的 PLY 文件
   * @param {string} text - PLY 文件的文本内容
   * @param {Object} headerInfo - 头部信息
   * @returns {Array<Array<number>>} 点云数组
   */
  function parseASCIIPLY(text, headerInfo) {
    const { vertexCount, properties } = headerInfo;
    const lines = text.split(/\r?\n/);
    const headerEnd = headerInfo.headerEnd;
    
    // 查找 x, y, z 属性的索引
    const xIndex = properties.findIndex(p => p.name === 'x');
    const yIndex = properties.findIndex(p => p.name === 'y');
    const zIndex = properties.findIndex(p => p.name === 'z');
    
    if (xIndex === -1 || yIndex === -1 || zIndex === -1) {
      throw new Error('PLY 文件缺少 x, y, z 属性');
    }
    
    const points = [];
    const dataStart = headerEnd + 1;
    
    for (let i = dataStart; i < lines.length && points.length < vertexCount; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(/\s+/).filter(v => v.length > 0);
      if (values.length < properties.length) continue;
      
      const x = parseFloat(values[xIndex]);
      const y = parseFloat(values[yIndex]);
      const z = parseFloat(values[zIndex]);
      
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        points.push([x, y, z]);
      }
    }
    
    return points;
  }

  /**
   * 解析二进制格式的 PLY 文件
   * @param {ArrayBuffer} buffer - PLY 文件的二进制数据
   * @param {Object} headerInfo - 头部信息
   * @returns {Array<Array<number>>} 点云数组
   */
  function parseBinaryPLY(buffer, headerInfo) {
    const { format, vertexCount, properties, headerBytes } = headerInfo;
    const isLittleEndian = format === 'binary_little_endian';
    
    // 查找 x, y, z 属性的索引和类型
    const xIndex = properties.findIndex(p => p.name === 'x');
    const yIndex = properties.findIndex(p => p.name === 'y');
    const zIndex = properties.findIndex(p => p.name === 'z');
    
    if (xIndex === -1 || yIndex === -1 || zIndex === -1) {
      throw new Error('PLY 文件缺少 x, y, z 属性');
    }
    
    const dataView = new DataView(buffer, headerBytes);
    const points = [];
    
    // 计算每个顶点的字节大小
    let vertexSize = 0;
    for (const prop of properties) {
      if (prop.type === 'float') {
        vertexSize += 4;
      } else if (prop.type === 'double') {
        vertexSize += 8;
      } else if (prop.type === 'uchar' || prop.type === 'uint8') {
        vertexSize += 1;
      } else if (prop.type === 'int') {
        vertexSize += 4;
      } else if (prop.type === 'uint') {
        vertexSize += 4;
      }
    }
    
    let offset = 0;
    for (let i = 0; i < vertexCount; i++) {
      let x = 0, y = 0, z = 0;
      let currentOffset = offset;
      
      // 读取 x, y, z 值
      for (let j = 0; j < properties.length; j++) {
        const prop = properties[j];
        let value = 0;
        
        if (prop.type === 'float') {
          value = dataView.getFloat32(currentOffset, isLittleEndian);
          currentOffset += 4;
        } else if (prop.type === 'double') {
          value = dataView.getFloat64(currentOffset, isLittleEndian);
          currentOffset += 8;
        } else if (prop.type === 'uchar' || prop.type === 'uint8') {
          value = dataView.getUint8(currentOffset);
          currentOffset += 1;
        } else if (prop.type === 'int') {
          value = dataView.getInt32(currentOffset, isLittleEndian);
          currentOffset += 4;
        } else if (prop.type === 'uint') {
          value = dataView.getUint32(currentOffset, isLittleEndian);
          currentOffset += 4;
        }
        
        if (j === xIndex) x = value;
        else if (j === yIndex) y = value;
        else if (j === zIndex) z = value;
      }
      
      points.push([x, y, z]);
      offset += vertexSize;
    }
    
    return points;
  }

  /**
   * 解析 PLY 文件内容
   * @param {string|ArrayBuffer} data - PLY 文件数据
   * @returns {Array<Array<number>>} 点云数组，每个点为 [x, y, z]
   */
  function parsePLY(data) {
    const headerInfo = parsePLYHeader(data);
    
    if (headerInfo.format === 'ascii') {
      return parseASCIIPLY(data, headerInfo);
    } else if (headerInfo.format === 'binary_little_endian' || headerInfo.format === 'binary_big_endian') {
      if (!(data instanceof ArrayBuffer)) {
        throw new Error('二进制 PLY 文件需要使用 ArrayBuffer 格式');
      }
      return parseBinaryPLY(data, headerInfo);
    } else {
      throw new Error(`不支持的 PLY 格式: ${headerInfo.format}`);
    }
  }

  /**
   * 从文件读取并解析 PLY
   * @param {File} file - PLY 文件对象
   * @returns {Promise<Array<Array<number>>>} 点云数组
   */
  function loadPLYFile(file) {
    return new Promise((resolve, reject) => {
      // 先读取文件头部来确定格式
      const headerReader = new FileReader();
      const headerSize = 1024; // 读取前 1KB 应该足够包含头部
      
      headerReader.onload = function(e) {
        try {
          const headerText = e.target.result;
          const headerInfo = parsePLYHeader(headerText);
          
          if (headerInfo.format === 'ascii') {
            // ASCII 格式：读取整个文件为文本
            const textReader = new FileReader();
            textReader.onload = function(e2) {
              try {
                const points = parsePLY(e2.target.result);
                resolve(points);
              } catch (error) {
                reject(error);
              }
            };
            textReader.onerror = () => reject(new Error('文件读取失败'));
            textReader.readAsText(file);
          } else {
            // 二进制格式：读取整个文件为 ArrayBuffer
            const binaryReader = new FileReader();
            binaryReader.onload = function(e2) {
              try {
                const points = parsePLY(e2.target.result);
                resolve(points);
              } catch (error) {
                reject(error);
              }
            };
            binaryReader.onerror = () => reject(new Error('文件读取失败'));
            binaryReader.readAsArrayBuffer(file);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      headerReader.onerror = function() {
        reject(new Error('文件读取失败'));
      };
      
      // 读取文件的前一部分来确定格式
      const blob = file.slice(0, headerSize);
      headerReader.readAsText(blob);
    });
  }

  // 导出到全局
  window.PLYParser = {
    parse: parsePLY,
    loadFile: loadPLYFile
  };
})();

