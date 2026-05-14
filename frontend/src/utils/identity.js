import { generateRandomAlias, getOrCreateAlias } from '@/utils/clientIdentity'

export function generateRandomIdentity() {
  return generateRandomAlias()
}

export function getOrGenerateIdentity() {
  return getOrCreateAlias()
}

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
