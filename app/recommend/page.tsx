import Link from 'next/link'
import { baseDishes } from '@/data/baseDishes'

type RecommendPageProps = {
  searchParams: Promise<{
    base?: string
  }>
}

export default async function RecommendPage({ searchParams }: RecommendPageProps) {
  const params = await searchParams
  const selectedIds = params.base?.split(',').filter(Boolean) ?? []
  const selectedDishes = baseDishes.filter((dish) => selectedIds.includes(dish.id))

  return (
    <main className="min-h-screen bg-[#F7F8F5] text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-6">
        <Link href="/select" className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-[#E8611A]">
          選び直す
        </Link>

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#E8611A]">次の実装ステップ</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">
              近い料理カードを準備中です
            </h1>
            <p className="text-base leading-7 text-zinc-700">
              選んだ料理IDは次のおすすめロジックへ渡せる状態です。
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-zinc-950">選択内容</h2>
            {selectedDishes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDishes.map((dish) => (
                  <span key={dish.id} className="rounded-full bg-[#E8611A]/10 px-3 py-2 text-sm font-bold text-[#B9470F]">
                    {dish.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">選択された料理はありません。</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
