import type { StoreItem } from '@/types'

export const STORE_ITEMS = [
    {
        id: 'lain_intro',
        name: '《玲音》接入仪式',
        description: '还原 PROTOCOL 7 接入 WIRED 的视觉盛宴',
        cost: 50,
        preview: '/img/lain_preview.jpg',
        toggleEvent: 'toggle-lain'
    },
    {
        id: 'p5_effect',
        name: '《P5R》预告信发布动效',
        description: '点击发射！让你的秘密像预告信一样一击穿梭星空',
        cost: 80,
        preview: '/img/p5_preview.jpg',
        toggleEvent: 'toggle-p5'
    },
    {
        id: 'p5_all_out_attack',
        name: '《P5R》总攻击：共鸣达成',
        description: '华丽终结！当你的留言获得极高共鸣时触发全屏结算',
        cost: 150,
        preview: '/img/p5_aoa_preview.jpg',
        toggleEvent: 'toggle-p5-aoa'
    },
    {
        id: 'alter_ego',
        name: 'AI 疗愈师：Alter Ego',
        description: '希望的继承者！自动分析树洞情绪，为您提供 AI 情感支持',
        cost: 200,
        preview: '/img/alter_ego_preview.jpg',
        toggleEvent: 'toggle-alter-ego'
    },
    {
        id: 'camo_effect',
        name: '《攻壳机动队》光学迷彩',
        description: '装备后，你发布的留言会自带光学扭曲和故障闪烁，让你在树洞中显得更加神秘。',
        cost: 100,
        preview: '',
        toggleEvent: 'toggle-camo'
    }
] as const satisfies readonly StoreItem[]

export function getStoreItemToggleEvent(id: string): string {
    return STORE_ITEMS.find(item => item.id === id)?.toggleEvent || ''
}
