export const DEFAULT_MESSAGE_SKIN = 'default'

export const MESSAGE_SKIN_IDS = ['default', 'skin1', 'skin2', 'skin3']

export const LEGACY_SKIN_TO_ID = {
  default: 'default',
  dawn: 'skin1',
  autumn: 'skin1',
  sakura: 'skin2',
  starry: 'skin2',
  spring: 'skin3',
  retro: 'skin3'
}

export const MESSAGE_SKIN_META = {
  default: {
    label: 'Porcelain',
    dotClass: 'theme-dot-default',
    lightClass: 'theme-default-light',
    darkClass: 'theme-default-dark'
  },
  skin1: {
    label: 'Solstice',
    dotClass: 'theme-dot-skin1',
    lightClass: 'theme-skin1-light',
    darkClass: 'theme-skin1-dark'
  },
  skin2: {
    label: 'Velvet',
    dotClass: 'theme-dot-skin2',
    lightClass: 'theme-skin2-light',
    darkClass: 'theme-skin2-dark'
  },
  skin3: {
    label: 'Verdant',
    dotClass: 'theme-dot-skin3',
    lightClass: 'theme-skin3-light',
    darkClass: 'theme-skin3-dark'
  }
}

export function normalizeMessageSkin(rawSkin) {
  const normalized = LEGACY_SKIN_TO_ID[rawSkin] || rawSkin || DEFAULT_MESSAGE_SKIN
  return MESSAGE_SKIN_IDS.includes(normalized) ? normalized : DEFAULT_MESSAGE_SKIN
}

export function getAvailableMessageSkins() {
  return MESSAGE_SKIN_IDS
}

export function getSkinVisual(colorMode, rawSkin) {
  const skinId = normalizeMessageSkin(rawSkin)
  const meta = MESSAGE_SKIN_META[skinId] || MESSAGE_SKIN_META[DEFAULT_MESSAGE_SKIN]
  const variant = colorMode === 'dark' ? meta.darkClass : meta.lightClass

  return {
    id: skinId,
    variantClass: variant,
    dotClass: meta.dotClass,
    label: meta.label
  }
}

export function getMessageSkinClass(colorMode, rawSkin) {
  return getSkinVisual(colorMode, rawSkin).variantClass
}
