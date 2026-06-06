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
  { id: 'recommend', label: '今日のおすすめ', icon: '✦' },
  { id: 'ingredients', label: '食材から', icon: '🥬' },
  { id: 'repertoire', label: 'レパートリー', icon: '📋' },
]

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
        <div className="mx-auto max-w-md px-4 py-4">
          <h1 className="text-lg font-bold text-zinc-900">となりごはん</h1>
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
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
            食材から探す機能は準備中です
          </div>
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
