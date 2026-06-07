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
  { id: 'recommend', label: '今日のおすすめ', icon: '⌂' },
  { id: 'ingredients', label: '食材から', icon: '⌕' },
  { id: 'repertoire', label: 'レパートリー', icon: '☷' },
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
        <div className="relative mx-auto flex max-w-md items-center justify-center px-4 py-5 sm:max-w-lg">
          <h1 className="text-[22px] font-black tracking-wide text-[#F24812]">となりごはん</h1>
          <button
            type="button"
            aria-label="通知"
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0DC] text-lg text-[#3D3833]"
          >
            <BellIcon />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pb-24 pt-5 sm:max-w-lg">
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white pb-1">
        <div className="mx-auto grid max-w-md grid-cols-3 sm:max-w-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1 border-t-4 px-2 text-[12px] font-bold ${
                  isActive ? 'border-[#F24812] text-[#F24812]' : 'border-transparent text-[#5F5953]'
                }`}
              >
                <span className="text-[26px] leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}
