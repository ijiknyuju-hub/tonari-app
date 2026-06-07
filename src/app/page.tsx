'use client'

import { useState } from 'react'
import DishSelector from '@/components/DishSelector'
import RecommendCards from '@/components/RecommendCards'
import VariationCards from '@/components/VariationCards'
import WishList from '@/components/WishList'
import {
  Dish,
  Recommendation,
  VariationResult,
  getRecommendations,
  getVariations,
} from '@/lib/recommend'
import { getCookedIds } from '@/lib/storage'

type Screen = 'select' | 'recommend'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('select')
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [variations, setVariations] = useState<VariationResult[]>([])
  const [activeTab, setActiveTab] = useState<'result' | 'tweaks' | 'wishlist'>('result')

  function handleConfirmSelection(dishes: Dish[]) {
    setSelectedDishes(dishes)
    const selectedIds = dishes.map((d) => d.id)
    const cookedIds = getCookedIds()
    const recs = getRecommendations(
      selectedIds,
      cookedIds
    )
    const vars = getVariations(selectedIds)
    setRecommendations(recs)
    setVariations(vars)
    setScreen('recommend')
    setActiveTab('result')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleBack() {
    setScreen('select')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const resultTabId = 'tab-result'
  const tweaksTabId = 'tab-tweaks'
  const wishListTabId = 'tab-wishlist'
  const resultPanelId = 'panel-result'
  const tweaksPanelId = 'panel-tweaks'
  const wishListPanelId = 'panel-wishlist'

  if (screen === 'select') {
    return (
      <DishSelector
        onConfirm={handleConfirmSelection}
        // U3: Restore previous selection when going back
        initialSelectedIds={selectedDishes.map((d) => d.id)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8F0]">
      {/* U2: Unified header with tabs and back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={handleBack}
            aria-label="料理選択に戻る"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-lg font-black text-gray-500 hover:bg-orange-50 hover:text-[#FF6B35] transition-colors"
          >
            ←
          </button>
          <div
            className="grid min-w-0 flex-1 grid-cols-3 rounded-2xl bg-[#FFF3E8] p-1"
            role="tablist"
            aria-label="おすすめ、ちょい変え、今週作るリスト"
          >
            <button
              id={resultTabId}
              role="tab"
              aria-selected={activeTab === 'result'}
              aria-controls={resultPanelId}
              onClick={() => setActiveTab('result')}
              className={`min-h-11 rounded-xl px-2 text-sm font-bold transition-colors ${
                activeTab === 'result'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              おすすめ
            </button>
            <button
              id={tweaksTabId}
              role="tab"
              aria-selected={activeTab === 'tweaks'}
              aria-controls={tweaksPanelId}
              onClick={() => setActiveTab('tweaks')}
              className={`min-h-11 rounded-xl px-2 text-sm font-bold transition-colors ${
                activeTab === 'tweaks'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              ちょい変え
            </button>
            <button
              id={wishListTabId}
              role="tab"
              aria-selected={activeTab === 'wishlist'}
              aria-controls={wishListPanelId}
              onClick={() => setActiveTab('wishlist')}
              className={`min-h-11 rounded-xl px-2 text-sm font-bold transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              作るリスト
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'result' && (
          <div
            id={resultPanelId}
            role="tabpanel"
            aria-labelledby={resultTabId}
          >
            <RecommendCards
              selected={selectedDishes}
              recommendations={recommendations}
              onBack={handleBack}
            />
          </div>
        )}
        {activeTab === 'tweaks' && (
          <div
            id={tweaksPanelId}
            role="tabpanel"
            aria-labelledby={tweaksTabId}
          >
            <VariationCards
              selected={selectedDishes}
              variations={variations}
            />
          </div>
        )}
        {activeTab === 'wishlist' && (
          <div
            id={wishListPanelId}
            role="tabpanel"
            aria-labelledby={wishListTabId}
          >
            <WishList />
          </div>
        )}
      </div>
    </div>
  )
}
