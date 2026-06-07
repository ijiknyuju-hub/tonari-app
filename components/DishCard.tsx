import { useMemo, useState, type ReactNode } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish } from '@/lib/types'

type DishCardProps = {
  dish: Dish
  allDishes: Dish[]
  onClose: () => void
  onUpdate: (dish: Dish) => void
  onOpenDish: (id: string) => void
}

export default function DishCard({ dish, allDishes, onClose, onUpdate, onOpenDish }: DishCardProps) {
  const [note, setNote] = useState(dish.note ?? '')
  const parentDish = dish.fromDishId ? allDishes.find((item) => item.id === dish.fromDishId) : undefined
  const ingredients = useMemo(() => splitLines(dish.ingredients), [dish.ingredients])
  const steps = useMemo(() => splitLines(dish.steps), [dish.steps])
  const notes = useMemo(() => splitLines(note || dish.note), [dish.note, note])

  function handleCooked() {
    onUpdate({ ...dish, note, status: 'cooked', cookedAt: new Date().toISOString() })
  }

  return (
    <>
      <button type="button" aria-label="閉じる" className="fixed inset-0 z-[49] bg-black/40" onClick={onClose} />
      <aside className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-screen max-w-md overflow-y-auto bg-[#FFFDF8] text-[#171412] shadow-2xl">
        <div className="relative h-[280px]" style={{ backgroundColor: getCategoryColor(dish.category) }}>
          <Photo dish={dish} className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[48px] font-light leading-none text-[#F24812] shadow-sm"
          >
            ‹
          </button>
        </div>

        <div className="space-y-6 px-6 pb-6 pt-7">
          <header>
            <div className="flex items-start justify-between gap-5">
              <h2 className="text-[36px] font-black leading-tight tracking-wide">{dish.name}</h2>
              <p className="shrink-0 pt-2 text-[34px] tracking-widest text-[#F24812]">
                {'★'.repeat(dish.effort)}
              </p>
            </div>
            {parentDish ? (
              <button
                type="button"
                onClick={() => onOpenDish(parentDish.id)}
                className="mt-6 text-[20px] font-black text-[#F24812]"
              >
                ← {parentDish.name}から広げた料理
              </button>
            ) : null}
          </header>

          {dish.changePoint ? (
            <Callout tone="orange">変えるところ: {dish.changePoint}</Callout>
          ) : null}
          {dish.newIngredients ? (
            <Callout>新しく必要なもの: {dish.newIngredients}</Callout>
          ) : null}

          <Divider />

          {ingredients.length > 0 ? (
            <Section icon="♨" title="材料（2〜3人分）">
              <ul className="space-y-3 text-[20px] font-medium leading-8">
                {ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`} className="flex items-baseline justify-between gap-4">
                    <span>・ {ingredientName(ingredient)}</span>
                    {ingredientAmount(ingredient) ? (
                      <span className="shrink-0 tracking-widest text-[#5F5953]">{ingredientAmount(ingredient)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {steps.length > 0 ? (
            <>
              <Divider />
              <Section icon="▢" title="作り方">
                <ol className="space-y-5">
                  {steps.map((step, index) => (
                    <li key={`${step}-${index}`} className="flex gap-4 text-[20px] font-medium leading-8">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F24812] text-[13px] font-black text-white">
                        {index + 1}
                      </span>
                      <span>{step.replace(/^\d+[.)、\s-]*/, '')}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            </>
          ) : null}

          <Divider />

          <Section icon="▤" title="メモ">
            {notes.length > 0 ? (
              <ul className="space-y-2 text-[18px] font-medium leading-7">
                {notes.map((item, index) => (
                  <li key={`${item}-${index}`}>・ {item.replace(/^[-・\s]*/, '')}</li>
                ))}
              </ul>
            ) : (
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="メモを追加"
                className="min-h-24 w-full rounded-[14px] border border-[#DED8D0] bg-white p-3 text-[16px] outline-none focus:border-[#F24812]"
              />
            )}
          </Section>

          {dish.status === 'want' ? (
            <button
              type="button"
              onClick={handleCooked}
              className="w-full rounded-[14px] bg-[#F24812] px-4 py-5 text-[22px] font-black text-white shadow-[0_4px_12px_rgba(242,72,18,0.25)]"
            >
              作った！ レパートリーに追加
            </button>
          ) : null}
        </div>
      </aside>
    </>
  )
}

function splitLines(value: string | undefined) {
  return value?.split(/\r?\n|、/).map((item) => item.trim()).filter(Boolean) ?? []
}

function ingredientName(value: string) {
  return value.split(/\s{2,}|[:：]/)[0] ?? value
}

function ingredientAmount(value: string) {
  const parts = value.split(/\s{2,}|[:：]/)
  return parts[1] ?? ''
}

function Callout({ children, tone = 'cream' }: { children: ReactNode; tone?: 'orange' | 'cream' }) {
  return (
    <div
      className={`rounded-[14px] px-5 py-4 text-[20px] font-black leading-8 ${
        tone === 'orange' ? 'bg-[#FFB169]' : 'bg-[#F6F1E8]'
      }`}
    >
      {children}
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-5 flex items-center gap-4 text-[25px] font-black">
        <span className="text-[32px] font-normal text-[#F24812]">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Divider() {
  return <hr className="border-[#DDD3C8]" />
}

function Photo({ dish, className }: { dish: Dish; className: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className={className} style={{ backgroundColor: getCategoryColor(dish.category) }} />
  }

  return <img src={getDishPhotoUrl(dish)} alt="" onError={() => setHasError(true)} className={className} />
}
