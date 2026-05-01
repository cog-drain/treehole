const ADJECTIVES = ['深海', '星际', '赛博', '荒野', '幻梦', '虚空', '极光', '迷雾', '雷鸣', '永恒'];
const NOUNS = ['居民', '浪人', '访客', '幽灵', '观察者', '行者', '先驱', '诗人', '信徒', '极客'];

export function generateRandomIdentity() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${adj}${noun}_${randomId}`;
}

export function getOrGenerateIdentity() {
  let id = localStorage.getItem('treehole_alias');
  if (!id) {
    id = generateRandomIdentity();
    localStorage.setItem('treehole_alias', id);
  }
  return id;
}

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
