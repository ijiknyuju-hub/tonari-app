'use client'

import { Dish, Recommendation } from '@/lib/recommend'
import {
  WISH_LIST_CHANGE_EVENT,
  addToWishList,
  getWishList,
} from '@/lib/storage'
import { useState, useSyncExternalStore } from 'react'

type Props = {
  selected: Dish[]
  recommendations: Recommendation[]
  onBack: () => void
}

export default function RecommendCards({
  selected,
  recommendations,
  onBack,
}: Props) {
  const added = useSyncExternalStore(
    subscribeToWishList,
    getWishListSnapshot,
    getEmptyWishListSnapshot
  )
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null)

  function handleAdd(rec: Recommendation) {
    addToWishList(rec.dish.id, rec.dish.name)
    window.dispatchEvent(new Event(WISH_LIST_CHANGE_EVENT))
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm px-5 py-4">
        <p className="text-xs font-bold text-[#6B8F5E] mb-1">
          今日のレパートリー拡張
        </p>
        <p className="text-sm text-gray-500 mb-1 leading-relaxed">
          {selected.map((d) => d.name).join('・')} が作れるなら…
        </p>
        <h1 className="text-2xl font-black text-gray-900">
          今週試したいのはこれ！
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          気になったカードを開くと、目安の材料と作り方メモが見られます
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-16 px-5 rounded-3xl bg-white border border-orange-100 text-gray-500">
          <p className="text-5xl mb-4">😅</p>
          <p>おすすめが見つかりませんでした</p>
          <p className="text-sm mt-2">別の組み合わせを試してみてください</p>
          <button
            onClick={onBack}
            className="mt-5 px-6 py-3 bg-[#FF6B35] text-white rounded-2xl font-bold shadow-sm"
          >
            別の組み合わせを試す
          </button>
        </div>
      ) : (
        recommendations.map((rec, i) => {
          const isAdded = added.has(rec.dish.id)
          const recipe = getSimpleRecipe(rec.dish)
          const isOpen = openRecipeId === rec.dish.id

          return (
            <div
              key={rec.dish.id}
              className="overflow-hidden rounded-3xl bg-white shadow-md border border-orange-100"
              style={{ animation: `fadeIn 0.3s ease ${i * 0.1}s both` }}
            >
              <button
                type="button"
                onClick={() => setOpenRecipeId(isOpen ? null : rec.dish.id)}
                aria-expanded={isOpen}
                aria-controls={`recipe-${rec.dish.id}`}
                aria-label={`${rec.dish.name}の材料と作り方メモを${isOpen ? '閉じる' : '見る'}`}
                className="w-full text-left"
              >
                <div className="relative p-5 pb-4">
                  <div
                    aria-hidden="true"
                    className="absolute right-4 top-4 text-5xl opacity-90"
                  >
                    {getCategoryEmoji(rec.dish.category)}
                  </div>
                  <div className="relative pr-16">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs bg-[#E8F3E3] text-[#4F7D43] px-2 py-1 rounded-full font-bold">
                        {rec.dish.category}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                        {getDifficultyLabel(rec.dish.difficulty)}
                      </span>
                      <span className="text-xs bg-[#F8E7C8] text-[#8B5E22] px-2 py-1 rounded-full font-bold">
                        約{recipe.minutes}分
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                      {rec.dish.name}
                    </h2>
                    <p className="text-sm text-[#FF6B35] font-bold mt-3">
                      {rec.fromDish.name} が作れるなら
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#FFF8F0] px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500">
                        まずはここから
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        材料と作り方メモを見る
                      </p>
                    </div>
                    <span className="rounded-full bg-[#FF6B35] px-3 py-1.5 text-sm font-black text-white">
                      {isOpen ? '閉じる ↑' : '見る ↓'}
                    </span>
                  </div>
                </div>
              </button>

              <div
                id={`recipe-${rec.dish.id}`}
                className={`border-t border-orange-100 bg-[#FFFCF8] ${
                  isOpen ? 'block' : 'hidden'
                }`}
              >
                <div className="px-5 py-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-gray-800 mb-2">
                      目安の材料
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      家にあるもので始めやすい、ざっくり版です
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient) => (
                        <span
                          key={ingredient}
                          className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-800 mb-2">
                      作り方メモ
                    </h3>
                    <ol className="flex flex-col gap-2">
                      {recipe.steps.map((step, stepIndex) => (
                        <li
                          key={step}
                          className="flex gap-3 rounded-2xl bg-white border border-gray-100 px-3 py-3"
                        >
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#6B8F5E] text-xs font-black text-white">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm leading-relaxed text-gray-700">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1">
                <button
                  onClick={() => handleAdd(rec)}
                  disabled={isAdded}
                  className={`
                    w-full py-4 rounded-2xl font-black text-sm transition-all
                    ${
                      isAdded
                        ? 'bg-[#E8F3E3] text-[#4F7D43] cursor-default'
                        : 'bg-[#FF6B35] text-white active:scale-95 shadow-sm'
                    }
                `}
                >
                  {isAdded ? '✓ リストに追加済み' : '今週の候補に入れる'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function subscribeToWishList(onStoreChange: () => void): () => void {
  window.addEventListener(WISH_LIST_CHANGE_EVENT, onStoreChange)
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener(WISH_LIST_CHANGE_EVENT, onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

function getWishListSnapshot(): Set<string> {
  const ids = getWishList().map((w) => w.id)
  const cacheKey = ids.join('\u0000')
  if (cacheKey !== wishListIdsCacheKey) {
    wishListIdsCacheKey = cacheKey
    wishListIdsCache = new Set(ids)
  }
  return wishListIdsCache
}

function getEmptyWishListSnapshot(): Set<string> {
  return EMPTY_WISH_SET
}

let wishListIdsCacheKey = ''
let wishListIdsCache = new Set<string>()
const EMPTY_WISH_SET = new Set<string>()

type SimpleRecipe = {
  ingredients: string[]
  steps: string[]
  minutes: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  揚げ物: '🍗',
  炒め物: '🥘',
  煮物: '🍲',
  煮込み: '🫕',
  焼き物: '🍳',
  麺類: '🍜',
  ご飯物: '🍚',
  丼物: '🍛',
  汁物: '🥣',
  蒸し物: '🥟',
  オーブン: '🫙',
  エスニック: '🌮',
  副菜: '🥗',
  鍋物: '🍲',
  朝食: '🍳',
}

const RECIPE_TEMPLATES: Record<string, Omit<SimpleRecipe, 'ingredients'>> = {
  揚げ物: {
    minutes: 25,
    steps: [
      '肉や魚介に下味をつけ、粉を薄くまとわせます。',
      '中温の油でこんがり揚げ、火の通りを確認します。',
      '油を切って、レモンやたれを添えるとまとまります。',
    ],
  },
  炒め物: {
    minutes: 15,
    steps: [
      '具材を食べやすく切り、調味料は先に混ぜておきます。',
      '強めの火で主役の食材から炒め、野菜やご飯を加えます。',
      '合わせ調味料を回しかけ、香りが立ったら完成です。',
    ],
  },
  煮物: {
    minutes: 30,
    steps: [
      '肉や根菜を同じくらいの大きさに切り、軽く炒めます。',
      'だしと調味料を入れて、落としぶたでじっくり煮ます。',
      '火を止めて少し置き、味を含ませてから盛ります。',
    ],
  },
  煮込み: {
    minutes: 35,
    steps: [
      '玉ねぎなどの香味野菜を炒め、肉や豆を加えます。',
      '水分と調味料を入れて、弱火でとろっとするまで煮ます。',
      '塩気と香りを整え、ごはんやパンと合わせます。',
    ],
  },
  焼き物: {
    minutes: 20,
    steps: [
      '肉や魚に塩こしょうをして、フライパンを温めます。',
      '片面ずつ焼き色をつけ、中まで火を通します。',
      'たれや薬味をのせて、熱いうちに出します。',
    ],
  },
  麺類: {
    minutes: 15,
    steps: [
      '麺をゆでる間に、具材とスープやたれを用意します。',
      '具材を炒めるか温め、麺と合わせます。',
      '薬味をのせて、味を見ながら仕上げます。',
    ],
  },
  ご飯物: {
    minutes: 20,
    steps: [
      '具材を切り、ごはんは温かい状態にしておきます。',
      '具材を炒めるか温めて、ごはんと合わせます。',
      '卵や薬味を足して、まとまりよく盛ります。',
    ],
  },
  丼物: {
    minutes: 15,
    steps: [
      '具材とたれを用意し、ごはんを器によそいます。',
      '具材をたれでさっと煮るか焼いて、味をからめます。',
      'ごはんにのせ、卵や薬味で仕上げます。',
    ],
  },
  汁物: {
    minutes: 15,
    steps: [
      '野菜や豆腐を小さめに切り、だしやスープを温めます。',
      '火の通りにくい具材から入れて煮ます。',
      '味噌や塩で味を整え、香りの具を最後に加えます。',
    ],
  },
  蒸し物: {
    minutes: 25,
    steps: [
      '肉や野菜を包むか器に入れ、蒸し器を温めます。',
      '中火でふっくらするまで蒸します。',
      'たれや薬味を添えて、熱いうちに食べます。',
    ],
  },
  オーブン: {
    minutes: 35,
    steps: [
      '肉や野菜を切り、耐熱皿に並べて下味をつけます。',
      'チーズやソースをのせ、オーブンで焼きます。',
      '焼き色がついたら少し休ませて取り分けます。',
    ],
  },
  エスニック: {
    minutes: 20,
    steps: [
      'にんにくや香味野菜を炒め、香りを出します。',
      '肉や野菜と調味料を加えて、しっかり味をからめます。',
      'ライムやハーブを足して、香りよく仕上げます。',
    ],
  },
  副菜: {
    minutes: 10,
    steps: [
      '野菜や豆腐を食べやすい大きさに切ります。',
      'さっと炒めるか和えて、調味料で味をつけます。',
      '器に盛り、ごまや薬味を散らして完成です。',
    ],
  },
  鍋物: {
    minutes: 20,
    steps: [
      '野菜や肉・魚介を食べやすく切り、鍋に並べます。',
      'だしやスープを張り、蓋をして中火で煮立てます。',
      '火が通ったものからポン酢やたれで食べます。',
    ],
  },
  朝食: {
    minutes: 10,
    steps: [
      '食材を切るかそのまま用意します。',
      'トーストや卵など加熱が必要なものを先に仕上げます。',
      '飲み物と一緒に並べて完成です。',
    ],
  },
}

function getSimpleRecipe(dish: Dish): SimpleRecipe {
  const template = RECIPE_TEMPLATES[dish.category] ?? RECIPE_TEMPLATES.焼き物
  return {
    ...template,
    ingredients: getIngredients(dish),
  }
}

function getIngredients(dish: Dish): string[] {
  const base = getDishSpecificIngredients(dish)
  if (base.length > 0) return base

  const common = ['塩こしょう', '油', 'いつもの調味料']
  const byCategory: Record<string, string[]> = {
    揚げ物: ['肉または魚介', '小麦粉または片栗粉', '卵'],
    炒め物: ['肉または野菜', '玉ねぎ', 'にんにく'],
    煮物: ['肉または根菜', 'だし', 'しょうゆ・みりん'],
    煮込み: ['肉または豆', '玉ねぎ', 'スープまたは水'],
    焼き物: ['肉または魚', '付け合わせ野菜', 'たれ'],
    麺類: ['麺', '肉または野菜', 'ねぎ'],
    ご飯物: ['ごはん', '卵', '肉または野菜'],
    丼物: ['ごはん', '卵', '肉または魚'],
    汁物: ['だしまたはスープ', '野菜', 'ねぎ'],
    蒸し物: ['肉または魚介', '包む皮または器', 'たれ'],
    オーブン: ['肉または野菜', 'チーズ', 'ソース'],
    エスニック: ['肉または野菜', 'にんにく', 'ナンプラーまたはスパイス'],
    副菜: ['野菜または豆腐', 'ごま', 'しょうゆまたは塩', '薬味'],
    鍋物: ['白菜などの野菜', '肉または魚介', 'きのこ', 'だしまたはスープ'],
    朝食: ['卵またはパン', '野菜', '牛乳またはヨーグルト', '果物'],
  }
  return [...(byCategory[dish.category] ?? ['肉または野菜', 'たれ', '薬味']), ...common].slice(0, 6)
}

function getDishSpecificIngredients(dish: Dish): string[] {
  const name = dish.name

  if (name.includes('カレー')) {
    return ['ごはん', '玉ねぎ', '肉または豆', 'カレー粉またはルウ', 'トマトまたは牛乳', '油']
  }
  if (name.includes('チャーハン') || name.includes('炒飯')) {
    return ['ごはん', '卵', 'ねぎ', 'ハムまたは焼豚', 'しょうゆ', '油']
  }
  if (name.includes('オムライス')) {
    return ['ごはん', '卵', '鶏肉またはハム', '玉ねぎ', 'ケチャップ', 'バター']
  }
  if (name.includes('唐揚げ') || name.includes('竜田') || name.includes('油淋鶏')) {
    return ['鶏肉', 'しょうゆ', 'しょうが', '片栗粉', '油', 'レモンまたはねぎ']
  }
  if (name.includes('とんかつ')) {
    return ['豚肉', '卵', '小麦粉', 'パン粉', '油', 'ソース']
  }
  if (name.includes('天ぷら') || name.includes('フライ')) {
    return ['魚介または野菜', '小麦粉', '卵', '冷水', '油', '塩またはつゆ']
  }
  if (name.includes('肉じゃが')) {
    return ['じゃがいも', '玉ねぎ', '肉', 'だし', 'しょうゆ', 'みりん']
  }
  if (name.includes('角煮')) {
    return ['豚バラ肉', 'しょうが', 'ねぎ', 'しょうゆ', '砂糖', '酒']
  }
  if (name.includes('ラーメン') || name.includes('うどん') || name.includes('そば')) {
    return ['麺', 'スープまたはだし', 'ねぎ', '卵', '肉または油揚げ', '好みの具']
  }
  if (name.includes('味噌汁') || name.includes('スープ')) {
    return ['だしまたはスープ', '野菜', '豆腐または卵', 'ねぎ', '味噌または塩', '水']
  }
  if (name.includes('餃子') || name.includes('シュウマイ')) {
    return ['ひき肉', 'キャベツまたは白菜', 'にら', '皮', 'しょうが', 'たれ']
  }
  if (name.includes('グラタン') || name.includes('ドリア')) {
    return ['牛乳', 'チーズ', '玉ねぎ', '肉または魚介', 'マカロニまたはごはん', 'バター']
  }
  if (name.includes('ビビンバ') || name.includes('ガパオ') || name.includes('ナシゴレン')) {
    return ['ごはん', 'ひき肉または卵', '香味野菜', '青菜', '辛み調味料', '油']
  }

  return []
}

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🍽️'
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 1) return 'かんたん'
  if (difficulty === 2) return 'ふつう'
  return 'ちょい挑戦'
}
