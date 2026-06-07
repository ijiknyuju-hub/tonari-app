'use client'

import { useState } from 'react'
import DishCard from '@/components/DishCard'
import HomeTabs from '@/components/HomeTabs'
import OnboardingPresets from '@/components/OnboardingPresets'
import { loadState, saveState } from '@/lib/storage'
import type { AppState, Dish } from '@/lib/types'

export default function Home() {
  const [appState, setAppState] = useState<AppState>(() => loadState())
  const [activeTab, setActiveTab] = useState<'recommend' | 'ingredients' | 'repertoire'>('recommend')
  const [openDishId, setOpenDishId] = useState<string | null>(null)
  const [isOnboarding, setIsOnboarding] = useState(() => shouldShowOnboarding(loadState()))

  function handleOnboardingComplete(selectedDishes: Dish[]) {
    const cookedAt = new Date().toISOString()
    const nextState: AppState = {
      dishes: selectedDishes.map((dish) => ({
        ...dish,
        status: 'cooked' as const,
        cookedAt,
      })),
      lastUpdated: cookedAt,
    }

    setAppState(nextState)
    saveState(nextState)
    setIsOnboarding(false)
  }

  function handleStateChange(next: AppState) {
    setAppState(next)
    saveState(next)
  }

  function handleDishUpdate(updated: Dish) {
    const nextState: AppState = {
      dishes: appState.dishes.map((dish) => (dish.id === updated.id ? updated : dish)),
      lastUpdated: new Date().toISOString(),
    }

    handleStateChange(nextState)
  }

  const openDish = openDishId ? appState.dishes.find((dish) => dish.id === openDishId) : undefined

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-zinc-900">
      {isOnboarding ? (
        <OnboardingPresets onComplete={handleOnboardingComplete} />
      ) : (
        <HomeTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          appState={appState}
          onOpenDish={setOpenDishId}
          onStateChange={handleStateChange}
        />
      )}
      {openDish ? (
        <DishCard
          dish={openDish}
          allDishes={appState.dishes}
          onClose={() => setOpenDishId(null)}
          onUpdate={handleDishUpdate}
          onOpenDish={setOpenDishId}
        />
      ) : null}
    </div>
  )
}

function shouldShowOnboarding(state: AppState): boolean {
  return state.dishes.length === 0 || state.dishes.every((dish) => dish.status !== 'cooked')
}
