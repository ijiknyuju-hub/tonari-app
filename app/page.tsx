'use client'

import { useEffect, useState } from 'react'
import DishCard from '@/components/DishCard'
import HomeTabs from '@/components/HomeTabs'
import OnboardingPresets from '@/components/OnboardingPresets'
import { loadState, saveState } from '@/lib/storage'
import type { AppState, Dish } from '@/lib/types'

const initialState: AppState = {
  dishes: [],
  lastUpdated: '',
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>(initialState)
  const [activeTab, setActiveTab] = useState<'recommend' | 'ingredients' | 'repertoire'>('recommend')
  const [openDishId, setOpenDishId] = useState<string | null>(null)
  const [isOnboarding, setIsOnboarding] = useState(false)

  useEffect(() => {
    const loadedState = loadState()
    const cookedDishes = loadedState.dishes.filter((dish) => dish.status === 'cooked')

    setAppState(loadedState)
    setIsOnboarding(loadedState.dishes.length === 0 || cookedDishes.length === 0)
  }, [])

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
