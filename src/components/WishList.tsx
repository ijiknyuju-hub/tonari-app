'use client'

import {
  WISH_LIST_CHANGE_EVENT,
  WishItem,
  clearCookedIds,
  getWishList,
  removeWishItem,
  toggleWishItem,
} from '@/lib/storage'
import { useSyncExternalStore } from 'react'

export default function WishList() {
  const list = useSyncExternalStore(
    subscribeToWishList,
    getWishListSnapshot,
    getEmptyWishListSnapshot
  )

  function handleToggle(id: string) {
    toggleWishItem(id)
    notifyWishListChange()
  }

  function handleRemove(id: string) {
    removeWishItem(id)
    notifyWishListChange()
  }

  function handleClearCookedIds() {
    clearCookedIds()
    notifyWishListChange()
  }

  const pending = list.filter((i) => !i.done)
  const done = list.filter((i) => i.done)
  const completionRate =
    list.length === 0 ? 0 : Math.round((done.length / list.length) * 100)

  if (list.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm border border-orange-100">
          <p className="text-6xl mb-5" aria-hidden="true">🍽️</p>
          <p className="text-lg font-black text-gray-800">今週の候補はまだ空です</p>
          <p className="text-sm leading-relaxed text-gray-500 mt-2">
            おすすめから気になる料理を入れておくと、買い物前に迷いにくくなります
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <section className="mb-5 rounded-3xl bg-white border border-orange-100 shadow-sm px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#6B8F5E]">今週のごはん予定</p>
            <h2 className="mt-1 text-2xl font-black text-gray-900">
              {pending.length > 0 ? `あと${pending.length}品` : '今週分できました'}
            </h2>
          </div>
          <div className="rounded-2xl bg-[#FFF3E8] px-3 py-2 text-right">
            <p className="text-xs font-bold text-gray-500">達成</p>
            <p className="text-lg font-black text-[#FF6B35]">{completionRate}%</p>
          </div>
        </div>
        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100"
          role="progressbar"
          aria-label="今週作るリストの達成率"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
        >
          <div
            className="h-full rounded-full bg-[#6B8F5E] transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          作ったら丸をタップ。完了にすると次回おすすめから外れます。
        </p>
      </section>

      {pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-black text-gray-700 mb-3">
            作る予定 ({pending.length}品)
          </h3>
          <div className="flex flex-col gap-3">
            {pending.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl px-4 py-3 flex items-center gap-3 shadow-sm border border-orange-100"
              >
                <button
                  onClick={() => handleToggle(item.id)}
                  aria-label={`${item.name}を作った`}
                  className="w-12 h-12 rounded-full border-2 border-[#FF6B35] bg-[#FFF8F0] flex-shrink-0 flex items-center justify-center text-xs font-black text-[#FF6B35]"
                >
                  {index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-gray-900 font-black">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {formatAddedAt(item.addedAt)}に追加
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label={`${item.name}を削除`}
                  className="w-11 h-11 rounded-full text-gray-500 text-lg leading-none flex-shrink-0 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-gray-500 mb-3">
            作った料理 ({done.length}品)
          </h3>
          <div className="flex flex-col gap-2">
            {done.map((item) => (
              <div
                key={item.id}
                className="bg-[#F7FAF4] rounded-3xl px-4 py-3 flex items-center gap-3 border border-[#DCEBD5]"
              >
                <button
                  onClick={() => handleToggle(item.id)}
                  aria-label={`${item.name}を未完了に戻す`}
                  className="w-12 h-12 rounded-full bg-[#6B8F5E] flex-shrink-0 flex items-center justify-center text-white text-sm font-black"
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-gray-500 line-through font-bold">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#6B8F5E]">
                    おつかれさま。次回おすすめから外します
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label={`${item.name}を削除`}
                  className="w-11 h-11 rounded-full text-gray-500 text-lg leading-none flex-shrink-0 hover:bg-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleClearCookedIds}
            className="mt-4 text-xs text-gray-400 underline underline-offset-2"
          >
            おすすめ履歴をリセット
          </button>
        </div>
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

function notifyWishListChange(): void {
  window.dispatchEvent(new Event(WISH_LIST_CHANGE_EVENT))
}

function getWishListSnapshot(): WishItem[] {
  const list = getWishList()
  const cacheKey = JSON.stringify(list)
  if (cacheKey !== wishListCacheKey) {
    wishListCacheKey = cacheKey
    wishListCache = list
  }
  return wishListCache
}

function getEmptyWishListSnapshot(): WishItem[] {
  return EMPTY_WISH_LIST
}

let wishListCacheKey = ''
let wishListCache: WishItem[] = []
const EMPTY_WISH_LIST: WishItem[] = []

function formatAddedAt(addedAt: number): string {
  const date = new Date(addedAt)
  if (Number.isNaN(date.getTime())) return '最近'
  const now = new Date()
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return '今日'
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}
