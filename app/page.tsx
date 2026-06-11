import StartSelectDishesLink from '@/components/phase0/StartSelectDishesLink'
import Phase0BottomNav from '@/components/phase0/Phase0BottomNav'
import { dishCards } from '@/data/dishCards'

const sampleCards = dishCards.slice(0, 3)

export default function Home() {
  return (
    <main className="phase0-screen">
      <section className="phase0-container phase0-bottom-safe">
        <div className="flex min-h-[100svh] flex-col pb-8 pt-5">
          <header className="flex items-center justify-between">
            <p className="text-sm font-bold tracking-normal text-[#E8611A]">となりごはん</p>
            <p className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs font-bold text-zinc-600 shadow-sm">
              試作版です
            </p>
          </header>

          <div className="flex flex-1 flex-col justify-center gap-6 py-6">
            <div className="space-y-4">
              <p className="w-fit rounded-full bg-[#E8611A]/10 px-3 py-1 text-xs font-black text-[#B9470F]">
                作れる料理から広げるアプリ
              </p>
              <h1 className="text-[2.4rem] font-black leading-[1.08] tracking-normal text-zinc-950">
                いつもの料理から、
                <br />
                次の一品へ。
              </h1>
              <p className="text-[1.02rem] font-bold leading-7 text-zinc-700">
                作れる料理を選ぶだけ。
                <br />
                少し変えれば作れそうな料理を、となりごはんが提案します。
              </p>
            </div>

            <StartSelectDishesLink />
          </div>
        </div>

        <div id="sample-cards" className="space-y-3 scroll-mt-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-black text-zinc-950">近い料理カードの例</h2>
            <p className="text-xs font-bold text-zinc-500">2〜3枚だけプレビュー</p>
          </div>

          <div className="grid gap-3">
            {sampleCards.map((card) => (
              <article key={card.id} className="phase0-card rounded-2xl p-4">
                <div className="rounded-2xl bg-[#FFF3EC] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-black leading-6 text-[#B9470F]">{card.shortCopy}</p>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#B9470F]">
                      {card.timeMinutes}分
                    </span>
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-black text-zinc-950">{card.title}</h3>

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
      <Phase0BottomNav />
    </main>
  )
}
