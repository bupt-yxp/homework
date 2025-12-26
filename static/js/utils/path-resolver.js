/**
 * 路径解析工具
 * 统一处理相对路径和绝对路径的解析，避免代码重复
 * 
 * 使用方法：
 * PathResolver.resolve(dataPath) - 解析相对/绝对路径
 * PathResolver.getBasePath() - 获取基础路径（用于资源引用）
 */

const PathResolver = {
  /**
   * 获取基础路径（用于资源引用）
   * 根据当前页面路径判断是在根目录还是子目录
   * @returns {string} 基础路径（'./' 或 '../../'）
   */
  getBasePath() {
    const currentPath = window.location.pathname;
    
    // 使用 homeworkList 动态检测是否在子目录中
    if (typeof homeworkList !== 'undefined') {
      for (const homework of homeworkList) {
        // 从 URL 中提取路径部分进行匹配（去掉 ./ 前缀）
        const urlPath = homework.url.replace('./', '');
        if (currentPath.includes(urlPath)) {
          // 如果在子目录中，使用 ../../
          return '../../';
        }
      }
    }
    
    // 如果在根目录，使用 ./
    return './';
  },

  /**
   * 解析路径，支持相对路径和绝对路径
   * @param {string} dataPath - 文件路径（相对于当前HTML文件）
   * @returns {string} 解析后的路径
   */
  resolve(dataPath) {
    // 如果已经是绝对路径（以 / 开头），直接返回
    if (dataPath.startsWith('/')) {
      return dataPath;
    }
    
    // 获取当前页面的URL路径
    const currentPath = window.location.pathname;
    
    // 计算当前HTML文件所在的目录
    const htmlDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    // 处理相对路径
    if (dataPath.startsWith('./')) {
      // 相对于当前HTML文件
      const relativePath = dataPath.substring(2);
      const resolvedPath = htmlDir + '/' + relativePath;
      return resolvedPath;
    } else if (dataPath.startsWith('../')) {
      // 相对于当前HTML文件的父目录
      let path = htmlDir;
      let relativePath = dataPath;
      
      while (relativePath.startsWith('../')) {
        path = path.substring(0, path.lastIndexOf('/'));
        relativePath = relativePath.substring(3);
      }
      
      return path + '/' + relativePath;
    } else {
      // 相对于当前HTML文件所在目录
      return htmlDir + '/' + dataPath;
    }
  }
};

