export const DEFAULT_MESSAGE_SKIN = 'default'

export const LIGHT_MESSAGE_SKINS = ['default', 'dawn', 'sakura', 'spring']
export const DARK_MESSAGE_SKINS = ['default', 'autumn', 'starry', 'retro']

export const MESSAGE_SKIN_META = {
  default: { label: 'Default', dotClass: 'theme-dot-default' },
  dawn: { label: 'Dawn', dotClass: 'theme-dot-dawn' },
  sakura: { label: 'Sakura', dotClass: 'theme-dot-sakura' },
  spring: { label: 'Spring', dotClass: 'theme-dot-spring' },
  autumn: { label: 'Autumn', dotClass: 'theme-dot-autumn' },
  starry: { label: 'Starry', dotClass: 'theme-dot-starry' },
  retro: { label: 'Retro', dotClass: 'theme-dot-retro' }
}

export function getAvailableMessageSkins(colorMode) {
  return colorMode === 'dark' ? DARK_MESSAGE_SKINS : LIGHT_MESSAGE_SKINS
}

export function normalizeMessageSkin(rawSkin, colorMode = 'light') {
  const skin = rawSkin || DEFAULT_MESSAGE_SKIN
  const available = getAvailableMessageSkins(colorMode)

  if (available.includes(skin)) {
    return skin
  }

  return DEFAULT_MESSAGE_SKIN
}

export function getMessageSkinClass(rawSkin) {
  return `theme-${rawSkin || DEFAULT_MESSAGE_SKIN}`
}
