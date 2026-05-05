/**
 * 格式化时间为：YYYY.MM.DD HH:mm
 * @param {string|number|Date} t 
 * @returns {string}
 */
export function formatTime(t) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d.getTime())) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
