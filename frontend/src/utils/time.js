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

export function formatRelativeTime(time) {
  if (!time) return ''
  const diff = Math.floor((new Date() - new Date(time)) / 1000)
  if (diff < 60) return 'NOW'
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`
  return `${Math.floor(diff / 86400)}D AGO`
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
