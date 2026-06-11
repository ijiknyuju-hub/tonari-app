import StartSelectDishesLink from '@/components/phase0/StartSelectDishesLink'
import { dishCards } from '@/data/dishCards'

const sampleCards = dishCards.slice(0, 3)

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8F5] text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <p className="text-sm font-bold tracking-normal text-[#E8611A]">となりごはん</p>
          <p className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-600 shadow-sm">
            試作版です
          </p>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8 py-8">
          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-tight tracking-normal text-zinc-950">
              いつもの料理から、
              <br />
              次の一品へ。
            </h1>
            <p className="text-base leading-8 text-zinc-700">
              作れる料理を選ぶだけ。
              <br />
              少し変えれば作れそうな料理を、となりごはんが提案します。
            </p>
          </div>

          <StartSelectDishesLink />
        </div>

        <div id="sample-cards" className="space-y-3 scroll-mt-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-black text-zinc-950">近い料理カードの例</h2>
            <p className="text-xs font-bold text-zinc-500">2〜3枚だけプレビュー</p>
          </div>

          <div className="grid gap-3">
            {sampleCards.map((card) => (
              <article key={card.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-zinc-950">{card.title}</h3>
                    <p className="mt-1 text-sm font-bold text-[#E8611A]">{card.shortCopy}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                    {card.timeMinutes}分
                  </span>
                </div>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
                  {card.reusableSkills.slice(0, 2).map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8611A]" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
