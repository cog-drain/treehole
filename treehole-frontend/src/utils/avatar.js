import multiavatar from '@multiavatar/multiavatar';

/**
 * 在本地浏览器中使用 Multiavatar 算法生成唯一头像
 * @param {string} seed 种子字符串
 * @returns {string} Data URI 格式的图片地址
 */
export function generateDiceBearAvatar(seed) {
  // 生成原始 SVG 字符串
  const svgCode = multiavatar(seed || '匿名');
  
  // 转换为 Base64 格式的 Data URI
  const base64 = btoa(unescape(encodeURIComponent(svgCode)));
  return `data:image/svg+xml;base64,${base64}`;
}
