import IngredientsScreen from '@/components/IngredientsScreen'
import RecommendScreen from '@/components/RecommendScreen'
import RepertoireList from '@/components/RepertoireList'
import type { AppState } from '@/lib/types'

export type HomeTab = 'recommend' | 'ingredients' | 'repertoire'

type HomeTabsProps = {
  activeTab: HomeTab
  onTabChange: (tab: HomeTab) => void
  appState: AppState
  onOpenDish: (id: string) => void
  onStateChange: (next: AppState) => void
}

const tabs: { id: HomeTab; label: string; icon: string }[] = [
  { id: 'recommend', label: 'ホーム', icon: '🏠' },
  { id: 'ingredients', label: '食材から', icon: '🔍' },
  { id: 'repertoire', label: 'レパートリー', icon: '📋' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'おはようございます'
  if (hour < 17) return 'こんにちは'
  return 'こんばんは'
}

export default function HomeTabs({
  activeTab,
  onTabChange,
  appState,
  onOpenDish,
  onStateChange,
}: HomeTabsProps) {
  return (
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">となりごはん</h1>
            <p className="mt-1 text-sm text-zinc-500">{getGreeting()}</p>
          </div>
          <button
            type="button"
            aria-label="通知"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0DC] text-lg"
          >
            🔔
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pb-20 pt-4">
        {activeTab === 'recommend' ? (
          <RecommendScreen
            dishes={appState.dishes}
            onOpenDish={onOpenDish}
            onStateChange={onStateChange}
            appState={appState}
          />
        ) : null}
        {activeTab === 'ingredients' ? (
          <IngredientsScreen dishes={appState.dishes} onOpenDish={onOpenDish} />
        ) : null}
        {activeTab === 'repertoire' ? (
          <RepertoireList dishes={appState.dishes} onOpenDish={onOpenDish} />
        ) : null}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-2 py-3 text-xs ${
                  isActive ? 'font-semibold text-[#E8611A]' : 'text-zinc-400'
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
