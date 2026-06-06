export interface ArrangementType {
  id: string
  label: string
  examples: string[]
}

export const GENERIC_ARRANGEMENT_TYPES: ArrangementType[] = [
  { id: 'spicy', label: '辛くする', examples: ['ラー油', '七味', 'コチュジャン'] },
  { id: 'light', label: 'さっぱりさせる', examples: ['大根おろし', 'ポン酢', 'レモン'] },
  { id: 'rich', label: 'こってりさせる', examples: ['チーズ', 'マヨ', 'バター'] },
  { id: 'egg', label: '卵を足す', examples: ['温玉', '卵とじ', '目玉焼き'] },
  { id: 'staple', label: '主食化する', examples: ['丼', '炒飯', '焼きそば', 'パスタ'] },
  { id: 'veg', label: '野菜を足す', examples: ['キャベツ', '玉ねぎ', 'もやし', 'きのこ'] },
  { id: 'sauce', label: 'たれを変える', examples: ['甘酢', '味噌だれ', 'ねぎだれ'] },
]
