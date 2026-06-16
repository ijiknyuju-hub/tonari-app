'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WelcomeScreen from '@/components/mvp/WelcomeScreen'
import BaseDishSelector from '@/components/mvp/BaseDishSelector'
import { useIsClient } from '@/lib/mvp/useIsClient'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'

export default function OnboardingPage() {
  const router = useRouter()
  const { selectedBaseDishIds, setSelectedBaseDishIds } = useSelectedBaseDishes()
  const [step, setStep] = useState(0)
  const isClient = useIsClient()

  // If already onboarded, skip to home
  useEffect(() => {
    if (isClient && selectedBaseDishIds.length > 0) {
      router.replace('/home')
    }
  }, [isClient, selectedBaseDishIds, router])

  function handleComplete(ids: string[]) {
    setSelectedBaseDishIds(ids)
    router.push('/home')
  }

  // Avoid flash before hydration or during redirect
  if (!isClient || selectedBaseDishIds.length > 0) {
    return <div className="tn-screen" />
  }

  if (step === 0) {
    return <WelcomeScreen onStart={() => setStep(1)} />
  }

  return <BaseDishSelector onComplete={handleComplete} />
}
